import AsyncStorage from '@react-native-async-storage/async-storage';
import { readSavedJson } from '../../../storage/safeRead';
import { loadProgress, resetProgressCacheForTests, updateProgress } from '../../../storage/differenceProgress';
import { loadMazeProgress, resetMazeCacheForTests, updateMazeProgress } from '../../../storage/mazeProgress';
import { loadWordProgress, resetWordCacheForTests, updateWordProgress } from '../../../storage/wordProgress';
const mockStore:Record<string,string>={};
let mockIoFailure=false;
let mockWriteFailure=false;
jest.mock('@react-native-async-storage/async-storage',()=>({
  getItem:jest.fn((key:string)=>mockIoFailure?Promise.reject(new Error('I/O failure')):Promise.resolve(mockStore[key]??null)),
  setItem:jest.fn((key:string,value:string)=>{if(mockWriteFailure)return Promise.reject(new Error('write failed'));mockStore[key]=value;return Promise.resolve()}),
}));
beforeEach(()=>{mockIoFailure=false;mockWriteFailure=false;for(const k of Object.keys(mockStore))delete mockStore[k];resetProgressCacheForTests();resetMazeCacheForTests();resetWordCacheForTests();jest.clearAllMocks()});
it('distinguishes missing data from malformed and unsupported saves',async()=>{
  expect(await readSavedJson('none')).toBeNull();
  mockStore.bad='{broken';await expect(readSavedJson('bad')).rejects.toThrow('unreadable');
  mockStore.bad=JSON.stringify({version:2,records:{}});await expect(readSavedJson('bad')).rejects.toThrow('unsupported version');
});
it('does not overwrite a corrupt or future-version game save',async()=>{
  const cases=[
    ['buddhibox.difference.v1',loadProgress,()=>updateProgress(p=>p)],
    ['buddhibox.maze.v1',loadMazeProgress,()=>updateMazeProgress(p=>p)],
    ['buddhibox.word.v1',loadWordProgress,()=>updateWordProgress(p=>p)],
  ] as const;
  for(const [key,load,update] of cases){
    mockStore[key]=JSON.stringify({version:2,records:{player:'retain'}});
    await expect(load()).rejects.toThrow('unsupported version');
    // Each queue must reject rather than writing a replacement empty save.
    await expect(update()).rejects.toThrow('unsupported version');
    expect(mockStore[key]).toContain('retain');
  }
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});
it('keeps the last committed saves after failed writes and accepts a later retry',async()=>{
  const stores=[
    ['buddhibox.difference.v1',()=>updateProgress(p=>p)],
    ['buddhibox.maze.v1',()=>updateMazeProgress(p=>p)],
    ['buddhibox.word.v1',()=>updateWordProgress(p=>p)],
  ] as const;
  for(const [key,update] of stores){
    mockWriteFailure=true;
    await expect(update()).rejects.toThrow('write failed');
    expect(mockStore[key]).toBeUndefined();
    mockWriteFailure=false;
    await update();
    expect(JSON.parse(mockStore[key]!).version).toBe(1);
  }
});
it('does not treat transient storage I/O failure as a new player',async()=>{
  mockIoFailure=true;
  await expect(loadMazeProgress()).rejects.toThrow('I/O failure');
  await expect(updateMazeProgress((p)=>p)).rejects.toThrow('I/O failure');
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});
