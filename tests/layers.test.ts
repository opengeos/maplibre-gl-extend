import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock map
const createMockMap = () => ({
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
  fitBounds: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});

describe('layer management', () => {
  let mockMap: ReturnType<typeof createMockMap>;

  beforeEach(() => {
    mockMap = createMockMap();
    vi.clearAllMocks();
  });

  describe('addRaster', () => {
    it('should add raster source and layer', async () => {
      const { addRaster } = await import('../src/lib/layers/raster');

      const layerId = addRaster(mockMap as any, 'https://example.com/{z}/{x}/{y}.png', {
        opacity: 0.8,
        attribution: 'Test',
      });

      expect(mockMap.addSource).toHaveBeenCalledTimes(1);
      expect(mockMap.addLayer).toHaveBeenCalledTimes(1);
      expect(layerId).toBeTruthy();

      const sourceCall = mockMap.addSource.mock.calls[0];
      expect(sourceCall[1].type).toBe('raster');
      expect(sourceCall[1].tiles).toContain('https://example.com/{z}/{x}/{y}.png');

      const layerCall = mockMap.addLayer.mock.calls[0];
      expect(layerCall[0].type).toBe('raster');
      expect(layerCall[0].paint['raster-opacity']).toBe(0.8);
    });
  });

  describe('addWmsLayer', () => {
    it('should add WMS source and layer with correct URL', async () => {
      const { addWmsLayer } = await import('../src/lib/layers/raster');

      const layerId = addWmsLayer(mockMap as any, 'https://example.com/wms', {
        layers: 'layer1,layer2',
        transparent: true,
        format: 'image/png',
      });

      expect(mockMap.addSource).toHaveBeenCalledTimes(1);
      expect(mockMap.addLayer).toHaveBeenCalledTimes(1);
      expect(layerId).toBeTruthy();

      const sourceCall = mockMap.addSource.mock.calls[0];
      const url = sourceCall[1].tiles[0];
      expect(url).toContain('service=WMS');
      expect(url).toContain('layers=layer1%2Clayer2');
      expect(url).toContain('transparent=true');
      expect(url).toContain('format=image%2Fpng');
      expect(url).toContain('bbox=%7Bbbox-epsg-3857%7D');
    });
  });

  describe('addCogLayer', () => {
    it('should add COG layer with TiTiler URL', async () => {
      const { addCogLayer } = await import('../src/lib/layers/raster');

      const layerId = addCogLayer(mockMap as any, 'https://example.com/raster.tif', {
        tileServerUrl: 'https://titiler.example.com',
        opacity: 0.9,
      });

      expect(mockMap.addSource).toHaveBeenCalledTimes(1);
      expect(mockMap.addLayer).toHaveBeenCalledTimes(1);
      expect(layerId).toBeTruthy();

      const sourceCall = mockMap.addSource.mock.calls[0];
      const url = sourceCall[1].tiles[0];
      expect(url).toContain('titiler.example.com');
      expect(url).toContain(encodeURIComponent('https://example.com/raster.tif'));
    });
  });
});

describe('addGeojson', () => {
  let mockMap: ReturnType<typeof createMockMap>;

  beforeEach(() => {
    mockMap = createMockMap();
    vi.clearAllMocks();
  });

  it('should add GeoJSON point data with circle layer', async () => {
    const { addGeojson } = await import('../src/lib/layers/geojson');

    const geojson = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [0, 0] },
          properties: {},
        },
      ],
    };

    const layerId = await addGeojson(mockMap as any, geojson);

    expect(mockMap.addSource).toHaveBeenCalledTimes(1);
    expect(mockMap.addLayer).toHaveBeenCalledTimes(1);
    expect(layerId).toBeTruthy();

    const layerCall = mockMap.addLayer.mock.calls[0];
    expect(layerCall[0].type).toBe('circle');
  });

  it('should add GeoJSON polygon data with fill layer', async () => {
    const { addGeojson } = await import('../src/lib/layers/geojson');

    const geojson = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
      properties: {},
    };

    const layerId = await addGeojson(mockMap as any, geojson);

    expect(mockMap.addSource).toHaveBeenCalledTimes(1);
    expect(mockMap.addLayer).toHaveBeenCalledTimes(1);

    const layerCall = mockMap.addLayer.mock.calls[0];
    expect(layerCall[0].type).toBe('fill');
  });

  it('should fit bounds when option is true', async () => {
    const { addGeojson } = await import('../src/lib/layers/geojson');

    const geojson = {
      type: 'Point' as const,
      coordinates: [0, 0],
    };

    await addGeojson(mockMap as any, geojson, { fitBounds: true });

    expect(mockMap.fitBounds).toHaveBeenCalled();
  });

  it('should use custom colors', async () => {
    const { addGeojson } = await import('../src/lib/layers/geojson');

    const geojson = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
      properties: {},
    };

    await addGeojson(mockMap as any, geojson, {
      circleColor: '#ff0000',
      circleRadius: 10,
    });

    const layerCall = mockMap.addLayer.mock.calls[0];
    expect(layerCall[0].paint['circle-color']).toBe('#ff0000');
    expect(layerCall[0].paint['circle-radius']).toBe(10);
  });
});
