import type { Map, StyleSpecification, ProjectionSpecification } from 'maplibre-gl';
import type { CameraState, GetMapStateOptions, MapState } from './types';
import { getBasemap } from '../basemaps';
import { getAllCustomLayers } from '../layers/registry';
import { getSerializableControls } from './controls';

/** Current state version for migration support */
const STATE_VERSION = 1;

/**
 * Capture camera state from the map.
 *
 * @param map - MapLibre map instance
 * @returns Camera state object
 */
function captureCamera(map: Map): CameraState {
  const center = map.getCenter();
  const padding = map.getPadding();

  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    padding: {
      top: padding.top ?? 0,
      bottom: padding.bottom ?? 0,
      left: padding.left ?? 0,
      right: padding.right ?? 0,
    },
  };
}

/**
 * Capture the complete map state.
 *
 * @param map - MapLibre map instance
 * @param options - Options for what to include in state
 * @returns Complete map state object
 */
export function getMapState(
  map: Map,
  options: GetMapStateOptions = {}
): MapState {
  const {
    includeCamera = true,
    includeStyle = true,
    includeTerrain = true,
    includeSky = true,
    includeProjection = true,
    includeControls = true,
    includeCustomLayers = true,
    metadata,
  } = options;

  // Get style - this includes sources and layers
  const style = includeStyle
    ? (map.getStyle() as StyleSpecification)
    : ({
        version: 8,
        sources: {},
        layers: [],
      } as StyleSpecification);

  // Get camera state
  const camera: CameraState = includeCamera
    ? captureCamera(map)
    : {
        center: [0, 0],
        zoom: 0,
        bearing: 0,
        pitch: 0,
      };

  // Get terrain
  const terrain = includeTerrain ? map.getTerrain() : null;

  // Get sky
  const sky = includeSky ? map.getSky() : null;

  // Get projection
  const projection: ProjectionSpecification = includeProjection
    ? map.getProjection()
    : { type: 'mercator' };

  // Get basemap from our registry
  const basemap = getBasemap(map);

  // Get custom layers from our registry
  const customLayers = includeCustomLayers ? getAllCustomLayers(map) : [];

  // Get tracked controls
  const controls = includeControls ? getSerializableControls(map) : [];

  return {
    version: STATE_VERSION,
    timestamp: Date.now(),
    camera,
    style,
    terrain,
    sky,
    projection,
    basemap,
    customLayers,
    controls,
    metadata,
  };
}
