# Panduan Kolaborasi & Best Practices Smart Barbershop Frontend

Dokumen ini berisi standar dan panduan kolaborasi untuk menjaga kualitas, konsistensi, dan skalabilitas kode pada proyek Smart Barbershop Frontend.
**Repository:** [https://github.com/WageFolabessy/smart_barbershop_frontend.git](https://github.com/WageFolabessy/smart_barbershop_frontend.git)

## 1. Strategi Branching (Git Flow)

Kita menggunakan pola branching yang deskriptif untuk memisahkan fitur baru, perbaikan bug, dan kode produksi.

- **Branch Utama:** `main` (Kode produksi yang stabil).
- **Format Nama Branch:** `[tipe]/[deskripsi-singkat-kebab-case]`

### Tipe Branch:

- `feature/` : Untuk fitur baru (contoh: `feature/login-page`, `feature/booking-system`).
- `fix/` : Untuk perbaikan bug (contoh: `fix/image-upload-error`, `fix/typo-dashboard`).
- `refactor/` : Untuk perapihan kode tanpa mengubah fitur (contoh: `refactor/auth-hooks`).
- `docs/` : Untuk perubahan dokumentasi.
  **Contoh:**

```bash
git checkout -b feature/add-payment-gateway
git checkout -b fix/navbar-responsive-issue
```

## 2. Standar Kode (Code Style)

Kode harus konsisten agar mudah dibaca dan dipelihara oleh tim.

- **Framework & Tools:** Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Formatting:** Proyek ini menggunakan **Prettier** dan **ESLint**.
    - Selalu gunakan konfigurasi yang ada di `.prettierrc` dan `eslint.config.mjs`.
    - Aktifkan "Format on Save" di editor Anda.
    - Jalankan `npm run format` untuk memformat seluruh kode secara otomatis.
- **UI Components (shadcn/ui):**
    - Proyek ini menggunakan **shadcn/ui** sebagai basis komponen UI.
    - Komponen UI dasar (Button, Input, Dialog, dll) berada di `src/components/ui`.
    - Jangan ubah komponen di `src/components/ui` secara manual kecuali untuk kustomisasi global.
    - Gunakan perintah `npx shadcn@latest add [nama-komponen]` untuk menambahkan komponen baru.
- **Penamaan:**
    - **File & Folder:** `kebab-case` (contoh: `user-profile.tsx`, `components/ui/button.tsx`).
    - **Komponen:** `PascalCase` (contoh: `UserProfile`, `Button`).
    - **Fungsi & Variabel:** `camelCase` (contoh: `handleSubmit`, `userData`).
    - **Interface/Type:** `PascalCase` (contoh: `User`, `BookingRequest`).
- **Struktur Komponen:**
    - Gunakan `ClientOnly` untuk komponen yang membutuhkan akses browser API untuk menghindari hydration error.
    - Pisahkan logic kompleks ke dalam custom hooks (`src/hooks`).
    - Gunakan `src/lib/utils.ts` untuk fungsi utilitas umum.

## 3. Pesan Commit (Commit Messages)

Gunakan format **Conventional Commits** agar history git rapi dan mudah dipahami. Disarankan menggunakan fitur _Auto Generate Commit Message_ di VS Code (Copilot/Extension) namun tetap direview manual.
**Format:** `<tipe>: <deskripsi singkat>`

### Tipe Commit Umum:

- `feat`: Penambahan fitur baru.
- `fix`: Perbaikan bug.
- `docs`: Perubahan dokumentasi.
- `style`: Perubahan format, spasi, titik koma (tidak mengubah logic).
- `refactor`: Perubahan kode yang bukan fix atau fitur baru.
- `perf`: Peningkatan performa.
- `chore`: Update build task, package manager, dll.
  **Contoh:**
- `feat: implementasi login dengan google auth`
- `fix: perbaiki validasi form booking`
- `style: ubah warna tombol primary sesuai desain baru`

## 4. Workflow Pengembangan (Development Workflow)

Ikuti langkah-langkah ini untuk setiap perubahan kode:

1.  **Pull Terbaru:** Selalu update branch `main` lokal Anda sebelum memulai.
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Setup Environment:**
    *   Copy file `.env.example` menjadi `.env.local`.
    *   Sesuaikan value di dalamnya dengan konfigurasi lokal Anda.
    ```bash
    cp .env.example .env.local
    ```
3.  **Buat Branch Baru:** Sesuai aturan penamaan di poin 1.
    ```bash
    git checkout -b feature/nama-fitur-anda
    ```
3.  **Coding:** Tulis kode yang bersih, optimal, dan aman.
4.  **Validasi Lokal (WAJIB):** Sebelum commit, jalankan perintah berikut untuk memastikan tidak ada error.
    ```bash
    npm run format # Format kode agar konsisten (Prettier)
    npm run lint   # Cek standar kode & error TypeScript
    npm run build  # Pastikan aplikasi bisa di-build (cek type error production)
    ```
    > **PENTING:** Jangan pernah push kode yang gagal saat `lint` atau `build`.
5.  **Commit & Push:**
    ```bash
    git add .
    git commit -m "feat: pesan commit anda"
    git push origin feature/nama-fitur-anda
    ```
6.  **Pull Request (PR):** Buat PR ke branch `main` di GitHub dan minta review.

## 5. Kualitas & Optimasi Kode

- **Type Safety:** Hindari penggunaan `any`. Definisikan tipe data secara eksplisit di `src/types`.
- **Performa:**
    - Gunakan komponen `Image` dari Next.js untuk optimasi gambar.
    - Terapkan _Lazy Loading_ untuk komponen berat.
    - Hindari re-render yang tidak perlu (gunakan `useMemo`, `useCallback` jika perlu).
- **Clean Code:**
    - **DRY (Don't Repeat Yourself):** Buat komponen atau fungsi reusable jika kode digunakan lebih dari sekali.
    - **SOLID:** Prinsip desain berorientasi objek/komponen.
    - Hapus `console.log` dan komentar yang tidak perlu sebelum push ke production.
- **Error Handling:** Tangani error dengan baik (gunakan `try-catch`, tampilkan pesan error user-friendly via `sonner` toast).

---

_Dokumen ini dibuat untuk memastikan kolaborasi yang efisien dan produk berkualitas tinggi. Selamat berkarya!_
