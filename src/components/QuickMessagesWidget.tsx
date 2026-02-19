// ============================================================================
// 💬 WIDGET DE MENSAGENS RÁPIDAS (MINIMALISTA)

import { useEffect, useState } from "react";

// ============================================================================
export interface QuickMessagesWidgetProps {
  currentDepartment: string;
  userRole: string;
  apiUrl: string;
  apiToken: string;
}

export const QuickMessagesWidget: React.FC<QuickMessagesWidgetProps> = ({ currentDepartment, userRole, apiUrl, apiToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTexto, setNovoTexto] = useState('');

  useEffect(() => {
    if (isOpen && mensagens.length === 0) carregarMensagens();
  }, [isOpen]);

  const carregarMensagens = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'listar_mensagens' }) });
      const json = await response.json();
      if (json.status === 'sucesso') setMensagens(json.lista);
    } catch (error) {} finally { setLoading(false); }
  };

  const salvarNovaMensagem = async () => {
    if (!novoTitulo || !novoTexto) return alert("Preencha tudo!");
    try {
      const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'salvar_mensagem', departamento: currentDepartment, titulo: novoTitulo, texto: novoTexto, role: userRole, token_acesso: apiToken }) });
      const json = await response.json();
      if (json.status === 'sucesso') { setIsAdding(false); setNovoTitulo(''); setNovoTexto(''); carregarMensagens(); } else { alert(json.msg); }
    } catch (e) { alert("Erro ao salvar"); }
  };

  const excluirMensagem = async (id: string) => {
    if (!window.confirm("Excluir esta mensagem?")) return;
    try {
      const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'excluir_mensagem', id_mensagem: id, role: userRole, token_acesso: apiToken }) });
      const json = await response.json();
      if (json.status === 'sucesso') setMensagens(prev => prev.filter(m => m.id !== id));
    } catch (e) {}
  };

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    const btn = document.activeElement as HTMLElement;
    if(btn && btn.tagName === 'BUTTON') {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        setTimeout(() => btn.innerHTML = originalText, 1000);
    }
  };

  const mensagensFiltradas = mensagens.filter(m => m.departamento === currentDepartment || m.departamento === 'Todos');

  return (
    <>
      {/* BOTÃO MINIMALISTA (Fica fixo na barra) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-6 h-12 rounded-full font-bold text-sm flex items-center gap-2 transition-colors border shadow-sm ${isOpen ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
      >
        <i className="fa-regular fa-comments"></i>
        Respostas
      </button>

      {/* JANELA FLUTUANTE */}
      {isOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[400px] max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm"><i className="fa-regular fa-comments text-purple-600 mr-2"></i>Mensagens Rápidas</h3>
            <div className="flex gap-2">
              {userRole === 'admin' && <button onClick={() => setIsAdding(!isAdding)} className="text-xs bg-purple-100 text-purple-700 w-7 h-7 rounded hover:bg-purple-200"><i className="fa-solid fa-plus"></i></button>}
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><i className="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {isAdding && (
              <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-sm">
                <input className="w-full text-xs p-2 border rounded mb-2" placeholder="Título" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} />
                <textarea className="w-full text-xs p-2 border rounded mb-2 h-16" placeholder="Texto..." value={novoTexto} onChange={e => setNovoTexto(e.target.value)} />
                <button onClick={salvarNovaMensagem} className="w-full bg-purple-600 text-white text-xs py-2 rounded">Salvar</button>
              </div>
            )}
            {loading ? <p className="text-center text-xs text-slate-400 mt-4">Carregando...</p> : mensagensFiltradas.map(msg => (
              <div key={msg.id} className="bg-white p-3 rounded-xl border border-slate-200 relative group">
                <span className="font-bold text-slate-700 text-xs block mb-2">{msg.titulo}</span>
                {userRole === 'admin' && <button onClick={() => excluirMensagem(msg.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><i className="fa-solid fa-trash text-xs"></i></button>}
                <p className="text-[11px] text-slate-500 line-clamp-4 mb-2 whitespace-pre-wrap">{msg.texto}</p>
                <button onClick={() => copiarTexto(msg.texto)} className="w-full bg-slate-50 text-slate-600 hover:text-purple-600 text-[11px] font-bold py-1.5 rounded border"><i className="fa-regular fa-copy"></i> Copiar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// 📘 WIDGET DO PROTOCOLO DO DEPARTAMENTO (FUNCIONAL)
// ============================================================================
export interface ProtocolWidgetProps {
  currentDepartment: string;
  userRole: string;
  apiUrl: string;
  apiToken: string;
}

export const ProtocolWidget: React.FC<ProtocolWidgetProps> = ({ currentDepartment, userRole, apiUrl, apiToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textoProtocolo, setTextoProtocolo] = useState('');
  const [rascunho, setRascunho] = useState('');

  // Carrega o protocolo quando o widget for aberto pela primeira vez
  useEffect(() => {
    if (isOpen) carregarProtocolo();
  }, [isOpen, currentDepartment]);

  const carregarProtocolo = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'buscar_protocolo', departamento: currentDepartment, token_acesso: apiToken })
      });
      const json = await response.json();
      if (json.status === 'sucesso') {
        setTextoProtocolo(json.texto);
        setRascunho(json.texto); // Prepara o rascunho caso o admin queira editar
      }
    } catch (error) {
      console.error("Erro ao carregar o protocolo.");
    } finally {
      setLoading(false);
    }
  };

  const salvarProtocolo = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'salvar_protocolo',
          departamento: currentDepartment,
          texto: rascunho,
          role: userRole,
          token_acesso: apiToken
        })
      });
      const json = await response.json();
      if (json.status === 'sucesso') {
        setTextoProtocolo(rascunho);
        setIsEditing(false);
      } else {
        alert(json.msg);
      }
    } catch (e) {
      alert("Erro ao salvar protocolo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-6 h-12 rounded-full font-bold text-sm flex items-center gap-2 transition-colors border shadow-sm ${isOpen ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
      >
        <i className="fa-solid fa-book-open"></i>
        Protocolo
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[600px] max-w-[calc(100vw-2rem)] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm">
              <i className="fa-solid fa-book-open text-blue-600 mr-2"></i>
              Protocolo: {currentDepartment.toUpperCase()}
            </h3>
            <div className="flex gap-2">
               {/* Botão de Editar (Apenas Admin e se não estiver já a editar) */}
               {userRole === 'admin' && !isEditing && (
                 <button onClick={() => setIsEditing(true)} className="text-xs bg-blue-100 text-blue-700 w-7 h-7 flex items-center justify-center rounded hover:bg-blue-200 transition-colors" title="Editar Protocolo">
                   <i className="fa-solid fa-pen"></i>
                 </button>
               )}
               <button onClick={() => setIsOpen(false)} className="w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded flex items-center justify-center transition-colors">
                 <i className="fa-solid fa-xmark text-lg"></i>
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-blue-400">
                 <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3"></i>
                 <p className="text-sm">A carregar diretrizes...</p>
              </div>
            ) : isEditing ? (
              <div className="flex-1 flex flex-col h-full animate-in fade-in">
                <p className="text-xs font-bold text-blue-600 mb-2 uppercase">Modo de Edição (Admin)</p>
                <textarea 
                  className="flex-1 w-full p-4 border border-blue-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm text-slate-700 bg-blue-50/30"
                  placeholder="Escreva as diretrizes do departamento aqui..."
                  value={rascunho}
                  onChange={(e) => setRascunho(e.target.value)}
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setIsEditing(false); setRascunho(textoProtocolo); }} className="px-5 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-bold text-sm transition-colors">
                    Cancelar
                  </button>
                  <button onClick={salvarProtocolo} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-floppy-disk"></i> Guardar Alterações
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm text-slate-600 max-w-none">
                 {textoProtocolo ? (
                   <div className="whitespace-pre-wrap leading-relaxed text-[13px] text-slate-700">
                     {textoProtocolo}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                     <i className="fa-solid fa-file-circle-xmark text-5xl mb-4 opacity-50"></i>
                     <p>Nenhum protocolo foi definido para este departamento ainda.</p>
                     {userRole === 'admin' && <p className="text-xs mt-2">Clique no ícone do lápis acima para adicionar as regras.</p>}
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};