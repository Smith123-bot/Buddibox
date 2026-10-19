/* global __dirname */
/** Curated deterministic Word Search pack builder. Run with Node 22 (ICU 78 tested). */
const fs=require('fs'),path=require('path');
if(!process.versions.icu?.startsWith('78.2')||typeof Intl.Segmenter!=='function')throw Error('Content compiler requires Node 22 with ICU 78.2; revalidate corpus before changing Unicode version');
const segmenter=new Intl.Segmenter('hi',{granularity:'grapheme'});
const tokenize=word=>[...segmenter.segment(word.normalize('NFC'))].map(part=>part.segment);
const packs={
 en:[
  ['Garden words',6,['ROSE','TREE','LEAF']],
  ['Sky watch',6,['STAR','MOON','CLOUD']],
  ['At the shore',7,['SHELL','WAVE','SAND']],
  ['In motion',7,['TRAIN','BIKE','ROAD']],
  ['Nature trail',8,['FOREST','RIVER','STONE']],
 ],
 hi:[
  ['बगीचा',6,['कमल','किताब','किसान']],
  ['देश',7,['भारत','विद्यालय','शक्ति']],
  ['प्रकृति',7,['प्रकाश','क्षमा','नदी']],
  ['आसपास',7,['सूरज','पानी','बगीचा']],
  ['शब्द',8,['दीपक','चिड़िया','मित्र']],
 ]
};
const dirs=[[0,1],[1,0],[1,1]];
function random(seed){let state=seed>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}};
function occurrences(grid,tokens){const n=grid.length,result=[];for(let row=0;row<n;row++)for(let col=0;col<n;col++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]]){const coords=tokens.map((_,i)=>({row:row+i*dr,col:col+i*dc}));if(coords.every((p,i)=>p.row>=0&&p.col>=0&&p.row<n&&p.col<n&&grid[p.row][p.col]===tokens[i]))result.push(coords)}return result}
function create(lang,number,config){
 const [title,size,words]=config,seed=(lang==='hi'?9000:1000)+number*173;
 const targets=words.map((display,i)=>{
   const text=lang==='en'?display.toUpperCase():display.normalize('NFC'),tokens=tokenize(text);
   if(tokens.length<2||tokens.length>size||tokens.some(t=>!t||t!==t.normalize('NFC')||/^\p{M}|^\u200d|^\u200c/u.test(t)))throw Error('Unsupported token '+text);
   return {id:`w${i+1}`,display:text,tokens};
 });
 const filler=lang==='hi'?['अ','आ','इ','उ','ए','ओ','ई','ऊ']:['Q','X','Z','J','V','K','Y'];
 for(let attempt=0;attempt<80;attempt++){
   const rng=random(seed+attempt*997),grid=Array.from({length:size},()=>Array(size).fill(null));
   const placements=[];
   for(const target of targets){
     const candidates=[];
     for(let row=0;row<size;row++)for(let col=0;col<size;col++)for(const [dr,dc] of dirs){
       const cells=target.tokens.map((_,i)=>({row:row+i*dr,col:col+i*dc}));
       if(cells.every((p,i)=>p.row<size&&p.col<size&&(grid[p.row][p.col]===null||grid[p.row][p.col]===target.tokens[i])))candidates.push(cells);
     }
     if(!candidates.length)break;
     const cells=candidates[Math.floor(rng()*candidates.length)];
     cells.forEach((p,i)=>grid[p.row][p.col]=target.tokens[i]);placements.push({...target,cells});
   }
   if(placements.length!==targets.length)continue;
   for(const row of grid)for(let i=0;i<size;i++)if(row[i]===null)row[i]=filler[Math.floor(rng()*filler.length)];
   if(placements.every(p=>{const list=occurrences(grid,p.tokens);return list.length===1&&JSON.stringify(list[0])===JSON.stringify(p.cells)}))return {id:`${lang}-${String(number).padStart(3,'0')}`,language:lang,number,title,difficulty:number<3?'Easy':number<5?'Medium':'Hard',size,seed,contentVersion:1,parSeconds:80+number*35,hintLimit:2,grid,targets:placements};
 }
 throw Error(`Unable to place ${lang} ${number} within bounded attempts`);
}
const result={version:1,puzzles:Object.entries(packs).flatMap(([lang,entries])=>entries.map((config,i)=>create(lang,i+1,config)))};
const output=path.join(__dirname,'../src/features/word-search/content/puzzles.json');
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(result.puzzles.map(p=>`${p.id} ${p.title}: ${p.targets.map(t=>t.tokens.join('|')).join(', ')}`).join('\n'));
