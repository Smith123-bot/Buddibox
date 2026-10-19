import AsyncStorage from '@react-native-async-storage/async-storage';
import { mazeLevels } from '../levels';
import { fresh } from '../session';
import { loadMazeProgress, mazeComplete, mazeUnlocked, resetMazeCacheForTests, sanitizeMaze, updateMazeProgress } from '../../../storage/mazeProgress';
const mockStore:Record<string,string>={};
jest.mock('@react-native-async-storage/async-storage',()=>({
  getItem:jest.fn((key:string)=>Promise.resolve(mockStore[key]??null)),
  setItem:jest.fn((key:string,value:string)=>{mockStore[key]=value;return Promise.resolve()}),
}));
const key='buddhibox.maze.v1',id=mazeLevels[0]!.id;
beforeEach(()=>{delete mockStore[key];resetMazeCacheForTests();jest.clearAllMocks()});
it('unlocks only after a saved valid clear and restores scores',async()=>{
  let p=await loadMazeProgress();expect(mazeUnlocked(p,0)).toBe(true);expect(mazeUnlocked(p,1)).toBe(false);
  p=await updateMazeProgress(v=>mazeComplete(v,id,'run-one',1140,45000));expect(mazeUnlocked(p,1)).toBe(true);
  resetMazeCacheForTests();expect((await loadMazeProgress()).records[id]?.bestScore).toBe(1140);
});
it('serializes writes and deduplicates a completed run',async()=>{
  await Promise.all([updateMazeProgress(p=>mazeComplete(p,id,'run-one',1100,60000)),updateMazeProgress(p=>mazeComplete(p,id,'run-one',1100,60000))]);
  expect((await loadMazeProgress()).records[id]?.clears).toBe(1);
  await updateMazeProgress(p=>mazeComplete(p,id,'run-two',900,50000));
  expect((await loadMazeProgress()).records[id]).toMatchObject({clears:2,bestScore:1100,bestMs:50000});
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
  expect(mockStore['buddhibox.difference.v1']).toBeUndefined();
});
it('isolates invalid records and pauses a restored session',()=>{
  const result=sanitizeMaze({version:1,records:{[id]:{clears:-1}},session:{...fresh(mazeLevels[0]!,'test'),phase:'playing',startedAt:1}});
  expect(result.records[id]).toBeUndefined();expect(result.session?.phase).toBe('paused');
  expect(sanitizeMaze({version:2}).records).toEqual({});
});
it('retains a legacy v1 clear and restores exactly one dated run event',async()=>{
  const old=await updateMazeProgress(p=>mazeComplete(p,id,'legacy',900,20000));expect(old.history).toEqual([]);
  const e={runId:'later',levelId:id,score:1100,elapsedMs:15000,completedAt:Date.now(),hints:1,effort:14};
  await updateMazeProgress(p=>mazeComplete(p,id,'later',1100,15000,e));
  resetMazeCacheForTests();const saved=await loadMazeProgress();expect(saved.records[id]?.clears).toBe(2);expect(saved.history).toEqual([e]);
});
