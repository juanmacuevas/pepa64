import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digits,ipaDigits,encodeInteger,decodeInteger,parseTranscription,score,align,randomPrompt,validateProfile,CONSENT_VERSION} from '../lib/core.mjs';
test('stable alphabet and complete IPA mapping',()=>{
 assert.equal(digits.length,64);assert.equal(new Set(digits).size,64);assert.equal(digits[35],'sha');assert.equal(digits[55],'ra');assert.equal(digits[60],'ya');assert.equal(digits[63],'yu');assert.ok(!digits.includes('yi'));assert.equal(ipaDigits[55].ipa,'ɾa');
 assert.equal(digits.filter(s=>s.length===2).length,54);
 const readme=readFileSync(new URL('../../README.md',import.meta.url),'utf8');
 const fromTable=[...readme.matchAll(/^\| (?:p|t|k|m|n|f|s|sh|h|ch|l|r|y) \|(.+)$/gm)].flatMap(m=>m[1].split('|').map(v=>v.trim()).filter(v=>v&&v!=='—'));
 assert.deepEqual(fromTable,digits);
});
test('integer edge cases and large exact round trips',()=>{
 for(const [value,text]of [[0n,'pa'],[1n,'pe'],[63n,'yu'],[64n,'pepa'],[65n,'pepe'],[4095n,'yuyu'],[4096n,'pepapa']]){assert.equal(encodeInteger(value),text);assert.equal(decodeInteger(text),value);}
 for(let n=0n;n<4097n;n++) assert.equal(decodeInteger(encodeInteger(n)),n);
 assert.equal(decodeInteger(encodeInteger(2n**256n+987654321n)),2n**256n+987654321n);
 for(const bad of ['', 'pape','pe pa','PE',' pe','yi','wapa','pe!'])assert.throws(()=>decodeInteger(bad));
 assert.throws(()=>encodeInteger(-1n));assert.throws(()=>encodeInteger(1));
});
test('transcription allows spacing and case but does not hide invalid input',()=>{
 assert.deepEqual(parseTranscription(' PE sha yu ').indices,[1,35,63]);
 for(const raw of ['','yi','pi?pa','p e','shal','sha1','pa🙂'])assert.equal(parseTranscription(raw).valid,false);
 assert.equal(score([1,35,63],'peshayu').exact,true);assert.equal(score([0,1],'pe').exact,false);
 assert.equal(score([1],'pe!').alignment,null);
});
test('alignment does not turn one omitted syllable into a cascade',()=>{
 const deletion=align([1,2,3,4],[1,3,4]);assert.equal(deletion.distance,1);assert.equal(deletion.deletions,1);assert.equal(deletion.substitutions,0);
 assert.equal(align([1,2],[1,9,2]).insertions,1);assert.deepEqual(align([50],[55]).pairs,[[50,55]]);assert.equal(align([],[]).distance,0);
});
test('all binary README vectors recover with explicit bit lengths',()=>{
 const md=readFileSync(new URL('../../README.md',import.meta.url),'utf8');let count=0;
 for(const line of md.split('\n')){const c=line.split('|').slice(1,-1).map(x=>x.trim());if(c.length!==5||!/^\d+$/.test(c[0]))continue;
 const length=Number(c[0]),input=BigInt('0x'+c[1].replaceAll('`','')).toString(2).padStart(length,'0');
 const bits=input.padEnd(Math.ceil(length/6)*6,'0'),indices=bits.match(/.{6}/g).map(s=>parseInt(s,2));
 assert.deepEqual(indices,c[2].split(',').map(Number));assert.equal(indices.map(i=>digits[i]).join(' '),c[3].replaceAll('`',''));assert.equal(bits.slice(0,length),input);assert.equal(bits.length-length,Number(c[4]));count++;}assert.equal(count,5);
});
test('prompt lengths, repeated/zero digits, and consent validation',()=>{
 for(const len of [2,4,6]){const p=randomPrompt(len);assert.equal(p.length,len);assert.ok(p.every(d=>d>=0&&d<64));}
 assert.deepEqual(randomPrompt(2,{getRandomValues:a=>a.fill(0)}),[0,0]);assert.throws(()=>randomPrompt(3));
 const input={languages:[' Spanish ','Spanish'],ui:'es',adult:true,guide:true,consent:CONSENT_VERSION};assert.deepEqual(validateProfile(input).languages,['Spanish']);
 for(const bad of [{...input,adult:false},{...input,guide:false},{...input,languages:[]},{...input,consent:'old'},{...input,languages:Array(6).fill(0).map((_,i)=>String(i))}])assert.throws(()=>validateProfile(bad));
});
