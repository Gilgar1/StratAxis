# StratAxis Logo Assets

## Logo Component

The StratAxis logo is implemented as a React SVG component located at:
`src/components/common/Logo.tsx`

### Usage

```tsx
import Logo from './components/common/Logo';

// Full logo with text
<Logo variant="full" size={140} className="text-primary-900 dark:text-white" />

// Icon only
<Logo variant="icon" size={40} className="text-primary-900 dark:text-white" />
```

### Variants

1. **Full Logo**: Includes the icon and "StratAxis" text
   - Default size: 160x40
   - Recommended for headers and footers

2. **Icon Only**: Just the strategic axis symbol
   - Default size: 40x40
   - Recommended for small spaces, favicons, or mobile views

### Design Elements

The logo incorporates:
- **Strategic Axis**: Crossed horizontal and vertical lines representing navigation and strategy
- **Growth Bars**: Three ascending bars symbolizing real estate growth and analytics
- **Center Point**: A focal point representing strategic focus
- **Color Scheme**: 
  - Primary: Deep navy blue (#0F1729)
  - Accent: Gold (#D4AF37)
  - Gradient between primary and accent for depth

### Current Implementation Locations

1. **Header** (`src/components/common/Header.tsx`)
   - Full logo in navigation bar
   - Responsive across all screen sizes

2. **Footer** (`src/components/common/Footer.tsx`)
   - Full logo in brand section
   - White variant on dark background

3. **Favicon** (`public/favicon.svg`)
   - Simplified icon version
   - Optimized for browser tabs

### Responsive Behavior

The logo is fully responsive and works well:
- On light and dark backgrounds (uses currentColor for text)
- At different sizes (vector-based, infinitely scalable)
- With accessibility in mind (semantic HTML)

### Future Enhancements

Consider adding:
- Social media variants (square formats)
- Animated version for loading states
- Monochrome versions for print
- Inverse color schemes for special uses
