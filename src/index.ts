import { Map } from 'maplibre-gl';
import {
  addBasemap,
  setBasemap,
  getBasemap,
  basemaps,
  getBasemapNames,
  getBasemapDefinition,
} from './lib/basemaps';
import {
  addGeojson,
  addVector,
  addRaster,
  addCogLayer,
  addWmsLayer,
  removeLayerById,
  getLayerInfo,
  getAllCustomLayers,
  setLayerVisibility,
  setLayerOpacity,
  bringLayerToFront,
  sendLayerToBack,
  fitToLayer,
} from './lib/layers';

// Note: Module augmentation for Map is in types.d.ts

/**
 * Extend the MapLibre GL Map prototype with convenience methods.
 * This function is called automatically when the module is imported.
 */
function extendMapPrototype(): void {
  // Basemap methods
  Map.prototype.addBasemap = function (name) {
    return addBasemap(this, name);
  };

  Map.prototype.setBasemap = function (name) {
    return setBasemap(this, name);
  };

  Map.prototype.getBasemap = function () {
    return getBasemap(this);
  };

  // GeoJSON/Vector methods
  Map.prototype.addGeojson = function (data, options) {
    return addGeojson(this, data, options);
  };

  Map.prototype.addVector = function (url, options) {
    return addVector(this, url, options);
  };

  // Raster methods
  Map.prototype.addRaster = function (url, options) {
    return addRaster(this, url, options);
  };

  Map.prototype.addCogLayer = function (url, options) {
    return addCogLayer(this, url, options);
  };

  Map.prototype.addWmsLayer = function (baseUrl, options) {
    return addWmsLayer(this, baseUrl, options);
  };

  // Layer management methods
  Map.prototype.removeLayerById = function (layerId) {
    return removeLayerById(this, layerId);
  };

  Map.prototype.getLayerInfo = function (layerId) {
    return getLayerInfo(this, layerId);
  };

  Map.prototype.getAllCustomLayers = function () {
    return getAllCustomLayers(this);
  };

  Map.prototype.setLayerVisibility = function (layerId, visible) {
    return setLayerVisibility(this, layerId, visible);
  };

  Map.prototype.setLayerOpacity = function (layerId, opacity) {
    return setLayerOpacity(this, layerId, opacity);
  };

  Map.prototype.bringLayerToFront = function (layerId) {
    return bringLayerToFront(this, layerId);
  };

  Map.prototype.sendLayerToBack = function (layerId) {
    return sendLayerToBack(this, layerId);
  };

  Map.prototype.fitToLayer = function (layerId, options) {
    return fitToLayer(this, layerId, options);
  };
}

// Extend Map.prototype when module is imported
extendMapPrototype();

// Export basemap catalog and utilities
export { basemaps, getBasemapNames, getBasemapDefinition };

// Export types
export type {
  BasemapName,
  BasemapDefinition,
  BasemapCatalog,
} from './lib/basemaps/types';

export type {
  AddGeojsonOptions,
  AddRasterOptions,
  AddCogOptions,
  AddWmsOptions,
  AddVectorOptions,
  LayerInfo,
} from './lib/layers/types';

// Export utilities
export {
  generateLayerId,
  generateSourceId,
  MapExtendError,
  validateUrl,
  validateBasemapName,
} from './lib/utils';
