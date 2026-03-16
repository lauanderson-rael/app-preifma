import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Dados mockados por enquanto
const MATERIAS = [
  {
    id: 'portugues',
    titulo: 'Português',
    descricao: 'Gramática e interpretação',
    icone: 'book-outline' as const,
    corFundo: '#DCFCE7',
    corIcone: Colors.primary,
  },
  {
    id: 'matematica',
    titulo: 'Matemática',
    descricao: 'Álgebra e geometria',
    icone: 'calculator-outline' as const,
    corFundo: '#DBEAFE',
    corIcone: '#3B82F6',
  },
];

const PROGRESSO = {
  questoesRespondidas: 12,
  taxaAcerto: 75,
  diasSeguidos: 7,
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <CustomHeader title="Início" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Olá, estudante!</Text>
            <Text style={styles.subGreeting}>
              Continue seus estudos para o IFMA
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#EA580C" />
            <Text style={styles.streakText}>{PROGRESSO.diasSeguidos} dias</Text>
          </View>
        </View>

        {/* Matérias */}
        <View style={styles.section}>
          {MATERIAS.map((materia) => (
            <TouchableOpacity
              key={materia.id}
              style={styles.materiaCard}
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: '/estudo/filtros', params: { materia: materia.id, titulo: materia.titulo } })}
            >
              <View style={[styles.materiaIconBox, { backgroundColor: materia.corFundo }]}>
                <Ionicons name={materia.icone} size={24} color={materia.corIcone} />
              </View>
              <View style={styles.materiaInfo}>
                <Text style={styles.materiaTitle}>{materia.titulo}</Text>
                <Text style={styles.materiaDesc}>{materia.descricao}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Simulado (destaque) ── */}
        <TouchableOpacity style={styles.simuladoCard} activeOpacity={0.85}>
          <View style={styles.simuladoIconBox}>
            <Ionicons name="clipboard-outline" size={28} color={Colors.white} />
          </View>
          <View style={styles.simuladoInfo}>
            <Text style={styles.simuladoTitle}>Simulado</Text>
            <Text style={styles.simuladoDesc}>Teste seus conhecimentos</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* ── Progresso de Hoje ── */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Seu Progresso Hoje</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressCard}>
              <Text style={styles.progressValue}>
                {PROGRESSO.questoesRespondidas}
              </Text>
              <Text style={styles.progressLabel}>Questões{'\n'}respondidas</Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={[styles.progressValue, styles.progressValueBlue]}>
                {PROGRESSO.taxaAcerto}%
              </Text>
              <Text style={styles.progressLabel}>Taxa de acerto</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '400',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },

  // Matérias
  section: {
    gap: 12,
  },
  materiaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  materiaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materiaInfo: {
    flex: 1,
  },
  materiaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  materiaDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Card Simulado
  simuladoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  simuladoIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simuladoInfo: {
    flex: 1,
  },
  simuladoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  simuladoDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Progresso
  progressSection: {
    gap: 12,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
  },
  progressValueBlue: {
    color: '#3B82F6',
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
});
