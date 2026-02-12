import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Define o formato do nosso Perfil
interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'pendente';
  allowed_modules?: string[]; 
  role_id?: string; 
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  canAccess: (module: string) => boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- FUNÇÃO CENTRAL DE CARREGAR PERFIL ---
  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      // 1. PRIMEIRO: Verifica a tabela de permissões (Whitelist)
      if (userEmail) {
        const { data: permission, error: permError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('email', userEmail)
          .single();

        // Se não achar na whitelist ou se estiver inativo
        if (permError || !permission || permission.active === false) {
          console.warn("Usuário não está na lista de permissões.");
          await supabase.auth.signOut(); // Derruba a sessão
          setAuthError("Seu acesso ainda não foi liberado pelo administrador.");
          setSession(null);
          setProfile(null);
          return; // Para a execução aqui
        }
      }

      // 2. SE PASSOU, busca o perfil normal
      const { data, error } = await supabase
        .from('profiles')
        .select(`*, app_roles (modules)`)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignora erro de "não encontrado"
         throw error;
      }

      if (data) {
        // --- CENÁRIO A: Usuário já existia na tabela profiles ---
        const userProfile: Profile = {
          ...data,
          allowed_modules: data.role === 'admin' ? ['*'] : data.app_roles?.modules || []
        };
        setProfile(userProfile);
      } else {
        // --- CENÁRIO B: Primeiro Login (Não tem profile, mas passou na Whitelist) ---
        
        // Busca qual role foi definida no convite
        const { data: permissionData } = await supabase
           .from('user_permissions')
           .select('role')
           .eq('email', userEmail)
           .single();
           
        const permissionRole = permissionData?.role || 'user';
        const isCustomRole = permissionRole !== 'admin' && permissionRole !== 'user'; // Se não é palavra reservada, é ID

        // Se for um cargo customizado, precisamos buscar os módulos dele para permitir o acesso agora
        let modulesToAllow: string[] = [];
        if (isCustomRole) {
           const { data: roleData } = await supabase
              .from('app_roles')
              .select('modules')
              .eq('id', permissionRole)
              .single();
           modulesToAllow = roleData?.modules || [];
        } else if (permissionRole === 'admin') {
           modulesToAllow = ['*'];
        }

        setProfile({
            id: userId,
            email: userEmail || '',
            full_name: 'Novo Usuário',
            // Se for customizado, o papel base é 'user', senão é o próprio valor (admin)
            role: isCustomRole ? 'user' : (permissionRole as any), 
            // Se for customizado, o role_id é o valor que veio do banco
            role_id: isCustomRole ? permissionRole : undefined,
            allowed_modules: modulesToAllow, 
        });
      }

    } catch (error) {
      console.error(error);
      setAuthError("Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Captura erro da URL (ex: acesso negado do Google)
    const captureUrlError = () => {
      const url = window.location.href;
      const match = url.match(/error_description=([^&]+)/);
      if (match && match[1]) {
        const rawError = decodeURIComponent(match[1].replace(/\+/g, ' '));
        if (rawError.includes("Database error") || rawError.includes("row-level security")) {
          setAuthError("Acesso Negado: Apenas para uso autorizado");
        } else {
          setAuthError(rawError);
        }
      }
    };
    
    captureUrlError();

    // 2. Verifica sessão ativa inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // 3. Escuta mudanças (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginGoogle = async () => {
    setAuthError(null); 
    const redirectUrl = window.location.origin + (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);
    const finalRedirect = redirectUrl.endsWith('/') ? redirectUrl.slice(0, -1) : redirectUrl;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: finalRedirect, 
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setAuthError(null);
  };

  const isAdmin = profile?.role === 'admin';
  
  const canAccess = (module: string) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (profile.role === 'pendente') return false;
    return profile.allowed_modules?.includes(module) || false;
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, loginGoogle, logout, isAdmin, canAccess, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);