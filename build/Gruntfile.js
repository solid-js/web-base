module.exports = function (grunt)
{
	// ------------------------------------------------------------------------- INIT

	// Change default delimiters
	grunt.template.addDelimiters('config', '{', '}');

	// Autoload grunt tasks
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);


	// ------------------------------------------------------------------------- GLOBAL CONFIG

	// Init global config parameters
	grunt.config.init({

		// Load package definitions
		pkg: grunt.file.readJSON('package.json'),

		// Configure global paths. This is flexible but please keep it simple.
		// Important : please include trailing slash for all folders
		path: {
			// Root folder (have to contain lib and src)
			root			: '../',

			// Folder containing grunt configuration files
			config			: './grunt-config/',

			// Path to the temp folder for asset packing processing
			temp			: './temp/',

			// Path to the source (your project)
			src				: '../src/',

			// Path to the libs (bower libs)
			lib				: '../lib/',

			// Path to the deploy (output files pushed to the server)
			deploy			: '../deploy/'
		},

		// Configure asset packer
		assetPacker: {
			// Main typescript and less filename for modules
			main			: 'Main',

			// Where AMD modules are stored before concat
			typescriptTemp	: '{= path.temp }typescript/',

			// File selector targeting all typescript definition files
			definitions		: './typescript-definitions/**/*.d.ts'
		}
	});


	// ------------------------------------------------------------------------- CONFIG LOADER

	// Load grunt sub-configurations
	require('./solid/grunt-config-loader').load(grunt, [
		'autoprefixer',
		'clean',
		'concat',
		'cssmin',
		'handlebars',
		'json',
		'less',
		'ts',
		'uglify',
		'watch'
	]);


	// ------------------------------------------------------------------------- ASSET PACKER

	// Overload grunt config with asset oriented files
	require('./solid/grunt-assets-packer').load(grunt, [

		// This file includes all static javascript dependencies
		{
			type: 'js',
			name: 'libs',

			dest: '{= path.deploy }assets/js/static-libs.js',
			src: [
				// AMD modules management with async define and requirejs statements
				'{= path.lib }requirejs/require.js',

				// define.amd is disabled so helpers libs like jQuery and handlebars are available in window scope, without require them
				'{= path.lib }solidify/build/require-disable-AMD.js',

				// JQUERY on window
				'{= path.lib }jquery/dist/jquery.min.js',

				// HANDLEBARS TEMPLATING on window
				'{= path.lib }handlebars/handlebars.js',

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

		// Package module 1
		{
			type: 'module',
			name: 'myModule1',

			// Output files
			js: '{= path.deploy }assets/js/my-module-1.js',
			css: '{= path.deploy }assets/css/my-module-1.css',

			// Included folders
			include: ['components/']
		},

		// Package module 2
		{
			type: 'module',
			name: 'myModule2',

			// Output files
			js: '{= path.deploy }assets/js/my-module-2.js',
			css: '{= path.deploy }assets/css/my-module-2.css',

			// Included folders
			include: ['components/']
		},

		// Common dependencies
		{
			// Caveat :
			// Common is declared after modules because we need to know app dependencies to include libs
			// If you build common without previously built modules, libs dependencies will be missing

			type: 'module',
			name: 'common',

			// Output files
			js: '{= path.deploy }assets/js/common.js',
			css: '{= path.deploy }assets/css/common.css',

			// Included folders
			include: ['components/'],

			// Include solidify AMD modules
			// By default, only direct module dependencies are included
			includeAmd: ['lib/solidify/']
		}
	]);


	// ------------------------------------------------------------------------- TASKS

	// By default, compile all bundles and watch
	grunt.registerTask('default', ['clean:all', 'all', 'watch']);
};