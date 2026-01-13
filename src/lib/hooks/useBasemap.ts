import { useState, useCallback, useEffect } from 'react';
import type { Map } from 'maplibre-gl';
import type { BasemapName } from '../basemaps/types';
import { basemaps, getBasemapNames } from '../basemaps';

/**
 * Return type for the useBasemap hook.
 */
interface UseBasemapReturn {
  /** Current basemap name */
  currentBasemap: BasemapName | null;
  /** Set the basemap */
  setBasemap: (name: BasemapName) => void;
  /** List of available basemap names */
  availableBasemaps: BasemapName[];
  /** Full basemap catalog */
  basemapCatalog: typeof basemaps;
}

/**
 * Hook for managing basemap state.
 * Can be used independently or with the MapExtendProvider.
 *
 * @param map - MapLibre map instance
 * @param initialBasemap - Initial basemap to set
 * @returns Basemap state and methods
 *
 * @example
 * ```tsx
 * function BasemapSelector({ map }: { map: Map }) {
 *   const { currentBasemap, setBasemap, availableBasemaps } = useBasemap(map);
 *
 *   return (
 *     <select
 *       value={currentBasemap || ''}
 *       onChange={(e) => setBasemap(e.target.value as BasemapName)}
 *     >
 *       {availableBasemaps.map(name => (
 *         <option key={name} value={name}>{name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useBasemap(
  map: Map | null,
  initialBasemap?: BasemapName
): UseBasemapReturn {
  const [currentBasemap, setCurrentBasemap] = useState<BasemapName | null>(
    initialBasemap || null
  );
  const [availableBasemaps] = useState<BasemapName[]>(getBasemapNames());

  // Set initial basemap when map is ready
  useEffect(() => {
    if (map && initialBasemap) {
      map.setBasemap(initialBasemap);
      setCurrentBasemap(initialBasemap);
    }
  }, [map, initialBasemap]);

  // Sync with map state
  useEffect(() => {
    if (!map) return;

    const syncBasemap = () => {
      const current = map.getBasemap();
      setCurrentBasemap(current);
    };

    map.on('styledata', syncBasemap);

    return () => {
      map.off('styledata', syncBasemap);
    };
  }, [map]);

  const setBasemap = useCallback(
    (name: BasemapName) => {
      if (map) {
        map.setBasemap(name);
        setCurrentBasemap(name);
      }
    },
    [map]
  );

  return {
    currentBasemap,
    setBasemap,
    availableBasemaps,
    basemapCatalog: basemaps,
  };
}
