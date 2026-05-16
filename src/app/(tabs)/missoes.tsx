import { missionService } from "@/api/missionService";
import { CustomHeader } from "@/components/CustomHeader";
import { Colors } from "@/constants/Colors";
import type { MissionProgress } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
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
  const target = mission?.target ?? item.target ?? 0;
  const progress = item.progress ?? 0;
  const xpReward = mission?.xp_reward ?? 0;
  const pct =
    target > 0
      ? Math.min((progress / target) * 100, 100)
      : item.completed
        ? 100
        : 0;
  const canClaim = item.completed && !item.xp_claimed;

  return (
    <View style={[
      styles.card,
      item.completed && styles.cardDone,
      item.xp_claimed && styles.cardClaimed
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[
            styles.iconBubble,
            item.completed && styles.iconBubbleDone
          ]}>
            <Ionicons
              name={item.completed ? "checkmark-done" : "flag-outline"}
              size={18}
              color={item.completed ? "#FFF" : Colors.primary}
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
          {target > 0 ? `Progresso: ${progress}/${target}` : `Progresso: ${progress}`}
        </Text>
        <Text style={styles.progressText}>Recompensa: {xpReward} XP</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
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
            <Text style={styles.claimButtonText}>Resgatar XP</Text>
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
        "XP resgatado",
        "Seu XP da missão foi adicionado com sucesso.",
      );
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Não foi possível resgatar o XP.");
    } finally {
      setClaimingId(null);
    }
  }, [loadMissions]);

  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.xp_claimed).length;

  return (
    <View style={styles.container}>
      <CustomHeader title="Missões diárias" />

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
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Complete missões e ganhe recompensas</Text>
          <Text style={styles.heroSubtitle}>
            {missions.length > 0
              ? `${completedCount}/${missions.length} concluídas • ${claimedCount} resgatadas`
              : "Nenhuma missão disponível no momento."}
          </Text>
        </View>

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
    backgroundColor: Colors.secondary,
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
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubbleDone: {
    backgroundColor: "#22C55E",
  },
  cardDone: {
    backgroundColor: "#F0FDF4",
    borderColor: "#22C55E",
    borderWidth: 2,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardClaimed: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    opacity: 0.9,
    elevation: 0,
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
    backgroundColor: "#DCFCE7",
  },
  statusPending: {
    backgroundColor: "#E0F2FE",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextDone: {
    color: "#15803D",
  },
  statusTextPending: {
    color: "#0369A1",
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
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },
  claimButton: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
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
    backgroundColor: "#F0FDF4",
  },
  claimedText: {
    color: "#15803D",
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
