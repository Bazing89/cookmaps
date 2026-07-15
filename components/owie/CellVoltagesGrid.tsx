import { StyleSheet, Text, View } from 'react-native';
import { bodyFont, owie } from '../../theme/owieTheme';

const MOCK = ['4.12', '4.10', '4.11', '4.09'];

export function CellVoltagesGrid() {
  return (
    <View style={styles.grid}>
      {MOCK.map((v, i) => (
        <View key={i} style={styles.cell}>
          <Text style={styles.cellText}>{v}v</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  cell: {
    width: '48%' as const,
    marginBottom: 6,
    padding: 6,
    backgroundColor: owie.cellBg,
    borderWidth: 1,
    borderColor: owie.cellBorder,
    borderRadius: 4.8,
    alignItems: 'center' as const,
  },
  cellText: {
    color: owie.textPrimary,
    fontFamily: bodyFont,
  },
});
