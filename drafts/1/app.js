(function () {
  var G = window.GW, B = G.base, esc = G.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = $('#hero'), home = $('#home'), view = $('#view'), form = $('#pick');
  var heroTitleHTML = $('.hero-t').innerHTML;

  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function hasFinal(w) { var c = w.charCodeAt(w.length - 1); if (c < 0xAC00 || c > 0xD7A3) return false; return (c - 0xAC00) % 28 !== 0; }
  function cut(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function short(n) { return n.short || n.title; }
  function chip(n) { var b = G.badge(n); return '<span class="bdg ' + b.cls + '">' + esc(b.text) + '</span>'; }

  /* ── 문장형 선택 상자 ── */
  var PH = { r: function (v) { return v + '에 있는'; }, s: function (v) { return v + ' 기업이고,'; }, t: function (v) { return v + (hasFinal(v) ? '이' : '가') + ' 필요해요'; } };
  function fillSelect(name, ph, list) {
    var sel = form.elements[name];
    sel.innerHTML = '<option value="">' + ph + '</option>' + list.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('');
  }
  fillSelect('r', '시군 고르기 (전체)', B.regions.concat(['강원 밖']));
  fillSelect('s', '분야 고르기 (전체)', B.sectors);
  fillSelect('t', '도움 고르기 (전체)', B.types);
  function syncPick() {
    ['r', 's', 't'].forEach(function (k) {
      var sel = form.elements[k], lab = sel.closest('.pk'), t = $('.pk-t', lab), v = sel.value;
      t.textContent = v ? PH[k](v) : t.getAttribute('data-ph');
      lab.classList.toggle('set', !!v);
    });
    var on = form.elements.r.value;
    $$('.hero-lines path').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-city') === on); });
  }
  form.addEventListener('change', syncPick);
  function queryHash() {
    var q = [], f = form.elements;
    ['r', 's', 't'].forEach(function (k) { if (f[k].value) q.push(k + '=' + encodeURIComponent(f[k].value)); });
    return '#/find' + (q.length ? '?' + q.join('&') : '');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var to = queryHash(), btn = $('.go', form);
    if (reduce || !document.body.animate) { location.hash = to; return; }
    // 버튼이 다음 화면으로 커지기
    var r = btn.getBoundingClientRect(), W = innerWidth, H = innerHeight, g = $('#grow');
    var from = 'inset(' + r.top + 'px ' + (W - r.right) + 'px ' + (H - r.bottom) + 'px ' + r.left + 'px round 4px)';
    g.style.visibility = 'visible'; g.style.opacity = 1;
    var a = g.animate([{ clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: 420, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' });
    var done = false;
    function next() {
      if (done) return; done = true;
      if (location.hash === to) route(); else location.hash = to;
      window.scrollTo(0, 0);
      g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' }).onfinish = function () { g.style.visibility = 'hidden'; a.cancel(); };
    }
    a.onfinish = next; setTimeout(next, 700);
  });

  /* ── 첫 화면 숫자 세기 ── */
  var liveN = G.live().length;
  function countUp(el, n) {
    if (reduce || !window.requestAnimationFrame) { el.textContent = n; return; }
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = n; }, 1200);
  }

  /* ── 첫 화면 지도 선 ── */
  $('.hero-lines').innerHTML = G.mapSvg({});

  /* ── 지원 묶음 ── */
  var byCity = G.placesByCity();
  var cityList = Object.keys(byCity);
  var spaceN = G.find({ t: ['입주 공간'] }).hit.length;
  $('#space .h2').textContent = '공고 말고도, 강원 ' + cityList.length + '개 시군 ' + B.places.length + '곳의 시설과 장비가 기업 곁에 있어요';
  function supSpace() {
    var groups = [['춘천시'], ['강릉시'], ['원주시'], cityList.filter(function (c) { return ['춘천시', '강릉시', '원주시'].indexOf(c) < 0; })];
    return groups.map(function (g) {
      var ps = []; g.forEach(function (c) { ps = ps.concat(byCity[c] || []); });
      return '<div class="sg"><h3>' + g.map(function (c) { return c.replace(/(시|군)$/, ''); }).join('·') + ' · ' + ps.length + '곳</h3><p>' + ps.map(function (p) { return esc(p.name); }).join(' · ') + '</p></div>';
    }).join('') + '<div class="sg"><a class="go-l" href="#/find?t=' + encodeURIComponent('입주 공간') + '">지금 입주 모집 중인 공고 ' + spaceN + '건 보기 →</a></div>';
  }
  function supEq() {
    var ns = G.live().filter(function (n) { return (n.types || []).some(function (t) { return t === '장비·실증' || t === '컨설팅·테스트'; }); }).sort(G.byDeadline).slice(0, 4);
    return ns.map(function (n) { return '<div class="sg"><h3>' + esc(G.badge(n).text) + ' · ' + esc((n.sectors || []).filter(function (s) { return s !== '전 분야'; }).join('·') || '전 분야') + '</h3><p><a href="#/notice/' + n.idx + '">' + esc(short(n)) + '</a></p></div>'; }).join('') +
      '<div class="sg"><a class="go-l" href="#/find?t=' + encodeURIComponent('장비·실증') + '">장비·실증 공고 모두 보기 →</a></div>';
  }
  function supSys() {
    var gs = [['입주', '입주기업'], ['장비', '연구장비'], ['지원사업', '지원사업 매칭'], ['정보|분야', '지역산업·분야 센터']];
    return gs.map(function (g) {
      var re = new RegExp('^(' + g[0] + ')$'), ss = B.systems.filter(function (s) { return re.test(s.group); });
      return '<div class="sg"><h3>' + g[1] + '</h3><p>' + ss.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>'; }).join(' · ') + '</p></div>';
    }).join('');
  }
  var SUP = { space: supSpace, eq: supEq, sys: supSys };
  function setPill(k) {
    $$('.pill').forEach(function (b) { var on = b.getAttribute('data-p') === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    $('#supGrid').innerHTML = SUP[k]();
  }
  $$('.pill').forEach(function (b) { b.addEventListener('click', function () { setPill(b.getAttribute('data-p')); }); });
  setPill('space');

  /* ── 마감이 가까운 공고 ── */
  function card(n) {
    return '<a class="card" href="#/notice/' + n.idx + '">' + chip(n) +
      '<p class="card-t">' + esc(short(n)) + '</p>' +
      '<p class="card-a">' + esc(cut(n.amount || n.benefit || '', 60)) + '</p>' +
      '<p class="card-f"><b>' + esc(G.deadlineText(n)) + '</b>' + esc(n.dept || '') + '</p></a>';
  }
  $('#soonRow').innerHTML = G.live().sort(G.byDeadline).map(card).join('');

  /* ── 자주 찾는 곳 ── */
  var ICON = {
    '입주기업종합지원': '<path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6"/>',
    '강원연구장비': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    '공공지원사업 매칭 서비스': '<path d="M4 7h10M4 12h16M4 17h7"/><circle cx="18" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
    'G-BIZ TP': '<rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M8 4v5"/>',
    '강원지역산업정보': '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'
  };
  $('#links').innerHTML = ['입주기업종합지원', '강원연구장비', '공공지원사업 매칭 서비스', 'G-BIZ TP', '강원지역산업정보'].map(function (nm) {
    var s = B.systems.filter(function (x) { return x.name === nm; })[0]; if (!s) return '';
    var host = s.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return '<a class="lk" href="' + esc(s.url) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + ICON[nm] + '</svg><b>' + esc(nm) + '</b><small>' + esc(host) + '</small><i>바로가기</i></a>';
  }).join('');

  /* ── 시설 사진 줄 ── */
  $('#placeRow').innerHTML = B.places.filter(function (p) { return p.img; }).map(function (p) {
    return '<figure class="pc"><img src="../assets-shared/img/' + p.img + '.jpg" alt="' + esc(p.name) + '" loading="lazy" width="600" height="750"><figcaption><b>' + esc(p.name) + '</b><span>' + esc(p.city) + ' · ' + esc(p.use) + '</span></figcaption></figure>';
  }).join('');

  /* ── 소식 ── */
  $('#newsList').innerHTML = B.news.map(function (n) { return '<li><a href="' + esc(B.newsUrl) + '" target="_blank" rel="noopener"><time>' + n.date.replace(/-/g, '.') + '</time><span>' + esc(n.title) + '</span></a></li>'; }).join('');

  /* 좌우 화살표 */
  $$('.arw').forEach(function (b) { b.addEventListener('click', function () { var row = document.getElementById(b.getAttribute('data-for')); row.scrollBy({ left: (+b.getAttribute('data-dir')) * Math.min(row.clientWidth * 0.8, 632), behavior: reduce ? 'auto' : 'smooth' }); }); });

  /* 폰 메뉴 */
  var burger = $('.burger'), mnav = $('#mnav');
  burger.addEventListener('click', function () { var open = mnav.hidden; mnav.hidden = !open; burger.setAttribute('aria-expanded', open); });

  /* ── 화면: 찾기 결과 ── */
  function row(n) {
    var kv = [];
    if (n.amount) kv.push('<span><b>얼마나</b>' + esc(cut(n.amount, 40)) + '</span>');
    kv.push('<span><b>언제까지</b>' + esc(G.deadlineText(n)) + '</span>');
    return '<li><a class="nrow" href="#/notice/' + n.idx + '">' + chip(n) + '<div><p class="nrow-t">' + esc(short(n)) + '</p><p class="nrow-m">' + esc(cut(n.target || n.benefit || '', 90)) + '</p><p class="nrow-kv">' + kv.join('') + '</p></div><span class="nrow-go">한 장 요약 →</span></a></li>';
  }
  function sentence(q) {
    var p = [];
    if (q.r) p.push(q.r + '에 있는');
    p.push(q.s ? q.s + ' 기업' : '강원 기업');
    return p.join(' ') + (q.t ? ', ' + PH.t(q.t).replace(' 필요해요', ' 필요할 때') : '');
  }
  function renderFind(q) {
    var f = form.elements; f.r.value = q.r || ''; f.s.value = q.s || ''; f.t.value = q.t || ''; syncPick();
    var res = G.find({ r: q.r || '', s: q.s || '', t: q.t ? [q.t] : [] });
    hero.classList.add('compact');
    $('.hero-t').innerHTML = '<span class="hero-sub">' + esc(sentence(q)) + '</span><span class="ln"><span>지금 신청할 공고 <span id="hitN">' + res.hit.length + '</span>건</span></span>';
    var h = '<section class="v-sec"><div class="wrap">';
    if (res.hit.length) {
      h += '<h2 class="v-h">마감이 가까운 순서</h2><p class="v-p">전체 ' + res.liveCount + '건 중 고른 조건에 맞는 공고입니다. 공고를 누르면 한 장 요약이 열립니다.</p><ul class="nlist">' + res.hit.map(row).join('') + '</ul>';
    } else {
      h += '<div class="empty">고른 조건에 딱 맞는 공고는 지금 없습니다. 조건을 하나 바꾸거나, 아래 비슷한 공고를 보세요.</div>';
    }
    if (res.near.length) h += '<div class="v-block"><h2 class="v-h">조건을 하나 넓히면 ' + res.near.length + '건</h2><p class="v-p">지역은 맞고 분야나 도움 중 하나만 맞는 공고입니다.</p><ul class="nlist">' + res.near.map(row).join('') + '</ul></div>';
    if (res.closed.length) h += '<div class="v-block"><h2 class="v-h">같은 조건의 지난 공고</h2><ul class="past">' + res.closed.map(function (n) { return '<li><a href="#/notice/' + n.idx + '"><time>' + n.posted.replace(/-/g, '.') + '</time><span>' + esc(n.title) + ' (마감)</span></a></li>'; }).join('') + '</ul></div>';
    h += '</div></section>';
    view.innerHTML = h;
    var el = $('#hitN'); if (el) countUp(el, res.hit.length);
  }

  /* ── 화면: 공고 한 장 요약 ── */
  var ICS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  var TEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>';
  function renderNotice(idx) {
    var n = G.byId(idx);
    if (!n) { view.innerHTML = '<section class="v-sec"><div class="wrap"><h1 class="v-h">공고를 찾을 수 없습니다</h1><p class="v-p"><a href="#/notices">공고 목록으로</a></p></div></section>'; return; }
    var b = G.badge(n), st = G.status(n), d = G.dday(n);
    var tel = G.tel(n.contact), telTo = tel || B.phone;
    var acts = '<p class="act-d">' + esc(b.text) + '</p><p class="act-dt">' + esc(G.deadlineText(n)) + '</p>' +
      (n.list_only ? '' : '<a class="btn pri" href="tel:' + telTo + '">' + TEL + '<span>전화 걸기 <small>' + telTo + (tel ? '' : ' 대표') + '</small></span></a>') +
      (n.apply_end && st !== 'closed' ? '<button class="btn js-ics" type="button">' + ICS + '마감일 달력에 넣기</button>' : '') +
      '<a class="btn nav" href="' + esc(n.url) + '" target="_blank" rel="noopener">공고 원문·첨부 보기 ↗</a>' +
      '<button class="btn js-share" type="button">링크 보내기</button>';
    var stText = st === 'closed' ? '마감' : st === 'always' ? '모집 중 (상시)' : st === 'unknown' ? '모집 중 · 마감일은 공고문 확인' : '모집 중';
    var h = '<article class="nt"><div class="wrap">' +
      '<nav class="crumb" aria-label="위치"><a href="#/">처음</a><span>›</span><a href="#/notices">공고안내</a><span>›</span><span>모집공고</span></nav>' +
      '<div class="nt-grid"><div>' +
      '<p class="nt-k">모집공고' + (n.no ? ' · ' + esc(n.no) : '') + '</p>' +
      '<h1 class="nt-h">' + esc(short(n)) + '</h1>' +
      '<dl class="meta">' +
      '<div><dt>상태</dt><dd>' + chip(n) + ' ' + esc(stText) + '</dd></div>' +
      '<div><dt>지원기관</dt><dd>강원테크노파크' + (n.dept ? ' ' + esc(n.dept) : '') + '</dd></div>' +
      '<div><dt>지원 형태</dt><dd>' + esc((n.types || []).join(', ') || '공고문 확인') + '</dd></div>' +
      '<div><dt>게시일</dt><dd>' + esc(G.fmtDate(n.posted)) + '</dd></div>' +
      (n.apply_start ? '<div><dt>접수 시작</dt><dd>' + esc(G.fmtDate(n.apply_start)) + '</dd></div>' : '') +
      '<div><dt>마감</dt><dd>' + esc(G.deadlineText(n)) + '</dd></div>' +
      '<div><dt>공고 원문</dt><dd>' + esc(n.title) + '</dd></div>' +
      '</dl>' +
      '<div class="act act-m" aria-label="바로 하기">' + acts + '</div>';
    if (n.list_only) {
      h += '<div class="empty" style="margin-top:32px">지난 공고입니다. 내용은 공고 원문에서 볼 수 있습니다.</div>';
    } else {
      h += '<section class="sum"><h2>한 장 요약</h2><dl class="sum-grid">' +
        '<div class="sum-c"><dt>누가</dt><dd>' + esc(n.target || '공고문 확인') + '</dd></div>' +
        '<div class="sum-c"><dt>무엇을</dt><dd>' + esc(n.benefit || '공고문 확인') + '</dd></div>' +
        '<div class="sum-c"><dt>얼마나</dt><dd>' + (n.amount ? '<span class="big">' + esc(n.amount) + '</span>' + (n.amount_detail ? '<small>' + esc(n.amount_detail) + '</small>' : '') : '금액 표기 없음 — 지원 내용을 보세요') + '</dd></div>' +
        '<div class="sum-c"><dt>언제까지</dt><dd><span class="big">' + esc(b.text) + '</span><small>' + esc(G.deadlineText(n)) + '</small></dd></div>' +
        '<div class="sum-c"><dt>어떻게</dt><dd>' + esc(n.how || '공고문 확인') + '</dd></div>' +
        '<div class="sum-c"><dt>누구에게</dt><dd>' + esc(n.contact || ('대표전화 ' + B.phone)) + '</dd></div>' +
        '</dl></section>';
      if ((n.docs || []).length) {
        var ds = G.docsState(n);
        h += '<section class="box"><h2>제출 서류 체크</h2><ul class="docs" id="docs">' + n.docs.map(function (x, i) { return '<li><label><input type="checkbox" data-i="' + i + '"' + (ds.get(i) ? ' checked' : '') + '><span>' + esc(x) + '</span></label></li>'; }).join('') + '</ul><p class="docs-n" id="docsN"></p></section>';
      }
      var ev = n.evidence || {}, EVL = { target: '누가', regions: '지역', amount: '얼마나', apply_end: '언제까지', how: '어떻게', contact: '누구에게' };
      var evk = Object.keys(EVL).filter(function (k) { return ev[k]; });
      if (evk.length) h += '<section class="box"><h2>공고문 원문 문장</h2><ul class="ev">' + evk.map(function (k) { return '<li><b>' + EVL[k] + '</b>' + esc(ev[k]) + '</li>'; }).join('') + '</ul></section>';
      if ((n.files || []).length) h += '<section class="box"><h2>첨부 파일</h2><ul class="files">' + n.files.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul><a class="btn" style="margin-top:16px" href="' + esc(n.url) + '" target="_blank" rel="noopener">강원TP 게시물에서 내려받기 ↗</a></section>';
    }
    h += '</div><aside class="act act-pc" aria-label="바로 하기">' + acts +
      '</aside></div></div></article>';
    view.innerHTML = h;
    $$('.js-ics', view).forEach(function (x) { x.addEventListener('click', function () { G.icsDownload(n, toast); }); });
    $$('.js-share', view).forEach(function (x) { x.addEventListener('click', function () { G.share(short(n), location.href, toast); }); });
    var docs = $('#docs');
    if (docs) {
      var ds2 = G.docsState(n), cnt = function () { $('#docsN').textContent = n.docs.length + '개 중 ' + ds2.count() + '개 준비했어요 (이 기기에 저장)'; };
      docs.addEventListener('change', function (e) { var i = e.target.getAttribute('data-i'); if (i != null) { ds2.set(+i, e.target.checked); cnt(); } });
      cnt();
    }
  }

  /* ── 화면: 공고 목록 ── */
  function renderNotices(q) {
    var w = (q.q || '').trim();
    var live = G.live().sort(G.byDeadline), past = G.all.filter(function (n) { return G.status(n) === 'closed'; }).sort(G.byPosted);
    if (w) { var s = G.search(w).notices; live = s.filter(function (n) { return G.status(n) !== 'closed'; }); past = s.filter(function (n) { return G.status(n) === 'closed'; }); }
    var h = '<header class="vhead"><div class="wrap"><h1>모집공고</h1><p>지금 신청할 수 있는 공고 ' + G.live().length + '건 · 지난 공고 ' + G.all.filter(function (n) { return G.status(n) === 'closed'; }).length + '건</p>' +
      '<form class="srch" id="srch" role="search"><input name="q" type="search" placeholder="공고 이름·분야·부서로 찾기 (예: 수소, 보안)" value="' + esc(w) + '" aria-label="공고 검색"><button type="submit">검색</button></form></div></header>' +
      '<section class="v-sec"><div class="wrap">' +
      '<h2 class="v-h">' + (w ? '‘' + esc(w) + '’ — ' : '') + '지금 신청할 수 있는 공고 ' + live.length + '건</h2>' +
      (live.length ? '<ul class="nlist">' + live.map(row).join('') + '</ul>' : '<div class="empty">지금 신청할 수 있는 공고 중에는 찾는 말이 없습니다.</div>') +
      '<div class="v-block"><h2 class="v-h">지난 공고 ' + past.length + '건</h2><ul class="past">' + past.map(function (n) { return '<li><a href="#/notice/' + n.idx + '"><time>' + (n.posted || '').replace(/-/g, '.') + '</time><span>' + esc(n.title) + '</span></a></li>'; }).join('') + '</ul></div>' +
      '</div></section>';
    view.innerHTML = h;
    $('#srch').addEventListener('submit', function (e) { e.preventDefault(); var v = this.elements.q.value.trim(); location.hash = '#/notices' + (v ? '?q=' + encodeURIComponent(v) : ''); });
    if (q.q === '') $('#srch input').focus();
  }

  /* ── 길잡이(해시) ── */
  function parse() {
    var h = location.hash.replace(/^#/, '') || '/', q = {}, i = h.indexOf('?'), path = h;
    if (i > -1) { path = h.slice(0, i); h.slice(i + 1).split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' ')); }); }
    return { path: path, q: q };
  }
  var first = true;
  function route() {
    var r = parse(), p = r.path, m;
    mnav.hidden = true; burger.setAttribute('aria-expanded', 'false');
    hero.classList.remove('compact');
    if (p === '/find') {
      hero.hidden = false; home.hidden = true; view.hidden = false; renderFind(r.q);
    } else if ((m = p.match(/^\/notice\/(\d+)/))) {
      hero.hidden = true; home.hidden = true; view.hidden = false; renderNotice(m[1]);
    } else if (p === '/notices') {
      hero.hidden = true; home.hidden = true; view.hidden = false; renderNotices(r.q);
    } else {
      hero.hidden = false; home.hidden = false; view.hidden = true; view.innerHTML = '';
      $('.hero-t').innerHTML = heroTitleHTML;
      if (p === '/space') { var sp = $('#space'); setTimeout(function () { sp.scrollIntoView({ behavior: reduce || first ? 'auto' : 'smooth' }); }, 30); }
    }
    if (!first && p !== '/space') window.scrollTo(0, 0);
    document.title = p === '/' ? '강원테크노파크 — 우리 회사가 지금 받을 수 있는 지원' : (document.querySelector('#view h1, .hero-t') || {}).textContent + ' — 강원테크노파크';
    first = false;
  }
  window.addEventListener('hashchange', route);
  syncPick();
  route();
  countUp($('#liveN'), liveN);
})();
