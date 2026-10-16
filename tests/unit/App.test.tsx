/**
 * Check the shell's semantic targets and explicit deferred-feature status.
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from '../../src/App';
import { APP_VERSION } from '../../src/appVersion';

test('renders the shell and runtime version without claiming feature completion', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { level: 1, name: /Dripperz.*ENTER THE/ }),
  ).toBeInTheDocument();
  expect(screen.getByTestId('app-version')).toHaveTextContent(APP_VERSION);
  expect(screen.getAllByText('Not yet implemented')).toHaveLength(2);
});
