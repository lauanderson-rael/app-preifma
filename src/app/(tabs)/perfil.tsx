import { dashboardService } from '@/api/dashboardService';
import { userService } from '@/api/userService';
import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { useAI } from '@/context/AIContext';
import { useAuth } from '@/context/AuthContext';
import type { SessionHistoryItem, UserStats } from '@/types/api';
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


export default function PerfilScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { aiUsage } = useAI();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, dashRes] = await Promise.allSettled([
        userService.getStats(),
        dashboardService.getDashboard(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (dashRes.status === 'fulfilled') setRecentSessions(dashRes.value.recent_sessions || []);
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

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Perfil"
        leftContent={
          <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
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


          {/* Uso de IA Simplificado */}
          {aiUsage && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={24} color="#8B5CF6" />
              <View>
                <Text style={styles.aiBadgeTitle}>Você tem {aiUsage.remaining}/{aiUsage.limit} explicações!</Text>
                <Text style={styles.aiBadgeSubtitle}>As explicações com IA resetam diariamente.</Text>
              </View>
            </View>
          )}
        </View>


        {/* ── Histórico de Atividades ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>

            <Text style={styles.cardTitle}>Histórico de Atividades</Text>
          </View>

          {recentSessions.length > 0 ? (
            <View style={styles.historyList}>
              {recentSessions.map((session, index) => {
                const date = new Date(session.created_at);
                const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });


                const typeInfo = {
                  quick: { icon: 'flash-outline', label: 'Rápida', color: '#22C55E' },
                  simulated: { icon: 'clipboard-outline', label: 'Simulado', color: '#F59E0B' },
                  practice: { icon: 'library-outline', label: 'Treino Livre', color: '#3B82F6' },
                }[session.type] || { icon: 'help-circle-outline', label: 'Sessão', color: '#6B7280' };

                return (
                  <React.Fragment key={session.id}>
                    <View style={styles.historyItem}>
                      <View style={[styles.historyIcon, { backgroundColor: typeInfo.color + '25' }]}>
                        <Ionicons name={typeInfo.icon as any} size={18} color={typeInfo.color} />
                      </View>
                      <View style={styles.historyMain}>
                        <View style={styles.historyTitleRow}>
                          <Text style={styles.historyTitle}>{typeInfo.label}</Text>
                        </View>
                        <Text style={styles.historySubtitle}>
                          {dateStr} • {session.correct_answers}/{session.total_questions} acertos
                        </Text>
                      </View>
                      <View style={styles.historyRight}>
                        <Text style={[styles.historyAccuracy, { color: session.accuracy >= 60 ? '#16A34A' : '#EF4444' }]}>
                          {Math.round(session.accuracy)}%
                        </Text>
                        <Text style={styles.historyXp}>+{session.xp_gained} XP</Text>
                      </View>
                    </View>
                    {index < recentSessions.length - 1 && <View style={styles.historyDivider} />}
                  </React.Fragment>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>Nenhuma atividade recente encontrada.</Text>
          )}
        </View>

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
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40, gap: 16 },

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


  aiBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF',
    borderRadius: 12, padding: 14, gap: 10,
  },
  aiBadgeTitle: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  aiBadgeSubtitle: { fontSize: 12, color: '#6D28D9', marginTop: 1 },

  card: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  historySubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  historyList: { gap: 14 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  historyMain: { flex: 1, gap: 1 },
  historyTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 8 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  historyDate: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  historyRight: { alignItems: 'flex-end', gap: 2 },
  historyAccuracy: { fontSize: 14, fontWeight: '800' },
  historyXp: { fontSize: 11, fontWeight: '600', color: '#A855F7' },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 10 },
  historyDivider: {
    height: 1.2,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },

  sairBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#EF4444', borderRadius: 14, height: 52, marginTop: 4,
  },
  sairBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
