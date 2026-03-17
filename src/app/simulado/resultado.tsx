import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { getSimulado } from '@/data/questoes';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResultadoScreen() {
  const insets = useSafeAreaInsets();
  const { id, respostas: respostasParam } = useLocalSearchParams<{ id: string; respostas: string }>();
  const simulado = getSimulado(id ?? '1');
  const questoes = simulado?.questoes ?? [];
  const totalQuestoes = questoes.length;

  const respostas = respostasParam ? JSON.parse(respostasParam) : {};

  let acertos = 0;
  questoes.forEach((q) => {
    if (respostas[q.id] === q.gabarito) {
      acertos++;
    }
  });

  const erros = totalQuestoes - acertos;
  const aproveitamento = totalQuestoes > 0 ? Math.round((acertos / totalQuestoes) * 100) : 0;

  // Analisa a mensagem com base na taxa de acerto
  const statusBaseadoNoAproveitamento = () => {
    if (aproveitamento >= 70) {
      return {
        bg: '#DCFCE7', text: Colors.primaryDark, msg: 'Excelente trabalho! Você foi muito bem!'
      };
    } else if (aproveitamento >= 50) {
      return {
        bg: '#FEF9C3', text: '#A16207', msg: 'Bom trabalho! Mas você pode melhorar ainda mais.'
      };
    } else {
      return {
        bg: '#FEE2E2', text: '#B91C1C', msg: 'Continue estudando! Você vai conseguir!'
      };
    }
  };

  const status = statusBaseadoNoAproveitamento();

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Resultado do Simulado"
        leftContent={
          <TouchableOpacity onPress={() => router.replace('/(tabs)/simulados')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.tituloSecao}>Simulado Finalizado!</Text>
          <Text style={styles.placar}>
            {acertos}/{totalQuestoes}
          </Text>
          <Text style={styles.subtexto}>Você acertou {aproveitamento}% das questões</Text>

          <View style={[styles.alertBox, { backgroundColor: status.bg }]}>
            <Text style={[styles.alertText, { color: status.text }]}>{status.msg}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark" size={24} color={Colors.primary} />
            <Text style={[styles.statValor, { color: Colors.primary }]}>{acertos}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="close" size={24} color="#EF4444" />
            <Text style={[styles.statValor, { color: '#EF4444' }]}>{erros}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="disc-outline" size={24} color="#3B82F6" />
            <Text style={[styles.statValor, { color: '#3B82F6' }]}>{aproveitamento}%</Text>
            <Text style={styles.statLabel}>Aproveitamento</Text>
          </View>
        </View>

        {/* Dica de Desempenho */}
        <View style={styles.dicaBox}>
          <View style={styles.dicaIconCircle}>
            <Ionicons name="analytics" size={20} color={Colors.white} />
          </View>
          <View style={styles.dicaTextos}>
            <Text style={styles.dicaTitulo}>Dica de Desempenho</Text>
            <Text style={styles.dicaDescricao}>
              Foque nas matérias com mais erros e faça mais exercícios.
            </Text>
          </View>
        </View>

        {/* Revisão / Gabarito */}
        <View style={styles.linkWrapper}>
          <TouchableOpacity
            style={styles.linkGabarito}
            onPress={() => router.push({ pathname: '/simulado/gabarito', params: { id, respostas: respostasParam } })}
          >
            <Text style={styles.linkTexto}>Revisão das Questões</Text>
          </TouchableOpacity>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={styles.btnVerde}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnVerdeTexto}>Voltar para Tela Inicial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnVazado}
          onPress={() => router.replace('/(tabs)/simulados')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnVazadoTexto}>Ver Outros Simulados</Text>
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
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },

  // Main Card
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  placar: {
    fontSize: 48,
    fontWeight: '300',
    color: '#6B7280',
    letterSpacing: -1.5,
  },
  subtexto: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  alertBox: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  statValor: {
    fontSize: 24,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  // Dica Box
  dicaBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,

    marginBottom: 4,
  },
  dicaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dicaTextos: {
    flex: 1,
  },
  dicaTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  dicaDescricao: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },

  // Revisão
  linkWrapper: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  linkGabarito: {
    paddingVertical: 8,
  },
  linkTexto: {
    fontSize: 15,
    color: Colors.text,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // Botões
  btnVerde: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  btnVerdeTexto: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  btnVazado: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnVazadoTexto: {
    color: Colors.primaryDark,
    fontSize: 15,
    fontWeight: '600',
  },
});
