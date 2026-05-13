# NalarUp — Product Gaps & Improvements

> Daftar hal yang masih kurang dan harus dimasukkan ke arah produk NalarUp. Ini menjadi pelengkap `PROJECT_PLAN.md` dan `UX_SPEC.md`.

---

## 1. Identitas Produk yang Lebih Tajam

NalarUp tidak boleh hanya terdengar seperti “platform tryout CASN”. Positioning harus lebih tajam:

> NalarUp membantu peserta menaikkan skor sampai aman passing grade lewat simulasi tryout, analisis kelemahan, dan latihan perbaikan.

Kata kunci brand:
- Skor aman
- Passing grade
- Latihan terarah
- Perbaikan kelemahan
- Simulasi realistis
- Progress naik

Implikasi UX/copy:
- Landing page harus bicara tentang naik skor, bukan hanya banyak soal.
- Hasil tryout harus mengarah ke “apa yang harus diperbaiki”.
- Premium harus terasa sebagai program peningkatan skor.

---

## 2. Sistem Setelah Hasil

NalarUp tidak boleh berhenti di “ini skor kamu”. Setelah hasil, user harus langsung tahu langkah berikutnya.

Wajib ada:
- Rekomendasi otomatis setelah hasil.
- Latihan perbaikan berdasarkan soal salah.
- Prioritas belajar.
- Target skor aman.
- CTA latihan berikutnya.

Contoh copy:

> Kamu belum aman di TIU. Fokus perbaikan: Penalaran Numerik dan Deret Angka. Mulai latihan 15 soal sekarang.

Ini membuat NalarUp terasa pintar bahkan sebelum fitur AI dibangun.

---

## 3. Mode Latihan vs Mode Simulasi

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

Implikasi produk:
- Katalog perlu membedakan “Simulasi” dan “Latihan”.
- Hasil tryout bisa merekomendasikan Mode Latihan.

---

## 4. Mobile UX Harus Diwujudkan

Mobile bukan sekadar responsive; harus punya pola UX sendiri.

Ruang ujian mobile:
- Timer sticky di atas.
- Area soal full-width.
- Opsi jawaban nyaman disentuh.
- Navigasi previous/next sticky bottom.
- Tombol “Daftar Soal” membuka bottom sheet.
- Submit tidak terlalu mudah tersentuh.

Bottom sheet daftar soal:
- Ringkasan dijawab/ragu/kosong.
- Grid nomor soal.
- Legend warna.
- Tombol submit final.

Risiko jika tidak dipikirkan:
- User HP merasa sulit pindah soal.
- Salah klik submit.
- Timer/nomor soal memenuhi layar.

---

## 5. Data Soal dan Kualitas Konten

Produk tryout hidup dari kualitas soal. UI bagus tidak cukup.

Perlu standar konten:
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

## 6. Admin dan Import Soal

Karena targetnya banyak tryout, input manual satu-satu tidak cukup.

Admin harus mendukung:
- CRUD paket tryout.
- CRUD soal.
- CRUD opsi jawaban.
- Assign soal ke paket.
- Publish/unpublish.
- Review laporan soal.

Import yang perlu dirancang:
- Template Excel/CSV.
- Preview sebelum import.
- Validasi error.
- Mapping kolom.
- Import opsi A–E.
- Import jawaban benar.
- Import skor TKP per opsi.
- Import pembahasan.
- Import topik/subtopik/difficulty.

File khusus yang perlu dibuat nanti:
- `ADMIN_IMPORT_SPEC.md`
- `CONTENT_GUIDELINES.md`

---

## 7. Monetisasi yang Lebih Detail

Premium harus punya trigger upgrade yang natural, bukan sekadar “unlock all”.

Trigger upgrade:
- Mau membuka full simulasi 110 soal.
- Mau melihat pembahasan lengkap.
- Mau akses latihan berdasarkan kelemahan.
- Mau paket SKB/formasi.
- Mau ranking nasional.
- Mau ulangi lebih banyak paket.
- Mau tryout live berkala.

Copy premium:

> Buka akses latihan terarah sampai skor kamu aman passing grade.

Premium harus terasa sebagai program peningkatan skor, bukan hanya paywall.

---

## 8. Trust Layer

Market CASN sensitif. User butuh bukti bahwa platform serius dan tidak menyesatkan.

Trust layer yang perlu ditambahkan:
- Social proof.
- Preview soal.
- Contoh pembahasan.
- Testimoni.
- Statistik pengguna.
- Badge “Simulasi mengikuti format SKD CAT”.
- Informasi penyusun/kurator soal.
- Kebijakan refund/payment nanti.
- Disclaimer bahwa NalarUp bukan situs resmi BKN.

Copy aman:

> Simulasi mengikuti format SKD CAT. NalarUp bukan situs resmi BKN.

---

## 9. Error, Loading, Offline, dan Edge State

State ini harus dirancang, bukan dipikirkan belakangan.

State penting:
- Jawaban gagal tersimpan.
- Koneksi putus saat ujian.
- Timer tetap berjalan.
- Refresh halaman.
- User membuka dua tab attempt yang sama.
- Waktu habis tapi koneksi buruk.
- Submit gagal.
- Attempt expired.
- Paket tidak tersedia.
- Akses premium ditolak.
- Payment gagal nanti.

Prinsip:
- Jangan membuat user panik.
- Beri status jelas.
- Retry otomatis jika aman.
- Jangan hilangkan jawaban lokal saat koneksi buruk.

---

## 10. Benchmark dan Ranking

Tryout lebih menarik jika user tahu posisinya.

Fitur benchmark:
- “Skormu lebih tinggi dari 68% peserta lain.”
- “Ranking #842 dari 12.400.”
- “Rata-rata peserta: 312.”
- “Target aman: 350.”
- Ranking anonim.

Ranking tidak perlu real-time di MVP, bisa dihitung dari attempt historis.

---

## 11. Personal Learning Loop

Loop utama NalarUp:

`Tryout -> Hasil -> Kelemahan -> Latihan pendek -> Tryout ulang -> Skor naik`

Produk harus selalu mengarahkan user ke loop ini.

Implementasi UX:
- Setelah hasil, tampilkan kelemahan utama.
- Tawarkan latihan pendek.
- Setelah latihan, rekomendasikan tryout ulang.
- Tampilkan perubahan skor dari attempt sebelumnya.

Ini adalah pembeda utama NalarUp.

---

## 12. Struktur Brand dan Copy

Tone NalarUp harus serius, menenangkan, dan memotivasi.

Hindari terlalu playful.

Rekomendasi copy:
- Gunakan “Mulai Tryout” untuk paket simulasi.
- Gunakan “Mulai Latihan” untuk mode latihan.
- Gunakan “Belum aman passing grade” daripada “Tidak lulus” jika ingin lebih suportif.
- Gunakan “Buka akses” daripada “Upgrade” jika ingin terasa lebih lokal dan natural.
- Gunakan “Skor aman” sebagai konsep utama.

Tone:
- Serius.
- Jelas.
- Tidak menggurui.
- Memotivasi.

---

## 13. Legal dan Etik Disclaimer

Karena produk meniru format CAT, copy harus hati-hati.

Jangan klaim:
- “Resmi BKN”.
- “CAT BKN resmi”.
- “Dijamin lulus”.

Gunakan:
- “Simulasi mengikuti format SKD CAT”.
- “Tampilan dibuat mendekati pengalaman ujian CAT”.
- “NalarUp bukan situs resmi BKN.”

Disclaimer perlu muncul di:
- Footer landing page.
- Halaman detail tryout.
- Modal sebelum mulai ujian jika diperlukan.
- Terms/Privacy nanti.

---

## 14. Roadmap Teknis yang Lebih Detail

Project besar ini perlu dokumen pendukung agar tidak berantakan.

Dokumen yang perlu dibuat:
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

## Kesimpulan Strategis

NalarUp harus diperkuat menjadi:

> Sistem latihan berulang untuk menaikkan skor sampai aman passing grade.

Bukan hanya:

> Tempat mengerjakan banyak tryout.

Prioritas produk yang paling penting:
1. Detail Tryout / before exam flow.
2. Sistem hasil yang actionable.
3. Mode latihan selain mode simulasi.
4. Mobile exam UX.
5. Admin/import soal.
6. Standar kualitas soal dan pembahasan.
