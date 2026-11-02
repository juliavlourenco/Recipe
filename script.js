/* ============================================
   ReUse IA v3.0 — Alvorada do Sul-PR
   Script principal
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
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = 'toast ' + type, 3200);
}

/* ============================================
   BASE DE CONHECIMENTO — ALVORADA DO SUL
   ============================================ */
const MATERIAL_DB = {
  plastico: {
    name: 'Plástico', icon: '🧴',
    about: 'Material leve e durável, mas que pode levar centenas de anos para se decompor. Sua reutilização reduz a extração de petróleo e a poluição.',
    reuse: ['Vasos para plantas', 'Organizadores de gaveta', 'Irrigadores por gotejamento', 'Porta-canetas', 'Projetos escolares'],
    dispose: 'Lixeira vermelha ou coleta seletiva de plástico. Lave antes de descartar.',
    local: 'Alvorada do Sul: coleta seletiva porta a porta em bairros centrais. Pontos de entrega na Prefeitura e no Ecoponto municipal (Secretaria do Meio Ambiente).'
  },
  papel: {
    name: 'Papel e Papelão', icon: '📄',
    about: 'Recicláveis e biodegradáveis, mas sua produção consome água e energia. Reutilizar prolonga sua vida útil.',
    reuse: ['Caixas organizadoras', 'Papel de rascunho', 'Embalagens criativas', 'Compostagem caseira', 'Arte e decoração'],
    dispose: 'Lixeira azul. Mantenha seco e limpo.',
    local: 'Alvorada do Sul: coleta seletiva em dias específicos por região. Papelões podem ser entregues no Ecoponto municipal.'
  },
  vidro: {
    name: 'Vidro', icon: '🍾',
    about: '100% reciclável infinitas vezes sem perder qualidade. Reutilizar potes economiza energia.',
    reuse: ['Potes para alimentos', 'Vasos e luminárias', 'Porta-velas', 'Decoração', 'Terários'],
    dispose: 'Lixeira verde. Embalagens quebradas devem ser embrulhadas.',
    local: 'Alvorada do Sul: Ecoponto municipal e campanhas sazonais da Prefeitura. Não coloque vidro quebrado no lixo comum.'
  },
  metal: {
    name: 'Metal', icon: '🥫',
    about: 'Altamente reciclável e reaproveitável várias vezes. Reciclagem economiza energia.',
    reuse: ['Porta-lápis com latas', 'Vasos decorativos', 'Luminárias artesanais', 'Organização', 'Instrumentos simples'],
    dispose: 'Lixeira amarela. Lave e amasse as latas.',
    local: 'Alvorada do Sul: cooperativas conveniadas e campanhas de arrecadação de latinhas em escolas municipais.'
  },
  tecido: {
    name: 'Tecido', icon: '🧵',
    about: 'Têxteis levam décadas para se decompor. Reutilizar roupas e tecidos é essencial.',
    reuse: ['Bolsas reutilizáveis', 'Panos de limpeza', 'Almofadas e cortinas', 'Brinquedos', 'Doação'],
    dispose: 'Doe roupas em bom estado. Retalhos vão para coleta têxtil.',
    local: 'Alvorada do Sul: Campanha do Agasalho municipal, igrejas e ONGs locais recebem doações.'
  },
  madeira: {
    name: 'Madeira', icon: '🪵',
    about: 'Recurso natural renovável, mas demanda tempo para se regenerar. Reutilizar reduz o desmatamento.',
    reuse: ['Prateleiras e estantes', 'Móveis rústicos', 'Caixotes', 'Brinquedos', 'Compostagem'],
    dispose: 'Ecopontos. Madeira tratada não vai para compostagem.',
    local: 'Alvorada do Sul: Ecoponto municipal aceita madeira. Para móveis em bom estado, doe.'
  },
  organico: {
    name: 'Resíduos Orgânicos', icon: '🍎',
    about: 'Restos de alimentos podem se transformar em adubo por meio da compostagem.',
    reuse: ['Compostagem doméstica', 'Adubo para plantas', 'Biofertilizante', 'Hortas comunitárias'],
    dispose: 'Lixeira marrom ou compostagem caseira.',
    local: 'Alvorada do Sul: hortas comunitárias e escolas municipais aceitam resíduos orgânicos para compostagem. Consulte a Secretaria de Agricultura.'
  },
  outros: {
    name: 'Outros Materiais', icon: '♻️',
    about: 'Materiais variados merecem atenção especial. Procure o ponto de coleta mais próximo.',
    reuse: ['Doação para projetos sociais', 'Reutilização criativa', 'Cooperativas', 'Campanhas', 'Educação ambiental'],
    dispose: 'Consulte pontos de coleta especializados.',
    local: 'Alvorada do Sul: Secretaria Municipal do Meio Ambiente orienta sobre descarte especial (pilhas, eletrônicos, óleo).'
  }
};

const MOBILENET_MAP = {
  'water bottle': 'plastico', 'pop bottle': 'plastico', 'beer bottle': 'plastico',
  'pill bottle': 'plastico', 'plastic bag': 'plastico', 'shampoo': 'plastico',
  'bucket': 'plastico', 'tub': 'plastico', 'carton': 'plastico', 'milk can': 'plastico',
  'envelope': 'papel', 'book jacket': 'papel', 'comic book': 'papel',
  'notebook': 'papel', 'binder': 'papel', 'packet': 'papel',
  'newspaper': 'papel', 'menu': 'papel', 'carton box': 'papel',
  'wine bottle': 'vidro', 'glass': 'vidro', 'jar': 'vidro',
  'vase': 'vidro', 'pitcher': 'vidro', 'goblet': 'vidro',
  'can': 'metal', 'tin can': 'metal', 'soda can': 'metal',
  'beer can': 'metal', 'aluminum': 'metal', 'pot': 'metal',
  'frying pan': 'metal', 'wok': 'metal', 'ladle': 'metal',
  'jersey': 'tecido', 'shirt': 'tecido', 't-shirt': 'tecido',
  'sock': 'tecido', 'towel': 'tecido', 'jean': 'tecido',
  'sweatshirt': 'tecido', 'cardigan': 'tecido', 'apron': 'tecido',
  'wood': 'madeira', 'crate': 'madeira', 'barrel': 'madeira',
  'folding chair': 'madeira', 'rocking chair': 'madeira', 'pencil box': 'madeira',
  'apple': 'organico', 'banana': 'organico', 'orange': 'organico',
  'broccoli': 'organico', 'lemon': 'organico', 'strawberry': 'organico',
  'pineapple': 'organico', 'cabbage': 'organico'
};

/* ============================================
   INIT GERAL
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();

  const theme = store.get(STORAGE.theme, 'light');
  document.documentElement.dataset.theme = theme;

  const fontSize = store.get(STORAGE.fontSize, 16);
  document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');

  const contrast = store.get(STORAGE.contrast, 'normal');
  document.documentElement.dataset.contrast = contrast;

  let visitors = store.get(STORAGE.visitors, 0);
  if (!sessionStorage.getItem('reuseia:visited')) {
    visitors += 1;
    store.set(STORAGE.visitors, visitors);
    sessionStorage.setItem('reuseia:visited', '1');
  }
  $('#visitor-count').textContent = visitors;

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

  $('#menu-toggle').onclick = () => $('#nav').classList.toggle('open');
  $$('.nav-link').forEach(l => l.addEventListener('click', () => $('#nav').classList.remove('open')));

  initUpload();
  initCharts();
});

/* ============================================
   IDENTIFICADOR IA
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
      console.error('Erro MobileNet:', e);
      $('#ai-status').textContent = '⚠️ IA não pôde ser carregada. Usando análise alternativa.';
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

  if (!zone) return;

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
  $('#btn-new').onclick = resetUpload;

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

  $('#btn-save').onclick = () => {
    if (!currentResult) return;
    const impact = store.get(STORAGE.impact, { materials: 0, categories: {} });
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

  status.innerHTML = '<span style="color:var(--green);font-weight:600;">🧠 Analisando...</span>';
  progress.hidden = false;
  bar.style.width = '20%';

  const model = await loadModel();
  bar.style.width = '50%';

  let predictions = [];
  let detectedCat = null;
  let confidence = 0;
  let source = 'MobileNet';

  if (model) {
    try {
      const img = $('#preview-img');
      await new Promise((res) => { if (img.complete) res(); else img.onload = res; });
      predictions = await model.classify(img, 5);
      bar.style.width = '85%';

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
    } catch (e) { console.error('Erro classificação:', e); }
  }

  if (!detectedCat) {
    source = 'heurística (nome)';
    const name = (file.name || '').toLowerCase();
    const rules = [
      { keys: ['pet','garrafa','plastico','bottle'], cat: 'plastico', conf: 85 },
      { keys: ['papel','caixa','box','paper'], cat: 'papel', conf: 82 },
      { keys: ['vidro','glass','pote'], cat: 'vidro', conf: 84 },
      { keys: ['lata','metal','can'], cat: 'metal', conf: 83 },
      { keys: ['tecido','roupa','cloth'], cat: 'tecido', conf: 80 },
      { keys: ['madeira','wood'], cat: 'madeira', conf: 80 },
      { keys: ['organico','food','fruta'], cat: 'organico', conf: 78 }
    ];
    for (const r of rules) {
      if (r.keys.some(k => name.includes(k))) { detectedCat = r.cat; confidence = r.conf; break; }
    }
  }

  if (!detectedCat && predictions.length > 0) {
    detectedCat = 'outros';
    confidence = Math.round(predictions[0].probability * 100);
    source = 'MobileNet (não mapeado)';
  }

  if (!detectedCat) { detectedCat = 'outros'; confidence = 60; source = 'padrão'; }

  bar.style.width = '100%';
  setTimeout(() => { progress.hidden = true; bar.style.width = '0%'; }, 500);

  status.innerHTML = `<span style="color:var(--green);font-weight:600;">✓ Análise concluída (${source})</span>`;
  showResult({ cat: detectedCat, conf: confidence });
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
  $('#result-local').textContent = db.local;
}

/* ============================================
   GRÁFICOS — DADOS REAIS DE ALVORADA DO SUL
   Fontes: IBGE 2022, SNIS 2022, IPARDES, PNUD
   ============================================ */
let chartComposicao, chartDestinacao, chartPopulacao, chartRegional, chartIDHM, chartMensal;

function getTextColor() { return getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#174D36'; }
function getGridColor() { return document.documentElement.dataset.theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'; }

function initCharts() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.color = getTextColor();

  // 1. Composição dos resíduos
  const c1 = $('#chart-composicao');
  if (c1) {
    chartComposicao = new Chart(c1, {
      type: 'doughnut',
      data: {
        labels: ['Orgânico (54%)', 'Recicláveis (30%)', 'Rejeitos (16%)'],
        datasets: [{ data: [54, 30, 16], backgroundColor: ['#8b5a2b', '#26965B', '#a0a8a3'], borderWidth: 0 }]
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

  // 2. Destinação dos resíduos
  const c2 = $('#chart-destinacao');
  if (c2) {
    chartDestinacao = new Chart(c2, {
      type: 'pie',
      data: {
        labels: ['Aterro sanitário', 'Coleta seletiva', 'Compostagem', 'Não coletado'],
        datasets: [{ data: [82, 11, 2, 5], backgroundColor: ['#174D36', '#26965B', '#4ECB8D', '#a0a8a3'], borderWidth: 0 }]
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

  // 3. Evolução populacional (IBGE)
  const c3 = $('#chart-populacao');
  if (c3) {
    chartPopulacao = new Chart(c3, {
      type: 'line',
      data: {
        labels: ['1991', '2000', '2010', '2022'],
        datasets: [{
          label: 'Habitantes',
          data: [8251, 8802, 9815, 10671],
          borderColor: '#26965B',
          backgroundColor: 'rgba(38,150,91,0.15)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#174D36', pointRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.y.toLocaleString('pt-BR')} habitantes` } } },
        scales: {
          y: { beginAtZero: false, grid: { color: getGridColor() }, ticks: { callback: (v) => v.toLocaleString('pt-BR') } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 4. Comparativo regional
  const c4 = $('#chart-regional');
  if (c4) {
    chartRegional = new Chart(c4, {
      type: 'bar',
      data: {
        labels: ['Alvorada do Sul', 'Bela Vista do Paraíso', 'Prado Ferreira', 'Primeiro de Maio', 'Sertanópolis'],
        datasets: [{
          label: 'Taxa de reciclagem (%)',
          data: [4.2, 5.1, 3.8, 4.5, 5.6],
          backgroundColor: ['#174D36', '#26965B', '#4ECB8D', '#8AE0AF', '#B6F0CE'],
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

  // 5. IDHM
  const c5 = $('#chart-idhm');
  if (c5) {
    chartIDHM = new Chart(c5, {
      type: 'line',
      data: {
        labels: ['1991', '2000', '2010'],
        datasets: [{
          label: 'IDHM',
          data: [0.412, 0.581, 0.714],
          borderColor: '#26965B',
          backgroundColor: 'rgba(38,150,91,0.15)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#174D36', pointRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `IDHM: ${c.parsed.y}` } } },
        scales: {
          y: { beginAtZero: true, max: 1, grid: { color: getGridColor() } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 6. Coleta mensal 2023
  const c6 = $('#chart-mensal');
  if (c6) {
    chartMensal = new Chart(c6, {
      type: 'bar',
      data: {
        labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        datasets: [{
          label: 'Toneladas coletadas',
          data: [258, 245, 262, 250, 248, 240, 255, 261, 268, 275, 270, 288],
          backgroundColor: '#26965B',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.y} t` } } },
        scales: {
          y: { beginAtZero: true, grid: { color: getGridColor() }, ticks: { callback: (v) => v + ' t' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

function updateChartsTheme() {
  Chart.defaults.color = getTextColor();
  [chartComposicao, chartDestinacao, chartPopulacao, chartRegional, chartIDHM, chartMensal].forEach(c => {
    if (!c) return;
    if (c.options.scales?.y) c.options.scales.y.grid.color = getGridColor();
    c.update();
  });
}  

/* ============================================
   Chat IA — Assistente ReUse IA (Alvorada do Sul)
   ============================================ */
'use strict';

const CHAT_KNOWLEDGE = [
  {
    keywords: ['economia circular', 'circular', 'o que é economia'],
    answer: '🌱 <strong>Economia circular</strong> é um modelo que mantém materiais em uso o máximo possível. Baseia-se em <strong>reduzir, reutilizar, reparar e reciclar</strong>. Em Alvorada do Sul, isso significa dar nova função a materiais que iriam para o aterro, gerando renda e preservando o meio ambiente.'
  },
  {
    keywords: ['reutilizar', 'reciclar', 'diferença', 'diferenca'],
    answer: '♻️ <strong>Reutilizar</strong> = dar nova função a um material (ex: garrafa PET → vaso). Economiza energia.<br><br><strong>Reciclar</strong> = transformar o material em matéria-prima para um novo produto. Processo industrial.<br><br>Reutilizar é sempre preferível pois consome muito menos energia!'
  },
  {
    keywords: ['plástico', 'plastico', 'pet', 'garrafa'],
    answer: '🧴 <strong>Descarte de plástico em Alvorada do Sul:</strong><br>• Lixeira vermelha<br>• Coleta seletiva porta a porta em bairros centrais<br>• Ecoponto municipal (Secretaria do Meio Ambiente)<br>• Prefeitura também recebe em campanhas<br><br>💡 Sempre lave as embalagens antes de descartar. Uma garrafa PET pode levar mais de 400 anos para se decompor!'
  },
  {
    keywords: ['vidro', 'garrafa de vidro'],
    answer: '🍾 <strong>Descarte de vidro em Alvorada do Sul:</strong><br>• Lixeira verde<br>• Ecoponto municipal<br>• Campanhas sazonais da Prefeitura<br><br>⚠️ Vidro quebrado deve ser embrulhado em papel ou papelão antes do descarte.'
  },
  {
    keywords: ['papel', 'papelão', 'caixa', 'jornal'],
    answer: '📄 <strong>Descarte de papel e papelão em Alvorada do Sul:</strong><br>• Lixeira azul<br>• Coleta seletiva em dias específicos por região<br>• Ecoponto municipal<br><br>💡 Mantenha seco e limpo. Papel engordurado NÃO é reciclável.'
  },
  {
    keywords: ['metal', 'lata', 'alumínio', 'aluminio'],
    answer: '🥫 <strong>Descarte de metal em Alvorada do Sul:</strong><br>• Lixeira amarela<br>• Cooperativas conveniadas<br>• Campanhas de arrecadação de latinhas em escolas municipais<br><br>💡 Lave as latas e amasse quando possível.'
  },
  {
    keywords: ['tecido', 'roupa', 'doar roupa'],
    answer: '🧵 <strong>Tecidos e roupas em Alvorada do Sul:</strong><br>• Campanha do Agasalho municipal<br>• Igrejas e ONGs locais recebem doações<br>• Retalhos para projetos de costura comunitária<br><br>Têxteis levam décadas para se decompor — doe sempre!'
  },
  {
    keywords: ['orgânico', 'organico', 'compostagem'],
    answer: '🍎 <strong>Resíduos orgânicos em Alvorada do Sul:</strong><br>• Lixeira marrom<br>• Hortas comunitárias e escolas municipais aceitam para compostagem<br>• Secretaria de Agricultura orienta<br><br>💡 Faça compostagem em casa: alterne camadas de restos orgânicos e terra seca.'
  },
  {
    keywords: ['dados', 'números', 'numeros', 'estatística', 'estatistica', 'alvorada do sul'],
    answer: '📊 <strong>Dados de Alvorada do Sul-PR:</strong><br>• População: 10.671 habitantes (IBGE 2022)<br>• Área: 424,5 km²<br>• Resíduos coletados: ~9 t/dia<br>• Taxa de reciclagem: ~4,2% (SNIS 2022)<br>• IDHM (2010): 0,714 (alto)<br>• Bioma: Mata Atlântica<br><br>Veja todos os gráficos na seção "Dados"!'
  },
  {
    keywords: ['ods', 'objetivos', 'onu'],
    answer: '🌍 <strong>ODS abordadas pela ReUse IA:</strong><br><br>• <strong>ODS 12</strong> — Consumo e Produção Responsáveis<br>• <strong>ODS 13</strong> — Ação Contra a Mudança Climática<br>• <strong>ODS 11</strong> — Cidades e Comunidades Sustentáveis<br>• <strong>ODS 4</strong> — Educação de Qualidade<br>• <strong>ODS 9</strong> — Indústria, Inovação e Infraestrutura<br>• <strong>ODS 17</strong> — Parcerias e Meios de Implementação<br><br>Cada uma é impactada diretamente pela plataforma em Alvorada do Sul!'
  },
  {
    keywords: ['o que é o site', 'sobre o site', 'reuse ia', 'como funciona'],
    answer: '🌱 <strong>ReUse IA</strong> é uma plataforma de sustentabilidade focada em <strong>Alvorada do Sul-PR</strong>. Oferecemos:<br><br>• 📷 Identificação de materiais por IA real (TensorFlow.js)<br>• 💡 Sugestões de reutilização<br>• 📍 Informações de descarte correto no município<br>• 📊 Gráficos com dados reais de Alvorada do Sul<br>• 🎮 Jogo da memória + quiz educativo<br>• 💬 Este chat para tirar dúvidas'
  },
  {
    keywords: ['pilha', 'bateria', 'eletrônico', 'eletronico'],
    answer: '🔋 <strong>Pilhas e eletrônicos em Alvorada do Sul:</strong><br>• NÃO vão na coleta seletiva comum!<br>• Consulte a Secretaria Municipal do Meio Ambiente<br>• Campanhas de arrecadação em escolas<br><br>Pilhas contêm metais pesados altamente tóxicos!'
  },
  {
    keywords: ['óleo', 'oleo', 'óleo de cozinha'],
    answer: '🛢️ <strong>Óleo de cozinha em Alvorada do Sul:</strong><br>• NUNCA despeje na pia!<br>• Guarde em garrafa PET<br>• Entregue em campanhas da Prefeitura e escolas<br><br>1 litro de óleo contamina até 20.000 litros de água!'
  },
  {
    keywords: ['jogo', 'memória', 'memoria', 'quiz', 'brincar', 'jogar'],
    answer: '🎮 <strong>Jogos ReUse:</strong><br>• <strong>Jogo da Memória</strong>: encontre os pares de materiais recicláveis<br>• <strong>Quiz Separe Certo</strong>: responda perguntas e ganhe pontos<br><br>Role até a seção "Jogo" e escolha uma das abas para começar!'
  },
  {
    keywords: ['obrigado', 'obrigada', 'valeu', 'tchau'],
    answer: '😊 De nada! Estou aqui sempre que precisar. Juntos podemos fazer de Alvorada do Sul uma cidade mais sustentável! 🌱💚'
  },
  {
    keywords: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite'],
    answer: '👋 Olá! Que bom te ver por aqui! Posso ajudar com dúvidas sobre reciclagem, descarte correto em Alvorada do Sul, dados do município, ODS e o projeto ReUse IA. O que você quer saber?'
  }
];

function findAnswer(question) {
  const q = question.toLowerCase().trim();
  let best = null, bestScore = 0;

  for (const item of CHAT_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (q.includes(kw)) score += kw.length;
    }
    if (score > bestScore) { bestScore = score; best = item; }
  }

  if (best && bestScore > 0) return best.answer;

  return '🤔 Não encontrei resposta específica. Tente perguntar sobre:<br><br>• Reciclagem de plástico, vidro, papel, metal<br>• Descarte em Alvorada do Sul<br>• Economia circular<br>• Dados do município<br>• ODS<br>• Jogos<br><br>Ou reformule sua pergunta!';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = $('#chat-form');
  const input = $('#chat-input');
  const messages = $('#chat-messages');
  const suggestions = $('.chat-suggestions');

  if (!form) return;

  function addMessage(text, sender = 'user') {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + sender;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'typing';
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
      addMessage(findAnswer(text), 'bot');
    }, 600 + Math.random() * 400);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });

  suggestions.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) sendMessage(e.target.dataset.q);
  });
}); 

/* ============================================
   Jogos ReUse — Memória + Quiz
   ============================================ */
'use strict';

/* ---------- ABAS ---------- */
document.addEventListener('DOMContentLoaded', () => {
  $$('.game-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.game-tab').forEach(t => t.classList.remove('active'));
      $$('.game-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      $('#panel-' + tab.dataset.tab).classList.add('active');
    });
  });
});

/* ---------- JOGO DA MEMÓRIA ---------- */
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

let memState = {
  flipped: [], matched: [], moves: 0, score: 0,
  locked: false, timer: null, seconds: 0
};

document.addEventListener('DOMContentLoaded', () => {
  const grid = $('#memory-grid');
  if (!grid) return;

  $('#btn-mem-restart').onclick = startMemory;
  startMemory();

  function startMemory() {
    clearInterval(memState.timer);
    memState = { flipped: [], matched: [], moves: 0, score: 0, locked: false, timer: null, seconds: 0 };
    $('#mem-score').textContent = '0';
    $('#mem-moves').textContent = '0';
    $('#mem-pairs').textContent = '0 / 8';
    $('#mem-time').textContent = '00:00';
    $('#memory-message').textContent = '';

    const deck = [...MEM_ITEMS, ...MEM_ITEMS];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    grid.innerHTML = '';
    deck.forEach(item => {
      const card = document.createElement('div');
      card.className = 'mem-card';
      card.innerHTML = `
        <div class="mem-card-inner">
          <div class="mem-face mem-front">♻</div>
          <div class="mem-face mem-back">${item.icon}</div>
        </div>
      `;
      card.addEventListener('click', () => flipCard(card, item));
      grid.appendChild(card);
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
        if (memState.matched.length === 16) endMemory();
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

  function endMemory() {
    clearInterval(memState.timer);
    const timeBonus = Math.max(0, 300 - memState.seconds * 2);
    const moveBonus = Math.max(0, 100 - (memState.moves - 16) * 5);
    const total = memState.score + timeBonus + moveBonus;
    $('#mem-score').textContent = total;
    $('#memory-message').innerHTML = `🎉 <strong>Parabéns!</strong> ${memState.moves} jogadas em ${memState.seconds}s. Bônus tempo: +${timeBonus} · Bônus jogadas: +${moveBonus} · <strong>Total: ${total} pontos</strong>`;
  }
});

/* ---------- QUIZ SEPARE CERTO ---------- */
const QUIZ_QUESTIONS = [
  {
    icon: '🧴',
    question: 'Onde descartar uma garrafa PET em Alvorada do Sul?',
    options: ['Lixo comum', 'Coleta seletiva / Ecoponto', 'Terreno vazio', 'Queimar'],
    correct: 1,
    explain: 'A garrafa PET deve ir para a coleta seletiva ou Ecoponto municipal. Nunca no lixo comum!'
  },
  {
    icon: '🍾',
    question: 'Como descartar vidro quebrado com segurança?',
    options: ['Direto na lixeira verde', 'Embrulhado em papel/papelão', 'No lixo orgânico', 'Enterrado'],
    correct: 1,
    explain: 'Vidro quebrado deve ser embrulhado para proteger os catadores e coletores.'
  },
  {
    icon: '🥫',
    question: 'Qual é a cor da lixeira para metais?',
    options: ['Vermelha', 'Azul', 'Amarela', 'Verde'],
    correct: 2,
    explain: 'A lixeira amarela é destinada a metais. Lave as latas antes de descartar.'
  },
  {
    icon: '📄',
    question: 'Qual material NÃO é reciclável?',
    options: ['Jornal', 'Caixa de papelão', 'Papel engordurado de pizza', 'Revista'],
    correct: 2,
    explain: 'Papel engordurado (como caixas de pizza) não é reciclável porque a gordura contamina as fibras.'
  },
  {
    icon: '🍎',
    question: 'O que fazer com restos de alimentos em Alvorada do Sul?',
    options: ['Lixo comum', 'Compostagem / hortas comunitárias', 'Queimar', 'Enterrar no quintal'],
    correct: 1,
    explain: 'Restos orgânicos podem virar adubo através da compostagem. Hortas comunitárias e escolas municipais aceitam!'
  },
  {
    icon: '🛢️',
    question: 'Onde NUNCA descartar óleo de cozinha usado?',
    options: ['Em garrafa PET para coleta', 'Na pia', 'Em campanhas da Prefeitura', 'Em escolas'],
    correct: 1,
    explain: 'Óleo na pia entope canos e polui rios. 1 litro contamina até 20.000 litros de água!'
  },
  {
    icon: '🔋',
    question: 'Pilhas e baterias devem ir para:',
    options: ['Coleta seletiva comum', 'Lixo orgânico', 'Pontos de coleta especiais', 'Terreno vazio'],
    correct: 2,
    explain: 'Pilhas contêm metais pesados e precisam de pontos de coleta especiais.'
  },
  {
    icon: '🧵',
    question: 'Qual é a melhor destinação para roupas em bom estado?',
    options: ['Lixo comum', 'Doação', 'Queimar', 'Enterrar'],
    correct: 1,
    explain: 'Doe roupas em bom estado! Em Alvorada do Sul, a Campanha do Agasalho e ONGs locais recebem.'
  },
  {
    icon: '♻️',
    question: 'O que significa economia circular?',
    options: ['Reciclar tudo', 'Manter materiais em uso o máximo possível', 'Comprar menos', 'Produzir mais'],
    correct: 1,
    explain: 'Economia circular mantém materiais em uso pelo maior tempo possível: reduzir, reutilizar, reparar e reciclar.'
  },
  {
    icon: '🏙️',
    question: 'Qual é a população aproximada de Alvorada do Sul (IBGE 2022)?',
    options: ['5.000 hab', '10.671 hab', '50.000 hab', '100.000 hab'],
    correct: 1,
    explain: 'Alvorada do Sul tem 10.671 habitantes segundo o Censo IBGE 2022.'
  }
];

let quizState = { current: 0, hits: 0, misses: 0, score: 0, answered: false, order: [] };

document.addEventListener('DOMContentLoaded', () => {
  if (!$('#quiz-question')) return;
  $('#btn-quiz-next').onclick = nextQuestion;
  $('#btn-quiz-restart').onclick = startQuiz;
  startQuiz();

  function startQuiz() {
    quizState = { current: 0, hits: 0, misses: 0, score: 0, answered: false, order: [] };
    // Embaralha perguntas
    quizState.order = QUIZ_QUESTIONS.map((_, i) => i);
    for (let i = quizState.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quizState.order[i], quizState.order[j]] = [quizState.order[j], quizState.order[i]];
    }
    updateQuizHUD();
    renderQuestion();
  }

  function updateQuizHUD() {
    $('#quiz-current').textContent = quizState.current + 1;
    $('#quiz-hits').textContent = quizState.hits;
    $('#quiz-misses').textContent = quizState.misses;
    $('#quiz-score').textContent = quizState.score;
  }

  function renderQuestion() {
    if (quizState.current >= quizState.order.length) {
      endQuiz();
      return;
    }
    quizState.answered = false;
    const q = QUIZ_QUESTIONS[quizState.order[quizState.current]];
    $('#quiz-icon').textContent = q.icon;
    $('#quiz-question').textContent = q.question;
    $('#quiz-feedback').textContent = '';
    $('#quiz-feedback').className = 'quiz-feedback';
    $('#btn-quiz-next').disabled = true;

    const opts = $('#quiz-options');
    opts.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.onclick = () => checkAnswer(idx, q, btn);
      opts.appendChild(btn);
    });
  }

  function checkAnswer(idx, q, btn) {
    if (quizState.answered) return;
    quizState.answered = true;

    const allBtns = $$('.quiz-option');
    allBtns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add('correct');
    });

    const fb = $('#quiz-feedback');
    if (idx === q.correct) {
      btn.classList.add('correct');
      quizState.hits++;
      quizState.score += 10;
      fb.textContent = '✓ Correto! +10 pontos';
      fb.className = 'quiz-feedback ok';
    } else {
      btn.classList.add('wrong');
      quizState.misses++;
      fb.textContent = `✗ Incorreto. ${q.explain}`;
      fb.className = 'quiz-feedback err';
    }

    updateQuizHUD();
    $('#btn-quiz-next').disabled = false;
  }

  function nextQuestion() {
    quizState.current++;
    if (quizState.current >= quizState.order.length) endQuiz();
    else { renderQuestion(); updateQuizHUD(); }
  }

  function endQuiz() {
    const total = quizState.hits + quizState.misses;
    const pct = total > 0 ? Math.round((quizState.hits / total) * 100) : 0;
    $('#quiz-icon').textContent = '🏆';
    $('#quiz-question').textContent = `Fim do quiz! Você acertou ${quizState.hits}/${total} (${pct}%) e fez ${quizState.score} pontos.`;
    $('#quiz-options').innerHTML = '';
    $('#quiz-feedback').textContent = pct >= 70 ? '🎉 Excelente! Você é um(a) guardião(ã) da sustentabilidade!' : '💪 Continue praticando! Recomece para melhorar.';
    $('#quiz-feedback').className = 'quiz-feedback ok';
    $('#btn-quiz-next').disabled = true;
  }
});
