import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'pendente';
  role_id?: string;
  app_roles?: {
    name: string;
  };
  created_at?: string;
}

interface AppRole {
  id: string;
  name: string;
}

export const AdminUserList = ({ onClose }: { onClose: () => void }) => {
  const { profile: myProfile } = useAuth();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Busca Usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`*, app_roles ( name )`)
        .order('full_name', { ascending: true });

      if (usersError) throw usersError;

      // 2. Busca Cargos (Se der erro aqui, a lista fica vazia mas não trava tudo)
      const { data: rolesData, error: rolesError } = await supabase
        .from('app_roles')
        .select('id, name')
        .order('name');

      if (rolesError) console.error("Erro ao buscar cargos:", rolesError);

      setUsers(usersData || []);
      setAvailableRoles(rolesData || []);

    } catch (error) {
      console.error('Erro crítico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, value: string) => {
    try {
      let updatePayload: any = {};
      let newRoleName: string | undefined = undefined;

      // 1. ADMIN
      if (value === 'admin') {
        updatePayload = { role: 'admin', role_id: null };
      } 
      // 2. PENDENTE (Bloqueado)
      else if (value === 'pendente') {
        updatePayload = { role: 'pendente', role_id: null };
      } 
      // 3. USUÁRIO PADRÃO (Sem cargo específico)
      else if (value === 'user_standard') {
        updatePayload = { role: 'user', role_id: null };
      }
      // 4. CARGO PERSONALIZADO (Financeiro, etc)
      else {
        updatePayload = { role: 'user', role_id: value };
        newRoleName = availableRoles.find(r => r.id === value)?.name;
      }

      // Atualização Visual Imediata (Otimista)
      setUsers(users.map(u => {
        if (u.id === userId) {
          return { 
            ...u, 
            role: updatePayload.role, 
            role_id: updatePayload.role_id,
            app_roles: newRoleName ? { name: newRoleName } : undefined
          };
        }
        return u;
      }));

      // Atualização no Banco
      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', userId);
      if (error) throw error;

    } catch (error) {
      alert('Erro ao atualizar. Verifique sua conexão.');
      fetchData(); // Reverte
    }
  };

  const getDisplayRole = (user: UserProfile) => {
    if (user.role === 'admin') return 'ADMINISTRADOR';
    if (user.role === 'pendente') return 'PENDENTE';
    if (user.app_roles?.name) return user.app_roles.name.toUpperCase();
    return 'USUÁRIO PADRÃO';
  };

  const getBadgeStyle = (user: UserProfile) => {
    if (user.role === 'admin') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (user.role === 'pendente') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (user.role_id) return 'bg-cyan-100 text-cyan-700 border-cyan-200'; // Tem cargo
    return 'bg-slate-100 text-slate-500 border-slate-200'; // Usuário padrão
  };

  // Função para determinar o valor atual do select
  const getSelectValue = (user: UserProfile) => {
    if (user.role === 'admin') return 'admin';
    if (user.role === 'pendente') return 'pendente';
    if (user.role_id) return user.role_id; // ID do cargo personalizado
    return 'user_standard'; // Usuário comum sem cargo
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black text-slate-800">Gestão de Usuários</h2>
            <p className="text-sm text-slate-500 font-medium">Defina quem acessa o quê.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-400">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Carregando...</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm gap-4">
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {user.full_name}
                        <span className={`text-[10px] px-2 rounded border ${getBadgeStyle(user)}`}>
                          {getDisplayRole(user)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    {user.id !== myProfile?.id ? (
                      <select 
                        value={getSelectValue(user)}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="w-full md:w-48 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2.5 outline-none focus:border-cyan-500"
                      >
                        <optgroup label="Acesso Básico">
                          <option value="pendente">🔒 Bloqueado</option>
                          <option value="user_standard">👤 Usuário Padrão (Sem cargo)</option>
                        </optgroup>
                        
                        <optgroup label="Cargos Personalizados">
                          {availableRoles.map(role => (
                            <option key={role.id} value={role.id}>💼 {role.name}</option>
                          ))}
                          {availableRoles.length === 0 && <option disabled>Nenhum cargo criado</option>}
                        </optgroup>

                        <optgroup label="Acesso Total">
                          <option value="admin">🚀 Administrador</option>
                        </optgroup>
                      </select>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Seu perfil</span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};