import AsyncStorage from '@react-native-async-storage/async-storage';
import { levels } from '../levels';
import { newSession } from '../logic';
import { complete, isUnlocked, loadProgress, resetProgressCacheForTests, sanitize, updateProgress } from '../../../storage/differenceProgress';
const mockStore: Record<string,string>={};
jest.mock('@react-native-async-storage/async-storage',()=>({
  getItem:jest.fn((key:string)=>Promise.resolve(mockStore[key]??null)),
  setItem:jest.fn((key:string,value:string)=>{mockStore[key]=value;return Promise.resolve()}),
}));
const key='buddhibox.difference.v1';
beforeEach(()=>{delete mockStore[key];resetProgressCacheForTests();jest.clearAllMocks()});
it('unlocks only after a committed clear and restores records from storage',async()=>{
  const first=await loadProgress();expect(isUnlocked(first,0)).toBe(true);expect(isUnlocked(first,1)).toBe(false);
  await updateProgress(p=>complete(p,levels[0]!.id,620,80000));
  resetProgressCacheForTests();const restored=await loadProgress();
  expect(restored.records[levels[0]!.id]?.bestScore).toBe(620);
  expect(isUnlocked(restored,1)).toBe(true);
});
it('preserves best values and serializes overlapping writes',async()=>{
  const a=updateProgress(p=>complete(p,levels[0]!.id,510,80000));
  const b=updateProgress(p=>complete(p,levels[0]!.id,450,95000));
  await Promise.all([a,b]);const result=await loadProgress();
  expect(result.records[levels[0]!.id]).toMatchObject({completed:2,bestScore:510,bestMs:80000,lastScore:450});
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
});
it('discards corrupt records and resumes a saved playing session as paused',()=>{
  const value=sanitize({version:1,records:{[levels[0]!.id]:{completed:-4}},session:{...newSession(levels[0]!.id),phase:'playing',startedAt:4}});
  expect(value.records[levels[0]!.id]).toBeUndefined();expect(value.session?.phase).toBe('paused');
  expect(sanitize({version:5,records:{}}).records).toEqual({});
});
it('preserves legacy v1 records and saves new dated run metadata without duplicate rewards',async()=>{
  mockStore[key]=JSON.stringify({version:1,records:{[levels[0]!.id]:{completed:1,attempts:1,bestScore:520,bestMs:50000,lastScore:520,lastMs:50000}},session:null});
  const legacy=await loadProgress();expect(legacy.records[levels[0]!.id]?.completed).toBe(1);expect(legacy.history).toEqual([]);
  const event={runId:'difference-r2',levelId:levels[0]!.id,score:530,elapsedMs:45000,completedAt:Date.now(),hints:0,effort:2};
  await updateProgress(p=>complete(p,levels[0]!.id,530,45000,event));
  await updateProgress(p=>complete(p,levels[0]!.id,530,45000,event));
  resetProgressCacheForTests();const saved=await loadProgress();
  expect(saved.records[levels[0]!.id]?.completed).toBe(2);expect(saved.history).toEqual([event]);
});
