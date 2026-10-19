import AsyncStorage from '@react-native-async-storage/async-storage';
import { aggregate } from '../model';
import { achievements } from '../achievements';
import { complete, sanitize as sanitizeDifference } from '../../../storage/differenceProgress';
import { sanitizeMaze } from '../../../storage/mazeProgress';
import { sanitizeWord } from '../../../storage/wordProgress';
import { evaluateGrants, loadGrants, reconcileGrants, resetAchievementCacheForTests, sanitizeGrants } from '../../../storage/achievementProgress';
const mockStore:Record<string,string>={};
jest.mock('@react-native-async-storage/async-storage',()=>({getItem:jest.fn((key:string)=>Promise.resolve(mockStore[key]??null)),setItem:jest.fn((key:string,value:string)=>{mockStore[key]=value;return Promise.resolve()})}));
const KEY='buddhibox.achievements.v1';
beforeEach(()=>{delete mockStore[KEY];resetAchievementCacheForTests();jest.clearAllMocks()});
const summary=()=>aggregate({difference:complete(sanitizeDifference(null),'garden-001',400,10000),maze:sanitizeMaze(null),word:sanitizeWord(null)});
it('grants a first win once, survives restart and never rewrites an earned date',async()=>{
  const first=await reconcileGrants(summary(),12345);
  expect(first.earned.FIRST_WIN).toBe(12345);expect(Object.keys(first.earned)).toHaveLength(1);
  expect((await reconcileGrants(summary(),99999)).earned.FIRST_WIN).toBe(12345);
  resetAchievementCacheForTests();expect((await loadGrants()).earned.FIRST_WIN).toBe(12345);
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
});
it('does not grant unsupported or unproven no-hint achievements',()=>{
  const badges=achievements(summary());expect(badges.find(b=>b.id==='WORD_FINDER')?.earned).toBe(false);
  expect(badges.find(b=>b.id==='NO_HINTS')?.earned).toBe(false);
  expect(evaluateGrants({version:1,earned:{}},summary(),10).earned.NO_HINTS).toBeUndefined();
});
it('handles corrupted grant data and older versions without overwriting game progress',async()=>{
  mockStore[KEY]='{invalid json';
  expect((await reconcileGrants(summary(),500)).earned.FIRST_WIN).toBe(500);
  expect(sanitizeGrants({version:2,earned:{FIRST_WIN:100}}).earned).toEqual({});
  expect(mockStore['buddhibox.difference.v1']).toBeUndefined();
});
