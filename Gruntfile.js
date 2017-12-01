module.exports = function (grunt)
{
	// ------------------------------------------------------------------------- CONFIG

	// Shared parameters
	let __ = {

		/**
		 * Get --optimized CLI option.
		 * If this option is added, bundles will be compressed.
		 */
		optimizedTarget		: grunt.option('optimized') || false,

		/**
		 * AMD file tree.
		 * Typescript output and amdCompile input.
		 */
		amdFilesRoot 		: '.amd/',

		// Glob extension to target all JS files
		allJsFiles 			: '**/*.js',

		// Glob extension to target all Typescript files
		allTsFiles 			: '**/*.(ts|tsx)',

		// Glob extension to target all Less files
		allLessFiles 		: '**/*.less',

		// Assets output
		assetsDestination 	: 'www/assets/',

		// Node module path
		nodeModulesPath 	: 'node_modules/',

		// Project source files
		srcPath 			: 'src/'
	};

	// Load and init minimal-config
	grunt.initConfig({
		minimalConfig: {

			// Load sub-config files
			src: 'Gruntfile-*.js',

			// Inject shared parameters in all loaded config files
			parameters: __
		}
	});
	grunt.loadNpmTasks('grunt-minimal-config');


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
	let scriptsTasks = ['ts:default', 'amdCompile'];
	__.optimizedTarget && scriptTasks.push('uglify');
	grunt.registerTask('scripts', scriptsTasks);

	/**
	 * Script tasks, but without static libs bundling.
	 * Static libs do not need to be bundled when a Typescript source file is changed.
	 */
	let scriptsWithoutStaticLibsTasks = ['ts:default'];
	let amdCompileTargets = grunt.config('amdCompile');
	for (let i in amdCompileTargets)
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