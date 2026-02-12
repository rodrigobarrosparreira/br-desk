import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface AppRole {
  id: string;
  name: string;
}

export const AdminInviteUser = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('user_standard'); // Valor padrão
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Busca os cargos disponíveis ao carregar
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('app_roles')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setAvailableRoles(data);
      }
    };
    fetchRoles();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // Lógica para definir o que salvar na Whitelist
      // Se for admin, salvamos 'admin'. 
      // Se for cargo personalizado, salvamos o ID do cargo (que é um UUID)
      // Se for padrão, salvamos 'user'
      
      let roleToSave = 'user'; // Padrão
      
      if (selectedRole === 'admin') {
        roleToSave = 'admin';
      } else if (selectedRole === 'user_standard') {
        roleToSave = 'user';
      } else {
        // Se for um UUID (cargo personalizado), salvamos ele
        // IMPORTANTE: Seu AuthContext precisará saber lidar com isso no primeiro login
        roleToSave = selectedRole; 
      }

      // Insere na tabela de permissões (Whitelist)
      // Nota: Estamos usando a coluna 'role' para guardar ou o cargo fixo ou o ID do cargo personalizado.
      const { error } = await supabase
        .from('user_permissions')
        .upsert({ 
          email: email.toLowerCase().trim(), 
          role: roleToSave, 
          active: true 
        }, { onConflict: 'email' });

      if (error) throw error;

      alert(`✅ Sucesso! O acesso para ${email} foi pré-aprovado.`);
      setEmail('');
      setSelectedRole('user_standard'); // Reseta
    } catch (error: any) {
      console.error(error);
      alert("Erro ao adicionar: " + (error.message || "Verifique se você é Admin."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full">
      <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-user-plus text-cyan-600"></i> Liberar Novo Acesso
      </h3>
      
      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email do Google</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
            placeholder="colaborador@gmail.com"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Definir Cargo Inicial</label>
          <div className="relative">
            <select 
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-cyan-500 bg-white appearance-none cursor-pointer text-slate-700 font-medium"
            >
              <optgroup label="Acesso Básico">
                <option value="user_standard">👤 Usuário Padrão (Sem cargo)</option>
              </optgroup>

              {/* AQUI ESTÃO OS SEUS PERFIS CRIADOS DINAMICAMENTE */}
              <optgroup label="Cargos Personalizados">
                {availableRoles.map(role => (
                  <option key={role.id} value={role.id}>💼 {role.name}</option>
                ))}
                {availableRoles.length === 0 && <option disabled>Nenhum perfil criado ainda</option>}
              </optgroup>

              <optgroup label="Acesso Total">
                <option value="admin">🚀 Administrador Geral</option>
              </optgroup>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-slate-800 hover:bg-black text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
          Liberar Entrada
        </button>
      </form>
    </div>
  );
};