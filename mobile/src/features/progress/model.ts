import { levels } from '../difference/levels';
import { mazeLevels } from '../maze/levels';
import { puzzles } from '../word-search/puzzles';
import type { DifferenceProgress } from '../../storage/differenceProgress';
import type { MazeProgress } from '../../storage/mazeProgress';
import type { WordProgress } from '../../storage/wordProgress';
import type { RunEvent } from '../../storage/runEvents';
export type GameId='difference'|'maze'|'word';
export type ProgressSources={difference:DifferenceProgress|null;maze:MazeProgress|null;word:WordProgress|null};
export type RecentRun=RunEvent&{gameId:GameId;title:string};
export type GameSummary={id:GameId;title:string;completedUnique:number;totalLevels:number;clears:number;attempts:number;bestScore:number|null;unlocked:number;recent:RecentRun|null;recordedHints:number;recordedEffort:number|null};
export type ProgressSummary={games:GameSummary[];totalUnique:number;totalClears:number;totalAttempts:number;gamesPlayed:number;recent:RecentRun[];recordedHints:number;recordedWordFinds:number;distinctWordsFound:number;hasLegacyRuns:boolean};
function count(value:unknown){return Number.isSafeInteger(value)&&typeof value==='number'&&value>=0?value:0}
export function aggregate(sources:ProgressSources):ProgressSummary{
  const configs=[
    {id:'difference' as const,title:'Find the Difference',items:levels,progress:sources.difference,clears:'completed' as const},
    {id:'maze' as const,title:'Maze Escape',items:mazeLevels,progress:sources.maze,clears:'clears' as const},
    {id:'word' as const,title:'Word Search',items:puzzles,progress:sources.word,clears:'clears' as const},
  ];
  const recent:RecentRun[]=[];
  const games:GameSummary[]=configs.map(config=>{
    const rows=config.items.map(item=>{
      const raw=config.progress?.records[item.id] as {completed?:number;clears?:number;attempts?:number;bestScore?:number}|undefined;
      const clearCount=count(raw?.[config.clears]);return {item,clearCount,attempts:count(raw?.attempts),best:raw&&clearCount>0&&Number.isSafeInteger(raw.bestScore)&&raw.bestScore!>=0?raw.bestScore!:null};
    });
    const seen=new Set<string>();
    const goodHistory=(config.progress?.history??[]).filter(e=>{if(seen.has(e.runId)||!rows.some(row=>row.item.id===e.levelId&&row.clearCount>0))return false;seen.add(e.runId);return true});
    for(const event of goodHistory){
      const item=rows.find(row=>row.item.id===event.levelId)!.item;
      recent.push({...event,gameId:config.id,title:'title' in item?item.title:`Route ${item.number}`});
    }
    const completedUnique=rows.filter(r=>r.clearCount>0).length;
    const unlocked=config.id==='word'
      ?(['en','hi'] as const).reduce((n,lang)=>{const pack=puzzles.filter(p=>p.language===lang);return n+pack.filter((p,i)=>i===0||count(sources.word?.records[pack[i-1]!.id]?.clears)>0).length},0)
      :rows.filter((r,i)=>i===0||rows[i-1]!.clearCount>0).length;
    const scores=rows.map(r=>r.best).filter((n):n is number=>n!==null);
    return {id:config.id,title:config.title,completedUnique,totalLevels:rows.length,clears:rows.reduce((n,r)=>n+r.clearCount,0),attempts:rows.reduce((n,r)=>n+r.attempts,0),bestScore:scores.length?Math.max(...scores):null,unlocked,recent:null,recordedHints:goodHistory.reduce((n,e)=>n+count(e.hints),0),recordedEffort:config.id==='word'?null:goodHistory.reduce((n,e)=>n+count(e.effort),0)} satisfies GameSummary;
  });
  recent.sort((a,b)=>b.completedAt-a.completedAt||a.gameId.localeCompare(b.gameId)||a.runId.localeCompare(b.runId));
  for(const game of games)game.recent=recent.find(r=>r.gameId===game.id)??null;
  const distinctWordsFound=puzzles.filter(p=>count(sources.word?.records[p.id]?.clears)>0).reduce((n,p)=>n+p.targets.length,0);
  const recordedWordFinds=recent.filter(e=>e.gameId==='word').reduce((n,event)=>n+(puzzles.find(p=>p.id===event.levelId)?.targets.length??0),0);
  return {games,totalUnique:games.reduce((n,g)=>n+g.completedUnique,0),totalClears:games.reduce((n,g)=>n+g.clears,0),totalAttempts:games.reduce((n,g)=>n+g.attempts,0),gamesPlayed:games.filter(g=>g.attempts>0||g.clears>0).length,recent,recordedHints:games.reduce((n,g)=>n+g.recordedHints,0),recordedWordFinds,distinctWordsFound,hasLegacyRuns:games.some(g=>g.clears>recent.filter(r=>r.gameId===g.id).length)};
}
