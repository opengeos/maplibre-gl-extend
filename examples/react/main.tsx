import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapExtendProvider, useMapExtend, useBasemap } from '../../src/react';
import type { BasemapName } from '../../src/lib/basemaps/types';

// Sample GeoJSON data
const sampleGeojson = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'London' },
      geometry: { type: 'Point' as const, coordinates: [-0.1276, 51.5074] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Paris' },
      geometry: { type: 'Point' as const, coordinates: [2.3522, 48.8566] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Berlin' },
      geometry: { type: 'Point' as const, coordinates: [13.405, 52.52] },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Rome' },
      geometry: { type: 'Point' as const, coordinates: [12.4964, 41.9028] },
    },
  ],
};

// Control Panel Component
function ControlPanel() {
  const {
    currentBasemap,
    setBasemap,
    layers,
    addGeojsonLayer,
    removeLayer,
    toggleLayerVisibility,
    setLayerOpacity,
  } = useMapExtend();

  const basemaps: BasemapName[] = [
    'OpenStreetMap.Mapnik',
    'CartoDB.Positron',
    'CartoDB.DarkMatter',
    'CartoDB.Voyager',
    'Esri.WorldImagery',
    'Google.Satellite',
    'Google.Hybrid',
    'OpenTopoMap',
  ];

  const handleAddGeojson = async () => {
    await addGeojsonLayer(sampleGeojson, {
      circleColor: '#3388ff',
      circleRadius: 10,
      circleStrokeColor: '#ffffff',
      circleStrokeWidth: 2,
      fitBounds: true,
    });
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>MapLibre GL Extend</h3>
      <p style={styles.subtitle}>React Example</p>

      <div style={styles.section}>
        <label style={styles.label}>Basemap</label>
        <select
          style={styles.select}
          value={currentBasemap || ''}
          onChange={(e) => setBasemap(e.target.value as BasemapName)}
        >
          <option value="">-- Select Basemap --</option>
          {basemaps.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Add Layers</label>
        <button style={styles.button} onClick={handleAddGeojson}>
          Add European Cities
        </button>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Layers ({layers.length})</label>
        {layers.length === 0 ? (
          <p style={styles.noLayers}>No layers added</p>
        ) : (
          layers.map((layer) => (
            <div key={layer.layerId} style={styles.layerItem}>
              <span style={styles.layerName}>
                {layer.type}: {layer.layerId.split('-').slice(-2, -1)[0]}
              </span>
              <div style={styles.layerControls}>
                <button
                  style={styles.smallButton}
                  onClick={() => toggleLayerVisibility(layer.layerId)}
                >
                  {layer.visible ? 'Hide' : 'Show'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  style={styles.slider}
                  onChange={(e) =>
                    setLayerOpacity(layer.layerId, parseFloat(e.target.value))
                  }
                />
                <button
                  style={{ ...styles.smallButton, ...styles.removeButton }}
                  onClick={() => removeLayer(layer.layerId)}
                >
                  X
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      center: [10, 50], // Center of Europe
      zoom: 4,
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapInstance.addControl(new maplibregl.FullscreenControl(), 'top-right');

    mapInstance.on('load', () => {
      // Set initial basemap
      mapInstance.setBasemap('CartoDB.Voyager');
      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
    };
  }, []);

  return (
    <MapExtendProvider map={map}>
      <div style={styles.container}>
        <div ref={mapContainer} style={styles.map} />
        <ControlPanel />
      </div>
    </MapExtendProvider>
  );
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  panel: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'white',
    padding: 16,
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    maxWidth: 300,
    maxHeight: 'calc(100vh - 40px)',
    overflow: 'auto',
    zIndex: 1000,
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: 16,
    color: '#333',
  },
  subtitle: {
    margin: '0 0 16px 0',
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#555',
  },
  select: {
    width: '100%',
    padding: 8,
    border: '1px solid #ddd',
    borderRadius: 4,
    fontSize: 13,
  },
  button: {
    width: '100%',
    padding: 10,
    background: '#3388ff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: 13,
    cursor: 'pointer',
  },
  noLayers: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  layerItem: {
    background: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  layerName: {
    display: 'block',
    fontSize: 12,
    marginBottom: 6,
    color: '#333',
  },
  layerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  smallButton: {
    padding: '4px 8px',
    fontSize: 11,
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
  },
  removeButton: {
    background: '#dc3545',
  },
  slider: {
    flex: 1,
    height: 4,
  },
};

// Render
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}
