import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── XP BAR ──────────────────────────────────
interface XpBarProps {
  current: number;
  max: number;
  level: number;
}

export const XpBar: React.FC<XpBarProps> = ({ current, max, level }) => {
  const progress = Math.min(current / max, 1);

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.xpContainer}>
      <View style={styles.xpHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{level}</Text>
        </View>
        <Text style={styles.xpText}>
          {current.toLocaleString()} / {max.toLocaleString()} XP
        </Text>
      </View>
      <View style={styles.xpTrack}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.xpFill, { width: `${progress * 100}%` as any }]}
        />
      </View>
    </Animated.View>
  );
};

// ─── STREAK CARD ────────────────────────────────
interface StreakCardProps {
  days: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ days }) => {
  return (
    <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.streakContainer}>
      <Text style={styles.streakEmoji}>🔥</Text>
      <View>
        <Text style={styles.streakDays}>{days}</Text>
        <Text style={styles.streakLabel}>dias seguidos</Text>
      </View>
    </Animated.View>
  );
};

// ─── STAT CARD ──────────────────────────────────
interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color = colors.primary,
}) => {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// ─── COINS DISPLAY ──────────────────────────────
interface CoinsDisplayProps {
  amount: number;
}

export const CoinsDisplay: React.FC<CoinsDisplayProps> = ({ amount }) => {
  return (
    <View style={styles.coinsContainer}>
      <Text style={styles.coinIcon}>🪙</Text>
      <Text style={styles.coinAmount}>{amount.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // XP Bar
  xpContainer: {
    marginBottom: spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  levelText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  xpTrack: {
    height: 8,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },

  // Streak
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: spacing.md,
  },
  streakEmoji: {
    fontSize: 28,
  },
  streakDays: {
    color: colors.warning,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
  },
  streakLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },

  // Stat Card
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },

  // Coins
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coinIcon: {
    fontSize: 16,
  },
  coinAmount: {
    color: colors.coins,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
