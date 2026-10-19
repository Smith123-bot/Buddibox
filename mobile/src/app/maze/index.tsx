import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors, radius, spacing, touchTarget } from '../../design/tokens';
import { mazeLevels } from '../../features/maze/levels';
import { useMazeProgress } from '../../features/maze/useMazeProgress';
import { mazeUnlocked } from '../../storage/mazeProgress';

export default function MazeLevels(){
  const {progress,error}=useMazeProgress();
  const [shown,setShown]=useState(20);
  const highest=progress?mazeLevels.reduce((last,_,index)=>mazeUnlocked(progress,index)?index:last,0):0;
  return <ScreenContainer headerShown>
    <AppText variant="eyebrow" style={styles.accent}>MAZE ESCAPE</AppText>
    <AppText variant="title" accessibilityRole="header">Choose your route</AppText>
    <AppText muted>Guide the golden marker from S to the green exit. Walls block your path. Use the four directional controls; hints show your next step.</AppText>
    {error?<AppText style={styles.error}>Saved Maze progress could not be read. No data was overwritten. Reopen this screen after resolving storage access.</AppText>:!progress?<AppText muted>Loading levels…</AppText>:<>
      <AppText muted>Highest unlocked: Route {highest+1} of {mazeLevels.length}. Complete a route to unlock the next. Replays keep your best score.</AppText>
      <PrimaryButton label={`Play next available: Route ${highest+1}`} onPress={()=>router.push(`/maze/${mazeLevels[highest]!.id}`)} />
      {mazeLevels.slice(0,shown).map((level,index)=>{
        const unlocked=mazeUnlocked(progress,index),record=progress.records[level.id];
        const selected=progress.session?.levelId===level.id;
        const status=record?.clears?'Completed':unlocked?'Unlocked':'Locked';
        return <View key={level.id} style={styles.group}>
          {(index===0||mazeLevels[index-1]!.difficulty!==level.difficulty)&&<AppText variant="heading" accessibilityRole="header" style={styles.accent}>{level.difficulty} · Routes {level.number}–{Math.min(mazeLevels.length,level.difficulty==='Beginner'?10:level.difficulty==='Easy'?25:level.difficulty==='Medium'?50:level.difficulty==='Hard'?75:level.difficulty==='Expert'?90:100)}</AppText>}
          <Pressable accessibilityRole="button" accessibilityState={{disabled:!unlocked,selected}} disabled={!unlocked}
            accessibilityLabel={`Maze route ${level.number}, ${level.difficulty}, ${status}${selected?', current session':''}${record?.clears?`, best score ${record.bestScore}`:''}`}
            onPress={()=>router.push(`/maze/${level.id}`)} style={({pressed})=>[styles.card,!unlocked&&styles.locked,selected&&styles.selected,pressed&&styles.pressed]}>
            <View style={styles.number}><AppText variant="heading" style={styles.accent}>{String(level.number).padStart(2,'0')}</AppText></View>
            <View style={styles.copy}><AppText variant="heading">Route {level.number} {record?.clears?'✓':''}</AppText><AppText variant="caption" muted>{record?.clears?`Completed · best ${record.bestScore}`:unlocked?`${level.rows} × ${level.cols} · ready to play`:'Clear the previous route to unlock'}</AppText></View>
            <AppText style={styles.accent}>{unlocked?'→':'×'}</AppText>
          </Pressable>
        </View>;
      })}
      {shown<mazeLevels.length&&<PrimaryButton label={`Show more routes (${Math.min(shown+20,mazeLevels.length)} of ${mazeLevels.length})`} secondary onPress={()=>setShown(count=>Math.min(count+20,mazeLevels.length))} />}
    </>}
    <PrimaryButton label="Back to Games" secondary onPress={()=>router.replace('/games')} />
  </ScreenContainer>;
}
const styles=StyleSheet.create({error:{color:colors.error},accent:{color:colors.secondary},group:{gap:spacing.sm},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.medium,padding:spacing.lg,minHeight:touchTarget+40,flexDirection:'row',alignItems:'center',gap:spacing.lg},locked:{opacity:0.5},selected:{borderColor:colors.highlight},pressed:{opacity:0.7},number:{width:52,height:52,alignItems:'center',justifyContent:'center',backgroundColor:colors.surfaceRaised,borderRadius:radius.small},copy:{flex:1,minWidth:0,gap:spacing.xs}});
