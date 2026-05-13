# NalarUp — Design Tokens

## Color Palette

### Base (Dark Theme)
| Token | Value | Usage |
|---|---|---|
| `--navy` | `#0A0F1E` | Background utama |
| `--navy2` | `#111827` | Surface layer |
| `--navy3` | `#1C2333` | Card background |
| `--border-dark` | `rgba(255,255,255,0.08)` | Border default |
| `--border-dark2` | `rgba(255,255,255,0.13)` | Border emphasis |
| `--text-white` | `#F8FAFC` | Teks utama |
| `--text-muted` | `rgba(255,255,255,0.65)` | Teks sekunder |
| `--text-dim` | `rgba(255,255,255,0.45)` | Teks tersier / label kecil |

### Brand Colors
| Token | Value | Usage |
|---|---|---|
| `--blue` | `#2563EB` | Primary CTA, button utama |
| `--blue-light` | `#3B82F6` | Hover state, accent |
| `--violet` | `#7C3AED` | SKB badge, secondary accent |
| `--green` | `#10B981` | Sukses, badge gratis |
| `--amber` | `#F59E0B` | Premium badge, bintang rating |
| `--pink` | `#F472B6` | Fitur notifikasi |
| `--teal` | `#14B8A6` | Fitur offline |

### Semantic (untuk text di atas warna)
| Background | Text color |
|---|---|
| Blue bg (`rgba(37,99,235,0.18)`) | `#93C5FD` |
| Violet bg (`rgba(124,58,237,0.18)`) | `#C4B5FD` |
| Green bg (`rgba(16,185,129,0.15)`) | `#6EE7B7` |
| Amber bg (`rgba(245,158,11,0.15)`) | `#FCD34D` |

---

## Typography

| Role | Size | Weight | Color |
|---|---|---|---|
| Hero H1 | 36px | 500 | #fff |
| Section H2 | 20px | 500 | #fff |
| Card title | 13px | 500 | #fff |
| Body / desc | 13-14px | 400 | `--text-muted` |
| Label kecil | 11px | 400-500 | `--text-dim` |
| Badge | 11px | 500 | (per warna) |

### Gradient Text (hero headline accent)
```css
background: linear-gradient(135deg, #60A5FA, #A78BFA);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

---

## Spacing

| Token | Value |
|---|---|
| Section padding | `36px 28px` |
| Card padding | `16px` |
| Card border-radius | `14px` |
| Button border-radius | `8-10px` |
| Badge border-radius | `20px` (pill) |
| Gap antar card | `10px` |
| Gap antar section | `border-bottom 1px` |

---

## Component Patterns

### Card (default)
```css
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 14px;
```

### Card dengan top-highlight (3D feel)
```css
position: relative;
overflow: hidden;
/* + ::before pseudo */
::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
}
```

### Card featured/active
```css
border-color: rgba(37,99,235,0.5);
background: rgba(37,99,235,0.06);
```

### Glow effect (hero)
```css
position: absolute;
border-radius: 50%;
background: rgba(37,99,235,0.18);
filter: blur(60px);
pointer-events: none;
```

### Button primary
```css
background: #2563EB;
color: #fff;
border: none;
border-radius: 10px;
padding: 11px 24px;
font-size: 14px;
font-weight: 500;
```

### Button ghost (dark)
```css
background: rgba(255,255,255,0.05);
border: 1px solid rgba(255,255,255,0.13);
color: rgba(255,255,255,0.65);
border-radius: 8px;
```

---

## Icon System
Tabler Icons (outline only)
CDN: `https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css`

Icon yang sering dipakai:
- `ti-target` — logo
- `ti-bolt` — CTA hero
- `ti-clock` — durasi tryout
- `ti-notes` — jumlah soal
- `ti-lock` — konten terkunci
- `ti-star` — premium / rating
- `ti-check` — fitur aktif
- `ti-x` — fitur tidak aktif
- `ti-robot` — AI feature
- `ti-chart-line` — analitik
- `ti-users` — live/komunitas
- `ti-bell` — notifikasi
- `ti-wifi-off` — offline
- `ti-arrow-right` — navigasi
