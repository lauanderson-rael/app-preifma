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

const INFO_BULLETS = [
  '30 questões de múltipla escolha',
  '15 de Português e 15 de Matemática',
  '3 horas de duração',
  'Cronômetro regressivo',
  'Mix aleatório de questões',
];

const NIVEIS = ['Integrado', 'Subsequente', 'Concomitante'];

import { examService } from '@/api/examService';
import { sessionService } from '@/api/sessionService';
import { Alert } from 'react-native';

// ── Tela principal ─────────────────────────────────────────
export default function SimuladosScreen() {
  const [loading, setLoading] = useState(false);
  const [nivelSelecionado, setNivelSelecionado] = useState<string>('Integrado');
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmStart = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      // 1. Buscar questões do simulado (30 questões: 15 port + 15 mat)
      const res = await examService.getSimuladoQuestions(nivelSelecionado);
      console.log("[Simulado] API Response Type:", typeof res, "IsArray:", Array.isArray(res));

      // Tenta extrair a lista de questões independente do formato (array direto ou objeto com chave 'results' ou 'questions')
      const questions = Array.isArray(res) 
        ? res 
        : (res && typeof res === 'object')
          ? ((res as any).results || (res as any).questions || [])
          : [];

      if (questions.length === 0) {
        Alert.alert('Aviso', 'Não recebemos questões para este simulado. Tente novamente em instantes.');
        setLoading(false);
        return;
      }

      const questionIds = questions.map(q => q.id);

      // 2. Iniciar a sessão no backend
      const session = await sessionService.startSession({
        type: 'simulated',
        question_ids: questionIds
      });

      // 3. Navegar para a tela do simulado com o timer de 3h
      router.push({
        pathname: '/simulado/prova',
        params: {
          sessionId: String(session.id),
          questionIds: questionIds.join(','),
          titulo: `Simulado - ${nivelSelecionado}`,
          tempoLimite: '10800',
        }
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao preparar o simulado.');
    } finally {
      setLoading(false);
    }
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
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconBox}>
              <Ionicons name="timer-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.confirmTitle}>Iniciar Simulado</Text>
            <Text style={styles.confirmDesc}>
              Você terá 3 horas para responder 30 questões. O cronômetro não pode ser pausado. Preparado?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnCancel]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.confirmBtnCancelText}>Agora não</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnStart]}
                onPress={confirmStart}
              >
                <Text style={styles.confirmBtnStartText}>Vamos lá!</Text>
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
            <Text style={styles.loadingText}>Gerando prova...</Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Novo Simulado</Text>
          <Text style={styles.pageSubtitle}>
            Pratique com questões reais misturadas de Português e Matemática.
          </Text>
        </View>

        {/* Card informativo azul */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Regras do Simulado</Text>
          <View style={styles.infoList}>
            {INFO_BULLETS.map((bullet, i) => (
              <View key={i} style={styles.infoListItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoBulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filtro de Modalidade */}
        <View style={styles.sectionFiltro}>
          <Text style={styles.sectionFiltroTitle}>Escolha sua modalidade:</Text>
          <View style={styles.chipsContainer}>
            {NIVEIS.map((nivel) => {
              const isSelected = nivelSelecionado === nivel;
              return (
                <TouchableOpacity
                  key={nivel}
                  onPress={() => setNivelSelecionado(nivel)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {nivel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnGigante}
          onPress={() => setShowConfirm(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="rocket-outline" size={24} color={Colors.white} />
          <Text style={styles.btnGiganteText}>Gerar Simulado</Text>
        </TouchableOpacity>
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
    paddingTop: 10,
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
    backgroundColor: Colors.secondary,
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

  // Filtros
  sectionFiltro: {
    gap: 12,
    marginTop: 8,
  },
  sectionFiltroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flex: 1,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },

  // Botão Gigante
  btnGigante: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnGiganteText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
