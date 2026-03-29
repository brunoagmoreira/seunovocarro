"use client";

import { useEffect, useState } from 'react';

export interface TenantTheme {
  logo?: string;
  primaryColor?: string;
  name: string;
}

export function useTenantTheme() {
  const [theme, setTheme] = useState<TenantTheme | null>(null);
  const [hostname, setHostname] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHostname = window.location.hostname;
      setHostname(currentHostname);
      
      // Lógica de Identificação de Tenant (Exemplo inicial)
      // Futuramente isso buscará dados da API /tenants/:hostname
      if (currentHostname.includes('localhost') || currentHostname.includes('187.77.47.91')) {
        setTheme({
          name: 'Seu Novo Carro',
          primaryColor: '#268052', // Verde oficial
        });
      } else {
        // Fallback ou busca dinâmica
        setTheme({
          name: 'Seu Novo Carro',
        });
      }
    }
  }, []);

  return { theme, hostname };
}
