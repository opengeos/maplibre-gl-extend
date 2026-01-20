/// <reference path="../../src/types.d.ts" />

import maplibregl from 'maplibre-gl';
import '../../src/index'; // Import to extend Map.prototype
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayerControl } from 'maplibre-gl-layer-control';
import 'maplibre-gl-layer-control/style.css';

// Create map
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
map.addControl(new maplibregl.FullscreenControl(), 'top-right');

// DOM elements
const cogSelect = document.getElementById('cog-select') as HTMLSelectElement;
const addCogBtn = document.getElementById('add-cog') as HTMLButtonElement;
const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;
const opacityValue = document.getElementById('opacity-value') as HTMLSpanElement;
const fitBoundsCheckbox = document.getElementById('fit-bounds') as HTMLInputElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const layerList = document.getElementById('layer-list') as HTMLDivElement;

// Track current COG layer
let currentCogLayerId: string | null = null;

// Set status
function setStatus(message: string, type: 'loading' | 'success' | 'error' | 'default' = 'default'): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

// Update layer list UI
function updateLayerList(): void {
  const layers = map.getAllCustomLayers();
  const cogLayers = layers.filter(l => l.type === 'gpu-cog');
  layerList.innerHTML = '';

  if (cogLayers.length === 0) {
    layerList.innerHTML = '<div style="color: #999; font-size: 12px;">No COG layers loaded</div>';
    return;
  }

  cogLayers.forEach((layer) => {
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
      map.removeLayerById(layerId);
      if (layerId === currentCogLayerId) {
        currentCogLayerId = null;
        opacitySlider.disabled = true;
      }
      updateLayerList();
      setStatus('Layer removed', 'success');
    });
  });
}

// Enable/disable add button based on selection
cogSelect.addEventListener('change', () => {
  addCogBtn.disabled = !cogSelect.value;
});

// Handle opacity slider
opacitySlider.addEventListener('input', () => {
  const opacity = parseInt(opacitySlider.value) / 100;
  opacityValue.textContent = `${opacitySlider.value}%`;

  if (currentCogLayerId) {
    map.setLayerOpacity(currentCogLayerId, opacity);
  }
});

// Handle add COG button
addCogBtn.addEventListener('click', async () => {
  const url = cogSelect.value;
  if (!url) return;

  addCogBtn.disabled = true;
  setStatus('Loading COG layer...', 'loading');

  try {
    const layerId = await map.addGpuCogLayer(url, {
      opacity: parseInt(opacitySlider.value) / 100,
      fitBounds: fitBoundsCheckbox.checked,
      debug: false,
    });

    currentCogLayerId = layerId;
    opacitySlider.disabled = false;
    updateLayerList();
    setStatus(`COG layer loaded: ${layerId}`, 'success');
    console.log('GPU COG layer added:', layerId);
  } catch (error) {
    console.error('Error loading COG:', error);
    setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to load COG'}`, 'error');
  } finally {
    addCogBtn.disabled = false;
  }
});

// Initialize when map loads
map.on('load', () => {
  // Set initial basemap
  map.setBasemap('CartoDB.Positron');

  // Add layer control
  const layerControl = new LayerControl({
    collapsed: true,
    panelWidth: 360,
  });
  map.addControl(layerControl as unknown as maplibregl.IControl, 'top-left');

  updateLayerList();
  setStatus('Ready to load COG layer');
  console.log('Map loaded with GPU COG layer support');
});
