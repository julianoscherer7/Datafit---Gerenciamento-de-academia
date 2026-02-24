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
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store';

type RoleType = 'aluno' | 'instrutor' | null;

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<RoleType>(null);
  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [cref, setCref] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [bio, setBio] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuthStore();

  const passwordStrength = () => {
    let score = 0;
    if (senha.length >= 6) score++;
    if (senha.length >= 8) score++;
    if (/[A-Z]/.test(senha)) score++;
    if (/[0-9]/.test(senha)) score++;
    if (/[^A-Za-z0-9]/.test(senha)) score++;
    return score;
  };

  const strengthColor = () => {
    const s = passwordStrength();
    if (s <= 1) return colors.error;
    if (s <= 3) return colors.warning;
    return colors.success;
  };

  const handleRegister = async () => {
    setError('');
    if (!nome.trim() || !nickname.trim() || !email.trim() || !senha) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    if (senha !== confirmSenha) {
      setError('As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (role === 'instrutor' && !cref.trim()) {
      setError('CREF é obrigatório para instrutores');
      return;
    }

    try {
      await register({
        nome: nome.trim(),
        nickname: nickname.trim(),
        email: email.trim(),
        senha,
        perfil: role || 'aluno',
        ...(role === 'instrutor' && {
          cref: cref.trim(),
          especialidade: especialidade.trim(),
          bio: bio.trim(),
        }),
        ...(inviteToken && { invite_token: inviteToken.trim() }),
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Erro ao registrar';
      setError(typeof msg === 'string' ? msg : 'Erro ao criar conta');
    }
  };

  // Step 1: Role selection
  if (step === 1) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <Text style={styles.logo}>DATAFIT</Text>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Escolha seu perfil</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'aluno' && styles.roleCardActive]}
              onPress={() => setRole('aluno')}
            >
              <Text style={styles.roleEmoji}>🏋️</Text>
              <Text style={styles.roleTitle}>Aluno</Text>
              <Text style={styles.roleDesc}>Treine, evolua e conquiste badges</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'instrutor' && styles.roleCardActive]}
              onPress={() => setRole('instrutor')}
            >
              <Text style={styles.roleEmoji}>👨‍🏫</Text>
              <Text style={styles.roleTitle}>Instrutor</Text>
              <Text style={styles.roleDesc}>Crie treinos e acompanhe alunos</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(500)} style={{ marginTop: spacing['2xl'] }}>
            <Button
              title="Continuar"
              onPress={() => {
                if (role) setStep(2);
                else setError('Selecione um perfil');
              }}
              disabled={!role}
              fullWidth
              size="lg"
            />
          </Animated.View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginHighlight}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Step 2: Form
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
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <TouchableOpacity onPress={() => setStep(1)}>
              <Text style={styles.backButton}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {role === 'instrutor' ? '👨‍🏫 Instrutor' : '🏋️ Aluno'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <Input label="Nome completo" placeholder="Seu nome" value={nome} onChangeText={setNome} />
            <Input label="Nickname" placeholder="@seunick" value={nickname} onChangeText={setNickname} autoCapitalize="none" />
            <Input label="Email" placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Senha" placeholder="Mínimo 6 caracteres" value={senha} onChangeText={setSenha} secureTextEntry />
            
            {senha.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={[styles.strengthBar, { width: `${(passwordStrength() / 5) * 100}%`, backgroundColor: strengthColor() }]} />
              </View>
            )}
            
            <Input label="Confirmar senha" placeholder="Repita a senha" value={confirmSenha} onChangeText={setConfirmSenha} secureTextEntry />

            {role === 'instrutor' && (
              <>
                <Input label="CREF *" placeholder="000000-G/SP" value={cref} onChangeText={setCref} />
                <Input label="Especialidade" placeholder="Ex: Musculação" value={especialidade} onChangeText={setEspecialidade} />
                <Input label="Bio" placeholder="Conte sobre você..." value={bio} onChangeText={setBio} multiline numberOfLines={3} />
              </>
            )}

            {role === 'aluno' && (
              <Input label="Código de convite (opcional)" placeholder="Ex: C4RL0S" value={inviteToken} onChangeText={setInviteToken} autoCapitalize="characters" />
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              title="Criar Conta"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
            />
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
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['4xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  logo: {
    color: colors.primary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  backButton: {
    color: colors.primary,
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  roleEmoji: {
    fontSize: 40,
  },
  roleTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  roleDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  strengthContainer: {
    height: 4,
    backgroundColor: colors.bgTertiary,
    borderRadius: 2,
    marginTop: -8,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  errorContainer: {
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  loginHighlight: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
