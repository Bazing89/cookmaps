import { Image, Text, View, type ViewStyle } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import { profileInitial } from '../../lib/profiles';

type Props = {
  uri?: string | null;
  name?: string | null;
  email?: string | null;
  size: number;
  border?: boolean;
  style?: ViewStyle;
};

export function CreatorAvatar({ uri, name, email, size, border = false, style }: Props) {
  const trimmedUri = uri?.trim();
  const fontSize = Math.round(size * 0.38);

  if (trimmedUri) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            borderWidth: border ? 2 : 0,
            borderColor: '#fff',
          },
          style,
        ]}
      >
        <Image
          source={{ uri: trimmedUri }}
          style={{ width: size, height: size, backgroundColor: cookTheme.surfaceElevated }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: cookTheme.accent,
          borderWidth: border ? 2 : 0,
          borderColor: '#fff',
        },
        style,
      ]}
    >
      <Text className="text-white" style={{ fontFamily: 'Syne_800ExtraBold', fontSize }}>
        {profileInitial(name, email)}
      </Text>
    </View>
  );
}
