/**
 * Simple COG Layer Example
 *
 * This example demonstrates how to add a GPU-accelerated Cloud Optimized GeoTIFF (COG)
 * layer to a MapLibre map using maplibre-gl-extend.
 */

/// <reference path="../../src/types.d.ts" />

import maplibregl from 'maplibre-gl';
import { extendMapPrototype } from '../../src/index';
import { COGLayerAdapter } from '../../src/lib/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

// Explicitly extend Map.prototype to ensure it's not tree-shaken in production builds
extendMapPrototype();
import { LayerControl } from 'maplibre-gl-layer-control';
import 'maplibre-gl-layer-control/style.css';

// COG Layer Adapter for layer control integration
let cogAdapter: COGLayerAdapter;

// Create the map
const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {},
    layers: [],
  },
  center: [-98.5795, 39.8283], // Center of US
  zoom: 4,
});

// Add navigation controls
map.addControl(new maplibregl.NavigationControl(), 'top-right');
map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

// Initialize the map
map.on('load', async () => {
  // Set a basemap
  map.setBasemap('CartoDB.Positron');

  // Create COG layer adapter for layer control integration
  cogAdapter = new COGLayerAdapter(map);

  // Add layer control with COG adapter
  const layerControl = new LayerControl({
    collapsed: false,
    panelWidth: 350,
    customLayerAdapters: [cogAdapter],
  });
  map.addControl(layerControl as unknown as maplibregl.IControl, 'top-right');

  // Add a COG layer
  try {
    const layerId = await map.addCogLayer(
      'https://s3.us-east-1.amazonaws.com/ds-deck.gl-raster-public/cog/Annual_NLCD_LndCov_2024_CU_C1V1.tif',
      {
        opacity: 0.8,
        fitBounds: true, // Automatically zoom to the COG extent
        debug: false,
      }
    );

    // Notify the adapter that a layer was added
    cogAdapter.notifyLayerAdded(layerId);

    // You can control the layer after it's added:
    // map.setLayerVisibility(layerId, false); // Hide the layer
    // map.setLayerOpacity(layerId, 0.5);      // Change opacity
    // map.removeLayerById(layerId);           // Remove the layer
  } catch (error) {
    console.error('Error loading COG:', error);
  }
});
