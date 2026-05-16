import { authService } from '@/api/authService';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Step = 'email' | 'token' | 'password';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async () => {
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    setLoading(true); setError('');
    try {
      await authService.requestPasswordReset(email.trim());
      Alert.alert('E-mail enviado!', 'Verifique sua caixa de entrada (e spam) para obter o código de recuperação.');
      setStep('token');
    } catch (err: any) {
      const raw = err?.response?.data?.email?.[0] || err?.response?.data?.detail || '';
      // Traduz mensagens em inglês da API
      if (raw.includes("couldn't find an account")) {
        setError('Não encontramos uma conta com este e-mail. Verifique se digitou corretamente.');
      } else {
        setError(raw || 'Erro ao enviar e-mail. Verifique o endereço.');
      }
    } finally { setLoading(false); }
  };

  const handleValidateToken = async () => {
    if (!token.trim()) { setError('Informe o código recebido.'); return; }
    setLoading(true); setError('');
    try {
      await authService.validateResetToken(token.trim());
      setStep('password');
    } catch {
      setError('Código inválido ou expirado. Tente novamente.');
    } finally { setLoading(false); }
  };

  const handleConfirmReset = async () => {
    if (!password || password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    setLoading(true); setError('');
    try {
      await authService.confirmPasswordReset(token.trim(), password);
      Alert.alert('Senha alterada!', 'Sua senha foi redefinida com sucesso. Faça login com a nova senha.', [
        { text: 'Ir para Login', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      setError(err?.response?.data?.password?.[0] || err?.response?.data?.detail || 'Erro ao redefinir senha.');
    } finally { setLoading(false); }
  };

  const stepConfig = {
    email: {
      icon: 'mail-outline' as const,
      title: 'Recuperar Senha',
      subtitle: 'Informe o e-mail cadastrado para receber o código de recuperação.',
      action: handleRequestReset,
      btnText: 'Enviar Código',
    },
    token: {
      icon: 'key-outline' as const,
      title: 'Verificar Código',
      subtitle: `Enviamos um código para ${email}. Cole-o abaixo.`,
      action: handleValidateToken,
      btnText: 'Validar Código',
    },
    password: {
      icon: 'lock-open-outline' as const,
      title: 'Nova Senha',
      subtitle: 'Crie uma nova senha segura para sua conta.',
      action: handleConfirmReset,
      btnText: 'Redefinir Senha',
    },
  };

  const config = stepConfig[step];
  const stepNumber = step === 'email' ? 1 : step === 'token' ? 2 : 3;

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity onPress={() => step === 'email' ? router.back() : setStep(step === 'password' ? 'token' : 'email')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require('../../../assets/images/logo-preifma.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {[1, 2, 3].map(n => (
              <View key={n} style={[styles.stepDot, n <= stepNumber && styles.stepDotActive]} />
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name={config.icon} size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {step === 'token' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Código de Verificação</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.tokenInput]}
                    placeholder="Cole o código aqui"
                    placeholderTextColor={Colors.textMuted}
                    value={token}
                    onChangeText={setToken}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <TouchableOpacity onPress={handleRequestReset} disabled={loading}>
                  <Text style={styles.resendText}>Reenviar código</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'password' && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nova Senha</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={Colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                      <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirmar Senha</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Repita a nova senha"
                      placeholderTextColor={Colors.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>
              </>
            )}

            {error !== '' && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={config.action}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>{config.btnText}</Text>
              )}
            </TouchableOpacity>

            {step === 'email' && (
              <View style={styles.linkRow}>
                <Text style={styles.linkText}>Lembrou a senha? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.linkHighlight}>Fazer login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 20, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 0, left: 0, padding: 8 },
  logo: { width: 240, height: 180, alignSelf: 'center', marginBottom: 0 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  stepDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  stepDotActive: { backgroundColor: Colors.primary },
  header: { alignItems: 'center', marginBottom: 28, gap: 8 },
  iconBox: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginLeft: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, height: 52, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  tokenInput: { letterSpacing: 1, fontWeight: '600' },
  resendText: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 4, textAlign: 'right' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { fontSize: 13, color: '#DC2626', flex: 1, lineHeight: 18 },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkHighlight: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
