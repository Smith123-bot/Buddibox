import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesProvider } from '../features/settings/Preferences';
import { colors } from '../design/tokens';
export default function RootLayout() {
  return <SafeAreaProvider><PreferencesProvider><StatusBar style="light" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="games/[id]" options={{ title: 'Game details' }} />
    <Stack.Screen name="difference/index" options={{ title: 'Find the Difference' }} />
    <Stack.Screen name="difference/[id]" options={{ title: 'Find the Difference' }} />
    <Stack.Screen name="maze/index" options={{ title: 'Maze Escape' }} />
    <Stack.Screen name="maze/[id]" options={{ title: 'Maze Escape' }} />
    <Stack.Screen name="word-search/index" options={{ title: 'Word Search' }} />
    <Stack.Screen name="word-search/[id]" options={{ title: 'Word Search' }} />
    <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    <Stack.Screen name="about" options={{ title: 'About BuddhiBox' }} />
  </Stack></PreferencesProvider></SafeAreaProvider>;
}
