/// <reference path="../../src/types.d.ts" />

import maplibregl from 'maplibre-gl';
import '../../src/index'; // Import to extend Map.prototype
import { ZarrLayerAdapter, getZarrLayersMap } from '../../src/lib/layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayerControl } from 'maplibre-gl-layer-control';
import 'maplibre-gl-layer-control/style.css';
import type { ZarrLayer } from '@carbonplan/zarr-layer';

// Zarr Layer Adapter for layer control integration
let zarrAdapter: ZarrLayerAdapter;
// Local map to track Zarr layers for the adapter
const zarrLayersMap = new Map<string, ZarrLayer>();

// Colormap definitions
const colormaps: Record<string, string[]> = {
  viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
  plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
  coolwarm: ['#3b4cc0', '#6f8fcd', '#aec7e8', '#f7f7f7', '#fdb59d', '#e8866b', '#b40426'],
  rdbu: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
  greens: ['#f7fcf5', '#c7e9c0', '#74c476', '#31a354', '#006d2c'],
  blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
};

// Month names (0-indexed to match data)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
const addZarrBtn = document.getElementById('add-zarr') as HTMLButtonElement;
const monthSlider = document.getElementById('month-slider') as HTMLInputElement;
const monthValue = document.getElementById('month-value') as HTMLSpanElement;
const climMin = document.getElementById('clim-min') as HTMLInputElement;
const climMax = document.getElementById('clim-max') as HTMLInputElement;
const applyClimBtn = document.getElementById('apply-clim') as HTMLButtonElement;
const colormapSelect = document.getElementById('colormap-select') as HTMLSelectElement;
const colormapPreview = document.getElementById('colormap-preview') as HTMLDivElement;
const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;
const opacityValue = document.getElementById('opacity-value') as HTMLSpanElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const layerList = document.getElementById('layer-list') as HTMLDivElement;

// Track current Zarr layer
let currentZarrLayerId: string | null = null;

// Set status
function setStatus(message: string, type: 'loading' | 'success' | 'error' | 'default' = 'default'): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

// Update colormap preview
function updateColormapPreview(colormap: string[]): void {
  colormapPreview.innerHTML = '';
  colormap.forEach((color) => {
    const div = document.createElement('div');
    div.style.backgroundColor = color;
    colormapPreview.appendChild(div);
  });
}

// Update layer list UI
function updateLayerList(): void {
  const layers = map.getAllCustomLayers();
  const zarrLayers = layers.filter(l => l.type === 'zarr');
  layerList.innerHTML = '';

  if (zarrLayers.length === 0) {
    layerList.innerHTML = '<div style="color: #999; font-size: 12px;">No Zarr layers loaded</div>';
    return;
  }

  zarrLayers.forEach((layer) => {
    const item = document.createElement('div');
    item.className = 'layer-item';
    item.innerHTML = `
      <span>${layer.layerId}</span>
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

      // Notify adapter before removal
      if (zarrAdapter) {
        zarrAdapter.notifyLayerRemoved(layerId);
      }
      zarrLayersMap.delete(layerId);

      map.removeZarrLayer(layerId);
      if (layerId === currentZarrLayerId) {
        currentZarrLayerId = null;
        disableControls();
      }
      updateLayerList();
      setStatus('Layer removed', 'success');
    });
  });
}

// Enable controls
function enableControls(): void {
  monthSlider.disabled = false;
  climMin.disabled = false;
  climMax.disabled = false;
  applyClimBtn.disabled = false;
  colormapSelect.disabled = false;
  opacitySlider.disabled = false;
}

// Disable controls
function disableControls(): void {
  monthSlider.disabled = true;
  climMin.disabled = true;
  climMax.disabled = true;
  applyClimBtn.disabled = true;
  colormapSelect.disabled = true;
  opacitySlider.disabled = true;
}

// Handle month slider
monthSlider.addEventListener('input', () => {
  const month = parseInt(monthSlider.value);
  monthValue.textContent = months[month];

  if (currentZarrLayerId) {
    map.setZarrSelector(currentZarrLayerId, { band: 'tavg', month });
  }
});

// Handle clim apply
applyClimBtn.addEventListener('click', () => {
  if (currentZarrLayerId) {
    const min = parseFloat(climMin.value);
    const max = parseFloat(climMax.value);
    map.setZarrClim(currentZarrLayerId, [min, max]);
    setStatus(`Color limits updated: ${min} to ${max}`, 'success');
  }
});

// Handle colormap change
colormapSelect.addEventListener('change', () => {
  const colormap = colormaps[colormapSelect.value];
  updateColormapPreview(colormap);

  if (currentZarrLayerId) {
    map.setZarrColormap(currentZarrLayerId, colormap);
  }
});

// Handle opacity slider
opacitySlider.addEventListener('input', () => {
  const opacity = parseInt(opacitySlider.value) / 100;
  opacityValue.textContent = `${opacitySlider.value}%`;

  if (currentZarrLayerId) {
    map.setLayerOpacity(currentZarrLayerId, opacity);
  }
});

// Handle add Zarr button
addZarrBtn.addEventListener('click', async () => {
  addZarrBtn.disabled = true;
  setStatus('Loading Zarr layer...', 'loading');

  try {
    // CarbonPlan 4D climate data - temperature and precipitation by month
    // Variable is 'climate', selector uses band ('tavg' or 'prec') and month (0-11)
    const layerId = await map.addZarrLayer(
      'https://carbonplan-maps.s3.us-west-2.amazonaws.com/v2/demo/4d/tavg-prec-month',
      {
        variable: 'climate',
        colormap: colormaps[colormapSelect.value],
        clim: [parseFloat(climMin.value), parseFloat(climMax.value)],
        opacity: parseInt(opacitySlider.value) / 100,
        selector: { band: 'tavg', month: parseInt(monthSlider.value) },
        fillValue: -9999,
        spatialDimensions: { lat: 'y', lon: 'x' },
        zarrVersion: 2,
      }
    );

    currentZarrLayerId = layerId;
    enableControls();
    updateColormapPreview(colormaps[colormapSelect.value]);

    // Sync local map and notify adapter
    const layersMapFromLib = getZarrLayersMap(map);
    const layerInstance = layersMapFromLib.get(layerId);
    if (layerInstance) {
      zarrLayersMap.set(layerId, layerInstance);
      if (zarrAdapter) {
        zarrAdapter.notifyLayerAdded(layerId);
      }
    }

    updateLayerList();
    setStatus(`Zarr layer loaded: ${layerId}`, 'success');
  } catch (error) {
    console.error('Error loading Zarr:', error);
    setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to load Zarr'}`, 'error');
  } finally {
    addZarrBtn.disabled = false;
  }
});

// Initialize when map loads
map.on('load', () => {
  // Set initial basemap
  map.setBasemap('CartoDB.DarkMatter');

  // Create Zarr layer adapter for layer control integration
  zarrAdapter = new ZarrLayerAdapter(map, zarrLayersMap);

  // Add layer control with Zarr adapter
  const layerControl = new LayerControl({
    collapsed: true,
    panelWidth: 360,
    customLayerAdapters: [zarrAdapter],
  });
  map.addControl(layerControl as unknown as maplibregl.IControl, 'top-right');

  // Initialize colormap preview
  updateColormapPreview(colormaps.rdbu);

  updateLayerList();
  setStatus('Ready to load Zarr layer');
});
