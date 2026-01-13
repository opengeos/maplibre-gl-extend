import { describe, it, expect } from 'vitest';
import {
  basemaps,
  getBasemapNames,
  getBasemapDefinition,
} from '../src/lib/basemaps';
import type { BasemapName } from '../src/lib/basemaps/types';

describe('basemaps catalog', () => {
  it('should have all expected OpenStreetMap basemaps', () => {
    const names = getBasemapNames();
    expect(names).toContain('OpenStreetMap.Mapnik');
    expect(names).toContain('OpenStreetMap.HOT');
  });

  it('should have all expected CartoDB basemaps', () => {
    const names = getBasemapNames();
    expect(names).toContain('CartoDB.Positron');
    expect(names).toContain('CartoDB.DarkMatter');
    expect(names).toContain('CartoDB.Voyager');
  });

  it('should have all expected Esri basemaps', () => {
    const names = getBasemapNames();
    expect(names).toContain('Esri.WorldStreetMap');
    expect(names).toContain('Esri.WorldImagery');
    expect(names).toContain('Esri.WorldTopoMap');
  });

  it('should have all expected Google basemaps', () => {
    const names = getBasemapNames();
    expect(names).toContain('Google.Streets');
    expect(names).toContain('Google.Satellite');
    expect(names).toContain('Google.Hybrid');
    expect(names).toContain('Google.Terrain');
  });

  it('should have valid basemap definitions', () => {
    const osmDef = getBasemapDefinition('OpenStreetMap.Mapnik');
    expect(osmDef).toBeDefined();
    expect(osmDef?.name).toBe('OpenStreetMap');
    expect(osmDef?.url).toContain('openstreetmap');
    expect(osmDef?.attribution).toBeDefined();
    expect(osmDef?.maxZoom).toBe(19);
  });

  it('should return undefined for invalid basemap name', () => {
    const invalid = getBasemapDefinition('InvalidBasemap' as BasemapName);
    expect(invalid).toBeUndefined();
  });

  it('should have correct structure for all basemaps', () => {
    const names = getBasemapNames();

    names.forEach((name) => {
      const def = basemaps[name];
      expect(def).toBeDefined();
      expect(def.name).toBeTruthy();
      expect(def.url).toBeTruthy();
      expect(def.attribution).toBeTruthy();
      expect(typeof def.maxZoom).toBe('number');
    });
  });

  it('should have valid URLs for all basemaps', () => {
    const names = getBasemapNames();

    names.forEach((name) => {
      const def = basemaps[name];
      // URLs should contain tile coordinates placeholders
      const hasXYZ = def.url.includes('{x}') && def.url.includes('{y}') && def.url.includes('{z}');
      expect(hasXYZ).toBe(true);
    });
  });
});
