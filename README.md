# Smart Barbershop Frontend

Frontend aplikasi Smart Barbershop yang dibangun dengan Next.js 14, Tailwind CSS, dan Shadcn UI.
Aplikasi ini mendukung 3 role pengguna: Customer, Barber, dan Admin.

## Fitur Utama

### 🎨 Desain & UI

- **Dark/Light Theme**: Dua tema premium dengan toggle otomatis
  - 🌙 **Dark Mode**: Estetika luxury dengan obsidian black dan gold accents
  - ☀️ **Light Mode**: Clean professional dengan warm off-white dan gold accents
  - 🔄 **Auto-detect**: Deteksi preferensi sistem otomatis
  - 💾 **Persistent**: Pilihan tema tersimpan otomatis
  - ✨ **Smooth Transitions**: Animasi halus 300ms
- **Responsif**: Tampilan optimal di desktop dan mobile.
- **Bahasa Indonesia**: Seluruh antarmuka menggunakan Bahasa Indonesia yang profesional.
- **Accessible**: Memenuhi standar WCAG AA untuk kontras warna.

### 👥 Role Pengguna

#### 1. Customer (Pelanggan)

- **Smart Booking**: Pilih layanan, kapster, dan waktu dengan mudah.
- **Highlight Jam**: Penanda "Jam Sepi" (Hemat) dan "Jam Sibuk" (Premium).
- **Riwayat**: Lihat status booking (Menunggu, Selesai, Dibatalkan).
- **Hair Journey**: Galeri transformasi gaya rambut (Before/After).

#### 2. Barber (Kapster)

- **Dashboard Antrian**: Lihat jadwal hari ini.
- **Upload Hasil**: Upload foto Before/After dan catatan perawatan.

#### 3. Admin

- **Dashboard Overview**: Statistik pendapatan dan booking.
- **Manajemen Layanan**: CRUD layanan cukur.
- **Manajemen Pengguna**: Kelola data pengguna.

## Cara Menjalankan

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Setup Environment**
   Buat file `.env.local`:

    ```env
    NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
    ```

3. **Jalankan Development Server**

    ```bash
    npm run dev
    ```

4. **Buka Aplikasi**
   Buka [http://localhost:3000](http://localhost:3000) di browser.

## Struktur Project

- `src/app`: Halaman-halaman aplikasi (App Router).
- `src/components`: Komponen UI (Shadcn) dan komponen khusus.
  - `src/components/ui/theme-toggle.tsx`: Komponen toggle tema
- `src/lib`: Utilitas (Axios, Formatters).
- `src/store`: State management (Zustand).
- `src/types`: Definisi tipe TypeScript.
- `docs/`: Dokumentasi teknis
  - `docs/THEME.md`: Dokumentasi lengkap sistem tema

## Dokumentasi

- **[Panduan Tema](./docs/THEME.md)**: Dokumentasi lengkap dark/light mode
  - Cara menggunakan
  - Panduan developer
  - Kustomisasi warna
  - Testing guidelines
  - Troubleshooting

## Teknologi

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix Primitives)
- **State Management**: Zustand & TanStack Query
- **Theme System**: next-themes
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Date Utilities**: date-fns (ID locale)
