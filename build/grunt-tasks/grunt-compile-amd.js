// Load the module name normalizer tool
var moduleNameNormalizer = require('./utils/module-name-normalizer');

module.exports = function (grunt)
{
	grunt.registerMultiTask('compileAmd', 'Compile modules to AMD', function ()
	{
		// Get default options
		var options = this.options({

			// Default var name
			varName: '__FILE',

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
					newFileContent += "    var " + options.varName + " = '" + moduleName + "';";

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
};
