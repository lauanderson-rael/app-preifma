import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Dados mockados ─── 
const USUARIO = {
  nome: 'Estudante Silva',
  email: 'estudante@email.com',
  iniciais: 'ES',
  diasOfensiva: 7,
};

const STATS = {
  questoesRespondidas: 156,
  taxaAcerto: 73,
  materias: [
    { nome: 'Português', progresso: 78, cor: Colors.primary },
    { nome: 'Matemática', progresso: 68, cor: '#3B82F6' },
  ],
};

const META_DIARIA = {
  feitas: 12,
  total: 15,
  porcentagem: 80,
};

interface Conquista {
  id: string;
  icone: keyof typeof Ionicons.glyphMap;
  iconeCor?: string;
  label: string;
  cor: string;
  desbloqueada: boolean;
}

const CONQUISTAS: Conquista[] = [
  { id: '1', icone: 'trophy', iconeCor: Colors.primary, label: 'Primeira questão', cor: Colors.primaryLight, desbloqueada: true },
  { id: '2', icone: 'book', iconeCor: Colors.primary, label: '100 questões', cor: Colors.primaryLight, desbloqueada: true },
  { id: '3', icone: 'flame', iconeCor: Colors.primary, label: '7 dias seguidos', cor: Colors.primaryLight, desbloqueada: true },
  { id: '4', icone: 'lock-closed', label: 'Bloqueada', cor: '#F3F4F6', desbloqueada: false },
];

// Subcomponente: Barra de progresso 
function BarraProgresso({
  label,
  valor,
  cor,
}: {
  label: string;
  valor: number;
  cor: string;
}) {
  return (
    <View style={styles.barraContainer}>
      <View style={styles.barraHeader}>
        <Text style={styles.barraLabel}>{label}</Text>
        <Text style={[styles.barraValor, { color: cor }]}>{valor}%</Text>
      </View>
      <View style={styles.barraFundo}>
        <View
          style={[
            styles.barraPreenchimento,
            { width: `${valor}%` as any, backgroundColor: cor },
          ]}
        />
      </View>
    </View>
  );
}

// Subcomponente: Conquista 
function ConquistaItem({ item }: { item: Conquista }) {
  return (
    <View style={styles.conquistaItem}>
      <View
        style={[
          styles.conquistaIconBox,
          { backgroundColor: item.desbloqueada ? item.cor : '#F3F4F6' },
          !item.desbloqueada && styles.conquistaBloqueado,
        ]}
      >
        <Ionicons
          name={item.icone}
          size={24}
          color={
            item.desbloqueada
              ? item.iconeCor || Colors.text
              : Colors.textMuted
          }
          style={!item.desbloqueada && styles.conquistaEmojiBloqueado}
        />
      </View>
      <Text
        style={[
          styles.conquistaLabel,
          !item.desbloqueada && styles.textMuted,
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

// ── Tela principal ─────────────────────────────────────────
export default function PerfilScreen() {
  const faltam = META_DIARIA.total - META_DIARIA.feitas;

  const handleSair = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  return (
    <View style={styles.safe}>
      <CustomHeader 
        title="Perfil" 
        leftContent={
          <TouchableOpacity onPress={() => router.navigate('/')} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar + Info ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{USUARIO.iniciais}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{USUARIO.nome}</Text>
              <Text style={styles.userEmail}>{USUARIO.email}</Text>
            </View>
          </View>

          {/* Badge ofensiva */}
          <View style={styles.ofensivaBadge}>
            <Ionicons name="flame" size={24} color={'#EA580C'} />
            <View>
              <Text style={styles.ofensivaTitle}>
                {USUARIO.diasOfensiva} dias de ofensiva!
              </Text>
              <Text style={styles.ofensivaSubtitle}>
                Continue estudando para manter.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Estatísticas de Desempenho ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trending-up" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Estatísticas de Desempenho</Text>
          </View>

          {/* Números */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {STATS.questoesRespondidas}
              </Text>
              <Text style={styles.statLabel}>Questões{'\n'}respondidas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {STATS.taxaAcerto}%
              </Text>
              <Text style={styles.statLabel}>Taxa de acerto</Text>
            </View>
          </View>

          {/* Barras de matérias */}
          <View style={styles.barras}>
            {STATS.materias.map((m) => (
              <BarraProgresso
                key={m.nome}
                label={m.nome}
                valor={m.progresso}
                cor={m.cor}
              />
            ))}
          </View>
        </View>

        {/* ── Conquistas ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trophy-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Conquistas</Text>
          </View>
          <View style={styles.conquistasRow}>
            {CONQUISTAS.map((c) => (
              <ConquistaItem key={c.id} item={c} />
            ))}
          </View>
        </View>

        {/* ── Meta Diária ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="flame-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Meta Diária</Text>
          </View>

          <View style={styles.metaHeader}>
            <Text style={styles.metaQuestoes}>
              {META_DIARIA.feitas} de {META_DIARIA.total} questões
            </Text>
            <Text style={styles.metaPorcentagem}>{META_DIARIA.porcentagem}%</Text>
          </View>

          {/* Barra de progresso da meta */}
          <View style={styles.metaBarraFundo}>
            <View
              style={[
                styles.metaBarraPreenchimento,
                { width: `${META_DIARIA.porcentagem}%` as any },
              ]}
            />
          </View>

          <View style={styles.metaFooter}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaFaltam}>
              Mais {faltam} questões para completar sua meta de hoje!
            </Text>
          </View>
        </View>

        {/* ── Botão Sair ── */}
        <TouchableOpacity
          style={styles.sairBtn}
          onPress={handleSair}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#ffffffff" />
          <Text style={styles.sairBtnText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },

  // Profile card
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // Badge ofensiva
  ofensivaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 0,

  },
  ofensivaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
  ofensivaSubtitle: {
    fontSize: 12,
    color: '#C2410C',
    marginTop: 1,
  },

  // Cards genéricos
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statBoxBlue: {
    backgroundColor: '#EFF6FF',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Barras de progresso por matéria
  barras: {
    gap: 14,
  },
  barraContainer: {
    gap: 6,
  },
  barraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barraLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  barraValor: {
    fontSize: 13,
    fontWeight: '700',
  },
  barraFundo: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barraPreenchimento: {
    height: '100%',
    borderRadius: 99,
  },

  // Conquistas
  conquistasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  conquistaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  conquistaIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conquistaBloqueado: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  conquistaEmojiBloqueado: {
    opacity: 0.3,
  },
  conquistaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  textMuted: {
    color: Colors.textMuted,
  },

  // Meta diária
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaQuestoes: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  metaPorcentagem: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  metaBarraFundo: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  metaBarraPreenchimento: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: Colors.primary,
  },
  metaFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  metaFaltam: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Botão sair
  sairBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    borderRadius: 14,
    height: 52,
    borderWidth: 0,

    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    marginTop: 4,
  },
  sairBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffffff',
  },
});
