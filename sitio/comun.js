/* Funciones compartidas por las tres páginas. No necesitas editar este archivo. */
(function () {
  'use strict';

  var C = window.RF_CONFIG || {};
  var RF = (window.RF = {});
  var TZ = 'America/Mexico_City';
  var VERSION_FIREBASE = '10.12.2';

  RF.config = C;
  RF.evento = Object.assign({
    nombre: 'Reformas Fiscales 2027',
    inicio: '2026-12-03T16:00:00-06:00',
    fin: '2026-12-03T19:30:00-06:00',
    lugar: 'Hotel RIU, Guadalajara',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Hotel+Riu+Plaza+Guadalajara',
    contacto: '',
    avisoPrivacidad: '',
    prefijoFolio: 'RF27'
  }, C.evento || {});
  RF.inicio = new Date(RF.evento.inicio);
  RF.fin = new Date(RF.evento.fin);

  var fb = C.firebase || {};
  RF.demo = !fb.apiKey || /PEGA/i.test(fb.apiKey) || !fb.databaseURL || /PEGA/i.test(fb.databaseURL);

  /* ---------- correos y claves ---------- */
  RF.normalizarCorreo = function (t) { return String(t || '').trim().toLowerCase(); };
  RF.correoValido = function (t) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t); };

  /* Cada invitado se guarda con una clave que sale de su correo (SHA-256).
     Así nadie puede recorrer la lista: solo se lee el registro de quien
     conoce el correo exacto. */
  RF.claveDeCorreo = async function (correo) {
    var datos = new TextEncoder().encode('rf27|' + RF.normalizarCorreo(correo));
    var hash = await crypto.subtle.digest('SHA-256', datos);
    return Array.from(new Uint8Array(hash), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  };

  /* Folio del pase: RF27-XXXXXX, sin 0/O ni 1/I para que no se confundan. */
  var ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  RF.generarFolio = function () {
    var a = new Uint8Array(6);
    crypto.getRandomValues(a);
    return RF.evento.prefijoFolio + '-' + Array.from(a, function (n) { return ALFABETO[n % 32]; }).join('');
  };

  /* Primer nombre para saludar, sin "Lic.", "C.P.", "Ing.", etc. */
  RF.saludo = function (nombre) {
    var partes = String(nombre || '').trim().split(/\s+/);
    var titulos = /^(lic|licda|licenciado|licenciada|l\.?c\.?p|c\.?p\.?c|c\.?p|ing|dr|dra|mtro|mtra|sr|sra|srta|arq|act|don|doña)\.?$/i;
    while (partes.length > 1 && titulos.test(partes[0])) partes.shift();
    return partes[0] || '';
  };

  RF.sinAcentos = function (s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  /* ---------- fechas (hora de Guadalajara) ---------- */
  RF.hhmm = function (d) {
    return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).format(d);
  };
  RF.hora = function (ms) { return RF.hhmm(new Date(ms)) + ' h'; };
  RF.fechaCorta = function (ms) {
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).format(new Date(ms));
  };
  RF.fechaLarga = function (d) {
    var p = {};
    new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p.weekday.charAt(0).toUpperCase() + p.weekday.slice(1) + ' ' + p.day + ' de ' + p.month + ' de ' + p.year;
  };
  RF.horario = function () { return RF.hhmm(RF.inicio) + ' a ' + RF.hhmm(RF.fin) + ' h'; };
  RF.etapa = function (ahora) {
    ahora = ahora || Date.now();
    return ahora < RF.inicio ? 'antes' : ahora <= RF.fin ? 'durante' : 'despues';
  };
  RF.faltante = function (ahora) {
    var s = Math.max(0, Math.floor((RF.inicio - (ahora || Date.now())) / 1000));
    var d = Math.floor(s / 86400); s %= 86400;
    var h = Math.floor(s / 3600); s %= 3600;
    var m = Math.floor(s / 60); s %= 60;
    return { d: d, h: h, m: m, s: s };
  };

  /* ---------- códigos QR (librería qrcode-generator) ---------- */
  RF.qrMatriz = function (texto) {
    var q = window.qrcode(0, 'M');
    q.addData(texto);
    q.make();
    return { n: q.getModuleCount(), oscuro: function (r, c) { return q.isDark(r, c); } };
  };
  RF.qrSvg = function (texto, color) {
    var qr = RF.qrMatriz(texto), m = 2, t = qr.n + m * 2, d = '';
    for (var r = 0; r < qr.n; r++) for (var c = 0; c < qr.n; c++) if (qr.oscuro(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect width="' + t + '" height="' + t + '" fill="#fff"/><path d="' + d + '" fill="' + (color || '#1E2A44') + '"/></svg>';
  };
  /* Dibuja un QR en un lienzo (para descargar como imagen). */
  RF.qrEnLienzo = function (g, texto, x, y, lado, color) {
    var qr = RF.qrMatriz(texto), m = 4, celda = lado / (qr.n + m * 2);
    g.fillStyle = '#FFFFFF';
    g.fillRect(x, y, lado, lado);
    g.fillStyle = color || '#1E2A44';
    for (var r = 0; r < qr.n; r++) for (var c = 0; c < qr.n; c++) if (qr.oscuro(r, c)) {
      g.fillRect(Math.floor(x + (c + m) * celda), Math.floor(y + (r + m) * celda), Math.ceil(celda), Math.ceil(celda));
    }
  };

  /* ---------- DOM seguro (todo texto va como texto, nunca como HTML) ---------- */
  RF.el = function (tag, props) {
    var e = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) agregar(e, arguments[i]);
    return e;
  };
  function agregar(e, h) {
    if (h == null || h === false) return;
    if (Array.isArray(h)) { h.forEach(function (x) { agregar(e, x); }); return; }
    e.append(h instanceof Node ? h : document.createTextNode(String(h)));
  }

  RF.guardar = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  RF.leer = function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  RF.borrar = function (k) { try { localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } };

  RF.bajarArchivo = function (blob, nombre) {
    var url = URL.createObjectURL(blob);
    var a = RF.el('a', { href: url, download: nombre });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  };

  RF.conTiempo = function (promesa, ms) {
    return Promise.race([promesa, new Promise(function (_, no) {
      setTimeout(function () { no(new Error('network-timeout')); }, ms || 15000);
    })]);
  };

  RF.mensajeError = function (e) {
    var c = String((e && (e.code || e.message)) || '');
    if (/auth\/(invalid-credential|wrong-password|user-not-found|invalid-email|invalid-login)/i.test(c)) return 'Correo o contraseña incorrectos.';
    if (/auth\/too-many-requests/i.test(c)) return 'Demasiados intentos. Espera unos minutos y vuelve a intentar.';
    if (/auth\/user-disabled/i.test(c)) return 'Esta cuenta está desactivada.';
    if (/permission|denied/i.test(c)) return 'No hay permiso para esta acción.';
    if (/network|timeout|offline|unavailable|failed to fetch|importing a module/i.test(c)) return 'No hay conexión con el servidor. Revisa tu internet y vuelve a intentar.';
    return 'No se completó la operación. Vuelve a intentar en un momento.';
  };

  /* ---------- Firebase (se carga solo cuando hace falta) ---------- */
  RF.firebase = async function (conAuth) {
    if (RF._fb && (!conAuth || RF._fb.auth)) return RF._fb;
    var base = 'https://www.gstatic.com/firebasejs/' + VERSION_FIREBASE + '/';
    var mods = await Promise.all([
      import(base + 'firebase-app.js'),
      import(base + 'firebase-database.js'),
      conAuth ? import(base + 'firebase-auth.js') : Promise.resolve(null)
    ]);
    var app = mods[0].getApps().length ? mods[0].getApp() : mods[0].initializeApp(C.firebase);
    RF._fb = { app: app, db: mods[1].getDatabase(app), d: mods[1], u: mods[2], auth: mods[2] ? mods[2].getAuth(app) : null };
    return RF._fb;
  };
})();
