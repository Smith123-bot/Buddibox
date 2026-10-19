import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, AppState, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, radius, spacing, touchTarget } from '../../design/tokens';
import { DifferencePanel } from '../../features/difference/DifferencePanel';
import { getLevel, levels } from '../../features/difference/levels';
import { elapsed, newSession, pause, score, start, tap, requestHint, type Session } from '../../features/difference/logic';
import type { RunEvent } from '../../storage/runEvents';
import { complete, isUnlocked, loadProgress, updateProgress } from '../../storage/differenceProgress';
export default function DifferencePlay(){
  const {id}=useLocalSearchParams<{id:string}>(); const level=getLevel(typeof id==='string'?id:'');
  const [session,setSession]=useState<Session|null>(null);const current=useRef<Session|null>(null);
  const [now,setNow]=useState(0);const [busy,setBusy]=useState(false);const busyRef=useRef(false);
  const [error,setError]=useState('');const [feedback,setFeedback]=useState('');const [scan,setScan]=useState(false);
  const [allowed,setAllowed]=useState(false);const completionEvent=useRef<RunEvent|null>(null);
  function assign(s:Session){current.current=s;setSession(s);setNow(Date.now());}
  useEffect(()=>{
    if(!level)return;
    let alive=true;
    loadProgress().then(p=>{
      if(!alive)return;
      const index=levels.findIndex(l=>l.id===level.id);
      if(!isUnlocked(p,index)){setError('This scene is locked. Complete the previous scene first.');return;}
      setAllowed(true);
      // Saved active sessions are sanitized to paused on load. Do not count background time.
      const saved=p.session?.levelId===level.id?p.session:null;
      assign(saved??newSession(level.id));
    }).catch(()=>{if(alive)setError('Could not load progress. Try reopening this scene.');});
    return()=>{alive=false;const s=current.current;if(s?.phase==='playing'){void updateProgress(p=>({...p,session:pause(s,Date.now())})).catch(()=>{});}};
  // Level ID is stable while this route is mounted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[level?.id]);
  useEffect(()=>{
    const timer=setInterval(()=>setNow(Date.now()),500);
    const app=AppState.addEventListener('change',state=>{
      if(state!=='active' && current.current?.phase==='playing'){
        const s=pause(current.current,Date.now());assign(s);void updateProgress(p=>({...p,session:s})).catch(()=>setError('Could not save this session.'));
      }
    });
    return()=>{clearInterval(timer);app.remove()};
  },[]);
  useEffect(()=>{if(session?.phase!=='playing')return;const timer=setInterval(()=>{
    if(current.current?.phase==='playing'){
      const s=pause(current.current,Date.now()); // checkpoint elapsed without stopping the clock
      const checkpoint=start(s,Date.now());current.current=checkpoint;
      void updateProgress(p=>({...p,session:pause(checkpoint,Date.now())})).catch(()=>setError('Could not save this session.'));
    }
  },5000);return()=>clearInterval(timer)},[session?.phase]);
  if(!level || error.startsWith('This scene is locked') || (!allowed&&error)) return <ScreenContainer headerShown><AppText variant="heading">{error||'Scene not found'}</AppText><PrimaryButton label="Level selection" onPress={()=>router.replace('/difference')} /></ScreenContainer>;
  if(!session)return <ScreenContainer headerShown><AppText muted>Loading the scene…</AppText></ScreenContainer>;
  const s=session;
  async function begin(fresh=false){
    if(!level || busyRef.current)return;busyRef.current=true;setBusy(true);setError('');
    if(fresh)completionEvent.current=null;
    const next=start(fresh?newSession(level.id):current.current!,Date.now());
    try {await updateProgress(p=>({...p,records:{...p.records,[level.id]:{completed:p.records[level.id]?.completed??0,bestScore:p.records[level.id]?.bestScore??0,bestMs:p.records[level.id]?.bestMs??0,attempts:(p.records[level.id]?.attempts??0)+(fresh||current.current?.phase==='ready'?1:0),lastScore:p.records[level.id]?.lastScore??0,lastMs:p.records[level.id]?.lastMs??0}},session:pause(next,Date.now())}));assign(next);}
    catch{setError('Could not save. Please try again.');}finally{busyRef.current=false;setBusy(false)}
  }
  function checkpoint(next:Session){assign(next);void updateProgress(p=>({...p,session:pause(next,Date.now())})).catch(()=>setError('Could not save this session.'))}
  async function guess(x:number,y:number){
    if(!level || busyRef.current || current.current?.phase!=='playing')return;
    const before=current.current;const result=tap(before,level,x,y,Date.now());
    if(result.result==='ignored'||result.result==='duplicate'){setFeedback(result.result==='duplicate'?'Already found.':'');return;}
    setFeedback(result.result==='correct'?'Great find!':'Not quite — try another spot.');
    assign(result.session);
    if(result.session.phase==='completed'){
      busyRef.current=true;setBusy(true);
      completionEvent.current={runId:`diff-${Date.now()}-${Math.random()}`,levelId:level.id,score:score(result.session,level),elapsedMs:result.session.elapsedMs,completedAt:Date.now(),hints:result.session.hints,effort:result.session.mistakes};
      try{await updateProgress(p=>complete(p,level.id,score(result.session,level),result.session.elapsedMs,completionEvent.current!));setFeedback('Scene complete!');}
      catch{setError('Result not saved. Tap Retry save before leaving.');}
      finally{setBusy(false);busyRef.current=false;}
    }else checkpoint(result.session);
  }
  async function retrySave(){if(!level||!current.current||busyRef.current)return;const completed=current.current;busyRef.current=true;setBusy(true);try{await updateProgress(p=>complete(p,level.id,score(completed,level),completed.elapsedMs,completionEvent.current??undefined));setError('')}catch{setError('Result not saved. Tap Retry save before leaving.')}finally{busyRef.current=false;setBusy(false)}}
  const seconds=Math.floor(elapsed(s,now)/1000), displayTime=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  if(s.phase==='completed')return <ScreenContainer headerShown><AppText variant="eyebrow" style={styles.kicker}>SCENE COMPLETE</AppText><AppText variant="display" accessibilityRole="header">Sharp eyes!</AppText><SurfaceCard><View style={styles.gap}><AppText variant="heading">{level.title}</AppText><AppText>Final score  {score(s,level)}</AppText><AppText muted>Time {displayTime} · {s.mistakes} misses · {s.hints} hints</AppText></View></SurfaceCard>{!!error&&<AppText style={styles.error}>{error}</AppText>}{!!error&&<PrimaryButton label="Retry save" disabled={busy} onPress={()=>void retrySave()} />}<PrimaryButton label="Level selection" disabled={busy||!!error} onPress={()=>router.replace('/difference')} />{!error&&<PrimaryButton label="Replay scene" secondary onPress={()=>void begin(true)} />}</ScreenContainer>;
  return <ScreenContainer headerShown><View style={styles.top}><AppText variant="eyebrow" style={styles.kicker}>LEVEL {String(level.number).padStart(2,'0')} · {level.difficulty.toUpperCase()}</AppText><AppText variant="heading" accessibilityRole="header">{level.title}</AppText><AppText muted>Find five changes. Tap either picture.</AppText></View>
    <View style={styles.metrics}><View><AppText variant="caption" muted>TIME</AppText><AppText variant="heading">{displayTime}</AppText></View><View><AppText variant="caption" muted>SCORE</AppText><AppText variant="heading">{score(s,level)}</AppText></View><View><AppText variant="caption" muted>FOUND</AppText><AppText variant="heading">{s.found.length} / 5</AppText></View></View>
    {s.phase==='ready'?<PrimaryButton label="Start scene" onPress={()=>void begin()} disabled={busy} />:<View style={styles.controls}><PrimaryButton label={s.phase==='paused'?'Resume':'Pause'} secondary onPress={()=>{if(s.phase==='playing')checkpoint(pause(s,Date.now()));else void begin()}} /><PrimaryButton label={`Hint ${level.hintLimit-s.hints} left`} secondary disabled={s.phase!=='playing'||s.hints>=level.hintLimit} onPress={()=>{const next=requestHint(s,level);if(next!==s){checkpoint(next);setFeedback(`Hint: look near the ${level.regions.find(r=>r.id===next.hintId)?.label}.`)}}} /><PrimaryButton label="Restart" secondary onPress={()=>Alert.alert('Restart scene?','Your current attempt will be replaced.',[{text:'Cancel',style:'cancel'},{text:'Restart',style:'destructive',onPress:()=>void begin(true)}])} /></View>}
    {s.phase==='paused'&&<AppText style={styles.notice}>Paused. Your active time is not running.</AppText>}
    <DifferencePanel level={level} side={0} found={s.found} hintId={s.hintId} enabled={s.phase==='playing'} onGuess={(x,y)=>void guess(x,y)} />
    <DifferencePanel level={level} side={1} found={s.found} hintId={s.hintId} enabled={s.phase==='playing'} onGuess={(x,y)=>void guess(x,y)} />
    <AppText accessibilityLiveRegion="polite" style={styles.feedback}>{feedback||'Tap a changed object in either scene.'}</AppText>
    <AppText variant="caption" muted>Misses: {s.mistakes}. First three misses have no score penalty.</AppText>
    <PrimaryButton label={scan?'Hide object list':'Explore objects without image tapping'} secondary onPress={()=>setScan(!scan)} />
    {scan&&<View style={styles.scan}><AppText variant="caption" muted>Choose an object in the scene. Some objects are unchanged.</AppText>{[...level.regions.map(r=>({label:r.label,x:r.x,y:r.y})),...level.decoys].map(item=><Pressable accessibilityRole="button" key={item.label} disabled={s.phase!=='playing'} accessibilityState={{disabled:s.phase!=='playing'}} style={({pressed})=>[styles.scanButton,pressed&&{opacity:0.7}]} onPress={()=>void guess(item.x,item.y)}><AppText>Inspect {item.label}</AppText></Pressable>)}</View>}
    {!!error&&<AppText style={styles.error}>{error}</AppText>}
    <PrimaryButton label="Leave to level selection" secondary onPress={()=>{const latest=current.current;if(latest?.phase==='playing')checkpoint(pause(latest,Date.now()));router.replace('/difference')}} />
  </ScreenContainer>;
}
const styles=StyleSheet.create({top:{gap:spacing.xs},kicker:{color:colors.secondary},metrics:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,justifyContent:'space-between',backgroundColor:colors.surface,padding:spacing.lg,borderRadius:radius.medium},controls:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},notice:{color:colors.highlight},feedback:{color:colors.success},error:{color:colors.error},gap:{gap:spacing.sm},scan:{gap:spacing.sm},scanButton:{minHeight:touchTarget,justifyContent:'center',backgroundColor:colors.surfaceRaised,borderRadius:radius.small,padding:spacing.md}});
