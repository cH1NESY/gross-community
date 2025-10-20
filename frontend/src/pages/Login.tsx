import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Введите корректный email');
      return;
    }
    if (password.length < 6) {
      setError('Минимум 6 символов');
      return;
    }
    try {
      const res = await fetch('http://localhost/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.message || 'Ошибка входа');
        return;
      }
      const data = await res.json();
      localStorage.setItem('api_token', data.token);
      
      // Уведомляем Header об изменении состояния авторизации
      window.dispatchEvent(new CustomEvent('authChanged', { detail: data.user }));
      
      window.location.hash = '#/account';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (e) {
      setError('Сеть недоступна');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-pink-500/20 bg-black/30 p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-6">Войти</h1>

        <label className="block text-sm font-medium text-white mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          placeholder="you@example.com"
        />

        <label className="block text-sm font-medium text-white mb-2">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          placeholder="••••••"
        />

        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
          Войти
        </button>

        <div className="text-sm text-pink-100 mt-4">
          Нет аккаунта?{' '}
          <a href="#" onClick={() => history.back()} className="text-pink-400 underline hover:text-pink-300">Вернуться</a>
        </div>
      </form>
    </div>
  );
};

export default Login;


