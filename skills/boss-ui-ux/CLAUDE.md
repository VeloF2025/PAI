# BOSS UI/UX - Learned Design Patterns

**Last Captured**: 2025-12-16T11:54
**Source**: http://localhost:5189
**Capture Method**: Playwright extraction from live DOM
**Pages Scanned**: 11 (dashboard, email, approvals, whatsapp, channels, knowledge, team, threads, automation, templates, settings)

---

## 1. Color Palette (Extracted from Live App)

### Space Colors (Backgrounds)
| Token | Hex Value | RGB | Usage |
|-------|-----------|-----|-------|
| space-black | #0a0a0f | rgb(10, 10, 15) | Page background |
| space-secondary | #12121a | rgb(18, 18, 26) | Card backgrounds |
| space-tertiary | #1a1a24 | rgb(26, 26, 36) | Input backgrounds |
| space-border | #2a2a3a | rgb(42, 42, 58) | All borders (3855 uses) |

### Neon Accent Colors
| Token | Hex Value | RGB | Text Uses |
|-------|-----------|-----|-----------|
| neon-blue | #00d4ff | rgb(0, 212, 255) | 233 |
| neon-green | #22c55e | rgb(34, 197, 94) | 120 |
| neon-purple | #a855f7 | rgb(168, 85, 247) | 47 |
| neon-orange | #f59e0b | rgb(245, 158, 11) | 26 |
| neon-red | #ef4444 | rgb(239, 68, 68) | 24 |

### Text Colors
| Token | Hex Value | Usage Count |
|-------|-----------|-------------|
| gray-100 | #f3f4f6 | 2631 (primary text) |
| gray-400 | #9ca3af | 513 (secondary text) |
| gray-500 | #6b7280 | 166 (muted text) |
| gray-300 | #d1d5db | 114 |
| gray-200 | #e5e7eb | 83 |

### Common Background Patterns
```css
/* Card backgrounds */
bg-space-secondary/50  /* rgba(18, 18, 26, 0.5) - 70 uses */

/* Button backgrounds */
bg-neon-blue/20        /* rgba(0, 212, 255, 0.2) - 125 uses */
bg-neon-green/20       /* rgba(34, 197, 94, 0.2) - 38 uses */
bg-neon-purple/20      /* rgba(168, 85, 247, 0.2) - 14 uses */
bg-neon-orange/20      /* rgba(245, 158, 11, 0.2) - 7 uses */
bg-neon-red/20         /* rgba(239, 68, 68, 0.2) - 6 uses */

/* Glass effects */
bg-space-secondary/60  /* rgba(18, 18, 26, 0.6) - sidebar */
```

---

## 2. Component Patterns (Discovered)

### Cards (34 found)
```tsx
// Standard card
<div className="card">
  {/* content */}
</div>

// Computed styles:
// - backgroundColor: rgba(18, 18, 26, 0.5)
// - borderColor: rgb(42, 42, 58)
// - borderWidth: 1px
// - borderRadius: 12px (rounded-xl)
// - padding: 24px (p-6)
// - backdropFilter: blur(4px)
```

**Common card class variations:**
- `card` - base card
- `card space-y-4` - with vertical spacing
- `card min-h-[140px]` - minimum height
- `card md:col-span-2 lg:col-span-2` - grid spanning
- `card text-center py-16` - centered content
- `card border-neon-green/30` - colored border accent
- `card border-neon-purple/30` - purple accent
- `card border-neon-red/30` - red/danger accent

### Buttons

**Primary Button (5 found)**
```tsx
<button className="btn-primary">Action</button>

// Computed styles:
// - backgroundColor: rgba(0, 212, 255, 0.2)
// - color: rgb(0, 212, 255)
// - borderColor: rgba(0, 212, 255, 0.5)
// - borderRadius: 8px
// - padding: 8px 16px
// - fontSize: 16px
// - fontWeight: 500
```

**Secondary Button (9 found)**
```tsx
<button className="btn-secondary flex items-center gap-2">
  <Icon size={16} />
  Label
</button>

// Computed styles:
// - backgroundColor: rgb(26, 26, 36)
// - color: rgb(209, 213, 219)
// - borderColor: rgb(42, 42, 58)
// - borderRadius: 8px
// - padding: 8px 16px
```

**Success Button (1 found)**
```tsx
<button className="btn-success flex items-center gap-2">
  <Icon size={16} />
  Sync Email
</button>

// Computed styles:
// - backgroundColor: rgba(34, 197, 94, 0.2)
// - color: rgb(34, 197, 94)
// - borderColor: rgba(34, 197, 94, 0.5)
```

**Danger Button (3 found)**
```tsx
<button className="btn-danger flex items-center gap-2">
  <Icon size={16} />
  Delete
</button>

// Computed styles:
// - backgroundColor: rgba(239, 68, 68, 0.2)
// - color: rgb(239, 68, 68)
// - borderColor: rgba(239, 68, 68, 0.5)
```

### Badges (25 found)

```tsx
// Primary badge
<span className="badge-primary">Client</span>

// Success badge
<span className="badge-success">H10</span>

// Warning badge
<span className="badge-warning">Pending</span>

// Danger badge
<span className="badge-danger text-xs">Urgent</span>

// Purple badge
<span className="badge-purple">Blitz</span>

// Computed styles (all badges):
// - borderRadius: 9999px (fully rounded)
// - padding: 2px 10px
// - fontSize: 12px
// - backgroundColor: {color}/20
// - color: {color}
// - borderColor: {color}/30
```

### Inputs (1 found)
```tsx
<input
  type="text"
  className="input pl-10 w-64"
  placeholder="Search emails..."
/>

// Computed styles:
// - backgroundColor: rgb(26, 26, 36)
// - color: rgb(243, 244, 246)
// - borderColor: rgb(42, 42, 58)
// - borderRadius: 8px
// - padding: 8px 16px
// - fontSize: 16px
```

### Status Indicators (17 found)
```tsx
// Connected status (green with glow)
<span className="status-connected" />

// Computed styles:
// - backgroundColor: rgb(34, 197, 94)
// - width: 12px
// - height: 12px
// - borderRadius: 9999px
// - boxShadow: rgba(34, 197, 94, 0.8) 0px 0px 16px 0px
```

### Glass Elements (7 found)
```tsx
// Sidebar
<aside className="glass-strong border-r border-space-border">
  {/* navigation */}
</aside>

// Computed styles:
// - backgroundColor: rgba(18, 18, 26, 0.6)
// - backdropFilter: blur(16px)
// - borderColor: rgb(42, 42, 58)
```

### Navigation
```tsx
// Active nav link
<a className="bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded-lg px-3 py-3">
  <Icon /> Label
</a>

// Inactive nav link
<a className="text-gray-100 hover:opacity-80 transition-opacity">
  <Icon /> Label
</a>
```

---

## 3. Typography (Extracted)

### Font Families
| Family | Usage |
|--------|-------|
| Inter | Primary sans-serif |
| JetBrains Mono | Code/monospace |
| system-ui | Fallback |

### Font Sizes
| Size | Tailwind | Common Uses |
|------|----------|-------------|
| 12px | text-xs | Badges, small labels |
| 14px | text-sm | Secondary text, buttons |
| 16px | text-base | Body text, inputs |
| 18px | text-lg | Card headers |
| 20px | text-xl | Section headers |
| 24px | text-2xl | Page titles |

### Font Weights
| Weight | Tailwind | Usage |
|--------|----------|-------|
| 400 | font-normal | Body text |
| 500 | font-medium | Buttons, labels |
| 600 | font-semibold | Headers |
| 700 | font-bold | Emphasis |

---

## 4. Spacing Patterns (Measured)

### Common Padding Values
| Value | Tailwind | Usage |
|-------|----------|-------|
| 8px | p-2 | Small buttons, icons |
| 12px | p-3 | Compact elements |
| 16px | p-4 | Standard spacing |
| 24px | p-6 | Cards (most common) |
| 32px | p-8 | Large sections |

### Common Gap Values
| Value | Tailwind | Usage |
|-------|----------|-------|
| 8px | gap-2 | Icon + text |
| 12px | gap-3 | Nav items |
| 16px | gap-4 | Card grids |
| 24px | gap-6 | Section spacing |

### Border Radius
| Value | Tailwind | Usage |
|-------|----------|-------|
| 8px | rounded-lg | Buttons, inputs |
| 12px | rounded-xl | Cards |
| 9999px | rounded-full | Badges, status dots |

---

## 5. Animation Patterns

### Transitions
```css
/* Standard transition */
transition-all duration-200

/* Button press */
active:scale-[0.98]

/* Card hover */
hover:scale-[1.02]
```

### Status Indicator Glow
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 16px rgba(34, 197, 94, 0.8);
    opacity: 0.8;
  }
}
```

### Card Hover Glow
```css
.card:hover {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}
```

---

## 6. Component Generation Templates

### New Card
```tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple';
}

export function Card({
  title,
  icon: Icon,
  children,
  className = '',
  variant = 'default'
}: CardProps) {
  const borderColors = {
    default: '',
    success: 'border-neon-green/30',
    warning: 'border-neon-orange/30',
    danger: 'border-neon-red/30',
    purple: 'border-neon-purple/30',
  };

  return (
    <motion.div
      className={`card ${borderColors[variant]} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {title && Icon && (
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-blue/10">
            <Icon size={20} className="text-neon-blue" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        </div>
      )}
      {children}
    </motion.div>
  );
}
```

### New Button
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  children,
  icon: Icon,
  onClick,
  disabled,
  className = ''
}: ButtonProps) {
  return (
    <button
      className={`btn-${variant} flex items-center gap-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
```

### New Badge
```tsx
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
```

---

## 7. Quick Reference

### Tailwind Classes to Use
```
/* Backgrounds */
bg-space-black        /* Page background */
bg-space-secondary    /* Solid card bg */
bg-space-secondary/50 /* Card with transparency */
bg-space-tertiary     /* Input backgrounds */
bg-neon-{color}/20    /* Button/badge backgrounds */

/* Text */
text-gray-100         /* Primary text */
text-gray-400         /* Secondary text */
text-gray-500         /* Muted text */
text-neon-{color}     /* Accent text */

/* Borders */
border-space-border   /* Standard border */
border-neon-{color}/30 /* Accent borders */
border-neon-{color}/50 /* Button borders */

/* Layout */
rounded-lg            /* Buttons, inputs */
rounded-xl            /* Cards */
rounded-full          /* Badges, dots */
p-6                   /* Card padding */
gap-4                 /* Grid gaps */

/* Effects */
backdrop-blur-sm      /* Card blur */
backdrop-blur-lg      /* Sidebar blur */
transition-all duration-200
hover:scale-[1.02]    /* Card hover */
active:scale-[0.98]   /* Button press */
```

### CSS Classes Available
```css
.card           /* Standard card container */
.btn-primary    /* Blue accent button */
.btn-secondary  /* Neutral button */
.btn-success    /* Green button */
.btn-danger     /* Red button */
.btn-warning    /* Orange button */
.badge-primary  /* Blue badge */
.badge-success  /* Green badge */
.badge-warning  /* Orange badge */
.badge-danger   /* Red badge */
.badge-purple   /* Purple badge */
.input          /* Form input */
.status-connected    /* Green status dot */
.status-error        /* Red status dot */
.status-warning      /* Orange status dot */
.status-disconnected /* Gray status dot */
.glass          /* Light glass effect */
.glass-strong   /* Strong glass effect */
```

---

## 8. Validation Rules

When validating code against these patterns:

1. **Colors**: Must use `space-*` or `neon-*` tokens, not arbitrary hex values
2. **Cards**: Must use `.card` class for card containers
3. **Buttons**: Must use `.btn-*` classes for buttons
4. **Badges**: Must use `.badge-*` classes for status labels
5. **Inputs**: Must use `.input` class for form fields
6. **Spacing**: Prefer p-4, p-6, p-8 for padding; gap-2, gap-4, gap-6 for gaps
7. **Borders**: Use `border-space-border` for standard borders

Run validation:
```bash
python ~/.claude/skills/boss-ui-ux/scripts/compare_to_captured.py --file path/to/Component.tsx
```

---

## 9. Modal Patterns

### Standard Modal Structure
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Modal overlay
<motion.div
  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={onClose}
/>

// Modal container
<motion.div
  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
             w-full max-w-2xl bg-space-secondary border border-space-border
             rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden"
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
>
  {/* Header */}
  <div className="flex items-center justify-between p-6 border-b border-space-border">
    <h2 className="text-xl font-bold text-gray-100">Modal Title</h2>
    <button className="p-2 hover:bg-space-tertiary rounded-lg transition-colors">
      <X size={20} className="text-gray-400" />
    </button>
  </div>

  {/* Content */}
  <div className="p-6">
    {/* Modal content */}
  </div>

  {/* Footer */}
  <div className="flex items-center justify-end gap-3 p-6 border-t border-space-border">
    <button className="btn-secondary">Cancel</button>
    <button className="btn-primary">Save</button>
  </div>
</motion.div>
```

### Modal Size Variants
| Size | Class | Use Case |
|------|-------|----------|
| sm | `max-w-md` | Confirmations, simple forms |
| md | `max-w-lg` | Standard forms |
| lg | `max-w-2xl` | Complex forms, details |
| xl | `max-w-4xl` | Large content, lists |
| full | `max-w-[90vw]` | Full-width content |

### Modal Background Rules
**CRITICAL: Use only these background classes:**
```css
/* Modal container */
bg-space-secondary     /* Main modal background - #12121a */

/* Nested sections */
bg-space-tertiary      /* Input fields, nested areas - #1a1a24 */

/* Expanded/detail sections */
bg-space-black/50      /* Collapsed details - rgba(10, 10, 15, 0.5) */

/* Progress bars */
bg-space-border        /* Progress bar track - #2a2a3a */

/* NEVER USE (undefined, results in transparency): */
/* bg-space-800, bg-space-900, bg-space-950, bg-space-700 */
```

### Modal Input Styling
```tsx
<input
  className="w-full px-4 py-2 bg-space-tertiary border border-space-border
             rounded-lg text-gray-100 focus:outline-none focus:ring-2
             focus:ring-neon-blue focus:border-neon-blue transition-colors"
  placeholder="Enter value..."
/>

<select
  className="w-full px-4 py-2 bg-space-tertiary border border-space-border
             rounded-lg text-gray-100 focus:outline-none focus:ring-2
             focus:ring-neon-blue focus:border-neon-blue"
>
  <option>Option 1</option>
</select>
```

### Reusable Modal Component
Use the standard Modal component at `src/components/ui/Modal.tsx`:
```tsx
import Modal from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  description="Optional description"
  size="lg"
  footer={
    <>
      <button className="btn-secondary">Cancel</button>
      <button className="btn-primary">Save</button>
    </>
  }
>
  <p>Modal content here</p>
</Modal>
```

---

## 10. Toast/Notification Patterns

### Toast Variants
```tsx
// Success toast
<Toast variant="success">
  className="border-neon-green/50 bg-space-secondary/95 backdrop-blur-xl"
  icon={<CheckCircle2 className="h-5 w-5 text-neon-green" />}
</Toast>

// Error toast
<Toast variant="error">
  className="border-neon-red/50 bg-space-secondary/95 backdrop-blur-xl"
  icon={<AlertCircle className="h-5 w-5 text-neon-red" />}
</Toast>

// Info toast
<Toast variant="info">
  className="border-neon-blue/50 bg-space-secondary/95 backdrop-blur-xl"
  icon={<Info className="h-5 w-5 text-neon-blue" />}
</Toast>
```

### Toast Usage
```tsx
import { toast } from '@/hooks/useToast';

// Success notification
toast({
  title: 'Success',
  description: 'Your changes have been saved',
  variant: 'success'
});

// Error notification
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'error'
});

// Info notification
toast({
  title: 'Info',
  description: 'Processing your request',
  variant: 'info'
});
```

### Toast Position
Default position: Bottom-right corner
```tsx
className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full
           flex-col-reverse p-4 md:max-w-[420px]"
```

---

## 11. Progress Indicators

### Progress Bar
```tsx
// Container
<div className="w-full bg-space-border rounded-full h-2">
  // Fill
  <div
    className="h-2 rounded-full bg-neon-blue transition-all"
    style={{ width: `${percent}%` }}
  />
</div>
```

### Progress States
| State | Fill Color |
|-------|-----------|
| Normal | `bg-neon-blue` |
| Success/Complete | `bg-neon-green` |
| Error | `bg-neon-red` |
| Warning | `bg-neon-orange` |

### Status Counters (in modals/details)
```tsx
<div className="grid grid-cols-4 gap-2 text-xs">
  <div><span className="text-gray-500">Imported:</span> <span className="text-neon-green">{count}</span></div>
  <div><span className="text-gray-500">Skipped:</span> <span className="text-neon-orange">{count}</span></div>
  <div><span className="text-gray-500">Failed:</span> <span className="text-neon-red">{count}</span></div>
  <div><span className="text-gray-500">Total:</span> <span className="text-neon-purple">{count}</span></div>
</div>
```

---

## 12. Status Configuration Pattern

For components with multiple status states (jobs, tasks, etc):
```tsx
interface StatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}

const statusConfig: Record<Status, StatusConfig> = {
  pending: { label: 'Pending', color: 'text-neon-orange', icon: Clock },
  processing: { label: 'Processing', color: 'text-neon-blue', icon: RefreshCw },
  completed: { label: 'Completed', color: 'text-neon-green', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-neon-red', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', icon: XCircle },
};
```

---

**Document Version**: 1.1.0 (Updated with Modal/Toast standards)
**Last Updated**: 2025-12-16
**Auto-generated from**: Playwright capture of live BOSS Exchange frontend
**Source files**: tailwind.config.js, src/styles/index.css, src/components/ui/Modal.tsx, src/components/ui/Toast.tsx
