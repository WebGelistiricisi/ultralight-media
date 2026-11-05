import { EQ_BANDS } from "../audio/engine.js";

const $ = s => document.querySelector(s);
const fmt = s => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
const label = f => (f >= 1000 ? `${f / 1000}k` : `${f}`);
const mk = (tag, props = {}, attrs = {}) => { const n = Object.assign(document.createElement(tag), props); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

export function mountUI({ engine, player, library, viz, bus, settings, persist }) {
  const el = engine.el;
  const seek = $("#seek"), vol = $("#volume"), list = $("#list");
  let seeking = false;

  // Tema
  const applyTheme = () => { document.documentElement.dataset.theme = settings.theme; $("#theme").setAttribute("aria-pressed", settings.theme === "light"); };
  $("#theme").onclick = () => { settings.theme = settings.theme === "dark" ? "light" : "dark"; applyTheme(); persist(); };
  applyTheme();

  // Bildirim
  let tt;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => (t.hidden = true), 4000); }
  bus.on("error", toast);

  // Dosya ekleme: seçici ve sürükle-bırak
  const addFiles = files => {
    const { added, skipped } = library.add([...files]);
    toast(added ? `${added} parça eklendi${skipped ? `, ${skipped} dosya atlandı` : ""}.` : "Ses dosyası bulunamadı.");
  };
  $("#add").onclick = () => $("#file").click();
  $("#file").onchange = e => { addFiles(e.target.files); e.target.value = ""; };
  const drop = $("#drop");
  addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("on"); });
  addEventListener("dragleave", e => { if (!e.relatedTarget) drop.classList.remove("on"); });
  addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("on"); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); });

  // Kütüphane listesi
  function renderList() {
    const items = library.list();
    list.replaceChildren();
    const empty = $("#empty");
    empty.hidden = items.length > 0;
    empty.textContent = library.all().length ? "Eşleşen parça yok." : "Henüz parça yok. Ses dosyalarını sürükle veya “Dosya ekle”ye bas.";
    const frag = document.createDocumentFragment();
    for (const t of items) {
      const li = mk("li", { className: (t.id === player.state.currentId ? "current " : "") + (t.bad ? "bad" : "") }, { "data-id": t.id });
      const play = mk("button", { className: "row-main", type: "button", disabled: t.bad, textContent: t.name + (t.bad ? " (desteklenmiyor)" : "") }, { "data-act": "play" });
      const fav = mk("button", { className: "icon-btn", type: "button", textContent: library.isFav(t) ? "★" : "☆" }, { "data-act": "fav", "aria-label": `${t.name} favori`, "aria-pressed": library.isFav(t) });
      const del = mk("button", { className: "icon-btn", type: "button", textContent: "✕" }, { "data-act": "del", "aria-label": `${t.name} parçasını kaldır` });
      li.append(play, fav, del);
      frag.append(li);
    }
    list.append(frag);
  }
  list.onclick = e => {
    const b = e.target.closest("button[data-act]"); if (!b) return;
    const id = +b.closest("li").dataset.id;
    if (b.dataset.act === "play") player.playTrack(id);
    if (b.dataset.act === "fav") library.toggleFav(id);
    if (b.dataset.act === "del") {
      if (player.state.currentId === id) { el.pause(); el.removeAttribute("src"); player.state.currentId = null; }
      library.remove(id); bus.emit("state");
    }
  };
  $("#search").oninput = e => library.setQuery(e.target.value);
  $("#favOnly").onclick = e => { library.setOnlyFavs(!library.onlyFavs); e.currentTarget.setAttribute("aria-pressed", library.onlyFavs); };

  // Kontroller
  $("#play").onclick = player.toggle;
  $("#prev").onclick = player.prev;
  $("#next").onclick = () => player.next(false);
  $("#shuffle").onclick = () => { player.toggleShuffle(); settings.shuffle = player.state.shuffle; persist(); };
  $("#repeat").onclick = () => { player.cycleRepeat(); settings.repeat = player.state.repeat; persist(); };
  seek.oninput = () => { seeking = true; $("#cur").textContent = fmt(+seek.value); };
  seek.onchange = () => { el.currentTime = +seek.value; seeking = false; };
  vol.oninput = () => { el.volume = +vol.value; settings.volume = el.volume; persist(); };
  el.volume = settings.volume; vol.value = settings.volume;

  // Ekolayzer
  EQ_BANDS.forEach((f, i) => {
    const r = mk("input", { type: "range", min: -12, max: 12, step: 1, value: settings.eq[i] }, { "aria-label": `${label(f)} Hz ekolayzer` });
    r.oninput = () => { engine.setGain(i, +r.value); settings.eq[i] = +r.value; persist(); };
    r.ondblclick = () => { r.value = 0; r.oninput(); };
    $("#eq").append(mk("label", { className: "band" }).appendChild(r).parentNode, "");
    $("#eq").lastElementChild.append(mk("span", { textContent: label(f) }));
  });
  engine.setGains(settings.eq);

  // Durum
  const REPEAT = { off: "Tekrar: kapalı", all: "Tekrar: tümü", one: "Tekrar: tek parça" };
  function renderState() {
    const t = library.get(player.state.currentId);
    $("#title").textContent = t ? t.name : "Bir parça seç";
    document.title = t ? `${t.name} · UltraLight` : "UltraLight Media";
    const playing = !el.paused && !el.ended && !!t;
    $("#play").textContent = playing ? "⏸" : "▶";
    $("#play").setAttribute("aria-label", playing ? "Duraklat" : "Oynat");
    $("#shuffle").setAttribute("aria-pressed", player.state.shuffle);
    const rp = $("#repeat");
    rp.setAttribute("aria-pressed", player.state.repeat !== "off");
    rp.setAttribute("aria-label", REPEAT[player.state.repeat]);
    rp.textContent = player.state.repeat === "one" ? "🔂" : "🔁";
    const dur = t && isFinite(el.duration) ? el.duration : 0;
    $("#total").textContent = fmt(dur);
    seek.max = dur;
    if (!seeking) { seek.value = t ? el.currentTime : 0; $("#cur").textContent = fmt(t ? el.currentTime : 0); }
    playing ? viz.start() : viz.stop();
  }
  bus.on("state", renderState);
  bus.on("track", () => { renderState(); renderList(); });
  bus.on("library", renderList);
  bus.on("settings", () => { settings.favs = library.favKeys(); persist(); });
  addEventListener("resize", () => viz.resize());

  // Klavye: Boşluk oynat/duraklat, ←/→ ±5 sn, Shift+←/→ önceki/sonraki
  addEventListener("keydown", e => {
    if (e.target.matches("input[type=search]") || e.ctrlKey || e.metaKey || e.altKey) return;
    const onRange = e.target.matches("input[type=range]");
    if (e.code === "Space" && !e.target.closest("button")) { e.preventDefault(); player.toggle(); }
    else if (e.shiftKey && e.code === "ArrowRight") player.next(false);
    else if (e.shiftKey && e.code === "ArrowLeft") player.prev();
    else if (!onRange && e.code === "ArrowRight") el.currentTime = Math.min(el.duration || 0, el.currentTime + 5);
    else if (!onRange && e.code === "ArrowLeft") el.currentTime = Math.max(0, el.currentTime - 5);
  });

  renderList(); renderState();
}
