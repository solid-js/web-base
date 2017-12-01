module.exports = function (grunt, __)
{
	// ------------------------------------------------------------------------- TYPESCRIPT

	grunt.loadNpmTasks('grunt-ts');
	grunt.config('ts', {
		default: {
			options: {
				rootDir : '.'
			},

			// Compile every files and keep architecture for AMD optimization
			outDir : __.amdFilesRoot,

			// Load tsconfig.json file
			tsconfig: true
		}
	});


	// ------------------------------------------------------------------------- AMD BUNDLING

	grunt.loadNpmTasks('grunt-amd-compile');
	grunt.config('amdCompile', {

		options: {
			/**
			 * AMD modules root. When optimizing AMD modules, we need to know where is the base.
			 *
			 * Example, if we have a module in this file architecture :
			 * temp/amd/my/Module.js
			 *
			 * Default optimization path will be :
			 * temp/amd/my/Module
			 *
			 * But if the module path wanted is in fact "my/Module"
			 * set root to "temp/amd/"
			 */
			root: __.amdFilesRoot,

			/**
			 * Add grunt uglify targets from this config.
			 * Use "grunt uglify" to uglify all amdCompile targets.
			 * Use "grunt uglify:common" to uglify only "common" amdCompile target.
			 */
			addUglifyTargets : true
		},

		/**
		 * Our project static libraries
		 * No AMD optimization, we just concat every files into one big bundle.
		 * IMPORTANT : Not found files here will not throw error or warning, be careful when adding a file path
		 */
		staticLibs: {

			options: {
				// No need for AMD optimization, we use them from the global scope
				justConcat: true
			},

			files: [
				// Jquery lib
				__.nodeModulesPath + 'jquery/dist/jquery.min.js',

				// React lib
				(
					__.optimizedTarget
					? __.nodeModulesPath + 'react/umd/react.production.min.js'
					: __.nodeModulesPath + 'react/umd/react.development.js'
				),

				// React-dom lib
				(
					__.optimizedTarget
					? __.nodeModulesPath + 'react-dom/umd/react-dom.production.min.js'
					: __.nodeModulesPath + 'react-dom/umd/react-dom.development.js'
				),

				// Three lib
				__.nodeModulesPath + 'three/build/three.min.js',

				// GSAP lib
				__.nodeModulesPath + 'gsap/src/minified/TweenLite.min.js',
				__.nodeModulesPath + 'gsap/src/minified/TimelineLite.min.js',
				__.nodeModulesPath + 'gsap/src/minified/jquery.gsap.min.js',
				__.nodeModulesPath + 'gsap/src/minified/easing/*.js',
				__.nodeModulesPath + 'gsap/src/minified/plugins/*.js',

				// PIXI lib
				__.nodeModulesPath + 'pixi.js/dist/pixi.min.js',

				// Typescript helpers
				__.nodeModulesPath + 'tslib/tslib.js',

				// Include AMD Lite module system and its configuration
				__.nodeModulesPath + 'amd-lite/amdLite.min.js',
				__.srcPath + 'common/config/amdLite.config.js'
			],
			dest: __.assetsDestination + 'js/static-libs.js'
		},

		/**
		 * Common project modules.
		 * Here are all common components or pages to all apps.
		 * Also includes Solidify used lib files.
		 * Uses static libs.
		 */
		common: {
			files: [
				__.amdFilesRoot + 'node_modules/' + __.allJsFiles,
				__.amdFilesRoot + 'src/common/' + __.allJsFiles
			],
			dest: __.assetsDestination + 'js/common.js'
		},

		/**
		 * App target
		 * Uses static libs and common modules.
		 */
		myApp1: {
			src: __.amdFilesRoot + 'src/myApp1/' + __.allJsFiles,
			dest: __.assetsDestination + 'js/my-app-1.js'
		},

		/**
		 * App target
		 * Uses static libs and common modules.
		 */
		myApp2: {
			src: __.amdFilesRoot + 'src/myApp2/' + __.allJsFiles,
			dest: __.assetsDestination + 'js/my-app-2.js'
		}
	});


	// ------------------------------------------------------------------------- UGLIFY

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.config('uglify', {
		options: {
			mangle: false,
			report: 'gzip',
			comments: false,
			compress: true,
			beautify: false,
			banner: "// {= grunt.template.today('yyyy-mm-dd HH:MM:ss') }\n"
		}
	});
};
