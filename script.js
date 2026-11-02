     /* ============================================
   ReUse IA v2.0 — Script Principal
   ============================================ */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const STORAGE = {
  theme: 'reuseia:theme',
  fontSize: 'reuseia:fontsize',
  contrast: 'reuseia:contrast',
  visitors: 'reuseia:visitors',
  impact: 'reuseia:impact'
};

const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

function toast(msg, type = '') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = 'toast ' + type, 3200);
}

/* ============================================
   BASE DE CONHECIMENTO DOS MATERIAIS
   (mapeamento MobileNet → categorias)
   ============================================ */
const MATERIAL_DB = {
  plastico: {
    name: 'Plástico', icon: '🧴',
    about: 'Material leve e durável, mas que pode levar centenas de anos para se decompor. Sua reutilização reduz a extração de petróleo e a poluição.',
    reuse: ['Vasos para plantas', 'Organizadores de gaveta', 'Irrigadores por gotejamento', 'Porta-canetas', 'Projetos escolares'],
    dispose: 'Lixeira vermelha ou coleta seletiva de plástico. Lave antes de descartar.',
    londrina: 'Pontos de entrega: Ecopontos municipais (Zona Norte, Sul, Leste, Oeste) e cooperativas conveniadas como a Cooperativa Recicla Londrina.'
  },
  papel: {
    name: 'Papel e Papelão', icon: '📄',
    about: 'Recicláveis e biodegradáveis, mas sua produção consome água e energia. Reutilizar prolonga sua vida útil.',
    reuse: ['Caixas organizadoras', 'Papel de rascunho', 'Embalagens criativas', 'Compostagem caseira', 'Arte e decoração'],
    dispose: 'Lixeira azul. Mantenha seco e limpo.',
    londrina: 'Coleta seletiva porta a porta em toda a área urbana (dias alternados por região) ou entregue nos Ecopontos municipais.'
  },
  vidro: {
    name: 'Vidro', icon: '🍾',
    about: '100% reciclável infinitas vezes sem perder qualidade. Reutilizar potes economiza energia.',
    reuse: ['Potes para alimentos', 'Vasos e luminárias', 'Porta-velas', 'Decoração', 'Terários'],
    dispose: 'Lixeira verde. Embalagens quebradas devem ser embrulhadas.',
    londrina: 'Ecopontos municipais e cooperativas. Não coloque vidro quebrado solto no lixo comum.'
  },
  metal: {
    name: 'Metal', icon: '🥫',
    about: 'Altamente reciclável e reaproveitável várias vezes. Reciclagem economiza energia.',
    reuse: ['Porta-lápis com latas', 'Vasos decorativos', 'Luminárias artesanais', 'Organização de ferramentas', 'Instrumentos simples'],
    dispose: 'Lixeira amarela. Lave e amasse as latas.',
    londrina: 'Cooperativas de catadores e Ecopontos. Muitas escolas e ONGs de Londrina realizam campanhas de arrecadação de latinhas.'
  },
  tecido: {
    name: 'Tecido', icon: '🧵',
    about: 'Têxteis levam décadas para se decompor. Reutilizar roupas e tecidos é essencial.',
    reuse: ['Bolsas reutilizáveis', 'Panos de limpeza', 'Almofadas e cortinas', 'Brinquedos', 'Doação'],
    dispose: 'Doe roupas em bom estado. Retalhos vão para coleta têxtil.',
    londrina: 'Campanhas do agasalho (Prefeitura de Londrina) e ONGs locais recebem doações. Retalhos podem ser entregues em projetos de costura comunitária.'
  },
  madeira: {
    name: 'Madeira', icon: '🪵',
    about: 'Recurso natural renovável, mas demanda tempo para se regenerar. Reutilizar reduz o desmatamento.',
    reuse: ['Prateleiras e estantes', 'Móveis rústicos', 'Caixotes', 'Brinquedos', 'Compostagem'],
    dispose: 'Ecopontos. Madeira tratada não vai para compostagem.',
    londrina: 'Ecopontos municipais aceitam madeira. Para móveis em bom estado, doe pelo projeto "Londrina Solidária".'
  },
  organico: {
    name: 'Resíduos Orgânicos', icon: '🍎',
    about: 'Restos de alimentos podem se transformar em adubo por meio da compostagem.',
    reuse: ['Compostagem doméstica', 'Adubo para plantas', 'Biofertilizante', 'Hortas comunitárias'],
    dispose: 'Lixeira marrom ou compostagem caseira.',
    londrina: 'A Prefeitura de Londrina possui programa de compostagem. Hortas comunitárias aceitam doações de resíduos orgânicos.'
  },
  outros: {
    name: 'Outros Materiais', icon: '♻️',
    about: 'Materiais variados merecem atenção especial. Procure o ecoponto mais próximo.',
    reuse: ['Doação para projetos sociais', 'Reutilização criativa', 'Cooperativas', 'Campanhas', 'Educação ambiental'],
    dispose: 'Consulte pontos de coleta especializados.',
    londrina: 'Consulte a Secretaria Municipal do Ambiente de Londrina para orientações específicas.'
  }
};

/* Mapeamento de rótulos MobileNet → categorias ReUse IA */
const MOBILENET_MAP = {
  // Plástico
  'water bottle': 'plastico', 'pop bottle': 'plastico', 'beer bottle': 'plastico',
  'pill bottle': 'plastico', 'plastic bag': 'plastico', 'shampoo': 'plastico',
  'bucket': 'plastico', 'tub': 'plastico', 'carton': 'plastico', 'milk can': 'plastico',
  // Papel
  'envelope': 'papel', 'book jacket': 'papel', 'comic book': 'papel',
  'notebook': 'papel', 'binder': 'papel', 'packet': 'papel',
  'newspaper': 'papel', 'menu': 'papel', 'carton box': 'papel',
  // Vidro
  'wine bottle': 'vidro', 'glass': 'vidro', 'jar': 'vidro',
  'vase': 'vidro', 'pitcher': 'vidro', 'goblet': 'vidro',
  // Metal
  'can': 'metal', 'tin can': 'metal', 'soda can': 'metal',
  'beer can': 'metal', 'aluminum': 'metal', 'pot': 'metal',
  'frying pan': 'metal', 'wok': 'metal', 'ladle': 'metal',
  // Tecido
  'jersey': 'tecido', 'shirt': 'tecido', 't-shirt': 'tecido',
  'sock': 'tecido', 'towel': 'tecido', 'jean': 'tecido',
  'sweatshirt': 'tecido', 'cardigan': 'tecido', 'apron': 'tecido',
  // Madeira
  'wood': 'madeira', 'crate': 'madeira', 'barrel': 'madeira',
  'folding chair': 'madeira', 'rocking chair': 'madeira', 'pencil box': 'madeira',
  // Orgânico
  'apple': 'organico', 'banana': 'organico', 'orange': 'organico',
  'broccoli': 'organico', 'lemon': 'organico', 'strawberry': 'organico',
  'pineapple': 'organico', 'cabbage': 'organico'
};

/* ============================================
   INICIALIZAÇÃO GERAL
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();

  // Tema
  const savedTheme = store.get(STORAGE.theme, 'light');
  document.documentElement.dataset.theme = savedTheme;

  // Fonte
  const fontSize = store.get(STORAGE.fontSize, 16);
  document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');

  // Contraste
  const contrast = store.get(STORAGE.contrast, 'normal');
  document.documentElement.dataset.contrast = contrast;

  // Visitantes
  let visitors = store.get(STORAGE.visitors, 0);
  if (!sessionStorage.getItem('reuseia:visited')) {
    visitors += 1;
    store.set(STORAGE.visitors, visitors);
    sessionStorage.setItem('reuseia:visited', '1');
  }
  $('#visitor-count').textContent = visitors;

  // Botões acessibilidade
  $('#btn-theme').onclick = () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    store.set(STORAGE.theme, next);
    toast(`Modo ${next === 'dark' ? 'escuro' : 'claro'} ativado`);
    updateChartsTheme();
  };
  $('#btn-font-plus').onclick = () => {
    let s = store.get(STORAGE.fontSize, 16);
    s = Math.min(22, s + 1);
    document.documentElement.style.setProperty('--font-size-base', s + 'px');
    store.set(STORAGE.fontSize, s);
    toast(`Fonte: ${s}px`);
  };
  $('#btn-font-minus').onclick = () => {
    let s = store.get(STORAGE.fontSize, 16);
    s = Math.max(12, s - 1);
    document.documentElement.style.setProperty('--font-size-base', s + 'px');
    store.set(STORAGE.fontSize, s);
    toast(`Fonte: ${s}px`);
  };
  $('#btn-contrast').onclick = () => {
    const cur = document.documentElement.dataset.contrast || 'normal';
    const next = cur === 'high' ? 'normal' : 'high';
    document.documentElement.dataset.contrast = next;
    store.set(STORAGE.contrast, next);
    toast(next === 'high' ? 'Alto contraste ativado' : 'Contraste normal');
  };

  // Menu mobile
  $('#menu-toggle').onclick = () => $('#nav').classList.toggle('open');
  $$('.nav-link').forEach(l => l.addEventListener('click', () => $('#nav').classList.remove('open')));

  // Identificador
  initUpload();
  initCharts();
});

/* ============================================
   IDENTIFICADOR COM TENSORFLOW.JS
   ============================================ */
let mobilenetModel = null;
let mobilenetLoading = null;
let currentFile = null;
let currentResult = null;

async function loadModel() {
  if (mobilenetModel) return mobilenetModel;
  if (mobilenetLoading) return mobilenetLoading;
  mobilenetLoading = (async () => {
    $('#ai-status').textContent = '⏳ Carregando modelo de IA...';
    try {
      mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
      $('#ai-status').textContent = '✓ IA pronta!';
      return mobilenetModel;
    } catch (e) {
      console.error('Erro ao carregar MobileNet:', e);
      $('#ai-status').textContent = '⚠️ Não foi possível carregar a IA. Usando análise por nome de arquivo.';
      return null;
    }
  })();
  return mobilenetLoading;
}

function initUpload() {
  const zone = $('#upload-zone');
  const input = $('#file-input');
  const empty = $('#upload-empty');
  const preview = $('#upload-preview');

  zone.addEventListener('click', (e) => {
    if (e.target.id === 'btn-change') return;
    input.click();
  });
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
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

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  $('#btn-change').addEventListener('click', (e) => { e.stopPropagation(); input.click(); });
  $('#btn-new-identify').onclick = resetUpload;

  async function handleFile(file) {
    if (!file.type.startsWith('image/')) { toast('Envie apenas imagens.', 'error'); return; }
    if (file.size > 8 * 1024 * 1024) { toast('Imagem muito grande (máx. 8 MB).', 'error'); return; }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      $('#preview-img').src = ev.target.result;
      empty.hidden = true;
      preview.hidden = false;
      await classifyImage(ev.target.result, file);
    };
    reader.readAsDataURL(file);
  }

  function resetUpload() {
    currentFile = null; currentResult = null;
    input.value = ''; $('#preview-img').src = '';
    empty.hidden = false; preview.hidden = true;
    $('#result-empty').hidden = false;
    $('#result-content').hidden = true;
    $('#ai-status').textContent = '';
    $('#ai-progress').hidden = true;
  }

  $('#btn-save-material').onclick = () => {
    if (!currentResult) return;
    const impact = store.get(STORAGE.impact, { materials: 0, reused: 0, categories: {} });
    impact.materials += 1;
    impact.categories[currentResult.cat] = (impact.categories[currentResult.cat] || 0) + 1;
    store.set(STORAGE.impact, impact);
    toast('Material salvo no painel de impacto!');
  };
}

async function classifyImage(dataUrl, file) {
  const status = $('#ai-status');
  const progress = $('#ai-progress');
  const bar = $('#ai-progress-bar');

  status.innerHTML = '<span style="color:var(--green);font-weight:600;">🧠 Analisando imagem com IA...</span>';
  progress.hidden = false;
  bar.style.width = '20%';

  // Carrega modelo
  const model = await loadModel();
  bar.style.width = '50%';

  let predictions = [];
  let detectedCat = null;
  let confidence = 0;
  let source = 'MobileNet';

  if (model) {
    try {
      const img = $('#preview-img');
      await new Promise((res) => {
        if (img.complete) res(); else img.onload = res;
      });
      predictions = await model.classify(img, 5);
      bar.style.width = '85%';

      // Mapeia primeiro resultado para categoria
      for (const pred of predictions) {
        const label = pred.className.toLowerCase();
        for (const [key, cat] of Object.entries(MOBILENET_MAP)) {
          if (label.includes(key)) {
            detectedCat = cat;
            confidence = Math.round(pred.probability * 100);
            break;
          }
        }
        if (detectedCat) break;
      }
    } catch (e) {
      console.error('Erro na classificação:', e);
    }
  }

  // Fallback por nome do arquivo
  if (!detectedCat) {
    source = 'heurística (nome do arquivo)';
    const name = (file.name || '').toLowerCase();
    const rules = [
      { keys: ['pet', 'garrafa', 'plastico', 'bottle'], cat: 'plastico', conf: 85 },
      { keys: ['papel', 'caixa', 'box', 'paper'], cat: 'papel', conf: 82 },
      { keys: ['vidro', 'glass', 'pote'], cat: 'vidro', conf: 84 },
      { keys: ['lata', 'metal', 'can'], cat: 'metal', conf: 83 },
      { keys: ['tecido', 'roupa', 'cloth'], cat: 'tecido', conf: 80 },
      { keys: ['madeira', 'wood'], cat: 'madeira', conf: 80 },
      { keys: ['organico', 'food', 'fruta'], cat: 'organico', conf: 78 }
    ];
    for (const r of rules) {
      if (r.keys.some(k => name.includes(k))) {
        detectedCat = r.cat; confidence = r.conf; break;
      }
    }
  }

  // Se ainda não identificou, pega a melhor predição genérica
  if (!detectedCat && predictions.length > 0) {
    detectedCat = 'outros';
    confidence = Math.round(predictions[0].probability * 100);
    source = 'MobileNet (material não mapeado)';
  }

  if (!detectedCat) {
    detectedCat = 'outros';
    confidence = 60;
    source = 'padrão';
  }

  bar.style.width = '100%';
  setTimeout(() => { progress.hidden = true; bar.style.width = '0%'; }, 500);

  status.innerHTML = `<span style="color:var(--green);font-weight:600;">✓ Análise concluída (${source})</span>`;
  showResult({ cat: detectedCat, conf: confidence, source, predictions });

  currentResult = { cat: detectedCat, conf: confidence };
}

function showResult(result) {
  const db = MATERIAL_DB[result.cat];
  if (!db) return;

  $('#result-empty').hidden = true;
  $('#result-content').hidden = false;
  $('#result-icon').textContent = db.icon;
  $('#result-name').textContent = db.name;
  $('#result-confidence').textContent = `Confiança: ${result.conf}%`;
  $('#result-about').textContent = db.about;

  const reuse = $('#result-reuse');
  reuse.innerHTML = '';
  db.reuse.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    reuse.appendChild(li);
  });

  $('#result-dispose').textContent = db.dispose;
  $('#result-londrina').textContent = db.londrina;
}

/* ============================================
   GRÁFICOS — DADOS REAIS DE LONDRINA
   Fontes: SNIS 2022, IBGE 2022, ABRELPE, Prefeitura de Londrina
   ============================================ */
let chartComposicao, chartDestinacao, chartCidades, chartEvolucao;

function initCharts() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.color = getTextColor();

  // Composição dos resíduos de Londrina (estimativa SNIS 2022)
  const ctx1 = $('#chart-composicao');
  if (ctx1) {
    chartComposicao = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Orgânico (52%)', 'Recicláveis (32%)', 'Rejeitos (16%)'],
        datasets: [{
          data: [52, 32, 16],
          backgroundColor: ['#8b5a2b', '#26965B', '#a0a8a3'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, boxWidth: 12 } },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed}%` } }
        }
      }
    });
  }

  // Destinação dos resíduos em Londrina
  const ctx2 = $('#chart-destinacao');
  if (ctx2) {
    chartDestinacao = new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: ['Aterro sanitário', 'Coleta seletiva', 'Compostagem', 'Não coletado'],
        datasets: [{
          data: [78, 15, 3, 4],
          backgroundColor: ['#174D36', '#26965B', '#4ECB8D', '#a0a8a3'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, boxWidth: 12 } },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed}%` } }
        }
      }
    });
  }

  // Comparativo de taxas de reciclagem em cidades paranaenses
  const ctx3 = $('#chart-cidades');
  if (ctx3) {
    chartCidades = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['Londrina', 'Maringá', 'Curitiba', 'Ponta Grossa', 'Cascavel'],
        datasets: [{
          label: 'Taxa de reciclagem (%)',
          data: [5.8, 7.2, 12.5, 4.5, 6.1],
          backgroundColor: '#26965B',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.y}%` } } },
        scales: {
          y: { beginAtZero: true, grid: { color: getGridColor() }, ticks: { callback: (v) => v + '%' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Evolução da coleta seletiva em Londrina (toneladas/ano, dados públicos)
  const ctx4 = $('#chart-evolucao');
  if (ctx4) {
    chartEvolucao = new Chart(ctx4, {
      type: 'line',
      data: {
        labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
        datasets: [{
          label: 'Coleta seletiva (toneladas)',
          data: [15200, 16400, 15800, 17200, 18600, 19500],
          borderColor: '#26965B',
          backgroundColor: 'rgba(38, 150, 91, 0.15)',
          fill: true, tension: 0.4, pointBackgroundColor: '#174D36', pointRadius: 5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.y.toLocaleString('pt-BR')} t` } } },
        scales: {
          y: { beginAtZero: true, grid: { color: getGridColor() }, ticks: { callback: (v) => v.toLocaleString('pt-BR') + 't' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

function getTextColor() { return getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#174D36'; }
function getGridColor() { return document.documentElement.dataset.theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'; }

function updateChartsTheme() {
  Chart.defaults.color = getTextColor();
  [chartComposicao, chartDestinacao, chartCidades, chartEvolucao].forEach(c => {
    if (!c) return;
    if (c.options.scales?.y) c.options.scales.y.grid.color = getGridColor();
    c.update();
  });
} 

/* ============================================
   Chat IA — Assistente ReUse IA
   Sistema de respostas por palavras-chave
   ============================================ */
'use strict';

const CHAT_KNOWLEDGE = [
  {
    keywords: ['economia circular', 'economia', 'circular', 'o que é economia'],
    answer: '🌱 <strong>Economia circular</strong> é um modelo que mantém materiais em uso o máximo possível, reduzindo a extração de recursos e o descarte. Baseia-se em: <strong>reduzir, reutilizar, reparar e reciclar</strong>. Diferente do modelo linear (extrair → produzir → descartar), ela fecha o ciclo, transformando resíduos em novos recursos. A ReUse IA aplica esses princípios ao incentivar a reutilização e doação de materiais em Londrina.'
  },
  {
    keywords: ['diferença entre reutilizar', 'reutilizar e reciclar', 'reutilização e reciclagem', 'reutilizar vs reciclar'],
    answer: '♻️ <strong>Reutilizar</strong> = dar nova função a um material (ex: garrafa PET → vaso). Economiza energia e matéria-prima.<br><br><strong>Reciclar</strong> = transformar o material em matéria-prima para um novo produto (ex: PET → fibra têxtil). Processo industrial.<br><br>Reutilizar é sempre preferível, pois consome muito menos energia!'
  },
  {
    keywords: ['plástico', 'plastico', 'pet', 'garrafa pet', 'londrina plástico'],
    answer: '🧴 <strong>Descarte de plástico em Londrina:</strong><br>• Lixeira vermelha ou coleta seletiva de plástico<br>• <strong>Ecopontos municipais</strong> (Zona Norte, Sul, Leste, Oeste)<br>• Cooperativas conveniadas (ex: Cooperativa Recicla Londrina)<br><br>💡 Sempre lave as embalagens antes de descartar e retire tampas quando possível. Uma garrafa PET pode levar mais de 400 anos para se decompor!'
  },
  {
    keywords: ['vidro', 'londrina vidro', 'garrafa de vidro'],
    answer: '🍾 <strong>Descarte de vidro em Londrina:</strong><br>• Lixeira verde<br>• Ecopontos municipais<br>• Cooperativas de reciclagem<br><br>⚠️ Vidro quebrado deve ser embrulhado em papel ou papelão antes do descarte, para proteger os catadores.'
  },
  {
    keywords: ['papel', 'papelão', 'caixa', 'jornal'],
    answer: '📄 <strong>Descarte de papel e papelão em Londrina:</strong><br>• Lixeira azul<br>• Coleta seletiva porta a porta (dias alternados por região)<br>• Ecopontos municipais<br><br>💡 Mantenha seco e limpo. Amasse caixas para ocupar menos espaço. Papel engordurado (pizza) NÃO é reciclável.'
  },
  {
    keywords: ['metal', 'lata', 'alumínio', 'aluminio'],
    answer: '🥫 <strong>Descarte de metal em Londrina:</strong><br>• Lixeira amarela<br>• Cooperativas de catadores<br>• Ecopontos<br><br>💡 Lave as latas e amasse quando possível. Muitas escolas e ONGs de Londrina fazem campanhas de arrecadação de latinhas.'
  },
  {
    keywords: ['tecido', 'roupa', 'roupas', 'doar roupa'],
    answer: '🧵 <strong>Tecidos e roupas em Londrina:</strong><br>• Doe roupas em bom estado (Campanha do Agasalho da Prefeitura)<br>• ONGs locais recebem doações<br>• Retalhos podem ir para projetos de costura comunitária<br><br>Têxteis levam décadas para se decompor — reutilize ou doe sempre!'
  },
  {
    keywords: ['orgânico', 'organico', 'compostagem', 'resto de comida'],
    answer: '🍎 <strong>Resíduos orgânicos em Londrina:</strong><br>• Lixeira marrom<br>• Programa de compostagem da Prefeitura<br>• Hortas comunitárias aceitam doações<br><br>💡 Faça compostagem em casa: alterne camadas de restos orgânicos e terra seca. Evite carnes e laticínios.'
  },
  {
    keywords: ['ods', 'objetivos', 'desenvolvimento sustentável', 'onu'],
    answer: '🌍 <strong>ODS abordadas pela ReUse IA:</strong><br><br>• <strong>ODS 12</strong> — Consumo e Produção Responsáveis<br>• <strong>ODS 13</strong> — Ação Contra a Mudança Climática<br>• <strong>ODS 11</strong> — Cidades e Comunidades Sustentáveis<br>• <strong>ODS 4</strong> — Educação de Qualidade<br>• <strong>ODS 9</strong> — Indústria, Inovação e Infraestrutura<br>• <strong>ODS 17</strong> — Parcerias e Meios de Implementação<br><br>Cada uma é impactada diretamente pelas ações da plataforma!'
  },
  {
    keywords: ['reciclagem em londrina', 'reciclagem londrina', 'coleta seletiva londrina', 'londrina'],
    answer: '🏙️ <strong>Reciclagem em Londrina:</strong><br>• Taxa de reciclagem atual: ~5,8%<br>• Coleta seletiva porta a porta em toda área urbana<br>• 4 Ecopontos municipais (Norte, Sul, Leste, Oeste)<br>• Cooperativas de catadores conveniadas<br>• Programa de compostagem da Prefeitura<br><br>Londrina gera aproximadamente 610 toneladas de resíduos por dia!'
  },
  {
    keywords: ['o que é o site', 'o que é reuse', 'sobre o site', 'como funciona o site', 'reuse ia'],
    answer: '🌱 <strong>ReUse IA</strong> é uma plataforma de sustentabilidade com foco em Londrina-PR. Oferecemos:<br><br>• 📷 <strong>Identificação de materiais por IA real</strong> (TensorFlow.js)<br>• 💡 Sugestões de reutilização<br>• 🏙️ Informações de descarte correto em Londrina<br>• 📊 Gráficos com dados reais de reciclagem<br>• 🎮 Jogo da memória educativo<br>• 💬 Este chat para tirar dúvidas<br><br>Tudo gratuito e sem enviar suas imagens para servidores!'
  },
  {
    keywords: ['como usar', 'como funciona ia', 'identificar', 'foto'],
    answer: '📷 <strong>Como identificar um material:</strong><br><br>1. Vá até a seção "Identificar"<br>2. Clique ou arraste uma foto do material<br>3. A IA analisa automaticamente em segundos<br>4. Você recebe: material identificado, sugestões de reutilização, descarte correto e onde descartar em Londrina<br><br>💡 Nossa IA usa TensorFlow.js MobileNet, 100% no seu navegador. Suas fotos NÃO são enviadas para servidores!'
  },
  {
    keywords: ['privacidade', 'dados', 'seguro', 'lgpd'],
    answer: '🔐 <strong>Privacidade:</strong><br>• Todas as imagens são processadas 100% no seu navegador<br>• Nenhuma foto é enviada para servidores<br>• Dados de impacto e visitas ficam no localStorage<br>• Não coletamos dados pessoais sensíveis<br>• Não há pagamentos nem encontros automáticos<br><br>Totalmente compatível com boas práticas da LGPD!'
  },
  {
    keywords: ['jogo', 'memória', 'memoria', 'brincar', 'jogar'],
    answer: '🎮 <strong>Jogo da Memória ReUse:</strong><br>• Encontre os pares de materiais recicláveis<br>• Ganhe pontos e conquistas<br>• Aprenda sobre resíduos enquanto joga<br><br>Role até a seção "Jogo" e clique em "Novo jogo" para começar! Cada par correto vale pontos. O jogo reinicia automaticamente ao completar.'
  },
  {
    keywords: ['descartar pilha', 'pilha', 'bateria', 'eletrônico', 'eletronico'],
    answer: '🔋 <strong>Pilhas e eletrônicos em Londrina:</strong><br>• Não vão na coleta seletiva comum!<br>• Entregue em pontos de coleta específicos (farmácias, supermercados, lojas de eletrônicos)<br>• Ecopontos municipais aceitam alguns tipos<br>• Consulte a Secretaria Municipal do Ambiente<br><br>Pilhas contêm metais pesados altamente tóxicos!'
  },
  {
    keywords: ['óleo', 'oleo', 'óleo de cozinha', 'oleo de cozinha'],
    answer: '🛢️ <strong>Óleo de cozinha usado em Londrina:</strong><br>• NUNCA despeje na pia! Entope canos e polui rios<br>• Guarde em garrafa PET<br>• Entregue em pontos de coleta (supermercados, escolas, cooperativas)<br>• Programas municipais de reciclagem de óleo<br><br>1 litro de óleo contamina até 20.000 litros de água!'
  },
  {
    keywords: ['obrigado', 'obrigada', 'valeu', 'tchau', 'até logo'],
    answer: '😊 De nada! Estou sempre aqui para ajudar. Juntos podemos fazer de Londrina uma cidade mais sustentável! 🌱💚'
  },
  {
    keywords: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'eai'],
    answer: '👋 Olá! Que bom te ver por aqui! Posso te ajudar com dúvidas sobre reciclagem, economia circular, descarte correto em Londrina, o projeto ReUse IA, ODS e muito mais. O que você quer saber?'
  },
  {
    keywords: ['impacto', 'dados', 'números', 'numeros', 'estatística', 'estatistica'],
    answer: '📊 <strong>Impacto de Londrina:</strong><br>• População: ~555 mil habitantes<br>• Resíduos gerados/dia/pessoa: ~1,1 kg<br>• Taxa de reciclagem: ~5,8%<br>• Coleta seletiva: ~19.500 toneladas/ano (2023)<br>• Catadores no Paraná: ~2.500<br><br>Veja os gráficos completos na seção "Impacto" do site!'
  }
];

function findAnswer(question) {
  const q = question.toLowerCase().trim();

  // Busca por maior número de keywords correspondentes
  let bestMatch = null;
  let bestScore = 0;

  for (const item of CHAT_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (q.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && bestScore > 0) return bestMatch.answer;

  return '🤔 Não encontrei uma resposta específica para essa pergunta. Tente perguntar sobre:<br><br>• Reciclagem de plástico, vidro, papel, metal<br>• Descarte correto em Londrina<br>• Economia circular<br>• ODS<br>• Como usar a plataforma<br>• Jogo da memória<br><br>Ou reformule sua pergunta com outras palavras!';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = $('#chat-form');
  const input = $('#chat-input');
  const messages = $('#chat-messages');
  const suggestions = $('#chat-suggestions');

  if (!form) return;

  function addMessage(text, sender = 'user') {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + sender;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = text;
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="chat-bubble typing">Digitando...</div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';

    const typing = addTyping();

    setTimeout(() => {
      typing.remove();
      const answer = findAnswer(text);
      addMessage(answer, 'bot');
    }, 600 + Math.random() * 400);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });

  suggestions.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      sendMessage(e.target.dataset.q);
    }
  });
});

/* ============================================
   Jogo da Memória ReUse
   ============================================ */
'use strict';

const MEM_ITEMS = [
  { icon: '🧴', name: 'Plástico' },
  { icon: '📄', name: 'Papel' },
  { icon: '🍾', name: 'Vidro' },
  { icon: '🥫', name: 'Metal' },
  { icon: '🧵', name: 'Tecido' },
  { icon: '🪵', name: 'Madeira' },
  { icon: '🍎', name: 'Orgânico' },
  { icon: '♻️', name: 'Reciclável' }
];

const memState = {
  cards: [],
  flipped: [],
  matched: [],
  moves: 0,
  score: 0,
  locked: false,
  timer: null,
  seconds: 0
};

document.addEventListener('DOMContentLoaded', () => {
  const grid = $('#memory-grid');
  if (!grid) return;

  $('#btn-mem-restart').onclick = startGame;
  startGame();

  function startGame() {
    clearInterval(memState.timer);
    memState = {
      cards: [], flipped: [], matched: [],
      moves: 0, score: 0, locked: false,
      timer: null, seconds: 0
    };
    $('#mem-score').textContent = '0';
    $('#mem-moves').textContent = '0';
    $('#mem-pairs').textContent = '0 / 8';
    $('#mem-time').textContent = '00:00';
    $('#memory-message').textContent = '';

    // Duplica itens e embaralha
    const deck = [...MEM_ITEMS, ...MEM_ITEMS];
    shuffle(deck);

    grid.innerHTML = '';
    deck.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'mem-card';
      card.dataset.idx = idx;
      card.dataset.key = item.name;
      card.innerHTML = `
        <div class="mem-card-inner">
          <div class="mem-face mem-front">♻</div>
          <div class="mem-face mem-back">${item.icon}</div>
        </div>
      `;
      card.addEventListener('click', () => flipCard(card, item));
      grid.appendChild(card);
      memState.cards.push({ el: card, item });
    });

    memState.timer = setInterval(() => {
      memState.seconds++;
      const m = String(Math.floor(memState.seconds / 60)).padStart(2, '0');
      const s = String(memState.seconds % 60).padStart(2, '0');
      $('#mem-time').textContent = `${m}:${s}`;
    }, 1000);
  }

  function flipCard(cardEl, item) {
    if (memState.locked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    cardEl.classList.add('flipped');
    memState.flipped.push({ el: cardEl, item });

    if (memState.flipped.length === 2) {
      memState.locked = true;
      memState.moves++;
      $('#mem-moves').textContent = memState.moves;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = memState.flipped;
    const isMatch = a.item.name === b.item.name;

    if (isMatch) {
      setTimeout(() => {
        a.el.classList.add('matched');
        b.el.classList.add('matched');
        memState.matched.push(a, b);
        memState.score += 10;
        $('#mem-score').textContent = memState.score;
        $('#mem-pairs').textContent = `${memState.matched.length / 2} / 8`;
        memState.flipped = [];
        memState.locked = false;

        if (memState.matched.length === 16) {
          endGame();
        }
      }, 500);
    } else {
      setTimeout(() => {
        a.el.classList.remove('flipped');
        b.el.classList.remove('flipped');
        memState.flipped = [];
        memState.locked = false;
      }, 900);
    }
  }

  function endGame() {
    clearInterval(memState.timer);
    // Bônus por tempo
    const timeBonus = Math.max(0, 300 - memState.seconds * 2);
    const moveBonus = Math.max(0, 100 - (memState.moves - 16) * 5);
    const finalScore = memState.score + timeBonus + moveBonus;
    $('#mem-score').textContent = finalScore;
    $('#memory-message').innerHTML = `🎉 <strong>Parabéns!</strong> Você completou em ${memState.moves} jogadas e ${memState.seconds}s. Bônus tempo: +${timeBonus} · Bônus jogadas: +${moveBonus} · <strong>Total: ${finalScore} pontos</strong>`;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
});
