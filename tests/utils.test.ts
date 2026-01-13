import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateLayerId,
  generateSourceId,
  resetCounters,
  clamp,
  MapExtendError,
  validateUrl,
} from '../src/lib/utils';

describe('id-generator', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('should generate unique layer IDs', () => {
    const id1 = generateLayerId();
    const id2 = generateLayerId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^mgl-extend-layer-\d+-[a-z0-9]+$/);
  });

  it('should generate unique source IDs', () => {
    const id1 = generateSourceId();
    const id2 = generateSourceId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^mgl-extend-source-\d+-[a-z0-9]+$/);
  });

  it('should use custom prefix', () => {
    const id = generateLayerId('geojson');
    expect(id).toMatch(/^mgl-extend-geojson-\d+-[a-z0-9]+$/);
  });

  it('should reset counters', () => {
    generateLayerId();
    generateLayerId();
    resetCounters();
    const id = generateLayerId();
    expect(id).toMatch(/^mgl-extend-layer-1-[a-z0-9]+$/);
  });
});

describe('validation', () => {
  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(() => validateUrl('https://example.com', 'test')).not.toThrow();
      expect(() => validateUrl('http://example.com/path', 'test')).not.toThrow();
    });

    it('should reject invalid URLs', () => {
      expect(() => validateUrl('not-a-url', 'test')).toThrow(MapExtendError);
      expect(() => validateUrl('', 'test')).toThrow(MapExtendError);
    });

    it('should include error details', () => {
      try {
        validateUrl('invalid', 'test');
      } catch (e) {
        expect(e).toBeInstanceOf(MapExtendError);
        expect((e as MapExtendError).code).toBe('MALFORMED_URL');
        expect((e as MapExtendError).details).toHaveProperty('url', 'invalid');
      }
    });
  });

  describe('MapExtendError', () => {
    it('should create error with details', () => {
      const error = new MapExtendError('Test error', 'TEST_CODE', { foo: 'bar' });
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ foo: 'bar' });
      expect(error.name).toBe('MapExtendError');
    });
  });
});
