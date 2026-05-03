module.exports = {
  root: true,
  env: { 
    browser: true, 
    node: true, 
    es2022: true 
  },
  parser: '@typescript-eslint/parser',
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'logs/**',
    'reports/**',
    'screenshots/**',
    'videos/**'
  ]
};
