import { useState } from 'react';
import { router } from 'expo-router';
import { Switch, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors, spacing } from '../design/tokens';
import { usePreferences } from '../features/settings/Preferences';
export default function SettingsScreen() {
  const { preferences, ready, setHaptics } = usePreferences();
  const [error, setError] = useState(false);
  return <ScreenContainer headerShown><AppText variant="title" accessibilityRole="header">Settings</AppText><SurfaceCard><View style={styles.row}><View style={styles.copy}><AppText variant="heading">Touch feedback</AppText><AppText variant="caption" muted>Use subtle haptics when exploring game cards.</AppText></View><Switch accessibilityLabel="Touch feedback" value={preferences.haptics} disabled={!ready} onValueChange={value => { setError(false); void setHaptics(value).catch(() => setError(true)); }} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.text} /></View>{error && <AppText style={styles.error}>Could not save this preference. Please try again.</AppText>}</SurfaceCard><SurfaceCard><View style={styles.copy}><AppText variant="heading">About BuddhiBox</AppText><AppText muted>Think Smart. Play Sharp.</AppText><AppText variant="caption" muted>Version {Constants.expoConfig?.version ?? 'unknown'} · Offline-first puzzle app in development</AppText><PrimaryButton label="Read about this build" secondary onPress={() => router.push('/about')} /></View></SurfaceCard></ScreenContainer>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, copy: { flex: 1, gap: spacing.sm }, error: { color: colors.error, marginTop: spacing.sm } });
