import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface ThankYouModalProps {
  onClose: () => void;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ onClose }) => {
  const handleTelegramClick = () => {
    window.open('https://t.me/your-telegram-chat', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-lg shadow-2xl border border-pink-500/30">
        <div className="p-6 border-b border-pink-500/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Спасибо!</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <X size={24} className="text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-6 text-center space-y-6">
          <div className="space-y-4">
            <p className="text-lg text-white">
              Благодарим за твой выбор и ждём тебя в комьюнити!
            </p>
            <p className="text-gray-300">
              В ближайшее время с вами свяжется менеджер CLUB 500.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300">
              Чтобы быть в курсе новостей и событий CLUB 500, подпишись на наш канал в Telegram.
            </p>
            
            <button
              onClick={handleTelegramClick}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 w-full inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.539-.44.67-.89.42l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.49.24l.17-2.42 4.46-4.03c.19-.17-.04-.27-.3-.1L9.28 13.47l-2.38-.75c-.52-.16-.53-.52.11-.77l9.3-3.58c.43-.16.81.1.67.73z"/>
              </svg>
              <span>Подписаться</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-lg border border-pink-500/20">
            <img
              src="https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Telegram Chat"
              className="w-32 h-32 mx-auto rounded-lg object-cover mb-4"
            />
            <p className="text-sm text-gray-300">
              Присоединяйтесь к нашему телеграм-сообществу
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;