# NalarUp — Session Notes & Progress

## Ringkasan Sesi (Claude Chat — Mei 2025)

### Yang sudah diputuskan
- Nama brand: **NalarUp** (nalarup.id)
- Target: semua kalangan peserta CASN
- Model: Freemium (gratis terbatas / premium Rp 99rb/bln, trial 7 hari)
- Design direction: **Dark modern** — navy base, glassmorphism tipis, glow effect, mirip Linear/Vercel
- Design system: sudah ada di `design/components/design-tokens.md`

### Yang sudah di-wireframe
- [x] Landing page (v2 — dark modern) → `design/mockups/01-landing-page.html`

### Yang belum di-wireframe (urutan prioritas)
- [ ] Dashboard user (post-login, home setelah masuk)
- [ ] Halaman paket tryout (browse & filter)
- [ ] Ruang ujian — CORE EXPERIENCE
- [ ] Halaman pembahasan (setelah ujian selesai)
- [ ] Leaderboard

---

## Instruksi untuk sesi berikutnya

Lanjutkan wireframe dari **Dashboard User** dengan style yang sama persis dengan landing page:
- Dark navy background `#0A0F1E`
- Glassmorphism card `rgba(255,255,255,0.03)` + border `rgba(255,255,255,0.08)`
- Top-highlight line pada card (`::before` gradient)
- Glow effect untuk elemen highlight
- Warna: blue `#2563EB`, violet `#7C3AED`, green `#10B981`, amber `#F59E0B`
- Tabler Icons outline

### Dashboard User harus berisi:
1. Sidebar navigasi kiri (logo, menu utama, user profile bawah)
2. Header dengan greeting + notifikasi
3. Stat cards: skor rata-rata, tryout selesai, peringkat nasional, streak harian
4. Grafik progres per subtes (TWK / TIU / TKP)
5. Riwayat tryout terakhir (5 item)
6. Rekomendasi paket selanjutnya (2-3 card)
7. Event live countdown (jika ada tryout live mendatang)

---

## Referensi Kompetitor
- https://privatalfaiz.id/#!/paket/id/8853?program=2
- https://belajarasn.com/free-work-question-packages
- https://ayocpns.com/#vue-product

## Catatan Penting
- Ruang Ujian adalah halaman paling kritis — harus mirip CAT BKN resmi
- AI Pembahasan adalah killer feature utama — pakai Claude API
- Leaderboard live butuh WebSocket
- Offline mode butuh PWA/Workbox
