/* ==========================================================================
   難題解說：題目清單與切換
   --------------------------------------------------------------------------
   新增一題：
     1. 在 index.html 的 <main> 加一個 <section class="problem" id="pN" data-no data-title data-tag>
     2. 寫 pNN-xxx.js，最後登記：
          window.HardProblems = window.HardProblems || { _pending: {} };
          window.HardProblems._pending.pN = { onShow() {} };   // 切到該題時呼叫
     3. 在 index.html 載入該 JS（放在 problems.js 之前）
   清單由 section 的 data-* 自動產生，網址以 #pN 直接開啟某題。
   ========================================================================== */
(function () {
  'use strict';

  const registry = window.HardProblems && window.HardProblems._pending || {};

  function show(id) {
    const sections = document.querySelectorAll('section.problem');
    let target = document.getElementById(id);
    if (!target || !target.classList.contains('problem')) target = sections[0];
    if (!target) return;
    sections.forEach(s => s.classList.toggle('active', s === target));
    document.querySelectorAll('.problem-pick').forEach(b => b.classList.toggle('active', b.dataset.target === target.id));
    const p = registry[target.id];
    if (p && p.onShow) p.onShow();
  }

  function init() {
    const list = document.getElementById('hp-problem-list');
    document.querySelectorAll('section.problem').forEach(sec => {
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
    window.addEventListener('hashchange', () => show(location.hash.slice(1)));
    show(location.hash.slice(1));
  }

  window.HardProblems = {
    register(id, api) { registry[id] = api; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
