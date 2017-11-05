module.exports = function (grunt, __)
{
	// ------------------------------------------------------------------------- LESS

	// Less plugins
	let lessPlugins = [

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
	__.optimizedTarget && lessPlugins.push(
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
			src: __.srcPath + 'common/Main.less',
			dest: __.assetsDestination + 'css/common.css'
		},

		myApp1: {
			src: __.srcPath + 'myApp1/Main.less',
			dest: __.assetsDestination + 'css/my-app-1.css'
		},

		myApp2: {
			src: __.srcPath + 'myApp2/Main.less',
			dest: __.assetsDestination + 'css/my-app-2.css'
		}
	});


	// ------------------------------------------------------------------------- LESS 2 JS

	grunt.loadNpmTasks('grunt-less2js');
	grunt.config('less2js', {
		/**
		 * Extract top level less atom letiables and store them as json.
		 * So JS runtime is aware of those letiables without manually copying them.
		 * https://github.com/ixrock/grunt-less2js
		 */
		atoms: {
			options: {
				format: 'webjs',
				windowVariable: '__atoms',
				parseNumbers: true
			},
			src: __.srcPath + 'common/atoms/*.less',
			dest: __.amdFilesRoot + 'src/common/atoms/Atoms.js'
		}
	});
};