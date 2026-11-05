# UltraLight Media — Claude Code Proje Rehberi

## Sabit V1 kararları
1. Vanilla JavaScript (ES modülleri), HTML, CSS. Framework, backend, analitik, uzak API yok.
2. PWA ilk sürümden itibaren zorunlu: `manifest.json`, `service-worker.js`, 192/512 PNG ikonlar.
3. Çevrimdışı uygulama kabuğu çalışır. Kullanıcı sesinin kalıcılığı IndexedDB işi bitene kadar garanti edilmez.
4. Üretim uygulama kabuğu 15 MB altında kalır; ölçüm yöntemi raporlanır.
5. FFmpeg ve AI modelleri çekirdeğe eklenmez (isteğe bağlı, lazy-load modüller).
6. Her özellik modüler geliştirilir; mevcut özellikler izinsiz kaldırılmaz.
7. Performans/bellek test edilir (object URL'ler iptal edilir, rAF yalnızca çalarken).
8. Karanlık tema varsayılan, açık tema isteğe bağlı.

## Yapı
`src/core` (durum, oynatıcı, olaylar) · `src/audio` (Web Audio, EQ, görselleştirici) · `src/library` (parçalar, arama, favoriler) · `src/storage` (ayarlar, IndexedDB) · `src/ui` (render, olaylar) · `src/modules` (gelecek) · `workers/` · `styles/`

`service-worker.js` içindeki `APP_SHELL` listesi, yeni dosya eklendiğinde ve `CACHE_NAME` sürümü artırılarak güncellenmelidir.

## İş akışı
1. Kodu incele, değişikliği kısaca özetle.
2. En küçük tutarlı değişikliği yap.
3. `node --check`, `node tests/smoke.mjs` çalıştır.
4. Değişen dosyaları, test sonuçlarını, bilinen sınırlamaları ve ölçülen boyutu raporla.
5. Çerçeve, bağımlılık, build aracı, backend, FFmpeg veya AI modeli eklemeden önce onay iste.

Her yeni özellik için: beklenen davranış, etkilenen dosyalar, hata/boş durumlar, erişilebilirlik ve klavye, performans etkisi, manuel test listesi.

## Gelecek modüller (V1'de yapılmaz)
Audio Studio (kırp, birleştir, fade, FFmpeg dönüşüm) · Video Studio (MP4, ses çıkarma/değiştirme) · AI Studio (vokal ayırma; model boyutu, WebGPU/WASM ve lisans değerlendirilmeden seçilmez).

## V1 tamamlanma ölçütleri
Chrome/Edge + bir ek tarayıcıda çalışır · normal akışta yakalanmamış hata yok · bozuk/desteklenmeyen dosyada zarif hata · manifest geçerli ve kurulabilir · ilk online ziyaretten sonra çevrimdışı açılır · dar/geniş ekran düzeni · çekirdek < 15 MB.
