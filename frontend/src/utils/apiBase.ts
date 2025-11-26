const DEFAULT_LOCAL_BACKEND_PORT = '8080';
const LOCAL_BACKEND_PORT = ((import.meta as any)?.env?.VITE_LOCAL_BACKEND_PORT?.trim()) || DEFAULT_LOCAL_BACKEND_PORT;
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

function persistBase(base: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('api_base', base);
  }
}

export function getApiBase(): string {
  // 1. Проверяем явно указанный в .env (приоритет)
  const envBase = (import.meta as any)?.env?.VITE_API_BASE?.trim();
  if (envBase) {
    const base = envBase.replace(/\/$/, '');
    console.log('[apiBase] Using VITE_API_BASE from .env:', base);
    persistBase(base);
    return base;
  }

  // 2. Определяем на основе текущего location (главная логика)
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const port = window.location.port;

    console.log('[apiBase] Current location:', { hostname, port, origin: window.location.origin });

    if (LOCAL_HOSTNAMES.has(hostname)) {
      const portSegment = LOCAL_BACKEND_PORT && LOCAL_BACKEND_PORT !== '80' ? `:${LOCAL_BACKEND_PORT}` : '';
      const base = `http://${hostname}${portSegment}`;
      console.log('[apiBase] Local development, using backend on port', LOCAL_BACKEND_PORT, ':', base);
      persistBase(base);
      return base;
    }

    // Если есть другой порт и это не localhost - бэкенд на том же IP без порта
    if (port && HOSTNAME_NOT_LOCAL(hostname)) {
      const base = `http://${hostname}`;
      console.log('[apiBase] Other port, using:', base);
      persistBase(base);
      return base;
    }

    // Если нет порта или localhost без порта - используем текущий origin
    const base = window.location.origin;
    console.log('[apiBase] Using current origin:', base);
    persistBase(base);
    return base;
  }

  // 3. Last resort - fallback
  const fallback = 'http://localhost';
  console.warn('[apiBase] Using fallback:', fallback);
  persistBase(fallback);
  return fallback;
}

function HOSTNAME_NOT_LOCAL(hostname: string): boolean {
  return hostname !== 'localhost' && hostname !== '127.0.0.1';
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const cleanPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  const fullUrl = `${base}${cleanPath}`;
  console.log('[apiUrl] Generated URL:', fullUrl);
  return fullUrl;
}