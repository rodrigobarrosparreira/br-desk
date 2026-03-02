import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';

interface AttendanceWidgetProps {
  currentDepartment: string;
  apiUrl: string;
  apiToken: string;
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ currentDepartment, apiUrl, apiToken }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    protocolo: '',
    tipo_registro: '',
    canal_entrada: '',
    categoria_demanda: '',
    relato: '',
    percepcao_satisfacao: '',
    pendencias_futuras: '',
    prazo_retorno: '',
    motivo_fechamento: ''
  });

  // Calcula 24h para frente quando "Sim" é selecionado
  useEffect(() => {
    if (formData.pendencias_futuras === 'sim' && !formData.prazo_retorno) {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      // Formata para o input datetime-local (YYYY-MM-DDThh:mm)
      const formatted = tomorrow.toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, prazo_retorno: formatted }));
    } else if (formData.pendencias_futuras !== 'sim') {
      setFormData(prev => ({ ...prev, prazo_retorno: '' }));
    }
  }, [formData.pendencias_futuras]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      action: 'salvar_registro_atendimento',
      ...formData,
      atendente: profile?.full_name || profile?.email,
      departamento: currentDepartment,
      token_acesso: apiToken
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
      
      if (json.status === 'sucesso') {
        alert('✅ ' + json.msg);
        setIsOpen(false);
        // Reseta o form
        setFormData({ protocolo: '', tipo_registro: '', canal_entrada: '', categoria_demanda: '', relato: '', percepcao_satisfacao: '', pendencias_futuras: '', prazo_retorno: '', motivo_fechamento: '' });
      } else {
        alert('❌ Erro: ' + json.msg);
      }
    } catch (err) {
      alert('❌ Erro de conexão ao salvar o registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* O BOTÃO NA BARRA (PILL) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="h-10 px-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all duration-300 shadow-sm hover:shadow-indigo-200 group"
        title="Novo Registro de Atendimento"
      >
        <i className="fa-solid fa-headset group-hover:scale-110 transition-transform"></i>
        <span className="text-[11px] font-black uppercase tracking-wider leading-none">Registro</span>
      </button>

      {/* O MODAL ENVIADO PARA A RAIZ DO SITE (PORTAL) */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100000] overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
              
              {/* CABEÇALHO */}
              <div className="bg-slate-50 border-b border-slate-100 p-5 px-6 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <i className="fa-solid fa-headset text-indigo-500"></i> Registro de Atendimento
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              {/* ÁREA DE SCROLL */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <form id="attendance-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nº do Protocolo</label>
                    <input required type="text" name="protocolo" value={formData.protocolo} onChange={handleChange} placeholder="Digite o protocolo..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold bg-slate-50 focus:bg-white transition-all" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo de Registro</label>
                    <select required name="tipo_registro" value={formData.tipo_registro} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium">
                      <option value="">Selecione...</option>
                      <option value="Receptivo">Receptivo</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Registro de Ligação">Registro de Ligação</option>
                      <option value="Tentativa de Contato">Tentativa de Contato</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Canal de Entrada</label>
                    <select required name="canal_entrada" value={formData.canal_entrada} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium">
                      <option value="">Selecione...</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Telefone">Telefone</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Presencial">Presencial</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Categoria da Demanda</label>
                    <select required name="categoria_demanda" value={formData.categoria_demanda} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium">
                      <option value="">Selecione...</option>
                      <option value="Informação">Informação</option>
                      <option value="2ª via de boleto">2ª via de boleto</option>
                      <option value="Assistência 24h">Assistência 24h</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Cancelamento">Cancelamento</option>
                      <option value="Reclamação">Reclamação</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Relato / Providências</label>
                    <textarea required name="relato" value={formData.relato} onChange={handleChange} rows={3} placeholder="Descreva o que foi solicitado e as ações tomadas..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium resize-none transition-all"></textarea>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Percepção de Satisfação</label>
                    <select required name="percepcao_satisfacao" value={formData.percepcao_satisfacao} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium">
                      <option value="">Selecione...</option>
                      <option value="Satisfeito">😊 Satisfeito</option>
                      <option value="Satisfeito (Aguarda Retorno)">⏳ Satisfeito (Aguarda Retorno)</option>
                      <option value="Neutro">😐 Neutro</option>
                      <option value="Insatisfeito">🙁 Insatisfeito</option>
                      <option value="Reclamação Formal">😡 Reclamação Formal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Pendências Futuras?</label>
                    <div className="flex gap-3">
                      <label className={`flex-1 py-2.5 border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors ${formData.pendencias_futuras === 'sim' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" name="pendencias_futuras" value="sim" onChange={handleChange} required className="hidden" /> Sim
                      </label>
                      <label className={`flex-1 py-2.5 border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors ${formData.pendencias_futuras === 'nao' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" name="pendencias_futuras" value="nao" onChange={handleChange} required className="hidden" /> Não
                      </label>
                    </div>
                  </div>

                  <div className={`space-y-1 transition-opacity ${formData.pendencias_futuras === 'sim' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Prazo de Retorno</label>
                    <input type="datetime-local" name="prazo_retorno" value={formData.prazo_retorno} onChange={handleChange} required={formData.pendencias_futuras === 'sim'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium" />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Motivo do Fechamento</label>
                    <select required name="motivo_fechamento" value={formData.motivo_fechamento} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium">
                      <option value="">Selecione...</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Encaminhado">Encaminhado para outro setor</option>
                      <option value="Inatividade do Associado">Inatividade do Associado</option>
                      <option value="Desistência">Desistência</option>
                    </select>
                  </div>
                </form>
              </div>

              {/* RODAPÉ */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0">
                <button 
                  form="attendance-form" 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Salvando...</> : <><i className="fa-solid fa-check"></i> Registrar Atendimento</>}
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body // 👈 ONDE A MÁGICA ACONTECE: Renderiza direto no body
      )}
    </>
  );
};