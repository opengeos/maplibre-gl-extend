# maplibre-gl-extend

Extended functionality for MapLibre GL JS with convenient methods for basemaps, GeoJSON, COG, and WMS layers.

[![npm version](https://badge.fury.io/js/maplibre-gl-extend.svg)](https://www.npmjs.com/package/maplibre-gl-extend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Basemap Support**: 35+ free basemap providers including OpenStreetMap, CartoDB, Esri, Google, Stadia, USGS, and more
- **GeoJSON Layers**: Easy-to-use methods for adding GeoJSON data with auto-detection of geometry types
- **Raster Layers**: Support for XYZ tile layers, WMS services, and Cloud Optimized GeoTIFFs (COG)
- **Layer Management**: Toggle visibility, adjust opacity, reorder layers, and more
- **Map State**: Capture and restore complete map state (camera, style, terrain, sky, layers, controls)
- **TypeScript First**: Full TypeScript support with module augmentation for type-safe Map methods
- **React Integration**: Context provider and hooks for easy React integration

## Installation

```bash
npm install maplibre-gl-extend maplibre-gl
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl-extend'; // Extends Map.prototype
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: 'map',
  style: { version: 8, sources: {}, layers: [] },
  center: [0, 0],
  zoom: 2,
});

map.on('load', async () => {
  // Add a basemap
  map.setBasemap('CartoDB.Positron');

  // Add GeoJSON data
  await map.addGeojson('https://example.com/data.geojson', {
    circleColor: '#ff6b6b',
    circleRadius: 8,
    fitBounds: true,
  });

  // Add a WMS layer
  map.addWmsLayer('https://example.com/wms', {
    layers: 'layer_name',
    transparent: true,
    opacity: 0.7,
  });

  // Toggle layer visibility
  const layers = map.getAllCustomLayers();
  map.setLayerVisibility(layers[0].layerId, false);
});
```

### React

```tsx
import { useState, useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import { MapExtendProvider, useMapExtend } from 'maplibre-gl-extend/react';
import 'maplibre-gl/dist/maplibre-gl.css';

function MapControls() {
  const { setBasemap, addGeojsonLayer, layers, toggleLayerVisibility } = useMapExtend();

  return (
    <div>
      <select onChange={(e) => setBasemap(e.target.value)}>
        <option value="CartoDB.Positron">Light</option>
        <option value="CartoDB.DarkMatter">Dark</option>
        <option value="Esri.WorldImagery">Satellite</option>
      </select>

      <button onClick={() => addGeojsonLayer(geojsonData)}>
        Add Layer
      </button>

      {layers.map((layer) => (
        <button
          key={layer.layerId}
          onClick={() => toggleLayerVisibility(layer.layerId)}
        >
          {layer.visible ? 'Hide' : 'Show'} {layer.layerId}
        </button>
      ))}
    </div>
  );
}

function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapRef.current,
      style: { version: 8, sources: {}, layers: [] },
    });

    mapInstance.on('load', () => {
      mapInstance.setBasemap('CartoDB.Voyager');
      setMap(mapInstance);
    });

    return () => mapInstance.remove();
  }, []);

  return (
    <MapExtendProvider map={map}>
      <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
      {map && <MapControls />}
    </MapExtendProvider>
  );
}
```

## API Reference

### Basemap Methods

```typescript
// Add or replace the basemap
map.setBasemap('CartoDB.DarkMatter');
map.addBasemap('Esri.WorldImagery'); // Alias for setBasemap

// Get current basemap
const current = map.getBasemap(); // 'CartoDB.DarkMatter' | null
```

### Available Basemaps

| Provider | Basemaps |
|----------|----------|
| OpenStreetMap | `OpenStreetMap.Mapnik`, `OpenStreetMap.HOT`, `OpenStreetMap.DE`, `OpenStreetMap.France` |
| CartoDB | `CartoDB.Positron`, `CartoDB.DarkMatter`, `CartoDB.Voyager` (+ NoLabels/OnlyLabels variants) |
| Esri | `Esri.WorldStreetMap`, `Esri.WorldImagery`, `Esri.WorldTopoMap`, `Esri.WorldTerrain`, `Esri.NatGeoWorldMap`, and more |
| Google | `Google.Streets`, `Google.Satellite`, `Google.Hybrid`, `Google.Terrain` |
| Stadia | `Stadia.AlidadeSmooth`, `Stadia.AlidadeSmoothDark`, `Stadia.StamenToner`, `Stadia.StamenWatercolor`, `Stadia.StamenTerrain` |
| USGS | `USGS.USTopo`, `USGS.USImagery`, `USGS.USImageryTopo` |
| Other | `OpenTopoMap` |

### GeoJSON Methods

```typescript
// Add GeoJSON data (object or URL)
const layerId = await map.addGeojson(geojsonData, {
  // Layer type (auto-detected if not provided)
  type: 'circle', // 'fill' | 'line' | 'circle'

  // Styling
  fillColor: '#3388ff',
  fillOpacity: 0.5,
  lineColor: '#3388ff',
  lineWidth: 2,
  circleColor: '#3388ff',
  circleRadius: 6,
  circleStrokeColor: '#ffffff',
  circleStrokeWidth: 1,

  // Behavior
  fitBounds: true,
  opacity: 0.8,
  minzoom: 0,
  maxzoom: 22,
});
```

### Raster Methods

```typescript
// Add XYZ tile layer
map.addRaster('https://example.com/{z}/{x}/{y}.png', {
  opacity: 0.8,
  attribution: '© Example',
  minzoom: 0,
  maxzoom: 18,
});

// Add WMS layer
map.addWmsLayer('https://example.com/wms', {
  layers: 'layer1,layer2',
  format: 'image/png',
  transparent: true,
  crs: 'EPSG:3857',
  opacity: 0.7,
});

// Add Cloud Optimized GeoTIFF
map.addCogLayer('https://example.com/raster.tif', {
  tileServerUrl: 'https://titiler.example.com', // TiTiler server URL
  opacity: 0.9,
  bounds: [-180, -90, 180, 90],
});
```

### Layer Management

```typescript
// Get all custom layers
const layers = map.getAllCustomLayers();
// Returns: LayerInfo[]

// Get specific layer info
const info = map.getLayerInfo(layerId);
// Returns: { layerId, sourceId, type, visible, opacity, options }

// Toggle visibility
map.setLayerVisibility(layerId, false);

// Set opacity
map.setLayerOpacity(layerId, 0.5);

// Reorder layers
map.bringLayerToFront(layerId);
map.sendLayerToBack(layerId);

// Remove layer
map.removeLayerById(layerId);

// Fit to layer bounds
map.fitToLayer(layerId, { padding: 50 });
```

### Map State

Capture and restore the complete map state for persistence, undo/redo, or sharing.

```typescript
// Capture current map state
const state = map.getMapState();

// Save to localStorage
localStorage.setItem('mapState', JSON.stringify(state));

// Restore state later
const savedState = JSON.parse(localStorage.getItem('mapState'));
await map.setMapState(savedState);

// Restore with animated camera transition
await map.setMapState(savedState, {
  cameraAnimation: { animate: true, duration: 1000 },
});

// Partial capture (exclude certain elements)
const partialState = map.getMapState({
  includeCamera: true,
  includeStyle: true,
  includeTerrain: false,
  includeSky: false,
  includeControls: false,
});

// Partial restore
await map.setMapState(savedState, {
  restoreCamera: true,
  restoreStyle: false, // Keep current style
  restoreTerrain: true,
});

// Include custom metadata
const stateWithMeta = map.getMapState({
  metadata: { name: 'My Map View', author: 'User' },
});
```

#### Control Tracking

Track controls for state serialization:

```typescript
// Add a control with tracking (instead of map.addControl)
const navId = map.addTrackedControl(
  new maplibregl.NavigationControl(),
  'top-right',
  'NavigationControl'
);

const scaleId = map.addTrackedControl(
  new maplibregl.ScaleControl({ unit: 'metric' }),
  'bottom-left',
  'ScaleControl',
  { unit: 'metric' } // Store options for recreation
);

// Get all tracked controls
const controls = map.getTrackedControls();

// Remove a tracked control
map.removeTrackedControl(navId);

// Restore state with controls
await map.setMapState(savedState, {
  restoreControls: true,
  controlFactory: (info) => {
    // Recreate controls based on type
    switch (info.type) {
      case 'NavigationControl':
        return new maplibregl.NavigationControl();
      case 'ScaleControl':
        return new maplibregl.ScaleControl(info.options);
      default:
        return null;
    }
  },
});
```

#### MapState Object

```typescript
interface MapState {
  version: number;           // State format version
  timestamp: number;         // Capture timestamp
  camera: CameraState;       // Center, zoom, bearing, pitch, padding
  style: StyleSpecification; // Full MapLibre style (sources, layers, etc.)
  terrain: TerrainSpecification | null;
  sky: SkySpecification | null;
  projection: ProjectionSpecification;
  basemap: BasemapName | null;
  customLayers: LayerInfo[]; // Layers managed by maplibre-gl-extend
  controls?: SerializableControlInfo[];
  metadata?: Record<string, unknown>;
}
```

### React Hooks

```typescript
import { MapExtendProvider, useMapExtend, useBasemap } from 'maplibre-gl-extend/react';

// useMapExtend - Full access to all functionality
const {
  map,
  currentBasemap,
  layers,
  setBasemap,
  addGeojsonLayer,
  addRasterLayer,
  addCogLayer,
  addWmsLayer,
  removeLayer,
  toggleLayerVisibility,
  setLayerOpacity,
  refreshLayers,
} = useMapExtend();

// useBasemap - Basemap-specific hook
const {
  currentBasemap,
  setBasemap,
  availableBasemaps,
  basemapCatalog,
} = useBasemap(map, 'CartoDB.Positron');
```

## Exports

```typescript
// Main entry
import 'maplibre-gl-extend';
import {
  basemaps,
  getBasemapNames,
  getBasemapDefinition,
  generateLayerId,
  generateSourceId,
  generateControlId,
  MapExtendError,
} from 'maplibre-gl-extend';

// React entry
import {
  MapExtendProvider,
  useMapExtend,
  useBasemap,
} from 'maplibre-gl-extend/react';

// Types
import type {
  // Basemap types
  BasemapName,
  BasemapDefinition,
  // Layer types
  AddGeojsonOptions,
  AddRasterOptions,
  AddCogOptions,
  AddWmsOptions,
  LayerInfo,
  // State types
  MapState,
  CameraState,
  GetMapStateOptions,
  SetMapStateOptions,
  ControlInfo,
  SerializableControlInfo,
  ControlPosition,
} from 'maplibre-gl-extend';
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build library
npm run build

# Build examples
npm run build:examples
```

## Docker

```bash
# Build and run with Docker
docker build -t maplibre-gl-extend .
docker run -p 8080:80 maplibre-gl-extend

# Open http://localhost:8080/maplibre-gl-extend/
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Basemap catalog based on [xyzservices](https://github.com/geopandas/xyzservices)
- Inspired by [leafmap](https://github.com/opengeos/leafmap)
- Built with [MapLibre GL JS](https://maplibre.org/)
