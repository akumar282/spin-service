module.exports = {
    env: {
        node: true,
        es6: true,
        jest: true,
    },
    extends: [
        'standard',
        'prettier',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [['@services', './lib/services']],
                extensions: ['.js', '.ts'],
            },
        },
    },
    parser: '@typescript-eslint/parser',
    plugins: ['prettier', 'standard', 'babel', '@typescript-eslint'],
    rules: {
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
                leadingUnderscore: 'allow',
            },
        ],
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-use-before-define': 0,
        '@typescript-eslint/member-delimiter-style': 0,
        indent: [0, 2, { SwitchCase: 1 }],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single', { avoidEscape: true }],
        semi: ['error', 'never'],
        'no-unused-vars': 2,
        'no-mixed-operators': 2,
        'no-useless-escape': 2,
        'import/no-unresolved': [2, { caseSensitive: true, commonjs: true }],
        'no-template-curly-in-string': 0,
        'prefer-template': 2,
        'no-new': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        'no-unused-expressions': 'off',
        'babel/no-unused-expressions': 'error',
    },
}
