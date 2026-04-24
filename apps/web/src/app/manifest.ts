import type { MetadataRoute } from 'next';

const theme = '#268052';
const bg = '#f8f9fa';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Seu Novo Carro',
    short_name: 'SNC',
    description:
      'Carros novos e seminovos com segurança. Busque, favorite e fale com lojistas verificados.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone'],
    orientation: 'portrait-primary',
    background_color: bg,
    theme_color: theme,
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Buscar veículos',
        short_name: 'Buscar',
        description: 'Filtrar carros por marca, cidade e preço',
        url: '/veiculos',
        icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
      },
      {
        name: 'Anunciar',
        short_name: 'Anunciar',
        description: 'Publicar um veículo',
        url: '/anunciar',
        icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
      },
    ],
  };
}
