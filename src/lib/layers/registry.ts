import type { Map } from 'maplibre-gl';
import type { LayerInfo } from './types';

const LAYER_REGISTRY_KEY = '__maplibreExtendLayers';

/**
 * Layer registry stored on the map instance.
 */
interface LayerRegistry {
  [layerId: string]: LayerInfo;
}

/**
 * Get the layer registry for a map instance.
 *
 * @param map - MapLibre map instance
 * @returns Layer registry
 */
export function getLayerRegistry(map: Map): LayerRegistry {
  return (map as unknown as Record<string, LayerRegistry>)[LAYER_REGISTRY_KEY] || {};
}

/**
 * Store layer info in the registry.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param sourceId - Source ID
 * @param type - Layer type
 * @param options - Original options
 */
export function storeLayerInfo(
  map: Map,
  layerId: string,
  sourceId: string,
  type: string,
  options: Record<string, unknown>
): void {
  const registry = getLayerRegistry(map);
  registry[layerId] = {
    layerId,
    sourceId,
    type,
    visible: true,
    opacity: (options.opacity as number) ?? 1,
    options,
  };
  (map as unknown as Record<string, LayerRegistry>)[LAYER_REGISTRY_KEY] = registry;
}

/**
 * Remove layer info from the registry.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID to remove
 */
export function removeLayerInfo(map: Map, layerId: string): void {
  const registry = getLayerRegistry(map);
  delete registry[layerId];
  (map as unknown as Record<string, LayerRegistry>)[LAYER_REGISTRY_KEY] = registry;
}

/**
 * Update layer visibility in the registry.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param visible - Whether layer is visible
 */
export function updateLayerVisibility(
  map: Map,
  layerId: string,
  visible: boolean
): void {
  const registry = getLayerRegistry(map);
  if (registry[layerId]) {
    registry[layerId].visible = visible;
  }
}

/**
 * Update layer opacity in the registry.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param opacity - Opacity value
 */
export function updateLayerOpacity(
  map: Map,
  layerId: string,
  opacity: number
): void {
  const registry = getLayerRegistry(map);
  if (registry[layerId]) {
    registry[layerId].opacity = opacity;
  }
}

/**
 * Get all custom layers from the registry.
 *
 * @param map - MapLibre map instance
 * @returns Array of layer info
 */
export function getAllCustomLayers(map: Map): LayerInfo[] {
  const registry = getLayerRegistry(map);
  return Object.values(registry);
}

/**
 * Get layer info by ID.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @returns Layer info or null
 */
export function getLayerInfoById(map: Map, layerId: string): LayerInfo | null {
  const registry = getLayerRegistry(map);
  return registry[layerId] || null;
}
