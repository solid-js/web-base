

module.exports = function (grunt)
{
	var typescriptRoot = 'temp/typescript/';
	var allJsFiles = '**/*.js';
	var assetsDestination = 'www/assets/';
	var nodeModules = 'node_modules/';

	grunt.initConfig({

		exec: {
			tsc: 'tsc'
		},

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
					'node_modules/tslib/tslib.js',
					'node_modules/jquery/dist/jquery.min.js',
					'node_modules/react/umd/react.development.js',
					'node_modules/react-dom/umd/react-dom.development.js',
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
				files: [{
					src: typescriptRoot + 'src/myApp1/' + allJsFiles,
					dest: assetsDestination + 'js/my-app-1.js'
				}]
			},
			myApp2: {
				files: [{
					src: typescriptRoot + 'src/myApp2/' + allJsFiles,
					dest: assetsDestination + 'js/my-app-2.js'
				}]
			}
		}
	});

	// Load local grunt tasks after config is loaded
	grunt.task.loadTasks('build/grunt-tasks/');

	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-ts');

	grunt.registerTask('apps', ['ts:default', 'compileAmd']);

	//grunt.registerTask('default', ['exec:tsc', 'concat:tsc']);
};