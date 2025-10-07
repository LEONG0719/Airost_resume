import { exportToCSV } from '../utils/exportUtils';
import { describe, it, expect, vi } from 'vitest';

// Mock anchor click
vi.stubGlobal('document', {
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  createElement: () => ({ click: vi.fn(), setAttribute: vi.fn(), href: '' }),
});

vi.stubGlobal('URL', { createObjectURL: () => 'blob:' });

describe('exportToCSV', () => {
  it('creates a CSV blob', () => {
    exportToCSV('test.csv', [['a', 'b']]);
    expect(document.body.appendChild).toHaveBeenCalled();
  });
});
