import React, { useState } from 'react';
import { DepartmentId, Submodule } from './../types';
import { DEPARTMENTS, USEFUL_LINKS } from './constants';
import { useAuth } from './contexts/AuthContext';
import { checkPermission } from './utils/permissions';
import { useNavigate, useLocation } from 'react-router-dom'; // Importante para navegação
import Chatbot from './services/Chatbot'
import logoBrClubeQuadrada from './assets/brclube2.png'

interface LayoutProps {
  children: React.ReactNode;
  activeDept: DepartmentId;
  activeSubmodule: string | null;
  onNavigate: (deptId: DepartmentId, submoduleId: string | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeDept, activeSubmodule, onNavigate }) => {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Para saber se estamos na rota /admin

  // Filtro de permissões
  const visibleDepartments = DEPARTMENTS.filter(dept => 
    checkPermission(profile?.allowed_modules, dept.id)
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLinksExpanded, setIsLinksExpanded] = useState(false);
  
  // NOVO STATE: Para controlar o dropdown de departamentos
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(true);

  const renderSubmoduleButton = (sub: Submodule, isGrouped = false) => (
    <button
      key={sub.id}
      onClick={() => {
        onNavigate(sub.parentId, sub.id);
        setIsMobileMenuOpen(false);
        navigate('/'); // Garante que volta pra home se estiver em outra rota
      }}
      className={`w-full text-left py-2 px-4 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
        activeSubmodule === sub.id 
          ? 'text-cyan-400 bg-cyan-500/10' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      } ${isGrouped ? 'ml-4 border-l border-slate-700/50' : 'ml-2'}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${activeSubmodule === sub.id ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-slate-600'}`}></div>
      <span>{sub.name}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f5fdff]">
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className={`bg-[#00003D] text-white hidden md:flex flex-col sticky top-0 h-screen shadow-2xl transition-all duration-300 z-30 ${isCollapsed ? 'w-24' : 'w-72'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-10 bg-cyan-500 w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-400 z-50 group">
          <i className={`fa-solid fa-chevron-${isCollapsed ? 'right' : 'left'} text-[10px] text-white`}></i>
        </button>

        <div className="p-8 mb-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="rounded-xl w-10 h-10 flex items-center justify-center shadow-lg">
              <img src={logoBrClubeQuadrada} className='rounded-sm'/>
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-xl font-extrabold tracking-tight block">BR CLUBE</span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em]">Hub Operacional</span>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-10">
          
          {/* Botão Início */}
          <button 
            onClick={() => { onNavigate('home', null); navigate('/'); }}
            className={`w-full flex items-center rounded-xl px-4 py-3.5 transition-all ${
              activeDept === 'home' && location.pathname === '/' ? 'sidebar-item-active text-white' : 'text-slate-400 hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          >
            <i className="fa-solid fa-house-chimney text-lg"></i>
            {!isCollapsed && <span className="font-bold text-sm">Página Inicial</span>}
          </button>

          {/* Botão Admin (Visível apenas para Admin) */}
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              className={`w-full flex items-center rounded-xl px-4 py-3.5 transition-all ${
                location.pathname === '/admin' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-purple-300 hover:bg-purple-900/30'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
            >
              <i className="fa-solid fa-users-gear text-lg"></i>
              {!isCollapsed && <span className="font-bold text-sm">Painel Admin</span>}
            </button>
          )}

          <div className="border-t border-slate-700/50 my-2"></div>

          {/* Links Úteis Dropdown */}
          <div>
            <button 
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setIsLinksExpanded(!isLinksExpanded);
              }}
              className={`w-full flex items-center rounded-xl transition-all ${
                isLinksExpanded ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center py-4' : 'px-4 py-3.5 justify-between group'}`}
            >
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-link text-base w-6 text-center"></i>
                {!isCollapsed && <span className="font-bold text-sm truncate">Links Úteis</span>}
              </div>
              {!isCollapsed && (
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isLinksExpanded ? 'rotate-180 text-cyan-500' : 'opacity-30'}`}></i>
              )}
            </button>

            {!isCollapsed && isLinksExpanded && (
              <div className="animate-in slide-in-from-top-2 duration-300 overflow-hidden ml-4 space-y-1 mt-1 border-l border-slate-700/50 pl-2">
                {USEFUL_LINKS.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left py-2 px-4 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all flex items-center space-x-3"
                  >
                    <i className={`fa-solid ${link.icon} w-4 text-center opacity-70`}></i>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* DROPDOWN DE DEPARTAMENTOS (A GRANDE MUDANÇA) */}
          <div>
            <button 
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setIsDeptDropdownOpen(!isDeptDropdownOpen);
              }}
              className={`w-full flex items-center rounded-xl transition-all ${
                 // Se algum departamento estiver ativo, destaca o pai
                 activeDept !== 'home' ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center py-4' : 'px-4 py-3.5 justify-between group'}`}
            >
              <div className="flex items-center space-x-3">
                 <i className="fa-solid fa-layer-group text-base w-6 text-center"></i>
                 {!isCollapsed && <span className="font-bold text-sm truncate">Departamentos</span>}
              </div>
              {!isCollapsed && (
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isDeptDropdownOpen ? 'rotate-180 text-cyan-500' : 'opacity-30'}`}></i>
              )}
            </button>
            
            {/* Lista dos Departamentos (Filhos do Dropdown) */}
            {!isCollapsed && isDeptDropdownOpen && (
              <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                {visibleDepartments.map((dept) => {
                  const isActive = activeDept === dept.id;
                  return (
                    <button 
                      key={dept.id}
                      onClick={() => { onNavigate(dept.id, null); navigate('/'); }}
                      className={`w-full flex items-center rounded-lg px-4 py-2.5 transition-all ml-4 border-l ${
                        isActive ? 'border-cyan-500 text-cyan-400 bg-cyan-900/20' : 'border-slate-700/30 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                       <div className="flex items-center space-x-3 w-full">
                         <i className={`fa-solid ${dept.icon} text-sm w-5 text-center`}></i>
                         <span className="font-semibold text-xs truncate">{dept.name}</span>
                       </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </nav>
      </aside>

      {/* --- HEADER MOBILE --- */}
      <header className="md:hidden bg-navy-deep text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><span className="text-navy-deep font-black">BR</span></div>
          <span className="font-bold text-sm tracking-tight">BR CLUBE</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10">
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl`}></i>
        </button>
      </header>

      {/* --- MENU MOBILE EXPANDIDO --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-navy-deep z-40 md:hidden pt-20 px-6 overflow-y-auto">
          <nav className="space-y-4 pb-10">
              <button onClick={() => { onNavigate('home', null); navigate('/'); setIsMobileMenuOpen(false); }} className={`w-full text-left text-white px-5 py-4 rounded-xl font-bold flex items-center space-x-3 ${activeDept === 'home' ? 'bg-cyan-600' : 'bg-white/5'}`}>
                <i className="fa-solid fa-house"></i><span>Início</span>
              </button>

              {isAdmin && (
                <button onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} className="w-full text-left text-white px-5 py-4 rounded-xl font-bold flex items-center space-x-3 bg-purple-600/20 text-purple-300 border border-purple-500/30">
                  <i className="fa-solid fa-users-gear"></i><span>Painel Admin</span>
                </button>
              )}
              
              <div className="px-4 text-[10px] font-black text-cyan-500 uppercase tracking-widest pt-4">Departamentos</div>
              {visibleDepartments.map(dept => (
                <button key={dept.id} onClick={() => { onNavigate(dept.id, null); navigate('/'); setIsMobileMenuOpen(false); }} className={`w-full text-left text-white px-5 py-3 rounded-xl text-sm flex items-center gap-3 ${activeDept === dept.id ? 'bg-cyan-500/30 border border-cyan-500/50' : 'bg-white/5'}`}>
                  <i className={`fa-solid ${dept.icon}`}></i>
                  {dept.name}
                </button>
              ))}

              <div className="px-4 text-[10px] font-black text-cyan-500 uppercase tracking-widest pt-4">Links Úteis</div>
              <div className="grid grid-cols-2 gap-2">
                {USEFUL_LINKS.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-white/5 text-white p-3 rounded-xl text-xs flex items-center space-x-2">
                    <i className={`fa-solid ${link.icon}`}></i>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
          </nav>
        </div>
      )}

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
      <Chatbot/>
    </div>
  );
};

export default Layout;