import { puzzles, validatePuzzle } from '../puzzles';
const segment=(text:string)=>[...new Intl.Segmenter('hi',{granularity:'grapheme'}).segment(text.normalize('NFC'))].map(p=>p.segment);
it('documents how matras and conjuncts are segmented by build-time ICU',()=>{
  expect(segment('कमल')).toEqual(['क','म','ल']);
  expect(segment('किताब')).toEqual(['कि','ता','ब']);
  expect(segment('किसान')).toEqual(['कि','सा','न']);
  expect(segment('भारत')).toEqual(['भा','र','त']);
  expect(segment('विद्यालय')).toEqual(['वि','द्या','ल','य']);
  expect(segment('शक्ति')).toEqual(['श','क्ति']);
  expect(segment('प्रकाश')).toEqual(['प्र','का','श']);
  expect(segment('क्षमा')).toEqual(['क्ष','मा']);
  expect(segment('चिड़िया')).toEqual(['चि','ड़ि','या']);
});
it('normalizes canonical forms and round-trips every shipped token without relying on Hermes segmentation',()=>{
  expect('क़'.normalize('NFC')).toBe('क़');
  for(const p of puzzles){
    expect(validatePuzzle(p)).toEqual([]);
    for(const t of p.targets){
      expect(t.tokens).toEqual(segment(t.display));
      expect(t.tokens.join('').normalize('NFC')).toBe(t.display.normalize('NFC'));
    }
    for(const row of p.grid)for(const token of row)expect(segment(token)).toEqual([token]);
  }
});
it('rejects unsupported standalone marks and corrupt tokens',()=>{
  const p=puzzles.find(p=>p.language==='hi')!;
  expect(validatePuzzle({...p,grid:[['\u093f',...p.grid[0]!.slice(1)],...p.grid.slice(1)]})).toContain('invalid grid');
  expect(validatePuzzle({...p,targets:[{...p.targets[0]!,tokens:['किताब']},...p.targets.slice(1)]})).not.toEqual([]);
});
