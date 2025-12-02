# 📚 Smart Barbershop Frontend - Documentation

Selamat datang di dokumentasi Smart Barbershop Frontend!

## 🚀 Quick Links

- **[README.md](../README.md)** - Getting started & project overview
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[AGENTS.md](../AGENTS.md)** - AI agent development guidelines

---

## 🎨 Theme System Documentation

Dokumentasi lengkap sistem dark/light mode:

### 📖 Main Guides

1. **[THEME.md](./THEME.md)** - Dokumentasi Lengkap Sistem Tema
   - Gambaran umum fitur
   - Panduan pengguna
   - Panduan developer
   - Kustomisasi warna
   - Testing & troubleshooting
   - Best practices
   - **Start here** untuk dokumentasi komprehensif

2. **[THEME_QUICKSTART.md](./THEME_QUICKSTART.md)** - Panduan Cepat
   - Quick reference untuk developer
   - Common use cases
   - Troubleshooting cepat
   - **Start here** untuk implementasi cepat

3. **[COLORS.md](./COLORS.md)** - Referensi Palet Warna
   - Light mode colors
   - Dark mode colors
   - OKLCH color space guide
   - Tailwind class mappings
   - WCAG compliance
   - Customization examples
   - **Start here** untuk kustomisasi warna

---

## 📂 Documentation Structure

```
docs/
├── README.md                 # This file
├── THEME.md                  # Complete theme documentation
├── THEME_QUICKSTART.md       # Quick reference guide
└── COLORS.md                 # Color palette reference
```

---

## 🎯 Documentation by Use Case

### "Saya ingin mengubah tema sebagai pengguna"
→ Baca: [THEME.md - Cara Menggunakan](./THEME.md#cara-menggunakan)

### "Saya ingin menambah theme toggle ke komponen"
→ Baca: [THEME_QUICKSTART.md - Import dan Gunakan](./THEME_QUICKSTART.md#import-dan-gunakan)

### "Saya ingin mengubah warna gold menjadi warna lain"
→ Baca: [COLORS.md - Customization Examples](./COLORS.md#customization-examples)

### "Komponen saya tidak berubah warna saat ganti tema"
→ Baca: [THEME.md - Troubleshooting](./THEME.md#troubleshooting)

### "Saya ingin tahu nilai warna spesifik"
→ Baca: [COLORS.md - Light/Dark Mode Colors](./COLORS.md#light-mode-colors)

### "Saya ingin test theme feature"
→ Baca: [THEME.md - Testing](./THEME.md#testing)

---

## 🛠️ Developer Resources

### Architecture Overview

```
src/
├── app/
│   ├── globals.css           # Theme color definitions
│   ├── layout.tsx            # Root layout with ThemeProvider
│   └── page.tsx              # Landing page with theme toggle
├── components/
│   ├── providers.tsx         # ThemeProvider wrapper
│   ├── ui/
│   │   └── theme-toggle.tsx  # Theme toggle component
│   ├── admin-nav.tsx         # Admin nav with toggle
│   ├── barber-nav.tsx        # Barber nav with toggle
│   └── customer-nav.tsx      # Customer nav with toggle
```

### Key Technologies

- **Framework:** Next.js 16 (App Router)
- **Theme Library:** next-themes v0.4.6
- **Styling:** Tailwind CSS v4
- **Color Space:** OKLCH

### Quick Code Examples

**Import Theme Toggle:**
```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'
```

**Use Theme Hook:**
```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
```

**Style with Theme:**
```tsx
<div className="bg-background text-foreground">
  {/* Content adapts to theme */}
</div>
```

---

## 📝 Contributing to Documentation

Menemukan typo atau ingin menambahkan dokumentasi?

1. Fork repository
2. Edit file `.md` di folder `docs/`
3. Submit Pull Request dengan label `documentation`

**Guidelines:**
- Gunakan Bahasa Indonesia untuk dokumentasi user-facing
- Gunakan English untuk code examples
- Include screenshots jika memungkinkan
- Keep formatting consistent

---

## 🔗 External Resources

### Official Docs
- [Next.js Documentation](https://nextjs.org/docs)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)

### Color Tools
- [OKLCH Color Picker](https://oklch.com/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Space Guide](https://www.oklab.xyz/)

### Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chrome DevTools - Accessibility](https://developer.chrome.com/docs/devtools/accessibility/)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/WageFolabessy/smart_barbershop_frontend/issues)
- **Discussions:** [GitHub Discussions](https://github.com/WageFolabessy/smart_barbershop_frontend/discussions)
- **Pull Requests:** [Contributing Guide](../CONTRIBUTING.md)

---

## 📅 Changelog

### Theme System v1.0.0 (2025-12-03)
- ✅ Initial release
- ✅ Dark/Light mode support
- ✅ System preference detection
- ✅ Theme toggle component
- ✅ Complete documentation

---

**Happy coding! 🚀**
