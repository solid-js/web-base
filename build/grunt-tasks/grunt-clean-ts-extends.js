module.exports = function (pGrunt)
{
	pGrunt.registerMultiTask('cleanTsExtends', 'Clean extends in generated typescript files', function ()
	{
		// Get file paths from selector
		var files = pGrunt.file.expand({filter: 'isFile'}, this.data.src);

		// Regex detection for extends declarations
		// It's a bit flexible but read it on 4 lines.
		// If declaration line number change, it will broke
		var detectRegex = /(var __extends = \(this \&\& this\.__extends\) \|\| function.*(\n.*){4})/img;

		// Total processed files
		var totalFiles = 0;

		// Browse files
		for (var i in files)
		{
			// Get file name
			var fileName = files[i];

			// Read file content
			var fileContent = pGrunt.file.read(fileName, {encoding: 'UTF-8'});

			// Search for the declaration
			var search = detectRegex.exec(fileContent);

			// At least 2 declarations
			if (search != null && search.length > 1)
			{
				// Replace
				var res = fileContent.replace(detectRegex, '');

				// Compute our new content
				var newFileContent = search[0] + '\n' + res;

				// Increment file processed number
				totalFiles ++;

				// Write our output file
				pGrunt.file.write(this.data.dest, newFileContent, { encoding: 'UTF-8' });
			}
		}

		// Show our satisfaction
		pGrunt.log.oklns(totalFiles + ' files cleaned' + (totalFiles > 0 ? ' :)' : ''));
	});
};