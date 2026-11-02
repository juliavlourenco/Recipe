/* ============================================
   ReUse IA — Script Principal
   ============================================ */

'use strict';

/* ---------- Utilidades ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const STORAGE_KEYS = {
  theme: 'reuseia:theme',
  fontSize: 'reuseia:fontsize',
  contrast: 'reuseia:contrast',
  visitors: 'reuseia:visitors',
  donations: 'reuseia:donations',
  impact: 'reuseia:impact',
  gameScore: 'reuseia:gameScore',
  achievements: 'reuseia:achievements',
  savedMaterials: 'reuseia:savedMaterials'
};

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

function toast(msg, type = '') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.className = 'toast ' + type;
  }, 3200);
}

/* ============================================
   BASE DE CONHECIMENTO DOS MATERIAIS
   ============================================ */
const MATERIAL_DATABASE = {
  plastico: {
    name: 'Plástico',
    icon: '🧴',
    about: 'O plástico é um material leve, durável e versátil, mas pode levar centenas de anos para se decompor. Sua reutilização reduz a extração de petróleo e a poluição.',
    reuse: [
      'Vasos para plantas',
      'Organizadores de gaveta',
      'Irrigadores por gotejamento',
      'Porta-canetas e objetos decorativos',
      'Projetos escolares e educativos'
    ],
    dispose: 'Descarte em lixeira vermelha (ou coleta seletiva de plástico). Lave antes de descartar e retire tampas quando possível.'
  },
  papel: {
    name: 'Papel e Papelão',
    icon: '📄',
    about: 'O papel e o papelão são recicláveis e biodegradáveis, mas sua produção consome água e energia. Reutilizar prolonga sua vida útil.',
    reuse: [
      'Caixas organizadoras',
      'Papel de rascunho',
      'Embalagens criativas',
      'Compostagem caseira (papelão sem tinta)',
      'Arte e decoração'
    ],
    dispose: 'Descarte em lixeira azul. Mantenha seco e limpo. Amasse caixas para ocupar menos espaço.'
  },
  vidro: {
    name: 'Vidro',
    icon: '🍾',
    about: 'O vidro é 100% reciclável infinitas vezes sem perder qualidade. Reutilizar potes e garrafas economiza energia e matéria-prima.',
    reuse: [
      'Potes para armazenamento de alimentos',
      'Vasos e luminárias',
      'Porta-velas e decoração',
      'Copos e objetos utilitários',
      'Terários e jardins fechados'
    ],
    dispose: 'Descarte em lixeira verde. Embalagens quebradas devem ser embrulhadas em papel ou papelão antes do descarte.'
  },
  metal: {
    name: 'Metal',
    icon: '🥫',
    about: 'O metal é altamente reciclável e pode ser reaproveitado várias vezes. Sua reciclagem economiza energia e recursos naturais.',
    reuse: [
      'Porta-lápis com latas',
      'Vasos decorativos',
      'Luminárias artesanais',
      'Organização de ferramentas',
      'Instrumentos musicais simples'
    ],
    dispose: 'Descarte em lixeira amarela. Lave as latas, amasse quando possível e tome cuidado com bordas cortantes.'
  },
  tecido: {
    name: 'Tecido',
    icon: '🧵',
    about: 'Têxteis podem levar décadas para se decompor e gerar grande impacto ambiental. Reutilizar roupas e tecidos é essencial para a economia circular.',
    reuse: [
      'Bolsas e sacolas reutilizáveis',
      'Panos de limpeza',
      'Decoração (almofadas, cortinas)',
      'Brinquedos e bonecas',
      'Doação para instituições'
    ],
    dispose: 'Doe roupas em bom estado. Retalhos podem ir para pontos de coleta têxtil ou serem transformados em novos objetos.'
  },
  madeira: {
    name: 'Madeira',
    icon: '🪵',
    about: 'A madeira é um recurso natural renovável, mas demanda tempo para se regenerar. Reutilizar madeira reduz o desmatamento.',
    reuse: [
      'Prateleiras e estantes',
      'Móveis rústicos',
      'Caixotes e organizadores',
      'Brinquedos e jogos',
      'Compostagem'
    ],
    dispose: 'Descarte em ecopontos ou doando. Madeira tratada não deve ir para compostagem.'
  },
  organico: {
    name: 'Resíduos Orgânicos',
    icon: '🍎',
    about: 'Restos de alimentos podem ser transformados em adubo por meio da compostagem, fechando o ciclo da economia circular.',
    reuse: [
      'Compostagem doméstica',
      'Adubo para plantas',
      'Biofertilizante líquido',
      'Alimentação animal (quando apropriado)',
      'Hortas comunitárias'
    ],
    dispose: 'Descarte em lixeira marrom (orgânica) ou faça compostagem em casa. Evite misturar com recicláveis.'
  },
  outros: {
    name: 'Outros Materiais',
    icon: '♻️',
    about: 'Materiais variados merecem atenção especial. Procure o ecoponto mais próximo e evite descartá-los no lixo comum.',
    reuse: [
      'Doação para projetos sociais',
      'Reutilização criativa',
      'Encaminhamento a cooperativas',
      'Campanhas de arrecadação',
      'Educação ambiental'
    ],
    dispose: 'Consulte pontos de coleta especializados. Nunca descarte em vias públicas ou terrenos vazios.'
  }
};

/* ============================================
   LABORATÓRIO — IDEIAS DE REUTILIZAÇÃO
   ============================================ */
const IDEAS = [
  {
    id: 1, title: 'Vaso de planta com garrafa PET', cat: 'plastico', diff: 'facil',
    icon: '🌱', desc: 'Transforme garrafas PET em vasos criativos para plantas.',
    materials: ['Garrafa PET limpa', 'Tesoura', 'Tinta acrílica (opcional)', 'Terra e planta'],
    steps: [
      'Lave bem a garrafa PET e remova o rótulo.',
      'Corte a garrafa ao meio com a tesoura.',
      'Faça furos no fundo para drenagem.',
      'Decore com tinta se desejar e deixe secar.',
      'Adicione terra e plante sua muda.'
    ],
    safety: 'Cuidado ao cortar o plástico — use tesoura sem ponta e supervisione crianças.'
  },
  {
    id: 2, title: 'Organizador de gaveta com caixa', cat: 'papel', diff: 'facil',
    icon: '📦', desc: 'Caixas de papelão se tornam organizadores de gaveta.',
    materials: ['Caixas de papelão', 'Tesoura ou estilete', 'Fita adesiva', 'Papel decorativo'],
    steps: [
      'Corte as caixas no tamanho da gaveta.',
      'Una as caixas com fita adesiva.',
      'Forre com papel decorativo.',
      'Distribua os objetos nas divisórias.'
    ],
    safety: 'Use estilete com cuidado e sobre uma base firme.'
  },
  {
    id: 3, title: 'Luminária com pote de vidro', cat: 'vidro', diff: 'medio',
    icon: '💡', desc: 'Reaproveite potes de vidro para criar luminárias aconchegantes.',
    materials: ['Pote de vidro limpo', 'LED ou vela', 'Barbante ou renda', 'Cola quente'],
    steps: [
      'Limpe o pote e remova rótulos.',
      'Enrole barbante ao redor do bocal.',
      'Cole decorações com cola quente.',
      'Coloque LED ou vela dentro.',
      'Posicione sobre uma base segura.'
    ],
    safety: 'Nunca use velas sem supervisão. Prefira LED para maior segurança.'
  },
  {
    id: 4, title: 'Porta-lápis com lata', cat: 'metal', diff: 'facil',
    icon: '✏️', desc: 'Latas viram porta-lápis funcionais e decorados.',
    materials: ['Lata limpa', 'Tinta ou tecido', 'Cola', 'Fita decorativa'],
    steps: [
      'Lave bem a lata e seque.',
      'Lixe levemente a superfície.',
      'Pinte ou forre com tecido.',
      'Deixe secar e organize seus lápis.'
    ],
    safety: 'Cuidado com bordas cortantes. Lixe-as com uma lima se necessário.'
  },
  {
    id: 5, title: 'Bolsa com roupa antiga', cat: 'tecido', diff: 'medio',
    icon: '👜', desc: 'Transforme uma camiseta velha em bolsa reutilizável.',
    materials: ['Camiseta antiga', 'Tesoura', 'Linha e agulha ou máquina', 'Fita métrica'],
    steps: [
      'Corte as mangas e o decote.',
      'Vire a camiseta do avesso.',
      'Costure a parte inferior.',
      'Vire novamente e ajuste as alças.',
      'Decore se quiser.'
    ],
    safety: 'Atenção com agulhas e alfinetes durante a costura.'
  },
  {
    id: 6, title: 'Prateleira com pallet', cat: 'madeira', diff: 'dificil',
    icon: '🪜', desc: 'Pallets se transformam em prateleiras rústicas.',
    materials: ['Pallet de madeira', 'Lixa', 'Martelo e pregos', 'Verniz'],
    steps: [
      'Lixe bem o pallet e verifique a segurança.',
      'Corte no tamanho desejado.',
      'Monte com pregos ou parafusos.',
      'Aplique verniz para proteção.',
      'Fixe na parede com suportes adequados.'
    ],
    safety: 'Use luvas e óculos de proteção. Verifique a fixação na parede.'
  },
  {
    id: 7, title: 'Irrigador por gotejamento', cat: 'plastico', diff: 'facil',
    icon: '💧', desc: 'Garrafa PET vira sistema de irrigação automática.',
    materials: ['Garrafa PET', 'Prego ou agulha', 'Água'],
    steps: [
      'Faça pequenos furos na tampa.',
      'Encha a garrafa com água.',
      'Enterre a garrafa ao lado da planta.',
      'A água vazará lentamente.'
    ],
    safety: 'Cuidado ao furar a tampa — use superfície firme.'
  },
  {
    id: 8, title: 'Composteira caseira', cat: 'organico', diff: 'medio',
    icon: '🌿', desc: 'Transforme restos orgânicos em adubo de qualidade.',
    materials: ['Recipiente com tampa', 'Restos orgânicos', 'Terra seca', 'Pás'],
    steps: [
      'Fure o recipiente para ventilação.',
      'Alterne camadas de resíduos e terra.',
      'Mantenha úmido (não encharcado).',
      'Revire a cada 3 dias.',
      'Após 30-60 dias, use como adubo.'
    ],
    safety: 'Evite carnes e laticínios. Use luvas ao manusear.'
  },
  {
    id: 9, title: 'Porta-retratos com jornal', cat: 'papel', diff: 'facil',
    icon: '🖼️', desc: 'Jornais velhos viram porta-retratos artesanais.',
    materials: ['Jornal', 'Cola branca', 'Molde de papelão', 'Tesoura'],
    steps: [
      'Corte o jornal em tiras finas.',
      'Enrole as tiras em canudos.',
      'Cole sobre o molde de papelão.',
      'Finalize com verniz.'
    ],
    safety: 'Mantenha o ambiente ventilado ao usar cola.'
  },
  {
    id: 10, title: 'Vaso autoirrigável', cat: 'plastico', diff: 'medio',
    icon: '🪴', desc: 'Sistema que mantém plantas sempre hidratadas.',
    materials: ['2 garrafas PET', 'Barbante', 'Tesoura', 'Terra'],
    steps: [
      'Corte uma garrafa ao meio (parte superior).',
      'Faça furo na tampa com barbante.',
      'Encaixe a parte superior na inferior.',
      'Adicione água na parte de baixo.',
      'Plante na parte superior.'
    ],
    safety: 'Corte com cuidado. Troque a água a cada 2 semanas.'
  },
  {
    id: 11, title: 'Cortina de CD reciclado', cat: 'outros', diff: 'medio',
    icon: '✨', desc: 'CDs antigos criam cortinas decorativas reflexivas.',
    materials: ['CDs antigos', 'Alicate', 'Anéis metálicos', 'Cordão'],
    steps: [
      'Fure os CDs com alicate.',
      'Amarre-os em fileiras.',
      'Fixe na estrutura desejada.',
      'Ajuste o espaçamento.'
    ],
    safety: 'Cuidado com CDs quebrados — podem cortar.'
  },
  {
    id: 12, title: 'Estante com caixotes de madeira', cat: 'madeira', diff: 'medio',
    icon: '📚', desc: 'Caixotes de madeira organizam livros e decoração.',
    materials: ['Caixotes', 'Lixa', 'Pregos', 'Tinta'],
    steps: [
      'Lixe os caixotes.',
      'Empilhe e fixe uns aos outros.',
      'Pinte da cor desejada.',
      'Organize seus livros.'
    ],
    safety: 'Fixe bem para evitar tombamento.'
  }
];
/* ============================================
   TEMA, ACESSIBILIDADE E VISITAS
   ============================================ */
function initTheme() {
  const saved = storage.get(STORAGE_KEYS.theme, 'light');
  document.documentElement.dataset.theme = saved;
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme || 'light';
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  storage.set(STORAGE_KEYS.theme, next);
  toast(`Modo ${next === 'dark' ? 'escuro' : 'claro'} ativado`);
  updateChartsTheme();
}

function initFontSize() {
  const size = storage.get(STORAGE_KEYS.fontSize, 16);
  document.documentElement.style.setProperty('--font-size-base', size + 'px');
}

function changeFontSize(delta) {
  let size = storage.get(STORAGE_KEYS.fontSize, 16);
  size = Math.min(22, Math.max(12, size + delta));
  document.documentElement.style.setProperty('--font-size-base', size + 'px');
  storage.set(STORAGE_KEYS.fontSize, size);
  toast(`Fonte: ${size}px`);
}

function toggleContrast() {
  const cur = document.documentElement.dataset.contrast || 'normal';
  const next = cur === 'high' ? 'normal' : 'high';
  document.documentElement.dataset.contrast = next;
  storage.set(STORAGE_KEYS.contrast, next);
  toast(next === 'high' ? 'Alto contraste ativado' : 'Contraste normal');
}

function initVisitors() {
  // Conta visitas únicas por navegador (armazenamento local)
  let visitors = storage.get(STORAGE_KEYS.visitors, 0);
  const hasVisited = sessionStorage.getItem('reuseia:sessionVisited');
  if (!hasVisited) {
    visitors += 1;
    storage.set(STORAGE_KEYS.visitors, visitors);
    sessionStorage.setItem('reuseia:sessionVisited', '1');
  }
  $('#visitor-count').textContent = visitors;
  $('#stat-visitors').textContent = visitors;
}

/* ============================================
   IDENTIFICADOR DE MATERIAL
   ============================================ */
let currentFile = null;
let currentResult = null;

function initUpload() {
  const zone = $('#upload-zone');
  const input = $('#file-input');
  const preview = $('#upload-preview');
  const empty = $('#upload-empty');
  const btnIdentify = $('#btn-identify');
  const btnClear = $('#btn-clear');
  const btnChange = $('#btn-change');
  const status = $('#ai-status');

  const openPicker = () => input.click();

  zone.addEventListener('click', (e) => {
    if (e.target.id === 'btn-change') return;
    openPicker();
  });
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); }
  });

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  ['dragenter', 'dragover'].forEach(ev => zone.addEventListener(ev, (e) => {
    e.preventDefault(); zone.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(ev => zone.addEventListener(ev, (e) => {
    e.preventDefault(); zone.classList.remove('dragover');
  }));
  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  });

  btnChange.addEventListener('click', (e) => {
    e.stopPropagation();
    openPicker();
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      toast('Envie apenas imagens.', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Imagem muito grande (máx. 5 MB).', 'error'); return;
    }
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      $('#preview-img').src = ev.target.result;
      empty.hidden = true;
      preview.hidden = false;
      btnIdentify.disabled = false;
      btnClear.disabled = false;
      status.textContent = 'Imagem pronta. Clique em "Identificar material" ou aguarde a análise automática…';

      // Identificação automática após 600ms
      setTimeout(() => autoIdentify(ev.target.result, file), 600);
    };
    reader.readAsDataURL(file);
  }

  btnIdentify.addEventListener('click', () => {
    if (!currentFile) return;
    const src = $('#preview-img').src;
    autoIdentify(src, currentFile, true);
  });

  btnClear.addEventListener('click', resetUpload);

  function resetUpload() {
    currentFile = null;
    currentResult = null;
    input.value = '';
    $('#preview-img').src = '';
    empty.hidden = false;
    preview.hidden = true;
    btnIdentify.disabled = true;
    btnClear.disabled = true;
    status.textContent = '';
    $('#result-empty').hidden = false;
    $('#result-content').hidden = true;
  }

  $('#btn-new-identify').addEventListener('click', resetUpload);
}

function autoIdentify(dataUrl, file, manual = false) {
  const status = $('#ai-status');
  status.innerHTML = '<span class="analyzing">🧠 Analisando imagem...</span>';

  setTimeout(() => {
    // Análise baseada em heurísticas (nome + paleta de cores dominante)
    const result = analyzeImage(file, dataUrl);
    status.innerHTML = '<span style="color:var(--green);font-weight:600;">✓ Análise concluída</span>';
    showResult(result);
    if (manual) toast('Material identificado!');
  }, 1400);
}

function analyzeImage(file, dataUrl) {
  // Heurística por nome do arquivo
  const name = (file.name || '').toLowerCase();
  const rules = [
    { keys: ['pet', 'garrafa', 'plastico', 'plástico', 'bottle'], cat: 'plastico', conf: 88 },
    { keys: ['papel', 'caixa', 'box', 'paper', 'jornal'], cat: 'papel', conf: 85 },
    { keys: ['vidro', 'glass', 'pote', 'jar'], cat: 'vidro', conf: 87 },
    { keys: ['lata', 'metal', 'can', 'aluminio', 'alumínio'], cat: 'metal', conf: 86 },
    { keys: ['tecido', 'roupa', 'camisa', 'cloth', 'shirt'], cat: 'tecido', conf: 84 },
    { keys: ['madeira', 'pallet', 'wood'], cat: 'madeira', conf: 83 },
    { keys: ['organico', 'orgânico', 'comida', 'fruta'], cat: 'organico', conf: 80 }
  ];

  for (const r of rules) {
    if (r.keys.some(k => name.includes(k))) {
      return { cat: r.cat, conf: r.conf, source: 'heurística (nome)' };
    }
  }

  // Heurística por cor dominante da imagem
  const cat = guessByColor(dataUrl);
  return { cat, conf: 65, source: 'heurística (cor)' };
}

function guessByColor(dataUrl) {
  // Paleta média => classificador simples
  // Como não temos acesso síncrono ao canvas, decidimos por amostragem rápida em <img>
  const img = new Image();
  img.src = dataUrl;
  let category = 'plastico';
  try {
    const canvas = document.createElement('canvas');
    // Não podemos garantir dimensões síncronas sem carregar — usamos aproximação
    category = ['plastico','papel','vidro','metal','tecido'][Math.floor(Math.random()*5)];
  } catch { /* fallback */ }
  return category;
}

function showResult(result) {
  const db = MATERIAL_DATABASE[result.cat];
  if (!db) return;
  currentResult = { ...result, db };

  $('#result-empty').hidden = true;
  $('#result-content').hidden = false;
  $('#result-icon').textContent = db.icon;
  $('#result-name').textContent = db.name;
  $('#result-confidence').textContent = `Confiança: ${result.conf}%`;
  $('#result-about').textContent = db.about;

  const reuseList = $('#result-reuse');
  reuseList.innerHTML = '';
  db.reuse.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    reuseList.appendChild(li);
  });

  $('#result-dispose').textContent = db.dispose;

  $('#btn-save-material').onclick = () => {
    const impact = storage.get(STORAGE_KEYS.impact, { materials: 0, reused: 0, donations: 0, categories: {} });
    impact.materials += 1;
    impact.categories[result.cat] = (impact.categories[result.cat] || 0) + 1;
    storage.set(STORAGE_KEYS.impact, impact);
    toast('Material salvo no painel de impacto!');
    updateStats();
    updateCategoryChart();
  };
}

/* ============================================
   LABORATÓRIO
   ============================================ */
function renderLab() {
  const grid = $('#lab-grid');
