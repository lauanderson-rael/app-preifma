import { examService } from "@/api/examService";
import { sessionService } from "@/api/sessionService";
import { Colors } from "@/constants/Colors";
import type { AnswerResult, Question } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuestaoEstudoScreen() {
  const params = useLocalSearchParams<{
    sessionId: string;
    sessionType: string;
    questionIds: string;
    materia: string;
    titulo: string;
  }>();
  const insets = useSafeAreaInsets();

  // Session data from params
  const sessionId = params.sessionId ? Number(params.sessionId) : null;
  const sessionType = (params.sessionType as any) ?? "quick";
  const titulo = params.titulo ?? "Estudo";
  const questionIds = useMemo(
    () =>
      params.questionIds
        ? params.questionIds.split(",").map(Number).filter(Boolean)
        : [],
    [params.questionIds],
  );

  // Questions state (loaded from API on mount)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answer state
  const [selectedAltId, setSelectedAltId] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer per question
  const questionStartTime = useRef<number>(Date.now());

  // Feedback animation
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const successSource = require("../../../assets/sounds/success.mp3");
  const errorSource = require("../../../assets/sounds/error.mp3");
  const playerSuccess = useAudioPlayer(successSource);
  const playerError = useAudioPlayer(errorSource);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (questionIds.length === 0) {
          Alert.alert("Erro", "Nenhuma questão encontrada.", [
            { text: "OK", onPress: () => router.back() },
          ]);
          return;
        }
        const loaded: Question[] = [];
        for (const id of questionIds) {
          try {
            const q = await examService.getQuestion(id);
            loaded.push(q);
          } catch {
            // skip questions that fail to load
          }
        }
        if (loaded.length === 0) {
          Alert.alert("Erro", "Não foi possível carregar as questões.", [
            { text: "OK", onPress: () => router.back() },
          ]);
          return;
        }
        setQuestions(loaded);
        questionStartTime.current = Date.now();
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, [questionIds]);

  const currentQuestion = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const acertou = answered && lastResult?.is_correct === true;

  const handleSelectAlt = (altId: number) => {
    if (answered) return;
    setSelectedAltId(altId);
  };

  const handleAnswer = async () => {
    if (
      !selectedAltId ||
      answered ||
      submitting ||
      !sessionId ||
      !currentQuestion
    )
      return;
    setSubmitting(true);

    const responseTime = Math.floor(
      (Date.now() - questionStartTime.current) / 1000,
    );

    try {
      const result = await sessionService.submitAnswer(sessionId, {
        question_id: currentQuestion.id,
        alternative_id: selectedAltId,
        response_time: responseTime,
      });

      setLastResult(result);
      setAnswered(true);
      // Sound
      try {
        if (result.is_correct) playerSuccess.play();
        else playerError.play();
      } catch {}

      // Animate feedback
      Animated.spring(feedbackAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } catch {
      Alert.alert("Erro", "Falha ao registrar resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    // Animate out feedback
    Animated.timing(feedbackAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      if (isLastQuestion) {
        // Finish session
        try {
          const duration = Math.floor(
            (Date.now() - (questionStartTime.current - 0)) / 1000,
          );
          const result = await sessionService.finishSession(sessionId!, {
            duration_seconds: duration,
          });
          router.replace({
            pathname: "/estudo/resultado",
            params: {
              sessionId: String(result.id),
              acertos: String(result.correct_answers),
              total: String(result.total_questions),
              xp: String(result.xp_earned),
              duracao: String(result.duration_seconds),
              streak: String(result.streak),
              missionsJson: JSON.stringify(result.missions_updated),
              achievementsJson: JSON.stringify(result.achievements_unlocked),
            },
          });
        } catch {
          Alert.alert("Erro", "Falha ao finalizar sessão.");
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAltId(null);
        setAnswered(false);
        setLastResult(null);
        questionStartTime.current = Date.now();
      }
    });
  };

  if (loadingQuestions) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando questões...</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <Text style={{ color: Colors.text }}>Nenhuma questão disponível.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtnWrapper}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {titulo}
          </Text>
          <Text style={styles.questaoCounter}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` as any,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Attachments */}
        {currentQuestion.attachments?.map((a) => {
          if (a.type === "text") {
            return (
              <View key={a.id} style={styles.attachmentBox}>
                {!!a.label && (
                  <View style={styles.attachmentLabelPill}>
                    <Text style={styles.attachmentLabelText}>{a.label}</Text>
                  </View>
                )}
                <Text style={styles.attachmentText}>{a.content}</Text>
              </View>
            );
          } else if (a.type === "image" && a.file) {
            const baseURL =
              process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "") ||
              "";
            const uri = `${baseURL}${a.file}`;
            return (
              <View key={a.id} style={styles.attachmentImageBox}>
                {!!a.label && (
                  <View style={styles.attachmentLabelPillImage}>
                    <Text style={styles.attachmentLabelText}>{a.label}</Text>
                  </View>
                )}
                <Image
                  source={{ uri }}
                  style={styles.attachmentImage}
                  resizeMode="contain"
                />
              </View>
            );
          }
          return null;
        })}

        {/* ENUNCIADO */}
        <View style={styles.cardEnunciado}>
          <Text style={styles.enunciadoText}>{currentQuestion.statement}</Text>
        </View>

        {/* ALTERNATIVAS */}
        <View style={styles.alternativasContainer}>
          {currentQuestion.alternatives.map((alt) => {
            const isSelected = selectedAltId === alt.id;
            const isCorrectFromAPI =
              answered && alt.letter === lastResult?.correct_letter;
            const isWrong = answered && isSelected && !isCorrectFromAPI;

            let borderColor = "#E5E7EB";
            let bgColor = Colors.white;
            let iconElement = null;

            if (answered) {
              if (isCorrectFromAPI) {
                borderColor = Colors.primary;
                bgColor = Colors.primaryLight;
                iconElement = (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color={Colors.primary}
                  />
                );
              } else if (isWrong) {
                borderColor = Colors.error;
                bgColor = "#FEF2F2";
                iconElement = (
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color={Colors.error}
                  />
                );
              }
            } else if (isSelected) {
              borderColor = Colors.primary;
              bgColor = "#F0FDF4";
            }

            const showBottomBorder =
              isSelected || (answered && (isCorrectFromAPI || isWrong));

            return (
              <TouchableOpacity
                key={alt.id}
                onPress={() => handleSelectAlt(alt.id)}
                activeOpacity={0.7}
                disabled={answered}
                style={[
                  styles.btnAlternativa,
                  { borderColor, backgroundColor: bgColor },
                  showBottomBorder && {
                    borderBottomWidth: 3,
                    paddingBottom: 11,
                  },
                ]}
              >
                <View style={styles.alternativaContent}>
                  <View
                    style={[
                      styles.labelCirculo,
                      answered &&
                        isCorrectFromAPI &&
                        styles.labelCirculoCorreto,
                      answered && isWrong && styles.labelCirculoIncorreto,
                      isSelected && !answered && styles.labelCirculoSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelText,
                        isSelected && !answered && styles.labelTextSelected,
                        answered && isCorrectFromAPI && styles.labelTextCorreto,
                        answered && isWrong && styles.labelTextIncorreto,
                      ]}
                    >
                      {alt.letter}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.alternativaTexto,
                      isSelected &&
                        !answered && {
                          color: Colors.primary,
                          fontWeight: "700",
                        },
                    ]}
                  >
                    {alt.text}
                  </Text>
                </View>
                {iconElement}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER FIXO — RESPONDER */}
      {!answered && (
        <View
          style={[
            styles.staticFooter,
            { paddingBottom: Math.max(24, insets.bottom + 8) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.btnResponder,
              (!selectedAltId || submitting) && styles.btnDisabled,
            ]}
            onPress={handleAnswer}
            disabled={!selectedAltId || submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text
                style={[
                  styles.btnResponderTexto,
                  !selectedAltId && styles.btnDisabledTexto,
                ]}
              >
                RESPONDER
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* FEEDBACK OVERLAY */}
      <Animated.View
        style={[
          styles.feedbackOverlay,
          {
            backgroundColor: acertou ? "#CCF7D9" : "#FEE2E2",
            paddingBottom: Math.max(34, insets.bottom + 16),
            transform: [
              {
                translateY: feedbackAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.feedbackContent}>
          <Text
            style={[
              styles.feedbackTitle,
              { color: acertou ? Colors.primaryDark : Colors.error },
            ]}
          >
            {acertou ? "Excelente! 🎉" : "Incorreto"}
          </Text>

          {!acertou && lastResult && (
            <View style={styles.correctAnswerBox}>
              <Text style={styles.correctAnswerLabel}>Resposta correta:</Text>
              <Text style={styles.correctAnswerText}>
                {lastResult.correct_letter} —{" "}
                {
                  currentQuestion.alternatives.find(
                    (a) => a.letter === lastResult.correct_letter,
                  )?.text
                }
              </Text>
            </View>
          )}

          {lastResult && acertou && (
            <View style={styles.xpEarnedBox}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.xpEarnedText}>
                +
                {lastResult.xp_earned ||
                  (sessionType === "simulated"
                    ? 15
                    : sessionType === "practice"
                      ? 5
                      : 10)}{" "}
                XP
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.btnContinuar,
              { backgroundColor: acertou ? Colors.primary : Colors.error },
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.btnContinuarTexto}>
              {isLastQuestion ? "VER RESULTADO" : "CONTINUAR"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 15, color: Colors.textSecondary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
  },
  backBtnWrapper: { padding: 6, minWidth: 40 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  questaoCounter: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    minWidth: 40,
    textAlign: "right",
  },
  progressContainer: { marginTop: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  content: { padding: 20, gap: 16, paddingBottom: 120 },
  attachmentBox: {
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  attachmentLabelPill: {
    alignSelf: "flex-start",
    marginBottom: 8,

    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E0E7FF",
  },
  attachmentLabelPillImage: {
    alignSelf: "flex-start",
    marginVertical: 14,
    marginHorizontal: 14,

    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E0E7FF",
  },
  attachmentLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  attachmentText: { fontSize: 14, lineHeight: 22, color: "#374151" },
  attachmentImageBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  attachmentImage: { width: "100%", height: 220 },
  cardEnunciado: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  enunciadoText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    fontWeight: "600",
  },
  alternativasContainer: { gap: 12 },
  btnAlternativa: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  alternativaContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  labelCirculo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  labelCirculoSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  labelCirculoCorreto: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  labelCirculoIncorreto: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  labelText: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
  labelTextSelected: { color: Colors.white },
  labelTextCorreto: { color: Colors.white },
  labelTextIncorreto: { color: Colors.white },
  alternativaTexto: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
    flex: 1,
  },
  staticFooter: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
  },
  btnResponder: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { backgroundColor: "#E5E7EB" },
  btnResponderTexto: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  btnDisabledTexto: { color: "#9CA3AF" },
  feedbackOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 999,
    elevation: 20,
  },
  feedbackContent: { gap: 16 },
  feedbackTitle: { fontSize: 22, fontWeight: "800" },
  correctAnswerBox: {
    backgroundColor: "rgba(239,68,68,0.06)",
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  correctAnswerLabel: { fontSize: 12, fontWeight: "700", color: Colors.error },
  correctAnswerText: { fontSize: 15, fontWeight: "600", color: Colors.error },
  xpEarnedBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  xpEarnedText: { fontSize: 15, fontWeight: "700", color: "#92400E" },
  btnContinuar: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContinuarTexto: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
