import React, { useState } from 'react';
import { X, Phone, Loader } from 'lucide-react';
import { safeFetch } from '../utils/safeAsync';
import { apiUrl } from '../utils/apiBase';

interface ConsultationModalProps {
  onClose: () => void;
  userData?: {
    fullName: string;
    phone: string;
    email: string;
  };
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ onClose, userData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userData) {
      setError('Данные пользователя не найдены');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await safeFetch(apiUrl('/consultation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          full_name: userData.fullName,
          phone: userData.phone,
          email: userData.email
        })
      }, 10000);

      if (response && response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response?.json();
        setError(errorData?.message || 'Произошла ошибка при отправке заявки');
      }
    } catch (err) {
      console.error('Consultation request error:', err);
      setError('Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md shadow-2xl border border-pink-500/30">
          <div className="p-6 border-b border-pink-500/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Phone className="w-8 h-8 text-pink-400" />
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
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-white">
                Благодарим за обращение!
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                Ожидайте звонка в ближайшее время. Наш менеджер свяжется с вами для проведения консультации.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 p-4 rounded-lg border border-pink-500/30">
              <p className="text-sm text-pink-300 font-medium">
                Время ожидания: в течение 1-2 часов в рабочее время
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 w-full"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md shadow-2xl border border-pink-500/30">
        <div className="p-6 border-b border-pink-500/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Phone className="w-8 h-8 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Консультация</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <X size={24} className="text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Получить консультацию
            </h3>
            <p className="text-gray-300 text-sm">
              Наш менеджер свяжется с вами для проведения персональной консультации
            </p>
          </div>

          {userData && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-pink-500/20">
              <h4 className="text-white font-semibold mb-2">Ваши данные:</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">
                  <span className="text-pink-300">Имя:</span> {userData.fullName}
                </div>
                <div className="text-gray-300">
                  <span className="text-pink-300">Телефон:</span> {userData.phone}
                </div>
                <div className="text-gray-300">
                  <span className="text-pink-300">Email:</span> {userData.email}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !userData}
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                'Получить консультацию'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;