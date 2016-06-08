module.exports = function (grunt)
{
	// This grunt module is meant to overload grunt config with asset oriented files.

	return {
		options: {

			// Main typescript and less filename for modules
			main			: 'Main',

			// Where AMD modules are stored before concat
			typescriptTemp	: '{= path.temp }typescript/',

			// File selector targeting all typescript definition files
			definitions		: [
				// Global definitions, loaded by TSD or "typings"
				'./typings/index.d.ts',

				// Solidify definitions, only needed with solidify
				'{= path.lib}solidify/definitions/*.d.ts'
			]
		},


		// This file includes all static javascript dependencies
		libs: {
			type: 'js',

			dest: '{= path.deploy }assets/js/static-libs.js',
			src: [
				// Patch ie console
				'{= path.lib }solidify/build/patch-ie-console.js',

				// AMD modules management with async define and requirejs statements
				'{= path.lib }requirejs/require.js',

				// define.amd is disabled so helpers libs like jQuery and handlebars are available in window scope, without require them
				'{= path.lib }solidify/build/require-disable-AMD.js',

				// JQUERY on window
				'{= path.lib }jquery/dist/jquery.min.js',

				// Q on window
				'{= path.lib }q/q.js',

				// GSAP on window
				'{= path.lib }gsap/src/minified/TweenLite.min.js',
				'{= path.lib }gsap/src/minified/TimelineLite.min.js',
				'{= path.lib }gsap/src/minified/jquery.gsap.min.js',
				'{= path.lib }gsap/src/minified/easing/*.js',
				'{= path.lib }gsap/src/minified/plugins/*.js',

				// React on window
				'{= path.lib }react/react.js',
				'{= path.lib }react/react-dom.js',

				// Path React on __React
				'{= path.lib }solidify/build/require-patch-react-scope.js'
			]
		},

		// First module, the name is important, it will be loaded in src folder following this name
		myModule1: {

			// Output files
			js: '{= path.deploy }assets/js/my-module-1.js',
			css: '{= path.deploy }assets/css/my-module-1.css',

			// Included folders
			include: ['components/', 'pages/']
		},

		// Second module
		myModule2: {

			// Output files
			js: '{= path.deploy }assets/js/my-module-2.js',
			css: '{= path.deploy }assets/css/my-module-2.css',

			// Included folders
			include: ['components/', 'pages/']
		},

		// Common dependencies (will be loaded in src folder)
		common: {
			// FIXME : issue
			// Common is declared after modules because we need to know app dependencies to include libs
			// If you build common without previously built modules, libs dependencies will be missing

			// Output files
			js: '{= path.deploy }assets/js/common.js',
			css: '{= path.deploy }assets/css/common.css',

			// Included folders
			include: ['components/'],

			// Include solidify AMD modules
			// By default, only direct module dependencies are included
			includeAmd: ['lib/solidify/']
		}
	}
};