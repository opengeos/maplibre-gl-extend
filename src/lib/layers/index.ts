export type {
  AddGeojsonOptions,
  AddRasterOptions,
  AddCogOptions,
  AddWmsOptions,
  AddVectorOptions,
  AddCogLayerOptions,
  AddZarrOptions,
  LayerInfo,
} from './types';

export { addGeojson, addVector } from './geojson';
export { addRaster, addTileCogLayer, addWmsLayer } from './raster';
export {
  removeLayerById,
  getLayerInfo,
  getAllCustomLayers,
  setLayerVisibility,
  setLayerOpacity,
  bringLayerToFront,
  sendLayerToBack,
  fitToLayer,
} from './management';

// GPU COG layer exports
export {
  addCogLayer,
  setCogLayerVisibility,
  setCogLayerOpacity,
  removeCogLayer,
} from './gpu-cog';

// Zarr layer exports
export {
  addZarrLayer,
  setZarrSelector,
  setZarrClim,
  setZarrColormap,
  setZarrLayerVisibility,
  setZarrLayerOpacity,
  removeZarrLayer,
  isZarrLayer,
  getZarrLayersMap,
  getZarrLayerName,
} from './zarr';

// Deck.gl overlay exports
export {
  isDeckLayer,
  getDeckLayerEntry,
} from './deck-overlay';

// Layer control adapters
export { COGLayerAdapter } from './cog-layer-adapter';
export { ZarrLayerAdapter } from './zarr-layer-adapter';
