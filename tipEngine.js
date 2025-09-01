const defaultPrompts = {
  geral: [
    'Explique sua lógica passo a passo em voz alta.',
    'O que é essencial nesta situação e o que você pode ignorar?',
    'Se mudássemos o contexto, sua solução ainda faria sentido?'
  ],
  padroes: [
    'Esse comportamento se repete em outros exemplos?',
    'Se fosse prever o próximo valor, em que base você se apoiaria?',
    'O crescimento é constante? O quanto varia a cada passo?'
  ],
  abstracao: [
    'Quais dados você pode descartar sem prejudicar sua análise?',
    'Como representaria o problema de forma resumida para alguém de fora?',
    'Se só restasse essa informação, sua solução ainda faria sentido?'
  ],
  algoritmo: [
    'A ordem dos passos está lógica para qualquer pessoa que siga?',
    'Se algo der errado no meio, seu algoritmo prevê alternativas?',
    'Teste passo a passo: em qual momento seu plano falha?'
  ],
  generalizacao: [
    'Em que outros contextos essa regra pode funcionar?',
    'O que mudaria se as condições fossem diferentes?',
    'Qual é a lógica que continua igual mesmo mudando o cenário?'
  ]
};

function mountTip(selector, { pillar = 'geral', level = 'Cue', prompts } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  const items = prompts && prompts.length ? prompts : defaultPrompts[pillar] || defaultPrompts.geral;
  const current = items[Math.floor(Math.random() * items.length)];
  el.innerHTML = `
    <div>
      <div class="badge">${level}</div>
      <div>${current}</div>
    </div>
  `;
}

function defaultPromptsFor(pillar) {
  return defaultPrompts[pillar] || defaultPrompts.geral;
}

export const TipEngine = { mountTip, defaultPromptsFor };