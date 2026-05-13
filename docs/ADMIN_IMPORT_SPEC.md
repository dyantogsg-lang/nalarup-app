# NalarUp — Admin Import Spec v1

> Spesifikasi admin, import soal CSV/Excel, validasi konten, dan publish workflow. Dokumen ini melengkapi `DATABASE_SCHEMA.md`, `UX_STATES.md`, dan `NEXTJS_IMPLEMENTATION_PLAN.md` sebelum implementasi Next.js.

---

## 1. Tujuan

NalarUp butuh banyak paket tryout dan bank soal. Input manual satu per satu cukup untuk MVP kecil, tetapi tidak cukup untuk scale konten.

Admin Import Spec bertujuan:

1. Membuat admin bisa mengelola paket tryout.
2. Membuat admin bisa mengelola soal, opsi, pembahasan, topik, dan scoring.
3. Membuat import CSV/Excel aman, bisa dipreview, dan bisa divalidasi sebelum masuk database.
4. Menghindari soal rusak masuk ke paket published.
5. Mendukung TWK/TIU single correct dan TKP weighted scoring.

---

## 2. Scope MVP Admin

Masuk MVP admin:

- Login admin.
- Admin dashboard sederhana.
- CRUD paket tryout.
- CRUD soal.
- CRUD opsi jawaban A–E.
- Assign soal ke paket.
- Publish/unpublish paket.
- Validasi paket sebelum publish.
- Validasi soal sebelum publish.

Masuk setelah user flow MVP stabil:

- Import CSV/Excel.
- Preview import.
- Mapping kolom.
- Error row report.
- Bulk publish.
- Bulk assign soal ke paket.

Ditunda:

- Multi-reviewer workflow kompleks.
- Version diff visual antar revisi soal.
- AI-generated question checking.
- Payment/monetization tooling.

---

## 3. Admin Roles

### Admin

Akses:
- Full CRUD paket.
- Full CRUD soal.
- Assign soal ke paket.
- Publish/unpublish.
- Review laporan soal.
- Import data.

### Content Editor (opsional nanti)

Akses:
- Buat/edit draft soal.
- Tidak bisa publish.
- Tidak bisa menghapus published content.

Untuk MVP, cukup `role = admin` dari `profiles.role`.

---

## 4. Entity Admin

### Paket Tryout

Field:
- title
- slug
- description
- category
- mode: simulation/practice
- duration_minutes
- total_questions
- difficulty
- target_safe_score
- passing_grade_twk
- passing_grade_tiu
- passing_grade_tkp
- show_ranking
- status: draft/review/published/archived
- is_open_access: true untuk fase awal

### Subtest Composition

Field:
- package_id
- subtest: TWK/TIU/TKP/SKB
- question_count
- passing_grade
- sort_order

Contoh SKD Paket Perdana:
- TWK: 10 soal, PG 65
- TIU: 10 soal, PG 80
- TKP: 10 soal, PG 166

### Soal

Field:
- category
- subtest
- topic
- question_text
- question_type
- scoring_type
- difficulty
- explanation
- explanation_short
- source_note
- status

### Opsi Jawaban

Field:
- question_id
- option_label: A/B/C/D/E
- option_text
- is_correct
- score_value
- sort_order

---

## 5. Publish Validation Rules

### Paket Tryout

Paket boleh publish jika:

- title terisi.
- slug unik.
- description terisi.
- duration_minutes > 0.
- total_questions > 0.
- minimal punya 1 package_subtest.
- jumlah `package_questions` = `total_questions`.
- semua soal assigned status `published` atau minimal `reviewed` sesuai kebijakan.
- order_number unik dan tidak bolong jika ingin strict.
- setiap subtest punya jumlah soal sesuai `package_subtests.question_count`.
- `is_open_access = true` untuk fase awal.

Error copy:
- “Paket belum bisa dipublish karena jumlah soal belum sesuai.”
- “Ada soal yang belum direview.”
- “Komposisi subtes belum lengkap.”

### Soal TWK/TIU/SKB single_correct

Soal boleh publish jika:

- question_text terisi.
- subtest terisi.
- topic terisi.
- difficulty terisi.
- scoring_type = `single_correct`.
- punya opsi A–E lengkap.
- tepat satu opsi `is_correct = true`.
- opsi benar punya `score_value = 5`.
- opsi salah punya `score_value = 0`.
- explanation terisi.
- explanation_short terisi atau bisa auto-generate dari explanation nanti.

### Soal TKP weighted_options

Soal boleh publish jika:

- question_text terisi.
- subtest = TKP.
- topic terisi.
- scoring_type = `weighted_options`.
- punya opsi A–E lengkap.
- semua opsi punya `score_value` antara 1 sampai 5.
- minimal satu opsi memiliki skor 5.
- explanation menjelaskan alasan opsi terbaik.
- explanation_short terisi.

---

## 6. CSV/Excel Template

Satu row = satu soal lengkap dengan opsi A–E.

Kolom wajib:

```csv
package_slug,category,subtest,topic,difficulty,question_text,option_a,option_b,option_c,option_d,option_e,correct_option,score_a,score_b,score_c,score_d,score_e,explanation,explanation_short,source_note
```

Keterangan:

- `package_slug`: opsional untuk import bank soal umum; wajib jika sekaligus assign ke paket.
- `category`: SKD/TWK/TIU/TKP/PPPK/SKB.
- `subtest`: TWK/TIU/TKP/SKB.
- `topic`: nama topik; jika belum ada, admin bisa pilih create otomatis saat import.
- `difficulty`: easy/medium/hard.
- `question_text`: teks soal.
- `option_a` sampai `option_e`: teks opsi.
- `correct_option`: A/B/C/D/E untuk single_correct; boleh kosong untuk TKP weighted jika pakai skor.
- `score_a` sampai `score_e`: wajib untuk TKP; optional/default untuk TWK/TIU.
- `explanation`: pembahasan lengkap.
- `explanation_short`: pembahasan pendek untuk review cepat.
- `source_note`: catatan sumber/kurasi internal.

---

## 7. Contoh Row TWK/TIU

```csv
package_slug,category,subtest,topic,difficulty,question_text,option_a,option_b,option_c,option_d,option_e,correct_option,score_a,score_b,score_c,score_d,score_e,explanation,explanation_short,source_note
skd-cpns-paket-perdana,SKD,TWK,Nasionalisme,medium,"Makna Pancasila sebagai sumber dari segala sumber hukum adalah...","Simbol upacara","Semua aturan harus sejalan dengan Pancasila","Bisa diubah tiap tahun","Hanya pedoman moral","Hukum adat lokal",B,0,5,0,0,0,"Pancasila menjadi dasar bagi seluruh peraturan perundang-undangan.","Aturan hukum tidak boleh bertentangan dengan Pancasila.","Kurasi internal"
```

---

## 8. Contoh Row TKP

```csv
package_slug,category,subtest,topic,difficulty,question_text,option_a,option_b,option_c,option_d,option_e,correct_option,score_a,score_b,score_c,score_d,score_e,explanation,explanation_short,source_note
skd-cpns-paket-perdana,SKD,TKP,Pelayanan Publik,medium,"Warga mengeluh karena antrean layanan sangat panjang. Sikap terbaik adalah...","Menyuruh menunggu","Menjelaskan prosedur dan membantu mencari solusi","Mengabaikan karena bukan tugas","Meminta datang besok","Menyalahkan sistem",B,2,5,1,3,1,"Opsi terbaik menunjukkan empati, komunikasi jelas, dan orientasi solusi.","Respons terbaik: empati + solusi.","Kurasi internal"
```

---

## 9. Import Flow UX

1. Admin buka `/admin/import`.
2. Admin pilih file CSV/Excel.
3. Sistem membaca header.
4. Sistem melakukan auto-mapping kolom.
5. Admin melihat preview 10 row pertama.
6. Sistem menampilkan valid/invalid count.
7. Admin bisa download error report.
8. Admin klik `Import data valid`.
9. Sistem membuat/memperbarui topics jika diizinkan.
10. Sistem insert questions + options.
11. Jika `package_slug` ada, sistem assign ke package.
12. Sistem menampilkan summary import.

---

## 10. Import Preview State

Preview harus menampilkan:

- Nama file.
- Jumlah row.
- Jumlah valid.
- Jumlah invalid.
- Jumlah warning.
- Mapping kolom.
- 10 row pertama.
- Error per row.

Copy:
> Periksa hasil mapping sebelum import.

CTA:
- `Import data valid`
- `Perbaiki mapping`
- `Download error report`
- `Batal`

---

## 11. Error Types

### Fatal file error

- Format file tidak didukung.
- File kosong.
- Header tidak terbaca.
- Ukuran file terlalu besar.

Copy:
> File belum bisa dibaca. Pastikan format CSV/XLSX sesuai template NalarUp.

### Row validation error

Contoh:
- `question_text` kosong.
- opsi A–E tidak lengkap.
- subtest tidak valid.
- difficulty tidak valid.
- TWK/TIU tidak punya correct_option.
- TWK/TIU punya lebih dari satu opsi benar.
- TKP score A–E tidak lengkap.
- TKP score di luar 1–5.
- package_slug tidak ditemukan.

### Warning

Contoh:
- topic belum ada dan akan dibuat baru.
- explanation_short kosong dan akan disalin dari explanation pendek.
- source_note kosong.

---

## 12. Import Modes

### Mode A — Bank Soal Only

- `package_slug` kosong.
- Soal masuk bank soal.
- Tidak assign ke paket.
- Status default: `draft` atau `reviewed` sesuai pilihan admin.

### Mode B — Import + Assign Paket

- `package_slug` terisi.
- Soal masuk bank soal.
- Soal langsung assigned ke package.
- `order_number` mengikuti urutan row dalam file atau kolom optional `order_number`.

### Mode C — Update Existing

Ditunda.

Nanti bisa pakai:
- `question_id`
- `external_id`
- match by hash question_text

---

## 13. Duplicate Detection

MVP basic:
- Buat normalized hash dari `question_text + subtest + topic`.
- Jika hash sama dengan soal existing, tampilkan warning.
- Admin pilih:
  - skip duplicate
  - import as new version
  - update existing (ditunda)

Schema tambahan opsional:

```sql
alter table questions add column content_hash text;
create index questions_content_hash_idx on questions(content_hash);
```

---

## 14. Import Transaction Strategy

Rekomendasi:

- Import data valid dalam transaction per batch.
- Jika satu row error saat insert, row itu masuk failed list, batch lain tetap jalan jika aman.
- Untuk MVP kecil, bisa all-or-nothing agar sederhana.

Pilihan MVP:
- Preview memisahkan valid/invalid.
- Hanya row valid yang diimport.
- Invalid tidak masuk database.
- Summary menyebut row sukses dan gagal.

---

## 15. Admin Pages

### `/admin`

Isi:
- Total paket.
- Total soal.
- Paket draft/review/published.
- Soal perlu review.
- Laporan soal terbuka.
- CTA tambah soal/paket/import.

### `/admin/packages`

Isi:
- Table paket.
- Search.
- Filter status/mode/category.
- CTA create package.

Columns:
- title.
- category.
- mode.
- questions count.
- status.
- updated_at.
- actions.

### `/admin/packages/new` dan edit

Tabs:
- Detail.
- Komposisi.
- Soal assigned.
- Publish check.

### `/admin/questions`

Columns:
- question preview.
- subtest.
- topic.
- difficulty.
- scoring type.
- status.
- reports.
- actions.

### `/admin/questions/new` dan edit

Sections:
- Metadata.
- Soal.
- Opsi A–E.
- Pembahasan.
- Publish validation.

### `/admin/import`

Sections:
- Upload file.
- Mapping.
- Preview.
- Errors/warnings.
- Import summary.

---

## 16. Admin UX States

### Empty package

> Belum ada paket tryout.

CTA:
- `Buat Paket Pertama`

### Empty question bank

> Bank soal masih kosong.

CTA:
- `Tambah Soal`
- `Import CSV/Excel`

### Publish blocked

> Paket belum bisa dipublish.

Subcopy:
> Selesaikan item validasi berikut dulu.

Display checklist:
- Detail paket lengkap.
- Komposisi subtes lengkap.
- Jumlah soal sesuai.
- Semua soal valid.

### Import success

> Import selesai.

Summary:
- X soal berhasil masuk.
- Y soal dilewati.
- Z row gagal validasi.

---

## 17. Implementation Notes

Recommended files:

```txt
app/admin/import/page.tsx
app/api/admin/import/preview/route.ts
app/api/admin/import/commit/route.ts
components/admin/ImportUploader.tsx
components/admin/ImportMappingTable.tsx
components/admin/ImportPreviewTable.tsx
components/admin/ImportErrorReport.tsx
lib/admin/import/parseCsv.ts
lib/admin/import/parseXlsx.ts
lib/admin/import/validateRows.ts
lib/admin/import/commitImport.ts
lib/admin/import/template.ts
```

Dependencies:
- CSV: `papaparse` or server-side native parser.
- XLSX: `xlsx` package.
- Validation: Zod.

MVP recommendation:
- Implement manual admin CRUD first.
- Implement CSV import second.
- Add XLSX after CSV flow stable.

---

## 18. Open Questions

1. Apakah admin import masuk MVP coding pertama atau setelah flow user selesai?
2. Apakah soal awal diinput manual dulu atau langsung seed script?
3. Apakah topic baru boleh auto-create dari import?
4. Apakah import duplicate harus skip atau create version?
5. Apakah source_note wajib untuk semua soal?

Rekomendasi:
- Seed awal pakai script untuk 30–75 soal dummy.
- Admin manual CRUD masuk MVP.
- CSV import setelah user flow lulus E2E.
