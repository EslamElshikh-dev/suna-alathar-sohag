'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
const dialog = $('#detail-dialog');
const form = $('#impact-form');
const result = $('#impact-result');
let currentCard = '';
let toastTimer;
let rippleTimer;
let rippleCount = 0;
let lastDialogTrigger = null;

const circles = {
  learn: {
    eyebrow: '01 / دائرة المعرفة', title: 'معرفة تتشارك.',
    description: 'حاجة تعرفها كويس ممكن تختصر طريقًا على حد تاني. ابدأ بمعرفة قريبة من خبرتك، وحدّد مين ممكن يستفيد منها.',
    ideas: ['تبسيط مهارة رقمية أو طريقة استخدام أداة مفيدة.', 'إعداد دليل تعلّم قصير بمصادر واضحة وموثوقة.', 'مشاركة خبرة دراسية أو مهنية، في حدود تخصصك.'],
    resultTitle: 'شارك حاجة تعرفها كويس.',
    resultDescription: 'اختار مهارة واحدة تقدر تشرحها ببساطة. أول أثر ممكن يكون معلومة مفيدة، توصل للشخص اللي محتاجها في الوقت المناسب.',
    steps: ['حدّد معلومة أو مهارة تعرفها فعلًا.', 'حوّلها لشرح صغير أو مثال عملي بمصدر واضح.', 'اعرضها على شخص مهتم، واسمع منه إيه اللي محتاج توضيح.'],
    monthlySteps: ['اختار موضوعًا صغيرًا يناسب خبرتك.', 'جهّز لقاءً أو دليلًا بسيطًا، مع التأكد من دقة المعلومات.', 'اتفق مع مجموعة مهتمة على طريقة مناسبة للمشاركة، ثم اسمع ملاحظاتهم.']
  },
  people: {
    eyebrow: '02 / دائرة الإنسان', title: 'إنسان يسند إنسان.',
    description: 'أحيانًا أول باب للسند هو إننا نسمع باهتمام، ونفهم الاحتياج من صاحبه. نشارك باحترام، من غير وعود أكبر من قدرتنا أو صور تمس خصوصية الناس.',
    ideas: ['تيسير الوصول لمعلومة خدمية منشورة وموثوقة.', 'المشاركة في تنظيم نشاط إنساني معلن، بعد موافقة الجهة المسؤولة.', 'دعم جار أو زميل بمساعدة مناسبة، مع احترام موافقته وحدوده.'],
    resultTitle: 'ابدأ بأنك تسمع وتفهم.',
    resultDescription: 'فكّر في مساعدة بسيطة تقدر تقدّمها لشخص حولك، بموافقته وفي حدود إمكانياتك. الاهتمام الصادق بداية لها قيمة.',
    steps: ['اسأل شخصًا قريبًا منك عن مساعدة يحتاجها، بدون افتراضات.', 'اختار خطوة آمنة ومحددة تقدر تلتزم بها.', 'استأذن قبل أي مشاركة للمعلومات أو التصوير، وتابع باحترام.'],
    monthlySteps: ['تعرّف على نشاط مجتمعي معلن من جهة معتمدة.', 'اتفق مع المسؤول على دور يناسب قدرتك ووقتك.', 'شارك في الدور المتفق عليه، مع حفظ كرامة وخصوصية الجميع.']
  },
  green: {
    eyebrow: '03 / دائرة البيئة', title: 'خير ينبت حوالينا.',
    description: 'المكان اللي نحبّه يستاهل مننا اهتمامًا يوميًا. البداية ممكن تكون عادة أهدى، وترشيد مورد، أو فكرة صغيرة تخلي محيطنا أحسن.',
    ideas: ['مراجعة استهلاك المياه والطاقة في البيت.', 'تبادل نصائح موثوقة للعناية بالنباتات وترشيد الموارد.', 'اقتراح تحسين للمكان، بالتنسيق مع المسؤول والحصول على الإذن اللازم.'],
    resultTitle: 'اختار عادة تخدم المكان.',
    resultDescription: 'ابدأ من البيت أو محيطك القريب. تحسين صغير يتكرر ممكن يكون أنفع من خطوة كبيرة من غير استمرار.',
    steps: ['اختار عادة واحدة لترشيد المياه أو تقليل الهدر.', 'دوّن ملاحظة بسيطة تساعدك تتابع التغيير.', 'شارك ما تعلّمته مع أهلك، ووسّع الفكرة بهدوء.'],
    monthlySteps: ['اختار فكرة بيئية صغيرة قابلة للاستمرار.', 'راجع احتياجاتها وإذن المسؤول عن المكان قبل تنفيذها.', 'نفّذ الخطوة المتفق عليها وحدّد موعدًا للعناية والمتابعة.']
  },
  create: {
    eyebrow: '04 / دائرة الإبداع', title: 'موهبة تفتح مساحة.',
    description: 'الكلمة والصورة والتصميم ممكن يقرّبوا فكرة مفيدة للناس. الإبداع مسؤولية: نتحقق من المعلومة، ونحترم حقوق الصور، ونستأذن أصحاب الحكاية.',
    ideas: ['تبسيط معلومة موثوقة في تصميم واضح وسهل القراءة.', 'إعداد قصة إنسانية بموافقة أصحابها، مع احترام الخصوصية.', 'مشاركة مهارة في الكتابة أو التصميم أو التصوير، وفق احتياج معلن.'],
    resultTitle: 'حوّل فكرة مفيدة لمحتوى.',
    resultDescription: 'اختار رسالة واحدة تستاهل توصل. استخدم مهارتك في الكتابة أو الصورة أو التصميم عشان تحكيها بوضوح ومن غير مبالغة.',
    steps: ['حدّد فكرة واحدة وجمهورًا واضحًا.', 'راجع المصدر وحقوق المواد، واستأذن أصحاب الحكاية عند الحاجة.', 'اصنع نسخة صغيرة، واختبر وضوحها مع شخص قبل نشرها بنفسك.'],
    monthlySteps: ['اختار موضوعًا له قيمة محلية ومصادر موثوقة.', 'جهّز سلسلة قصيرة أو عملًا واحدًا متكاملًا.', 'راجع الدقة والموافقات وحقوق النشر، ثم اختر طريقة المشاركة المناسبة.']
  }
};

const timeLabels = { weekly: 'ساعة أسبوعيًا', monthly: 'يوم كل شهر', flex: 'حسب وقتي' };

const identityDialog = $('#identity-dialog');
const identityTrigger = $('#identity-open');
identityTrigger.addEventListener('click', () => {
  identityDialog.showModal();
  document.body.classList.add('dialog-is-open');
});
$('.identity-close', identityDialog).addEventListener('click', () => identityDialog.close());
identityDialog.addEventListener('click', event => {
  if (event.target === identityDialog) identityDialog.close();
});
identityDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-is-open');
  identityTrigger.focus({ preventScroll: true });
});

$('.motion-toggle').addEventListener('click', event => {
  const paused = document.body.classList.toggle('motion-paused');
  event.currentTarget.setAttribute('aria-pressed', String(paused));
  event.currentTarget.setAttribute('aria-label', paused ? 'تشغيل الحركة' : 'إيقاف الحركة');
  event.currentTarget.title = paused ? 'تشغيل الحركة' : 'إيقاف الحركة';
  $('span', event.currentTarget).textContent = paused ? '▷' : 'Ⅱ';
});

function toast(message) {
  const target = $('.toast');
  clearTimeout(toastTimer);
  target.textContent = message;
  target.hidden = false;
  toastTimer = setTimeout(() => { target.hidden = true; }, 4500);
}

function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'فتح بوصلة الأثر');
  mobileMenu.hidden = true;
  if (returnFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'إغلاق بوصلة الأثر' : 'فتح بوصلة الأثر');
  mobileMenu.hidden = !open;
});
$$('a', mobileMenu).forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true); });
document.addEventListener('click', event => { if (!mobileMenu.hidden && !event.target.closest('.site-header')) closeMenu(); });
window.matchMedia('(min-width: 1024px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

function listItems(target, items) {
  target.replaceChildren(...items.map(text => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
}

function showDialog({ eyebrow, title, description, items, circle, action = true }, trigger) {
  $('#dialog-eyebrow').textContent = eyebrow;
  $('#dialog-title').textContent = title;
  $('#dialog-description').textContent = description;
  listItems($('#dialog-list'), items);
  $('#dialog-action').hidden = !action;
  $('#dialog-action').dataset.circle = circle || '';
  lastDialogTrigger = trigger || document.activeElement;
  dialog.showModal();
  document.body.classList.add('dialog-is-open');
}

function closeDialog() { if (dialog.open) dialog.close(); }
$('.dialog-close', dialog).addEventListener('click', closeDialog);
dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-is-open');
  if (lastDialogTrigger instanceof HTMLElement) lastDialogTrigger.focus({ preventScroll: true });
});

$$('[data-circle]').forEach(button => button.addEventListener('click', () => {
  const circle = button.dataset.circle;
  const content = circles[circle];
  showDialog({ eyebrow: content.eyebrow, title: content.title, description: content.description, items: content.ideas, circle }, button);
}));
$('#dialog-action').addEventListener('click', () => {
  const circle = $('#dialog-action').dataset.circle;
  if (circles[circle]) {
    $(`input[name="interest"][value="${circle}"]`, form).checked = true;
    showForm();
  }
  closeDialog();
  requestAnimationFrame(() => $('input[name="interest"]:checked', form).focus({ preventScroll: true }));
});

$('#privacy-open').addEventListener('click', event => showDialog({
  eyebrow: 'بياناتك وخصوصيتك', title: 'المشاركة تبدأ بثقة.',
  description: 'لا يطلب الموقع اسمك أو رقمك أو موقعك الدقيق. أداة بطاقة أثرك لا ترسل الاختيارات إلى أي جهة، ولا تستخدم ملفات تعريف ارتباط أو أدوات تتبّع إعلانية.',
  items: ['عند مشاركة البطاقة تختار أنت التطبيق والمستلم، وتسري سياسة التطبيق الذي تختاره.', 'حفظ البطاقة ينزّل ملفًا نصيًا على جهازك. لا يُرفع الملف إلى الموقع.', 'قد تسجّل منصة الاستضافة بيانات الوصول التقنية المعتادة لتشغيل الموقع وحمايته.'], action: false
}, event.currentTarget));
$('#site-note-open').addEventListener('click', event => showDialog({
  eyebrow: 'صنّاع الأثر / سوهاج', title: 'عن هذه النسخة.',
  description: 'هذه نسخة تعريفية أولى لهوية صنّاع الأثر في سوهاج. مساحات المشاركة المعروضة أفكار مقترحة، ولا تعني وجود برامج أو تسجيل مفتوح.',
  items: ['الشعار تصميم جديد مقترح لهوية الموقع، وليس شعارًا رسميًا منقولًا من جهة أخرى.', 'تُضاف بيانات الفريق، وقنواته الرسمية، والأنشطة الفعلية بعد اعتمادها.', 'لا يعرض الموقع شراكات أو أرقام إنجازات أو صفة قانونية غير موثّقة.', 'الصور مولّدة بصريًا للتعبير عن روح المشاركة، وليست توثيقًا لأنشطة الفريق. والرسم المستوحى من النيل ليس خريطة فروع.'], action: false
}, event.currentTarget));

function selectedValues() {
  const data = new FormData(form);
  const interest = circles[data.get('interest')] ? data.get('interest') : 'learn';
  const time = Object.hasOwn(timeLabels, data.get('time')) ? data.get('time') : 'weekly';
  return { interest, time, district: String(data.get('district') || 'سوهاج') };
}

function renderCard(moveFocus = true) {
  const { interest, time, district } = selectedValues();
  const content = circles[interest];
  const steps = time === 'monthly' ? content.monthlySteps : content.steps;
  $('#result-title').textContent = content.resultTitle;
  $('#result-description').textContent = content.resultDescription;
  listItems($('#result-steps'), steps);
  $('#result-location').textContent = `⌖ ${district}`;
  $('#result-time').textContent = `◷ ${timeLabels[time]}`;
  currentCard = ['بطاقة أثري | صنّاع الأثر — سوهاج', '', content.resultTitle, content.resultDescription, '', `المكان: ${district}`, `الوقت: ${timeLabels[time]}`, '', ...steps.map((step, index) => `${index + 1}. ${step}`), '', 'هذه فكرة شخصية للمشاركة وليست تسجيلًا أو قبولًا أو تكليفًا من الفريق.', 'https://suna-alathar-sohag.vercel.app/'].join('\n');
  form.hidden = true;
  result.hidden = false;
  if (moveFocus) {
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }
}

function showForm() { form.hidden = false; result.hidden = true; }
form.addEventListener('submit', event => { event.preventDefault(); renderCard(); });
$('#edit-card').addEventListener('click', () => { showForm(); $('input[name="interest"]:checked', form).focus({ preventScroll: true }); });

$('#download-card').addEventListener('click', () => {
  if (!currentCard) return;
  const blob = new Blob(['\uFEFF' + currentCard], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'my-impact-card.txt';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('بطاقتك جاهزة للحفظ على جهازك.');
});

$('#share-card').addEventListener('click', async () => {
  if (!currentCard) return;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'بطاقة أثري | صنّاع الأثر', text: currentCard });
      return;
    } catch (error) { if (error.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(currentCard);
    toast('اتنسخت بطاقتك. شاركها مع الشخص المناسب.');
  } catch {
    $('#download-card').click();
    toast('المشاركة غير متاحة هنا. احفظ البطاقة وشاركها من جهازك.');
  }
});

const districtButtons = $$('[data-district]');
function syncDistrict(district) {
  districtButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.district === district)));
  $('#selected-district').textContent = district;
  $$('.district-name').forEach(label => { label.textContent = district; });
  if (!result.hidden) renderCard(false);
}
districtButtons.forEach(button => button.addEventListener('click', () => {
  $('#district').value = button.dataset.district;
  syncDistrict(button.dataset.district);
}));
$('#district').addEventListener('change', event => syncDistrict(event.target.value));

const rippleMessages = ['خطوة منك… تفتح طريقًا لغيرك.', 'الفكرة لما تتشارك، بتكبر.', 'أهل الخير… هم بداية الحكاية.', 'أثر صغير. دوائر ما بتنتهيش.'];
$('.ripple-trigger').addEventListener('click', () => {
  clearTimeout(rippleTimer);
  const waves = $('.ripple-waves');
  waves.replaceChildren();
  if (!reducedMotion.matches && !document.body.classList.contains('motion-paused')) {
    const wave = document.createElement('span');
    wave.className = 'user-wave';
    waves.append(wave);
    rippleTimer = setTimeout(() => waves.replaceChildren(), 2100);
  }
  $('.ripple-message').textContent = rippleMessages[rippleCount % rippleMessages.length];
  rippleCount += 1;
});

const galleryDialog = $('#gallery-dialog');
const galleryItems = [
  { src: '/assets/community-v2.webp', title: 'لما الفكرة تجمع ناسها.' },
  { src: '/assets/green-v2.webp', title: 'الخير كمان بينمو.' },
  { src: '/assets/creative-v2.webp', title: 'الموهبة لما تلاقي مكان.' }
];
let galleryIndex = 0;
let galleryTrigger = null;
function renderGallery() {
  const item = galleryItems[galleryIndex];
  $('#gallery-image').src = item.src;
  $('#gallery-image').alt = `صورة تعبيرية: ${item.title}`;
  $('#gallery-title').textContent = item.title;
  $('#gallery-count').textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
}
function moveGallery(direction) {
  galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
  renderGallery();
}
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  galleryIndex = Number(button.dataset.gallery) || 0;
  galleryTrigger = button;
  renderGallery();
  galleryDialog.showModal();
  document.body.classList.add('dialog-is-open');
}));
$('.gallery-close').addEventListener('click', () => galleryDialog.close());
$('#gallery-prev').addEventListener('click', () => moveGallery(-1));
$('#gallery-next').addEventListener('click', () => moveGallery(1));
galleryDialog.addEventListener('click', event => { if (event.target === galleryDialog) galleryDialog.close(); });
galleryDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveGallery(1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); moveGallery(-1); }
});
galleryDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-is-open');
  if (galleryTrigger instanceof HTMLElement) galleryTrigger.focus({ preventScroll: true });
});

const chapterDock = $('.chapter-dock');
const chapterLabels = { top: 'البداية', story: 'الحكاية', circles: 'مسارات الأثر', moments: 'ملامح الأثر', participate: 'بطاقة أثرك', sohag: 'روح سوهاج', questions: 'سؤال وبداية' };
const chapterLinks = $$('[data-chapter]');
let currentChapter = 'top';
function activateChapter(id) {
  if (currentChapter === id) return;
  currentChapter = id;
  $('#current-crumb').textContent = chapterLabels[id] || 'البداية';
  chapterLinks.forEach(link => {
    const active = link.dataset.chapter === id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
if ('IntersectionObserver' in window) {
  const ctaObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      chapterDock.classList.toggle('is-quiet', entry.isIntersecting);
    }
  }, { threshold: 0.08 });
  ctaObserver.observe($('#participate'));
  const sections = $$('#story, #circles, #moments, #participate, #sohag, #questions');
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length) activateChapter(visible[0].target.id);
  }, { rootMargin: '-18% 0px -45% 0px', threshold: [0, 0.1, 0.4] });
  sections.forEach(section => navObserver.observe(section));
}

let scrollQueued = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $('.scroll-progress').style.width = `${max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0}%`;
  document.body.classList.toggle('scrolled', window.scrollY > 320);
  if (window.scrollY < 180) activateChapter('top');
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
updateScroll();
$('#year').textContent = String(new Date().getFullYear());
