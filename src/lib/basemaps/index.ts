import type { Map } from 'maplibre-gl';
import { basemaps } from './catalog';
import type { BasemapName, BasemapDefinition } from './types';

export { basemaps } from './catalog';
export type { BasemapName, BasemapDefinition, BasemapCatalog } from './types';

// Store for tracking current basemap per map instance
const currentBasemapMap = new WeakMap<Map, BasemapName | null>();
const BASEMAP_SOURCE_ID = '__maplibre-extend-basemap';
const BASEMAP_LAYER_ID = '__maplibre-extend-basemap-layer';

/**
 * Get all available basemap names.
 *
 * @returns Array of basemap names
 */
export function getBasemapNames(): BasemapName[] {
  return Object.keys(basemaps) as BasemapName[];
}

/**
 * Get basemap definition by name.
 *
 * @param name - Basemap name
 * @returns Basemap definition or undefined
 */
export function getBasemapDefinition(
  name: BasemapName
): BasemapDefinition | undefined {
  return basemaps[name];
}

/**
 * Build tile URL from basemap definition, handling subdomains.
 *
 * @param definition - Basemap definition
 * @returns Array of tile URLs
 */
function buildTileUrls(definition: BasemapDefinition): string[] {
  const { url, subdomains } = definition;

  if (subdomains) {
    // Generate URLs for each subdomain
    return subdomains.split('').map((s) =>
      url
        .replace('{s}', s)
        .replace('{r}', typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : '')
    );
  }

  // Single URL without subdomains
  return [url.replace('{r}', typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : '')];
}

/**
 * Add a basemap layer to the map. This adds the basemap as the bottom layer.
 *
 * @param map - MapLibre map instance
 * @param name - Basemap name
 * @returns The map instance for chaining
 */
export function addBasemap(map: Map, name: BasemapName): Map {
  const definition = getBasemapDefinition(name);
  if (!definition) {
    throw new Error(
      `Unknown basemap: ${name}. Available basemaps: ${getBasemapNames().join(', ')}`
    );
  }

  // Remove existing basemap if present
  removeBasemap(map);

  // Add the basemap source
  map.addSource(BASEMAP_SOURCE_ID, {
    type: 'raster',
    tiles: buildTileUrls(definition),
    tileSize: definition.tileSize || 256,
    attribution: definition.attribution,
    minzoom: definition.minZoom || 0,
    maxzoom: definition.maxZoom || 22,
  });

  // Add the basemap layer at the bottom
  const layers = map.getStyle()?.layers || [];
  const firstLayerId = layers.length > 0 ? layers[0].id : undefined;

  map.addLayer(
    {
      id: BASEMAP_LAYER_ID,
      type: 'raster',
      source: BASEMAP_SOURCE_ID,
      paint: {
        'raster-opacity': 1,
      },
    },
    firstLayerId
  );

  // Track current basemap
  currentBasemapMap.set(map, name);

  return map;
}

/**
 * Set (replace) the basemap. Alias for addBasemap.
 *
 * @param map - MapLibre map instance
 * @param name - Basemap name
 * @returns The map instance for chaining
 */
export function setBasemap(map: Map, name: BasemapName): Map {
  return addBasemap(map, name);
}

/**
 * Remove the current basemap layer and source.
 *
 * @param map - MapLibre map instance
 */
function removeBasemap(map: Map): void {
  if (map.getLayer(BASEMAP_LAYER_ID)) {
    map.removeLayer(BASEMAP_LAYER_ID);
  }
  if (map.getSource(BASEMAP_SOURCE_ID)) {
    map.removeSource(BASEMAP_SOURCE_ID);
  }
  currentBasemapMap.set(map, null);
}

/**
 * Get the current basemap name.
 *
 * @param map - MapLibre map instance
 * @returns Current basemap name or null
 */
export function getBasemap(map: Map): BasemapName | null {
  return currentBasemapMap.get(map) || null;
}
