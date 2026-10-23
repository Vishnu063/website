import { fighters,districts,chapterNames,sceneFor,collections } from './adventure-content';
import { hash,dayKey } from './game-content';
import {one,newRun,runById,changeRun,award,notify,requireGame,type PlayContext} from './play-core';
const xpFor=async(c:PlayContext)=>Number((await one(c,'SELECT COALESCE(SUM(xp),0) xp FROM game_events WHERE user=?',[c.uid])).xp);
export function combatView(r:any){const s=r.data;return {id:r.id,version:r.version,complete:!!r.complete,score:r.score,...s};}
export function initialCombat(hero:string,seed:string){const f=fighters.find(f=>f.id===hero)!;return {hero,seed,day:dayKey(),turn:0,hp:f.hp,maxHp:f.hp,enemyHp:120,enemyMax:120,energy:5,burn:0,shield:0,weaken:0,enemyIntent:'strike',log:['The rival takes a measured stance. Choose a move.'],winner:null,match:null};}
export function resolveCombat(state:any,action:string){
 const s={...state,log:[] as string[]},f=fighters.find(f=>f.id===s.hero)!;
 requireGame(['strike','special','guard','focus'].includes(action),400,'Choose a valid move.');requireGame(action!=='special'||s.energy>=4,400,'Your special needs four energy.');
 s.turn++;const roll=hash(s.seed+':'+s.turn)%5;
 if(s.burn>0){s.enemyHp-=7;s.burn--;s.log.push('Solar embers deal 7 damage.');}
 const guarded=action==='guard';
 const heroMove=()=>{
  if(action==='focus'){s.energy=Math.min(8,s.energy+3);s.hp=Math.min(s.maxHp,s.hp+5);s.log.push('You focus: +3 energy and 5 health.');return;}
  if(guarded){s.energy=Math.min(8,s.energy+1);s.log.push('You guard and recover one energy.');return;}
  let damage=Math.max(5,f.attack-7+roll);
  if(action==='special'){s.energy-=4;damage+=12;if(s.hero==='akira')s.burn=3;if(s.hero==='luna'){s.shield=18;s.weaken=1;}if(s.hero==='ren')damage+=8;s.log.push(f.special+'!');}else s.energy=Math.min(8,s.energy+1);
  if(s.enemyIntent==='guard')damage=Math.ceil(damage*.55);
  s.enemyHp=Math.max(0,s.enemyHp-damage);s.log.push(`You deal ${damage} damage.`);
 };
 const rivalMove=()=>{if(s.enemyHp<=0)return;if(s.enemyIntent==='guard'){s.log.push('The rival defends.');return;}let damage=Math.max(5,(s.enemyIntent==='special'?33:25)-f.defense+roll);if(s.weaken){damage=Math.ceil(damage*.6);s.weaken=0;}if(guarded)damage=Math.ceil(damage*.35);if(s.shield){const absorbed=Math.min(s.shield,damage);damage-=absorbed;s.shield-=absorbed;}s.hp=Math.max(0,s.hp-damage);s.log.push(`The rival deals ${damage} damage.`);};
 if(f.speed>=14){heroMove();rivalMove();}else{rivalMove();if(s.hp>0)heroMove();}
 if(s.hp<=0)s.winner='rival';else if(s.enemyHp<=0)s.winner='hero';else if(s.turn>=25){s.winner='rival';s.log.push('The encounter reaches its 25-turn limit.');}
 s.enemyIntent=['strike','guard','special','strike'][hash(s.seed+':intent:'+s.turn)%4];return s;
}
export async function adventureRouter(c:PlayContext):Promise<any|undefined>{const {p,method,body}=c;
 if(p[0]==='combat'){
  if(p[1]==='start'&&method==='POST'){
   requireGame(fighters.some(f=>f.id===body.hero),400,'Choose an original hero.');
   const active=await one(c,"SELECT * FROM game_runs WHERE user=? AND kind='combat' AND complete=0 ORDER BY updated DESC LIMIT 1",[c.uid]);
   if(active&&c.now-active.updated<3600000)return combatView({...active,data:JSON.parse(active.state)});
   return combatView(await newRun(c,'combat',initialCombat(body.hero,crypto.randomUUID())));
  }
  const r=await runById(c,p[1],'combat');if(method==='GET')return combatView(r);
  requireGame(method==='POST'&&p[2]==='move',404,'Combat action not found.');requireGame(!r.complete&&body.version===r.version,409,'This encounter has changed. Reload to continue.');
  const s=resolveCombat(r.data,body.action),score=s.winner==='hero'?Math.max(10,600-s.turn*15+s.hp):0;
  return combatView(await changeRun(c,r,s,!!s.winner,score));
 }
 if(p[0]==='story'){
  const rows=await c.db.all("SELECT * FROM game_runs WHERE user=? AND kind='story' ORDER BY created ASC",[c.uid]);
  const stories=rows.map(r=>({...r,data:JSON.parse(r.state)}));
  if(p.length===1&&method==='GET')return {chapters:chapterNames.map((name,i)=>({index:i,name,unlocked:i===0||stories.some(r=>r.complete&&r.data.chapter===i-1),run:stories.find(r=>r.data.chapter===i)?.id,complete:stories.some(r=>r.complete&&r.data.chapter===i)})),endings:stories.filter(r=>r.complete).map(r=>({chapter:r.data.chapter,flags:r.data.flags,choices:r.data.choices,relationships:r.data.relationships}))};
  if(p[1]==='start'&&method==='POST'){
   const chapter=body.chapter;requireGame(Number.isInteger(chapter)&&chapter>=0&&chapter<chapterNames.length,400,'Choose a chapter.');
   const prev=stories.find(r=>r.complete&&r.data.chapter===chapter-1);requireGame(chapter===0||prev,403,'Finish the previous chapter first.');
   const active=stories.find(r=>r.data.chapter===chapter);if(active)return {id:active.id,version:active.version,complete:!!active.complete,scene:sceneFor(active.data),state:active.data};
   const r=await newRun(c,'story',{chapter,scene:0,flags:prev?.data.flags||{},choices:[],relationships:prev?.data.relationships||0});return {id:r.id,version:r.version,complete:false,scene:sceneFor(r.data),state:r.data};
  }
  const r=await runById(c,p[1],'story');if(method==='GET')return {id:r.id,version:r.version,complete:!!r.complete,scene:sceneFor(r.data),state:r.data};
  requireGame(p[2]==='choice'&&method==='POST',404,'Story action not found.');requireGame(!r.complete&&body.version===r.version,409,'This story choice has already changed.');
  const s=structuredClone(r.data),scene=sceneFor(s);requireGame(scene.choices.some((ch:any)=>ch.id===body.choice),400,'That choice is not available on your path.');
  s.choices.push({scene:s.scene,choice:body.choice});const f=s.flags;
  if(body.choice==='help')f.kindness=true;if(body.choice==='trust')s.relationships++;
  if(['forest','repair'].includes(body.choice)){f.bridge=true;s.relationships++;}
  if(body.choice==='listen')f.listen=true;if(body.choice==='protect')f.protect=true;
  if(['share','return','release'].includes(body.choice))f.ending=body.choice==='share'?'shared':body.choice==='return'?'returned':'released';
  s.scene++;const complete=s.scene>=3;const out=await changeRun(c,r,s,complete);
  if(complete&&s.chapter<2)await notify(c,c.uid,'story',`chapter:${s.chapter+1}`,`A new chapter opened: ${chapterNames[s.chapter+1]}`,'/story');
  return {id:out.id,version:out.version,complete,scene:sceneFor({...s,scene:Math.min(s.scene,2)}),state:s};
 }
 if(p[0]==='world'){
  const xp=await xpFor(c),level=1+Math.floor(xp/100),events=await c.db.all("SELECT source FROM game_events WHERE user=? AND kind='explore'",[c.uid]);
  if(method==='GET')return {level,locations:districts.map(d=>({...d,unlocked:level>=d.level,discovered:events.some(e=>e.source==='explore:'+d.id)}))};
  requireGame(method==='POST',405,'Method not allowed.');const location=districts.find(d=>d.id===body.location);requireGame(location&&level>=location.level,403,'Earn more XP to open this district.');
  await award(c,'explore','explore:'+location!.id,15);return {discovery:location!.discovery,npc:location!.npc,line:location!.line};
 }
 if(p[0]==='collection'){
  const xp=await xpFor(c),player=await one(c,'SELECT settings FROM game_players WHERE user=?',[c.uid]),settings=JSON.parse(player.settings);
  if(method==='GET')return {xp,equipped:settings.cosmetic||'akira',characters:collections.map(ch=>({...ch,unlocked:xp>=ch.xp}))};
  requireGame(method==='POST',405,'Method not allowed.');const ch=collections.find(ch=>ch.id===body.id);requireGame(ch&&xp>=ch.xp,403,'Earn this edition before equipping it.');
  // Atomic SQL updates are handled by settings router to avoid overwriting concurrent preference changes.
  settings.cosmetic=ch!.id;await c.db.run('UPDATE game_players SET settings=? WHERE user=?',[JSON.stringify(settings),c.uid]);return {equipped:ch!.id};
 }
 return undefined;
}
