

module.exports = function (grunt)
{
	// ------------------------------------------------------------------------- CONFIG

	/**
	 * Read --optimized CLI option.
	 * If this option is added, bundles will be compressed.
	 */
	var optimizedTarget = grunt.option('optimized') || false;



	var amdFilesRoot = 'build/temp/amd/';
	var allJsFiles = '**/*.js';
	var allTsFiles = '**/*.(ts|tsx)';
	var allLessFiles = '**/*.less';
	var assetsDestination = 'www/assets/';

	var nodeModulesPath = 'node_modules/';
	var srcPath = 'src/';

	//var LessPluginAutoPrefix = require('less-plugin-autoprefix');


	// TODO : https://github.com/dylang/grunt-notify

	grunt.loadNpmTasks('grunt-wakeup');


	grunt.initConfig({});



	grunt.config('wakeup', {
		success: {
			options: {
				sound: 'looking-up',
				//sound: 'gentle-roll',
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
		amd: {
			src: amdFilesRoot + allJsFiles
		}
	});


	// ------------------------------------------------------------------------- LESS

	// Less plugins
	var lessPlugins = [

		/**
		 * Glob import plugin to allow importing folders in less :
		 * @import 'components/**';
		 */
		require('less-plugin-glob'),

		/**
		 * Auto-prefixer plugin to add vendor specific prefix
		 */
		new (require('less-plugin-autoprefix'))({

			// BrowersList syntax : https://github.com/ai/browserslist
			browsers: [
				'last 3 versions',
				'ie >= 11',
				'iOS >= 8'
			]
		})
	];

	/**
	 * Compress CSS if we have the --optimized option.
	 */
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


	// ------------------------------------------------------------------------- LESS 2 JS

	grunt.loadNpmTasks('grunt-less2js');
	grunt.config('less2js', {
		/**
		 * Extract top level less atom variables and store them as json.
		 * So JS runtime is aware of those variables without manually copying them.
		 * https://github.com/ixrock/grunt-less2js
		 */
		atoms: {
			options: {
				format: 'webjs',
				windowVariable: '__atoms',
				parseNumbers: true
			},
			src: srcPath + 'common/atoms/*.less',
			dest: amdFilesRoot + 'src/common/atoms/Atoms.js'
		}
	});

	// ------------------------------------------------------------------------- TYPESCRIPT


	grunt.loadNpmTasks('grunt-ts');
	grunt.config('ts', {
		default: {
			options: {
				rootDir : '.',
			},

			// Compile every files and keep architecture for AMD optimization
			outDir : amdFilesRoot,

			// Load tsconfig.json file
			tsconfig: true
		}
	});


	// ------------------------------------------------------------------------- AMD BUNDLING

	// Load local grunt tasks after config is loaded
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
			root: amdFilesRoot,

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
				srcPath + 'common/config/amdLite.config.js'
			],
			dest: assetsDestination + 'js/static-libs.js'
		},

		/**
		 * Common project modules.
		 * Here are all common components or pages to all apps
		 * Uses static libs.
		 */
		common: {
			files: [
				amdFilesRoot + 'lib/' + allJsFiles,
				amdFilesRoot + 'src/common/' + allJsFiles
			],
			dest: assetsDestination + 'js/common.js'
		},

		/**
		 * App target
		 * Uses static libs and common modules.
		 */
		myApp1: {
			src: amdFilesRoot + 'src/myApp1/' + allJsFiles,
			dest: assetsDestination + 'js/my-app-1.js'
		},

		/**
		 * App target
		 * Uses static libs and common modules.
		 */
		myApp2: {
			src: amdFilesRoot + 'src/myApp2/' + allJsFiles,
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

	/**
	 * Watch configuration
	 */
	grunt.config('watch', {

		options: {
			// File watch interval, default is 100
			// Higher value is slower to detect changes but can save some laptop batteries
			//interval: 300,

			// Trigger livereload after each watch task
			livereload: true,

			// New change can interrupt previous spawned task
			interrupt: true,

			// Spawn tasks into new process
			spawn: false
		},

		/**
		 * Remove all AMD files when a Typescript file is removed.
		 */
		typescriptClean : {
			options: {
				event: ['deleted']
			},
			files : srcPath + allTsFiles,
			tasks: ['clean:amd'] // FIXME : + scriptsWithoutStaticLibs ?
		},

		/**
		 * Compile all scripts when any Typescript file is updated.
		 * Do not re-bundle static-libs when a Typescript file is updated.
		 */
		scripts : {
			files : srcPath + allTsFiles,
			tasks: ['scriptsWithoutStaticLibs', 'wakeup:success']
		},

		/**
		 * Compile less and AMD when an atom definition is changed.
		 * This is because Atoms are shared between styles and scripts.
		 * No need for Typescript compilation.
		 */
		atoms : {
			files : srcPath + 'common/atoms/*.less',
			tasks: ['styles', 'amdCompile']
		},

		/**
		 * Compile styles when any less file is changed.
		 * No need for less2js task because we take care of it with watch.atoms
		 */
		styles : {
			files : srcPath + allLessFiles,
			tasks: ['less']
		}
	});


	// ------------------------------------------------------------------------- TASKS

	/**
	 * Full styles task.
	 * 1. Convert atoms from less to json. Stored into not optimized AMD files tree.
	 * 2. Compile less apps to code-splitted bundles.
	 */
	grunt.registerTask('styles', 'less2js:atoms', 'less');

	/**
	 * Full script task.
	 * 1. Compile Typescript to not optimized AMD files tree.
	 * 2. Compile AMD modules to code-splitted bundles.
	 * 3. Uglify bunles if we have --optimized option.
	 */
	var scriptsTasks = ['ts:default', 'amdCompile'];
	optimizedTarget && scriptTasks.push('uglify');
	grunt.registerTask('scripts', scriptsTasks);

	/**
	 * Script tasks, but without static libs bundling.
	 * Static libs do not need to be bundled when a Typescript source file is changed.
	 */
	var scriptsWithoutStaticLibsTasks = ['ts:default'];
	var amdCompileTargets = grunt.config('amdCompile');
	for (var i in amdCompileTargets)
	{
		if (i !== 'staticLibs' && i !== 'options')
			scriptsWithoutStaticLibsTasks.push('amdCompile:' + i);
	}
	grunt.registerTask('scriptsWithoutStaticLibs', scriptsWithoutStaticLibsTasks);

	/**
	 * Default task.
	 * 1. Clean AMD files tree and stuff.
	 * 2. Compile styles (before because we need atoms).
	 * 3. Compile scripts and uglify bundles if needed.
	 */
	grunt.registerTask('default', ['clean', 'styles', 'scripts', 'wakeup:success']);

	/**
	 * Watch task.
	 */
	grunt.registerTask('watch', ['default', 'watch']);
};