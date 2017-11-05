module.exports = function (grunt, __)
{
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
			files : __.srcPath + __.allTsFiles,
			tasks: ['clean:amd'] // FIXME : + scriptsWithoutStaticLibs ?
		},

		/**
		 * Compile all scripts when any Typescript file is updated.
		 * Do not re-bundle static-libs when a Typescript file is updated.
		 */
		scripts : {
			files : __.srcPath + __.allTsFiles,
			tasks: ['scriptsWithoutStaticLibs', 'wakeup:success']
		},

		/**
		 * Compile less and AMD when an atom definition is changed.
		 * This is because Atoms are shared between styles and scripts.
		 * No need for Typescript compilation.
		 */
		atoms : {
			files : __.srcPath + 'common/atoms/*.less',
			tasks: ['styles', 'amdCompile']
		},

		/**
		 * Compile styles when any less file is changed.
		 * No need for less2js task because we take care of it with watch.atoms
		 */
		styles : {
			files : __.srcPath + __.allLessFiles,
			tasks: ['less']
		}
	});
};