// requestAnimationFrame yalnızca çalma sırasında çalışır.
export function createVisualizer(canvas, engine) {
  const g = canvas.getContext("2d");
  let raf = 0, data = null;

  function resize() {
    const r = canvas.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, r.width * d); canvas.height = Math.max(1, r.height * d);
  }
  function frame() {
    const an = engine.analyser;
    const { width: w, height: h } = canvas;
    g.clearRect(0, 0, w, h);
    if (an) {
      data = data || new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(data);
      const n = 40, bw = w / n;
      g.fillStyle = getComputedStyle(canvas).getPropertyValue("--accent").trim() || "#a7f36b";
      for (let i = 0; i < n; i++) {
        const v = data[Math.floor(i * data.length / n)] / 255, bh = Math.max(2, v * h);
        g.fillRect(i * bw + 1, h - bh, bw - 2, bh);
      }
    }
    raf = requestAnimationFrame(frame);
  }
  return {
    start() { if (!raf && !matchMedia("(prefers-reduced-motion: reduce)").matches) { resize(); raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; g.clearRect(0, 0, canvas.width, canvas.height); },
    resize
  };
}
