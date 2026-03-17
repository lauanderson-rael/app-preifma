import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Mocks ────────────────────────────────────────────────
const NIVEIS = ['Integrado', 'Subsequente', 'Concomitante'];
const ANOS = ['2025', '2024', '2023', '2022', '2021', '2020'];

interface ProvaData {
  id: string;
  titulo: string;
  ano: string;
  descricao: string;
}

const RESULTADOS_MOCK: ProvaData[] = [
  {
    id: '1',
    titulo: 'Prova dos cursos integrados',
    ano: '2024',
    descricao: '2024 - Prova Forma integrad',
  },
  {
    id: '2',
    titulo: 'Prova dos cursos concomitantes',
    ano: '2024',
    descricao: '2024 - Prova Forma concomitant',
  },
];

export default function ProvasScreen() {
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

  // Simula busca
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<ProvaData[]>([]);

  const handleBuscar = () => {
    setBuscando(true);
    // Simula o tempo de busca
    setTimeout(() => {
      setResultados(RESULTADOS_MOCK);
      setBuscando(false);
    }, 600);
  };

  const handleClickProvas = () => {
    // Ação simulada de baixar arquivo pdf
  };

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Provas Anteriores"
        leftContent={
          <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.filtrosHeader}>Acesse arquivos de provas anteriores</Text>
        {/* FILTROS CARD */}
        <View style={styles.cardFiltros}>
          {/* Categoria: Modalidade */}
          <View style={styles.sectionStore}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Tipo de curso</Text>
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
              <Text style={styles.sectionTitle}>Ano de Realização</Text>
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

          <TouchableOpacity style={styles.btnBuscar} onPress={handleBuscar} activeOpacity={0.85}>
            {buscando ? (
              <Text style={styles.btnBuscarTexto}>Buscando...</Text>
            ) : (
              <>
                <Ionicons name="search" size={20} color={Colors.white} />
                <Text style={styles.btnBuscarTexto}>Buscar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* LISTA DE RESULTADOS */}
        {resultados.length > 0 && (
          <View style={styles.resultadosSection}>
            <View style={styles.resultadosHeader}>
              <Text style={styles.resultadosTitle}>Resultado da Busca</Text>
              <View style={styles.badgeQtd}>
                <Text style={styles.badgeQtdText}>{resultados.length}</Text>
              </View>
            </View>

            {resultados.map((resultado) => (
              <View key={resultado.id} style={styles.cardProva}>

                {/* Textos Informativos */}
                <View style={styles.cardProvaLeft}>
                  <Text style={styles.provaTitle}>{resultado.titulo}</Text>
                  <Text style={styles.provaDesc}>{resultado.descricao}</Text>
                </View>

                {/* Botões de Ação */}
                <View style={styles.cardProvaRight}>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnProva]}
                    activeOpacity={0.75}
                    onPress={handleClickProvas}
                  >
                    <Ionicons name="document-text" size={16} color={Colors.white} />
                    <Text style={styles.btnActionTexto}>Prova</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnGabarito]}
                    activeOpacity={0.75}
                    onPress={handleClickProvas}
                  >
                    <Ionicons name="checkmark-done" size={16} color={Colors.white} />
                    <Text style={styles.btnActionTexto}>Gabarito</Text>
                  </TouchableOpacity>

                </View>

              </View>
            ))}

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },

  // CARD DE FILTROS
  cardFiltros: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 8,
  },
  filtrosHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,

  },
  filtrosSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    marginTop: 2,
  },

  // Sections (Chips)
  sectionStore: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
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

  btnBuscar: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnBuscarTexto: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // SESSÃO DE RESULTADOS
  resultadosSection: {
    marginTop: 8,
    gap: 16,
  },
  resultadosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultadosTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  badgeQtd: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeQtdText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },

  // CARDS DE PROVA
  cardProva: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardProvaLeft: {
    flex: 1,
    paddingRight: 12,
  },
  provaTitle: {
    fontSize: 15,
    fontWeight: '700',
    // color: '#92400E', // Tom amarelado avermelhado semelhante a imagem
    marginBottom: 6,
    lineHeight: 20,
  },
  provaDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Botões vermelho/verde
  cardProvaRight: {
    gap: 8,
    width: 105,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  btnProva: {
    backgroundColor: '#DC2626', // Vermelho Prova
  },
  btnGabarito: {
    backgroundColor: '#16A34A', // Verde Gabarito
  },
  btnActionTexto: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
