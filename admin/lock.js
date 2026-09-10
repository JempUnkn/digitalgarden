/*
  lock.js
  -------
  Read this comment before you trust this file with anything real.

  This is a STATIC site. There is no server here to keep a secret on.
  Whatever runs this check runs inside the visitor's own browser, which
  means a visitor who opens devtools can always read it, step through
  it, or just call the unlock function directly. That's true no matter
  how many layers you wrap around it.

  What the layers below actually buy you:
    1. the password itself is never written down anywhere in this
       project — only a SHA-256 hash of it, so grepping the source
       doesn't hand someone the plaintext.
    2. that hash isn't stored as one obvious string either — it's cut
       into 8 chunks and shuffled, reassembled at runtime.
    3. the comparison doesn't run as a plain `if (a === b)` — it runs
       as a tiny bytecode program on a 40-line VM below, so a quick
       skim of the file doesn't show the logic directly.
    4. wrong guesses get throttled with a growing cooldown.

  What none of this buys you: real security. Anyone patient enough to
  read this file (or just type dashboard/ into the address
  bar and flip one flag in sessionStorage from the console) is in.
  If you ever put something here that actually needs protecting,
  put a real server with real auth in front of it instead.

  -- changing the password --
  Open this page, open devtools console, and run:
      hashPassword("your-new-password")
  It prints a HASH_FRAGMENTS array and a FRAG_ORDER array — paste
  both over the ones below. The default password is "changeme".
*/

//const HASH_FRAGMENTS = ["fe457896","5d188736","5882e58a","6248fc86","63dc7361","0f90a089","057ba03d","6c441048"];
//const FRAG_ORDER = [3,4,6,7,2,5,0,1];
const HASH_FRAGMENTS = ["7b5ce5e8","1367198d","19d8dec0","003ae2a9","68e6e3ef","e721e856","326e8b61","7fb23301"];
const FRAG_ORDER = [6,3,4,2,7,1,0,5];

async function sha256(str){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function reassemble(fragments, order){
  const out = new Array(order.length);
  order.forEach((pos, i) => { out[pos] = fragments[i]; });
  return out.join("");
}

/* dev helper — run hashPassword("...") in the console to rotate the password */
async function hashPassword(pwd){
  const full = await sha256(pwd);
  const chunks = [];
  for (let i = 0; i < full.length; i += 8) chunks.push(full.slice(i, i + 8));
  const order = chunks.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const fragments = order.map(p => chunks[p]);
  console.log("HASH_FRAGMENTS =", JSON.stringify(fragments));
  console.log("FRAG_ORDER =", JSON.stringify(order));
  return { fragments, order };
}
window.hashPassword = hashPassword;

/* ---------------------------------------------------------------
   tiny bytecode VM — the comparison runs as a program, not inline
   --------------------------------------------------------------- */
const OP = { LOAD: 0, HASH: 1, TARGET: 2, EQ: 3, RET: 4 };
const PROGRAM = [
  { op: OP.LOAD },
  { op: OP.HASH },
  { op: OP.TARGET },
  { op: OP.EQ },
  { op: OP.RET },
];

async function runVM(input){
  const reg = { a: null, b: null, r: false };
  for (const inst of PROGRAM){
    switch (inst.op){
      case OP.LOAD:   reg.a = input; break;
      case OP.HASH:   reg.a = await sha256(reg.a); break;
      case OP.TARGET: reg.b = reassemble(HASH_FRAGMENTS, FRAG_ORDER); break;
      case OP.EQ:     reg.r = (reg.a === reg.b); break;
      case OP.RET:    return reg.r;
    }
  }
  return reg.r;
}

/* ---------------------------------------------------------------
   lockout — throttles guesses within this tab's session
   --------------------------------------------------------------- */
const LOCK_KEY = "dash_attempts";

function getAttemptState(){
  try { return JSON.parse(sessionStorage.getItem(LOCK_KEY)) || { count: 0, until: 0 }; }
  catch { return { count: 0, until: 0 }; }
}
function setAttemptState(state){
  sessionStorage.setItem(LOCK_KEY, JSON.stringify(state));
}

function cooldownFor(count){
  // 0-2 free tries, then growing cooldown: 5s, 10s, 20s, 40s...
  if (count < 3) return 0;
  return Math.min(5000 * Math.pow(2, count - 3), 120000);
}

/* ---------------------------------------------------------------
   UI wiring
   --------------------------------------------------------------- */
const form = document.getElementById("lockForm");
const input = document.getElementById("pwInput");
const btn = document.getElementById("unlockBtn");
const status = document.getElementById("lockStatus");
let cooldownTimer = null;

function paintCooldown(){
  const state = getAttemptState();
  const remaining = state.until - Date.now();
  if (remaining > 0){
    input.disabled = true;
    btn.disabled = true;
    status.className = "lock-status err";
    status.textContent = `too many attempts — try again in ${Math.ceil(remaining / 1000)}s`;
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(paintCooldown, 400);
  } else {
    input.disabled = false;
    btn.disabled = false;
    if (status.classList.contains("err") && remaining <= 0) status.textContent = "";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const state = getAttemptState();
  if (state.until > Date.now()) return;

  btn.disabled = true;
  status.className = "lock-status";
  status.textContent = "verifying...";

  const ok = await runVM(input.value);

  if (ok){
    status.className = "lock-status ok";
    status.textContent = "access granted — loading dashboard...";
    sessionStorage.setItem("dash_unlocked", "1");
    sessionStorage.removeItem(LOCK_KEY);
    setTimeout(() => { window.location.href = "../dashboard/"; }, 500);
  } else {
    const next = { count: state.count + 1, until: 0 };
    next.until = Date.now() + cooldownFor(next.count);
    setAttemptState(next);
    status.className = "lock-status err";
    status.textContent = "access denied";
    input.value = "";
    btn.disabled = false;
    paintCooldown();
  }
});

paintCooldown();
