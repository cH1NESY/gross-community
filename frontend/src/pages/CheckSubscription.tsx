import React, { useState } from 'react';
import { apiUrl } from '../utils/apiBase';
import { CheckCircle, XCircle, Loader, Send, ArrowRight } from 'lucide-react';

const CheckSubscription: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    subscribed: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!username.trim()) {
      setError('Введите ваш Telegram username');
      return;
    }

    // Убираем @ если пользователь его ввел
    const cleanUsername = username.trim().replace(/^@/, '');

    if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleanUsername)) {
      setError('Некорректный формат username. Используйте только буквы, цифры и подчеркивание');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl('/check-subscription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ telegram_username: cleanUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Ошибка при проверке подписки');
        setLoading(false);
        return;
      }

      setResult({
        subscribed: data.subscribed || false,
        message: data.message || '',
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError('Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTelegram = () => {
    window.open('https://t.me/grosscommunity', '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-950 via-purple-950 to-pink-950 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl shadow-2xl border border-pink-500/30 p-8 md:p-12">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full mb-4">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-3">
              Проверка подписки
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Введите ваш Telegram username (без @), чтобы проверить, подписаны ли вы на наше закрытое сообщество
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-pink-200 mb-2">
                Telegram Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">@</span>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ваш_username"
                  className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Проверка...</span>
                </>
              ) : (
                <>
                  <span>Проверить подписку</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Результат проверки */}
          {result && (
            <div className={`mt-8 p-6 rounded-lg border ${
              result.subscribed 
                ? 'bg-green-900/30 border-green-500/30' 
                : 'bg-red-900/30 border-red-500/30'
            }`}>
              <div className="flex items-start gap-4">
                {result.subscribed ? (
                  <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    result.subscribed ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {result.subscribed ? 'Подписка подтверждена!' : 'Подписка не найдена'}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {result.message || (
                      result.subscribed 
                        ? 'Вы успешно подписаны на наше сообщество. Добро пожаловать!'
                        : 'Вы не подписаны на наше Telegram сообщество. Пожалуйста, присоединитесь для получения доступа.'
                    )}
                  </p>
                  {!result.subscribed && (
                    <button
                      onClick={handleJoinTelegram}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <span>Присоединиться к сообществу</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Информационный блок */}
          <div className="mt-8 p-4 bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-lg border border-pink-500/20">
            <p className="text-sm text-gray-300 text-center">
              <span className="text-pink-300 font-medium">Важно:</span> Для проверки подписки ваш Telegram профиль должен быть публичным 
              (Settings → Privacy → Profile Photos → Everybody). Проверка выполняется в реальном времени через Telegram API.
            </p>
          </div>

          {/* Кнопка возврата */}
          <div className="mt-6 text-center">
            <a
              href="#/"
              className="inline-flex items-center gap-2 text-pink-300 hover:text-pink-200 transition-colors text-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Вернуться на главную</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckSubscription;

