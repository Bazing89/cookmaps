import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { bodyFont, owie } from '../../theme/owieTheme';

type Props = { legend: string; children: ReactNode };

export function OwieFieldset({ legend, children }: Props) {
  return (
    <View style={styles.fieldset}>
      <Text style={styles.legend}>{legend}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldset: {
    backgroundColor: owie.bgSurface2,
    borderWidth: 1,
    borderColor: owie.border,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  legend: {
    color: owie.textPrimary,
    marginBottom: 8,
    fontWeight: '600' as const,
    fontFamily: bodyFont,
  },
});
