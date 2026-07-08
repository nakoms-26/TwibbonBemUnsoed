# Product Requirements Document (PRD)
## SaaS Twibbon Generator

### 1. Gambaran Produk

Twibbon Generator adalah aplikasi web yang memungkinkan admin membuat dan mengelola template twibbon untuk berbagai acara. Pengunjung cukup membuka link twibbon, mengunggah foto, menyesuaikan posisi, lalu mengunduh hasilnya.

Aplikasi tidak menyimpan foto maupun hasil twibbon pengguna. Yang disimpan hanya data template twibbon beserta konfigurasi.

**Target deployment:**
- Hosting dengan dukungan Node.js
- MySQL
- Penyimpanan file di folder `public/uploads`

---

### 2. Tujuan

**Admin**
- Membuat twibbon baru.
- Mengatur slug.
- Upload twibbon gambar maupun video.
- Mengatur posisi foto pada template.
- Mengaktifkan/nonaktifkan twibbon.

**User**
- Membuka halaman twibbon via link.
- Upload foto.
- Crop & sesuaikan foto.
- Download hasil twibbon.

---

### 3. User Role

**Admin**
Hak akses:
- Login / Logout
- Dashboard (statistik)
- CRUD Twibbon
- Upload asset (overlay, thumbnail)
- Melihat statistik download
- Mengaktifkan/nonaktifkan twibbon

**User**
Tanpa login. Bisa:
- Membuka halaman twibbon
- Upload foto
- Crop, zoom, geser foto
- Download hasil

---

### 4. Teknologi

**Framework (Full-Stack)**
- **Next.js 15** (App Router) — menangani frontend, backend API, dan SSR dalam satu codebase

**Frontend**
- React
- Tailwind CSS
- Konva.js (canvas editor untuk compositing foto + overlay gambar)
- React Easy Crop (crop & zoom foto)
- **WebGL Shader** (chroma key — hapus green screen video overlay secara real-time di GPU)

**Backend (Next.js API)**
- Next.js Route Handlers (`app/api/...`)
- Server Actions (untuk form submission)

**Database & ORM**
- MySQL
- Prisma ORM

**Autentikasi**
- NextAuth.js (Auth.js) — session-based untuk admin

**Upload File**
- Formidable / Multer (parsing multipart form)
- Simpan ke folder `public/uploads/`

**SEO**
- Next.js Metadata API (built-in, server-side rendered)
- Open Graph tags otomatis per halaman twibbon

---

### 5. Struktur Database (Prisma Schema)

**`Admin`**

| Field | Type | Keterangan |
| --- | --- | --- |
| id | Int (autoincrement) | Primary key |
| name | String | Nama admin |
| username | String (unique) | Username login |
| password | String | Hashed password (bcrypt) |
| createdAt | DateTime | Waktu dibuat |

**`Twibbon`**

| Field | Type | Keterangan |
| --- | --- | --- |
| id | Int (autoincrement) | Primary key |
| title | String | Judul twibbon |
| slug | String (unique) | URL-friendly identifier |
| description | String? | Deskripsi (opsional) |
| type | Enum (IMAGE, VIDEO) | Jenis overlay |
| overlayFile | String | Path file overlay |
| thumbnail | String | Path file thumbnail |
| config | Json | Konfigurasi posisi foto |
| isActive | Boolean | Status aktif/nonaktif |
| createdAt | DateTime | Waktu dibuat |
| updatedAt | DateTime | Waktu diupdate |

**`Download`**

*Untuk statistik saja.*

| Field | Type | Keterangan |
| --- | --- | --- |
| id | Int (autoincrement) | Primary key |
| twibbonId | Int (FK → Twibbon) | Relasi ke twibbon |
| ipAddress | String | IP pengunjung |
| createdAt | DateTime | Waktu download |

---

### 6. Struktur Folder Project

```text
src/
  app/
    (public)/              → Halaman publik
      page.tsx             → Homepage
      twibbons/
        page.tsx           → Daftar twibbon
      twibbon/
        [slug]/
          page.tsx         → Halaman editor twibbon
    admin/
      login/
        page.tsx           → Halaman login admin
      dashboard/
        page.tsx           → Dashboard admin
      twibbons/
        page.tsx           → Kelola twibbon (list)
        create/
          page.tsx         → Form tambah twibbon
        [id]/
          edit/
            page.tsx       → Form edit twibbon
    api/
      auth/
        [...nextauth]/
          route.ts         → NextAuth handler
      twibbons/
        route.ts           → GET list, POST create
        [id]/
          route.ts         → GET detail, PUT update, DELETE
      download/
        route.ts           → POST catat statistik download
      upload/
        route.ts           → POST upload file
  components/
    TwibbonEditor.tsx      → Komponen editor (Konva.js + Crop)
    TwibbonCard.tsx        → Card preview twibbon
    AdminLayout.tsx        → Layout dashboard admin
  lib/
    prisma.ts              → Prisma client instance
    auth.ts                → NextAuth config
    upload.ts              → Helper upload file
  prisma/
    schema.prisma          → Schema database
public/
  uploads/
    images/                → File overlay gambar
    videos/                → File overlay video
    thumbnails/            → File thumbnail
```

---

### 7. Konfigurasi Template

Disimpan pada kolom JSON di database.

Contoh:
```json
{
  "photo": {
    "x": 200,
    "y": 160,
    "width": 520,
    "height": 520,
    "rotation": 0,
    "shape": "circle"
  }
}
```

Konfigurasi ini menentukan posisi dan ukuran area foto user relatif terhadap overlay twibbon.

---

### 8. URL / Routing

| Halaman | URL | Akses |
| --- | --- | --- |
| Homepage | `/` | Publik |
| Daftar Twibbon | `/twibbons` | Publik |
| Editor Twibbon | `/twibbon/{slug}` | Publik |
| Login Admin | `/admin/login` | Publik |
| Dashboard | `/admin/dashboard` | Admin only |
| Kelola Twibbon | `/admin/twibbons` | Admin only |
| Tambah Twibbon | `/admin/twibbons/create` | Admin only |
| Edit Twibbon | `/admin/twibbons/{id}/edit` | Admin only |

---

### 9. API Endpoints (Route Handlers)

| Method | Endpoint | Fungsi | Auth |
| --- | --- | --- | --- |
| GET | `/api/twibbons` | List twibbon aktif | - |
| GET | `/api/twibbons/{slug}` | Detail twibbon by slug | - |
| POST | `/api/download` | Catat statistik download | - |
| POST | `/api/auth/[...nextauth]` | Login/logout admin | - |
| GET | `/api/admin/twibbons` | List semua twibbon (admin) | ✅ |
| POST | `/api/admin/twibbons` | Buat twibbon baru | ✅ |
| PUT | `/api/admin/twibbons/{id}` | Update twibbon | ✅ |
| DELETE | `/api/admin/twibbons/{id}` | Hapus twibbon | ✅ |
| POST | `/api/upload` | Upload file overlay/thumbnail | ✅ |

---

### 10. Dashboard Admin

**Statistik (Card)**
- Total Twibbon
- Twibbon Aktif
- Total Download (semua)

**List Twibbon (Tabel)**

| Kolom | Keterangan |
| --- | --- |
| Thumbnail | Preview gambar |
| Judul | Nama twibbon |
| Slug | URL identifier |
| Jenis | Image / Video |
| Status | Aktif / Nonaktif (toggle) |
| Downloads | Jumlah download |
| Aksi | Edit / Hapus |

**Form Tambah/Edit Twibbon**
- Judul
- Slug (auto-generate dari judul, bisa diedit)
- Deskripsi
- Jenis (Image / Video)
- Upload Overlay (PNG/MP4)
- Upload Thumbnail
- Status (Aktif/Nonaktif)

---

### 11. Upload Twibbon

**Gambar (Overlay)**
- Format: PNG (transparan)
- Maksimal: 10 MB

**Video (Overlay)**
- Format: MP4 (dengan green screen background)
- Codec: H264
- Maksimal: 50 MB
- Admin upload video dengan latar hijau (green screen) pada area foto user

**Thumbnail**
- Format: PNG / JPG
- Maksimal: 2 MB

---

### 12. Editor User (Client-Side)

**Alur:**
Upload Foto → Crop → Zoom → Geser → Preview → Download

**Mode Image (PNG overlay):**
- **React Easy Crop** — crop & zoom foto user
- **Konva.js / Canvas API** — compositing foto user + overlay PNG transparan
- Hasil di-render di browser → user download langsung

**Mode Video (MP4 overlay + Chroma Key):**
- **React Easy Crop** — crop & zoom foto user
- **WebGL Shader** — render video frame-by-frame, deteksi pixel hijau (green screen) → jadikan transparan secara real-time di GPU
- Foto user ditampilkan di belakang layer video yang sudah transparan
- User melihat preview animasi real-time dengan fotonya
- Download menggunakan **Canvas + MediaRecorder API** → output MP4

**Alur Chroma Key (WebGL):**
```
Video frame → WebGL texture → Fragment shader deteksi warna hijau
→ Set alpha = 0 pada pixel hijau → Compositing dengan foto user
→ Render ke Canvas → Real-time preview
```

- **Server tidak menyimpan foto user maupun hasil akhir**

---

### 13. Download

- **Image twibbon:** Output PNG atau JPG (di-render via Canvas API di browser)
- **Video twibbon:** Output MP4 (di-render via WebGL chroma key + Canvas + MediaRecorder di browser)
- Setiap download → kirim request ke `POST /api/download` untuk catat statistik

---

### 14. Validasi

**Server-side (API):**
- Slug harus unik
- Overlay asset wajib diupload
- Thumbnail wajib diupload
- Format file sesuai (PNG untuk image, MP4 untuk video)
- Ukuran file tidak melebihi batas

**Client-side (Form):**
- Field wajib tidak boleh kosong
- Preview sebelum submit

---

### 15. SEO

Setiap halaman twibbon memiliki metadata server-rendered:
- `title` — judul twibbon
- `description` — deskripsi twibbon
- `og:image` — thumbnail twibbon
- `og:title`, `og:description` — Open Graph tags

Diimplementasikan menggunakan **Next.js Metadata API** (`generateMetadata`) sehingga preview muncul saat link dibagikan ke WhatsApp, Twitter, dll.

---

### 16. Keamanan

- **Auth:** NextAuth.js session-based untuk admin
- **Protected Routes:** Middleware Next.js untuk halaman `/admin/*`
- **Validasi Upload:** Cek MIME type, ukuran file, ekstensi
- **Hash Password:** bcrypt
- **Rate Limit:** Pada endpoint download (mencegah abuse)
- **Sanitasi Input:** Validasi semua input dari form dan API
- **CORS:** Dikonfigurasi sesuai domain

---

### 17. Tahapan Pengembangan

**Fase 1 — MVP**
- Setup project Next.js + Prisma + MySQL
- Autentikasi admin (login/logout)
- CRUD twibbon (gambar/PNG saja)
- Upload overlay + thumbnail
- Halaman editor user (crop, zoom, download PNG)
- Statistik download
- SEO metadata per twibbon

**Fase 2 — Video Support**
- Dukungan twibbon video (MP4 overlay)
- Render video dengan foto pengguna di browser
- Template animasi

**Fase 3 — Advanced Features**
- Template editor visual (drag & drop posisi foto di admin)
- QR Code untuk tiap twibbon
- Password protection untuk twibbon tertentu
- Penjadwalan aktif/nonaktif otomatis berdasarkan tanggal

---

### 18. Perintah Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Jalankan production server
npm start
```
