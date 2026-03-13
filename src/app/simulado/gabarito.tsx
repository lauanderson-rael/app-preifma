import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { getSimulado } from '@/data/questoes';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GabaritoScreen() {
  const { id, respostas: respostasParam } = useLocalSearchParams<{ id: string; respostas: string }>();
  const simulado = getSimulado(id ?? '1');
  const questoes = simulado?.questoes ?? [];
  
  const respostas = respostasParam ? JSON.parse(respostasParam) : {};

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Revisão das Questões"
        leftContent={
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {questoes.map((q, index) => {
          const resp = respostas[q.id];
          const acertou = resp === q.gabarito;
          const naoRespondida = !resp;
          
          return (
            <View key={q.id} style={styles.questaoCard}>
              <View style={styles.headerQuestao}>
                <Text style={styles.tituloQuestao}>Questão {index + 1} ({q.materia})</Text>
                
                {naoRespondida ? (
                  <Ionicons name="help-circle" size={24} color={Colors.textMuted} />
                ) : (
                  <Ionicons 
                    name={acertou ? 'checkmark-circle' : 'close-circle'} 
                    size={24} 
                    color={acertou ? Colors.primaryDark : '#EF4444'} 
                  />
                )}
              </View>
              
              <Text style={styles.enunciado}>{q.enunciado}</Text>
              
              <View style={styles.alternativasContainer}>
                {q.alternativas.map((alt) => {
                  let bgColor = '#fff';
                  let borderColor = '#E5E7EB';
                  
                  // Se for o gabarito correto
                  if (alt.letra === q.gabarito) {
                    bgColor = Colors.primaryLight;
                    borderColor = Colors.primary;
                  } 
                  // Se for a opção marcada pelo usuário de forma incorreta
                  else if (alt.letra === resp && !acertou) {
                    bgColor = '#FEE2E2'; // Vermelho claro
                    borderColor = '#EF4444'; // Vermelho
                  }

                  return (
                    <View key={alt.letra} style={[styles.alternativa, { backgroundColor: bgColor, borderColor }]}>
                      <Text style={styles.alternativaTexto}>
                        <Text style={{ fontWeight: 'bold' }}>{alt.letra}) </Text>
                        {alt.texto}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
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
    gap: 20,
    paddingBottom: 40,
  },

  // Card
  questaoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    gap: 14,
  },
  headerQuestao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  tituloQuestao: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  enunciado: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: '500',
    marginTop: 4,
  },

  // Alternativas
  alternativasContainer: {
    gap: 10,
    marginTop: 6,
  },
  alternativa: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  alternativaTexto: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
});
