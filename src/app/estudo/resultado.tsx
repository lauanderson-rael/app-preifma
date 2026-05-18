import { examService } from '@/api/examService';
import { missionService } from '@/api/missionService';
import { sessionService } from '@/api/sessionService';
import { Colors } from '@/constants/Colors';
import type { MissionProgress } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function ResultadoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    sessionId: string;
    acertos: string;
    total: string;
    xp: string;
    duracao: string;
    sessionType?: string;
    missionsJson: string;
  }>();

  const [starting, setStarting] = useState(false);

  const acertos = Number(params.acertos ?? 0);
  const total = Number(params.total ?? 0);
  const xp = Number(params.xp ?? 0);
  const duracao = Number(params.duracao ?? 0);
  const accuracy = total > 0 ? Math.round((acertos / total) * 100) : 0;

  const missions: MissionProgress[] = (() => {
    try { return JSON.parse(params.missionsJson ?? '[]'); } catch { return []; }
  })();


  // Entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [liveMissions, setLiveMissions] = useState<MissionProgress[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    missionService.getDailyMissions().then(data => {
      setLiveMissions(data);
    }).catch(err => console.log('Erro ao buscar missões atualizadas:', err));
  }, [fadeAnim, slideAnim]);

  const handlePlayAgain = async () => {
    if (params.sessionType === 'quick') {
      setStarting(true);
      try {
        const q = await examService.getRandomQuestions({ count: 10 });
        if (!q || q.length === 0) throw new Error('Nenhuma questão');
        const qIds = q.map(x => x.id);
        const res = await sessionService.startSession({ type: 'quick', question_ids: qIds });

        router.replace({
          pathname: '/estudo/questao',
          params: {
            sessionId: String(res.id),
            sessionType: 'quick',
            questionIds: qIds.join(','),
            titulo: 'Sessão Rápida',
          },
        });
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível iniciar uma nova sessão.');
      } finally {
        setStarting(false);
      }
    } else {
      router.replace('/estudo/filtros');
    }
  };

  const isGood = accuracy >= 60;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.heroCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.heroIcon, { backgroundColor: isGood ? Colors.primaryLight : '#FEF2F2' }]}>
            <Ionicons
              name={isGood ? 'trophy' : 'school-outline'}
              size={40}
              color={isGood ? Colors.primary : Colors.error}
            />
          </View>
          <Text style={styles.heroTitle}>{isGood ? 'Excelente trabalho!' : 'Continue praticando!'}</Text>
          <Text style={[styles.heroAccuracy, { color: isGood ? Colors.primary : Colors.error }]}>
            {accuracy}%
          </Text>
          <Text style={styles.heroSub}>de aproveitamento</Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={26} color={Colors.primary} />
            <Text style={styles.statValue}>{acertos}/{total}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={26} color="#F59E0B" />
            <Text style={styles.statValue}>+{xp}</Text>
            <Text style={styles.statLabel}>XP Ganho</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={26} color="#6366F1" />
            <Text style={styles.statValue}>{formatDuration(duracao)}</Text>
            <Text style={styles.statLabel}>Duração</Text>
          </View>
        </View>



        {/* Missões atualizadas */}
        {missions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Progresso de Missões</Text>
            {missions.map((mp: any) => {
              // Buscamos o dado real da API caso o JSON local venha faltando o target
              const liveMp = liveMissions.find(lm => lm.mission?.id === mp.id || lm.id === mp.id);
              const missionData = liveMp ? liveMp.mission : mp.mission;

              const target = (missionData as any)?.goal_value ?? missionData?.target ?? mp.target ?? (mp as any).goal ?? 1;
              const progress = liveMp?.progress ?? mp.progress ?? (mp as any).current ?? 0;
              const title = missionData?.title ?? mp.title ?? (mp as any).description ?? 'Missão';
              const completed = liveMp?.completed ?? mp.completed ?? false;
              const pct = completed ? 100 : Math.min((progress / target) * 100, 100);
              return (
                <View key={mp.id ?? mp.mission_id ?? title} style={styles.missionCard}>
                  <View style={styles.missionHeader}>
                    <Text style={styles.missionTitle}>{title}</Text>
                    {completed && <Text style={styles.missionComplete}>✓ Concluída!</Text>}
                  </View>
                  <View style={styles.missionTrack}>
                    <View style={[styles.missionFill, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={styles.missionSub}>
                    {target > 0 ? `${progress}/${target}` : `${progress} pontos`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Ir para o Início</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSecondary, starting && { opacity: 0.7 }]}
            onPress={handlePlayAgain}
            activeOpacity={0.8}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.btnSecondaryText}>Praticar Novamente</Text>
            )}
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
    backgroundColor: Colors.white, borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  heroIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, letterSpacing: -0.4 },
  heroAccuracy: { fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  heroSub: { fontSize: 14, color: Colors.textSecondary },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', fontWeight: '600' },

  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },



  missionCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, flex: 1 },
  missionComplete: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  missionTrack: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' },
  missionFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 99 },
  missionSub: { fontSize: 11, color: Colors.textSecondary },

  ctaSection: { gap: 12, marginTop: 4 },
  btnPrimary: {
    backgroundColor: Colors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  btnSecondary: {
    height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  btnSecondaryText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
});
