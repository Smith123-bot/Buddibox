import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors, radius, spacing, touchTarget } from '../../design/tokens';
import { pack, type Language } from '../../features/word-search/puzzles';
import { useWordProgress } from '../../features/word-search/useWordProgress';
import { updateWordProgress, wordUnlocked } from '../../storage/wordProgress';
export default function WordLevels(){
  const {progress,error:readError}=useWordProgress();const [choice,setChoice]=useState<Language|null>(null),[error,setError]=useState('');
  const language=choice??progress?.selectedLanguage??'en';
  function choose(value:Language){setChoice(value);void updateWordProgress(p=>({...p,selectedLanguage:value})).catch(()=>setError('Language preference could not be saved.'))}
  return <ScreenContainer headerShown><AppText variant="eyebrow" style={styles.accent}>WORD SEARCH</AppText><AppText variant="title" accessibilityRole="header">Choose your words</AppText><AppText muted>Tap the first and last cell of a word in a straight line. You can choose either end first. Find every listed word to clear a puzzle.</AppText><View style={styles.languages}><PrimaryButton label="English" secondary={language!=='en'} onPress={()=>choose('en')} /><PrimaryButton label="हिन्दी" secondary={language!=='hi'} onPress={()=>choose('hi')} /></View><AppText variant="heading">{language==='hi'?'हिन्दी puzzles':'English puzzles'}</AppText>
    {error&&<AppText style={styles.error}>{error}</AppText>}{readError?<AppText style={styles.error}>Saved Word Search progress could not be read. No data was overwritten. Reopen this screen after resolving storage access.</AppText>:!progress?<AppText muted>Loading puzzles…</AppText>:pack(language).map((p,index)=>{
      const unlocked=wordUnlocked(progress,language,index),record=progress.records[p.id];return <Pressable key={p.id} accessibilityRole="button" accessibilityState={{disabled:!unlocked}} disabled={!unlocked} accessibilityLabel={`${language==='hi'?'Hindi':'English'} puzzle ${p.number}, ${p.title}, ${unlocked?'unlocked':'locked'}${record?.clears?`, best score ${record.bestScore}`:''}`} onPress={()=>router.push(`/word-search/${p.id}`)} style={({pressed})=>[styles.card,!unlocked&&styles.locked,pressed&&styles.pressed]}><View style={styles.number}><AppText variant="heading" style={styles.accent}>{String(p.number).padStart(2,'0')}</AppText></View><View style={styles.copy}><AppText variant="heading">{p.title}</AppText><AppText variant="caption" muted>{record?.clears?`Cleared · best ${record.bestScore}`:unlocked?`${p.difficulty} · ${p.size} × ${p.size}`:'Clear the previous puzzle to unlock'}</AppText></View><AppText style={styles.accent}>{unlocked?'→':'×'}</AppText></Pressable>
    })}<PrimaryButton label="Back to Games" secondary onPress={()=>router.replace('/games')} /></ScreenContainer>;
}
const styles=StyleSheet.create({accent:{color:colors.secondary},error:{color:colors.error},languages:{flexDirection:'row',gap:spacing.sm,flexWrap:'wrap'},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.medium,padding:spacing.lg,minHeight:touchTarget+40,flexDirection:'row',alignItems:'center',gap:spacing.lg},locked:{opacity:0.5},pressed:{opacity:0.7},number:{width:52,height:52,alignItems:'center',justifyContent:'center',backgroundColor:colors.surfaceRaised,borderRadius:radius.small},copy:{flex:1,gap:spacing.xs}});
