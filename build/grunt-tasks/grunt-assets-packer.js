// Load the module name normalizer tool
var moduleNameNormalizer = require('./utils/module-name-normalizer');

// ----------------------------------------------------------------------------- DEFAULT OPTIONS

/**
 * Default options for JSON grunt config
 */
var defaultJsonModuleOptions = {

	// Where are stored JSONs  (injected var in window)
	namespace: 'JsonFiles',

	// Get only the filename without extension
	includePath: true,
	processName: moduleNameNormalizer.processModuleAssetFilename
};

/**
 * Default options for typescript grunt config
 */
var defaultTsModuleOptions = {

	// Compile modules as AMD
	module: 'amd',

	// Target for ES5 javascript (ie9+)
	target: 'es5',

	// Root dir for app (need to access to lib and src)
	rootDir: '{= path.root }',

	// Enable JSX support with react
	jsx: 'react'
};


module.exports = function (pGrunt)
{
	// The assetsPacker task is not allowed
	pGrunt.registerMultiTask('assetsPacker', 'Compile assets as bundled packages', function ()
	{
		pGrunt.fail.fatal('Calling task assetsPacker directly is not allowed. Every module is available as a new task. If you want to build a specific module, run the task directly like : moduleName:concat for example. Call the task `all` if you want to build all modules and `optimised` if you want all modules optimised for production');
	});

	// Containing tasks for every bundles
	var bundleEverythingTasks = [];
	var bundleEverythingOptimisedTasks = [];

	// Get path configuration
	var rootDir = pGrunt.config.get('path.root');
	var tempDir = pGrunt.config.get('path.temp');
	var pathSrc = pGrunt.config.get('path.src');

	// Get packer configuration
	var assetPackerMain 			= pGrunt.config.get('assetsPacker.options.main') || 'Main';
	var assetPackerDefinitions 		= pGrunt.config.get('assetsPacker.options.definitions');
	var typescriptModulesBasePath 	= pGrunt.config.get('assetsPacker.options.typescriptTemp');

	// Get assets list
	var assetsPackerList			= pGrunt.config.get('assetsPacker');

	// Config object that will be fed and merged with grunt config
	var mergeConfig = {

		// Configuring cleaning for everything in temp folder
		clean: {
			all: {
				src: tempDir
			}
		},

		// Used grunt plugins
		ts: {},
		json : {},
		concat: {},
		less: {},
		autoprefixer: {},
		cleanTsExtends: {},
		uglify: {},
		cssmin: {},
		watch: {},
		compileAmd: {},
		assetsPacker: {}
	};

	// Browse bundles
	var currentConfig;
	for (var moduleName in assetsPackerList)
	{
		// Skip options node
		if (moduleName == 'options') continue;

		// Target current bundle configuration
		currentConfig = assetsPackerList[moduleName];

		// --------------------------------------------------------------------------------------
		// ---------------------------------------------------------------------  MODULE BUNDLE -
		// --------------------------------------------------------------------------------------

		if (!('type' in currentConfig) || currentConfig.type == 'module')
		{
			// Link to the compiled files in temp dir
			var moduleRoot = pathSrc + moduleName;
			var moduleTempDir = tempDir + moduleName;
			var moduleTempJson = moduleTempDir + '/json.js';
			var moduleTempAMD = moduleTempDir + '/amd.js';

			// ----------------------------------------------------------------- INCLUDED

			// Included files out of the dependency tree
			var includedTypescriptFiles = [];
			var includedLessFiles = [];
			var includedAmdFiles = [];

			// If we have to include files that are not in the dependencies tree
			if ('include' in currentConfig)
			{
				for (var i in currentConfig['include'])
				{
					// Compute link
					var pathToInclude =  moduleRoot + '/' + currentConfig['include'][i] + '**/*';

					// Include scripts
					includedTypescriptFiles.push(pathToInclude + '.ts');
					includedTypescriptFiles.push(pathToInclude + '.tsx');

					// Include styles
					includedLessFiles.push(pathToInclude + '**/*.less');
					includedLessFiles.push(pathToInclude + '*.less');
				}
			}

			/**
			 * TODO : Faire fonctionner l'include AMD de mannière plus claire
			 * Actuellement si les modules ne sont pas compilés avant le common
			 * les libs ne sont pas intégrées. Il faudrait pouvoir forcer la compile des modules
			 * avant common, sans pour autant compiler 2 fois si on fait un grunt all par exemple
			 */

			// Include AMD dependecies in this module
			if ('includeAmd' in currentConfig)
			{
				// Map included AMD files
				currentConfig['includeAmd'].every(function (pIncludedPath)
				{
					includedAmdFiles.push(typescriptModulesBasePath + pIncludedPath + '**/*.js');

					// Watch TS and TSX files
					var pathToInclude = rootDir + pIncludedPath + '**/*';

					// Add watch for those files
					mergeConfig.watch[moduleName + '-includeAmd'] = {
						files: [pathToInclude + '.ts', pathToInclude + '.tsx'],
						tasks: ['all']
					};
				});
			}

			// ----------------------------------------------------------------- CLEANING

			// Add task for cleaning temp dir
			mergeConfig.clean[moduleName] = {
				src: moduleTempDir
			};

			// ----------------------------------------------------------------- JSON

			// Include every JSON files
			mergeConfig.json[moduleName] = {
				src: moduleRoot + '/**/*.json',
				dest: moduleTempJson,
				options: defaultJsonModuleOptions
			};

			// ----------------------------------------------------------------- SCRIPTS

			mergeConfig.ts[moduleName] = {
				src: assetPackerDefinitions.concat([moduleRoot + '/' + assetPackerMain + '.ts', moduleRoot + '/' + assetPackerMain + '.tsx']).concat(includedTypescriptFiles),
				dest: typescriptModulesBasePath,
				options: defaultTsModuleOptions
			};

			mergeConfig.compileAmd[moduleName] = {
				// TODO : doc de root
				root: typescriptModulesBasePath,
				src: [typescriptModulesBasePath + '*/' + moduleName + '/**/*.js'].concat(includedAmdFiles),
				dest: moduleTempAMD
			};

			// Concat bundle files
			mergeConfig.concat[moduleName] = {
				src: [moduleTempJson, moduleTempAMD],
				dest: currentConfig.js
			};

			// ----------------------------------------------------------------- STYLES

			// Config less compilation for this app bundle
			mergeConfig.less[moduleName] = {
				src: [moduleRoot + '/' + assetPackerMain + '.less'].concat(includedLessFiles),
				dest: currentConfig.css
			};

			// Config auto-prefixer
			mergeConfig.autoprefixer[moduleName] = {
				src: currentConfig.css,
				dest: currentConfig.css
			};

			// ----------------------------------------------------------------- OPTIMISING

			// Typescript extends cleaner
			mergeConfig.cleanTsExtends[moduleName] = {
				src: currentConfig.js,
				dest: currentConfig.js
			};

			// Javascript obfuscation
			mergeConfig.uglify[moduleName] = {
				src: currentConfig.js,
				dest: currentConfig.js
			};

			// Less obfuscation
			mergeConfig.cssmin[moduleName] = {
				src: currentConfig.css,
				dest: currentConfig.css
			};

			// ----------------------------------------------------------------- WATCH

			// Json then concat from json files
			mergeConfig.watch[moduleName + '-json'] = {
				files: [moduleRoot + '/**/*.json'],
				tasks: [moduleName + ':json', moduleName + ':concat']
			};

			// Script then concat from ts files
			mergeConfig.watch[moduleName + '-script'] = {
				files: [moduleRoot + '/**/*.ts', moduleRoot + '/**/*.tsx'],
				tasks: [moduleName + ':amd', moduleName + ':concat']
			};

			// Style from less files
			mergeConfig.watch[moduleName + '-style'] = {
				files: [moduleRoot + '/**/*.less'],
				tasks: [moduleName + ':style']
			};

			// ----------------------------------------------------------------- TASKS REGISTERING

			/**
			 * Compile scripts to temp dir
			 */

			// Compile JSON
			pGrunt.registerTask(moduleName + ':json', [
				'json:' + moduleName
			]);

			// Compile Typescript / AMD
			pGrunt.registerTask(moduleName + ':amd', [
				'ts:' + moduleName,
				'compileAmd:'+ moduleName
			]);

			/**
			 * Publish scripts to output
			 */

			// Concat compiled scripts (json / amd from temp to output)
			pGrunt.registerTask(moduleName + ':concat', [
				'concat:' + moduleName
			]);

			// Compile scripts and concat them
			pGrunt.registerTask(moduleName + ':script', [
				moduleName + ':json',
				moduleName + ':amd',
				moduleName + ':concat'
			]);

			// Compile style to output (no temp involved)
			pGrunt.registerTask(moduleName + ':style', [
				'less:' + moduleName,
				'autoprefixer:' + moduleName
			]);

			/**
			 * Register task for everything in this bundle
			 * 1. Cleaning temp dir
			 * 2. Json / Typescript / AMD
			 * 3. Concat scripts to output
			 * 4. Styles to output
			 */
			pGrunt.registerTask(moduleName, [
				moduleName + ':script',
				moduleName + ':style'
			]);

			// Everything in bundle + optimise script and style for production
			pGrunt.registerTask(moduleName + ':optimised', [
				moduleName,
				'cleanTsExtends:' + moduleName,
				'uglify:' + moduleName,
				'cssmin:' + moduleName
			]);
		}

		// ---------------------------------------------------------------------------------------
		// --------------------------------------------------------------------- JS / CSS BUNDLE -
		// ---------------------------------------------------------------------------------------

		else if (currentConfig.type == 'css' || currentConfig.type == 'js')
		{
			// JS
			if (currentConfig.type == 'js')
			{
				// Get regular and optimised sources
				var regularSrc = [];
				var optimisedSrc = [];
				for (var u in currentConfig.src)
				{
					// If this is an array, we have regular and optimised
					if (Array.isArray( currentConfig.src[u] ))
					{
						regularSrc.push( currentConfig.src[u][0] );
						optimisedSrc.push( currentConfig.src[u][1] );
					}

					// Else this is the same source for regular and optimised
					else
					{
						regularSrc.push( currentConfig.src[u] );
						optimisedSrc.push( currentConfig.src[u] );
					}
				}

				// Concat bundle files - regular -
				mergeConfig.concat[moduleName] = {
					src: regularSrc,
					dest: currentConfig.dest
				};

				// Concat bundle files - optimised -
				mergeConfig.concat[moduleName+'-optimised'] = {
					src: optimisedSrc,
					dest: currentConfig.dest
				};


				// Typescript extends cleaner
				mergeConfig.cleanTsExtends[moduleName] = {
					src: currentConfig.dest,
					dest: currentConfig.dest
				};

				// Javascript obfuscation
				mergeConfig.uglify[moduleName] = {
					src: currentConfig.dest,
					dest: currentConfig.dest
				};

				// Register the compile task
				pGrunt.registerTask(moduleName, [
					'concat:' + moduleName
				]);

				// Compile script and optimise
				pGrunt.registerTask(moduleName + ':optimised', [
					'concat:' + moduleName + '-optimised',
					'cleanTsExtends:' + moduleName,
					'uglify:' + moduleName
				]);
			}

			// LESS
			else if (currentConfig.type == 'css')
			{
				// Concat bundle files
				mergeConfig.less[moduleName] = {
					src: currentConfig.src,
					dest: currentConfig.dest
				};

				// Config auto-prefixer
				mergeConfig.autoprefixer[moduleName] = {
					src: currentConfig.css,
					dest: currentConfig.css
				};

				// Less obfuscation
				mergeConfig.cssmin[moduleName] = {
					src: currentConfig.dest,
					dest: currentConfig.dest
				};

				// Compile script
				pGrunt.registerTask(moduleName, [
					'less:' + moduleName,
					'autoprefixer:' + moduleName
				]);

				// Compile script and optimise
				pGrunt.registerTask(moduleName + ':optimised', [
					moduleName,
					'cssmin:' + moduleName
				]);
			}

			// Watch from js / css files changes
			mergeConfig.watch[moduleName] = {
				files: currentConfig.src,
				tasks: [moduleName]
			};
		}

		// TODO : SVG sprites
		// TODO : texture packer sprites

		// Add this task to the every bundles task
		bundleEverythingTasks.push(moduleName);
		bundleEverythingOptimisedTasks.push(moduleName + ':optimised');
	}

	// Compile all bundle
	pGrunt.registerTask('all', bundleEverythingTasks);

	// Compile all bundle and optimise them
	pGrunt.registerTask('optimised', bundleEverythingOptimisedTasks);

	// Init populated config
	pGrunt.config.merge(mergeConfig);
};