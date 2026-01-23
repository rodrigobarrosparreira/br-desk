import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { TermoAcordoPDF, CobrancaPDF, TermoCancelamentoPDF, EntregaVeiculoPDF, TermoAcordoAmparoPDF, TermoRecebimentoRastreadorPDF, RecebimentoPecasPDF } from '../PDFTemplates'; // Certifique-se que o caminho está certo

// Hook para atrasar a atualização de um valor
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// --- FUNÇÃO AUXILIAR PARA ESCOLHER O TEMPLATE ---
const getPdfComponent = (type: string | undefined, data: any) => {
  switch (type) {
    case 'termo_acordo': return <TermoAcordoPDF data={data} />;
    case 'cobranca': return <CobrancaPDF data={data} />;
    case 'termo_cancelamento' : return <TermoCancelamentoPDF data={data} />;
    case 'entrega_veiculo' : return <EntregaVeiculoPDF data = {data}/>;
    case 'termo_acordo_amparo' : return <TermoAcordoAmparoPDF data = {data}/>;
    case 'termo_recebimento_rastreador' : return <TermoRecebimentoRastreadorPDF data = {data}/>
    case 'termo_pecas' : return <RecebimentoPecasPDF data = {data}/>
    // Adicione outros cases conforme for criando os templates
    default: return null;
  }
};

// --- COMPONENTES DE UI ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="space-y-1.5 group">
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-cyan-600 transition-colors">{label}</label>
    <input 
      {...props}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all duration-200 text-slate-700 text-sm font-medium placeholder:text-slate-400 input-focus shadow-sm hover:border-slate-300"
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => (
  <div className="space-y-1.5 group">
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-cyan-600 transition-colors">{label}</label>
    <div className="relative">
      <select 
        {...props}
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all duration-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:border-slate-300 appearance-none cursor-pointer"
      >
        <option value="">Selecione...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <i className="fa-solid fa-chevron-down text-xs"></i>
      </div>
    </div>
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, ...props }) => (
  <div className="space-y-1.5 group">
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-cyan-600 transition-colors">{label}</label>
    <textarea 
      {...props}
      rows={3}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all duration-200 text-slate-700 text-sm font-medium placeholder:text-slate-400 shadow-sm hover:border-slate-300 resize-none"
    />
  </div>
);

// --- AUXILIAR: IMAGEM + PROPORÇÃO ---
interface ImageMeta {
  base64: string;
  width: number;
  height: number;
  ratio: number;
}

const getImageFromURL = (url: string): Promise<ImageMeta> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve({
        base64: dataURL,
        width: img.width,
        height: img.height,
        ratio: img.height / img.width 
      });
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
};


// --- COMPONENTE: CAMPO DE REPETIÇÃO ---
interface RepeaterProps {
  field: any;
  value: any[];
  onChange: (newValue: any[]) => void;
}

export const RepeaterField: React.FC<RepeaterProps> = ({ field, value = [], onChange }) => {
  
  const handleAddItem = () => {
    onChange([...value, {}]);
  };

  const handleRemoveItem = (index: number) => {
    const newVal = value.filter((_, i) => i !== index);
    onChange(newVal);
  };

  const handleSubFieldChange = (index: number, subId: string, subValue: string) => {
    const newVal = [...value];
    if (!newVal[index]) newVal[index] = {};
    newVal[index] = { ...newVal[index], [subId]: subValue };
    onChange(newVal);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
          {field.label}
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
        >
          <i className="fa-solid fa-plus"></i>
          <span>{field.addButtonLabel || 'Adicionar'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="relative bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in slide-in-from-left-2 duration-300">
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="absolute right-2 top-2 text-slate-300 hover:text-red-500 transition-colors p-1"
              title="Remover item"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>

            <div className="grid gap-3">
              <div className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Item #{index + 1}
              </div>
              
              {field.subFields?.map((subField: any) => {
                const commonProps = {
                   key: subField.id,
                   label: subField.label,
                   placeholder: subField.placeholder,
                   value: item[subField.id] || '',
                   onChange: (e: any) => handleSubFieldChange(index, subField.id, e.target.value)
                };

                if (subField.type === 'date') return <Input type="date" {...commonProps} />;
                if (subField.type === 'number') return <Input type="number" {...commonProps} />;
                return <Input type="text" {...commonProps} />;
              })}
            </div>
          </div>
        ))}

        {value.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs italic">
            Nenhum item adicionado ainda.
          </div>
        )}
      </div>
    </div>
  );
};

// --- FORM MIRROR (Versão 1-Clique Imperativa) ---

interface FormMirrorProps {
  data: Record<string, string>;
  title: string;
  generateMessage: () => string;
  isTerm?: boolean;
  isBlank?: boolean;
  pdfType?: string;
}

export const FormMirror: React.FC<FormMirrorProps> = ({ data, title, generateMessage, isTerm, isBlank, pdfType }) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Controla o loading do botão

  const fullMessage = generateMessage();
  const hasData = data && Object.values(data).some(v => v);

  // --- FUNÇÃO MÁGICA: GERA E BAIXA NO CLIQUE ---
  const handleDownloadNewPdf = async () => {
    if (!hasData) return;
    setIsGenerating(true);

    try {
      // 1. Pega o componente correto baseado no tipo
      const MyDocComponent = getPdfComponent(pdfType, data);
      if (!MyDocComponent) return;

      // 2. Gera o BLOB do PDF manualmente (isso não trava a digitação antes do clique)
      const blob = await pdf(MyDocComponent).toBlob();

      // 3. Cria um link invisível para forçar o download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_${data.associado || 'doc'}.pdf`;
      document.body.appendChild(link);
      link.click();

      // 4. Limpeza
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o documento.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (handleLegacyDownloadPdf e handleCopy e isHtmlContent continuam iguais) ...
  // Vou manter oculto para não poluir, mas você deve manter as funções antigas aqui
  const handleLegacyDownloadPdf = async () => { /* ... código do html2pdf ... */ };
  const handleCopy = () => { /* ... código de copiar ... */ };
  const isHtmlContent = (c: string) => /<[^>]+>/.test(c);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl sticky top-8 overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
      <div className="relative z-10">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600">
            {isTerm ? 'Visualização do Documento' : 'Preview da Mensagem'}
          </h3>
          <i className={`fa-solid ${isTerm ? 'fa-file-pdf text-red-500' : 'fa-brands fa-whatsapp text-green-500'} text-lg`}></i>
        </div>

        {/* Preview Texto */}
        <div className="space-y-4">
          <div className="max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
            {hasData ? (
              <div className={`${isTerm ? 'bg-white border-2 border-slate-200' : 'bg-slate-50 border border-slate-100'} rounded-2xl p-6 text-sm text-slate-700 leading-relaxed font-medium break-words relative animate-in fade-in duration-300`}>
                {isHtmlContent(fullMessage) ? (
                  <div dangerouslySetInnerHTML={{ __html: fullMessage }} />
                ) : (
                  fullMessage.split('\n').map((line: string, i: number) => <div key={i}>{line}</div>)
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-300 italic text-xs">Os dados preenchidos aparecerão aqui...</div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="mt-8 space-y-3">
          {isTerm ? (
            <>
              {/* LÓGICA DO NOVO BOTÃO (1 CLIQUE) */}
              {pdfType ? (
                <button
                  disabled={!hasData || isGenerating}
                  onClick={handleDownloadNewPdf}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <> <i className="fa-solid fa-circle-notch fa-spin"></i> <span>Gerando PDF...</span> </>
                  ) : (
                    <> <i className="fa-solid fa-file-export"></i> <span>Baixar PDF (Oficial)</span> </>
                  )}
                </button>
              ) : (
                /* Botão Legado (html2pdf) */
                <button 
                  disabled={!hasData} // Removi generatingPdf daqui pra simplificar exemplo, use seu estado local
                  onClick={handleLegacyDownloadPdf}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 bg-slate-700 text-white hover:bg-slate-800"
                >
                  <i className="fa-solid fa-file-export"></i> <span>Baixar PDF (Legacy)</span>
                </button>
              )}
            </>
          ) : (
            /* Botão WhatsApp */
            <button 
              disabled={!hasData}
              onClick={handleCopy}
              className={`w-full py-3.5 px-4 rounded-xl ... ${copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-white'}`}
            >
              {copied ? 'Copiado!' : 'Copiar Mensagem'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const FormCard: React.FC<{ title: string; children: React.ReactNode; icon: string }> = ({ title, children, icon }) => (
  <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
    <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex items-center space-x-4">
      <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-100">
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">{title}</h2>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Entrada de Dados</p>
      </div>
    </div>
    <div className="p-6 lg:p-8">{children}</div>
  </div>
);

export const SuccessMessage: React.FC<{ message: string; onReset: () => void }> = ({ message, onReset }) => (
  <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl p-10 text-center animate-in fade-in zoom-in duration-500 max-w-lg mx-auto">
    <div className="w-20 h-20 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-green-100 mb-6 rotate-3">
      <i className="fa-solid fa-check text-4xl"></i>
    </div>
    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Sucesso!</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{message}</p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button onClick={onReset} className="btn-primary text-white px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2">
        <i className="fa-solid fa-plus"></i><span>Nova Entrada</span>
      </button>
      <button onClick={() => window.location.reload()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold text-sm transition-all">Painel</button>
    </div>
  </div>
);