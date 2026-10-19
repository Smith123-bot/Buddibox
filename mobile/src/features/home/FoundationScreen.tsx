import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { GameCard } from '../../components/GameCard';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SectionHeader } from '../../components/SectionHeader';
import { colors, radius, spacing } from '../../design/tokens';
import { games } from '../games/catalog';
import { useUnifiedProgress } from '../progress/useUnifiedProgress';
import { achievements } from '../progress/achievements';
import { getLevel } from '../difference/levels';
import { getMazeLevel } from '../maze/levels';
import { getPuzzle } from '../word-search/puzzles';
import { PrimaryButton } from '../../components/PrimaryButton';
import { usePreferences } from '../settings/Preferences';

export function FoundationScreen() {
  const { feedback } = usePreferences();
  const unified=useUnifiedProgress();
  const {difference,maze,word}=unified?.sources??{difference:null,maze:null,word:null};
  const resume=difference?.session&&getLevel(difference.session.levelId);
  const resumeMaze=maze?.session&&getMazeLevel(maze.session.levelId);
  const resumeWord=word?.session&&getPuzzle(word.session.puzzleId);
  const summary=unified?.loadError?null:unified?.summary;
  const highlight=summary&&unified?.grants?achievements(summary).filter(a=>a.earned&&unified.grants?.earned[a.id]).sort((a,b)=>(unified.grants?.earned[b.id]??0)-(unified.grants?.earned[a.id]??0))[0]:null;
  return <ScreenContainer>
    <View style={styles.top}>
      <View style={styles.logo}><AppText variant="heading" style={styles.logoText}>B.</AppText></View>
      <View style={styles.brand}><AppText variant="heading">BuddhiBox</AppText><AppText variant="caption" muted>Your puzzle space</AppText></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Open player profile" onPress={() => router.push('/profile')} style={styles.profile}><AppText variant="heading" style={styles.profileLetter}>P</AppText></Pressable>
    </View>
    <View style={styles.hero}>
      <View style={styles.heroTop}><View style={styles.dot} /><AppText variant="eyebrow" style={styles.heroKicker}>A LITTLE CHALLENGE, EVERY DAY</AppText></View>
      <AppText variant="display" accessibilityRole="header">Think Smart.{ '\n' }Play Sharp.</AppText>
      <AppText muted>Take a moment to think differently. Choose a puzzle and make every moment count.</AppText>
      <View style={styles.heroDecoration} accessible={false}><View style={styles.ring} /><View style={styles.ringSmall} /></View>
    </View>
    {unified?.loadError&&<AppText style={styles.storageError}>Saved progress could not be read. No data was overwritten.</AppText>}
    {resume && <View style={styles.section}><SectionHeader title="Continue playing" kicker="SAVED SESSION" /><AppText muted>Find the Difference · {resume.title}</AppText><PrimaryButton label="Resume scene" onPress={() => router.push(`/difference/${resume.id}`)} /></View>}
    {resumeMaze && <View style={styles.section}><SectionHeader title="Continue Maze Escape" kicker="SAVED SESSION" /><AppText muted>Route {resumeMaze.number}</AppText><PrimaryButton label="Resume maze" onPress={() => router.push(`/maze/${resumeMaze.id}`)} /></View>}
    {resumeWord && <View style={styles.section}><SectionHeader title="Continue Word Search" kicker="SAVED SESSION" /><AppText muted>{resumeWord.language==='hi'?'हिन्दी':'English'} · {resumeWord.title}</AppText><PrimaryButton label="Resume word puzzle" onPress={() => router.push(`/word-search/${resumeWord.id}`)} /></View>}
    <View style={styles.section}><SectionHeader title="Explore the games" kicker="YOUR NEXT CHALLENGE" />
      <AppText variant="caption" muted>Explore three puzzle worlds, including Hindi and English words.</AppText>
      {games.map(game => <GameCard key={game.id} id={game.id} onPress={() => { feedback(); router.push(`/games/${game.id}`); }} />)}
    </View>
    {highlight&&<View style={styles.section}><SectionHeader title="Achievement unlocked" kicker="YOUR MILESTONE" /><AppText>{highlight.title} · {highlight.description}</AppText></View>}
    <View style={styles.footer}><AppText variant="caption" muted>{!unified ? 'Loading local progress…' : unified.loadError ? 'Progress unavailable until saved data can be read.' : summary?.totalUnique ? `${summary.totalUnique} distinct levels cleared · ${summary.totalClears} total clears` : 'Your completed levels will appear here after your first clear.'}</AppText></View>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minWidth: 0 },
  logo: { width: 46, height: 46, backgroundColor: colors.primary, borderRadius: radius.medium, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.buttonText }, brand: { flex: 1, minWidth: 0 }, profile: { minWidth: 48, minHeight: 48, borderRadius: 24, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }, profileLetter: { color: colors.secondary },
  hero: { backgroundColor: colors.surfaceRaised, padding: spacing.xl, borderRadius: radius.card, gap: spacing.lg, overflow: 'hidden', minHeight: 240 },
  heroTop: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, dot: { height: 7, width: 7, borderRadius: 4, backgroundColor: colors.secondary }, heroKicker: { color: colors.secondary, flexShrink: 1 },
  heroDecoration: { position: 'absolute', right: -36, bottom: -52, opacity: 0.25 }, ring: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: colors.primary }, ringSmall: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: colors.highlight, top: 34, left: 36 },
  storageError:{color:colors.error},section: { gap: spacing.md }, footer: { paddingBottom: spacing.sm },
});
