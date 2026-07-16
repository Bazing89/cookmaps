import { Ionicons } from '@expo/vector-icons';
import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { bunnyImageSource, resolveStreamThumbnail } from '../../lib/bunnyStream';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';

type Props = {
  stream: Pick<LiveStream, 'coverImage' | 'bunnyVideoId' | 'thumbnailUrl'>;
  className?: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export function StreamThumbnailImage({ stream, className, style, containerStyle }: Props) {
  const uri = resolveStreamThumbnail(stream.coverImage, stream.bunnyVideoId, stream.thumbnailUrl);
  const source = bunnyImageSource(uri);

  if (!source) {
    return (
      <View
        className={`items-center justify-center bg-white/5 ${className ?? ''}`}
        style={containerStyle}
      >
        <Ionicons name="film-outline" size={28} color={cookTheme.textMuted} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      className={className}
      style={style}
      resizeMode="cover"
    />
  );
}
