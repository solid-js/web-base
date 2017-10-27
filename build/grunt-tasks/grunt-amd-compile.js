
module.exports = function (grunt)
{
	// ------------------------------------------------------------------------- HELPERS

	/**
	 * Normalize a module path from a root.
	 * It will exclude this root from path and also the file extension.
	 *
	 * Ex : "temp/subfolder/lib/provider/LibName.ts"
	 * Become : "lib/provider/LibName"
	 * With root "temp/subfolder"
	 *
	 * @param modulePath Path with extension and root
	 * @param root Part to remove from modulePath
	 */
	var normalizeModulePathFromRoot = function (modulePath, root)
	{
		// Truncate start and extension
		return modulePath.substring( (

				// Start truncating module name from root parameter
				( root != null )
				? modulePath.indexOf(root) + root.length

				// Or from first slash
				: modulePath.indexOf('/') + 1
			),

			// Until last dot, to remove extension
			modulePath.lastIndexOf('.')
		);
	};


	// ------------------------------------------------------------------------- TASK

	grunt.registerMultiTask('amdCompile', 'Compile and optimize AMD modules files into bundles.', function ()
	{
		// Get default options
		var options = this.options({

			/**
			 * Default modules root.
			 * This will be removed from module path.
			 */
			root : '',

			//
			/**
			 * Var name for module name injection as var.
			 * Default is null, no injection.
			 * You can use something like "__FILE".
			 * Then every optimized module will have a `var __FILE="module/path";` statement at first line.
			 */
			varName: null, //'__FILE',

			/**
			 * Define search sentence. Better to not touch this :)
			 */
			search: 'define(',

			/**
			 * Do not optimize and compile AMD, just concat files, faster !
			 * Useful for static libraries which you do not want to optimize.
			 */
			justConcat: false
		});

		// New content output file
		var newFileContent = '';

		// Indexes and other keys
		var firstIndex;
		var functionIndex;
		var dependenciesIndex;
		var insertionIndex;
		var totalModules = 0;

		// Check files parameters
		if (!Array.isArray(this.files)) grunt.log.error('Invalid files parameters.');

		// Get file paths from selector
		this.files.map(function (currentFile)
		{
			// Get glob files for this target
			var files = grunt.file.expand(
				{filter: 'isFile'},
				currentFile.src || currentFile.files
			);

			// Browse files
			for (var i in files)
			{
				// Get file name
				var fileName = files[i];

				// Read file content
				var fileContent = grunt.file.read(fileName, { encoding: 'UTF-8' });

				// Just concat files
				if (options.justConcat)
				{
					newFileContent += fileContent + '\n';
					continue;
				}

				// Convert file path to file name
				var moduleName = normalizeModulePathFromRoot(fileName, options.root);

				// Get the index right after the define call
				firstIndex = fileContent.indexOf(options.search) + options.search.length;

				// Get the dependencies array and function index to know if we really are in a define declaration
				dependenciesIndex = fileContent.indexOf('[', firstIndex);
				functionIndex = fileContent.indexOf('function', firstIndex);

				// Get the new line index, this is where we insert our content
				insertionIndex = fileContent.indexOf('{', functionIndex) + 1;

				// This looks like an amd define
				if (
						insertionIndex > firstIndex
						&&
						functionIndex > firstIndex
						&&
						insertionIndex > functionIndex
						&&
						dependenciesIndex >= firstIndex
						&&
						functionIndex > dependenciesIndex
					)
				{
					// Inject module name
					newFileContent += fileContent.substring(0, firstIndex);
					newFileContent += "'" + moduleName + "', ";

					// Add the last parsed file part to the output file
					newFileContent += fileContent.substring(firstIndex, insertionIndex) + "\n";

					// Inject our variable
					if (options.varName != null && options.varName.length > 0)
					{
						newFileContent += "    var " + options.varName + " = '" + moduleName + "';";
					}

					// Inject module content
					newFileContent += fileContent.substring(insertionIndex, fileContent.length) + '\n\n';

					// Count this as optimized module
					totalModules ++;
				}

				// No amd define to optimize
				else
				{
					// Just concat
					newFileContent += fileContent + '\n';
				}
			}

			// Write our output file
			grunt.file.write(currentFile.dest, newFileContent, { encoding: 'UTF-8' });
		});

		// Show our satisfaction
		grunt.log.oklns( totalModules + ' modules compiled.' );
	});

	// Nasty check to verify if we have the addUglifyTargets options.
	// We need to do that so uglify targets can be altered even if we don't use "compileAmd" task
	if (grunt.config('compileAmd.options.addUglifyTargets'))
	{
		// If there is no uglify node
		if (grunt.config('uglify') == null)
		{
			// Stop here
			grunt.log.fail('compileAmd can\'t add uglify targets if uglify config node is not present.');
		}

		// Get compile AMD config
		var targets = grunt.config('compileAmd');

		// Browser targets
		for (var i in targets)
		{
			// options is not a target
			if (i === 'options') continue;

			// Target target lol
			var currentTarget = targets[ i ];

			// If there is no "dest" in this target
			if (!('dest' in currentTarget))
			{
				// Show our disappointment and do not alter uglify config
				grunt.log.warn('compileAmd can\'t add uglify config for target "' + i + '" because no dest parameter was found.');
				continue;
			}

			// Added uglify config from compileAmd targets
			grunt.config('uglify.' + i, {
				src: currentTarget.dest,
				dest: currentTarget.dest
			});
		}
	}
};