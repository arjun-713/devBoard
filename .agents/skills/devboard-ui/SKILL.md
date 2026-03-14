---
name: devboard-ui
description: >
  Use this skill when building, modifying, or reviewing any UI component,
  page, or layout for DevBoard. Triggers on: "build the board view",
  "create the task card", "style the column", "update the modal",
  "add the sidebar", "implement the auth screen", or any request involving
  React components, Tailwind classes, or visual design decisions for this project.
  This skill defines the complete design system — color tokens, typography,
  component patterns, spacing, and interaction rules. Always load before
  writing any UI code.
---

# DevBoard UI Design System

## Design Philosophy
Dark, dense, data-first. Inspired by Linear and the reference UI — small type, tight spacing,
muted backgrounds with high-contrast content. Not decorative. Every element earns its place.
The board is the product — UI chrome should recede, content should pop.

## Color Palette

### Primary Tokens
```css
--color-bg-base:       #0D0D0D;   /* page background */
--color-bg-surface:    #141414;   /* cards, columns, panels */
--color-bg-elevated:   #1C1C1C;   /* modals, dropdowns, hover states */
--color-bg-overlay:    #242424;   /* active states, selected */

--color-border:        #2A2A2A;   /* default borders */
--color-border-subtle: #1F1F1F;   /* dividers */
--color-border-strong: #3A3A3A;   /* focused/active borders */
```

### Brand Palette (from palette image)
```css
--color-ivory:         #FFF8E1;   /* Luxe Ivory Mist — text on dark, highlight bg */
--color-orange-peel:   #FF9E00;   /* primary accent, CTAs, active indicators */
--color-pumpkin:       #FF6D00;   /* high priority badges, destructive actions */
--color-cyan:          #00B4D8;   /* Pacific Cyan — links, on-track status, success */
--color-blue-spanish:  #0077B6;   /* Spanish Blue — secondary accent, board header */
--color-blue-marian:   #023E8A;   /* Marian Blue — deep background accents */
```

### Semantic Tokens
```css
--color-text-primary:   #F0EDE6;  /* main body text — warm white, not pure */
--color-text-secondary: #888880;  /* labels, meta, timestamps */
--color-text-muted:     #555550;  /* placeholder, disabled */
--color-text-inverted:  #0D0D0D;  /* text on light/colored backgrounds */

/* Priority */
--color-priority-high:   #FF6D00;  /* pumpkin */
--color-priority-medium: #FF9E00;  /* orange peel */
--color-priority-low:    #00B4D8;  /* cyan */

/* Status */
--color-status-todo:       #555550;
--color-status-inprogress: #FF9E00;
--color-status-done:       #00B4D8;
```

## Typography

```css
/* Display / Headers */
font-family: 'DM Sans', sans-serif;
/* Weights: 400, 500, 600 */

/* Monospace — task IDs, timestamps, code snippets */
font-family: 'JetBrains Mono', monospace;
/* Weights: 400 */
```

### Type Scale
```
text-[11px] tracking-[0.08em] uppercase  → column headers, meta labels (SPACED CAPS)
text-[12px] leading-[1.4]                → task card body, secondary text
text-[13px] leading-[1.5] font-medium   → task title, primary content
text-[15px] font-semibold               → board name, page title
text-[11px] font-mono                   → task IDs (#DEV-042), timestamps
```

## Layout & Spacing

```
Board padding:        px-6 py-5
Column width:         w-[280px] min-w-[280px]
Column gap:           gap-3
Card padding:         p-3
Card gap (in col):    gap-2
Sidebar width:        w-[220px]
Header height:        h-[52px]
Border radius:        rounded-lg (8px) for cards, rounded-md (6px) for badges
```

## Component Patterns

### Task Card
```tsx
// Structure
<div className="group bg-[#141414] border border-[#2A2A2A] rounded-lg p-3
                hover:border-[#3A3A3A] hover:bg-[#1C1C1C] transition-all duration-150 cursor-pointer">
  {/* Top row: icon + title + actions */}
  <div className="flex items-start justify-between gap-2">
    <span className="text-[13px] font-medium text-[#F0EDE6] leading-snug">{title}</span>
    <button className="opacity-0 group-hover:opacity-100 transition-opacity">···</button>
  </div>
  {/* Description — optional, secondary */}
  <p className="text-[12px] text-[#888880] mt-1 leading-[1.4]">{description}</p>
  {/* Bottom row: tags + assignee + date */}
  <div className="flex items-center justify-between mt-3">
    <PriorityBadge priority={priority} />
    <div className="flex items-center gap-2 text-[11px] font-mono text-[#555550]">
      <Avatar size="xs" />
      <span>{dueDate}</span>
    </div>
  </div>
</div>
```

### Column Header
```tsx
// Dot indicator + SPACED CAPS label + count badge
<div className="flex items-center justify-between px-1 mb-3">
  <div className="flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
    <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888880]">
      {columnName}
    </span>
  </div>
  <span className="text-[11px] text-[#555550] font-mono">{count}</span>
</div>
```

### Priority Badge
```tsx
const priorityConfig = {
  high:   { label: 'High',   bg: 'bg-[#FF6D00]/10', text: 'text-[#FF6D00]' },
  medium: { label: 'Medium', bg: 'bg-[#FF9E00]/10', text: 'text-[#FF9E00]' },
  low:    { label: 'Low',    bg: 'bg-[#00B4D8]/10', text: 'text-[#00B4D8]' },
}
// Render: small pill, 11px, no border, bg at 10% opacity
```

### Tab Switcher (Board / Quarter / Dependencies style)
```tsx
// Dark pill group — active tab gets bg-[#242424] + border
<div className="flex bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-0.5 gap-0.5">
  {tabs.map(tab => (
    <button className={`text-[12px] px-3 py-1.5 rounded-md transition-all
      ${active === tab
        ? 'bg-[#242424] text-[#F0EDE6] border border-[#3A3A3A]'
        : 'text-[#555550] hover:text-[#888880]'
      }`}>
      {tab}
    </button>
  ))}
</div>
```

### Modal
```tsx
// Overlay + centered card
// Overlay: bg-black/60 backdrop-blur-sm
// Card: bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 w-[480px]
// Close on Escape + outside click via Zustand uiStore
```

### Button Variants
```
Primary:    bg-[#FF9E00] text-[#0D0D0D] font-semibold — like "Start orchestrating" in ref
Secondary:  bg-transparent border border-[#3A3A3A] text-[#F0EDE6]
Ghost:      no bg, no border, text-[#888880] hover:text-[#F0EDE6]
Danger:     bg-[#FF6D00]/10 text-[#FF6D00] border border-[#FF6D00]/20
```
- All buttons: text-[13px], rounded-full for primary, rounded-md for others, h-[34px]

## Interaction Rules
- Hover transitions: `transition-all duration-150` — fast, not bouncy
- Card hover: border brightens (#2A2A2A → #3A3A3A), bg shifts one step up
- Active/pressed: scale-[0.98] for buttons
- Focus rings: `outline-none ring-1 ring-[#FF9E00]/50` for keyboard nav
- Drag indicator (dnd-kit): dragging card gets `opacity-50 rotate-1 scale-[1.02]`
- No shadows — use border contrast instead of box-shadow for depth

## Scrollbars (custom, Webkit)
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; }
```

## Tailwind Config Additions
```js
// tailwind.config.ts
extend: {
  fontFamily: {
    sans: ['DM Sans', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  colors: {
    brand: {
      orange: '#FF9E00',
      pumpkin: '#FF6D00',
      cyan: '#00B4D8',
      blue: '#0077B6',
      'blue-deep': '#023E8A',
      ivory: '#FFF8E1',
    }
  }
}
```

## What NOT To Do
- No white or light-mode components — entire app is dark
- No purple, no gradients for decoration
- No rounded-full on non-button elements (cards stay rounded-lg)
- No card shadows — borders only
- No animations longer than 200ms for micro-interactions
- Never use Inter or system fonts
- No absolute pixel widths on task cards inside columns — let them fill column width