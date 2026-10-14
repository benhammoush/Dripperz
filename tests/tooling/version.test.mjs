/**
 * Prove that version drift and nonliteral runtime identities block the build gate.
 * @file
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertVersionAlignment } from '../../scripts/version-contract.mjs';

test('matching literal version passes', () => {
  assert.equal(
    assertVersionAlignment('0.1.0', "export const APP_VERSION = '0.1.0';"),
    '0.1.0',
  );
});

test('drift and missing identity fail', () => {
  assert.throws(() =>
    assertVersionAlignment('0.1.1', "export const APP_VERSION = '0.1.0';"),
  );
  assert.throws(() =>
    assertVersionAlignment('0.1.0', 'export const APP_VERSION = getVersion();'),
  );
});

test('commented decoys never establish runtime identity', () => {
  const decoy = "/*\nexport const APP_VERSION = '0.1.0';\n*/\n";
  assert.throws(() => assertVersionAlignment('0.1.0', decoy));
  assert.throws(() =>
    assertVersionAlignment(
      '0.1.0',
      `${decoy}export const APP_VERSION = '0.2.0';`,
    ),
  );
  assert.throws(() =>
    assertVersionAlignment(
      '0.1.0',
      `${decoy}export const APP_VERSION = getVersion();`,
    ),
  );
});

test('nonexported, mutable, duplicate and malformed identities fail', () => {
  for (const source of [
    "const APP_VERSION = '0.1.0';",
    "export let APP_VERSION = '0.1.0';",
    "export const APP_VERSION = '0.1.0'; export const APP_VERSION = '0.1.0';",
    "export const APP_VERSION = '0.1.0'; broken(",
  ]) {
    assert.throws(() => assertVersionAlignment('0.1.0', source), source);
  }
});
