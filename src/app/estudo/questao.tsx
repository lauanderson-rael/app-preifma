import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

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
  const [opcaoMarcada, setOpcaoMarcada] = useState<string | null>(null);
  const [modalIAVisible, setModalIAVisible] = useState(false);
  
  // Mocks de dados de progresso
  const totalProgresso = 100; // fingindo q é 100 questoes pra barra de progresso encher as cegas
  const [respondidasTotais, setRespondidasTotais] = useState(10);
  
  const acertou = respondida && opcaoMarcada === questaoAtual.correta;

  const sortearNovaQuestao = () => {
    const min = 0;
    const max = dataStore.length - 1;
    let randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    setQuestaoAtual(dataStore[randomIndex]);
    setRespondida(false);
    setOpcaoMarcada(null);
  };

  const handleResponder = (idMarcado: string) => {
    if (respondida) return;
    setOpcaoMarcada(idMarcado);
    setRespondida(true);
    setRespondidasTotais(prev => prev + 1);
  };

  return (
    <View style={styles.safe}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      {/* HEADER VERDE (Semelhante ao CustomHeader mas com layout especifico e progressbar nativo) */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {titulo} - {questaoAtual.assunto}
          </Text>
          <View style={styles.backBtnWrapper} /* Spacer para centralizar titulo */ />
        </View>
        
        {/* Progress Bar Verde Claro */}
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
            const isMarcada = opcaoMarcada === alt.id;
            const isCorretaOficial = alt.id === questaoAtual.correta;
            
            // Logica de Cores Condicionais
            let borderColor = '#E5E7EB';
            let bgColor = Colors.white;
            let iconElement = null;

            if (respondida) {
              if (isCorretaOficial) {
                // Alternativa correta da questão sempre fica verde quando revelada
                borderColor = '#22C55E';
                bgColor = '#DCFCE7';
                iconElement = <Ionicons name="checkmark-circle-outline" size={24} color="#16A34A" />;
              } else if (isMarcada && !isCorretaOficial) {
                // Alternativa que o usuario marcou e errou fica vermelha
                borderColor = '#EF4444';
                bgColor = '#FEE2E2';
                iconElement = <Ionicons name="close-circle-outline" size={24} color="#DC2626" />;
              }
            } else if (isMarcada) {
              // Quando não está finalizado ainda, mas marca opcional (se fosse modelo prova). 
              // Mas aqui a reposta é automatica no clique como no DuoLingo.
            }

            return (
              <TouchableOpacity
                key={alt.id}
                onPress={() => handleResponder(alt.id)}
                activeOpacity={0.7}
                style={[
                  styles.btnAlternativa,
                  { borderColor, backgroundColor: bgColor }
                ]}
              >
                <Text style={styles.alternativaTexto}>{alt.texto}</Text>
                {iconElement}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* FEEDBACK BOTTOM (Só aparece se já foi respondida hoje) */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(24, insets.bottom + 8) }]}>
        {respondida && (
          <View style={[styles.alertFeedback, acertou ? styles.alertCorreto : styles.alertIncorreto]}>
            <View style={styles.alertHeaderRow}>
              <Ionicons 
                name={acertou ? "checkmark-circle" : "close-circle"} 
                size={22} 
                color={acertou ? "#16A34A" : "#DC2626"} 
              />
              <Text style={[styles.alertTitle, acertou ? styles.alertTitleCorreto : styles.alertTitleIncorreto]}>
                {acertou ? "Resposta Correta" : "Resposta Incorreta"}
              </Text>
            </View>
            <Text style={[styles.alertSubtitle, acertou ? styles.alertSubtitleCorreto : styles.alertSubtitleIncorreto]}>
              {acertou ? "Muito bem, continue assim!" : "Não desanime, você está aprendendo"}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.btnExplicaIA, !respondida && styles.btnExplicaIADisabled]} 
          activeOpacity={0.8}
          disabled={!respondida}
          onPress={() => setModalIAVisible(true)}
        >
          <Ionicons name="sparkles" size={18} color={!respondida ? '#9CA3AF' : Colors.white} />
          <Text style={[styles.btnExplicaIATexto, !respondida && styles.btnExplicaIATextoDisabled]}>
            Explicação com IA (2 disponíveis)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnProxima, !respondida && styles.btnProximaDisabled]} 
          onPress={sortearNovaQuestao}
          activeOpacity={0.8}
          disabled={!respondida}
        >
          <Text style={[styles.btnProximaTexto, !respondida && styles.btnProximaTextoDisabled]}>
            Próxima Questão
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL IA */}
      <Modal
        visible={modalIAVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalIAVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="sparkles" size={24} color={Colors.white} />
                <Text style={styles.modalHeaderTitle}>Explicação com IA</Text>
              </View>
              <Text style={styles.modalHeaderSubtitle}>Entenda o conceito por trás da questão</Text>
              
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalIAVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Conceito Chave */}
              <View style={styles.conceitoBox}>
                <View style={styles.conceitoTitleRow}>
                  <Ionicons name="bulb-outline" size={18} color="#9333EA" />
                  <Text style={styles.conceitoTitle}>Conceito-Chave</Text>
                </View>
                <Text style={styles.conceitoText}>{questaoAtual.explicacao?.conceitoChave ?? 'Conceito principal'}</Text>
              </View>

              <Text style={styles.topicTitle}>O que você precisa saber:</Text>
              <Text style={styles.paragraph}>
                {questaoAtual.explicacao?.oQueSaber ?? 'Aqui estaria a explicação gerada pela inteligência artificial com base na matéria selecionada ajudando a entender o porquê da resposta exata.'}
              </Text>

              <Text style={styles.topicTitle}>Pontos Importantes:</Text>
              <View style={styles.pontosList}>
                {(questaoAtual.explicacao?.pontosImportantes ?? ['Ponto 1', 'Ponto 2', 'Ponto 3']).map((ponto, idx) => (
                  <View key={idx} style={styles.pontoRow}>
                    <View style={styles.pontoNumberCircle}>
                      <Text style={styles.pontoNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.pontoText}>{ponto}</Text>
                  </View>
                ))}
              </View>

              {/* Box de Resposta Correta */}
              <View style={styles.respostaCorretaBox}>
                <Text style={styles.respostaCorretaLabel}>Resposta Correta:</Text>
                <Text style={styles.respostaCorretaText}>
                  {questaoAtual.explicacao?.respostaCorreta ?? 'Gabarito da Questão'}
                </Text>
              </View>

            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
              <TouchableOpacity 
                style={styles.modalBtnEntendi}
                onPress={() => setModalIAVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnEntendiText}>Entendi!</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // -- Header Novo --
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  backBtnWrapper: {
    padding: 6,
    marginLeft: -6,
    minWidth: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  
  // -- Progress --
  progressContainer: {
    marginTop: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 8,
  },

  // -- Content --
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  cardEnunciado: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  enunciadoText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    fontWeight: '500',
  },

  // -- Alternativas --
  alternativasContainer: {
    gap: 12,
  },
  btnAlternativa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  alternativaTexto: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    flex: 1,
    paddingRight: 12,
  },

  // -- Footer Area --
  footerContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#F9FAFB',
  },

  // Alerts Feedback
  alertFeedback: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  alertCorreto: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  alertIncorreto: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  alertTitleCorreto: { color: '#16A34A' },
  alertTitleIncorreto: { color: '#DC2626' },
  
  alertSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  alertSubtitleCorreto: { color: '#15803D' },
  alertSubtitleIncorreto: { color: '#991B1B' },

  btnExplicaIA: {
    backgroundColor: '#A855F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  btnExplicaIADisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
  },
  btnExplicaIATexto: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  btnExplicaIATextoDisabled: {
    color: '#9CA3AF',
  },

  // Progess Button
  btnProxima: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnProximaDisabled: {
    backgroundColor: '#D1D5DB', // Cinza Ghost
    shadowOpacity: 0,
    elevation: 0,
  },
  btnProximaTexto: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  btnProximaTextoDisabled: {
    color: '#9CA3AF',
  },

  // Modal IA
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#A855F7',
    padding: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  modalHeaderSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    fontSize: 14,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 24,
  },
  conceitoBox: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  conceitoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  conceitoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7E22CE',
  },
  conceitoText: {
    fontSize: 16,
    color: '#6B21A8',
    fontWeight: '500',
    marginLeft: 26, // alinhar
  },
  topicTitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  pontosList: {
    gap: 16,
    marginBottom: 24,
  },
  pontoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pontoNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pontoNumberText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  pontoText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  respostaCorretaBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  respostaCorretaLabel: {
    fontSize: 14,
    color: '#16A34A',
    marginBottom: 8,
  },
  respostaCorretaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: Colors.white,
  },
  modalBtnEntendi: {
    backgroundColor: '#A855F7',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnEntendiText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
