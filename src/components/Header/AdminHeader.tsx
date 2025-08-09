// src/components/Header/AdminHeader.tsx
import { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../ConfirmModal';

interface Props {
  onCreate: () => void;
}

export default function AdminHeader({ onCreate }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 items-center bg-white rounded-2xl shadow-sm ring-1 ring-black/5 px-4 py-3">
      {/* Marca + título */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#3b3b3b] truncate">
          Painel do Administrador
        </h1>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium shadow-sm
                     bg-[#672C8E] hover:bg-[#4E1F6A] transition cursor-pointer"
        >
          Novo Agendamento
        </button>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium
                     border border-gray-300 text-gray-700 bg-white hover:bg-gray-50
                     transition cursor-pointer"
        >
          Sair
        </button>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Deseja realmente sair?"
        message="Você será desconectado da sessão atual."
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
