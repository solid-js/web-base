module.exports = function (grunt) {
	return {
		options: {
			failOnTypeErrors: true,
			preserveConstEnums: false,
			verbose: false,
			declaration: false,
			sourceMap: false,
			comments: false,

			// Ajouter les librairies es2015 pour le compilarteur typescript
			// @link : https://github.com/angular/angular/issues/14595
			//lib : ["es2015", "es2015.iterable", "dom"]
			lib : ["es6", "dom"]
		}
	}
};