import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'docs/**',
      'coverage/**',
      '.husky/**',
      '.git/**',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^(next|_)' }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },
  prettier,
];

