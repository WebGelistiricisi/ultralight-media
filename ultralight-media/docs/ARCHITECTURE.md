# UltraLight Media — Mimari

Katmanlar: UI → Player durumu (`core`) → Ses motoru (`audio`) + Kütüphane (`library`) + Ayarlar (`storage`). Modüller arası iletişim `core/emitter.js` olay veriyolu ile yapılır; `app.js` yalnızca bağlar.

- **Oynatma:** HTMLAudioElement (akış). Web Audio grafiği (5 bant EQ → analyser) ilk oynatmada kurulur.
- **Kütüphane:** bellekte; Object URL'ler silinince iptal edilir. Favoriler `ad|boyut` anahtarıyla ayarlarda saklanır.
- **PWA:** service worker yalnızca uygulama kabuğunu önbelleğe alır, kullanıcı müziğini değil.
- **Sonraki sprintler:** IndexedDB kütüphane kalıcılığı → mini player/kuyruk → Audio/Video/AI Studio (isteğe bağlı modüller).
