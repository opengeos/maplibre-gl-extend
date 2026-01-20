import type { Map } from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { Layer } from '@deck.gl/core';

const DECK_OVERLAY_KEY = '__maplibreExtendDeckOverlay';
const DECK_LAYERS_KEY = '__maplibreExtendDeckLayers';

interface DeckLayerEntry {
  id: string;
  layer: Layer;
  visible: boolean;
  opacity: number;
}

/**
 * Get the deck.gl layer store for a map instance.
 *
 * @param map - MapLibre map instance
 * @returns Record of deck.gl layers
 */
export function getDeckLayers(map: Map): Record<string, DeckLayerEntry> {
  return (
    (map as unknown as Record<string, Record<string, DeckLayerEntry>>)[DECK_LAYERS_KEY] || {}
  );
}

/**
 * Set the deck.gl layer store for a map instance.
 *
 * @param map - MapLibre map instance
 * @param layers - Record of deck.gl layers
 */
function setDeckLayers(map: Map, layers: Record<string, DeckLayerEntry>): void {
  (map as unknown as Record<string, Record<string, DeckLayerEntry>>)[DECK_LAYERS_KEY] = layers;
}

/**
 * Get or create the deck.gl overlay for a map instance.
 *
 * @param map - MapLibre map instance
 * @returns MapboxOverlay instance
 */
export function getOrCreateDeckOverlay(map: Map): MapboxOverlay {
  let overlay = (map as unknown as Record<string, MapboxOverlay>)[DECK_OVERLAY_KEY];

  if (!overlay) {
    overlay = new MapboxOverlay({
      layers: [],
    });

    // Store the overlay on the map instance
    (map as unknown as Record<string, MapboxOverlay>)[DECK_OVERLAY_KEY] = overlay;

    // Add the overlay to the map
    map.addControl(overlay as unknown as maplibregl.IControl);
  }

  return overlay;
}

/**
 * Get the deck.gl overlay for a map instance (if it exists).
 *
 * @param map - MapLibre map instance
 * @returns MapboxOverlay instance or undefined
 */
export function getDeckOverlay(map: Map): MapboxOverlay | undefined {
  return (map as unknown as Record<string, MapboxOverlay>)[DECK_OVERLAY_KEY];
}

/**
 * Add a deck.gl layer to the map.
 *
 * @param map - MapLibre map instance
 * @param layerId - Unique layer ID
 * @param layer - Deck.gl layer instance
 * @param visible - Whether the layer should be visible
 * @param opacity - Layer opacity (0-1)
 */
export function addDeckLayer(
  map: Map,
  layerId: string,
  layer: Layer,
  visible: boolean = true,
  opacity: number = 1
): void {
  // Ensure overlay is created
  getOrCreateDeckOverlay(map);
  const layers = getDeckLayers(map);

  // Store the layer entry
  layers[layerId] = {
    id: layerId,
    layer,
    visible,
    opacity,
  };
  setDeckLayers(map, layers);

  // Update the overlay
  updateDeckOverlay(map);
}

/**
 * Remove a deck.gl layer from the map.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID to remove
 */
export function removeDeckLayer(map: Map, layerId: string): void {
  const layers = getDeckLayers(map);

  if (layers[layerId]) {
    delete layers[layerId];
    setDeckLayers(map, layers);
    updateDeckOverlay(map);
  }
}

/**
 * Set the visibility of a deck.gl layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param visible - Whether the layer should be visible
 */
export function setDeckLayerVisibility(map: Map, layerId: string, visible: boolean): void {
  const layers = getDeckLayers(map);
  const entry = layers[layerId];

  if (entry && typeof entry.layer.clone === 'function') {
    // Clone the layer with updated visibility
    const updatedLayer = entry.layer.clone({ visible });
    layers[layerId] = {
      ...entry,
      layer: updatedLayer,
      visible,
    };
    updateDeckOverlay(map);
  }
}

/**
 * Set the opacity of a deck.gl layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @param opacity - Opacity value (0-1)
 */
export function setDeckLayerOpacity(map: Map, layerId: string, opacity: number): void {
  const layers = getDeckLayers(map);
  const entry = layers[layerId];

  if (entry && typeof entry.layer.clone === 'function') {
    // Clone the layer with updated opacity
    const updatedLayer = entry.layer.clone({ opacity });
    layers[layerId] = {
      ...entry,
      layer: updatedLayer,
      opacity,
    };
    updateDeckOverlay(map);
  }
}

/**
 * Update the deck.gl overlay with current layers.
 *
 * @param map - MapLibre map instance
 */
export function updateDeckOverlay(map: Map): void {
  const overlay = getDeckOverlay(map);
  if (!overlay) return;

  const layers = getDeckLayers(map);
  const allLayers = Object.values(layers).map(entry => entry.layer);

  // Update the overlay with all layers
  overlay.setProps({ layers: allLayers });
  map.triggerRepaint();
}

/**
 * Check if a layer ID corresponds to a deck.gl layer.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID to check
 * @returns True if the layer is a deck.gl layer
 */
export function isDeckLayer(map: Map, layerId: string): boolean {
  const layers = getDeckLayers(map);
  return !!layers[layerId];
}

/**
 * Get a deck.gl layer entry by ID.
 *
 * @param map - MapLibre map instance
 * @param layerId - Layer ID
 * @returns DeckLayerEntry or undefined
 */
export function getDeckLayerEntry(map: Map, layerId: string): DeckLayerEntry | undefined {
  const layers = getDeckLayers(map);
  return layers[layerId];
}
