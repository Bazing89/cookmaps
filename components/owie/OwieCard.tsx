import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { owie } from '../../theme/owieTheme';

type Props = { children: ReactNode };

export function OwieCard({ children }: Props) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: owie.bgSurface2,
    borderWidth: 1,
    borderColor: owie.border,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
});
