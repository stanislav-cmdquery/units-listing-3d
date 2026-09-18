# @cmdquery/units-listing-3d

Themeable, framework-agnostic React component library for apartment and condo unit listings. Supports card and list views, filters, image galleries, and full CSS token customization — with no data fetching inside the package.

## Installation

```bash
npm install @cmdquery/units-listing-3d
# or
yarn add @cmdquery/units-listing-3d
```

> **Peer dependencies:** `react >= 18`, `react-dom >= 18`
> **Optional peers:** `motion` (animations), `next` (image optimization)

## Quick start

```tsx
import { UnitsListing } from '@cmdquery/units-listing-3d'
import '@cmdquery/units-listing-3d/styles'

export function UnitsList() {
  return (
    <UnitsListing
      units={units}
      isLoading={false}
    />
  )
}
```

## Usage with Next.js + Framer Motion

```tsx
import { UnitsListing } from '@cmdquery/units-listing-3d'
import '@cmdquery/units-listing-3d/styles'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'

export function UnitsList({ units, isLoading }) {
  return (
    <UnitsListing
      units={units}
      isLoading={isLoading}
      ImageComponent={Image}
      motion={{ div: motion.div, AnimatePresence }}
      onBookTour={(unit) => openBookTourModal(unit)}
    />
  )
}
```

> **Blur placeholder with `next/image`:** `Image` accepts `blurDataURL` but only renders it when `placeholder="blur"` is also set — plain `<Image>` ignores `blurDataURL` silently. Wrap it so the placeholder activates whenever a unit provides one:
>
> ```tsx
> import NextImage from 'next/image'
> import type { ImageComponentProps } from '@cmdquery/units-listing-3d'
>
> function BlurImage(props: ImageComponentProps) {
>   return (
>     <NextImage
>       {...props}
>       placeholder={props.blurDataURL ? 'blur' : 'empty'}
>     />
>   )
> }
> // then: <UnitsListing ImageComponent={BlurImage} ... />
> ```
>
> Populate `blurDataURL` on each `UnitImage` (see [Data contract](#data-contract)) — without it, cards fall back to a shimmer skeleton while the image loads.

## Data contract

The package never fetches data — pass units as a prop. Map your API response to the `Unit` type:

```ts
import type { Unit } from '@cmdquery/units-listing-3d'

function mapApiUnit(raw: ApiUnit): Unit {
  return {
    id: String(raw.id),
    unitNumber: raw.unit,
    beds: raw.bed,
    baths: raw.bath,
    price: {
      net: raw.monthly_rent_net,
      gross: raw.monthly_rent_gross,
    },
    images: raw.images?.map(img => ({ src: img.original, alt: `Unit ${raw.unit}` })),
    floorPlan: raw.floor_plan ? { src: raw.floor_plan.original } : null,
    floorPlanUrl: raw.floor_plan?.original ?? null,
    concession: raw.months_free
      ? { type: 'months', value: raw.months_free }
      : raw.weeks_free
      ? { type: 'weeks', value: raw.weeks_free }
      : null,
    leaseTerm: raw.lease_term,
    outdoor: raw.outdoor,
  }
}
```

### `Unit` type

```ts
interface Unit {
  id: string
  unitNumber: string
  beds: number
  baths: number
  price: {
    net: number | null
    gross: number | null
    currency?: string         // default 'USD'
  }
  images?: UnitImage[]
  floorPlan?: UnitImage | null
  floorPlanUrl?: string | null
  concession?: {
    type: 'months' | 'weeks'
    value: number | string
  } | null
  leaseTerm?: number | string | null
  outdoor?: string | null
  meta?: Record<string, unknown>  // escape hatch for custom slot data
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `units` | `Unit[]` | **required** | Array of units to display |
| `isLoading` | `boolean` | `false` | Shows skeleton cards |
| `isError` | `boolean` | `false` | Shows error state |
| `onRetry` | `() => void` | — | Retry callback on error |
| `building` | `BuildingConfig` | — | Enables the 3D view (see below) |
| `views` | `ViewMode[]` | `['3d','card','list']` with a building, else `['card','list']` | Views offered by the toggle |
| `defaultView` | `'3d' \| 'card' \| 'list'` | first of `views` | Initial view when uncontrolled |
| `nav` | `AvailabilityNav` | — | Controlled navigation (view, floor, section, unit) |
| `defaultNav` | `Partial<AvailabilityNav>` | — | Initial navigation when uncontrolled |
| `onNavChange` | `(nav, { push }) => void` | — | Navigation callback; `push` is true for building → floor → unit steps |
| `getUnitShareUrl` | `(unit: Unit) => string` | current URL + nav params | Link used by the Share popup |
| `showUnitTypeFilter` | `boolean` | `false` | Unit-type pills next to the filters (desktop) |
| `pageSize` | `number` | `25` | Max units to display |
| `skeletonCount` | `number` | `10` | Number of skeleton cards |
| `priceStep` | `number` | `50` | Price filter step |
| `header` | `ReactNode` | — | Custom header slot |
| `labels` | `Partial<UnitsListingLabels>` | — | Override UI strings |
| `theme` | `UnitsListingTheme` | — | Typed token overrides |
| `themeVars` | `UnitsListingThemeVars` | — | Raw `--ul-*` var overrides |
| `className` | `string` | — | Root element class |
| `ImageComponent` | `ImageComponent` | `<img>` | `next/image` or custom |
| `motion` | `MotionAdapter` | static | Framer Motion adapter |
| `onBookTour` | `(unit: Unit) => void` | — | Book tour callback |
| `renderBookTourModal` | `(ctx) => ReactNode` | — | Custom book tour modal |

## 3D view

Pass a `building` config to get a third view: a facade with clickable floors, a floor plate with units colored by
status (available / not matching filters / not available), and a unit screen with floor plan, gallery and a Share popup.

- Units with `status` other than `'available'` are hidden from the card and list views and drawn as "not available" on
  the plates. Units without a `status` count as available.
- The geometry lives in the consumer: `floors[].d` are SVG paths over the facade render (`viewBox` in the render's
  pixel space); each `FloorPlate` has a static `Base` component plus unit `slots` (`slot` = unit number without the
  floor, e.g. `04A` for `304A`).
- Units are placed on slots by `defaultResolveUnit` (last two digits + letter suffix = slot, the rest = floor, or
  `unit.floor` when present). Override with `building.resolveUnit` if the data uses another numbering.

```tsx
const building: BuildingConfig = {
  image: { src: '/building.webp', alt: 'Building' },
  viewBox: '0 0 652 715',
  floors: [{ floor: 1, d: 'M632.5 662V694.5…Z' } /* … */],
  sections: [{ id: 'A', label: '372 Livingston', viewBox: '665 28 392 255' }],
  plates: [{ id: 'typical', floors: [1, 2, 3], viewBox: '20 28 1040 322', Base: PlateBase, slots }],
}
```

### Syncing navigation with the URL

`navFromSearchParams` / `navToSearchParams` read and write `?view=3d&floor=3&section=A&unit=304A`. Keep `nav`
controlled, write the URL in `onNavChange` (`history.pushState` when `meta.push`, else `replaceState`) and re-read it on
`popstate` so the browser back button walks between steps.

> The package keeps the `ul-` CSS class prefix of `@cmdquery/units-listing`. Don't render both packages on one page.

## Theming

All visual values are CSS custom properties. Override them at any scope:

### Via `theme` prop (typed)

```tsx
<UnitsListing
  theme={{
    colorBg: '#f8f5f0',
    colorAccent: '#1d3a5f',
    colorAccentContrast: '#ffffff',
    colorPrice: '#c9dff5',
    radiusLg: '16px',
    fontFamily: '"Inter", sans-serif',
    gridMinCol: '300px',
  }}
  units={units}
/>
```

### Via CSS (zero JS)

```css
/* Apply after importing package styles */
.ul-root {
  --ul-color-bg: #f8f5f0;
  --ul-color-accent: #1d3a5f;
  --ul-color-price: #c9dff5;
  --ul-grid-min-col: 300px;
}
```

### All available tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--ul-color-bg` | `#fffaf5` | Page/grid background |
| `--ul-color-surface` | `#ffffff` | Card background |
| `--ul-color-surface-alt` | `#ebe5dc` | Secondary surfaces |
| `--ul-color-border` | `#e7e0d5` | Borders |
| `--ul-color-text` | `#2d232e` | Primary text |
| `--ul-color-text-muted` | `#726a67` | Secondary text |
| `--ul-color-accent` | `#2c201c` | Buttons, active states |
| `--ul-color-accent-contrast` | `#fffaf5` | Text on accent |
| `--ul-color-price` | `rgb(229, 207, 180)` | Price pill background |
| `--ul-color-concession` | `#b8463f` | Concession badge |
| `--ul-radius-sm` | `8px` | Small radius |
| `--ul-radius-md` | `12px` | Medium radius |
| `--ul-radius-lg` | `20px` | Card radius |
| `--ul-radius-pill` | `999px` | Pill buttons |
| `--ul-grid-min-col` | `260px` | Min card width |
| `--ul-grid-gap` | `20px` | Grid gap |
| `--ul-font-family` | `inherit` | Font family |
| `--ul-transition` | `150ms ease-in-out` | UI transitions |
| `--ul-z-dropdown` | `100` | Filter dropdown z-index |
| `--ul-z-modal` | `1000` | Modal z-index |
| `--ul-z-lightbox` | `1100` | Lightbox z-index |

## Labels (i18n)

All user-facing strings are injectable:

```tsx
<UnitsListing
  labels={{
    concessionMonths: 'Months Free',
    concessionWeeks: 'Weeks Free',
    bookTour: 'Schedule a Tour',
    emptyTitle: 'No units available',
    emptySubtitle: 'Try adjusting your filters',
    viewCard: 'Cards',
    viewList: 'List',
    clearFilters: 'Clear',
  }}
  units={units}
/>
```

## Book Tour

BookTour behavior is fully owned by the consumer. Two patterns:

```tsx
// Pattern 1: callback only
<UnitsListing
  onBookTour={(unit) => router.push(`/book?unit=${unit.id}`)}
  units={units}
/>

// Pattern 2: render your own modal
<UnitsListing
  renderBookTourModal={({ unit, close }) => (
    <MyBookTourModal unit={unit} onClose={close} />
  )}
  units={units}
/>
```

## Granular exports

For custom layouts, import individual components:

```tsx
import {
  UnitsGrid,
  UnitCard,
  UnitsTable,
  CardSkeleton,
  ViewToggle,
  FiltersDropdown,
  useUnitsFilter,
  UnitsListingProvider,
} from '@cmdquery/units-listing-3d'
```

## Monorepo (pnpm workspaces)

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```jsonc
// apps/my-app/package.json
{
  "@cmdquery/units-listing-3d": "workspace:*"
}
```

```js
// next.config.js — enables hot reload without pre-building
transpilePackages: ['@cmdquery/units-listing-3d']
```

## Development

```bash
npm run dev       # watch mode
npm run build     # production build
npm run typecheck # TypeScript check
```

## License

MIT
