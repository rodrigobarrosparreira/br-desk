import React, { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    // Verifica se já carregou para não duplicar
    if (document.getElementById('botpress-inject')) return;

    // 1. Carrega o MOTOR do chat (Versão 3.5 conforme seu link)
    const scriptEngine = document.createElement('script');
    scriptEngine.src = "https://cdn.botpress.cloud/webchat/v3.5/inject.js";
    scriptEngine.async = true;
    scriptEngine.id = 'botpress-inject';
    
    // 2. Assim que o motor estiver pronto, carrega sua CONFIGURAÇÃO
    scriptEngine.onload = () => {
      const scriptConfig = document.createElement('script');
      // ESSE ARQUIVO CONTÉM SEUS IDS (botId e clientId) AUTOMATICAMENTE:
      scriptConfig.src = "https://files.bpcontent.cloud/2026/01/23/17/20260123174007-ESP554MP.js";
      scriptConfig.defer = true;
      document.body.appendChild(scriptConfig);
    };

    // Injeta o motor na página
    document.body.appendChild(scriptEngine);

    // Opcional: Limpeza ao sair da página
    return () => {
       // Geralmente não removemos o script em SPAs para manter o histórico do chat
    };
  }, []);

  // Div âncora onde o bot vai se prender (necessário em algumas versões)
  return <div id="bp-web-widget-container" />;
};

export default Chatbot;