/**
 * Simple Zarr Layer Example
 *
 * This example demonstrates how to add a Zarr multi-dimensional data layer
 * to a MapLibre map using maplibre-gl-extend.
 */

/// <reference path="../../src/types.d.ts" />

import maplibregl from 'maplibre-gl';
import { extendMapPrototype } from '../../src/index';
import { ZarrLayerAdapter, getZarrLayersMap } from '../../src/lib/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

// Explicitly extend Map.prototype to ensure it's not tree-shaken in production builds
extendMapPrototype();
import { LayerControl } from 'maplibre-gl-layer-control';
import 'maplibre-gl-layer-control/style.css';
import type { ZarrLayer } from '@carbonplan/zarr-layer';

// Zarr Layer Adapter for layer control integration
let zarrAdapter: ZarrLayerAdapter;
// Local map to track Zarr layers for the adapter
const zarrLayersMap = new Map<string, ZarrLayer>();

// Create the map
const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {},
    layers: [],
  },
  center: [-98.5795, 39.8283], // Center of US
  zoom: 3,
});

// Add navigation controls
map.addControl(new maplibregl.NavigationControl(), 'top-right');
map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

// Red-Blue diverging colormap for temperature data
const rdbuColormap = [
  '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8',
  '#ffffbf',
  '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
];

// Initialize the map
map.on('load', async () => {
  // Set a dark basemap (works well with climate data)
  map.setBasemap('CartoDB.DarkMatter');

  // Create Zarr layer adapter for layer control integration
  zarrAdapter = new ZarrLayerAdapter(map, zarrLayersMap);

  // Add layer control with Zarr adapter
  const layerControl = new LayerControl({
    collapsed: false,
    panelWidth: 350,
    customLayerAdapters: [zarrAdapter],
  });
  map.addControl(layerControl as unknown as maplibregl.IControl, 'top-right');

  // Add a Zarr layer
  try {
    const layerId = await map.addZarrLayer(
      'https://carbonplan-maps.s3.us-west-2.amazonaws.com/v2/demo/4d/tavg-prec-month',
      {
        variable: 'climate',           // The variable name in the Zarr store
        colormap: rdbuColormap,        // Color scale for visualization
        clim: [-20, 30],               // Color limits [min, max] in degrees Celsius
        opacity: 0.8,
        selector: { band: 'tavg', month: 6 }, // Select July temperature
        fillValue: -9999,              // No-data value
        spatialDimensions: { lat: 'y', lon: 'x' },
        zarrVersion: 2,
      }
    );

    // Sync local map and notify adapter
    const layersMapFromLib = getZarrLayersMap(map);
    const layerInstance = layersMapFromLib.get(layerId);
    if (layerInstance) {
      zarrLayersMap.set(layerId, layerInstance);
      zarrAdapter.notifyLayerAdded(layerId);
    }

    // Animate through months
    let currentMonth = 6;
    setInterval(() => {
      currentMonth = (currentMonth + 1) % 12;
      map.setZarrSelector(layerId, { band: 'tavg', month: currentMonth });
    }, 2000); // Change month every 2 seconds

    // You can also control the layer:
    // map.setZarrClim(layerId, [-10, 40]);           // Change color limits
    // map.setZarrColormap(layerId, newColormap);     // Change colormap
    // map.setLayerOpacity(layerId, 0.5);             // Change opacity
    // map.setLayerVisibility(layerId, false);        // Hide the layer
    // map.removeZarrLayer(layerId);                  // Remove the layer
  } catch (error) {
    console.error('Error loading Zarr:', error);
  }
});
