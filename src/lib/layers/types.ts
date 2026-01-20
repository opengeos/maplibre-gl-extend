import type {
  FillLayerSpecification,
  LineLayerSpecification,
  CircleLayerSpecification,
  FitBoundsOptions,
} from 'maplibre-gl';

/**
 * Options for adding GeoJSON data to the map.
 */
export interface AddGeojsonOptions {
  /** Custom layer ID (auto-generated if not provided) */
  layerId?: string;
  /** Custom source ID (auto-generated if not provided) */
  sourceId?: string;
  /** Layer type: 'fill', 'line', 'circle' (auto-detected if not provided) */
  type?: 'fill' | 'line' | 'circle';
  /** Paint properties for the layer */
  paint?:
    | FillLayerSpecification['paint']
    | LineLayerSpecification['paint']
    | CircleLayerSpecification['paint'];
  /** Layer opacity (0-1) */
  opacity?: number;
  /** Fill color for polygons */
  fillColor?: string;
  /** Fill opacity for polygons */
  fillOpacity?: number;
  /** Line/stroke color */
  lineColor?: string;
  /** Line width */
  lineWidth?: number;
  /** Circle radius for points */
  circleRadius?: number;
  /** Circle color for points */
  circleColor?: string;
  /** Circle stroke color */
  circleStrokeColor?: string;
  /** Circle stroke width */
  circleStrokeWidth?: number;
  /** Whether to fit bounds to the data */
  fitBounds?: boolean;
  /** Options for fitBounds */
  fitBoundsOptions?: FitBoundsOptions;
  /** Min zoom level */
  minzoom?: number;
  /** Max zoom level */
  maxzoom?: number;
  /** Insert layer before this layer ID */
  beforeId?: string;
}

/**
 * Options for adding raster tile layers.
 */
export interface AddRasterOptions {
  /** Custom layer ID */
  layerId?: string;
  /** Custom source ID */
  sourceId?: string;
  /** Tile size (default: 256) */
  tileSize?: number;
  /** Layer opacity (0-1) */
  opacity?: number;
  /** Attribution text */
  attribution?: string;
  /** Min zoom level */
  minzoom?: number;
  /** Max zoom level */
  maxzoom?: number;
  /** Bounds [west, south, east, north] */
  bounds?: [number, number, number, number];
  /** Insert layer before this layer ID */
  beforeId?: string;
}

/**
 * Options for adding Cloud Optimized GeoTIFF (COG) layers.
 */
export interface AddCogOptions extends AddRasterOptions {
  /** TiTiler or other tile server base URL (if not using native COG protocol) */
  tileServerUrl?: string;
}

/**
 * Options for adding WMS layers.
 */
export interface AddWmsOptions extends AddRasterOptions {
  /** WMS layer names (comma-separated) */
  layers: string;
  /** WMS format (default: 'image/png') */
  format?: string;
  /** WMS version (default: '1.1.1') */
  version?: string;
  /** CRS/SRS (default: 'EPSG:3857') */
  crs?: string;
  /** Whether tiles are transparent */
  transparent?: boolean;
  /** Additional WMS parameters */
  params?: Record<string, string>;
}

/**
 * Options for adding vector tile sources.
 */
export interface AddVectorOptions {
  /** Custom source ID */
  sourceId?: string;
  /** Source layer name (required for PMTiles/vector tiles) */
  sourceLayer?: string;
  /** Min zoom level */
  minzoom?: number;
  /** Max zoom level */
  maxzoom?: number;
  /** Attribution text */
  attribution?: string;
  /** Whether to fit bounds to the data */
  fitBounds?: boolean;
  /** Layer type for styling */
  type?: 'fill' | 'line' | 'circle';
  /** Fill color */
  fillColor?: string;
  /** Line color */
  lineColor?: string;
  /** Line width */
  lineWidth?: number;
  /** Circle radius */
  circleRadius?: number;
  /** Circle color */
  circleColor?: string;
  /** Layer opacity */
  opacity?: number;
  /** Custom layer ID */
  layerId?: string;
  /** Insert layer before this layer ID */
  beforeId?: string;
}

/**
 * Information about a custom layer managed by this library.
 */
export interface LayerInfo {
  /** Layer ID */
  layerId: string;
  /** Source ID */
  sourceId: string;
  /** Layer type */
  type: string;
  /** Whether layer is visible */
  visible: boolean;
  /** Current opacity */
  opacity: number;
  /** Original options used to create the layer */
  options: Record<string, unknown>;
}

/**
 * Options for adding GPU-accelerated COG layers.
 */
export interface AddGpuCogOptions {
  /** Custom layer ID (auto-generated if not provided) */
  layerId?: string;
  /** Layer opacity (0-1, default: 1) */
  opacity?: number;
  /** Whether layer should be visible (default: true) */
  visible?: boolean;
  /** Enable debug mode (default: false) */
  debug?: boolean;
  /** Debug layer opacity (default: 0.25) */
  debugOpacity?: number;
  /** Maximum error for terrain mesh (default: 0.125) */
  maxError?: number;
  /** Whether to fit bounds to the COG extent (default: false) */
  fitBounds?: boolean;
  /** Insert layer before this layer ID */
  beforeId?: string;
}

/**
 * Options for adding Zarr layers.
 */
export interface AddZarrOptions {
  /** Custom layer ID (auto-generated if not provided) */
  layerId?: string;
  /** Variable name to display from the Zarr dataset */
  variable: string;
  /** Colormap as array of color strings (default: viridis-like) */
  colormap?: string[];
  /** Color limits [min, max] (default: [0, 1]) */
  clim?: [number, number];
  /** Layer opacity (0-1, default: 1) */
  opacity?: number;
  /** Dimension selector for multi-dimensional data (e.g., { month: 6 }) */
  selector?: Record<string, number>;
  /** Minimum zoom level (default: 0) */
  minzoom?: number;
  /** Maximum zoom level (default: 22) */
  maxzoom?: number;
  /** Fill/no-data value (default: -9999) */
  fillValue?: number;
  /** Names of spatial dimensions (default: { lat: 'lat', lon: 'lon' }) */
  spatialDimensions?: { lat?: string; lon?: string };
  /** Zarr format version (default: 2) */
  zarrVersion?: 2 | 3;
  /** Bounds [west, south, east, north] */
  bounds?: [number, number, number, number];
}
