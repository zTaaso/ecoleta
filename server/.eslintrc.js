module.exports = {
	env: {
		es6: true,
		node: true,
	},
	extends: ['airbnb-base', 'prettier'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		indent: 'off',
		'no-tabs': 'off',
		'import/prefer-default-export': 'off',
		'class-methods-use-this': 'off',
		'no-unused-vars': 'off',
		camelcase: 'off',
	},
};
