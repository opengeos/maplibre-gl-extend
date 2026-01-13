import { vi } from 'vitest';

// Mock maplibre-gl
vi.mock('maplibre-gl', () => ({
  Map: vi.fn().mockImplementation(() => ({
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    getSource: vi.fn(),
    getLayer: vi.fn().mockReturnValue({ type: 'fill' }),
    getStyle: vi.fn().mockReturnValue({ layers: [] }),
    setLayoutProperty: vi.fn(),
    setPaintProperty: vi.fn(),
    moveLayer: vi.fn(),
    setTerrain: vi.fn(),
    fitBounds: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
  addProtocol: vi.fn(),
}));
