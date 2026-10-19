import { directionBetween, shortestPath, type Direction } from '../engine';
import { mazeLevels } from '../levels';
import { activeMs, fresh, hint, mazeScore, move, pauseMaze, resume, validMazeSession } from '../session';
const level=mazeLevels[0]!;
it('blocks walls/bounds, counts only legal steps, and cannot move while paused',()=>{
  let s=resume(fresh(level,'run-1'),1000);
  expect(move(s,level,'north',1200)).toBe(s);
  const path=shortestPath(level.maze,level.maze.start,level.maze.exit)!;
  const dir=directionBetween(path[0]!,path[1]!)!;
  s=move(s,level,dir,1500);expect(s.moves).toBe(1);expect(s.position).toEqual(path[1]);
  const stopped=pauseMaze(s,2000);expect(move(stopped,level,dir,3000)).toBe(stopped);
  expect(activeMs(stopped,99999)).toBe(1000);
  expect(activeMs(resume(stopped,10000),11000)).toBe(2000);
});
it('hints from the current position toward the exit without moving and charges at most three',()=>{
  let s=resume(fresh(level,'run-hint'),0);
  const position=s.position;
  for(let i=0;i<3;i++){
    s=hint(s,level);expect(s.hintCell).toBeTruthy();
    expect(s.hintCell).toEqual(shortestPath(level.maze,position,level.maze.exit)![1]);
    expect(s.position).toEqual(position);
  }
  expect(s.hints).toBe(3);expect(hint(s,level)).toBe(s);
});
it('completes exactly once at the exit, stops timing and supports clean restart',()=>{
  let s=resume(fresh(level,'run-complete'),1000);
  const path=shortestPath(level.maze,level.maze.start,level.maze.exit)!;
  for(let i=1;i<path.length;i++)s=move(s,level,directionBetween(path[i-1]!,path[i]!) as Direction,1000+i*100);
  expect(s.phase).toBe('completed');expect(s.moves).toBe(path.length-1);
  expect(activeMs(s,999999)).toBe((path.length-1)*100);
  expect(move(s,level,'north',999999)).toBe(s);
  expect(mazeScore(s,level)).toBeGreaterThan(0);
  const reset=fresh(level,'new-run');expect(reset.moves).toBe(0);expect(reset.position).toEqual(level.maze.start);
  expect(reset.hints).toBe(0);expect(reset.elapsedMs).toBe(0);
});
it('floors score and rejects corrupted sessions',()=>{
  const bad={...fresh(level,'id'),hints:3,moves:100000,elapsedMs:9999999};expect(mazeScore(bad,level)).toBe(0);
  expect(validMazeSession({...bad,position:{row:-1,col:0}},level)).toBe(false);
  expect(validMazeSession({...bad,moves:-1},level)).toBe(false);
  expect(validMazeSession(fresh(level,'id'),level)).toBe(true);
});
it('every shipped route can be cleared by legal movement without a hint',()=>{
  for(const item of mazeLevels){
    const path=shortestPath(item.maze,item.maze.start,item.maze.exit)!;
    let run=resume(fresh(item,`proof-${item.id}`),0);
    for(let i=1;i<path.length;i++)run=move(run,item,directionBetween(path[i-1]!,path[i]!)!,i*100);
    expect(run.phase).toBe('completed');expect(run.moves).toBe(item.optimalMoves);
  }
});
