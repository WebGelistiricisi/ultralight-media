// Oynatma durumu: kuyruk, shuffle, repeat. Ses motoru ve kütüphane dışarıdan verilir.
export function createPlayer({ engine, library, bus }) {
  const el = engine.el;
  const state = { currentId: null, shuffle: false, repeat: "off" }; // off | all | one

  const queue = () => library.list().filter(t => !t.bad);
  const indexOf = () => queue().findIndex(t => t.id === state.currentId);

  async function playTrack(id) {
    const track = library.get(id);
    if (!track) return;
    state.currentId = id;
    el.src = track.url;
    bus.emit("track", track);
    try { await engine.play(); } catch (err) { if (err?.name !== "AbortError") handleError(track); }
  }

  function handleError(track) {
    if (track.bad) return;
    track.bad = true;
    bus.emit("error", `"${track.name}" bu tarayıcıda oynatılamıyor.`);
    bus.emit("library");
    next(true);
  }

  function pickNext(auto) {
    const q = queue();
    if (!q.length) return null;
    if (auto && state.repeat === "one") return state.currentId;
    if (state.shuffle && q.length > 1) {
      let t; do { t = q[Math.floor(Math.random() * q.length)]; } while (t.id === state.currentId);
      return t.id;
    }
    const i = indexOf();
    if (i < q.length - 1) return q[i + 1].id;
    return state.repeat === "all" || !auto ? q[0].id : null;
  }

  function next(auto = false) {
    const id = pickNext(auto);
    if (id) playTrack(id); else { el.pause(); bus.emit("state"); }
  }
  function prev() {
    if (el.currentTime > 3) { el.currentTime = 0; return; }
    const q = queue(), i = indexOf();
    if (q.length) playTrack(q[i > 0 ? i - 1 : q.length - 1].id);
  }
  function toggle() {
    if (!state.currentId) { const q = queue(); if (q.length) playTrack(q[0].id); return; }
    if (el.paused) engine.play().catch(() => {}); else el.pause();
  }
  const cycleRepeat = () => { state.repeat = { off: "all", all: "one", one: "off" }[state.repeat]; bus.emit("state"); };
  const toggleShuffle = () => { state.shuffle = !state.shuffle; bus.emit("state"); };

  el.addEventListener("ended", () => next(true));
  el.addEventListener("error", () => { const t = library.get(state.currentId); if (t && el.getAttribute("src")) handleError(t); });
  ["play", "pause", "timeupdate", "loadedmetadata"].forEach(e => el.addEventListener(e, () => bus.emit("state")));

  return { state, playTrack, next, prev, toggle, cycleRepeat, toggleShuffle };
}
