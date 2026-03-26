import { useState, useEffect } from 'react';

interface City {
  id: number;
  nome: string;
}

export function useCities(stateUF: string | undefined) {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateUF) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateUF}/municipios?orderBy=nome`
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar cidades');
        }

        const data = await response.json();
        setCities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [stateUF]);

  return { cities, isLoading, error };
}
