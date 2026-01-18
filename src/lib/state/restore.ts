import type { Map } from 'maplibre-gl';
import type { MapState, SetMapStateOptions } from './types';
import { setBasemap } from '../basemaps';
import { restoreControls, clearAllTrackedControls } from './controls';
import { storeLayerInfo, getLayerRegistry } from '../layers/registry';

/**
 * Restore map state from a saved state object.
 *
 * @param map - MapLibre map instance
 * @param state - Saved map state
 * @param options - Options for what to restore
 * @returns Promise that resolves when restoration is complete
 */
export async function setMapState(
  map: Map,
  state: MapState,
  options: SetMapStateOptions = {}
): Promise<void> {
  const {
    restoreCamera = true,
    restoreStyle = true,
    restoreTerrain = true,
    restoreSky = true,
    restoreProjection = true,
    restoreControls: shouldRestoreControls = false,
    controlFactory,
    cameraAnimation = { animate: false, duration: 1000 },
    onComplete,
    onError,
  } = options;

  try {
    // 1. Restore style (this must be first and we wait for it to load)
    if (restoreStyle && state.style) {
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Style load timeout'));
        }, 30000); // 30 second timeout

        const onStyleLoad = () => {
          clearTimeout(timeoutId);
          map.off('style.load', onStyleLoad);
          resolve();
        };

        map.on('style.load', onStyleLoad);
        map.setStyle(state.style);
      });
    }

    // 2. Restore basemap (if using our basemap system)
    if (state.basemap) {
      setBasemap(map, state.basemap);
    }

    // 3. Restore projection
    if (restoreProjection && state.projection) {
      map.setProjection(state.projection);
    }

    // 4. Restore terrain
    if (restoreTerrain) {
      if (state.terrain) {
        map.setTerrain(state.terrain);
      } else {
        map.setTerrain(null);
      }
    }

    // 5. Restore sky
    if (restoreSky) {
      if (state.sky) {
        map.setSky(state.sky);
      } else {
        // Clear sky by setting empty object
        map.setSky({} as Parameters<typeof map.setSky>[0]);
      }
    }

    // 6. Restore camera
    if (restoreCamera && state.camera) {
      const cameraOptions = {
        center: state.camera.center as [number, number],
        zoom: state.camera.zoom,
        bearing: state.camera.bearing,
        pitch: state.camera.pitch,
        padding: state.camera.padding,
      };

      if (cameraAnimation.animate) {
        await new Promise<void>((resolve) => {
          map.once('moveend', () => resolve());
          map.flyTo({
            ...cameraOptions,
            duration: cameraAnimation.duration ?? 1000,
          });
        });
      } else {
        map.jumpTo(cameraOptions);
      }
    }

    // 7. Restore layer registry metadata
    if (state.customLayers && state.customLayers.length > 0) {
      restoreLayerRegistry(map, state);
    }

    // 8. Restore controls
    if (shouldRestoreControls && state.controls && state.controls.length > 0) {
      if (!controlFactory) {
        console.warn(
          'restoreControls is true but no controlFactory provided. Controls will not be restored.'
        );
      } else {
        restoreControls(map, state.controls, controlFactory);
      }
    } else if (!shouldRestoreControls) {
      // Clear tracked controls if not restoring them
      clearAllTrackedControls(map);
    }

    onComplete?.();
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

/**
 * Restore the layer registry metadata from state.
 * Note: The actual layers are restored via setStyle, this just restores
 * our tracking registry for layers we manage.
 *
 * @param map - MapLibre map instance
 * @param state - Map state containing customLayers
 */
function restoreLayerRegistry(map: Map, state: MapState): void {
  // Clear existing registry
  const registry = getLayerRegistry(map);
  for (const key of Object.keys(registry)) {
    delete registry[key];
  }

  // Restore layer info for layers that still exist in the style
  for (const layerInfo of state.customLayers) {
    // Verify the layer still exists in the map
    if (map.getLayer(layerInfo.layerId)) {
      storeLayerInfo(
        map,
        layerInfo.layerId,
        layerInfo.sourceId,
        layerInfo.type,
        layerInfo.options
      );
    }
  }
}
