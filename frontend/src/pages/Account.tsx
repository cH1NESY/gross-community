import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  telegram_tag: string;
  referral_link: string;
  agree_to_policy: boolean;
  created_at: string;
  updated_at: string;
}

const Account: React.FC = () => {
  const [active, setActive] = useState<'profile' | 'terms' | 'referrals' | 'rewards' | 'payout'>('profile');
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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
          Личный кабинет
        </h1>
        <p className="mt-4 text-pink-100 max-w-2xl">
          Добро пожаловать! Здесь вы можете обновить профиль, посмотреть статус заявок и связаться с менеджером сообщества.
        </p>

        {/* Навигация по разделам */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { k: 'profile', label: 'Профиль' },
            { k: 'terms', label: 'Условия партнерской программы' },
            { k: 'referrals', label: 'Реферальная программа' },
            { k: 'rewards', label: 'Вознаграждение' },
            { k: 'payout', label: 'Вывод денежных средств' },
          ].map((item) => (
            <button
              key={item.k}
              onClick={() => setActive(item.k as any)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                active === (item.k as any)
                  ? 'border-pink-500 bg-pink-500/10 text-pink-200'
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Контент разделов */}
        {active === 'profile' && (
          <div className="mt-8 rounded-2xl border border-pink-500/20 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Профиль</h2>
            {loading ? (
              <p className="text-pink-100 text-sm">Загрузка...</p>
            ) : user ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-pink-200 mb-1">Имя</label>
                    <input 
                      value={user.full_name || ''} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500" 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 mb-1">Email</label>
                    <input 
                      value={user.email || ''} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500" 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 mb-1">Телефон</label>
                    <input 
                      value={user.phone || ''} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500" 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 mb-1">Город</label>
                    <input 
                      value={user.city || ''} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500" 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 mb-1">Telegram</label>
                    <input 
                      value={user.telegram_tag || ''} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500" 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-pink-200 mb-1">Дата регистрации</label>
                    <input 
                      value={user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : ''} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500" 
                      readOnly 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-pink-200 mb-1">Реферальная ссылка</label>
                  <input 
                    value={user.referral_link || 'Не указана'} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500" 
                    readOnly 
                  />
                </div>
              </div>
            ) : (
              <p className="text-pink-100 text-sm">Не удалось загрузить данные профиля</p>
            )}
          </div>
        )}

        {active === 'terms' && (
          <div className="mt-8 rounded-2xl border border-pink-500/20 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-3">Условия партнерской программы</h2>
            <p className="text-pink-100 text-sm">Раздел в разработке.</p>
          </div>
        )}

        {active === 'referrals' && (
          <div className="mt-8 rounded-2xl border border-pink-500/20 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Реферальная программа</h2>
            <p className="text-pink-100 text-sm mb-4">Здесь отображаются все зарегистрированные по вашей ссылке участницы до 5 уровня.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-pink-200 border-b border-white/10">
                    <th className="py-2 pr-4">Имя</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Город</th>
                    <th className="py-2 pr-4">Уровень</th>
                    <th className="py-2 pr-4">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Подключим бэкенд позже; пока пустая таблица */}
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-pink-100">Пока нет данных</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === 'rewards' && (
          <div className="mt-8 rounded-2xl border border-pink-500/20 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Вознаграждение</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-pink-200 border-b border-white/10">
                    <th className="py-2 pr-4">Дата</th>
                    <th className="py-2 pr-4">Описание</th>
                    <th className="py-2 pr-4">Сумма</th>
                    <th className="py-2 pr-4">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-pink-100">Начислений пока нет</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === 'payout' && (
          <div className="mt-8 rounded-2xl border border-pink-500/20 bg-black/30 p-6 max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Заявка на вывод средств</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-pink-200 mb-1">Сумма, ₽</label>
                <input type="number" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Например, 5000"/>
              </div>
              <div>
                <label className="block text-sm text-pink-200 mb-1">Период</label>
                <input type="month" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 outline-none"/>
              </div>
              <div>
                <label className="block text-sm text-pink-200 mb-1">Способ вывода</label>
                <select className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 outline-none">
                  <option>Банковская карта</option>
                  <option>Юр. лицо (реквизиты)</option>
                  <option>Другое</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-pink-200 mb-1">Реквизиты</label>
                <textarea className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 outline-none" rows={4} placeholder="Укажите реквизиты для перевода"></textarea>
              </div>
              <button type="button" className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">Отправить заявку</button>
            </form>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-pink-500/20 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-3">Поддержка</h2>
            <p className="text-pink-100 text-sm">Если возникли вопросы — напишите менеджеру сообщества, мы поможем.</p>
            <div className="mt-4 flex gap-3">
              <a href="https://t.me/your-telegram-username" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-pink-100 px-4 py-2 rounded-lg border border-white/20 transition-all">Telegram</a>
              <a href="mailto:support@example.com" className="bg-white/10 hover:bg-white/20 text-pink-100 px-4 py-2 rounded-lg border border-white/20 transition-all">Email</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;


