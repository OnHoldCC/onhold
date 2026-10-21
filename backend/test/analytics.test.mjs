import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
async function port(){const s=createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function until(fn){for(let i=0;i<160;i++){try{const v=await fn();if(v)return v;}catch{}await delay(200);}throw Error('analytics synchronization timed out');}
async function stop(child){if(child&&child.exitCode===null){const exited=once(child,'exit');child.kill('SIGTERM');await exited;}}
test('PostgreSQL and Redis keep exact PV/UV/clicks across duplicates, concurrent events, lost acknowledgements, cache loss and restarts',{timeout:110000},async()=>{
 const directory=await mkdtemp(join(tmpdir(),'onhold-analytics-test-'));
 const [pgPort,redisPort,apiPort]=await Promise.all([port(),port(),port()]);
 const pgUrl=`postgresql://onhold_test@127.0.0.1:${pgPort}/postgres?sslmode=disable`,api=`http://127.0.0.1:${apiPort}`;
 const sql=q=>execFileSync('psql',['--no-psqlrc',pgUrl,'-Atc',q],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 const redis=(...args)=>execFileSync('redis-cli',['--raw','-p',String(redisPort),...args.map(String)],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
 let postgres,cache,backend;let logs='';
 const startRedis=()=>spawn('redis-server',['--bind','127.0.0.1','--port',String(redisPort),'--save','','--appendonly','no','--dir',directory],{stdio:'ignore'});
 const env={...process.env};for(const k of Object.keys(env))if(k.startsWith('ONHOLD_'))delete env[k];
 Object.assign(env,{DATABASE_URL:pgUrl,REDIS_URL:`redis://127.0.0.1:${redisPort}`,ONHOLD_ADDR:`127.0.0.1:${apiPort}`,ONHOLD_DATA_DIR:directory,ONHOLD_DIST_DIR:'/nonexistent',ONHOLD_TRUSTED_PROXIES:'127.0.0.1'});
 const start=()=>{const c=spawn('backend/target/debug/onhold-api',[],{env,stdio:['ignore','ignore','pipe']});c.stderr.on('data',v=>logs+=v);return c;};
 const stats=async()=>{const r=await fetch(api+'/api/stats');assert.equal(r.status,200);return{source:r.headers.get('x-analytics-source'),data:await r.json()};};
 const market='0x'+'a'.repeat(40);
 const event=(id,kind='page_view',site=null,version=null)=>({event_id:id,kind,page:'home',site_id:site,...(version?{market,campaign_version:version}:{})});
 const post=async(value,ip='198.51.100.1')=>{const r=await fetch(api+'/api/events',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':ip},body:JSON.stringify(value)});assert.equal(r.status,200);return r.json();};
 try{
  execFileSync('initdb',['-D',join(directory,'pg'),'-A','trust','-U','onhold_test','--no-instructions'],{stdio:'ignore'});
  postgres=spawn('postgres',['-D',join(directory,'pg'),'-h','127.0.0.1','-p',String(pgPort),'-k',directory],{stdio:'ignore'});cache=startRedis();
  await until(()=>sql('SELECT 1')==='1'&&redis('PING')==='PONG');
  execFileSync('psql',['--no-psqlrc',pgUrl,'-f','backend/sql/chain.sql'],{stdio:'ignore'});
  sql("INSERT INTO analytics_events(event_id,kind,page,created_at) SELECT 'legacy-page-event-'||i,'page_view','home',extract(epoch FROM now()-interval '2 days')::bigint FROM generate_series(1,1005)i");
  backend=start();await until(async()=>{const s=await stats();return s.source==='redis'&&s.data.page_views===1005;});
  const initial=(await stats()).data;assert.equal(initial.page_uv,0,'do not invent historical UV');assert.equal(initial.daily_clicks.length,30);
  const duplicate=event('same-page-event-00001');
  const results=await Promise.all(Array.from({length:20},()=>post(duplicate)));
  assert.equal(results.filter(v=>!v.duplicate).length,1);
  await Promise.all(Array.from({length:30},(_,i)=>post(event('parallel-page-event-'+i),'198.51.100.2')));
  await post(event('click-campaign-one-0001','ad_click',0,1));
  await post(event('click-campaign-one-0002','ad_click',0,1));
  await post(event('click-campaign-one-0003','ad_click',0,1),'198.51.100.2');
  await post(event('click-campaign-two-0001','ad_click',0,2));
  const stable=await until(async()=>{const s=await stats();return s.source==='redis'&&s.data.page_views===1036&&s.data.ad_clicks===4?s:null;});
  assert.equal(stable.data.page_uv,2);assert.equal(stable.data.uv_by_site[0],2);assert.equal(stable.data.daily_clicks.at(-1).clicks,4);
  const cacheKey=redis('KEYS','onhold:analytics:v1:*');assert.ok(cacheKey&&!cacheKey.includes('\n'));
  let data=JSON.parse(redis('HGET',cacheKey,'data'));assert.deepEqual(data.stats,stable.data);assert.deepEqual(data.campaigns[market+':0:1'],{clicks:3,uv:2});assert.deepEqual(data.campaigns[market+':0:2'],{clicks:1,uv:1});
  assert.equal(sql('SELECT count(*) FROM analytics_events WHERE redis_pending'),'0');
  assert.ok(!redis('HKEYS',cacheKey).includes('198.51.100.'));
  // Simulate Redis accepting a batch, followed by a crash before PostgreSQL acknowledges it.
  await stop(backend);backend=null;
  sql("INSERT INTO analytics_events(event_id,kind,page,visitor_id,created_at) VALUES('lost-ack-page-event-001','page_view','home','anonymous-third-visitor',extract(epoch FROM now())::bigint)");
  const row={id:'lost-ack-page-event-001',kind:'page_view',site:null,campaign:null,visitor:'anonymous-third-visitor',day:data.stats.daily_clicks.at(-1).date};
  redis('EVAL',await readFile('backend/src/analytics-cache.lua','utf8'),1,cacheKey,redis('HGET',cacheKey,'generation'),JSON.stringify(data),JSON.stringify(data.stats.daily_clicks.map(d=>({...d,clicks:0}))),JSON.stringify([row]),Math.floor(Date.now()/1000),1);
  assert.equal(JSON.parse(redis('HGET',cacheKey,'data')).stats.page_views,1037);
  backend=start();await until(()=>sql("SELECT redis_pending FROM analytics_events WHERE event_id='lost-ack-page-event-001'")==='f');
  assert.equal((await stats()).data.page_views,1037);assert.equal((await stats()).data.page_uv,3);
  // A cache outage preserves both accepted events and database de-duplication.
  await stop(cache);cache=null;
  const down=await post(event('during-redis-outage-001'));assert.equal(down.cached,false);
  assert.equal((await post(event('during-redis-outage-001'))).duplicate,true);
  const fallback=await stats();assert.equal(fallback.source,'postgresql');assert.equal(fallback.data.page_views,1038);assert.equal(fallback.data.page_uv,3);
  assert.equal(sql("SELECT redis_pending FROM analytics_events WHERE event_id='during-redis-outage-001'"),'t');
  cache=startRedis();await until(()=>redis('PING')==='PONG');
  const recovered=await until(async()=>{const s=await stats();return s.source==='redis'&&s.data.page_views===1038?s:null;});
  assert.equal(recovered.data.page_uv,3);assert.equal(recovered.data.ad_clicks,4);assert.equal(recovered.data.uv_by_site[0],2);
  assert.equal(sql('SELECT count(*) FROM analytics_events WHERE redis_pending'),'0');
  redis('HSET',cacheKey,'data','broken');
  await until(async()=>{const s=await stats();return s.source==='redis'&&s.data.page_views===1038;});
  redis('SET',cacheKey,'wrong redis type');await until(async()=>{const s=await stats();return s.source==='redis'&&s.data.page_views===1038;});
  await stop(backend);backend=start();await until(async()=>{const s=await stats();return s.source==='redis'&&s.data.page_uv===3;});
  assert.equal((await post(duplicate)).duplicate,true);assert.equal((await stats()).data.page_views,1038);
 }catch(cause){console.error(logs.slice(-3000));throw cause;}
 finally{await stop(backend);await stop(cache);await stop(postgres);await rm(directory,{recursive:true,force:true});}
});
