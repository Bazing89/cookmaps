import { type ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { theme } from '../../theme/owieTheme';

type Props = { children: ReactNode };

const MAX = 900;

export function OwieAppShell({ children }: Props) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 600;

  return (
    <View
      style={[
        styles.shadowWrap,
        isNarrow && styles.shadowWrapNarrow,
        { maxWidth: MAX, width: '100%' as const, alignSelf: 'center' },
      ]}
    >
      <View style={[styles.shell, isNarrow && { borderRadius: 10 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
      web: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
  shadowWrapNarrow: {
    borderRadius: 8,
  },
  shell: {
    backgroundColor: theme.surface2,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
  },
});
