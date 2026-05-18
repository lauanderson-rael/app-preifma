import { missionService } from "@/api/missionService";
import { CustomHeader } from "@/components/CustomHeader";
import { Colors } from "@/constants/Colors";
import type { MissionProgress } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function MissionCard({ item, onClaim, claiming }: {
  item: MissionProgress;
  onClaim: (id: number) => void;
  claiming: boolean;
}) {
  const mission = item.mission;
  const title = mission?.title ?? item.title ?? "Missão diária";
  const description = mission?.description ?? "Complete a meta para ganhar XP.";
  const target = mission?.goal_value ?? mission?.target ?? item.target ?? (item as any).goal ?? (mission as any)?.goal ?? 0;
  const progress = item.progress ?? (item as any).current ?? 0;
  const targetDisplay = target > 0 ? target : 10;
  const xpReward = mission?.xp_reward ?? 0;
  const specialRewardDisplay = mission?.special_reward_display ?? null;
  const pct =
    targetDisplay > 0
      ? Math.min((progress / targetDisplay) * 100, 100)
      : item.completed
        ? 100
        : 0;
  const canClaim = item.completed && !item.xp_claimed;

  return (
    <View style={[
      styles.card,
      (item.completed || item.xp_claimed) && styles.cardDone,
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[
            styles.iconBubble,
            item.completed && styles.iconBubbleDone
          ]}>
            <Ionicons
              name={item.completed ? "checkmark" : "flag-outline"}
              size={item.completed ? 22 : 18}
              color="#7C3AED"
            />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.completed ? styles.statusDone : styles.statusPending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.completed ? styles.statusTextDone : styles.statusTextPending,
            ]}
          >
            {item.completed ? "Concluída" : "Em andamento"}
          </Text>
        </View>
      </View>

      <View style={styles.progressMeta}>
        <Text style={styles.progressText}>
          Progresso: {progress}/{targetDisplay}
        </Text>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={styles.progressText}>
            Recompensa: {xpReward} XP
            {item.xp_claimed}
          </Text>
          {specialRewardDisplay && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="sparkles" size={12} color='#7C3AED' />
              <Text style={{ fontSize: 12, color: '#7C3AED', fontWeight: '700' }}>
                {specialRewardDisplay}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.track, item.completed && { backgroundColor: '#EDE9FE' }]}>
        <View style={[styles.fill, { width: `${pct}%` }, item.completed && { backgroundColor: '#7C3AED' }]} />
      </View>

      {canClaim ? (
        <TouchableOpacity
          style={[styles.claimButton, claiming && styles.claimButtonDisabled]}
          disabled={claiming}
          onPress={() => onClaim(item.id)}
          activeOpacity={0.85}
        >
          {claiming ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.claimButtonText}>Resgatar recompensa</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function MissaoScreen() {
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMissions = useCallback(async () => {
    try {
      setError(null);
      const data = await missionService.getDailyMissions();
      setMissions(data);
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível carregar as missões do dia.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, [loadMissions]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMissions();
  }, [loadMissions]);

  const handleClaim = useCallback(async (id: number) => {
    setClaimingId(id);
    try {
      await missionService.claimMission(id);
      await loadMissions();
      Alert.alert(
        "Recompensa resgatada",
        "Sua recompensa da missão foi adicionada com sucesso.",
      );
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Não foi possível resgatar a recompensa.");
    } finally {
      setClaimingId(null);
    }
  }, [loadMissions]);

  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.xp_claimed).length;

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Missões diárias"
        leftContent={
          <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <LinearGradient colors={['#8B5CF6', '#6a28dbff']} style={styles.hero}>
          <Text style={styles.heroTitle}>Complete missões e ganhe recompensas</Text>
          <Text style={styles.heroSubtitle}>
            {missions.length > 0
              ? `${completedCount}/${missions.length} concluídas • ${claimedCount} resgatadas`
              : "Nenhuma missão disponível no momento."}
          </Text>
        </LinearGradient>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.stateText}>Carregando missões...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={Colors.error}
            />
            <Text style={styles.stateTitle}>Algo deu errado</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRefresh}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : missions.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons
              name="checkbox-outline"
              size={28}
              color={Colors.textSecondary}
            />
            <Text style={styles.stateTitle}>Sem missões hoje</Text>
            <Text style={styles.stateText}>
              Volte mais tarde para ver novas missões diárias.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {missions.map((item) => (
              <MissionCard
                key={item.id}
                item={item}
                onClaim={handleClaim}
                claiming={claimingId === item.id}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingTop: 10,
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 36,
  },
  hero: {
    backgroundColor: "#7C3AED",
    borderRadius: 20,
    padding: 18,
    gap: 8,
    elevation: 2,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#ffffff",
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubbleDone: {
    backgroundColor: "#DDD6FE",
  },
  cardDone: {
    backgroundColor: "#F5F3FF",
    borderColor: "transparent",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDone: {
    backgroundColor: "#DDD6FE",
  },
  statusPending: {
    backgroundColor: "#EDE9FE",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextDone: {
    color: "#6D28D9",
  },
  statusTextPending: {
    color: "#7C3AED",
  },
  progressMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  track: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    // backgroundColor: "#3B82F6",
    backgroundColor: "#7C3AED",
    borderRadius: 99,
  },
  claimButton: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
  },
  claimButtonDisabled: {
    opacity: 0.7,
  },
  claimButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  claimedBox: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F5F3FF",
  },
  claimedText: {
    color: "#6D28D9",
    fontSize: 14,
    fontWeight: "700",
  },
  stateBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
