# Onyx Stream Design System

## Overview
Comprehensive component library and design token system for consistent, maintainable UI across the application.

## Design Tokens (src/index.css)

### Colors
- **Primary**: `#a4e6ff` (cyan accent) — CTAs, highlights, active states
- **Surface Stack**: Background (`#111317`), containers (low/mid/high), bright
- **Text**: On-surface (`#e2e2e8`), on-surface-variant (`#bbc9cf`)
- **Semantic**: Secondary (cyan), Tertiary (gold), plus danger/success variants

### Spacing Scale
- `--spacing-1` to `--spacing-16` (0.25rem to 4rem in 0.25rem increments)
- Use for padding, margins, gaps — never use arbitrary values like `p-[16px]`

### Border Radius
- `--radius-sm` (0.375rem), `--radius-md` (0.5rem), `--radius-lg` (0.75rem)
- `--radius-xl` (1rem), `--radius-2xl` (1.5rem), `--radius-full` (100%)

### Shadows
- `--shadow-xs/sm/md/lg/xl/2xl` — elevation levels
- `--shadow-glow` — primary accent glow effect

### Transitions
- `--transition-fast` (150ms), `--transition-base` (200ms)
- `--transition-slow` (300ms), `--transition-elastic` (spring)

## Components

### Button (`src/components/Button.tsx`)
Versatile button with multiple variants and sizes.

```tsx
import { Button } from '@/components';

// Primary button
<Button>Save</Button>

// With icon
<Button icon={<PlusIcon />} iconPosition="left">Create</Button>

// Variants: primary (default), secondary, outline, ghost, danger, success
<Button variant="outline">Cancel</Button>

// Sizes: xs, sm, md (default), lg, xl
<Button size="lg" fullWidth>Full Width</Button>

// Loading state
<Button loading>Processing...</Button>
```

### Card (`src/components/Card.tsx`)
Composable card system for containers and content sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components';

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

Variants: `default`, `elevated`, `filled`, `outline`  
Padding: `none`, `xs`, `sm`, `md` (default), `lg`  
Interactive: Pass `interactive` prop for hover/click states

### SectionHeader (`src/components/SectionHeader.tsx`)
Consistent page headers with optional subtitle and action button.

```tsx
import { SectionHeader, EmptyState } from '@/components';

<SectionHeader 
  title="My Collection"
  subtitle="Organize and curate your learning materials"
  action={<Button>Import</Button>}
/>

// Empty state for no content
<EmptyState
  icon={<BookIcon />}
  title="No notes yet"
  description="Create your first note to get started"
  action={<Button>Create Note</Button>}
/>
```

### Badge (`src/components/Badge.tsx`)
Flexible badges with color variants and removable options.

```tsx
import { Badge, StatTile, ProgressBadge } from '@/components';

// Basic badge
<Badge variant="primary">New</Badge>

// Removable badge
<Badge variant="success" onRemove={() => console.log('removed')}>
  Active
</Badge>

// Stat tile for KPI display
<StatTile 
  label="Total Notes" 
  value="2,453"
  icon={<NotesIcon />}
  trend={{ value: "12%", isPositive: true }}
/>

// Progress badge
<ProgressBadge value={65} label="65% Complete" variant="primary" />
```

Badge variants: `primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`, `neutral`

## Usage Patterns

### Responsive Design
All components follow mobile-first design using Tailwind breakpoints:
- Mobile: base styles (no breakpoint prefix)
- Tablet: `sm:` (640px), `md:` (768px)
- Desktop: `lg:` (1024px), `xl:` (1280px), `2xl:` (1536px)

### RTL Support
Components accept `isRTL` prop. Set `dir="rtl"` on container:
```tsx
<Card isRTL={true} dir="rtl">
  {/* Content automatically right-aligned */}
</Card>
```

### Spacing Convention
Use predefined spacing scale, never arbitrary values:
```tsx
// ✅ CORRECT
<div className="p-6 gap-4 mb-8">

// ❌ WRONG
<div className="p-[24px] gap-[16px] mb-[32px]">
```

### Color System
Use semantic color tokens, never hardcoded colors:
```tsx
// ✅ CORRECT
<div className="bg-surface-container text-on-surface">

// ❌ WRONG
<div className="bg-[#1e2024] text-[#e2e2e8]">
```

## Integration Checklist
- Replace hardcoded buttons with `Button` component
- Wrap section headings with `SectionHeader`
- Use `Card` for consistent container styling
- Replace badge patterns with `Badge` component
- Use `StatTile` for dashboard metrics
- Ensure all spacing uses design token scale
- Apply RTL support where needed

## Future Enhancements
- Tooltip component with smart positioning
- Modal/Dialog wrapper system
- Form components (input, select, checkbox)
- Menu/dropdown system
- Accordion component
- Tabs system with better mobile support
