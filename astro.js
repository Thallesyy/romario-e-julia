/* ============================================================
   astro.js , as contas do céu
   posições reais de estrelas, sol, lua e planetas para um
   lugar e um instante. precisão de fração de grau, que é
   bem mais do que o olho consegue perceber.
   ============================================================ */
(function(raiz){
"use strict";

var RAD = Math.PI / 180;
var GRAU = 180 / Math.PI;

function norm360(x){ x = x % 360; return x < 0 ? x + 360 : x; }

function diaJuliano(data){ return data.getTime() / 86400000 + 2440587.5; }

/* tempo sideral local, em graus */
function tempoSideral(jd, lonLeste){
  var d = jd - 2451545.0;
  var T = d / 36525;
  var gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - T * T * T / 38710000;
  return norm360(gmst + lonLeste);
}

/* precessão das coordenadas J2000 para a data (Meeus, cap. 21) */
function preparaPrecessao(jd){
  var T = (jd - 2451545.0) / 36525;
  var zeta  = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T * T * T) / 3600 * RAD;
  var z     = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T * T * T) / 3600 * RAD;
  var theta = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T * T * T) / 3600 * RAD;
  return { zeta: zeta, z: z, ct: Math.cos(theta), st: Math.sin(theta) };
}

function precessar(p, ra, dec){
  var a = ra * RAD + p.zeta, d = dec * RAD;
  var cd = Math.cos(d), sd = Math.sin(d);
  var A = cd * Math.sin(a);
  var B = p.ct * cd * Math.cos(a) - p.st * sd;
  var C = p.st * cd * Math.cos(a) + p.ct * sd;
  return { ra: norm360((Math.atan2(A, B) + p.z) * GRAU), dec: Math.asin(C) * GRAU };
}

/* equatorial -> horizontal. azimute a partir do norte, girando para o leste */
function horizontal(ra, dec, lst, lat){
  var H = (lst - ra) * RAD, d = dec * RAD, f = lat * RAD;
  var sAlt = Math.sin(f) * Math.sin(d) + Math.cos(f) * Math.cos(d) * Math.cos(H);
  var alt = Math.asin(Math.max(-1, Math.min(1, sAlt)));
  var az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(f) - Math.cos(d) * Math.sin(f) * Math.cos(H));
  return { alt: alt * GRAU, az: norm360(az * GRAU) };
}

/* direção no mundo 3d: y para cima, norte em -z, leste em +x */
function vetor(alt, az){
  var a = alt * RAD, z = az * RAD;
  return [Math.cos(a) * Math.sin(z), Math.sin(a), -Math.cos(a) * Math.cos(z)];
}

function eclipticaParaEquatorial(lon, lat, eps){
  var l = lon * RAD, b = lat * RAD, e = eps * RAD;
  var ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  var dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  return { ra: norm360(ra * GRAU), dec: dec * GRAU };
}

function obliquidade(jd){ return 23.439291 - 0.0130042 * (jd - 2451545.0) / 36525; }

/* sol, baixa precisão (~0.01°) , coordenadas da data */
function sol(jd){
  var n = jd - 2451545.0;
  var L = norm360(280.460 + 0.9856474 * n);
  var g = norm360(357.528 + 0.9856003 * n) * RAD;
  var lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
  var eq = eclipticaParaEquatorial(lambda, 0, obliquidade(jd));
  eq.lambda = lambda;
  return eq;
}

/* lua, baixa precisão (~0.3°) , coordenadas da data, geocêntricas */
function lua(jd){
  var T = (jd - 2451545.0) / 36525;
  function s(a, b){ return Math.sin((a + b * T) * RAD); }
  function c(a, b){ return Math.cos((a + b * T) * RAD); }
  var lambda = 218.32 + 481267.881 * T
    + 6.29 * s(135.0, 477198.87) - 1.27 * s(259.3, -413335.36)
    + 0.66 * s(235.7, 890534.22) + 0.21 * s(269.9, 954397.74)
    - 0.19 * s(357.5, 35999.05)  - 0.11 * s(186.5, 966404.03);
  var beta = 5.13 * s(93.3, 483202.02) + 0.28 * s(228.2, 960400.89)
    - 0.28 * s(318.3, 6003.15) - 0.17 * s(217.6, -407332.21);
  var paralaxe = 0.9508 + 0.0518 * c(135.0, 477198.87) + 0.0095 * c(259.3, -413335.36)
    + 0.0078 * c(235.7, 890534.22) + 0.0028 * c(269.9, 954397.74);
  var eq = eclipticaParaEquatorial(norm360(lambda), beta, obliquidade(jd));
  eq.lambda = norm360(lambda);
  eq.beta = beta;
  eq.paralaxe = paralaxe;
  return eq;
}

/* planetas: elementos keplerianos aproximados (Standish, JPL), válidos 1800-2050 */
var ELEMENTOS = {
  mercurio: [[0.38709927, 0.20563593, 7.00497902, 252.25032350,  77.45779628,  48.33076593],
             [0.00000037, 0.00001906,-0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus:    [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718,  76.67984255],
             [0.00000390,-0.00004107,-0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  terra:    [[1.00000261, 0.01671123,-0.00001531, 100.46457166, 102.93768193,   0.0],
             [0.00000562,-0.00004392,-0.01294668, 35999.37244981, 0.32327364,  0.0]],
  marte:    [[1.52371034, 0.09339410, 1.84969142,  -4.55343205, -23.94362959,  49.55953891],
             [0.00001847, 0.00007882,-0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter:  [[5.20288700, 0.04838624, 1.30439695,  34.39644051,  14.72847983, 100.47390909],
             [-0.00011607,-0.00013253,-0.00183714, 3034.74612775, 0.21252668,  0.20469106]],
  saturno:  [[9.53667594, 0.05386179, 2.48599187,  49.95424423,  92.59887831, 113.66242448],
             [-0.00125060,-0.00050991, 0.00193609, 1222.49362201,-0.41897216, -0.28867794]]
};

function posicaoHeliocentrica(nome, T){
  var el = ELEMENTOS[nome];
  var a = el[0][0] + el[1][0] * T;
  var e = el[0][1] + el[1][1] * T;
  var I = (el[0][2] + el[1][2] * T) * RAD;
  var L = el[0][3] + el[1][3] * T;
  var peri = el[0][4] + el[1][4] * T;
  var no = el[0][5] + el[1][5] * T;
  var w = (peri - no) * RAD;
  var O = no * RAD;
  var M = norm360(L - peri);
  if (M > 180) M -= 360;
  M *= RAD;
  var E = M + e * Math.sin(M);
  for (var i = 0; i < 12; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  var xp = a * (Math.cos(E) - e);
  var yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  var cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    (sw * sI) * xp + (cw * sI) * yp
  ];
}

/* devolve ra/dec J2000 geocêntricos */
function planeta(nome, jd){
  var T = (jd - 2451545.0) / 36525;
  var p = posicaoHeliocentrica(nome, T);
  var t = posicaoHeliocentrica('terra', T);
  var x = p[0] - t[0], y = p[1] - t[1], z = p[2] - t[2];
  var e = 23.43928 * RAD;
  var ye = y * Math.cos(e) - z * Math.sin(e);
  var ze = y * Math.sin(e) + z * Math.cos(e);
  return {
    ra: norm360(Math.atan2(ye, x) * GRAU),
    dec: Math.atan2(ze, Math.sqrt(x * x + ye * ye)) * GRAU,
    dist: Math.sqrt(x * x + y * y + z * z)
  };
}

/* ---------- tudo junto: o céu de um lugar num instante ---------- */
function montarCeu(opcoes){
  var jd = diaJuliano(opcoes.data);
  var lst = tempoSideral(jd, opcoes.lon);
  var prec = preparaPrecessao(jd);
  var lat = opcoes.lat;

  function daJ2000(ra, dec){
    var p = precessar(prec, ra, dec);
    return horizontal(p.ra, p.dec, lst, lat);
  }
  function daData(ra, dec){ return horizontal(ra, dec, lst, lat); }

  var s = sol(jd);
  var hSol = daData(s.ra, s.dec);

  var l = lua(jd);
  var hLua = daData(l.ra, l.dec);
  hLua.alt -= l.paralaxe * Math.cos(hLua.alt * RAD); // a lua vista daqui, e não do centro da terra
  var elong = Math.acos(
    Math.cos(l.beta * RAD) * Math.cos((l.lambda - s.lambda) * RAD)
  ) * GRAU;
  var fracao = (1 - Math.cos(elong * RAD)) / 2;
  var crescente = norm360(l.lambda - s.lambda) < 180;

  var planetas = {};
  ['mercurio', 'venus', 'marte', 'jupiter', 'saturno'].forEach(function(n){
    var p = planeta(n, jd);
    planetas[n] = daJ2000(p.ra, p.dec);
    planetas[n].dist = p.dist;
  });

  return {
    jd: jd, lst: lst,
    daJ2000: daJ2000,
    sol: hSol,
    lua: { alt: hLua.alt, az: hLua.az, fracao: fracao, elongacao: elong, crescente: crescente },
    planetas: planetas
  };
}

/* ---------- via láctea: coordenadas galácticas -> J2000 ---------- */
var GAL = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [ 0.4941094279, -0.4448296300,  0.7469822445],
  [-0.8676661490, -0.1980763734,  0.4559837762]
];
function galacticaParaJ2000(l, b){
  var cl = Math.cos(l * RAD), sl = Math.sin(l * RAD), cb = Math.cos(b * RAD), sb = Math.sin(b * RAD);
  var g = [cb * cl, cb * sl, sb];
  var x = GAL[0][0] * g[0] + GAL[1][0] * g[1] + GAL[2][0] * g[2];
  var y = GAL[0][1] * g[0] + GAL[1][1] * g[1] + GAL[2][1] * g[2];
  var z = GAL[0][2] * g[0] + GAL[1][2] * g[1] + GAL[2][2] * g[2];
  return { ra: norm360(Math.atan2(y, x) * GRAU), dec: Math.asin(z) * GRAU };
}

/* cor aproximada de uma estrela a partir do índice B-V */
function corDaEstrela(bv){
  bv = Math.max(-0.4, Math.min(2.0, bv));
  var r, g, b, t;
  if (bv < 0.0)      { t = (bv + 0.4) / 0.4; r = 0.61 + 0.39 * t; g = 0.70 + 0.27 * t; b = 1.0; }
  else if (bv < 0.4) { t = bv / 0.4;         r = 1.0; g = 0.97 - 0.03 * t; b = 1.0 - 0.13 * t; }
  else if (bv < 1.1) { t = (bv - 0.4) / 0.7; r = 1.0; g = 0.94 - 0.16 * t; b = 0.87 - 0.37 * t; }
  else               { t = (bv - 1.1) / 0.9; r = 1.0; g = 0.78 - 0.20 * t; b = 0.50 - 0.22 * t; }
  return [r, g, b];
}

var ASTRO = {
  montarCeu: montarCeu,
  vetor: vetor,
  galacticaParaJ2000: galacticaParaJ2000,
  corDaEstrela: corDaEstrela,
  _interno: { diaJuliano: diaJuliano, tempoSideral: tempoSideral, sol: sol, lua: lua, planeta: planeta, precessar: precessar, preparaPrecessao: preparaPrecessao }
};

if (typeof module !== 'undefined' && module.exports) module.exports = ASTRO;
else raiz.ASTRO = ASTRO;

})(this);
