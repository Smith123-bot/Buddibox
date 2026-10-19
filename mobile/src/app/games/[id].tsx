import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, radius, spacing } from '../../design/tokens';
import { findGame } from '../../features/games/catalog';
export default function GameDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = findGame(typeof id === 'string' ? id : '');
  if (!game) return <ScreenContainer headerShown><AppText variant="heading" accessibilityRole="header">Game not found</AppText><AppText muted>This game is not in the BuddhiBox collection.</AppText><PrimaryButton label="Back to games" onPress={() => router.replace('/games')} /></ScreenContainer>;
  return <ScreenContainer headerShown><View style={[styles.banner, { borderColor: game.accent }]}><AppText variant="eyebrow" style={{ color: game.accent }}>PUZZLE WORLD {game.mark}</AppText><AppText variant="display" accessibilityRole="header">{game.title}</AppText><AppText muted>{game.description}</AppText></View><SurfaceCard><View style={styles.copy}><AppText variant="heading">How it works</AppText><AppText muted>{game.detail}</AppText></View></SurfaceCard><PrimaryButton label="Choose a level" onPress={() => router.push(game.id === 'maze' ? '/maze' : game.id === 'word-search' ? '/word-search' : '/difference')} /><PrimaryButton label="Back to games" secondary onPress={() => router.back()} /></ScreenContainer>;
}
const styles = StyleSheet.create({ banner: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderRadius: radius.card, padding: spacing.xl, gap: spacing.lg, minHeight: 210 }, copy: { gap: spacing.sm } });
