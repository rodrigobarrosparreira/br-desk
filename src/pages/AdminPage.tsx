import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminUserList } from '../components/AdminUserList';
import { RoleManager } from '../components/RoleManager';
// 1. IMPORTAR O NOVO COMPONENTE
import { AdminInviteUser } from '../components/AdminInviteUser'; 
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  // 2. NOVO ESTADO PARA O MODAL DE CONVITE
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Proteção extra
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Painel Administrativo</h1>
          <p className="text-slate-500">Gerencie usuários, cargos e configurações do sistema.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Voltar para Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card Gestão de Usuários */}
        <button 
          onClick={() => setShowUserModal(true)}
          className="bg-white p-8 rounded-2xl border border-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.05)] hover:shadow-[0_10px_30px_rgba(147,51,234,0.1)] hover:-translate-y-1 transition-all text-left flex flex-col gap-4 group"
        >
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-users-gear text-2xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Gestão de Usuários</h3>
            <p className="text-sm text-slate-500 font-medium mt-2">Aprovar cadastros e definir quem acessa o sistema.</p>
          </div>
        </button>

        {/* Card Cargos e Permissões */}
        <button 
          onClick={() => setShowRoleModal(true)}
          className="bg-white p-8 rounded-2xl border border-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.05)] hover:shadow-[0_10px_30px_rgba(147,51,234,0.1)] hover:-translate-y-1 transition-all text-left flex flex-col gap-4 group"
        >
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Cargos e Permissões</h3>
            <p className="text-sm text-slate-500 font-medium mt-2">Criar perfis de acesso e restringir departamentos.</p>
          </div>
        </button>

        {/* 3. NOVO CARD: PRÉ-CADASTRO / CONVITE */}
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-white p-8 rounded-2xl border border-cyan-100 shadow-[0_4px_20px_rgba(8,145,178,0.05)] hover:shadow-[0_10px_30px_rgba(8,145,178,0.1)] hover:-translate-y-1 transition-all text-left flex flex-col gap-4 group"
        >
          <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-user-plus text-2xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">Liberar Acesso</h3>
            <p className="text-sm text-slate-500 font-medium mt-2">Pré-aprovar novos colaboradores antes do primeiro login.</p>
          </div>
        </button>

      </div>

      {/* MODAIS EXISTENTES */}
      {showUserModal && <AdminUserList onClose={() => setShowUserModal(false)} />}
      {showRoleModal && <RoleManager onClose={() => setShowRoleModal(false)} />}

      {/* 4. NOVO MODAL WRAPPER PARA O CONVITE */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setShowInviteModal(false)}>
           {/* Ao clicar fora, fecha. O stopPropagation abaixo impede que feche ao clicar no card */}
           <div className="relative" onClick={(e) => e.stopPropagation()}>
              
              {/* Botão de Fechar flutuante */}
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
              
              {/* O Componente em si */}
              <AdminInviteUser />
           </div>
        </div>
      )}

    </div>
  );
};

export { AdminPage };
export default AdminPage;