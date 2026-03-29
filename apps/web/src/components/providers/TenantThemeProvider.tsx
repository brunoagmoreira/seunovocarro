"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useTenantTheme, TenantTheme } from '@/hooks/useTenantTheme';

interface TenantContextType {
  theme: TenantTheme | null;
  hostname: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const { theme, hostname } = useTenantTheme();

  return (
    <TenantContext.Provider value={{ theme, hostname }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantThemeProvider');
  }
  return context;
};
