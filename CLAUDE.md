# units-listing-3d

Themeable React UI component library for apartment/condo listings. Published to GitHub Packages as `@cmdquery/units-listing-3d`.

## Commands

```bash
npm run build       # build with tsup (ESM + CJS + types + CSS)
npm run dev         # watch mode
npm run typecheck   # tsc --noEmit
```

## Architecture

- **`src/UnitsListing/`** — main component entry point
- **`src/adapters/motion.tsx`** — `MotionAdapter` interface + static fallback; consumers pass `{ div: motion.div, AnimatePresence }` cast as `MotionAdapter`
- **`src/context/`** — `UnitsListingContext` wires config/labels/adapters through the tree
- **`src/components/`** — feature components (filters, unit card, modals, etc.)
- **`src/ui/`** — primitive UI components
- **`src/hooks/`** — shared hooks
- **`src/styles/`** — CSS Modules; exported as `@cmdquery/units-listing-3d/styles`
- **`src/types/`** — shared TypeScript types

## Key design decisions

- **No bundled animation library** — `motion` is an optional peer dep. Consumers inject it via the `motion` prop (`MotionAdapter`). Default fallback renders static divs.
- **No bundled image component** — `ImageComponent` prop accepts Next.js `Image` or any compatible component.
- **Theme via CSS custom properties** — `theme` prop maps to CSS variables at runtime.
- **`MotionAdapter` type mismatch** — `motion.div` is a `ForwardRefExoticComponent`, not a plain `ComponentType`. When passing from `motion/react`, cast: `{ div: motion.div, AnimatePresence } as MotionAdapter`.

## Publishing

Package publishes to GitHub Packages (`npm.pkg.github.com`). Bump version in `package.json`, build, then `npm publish`.
