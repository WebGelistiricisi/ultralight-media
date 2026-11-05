# UltraLight Media

Hafif, yerel, çevrimdışı çalışabilen PWA müzik çalar (Vanilla JS, build aracı yok).

## Çalıştırma
```bash
python3 -m http.server 8080   # sonra http://localhost:8080 (file:// ile açma)
```
## Test
```bash
node tests/smoke.mjs
```
## Özellikler
Dosya seç / sürükle-bırak · oynat-duraklat-önceki-sonraki · konum ve süre · ses · shuffle/repeat · arama · favoriler · 5 bant EQ · frekans görselleştirici · koyu/açık tema · klavye (Boşluk, ←/→, Shift+←/→) · kurulabilir PWA.

## Sınırlar
Biçim desteği tarayıcıya bağlıdır. Parçalar sayfa yenilenince silinir (IndexedDB Sprint 2). Çevrimdışı destek yalnızca uygulama kabuğudur.

## Claude Code
`claude` ile başlat; `CLAUDE.md` ve `docs/ARCHITECTURE.md` önce okunur.
