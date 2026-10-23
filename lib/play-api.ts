import { socialRouter } from "./social-api";
import { adventureRouter } from "./adventure-api";
import type { Database, User } from './api';
import { quizBank,quizModes,difficulties,hash,dayKey,weekKey,missions,achievements } from './game-content';
import { GameError,requireGame,one,newRun,runById,changeRun,award,notify,type PlayContext } from './play-core';
import { ValidationError } from './power';
// Server-owned state transitions share a single durable progression ledger.
export async function settle(c:PlayContext) {
 const rows=await c.db.all('SELECT * FROM game_runs WHERE user=? AND complete=1 ORDER BY updated DESC LIMIT 80',[c.uid]);
 for(const row of rows) { const s=JSON.parse(row.state);
  if(row.kind==='quiz') await award({...c,now:row.updated},'quiz',`quiz:${s.day}:${s.mode}`,20+Math.floor(row.score/20),row.score);
  if(row.kind==='combat'&&s.winner==='hero'&&!s.match) await award({...c,now:row.updated},'combat',`combat:${dayKey(row.updated)}:${s.hero}`,30,row.score);
  if(row.kind==='story') await award({...c,now:row.updated},'story',`story:${s.chapter}`,40,0);
 }
 const xp=Number((await one(c,'SELECT COALESCE(SUM(xp),0) xp FROM game_events WHERE user=?',[c.uid])).xp);
 for(const a of achievements.filter(x=>xp>=x.xp)) await notify(c,c.uid,'achievement',`achievement:${a.id}`,`Achievement unlocked: ${a.name}`,'/collection');
 return xp;
}
export function quizView(r:any) {
 const s=r.data,q=quizBank.find(q=>q.id===s.ids[s.index]);
 return {id:r.id,kind:r.kind,version:r.version,complete:!!r.complete,score:r.score,mode:s.mode,difficulty:s.difficulty,index:s.index,total:s.ids.length,deadline:s.deadline,feedback:s.feedback||null,question:r.complete?null:{clue:q!.clue,choices:q!.choices,hint:s.hinted?q!.hint:null},day:s.day};
}
export async function progress(c:PlayContext) {
 const xp=await settle(c),events=await c.db.all('SELECT kind,source,xp,score,created FROM game_events WHERE user=? ORDER BY created DESC LIMIT 300',[c.uid]);
 const quests=missions(c.now).map(m=>({...m,progress:Math.min(m.goal,events.filter(e=>e.created>=m.since&&(m.kind==='any'?['quiz','combat','story','explore','poll'].includes(e.kind):e.kind===m.kind)).length),claimed:events.some(e=>e.source===`quest:${m.period}:${m.key}`)}));
 const player=await one(c,'SELECT public_id,settings FROM game_players WHERE user=?',[c.uid]);
 return {guest:c.guest,day:dayKey(c.now),week:weekKey(c.now),resetsAt:new Date(Date.parse(dayKey(c.now)+'T00:00:00Z')+86400000).toISOString(),xp,level:1+Math.floor(xp/100),achievements:achievements.map(a=>({...a,unlocked:xp>=a.xp})),quests,history:events.slice(0,60),settings:JSON.parse(player.settings),publicId:player.public_id};
}
async function router(c:PlayContext,url:URL):Promise<any> {
 const {p,body,method}=c;
 const social=await socialRouter(c);if(social!==undefined){return social;}
 const adventure=await adventureRouter(c);if(adventure!==undefined){await settle(c);return adventure;}
 if(p[0]==='progress'&&method==='GET') return progress(c);
 if(p[0]==='history'&&method==='GET') return {runs:await c.db.all('SELECT id,kind,score,complete,created,updated FROM game_runs WHERE user=? ORDER BY updated DESC LIMIT 60',[c.uid])};
 if(p[0]==='quests'&&method==='POST') {
  const d=await progress(c),quest=d.quests.find(q=>q.key===body.key);
  requireGame(quest&&quest.progress>=quest.goal,400,'Complete this mission before claiming its reward.');
  await award(c,'quest',`quest:${quest!.period}:${quest!.key}`,quest!.xp);
  await notify(c,c.uid,'quest',`quest:${quest!.period}:${quest!.key}`,`Quest complete: ${quest!.name}`,'/quests');return progress(c);
 }
 if(p[0]==='quiz') {
  if(p[1]==='start'&&method==='POST') {
   requireGame(quizModes.includes(body.mode)&&difficulties.includes(body.difficulty),400,'Choose a quiz mode and difficulty.');
   const mode=body.mode,day=dayKey(c.now),ids=quizBank.filter(q=>q.mode===mode).sort((a,b)=>hash(day+a.id)-hash(day+b.id)).slice(0,5).map(q=>q.id),seconds=body.difficulty==='easy'?70:body.difficulty==='hard'?25:45;
   // Reuse an unfinished run rather than creating unlimited state through repeated clicks.
   const existing=await one(c,"SELECT * FROM game_runs WHERE user=? AND kind='quiz' AND complete=0 ORDER BY created DESC LIMIT 1",[c.uid]);
   if(existing&&c.now-existing.created<3600000&&JSON.parse(existing.state).mode===mode&&JSON.parse(existing.state).day===day) return quizView({...existing,data:JSON.parse(existing.state)});
   return quizView(await newRun(c,'quiz',{mode,day,difficulty:body.difficulty,ids,index:0,seconds,deadline:c.now+seconds*1000,hinted:false}));
  }
  const r=await runById(c,p[1],'quiz');
  if(method==='GET')return quizView(r);
  requireGame(!r.complete,409,'This quiz is already complete.');
  requireGame(r.data.day===dayKey(c.now),409,'A new UTC day has begun. Start today’s quiz.');
  const s={...r.data},q=quizBank.find(q=>q.id===s.ids[s.index])!;
  if(p[2]==='hint'&&method==='POST') {s.hinted=true;return quizView(await changeRun(c,r,s,false,r.score));}
  requireGame(p[2]==='answer'&&method==='POST',404,'Quiz action not found.');
  requireGame(body.version===r.version,409,'This question has already changed. Reload the quiz.');
  requireGame(Number.isInteger(body.answer)&&body.answer>=-1&&body.answer<q.choices.length,400,'Choose an answer.');
  const expired=c.now>s.deadline,correct=!expired&&body.answer===q.answer;
  const score=r.score+(correct?(s.hinted?60:100):0);
  s.feedback={correct,expired,answer:q.choices[q.answer],explanation:q.why};s.index++;s.hinted=false;s.deadline=c.now+s.seconds*1000;
  const out=await changeRun(c,r,s,s.index===s.ids.length,score);
  if(out.complete)await settle(c);return quizView(out);
 }
 if(p[0]==='leaderboards'&&method==='GET') {
  const period=url.searchParams.get('period')||'week',kind=url.searchParams.get('kind')||'xp';
  requireGame(['day','week','all'].includes(period)&&['xp','quiz','combat','clan'].includes(kind),400,'Choose a valid ranking.');
  const since=period==='all'?0:Date.parse((period==='day'?dayKey(c.now):weekKey(c.now))+'T00:00:00Z');
  if(kind==='clan')return {rows:await c.db.all("SELECT c.id,c.name,COALESCE(SUM(e.xp),0) score FROM clans c JOIN clan_members m ON m.clan=c.id LEFT JOIN game_events e ON e.user=m.user AND e.created>=? AND e.created>=m.joined WHERE c.archived=0 GROUP BY c.id,c.name HAVING COALESCE(SUM(e.xp),0)>0 ORDER BY score DESC,c.name LIMIT 50",[since])};
  const condition=kind==='xp'?'':` AND e.kind='${kind}'`,metric=kind==='xp'?'xp':'score';
  return {rows:await c.db.all(`SELECT g.public_id id,COALESCE(p.name,'Explorer') name,SUM(e.${metric}) score FROM game_events e JOIN game_players g ON g.user=e.user LEFT JOIN profiles p ON p.id=e.user WHERE e.created>=? AND e.user NOT LIKE 'guest:%' AND g.settings NOT LIKE '%"private":true%'${condition} GROUP BY g.public_id,p.name HAVING SUM(e.${metric})>0 ORDER BY score DESC,g.public_id LIMIT 50`,[since])};
 }
 if(p[0]==='players'&&method==='GET') {
  const player=await one(c,"SELECT g.user,g.public_id,g.settings,COALESCE(p.name,'Explorer') name FROM game_players g LEFT JOIN profiles p ON p.id=g.user WHERE g.public_id=? AND g.user NOT LIKE 'guest:%'",[p[1]]);
  requireGame(player&&!JSON.parse(player.settings).private,404,'Public profile not found.');
  const xp=Number((await one(c,'SELECT COALESCE(SUM(xp),0) xp FROM game_events WHERE user=?',[player.user])).xp);
  return {name:player.name,xp,level:1+Math.floor(xp/100),achievements:achievements.filter(a=>xp>=a.xp)};
 }
 throw new GameError(404,'Game endpoint not found.');
}
export async function handlePlay(req:Request,ctx:{db:Database;user:User|null;admins?:string[];log?:(e:unknown)=>void},parts:string[]) {
 let cookie='',uid=ctx.user?.id||'',body:any={};
 try {
  const url=new URL(req.url),now=Date.now();
  if(!uid) {
   let token=req.headers.get('cookie')?.match(/(?:^|; )av_guest=([a-f0-9-]{72})/)?.[1];
   if(!token){token=crypto.randomUUID()+crypto.randomUUID();cookie=`av_guest=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${url.protocol==='https:'?'; Secure':''}`;}
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
   uid='guest:'+Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  const c:PlayContext={...ctx,uid,guest:!ctx.user,admins:ctx.admins||[],now,body,method:req.method,p:parts};
  if(!['GET','POST','PUT','DELETE'].includes(req.method))throw new GameError(405,'Method not allowed.');
  if(req.method!=='GET') {
   requireGame(req.headers.get('origin')===url.origin,403,'Request origin is not allowed.');
   requireGame(req.headers.get('content-type')?.startsWith('application/json'),415,'Send JSON.');
   const reader=req.body?.getReader();let raw='';let bytes=0;const decoder=new TextDecoder();
   if(reader)while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>8192){await reader.cancel();throw new GameError(413,'Request too large.');}raw+=decoder.decode(value,{stream:true});}
   try{body=JSON.parse(raw);requireGame(body&&typeof body==='object'&&!Array.isArray(body),400,'Invalid JSON.');}catch{throw new GameError(400,'Invalid JSON.');}
   c.body=body;
  }
  const bucket=Math.floor(now/60000),key=`play:${ctx.user?.id||req.headers.get('cf-connecting-ip')||uid}`;
  const rate=await one(c,'INSERT INTO limits(key,bucket,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN limits.bucket=excluded.bucket THEN limits.count+1 ELSE 1 END,bucket=excluded.bucket RETURNING count',[key,bucket]);
  requireGame(rate.count<=120,429,'Take a moment and try again.');
  await c.db.run("INSERT INTO game_players(user,public_id,settings,created) VALUES(?,?,'{}',?) ON CONFLICT(user) DO NOTHING",[uid,crypto.randomUUID(),now]);
  const out=await router(c,url);
  return Response.json(out,{headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
 }catch(e){const status=e instanceof GameError?e.status:e instanceof ValidationError?400:503;if(status===503)ctx.log?.({level:'error',event:'play_request_failed',path:new URL(req.url).pathname});return Response.json({error:status===503?'Your adventure could not be saved. Please retry.':(e as Error).message},{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});}
}
