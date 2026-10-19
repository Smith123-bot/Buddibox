import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { border, colors, radius, spacing } from '../design/tokens';
export function SurfaceCard({ children }: PropsWithChildren) { return <View style={styles.card}>{children}</View>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: border.color, borderWidth: border.width, borderRadius: radius.card, padding: spacing.xl } });
