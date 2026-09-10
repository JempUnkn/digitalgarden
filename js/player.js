/*
  player.js
  ---------
  Plays the tracks through Spotify's own official embed player
  (open.spotify.com/embed/track/<id>). We never host or stream the
  audio ourselves - the iframe below belongs to Spotify, we just
  swap which track is loaded into it. Anyone listening needs a
  Spotify account (free tier works, with ads).

  Track list lives in js/config.js under SITE_CONFIG.playlist, so
  swapping songs is a config edit, not a code edit.
*/

function initPlayer(){
  const toggleBtn = document.getElementById("playerToggle");
  const panel = document.getElementById("playerPanel");
  const list = document.getElementById("trackList");
  const embedWrap = document.getElementById("playerEmbed");
  const fallbackWrap = document.getElementById("playerFallback");

  list.innerHTML = SITE_CONFIG.playlist.map((t, i) => `
    <button class="track-row" data-i="${i}">
      ${t.title}
      <small>${t.artist}</small>
    </button>
  `).join("");

  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  list.querySelectorAll(".track-row").forEach(row => {
    row.addEventListener("click", () => {
      list.querySelectorAll(".track-row").forEach(r => r.classList.remove("active"));
      row.classList.add("active");
      const track = SITE_CONFIG.playlist[row.dataset.i];
      loadTrack(track.id);
    });
  });

  function loadTrack(id){
    embedWrap.innerHTML = `
      <iframe class="show"
        src="https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0"
        width="100%" height="152" frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy">
      </iframe>`;
    fallbackWrap.innerHTML = `<a href="https://killer.is-a.dev/redirect/?uri=spotify:track:${id}" target="_blank" rel="noopener">player blank? open this track on open.spotify.com &#8599;</a>`;
  }
}

window.initPlayer = initPlayer;
