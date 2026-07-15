import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { bodyFont, owie } from '../../theme/owieTheme';

type Props = { label: string; value: string; stack?: boolean };

export function StatRow({ label, value, stack: stackOverride }: Props) {
  const { width } = useWindowDimensions();
  const stack = stackOverride ?? width < 600;
  if (stack) {
    return (
      <View style={styles.block}>
        <Text style={styles.thStack}>{label}</Text>
        <View style={styles.tdBox}>
          <Text style={[styles.tdText, styles.tdTextStack]}>{value}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <Text style={styles.th} numberOfLines={3}>
        {label}
      </Text>
      <View style={styles.tdBoxFlex}>
        <Text style={styles.tdText}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%' as const,
  },
  block: { marginBottom: 10, width: '100%' as const },
  th: {
    width: '52%' as const,
    color: owie.textMuted,
    fontWeight: '600' as const,
    textAlign: 'left',
    paddingRight: 8,
    fontFamily: bodyFont,
  },
  thStack: {
    color: owie.textMuted,
    fontWeight: '600' as const,
    textAlign: 'left',
    paddingBottom: 4,
    width: '100%' as const,
    fontFamily: bodyFont,
  },
  tdBox: {
    backgroundColor: owie.tdValueBg,
    borderWidth: 1,
    borderColor: owie.tdBorder,
    borderRadius: 8,
    padding: 8,
  },
  tdBoxFlex: {
    flex: 1,
    backgroundColor: owie.tdValueBg,
    borderWidth: 1,
    borderColor: owie.tdBorder,
    borderRadius: 8,
    padding: 8,
  },
  tdText: {
    color: owie.textPrimary,
    textAlign: 'right',
    fontFamily: bodyFont,
  },
  tdTextStack: {
    textAlign: 'left',
  },
});
