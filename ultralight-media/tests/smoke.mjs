// Çalıştır: node tests/smoke.mjs
import assert from "node:assert/strict";
import { createLibrary } from "../src/library/library.js";
import { createEmitter } from "../src/core/emitter.js";
import { readFileSync } from "node:fs";

const lib = createLibrary({ bus: createEmitter(), makeUrl: f => "blob:" + f.name, revoke() {} });
const mk = (n, type = "audio/mpeg") => ({ name: n, size: n.length, type });
const r = lib.add([mk("Alpha.mp3"), mk("Beta.flac", ""), mk("notes.txt", "text/plain"), mk("Alpha.mp3")]);
assert.deepEqual(r, { added: 2, skipped: 2 }, "ekleme/atlama");
lib.setQuery("alp"); assert.equal(lib.list().length, 1, "arama");
lib.setQuery(""); lib.toggleFav(1); lib.setOnlyFavs(true);
assert.equal(lib.list().length, 1, "favori filtresi");
lib.remove(1); assert.equal(lib.all().length, 1, "silme");

const m = JSON.parse(readFileSync("manifest.json", "utf8"));
for (const k of ["name", "short_name", "start_url", "display", "theme_color", "background_color"]) assert.ok(m[k], "manifest." + k);
assert.ok(m.icons.some(i => i.sizes === "192x192") && m.icons.some(i => i.sizes === "512x512"), "PNG ikonlar");
console.log("Tüm testler geçti.");
