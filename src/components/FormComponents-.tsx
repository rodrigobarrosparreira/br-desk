import React, { useState, useRef } from 'react';

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

interface FormMirrorProps {
  data: Record<string, string>;
  title: string;
  generateMessage: () => string;
  isTerm?: boolean;
}


// Ajuste os caminhos conforme sua pasta public
const LOGO_URL = "/images/brclube2.png";
const ASSINATURA_URL = "/images/assinatura.png"; 

const formatarData = (dataString: string) => {
  if (!dataString) return '';
  const partes = dataString.split('-');
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

export const FormMirror: React.FC<any> = ({ data, title, generateMessage, isTerm }) => {
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const fullMessage = generateMessage();
  const hasData = data && Object.values(data).some(v => v);

  // --- FUNÇÃO DE DOWNLOAD ---
  const handleDownloadPdf = async () => {
    if (!hasData) return;
    setGeneratingPdf(true);

    // 1. Salvar scroll atual e subir para o topo (CRUCIAL para html2canvas)
    const scrollOriginal = window.scrollY;
    window.scrollTo(0, 0);

    // 2. Criar elemento temporário
    const tempDiv = document.createElement('div');
    
    // 3. Estilo para FORÇAR VISIBILIDADE
    // Colocamos fundo branco e z-index alto para cobrir a tela.
    // Isso garante que o navegador "pinte" os pixels.
    Object.assign(tempDiv.style, {
      position: 'absolute', // Absolute respeita o fluxo melhor que fixed nesse caso
      left: '0',
      top: '0',
      width: '100%',     // Ocupa a largura da tela
      height: '100vh',   // Ocupa a altura da tela (fundo branco)
      zIndex: '999999',  // Na frente de TUDO
      backgroundColor: '#ffffff',
      display: 'flex',
      justifyContent: 'center', // Centraliza o papel A4 na tela
      paddingTop: '20px'
    });

    // 4. Container A4 (O papel em si)
    const containerA4 = document.createElement('div');
    Object.assign(containerA4.style, {
      width: '210mm',
      // minHeight: '297mm', // Removido para evitar quebras
      backgroundColor: '#fff',
      padding: '20mm',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#000',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)' // Sombra para você ver que funcionou
    });

    const dataSolicitacao = formatarData(data.data_hoje);
    const dataCancelamento = formatarData(data.data_cancelamento);

    // 5. O Conteúdo HTML (Cópia fiel do seu antigo)
    containerA4.innerHTML = `
        <div>
          <div style="margin-bottom: 40px;">
             <img src="${LOGO_URL}" width="80" style="display: block;" alt="Logo" />
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <strong>TERMO DE CANCELAMENTO</strong>
          </div>

          <div style="text-align: justify; margin-bottom: 30px; line-height: 1.5;">
            Solicito que a partir do dia <strong>${dataCancelamento}</strong>, o cancelamento da filiação do veículo abaixo descrito junto a Associação BR CLUBE DE BENEFÍCIOS. Ciente de que meu veículo se encontra a partir desta data, sem qualquer cobertura, portanto, não mais poderei usufruir de qualquer vantagem oferecida pela BR CLUBE.
          </div>

          <div style="text-align: center; margin-bottom: 10px;">
            <strong>DADOS DO VEÍCULO</strong>
          </div>

          <table style="width: 100%; margin-bottom: 40px; border: 1px solid #ccc; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding: 10px; border-right: 1px solid #ccc;">
                <strong>Tipo:</strong> ${data.tipo || ''}<br>
                <strong>Placa:</strong> ${data.placa || ''}<br>
                <strong>Marca:</strong> ${data.marca || ''}<br>
                <strong>Modelo:</strong> ${data.modelo || ''}<br>
                <strong>Chassi:</strong> ${data.chassi || ''}<br>
              </td>
              <td style="width: 50%; vertical-align: top; padding: 10px;">
                <strong>Renavam:</strong> ${data.renavam || ''}<br>
                <strong>Cor:</strong> ${data.cor || ''}<br>
                <strong>Ano Modelo:</strong> ${data.ano_modelo || ''}<br>
                <strong>Ano Fabricação:</strong> ${data.ano_fabricacao || ''}<br>
                <strong>Código FIPE:</strong> ${data.fipe || ''}<br>
              </td>
            </tr>
          </table>

          <div style="text-align: right; margin-bottom: 40px;">
            Goiânia - ${dataSolicitacao}
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            ________________________________<br>
            <strong>${data.associado || ''}</strong><br>
            CPF: ${data.cpf || ''}
          </div>

          <div style="text-align: center;">
             <img src="${ASSINATURA_URL}" width="150" style="display: block; margin: 0 auto;" alt="Assinatura" />
          </div>
        </div>
    `;

    // Montar a estrutura na tela
    tempDiv.appendChild(containerA4);
    document.body.appendChild(tempDiv);

    try {
      // 6. Esperar carregamento das imagens (CRUCIAL)
      const images = containerA4.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
          return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      });
      await Promise.all(promises);

      // Pequeno delay para o olho humano nem perceber (ou perceber pouco)
      await new Promise(r => setTimeout(r, 300));

      // 7. Gerar PDF
      // @ts-ignore
      const { default: html2pdf } = await import('html2pdf.js');
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Cancelamento_${data.placa || 'Veiculo'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            windowWidth: document.body.scrollWidth // Usa a largura real
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      // Atenção: passamos o 'containerA4' (o papel), não o 'tempDiv' (o fundo branco)
      await html2pdf().set(opt).from(containerA4).save();

    } catch (err) {
      console.error("Erro PDF:", err);
      alert("Erro ao gerar PDF.");
    } finally {
      // 8. Limpar bagunça e devolver scroll
      document.body.removeChild(tempDiv);
      window.scrollTo(0, scrollOriginal);
      setGeneratingPdf(false);
    }
  };

  const handleCopy = () => {
    if (!fullMessage || !hasData) return;
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHtmlContent = (content: string) => /<[^>]+>/.test(content);

  // --- RETURN DO COMPONENTE (SÓ A PARTE VISUAL DO SITE) ---
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl sticky top-8 overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600">
            {isTerm ? 'Visualização do Documento' : 'Preview da Mensagem'}
          </h3>
          <i className={`fa-solid ${isTerm ? 'fa-file-pdf text-red-500' : 'fa-brands fa-whatsapp text-green-500'} text-lg`}></i>
        </div>
        
        <div className="space-y-4">
          <div className="max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
            {hasData ? (
              <div className={`${isTerm ? 'bg-white border-2 border-slate-200' : 'bg-slate-50 border border-slate-100'} rounded-2xl p-6 text-sm text-slate-700 leading-relaxed font-medium break-words relative animate-in fade-in duration-300`}>
                {isHtmlContent(fullMessage) ? (
                  <div dangerouslySetInnerHTML={{ __html: fullMessage }} />
                ) : (
                  fullMessage.split('\n').map((line: string, i: number) => (
                    <div key={i}>{line}</div>
                  ))
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-300 italic text-xs">
                 Os dados preenchidos aparecerão aqui...
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {isTerm ? (
            <button 
              disabled={!hasData || generatingPdf}
              onClick={handleDownloadPdf}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 bg-red-600 text-white hover:bg-red-700"
            >
              {generatingPdf ? (
                <> <i className="fa-solid fa-circle-notch fa-spin"></i> <span>Gerando PDF...</span> </>
              ) : (
                <> <i className="fa-solid fa-file-export"></i> <span>Baixar Documento PDF</span> </>
              )}
            </button>
          ) : (
            <button 
              disabled={!hasData}
              onClick={handleCopy}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 ${copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-white'}`}
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
    <div className="p-6 lg:p-8">
      {children}
    </div>
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
      <button 
        onClick={onReset}
        className="btn-primary text-white px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
      >
        <i className="fa-solid fa-plus"></i>
        <span>Nova Entrada</span>
      </button>
      <button 
        onClick={() => window.location.reload()}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold text-sm transition-all"
      >
        Painel
      </button>
    </div>
  </div>
);
