import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Card, Button } from '../../components/common';
import { coachService, treinoService } from '../../services';
import { useAuthStore } from '../../store';

export const CoachDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await coachService.getMyStudents();
      setStudents(Array.isArray(data) ? data : data?.alunos || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleGenerateInvite = async () => {
    try {
      const data = await coachService.createInviteToken();
      const token = data?.token || data?.convite || data;
      setInviteToken(typeof token === 'string' ? token : JSON.stringify(token));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o convite');
    }
  };

  const handleShareInvite = async () => {
    if (!inviteToken) return;
    try {
      await Share.share({
        message: `Use este código para se conectar comigo no DATAFIT: ${inviteToken}`,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.title}>🏋️ Painel do Coach</Text>
          <Text style={styles.subtitle}>
            {user?.nome} • {students.length} aluno(s)
          </Text>
        </Animated.View>

        {/* Generate Invite */}
        <Animated.View entering={FadeInUp.delay(100).duration(300)}>
          <Card variant="highlight" style={styles.inviteCard}>
            <Text style={styles.inviteTitle}>📨 Convidar Alunos</Text>
            <Text style={styles.inviteDesc}>
              Gere um código para seus alunos se conectarem a você
            </Text>

            {inviteToken ? (
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenLabel}>Código gerado:</Text>
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenText} selectable>
                    {inviteToken}
                  </Text>
                </View>
                <View style={styles.tokenActions}>
                  <Button
                    title="📋 Compartilhar"
                    onPress={handleShareInvite}
                    size="sm"
                  />
                  <Button
                    title="🔄 Novo"
                    onPress={handleGenerateInvite}
                    variant="outline"
                    size="sm"
                  />
                </View>
              </View>
            ) : (
              <Button
                title="Gerar Convite"
                onPress={handleGenerateInvite}
                fullWidth
              />
            )}
          </Card>
        </Animated.View>

        {/* Students List */}
        <Text style={styles.sectionTitle}>👥 Meus Alunos</Text>

        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>Nenhum aluno ainda</Text>
            <Text style={styles.emptyText}>
              Gere um código de convite para seus alunos se conectarem
            </Text>
          </View>
        ) : (
          students.map((student: any, index: number) => (
            <Animated.View
              key={student.id}
              entering={FadeInRight.delay(index * 80).duration(300)}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CoachStudentDetail', {
                    studentId: student.id,
                    studentName: student.nome,
                  })
                }
              >
                <Card style={styles.studentCard}>
                  <View style={styles.studentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(student.nome || 'A')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.nome}</Text>
                      <Text style={styles.studentMeta}>
                        Lv.{student.level || 1} • 🔥{student.streak || 0} •{' '}
                        {student.treinos_count || 0} treinos
                      </Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CoachTreinos')}
          >
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.actionLabel}>Criar Treino</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Social')}
          >
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionLabel}>Ranking</Text>
          </TouchableOpacity>
        </View>

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
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inviteCard: {
    marginBottom: spacing.xl,
  },
  inviteTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inviteDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  tokenContainer: {
    gap: spacing.md,
  },
  tokenLabel: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  tokenBox: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tokenText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tokenActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  studentCard: {
    marginBottom: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },
  studentName: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  studentMeta: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  arrow: {
    color: colors.textTertiary,
    fontSize: fontSize.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
