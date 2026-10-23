// Guest development lab; Sites provides the production Worker runtime.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync,spawn} from 'node:child_process';
const config=JSON.parse(readFileSync('dist/server/wrangler.json','utf8'));
config.d1_databases[0].migrations_dir='../../drizzle';
writeFileSync('dist/server/wrangler-lab.json',JSON.stringify(config));
mkdirSync('.wrangler/state',{recursive:true});
const args=['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js'];
const migration=spawnSync(process.execPath,[...args,'d1','migrations','apply','DB','--local','--config','dist/server/wrangler-lab.json','--persist-to','.wrangler/state'],{stdio:'inherit'});
if(migration.status!==0)process.exit(migration.status||1);
const child=spawn(process.execPath,[...args,'dev','--local','--config','dist/server/wrangler-lab.json','--persist-to','.wrangler/state','--ip','0.0.0.0','--port','3000','--inspector-port','0'],{stdio:'inherit'});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code||0));
