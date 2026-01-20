/**
 * COG Layer Adapter for integrating deck.gl COG layers with maplibre-gl-layer-control.
 */

import type { CustomLayerAdapter, LayerState } from 'maplibre-gl-layer-control';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Layer } from '@deck.gl/core';
import { getDeckLayers, setDeckLayerVisibility, setDeckLayerOpacity } from './deck-overlay';

interface DeckLayerEntry {
  id: string;
  layer: Layer;
  visible: boolean;
  opacity: number;
  name?: string;
}

/**
 * Adapter for COG (Cloud Optimized GeoTIFF) layers.
 * Allows the layer control to manage deck.gl COG layers.
 */
export class COGLayerAdapter implements CustomLayerAdapter {
  readonly type = 'cog';

  private map: MapLibreMap;
  private changeCallbacks: Array<(event: 'add' | 'remove', layerId: string) => void> = [];

  constructor(map: MapLibreMap) {
    this.map = map;
  }

  /**
   * Get all COG layer IDs.
   */
  getLayerIds(): string[] {
    const layers = getDeckLayers(this.map);
    return Object.keys(layers);
  }

  /**
   * Get the state of a COG layer.
   */
  getLayerState(layerId: string): LayerState | null {
    const layers = getDeckLayers(this.map);
    const entry = layers[layerId] as DeckLayerEntry | undefined;
    if (!entry) return null;

    return {
      visible: entry.visible,
      opacity: entry.opacity,
      name: this.getName(layerId),
    };
  }

  /**
   * Set visibility of a COG layer.
   */
  setVisibility(layerId: string, visible: boolean): void {
    setDeckLayerVisibility(this.map, layerId, visible);
  }

  /**
   * Set opacity of a COG layer.
   */
  setOpacity(layerId: string, opacity: number): void {
    setDeckLayerOpacity(this.map, layerId, opacity);
  }

  /**
   * Get the display name for a COG layer.
   */
  getName(layerId: string): string {
    // Get the stored name from the layer entry
    const layers = getDeckLayers(this.map);
    const entry = layers[layerId] as DeckLayerEntry | undefined;
    if (entry?.name) {
      return entry.name;
    }
    // Fallback: convert layer ID to a friendly name
    return layerId
      .replace(/^(mgl-extend-)?cog[-_]?/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()) || 'COG Layer';
  }

  /**
   * Get the symbol type for COG layers.
   */
  getSymbolType(): string {
    return 'raster';
  }

  /**
   * Notify that a layer was added.
   * Call this when a COG layer is added.
   */
  notifyLayerAdded(layerId: string): void {
    this.changeCallbacks.forEach(cb => cb('add', layerId));
  }

  /**
   * Notify that a layer was removed.
   * Call this when a COG layer is removed.
   */
  notifyLayerRemoved(layerId: string): void {
    this.changeCallbacks.forEach(cb => cb('remove', layerId));
  }

  /**
   * Subscribe to layer changes.
   */
  onLayerChange(callback: (event: 'add' | 'remove', layerId: string) => void): () => void {
    this.changeCallbacks.push(callback);
    return () => {
      const idx = this.changeCallbacks.indexOf(callback);
      if (idx >= 0) {
        this.changeCallbacks.splice(idx, 1);
      }
    };
  }
}

export default COGLayerAdapter;
