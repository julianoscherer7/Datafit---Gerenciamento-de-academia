import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, borderRadius, fontSize, fontWeight } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (!loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fs: fontSize.sm },
    md: { paddingVertical: 12, paddingHorizontal: 24, fs: fontSize.md },
    lg: { paddingVertical: 16, paddingHorizontal: 32, fs: fontSize.lg },
  };

  const s = sizeStyles[size];

  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && { width: '100%' }, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#4b5563', '#374151'] : [colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.textPrimary, { fontSize: s.fs }, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: colors.bgTertiary },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.error },
  };

  const variantTextColors: Record<string, string> = {
    secondary: colors.textPrimary,
    outline: colors.primary,
    ghost: colors.textSecondary,
    danger: colors.error,
  };

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[animatedStyle, fullWidth && { width: '100%' }, style]}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.base,
          variantStyles[variant],
          { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal },
          disabled && { opacity: 0.5 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variantTextColors[variant]} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.text,
                { fontSize: s.fs, color: variantTextColors[variant] },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  textPrimary: {
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});
