import type { ComponentProps, PropsWithChildren } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, typeScale } from '../design/tokens';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'caption' | 'eyebrow';
type Props = PropsWithChildren<ComponentProps<typeof Text> & { variant?: Variant; muted?: boolean }>;
export function AppText({ variant = 'body', muted = false, style, children, ...props }: Props) {
  return <Text {...props} style={[styles.base, styles[variant], muted && styles.muted, style]}>{children}</Text>;
}
const styles = StyleSheet.create({
  base: { color: colors.text, fontSize: typeScale.body, lineHeight: 24 },
  display: { fontSize: typeScale.display, lineHeight: 38, fontWeight: '800' },
  title: { fontSize: typeScale.title, lineHeight: 33, fontWeight: '800' },
  heading: { fontSize: typeScale.heading, lineHeight: 29, fontWeight: '700' },
  body: {}, caption: { fontSize: typeScale.caption, lineHeight: 21 },
  eyebrow: { fontSize: typeScale.eyebrow, lineHeight: 18, letterSpacing: 1.5, fontWeight: '700' },
  muted: { color: colors.muted },
});
