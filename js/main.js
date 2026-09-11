/* main.js — reads SITE_CONFIG (js/config.js) and drives the whole page */

const domain = SITE_CONFIG.domain || window.location.hostname || "localhost";

/* ================= RENDER FROM CONFIG ================= */
function renderSite(){
  document.title = `${SITE_CONFIG.handle} :: ~/root`;

  document.querySelectorAll("[data-handle]").forEach(el => el.textContent = SITE_CONFIG.handle);
  document.querySelectorAll("[data-domain]").forEach(el => el.textContent = domain);

  document.getElementById("heroTag").textContent = "// " + SITE_CONFIG.tag;
  document.getElementById("heroTitle").textContent = SITE_CONFIG.handle + ".";
  document.getElementById("heroTitle").setAttribute("data-text", SITE_CONFIG.handle + ".");
  document.getElementById("heroBio").textContent = SITE_CONFIG.bio;

  const statRow = document.getElementById("statRow");
  statRow.innerHTML = SITE_CONFIG.stats.map(s =>
    `<div class="stat"><div class="k">${s.k}</div><div class="v">${s.v}</div></div>`
  ).join("") + `<div class="stat"><div class="k">SITE UPTIME</div><div class="v" id="uptime">00:00:00</div></div>`;

  const dirList = document.getElementById("dirList");
  dirList.innerHTML = SITE_CONFIG.projects.map((p, i) => `
    <div class="entry" data-i="${i}">
      <div class="entry-row">
        <div class="perm">${p.perm}</div>
        <div class="fname">${p.name}<span class="ext">${p.ext}</span></div>
        <div class="size">${p.size}</div>
        <div class="date">${p.date}</div>
      </div>
      <div class="entry-body">
        ${p.desc}
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
    </div>
  `).join("");

  const blogList = document.getElementById("blogList");
  blogList.innerHTML = SITE_CONFIG.posts.map((p, i) => `
    <div class="log-entry" data-i="${i}">
      <div class="log-top"><span class="lvl">[${p.level}]</span><span>${p.date}</span><span>${p.category}</span></div>
      <div class="log-title">${p.title}</div>
      <div class="log-body">${p.body}</div>
    </div>
  `).join("");

  const whois = document.getElementById("whoisBody");
  whois.innerHTML = `
    <div class="whois-row"><div class="k">handle</div><div class="v">${SITE_CONFIG.handle}</div></div>
    <div class="whois-row"><div class="k">aliases</div><div class="v">${SITE_CONFIG.aliases.join(", ")}</div></div>
    <div class="whois-row"><div class="k">focus</div><div class="v">${SITE_CONFIG.about.focus}</div></div>
    <div class="whois-row"><div class="k">email</div><div class="v">contact [at] ${domain}</div></div>
    <div class="whois-row"><div class="k">pgp fingerprint</div><div class="v">${SITE_CONFIG.about.pgp}</div></div>
    <div class="whois-row"><div class="k">status</div><div class="v">${SITE_CONFIG.about.status}</div></div>
  `;
  document.getElementById("whoisNote").textContent = SITE_CONFIG.about.note;

  bindEntries();
}

/* ================= BOOT SEQUENCE ================= */
const bootLines = [
  { t: "initializing voidnet kernel...", cls: "" },
  { t: "mounting /dev/sda1 ................ [ OK ]", cls: "ok" },
  { t: "checking filesystem integrity ..... [ OK ]", cls: "ok" },
  { t: "loading encrypted identity vault ..", cls: "" },
  { t: "  > decrypting layer 1 of 3", cls: "" },
  { t: "  > decrypting layer 2 of 3", cls: "" },
  { t: "  > decrypting layer 3 of 3 ........ [ WARN ] partial key", cls: "warn" },
  { t: `resolving host ${domain} ...........`, cls: "" },
  { t: "handshake complete ................ [ OK ]", cls: "ok" },
  { t: "spawning shell for guest@voidnet", cls: "" },
  { t: "", cls: "" },
  { t: "welcome. this terminal is being watched.", cls: "warn" },
];

const bootEl = document.getElementById("bootlines");
const enterPrompt = document.getElementById("enter-prompt");
let li = 0;

function typeLine(){
  if (li >= bootLines.length){
    enterPrompt.classList.add("show");
    return;
  }
  const { t, cls } = bootLines[li];
  const div = document.createElement("div");
  div.className = "line " + cls;
  bootEl.appendChild(div);
  let ci = 0;
  const speed = t.length ? 10 : 0;
  function typeChar(){
    if (ci <= t.length){
      div.textContent = t.slice(0, ci);
      ci++;
      setTimeout(typeChar, speed);
    } else {
      li++;
      setTimeout(typeLine, t.length ? 90 : 40);
    }
  }
  typeChar();
}

function enterSite(){
  if (!enterPrompt.classList.contains("show")) return;
  document.getElementById("flash").classList.add("go");
  document.getElementById("boot").classList.add("hide");
  playBeep(880, 0.05);
  setTimeout(() => {
    document.getElementById("boot").style.display = "none";
    document.getElementById("site").classList.add("show");
    startClock();
    markBooted();
    playRandomTrackOnEnter();
  }, 480);
}

/* ================= BOOT COOLDOWN (skip re-boot within 10s) ================= */
const BOOT_COOLDOWN_MS = 10 * 1000;
const BOOT_KEY = "voidnet_last_boot";

function markBooted(){
  try { localStorage.setItem(BOOT_KEY, String(Date.now())); } catch (e) {}
}

function shouldSkipBoot(){
  try {
    const last = parseInt(localStorage.getItem(BOOT_KEY), 10);
    if (!last) return false;
    return (Date.now() - last) < BOOT_COOLDOWN_MS;
  } catch (e) {
    return false;
  }
}

function skipBootStraightToSite(){
  document.getElementById("boot").style.display = "none";
  document.getElementById("site").classList.add("show");
  startClock();
  markBooted(); // refresh the timestamp so the cooldown window keeps sliding
  playRandomTrackOnEnter();
}

/* ================= MUSIC ON ENTER ================= */
function playRandomTrackOnEnter(){
  if (!window.playerAPI) return;
  window.playerAPI.playRandom();
  // browsers block autoplay-with-sound without a user gesture; if that happens,
  // resume on the first interaction the visitor makes with the page
  const audio = window.playerAPI.audio;
  if (audio && audio.paused){
    const resume = () => {
      audio.play().catch(() => {});
      window.removeEventListener("click", resume);
      window.removeEventListener("keydown", resume);
      window.removeEventListener("touchstart", resume);
    };
    window.addEventListener("click", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    window.addEventListener("touchstart", resume, { once: true });
  }
}

/* ================= CURSOR ================= */
const dot = document.getElementById("curDot");
const ring = document.getElementById("curRing");
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener("mousemove", e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + "px"; dot.style.top = my + "px";
});
(function loop(){
  rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
  ring.style.left = rx + "px"; ring.style.top = ry + "px";
  requestAnimationFrame(loop);
})();
document.addEventListener("mouseover", e => {
  if (e.target.closest("a,button,.entry-row,.log-entry")) ring.classList.add("hot");
});
document.addEventListener("mouseout", e => {
  if (e.target.closest("a,button,.entry-row,.log-entry")) ring.classList.remove("hot");
});

/* ================= AUDIO (synthesized, no external assets) ================= */
let actx;
function ensureCtx(){ if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); }
function playBeep(freq = 440, dur = 0.04){
  ensureCtx();
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.frequency.value = freq; o.type = "square";
  g.gain.value = 0.03;
  o.connect(g); g.connect(actx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
  o.stop(actx.currentTime + dur + 0.02);
}

/* ================= NAV / TABS ================= */
function bindNav(){
  const navBtns = document.querySelectorAll("nav button");
  const panels = document.querySelectorAll(".panel");
  const termline = document.getElementById("termline");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      playBeep(320, 0.03);
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.target;
      panels.forEach(p => p.classList.toggle("active", p.id === "panel-" + target));
      termline.innerHTML = `<span class="prompt">guest@voidnet</span>:<span class="cmd">~$</span> cd ${target}`;
      const h1 = document.querySelector("#panel-" + target + " h1.glitch");
      if (h1){ h1.classList.remove("zap"); void h1.offsetWidth; h1.classList.add("zap"); }
    });
  });
}

/* ================= EXPANDABLE ENTRIES ================= */
function bindEntries(){
  document.querySelectorAll(".entry-row").forEach(row => {
    row.addEventListener("click", () => {
      playBeep(500, 0.02);
      row.closest(".entry").classList.toggle("open");
    });
  });
  document.querySelectorAll(".log-top, .log-title").forEach(el => {
    el.addEventListener("click", () => {
      playBeep(500, 0.02);
      el.closest(".log-entry").classList.toggle("open");
    });
  });
}

/* ================= CLOCK / UPTIME ================= */
const startTime = Date.now();
function startClock(){
  setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById("clock");
    if (clockEl) clockEl.textContent = now.toTimeString().slice(0, 8);
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");
    const up = document.getElementById("uptime");
    if (up) up.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

/* random ambient glitch on the active hero title */
setInterval(() => {
  const h1 = document.querySelector(".panel.active h1.glitch");
  if (h1 && Math.random() > 0.7){
    h1.classList.remove("zap"); void h1.offsetWidth; h1.classList.add("zap");
  }
}, 4000);

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  renderSite();
  bindNav();
  if (window.initPlayer) window.initPlayer();

  if (shouldSkipBoot()){
    skipBootStraightToSite();
    return; // no need to arm the boot-typing / enter-key handlers
  }

  document.getElementById("boot").addEventListener("click", enterSite);
  window.addEventListener("keydown", e => { if (e.key === "Enter") enterSite(); });
  setTimeout(typeLine, 350);
});
