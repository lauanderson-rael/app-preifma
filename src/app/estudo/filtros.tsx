import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NIVEIS = ['Integrado', 'Subsequente', 'Concomitante'];
const ANOS = ['2025', '2024', '2023', '2022', '2021', '2020'];

export default function FiltrosScreen() {
  const { materia, titulo } = useLocalSearchParams<{ materia: string; titulo: string }>();
  const insets = useSafeAreaInsets();

  const [nivelSelecionado, setNivelSelecionado] = useState<string>('Integrado');
  const [anosSelecionados, setAnosSelecionados] = useState<string[]>(['2024']);

  const toggleAno = (ano: string) => {
    if (anosSelecionados.includes(ano)) {
      if (anosSelecionados.length > 1) { // não deixa vazio
        setAnosSelecionados(anosSelecionados.filter((a) => a !== ano));
      }
    } else {
      setAnosSelecionados([...anosSelecionados, ano]);
    }
  };

  const handleIniciar = () => {
    router.push({
      pathname: '/estudo/questao',
      params: { materia, titulo, nivel: nivelSelecionado, anos: anosSelecionados.join(',') }
    });
  };

  return (
    <View style={styles.safe}>
      <CustomHeader
        title={`Estudar ${titulo}`}
        leftContent={
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              const isSelected = nivelSelecionado === nivel;
              return (
                <TouchableOpacity
                  key={nivel}
                  onPress={() => setNivelSelecionado(nivel)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {nivel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Categoria: Ano */}
        <View style={styles.sectionStore}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Anos das Provas</Text>
          </View>

          <View style={styles.chipsContainer}>
            {ANOS.map((ano) => {
              const isSelected = anosSelecionados.includes(ano);
              return (
                <TouchableOpacity
                  key={ano}
                  onPress={() => toggleAno(ano)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {ano}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* FOOTER BOTÃO START */}
      <View style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 8) }]}>
        <TouchableOpacity style={styles.btnIniciar} onPress={handleIniciar} activeOpacity={0.8}>
          <Ionicons name="play" size={20} color={Colors.white} />
          <Text style={styles.btnIniciarTexto}>Iniciar Estudo</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: 'transparent',
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
});
