import { pack } from '../puzzles';
import { freshWord } from '../session';
import { loadWordProgress, resetWordCacheForTests, sanitizeWord, updateWordProgress, wordComplete, wordUnlocked } from '../../../storage/wordProgress';
const mockStore:Record<string,string>={};
jest.mock('@react-native-async-storage/async-storage',()=>({getItem:jest.fn((key:string)=>Promise.resolve(mockStore[key]??null)),setItem:jest.fn((key:string,val:string)=>{mockStore[key]=val;return Promise.resolve()})}));
const key='buddhibox.word.v1',en=pack('en')[0]!,hi=pack('hi')[0]!;
beforeEach(()=>{delete mockStore[key];resetWordCacheForTests();jest.clearAllMocks()});
it('keeps language unlock tracks separate and saves independently of other games',async()=>{
  let p=await loadWordProgress();expect(wordUnlocked(p,'en',0)).toBe(true);expect(wordUnlocked(p,'hi',0)).toBe(true);
  expect(wordUnlocked(p,'en',1)).toBe(false);expect(wordUnlocked(p,'hi',1)).toBe(false);
  await updateWordProgress(value=>wordComplete(value,en.id,'run-en',450,52000));
  resetWordCacheForTests();p=await loadWordProgress();expect(wordUnlocked(p,'en',1)).toBe(true);expect(wordUnlocked(p,'hi',1)).toBe(false);
  expect(mockStore['buddhibox.maze.v1']).toBeUndefined();expect(mockStore['buddhibox.difference.v1']).toBeUndefined();
});
it('deduplicates completion, persists chosen language, preserves best score and time',async()=>{
  await Promise.all([updateWordProgress(p=>wordComplete({...p,selectedLanguage:'hi'},hi.id,'first',460,60000)),updateWordProgress(p=>wordComplete(p,hi.id,'first',460,60000))]);
  await updateWordProgress(p=>wordComplete(p,hi.id,'second',400,45000));
  resetWordCacheForTests();const p=await loadWordProgress();expect(p.selectedLanguage).toBe('hi');
  expect(p.records[hi.id]).toMatchObject({clears:2,bestScore:460,bestMs:45000});
});
it('ignores corrupted data and safely pauses restored sessions',()=>{
  const p=sanitizeWord({version:1,selectedLanguage:'unknown',records:{[en.id]:{clears:-3}},session:{...freshWord(en,'run'),phase:'playing',startedAt:50}});
  expect(p.selectedLanguage).toBe('en');expect(p.records[en.id]).toBeUndefined();expect(p.session?.phase).toBe('paused');
  expect(sanitizeWord({version:9}).records).toEqual({});
});
it('restores selected language and a dated zero-hint run without modifying old scores',async()=>{
  await updateWordProgress(p=>wordComplete(p,en.id,'legacy',300,90000));
  const e={runId:'new',levelId:hi.id,score:490,elapsedMs:60000,completedAt:Date.now(),hints:0};
  await updateWordProgress(p=>wordComplete({...p,selectedLanguage:'hi'},hi.id,'new',490,60000,e));
  resetWordCacheForTests();const saved=await loadWordProgress();
  expect(saved.selectedLanguage).toBe('hi');expect(saved.records[en.id]?.bestScore).toBe(300);
  expect(saved.history).toEqual([e]);
});
