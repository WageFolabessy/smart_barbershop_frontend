# Dokumentasi Tema - Smart Barbershop Frontend

Dokumentasi lengkap sistem tema dark/light mode untuk aplikasi Smart Barbershop.

## 📋 Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Cara Menggunakan](#cara-menggunakan)
3. [Panduan Developer](#panduan-developer)
4. [Kustomisasi Warna](#kustomisasi-warna)
5. [Komponen Tema](#komponen-tema)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Gambaran Umum

Smart Barbershop mendukung dua tema visual:

### 🌙 Dark Mode (Default)
- **Background:** Obsidian black untuk tampilan premium
- **Primary Color:** Gold (#D4AF37) untuk aksen luxury
- **Text:** White/Silver untuk keterbacaan optimal
- **Mood:** Sophisticated, mewah, eksklusif

### ☀️ Light Mode
- **Background:** Warm off-white untuk kenyamanan mata
- **Primary Color:** Darker gold untuk kontras lebih baik
- **Text:** Near-black untuk keterbacaan maksimal
- **Mood:** Clean, fresh, professional

### ✨ Fitur Utama

- **Deteksi Sistem Otomatis:** Aplikasi mendeteksi preferensi tema OS pengguna
- **Toggle Manual:** Tombol sun/moon untuk beralih tema secara manual
- **Persistensi:** Pilihan tema tersimpan di localStorage
- **Transisi Halus:** Animasi 300ms saat berganti tema
- **Responsive:** Toggle tersedia di semua navigasi (admin, barber, customer)
- **Accessible:** Label dalam Bahasa Indonesia, kontras warna memenuhi WCAG AA

---

## Cara Menggunakan

### Untuk Pengguna Akhir

#### Mengubah Tema

1. **Cari Tombol Toggle Tema:**
   - Di navigation bar (pojok kanan atas)
   - Ikon: 🌙 (moon) di light mode, ☀️ (sun) di dark mode

2. **Klik Tombol:**
   - Tema akan berubah dengan animasi halus
   - Pilihan tersimpan otomatis

3. **Lokasi Toggle:**
   - **Landing Page:** Pojok kanan atas
   - **Admin Dashboard:** Navigation bar, sebelah tombol Keluar
   - **Barber Dashboard:** Navigation bar, sebelah tombol Keluar
   - **Customer Pages:** Navigation bar, sebelah tombol Keluar

#### Preferensi Sistem

Saat pertama kali membuka aplikasi:
- **OS Dark Mode:** Aplikasi otomatis menggunakan dark mode
- **OS Light Mode:** Aplikasi otomatis menggunakan light mode
- **Setelah manual switch:** Preferensi manual diutamakan

---

## Panduan Developer

### Instalasi & Setup

Theme system sudah terintegrasi menggunakan `next-themes`. Tidak perlu instalasi tambahan.

#### Dependencies yang Digunakan

```json
{
  "next-themes": "^0.4.6",
  "lucide-react": "^0.555.0"
}
```

### Arsitektur

#### 1. Theme Provider (`src/components/providers.tsx`)

```tsx
import { ThemeProvider } from 'next-themes'

export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"           // Menggunakan class selector
      defaultTheme="system"        // Default ikuti sistem
      enableSystem={true}          // Enable deteksi sistem
      disableTransitionOnChange={false} // Enable smooth transition
    >
      {children}
    </ThemeProvider>
  )
}
```

#### 2. Root Layout (`src/app/layout.tsx`)

```tsx
<html lang="id" suppressHydrationWarning>
  <body className="theme-transition">
    <Providers>{children}</Providers>
  </body>
</html>
```

**Penting:**
- `suppressHydrationWarning`: Mencegah warning saat hydration
- `theme-transition`: Class untuk smooth transition

#### 3. Theme Toggle Component (`src/components/ui/theme-toggle.tsx`)

Komponen yang menampilkan tombol toggle:

```tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from './button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="size-9" /> // Placeholder
  }

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
```

**Catatan Penting:**
- `mounted` state: Mencegah hydration mismatch
- Placeholder `<div>`: Mencegah layout shift

### Menggunakan Hook `useTheme`

```tsx
'use client'

import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme, systemTheme } = useTheme()
  
  // Mendapatkan tema aktif
  const currentTheme = theme === 'system' ? systemTheme : theme
  
  // Mengubah tema
  const switchToLight = () => setTheme('light')
  const switchToDark = () => setTheme('dark')
  const switchToSystem = () => setTheme('system')
  
  return (
    <div>
      <p>Tema saat ini: {currentTheme}</p>
      <button onClick={switchToLight}>Light</button>
      <button onClick={switchToDark}>Dark</button>
      <button onClick={switchToSystem}>System</button>
    </div>
  )
}
```

### Styling dengan Tailwind

#### Menggunakan Class `dark:`

```tsx
// Background berubah sesuai tema
<div className="bg-white dark:bg-black">
  Content
</div>

// Text berubah sesuai tema
<p className="text-gray-900 dark:text-gray-100">
  Teks ini berubah warna
</p>

// Border berubah sesuai tema
<button className="border-gray-300 dark:border-gray-700">
  Button
</button>
```

#### Menggunakan Semantic Color Tokens (Recommended)

```tsx
// Lebih baik: menggunakan token yang sudah didefinisikan
<div className="bg-background text-foreground">
  Content
</div>

<div className="bg-card text-card-foreground">
  Card content
</div>

<button className="bg-primary text-primary-foreground">
  Button
</button>
```

**Token yang Tersedia:**

| Token | Deskripsi | Light Mode | Dark Mode |
|-------|-----------|------------|-----------|
| `background` | Background utama | Warm off-white | Obsidian black |
| `foreground` | Text utama | Near-black | White/Silver |
| `card` | Background card | Pure white | Dark gray |
| `primary` | Aksen utama (gold) | Darker gold | Bright gold |
| `secondary` | Aksen kedua | Light beige | Dark silver |
| `muted` | Background subtle | Very light beige | Dark gray |
| `accent` | Highlight | Light gold tint | Dark gold tint |
| `destructive` | Error/danger | Warm red | Red with opacity |
| `border` | Border warna | Gold tinted | Gold tinted |
| `input` | Input border | Gold tinted | Gold tinted |
| `ring` | Focus ring | Gold glow | Gold glow |

---

## Kustomisasi Warna

### Struktur File CSS (`src/app/globals.css`)

```css
:root {
  /* Light mode colors (default) */
  --background: oklch(0.98 0.005 80);
  --foreground: oklch(0.15 0 0);
  /* ... lebih banyak variabel */
}

.dark {
  /* Dark mode colors */
  --background: oklch(0.12 0 0);
  --foreground: oklch(0.95 0 0);
  /* ... lebih banyak variabel */
}
```

### Format Warna: OKLCH

Menggunakan **OKLCH color space** untuk:
- Perceptual uniformity yang lebih baik
- Interpolasi warna yang lebih akurat
- Gradien yang lebih smooth

**Format:** `oklch(lightness chroma hue)`
- **Lightness:** 0-1 (0 = hitam, 1 = putih)
- **Chroma:** 0-0.4 (saturasi warna)
- **Hue:** 0-360 (angle dalam color wheel)

**Contoh:**
```css
/* Gold */
--primary: oklch(0.65 0.16 80);
         /* ^L   ^C    ^H */

/* Obsidian Black */
--background: oklch(0.12 0 0);
            /* ^L   ^C ^H */
```

### Mengubah Warna Primary (Gold)

Jika ingin mengganti warna gold dengan warna lain:

1. Buka `src/app/globals.css`
2. Cari variabel `--primary` di `:root` dan `.dark`
3. Ganti dengan nilai OKLCH baru

**Contoh: Mengganti ke Teal**
```css
:root {
  /* Darker teal untuk light mode */
  --primary: oklch(0.55 0.15 180);
  --primary-foreground: oklch(0.99 0 0);
}

.dark {
  /* Bright teal untuk dark mode */
  --primary: oklch(0.70 0.15 180);
  --primary-foreground: oklch(0.12 0 0);
}
```

### Mengubah Background

**Light Mode Background:**
```css
:root {
  /* Lebih putih (kurangi warmth) */
  --background: oklch(0.99 0 0);
  
  /* Lebih cream (tambah warmth) */
  --background: oklch(0.96 0.01 85);
}
```

**Dark Mode Background:**
```css
.dark {
  /* Lebih hitam pekat */
  --background: oklch(0.08 0 0);
  
  /* Lebih soft dark */
  --background: oklch(0.18 0 0);
}
```

### Transisi Animasi

Smooth transition dikontrol di `globals.css`:

```css
.theme-transition {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}

.theme-transition * {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}
```

**Mengubah Durasi:**
```css
/* Lebih cepat (200ms) */
transition: ... 0.2s ease;

/* Lebih lambat (500ms) */
transition: ... 0.5s ease;

/* Instant (no transition) */
transition: none;
```

---

## Komponen Tema

### ThemeToggle Component

Lokasi: `src/components/ui/theme-toggle.tsx`

**Props:** Tidak ada props (self-contained)

**Penggunaan:**
```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

function Navigation() {
  return (
    <nav>
      <div>Logo</div>
      <ThemeToggle /> {/* Add toggle */}
      <button>Logout</button>
    </nav>
  )
}
```

**Customization:**

```tsx
// Mengubah ukuran
<ThemeToggle className="scale-125" />

// Mengubah variant button
// Edit di theme-toggle.tsx:
<Button
  variant="outline"  // default: "ghost"
  size="icon"
  ...
>
```

### Integration Pattern

**Pattern 1: Di Navigation Bar**
```tsx
<nav>
  <div>Brand</div>
  <div>Menu Items</div>
  <div className="flex items-center gap-2">
    <span>User Name</span>
    <ThemeToggle />
    <button>Logout</button>
  </div>
</nav>
```

**Pattern 2: Di Settings Page**
```tsx
<section>
  <h2>Pengaturan Tampilan</h2>
  <div className="flex items-center justify-between">
    <div>
      <p>Tema</p>
      <p className="text-sm text-muted-foreground">
        Pilih tema terang atau gelap
      </p>
    </div>
    <ThemeToggle />
  </div>
</section>
```

**Pattern 3: Dengan Label**
```tsx
<div className="flex items-center gap-3">
  <label htmlFor="theme-toggle">Tema:</label>
  <ThemeToggle id="theme-toggle" />
  <span className="text-sm text-muted-foreground">
    {theme === 'dark' ? 'Gelap' : 'Terang'}
  </span>
</div>
```

---

## Testing

### Manual Testing Checklist

#### ✅ Fungsionalitas Dasar
- [ ] Toggle button muncul di semua halaman
- [ ] Klik toggle mengubah tema
- [ ] Icon berubah (sun ↔ moon)
- [ ] Tema tersimpan setelah refresh
- [ ] Deteksi sistem berfungsi di first visit

#### ✅ Visual Testing
- [ ] Semua text terbaca di kedua tema
- [ ] Kontras warna memadai (gunakan browser DevTools)
- [ ] Border terlihat jelas
- [ ] Button hover states bekerja
- [ ] Input fields terlihat jelas
- [ ] Card shadows/borders visible

#### ✅ Halaman-Halaman
- [ ] Landing page
- [ ] Login/Register
- [ ] Admin dashboard (charts, tables)
- [ ] Barber queue
- [ ] Customer booking
- [ ] Gallery (before/after images)
- [ ] History/Records

#### ✅ Komponen UI
- [ ] Buttons (semua variants)
- [ ] Forms (inputs, selects, textarea)
- [ ] Modals/Dialogs
- [ ] Dropdowns
- [ ] Tables
- [ ] Cards
- [ ] Badges/Tags
- [ ] Tabs
- [ ] Calendar

#### ✅ Responsive
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### ✅ Browsers
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Automated Testing

**Testing dengan Playwright:**

```typescript
// tests/theme.spec.ts
import { test, expect } from '@playwright/test'

test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto('/')
  
  // Find theme toggle button
  const toggle = page.getByRole('button', { name: /tema/i })
  
  // Check initial theme
  const html = page.locator('html')
  const initialTheme = await html.getAttribute('class')
  
  // Click toggle
  await toggle.click()
  
  // Wait for transition
  await page.waitForTimeout(500)
  
  // Verify theme changed
  const newTheme = await html.getAttribute('class')
  expect(newTheme).not.toBe(initialTheme)
})

test('theme persists after page reload', async ({ page }) => {
  await page.goto('/')
  
  // Switch to light mode
  const toggle = page.getByRole('button', { name: /tema/i })
  await toggle.click()
  
  // Reload page
  await page.reload()
  
  // Verify theme is still light
  const html = page.locator('html')
  const theme = await html.getAttribute('class')
  expect(theme).not.toContain('dark')
})
```

### Contrast Ratio Testing

**Menggunakan Chrome DevTools:**

1. Buka DevTools (F12)
2. Klik "Elements" tab
3. Pilih elemen text
4. Lihat "Accessibility" pane
5. Check "Contrast" ratio

**Standar WCAG:**
- **AA (Normal Text):** Minimum 4.5:1
- **AA (Large Text):** Minimum 3:1
- **AAA (Normal Text):** Minimum 7:1

**Light Mode Colors:**
- Background (`oklch(0.98 0.005 80)`) vs Text (`oklch(0.15 0 0)`) = **~15:1** ✅
- Primary (`oklch(0.65 0.16 80)`) vs White = **~4.8:1** ✅

**Dark Mode Colors:**
- Background (`oklch(0.12 0 0)`) vs Text (`oklch(0.95 0 0)`) = **~14:1** ✅
- Primary (`oklch(0.79 0.16 80)`) vs Background = **~6.5:1** ✅

---

## Troubleshooting

### Issue: Flash of Wrong Theme on Page Load

**Gejala:** Sebentar muncul tema yang salah sebelum tema benar diterapkan

**Solusi:**
```tsx
// Pastikan suppressHydrationWarning ada di <html>
<html lang="id" suppressHydrationWarning>
```

**Penyebab:** Server-side rendering tidak tahu tema user. `suppressHydrationWarning` menyembunyikan warning ini.

---

### Issue: Theme Toggle Tidak Muncul

**Gejala:** Button toggle tidak tampil

**Debugging:**
```tsx
// 1. Cek apakah mounted
console.log('Mounted:', mounted)

// 2. Cek theme value
console.log('Theme:', theme)

// 3. Cek ThemeProvider wrapper
// Pastikan <Providers> ada di layout.tsx
```

**Solusi Umum:**
- Pastikan `'use client'` ada di komponen
- Pastikan `ThemeProvider` membungkus app
- Clear browser cache & localStorage

---

### Issue: Warna Tidak Berubah

**Gejala:** Klik toggle tapi warna tidak berubah

**Cek:**
1. **Class `.dark` diterapkan?**
   ```javascript
   // Di browser console
   document.documentElement.classList.contains('dark')
   ```

2. **CSS Variables defined?**
   ```javascript
   // Di browser console
   getComputedStyle(document.documentElement).getPropertyValue('--background')
   ```

3. **Tailwind classes correct?**
   ```tsx
   // Pastikan menggunakan semantic tokens
   className="bg-background"  // ✅ Good
   className="bg-black"       // ❌ Won't change with theme
   ```

**Fix:**
```css
/* Pastikan di globals.css ada */
:root { --background: ... }
.dark { --background: ... }
```

---

### Issue: Transition Terlalu Cepat/Lambat

**Gejala:** Animasi tidak smooth atau terlalu lambat

**Adjust di `globals.css`:**
```css
.theme-transition * {
  /* Ubah durasi */
  transition: background-color 0.2s ease,  /* lebih cepat */
              color 0.2s ease,
              border-color 0.2s ease;
}
```

**Disable transition:**
```css
.theme-transition * {
  transition: none;
}
```

---

### Issue: LocalStorage Error

**Gejala:** Error "localStorage is not defined"

**Penyebab:** Server-side rendering tidak punya akses ke localStorage

**Solusi:**
```tsx
'use client' // Pastikan komponen adalah client component

// Atau gunakan conditional
if (typeof window !== 'undefined') {
  localStorage.getItem('theme')
}
```

---

### Issue: Icon Tidak Muncul

**Gejala:** Sun/Moon icon tidak render

**Cek:**
```bash
# Pastikan lucide-react terinstall
npm list lucide-react
```

**Fix:**
```bash
npm install lucide-react
```

---

## Best Practices

### 1. Gunakan Semantic Tokens
```tsx
// ✅ Good
<div className="bg-background text-foreground">

// ❌ Avoid
<div className="bg-white dark:bg-black text-black dark:text-white">
```

### 2. Test di Kedua Tema
Selalu test komponen baru di light dan dark mode

### 3. Kontras yang Cukup
Pastikan text readable di kedua tema (min 4.5:1)

### 4. Hindari Hardcoded Colors
```tsx
// ❌ Bad
<div style={{ backgroundColor: '#000' }}>

// ✅ Good
<div className="bg-card">
```

### 5. Gunakan CSS Variables
```tsx
// ❌ Bad
const bgColor = theme === 'dark' ? '#000' : '#fff'

// ✅ Good
// Biarkan CSS handle via variables
```

---

## Resources

### Tools
- [OKLCH Color Picker](https://oklch.com/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chrome DevTools Accessibility](https://developer.chrome.com/docs/devtools/accessibility/)

### Documentation
- [next-themes Docs](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [OKLCH Color Space](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)

### Support
- **Issues:** [GitHub Issues](https://github.com/WageFolabessy/smart_barbershop_frontend/issues)
- **Pull Request:** [PR Guidelines](../CONTRIBUTING.md)

---

## Changelog

### v1.0.0 (2025-12-03)
- ✅ Initial theme system implementation
- ✅ Dark/Light mode support
- ✅ System preference detection
- ✅ Theme toggle component
- ✅ Luxury light mode color palette
- ✅ Smooth transitions
- ✅ Persistent theme selection

---

**Dokumentasi ini akan terus diperbarui seiring perkembangan fitur.**
