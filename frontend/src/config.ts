export const API_BASE =
  (import.meta as { env?: { PROD?: boolean; VITE_API_URL?: string } }).env?.VITE_API_URL
  ?? (
    (import.meta as { env?: { PROD?: boolean } }).env?.PROD
      ? 'https://rooms-9z2w.onrender.com/api'
      : '/api'
  )
