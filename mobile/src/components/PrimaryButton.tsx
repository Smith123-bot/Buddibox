import { Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing, touchTarget } from '../design/tokens';
type Props = { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean };
export function PrimaryButton({ label, onPress, disabled = false, secondary = false }: Props) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, (pressed || disabled) && styles.dim]}>
    <AppText style={[styles.label, secondary && styles.secondaryLabel]}>{label}</AppText>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: touchTarget, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.small, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
  dim: { opacity: 0.65 },
  label: { color: colors.buttonText, fontWeight: '800', textAlign: 'center' },
  secondaryLabel: { color: colors.text },
});
