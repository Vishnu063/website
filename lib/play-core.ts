import type { Database, User } from './api';
import { cleanText } from './power';
export class GameError extends Error { constructor(public status:number,message:string){super(message);} }
export const requireGame=(condition:unknown,status:number,message:string):void=>{if(!condition)throw new GameError(status,message);};
export const text=(value:unknown,min=1,max=100)=>cleanText(value,min,max);
export type PlayContext={db:Database;user:User|null;uid:string;guest:boolean;admins:string[];now:number;body:any;method:string;p:string[]};
export const one=async(c:PlayContext,sql:string,args:unknown[]=[]) => (await c.db.all(sql,args))[0];
export async function runById(c:PlayContext,id:unknown,kind?:string) {
 const row=await one(c,'SELECT * FROM game_runs WHERE id=? AND user=?',[text(id,1,80),c.uid]);
 requireGame(row&&(!kind||row.kind===kind),404,'Adventure not found.');
 return {...row,data:JSON.parse(row.state)};
}
export async function newRun(c:PlayContext,kind:string,state:unknown) {
 const id=crypto.randomUUID(); await c.db.run('INSERT INTO game_runs(id,user,kind,state,version,score,complete,created,updated) VALUES(?,?,?,?,0,0,0,?,?)',[id,c.uid,kind,JSON.stringify(state),c.now,c.now]);return runById(c,id,kind);
}
export async function changeRun(c:PlayContext,r:any,state:any,complete=false,score=0) {
 const rows=await c.db.all('UPDATE game_runs SET state=?,version=version+1,complete=?,score=?,updated=? WHERE id=? AND user=? AND version=? RETURNING *',[JSON.stringify(state),complete?1:0,score,c.now,r.id,c.uid,r.version]);
 requireGame(rows.length,409,'This adventure changed in another tab. Reload to continue.');return {...rows[0],data:state};
}
export async function notify(c:PlayContext,user:string,kind:string,key:string,title:string,href:string) {
 if(user.startsWith('guest:'))return;
 const player=await one(c,'SELECT settings FROM game_players WHERE user=?',[user]);
 const preferences=player?JSON.parse(player.settings):{};
 if(preferences.notifications===false||preferences[kind]===false)return;
 await c.db.run('INSERT INTO notifications(id,user,kind,title,href,read,created) VALUES(?,?,?,?,?,0,?) ON CONFLICT(id) DO NOTHING',[`${user}:${key}`,user,kind,title,href,c.now]);
}
export async function award(c:PlayContext,kind:string,source:string,xp:number,score=0) {
 await c.db.run('INSERT INTO game_events(id,user,kind,source,xp,score,created) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',[`${c.uid}:${source}`,c.uid,kind,source,xp,score,c.now]);
}
export const account=(c:PlayContext)=>{requireGame(!c.guest,401,'Sign in to join social activities and save progress across devices.');return c.uid;};
export const admin=(c:PlayContext)=>{account(c);requireGame(c.admins.includes(c.uid),403,'Administrator access required.');};
