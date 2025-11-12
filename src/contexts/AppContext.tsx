"use client"

import { createContext, useContext, ReactNode } from 'react';
import { useMockApi } from '@/hooks/use-mock-api';

type AppContextType = ReturnType<typeof useMockApi>;

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const api = useMockApi();
  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
