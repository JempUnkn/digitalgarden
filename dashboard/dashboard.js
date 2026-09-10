/*
  admin.js
  --------
  There's no backend, no database, nothing running server-side - this
  is a static site. So this panel doesn't "save" anything by itself.
  What it does: load the current js/config.js (already sitting on the
  page since index.html pulls it in), let you edit everything in a
  form, then spit out a brand new config.js file for you to download
  and drop back into js/, overwriting the old one. That's the deploy
  step: replace the file, push, done.
*/

const cfg = JSON.parse(JSON.stringify(SITE_CONFIG)); // working copy

function el(html){
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

/* ---------- basic fields ---------- */
function fillBasics(){
  document.getElementById("f-domain").value = cfg.domain || "";
  document.getElementById("f-handle").value = cfg.handle;
  document.getElementById("f-aliases").value = cfg.aliases.join(", ");
  document.getElementById("f-tag").value = cfg.tag;
  document.getElementById("f-bio").value = cfg.bio;
  document.getElementById("f-focus").value = cfg.about.focus;
  document.getElementById("f-pgp").value = cfg.about.pgp;
  document.getElementById("f-status").value = cfg.about.status;
  document.getElementById("f-note").value = cfg.about.note;
}

/* ---------- generic repeating list builder ---------- */
function buildList(containerId, items, rowBuilder, emptyItem){
  const box = document.getElementById(containerId);
  box.innerHTML = "";
  items.forEach((item, i) => box.appendChild(rowBuilder(item, i)));
  document.getElementById(containerId + "-add").onclick = () => {
    items.push(JSON.parse(JSON.stringify(emptyItem)));
    buildList(containerId, items, rowBuilder, emptyItem);
  };
}

function projectRow(p, i){
  const row = el(`<div class="list-item">
    <button class="rm" type="button">remove</button>
    <div class="field-row">
      <div class="field"><label>name</label><input data-k="name" value="${p.name}"></div>
      <div class="field"><label>extension</label><input data-k="ext" value="${p.ext}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>permissions</label><input data-k="perm" value="${p.perm}"></div>
      <div class="field"><label>size</label><input data-k="size" value="${p.size}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>date</label><input data-k="date" value="${p.date}"></div>
      <div class="field"><label>tags (comma separated)</label><input data-k="tags" value="${p.tags.join(", ")}"></div>
    </div>
    <div class="field"><label>description</label><textarea data-k="desc" rows="2">${p.desc}</textarea></div>
  </div>`);
  bindListItem(row, cfg.projects, i, "dir-list", projectRow, emptyProject());
  return row;
}
function emptyProject(){ return { perm:"-rw-r--r--", name:"new_file", ext:".txt", size:"0 KB", date:"2026-01", desc:"", tags:[] }; }

function postRow(p, i){
  const row = el(`<div class="list-item">
    <button class="rm" type="button">remove</button>
    <div class="field-row">
      <div class="field"><label>level (INFO / WARN)</label><input data-k="level" value="${p.level}"></div>
      <div class="field"><label>category</label><input data-k="category" value="${p.category}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>date</label><input data-k="date" value="${p.date}"></div>
      <div class="field"><label>title</label><input data-k="title" value="${p.title}"></div>
    </div>
    <div class="field"><label>body</label><textarea data-k="body" rows="3">${p.body}</textarea></div>
  </div>`);
  bindListItem(row, cfg.posts, i, "blog-list", postRow, emptyPost());
  return row;
}
function emptyPost(){ return { level:"INFO", date:"2026-01-01", category:"log", title:"untitled entry", body:"" }; }

function trackRow(t, i){
  const row = el(`<div class="list-item">
    <button class="rm" type="button">remove</button>
    <div class="field-row">
      <div class="field"><label>title</label><input data-k="title" value="${t.title}"></div>
      <div class="field"><label>artist</label><input data-k="artist" value="${t.artist}"></div>
    </div>
    <div class="field"><label>spotify track id (from the track URL)</label><input data-k="id" value="${t.id}"></div>
  </div>`);
  bindListItem(row, cfg.playlist, i, "playlist-list", trackRow, emptyTrack());
  return row;
}
function emptyTrack(){ return { title:"track title", artist:"artist", id:"" }; }

function bindListItem(row, arr, i, containerId, rowBuilder, emptyItem){
  row.querySelectorAll("[data-k]").forEach(field => {
    field.addEventListener("input", () => {
      const k = field.dataset.k;
      if (k === "tags") arr[i][k] = field.value.split(",").map(s => s.trim()).filter(Boolean);
      else arr[i][k] = field.value;
    });
  });
  row.querySelector(".rm").addEventListener("click", () => {
    arr.splice(i, 1);
    buildList(containerId, arr, rowBuilder, emptyItem);
  });
}

/* ---------- generate config.js ---------- */
function collectBasics(){
  cfg.domain = document.getElementById("f-domain").value.trim() || null;
  cfg.handle = document.getElementById("f-handle").value.trim();
  cfg.aliases = document.getElementById("f-aliases").value.split(",").map(s => s.trim()).filter(Boolean);
  cfg.tag = document.getElementById("f-tag").value.trim();
  cfg.bio = document.getElementById("f-bio").value.trim();
  cfg.about.focus = document.getElementById("f-focus").value.trim();
  cfg.about.pgp = document.getElementById("f-pgp").value.trim();
  cfg.about.status = document.getElementById("f-status").value.trim();
  cfg.about.note = document.getElementById("f-note").value.trim();
}

function generate(){
  collectBasics();
  const header = `/*
  config.js
  ---------
  Generated by /admin on ${new Date().toISOString().slice(0,10)}.
  Overwrite the project's js/config.js with this file to publish
  these changes. domain is left null unless you set one by hand,
  so the site keeps reading window.location.hostname on its own.
*/

`;
  const body = "const SITE_CONFIG = " + JSON.stringify(cfg, null, 2) + ";\n";
  const text = header + body;
  const out = document.getElementById("output");
  out.value = text;
  document.getElementById("output-box").classList.add("show");
  out.scrollIntoView({ behavior: "smooth", block: "center" });
}

function download(){
  generate();
  const blob = new Blob([document.getElementById("output").value], { type: "text/javascript" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "config.js";
  a.click();
}

function copyOut(){
  generate();
  const out = document.getElementById("output");
  out.select();
  document.execCommand("copy");
}

document.addEventListener("DOMContentLoaded", () => {
  fillBasics();
  buildList("dir-list", cfg.projects, projectRow, emptyProject());
  buildList("blog-list", cfg.posts, postRow, emptyPost());
  buildList("playlist-list", cfg.playlist, trackRow, emptyTrack());
  document.getElementById("generateBtn").addEventListener("click", generate);
  document.getElementById("downloadBtn").addEventListener("click", download);
  document.getElementById("copyBtn").addEventListener("click", copyOut);
});
