import { StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SectionHeader } from '../../components/SectionHeader';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, spacing } from '../../design/tokens';
import { achievements } from '../../features/progress/achievements';
import { useUnifiedProgress } from '../../features/progress/useUnifiedProgress';

export default function ProgressScreen(){
  const state=useUnifiedProgress();
  if(!state)return <ScreenContainer><AppText variant="title" accessibilityRole="header">Your progress</AppText><AppText muted>Loading local progress…</AppText></ScreenContainer>;
  if(state.loadError)return <ScreenContainer><AppText variant="title" accessibilityRole="header">Progress unavailable</AppText><AppText style={styles.error}>Saved progress could not be read. No data was overwritten. Reopen this screen after resolving storage access.</AppText></ScreenContainer>;
  const {summary,grants,achievementError}=state;
  const badges=achievements(summary);
  const recentBadges=badges.filter(a=>a.earned&&grants?.earned[a.id]).sort((a,b)=>(grants?.earned[b.id]??0)-(grants?.earned[a.id]??0));
  return <ScreenContainer><View style={styles.section}><AppText variant="eyebrow" style={styles.accent}>YOUR JOURNEY</AppText><AppText variant="display" accessibilityRole="header">Your progress</AppText><AppText muted>Saved on this device only. No account or leaderboard.</AppText></View>
    <SurfaceCard><View style={styles.section}><AppText variant="heading">{summary.totalUnique} distinct levels cleared</AppText><AppText muted>{summary.totalClears} total clears · {summary.totalAttempts} attempts · {summary.gamesPlayed} of {summary.games.length} games played</AppText></View></SurfaceCard>
    <View style={styles.section}><SectionHeader title="By game" kicker="THREE PUZZLE WORLDS" />{summary.games.map(game=><SurfaceCard key={game.id}><View style={styles.section}><AppText variant="heading">{game.title}</AppText><AppText>{game.completedUnique} / {game.totalLevels} completed · {game.unlocked} unlocked</AppText><AppText variant="caption" muted>{game.bestScore===null?'No best score yet':`Best score ${game.bestScore}`} · {game.attempts} attempts</AppText>{game.recent&&<AppText variant="caption" muted>Recorded hints: {game.recordedHints}{game.recordedEffort!==null?` · Recorded ${game.id==='maze'?'moves':'misses'}: ${game.recordedEffort}`:''}</AppText>}</View></SurfaceCard>)}</View>
    {summary.recent.length>0?<View style={styles.section}><SectionHeader title="Recently completed" kicker="RECORDED RUNS" />{summary.recent.slice(0,3).map(run=><SurfaceCard key={`${run.gameId}-${run.runId}`}><AppText variant="heading">{run.title}</AppText><AppText variant="caption" muted>{summary.games.find(g=>g.id===run.gameId)?.title} · {run.score} pts · {new Date(run.completedAt).toLocaleDateString()}</AppText></SurfaceCard>)}</View>:<EmptyState title="No dated results yet" description="Complete a puzzle to see recent activity. Older saves did not record completion dates." />}
    <View style={styles.section}><SectionHeader title="Achievements" kicker="REAL MILESTONES" />{achievementError&&<AppText style={styles.error}>Achievement saving is unavailable. Try reopening Progress.</AppText>}{recentBadges.length>0&&<AppText variant="caption" muted>{recentBadges.length} unlocked · most recent: {recentBadges[0]?.title}</AppText>}{badges.map(badge=><SurfaceCard key={badge.id}><View style={styles.badge}><View style={styles.badgeText}><AppText variant="heading">{badge.title}{badge.earned&&grants?.earned[badge.id]?' ✓':''}</AppText><AppText variant="caption" muted>{badge.description}</AppText><AppText variant="caption" style={styles.accent}>{badge.current} / {badge.target}{badge.earned&&grants?.earned[badge.id]?` · Unlocked ${new Date(grants.earned[badge.id]!).toLocaleDateString()}`:''}</AppText></View></View></SurfaceCard>)}{!recentBadges.length&&<AppText variant="caption" muted>No achievements unlocked yet. Keep playing to reach a milestone.</AppText>}</View>
    {summary.hasLegacyRuns&&<AppText variant="caption" muted>Some older clears have no dated run details. Totals include those clears; recent activity and hint records only include newer attempts.</AppText>}
  </ScreenContainer>;
}
const styles=StyleSheet.create({section:{gap:spacing.md},badge:{flexDirection:'row',alignItems:'center'},badgeText:{flex:1,gap:spacing.xs},accent:{color:colors.secondary},error:{color:colors.error}});
