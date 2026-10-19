import { router } from 'expo-router';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
export default function NotFound() {
  return <ScreenContainer headerShown><AppText variant="title" accessibilityRole="header">Page not found</AppText><AppText muted>This destination is not available.</AppText><PrimaryButton label="Go home" onPress={() => router.replace('/')} /></ScreenContainer>;
}
