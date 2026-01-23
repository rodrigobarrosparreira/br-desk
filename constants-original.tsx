import { Department, Template, DepartmentId, UsefulLink } from './types';

export function isHtmlTemplate(template: string): boolean {
  return /<[^>]+>/.test(template);
}

export function processMessageTemplate(
  template: string, 
  data: Record<string, any>,
  isPDF: boolean = false
): string {
  let message = template;
  
  // Substituir placeholders
  Object.entries(data).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  // Lógica condicional para boleto (apenas para templates não-HTML)
  if (data['forma-pagamento'] === 'boleto' && !isHtmlTemplate(template)) {
    message += '\n\n📌 *Importante:* Não perca o prazo de vencimento do boleto!';
  }
  
  return message;
}

export function processPDFTemplate(template: string, data: Record<string, any>): string {
  let processed = processMessageTemplate(template, data, true);
  
  // Se for HTML, retorna como está (será renderizado como HTML no PDF)
  if (isHtmlTemplate(processed)) {
    return processed;
  }
  
  // Se não for HTML, converte quebras de linha em tags HTML
  return `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word;">${processed}</pre>`;
}

export const USEFUL_LINKS: UsefulLink[] = [
  { id: 'portal', label: 'portal', url: 'https://portal.sivisweb.com.br/loja/012/dashboard', icon: 'fa-desktop' },
  { id: 'workspace', label: 'Workspace', url: 'https://mail.google.com/', icon: 'fa-map-location-dot' },
  { id: 'multi', label: 'Multi360', url: 'https://painel.multi360.com.br/', icon: 'fa-users-gear' },
  { id: 'sivis-brclube', label: 'SIVIS BR Clube', url: 'https://sivisweb.com.br/login.php?ex=1&emp=012', icon: 'fa-file-invoice-dollar' },
  { id: 'sivis-left', label: 'SIVIS Left', url: 'https://sivisweb.com.br/login.php?ex=1&emp=013', icon: 'fa-file-pdf' }
];

export const DEPARTMENTS: Department[] = [
  { 
    id: 'assistance', 
    name: 'Assistência 24H', 
    icon: 'fa-truck-medical', 
    description: 'Gestão de socorro e suporte emergencial',
    colorClass: 'bg-red-600',
    submodules: [
      { 
        id: 'assistance_request', 
        name: 'Acionamento de assistência', 
        parentId: 'assistance',
        fields: [
          { id: 'protocolo', label: 'Protocolo' },
          { id: 'data-hora', label: 'Data e Hora', type: 'datetime-local' },
          { id: 'placa', label: 'Placa' },
          { id: 'modelo', label: 'Modelo' },
          { id: 'cor', label: 'Cor' },
          { id: 'solicitante', label: 'Solicitante' },
          { id: 'telefone', label: 'Telefone', type: 'tel', placeholder: '(00) 00000-0000' },
          { id: 'fator-gerador', label: 'Fator Gerador', type: 'select', options:[
            {value: 'pane-eletrica', label: 'Pane Elétrica' },
            {value: 'pane-mecanica', label: 'Pane Mecânica' },
            {value: 'pane-seca', label: 'Pane Seca' },
            {value: 'chave', label: 'Chave' },
            {value: 'pneu', label: 'Pneu furado' },
            {value: 'colisao', label: 'Colisão' }
          ] },
          { id: 'obs-gerador', label: 'Observações do Fator Gerador', type: 'textarea' },
          { id: 'chave-documento', label: 'Chave e Documento estão no local?', type: 'select', options:
            [
              { value: 'sim', label: 'Sim' },
              { value: 'nao', label: 'Não' }
            ]
          },
          { id: 'facil-acesso', label: 'Veículo de fácil acesso?', type: 'select', options:
            [
              { value: 'sim', label: 'Sim' },
              { value: 'nao', label: 'Não' }
            ]
          },
          { id: 'servico', label: 'Serviço' },
          { id: 'endereco-origem', label: 'Endereço de Origem' },
          { id: 'referencia-origem', label: 'Referência de Origem' },
          { id: 'endereco-destino', label: 'Endereço de Destino' },
          { id: 'referencia-destino', label: 'Referência de Destino' },
          { id: 'quilometragem', label: 'Quilometragem' },
          { id: 'quilometragem-total', label: 'Quilometragem Total' }
        ],
        messageTemplate: 
        `
        🚨 *BR CLUBE - NOVO ACIONAMENTO* 🚨\n\n
        *Protocolo:* {{protocolo}}\n
        *Data/Horário:* {{data-hora}}\n
        *Placa:* {{placa}}\n
        *Modelo:* {{modelo}}\n
        *Cor:* {{cor}}\n
        *Solicitante:* {{solicitante}}\n
        *Telefone:* {{telefone}}\n
        *Fator Gerador:* {{fator-gerador}}\n
        *Observações do Fator Gerador:* {{obs-gerador}}\n
        *Chave e Documento no local?:* {{chave-documento}}\n
        *Veículo de fácil acesso?:* {{facil-acesso}}\n
        *Serviço:* {{servico}}\n
        *Endereço de Origem:* {{endereco-origem}}\n
        *Referência de Origem:* {{referencia-origem}}\n
        *Endereço de Destino:* {{endereco-destino}}\n
        *Referência de Destino:* {{referencia-destino}}\n
        *Quilometragem:* {{quilometragem}}\n
        *Quilometragem Total:* {{quilometragem-total}}
        `
      }
    ]
  },
  { 
    id: 'registration', 
    name: 'Cadastro', 
    icon: 'fa-user-plus', 
    description: 'Gestão de cadastro de associados',
    colorClass: 'bg-green-600',
    submodules: [
      { 
        id: 'adesao', 
        name: 'Boas-vindas: Adesão', 
        parentId: 'registration',
        fields: [
          { id: 'associado', label: 'Nome do Associado'},
          { id: 'placa', label: 'Placa' },
          { id: 'vencimento', label: 'Dia de vencimento do boleto' },
          { id: 'telefone', label: 'Telefone' },
          { id: 'endereco', label: 'Endereço' },
          { id: 'cep', label: 'CEP' },
          { id: 'email', label: 'E-mail', type: 'email' },
          { id: 'forma-pagamento', label: 'Forma de Pagamento', type: 'select', options: [
            { value: 'boleto', label: 'Boleto Bancário' },
            { value: 'cartao', label: 'Cartão - cobrança recorrente' }
          ]},
          { id: 'genero', label: 'Gênero', type: 'select', options: [
            { value: 'masculino', label: 'Masculino' },
            { value: 'feminino', label: 'Feminino' }
          ]}
        ],
        messageTemplate: (data: any) => {
          const formaPagamento = data['forma-pagamento'];
          let pagamentoInfo = '';

          if (formaPagamento === 'boleto') {
            pagamentoInfo = `💳 Forma de pagamento da mensalidade: Boleto

Vencimento escolhido: dia {{vencimento}} de cada mês.
O boleto será enviado pelo WhatsApp até 5 dias antes do vencimento.
Evite atrasos, o pagamento em dia é impreterível/imprescindível para manter sua proteção ativa — com todos os seus benefícios.
Não recebeu o boleto até 5 dias antes? Avise-nos com a maior brevidade possível para providenciarmos imediatamente.

Quer mais comodidade?
Você pode optar pela cobrança recorrente no cartão (não usa limite; funciona como assinatura):
🔗 Cadastrar cartão agora: https://portal.sivisweb.com.br/loja/012/login` ;
          } else if (formaPagamento === 'cartao') {
            pagamentoInfo = `💳 Forma de pagamento da mensalidade: Cobrança recorrente no cartão

Sua mensalidade será lançada automaticamente no cartão na data combinada. ✅
✅ Sem boletos • ✅ Sem fricção • ✅ Mais comodidade`;
          }

          return `🎉 Bem-vind${data.genero === 'feminino' ? 'a' : 'o'}, {{associado}}!
Você agora faz parte da comunidade BR Clube!
Nossa missão é cuidar do que é importante para você e estar ao seu lado sempre que precisar.
Com excelência, oferecemos uma nova perspectiva de proteção patrimonial para você e sua família. 💙💙

✅ Confira seus dados cadastrados:
🅿 Placa: {{placa}}
📍 Endereço: {{endereco}}
📬 CEP: {{cep}}
📧 E-mail: {{email}}
📲 Telefone para contato: {{telefone}}
Se encontrar algum erro ou houver mudança de endereço, e-mail, telefone ou CEP, por favor, nos avise prontamente para mantermos seu cadastro atualizado.

${pagamentoInfo}
        
🆘 Canais oficiais
FALE CONOSCO: 4020-0164
ASSISTÊNCIA 24h (Brasil): WhatsApp: 4020-0164 Telefone: 4020-0164

🚀 Continue com a BR Clube
Fique por dentro de benefícios, descontos e conteúdos exclusivos para associados:
🌐 www.brclube.org
📸 @brclubeoficial`;
        }
      },
      { 
        id: 'br-power', 
        name: 'Boas-vindas: BR POWER', 
        parentId: 'registration',
        fields: [
          { id: 'associado', label: 'Nome do Associado'},
          { id: 'codigo', label: 'Código da bateria' },
          { id: 'marca', label: 'Marca' },
          { id: 'amperagem', label: 'Amperagem' }
        ],
        messageTemplate: `🚙 ⚡ Seja bem-vindo ao BR Power {{associado}}!

Parabéns! Agora, sua proteção está ainda mais completa.
Quando a vida útil da bateria {{codigo}}, {{marca}}, {{amperagem}} do seu carro chegar ao fim, e ela não segurar mais carga, a BR Clube vai cuidar de tudo.

Você não vai precisar desembolsar nada a mais no momento da troca.

Nossa equipe técnica vai até você, com rapidez e eficiência, para resolver o problema.

💡 Com o BR Power, você protege seu carro e suas finanças.

Qualquer dúvida, conte com a gente.

🤝 BR Clube — Proteja do seu jeito. Inspire uma nova era.`
      }
    ]
  },
  { 
    id: 'cancellations', 
    name: 'Cancelamentos', 
    icon: 'fa-location-dot', 
    description: 'Cancelamento de serviços',
    colorClass: 'bg-yellow-400',
    submodules: [
      { 
        id: 'cancelamento', 
        name: 'Termo de Cancelamento', 
        isTerm: true,
        parentId: 'cancellations',
        fields: [
          { id: 'associado', label: 'Nome Completo' },
          { id: 'cpf', label: 'CPF' },
          { id: 'tipo', label: 'Tipo de Veículo', type: 'select', options: [
            { value: 'Carro', label: 'Carro' },
            { value: 'Moto', label: 'Moto' },
            { value: 'Caminhão', label: 'Caminhão' }
          ]},
          { id: 'placa', label: 'Placa' },
          { id: 'marca', label: 'Marca' },
          { id: 'modelo', label: 'Modelo' },
          { id: 'chassi', label: 'Chassi'},
          { id: 'renavam', label: 'RENAVAM'},
          { id: 'cor', label: 'Cor'},
          { id: 'ano_modelo', label: 'Ano Modelo'},
          { id: 'ano_fabricacao', label: 'Ano Fabricação'},
          { id: 'fipe', label: 'Código FIPE'},
          { id: 'data_cancelamento', label: 'Data de cancelamento', type: 'date'},
          { id: 'data_hoje', label: 'Data de hoje', type: 'date'}
        ],
        messageTemplate: `<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { margin: 0; text-decoration: underline; font-size: 18px; }
  .section { margin-bottom: 20px; text-align: justify; }
  .section-title { text-align: center; font-weight: bold; margin: 20px 0 10px 0; font-size: 14px; }
  .data-section { margin: 15px 0; }
  .data-item { margin: 8px 0; font-size: 12px; }
  .signature { margin-top: 40px; text-align: center; }
  .line { border-top: 1px solid black; width: 200px; margin: 0 auto 10px auto; }
</style>
</head>
<body>
  <div class="header">
    <h1>TERMO DE CANCELAMENTO</h1>
  </div>

  <div class="section">
    Solicito que a partir do dia <strong>{{data-hoje}}</strong>, o cancelamento da filiação do veículo abaixo descrito junto a Associação BR CLUBE DE BENEFÍCIOS. Ciente de que meu veículo se encontra a partir desta data, sem qualquer cobertura, portanto, não mais poderei usufruir de qualquer vantagem oferecida pela BR CLUBE.
  </div>

  <div class="section-title">DADOS DO VEÍCULO</div>

  <div class="data-section">
    <div class="data-item"><strong>Tipo:</strong> {{tipo}}</div>
    <div class="data-item"><strong>Placa:</strong> {{placa}}</div>
    <div class="data-item"><strong>Marca:</strong> {{marca}}</div>
    <div class="data-item"><strong>Modelo:</strong> {{modelo}}</div>
    <div class="data-item"><strong>Chassi:</strong> {{chassi}}</div>
    <div class="data-item"><strong>RENAVAM:</strong> {{renavam}}</div>
    <div class="data-item"><strong>Cor:</strong> {{cor}}</div>
    <div class="data-item"><strong>Ano modelo:</strong> {{ano-modelo}}</div>
    <div class="data-item"><strong>Ano fabricação:</strong> {{ano-fabricacao}}</div>
    <div class="data-item"><strong>Código FIPE:</strong> {{fipe}}</div>
  </div>

  <div class="signature">
    <div style="text-align: right; margin-bottom: 30px;">Goiânia - {{data-hoje}}</div>
    <div class="line"></div>
    <div>{{associado}}</div>
    <div>CPF: {{cpf}}</div>
  </div>
</body>
</html>`
        
      }
    ]
  },
  { 
    id: 'billing', 
    name: 'Cobrança', 
    icon: 'fa-file-signature', 
    description: 'Cobrança de mensalidades e serviços',
    colorClass: 'bg-indigo-600',
    submodules: [
      { 
        id: 'mensagem_cobranca', 
        name: 'Mensagem de Cobrança', 
        parentId: 'billing',
        fields: [
          { id: 'associado', label: 'Nome Completo', required: true },
          { id: 'cpf', label: 'CPF', required: true },
          { id: 'veiculo', label: 'Veículo', required: true },
          { id: 'placa', label: 'Placa', required: true },
          { id: 'data', label: 'Data da Adesão', type: 'date', required: true },
          { id: 'cidade', label: 'Cidade/UF', required: true }
        ],
        messageTemplate: `TERMO DE ADESÃO E RESPONSABILIDADE\n\nEu, {{associado}}, inscrito sob o CPF {{cpf}}, venho por meio deste confirmar minha adesão à associação BR Clube para o veículo {{veiculo}}, placa {{placa}}.\n\nDeclaro estar ciente de todas as normas e regulamentos da associação.\n\n{{cidade}}, {{data}}.\n\n__________________________________________\nAssinatura do Associado`
      },
      { 
        id: 'termo_acordo', 
        name: 'Termo de Acordo', 
        isTerm: true,
        parentId: 'billing',
        fields: [
          { id: 'associado', label: 'Nome Completo', required: true },
          { id: 'cpf', label: 'CPF', required: true },
          { id: 'veiculo', label: 'Veículo', required: true },
          { id: 'placa', label: 'Placa', required: true },
          { id: 'data', label: 'Data da Adesão', type: 'date', required: true },
          { id: 'cidade', label: 'Cidade/UF', required: true }
        ],
        messageTemplate: `TERMO DE ADESÃO E RESPONSABILIDADE\n\nEu, {{associado}}, inscrito sob o CPF {{cpf}}, venho por meio deste confirmar minha adesão à associação BR Clube para o veículo {{veiculo}}, placa {{placa}}.\n\nDeclaro estar ciente de todas as normas e regulamentos da associação.\n\n{{cidade}}, {{data}}.\n\n__________________________________________\nAssinatura do Associado`
      }
    ]
  },
  { 
    id: 'commercial', 
    name: 'Comercial', 
    icon: 'fa-file-invoice-dollar', 
    description: 'Comunicação comercial e promoções',
    colorClass: 'bg-green-600',
    submodules: [
      { 
        id: 'enviar-associado', 
        name: 'Enviar para Associado', 
        parentId: 'commercial',
        fields: [
          { id: 'associado', label: 'Associado', required: true },
          { id: 'valor', label: 'Valor (R$)', type: 'number', placeholder: '0.00' },
          { id: 'vencimento', label: 'Data de Vencimento', type: 'date' },
          { id: 'link_boleto', label: 'Link do Boleto', placeholder: 'https://...' }
        ],
        messageTemplate: `💰 *BR CLUBE - LEMBRETE DE PAGAMENTO*\n\nOlá *{{associado}}*,\nSua mensalidade no valor de *R$ {{valor}}* vence no dia *{{vencimento}}*.\n\n🔗 Acesse seu boleto aqui: {{link_boleto}}\n\nEvite a suspensão dos seus benefícios.`
      },
      { 
        id: 'confirmar-recebimento', 
        name: 'Confirmar Recebimento do Kit', 
        parentId: 'commercial',
        fields: [
          { id: 'associado', label: 'Associado', required: true },
          { id: 'valor', label: 'Valor (R$)', type: 'number', placeholder: '0.00' },
          { id: 'vencimento', label: 'Data de Vencimento', type: 'date' },
          { id: 'link_boleto', label: 'Link do Boleto', placeholder: 'https://...' }
        ],
        messageTemplate: `💰 *BR CLUBE - LEMBRETE DE PAGAMENTO*\n\nOlá *{{associado}}*,\nSua mensalidade no valor de *R$ {{valor}}* vence no dia *{{vencimento}}*.\n\n🔗 Acesse seu boleto aqui: {{link_boleto}}\n\nEvite a suspensão dos seus benefícios.`
      }
    ]
  },
  {
    id: 'events',
    name: 'Eventos',
    icon: 'fa-calendar-alt',
    description: 'Acionamento e termos de eventos',
    colorClass: 'bg-red-600',
    submodules: [
      {
        id: 'agendamento-oficina',
        name: 'Agendamento para Oficina',
        parentId: 'events',
        fields: [
          { id: 'associado', label: 'Associado', required: true },
          { id: 'agendamento', label: 'Data e Hora da Instalação', type: 'datetime-local', required: true },
          { id: 'tecnico', label: 'Técnico Responsável' },
          { id: 'local', label: 'Endereço Completo', type: 'textarea', required: true }
        ],
        messageTemplate: `📍 *BR CLUBE - AGENDAMENTO DE RASTREIO*\n\nOlá *{{associado}}*,\nSeu agendamento para oficina foi confirmado para o dia *{{agendamento}}*.\n\n📍 Local: {{local}}\n\nTécnico Responsável: {{tecnico}}`
      },
      {
        id: 'termo-entrega-veiculo',
        name: 'Termo de Entrega de Veículo',
        isTerm: true,
        parentId: 'events',
        fields: [
          { id: 'associado', label: 'Associado', required: true },
          { id: 'agendamento', label: 'Data e Hora da Instalação', type: 'datetime-local', required: true },
          { id: 'tecnico', label: 'Técnico Responsável' },
          { id: 'local', label: 'Endereço Completo', type: 'textarea', required: true }
        ],
        messageTemplate: `📍 *BR CLUBE - AGENDAMENTO DE RASTREIO*\n\nOlá *{{associado}}*,\nSeu agendamento para oficina foi confirmado para o dia *{{agendamento}}*.\n\n📍 Local: {{local}}\n\nTécnico Responsável: {{tecnico}}`
      },
      {
        id: 'termo-acionamento',
        name: 'Termo de Acionamento',
        isTerm: true,
        parentId: 'events',
        fields: [
          { id: 'associado', label: 'Associado', required: true },
          { id: 'agendamento', label: 'Data e Hora da Instalação', type: 'datetime-local', required: true },
          { id: 'tecnico', label: 'Técnico Responsável' },
          { id: 'local', label: 'Endereço Completo', type: 'textarea', required: true }
        ],
        messageTemplate: `📍 *BR CLUBE - AGENDAMENTO DE RASTREIO*\n\nOlá *{{associado}}*,\nSeu agendamento para oficina foi confirmado para o dia *{{agendamento}}*.\n\n📍 Local: {{local}}\n\nTécnico Responsável: {{tecnico}}`
      }
    ]
  },
  {
    id: 'tracking',
    name: 'Rastreamento',
    icon: 'fa-map-marker-alt',
    description: 'Agendamento e termos de rastreamento',
    colorClass: 'bg-blue-600',
    submodules: [
      {
        id: 'termo-recebimento-rastreador',
        name: 'Termo de Recebimento do Rastreador',
        isTerm: true,
        parentId: 'tracking',
        fields: [

        ]
      },
      {
        id: 'protocolo-instalar-rastreador',
        name: 'Protocolo: Agendar Instalação do Rastreador',
        parentId: 'tracking',
        fields: [

        ]
      },
      {
        id: 'orientacoes-rastreamento',
        name: 'Orientações pós-instalação de rastreador',
        parentId: 'tracking',
        fields: [
          
        ]
      }
    ]
  }
];

export const DEPARTMENT_TEMPLATES: Record<DepartmentId, Template[]> = {
  home: [], assistance: [], registration: [], tracking: [], events: [], cancellations: [], billing: [], commercial: [], legal: []
};

