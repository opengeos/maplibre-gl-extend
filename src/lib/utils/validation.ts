import { getBasemapNames } from '../basemaps';
import type { BasemapName } from '../basemaps/types';

/**
 * Custom error class for MapLibre GL Extend errors.
 */
export class MapExtendError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MapExtendError';
  }
}

/**
 * Validate that a URL is valid.
 *
 * @param url - URL to validate
 * @param type - Type of resource (for error message)
 * @throws MapExtendError if URL is invalid
 */
export function validateUrl(url: string, type: string): void {
  if (!url || typeof url !== 'string') {
    throw new MapExtendError(
      `Invalid URL provided for ${type}`,
      'INVALID_URL',
      { url, type }
    );
  }

  try {
    new URL(url);
  } catch {
    throw new MapExtendError(`Malformed URL: ${url}`, 'MALFORMED_URL', {
      url,
      type,
    });
  }
}

/**
 * Validate that a basemap name is valid.
 *
 * @param name - Basemap name to validate
 * @throws MapExtendError if basemap name is invalid
 */
export function validateBasemapName(name: string): asserts name is BasemapName {
  const validNames = getBasemapNames();
  if (!validNames.includes(name as BasemapName)) {
    throw new MapExtendError(
      `Unknown basemap: ${name}. Valid options: ${validNames.join(', ')}`,
      'UNKNOWN_BASEMAP',
      { name, validNames }
    );
  }
}

/**
 * Clamp a value between min and max.
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
