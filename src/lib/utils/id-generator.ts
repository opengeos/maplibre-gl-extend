/**
 * Counter for generating unique layer IDs
 */
let layerCounter = 0;

/**
 * Counter for generating unique source IDs
 */
let sourceCounter = 0;

/**
 * Generate a unique layer ID.
 *
 * @param prefix - Prefix for the layer ID
 * @returns Unique layer ID
 */
export function generateLayerId(prefix: string = 'layer'): string {
  return `mgl-extend-${prefix}-${++layerCounter}-${Date.now().toString(36)}`;
}

/**
 * Generate a unique source ID.
 *
 * @param prefix - Prefix for the source ID
 * @returns Unique source ID
 */
export function generateSourceId(prefix: string = 'source'): string {
  return `mgl-extend-${prefix}-${++sourceCounter}-${Date.now().toString(36)}`;
}

/**
 * Reset counters (useful for testing).
 */
export function resetCounters(): void {
  layerCounter = 0;
  sourceCounter = 0;
}
