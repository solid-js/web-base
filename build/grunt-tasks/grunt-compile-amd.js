// Load the module name normalizer tool
var moduleNameNormalizer = require('./utils/module-name-normalizer');

module.exports = function (grunt)
{
	grunt.registerMultiTask('compileAmd', 'Compile and optimize AMD modules.', function ()
	{
		// Get default options
		var options = this.options({

			// Default modules root
			root : '',

			// Default var name
			varName: null, //'__FILE',

			// Default search sentence
			search: 'define(',

			// Do not optimize and compile AMD, just concat files
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
				var moduleName = moduleNameNormalizer.normalizeTypescriptModuleName([fileName], options.root);

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