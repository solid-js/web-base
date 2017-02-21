module.exports = function (grunt)
{
	// ------------------------------------------------------------------------- INIT

	// Change default delimiters
	grunt.template.addDelimiters('config', '{', '}');

	// Init global config parameters
	grunt.config.init({

		// --------------------------------------------------------------------- GLOBAL CONFIG

		// Load package definitions
		pkg: grunt.file.readJSON('package.json'),

		/**
		 * Configure global paths. This is flexible but please keep it simple.
		 * Important : please include trailing slash for all folders
		 */
		path: {
			// Root folder (have to contains lib and src)
			root			: '../',

			// Path to the temp folder for asset packing processing
			temp			: './temp/',

			// Path to the source (your project)
			src				: '../src/',

			// Path to the libs (bower libs)
			lib				: '../lib/',

			// Path to the deploy (output files pushed to the server)
			deploy			: '../deploy/',

			// Skeletons files to be scaffold or deployed
			skeletons		: './skeletons/'
		},

		/**
		 * Load grunt sub-configurations
		 * To load an NPM package, add file and name if from the plugin name in the grunt-config folder see path.config)
		 * Every NPM task will be automatically loaded if present in options.npm array.
		 * Local have to be loaded with grunt.task.loadTasks call.
		 * Please keep alphabetical order for readability.
		 */
		minimalConfig: {
			// Load NPM tasks and config
			npm: [
				'autoprefixer',
				'clean',
				'concat',
				'cssmin',
				'deployer',
				'imagemin',
				'json',
				'less',
				'ts',
				'scaff',
				'uglify',
				'watch'
			],

			// Load local tasks and config
			local: [
				'assetsPacker'
			]
		}
	});

	// Init grunt minimal config loader
	grunt.loadNpmTasks('grunt-minimal-config');

	// Load local grunt tasks after config is loaded
	grunt.task.loadTasks('./grunt-tasks/');


	// ------------------------------------------------------------------------- TASKS

	// By default, compile all bundles and watch
	grunt.registerTask('default', ['clean:all', 'all', 'watch']);
};