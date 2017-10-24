

module.exports = function (grunt)
{
	var typescriptRoot = 'temp/typescript/';
	var allJsFiles = '**/*.js';
	var assetsDestination = 'www/assets/';
	var nodeModules = 'node_modules/';

	grunt.initConfig({

		ts: {
			default: {
				tsconfig: true
			}
		},

		compileAmd: {
			options: {
				root: 'typescript/'
			},
			staticLibs: {
				options: {
					justConcat: true
				},
				files: [
					// Jquery lib
					'node_modules/jquery/dist/jquery.min.js',

					// React libs
					'node_modules/react/umd/react.development.js',
					'node_modules/react-dom/umd/react-dom.development.js',

					// Three lib
					'node_modules/three/build/three.min.js',

					// Typescript compatibility helpers
					'node_modules/tslib/tslib.js',

					// Include AMD Lite module system and its configuration
					'src/amdLite.js',
					'src/amdLite.config.js',
				],
				dest: assetsDestination + 'js/static-libs.js'
			},
			common: {
				files: [
					typescriptRoot + 'lib/' + allJsFiles,
					typescriptRoot + 'src/common/' + allJsFiles
				],
				dest: assetsDestination + 'js/common.js'
			},
			myApp1: {
				src: typescriptRoot + 'src/myApp1/' + allJsFiles,
				dest: assetsDestination + 'js/my-app-1.js'
			},
			myApp2: {
				src: typescriptRoot + 'src/myApp2/' + allJsFiles,
				dest: assetsDestination + 'js/my-app-2.js'
			}
		}
	});

	// Load local grunt tasks after config is loaded
	grunt.task.loadTasks('build/grunt-tasks/');

	grunt.loadNpmTasks('grunt-ts');

	grunt.registerTask('apps', ['ts:default', 'compileAmd']);

	//grunt.registerTask('default', ['exec:tsc', 'concat:tsc']);
};