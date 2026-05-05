import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { userService } from '@/api/userService';
import { achievementService } from '@/api/achievementService';
import { progressService } from '@/api/progressService';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { UserStats, SubjectProgress, UserAchievement } from '@/types/api';

function BarraProgresso({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  return (
    <View style={styles.barraContainer}>
      <View style={styles.barraHeader}>
        <Text style={styles.barraLabel}>{label}</Text>
        <Text style={[styles.barraValor, { color: cor }]}>{valor.toFixed(0)}%</Text>
      </View>
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchimento, { width: `${valor}%` as any, backgroundColor: cor }]} />
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, progressRes, achievementsRes] = await Promise.allSettled([
        userService.getStats(),
        progressService.getSubjectProgress(),
        achievementService.getUserAchievements(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (progressRes.status === 'fulfilled') setSubjectProgress(progressRes.value);
      if (achievementsRes.status === 'fulfilled') setUserAchievements(achievementsRes.value);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    refreshUser();
  }, [loadData, refreshUser]);

  const handleSair = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const iniciais = user?.name
    ? user.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  if (loading) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const subjectLabel: Record<string, string> = { portugues: 'Português', matematica: 'Matemática' };
  const subjectColor: Record<string, string> = { portugues: Colors.primary, matematica: '#3B82F6' };

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Perfil"
        leftContent={
          <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
        rightContent={
          <TouchableOpacity onPress={() => router.push('/perfil/configuracoes')} style={{ padding: 4, marginRight: -4 }}>
            <Ionicons name="settings-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* ── Avatar + Info ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciais}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name ?? '—'}</Text>
              <Text style={styles.userUsername}>@{user?.username ?? '—'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
            </View>
          </View>

          {/* XP + Nível */}
          {stats && (
            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Nível {stats.level || 1}</Text>
                </View>
                <Text style={styles.xpText}>{stats.xp || 0} XP</Text>
              </View>
              <View style={styles.xpTrack}>
                <View 
                  style={[
                    styles.xpFill, 
                    { 
                      width: `${stats.progress_pct || 0}%` as any,
                      minWidth: (stats.progress_pct || 0) > 0 ? 4 : 0
                    }
                  ]} 
                />
              </View>
              <Text style={styles.xpNext}>Faltam {stats.xp_to_next_level || 0} XP para o próximo nível</Text>
            </View>
          )}

          {/* Streak badge */}
          {stats && (
            <View style={styles.ofensivaBadge}>
              <Ionicons name="flame" size={24} color="#EA580C" />
              <View>
                <Text style={styles.ofensivaTitle}>{stats.streak || 0} dias de ofensiva!</Text>
                <Text style={styles.ofensivaSubtitle}>Continue estudando para manter.</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Estatísticas ── */}
        {stats && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trending-up" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Estatísticas de Desempenho</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.total_questions || 0}</Text>
                <Text style={styles.statLabel}>Questões{'\n'}respondidas</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>{Number(stats.accuracy_pct || 0).toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Taxa de acerto</Text>
              </View>
            </View>

            {/* Progresso por matéria */}
            {subjectProgress.length > 0 && (
              <View style={styles.barras}>
                {subjectProgress.map((sp) => (
                  <BarraProgresso
                    key={sp.subject}
                    label={subjectLabel[sp.subject] ?? sp.subject}
                    valor={Number(sp.accuracy_pct || 0)}
                    cor={subjectColor[sp.subject] ?? Colors.primary}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Conquistas ── */}
        {userAchievements.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trophy-outline" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Conquistas ({userAchievements.length})</Text>
            </View>
            <View style={styles.conquistasGrid}>
              {userAchievements.slice(0, 6).map((ua) => (
                <View key={ua.id} style={styles.conquistaItem}>
                  <View style={styles.conquistaIconBox}>
                    <Text style={styles.conquistaEmoji}>{ua.achievement.icon}</Text>
                  </View>
                  <Text style={styles.conquistaLabel} numberOfLines={2}>{ua.achievement.title}</Text>
                </View>
              ))}
            </View>
            {userAchievements.length > 6 && (
              <TouchableOpacity onPress={() => router.push('/conquistas' as any)}>
                <Text style={styles.verTodas}>Ver todas as conquistas →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Botão Sair ── */}
        <TouchableOpacity style={styles.sairBtn} onPress={handleSair} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.sairBtnText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 },

  profileCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.white },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  userUsername: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  userEmail: { fontSize: 12, color: Colors.textSecondary },

  xpSection: { gap: 6 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  levelText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  xpText: { fontSize: 13, fontWeight: '700', color: Colors.text },
  xpTrack: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 99 },
  xpNext: { fontSize: 11, color: Colors.textSecondary },

  ofensivaBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED',
    borderRadius: 12, padding: 14, gap: 10,
  },
  ofensivaTitle: { fontSize: 14, fontWeight: '700', color: '#EA580C' },
  ofensivaSubtitle: { fontSize: 12, color: '#C2410C', marginTop: 1 },

  card: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  barras: { gap: 14 },
  barraContainer: { gap: 6 },
  barraHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barraLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  barraValor: { fontSize: 13, fontWeight: '700' },
  barraFundo: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' },
  barraPreenchimento: { height: '100%', borderRadius: 99 },

  conquistasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  conquistaItem: { alignItems: 'center', gap: 6, width: '30%' },
  conquistaIconBox: {
    width: 54, height: 54, borderRadius: 14, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  conquistaEmoji: { fontSize: 26 },
  conquistaLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  verTodas: { fontSize: 13, color: Colors.primary, fontWeight: '600', textAlign: 'center' },

  sairBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#EF4444', borderRadius: 14, height: 52, marginTop: 4,
  },
  sairBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
