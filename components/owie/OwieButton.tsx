import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bodyFont, theme } from '../../theme/owieTheme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function OwieButton({ title, onPress, variant = 'primary', disabled }: Props) {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ((pressed && !disabled) || disabled ? { opacity: disabled ? 0.45 : 0.9 } : undefined)}
    >
      <View
        style={[
          styles.base,
          isSecondary && styles.secondary,
          isDanger && styles.danger,
        ]}
      >
        <Text
          style={[
            styles.label,
            isSecondary && styles.labelSecondary,
            isDanger && styles.labelDanger,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%' as const,
    marginTop: 4,
    backgroundColor: theme.buttonBg,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.outline,
  },
  danger: {
    backgroundColor: theme.danger,
  },
  label: {
    color: theme.buttonText,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    fontFamily: bodyFont,
  },
  labelSecondary: {
    color: theme.text,
  },
  labelDanger: {
    color: '#fff',
  },
});
