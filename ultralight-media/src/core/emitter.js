export function createEmitter() {
  const map = new Map();
  return {
    on(evt, fn) { if (!map.has(evt)) map.set(evt, new Set()); map.get(evt).add(fn); return () => map.get(evt).delete(fn); },
    emit(evt, data) { map.get(evt)?.forEach(fn => fn(data)); }
  };
}
