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
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  
  const [sonsHabilitados, setSonsHabilitados] = useState(true);
  const [vibracaoHabilitada, setVibracaoHabilitada] = useState(true);

  const handleSalvar = () => {
    router.back();
  };

  return (
    <View style={styles.safe}>
      <CustomHeader
        title="Configurações"
        leftContent={
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* SESSÃO PREFERÊNCIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <View style={styles.card}>
            {/* Sons */}
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="volume-medium-outline" size={22} color="#0EA5E9" />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Sons</Text>
                  <Text style={styles.itemDesc}>Efeitos sonoros ao responder</Text>
                </View>
              </View>
              <Switch
                value={sonsHabilitados}
                onValueChange={setSonsHabilitados}
                trackColor={{ false: '#D1D5DB', true: Colors.primaryLight }}
                thumbColor={sonsHabilitados ? Colors.primary : '#F3F4F6'}
              />
            </View>

            {/* Vibração */}
            <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="pulse-outline" size={22} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Vibração</Text>
                  <Text style={styles.itemDesc}>Feedback tátil ao tocar</Text>
                </View>
              </View>
              <Switch
                value={vibracaoHabilitada}
                onValueChange={setVibracaoHabilitada}
                trackColor={{ false: '#D1D5DB', true: Colors.primaryLight }}
                thumbColor={vibracaoHabilitada ? Colors.primary : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* SESSÃO SUPORTE E OUTROS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outros</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.itemRow} activeOpacity={0.7}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="help-circle-outline" size={22} color="#EF4444" />
                </View>
                <Text style={styles.itemTitle}>Suporte</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.itemRow, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="information-circle-outline" size={22} color="#22C55E" />
                </View>
                <Text style={styles.itemTitle}>Sobre</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.btnSalvar} 
          onPress={handleSalvar}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSalvarText}>Salvar Alterações</Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  itemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  btnSalvar: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 8,
  },
  btnSalvarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
