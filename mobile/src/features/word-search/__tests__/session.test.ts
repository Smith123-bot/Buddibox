import { puzzles, line } from '../puzzles';
import { chooseCell, freshWord, hintWord, pauseWord, resumeWord, validWordSession, wordElapsed, wordScore } from '../session';
const p=puzzles[0]!;
it('selects every shipped word forward or reverse; invalid and duplicate paths do not score',()=>{
  for(const puzzle of puzzles){let s=resumeWord(freshWord(puzzle,'run'),0);
    for(const [i,t] of puzzle.targets.entries()){
      let result=chooseCell(s,puzzle,t.cells[t.cells.length-1]!,100);
      expect(result.kind).toBe('start');
      result=chooseCell(result.session,puzzle,t.cells[0]!,200+i*50);
      expect(result.kind).toBe('found');s=result.session;
      if(i===0){const a=chooseCell(s,puzzle,t.cells[0]!,250);expect(chooseCell(a.session,puzzle,t.cells.at(-1)!,300).kind).toBe('duplicate')}
    }
    expect(s.phase).toBe('completed');expect(s.found).toHaveLength(puzzle.targets.length);
  }
  let s=resumeWord(freshWord(p,'x'),0);
  expect(chooseCell(s,p,{row:-1,col:0},20).kind).toBe('ignored');
  const a=chooseCell(s,p,{row:0,col:0},30);expect(chooseCell(a.session,p,{row:2,col:1},40).kind).toBe('invalid');
});
it('supports horizontal, vertical and diagonal lines and rejects out-of-grid endpoints',()=>{
  expect(line({row:0,col:0},{row:2,col:2})).toHaveLength(3);
  expect(line({row:2,col:2},{row:0,col:2})).toEqual([{row:2,col:2},{row:1,col:2},{row:0,col:2}]);
  expect(puzzles.flatMap(p=>p.targets.map(t=>line(t.cells[0]!,t.cells.at(-1)!)!)).every(path=>path.length>=2)).toBe(true);
});
it('hints do not find words, timer pauses and scores clamp at zero',()=>{
  let s=resumeWord(freshWord(p,'x'),1000);
  s=hintWord(s,p);expect(s.hints).toBe(1);expect(s.found).toHaveLength(0);expect(s.hintId).toBe(p.targets[0]!.id);
  s=hintWord(s,p);expect(s.hints).toBe(2);expect(hintWord(s,p)).toBe(s);
  expect(wordScore(s,p)).toBe(0);
  s=pauseWord(s,2000);expect(wordElapsed(s,10000)).toBe(1000);
  expect(wordElapsed(resumeWord(s,10000),11000)).toBe(2000);
  expect(freshWord(p,'new').found).toEqual([]);
});
it('rejects corrupted saved sessions',()=>{
  expect(validWordSession({...freshWord(p,'x'),found:['missing']},p)).toBe(false);
  expect(validWordSession({...freshWord(p,'x'),selection:{row:99,col:0}},p)).toBe(false);
  expect(validWordSession(freshWord(p,'x'),p)).toBe(true);
});
