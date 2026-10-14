/**
 * Foundation-only page; Phase 3 visuals and interactions belong to later milestones.
 * @packageDocumentation
 */

import { APP_VERSION } from './appVersion';

/**
 * Render a small, accessible scaffold without external services or legacy assets.
 * @returns The foundation status and public application version.
 */
export function App() {
  return (
    <main>
      <h1>Dripperz</h1>
      <p>
        Source foundation ready. The Phase 3 showcase rebuild is not yet
        implemented.
      </p>
      <p>
        Version <span data-testid="app-version">{APP_VERSION}</span>
      </p>
    </main>
  );
}
