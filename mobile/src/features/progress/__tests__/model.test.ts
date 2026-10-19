import { aggregate } from '../model';
import { achievements } from '../achievements';
import { complete, sanitize as sanitizeDifference } from '../../../storage/differenceProgress';
import { mazeComplete, sanitizeMaze } from '../../../storage/mazeProgress';
import { wordComplete, sanitizeWord } from '../../../storage/wordProgress';
import { mazeLevels } from '../../maze/levels';
import { pack } from '../../word-search/puzzles';
jest.mock('@react-native-async-storage/async-storage',()=>({getItem:jest.fn(),setItem:jest.fn()}));
const empty=()=>({difference:sanitizeDifference(null),maze:sanitizeMaze(null),word:sanitizeWord(null)});
const event=(runId:string,levelId:string,completedAt:number,hints=1)=>({runId,levelId,score:500,elapsedMs:10000,completedAt,hints});
it('has three actual games, no invented scores, dates or achievements for a new player',()=>{
  const s=aggregate(empty());expect(s.games.map(g=>g.id)).toEqual(['difference','maze','word']);
  expect(s.totalUnique).toBe(0);expect(s.totalClears).toBe(0);expect(s.gamesPlayed).toBe(0);
  expect(s.recent).toEqual([]);expect(s.games.every(g=>g.bestScore===null)).toBe(true);
  expect(s.games.map(g=>g.unlocked)).toEqual([1,1,2]);
  expect(achievements(s).every(a=>!a.earned&&a.current===0)).toBe(true);
});
it('aggregates legacy clears without inventing dated runs or hint-free achievements',()=>{
  const sources=empty();sources.difference=complete(sources.difference,'garden-001',400,10000);
  const s=aggregate(sources);expect(s.totalUnique).toBe(1);expect(s.totalClears).toBe(1);
  expect(s.recent).toEqual([]);expect(s.hasLegacyRuns).toBe(true);
  expect(s.games[0]).toMatchObject({completedUnique:1,unlocked:2,bestScore:400});
  expect(achievements(s).find(a=>a.id==='FIRST_WIN')?.earned).toBe(true);
  expect(achievements(s).find(a=>a.id==='NO_HINTS')?.earned).toBe(false);
});
it('combines real runs in date order and ignores duplicate history IDs',()=>{
  const sources=empty(),t=Date.now()-100000;
  sources.difference=complete(sources.difference,'garden-001',500,12000,event('d1','garden-001',t,0));
  sources.maze=mazeComplete(sources.maze,mazeLevels[0]!.id,'m1',650,11000,event('m1',mazeLevels[0]!.id,t+2000,2));
  sources.word=wordComplete(sources.word,pack('hi')[0]!.id,'w1',550,9000,event('w1',pack('hi')[0]!.id,t+1000,1));
  sources.maze.history.push(sources.maze.history[0]!); // malformed duplicate input, no double recent result
  const s=aggregate(sources);
  expect(s.gamesPlayed).toBe(3);expect(s.totalUnique).toBe(3);
  expect(s.recent.map(r=>r.runId)).toEqual(['m1','w1','d1']);
  expect(s.recordedHints).toBe(3);expect(s.distinctWordsFound).toBe(3);
  expect(achievements(s).find(a=>a.id==='NO_HINTS')?.earned).toBe(true);
});
it('tracks thresholds by distinct IDs, not repeated clears, with partial progress',()=>{
  const sources=empty();let p=sources.maze;
  p=mazeComplete(p,mazeLevels[0]!.id,'one',500,10000);
  p=mazeComplete(p,mazeLevels[0]!.id,'two',600,11000);
  sources.maze=p;
  let s=aggregate(sources);expect(s.games[1]).toMatchObject({completedUnique:1,clears:2,unlocked:2});
  expect(achievements(s).find(a=>a.id==='MAZE_MASTER')).toMatchObject({current:1,target:5,earned:false});
  for(let i=1;i<5;i++)sources.maze=mazeComplete(sources.maze,mazeLevels[i]!.id,`more-${i}`,700,10000);
  s=aggregate(sources);expect(achievements(s).find(a=>a.id==='MAZE_MASTER')?.earned).toBe(true);
  expect(achievements(s).find(a=>a.id==='PUZZLE_EXPLORER')?.earned).toBe(true);
  const word=pack('en');for(let i=0;i<5;i++)sources.word=wordComplete(sources.word,word[i]!.id,`word-${i}`,300,10000);
  expect(achievements(aggregate(sources)).find(a=>a.id==='WORD_FINDER')?.earned).toBe(true);
});
it('sanitizes negative/unknown records and invalid dated metadata',()=>{
  const sources=empty();sources.word=sanitizeWord({version:1,records:{'en-001':{clears:-2},'made-up':{clears:999}}});
  expect(aggregate(sources).games[2]).toMatchObject({completedUnique:0,clears:0,attempts:0});
  const legacy=wordComplete(sources.word,'en-001','r',200,10000);
  const sanitized=sanitizeWord({...legacy,history:[{...event('r','en-001',Date.now()),completedAt:-1},event('fake','missing',Date.now())]});
  expect(aggregate({...sources,word:sanitized}).recent).toHaveLength(0);
});
