/*
  player.js
  ---------
  Local audio player. Tracks live in js/config.js under
  SITE_CONFIG.playlist as a flat list of filenames sitting in
  assets/song/, e.g. "bullish-never sorry.mp3".

  Title/artist are parsed straight from the filename: everything
  before the first "-" is the title, everything after (minus the
  extension) is the artist. No separate metadata, no cover image —
  drop a file in assets/song/, add its name to the playlist array,
  done.

  Playback runs through a single native Audio() object with fully
  custom, terminal-themed controls — no browser chrome, no iframe.
*/

function initPlayer(){
  const toggleBtn = document.getElementById("playerToggle");
  const panel = document.getElementById("playerPanel");
  const list = document.getElementById("trackList");
  const embedWrap = document.getElementById("playerEmbed");
  const fallbackWrap = document.getElementById("playerFallback");

  const audio = new Audio();
  const files = SITE_CONFIG.playlist || [];
  const tracks = files.map(parseTrack);
  let currentIndex = -1;

  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  function parseTrack(file){
    const dot = file.lastIndexOf(".");
    const base = dot > -1 ? file.slice(0, dot) : file;
    const dash = base.indexOf("-");
    const title = dash > -1 ? base.slice(0, dash).trim() : base.trim();
    const artist = dash > -1 ? base.slice(dash + 1).trim() : "";
    return { file, title, artist };
  }

  function renderList(){
    if (!tracks.length){
      list.innerHTML = `<div class="player-empty">no tracks in SITE_CONFIG.playlist</div>`;
      return;
    }
    list.innerHTML = tracks.map((t, i) => `
      <button class="track-row" data-i="${i}">
        <span class="track-icon">♪</span>
        <span class="track-meta">
          ${t.title}
          ${t.artist ? `<small>${t.artist}</small>` : ""}
        </span>
      </button>
    `).join("");
    list.querySelectorAll(".track-row").forEach(row => {
      row.addEventListener("click", () => loadTrack(Number(row.dataset.i)));
    });
  }

  function loadTrack(i){
    currentIndex = i;
    const t = tracks[i];

    list.querySelectorAll(".track-row").forEach(r => r.classList.remove("active"));
    const activeRow = list.querySelector(`.track-row[data-i="${i}"]`);
    if (activeRow) activeRow.classList.add("active");

    audio.src = `assets/song/${encodeURIComponent(t.file)}`;
    audio.play().catch(() => {});
    renderPlayer(t);
  }

  function renderPlayer(t){
    embedWrap.innerHTML = `
      <div class="np-cover np-icon">♪</div>
      <div class="np-info">
        <div class="np-title">${t.title}</div>
        ${t.artist ? `<div class="np-artist">${t.artist}</div>` : ""}
        <div class="np-bar" id="npBar"><div class="np-bar-fill" id="npBarFill"></div></div>
        <div class="np-time">
          <span id="npCur">0:00</span>
          <div class="np-controls">
            <button id="npPrev" type="button" title="previous">⏮</button>
            <button id="npPlay" type="button" title="play/pause">⏸</button>
            <button id="npNext" type="button" title="next">⏭</button>
          </div>
          <span id="npDur">0:00</span>
        </div>
      </div>
    `;
    fallbackWrap.innerHTML = "";
    bindTransport();
  }

  function fmt(sec){
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function bindTransport(){
    const bar = document.getElementById("npBar");
    const fill = document.getElementById("npBarFill");
    const playBtn = document.getElementById("npPlay");
    const curEl = document.getElementById("npCur");
    const durEl = document.getElementById("npDur");

    playBtn.onclick = () => { audio.paused ? audio.play() : audio.pause(); };
    document.getElementById("npPrev").onclick = () => loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
    document.getElementById("npNext").onclick = () => loadTrack((currentIndex + 1) % tracks.length);
    bar.onclick = (e) => {
      if (!audio.duration) return;
      const pct = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
      audio.currentTime = pct * audio.duration;
    };

    audio.onplay = () => { playBtn.textContent = "⏸"; };
    audio.onpause = () => { playBtn.textContent = "▶"; };
    audio.ontimeupdate = () => {
      if (!audio.duration) return;
      fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
      curEl.textContent = fmt(audio.currentTime);
    };
    audio.onloadedmetadata = () => { durEl.textContent = fmt(audio.duration); };
    audio.onended = () => document.getElementById("npNext").click();
  }

  renderList();
}

window.initPlayer = initPlayer;
