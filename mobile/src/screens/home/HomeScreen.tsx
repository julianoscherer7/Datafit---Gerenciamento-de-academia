import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../theme';
import { Card, XpBar, StreakCard, StatCard } from '../../components/common';
import { useAuthStore, useGamificationStore } from '../../store';
import { dashboardService } from '../../services';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const gamification = useGamificationStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await dashboardService.getDashboard();
      setDashboard(data);
      
      // Update gamification store
      gamification.setStats({
        xp: data.xp || data.usuario?.xp || 0,
        level: data.level || data.usuario?.level || 1,
        moedas: data.moedas || data.usuario?.moedas || 0,
        streak: data.streak?.atual || data.streak || 0,
        titulo: data.titulo || data.usuario?.titulo || '',
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, [fetchDashboard]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user?.nome?.split(' ')[0] || 'Atleta';
  const streak = dashboard?.streak?.atual || dashboard?.streak || 0;
  const xp = dashboard?.xp || user?.xp || 0;
  const level = dashboard?.level || user?.level || 1;
  const xpNextLevel = level * 1000;
  const moedas = dashboard?.moedas || user?.moedas || 0;
  const treinosCount = dashboard?.treinos_semana || 0;
  const badgesCount = dashboard?.badges_count || 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.greeting}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userName}>{firstName} 💪</Text>
          </View>
          <View style={styles.coinsRow}>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={styles.coinValue}>{moedas.toLocaleString()}</Text>
          </View>
        </Animated.View>

        {/* XP Bar */}
        <XpBar current={xp} max={xpNextLevel} level={level} />

        {/* Streak */}
        {streak > 0 && <StreakCard days={streak} />}

        {/* Big CTA — Start Workout */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Treino')}
            style={styles.ctaWrapper}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaEmoji}>🏋️</Text>
              <Text style={styles.ctaTitle}>INICIAR TREINO</Text>
              <Text style={styles.ctaSub}>Vamos treinar hoje!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.statsRow}>
          <StatCard icon="💪" value={treinosCount} label="Treinos\nesta semana" color={colors.primary} />
          <StatCard icon="🔥" value={streak} label="Dias\nde streak" color={colors.streak} />
          <StatCard icon="🏆" value={badgesCount} label="Badges\nconquistados" color={colors.level} />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('CheckIn')}
            >
              <Text style={styles.qaEmoji}>📸</Text>
              <Text style={styles.qaText}>Check-in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Social')}
            >
              <Text style={styles.qaEmoji}>👥</Text>
              <Text style={styles.qaText}>Amigos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.qaEmoji}>💬</Text>
              <Text style={styles.qaText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Perfil')}
            >
              <Text style={styles.qaEmoji}>📊</Text>
              <Text style={styles.qaText}>Progresso</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Ranking Preview */}
        <Animated.View entering={FadeInRight.delay(600).duration(500)}>
          <Card style={styles.rankingCard}>
            <Text style={styles.sectionTitle}>🏅 Ranking Top 3</Text>
            <Text style={styles.rankingHint}>
              Veja o ranking completo em Amigos
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Social')}
              style={styles.rankingLink}
            >
              <Text style={styles.rankingLinkText}>Ver ranking →</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greetingText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  coinEmoji: {
    fontSize: 16,
  },
  coinValue: {
    color: colors.coins,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  ctaWrapper: {
    marginVertical: spacing.xl,
  },
  ctaButton: {
    borderRadius: borderRadius['2xl'],
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.glow,
  },
  ctaEmoji: {
    fontSize: 48,
  },
  ctaTitle: {
    color: '#fff',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: 2,
  },
  ctaSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },
  quickAction: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  qaEmoji: {
    fontSize: 24,
  },
  qaText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  rankingCard: {
    marginBottom: spacing.lg,
  },
  rankingHint: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  rankingLink: {
    alignSelf: 'flex-end',
  },
  rankingLinkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
