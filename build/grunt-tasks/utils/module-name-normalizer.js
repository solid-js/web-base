module.exports = {
	/**
	 * Get file name from path.
	 * Not tested for every cases, use with caution.
	 * @param pFullPath
	 * @returns {string}
	 */
	getFileName: function (pFullPath)
	{
		var firstIndex = pFullPath.lastIndexOf('/');
		var lastIndex = pFullPath.lastIndexOf('.');

		if (lastIndex <= 0)
		{
			lastIndex = pFullPath.length;
		}


		return pFullPath.substring(firstIndex + 1, lastIndex);
	},

	/**
	 * Normalize typescript module names for dynamic import.
	 * This function takes an array of ts file paths and convert it in module names.
	 * For example: ['../lib/provider/LibName.ts'] become ['lib/provider/LibName']
	 * @param pTypescriptFiles List of typescript files to convert. Can be fed with expand easily.
	 * @param pTruncateStart Truncate file start, useful for base path purpose.
	 */
	normalizeTypescriptModuleName: function (pTypescriptFiles, pTruncateStart)
	{
		var normalizedModuleNames = [];
		var firstSlashIndex;
		var currentModulePath;

		// Browse file list
		for (var i = 0; i < pTypescriptFiles.length; i ++)
		{
			// Get file path
			currentModulePath = pTypescriptFiles[i];

			// Truncate start from first / or from truncate start
			firstSlashIndex = (
				pTruncateStart != null
					? currentModulePath.indexOf(pTruncateStart) + pTruncateStart.length
					: currentModulePath.indexOf("/") + 1
			);

			// Truncate start and extension
			normalizedModuleNames[i] = currentModulePath.substring(firstSlashIndex, currentModulePath.lastIndexOf("."));
		}

		// Return the new list
		return normalizedModuleNames;
	},

	/**
	 * Process a filename to an asset name.
	 * This function use normalizeTypescriptModuleName with only one item in list.
	 */
	processModuleAssetFilename: function (pName)
	{
		return module.exports.normalizeTypescriptModuleName([pName]);
	}
};