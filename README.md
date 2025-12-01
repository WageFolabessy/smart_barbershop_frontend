# Smart Barbershop Frontend

Frontend aplikasi Smart Barbershop yang dibangun dengan Next.js 14, Tailwind CSS, dan Shadcn UI.
Aplikasi ini mendukung 3 role pengguna: Customer, Barber, dan Admin.

## Fitur Utama

### 🎨 Desain & UI

- **Dark Luxury Theme**: Estetika premium dengan warna hitam, emas, dan perak.
- **Responsif**: Tampilan optimal di desktop dan mobile.
- **Bahasa Indonesia**: Seluruh antarmuka menggunakan Bahasa Indonesia yang profesional.

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
    NEXT_PUBLIC_API_URL=http://localhost:8000
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
- `src/lib`: Utilitas (Axios, Formatters).
- `src/store`: State management (Zustand).
- `src/types`: Definisi tipe TypeScript.

## Teknologi

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix Primitives)
- **State Management**: Zustand & TanStack Query
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
