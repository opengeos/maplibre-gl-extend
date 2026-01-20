import type { Map, CustomLayerInterface } from 'maplibre-gl';
import { ZarrLayer } from '@carbonplan/zarr-layer';
import { storeLayerInfo, removeLayerInfo, updateLayerVisibility, updateLayerOpacity, getLayerInfoById } from './registry';
import { generateLayerId } from '../utils';
import type { AddZarrOptions } from './types';

const ZARR_LAYERS_KEY = '__maplibreExtendZarrLayers';

// Extended ZarrLayer type to handle the dynamic API
type ZarrLayerInstance = ZarrLayer & {
  setSelector?: (selector: Record<string, number>) => void;
  setClim?: (clim: [number, number]) => void;
  setColormap?: (colormap: string[]) => void;
  setOpacity?: (opacity: number) => void;
  setProps?: (props: Record<string, unknown>) => void;
};

interface ZarrLayerEntry {
  id: string;
  layer: ZarrLayerInstance;
  url: string;
  options: AddZarrOptions;
}

/**
 * Get the Zarr layer store for a map instance.
 *
 * @param map - MapLibre map instance
 * @returns Record of Zarr layers
 */
function getZarrLayers(map: Map): Record<string, ZarrLayerEntry> {
  return (
    (map as unknown as Record<string, Record<string, ZarrLayerEntry>>)[ZARR_LAYERS_KEY] || {}
  );
}

/**
 * Set the Zarr layer store for a map instance.
 *
 * @param map - MapLibre map instance
 * @param layers - Record of Zarr layers
 */
function setZarrLayers(map: Map, layers: Record<string, ZarrLayerEntry>): void {
  (map as unknown as Record<string, Record<string, ZarrLayerEntry>>)[ZARR_LAYERS_KEY] = layers;
}

/**
 * Add a Zarr layer to the map.
 * Zarr layers are used for displaying multi-dimensional array data (e.g., climate data).
 *
 * @param map - MapLibre map instance
 * @param url - URL to the Zarr data source
 * @param options - Zarr layer options
 * @returns Promise resolving to the layer ID
 */
export async function addZarrLayer(
  map: Map,
  url: string,
  options: AddZarrOptions
): Promise<string> {
  const {
    layerId = generateLayerId('zarr'),
    variable,
    colormap = ['#440154', '#21918c', '#fde725'], // Viridis default
    clim = [0, 1],
    opacity = 1,
    selector = {},
    minzoom = 0,
    maxzoom = 22,
    fillValue = -9999,
    spatialDimensions = { lat: 'lat', lon: 'lon' },
    zarrVersion = 2,
    bounds,
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create the Zarr layer
      const layer = new ZarrLayer({
        id: layerId,
        source: url,
        variable,
        clim,
        colormap,
        selector,
        opacity,
        minzoom,
        maxzoom,
        fillValue,
        spatialDimensions,
        zarrVersion,
        bounds,
      }) as ZarrLayerInstance;

      // Add as a custom MapLibre layer
      map.addLayer(layer as unknown as CustomLayerInterface);

      // Store in Zarr layers registry
      const zarrLayers = getZarrLayers(map);
      zarrLayers[layerId] = {
        id: layerId,
        layer,
        url,
        options: {
          layerId,
          variable,
          colormap,
          clim,
          opacity,
          selector,
          minzoom,
          maxzoom,
          fillValue,
          spatialDimensions,
          zarrVersion,
          bounds,
        },
      };
      setZarrLayers(map, zarrLayers);

      // Store in our standard layer registry for tracking
      storeLayerInfo(map, layerId, layerId, 'zarr', {
        url,
        variable,
        colormap,
        clim,
        opacity,
        selector,
        minzoom,
        maxzoom,
        fillValue,
        spatialDimensions,
        zarrVersion,
        bounds,
      });

      resolve(layerId);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Recreate a Zarr layer with updated options.
 *
 * @param map - MapLibre map instance
 * @param entry - Current layer entry
 * @param newOptions - Partial options to update
 */
function recreateZarrLayer(
  map: Map,
  entry: ZarrLayerEntry,
  newOptions: Partial<AddZarrOptions>
): void {
  const layerId = entry.id;
  const updatedOptions = { ...entry.options, ...newOptions };

  // Remove the old layer
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }

  // Create new layer with updated options
  const newLayer = new ZarrLayer({
    id: layerId,
    source: entry.url,
    variable: updatedOptions.variable!,
    clim: updatedOptions.clim ?? [0, 1],
    colormap: updatedOptions.colormap ?? ['#440154', '#21918c', '#fde725'],
    selector: updatedOptions.selector,
    opacity: updatedOptions.opacity,
    minzoom: updatedOptions.minzoom,
    maxzoom: updatedOptions.maxzoom,
    fillValue: updatedOptions.fillValue,
    spatialDimensions: updatedOptions.spatialDimensions,
    zarrVersion: updatedOptions.zarrVersion,
    bounds: updatedOptions.bounds,
  }) as ZarrLayerInstance;

  // Add new layer
  map.addLayer(newLayer as unknown as CustomLayerInterface);

  // Update registry
  const zarrLayers = getZarrLayers(map);
  zarrLayers[layerId] = {
    ...entry,
    layer: newLayer,
    options: updatedOptions,
  };
  setZarrLayers(map, zarrLayers);
}

/**
 * Update the dimension selector for a Zarr layer.
 * Used to change which slice of multi-dimensional data is displayed.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param selector - New selector values (e.g., { month: 6 })
 */
export function setZarrSelector(
  map: Map,
  layerId: string,
  selector: Record<string, number>
): Map {
  const zarrLayers = getZarrLayers(map);
  const entry = zarrLayers[layerId];

  if (entry) {
    // Try to use setSelector if available, otherwise recreate the layer
    if (typeof entry.layer.setSelector === 'function') {
      entry.layer.setSelector(selector);
      entry.options.selector = selector;
    } else if (typeof entry.layer.setProps === 'function') {
      entry.layer.setProps({ selector });
      entry.options.selector = selector;
    } else {
      // Fallback: recreate the layer with new selector
      recreateZarrLayer(map, entry, { selector });
    }

    // Update the stored options
    const layerInfo = getLayerInfoById(map, layerId);
    if (layerInfo) {
      layerInfo.options.selector = selector;
    }
  }

  return map;
}

/**
 * Update the color limits for a Zarr layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param clim - New color limits [min, max]
 */
export function setZarrClim(
  map: Map,
  layerId: string,
  clim: [number, number]
): Map {
  const zarrLayers = getZarrLayers(map);
  const entry = zarrLayers[layerId];

  if (entry) {
    // Try to use setClim if available, otherwise recreate the layer
    if (typeof entry.layer.setClim === 'function') {
      entry.layer.setClim(clim);
      entry.options.clim = clim;
    } else if (typeof entry.layer.setProps === 'function') {
      entry.layer.setProps({ clim });
      entry.options.clim = clim;
    } else {
      // Fallback: recreate the layer with new clim
      recreateZarrLayer(map, entry, { clim });
    }

    // Update the stored options
    const layerInfo = getLayerInfoById(map, layerId);
    if (layerInfo) {
      layerInfo.options.clim = clim;
    }
  }

  return map;
}

/**
 * Update the colormap for a Zarr layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param colormap - New colormap (array of color strings)
 */
export function setZarrColormap(
  map: Map,
  layerId: string,
  colormap: string[]
): Map {
  const zarrLayers = getZarrLayers(map);
  const entry = zarrLayers[layerId];

  if (entry) {
    // Try to use setColormap if available, otherwise recreate the layer
    if (typeof entry.layer.setColormap === 'function') {
      entry.layer.setColormap(colormap);
      entry.options.colormap = colormap;
    } else if (typeof entry.layer.setProps === 'function') {
      entry.layer.setProps({ colormap });
      entry.options.colormap = colormap;
    } else {
      // Fallback: recreate the layer with new colormap
      recreateZarrLayer(map, entry, { colormap });
    }

    // Update the stored options
    const layerInfo = getLayerInfoById(map, layerId);
    if (layerInfo) {
      layerInfo.options.colormap = colormap;
    }
  }

  return map;
}

/**
 * Set the visibility of a Zarr layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param visible - Whether the layer should be visible
 */
export function setZarrLayerVisibility(map: Map, layerId: string, visible: boolean): void {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    updateLayerVisibility(map, layerId, visible);
  }
}

/**
 * Set the opacity of a Zarr layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param opacity - Opacity value (0-1)
 */
export function setZarrLayerOpacity(map: Map, layerId: string, opacity: number): void {
  const zarrLayers = getZarrLayers(map);
  const entry = zarrLayers[layerId];

  if (entry) {
    // Try to use setOpacity if available, otherwise recreate the layer
    if (typeof entry.layer.setOpacity === 'function') {
      entry.layer.setOpacity(opacity);
      entry.options.opacity = opacity;
    } else if (typeof entry.layer.setProps === 'function') {
      entry.layer.setProps({ opacity });
      entry.options.opacity = opacity;
    } else {
      // Fallback: recreate the layer with new opacity
      recreateZarrLayer(map, entry, { opacity });
    }
    updateLayerOpacity(map, layerId, opacity);
  }
}

/**
 * Remove a Zarr layer from the map.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID to remove
 */
export function removeZarrLayer(map: Map, layerId: string): Map {
  // Remove from MapLibre
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }

  // Remove from Zarr layers registry
  const zarrLayers = getZarrLayers(map);
  if (zarrLayers[layerId]) {
    delete zarrLayers[layerId];
    setZarrLayers(map, zarrLayers);
  }

  // Remove from standard registry
  removeLayerInfo(map, layerId);

  return map;
}

/**
 * Check if a layer ID corresponds to a Zarr layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID to check
 * @returns True if the layer is a Zarr layer
 */
export function isZarrLayer(map: Map, layerId: string): boolean {
  const zarrLayers = getZarrLayers(map);
  return !!zarrLayers[layerId];
}

/**
 * Get a Zarr layer entry by ID.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @returns ZarrLayerEntry or undefined
 */
export function getZarrLayerEntry(map: Map, layerId: string): ZarrLayerEntry | undefined {
  const zarrLayers = getZarrLayers(map);
  return zarrLayers[layerId];
}

/**
 * Get the Zarr layers Map for use with ZarrLayerAdapter.
 * Returns a JavaScript Map of layer ID to ZarrLayer instance.
 *
 * @param map - MapLibre map instance
 * @returns Map of Zarr layers
 */
export function getZarrLayersMap(map: Map): globalThis.Map<string, ZarrLayerInstance> {
  const zarrLayers = getZarrLayers(map);
  const layersMap = new globalThis.Map<string, ZarrLayerInstance>();
  for (const [id, entry] of Object.entries(zarrLayers)) {
    layersMap.set(id, entry.layer);
  }
  return layersMap;
}
