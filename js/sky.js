/* Облака-шейдер (из claude/site-clouds-shader.md, перенесено как есть).
   Sky(sel) — мобилка: облака сгущаются на блоке sel — с краёв, потом на весь экран и светлее; уходят после блока.
   Плотность пишется в --c на <html>. Холст встаёт в существующий .sky (фото неба). */
window.Sky = function (casesSel) {
  const clamp = v => Math.max(0, Math.min(1, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const s = document.querySelector('.sky') || (() => { const d = document.createElement('div'); d.className = 'sky'; d.setAttribute('aria-hidden', 'true'); document.body.prepend(d); return d; })();
  const cv = document.createElement('canvas'); cv.className = 'sky__clouds'; s.appendChild(cv);
  let target = 0, den = 0, low = 0, lowT = 0;
  // Палитра: sky = [верх, середина, низ] неба, L/H — свет и тень облаков, stars 0–1. Пишется в --sky-1/2/3 и --stars.
  const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const mixc = (a, b, e) => a.map((v, i) => v + (b[i] - v) * e);
  const DEF = { sky: ['#0a2aa3', '#2453c6', '#3b6ccf'], L: '#fff9ee', H: '#d6c7b3', stars: 0 };
  const prep = pl => ({ sky: pl.sky.map(hx), L: hx(pl.L), H: hx(pl.H), stars: pl.stars || 0 });
  let pal = prep(DEF);
  const css = c => `rgb(${c.map(v => Math.round(v * 255)).join(',')})`;
  // Web: облака живут на всём скролле. stops = [{sel, d, low}] — плотность и «земля» снизу у каждой секции,
  // между секциями значения плавно перетекают (как время суток в scroll-шейдерах).
  const stops = Array.isArray(casesSel) ? casesSel.map(o => ({ ...o, P: prep(o.pal || DEF), el: document.querySelector(o.sel) })).filter(o => o.el) : null;
  if (!stops) pal = prep({ sky: DEF.sky, L: '#ffffff', H: '#cce0ff' });
  const sec = stops ? null : document.querySelector(casesSel), root = document.documentElement;
  const upd = () => { const vh = innerHeight;
    if (stops) { const mid = scrollY + vh / 2;
      const c = stops.map(o => { const r = o.el.getBoundingClientRect(); return scrollY + r.top + r.height / 2; });
      let i = 0; while (i < c.length - 1 && mid > c[i + 1]) i++;
      const k = i >= c.length - 1 ? 0 : clamp((mid - c[i]) / (c[i + 1] - c[i])), e = k; // линейно: без «ступенек» на стыках палитр
      const a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
      target = a.d + (b.d - a.d) * e; lowT = (a.low || 0) + ((b.low || 0) - (a.low || 0)) * e;
      pal = { sky: a.P.sky.map((c, j) => mixc(c, b.P.sky[j], e)), L: mixc(a.P.L, b.P.L, e), H: mixc(a.P.H, b.P.H, e), stars: a.P.stars + (b.P.stars - a.P.stars) * e };
      pal.sky.forEach((c, j) => root.style.setProperty('--sky-' + (j + 1), css(c))); root.style.setProperty('--stars', pal.stars.toFixed(3)); return; }
    const r = sec.getBoundingClientRect();
    const a = clamp((vh * .75 - r.top) / (vh * .6)), b = clamp((r.bottom - vh * .35) / (vh * .55));
    target = Math.min(a, b); };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); addEventListener('load', upd);
  new ResizeObserver(upd).observe(document.body); upd();
  const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) { root.style.setProperty('--c', 0); return; }
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;uniform vec2 R;uniform float T,S,D,G;uniform vec3 L,H;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/R;float asp=R.x/R.y;
 vec2 p=vec2(uv.x*asp,uv.y)*2.2+vec2(11.3,4.7);p.y+=S;p.x+=T*.006;
 vec2 q=vec2(fb(p+vec2(0.,T*.004)),fb(p+vec2(5.2,1.3)));
 float d=fb(p+1.7*q);float d2=fb(p+1.7*q+vec2(.03,.07));
 float cov=mix(.78,.40,D);float c=smoothstep(cov,cov+.2,d);
 float side=abs(uv.x-.5)*2.;float edge=smoothstep(1.05-D*1.5,1.3-D*1.5,side+(d-.5)*.6+(1.-uv.y)*.15*(1.-D));
 float a=c*edge*mix(.85,.98,D);a=a+(1.-a)*D*D*.18;
 float g=smoothstep(.62,.0,uv.y+(d-.5)*.55)*G;a=max(a,smoothstep(.3,.62,d)*g);
 float lit=clamp((d-d2)*7.+.62,0.,1.);
 vec3 col=mix(H,L,lit);
 gl_FragColor=vec4(col*a,a);}`;
  const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = k => gl.getUniformLocation(pr, k), uR = U('R'), uT = U('T'), uS = U('S'), uD = U('D'), uG = U('G'), uL = U('L'), uH = U('H');
  const scale = Math.min(devicePixelRatio || 1, 2) * (innerWidth < 700 ? .5 : .6);
  const size = () => { cv.width = Math.round(innerWidth * scale); cv.height = Math.round(innerHeight * scale); gl.viewport(0, 0, cv.width, cv.height); };
  size(); addEventListener('resize', size);
  const t0 = performance.now();
  (function frame(now) {
    den += (target - den) * (reduce ? 1 : .06); low += (lowT - low) * (reduce ? 1 : .06);
    root.style.setProperty('--c', den.toFixed(3));
    if (den > .005 || low > .005) {
      gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, reduce ? 0 : (now - t0) / 1000);
      gl.uniform1f(uS, scrollY / innerHeight * .25); gl.uniform1f(uD, den); gl.uniform1f(uG, low); gl.uniform3fv(uL, pal.L); gl.uniform3fv(uH, pal.H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); cv.style.opacity = 1;
    } else cv.style.opacity = 0;
    requestAnimationFrame(frame);
  })(t0);
};
