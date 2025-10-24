import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Nettoyer après chaque test
afterEach(() => {
  cleanup();
});
