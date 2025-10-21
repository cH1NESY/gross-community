import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface TelegramModalProps {
  onClose: () => void;
  referralLink: string;
}

const TelegramModal: React.FC<TelegramModalProps> = ({ onClose, referralLink }) => {
  const telegramLink = 'https://t.me/+aFY9v4vcCOoyMTUy';

  const handleJoinTelegram = () => {
    window.open(telegramLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md shadow-2xl border border-pink-500/30">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Добро пожаловать в сообщество!</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <X size={24} className="text-gray-300" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Регистрация завершена успешно!
              </h3>
              <p className="text-gray-300 text-sm">
                Теперь вы можете присоединиться к нашему Telegram-чату и начать общение с участниками сообщества.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-pink-500/20">
              <h4 className="text-white font-semibold mb-2">Ваша реферальная ссылка:</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                  className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded transition-colors"
                >
                  Копировать
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Поделитесь этой ссылкой с друзьями и получайте вознаграждение за каждого приглашенного!
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handleJoinTelegram}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Присоединиться к Telegram-чату</span>
                <ExternalLink size={18} />
              </button>
              <p className="text-gray-400 text-xs mt-2">
                Нажмите кнопку, чтобы перейти в наш Telegram-чат
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={onClose}
                className="text-pink-400 hover:text-pink-300 text-sm underline"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramModal;
