/* 첫 화면 등고선 지도 — 그려지며 들어오고, 시군을 고르면 그쪽으로 다가가 노랗게 답한다 */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var T = window.GW_TOPO, M = window.GW_MAP, G = window.GW;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero, form, box, svg, cam, lvG, bdG, hlG, clipP, selP, tag, lead, leadP, leadC;
  var levels = [], subs = [];
  var st = { city: '', s: 1, x: 0, y: 0 }, camAnim = null, seq = 0;

  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function lenOf(d) {
    var n = d.match(/-?\d+(?:\.\d+)?/g) || [], L = 0;
    for (var i = 2; i + 1 < n.length; i += 2) { var dx = n[i] - n[i - 2], dy = n[i + 1] - n[i - 1]; L += Math.sqrt(dx * dx + dy * dy); }
    return L;
  }
  function bboxOf(d) {
    var n = d.match(/-?\d+(?:\.\d+)?/g) || [], x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (var i = 0; i + 1 < n.length; i += 2) { var x = +n[i], y = +n[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
  }

  function build() {
    svg = el('svg', { viewBox: '0 0 ' + T.w + ' ' + T.h, preserveAspectRatio: 'xMidYMid meet', focusable: 'false' });
    var defs = el('defs', {}), cp = el('clipPath', { id: 'cityClip' });
    clipP = el('path', { d: '' }); cp.appendChild(clipP); defs.appendChild(cp); svg.appendChild(defs);
    cam = el('g', { id: 'cam' }); lvG = el('g', { 'class': 'lv' }); bdG = el('g', { 'class': 'bd' });
    hlG = el('g', { 'class': 'hl', 'clip-path': 'url(#cityClip)' }); selP = el('path', { 'class': 'sel', d: '' });
    var live = T.levels.filter(function (l) { return l.d; }), n = live.length;
    live.forEach(function (l, i) {
      var p = el('path', { d: l.d, 'class': 'c' + (l.lev % 500 === 0 ? ' b' : '') });
      p.style.opacity = (0.15 + 0.55 * i / (n - 1)).toFixed(3); // 낮은 곳 0.15 → 높은 곳 0.7
      lvG.appendChild(p); levels.push(p);
      var list = l.d.split('M').filter(Boolean).map(function (s) { var b = bboxOf(s); b.d = 'M' + s; b.len = lenOf(s); return b; });
      var tot = 0, mx = 0; list.forEach(function (x) { tot += x.len; if (x.len > mx) mx = x.len; });
      p._pl = mx > 0 ? (tot / mx) : 1; // 점선 1칸 = 그 레벨에서 가장 긴 고리 → 모든 고리가 같은 펜 속도로 그려짐
      subs.push(list);
    });
    M.areas.forEach(function (a) { bdG.appendChild(el('path', { d: a.d })); });
    cam.appendChild(lvG); cam.appendChild(bdG); cam.appendChild(hlG); cam.appendChild(selP);
    svg.appendChild(cam); box.appendChild(svg);
  }

  /* 들어올 때: 낮은 고도부터 차례로 그려짐(레벨마다 path 하나) */
  function draw() {
    if (reduce || !levels[0].animate) return Promise.resolve();
    var step = 72, dur = 760, mid = null, last = null, k = Math.floor(levels.length * 0.55);
    levels.forEach(function (p, i) {
      p.setAttribute('pathLength', p._pl.toFixed(4));
      p.style.strokeDasharray = '1 2'; p.style.strokeLinecap = 'butt';
      var a = p.animate([{ strokeDashoffset: 1.01 }, { strokeDashoffset: 0 }], { duration: dur, delay: i * step, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'both' });
      if (i === k) mid = a; last = a;
    });
    last.finished.then(function () {
      levels.forEach(function (p) { p.getAnimations().forEach(function (a) { a.cancel(); }); p.style.strokeDasharray = ''; p.style.strokeLinecap = ''; p.removeAttribute('pathLength'); });
    }).catch(function () { });
    return mid.finished.catch(function () { });
  }

  /* 고른 시군 안의 등고선만 노랗게(시군 경로를 clipPath로) */
  function highlight(city) {
    hlG.textContent = '';
    if (!city) { clipP.setAttribute('d', ''); selP.setAttribute('d', ''); return; }
    var a = G.areaBy(city), b = bboxOf(a.d), n = subs.length;
    clipP.setAttribute('d', a.d); selP.setAttribute('d', a.d);
    subs.forEach(function (list, i) {
      var d = list.filter(function (s) { return s.x1 >= b.x0 && s.x0 <= b.x1 && s.y1 >= b.y0 && s.y0 <= b.y1; }).map(function (s) { return s.d; }).join('');
      if (!d) return;
      var p = el('path', { d: d, 'class': 'c' + (levels[i].classList.contains('b') ? ' b' : '') });
      p.style.opacity = (0.45 + 0.55 * i / (n - 1)).toFixed(3);
      hlG.appendChild(p);
    });
  }

  function textRect() { var r = document.createRange(); r.selectNodeContents(hero.querySelector('.hero-t')); return r.getBoundingClientRect(); }
  function wide() { return innerWidth >= 1024; }
  /* viewBox 단위 → 화면 px (meet 여백 반영) */
  function geo() {
    var r = svg.getBoundingClientRect(), k = Math.min(r.width / T.w, r.height / T.h);
    return { k: k, ox: r.left + (r.width - T.w * k) / 2, oy: r.top + (r.height - T.h * k) / 2 };
  }
  function target(city) {
    if (!city || reduce) return { s: 1, x: 0, y: 0 };
    var a = G.areaBy(city), b = bboxOf(a.d), g = geo();
    var hr = hero.getBoundingClientRect(), pr = form.getBoundingClientRect(), br = box.getBoundingClientRect();
    var fx, fy, zoneH, zoneW;
    if (wide()) { // 첫 화면 오른쪽 절반 가운데, 높이의 60~70%
      var top = hr.top, bottom = pr.top - 24;
      fx = hr.left + hr.width * 0.75; fy = (top + bottom) / 2;
      zoneH = Math.min(hr.height * 0.66, bottom - top - 16); zoneW = hr.width * 0.42;
    } else { // 폰·태블릿: 지도 띠 안
      fx = br.left + br.width / 2; fy = br.top + br.height / 2;
      zoneH = br.height * 0.74; zoneW = br.width * 0.5;
    }
    var s = Math.min(zoneH / ((b.y1 - b.y0) * g.k), zoneW / ((b.x1 - b.x0) * g.k), 9);
    s = Math.max(1.15, s);
    var mx = (b.x0 + b.x1) / 2, my = (b.y0 + b.y1) / 2;
    return { s: s, x: (fx - g.ox) / g.k - s * mx, y: (fy - g.oy) / g.k - s * my };
  }
  function tf(t) { return 'translate(' + t.x.toFixed(2) + 'px,' + t.y.toFixed(2) + 'px) scale(' + t.s.toFixed(4) + ')'; }
  function moveCam(t, animate) {
    var from = getComputedStyle(cam).transform;
    if (camAnim) { camAnim.cancel(); camAnim = null; }
    st.s = t.s; st.x = t.x; st.y = t.y;
    var to = tf(t);
    cam.style.transform = to;
    if (!animate || reduce || !cam.animate) return Promise.resolve(true);
    camAnim = cam.animate([{ transform: from === 'none' ? 'translate(0px,0px) scale(1)' : from }, { transform: to }], { duration: 860, easing: 'cubic-bezier(.3,.6,.12,1)' });
    var mine = camAnim;
    return mine.finished.then(function () { if (camAnim === mine) camAnim = null; return true; }, function () { return false; });
  }
  function fade(node, delay) {
    if (reduce || !node.animate) { node.style.opacity = 1; return; }
    node.style.opacity = 1;
    node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: delay || 0, easing: 'ease-out', fill: 'backwards' });
  }
  /* PC: 제목과 겹치는 부분의 선은 더 어둡게 */
  function shade() {
    if (!wide()) { box.style.removeProperty('--sh1'); box.style.removeProperty('--sh2'); return; }
    var br = box.getBoundingClientRect(), tr = textRect(), e = tr.right - br.left;
    box.style.setProperty('--sh1', Math.max(0, e - 110).toFixed(0) + 'px');
    box.style.setProperty('--sh2', Math.max(10, e + 40).toFixed(0) + 'px');
  }
  function hit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }

  /* 이름표 + 지시선: 그 시군 옆에, 글자와 안 겹치는 자리 */
  function place(city, animate) {
    if (!city) { tag.classList.remove('on'); lead.classList.remove('on'); return; }
    var a = G.areaBy(city), b = bboxOf(a.d), g = geo(), hr = hero.getBoundingClientRect(), br = box.getBoundingClientRect(), pr = form.getBoundingClientRect();
    var X = function (v) { return g.ox + g.k * (st.x + st.s * v); }, Y = function (v) { return g.oy + g.k * (st.y + st.s * v); };
    var cx = X(a.cx), cy = Y(a.cy), sx0 = X(b.x0), sx1 = X(b.x1), sy0 = Y(b.y0), sy1 = Y(b.y1);
    var places = (G.placesByCity()[city] || []).length, cnt = G.find({ r: city }).hit.length;
    tag.innerHTML = '<b>' + G.esc(city) + '</b>' + (places ? ' · 강원TP 거점 ' + places + '곳' : '') + ' · 신청 가능 공고 ' + cnt + '건';
    tag.style.left = '0px'; tag.style.top = '0px'; tag.classList.add('on');
    var w = tag.offsetWidth, h = tag.offsetHeight;
    var minY = (wide() ? hr.top : br.top) + 6, maxY = (wide() ? pr.top : br.bottom) - 6 - h;
    var texts = [textRect()].concat(Array.prototype.map.call(hero.querySelectorAll('.tabs, .live'), function (n) { return n.getBoundingClientRect(); }));
    var cy0 = Math.min(Math.max(cy - h / 2, minY), maxY);
    var cands = [
      { l: sx1 + 18, t: cy0 }, { l: sx0 - 18 - w, t: cy0 },
      { l: Math.min(sx1, hr.right - 10) - w, t: Math.max(sy0 - h - 10, minY) },
      { l: Math.min(sx1, hr.right - 10) - w, t: Math.min(sy1 + 10, maxY) },
      { l: hr.right - 10 - w, t: minY }
    ];
    var pick = cands[cands.length - 1];
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i], rc = { left: c.l, right: c.l + w, top: c.t, bottom: c.t + h };
      if (c.l < hr.left + 8 || c.l + w > hr.right - 8 || c.t < minY - 1 || c.t > maxY + 1) continue;
      if (texts.some(function (t) { return hit(rc, { left: t.left - 6, right: t.right + 6, top: t.top - 4, bottom: t.bottom + 4 }); })) continue;
      pick = c; break;
    }
    tag.style.left = (pick.l - hr.left).toFixed(1) + 'px'; tag.style.top = (pick.t - hr.top).toFixed(1) + 'px';
    var ax = pick.l + w / 2 < cx ? pick.l + w : pick.l, ay = pick.t + h / 2;
    if (cx > pick.l && cx < pick.l + w) { ax = Math.min(Math.max(cx, pick.l + 12), pick.l + w - 12); ay = cy > pick.t ? pick.t + h : pick.t; }
    leadP.setAttribute('d', 'M' + (ax - hr.left).toFixed(1) + ',' + (ay - hr.top).toFixed(1) + 'L' + (cx - hr.left).toFixed(1) + ',' + (cy - hr.top).toFixed(1));
    leadC.setAttribute('cx', (cx - hr.left).toFixed(1)); leadC.setAttribute('cy', (cy - hr.top).toFixed(1));
    lead.classList.add('on');
    if (animate && !reduce && leadP.animate) {
      leadP.animate([{ strokeDashoffset: 1.01 }, { strokeDashoffset: 0 }], { duration: 380, easing: 'ease-out', fill: 'backwards' });
      leadC.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 300, fill: 'backwards' });
      tag.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out', fill: 'backwards' });
    }
  }

  function pick(city) {
    if (city === '강원 밖') city = '';
    if (city === st.city) return;
    st.city = city; var my = ++seq;
    tag.classList.remove('on'); lead.classList.remove('on');
    box.classList.toggle('picked', !!city); // 나머지 등고선은 0.2로 물러남
    highlight(city);
    hlG.style.opacity = 0; selP.style.opacity = 0;
    if (city) { fade(selP, reduce ? 0 : 380); fade(hlG, reduce ? 0 : 420); }
    moveCam(target(city), true).then(function (ok) { if (ok && my === seq) place(city, true); });
  }
  function layout() {
    if (!svg) return;
    shade();
    moveCam(target(st.city), false);
    if (st.city) place(st.city, false);
  }

  /* 숫자 자릿수 굴림 */
  function roll(node, n) {
    var s = String(n);
    if (node._len !== s.length) {
      var strip = '<span class="dg" aria-hidden="true"><span class="st"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i></span></span>';
      node.innerHTML = new Array(s.length + 1).join(strip); node._len = s.length;
      void node.offsetWidth;
    }
    node.setAttribute('aria-label', s);
    var sts = node.querySelectorAll('.st');
    s.split('').forEach(function (c, i) { sts[i].style.transitionDelay = ((s.length - 1 - i) * 70) + 'ms'; sts[i].style.transform = 'translateY(' + (-10 * c) + '%)'; });
  }

  /* 화면 밖이면 멈춤 */
  function watch() {
    if (!('IntersectionObserver' in window) || !hero.getAnimations) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        hero.getAnimations({ subtree: true }).forEach(function (a) {
          if (!e.isIntersecting && a.playState === 'running') { a.pause(); a._off = true; }
          else if (e.isIntersecting && a._off) { a._off = false; a.play(); }
        });
      });
    }).observe(hero);
  }

  window.HeroMap = {
    init: function (o) {
      window.__mapInitAt = performance.now();
      hero = o.hero; form = o.form; box = o.box; tag = o.tag; lead = o.lead;
      leadP = lead.querySelector('path'); leadC = lead.querySelector('circle');
      build(); watch(); shade();
      var ready = draw();
      var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
      return ready;
    },
    pick: pick, layout: layout, roll: roll
  };
})();
