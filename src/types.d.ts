import type { GeoJSON } from 'geojson';
import type { FitBoundsOptions } from 'maplibre-gl';
import type { BasemapName } from './lib/basemaps/types';
import type {
  AddGeojsonOptions,
  AddRasterOptions,
  AddCogOptions,
  AddWmsOptions,
  AddVectorOptions,
  LayerInfo,
} from './lib/layers/types';

declare module 'maplibre-gl' {
  interface Map {
    /**
     * Add a basemap layer to the map. The basemap is added at the bottom of the layer stack.
     *
     * @param name - Name of the basemap (e.g., 'OpenStreetMap.Mapnik', 'CartoDB.DarkMatter')
     * @returns The map instance for chaining
     */
    addBasemap(name: BasemapName): this;

    /**
     * Set (replace) the current basemap. Alias for addBasemap.
     *
     * @param name - Name of the basemap
     * @returns The map instance for chaining
     */
    setBasemap(name: BasemapName): this;

    /**
     * Get the current basemap name.
     *
     * @returns Current basemap name or null if no basemap is set
     */
    getBasemap(): BasemapName | null;

    /**
     * Add GeoJSON data to the map.
     *
     * @param data - GeoJSON object or URL to fetch GeoJSON from
     * @param options - Layer options
     * @returns Promise resolving to the layer ID
     */
    addGeojson(data: GeoJSON | string, options?: AddGeojsonOptions): Promise<string>;

    /**
     * Add a vector tile source to the map.
     *
     * @param url - URL to vector tiles (PMTiles, MVT, etc.)
     * @param options - Layer options
     * @returns The layer ID
     */
    addVector(url: string, options?: AddVectorOptions): string;

    /**
     * Add a raster tile layer to the map.
     *
     * @param url - URL template for raster tiles
     * @param options - Layer options
     * @returns The layer ID
     */
    addRaster(url: string, options?: AddRasterOptions): string;

    /**
     * Add a Cloud Optimized GeoTIFF (COG) layer to the map.
     *
     * @param url - URL to the COG file
     * @param options - Layer options
     * @returns The layer ID
     */
    addCogLayer(url: string, options?: AddCogOptions): string;

    /**
     * Add a WMS layer to the map.
     *
     * @param baseUrl - Base URL of the WMS service
     * @param options - WMS layer options (layers parameter is required)
     * @returns The layer ID
     */
    addWmsLayer(baseUrl: string, options: AddWmsOptions): string;

    /**
     * Remove a layer and its source by layer ID.
     *
     * @param layerId - Layer ID to remove
     * @returns The map instance for chaining
     */
    removeLayerById(layerId: string): this;

    /**
     * Get information about a custom layer.
     *
     * @param layerId - Layer ID
     * @returns Layer info or null if not found
     */
    getLayerInfo(layerId: string): LayerInfo | null;

    /**
     * Get all custom layers managed by this library.
     *
     * @returns Array of layer info
     */
    getAllCustomLayers(): LayerInfo[];

    /**
     * Set layer visibility.
     *
     * @param layerId - Layer ID
     * @param visible - Whether layer should be visible
     * @returns The map instance for chaining
     */
    setLayerVisibility(layerId: string, visible: boolean): this;

    /**
     * Set layer opacity.
     *
     * @param layerId - Layer ID
     * @param opacity - Opacity value (0-1)
     * @returns The map instance for chaining
     */
    setLayerOpacity(layerId: string, opacity: number): this;

    /**
     * Move a layer to the front (top of the layer stack).
     *
     * @param layerId - Layer ID
     * @returns The map instance for chaining
     */
    bringLayerToFront(layerId: string): this;

    /**
     * Move a layer to the back (bottom of the layer stack, above basemap).
     *
     * @param layerId - Layer ID
     * @returns The map instance for chaining
     */
    sendLayerToBack(layerId: string): this;

    /**
     * Fit the map bounds to a layer's extent.
     *
     * @param layerId - Layer ID
     * @param options - Fit bounds options
     * @returns The map instance for chaining
     */
    fitToLayer(layerId: string, options?: FitBoundsOptions): this;
  }
}
