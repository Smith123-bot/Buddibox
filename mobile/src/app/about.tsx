import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
export default function AboutScreen() {
  return <ScreenContainer headerShown><AppText variant="title" accessibilityRole="header">About BuddhiBox</AppText><SurfaceCard><AppText>Think Smart. Play Sharp.</AppText><AppText muted>BuddhiBox is a native Android puzzle app in development. Play Find the Difference, Maze Escape, and English or Hindi Word Search offline. Completed levels and achievements are saved locally on this device; no account or cloud backup is provided.</AppText></SurfaceCard></ScreenContainer>;
}
