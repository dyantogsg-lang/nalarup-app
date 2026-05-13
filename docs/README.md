# NalarUp — Platform Tryout CASN

Platform latihan tryout CASN (CPNS & PPPK) untuk menaikkan skor sampai aman passing grade lewat simulasi realistis, analisis kelemahan, dan latihan perbaikan.

---

## Status Proyek

> Fase: **Desain & Wireframing**
> Belum ada kode produksi. Semua file di sini adalah referensi desain dan dokumentasi.

---

## Konsep Produk

| Atribut | Detail |
|---|---|
| Nama brand | **NalarUp** |
| Domain target | nalarup.id |
| Target pengguna | Semua kalangan peserta CASN (CPNS & PPPK) |
| Akses fase awal | Open access untuk semua paket awal; tanpa badge akses berbayar dan tanpa paywall |
| Monetisasi | Ditunda sampai core loop, konten soal, dan retensi latihan terbukti |

---

## Design System

### Warna utama
```
--blue:        #2563EB   (primary action)
--blue-light:  #3B82F6   (hover, accent)
--violet:      #7C3AED   (secondary, SKB badge)
--navy:        #0A0F1E   (background utama)
--navy2:       #111827   (surface)
--navy3:       #1C2333   (card background)
```

### Warna aksen
```
--green:       #10B981   (sukses, status aman)
--amber:       #F59E0B   (warning, skor belum aman, highlight)
--pink:        #F472B6   (fitur notifikasi)
--teal:        #14B8A6   (fitur offline)
```

### Tipografi
- Font: sistem sans-serif (Inter / Anthropic Sans)
- H1: 36px / weight 500
- H2: 20-22px / weight 500
- Body: 13-14px / weight 400
- Label kecil: 11-12px / weight 400-500

### Filosofi desain
- **Dark-first**: base navy `#0A0F1E`, feel modern seperti Linear/Vercel/Raycast
- **Glassmorphism tipis**: card pakai `rgba(255,255,255,0.03)` + border `rgba(255,255,255,0.08)`
- **Top-highlight line**: setiap card punya `::before` gradient top untuk kesan 3D
- **Glow effect**: hero section pakai radial glow biru & violet, blur 50-60px
- **Gradient text**: headline utama pakai `linear-gradient(135deg, #60A5FA, #A78BFA)`

---

## Struktur Halaman (Roadmap Desain)

| # | Halaman | Status |
|---|---|---|
| 1 | Landing Page | ✅ Wireframe selesai (v2 — dark modern) |
| 2 | Dashboard User | ✅ Wireframe selesai: `07-dashboard.html` |
| 3 | Katalog Tryout | ✅ Wireframe selesai: `06-tryout-catalog.html` |
| 4 | Detail Tryout / Before Exam | ✅ Wireframe selesai: `03-tryout-detail.html` |
| 5 | Ruang Ujian (core) | ✅ Wireframe selesai: `02-exam-room.html` |
| 6 | Hasil Tryout | ✅ Wireframe selesai: `04-result.html` |
| 7 | Pembahasan | ✅ Wireframe selesai: `05-review.html` |
| 8 | UX States | ✅ Dokumen selesai: `UX_STATES.md` |
| 9 | Database Schema | ✅ Dokumen selesai: `DATABASE_SCHEMA.md` |
| 10 | Next.js Implementation Plan | ✅ Dokumen selesai: `NEXTJS_IMPLEMENTATION_PLAN.md` |
| 11 | Admin Import Spec | ✅ Dokumen selesai: `ADMIN_IMPORT_SPEC.md` |

---

## Differentiator vs Kompetitor

| Fitur | Kompetitor | NalarUp |
|---|---|---|
| Pembahasan soal + AI | Teks statis | AI bisa ditanya balik |
| Progress tracking per subtes | Tidak ada / basic | Dashboard lengkap |
| Simulasi tampilan CAT BKN | Sebagian ada | Tampilan mirip CAT BKN |
| Tryout live bareng user lain | Tidak ada | Leaderboard real-time |
| Notifikasi jadwal CASN | Tidak ada | Push notification |
| Mobile-first / offline | Sebagian | PWA, bisa offline |

---

## Struktur Konten

### Kategori Tryout
- **SKD** (Seleksi Kompetensi Dasar): TWK, TIU, TKP — 110 soal, 100 menit
- **SKB Umum** (PPPK): 100 soal, 120 menit
- **SKB Teknis**: per formasi/jabatan
- **Simulasi Nasional**: event live mingguan

### Akses Fase Awal
Semua paket awal dibuat open access agar core loop bisa divalidasi tanpa friksi. Tidak ada lock, badge akses berbayar, atau paywall di flow inti.

Fokus akses awal:
- Banyak paket tryout bisa langsung dicoba.
- Pembahasan teks per soal.
- Riwayat tryout.
- Rekomendasi latihan setelah hasil.
- Dashboard progress dan skor aman meter.

---

## Kompetitor Referensi
- https://privatalfaiz.id — paket berbayar per topik
- https://belajarasn.com — free package, UI bersih
- https://ayocpns.com — Vue-based, interaktif

---

## Catatan Teknis (untuk fase development)

### Tech stack yang direkomendasikan
- **Framework**: Next.js App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **ORM/migration**: Drizzle ORM
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Hosting**: Vercel

### Fitur kritis (core experience)
1. **Ruang Ujian** — timer countdown, navigasi soal grid, flag ragu-ragu, fullscreen
2. **Autosave & refresh handling** — jawaban aman, timer berbasis server
3. **Hasil actionable** — skor aman meter, kelemahan, latihan berikutnya
