import test from 'node:test';
import assert from 'node:assert/strict';
import {CONSENT_VERSION,digits} from '../lib/core.mjs';
const origin=process.env.PILOT_TEST_URL||'http://localhost:3000';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Synthetic API tests are restricted to localhost.');
async function call(action,token,method='GET',data,extra={}) {
 const res=await fetch(`${origin}/api/pilot?action=${action}`,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(data instanceof Uint8Array?{'Content-Type':'audio/wav'}:data?{'Content-Type':'application/json'}:{}),...extra},body:data instanceof Uint8Array?data:data?JSON.stringify(data):undefined});
 const value=res.headers.get('content-type')?.includes('application/json')?await res.json():await res.arrayBuffer();return {status:res.status,value};
}
function wav(){const bytes=new Uint8Array(16044),v=new DataView(bytes.buffer);for(const [at,text] of [[0,'RIFF'],[8,'WAVE'],[12,'fmt '],[36,'data']])for(let i=0;i<text.length;i++)bytes[at+i]=text.charCodeAt(i);v.setUint32(4,16036,true);v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,16000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);v.setUint32(40,16000,true);return bytes;}
test('durable blind exchange, ownership, idempotence, malformed answers and withdrawal',async()=>{
 const tokens=[];
 const profile={languages:['test-language'],ui:'en',adult:true,guide:true,consent:CONSENT_VERSION};
 try {
  assert.equal((await call('me')).status,401);
  assert.equal((await call('join',null,'POST',{...profile,adult:false})).status,400);
  assert.equal((await call('join',null,'POST',profile,{Origin:'https://unrelated.example'})).status,403);
  for(let i=0;i<3;i++){const r=await call('join',null,'POST',profile);assert.equal(r.status,201,JSON.stringify(r.value));tokens.push(r.value.token);}
  const [speaker,listener,stranger]=tokens;
  const p=await call('prompt',speaker,'POST');assert.equal(p.status,200);assert.equal(p.value.digits.length,2);
  assert.deepEqual((await call('prompt',speaker,'POST')).value,p.value);
  const upload=`upload&prompt=${p.value.id}`, headers={'X-Duration-Ms':'1000','X-Attempts':'1'};
  assert.equal((await call(upload,stranger,'POST',wav(),headers)).status,404);
  assert.equal((await call(upload,speaker,'POST',new Uint8Array(200),headers)).status,415);
  const clip=await call(upload,speaker,'POST',wav(),headers);assert.equal(clip.status,201,JSON.stringify(clip.value));
  assert.equal((await call(upload,speaker,'POST',wav(),headers)).value.id,clip.value.id);
  assert.equal((await call('me',speaker)).value.clips.length,1);
  assert.equal((await call(`audio&id=${clip.value.id}`,stranger)).status,404);
  // With an otherwise empty test DB, the speaker cannot listen to their own clip.
  const own=await call('listen',speaker,'POST');if(!own.value.empty)assert.notEqual(own.value.clip,clip.value.id);
  const a=await call('listen',listener,'POST');assert.equal(a.status,200);assert.ok(a.value.id);assert.equal('digits' in a.value,false);assert.equal('duration' in a.value,false);assert.equal('profile' in a.value,false);
  assert.deepEqual((await call('listen',listener,'POST')).value,a.value);
  assert.equal((await call(`audio&id=${a.value.clip}`,listener)).status,200);
  assert.equal((await call('respond',stranger,'POST',{assignment:a.value.id,raw:'pa',elapsed:1000,plays:1,unsure:false})).status,404);
  const response={assignment:a.value.id,raw:'yi?!',elapsed:1234,plays:2,unsure:true};
  assert.equal((await call('respond',listener,'POST',{...response,plays:0})).status,400);
  assert.equal((await call('respond',listener,'POST',response)).status,200);
  assert.equal((await call('respond',listener,'POST',{...response,raw:digits[0]})).status,200);
  const ex=(await call('export',listener)).value;assert.equal(ex.responses.length,1);assert.equal(ex.responses[0].raw,'yi?!');assert.equal(JSON.parse(ex.responses[0].result).valid,false);assert.equal('token_hash' in ex.participant,false);
  assert.equal((await call('delete',speaker,'DELETE')).status,200);
  assert.equal((await call('me',speaker)).status,401);
  assert.equal((await call(`audio&id=${clip.value.id}`,listener)).status,404);
  if(a.value.clip===clip.value.id)assert.equal((await call('export',listener)).value.responses.length,0);
 } finally {for(const token of tokens){const r=await call('delete',token,'DELETE');assert.ok([200,401].includes(r.status),JSON.stringify(r.value));}}
});
