import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../design/tokens';
export function SectionHeader({ title, kicker }: { title: string; kicker?: string }) {
  return <View style={styles.wrap}>{kicker && <AppText variant="eyebrow" style={styles.kicker}>{kicker}</AppText>}<AppText variant="heading" accessibilityRole="header">{title}</AppText></View>;
}
const styles = StyleSheet.create({ wrap: { gap: spacing.xs }, kicker: { color: colors.secondary } });
