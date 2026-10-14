/**
 * Check the foundation's public status and version without a browser server.
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from '../../src/App';
import { APP_VERSION } from '../../src/appVersion';

test('renders the foundation and runtime version', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Dripperz' }),
  ).toBeInTheDocument();
  expect(screen.getByTestId('app-version')).toHaveTextContent(APP_VERSION);
  expect(screen.getByText(/not yet implemented/)).toBeInTheDocument();
});
