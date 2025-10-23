import React, { useState, useEffect } from 'react';
import ThankYouModal from '../components/ThankYouModal';
import PasswordSetupModal from '../components/PasswordSetupModal';
import TelegramModal from '../components/TelegramModal';

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
  const [referralLink, setReferralLink] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    // Проверяем, вернулся ли пользователь после оплаты
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
      // Проверяем, не показывали ли уже модал для этого пользователя
      const hasShownModal = localStorage.getItem('payment_success_shown');
      if (!hasShownModal) {
        checkUserPasswordStatus();
        // Помечаем, что модал уже показан
        localStorage.setItem('payment_success_shown', 'true');
      }
      // Убираем параметр из URL чтобы не показывать модал при повторных заходах
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkUserPasswordStatus = async () => {
    try {
      const response = await fetch('http://localhost/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserId(userData.id);
        
        // Показываем форму создания пароля только если пароль еще не установлен
        if (!userData.has_password) {
          setShowPasswordSetup(true);
        } else {
          // Если пароль уже есть, показываем Telegram модал
          setReferralLink(userData.referral_link || `${window.location.origin}?ref=${userData.id}`);
          setShowTelegramModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const triggerPayment = async () => {
    try {
      const res = await fetch('http://localhost/api/payments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('api_token')}`
        },
        body: JSON.stringify({ amount: 3500 }),
      });
      const data = await res.json();
      if (res.ok && data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        alert('Не удалось создать платеж');
      }
    } catch (e) {
      alert('Ошибка сети при создании платежа');
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
        {showPasswordSetup && userId && (
          <PasswordSetupModal 
            onClose={() => setShowPasswordSetup(false)} 
            userId={userId} 
          />
        )}
        {showTelegramModal && (
          <TelegramModal
            onClose={() => setShowTelegramModal(false)}
            referralLink={referralLink}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;


