# Product Requirements Document (PRD)

## Frame-by-Frame Client-Side Video Rendering (CSR)

**Status:** Draft
**Target Proyek:** Twibbon Video BEM Unsoed

---

## 1. Latar Belakang & Masalah

Saat ini, aplikasi merender video twibbon di sisi server (_Server-Side Rendering / SSR_) menggunakan FFmpeg. Meskipun menghasilkan video berkualitas tinggi tanpa membebani perangkat pengguna, pendekatan ini memiliki tantangan skala besar (skalabilitas). Jika ribuan pengguna merender secara bersamaan, server akan membutuhkan sistem antrean (queue) yang rumit, komputasi yang mahal, serta rentan terhadap _timeout_ dan _out of memory (OOM)_.

Sebelumnya, pendekatan _Client-Side Rendering (CSR)_ menggunakan `MediaRecorder` telah dicoba. Sayangnya, karena `MediaRecorder` bekerja secara _real-time_, perangkat (_smartphone_) kelas bawah (_low-end_) tidak sanggup merender frame dengan cepat, sehingga menghasilkan video yang patah-patah (_laggy_).

## 2. Tujuan (Objective)

Mengembalikan beban komputasi rendering video ke sisi klien (browser pengguna) untuk menghemat biaya server hingga 100%, **dengan syarat mutlak:** video akhir harus tetap berjalan mulus (misalnya stabil di 30 FPS), meskipun pengguna memakai perangkat _low-end_.

## 3. Solusi yang Diusulkan: Frame-by-Frame Encoding

Untuk mengatasi masalah FPS _drop_ pada `MediaRecorder` di perangkat lambat, sistem rendering CSR akan diubah menjadi **Frame-by-Frame Offline Encoding**.

- Sistem tidak akan merekam secara _real-time_.
- Sistem akan menggambar gambar overlay dan foto pengguna pada _Canvas_ frame demi frame.
- Sistem akan menunggu hingga satu frame selesai digambar sepenuhnya, baru memasukkannya ke dalam _encoder_ video, sebelum lanjut ke frame berikutnya.
- **Trade-off:** Proses _loading_ render di layar pengguna akan menjadi **lebih lama** (misalnya video berdurasi 10 detik bisa memakan waktu 30-40 detik untuk diproses di HP lambat). Namun, hasil videonya akan dijamin 100% mulus (smooth) seperti SSR.

## 4. Persyaratan Teknis (Technical Requirements)

1. **WebCodecs API**: Menggunakan API modern dari browser untuk melakukan kompresi frame tunggal ke video.
2. **MP4 Muxer**: Menggunakan pustaka _open-source_ (seperti `mp4-muxer` oleh muxinc) untuk membungkus frame dari WebCodecs menjadi file berekstensi `.mp4` standar yang didukung secara universal.
3. **Pemisahan Audio (Jika Ada)**: Jika video overlay memiliki audio, audio track tersebut harus diekstrak dan disisipkan kembali pada proses _muxing_ akhir.
4. **Fallback Mechanism**: Karena WebCodecs adalah teknologi yang relatif baru, harus ada deteksi dukungan (_feature detection_). Jika browser pengguna tidak mendukungnya (misal: browser sangat lawas), aplikasi akan menampilkan peringatan dan menggunakan alternatif `MediaRecorder` atau menginformasikan pengguna untuk meng-update browser mereka.

## 5. UI/UX yang Dibutuhkan

Karena waktu proses (_processing time_) akan bertambah lama pada perangkat _low-end_, pengalaman pengguna (UX) harus dikelola dengan hati-hati:

1. **Indikator Progres Akurat**: Menampilkan _progress bar_ (0% - 100%) yang dikalkulasi berdasarkan jumlah frame yang telah di-encode dibandingkan dengan total frame.
2. **Pesan Peringatan Edukatif**:
   - "Sedang memproses video kualitas tinggi..."
   - "⏳ Mohon jangan menutup browser atau pindah ke aplikasi lain selama proses ini berlangsung." (Mencegah OS HP menghentikan proses _background_).
3. **Efek Visual (Opsional)**: Menampilkan _preview_ frame yang sedang diproses agar layar tidak terlihat _freeze_.

## 6. Analisis Risiko & Mitigasi

| Risiko                          | Dampak                                                                                    | Strategi Mitigasi                                                                                                                                                 |
| :------------------------------ | :---------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tab Throttling / Suspended**  | OS HP mematikan proses jika pengguna pindah ke WhatsApp atau aplikasi lain saat merender. | Berikan instruksi jelas di UI untuk tetap menjaga layar menyala dan tidak pindah aplikasi.                                                                        |
| **Out of Memory (OOM) / Crash** | Browser _crash_ karena penumpukan memori gambar di HP dengan RAM kecil (1-2GB).           | Implementasikan _Garbage Collection_ agresif. Hapus/reset data Canvas dan cache gambar segera setelah sebuah frame berhasil di-encode.                            |
| **WebCodecs Tidak Didukung**    | Pengguna browser jadul tidak bisa memproses video.                                        | Sediakan deteksi otomatis saat memuat halaman, beri peringatan: _"Browser Anda tidak mendukung render video mulus. Silakan gunakan Chrome/Safari versi terbaru."_ |

## 7. Tahapan Implementasi (Milestones)

- [ ] **Fase 1:** Hapus/Nonaktifkan API `/api/render-video` SSR.
- [ ] **Fase 2:** Riset & pasang pustaka `mp4-muxer`.
- [ ] **Fase 3:** Buat _Proof of Concept (PoC)_ rendering video sederhana frame-by-frame di browser menggunakan `WebCodecs API`.
- [ ] **Fase 4:** Integrasikan pemotongan (_cropping_) foto pengguna dan _overlay_ animasi ke dalam siklus frame WebCodecs.
- [ ] **Fase 5:** Optimasi penggunaan memori pada perulangan frame.
- [ ] **Fase 6:** Pengujian silang (Cross-Browser Testing) di perangkat _low-end_ (Android RAM 3GB & iPhone lawas).
