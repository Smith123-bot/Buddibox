import { Tabs } from 'expo-router';
import { AppText } from '../../components/AppText';
import { colors, spacing } from '../../design/tokens';
export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, minHeight: 64, paddingTop: spacing.sm }, tabBarLabelStyle: { fontSize: 12, fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <AppText style={{ color, fontWeight: '900' }}>⌂</AppText> }} />
    <Tabs.Screen name="games" options={{ title: 'Games', tabBarIcon: ({ color }) => <AppText style={{ color, fontWeight: '900' }}>◇</AppText> }} />
    <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color }) => <AppText style={{ color, fontWeight: '900' }}>▥</AppText> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <AppText style={{ color, fontWeight: '900' }}>◯</AppText> }} />
  </Tabs>;
}
