import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fontWeight, borderRadius, spacing } from '../../theme';
import { useGamificationStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── XP GAIN POPUP ─────────────────────────────
const XpGainOverlay: React.FC = () => {
  const { showXpGain, xpGainAmount } = useGamificationStore();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (showXpGain) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1800, withTiming(0, { duration: 400 }))
      );
      translateY.value = withSequence(
        withSpring(-20, { damping: 10 }),
        withDelay(1800, withTiming(-60, { duration: 400 }))
      );
    }
  }, [showXpGain]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!showXpGain) return null;

  return (
    <Animated.View style={[styles.xpOverlay, animStyle]} pointerEvents="none">
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.xpBadge}
      >
        <Text style={styles.xpGainText}>+{xpGainAmount} XP</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ─── COIN GAIN POPUP ────────────────────────────
const CoinGainOverlay: React.FC = () => {
  const { showCoinGain, coinGainAmount } = useGamificationStore();

  useEffect(() => {
    if (showCoinGain) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [showCoinGain]);

  if (!showCoinGain) return null;

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(12)}
      exiting={FadeOut.duration(300)}
      style={styles.coinOverlay}
      pointerEvents="none"
    >
      <View style={styles.coinBadge}>
        <Text style={styles.coinIcon}>🪙</Text>
        <Text style={styles.coinGainText}>+{coinGainAmount}</Text>
      </View>
    </Animated.View>
  );
};

// ─── LEVEL UP POPUP ─────────────────────────────
const LevelUpOverlay: React.FC = () => {
  const { showLevelUp, newLevel } = useGamificationStore();

  useEffect(() => {
    if (showLevelUp) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [showLevelUp]);

  if (!showLevelUp) return null;

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(8)}
      exiting={FadeOut.duration(400)}
      style={styles.fullOverlay}
      pointerEvents="none"
    >
      <View style={styles.levelUpContainer}>
        <Text style={styles.levelUpEmoji}>🎉</Text>
        <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
        <View style={styles.levelUpCircle}>
          <Text style={styles.levelUpNumber}>{newLevel}</Text>
        </View>
        <Text style={styles.levelUpSub}>Parabéns! Você subiu de nível</Text>
      </View>
    </Animated.View>
  );
};

// ─── BADGE UNLOCK ───────────────────────────────
const BadgeUnlockOverlay: React.FC = () => {
  const { showBadge, badgeName, badgeIcon } = useGamificationStore();

  useEffect(() => {
    if (showBadge) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [showBadge]);

  if (!showBadge) return null;

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(8)}
      exiting={FadeOut.duration(400)}
      style={styles.fullOverlay}
      pointerEvents="none"
    >
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeEmoji}>{badgeIcon || '🏆'}</Text>
        <Text style={styles.badgeTitle}>Badge Desbloqueada!</Text>
        <Text style={styles.badgeName}>{badgeName}</Text>
      </View>
    </Animated.View>
  );
};

// ─── COMBINED OVERLAY ───────────────────────────
export const GamificationOverlay: React.FC = () => {
  return (
    <>
      <XpGainOverlay />
      <CoinGainOverlay />
      <LevelUpOverlay />
      <BadgeUnlockOverlay />
    </>
  );
};

const styles = StyleSheet.create({
  xpOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 9999,
  },
  xpBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
  },
  xpGainText: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 2,
  },
  coinOverlay: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    zIndex: 9999,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.warning,
    gap: 8,
  },
  coinIcon: {
    fontSize: 20,
  },
  coinGainText: {
    color: colors.coins,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 99999,
  },
  levelUpContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  levelUpEmoji: {
    fontSize: 64,
  },
  levelUpTitle: {
    color: colors.primary,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: 4,
  },
  levelUpCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryGlow,
  },
  levelUpNumber: {
    color: colors.primary,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
  },
  levelUpSub: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  badgeContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  badgeEmoji: {
    fontSize: 72,
  },
  badgeTitle: {
    color: colors.gradientEnd,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  badgeName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
  },
});
