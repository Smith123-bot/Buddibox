import type { Level, Region } from './levels';
export type Phase = 'ready' | 'playing' | 'paused' | 'completed';
export type Session = { levelId: string; phase: Phase; found: string[]; mistakes: number; hints: number; hintId: string | null; elapsedMs: number; startedAt: number | null };
export function newSession(levelId: string): Session { return { levelId, phase: 'ready', found: [], mistakes: 0, hints: 0, hintId: null, elapsedMs: 0, startedAt: null }; }
export function elapsed(s: Session, now: number) { return s.elapsedMs + (s.phase === 'playing' && s.startedAt !== null ? Math.max(0, now-s.startedAt) : 0); }
export function start(s: Session, now: number): Session { return s.phase === 'ready' || s.phase === 'paused' ? { ...s, phase: 'playing', startedAt: now } : s; }
export function pause(s: Session, now: number): Session { return s.phase === 'playing' ? { ...s, phase: 'paused', elapsedMs: elapsed(s,now), startedAt: null, hintId: null } : s; }
export function pointInRegion(x: number, y: number, r: Region) { return ((x-r.x)/r.rx)**2+((y-r.y)/r.ry)**2 <= 1; }
export function mapTouch(x: number,y: number,width: number,height: number,imageRatio: number): {x:number;y:number}|null {
  if (![x,y,width,height,imageRatio].every(Number.isFinite) || width<=0 || height<=0 || imageRatio<=0) return null;
  const w=Math.min(width,height*imageRatio), h=w/imageRatio, left=(width-w)/2, top=(height-h)/2;
  if (x<left || x>left+w || y<top || y>top+h) return null;
  return { x:(x-left)/w, y:(y-top)/h };
}
export type TapResult = { session: Session; result: 'correct'|'incorrect'|'duplicate'|'ignored' };
export function tap(s: Session,level: Level,x:number,y:number,now:number): TapResult {
  if (s.phase!=='playing' || !Number.isFinite(x) || !Number.isFinite(y) || x<0 || x>1 || y<0 || y>1) return {session:s,result:'ignored'};
  const region=level.regions.find(r=>pointInRegion(x,y,r));
  if (!region) return {session:{...s,mistakes:s.mistakes+1,hintId:null},result:'incorrect'};
  if (s.found.includes(region.id)) return {session:s,result:'duplicate'};
  const found=[...s.found,region.id], complete=found.length===level.expected;
  return {session: complete ? {...pause(s,now),phase:'completed',found} : {...s,found,hintId:null},result:'correct'};
}
export function requestHint(s: Session,level: Level): Session {
  if (s.phase!=='playing' || s.hints>=level.hintLimit || s.found.length>=level.expected) return s;
  const candidate=level.regions.find(r=>!s.found.includes(r.id) && r.id!==s.hintId) ?? level.regions.find(r=>!s.found.includes(r.id));
  return candidate ? {...s,hints:s.hints+1,hintId:candidate.id} : s;
}
export function score(s: Session,level: Level) {
  const base=s.found.length*100;
  const timeBonus=s.phase==='completed' ? Math.max(0,200-Math.floor(200*(s.elapsedMs/1000)/level.parSeconds)) : 0;
  return Math.max(0,base+timeBonus-10*Math.max(0,s.mistakes-3)-50*s.hints);
}
export function validSession(value: unknown,level: Level): value is Session {
  if (!value || typeof value!=='object') return false;
  const s=value as Partial<Session>;
  return s.levelId===level.id && ['ready','playing','paused'].includes(s.phase ?? '') && Array.isArray(s.found) && new Set(s.found).size===s.found.length && s.found.every(id=>level.regions.some(r=>r.id===id)) && s.found.length<level.expected && Number.isSafeInteger(s.mistakes) && s.mistakes!>=0 && Number.isSafeInteger(s.hints) && s.hints!>=0 && s.hints!<=level.hintLimit && typeof s.elapsedMs==='number' && Number.isFinite(s.elapsedMs) && s.elapsedMs>=0 && (s.hintId===null || level.regions.some(r=>r.id===s.hintId)) && (s.startedAt===null || typeof s.startedAt==='number');
}
