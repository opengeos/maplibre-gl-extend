import type { Map, AddLayerObject } from 'maplibre-gl';
import type { GeoJSON, Feature, FeatureCollection, Geometry } from 'geojson';
import type { AddGeojsonOptions, AddVectorOptions } from './types';
import { generateLayerId, generateSourceId } from '../utils';
import { storeLayerInfo } from './registry';

/**
 * Detect the primary geometry type from GeoJSON data.
 *
 * @param data - GeoJSON data
 * @returns Detected geometry type
 */
function detectGeometryType(
  data: GeoJSON
): 'Point' | 'LineString' | 'Polygon' | 'Mixed' {
  if (data.type === 'Feature') {
    const geomType = (data as Feature).geometry?.type;
    if (geomType?.includes('Point')) return 'Point';
    if (geomType?.includes('Line')) return 'LineString';
    if (geomType?.includes('Polygon')) return 'Polygon';
  }

  if (data.type === 'FeatureCollection') {
    const fc = data as FeatureCollection;
    const types = new Set(
      fc.features.map((f) => {
        const t = f.geometry?.type;
        if (t?.includes('Point')) return 'Point';
        if (t?.includes('Line')) return 'LineString';
        if (t?.includes('Polygon')) return 'Polygon';
        return 'Mixed';
      })
    );
    if (types.size === 1) {
      return types.values().next().value as 'Point' | 'LineString' | 'Polygon';
    }
    return 'Mixed';
  }

  // Geometry object
  const geom = data as Geometry;
  if (geom.type?.includes('Point')) return 'Point';
  if (geom.type?.includes('Line')) return 'LineString';
  if (geom.type?.includes('Polygon')) return 'Polygon';

  return 'Mixed';
}

/**
 * Get default layer type based on geometry type.
 *
 * @param geometryType - Geometry type
 * @returns Default layer type
 */
function getDefaultLayerType(
  geometryType: string
): 'fill' | 'line' | 'circle' {
  switch (geometryType) {
    case 'Point':
      return 'circle';
    case 'LineString':
      return 'line';
    case 'Polygon':
      return 'fill';
    default:
      return 'fill';
  }
}

/**
 * Calculate bounding box from GeoJSON data.
 *
 * @param data - GeoJSON data
 * @returns Bounding box [west, south, east, north] or null
 */
function calculateBbox(
  data: GeoJSON
): [number, number, number, number] | null {
  try {
    // Simple bbox calculation without turf dependency
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    const processCoords = (coords: number[]): void => {
      if (coords.length >= 2) {
        minLng = Math.min(minLng, coords[0]);
        maxLng = Math.max(maxLng, coords[0]);
        minLat = Math.min(minLat, coords[1]);
        maxLat = Math.max(maxLat, coords[1]);
      }
    };

    const processGeometry = (geom: Geometry): void => {
      if (!geom) return;

      switch (geom.type) {
        case 'Point':
          processCoords(geom.coordinates as number[]);
          break;
        case 'MultiPoint':
        case 'LineString':
          (geom.coordinates as number[][]).forEach(processCoords);
          break;
        case 'MultiLineString':
        case 'Polygon':
          (geom.coordinates as number[][][]).forEach((ring) =>
            ring.forEach(processCoords)
          );
          break;
        case 'MultiPolygon':
          (geom.coordinates as number[][][][]).forEach((poly) =>
            poly.forEach((ring) => ring.forEach(processCoords))
          );
          break;
        case 'GeometryCollection':
          geom.geometries.forEach(processGeometry);
          break;
      }
    };

    if (data.type === 'Feature') {
      processGeometry((data as Feature).geometry);
    } else if (data.type === 'FeatureCollection') {
      (data as FeatureCollection).features.forEach((f) =>
        processGeometry(f.geometry)
      );
    } else {
      processGeometry(data as Geometry);
    }

    if (minLng === Infinity) return null;
    return [minLng, minLat, maxLng, maxLat];
  } catch {
    return null;
  }
}

/**
 * Add GeoJSON data to the map.
 *
 * @param map - MapLibre map instance
 * @param data - GeoJSON data (object or URL string)
 * @param options - Layer options
 * @returns The layer ID
 */
export async function addGeojson(
  map: Map,
  data: GeoJSON | string,
  options: AddGeojsonOptions = {}
): Promise<string> {
  const sourceId = options.sourceId || generateSourceId('geojson');
  const layerId = options.layerId || generateLayerId('geojson');

  // Fetch data if URL provided
  let geojsonData: GeoJSON;
  if (typeof data === 'string') {
    const response = await fetch(data);
    geojsonData = await response.json();
  } else {
    geojsonData = data;
  }

  // Detect geometry type and layer type
  const geometryType = detectGeometryType(geojsonData);
  const layerType = options.type || getDefaultLayerType(geometryType);

  // Add source
  map.addSource(sourceId, {
    type: 'geojson',
    data: geojsonData,
  });

  // Build paint properties based on layer type and options
  let paint: Record<string, unknown> = {};

  if (layerType === 'fill') {
    paint = {
      'fill-color': options.fillColor || '#3388ff',
      'fill-opacity': options.fillOpacity ?? options.opacity ?? 0.5,
    };
    if (options.lineColor) {
      paint['fill-outline-color'] = options.lineColor;
    }
  } else if (layerType === 'line') {
    paint = {
      'line-color': options.lineColor || '#3388ff',
      'line-width': options.lineWidth ?? 2,
      'line-opacity': options.opacity ?? 1,
    };
  } else if (layerType === 'circle') {
    paint = {
      'circle-color': options.circleColor || '#3388ff',
      'circle-radius': options.circleRadius ?? 6,
      'circle-opacity': options.opacity ?? 1,
      'circle-stroke-color': options.circleStrokeColor || '#ffffff',
      'circle-stroke-width': options.circleStrokeWidth ?? 1,
    };
  }

  // Override with custom paint if provided
  if (options.paint) {
    paint = { ...paint, ...options.paint };
  }

  // Add layer
  map.addLayer(
    {
      id: layerId,
      type: layerType,
      source: sourceId,
      paint,
      minzoom: options.minzoom,
      maxzoom: options.maxzoom,
    } as AddLayerObject,
    options.beforeId
  );

  // Fit bounds if requested
  if (options.fitBounds) {
    const bbox = calculateBbox(geojsonData);
    if (bbox) {
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        {
          padding: 50,
          ...options.fitBoundsOptions,
        }
      );
    }
  }

  // Store layer info for management
  storeLayerInfo(map, layerId, sourceId, 'geojson', options as Record<string, unknown>);

  return layerId;
}

/**
 * Add a vector tile source to the map.
 *
 * @param map - MapLibre map instance
 * @param url - URL to vector tiles (PMTiles, MVT, etc.)
 * @param options - Layer options
 * @returns The layer ID
 */
export function addVector(
  map: Map,
  url: string,
  options: AddVectorOptions = {}
): string {
  const sourceId = options.sourceId || generateSourceId('vector');
  const layerId = options.layerId || generateLayerId('vector');
  const layerType = options.type || 'fill';

  // Determine source type based on URL
  const isPMTiles = url.endsWith('.pmtiles');

  // Add source
  if (isPMTiles) {
    map.addSource(sourceId, {
      type: 'vector',
      url: `pmtiles://${url}`,
      attribution: options.attribution,
    });
  } else {
    map.addSource(sourceId, {
      type: 'vector',
      tiles: [url],
      minzoom: options.minzoom,
      maxzoom: options.maxzoom,
      attribution: options.attribution,
    });
  }

  // Build paint properties
  let paint: Record<string, unknown> = {};

  if (layerType === 'fill') {
    paint = {
      'fill-color': options.fillColor || '#3388ff',
      'fill-opacity': options.opacity ?? 0.5,
    };
  } else if (layerType === 'line') {
    paint = {
      'line-color': options.lineColor || '#3388ff',
      'line-width': options.lineWidth ?? 2,
      'line-opacity': options.opacity ?? 1,
    };
  } else if (layerType === 'circle') {
    paint = {
      'circle-color': options.circleColor || '#3388ff',
      'circle-radius': options.circleRadius ?? 6,
      'circle-opacity': options.opacity ?? 1,
    };
  }

  // Add layer
  map.addLayer(
    {
      id: layerId,
      type: layerType,
      source: sourceId,
      'source-layer': options.sourceLayer || '',
      paint,
      minzoom: options.minzoom,
      maxzoom: options.maxzoom,
    } as AddLayerObject,
    options.beforeId
  );

  // Store layer info
  storeLayerInfo(map, layerId, sourceId, 'vector', options as Record<string, unknown>);

  return layerId;
}
