import { CustomHeader } from '@/components/CustomHeader';
import { Colors } from '@/constants/Colors';
import { Target } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MissaoScreen() {
  return (
    <View style={styles.container}>
      <CustomHeader title="Missões diárias" />
      <View style={styles.content}>
        <Target size={64} color={Colors.primary} strokeWidth={1.5} />
        <Text style={styles.title}>Missões diárias em Breve!</Text>
        <Text style={styles.subtitle}>
          Estamos preparando missões incríveis para você testar seus conhecimentos e ganhar XP extra.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
