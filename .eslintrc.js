const path = require('path');
module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    plugins: [
        '@typescript-eslint',
    ],
    env: {
        node: true,
        es2017: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    ignorePatterns: ['node_modules/', 'build/', 'imgs/'],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off"
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'max-len': ['error', {'code': 120, 'ignorePattern': '^\s*console\.log'}],
        'comma-spacing': 'error',
        'no-trailing-spaces': 'error',
        'no-debugger': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'quotes': ['error', 'single'],
        'radix': 'error',
        'no-multiple-empty-lines': ['error', {'max': 1, 'maxEOF': 0, 'maxBOF': 0}],
        'eol-last': 'error',
        'no-duplicate-imports': 'error',
        'no-dupe-keys': 'error',
        'semi-style': 'error',
        'semi': 'error',
        'no-multi-spaces': 'error'
    },
};
