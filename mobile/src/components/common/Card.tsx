import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { colors, borderRadius, shadows, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pressable?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'glass' | 'highlight';
  entering?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  pressable = false,
  onPress,
  variant = 'default',
  entering,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
    },
    glass: {
      backgroundColor: colors.bgGlass,
      borderColor: colors.borderLight,
    },
    highlight: {
      backgroundColor: colors.primaryGlow,
      borderColor: colors.primary,
    },
  };

  if (pressable && onPress) {
    return (
      <Animated.View
        entering={entering || FadeIn.duration(300)}
        style={[styles.card, variantStyles[variant], animatedStyle, style]}
      >
        <View
          onTouchStart={handlePressIn}
          onTouchEnd={() => {
            handlePressOut();
            onPress();
          }}
          onTouchCancel={handlePressOut}
        >
          {children}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={entering || FadeIn.duration(300)}
      style={[styles.card, variantStyles[variant], style]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.md,
  },
});
