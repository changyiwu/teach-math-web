/* ==========================================================================
   難題解說：左側分冊導航與題目切換
   --------------------------------------------------------------------------
   新增一題：
     1. 在 index.html 的 <main> 加一個
          <section class="problem" id="pN" data-book data-no data-title data-tag>
        data-book 為冊別 1～6（同 curriculum.js：1＝第一冊七上 … 6＝第六冊九下）
     2. 寫 pNN-xxx.js，最後登記：
          window.HardProblems = window.HardProblems || { _pending: {} };
          window.HardProblems._pending.pN = { onShow() {} };   // 切到該題時呼叫
     3. 在 index.html 載入該 JS（放在 problems.js 之前）
   左側選單由 section 的 data-* 自動產生，各冊可展開／收攏（記在瀏覽器）；
   網址以 #pN 直接開啟某題，並自動展開該冊。
   ========================================================================== */
(function () {
  'use strict';

  const registry = window.HardProblems && window.HardProblems._pending || {};
  const BOOKS = [
    { id: '1', name: '第一冊', grade: '七上' },
    { id: '2', name: '第二冊', grade: '七下' },
    { id: '3', name: '第三冊', grade: '八上' },
    { id: '4', name: '第四冊', grade: '八下' },
    { id: '5', name: '第五冊', grade: '九上' },
    { id: '6', name: '第六冊', grade: '九下' }
  ];
  const STORE_KEY = 'hp-nav-open';

  /* 展開狀態只是個人方便，讀寫失敗就用預設 */
  function loadOpen() {
    try { const v = JSON.parse(localStorage.getItem(STORE_KEY)); return Array.isArray(v) ? new Set(v) : null; }
    catch (e) { return null; }
  }
  function saveOpen() {
    try {
      const ids = [...document.querySelectorAll('.nav-book.open')].map(g => g.dataset.book);
      localStorage.setItem(STORE_KEY, JSON.stringify(ids));
    } catch (e) { /* 忽略 */ }
  }

  function setOpen(group, open) {
    group.classList.toggle('open', open);
    group.querySelector('.nav-book-head').setAttribute('aria-expanded', String(open));
  }

  function show(id) {
    const sections = document.querySelectorAll('section.problem');
    let target = document.getElementById(id);
    if (!target || !target.classList.contains('problem')) target = sections[0];
    if (!target) return;
    sections.forEach(s => s.classList.toggle('active', s === target));
    document.querySelectorAll('.problem-pick').forEach(b => {
      const on = b.dataset.target === target.id;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    const group = document.querySelector(`.nav-book[data-book="${target.dataset.book}"]`);
    if (group && !group.classList.contains('open')) { setOpen(group, true); saveOpen(); }
    const p = registry[target.id];
    if (p && p.onShow) p.onShow();
  }

  function init() {
    const nav = document.getElementById('hp-problem-list');
    const sections = [...document.querySelectorAll('section.problem')];
    const saved = loadOpen();

    nav.innerHTML = '<div class="nav-title"><i class="fa-solid fa-list-ul"></i> 題目選單</div>';
    BOOKS.forEach(book => {
      const items = sections.filter(s => s.dataset.book === book.id);
      const group = document.createElement('div');
      group.className = 'nav-book' + (items.length ? '' : ' empty');
      group.dataset.book = book.id;

      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'nav-book-head';
      head.setAttribute('aria-controls', 'hp-book-' + book.id);
      head.innerHTML = `<i class="fa-solid fa-chevron-right nav-caret" aria-hidden="true"></i>
        <span class="nav-book-name">${book.name}<small>${book.grade}</small></span>
        <span class="nav-count">${items.length}</span>`;
      head.addEventListener('click', () => { setOpen(group, !group.classList.contains('open')); saveOpen(); });

      const list = document.createElement('div');
      list.className = 'nav-book-list';
      list.id = 'hp-book-' + book.id;
      if (!items.length) list.innerHTML = '<p class="nav-empty">尚無題目</p>';
      items.forEach(sec => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'problem-pick';
        b.dataset.target = sec.id;
        b.innerHTML = `<span class="pick-no">第 ${sec.dataset.no} 題</span>
          <span class="pick-title">${sec.dataset.title}</span>
          <span class="pick-tag">${sec.dataset.tag}</span>`;
        b.addEventListener('click', () => {
          history.replaceState(null, '', '#' + sec.id);
          show(sec.id);
        });
        list.appendChild(b);
      });

      group.append(head, list);
      nav.appendChild(group);
      setOpen(group, saved ? saved.has(book.id) : false);
    });

    window.addEventListener('hashchange', () => show(location.hash.slice(1)));
    show(location.hash.slice(1));
  }

  window.HardProblems = {
    register(id, api) { registry[id] = api; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
