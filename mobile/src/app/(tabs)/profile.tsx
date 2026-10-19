import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, radius, spacing } from '../../design/tokens';
import { achievements } from '../../features/progress/achievements';
import { useUnifiedProgress } from '../../features/progress/useUnifiedProgress';
export default function ProfileScreen(){
  const state=useUnifiedProgress(),summary=state?.loadError?null:state?.summary;
  const count=summary&&state?.grants?achievements(summary).filter(a=>a.earned&&state.grants?.earned[a.id]).length:0;
  const recent=summary?.recent[0];
  return <ScreenContainer><AppText variant="display" accessibilityRole="header">Player profile</AppText><SurfaceCard><View style={styles.row}><View style={styles.avatar}><AppText variant="heading" style={styles.initial}>P</AppText></View><View style={styles.copy}><AppText variant="heading">Local player</AppText><AppText variant="caption" muted>No account · progress stays on this device</AppText></View></View></SurfaceCard>
    {state?.loadError?<AppText style={styles.error}>Saved progress could not be read. No data was overwritten.</AppText>:!state?<AppText muted>Loading local progress…</AppText>:summary?.totalAttempts||summary?.totalClears?<SurfaceCard><View style={styles.copy}><AppText variant="heading">Your local play</AppText><AppText muted>{summary.totalUnique} distinct levels · {summary.totalClears} total clears</AppText><AppText muted>{summary.gamesPlayed} games played · {count} achievements unlocked</AppText><AppText variant="caption" muted>{recent?`Recently completed: ${recent.title}`:'No dated completion recorded yet.'}</AppText></View></SurfaceCard>:<EmptyState title="No stats just yet" description="Start a puzzle to see your real progress here." />}
    <PrimaryButton label="View progress and achievements" secondary onPress={()=>router.push('/progress')} /><PrimaryButton label="Settings" secondary onPress={()=>router.push('/settings')} />
  </ScreenContainer>;
}
const styles=StyleSheet.create({error:{color:colors.error},row:{flexDirection:'row',alignItems:'center',gap:spacing.lg},avatar:{height:54,width:54,borderRadius:radius.medium,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},initial:{color:colors.buttonText},copy:{flex:1,gap:spacing.sm}});
