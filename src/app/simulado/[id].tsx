import { Colors } from '@/constants/Colors';
import { getSimulado, Questao } from '@/data/questoes';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomHeader } from '@/components/CustomHeader';

// ── Utilitário: formatar segundos em HH:MM:SS ──────────────
function formatarTempo(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

// ── Subcomponente: Alternativa ─────────────────────────────
interface AlternativaItemProps {
  letra: string;
  texto: string;
  selecionado: boolean;
  onPress: () => void;
}

function AlternativaItem({ letra, texto, selecionado, onPress }: AlternativaItemProps) {
  return (
    <TouchableOpacity
      style={[styles.alternativa, selecionado && styles.alternativaSelecionada]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.radio, selecionado && styles.radioSelecionado]}>
        {selecionado && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.alternativaTexto, selecionado && styles.alternativaTextoSelecionado]}>
        {letra}) {texto}
      </Text>
    </TouchableOpacity>
  );
}

// ── Tela principal ─────────────────────────────────────────
export default function SimuladoScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const simulado = getSimulado(id ?? '1');
  const questoes: Questao[] = simulado?.questoes ?? [];
  const totalQuestoes = questoes.length;

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [tempoRestante, setTempoRestante] = useState(
    simulado?.duracaoSegundos ?? 7200
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer countdown ────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          Alert.alert('Tempo esgotado!', 'O tempo do simulado acabou.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const questaoAtual = questoes[indiceAtual];
  const respostaAtual = respostaAtual_fn();

  function respostaAtual_fn() {
    return respostas[questaoAtual?.id] ?? null;
  }

  // ── Selecionar alternativa ─────────────────────────────
  const selecionarAlternativa = useCallback(
    (letra: string) => {
      setRespostas((prev) => ({ ...prev, [questaoAtual.id]: letra }));
    },
    [questaoAtual]
  );

  // ── Finalizar prova ────────────────────────────────────
  const handleFinalizarProva = () => {
    clearInterval(timerRef.current!);
    Alert.alert('Prova finalizada!', 'Calculando seus resultados...', [
      {
        text: 'Ver Resultados',
        onPress: () =>
          router.replace({
            pathname: '/simulado/resultado',
            params: { id, respostas: JSON.stringify(respostas) },
          }),
      },
    ]);
  };

  // ── Navegar entre questões ─────────────────────────────
  const irParaQuestao = (novoIndice: number) => {
    if (novoIndice < 0 || novoIndice >= totalQuestoes) return;
    setIndiceAtual(novoIndice);
  };

  // ── Voltar com confirmação ─────────────────────────────
  const handleVoltar = () => {
    Alert.alert(
      'Sair do simulado',
      'Seu progresso será perdido. Deseja sair?',
      [
        { text: 'Continuar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            clearInterval(timerRef.current!);
            router.back();
          },
        },
      ]
    );
  };

  // ── Cor do timer (vira vermelho quando < 5 min) ────────
  const tempoPerigoso = tempoRestante < 300;

  if (!questaoAtual) {
    return (
      <View style={styles.safe}>
        <CustomHeader
          title="Erro"
          leftContent={
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
          }
        />
        <View style={styles.erroContainer}>
          <Text style={styles.erroTexto}>Simulado não encontrado.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.erroLink}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const questaoSelecionada = respostas[questaoAtual.id] ?? null;
  const todasRespondidas = Object.keys(respostas).length === totalQuestoes;

  return (
    <View style={styles.safe}>
      {/* ── Header Customizado ── */}
      <CustomHeader
        title={`Questão ${String(indiceAtual + 1).padStart(3, '0')}`}
        leftContent={
          <TouchableOpacity onPress={handleVoltar} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
        rightContent={
          <View style={[styles.timerBadge, tempoPerigoso && styles.timerBadgePerigo]}>
            <Ionicons name="time-outline" size={13} color={Colors.white} />
            <Text style={styles.timerText}>{formatarTempo(tempoRestante)}</Text>
          </View>
        }
      />

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          {simulado?.subtitulo} ({questaoAtual.materia})
        </Text>
      </View>

      {/* ── Conteúdo ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Enunciado */}
        <View style={styles.enunciadoCard}>
          <Text style={styles.enunciadoTexto}>{questaoAtual.enunciado}</Text>
        </View>

        {/* Alternativas */}
        <View style={styles.alternativasContainer}>
          {questaoAtual.alternativas.map((alt) => (
            <AlternativaItem
              key={alt.letra}
              letra={alt.letra}
              texto={alt.texto}
              selecionado={questaoSelecionada === alt.letra}
              onPress={() => selecionarAlternativa(alt.letra)}
            />
          ))}
        </View>
      </ScrollView>

      {/* ── Footer fixo ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
        {/* Botão Finalizar Prova */}
        <TouchableOpacity
          style={[
            styles.responderBtn,
            !todasRespondidas && styles.responderBtnDisabled,
          ]}
          onPress={handleFinalizarProva}
          disabled={!todasRespondidas}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.responderBtnText,
              !todasRespondidas && styles.responderBtnTextDisabled,
            ]}
          >
            Finalizar prova
          </Text>
        </TouchableOpacity>

        {/* Navegação Anterior / Indicador / Próxima */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, indiceAtual === 0 && styles.navBtnDisabled]}
            onPress={() => irParaQuestao(indiceAtual - 1)}
            disabled={indiceAtual === 0}
          >
            <Text style={[styles.navBtnText, indiceAtual === 0 && styles.navBtnTextDisabled]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <Text style={styles.indicador}>
            {indiceAtual + 1} de {totalQuestoes}
          </Text>

          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnProximo,
              indiceAtual === totalQuestoes - 1 && styles.navBtnDisabled,
            ]}
            onPress={() => irParaQuestao(indiceAtual + 1)}
            disabled={indiceAtual === totalQuestoes - 1}
          >
            <Text
              style={[
                styles.navBtnText,
                styles.navBtnTextProximo,
                indiceAtual === totalQuestoes - 1 && styles.navBtnTextDisabled,
              ]}
            >
              Próxima
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timerBadgePerigo: {
    backgroundColor: '#B91C1C',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },

  // Sub-header
  subHeader: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  subHeaderText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  // Conteúdo
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 8,
  },

  // Enunciado
  enunciadoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  enunciadoTexto: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    fontWeight: '500',
  },

  // Alternativas
  alternativasContainer: {
    gap: 10,
  },
  alternativa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  alternativaSelecionada: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelecionado: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  alternativaTexto: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  alternativaTextoSelecionado: {
    fontWeight: '600',
    color: Colors.primaryDark,
  },

  // Footer
  footer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  responderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  responderBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  responderBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  responderBtnTextDisabled: {
    color: '#9CA3AF',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  navBtnProximo: {
    backgroundColor: '#374151',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  navBtnTextProximo: {
    color: Colors.white,
  },
  navBtnTextDisabled: {
    color: '#9CA3AF',
  },
  indicador: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Erro
  erroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  erroTexto: {
    fontSize: 16,
    color: Colors.text,
  },
  erroLink: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
});
