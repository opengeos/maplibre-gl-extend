export type {
  AddGeojsonOptions,
  AddRasterOptions,
  AddCogOptions,
  AddWmsOptions,
  AddVectorOptions,
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
