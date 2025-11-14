import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import ThankYouModal from '../components/ThankYouModal';
import PasswordSetupModal from '../components/PasswordSetupModal';
import TelegramModal from '../components/TelegramModal';
import JoinModal from '../components/JoinModal';
import { safeFetch, safeNavigate, safeHistoryReplace } from '../utils/safeAsync';
import { apiUrl, getApiBase } from '../utils/apiBase';

const Card: React.FC<{ title: string; value: string; note?: string }> = ({ title, value, note }) => (
  <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-900/80 to-black/80 border border-pink-500/30 shadow-[0_10px_40px_-10px_rgba(236,72,153,0.4)]">
    <div className="text-sm text-pink-200 mb-1">{title}</div>
    <div className="text-2xl font-extrabold text-white">{value}</div>
    {note && <div className="text-xs text-pink-100 mt-2">{note}</div>}
  </div>
);

const Payment: React.FC = () => {
  const [showThanks, setShowThanks] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [showPaymentRequired, setShowPaymentRequired] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [telegramTag, setTelegramTag] = useState<string | null>(null);
  const isProcessingPaymentRef = useRef(false);
  
  useEffect(() => {
    console.log('[Payment] 🔵 Component mounted, checking for return parameters...');
    
    // Инициализируем правильный API base при загрузке (на случай редиректа с оплаты)
    try {
      getApiBase(); // Инициализируем и сохраняем в sessionStorage
    } catch (e) {
      console.error('Error initializing API base:', e);
    }

    // Проверяем, вернулся ли пользователь после оплаты или проверки подписки
    // В hash-based routing параметры могут быть в hash или в search
    let isSuccessReturn = false;
    let isSubscribed = null; // null = не проверено, true = подписан, false = не подписан
    
    // Сначала проверяем hash параметры (App.tsx перенаправляет сюда)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      isSuccessReturn = hashParams.get('success') === '1';
      const subscribedParam = hashParams.get('subscribed');
      if (subscribedParam !== null) {
        isSubscribed = subscribedParam === '1';
      }
    }
    
    // Если не нашли в hash, проверяем search параметры (обычный способ)
    if (isSubscribed === null) {
      const urlParams = new URLSearchParams(window.location.search);
      isSuccessReturn = urlParams.get('success') === '1' || isSuccessReturn;
      const subscribedParam = urlParams.get('subscribed');
      if (subscribedParam !== null) {
        isSubscribed = subscribedParam === '1';
      }
    }
    
    // Также проверяем URL напрямую (на случай, если YooKassa или бот вернул нестандартный формат)
    if (isSubscribed === null) {
      const fullUrl = window.location.href;
      const subscribedMatch = fullUrl.match(/[?&]subscribed=([01])/);
      if (subscribedMatch) {
        isSubscribed = subscribedMatch[1] === '1';
      }
      if (fullUrl.includes('success=1')) {
        isSuccessReturn = true;
      }
    }
    
    console.log('[Payment] Payment return check:', {
      search: window.location.search,
      hash: window.location.hash,
      href: window.location.href,
      isSuccessReturn,
      isSubscribed,
      pathname: window.location.pathname
    });
    
    // Обрабатываем параметры subscribed (приоритет - обрабатываем сразу, если есть)
    if (isSubscribed !== null && !isProcessingPaymentRef.current) {
      console.log('[Payment] ✅ Found subscribed parameter, processing:', isSubscribed);
      isProcessingPaymentRef.current = true;
      
      // Небольшая задержка для гарантии, что компонент полностью загружен
      setTimeout(() => {
        handleBotSubscriptionResult(isSubscribed);
        
        // Очищаем URL после обработки
        setTimeout(() => {
          try {
            const newUrl = window.location.pathname + '#/payment';
            safeHistoryReplace(newUrl);
          } catch (e) {
            console.error('Error replacing URL:', e);
          } finally {
            isProcessingPaymentRef.current = false;
          }
        }, 1000);
      }, 100);
      return;
    }
    
    // Обрабатываем возврат с оплаты (если нет параметра subscribed)
    if (isSuccessReturn && !isProcessingPaymentRef.current && isSubscribed === null) {
      console.log('[Payment] Payment return detected (no subscribed param), checking subscription and user status');
      isProcessingPaymentRef.current = true;
      
      checkPaymentStatusAndShowModal(true).catch(err => {
        console.error('[Payment] Error checking payment status:', err);
        setShowPasswordSetup(true);
      });
      
      // Очищаем URL после обработки
      setTimeout(() => {
        try {
          const newUrl = window.location.pathname + '#/payment';
          safeHistoryReplace(newUrl);
        } catch (e) {
          console.error('Error replacing URL:', e);
        } finally {
          isProcessingPaymentRef.current = false;
        }
      }, 1000);
    }
  }, []);

  // Проверяет статус оплаты и показывает соответствующий модал
  const checkPaymentStatusAndShowModal = async (forceShow: boolean = false, retryCount: number = 0) => {
    const MAX_RETRIES = 3; // Максимум 3 попытки
    
    const token = localStorage.getItem('api_token');
    if (!token) {
      console.error('No auth token found');
      // Даже без токена показываем модал для ввода пароля при возврате с оплаты
      if (forceShow) {
        setShowPasswordSetup(true);
      }
      return;
    }

    // Небольшая задержка для того, чтобы webhook успел обработать платеж
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Проверяем данные пользователя
    const userResponse = await safeFetch(apiUrl('/user'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }, 10000);
    
    if (!userResponse || !userResponse.ok) {
      console.error('Failed to fetch user data:', userResponse?.status);
      
      // Если превышено количество попыток или принудительно - показываем модал в любом случае
      if (retryCount >= MAX_RETRIES || forceShow) {
        console.warn('Max retries reached or forced, showing password setup modal. Retry count:', retryCount, 'Force show:', forceShow);
        setShowPasswordSetup(true);
        return;
      }
      
      // Повторяем попытку через секунду
      setTimeout(() => checkPaymentStatusAndShowModal(forceShow, retryCount + 1), 1000);
      return;
    }

    try {
      const userData = await userResponse.json();
      setUserId(userData.id);
      setTelegramTag(userData.telegram_tag || null);

      // Если forceShow=true, значит мы вернулись с оплаты
      if (forceShow) {
        console.log('[Payment] Force show modal, userData:', { 
          id: userData.id, 
          has_password: userData.has_password,
          telegram_tag: userData.telegram_tag 
        });
        
        // Проверяем подписку на Telegram группу, если есть telegram_tag
        if (userData.telegram_tag) {
          console.log('[Payment] Checking subscription for telegram_tag:', userData.telegram_tag);
          await checkSubscriptionAndShowModal(userData.telegram_tag, userData);
        } else {
          // Если нет telegram_tag, показываем модалку пароля по умолчанию
          console.log('[Payment] No telegram_tag, showing password setup modal');
          if (userData.has_password) {
            // Если пароль уже есть, показываем Telegram модал с реферальной ссылкой
            const apiBase = getApiBase();
            const correctOrigin = apiBase.replace(/\/$/, '') || window.location.origin;
            const refLink = userData.referral_link || `${correctOrigin}?ref=${userData.id}`;
            setReferralLink(refLink);
            setShowTelegramModal(true);
          } else {
            setShowPasswordSetup(true);
          }
        }
        
        // Очищаем старый флаг из localStorage
        localStorage.removeItem('payment_success_shown');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('payment_success_shown');
      // При ошибке парсинга показываем модал для ввода пароля
      if (forceShow) {
        setShowPasswordSetup(true);
      }
    }
  };

  // Обрабатывает результат проверки подписки от бота
  const handleBotSubscriptionResult = async (subscribed: boolean) => {
    console.log('[Payment] 🔄 handleBotSubscriptionResult called with subscribed:', subscribed);
    
    const token = localStorage.getItem('api_token');
    console.log('[Payment] Token exists:', !!token);
    
    if (!token) {
      console.warn('[Payment] ⚠️ No auth token found');
      if (subscribed) {
        // Если подписан, но нет токена - показываем модалку регистрации
        console.log('[Payment] Showing registration modal (subscribed but no token)');
        setShowJoinModal(true);
      } else {
        // Если не подписан - показываем сообщение об оплате
        console.log('[Payment] Showing payment required modal (not subscribed and no token)');
        setShowPaymentRequired(true);
      }
      return;
    }

    // Получаем данные пользователя
    try {
      const userResponse = await safeFetch(apiUrl('/user'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }, 10000);

      if (userResponse && userResponse.ok) {
        const userData = await userResponse.json();
        setUserId(userData.id);
        setTelegramTag(userData.telegram_tag || null);

        if (subscribed) {
          // Пользователь подписан - показываем окно регистрации, затем пароль, затем реферальную ссылку
          console.log('[Payment] ✅ User is subscribed, showing registration flow');
          console.log('[Payment] User data:', { 
            id: userData.id, 
            has_password: userData.has_password,
            referral_link: userData.referral_link 
          });
          
          if (userData.has_password) {
            // Если пароль уже установлен - показываем Telegram модал с реферальной ссылкой
            console.log('[Payment] Password exists, showing Telegram modal with referral link');
            const apiBase = getApiBase();
            const correctOrigin = apiBase.replace(/\/$/, '') || window.location.origin;
            const refLink = userData.referral_link || `${correctOrigin}?ref=${userData.id}`;
            setReferralLink(refLink);
            setShowTelegramModal(true);
          } else {
            // Пароль не установлен - показываем модалку регистрации, затем пароль
            console.log('[Payment] ⚠️ Password not set, showing registration modal first');
            setUserId(userData.id);
            setShowJoinModal(true);
          }
        } else {
          // Пользователь не подписан - показываем сообщение об оплате
          console.log('[Payment] ❌ User is not subscribed, showing payment required message');
          setShowPaymentRequired(true);
        }
      } else {
        // Ошибка получения данных пользователя
        console.error('[Payment] Failed to fetch user data:', userResponse?.status);
        if (subscribed) {
          setShowJoinModal(true);
        } else {
          setShowPaymentRequired(true);
        }
      }
    } catch (error) {
      console.error('[Payment] Error fetching user data:', error);
      if (subscribed) {
        setShowJoinModal(true);
      } else {
        setShowPaymentRequired(true);
      }
    }
  };

  // Проверяет подписку пользователя на Telegram группу
  const checkSubscriptionAndShowModal = async (telegramUsername: string, userData: any) => {
    try {
      console.log('[Payment] Checking subscription for:', telegramUsername);
      
      // Убираем @ из username, если он есть
      const cleanUsername = telegramUsername.replace('@', '');
      
      const subscriptionResponse = await safeFetch(apiUrl('/check-subscription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('api_token')}`
        },
        body: JSON.stringify({
          telegram_username: cleanUsername
        })
      }, 10000);

      if (!subscriptionResponse || !subscriptionResponse.ok) {
        console.error('Failed to check subscription:', subscriptionResponse?.status);
        // В случае ошибки проверки показываем модалку пароля
        if (userData.has_password) {
          const apiBase = getApiBase();
          const correctOrigin = apiBase.replace(/\/$/, '') || window.location.origin;
          const refLink = userData.referral_link || `${correctOrigin}?ref=${userData.id}`;
          setReferralLink(refLink);
          setShowTelegramModal(true);
        } else {
          setShowPasswordSetup(true);
        }
        return;
      }

      const subscriptionData = await subscriptionResponse.json();
      console.log('[Payment] Subscription check result:', subscriptionData);

      if (subscriptionData.success && subscriptionData.subscribed) {
        // Пользователь подписан - показываем окно пароля (если пароля нет) или реферальную ссылку
        console.log('[Payment] User is subscribed, showing password setup or referral link');
        
        if (userData.has_password) {
          // Если пароль уже установлен - показываем Telegram модал с реферальной ссылкой
          const apiBase = getApiBase();
          const correctOrigin = apiBase.replace(/\/$/, '') || window.location.origin;
          const refLink = userData.referral_link || `${correctOrigin}?ref=${userData.id}`;
          setReferralLink(refLink);
          setShowTelegramModal(true);
        } else {
          // Пароль не установлен - показываем модалку пароля
          setShowPasswordSetup(true);
        }
      } else {
        // Пользователь не подписан - показываем сообщение о необходимости подписки
        console.log('[Payment] User is not subscribed, showing subscription prompt');
        setShowSubscriptionPrompt(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // В случае ошибки показываем модалку пароля
      if (userData.has_password) {
        const apiBase = getApiBase();
        const correctOrigin = apiBase.replace(/\/$/, '') || window.location.origin;
        const refLink = userData.referral_link || `${correctOrigin}?ref=${userData.id}`;
        setReferralLink(refLink);
        setShowTelegramModal(true);
      } else {
        setShowPasswordSetup(true);
      }
    }
  };


  const triggerPayment = async () => {
    const response = await safeFetch(apiUrl('/payments'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('api_token')}`
      },
      body: JSON.stringify({ amount: 3500 })
    }, 15000);
    
    if (response && response.ok) {
      try {
        const data = await response.json();
        if (data.confirmation_url) {
          safeNavigate(data.confirmation_url);
        } else {
          alert('Не удалось получить ссылку для оплаты');
        }
      } catch (error) {
        console.error('Error parsing payment response:', error);
        alert('Ошибка при обработке ответа платежной системы');
      }
    } else {
      alert('Не удалось создать платеж. Проверьте подключение к интернету.');
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-950 via-purple-950 to-pink-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-8">
          Покупка вступления
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Стоимость пакета" value="3 500 ₽" />
          <Card title="Партнерская программа" value="40% (1 400 ₽)" note="Процент от стоимости пакета" />
          <Card title="Налоги к выплате с партнеров" value="35% (490 ₽)" />
          <Card title="Налог (УСН)" value="7% (245 ₽)" />
          <Card title="Эквайринг" value="2.5% (87.5 ₽)" />
          <Card title="Итого прямые затраты" value="2 222,5 ₽" />
        </div>

        <div className="mt-8 rounded-2xl border border-pink-500/30 bg-black/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Прибыль без операционных</h2>
            <div className="text-3xl font-extrabold text-pink-300">1 277,50 ₽</div>
          </div>
          <p className="text-pink-100 text-sm">С одного партнера</p>
        </div>

        <h2 className="mt-12 text-2xl font-bold">Выплаты партнерам</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-pink-500/30 bg-black/40">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-pink-200 border-b border-white/10">
                <th className="py-3 px-4">Уровень</th>
                <th className="py-3 px-4">%</th>
                <th className="py-3 px-4">Выплата (минус 13%)</th>
              </tr>
            </thead>
            <tbody className="text-pink-100">
              <tr className="border-b border-white/5"><td className="py-3 px-4">Первый</td><td className="py-3 px-4">20%</td><td className="py-3 px-4">609,90 ₽</td></tr>
              <tr className="border-b border-white/5"><td className="py-3 px-4">Второй</td><td className="py-3 px-4">10%</td><td className="py-3 px-4">304,50 ₽</td></tr>
              <tr className="border-b border-white/5"><td className="py-3 px-4">Третий</td><td className="py-3 px-4">5%</td><td className="py-3 px-4">152,25 ₽</td></tr>
              <tr className="border-b border-white/5"><td className="py-3 px-4">Четвертый</td><td className="py-3 px-4">3%</td><td className="py-3 px-4">91,35 ₽</td></tr>
              <tr><td className="py-3 px-4">Пятый</td><td className="py-3 px-4">2%</td><td className="py-3 px-4">60,90 ₽</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 border border-pink-500/30 bg-gradient-to-br from-pink-600/20 to-purple-700/20">
            <h3 className="text-lg font-semibold mb-2">Как оплатить</h3>
            <p className="text-pink-100 text-sm">После нажатия на кнопку «Перейти к оплате», вы будете перенаправлены на защищенную страницу. Оплата банковской картой. Чек придет на email.</p>
          </div>
          <div className="rounded-2xl p-6 border border-pink-500/30 bg-gradient-to-br from-pink-600/20 to-purple-700/20">
            <h3 className="text-lg font-semibold mb-2">Возврат</h3>
            <p className="text-pink-100 text-sm">Если произошла ошибка, напишите в поддержку — мы оперативно поможем и вернем платеж при необходимости.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button onClick={triggerPayment} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
            Перейти к оплате
          </button>
          <a href="#/" className="text-pink-200 hover:text-pink-100 underline">
            Вернуться на главную
          </a>
        </div>
        {showThanks && <ThankYouModal onClose={() => setShowThanks(false)} />}
        {showPasswordSetup && (
          <PasswordSetupModal 
            onClose={() => setShowPasswordSetup(false)} 
            userId={userId || 0}
            onPasswordSet={(refLink: string) => {
              // После создания пароля показываем Telegram модал с реферальной ссылкой
              setShowPasswordSetup(false);
              setReferralLink(refLink);
              setShowTelegramModal(true);
            }}
          />
        )}
        {showTelegramModal && (
          <TelegramModal
            onClose={() => setShowTelegramModal(false)}
            referralLink={referralLink}
          />
        )}
        {showSubscriptionPrompt && (
          <SubscriptionPromptModal
            onClose={() => setShowSubscriptionPrompt(false)}
            onJoin={() => {
              window.open('https://t.me/+tTW-bBfMvyI0ZTE1', '_blank', 'noopener,noreferrer');
            }}
            onCheckAgain={async () => {
              if (telegramTag) {
                const token = localStorage.getItem('api_token');
                if (token) {
                  const userResponse = await safeFetch(apiUrl('/user'), {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Accept': 'application/json'
                    }
                  }, 10000);
                  if (userResponse && userResponse.ok) {
                    const userData = await userResponse.json();
                    setShowSubscriptionPrompt(false);
                    await checkSubscriptionAndShowModal(userData.telegram_tag, userData);
                  }
                }
              }
            }}
            telegramTag={telegramTag}
          />
        )}
        {showPaymentRequired && (
          <PaymentRequiredModal
            onClose={() => setShowPaymentRequired(false)}
            onPayment={() => {
              setShowPaymentRequired(false);
              triggerPayment();
            }}
          />
        )}
        {showJoinModal && (
          <JoinModal
            onClose={() => setShowJoinModal(false)}
            mode="subscribed"
            onContinue={() => {
              setShowJoinModal(false);
              // После регистрации показываем модалку для создания пароля
              const token = localStorage.getItem('api_token');
              if (token) {
                // Получаем userId из токена или из состояния
                safeFetch(apiUrl('/user'), {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                  }
                }, 10000).then(userResponse => {
                  if (userResponse && userResponse.ok) {
                    return userResponse.json();
                  }
                  return null;
                }).then(userData => {
                  if (userData) {
                    setUserId(userData.id);
                    setShowPasswordSetup(true);
                  }
                }).catch(err => {
                  console.error('Error fetching user after registration:', err);
                  // Показываем модалку пароля в любом случае
                  setShowPasswordSetup(true);
                });
              } else {
                // Если токена нет, все равно показываем модалку пароля
                setShowPasswordSetup(true);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

// Модальное окно для сообщения о необходимости оплаты
const PaymentRequiredModal: React.FC<{ 
  onClose: () => void; 
  onPayment: () => void;
}> = ({ onClose, onPayment }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md shadow-2xl border border-pink-500/30">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Требуется оплата</h2>
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
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Вы не подписаны на группу
              </h3>
              <p className="text-gray-300 text-sm">
                Для доступа к сообществу необходимо оплатить подписку
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-pink-500/20">
              <p className="text-white text-sm mb-4">
                После оплаты вы получите доступ к закрытому Telegram сообществу и сможете создать пароль для входа в личный кабинет.
              </p>
            </div>

            <div className="text-center space-y-3">
              <button
                onClick={onPayment}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Перейти к оплате</span>
                <ExternalLink size={18} />
              </button>
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

// Модальное окно для запроса подписки на группу
const SubscriptionPromptModal: React.FC<{ 
  onClose: () => void; 
  onJoin: () => void;
  onCheckAgain?: () => void;
  telegramTag?: string | null;
}> = ({ onClose, onJoin, onCheckAgain, telegramTag }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckAgain = async () => {
    if (onCheckAgain) {
      setIsChecking(true);
      try {
        await onCheckAgain();
      } finally {
        setIsChecking(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md shadow-2xl border border-pink-500/30">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Подписка на группу</h2>
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
                <span className="text-2xl">📢</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Вам необходимо подписаться на группу
              </h3>
              <p className="text-gray-300 text-sm">
                Для завершения регистрации присоединитесь к нашему Telegram сообществу
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-pink-500/20">
              <p className="text-white text-sm mb-4">
                После присоединения к группе нажмите кнопку "Проверить снова", чтобы продолжить регистрацию.
              </p>
            </div>

            <div className="text-center space-y-3">
              <button
                onClick={onJoin}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Присоединиться к группе</span>
                <ExternalLink size={18} />
              </button>
              {onCheckAgain && telegramTag && (
                <button
                  onClick={handleCheckAgain}
                  disabled={isChecking}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                >
                  {isChecking ? 'Проверка...' : 'Проверить снова'}
                </button>
              )}
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

export default Payment;


