import AsyncStorage from '@react-native-async-storage/async-storage';
import { achievements, type AchievementId } from '../features/progress/achievements';
import type { ProgressSummary } from '../features/progress/model';
const KEY='buddhibox.achievements.v1';
export type Grants={version:1;earned:Partial<Record<AchievementId,number>>};
const empty=():Grants=>({version:1,earned:{}});
export function sanitizeGrants(value:unknown):Grants{
  const out=empty();if(!value||typeof value!=='object'||(value as Grants).version!==1)return out;
  const raw=(value as Grants).earned;if(!raw||typeof raw!=='object')return out;
  for(const id of ['FIRST_WIN','PUZZLE_EXPLORER','MAZE_MASTER','WORD_FINDER','DIFFERENCE_DETECTIVE','NO_HINTS'] as const){
    const at=raw[id];if(Number.isSafeInteger(at)&&at!>0&&at!<=Date.now()+86400000)out.earned[id]=at;
  }
  return out;
}
export function evaluateGrants(grants:Grants,summary:ProgressSummary,now:number):Grants{
  const earned={...grants.earned};for(const a of achievements(summary))if(a.earned&&!earned[a.id])earned[a.id]=now;
  return {version:1,earned};
}
let queue:Promise<unknown>=Promise.resolve(),cache:Grants|null=null;
export function loadGrants():Promise<Grants>{return queue.then(async()=>{if(cache)return cache;const raw=await AsyncStorage.getItem(KEY);try{cache=sanitizeGrants(raw?JSON.parse(raw):null)}catch{cache=empty()}return cache})}
export function reconcileGrants(summary:ProgressSummary,now=Date.now()):Promise<Grants>{
  const task=queue.then(async()=>{let raw=cache;if(!raw){const stored=await AsyncStorage.getItem(KEY);try{raw=sanitizeGrants(stored?JSON.parse(stored):null)}catch{raw=empty()}}
    const next=evaluateGrants(raw,summary,now);
    if(Object.keys(next.earned).length!==Object.keys(raw.earned).length)await AsyncStorage.setItem(KEY,JSON.stringify(next));
    cache=next;return next;
  });queue=task.catch(()=>{});return task;
}
export function resetAchievementCacheForTests(){queue=Promise.resolve();cache=null}
