import AsyncStorage from '@react-native-async-storage/async-storage';
import { readSavedJson } from './safeRead';
import { getLevel, levels } from '../features/difference/levels';
import { validSession, type Session } from '../features/difference/logic';
import { appendEvent, sanitizeEvents, type RunEvent } from './runEvents';
const KEY='buddhibox.difference.v1';
export type RecordEntry = { completed: number; bestScore: number; bestMs: number; attempts: number; lastScore: number; lastMs: number };
export type DifferenceProgress = { version: 1; records: Record<string,RecordEntry>; session: Session|null; history:RunEvent[] };
const empty = (): DifferenceProgress => ({version:1,records:{},session:null,history:[]});
function readRecord(value: unknown): RecordEntry|null {
  if (!value || typeof value!=='object') return null;
  const v=value as Partial<RecordEntry>;
  if (![v.completed,v.bestScore,v.bestMs,v.attempts,v.lastScore,v.lastMs].every(n=>typeof n==='number' && Number.isSafeInteger(n) && n>=0)) return null;
  return v as RecordEntry;
}
export function sanitize(value: unknown): DifferenceProgress {
  const out=empty();
  if (!value || typeof value!=='object' || (value as DifferenceProgress).version!==1) return out;
  const data=value as Partial<DifferenceProgress>;
  if (data.records && typeof data.records==='object' && !Array.isArray(data.records)) for (const level of levels) {
    const record=readRecord(data.records[level.id]); if(record) out.records[level.id]=record;
  }
  out.history=sanitizeEvents(data.history,new Set(levels.map(l=>l.id)),out.records);
  const level=getLevel(data.session?.levelId ?? '');
  if (level && validSession(data.session,level)) out.session={...data.session,phase:data.session.phase==='playing'?'paused':data.session.phase,startedAt:null};
  return out;
}
export function isUnlocked(progress: DifferenceProgress,index: number) {
  return index===0 || !!progress.records[levels[index-1]?.id ?? '']?.completed;
}
export function complete(progress: DifferenceProgress,levelId:string,points:number,ms:number,event?:RunEvent): DifferenceProgress {
  if (!getLevel(levelId)) return progress;
  if(event && (event.levelId!==levelId||progress.history.some(e=>e.runId===event.runId)))return progress;
  const old=progress.records[levelId];
  const next:RecordEntry={completed:(old?.completed??0)+1,attempts:old?.attempts??1,bestScore:Math.max(old?.bestScore??0,points),bestMs:old?.bestMs ? Math.min(old.bestMs,ms):ms,lastScore:points,lastMs:ms};
  return {...progress,records:{...progress.records,[levelId]:next},session:null,history:event?appendEvent(progress.history,event):progress.history};
}
// All writes to this single key are serialized to prevent stale checkpoints overwriting a completion.
let queue:Promise<unknown>=Promise.resolve();
let cache:DifferenceProgress|null=null;
export function loadProgress():Promise<DifferenceProgress> {
  return queue.then(async()=>{
    if(cache) return cache;
    cache=sanitize(await readSavedJson(KEY));
    return cache;
  });
}
export function updateProgress(change:(current:DifferenceProgress)=>DifferenceProgress):Promise<DifferenceProgress> {
  const task=queue.then(async()=>{
    const current=cache ?? await loadRaw();
    const next=change(current);
    await AsyncStorage.setItem(KEY,JSON.stringify(next));
    cache=next;
    return next;
  });
  queue=task.catch(()=>{});
  return task;
}
async function loadRaw() { return sanitize(await readSavedJson(KEY)); }
/** Only for isolated tests; never invoke from gameplay. */
export function resetProgressCacheForTests(){cache=null;queue=Promise.resolve();}
