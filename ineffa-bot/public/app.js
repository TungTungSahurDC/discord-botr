const LS = "miliastra_state_v9";
const DEFAULT_PFP = "assets/neverness-to-everness-nte.gif";
const DEFAULT_BOT = { id: "ineffa", name: "ineffa", character: "https://verba.ink/v/ineffa_o1r", desc: "Main bot of Miliastra", avatar: "assets/ineffa-profile.webp" };

const el = (id) => document.getElementById(id);
const state = loadState();
const cursorLabels = { wand: "✧", hat: "☽", star: "✦", broom: "⌁", book: "▰", flower: "✿", none: "" };
let spotifyMode = false;
let currentChatId = state.currentChatId || ensureChat().id;
let musicUnlocked = false;
let audioCtx;

const musicTracks = [
  { id: "literature", title: "Majo no Tabitabi OP Literature Piano Cover", src: "assets/majo-literature-piano.mp3" },
  { id: "hope", title: "Hope is the Thing with Feathers — Piano", src: "assets/hope-feathers-piano.mp3" },
  { id: "ainos", title: "Aino's House — Genshin Impact Piano", src: "assets/ainos-house-piano.mp3" }
];

const gifReactions = [
  { keys: ["hello", "hi", "hey", "greet", "welcome"], label: "ineffa greeting GIF", url: "https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif" },
  { keys: ["happy", "cute", "smile", "yay", "nice", "good", "love"], label: "happy sparkle GIF", url: "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif" },
  { keys: ["sad", "cry", "comfort", "lonely", "tired", "stress", "pain"], label: "comfort GIF", url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif" },
  { keys: ["think", "explain", "study", "code", "program", "write", "homework"], label: "thinking GIF", url: "https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif" },
  { keys: ["magic", "witch", "elaina", "spell", "lore", "genshin", "quest", "scenario"], label: "magic mood GIF", url: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif" },
  { keys: ["food", "cook", "cafe", "tea", "coffee", "cake"], label: "cozy café GIF", url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" },
  { keys: ["search", "web", "news", "current", "recent", "find"], label: "searching GIF", url: "https://media.giphy.com/media/3orieUe6ejxSFxYCXe/giphy.gif" },
  { keys: ["image", "draw", "art", "picture", "generate"], label: "art GIF", url: "https://media.giphy.com/media/3oEduT5R5xG4YdgO9G/giphy.gif" },
  { keys: ["default"], label: "Miliastra reaction GIF", url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif" }
];

const bgChoices = [
  { id: "miliastra", name: "Miliastra", css: "radial-gradient(circle at top left, color-mix(in srgb, var(--accent), transparent 70%), transparent 26rem), linear-gradient(135deg, rgba(19,23,36,.94), rgba(10,12,22,.94))", preview: "linear-gradient(135deg,#221943,#0a0c16)" },
  { id: "autumn", name: "Autumn Window", css: "radial-gradient(circle at 20% 0, rgba(255,211,89,.24), transparent 25rem), radial-gradient(circle at 90% 20%, rgba(255,112,112,.16), transparent 22rem), linear-gradient(135deg, rgba(54,30,24,.92), rgba(15,12,18,.94))", preview: "linear-gradient(135deg,#ffc94d,#5c1727,#101018)" },
  { id: "night", name: "Witch Night", css: "radial-gradient(circle at 75% 10%, rgba(164,122,255,.28), transparent 22rem), radial-gradient(circle at 20% 90%, rgba(87,218,255,.12), transparent 20rem), linear-gradient(135deg, rgba(9,12,30,.96), rgba(16,7,28,.96))", preview: "linear-gradient(135deg,#071335,#341259)" },
  { id: "ocean", name: "Blue Waves", css: "radial-gradient(circle at top right, rgba(42,206,255,.22), transparent 26rem), linear-gradient(135deg, rgba(7,29,48,.95), rgba(6,13,28,.95))", preview: "linear-gradient(135deg,#0d78a0,#071a32)" },
  { id: "rose", name: "Soft Rose", css: "radial-gradient(circle at top left, rgba(255,176,219,.24), transparent 25rem), linear-gradient(135deg, rgba(45,20,42,.94), rgba(14,12,22,.94))", preview: "linear-gradient(135deg,#ff8ac7,#25142a)" },
  { id: "forest", name: "Quiet Forest", css: "radial-gradient(circle at 20% 0, rgba(109,255,194,.18), transparent 24rem), linear-gradient(135deg, rgba(9,36,32,.95), rgba(8,12,18,.95))", preview: "linear-gradient(135deg,#0c473e,#0c1118)" }
];

const themeSchemes = [
  { id: "miliastra", name: "Miliastra Purple", vars: { bg: "#080a12", panel: "rgba(20,24,38,.86)", panel2: "rgba(255,255,255,.075)", text: "#f7f4ff", muted: "#b4abc9", accent: "#8c7cff", accent2: "#f6c6ff", line: "rgba(255,255,255,.12)" } },
  { id: "elaina", name: "Elaina Moon", vars: { bg: "#0d0b16", panel: "rgba(28,24,43,.88)", panel2: "rgba(214,197,255,.10)", text: "#fffaff", muted: "#c9bddf", accent: "#b491ff", accent2: "#f1ddff", line: "rgba(230,213,255,.17)" } },
  { id: "autumn", name: "Autumn Window", vars: { bg: "#160d0b", panel: "rgba(42,25,20,.88)", panel2: "rgba(255,211,117,.10)", text: "#fff8ee", muted: "#dec3a3", accent: "#ff9f43", accent2: "#ffd166", line: "rgba(255,215,158,.18)" } },
  { id: "ocean", name: "Blue Archive", vars: { bg: "#061321", panel: "rgba(10,32,52,.88)", panel2: "rgba(81,202,255,.10)", text: "#f1fbff", muted: "#a9c4d5", accent: "#36c8ff", accent2: "#9be7ff", line: "rgba(139,221,255,.16)" } },
  { id: "rose", name: "Soft Rose", vars: { bg: "#170b17", panel: "rgba(42,19,42,.88)", panel2: "rgba(255,138,199,.12)", text: "#fff4fb", muted: "#dbb4ce", accent: "#ff7fc7", accent2: "#ffc6e8", line: "rgba(255,185,222,.18)" } },
  { id: "forest", name: "Quiet Forest", vars: { bg: "#061410", panel: "rgba(10,34,29,.88)", panel2: "rgba(109,255,194,.10)", text: "#f1fff9", muted: "#a8cbbb", accent: "#56e0ae", accent2: "#c4ffe9", line: "rgba(137,255,209,.16)" } }
];

const viewMeta = {
  home: ["Home", "Make the app feel alive."],
  chat: ["Chat", "Talk with ineffa."],
  studio: ["Image Studio", "Generate images with Erica."],
  bots: ["Bots", "New bot creation is coming soon."],
  about: ["About Erica", "Meet the creator of Miliastra."],
  profile: ["Profile", "Change your name, bio, and picture."],
  settings: ["Settings", "Save themes, backgrounds, music, web search, and API toggles."]
};

function defaultState() {
  return {
    users: {},
    currentUser: null,
    sessionActive: false,
    guestProfile: { name: "Guest", bio: "No bio yet.", pfp: DEFAULT_PFP },
    chats: {},
    gallery: [],
    currentChatId: null,
    settings: {
      accent: "#8c7cff",
      background: "miliastra",
      themeScheme: "miliastra",
      cursor: "wand",
      motion: true,
      sfx: true,
      music: true,
      musicVolume: 20,
      stream: false,
      debugTools: false,
      sampleTool: true,
      contextGifs: true,
      currentTrack: 0,
      hideMusicPlayer: false,
      botSettings: { style: "natural", temperature: 0.8, maxTokens: 900, nickname: "ineffa" }
    }
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS));
    if (saved) return merge(defaultState(), saved);
    const old = JSON.parse(localStorage.getItem("miliastra_state_v3"));
    if (old) return merge(defaultState(), old);
  } catch (_) {}
  return defaultState();
}

function merge(base, patch) {
  for (const [k, v] of Object.entries(patch || {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) merge(base[k], v);
    else base[k] = v;
  }
  return base;
}

function save() { localStorage.setItem(LS, JSON.stringify(state)); }
function userKey() { return state.currentUser || "guest"; }
function currentProfile() { return state.currentUser ? state.users[state.currentUser]?.profile : state.guestProfile; }
function chats() { const key = userKey(); state.chats[key] ||= []; return state.chats[key]; }
function gallery() { return state.gallery; }

function createChat() {
  return {
    id: crypto.randomUUID(),
    title: autoChatTitle(),
    autoTitle: true,
    createdAt: Date.now(),
    session_id: null,
    messages: []
  };
}
function ensureChat() {
  const list = chats();
  if (!list.length) list.unshift(createChat());
  return list[0];
}
function activeChat() { return chats().find(c => c.id === currentChatId) || ensureChat(); }

function toast(msg) {
  if (/error|wrong|failed|blocked|could not/i.test(msg)) playTone("error"); else playTone("success");
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  el("toastStack").appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function playTone(kind = "click") {
  if (!state.settings.sfx) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const presets = {
      click: [620, 0.022, 0.06, "sine"],
      hover: [860, 0.009, 0.035, "triangle"],
      send: [520, 0.026, 0.09, "sine"],
      success: [740, 0.024, 0.11, "triangle"],
      error: [180, 0.035, 0.14, "sawtooth"],
      page: [420, 0.018, 0.08, "sine"],
      copy: [980, 0.016, 0.07, "triangle"],
      delete: [240, 0.025, 0.08, "sawtooth"],
      open: [650, 0.014, 0.06, "sine"],
      magic: [1040, 0.018, 0.12, "triangle"]
    };
    const [freq, vol, dur, wave] = presets[kind] || presets.click;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur + 0.01);
    if (kind === "success") setTimeout(() => playTone("hover"), 75);
  } catch (_) {}
}
function clickSound() { playTone("click"); }

document.addEventListener("click", (e) => {
  if (e.target.closest("button,a,input,select,textarea,label")) clickSound();
  unlockMusic();
}, { passive: true });
document.addEventListener("mouseover", (e) => {
  if (e.target.closest("button,a,.recent-card,.scenario-card,.bg-chip,.scheme-chip")) playTone("hover");
}, { passive: true });
document.addEventListener("mousemove", (e) => moveCursor(e), { passive: true });

function applySettings() {
  if (!Object.prototype.hasOwnProperty.call(cursorLabels, state.settings.cursor)) state.settings.cursor = "wand";
  const scheme = themeSchemes.find(t => t.id === state.settings.themeScheme) || themeSchemes[0];
  Object.entries(scheme.vars).forEach(([key, value]) => document.documentElement.style.setProperty(`--${key}`, value));
  if (state.settings.accent) document.documentElement.style.setProperty("--accent", state.settings.accent);
  document.documentElement.dataset.theme = scheme.id;
  const bg = bgChoices.find(b => b.id === state.settings.background) || bgChoices[0];
  document.documentElement.style.setProperty("--chat-bg", bg.css);
  document.body.classList.toggle("no-motion", !state.settings.motion);
  document.body.classList.toggle("custom-cursor-enabled", state.settings.cursor !== "none");
  const cursor = el("customCursor");
  if (cursor) {
    const symbol = cursorLabels[state.settings.cursor] || "✧";
    cursor.dataset.cursor = state.settings.cursor || "wand";
    cursor.dataset.symbol = symbol;
    cursor.innerHTML = `<span>${symbol}</span>`;
  }
  el("accentPicker").value = state.settings.accent || scheme.vars.accent || "#8c7cff";
  const cursorSelect = el("cursorSelect"); if (cursorSelect) cursorSelect.value = state.settings.cursor || "wand";
  el("motionToggle").checked = !!state.settings.motion;
  el("clickSoundToggle").checked = !!state.settings.sfx;
  el("streamToggle").checked = !!state.settings.stream;
  el("debugToolsToggle").checked = !!state.settings.debugTools;
  el("toolToggle").checked = !!state.settings.sampleTool;
  if (el("contextGifToggle")) el("contextGifToggle").checked = !!state.settings.contextGifs;
  setCurrentTrack(state.settings.currentTrack || 0, false);
  renderPlaylist();
  el("musicVolume").value = state.settings.musicVolume ?? 20;
  el("volumeLabel").textContent = state.settings.musicVolume ?? 20;
  const audio = el("bgMusic");
  audio.volume = (state.settings.musicVolume ?? 20) / 100;
  el("musicToggle").textContent = state.settings.music ? "🎵 Music" : "🔇 Music";
  el("soundToggle").textContent = state.settings.sfx ? "🔊 SFX" : "🔈 SFX";
  const floatingPlayer = el("floatingPlayer");
  floatingPlayer?.classList.toggle("hidden-player", !!state.settings.hideMusicPlayer);
  if (el("hideMusicPlayerToggle")) el("hideMusicPlayerToggle").checked = !!state.settings.hideMusicPlayer;
  syncBotSettingsControls();
  renderBackgrounds();
  renderSchemes();
  updateMusicPlayer(false);
}
function moveCursor(e) {
  const cursor = el("customCursor");
  if (!cursor || state.settings.cursor === "none") return;
  // Use physical left/top instead of transform variables so the white dot is the exact click point.
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
}

function currentTrack() {
  const index = Math.min(Math.max(Number(state.settings.currentTrack) || 0, 0), musicTracks.length - 1);
  return musicTracks[index] || musicTracks[0];
}

function setCurrentTrack(index, autoplay = false) {
  const audio = el("bgMusic");
  if (!audio) return;
  const safe = (Number(index) + musicTracks.length) % musicTracks.length;
  const track = musicTracks[safe];
  const wasPlaying = !audio.paused;
  state.settings.currentTrack = safe;
  if (!audio.src.endsWith(track.src)) audio.src = track.src;
  audio.volume = (state.settings.musicVolume ?? 20) / 100;
  save();
  renderPlaylist();
  updateMusicPlayer(false);
  if (autoplay || wasPlaying) unlockMusic(true);
}

function nextTrack(autoplay = true) { setCurrentTrack((state.settings.currentTrack || 0) + 1, autoplay); playTone("magic"); }
function prevTrack(autoplay = true) { setCurrentTrack((state.settings.currentTrack || 0) - 1, autoplay); playTone("magic"); }

function unlockMusic(force = false) {
  const audio = el("bgMusic");
  const track = currentTrack();
  if (!audio.src.endsWith(track.src)) audio.src = track.src;
  audio.volume = (state.settings.musicVolume ?? 20) / 100;
  if (spotifyMode && !force) return;
  if (!state.settings.music && !force) return;
  audio.play().then(() => { musicUnlocked = true; state.settings.music = true; save(); el("musicToggle").textContent = "🎵 Music"; updateMusicPlayer(false); }).catch(() => {
    if (force) toast("Browser blocked autoplay. Click Play music once to start it.");
  });
}


function pauseLocalMusicForSpotify() {
  spotifyMode = true;
  const audio = el("bgMusic");
  audio.pause();
  state.settings.music = false;
  save();
  updateMusicPlayer(true);
  applySettings();
  toast("Spotify mode on. Local piano music paused.");
}

function updateMusicPlayer(usingSpotify = spotifyMode) {
  const panel = el("spotifyPanel");
  const now = el("musicNow");
  const title = el("musicNowTitle");
  const sub = el("musicNowSub");
  const status = el("spotifyStatus");
  const floating = el("floatingPlayer");
  const floatingTitle = el("floatingMusicTitle");
  const floatingSub = el("floatingMusicSub");
  if (!now || !title || !sub || !status) return;
  const audio = el("bgMusic");
  const localPlaying = !!(audio && !audio.paused && state.settings.music && !usingSpotify);
  now.classList.toggle("spotify-active", usingSpotify);
  floating?.classList.toggle("active", usingSpotify || localPlaying || state.settings.music);
  floating?.classList.toggle("hidden-player", !!state.settings.hideMusicPlayer);
  floating?.classList.toggle("spotify-active", usingSpotify);
  if (usingSpotify) {
    title.textContent = "Spotify playlist active";
    sub.textContent = "Local piano music is paused while Spotify is being used.";
    status.textContent = "Spotify mode";
    floatingTitle && (floatingTitle.textContent = "Spotify playlist active");
    floatingSub && (floatingSub.textContent = "Local music paused");
    panel?.classList.add("spotify-glow");
  } else {
    title.textContent = currentTrack().title;
    sub.textContent = `Track ${(state.settings.currentTrack || 0) + 1}/${musicTracks.length} · Local music at ${state.settings.musicVolume ?? 20}% volume`;
    status.textContent = localPlaying ? "Local music playing" : "Spotify ready";
    floatingTitle && (floatingTitle.textContent = currentTrack().title);
    floatingSub && (floatingSub.textContent = localPlaying ? `${state.settings.musicVolume ?? 20}% volume · playing` : "Paused · click Music");
    panel?.classList.remove("spotify-glow");
  }
}

function renderPlaylist() {
  const selected = Number(state.settings.currentTrack) || 0;
  [el("playlistList"), el("settingsPlaylistList")].filter(Boolean).forEach((wrap) => {
    wrap.innerHTML = "";
    musicTracks.forEach((track, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `track-chip ${index === selected ? "active" : ""}`;
      btn.innerHTML = `<span>${index + 1}</span><strong>${escapeHtml(track.title)}</strong>`;
      btn.addEventListener("click", () => { spotifyMode = false; state.settings.music = true; setCurrentTrack(index, true); toast(`Now playing: ${track.title}`); });
      wrap.appendChild(btn);
    });
  });
}
function initAuth() {
  let tab = "login";
  document.querySelectorAll("[data-auth-tab]").forEach(btn => btn.addEventListener("click", () => {
    tab = btn.dataset.authTab;
    document.querySelectorAll("[data-auth-tab]").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".signup-only").forEach(x => x.classList.toggle("hidden", tab !== "signup"));
    el("authSubmit").textContent = tab === "signup" ? "Sign up" : "Log in";
  }));
  el("authForm").addEventListener("submit", e => {
    e.preventDefault();
    const username = el("authUser").value.trim().toLowerCase();
    const password = el("authPass").value;
    const name = el("authName").value.trim() || username;
    if (!username || !password) return toast("Username and password are required.");
    if (tab === "signup") {
      if (state.users[username]) return toast("That username already exists locally.");
      state.users[username] = { password, profile: { name, bio: "", pfp: DEFAULT_PFP } };
      state.currentUser = username;
      toast("Account created locally.");
      enterApp();
    } else {
      if (!state.users[username] || state.users[username].password !== password) return toast("Wrong local username or password.");
      state.currentUser = username;
      toast("Logged in.");
      enterApp();
    }
    save();
  });
  el("guestBtn").addEventListener("click", () => { state.currentUser = null; enterApp(); save(); });
}

function enterApp() {
  state.sessionActive = true;
  el("authScreen").classList.add("hidden");
  el("app").classList.remove("hidden");
  currentChatId = ensureChat().id;
  state.currentChatId = currentChatId;
  save();
  renderAll();
  applySettings();
  setTimeout(() => unlockMusic(), 300);
}

function initNavigation() {
  el("logoutBtn").addEventListener("click", () => { state.sessionActive = false; save(); el("app").classList.add("hidden"); el("authScreen").classList.remove("hidden"); toast("Logged out."); });
  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
  document.querySelectorAll("[data-jump]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.jump)));
  el("menuBtn").addEventListener("click", () => el("sidebar").classList.toggle("open"));
  el("quickThemeBtn").addEventListener("click", () => {
    const i = bgChoices.findIndex(b => b.id === state.settings.background);
    state.settings.background = bgChoices[(i + 1) % bgChoices.length].id;
    save(); applySettings(); toast("Theme saved.");
  });
  el("shortcutHelpBtn")?.addEventListener("click", () => el("shortcutDialog")?.showModal());
  el("closeShortcuts")?.addEventListener("click", () => el("shortcutDialog")?.close());
  document.querySelectorAll(".open-bot-profile").forEach(btn => btn.addEventListener("click", openBotProfile));
  el("closeBotProfile")?.addEventListener("click", () => el("botProfileDialog")?.close());
  initLoginVideo();
}
function showView(view) {
  playTone("page");
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  el(`${view}View`)?.classList.add("active");
  document.querySelectorAll("[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  const [title, sub] = viewMeta[view] || viewMeta.home;
  el("viewTitle").textContent = title; el("viewSub").textContent = sub;
  el("sidebar").classList.remove("open");
}

function initProfile() {
  const picker = el("profilePicture");
  const pickBtn = el("pickPfpBtn");
  if (pickBtn) pickBtn.addEventListener("click", () => picker.click());
  picker.addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const src = file.type === "image/gif" ? await readFileAsDataURL(file) : await resizeImage(file, 512);
      currentProfile().pfp = src;
      save(); renderProfile(); playTone("success"); toast(file.type === "image/gif" ? "GIF profile picture saved." : "Profile picture saved.");
    } catch { toast("Could not read that image."); }
  });
  el("resetPfpBtn").addEventListener("click", () => { currentProfile().pfp = DEFAULT_PFP; save(); renderProfile(); toast("Profile picture reset."); });
  el("profileForm").addEventListener("submit", e => {
    e.preventDefault();
    const p = currentProfile();
    p.name = el("profileName").value.trim() || "Guest";
    p.bio = el("profileBio").value.trim();
    save(); renderProfile(); toast("Profile saved.");
  });
}
function renderProfile() {
  const p = currentProfile() || state.guestProfile;
  el("profileName").value = p.name || "Guest";
  el("profileBio").value = p.bio || "";
  el("profilePreviewName").textContent = p.name || "Guest";
  el("profilePreviewBio").textContent = p.bio || "No bio yet.";
  el("profilePreviewAvatar").src = p.pfp || DEFAULT_PFP;
  const uploadPreview = el("uploadPreviewAvatar"); if (uploadPreview) uploadPreview.src = p.pfp || DEFAULT_PFP;
  el("miniAvatar").src = p.pfp || DEFAULT_PFP;
  el("miniName").textContent = p.name || "Guest";
}
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
function resizeImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function initSettings() {
  el("accentPicker").addEventListener("input", e => { state.settings.accent = e.target.value; applySettings(); save(); });
  el("cursorSelect")?.addEventListener("change", e => { state.settings.cursor = e.target.value; save(); applySettings(); toast("Cursor saved."); });
  el("saveThemeBtn").addEventListener("click", () => { save(); playTone("success"); toast("Theme saved."); });
  el("resetThemeBtn").addEventListener("click", () => { state.settings.themeScheme = "miliastra"; state.settings.accent = "#8c7cff"; state.settings.background = "miliastra"; state.settings.cursor = "wand"; save(); applySettings(); toast("Theme reset."); });
  el("motionToggle").addEventListener("change", e => { state.settings.motion = e.target.checked; save(); applySettings(); toast("Motion setting saved."); });
  el("clickSoundToggle").addEventListener("change", e => { state.settings.sfx = e.target.checked; save(); applySettings(); toast("Sound setting saved."); });
  el("streamToggle").addEventListener("change", e => { state.settings.stream = e.target.checked; save(); toast("Streaming setting saved."); });
  el("debugToolsToggle").addEventListener("change", e => { state.settings.debugTools = e.target.checked; save(); toast("Debug setting saved."); });
  el("toolToggle").addEventListener("change", e => { state.settings.sampleTool = e.target.checked; save(); toast(e.target.checked ? "Web search enabled for ineffa." : "Web search disabled."); });
  el("contextGifToggle")?.addEventListener("change", e => { state.settings.contextGifs = e.target.checked; save(); toast(e.target.checked ? "Context GIF reactions enabled." : "Context GIF reactions disabled."); });
  el("musicVolume").addEventListener("input", e => { state.settings.musicVolume = Number(e.target.value); el("volumeLabel").textContent = e.target.value; el("bgMusic").volume = Number(e.target.value) / 100; spotifyMode = false; updateMusicPlayer(false); save(); });
  el("bgMusic")?.addEventListener("ended", () => nextTrack(true));
  el("nextTrackBtn")?.addEventListener("click", () => nextTrack(true));
  el("prevTrackBtn")?.addEventListener("click", () => prevTrack(true));
  el("nextTrackSettingsBtn")?.addEventListener("click", () => nextTrack(true));
  el("prevTrackSettingsBtn")?.addEventListener("click", () => prevTrack(true));
  el("playMusicBtn").addEventListener("click", () => { spotifyMode = false; state.settings.music = true; save(); unlockMusic(true); updateMusicPlayer(false); applySettings(); });
  el("musicToggle").addEventListener("click", () => {
    spotifyMode = false;
    state.settings.music = !state.settings.music;
    if (state.settings.music) unlockMusic(true); else el("bgMusic").pause();
    save(); updateMusicPlayer(false); applySettings();
    el("floatingPlayer")?.classList.add("active");
  });
  el("floatingMusicBtn")?.addEventListener("click", () => el("musicToggle")?.click());
  el("hidePlayerBtn")?.addEventListener("click", () => { state.settings.hideMusicPlayer = true; save(); applySettings(); toast("Music player hidden."); });
  el("showPlayerBtn")?.addEventListener("click", () => { state.settings.hideMusicPlayer = false; save(); applySettings(); updateMusicPlayer(false); toast("Music player shown."); });
  el("hideMusicPlayerToggle")?.addEventListener("change", e => { state.settings.hideMusicPlayer = e.target.checked; save(); applySettings(); toast(e.target.checked ? "Music player hidden." : "Music player shown."); });
  el("saveBotSettingsBtn")?.addEventListener("click", saveBotSettingsFromControls);
  ["botStyleSelect", "botTempRange", "botTokensRange", "botNicknameInput"].forEach(id => el(id)?.addEventListener("input", updateBotSettingLabels));
  el("soundToggle").addEventListener("click", () => { state.settings.sfx = !state.settings.sfx; save(); applySettings(); });
  el("spotifyModeBtn")?.addEventListener("click", pauseLocalMusicForSpotify);
  el("spotifyPanel")?.addEventListener("mouseenter", () => { if (state.settings.music) { el("bgMusic").pause(); updateMusicPlayer(true); } });
  el("spotifyPanel")?.addEventListener("mouseleave", () => { if (!spotifyMode) updateMusicPlayer(false); });
  el("spotifyPanel")?.addEventListener("focusin", pauseLocalMusicForSpotify);
  el("exportBtn").addEventListener("click", exportData);
  el("wipeBtn").addEventListener("click", () => { if (confirm("Wipe all local Miliastra data?")) { localStorage.removeItem(LS); location.reload(); } });
}
function renderBackgrounds() {
  const wrap = el("bgOptions");
  wrap.innerHTML = "";
  bgChoices.forEach(bg => {
    const btn = document.createElement("button");
    btn.className = `bg-chip ${state.settings.background === bg.id ? "active" : ""}`;
    btn.style.setProperty("--preview", bg.preview);
    btn.textContent = bg.name;
    btn.addEventListener("click", () => { state.settings.background = bg.id; save(); applySettings(); toast(`${bg.name} background saved.`); });
    wrap.appendChild(btn);
  });
}

function renderSchemes() {
  const wrap = el("schemeOptions");
  if (!wrap) return;
  wrap.innerHTML = "";
  themeSchemes.forEach(theme => {
    const btn = document.createElement("button");
    btn.className = `scheme-chip ${state.settings.themeScheme === theme.id ? "active" : ""}`;
    btn.type = "button";
    btn.innerHTML = `<span style="--c1:${theme.vars.accent};--c2:${theme.vars.accent2};--c3:${theme.vars.bg}"></span><strong>${escapeHtml(theme.name)}</strong>`;
    btn.addEventListener("click", () => {
      state.settings.themeScheme = theme.id;
      state.settings.accent = theme.vars.accent;
      save(); applySettings(); playTone("success"); toast(`${theme.name} theme saved.`);
    });
    wrap.appendChild(btn);
  });
}

function initChat() {
  el("newChatBtn").addEventListener("click", () => { const c = createChat(); chats().unshift(c); currentChatId = c.id; state.currentChatId = c.id; save(); renderAll(); showView("chat"); playTone("magic"); toast(`Created ${c.title}`); });
  el("searchInput").addEventListener("input", renderChatList);
  el("chatForm").addEventListener("submit", e => { e.preventDefault(); sendMessage(el("messageInput").value.trim()); });
  el("messageInput").addEventListener("input", e => { e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`; });
  el("messageInput").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); el("chatForm").requestSubmit(); } });
  el("regenBtn").addEventListener("click", regenerate);
  el("formatToolbar").addEventListener("click", e => { const b = e.target.closest("button[data-style]"); if (b) applyTextStyle(b.dataset.style); });
  el("messages").addEventListener("click", handleMessageAction);
  document.querySelectorAll("[data-quick-chat]").forEach(btn => btn.addEventListener("click", () => {
    showView("chat");
    el("messageInput").value = btn.dataset.quickChat || "";
    el("messageInput").focus();
    el("messageInput").dispatchEvent(new Event("input"));
    playTone("magic");
  }));
  el("clearChatBtn")?.addEventListener("click", () => {
    const c = activeChat();
    c.messages = [];
    c.session_id = null;
    c.title = autoChatTitle();
    c.autoTitle = true;
    save(); renderMessages(); renderChatList(); renderRecent(); toast("Chat cleared.");
  });
}
function renderChatList() {
  const q = el("searchInput").value.toLowerCase().trim();
  const wrap = el("chatList"); wrap.innerHTML = "";
  chats().filter(c => !q || `${c.title} ${c.messages.map(m => m.content || m.prompt || "").join(" ")}`.toLowerCase().includes(q)).forEach(c => {
    const btn = document.createElement("button");
    btn.className = `chat-item ${c.id === currentChatId ? "active" : ""}`;
    const last = c.messages.at(-1);
    btn.innerHTML = `<strong>${escapeHtml(c.title)}</strong><span>${escapeHtml(last?.type === "image" ? "Generated image" : last?.content || "No messages yet")}</span>`;
    btn.addEventListener("click", () => { currentChatId = c.id; state.currentChatId = c.id; save(); renderMessages(); renderChatList(); showView("chat"); });
    wrap.appendChild(btn);
  });
}
function renderMessages() {
  const wrap = el("messages"); wrap.innerHTML = "";
  const c = activeChat();
  if (!c.messages.length) {
    wrap.innerHTML = `<div class="empty-state">Start a new adventure with ineffa ✨</div>`;
    return;
  }
  c.messages.forEach(m => addBubble(m));
  scrollMessages();
}
function addBubble(m, typing = false) {
  const wrap = el("messages");
  if (!m.id && !typing) m.id = crypto.randomUUID();
  const art = document.createElement("article");
  art.className = `message ${m.role}`;
  if (m.id) art.dataset.messageId = m.id;
  const isUser = m.role === "user";
  const displayName = isUser ? (currentProfile()?.name || "Guest") : DEFAULT_BOT.name;
  const img = document.createElement("img"); img.className = "avatar-img"; img.src = isUser ? (currentProfile()?.pfp || DEFAULT_PFP) : DEFAULT_BOT.avatar; img.alt = displayName;
  const body = document.createElement("div"); body.className = "message-body";
  const meta = document.createElement("div"); meta.className = "message-meta";
  meta.innerHTML = `<strong>${escapeHtml(displayName)}</strong><span>${isUser ? "You" : "Bot"} · ${formatTime(m.createdAt || Date.now())}</span>`;
  const bubble = document.createElement("div"); bubble.className = `bubble ${m.type === "image" ? "image-bubble" : ""} ${m.type === "gif" ? "gif-bubble" : ""}`;
  if (typing) bubble.innerHTML = `<span class="typing"><i></i><i></i><i></i></span>`;
  else if (m.type === "image") bubble.innerHTML = `<img src="${escapeAttr(m.url)}" alt="Generated image"><p class="image-caption">${escapeHtml(m.prompt || "Generated image")}</p>`;
  else if (m.type === "gif") bubble.innerHTML = `<img src="${escapeAttr(m.url)}" alt="${escapeAttr(m.label || "Reaction GIF")}" loading="lazy"><p class="image-caption">${escapeHtml(m.label || "ineffa sent a related GIF")}</p>`;
  else bubble.innerHTML = renderMarkdown(m.content || "");
  const actions = document.createElement("div"); actions.className = "message-actions";
  if (!typing) actions.innerHTML = `<button type="button" data-msg-action="copy">Copy</button><button type="button" data-msg-action="quote">Quote</button>${(!isUser && m.type === "text") ? '<button type="button" data-msg-action="regen">Retry</button>' : ''}<button type="button" data-msg-action="delete">Delete</button>`;
  body.append(meta, bubble, actions);
  art.append(img, body); wrap.appendChild(art); scrollMessages(); return art;
}
async function sendMessage(text) {
  if (!text) return;
  playTone("send");
  const c = activeChat();
  c.messages.push({ id: crypto.randomUUID(), role: "user", type: "text", content: text, createdAt: Date.now() });
  if (c.autoTitle || c.title === "New adventure") { c.title = makeTitle(text); c.autoTitle = false; }
  el("messageInput").value = ""; el("messageInput").style.height = "auto";
  save(); renderMessages(); renderChatList(); renderRecent();
  if (isExplicitGifRequest(text)) { await sendSearchedGif(c, extractGifQuery(text)); return; }
  await requestAssistant(c);
}

async function requestAssistant(c) {
  const typing = addBubble({ role: "assistant", type: "text", content: "" }, true);
  try {
    const body = buildRequestBody(c);
    let reply;
    if (state.settings.stream) reply = await streamReply(body, typing);
    else {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json(); if (!r.ok) throw new Error(data.message || "Chat failed");
      reply = data.reply; c.session_id = data.session_id || c.session_id;
    }
    typing.remove(); c.messages.push({ id: crypto.randomUUID(), role: "assistant", type: "text", content: reply || "...", createdAt: Date.now() }); await maybeAddContextGif(c, `${c.messages.at(-2)?.content || ""} ${reply || ""}`); save(); renderMessages(); renderChatList(); renderRecent();
  } catch (err) { typing.remove(); c.messages.push({ id: crypto.randomUUID(), role: "assistant", type: "text", content: `Error: ${err.message}`, createdAt: Date.now() }); save(); renderMessages(); toast(err.message); }
}
function pickContextGif(text = "") {
  const hay = String(text).toLowerCase();
  return gifReactions.find(g => g.keys.some(k => k !== "default" && hay.includes(k))) || gifReactions.at(-1);
}

async function maybeAddContextGif(c, context) {
  if (!state.settings.contextGifs) return;
  const searched = await requestGif(extractGifQuery(context));
  const gif = searched || pickContextGif(context);
  const last = c.messages.at(-1);
  if (last?.type === "gif" && last.url === gif.url) return;
  c.messages.push({ id: crypto.randomUUID(), role: "assistant", type: "gif", url: gif.url, label: gif.label, content: `[GIF] ${gif.label}`, createdAt: Date.now() + 1 });
  playTone("magic");
}

function buildRequestBody(c) {
  const profile = currentProfile() || state.guestProfile;
  const displayName = (profile.name || "Guest").trim() || "Guest";
  const bs = state.settings.botSettings || {};
  const botName = (bs.nickname || DEFAULT_BOT.name).trim() || DEFAULT_BOT.name;
  const styleHint = { natural: "Speak naturally and warmly.", cute: "Use a cute, cozy, slightly playful tone.", lore: "Lean into immersive lore, roleplay, and scene details.", concise: "Keep replies short and direct." }[bs.style || "natural"] || "Speak naturally.";
  const personaContext = `Important profile context: The current user display name is "${displayName}". Address the user by this name when natural. Do not call the user Erica unless their display name is Erica. The app creator is Erica Panganiban, but the current user may be someone else. You are currently displayed as "${botName}". Bot reply style: ${styleHint} User bio/persona notes: ${(profile.bio || "none").slice(0, 350)}. If the user asks for a GIF, acknowledge it briefly because the app can attach a GIF result after your reply.`;
  const clean = c.messages.filter(m => m.type !== "image" && m.type !== "gif").slice(-60).map(m => ({ role: m.role, content: m.content }));
  const lastUserIndex = clean.map(m => m.role).lastIndexOf("user");
  if (lastUserIndex >= 0) clean[lastUserIndex] = { ...clean[lastUserIndex], content: `${personaContext}

User message: ${clean[lastUserIndex].content}` };
  const body = { character: DEFAULT_BOT.character, session_id: c.session_id, messages: clean, debug_tools: state.settings.debugTools, temperature: Number(bs.temperature ?? 0.8), max_tokens: Number(bs.maxTokens ?? 900) };
  if (state.settings.sampleTool) {
    body.tools = [{
      type: "function",
      function: {
        name: "web_search",
        description: "Search the public web for fresh information using a safe JSON search endpoint. Use this when the user asks for current, recent, factual, or searchable information.",
        parameters: { type: "object", properties: { query: { type: "string", description: "Search query" } }, required: ["query"] },
        x_verba_http: { url: "https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1", method: "GET", query_param: "q", headers: { "Accept": "application/json" }, timeout_ms: 9000 }
      }
    }];
    body.tool_choice = "auto";
  }
  return body;
}
async function streamReply(body, typingNode) {
  const r = await fetch("/api/chat/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok || !r.body) { const data = await r.json().catch(() => ({})); throw new Error(data.message || "Streaming unavailable"); }
  const reader = r.body.getReader(); const decoder = new TextDecoder(); let buf = "", out = "";
  const bubble = typingNode.querySelector(".bubble"); bubble.textContent = "";
  while (true) {
    const { value, done } = await reader.read(); if (done) break; buf += decoder.decode(value, { stream: true });
    const frames = buf.split("\n\n"); buf = frames.pop() || "";
    for (const f of frames) for (const line of f.split("\n")) if (line.startsWith("data: ")) {
      const data = line.slice(6).trim(); if (data === "[DONE]") continue;
      try { const obj = JSON.parse(data); if (obj.session_id) activeChat().session_id = obj.session_id; const part = obj.choices?.[0]?.delta?.content || ""; out += part; bubble.innerHTML = renderMarkdown(out || " "); scrollMessages(); } catch (_) {}
    }
  }
  return out;
}
async function regenerate() {
  const c = activeChat();
  let last = c.messages.at(-1);
  if (!last || last.role !== "assistant") return toast("Nothing to regenerate yet.");
  if (last.type === "gif") {
    c.messages.pop();
    last = c.messages.at(-1);
  }
  if (!last || last.role !== "assistant") return toast("Nothing to regenerate yet.");
  c.messages.pop();
  save(); renderMessages(); await requestAssistant(c);
}

function initStudio() {
  el("addRefBtn").addEventListener("click", addRefInput);
  el("generateImageBtn").addEventListener("click", generateImage);
  renderGallery();
}
function addRefInput(value = "") {
  if (el("imageRefs").children.length >= 4) return toast("Maximum of 4 reference URLs.");
  const row = document.createElement("div"); row.className = "ref-row"; row.innerHTML = `<input placeholder="https://example.com/reference.png" value="${escapeAttr(value)}"><button class="danger-lite" type="button">Remove</button>`;
  row.querySelector("button").addEventListener("click", () => row.remove()); el("imageRefs").appendChild(row);
}
async function generateImage() {
  const prompt = el("imagePrompt").value.trim(); if (!prompt) return toast("Write an image prompt first.");
  const refs = [...el("imageRefs").querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean).slice(0, 4);
  el("generateImageBtn").disabled = true; el("generateImageBtn").textContent = "Generating...";
  try {
    const c = activeChat();
    const r = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ character: DEFAULT_BOT.character, session_id: c.session_id, prompt, image_urls: refs }) });
    const data = await r.json(); if (!r.ok) throw new Error(data.message || "Image failed");
    c.session_id = data.session_id || c.session_id;
    const item = { url: data.image_url, prompt: data.revised_prompt || prompt, createdAt: Date.now() };
    gallery().unshift(item); c.messages.push({ id: crypto.randomUUID(), role: "assistant", type: "image", url: item.url, prompt: item.prompt, createdAt: Date.now() }); save(); renderGallery(); renderMessages(); toast("Image generated.");
  } catch (err) { toast(err.message); }
  finally { el("generateImageBtn").disabled = false; el("generateImageBtn").textContent = "Generate image"; }
}
function renderGallery() {
  const g = el("gallery"); g.innerHTML = "";
  if (!gallery().length) return g.innerHTML = `<div class="empty-state">Generated images appear here.</div>`;
  gallery().forEach(img => { const card = document.createElement("div"); card.className = "image-card"; card.innerHTML = `<img src="${escapeAttr(img.url)}" alt="Generated"><p class="image-caption">${escapeHtml(img.prompt)}</p>`; g.appendChild(card); });
}

function renderRecent() {
  const r = el("recentGrid"); r.innerHTML = "";
  const recent = chats().slice(0, 6);
  if (!recent.length) return r.innerHTML = `<div class="empty-state">No adventures yet.</div>`;
  recent.forEach(c => { const card = document.createElement("button"); card.className = "recent-card"; card.innerHTML = `<strong>${escapeHtml(c.title)}</strong><p class="muted">${c.messages.length} messages</p>`; card.addEventListener("click", () => { currentChatId = c.id; state.currentChatId = c.id; save(); renderMessages(); showView("chat"); }); r.appendChild(card); });
}
function renderBot() { const nick = state.settings.botSettings?.nickname || DEFAULT_BOT.name; el("activeBotAvatar").src = DEFAULT_BOT.avatar; el("activeBotName").textContent = nick; el("activeBotDesc").textContent = DEFAULT_BOT.desc; }
function renderAll() { renderProfile(); renderBot(); renderChatList(); renderMessages(); renderRecent(); renderGallery(); }

function applyTextStyle(style) {
  const input = el("messageInput"); const start = input.selectionStart; const end = input.selectionEnd; const selected = input.value.slice(start, end) || ({ bold: "bold text", italic: "italic text", code: "code", quote: "quoted text", heading: "Heading", sparkle: "sparkly text" }[style] || "text");
  const wrap = style === "bold" ? `**${selected}**` : style === "italic" ? `*${selected}*` : style === "code" ? `\`${selected}\`` : style === "quote" ? selected.split("\n").map(l => `> ${l}`).join("\n") : style === "heading" ? `### ${selected}` : `✨ ${selected} ✨`;
  input.value = input.value.slice(0, start) + wrap + input.value.slice(end); input.focus(); input.setSelectionRange(start + wrap.length, start + wrap.length); input.dispatchEvent(new Event("input"));
}
function renderMarkdown(text) {
  let html = escapeHtml(text);
  html = html.split("\n").map(line => line.startsWith("### ") ? `<h3>${line.slice(4)}</h3>` : line.startsWith("&gt; ") ? `<blockquote>${line.slice(5)}</blockquote>` : line || "<br>").join("\n");
  return html.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|\s)\*([^*]+)\*/g, "$1<em>$2</em>");
}
function exportData() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "miliastra-local-data.json"; a.click(); URL.revokeObjectURL(a.href); }
function makeTitle(text) { return text.replace(/\s+/g, " ").slice(0, 34) + (text.length > 34 ? "..." : ""); }
function scrollMessages() { requestAnimationFrame(() => { el("messages").scrollTop = el("messages").scrollHeight; }); }
function escapeHtml(t) { return String(t).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
function escapeAttr(t) { return escapeHtml(t).replace(/`/g, "&#96;"); }


function autoChatTitle() {
  const d = new Date();
  return `Adventure ${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function formatTime(ts) {
  return new Date(ts || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function handleMessageAction(e) {
  const btn = e.target.closest("button[data-msg-action]");
  if (!btn) return;
  const art = btn.closest(".message");
  const id = art?.dataset.messageId;
  const c = activeChat();
  const idx = c.messages.findIndex(m => m.id === id);
  if (idx < 0) return;
  const msg = c.messages[idx];
  const action = btn.dataset.msgAction;
  if (action === "copy") {
    const text = msg.type === "image" ? (msg.url || msg.prompt || "") : (msg.content || "");
    navigator.clipboard?.writeText(text); playTone("copy"); toast("Message copied.");
  }
  if (action === "quote") {
    const input = el("messageInput");
    const quote = (msg.content || msg.prompt || "").split("\n").map(line => `> ${line}`).join("\n");
    input.value = `${quote}\n\n`; input.focus(); input.dispatchEvent(new Event("input")); showView("chat"); playTone("open");
  }
  if (action === "delete") {
    c.messages.splice(idx, 1); save(); renderMessages(); renderChatList(); renderRecent(); playTone("delete"); toast("Message deleted.");
  }
  if (action === "regen") regenerate();
}


function initLoginVideo() {
  const video = el("loginBgVideo");
  if (!video) return;
  const setSource = () => {
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const src = mobile ? "assets/login-mobile.mp4" : "assets/login-desktop.mp4";
    if (!video.src.endsWith(src)) {
      video.src = src;
      video.load();
      video.play().catch(() => {});
    }
  };
  setSource();
  window.addEventListener("resize", setSource, { passive: true });
}

function syncBotSettingsControls() {
  const bs = state.settings.botSettings ||= { style: "natural", temperature: 0.8, maxTokens: 900, nickname: "ineffa" };
  if (el("botStyleSelect")) el("botStyleSelect").value = bs.style || "natural";
  if (el("botTempRange")) el("botTempRange").value = bs.temperature ?? 0.8;
  if (el("botTokensRange")) el("botTokensRange").value = bs.maxTokens ?? 900;
  if (el("botNicknameInput")) el("botNicknameInput").value = bs.nickname || "ineffa";
  updateBotSettingLabels();
}
function updateBotSettingLabels() {
  if (el("botTempLabel") && el("botTempRange")) el("botTempLabel").textContent = Number(el("botTempRange").value).toFixed(1);
  if (el("botTokensLabel") && el("botTokensRange")) el("botTokensLabel").textContent = el("botTokensRange").value;
}
function saveBotSettingsFromControls() {
  state.settings.botSettings = {
    style: el("botStyleSelect")?.value || "natural",
    temperature: Number(el("botTempRange")?.value || 0.8),
    maxTokens: Number(el("botTokensRange")?.value || 900),
    nickname: (el("botNicknameInput")?.value || "ineffa").trim() || "ineffa"
  };
  save(); renderBot(); toast("ineffa bot settings saved."); playTone("success");
}

async function openBotProfile() {
  const dialog = el("botProfileDialog");
  const grid = el("botProfileGrid");
  dialog?.showModal();
  try {
    const r = await fetch("/api/bot-profile");
    const data = await r.json();
    el("botProfileName").textContent = state.settings.botSettings?.nickname || data.name || "ineffa";
    el("botProfileDesc").textContent = data.title || data.lore || "Main bot of Miliastra";
    grid.innerHTML = `
      <article><h3>Character ID</h3><p>${escapeHtml(data.id || "97f34dc7b45cfed1c0b86bdd")}</p></article>
      <article><h3>Status</h3><p>${escapeHtml(data.status || "online")} · ${escapeHtml(data.provider_label || "Erica API")}</p></article>
      <article><h3>Character URL</h3><p>${escapeHtml(data.character || DEFAULT_BOT.character)}</p></article>
      <article><h3>Lore</h3><p>${escapeHtml(data.lore || DEFAULT_BOT.desc)}</p></article>
      <article><h3>Capabilities</h3><ul>${(data.capabilities || []).map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul></article>
      <article><h3>API limits</h3><p>Messages: ${escapeHtml(data.limits?.messages || 60)}<br>Image URLs: ${escapeHtml(data.limits?.image_urls || 4)}<br>Image size: ${escapeHtml(data.limits?.image_size || "1024x1024")}</p></article>`;
  } catch (_) {
    grid.innerHTML = `<article><h3>ineffa</h3><p>Main Miliastra bot profile is available offline. Chat, image, GIF, web search, and roleplay features are enabled in the app.</p></article>`;
  }
}

function isExplicitGifRequest(text = "") {
  return /\b(send|show|give|find|search|get)\b[\s\S]{0,40}\bgif\b/i.test(text) || /\bgif\b[\s\S]{0,30}\b(of|for|about)\b/i.test(text);
}
function extractGifQuery(text = "") {
  const raw = String(text).replace(/https?:\/\/\S+/g, " ");
  const m = raw.match(/gif\s+(?:of|for|about)?\s*([\s\S]{1,80})/i) || raw.match(/(?:send|show|give|find|search|get)\s+(?:me\s+)?(?:an?\s+)?gif\s+(?:of|for|about)?\s*([\s\S]{1,80})/i);
  let q = (m?.[1] || raw).replace(/[?.!]+$/g, "").trim();
  q = q.replace(/\b(please|pls|thanks|thank you|gif|send|show|give|find|search|get|me|an|a|of|for|about)\b/gi, " ").replace(/\s+/g, " ").trim();
  return q || "anime reaction";
}
async function requestGif(query) {
  try {
    const r = await fetch(`/api/gif?q=${encodeURIComponent(query || "anime reaction")}`);
    const data = await r.json();
    const item = data.results?.[0];
    if (!r.ok || !item?.url) return null;
    return { url: item.url, label: `GIF: ${item.title || data.query || query}`, content: `[GIF] ${item.title || query}` };
  } catch (_) {
    return pickContextGif(query);
  }
}
async function sendSearchedGif(c, query) {
  const typing = addBubble({ role: "assistant", type: "text", content: "" }, true);
  const gif = await requestGif(query);
  typing.remove();
  c.messages.push({ id: crypto.randomUUID(), role: "assistant", type: "text", content: gif ? `Here is a GIF for **${query}** ✨` : `I could not find a live GIF for **${query}**, so I picked a matching reaction instead.`, createdAt: Date.now() });
  const finalGif = gif || pickContextGif(query);
  c.messages.push({ id: crypto.randomUUID(), role: "assistant", type: "gif", url: finalGif.url, label: finalGif.label, content: finalGif.content || `[GIF] ${finalGif.label}`, createdAt: Date.now() + 1 });
  save(); renderMessages(); renderChatList(); renderRecent(); playTone("magic");
}

function openBotSettingsPanel() {
  showView("settings");
  requestAnimationFrame(() => {
    const card = document.querySelector(".bot-settings-card");
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.remove("flash-focus");
    void card.offsetWidth;
    card.classList.add("flash-focus");
    toast("Bot settings are here.");
  });
}

function ensureSpotifyEmbed() {
  const frame = document.querySelector(".spotify-embed");
  if (!frame) return;
  const src = "https://open.spotify.com/embed/playlist/4A6ZD9GoWRdB6avUex5dxr?utm_source=generator";
  if (!frame.src.includes("4A6ZD9GoWRdB6avUex5dxr")) frame.src = src;
}

function initExtraInteractions() {
  initKeyboardShortcuts();
  ensureSpotifyEmbed();
  el("openBotSettingsBtn")?.addEventListener("click", openBotSettingsPanel);
  el("homeBotSettingsBtn")?.addEventListener("click", openBotSettingsPanel);
  document.querySelectorAll(".scenario-card").forEach(card => card.addEventListener("click", () => {
    showView("chat");
    el("messageInput").value = card.dataset.scenario || "Start a scenario with ineffa.";
    el("messageInput").focus();
    el("messageInput").dispatchEvent(new Event("input"));
    playTone("page");
    toast("Scenario loaded into chat.");
  }));
  document.querySelectorAll("[data-quick]").forEach(btn => btn.addEventListener("click", () => {
    if (btn.dataset.jump) showView(btn.dataset.jump);
    else showView("chat");
    if (btn.dataset.quick) {
      el("messageInput").value = btn.dataset.quick;
      el("messageInput").focus();
      el("messageInput").dispatchEvent(new Event("input"));
    }
    playTone("magic");
  }));
  document.querySelectorAll(".copy-discord").forEach(btn => btn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy || "LaffeyZaychik"); toast("Discord username copied."); playTone("success"); }
    catch { toast("Discord: LaffeyZaychik"); }
  }));
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === "Escape") {
      el("sidebar")?.classList.remove("open");
      el("shortcutDialog")?.close?.();
    }
    if (e.altKey && e.key.toLowerCase() === "u") { e.preventDefault(); el("authUser")?.focus(); }
    if (e.altKey && e.key.toLowerCase() === "p") { e.preventDefault(); el("authPass")?.focus(); }
    if (e.altKey && e.key.toLowerCase() === "h") { e.preventDefault(); showView("home"); }
    if (e.altKey && e.key.toLowerCase() === "c") { e.preventDefault(); showView("chat"); el("messageInput")?.focus(); }
    if (e.altKey && e.key.toLowerCase() === "s") { e.preventDefault(); showView("settings"); }
    if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); showView("chat"); el("searchInput")?.focus(); }
    if (mod && e.key.toLowerCase() === "n") { e.preventDefault(); el("newChatBtn")?.click(); }
    if (mod && e.key === "Enter") {
      e.preventDefault();
      if (!el("authScreen")?.classList.contains("hidden")) el("authForm")?.requestSubmit();
      else if (document.activeElement === el("messageInput") || el("chatView")?.classList.contains("active")) el("chatForm")?.requestSubmit();
    }
    if (mod && e.key === "/") { e.preventDefault(); el("shortcutDialog")?.showModal(); }
  });
}
function initLoginParticles() {
  const wrap = el("loginParticles");
  if (!wrap || wrap.children.length) return;
  const items = ["✦", "✧", "☽", "✶", "❋", "✺"];
  for (let i = 0; i < 130; i++) {
    const p = document.createElement("i");
    p.textContent = items[i % items.length];
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 6}s`;
    p.style.animationDuration = `${5 + Math.random() * 7}s`;
    p.style.fontSize = `${10 + Math.random() * 15}px`;
    wrap.appendChild(p);
  }
}
initAuth(); initNavigation(); initProfile(); initSettings(); initChat(); initStudio(); initExtraInteractions(); initLoginParticles(); initHomeParticles(); applySettings();
if (state.sessionActive && (state.currentUser === null || state.users[state.currentUser])) enterApp();

function initHomeParticles() {
  const home = el("homeView");
  if (!home || home.querySelector(".home-particles")) return;
  const layer = document.createElement("div");
  layer.className = "home-particles";
  const items = ["✦", "✧", "❋", "☽", "✶"];
  home.appendChild(layer);
  for (let i = 0; i < 96; i++) {
    const p = document.createElement("i");
    p.textContent = items[i % items.length];
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.animationDuration = `${7 + Math.random() * 9}s`;
    layer.appendChild(p);
  }
}
