// Parça koleksiyonu, arama, favoriler. Dosyalar bellekte tutulur (kalıcı depolama Sprint 2).
const AUDIO_EXT = /\.(mp3|wav|ogg|oga|opus|flac|aac|m4a|weba|webm)$/i;
export const trackKey = f => `${f.name}|${f.size}`;

export function createLibrary({ bus, favorites = [], makeUrl = f => URL.createObjectURL(f), revoke = u => URL.revokeObjectURL(u) }) {
  const tracks = [];
  const favs = new Set(favorites);
  let query = "", onlyFavs = false, seq = 0;

  return {
    add(files) {
      let added = 0, skipped = 0;
      for (const f of files) {
        const ok = f.type?.startsWith("audio/") || AUDIO_EXT.test(f.name);
        if (!ok || tracks.some(t => t.key === trackKey(f))) { skipped++; continue; }
        tracks.push({ id: ++seq, key: trackKey(f), name: f.name.replace(/\.[^.]+$/, ""), url: makeUrl(f), bad: false });
        added++;
      }
      bus?.emit("library");
      return { added, skipped };
    },
    remove(id) {
      const i = tracks.findIndex(t => t.id === id);
      if (i < 0) return;
      revoke(tracks[i].url); tracks.splice(i, 1); bus?.emit("library");
    },
    get: id => tracks.find(t => t.id === id),
    all: () => tracks,
    list() {
      const q = query.trim().toLowerCase();
      return tracks.filter(t => (!q || t.name.toLowerCase().includes(q)) && (!onlyFavs || favs.has(t.key)));
    },
    setQuery(v) { query = v; bus?.emit("library"); },
    setOnlyFavs(v) { onlyFavs = v; bus?.emit("library"); },
    get onlyFavs() { return onlyFavs; },
    isFav: t => favs.has(t.key),
    toggleFav(id) {
      const t = tracks.find(x => x.id === id);
      if (!t) return;
      favs.has(t.key) ? favs.delete(t.key) : favs.add(t.key);
      bus?.emit("library"); bus?.emit("settings");
    },
    favKeys: () => [...favs]
  };
}
