import React, { createContext, useContext, useEffect, useState } from 'react';
import { getNetworkStatus, subscribeNetworkStatus } from '@/lib/networkStatus';

interface NetworkContextValue {
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(getNetworkStatus());

  useEffect(() => subscribeNetworkStatus(setIsOffline), []);

  return (
    <NetworkContext.Provider value={{ isOffline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
