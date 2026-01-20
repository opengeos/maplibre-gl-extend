export type {
  AddGeojsonOptions,
  AddRasterOptions,
  AddCogOptions,
  AddWmsOptions,
  AddVectorOptions,
  AddGpuCogOptions,
  AddZarrOptions,
  LayerInfo,
} from './types';

export { addGeojson, addVector } from './geojson';
export { addRaster, addCogLayer, addWmsLayer } from './raster';
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
  addGpuCogLayer,
  setGpuCogLayerVisibility,
  setGpuCogLayerOpacity,
  removeGpuCogLayer,
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
} from './zarr';

// Deck.gl overlay exports
export {
  isDeckLayer,
  getDeckLayerEntry,
} from './deck-overlay';
