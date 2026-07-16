import { Image, StyleSheet, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  avatarUri: string;
  amount?: number;
  size?: number;
};

export function ChefMapPin({ avatarUri, amount, size = 44 }: Props) {
  const ringSize = size;
  const radius = ringSize / 2;

  return (
    <View style={styles.pin}>
      <View
        style={[
          styles.avatarRing,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={{ uri: avatarUri }}
          style={{ width: ringSize, height: ringSize, borderRadius: radius }}
        />
      </View>
      {amount != null ? (
        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>${amount}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    alignItems: 'center',
  },
  avatarRing: {
    borderColor: '#fff',
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: cookTheme.surface,
  },
  amountBadge: {
    backgroundColor: cookTheme.accent,
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  amountText: {
    color: '#fff',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
  },
});
