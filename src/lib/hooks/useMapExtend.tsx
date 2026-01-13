import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Map } from 'maplibre-gl';
import type { GeoJSON } from 'geojson';
import type { BasemapName } from '../basemaps/types';
import type { LayerInfo, AddGeojsonOptions, AddCogOptions, AddWmsOptions, AddRasterOptions } from '../layers/types';

/**
 * Context value for MapExtend provider.
 */
interface MapExtendContextValue {
  /** The MapLibre map instance */
  map: Map | null;
  /** Current basemap name */
  currentBasemap: BasemapName | null;
  /** All custom layers */
  layers: LayerInfo[];
  /** Set the basemap */
  setBasemap: (name: BasemapName) => void;
  /** Add a GeoJSON layer */
  addGeojsonLayer: (data: GeoJSON | string, options?: AddGeojsonOptions) => Promise<string | null>;
  /** Add a raster layer */
  addRasterLayer: (url: string, options?: AddRasterOptions) => string | null;
  /** Add a COG layer */
  addCogLayer: (url: string, options?: AddCogOptions) => string | null;
  /** Add a WMS layer */
  addWmsLayer: (url: string, options: AddWmsOptions) => string | null;
  /** Remove a layer */
  removeLayer: (layerId: string) => void;
  /** Toggle layer visibility */
  toggleLayerVisibility: (layerId: string) => void;
  /** Set layer opacity */
  setLayerOpacity: (layerId: string, opacity: number) => void;
  /** Refresh the layers list */
  refreshLayers: () => void;
}

const MapExtendContext = createContext<MapExtendContextValue | null>(null);

/**
 * Props for the MapExtend provider.
 */
interface MapExtendProviderProps {
  /** The MapLibre map instance */
  map: Map | null;
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component for MapExtend functionality.
 * Wrap your map components with this provider to access map extension methods via hooks.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [map, setMap] = useState<Map | null>(null);
 *
 *   return (
 *     <MapExtendProvider map={map}>
 *       <MapComponent onMapLoad={setMap} />
 *       <MapControls />
 *     </MapExtendProvider>
 *   );
 * }
 * ```
 */
export function MapExtendProvider({ map, children }: MapExtendProviderProps) {
  const [currentBasemap, setCurrentBasemap] = useState<BasemapName | null>(null);
  const [layers, setLayers] = useState<LayerInfo[]>([]);

  // Sync with map state
  const refreshLayers = useCallback(() => {
    if (map) {
      setCurrentBasemap(map.getBasemap());
      setLayers(map.getAllCustomLayers());
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const syncState = () => {
      refreshLayers();
    };

    map.on('styledata', syncState);
    syncState();

    return () => {
      map.off('styledata', syncState);
    };
  }, [map, refreshLayers]);

  const setBasemap = useCallback(
    (name: BasemapName) => {
      if (map) {
        map.setBasemap(name);
        setCurrentBasemap(name);
      }
    },
    [map]
  );

  const addGeojsonLayer = useCallback(
    async (data: GeoJSON | string, options?: AddGeojsonOptions): Promise<string | null> => {
      if (!map) return null;

      const layerId = await map.addGeojson(data, options);
      refreshLayers();
      return layerId;
    },
    [map, refreshLayers]
  );

  const addRasterLayer = useCallback(
    (url: string, options?: AddRasterOptions): string | null => {
      if (!map) return null;

      const layerId = map.addRaster(url, options);
      refreshLayers();
      return layerId;
    },
    [map, refreshLayers]
  );

  const addCogLayer = useCallback(
    (url: string, options?: AddCogOptions): string | null => {
      if (!map) return null;

      const layerId = map.addCogLayer(url, options);
      refreshLayers();
      return layerId;
    },
    [map, refreshLayers]
  );

  const addWmsLayer = useCallback(
    (url: string, options: AddWmsOptions): string | null => {
      if (!map) return null;

      const layerId = map.addWmsLayer(url, options);
      refreshLayers();
      return layerId;
    },
    [map, refreshLayers]
  );

  const removeLayer = useCallback(
    (layerId: string) => {
      if (map) {
        map.removeLayerById(layerId);
        refreshLayers();
      }
    },
    [map, refreshLayers]
  );

  const toggleLayerVisibility = useCallback(
    (layerId: string) => {
      if (map) {
        const layer = layers.find((l) => l.layerId === layerId);
        if (layer) {
          map.setLayerVisibility(layerId, !layer.visible);
          refreshLayers();
        }
      }
    },
    [map, layers, refreshLayers]
  );

  const setLayerOpacityFn = useCallback(
    (layerId: string, opacity: number) => {
      if (map) {
        map.setLayerOpacity(layerId, opacity);
        refreshLayers();
      }
    },
    [map, refreshLayers]
  );

  return (
    <MapExtendContext.Provider
      value={{
        map,
        currentBasemap,
        layers,
        setBasemap,
        addGeojsonLayer,
        addRasterLayer,
        addCogLayer,
        addWmsLayer,
        removeLayer,
        toggleLayerVisibility,
        setLayerOpacity: setLayerOpacityFn,
        refreshLayers,
      }}
    >
      {children}
    </MapExtendContext.Provider>
  );
}

/**
 * Hook to access MapExtend functionality.
 * Must be used within a MapExtendProvider.
 *
 * @returns MapExtend context value
 * @throws Error if used outside of MapExtendProvider
 *
 * @example
 * ```tsx
 * function MapControls() {
 *   const { setBasemap, layers, toggleLayerVisibility } = useMapExtend();
 *
 *   return (
 *     <div>
 *       <button onClick={() => setBasemap('CartoDB.DarkMatter')}>
 *         Dark Mode
 *       </button>
 *       {layers.map(layer => (
 *         <button
 *           key={layer.layerId}
 *           onClick={() => toggleLayerVisibility(layer.layerId)}
 *         >
 *           Toggle {layer.layerId}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMapExtend(): MapExtendContextValue {
  const context = useContext(MapExtendContext);
  if (!context) {
    throw new Error('useMapExtend must be used within a MapExtendProvider');
  }
  return context;
}
