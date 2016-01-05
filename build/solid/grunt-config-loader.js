module.exports = {
	/**
	 * Where grunt config files are stored
	 */
	GRUNT_CONFIG_PATH: '../grunt-config/',

	/**
	 * Load a grunt config file into grunt config object.
	 * Grunt config files have to be stored in GRUNT_CONFIG_PATH folder.
	 * Also the filename need to be named following grunt module name, so for 'less' you have less.js.
	 * @param pGrunt Grunt instance
	 * @param pModules Array of string of every grunt config to load
	 */
	load: function (pGrunt, pModules)
	{
		var currentConfigName;
		var currentConfigObject;
		var currentGruntMerge;

		// Browse modules
		for (var i in pModules)
		{
			// Target module name
			currentConfigName = pModules[i];

			// Load config (will throw if not found)
			try
			{
				currentConfigObject = require(module.exports.GRUNT_CONFIG_PATH + currentConfigName);
			}
			catch (error)
			{
				pGrunt.fail.fatal('Error while loading config ' + currentConfigName + ' : ' + error.message);
			}

			// Check if config is valid
			if (!('config' in currentConfigObject))
			{
				pGrunt.fail.fatal('Error while loading config ' + currentConfigName + ', no config property exported');
			}

			// Create a merge object
			// Load config with the grunt module name as key
			currentGruntMerge = {};
			currentGruntMerge[currentConfigName] = currentConfigObject.config;

			// Merge with grunt config
			pGrunt.config.merge(currentGruntMerge);
		}
	}
};