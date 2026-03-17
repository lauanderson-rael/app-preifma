import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type SimuladoStatus = 'concluido' | 'disponivel' | 'bloqueado';

interface Simulado {
  id: string;
  titulo: string;
  duracao: number;   // em minutos
  questoes: number;
  status: SimuladoStatus;
  desempenho?: { acertos: number; total: number };
}

// Dados mockados por enquanto
const SIMULADOS: Simulado[] = [
  {
    id: '1',
    titulo: 'Simulado IFMA - Edição 1',
    duracao: 180,
    questoes: 40,
    status: 'concluido',
    desempenho: { acertos: 32, total: 40 },
  },
  {
    id: '2',
    titulo: 'Simulado IFMA - Edição 2',
    duracao: 180,
    questoes: 40,
    status: 'disponivel',
  },
  {
    id: '3',
    titulo: 'Simulado IFMA - Edição 3',
    duracao: 180,
    questoes: 40,
    status: 'bloqueado',
  },
];

const INFO_BULLETS = [
  '40 questões de múltipla escolha',
  '3 horas de duração',
  'Feedback detalhado ao final',
  'Desbloqueie novos simulados completando os anteriores',
];

// Subcomponente: Card de Simulado
function SimuladoCard({ item, onStart, }: {
  item: Simulado;
  onStart: (id: string) => void;
}) {
  const isBloqueado = item.status === 'bloqueado';
  const isConcluido = item.status === 'concluido';
  const porcentagem = item.desempenho
    ? Math.round((item.desempenho.acertos / item.desempenho.total) * 100)
    : null;

  return (
    <View style={[styles.card, isBloqueado && styles.cardBloqueado]}>
      {/* Linha superior */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={[styles.cardTitle, isBloqueado && styles.textMuted]}>
            {item.titulo}
          </Text>
          <View style={styles.cardMeta}>
            <Ionicons
              name="time-outline"
              size={13}
              color={isBloqueado ? Colors.textMuted : Colors.textSecondary}
            />
            <Text style={[styles.cardMetaText, isBloqueado && styles.textMuted]}>
              {item.duracao} min
            </Text>
            <Text style={[styles.cardMetaDot, isBloqueado && styles.textMuted]}>•</Text>
            <Text style={[styles.cardMetaText, isBloqueado && styles.textMuted]}>
              {item.questoes} questões
            </Text>
          </View>
        </View>


        {isConcluido && (
          <View style={styles.statusIconConcluido}>
            <Ionicons name="checkmark-circle" size={26} color={Colors.primary} />
          </View>
        )}
        {isBloqueado && (
          <Ionicons name="lock-closed-outline" size={22} color={Colors.textMuted} />
        )}
      </View>

      {/* Desempenho (concluído) */}
      {isConcluido && item.desempenho && (
        <View style={styles.desempenhoBox}>
          <Text style={styles.desempenhoLabel}>Seu desempenho:</Text>
          <Text style={styles.desempenhoValor}>
            {item.desempenho.acertos}/{item.desempenho.total} acertos ({porcentagem}%)
          </Text>
        </View>
      )}

      {/* Botão iniciar (disponível) */}
      {item.status === 'disponivel' && (
        <TouchableOpacity
          style={styles.iniciarBtn}
          activeOpacity={0.8}
          onPress={() => onStart(item.id)}
        >
          <Text style={styles.iniciarBtnText}>Iniciar simulado</Text>
        </TouchableOpacity>
      )}

      {/* Botão refazer (concluido) - Para conseguir testar no mockup */}
      {isConcluido && (
        <TouchableOpacity
          style={styles.refazerBtn}
          activeOpacity={0.8}
          onPress={() => onStart(item.id)}
        >
          <Text style={styles.refazerBtnText}>Refazer simulado</Text>
        </TouchableOpacity>
      )}

      {/* Mensagem bloqueado */}
      {isBloqueado && (
        <Text style={styles.bloqueadoMsg}>
          Complete os simulados anteriores para desbloquear
        </Text>
      )}
    </View>
  );
}

// ── Tela principal ─────────────────────────────────────────
export default function SimuladosScreen() {
  const [loading, setLoading] = useState(false);
  const [confirmSimuladoId, setConfirmSimuladoId] = useState<string | null>(null);

  const handleStartSimulado = (id: string) => {
    setConfirmSimuladoId(id);
  };

  const confirmStart = () => {
    if (!confirmSimuladoId) return;
    const id = confirmSimuladoId;
    setConfirmSimuladoId(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push(`/simulado/${id}`);
    }, 1500); //loading (1,5s)
  };

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Simulados"
        leftContent={
          <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />
      {/* ── Modal de Confirmação customizado ── */}
      <Modal visible={!!confirmSimuladoId} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconBox}>
              <Ionicons name="alert-circle" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.confirmTitle}>Iniciar Simulado</Text>
            <Text style={styles.confirmDesc}>
              Você tem 3 horas para concluir o simulado. O cronômetro não pode ser pausado. Deseja começar agora?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnCancel]}
                onPress={() => setConfirmSimuladoId(null)}
              >
                <Text style={styles.confirmBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnStart]}
                onPress={confirmStart}
              >
                <Text style={styles.confirmBtnStartText}>Começar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal de Loading ── */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Preparando simulado...</Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {/* <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Simulados</Text>
          <Text style={styles.pageSubtitle}>
            Teste seus conhecimentos com simulados completos
          </Text>
        </View> */}

        {/* Card informativo verde */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Como funcionam os simulados?</Text>
          <View style={styles.infoList}>
            {INFO_BULLETS.map((bullet, i) => (
              <View key={i} style={styles.infoListItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoBulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lista de simulados */}
        <View style={styles.list}>
          {SIMULADOS.map((item) => (
            <SimuladoCard
              key={item.id}
              item={item}
              onStart={handleStartSimulado}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },

  // Modal Loading e Confirm
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingBox: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },

  // Custom Confirm Modal
  confirmBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  confirmDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: '#F3F4F6',
  },
  confirmBtnStart: {
    backgroundColor: Colors.primary,
  },
  confirmBtnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  confirmBtnStartText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },

  // Page header
  pageHeader: {
    gap: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.secondary
    ,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  infoList: {
    gap: 8,
  },
  infoListItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  infoBullet: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  infoBulletText: {
    color: 'rgba(255,255,255,0.93)',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },

  // Lista de cards
  list: {
    gap: 14,
  },

  // Card individual
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBloqueado: {
    backgroundColor: '#F9FAFB',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardMetaDot: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusIconConcluido: {
    marginTop: 2,
  },
  textMuted: {
    color: Colors.textMuted,
  },

  // Desempenho
  desempenhoBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  desempenhoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  desempenhoValor: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: -0.2,
  },

  // Botão iniciar
  iniciarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciarBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffffff',
    letterSpacing: 0.1,
  },
  refazerBtn: {
    backgroundColor: '#d5d5d5ff',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  refazerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.1,
  },

  // Mensagem bloqueado
  bloqueadoMsg: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
