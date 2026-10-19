import type { RunEvent } from '../../storage/runEvents';
import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, AppState, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, radius, spacing } from '../../design/tokens';
import { getPuzzle, pack } from '../../features/word-search/puzzles';
import { chooseCell, freshWord, hintWord, pauseWord, resumeWord, wordElapsed, wordScore, type WordSession } from '../../features/word-search/session';
import { WordGrid } from '../../features/word-search/WordGrid';
import { loadWordProgress, updateWordProgress, wordComplete, wordUnlocked } from '../../storage/wordProgress';
function runId(){return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}
function time(ms:number){const seconds=Math.floor(ms/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`}
export default function WordPlay(){
  const {id}=useLocalSearchParams<{id:string}>(),puzzle=getPuzzle(typeof id==='string'?id:'');
  const [session,setSession]=useState<WordSession|null>(null),current=useRef<WordSession|null>(null);
  const [now,setNow]=useState(0),[error,setError]=useState(''),[feedback,setFeedback]=useState('');
  const [saving,setSaving]=useState(false),busy=useRef(false),[allowed,setAllowed]=useState(false),completionEvent=useRef<RunEvent|null>(null);
  function assign(s:WordSession){current.current=s;setSession(s);setNow(Date.now())}
  useEffect(()=>{
    if(!puzzle)return;let live=true;
    void loadWordProgress().then(progress=>{if(!live)return;
      if(!wordUnlocked(progress,puzzle.language,pack(puzzle.language).findIndex(p=>p.id===puzzle.id))){setError('This puzzle is locked. Clear the previous puzzle first.');return}
      setAllowed(true);assign(progress.session?.puzzleId===puzzle.id?progress.session:freshWord(puzzle,runId()));
    }).catch(()=>{if(live)setError('Could not load Word Search progress. Reopen this puzzle.')});
    return()=>{live=false;const s=current.current;if(s?.phase==='playing')void updateWordProgress(p=>({...p,session:pauseWord(s,Date.now())})).catch(()=>{})};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[puzzle?.id]);
  useEffect(()=>{
    const interval=setInterval(()=>setNow(Date.now()),500);
    const app=AppState.addEventListener('change',state=>{if(state!=='active'&&current.current?.phase==='playing'){
      const next=pauseWord(current.current,Date.now());assign(next);void updateWordProgress(p=>({...p,session:next})).catch(()=>setError('Could not save this puzzle.'));
    }});
    return()=>{clearInterval(interval);app.remove()};
  },[]);
  useEffect(()=>{if(session?.phase!=='playing')return;
    const interval=setInterval(()=>{const s=current.current;if(s?.phase==='playing'){
      const checkpoint=pauseWord(s,Date.now());current.current=resumeWord(checkpoint,Date.now());
      void updateWordProgress(p=>({...p,session:checkpoint})).catch(()=>setError('Could not save this puzzle.'));
    }},5000);return()=>clearInterval(interval);
  },[session?.phase]);
  if(!puzzle||(!allowed&&error))return <ScreenContainer headerShown><AppText variant="heading">{error||'Puzzle not found'}</AppText><PrimaryButton label="Puzzle selection" onPress={()=>router.replace('/word-search')} /></ScreenContainer>;
  if(!session)return <ScreenContainer headerShown><AppText muted>Loading puzzle…</AppText></ScreenContainer>;
  const s=session,levels=pack(puzzle.language),nextPuzzle=levels[puzzle.number];
  async function begin(restart=false){if(!puzzle||busy.current)return;busy.current=true;setSaving(true);setError('');
    if(restart)completionEvent.current=null;
    const source=restart?freshWord(puzzle,runId()):current.current!,next=resumeWord(source,Date.now());
    try{await updateWordProgress(p=>({...p,selectedLanguage:puzzle.language,records:{...p.records,[puzzle.id]:{clears:p.records[puzzle.id]?.clears??0,attempts:(p.records[puzzle.id]?.attempts??0)+(restart||source.phase==='ready'?1:0),bestScore:p.records[puzzle.id]?.bestScore??0,bestMs:p.records[puzzle.id]?.bestMs??0,lastScore:p.records[puzzle.id]?.lastScore??0,lastMs:p.records[puzzle.id]?.lastMs??0,lastRunId:p.records[puzzle.id]?.lastRunId??''}},session:pauseWord(next,Date.now())}));assign(next);setFeedback('Tap a starting cell, then an ending cell.')}
    catch{setError('Could not save this attempt. Try again.')}finally{busy.current=false;setSaving(false)}
  }
  function checkpoint(next:WordSession){assign(next);void updateWordProgress(p=>({...p,session:pauseWord(next,Date.now())})).catch(()=>setError('Could not save this puzzle.'))}
  async function select(row:number,col:number){if(!puzzle||busy.current||current.current?.phase!=='playing')return;
    const result=chooseCell(current.current,puzzle,{row,col},Date.now());if(result.kind==='ignored')return;
    assign(result.session);setFeedback({start:'Start selected. Tap the other end of a word.',found:`Found ${result.word}!`,invalid:'Not a listed word. Try another line.',duplicate:'Already found.'}[result.kind]);
    if(result.session.phase==='completed'){
      busy.current=true;setSaving(true);
      completionEvent.current={runId:result.session.runId,levelId:puzzle.id,score:wordScore(result.session,puzzle),elapsedMs:result.session.elapsedMs,completedAt:Date.now(),hints:result.session.hints};
      try{await updateWordProgress(p=>wordComplete(p,puzzle.id,result.session.runId,wordScore(result.session,puzzle),result.session.elapsedMs,completionEvent.current!));setError('')}
      catch{setError('Result not saved. Retry saving before leaving.')}finally{busy.current=false;setSaving(false)}
    }else checkpoint(result.session);
  }
  async function retry(){if(!puzzle||!current.current||busy.current)return;const done=current.current;busy.current=true;setSaving(true);
    try{await updateWordProgress(p=>wordComplete(p,puzzle.id,done.runId,wordScore(done,puzzle),done.elapsedMs,completionEvent.current??undefined));setError('')}
    catch{setError('Result not saved. Retry saving before leaving.')}finally{busy.current=false;setSaving(false)}
  }
  if(s.phase==='completed')return <ScreenContainer headerShown><AppText variant="eyebrow" style={styles.accent}>PUZZLE COMPLETE</AppText><AppText variant="display" accessibilityRole="header">Words found!</AppText><SurfaceCard><View style={styles.gap}><AppText variant="heading">{puzzle.title}</AppText><AppText>Final score {wordScore(s,puzzle)}</AppText><AppText muted>{time(s.elapsedMs)} · {s.hints} hints · {puzzle.targets.length} words</AppText></View></SurfaceCard>{!!error&&<AppText style={styles.error}>{error}</AppText>}{!!error&&<PrimaryButton label="Retry save" disabled={saving} onPress={()=>void retry()} />}{!error&&nextPuzzle&&<PrimaryButton label="Next puzzle" disabled={saving} onPress={()=>router.replace(`/word-search/${nextPuzzle.id}`)} />}<PrimaryButton label="Puzzle selection" secondary disabled={saving||!!error} onPress={()=>router.replace('/word-search')} />{!error&&<PrimaryButton label="Replay puzzle" secondary disabled={saving} onPress={()=>void begin(true)} />}</ScreenContainer>;
  return <ScreenContainer headerShown><AppText variant="eyebrow" style={styles.accent}>{puzzle.language==='hi'?'हिन्दी':'ENGLISH'} · {puzzle.difficulty.toUpperCase()}</AppText><AppText variant="heading" accessibilityRole="header">{puzzle.title} · {puzzle.number}</AppText><AppText variant="caption" muted>Tap the first and last cell of a listed word, forwards or backwards. Horizontal, vertical and diagonal lines count.</AppText><View style={styles.metrics}><View><AppText variant="caption" muted>TIME</AppText><AppText variant="heading">{time(wordElapsed(s,now))}</AppText></View><View><AppText variant="caption" muted>WORDS</AppText><AppText variant="heading">{s.found.length}/{puzzle.targets.length}</AppText></View><View><AppText variant="caption" muted>SCORE</AppText><AppText variant="heading">{wordScore(s,puzzle)}</AppText></View></View>
    {s.phase==='ready'?<PrimaryButton label="Start puzzle" disabled={saving} onPress={()=>void begin()} />:<View style={styles.actions}><PrimaryButton label={s.phase==='paused'?'Resume':'Pause'} secondary onPress={()=>{if(s.phase==='playing')checkpoint(pauseWord(s,Date.now()));else void begin()}} /><PrimaryButton label={`Hint ${puzzle.hintLimit-s.hints} left`} secondary disabled={s.phase!=='playing'||s.hints>=puzzle.hintLimit} onPress={()=>{const next=hintWord(s,puzzle);if(next!==s){checkpoint(next);setFeedback(`Hint: the first cell of ${puzzle.targets.find(t=>t.id===next.hintId)?.display} is outlined.`)}}} /><PrimaryButton label="Restart" secondary onPress={()=>Alert.alert('Restart puzzle?','Your current attempt will reset. Saved best scores stay.',[{text:'Cancel',style:'cancel'},{text:'Restart',style:'destructive',onPress:()=>void begin(true)}])} /></View>}
    {s.phase==='paused'&&<AppText style={styles.notice}>Paused. Time and selection are stopped.</AppText>}
    <WordGrid puzzle={puzzle} session={s} onCell={point=>void select(point.row,point.col)} />
    <View style={styles.words}>{puzzle.targets.map(target=><View key={target.id} style={[styles.word,s.found.includes(target.id)&&styles.foundWord]}><AppText accessibilityLabel={`${target.display}, ${s.found.includes(target.id)?'found':'not found'}`} style={styles.wordText}>{s.found.includes(target.id)?'✓ ':''}{target.display}</AppText></View>)}</View>
    <AppText accessibilityLiveRegion="polite" style={styles.notice}>{feedback||'Tap a start cell, then the other end.'}</AppText>{!!error&&<AppText style={styles.error}>{error}</AppText>}
    <PrimaryButton label="Puzzle selection" secondary onPress={()=>{if(current.current?.phase==='playing')checkpoint(pauseWord(current.current,Date.now()));router.replace('/word-search')}} />
    <PrimaryButton label="All games" secondary onPress={()=>{if(current.current?.phase==='playing')checkpoint(pauseWord(current.current,Date.now()));router.replace('/games')}} />
  </ScreenContainer>;
}
const styles=StyleSheet.create({accent:{color:colors.secondary},error:{color:colors.error},notice:{color:colors.highlight},gap:{gap:spacing.sm},metrics:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,justifyContent:'space-between',padding:spacing.lg,backgroundColor:colors.surface,borderRadius:radius.medium},actions:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},words:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},word:{backgroundColor:colors.surfaceRaised,borderRadius:radius.small,paddingHorizontal:spacing.md,paddingVertical:spacing.sm,borderWidth:1,borderColor:colors.border},foundWord:{borderColor:colors.success,backgroundColor:'#19483F'},wordText:{fontSize:16,lineHeight:26}});
