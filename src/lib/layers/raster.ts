import type { Map } from 'maplibre-gl';
import type { AddRasterOptions, AddCogOptions, AddWmsOptions } from './types';
import { generateLayerId, generateSourceId } from '../utils';
import { storeLayerInfo } from './registry';

/**
 * Add a raster tile layer to the map.
 *
 * @param map - MapLibre map instance
 * @param url - URL template for raster tiles (with {x}, {y}, {z} placeholders)
 * @param options - Layer options
 * @returns The layer ID
 */
export function addRaster(
  map: Map,
  url: string,
  options: AddRasterOptions = {}
): string {
  const sourceId = options.sourceId || generateSourceId('raster');
  const layerId = options.layerId || generateLayerId('raster');

  // Add source
  map.addSource(sourceId, {
    type: 'raster',
    tiles: [url],
    tileSize: options.tileSize || 256,
    attribution: options.attribution,
    bounds: options.bounds,
    minzoom: options.minzoom,
    maxzoom: options.maxzoom,
  });

  // Add layer
  map.addLayer(
    {
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': options.opacity ?? 1,
      },
      minzoom: options.minzoom,
      maxzoom: options.maxzoom,
    },
    options.beforeId
  );

  // Store layer info
  storeLayerInfo(map, layerId, sourceId, 'raster', options as Record<string, unknown>);

  return layerId;
}

/**
 * Add a Cloud Optimized GeoTIFF (COG) layer to the map.
 *
 * This method supports COGs through TiTiler or similar tile servers.
 * For native COG protocol support, the maplibre-cog-protocol package is required.
 *
 * @param map - MapLibre map instance
 * @param url - URL to the COG file
 * @param options - Layer options
 * @returns The layer ID
 */
export function addCogLayer(
  map: Map,
  url: string,
  options: AddCogOptions = {}
): string {
  const sourceId = options.sourceId || generateSourceId('cog');
  const layerId = options.layerId || generateLayerId('cog');

  // Use TiTiler endpoint if provided, otherwise construct a generic tile URL
  let tileUrl: string;
  if (options.tileServerUrl) {
    // TiTiler-style URL
    tileUrl = `${options.tileServerUrl}/cog/tiles/{z}/{x}/{y}?url=${encodeURIComponent(url)}`;
  } else {
    // Default: assume the URL is already a tile endpoint or use as-is
    // For production, users should provide a tileServerUrl
    tileUrl = url;
  }

  // Add source
  map.addSource(sourceId, {
    type: 'raster',
    tiles: [tileUrl],
    tileSize: options.tileSize || 256,
    attribution: options.attribution,
    bounds: options.bounds,
    minzoom: options.minzoom ?? 0,
    maxzoom: options.maxzoom ?? 22,
  });

  // Add layer
  map.addLayer(
    {
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': options.opacity ?? 1,
      },
      minzoom: options.minzoom,
      maxzoom: options.maxzoom,
    },
    options.beforeId
  );

  // Fit bounds if provided
  if (options.bounds) {
    map.fitBounds(
      [
        [options.bounds[0], options.bounds[1]],
        [options.bounds[2], options.bounds[3]],
      ],
      { padding: 50 }
    );
  }

  // Store layer info
  storeLayerInfo(map, layerId, sourceId, 'cog', { ...options, url } as Record<string, unknown>);

  return layerId;
}

/**
 * Add a WMS layer to the map.
 *
 * @param map - MapLibre map instance
 * @param baseUrl - Base URL of the WMS service
 * @param options - WMS layer options
 * @returns The layer ID
 */
export function addWmsLayer(
  map: Map,
  baseUrl: string,
  options: AddWmsOptions
): string {
  const sourceId = options.sourceId || generateSourceId('wms');
  const layerId = options.layerId || generateLayerId('wms');

  // Build WMS tile URL with query parameters
  const params = new URLSearchParams({
    service: 'WMS',
    version: options.version || '1.1.1',
    request: 'GetMap',
    layers: options.layers,
    format: options.format || 'image/png',
    transparent: String(options.transparent ?? true),
    srs: options.crs || 'EPSG:3857',
    width: '256',
    height: '256',
    bbox: '{bbox-epsg-3857}',
    ...options.params,
  });

  const wmsUrl = `${baseUrl}?${params.toString()}`;

  // Add source
  map.addSource(sourceId, {
    type: 'raster',
    tiles: [wmsUrl],
    tileSize: options.tileSize || 256,
    attribution: options.attribution,
    bounds: options.bounds,
  });

  // Add layer
  map.addLayer(
    {
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': options.opacity ?? 1,
      },
      minzoom: options.minzoom,
      maxzoom: options.maxzoom,
    },
    options.beforeId
  );

  // Store layer info
  storeLayerInfo(map, layerId, sourceId, 'wms', { ...options, baseUrl } as Record<string, unknown>);

  return layerId;
}
