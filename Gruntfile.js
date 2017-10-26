

module.exports = function (grunt)
{
	// ------------------------------------------------------------------------- CONFIG

	var optimizedTarget = grunt.option('optimized') || false;

	var typescriptRoot = 'build/temp/typescript/';
	var allJsFiles = '**/*.js';
	var allTsFiles = '**/*.(ts|tsx)';
	var allLessFiles = '**/*.less';
	var assetsDestination = 'www/assets/';

	var nodeModulesPath = 'node_modules/';
	var srcPath = 'src/';

	//var LessPluginAutoPrefix = require('less-plugin-autoprefix');

	grunt.loadNpmTasks('grunt-wakeup');


	grunt.initConfig({});



	grunt.config('wakeup', {
		success: {
			options: {
				sound: 'looking-up',
				notifications: false,
				output: false
			}
		}
	});


	/**
	 bloom
	 concern
	 connected
	 full
	 gentle-roll
	 high-boom
	 hollow
	 hope
	 jump-down
	 jump-up
	 looking-down
	 looking-up (default)
	 nudge
	 picked
	 puff
	 realization
	 second-glance
	 stumble
	 suspended
	 turn
	 unsure
	 */




	// ------------------------------------------------------------------------- CLEAN

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.config('clean', {
		typescript: {
			src: typescriptRoot + allJsFiles
		}
	});


	// ------------------------------------------------------------------------- LESS

	// Less plugins
	var lessPlugins = [

		// Glob import plugin to allow importing folders in less
		new require('less-plugin-glob'),

		// Auto-prefixer plugin to add vendor specific prefix
		new (require('less-plugin-autoprefix'))({
			browsers: [
				'last 3 versions',
				'ie >= 11',
				'ios >= 8'
			]
		})
	];

	// Add clean CSS less plugin if we are in optimizedTarget
	optimizedTarget && lessPlugins.push(
		new (require('less-plugin-clean-css'))({
			advanced: true
		})
	);

	// Configure less tasks
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.config('less', {

		options: {
			plugins: lessPlugins
		},

		common: {
			src: srcPath + 'common/Main.less',
			dest: assetsDestination + 'css/common.css'
		},

		myApp1: {
			src: srcPath + 'myApp1/Main.less',
			dest: assetsDestination + 'css/my-app-1.css'
		},

		myApp2: {
			src: srcPath + 'myApp2/Main.less',
			dest: assetsDestination + 'css/my-app-2.css'
		}
	});

	// ------------------------------------------------------------------------- TYPESCRIPT

	grunt.loadNpmTasks('grunt-ts');
	grunt.config('ts', {
		default: {
			tsconfig: true
		}
	});


	// ------------------------------------------------------------------------- AMD BUNDLING

	// Load local grunt tasks after config is loaded
	// FIXME : TEMP, push it to npm
	grunt.task.loadTasks('build/grunt-tasks/');

	grunt.config('compileAmd', {

		options: {
			/**
			 * AMD modules root. When optimizing AMD modules, we need to know where is the base.
			 *
			 * Example, if we have a module in this file architecture :
			 * temp/typescript/my/Module.js
			 *
			 * Default optimization path will be :
			 * temp/typescript/my/Module
			 *
			 * But if the module path wanted is in fact "my/Module"
			 * set root to "temp/typescript/"
			 */
			root: typescriptRoot,

			/**
			 * Added grunt uglify targets from this config.
			 * Use "grunt uglify" to uglify all compileAmd targets.
			 * Use "grunt uglify:common" to uglify only "common" compileAmd target.
			 */
			addUglifyTargets : true,


			addLessTargets : true,


			addWatchTargets : true
		},

		// Our project static libraries
		staticLibs: {

			options: {
				// No need for AMD optimization, we use them from the global scope
				justConcat: true
			},

			files: [
				// Jquery lib
				nodeModulesPath + 'jquery/dist/jquery.min.js',

				// React lib
				(
					optimizedTarget
						? nodeModulesPath + 'react/umd/react.production.min.js'
						: nodeModulesPath + 'react/umd/react.development.js'
				),

				// React-dom lib
				(
					optimizedTarget
						? nodeModulesPath + 'react-dom/umd/react-dom.production.min.js'
						: nodeModulesPath + 'react-dom/umd/react-dom.development.js'
				),

				// Three lib
				nodeModulesPath + 'three/build/three.min.js',

				// GSAP lib
				nodeModulesPath + 'gsap/src/minified/TweenLite.min.js',
				nodeModulesPath + 'gsap/src/minified/TimelineLite.min.js',
				nodeModulesPath + 'gsap/src/minified/jquery.gsap.min.js',
				nodeModulesPath + 'gsap/src/minified/easing/*.js',
				nodeModulesPath + 'gsap/src/minified/plugins/*.js',

				// PIXI lib
				nodeModulesPath + 'pixi.js/dist/pixi.min.js',

				// Typescript helpers
				nodeModulesPath + 'tslib/tslib.js',

				// Include AMD Lite module system and its configuration
				nodeModulesPath + 'amd-lite/amdLite.min.js',
				srcPath + 'common/configs/amdLite.config.js'
			],
			dest: assetsDestination + 'js/static-libs.js'
		},

		// Common project modules.
		// Here are all common components or pages to all apps
		// Uses static libs.
		common: {
			files: [
				typescriptRoot + 'lib/' + allJsFiles,
				typescriptRoot + 'src/common/' + allJsFiles
			],
			dest: assetsDestination + 'js/common.js'
		},

		// App target
		// Uses static libs and common modules.
		myApp1: {
			src: typescriptRoot + 'src/myApp1/' + allJsFiles,
			dest: assetsDestination + 'js/my-app-1.js'
		},

		// App target
		// Uses static libs and common modules.
		myApp2: {
			src: typescriptRoot + 'src/myApp2/' + allJsFiles,
			dest: assetsDestination + 'js/my-app-2.js'
		}
	});


	// ------------------------------------------------------------------------- UGLIFY

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.config('uglify', {
		options: {
			mangle: true,
			report: 'gzip',
			comments: false,
			banner: '// <%= grunt.template.today("yyyy-mm-dd hh:mm:ss TT") %>\n'
		}
	});


	// ------------------------------------------------------------------------- WATCH

	grunt.config('watch', {
		options: {
			//interval: 200,

			livereload: true,

			interrupt: true,

			spawn: false
		},

		/**
		 * Clean typescript compiled files when a typescript file is removed.
		 */
		typescriptClean : {
			options: {
				event: ['deleted']
			},
			files : srcPath + allTsFiles,
			tasks: ['clean:typescript']
		},

		/**
		 * Compile all scripts when any typescript file is updated.
		 */
		scripts : {
			files : srcPath + allTsFiles,

			// FIXME : How to avoid static-libs here ?
			tasks: ['scripts', 'wakeup:success']
		}
	});

	// ------------------------------------------------------------------------- TASKS

	var scriptsTasks = ['ts:default', 'compileAmd'];

	optimizedTarget && scriptTasks.push('uglify');

	grunt.registerTask('scripts', scriptsTasks);

	grunt.registerTask('styles', 'less');


	grunt.registerTask('default', ['clean', 'scripts', 'styles', 'wakeup:success']);

	grunt.registerTask('watch', ['default', 'watch']);
};