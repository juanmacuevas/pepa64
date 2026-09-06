import { database, audioStore, type Row } from '@/db';
import { validateProfile, randomPrompt, digits, score, PROTOCOL_VERSION } from '@/lib/core.mjs';
export const dynamic = 'force-dynamic';
const id = () => crypto.randomUUID();
const json = (data:unknown,status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class ApiError extends Error { constructor(public status:number, message:string) { super(message); } }
async function hash(text:string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,'0')).join(''); }
async function body(req:Request) { if(Number(req.headers.get('content-length')||0)>8192) throw new ApiError(413,'too_large'); const raw=await req.text(); if(raw.length>8192) throw new ApiError(413,'too_large'); try {return JSON.parse(raw);} catch {throw new ApiError(400,'invalid');} }
async function participant(req:Request) {
  const token=req.headers.get('authorization')?.replace(/^Bearer /,'');
  if(!token || !/^[a-f0-9]{64}$/.test(token)) throw new ApiError(401,'session');
  const p=await database().prepare('SELECT * FROM participants WHERE token_hash = ?').bind(await hash(token)).first();
  if(!p) throw new ApiError(401,'session'); return p;
}
function integer(n:unknown,min:number,max:number) { if(typeof n!=='number'||!Number.isInteger(n)||n<min||n>max) throw new ApiError(400,'invalid'); return n; }
async function limit(table:string,participantId:unknown,max:number) {
  const count=await database().prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE participant = ?`).bind(participantId).first<{n:number}>();
  if((count?.n||0)>=max) throw new ApiError(429,'limit');
}
async function handle(req:Request) {
  const url=new URL(req.url), action=url.searchParams.get('action')||'me';
  const db=database();
  if(req.method==='POST' || req.method==='DELETE') {
    const origin=req.headers.get('origin');
    if(origin && origin!==url.origin) throw new ApiError(403,'origin');
  }
  if(action==='join' && req.method==='POST') {
    let profile; try {profile=validateProfile(await body(req));} catch(e) {if(e instanceof ApiError) throw e; throw new ApiError(400,'profile');}
    const token=[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');
    const participantId=id();
    await db.prepare('INSERT INTO participants (id,token_hash,profile,created) VALUES (?,?,?,?)').bind(participantId,await hash(token),JSON.stringify(profile),Date.now()).run();
    return json({token,profile},201);
  }
  const p=await participant(req);
  if(action==='me' && req.method==='GET') {
    const clips=await db.prepare('SELECT id,created,duration FROM clips WHERE participant = ? ORDER BY created DESC').bind(p.id).all();
    const count=await db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant = ?').bind(p.id).first();
    return json({profile:JSON.parse(String(p.profile)),clips:clips.results,responses:count?.n||0});
  }
  if(action==='prompt' && req.method==='POST') {
    const existing=await db.prepare('SELECT p.* FROM prompts p LEFT JOIN clips c ON c.prompt=p.id WHERE p.participant=? AND c.id IS NULL ORDER BY p.created DESC LIMIT 1').bind(p.id).first();
    if(existing) return json({id:existing.id,digits:JSON.parse(String(existing.digits)).map((d:number)=>digits[d])});
    await limit('prompts',p.id,100);
    const count=await db.prepare('SELECT COUNT(*) AS n FROM prompts WHERE participant=?').bind(p.id).first<{n:number}>();
    const indices=randomPrompt([2,4,6][(count?.n||0)%3]), promptId=id();
    await db.prepare('INSERT INTO prompts (id,participant,digits,protocol,created) VALUES (?,?,?,?,?)').bind(promptId,p.id,JSON.stringify(indices),PROTOCOL_VERSION,Date.now()).run();
    return json({id:promptId,digits:indices.map(d=>digits[d])});
  }
  if(action==='upload' && req.method==='POST') {
    const prompt=await db.prepare('SELECT * FROM prompts WHERE id=? AND participant=?').bind(url.searchParams.get('prompt'),p.id).first();
    if(!prompt) throw new ApiError(404,'missing');
    const previous=await db.prepare('SELECT id FROM clips WHERE prompt=?').bind(prompt.id).first();
    if(previous) return json({saved:true,id:previous.id});
    await limit('clips',p.id,30);
    const duration=integer(Number(req.headers.get('x-duration-ms')),100,22000), attempts=integer(Number(req.headers.get('x-attempts')),1,1000);
    const mime=(req.headers.get('content-type')||'').split(';')[0].trim();
    if(!['audio/webm','audio/mp4','audio/ogg','audio/wav'].includes(mime)) throw new ApiError(415,'format');
    if(Number(req.headers.get('content-length')||0)>2_000_000) throw new ApiError(413,'too_large');
    const reader=req.body?.getReader(); if(!reader) throw new ApiError(400,'invalid');
    const chunks:Uint8Array[]=[]; let size=0;
    while(true) { const {value,done}=await reader.read(); if(done) break; size+=value.length; if(size>2_000_000) {await reader.cancel();throw new ApiError(413,'too_large');} chunks.push(value); }
    if(size<100) throw new ApiError(400,'invalid');
    const bytes=new Uint8Array(size); let offset=0; for(const c of chunks) {bytes.set(c,offset);offset+=c.length;}
    const magic=Array.from(bytes.slice(0,12));
    const validMagic=mime==='audio/webm'?magic.slice(0,4).join(',')==='26,69,223,163':mime==='audio/ogg'?String.fromCharCode(...magic.slice(0,4))==='OggS':mime==='audio/mp4'?String.fromCharCode(...magic.slice(4,8))==='ftyp':String.fromCharCode(...magic.slice(0,4))==='RIFF'&&String.fromCharCode(...magic.slice(8,12))==='WAVE';
    if(!validMagic) throw new ApiError(415,'format');
    const clipId=id(),key=`clips/${p.id}/${clipId}`;
    await audioStore().put(key,bytes.buffer,{httpMetadata:{contentType:mime}});
    try { await db.prepare('INSERT INTO clips (id,participant,prompt,object_key,mime,bytes,duration,attempts,created) VALUES (?,?,?,?,?,?,?,?,?)').bind(clipId,p.id,prompt.id,key,mime,size,duration,attempts,Date.now()).run(); }
    catch(e) { await audioStore().delete(key); throw e; }
    return json({saved:true,id:clipId},201);
  }
  if(action==='listen' && req.method==='POST') {
    let a=await db.prepare('SELECT a.id,a.clip FROM assignments a LEFT JOIN responses r ON r.assignment=a.id WHERE a.participant=? AND r.id IS NULL ORDER BY a.created LIMIT 1').bind(p.id).first();
    if(!a) {
      await limit('assignments',p.id,200);
      const clip=await db.prepare(`SELECT c.id FROM clips c JOIN prompts prompt ON prompt.id=c.prompt
        WHERE c.participant!=? AND prompt.protocol=?
        AND NOT EXISTS (SELECT 1 FROM assignments a WHERE a.clip=c.id AND a.participant=?)
        AND NOT EXISTS (SELECT 1 FROM prompts own WHERE own.participant=? AND own.digits=prompt.digits)
        ORDER BY (SELECT COUNT(*) FROM responses r JOIN assignments a ON a.id=r.assignment WHERE a.clip=c.id), RANDOM() LIMIT 1`).bind(p.id,PROTOCOL_VERSION,p.id,p.id).first();
      if(!clip) return json({empty:true});
      a={id:id(),clip:clip.id};
      await db.prepare('INSERT INTO assignments (id,participant,clip,created) VALUES (?,?,?,?)').bind(a.id,p.id,a.clip,Date.now()).run();
    }
    return json({id:a.id,clip:a.clip});
  }
  if(action==='audio' && req.method==='GET') {
    const clip=await db.prepare('SELECT * FROM clips WHERE id=? AND (participant=? OR EXISTS (SELECT 1 FROM assignments WHERE clip=clips.id AND participant=?))').bind(url.searchParams.get('id'),p.id,p.id).first();
    if(!clip) throw new ApiError(404,'missing');
    const object=await audioStore().get(String(clip.object_key));
    if(!object) throw new ApiError(404,'missing');
    return new Response(object.body,{headers:{'Content-Type':String(clip.mime),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(action==='respond' && req.method==='POST') {
    const data=await body(req);
    const assignment=await db.prepare('SELECT a.id,p.digits FROM assignments a JOIN clips c ON c.id=a.clip JOIN prompts p ON p.id=c.prompt WHERE a.id=? AND a.participant=?').bind(data.assignment,p.id).first();
    if(!assignment) throw new ApiError(404,'missing');
    if(typeof data.raw!=='string'||data.raw.length>300||typeof data.unsure!=='boolean'||(!data.raw.trim()&&!data.unsure)) throw new ApiError(400,'invalid');
    const elapsed=integer(data.elapsed,0,3_600_000),plays=integer(data.plays,1,1000);
    const result=score(JSON.parse(String(assignment.digits)),data.raw);
    await db.prepare('INSERT OR IGNORE INTO responses (id,participant,assignment,raw,result,elapsed,plays,unsure,created) VALUES (?,?,?,?,?,?,?,?,?)').bind(id(),p.id,assignment.id,data.raw,JSON.stringify(result),elapsed,plays,Number(data.unsure),Date.now()).run();
    return json({saved:true});
  }
  if(action==='export' && req.method==='GET') {
    const own:Record<string,Row[]>={};
    for(const table of ['prompts','clips','assignments','responses']) own[table]=(await db.prepare(`SELECT * FROM ${table} WHERE participant=?`).bind(p.id).all()).results;
    return json({protocol:PROTOCOL_VERSION,participant:{id:p.id,profile:JSON.parse(String(p.profile)),created:p.created},...own});
  }
  if(action==='delete' && req.method==='DELETE') {
    const clips=await db.prepare('SELECT object_key FROM clips WHERE participant=?').bind(p.id).all();
    if(clips.results.length) await audioStore().delete(clips.results.map(c=>String(c.object_key)));
    await db.batch([
      db.prepare('DELETE FROM responses WHERE participant=? OR assignment IN (SELECT id FROM assignments WHERE clip IN (SELECT id FROM clips WHERE participant=?))').bind(p.id,p.id),
      db.prepare('DELETE FROM assignments WHERE participant=? OR clip IN (SELECT id FROM clips WHERE participant=?)').bind(p.id,p.id),
      db.prepare('DELETE FROM clips WHERE participant=?').bind(p.id),
      db.prepare('DELETE FROM prompts WHERE participant=?').bind(p.id),
      db.prepare('DELETE FROM participants WHERE id=?').bind(p.id),
    ]);
    return json({deleted:true});
  }
  throw new ApiError(404,'missing');
}
async function route(req:Request) {try{return await handle(req);}catch(e){if(e instanceof ApiError)return json({error:e.message},e.status);console.error('Pilot request failed',e instanceof Error?e.message:'unknown');return json({error:'server'},500);}}
export { route as GET, route as POST, route as DELETE };
