import {DatabaseSync,backup} from 'node:sqlite';
import {readdir,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
async function find(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())files.push(...await find(path));else if(e.name.endsWith('.sqlite'))files.push(path)}return files;}
await mkdir('backups',{recursive:true});const files=await find(process.env.DATA_DIRECTORY||'.wrangler/state');if(!files.length)throw Error('No local database found. No backup created.');
for(const path of files){const db=new DatabaseSync(path,{readOnly:true}),output=join('backups',`${Date.now()}-${path.split('/').pop()}`);try{await backup(db,output);console.log(JSON.stringify({event:'backup_created',file:output}))}finally{db.close()}}
