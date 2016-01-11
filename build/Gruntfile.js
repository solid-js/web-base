module.exports = function (grunt)
{
	// ------------------------------------------------------------------------- INIT

	// Change default delimiters
	grunt.template.addDelimiters('config', '{', '}');

	// Show durations in console
	require('time-grunt')(grunt);

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
			// Root folder (have to contain lib and src)
			root			: '../',

			// Path to the temp folder for asset packing processing
			temp			: './temp/',

			// Path to the source (your project)
			src				: '../src/',

			// Path to the libs (bower libs)
			lib				: '../lib/',

			// Path to the deploy (output files pushed to the server)
			deploy			: '../deploy/',

			// Template files to be deployed
			deploymentFiles	: './deployment/'
		}
	});


	// ------------------------------------------------------------------------- CONFIG LOADER

	/**
	 * Load grunt sub-configurations
	 * To load an NPM package, add file and name if from the plugin name in the grunt-config folder see path.config)
	 * Every NPM task will be automatically loaded if present in options.npm array.
	 * Local have to be loaded with grunt.task.loadTasks call.
	 * Please keep alphabetical order for readability.
	 */
	require('./solid/grunt-config-loader')(grunt, {

		// Load NPM tasks and config
		npm: [
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
		],

		// Load local tasks and config
		local: [
			'assetsPacker',
			'deploy'
		]
	});

	// Load local grunt tasks after config is loaded
	grunt.task.loadTasks('./grunt-tasks/');


	// ------------------------------------------------------------------------- TASKS

	// By default, compile all bundles and watch
	grunt.registerTask('default', ['clean:all', 'deploy:local', 'all', 'watch']);
};