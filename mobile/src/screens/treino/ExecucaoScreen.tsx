import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/common';
import { useWorkoutStore, useGamificationStore, useAuthStore } from '../../store';
import { execucaoService } from '../../services';

export const ExecucaoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    currentTreino,
    currentExerciseIndex,
    currentSerieNum,
    completedSeries,
    restTimerActive,
    restTimeLeft,
    completeSerie,
    nextExercise,
    prevExercise,
    startRest,
    tickRest,
    finishExecution,
    executionStartTime,
  } = useWorkoutStore();

  const { user } = useAuthStore();
  const gamification = useGamificationStore();

  const [carga, setCarga] = useState('');
  const [reps, setReps] = useState('');
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercicios = currentTreino?.exercicios || [];
  const currentEx = exercicios[currentExerciseIndex];
  const totalSeries = parseInt(currentEx?.series_sugeridas || '3', 10);

  // Rest timer
  useEffect(() => {
    if (restTimerActive) {
      timerRef.current = setInterval(() => {
        tickRest();
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restTimerActive]);

  // Auto-fill reps from suggestion
  useEffect(() => {
    if (currentEx?.reps_sugeridas) {
      setReps(currentEx.reps_sugeridas.replace(/[^0-9]/g, ''));
    }
  }, [currentExerciseIndex]);

  const handleCompleteSerie = async () => {
    if (!reps) {
      Alert.alert('', 'Informe as repetições');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Register on API
    try {
      if (user?.id && currentEx?.exercicio?.id) {
        await execucaoService.registrarSerie(user.id, {
          exercicio_id: currentEx.exercicio.id,
          serie_num: currentSerieNum,
          repeticoes: parseInt(reps, 10),
          carga_kg: carga ? parseFloat(carga) : undefined,
          treino_id: currentTreino?.id,
        });
      }
    } catch {
      // continue even if API fails
    }

    completeSerie(currentEx.exercicio?.id || currentEx.id, currentSerieNum);

    // Start rest timer
    const descansoSeconds = parseInt(currentEx?.descanso || '60', 10);
    if (currentSerieNum < totalSeries) {
      startRest(descansoSeconds);
    }

    // Trigger XP animation
    gamification.triggerXpGain(10);
  };

  const handleFinishTreino = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFinished(true);
    finishExecution();

    // Calculate XP
    const seriesCompleted = Object.keys(completedSeries).length;
    const xpGain = seriesCompleted * 10 + 50;
    const coinGain = Math.floor(xpGain / 5);

    gamification.triggerXpGain(xpGain);
    setTimeout(() => gamification.triggerCoinGain(coinGain), 1500);
  };

  const getElapsedTime = () => {
    if (!executionStartTime) return '0:00';
    const elapsed = Math.floor((Date.now() - executionStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Finished screen
  if (finished) {
    const seriesCompleted = Object.keys(completedSeries).length;
    return (
      <View style={styles.container}>
        <Animated.View entering={ZoomIn.springify().damping(10)} style={styles.finishedContainer}>
          <Text style={styles.finishedEmoji}>🎉</Text>
          <Text style={styles.finishedTitle}>TREINO CONCLUÍDO!</Text>
          <Text style={styles.finishedSubtitle}>Excelente trabalho!</Text>

          <View style={styles.finishedStats}>
            <View style={styles.finishedStat}>
              <Text style={styles.finishedStatValue}>{seriesCompleted}</Text>
              <Text style={styles.finishedStatLabel}>Séries</Text>
            </View>
            <View style={styles.finishedStat}>
              <Text style={styles.finishedStatValue}>{getElapsedTime()}</Text>
              <Text style={styles.finishedStatLabel}>Tempo</Text>
            </View>
            <View style={styles.finishedStat}>
              <Text style={[styles.finishedStatValue, { color: colors.xp }]}>
                +{seriesCompleted * 10 + 50}
              </Text>
              <Text style={styles.finishedStatLabel}>XP</Text>
            </View>
          </View>

          <Button
            title="Voltar ao Início"
            onPress={() => navigation.popToTop()}
            size="lg"
            fullWidth
          />
        </Animated.View>
      </View>
    );
  }

  if (!currentEx) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
          <Button title="Voltar" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </View>
    );
  }

  const isSerieCompleted = (serieNum: number) =>
    completedSeries[`${currentEx.exercicio?.id || currentEx.id}-${serieNum}`];

  return (
    <View style={styles.container}>
      {/* Rest Timer Overlay */}
      {restTimerActive && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.restOverlay}>
          <Text style={styles.restTitle}>⏳ Descanso</Text>
          <Text style={styles.restTime}>{restTimeLeft}s</Text>
          <TouchableOpacity
            style={styles.skipRest}
            onPress={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              startRest(0);
            }}
          >
            <Text style={styles.skipRestText}>Pular →</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.progressText}>
          Exercício {currentExerciseIndex + 1}/{exercicios.length}
        </Text>
        <Text style={styles.timerText}>⏱ {getElapsedTime()}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            {
              width: `${((currentExerciseIndex + 1) / exercicios.length) * 100}%` as any,
            },
          ]}
        />
      </View>

      {/* Exercise Info */}
      <Animated.View
        key={currentExerciseIndex}
        entering={SlideInRight.duration(300)}
        style={styles.exerciseContent}
      >
        <Text style={styles.exNome}>{currentEx.exercicio?.nome || 'Exercício'}</Text>
        <Text style={styles.exGrupo}>{currentEx.exercicio?.grupo_muscular}</Text>

        {currentEx.tecnica && (
          <View style={styles.tecnicaBadge}>
            <Text style={styles.tecnicaText}>⚡ {currentEx.tecnica}</Text>
          </View>
        )}

        {/* Series Grid */}
        <View style={styles.seriesGrid}>
          {Array.from({ length: totalSeries }, (_, i) => i + 1).map((serieNum) => (
            <View
              key={serieNum}
              style={[
                styles.serieItem,
                isSerieCompleted(serieNum) && styles.serieCompleted,
                serieNum === currentSerieNum && !isSerieCompleted(serieNum) && styles.serieCurrent,
              ]}
            >
              <Text
                style={[
                  styles.serieText,
                  isSerieCompleted(serieNum) && styles.serieTextCompleted,
                ]}
              >
                {isSerieCompleted(serieNum) ? '✓' : serieNum}
              </Text>
            </View>
          ))}
        </View>

        {/* Input Row */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              style={styles.numberInput}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              placeholder="12"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Carga (kg)</Text>
            <TextInput
              style={styles.numberInput}
              value={carga}
              onChangeText={setCarga}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Complete Serie Button */}
        {currentSerieNum <= totalSeries && (
          <Button
            title={`✓ Concluir Série ${currentSerieNum}`}
            onPress={handleCompleteSerie}
            size="lg"
            fullWidth
          />
        )}
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={prevExercise}
          disabled={currentExerciseIndex === 0}
        >
          <Text style={[styles.navText, currentExerciseIndex === 0 && { opacity: 0.3 }]}>
            ← Anterior
          </Text>
        </TouchableOpacity>

        {currentExerciseIndex === exercicios.length - 1 &&
        currentSerieNum > totalSeries ? (
          <Button title="🏁 Finalizar" onPress={handleFinishTreino} variant="primary" />
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={nextExercise}
            disabled={currentExerciseIndex === exercicios.length - 1}
          >
            <Text
              style={[
                styles.navText,
                currentExerciseIndex === exercicios.length - 1 && { opacity: 0.3 },
              ]}
            >
              Próximo →
            </Text>
          </TouchableOpacity>
        )}
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
    gap: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  timerText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.bgTertiary,
    marginHorizontal: spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  exerciseContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  exNome: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  exGrupo: {
    color: colors.textTertiary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  tecnicaBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  tecnicaText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  seriesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  serieItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serieCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  serieCompleted: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  serieText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  serieTextCompleted: {
    color: colors.success,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  numberInput: {
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    padding: spacing.md,
  },
  navText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  restOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  restTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    marginBottom: spacing.lg,
  },
  restTime: {
    color: colors.primary,
    fontSize: 72,
    fontWeight: fontWeight.extrabold,
  },
  skipRest: {
    marginTop: spacing['3xl'],
    padding: spacing.lg,
  },
  skipRestText: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  finishedEmoji: {
    fontSize: 80,
  },
  finishedTitle: {
    color: colors.primary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: 2,
  },
  finishedSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  finishedStats: {
    flexDirection: 'row',
    gap: spacing['3xl'],
    marginVertical: spacing['3xl'],
  },
  finishedStat: {
    alignItems: 'center',
  },
  finishedStatValue: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  finishedStatLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
});
