import { Colors } from '@/constants/Colors';
import { AIProvider } from '@/context/AIContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SessionProvider } from '@/context/SessionContext';
import { Slot, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/** Controla redirecionamento baseado em autenticação */
function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
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

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <AIProvider>
          <SessionProvider>
            <AuthGate />
          </SessionProvider>
        </AIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
