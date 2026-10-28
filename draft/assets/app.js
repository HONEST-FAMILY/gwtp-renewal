(function () {
  var B = window.GW_BASE, M = window.GW_MAP, ALL = window.GW_NOTICES || [];
  var app = document.getElementById('app');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.16,1,.3,1)';

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var today = (function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  function parseD(s) { if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dday(n) { var e = parseD(n.apply_end); if (!e) return null; return Math.round((e - today) / 864e5); }
  function status(n) {
    if (n.apply_note && /상시/.test(n.apply_note) && !n.apply_end) return 'always';
    var d = dday(n);
    if (d === null) return n.list_only ? 'closed' : (n.board_status === '완료' ? 'closed' : 'unknown');
    return d < 0 ? 'closed' : 'open';
  }
  function fmtDate(s) { if (!s) return ''; var p = s.split('-'); return p[0] + '년 ' + (+p[1]) + '월 ' + (+p[2]) + '일'; }
  function fmtShort(s) { if (!s) return ''; var p = s.split('-'); return (+p[1]) + '.' + (+p[2]); }
  function wk(s) { var d = parseD(s); return d ? '(' + '일월화수목금토'[d.getDay()] + ')' : ''; }
  function badge(n) {
    var st = status(n), d = dday(n);
    if (st === 'always') return '<span class="badge always">상시 모집</span>';
    if (st === 'closed') return '<span class="badge closed">마감</span>';
    if (st === 'unknown') return '<span class="badge unknown">마감일 공고문 확인</span>';
    if (d === 0) return '<span class="badge urgent">오늘 마감</span>';
    if (d <= 7) return '<span class="badge urgent">D-' + d + '</span>';
    return '<span class="badge open">모집중 D-' + d + '</span>';
  }
  function deadlineText(n) {
    var st = status(n);
    if (n.apply_end) return fmtDate(n.apply_end) + ' ' + wk(n.apply_end) + (n.apply_end_time ? ' ' + n.apply_end_time + '까지' : '까지');
    if (st === 'always') return n.apply_note || '연중 상시';
    return n.apply_note || '공고문 확인';
  }
  function tel(s) { var m = String(s || '').match(/0\d{1,2}-\d{3,4}-\d{4}/); return m ? m[0] : ''; }
  function openOnes() { return ALL.filter(function (n) { return !n.list_only && status(n) !== 'closed'; }); }
  function byDeadline(a, b) {
    var sa = status(a), sb = status(b);
    var da = sa === 'open' ? dday(a) : (sa === 'unknown' ? 9000 : 9999);
    var db = sb === 'open' ? dday(b) : (sb === 'unknown' ? 9000 : 9999);
    if (da !== db) return da - db;
    return (b.posted || '').localeCompare(a.posted || '');
  }
  function byPosted(a, b) { return (b.posted || '').localeCompare(a.posted || ''); }

  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 2200);
  }

  /* ---------- reveal ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target._onIn) e.target._onIn(); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  function watch(root) {
    $$('.rise, .anim-up, [data-count], .gwmap', root).forEach(function (el) {
      if (el.hasAttribute('data-count')) el._onIn = function () { countUp(el); };
      if (el.classList.contains('gwmap')) el._onIn = function () { drawMap(el); };
      if (reduce || !io) { el.classList.add('in'); if (el._onIn) el._onIn(); return; }
      io.observe(el);
    });
    setTimeout(function () { $$('.rise:not(.in), .anim-up:not(.in)', root).forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { el.classList.add('in'); } }); }, 900);
  }
  function countUp(el) {
    var to = +el.getAttribute('data-count'), dur = 900, t0 = performance.now();
    if (reduce) { el.textContent = to; return; }
    function f(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  /* ---------- notice entry (UKRI style) ---------- */
  function entry(n, opts) {
    opts = opts || {};
    var rows = [];
    rows.push(['상태', badge(n).replace('class="badge', 'style="vertical-align:middle" class="badge')]);
    if (n.target) rows.push(['신청 대상', esc(n.target)]);
    if (n.amount) rows.push(['지원 규모', esc(n.amount)]);
    rows.push(['담당', esc(n.dept || '')]);
    if (!n.list_only) rows.push(['접수 마감', esc(deadlineText(n)) + (status(n) === 'open' && dday(n) <= 7 ? '<span class="dday">' + (dday(n) === 0 ? '오늘' : 'D-' + dday(n)) + '</span>' : '')]);
    if (opts.full && n.how) rows.push(['신청 방법', esc(n.how)]);
    if (opts.full && n.contact) { var t = tel(n.contact); rows.push(['문의', esc(n.contact) + (t ? ' <a href="tel:' + t + '">전화 걸기</a>' : '')]); }
    rows.push(['등록일', esc(fmtDate(n.posted))]);
    var href = n.list_only ? n.url : '#/notice/' + n.idx;
    var tgt = n.list_only ? ' target="_blank" rel="noopener"' : '';
    return '<li class="rise">' +
      '<div class="n-top">' + (n.no ? '<span class="n-no">' + esc(n.no) + '</span>' : '') + '</div>' +
      '<h3 class="n-title"><a href="' + href + '"' + tgt + '>' + esc(n.title) + '</a></h3>' +
      (n.benefit ? '<p class="n-sum">' + esc(n.short ? n.short + ' — ' : '') + esc(n.benefit) + '</p>' : '') +
      '<dl class="kv">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
      '</li>';
  }

  /* ---------- map ---------- */
  var placeCities = {};
  B.places.forEach(function (p) { (placeCities[p.city] = placeCities[p.city] || []).push(p); });
  function areaBy(name) { for (var i = 0; i < M.areas.length; i++) if (M.areas[i].name === name) return M.areas[i]; return null; }
  function mapSvg(cls, opts) {
    opts = opts || {};
    var pad = opts.pad || 0;
    var s = '<svg viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (M.w + pad * 2) + ' ' + (M.h + pad * 2) + '" role="img" aria-label="강원특별자치도 18개 시군 지도">';
    M.areas.forEach(function (a) {
      s += '<path class="area' + (opts.has && opts.has[a.name] ? ' has' : '') + '" data-city="' + a.name + '" d="' + a.d + '"><title>' + a.name + '</title></path>';
    });
    if (opts.labels) M.areas.forEach(function (a) {
      var dx = opts.labelShift && opts.labelShift[a.name] ? opts.labelShift[a.name] : [0, 0];
      s += '<text class="lbl" data-lbl="' + a.name + '" x="' + (a.cx + dx[0]) + '" y="' + (a.cy + dx[1] + 7) + '">' + a.name.replace(/(시|군)$/, '') + '</text>';
    });
    s += '<g class="marks"></g></svg>';
    return '<div class="' + cls + '">' + s + '</div>';
  }
  var LABEL_SHIFT = { '속초시': [8, 4], '동해시': [10, 0], '태백시': [0, 6], '양양군': [6, 10], '고성군': [-10, 10], '화천군': [0, 8], '양구군': [0, 10] };
  var LEADS = { '춘천시': [-150, -150], '강릉시': [150, -120], '원주시': [-150, 110], '삼척시': [100, -60], '태백시': [-20, 110], '홍천군': [-40, -230] };

  function drawMap(wrap) {
    var svg = $('svg', wrap), g = $('.marks', svg);
    var paths = $$('.area', svg);
    if (!reduce) paths.forEach(function (p, i) { p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 20 * i, easing: 'ease-out', fill: 'backwards' }); });
    var k = 0;
    Object.keys(placeCities).forEach(function (city) {
      var a = areaBy(city); if (!a) return;
      var off = LEADS[city] || [100, -100];
      var x2 = a.cx + off[0], y2 = a.cy + off[1];
      var anchor = off[0] < 0 ? 'end' : 'start';
      var tx = x2 + (off[0] < 0 ? -12 : 12);
      var html = '<g class="mk" data-city="' + city + '" style="cursor:pointer">' +
        '<line class="lead" x1="' + a.cx + '" y1="' + a.cy + '" x2="' + x2 + '" y2="' + y2 + '" pathLength="1" style="stroke-dasharray:1 2;stroke-dashoffset:1.01"/>' +
        '<circle class="dot-ring" cx="' + a.cx + '" cy="' + a.cy + '" r="18"/><circle class="dot" cx="' + a.cx + '" cy="' + a.cy + '" r="9"/>' +
        '<text class="tag-t" x="' + tx + '" y="' + (y2 - 2) + '" text-anchor="' + anchor + '">' + city + '</text>' +
        '<text class="tag-s" x="' + tx + '" y="' + (y2 + 32) + '" text-anchor="' + anchor + '">' + placeCities[city].length + '곳</text></g>';
      g.insertAdjacentHTML('beforeend', html);
      var mk = g.lastElementChild, line = $('line', mk), texts = $$('text', mk), dots = $$('circle', mk);
      var delay = 450 + k * 140; k++;
      if (reduce) { line.style.strokeDashoffset = 0; return; }
      dots.forEach(function (c) { c.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 420, delay: delay, easing: EASE, fill: 'backwards' }); c.style.transformOrigin = a.cx + 'px ' + a.cy + 'px'; c.style.transformBox = 'view-box'; });
      line.animate([{ strokeDashoffset: 1.01 }, { strokeDashoffset: 0 }], { duration: 520, delay: delay + 160, easing: EASE, fill: 'forwards' });
      texts.forEach(function (t) { t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: delay + 520, easing: 'ease-out', fill: 'backwards' }); });
    });
    if (reduce) $$('line', g).forEach(function (l) { l.style.strokeDashoffset = 0; });
  }

  /* ---------- home ---------- */
  function renderHome() {
    var open = openOnes().sort(byDeadline);
    var dated = open.filter(function (n) { return status(n) === 'open'; });
    var soon = dated.filter(function (n) { return dday(n) <= 14; });
    var secCount = {};
    B.sectors.forEach(function (s) { secCount[s] = 0; });
    open.forEach(function (n) { (n.sectors || []).forEach(function (s) { if (secCount[s] != null) secCount[s]++; }); });
    var secDesc = {
      '모빌리티': '미래차 부품·재제조, 전기·수소차 기술',
      '수소·에너지': '수소에너지·LNG 냉열·에너지센터',
      '바이오': '천연물·그린바이오·바이오 전문인력',
      '반도체': '반도체 소모품·의료기기 반도체 실증',
      '디지털헬스·의료기기': '디지털헬스케어 투자·실증',
      'ICT·데이터': '디지털트윈·소프트웨어 품질·데이터',
      '정보보호': 'ICT 중소기업 정보보호'
    };
    var placeHas = {}; Object.keys(placeCities).forEach(function (c) { placeHas[c] = 1; });
    app.innerHTML =
      '<section class="hero">' +
        '<div class="hero-band"><img id="heroImg" src="assets/img/hero-hq.jpg" alt="춘천 강원테크노파크 전경"></div>' +
        '<div class="hero-row"><div class="wrap">' +
          '<div class="hero-title"><p class="eyebrow">강원테크노파크 기업지원</p>' +
            '<h1 class="anim-up"><span class="line-mask"><span>우리 회사에 맞는</span></span><span class="line-mask"><span>지원사업,</span></span><span class="line-mask"><span>질문 3개면 찾습니다</span></span></h1></div>' +
          '<div class="hero-panel" id="heroPanel"><p>회사 위치·분야·필요한 도움만 고르세요. 지금 모집중인 공고 가운데 신청할 수 있는 것만 마감일·지원 규모·신청 방법·담당자 전화까지 한 장으로 보여 드립니다.</p>' +
            '<div class="meta"><div><b data-count="' + open.length + '">0</b><span>지금 신청할 수 있는 공고</span></div><div><b data-count="' + soon.length + '">0</b><span>2주 안에 마감</span></div><div><b data-count="' + B.places.length + '">0</b><span>도내 거점 시설</span></div></div>' +
            '<div class="acts"><button type="button" class="btn" data-open-finder>내 회사 조건으로 찾기 <span class="arr">→</span></button><a class="btn line" href="#/notices">공고 전체 보기</a></div>' +
          '</div>' +
        '</div></div>' +
      '</section>' +

      '<section class="sec" id="soon"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">지원사업 공고</p><h2 class="anim-up"><span class="line-mask"><span>마감이 가까운 순서로</span></span></h2><p class="desc">공고문을 내려받지 않아도 누가·얼마나·언제까지인지 바로 보입니다.</p></div><a class="link-arr" href="#/notices">공고 전체 보기 →</a></div>' +
        '<div class="home-notices"><div>' +
          '<div class="count-bar"><span>지금 신청할 수 있는 공고 <span class="n">' + open.length + '</span>건</span><span style="font-weight:500;font-size:14px;opacity:.8">공고 수집 ' + fmtDate(B.asOf) + '</span></div>' +
          '<ul class="nlist">' + open.slice(0, 4).map(function (n) { return entry(n); }).join('') + '</ul>' +
        '</div>' +
        '<aside class="side-card rise"><h3>분야만 알면<br>바로 좁혀집니다</h3><p>지금 모집중인 공고를 분야별로 세었습니다.</p><ul>' +
          B.sectors.map(function (s) { return '<li><span>' + s + '</span><b>' + secCount[s] + '건</b></li>'; }).join('') +
          '</ul><button type="button" class="btn" data-open-finder>질문 3개로 찾기 <span class="arr">→</span></button></aside>' +
        '</div>' +
      '</div></section>' +

      '<section class="sec gray" id="fields"><div class="wrap">' +
        '<div class="split rise"><div class="ph"><img src="assets/img/wj-openlab.jpg" alt="원주 강원혁신지원 OpenLAB센터" loading="lazy"><span class="cap">원주 강원혁신지원 OpenLAB센터</span></div>' +
        '<div class="pn"><h2 class="anim-up"><span class="line-mask"><span>강원 산업을 키우는</span></span><span class="line-mask"><span>일곱 개 분야</span></span></h2><p>분야를 누르면 그 분야 공고만 모아 보여 드립니다.</p>' +
          '<div class="sector-list">' + B.sectors.map(function (s) {
            return '<button type="button" data-sector="' + s + '"><span><b>' + s + '</b><small>' + (secDesc[s] || '') + '</small></span><span class="cnt' + (secCount[s] ? '' : ' zero') + '">' + (secCount[s] ? '모집중 ' + secCount[s] + '건' : '다음 공고 예정') + '</span><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4l6 6-6 6" fill="none" stroke="#002049" stroke-width="2"/></svg></button>';
          }).join('') + '</div></div></div>' +
      '</div></section>' +

      '<section class="sec" id="places"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">장비·공간</p><h2 class="anim-up"><span class="line-mask"><span>도내 6개 시군,</span></span><span class="line-mask"><span>15곳의 거점</span></span></h2><p class="desc">입주 공간과 연구장비가 어디에 있는지 지도에서 바로 고릅니다.</p></div></div>' +
        '<div class="map-wrap"><div>' + mapSvg('gwmap', { has: placeHas, pad: 80 }) + '</div>' +
        '<div class="place-panel"><div class="city-tabs" id="cityTabs">' + Object.keys(placeCities).map(function (c, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-city="' + c + '">' + c + ' ' + placeCities[c].length + '</button>'; }).join('') + '</div><div id="placeBox"></div></div></div>' +
      '</div></section>' +

      '<section class="sec gray sys-sec" id="systems"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">관련 사이트</p><h2 class="anim-up"><span class="line-mask"><span>장비 예약·입주 지원도</span></span><span class="line-mask"><span>여기서 바로</span></span></h2></div></div>' +
        '<div class="sys-grid rise">' + B.systems.map(sysLink).join('') + '</div>' +
      '</div></section>' +

      '<section class="sec" id="news"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">소식</p><h2 class="anim-up"><span class="line-mask"><span>강원테크노파크 보도자료</span></span></h2></div><a class="link-arr" href="' + B.newsUrl + '" target="_blank" rel="noopener">전체 보기 →</a></div>' +
        '<ul class="news-list rise">' + B.news.map(function (n) { return '<li><a href="' + B.newsUrl + '" target="_blank" rel="noopener"><time>' + n.date.replace(/-/g, '.') + '</time><span>' + esc(n.title) + '</span><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4l6 6-6 6" fill="none" stroke="#002049" stroke-width="2"/></svg></a></li>'; }).join('') + '</ul>' +
      '</div></section>';

    showCity(Object.keys(placeCities)[0]);
    $('#cityTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) showCity(b.dataset.city); });
    $('.gwmap').addEventListener('click', function (e) { var t = e.target.closest('[data-city]'); if (t && placeCities[t.dataset.city]) showCity(t.dataset.city); });
    $$('.sector-list button').forEach(function (b) { b.addEventListener('click', function () { location.hash = '#/notices?s=' + encodeURIComponent(b.dataset.sector); }); });
    heroIntro();
    watch(app);
  }
  function sysLink(s) { return '<a href="' + s.url + '" target="_blank" rel="noopener"><span>' + s.group + '</span><b>' + s.name + '</b></a>'; }
  function showCity(city) {
    $$('#cityTabs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.city === city)); });
    $$('.gwmap .area').forEach(function (p) { p.classList.toggle('on', p.dataset.city === city); });
    var recruit = {};
    ALL.forEach(function (n) { if (!n.list_only && status(n) !== 'closed' && (n.types || []).indexOf('입주 공간') > -1) (n.places || []).forEach(function (p) { recruit[p] = n; }); });
    var box = $('#placeBox');
    box.innerHTML = '<h3>' + city + '</h3><p class="sub">거점 ' + placeCities[city].length + '곳</p><div class="place-cards">' + placeCities[city].map(function (p) {
      var r = recruit[p.name];
      return '<div class="pcard rise">' + (p.img ? '<div class="im"><img src="assets/img/' + p.img + '.jpg" alt="' + esc(p.name) + '" loading="lazy"></div>' : '<div class="im none">사진 준비 전</div>') +
        '<div><h4>' + esc(p.name) + '</h4><p>' + esc(p.addr) + '<br>' + esc(p.area) + ' · ' + esc(p.scale) + '<br>' + esc(p.use) + '</p>' +
        (r ? '<a class="recruit" href="#/notice/' + r.idx + '">입주기업 모집중 →</a>' : '') + '</div></div>';
    }).join('') + '</div>';
    $$('.rise', box).forEach(function (el, i) { if (reduce) { el.classList.add('in'); return; } setTimeout(function () { el.classList.add('in'); }, 60 * i); });
  }
  function heroIntro() {
    var img = $('#heroImg'), panel = $('#heroPanel'), title = $('.hero-title');
    if (!reduce && img.animate) {
      img.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 1800, easing: EASE, fill: 'backwards' });
      title.animate([{ transform: 'translateY(32px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, easing: EASE, fill: 'backwards' });
      panel.animate([{ transform: 'translateX(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 180, easing: EASE, fill: 'backwards' });
    }
    requestAnimationFrame(function () { $('.hero-title h1').classList.add('in'); });
  }

  /* ---------- list page ---------- */
  function renderList(params) {
    var st = { s: params.s ? params.s.split(',') : [], t: params.t ? params.t.split(',') : [], st: params.st ? params.st.split(',') : ['open', 'always', 'unknown'], sort: params.sort || 'deadline' };
    app.innerHTML =
      '<section class="phead"><div class="wrap"><p class="crumb"><a href="#/">홈</a> · 지원사업 공고</p><h1>모집공고</h1><p>마감일·신청 대상·지원 규모를 목록에서 바로 봅니다. 조건을 고르면 해당하는 공고만 남습니다.</p></div></section>' +
      '<div class="wrap lp"><div><button type="button" class="btn line sm filter-toggle" id="fToggle">조건 고르기</button><form class="filters" id="filters" onsubmit="return false"></form></div><div id="listMain"></div></div>';
    var f = $('#filters');
    function counts(key, val) { return ALL.filter(function (n) { return key === 'st' ? statusGroup(n) === val : (n[key === 's' ? 'sectors' : 'types'] || []).indexOf(val) > -1; }).length; }
    function grp(title, key, vals, labels) {
      return '<h3>' + title + '</h3><div class="opts">' + vals.map(function (v, i) {
        return '<label class="chk"><input type="checkbox" data-k="' + key + '" value="' + v + '"' + (st[key].indexOf(v) > -1 ? ' checked' : '') + '><span>' + (labels ? labels[i] : v) + '</span><span class="c">' + counts(key, v) + '</span></label>';
      }).join('') + '</div>';
    }
    f.innerHTML = grp('모집 상태', 'st', ['open', 'always', 'unknown', 'closed'], ['모집중', '상시 모집', '마감일 공고문 확인', '마감']) + grp('분야', 's', B.sectors) + grp('필요한 도움', 't', B.types) + '<button type="button" class="reset" id="fReset">조건 모두 지우기</button>';
    f.addEventListener('change', function () {
      st.s = []; st.t = []; st.st = [];
      $$('input:checked', f).forEach(function (i) { st[i.dataset.k].push(i.value); });
      draw(true); sync();
    });
    $('#fReset').addEventListener('click', function () { $$('input', f).forEach(function (i) { i.checked = false; }); st.s = []; st.t = []; st.st = []; draw(true); sync(); });
    $('#fToggle').addEventListener('click', function () { f.classList.toggle('open'); });
    function sync() {
      var q = [];
      if (st.s.length) q.push('s=' + encodeURIComponent(st.s.join(',')));
      if (st.t.length) q.push('t=' + encodeURIComponent(st.t.join(',')));
      q.push('st=' + st.st.join(','));
      if (st.sort !== 'deadline') q.push('sort=' + st.sort);
      history.replaceState(null, '', '#/notices?' + q.join('&'));
    }
    function draw(anim) {
      var list = ALL.filter(function (n) {
        if (st.st.length && st.st.indexOf(statusGroup(n)) < 0) return false;
        if (st.s.length && !(n.sectors || []).some(function (x) { return st.s.indexOf(x) > -1; })) return false;
        if (st.t.length && !(n.types || []).some(function (x) { return st.t.indexOf(x) > -1; })) return false;
        return true;
      }).sort(st.sort === 'deadline' ? byDeadline : byPosted);
      var main = $('#listMain');
      main.innerHTML = '<div class="sorts" role="group" aria-label="정렬"><button type="button" data-sort="deadline" aria-pressed="' + (st.sort === 'deadline') + '">마감 임박순</button><button type="button" data-sort="posted" aria-pressed="' + (st.sort === 'posted') + '">최근 등록순</button></div>' +
        '<div class="count-bar"><span>조건에 맞는 공고 <span class="n">' + list.length + '</span>건</span><span style="font-weight:500;font-size:14px;opacity:.8">' + fmtDate(B.asOf) + ' 수집</span></div>' +
        (list.length ? '<ul class="nlist">' + list.map(function (n) { return entry(n); }).join('') + '</ul>' : '<p class="empty"><b>조건에 맞는 공고가 없습니다.</b><br>분야나 필요한 도움을 하나 빼 보세요.</p>');
      $$('.sorts button', main).forEach(function (b) { b.addEventListener('click', function () { st.sort = b.dataset.sort; draw(true); sync(); }); });
      $$('.rise', main).forEach(function (el, i) { if (reduce || !anim) { el.classList.add('in'); return; } setTimeout(function () { el.classList.add('in'); }, Math.min(i, 8) * 55); });
    }
    draw(true);
  }
  function statusGroup(n) { return status(n); }

  /* ---------- detail ---------- */
  function renderDetail(idx) {
    var n = ALL.filter(function (x) { return x.idx === idx; })[0];
    if (!n) { location.hash = '#/notices'; return; }
    var st = status(n), t = tel(n.contact);
    var docsKey = 'gwtp-docs-' + n.idx, saved = {};
    try { saved = JSON.parse(localStorage.getItem(docsKey) || '{}'); } catch (e) { }
    var ev = n.evidence || {}, evNames = { apply_end: '접수 마감', regions: '신청 지역', amount: '지원 규모', how: '신청 방법', contact: '문의', target: '신청 대상' };
    var dd = dday(n);
    app.innerHTML =
      '<section class="phead"><div class="wrap"><p class="crumb"><a href="#/">홈</a> · <a href="#/notices">지원사업 공고</a>' + (n.no ? ' · ' + esc(n.no) : '') + '</p>' +
        '<div style="margin-top:14px">' + badge(n) + '</div><h1 class="dt-title">' + esc(n.title) + '</h1><p>' + esc(n.dept) + ' · ' + fmtDate(n.posted) + ' 등록</p></div></section>' +
      '<div class="wrap dt-wrap"><div>' +
        '<div class="onepage rise"><div class="onepage-h"><span>공고 한 장 요약</span><small>공고문에서 옮겨 적었습니다</small></div><dl>' +
          row('누가', esc(n.target || '공고문 확인'), n.regions && n.regions.length ? '지역: ' + esc(n.regions.join(' · ')) : '') +
          row('무엇을', esc(n.benefit || '공고문 확인'), n.types && n.types.length ? esc(n.types.join(' · ')) : '') +
          (n.amount ? row('얼마나', '<span class="big">' + esc(n.amount) + '</span>', n.amount_detail ? esc(n.amount_detail) : '') : '') +
          row('언제까지', '<span class="big">' + esc(deadlineText(n)) + '</span>', (st === 'open' ? (dd === 0 ? '오늘 마감입니다' : '마감까지 ' + dd + '일 남았습니다') : '') + (n.apply_start ? (st === 'open' ? ' · ' : '') + '접수 시작 ' + fmtDate(n.apply_start) : '')) +
          row('어떻게', esc(n.how || '공고문 확인'), '') +
          row('누구에게', esc(n.contact || n.dept), t ? '<a class="tel" href="tel:' + t + '">' + t + ' 전화 걸기</a>' : '') +
        '</dl></div>' +
        (n.docs && n.docs.length ? '<div class="docs rise"><h3>제출 서류 챙기기</h3>' + n.docs.map(function (d, i) { return '<label><input type="checkbox" data-i="' + i + '"' + (saved[i] ? ' checked' : '') + '><span>' + esc(d) + '</span></label>'; }).join('') + '<p class="prog" id="docProg"></p></div>' : '') +
        (n.files && n.files.length ? '<div class="att rise"><h3>첨부 파일 ' + n.files.length + '개</h3><ul>' + n.files.map(function (fl) { var ext = (fl.split('.').pop() || '').toLowerCase(); return '<li><span class="fmt ' + ext + '">' + ext.toUpperCase() + '</span><span>' + esc(fl) + '</span></li>'; }).join('') + '</ul></div>' : '') +
        (Object.keys(ev).length ? '<div class="ev rise"><h3>공고문 원문 문장</h3><details><summary>요약에 옮긴 문장 ' + Object.keys(ev).length + '개 보기 <span>＋</span></summary><ul>' + Object.keys(ev).map(function (k) { return ev[k] ? '<li><b>' + (evNames[k] || k) + '</b>“' + esc(ev[k]) + '”</li>' : ''; }).join('') + '</ul></details></div>' : '') +
      '</div><aside class="dt-side">' +
        '<a class="btn" href="' + esc(n.url) + '" target="_blank" rel="noopener">공고 원문·첨부 받기 <span class="arr">→</span></a>' +
        (n.apply_end ? '<button type="button" class="btn line" id="icsBtn">마감일 내 달력에 넣기</button>' : '') +
        '<button type="button" class="btn line" id="shareBtn">링크 보내기</button>' +
        '<div class="box"><b>비슷한 공고 더 찾기</b>회사 위치와 분야를 고르면 지금 신청할 수 있는 공고만 보여 드립니다.<br><button type="button" class="link-arr" data-open-finder style="margin-top:10px">질문 3개로 찾기 →</button></div>' +
      '</aside></div>';
    function row(k, v, note) { return '<div class="op-row"><dt>' + k + '</dt><dd>' + v + (note ? '<span class="note">' + note + '</span>' : '') + '</dd></div>'; }
    function prog() {
      var p = $('#docProg'); if (!p) return;
      var all = $$('.docs input'), c = all.filter(function (i) { return i.checked; }).length;
      p.textContent = c === all.length ? '서류 ' + all.length + '개를 모두 챙겼습니다.' : '서류 ' + all.length + '개 중 ' + c + '개 챙김 · 이 기기에 저장됩니다';
    }
    $$('.docs input').forEach(function (i) { i.addEventListener('change', function () { saved[i.dataset.i] = i.checked; try { localStorage.setItem(docsKey, JSON.stringify(saved)); } catch (e) { } prog(); }); });
    prog();
    var ics = $('#icsBtn'); if (ics) ics.addEventListener('click', function () { downloadIcs(n); });
    $('#shareBtn').addEventListener('click', function () { share(n.title, location.href); });
    watch(app);
  }
  function downloadIcs(n) {
    var d = n.apply_end.replace(/-/g, ''), e = parseD(n.apply_end); e.setDate(e.getDate() + 1);
    var d2 = e.getFullYear() + ('0' + (e.getMonth() + 1)).slice(-2) + ('0' + e.getDate()).slice(-2);
    var now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GWTP//KO', 'BEGIN:VEVENT', 'UID:gwtp-' + n.idx + '@gwtp', 'DTSTAMP:' + now, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + d2,
      'SUMMARY:[마감] ' + (n.short || n.title), 'DESCRIPTION:' + (n.no ? n.no + ' ' : '') + n.title + ' / ' + n.url, 'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', 'DESCRIPTION:마감 3일 전', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'gwtp-' + (n.no || n.idx) + '-마감.ics';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('마감 3일 전 알림이 들어간 일정 파일을 받았습니다');
  }
  function share(title, url) {
    if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () { }); return; }
    copy(url);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(function () { toast('링크를 복사했습니다'); }); return; }
    var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('링크를 복사했습니다'); } catch (e) { } ta.remove();
  }

  /* ---------- finder ---------- */
  var finder = $('#finder'), fBody = $('#fBody'), fFoot = $('#fFoot'), spread = $('#spread');
  var Q = { r: '', s: '', t: [] }, step = 0, lastFocus = null;
  var SECTOR_HINT = { '모빌리티': '미래차·전기차·수소차 부품', '수소·에너지': '수소·LNG·에너지', '바이오': '천연물·그린바이오·소재', '반도체': '반도체 소모품·부품', '디지털헬스·의료기기': '헬스케어·의료기기', 'ICT·데이터': '소프트웨어·데이터·디지털트윈', '정보보호': '보안 진단·솔루션' };
  function openFinder(fromEl, preset) {
    lastFocus = document.activeElement;
    Q = preset || { r: '', s: '', t: [] };
    step = preset && preset.done ? 3 : 0;
    finder.classList.add('open'); finder.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderStep(false);
    var box = $('.finder-box', finder);
    if (!reduce && fromEl && box.animate) {
      var a = fromEl.getBoundingClientRect(), b = box.getBoundingClientRect();
      var ghost = document.createElement('div');
      ghost.style.cssText = 'position:fixed;z-index:120;background:#1d4bff;left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px;transform-origin:0 0;pointer-events:none';
      document.body.appendChild(ghost);
      box.style.visibility = 'hidden';
      var sx = b.width / a.width, sy = b.height / a.height;
      var anim = ghost.animate([
        { transform: 'translate(0,0) scale(1,1)', background: '#1d4bff' },
        { transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px) scale(' + sx + ',' + sy + ')', background: '#002049' }
      ], { duration: 460, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      anim.onfinish = function () {
        box.style.visibility = '';
        var head = $('.f-head', box).offsetHeight || 64;
        var cut = Math.max(0, 100 - head / b.height * 100);
        ghost.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 ' + cut + '% 0)' }], { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).onfinish = function () { setTimeout(function () { ghost.remove(); }, 400); };
        introQ();
      };
    } else { introQ(); }
    setTimeout(function () { var c = $('.chip, .btn', fBody); if (c) c.focus({ preventScroll: true }); }, 520);
  }
  function closeFinder() {
    finder.classList.remove('open'); finder.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (location.hash.indexOf('#/find') === 0) history.replaceState(null, '', '#/');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function introQ() {
    if (reduce) return;
    var h = $('.f-q h2', fBody);
    if (h) h.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: EASE, fill: 'backwards' });
    $$('.chip, .fmap, .r-list > li, .r-note, .r-more', fBody).forEach(function (c, i) {
      c.animate([{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 120 + Math.min(i, 18) * 22, easing: EASE, fill: 'backwards' });
    });
  }
  function progress() { $$('.f-prog i').forEach(function (i, k) { i.classList.toggle('on', k <= Math.min(step, 2)); }); }
  function renderStep() {
    progress();
    fBody.scrollTop = 0;
    if (step === 0) {
      fBody.innerHTML = '<div class="f-q"><p class="step">질문 1 / 3</p><h2>회사가 어디에 있나요?</h2><p class="hint">본사나 공장이 있는 시군을 골라 주세요. 지도를 눌러도 됩니다.</p></div>' +
        '<div class="f-grid"><div class="chips">' + B.regions.map(function (r) { return '<button type="button" class="chip" data-v="' + r + '" aria-pressed="' + (Q.r === r) + '">' + r + '</button>'; }).join('') + '<button type="button" class="chip wide" data-v="강원 밖" aria-pressed="' + (Q.r === '강원 밖') + '">강원 밖에 있어요 <small>도내 이전·협력을 준비하는 기업</small></button></div>' +
        mapSvg('fmap', { labels: true, labelShift: LABEL_SHIFT }) + '</div>';
      $$('.chip', fBody).forEach(function (c) { c.addEventListener('click', function () { pick('r', c.dataset.v, c); }); });
      $$('.fmap .area', fBody).forEach(function (p) { p.addEventListener('click', function () { var c = $('.chip[data-v="' + p.dataset.city + '"]', fBody); pick('r', p.dataset.city, c || p); }); });
      markMap();
    } else if (step === 1) {
      fBody.innerHTML = '<div class="f-q"><p class="step">질문 2 / 3</p><h2>어떤 분야의 회사인가요?</h2><p class="hint">가장 가까운 것 하나만 고르면 됩니다.</p></div>' +
        '<div class="chips big">' + B.sectors.map(function (s) { return '<button type="button" class="chip" data-v="' + s + '" aria-pressed="' + (Q.s === s) + '">' + s + '<small>' + SECTOR_HINT[s] + '</small></button>'; }).join('') +
        '<button type="button" class="chip" data-v="모름" aria-pressed="' + (Q.s === '모름') + '">잘 모르겠어요<small>분야 상관없이 보기</small></button></div>';
      $$('.chip', fBody).forEach(function (c) { c.addEventListener('click', function () { pick('s', c.dataset.v, c); }); });
    } else if (step === 2) {
      fBody.innerHTML = '<div class="f-q"><p class="step">질문 3 / 3</p><h2>어떤 도움이 필요하세요?</h2><p class="hint">여러 개 골라도 됩니다.</p></div>' +
        '<div class="chips big">' + B.types.map(function (t) { return '<button type="button" class="chip" data-v="' + t + '" aria-pressed="' + (Q.t.indexOf(t) > -1) + '">' + t + '</button>'; }).join('') +
        '<button type="button" class="chip" data-v="전부" aria-pressed="' + (Q.t.indexOf('전부') > -1) + '">전부 보여 주세요</button></div>';
      $$('.chip', fBody).forEach(function (c) { c.addEventListener('click', function () { toggleType(c); }); });
    } else {
      renderResult();
    }
    renderFoot();
  }
  function markMap() {
    $$('.fmap .area', fBody).forEach(function (p) { p.classList.toggle('on', p.dataset.city === Q.r); });
    $$('.fmap .lbl', fBody).forEach(function (l) { l.classList.toggle('on', l.dataset.lbl === Q.r); });
  }
  function renderFoot() {
    var sel = [Q.r, Q.s === '모름' ? '분야 상관없음' : Q.s, Q.t.length ? (Q.t.indexOf('전부') > -1 ? '도움 전부' : Q.t.join('·')) : ''].filter(Boolean);
    if (step < 3) {
      var can = step === 0 ? !!Q.r : step === 1 ? !!Q.s : Q.t.length > 0;
      fFoot.innerHTML = '<p class="sel">' + (sel.length ? '고른 조건 <b>' + esc(sel.join(' · ')) + '</b>' : '조건을 고르면 바로 다음 질문으로 넘어갑니다') + '</p><div class="btns">' +
        (step > 0 ? '<button type="button" class="btn line sm" id="fPrev">이전</button>' : '') +
        (step === 2 ? '<button type="button" class="btn sm" id="fNext"' + (can ? '' : ' disabled') + '>결과 보기 <span class="arr">→</span></button>' : '<button type="button" class="btn sm" id="fNext"' + (can ? '' : ' disabled') + '>다음 <span class="arr">→</span></button>') + '</div>';
    } else {
      fFoot.innerHTML = '<p class="sel">고른 조건 <b>' + esc(sel.join(' · ')) + '</b></p><div class="btns"><button type="button" class="btn line sm" id="fRestart">조건 다시 고르기</button><button type="button" class="btn sm" id="fShare">이 결과 링크 보내기</button></div>';
    }
    var p = $('#fPrev'); if (p) p.addEventListener('click', function () { go(step - 1, p); });
    var n = $('#fNext'); if (n) n.addEventListener('click', function () { if (!n.disabled) go(step + 1, n); });
    var r = $('#fRestart'); if (r) r.addEventListener('click', function () { Q = { r: '', s: '', t: [] }; go(0, r); });
    var sh = $('#fShare'); if (sh) sh.addEventListener('click', function () { share('강원테크노파크 지원사업 찾기 결과', resultUrl()); });
  }
  function resultUrl() { return location.href.split('#')[0] + '#/find?r=' + encodeURIComponent(Q.r) + '&s=' + encodeURIComponent(Q.s) + '&t=' + encodeURIComponent(Q.t.join(',')); }
  function pick(k, v, el) {
    Q[k] = v;
    $$('.chip', fBody).forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.v === v)); });
    if (k === 'r') markMap();
    renderFoot();
    setTimeout(function () { go(step + 1, el); }, reduce ? 0 : 240);
  }
  function toggleType(c) {
    var v = c.dataset.v;
    if (v === '전부') Q.t = Q.t.indexOf('전부') > -1 ? [] : ['전부'];
    else { Q.t = Q.t.filter(function (x) { return x !== '전부'; }); var i = Q.t.indexOf(v); if (i > -1) Q.t.splice(i, 1); else Q.t.push(v); }
    $$('.chip', fBody).forEach(function (b) { b.setAttribute('aria-pressed', String(Q.t.indexOf(b.dataset.v) > -1)); });
    renderFoot();
  }
  var going = false;
  function go(next, fromEl) {
    if (going) return;
    if (reduce || !spread.animate) { step = next; renderStep(); return; }
    going = true;
    var box = $('.finder-box').getBoundingClientRect();
    var r = (fromEl && fromEl.getBoundingClientRect) ? fromEl.getBoundingClientRect() : { left: box.left + box.width / 2, top: box.top + box.height / 2, width: 0, height: 0 };
    var cx = r.left + r.width / 2 - box.left, cy = r.top + r.height / 2 - box.top;
    var far = Math.max(Math.hypot(cx, cy), Math.hypot(box.width - cx, cy), Math.hypot(cx, box.height - cy), Math.hypot(box.width - cx, box.height - cy));
    var bar = $$('.f-prog i')[Math.min(next, 2)].getBoundingClientRect();
    var ex = bar.left + bar.width / 2 - box.left, ey = bar.top + bar.height / 2 - box.top;
    var farE = Math.max(Math.hypot(ex, ey), Math.hypot(box.width - ex, ey), Math.hypot(ex, box.height - ey), Math.hypot(box.width - ex, box.height - ey));
    var a1 = spread.animate([{ clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)' }, { clipPath: 'circle(' + far + 'px at ' + cx + 'px ' + cy + 'px)' }], { duration: 330, easing: 'cubic-bezier(.55,0,.45,1)', fill: 'forwards' });
    a1.onfinish = function () {
      step = next; renderStep();
      var a2 = spread.animate([{ clipPath: 'circle(' + farE + 'px at ' + ex + 'px ' + ey + 'px)' }, { clipPath: 'circle(0px at ' + ex + 'px ' + ey + 'px)' }], { duration: 320, easing: 'cubic-bezier(.55,0,.45,1)', fill: 'forwards' });
      a2.onfinish = function () { going = false; };
      introQ();
    };
  }
  function regionOK(n, r) {
    var regs = n.regions || [];
    if (!r) return true;
    if (!regs.length) return true;
    var wide = regs.some(function (x) { return /도내 전체|강원 전체|전국|제한 없음|지역 제한 없음/.test(x); });
    var out = regs.some(function (x) { return /도외|전국|제한 없음/.test(x); });
    if (r === '강원 밖') return out;
    if (wide) return true;
    return regs.some(function (x) { return x.indexOf(r) > -1 || r.indexOf(x.replace(/\s/g, '')) > -1; });
  }
  function sectorOK(n, s) { if (!s || s === '모름') return true; var ss = n.sectors || []; return ss.indexOf(s) > -1 || ss.indexOf('전 분야') > -1; }
  function typeOK(n, t) { if (!t.length || t.indexOf('전부') > -1) return true; return (n.types || []).some(function (x) { return t.indexOf(x) > -1; }); }
  function renderResult() {
    var pool = ALL.filter(function (n) { return !n.list_only; });
    var live = pool.filter(function (n) { return status(n) !== 'closed'; });
    var hit = live.filter(function (n) { return regionOK(n, Q.r) && sectorOK(n, Q.s) && typeOK(n, Q.t); }).sort(byDeadline);
    var near = live.filter(function (n) { return hit.indexOf(n) < 0 && regionOK(n, Q.r) && (sectorOK(n, Q.s) || typeOK(n, Q.t)); }).sort(byDeadline);
    var closedHit = pool.filter(function (n) { return status(n) === 'closed' && regionOK(n, Q.r) && sectorOK(n, Q.s) && typeOK(n, Q.t); });
    var cond = [Q.r, Q.s === '모름' ? '분야 상관없음' : Q.s, Q.t.indexOf('전부') > -1 ? '필요한 도움 전부' : Q.t.join(' · ')].filter(Boolean);
    fBody.innerHTML = '<div class="f-q r-head"><div><p class="cond"><b>' + esc(cond.join(' / ')) + '</b></p><h2>지금 신청할 수 있는 공고 <span class="num" id="rNum">0</span>건</h2></div></div>' +
      '<p class="r-note">모집중 공고 ' + live.length + '건 가운데 고른 조건에 맞는 것만 남겼습니다.' + (closedHit.length ? ' 조건은 맞지만 이미 마감된 공고 ' + closedHit.length + '건은 뺐습니다.' : '') + '</p>' +
      (hit.length ? '<ul class="nlist r-list">' + hit.map(function (n) { return entry(n, { full: true }); }).join('') + '</ul>' :
        '<p class="empty"><b>지금 딱 맞는 공고는 없습니다.</b><br>아래 비슷한 공고를 보시거나, 필요한 도움을 넓혀 보세요.</p>') +
      (near.length ? '<div class="r-more"><h3>조건을 조금 넓히면 ' + near.length + '건 더</h3><p>지역은 맞고, 분야나 필요한 도움 중 하나가 맞는 공고입니다.</p><ul>' + near.map(function (n) { return '<li><a href="#/notice/' + n.idx + '"><span>' + esc(n.short || n.title) + '</span><em>' + esc(status(n) === 'open' ? fmtShort(n.apply_end) + ' 마감' : status(n) === 'always' ? '상시' : '공고문 확인') + '</em></a></li>'; }).join('') + '</ul></div>' : '');
    $$('.rise', fBody).forEach(function (el) { el.classList.add('in'); });
    var num = $('#rNum'), to = hit.length;
    if (reduce) { num.textContent = to; return; }
    var t0 = performance.now();
    (function f(t) { var p = Math.min(1, (t - t0) / 700); num.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
    $$('.r-list a, .r-more a', fBody).forEach(function (a) { a.addEventListener('click', function () { closeFinder(); }); });
  }
  finder.addEventListener('click', function (e) { if (e.target.closest('[data-close-finder]')) closeFinder(); });
  document.addEventListener('keydown', function (e) {
    if (!finder.classList.contains('open')) return;
    if (e.key === 'Escape') closeFinder();
    if (e.key === 'Tab') {
      var f = $$('button, a[href], input', $('.finder-box')).filter(function (x) { return x.offsetParent !== null && !x.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open-finder]');
    if (b) { e.preventDefault(); openFinder(b); }
  });

  /* ---------- chrome ---------- */
  var sysBtn = $('.sys-btn'), sysPop = $('#sysPop');
  $('#sysGrid').innerHTML = B.systems.map(sysLink).join('');
  $('#mnavSys').innerHTML = B.systems.map(function (s) { return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.name + '</a>'; }).join('');
  sysBtn.addEventListener('click', function () { var o = !sysPop.classList.contains('open'); sysPop.classList.toggle('open', o); sysBtn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.util')) { sysPop.classList.remove('open'); sysBtn.setAttribute('aria-expanded', 'false'); } });
  var mnav = $('#mnav');
  $('#menuBtn').addEventListener('click', function () { mnav.classList.add('open'); document.body.style.overflow = 'hidden'; });
  function closeNav() { mnav.classList.remove('open'); if (!finder.classList.contains('open')) document.body.style.overflow = ''; }
  $('#mnavClose').addEventListener('click', closeNav);
  $$('#mnav nav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  var hd = $('#hd');
  addEventListener('scroll', function () { hd.classList.toggle('scrolled', scrollY > 120); }, { passive: true });

  /* ---------- router ---------- */
  function parseQ(s) { var o = {}; (s || '').split('&').forEach(function (kv) { if (!kv) return; var p = kv.split('='); o[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); }); return o; }
  var lastRoute = '';
  function route() {
    var h = location.hash || '#/';
    var path = h.slice(1).split('?')[0], q = parseQ(h.split('?')[1]);
    var anchor = '';
    if (path.indexOf('/#') === 0) { anchor = path.slice(2); path = '/'; }
    $$('.gnb a').forEach(function (a) { a.removeAttribute('aria-current'); });
    if (path === '/notices') { $('.gnb a[data-nav="notices"]').setAttribute('aria-current', 'page'); }
    var key = path + (path === '/notices' ? '' : JSON.stringify(q));
    if (path === '/find') {
      if (lastRoute.indexOf('/') !== 0 || !$('.hero')) renderHome();
      lastRoute = '/';
      var preset = q.r || q.s || q.t ? { r: q.r || '', s: q.s || '', t: q.t ? q.t.split(',') : [], done: !!(q.r && q.s && q.t) } : null;
      openFinder(null, preset);
      return;
    }
    if (finder.classList.contains('open')) closeFinder();
    if (path.indexOf('/notice/') === 0) { renderDetail(path.split('/')[2]); window.scrollTo(0, 0); }
    else if (path === '/notices') { renderList(q); window.scrollTo(0, 0); }
    else {
      if (lastRoute !== '/' || !$('.hero')) { renderHome(); if (!anchor) window.scrollTo(0, 0); }
      if (anchor) { var t = document.getElementById(anchor); if (t) setTimeout(function () { t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }, 30); }
    }
    lastRoute = path;
  }
  addEventListener('hashchange', route);
  route();
})();
