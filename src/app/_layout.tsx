import { Colors } from '@/constants/Colors';
import { AIProvider } from '@/context/AIContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NetworkProvider, useNetwork } from '@/context/NetworkContext';
import { SessionProvider } from '@/context/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import { Slot, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/** Controla redirecionamento baseado em autenticacao */
function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOffline } = useNetwork();
  const segments = useSegments();
  const isAuthRoute = segments[0] === '(auth)';

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/(auth)/login');
      return;
    }
    if (isAuthenticated && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, isAuthRoute]);

  if (isLoading && !isAuthRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {isOffline && isAuthenticated && !isAuthRoute ? (
        <View style={styles.offlineBanner} pointerEvents="none">
          <Ionicons name="cloud-offline-outline" size={18} color="#92400E" />
          <Text style={styles.offlineText}>
            Sem conexao com a internet. Os dados vao ser atualizados quando a rede voltar.
          </Text>
        </View>
      ) : null}
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NetworkProvider>
        <AuthProvider>
          <AIProvider>
            <SessionProvider>
              <AuthGate />
            </SessionProvider>
          </AIProvider>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  offlineBanner: {
    position: 'absolute',
    top: 44,
    left: 12,
    right: 12,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  offlineText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#991B1B',
    fontWeight: '600',
  },
});
