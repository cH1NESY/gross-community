import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/apiBase';

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

interface Referral {
  id: number;
  name: string;
  email: string;
  telegram_tag: string;
  city: string;
  joined_at: string;
  commission_rate: number;
}

interface ReferralLevel {
  level: number;
  commission_rate: number;
  count: number;
  referrals: Referral[];
}

interface Earning {
  id: number;
  description: string;
  amount: number;
  commission_rate?: number;
  status: string;
  created_at: string;
  approved_at?: string;
  referral_name?: string;
}

interface EarningsData {
  referral: Earning[];
  bonus: Earning[];
  manual: Earning[];
}

interface Balance {
  total_earned: number;
  available_balance: number;
  pending_balance: number;
  withdrawn_total: number;
}

interface Withdrawal {
  id: number;
  amount: number;
  payment_method: string;
  payment_details: any;
  status: string;
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
}

interface PaymentMethod {
  name: string;
  description: string;
  fields: Record<string, string>;
}

const Account: React.FC = () => {
  const DEFAULT_METHODS: Record<string, PaymentMethod> = {
    card: {
      name: 'Банковская карта',
      description: 'Вывод на банковскую карту',
      fields: {
        card_number: 'Номер карты',
        cardholder_name: 'Имя держателя карты',
        bank: 'Банк',
      },
    },
    bank_account: {
      name: 'Банковский счет',
      description: 'Вывод на банковский счет',
      fields: {
        account_number: 'Номер счета',
        bank_name: 'Название банка',
        bik: 'БИК',
      },
    },
    qiwi: {
      name: 'QIWI Кошелек',
      description: 'Вывод на QIWI кошелек',
      fields: {
        phone: 'Номер телефона',
        wallet_id: 'ID кошелька',
      },
    },
    yoomoney: {
      name: 'ЮMoney',
      description: 'Вывод на ЮMoney кошелек',
      fields: {
        wallet_number: 'Номер кошелька',
        phone: 'Номер телефона',
      },
    },
  };
  const [active, setActive] = useState<'profile' | 'terms' | 'referrals' | 'rewards' | 'payout'>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Данные для реферальной программы
  const [referrals, setReferrals] = useState<ReferralLevel[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  
  // Данные для вознаграждений
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  
  // Данные для выводов
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>(DEFAULT_METHODS);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  // DEFAULT_METHODS перенесён выше, чтобы использовать его в инициализации состояний
  
  // Форма для вывода средств
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    payment_method: '',
    payment_details: {} as Record<string, string>,
  });
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [withdrawalSuccessMsg, setWithdrawalSuccessMsg] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('api_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadUserData = async () => {
    const token = localStorage.getItem('api_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('/user'), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferrals = async () => {
    setReferralsLoading(true);
    try {
      const response = await fetch(apiUrl('/referrals'), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setReferrals(data.data);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setReferralsLoading(false);
    }
  };

  const loadEarnings = async () => {
    setEarningsLoading(true);
    try {
      const response = await fetch(apiUrl('/earnings'), { headers: getAuthHeaders() });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('Earnings request failed', response.status, text);
        setEarnings({ referral: [], bonus: [], manual: [] });
        return;
      }
      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Earnings JSON parse error:', e);
        setEarnings({ referral: [], bonus: [], manual: [] });
        return;
      }
      if (data && data.success) {
        const safeData: EarningsData = {
          referral: Array.isArray(data.data?.referral) ? data.data.referral : [],
          bonus: Array.isArray(data.data?.bonus) ? data.data.bonus : [],
          manual: Array.isArray(data.data?.manual) ? data.data.manual : [],
        };
        setEarnings(safeData);
        if (data.balance) {
          setBalance({
            total_earned: Number(data.balance.total_earned || 0),
            available_balance: Number(data.balance.available_balance || 0),
            pending_balance: Number(data.balance.pending_balance || 0),
            withdrawn_total: Number(data.balance.withdrawn_total || 0),
          });
        }
      } else {
        setEarnings({ referral: [], bonus: [], manual: [] });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setEarnings({ referral: [], bonus: [], manual: [] });
    } finally {
      setEarningsLoading(false);
    }
  };

  const loadWithdrawals = async () => {
    setWithdrawalsLoading(true);
    try {
      const [withdrawalsResponse, methodsResponse] = await Promise.all([
        fetch(apiUrl('/withdrawals'), {
          headers: getAuthHeaders(),
        }),
        fetch(apiUrl('/withdrawals/payment-methods'), {
          headers: getAuthHeaders(),
        })
      ]);

      const withdrawalsData = await withdrawalsResponse.json();
      const methodsData = await methodsResponse.json();

      if (withdrawalsData.success) {
        setWithdrawals(withdrawalsData.data);
        setBalance(withdrawalsData.balance);
      }

      if (methodsData.success && methodsData.data && Object.keys(methodsData.data).length > 0) {
        setPaymentMethods(methodsData.data);
      } else {
        setPaymentMethods(DEFAULT_METHODS);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setPaymentMethods(DEFAULT_METHODS);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWithdrawal(true);

    try {
      const response = await fetch(apiUrl('/withdrawals'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(withdrawalForm),
      });

      const data = await response.json();

      if (data.success) {
        setWithdrawalSuccessMsg('Заявка на вывод средств выполнена. Средства списаны.');
        setWithdrawalForm({ amount: '', payment_method: '', payment_details: {} });
        loadWithdrawals(); // Перезагружаем данные
      } else {
        alert(data.message || 'Ошибка при создании заявки');
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      alert('Ошибка сети. Попробуйте еще раз.');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (active === 'referrals') {
      loadReferrals();
    } else if (active === 'rewards') {
      loadEarnings();
    } else if (active === 'payout') {
      loadWithdrawals();
    }
  }, [active]);

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
            
            {referralsLoading ? (
              <p className="text-pink-100 text-sm">Загрузка...</p>
            ) : (
              <div className="space-y-6">
                {referrals.map((level) => (
                  <div key={level.level} className="border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Уровень {level.level} ({level.count} чел.) - {level.commission_rate}% комиссии
                    </h3>
                    {level.referrals.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-pink-200 border-b border-white/10">
                              <th className="py-2 pr-4">Имя</th>
                              <th className="py-2 pr-4">Email</th>
                              <th className="py-2 pr-4">Telegram</th>
                              <th className="py-2 pr-4">Город</th>
                              <th className="py-2 pr-4">Дата регистрации</th>
                            </tr>
                          </thead>
                          <tbody>
                            {level.referrals.map((referral) => (
                              <tr key={referral.id} className="border-b border-white/5">
                                <td className="py-2 pr-4">{referral.name}</td>
                                <td className="py-2 pr-4">{referral.email}</td>
                                <td className="py-2 pr-4">{referral.telegram_tag}</td>
                                <td className="py-2 pr-4">{referral.city}</td>
                                <td className="py-2 pr-4">{referral.joined_at}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-pink-100 text-sm">Пока нет рефералов этого уровня</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {active === 'rewards' && (
          <div className="mt-8 rounded-2xl border border-pink-500/20 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Вознаграждение</h2>
            
            {balance && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm text-pink-200 mb-1">Общий доход</h3>
                  <p className="text-lg font-semibold">{(balance?.total_earned ?? 0).toLocaleString()} ₽</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm text-pink-200 mb-1">Доступно</h3>
                  <p className="text-lg font-semibold text-green-400">{(balance?.available_balance ?? 0).toLocaleString()} ₽</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm text-pink-200 mb-1">Ожидает</h3>
                  <p className="text-lg font-semibold text-yellow-400">{(balance?.pending_balance ?? 0).toLocaleString()} ₽</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm text-pink-200 mb-1">Выведено</h3>
                  <p className="text-lg font-semibold">{(balance?.withdrawn_total ?? 0).toLocaleString()} ₽</p>
                </div>
              </div>
            )}

            {earningsLoading ? (
              <p className="text-pink-100 text-sm">Загрузка...</p>
            ) : earnings ? (
              <div className="space-y-6">
                {/* Реферальные начисления */}
                {(earnings.referral?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Реферальные начисления</h3>
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
                          {earnings.referral!.map((earning) => (
                            <tr key={earning.id} className="border-b border-white/5">
                              <td className="py-2 pr-4">{earning.created_at}</td>
                              <td className="py-2 pr-4">{earning.description}</td>
                              <td className="py-2 pr-4">{Number(earning.amount ?? 0).toLocaleString()} ₽</td>
                              <td className="py-2 pr-4">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  earning.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                  earning.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {earning.status === 'approved' ? 'Одобрено' :
                                   earning.status === 'pending' ? 'Ожидает' : 'Отклонено'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {(earnings.referral?.length ?? 0) === 0 && (
                  <p className="text-pink-100 text-sm">Начислений пока нет</p>
                )}
              </div>
            ) : (
              <p className="text-pink-100 text-sm">Не удалось загрузить данные</p>
            )}
          </div>
        )}

        {active === 'payout' && (
          <div className="mt-8 rounded-2xl border border-pink-500/20 bg-black/30 p-6 max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Вывод денежных средств</h2>
            {withdrawalSuccessMsg && (
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-900/30 text-green-200 px-4 py-3">
                {withdrawalSuccessMsg}
              </div>
            )}
            
            {balance && (
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-2">Ваш баланс</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-pink-200">Доступно для вывода</p>
                    <p className="text-xl font-semibold text-green-400">{balance.available_balance.toLocaleString()} ₽</p>
                  </div>
                  <div>
                    <p className="text-sm text-pink-200">Ожидает одобрения</p>
                    <p className="text-xl font-semibold text-yellow-400">{balance.pending_balance.toLocaleString()} ₽</p>
                  </div>
                  <div>
                    <p className="text-sm text-pink-200">Уже выведено</p>
                    <p className="text-xl font-semibold">{balance.withdrawn_total.toLocaleString()} ₽</p>
                  </div>
                </div>
              </div>
            )}

            {/* История заявок */}
            {withdrawals.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">История заявок</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-pink-200 border-b border-white/10">
                        <th className="py-2 pr-4">Дата</th>
                        <th className="py-2 pr-4">Сумма</th>
                        <th className="py-2 pr-4">Способ</th>
                        <th className="py-2 pr-4">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b border-white/5">
                          <td className="py-2 pr-4">{withdrawal.created_at}</td>
                          <td className="py-2 pr-4">{Number(withdrawal.amount ?? 0).toLocaleString()} ₽</td>
                          <td className="py-2 pr-4">
                            {paymentMethods[withdrawal.payment_method]?.name || withdrawal.payment_method}
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              withdrawal.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                              withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {withdrawal.status === 'completed' ? 'Выполнено' :
                               withdrawal.status === 'processing' ? 'Обрабатывается' :
                               withdrawal.status === 'pending' ? 'Ожидает' : 'Отклонено'}
                            </span>
                            {withdrawal.rejection_reason && (
                              <p className="text-xs text-red-400 mt-1">{withdrawal.rejection_reason}</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Форма заявки */}
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-pink-200 mb-1">Сумма, ₽</label>
                <input 
                  type="number" 
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 outline-none" 
                  placeholder="Минимум 100 ₽"
                  min="100"
                  max={balance?.available_balance || 100000}
                  required
                />
                {balance && (
                  <p className="text-xs text-pink-200 mt-1">
                    Максимум: {balance.available_balance.toLocaleString()} ₽
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-pink-200 mb-1">Способ вывода</label>
                <select 
                  value={withdrawalForm.payment_method}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, payment_method: e.target.value, payment_details: {} }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                >
                  <option value="">Выберите способ</option>
                  {Object.entries(paymentMethods).map(([key, method]) => (
                    <option key={key} value={key}>{method.name}</option>
                  ))}
                </select>
              </div>

              {/* Динамические поля в зависимости от способа вывода */}
              {withdrawalForm.payment_method && paymentMethods[withdrawalForm.payment_method] && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-pink-200">
                    {paymentMethods[withdrawalForm.payment_method].description}
                  </h4>
                  {Object.entries(paymentMethods[withdrawalForm.payment_method].fields).map(([fieldKey, fieldLabel]) => (
                    <div key={fieldKey}>
                      <label className="block text-sm text-pink-200 mb-1">{fieldLabel}</label>
                      <input 
                        type="text"
                        value={withdrawalForm.payment_details[fieldKey] || ''}
                        onChange={(e) => setWithdrawalForm(prev => ({
                          ...prev,
                          payment_details: { ...prev.payment_details, [fieldKey]: e.target.value }
                        }))}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              <button 
                type="submit" 
                disabled={submittingWithdrawal || !balance?.available_balance || balance.available_balance < 100}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg disabled:cursor-not-allowed"
              >
                {submittingWithdrawal ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-pink-500/20 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-3">Поддержка</h2>
            <p className="text-pink-100 text-sm">Если возникли вопросы — напишите менеджеру сообщества, мы поможем.</p>
            <div className="mt-4 flex gap-3">
              <a href="https://t.me/grosscommunity" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-pink-100 px-4 py-2 rounded-lg border border-white/20 transition-all">Telegram</a>
              <a href="https://wa.me/79149469062" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-pink-100 px-4 py-2 rounded-lg border border-white/20 transition-all">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;


