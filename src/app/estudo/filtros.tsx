import { examService } from '@/api/examService';
import { sessionService } from '@/api/sessionService';
import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NIVEIS = ['Integrado', 'Subsequente', 'Concomitante'];
const MATERIAS = [
  { id: 'portugues', label: 'Português' },
  { id: 'matematica', label: 'Matemática' },
];

export default function FiltrosScreen() {
  const { materia, titulo } = useLocalSearchParams<{ materia: string; titulo: string }>();
  const insets = useSafeAreaInsets();

  const [niveisSelecionados, setNiveisSelecionados] = useState<string[]>(['Integrado']);
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<string[]>(materia ? [materia] : ['portugues']);
  const [quantidade, setQuantidade] = useState<number>(10);
  const [isOutro, setIsOutro] = useState(false);
  const [customQuantidade, setCustomQuantidade] = useState('20');
  const [loading, setLoading] = useState(false);

  const toggleNivel = (nivel: string) => {
    setNiveisSelecionados(prev => {
      if (prev.includes(nivel)) {
        if (prev.length === 1) return prev; // Manter pelo menos um
        return prev.filter(n => n !== nivel);
      }
      return [...prev, nivel];
    });
  };

  const toggleMateria = (id: string) => {
    setMateriasSelecionadas(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Manter pelo menos um
        return prev.filter(m => m !== id);
      }
      return [...prev, id];
    });
  };


  const handleIniciar = async () => {
    setLoading(true);
    try {
      // 1. Buscar questões aleatórias com os filtros
      const subjectParam = materiasSelecionadas.join(',');
      const examTypeParam = niveisSelecionados.map(n => n.toLowerCase()).join(',');
      const finalCount = isOutro ? parseInt(customQuantidade || '1') : quantidade;

      if (isOutro && (isNaN(finalCount) || finalCount < 1 || finalCount > 50)) {
        Alert.alert('Valor inválido', 'Por favor, insira uma quantidade entre 1 e 50.');
        setLoading(false);
        return;
      }

      const questions = await examService.getRandomQuestions({
        count: finalCount,
        subject: subjectParam as any,
        exam_type: examTypeParam,
      });

      if (!questions || questions.length === 0) {
        Alert.alert('Sem questões', 'Não encontramos questões com esses filtros. Tente mudar a modalidade ou matéria.');
        return;
      }

      const questionIds = questions.map(q => q.id);

      // 2. Iniciar a sessão
      const session = await sessionService.startSession({
        type: 'practice',
        question_ids: questionIds
      });

      // 3. Ir para a tela de questões
      router.push({
        pathname: '/estudo/questao',
        params: {
          sessionId: String(session.id),
          sessionType: 'practice',
          questionIds: questionIds.join(','),
          materia: subjectParam,
          titulo: materiasSelecionadas.length > 1 
            ? 'Múltiplas Matérias' 
            : (MATERIAS.find(m => m.id === materiasSelecionadas[0])?.label ?? 'Treino Livre'),
          nivel: niveisSelecionados.join(', '),
        }
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Ocorreu um erro ao preparar sua sessão de estudos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <CustomHeader
          title={`Estudar ${titulo}`}
          leftContent={
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
          }
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerTitleContainer}>
              <Text style={styles.titleInfo}>Personalize seu estudo</Text>
              <Text style={styles.subtitleInfo}>Questões aleatórias filtradas do jeitinho que você precisa.</Text>
            </View>

            {/* Categoria: modalidade */}
            <View style={styles.sectionStore}>
              <View style={styles.sectionHeader}>
                <Ionicons name="school-outline" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Modalidade</Text>
              </View>

              <View style={styles.chipsContainer}>
                {NIVEIS.map((nivel) => {
                  const isSelected = niveisSelecionados.includes(nivel);
                  return (
                    <TouchableOpacity
                      key={nivel}
                      onPress={() => toggleNivel(nivel)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isSelected ? "checkbox" : "square-outline"} 
                        size={18} 
                        color={isSelected ? Colors.primary : Colors.textMuted} 
                      />
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {nivel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Categoria: Matéria */}
            <View style={styles.sectionStore}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Matéria</Text>
              </View>
              <View style={styles.chipsContainer}>
                {MATERIAS.map((item) => {
                  const isSelected = materiasSelecionadas.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleMateria(item.id)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isSelected ? "checkbox" : "square-outline"} 
                        size={18} 
                        color={isSelected ? Colors.primary : Colors.textMuted} 
                      />
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Categoria: Quantidade */}
            <View style={styles.sectionStore}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list-outline" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Quantidade de Questões</Text>
              </View>
              <View style={styles.chipsContainer}>
                {[5, 10, 15].map((num) => {
                  const isSelected = !isOutro && quantidade === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      onPress={() => {
                        setIsOutro(false);
                        setQuantidade(num);
                        Keyboard.dismiss();
                      }}
                      style={[styles.chip, isSelected && styles.chipSelected, { flex: 1, minWidth: 0 }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected, { textAlign: 'center' }]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                
                {!isOutro ? (
                  <TouchableOpacity
                    onPress={() => setIsOutro(true)}
                    style={[styles.chip, { flex: 1.5, minWidth: 0 }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, { textAlign: 'center' }]}>
                      Outro
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.inlineInputWrapper}>
                    <TextInput
                      style={styles.inlineInput}
                      value={customQuantidade}
                      onChangeText={setCustomQuantidade}
                      keyboardType="number-pad"
                      placeholder="?"
                      maxLength={2}
                      autoFocus={true}
                    />
                    <TouchableOpacity 
                      onPress={() => setIsOutro(false)}
                      style={styles.inlineInputClose}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              {isOutro && (
                <Text style={styles.customInputHintCompact}>Mínimo 1, máximo 50 questões.</Text>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* FOOTER BOTÃO START */}
        <View style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 8) }]}>
          <TouchableOpacity 
            style={[styles.btnIniciar, loading && styles.btnDisabled]} 
            onPress={handleIniciar} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="play" size={20} color={Colors.white} />
                <Text style={styles.btnIniciarTexto}>Iniciar Estudo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: 24,
    gap: 24,
    paddingBottom: 40,
  },
  headerTitleContainer: {
    marginBottom: 8,
  },
  titleInfo: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitleInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },

  // Sections
  sectionStore: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primaryDark,
  },

  // Footer Button
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  btnIniciar: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnIniciarTexto: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },

  // Custom Input
  customInputContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    width: 80,
    height: 48,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  customInputSuffix: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  customInputHint: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Inline Input
  inlineInputWrapper: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 8,
  },
  inlineInput: {
    flex: 1,
    height: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  inlineInputClose: {
    padding: 4,
  },
  customInputHintCompact: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'right',
  }
});
