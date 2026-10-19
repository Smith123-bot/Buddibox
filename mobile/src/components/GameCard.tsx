import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { border, colors, radius, spacing } from '../design/tokens';
import type { GameId } from '../features/games/catalog';
import { findGame } from '../features/games/catalog';
export function GameCard({ id, onPress }: { id: GameId; onPress: () => void }) {
  const game = findGame(id)!;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Explore ${game.title}. Playable now.`} onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <View style={[styles.art, { borderColor: game.accent }]} accessible={false}>
      <View style={[styles.orbit, { borderColor: game.accent }]} /><AppText variant="heading" style={{ color: game.accent }}>{game.mark}</AppText>
    </View>
    <View style={styles.copy}><AppText variant="heading">{game.title}</AppText><AppText variant="caption" muted>{game.description}</AppText><AppText variant="caption" style={{ color: game.accent, fontWeight: '700' }}>Explore game  →</AppText></View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: border.width, borderColor: border.color, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, minHeight: 152 },
  pressed: { opacity: 0.75 },
  art: { width: 74, height: 100, flexShrink: 0, backgroundColor: colors.surfaceRaised, borderRadius: radius.medium, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orbit: { position: 'absolute', width: 54, height: 54, borderWidth: 1, borderRadius: 27, transform: [{ rotate: '24deg' }] },
  copy: { flex: 1, minWidth: 0, gap: spacing.xs },
});
