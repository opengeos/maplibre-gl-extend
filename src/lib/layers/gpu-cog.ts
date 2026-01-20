import type { Map } from 'maplibre-gl';
import { proj } from '@developmentseed/deck.gl-geotiff';
import { toProj4 } from 'geotiff-geokeys-to-proj4';
import { COGLayerWithOpacity } from './cog-layer-with-opacity';
import { addDeckLayer, setDeckLayerVisibility, setDeckLayerOpacity, removeDeckLayer } from './deck-overlay';
import { storeLayerInfo, removeLayerInfo, updateLayerVisibility, updateLayerOpacity } from './registry';
import { generateLayerId } from '../utils';
import type { AddGpuCogOptions } from './types';

// Type for GeoKeys from GeoTIFF
type GeoKeysType = Record<string, unknown>;

/**
 * Parse GeoKeys from a GeoTIFF for projection handling.
 *
 * @param geoKeys - GeoKeys from the GeoTIFF
 * @returns Projection info for deck.gl-geotiff
 */
async function geoKeysParser(
  geoKeys: GeoKeysType
): Promise<proj.ProjectionInfo> {
  // Cast to any to work around strict type checking in geotiff-geokeys-to-proj4
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projDefinition = toProj4(geoKeys as any);
  return {
    def: projDefinition.proj4,
    parsed: proj.parseCrs(projDefinition.proj4),
    coordinatesUnits: projDefinition.coordinatesUnits as 'degree' | 'meter',
  };
}

/**
 * Add a GPU-accelerated Cloud Optimized GeoTIFF (COG) layer using deck.gl.
 * This provides better performance for large COG files compared to tile-based approaches.
 *
 * @param map - MapLibre map instance
 * @param url - URL to the COG file
 * @param options - Layer options
 * @returns Promise resolving to the layer ID
 */
export async function addGpuCogLayer(
  map: Map,
  url: string,
  options: AddGpuCogOptions = {}
): Promise<string> {
  const {
    layerId = generateLayerId('gpu-cog'),
    opacity = 1,
    visible = true,
    debug = false,
    debugOpacity = 0.25,
    maxError = 0.125,
    fitBounds: shouldFitBounds = false,
  } = options;

  return new Promise((resolve, reject) => {
    try {
      const layer = new COGLayerWithOpacity({
        id: layerId,
        geotiff: url,
        opacity,
        visible,
        debug,
        debugOpacity,
        maxError,
        geoKeysParser,
        onGeoTIFFLoad: (
          _tiff: unknown,
          loadOptions: { geographicBounds: { west: number; south: number; east: number; north: number } }
        ) => {
          if (shouldFitBounds && map) {
            const { west, south, east, north } = loadOptions.geographicBounds;
            map.fitBounds(
              [
                [west, south],
                [east, north],
              ],
              { padding: 40, duration: 1000 }
            );
          }
        },
        onError: (error: Error) => {
          console.error(`Error loading COG layer ${layerId}:`, error);
          reject(error);
        },
      });

      // Add the layer to deck.gl overlay
      addDeckLayer(map, layerId, layer, visible, opacity);

      // Store in our layer registry for tracking
      storeLayerInfo(map, layerId, layerId, 'gpu-cog', {
        url,
        opacity,
        visible,
        debug,
        debugOpacity,
        maxError,
        fitBounds: shouldFitBounds,
      });

      resolve(layerId);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Set the visibility of a GPU COG layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param visible - Whether the layer should be visible
 */
export function setGpuCogLayerVisibility(map: Map, layerId: string, visible: boolean): void {
  setDeckLayerVisibility(map, layerId, visible);
  updateLayerVisibility(map, layerId, visible);
}

/**
 * Set the opacity of a GPU COG layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param opacity - Opacity value (0-1)
 */
export function setGpuCogLayerOpacity(map: Map, layerId: string, opacity: number): void {
  setDeckLayerOpacity(map, layerId, opacity);
  updateLayerOpacity(map, layerId, opacity);
}

/**
 * Remove a GPU COG layer from the map.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID to remove
 */
export function removeGpuCogLayer(map: Map, layerId: string): void {
  removeDeckLayer(map, layerId);
  removeLayerInfo(map, layerId);
}
