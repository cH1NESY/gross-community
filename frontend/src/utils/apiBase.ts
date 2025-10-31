export function getApiBase(): string {
  // 1. Проверяем явно указанный в .env
  const envBase = (import.meta as any)?.env?.VITE_API_BASE?.trim();
  if (envBase) {
    const base = envBase.replace(/\/$/, '');
    // Сохраняем в sessionStorage для использования после редиректов
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('api_base', base);
    }
    return base;
  }

  // 2. Пытаемся восстановить из sessionStorage (после редиректов с оплаты)
  if (typeof window !== 'undefined') {
    const savedBase = sessionStorage.getItem('api_base');
    if (savedBase) {
      // Проверяем что сохраненный URL валидный (не localhost если мы на сервере)
      const currentHost = window.location.hostname;
      const savedHost = new URL(savedBase).hostname;
      
      // Если сохраненный URL для того же домена/IP - используем его
      if (savedHost === currentHost || savedHost === window.location.hostname) {
        return savedBase;
      }
      
      // Если мы на сервере (не localhost), а сохраненный localhost - не используем
      if (savedHost === 'localhost' && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        sessionStorage.removeItem('api_base');
      } else {
        return savedBase;
      }
    }
  }

  // 3. Определяем на основе текущего location
  if (typeof window !== 'undefined' && window.location?.origin) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Если это localhost:5173 - бэкенд на localhost:80
    if (port === '5173' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      const base = 'http://localhost';
      sessionStorage.setItem('api_base', base);
      return base;
    }
    
    // Если это production сервер (IP:5173) - бэкенд на том же IP без порта
    if (port === '5173' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const base = `http://${hostname}`;
      sessionStorage.setItem('api_base', base);
      return base;
    }
    
    // Если есть порт и это не localhost - бэкенд на том же IP без порта
    if (port && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const base = `http://${hostname}`;
      sessionStorage.setItem('api_base', base);
      return base;
    }
    
    // Иначе используем текущий origin
    const base = window.location.origin;
    sessionStorage.setItem('api_base', base);
    return base;
  }

  // 4. Last resort
  const fallback = 'http://localhost';
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('api_base', fallback);
  }
  return fallback;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const cleanPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  return `${base}${cleanPath}`;
}


