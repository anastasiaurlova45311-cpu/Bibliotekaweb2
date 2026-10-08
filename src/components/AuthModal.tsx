import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 100);
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      } else {
        if (!name.trim()) {
          setError('Введите имя');
          setSubmitting(false);
          return;
        }
        const result = await signUp(email, password, name.trim());
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      }
    } catch {
      setError('Произошла ошибка. Попробуйте ещё раз.');
    }
    setSubmitting(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-5 animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-[20px] p-7 w-full max-w-[420px] animate-slide-up"
        style={{ background: 'var(--card)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        <h2 className="text-2xl mb-2 font-semibold text-center" style={{ color: 'var(--primary-dark)' }}>
          {isLogin ? '🔑 Вход' : '✨ Регистрация'}
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-soft)' }}>
          {isLogin ? 'Войдите в свою библиотеку' : 'Создайте аккаунт для начала'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3.5">
              <label className="block mb-1.5 text-sm font-semibold" style={{ color: 'var(--text)' }}>Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-xl text-base transition-all duration-200 outline-none"
                style={{ border: '2px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--card)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-soft)'; }}
              />
            </div>
          )}

          <div className="mb-3.5">
            <label className="block mb-1.5 text-sm font-semibold" style={{ color: 'var(--text)' }}>Email</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@mail.com"
              className="w-full px-3.5 py-2.5 rounded-xl text-base transition-all duration-200 outline-none"
              style={{ border: '2px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--card)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-soft)'; }}
            />
          </div>

          <div className="mb-3.5">
            <label className="block mb-1.5 text-sm font-semibold" style={{ color: 'var(--text)' }}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              placeholder="Минимум 4 символа"
              className="w-full px-3.5 py-2.5 rounded-xl text-base transition-all duration-200 outline-none"
              style={{ border: '2px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--card)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-soft)'; }}
            />
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(192, 57, 43, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'var(--primary)' }}
          >
            {submitting ? '...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={switchMode}
            className="text-sm cursor-pointer bg-transparent border-none underline transition-colors duration-200"
            style={{ color: 'var(--primary)' }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
