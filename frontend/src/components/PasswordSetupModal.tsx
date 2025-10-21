import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import TelegramModal from './TelegramModal';

interface PasswordSetupModalProps {
  onClose: () => void;
  userId: number;
}

const PasswordSetupModal: React.FC<PasswordSetupModalProps> = ({ onClose, userId }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{password?: string, confirmPassword?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  const validateForm = () => {
    const newErrors: {password?: string, confirmPassword?: string} = {};
    
    if (!password || password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/api/setup-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('api_token')}`
        },
        body: JSON.stringify({
          password: password,
          password_confirmation: confirmPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReferralLink(data.referral_link);
        setShowTelegramModal(true);
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md shadow-2xl border border-pink-500/30">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Создайте пароль</h2>
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
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Оплата прошла успешно!
                </h3>
                <p className="text-gray-300 text-sm">
                  Теперь создайте пароль для входа в личный кабинет
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Пароль *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none placeholder-gray-400 ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}`}
                    placeholder="Минимум 6 символов"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Подтверждение пароля *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none placeholder-gray-400 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}`}
                    placeholder="Повторите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Создание...' : 'Создать пароль'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTelegramModal && (
        <TelegramModal
          onClose={() => {
            setShowTelegramModal(false);
            onClose();
          }}
          referralLink={referralLink}
        />
      )}
    </>
  );
};

export default PasswordSetupModal;
