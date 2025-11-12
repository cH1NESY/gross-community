import React, { useState } from 'react';
import { ArrowRight, Send } from 'lucide-react';

const CheckSubscription: React.FC = () => {
  const [username, setUsername] = useState('');
  const botLink = 'https://t.me/grosscbot';

  const handleCheckSubscription = () => {
    // Формируем URL для возврата на сайт после проверки
    // Бот должен проверить подписку и вернуть пользователя на сайт с параметрами:
    // - subscribed=1 если подписан
    // - subscribed=0 если не подписан
    const returnUrl = `${window.location.origin}/?success=1#/payment`;
    
    // Кодируем URL для передачи в параметре start
    // Формат: /start check_<url>
    // Используем encodeURIComponent для безопасной передачи URL
    const encodedUrl = encodeURIComponent(returnUrl);
    
    // Открываем бота с параметром для возврата
    // Telegram автоматически заменит некоторые символы в URL, поэтому кодируем полностью
    const botUrl = `${botLink}?start=check_${encodedUrl}`;
    
    console.log('Opening bot with URL:', {
      returnUrl,
      encodedUrl,
      botUrl
    });
    
    window.open(botUrl, '_blank', 'noopener,noreferrer');
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
              Нажмите кнопку ниже, чтобы открыть бота и проверить подписку на наше закрытое сообщество
            </p>
          </div>

          {/* Форма */}
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-pink-200 mb-2">
                Telegram Username <span className="text-gray-400 text-xs">(необязательно)</span>
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
                  placeholder="ваш_username (необязательно)"
                  className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Username необязателен. Бот автоматически определит ваш профиль после нажатия «Start».
              </p>
            </div>

            <button
              type="button"
              onClick={handleCheckSubscription}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Проверить подписку через бота</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Информационный блок */}
          <div className="mt-8 p-4 bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-lg border border-pink-500/20">
            <p className="text-sm text-gray-300 text-center space-y-2">
              <span className="block">
                <span className="text-pink-300 font-medium">Как это работает:</span> Нажмите кнопку выше, чтобы открыть бота{' '}
                <button
                  type="button"
                  onClick={() => window.open(botLink, '_blank', 'noopener,noreferrer')}
                  className="text-pink-200 underline hover:text-pink-100 transition-colors"
                >
                  @grosscbot
                </button>
                . Бот проверит вашу подписку и вернет вас на сайт с результатом.
              </span>
              <span className="block">
                После проверки вы будете перенаправлены обратно на сайт. Если вы подписаны, вам будет предложено создать пароль и получить реферальную ссылку.
              </span>
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

