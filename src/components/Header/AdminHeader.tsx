// src/components/Header/AdminHeader.tsx
import { useMemo, useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../ConfirmModal';
import { CalendarPlus, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  onCreate: (date?: Date) => void;
}

export default function AdminHeader({ onCreate }: Props) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const todayLabel = useMemo(
    () => format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }),
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Primeira letra do email para “avatar” simples
  const avatarLetter =
    (user?.email?.trim()?.charAt(0)?.toUpperCase() ?? 'A');

  return (
    <header className="sticky top-0 z-30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/90 backdrop-blur rounded-2xl shadow-sm ring-1 ring-black/5 px-4 py-3">

        {/* Título + subtítulo */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#2b2b2b]">
            Painel do Administrador
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {todayLabel}
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Avatar simples com a inicial do usuário (opcional) */}
          <div
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white font-semibold select-none"
            style={{ backgroundColor: '#672C8E' }}
            title={user?.email ?? 'Administrador'}
          >
            {avatarLetter}
          </div>

          <button
            onClick={() => onCreate(new Date())}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-white font-medium shadow-sm transition
                       cursor-pointer hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#672C8E]/40"
            style={{ backgroundColor: '#672C8E' }}
          >
            <CalendarPlus size={18} className="opacity-95" />
            <span className="text-sm">Novo agendamento</span>
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium
                       hover:bg-gray-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Deseja realmente sair?"
        message="Você será desconectado da sessão atual."
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
