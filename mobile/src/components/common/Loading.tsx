import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, fontSize, fontWeight } from '../../theme';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Carregando...' }) => {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Text style={styles.logo}>DATAFIT</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: colors.primary,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: 4,
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  skeleton: {
    backgroundColor: colors.bgTertiary,
  },
});
