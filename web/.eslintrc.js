module.exports = {
   'env': {
      'browser': true,
      'es6': true,
   },
   'ignorePatterns': [
      '**/dist'
   ],
   'extends': [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:vue/essential'
   ],
   'globals': {
      'Atomics': 'readonly',
      'SharedArrayBuffer': 'readonly',
      'process': true,
      'module': true,
      'require': true
   },
   'parserOptions': {
      'ecmaVersion': 2018,
      'parser': '@typescript-eslint/parser',
      'sourceType': 'module'
   },
   'plugins': [
      'vue',
      '@typescript-eslint'
   ],

   'rules': {

      'vue/no-multiple-template-root': [
         'off'
      ],

      'vue/no-v-model-argument': [
         'off'
      ],

      '@typescript-eslint/explicit-module-boundary-types': [
         //https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-module-boundary-types.md
         'off'
      ],

      '@typescript-eslint/no-explicit-any': [
         'off'
      ],

      '@typescript-eslint/no-non-null-assertion': [
         'off'
      ],

      '@typescript-eslint/no-inferrable-types': [
         'off'
      ],

      'indent': [
         //Turning off because I'm not sure how to get it to require initial indent in vue scripts
         'off',
         3
      ],
      'quotes': [
         'error',
         'single'
      ],
      'semi': [
         'error',
         'always'
      ]
   }
};