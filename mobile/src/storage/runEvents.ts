/** Optional completion metadata; legacy saves do not contain these events. */
export type RunEvent={runId:string;levelId:string;score:number;elapsedMs:number;completedAt:number;hints:number;effort?:number};
export function sanitizeEvents(value:unknown, validIds:ReadonlySet<string>, records:Record<string,unknown>):RunEvent[]{
  if(!Array.isArray(value))return [];
  const seen=new Set<string>(),events:RunEvent[]=[];
  for(const item of value){
    if(!item||typeof item!=='object')continue;
    const e=item as Partial<RunEvent>;
    if(typeof e.runId!=='string'||!e.runId||typeof e.levelId!=='string'||!validIds.has(e.levelId)||!records[e.levelId]||seen.has(e.runId)||
      !Number.isSafeInteger(e.score)||e.score!<0||!Number.isFinite(e.elapsedMs)||e.elapsedMs!<0||!Number.isSafeInteger(e.hints)||e.hints!<0||
      !Number.isSafeInteger(e.completedAt)||e.completedAt!<=0||e.completedAt!>Date.now()+86400000||
      (e.effort!==undefined&&(!Number.isSafeInteger(e.effort)||e.effort<0)))continue;
    seen.add(e.runId);events.push(e as RunEvent);
  }
  return events;
}
export function appendEvent(history:readonly RunEvent[],event:RunEvent){return history.some(e=>e.runId===event.runId)?[...history]:[...history,event]}
