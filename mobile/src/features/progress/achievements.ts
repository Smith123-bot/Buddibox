import type { ProgressSummary } from './model';
export type AchievementId='FIRST_WIN'|'PUZZLE_EXPLORER'|'MAZE_MASTER'|'WORD_FINDER'|'DIFFERENCE_DETECTIVE'|'NO_HINTS';
export type Achievement={id:AchievementId;title:string;description:string;target:number;current:number;earned:boolean};
export function achievements(summary:ProgressSummary):Achievement[]{
  const game=(id:'difference'|'maze'|'word')=>summary.games.find(g=>g.id===id)?.completedUnique??0;
  // A completed Word Search puzzle proves all its target words were found, including legacy clears.
  const words=summary.distinctWordsFound;
  const noHints=summary.recent.some(e=>e.hints===0)?1:0;
  const definitions:[AchievementId,string,string,number,number][]=[
    ['FIRST_WIN','First Win','Complete your first puzzle in any game.',1,summary.totalUnique],
    ['PUZZLE_EXPLORER','Puzzle Explorer','Complete five distinct puzzles.',5,summary.totalUnique],
    ['MAZE_MASTER','Maze Master','Complete five distinct Maze Escape routes.',5,game('maze')],
    ['WORD_FINDER','Word Finder','Find fifteen words by completing distinct Word Search puzzles.',15,words],
    ['DIFFERENCE_DETECTIVE','Difference Detective','Complete three distinct Find the Difference scenes.',3,game('difference')],
    ['NO_HINTS','Clear Mind','Complete a recorded attempt without using a hint.',1,noHints],
  ];
  return definitions.map(([id,title,description,target,current])=>({id,title,description,target,current:Math.min(target,current),earned:current>=target}));
}
