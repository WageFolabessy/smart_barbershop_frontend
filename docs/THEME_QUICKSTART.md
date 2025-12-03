# Quick Start - Theme System

Panduan cepat untuk menggunakan sistem tema Smart Barbershop.

## Untuk Pengguna

### Mengubah Tema

**Lokasi Toggle:** Navigation bar (pojok kanan)

1. **Klik icon sun** ☀️ (saat dark mode) → Ganti ke light mode
2. **Klik icon moon** 🌙 (saat light mode) → Ganti ke dark mode

**Otomatis:** Aplikasi mendeteksi preferensi sistem Anda saat pertama kali dibuka.

---

## Untuk Developer

### Import dan Gunakan

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

function MyNav() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  )
}
```

### Akses Tema Programmatically

```tsx
'use client'
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  // Baca tema
  console.log(theme) // 'light' | 'dark' | 'system'
  
  // Set tema
  setTheme('light')
  setTheme('dark')
  setTheme('system')
}
```

### Styling Responsive

```tsx
// Gunakan semantic tokens (recommended)
<div className="bg-background text-foreground">
  Content
</div>

// Atau dark: prefix
<div className="bg-white dark:bg-black">
  Content
</div>
```

### Available Color Tokens

| Token | Usage |
|-------|-------|
| `bg-background` | Page background |
| `text-foreground` | Main text |
| `bg-card` | Card background |
| `bg-primary` | Primary color (gold) |
| `bg-secondary` | Secondary color |
| `bg-muted` | Subtle backgrounds |
| `border-border` | Border color |

### Testing Checklist

- [ ] Text readable in both themes
- [ ] Images display correctly
- [ ] Buttons have proper contrast
- [ ] Forms are usable
- [ ] Charts adapt to theme

---

## Color Palette

### Light Mode
- **Background:** `oklch(0.98 0.005 80)` - Warm off-white
- **Primary:** `oklch(0.65 0.16 80)` - Darker gold
- **Text:** `oklch(0.15 0 0)` - Near-black

### Dark Mode
- **Background:** `oklch(0.12 0 0)` - Obsidian black
- **Primary:** `oklch(0.79 0.16 80)` - Bright gold
- **Text:** `oklch(0.95 0 0)` - White/silver

---

## Common Issues

### Toggle not working?
- Check `'use client'` directive
- Clear localStorage: `localStorage.clear()`

### Colors not changing?
- Use semantic tokens: `bg-background` not `bg-white`
- Check if `.dark` class added to `<html>`

### Flash on load?
- Ensure `suppressHydrationWarning` on `<html>`

---

## Resources

- **Full Docs:** [`docs/THEME.md`](./THEME.md)
- **Contributing:** [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- **Issues:** [GitHub Issues](https://github.com/WageFolabessy/smart_barbershop_frontend/issues)
