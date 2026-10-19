import { canMove, directionBetween, generateMaze, inside, neighbor, shortestPath, validateMaze, NORTH } from '../engine';
import { mazeLevels } from '../levels';
describe('deterministic maze creation',()=>{
  it('repeats with the same seed, varies with a different seed and rejects invalid dimensions',()=>{
    expect(generateMaze(8,8,123)).toEqual(generateMaze(8,8,123));
    expect(generateMaze(8,8,124).cells).not.toEqual(generateMaze(8,8,123).cells);
    expect(()=>generateMaze(1,8,123)).toThrow();expect(()=>generateMaze(16,8,123)).toThrow();
  });
  it('validates all shipped levels and their BFS paths',()=>{
    for(const l of mazeLevels){
      expect(validateMaze(l.maze)).toEqual([]);
      const path=shortestPath(l.maze,l.maze.start,l.maze.exit)!;
      expect(path.length-1).toBe(l.optimalMoves);
      for(let i=1;i<path.length;i++)expect(canMove(l.maze,path[i-1]!,directionBetween(path[i-1]!,path[i]!)!)).toBe(true);
      expect(l.maze.cells).toHaveLength(l.rows*l.cols);
      if(l.number>1)expect(l.optimalMoves).toBeGreaterThanOrEqual(mazeLevels[l.number-2]!.optimalMoves);
    }
  });
  it('detects out-of-bounds openings, disconnected exit, invalid endpoints and asymmetric walls',()=>{
    const base=generateMaze(3,3,1);
    expect(validateMaze({...base,cells:[base.cells[0]!|NORTH,...base.cells.slice(1)]})).toContain('open boundary');
    expect(validateMaze({...base,start:base.exit})).toContain('invalid endpoints');
    expect(validateMaze({...base,cells:base.cells.map(()=>0)})).toContain('exit unreachable');
    expect(validateMaze({...base,cells:[base.cells[0]!^2,...base.cells.slice(1)]})).not.toEqual([]);
    expect(validateMaze({...base,rows:0})).toContain('invalid dimensions');
  });
  it('BFS returns shortest path in an open square and rejects an unreachable exit',()=>{
    const m={rows:2,cols:2,cells:[6,12,3,9],start:{row:0,col:0},exit:{row:1,col:1}};
    expect(shortestPath(m,m.start,m.exit)).toHaveLength(3);
    expect(shortestPath({...m,cells:[0,0,0,0]},m.start,m.exit)).toBeNull();
    expect(inside(m,{row:-1,col:0})).toBe(false);
    expect(neighbor(m.start,'north')).toEqual({row:-1,col:0});
  });
});
