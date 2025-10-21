import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { FormData } from '../App';
import TelegramModal from './TelegramModal';

interface JoinModalProps {
  onClose: () => void;
  onConsultation: () => void;
  onPayment: () => void;
}

const JoinModal: React.FC<JoinModalProps> = ({ onClose, onConsultation, onPayment }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    telegramTag: '',
    phone: '',
    city: '',
    email: '',
    referralLink: '',
    agreeToPolicy: false,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [countryCode, setCountryCode] = useState('+7');
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [userReferralLink, setUserReferralLink] = useState('');

  const countryCodes = [
    { code: '+7', country: 'RU' },
    { code: '+1', country: 'US' },
    { code: '+44', country: 'UK' },
    { code: '+49', country: 'DE' },
    { code: '+33', country: 'FR' },
  ];

  const cities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
    'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону'
  ];

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    }
    
    if (!formData.telegramTag.trim()) {
      newErrors.telegramTag = 'Введите Telegram';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Выберите город';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.agreeToPolicy) {
      newErrors.agreeToPolicy = true;
    }

    // Убираем валидацию пароля из формы регистрации

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: 'consultation' | 'payment') => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        full_name: formData.fullName,
        telegram_tag: formData.telegramTag,
        phone: `${countryCode}${formData.phone}`,
        city: formData.city,
        email: formData.email,
        referral_link: formData.referralLink,
      };

      const response = await fetch('http://localhost/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('api_token', data.token);
        console.log('Registration successful:', data);
        
        // Уведомляем Header об изменении состояния авторизации
        window.dispatchEvent(new CustomEvent('authChanged', { detail: data.user }));
        
        // Переходим к следующему шагу
        if (action === 'consultation') {
          onConsultation();
        } else {
          // Переходим на страницу оплаты
          window.location.hash = '#/payment';
          window.dispatchEvent(new HashChangeEvent('hashchange'));
          onPayment();
        }
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        alert(`Ошибка регистрации: ${errorData.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Ошибка сети. Проверьте подключение к интернету.');
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-pink-500/30 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Заполните форму ниже</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <X size={24} className="text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                ФИО *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full px-4 py-3 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none placeholder-gray-400 ${errors.fullName ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}`}
                placeholder="Введите ваше полное имя"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Тег в Telegram *
              </label>
              <input
                type="text"
                value={formData.telegramTag}
                onChange={(e) => handleInputChange('telegramTag', e.target.value)}
                className={`w-full px-4 py-3 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none placeholder-gray-400 ${errors.telegramTag ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}`}
                placeholder="@username"
              />
              {errors.telegramTag && (
                <p className="text-red-400 text-sm mt-1">{errors.telegramTag}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Реферальная ссылка
            </label>
            <input
              type="text"
              value={formData.referralLink}
              onChange={(e) => handleInputChange('referralLink', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none placeholder-gray-400"
              placeholder="Если есть"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Телефон *
            </label>
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-20 px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none cursor-pointer appearance-none pr-8"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none placeholder-gray-400 flex-1 ${errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}`}
                placeholder="Номер телефона"
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Выберите свой город *
            </label>
            <div className="relative">
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-4 py-3 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none cursor-pointer appearance-none pr-8 ${errors.city ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}`}
              >
                <option value="">Выберите город</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.city && (
              <p className="text-red-400 text-sm mt-1">Выберите город</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none placeholder-gray-400 ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}`}
              placeholder="Продублируйте email"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>


          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToPolicy"
              checked={formData.agreeToPolicy}
              onChange={(e) => handleInputChange('agreeToPolicy', e.target.checked)}
              className={`mt-1 w-5 h-5 text-pink-500 border-2 rounded focus:ring-pink-500 ${
                errors.agreeToPolicy ? 'border-red-400' : 'border-gray-600'
              }`}
            />
            <label htmlFor="agreeToPolicy" className="text-sm text-gray-300">
              Я соглашаюсь с условиями{' '}
              <a href="#" className="text-pink-400 underline hover:text-pink-300">
                политики конфиденциальности
              </a>{' '}
              и даю{' '}
              <a href="#" className="text-pink-400 underline hover:text-pink-300">
                согласие на обработку моих персональных данных
              </a>
            </label>
          </div>
          {errors.agreeToPolicy && (
            <p className="text-red-400 text-sm">Необходимо согласие с условиями</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleSubmit('consultation')}
              className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-pink-500 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 w-full"
            >
              Получить консультацию
            </button>
            <button
              onClick={() => handleSubmit('payment')}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 w-full"
            >
              Оплатить
            </button>
          </div>

          <div className="pt-2 text-sm text-pink-100">
            Уже зарегистрированы?{' '}
            <a
              href="#/login"
              className="text-pink-400 underline hover:text-pink-300"
              onClick={onClose}
            >
              Войти
            </a>
          </div>
        </div>
      </div>
      
      {showTelegramModal && (
        <TelegramModal
          onClose={() => setShowTelegramModal(false)}
          referralLink={userReferralLink}
        />
      )}
    </div>
  );
};

export default JoinModal;