'use client'
import { useCallback, useMemo, type CSSProperties } from 'react'
import '../styles/global.css'
import { UnitsListingProvider, defaultLabels } from '../context/UnitsListingContext'
import { UnitsGrid } from '../components/Grid/UnitsGrid'
import { ViewToggle } from '../components/Grid/ViewToggle'
import { UnitCard } from '../components/Card/UnitCard'
import { CardSkeleton } from '../components/CardSkeleton/CardSkeleton'
import { UnitsTable } from '../components/Table/UnitsTable'
import { Availability3D } from '../components/Availability3D/Availability3D'
import { useAvailabilityNav } from '../hooks/useAvailabilityNav'
import { useUnitsFilter } from '../hooks/useUnitsFilter'
import { themeToVars } from '../types/theme'
import type { ViewMode } from '../types/nav'
import { isUnitAvailable } from '../utils/building'
import { clsx } from 'clsx'
import type { UnitsListingProps } from './UnitsListing.types'

export function UnitsListing({
  units,
  isLoading,
  isError,
  onRetry,
  building,
  views: viewsProp,
  defaultView,
  nav: navProp,
  defaultNav,
  onNavChange,
  getUnitShareUrl,
  pageSize = 25,
  skeletonCount = 10,
  priceStep = 50,
  showUnitTypeFilter = false,
  labels,
  theme,
  themeVars,
  className,
  style,
  header,
  ImageComponent,
  CopyIconComponent,
  motion,
  onBookTour,
  renderBookTourModal,
}: UnitsListingProps) {
  const themeStyle = useMemo((): CSSProperties => ({
    ...(theme ? themeToVars(theme) : {}),
    ...(themeVars ?? {}),
  }), [theme, themeVars]) as CSSProperties

  const rootStyle = useMemo(
    () => ({ ...themeStyle, ...style }),
    [themeStyle, style]
  )

  const providerValue = useMemo(
    () => ({ labels, themeStyle, ImageComponent, CopyIconComponent, motion, pageSize, skeletonCount, priceStep, onBookTour, renderBookTourModal }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [labels, themeStyle, ImageComponent, CopyIconComponent, motion, pageSize, skeletonCount, priceStep, onBookTour, renderBookTourModal]
  )

  const views = useMemo<ViewMode[]>(() => {
    const requested = viewsProp ?? (building ? ['3d', 'card', 'list'] : ['card', 'list'])
    // The 3D view can't render without a building config.
    const allowed = building ? requested : requested.filter((v) => v !== '3d')
    return allowed.length ? allowed : ['card']
  }, [viewsProp, building])

  const [nav, setNav] = useAvailabilityNav({
    nav: navProp,
    defaultNav: { view: defaultView ?? views[0], ...defaultNav },
    onNavChange,
  })
  const view = views.includes(nav.view) ? nav.view : views[0]

  // Leased and off-market units only exist to be drawn on the 3D floor plates.
  const availableUnits = useMemo(() => units.filter(isUnitAvailable), [units])
  const filter = useUnitsFilter(availableUnits, priceStep)

  const handleViewChange = useCallback((next: ViewMode) => setNav({ view: next }), [setNav])

  const mergedLabels = { ...defaultLabels, ...labels }
  const viewToggle = (
    <ViewToggle
      view={view}
      views={views}
      onChange={handleViewChange}
      label3d={mergedLabels.view3d}
      labelCards={mergedLabels.viewCard}
      labelList={mergedLabels.viewList}
    />
  )

  const renderCard = useCallback(
    (unit: Parameters<typeof UnitCard>[0]['unit']) => <UnitCard key={unit.id} unit={unit} />,
    []
  )

  const renderSkeletons = useCallback(
    () => Array.from({ length: skeletonCount }, (_, i) => <CardSkeleton key={i} />),
    [skeletonCount]
  )

  const renderTable = useCallback(
    (u: Parameters<typeof UnitsTable>[0]['units']) => <UnitsTable units={u} />,
    []
  )

  return (
    <UnitsListingProvider value={providerValue}>
      <div className={clsx('ul-root', className)} style={rootStyle}>
        {view === '3d' && building ? (
          <Availability3D
            building={building}
            units={units}
            filter={filter}
            nav={nav}
            setNav={setNav}
            header={header}
            viewToggle={viewToggle}
            isError={isError ?? false}
            onRetry={onRetry}
            getUnitShareUrl={getUnitShareUrl}
          />
        ) : (
          <UnitsGrid
            filter={filter}
            view={view === '3d' ? 'card' : view}
            viewToggle={viewToggle}
            isLoading={isLoading ?? false}
            isError={isError ?? false}
            onRetry={onRetry}
            header={header}
            pageSize={pageSize}
            showUnitTypeFilter={showUnitTypeFilter}
            renderCard={renderCard}
            renderSkeletons={renderSkeletons}
            renderTable={renderTable}
          />
        )}
      </div>
    </UnitsListingProvider>
  )
}
