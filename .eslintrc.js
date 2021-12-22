module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    parserOptions: {
        parser: 'babel-eslint',
        ecmaFeatures: {
            'legacyDecorators': true
        }
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-unused-vars': 'off',
        'no-extra-semi': 'off',
        'no-undef': 'off',
        'no-mixed-spaces-and-tabs': 'off',
        'vue/no-unused-components': 'off',
    }
}
