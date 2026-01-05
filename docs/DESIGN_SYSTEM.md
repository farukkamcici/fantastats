# Fantastats Design System

Modern, calm, and distinctive UI design system. Professional and sophisticated - no neon colors or gradients.

## 🎯 Design Philosophy

- **Modern but calm** - distinctive without being flashy
- **No neon/gradient effects** - functional and professional look
- **Deep dark mode** - sophisticated `#0E0F17` base, not bright purple
- **Clean light mode** - soft off-white backgrounds
- **High readability** - balanced contrast in both modes
- **Subtle micro-interactions** - 150-300ms transitions, minimal shadows

## 📁 File Structure

```
src/styles/
├── design-tokens.css    # Core design tokens (colors, typography, spacing)
├── theme.css            # Light/Dark theme configuration
├── components.css       # Component-specific styles
└── globals.css          # Imports all design system files

src/components/
├── ThemeProvider.tsx    # Theme context and hook (React 19 compatible)
└── ThemeToggle.tsx      # Theme toggle component (cycles light→dark→system)
```

## 🎨 Color Palette

### Neutral Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--neutral-50` | #FAFBFC | Lightest backgrounds |
| `--neutral-100` | #F5F6F8 | Light backgrounds |
| `--neutral-200` | #EBEDF0 | Borders (light mode) |
| `--neutral-300` | #D8DCE2 | Dividers, input borders |
| `--neutral-400` | #B8BEC9 | Disabled states |
| `--neutral-500` | #8D95A3 | Placeholder text |
| `--neutral-600` | #6B7280 | Tertiary text |
| `--neutral-700` | #4B5563 | Secondary text |
| `--neutral-800` | #2D3442 | Dark surfaces |
| `--neutral-900` | #1A1F2B | Primary dark text |
| `--neutral-950` | #0E0F17 | Deepest dark (dark mode base) |

### Brand Colors
| Token | Value | Hover | Usage |
|-------|-------|-------|-------|
| `--brand-primary` | #4A85E6 | #3A75D6 | Cold blue (buttons, CTAs, links) |
| `--brand-accent` | #6C5DD3 | #5B4DC2 | Deep purple (subtle accents only) |
| `--brand-secondary` | #857AFF | #7569EE | Soft purple (secondary buttons) |

### Semantic Colors
| Token | Value | Light BG | Muted |
|-------|-------|----------|-------|
| `--success` | #34B87A | #E6F6EE | rgba(52, 184, 122, 0.12) |
| `--warning` | #E5A03B | #FDF5E6 | rgba(229, 160, 59, 0.12) |
| `--error` | #E5534B | #FDF0EF | rgba(229, 83, 75, 0.12) |
| `--info` | #4A85E6 | #EBF3FD | rgba(74, 133, 230, 0.12) |

### Background Colors
| Mode | Base | Surface | Elevated | Subtle |
|------|------|---------|----------|--------|
| Light | #F8F9FB | #FFFFFF | #FFFFFF | #F3F4F6 |
| Dark | #0E0F17 | #1A1D27 | #242833 | #14151D |

### Text Colors
| Mode | Primary | Secondary | Tertiary | Muted |
|------|---------|-----------|----------|-------|
| Light | #1A1F2B | #4B5563 | #8D95A3 | #B8BEC9 |
| Dark | #F0F2F5 | #A0A7B4 | #6B7280 | #4B5563 |

## 🔤 Typography

**Font Families**:
- Sans: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Mono: `'JetBrains Mono', 'Fira Code', Consolas, monospace`

### Font Scale
| Token | Size | Pixels | Usage |
|-------|------|--------|-------|
| `--text-xs` | 0.75rem | 12px | Badges, hints |
| `--text-sm` | 0.875rem | 14px | Captions, labels |
| `--text-base` | 1rem | 16px | Body text |
| `--text-lg` | 1.125rem | 18px | Large body |
| `--text-xl` | 1.25rem | 20px | Small headings |
| `--text-2xl` | 1.5rem | 24px | h3 |
| `--text-3xl` | 1.75rem | 28px | h2 |
| `--text-4xl` | 2.125rem | 34px | h1 |
| `--text-5xl` | 2.5rem | 40px | Display |

### Font Weights
| Token | Value |
|-------|-------|
| `--font-normal` | 400 |
| `--font-medium` | 500 |
| `--font-semibold` | 600 |
| `--font-bold` | 700 |

### Line Heights
| Token | Value |
|-------|-------|
| `--leading-tight` | 1.25 |
| `--leading-snug` | 1.375 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.625 |

## 🌗 Theme System

### Dark Mode
- Base: `#0E0F17` - Deep, calm, professional
- Surface: `#1A1D27` - Cards and panels
- Elevated: `#242833` - Dropdowns, modals
- Subtle: `#14151D` - Subtle backgrounds
- Text: `#F0F2F5` - Comfortable, not harsh white
- Borders: `#2D3442` - Subtle, not harsh

### Light Mode
- Base: `#F8F9FB` - Soft off-white
- Surface: `#FFFFFF` - Clean white
- Elevated: `#FFFFFF` - Same as surface
- Subtle: `#F3F4F6` - Subtle backgrounds
- Text: `#1A1F2B` - Strong contrast
- Borders: `#E5E7EB` - Visible but not harsh

### Theme Hook

```tsx
import { useTheme } from "@/components/ThemeProvider";

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // theme: "light" | "dark" | "system"
  // resolvedTheme: "light" | "dark" (actual applied theme)
  // setTheme: (theme: "light" | "dark" | "system") => void
}
```

### Theme Toggle

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

<ThemeToggle /> // Cycles: light → dark → system
```

## 🧩 Component Classes

### Buttons

```html
<!-- Primary - Cold Blue (#4A85E6) -->
<button class="btn btn-primary">Primary</button>

<!-- Secondary - Soft Purple (#857AFF) -->
<button class="btn btn-secondary">Secondary</button>

<!-- Accent - Deep Purple (#6C5DD3) -->
<button class="btn btn-accent">Accent</button>

<!-- Outline - Transparent with border -->
<button class="btn btn-outline">Outline</button>

<!-- Ghost - Minimal styling -->
<button class="btn btn-ghost">Ghost</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

### Button Sizing
| Class | Padding | Font Size | Radius |
|-------|---------|-----------|--------|
| `.btn-sm` | 4px 12px | 12px | 4px |
| `.btn` (default) | 8px 16px | 14px | 8px |
| `.btn-lg` | 12px 24px | 16px | 12px |
| `.btn-xl` | 16px 32px | 18px | 12px |

### Cards

```html
<div class="card">
  <div class="card-body">Content</div>
</div>

<!-- Interactive Card -->
<div class="card card-interactive">
  Hoverable card with shadow transition
</div>
```

### Inputs

```html
<input class="input" placeholder="Enter text..." />
<input class="input input-error" /> <!-- Error state -->
```

## 📏 Spacing (8px grid)

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-0` | 0 | 0px |
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |
| `--space-24` | 6rem | 96px |

## 🔲 Border Radius

| Token | Value | Pixels |
|-------|-------|--------|
| `--radius-none` | 0 | 0px |
| `--radius-sm` | 0.25rem | 4px |
| `--radius-md` | 0.5rem | 8px |
| `--radius-lg` | 0.75rem | 12px |
| `--radius-xl` | 1rem | 16px |
| `--radius-2xl` | 1.5rem | 24px |
| `--radius-full` | 9999px | Pill shape |

## 🌫️ Shadows (Minimal)

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Subtle elevation (inputs) |
| `--shadow-md` | Default cards |
| `--shadow-lg` | Elevated cards, dropdowns |
| `--shadow-xl` | Modals, popovers |

## ⏱️ Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Micro-interactions |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 300ms | Complex animations |

**Easing Functions**:
- `--ease-default`: cubic-bezier(0.4, 0, 0.2, 1)
- `--ease-in`: cubic-bezier(0.4, 0, 1, 1)
- `--ease-out`: cubic-bezier(0, 0, 0.2, 1)
- `--ease-in-out`: cubic-bezier(0.4, 0, 0.2, 1)

## 📚 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 100 | Dropdown menus |
| `--z-sticky` | 200 | Sticky headers |
| `--z-fixed` | 300 | Fixed elements |
| `--z-modal-backdrop` | 400 | Modal backdrop |
| `--z-modal` | 500 | Modal content |
| `--z-popover` | 600 | Popovers |
| `--z-tooltip` | 700 | Tooltips |

## 🎭 CSS Variables Reference

### Semantic Variables (auto-switch with theme)

```css
/* Background */
var(--bg-base)      /* Main page background */
var(--bg-surface)   /* Cards, panels */
var(--bg-elevated)  /* Dropdowns, modals */
var(--bg-subtle)    /* Subtle backgrounds */

/* Text */
var(--text-primary)    /* Headings, important text */
var(--text-secondary)  /* Body text */
var(--text-tertiary)   /* Captions, labels */
var(--text-muted)      /* Very subtle text */

/* Interactive (Cold Blue) */
var(--interactive)        /* #4A85E6 - Primary action color */
var(--interactive-hover)  /* #3A75D6 - Hover state */
var(--interactive-active) /* #2A65C6 - Active/pressed state */
var(--interactive-muted)  /* Semi-transparent background */

/* Accent (Deep Purple) */
var(--accent)       /* #6C5DD3 - Brand accent */
var(--accent-hover) /* #5B4DC2 - Hover state */
var(--accent-muted) /* Semi-transparent background */

/* Border */
var(--border-default)  /* Default borders */
var(--border-strong)   /* Emphasized borders */
var(--border-subtle)   /* Very subtle borders */

/* Component-specific */
var(--card-bg)           /* Card background */
var(--card-border)       /* Card border */
var(--card-shadow)       /* Card shadow */
var(--card-shadow-hover) /* Card hover shadow */
var(--input-bg)          /* Input background */
var(--input-border)      /* Input border */
var(--input-border-focus)/* Input focus border */
var(--focus-ring)        /* Focus ring color */
var(--overlay-bg)        /* Modal overlay */
```

## ✨ Best Practices

1. **Use semantic tokens** - Use `var(--text-primary)` not `var(--neutral-900)`
2. **Minimal shadows** - Keep shadows subtle for professional look
3. **Consistent spacing** - Use 8px grid multiples (`--space-*` tokens)
4. **Transition durations** - Keep between 150-300ms
5. **Focus states** - Always include visible focus indicators (`--focus-ring`)
6. **No gradients** - Use solid colors for a calm appearance
7. **Cold blue for CTAs** - `#4A85E6` for primary interactive elements
8. **Deep purple for accents** - `#6C5DD3` for highlights only, not backgrounds
9. **System preference respect** - Support `prefers-color-scheme` media query
10. **Accessible contrast** - Ensure WCAG AA compliance in both themes

## 🔧 Integration

### Import Order in globals.css

```css
@import "./design-tokens.css";
@import "./theme.css";
@import "./components.css";
```

### ThemeProvider Setup

```tsx
// src/components/Providers.tsx
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}
```

### Using CSS Variables in Inline Styles

```tsx
<div style={{ 
  backgroundColor: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)'
}}>
  Content
</div>
```
