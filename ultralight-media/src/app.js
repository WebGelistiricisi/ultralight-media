import { createEmitter } from "./core/emitter.js";
import { createPlayer } from "./core/player.js";
import { createEngine } from "./audio/engine.js";
import { createVisualizer } from "./audio/visualizer.js";
import { createLibrary } from "./library/library.js";
import { loadSettings, saveSettings } from "./storage/settings.js";
import { mountUI } from "./ui/ui.js";

const bus = createEmitter();
const settings = loadSettings();
const engine = createEngine();
const library = createLibrary({ bus, favorites: settings.favs });
const player = createPlayer({ engine, library, bus });
player.state.shuffle = settings.shuffle;
player.state.repeat = settings.repeat;
const viz = createVisualizer(document.querySelector("#viz"), engine);

mountUI({ engine, player, library, viz, bus, settings, persist: () => saveSettings(settings) });

if ("serviceWorker" in navigator) {
  addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(e => console.warn("SW kaydı başarısız:", e)));
}
