/**
 * Compare package and runtime identities without executing application code.
 * @file
 */

import ts from 'typescript';

/**
 * Read the deliberately literal runtime version and require exact metadata agreement.
 * @param {string} packageVersion - Version from package metadata.
 * @param {string} runtimeSource - Source of the public version module.
 * @returns {string} The matching version for diagnostic output.
 * @throws {Error} If the module is nonliteral, malformed or out of sync.
 */
export function assertVersionAlignment(packageVersion, runtimeSource) {
  const source = ts.createSourceFile(
    'appVersion.ts',
    runtimeSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const versions = [];
  for (const statement of source.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    ) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === 'APP_VERSION'
      ) {
        // Comments are not declarations; require an actual exported const string literal.
        if (
          !(statement.declarationList.flags & ts.NodeFlags.Const) ||
          !declaration.initializer ||
          !ts.isStringLiteral(declaration.initializer)
        ) {
          throw new Error(
            'APP_VERSION must be an exported const string literal.',
          );
        }
        versions.push(declaration.initializer.text);
      }
    }
  }
  if (
    source.parseDiagnostics.length ||
    versions.length !== 1 ||
    !/^\d+\.\d+\.\d+$/.test(versions[0]) ||
    versions[0] !== packageVersion
  ) {
    throw new Error('Package and literal runtime APP_VERSION must match.');
  }
  return versions[0];
}
