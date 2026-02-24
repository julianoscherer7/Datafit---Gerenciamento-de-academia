import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Button } from '../../components/common';
import { useGamificationStore } from '../../store';
import { checkinService } from '../../services';

export const CheckInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);
  const cameraRef = useRef<any>(null);
  const gamification = useGamificationStore();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const photoData = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });
      setPhoto(photoData.base64 || photoData.uri);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const handleCheckin = async () => {
    if (!photo) return;
    setLoading(true);

    try {
      // Get location
      let locationString = '';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          locationString = `${loc.coords.latitude},${loc.coords.longitude}`;
        }
      } catch {
        // location is optional
      }

      const data = await checkinService.iniciar(photo, locationString);
      setResult(data);
      setSuccess(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      gamification.triggerXpGain(data.xp_ganho || 25);
      if (data.moedas_ganhas) {
        setTimeout(() => gamification.triggerCoinGain(data.moedas_ganhas), 1500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Erro ao fazer check-in';
      Alert.alert('Erro', typeof msg === 'string' ? msg : 'Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <View style={styles.container}>
        <Animated.View entering={ZoomIn.springify().damping(10)} style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Check-in Realizado!</Text>
          <Text style={styles.successSub}>Você está na academia. Bom treino! 💪</Text>

          <View style={styles.rewardRow}>
            <View style={styles.rewardCard}>
              <Text style={styles.rewardValue}>+{result?.xp_ganho || 25}</Text>
              <Text style={styles.rewardLabel}>XP</Text>
            </View>
            <View style={styles.rewardCard}>
              <Text style={[styles.rewardValue, { color: colors.coins }]}>
                +{result?.moedas_ganhas || 5}
              </Text>
              <Text style={styles.rewardLabel}>Moedas</Text>
            </View>
          </View>

          <Button
            title="Iniciar Treino"
            onPress={() => navigation.navigate('Treino')}
            size="lg"
            fullWidth
          />
          <Button
            title="Voltar"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="md"
          />
        </Animated.View>
      </View>
    );
  }

  // Photo preview
  if (photo) {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.previewContainer}>
          <Text style={styles.previewTitle}>📸 Confirmar Check-in</Text>
          <Text style={styles.previewSub}>Sua selfie na academia</Text>

          <View style={styles.photoFrame}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${photo}` }}
              style={styles.photoPreview}
              resizeMode="cover"
            />
            {/* Timestamp overlay */}
            <View style={styles.timestampOverlay}>
              <Text style={styles.timestampText}>
                {new Date().toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>

          <View style={styles.previewActions}>
            <Button
              title="✅ Confirmar Check-in"
              onPress={handleCheckin}
              loading={loading}
              size="lg"
              fullWidth
            />
            <Button
              title="📸 Tirar outra"
              onPress={() => setPhoto(null)}
              variant="outline"
              size="md"
              fullWidth
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  // Camera view
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.permissionEmoji}>📸</Text>
          <Text style={styles.permissionTitle}>Permissão Necessária</Text>
          <Text style={styles.permissionText}>
            Precisamos da câmera para o check-in na academia
          </Text>
          <Button title="Permitir Câmera" onPress={requestPermission} size="lg" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        <View style={styles.cameraOverlay}>
          {/* Top */}
          <View style={styles.cameraTop}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Check-in Academia</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Guide text */}
          <View style={styles.cameraGuide}>
            <Text style={styles.guideText}>
              📍 Tire uma selfie na academia
            </Text>
          </View>

          {/* Capture button */}
          <View style={styles.cameraBottom}>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
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
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  cameraTitle: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  cameraGuide: {
    alignItems: 'center',
  },
  guideText: {
    color: '#fff',
    fontSize: fontSize.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  cameraBottom: {
    alignItems: 'center',
    paddingBottom: spacing['5xl'],
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    alignItems: 'center',
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  previewSub: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  photoFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  timestampText: {
    color: '#fff',
    fontSize: fontSize.xs,
  },
  previewActions: {
    width: '100%',
    gap: spacing.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  successEmoji: {
    fontSize: 72,
  },
  successTitle: {
    color: colors.success,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  successSub: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginVertical: spacing.xl,
  },
  rewardCard: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardValue: {
    color: colors.xp,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  rewardLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  permissionEmoji: {
    fontSize: 64,
  },
  permissionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  permissionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
