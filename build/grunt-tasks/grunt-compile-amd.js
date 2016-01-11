// Load the module name normalizer tool
var moduleNameNormalizer = require('./utils/module-name-normalizer');

module.exports = function (pGrunt)
{
	/**
	 * TODO : doc
	 * TODO : Push to NPM
	 */
	pGrunt.registerMultiTask('compileAmd', '', function ()
	{
		// Get the default var name
		var varName = 'varName' in this.data ? this.data.varName : '__FILE';

		// Get the default search sentence
		var search = 'search' in this.data ? this.data.search : "define(";

		// New content output file
		var newFileContent = '';

		// Indexes and other keys
		var firstIndex;
		var functionIndex;
		var dependenciesIndex;
		var insertionIndex;
		var totalModules = 0;

		// Get file paths from selector
		var files = pGrunt.file.expand({filter: 'isFile'}, this.data.src);

		// Browse files
		for (var i in files)
		{
			// Get file name
			var fileName = files[i];

			// Read file content
			var fileContent = pGrunt.file.read(fileName, { encoding: 'UTF-8' });

			// Convert file path to file name
			var moduleName = moduleNameNormalizer.normalizeTypescriptModuleName([fileName], this.data.root);

			// Get the index right after the define call
			firstIndex = fileContent.indexOf(search) + search.length;

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
				newFileContent += "\n    var " + varName + " = '" + moduleName + "';";

				// Inject module content
				newFileContent += fileContent.substring(insertionIndex, fileContent.length) + '\n\n';

				// Count this as patched module
				totalModules ++;
			}
			else
			{
				pGrunt.log.error('Non AMD module detected ' + moduleName)
			}
		}

		// Write our output file
		pGrunt.file.write(this.data.dest, newFileContent, { encoding: 'UTF-8' });

		// Show our satisfaction
		pGrunt.log.write(totalModules + ' modules patched :)');
	});
};
