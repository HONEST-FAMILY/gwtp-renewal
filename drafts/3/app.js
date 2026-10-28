(function () {
  'use strict';
  var G = window.GW, B = G.base, esc = G.esc;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  var U = 'https://www.gwtp.or.kr/gwtp/';
  var MENU = [
    ['공고안내', '#/notices', [['공지사항', 'bbsNew_list.php?code=sub01a&keyvalue=sub01'], ['모집공고', 'bbsNew_list.php?code=sub01b&keyvalue=sub01'], ['계약공고', 'bbsNew_list.php?code=sub01c&keyvalue=sub01'], ['채용공고', 'bbsNew_list.php?code=sub01d&keyvalue=sub01'], ['타기관소식', 'bbsNew_list.php?code=sub01g&keyvalue=sub01']]],
    ['사업안내', U + 'pageview.php?url=sub02a&keyvalue=sub02', [['지역사업안내', 'pageview.php?url=sub02a&keyvalue=sub02'], ['부서별사업안내', 'pageview.php?url=sub02b&keyvalue=sub02'], ['장비지원', 'pageview.php?url=sub02c&keyvalue=sub02']]],
    ['입주안내', '#/region/원주시', [['입주안내', 'pageview.php?url=sub04a&keyvalue=sub04'], ['입주기업소개', 'pageview.php?url=sub04b&keyvalue=sub04'], ['시설현황', 'pageview.php?url=sub04c&keyvalue=sub04']]],
    ['경영공시', U + 'bbsNew_list.php?code=sub05b&keyvalue=sub05', [['운영계획 및 결과', 'bbsNew_list.php?code=sub05b&keyvalue=sub05'], ['재무정보', 'bbsNew_list.php?code=sub05a&keyvalue=sub05'], ['임직원현황', 'bbsNew_list.php?code=sub05c&keyvalue=sub05'], ['강원TP규정', 'bbsNew_list.php?code=sub05f&keyvalue=sub05'], ['회의록', 'bbsNew_list.php?code=sub05d&keyvalue=sub05'], ['감사결과', 'bbsNew_list.php?code=sub05e&keyvalue=sub05'], ['기부금 모금 및 실적', 'bbsNew_list.php?code=sub05g&keyvalue=sub05']]],
    ['홍보', U + 'bbsNew_list.php?code=sub06b&keyvalue=sub06', [['TP NOW', 'bbsNew_list.php?code=sub06a&keyvalue=sub06'], ['언론보도', 'bbsNew_list.php?code=sub06b&keyvalue=sub06'], ['홍보자료', 'bbsNew_list.php?code=sub06c&keyvalue=sub06'], ['지역정보', 'bbsNew_list.php?code=sub06d&keyvalue=sub06'], ['뉴스레터', 'bbsNew_list.php?code=sub06g&keyvalue=sub06'], ['뉴스레터신청', 'pageview.php?url=sub06h&keyvalue=sub06']]],
    ['TP소개', U + 'pageview.php?url=sub07a&keyvalue=sub07', [['일반현황', 'pageview.php?url=sub07a&keyvalue=sub07'], ['연혁', 'pageview.php?url=sub07d&keyvalue=sub07'], ['인사말', 'pageview.php?url=sub07b&keyvalue=sub07'], ['비전 및 목표', 'pageview.php?url=sub07c&keyvalue=sub07'], ['조직안내', 'pageview.php?url=sub07e&keyvalue=sub07'], ['ESG경영', 'pageview.php?url=sub07f&keyvalue=sub07'], ['찾아오시는 길', 'pageview.php?url=sub07g&keyvalue=sub07']]]
  ];
  // 언론보도 상세(실제 게시물) — base.js news 순서와 같음
  var NEWS_Q = ['aWR4PTM2NDMmc3RhcnRQYWdlPTAmbGlzdE5vPTE4OSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2NDImc3RhcnRQYWdlPTAmbGlzdE5vPTE4OCZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2Mjcmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NyZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2MDEmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NiZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2MDAmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0='];
  var EQ = { url: 'https://eqnet.gwtp.or.kr/', orgs: 29, items: 1143, asOf: '10월 28일' };
  // 지도 지시선 [dx, dy, 글자 방향] — 지도 좌표(1000×885) 기준
  var LEADS = { '춘천시': [-120, -118, 'end'], '홍천군': [118, 34, 'start'], '원주시': [-128, 96, 'end'], '강릉시': [-64, -118, 'end'], '삼척시': [40, 150, 'end'], '태백시': [-110, 92, 'end'] };
  var HUB_ORDER = ['춘천시', '홍천군', '원주시', '강릉시', '태백시', '삼척시'];
  var placesBy = G.placesByCity();
  var recruit = G.recruitingPlaces();
  var ARROW = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h9M7.5 3.5L11 7l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  var EXT = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2h7v7M12 2L4.5 9.5M2 5v7h7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 2400); }
  function badge(n) { var b = G.badge(n); return '<span class="bd ' + b.cls + '">' + esc(b.text) + '</span>'; }
  function cityShort(c) { return c.replace(/(시|군)$/, ''); }
  function sub(u) { return /^https?:|^#/.test(u) ? u : U + u; }
  function ext(u) { return /^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''; }

  /* ---------- header / menu ---------- */
  function gnbHTML() {
    return '<ul>' + MENU.map(function (m) {
      return '<li><a class="top" href="' + sub(m[1]) + '"' + ext(m[1]) + '>' + m[0] + '</a><div class="sub">' + m[2].map(function (s) { return '<a href="' + sub(s[1]) + '" target="_blank" rel="noopener">' + s[0] + '</a>'; }).join('') + '</div></li>';
    }).join('') + '</ul>';
  }
  function headerHTML() {
    return '<header class="hd"><a class="logo" href="#/" aria-label="강원테크노파크 홈"><img src="../assets-shared/img/logo-white.png" alt="재단법인 강원테크노파크" width="183" height="44"></a>' +
      '<nav class="gnb" aria-label="주 메뉴">' + gnbHTML() + '</nav><a class="btn btn--white hd-cta" href="#/region">지원사업 찾기</a>' +
      '<button type="button" class="menu-btn" aria-label="메뉴 열기" aria-controls="mnav" aria-expanded="false"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M3 8h20M3 18h20" stroke="currentColor" stroke-width="2"/></svg></button></header>';
  }
  function setupMenus() {
    $$('.gnb').forEach(function (n) { if (!n.innerHTML.trim()) n.innerHTML = gnbHTML(); });
    $('#mnavBody').innerHTML = MENU.map(function (m) {
      return '<h3><a href="' + sub(m[1]) + '"' + ext(m[1]) + '>' + m[0] + '</a></h3><ul>' + m[2].map(function (s) { return '<li><a href="' + sub(s[1]) + '" target="_blank" rel="noopener">' + s[0] + '</a></li>'; }).join('') + '</ul>';
    }).join('');
    $('#ftMenu').innerHTML = MENU.map(function (m) {
      return '<div><h4>' + m[0] + '</h4>' + m[2].map(function (s) { return '<a href="' + sub(s[1]) + '" target="_blank" rel="noopener">' + s[0] + '</a>'; }).join('') + '</div>';
    }).join('');
    $('#ftAddr').textContent = B.address;
  }
  function openMenu(on) {
    var m = $('#mnav'); m.classList.toggle('on', on); document.body.style.overflow = on ? 'hidden' : '';
    $$('.menu-btn').forEach(function (b) { b.setAttribute('aria-expanded', String(on)); });
    if (on) $('#mnavClose').focus();
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.menu-btn')) { openMenu(true); return; }
    if (e.target.closest('#mnavClose')) { openMenu(false); return; }
    if (e.target.closest('#mnav a')) openMenu(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#mnav').classList.contains('on')) openMenu(false); });

  /* ---------- hero ---------- */
  var HERO_HTML = $('#top').innerHTML;
  function bindHero() {
    var v = $('#heroVideo'), b = $('#pauseBtn');
    if (!v || !b) return;
    if (reduce) { v.removeAttribute('autoplay'); try { v.pause(); } catch (e) { } setPauseIcon(b, true); }
    b.onclick = function () { if (v.paused) { v.play(); setPauseIcon(b, false); } else { v.pause(); setPauseIcon(b, true); } };
  }
  function setPauseIcon(b, paused) {
    b.setAttribute('aria-label', paused ? '영상 재생' : '영상 멈춤');
    b.innerHTML = paused ? '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 8l6 4-6 4z" fill="currentColor"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 8.5v7M14 8.5v7" stroke="currentColor" stroke-width="1.8"/></svg>';
  }

  /* ---------- home ---------- */
  function homeHTML() {
    var live = G.live(), cities = Object.keys(placesBy);
    var sc = G.sectorCounts();
    return '' +
      '<section class="intro" aria-labelledby="introH"><div class="intro-in">' +
      '<h2 id="introH">강원 ' + cities.length + '개 시군 ' + B.places.length + '곳의 거점에서 기업의 기술혁신을 돕습니다</h2>' +
      '<p>' + cities.map(cityShort).join('·') + '의 지원센터와 벤처공장에서 입주 공간과 연구 장비, 사업화 자금, 교육을 연결합니다. 회사가 있는 시군을 고르면 지금 신청할 수 있는 공고만 마감이 가까운 순서로 모아 드립니다.</p>' +
      '<a class="btn btn--navy" href="' + U + 'pageview.php?url=sub07a&keyvalue=sub07" target="_blank" rel="noopener">강원테크노파크 소개</a>' +
      '</div></section>' +
      '<div class="slant"><figure><img src="img/news-3.jpg" alt="2026년 지역 바이오 인프라 확산 세미나 참석자 단체 사진" width="1200" height="675"><figcaption>' + esc(B.news[2].title) + ' · ' + B.news[2].date.replace(/-/g, '.') + '</figcaption></figure></div>' +

      '<section class="sec finder" id="finder" aria-labelledby="finderH"><div class="wrap">' +
      '<div class="sec-h"><div><p class="eyebrow">지역에서 찾기</p><h2 id="finderH">회사가 있는 시군을 누르세요</h2></div><p>그 지역 강원TP 거점 시설과, 지금 신청할 수 있는 공고만 마감 순으로 보여 드립니다. 공고마다 한 장 요약이 붙어 있어 공고문 파일을 열지 않아도 됩니다.</p></div>' +
      '<div class="finder-grid"><div class="map-box"><p class="map-hint"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.5" fill="#002049"/><circle cx="8" cy="8" r="7" fill="none" stroke="#002049"/></svg>점 = 강원TP 거점 (' + cities.length + '개 시군 ' + B.places.length + '곳)</p>' +
      '<div class="gwmap" id="gwmap">' + G.mapSvg({ labels: true }).replace(/viewBox="[^"]*"/, 'viewBox="-12 -12 1024 990"') + '</div>' +
      '<div class="city-chips" id="cityChips">' + B.regions.map(function (c) { return '<button type="button" class="chip" data-city="' + c + '" aria-pressed="false">' + cityShort(c) + (placesBy[c] ? ' <b>' + placesBy[c].length + '</b>' : '') + '</button>'; }).join('') + '</div></div>' +
      '<div class="panel" id="panel" aria-live="polite"></div></div>' +
      '</div></section>' +

      '<section class="sec" id="open" aria-labelledby="openH"><div class="wrap">' +
      '<div class="sec-h"><div><p class="eyebrow">공고안내</p><h2 id="openH">지금 신청할 수 있는 공고 ' + live.length + '건</h2></div><a class="more" href="#/notices">지난 공고까지 전체 보기 ' + ARROW + '</a></div>' +
      '<div class="sector-chips" id="secChips"><button type="button" class="chip" data-s="" aria-pressed="true">전체 <b>' + live.length + '</b></button>' + B.sectors.map(function (s) { return '<button type="button" class="chip" data-s="' + esc(s) + '" aria-pressed="false">' + esc(s) + ' <b>' + sc[s] + '</b></button>'; }).join('') + '</div>' +
      '<div class="ncards" id="ncards"></div></div></section>' +

      '<section class="sec" id="space" aria-labelledby="spaceH" style="padding-top:0"><div class="wrap">' +
      '<div class="sec-h"><div><p class="eyebrow">입주안내</p><h2 id="spaceH">지금 입주 기업을 모집하는 공간</h2></div><a class="more" href="' + U + 'pageview.php?url=sub04c&keyvalue=sub04" target="_blank" rel="noopener">시설현황 ' + EXT + '</a></div>' +
      '<div class="offers">' + offersHTML() + '</div></div></section>' +

      '<section class="sec" id="news" aria-labelledby="newsH" style="padding-top:0"><div class="wrap">' +
      '<div class="sec-h"><div><p class="eyebrow">홍보 · 언론보도</p><h2 id="newsH">강원TP 소식</h2></div><a class="more" href="' + B.newsUrl + '" target="_blank" rel="noopener">언론보도 전체 ' + EXT + '</a></div>' +
      '<div class="news">' + B.news.map(function (n, i) {
        return '<a class="' + (i === 0 ? 'lead-n' : '') + '" href="' + U + 'bbsNew_view.php?bbs_data=' + NEWS_Q[i] + '||" target="_blank" rel="noopener"><div class="ph"><img src="img/news-' + (i + 1) + '.jpg" alt=""></div><time datetime="' + n.date + '">' + n.date.replace(/-/g, '.') + '</time><h4>' + esc(n.title) + '</h4></a>';
      }).join('') + '</div></div></section>' +

      '<section class="sec" id="sites" aria-labelledby="sitesH" style="padding-top:0"><div class="wrap">' +
      '<div class="sec-h"><div><p class="eyebrow">관련 사이트</p><h2 id="sitesH">장비 예약부터 입주기업 지원까지</h2></div></div>' +
      '<div class="sys">' + B.systems.map(function (s) { return '<a href="' + s.url + '" target="_blank" rel="noopener"><span>' + esc(s.group) + '</span><b>' + esc(s.name) + '</b>' + EXT + '</a>'; }).join('') + '</div>' +
      '<div class="eq"><div class="facts" style="margin:0;padding:0;border:0;display:flex;gap:12px 40px;flex-wrap:wrap"><div><b>' + EQ.orgs + '</b><span>강원연구장비 등록기관</span></div><div><b>' + EQ.items.toLocaleString('ko-KR') + '</b><span>공동활용 장비</span></div></div><p>도내 대학·연구기관의 연구장비를 한곳에서 찾고 예약합니다. (G-EQNET 첫 화면, ' + EQ.asOf + ' 기준)</p><a class="btn btn--accent" href="' + EQ.url + '" target="_blank" rel="noopener">강원연구장비 열기</a></div>' +
      '</div></section>';
  }

  function placeBy(name) { for (var i = 0; i < B.places.length; i++) if (B.places[i].name === name) return B.places[i]; return null; }
  function offersHTML() {
    var byNotice = {};
    Object.keys(recruit).forEach(function (pn) { var n = recruit[pn]; (byNotice[n.idx] = byNotice[n.idx] || { n: n, places: [] }).places.push(placeBy(pn)); });
    var ICON = {
      area: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="4" y="4" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 10h20M10 4v20" stroke="currentColor" stroke-width="1" opacity=".5"/></svg>',
      floor: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 22h18M7 22V8l7-4 7 4v14M11 12h6M11 16h6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
      use: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6 8h16v14H6zM10 8V5h8v3M6 14h16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
    };
    return Object.keys(byNotice).map(function (k) {
      var o = byNotice[k], n = o.n, p = o.places.filter(Boolean), p0 = p[0] || {};
      var img = p0.img ? '<img src="../assets-shared/img/' + p0.img + '.jpg" alt="' + esc(p0.name) + ' 전경">' : G.cityShape(p0.city);
      return '<article class="offer"><div class="ph">' + img + badge(n) + '</div><div class="body">' +
        '<p class="city">' + esc(p0.city || '') + ' · ' + p.map(function (x) { return esc(x.name); }).join(' · ') + '</p>' +
        '<h4>' + esc(n.short) + '</h4>' +
        '<div class="icons"><div>' + ICON.area + '<span>면적</span>' + esc((p0.area || '').split(' · ').pop()) + '</div><div>' + ICON.floor + '<span>규모</span>' + esc(p0.scale || '공고문 확인') + '</div><div>' + ICON.use + '<span>용도</span>' + esc(p0.use || '') + '</div></div>' +
        '<p class="note">' + esc(n.no) + ' · ' + esc(G.deadlineText(n)) + '</p>' +
        '<div class="act"><a class="btn btn--navy" href="#/notice/' + n.idx + '">한 장 요약 보기</a><a class="btn btn--line" href="' + n.url + '" target="_blank" rel="noopener">공고 원문 ' + EXT + '</a></div>' +
        '</div></article>';
    }).join('');
  }

  function cardHTML(n) {
    return '<a class="ncard" href="#/notice/' + n.idx + '"><div class="top">' + badge(n) + '<span>' + esc(n.no || '') + '</span></div>' +
      '<h4>' + esc(n.short || n.title) + '</h4>' +
      '<dl><dt>마감</dt><dd>' + esc(G.deadlineText(n)) + '</dd>' + (n.amount ? '<dt>지원</dt><dd>' + esc(n.amount) + '</dd>' : '') + '<dt>담당</dt><dd>' + esc(n.dept || '') + '</dd></dl></a>';
  }
  function renderCards(s) {
    var list = G.live().filter(function (n) { return G.sectorOK(n, s); }).sort(G.byDeadline);
    $('#ncards').innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="empty">이 분야로 지금 신청할 수 있는 공고가 없습니다.</p>';
  }

  /* ---------- map ---------- */
  var state = { city: '', s: '', t: '' };
  function buildMarks() {
    var svg = $('#gwmap svg'), g = $('.marks', svg);
    $$('.area', svg).forEach(function (p) { if (placesBy[p.dataset.city]) p.classList.add('hub'); p.setAttribute('pathLength', '1'); });
    $$('.lbl', svg).forEach(function (t) { if (placesBy[t.dataset.lbl]) t.classList.add('hub'); });
    var html = '';
    HUB_ORDER.forEach(function (city) {
      var a = G.areaBy(city), L = LEADS[city]; if (!a || !L) return;
      var x2 = a.cx + L[0], y2 = a.cy + L[1], dir = L[2] === 'end' ? -1 : 1, x3 = x2 + dir * 36, tx = x3 + dir * 8;
      html += '<g class="mk" data-city="' + city + '" role="button" tabindex="0" aria-label="' + city + ' 거점 ' + placesBy[city].length + '곳 보기">' +
        '<polyline class="lead" points="' + a.cx + ',' + a.cy + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y2 + '" pathLength="1"/>' +
        '<circle class="ring" cx="' + a.cx + '" cy="' + a.cy + '" r="17"/><circle class="dot" cx="' + a.cx + '" cy="' + a.cy + '" r="8"/>' +
        '<text x="' + tx + '" y="' + (y2 + 2) + '" text-anchor="' + L[2] + '" paint-order="stroke" stroke="#F0F6FB" stroke-width="8" stroke-linejoin="round">' +
        '<tspan class="tag-t" x="' + tx + '">' + cityShort(city) + '</tspan><tspan class="tag-s" x="' + tx + '" dy="1.3em">거점 ' + placesBy[city].length + '곳</tspan></text></g>';
    });
    g.innerHTML = html;
  }
  function drawMap() {
    if (reduce || drawMap.done) return; drawMap.done = true;
    var svg = $('#gwmap svg'); if (!svg || !svg.animate) return;
    var E = 'cubic-bezier(.55,.085,0,.99)';
    $$('.area', svg).forEach(function (p, i) {
      p.animate([{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 900, delay: i * 25, easing: E, fill: 'backwards' });
      p.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 500, delay: 500 + i * 25, easing: 'ease-out', fill: 'backwards' });
    });
    $$('.lbl', svg).forEach(function (t) { t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 900, fill: 'backwards' }); });
    $$('.mk', svg).forEach(function (mk, k) {
      var d = 1000 + k * 150, c = $$('circle', mk), a = G.areaBy(mk.dataset.city);
      c.forEach(function (ci) { ci.style.transformOrigin = a.cx + 'px ' + a.cy + 'px'; ci.style.transformBox = 'view-box'; ci.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 420, delay: d, easing: E, fill: 'backwards' }); });
      $('.lead', mk).animate([{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 520, delay: d + 160, easing: E, fill: 'backwards' });
      $$('text', mk).forEach(function (t) { t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: d + 560, easing: 'ease-out', fill: 'backwards' }); });
    });
  }
  function nearestHub(city) {
    var a = G.areaBy(city), best = null, bd = 1e9;
    Object.keys(placesBy).forEach(function (c) { var b = G.areaBy(c); var d = Math.hypot(a.cx - b.cx, a.cy - b.cy); if (d < bd) { bd = d; best = c; } });
    return best;
  }
  function selectCity(city, scroll) {
    if (!city || !G.areaBy(city)) city = '춘천시';
    state.city = city;
    $$('#gwmap .area').forEach(function (p) { p.classList.toggle('on', p.dataset.city === city); });
    $$('#gwmap .lbl').forEach(function (t) { t.classList.toggle('on', t.dataset.lbl === city); });
    $$('#gwmap .mk').forEach(function (m) { m.classList.toggle('on', m.dataset.city === city); });
    $$('#cityChips .chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.city === city)); });
    renderPanel();
    if (scroll) { var f = $('#finder'); if (f) f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  }
  function placeHTML(p) {
    var ph = p.img ? '<img src="../assets-shared/img/' + p.img + '.jpg" alt="' + esc(p.name) + ' 전경">' : G.cityShape(p.city);
    var rec = recruit[p.name] ? '<a class="rec" href="#/notice/' + recruit[p.name].idx + '">입주 모집 중 · ' + esc(recruit[p.name].no) + '</a>' : '';
    return '<li class="place"><div class="ph">' + ph + '</div><div><h4>' + esc(p.name) + '</h4><p>' + (p.area + (p.scale ? ' · ' + p.scale : '')).split(' · ').map(function (x) { return '<span class="nw">' + esc(x) + '</span>'; }).join(' · ') + '</p><p>' + esc(p.use) + '</p>' + rec + '</div></li>';
  }
  function rowHTML(n) {
    var amt = n.amount ? ' · ' + esc(n.amount) : '';
    return '<li><a class="nrow" href="#/notice/' + n.idx + '">' + badge(n) + '<h5>' + esc(n.short || n.title) + '</h5><p>' + esc(G.deadlineText(n)) + amt + '</p><span class="go">한 장 요약 ' + ARROW + '</span></a></li>';
  }
  function renderPanel() {
    var city = state.city, ps = placesBy[city] || [];
    var f = G.find({ r: city, s: state.s, t: state.t ? [state.t] : [] });
    var h = '<div class="panel-h"><h3>' + city + '</h3><p>강원TP 거점 <b>' + ps.length + '곳</b> · 지금 신청할 수 있는 공고 <b>' + f.hit.length + '건</b></p></div>';
    if (ps.length) h += '<p class="sub-h">이 지역 거점 시설</p><ul class="places">' + ps.map(placeHTML).join('') + '</ul>';
    else { var nh = nearestHub(city); h += '<div class="nohub" style="margin-top:20px">' + city + '에는 강원TP 거점 시설이 없습니다. 가장 가까운 거점은 <b>' + nh + '</b>(' + placesBy[nh].map(function (p) { return p.name; }).slice(0, 2).join(', ') + (placesBy[nh].length > 2 ? ' 외' : '') + ')입니다.<br><button type="button" class="btn btn--line" data-city-go="' + nh + '">' + cityShort(nh) + ' 거점 보기</button></div>'; }
    h += '<p class="sub-h">지금 신청할 수 있는 공고 <span>마감이 가까운 순</span></p>' +
      '<div class="filters"><label>분야<select id="fS"><option value="">전체 분야</option>' + B.sectors.map(function (s) { return '<option' + (state.s === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('') + '</select></label>' +
      '<label>필요한 도움<select id="fT"><option value="">전체</option>' + B.types.map(function (s) { return '<option' + (state.t === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('') + '</select></label></div>';
    h += '<ul class="nrows" style="margin-top:14px">' + (f.hit.length ? f.hit.map(rowHTML).join('') : '') + '</ul>';
    if (!f.hit.length) h += '<p class="empty">조건에 딱 맞는 공고가 지금은 없습니다.' + (f.near.length ? ' 조건 하나만 맞는 공고 ' + f.near.length + '건을 아래에 보여 드립니다.' : '') + '</p>' + (f.near.length ? '<ul class="nrows">' + f.near.map(rowHTML).join('') + '</ul>' : '');
    if (f.closed.length) h += '<p class="note" style="margin-top:12px">같은 조건의 마감된 공고 ' + f.closed.length + '건은 <a href="#/notices" style="text-decoration:underline">전체 공고</a>에 있습니다.</p>';
    $('#panel').innerHTML = h;
    $('#fS').onchange = function () { state.s = this.value; renderPanel(); };
    $('#fT').onchange = function () { state.t = this.value; renderPanel(); };
  }
  function bindHome() {
    buildMarks();
    var map = $('#gwmap');
    map.addEventListener('click', function (e) { var t = e.target.closest('[data-city]'); if (t) go('#/region/' + t.dataset.city, true); });
    map.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.mk')) { e.preventDefault(); go('#/region/' + e.target.closest('.mk').dataset.city, true); } });
    $('#cityChips').addEventListener('click', function (e) { var b = e.target.closest('[data-city]'); if (b) go('#/region/' + b.dataset.city, true); });
    $('#panel').addEventListener('click', function (e) { var b = e.target.closest('[data-city-go]'); if (b) go('#/region/' + b.dataset.cityGo, true); });
    $('#secChips').addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (!b) return; $$('#secChips .chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); renderCards(b.dataset.s); });
    renderCards('');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { drawMap(); io.disconnect(); } }); }, { threshold: 0.25 });
      io.observe(map);
    }
  }
  // 해시를 바꾸되, 지도에서 고른 경우엔 화면을 다시 그리지 않고 패널만 바꾼다
  function go(hash, quiet) {
    if (quiet) { history.replaceState(null, '', hash); var m = hash.match(/^#\/region\/(.+)$/); if (m) selectCity(decodeURIComponent(m[1]), false); return; }
    location.hash = hash;
  }

  /* ---------- notice one-pager ---------- */
  function subTop(title, crumbs, meta, extra) {
    return '<section class="subhero"><div class="subhero-frame">' + headerHTML() + '<div class="subhero-body"><p class="crumb">' + crumbs + '</p><h1>' + title + '</h1>' + (meta ? '<div class="meta">' + meta + '</div>' : '') + (extra || '') + '</div></div></section>';
  }
  function q(n, k) { var e = n.evidence && n.evidence[k]; return e ? '<q>공고문: ' + esc(e) + '</q>' : ''; }
  function noticeView(idx) {
    var n = G.byId(idx);
    if (!n) { return { top: subTop('공고를 찾을 수 없습니다', '<a href="#/">홈</a><span>/</span><a href="#/notices">공고안내</a>'), main: '<div class="one"><p class="empty">주소가 바뀌었거나 없는 공고입니다. <a href="#/notices" style="text-decoration:underline">공고 전체 보기</a></p></div>' }; }
    var meta = badge(n) + (n.no ? '<span>' + esc(n.no) + '</span>' : '') + (n.dept ? '<span>' + esc(n.dept) + '</span>' : '') + (n.posted ? '<span>게시 ' + n.posted.replace(/-/g, '.') + '</span>' : '');
    var tel0 = G.tel(n.contact), st0 = G.status(n);
    var quick = (tel0 || (n.apply_end && st0 !== 'closed')) && !n.list_only ? '<div class="quick">' + (tel0 ? '<a class="btn btn--accent" href="tel:' + tel0 + '">전화 걸기</a>' : '') + (n.apply_end && st0 !== 'closed' ? '<button type="button" class="btn btn--glass" data-ics>마감일 달력에 넣기</button>' : '') + '</div>' : '';
    var top = subTop(esc(n.title), '<a href="#/">홈</a><span>/</span><a href="#/notices">공고안내</a><span>/</span><span>한 장 요약</span>', meta, quick);
    if (n.list_only) {
      return { top: top, main: '<div class="one"><div class="one-grid"><div><p class="empty">마감된 지난 공고입니다. 공고문과 첨부 파일은 강원테크노파크 게시판 원문에서 볼 수 있습니다.</p><p style="margin-top:16px"><a class="btn btn--navy" href="' + n.url + '" target="_blank" rel="noopener">공고 원문 보기 ' + EXT + '</a></p></div></div></div>' };
    }
    var phone = G.tel(n.contact), st = G.status(n);
    var regions = (n.regions || []).join(', ');
    var rows = [
      ['누가', '신청 대상', esc(n.target || '공고문 확인') + (regions ? '<br><span class="note">지역: ' + esc(regions) + '</span>' : ''), q(n, 'target') || q(n, 'regions')],
      ['무엇을', '지원 내용', esc(n.benefit || '공고문 확인'), q(n, 'benefit')],
      ['얼마나', '지원 규모', '<span class="big">' + esc(n.amount || '공고문 확인') + '</span>' + (n.amount_detail ? '<br><span class="note">' + esc(n.amount_detail) + '</span>' : ''), q(n, 'amount')],
      ['언제까지', '신청 마감', '<span class="big">' + esc(G.deadlineText(n)) + '</span>' + (n.apply_start ? '<br><span class="note">접수 시작 ' + G.fmtDate(n.apply_start) + '</span>' : '') + (n.apply_end && n.apply_note ? '<br><span class="note">' + esc(n.apply_note) + '</span>' : ''), q(n, 'apply_end')],
      ['어떻게', '신청 방법', esc(n.how || '공고문 확인'), q(n, 'how')],
      ['누구에게', '문의', esc(n.contact || '공고문 확인'), q(n, 'contact')]
    ];
    var sheet = '<dl class="sheet">' + rows.map(function (r) { return '<div><dt>' + r[0] + '<small>' + r[1] + '</small></dt><dd>' + r[2] + r[3] + '</dd></div>'; }).join('') + '</dl>';
    var docs = n.docs || [];
    var side = '<aside class="side"><div class="card"><h3>바로 하기</h3><div class="acts">' +
      (phone ? '<a class="btn btn--accent" href="tel:' + phone + '" id="callBtn"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 2h3l1.5 4-2 1.2a9 9 0 0 0 4.3 4.3L12 9.5l4 1.5v3a2 2 0 0 1-2 2A13 13 0 0 1 2 4a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>전화 걸기 ' + phone + '</a>' : '<button class="btn btn--accent" disabled>전화번호는 공고문 확인</button>') +
      (n.apply_end && st !== 'closed' ? '<button type="button" class="btn btn--navy" id="icsBtn"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="3.5" width="13" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 7.5h13M6 2v3M12 2v3" stroke="currentColor" stroke-width="1.5"/></svg>마감일 달력에 넣기</button>' : '<button class="btn btn--navy" disabled>' + (st === 'always' ? '상시 모집 — 마감일 없음' : '마감일은 공고문 확인') + '</button>') +
      '<a class="btn btn--line" href="' + n.url + '" target="_blank" rel="noopener">공고 원문·첨부 보기 ' + EXT + '</a>' +
      '<button type="button" class="btn btn--line" id="shareBtn">이 요약 링크 보내기</button></div></div>' +
      (docs.length ? '<div class="card"><h3>제출 서류 체크 <span id="docCount"></span></h3><div class="bar"><i id="docBar"></i></div><ul class="docs">' + docs.map(function (d, i) { return '<li><label><input type="checkbox" data-i="' + i + '"><span>' + esc(d) + '</span></label></li>'; }).join('') + '</ul><p class="note" style="margin-top:8px">체크는 이 기기에만 저장됩니다.</p></div>' : '') +
      ((n.files || []).length ? '<div class="card"><h3>첨부 파일 <span>' + (n.attach_formats || []).join('·') + '</span></h3><ul class="files">' + n.files.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>' : '') +
      '</aside>';
    return { top: top, main: '<div class="one"><div class="one-grid"><div>' + sheet + '<p class="note" style="margin-top:16px">공고문에서 옮긴 요약입니다. 신청 전 공고 원문을 꼭 확인하세요.</p><p style="margin-top:20px"><a class="more" href="#/region">다른 공고 찾기 ' + ARROW + '</a></p></div>' + side + '</div></div>', n: n };
  }
  function bindNotice(n) {
    if (!n) return;
    $$('#icsBtn, [data-ics]').forEach(function (b) { b.onclick = function () { G.icsDownload(n, toast); }; });
    var sh = $('#shareBtn'); if (sh) sh.onclick = function () { G.share(n.short || n.title, location.href, toast); };
    var ds = G.docsState(n), boxes = $$('.docs input');
    function upd() { var c = ds.count(), t = (n.docs || []).length; var dc = $('#docCount'); if (dc) dc.textContent = c + ' / ' + t; var bar = $('#docBar'); if (bar) bar.style.width = (t ? c / t * 100 : 0) + '%'; }
    boxes.forEach(function (b) { b.checked = ds.get(+b.dataset.i); b.onchange = function () { ds.set(+b.dataset.i, b.checked); upd(); }; });
    upd();
  }

  /* ---------- 공고 전체 ---------- */
  function listView() {
    var live = G.live().slice().sort(G.byDeadline);
    var closed = G.all.filter(function (n) { return G.status(n) === 'closed'; }).sort(G.byPosted);
    var top = subTop('공고안내', '<a href="#/">홈</a><span>/</span><span>공고안내</span>', '<span>지금 신청할 수 있는 공고 ' + live.length + '건 · 마감된 공고 ' + closed.length + '건</span>');
    var main = '<div class="one"><div class="wrap">' +
      '<div class="sec-h" style="margin-bottom:20px"><div><h2 style="font-size:var(--h3)">지금 신청할 수 있는 공고</h2></div><a class="more" href="#/region">우리 시군으로 좁히기 ' + ARROW + '</a></div>' +
      '<div class="ncards">' + live.map(cardHTML).join('') + '</div>' +
      '<div class="sec-h" style="margin:56px 0 12px"><div><h2 style="font-size:var(--h3)">마감된 공고</h2></div><a class="more" href="' + B.listUrl + '" target="_blank" rel="noopener">모집공고 게시판 ' + EXT + '</a></div>' +
      '<ul class="nrows">' + closed.map(function (n) { return '<li><a class="nrow" href="' + (n.list_only ? n.url + '" target="_blank" rel="noopener' : '#/notice/' + n.idx) + '">' + badge(n) + '<h5>' + esc(n.short || n.title) + '</h5><p>' + esc(n.no || '') + (n.posted ? ' · 게시 ' + n.posted.replace(/-/g, '.') : '') + '</p><span class="go">' + (n.list_only ? '원문 ' + EXT : '한 장 요약 ' + ARROW) + '</span></a></li>'; }).join('') + '</ul>' +
      '</div></div>';
    return { top: top, main: main };
  }

  /* ---------- router ---------- */
  function route() {
    var h = decodeURIComponent(location.hash || '#/');
    var top = $('#top'), main = $('#main'), m;
    openMenu(false);
    if ((m = h.match(/^#\/notice\/(\d+)/))) {
      var v = noticeView(m[1]); top.dataset.view = 'notice'; top.innerHTML = v.top; main.innerHTML = v.main; bindNotice(v.n);
      document.title = (v.n ? (v.n.short || v.n.title) + ' — 한 장 요약 | ' : '') + '강원테크노파크'; window.scrollTo(0, 0); return;
    }
    if (h.indexOf('#/notices') === 0) {
      var l = listView(); top.dataset.view = 'list'; top.innerHTML = l.top; main.innerHTML = l.main; document.title = '공고안내 | 강원테크노파크'; window.scrollTo(0, 0); return;
    }
    var wasHome = top.dataset.view === 'home' && $('#finder');
    if (top.dataset.view !== 'home') { top.innerHTML = HERO_HTML; top.dataset.view = 'home'; }
    $$('#top .gnb').forEach(function (n) { if (!n.innerHTML.trim()) n.innerHTML = gnbHTML(); });
    bindHero();
    if (!wasHome) { main.innerHTML = homeHTML(); bindHome(); }
    document.title = '강원테크노파크';
    m = h.match(/^#\/region(?:\/(.+))?$/);
    if (m) { selectCity(m[1] || state.city || '춘천시', true); }
    else { selectCity(state.city || '춘천시', false); if (!wasHome) window.scrollTo(0, 0); }
  }
  setupMenus();
  window.addEventListener('hashchange', route);
  route();
})();
