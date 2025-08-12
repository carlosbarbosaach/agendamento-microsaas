// src/pages/LoginPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, CalendarDays } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import logoCampeche from '../assets/logo-campeche.avif';

const BRAND = '#672C8E';
const BRAND_DARK = '#4E1F6A';
const RING = 'ring-[rgba(103,44,142,0.35)]';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => localStorage.getItem('remember_email') || 'admin@demo.com');
  const [password, setPassword] = useState(() => localStorage.getItem('remember_pass') || '123456');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('remember_email'));
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // enter para enviar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading) handleSubmit(e as unknown as React.FormEvent);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      if (remember) {
        localStorage.setItem('remember_email', email);
        localStorage.setItem('remember_pass', password);
      } else {
        localStorage.removeItem('remember_email');
        localStorage.removeItem('remember_pass');
      }
      navigate('/admin');
    } catch {
      setError('Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      {/* Banner desktop (fica escondido no mobile) */}
      <div
        className="hidden lg:block lg:col-span-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            backgroundPosition: '0 0, 9px 9px',
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <img src={logoCampeche} alt="Colégio do Campeche" className="h-10 w-auto" />
            <span className="text-white/95 font-semibold text-lg">Colégio do Campeche</span>
          </div>

          <div className="text-white">
            <h1 className="text-4xl font-bold leading-tight">Sistema de Agendamentos</h1>
            <p className="mt-3 text-white/85 max-w-md">
              Visualize o calendário, evite conflitos e mantenha tudo organizado.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <CalendarDays size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Visão clara</p>
                  <p className="text-xs text-white/80">Calendário por dia</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Acesso seguro</p>
                  <p className="text-xs text-white/80">Somente administração</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/70 text-xs">
            © {new Date().getFullYear()} Colégio do Campeche — Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Área do formulário (mobile-first) */}
      <div
        className="lg:col-span-6 flex items-center justify-center px-4 py-8 md:py-10"
        // Fundo mobile com gradiente e shapes suaves
        style={{
          background:
            'linear-gradient(180deg, #ffffff 0%, #faf7ff 50%, #f4effa 100%)',
        }}
      >
        <div className="w-full max-w-md">
          {/* Header mobile enxuto */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-3">
              <img src={logoCampeche} alt="Colégio do Campeche" className="h-10 w-auto" />
              <div>
                <h2 className="text-lg font-semibold text-[#2b2b2b]">Painel Administrativo</h2>
                <p className="text-xs text-gray-600">Apenas administradores</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md shadow-xl p-5 md:p-7 border border-white/70"
          >
            {/* inputs com label flutuante (melhor no mobile) */}
            <div className="space-y-5">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={[
                    'peer w-full px-3 pt-5 pb-2 rounded-xl text-[15px] border bg-white outline-none transition shadow-sm',
                    'focus:ring-2 focus:ring-offset-0', RING,
                  ].join(' ')}
                  placeholder=" " // importante para label flutuante
                  autoComplete="username"
                  inputMode="email"
                  required
                />
                <label
                  htmlFor="email"
                  className="pointer-events-none absolute left-3 top-2 text-xs text-gray-500 transition-all 
                             peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                             peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#672C8E]"
                >
                  Email <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={[
                    'peer w-full px-3 pt-5 pb-2 rounded-xl text-[15px] border bg-white outline-none transition shadow-sm pr-10',
                    'focus:ring-2 focus:ring-offset-0', RING,
                  ].join(' ')}
                  placeholder=" "
                  autoComplete="current-password"
                  required
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute left-3 top-2 text-xs text-gray-500 transition-all 
                             peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                             peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#672C8E]"
                >
                  Senha <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                  />
                  Lembrar de mim
                </label>
                <a
                  href="mailto:secretaria@colegiodocampeche.com.br"
                  className="text-xs text-[#672C8E] hover:underline"
                >
                  Suporte
                </a>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl 
                           transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}
              >
                <LogIn size={18} />
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </div>

            {/* rodapé compacto */}
            <p className="mt-4 text-[11px] text-center text-gray-600">
              Acesso restrito • secretaria@colegiodocampeche.com.br
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
