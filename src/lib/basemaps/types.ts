/**
 * Basemap definition structure following xyzservices format
 */
export interface BasemapDefinition {
  /** Display name for the basemap */
  name: string;
  /** URL template for XYZ tiles */
  url: string;
  /** Attribution text (HTML allowed) */
  attribution: string;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Subdomains for load balancing (e.g., 'abc') */
  subdomains?: string;
  /** Tile size in pixels (default: 256) */
  tileSize?: number;
}

/**
 * Complete basemap catalog
 */
export type BasemapCatalog = Record<string, BasemapDefinition>;

/**
 * Union type of all available basemap names
 */
export type BasemapName =
  // OpenStreetMap
  | 'OpenStreetMap.Mapnik'
  | 'OpenStreetMap.DE'
  | 'OpenStreetMap.France'
  | 'OpenStreetMap.HOT'
  // CartoDB
  | 'CartoDB.Positron'
  | 'CartoDB.PositronNoLabels'
  | 'CartoDB.PositronOnlyLabels'
  | 'CartoDB.DarkMatter'
  | 'CartoDB.DarkMatterNoLabels'
  | 'CartoDB.DarkMatterOnlyLabels'
  | 'CartoDB.Voyager'
  | 'CartoDB.VoyagerNoLabels'
  | 'CartoDB.VoyagerOnlyLabels'
  | 'CartoDB.VoyagerLabelsUnder'
  // Esri
  | 'Esri.WorldStreetMap'
  | 'Esri.DeLorme'
  | 'Esri.WorldTopoMap'
  | 'Esri.WorldImagery'
  | 'Esri.WorldTerrain'
  | 'Esri.WorldShadedRelief'
  | 'Esri.WorldPhysical'
  | 'Esri.OceanBasemap'
  | 'Esri.NatGeoWorldMap'
  | 'Esri.WorldGrayCanvas'
  // OpenTopoMap
  | 'OpenTopoMap'
  // USGS
  | 'USGS.USTopo'
  | 'USGS.USImagery'
  | 'USGS.USImageryTopo'
  // Stadia (formerly Stamen)
  | 'Stadia.AlidadeSmooth'
  | 'Stadia.AlidadeSmoothDark'
  | 'Stadia.OSMBright'
  | 'Stadia.Outdoors'
  | 'Stadia.StamenToner'
  | 'Stadia.StamenTonerLite'
  | 'Stadia.StamenWatercolor'
  | 'Stadia.StamenTerrain'
  // Google
  | 'Google.Streets'
  | 'Google.Satellite'
  | 'Google.Hybrid'
  | 'Google.Terrain';
