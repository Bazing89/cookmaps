import { StyleSheet, Text, View } from 'react-native';
import { bodyFont, owie } from '../../theme/owieTheme';

type Props = { title: string; subtitle?: string };

export function OwieHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.h2}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  h2: {
    margin: 0,
    fontSize: 22.4, // 1.4rem
    color: owie.textPrimary,
    fontWeight: '600' as const,
    fontFamily: bodyFont,
  },
  subtitle: {
    color: owie.textMuted,
    fontSize: 14.4, // 0.9rem
    marginTop: 4,
    fontFamily: bodyFont,
  },
});
