import { examService } from '@/api/examService';
import { sessionService } from '@/api/sessionService';
import { QuestionImage } from '@/components/QuestionImage';
import { Colors } from '@/constants/Colors';
import type { AnswerResult, Question } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, BackHandler,
  Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUBJECT_LABELS: Record<string, string> = { portugues: 'Português', matematica: 'Matemática' };

export default function SimuladoProvaScreen() {
  const params = useLocalSearchParams<{
    sessionId: string; questionIds: string; titulo: string; tempoLimite: string;
  }>();
  const insets = useSafeAreaInsets();
  const sessionId = Number(params.sessionId);
  const titulo = params.titulo ?? 'Simulado';
  const questionIds = useMemo(
    () => (params.questionIds ? params.questionIds.split(',').map(Number).filter(Boolean) : []),
    [params.questionIds],
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> altId
  const [finishing, setFinishing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Number(params.tempoLimite) || 10800);
  const startTime = useRef(Date.now());

  // Load questions
  useEffect(() => {
    (async () => {
      try {
        const loaded: Question[] = [];
        for (const id of questionIds) {
          try { loaded.push(await examService.getQuestion(id)); } catch { }
        }
        if (loaded.length === 0) {
          Alert.alert('Erro', 'Não foi possível carregar as questões.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }
        setQuestions(loaded);
      } finally { setLoading(false); }
    })();
  }, [questionIds]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSelect = (altId: number) => {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: altId }));
  };

  const handleFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      // Submit all answers to API
      const results: Record<number, AnswerResult> = {};
      for (const q of questions) {
        const altId = answers[q.id];
        if (altId) {
          try {
            const r = await sessionService.submitAnswer(sessionId, {
              question_id: q.id, alternative_id: altId, response_time: 0,
            });
            results[q.id] = r;
          } catch { }
        }
      }

      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      const sessionResult = await sessionService.finishSession(sessionId, { duration_seconds: duration });

      // Navigate to resultado with review data
      const reviewData = JSON.stringify({
        questions, userAnswers: answers, results,
      });

      router.replace({
        pathname: '/simulado/resultado',
        params: {
          acertos: String(sessionResult.correct_answers ?? 0),
          total: String(sessionResult.total_questions ?? 0),
          xp: String(sessionResult.xp_earned ?? (sessionResult as any).xp_gained ?? 0),
          duracao: String(sessionResult.duration_seconds ?? (sessionResult as any).duration ?? duration),
          reviewData,
        },
      });
    } catch {
      Alert.alert('Erro', 'Falha ao finalizar o simulado.');
      setFinishing(false);
    }
  };

  const confirmFinish = () => {
    const respondidas = Object.keys(answers).length;
    if (respondidas < questions.length) {
      Alert.alert('Atenção', `Você ainda não respondeu todas as questões (${respondidas}/${questions.length}). Responda todas para finalizar.`);
      return;
    }
    Alert.alert(
      'Finalizar Simulado',
      'Tem certeza que deseja finalizar? Suas respostas serão enviadas.',
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Finalizar', onPress: handleFinish }],
    );
  };

  const handleBack = () => {
    Alert.alert('Sair do simulado', 'Seu progresso será perdido. Deseja sair?', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  // Intercepta botão físico de voltar (Android)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true; // Impede a navegação padrão
    });
    return () => sub.remove();
  }, []);

  if (loading || finishing) {
    return (
      <View style={[styles.safe, styles.centered, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {finishing ? 'Finalizando simulado...' : 'Carregando questões...'}
        </Text>
      </View>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;
  const selectedAlt = answers[q.id] ?? null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= questions.length - 1;
  const timerDanger = timeLeft < 600;
  const allAnswered = Object.keys(answers).length >= questions.length;

  return (
    <View style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{titulo}</Text>
          <View style={[styles.timerBadge, timerDanger && styles.timerDanger]}>
            <Ionicons name="time-outline" size={14} color="#FFF" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {SUBJECT_LABELS[q.subject] ?? q.subject} • Questão {currentIndex + 1} de {questions.length}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` as any }]} />
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Attachments */}
        {q.attachments?.map(a => {
          if (a.type === 'text') return (
            <View key={a.id} style={styles.attachmentBox}>
              {!!a.label && <View style={styles.attachLabel}><Text style={styles.attachLabelText}>{a.label}</Text></View>}
              <Text style={styles.attachText}>{a.content}</Text>
            </View>
          );
          if (a.type === 'image' && a.file) {
            const base = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
            return (
              <View key={a.id} style={styles.imageBox}>
                {!!a.label &&
                  <View style={[styles.attachLabel, { margin: 16 }]}>
                    <Text style={styles.attachLabelText}>{a.label}</Text>
                  </View>}
                <QuestionImage uri={`${base}${a.file}`} style={styles.attachImage} resizeMode="contain" />
              </View>
            );
          }
          return null;
        })}

        {/* Statement */}
        <View>
          <Text style={styles.enunciadoText}>{q.statement}</Text>
        </View>

        {/* Alternatives */}
        <View style={{ gap: 10 }}>
          {q.alternatives.map(alt => {
            const selected = selectedAlt === alt.id;
            return (
              <TouchableOpacity
                key={alt.id}
                onPress={() => handleSelect(alt.id)}
                activeOpacity={0.7}
                style={[styles.altBtn, selected && styles.altSelected]}
              >
                <View style={[styles.altCircle, selected && styles.altCircleSelected]}>
                  <Text style={[styles.altLetter, selected && styles.altLetterSelected]}>{alt.letter}</Text>
                </View>
                <Text style={[styles.altText, selected && { color: Colors.primaryDark, fontWeight: '700' }]}>
                  {alt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
            onPress={() => !isFirst && setCurrentIndex(i => i - 1)}
            disabled={isFirst}
          >
            <Ionicons name="chevron-back" size={18} color={isFirst ? '#9CA3AF' : Colors.text} />
            <Text style={[styles.navBtnText, isFirst && { color: '#9CA3AF' }]}>Anterior</Text>
          </TouchableOpacity>

          <Text style={styles.navIndicator}>{currentIndex + 1}/{questions.length}</Text>

          {isLast ? (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnFinish, !allAnswered && styles.navBtnDisabled]} onPress={confirmFinish}>
              <Text style={styles.navFinishText}>Finalizar</Text>
              <Ionicons name="checkmark-done" size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnNext]}
              onPress={() => setCurrentIndex(i => i + 1)}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Próxima</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Finalizar sempre visível */}
        {!isLast && (
          <TouchableOpacity style={[styles.finishBtn, !allAnswered && { opacity: 0.5 }]} onPress={confirmFinish} activeOpacity={0.8}>
            <Ionicons name="flag" size={18} color="#FFF" />
            <Text style={styles.finishBtnText}>{allAnswered ? 'Finalizar Prova' : `Faltam ${questions.length - Object.keys(answers).length} questões`}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: Colors.textSecondary },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingBottom: 14, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56 },
  backBtn: { padding: 6 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#FFF', marginHorizontal: 12 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timerDanger: { backgroundColor: '#EF4444' },
  timerText: { fontSize: 13, fontWeight: '800', color: '#FFF', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  metaRow: { alignItems: 'center', marginBottom: 8 },
  metaText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 6 },
  content: { padding: 20, gap: 16, paddingBottom: 20 },
  attachmentBox: { backgroundColor: '#F8FAFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E0E7FF' },
  attachLabel: { alignSelf: 'flex-start', marginBottom: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: '#E0E7FF' },
  attachLabelText: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  attachText: { fontSize: 14, lineHeight: 22, color: '#374151' },
  imageBox: { backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  attachImage: { width: '100%', height: 220 },

  enunciadoText: { fontSize: 15, lineHeight: 24, color: Colors.text, fontWeight: '600' },
  altBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14, gap: 12, borderWidth: 1.5, borderColor: '#E5E7EB', elevation: 1 },
  altSelected: { borderColor: Colors.primary, backgroundColor: '#F0FDF4' },
  altCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  altCircleSelected: { backgroundColor: Colors.primary },
  altLetter: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  altLetterSelected: { color: '#FFF' },
  altText: { flex: 1, fontSize: 14, lineHeight: 21, color: Colors.text },
  footer: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', elevation: 8 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  navBtnNext: { backgroundColor: '#374151' },
  navBtnFinish: { backgroundColor: Colors.primary },
  navFinishText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  navIndicator: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  finishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, height: 44 },
  finishBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
