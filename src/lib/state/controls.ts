import type { Map, IControl } from 'maplibre-gl';
import type {
  ControlInfo,
  ControlPosition,
  SerializableControlInfo,
} from './types';
import { generateControlId } from '../utils';

const CONTROL_REGISTRY_KEY = '__maplibreExtendControls';

/**
 * Control registry stored on the map instance.
 */
interface ControlRegistry {
  [controlId: string]: ControlInfo;
}

/**
 * Get the control registry for a map instance.
 *
 * @param map - MapLibre map instance
 * @returns Control registry
 */
export function getControlRegistry(map: Map): ControlRegistry {
  return (
    (map as unknown as Record<string, ControlRegistry>)[CONTROL_REGISTRY_KEY] ||
    {}
  );
}

/**
 * Store control info in the registry and add the control to the map.
 *
 * @param map - MapLibre map instance
 * @param control - Control instance to add
 * @param position - Position on the map
 * @param type - Control type name (e.g., 'NavigationControl')
 * @param options - Options used to create the control
 * @returns Generated control ID
 */
export function storeControlInfo(
  map: Map,
  control: IControl,
  position: ControlPosition = 'top-right',
  type: string = 'unknown',
  options?: Record<string, unknown>
): string {
  const id = generateControlId(type.toLowerCase());
  const registry = getControlRegistry(map);

  registry[id] = {
    id,
    type,
    position,
    options,
    instance: control,
  };

  (map as unknown as Record<string, ControlRegistry>)[CONTROL_REGISTRY_KEY] =
    registry;

  // Add the control to the map
  map.addControl(control, position);

  return id;
}

/**
 * Remove control info from the registry and remove the control from the map.
 *
 * @param map - MapLibre map instance
 * @param controlId - Control ID to remove
 * @returns True if control was found and removed
 */
export function removeControlInfo(map: Map, controlId: string): boolean {
  const registry = getControlRegistry(map);
  const controlInfo = registry[controlId];

  if (!controlInfo) {
    return false;
  }

  // Remove the control from the map
  map.removeControl(controlInfo.instance);

  // Remove from registry
  delete registry[controlId];
  (map as unknown as Record<string, ControlRegistry>)[CONTROL_REGISTRY_KEY] =
    registry;

  return true;
}

/**
 * Get all tracked controls (with instance references).
 *
 * @param map - MapLibre map instance
 * @returns Array of control info
 */
export function getAllTrackedControls(map: Map): ControlInfo[] {
  const registry = getControlRegistry(map);
  return Object.values(registry);
}

/**
 * Get serializable control info (without instance references) for state storage.
 *
 * @param map - MapLibre map instance
 * @returns Array of serializable control info
 */
export function getSerializableControls(map: Map): SerializableControlInfo[] {
  const registry = getControlRegistry(map);
  return Object.values(registry).map(({ id, type, position, options }) => ({
    id,
    type,
    position,
    options,
  }));
}

/**
 * Clear all tracked controls from the map.
 *
 * @param map - MapLibre map instance
 */
export function clearAllTrackedControls(map: Map): void {
  const registry = getControlRegistry(map);

  for (const controlInfo of Object.values(registry)) {
    try {
      map.removeControl(controlInfo.instance);
    } catch {
      // Control may already be removed
    }
  }

  (map as unknown as Record<string, ControlRegistry>)[CONTROL_REGISTRY_KEY] =
    {};
}

/**
 * Restore control registry from serialized state.
 * Note: This only restores the registry metadata, not the actual controls.
 * Use a controlFactory with setMapState to recreate controls.
 *
 * @param map - MapLibre map instance
 * @param controls - Serializable control info array
 * @param controlFactory - Factory function to recreate controls
 */
export function restoreControls(
  map: Map,
  controls: SerializableControlInfo[],
  controlFactory: (info: SerializableControlInfo) => IControl | null
): void {
  // Clear existing tracked controls
  clearAllTrackedControls(map);

  const registry: ControlRegistry = {};

  for (const serializedInfo of controls) {
    const control = controlFactory(serializedInfo);

    if (control) {
      // Add control to map
      map.addControl(control, serializedInfo.position);

      // Store in registry with the original ID
      registry[serializedInfo.id] = {
        id: serializedInfo.id,
        type: serializedInfo.type,
        position: serializedInfo.position,
        options: serializedInfo.options,
        instance: control,
      };
    }
  }

  (map as unknown as Record<string, ControlRegistry>)[CONTROL_REGISTRY_KEY] =
    registry;
}
