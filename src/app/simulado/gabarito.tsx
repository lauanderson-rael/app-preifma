import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import type { AnswerResult, Question } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReviewData {
  questions: Question[];
  userAnswers: Record<number, number>;
  results: Record<number, AnswerResult>;
}

export default function GabaritoScreen() {
  const { reviewData: raw } = useLocalSearchParams<{ reviewData: string }>();

  let data: ReviewData = { questions: [], userAnswers: {}, results: {} };
  try { data = JSON.parse(raw ?? '{}'); } catch { }

  const { questions, userAnswers, results } = data;

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.safe}>
        <CustomHeader
          title="Gabarito"
          leftContent={
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          }
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum dado de revisão disponível.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Gabarito"
        leftContent={
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {questions.map((q, i) => {
          const result = results[q.id];
          const userAltId = userAnswers[q.id];
          const userAlt = q.alternatives.find(a => a.id === userAltId);
          const correctLetter = result?.correct_letter;
          const isCorrect = result?.is_correct;
          const notAnswered = !userAltId;

          return (
            <View key={q.id} style={styles.questionCard}>
              {/* Header */}
              <View style={styles.qHeader}>
                <View style={[styles.qBadge, isCorrect ? styles.qBadgeCorrect : notAnswered ? styles.qBadgeSkipped : styles.qBadgeWrong]}>
                  <Text style={styles.qBadgeText}>
                    {isCorrect ? '✓' : notAnswered ? '—' : '✗'}
                  </Text>
                </View>
                <Text style={styles.qNumber}>Questão {i + 1}</Text>
                <Text style={styles.qSubject}>
                  {q.subject === 'portugues' ? 'Português' : 'Matemática'}
                </Text>
              </View>

              {/* Statement (truncated) */}
              <Text style={styles.qStatement} numberOfLines={3}>{q.statement}</Text>

              {/* Alternatives */}
              <View style={styles.altList}>
                {q.alternatives.map(alt => {
                  const isUserChoice = alt.id === userAltId;
                  const isCorrectAlt = alt.letter === correctLetter;
                  let bg = '#FFF';
                  let border = '#E5E7EB';
                  let icon = null;

                  if (isCorrectAlt) {
                    bg = '#DCFCE7';
                    border = '#22C55E';
                    icon = <Ionicons name="checkmark-circle" size={18} color="#22C55E" />;
                  } else if (isUserChoice && !isCorrect) {
                    bg = '#FEE2E2';
                    border = '#EF4444';
                    icon = <Ionicons name="close-circle" size={18} color="#EF4444" />;
                  }

                  return (
                    <View key={alt.id} style={[styles.altItem, { backgroundColor: bg, borderColor: border }]}>
                      <Text style={styles.altItemLetter}>{alt.letter})</Text>
                      <Text style={styles.altItemText}>{alt.text}</Text>
                      {icon}
                    </View>
                  );
                })}
              </View>

              {notAnswered && (
                <Text style={styles.skippedLabel}>Não respondida</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  questionCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qBadgeCorrect: { backgroundColor: '#DCFCE7' },
  qBadgeWrong: { backgroundColor: '#FEE2E2' },
  qBadgeSkipped: { backgroundColor: '#F3F4F6' },
  qBadgeText: { fontSize: 14, fontWeight: '800' },
  qNumber: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1 },
  qSubject: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  qStatement: { fontSize: 13, lineHeight: 20, color: '#6B7280' },
  altList: { gap: 6 },
  altItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  altItemLetter: { fontSize: 13, fontWeight: '700', color: '#374151', width: 22 },
  altItemText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#374151' },
  skippedLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', fontStyle: 'italic' },
});
