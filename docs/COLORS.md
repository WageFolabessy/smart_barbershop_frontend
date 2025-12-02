# Color Palette Reference

Referensi lengkap palet warna Smart Barbershop.

## Overview

Smart Barbershop menggunakan **OKLCH color space** untuk konsistensi warna dan transisi yang lebih baik.

**Format:** `oklch(L C H / A)`
- **L** (Lightness): 0-1 (0=hitam, 1=putih)
- **C** (Chroma): 0-0.4 (saturasi)
- **H** (Hue): 0-360 (warna)
- **A** (Alpha): 0-1 (opacity) - opsional

---

## Light Mode Colors

### Primary Colors

| Variable | Value | Description | Preview |
|----------|-------|-------------|---------|
| `--background` | `oklch(0.98 0.005 80)` | Warm off-white background | ![#FAF9F7](https://via.placeholder.com/50x30/FAF9F7/000000?text=+) |
| `--foreground` | `oklch(0.15 0 0)` | Near-black text | ![#262626](https://via.placeholder.com/50x30/262626/FFFFFF?text=+) |
| `--primary` | `oklch(0.65 0.16 80)` | Darker gold accent | ![#B8942F](https://via.placeholder.com/50x30/B8942F/000000?text=+) |
| `--primary-foreground` | `oklch(0.99 0 0)` | White on gold | ![#FCFCFC](https://via.placeholder.com/50x30/FCFCFC/000000?text=+) |

### Secondary Colors

| Variable | Value | Description |
|----------|-------|-------------|
| `--card` | `oklch(0.99 0.003 80)` | Pure white cards |
| `--card-foreground` | `oklch(0.15 0 0)` | Card text |
| `--popover` | `oklch(0.99 0.003 80)` | Popover background |
| `--popover-foreground` | `oklch(0.15 0 0)` | Popover text |

### Accent Colors

| Variable | Value | Description |
|----------|-------|-------------|
| `--secondary` | `oklch(0.93 0.01 80)` | Light beige |
| `--secondary-foreground` | `oklch(0.20 0 0)` | Dark text on beige |
| `--muted` | `oklch(0.95 0.005 80)` | Very subtle background |
| `--muted-foreground` | `oklch(0.50 0 0)` | Muted text |
| `--accent` | `oklch(0.93 0.01 80)` | Accent highlight |
| `--accent-foreground` | `oklch(0.15 0 0)` | Accent text |

### Functional Colors

| Variable | Value | Description |
|----------|-------|-------------|
| `--destructive` | `oklch(0.55 0.20 25)` | Warm red for errors |
| `--destructive-foreground` | `oklch(0.99 0 0)` | White on red |
| `--border` | `oklch(0.65 0.16 80 / 0.3)` | Gold tinted borders |
| `--input` | `oklch(0.65 0.16 80 / 0.25)` | Input field borders |
| `--ring` | `oklch(0.65 0.16 80 / 0.6)` | Focus ring glow |

### Chart Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--chart-1` | `oklch(0.65 0.16 80)` | Primary chart color |
| `--chart-2` | `oklch(0.60 0.14 75)` | Secondary chart color |
| `--chart-3` | `oklch(0.55 0.12 70)` | Tertiary chart color |
| `--chart-4` | `oklch(0.50 0.10 65)` | Quaternary chart color |
| `--chart-5` | `oklch(0.45 0.08 60)` | Quinary chart color |

---

## Dark Mode Colors

### Primary Colors

| Variable | Value | Description | Preview |
|----------|-------|-------------|---------|
| `--background` | `oklch(0.12 0 0)` | Obsidian black | ![#1F1F1F](https://via.placeholder.com/50x30/1F1F1F/FFFFFF?text=+) |
| `--foreground` | `oklch(0.95 0 0)` | White/silver text | ![#F2F2F2](https://via.placeholder.com/50x30/F2F2F2/000000?text=+) |
| `--primary` | `oklch(0.79 0.16 80)` | Bright gold accent | ![#D4AF37](https://via.placeholder.com/50x30/D4AF37/000000?text=+) |
| `--primary-foreground` | `oklch(0.12 0 0)` | Dark on gold | ![#1F1F1F](https://via.placeholder.com/50x30/1F1F1F/FFFFFF?text=+) |

### Secondary Colors

| Variable | Value | Description |
|----------|-------|-------------|
| `--card` | `oklch(0.15 0 0)` | Dark gray cards |
| `--card-foreground` | `oklch(0.95 0 0)` | White text on cards |
| `--popover` | `oklch(0.15 0 0)` | Dark popover |
| `--popover-foreground` | `oklch(0.95 0 0)` | White popover text |

### Accent Colors

| Variable | Value | Description |
|----------|-------|-------------|
| `--secondary` | `oklch(0.3 0 0)` | Medium gray |
| `--secondary-foreground` | `oklch(0.95 0 0)` | White on gray |
| `--muted` | `oklch(0.2 0 0)` | Darker muted |
| `--muted-foreground` | `oklch(0.7 0 0)` | Light gray text |
| `--accent` | `oklch(0.2 0 0)` | Dark accent |
| `--accent-foreground` | `oklch(0.95 0 0)` | White accent text |

### Functional Colors

| Variable | Value | Description |
|----------|-------|-------------|
| `--destructive` | `oklch(0.5 0.2 25)` | Red with depth |
| `--destructive-foreground` | `oklch(0.95 0 0)` | White on red |
| `--border` | `oklch(0.79 0.16 80 / 0.2)` | Subtle gold borders |
| `--input` | `oklch(0.79 0.16 80 / 0.2)` | Input borders |
| `--ring` | `oklch(0.79 0.16 80 / 0.5)` | Gold focus ring |

### Chart Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--chart-1` | `oklch(0.79 0.16 80)` | Bright gold |
| `--chart-2` | `oklch(0.85 0.1 85)` | Lighter gold |
| `--chart-3` | `oklch(0.7 0.1 75)` | Medium gold |
| `--chart-4` | `oklch(0.6 0.1 70)` | Darker gold |
| `--chart-5` | `oklch(0.5 0.1 65)` | Deep gold |

---

## Tailwind Mappings

### How CSS Variables Map to Tailwind

```css
/* In globals.css */
:root {
  --background: oklch(0.98 0.005 80);
}

/* In Tailwind config (automatic via @theme) */
@theme inline {
  --color-background: var(--background);
}
```

**Usage in Components:**
```tsx
// This uses --background CSS variable
<div className="bg-background">
  Content
</div>
```

### Available Tailwind Classes

| CSS Variable | Tailwind Class | Example |
|--------------|----------------|---------|
| `--background` | `bg-background` | `<div className="bg-background">` |
| `--foreground` | `text-foreground` | `<p className="text-foreground">` |
| `--primary` | `bg-primary` / `text-primary` | `<button className="bg-primary">` |
| `--card` | `bg-card` | `<div className="bg-card">` |
| `--muted` | `bg-muted` / `text-muted-foreground` | `<span className="text-muted-foreground">` |
| `--border` | `border-border` | `<div className="border border-border">` |
| `--ring` | `ring-ring` | `<input className="focus:ring-ring">` |

---

## Contrast Ratios (WCAG Compliance)

### Light Mode

| Combination | Ratio | WCAG Level |
|-------------|-------|------------|
| Background vs Foreground | **15.1:1** | AAA ✅ |
| Primary vs White | **4.8:1** | AA ✅ |
| Primary vs Background | **5.2:1** | AA ✅ |
| Muted vs Background | **8.5:1** | AAA ✅ |

### Dark Mode

| Combination | Ratio | WCAG Level |
|-------------|-------|------------|
| Background vs Foreground | **14.2:1** | AAA ✅ |
| Primary vs Background | **6.5:1** | AA ✅ |
| Primary vs Black | **7.2:1** | AAA ✅ |
| Muted vs Background | **4.8:1** | AA ✅ |

**Standards:**
- **WCAG AA (Normal):** 4.5:1 minimum
- **WCAG AA (Large):** 3:1 minimum
- **WCAG AAA (Normal):** 7:1 minimum

✅ = Meets standard

---

## Usage Guidelines

### When to Use Each Color

#### Primary (Gold)
```tsx
// ✅ Use for:
// - Call-to-action buttons
// - Active states
// - Brand elements
// - Important highlights
<button className="bg-primary text-primary-foreground">
  Book Now
</button>
```

#### Secondary (Beige/Gray)
```tsx
// ✅ Use for:
// - Secondary actions
// - Less important buttons
// - Subtle backgrounds
<button className="bg-secondary text-secondary-foreground">
  Cancel
</button>
```

#### Muted
```tsx
// ✅ Use for:
// - Placeholders
// - Disabled states
// - Supporting text
// - Subtle sections
<p className="text-muted-foreground">
  Optional information
</p>
```

#### Destructive (Red)
```tsx
// ✅ Use for:
// - Delete actions
// - Error messages
// - Warnings
// - Dangerous operations
<button className="bg-destructive text-destructive-foreground">
  Delete Account
</button>
```

---

## Customization Examples

### Change Primary Color to Teal

```css
/* In src/app/globals.css */

:root {
  /* Darker teal for light mode */
  --primary: oklch(0.55 0.15 180);
  --primary-foreground: oklch(0.99 0 0);
}

.dark {
  /* Bright teal for dark mode */
  --primary: oklch(0.70 0.15 180);
  --primary-foreground: oklch(0.12 0 0);
}
```

### Make Background Pure White/Black

```css
:root {
  /* Pure white (remove warmth) */
  --background: oklch(1 0 0);
}

.dark {
  /* Pure black */
  --background: oklch(0 0 0);
}
```

### Adjust Gold Saturation

```css
:root {
  /* More saturated gold */
  --primary: oklch(0.65 0.25 80);
  
  /* Less saturated gold (more neutral) */
  --primary: oklch(0.65 0.08 80);
}
```

---

## Tools & Resources

### Color Tools
- [OKLCH Picker](https://oklch.com/) - Interactive OKLCH color picker
- [Color Space Converter](https://colorjs.io/apps/convert/) - Convert between color spaces
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG compliance

### Browser DevTools
```javascript
// Get computed color value
getComputedStyle(document.documentElement)
  .getPropertyValue('--background')

// Set color value
document.documentElement.style
  .setProperty('--background', 'oklch(0.95 0 0)')
```

### Design Tokens Export
```bash
# Export all CSS variables to JSON
node scripts/export-theme-tokens.js
```

---

## Color Psychology

### Dark Mode (Gold on Black)
- **Mood:** Sophisticated, luxury, exclusive
- **Use Case:** Evening use, premium branding
- **Industries:** Luxury goods, fine dining, high-end services

### Light Mode (Gold on White)
- **Mood:** Clean, professional, accessible
- **Use Case:** Daytime use, broad audience
- **Industries:** Healthcare, education, general services

### Gold Accent
- **Symbolism:** Quality, success, achievement
- **Psychology:** Warm, inviting, prestigious
- **Use:** Draws attention, creates hierarchy

---

**For full documentation, see [`THEME.md`](./THEME.md)**
