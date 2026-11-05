const KEY = "ultralight-settings-v1";
const defaults = { theme: "dark", volume: 0.8, shuffle: false, repeat: "off", eq: [0, 0, 0, 0, 0], favs: [] };

export function loadSettings() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return { ...defaults }; }
}
export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* depolama kapalı olabilir */ }
}
