/* PEKEDOG — Peluquería y educación canina a domicilio en Alicante */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Navbar & Theme
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const themeToggle = document.querySelector('.theme-toggle');

  window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); });
  menuToggle.addEventListener('click', () => { menuToggle.classList.toggle('active'); navMenu.classList.toggle('active'); });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => { menuToggle.classList.remove('active'); navMenu.classList.remove('active'); });
  });
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', (savedTheme === 'dark' || (!savedTheme && systemDark)) ? 'dark' : 'light');
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // 2. Before/After Slider
  const sliderContainer = document.querySelector('.comparison-slider');
  const afterImage = document.querySelector('.image-after');
  const handle = document.querySelector('.slider-handle');
  if (sliderContainer && afterImage && handle) {
    let isDragging = false;
    const move = (x) => {
      const rect = sliderContainer.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
      afterImage.style.clipPath = `polygon(0 0,${pct}% 0,${pct}% 100%,0 100%)`;
      handle.style.left = `${pct}%`;
    };
    sliderContainer.addEventListener('mousedown', e => { isDragging = true; move(e.clientX); });
    window.addEventListener('mouseup', () => { isDragging = false; });
    sliderContainer.addEventListener('mousemove', e => { if (isDragging) move(e.clientX); });
    sliderContainer.addEventListener('touchstart', e => { isDragging = true; if (e.touches[0]) move(e.touches[0].clientX); });
    window.addEventListener('touchend', () => { isDragging = false; });
    sliderContainer.addEventListener('touchmove', e => { if (isDragging && e.touches[0]) move(e.touches[0].clientX); });
  }

  // 3. Quiz (adaptado: peluquería vs adiestramiento vs combo)
  const quizData = [
    {
      question: "¿Qué servicio necesita tu perro principalmente?",
      options: [
        { text: "Un buen baño, corte o arreglo estético", score: "grooming" },
        { text: "Aprender comandos básicos y mejorar el paseo", score: "training" },
        { text: "Las dos cosas: está sucio y también algo desobediente", score: "combo" },
        { text: "No sé, me gustaría una valoración primero", score: "grooming" }
      ]
    },
    {
      question: "¿Con qué frecuencia sueles arreglar a tu perro?",
      options: [
        { text: "Nunca o casi nunca, no sé dónde llevarlo", score: "grooming" },
        { text: "Cada 1-2 meses en peluquería", score: "grooming" },
        { text: "Sólo cuando está muy sucio", score: "combo" },
        { text: "Prefiero que vengan a casa para evitarle estrés", score: "grooming" }
      ]
    },
    {
      question: "¿Cómo se porta tu perro en casa y en la calle?",
      options: [
        { text: "Bien, no tiene problemas de comportamiento", score: "grooming" },
        { text: "Tira mucho de la correa o no obedece", score: "training" },
        { text: "Es nervioso o tiene comportamientos que preocupan", score: "training" },
        { text: "Bastante bien pero me gustaría que mejorara", score: "combo" }
      ]
    },
    {
      question: "¿Tienes dificultad para llevar a tu perro a servicios presenciales?",
      options: [
        { text: "Sí, me va mejor que vengan a casa", score: "grooming" },
        { text: "No tengo problema en desplazarme", score: "training" },
        { text: "Depende del día", score: "combo" }
      ]
    }
  ];

  let currentStep = 0;
  const userAnswers = [];
  const quizStep = document.getElementById('quiz-step');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressFill = document.getElementById('progress-fill');
  const stepCount = document.getElementById('step-count');
  const quizResult = document.getElementById('quiz-result');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const recTitle = document.getElementById('rec-title');
  const recDesc = document.getElementById('rec-desc');
  const btnRestart = document.getElementById('btn-restart');
  const btnSelectResultPackage = document.getElementById('btn-select-result-package');

  function initQuiz() {
    if (!quizStep) return;
    currentStep = 0; userAnswers.length = 0;
    quizResult.classList.remove('active'); quizStep.classList.add('active');
    btnPrev.style.visibility = 'hidden'; btnNext.innerText = 'Siguiente';
    showQuestion();
  }

  function showQuestion() {
    const q = quizData[currentStep];
    quizQuestion.innerText = q.question;
    quizOptions.innerHTML = '';
    progressFill.style.width = `${(currentStep / quizData.length) * 100}%`;
    stepCount.innerText = `Paso ${currentStep + 1} de ${quizData.length}`;
    q.options.forEach((opt, idx) => {
      const el = document.createElement('div');
      el.classList.add('quiz-option');
      if (userAnswers[currentStep] === idx) el.classList.add('selected');
      el.innerHTML = `<div class="quiz-radio"></div><div class="quiz-option-text">${opt.text}</div>`;
      el.addEventListener('click', () => {
        document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected'); userAnswers[currentStep] = idx; btnNext.disabled = false;
      });
      quizOptions.appendChild(el);
    });
    btnNext.disabled = userAnswers[currentStep] === undefined;
    btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    btnNext.innerText = currentStep === quizData.length - 1 ? 'Ver Resultado' : 'Siguiente';
  }

  if (btnNext) btnNext.addEventListener('click', () => { if (currentStep < quizData.length - 1) { currentStep++; showQuestion(); } else showResults(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { if (currentStep > 0) { currentStep--; showQuestion(); } });
  if (btnRestart) btnRestart.addEventListener('click', initQuiz);

  function showResults() {
    quizStep.classList.remove('active'); quizResult.classList.add('active');
    progressFill.style.width = '100%'; stepCount.innerText = 'Resultado';
    const scores = { grooming: 0, training: 0, combo: 0 };
    userAnswers.forEach((ai, qi) => { scores[quizData[qi].options[ai].score]++; });
    let rec = 'grooming';
    if (scores.combo >= scores.grooming && scores.combo >= scores.training) rec = 'combo';
    else if (scores.training >= scores.grooming) rec = 'training';
    if (rec === 'grooming') {
      resultTitle.innerText = "Peluquería canina a domicilio";
      resultDesc.innerText = "Tu perro necesita un buen arreglo. Elisa va a tu casa para que tu peludo esté guapísimo sin estrés por el transporte.";
      recTitle.innerText = "Recomendado: Sesión de peluquería a domicilio";
      recDesc.innerText = "Baño, secado, corte y arreglo completo en la comodidad de tu hogar. Consulta disponibilidad según tu zona en Alicante.";
      btnSelectResultPackage.setAttribute('data-target-package', 'grooming');
    } else if (rec === 'training') {
      resultTitle.innerText = "Educación canina a domicilio";
      resultDesc.innerText = "Tu perro tiene margen de mejora en comportamiento. El trabajo en su propio entorno es el más efectivo y duradero.";
      recTitle.innerText = "Recomendado: Programa de educación canina";
      recDesc.innerText = "Sesiones individuales en casa para trabajar obediencia, paseo, llamada y convivencia. Sin desplazamientos, máxima eficacia.";
      btnSelectResultPackage.setAttribute('data-target-package', 'training');
    } else {
      resultTitle.innerText = "Servicio completo: peluquería + educación";
      resultDesc.innerText = "Tu perro se beneficiará de los dos servicios. Elisa puede ocuparse de ambas cosas con un trato cercano y profesional.";
      recTitle.innerText = "Recomendado: Pack peluquería + educación";
      recDesc.innerText = "Combina sesiones de arreglo con trabajo de educación canina. Pregunta por el precio especial del pack combinado.";
      btnSelectResultPackage.setAttribute('data-target-package', 'combo');
    }
  }

  if (btnSelectResultPackage) {
    btnSelectResultPackage.addEventListener('click', () => {
      selectPackage(btnSelectResultPackage.getAttribute('data-target-package'));
      document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
    });
  }
  initQuiz();

  // 4. Calculator
  const pkgGrooming = document.getElementById('pkg-grooming');
  const pkgTraining = document.getElementById('pkg-training');
  const pkgCombo = document.getElementById('pkg-combo');
  const rangeSessions = document.getElementById('range-sessions');
  const sessionCountVal = document.getElementById('session-count-val');
  const addonHome = document.getElementById('addon-home');
  const addonSupport = document.getElementById('addon-support');
  const addonMaterials = document.getElementById('addon-materials');
  const summaryPackageName = document.getElementById('summary-package-name');
  const summaryPackagePrice = document.getElementById('summary-package-price');
  const summarySessionsCount = document.getElementById('summary-sessions-count');
  const summarySessionsPrice = document.getElementById('summary-sessions-price');
  const summaryAddonsList = document.getElementById('summary-addons-list');
  const summaryAddonsPrice = document.getElementById('summary-addons-price');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const btnBookSession = document.getElementById('btn-book-session');

  const packages = {
    grooming: { name: "Peluquería a domicilio", basePrice: 35, baseSessions: 1, extra: 35 },
    training: { name: "Educación canina",       basePrice: 160, baseSessions: 4, extra: 35 },
    combo:    { name: "Pack Peluquería + Educación", basePrice: 185, baseSessions: 4, extra: 35 }
  };
  let activePackage = 'grooming';

  function selectPackage(key) {
    activePackage = key;
    [pkgGrooming, pkgTraining, pkgCombo].forEach(el => { if (el) el.classList.remove('selected'); });
    const t = document.getElementById(`pkg-${key}`);
    if (t) t.classList.add('selected');
    calculateCosts();
  }

  function setupCalc() {
    if (!pkgGrooming) return;
    pkgGrooming.addEventListener('click', () => selectPackage('grooming'));
    pkgTraining.addEventListener('click', () => selectPackage('training'));
    pkgCombo.addEventListener('click', () => selectPackage('combo'));
    rangeSessions.addEventListener('input', e => { sessionCountVal.innerText = e.target.value; calculateCosts(); });
    [addonHome, addonSupport, addonMaterials].forEach(a => { if (a) a.addEventListener('click', () => { a.classList.toggle('selected'); calculateCosts(); }); });
    if (btnBookSession) {
      btnBookSession.addEventListener('click', () => {
        const pkg = packages[activePackage];
        const msg = `Hola, me gustaría información sobre: *${pkg.name}* (${rangeSessions.value} sesiones). Presupuesto estimado: *${summaryTotalPrice.innerText}*.`;
        const cm = document.getElementById('message');
        if (cm) cm.value = msg;
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function calculateCosts() {
    if (!rangeSessions) return;
    const pkg = packages[activePackage];
    const sessions = parseInt(rangeSessions.value);
    const extra = Math.max(0, sessions - pkg.baseSessions);
    const sessionsCost = extra * pkg.extra;
    let addonsTotal = 0; const addonsNames = [];
    if (addonHome && addonHome.classList.contains('selected')) { addonsTotal += 0; addonsNames.push("Desplazamiento incluido"); }
    if (addonSupport && addonSupport.classList.contains('selected')) { addonsTotal += 30; addonsNames.push("Seguimiento mensual (+30€)"); }
    if (addonMaterials && addonMaterials.classList.contains('selected')) { addonsTotal += 25; addonsNames.push("Kit productos (+25€)"); }
    const total = pkg.basePrice + sessionsCost + addonsTotal;
    if (summaryPackageName) {
      summaryPackageName.innerText = pkg.name;
      summaryPackagePrice.innerText = `${pkg.basePrice}€`;
      summarySessionsCount.innerText = `${sessions} ses. (${pkg.baseSessions} base + ${extra} extra)`;
      summarySessionsPrice.innerText = `+${sessionsCost}€`;
      summaryAddonsList.innerText = addonsNames.length > 0 ? addonsNames.join(', ') : 'Ninguno';
      summaryAddonsPrice.innerText = `+${addonsTotal}€`;
      summaryTotalPrice.innerText = `~${total}€`;
    }
  }

  setupCalc(); calculateCosts();

  // 5. FAQ
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(el => { el.classList.remove('active'); el.querySelector('.faq-body').style.maxHeight = null; });
      if (!isActive) { item.classList.add('active'); const b = item.querySelector('.faq-body'); b.style.maxHeight = b.scrollHeight + 'px'; }
    });
  });

  // 6. Contact Form
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !message) { formStatus.innerText = "Por favor rellena los campos obligatorios."; formStatus.className = "form-status error"; return; }
      formStatus.innerText = "¡Gracias! Elisa te responderá en breve.";
      formStatus.className = "form-status success";
      contactForm.reset();
      setTimeout(() => { formStatus.style.display = 'none'; }, 5000);
    });
  }

});
