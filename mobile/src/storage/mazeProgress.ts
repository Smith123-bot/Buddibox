import { appendEvent, sanitizeEvents, type RunEvent } from './runEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readSavedJson } from './safeRead';
import { getMazeLevel, mazeLevels } from '../features/maze/levels';
import { validMazeSession, type MazeSession } from '../features/maze/session';
const KEY='buddhibox.maze.v1';
export type MazeRecord={clears:number;attempts:number;bestScore:number;bestMs:number;lastScore:number;lastMs:number;lastRunId:string};
export type MazeProgress={version:1;records:Record<string,MazeRecord>;session:MazeSession|null;history:RunEvent[]};
const empty=():MazeProgress=>({version:1,records:{},session:null,history:[]});
function record(value:unknown):MazeRecord|null{
  if(!value||typeof value!=='object')return null;const v=value as Partial<MazeRecord>;
  return [v.clears,v.attempts,v.bestScore,v.bestMs,v.lastScore,v.lastMs].every(x=>Number.isSafeInteger(x)&&x!>=0)&&typeof v.lastRunId==='string'?v as MazeRecord:null;
}
export function sanitizeMaze(value:unknown):MazeProgress{
  const out=empty();if(!value||typeof value!=='object'||(value as MazeProgress).version!==1)return out;
  const v=value as Partial<MazeProgress>;
  if(v.records&&typeof v.records==='object'&&!Array.isArray(v.records))for(const level of mazeLevels){const r=record(v.records[level.id]);if(r)out.records[level.id]=r}
  out.history=sanitizeEvents(v.history,new Set(mazeLevels.map(l=>l.id)),out.records);
  const level=getMazeLevel(v.session?.levelId??'');if(level&&validMazeSession(v.session,level))out.session={...v.session,phase:v.session.phase==='playing'?'paused':v.session.phase,startedAt:null};
  return out;
}
export function mazeUnlocked(progress:MazeProgress,index:number){return index===0||!!progress.records[mazeLevels[index-1]?.id??'']?.clears}
export function mazeComplete(progress:MazeProgress,levelId:string,runId:string,points:number,ms:number,event?:RunEvent):MazeProgress{
  if(!getMazeLevel(levelId)||!runId||!Number.isSafeInteger(points)||points<0||!Number.isFinite(ms)||ms<0)return progress;
  const old=progress.records[levelId];if(old?.lastRunId===runId||progress.history.some(e=>e.runId===runId))return progress;
  if(event&&(event.runId!==runId||event.levelId!==levelId))return progress;
  const next:MazeRecord={clears:(old?.clears??0)+1,attempts:old?.attempts??1,bestScore:Math.max(old?.bestScore??0,points),bestMs:old?.bestMs?Math.min(old.bestMs,ms):ms,lastScore:points,lastMs:ms,lastRunId:runId};
  return {...progress,records:{...progress.records,[levelId]:next},session:null,history:event?appendEvent(progress.history,event):progress.history};
}
let queue:Promise<unknown>=Promise.resolve();let cache:MazeProgress|null=null;
async function readRaw(){return sanitizeMaze(await readSavedJson(KEY))}
export function loadMazeProgress():Promise<MazeProgress>{return queue.then(async()=>{if(!cache)cache=await readRaw();return cache})}
export function updateMazeProgress(change:(value:MazeProgress)=>MazeProgress):Promise<MazeProgress>{
  const task=queue.then(async()=>{const next=change(cache??await readRaw());await AsyncStorage.setItem(KEY,JSON.stringify(next));cache=next;return next});
  queue=task.catch(()=>{});return task;
}
export function resetMazeCacheForTests(){cache=null;queue=Promise.resolve()}
