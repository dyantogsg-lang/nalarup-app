# NalarUp — Project Plan

> Blueprint awal untuk membangun NalarUp sebagai platform latihan simulasi tryout dengan banyak paket tryout yang bisa diakses user.

---

## 1. Visi Produk

NalarUp adalah sistem latihan berulang yang membantu peserta CASN/CPNS/PPPK menaikkan skor sampai aman passing grade lewat banyak paket tryout, simulasi realistis, analisis kelemahan, dan latihan perbaikan.

Fokus utama NalarUp:

- Banyak pilihan tryout.
- Simulasi ujian nyaman dan serius.
- Nilai dan hasil langsung terlihat.
- Hasil yang actionable: kelemahan, prioritas belajar, dan latihan berikutnya.
- Pembahasan tersedia setelah submit.
- Mode Simulasi dan Mode Latihan.
- Progress latihan tersimpan.
- Skor aman meter, benchmark, dan ranking anonim.
- Untuk fase awal, semua paket dibuat open access; monetisasi dan akses berbayar ditunda.

Positioning utama:

> “Naikkan skor sampai aman passing grade lewat tryout realistis dan latihan perbaikan yang terarah.”

NalarUp bukan sekadar bank soal. Produk ini harus terasa seperti sistem peningkatan skor: user mengerjakan tryout, melihat kelemahan, mendapat latihan perbaikan, lalu mengulang sampai skor makin aman.

Loop utama produk:

`Tryout -> Hasil -> Kelemahan -> Latihan pendek -> Tryout ulang -> Skor naik`

Dokumen detail tambahan:
- `UX_SPEC.md`
- `UX_STATES.md`
- `DATABASE_SCHEMA.md`
- `NEXTJS_IMPLEMENTATION_PLAN.md`
- `ADMIN_IMPORT_SPEC.md`
- `PRODUCT_GAPS_AND_IMPROVEMENTS.md`

---

## 2. Target Pengguna

### Pengguna utama

1. Peserta CPNS/CASN pemula
   - Baru mulai belajar.
   - Butuh latihan dasar dan paket yang bisa langsung diakses.
   - Perlu tampilan yang mudah dipahami.

2. Peserta serius menjelang ujian
   - Butuh banyak paket tryout.
   - Butuh simulasi full seperti CAT.
   - Butuh skor, passing grade, dan evaluasi.

3. Peserta PPPK/SKB
   - Butuh paket khusus bidang/formasi.
   - Butuh filter kategori yang jelas.

### Kebutuhan utama user

- Bisa memilih paket tryout sesuai kebutuhan.
- Bisa latihan kapan saja.
- Bisa melihat nilai langsung.
- Bisa mengulang tryout.
- Bisa tahu bagian mana yang masih lemah.
- Bisa melihat mode paket, status pengerjaan, dan rekomendasi latihan berikutnya.

---

## 3. Prinsip Produk

1. Tryout-first
   - Semua pengalaman produk harus mengarah ke latihan tryout.
   - Dashboard, katalog, dan rekomendasi semuanya harus mendorong user memilih/mengerjakan tryout.

2. Banyak paket, mudah dicari
   - Katalog tryout harus kuat sejak awal.
   - Filter kategori, durasi, mode simulasi/latihan, status pengerjaan, dan tingkat kesulitan penting.

3. Ruang ujian adalah core experience
   - Halaman ujian harus menjadi halaman paling serius dan paling rapi.
   - Timer, navigasi soal, status jawaban, dan submit harus jelas.

4. Hasil harus mudah dimengerti
   - User harus langsung tahu lulus/tidak, skor per subtes, dan apa yang harus diperbaiki.

5. Open access first
   - Fase awal tidak memakai lock, paywall, atau badge akses berbayar. Semua paket awal harus bisa langsung dicoba agar core loop tervalidasi.

---

## 4. Scope MVP v1

MVP v1 harus membuktikan satu flow lengkap:

> User daftar/login → lihat daftar tryout → pilih paket → kerjakan ujian → submit → lihat hasil → lihat pembahasan.

### Fitur yang masuk MVP v1

1. Landing page
   - Sudah ada wireframe awal.
   - Perlu disesuaikan dengan brand NalarUp.

2. Auth user
   - Register.
   - Login.
   - Logout.
   - Session user.

3. Dashboard user
   - Greeting user.
   - Statistik latihan singkat.
   - Tryout terakhir.
   - Rekomendasi tryout.
   - CTA lanjut latihan.

4. Katalog tryout
   - List paket tryout.
   - Filter kategori: SKD, TWK, TIU, TKP, PPPK, SKB.
   - Filter status pengerjaan: belum dikerjakan / sudah dikerjakan / rekomendasi.
   - Search paket.
   - Card paket berisi jumlah soal, durasi, kategori, difficulty, mode, dan status pengerjaan user.

5. Detail tryout
   - Nama paket.
   - Deskripsi.
   - Jumlah soal.
   - Durasi.
   - Komposisi subtes.
   - Passing grade.
   - Riwayat percobaan user.
   - Tombol mulai/ulangi.

6. Ruang ujian
   - Timer countdown.
   - Jam mulai dan jam berakhir otomatis menyesuaikan waktu peserta benar-benar memulai attempt.
   - Di production, `started_at` disimpan dari server saat attempt dibuat; `ends_at = started_at + duration_minutes`.
   - Soal dan pilihan jawaban.
   - Navigasi soal.
   - Status nomor: belum dijawab, sudah dijawab, ragu-ragu.
   - Tombol sebelum/berikutnya.
   - Flag ragu-ragu.
   - Submit ujian.
   - Konfirmasi submit.

7. Hasil tryout
   - Skor total.
   - Skor per subtes.
   - Passing grade.
   - Status lulus/tidak.
   - Jumlah benar/salah/kosong.
   - Waktu pengerjaan.
   - Tombol lihat pembahasan.
   - Tombol ulangi tryout.

8. Pembahasan
   - Daftar soal.
   - Jawaban user.
   - Jawaban benar.
   - Penjelasan teks.
   - Kategori/topik soal.
   - Status benar/salah.

9. Admin sederhana
   - Login admin.
   - CRUD paket tryout.
   - CRUD soal.
   - CRUD opsi jawaban.
   - Assign soal ke paket.
   - Publish/unpublish paket.

### Fitur yang ditunda setelah MVP

- AI tanya pembahasan.
- Leaderboard real-time.
- Tryout live nasional.
- Payment gateway.
- PWA offline.
- Import soal Excel/CSV.
- Analisis kelemahan mendalam.
- Mode Latihan per topik/subtes.
- Skor aman meter dan benchmark ranking anonim.
- Sertifikat hasil.
- Referral.
- Notifikasi jadwal CASN.

---

## 5. Paket Tryout Awal untuk MVP

Untuk development awal, siapkan data dummy/seed:

1. SKD CPNS — Paket Perdana
   - Open access.
   - 30 soal dummy untuk MVP.
   - Durasi 30 menit.
   - Komposisi: TWK 10, TIU 10, TKP 10.

2. TWK Fokus Nasionalisme
   - Open access.
   - 15 soal.
   - Durasi 15 menit.

3. TIU Logika Dasar
   - Open access.
   - 15 soal.
   - Durasi 20 menit.

4. TKP Pelayanan Publik
   - Open access.
   - 15 soal.
   - Durasi 20 menit.

5. Simulasi SKD Full
   - Open access.
   - Nanti target 110 soal.
   - Untuk MVP boleh dummy 50 soal.

Catatan:
- Untuk MVP, jumlah soal tidak harus langsung seperti ujian asli.
- Yang penting flow lengkap berjalan dulu.

---

## 6. Struktur Halaman Produk

### Public pages

1. `/`
   - Landing page.
   - CTA mulai tryout.
   - Highlight banyak paket tryout.
   - Highlight simulasi CAT.
   - Trust layer dan akses awal open access.

2. `/access`
   - Tidak masuk fase awal; halaman monetisasi baru dibahas setelah core loop terbukti.

3. `/login`
   - Form login.

4. `/register`
   - Form register.

### User app pages

1. `/dashboard`
   - Ringkasan progres user.
   - Tryout direkomendasikan.
   - Riwayat terakhir.

2. `/tryouts`
   - Katalog semua tryout.
   - Search dan filter.

3. `/tryouts/[slug]`
   - Detail paket tryout.

4. `/exam/[attemptId]`
   - Ruang ujian.

5. `/results/[attemptId]`
   - Hasil tryout.

6. `/results/[attemptId]/review`
   - Pembahasan soal.

7. `/history`
   - Riwayat semua attempt user.

8. `/profile`
   - Data user, target persiapan, dan preferensi latihan.

### Admin pages

1. `/admin`
   - Dashboard admin.

2. `/admin/packages`
   - List paket tryout.

3. `/admin/packages/new`
   - Buat paket.

4. `/admin/packages/[id]/edit`
   - Edit paket.

5. `/admin/questions`
   - List soal.

6. `/admin/questions/new`
   - Buat soal.

7. `/admin/questions/[id]/edit`
   - Edit soal.

---

## 7. User Flow Utama

### Flow 1 — User baru mencoba tryout pertama

1. User membuka landing page.
2. User klik “Mulai Tryout”.
3. User register.
4. User masuk dashboard.
5. User melihat rekomendasi “SKD CPNS — Paket Perdana”.
6. User klik paket.
7. User membaca detail tryout.
8. User klik “Mulai Tryout”.
9. Sistem membuat attempt baru.
10. User masuk ruang ujian.
11. User menjawab soal.
12. User submit.
13. Sistem menghitung skor.
14. User melihat hasil.
15. User membuka pembahasan.

### Flow 2 — User memilih latihan rekomendasi

1. User membuka katalog tryout.
2. User melihat rekomendasi berdasarkan hasil terakhir atau onboarding.
3. User memilih paket simulasi/latihan.
4. Jika paket published dan open access, user bisa langsung membuka detail dan mulai attempt.
5. Monetisasi/akses berbayar tidak aktif di fase awal.

### Flow 3 — User mengulang tryout

1. User membuka detail paket.
2. Sistem menampilkan riwayat percobaan sebelumnya.
3. User klik “Ulangi Tryout”.
4. Sistem membuat attempt baru.
5. Attempt lama tetap tersimpan.

---

## 8. Data Model Awal

### `users`

Menyimpan profil user.

Field utama:
- `id`
- `email`
- `name`
- `role` = `user` | `admin`
- `created_at`
- `updated_at`

Jika memakai Supabase Auth, tabel ini bisa menjadi `profiles` yang terhubung ke `auth.users`.

### `categories`

Kategori soal/paket.

Field:
- `id`
- `name` contoh: SKD, TWK, TIU, TKP, SKB, PPPK
- `slug`
- `description`

### `tryout_packages`

Paket tryout yang muncul di katalog.

Field:
- `id`
- `title`
- `slug`
- `description`
- `category_id`
- `is_open_access` = boolean
- `duration_minutes`
- `total_questions`
- `difficulty` = `easy` | `medium` | `hard`
- `is_published`
- `passing_grade_total`
- `passing_grade_twk`
- `passing_grade_tiu`
- `passing_grade_tkp`
- `created_at`
- `updated_at`

### `questions`

Bank soal.

Field:
- `id`
- `category_id`
- `subtest` = `TWK` | `TIU` | `TKP` | `SKB`
- `topic`
- `question_text`
- `question_type` = `single_choice`
- `difficulty`
- `explanation`
- `score_weight`
- `created_at`
- `updated_at`

### `question_options`

Pilihan jawaban.

Field:
- `id`
- `question_id`
- `option_label` = `A` | `B` | `C` | `D` | `E`
- `option_text`
- `is_correct`
- `score_value`
- `scoring_type` = `single_correct` | `weighted_options`

Catatan TKP:
- TKP bisa punya skor bertingkat, bukan hanya benar/salah.
- Karena itu `score_value` penting.

### `package_questions`

Relasi many-to-many antara paket dan soal.

Field:
- `id`
- `package_id`
- `question_id`
- `order_number`

### `tryout_attempts`

Percobaan user mengerjakan paket.

Field:
- `id`
- `user_id`
- `package_id`
- `status` = `in_progress` | `submitted` | `expired`
- `started_at`
- `submitted_at`
- `duration_seconds`
- `total_score`
- `twk_score`
- `tiu_score`
- `tkp_score`
- `correct_count`
- `wrong_count`
- `empty_count`
- `is_passed`

### `attempt_answers`

Jawaban user per soal.

Field:
- `id`
- `attempt_id`
- `question_id`
- `selected_option_id`
- `is_marked_doubtful`
- `is_correct`
- `score_awarded`
- `answered_at`

---

## 9. Aturan Skoring Awal

### TWK/TIU

- Jawaban benar: +5
- Jawaban salah: 0
- Kosong: 0

### TKP

- Setiap opsi punya skor 1-5.
- Tidak ada benar/salah absolut.
- Skor mengikuti `score_value` di `question_options`.

### Passing grade awal

Untuk MVP bisa dibuat configurable di `tryout_packages`:

- TWK: 65
- TIU: 80
- TKP: 166
- Total: opsional

Status lulus:

- Lulus jika semua passing grade subtes terpenuhi.
- Tidak lulus jika salah satu subtes di bawah passing grade.

---

## 10. Rekomendasi Tech Stack

### Stack utama

- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- Database: PostgreSQL via Supabase
- Auth: Supabase Auth
- ORM/query: Drizzle atau Prisma
- Hosting frontend: Vercel
- Storage: Supabase Storage jika nanti butuh gambar/file

### Kenapa stack ini

- Cepat untuk MVP.
- Auth dan database tidak perlu dibangun dari nol.
- Cocok untuk dashboard, admin, dan app interaktif.
- Mudah deploy.
- Mudah dikembangkan ke monetisasi, AI, dan realtime.

### Alternatif

Jika ingin backend terpisah:
- Frontend: Next.js
- Backend: FastAPI
- DB: PostgreSQL
- Auth: custom/JWT/Supabase

Namun untuk fase awal, satu aplikasi Next.js + Supabase lebih cepat.

---

## 11. Struktur Folder Development yang Disarankan

Jika nanti mulai coding, struktur awal:

```txt
nalarup-app/
  app/
    page.tsx
    login/page.tsx
    register/page.tsx
    dashboard/page.tsx
    tryouts/page.tsx
    tryouts/[slug]/page.tsx
    exam/[attemptId]/page.tsx
    results/[attemptId]/page.tsx
    results/[attemptId]/review/page.tsx
    admin/page.tsx
    admin/packages/page.tsx
    admin/questions/page.tsx
  components/
    layout/
    tryout/
    exam/
    results/
    admin/
    ui/
  lib/
    supabase/
    db/
    scoring/
    auth/
  db/
    schema.ts
    seed.ts
  docs/
    PROJECT_PLAN.md
    DATABASE_SCHEMA.md
    USER_FLOWS.md
  public/
```

---

## 12. Wireframe Prioritas

Landing page sudah ada. Berikutnya buat wireframe dalam urutan ini:

1. Ruang Ujian
   - Paling penting karena core experience.
   - Harus terasa serius, cepat, dan mirip ujian.

2. Katalog Tryout
   - Karena produk akan punya banyak tryout.
   - Filter dan card harus kuat.

3. Detail Tryout
   - Jembatan dari katalog ke ujian.

4. Hasil Tryout
   - Harus memberi feedback jelas.

5. Pembahasan
   - Membuat user merasa belajar, bukan cuma dapat nilai.

6. Dashboard
   - Merangkum aktivitas, tapi bukan core pertama.

7. Admin Soal/Paket
   - Bisa wireframe sederhana dulu.

---

## 13. Roadmap Eksekusi

### Phase 0 — Blueprint dan desain

Output:
- PROJECT_PLAN.md selesai.
- Wireframe ruang ujian.
- Wireframe katalog tryout.
- Wireframe detail tryout.
- Wireframe hasil dan pembahasan.
- Database schema final v1.

### Phase 1 — Prototype HTML

Output:
- Static HTML untuk halaman inti.
- Style konsisten dengan landing page.
- Belum perlu backend.

Halaman:
- Landing page update brand: `01-landing-page.html`.
- Ruang ujian: `02-exam-room.html`.
- Detail tryout / before exam flow: `03-tryout-detail.html`.
- Hasil tryout: `04-result.html`.
- Pembahasan: `05-review.html`.
- Katalog tryout: `06-tryout-catalog.html`.
- Dashboard user baru/lama: `07-dashboard.html`.

### Phase 2 — App MVP

Output:
- Next.js app berjalan lokal.
- Auth aktif.
- Database aktif.
- User bisa mengerjakan tryout dari data seed.
- Hasil dihitung otomatis.
- Pembahasan tampil.

### Phase 3 — Admin MVP

Output:
- Admin bisa tambah/edit paket.
- Admin bisa tambah/edit soal.
- Admin bisa assign soal ke paket.
- Paket bisa publish/unpublish.

### Phase 4 — Monetisasi awal

Output:
- Evaluasi monetisasi setelah usage terbukti.
- Halaman monetisasi ditunda.
- Integrasi pembayaran ditunda.
- Semua paket fase awal open access.

### Phase 5 — Fitur pintar

Output:
- Analisis kelemahan.
- Rekomendasi paket.
- Tanya AI pembahasan.

### Phase 6 — Growth

Output:
- Tryout live.
- Leaderboard.
- Ranking nasional/provinsi.
- PWA offline.
- Notifikasi.

---

## 14. Definition of Done MVP

MVP dianggap selesai jika:

1. User bisa register/login.
2. User bisa membuka katalog tryout.
3. User bisa memilih paket open access.
4. User bisa mengerjakan simulasi ujian.
5. Timer berjalan.
6. Jawaban tersimpan.
7. User bisa submit.
8. Sistem menghitung skor.
9. User bisa melihat hasil.
10. User bisa melihat pembahasan.
11. Admin bisa membuat minimal 1 paket dan beberapa soal.
12. Tidak ada paket terkunci di fase awal; semua paket terbuka.
13. UI konsisten dengan design system NalarUp.

---

## 15. Risiko dan Hal yang Perlu Diputuskan

### Risiko produk

1. Terlalu banyak fitur di awal
   - Solusi: fokus flow tryout dulu.

2. Soal tidak cukup banyak
   - Solusi: mulai dari data dummy, lalu bangun admin/import.

3. Ruang ujian kurang nyaman
   - Solusi: desain dan test halaman ini paling awal.

4. Skoring TKP lebih kompleks
   - Solusi: sejak awal support `score_value` per opsi.

5. Monetisasi terlalu cepat dipaksakan
   - Solusi: fase awal open access sampai core UX, konten soal, dan retensi latihan terbukti.

### Keputusan yang perlu dibuat nanti

1. Apakah auth pakai Supabase Auth?
2. Apakah development langsung Next.js atau static HTML dulu?
3. Apakah admin dibangun di app yang sama?
4. Kapan monetisasi mulai diuji dan apakah integrasi pembayaran pertama pakai Midtrans atau Xendit?
5. Apakah soal awal akan diinput manual atau import CSV/Excel?
6. Apakah brand domain final `nalarup.id`?

---

## 16. Prioritas Langkah Berikutnya

Arah UX terbaru mengacu ke `UX_SPEC.md`, berdasarkan review `Review_UX_NalarUp.pdf`.

Urutan pengerjaan terbaru:

1. Buat Before Exam Flow / Detail Tryout: `03-tryout-detail.html`.
2. Polish Ruang Ujian desktop + mobile: `02-exam-room.html`.
3. Buat Hasil Tryout + rekomendasi latihan: `04-result.html`.
4. Buat Pembahasan soal salah: `05-review.html`.
5. Buat Katalog Tryout: `06-tryout-catalog.html`.
6. Buat Dashboard user baru/lama: selesai sebagai `07-dashboard.html`.
7. Finalisasi UX states / empty / error / loading / offline: selesai sebagai `UX_STATES.md`.
8. Finalisasi database schema: selesai sebagai `DATABASE_SCHEMA.md`.
9. Susun Next.js implementation plan: selesai sebagai `NEXTJS_IMPLEMENTATION_PLAN.md`.
10. Finalisasi admin UX dan import soal: selesai sebagai `ADMIN_IMPORT_SPEC.md`.
11. Baru mulai init project Next.js.

Prioritas berikutnya:

> Mulai bootstrap `nalarup-app` Next.js sesuai `NEXTJS_IMPLEMENTATION_PLAN.md`.
