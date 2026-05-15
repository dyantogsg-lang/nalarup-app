# NalarUp — Format Import Soal CPNS

Schema ini cocok 1:1 dengan `QuestionFormInput` di `src/lib/admin/questionActions.ts`.
Setiap soal harus dalam bentuk JSON object berikut. Kumpulan soal = JSON array dari objek-objek ini.

## Schema

```json
{
  "questionText": "string — teks soal lengkap (wajib)",
  "subtest": "TWK | TIU | TKP | SKB",
  "scoringType": "single_correct | weighted_options",
  "difficulty": "easy | medium | hard",
  "topicId": null,
  "categoryId": null,
  "explanation": "string — pembahasan lengkap",
  "explanationShort": "string — ringkasan 1-2 kalimat untuk Mode Review Cepat",
  "sourceNote": "string — sumber + tahun (contoh: 'CPNS 2019 Soal Resmi BKN')",
  "options": [
    { "label": "A", "text": "...", "isCorrect": false, "scoreValue": 1 },
    { "label": "B", "text": "...", "isCorrect": true,  "scoreValue": 5 },
    { "label": "C", "text": "...", "isCorrect": false, "scoreValue": 1 },
    { "label": "D", "text": "...", "isCorrect": false, "scoreValue": 1 },
    { "label": "E", "text": "...", "isCorrect": false, "scoreValue": 1 }
  ]
}
```

## Aturan Validasi (HARUS dipenuhi)

1. `questionText` tidak boleh kosong
2. Minimal 2 `options`, maksimal 6
3. `label` opsi unik (A,B,C,D,E,F), uppercase, tidak kosong
4. **Untuk `single_correct`** (subtest TWK / TIU / SKB):
   - TEPAT 1 opsi dengan `isCorrect: true`
   - Opsi benar `scoreValue: 5`, lainnya `scoreValue: 0` (atau 1)
5. **Untuk `weighted_options`** (subtest TKP):
   - Semua `isCorrect: false`
   - Setiap opsi `scoreValue` antara 1-5
   - TEPAT 1 opsi dengan `scoreValue: 5` (jawaban paling tepat)
6. `sourceNote` WAJIB mencantumkan tahun CPNS (2018-2025)
7. `topicId` dan `categoryId` boleh `null` (akan dipetakan manual nanti)

## Pemetaan Subtest

- **TWK** (Tes Wawasan Kebangsaan): Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, Sejarah, Bela Negara
- **TIU** (Tes Intelegensi Umum): Verbal (analogi, silogisme), Numerik (deret, soal cerita), Figural (gambar/pola)
- **TKP** (Tes Karakteristik Pribadi): Pelayanan publik, Jejaring kerja, Sosial budaya, Teknologi informasi, Profesionalisme, Anti radikalisme — SELALU `weighted_options`
- **SKB** (Seleksi Kompetensi Bidang): Bidang spesifik per formasi

## Contoh — TIU (single_correct)

```json
{
  "questionText": "Jika 3, 5, 8, 13, 21, ... maka angka selanjutnya adalah?",
  "subtest": "TIU",
  "scoringType": "single_correct",
  "difficulty": "medium",
  "topicId": null,
  "categoryId": null,
  "explanation": "Pola Fibonacci: 3+5=8, 5+8=13, 8+13=21, 13+21=34. Jadi suku berikutnya adalah 34.",
  "explanationShort": "Deret Fibonacci, 13+21 = 34.",
  "sourceNote": "CPNS 2021 - Soal TIU Numerik",
  "options": [
    { "label": "A", "text": "29", "isCorrect": false, "scoreValue": 0 },
    { "label": "B", "text": "31", "isCorrect": false, "scoreValue": 0 },
    { "label": "C", "text": "34", "isCorrect": true,  "scoreValue": 5 },
    { "label": "D", "text": "36", "isCorrect": false, "scoreValue": 0 },
    { "label": "E", "text": "42", "isCorrect": false, "scoreValue": 0 }
  ]
}
```

## Contoh — TKP (weighted_options)

```json
{
  "questionText": "Atasan Anda meminta laporan mendadak yang harus selesai malam ini, padahal Anda sudah berjanji menjemput anak. Sikap Anda adalah?",
  "subtest": "TKP",
  "scoringType": "weighted_options",
  "difficulty": "medium",
  "topicId": null,
  "categoryId": null,
  "explanation": "Profesionalisme dan komitmen pribadi harus diseimbangkan. Mencari solusi (minta tolong pasangan/keluarga) sambil tetap menyelesaikan tugas adalah pilihan terbaik.",
  "explanationShort": "Cari solusi yang menyeimbangkan tanggung jawab kerja dan keluarga.",
  "sourceNote": "CPNS 2019 - Soal TKP Profesionalisme",
  "options": [
    { "label": "A", "text": "Menolak tugas karena sudah ada janji pribadi", "isCorrect": false, "scoreValue": 1 },
    { "label": "B", "text": "Mengerjakan laporan dan membatalkan janji jemput anak", "isCorrect": false, "scoreValue": 3 },
    { "label": "C", "text": "Meminta bantuan pasangan/keluarga menjemput, lalu menyelesaikan laporan", "isCorrect": false, "scoreValue": 5 },
    { "label": "D", "text": "Menjemput anak dulu, baru kerja sampai larut malam", "isCorrect": false, "scoreValue": 4 },
    { "label": "E", "text": "Mendelegasikan ke rekan kerja agar bisa pulang", "isCorrect": false, "scoreValue": 2 }
  ]
}
```

## Contoh — TWK (single_correct)

```json
{
  "questionText": "Pancasila sebagai dasar negara secara resmi disahkan pada tanggal?",
  "subtest": "TWK",
  "scoringType": "single_correct",
  "difficulty": "easy",
  "topicId": null,
  "categoryId": null,
  "explanation": "Pancasila disahkan sebagai dasar negara pada sidang PPKI tanggal 18 Agustus 1945, sehari setelah Proklamasi Kemerdekaan.",
  "explanationShort": "PPKI mengesahkan Pancasila pada 18 Agustus 1945.",
  "sourceNote": "CPNS 2018 - Soal TWK Pancasila",
  "options": [
    { "label": "A", "text": "1 Juni 1945", "isCorrect": false, "scoreValue": 0 },
    { "label": "B", "text": "17 Agustus 1945", "isCorrect": false, "scoreValue": 0 },
    { "label": "C", "text": "18 Agustus 1945", "isCorrect": true,  "scoreValue": 5 },
    { "label": "D", "text": "22 Juni 1945", "isCorrect": false, "scoreValue": 0 },
    { "label": "E", "text": "1 Oktober 1945", "isCorrect": false, "scoreValue": 0 }
  ]
}
```

## Output Format yang Diminta

Hasilkan file `cpns-soal-<TAHUN>.json` berisi array JSON soal:

```json
[
  { ...soal1... },
  { ...soal2... }
]
```
