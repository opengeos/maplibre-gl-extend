import type { Map, FitBoundsOptions } from 'maplibre-gl';
import type { LayerInfo } from './types';
import {
  removeLayerInfo,
  updateLayerVisibility,
  updateLayerOpacity,
  getAllCustomLayers as getAllLayersFromRegistry,
  getLayerInfoById,
} from './registry';
import { clamp } from '../utils';

/**
 * Remove a layer and its source by layer ID.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID to remove
 * @returns The map instance for chaining
 */
export function removeLayerById(map: Map, layerId: string): Map {
  const layerInfo = getLayerInfoById(map, layerId);

  // Remove the layer
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }

  // Remove the source if we have info about it
  if (layerInfo && map.getSource(layerInfo.sourceId)) {
    // Check if any other layers are using this source
    const allLayers = getAllLayersFromRegistry(map);
    const otherLayersUsingSameSource = allLayers.filter(
      (l) => l.sourceId === layerInfo.sourceId && l.layerId !== layerId
    );

    if (otherLayersUsingSameSource.length === 0) {
      map.removeSource(layerInfo.sourceId);
    }
  }

  // Remove from registry
  removeLayerInfo(map, layerId);

  return map;
}

/**
 * Get layer info by ID.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @returns Layer info or null
 */
export function getLayerInfo(map: Map, layerId: string): LayerInfo | null {
  return getLayerInfoById(map, layerId);
}

/**
 * Get all custom layers managed by this library.
 *
 * @param map - MapLibre map instance
 * @returns Array of layer info
 */
export function getAllCustomLayers(map: Map): LayerInfo[] {
  return getAllLayersFromRegistry(map);
}

/**
 * Set layer visibility.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param visible - Whether layer should be visible
 * @returns The map instance for chaining
 */
export function setLayerVisibility(
  map: Map,
  layerId: string,
  visible: boolean
): Map {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    updateLayerVisibility(map, layerId, visible);
  }
  return map;
}

/**
 * Set layer opacity.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param opacity - Opacity value (0-1)
 * @returns The map instance for chaining
 */
export function setLayerOpacity(
  map: Map,
  layerId: string,
  opacity: number
): Map {
  const clampedOpacity = clamp(opacity, 0, 1);
  const layer = map.getLayer(layerId);

  if (layer) {
    const layerType = layer.type;

    // Set appropriate opacity property based on layer type
    switch (layerType) {
      case 'fill':
        map.setPaintProperty(layerId, 'fill-opacity', clampedOpacity);
        break;
      case 'line':
        map.setPaintProperty(layerId, 'line-opacity', clampedOpacity);
        break;
      case 'circle':
        map.setPaintProperty(layerId, 'circle-opacity', clampedOpacity);
        break;
      case 'raster':
        map.setPaintProperty(layerId, 'raster-opacity', clampedOpacity);
        break;
      case 'symbol':
        map.setPaintProperty(layerId, 'icon-opacity', clampedOpacity);
        map.setPaintProperty(layerId, 'text-opacity', clampedOpacity);
        break;
    }

    updateLayerOpacity(map, layerId, clampedOpacity);
  }

  return map;
}

/**
 * Move a layer to the front (top of the layer stack).
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @returns The map instance for chaining
 */
export function bringLayerToFront(map: Map, layerId: string): Map {
  if (map.getLayer(layerId)) {
    map.moveLayer(layerId);
  }
  return map;
}

/**
 * Move a layer to the back (bottom of the layer stack, but above basemap).
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @returns The map instance for chaining
 */
export function sendLayerToBack(map: Map, layerId: string): Map {
  if (map.getLayer(layerId)) {
    const layers = map.getStyle()?.layers || [];
    // Find the first non-basemap layer
    const basemapLayerId = '__maplibre-extend-basemap-layer';
    const firstNonBasemapIndex = layers.findIndex(
      (l) => l.id !== basemapLayerId
    );

    if (firstNonBasemapIndex > 0) {
      const beforeId = layers[firstNonBasemapIndex].id;
      if (beforeId !== layerId) {
        map.moveLayer(layerId, beforeId);
      }
    }
  }
  return map;
}

/**
 * Fit the map bounds to a layer's extent.
 *
 * Note: This works best with GeoJSON layers. For raster/WMS layers,
 * you should provide bounds in the layer options.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param options - Fit bounds options
 * @returns The map instance for chaining
 */
export function fitToLayer(
  map: Map,
  layerId: string,
  options?: FitBoundsOptions
): Map {
  const layerInfo = getLayerInfoById(map, layerId);

  if (layerInfo) {
    // Check if bounds were stored in options
    const storedBounds = layerInfo.options.bounds as
      | [number, number, number, number]
      | undefined;
    if (storedBounds) {
      map.fitBounds(
        [
          [storedBounds[0], storedBounds[1]],
          [storedBounds[2], storedBounds[3]],
        ],
        { padding: 50, ...options }
      );
      return map;
    }

    // For GeoJSON sources, calculate bounds from data
    const source = map.getSource(layerInfo.sourceId);
    if (source && source.type === 'geojson') {
      // GeoJSON source - we can't easily get bounds without accessing internal data
      // This is a limitation; users should use fitBounds: true when adding the layer
    }
  }

  return map;
}
