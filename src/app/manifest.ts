import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jays',
    short_name: 'Jays',
    description: 'Jays Dijital Sadakat Uygulaması',
    start_url: '/login',
    display: 'standalone',
    background_color: '#FBF8F1',
    theme_color: '#654321',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  }
}
