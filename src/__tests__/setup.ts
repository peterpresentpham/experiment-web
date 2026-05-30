import { vi } from 'vitest';

/**
 * Vitest setup file.
 * Mocks Next.js modules that are not compatible with Vitest (e.g., next/font/google).
 */

// Mock next/font/google to prevent "is not a function" error in tests
// that import modules transitively depending on this.
vi.mock('next/font/google', () => ({
  Be_Vietnam_Pro: () => ({
    className: 'mock-be-vietnam-pro',
    variable: '--font-be-vietnam-pro',
    style: { fontFamily: 'mock' },
  }),
  Fira_Code: () => ({
    className: 'mock-fira-code',
    variable: '--font-fira-code',
    style: { fontFamily: 'mock' },
  }),
}));
