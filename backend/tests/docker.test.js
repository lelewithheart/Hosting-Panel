import { describe, test, expect } from 'vitest';
import * as docker from '../utils/docker.js';

describe('Docker Utils', () => {
  test('status returns not_created for non-existent container', async () => {
    const result = await docker.status('nonexistent');
    expect(result).toBe('not_created');
  });
});