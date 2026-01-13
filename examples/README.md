# MapLibre GL Extend Examples

This directory contains example applications demonstrating how to use maplibre-gl-extend.

## Examples

### Basic Example (`/basic`)

A vanilla JavaScript/TypeScript example showing:
- Basemap switching between multiple providers
- Adding GeoJSON layers with custom styling
- Adding WMS layers
- Layer visibility toggle and removal
- Layer list management

### React Example (`/react`)

A React example demonstrating:
- Using the `MapExtendProvider` context
- Using the `useMapExtend` hook for layer management
- Using the `useBasemap` hook for basemap control
- Layer opacity control with sliders
- Responsive layer list with toggle and remove buttons

## Running the Examples

### Development Mode

From the root of the project:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open:
- http://localhost:5173/examples/basic/ for the basic example
- http://localhost:5173/examples/react/ for the React example

### Production Build

```bash
# Build examples
npm run build:examples

# Preview the build
npm run preview
```

## Code Highlights

### Basic Usage (Vanilla JS)

```typescript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl-extend';

const map = new maplibregl.Map({
  container: 'map',
  style: { version: 8, sources: {}, layers: [] },
  center: [0, 0],
  zoom: 2,
});

map.on('load', async () => {
  // Add a basemap
  map.setBasemap('CartoDB.Positron');

  // Add GeoJSON
  await map.addGeojson(geojsonData, {
    circleColor: '#ff6b6b',
    fitBounds: true,
  });

  // Add WMS layer
  map.addWmsLayer('https://example.com/wms', {
    layers: 'layer_name',
    transparent: true,
  });
});
```

### React Usage

```tsx
import { MapExtendProvider, useMapExtend } from 'maplibre-gl-extend/react';

function MapControls() {
  const { setBasemap, addGeojsonLayer, layers, toggleLayerVisibility } = useMapExtend();

  return (
    <div>
      <button onClick={() => setBasemap('CartoDB.DarkMatter')}>
        Dark Mode
      </button>
      <button onClick={() => addGeojsonLayer(data)}>
        Add Layer
      </button>
      {layers.map(layer => (
        <button
          key={layer.layerId}
          onClick={() => toggleLayerVisibility(layer.layerId)}
        >
          Toggle {layer.layerId}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [map, setMap] = useState(null);

  return (
    <MapExtendProvider map={map}>
      <MapComponent onLoad={setMap} />
      <MapControls />
    </MapExtendProvider>
  );
}
```
