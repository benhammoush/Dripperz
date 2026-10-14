/**
 * Blocking source and documentation rules for all handwritten JS/TS surfaces.
 * @file
 */

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import tsdoc from 'eslint-plugin-tsdoc';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';

// Named arrows are contracts; anonymous callbacks in tests and configuration are not.
// Wrapped component declarations need the outer export context so a docblock above
// `export const` is recognized; selecting its inner declaration misses that comment.
const contexts = [
  'FunctionDeclaration',
  'FunctionExpression[parent.type="VariableDeclarator"]',
  'ArrowFunctionExpression[parent.type="VariableDeclarator"]',
  'FunctionExpression[id]',
  'CallExpression[callee.name=/^(memo|forwardRef)$/] > :matches(ArrowFunctionExpression, FunctionExpression)',
  'CallExpression[callee.object.name="React"][callee.property.name=/^(memo|forwardRef)$/] > :matches(ArrowFunctionExpression, FunctionExpression)',
  'MethodDefinition',
  'Property[value.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
  'PropertyDefinition[value.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
  'VariableDeclaration:not([parent.type="ExportNamedDeclaration"]):has(VariableDeclarator > CallExpression[callee.name=/^(memo|forwardRef)$/])',
  'VariableDeclaration:not([parent.type="ExportNamedDeclaration"]):has(VariableDeclarator > CallExpression[callee.object.name="React"][callee.property.name=/^(memo|forwardRef)$/])',
  'ExportNamedDeclaration:has(VariableDeclaration > VariableDeclarator > CallExpression[callee.name=/^(memo|forwardRef)$/])',
  'ExportNamedDeclaration:has(VariableDeclaration > VariableDeclarator > CallExpression[callee.object.name="React"][callee.property.name=/^(memo|forwardRef)$/])',
  'ClassDeclaration',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'TSMethodSignature',
  'TSPropertySignature[typeAnnotation.typeAnnotation.type="TSFunctionType"]',
];

// Structural checks need signature nodes, not only the presence contexts above.
const callableContexts = [
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'TSMethodSignature',
  'TSPropertySignature[typeAnnotation.typeAnnotation.type="TSFunctionType"]',
];

const documentationRules = {
  'jsdoc/require-jsdoc': [
    'error',
    {
      contexts,
      require: { FunctionDeclaration: true, ClassDeclaration: true },
      exemptEmptyFunctions: false,
      exemptEmptyConstructors: false,
    },
  ],
  'jsdoc/require-description': ['error', { contexts: ['any'], exemptedBy: [] }],
  'jsdoc/check-tag-names': ['error', { definedTags: ['packageDocumentation'] }],
  'jsdoc/check-param-names': 'error',
  'jsdoc/require-param': ['error', { contexts: callableContexts }],
  'jsdoc/require-param-description': ['error', { contexts: ['any'] }],
  'jsdoc/require-returns': [
    'error',
    {
      contexts: [
        'ArrowFunctionExpression',
        'FunctionDeclaration',
        'FunctionExpression',
        'TSMethodSignature',
        {
          context:
            'TSPropertySignature[typeAnnotation.typeAnnotation.type="TSFunctionType"]:not([typeAnnotation.typeAnnotation.returnType.typeAnnotation.type="TSVoidKeyword"]):not([typeAnnotation.typeAnnotation.returnType.typeAnnotation.type="TSUndefinedKeyword"]):not([typeAnnotation.typeAnnotation.returnType.typeAnnotation.type="TSNeverKeyword"])',
          forceRequireReturn: true,
        },
      ],
    },
  ],
  'jsdoc/require-returns-description': ['error', { contexts: ['any'] }],
  'jsdoc/valid-types': 'error',
};

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'src/generated/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.node } },
    plugins: { jsdoc },
    settings: { jsdoc: { mode: 'typescript' } },
    rules: { ...js.configs.recommended.rules, ...documentationRules },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: { 'jsdoc/require-file-overview': 'error' },
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { tsdoc },
    rules: {
      'tsdoc/syntax': 'error',
      'jsdoc/no-types': 'error',
      'jsdoc/require-file-overview': [
        'error',
        {
          tags: {
            packageDocumentation: {
              initialCommentsOnly: true,
              mustExist: true,
              preventDuplicates: true,
            },
            file: { mustExist: false },
          },
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/unit/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      ...hooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
    },
  },
];
