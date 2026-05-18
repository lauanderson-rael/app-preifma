import { dashboardService } from '@/api/dashboardService';
import { examService } from '@/api/examService';
import { progressService } from '@/api/progressService';
import { sessionService } from '@/api/sessionService';
import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { useAI } from '@/context/AIContext';
import { useAuth } from '@/context/AuthContext';
import type { Dashboard, SessionType, SubjectProgress } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Book, Calculator, ChevronRight, Shuffle, Timer, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const Hexagon = ({ color, size = 32 }: { color: string, size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path
      d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
      fill={color}
    />
  </Svg>
);
const BANNER_WIDTH = width - 32;

const SUBJECT_CONFIG: Record<string, { titulo: string; Icon: any; corFundo: string; corIcone: string; gradient: [string, string] }> = {
  portugues: {
    titulo: 'Português',
    Icon: Book,
    corFundo: '#DCFCE7',
    corIcone: '#16A34A',
    gradient: ['#22C55E', '#16A34A']
  },
  matematica: {
    titulo: 'Matemática',
    Icon: Calculator,
    corFundo: '#DBEAFE',
    corIcone: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB']
  },
};

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const { updateAIUsage } = useAI();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [startingSession, setStartingSession] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [dashData, progressData] = await Promise.all([
        dashboardService.getDashboard(),
        progressService.getSubjectProgress(),
        refreshUser(),
      ]);
      setDashboard(dashData);
      setSubjectProgress(progressData);
      if (dashData.ai_usage) {
        updateAIUsage(dashData.ai_usage);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  const startQuickSession = async (type: SessionType, subject?: 'portugues' | 'matematica') => {
    if (startingSession) return;
    setStartingSession(true);
    try {
      const QUICK_COUNTS = [3, 5, 7, 10];
      const count = type === 'quick'
        ? QUICK_COUNTS[Math.floor(Math.random() * QUICK_COUNTS.length)]
        : 10;
      const questions = await examService.getRandomQuestions({ count, subject });
      if (!questions || questions.length === 0) {
        Alert.alert('Sem questões', 'Não há questões disponíveis para este filtro.');
        return;
      }
      const questionIds = questions.map((q) => q.id);
      const session = await sessionService.startSession({ type, question_ids: questionIds });

      router.push({
        pathname: '/estudo/questao',
        params: {
          sessionId: String(session.id),
          sessionType: type,
          questionIds: questionIds.join(','),
          materia: subject ?? '',
          titulo: subject ? SUBJECT_CONFIG[subject]?.titulo ?? 'Estudo' : 'Sessão Rápida',
        },
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a sessão. Verifique sua conexão.');
    } finally {
      setStartingSession(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Lauanderson';

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <CustomHeader
        title=""
        leftContent={
          <View style={styles.headerUserBlock}>
            <Text style={styles.headerGreetingText} numberOfLines={1}>Olá {firstName}! 👋</Text>
          </View>
        }
        rightContent={
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={[styles.headerBadge, { backgroundColor: '#F0F9FF' }]}
              onPress={() => setLevelModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.diamondIconWrapper}>
                <Ionicons name="star" size={14} color="#FACC15" />
              </View>
              <Text style={[styles.headerBadgeText, { color: '#0369A1' }]}>
                Nv. {dashboard?.level ?? user?.level ?? 1}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* ── Banners Carousel ── */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + 12}
            snapToAlignment="start"
            decelerationRate="fast"
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / (BANNER_WIDTH + 12));
              setActiveBanner(index);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{ gap: 12 }}
          >
            <Image
              source={require('../../../assets/images/banner1.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <Image
              source={require('../../../assets/images/banner2.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </ScrollView>
          <View style={styles.pagination}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  activeBanner === i && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── Stats Card ── */}
        <LinearGradient
          colors={['#064E3B', '#022C22']}
          style={styles.statsCard}
        >
          {/* XP Section */}
          <View style={[styles.statsSection, { flex: 1 }]}>
            <View style={styles.statsIconContainer}>
              <Hexagon color="#FACC15" size={28} />
              <Ionicons name="star" size={14} color="#854D0E" style={styles.statsIconOverlay} />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statsLabel}>XP Total</Text>
              <Text style={styles.statsValue} numberOfLines={1}>
                {(dashboard?.xp ?? user?.xp ?? 0).toLocaleString('pt-BR')}
              </Text>
              <View style={styles.statsProgressTrack}>
                <View
                  style={[
                    styles.statsProgressFill,
                    {
                      width: `${dashboard?.progress_pct ?? user?.progress_pct ?? 0}%` as any,
                      minWidth: (dashboard?.progress_pct ?? user?.progress_pct ?? 0) > 0 ? 6 : 0
                    }
                  ]}
                />
              </View>
              <Text style={styles.statsSubtext}>
                Meta atual: {((dashboard?.xp ?? user?.xp ?? 0) + (dashboard?.xp_to_next_level ?? user?.xp_to_next_level ?? 0)).toLocaleString('pt-BR')} XP
              </Text>
            </View>
          </View>

          <View style={styles.statsDivider} />

          {/* Missions Section */}
          <View style={[styles.statsSection, { flex: 1 }]}>
            <View style={styles.statsIconContainer}>
              <Hexagon color="#A855F7" size={28} />
              <Ionicons name="flag" size={14} color="#FFF" style={styles.statsIconOverlay} />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statsLabel}>Missões diárias</Text>
              <Text style={styles.statsValue}>
                {dashboard?.daily_missions?.filter(m => m.completed).length || 0}/{dashboard?.daily_missions?.length || 0}
              </Text>
              <View style={styles.statsProgressTrack}>
                <View
                  style={[
                    styles.statsProgressFill,
                    {
                      width: `${(dashboard?.daily_missions?.filter(m => m.completed).length || 0) / (dashboard?.daily_missions?.length || 1) * 100}%`,
                      backgroundColor: '#A855F7'
                    }
                  ]}
                />
              </View>
              <Text style={styles.statsSubtext}>Concluídas</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Modo de Estudo ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que você vai estudar hoje?</Text>
          <View style={styles.studyModesRow}>
            {/* Sessão Rápida */}
            <TouchableOpacity
              style={styles.studyModeCard}
              activeOpacity={0.8}
              onPress={() => startQuickSession('quick')}
            >
              <LinearGradient
                colors={['#4ADE80', '#1fa952ff']}
                style={styles.studyModeGradient}
              >
                <View style={styles.studyModeLeft}>
                  <View style={styles.studyModeIconCircle}>
                    <Zap size={24} color="#FFF" fill="#FFF" />
                  </View>
                  <View>
                    <Text style={styles.studyModeTitle}>Sessão Rápida</Text>
                    <Text style={styles.studyModeDesc}>3 a 10 questões</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Simulado */}
            <TouchableOpacity
              style={styles.studyModeCard}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/simulados')}
            >
              <LinearGradient
                colors={['#FB923C', '#EA580C']}
                style={styles.studyModeGradient}
              >
                <View style={styles.studyModeLeft}>
                  <View style={styles.studyModeIconCircle}>
                    <Timer size={24} color="#FFF" />
                  </View>
                  <View>
                    <Text style={styles.studyModeTitle}>Simulado</Text>
                    <Text style={styles.studyModeDesc}>Faça um simulado completo</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Estudo Livre */}
            <TouchableOpacity
              style={styles.studyModeCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/estudo/filtros',
                  params: {
                    titulo: 'Estudo Livre',
                    materia: '',
                  },
                })
              }
            >
              <LinearGradient
                colors={['#61b9f8ff', '#0f65c1ff']}
                style={styles.studyModeGradient}
              >
                <View style={styles.studyModeLeft}>
                  <View style={styles.studyModeIconCircle}>
                    <Shuffle size={24} color="#FFF" />
                  </View>
                  <View>
                    <Text style={styles.studyModeTitle}>Estudo Livre</Text>
                    <Text style={styles.studyModeDesc}>Escolha matéria e quantidade</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Seu Desempenho ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seu desempenho</Text>

          </View>

          <View style={styles.performanceRow}>
            {['portugues', 'matematica'].map((sub) => {
              const config = SUBJECT_CONFIG[sub];
              const stats = subjectProgress?.find(s => s.subject === sub);
              const accuracy = stats?.accuracy ?? 0;
              const total = stats?.questions_answered ?? 0;
              const correct = stats?.correct_answers ?? 0;

              return (
                <View key={sub} style={styles.performanceCard}>
                  <View style={styles.performanceHeader}>
                    <View style={[styles.performanceIconBox, { backgroundColor: config.corFundo }]}>
                      <config.Icon size={18} color={config.corIcone} />
                    </View>
                    <Text style={styles.performanceTitle}>{config.titulo}</Text>
                  </View>

                  <View style={styles.performanceContent}>
                    <View style={styles.circularProgressContainer}>
                      <Svg width={100} height={60} viewBox="0 0 100 60">
                        <Path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <Path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke={config.corIcone}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(accuracy / 100) * 125.6} 200`}
                        />
                      </Svg>
                      <View style={styles.circularProgressTextContainer}>
                        <Text style={[styles.accuracyText, { color: '#111827' }]}>{accuracy.toFixed(0)}%</Text>
                        <Text style={styles.accuracySubtext}>de acertos</Text>
                      </View>
                    </View>

                    <View style={styles.performanceStats}>
                      <Text style={styles.performanceStatsLabel}>Respondidas</Text>
                      <Text style={styles.performanceStatsValue}>{total}</Text>
                      <Text style={[styles.performanceStatsLabel, { marginTop: 8 }]}>Acertos</Text>
                      <Text style={[styles.performanceStatsValue, { color: Colors.primary }]}>{correct}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {startingSession && (
          <View style={styles.startingOverlay}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.startingText}>Preparando sessão...</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Informação sobre Nível */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={levelModalVisible}
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name="star" size={40} color="#FACC15" />
            </View>
            <Text style={styles.modalTitle}>Nível</Text>
            <Text style={styles.modalText}>
              Seu nível representa sua dedicação e progresso nos estudos!
              {"\n\n"}
              Ganhe pontos de experiência (XP) ao responder questões corretamente,
              concluir simulados completos e resgatar suas missões diárias.

            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setLevelModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Entendi!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, gap: 16 },

  headerUserBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerGreetingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    maxWidth: 200,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  diamondIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#064E3B',
    borderRadius: 16,
    minHeight: 110,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  statsDivider: {
    width: 1,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statsIconContainer: {
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsIconOverlay: {
    position: 'absolute',
  },
  statsInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  statsProgressTrack: {
    width: '100%',
    maxWidth: 120,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  statsProgressFill: {
    height: '100%',
    backgroundColor: '#FACC15',
  },
  statsSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginTop: 2,
  },

  carouselContainer: {
    height: 100,
  },
  bannerImage: {
    width: width - 32,
    height: 100,
    borderRadius: 8,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  paginationDotActive: {
    width: 16,
    backgroundColor: '#FFF',
  },
  section: { gap: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  studyModesRow: {
    flexDirection: 'column',
    gap: 12,
  },
  studyModeCard: {
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
  },
  studyModeGradient: {
    flex: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studyModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  studyModeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyModeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  studyModeDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },

  performanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  performanceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  performanceContent: {
    alignItems: 'center',
    gap: 16,
  },
  circularProgressContainer: {
    width: 100,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  circularProgressTextContainer: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  accuracySubtext: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  performanceStats: {
    width: '100%',
  },
  performanceStatsLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  performanceStatsValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  startingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  startingText: { fontSize: 14, color: '#111827', fontWeight: '700', marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF9C3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
