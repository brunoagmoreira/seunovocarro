const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = false, params, headers: customHeaders, ...rest } = options;

  let url = `${API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers = new Headers(customHeaders);
  
  // Se não houver Content-Type e não for FormData, default para JSON
  if (!headers.has('Content-Type') && !(rest.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Tentar injetar o token no Client Side
  if (typeof window !== 'undefined' && requireAuth) {
    const token = localStorage.getItem('snc_auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn(`Aviso: Tentando acessar rota autenticada (${endpoint}) mas nenhum token encontrado no localStorage.`);
    }
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignorar erro se não for json
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`Fetch API Error (${endpoint}):`, error);
    throw error;
  }
}
