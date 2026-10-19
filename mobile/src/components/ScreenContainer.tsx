import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../design/tokens';
export function ScreenContainer({ children, headerShown = false }: PropsWithChildren<{ headerShown?: boolean }>) {
  return <SafeAreaView edges={headerShown ? [] : ['top']} style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl } });
