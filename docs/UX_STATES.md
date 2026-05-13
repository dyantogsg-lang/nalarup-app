# NalarUp — UX States v1

> Spesifikasi empty, loading, error, offline, refresh, dan edge states untuk menjaga trust user saat latihan tryout. Mengacu pada `UX_SPEC.md`, `PRODUCT_GAPS_AND_IMPROVEMENTS.md`, dan prototype HTML fase 1.

---

## 1. Prinsip Umum State

NalarUp harus terasa tenang dan dapat dipercaya, terutama saat user sedang ujian.

Prinsip utama:

1. Jangan membuat user panik.
2. Selalu beri status yang jelas: apa yang terjadi, apakah jawaban aman, dan apa yang bisa dilakukan user.
3. Retry otomatis jika aman dilakukan.
4. Jangan hilangkan jawaban lokal saat koneksi buruk.
5. Timer ujian tetap mengikuti `started_at` server, bukan kondisi browser.
6. State harus actionable, bukan hanya pesan error.
7. Untuk fase awal, jangan munculkan paywall, lock, atau badge akses berbayar.

Tone copy:
- Serius.
- Menenangkan.
- Jelas.
- Tidak menyalahkan user.
- Tidak memakai bahasa teknis berlebihan.

---

## 2. State Global Aplikasi

### 2.1 Initial page loading

Dipakai saat halaman app pertama kali dimuat.

UI:
- Background navy.
- Skeleton card/glassmorphism sesuai design system.
- Loader kecil, bukan spinner besar yang mengganggu.

Copy:
> Menyiapkan latihan kamu...

Fallback jika > 5 detik:
> Koneksi agak lambat. Kami masih mencoba memuat data latihanmu.

Action:
- Retry otomatis.
- Tampilkan tombol `Coba lagi` jika gagal.

### 2.2 Auth/session loading

Dipakai saat cek session user.

Copy:
> Mengecek sesi masuk...

Jika session expired:
> Sesi kamu sudah berakhir. Masuk lagi untuk melanjutkan latihan.

CTA:
- `Masuk lagi`

### 2.3 Global network offline

Dipakai saat browser mendeteksi offline.

UI:
- Banner non-blocking di atas.
- Warna amber, bukan merah kecuali data penting gagal tersimpan.

Copy:
> Koneksi terputus. Jawaban tetap disimpan sementara di perangkat ini dan akan dikirim saat koneksi kembali.

CTA:
- `Coba sinkronkan`

Action:
- Simpan jawaban ke local queue.
- Retry saat online.
- Jangan hentikan timer ujian.

---

## 3. Dashboard States

Dashboard punya dua state utama: user baru dan user lama.

### 3.1 User baru — belum ada attempt

Tujuan:
- Jangan tampilkan progress kosong berlebihan.
- Dorong user mulai tryout pertama.

UI:
- Hero onboarding singkat.
- CTA besar `Mulai Tryout SKD Pertama`.
- Card rekomendasi paket pertama.
- Empty state riwayat.

Copy:
> Belum ada riwayat tryout. Mulai tryout pertamamu untuk melihat skor, passing grade, pembahasan, dan rekomendasi latihan berikutnya.

CTA:
- `Mulai Tryout SKD Pertama`
- `Lihat Katalog`

### 3.2 User lama — ada attempt selesai

UI wajib:
- Skor terakhir.
- Skor aman meter.
- Subtes terlemah.
- Rekomendasi latihan berikutnya.
- Riwayat terakhir.
- Streak.

Copy utama:
> Lanjutkan loop latihan sampai skor aman passing grade.

CTA prioritas:
- Jika ada kelemahan: `Mulai Latihan [Subtes/Topik]`.
- Jika sudah latihan: `Ulangi Tryout`.

### 3.3 Ada attempt aktif

UI:
- Banner/hero khusus di paling atas.
- Tampilkan paket, started_at, sisa waktu, progress jawaban.

Copy:
> Kamu masih punya tryout yang sedang berjalan. Waktu tetap berjalan sejak kamu mulai.

CTA:
- `Lanjutkan Tryout`
- `Lihat detail paket`

### 3.4 Riwayat kosong tapi onboarding selesai

Copy:
> Kamu sudah siap mulai. Kerjakan satu tryout pertama agar NalarUp bisa membaca kelemahan dan memberi rekomendasi latihan.

CTA:
- `Mulai Tryout Rekomendasi`

---

## 4. Katalog Tryout States

### 4.1 Loading katalog

UI:
- Skeleton search bar.
- Skeleton 6 card paket.

Copy kecil:
> Memuat paket tryout...

### 4.2 Katalog kosong

Dipakai jika belum ada paket published.

Copy:
> Paket tryout belum tersedia.

Subcopy:
> Tim NalarUp sedang menyiapkan paket latihan. Coba lagi nanti.

CTA:
- `Refresh`

### 4.3 Tidak ada hasil filter/search

Copy:
> Tidak ada paket yang cocok dengan filter ini.

Subcopy:
> Coba hapus beberapa filter atau gunakan kata kunci lain.

CTA:
- `Reset filter`

### 4.4 Paket tidak tersedia / unpublished

Copy:
> Paket ini belum tersedia.

Subcopy:
> Paket mungkin sedang diperbarui atau belum dipublikasikan.

CTA:
- `Kembali ke Katalog`

### 4.5 Rekomendasi belum tersedia

Copy:
> Rekomendasi akan muncul setelah kamu mengerjakan tryout pertama.

CTA:
- `Mulai Tryout SKD Pertama`

---

## 5. Detail Tryout / Before Exam States

### 5.1 Loading detail paket

Copy:
> Memuat detail tryout...

Skeleton:
- Header paket.
- Ringkasan durasi/soal/passing grade.
- CTA area.

### 5.2 Paket ditemukan tapi soal belum lengkap

Copy:
> Paket ini belum siap dikerjakan.

Subcopy:
> Jumlah soal belum sesuai konfigurasi paket. Coba paket lain dulu.

CTA:
- `Lihat paket lain`

### 5.3 Attempt creation loading

Saat user klik `Mulai Tryout`.

Copy:
> Menyiapkan ruang ujian...

Action:
- Disable tombol mulai.
- Jangan buat attempt ganda jika user klik berulang.
- Server harus idempotent atau client menahan multiple submit.

### 5.4 Attempt creation failed

Copy:
> Ruang ujian belum bisa dibuat.

Subcopy:
> Koneksi atau server sedang bermasalah. Belum ada timer yang berjalan.

CTA:
- `Coba mulai lagi`
- `Kembali ke detail`

### 5.5 Modal siap memulai

Wajib muncul sebelum ujian.

Copy:
> Siap memulai?

Checklist:
- Timer berjalan setelah kamu klik mulai.
- Jawaban tersimpan otomatis.
- Jawaban bisa diubah sebelum submit.
- Ujian otomatis submit saat waktu habis.
- Pembahasan muncul setelah submit.

CTA:
- `Mulai Sekarang`
- `Batal`

---

## 6. Ruang Ujian States

Ruang ujian adalah state paling kritis.

### 6.1 Loading attempt

Copy:
> Membuka ruang ujian...

Subcopy:
> Timer dihitung dari waktu mulai yang tersimpan di server.

Action:
- Fetch attempt.
- Fetch answers existing.
- Hitung sisa waktu dari `started_at + duration_minutes`.

### 6.2 Answer save lifecycle

State status autosave:

1. Idle/saved
   - Copy: `Tersimpan otomatis`
   - Warna: green.

2. Saving
   - Copy: `Menyimpan...`
   - Warna: muted/blue.

3. Save failed, will retry
   - Copy: `Koneksi lambat. Jawaban disimpan sementara dan akan dicoba lagi.`
   - Warna: amber.

4. Save failed after retry
   - Copy: `Jawaban belum tersinkron. Jangan tutup halaman sampai koneksi kembali.`
   - Warna: red/amber sesuai tingkat kritis.

Action:
- Simpan pilihan terakhir di local state dan local queue.
- Retry dengan backoff.
- Saat online, flush queue.

### 6.3 Offline saat ujian

Copy banner:
> Koneksi terputus. Timer tetap berjalan, jawabanmu disimpan sementara di perangkat ini.

Action:
- Timer tetap berjalan.
- Jawaban tetap bisa dipilih.
- Disable final submit jika belum bisa menjamin sync, kecuali sistem mendukung submit offline queue.

### 6.4 Refresh halaman saat ujian

Behavior:
- Ambil attempt aktif dari server.
- Restore selected answers.
- Hitung sisa waktu dari server time jika memungkinkan.
- Jika waktu sudah habis, auto-submit/redirect hasil.

Copy saat restore:
> Mengembalikan jawaban dan waktu ujian...

### 6.5 Dua tab attempt yang sama

Behavior MVP:
- Deteksi via `localStorage` heartbeat.
- Tab kedua tampil warning.

Copy:
> Tryout ini sedang dibuka di tab lain.

Subcopy:
> Agar jawaban tidak bentrok, lanjutkan dari satu tab saja.

CTA:
- `Gunakan tab ini`
- `Tutup halaman ini`

### 6.6 Timer warning states

- Normal: putih.
- Sisa < 15 menit: amber.
- Sisa < 5 menit: red.
- Sisa < 1 menit: red pulse.

Copy optional:
> Waktu hampir habis. Periksa soal kosong sebelum submit.

### 6.7 Waktu habis

Copy:
> Waktu habis. Jawabanmu sedang dikirim otomatis.

Action:
- Lock input.
- Submit attempt.
- Jika submit berhasil: redirect hasil.
- Jika submit gagal: retry background, tetap tampilkan state aman.

### 6.8 Submit confirmation

Copy:
> Selesaikan ujian sekarang?

Subcopy:
> Setelah disubmit, jawaban tidak bisa diubah dan hasil akan langsung dihitung.

Tampilkan ringkasan:
- Dijawab.
- Ragu-ragu.
- Kosong.

CTA:
- `Cek lagi`
- `Ya, submit`

### 6.9 Submit failed

Copy:
> Submit belum berhasil.

Subcopy:
> Jawabanmu masih tersimpan. Coba submit lagi atau tunggu koneksi membaik.

CTA:
- `Coba submit lagi`

### 6.10 Attempt expired

Copy:
> Waktu tryout sudah berakhir.

Subcopy:
> Attempt ini sudah melewati batas waktu. Kami akan mengarahkanmu ke hasil jika jawaban sudah dihitung.

CTA:
- `Lihat Hasil`
- `Kembali ke Detail Tryout`

---

## 7. Hasil Tryout States

### 7.1 Menghitung hasil

Copy:
> Menghitung skor dan passing grade...

Subcopy:
> Kami sedang membaca jawaban, skor per subtes, dan prioritas belajar kamu.

### 7.2 Hasil belum siap

Copy:
> Hasil belum siap.

Subcopy:
> Jawaban sudah diterima, tapi perhitungan masih diproses.

CTA:
- `Refresh hasil`

### 7.3 Lulus / aman passing grade

Copy:
> Skor kamu sudah aman passing grade.

Subcopy:
> Pertahankan ritme latihan dan coba paket berikutnya untuk memperkuat konsistensi.

CTA:
- `Coba paket serupa`
- `Bahas soal salah`

### 7.4 Belum aman passing grade

Copy:
> Skor kamu naik, tapi belum aman passing grade.

Subcopy:
> Fokus terbesar ada di [subtes/topik]. Latihan pendek berikutnya bisa membantu menaikkan skor lebih cepat.

CTA:
- `Latihan [Topik] sekarang`
- `Bahas soal salah`
- `Ulangi tryout`

### 7.5 Tidak ada rekomendasi kelemahan

Copy:
> Rekomendasi belum cukup akurat.

Subcopy:
> Kerjakan minimal satu paket lagi agar NalarUp punya data yang lebih kuat.

CTA:
- `Coba paket lain`

---

## 8. Pembahasan States

### 8.1 Loading pembahasan

Copy:
> Memuat pembahasan soal...

### 8.2 Tidak ada soal salah

Copy:
> Tidak ada soal salah di attempt ini.

Subcopy:
> Kamu bisa tetap melihat semua pembahasan untuk memperkuat pemahaman.

CTA:
- `Lihat semua pembahasan`
- `Coba paket lebih sulit`

### 8.3 Pembahasan belum tersedia

Copy:
> Pembahasan soal ini belum tersedia.

Subcopy:
> Soal tetap bisa dilaporkan agar tim konten melengkapinya.

CTA:
- `Laporkan soal`
- `Lanjut soal berikutnya`

### 8.4 Report soal

Copy modal:
> Laporkan soal ini?

Pilihan alasan:
- Jawaban benar terasa keliru.
- Pembahasan kurang jelas.
- Typo/format soal bermasalah.
- Opsi jawaban membingungkan.

CTA:
- `Kirim laporan`
- `Batal`

### 8.5 Saved question

Copy toast:
> Soal disimpan. Kamu bisa membukanya lagi dari menu Soal Tersimpan.

---

## 9. Admin States

### 9.1 Loading admin data

Copy:
> Memuat data admin...

### 9.2 Tidak ada paket

Copy:
> Belum ada paket tryout.

CTA:
- `Buat Paket Pertama`

### 9.3 Tidak ada soal

Copy:
> Bank soal masih kosong.

CTA:
- `Tambah Soal`
- `Import CSV/Excel`

### 9.4 Validasi soal gagal

Copy:
> Soal belum bisa disimpan.

Tampilkan error per field:
- Teks soal wajib diisi.
- Minimal 5 opsi A–E.
- TWK/TIU wajib punya satu jawaban benar.
- TKP wajib punya skor 1–5 per opsi.
- Pembahasan wajib diisi sebelum publish.

### 9.5 Import preview

State:
- File uploaded.
- Mapping kolom.
- Preview 10 baris pertama.
- Error rows.

Copy:
> Periksa hasil mapping sebelum import.

CTA:
- `Import data valid`
- `Perbaiki mapping`

---

## 10. Toast & Banner Standard

### Success toast

Format:
> [Objek] berhasil [aksi].

Contoh:
> Jawaban tersimpan.
> Paket berhasil dipublish.

### Warning banner

Format:
> [Masalah]. [Dampak]. [Apa yang dilakukan sistem].

Contoh:
> Koneksi lambat. Jawaban belum tersinkron. Kami akan mencoba menyimpan ulang otomatis.

### Error block

Format:
1. Judul jelas.
2. Dampak ke user.
3. CTA.

Contoh:
> Submit belum berhasil.
> Jawabanmu masih tersimpan dan belum hilang.
> Coba submit lagi.

---

## 11. Checklist Implementasi MVP

Wajib untuk MVP:

- [ ] Dashboard user baru.
- [ ] Dashboard user lama.
- [ ] Katalog loading state.
- [ ] Katalog empty/filter empty state.
- [ ] Detail tryout loading/error state.
- [ ] Attempt creation loading/error state.
- [ ] Exam autosave status.
- [ ] Exam offline banner.
- [ ] Exam refresh restore.
- [ ] Exam timer warning.
- [ ] Exam submit confirmation.
- [ ] Exam submit failed state.
- [ ] Result calculating state.
- [ ] Result actionable state.
- [ ] Review empty wrong-answer state.
- [ ] Admin empty package/question state.

Nice to have setelah MVP:

- [ ] Two-tab prevention kuat dengan server-side lock.
- [ ] Background sync offline queue.
- [ ] Per-question report workflow lengkap.
- [ ] Audit log admin.

---

## 12. Mapping ke Prototype HTML

- Landing: `01-landing-page.html`
- Ruang ujian: `02-exam-room.html`
- Detail tryout / before exam: `03-tryout-detail.html`
- Hasil tryout: `04-result.html`
- Pembahasan: `05-review.html`
- Katalog tryout: `06-tryout-catalog.html`
- Dashboard user baru/lama: `07-dashboard.html`

Dokumen berikutnya:
- `DATABASE_SCHEMA.md`
- `NEXTJS_IMPLEMENTATION_PLAN.md`
