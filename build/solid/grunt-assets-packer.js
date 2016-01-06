// Load the AMD compiler grunt task
var compileAMD = require('./grunt-compile-amd');

// Load the module name normalizer tool
var moduleNameNormalizer = require('./module-name-normalizer');


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
		processName: moduleNameNormalizer.processModuleAssetFilename
	},

	/**
	 * Default options for JSON grunt config
	 */
	DEFAULT_JSON_MODULE_OPTIONS : {

		// Where are stored JSONs  (injected var in window)
		namespace: 'JsonFiles',

		// Get only the filename without extension
		includePath: true,
		processName: moduleNameNormalizer.processModuleAssetFilename
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
     * TODO : doc
     */
    load: function (pGrunt, pBundles)
    {
		// Register the AMD compiler task
		compileAMD(pGrunt);

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

			// Invalid type
			if (!('type' in currentConfig) || currentConfig == null)
			{
				pGrunt.fail.fatal('Invalid module type');
			}

			// Check if we have the mandatory 'name' property
			if (!('name' in currentConfig))
			{
				pGrunt.fail.fatal('name property is missing from module declaration');
			}

			// ----------------------------------------------------------------------------------
            // -----------------------------------------------------------------  MODULE BUNDLE -
			// ----------------------------------------------------------------------------------

            if (currentConfig.type == 'module')
            {
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

				/**
				 * TODO : Faire fonctionner l'include AMD de mannière plus claire
				 * Actuellement si les modules ne sont pas compilés avant le common
				 * les libs ne sont pas intégrées. Il faudrait pouvoir forcer la compile des modules
				 * avant common, sans pour autant compiler 2 fois si on fait un grunt all par exemple
				 */

				// Include AMD dependecies in this module
				if ('includeAmd' in currentConfig)
				{
					// Map included A/D files
					currentConfig['includeAmd'].every(function (pIncludedPath)
					{
						includedAmdFiles.push(typescriptModulesBasePath + pIncludedPath + '**/*.js');
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

			// -----------------------------------------------------------------------------------
			// ----------------------------------------------------------------- JS / CSS BUNDLE -
			// -----------------------------------------------------------------------------------

			else if (currentConfig.type == "css" || currentConfig.type == "js")
			{
				// JS
				if (currentConfig.type == "js")
				{
					// Concat bundle files
					mergeConfig.concat[currentConfig.name] = {
						src: currentConfig.src,
						dest: currentConfig.dest
					};

					// Javascript obfuscation
					mergeConfig.uglify[currentConfig.name] = {
						src: currentConfig.dest,
						dest: currentConfig.dest
					};

					// Register the compile task
					pGrunt.registerTask(currentConfig.name, [
						'concat:' + currentConfig.name
					]);

					// Compile script and optimise
					pGrunt.registerTask(currentConfig.name + ':optimised', [
						currentConfig.name,
						'uglify:' + currentConfig.name
					]);
				}

				// LESS
				else if (currentConfig.type == "css")
				{
					// Concat bundle files
					mergeConfig.less[currentConfig.name] = {
						src: currentConfig.src,
						dest: currentConfig.dest
					};

					// Config auto-prefixer
					mergeConfig.autoprefixer[currentConfig.name] = {
						src: currentConfig.css,
						dest: currentConfig.css
					};

					// Less obfuscation
					mergeConfig.cssmin[currentConfig.name] = {
						src: currentConfig.dest,
						dest: currentConfig.dest
					};

					// Compile script
					pGrunt.registerTask(currentConfig.name, [
						'less:' + currentConfig.name,
						'autoprefixer:' + currentConfig.name
					]);

					// Compile script and optimise
					pGrunt.registerTask(currentConfig.name + ':optimised', [
						currentConfig.name,
						'cssmin:' + currentConfig.name
					]);
				}

				// Watch from js / css files changes
				mergeConfig.watch[currentConfig.name] = {
					files: currentConfig.src,
					tasks: [currentConfig.name]
				};
			}

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