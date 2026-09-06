export const ALPHABET_VERSION = 'pepa64-v1';
export const PROTOCOL_VERSION = 'pilot-2026-09-v1';
export const PRONUNCIATION_VERSION = 'ipa-tap-v1';
export const CONSENT_VERSION = 'consent-2026-09-v1';
export const GUIDE_VERSION = 'written-guide-v1';
export const consonants = ['p','t','k','m','n','f','s','sh','h','ch','l','r','y'];
export const vowels = ['a','e','i','o','u'];
export const consonantIPA = ['p','t','k','m','n','f','s','ʃ','h','t͡ʃ','l','ɾ','j'];
export const digits = consonants.flatMap(c => vowels.map(v => c + v)).filter(s => s !== 'yi');
export const ipaDigits = consonants.flatMap((c,i) => vowels.map(v => ({ spelling:c+v, ipa:consonantIPA[i]+v }))).filter(s => s.spelling !== 'yi');
export function encodeInteger(value) {
  if (typeof value !== 'bigint' || value < 0n) throw new TypeError('Expected a non-negative BigInt');
  if (value === 0n) return digits[0];
  let result = '';
  while (value) { result = digits[Number(value % 64n)] + result; value /= 64n; }
  return result;
}
export function decodeInteger(text) {
  const parsed = parseTranscription(text);
  if (!parsed.valid || parsed.indices.length === 0 || text !== parsed.normalized || /\s/.test(text) || (parsed.indices.length > 1 && parsed.indices[0] === 0)) throw new TypeError('Expected a canonical integer');
  return parsed.indices.reduce((n,d) => n * 64n + BigInt(d), 0n);
}
/** Preserve invalid text; never silently discard characters to make a valid answer. */
export function parseTranscription(raw) {
  const normalized = raw.trim().toLowerCase();
  const parts = normalized.match(/(?:sh|ch|[ptkmnfshlry])[aeiou]/g) || [];
  const indices = parts.map(s => digits.indexOf(s));
  const valid = normalized.length > 0 && normalized.replace(/\s/g,'') === parts.join('') && indices.every(i => i >= 0);
  return { normalized, valid, indices: valid ? indices : [] };
}
/** Levenshtein alignment. Ties prefer substitution, then deletion, then insertion. */
export function align(expected, actual) {
  const rows = Array.from({length:expected.length+1}, () => Array(actual.length+1).fill(0));
  for(let i=0;i<=expected.length;i++) rows[i][0]=i;
  for(let j=0;j<=actual.length;j++) rows[0][j]=j;
  for(let i=1;i<=expected.length;i++) for(let j=1;j<=actual.length;j++) rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+Number(expected[i-1]!==actual[j-1]));
  let i=expected.length,j=actual.length, substitutions=0,deletions=0,insertions=0;
  const pairs=[];
  while(i || j) {
    if(i && j && rows[i][j]===rows[i-1][j-1]+Number(expected[i-1]!==actual[j-1])) { if(expected[i-1]!==actual[j-1]) {substitutions++;pairs.push([expected[i-1],actual[j-1]]);} i--;j--; }
    else if(i && rows[i][j]===rows[i-1][j]+1) { deletions++; i--; }
    else { insertions++;j--; }
  }
  return {distance:rows[expected.length][actual.length],substitutions,deletions,insertions,pairs:pairs.reverse()};
}
export function score(expected, raw) {
  const parsed=parseTranscription(raw);
  return {...parsed, exact:parsed.valid && expected.length===parsed.indices.length && expected.every((d,i)=>d===parsed.indices[i]), alignment:parsed.valid?align(expected,parsed.indices):null};
}
export function randomPrompt(length, random = globalThis.crypto) {
  if (![2,4,6].includes(length)) throw new RangeError('Unsupported prompt length');
  return [...random.getRandomValues(new Uint8Array(length))].map(n => n & 63);
}
export function validateProfile(input) {
  const clean = (v,max) => typeof v === 'string' ? v.trim().slice(0,max) : '';
  if(!input || !Array.isArray(input.languages)) throw new TypeError('profile');
  const languages=[...new Set(input.languages.map(v=>clean(v,60)).filter(Boolean))];
  if(languages.length<1 || languages.length>5 || !['es','en'].includes(input.ui) || input.consent!==CONSENT_VERSION || input.adult!==true || input.guide!==true) throw new TypeError('profile');
  return {languages, variety:clean(input.variety,100), otherLanguages:clean(input.otherLanguages,160), ipa:input.ipa===true, ui:input.ui, consent:CONSENT_VERSION, guide:GUIDE_VERSION, pronunciation:PRONUNCIATION_VERSION};
}
