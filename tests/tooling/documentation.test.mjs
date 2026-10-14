/**
 * Exercise the repository's actual blocking documentation rules on in-memory source.
 * @file
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';

// In-memory fixtures are not tsconfig inputs; disable only type-aware rules here.
// Presence, structure, parser and TSDoc rules remain the repository's real configuration.
const eslint = new ESLint({
  overrideConfig: [
    { files: ['**/*.{ts,tsx}'], ...tseslint.configs.disableTypeChecked },
  ],
});

const tsHeader =
  '/** Fixture module.\n * @packageDocumentation\n */\nimport "react";\n';

/**
 * Collect blocking diagnostics using the repository configuration and a virtual path.
 * @param {string} source - Handwritten fixture source, not written into the application.
 * @param {string} filePath - Path selecting the real JS or TS rule configuration.
 * @returns {Promise<string[]>} Rule identifiers responsible for blocking diagnostics.
 */
async function blockingRules(
  source,
  filePath = 'src/documentation-fixture.tsx',
) {
  const [result] = await eslint.lintText(source, { filePath });
  return result.messages
    .filter((message) => message.severity === 2)
    .map((message) => message.ruleId);
}

test('a named arrow without documentation fails', async () => {
  const rules = await blockingRules(
    `${tsHeader}export const useFixture = () => 1;`,
  );
  assert.ok(rules.includes('jsdoc/require-jsdoc'), JSON.stringify(rules));
});

test('valid TypeScript component and helper documentation passes', async () => {
  const rules = await blockingRules(`${tsHeader}
/** Render a deterministic fixture without side effects.
 * @returns A small heading for the test.
 */
export const Fixture = () => <h1>Fixture</h1>;
/** Add one to the supplied fixture value.
 * @param value - Starting number.
 * @returns The incremented number.
 */
const internalHelper = (value: number) => value + 1;
internalHelper(1);
`);
  assert.deepEqual(rules, []);
});

test('named internal arrows, hooks, components and declarations require documentation', async () => {
  for (const declaration of [
    'const internalHelper = (value: number) => value + 1; internalHelper(1);',
    'export const useFixture = () => 1;',
    'export const Fixture = () => <h1>Fixture</h1>;',
    'export function helper() { return 1; }',
    'export class Fixture {}',
    'export interface Fixture { value: number }',
    'export type Fixture = { value: number };',
  ]) {
    const rules = await blockingRules(tsHeader + declaration);
    assert.ok(
      rules.includes('jsdoc/require-jsdoc'),
      `${declaration}: ${JSON.stringify(rules)}`,
    );
  }
});

test('module overview is mandatory in TypeScript and JavaScript', async () => {
  for (const filePath of [
    'src/documentation-fixture.ts',
    'scripts/documentation-fixture.mjs',
  ]) {
    assert.ok(
      (await blockingRules('import "react";', filePath)).includes(
        'jsdoc/require-file-overview',
      ),
    );
  }
});

test('missing descriptions, parameter docs and return docs are blocking', async () => {
  for (const [comment, rule] of [
    ['/** @returns The incremented number. */', 'jsdoc/require-description'],
    [
      '/** Add one.\n * @returns The incremented number. */',
      'jsdoc/require-param',
    ],
    [
      '/** Add one.\n * @param value - Starting number. */',
      'jsdoc/require-returns',
    ],
    [
      '/** Add one.\n * @param value\n * @returns The incremented number. */',
      'jsdoc/require-param-description',
    ],
    [
      '/** Add one.\n * @param value - Starting number.\n * @returns */',
      'jsdoc/require-returns-description',
    ],
  ]) {
    const rules = await blockingRules(
      `${tsHeader}${comment}\nexport const helper = (value: number) => value + 1;`,
    );
    assert.ok(rules.includes(rule), `${rule}: ${JSON.stringify(rules)}`);
  }
});

test('malformed TSDoc and duplicated TypeScript types are blocking', async () => {
  const malformed = await blockingRules(
    `${tsHeader}/** Add one.\n * @param value Starting number.\n * @returns The incremented number.\n */\nexport const helper = (value: number) => value + 1;`,
  );
  assert.ok(malformed.includes('tsdoc/syntax'), JSON.stringify(malformed));
  const duplicated = await blockingRules(
    `${tsHeader}/** Add one.\n * @param {number} value - Starting number.\n * @returns {number} The incremented number.\n */\nexport const helper = (value: number) => value + 1;`,
  );
  assert.ok(duplicated.includes('jsdoc/no-types'), JSON.stringify(duplicated));
});

test('JavaScript documentation passes and missing named-arrow docs fail', async () => {
  const header = '/** JavaScript fixture.\n * @file\n */\nimport "react";\n';
  const filePath = 'scripts/documentation-fixture.mjs';
  assert.deepEqual(
    await blockingRules(
      `${header}/** Add one.\n * @param {number} value - Starting number.\n * @returns {number} The incremented number.\n */\nexport const helper = (value) => value + 1;`,
      filePath,
    ),
    [],
  );
  assert.ok(
    (
      await blockingRules(`${header}export const helper = () => 1;`, filePath)
    ).includes('jsdoc/require-jsdoc'),
  );
});

test('anonymous callbacks remain exempt and generated artifacts are ignored', async () => {
  assert.deepEqual(
    await blockingRules(`${tsHeader}[1].map((value) => value + 1);`),
    [],
  );
  for (const filePath of [
    'dist/fixture.js',
    'coverage/fixture.js',
    'test-results/fixture.js',
    'playwright-report/fixture.js',
    'src/generated/fixture.ts',
  ]) {
    assert.equal(await eslint.isPathIgnored(filePath), true, filePath);
  }
  for (const filePath of [
    'src/App.tsx',
    'scripts/check-version.mjs',
    'tests/tooling/documentation.test.mjs',
  ]) {
    assert.equal(await eslint.isPathIgnored(filePath), false, filePath);
  }
});

test('empty module, class and public-contract descriptions fail', async () => {
  for (const declaration of [
    'export class Fixture {}',
    'export interface Fixture { value: number }',
    'export type Fixture = { value: number };',
  ]) {
    const rules = await blockingRules(`${tsHeader}/** */\n${declaration}`);
    assert.ok(
      rules.includes('jsdoc/require-description'),
      `${declaration}: ${JSON.stringify(rules)}`,
    );
  }
  assert.ok(
    (
      await blockingRules('/** @packageDocumentation */\nimport "react";')
    ).includes('jsdoc/require-description'),
  );
  assert.ok(
    (
      await blockingRules(
        '/** @file */\nimport "react";',
        'scripts/documentation-fixture.mjs',
      )
    ).includes('jsdoc/require-description'),
  );
});

test('named property callables and wrapped components require documentation', async () => {
  for (const declaration of [
    '/** Fixture class. */\nexport class Fixture { helper = () => 1; }',
    'const fixture = { helper: () => 1 }; fixture.helper();',
    'const fixture = { helper() { return 1; } }; fixture.helper();',
    'const fixture = { helper: function () { return 1; } }; fixture.helper();',
    'export const Fixture = memo(() => <h1>Fixture</h1>);',
    'export const Fixture = React.memo(() => <h1>Fixture</h1>);',
    'export const Fixture = forwardRef(() => <h1>Fixture</h1>);',
    'const Fixture = memo(() => <h1>Fixture</h1>); Fixture();',
    'const Fixture = React.forwardRef(() => <h1>Fixture</h1>); Fixture();',
    '/** Fixture contract. */\nexport interface Fixture { helper(): number; }',
  ]) {
    const rules = await blockingRules(tsHeader + declaration);
    assert.ok(
      rules.includes('jsdoc/require-jsdoc'),
      `${declaration}: ${JSON.stringify(rules)}`,
    );
  }
});

test('documented named property callables and wrapped components pass', async () => {
  const [result] = await eslint.lintText(
    `${tsHeader}
import { memo, forwardRef } from "react";
/** Fixture class. */
export class FixtureClass {
  /** Supply a deterministic value.\n * @returns The fixture value. */
  helper = () => 1;
}
const fixture = {
  /** Supply a deterministic value.\n * @returns The fixture value. */
  helper: () => 1,
  /** Supply another deterministic value.\n * @returns The fixture value. */
  other() { return 1; },
};
fixture.helper();
/** Render a memoized fixture heading.\n * @returns The fixture heading. */
export const MemoFixture = memo(
  /** Render the memoized fixture.\n * @returns The fixture heading. */
  () => <h1>Fixture</h1>
);
/** Render a ref-capable fixture heading.\n * @returns The fixture heading. */
export const RefFixture = forwardRef(
  /** Render the ref-capable fixture.\n * @returns The fixture heading. */
  () => <h1>Fixture</h1>
);
/** Render a local memoized fixture heading.\n * @returns The fixture heading. */
const LocalFixture = memo(
  /** Render the local fixture.\n * @returns The fixture heading. */
  () => <h1>Fixture</h1>
);
console.log(LocalFixture);
/** Fixture contract. */
export interface FixtureContract {
  /** Supply a deterministic value.\n * @returns The fixture value. */
  helper(): number;
}
`,
    { filePath: 'tests/unit/documentation-fixture.tsx' },
  );
  assert.deepEqual(
    result.messages.filter((message) => message.severity === 2),
    [],
  );
});

test('callable contracts require parameter and result documentation', async () => {
  for (const signature of [
    'helper(value: number): number;',
    'helper: (value: number) => number;',
  ]) {
    for (const [comment, rule] of [
      [
        '/** Supply a fixture value.\n * @returns The incremented value. */',
        'jsdoc/require-param',
      ],
      [
        '/** Supply a fixture value.\n * @param value - Starting value. */',
        'jsdoc/require-returns',
      ],
      [
        '/** Supply a fixture value.\n * @param value\n * @returns The incremented value. */',
        'jsdoc/require-param-description',
      ],
      [
        '/** Supply a fixture value.\n * @param value - Starting value.\n * @returns */',
        'jsdoc/require-returns-description',
      ],
    ]) {
      const rules = await blockingRules(
        `${tsHeader}/** Fixture contract. */\nexport interface Fixture { ${comment}\n${signature} }`,
      );
      assert.ok(
        rules.includes(rule),
        `${signature} ${rule}: ${JSON.stringify(rules)}`,
      );
    }
    assert.deepEqual(
      await blockingRules(
        `${tsHeader}/** Fixture contract. */\nexport interface Fixture { /** Supply a fixture value.\n * @param value - Starting value.\n * @returns The incremented value. */\n${signature} }`,
      ),
      [],
    );
  }
});

test('wrapped callable signatures require their own complete documentation', async () => {
  for (const wrapper of [
    'memo',
    'forwardRef',
    'React.memo',
    'React.forwardRef',
  ]) {
    const prefix = `${tsHeader}import React, { memo, forwardRef } from "react";\nconsole.log(React, memo, forwardRef);\n/** Properties for a fixture heading. */\ninterface FixtureProps { /** Public heading text. */ title: string; }\n/** Wrapped fixture heading. */\nexport const Fixture = ${wrapper}(`;
    for (const [comment, rule] of [
      ['', 'jsdoc/require-jsdoc'],
      [
        '/** Render the fixture.\n * @returns The fixture heading. */',
        'jsdoc/require-param',
      ],
      [
        '/** Render the fixture.\n * @param props - Heading properties. */',
        'jsdoc/require-returns',
      ],
      [
        '/** Render the fixture.\n * @param props\n * @returns The fixture heading. */',
        'jsdoc/require-param-description',
      ],
      [
        '/** Render the fixture.\n * @param props - Heading properties.\n * @returns */',
        'jsdoc/require-returns-description',
      ],
    ]) {
      const rules = await blockingRules(
        `${prefix}${comment}\n(props: FixtureProps) => <h1>{props.title}</h1>);`,
      );
      assert.ok(
        rules.includes(rule),
        `${wrapper} ${rule}: ${JSON.stringify(rules)}`,
      );
    }
    const valid = `${prefix}/** Render the fixture.\n * @param props - Heading properties.\n * @returns The fixture heading. */\n(props: FixtureProps) => <h1>{props.title}</h1>);`;
    const [result] = await eslint.lintText(valid, {
      filePath: 'tests/unit/documentation-fixture.tsx',
    });
    assert.deepEqual(
      result.messages.filter((message) => message.severity === 2),
      [],
    );
  }
});
