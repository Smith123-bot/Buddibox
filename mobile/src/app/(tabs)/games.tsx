import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { GameCard } from '../../components/GameCard';
import { ScreenContainer } from '../../components/ScreenContainer';
import { games } from '../../features/games/catalog';
import { usePreferences } from '../../features/settings/Preferences';
import { spacing } from '../../design/tokens';
export default function GamesScreen() {
  const { feedback } = usePreferences();
  return <ScreenContainer><View style={styles.heading}><AppText variant="eyebrow" muted>THE COLLECTION</AppText><AppText variant="display" accessibilityRole="header">All games</AppText><AppText muted>Three ways to challenge your mind. Three puzzle games to explore.</AppText></View>{games.map(game => <GameCard key={game.id} id={game.id} onPress={() => { feedback(); router.push(`/games/${game.id}`); }} />)}</ScreenContainer>;
}
const styles = StyleSheet.create({ heading: { gap: spacing.sm } });
