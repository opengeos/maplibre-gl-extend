/// <reference path="../../src/types.d.ts" />

import maplibregl from 'maplibre-gl';
import '../../src/index'; // Import to extend Map.prototype
import 'maplibre-gl/dist/maplibre-gl.css';
import type { BasemapName } from '../../src/lib/basemaps/types';

// Sample GeoJSON data
const sampleGeojson = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'New York' },
      geometry: {
        type: 'Point' as const,
        coordinates: [-74.006, 40.7128],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Los Angeles' },
      geometry: {
        type: 'Point' as const,
        coordinates: [-118.2437, 34.0522],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Chicago' },
      geometry: {
        type: 'Point' as const,
        coordinates: [-87.6298, 41.8781],
      },
    },
  ],
};

// Create map
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
map.addControl(new maplibregl.FullscreenControl(), 'top-right');

// DOM elements
const basemapSelect = document.getElementById('basemap-select') as HTMLSelectElement;
const addGeojsonBtn = document.getElementById('add-geojson') as HTMLButtonElement;
const addWmsBtn = document.getElementById('add-wms') as HTMLButtonElement;
const layerList = document.getElementById('layer-list') as HTMLDivElement;

// Update layer list UI
function updateLayerList(): void {
  const layers = map.getAllCustomLayers();
  layerList.innerHTML = '';

  if (layers.length === 0) {
    layerList.innerHTML = '<div style="color: #999; font-size: 12px;">No layers added</div>';
    return;
  }

  layers.forEach((layer) => {
    const item = document.createElement('div');
    item.className = 'layer-item';
    item.innerHTML = `
      <span>${layer.type}: ${layer.layerId.split('-').slice(-2, -1)[0]}</span>
      <div>
        <button class="toggle" data-layer="${layer.layerId}">
          ${layer.visible ? 'Hide' : 'Show'}
        </button>
        <button class="remove" data-layer="${layer.layerId}">X</button>
      </div>
    `;
    layerList.appendChild(item);
  });

  // Add event listeners
  layerList.querySelectorAll('.toggle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const layerId = (e.target as HTMLButtonElement).dataset.layer!;
      const layer = map.getLayerInfo(layerId);
      if (layer) {
        map.setLayerVisibility(layerId, !layer.visible);
        updateLayerList();
      }
    });
  });

  layerList.querySelectorAll('.remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const layerId = (e.target as HTMLButtonElement).dataset.layer!;
      map.removeLayerById(layerId);
      updateLayerList();
    });
  });
}

// Handle basemap selection
basemapSelect.addEventListener('change', () => {
  const value = basemapSelect.value as BasemapName;
  if (value) {
    map.setBasemap(value);
    console.log(`Basemap changed to: ${value}`);
  }
});

// Handle add GeoJSON button
addGeojsonBtn.addEventListener('click', async () => {
  await map.addGeojson(sampleGeojson, {
    circleColor: '#ff6b6b',
    circleRadius: 8,
    circleStrokeColor: '#ffffff',
    circleStrokeWidth: 2,
    fitBounds: true,
  });
  updateLayerList();
  console.log('GeoJSON layer added');
});

// Handle add WMS button
addWmsBtn.addEventListener('click', () => {
  map.addWmsLayer('https://nowcoast.noaa.gov/geoserver/observations/weather/surface/wms', {
    layers: 'metar_stations',
    transparent: true,
    opacity: 0.7,
  });
  updateLayerList();
  console.log('WMS layer added');
});

// Initialize when map loads
map.on('load', () => {
  // Set initial basemap
  map.setBasemap('CartoDB.Positron');
  basemapSelect.value = 'CartoDB.Positron';

  updateLayerList();
  console.log('Map loaded with MapLibre GL Extend');
});
