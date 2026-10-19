import type { RunEvent } from '../../storage/runEvents';
import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, AppState, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, radius, spacing, touchTarget } from '../../design/tokens';
import { directionBetween, type Direction } from '../../features/maze/engine';
import { getMazeLevel, mazeLevels } from '../../features/maze/levels';
import { MazeBoard } from '../../features/maze/MazeBoard';
import { activeMs, fresh, hint, mazeScore, move, pauseMaze, resume, type MazeSession } from '../../features/maze/session';
import { loadMazeProgress, mazeComplete, mazeUnlocked, updateMazeProgress } from '../../storage/mazeProgress';
function newRunId(){return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}
function format(ms:number){const seconds=Math.floor(ms/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`}
export default function MazePlay(){
  const {id}=useLocalSearchParams<{id:string}>(),level=getMazeLevel(typeof id==='string'?id:'');
  const [session,setSession]=useState<MazeSession|null>(null),current=useRef<MazeSession|null>(null);
  const [now,setNow]=useState(0),[error,setError]=useState(''),[feedback,setFeedback]=useState('');
  const [saving,setSaving]=useState(false),busy=useRef(false),[allowed,setAllowed]=useState(false),completionEvent=useRef<RunEvent|null>(null);
  function assign(s:MazeSession){current.current=s;setSession(s);setNow(Date.now())}
  useEffect(()=>{
    if(!level)return;let live=true;
    void loadMazeProgress().then(progress=>{if(!live)return;
      if(!mazeUnlocked(progress,mazeLevels.findIndex(l=>l.id===level.id))){setError('This route is locked. Clear the previous route first.');return}
      setAllowed(true);assign(progress.session?.levelId===level.id?progress.session:fresh(level,newRunId()));
    }).catch(()=>{if(live)setError('Could not load Maze progress. Reopen this route.')});
    return()=>{live=false;const s=current.current;if(s?.phase==='playing')void updateMazeProgress(p=>({...p,session:pauseMaze(s,Date.now())})).catch(()=>{})};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[level?.id]);
  useEffect(()=>{
    const interval=setInterval(()=>setNow(Date.now()),500);
    const app=AppState.addEventListener('change',state=>{if(state!=='active'&&current.current?.phase==='playing'){
      const next=pauseMaze(current.current,Date.now());assign(next);void updateMazeProgress(p=>({...p,session:next})).catch(()=>setError('Could not save this attempt.'));
    }});
    return()=>{clearInterval(interval);app.remove()};
  },[]);
  useEffect(()=>{if(session?.phase!=='playing')return;
    const interval=setInterval(()=>{const s=current.current;if(s?.phase==='playing'){
      const checkpoint=pauseMaze(s,Date.now());const running=resume(checkpoint,Date.now());current.current=running;
      void updateMazeProgress(p=>({...p,session:checkpoint})).catch(()=>setError('Could not save this attempt.'));
    }},5000);return()=>clearInterval(interval);
  },[session?.phase]);
  if(!level||(!allowed&&error))return <ScreenContainer headerShown><AppText variant="heading">{error||'Route not found'}</AppText><PrimaryButton label="Level selection" onPress={()=>router.replace('/maze')} /></ScreenContainer>;
  if(!session)return <ScreenContainer headerShown><AppText muted>Loading route…</AppText></ScreenContainer>;
  const s=session;
  async function begin(restart=false){if(!level||busy.current)return;busy.current=true;setSaving(true);setError('');
    if(restart)completionEvent.current=null;
    const source=restart?fresh(level,newRunId()):current.current!;
    const next=resume(source,Date.now());
    try{await updateMazeProgress(p=>({...p,records:{...p.records,[level.id]:{clears:p.records[level.id]?.clears??0,attempts:(p.records[level.id]?.attempts??0)+(restart||source.phase==='ready'?1:0),bestScore:p.records[level.id]?.bestScore??0,bestMs:p.records[level.id]?.bestMs??0,lastScore:p.records[level.id]?.lastScore??0,lastMs:p.records[level.id]?.lastMs??0,lastRunId:p.records[level.id]?.lastRunId??''}},session:pauseMaze(next,Date.now())}));assign(next);setFeedback('Find the exit!')}
    catch{setError('Could not save this attempt. Try again.')}finally{busy.current=false;setSaving(false)}
  }
  function checkpoint(next:MazeSession){assign(next);void updateMazeProgress(p=>({...p,session:pauseMaze(next,Date.now())})).catch(()=>setError('Could not save this attempt.'))}
  async function step(dir:Direction){if(!level||busy.current||current.current?.phase!=='playing')return;
    const next=move(current.current,level,dir,Date.now());if(next===current.current){setFeedback('A wall blocks that direction.');return}
    assign(next);setFeedback(next.phase==='completed'?'Exit reached!':`Moved ${dir}.`);
    if(next.phase==='completed'){
      busy.current=true;setSaving(true);
      completionEvent.current={runId:next.runId,levelId:level.id,score:mazeScore(next,level),elapsedMs:next.elapsedMs,completedAt:Date.now(),hints:next.hints,effort:next.moves};
      try{await updateMazeProgress(p=>mazeComplete(p,level.id,next.runId,mazeScore(next,level),next.elapsedMs,completionEvent.current!));setError('')}
      catch{setError('Result not saved. Retry saving before leaving.')}finally{busy.current=false;setSaving(false)}
    }else checkpoint(next);
  }
  async function retry(){if(!level||!current.current||busy.current)return;
    const done=current.current;busy.current=true;setSaving(true);
    try{await updateMazeProgress(p=>mazeComplete(p,level.id,done.runId,mazeScore(done,level),done.elapsedMs,completionEvent.current??undefined));setError('')}
    catch{setError('Result not saved. Retry saving before leaving.')}finally{busy.current=false;setSaving(false)}
  }
  const nextLevel=mazeLevels[level.number];
  if(s.phase==='completed')return <ScreenContainer headerShown><AppText variant="eyebrow" style={styles.accent}>ROUTE COMPLETE</AppText><AppText variant="display" accessibilityRole="header">You found the way!</AppText><SurfaceCard><View style={styles.gap}><AppText variant="heading">Route {level.number}</AppText><AppText>Final score {mazeScore(s,level)}</AppText><AppText muted>{s.moves} moves · best route {level.optimalMoves} · {format(s.elapsedMs)} · {s.hints} hints</AppText></View></SurfaceCard>{!!error&&<AppText style={styles.error}>{error}</AppText>}{!!error&&<PrimaryButton label="Retry save" disabled={saving} onPress={()=>void retry()} />}{!error&&nextLevel&&<PrimaryButton label="Continue to next route" disabled={saving} onPress={()=>router.replace(`/maze/${nextLevel.id}`)} />}<PrimaryButton label="Level selection" secondary disabled={saving||!!error} onPress={()=>router.replace('/maze')} />{!error&&<PrimaryButton label="Replay route" secondary disabled={saving} onPress={()=>void begin(true)} />}</ScreenContainer>;
  return <ScreenContainer headerShown><AppText variant="eyebrow" style={styles.accent}>MAZE ESCAPE · {level.difficulty.toUpperCase()}</AppText><AppText variant="heading" accessibilityRole="header">Route {level.number}</AppText><View style={styles.metrics}><View><AppText variant="caption" muted>TIME</AppText><AppText variant="heading">{format(activeMs(s,now))}</AppText></View><View><AppText variant="caption" muted>MOVES</AppText><AppText variant="heading">{s.moves}</AppText></View><View><AppText variant="caption" muted>SCORE</AppText><AppText variant="heading">{mazeScore(s,level)}</AppText></View></View>
    {s.phase==='ready'?<PrimaryButton label="Start route" disabled={saving} onPress={()=>void begin()} />:<View style={styles.actions}><PrimaryButton label={s.phase==='paused'?'Resume':'Pause'} secondary onPress={()=>{if(s.phase==='playing')checkpoint(pauseMaze(s,Date.now()));else void begin()}} /><PrimaryButton label={`Hint ${level.hintLimit-s.hints} left`} secondary disabled={s.phase!=='playing'||s.hints>=level.hintLimit} onPress={()=>{const next=hint(s,level);if(next!==s){checkpoint(next);const dir=directionBetween(s.position,next.hintCell!);setFeedback(`Hint: move ${dir}. The marker shows your next step.`)}}} /><PrimaryButton label="Restart" secondary onPress={()=>Alert.alert('Restart route?','The current attempt will reset. Saved best results stay.',[{text:'Cancel',style:'cancel'},{text:'Restart',style:'destructive',onPress:()=>void begin(true)}])} /></View>}
    {s.phase==='paused'&&<AppText style={styles.notice}>Paused. Time and movement are stopped.</AppText>}
    <MazeBoard level={level} session={s} />
    <View style={styles.legend}><AppText variant="caption" muted>● Player</AppText><AppText variant="caption" style={styles.accent}>◆ Exit</AppText><AppText variant="caption" muted>S Start</AppText></View>
    <View style={styles.pad}><Control label="Move north" glyph="↑" disabled={s.phase!=='playing'||saving} onPress={()=>void step('north')} /><View style={styles.padRow}><Control label="Move west" glyph="←" disabled={s.phase!=='playing'||saving} onPress={()=>void step('west')} /><Control label="Move south" glyph="↓" disabled={s.phase!=='playing'||saving} onPress={()=>void step('south')} /><Control label="Move east" glyph="→" disabled={s.phase!=='playing'||saving} onPress={()=>void step('east')} /></View></View>
    <AppText accessibilityLiveRegion="polite" style={styles.notice}>{feedback||'Use the arrows to find the exit.'}</AppText>{!!error&&<AppText style={styles.error}>{error}</AppText>}
    <PrimaryButton label="Level selection" secondary onPress={()=>{if(current.current?.phase==='playing')checkpoint(pauseMaze(current.current,Date.now()));router.replace('/maze')} } />
    <PrimaryButton label="All games" secondary onPress={()=>{if(current.current?.phase==='playing')checkpoint(pauseMaze(current.current,Date.now()));router.replace('/games')}} />
  </ScreenContainer>;
}
function Control({label,glyph,disabled,onPress}:{label:string;glyph:string;disabled:boolean;onPress:()=>void}){
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.direction,(pressed||disabled)&&styles.dim]}><AppText variant="heading">{glyph}</AppText></Pressable>;
}
const styles=StyleSheet.create({accent:{color:colors.secondary},error:{color:colors.error},notice:{color:colors.highlight},gap:{gap:spacing.sm},metrics:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,justifyContent:'space-between',padding:spacing.lg,backgroundColor:colors.surface,borderRadius:radius.medium},actions:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},legend:{flexDirection:'row',flexWrap:'wrap',gap:spacing.lg,justifyContent:'center'},pad:{alignItems:'center',gap:spacing.sm},padRow:{flexDirection:'row',gap:spacing.sm},direction:{minWidth:touchTarget+10,minHeight:touchTarget+10,alignItems:'center',justifyContent:'center',backgroundColor:colors.surfaceRaised,borderWidth:1,borderColor:colors.border,borderRadius:radius.small},dim:{opacity:0.5}});
