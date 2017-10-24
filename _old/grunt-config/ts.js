module.exports = function (grunt) {
	return {
		options: {
			module : "amd",
			target: "es5",
			allowJs: false,
			failOnTypeErrors: true,
			preserveConstEnums: false,
			verbose: false,
			declaration: false,
			sourceMap: false,
			comments: false,
			rootDir: '../',
			jsx: "react",
			allowUnreachableCode : true,
			downlevelIteration : true,
			lib : ["es2015", "es2015.iterable", "dom"],
			exclude: [
				"node_modules"
			]
		},
		test: {
			src: ['../src/test/Test.tsx'],
			dest: 'temp/typescript/',
			/*
			tsconfig: 'tsconfig.json'
			tsconfig: {
				ignoreFiles: false,
				ignoreSettings: false,
				overwriteFilesGlob: false,
				updateFiles: true,
				passThrough: false
			}
			*/
		}
	}
};