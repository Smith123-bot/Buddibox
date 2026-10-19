import { levels, validateLevel } from '../levels';
import { elapsed, mapTouch, newSession, pause, pointInRegion, requestHint, score, start, tap, validSession } from '../logic';
const level=levels[0]!;
describe('packaged difference content',()=>{
  it('contains exactly five bounded non-overlapping regions for every level',()=>{
    for(const item of levels) expect(validateLevel(item)).toEqual([]);
  });
  it('rejects invalid metadata and geometry',()=>{
    expect(validateLevel({...level,regions:[...level.regions,{...level.regions[0]!,rx:2}]})).not.toEqual([]);
    expect(validateLevel({...level,parSeconds:0})).toContain('invalid metadata');
  });
});
describe('image geometry',()=>{
  it('uses contain positioning and ignores letterbox taps',()=>{
    expect(mapTouch(50,100,300,200,1.5)).toEqual({x:1/6,y:1/2});
    expect(mapTouch(0,0,400,200,1.5)).toBeNull();
    expect(mapTouch(50,0,400,200,1.5)).toEqual({x:0,y:0});
    expect(mapTouch(10,10,0,200,1.5)).toBeNull();
  });
  it('detects ellipse center and rejects distant points',()=>{
    const r=level.regions[0]!;
    expect(pointInRegion(r.x,r.y,r)).toBe(true);
    expect(pointInRegion(0.9,0.9,r)).toBe(false);
  });
});
describe('session, score and hints',()=>{
  it('counts only active time and pauses without drift',()=>{
    let s=start(newSession(level.id),1000);
    expect(elapsed(s,3500)).toBe(2500);
    s=pause(s,3500);
    expect(elapsed(s,100000)).toBe(2500);
    s=start(s,100000);
    expect(elapsed(s,101000)).toBe(3500);
    expect(start(s,101100)).toBe(s);
  });
  it('counts misses, guards duplicates and completes on five unique taps',()=>{
    let s=start(newSession(level.id),1000);
    expect(tap(s,level,-1,0,1100).result).toBe('ignored');
    for (const [x,y] of [[NaN,0],[0,Infinity],[-Infinity,0]] as const) {
      const invalid=tap(s,level,x,y,1100);
      expect(invalid.result).toBe('ignored');
      expect(invalid.session).toBe(s); // Invalid coordinates must not count as misses.
    }
    let result=tap(s,level,0.9,0.9,1200);expect(result.result).toBe('incorrect');s=result.session;
    for(let i=0;i<5;i++){
      const r=level.regions[i]!;result=tap(s,level,r.x,r.y,1500+i*100);
      expect(result.result).toBe('correct');s=result.session;
      if(i===0){const dup=tap(s,level,r.x,r.y,1600);expect(dup.result).toBe('duplicate');expect(dup.session.found).toHaveLength(1);}
    }
    expect(s.phase).toBe('completed');expect(s.found).toHaveLength(5);
    expect(tap(s,level,0.8,0.8,3000).result).toBe('ignored');
    expect(score(s,level)).toBeGreaterThan(0);
  });
  it('hints only on remaining targets, charges once and never completes the board',()=>{
    let s=start(newSession(level.id),0);
    s=requestHint(s,level);expect(s.hintId).toBe(level.regions[0]!.id);expect(s.hints).toBe(1);
    const r=level.regions[0]!;s=tap(s,level,r.x,r.y,10).session;
    s=requestHint(s,level);expect(s.hintId).toBe(level.regions[1]!.id);expect(s.hints).toBe(2);
    expect(requestHint(s,level)).toBe(s);expect(s.found).toHaveLength(1);
  });
  it('floors the score and rejects unsafe restore values',()=>{
    const s={...newSession(level.id),mistakes:500,hints:2};expect(score(s,level)).toBe(0);
    expect(validSession({...s,found:['fake']},level)).toBe(false);
    expect(validSession({...s,elapsedMs:-1},level)).toBe(false);
    expect(validSession(s,level)).toBe(true);
  });
});
