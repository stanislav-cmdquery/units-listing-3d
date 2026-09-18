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

Pass a `building` config to get a third view mode next to Cards and List. It has three steps:

1. **Building** — the facade render with clickable floor bands, a "Select Floor" picker, per-floor and total
   availability.
2. **Floor** — the floor plate with every unit colored by status (available / not matching the filters / not
   available), status hints on hover, filters (building section, floor, beds, baths, price) and a mobile filters sheet.
3. **Unit** — the plate with the unit highlighted, floor plan and photo gallery, price footer, Book Tour and a Share
   popup.

The package contains no building-specific code: everything that describes a particular building lives in one
`BuildingConfig` object supplied by the consumer. Adding another building means producing that object — no package
changes are needed.

- Units whose `status` is not `'available'` are hidden from the Cards and List views and drawn as "not available" on the
  plates. Units without a `status` count as available.
- A plate slot with no matching unit in the data is also drawn as "not available", so the plate always shows the full
  floor.
- Returning to the building step clears the filters. On a phone the floor plate is shown whole and panned sideways by
  dragging; the building pills follow the pan.
- **Escape** steps back (unit → floor → building) while the 3D view is on screen. It is ignored when focus is in a form
  field, an `aria-modal` dialog is open, the page scroll is locked, or the event was already handled. If your page has
  its own overlays that close on Escape, call `e.preventDefault()` in their handler so the 3D view leaves the key alone.

### Adapting the package to a new building

A complete, working example is the Luma Living config: `features/availability/building/` in the `luma-living` repo
(`building.ts`, `floors.ts`, `TypicalPlate.tsx`, `assets/building.webp`). Copy its structure.

#### 1. What to get from design

| Asset | Used for | Notes |
|-------|----------|-------|
| Facade render | `building.image` | One flat image. Export the exact frame the floor bands are drawn over (crop matters, see step 2). 2x PNG → WebP is plenty. |
| One polygon per floor | `building.floors` | Ask the designer for a (hidden) layer of vector shapes, one per floor, named by floor number, drawn over the render. |
| One vector drawing per *typical* floor plate | `building.plates` | Floors with an identical layout share a plate. Unit outlines must be separate vectors; unit number/type labels as text frames. |
| Unit numbering scheme | `resolveUnit` | How a unit number from the data maps to floor + position (e.g. `304A` = floor 3, slot `04A`). |
| Building sections (optional) | `building.sections` | When several buildings/wings share a plate (Luma: 362/370/372 Livingston). |
| Mobile designs | `sections[].viewBox` | Each building's area on the plate. On a phone the plate is scaled so the widest section fills the screen and can be dragged sideways; picking a building pans to its area. |

#### 2. Extract the geometry from Figma

With the Figma MCP server (or the REST API):

- **Facade render**: `download_assets` on the frame the floor vectors sit in, with an explicit scale (`defaultScale: 2`).
  Do **not** use the raw image fill: fills are often cropped/zoomed inside the frame, so the polygons won't line up.
- **Floor polygons**: hidden layers can't be exported as a group — call `get_design_context` on each floor vector; it
  returns an SVG in the vector's local space plus the CSS inset of the image (`inset-[-1.32%_0_-0.81%_0]`). Convert each
  path to the render's coordinate space (the frame's top-left is `0,0`):

  ```js
  // node: x, y, w, h — the vector's box from get_metadata (absolute in the page frame)
  // inset: top/right/bottom/left percentages from get_design_context (as positive numbers)
  // origin: the render frame's x, y; svgW/svgH: the exported SVG viewBox size
  const boxX = node.x - inset.left / 100 * node.w
  const boxY = node.y - inset.top / 100 * node.h
  const sx = node.w * (1 + (inset.left + inset.right) / 100) / svgW
  const sy = node.h * (1 + (inset.top + inset.bottom) / 100) / svgH
  const mapX = (x) => round(boxX + x * sx - origin.x)
  const mapY = (y) => round(boxY + y * sy - origin.y)
  // Walk the path tokens: H takes mapX, V takes mapY, other commands alternate x/y.
  // Exported paths use absolute commands only; bail out if you meet a lowercase one.
  ```

  Verify by drawing all paths semi-transparently over the render (e.g. an SVG with the image as `<image>` rendered by
  `rsvg-convert`) — every band must sit on its floor.
- **Floor plate**: `download_assets` with `defaultFormat: 'svg'` on the plate frame. In the file:
  - vectors with a fill are **units** → `slots[].d`;
  - stroke-only vectors (balconies, corridor, cores, section dividers) → `Base`;
  - text is exported as outlined paths — don't copy those; take label positions from `get_metadata` instead (the
    "number + type" frames) and render text with `<text>` so it follows the theme font.
  The plate's coordinate space is the frame itself; pick a `viewBox` that trims empty margins but keeps captions.

#### 3. Write the config

```
building/
  assets/building.webp
  floors.ts          // BuildingFloor[]
  TypicalPlate.tsx   // FloorPlate (Base + slots); one file per typical plate
  building.ts        // BuildingConfig
```

```ts
// floors.ts — d in the render's pixel space (the same space as building.viewBox)
export const BUILDING_FLOORS: BuildingFloor[] = [
  { floor: 1, d: 'M632.5 662V694.5L78.4 696L23.5 666.5V634.5L78.4 662H632.5Z' },
  // …one entry per floor; the floor picker lists exactly these floors, sorted
]
```

```tsx
// TypicalPlate.tsx
const STROKE = { stroke: 'var(--ul-plate-stroke)', strokeWidth: 1.5, fill: 'none' } as const

function TypicalPlateBase() {
  // Static drawing only: no ids (the plate can be rendered twice), no event handlers.
  // Units are drawn on top of this by the package.
  return (
    <g aria-hidden="true">
      {BALCONIES.map((d) => <path key={d} d={d} {...STROKE} />)}
      <text x={329} y={214.5} fontSize={9} fill="var(--ul-plate-label)" textAnchor="middle">CORE C</text>
    </g>
  )
}

const SLOTS: FloorPlateSlot[] = [
  {
    slot: '01C',          // unit number without the floor prefix
    section: 'C',         // BuildingSection.id
    typeLabel: '2-Bed',   // shown even when the unit is missing from the data
    d: 'M186.494 57.3008H31.1602V143.401H186.494V57.3008Z',
    labelX: 107,          // top-center of the "number + type" label block
    labelY: 82,
    // labelScale: 0.75,  // for narrow units
  },
]

export const TYPICAL_PLATE: FloorPlate = {
  id: 'typical',
  floors: [2, 3, 4 /* … */],   // every floor that uses this layout
  viewBox: '20 28 1040 322',
  Base: TypicalPlateBase,
  slots: SLOTS,
}
```

```ts
// building.ts
import render from './assets/building.webp'

export const BUILDING: BuildingConfig = {
  image: { src: render.src, width: render.width, height: render.height, blurDataURL: render.blurDataURL, alt: '…' },
  viewBox: '0 0 652 715',       // the render frame size in design pixels — the space of floors[].d
  floors: BUILDING_FLOORS,
  sections: [
    // Order = order of the building pills. viewBox = this section's area on the plate (mobile pan).
    { id: 'C', label: '362 Livingston', viewBox: '25 28 360 255' },
    { id: 'B', label: '370 Livingston', viewBox: '372 28 305 255' },
  ],
  plates: [GROUND_PLATE, TYPICAL_PLATE, PENTHOUSE_PLATE],
  // resolveUnit, formatUnitNumber — see below
}
```

Rules the package relies on:

- `floors[].floor` values are the floor numbers used everywhere (pills, URL, plates). A floor with no plate shows the
  empty state.
- A slot's `slot` + the floor must identify the unit: two slots on one plate can't share a `slot`.
- Label text is placed at `labelY + 15` (number, 14px) and `labelY + 33` (type, 9px) in plate units; keep plate
  coordinates at design scale so these sizes match.
- With a single section, pass one section (no `viewBox` needed); the building switcher is hidden.

#### 4. Map units to slots

`defaultResolveUnit` takes the last two digits plus a letter suffix as the slot and everything before it as the floor
(`304A` → floor 3, slot `04A`; `1204A` → floor 12). `unit.floor`, when present in the data, wins over the parsed floor.
For any other scheme provide `resolveUnit`, and `formatUnitNumber` for the reverse direction (used to label slots that
have no unit in the data):

```ts
// Data uses "3-04" and the building letter comes from the SeeClick building id.
const SECTION_BY_BUILDING_ID: Record<number, string> = { 101: 'A', 102: 'B' }

const building: BuildingConfig = {
  // …
  resolveUnit: (unit) => {
    const [floor, position] = unit.unitNumber.split('-')
    const section = SECTION_BY_BUILDING_ID[Number(unit.buildingId)]
    return floor && position && section ? { floor: Number(floor), slot: `${position}${section}` } : null
  },
  formatUnitNumber: (floor, slot) => `${floor}-${slot.slice(0, 2)}`,
}
```

Units for which `resolveUnit` returns `null` still appear in Cards/List but not on the plates. If a building's units come
from several SeeClick tokens, fetch them all, `mapScrUnit` each and concatenate — `buildingId` is kept on every unit.

#### 5. Render it

```tsx
'use client'
import { UnitsListing, navFromSearchParams, navToSearchParams, type AvailabilityNav } from '@cmdquery/units-listing-3d'
import '@cmdquery/units-listing-3d/styles'

const DEFAULT_NAV: AvailabilityNav = { view: '3d', floor: null, section: null, unit: null }
const readNav = (query: string) => ({ ...DEFAULT_NAV, ...navFromSearchParams(new URLSearchParams(query)) })

export function Availability({ units, initialQuery }: { units: Unit[]; initialQuery: string }) {
  const [nav, setNav] = useState(() => readNav(initialQuery))

  useEffect(() => {
    const onPopState = () => setNav(readNav(window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <UnitsListing
      building={BUILDING}
      units={units}
      nav={nav}
      onNavChange={(next, { push }) => {
        setNav(next)
        const url = `${location.pathname}?${navToSearchParams(next, location.search)}`
        if (push) history.pushState(null, '', url)
        else history.replaceState(null, '', url)
      }}
    />
  )
}
```

- Pass the request's query string from the server page (`initialQuery`) so a shared link (`?view=3d&floor=3&unit=304A`)
  renders the right step on the first paint. A deep link to a unit that is gone or leased falls back to its floor.
- Use `history.pushState/replaceState`, not `router.push/replace`: a router navigation re-renders the server page and
  re-fetches the units on every click. Next.js keeps `useSearchParams` in sync with native history calls.
- `onNavChange` gets `push: true` for building → floor → unit steps (so the browser back button walks back through
  them) and `false` for view/section/floor switches.
- The package's main entry creates React context at module scope — import it from client components only. The
  `adapters/seeClickRent` entry is safe on the server.
- Without `nav`, the component manages navigation itself (`defaultNav` sets the start) — fine when URL sync isn't needed.
- `getUnitShareUrl` overrides the link in the Share popup (default: current URL with the unit's nav params).

#### 6. Theme and texts

All 3D colors are CSS variables; defaults match the Luma design. Override them via `themeVars` (or `theme` for the
typed subset):

| Token | Default | Used for |
|-------|---------|----------|
| `--ul-pill-bg` / `--ul-pill-bg-hover` / `--ul-pill-bg-active` | `#e9e6e2` / `#dcd3c8` / `#382d29` | Filter pills, price range, chips |
| `--ul-pill-text` / `--ul-pill-text-active` | `#382d29` / `#f4f1ed` | Pill text |
| `--ul-status-available` / `-not-matching` / `-unavailable` | `#bac48e` / `#cbbead` / `#ebeaea` | Legend dots |
| `--ul-plate-available` (+`-hover`) | `#d3dda6` (`#bac48e`) | Available unit fill |
| `--ul-plate-not-matching` (+`-hover`) | `#dcd3c8` (`#cbbead`) | Filtered-out unit fill |
| `--ul-plate-unavailable` | `#ebeaea` | Not available unit fill |
| `--ul-plate-stroke` | `#332925` | Unit outlines (use it in `Base` too) |
| `--ul-plate-label` / `-label-muted` | `#382d29` / `#a39e9d` | Unit number / type text |
| `--ul-plate-label-available` / `-label-available-muted` | `#363928` / `#7d845d` | Text on available units |
| `--ul-plate-tooltip-bg` / `--ul-plate-tooltip-text` | `#1f1917` / `#e9e6e2` | Hover hints on the plate |
| `--ul-building-floor-highlight` | `rgba(143, 185, 125, 0.8)` | Hovered floor band on the facade |
| `--ul-building-floor-label-bg` / `-label-text` | `#596c51` / `#f4f1ed` | Label next to the hovered floor |
| `--ul-3d-surface` | `#fefefe` | Page background under the 3D view (filters fade) |
| `--ul-link-pressed` | `#605754` | Pressed state of text links (Return to…, Book Tour) |
| `--ul-clear-text` / `--ul-clear-pressed` | `#605754` / `#a39e9d` | Clear Filters link |
| `--ul-3d-height` | `80lvh` | Desktop height of every 3D step. Set it to the viewport height left under your header (e.g. `calc(100lvh - 98px - 20px)`) so each step fits one screen |
| `--ul-3d-mobile-height` | `100svh` | Mobile height of the floor step: the plate scales down to fit it. Set it to the viewport height minus your section padding |
| `--ul-3d-bleed` | `20px` | Mobile side gutter of your section; the filters bar and the Select Building row extend into it to reach the screen edges |
| `--ul-sheet-bg` / `--ul-sheet-divider` | `#f4f1ed` / `#dcd3c8` | Mobile filters sheet background; header rule and footer background |
| `--ul-sheet-clear-text` | `#a48d70` | Clear Filters in the mobile filters sheet |
| `--ul-footer-note-text` | `#605754` | Net effective note under the unit footer (mobile) |

Every string is in `labels` (`selectFloor`, `hoverToSelectFloor`, `availableApartments`, `statusAvailable`,
`hintAvailable`, `hintNotMatching`, `hintNotAvailable`, `floorLabel`, `shareTitle`, `netEffectiveNote`, …). Hints use `\n` for line
breaks. See `UnitsListingLabels` for the full list.

Finer layout tweaks go through the `ul-3d-*`, `ul-plate-*`, `ul-bmap-*` and `ul-legend-*` classes. The package keeps
the `ul-` CSS prefix of `@cmdquery/units-listing`, so don't render both packages on one page.

#### 7. Checklist

- [ ] Every floor band lines up with the render (overlay check).
- [ ] Every floor in `floors` is covered by a plate.
- [ ] Each unit number in the data resolves to an existing slot (log units where `resolveUnit` returns `null` or the slot
      is missing on the plate).
- [ ] Slot type labels match the data's bed counts.
- [ ] Mobile: each section `viewBox` covers its whole building, so tapping its pill centers the right part of the plate.
- [ ] Deep link `?view=3d&floor=N&unit=X` opens the unit; browser back returns to the floor, then the building.

#### Limitations

- The screen layouts (column widths, positions of legend, hints and totals) follow the Luma design; they can be restyled
  with CSS but not restructured through props.
- One facade image per building — no multiple angles or real 3D.
- Units must be mapped to the `Unit` type; only a SeeClick adapter ships with the package.

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
