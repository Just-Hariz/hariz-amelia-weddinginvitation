// ================== EDIT YOUR WEDDING DETAILS HERE ==================
const CONFIG = {
  groom: "Hariz",
  bride: "Amelia",
  monogram: ["H", "M"], // initials shown large on the cover, top and closing
  groomFull: "Mohammad Hariz Bin Mohammad Nizam",
  brideFull: "Izreen Amelia binti Mohd Ismail",
  brideFather: "Mohd Ismail Bin Ibrahim",
  brideMother: "Norakuma Binti Hashim",
  quote: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
  quoteSource: "Surah Ar-Rum, 30:21",

  // Hijri date of the event. Calendars differ by a day for this date (23 or 24 Rejab),
  // so check it against the JAKIM takwim (e-solat.gov.my) and correct it here if needed.
  hijri: "24 Rejab 1448H",

  // Local date & time of the event, plus its UTC offset (Malaysia = +08:00).
  // If you change these, also update DTSTART/DTEND in wedding.ics (times there are UTC, i.e. 8 hours earlier).
  start: "2027-01-02T11:00:00+08:00",
  end: "2027-01-02T16:00:00+08:00",

  venueName: "Dewan Majlis Perbandaran Teluk Intan",
  venueAddress: "36000 Teluk Intan, Perak",
  mapQuery: "Dewan Majlis Perbandaran Teluk Intan", // what Google Maps / Waze / Apple Maps search for

  aturcara: [
    ["11:00 pagi", "Ketibaan tetamu & jamuan makan"],
    ["12:30 tengah hari", "Ketibaan pengantin"],
    ["4:00 petang", "Majlis bersurai"],
  ],

  // Song: plays from `start` to `end` (seconds) and loops, so only the chorus is heard.
  // To use your own audio file instead of SoundCloud, put it in assets/ and set `file`.
  song: {
    soundcloud: "https://soundcloud.com/muhamad-taufan-790088273/sampai-jadi-debu-banda-naira?si=eea90aa7a08547e19eadf99b785ba5d9&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    file: "",
    start: 0,
    end: 95,
  },

  rsvpBy: "20 Disember 2026",
  // Paste your Google Apps Script web app URL here (see google-apps-script.gs) to save RSVPs & ucapan
  // into a Google Sheet. Left empty, guests send their RSVP / ucapan to `whatsapp` instead.
  scriptUrl: "",
  whatsapp: "60XXXXXXXXX", // number with country code, no + or dashes

  bank: {
    name: "Maybank",
    account: "151213334682",
    holder: "Izreen Amelia binti Mohd Ismail", // account holder (the bride)
    qr: "assets/qr_mia.png", // DuitNow QR image saved from your banking app
  },

  contacts: [
    { name: "Mohd Ismail Bin Ibrahim", role: "Bapa pengantin perempuan", phone: "60124263500" },
    { name: "Norakuma Binti Hashim", role: "Ibu pengantin perempuan", phone: "60174476615" },
  ],

  autoScrollSpeed: 40, // pixels per second
};
// =====================================================================

const $ = (id) => document.getElementById(id);
// Outline icon from the sprite in index.html, e.g. icon("phone")
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}" /></svg>`;
const startDate = new Date(CONFIG.start);
const endDate = new Date(CONFIG.end);
const TZ = "Asia/Kuala_Lumpur";

// ---- Fill in text ----
const fmtDate = startDate.toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
const values = {
  ...CONFIG,
  dateLong: fmtDate,
  timeRange: `${fmtTime(startDate)} – ${fmtTime(endDate)}`,
  monoGroom: CONFIG.monogram[0],
  monoBride: CONFIG.monogram[1],
  bankName: CONFIG.bank.name,
  bankAccount: CONFIG.bank.account,
  bankHolder: CONFIG.bank.holder,
};
document.querySelectorAll("[data-bind]").forEach((el) => {
  el.textContent = values[el.dataset.bind] ?? "";
});
$("bankHolder").hidden = !CONFIG.bank.holder;

// ---- Monogram alignment ----
// Script capitals have uneven heights and long swashes, so line the letters up by their actual ink:
// each letter's box is made exactly as wide as its ink, and the letters are nudged so their ink
// centres sit on one line (the "&" is centred on the same line).
function alignMonogram(el) {
  const ctx = document.createElement("canvas").getContext("2d");
  const parentSize = parseFloat(getComputedStyle(el).fontSize);
  const parts = [...el.children].map((span) => {
    const cs = getComputedStyle(span);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} 100px ${cs.fontFamily}`;
    const t = ctx.measureText(span.textContent);
    return {
      span,
      k: parseFloat(cs.fontSize) / parentSize, // the "&" is smaller than the letters
      left: t.actualBoundingBoxLeft / 100,
      right: t.actualBoundingBoxRight / 100,
      mid: (t.actualBoundingBoxDescent - t.actualBoundingBoxAscent) / 200, // ink centre vs baseline, in em
    };
  });
  const letters = parts.filter((p) => !p.span.classList.contains("amp"));
  const line = letters.reduce((sum, p) => sum + p.mid * p.k, 0) / letters.length;
  parts.forEach(({ span, k, left, right, mid }) => {
    span.style.width = `${left + right}em`;
    span.style.textIndent = `${left}em`;
    span.style.top = `${(line - mid * k) / k}em`;
  });
}
Promise.all([
  document.fonts.load('100px "Pinyon Script"'),
  document.fonts.load('italic 100px "Playfair Display"'),
]).then(() => document.querySelectorAll(".monogram").forEach(alignMonogram));

// ---- Aturcara ----
const DOTS = ["#c9a24a", "#d98ba0", "#c9a24a", "#d98ba0", "#c9a24a"];
CONFIG.aturcara.forEach(([time, item], i) => {
  const li = document.createElement("li");
  li.style.setProperty("--dot", DOTS[i % DOTS.length]);
  const t = document.createElement("time");
  t.textContent = time;
  const s = document.createElement("span");
  s.textContent = item;
  li.append(t, s);
  $("aturcara").append(li);
});

// ---- Maps & directions ----
const place = encodeURIComponent(CONFIG.mapQuery);
$("mapFrame").src = `https://www.google.com/maps?q=${place}&z=16&output=embed`;
$("gmapsBtn").href = `https://www.google.com/maps/dir/?api=1&destination=${place}`;
$("wazeBtn").href = `https://waze.com/ul?q=${place}&navigate=yes`;
$("appleBtn").href = `https://maps.apple.com/?daddr=${place}`;

// ---- Calendar ----
// Android: Google Calendar link. iOS: wedding.ics (opens "Add to Calendar" once the site is hosted online).
const toCalStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
$("calendarBtn").href =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(`Walimatulurus ${CONFIG.groom} & ${CONFIG.bride}`)}` +
  `&dates=${toCalStamp(startDate)}/${toCalStamp(endDate)}` +
  `&details=${encodeURIComponent(`Majlis perkahwinan ${CONFIG.groom} & ${CONFIG.bride}.\n\nArah: https://www.google.com/maps/dir/?api=1&destination=${place}`)}` +
  `&location=${encodeURIComponent(`${CONFIG.venueName}, ${CONFIG.venueAddress}`)}`;

// ---- Countdown ----
function tick() {
  const diff = Math.max(0, startDate - Date.now());
  const s = Math.floor(diff / 1000);
  $("cd-days").textContent = Math.floor(s / 86400);
  $("cd-hours").textContent = Math.floor((s % 86400) / 3600);
  $("cd-mins").textContent = Math.floor((s % 3600) / 60);
  $("cd-secs").textContent = s % 60;
}
tick();
setInterval(tick, 1000);

// ---- Real flowers ----
// CC0 photos (rawpixel, StockSnap) cut out into assets/flowers.
const FLOWER = (name) => `assets/flowers/${name}.webp`;
const ROSES = ["rose-blush", "rose-pink"];

function bloom(name, vars = {}) {
  const img = document.createElement("img");
  img.src = FLOWER(name);
  img.alt = "";
  img.className = "bloom";
  img.decoding = "async";
  Object.entries(vars).forEach(([k, v]) => img.style.setProperty(`--${k}`, v));
  return img;
}

// Peony sprays in the corners
document.querySelectorAll(".corner").forEach((corner) => corner.append(bloom("peonies")));

// Two crescents of roses framing the monogram on the cover: [angle in degrees, size in px, rose]
const CRESCENT = [
  [196, 34, 1], [214, 54, 0], [236, 44, 1], [255, 32, 0], [271, 24, 1],
  [16, 34, 1], [34, 54, 0], [56, 44, 1], [75, 32, 0], [91, 24, 1],
];
const wreath = $("wreath");
CRESCENT.forEach(([deg, s, r], i) => {
  const a = (deg * Math.PI) / 180;
  wreath.append(bloom(ROSES[r], {
    x: `${50 + 43 * Math.cos(a)}%`,
    y: `${50 + 43 * Math.sin(a)}%`,
    s: `${s}px`,
    r: `${deg}deg`,
    dl: `${-i * 0.5}s`,
  }));
});

// Small trio of roses used as dividers
const ROW = [["rose-pink", 26], ["rose-blush", 40], ["rose-pink", 26]];
document.querySelectorAll(".flower-row").forEach((row) => {
  ROW.forEach(([name, s], i) => row.append(bloom(name, { s: `${s}px`, dl: `${-i * 0.6}s` })));
});

// Rose petals drifting down
const petals = $("petals");
for (let i = 0; i < 16; i++) {
  const p = document.createElement("img");
  p.src = FLOWER(`petal-${(i % 8) + 1}`);
  p.alt = "";
  p.className = "petal";
  const vars = {
    l: `${Math.random() * 100}%`,
    w: `${14 + Math.random() * 12}px`,
    t: `${10 + Math.random() * 9}s`,
    dl: `${-Math.random() * 19}s`,
    sx: `${(Math.random() - 0.5) * 160}px`,
  };
  Object.entries(vars).forEach(([k, v]) => p.style.setProperty(`--${k}`, v));
  petals.append(p);
}

// ---- RSVP & Ucapan ----
// With CONFIG.scriptUrl set, entries are saved to your Google Sheet; otherwise they open WhatsApp.
const whatsappTo = (text) => window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
const sendToSheet = (data) =>
  fetch(CONFIG.scriptUrl, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });

function setStatus(form, text, isError = false) {
  const el = form.querySelector(".form-status");
  el.textContent = text;
  el.classList.toggle("error", isError);
}

const rsvpForm = $("rsvpForm");
rsvpForm.addEventListener("change", () => {
  $("paxField").hidden = rsvpForm.attend.value !== "Hadir";
});
rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = { type: "rsvp", ...Object.fromEntries(new FormData(rsvpForm)) };
  if (data.attend !== "Hadir") data.pax = "0";
  const thanks = data.attend === "Hadir" ? "Terima kasih! Kami nantikan kehadiran anda." : "Terima kasih atas makluman anda.";

  if (!CONFIG.scriptUrl) {
    whatsappTo(`RSVP Walimatulurus ${CONFIG.groom} & ${CONFIG.bride}\nNama: ${data.name}\nTelefon: ${data.phone || "-"}\nKehadiran: ${data.attend}\nBilangan: ${data.pax}`);
    setStatus(rsvpForm, thanks);
    return;
  }
  const btn = rsvpForm.querySelector("button");
  btn.disabled = true;
  try {
    await sendToSheet(data);
    rsvpForm.reset();
    $("paxField").hidden = false;
    setStatus(rsvpForm, thanks);
  } catch {
    setStatus(rsvpForm, "Maaf, tidak dapat dihantar. Sila cuba lagi.", true);
  }
  btn.disabled = false;
});

const wishList = $("wishes");
const TONES = ["#b5566f", "#8f6b22", "#c4687f", "#a8842f", "#b5566f"];
function renderWishes(list) {
  wishList.replaceChildren();
  if (!list.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Jadilah yang pertama menghantar ucapan.";
    wishList.append(p);
    return;
  }
  list.forEach((w, i) => {
    const card = document.createElement("div");
    card.className = "wish";
    card.style.setProperty("--tone", TONES[i % TONES.length]);
    const name = document.createElement("strong");
    name.textContent = w.name;
    const msg = document.createElement("p");
    msg.textContent = w.message;
    card.append(name, msg);
    wishList.append(card);
  });
}
let wishes = [];
renderWishes(wishes);
if (CONFIG.scriptUrl) {
  fetch(CONFIG.scriptUrl)
    .then((r) => r.json())
    .then((list) => { wishes = list; renderWishes(wishes); })
    .catch(() => { });
}

const wishForm = $("wishForm");
wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = { type: "ucapan", ...Object.fromEntries(new FormData(wishForm)) };
  const done = () => {
    wishes = [{ name: data.name, message: data.message }, ...wishes];
    renderWishes(wishes);
    wishForm.reset();
    setStatus(wishForm, CONFIG.scriptUrl
      ? "Terima kasih! Ucapan anda akan dipaparkan selepas disemak."
      : "Terima kasih atas ucapan anda.");
  };

  if (!CONFIG.scriptUrl) {
    whatsappTo(`Ucapan untuk ${CONFIG.groom} & ${CONFIG.bride}\n\n${data.message}\n\n— ${data.name}`);
    done();
    return;
  }
  const btn = wishForm.querySelector("button");
  btn.disabled = true;
  try {
    await sendToSheet(data);
    done();
  } catch {
    setStatus(wishForm, "Maaf, tidak dapat dihantar. Sila cuba lagi.", true);
  }
  btn.disabled = false;
});

// ---- Hadiah ----
const qrImg = $("qrImg");
qrImg.addEventListener("error", () => {
  qrImg.hidden = true;
  $("qrMissing").hidden = false;
});
qrImg.src = CONFIG.bank.qr;

$("copyBtn").addEventListener("click", async () => {
  const btn = $("copyBtn");
  try {
    await navigator.clipboard.writeText(CONFIG.bank.account);
    btn.innerHTML = `${icon("check")} Disalin!`;
  } catch {
    btn.textContent = CONFIG.bank.account;
  }
  setTimeout(() => (btn.innerHTML = `${icon("copy")} Salin No. Akaun`), 2500);
});

// ---- Hubungi ----
CONFIG.contacts.forEach((c) => {
  const row = document.createElement("div");
  row.className = "contact";
  const info = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = c.name;
  const role = document.createElement("small");
  role.textContent = c.role;
  info.append(name, role);
  const call = document.createElement("a");
  call.className = "call";
  call.href = `tel:+${c.phone}`;
  call.innerHTML = icon("phone");
  call.setAttribute("aria-label", `Telefon ${c.name}`);
  const wa = document.createElement("a");
  wa.className = "wa";
  wa.href = `https://wa.me/${c.phone}`;
  wa.target = "_blank";
  wa.rel = "noopener";
  wa.innerHTML = icon("chat");
  wa.setAttribute("aria-label", `WhatsApp ${c.name}`);
  row.append(info, call, wa);
  $("contacts").append(row);
});

// ---- Reveal sections on scroll ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible"));
}, { threshold: 0.15 });
document.querySelectorAll(".section").forEach((s) => io.observe(s));

// ---- Song (chorus only, looping) ----
function soundcloudPlayer({ soundcloud, start, end }) {
  const listeners = [];
  const player = { playing: false, play() { }, pause() { }, onChange: (f) => listeners.push(f) };
  if (typeof SC === "undefined") return player; // SoundCloud script didn't load (offline)

  const iframe = document.createElement("iframe");
  iframe.className = "sc-frame";
  iframe.allow = "autoplay";
  iframe.title = "Lagu latar";
  iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloud)}&auto_play=false&visual=false`;
  document.body.append(iframe);

  const widget = SC.Widget(iframe);
  const E = SC.Widget.Events;
  let ready = false;
  let wanted = false;
  const emit = (playing) => { player.playing = playing; listeners.forEach((f) => f(playing)); };

  widget.bind(E.READY, () => {
    ready = true;
    widget.setVolume(80);
    if (wanted) widget.play();
  });
  widget.bind(E.PLAY, () => emit(true));
  widget.bind(E.PAUSE, () => emit(false));
  widget.bind(E.FINISH, () => { widget.seekTo(start * 1000); widget.play(); });
  widget.bind(E.PLAY_PROGRESS, ({ currentPosition }) => {
    if (currentPosition < start * 1000 - 1500 || currentPosition >= end * 1000) widget.seekTo(start * 1000);
  });

  player.play = () => { wanted = true; if (ready) widget.play(); };
  player.pause = () => { wanted = false; if (ready) widget.pause(); };
  return player;
}

function filePlayer({ file, start, end }) {
  const audio = new Audio(file);
  const listeners = [];
  const player = {
    playing: false,
    play() {
      if (audio.currentTime < start) audio.currentTime = start;
      audio.play().catch(() => { });
    },
    pause: () => audio.pause(),
    onChange: (f) => listeners.push(f),
  };
  const emit = (playing) => { player.playing = playing; listeners.forEach((f) => f(playing)); };
  audio.addEventListener("play", () => emit(true));
  audio.addEventListener("pause", () => emit(false));
  audio.addEventListener("timeupdate", () => { if (audio.currentTime >= end) audio.currentTime = start; });
  audio.addEventListener("ended", () => { audio.currentTime = start; audio.play().catch(() => { }); });
  return player;
}

const song = CONFIG.song.file ? filePlayer(CONFIG.song) : soundcloudPlayer(CONFIG.song);
const musicBtn = $("musicBtn");
function setMusicUI() {
  musicBtn.classList.toggle("spin", song.playing);
  musicBtn.innerHTML = icon(song.playing ? "music" : "music-off");
}
song.onChange(setMusicUI);
musicBtn.addEventListener("click", () => (song.playing ? song.pause() : song.play()));

// ---- Auto scroll ----
// Scrolls slowly down the page; pauses when the guest scrolls/touches, resumes after a few idle seconds.
// Stops completely while the guest is filling in a form or using the bottom menu.
let autoScroll = false;
let userPaused = false;
let idleTimer;
let pos = 0;
let lastT = 0;
const scrollBtn = $("scrollBtn");

function step(t) {
  const dt = lastT ? Math.min(t - lastT, 100) / 1000 : 0;
  lastT = t;
  if (autoScroll && !userPaused) {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (Math.abs(scrollY - pos) > 2) pos = scrollY; // sync if page moved (e.g. anchor jump)
    pos = Math.min(max, pos + CONFIG.autoScrollSpeed * dt);
    scrollTo(0, pos);
    if (pos >= max) setAutoScroll(false);
  }
  requestAnimationFrame(step);
}

function setAutoScroll(on) {
  autoScroll = on;
  pos = scrollY;
  scrollBtn.innerHTML = icon(on ? "pause" : "scroll");
}
scrollBtn.addEventListener("click", () => {
  userPaused = false;
  if (!autoScroll && scrollY >= document.documentElement.scrollHeight - innerHeight - 2) scrollTo(0, 0);
  setAutoScroll(!autoScroll);
});

function onUserInteract() {
  if (!autoScroll) return;
  userPaused = true;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { userPaused = false; pos = scrollY; }, 4000);
}
["wheel", "touchstart", "keydown"].forEach((ev) => addEventListener(ev, onUserInteract, { passive: true }));
document.addEventListener("focusin", (e) => {
  if (e.target.matches("input, textarea, select")) setAutoScroll(false);
});

// ---- Bottom menu ----
document.querySelectorAll(".bottom-nav a").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    setAutoScroll(false);
    document.querySelector(a.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
  });
});

// Highlight the menu item for the section currently on screen
const navLinks = [...document.querySelectorAll(".bottom-nav a")];
const navIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => {
      if (a.getAttribute("href") === `#${e.target.id}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-45% 0px -45% 0px" });
navLinks.forEach((a) => navIO.observe(document.querySelector(a.getAttribute("href"))));

// ---- Open invitation ----
$("openBtn").addEventListener("click", () => {
  $("cover").classList.add("open");
  document.body.classList.remove("locked");
  $("fabs").hidden = false;
  $("bottomNav").hidden = false;
  song.play();
  setMusicUI();
  setTimeout(() => setAutoScroll(true), 1500);
  requestAnimationFrame(step);
});
