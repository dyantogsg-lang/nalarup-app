# NalarUp — UX Spec v1

> Disusun dari review UX `Review_UX_NalarUp.pdf` dan diterapkan sebagai arah UX resmi NalarUp.

---

## 1. Prinsip UX Utama

NalarUp harus funnel-based, bukan sekadar kumpulan halaman.

Flow utama:

`Landing -> Register cepat -> Onboarding -> Rekomendasi tryout -> Detail tryout -> Ruang ujian -> Hasil -> Pembahasan salah -> Rekomendasi latihan berikutnya`

Tujuan UX:
- User cepat mulai latihan.
- User paham hasilnya.
- User terdorong latihan lagi.
- User merasa progresnya meningkat, bukan hanya mengerjakan soal.

Positioning UX:

> NalarUp adalah platform peningkatan skor tryout, bukan sekadar bank soal online.

Positioning produk yang lebih tajam:

> NalarUp membantu peserta menaikkan skor sampai aman passing grade lewat simulasi tryout, analisis kelemahan, dan latihan perbaikan.

Loop utama produk:

`Tryout -> Hasil -> Kelemahan -> Latihan pendek -> Tryout ulang -> Skor naik`

Kata kunci UX:
- Skor aman.
- Passing grade.
- Latihan terarah.
- Perbaikan kelemahan.
- Simulasi realistis.
- Progress naik.

---

## 2. Landing Page

Landing page harus menambah trust/social proof.

Elemen wajib:
- Hero: latihan tryout realistis.
- CTA: “Mulai Tryout”.
- Paket tryout populer.
- Preview ruang ujian.
- Preview hasil dan pembahasan.
- Social proof:
  - “Dipakai oleh 12.000+ pejuang CASN”.
  - “Rata-rata pengguna mengerjakan 3 tryout per minggu”.
  - Testimoni singkat.
  - Preview ranking/skor anonim.
  - Badge “Simulasi mengikuti format SKD CAT”.
- Penjelasan bahwa fase awal open access tanpa lock/paywall.

Catatan: jangan terlalu menonjolkan AI di awal. AI adalah fitur lanjutan, bukan core headline.

---

## 3. Register dan Onboarding

Register harus cepat:
- Nama.
- Email.
- Password.

Setelah register, user masuk onboarding singkat, bukan dashboard kosong.

Pertanyaan onboarding:
1. Kamu sedang persiapan apa?
   - CPNS
   - PPPK
   - SKB
   - Belum tahu
2. Mau mulai dari mana?
   - Tryout SKD Pertama
   - Latihan TWK
   - Latihan TIU
   - Latihan TKP

Setelah onboarding:
- Tampilkan CTA besar: “Mulai Tryout SKD Pertama”.
- Rekomendasi paket langsung terlihat.

---

## 4. Dashboard UX

Dashboard harus berbeda untuk user baru dan user lama.

### User baru

Jangan tampilkan progress kosong berlebihan.

Isi dashboard:
- CTA “Mulai Tryout Pertama”.
- Rekomendasi paket pertama.
- Alasan kenapa mulai dari SKD dasar.
- Empty state riwayat:
  > “Belum ada riwayat tryout. Mulai tryout pertamamu untuk melihat skor, passing grade, dan pembahasan.”

### User lama

Isi dashboard:
- Lanjutkan tryout terakhir jika ada attempt aktif.
- Skor terakhir.
- Subtes terlemah.
- Rekomendasi latihan berikutnya.
- Streak.
- Riwayat.

Pertanyaan yang harus dijawab dashboard:
- Saya harus latihan apa sekarang?
- Perkembangan saya gimana?
- Apa kelemahan saya?
- Saya bisa lanjut dari mana?

---

## 5. Katalog Tryout

Katalog harus kuat, tetapi filter MVP jangan terlalu ramai.

### Filter utama MVP

- Semua
- SKD
- TWK
- TIU
- TKP

Filter tambahan masuk ke “Filter Lanjutan”:
- Durasi
- Level
- Status pengerjaan
- Mini tryout
- Full simulasi

### Layout katalog

Urutan section:
1. Search bar.
2. Chips filter sederhana.
3. Direkomendasikan untuk kamu.
4. Mulai latihan.
5. Full Simulasi SKD.
6. Latihan per subtes.

Card tryout harus menampilkan:
- Badge kategori.
- Nama paket.
- Deskripsi pendek.
- Jumlah soal.
- Durasi.
- Difficulty.
- Status user: belum dikerjakan / skor terakhir / lulus / belum lulus.
- CTA: Mulai / Ulangi / Review.

---

## 6. Before Exam Flow / Detail Tryout

Halaman Detail Tryout adalah pusat informasi sebelum ujian.

Struktur wajib:
1. Header paket.
2. Ringkasan cepat:
   - Jumlah soal.
   - Durasi.
   - Passing grade.
   - Mode.
3. Komposisi subtes.
4. Riwayat attempt jika ada.
5. Aturan penting berbentuk checklist.
6. CTA besar “Mulai Tryout”.
7. Modal konfirmasi “Siap memulai?”.

Aturan checklist pendek:
- Timer berjalan setelah kamu mulai.
- Jawaban tersimpan otomatis.
- Jawaban bisa diubah sebelum submit.
- Ujian otomatis submit saat waktu habis.
- Pembahasan muncul setelah submit.

Modal “Siap memulai?” harus menampilkan:
- Durasi.
- Jumlah soal.
- Timer tidak berhenti setelah dimulai.
- Pastikan koneksi stabil.
- Tombol “Mulai Sekarang”.

---

## 7. Ruang Ujian Desktop

Layout desktop:
- Header ringkas.
- Status strip.
- Area soal utama.
- Sidebar timer + nomor soal.
- Bottom navigation.

Prinsip:
- Tidak ada instruksi panjang di dalam soal.
- Fokus ke soal dan jawaban.
- Timer jelas.
- Status jawaban jelas.
- Submit selalu butuh konfirmasi.

State wajib:
- Normal timer putih.
- Sisa <15 menit: amber.
- Sisa <5 menit: merah.
- Sisa <1 menit: pulse.
- Auto-save: “Menyimpan...” -> “Tersimpan”.
- Save gagal: tampilkan retry/non-blocking warning.
- Waktu habis: auto-submit lalu redirect hasil.
- Refresh: attempt tetap lanjut berdasarkan server `started_at`.

---

## 8. Ruang Ujian Mobile

Mobile harus dipikirkan sejak awal karena banyak user latihan dari HP.

Layout mobile:
- Timer sticky di atas.
- Area soal full-width.
- Navigasi previous/next sticky bottom.
- Tombol “Daftar Soal” membuka drawer/bottom sheet.
- Nomor soal tidak memenuhi layar utama.
- Submit tidak terlalu mudah tersentuh; tampil di menu atau nomor terakhir.

Bottom sheet daftar soal:
- Ringkasan dijawab/ragu/kosong.
- Grid nomor soal.
- Legend warna.
- Tombol submit.

---

## 9. Edge State: Error, Loading, Offline, Refresh

State ini harus dirancang sejak awal:
- Jawaban gagal tersimpan.
- Koneksi putus saat ujian.
- Timer tetap berjalan walau koneksi buruk.
- Refresh halaman.
- User membuka dua tab attempt yang sama.
- Waktu habis tapi koneksi buruk.
- Submit gagal.
- Attempt expired.
- Paket tidak tersedia.
- Paket belum tersedia.
- Akses berbayar nanti jika monetisasi aktif.

Prinsip:
- Jangan membuat user panik.
- Beri status jelas.
- Retry otomatis jika aman.
- Jangan hilangkan jawaban lokal saat koneksi buruk.

---

## 10. Auto-Save dan Refresh Handling

Wajib untuk trust.

MVP minimal:
- Simpan jawaban setiap user memilih opsi.
- Simpan `attempt_id`.
- Timer dihitung dari `started_at` server.
- Saat reload, fetch attempt aktif.
- Jika waktu habis, auto-submit.
- Jika save gagal, tampilkan status dan retry.

---

## 11. Hasil Tryout

Hasil harus actionable, bukan cuma angka.

Urutan halaman:
1. Status besar: Lulus / Belum Lulus.
2. Skor total.
3. Skor per subtes.
4. Passing grade comparison.
5. Skor Aman Meter:
   > “Skor kamu 325. Target aman 350. Butuh +25 poin lagi.”
6. Ringkasan benar/salah/kosong/waktu.
7. Prioritas Belajar Kamu.
8. CTA latihan berikutnya.

Prioritas Belajar contoh:
- TIU Penalaran Numerik — 8 salah.
- TIU Deret Angka — 5 salah.
- TWK Nasionalisme — 4 salah.

CTA:
- “Bahas soal salah”.
- “Latihan 15 soal TIU sekarang”.
- “Ulangi tryout”.
- “Coba paket serupa”.

---

## 12. Pembahasan

Default setelah hasil: arahkan ke soal yang salah, bukan soal nomor 1.

Filter:
- Semua.
- Salah.
- Benar.
- Kosong.
- Ragu-ragu.

Mode review:
1. Mode Belajar
   - Soal lengkap.
   - Jawaban user.
   - Jawaban benar.
   - Pembahasan lengkap.
   - Topik.
2. Mode Review Cepat
   - Hanya soal salah.
   - Jawaban benar.
   - Ringkasan pembahasan pendek.
   - Tombol “Saya paham”.

Fitur tambahan:
- Simpan soal sulit.
- Laporkan soal.
- Tanya AI nanti.

---

## 12. Mode Latihan vs Mode Simulasi

NalarUp perlu dua mode utama.

### Mode Simulasi

Untuk pengalaman seperti ujian:
- Timer ketat.
- Tidak ada pembahasan saat ujian.
- Submit di akhir.
- Hasil setelah selesai.
- Cocok untuk full tryout.

### Mode Latihan

Untuk belajar cepat:
- Per topik/per subtes.
- Bisa 10–20 soal.
- Pembahasan bisa muncul setelah menjawab.
- Tidak harus formal.
- Cocok untuk memperbaiki kelemahan.

Implikasi:
- Katalog membedakan “Simulasi” dan “Latihan”.
- Hasil tryout bisa merekomendasikan Mode Latihan.

---

## 13. Akses Produk Fase Awal

Untuk fase awal, semua paket dibuat open access. Tidak ada badge akses berbayar, lock, atau paywall.

Alasan:
- Validasi core UX lebih cepat.
- User bisa mencoba banyak tryout tanpa friksi.
- Fokus produk tetap pada loop peningkatan skor.

Monetisasi bisa dibahas lagi setelah produk inti, konten soal, dan retensi latihan terbukti.

---

## 14. Admin UX, Import Soal, dan Scoring

Karena NalarUp akan punya banyak tryout, admin harus siap dari awal.

Entity admin:
- Paket tryout.
- Soal.
- Opsi jawaban.
- Pembahasan.
- Subtes.
- Topik.
- Difficulty.
- Scoring type.
- Status draft/published.

Scoring type:
- `single_correct` untuk TWK/TIU.
- `weighted_options` untuk TKP.

Import Excel/CSV sangat penting setelah MVP dasar.

Import harus mendukung:
- Template Excel/CSV.
- Preview sebelum import.
- Validasi error.
- Mapping kolom.
- Import opsi A–E.
- Import jawaban benar.
- Import skor TKP per opsi.
- Import pembahasan.
- Import topik/subtopik/difficulty.

---

## 15. Empty, Error, Loading State

Wajib ada di desain.

### Empty state

- Belum ada riwayat.
- Belum ada paket sesuai filter.
- Belum ada rekomendasi.

### Loading state

- Loading katalog.
- Loading attempt.
- Menyimpan jawaban.
- Menghitung hasil.

### Error state

- Save jawaban gagal.
- Koneksi lambat.
- Attempt sudah expired.
- Paket tidak tersedia.
- Paket belum tersedia atau belum dipublish.

---

## 16. Gamification Ringan dan Benchmark

Fitur motivasi:
- Skor Aman Meter.
- Streak latihan.
- Ranking anonim.
- Benchmark: “Skormu lebih tinggi dari 68% peserta lain.”
- Ranking anonim: “Ranking #842 dari 12.400.”
- Rata-rata peserta: “Rata-rata peserta: 312.”
- Target aman: “Target aman: 350.”
- Saved Questions.
- Latihan perbaikan otomatis.

Jangan terlalu ramai di MVP. Mulai dari:
- Streak.
- Skor aman meter.
- Rekomendasi latihan setelah hasil.

---

## 17. Brand Copy dan Legal Disclaimer

Tone NalarUp:
- Serius.
- Menenangkan.
- Memotivasi.
- Jelas.
- Tidak menggurui.

Rekomendasi copy:
- “Mulai Tryout” untuk paket simulasi.
- “Mulai Latihan” untuk mode latihan.
- “Belum aman passing grade” daripada “Tidak lulus”.
- “Skor aman” sebagai konsep utama.

Legal/disclaimer:
- Jangan klaim “resmi BKN”.
- Jangan klaim “CAT BKN resmi”.
- Jangan klaim “dijamin lulus”.
- Gunakan “Simulasi mengikuti format SKD CAT”.
- Gunakan “Tampilan dibuat mendekati pengalaman ujian CAT”.
- Gunakan “NalarUp bukan situs resmi BKN.”

Disclaimer perlu muncul di:
- Footer landing page.
- Halaman detail tryout.
- Modal sebelum mulai ujian jika diperlukan.
- Terms/Privacy nanti.

---

## 18. Konten dan Kualitas Soal

Standar konten wajib:
- Format soal.
- Format opsi.
- Format pembahasan.
- Topik/subtopik.
- Difficulty.
- Scoring type.
- Validasi soal.
- Status soal: draft, reviewed, published, archived.
- Soal yang dilaporkan user.
- Versioning soal jika dikoreksi.
- Catatan sumber/kurasi soal.

Standar pembahasan minimal:
- Jawaban benar.
- Alasan jawaban benar.
- Kenapa opsi lain salah jika perlu.
- Tips cepat atau pola soal.

---

## 19. Roadmap Dokumen Teknis

Dokumen pendukung yang perlu dibuat:
- `DATABASE_SCHEMA.md`
- `USER_FLOWS.md`
- `UX_STATES.md`
- `CONTENT_GUIDELINES.md`
- `ADMIN_IMPORT_SPEC.md`
- `SCORING_RULES.md`
- `MOBILE_EXAM_UX.md`

Prioritas dokumen berikutnya:
1. `USER_FLOWS.md`
2. `UX_STATES.md`
3. `CONTENT_GUIDELINES.md`
4. `ADMIN_IMPORT_SPEC.md`
5. `DATABASE_SCHEMA.md`

---

## 20. Prioritas Pengerjaan UX

Urutan terbaru:
1. Before Exam Flow / Detail Tryout — selesai: `03-tryout-detail.html`.
2. Ruang Ujian desktop + mobile — selesai: `02-exam-room.html`.
3. Hasil Tryout + rekomendasi latihan — selesai: `04-result.html`.
4. Pembahasan soal salah — selesai: `05-review.html`.
5. Katalog Tryout — selesai: `06-tryout-catalog.html`.
6. Dashboard user baru/lama — selesai: `07-dashboard.html`.
7. UX states / empty / error / loading / offline — selesai: `UX_STATES.md`.
8. Database schema — selesai: `DATABASE_SCHEMA.md`.
9. Next.js implementation plan — selesai: `NEXTJS_IMPLEMENTATION_PLAN.md`.
10. Admin/import spec dan scoring TKP detail — selesai: `ADMIN_IMPORT_SPEC.md`.
11. Bootstrap Next.js app — berikutnya.
