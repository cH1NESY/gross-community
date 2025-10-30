export function getApiBase(): string {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE?.trim();
  if (envBase) return envBase.replace(/\/$/, '');

  // Fallback: same origin (useful when backend is reverse-proxied under the same domain)
  if (typeof window !== 'undefined' && window.location?.origin) {
    // If running via Vite dev server (localhost:5173), default backend on http://localhost
    if (window.location.port === '5173') {
      return 'http://localhost';
    }
    return window.location.origin;
  }

  // Last resort
  return 'http://localhost';
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const cleanPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  return `${base}${cleanPath}`;
}


