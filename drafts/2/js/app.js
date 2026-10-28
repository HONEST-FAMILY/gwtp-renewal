(function () {
  'use strict';
  var G = window.GW, B = G.base, esc = G.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TP = 'https://www.gwtp.or.kr/gwtp/';
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var EXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var LOUPE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3l5 5"/></svg>';

  /* 강원TP 실제 메뉴(2026-10-28 홈페이지 기준) */
  var MENU = [
    { t: '공고안내', s: '모집·계약·채용', href: '#/notices', items: [['모집공고', '#/notices'], ['공지사항', TP + 'bbsNew_list.php?code=sub01a&keyvalue=sub01'], ['계약공고', TP + 'bbsNew_list.php?code=sub01c&keyvalue=sub01'], ['채용공고', TP + 'bbsNew_list.php?code=sub01d&keyvalue=sub01'], ['타기관소식', TP + 'bbsNew_list.php?code=sub01g&keyvalue=sub01']] },
    { t: '사업안내', s: '지역·부서별 사업', href: TP + 'pageview.php?url=sub02a&keyvalue=sub02', items: [['지역사업안내', TP + 'pageview.php?url=sub02a&keyvalue=sub02'], ['부서별사업안내', TP + 'pageview.php?url=sub02b&keyvalue=sub02'], ['장비지원', TP + 'pageview.php?url=sub02c&keyvalue=sub02']] },
    { t: '입주안내', s: '시설 ' + B.places.length + '곳', href: '#/search?q=' + encodeURIComponent('입주'), items: [['입주 공고와 시설', '#/search?q=' + encodeURIComponent('입주')], ['입주안내', TP + 'pageview.php?url=sub04a&keyvalue=sub04'], ['입주기업소개', TP + 'pageview.php?url=sub04b&keyvalue=sub04'], ['시설현황', TP + 'pageview.php?url=sub04c&keyvalue=sub04']] },
    { t: '경영공시', s: '계획·재무·규정', href: TP + 'bbsNew_list.php?code=sub05b&keyvalue=sub05', items: [['운영계획 및 결과', TP + 'bbsNew_list.php?code=sub05b&keyvalue=sub05'], ['재무정보', TP + 'bbsNew_list.php?code=sub05a&keyvalue=sub05'], ['임직원현황', TP + 'bbsNew_list.php?code=sub05c&keyvalue=sub05'], ['강원TP규정', TP + 'bbsNew_list.php?code=sub05f&keyvalue=sub05'], ['회의록', TP + 'bbsNew_list.php?code=sub05d&keyvalue=sub05'], ['감사결과', TP + 'bbsNew_list.php?code=sub05e&keyvalue=sub05'], ['기부금 모금 및 실적', TP + 'bbsNew_list.php?code=sub05g&keyvalue=sub05']] },
    { t: '홍보', s: '언론보도·뉴스레터', href: TP + 'bbsNew_list.php?code=sub06b&keyvalue=sub06', items: [['TP NOW', TP + 'bbsNew_list.php?code=sub06a&keyvalue=sub06'], ['언론보도', TP + 'bbsNew_list.php?code=sub06b&keyvalue=sub06'], ['홍보자료', TP + 'bbsNew_list.php?code=sub06c&keyvalue=sub06'], ['지역정보', TP + 'bbsNew_list.php?code=sub06d&keyvalue=sub06'], ['뉴스레터', TP + 'bbsNew_list.php?code=sub06g&keyvalue=sub06'], ['뉴스레터신청', TP + 'pageview.php?url=sub06h&keyvalue=sub06']] },
    { t: 'TP소개', s: '인사말·조직·오시는 길', href: TP + 'pageview.php?url=sub07a&keyvalue=sub07', split: true, items: [['일반현황', TP + 'pageview.php?url=sub07a&keyvalue=sub07'], ['인사말', TP + 'pageview.php?url=sub07b&keyvalue=sub07'], ['비전 및 목표', TP + 'pageview.php?url=sub07c&keyvalue=sub07'], ['연혁', TP + 'pageview.php?url=sub07d&keyvalue=sub07'], ['조직안내', TP + 'pageview.php?url=sub07e&keyvalue=sub07'], ['ESG경영', TP + 'pageview.php?url=sub07f&keyvalue=sub07'], ['찾아오시는 길', TP + 'pageview.php?url=sub07g&keyvalue=sub07']] }
  ];

  /* 분야 카드 사진: 강원TP 보도자료 사진(2026) + 수소는 삼척 에너지방재지원센터 시설 사진 */
  var SECTOR_IMG = {
    '모빌리티': ['img/mobility.jpg', '완전정밀분해 기반 미래차 부품 재제조 지원 사업 착수 단체 사진', '50% 50%'],
    '수소·에너지': ['../assets-shared/img/sc-energy.jpg', '삼척 에너지방재지원센터 건물', '50% 50%'],
    '바이오': ['img/bio.jpg', '2026년 지역 바이오 인프라 확산 세미나 참석자', '50% 40%'],
    '반도체': ['img/semi.jpg', '한국반도체교육원 앞 반도체 진로 특강 참가 학생', '42% 50%'],
    '디지털헬스·의료기기': ['img/health.jpg', 'AI 기반 백신 이상반응 돌봄케어 서비스 개발·실증 업무협약식', '50% 55%'],
    'ICT·데이터': ['img/data.jpg', '개인정보 보호와 데이터 활용을 위한 합성데이터 실무교육', '45% 50%'],
    '정보보호': ['img/security.jpg', '찾아가는 개인정보 안전지킴이 교육 현장', '50% 50%']
  };
  var NEWS_URL = {
    '3643': 'aWR4PTM2NDMmc3RhcnRQYWdlPTAmbGlzdE5vPTE4OSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    '3642': 'aWR4PTM2NDImc3RhcnRQYWdlPTAmbGlzdE5vPTE4OCZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    '3627': 'aWR4PTM2Mjcmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NyZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    '3601': 'aWR4PTM2MDEmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NiZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    '3600': 'aWR4PTM2MDAmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0='
  };
  var NEWS_IDX = ['3643', '3642', '3627', '3601', '3600'];
  var EV_LABEL = { target: '대상', regions: '지역', amount: '지원 금액', apply_end: '접수 기간', how: '신청 방법', contact: '문의' };

  function ext(href) { return /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''; }
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2600); }

  /* ---------- 메뉴 ---------- */
  function buildMenus() {
    $('#gnb').innerHTML = MENU.map(function (m, i) {
      return '<li class="' + (m.split ? 'split' : '') + '" data-i="' + i + '"><a class="top" href="' + esc(m.href) + '"' + ext(m.href) + '>' + esc(m.t) + '<small>' + esc(m.s) + '</small></a></li>';
    }).join('');
    var cols = MENU.map(function (m) {
      return '<div><h3>' + esc(m.t) + '</h3><ul>' + m.items.map(function (it) { return '<li><a href="' + esc(it[1]) + '"' + ext(it[1]) + '>' + esc(it[0]) + '</a></li>'; }).join('') + '</ul></div>';
    }).join('');
    $('#megaIn').innerHTML = cols;
    $('#drawerBody').innerHTML = MENU.map(function (m) {
      return '<section><h3><a href="' + esc(m.href) + '"' + ext(m.href) + '>' + esc(m.t) + '</a></h3><ul>' + m.items.map(function (it) { return '<li><a href="' + esc(it[1]) + '"' + ext(it[1]) + '>' + esc(it[0]) + '</a></li>'; }).join('') + '</ul></section>';
    }).join('');
    var hd = $('#hd'), mega = $('#mega'), tm;
    function openMega() { clearTimeout(tm); mega.hidden = false; }
    function closeMega() { tm = setTimeout(function () { mega.hidden = true; }, 120); }
    $('.gnb').addEventListener('mouseenter', openMega);
    $('.gnb').addEventListener('focusin', openMega);
    mega.addEventListener('mouseenter', openMega);
    hd.addEventListener('mouseleave', closeMega);
    hd.addEventListener('focusout', function (e) { if (!hd.contains(e.relatedTarget)) closeMega(); });
    mega.addEventListener('click', function (e) { if (e.target.closest('a')) mega.hidden = true; });
    var drawer = $('#drawer'), mb = $('#menuBtn');
    mb.addEventListener('click', function () { drawer.hidden = false; mb.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $('#drawerClose').focus(); });
    function closeDrawer() { drawer.hidden = true; mb.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
    $('#drawerClose').addEventListener('click', closeDrawer);
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) closeDrawer(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); mega.hidden = true; } });
    $('#toolSearch').addEventListener('click', function () {
      if (isHome()) { window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); $('#heroQ').focus({ preventScroll: true }); }
      else location.hash = '#/search';
    });
  }

  /* ---------- 숫자 세기 ---------- */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (RM || !to || !window.requestAnimationFrame) { el.textContent = to; return; }
    var t0 = null, dur = 650;
    el.textContent = '0';
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function countIn(root) {
    var els = $$('[data-count]', root);
    if (!('IntersectionObserver' in window)) { els.forEach(countUp); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); countUp(e.target); } }); }, { threshold: .4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 공고 표시 공통 ---------- */
  function shortDue(n) {
    var st = G.status(n);
    if (st === 'always') return '상시 모집';
    if (st === 'unknown') return '마감일 공고문 확인';
    if (!n.apply_end) return '';
    return G.fmtShort(n.apply_end) + '(' + G.weekday(n.apply_end) + ')' + (st === 'closed' ? ' 마감됨' : ' 마감');
  }
  function regionText(n) {
    var r = (n.regions || []).filter(function (x) { return x !== '도외 가능'; });
    return r.length ? r.join('·') : '';
  }
  function ncard(n) {
    var b = G.badge(n), past = !!n.list_only;
    var tags = '<span class="badge ' + b.cls + '">' + esc(b.text) + '</span>' +
      (n.sectors || []).filter(function (s) { return s !== '전 분야'; }).map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join('') +
      (n.types || []).slice(0, 2).map(function (s) { return '<span class="tag t">' + esc(s) + '</span>'; }).join('');
    var due = past ? ('게시 ' + esc(n.posted || '')) : (n.apply_end ? '마감일 ' + esc(n.apply_end.replace(/-/g, '.')) : '');
    var meta = [];
    if (n.amount) meta.push('<b>' + esc(n.amount) + '</b>');
    var rg = regionText(n); if (rg) meta.push(esc(rg));
    if (n.dept) meta.push(esc(n.dept));
    return '<a class="ncard' + (past ? ' past' : '') + '" data-key="' + esc(n.idx) + '" href="#/notice/' + esc(n.idx) + '">' +
      '<div class="top"><div class="tags">' + tags + '</div>' + (due ? '<span class="due">' + due + '</span>' : '') + '</div>' +
      '<h3>' + esc(past ? n.title : (n.short || n.title)) + '</h3>' +
      (past ? '' : '<p class="orig">' + esc(n.title) + '</p>') +
      (meta.length ? '<p class="meta">' + meta.join(' · ') + '</p>' : '') + '</a>';
  }
  function displayOrder(list) {
    function rank(n) { var s = G.status(n); return s === 'open' ? G.dday(n) : (s === 'always' ? 5000 : 6000); }
    return list.slice().sort(function (a, b) { return rank(a) - rank(b) || (b.posted || '').localeCompare(a.posted || ''); });
  }

  /* ---------- 처음 화면 ---------- */
  function buildHome() {
    var counts = G.sectorCounts();
    $('#typeRow').innerHTML = B.sectors.map(function (s) {
      var im = SECTOR_IMG[s] || ['../assets-shared/img/cc-hq.jpg', '', '50% 50%'];
      return '<a class="tcard" href="#/notices?s=' + encodeURIComponent(s) + '"><figure><img src="' + im[0] + '" alt="' + esc(im[1]) + '" loading="lazy" style="object-position:' + im[2] + '"></figure>' +
        '<h3>' + esc(s) + '</h3><p>지금 모집 <b data-count="' + counts[s] + '">' + counts[s] + '</b>건</p></a>';
    }).join('');
    var live = displayOrder(G.live());
    $('#liveCount').setAttribute('data-count', live.length);
    $('#liveCount').textContent = live.length;
    $('#bandRow').innerHTML = live.slice(0, 5).map(function (n, i) {
      var st = G.status(n), d = G.dday(n);
      var k = (st === 'open' && d <= 7) ? 'k1' : ['k2', 'k3', 'k4', 'k5', 'k5'][Math.min(i, 4)];
      var big = st === 'open' ? 'D-' + d : (st === 'always' ? '상시' : '확인');
      return '<a class="bcard ' + k + '" href="#/notice/' + esc(n.idx) + '"><span class="due">' + esc(shortDue(n)) + '</span><h3>' + esc(n.short || n.title) + '</h3>' +
        '<div class="foot"><span class="go">' + ARROW + '</span><span class="big" aria-hidden="true">' + esc(big) + '</span></div></a>';
    }).join('');
    var rec = Object.keys(G.recruitingPlaces());
    var cities = Object.keys(G.placesByCity()).map(function (c) { return c.replace(/(시|군)$/, ''); });
    $('#lightP').textContent = cities.join('·') + '에 있는 강원TP 시설 ' + B.places.length + '곳의 주소와 면적, 쓰임을 한곳에서 봅니다.' + (rec.length ? ' 지금 입주 공고가 올라와 있는 곳은 아래 ' + rec.length + '곳입니다.' : '');
    if (rec.length) {
      var box = document.createElement('div'); box.className = 'places';
      box.innerHTML = rec.map(function (p) { var n = G.recruitingPlaces()[p]; return '<a href="#/notice/' + esc(n.idx) + '">' + esc(p) + '</a>'; }).join('');
      $('#lightP').after(box);
    }
    $('#newsList').innerHTML = B.news.map(function (n, i) {
      var id = NEWS_IDX[i], href = id && NEWS_URL[id] ? TP + 'bbsNew_view.php?bbs_data=' + NEWS_URL[id] + '||' : B.newsUrl;
      return '<li><a href="' + esc(href) + '" target="_blank" rel="noopener"><time datetime="' + esc(n.date) + '">' + esc(n.date.replace(/-/g, '.')) + '</time><span>' + esc(n.title) + '</span></a></li>';
    }).join('');
    var GROUP = { '입주': '입주 기업', '장비': '장비', '지원사업': '지원사업', '정보': '지역 정보', '분야': '분야 센터' };
    $('#sysList').innerHTML = B.systems.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener"><span><small>' + esc(GROUP[s.group] || s.group) + '</small><b>' + esc(s.name) + '</b></span>' + EXT + '</a></li>';
    }).join('');
    $$('[data-scroll]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = document.getElementById(btn.getAttribute('data-scroll'));
        var card = row.firstElementChild; var w = card ? card.getBoundingClientRect().width + 15 : 215;
        row.scrollBy({ left: +btn.getAttribute('data-dir') * w * 2, behavior: RM ? 'auto' : 'smooth' });
      });
    });
    wireSearch($('#heroSearch'));
    countIn($('#home'));
  }
  function fitPlaceholder(inp) {
    if (!inp) return;
    inp.placeholder = inp.clientWidth && inp.clientWidth < 330 ? '무엇을 찾으세요? (예: 장비, 입주)' : '무엇을 찾으세요? (예: 장비, 입주, 수소, 교육)';
  }
  function wireSearch(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = (form.querySelector('input').value || '').trim();
      location.hash = '#/search' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  /* ---------- 라우팅 ---------- */
  function parse() {
    var h = location.hash.replace(/^#/, '') || '/';
    var qi = h.indexOf('?');
    return { path: qi > -1 ? h.slice(0, qi) : h, params: new URLSearchParams(qi > -1 ? h.slice(qi + 1) : '') };
  }
  function isHome() { var p = parse().path; return p === '/' || p === ''; }
  function setNav(i) { $$('#gnb li').forEach(function (li) { li.classList.toggle('on', li.getAttribute('data-i') === String(i)); }); }
  function show(page) {
    $('#home').hidden = page !== 'home';
    $('#page').hidden = page === 'home';
    $('#mega').hidden = true;
  }
  var lastPath = null;
  function route() {
    if (location.hash && location.hash.indexOf('#/') !== 0) return;
    var r = parse();
    var changed = r.path !== lastPath; lastPath = r.path;
    if (r.path === '/' || r.path === '') { show('home'); setNav(-1); document.title = '강원테크노파크 — 지금 신청할 수 있는 지원 찾기'; if (window.__sceneLayout) setTimeout(window.__sceneLayout, 0); }
    else if (r.path === '/search') { show('page'); setNav(-1); renderSearch(r.params.get('q') || ''); }
    else if (r.path === '/notices') { show('page'); setNav(0); renderList(r.params); }
    else if (/^\/notice\/\d+$/.test(r.path)) { show('page'); setNav(0); renderDetail(r.path.split('/')[2]); }
    else { show('home'); }
    if (changed || r.path === '/search') window.scrollTo(0, 0);
  }

  function crumb(items) {
    return '<nav class="crumb" aria-label="현재 위치"><a href="#/">처음</a>' + items.map(function (it) { return '<span aria-hidden="true">›</span>' + (it[1] ? '<a href="' + it[1] + '">' + esc(it[0]) + '</a>' : '<span>' + esc(it[0]) + '</span>'); }).join('') + '</nav>';
  }
  function searchForm(q) {
    return '<form class="sbox" role="search" action="#/search"><label class="sr" for="pgQ">무엇을 찾으세요?</label><input id="pgQ" type="search" autocomplete="off" value="' + esc(q) + '" placeholder="무엇을 찾으세요? (예: 장비, 입주, 수소, 교육)"><button type="submit" aria-label="찾기">' + LOUPE + '</button></form>';
  }
  var SUGGEST = ['장비', '입주', '수소', '교육', '반도체', '보안', '투자'];

  /* ---------- 검색 결과 ---------- */
  function renderSearch(q) {
    var res = G.search(q);
    var live = res.notices.filter(function (n) { return G.status(n) !== 'closed'; });
    var closed = res.notices.filter(function (n) { return G.status(n) === 'closed'; });
    var rec = G.recruitingPlaces();
    var h = '<div class="wrap"><div class="pg-hd">' + crumb([['검색', '']]) +
      '<h1 class="pg-h">' + (q ? '‘' + esc(q) + '’ 찾은 결과' : '무엇을 찾으세요?') + '</h1>' + searchForm(q) +
      '<div class="chips"><span class="lbl">많이 찾는 말</span>' + SUGGEST.map(function (s) { return '<a class="chip" href="#/search?q=' + encodeURIComponent(s) + '">' + esc(s) + '</a>'; }).join('') + '</div>';
    if (q) h += '<p class="sr-sum">지금 신청할 수 있는 공고 <b>' + live.length + '건</b> · 시설 <b>' + res.places.length + '곳</b> · 관련 사이트 <b>' + res.systems.length + '곳</b></p>';
    h += '</div>';
    if (q) {
      h += '<section class="sr-sec"><h2>지금 신청할 수 있는 공고<small>마감 가까운 순</small></h2>';
      h += live.length ? '<div class="nlist">' + live.map(ncard).join('') + '</div>' : '<p class="empty">지금 모집 중인 공고에는 ‘' + esc(q) + '’이(가) 없습니다. <a href="#/notices">전체 공고를 분야·지역으로 거르기</a></p>';
      if (closed.length) h += '<details class="closed-more"><summary>마감된 공고 ' + closed.length + '건도 보기</summary><div class="nlist">' + closed.map(ncard).join('') + '</div></details>';
      h += '</section>';
      if (res.places.length) {
        h += '<section class="sr-sec"><h2>강원TP 시설<small>' + res.places.length + '곳</small></h2><div class="places">' + res.places.map(function (p) {
          var n = rec[p.name];
          var fig = p.img ? '<figure><img src="../assets-shared/img/' + esc(p.img) + '.jpg" alt="' + esc(p.name) + ' 건물" loading="lazy"></figure>' : '<figure class="nophoto">' + G.cityShape(p.city) + '</figure>';
          return '<article class="place">' + fig + '<div class="pb"><h3>' + esc(p.name) + '</h3><dl><dt>위치</dt><dd>' + esc(p.addr) + '</dd><dt>면적</dt><dd>' + esc(p.area) + '</dd>' + (p.scale ? '<dt>규모</dt><dd>' + esc(p.scale) + '</dd>' : '') + '<dt>쓰임</dt><dd>' + esc(p.use) + '</dd></dl>' +
            (n ? '<div class="rec"><a class="chip" href="#/notice/' + esc(n.idx) + '">입주 공고 보기 · ' + esc(G.badge(n).text) + '</a></div>' : '') + '</div></article>';
        }).join('') + '</div></section>';
      }
      if (res.systems.length) {
        h += '<section class="sr-sec"><h2>관련 사이트<small>' + res.systems.length + '곳</small></h2><div class="sites">' + res.systems.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener"><span>' + esc(s.name) + '</span><small>새 창</small></a>'; }).join('') + '</div></section>';
      }
    } else {
      h += '<section class="sr-sec"><h2>지금 신청할 수 있는 공고<small>' + G.live().length + '건</small></h2><div class="nlist">' + displayOrder(G.live()).map(ncard).join('') + '</div></section>';
    }
    h += '</div>';
    $('#page').innerHTML = h;
    document.title = (q ? '‘' + q + '’ 찾은 결과' : '검색') + ' — 강원테크노파크';
    var f = $('#page form.sbox'); wireSearch(f); fitPlaceholder($('#pgQ'));
    if (!q) $('#pgQ').focus({ preventScroll: true });
  }

  /* ---------- 공고 찾기(거르기 목록) ---------- */
  var LS = null;
  function readState(p) {
    return { q: p.get('q') || '', r: p.get('r') || '', s: p.get('s') || '', t: (p.get('t') || '').split(',').filter(Boolean), st: p.get('st') || 'live' };
  }
  function stateHash(s) {
    var p = new URLSearchParams();
    if (s.q) p.set('q', s.q); if (s.r) p.set('r', s.r); if (s.s) p.set('s', s.s); if (s.t.length) p.set('t', s.t.join(',')); if (s.st !== 'live') p.set('st', s.st);
    var str = p.toString(); return '#/notices' + (str ? '?' + str : '');
  }
  function compute(s) {
    var f = G.find({ r: s.r, s: s.s, t: s.t });
    var pool = s.q ? G.search(s.q).notices : null;
    function txt(n) { return !pool || pool.indexOf(n) > -1; }
    var past = (s.r || s.s) ? [] : G.all.filter(function (n) { return n.list_only && G.typeOK(n, s.t); });
    return {
      hit: displayOrder(f.hit.filter(txt)),
      near: displayOrder(f.near.filter(txt)),
      closed: f.closed.concat(past).filter(txt).sort(G.byPosted)
    };
  }
  function renderList(params) {
    var s = readState(params);
    var counts = G.sectorCounts();
    var wide = window.matchMedia && matchMedia('(min-width: 980px)').matches;
    var op = function (on) { return (wide || on) ? ' open' : ''; };
    var h = '<div class="wrap"><div class="pg-hd">' + crumb([['공고안내', '#/notices'], ['모집공고', '']]) +
      '<h1 class="pg-h">지금 신청할 수 있는 공고</h1><p class="pg-lead">회사 위치·분야·필요한 도움을 고르면 맞는 공고만 마감 가까운 순으로 남습니다.</p></div>' +
      '<div class="lst"><div><button class="flt-toggle" type="button" aria-expanded="false" aria-controls="flt">조건으로 거르기 <span id="fltN"></span>' + CHEV + '</button>' +
      '<form class="flt" id="flt" onsubmit="return false">' +
      '<label class="flt-lbl" for="fq">공고 안에서 찾기</label><div class="fq"><input id="fq" type="search" value="' + esc(s.q) + '" placeholder="예: 시제품, 교육"><button type="button" id="fqBtn" aria-label="찾기">' + LOUPE + '</button></div>' +
      '<details class="fs"' + op(s.r) + '><summary>회사 위치<span class="cnt" data-c="r" hidden></span>' + CHEV + '</summary><div class="opts"><select id="fr" aria-label="회사 위치"><option value="">강원 어디든</option>' + B.regions.map(function (r) { return '<option' + (s.r === r ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join('') + '<option' + (s.r === '강원 밖' ? ' selected' : '') + '>강원 밖</option></select></div></details>' +
      '<details class="fs"' + op(s.s) + '><summary>분야<span class="cnt" data-c="s" hidden></span>' + CHEV + '</summary><div class="opts">' +
      '<label><input type="radio" name="fs" value=""' + (!s.s ? ' checked' : '') + '>전체 분야</label>' +
      B.sectors.map(function (x) { return '<label><input type="radio" name="fs" value="' + esc(x) + '"' + (s.s === x ? ' checked' : '') + '>' + esc(x) + '<small>' + counts[x] + '</small></label>'; }).join('') + '</div></details>' +
      '<details class="fs"' + op(s.t.length) + '><summary>필요한 도움<span class="cnt" data-c="t" hidden></span>' + CHEV + '</summary><div class="opts">' +
      B.types.map(function (x) { return '<label><input type="checkbox" name="ft" value="' + esc(x) + '"' + (s.t.indexOf(x) > -1 ? ' checked' : '') + '>' + esc(x) + '</label>'; }).join('') + '</div></details>' +
      '<button class="reset" type="button" id="freset">조건 모두 지우기</button><button class="flt-done" type="button" id="fltDone"><span>결과 <b id="fltDoneN">0</b>건 보기</span></button></form></div>' +
      '<div><div class="res-hd"><p class="res-count" id="rcount"></p><div class="seg" role="group" aria-label="모집 상태" id="seg"></div></div>' +
      '<div class="active" id="activeChips"></div><div class="nlist" id="nl"></div><div id="genBox"></div><div id="nearBox"></div></div></div></div>';
    $('#page').innerHTML = h;
    document.title = '지금 신청할 수 있는 공고 — 강원테크노파크';
    LS = s;
    var form = $('#flt');
    $('.flt-toggle').addEventListener('click', function () { var o = form.classList.toggle('open'); this.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    form.addEventListener('change', function (e) { if (e.target.id === 'fq') return; readForm(); });
    $('#fq').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); readForm(); } });
    $('#fq').addEventListener('search', readForm);
    $('#fqBtn').addEventListener('click', readForm);
    $('#fltDone').addEventListener('click', function () {
      form.classList.remove('open'); $('.flt-toggle').setAttribute('aria-expanded', 'false');
      var y = $('.res-hd').getBoundingClientRect().top + window.scrollY - 12; window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
    });
    $('#freset').addEventListener('click', function () { LS = { q: '', r: '', s: '', t: [], st: LS.st }; syncForm(); update(); });
    $('#activeChips').addEventListener('click', function (e) {
      var c = e.target.closest('[data-rm]'); if (!c) return;
      var k = c.getAttribute('data-rm'), v = c.getAttribute('data-v');
      if (k === 't') LS.t = LS.t.filter(function (x) { return x !== v; }); else LS[k] = '';
      syncForm(); update();
    });
    update(true);
  }
  function readForm() {
    LS.q = ($('#fq').value || '').trim();
    LS.r = $('#fr').value;
    var sr = $('input[name=fs]:checked'); LS.s = sr ? sr.value : '';
    LS.t = $$('input[name=ft]:checked').map(function (i) { return i.value; });
    update();
  }
  function syncForm() {
    $('#fq').value = LS.q; $('#fr').value = LS.r;
    $$('input[name=fs]').forEach(function (i) { i.checked = i.value === LS.s; });
    $$('input[name=ft]').forEach(function (i) { i.checked = LS.t.indexOf(i.value) > -1; });
  }
  function update(first) {
    var s = LS, R = compute(s);
    history.replaceState(null, '', stateHash(s));
    var total = R.hit.length + R.closed.length;
    var spec = R.hit, general = [];
    if (s.s) { spec = R.hit.filter(function (n) { return (n.sectors || []).indexOf(s.s) > -1; }); general = R.hit.filter(function (n) { return spec.indexOf(n) < 0; }); }
    var list = s.st === 'closed' ? R.closed : (s.st === 'all' ? spec.concat(R.closed) : spec);
    $('#rcount').innerHTML = '전체 <span data-count="' + total + '">' + total + '</span>건 · 진행중 <b data-count="' + R.hit.length + '">' + R.hit.length + '</b>건' +
      (s.s && general.length ? ' <span class="all">(' + esc(s.s) + ' ' + spec.length + ' · 전 분야 ' + general.length + ')</span>' : '');
    $('#seg').innerHTML = [['live', '진행중', R.hit.length], ['closed', '마감', R.closed.length], ['all', '전체', total]].map(function (b) {
      return '<button type="button" data-st="' + b[0] + '" aria-pressed="' + (s.st === b[0]) + '">' + b[1] + ' ' + b[2] + '</button>';
    }).join('');
    $$('#seg button').forEach(function (b) { b.addEventListener('click', function () { LS.st = b.getAttribute('data-st'); update(); }); });
    var chips = [];
    if (s.q) chips.push(['q', s.q, '‘' + s.q + '’']);
    if (s.r) chips.push(['r', s.r, s.r]);
    if (s.s) chips.push(['s', s.s, s.s]);
    s.t.forEach(function (t) { chips.push(['t', t, t]); });
    $('#activeChips').innerHTML = chips.map(function (c) { return '<button type="button" class="chip x" data-rm="' + c[0] + '" data-v="' + esc(c[1]) + '" aria-label="' + esc(c[2]) + ' 조건 빼기">' + esc(c[2]) + '</button>'; }).join('');
    var nf = (s.r ? 1 : 0) + (s.s ? 1 : 0) + s.t.length + (s.q ? 1 : 0);
    $('#fltN').textContent = nf ? '(' + nf + ')' : '';
    var cR = $('[data-c=r]'), cS = $('[data-c=s]'), cT = $('[data-c=t]');
    cR.hidden = !s.r; cR.textContent = '1'; cS.hidden = !s.s; cS.textContent = '1'; cT.hidden = !s.t.length; cT.textContent = s.t.length;
    $('#fltDoneN').textContent = s.st === 'closed' ? R.closed.length : R.hit.length;
    flip($('#nl'), list);
    if (!list.length) $('#nl').innerHTML = '<p class="empty">' + (s.st === 'closed' ? '조건에 맞는 마감 공고가 없습니다.' : (general.length ? esc(s.s) + ' 분야만을 위한 진행중 공고는 없습니다. 아래 모든 분야 공고를 보세요.' : '조건에 딱 맞는 진행중 공고가 없습니다. 조건을 하나씩 빼 보세요.')) + '</p>';
    var gb = $('#genBox');
    if (s.st !== 'closed' && general.length) {
      if (!$('#genL')) gb.innerHTML = '<p class="near-hd" id="genH"></p><div class="nlist" id="genL"></div>';
      $('#genH').innerHTML = '모든 분야가 신청할 수 있는 공고 ' + general.length + '건<small>공고에 분야 제한이 없어 함께 보여 드립니다.</small>';
      flip($('#genL'), general);
    } else gb.innerHTML = '';
    var nb = $('#nearBox');
    if (s.st !== 'closed' && R.near.length && (s.s || s.t.length)) {
      if (!$('#nearL')) nb.innerHTML = '<p class="near-hd" id="nearH"></p><div class="nlist" id="nearL"></div>';
      $('#nearH').innerHTML = '조건 일부만 맞는 진행중 공고 ' + R.near.length + '건<small>분야나 필요한 도움 중 하나만 맞습니다.</small>';
      flip($('#nearL'), R.near);
    } else nb.innerHTML = '';
    if (!first) countIn($('#rcount')); else countIn($('#page'));
  }
  /* 거를 때 남은 카드가 제자리로 미끄러지며 목록이 줄어든다(FLIP) */
  function flip(box, list) {
    var first = {}, used = {};
    $$('[data-key]', box).forEach(function (el) { first[el.getAttribute('data-key')] = { el: el, top: el.getBoundingClientRect().top }; });
    var emp = $('.empty', box); if (emp) emp.remove();
    var tmp = document.createElement('div');
    var els = list.map(function (n) {
      var o = first[n.idx];
      if (o) { used[n.idx] = 1; return o.el; }
      tmp.innerHTML = ncard(n); var el = tmp.firstElementChild; el.__new = true; return el;
    });
    Object.keys(first).forEach(function (k) { if (!used[k]) first[k].el.remove(); });
    els.forEach(function (el) { box.appendChild(el); });
    if (RM || !box.animate) { els.forEach(function (el) { el.__new = false; }); return; }
    els.forEach(function (el, i) {
      var k = el.getAttribute('data-key');
      if (el.__new) {
        el.__new = false;
        el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: Math.min(i, 8) * 30, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
      } else if (first[k]) {
        var dy = first[k].top - el.getBoundingClientRect().top;
        if (Math.abs(dy) > 1) el.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
  }

  /* ---------- 공고 한 장 요약 ---------- */
  function cell(no, k, v, cls) {
    return '<div class="cell"><p class="k"><i>' + no + '</i>' + k + '</p><div class="v' + (cls ? ' ' + cls : '') + '">' + v + '</div></div>';
  }
  function renderDetail(idx) {
    var n = G.byId(idx);
    if (!n) { $('#page').innerHTML = '<div class="wrap"><div class="pg-hd">' + crumb([['공고', '#/notices']]) + '<h1 class="pg-h">공고를 찾지 못했습니다</h1><p class="pg-lead"><a href="#/notices">공고 목록으로</a></p></div></div>'; return; }
    var b = G.badge(n), st = G.status(n);
    var h = '<div class="wrap"><div class="pg-hd">' + crumb([['공고안내', '#/notices'], ['모집공고', '#/notices'], [n.no || ('게시물 ' + n.idx), '']]);
    var tags = '<span class="badge ' + b.cls + '">' + esc(b.text) + '</span>' + (n.sectors || []).map(function (x) { return '<span class="tag">' + esc(x) + '</span>'; }).join('') + (n.types || []).map(function (x) { return '<span class="tag t">' + esc(x) + '</span>'; }).join('');
    h += '<div class="tags dt-tags">' + tags + '</div>';
    if (n.list_only) {
      h += '<h1 class="pg-h">' + esc(n.title) + '</h1><p class="dt-meta">' + esc([n.no, n.dept, n.posted ? '게시 ' + n.posted : ''].filter(Boolean).join(' · ')) + '</p>' +
        '<p class="pg-lead">접수가 끝난 공고입니다. 공고문과 결과는 강원TP 게시물에서 볼 수 있습니다.</p>' +
        '<div class="acts"><a class="btn pri" href="' + esc(n.url) + '" target="_blank" rel="noopener">' + EXT + '공고 원문 보기</a><a class="btn" href="#/notices">진행중 공고 보기</a></div></div></div>';
      $('#page').innerHTML = h; document.title = n.title + ' — 강원테크노파크'; return;
    }
    var tel = G.tel(n.contact);
    h += '<h1 class="pg-h">' + esc(n.short || n.title) + '</h1><p class="dt-orig">' + esc(n.title) + '</p><p class="dt-meta">' + esc([n.no, n.dept, n.posted ? '게시 ' + n.posted : ''].filter(Boolean).join(' · ')) + '</p>';
    h += '<div class="acts">' +
      (tel ? '<a class="btn pri" href="tel:' + tel + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>담당자에게 전화 ' + tel + '</a>'
        : '<a class="btn pri" href="tel:' + B.phone + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>대표전화 ' + B.phone + '</a>') +
      (n.apply_end && st !== 'closed' ? '<button class="btn" type="button" id="icsBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4"/></svg>마감일 달력에 넣기</button>'
        : '<button class="btn" type="button" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>' + (st === 'closed' ? '마감된 공고' : '마감일 없음 · ' + esc(b.text)) + '</button>') +
      '<a class="btn" href="' + esc(n.url) + '" target="_blank" rel="noopener">' + EXT + '공고 원문·첨부</a>' +
      '<button class="btn" type="button" id="shareBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/></svg>링크 보내기</button></div></div>';

    var none = function (t) { return '<span class="none">' + (t || '공고문에서 확인') + '</span>'; };
    var when = esc(G.deadlineText(n)) + (n.apply_start ? '<small>접수 시작 ' + esc(G.fmtDate(n.apply_start)) + '</small>' : '') + (n.apply_note && n.apply_end ? '<small>' + esc(n.apply_note) + '</small>' : '');
    var who = n.contact ? esc(n.contact).replace(/(0\d{1,2}-\d{3,4}-\d{4})/, '<a href="tel:$1">$1</a>') : none();
    h += '<section class="sheet" aria-labelledby="sheetH"><div class="sheet-h"><h2 id="sheetH">한 장 요약</h2><p>공고문(' + esc((n.attach_formats || ['HWP']).join('·')) + ')을 열지 않고 핵심만 봅니다</p></div><div class="grid6">' +
      cell('01', '누가', n.target ? esc(n.target) : none()) +
      cell('02', '무엇을', n.benefit ? esc(n.benefit) : none()) +
      cell('03', '얼마나', n.amount ? esc(n.amount) + (n.amount_detail ? '<small>' + esc(n.amount_detail) + '</small>' : '') : none('금액 표기 없음 · 공고문 확인'), n.amount ? 'big' : '') +
      cell('04', '언제까지', when, 'big') +
      cell('05', '어떻게', n.how ? esc(n.how) : none()) +
      cell('06', '누구에게', who) + '</div></section>';

    var ds = G.docsState(n), docs = n.docs || [];
    h += '<div class="two"><section aria-labelledby="docsH"><h2 class="box-h" id="docsH">제출 서류 체크<small id="docsN"></small></h2>' +
      (docs.length ? '<div class="prog" aria-hidden="true"><i id="docsBar"></i></div><div class="docs">' + docs.map(function (d, i) { return '<label><input type="checkbox" data-i="' + i + '"' + (ds.get(i) ? ' checked' : '') + '><span>' + esc(d) + '</span></label>'; }).join('') + '</div>' : '<p class="empty">제출 서류는 공고문에서 확인하세요.</p>') +
      '</section><section aria-labelledby="evH"><h2 class="box-h" id="evH">공고문에서 옮긴 문장</h2><ul class="quotes">' +
      Object.keys(n.evidence || {}).map(function (k) { return '<li><b>' + esc(EV_LABEL[k] || k) + '</b><q>' + esc(n.evidence[k]) + '</q></li>'; }).join('') + '</ul>' +
      ((n.files || []).length ? '<h2 class="box-h" style="margin-top:28px">첨부 파일<small>원문 게시물에서 받기</small></h2><ul class="files">' + n.files.map(function (f) { return '<li><a href="' + esc(n.url) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>' + esc(f) + '</a></li>'; }).join('') + '</ul>' : '') +
      '</section></div>';

    var rel = displayOrder(G.live().filter(function (x) { return x !== n && (x.sectors || []).some(function (s) { return s !== '전 분야' && (n.sectors || []).indexOf(s) > -1; }); })).slice(0, 3);
    if (rel.length) h += '<section class="rel"><h2 class="box-h">같은 분야에서 지금 모집 중</h2><div class="nlist">' + rel.map(ncard).join('') + '</div></section>';
    h += '</div>';
    $('#page').innerHTML = h;
    document.title = (n.short || n.title) + ' — 한 장 요약 · 강원테크노파크';
    function paintDocs() { var c = ds.count(); var nEl = $('#docsN'); if (nEl) nEl.textContent = docs.length ? c + ' / ' + docs.length + ' 준비' : ''; var bar = $('#docsBar'); if (bar) bar.style.width = (docs.length ? c / docs.length * 100 : 0) + '%'; }
    paintDocs();
    $$('.docs input').forEach(function (cb) { cb.addEventListener('change', function () { ds.set(+cb.getAttribute('data-i'), cb.checked); paintDocs(); }); });
    var ib = $('#icsBtn'); if (ib) ib.addEventListener('click', function () { G.icsDownload(n, toast); });
    $('#shareBtn').addEventListener('click', function () { G.share((n.short || n.title) + ' — 강원테크노파크', location.href, toast); });
  }

  /* ---------- 킥 1: 제목 속 굴러가는 단어 ---------- */
  var WORDS = ['장비', '입주 공간', '수소', '교육', '투자', '테스트'];
  function josa(w) { var c = w.charCodeAt(w.length - 1); if (c < 0xAC00 || c > 0xD7A3) return '를'; return ((c - 0xAC00) % 28) ? '을' : '를'; }
  function liveHits(w) { return G.search(w).notices.filter(function (n) { return G.status(n) !== 'closed'; }).length; }
  function textW(slot, text) {
    var m = document.createElement('span'); m.className = 'cur'; m.textContent = text;
    m.style.cssText = 'position:absolute;visibility:hidden;left:0;top:0';
    slot.appendChild(m); var w = m.getBoundingClientRect().width; m.remove(); return Math.ceil(w) + 1;
  }
  function slotTo(slot, text, anim) {
    var cur = slot.querySelector('.cur:not(.out)');
    var w = textW(slot, text);
    if (!cur) { cur = document.createElement('span'); cur.className = 'cur'; slot.appendChild(cur); }
    if (cur.textContent === text) { slot.style.width = w + 'px'; return; }
    if (!anim || RM || !cur.animate) { cur.textContent = text; slot.style.width = w + 'px'; return; }
    var nx = document.createElement('span'); nx.className = 'cur nxt'; nx.textContent = text; slot.appendChild(nx);
    cur.classList.add('out');
    var o = { duration: 560, easing: 'cubic-bezier(.2,.75,.2,1)' };
    cur.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-105%)' }], o).onfinish = function () { cur.remove(); };
    nx.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], o).onfinish = function () { nx.classList.remove('nxt'); };
    slot.style.width = w + 'px';
  }
  function initRoll() {
    var H = $('#rollH'); if (!H) return;
    var sW = $('#rollWord'), sJ = $('#rollJosa'), sN = $('#rollNum'), w2 = $('#rollWord2'), st = $('#rollStat'), q = $('#heroQ'), btn = $('#rollBtn');
    var counts = WORDS.map(liveHits);
    var i = 0, hover = false, inView = true;
    function apply(anim) {
      var w = WORDS[i];
      slotTo(sW, w, anim); slotTo(sJ, josa(w), anim); slotTo(sN, String(counts[i]), anim);
      w2.textContent = w; st.href = '#/search?q=' + encodeURIComponent(w);
      st.setAttribute('aria-label', '‘' + w + '’ 지금 신청 가능 ' + counts[i] + '건 보기');
      btn.setAttribute('aria-label', '‘' + w + '’ 검색 결과 보기');
      if (q && !q.value) q.placeholder = '무엇을 찾으세요? (예: ' + w + ')';
    }
    function fit() {
      [sW, sJ, sN].forEach(function (s) { var c = s.querySelector('.cur:not(.out)'); if (c) s.style.width = textW(s, c.textContent) + 'px'; });
      H.style.minWidth = '';
      if (window.innerWidth < 600) return;
      var a = $('.ln.a', H), mx = 0;
      WORDS.forEach(function (w) { mx = Math.max(mx, textW(sW, w) + textW(sJ, josa(w))); });
      var tw = a.getBoundingClientRect().width + (parseFloat(getComputedStyle(a).marginRight) || 0) + mx + 4;
      H.style.minWidth = Math.min(H.parentElement.clientWidth, Math.ceil(tw)) + 'px';
    }
    apply(false); fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    btn.addEventListener('click', function () { location.hash = '#/search?q=' + encodeURIComponent(WORDS[i]); });
    function paused() { return hover || (q && (document.activeElement === q || q.value)) || !inView || document.hidden || !isHome(); }
    [H, st].forEach(function (el) { el.addEventListener('mouseenter', function () { hover = true; }); el.addEventListener('mouseleave', function () { hover = false; }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe($('.hero'));
    window.__roll = { words: WORDS, counts: counts, index: function () { return i; } };
    if (!RM) setInterval(function () { if (paused()) return; i = (i + 1) % WORDS.length; apply(true); }, 2200);
  }

  /* ---------- 킥 2: 게시판 칸이 지금 신청할 공고 카드가 되는 장면 ---------- */
  function boardMax() {
    var mx = 0;
    G.all.forEach(function (n) {
      var b = (n.url || '').split('bbs_data=')[1]; if (!b) return;
      try { var m = atob(b.split('||')[0]).match(/listNo=(\d+)/); if (m) mx = Math.max(mx, +m[1]); } catch (e) { }
    });
    return mx;
  }
  var SC = null;
  function sceneData() {
    if (SC) return SC;
    var pinned = G.detailed();
    var ex = { r: '춘천시', s: '모빌리티' };
    SC = { maxNo: boardMax(), pinned: pinned, ex: ex, hit: G.find(ex).hit, liveN: G.live().length, closedN: pinned.filter(function (n) { return G.status(n) === 'closed'; }).length };
    return SC;
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixA(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rgb(a) { return 'rgb(' + Math.round(a[0]) + ',' + Math.round(a[1]) + ',' + Math.round(a[2]) + ')'; }
  var C_DARK = [47, 62, 80], C_BLUE = [0, 104, 176], C_GRAY = [201, 211, 221], C_PALE = [214, 227, 239];
  function capHTML(k) {
    var d = sceneData();
    var go = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    if (k === 0) return '<p class="lbl">1 / 4 · 강원TP 모집공고 게시판</p><h3 class="ttl"><span class="ln"><span>모집공고 게시판,</span></span><span class="ln"><span>번호 <b>' + d.maxNo + '</b>번까지 쌓인 글</span></span></h3><p class="sub">회색 칸 하나가 글 번호 하나입니다. 맨 위 진한 줄은 게시판 꼭대기에 고정된 공지 ' + d.pinned.length + '칸.</p>';
    if (k === 1) return '<p class="lbl">2 / 4 · 맨 위 고정 공지</p><h3 class="ttl"><span class="ln"><span>그중 지금 맨 위에 올라와 있는</span></span><span class="ln"><span>공고 <b>' + d.pinned.length + '</b>건</span></span></h3><p class="sub">나머지 글은 지난 공고라 옅게 물러납니다.</p>';
    if (k === 2) return '<p class="lbl">3 / 4 · 마감일 확인</p><h3 class="ttl"><span class="ln"><span>마감일을 확인하면,</span></span><span class="ln"><span>지금 신청할 수 있는 건 <b>' + d.liveN + '</b>건</span></span></h3><p class="sub">오늘 날짜로 계산해 마감된 ' + d.closedN + '건은 회색이 됩니다.</p>';
    return '<p class="lbl">4 / 4 · 내 회사 조건</p><h3 class="ttl"><span class="ln"><span>회사 위치·분야를 고르면</span></span><span class="ln"><span><b>' + d.hit.length + '</b>건</span></span></h3><div class="chips"><span class="chip">' + esc(d.ex.r) + '</span><span class="chip">' + esc(d.ex.s) + '</span></div><p class="sub">분야 제한이 없는 공고까지 함께 남습니다. 카드를 누르면 한 장 요약.</p><a class="go" href="#/notices?r=' + encodeURIComponent(d.ex.r) + '&s=' + encodeURIComponent(d.ex.s) + '">내 조건으로 거르기' + go + '</a>';
  }
  function cardHTML(n) {
    var b = G.badge(n), st = G.status(n);
    var sub = n.amount || (st === 'open' ? shortDue(n) : '');
    if (n.amount && sub.length > 18 && sub.indexOf('·') > 0) sub = sub.split('·')[0] + ' 등';
    return '<span class="pc"><span class="pt"><b class="dd">' + esc(b.text) + '</b>' + (sub ? '<span class="am">' + esc(sub) + '</span>' : '') + '</span><span class="nm">' + esc(n.short || n.title) + '</span></span>';
  }
  function Stage(root) {
    var d = sceneData();
    var field = $('.field', root), cap = $('.cap', root);
    var N = d.maxNo;
    var bg = document.createElement('div'); bg.className = 'bg';
    var h = ''; for (var i = 0; i < N; i++) h += '<i style="--d:' + (60 + Math.round(i * 1.25)) + '"></i>';
    bg.innerHTML = h; field.appendChild(bg);
    var cells = bg.children;
    var pins = d.pinned.map(function (n, j) {
      var a = document.createElement('a'); a.className = 'p'; a.href = '#/notice/' + n.idx; a.tabIndex = -1; a.setAttribute('aria-hidden', 'true');
      a.style.setProperty('--d', String(j * 12));
      var pd = String(j * 12);
      var hi = d.hit.indexOf(n);
      if (hi > -1) { a.className = 'p hit'; a.innerHTML = cardHTML(n); a.setAttribute('aria-label', (n.short || n.title) + ' 한 장 요약'); }
      field.appendChild(a);
      return { n: n, el: a, closed: G.status(n) === 'closed', hit: hi, shown: false, d: pd };
    });
    var k = -1, last = 0;
    function capFit() {
      cap.style.minHeight = '';
      if (window.innerWidth >= 1100) return;
      var mh = 0;
      for (var q = 0; q < 4; q++) { cap.innerHTML = capHTML(q); mh = Math.max(mh, cap.offsetHeight); }
      cap.style.minHeight = mh + 'px';
      cap.innerHTML = capHTML(k < 0 ? 0 : k);
    }
    function layout() {
      capFit();
      var W = field.clientWidth, H = field.clientHeight; if (!W || !H) return false;
      var best = null;
      for (var cols = 15; cols <= 72; cols++) {
        var rows = Math.ceil(N / cols), pitch = Math.min(W / cols, H / (rows + 1.9));
        if (!best || pitch > best.pitch) best = { cols: cols, rows: rows, pitch: pitch };
      }
      var pt = Math.min(best.pitch, 34), s = Math.max(2, pt * .8);
      var gw = best.cols * pt - (pt - s), gh = (best.rows + 1.9) * pt - (pt - s);
      var ox = Math.max(0, (W - gw) / 2), oy = Math.max(0, (H - gh) / 2);
      for (var i = 0; i < N; i++) {
        var st = cells[i].style;
        st.left = (ox + (i % best.cols) * pt).toFixed(1) + 'px'; st.top = (oy + 1.9 * pt + Math.floor(i / best.cols) * pt).toFixed(1) + 'px';
        st.width = st.height = s.toFixed(1) + 'px';
      }
      pins.forEach(function (p, j) { p.cell = { x: ox + j * pt, y: oy, w: s, h: s }; });
      var hits = pins.filter(function (p) { return p.hit > -1; }).sort(function (a, b) { return a.hit - b.hit; });
      var m = hits.length, compact = W < 560;
      field.classList.toggle('compact', compact);
      if (!compact) {
        var c2 = Math.min(3, m), gap = 16, cw = Math.min(270, (W - gap * (c2 - 1)) / c2), ch = Math.min(158, Math.max(118, cw * .58));
        var r2 = Math.ceil(m / c2), tw = c2 * cw + (c2 - 1) * gap, th = r2 * ch + (r2 - 1) * gap, x0 = (W - tw) / 2, y0 = Math.max(0, (H - th) / 2);
        hits.forEach(function (p, j) { p.card = { x: x0 + (j % c2) * (cw + gap), y: y0 + Math.floor(j / c2) * (ch + gap), w: cw, h: ch }; });
      } else {
        var g2 = 8, chm = Math.min(76, (H - g2 * (m - 1)) / m), thm = m * chm + (m - 1) * g2, y1 = Math.max(0, (H - thm) / 2);
        hits.forEach(function (p, j) { p.card = { x: 0, y: y1 + j * (chm + g2), w: W, h: chm }; });
      }
      update(last, true);
      return true;
    }
    function update(sp, force) {
      last = sp;
      var kk = sp < .22 ? 0 : sp < .45 ? 1 : sp < .68 ? 2 : 3;
      if (kk !== k) { k = kk; cap.innerHTML = capHTML(k); root.setAttribute('data-step', String(k)); }
      var t2 = ease(clamp((sp - .2) / .07)), t3 = ease(clamp((sp - .43) / .07));
      bg.style.opacity = (1 - .6 * t2 - .18 * ease(clamp((sp - .66) / .2))).toFixed(3);
      var allIn = ease(clamp((sp - .66 - Math.max(0, d.hit.length - 1) * .012) / .14)) > .97;
      pins.forEach(function (p) {
        if (!p.cell) return;
        var t4 = ease(clamp((sp - .66 - Math.max(0, p.hit) * .012) / .14));
        var base = mixA(C_DARK, C_BLUE, t2), c;
        if (p.closed) c = rgb(mixA(base, C_GRAY, t3));
        else if (p.hit < 0) c = rgb(mixA(base, C_PALE, ease(clamp((sp - .66) / .2))));
        else c = rgb(base);
        var r = p.cell, x = r.x, y = r.y, w = r.w, hh = r.h, rad = 2;
        if (p.hit > -1 && p.card) { var q = p.card; x = lerp(r.x, q.x, t4); y = lerp(r.y, q.y, t4); w = lerp(r.w, q.w, t4); hh = lerp(r.h, q.h, t4); rad = lerp(2, 10, t4); }
        var css = 'left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px;width:' + w.toFixed(1) + 'px;height:' + hh.toFixed(1) + 'px;border-radius:' + rad.toFixed(1) + 'px;background:' + c + ';--d:' + p.d;
        if (force || p.css !== css) { p.el.style.cssText = css; p.css = css; }
        var show = p.hit > -1 && allIn;
        if (show !== p.shown) { p.shown = show; p.el.classList.toggle('show', show); p.el.tabIndex = show ? 0 : -1; if (show) p.el.removeAttribute('aria-hidden'); else p.el.setAttribute('aria-hidden', 'true'); }
      });
    }
    return { layout: layout, update: update, field: field };
  }
  function initScene() {
    var sc = $('#scene'); if (!sc) return;
    if (RM) {
      sc.classList.add('static');
      var tpl = $('#stage'); tpl.remove();
      [0.1, 0.33, 0.56, 1].forEach(function (v) {
        var dv = document.createElement('div'); dv.className = 'stage'; dv.innerHTML = '<div class="wrap stage-in"><div class="cap"></div><div class="field"></div></div>';
        sc.appendChild(dv); var S0 = Stage(dv); S0.update(v); S0.layout();
      });
      window.__sceneLayout = function () { };
      return;
    }
    var stage = $('#stage'), S = Stage(stage);
    var p = 0, sp = 0, raf = 0, vis = false, started = false;
    function prog() { var r = sc.getBoundingClientRect(), dd = sc.offsetHeight - window.innerHeight; return dd > 0 ? clamp(-r.top / dd) : 0; }
    function loop() {
      raf = 0; p = prog(); sp += (p - sp) * 0.16; if (Math.abs(p - sp) < 0.0005) sp = p;
      S.update(sp);
      if (vis && sp !== p) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && vis) raf = requestAnimationFrame(loop); }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', function () { S.layout(); kick(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      if (vis && !started) { started = true; S.field.classList.add('go'); }
      kick();
    }).observe(sc); else vis = true;
    window.__sceneLayout = function () { S.layout(); p = sp = prog(); S.update(sp, true); };
    window.__scene = { prog: function () { return sp; } };
    sp = p = prog(); S.layout(); S.update(sp, true);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { S.layout(); });
  }

  buildMenus();
  buildHome();
  initRoll();
  initScene();
  window.addEventListener('hashchange', route);
  route();
})();
