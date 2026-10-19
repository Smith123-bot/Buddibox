import { equalPoint, inGrid, line, samePath, type Point, type Puzzle } from './puzzles';
export type WordPhase='ready'|'playing'|'paused'|'completed';
export type WordSession={runId:string;puzzleId:string;phase:WordPhase;found:string[];selection:Point|null;hintId:string|null;hints:number;elapsedMs:number;startedAt:number|null};
export function freshWord(p:Puzzle,runId:string):WordSession{return {runId,puzzleId:p.id,phase:'ready',found:[],selection:null,hintId:null,hints:0,elapsedMs:0,startedAt:null}}
export function wordElapsed(s:WordSession,now:number){return s.elapsedMs+(s.phase==='playing'&&s.startedAt!==null?Math.max(0,now-s.startedAt):0)}
export function resumeWord(s:WordSession,now:number):WordSession{return s.phase==='ready'||s.phase==='paused'?{...s,phase:'playing',startedAt:now}:s}
export function pauseWord(s:WordSession,now:number):WordSession{return s.phase==='playing'?{...s,phase:'paused',startedAt:null,elapsedMs:wordElapsed(s,now),selection:null,hintId:null}:s}
export type SelectionResult={session:WordSession;kind:'start'|'found'|'invalid'|'duplicate'|'ignored';word?:string};
export function chooseCell(s:WordSession,p:Puzzle,point:Point,now:number):SelectionResult{
  if(s.phase!=='playing'||!inGrid(p,point))return {session:s,kind:'ignored'};
  if(!s.selection)return {session:{...s,selection:point,hintId:null},kind:'start'};
  const path=line(s.selection,point);
  if(!path||path.length<2)return {session:{...s,selection:null},kind:'invalid'};
  const target=p.targets.find(t=>samePath(path,t.cells)||samePath([...path].reverse(),t.cells));
  if(!target)return {session:{...s,selection:null},kind:'invalid'};
  if(s.found.includes(target.id))return {session:{...s,selection:null},kind:'duplicate'};
  const found=[...s.found,target.id],next={...s,found,selection:null,hintId:null};
  return {session:found.length===p.targets.length?{...pauseWord(next,now),phase:'completed'}:next,kind:'found',word:target.display};
}
export function hintWord(s:WordSession,p:Puzzle):WordSession{
  if(s.phase!=='playing'||s.hints>=p.hintLimit)return s;
  const target=p.targets.find(t=>!s.found.includes(t.id)&&t.id!==s.hintId)??p.targets.find(t=>!s.found.includes(t.id));
  return target?{...s,hints:s.hints+1,hintId:target.id,selection:null}:s;
}
export function wordScore(s:WordSession,p:Puzzle){
  const bonus=s.phase==='completed'?Math.max(0,200-Math.floor(200*(s.elapsedMs/1000)/p.parSeconds)):0;
  return Math.max(0,s.found.length*100+bonus-s.hints*50);
}
export function validWordSession(value:unknown,p:Puzzle):value is WordSession{
  if(!value||typeof value!=='object')return false;const s=value as Partial<WordSession>;
  return typeof s.runId==='string'&&s.runId.length>0&&s.puzzleId===p.id&&['ready','playing','paused'].includes(s.phase??'')&&
    Array.isArray(s.found)&&new Set(s.found).size===s.found.length&&s.found.length<p.targets.length&&s.found.every(id=>p.targets.some(t=>t.id===id))&&
    (s.selection===null||!!s.selection&&inGrid(p,s.selection))&&(s.hintId===null||p.targets.some(t=>t.id===s.hintId))&&
    Number.isSafeInteger(s.hints)&&s.hints!>=0&&s.hints!<=p.hintLimit&&typeof s.elapsedMs==='number'&&Number.isFinite(s.elapsedMs)&&s.elapsedMs>=0&&
    (s.startedAt===null||(typeof s.startedAt==='number'&&Number.isFinite(s.startedAt)));
}
export function isMarked(s:WordSession,p:Puzzle,point:Point){return p.targets.some(t=>s.found.includes(t.id)&&t.cells.some(c=>equalPoint(c,point)))}
