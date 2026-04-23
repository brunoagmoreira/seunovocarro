import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Resolve a base da API Nest para proxy server-side quando o browser chama
 * o mesmo host do Next em `/api/*` (NEXT_PUBLIC_API_URL = …/seunovocarro.com.br/api).
 *
 * Ordem: API_INTERNAL_URL (rede Docker) → SERVER_API_PROXY_URL (URL pública da API)
 * → NEXT_PUBLIC_API_URL se o hostname for diferente do pedido atual.
 */
function resolveUpstreamApiBase(request: NextRequest): string | null {
  const internal = process.env.API_INTERNAL_URL?.trim().replace(/\/+$/, '');
  if (internal) {
    return internal.endsWith('/api') ? internal : `${internal}/api`;
  }

  const serverProxy = process.env.SERVER_API_PROXY_URL?.trim().replace(/\/+$/, '');
  if (serverProxy) {
    return serverProxy.endsWith('/api') ? serverProxy : `${serverProxy}/api`;
  }

  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || '';
  if (!raw) return null;
  const normalized = raw.replace(/\/+$/, '');
  const withApi = /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
  try {
    const u = new URL(withApi);
    const reqHost = request.nextUrl.hostname.toLowerCase();
    if (u.hostname.toLowerCase() !== reqHost) {
      return `${u.origin}/api`;
    }
  } catch {
    return null;
  }

  // Mesmo host no NEXT_PUBLIC: fallback para a API pública do projeto (evita "Cannot GET /api/…").
  if (
    request.nextUrl.hostname.toLowerCase() === 'seunovocarro.com.br' ||
    request.nextUrl.hostname.toLowerCase() === 'www.seunovocarro.com.br'
  ) {
    return 'https://api.seunovocarro.com.br/api';
  }

  return null;
}

async function proxy(request: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const base = resolveUpstreamApiBase(request);
  const { path = [] } = await ctx.params;
  const suffix = path.length ? path.join('/') : '';
  const search = request.nextUrl.search;

  if (!base) {
    return NextResponse.json(
      {
        message:
          'API não alcançável a partir do Next: defina API_INTERNAL_URL (ex.: http://seunovocarro-api:3001), ou SERVER_API_PROXY_URL (ex.: https://api.seunovocarro.com.br), ou use NEXT_PUBLIC_API_URL apontando para o host da API Nest.',
        statusCode: 503,
      },
      { status: 503 },
    );
  }

  const target = `${base.replace(/\/+$/, '')}/${suffix}${search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = request.body;
    (init as { duplex?: string }).duplex = 'half';
  }

  try {
    const res = await fetch(target, init);
    const outHeaders = new Headers(res.headers);
    return new NextResponse(res.body, { status: res.status, statusText: res.statusText, headers: outHeaders });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao contatar a API';
    return NextResponse.json({ message: msg, statusCode: 502 }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
