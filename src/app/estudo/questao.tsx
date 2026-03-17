import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Dados Mockados ─────────────────────────────────────────
const DUMMY_QUESTOES = [
  {
    id: 1,
    materia: 'portugues',
    assunto: 'Interpretação de Texto',
    enunciado: 'Leia o trecho a seguir e responda:\n\n"A educação é a arma mais poderosa que você pode usar para mudar o mundo."\n\nQual figura de linguagem está presente na frase acima?',
    alternativas: [
      { id: 'A', texto: 'Metáfora' },
      { id: 'B', texto: 'Metonímia' },
      { id: 'C', texto: 'Hipérbole' },
      { id: 'D', texto: 'Eufemismo' },
    ],
    correta: 'A',
    explicacao: {
      conceitoChave: 'Metáfora',
      oQueSaber: 'A metáfora é uma figura de linguagem que consiste em transferir a um termo o significado de outro, estabelecendo uma relação de semelhança entre eles.\n\nNo texto apresentado, a palavra "arma" não está sendo usada em seu sentido literal, mas sim como uma comparação para demonstrar poder transformador da educação. A educação é comparada a uma arma porque ambas têm poder, mas enquanto uma arma pode destruir, a educação constrói e transforma positivamente.',
      pontosImportantes: [
        'A metáfora cria uma comparação implícita',
        'Não utiliza conectivos como "tal qual" ou "assim como"',
        'Enriquece o texto com sentido figurado',
      ],
      respostaCorreta: 'Metáfora',
    }
  },
  {
    id: 2,
    materia: 'matematica',
    assunto: 'Álgebra',
    enunciado: 'Resolva a seguinte equação de primeiro grau:\n\n2x + 5 = 15\n\nQual é o valor de x?',
    alternativas: [
      { id: 'A', texto: '10' },
      { id: 'B', texto: '2.5' },
      { id: 'C', texto: '5' },
      { id: 'D', texto: '15' },
    ],
    correta: 'C',
  },
  {
    id: 3,
    materia: 'portugues',
    assunto: 'Ortografia',
    enunciado: 'Assinale a alternativa em que a palavra destacada está grafada corretamente, segundo a norma-padrão:',
    alternativas: [
      { id: 'A', texto: 'Houve uma EXCESSÃO à regra principal.' },
      { id: 'B', texto: 'O rapaz age de forma muito ESPONTÂNIA.' },
      { id: 'C', texto: 'Comprei uma nova TIGELA na feira.' },
      { id: 'D', texto: 'O PREVILÉGIO de poucos afeta muitos.' },
    ],
    correta: 'C',
  },
  {
    id: 4,
    materia: 'matematica',
    assunto: 'Porcentagem',
    enunciado: 'Uma loja ofereceu um desconto de 20% em um celular que custava R$ 1.500,00. Qual o valor final do produto?',
    alternativas: [
      { id: 'A', texto: 'R$ 1.200,00' },
      { id: 'B', texto: 'R$ 1.300,00' },
      { id: 'C', texto: 'R$ 1.150,00' },
      { id: 'D', texto: 'R$ 1.000,00' },
    ],
    correta: 'A',
  },
];

export default function QuestaoEstudoScreen() {
  const { materia, titulo } = useLocalSearchParams<{ materia: string; titulo: string }>();
  const insets = useSafeAreaInsets();

  // Filtra as questoes mockadas pra combinar com a materia. Se n tiver, usa tudo
  const dbFiltrado = DUMMY_QUESTOES.filter(q => q.materia === materia);
  const dataStore = dbFiltrado.length > 0 ? dbFiltrado : DUMMY_QUESTOES;

  const [questaoAtual, setQuestaoAtual] = useState(dataStore[0]);
  const [respondida, setRespondida] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [opcaoMarcada, setOpcaoMarcada] = useState<string | null>(null);
  const [modalIAVisible, setModalIAVisible] = useState(false);

  // Animação do Feedback
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Mocks de dados de progresso
  const totalProgresso = 100;
  const [respondidasTotais, setRespondidasTotais] = useState(10);

  const acertou = respondida && opcaoMarcada === questaoAtual.correta;

  const sortearNovaQuestao = () => {
    // Escondendo o feedback antes de trocar a questão
    Animated.timing(feedbackAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const min = 0;
      const max = dataStore.length - 1;
      let randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
      setQuestaoAtual(dataStore[randomIndex]);
      setRespondida(false);
      setOpcaoMarcada(null);
      setSelectedOptionId(null);
    });
  };

  // Fontes de áudio
  const successSource = require('../../../assets/sounds/success.mp3');
  const errorSource = require('../../../assets/sounds/error.mp3');

  const playerSuccess = useAudioPlayer(successSource);
  const playerError = useAudioPlayer(errorSource);

  const playSound = (isCorrect: boolean) => {
    try {
      if (isCorrect) {
        playerSuccess.play();
      } else {
        playerError.play();
      }
    } catch (error) {
      console.log('Erro ao tocar som:', error);
    }
  };

  const handleSelectOption = (id: string) => {
    if (respondida) return;
    setSelectedOptionId(id);
  };

  const checkAnswer = () => {
    if (!selectedOptionId || respondida) return;

    const isCorrect = selectedOptionId === questaoAtual.correta;
    setOpcaoMarcada(selectedOptionId);
    setRespondida(true);
    setRespondidasTotais(prev => prev + 1);

    // Toca o som
    playSound(isCorrect);

    // Sobe o painel de feedback
    Animated.spring(feedbackAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.safe}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      {/* HEADER VERDE */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {titulo} - {questaoAtual.assunto}
          </Text>
          <View style={styles.backBtnWrapper} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((respondidasTotais / totalProgresso) * 100, 100)}%` }
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* CARD ENUNCIADO */}
        <View style={styles.cardEnunciado}>
          <Text style={styles.enunciadoText}>{questaoAtual.enunciado}</Text>
        </View>

        {/* ALTERNATIVAS */}
        <View style={styles.alternativasContainer}>
          {questaoAtual.alternativas.map((alt) => {
            const isSelected = selectedOptionId === alt.id;
            const isMarcada = opcaoMarcada === alt.id;
            const isCorretaOficial = alt.id === questaoAtual.correta;

            // Logica de Cores Condicionais
            let borderColor = '#E5E7EB';
            let bgColor = Colors.white;
            let iconElement = null;

            if (respondida) {
              if (isCorretaOficial) {
                borderColor = Colors.primary;
                bgColor = Colors.primaryLight;
                iconElement = <Ionicons name="checkmark-circle-outline" size={24} color={Colors.primary} />;
              } else if (isMarcada && !isCorretaOficial) {
                borderColor = Colors.error;
                bgColor = '#FEF2F2';
                iconElement = <Ionicons name="close-circle-outline" size={24} color={Colors.error} />;
              }
            } else if (isSelected) {
              borderColor = Colors.primary;
              bgColor = '#F0FDF4'; // Verde muito claro
            }

            const showBottomBorder = isSelected || (respondida && (isCorretaOficial || isMarcada));

            return (
              <TouchableOpacity
                key={alt.id}
                onPress={() => handleSelectOption(alt.id)}
                activeOpacity={0.7}
                style={[
                  styles.btnAlternativa,
                  { borderColor, backgroundColor: bgColor },
                  showBottomBorder && { borderBottomWidth: 3, paddingBottom: 11 }
                ]}
              >
                <View style={styles.alternativaContent}>
                  <View style={[
                    styles.labelCirculo,
                    respondida && isCorretaOficial && styles.labelCirculoCorreto,
                    respondida && isMarcada && !isCorretaOficial && styles.labelCirculoIncorreto,
                    isSelected && !respondida && styles.labelCirculoSelected
                  ]}>
                    <Text style={[
                      styles.labelText,
                      respondida && isCorretaOficial && styles.labelTextCorreto,
                      respondida && isMarcada && !isCorretaOficial && styles.labelTextIncorreto,
                      isSelected && !respondida && styles.labelTextSelected
                    ]}>
                      {alt.id}
                    </Text>
                  </View>
                  <Text style={[
                    styles.alternativaTexto,
                    isSelected && !respondida && { color: Colors.primary, fontWeight: '700' }
                  ]}>{alt.texto}</Text>
                </View>
                {iconElement}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER FIXO COM BOTÃO "RESPONDER" */}
      {!respondida && (
        <View style={[styles.staticFooter, { paddingBottom: Math.max(24, insets.bottom + 8) }]}>
          <TouchableOpacity
            style={[styles.btnResponder, !selectedOptionId && styles.btnDisabled]}
            onPress={checkAnswer}
            disabled={!selectedOptionId}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnResponderTexto, !selectedOptionId && styles.btnDisabledTexto]}>
              RESPONDER
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View
        style={[
          styles.feedbackOverlay,
          {
            backgroundColor: acertou ? '#CCF7D9' : '#FEE2E2', // Tons um pouco mais saturados/escuros que o anterior
            paddingBottom: Math.max(34, insets.bottom + 16),
            transform: [{
              translateY: feedbackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [600, 0]
              })
            }]
          }
        ]}
      >
        <View style={styles.feedbackContent}>
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackIconText}>
              {/* <View style={[styles.feedbackIconCircle, { backgroundColor: acertou ? Colors.primary : Colors.error }]}>
                <Ionicons name={acertou ? "checkmark" : "close"} size={22} color={Colors.white} />
              </View> */}
              <Text style={[styles.feedbackTitle, { color: acertou ? Colors.primaryDark : Colors.error }]}>
                {acertou ? "Excelente!" : "Incorreto"}
              </Text>
            </View>
          </View>

          {!acertou && (
            <View style={styles.correctAnswerBox}>
              <Text style={styles.correctAnswerLabel}>Resposta correta:</Text>
              <Text style={styles.correctAnswerText}>
                {questaoAtual.alternativas.find(a => a.id === questaoAtual.correta)?.texto}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setModalIAVisible(true)}
            style={[
              styles.btnExpliqueIA,
              { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: acertou ? Colors.primary : Colors.error }
            ]}
          >
            <Ionicons name="sparkles" size={18} color={acertou ? Colors.primaryDark : Colors.error} />
            <Text style={[styles.btnExpliqueIATexto, { color: acertou ? Colors.primaryDark : Colors.error }]}>
              Explicação com IA (2 disponíveis)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnContinuar, { backgroundColor: acertou ? Colors.primary : Colors.error }]}
            onPress={sortearNovaQuestao}
            activeOpacity={0.8}
          >
            <Text style={styles.btnContinuarTexto}>CONTINUAR</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* MODAL IA */}
      <Modal visible={modalIAVisible} animationType="slide" transparent={true} onRequestClose={() => setModalIAVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="sparkles" size={24} color={Colors.white} />
                <Text style={styles.modalHeaderTitle}>Explicação com IA</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalIAVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.conceitoBox}>
                <View style={styles.conceitoTitleRow}>
                  <Ionicons name="bulb-outline" size={18} color="#9333EA" />
                  <Text style={styles.conceitoTitle}>Conceito-Chave</Text>
                </View>
                <Text style={styles.conceitoText}>{questaoAtual.explicacao?.conceitoChave ?? 'Conceito principal'}</Text>
              </View>
              <Text style={styles.topicTitle}>O que você precisa saber:</Text>
              <Text style={styles.paragraph}>{questaoAtual.explicacao?.oQueSaber ?? 'Explicação detalhada.'}</Text>
              <View style={styles.respostaCorretaBox}>
                <Text style={styles.respostaCorretaLabel}>Resposta Correta:</Text>
                <Text style={styles.respostaCorretaText}>{questaoAtual.alternativas.find(a => a.id === questaoAtual.correta)?.texto}</Text>
              </View>
              <TouchableOpacity style={styles.modalBtnEntendi} onPress={() => setModalIAVisible(false)}>
                <Text style={styles.modalBtnEntendiText}>Entendi!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60 },
  backBtnWrapper: { padding: 6, minWidth: 40 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.white },
  progressContainer: { marginTop: 4 },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 8 },
  content: { padding: 20, gap: 20, paddingBottom: 100 },
  cardEnunciado: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, elevation: 1, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  enunciadoText: { fontSize: 16, lineHeight: 24, color: '#374151', fontWeight: '600' },
  alternativasContainer: { gap: 12 },
  btnAlternativa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  alternativaContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 },
  labelCirculo: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  labelCirculoSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  labelCirculoCorreto: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  labelCirculoIncorreto: { backgroundColor: Colors.error, borderColor: Colors.error },
  labelText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  labelTextSelected: { color: Colors.white },
  labelTextCorreto: { color: Colors.white },
  labelTextIncorreto: { color: Colors.white },
  alternativaTexto: { fontSize: 15, fontWeight: '500', color: '#4B5563', flex: 1 },
  staticFooter: { padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: '#F3F4F6' },
  btnResponder: { backgroundColor: Colors.primary, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { backgroundColor: '#E5E7EB' },
  btnResponderTexto: { color: Colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  btnDisabledTexto: { color: '#9CA3AF' },
  feedbackOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 999, elevation: 20 },
  feedbackContent: { gap: 16 },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedbackIconText: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedbackIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  feedbackTitle: { fontSize: 20, fontWeight: '800' },
  btnExpliqueIA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  btnExpliqueIATexto: {
    fontSize: 15,
    fontWeight: '700',
  },
  correctAnswerBox: { backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: 12, borderRadius: 10, gap: 4 },
  correctAnswerLabel: { fontSize: 13, fontWeight: '700', color: Colors.error },
  correctAnswerText: { fontSize: 15, fontWeight: '600', color: Colors.error },
  btnContinuar: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnContinuarTexto: { color: Colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
  modalHeader: { backgroundColor: '#A855F7', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  modalCloseBtn: { position: 'absolute', top: 20, right: 20 },
  modalBody: { padding: 24 },
  conceitoBox: { backgroundColor: '#FAF5FF', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F3E8FF' },
  conceitoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  conceitoTitle: { fontSize: 14, fontWeight: '700', color: '#7E22CE' },
  conceitoText: { fontSize: 16, color: '#6B21A8', fontWeight: '600' },
  topicTitle: { fontSize: 15, color: '#4B5563', marginBottom: 12, fontWeight: '700' },
  paragraph: { fontSize: 15, color: '#374151', lineHeight: 24, marginBottom: 24 },
  respostaCorretaBox: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#0bff81ff', borderRadius: 16, padding: 20, marginBottom: 24 },
  respostaCorretaLabel: { fontSize: 13, color: '#059669', marginBottom: 4, fontWeight: '700' },
  respostaCorretaText: { fontSize: 16, fontWeight: '600', color: '#047857' },
  modalBtnEntendi: { backgroundColor: '#A855F7', height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalBtnEntendiText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

