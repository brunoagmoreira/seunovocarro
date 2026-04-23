/**
 * Base URL do Nest (prefixo global `api`). Garante `/api` no fim mesmo se
 * NEXT_PUBLIC_API_URL vier só com o host (ex.: docker-compose sem sufixo).
 */
export function getPublicApiUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || 'https://api.seunovocarro.com.br/api').trim();
  const base = raw.replace(/\/+$/, '');
  if (/\/api$/i.test(base)) {
    return base;
  }
  return `${base}/api`;
}

/** Mensagem mais clara quando o browser bloqueia rede/CORS ou a API está inacessível. */
export function formatApiNetworkError(err: unknown, attemptedUrl: string): Error {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('network request failed')
  ) {
    return new Error(
      `Sem resposta da API (${attemptedUrl}). Confirme que a API está no ar, que NEXT_PUBLIC_API_URL aponta para o Nest (ex.: https://api.seunovocarro.com.br/api) e, no mesmo domínio, que o proxy /api está configurado. Abra F12 → Network para inspecionar o pedido.`,
    );
  }
  return err instanceof Error ? err : new Error(msg);
}

const API_URL = getPublicApiUrl();

interface FetchOptions extends Omit<RequestInit, 'body'> {
  requireAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
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

  // Auto-stringify body if it's an object and not FormData
  let body = rest.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...rest,
      body,
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
