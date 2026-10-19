import generated from './content/routes-009-100.json';
import { generateMaze, shortestPath, validateMaze, type Maze } from './engine';

export type MazeDifficulty = 'Beginner'|'Easy'|'Medium'|'Hard'|'Expert'|'Master';
export type MazeLevel={id:string;number:number;difficulty:MazeDifficulty;rows:number;cols:number;seed:number;parSeconds:number;hintLimit:number;contentVersion:1;maze:Maze;optimalMoves:number};
// Original routes and seeds are immutable: changing them would invalidate saved sessions.
const original=[
  [4,4,2,90],[4,5,1,100],[5,5,2,120],[5,6,1,140],
  [6,6,5,155],[7,7,7,175],[8,8,23,210],[9,9,17,240],
] as const;
export function mazeDifficulty(number:number):MazeDifficulty {
  if(number<=10)return 'Beginner';
  if(number<=25)return 'Easy';
  if(number<=50)return 'Medium';
  if(number<=75)return 'Hard';
  if(number<=90)return 'Expert';
  return 'Master';
}
const configs=[...original.map(([rows,cols,seed,parSeconds],i)=>({number:i+1,rows,cols,seed,parSeconds})),...generated];
export const mazeLevels:readonly MazeLevel[]=configs.map(({number,rows,cols,seed,parSeconds})=>{
  const id=`path-${String(number).padStart(3,'0')}`;
  const maze=generateMaze(rows,cols,seed),errors=validateMaze(maze);
  if(errors.length)throw Error(`Invalid maze ${id}: ${errors.join(', ')}`);
  const path=shortestPath(maze,maze.start,maze.exit)!;
  const compiled=generated[number-9];
  if(number>8&&(compiled?.number!==number||compiled.optimalMoves!==path.length-1||compiled.deadEnds!==maze.cells.filter(bits=>[1,2,4,8].filter(bit=>bits&bit).length===1).length))throw Error(`Maze content drift in ${id}`);
  return {id,number,difficulty:mazeDifficulty(number),rows,cols,seed,parSeconds,hintLimit:3,contentVersion:1,maze,optimalMoves:path.length-1};
});
export function getMazeLevel(id:string){return mazeLevels.find(l=>l.id===id)}
