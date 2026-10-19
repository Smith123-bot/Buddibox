import { canMove, equal, neighbor, shortestPath, type Cell, type Direction } from './engine';
import type { MazeLevel } from './levels';
export type MazePhase='ready'|'playing'|'paused'|'completed';
export type MazeSession={runId:string;levelId:string;phase:MazePhase;position:Cell;visited:number[];moves:number;hints:number;hintCell:Cell|null;elapsedMs:number;startedAt:number|null};
export function fresh(level:MazeLevel,runId:string):MazeSession{return {runId,levelId:level.id,phase:'ready',position:level.maze.start,visited:[0],moves:0,hints:0,hintCell:null,elapsedMs:0,startedAt:null}}
export function activeMs(s:MazeSession,now:number){return s.elapsedMs+(s.phase==='playing'&&s.startedAt!==null?Math.max(0,now-s.startedAt):0)}
export function resume(s:MazeSession,now:number):MazeSession{return s.phase==='ready'||s.phase==='paused'?{...s,phase:'playing',startedAt:now}:s}
export function pauseMaze(s:MazeSession,now:number):MazeSession{return s.phase==='playing'?{...s,phase:'paused',elapsedMs:activeMs(s,now),startedAt:null,hintCell:null}:s}
export function move(s:MazeSession,level:MazeLevel,dir:Direction,now:number):MazeSession{
  if(s.phase!=='playing'||!canMove(level.maze,s.position,dir))return s;
  const position=neighbor(s.position,dir),visited=[...new Set([...s.visited,position.row*level.cols+position.col])];
  const next={...s,position,visited,moves:s.moves+1,hintCell:null};
  return equal(position,level.maze.exit)?{...pauseMaze(next,now),phase:'completed'}:next;
}
export function hint(s:MazeSession,level:MazeLevel):MazeSession{
  if(s.phase!=='playing'||s.hints>=level.hintLimit)return s;
  const path=shortestPath(level.maze,s.position,level.maze.exit);
  return path && path.length>1?{...s,hints:s.hints+1,hintCell:path[1]!}:s;
}
export function mazeScore(s:MazeSession,level:MazeLevel){
  const bonus=s.phase==='completed'?Math.max(0,200-Math.floor(200*(s.elapsedMs/1000)/level.parSeconds)):0;
  return Math.max(0,1000-5*Math.max(0,s.moves-level.optimalMoves)-75*s.hints+bonus);
}
export function validMazeSession(value:unknown,level:MazeLevel):value is MazeSession{
  if(!value||typeof value!=='object')return false;
  const s=value as Partial<MazeSession>,m=level.maze;
  const validCell=(p:Cell|undefined|null)=>p!==undefined&&p!==null&&Number.isInteger(p.row)&&Number.isInteger(p.col)&&p.row>=0&&p.col>=0&&p.row<m.rows&&p.col<m.cols;
  return typeof s.runId==='string'&&s.runId.length>0&&s.levelId===level.id&&['ready','playing','paused'].includes(s.phase??'')&&validCell(s.position)&&
    Array.isArray(s.visited)&&s.visited.includes(0)&&s.visited.includes(s.position!.row*m.cols+s.position!.col)&&new Set(s.visited).size===s.visited.length&&s.visited.every(n=>Number.isInteger(n)&&n>=0&&n<m.cells.length)&&
    Number.isSafeInteger(s.moves)&&s.moves!>=0&&Number.isSafeInteger(s.hints)&&s.hints!>=0&&s.hints!<=level.hintLimit&&
    (s.hintCell===null||validCell(s.hintCell))&&typeof s.elapsedMs==='number'&&Number.isFinite(s.elapsedMs)&&s.elapsedMs>=0&&
    (s.startedAt===null||(typeof s.startedAt==='number'&&Number.isFinite(s.startedAt)));
}
