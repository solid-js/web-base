module.exports = function (grunt)
{
	// require('time-grunt')(grunt);


	grunt.config.initConfig({
		path: {
			config				: './grunt-config/',
			temp				: './temp/',
			src					: '../src/',
			lib					: '../lib/',
			deploy				: '../deploy/'
		}
	});

	// Change default delimiters
	grunt.template.addDelimiters('config', '{', '}');

	// Autoload grunt tasks
	require('load-grunt-tasks')(grunt);

	// Load grunt sub-configurations
	require('./solid/grunt-config-loader').load([
		'less',
		'typescript'
	]);

	// Overload grunt config with asset oriented files
	require('./solid/dynamic-grunt').load([

		// This file includes all static javascript dependencies
		{
			type: 'js',
			name: 'static-js',
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
				'{= path.lib }gsap/src/minified/plugins/*.js'
			]
		},

		// Common dependencies
		{
			type: 'module',
			name: 'common',

			js: '{= path.deploy }assets/js/common.js',
			css: '{= path.deploy }assets/css/common.css',

			root: '{= path.src }common'
		},

		// Package module 1
		{
			type: 'module',
			name: 'myModule1',

			js: '{= path.deploy }assets/js/my-module-1.js',
			css: '{= path.deploy }assets/css/my-module-1.css',

			root: '{= path.src }myModule1'
		},

		// Package module 2
		{
			type: 'module',
			name: 'myModule2',

			js: '{= path.deploy }assets/js/my-module-2.js',
			css: '{= path.deploy }assets/css/my-module-1.css',

			root: '{= path.src }myModule2'
		}
	]);
};





function test ()
{
	// ------------------------------------------------------------------------- TASK

	// Populate grunt config dynamically
	require('./solid/dynamic-grunt').populateGruntConfig(grunt, staticConfig,

		// --------------------------------------------------------------------- BUNDLES CONFIG
		[
			// Package static JS libraries in one file
			{
				type: 'js',
				name: 'static-js',
				dest: 'deploy/js/static-libs.js',
				src: [
					// AMD modules management with async define and requirejs statements
					'lib/requirejs/require.js',

					// define.amd is disabled so helpers libs like jQuery and handlebars are available in window, no need to require them
					'build/solid/require-disable-AMD.js',

					// JQUERY on window
					'lib/jquery/dist/jquery.min.js',

					// HANDLEBARS TEMPLATING on window
					'lib/handlebars/handlebars.js',

					// Q on window
					'lib/q/q.js',

					// GSAP on window
					'lib/gsap/src/minified/TweenLite.min.js',
					'lib/gsap/src/minified/TimelineLite.min.js',
					'lib/gsap/src/minified/jquery.gsap.min.js',
					'lib/gsap/src/minified/easing/*.js',
					'lib/gsap/src/minified/plugins/*.js',

					// SOLID JS framework
					'lib/solid-js/**/*.ts'
				]
			},

			// Package static CSS libraries
			{
				type: 'css',
				name: 'static-css',
				dest: 'deploy/css/static-libs.css',
				src: [
					'lib/knacss/less/knacss.less'
				]
			},

			// Package components
			{
				type: 'app',
				name: 'components',
				js: 'deploy/js/components.js',
				css: 'deploy/css/components.css',
				app: 'src/components/',
				include: [
					'**/'
				]
			},

			// Package front app in one file
			{
				type: 'app',
				name: 'front-app',
				js: 'deploy/js/front-app.js',
				css: 'deploy/css/front-app.css',
				app: 'src/apps/front/',
				include: [
					'common/',
					'pages/'
				]
			},

			// Package back app in one file
			{
				type: 'app',
				name: 'back-app',
				js: 'deploy/js/back-app.js',
				css: 'deploy/css/back-app.css',
				app: 'src/apps/back/',
				include: [
					'common/',
					'pages/'
				]
			}
		],

		// --------------------------------------------------------------------- GRUNT CONFIG
		{
			// Load package definitions
			pkg: grunt.file.readJSON('package.json'),

			// Compile less files
			less: {
				options: {
					cleancss: false,
					compress: false
				}
			},

			// Concat multiples files
			concat: {
				options: {

					// Remove all comments
					stripBanners: {
						block: true,
						line: true
					},

					// Use ES5 strict mode
					banner: '"use strict";\n\n',
					separator: '\n'
				}
			},

			// Typescript compilation
			ts: {
				options: {
					// Compile modules as AMD
					module: 'amd',

					// Target for ES5 javascript (ie9+)
					target: 'es5',

					// Some stuff
					declaration: false,
					sourceMap: false,
					comments: false,
					verbose: false
					//fast: 'never'
				}
			},

			// Requirejs compilation, preparing AMD modules and concatenating app as one file
			requirejs: {
				options: {
					paths: {},
					findNestedDependencies: false,
					generateSourceMaps: false,
					wrap: false,
					useStrict: false,
					optimize: "none"
				}
			},

			// Clean extends statements added by typescript compiler
			cleanTsExtends: {},

			// Add modules path available in each modules as a string
			jsModulePath: {},

			// Clean-up dirty folders
			clean: {},

			// Compile handlebars templates to JS
			handlebars: {
				options: {
					// Where are stored templates on window
					namespace: 'TemplateFiles'
				}
			},

			// Compile JSON files to JS
			json: {
				options: {
					// Where are stored json files on window
					namespace: 'JsonFiles'
				}
			},

			// Obfuscate and compress javascript
			uglify: {
				options: {
					mangle: false,
					report: 'gzip',
					footer: "window.__disableLogs = true;"
				}
			},

			// Obfuscate and compress css
			cssmin: {
				options: {
					report: 'gzip',
					shorthandCompacting: false
				}
			},

			// Add vendor prefix for css properties
			autoprefixer: {
				options: {
					browsers: ['last 2 versions']
				}
			},

			// Compose HTML files from handlebars templates
			assemble: {

			},

			// Watch file change
			watch: {
				options: {
					livereload: true,
					interrupt: true
				}
			},

			// Integrated webserver
			connect: {
				deploy: {
					options: {
						useAvailablePort: true,
						base: staticConfig.projectWorkingDirectory + 'deploy/',
						livereload: true,
						open: true
					}
				}
			},

			// Execute shell stuff
			shell: {}
		}
	);

	// By default, compile all bundles and watch
	grunt.registerTask('default', ['clean:all', 'all', 'connect:deploy', 'watch']);
	grunt.registerTask('start', ['connect:deploy', 'watch']);
}