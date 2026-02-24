import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Card, Button } from '../../components/common';
import { XpBar, StreakCard, CoinsDisplay } from '../../components/common/Gamification';
import { useAuthStore, useGamificationStore } from '../../store';
import { dashboardService, badgesService, historicoService, amigosService } from '../../services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PerfilScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const gamification = useGamificationStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'stats' | 'badges' | 'historico'>('stats');

  const fetchData = useCallback(async () => {
    try {
      const [dashData, badgesData, histData] = await Promise.all([
        dashboardService.getDashboard().catch(() => null),
        badgesService.getMeus().catch(() => []),
        historicoService.get().catch(() => []),
      ]);
      setDashboard(dashData);
      setBadges(Array.isArray(badgesData) ? badgesData : badgesData?.badges || []);
      setHistorico(Array.isArray(histData) ? histData : histData?.historico || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const level = user?.level || gamification.level || 1;
  const xp = user?.xp || gamification.xp || 0;
  const streak = user?.streak || gamification.streak || 0;
  const moedas = user?.moedas || gamification.moedas || 0;
  const nextLevelXp = level * 200;
  const xpProgress = nextLevelXp > 0 ? xp / nextLevelXp : 0;

  const tabs: { key: typeof tab; label: string; emoji: string }[] = [
    { key: 'stats', label: 'Stats', emoji: '📊' },
    { key: 'badges', label: 'Badges', emoji: '🏆' },
    { key: 'historico', label: 'Histórico', emoji: '📅' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(user?.nome || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
          <Text style={styles.userRole}>
            {user?.perfil === 'instrutor' ? '🏋️ Coach' : '💪 Aluno'}
            {user?.perfil === 'admin' && ' 👑 Admin'}
          </Text>
          <Text style={styles.userLevel}>Level {level}</Text>

          {/* XP Bar */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBarOuter}>
              <View style={[styles.xpBarInner, { width: `${Math.min(xpProgress * 100, 100)}%` }]} />
            </View>
            <Text style={styles.xpLabel}>
              {xp} / {nextLevelXp} XP
            </Text>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>🔥 {streak}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>🪙 {moedas}</Text>
              <Text style={styles.quickStatLabel}>Moedas</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>
                🏅 {badges.filter((b: any) => b.conquistado || b.desbloqueado).length}
              </Text>
              <Text style={styles.quickStatLabel}>Badges</Text>
            </View>
          </View>

          <Button
            title="✏️ Editar Perfil"
            onPress={() => navigation.navigate('EditPerfil')}
            variant="outline"
            size="sm"
          />
        </Animated.View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={styles.tabEmoji}>{t.emoji}</Text>
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATS */}
        {tab === 'stats' && (
          <Animated.View entering={FadeInUp.duration(300)}>
            <View style={styles.statGrid}>
              <StatBox emoji="🏋️" label="Treinos" value={dashboard?.total_treinos || 0} />
              <StatBox emoji="📅" label="Check-ins" value={dashboard?.total_checkins || 0} />
              <StatBox emoji="⭐" label="XP Total" value={xp} color={colors.xp} />
              <StatBox emoji="🔥" label="Melhor Streak" value={dashboard?.melhor_streak || streak} color={colors.streak} />
              <StatBox emoji="💪" label="Séries feitas" value={dashboard?.total_series || 0} />
              <StatBox emoji="⏱️" label="Horas treino" value={dashboard?.horas_treino || 0} />
            </View>

            {/* Weekly Progress */}
            <Card style={styles.weekCard}>
              <Text style={styles.sectionTitle}>📈 Evolução Semanal</Text>
              <View style={styles.weekDays}>
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => {
                  const active = dashboard?.dias_semana?.[i] || false;
                  return (
                    <View key={i} style={styles.weekDay}>
                      <View style={[styles.weekDot, active && styles.weekDotActive]} />
                      <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* BADGES */}
        {tab === 'badges' && (
          <View style={styles.badgeGrid}>
            {badges.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🏆</Text>
                <Text style={styles.emptyText}>Nenhuma conquista ainda</Text>
              </View>
            ) : (
              badges.map((badge: any, index: number) => {
                const unlocked = badge.conquistado || badge.desbloqueado;
                return (
                  <Animated.View
                    key={badge.id || index}
                    entering={FadeInUp.delay(index * 60).duration(300)}
                    style={styles.badgeItem}
                  >
                    <View style={[styles.badgeIcon, !unlocked && styles.badgeLocked]}>
                      <Text style={styles.badgeEmoji}>
                        {unlocked ? (badge.icone || '🏅') : '🔒'}
                      </Text>
                    </View>
                    <Text
                      style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}
                      numberOfLines={2}
                    >
                      {badge.nome}
                    </Text>
                  </Animated.View>
                );
              })
            )}
          </View>
        )}

        {/* HISTORICO */}
        {tab === 'historico' && (
          <>
            {historico.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📅</Text>
                <Text style={styles.emptyText}>Nenhum registro ainda</Text>
              </View>
            ) : (
              historico.slice(0, 20).map((item: any, index: number) => (
                <Animated.View
                  key={item.id || index}
                  entering={FadeInRight.delay(index * 40).duration(300)}
                >
                  <Card style={styles.historyCard}>
                    <View style={styles.historyRow}>
                      <View style={styles.historyDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyTitle}>
                          {item.treino_nome || item.descricao || 'Treino'}
                        </Text>
                        <Text style={styles.historyMeta}>
                          {item.data || item.criado_em?.split('T')[0]} • {item.series || 0} séries
                        </Text>
                      </View>
                      {item.xp_ganho && (
                        <Text style={styles.historyXp}>+{item.xp_ganho} XP</Text>
                      )}
                    </View>
                  </Card>
                </Animated.View>
              ))
            )}
          </>
        )}

        {/* Settings Shortcut */}
        <View style={styles.settingsSection}>
          <Button
            title="⚙️ Configurações"
            onPress={() => navigation.navigate('Configs')}
            variant="ghost"
            fullWidth
          />
          <Button
            title="🚪 Sair"
            onPress={() => useAuthStore.getState().logout()}
            variant="danger"
            fullWidth
          />
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </View>
  );
};

const StatBox: React.FC<{
  emoji: string;
  label: string;
  value: number | string;
  color?: string;
}> = ({ emoji, label, value, color }) => (
  <Card style={styles.statBox}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryGlow,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  userName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  userLevel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.xp,
  },
  xpContainer: {
    width: '100%',
    maxWidth: 260,
    marginVertical: spacing.md,
  },
  xpBarOuter: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgInput,
    overflow: 'hidden',
  },
  xpBarInner: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.xp,
  },
  xpLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.lg,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  quickStatLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md * 2) / 3,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  weekCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDay: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekDayText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  badgeItem: {
    alignItems: 'center',
    width: 80,
    gap: spacing.sm,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.coins,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLocked: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    color: colors.textPrimary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: colors.textTertiary,
  },
  historyCard: {
    marginBottom: spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  historyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  historyMeta: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  historyXp: {
    color: colors.xp,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  settingsSection: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
