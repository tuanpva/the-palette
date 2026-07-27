/*
  The Palette — shared behaviour for all room pages + food.html.
  Only the functions a given page actually calls (via onclick=) ever run,
  so it's safe for every page to load this one file. This is the ONLY
  language implementation in the project — every page shares it.
*/

const LANG_STORAGE_KEY = 'language';
const DEFAULT_LANG = 'vi';

let currentLang = DEFAULT_LANG;

const T = {
  pwCopied: { vi: 'Đã sao chép mật khẩu wifi', en: 'Wifi password copied' },
  copyBtn:  { vi: 'Sao chép', en: 'Copy' },
  copyDone: { vi: 'Đã chép ✓', en: 'Copied ✓' }
};

/* ---------- persistence ---------- */

function saveLanguage(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

function loadLanguage() {
  return localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
}

/* ---------- applying a language to the current page ---------- */

// Swap every bilingual node, toggle button state, aria-labels, title, and
// any already-visible dynamic text (toast / shuffle pick) to `lang`.
// Pure DOM sync — no persistence, no gate side-effects.
function updateLanguage(lang) {
  currentLang = lang;
  // Swapping this attribute is enough to show/hide every [data-vi]/[data-en] node —
  // see the html[lang="…"] rules in base.css. No per-element inline styles to manage.
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-aria-vi]').forEach(el => {
    el.setAttribute('aria-label', lang === 'vi' ? el.getAttribute('data-aria-vi') : el.getAttribute('data-aria-en'));
  });

  const titleVi = document.documentElement.getAttribute('data-title-vi');
  const titleEn = document.documentElement.getAttribute('data-title-en');
  if (titleVi && titleEn) {
    document.title = lang === 'vi' ? titleVi : titleEn;
  }

  const viBtn = document.getElementById('tg-vi');
  const enBtn = document.getElementById('tg-en');
  if (viBtn) { viBtn.classList.toggle('on', lang === 'vi'); viBtn.setAttribute('aria-pressed', lang === 'vi'); }
  if (enBtn) { enBtn.classList.toggle('on', lang === 'en'); enBtn.setAttribute('aria-pressed', lang === 'en'); }

  // Keep already-visible dynamic content (toast / shuffle pick) in sync too.
  refreshToast();
  refreshShuffle();
}

function dismissGate() {
  const gate = document.getElementById('gate');
  if (gate && !gate.classList.contains('hidden')) {
    gate.classList.add('hidden');
    const toggle = document.getElementById('langToggle');
    if (toggle) toggle.style.display = 'flex';
  }
}

// Called from onclick="setLanguage('vi'|'en')" — an explicit guest choice.
function setLanguage(lang) {
  updateLanguage(lang);
  saveLanguage(lang);
  dismissGate();
}

// Runs once per page load: restore whatever language the guest last picked
// (on this room's page, or on any other page of the site) with no manual
// refresh needed. First-ever visit (nothing saved yet) still shows the
// language gate so the guest can make an explicit choice.
function initLanguage() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  updateLanguage(saved || DEFAULT_LANG);
  if (saved) dismissGate();
}

/* ---------- toast ---------- */

let toastTimer;
let activeToastDict = null; // the {vi,en} dict currently on screen, so a language switch mid-toast updates it too

function showToast(dict) {
  activeToastDict = dict;
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = dict[currentLang];
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); activeToastDict = null; }, 2200);
}

function refreshToast() {
  if (!activeToastDict) return;
  const toast = document.getElementById('toast');
  if (toast) toast.textContent = activeToastDict[currentLang];
}

/* ---------- clipboard ---------- */

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older iOS Safari / non-secure contexts (e.g. local file testing)
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

function copyPw(btn) {
  const pw = document.getElementById('pw').textContent;
  const viSpan = btn.querySelector('[data-vi]');
  const enSpan = btn.querySelector('[data-en]');

  copyToClipboard(pw).then(() => {
    // Write each span's OWN language text (not just the currently-visible one) so
    // switching languages mid-"done"-state never shows stale/wrong-language text.
    if (viSpan) viSpan.textContent = T.copyDone.vi;
    if (enSpan) enSpan.textContent = T.copyDone.en;
    btn.classList.add('done');
    showToast(T.pwCopied);
    setTimeout(() => {
      if (viSpan) viSpan.textContent = T.copyBtn.vi;
      if (enSpan) enSpan.textContent = T.copyBtn.en;
      btn.classList.remove('done');
    }, 2000);
  }).catch(() => {
    showToast(T.pwCopied);
  });
}

/* ---------- shuffle (playful & thoughtful) ---------- */

let lastShuffleIndex = null; // remembered so a language switch re-renders the SAME pick, translated

function rollShuffle() {
  const out = document.getElementById('shuffleOut');
  const list = JSON.parse(out.getAttribute('data-' + currentLang + '-list'));
  lastShuffleIndex = Math.floor(Math.random() * list.length);
  renderShuffle(true);
}

function renderShuffle(animate) {
  if (lastShuffleIndex === null) return;
  const out = document.getElementById('shuffleOut');
  if (!out) return;
  const list = JSON.parse(out.getAttribute('data-' + currentLang + '-list'));
  if (animate) {
    out.classList.remove('pop');
    void out.offsetWidth;
  }
  out.textContent = '“' + list[lastShuffleIndex] + '”';
  if (animate) out.classList.add('pop');
}

function refreshShuffle() {
  renderShuffle(false);
}

/* ---------- food.html category filter ---------- */

function filter(category, btn) {
  document.querySelectorAll('.filter').forEach(f => { f.classList.remove('on'); f.setAttribute('aria-pressed', 'false'); });
  btn.classList.add('on');
  btn.setAttribute('aria-pressed', 'true');
  if (category === 'all') {
    document.querySelectorAll('.group').forEach(g => g.classList.remove('hidden'));
    document.querySelectorAll('.spot').forEach(s => s.classList.remove('hidden'));
    return;
  }
  document.querySelectorAll('.group').forEach(g => {
    g.classList.toggle('hidden', g.getAttribute('data-group') !== category);
  });
}

initLanguage();
