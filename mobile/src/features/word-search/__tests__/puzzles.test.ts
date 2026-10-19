import { getPuzzle, line, pack, puzzles, validatePuzzle } from '../puzzles';
it('ships five deterministic, path-valid puzzles in each language',()=>{
  expect(pack('en')).toHaveLength(5);expect(pack('hi')).toHaveLength(5);
  expect(new Set(puzzles.map(p=>p.id)).size).toBe(10);
  for(const p of puzzles){expect(getPuzzle(p.id)).toBe(p);expect(validatePuzzle(p)).toEqual([]);expect(p.targets).toHaveLength(3)}
});
it('rejects invalid bounds, diagonal angle, conflicts and duplicated paths',()=>{
  expect(line({row:0,col:0},{row:2,col:1})).toBeNull();
  expect(line({row:1,col:1},{row:1,col:3})).toEqual([{row:1,col:1},{row:1,col:2},{row:1,col:3}]);
  const p=puzzles[0]!,target=p.targets[0]!;
  expect(validatePuzzle({...p,targets:[{...target,cells:[{row:99,col:0},...target.cells.slice(1)]},...p.targets.slice(1)]})).toContain(`invalid placement: ${target.id}`);
  expect(validatePuzzle({...p,grid:[['X',...p.grid[0]!.slice(1)],...p.grid.slice(1)],targets:[{...target,cells:[{row:0,col:0},...target.cells.slice(1)]},...p.targets.slice(1)]})).not.toEqual([]);
  expect(validatePuzzle({...p,targets:[target,target,...p.targets.slice(1)]})).toContain('duplicate target ID');
  expect(validatePuzzle({...p,targets:[{...target,cells:[],tokens:[],display:''},...p.targets.slice(1)]})).toContain(`invalid placement: ${target.id}`);
});
