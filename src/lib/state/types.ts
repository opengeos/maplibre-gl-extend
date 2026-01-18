import type {
  StyleSpecification,
  TerrainSpecification,
  SkySpecification,
  ProjectionSpecification,
  IControl,
} from 'maplibre-gl';
import type { BasemapName } from '../basemaps/types';
import type { LayerInfo } from '../layers/types';

/**
 * Camera state including position and orientation.
 */
export interface CameraState {
  /** Map center coordinates [lng, lat] */
  center: [number, number];
  /** Zoom level */
  zoom: number;
  /** Bearing in degrees */
  bearing: number;
  /** Pitch in degrees */
  pitch: number;
  /** Padding in pixels */
  padding?: { top: number; bottom: number; left: number; right: number };
}

/**
 * Control position on the map.
 */
export type ControlPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Information about a tracked control (with instance reference).
 */
export interface ControlInfo {
  /** Unique identifier for the control */
  id: string;
  /** Control type name (e.g., 'NavigationControl', 'ScaleControl') */
  type: string;
  /** Position on the map */
  position: ControlPosition;
  /** Options used to create the control */
  options?: Record<string, unknown>;
  /** Reference to the actual control instance */
  instance: IControl;
}

/**
 * Serializable control info (without instance reference) for state storage.
 */
export interface SerializableControlInfo {
  /** Unique identifier for the control */
  id: string;
  /** Control type name */
  type: string;
  /** Position on the map */
  position: ControlPosition;
  /** Options used to create the control */
  options?: Record<string, unknown>;
}

/**
 * Complete map state for serialization and restoration.
 */
export interface MapState {
  /** Version number for future migration support */
  version: number;
  /** Timestamp when state was captured */
  timestamp: number;
  /** Camera state */
  camera: CameraState;
  /** Full style specification */
  style: StyleSpecification;
  /** Terrain configuration */
  terrain: TerrainSpecification | null;
  /** Sky configuration */
  sky: SkySpecification | null;
  /** Map projection */
  projection: ProjectionSpecification;
  /** Current basemap name (from maplibre-gl-extend) */
  basemap: BasemapName | null;
  /** Custom layers managed by maplibre-gl-extend */
  customLayers: LayerInfo[];
  /** Tracked controls */
  controls?: SerializableControlInfo[];
  /** User-provided metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Options for capturing map state.
 */
export interface GetMapStateOptions {
  /** Include camera state (default: true) */
  includeCamera?: boolean;
  /** Include style specification (default: true) */
  includeStyle?: boolean;
  /** Include terrain configuration (default: true) */
  includeTerrain?: boolean;
  /** Include sky configuration (default: true) */
  includeSky?: boolean;
  /** Include projection (default: true) */
  includeProjection?: boolean;
  /** Include tracked controls (default: true) */
  includeControls?: boolean;
  /** Include custom layers registry (default: true) */
  includeCustomLayers?: boolean;
  /** Custom metadata to include in state */
  metadata?: Record<string, unknown>;
}

/**
 * Options for restoring map state.
 */
export interface SetMapStateOptions {
  /** Restore camera state (default: true) */
  restoreCamera?: boolean;
  /** Restore style (default: true) */
  restoreStyle?: boolean;
  /** Restore terrain configuration (default: true) */
  restoreTerrain?: boolean;
  /** Restore sky configuration (default: true) */
  restoreSky?: boolean;
  /** Restore projection (default: true) */
  restoreProjection?: boolean;
  /** Restore tracked controls (default: false, requires controlFactory) */
  restoreControls?: boolean;
  /** Factory function to recreate controls from serialized info */
  controlFactory?: (info: SerializableControlInfo) => IControl | null;
  /** Camera animation options */
  cameraAnimation?: {
    /** Whether to animate camera transition (default: false) */
    animate?: boolean;
    /** Animation duration in milliseconds (default: 1000) */
    duration?: number;
  };
  /** Callback when restoration is complete */
  onComplete?: () => void;
  /** Callback when an error occurs during restoration */
  onError?: (error: Error) => void;
}
