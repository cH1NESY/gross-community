export function getApiBase(): string {
  // 1. Проверяем явно указанный в .env (приоритет)
  const envBase = (import.meta as any)?.env?.VITE_API_BASE?.trim();
  if (envBase) {
    const base = envBase.replace(/\/$/, '');
    console.log('[apiBase] Using VITE_API_BASE from .env:', base);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('api_base', base);
    }
    return base;
  }

  // 2. Определяем на основе текущего location (главная логика)
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    console.log('[apiBase] Current location:', { hostname, port, origin: window.location.origin });
    
    // Логика: фронтенд на IP:5173, бэкенд на том же IP:80
    if (port === '5173') {
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Локальная разработка
        const base = 'http://localhost';
        console.log('[apiBase] Local development, using:', base);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('api_base', base);
        }
        return base;
      } else {
        // Production: бэкенд на том же IP, но без порта (порт 80)
        // Если это IP адрес сервера, используем его напрямую
        const base = `http://${hostname}`;
        console.log('[apiBase] Production server, using:', base);
        console.log('[apiBase] Full API URL will be:', `${base}/api/*`);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('api_base', base);
        }
        return base;
      }
    }
    
    // Если есть другой порт и это не localhost - бэкенд на том же IP без порта
    if (port && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const base = `http://${hostname}`;
      console.log('[apiBase] Other port, using:', base);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('api_base', base);
      }
      return base;
    }
    
    // Если нет порта или localhost без порта - используем текущий origin
    const base = window.location.origin;
    console.log('[apiBase] Using current origin:', base);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('api_base', base);
    }
    return base;
  }

  // 3. Last resort - fallback
  const fallback = 'http://localhost';
  console.warn('[apiBase] Using fallback:', fallback);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('api_base', fallback);
  }
  return fallback;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const cleanPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  const fullUrl = `${base}${cleanPath}`;
  console.log('[apiUrl] Generated URL:', fullUrl);
  return fullUrl;
}


