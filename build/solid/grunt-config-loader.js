/**
 * Load a grunt config file into grunt config object.
 * Also the filename need to be named following grunt module name, so for 'less' you have less.js.
 * TODO : Loaded JS config file doc
 * TODO : Better doc
 * TODO : Push to NPM
 */
module.exports = function (pGrunt, pConfig)
{
	// Where grunt config files are stored, with trailing slash, relative to this file
	pConfig.path = ('path' in pConfig ? pConfig.path : '../grunt-config/');

	// List of package name prefixes for task auto-load
	pConfig.prefixes = ('prefixes' in pConfig ? pConfig.prefixes : ['grunt-', 'grunt-contrib-']);

	// NPM tasks to load and config
	pConfig.npm = ('npm' in pConfig ? pConfig.npm : []);

	// Local tasks to load and config
	pConfig.local = ('local' in pConfig ? pConfig.local : []);


	var currentConfigName;
	var currentConfigObject;
	var currentGruntMerge;
	var moduleIndex;

	// Concat all modules
	var modules = pConfig.npm.concat(pConfig.local);

	// Browse all modules to load options
	for (moduleIndex in modules)
	{
		// Target module name
		currentConfigName = modules[moduleIndex];

		// Load config (will throw if not found)
		try
		{
			currentConfigObject = require(pConfig.path + currentConfigName);
		}
		catch (error)
		{
			pGrunt.fail.fatal('Error while loading `' + currentConfigName + '` config file : ' + error.message);
		}

		// Check if config is valid
		if (!('config' in currentConfigObject))
		{
			pGrunt.fail.fatal('Error while loading `' + currentConfigName + '` config file, no config property exported');
		}

		// Create a merge object
		// Load config with the grunt module name as key
		currentGruntMerge = {};
		currentGruntMerge[currentConfigName] = currentConfigObject.config;

		// Merge with grunt config
		pGrunt.config.merge(currentGruntMerge);
	}

	// Load grunt package from config
	var gruntPackage = pGrunt.config.get('pkg');

	// If grunt package is not found in config
	if (gruntPackage == null)
	{
		pGrunt.fail.fatal('Unable to find package.json in config. Please add `pkg: grunt.file.readJSON("package.json")` in your config file.');
	}

	var currentModuleName;
	var currentPrefixIndex;
	var currentFullModuleName;
	var packageFound;

	// List of dependency node name we can found in package.json
	var packageDependencyNames = ['devDependencies', 'dependencies', 'peerDependencies', 'optionalDependencies'];

	// Browse NPM modules to load
	for (moduleIndex in pConfig.npm)
	{
		// Target module name
		currentModuleName = pConfig.npm[moduleIndex];

		// Package is not found here
		packageFound = false;

		// Browse prefix to search with
		for (currentPrefixIndex in pConfig.prefixes)
		{
			// Get the full name with this prefix
			currentFullModuleName = pConfig.prefixes[currentPrefixIndex] + currentModuleName;


			// Browser all dependenciy names available in package.json
			for (packageDepIndex in packageDependencyNames)
			{
				// Target dependency name
				currentPackageDependencyName = packageDependencyNames[packageDepIndex];

				// Check if we have this dependency node and if we have this module available with this prefix
				if (currentPackageDependencyName in gruntPackage && currentFullModuleName in gruntPackage[currentPackageDependencyName])
				{
					// We found it
					packageFound = true;

					// Load it !
					pGrunt.loadNpmTasks(currentFullModuleName);
					break;
				}
			}
		}

		// Warn if package is not found
		if (!packageFound)
		{
			pGrunt.fail.warn('Unable to load NPM task `' + currentModuleName + '`');
		}
	}
};
