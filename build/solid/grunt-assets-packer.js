module.exports = {

	/**
	 * Default options for handlebars grunt config
	 */
	DEFAULT_HANDLEBARS_MODULE_OPTIONS :{

		// Where are stored templates (injected var in window)
		namespace: 'TemplateFiles',

		// Use namespace for partials loading
		partialsUseNamespace: true,

		// Get only the filename without extension
		processName: module.exports.processModuleAssetFilename
	},

	/**
	 * Default options for JSON grunt config
	 */
	DEFAULT_JSON_MODULE_OPTIONS : {

		// Where are stored JSONs  (injected var in window)
		namespace: 'JsonFiles',

		// Get only the filename without extension
		includePath: true,
		processName: module.exports.processModuleAssetFilename
	},

	/**
	 * Default options for typescript grunt config
	 */
	DEFAULT_TS_MODULE_OPTIONS: {

		// Compile modules as AMD
		module: 'amd',

		// Target for ES5 javascript (ie9+)
		target: 'es5',

		// Root dir for app (need to access to lib and src)
		rootDir: '{= path.root }'
	},

	/**
	 * Default options for JSON grunt config
	 */
	DEFAULT_REQUIREJS_MODULE_OPTIONS : {
		paths: {},
		findNestedDependencies: false,
		generateSourceMaps: false,
		wrap: false,
		useStrict: false,
		skipModuleInsertion: false,
		optimize: 'none'
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
	},

    /**
     * TODO : doc
     */
    load: function (pGrunt, pBundles)
    {
		// TODO : doc
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
				var moduleName = module.exports.normalizeTypescriptModuleName([fileName], this.data.root);

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


        // Containing tasks for every bundles
        var bundleEverythingTasks = [];
        var bundleEverythingOptimisedTasks = [];

		// Get configuration
		var tempDir = pGrunt.config.get('path.temp');
		var pathSrc = pGrunt.config.get('path.src');
		var assetPackerMain = pGrunt.config.get('assetPacker.main');
		var assetPackerDefinitions = pGrunt.config.get('assetPacker.definitions');
		var typescriptModulesBasePath = pGrunt.config.get('assetPacker.typescriptTemp');

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
			handlebars: {},
			json : {},
			concat: {},
			less: {},
			autoprefixer: {},
			uglify: {},
			cssmin: {},
			watch: {},
			compileAmd: {}
		};

        // Browse bundles
        var currentConfig;
        for (var i = 0; i < pBundles.length; i ++)
        {
            // Target current bundle configuration
            currentConfig = pBundles[i];

            // ----------------------------------------------------------------- MODULE BUNDLE

            if (currentConfig.type == 'module')
            {
				// Check if we have the mandatory 'name' property
				if (!('name' in currentConfig))
				{
					pGrunt.fail.fatal('name property is missing from module declaration');
				}

				// Link to the compiled files in temp dir
				var moduleRoot = pathSrc + currentConfig.name;
				var moduleTempDir = tempDir + currentConfig.name;
				var moduleTempTemplate = moduleTempDir + '/template.js';
				var moduleTempJson = moduleTempDir + '/json.js';
				var moduleTempAMD = moduleTempDir + '/amd.js';

				// ------------------------------------------------------------- INCLUDED

				// Included files out of the dependency tree
				var includedTypescriptFiles = [];
				var includedLessFiles = [];
				var includedAmdFiles = [];

				// If we have to include files that are not in the dependencies tree
				if ('include' in currentConfig)
				{
					// Map Included TS files
					currentConfig['include'].every(function (pIncludedPath)
					{
						includedTypescriptFiles.push(moduleRoot + '/' + pIncludedPath + '**/*.ts');
					});

					// Map included LESS files
					currentConfig['include'].every(function (pIncludedPath)
					{
						includedLessFiles.push(moduleRoot + '/' + pIncludedPath + '**/*.less');
					});
				}

				// TODO : Ne fonctionne qu'à la seconde compile ?

				if ('includeAmd' in currentConfig)
				{
					// Map included A/D files
					currentConfig['includeAmd'].every(function (pIncludedPath)
					{
						includedAmdFiles.push(typescriptModulesBasePath + '*/' + pIncludedPath + '/**/*.js');
					});
				}

				// ------------------------------------------------------------- CLEANING

				// Add task for cleaning temp dir
				mergeConfig.clean[currentConfig.name] = {
					src: moduleTempDir
				};

                // ------------------------------------------------------------- TEMPLATES

                // Include every template files
                mergeConfig.handlebars[currentConfig.name] = {
                    src: moduleRoot + '/**/*.hbs',
                    dest: moduleTempTemplate,
                    options: module.exports.DEFAULT_HANDLEBARS_MODULE_OPTIONS
                };

                // ------------------------------------------------------------- JSON

                // Include every template files
                mergeConfig.json[currentConfig.name] = {
					src: moduleRoot + '/**/*.json',
                    dest: moduleTempJson,
                    options: module.exports.DEFAULT_JSON_MODULE_OPTIONS
                };

                // ------------------------------------------------------------- SCRIPTS

				mergeConfig.ts[currentConfig.name] = {
					src: [assetPackerDefinitions, moduleRoot + '/' + assetPackerMain + '.ts'].concat(includedTypescriptFiles),
					dest: typescriptModulesBasePath,
					options: module.exports.DEFAULT_TS_MODULE_OPTIONS
				};

				mergeConfig.compileAmd[currentConfig.name] = {
					// TODO : doc de root
					root: typescriptModulesBasePath,
					src: [typescriptModulesBasePath + '*/' + currentConfig.name + '/**/*.js'].concat(includedAmdFiles),
					dest: moduleTempAMD
				};

                // Concat bundle files
                mergeConfig.concat[currentConfig.name] = {
                    src: [moduleTempTemplate, moduleTempJson, moduleTempAMD],
                    dest: currentConfig.js
                };

                // ------------------------------------------------------------- STYLES

                // Config less compilation for this app bundle
                mergeConfig.less[currentConfig.name] = {
					src: [moduleRoot + '/' + assetPackerMain + '.less'].concat(includedLessFiles),
                    dest: currentConfig.css
                };

                // Config auto-prefixer
                mergeConfig.autoprefixer[currentConfig.name] = {
                    src: currentConfig.css,
                    dest: currentConfig.css
                };

                // ------------------------------------------------------------- OPTIMISING

                // Javascript obfuscation
                mergeConfig.uglify[currentConfig.name] = {
                    src: currentConfig.js,
                    dest: currentConfig.js
                };

                // Less obfuscation
                mergeConfig.cssmin[currentConfig.name] = {
                    src: currentConfig.css,
                    dest: currentConfig.css
                };

                // ------------------------------------------------------------- WATCH

                // Template then concat from hbs files
                mergeConfig.watch[currentConfig.name + '-template'] = {
                    files: [moduleRoot + '/**/*.hbs'],
                    tasks: [currentConfig.name + ':template', currentConfig.name + ':concat']
                };

                // Json then concat from json files
                mergeConfig.watch[currentConfig.name + '-json'] = {
                    files: [moduleRoot + '/**/*.json'],
                    tasks: [currentConfig.name + ':json', currentConfig.name + ':concat']
                };

                // Script then concat from ts files
                mergeConfig.watch[currentConfig.name + '-script'] = {
                    files: [moduleRoot + '/**/*.ts'],
                    tasks: [currentConfig.name + ':amd', currentConfig.name + ':concat']
                };

                // Style from less files
                mergeConfig.watch[currentConfig.name + '-style'] = {
                    files: [moduleRoot + '/**/*.less'],
                    tasks: [currentConfig.name + ':style']
                };

                // ------------------------------------------------------------- TASKS REGISTERING

                /**
                 * Compile scripts to temp dir
                 */

                // Compile templates
                pGrunt.registerTask(currentConfig.name + ':template', [
                    'handlebars:' + currentConfig.name
                ]);

                // Compile JSON
                pGrunt.registerTask(currentConfig.name + ':json', [
                    'json:' + currentConfig.name
                ]);

                // Compile Typescript / AMD
                pGrunt.registerTask(currentConfig.name + ':amd', [
                    'ts:' + currentConfig.name,
					'compileAmd:'+ currentConfig.name
                ]);

                /**
                 * Publish scripts to output
                 */

                // Concat compiled scripts (templates / json / amd from temp to output)
                pGrunt.registerTask(currentConfig.name + ':concat', [
                    'concat:' + currentConfig.name
                ]);

                // Compile scripts and concat them
                pGrunt.registerTask(currentConfig.name + ':script', [
                    currentConfig.name + ':template',
                    currentConfig.name + ':json',
                    currentConfig.name + ':amd',
                    currentConfig.name + ':concat'
                ]);

                // Compile style to output (no temp involved)
                pGrunt.registerTask(currentConfig.name + ':style', [
                    'less:' + currentConfig.name,
                    'autoprefixer:' + currentConfig.name
                ]);

                /**
                 * Register task for everything in this bundle
                 * 1. Cleaning temp dir
                 * 2. Templates / Json / Typescript / AMD
                 * 3. Concat scripts to output
                 * 4. Styles to output
                 */
                pGrunt.registerTask(currentConfig.name, [
                    currentConfig.name + ':script',
                    currentConfig.name + ':style'
                ]);

                // Everything in bundle + optimise script and style for production
                pGrunt.registerTask(currentConfig.name + ':optimised', [
                    currentConfig.name,
                    'uglify:' + currentConfig.name,
                    'cssmin:' + currentConfig.name
                ]);
            }

			// TODO : JS files
			// TODO : CSS files ?
			// TODO : SVG sprites
			// TODO : texture packer sprites

            // Add this task to the every bundles task
            bundleEverythingTasks.push(currentConfig.name);
            bundleEverythingOptimisedTasks.push(currentConfig.name + ':optimised');
        }


        // Compile all bundle
        pGrunt.registerTask('all', bundleEverythingTasks);

        // Compile all bundle and optimise them
        pGrunt.registerTask('optimised', bundleEverythingOptimisedTasks);

        // Init populated config
        pGrunt.config.merge(mergeConfig);
    }
};