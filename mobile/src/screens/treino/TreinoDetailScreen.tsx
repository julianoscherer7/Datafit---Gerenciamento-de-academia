import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Card, Button } from '../../components/common';
import { MuscleMap } from '../../components/MuscleMap';
import { useWorkoutStore } from '../../store';

export const TreinoDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { treinoId } = route.params;
  const { currentTreino, fetchTreino, loading, startExecution } = useWorkoutStore();
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);

  useEffect(() => {
    fetchTreino(treinoId);
  }, [treinoId]);

  const handleStartExecution = () => {
    if (currentTreino) {
      startExecution(currentTreino);
      navigation.navigate('Execucao');
    }
  };

  if (loading || !currentTreino) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Carregando treino...</Text>
        </View>
      </View>
    );
  }

  const exercicios = currentTreino.exercicios || [];
  const muscleGroups = exercicios
    .map((e) => e.exercicio?.grupo_muscular)
    .filter(Boolean) as string[];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.treinoNome}>{currentTreino.nome}</Text>
          {currentTreino.descricao && (
            <Text style={styles.treinoDesc}>{currentTreino.descricao}</Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>⏱ {currentTreino.duracao || 45}min</Text>
            <Text style={styles.metaItem}>📋 {exercicios.length} exercícios</Text>
          </View>
        </Animated.View>

        {/* Muscle Map */}
        {muscleGroups.length > 0 && (
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <Card style={styles.muscleCard}>
              <Text style={styles.sectionTitle}>Músculos Trabalhados</Text>
              <MuscleMap activeGroups={muscleGroups} width={180} height={200} />
              <View style={styles.muscleLabels}>
                {[...new Set(muscleGroups)].map((g, i) => (
                  <View key={i} style={styles.muscleBadge}>
                    <Text style={styles.muscleBadgeText}>{g}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Coach Comment */}
        {currentTreino.coach_comentario && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Card variant="glass" style={styles.commentCard}>
              <Text style={styles.commentLabel}>💬 Comentário do Coach</Text>
              <Text style={styles.commentText}>{currentTreino.coach_comentario}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Exercise List */}
        <Text style={styles.sectionTitle}>Exercícios</Text>
        {exercicios.map((ex, index) => (
          <Animated.View
            key={ex.id}
            entering={FadeInUp.delay(300 + index * 80).duration(400)}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedExercise(selectedExercise === ex.id ? null : ex.id)}
            >
              <Card style={styles.exerciseCard}>
                <View style={styles.exHeader}>
                  <View style={styles.exOrder}>
                    <Text style={styles.exOrderText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exNome}>{ex.exercicio?.nome || 'Exercício'}</Text>
                    <Text style={styles.exGrupo}>{ex.exercicio?.grupo_muscular}</Text>
                  </View>
                </View>

                <View style={styles.exMeta}>
                  {ex.series_sugeridas && (
                    <View style={styles.exMetaItem}>
                      <Text style={styles.exMetaLabel}>Séries</Text>
                      <Text style={styles.exMetaValue}>{ex.series_sugeridas}</Text>
                    </View>
                  )}
                  {ex.reps_sugeridas && (
                    <View style={styles.exMetaItem}>
                      <Text style={styles.exMetaLabel}>Reps</Text>
                      <Text style={styles.exMetaValue}>{ex.reps_sugeridas}</Text>
                    </View>
                  )}
                  {ex.descanso && (
                    <View style={styles.exMetaItem}>
                      <Text style={styles.exMetaLabel}>Descanso</Text>
                      <Text style={styles.exMetaValue}>{ex.descanso}</Text>
                    </View>
                  )}
                  {ex.tecnica && (
                    <View style={styles.exMetaItem}>
                      <Text style={styles.exMetaLabel}>Técnica</Text>
                      <Text style={styles.exMetaValue}>{ex.tecnica}</Text>
                    </View>
                  )}
                </View>

                {selectedExercise === ex.id && ex.exercicio && (
                  <View style={styles.exDetails}>
                    {ex.exercicio.instrucoes && (
                      <Text style={styles.exDetailText}>
                        📝 {ex.exercicio.instrucoes}
                      </Text>
                    )}
                    {ex.exercicio.dicas && (
                      <Text style={styles.exDetailText}>
                        💡 {ex.exercicio.dicas}
                      </Text>
                    )}
                    {ex.observacao && (
                      <Text style={styles.exDetailText}>
                        📌 {ex.observacao}
                      </Text>
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomCta}>
        <Button
          title="🏋️ INICIAR TREINO"
          onPress={handleStartExecution}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  treinoNome: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  treinoDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  metaItem: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  muscleCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  muscleLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  muscleBadge: {
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  muscleBadgeText: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  commentCard: {
    marginBottom: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  commentLabel: {
    color: colors.info,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  commentText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  exerciseCard: {
    marginBottom: spacing.md,
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  exOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exOrderText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  exNome: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  exGrupo: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  exMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  exMetaItem: {
    alignItems: 'center',
  },
  exMetaLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  exMetaValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  exDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  exDetailText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
