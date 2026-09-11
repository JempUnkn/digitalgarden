/*
  config.js
  ---------
  Every piece of text the site shows lives here. Change a value, save,
  reload the page - nothing else in the project needs to change.

  Don't want to open this file by hand every time? Open /admin, fill
  the form, hit "generate config.js", and it'll hand you a fresh copy
  of this exact file with your changes baked in. Drop it in js/ and
  overwrite this one.

  domain: leave it null and the site reads window.location.hostname
  on its own, so moving to a new domain never means touching code.
  Set it manually only if you want to force a specific string (say,
  you're testing on localhost but want the site to display something
  else).
*/

const SITE_CONFIG = {
  domain: null,

  handle: "K1LL3R",
  aliases: ["K1LL3R", "0xNull"],

  tag: "partially encrypted identity — last sync 3 days ago",

  bio: "Independent researcher working the line between reverse engineering, offensive security and systems that probably shouldn't have been exposed to the internet in the first place. This place is a living dossier: part portfolio, part field log, part archive I still haven't decided whether to release in full.",

  stats: [
    { k: "CVEs REPORTED", v: "07" },
    { k: "BINARIES TAKEN APART", v: "120+" }
  ],

  projects: [
    {
      perm: "-rwxr-x--",
      name: "packet_wraith",
      ext: ".bin",
      size: "2.4 MB",
      date: "2026-06",
      desc: "Passive sniffer that fingerprints encrypted traffic through timing analysis. Plain C, zero dependencies, built to run on whatever old hardware happens to be lying around.",
      tags: ["c", "networking", "forensics"]
    },
    {
      perm: "-rw-r--r--",
      name: "unpacker_core",
      ext: ".py",
      size: "890 KB",
      date: "2026-03",
      desc: "Automated unpacking framework for binaries wrapped in custom packers. Finds the OEP through decreasing-entropy heuristics instead of hardcoded signatures.",
      tags: ["python", "reversing"]
    },
    {
      perm: "-rwx------",
      name: "ghost_shell",
      ext: ".sh",
      size: "14 KB",
      date: "2025-12",
      desc: "A set of hardening and cleanup scripts for isolated lab environments. Strictly educational, strictly defensive - nothing here touches a system that isn't mine.",
      tags: ["bash", "opsec"]
    },
    {
      perm: "-rw-r--r--",
      name: "signal_atlas",
      ext: ".log",
      size: "3.1 MB",
      date: "2025-09",
      desc: "A homegrown database of malware signatures pulled from a couple of honeypots I run at home, normalized into YARA rules as they come in.",
      tags: ["yara", "malware"]
    }
  ],

  posts: [
    {
      level: "INFO",
      date: "2026-08-14",
      category: "writeup",
      title: "Taking apart a commercial crypter in 40 minutes",
      body: "A walkthrough of how I found the in-memory decryption routine inside a crypter being sold on an underground forum, including the exact spot where its anti-debug checks quietly gave up. Published for educational purposes only - the sample itself isn't shared."
    },
    {
      level: "WARN",
      date: "2026-07-02",
      category: "opinion",
      title: "Why 'security through obscurity' still fools good people",
      body: "Some thoughts on teams that mistake obfuscation for real security, and how much that costs once someone finally sits down and actually looks."
    },
    {
      level: "INFO",
      date: "2026-05-19",
      category: "lab",
      title: "Building a cheap honeypot with a Raspberry Pi",
      body: "How I set up a low-cost honeypot on my home network to collect brute-force attempts and start spotting patterns in who's knocking and how."
    }
  ],

  about: {
    focus: "reverse engineering · offensive security",
    pgp: "1A2B 3C4D 5E6F 7890 ABCD · EF12 3456 7890 ABCD EF12",
    status: "open to short collaborations",
    note: "First contact goes through email, PGP-signed. If it's sensitive, say so in the first line and we'll move somewhere better."
  },

  /*
    playlist: filenames sitting in assets/song/. Title/artist are
    parsed from the name itself: "title-artist.mp3" — everything
    before the first "-" is the title, everything after (minus the
    extension) is the artist. Any audio extension the browser can
    play works (.mp3, .m4a, .wav, .ogg).
  */
  playlist: [
    "never sorry (hardtekk)-bullish.mp3",
    "paparazzi (agartha hardstyle slowed)-fearz.mp3",
    "tek it (hardtekk tiktok version)-4cyzon.mp3",
    "e.t. (hardtekk)-rvnge.mp3",
    "bang bang (hardstyle)-goldzoro.mp3"
  ]
};
