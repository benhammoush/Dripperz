/**
 * Install DOM matchers and explicitly clean up when Vitest globals are disabled.
 * @packageDocumentation
 */

import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// The pinned jest-dom /vitest entry still declares Vitest 4's Assertion shape.
// Its standalone entry registers the same runtime matchers without that augmentation.
expect.extend(matchers);

afterEach(() => cleanup());
