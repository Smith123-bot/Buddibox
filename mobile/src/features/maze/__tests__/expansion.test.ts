import { mazeDifficulty, mazeLevels } from '../levels';
import { directionBetween, generateMaze, shortestPath, validateMaze } from '../engine';
import { fresh, move, resume } from '../session';
import { mazeComplete, mazeUnlocked, sanitizeMaze } from '../../../storage/mazeProgress';
jest.mock('@react-native-async-storage/async-storage',()=>({getItem:jest.fn(),setItem:jest.fn()}));

it('ships 100 distinct deterministic solvable routes with calibrated stages', () => {
  expect(mazeLevels).toHaveLength(100);
  expect(new Set(mazeLevels.map(level=>level.id)).size).toBe(100);
  expect(new Set(mazeLevels.map(level=>`${level.rows}x${level.cols}:${level.maze.cells.join(',')}`)).size).toBe(100);
  for(const level of mazeLevels){
    expect(level.id).toBe(`path-${String(level.number).padStart(3,'0')}`);
    expect(level.difficulty).toBe(mazeDifficulty(level.number));
    expect(level.maze).toEqual(generateMaze(level.rows,level.cols,level.seed));
    expect(validateMaze(level.maze)).toEqual([]);
    const path=shortestPath(level.maze,level.maze.start,level.maze.exit)!;
    expect(path.length-1).toBe(level.optimalMoves);
    if(level.number>1)expect(level.optimalMoves).toBeGreaterThanOrEqual(mazeLevels[level.number-2]!.optimalMoves);
    // Every path remains playable through the existing movement rules.
    let session=resume(fresh(level,`verified-${level.id}`),0);
    for(let i=1;i<path.length;i++)session=move(session,level,directionBetween(path[i-1]!,path[i]!)!,i*100);
    expect(session.phase).toBe('completed');
  }
  expect(mazeLevels[0]?.optimalMoves).toBe(8);
  expect(mazeLevels[7]?.optimalMoves).toBe(42);
  expect(mazeLevels[99]?.optimalMoves).toBeGreaterThanOrEqual(90);
  expect(Math.max(...mazeLevels.map(level=>level.cols))).toBe(11);
});

it('retains legacy records and session IDs; only committed clears unlock successive routes', () => {
  const first=mazeLevels[0]!,second=mazeLevels[1]!,third=mazeLevels[2]!;
  const legacy=sanitizeMaze({version:1,records:{[first.id]:{clears:1,attempts:1,bestScore:1000,bestMs:80000,lastScore:1000,lastMs:80000,lastRunId:'old'}},session:fresh(second,'resumed')});
  expect(legacy.records[first.id]?.bestScore).toBe(1000);
  expect(legacy.session?.runId).toBe('resumed');
  expect(mazeUnlocked(legacy,0)).toBe(true);
  expect(mazeUnlocked(legacy,1)).toBe(true);
  expect(mazeUnlocked(legacy,2)).toBe(false);
  const cleared=mazeComplete(legacy,second.id,'new',950,90000);
  expect(mazeUnlocked(cleared,2)).toBe(true);
  expect(mazeUnlocked(legacy,2)).toBe(false);
  expect(mazeComplete(cleared,second.id,'new',950,90000)).toBe(cleared);
  expect(mazeComplete(cleared,third.id,'',950,90000)).toBe(cleared);
  expect(cleared.records[first.id]?.bestScore).toBe(1000);
  expect(mazeUnlocked(cleared,99)).toBe(false);
});
