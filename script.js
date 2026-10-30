/* ============================================================
   ReUse IA — Lógica principal
   Sem chaves de API. IA é simulada em modo demo explicitamente.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const STORAGE_KEY = 'reuseia_state_v1';

  const CATEGORIES = {
    plastico: { label: 'Plástico', icon: '🧴' },
    papel: { label: 'Papel e papelão', icon: '📦' },
    vidro: { label: 'Vidro', icon: '🍾' },
    metal: { label: 'Metal', icon: '🥫' },
    tecido: { label: 'Tecido', icon: '👕' },
    madeira: { label: 'Madeira', icon: '🪵' },
    organico: { label: 'Resíduos orgânicos', icon: '🍃' },
    outros: { label: 'Outros materiais', icon: '♻️' }
  };

  const DIFFICULTIES = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

  /* ---------- Estado persistido ---------- */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {
      donations: [],
      ideas: [],
      points: 0,
      completedChallenges: [],
      achievements: []
    };
  }

  let state = loadState();

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('Não foi possível salvar estado', e); }
  }

  /* ---------- Seed de dados demonstrativos ---------- */
  function seedDemoData() {
    if (state._seeded) return;
    state.ideas = state.ideas.concat([
      {
        id: 'demo-idea-1',
        name: 'Vaso autoirrigável com garrafa PET',
        category: 'plastico',
        difficulty: 'facil',
        description: 'Transforme uma garrafa PET em um vaso que mantém a planta hidratada por mais tempo.',
        materials: ['1 garrafa PET', 'Tesoura', 'Tecido ou barbante', 'Terra e planta'],
        steps: [
          'Corte a garrafa ao meio.',
          'Faça um furo na tampa e passe o barbante.',
          'Encaixe a parte de cima na de baixo (virada).',
          'Adicione água na parte inferior e terra com a planta na superior.'
        ],
        safety: ['Corte com cuidado, longe do corpo.', 'Lave bem a garrafa antes de usar.']
      },
      {
        id: 'demo-idea-2',
        name: 'Organizador de papelão para gaveta',
        category: 'papel',
        difficulty: 'facil',
        description: 'Reaproveite caixas de papelão para organizar gavetas e armários.',
        materials: ['Caixas de papelão', 'Tesoura/estilete', 'Fita adesiva', 'Régua'],
        steps: [
          'Corte as caixas em tiras iguais.',
          'Monte divisórias em grade.',
          'Fixe com fita adesiva.',
          'Forre com papel ou tecido, se desejar.'
        ],
        safety: ['Use estilete com apoio de régua e superfície firme.']
      },
      {
        id: 'demo-idea-3',
        name: 'Porta-lápis com latas de metal',
        category: 'metal',
        difficulty: 'facil',
        description: 'Decore latas limpas de metal para virar porta-lápis ou porta-pincéis.',
        materials: ['Latas de metal lavadas', 'Tinta acrílica', 'Pincel', 'Lixa fina'],
        steps: [
          'Lixe as latas para melhorar a aderência.',
          'Pinte com tinta acrílica.',
          'Deixe secar e decore.'
        ],
        safety: ['Cuidado com as bordas cortantes das latas.', 'Use tinta em local ventilado.']
      },
      {
        id: 'demo-idea-4',
        name: 'Ecobag com camiseta velha',
        category: 'tecido',
        difficulty: 'medio',
        description: 'Transforme uma camiseta antiga em sacola retornável sem costura.',
        materials: ['Camiseta velha', 'Tesoura', 'Régua'],
        steps: [
          'Corte as mangas.',
          'Alargue o decote para formar as alças.',
          'Corte a barra em tiras e dê nós para fechar o fundo.',
          'Vire a sacola do lado certo.'
        ],
        safety: ['Use tesoura afiada e superfície firme.']
      },
      {
        id: 'demo-idea-5',
        name: 'Porta-velas com potes de vidro',
        category: 'vidro',
        difficulty: 'medio',
        description: 'Reaproveite potes de vidro para criar porta-velas decorativos.',
        materials: ['Pote de vidro limpo', 'Areia ou pedrinhas', 'Vela', 'Cordão'],
        steps: [
          'Lave e seque bem o pote.',
          'Adicione areia no fundo.',
          'Encaixe a vela.',
          'Decore com cordão na boca do pote.'
        ],
        safety: ['Nunca deixe velas acesas sem supervisão.']
      },
      {
        id: 'demo-idea-6',
        name: 'Composteira simples com caixa de madeira',
        category: 'organico',
        difficulty: 'dificil',
        description: 'Monte uma composteira doméstica para resíduos orgânicos.',
        materials: ['Caixa de madeira', 'Terra', 'Folhas secas', 'Resíduos orgânicos'],
        steps: [
          'Faça furos de ventilação na caixa.',
          'Intercale camadas de terra, folhas e resíduos.',
          'Mantenha úmido e revolva a cada semana.'
        ],
        safety: ['Não adicione carnes, laticínios ou óleos.']
      }
    ]);

    state.donations = state.donations.concat([
      {
        id: 'demo-donation-1',
        name: 'Garrafas PET',
        category: 'plastico',
        quantity: 'Aproximadamente 30 unidades',
        condition: 'Limpas, sem tampas',
        description: 'Garrafas de 2L acumuladas em casa, prontas para reúso criativo.',
        region: 'São Paulo - SP (região aproximada)',
        type: 'doacao',
        image: null,
        createdAt: Date.now()
      },
      {
        id: 'demo-donation-2',
        name: 'Caixas de papelão',
        category: 'papel',
        quantity: 'Aproximadamente 15 caixas',
        condition: 'Bom estado',
        description: 'Caixas variadas, ótimas para organização e mudanças.',
        region: 'Campinas - SP (região aproximada)',
        type: 'troca',
        image: null,
        createdAt: Date.now()
      }
    ]);

    state._seeded = true;
    state.realDonationsCount = 0;
    saveState();
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(message, type = '') {
    const el = $('#toast');
    el.textContent = message;
    el.className = 'toast show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast ' + type; }, 3200);
  }

  /* ---------- Modal ---------- */
  function openModal(title, html) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  });

  /* ---------- Header / Nav ---------- */
  const header = $('#header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  });

  const navToggle = $('#navToggle');
  const nav = $('#nav');
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-link', nav).forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Active link on scroll
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => observer.observe(s));

  /* ---------- Contadores animados do hero ---------- */
  function animateNumber(el, target, duration = 1200) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function updateHeroCounters() {
    const totalMaterials = state.ideas.length + state.donations.length;
    animateNumber($('#heroMaterials'), totalMaterials);
    animateNumber($('#heroIdeas'), state.ideas.length);
    // Usuários demo + base
    animateNumber($('#heroUsers'), 128 + (state.points > 0 ? 1 : 0));
  }

  /* ---------- IDENTIFICADOR ---------- */
  const dropzone = $('#dropzone');
  const fileInput = $('#fileInput');
  const dropzoneEmpty = $('#dropzoneEmpty');
  const dropzonePreview = $('#dropzonePreview');
  const previewImg = $('#previewImg');
  const removeImg = $('#removeImg');
  const uploadFeedback = $('#uploadFeedback');
  const btnIdentify = $('#btnIdentify');
  const resultContent = $('#resultContent');
  const resultEmpty = $('#resultEmpty');
  let currentFile = null;
  let currentDataUrl = null;

  function resetUpload() {
    currentFile = null;
    currentDataUrl = null;
    fileInput.value = '';
    dropzoneEmpty.hidden = false;
    dropzonePreview.hidden = true;
    previewImg.src = '';
    uploadFeedback.textContent = '';
    uploadFeedback.className = 'upload-feedback';
  }

  function handleFile(file) {
    uploadFeedback.textContent = '';
    uploadFeedback.className = 'upload-feedback';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      uploadFeedback.textContent = 'Por favor, envie um arquivo de imagem (JPG, PNG ou WEBP).';
      uploadFeedback.classList.add('error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      uploadFeedback.textContent = 'A imagem deve ter no máximo 8 MB.';
      uploadFeedback.classList.add('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentFile = file;
      currentDataUrl = e.target.result;
      previewImg.src = currentDataUrl;
      dropzoneEmpty.hidden = true;
      dropzonePreview.hidden = false;
      uploadFeedback.textContent = 'Imagem carregada. Selecione a categoria e clique em "Solicitar identificação".';
      uploadFeedback.classList.add('success');
    };
    reader.readAsDataURL(file);
  }

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('.btn-icon-remove')) return;
    fileInput.click();
  });
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

  ['dragenter', 'dragover'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  removeImg.addEventListener('click', (e) => {
    e.stopPropagation();
    resetUpload();
  });

  /* Base de conhecimento para resultado */
  const MATERIAL_INFO = {
    plastico: {
      name: 'Plástico',
      description: 'Polímeros sintéticos amplamente presentes em embalagens e utensílios. Podem levar centenas de anos para se decompor.',
      reuse: ['Vasos e jardineiras', 'Organizadores', 'Irrigadores simples', 'Brindes e decoração', 'Projetos escolares'],
      disposal: 'Descarte na coleta seletiva de recicláveis. Lave e seque embalagens antes do descarte. Verifique se há ponto de coleta específico para o tipo de plástico.'
    },
    papel: {
      name: 'Papel e papelão',
      description: 'Materiais celulósicos recicláveis, geralmente com boa cadeia de reciclagem quando limpos e secos.',
      reuse: ['Organizadores de gaveta', 'Embalagens criativas', 'Cadernos artesanais', 'Brinquedos educativos', 'Forro de mudança'],
      disposal: 'Descarte na coleta seletiva de recicláveis. Mantenha seco e sem resíduos de alimentos. Caixas devem ser desmontadas e reduzidas em volume.'
    },
    vidro: {
      name: 'Vidro',
      description: 'Material 100% reciclável e infinitamente reciclável, mas requer cuidado no manuseio.',
      reuse: ['Porta-velas', 'Potes para armazenamento', 'Vasos', 'Decoração', 'Luminárias'],
      disposal: 'Encaminhe para coleta seletiva ou eco-pontos. Envolva cacos em papel ou caixa para evitar acidentes com coletores.'
    },
    metal: {
      name: 'Metal',
      description: 'Metais como alumínio e aço são altamente recicláveis e economicamente valorizados.',
      reuse: ['Porta-lápis', 'Vasos', 'Luminárias', 'Decoração industrial', 'Organizadores'],
      disposal: 'Descarte na coleta seletiva. Lave latas e embalagens para evitar odores. Cuidado com bordas cortantes.'
    },
    tecido: {
      name: 'Tecido',
      description: 'Fibras têxteis podem ser reutilizadas em novos objetos ou encaminhadas para reciclagem têxtil.',
      reuse: ['Ecobags', 'Panos de limpeza', 'Peças de artesanato', 'Forros e almofadas', 'Bonecas e brinquedos'],
      disposal: 'Doe roupas em bom estado. Peças muito gastas podem virar panos de limpeza ou ir para pontos de reciclagem têxtil.'
    },
    madeira: {
      name: 'Madeira',
      description: 'Material versátil que pode ser restaurado, transformado ou usado como biomassa.',
      reuse: ['Prateleiras', 'Caixotes e organizadores', 'Hortas verticais', 'Decoração rústica', 'Composteira'],
      disposal: 'Verifique pontos de coleta de resíduos de construção. Evite descartar em lixo comum quando houver opção de reaproveitamento.'
    },
    organico: {
      name: 'Resíduos orgânicos',
      description: 'Restos de alimentos e podas. Podem ser transformados em composto, adubo e energia.',
      reuse: ['Compostagem doméstica', 'Adubo para hortas', 'Biodigestores simples', 'Alimentação animal (com orientação)'],
      disposal: 'Priorize a compostagem. Quando não possível, encaminhe para coleta de orgânicos do município.'
    },
    outros: {
      name: 'Outros materiais',
      description: 'Materiais variados que podem ter destinação específica conforme sua composição.',
      reuse: ['Avalie caso a caso', 'Procure pontos de coleta específicos', 'Considere reparo antes do descarte'],
      disposal: 'Consulte o site da prefeitura ou pontos de coleta especializados. Alguns materiais exigem logística reversa.'
    }
  };

  btnIdentify.addEventListener('click', () => {
    const category = $('#manualCategory').value;

    if (!currentDataUrl) {
      uploadFeedback.textContent = 'Envie uma imagem antes de solicitar a identificação.';
      uploadFeedback.className = 'upload-feedback error';
      return;
    }
    if (!category) {
      uploadFeedback.textContent = 'Selecione a categoria do material (classificação manual).';
      uploadFeedback.className = 'upload-feedback error';
      return;
    }

    uploadFeedback.textContent = '';
    btnIdentify.disabled = true;
    btnIdentify.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Analisando…';

    // Simula processamento (modo demo)
    setTimeout(() => {
      btnIdentify.disabled = false;
      btnIdentify.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> Solicitar identificação';
      renderResult(category);
    }, 900);
  });

  function renderResult(category) {
    const info = MATERIAL_INFO[category];
    const cat = CATEGORIES[category];
    resultEmpty.hidden = true;
    resultContent.hidden = false;

    resultContent.innerHTML = `
      <div class="result-header">
        <span class="result-badge">
          <span class="demo-tag">Demo</span> Classificação
        </span>
        <div class="result-name">${cat.icon} ${info.name}</div>
      </div>

      <div class="result-section">
        <h4>📌 Sobre o material</h4>
        <p>${info.description}</p>
      </div>

      <div class="result-section">
        <h4>💡 Sugestões de reutilização</h4>
        <ul>${info.reuse.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>

      <div class="result-section">
        <h4>♻️ Descarte correto</h4>
        <p>${info.disposal}</p>
      </div>

      <div class="result-section">
        <p class="demo-tag">Modo demonstração</p>
        <p style="font-size:0.82rem;margin-top:8px">Esta classificação foi gerada a partir da <strong>categoria selecionada manualmente</strong>. A integração real com IA de reconhecimento de imagens está prevista na arquitetura e exige backend seguro (ex.: Firebase Functions / Supabase Edge Functions + modelo de visão computacional).</p>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">
        <a href="#laboratorio" class="btn btn-primary btn-sm">Ver ideias no Laboratório</a>
        <a href="#doacoes" class="btn btn-outline btn-sm">Anunciar para doação</a>
      </div>
    `;
    toast('Material identificado (demo). Veja as sugestões ao lado.', 'success');
  }

  /* ---------- LABORATÓRIO ---------- */
  const ideasGrid = $('#ideasGrid');
  const ideasEmpty = $('#ideasEmpty');

  function renderIdeas() {
    const cat = $('#filterCategory').value;
    const diff = $('#filterDifficulty').value;
    const q = $('#searchIdeas').value.trim().toLowerCase();

    const filtered = state.ideas.filter(idea => {
      if (cat !== 'all' && idea.category !== cat) return false;
      if (diff !== 'all' && idea.difficulty !== diff) return false;
      if (q && !(idea.name + ' ' + idea.description).toLowerCase().includes(q)) return false;
      return true;
    });

    ideasGrid.innerHTML = '';
    ideasEmpty.hidden = filtered.length > 0;

    filtered.forEach(idea => {
      const card = document.createElement('article');
      card.className = 'idea-card';
      const catLabel = CATEGORIES[idea.category] ? CATEGORIES[idea.category].label : idea.category;
      card.innerHTML = `
        <div class="idea-meta">
          <span class="idea-tag">${catLabel}</span>
          <span class="idea-tag difficulty-${idea.difficulty}">${DIFFICULTIES[idea.difficulty]}</span>
        </div>
        <h3>${escapeHtml(idea.name)}</h3>
        <p>${escapeHtml(idea.description)}</p>
        <button class="btn btn-outline" data-idea="${idea.id}">Ver detalhes</button>
      `;
      ideasGrid.appendChild(card);
    });

    $$('[data-idea]', ideasGrid).forEach(btn => {
      btn.addEventListener('click', () => openIdeaDetail(btn.dataset.idea));
    });
  }

  function openIdeaDetail(id) {
    const idea = state.ideas.find(i => i.id === id);
    if (!idea) return;
    const catLabel = CATEGORIES[idea.category] ? CATEGORIES[idea.category].label : idea.category;
    const html = `
      <p><strong>Categoria:</strong> ${catLabel} · <strong>Dificuldade:</strong> ${DIFFICULTIES[idea.difficulty]}</p>
      <p style="margin-top:12px">${escapeHtml(idea.description)}</p>
      <h4>Materiais necessários</h4>
      <ul>${idea.materials.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
      <h4>Etapas de execução</h4>
      <ul>${idea.steps.map((s, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(s)}</li>`).join('')}</ul>
      <h4>Cuidados de segurança</h4>
      <ul>${idea.safety.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
    `;
    openModal(idea.name, html);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  ['#filterCategory', '#filterDifficulty', '#searchIdeas'].forEach(sel => {
    $(sel).addEventListener('input', renderIdeas);
    $(sel).addEventListener('change', renderIdeas);
  });

  /* Cadastro de ideia */
  $('#btnAddIdea').addEventListener('click', () => {
    openModal('Cadastrar nova ideia', `
      <form id="formIdea">
        <div class="form-group">
          <label class="field-label">Nome do projeto *</label>
          <input class="input" name="name" required maxlength="80" placeholder="Ex.: Vaso com garrafa PET" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="field-label">Categoria *</label>
            <select class="input" name="category" required>
              <option value="">Selecione…</option>
              ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="field-label">Dificuldade *</label>
            <select class="input" name="difficulty" required>
              <option value="">Selecione…</option>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="field-label">Descrição *</label>
          <textarea class="input" name="description" rows="3" required maxlength="300" placeholder="Descreva a ideia"></textarea>
        </div>
        <div class="form-group">
          <label class="field-label">Materiais necessários (um por linha)</label>
          <textarea class="input" name="materials" rows="3" placeholder="Garrafa PET&#10;Tesoura"></textarea>
        </div>
        <div class="form-group">
          <label class="field-label">Etapas (uma por linha)</label>
          <textarea class="input" name="steps" rows="4" placeholder="Corte a garrafa&#10;Fixe o barbante"></textarea>
        </div>
        <div class="form-group">
          <label class="field-label">Cuidados de segurança (um por linha)</label>
          <textarea class="input" name="safety" rows="2"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar ideia</button>
        </div>
      </form>
    `);

    $('#formIdea').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = fd.get('name').trim();
      const category = fd.get('category');
      const difficulty = fd.get('difficulty');
      const description = fd.get('description').trim();

      if (!name || !category || !difficulty || !description) {
        toast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      const idea = {
        id: 'idea-' + Date.now(),
        name, category, difficulty, description,
        materials: fd.get('materials').split('\n').map(s => s.trim()).filter(Boolean),
        steps: fd.get('steps').split('\n').map(s => s.trim()).filter(Boolean),
        safety: fd.get('safety').split('\n').map(s => s.trim()).filter(Boolean)
      };
      state.ideas.push(idea);
      saveState();
      renderIdeas();
      updateKPIs();
      updateHeroCounters();
      closeModal();
      toast('Ideia cadastrada com sucesso!', 'success');
    });
  });

  /* ---------- DOAÇÕES ---------- */
  const donationsGrid = $('#donationsGrid');
  const donationsEmpty = $('#donationsEmpty');

  function renderDonations() {
    const q = $('#searchDonations').value.trim().toLowerCase();
    const cat = $('#filterDonationCategory').value;

    const filtered = state.donations.filter(d => {
      if (cat !== 'all' && d.category !== cat) return false;
      if (q && !(d.name + ' ' + d.description).toLowerCase().includes(q)) return false;
      return true;
    });

    donationsGrid.innerHTML = '';
    donationsEmpty.hidden = filtered.length > 0;

    filtered.forEach(d => {
      const catLabel = CATEGORIES[d.category] ? CATEGORIES[d.category].label : d.category;
      const card = document.createElement('article');
      card.className = 'donation-card';
      const img = d.image
        ? `<img src="${d.image}" alt="${escapeHtml(d.name)}" />`
        : `<span>${CATEGORIES[d.category] ? CATEGORIES[d.category].icon : '♻️'}</span>`;
      card.innerHTML = `
        <div class="donation-img">${img}</div>
        <div class="donation-body">
          <div class="donation-top">
            <h3>${escapeHtml(d.name)}</h3>
            <span class="donation-type ${d.type}">${d.type === 'doacao' ? 'Doação' : 'Troca'}</span>
          </div>
          <p class="donation-desc">${escapeHtml(d.description)}</p>
          <div class="donation-info">
            <span><strong>Categoria:</strong> ${catLabel}</span>
            <span><strong>Quantidade:</strong> ${escapeHtml(d.quantity)}</span>
            <span><strong>Estado:</strong> ${escapeHtml(d.condition)}</span>
            <span><strong>Região:</strong> ${escapeHtml(d.region)}</span>
          </div>
          <button class="btn btn-primary" data-interest="${d.id}">Tenho interesse</button>
        </div>
      `;
      donationsGrid.appendChild(card);
    });

    $$('[data-interest]', donationsGrid).forEach(btn => {
      btn.addEventListener('click', () => {
        openModal('Demonstrar interesse', `
          <p>Este é um ambiente de demonstração. Para manter a privacidade dos participantes, não exibimos contatos pessoais.</p>
          <p style="margin-top:12px">Em uma versão integrada com backend e autenticação, este botão criaria uma solicitação de contato registrada no sistema, com moderação e sem exposição de dados pessoais.</p>
          <div class="modal-actions">
            <button class="btn btn-outline" data-close>Entendi</button>
          </div>
        `);
      });
    });
  }

  ['#searchDonations', '#filterDonationCategory'].forEach(sel => {
    $(sel).addEventListener('input', renderDonations);
    $(sel).addEventListener('change', renderDonations);
  });

  /* Cadastrar anúncio */
  $('#btnNewDonation').addEventListener('click', () => {
    openModal('Cadastrar anúncio', `
      <form id="formDonation">
        <div class="form-group">
          <label class="field-label">Nome do material *</label>
          <input class="input" name="name" required maxlength="80" placeholder="Ex.: Garrafas PET" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="field-label">Categoria *</label>
            <select class="input" name="category" required>
              <option value="">Selecione…</option>
              ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="field-label">Disponibilidade *</label>
            <select class="input" name="type" required>
              <option value="doacao">Doação</option>
              <option value="troca">Troca</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="field-label">Quantidade aproximada *</label>
            <input class="input" name="quantity" required maxlength="60" placeholder="Ex.: 20 unidades" />
          </div>
          <div class="form-group">
            <label class="field-label">Estado de conservação *</label>
            <input class="input" name="condition" required maxlength="60" placeholder="Ex.: Bom estado" />
          </div>
        </div>
        <div class="form-group">
          <label class="field-label">Descrição *</label>
          <textarea class="input" name="description" rows="3" required maxlength="300"></textarea>
        </div>
        <div class="form-group">
          <label class="field-label">Cidade ou região aproximada *</label>
          <input class="input" name="region" required maxlength="80" placeholder="Ex.: São Paulo - SP (zona leste)" />
        </div>
        <div class="form-group">
          <label class="field-label">Foto (opcional)</label>
          <input class="input" type="file" name="image" accept="image/*" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" data-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Publicar</button>
        </div>
      </form>
    `);

    $('#formDonation').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = fd.get('name').trim();
      const category = fd.get('category');
      const type = fd.get('type');
      const quantity = fd.get('quantity').trim();
      const condition = fd.get('condition').trim();
      const description = fd.get('description').trim();
      const region = fd.get('region').trim();

      if (!name || !category || !type || !quantity || !condition || !description || !region) {
        toast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      // Moderação básica
      if (/(\d{2}[\s-]?)?\d{4,5}[\s-]?\d{4}/.test(description) || /@|whatsapp|telefone|tel\./i.test(description)) {
        toast('Não é permitido incluir telefones, e-mails ou contatos pessoais.', 'error');
        return;
      }

      const file = fd.get('image');
      const finish = (dataUrl) => {
        state.donations.unshift({
          id: 'don-' + Date.now(),
          name, category, type, quantity, condition, description, region,
          image: dataUrl || null,
          createdAt: Date.now()
        });
        state.realDonationsCount = (state.realDonationsCount || 0) + 1;
        saveState();
        renderDonations();
        updateKPIs();
        updateHeroCounters();
        closeModal();
        toast('Anúncio publicado com sucesso!', 'success');
      };

      if (file && file.size > 0) {
        if (!file.type.startsWith('image/')) {
          toast('Envie um arquivo de imagem válido.', 'error');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast('A imagem deve ter no máximo 5 MB.', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = ev => finish(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        finish(null);
      }
    });
  });

  /* ---------- KPIs / IMPACTO ---------- */
  function updateKPIs() {
    const totalMaterials = state.ideas.length + state.donations.length;
    $('#kpiMaterials').textContent = totalMaterials;
    $('#kpiReused').textContent = state.realDonationsCount || 0;
    $('#kpiDonations').textContent = state.donations.length;
    // Usuários: base demo fixa de 128 + 1 se participou (pontos > 0)
    $('#kpiUsers').textContent = 128 + (state.points > 0 ? 1 : 0);

    // Bar chart
    const counts = {};
    Object.keys(CATEGORIES).forEach(k => counts[k] = 0);
    state.donations.forEach(d => { if (counts[d.category] !== undefined) counts[d.category]++; });
    state.ideas.forEach(i => { if (counts[i.category] !== undefined) counts[i.category]++; });
    const max = Math.max(1, ...Object.values(counts));
    const barChart = $('#barChart');
    barChart.innerHTML = '';
    Object.entries(counts).forEach(([key, val]) => {
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `
        <span class="bar-label">${CATEGORIES[key].label}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(val / max) * 100}%"></div></div>
        <span class="bar-count">${val}</span>
      `;
      barChart.appendChild(row);
    });

    // Donut
    const donationsCount = state.donations.filter(d => d.type === 'doacao').length;
    const tradesCount = state.donations.filter(d => d.type === 'troca').length;
    const total = donationsCount + tradesCount;
    $('#legendDonation').textContent = donationsCount;
    $('#legendTrade').textContent = tradesCount;

    const donutDonation = $('.donut-donation');
    const donutTrade = $('.donut-trade');
    if (total === 0) {
      donutDonation.setAttribute('stroke-dasharray', '0 100');
      donutTrade.setAttribute('stroke-dasharray', '0 100');
    } else {
      const pDon = (donationsCount / total) * 100;
      const pTrade = (tradesCount / total) * 100;
      donutDonation.setAttribute('stroke-dasharray', `${pDon} ${100 - pDon}`);
      donutTrade.setAttribute('stroke-dasharray', `${pTrade} ${100 - pTrade}`);
      donutTrade.setAttribute('stroke-dashoffset', String(25 - pDon));
    }
  }

  /* ---------- DESAFIO ---------- */
  const CHALLENGES = [
    { id: 'ch1', title: 'Reaproveitar garrafas PET', desc: 'Crie um objeto útil com pelo menos 2 garrafas PET.', points: 20 },
    { id: 'ch2', title: 'Organizar campanha de arrecadação', desc: 'Reúna materiais recicláveis com amigos ou família.', points: 30 },
    { id: 'ch3', title: 'Reutilizar caixas de papelão', desc: 'Transforme caixas em organizadores.', points: 20 },
    { id: 'ch4', title: 'Criar objeto com recicláveis', desc: 'Faça um objeto criativo com materiais recicláveis.', points: 25 },
    { id: 'ch5', title: 'Compostar resíduos orgânicos', desc: 'Inicie uma composteira doméstica.', points: 35 }
  ];

  const ACHIEVEMENTS = [
    { id: 'first', label: 'Primeira ação', points: 1 },
    { id: 'eco10', label: '10 pontos', points: 10 },
    { id: 'eco50', label: '50 pontos', points: 50 },
    { id: 'eco100', label: '100 pontos', points: 100 },
    { id: 'all', label: 'Explorador', points: 130 }
  ];

  function renderChallenges() {
    const grid = $('#challengesGrid');
    grid.innerHTML = '';
    CHALLENGES.forEach(ch => {
      const done = state.completedChallenges.includes(ch.id);
      const card = document.createElement('article');
      card.className = 'challenge-card' + (done ? ' completed' : '');
      card.innerHTML = `
        <span class="challenge-points">+${ch.points} pts</span>
        <h3>${ch.title}</h3>
        <p>${ch.desc}</p>
        <button class="btn ${done ? 'btn-primary' : 'btn-outline'}" data-challenge="${ch.id}" ${done ? 'disabled' : ''}>
          ${done ? '✓ Concluído' : 'Registrar atividade'}
        </button>
      `;
      grid.appendChild(card);
    });

    $$('[data-challenge]', grid).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.challenge;
        if (state.completedChallenges.includes(id)) return;
        const ch = CHALLENGES.find(c => c.id === id);
        state.completedChallenges.push(id);
        state.points += ch.points;
        saveState();
        renderChallenges();
        renderProgress();
        updateKPIs();
        toast(`+${ch.points} pontos! Desafio concluído.`, 'success');
      });
    });
  }

  function renderProgress() {
    $('#userPoints').textContent = state.points;
    const maxPoints = CHALLENGES.reduce((s, c) => s + c.points, 0);
    const pct = Math.min(100, (state.points / maxPoints) * 100);
    $('#progressFill').style.width = pct + '%';

    let level = 'Nível 1 · Iniciante';
    if (state.points >= 130) level = 'Nível 5 · Guardião Circular';
    else if (state.points >= 80) level = 'Nível 4 · Agente Verde';
    else if (state.points >= 50) level = 'Nível 3 · Reutilizador';
    else if (state.points >= 20) level = 'Nível 2 · Aprendiz';
    $('#levelBadge').textContent = level;

    const achContainer = $('#achievements');
    achContainer.innerHTML = '';
    ACHIEVEMENTS.forEach(a => {
      const unlocked = state.points >= a.points;
      const el = document.createElement('span');
      el.className = 'achievement' + (unlocked ? ' unlocked' : '');
      el.innerHTML = `${unlocked ? '🏅' : '🔒'} ${a.label}`;
      achContainer.appendChild(el);
    });
  }

  /* ---------- INICIALIZAÇÃO ---------- */
  function init() {
    $('#year').textContent = new Date().getFullYear();
    seedDemoData();
    renderIdeas();
    renderDonations();
    renderChallenges();
    renderProgress();
    updateKPIs();
    updateHeroCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
