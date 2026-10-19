import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors, radius, spacing, touchTarget } from '../../design/tokens';
import { levels } from '../../features/difference/levels';
import { isUnlocked, loadProgress, type DifferenceProgress } from '../../storage/differenceProgress';
export default function DifferenceLevels(){
  const [progress,setProgress]=useState<DifferenceProgress|null>(null);
  const [error,setError]=useState(false);
  useFocusEffect(useCallback(()=>{let live=true;loadProgress().then(p=>{if(live)setProgress(p)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[]));
  return <ScreenContainer headerShown><AppText variant="eyebrow" style={styles.kicker}>FIND THE DIFFERENCE</AppText><AppText variant="title" accessibilityRole="header">Choose a scene</AppText><AppText muted>Find five real changes in each illustrated pair. Tap either picture, or use the accessible object list.</AppText>
    {error?<EmptyState title="Progress unavailable" description="Please reopen this screen to try loading your progress again." />:!progress?<AppText muted>Loading your levels…</AppText>:levels.map((level,index)=>{
      const unlocked=isUnlocked(progress,index),record=progress.records[level.id];
      return <Pressable key={level.id} accessibilityRole="button" accessibilityState={{disabled:!unlocked}} disabled={!unlocked} accessibilityLabel={`Level ${level.number}, ${level.title}, ${unlocked?'unlocked':'locked'}${record?.completed?`, best score ${record.bestScore}`:''}`} style={({pressed})=>[styles.card,!unlocked&&styles.locked,pressed&&styles.pressed]} onPress={()=>router.push(`/difference/${level.id}`)}>
        <View style={styles.number}><AppText variant="heading" style={styles.numberText}>{String(level.number).padStart(2,'0')}</AppText></View><View style={styles.copy}><AppText variant="heading">{level.title}</AppText><AppText variant="caption" muted>{record?.completed?`Completed · best ${record.bestScore} pts`:unlocked?'Ready to play':'Complete the previous scene to unlock'}</AppText></View><AppText style={styles.arrow}>{unlocked?'→':'×'}</AppText>
      </Pressable>;
    })}</ScreenContainer>;
}
const styles=StyleSheet.create({kicker:{color:colors.secondary},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.medium,padding:spacing.lg,minHeight:touchTarget+40,flexDirection:'row',alignItems:'center',gap:spacing.lg},locked:{opacity:0.55},pressed:{opacity:0.7},number:{width:52,height:52,alignItems:'center',justifyContent:'center',backgroundColor:colors.surfaceRaised,borderRadius:radius.small},numberText:{color:colors.primary},copy:{flex:1,gap:spacing.xs},arrow:{color:colors.secondary,fontSize:24}});
