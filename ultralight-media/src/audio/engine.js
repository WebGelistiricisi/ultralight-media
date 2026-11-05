// HTMLAudioElement ile akış tabanlı oynatma; Web Audio grafiği ilk oynatmada kurulur.
export const EQ_BANDS = [60, 230, 910, 3600, 14000];

export function createEngine() {
  const el = new Audio();
  el.preload = "metadata";
  let ctx = null, analyser = null, filters = [];
  const gains = [0, 0, 0, 0, 0];

  function ensureGraph() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    let node = ctx.createMediaElementSource(el);
    filters = EQ_BANDS.map((f, i) => {
      const b = ctx.createBiquadFilter();
      b.type = i === 0 ? "lowshelf" : i === EQ_BANDS.length - 1 ? "highshelf" : "peaking";
      b.frequency.value = f; b.Q.value = 1; b.gain.value = gains[i];
      return b;
    });
    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    [...filters, analyser].forEach(n => { node.connect(n); node = n; });
    node.connect(ctx.destination);
  }

  return {
    el,
    async play() {
      ensureGraph();
      if (ctx && ctx.state === "suspended") await ctx.resume();
      return el.play();
    },
    setGain(i, db) { gains[i] = db; if (filters[i]) filters[i].gain.value = db; },
    setGains(arr) { arr.forEach((v, i) => this.setGain(i, v)); },
    getGains: () => [...gains],
    get analyser() { return analyser; }
  };
}
