import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAccessToken } from '../api/client';
import { dashboardService } from '../api/dashboardService';
import { AIUsage } from '../types/api';

interface AIContextValue {
  aiUsage: AIUsage | null;
  updateAIUsage: (usage: AIUsage) => void;
  refreshAIUsage: () => Promise<void>;
  isLoading: boolean;
}

const AIContext = createContext<AIContextValue | null>(null);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateAIUsage = useCallback((usage: AIUsage) => {
    setAiUsage(usage);
  }, []);

  const refreshAIUsage = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const data = await dashboardService.getDashboard();
      if (data.ai_usage) {
        setAiUsage(data.ai_usage);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAIUsage();
  }, [refreshAIUsage]);

  return (
    <AIContext.Provider value={{ aiUsage, updateAIUsage, refreshAIUsage, isLoading }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
