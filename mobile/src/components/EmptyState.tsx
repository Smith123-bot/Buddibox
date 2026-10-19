import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { SurfaceCard } from './SurfaceCard';
import { spacing } from '../design/tokens';
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <SurfaceCard><View style={styles.content}><AppText variant="heading">{title}</AppText><AppText muted>{description}</AppText></View></SurfaceCard>;
}
const styles = StyleSheet.create({ content: { gap: spacing.sm } });
