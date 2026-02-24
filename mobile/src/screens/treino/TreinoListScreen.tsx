import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/common';
import { useWorkoutStore } from '../../store';
import type { Treino } from '../../services';

export const TreinoListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { treinos, loading, fetchTreinos } = useWorkoutStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTreinos();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTreinos();
    setRefreshing(false);
  }, []);

  const handleTreinoPress = (treino: Treino) => {
    navigation.navigate('TreinoDetail', { treinoId: treino.id, treinoNome: treino.nome });
  };

  const getOrigemLabel = (origem: string) => {
    switch (origem) {
      case 'coach': return '👨‍🏫 Coach';
      case 'ai': return '🤖 IA';
      default: return '👤 Próprio';
    }
  };

  if (loading && treinos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⏳</Text>
          <Text style={styles.emptyText}>Carregando treinos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Meus Treinos 💪</Text>
        <Text style={styles.subtitle}>{treinos.length} treino(s) disponíveis</Text>

        {treinos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏋️</Text>
            <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
            <Text style={styles.emptyText}>
              Conecte-se a um coach ou crie seu próprio treino!
            </Text>
          </View>
        ) : (
          treinos.map((treino, index) => (
            <Animated.View
              key={treino.id}
              entering={FadeInUp.delay(index * 100).duration(400)}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleTreinoPress(treino)}
              >
                <Card style={styles.treinoCard}>
                  <View style={styles.treinoHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.treinoNome}>{treino.nome}</Text>
                      <View style={styles.treinoMeta}>
                        <Text style={styles.metaText}>{getOrigemLabel(treino.origem)}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>⏱ {treino.duracao || 45}min</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>
                          {treino.exercicios?.length || 0} exercícios
                        </Text>
                      </View>
                    </View>
                    {treino.locked && <Text style={styles.lockIcon}>🔒</Text>}
                  </View>

                  {treino.descricao && (
                    <Text style={styles.treinoDesc} numberOfLines={2}>
                      {treino.descricao}
                    </Text>
                  )}

                  {treino.coach_comentario && (
                    <View style={styles.commentBox}>
                      <Text style={styles.commentLabel}>💬 Coach:</Text>
                      <Text style={styles.commentText} numberOfLines={2}>
                        {treino.coach_comentario}
                      </Text>
                    </View>
                  )}

                  <View style={styles.treinoFooter}>
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.startBadge}
                    >
                      <Text style={styles.startText}>Iniciar →</Text>
                    </LinearGradient>
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

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
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  treinoCard: {
    marginBottom: spacing.lg,
  },
  treinoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  treinoNome: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  treinoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  lockIcon: {
    fontSize: 18,
  },
  treinoDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  commentBox: {
    backgroundColor: colors.infoBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  commentLabel: {
    color: colors.info,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  commentText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  treinoFooter: {
    alignItems: 'flex-end',
    marginTop: spacing.lg,
  },
  startBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  startText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
