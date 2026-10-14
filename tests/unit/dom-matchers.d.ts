/**
 * Bridge the DOM assertions used here to Vitest 5 without suppressing library checks.
 * Remove this adapter when the pinned jest-dom integration supports Vitest 5.
 * @packageDocumentation
 */

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import 'vitest';

declare module 'vitest' {
  /** Provide the two DOM assertions used by the foundation tests with Vitest 5's generics. */
  interface Matchers<R, T> {
    /** Assert that the received element belongs to the current document. */
    toBeInTheDocument: TestingLibraryMatchers<T, R>['toBeInTheDocument'];
    /** Assert text content using jest-dom's string/regular-expression matching behavior. */
    toHaveTextContent: TestingLibraryMatchers<T, R>['toHaveTextContent'];
  }
}
