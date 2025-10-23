import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  full_name: string;
  email: string;
  telegram_tag: string;
  phone: string;
  city: string;
  referral_link: string;
  agree_to_policy: boolean;
  created_at: string;
  updated_at: string;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('api_token');
    if (token) {
      fetch('http://localhost/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    // Слушаем изменения в localStorage и события авторизации
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('api_token');
      if (!newToken) {
        setUser(null);
      }
    };

    const handleAuthChange = (event: CustomEvent) => {
      setUser(event.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hashchange', handleStorageChange);
    window.addEventListener('authChanged', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hashchange', handleStorageChange);
      window.removeEventListener('authChanged', handleAuthChange as EventListener);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('payment_success_shown'); // Очищаем флаг показа модала
    setUser(null);
    
    // Уведомляем другие компоненты о выходе
    window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
    
    window.location.hash = '#/';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/your-whatsapp-number', '_blank');
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/your-telegram-username', '_blank');
  };

  return (
    <header className="bg-gradient-to-r from-dark-900 to-dark-800 shadow-lg sticky top-0 z-40 border-b border-primary-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Место для логотипа */}
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <a href="#/" className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent hover:from-pink-300 hover:to-pink-500 transition-all duration-200">
              Gross Community
            </a>
          </div>
          
          <div className="flex items-center space-x-8">
            <a
              href="#/payment"
              className="text-white/90 hover:text-white font-semibold transition-colors duration-200"
            >
              Оплата
            </a>
            <div className="flex items-center space-x-4">
              <span className="text-white/70 text-sm">Контакты:</span>
              <button
                onClick={handleWhatsAppClick}
                className="p-2 text-gray-300 hover:text-green-400 transition-colors duration-200"
                title="WhatsApp"
              >
                {/* WhatsApp оригинальная иконка */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </button>
              <button
                onClick={handleTelegramClick}
                className="p-2 text-gray-300 hover:text-blue-400 transition-colors duration-200"
                title="Telegram"
              >
                {/* Telegram оригинальная иконка */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>
              
              {/* Место для номера телефона */}
              <div className="text-white font-medium">
                +7 (XXX) XXX-XX-XX
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        window.location.hash = '#/account';
                        window.dispatchEvent(new HashChangeEvent('hashchange'));
                      }}
                      className="text-white hover:text-pink-400 font-medium transition-colors duration-200"
                    >
                      Личный кабинет
                    </button>
                    <div className="flex items-center space-x-3">
                      <span className="text-pink-200 font-medium">
                        {user.full_name}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-red-400 font-medium transition-colors duration-200 text-sm"
                      >
                        Выйти
                      </button>
                    </div>
                  </>
                ) : (
                  <a
                    href="#/login"
                    className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg"
                  >
                    Log in
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;