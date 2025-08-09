// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logoCampeche from '../assets/logo-campeche.avif'; // 👈 importa logo

export default function LoginPage() {
  const BRAND = '#672C8E';
  const BRAND_DARK = '#4E1F6A';
  const BRAND_RING = 'ring-[rgba(103,44,142,0.35)]';

  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo + Marca */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoCampeche}
            alt="Colégio do Campeche"
            className="h-16 w-auto mb-2"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-white/95">
            Painel Administrativo
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md shadow-xl p-6 md:p-7 border border-white/40"
        >
          <h2 className="text-xl font-semibold text-[#2b2b2b] text-center mb-4">
            Acesse sua conta
          </h2>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3b3b3b] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={[
                  'w-full px-3 py-2 rounded-lg text-sm border',
                  'bg-white/90 outline-none transition shadow-sm',
                  'focus:ring-2 focus:ring-offset-0',
                  BRAND_RING,
                ].join(' ')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3b3b3b] mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={[
                    'w-full px-3 py-2 rounded-lg text-sm border',
                    'bg-white/90 outline-none transition shadow-sm',
                    'focus:ring-2 focus:ring-offset-0',
                    BRAND_RING,
                  ].join(' ')}
                  required
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPass(s => !s)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 select-none">
                <input type="checkbox" className="rounded border-gray-300" />
                Lembrar de mim
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 
             text-white font-semibold py-2.5 rounded-lg 
             transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed
             hover:brightness-110 cursor-pointer"
              style={{ backgroundColor: BRAND }}
            >
              <LogIn size={18} />
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </div>

          <p className="mt-4 text-[11px] text-center text-gray-600">
            Acesso restrito • Suporte: secretaria@colegiodocampeche.com.br
          </p>
        </form>
      </div>
    </div>
  );
}
