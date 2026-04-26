# DESIGN.md — AI Scientist (Autosearch)

## Color Strategy

**Restrained** with one Committed surface (the pipeline view).

### Palette (OKLCH)

```css
:root {
  /* Neutrals — cool slate tinted toward brand hue */
  --color-bg:          oklch(0.13 0.015 270);  /* deep slate, not pure black */
  --color-surface:     oklch(0.18 0.015 270);  /* cards, panels */
  --color-surface-raised: oklch(0.22 0.015 270); /* elevated surfaces */
  --color-border:      oklch(0.28 0.015 270);  /* subtle borders */
  --color-border-subtle: oklch(0.22 0.015 270); /* very quiet borders */

  /* Foreground */
  --color-text:        oklch(0.92 0.005 270);  /* primary text */
  --color-text-muted:  oklch(0.65 0.008 270);  /* secondary text */
  --color-text-dim:    oklch(0.45 0.008 270);  /* tertiary/labels */

  /* Accent — violet (intellectual rigor, not neon) */
  --color-accent:      oklch(0.65 0.18 290);   /* primary actions */
  --color-accent-hover: oklch(0.70 0.20 290);  /* hover state */
  --color-accent-muted: oklch(0.40 0.08 290);  /* inactive accent */

  /* Semantic — emerald for success/scores */
  --color-success:     oklch(0.72 0.17 155);
  --color-warning:     oklch(0.78 0.15 75);
  --color-error:       oklch(0.62 0.20 25);
  --color-info:        oklch(0.68 0.12 240);

  /* Light theme overrides */
  --color-bg-light:          oklch(0.97 0.005 270);
  --color-surface-light:     oklch(1.00 0.005 270);
  --color-text-light:        oklch(0.20 0.010 270);
  --color-text-muted-light:  oklch(0.45 0.010 270);
}
```

## Typography

**System font stack.** Inter as cross-platform default. One family for everything.

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
```

Scale (fixed rem, not fluid):
| Element | Size | Weight | Line-height |
|---------|------|--------|-------------|
| Page title | 1.5rem (24px) | 600 | 1.3 |
| Section heading | 1.125rem (18px) | 600 | 1.4 |
| Body | 0.875rem (14px) | 400 | 1.6 |
| Label/caption | 0.75rem (12px) | 500 | 1.5 |
| Mono (logs, code) | 0.8125rem (13px) | 400 | 1.5 |

## Elevation

Three levels, no shadows on dark mode (use surface brightness instead):

| Level | Dark | Light |
|-------|------|-------|
| Base | bg | bg-light |
| Raised | surface | surface-light |
| Floating | surface-raised + 1px border | surface-light + shadow-sm |

## Spacing

4px base unit. Vary for rhythm:
- Tight: 8px (within components)
- Default: 12–16px (component padding)
- Spacious: 24–32px (section gaps)
- Generous: 48px (page-level)

## Components

- **Buttons**: Rounded-md (6px), accent fill for primary, ghost for secondary, muted for tertiary
- **Status badges**: Pill shape, background tint of semantic color, text in same hue
- **Data tables**: Dense rows, minimal borders, hover row highlight
- **Pipeline visualization**: Horizontal flow with node states (pending/active/complete/failed)
- **Code/log viewer**: Monospace, surface background, scrollable, line numbers optional

## Motion

- State transitions: 150ms ease-out-quart
- Page transitions: 200ms ease-out-quart
- No orchestrated load sequences
- Skeleton loading states, not spinners

## Icons

Lucide React. 16px for inline, 20px for standalone. Stroke width 1.5.

## Accessibility

- Focus rings: 2px solid accent, 2px offset
- Contrast: WCAG AA minimum (4.5:1 for text, 3:1 for large/UI)
- Keyboard navigation for all interactive elements
- Screen reader labels on pipeline steps, status indicators
