module.exports = function (grunt)
{
	// This grunt module is meant to overload grunt config with asset oriented files.

	return {
		options: {

			// Main typescript and less filename for apps
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

			// Use array to use different files for regular and optimised targets.
			// First index will be regular and second will be optimised.
			src: [
				// Patch ie console
				'{= path.lib }solidify/build/patch-ie-console.js',

				// JQUERY on window
				'{= path.lib }jquery/dist/jquery.min.js',

				// JQUERY MouseWheel plugin
				'{= path.lib }jquery-mousewheel/jquery.mousewheel.js',

				// Q on window
				'{= path.lib }q/q.js',

				// GSAP on window
				'{= path.lib }gsap/src/minified/TweenLite.min.js',
				'{= path.lib }gsap/src/minified/TimelineLite.min.js',
				'{= path.lib }gsap/src/minified/jquery.gsap.min.js',
				'{= path.lib }gsap/src/minified/easing/*.js',
				'{= path.lib }gsap/src/minified/plugins/*.js',

				// [option] PIXI GSAP Plugin
				//'{= path.lib }gsap-pixi-plugin/PixiPlugin.js',

				// [option] React on window
				[
					'{= path.lib }react/react.js',
					'{= path.lib }react/react.min.js'
				],
				[
					'{= path.lib }react/react-dom.js',
					'{= path.lib }react/react-dom.min.js'
				],

				// [option] Path React on __React
				'{= path.lib }solidify/build/require-patch-react-scope.js',

				// AMD modules management with async define and requirejs statements
				// We load require after so every lib loaded before is on window ;)
				'{= path.lib }requirejs/require.js'
			]
		},

		// First app, the name is important, it will be loaded in src folder following this name
		myApp1: {

			// Output files
			js: '{= path.deploy }assets/js/my-app-1.js',
			css: '{= path.deploy }assets/css/my-app-1.css',

			// Included folders
			include: ['components/', 'pages/']
		},

		// Second app
		myApp2: {

			// Output files
			js: '{= path.deploy }assets/js/my-app-2.js',
			css: '{= path.deploy }assets/css/my-app-2.css',

			// Included folders
			include: ['components/', 'pages/']
		},

		// Common dependencies (will be loaded in src folder)
		common: {
			// FIXME : issue
			// Common is declared after apps because we need to know app dependencies to include libs
			// If you build common without previously build apps, libs dependencies will be missing

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