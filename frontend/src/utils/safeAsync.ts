// Утилиты для предотвращения зависания приложения
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  timeout: number = 10000,
  fallback?: T
): Promise<T | undefined> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const result = await asyncFn();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    console.error('Safe async error:', error);
    return fallback;
  }
};

export const safeFetch = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.error('Safe fetch error:', error);
    return null;
  }
};

export const safeNavigate = (url: string) => {
  try {
    window.location.href = url;
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback - открываем в новой вкладке
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const safeHistoryReplace = (url: string) => {
  try {
    window.history.replaceState({}, document.title, url);
  } catch (error) {
    console.error('History replace error:', error);
  }
};
