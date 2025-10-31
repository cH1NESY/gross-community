export function getApiBase(): string {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE?.trim();
  if (envBase) return envBase.replace(/\/$/, '');

  // Fallback: same origin (useful when backend is reverse-proxied under the same domain)
  if (typeof window !== 'undefined' && window.location?.origin) {
    // If running via Vite dev server (localhost:5173), default backend on http://localhost
    if (window.location.port === '5173') {
      // Check if we're on a production server (IP address)
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Production server: backend is on same IP but port 80 (no port in URL)
        return `http://${hostname}`;
      }
      return 'http://localhost';
    }
    // For production: if frontend is on IP:5173, backend is on same IP without port
    const hostname = window.location.hostname;
    if (window.location.port && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}`;
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


