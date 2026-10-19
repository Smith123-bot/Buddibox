/** Rectangular perfect mazes. Each bit represents an OPEN passage, not a wall. */
export const NORTH=1, EAST=2, SOUTH=4, WEST=8;
export type Direction='north'|'east'|'south'|'west';
export type Cell={row:number;col:number};
export type Maze={rows:number;cols:number;cells:number[];start:Cell;exit:Cell};
const directions:readonly {bit:number;opposite:number;dr:number;dc:number;name:Direction}[]=[
  {bit:NORTH,opposite:SOUTH,dr:-1,dc:0,name:'north'},
  {bit:EAST,opposite:WEST,dr:0,dc:1,name:'east'},
  {bit:SOUTH,opposite:NORTH,dr:1,dc:0,name:'south'},
  {bit:WEST,opposite:EAST,dr:0,dc:-1,name:'west'},
];
export function equal(a:Cell,b:Cell){return a.row===b.row&&a.col===b.col}
export function inside(m:Maze,p:Cell){return Number.isInteger(p.row)&&Number.isInteger(p.col)&&p.row>=0&&p.col>=0&&p.row<m.rows&&p.col<m.cols}
export function index(m:Maze,p:Cell){return p.row*m.cols+p.col}
export function cell(m:Maze,i:number):Cell{return {row:Math.floor(i/m.cols),col:i%m.cols}}
export function neighbor(p:Cell,dir:Direction):Cell {const d=directions.find(d=>d.name===dir)!;return {row:p.row+d.dr,col:p.col+d.dc}}
export function canMove(m:Maze,p:Cell,dir:Direction){
  const d=directions.find(d=>d.name===dir)!,next=neighbor(p,dir);
  return inside(m,p)&&inside(m,next)&&!!(m.cells[index(m,p)]!&d.bit)&&!!(m.cells[index(m,next)]!&d.opposite);
}
/** Seeded LCG + iterative DFS; bounded by the number of cells. No runtime randomness. */
export function generateMaze(rows:number,cols:number,seed:number):Maze {
  if(!Number.isInteger(rows)||!Number.isInteger(cols)||rows<2||cols<2||rows>15||cols>15||!Number.isSafeInteger(seed))throw Error('Invalid maze dimensions or seed');
  let state=seed>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
  const m:Maze={rows,cols,cells:Array(rows*cols).fill(0),start:{row:0,col:0},exit:{row:rows-1,col:cols-1}};
  const visited=new Set<number>([0]), stack=[0];
  while(stack.length){
    const at=stack[stack.length-1]!,p=cell(m,at);
    const options=directions.filter(d=>{const n={row:p.row+d.dr,col:p.col+d.dc};return inside(m,n)&&!visited.has(index(m,n))});
    if(!options.length){stack.pop();continue}
    const choice=options[Math.floor(random()*options.length)]!;
    const next={row:p.row+choice.dr,col:p.col+choice.dc},nextIndex=index(m,next);
    m.cells[at]=m.cells[at]!|choice.bit;m.cells[nextIndex]=m.cells[nextIndex]!|choice.opposite;
    visited.add(nextIndex);stack.push(nextIndex);
  }
  return m;
}
/** BFS shortest route, including both endpoints, or null if unreachable. */
export function shortestPath(m:Maze,from:Cell,to:Cell):Cell[]|null {
  if(!inside(m,from)||!inside(m,to))return null;
  const source=index(m,from),target=index(m,to),queue=[source],parent=new Map<number,number>([[source,-1]]);
  for(let head=0;head<queue.length;head++){
    const at=queue[head]!;if(at===target)break;
    for(const d of directions){const p=cell(m,at);if(!canMove(m,p,d.name))continue;
      const ni=index(m,neighbor(p,d.name));if(!parent.has(ni)){parent.set(ni,at);queue.push(ni)}
    }
  }
  if(!parent.has(target))return null;
  const path:Cell[]=[];for(let at=target;at!==-1;at=parent.get(at)!)path.push(cell(m,at));return path.reverse();
}
export function validateMaze(m:Maze):string[] {
  const errors:string[]=[];
  if(!Number.isInteger(m.rows)||!Number.isInteger(m.cols)||m.rows<2||m.cols<2||m.rows>15||m.cols>15||m.cells.length!==m.rows*m.cols)return ['invalid dimensions'];
  if(!inside(m,m.start)||!inside(m,m.exit)||equal(m.start,m.exit))errors.push('invalid endpoints');
  for(let i=0;i<m.cells.length;i++){
    const bits=m.cells[i];if(!Number.isInteger(bits)||bits!<0||bits!>15){errors.push('invalid cell');continue}
    const p=cell(m,i);
    for(const d of directions){const next=neighbor(p,d.name),open=!!(bits!&d.bit);
      if(open&&!inside(m,next))errors.push('open boundary');
      if(inside(m,next)&&open!==!!(m.cells[index(m,next)]!&d.opposite))errors.push('asymmetric wall');
    }
  }
  if(!errors.length){if(!shortestPath(m,m.start,m.exit))errors.push('exit unreachable');
    if(shortestPath(m,m.start,m.exit)&&Array.from({length:m.cells.length},(_,i)=>i).some(i=>!shortestPath(m,m.start,cell(m,i))))errors.push('disconnected cell');}
  return [...new Set(errors)];
}
export function directionBetween(a:Cell,b:Cell):Direction|null{
  return directions.find(d=>a.row+d.dr===b.row&&a.col+d.dc===b.col)?.name??null;
}
