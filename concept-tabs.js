/* ==========================================================================
   Concept Tabs - 教材頁重點切換（一次只顯示一個重點）
   --------------------------------------------------------------------------
   把頁首的 .lesson-nav 重點選單搬到左側（窄螢幕改為頂端黏住的橫列），
   main 底下的暖身漫畫、各重點與總結各成一個分頁，一次只顯示一個，
   每個分頁底部另有「上一個／下一個」按鈕。沒有 JS 時頁面維持原本的整頁長版。

     <link rel="stylesheet" href="../../concept-tabs.css">
     <script src="../../concept-tabs.js"></script>   （放在 annotate.js 之後）

   - 網址 hash（#concept3）可直接開到指定分頁，切換時同步更新 hash。
   - 課堂畫筆的筆跡依分頁分開保存，切回來時還原，不會疊到別的重點上。
   ========================================================================== */
(function () {
  'use strict';

  // 不在 .lesson-nav 裡的分頁（暖身漫畫、總結）用這組名稱與圖示補上
  const EXTRA_TABS = [
    { match: s => s.id === 'motivation-comic', title: '暖身漫畫', icon: 'fa-face-smile' },
    { match: s => s.classList.contains('summary-section'), id: 'summary', title: '總結回顧', icon: 'fa-graduation-cap' }
  ];

  function init() {
    const nav = document.querySelector('header .lesson-nav');
    const main = document.querySelector('main');
    if (!nav || !main || document.querySelector('.ct-layout')) return;

    const links = new Map();
    nav.querySelectorAll('a.nav-item[href^="#"]').forEach(a => links.set(a.getAttribute('href').slice(1), a));

    // 依 main 內的順序組出分頁；認不得的 section 不動，照常顯示
    const tabs = [];
    let conceptNo = 0;
    Array.from(main.children).forEach(section => {
      if (section.tagName !== 'SECTION') return;
      const link = section.id && links.get(section.id);
      if (link) {
        const icon = link.querySelector('i');
        tabs.push({
          section,
          id: section.id,
          label: '重點 ' + (++conceptNo),
          title: link.textContent.trim(),
          icon: icon ? icon.className : 'fa-solid fa-circle'
        });
        return;
      }
      const extra = EXTRA_TABS.find(e => e.match(section));
      if (!extra) return;
      if (!section.id) section.id = extra.id;
      tabs.push({ section, id: section.id, label: '', title: extra.title, icon: 'fa-solid ' + extra.icon });
    });
    if (tabs.length < 2) return;

    nav.classList.add('ct-nav');
    nav.setAttribute('aria-label', '本節重點');
    nav.innerHTML = tabs.map(t => `
      <a href="#${t.id}" class="nav-item" data-tab="${t.id}">
        <i class="${t.icon}" aria-hidden="true"></i>
        <span class="ct-text">${t.label ? `<small>${t.label}</small>` : ''}${t.title}</span>
      </a>`).join('');

    const layout = document.createElement('div');
    layout.className = 'ct-layout';
    const aside = document.createElement('aside');
    aside.className = 'ct-aside';
    main.parentNode.insertBefore(layout, main);
    aside.appendChild(nav);
    layout.append(aside, main);
    document.documentElement.classList.add('ct-on');

    tabs.forEach((t, i) => {
      t.section.classList.add('ct-panel');
      const pager = document.createElement('div');
      pager.className = 'ct-pager';
      pager.innerHTML = pagerButton(tabs[i - 1], 'prev') + pagerButton(tabs[i + 1], 'next');
      t.section.appendChild(pager);
    });

    const inkByTab = new Map();
    let current = null;

    function show(id, opts) {
      const tab = tabs.find(t => t.id === id) || tabs[0];
      if (current === tab) return;

      const annot = window.ClassroomAnnotator;
      if (annot && annot.getStrokes) {
        if (current) inkByTab.set(current.id, annot.getStrokes());
        annot.setStrokes(inkByTab.get(tab.id) || []);
      }

      current = tab;
      tabs.forEach(t => t.section.classList.toggle('ct-hidden', t !== tab));
      nav.querySelectorAll('.nav-item').forEach(a => {
        const on = a.dataset.tab === tab.id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      // 初次載入不寫 hash：網址帶 hash 時，Chrome 會在載入完成後自動捲到該錨點
      if (opts && opts.scroll && location.hash !== '#' + tab.id) history.replaceState(null, '', '#' + tab.id);

      // 原本隱藏時量不到尺寸的元件（Canvas、MathJax）在顯示後重新排版
      window.dispatchEvent(new Event('resize'));

      if (opts && opts.scroll) {
        const navActive = nav.querySelector('.nav-item.active');
        if (navActive) navActive.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (layout.getBoundingClientRect().top < 0) layout.scrollIntoView({ block: 'start' });
      }
    }

    layout.addEventListener('click', e => {
      const a = e.target.closest('a[data-tab]');
      if (!a) return;
      e.preventDefault();
      show(a.dataset.tab, { scroll: true });
    });

    window.addEventListener('hashchange', () => show(location.hash.slice(1), { scroll: true }));

    show(location.hash.slice(1));
  }

  function pagerButton(tab, dir) {
    const isPrev = dir === 'prev';
    if (!tab) return '<span class="ct-pager-btn ct-pager-empty"></span>';
    const name = (tab.label ? tab.label + '：' : '') + tab.title;
    return `
      <a href="#${tab.id}" class="ct-pager-btn ct-pager-${dir}" data-tab="${tab.id}">
        ${isPrev ? '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>' : ''}
        <span><small>${isPrev ? '上一個' : '下一個'}</small>${name}</span>
        ${isPrev ? '' : '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>'}
      </a>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
