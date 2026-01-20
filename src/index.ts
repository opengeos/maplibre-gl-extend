/// <reference path="./types.d.ts" />

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
  addGpuCogLayer,
  addZarrLayer,
  setZarrSelector,
  setZarrClim,
  setZarrColormap,
  removeZarrLayer,
} from './lib/layers';
import {
  getMapState,
  setMapState,
  storeControlInfo,
  removeControlInfo,
  getAllTrackedControls,
} from './lib/state';

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

  // State management methods
  Map.prototype.getMapState = function (options) {
    return getMapState(this, options);
  };

  Map.prototype.setMapState = function (state, options) {
    return setMapState(this, state, options);
  };

  Map.prototype.addTrackedControl = function (control, position, type, options) {
    return storeControlInfo(this, control, position, type, options);
  };

  Map.prototype.removeTrackedControl = function (controlId) {
    removeControlInfo(this, controlId);
    return this;
  };

  Map.prototype.getTrackedControls = function () {
    return getAllTrackedControls(this);
  };

  // GPU COG layer methods
  Map.prototype.addGpuCogLayer = function (url, options) {
    return addGpuCogLayer(this, url, options);
  };

  // Zarr layer methods
  Map.prototype.addZarrLayer = function (url, options) {
    return addZarrLayer(this, url, options);
  };

  Map.prototype.setZarrSelector = function (layerId, selector) {
    return setZarrSelector(this, layerId, selector);
  };

  Map.prototype.setZarrClim = function (layerId, clim) {
    return setZarrClim(this, layerId, clim);
  };

  Map.prototype.setZarrColormap = function (layerId, colormap) {
    return setZarrColormap(this, layerId, colormap);
  };

  Map.prototype.removeZarrLayer = function (layerId) {
    return removeZarrLayer(this, layerId);
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
  AddGpuCogOptions,
  AddZarrOptions,
  LayerInfo,
} from './lib/layers/types';

// Export utilities
export {
  generateLayerId,
  generateSourceId,
  generateControlId,
  MapExtendError,
  validateUrl,
  validateBasemapName,
} from './lib/utils';

// Export state types
export type {
  CameraState,
  ControlPosition,
  ControlInfo,
  SerializableControlInfo,
  MapState,
  GetMapStateOptions,
  SetMapStateOptions,
} from './lib/state';

// Export layer control adapters
export { COGLayerAdapter, ZarrLayerAdapter } from './lib/layers';
