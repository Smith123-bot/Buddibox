import data from './content/puzzles.json';
export type Language='en'|'hi';
export type Point={row:number;col:number};
export type Target={id:string;display:string;tokens:string[];cells:Point[]};
export type Puzzle={id:string;language:Language;number:number;title:string;difficulty:string;size:number;seed:number;contentVersion:1;parSeconds:number;hintLimit:number;grid:string[][];targets:Target[]};
export const puzzles:readonly Puzzle[]=data.puzzles as Puzzle[];
const approvedTokens=new Set(puzzles.flatMap(p=>[...p.grid.flat(),...p.targets.flatMap(t=>t.tokens)]));
export function getPuzzle(id:string){return puzzles.find(p=>p.id===id)}
export function pack(language:Language){return puzzles.filter(p=>p.language===language)}
export function equalPoint(a:Point,b:Point){return a.row===b.row&&a.col===b.col}
export function inGrid(p:Puzzle,point:Point){return Number.isInteger(point.row)&&Number.isInteger(point.col)&&point.row>=0&&point.col>=0&&point.row<p.size&&point.col<p.size}
export function line(from:Point,to:Point):Point[]|null{
  const dr=to.row-from.row,dc=to.col-from.col;
  if(dr===0&&dc===0)return [from];
  if(dr!==0&&dc!==0&&Math.abs(dr)!==Math.abs(dc))return null;
  const length=Math.max(Math.abs(dr),Math.abs(dc))+1, stepR=Math.sign(dr),stepC=Math.sign(dc);
  return Array.from({length},(_,i)=>({row:from.row+i*stepR,col:from.col+i*stepC}));
}
export function samePath(a:Point[],b:Point[]){return a.length===b.length&&a.every((p,i)=>equalPoint(p,b[i]!))}
export function validatePuzzle(p:Puzzle):string[]{
  const errors:string[]=[];
  if(!['en','hi'].includes(p.language)||!/^((en)|(hi))-\d{3}$/.test(p.id)||p.size<4||p.size>10||!Number.isInteger(p.size)||p.grid.length!==p.size||p.targets.length<2||p.parSeconds<=0||p.hintLimit<0||p.contentVersion!==1)errors.push('invalid metadata');
  if(p.grid.some(row=>!Array.isArray(row)||row.length!==p.size||row.some(token=>typeof token!=='string'||!token||!approvedTokens.has(token)||token!==token.normalize('NFC')||/^\p{M}|^\u200d|^\u200c/u.test(token))))errors.push('invalid grid');
  if(errors.length)return errors;
  if(new Set(p.targets.map(t=>t.id)).size!==p.targets.length)errors.push('duplicate target ID');
  for(const target of p.targets){
    if(!target.tokens.length||target.tokens.join('')!==target.display.normalize('NFC')||target.tokens.some(t=>!t||!approvedTokens.has(t)||t!==t.normalize('NFC')||/^\p{M}|^\u200d|^\u200c/u.test(t)))errors.push(`invalid tokens: ${target.id}`);
    if(!target.cells.length||target.cells.length!==target.tokens.length||target.cells.some(c=>!c||!inGrid(p,c))) {errors.push(`invalid placement: ${target.id}`);continue}
    const path=line(target.cells[0]!,target.cells[target.cells.length-1]!);
    if(!path||!samePath(path,target.cells)||!target.cells.every((c,i)=>p.grid[c.row]?.[c.col]===target.tokens[i]))errors.push(`broken placement: ${target.id}`);
    let occurrences=0;
    for(let row=0;row<p.size;row++)for(let col=0;col<p.size;col++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]] as const){
      if(target.tokens.every((token,i)=>row+i*dr>=0&&col+i*dc>=0&&p.grid[row+i*dr]?.[col+i*dc]===token))occurrences++;
    }
    if(occurrences!==1)errors.push(`ambiguous word: ${target.id}`);
  }
  return errors;
}
