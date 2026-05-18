import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomHeader } from '@/components/CustomHeader';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function SimuladoResultadoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    acertos: string; total: string; xp: string; duracao: string; reviewData: string;
  }>();

  const acertos = Number(params.acertos ?? 0);
  const total = Number(params.total ?? 0);
  const xp = Number(params.xp ?? 0);
  const duracao = Number(params.duracao ?? 0);
  const erros = total - acertos;
  const accuracy = total > 0 ? Math.round((acertos / total) * 100) : 0;
  const isGood = accuracy >= 60;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleReview = () => {
    if (loadingReview) return;
    setLoadingReview(true);
    // Dá um fôlego para o React Native renderizar o loading antes de travar a thread de UI com a navegação pesada
    setTimeout(() => {
      router.push({ pathname: '/simulado/gabarito', params: { reviewData: params.reviewData } });
      setLoadingReview(false);
    }, 100);
  };

  return (
    <View style={styles.safe}>
      <CustomHeader title="Resultado do Simulado" />
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.heroCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.heroIcon, { backgroundColor: isGood ? Colors.primaryLight : '#FEF2F2' }]}>
            <Ionicons name={isGood ? 'trophy' : 'school-outline'} size={40} color={isGood ? Colors.primary : '#EF4444'} />
          </View>
          <Text style={styles.heroTitle}>{isGood ? 'Excelente trabalho!' : 'Continue praticando!'}</Text>
          <Text style={[styles.heroAccuracy, { color: isGood ? Colors.primary : '#EF4444' }]}>{accuracy}%</Text>
          <Text style={styles.heroSub}>de aproveitamento</Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={26} color={Colors.primary} />
            <Text style={styles.statValue}>{acertos}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close-circle" size={26} color="#EF4444" />
            <Text style={styles.statValue}>{erros}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={26} color="#F59E0B" />
            <Text style={styles.statValue}>+{xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        {/* CTAs */}
        <View style={styles.ctaSection}>
          {params.reviewData && (
            <TouchableOpacity
              style={[styles.btnReview, loadingReview && { opacity: 0.7 }]}
              onPress={handleReview}
              activeOpacity={0.85}
              disabled={loadingReview}
            >
              {loadingReview ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                  <Text style={styles.btnReviewText}>Conferir Gabarito</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Voltar ao Início</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace('/(tabs)/simulados')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>Novo Simulado</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 24, gap: 20 },
  heroCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 28, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  heroIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  heroAccuracy: { fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  heroSub: { fontSize: 14, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', fontWeight: '600' },
  ctaSection: { gap: 12, marginTop: 4 },
  btnReview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 14, borderWidth: 2, borderColor: Colors.primary, backgroundColor: '#FFF',
  },
  btnReviewText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  btnPrimary: {
    backgroundColor: Colors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnSecondary: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#D1D5DB' },
  btnSecondaryText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
});
