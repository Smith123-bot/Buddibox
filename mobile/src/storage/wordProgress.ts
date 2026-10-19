import { appendEvent, sanitizeEvents, type RunEvent } from './runEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readSavedJson } from './safeRead';
import { getPuzzle, pack, puzzles, type Language } from '../features/word-search/puzzles';
import { validWordSession, type WordSession } from '../features/word-search/session';
const KEY='buddhibox.word.v1';
export type WordRecord={clears:number;attempts:number;bestScore:number;bestMs:number;lastScore:number;lastMs:number;lastRunId:string};
export type WordProgress={version:1;selectedLanguage:Language;records:Record<string,WordRecord>;session:WordSession|null;history:RunEvent[]};
const empty=():WordProgress=>({version:1,selectedLanguage:'en',records:{},session:null,history:[]});
function record(value:unknown):WordRecord|null{
  if(!value||typeof value!=='object')return null;const v=value as Partial<WordRecord>;
  return [v.clears,v.attempts,v.bestScore,v.bestMs,v.lastScore,v.lastMs].every(n=>Number.isSafeInteger(n)&&n!>=0)&&typeof v.lastRunId==='string'?v as WordRecord:null;
}
export function sanitizeWord(value:unknown):WordProgress{
  const out=empty();if(!value||typeof value!=='object'||(value as WordProgress).version!==1)return out;
  const v=value as Partial<WordProgress>;
  if(v.selectedLanguage==='hi')out.selectedLanguage='hi';
  if(v.records&&typeof v.records==='object'&&!Array.isArray(v.records))for(const p of puzzles){const r=record(v.records[p.id]);if(r)out.records[p.id]=r}
  out.history=sanitizeEvents(v.history,new Set(puzzles.map(p=>p.id)),out.records);
  const puzzle=getPuzzle(v.session?.puzzleId??'');if(puzzle&&validWordSession(v.session,puzzle))out.session={...v.session,phase:v.session.phase==='playing'?'paused':v.session.phase,startedAt:null,selection:null};
  return out;
}
export function wordUnlocked(progress:WordProgress,language:Language,index:number){return index===0||!!progress.records[pack(language)[index-1]?.id??'']?.clears}
export function wordComplete(progress:WordProgress,id:string,runId:string,points:number,ms:number,event?:RunEvent):WordProgress{
  if(!getPuzzle(id)||!runId||!Number.isSafeInteger(points)||points<0||!Number.isFinite(ms)||ms<0)return progress;
  const old=progress.records[id];if(old?.lastRunId===runId||progress.history.some(e=>e.runId===runId))return progress;
  if(event&&(event.runId!==runId||event.levelId!==id))return progress;
  const next:WordRecord={clears:(old?.clears??0)+1,attempts:old?.attempts??1,bestScore:Math.max(old?.bestScore??0,points),bestMs:old?.bestMs?Math.min(old.bestMs,ms):ms,lastScore:points,lastMs:ms,lastRunId:runId};
  return {...progress,records:{...progress.records,[id]:next},session:null,history:event?appendEvent(progress.history,event):progress.history};
}
let queue:Promise<unknown>=Promise.resolve(),cache:WordProgress|null=null;
async function read(){return sanitizeWord(await readSavedJson(KEY))}
export function loadWordProgress():Promise<WordProgress>{return queue.then(async()=>{if(!cache)cache=await read();return cache})}
export function updateWordProgress(change:(p:WordProgress)=>WordProgress):Promise<WordProgress>{const task=queue.then(async()=>{const next=change(cache??await read());await AsyncStorage.setItem(KEY,JSON.stringify(next));cache=next;return next});queue=task.catch(()=>{});return task}
export function resetWordCacheForTests(){queue=Promise.resolve();cache=null}
