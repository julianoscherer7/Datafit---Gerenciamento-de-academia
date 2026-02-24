import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Erro ao fazer login';
      setError(typeof msg === 'string' ? msg : 'Credenciais inválidas');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.logoContainer}>
            <Text style={styles.logo}>DATAFIT</Text>
            <Text style={styles.subtitle}>Sua evolução começa aqui</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.form}>
            <Input
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={
                <Text style={styles.showPasswordText}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Não tem conta?{' '}
                <Text style={styles.registerHighlight}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['5xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logo: {
    color: colors.primary,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.sm,
  },
  showPasswordText: {
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  registerHighlight: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
