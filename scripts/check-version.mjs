/**
 * Block builds when public application identity differs from package metadata.
 * @file
 */

import { readFile } from 'node:fs/promises';
import { assertVersionAlignment } from './version-contract.mjs';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);
const runtimeSource = await readFile(
  new URL('../src/appVersion.ts', import.meta.url),
  'utf8',
);
console.log(
  `Application version aligned: ${assertVersionAlignment(packageJson.version, runtimeSource)}`,
);
