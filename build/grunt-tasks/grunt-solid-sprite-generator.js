
var Handlebars = require('handlebars');
var ModuleNameNormalizer = require('./utils/module-name-normalizer');

// -----------------------------------------------------------------------------

/**
 * Default config file :
 * @see https://github.com/solid-js/web-base/blob/master/build/grunt-config/spriteGenerator.js
 *
 * Node-sprite-generator :
 * @see https://github.com/selaux/node-sprite-generator
 */
module.exports = function (pGrunt)
{
	// Load not sprite generator as Grunt task
	pGrunt.loadNpmTasks('node-sprite-generator');

	// Load spriteGenerator config
	var spriteGeneratorConfig = pGrunt.config.get('spriteGenerator');

	// Check if we have spriteGenerator config
	if (!spriteGeneratorConfig)
	{
		pGrunt.fail.fatal('spriteGenerator is missing from config.');
	}

	// Check if we have an option node inside config
	if (!('options' in spriteGeneratorConfig))
	{
		pGrunt.fail.fatal('options node is missing from spriteGenerator config.');
	}

	// Target options
	var options = spriteGeneratorConfig.options;

	// Check if options is well formatted
	if (
				!('inputFolder'           in spriteGeneratorConfig.options)
				|| !('fileExtensions'     in spriteGeneratorConfig.options)
				|| !('spriteSheetOutput'  in spriteGeneratorConfig.options)
				|| !('spriteOutput'       in spriteGeneratorConfig.options)
				|| !('spritePath'         in spriteGeneratorConfig.options)
				|| !('compression'        in spriteGeneratorConfig.options)
				|| !('filter'             in spriteGeneratorConfig.options)
				|| !('skeletons'          in spriteGeneratorConfig.options)
		)
	{
		pGrunt.fail.fatal('options node from spriteGenerator config is not formatted correctly.');
	}


	// ---------------------------------------------------------------------------

	pGrunt.log.writeln('Loading stylesheet skeletons ...');

	// Load all skeletons and store them in memory cache
	var fileExpand = pGrunt.file.expand(options.skeletons);
	var skeletons = [];
	for (var i in fileExpand)
	{
		// Extract extension from file name
		// We take the last -part (ex : sprite-template-json will create a json file)
		var splittedSkeletonName = ModuleNameNormalizer.getFileName(fileExpand[i]).split('-');

		skeletons.push({
			extension: splittedSkeletonName[splittedSkeletonName.length - 1],
			template: Handlebars.compile(
				pGrunt.file.read( fileExpand[i] )
			)
		});
	}

	// ---------------------------------------------------------------------------

	// Generate sprite seed for cache
	var spriteSeed = (Math.random() * Math.pow(10, 16)).toString(16) + new Date().getTime().toString(16);


	// ---------------------------------------------------------------------------

	// Function called to generate a stylesheet
	function generateStylesheets (pSpriteName, pSpriteData, pStylesheetOutputPath, pPNGOutputPath, pStylesheetOptions, pCallback)
	{
		// Create clean styleSheet data for handlebars skeletons
		var cleanStylesheetData = {
			spriteName    : pSpriteName,
			spritePrefix  : pStylesheetOptions.prefix,
			spriteSeed    : spriteSeed,
			spriteWidth   : pSpriteData.width,
			spriteHeight  : pSpriteData.height,
			spritePath    : pStylesheetOptions.spritePath,
			textures      : []
		};

		// Browse images
		for (var i in pSpriteData.images)
		{
			// Target this image data
			var currentImage = pSpriteData.images[i];

			// Add clean data to clean styleSheet data
			cleanStylesheetData.textures.push({
				x       : currentImage.x,
				y       : currentImage.y,
				width   : currentImage.width,
				height  : currentImage.height,
				name    : ModuleNameNormalizer.getFileName(currentImage.path)
		  });
		}

		// Add lastOne flag for JSON files
		cleanStylesheetData.textures[cleanStylesheetData.textures.length - 1].lastOne = true;

		// Browse already loaded skeletons
		for (var i in skeletons)
		{
			// Generate styleSheet from skeleton and write it to output file
			var currentSkeleton = skeletons[i];
			pGrunt.file.write(
					pStylesheetOutputPath + '.' + currentSkeleton.extension,
					currentSkeleton.template( cleanStylesheetData )
			);
		}

		// We are all set
		pCallback();
	}

	// Inject a config node inside spriteGenerator config
	// Without overriding if this node already exists.
	function injectConfig (pConfig, pName, pValue)
	{
		if (!(pName in pConfig))
		{
			pConfig[pName] = pValue;
		}
	}

	// ---------------------------------------------------------------------------

	// Array of tasks for every sprites.
	// Will be used to make a "sprites" task which compile every sprites
	var spritesTaskNames = [];

	// Common used config parts
	var outputSpriteExtension     = '.png';
	var spritePrefix              = 'sprite';
	var separator                 = '-';

	// Browse every sprite target
	for (var spriteName in spriteGeneratorConfig)
	{
		// If this is not the options node
		if (spriteName != 'options')
		{
			// Target config for this sprite
			var spriteConfig = spriteGeneratorConfig[spriteName];

			// If the noOverride option is defined
			// We don't override this conf so user can still use node-sprite-generator vanilla style
			if (!('noOverride' in spriteConfig) || !spriteConfig.noOverride)
			{
				// Inject source from options (every file type)
				injectConfig(spriteConfig, 'src', []);
				for (var i in options.fileExtensions)
				{
					spriteConfig.src.push(
						options.inputFolder + spriteName + options.fileExtensions[i]
					);
				}

				// Inject sprite path (PNG file output)
				injectConfig(spriteConfig, 'spritePath',
					options.spriteOutput + spriteName + outputSpriteExtension
				);

				// Inject styleSheet path (LESS file output)
				injectConfig(
						spriteConfig, 'stylesheetPath',
						options.spriteSheetOutput + spritePrefix + separator + spriteName
				);

				// Inject stylesheet options
				injectConfig(spriteConfig, 'stylesheetOptions', {
					prefix      : spritePrefix + separator + spriteName,
					spritePath  : options.spritePath + spriteName + outputSpriteExtension
					//pixelRatio  : 2
				});

				// Inject default layout
				injectConfig(spriteConfig, 'layout', 'packed');
				injectConfig(spriteConfig, 'layoutOptions', {
					padding: 2
					//scaling : 1
				});

				// Inject default compositor
				injectConfig(spriteConfig, 'compositor', 'jimp');

				// Inject compositor options
				injectConfig(spriteConfig, 'compositorOptions', {
					compressionLevel  : options.compression,
					filter            : options.filter
				});
			}

			// Inject stylesheet function generator
			// We always inject this one if not defined
			// So user can use this exporter with custom config
			injectConfig(spriteConfig, 'stylesheet', generateStylesheets.bind(this, spriteName));

			// Add this sprite as a single task and also to the sprites global task
			var taskName = 'spriteGenerator:' + spriteName;
			pGrunt.registerTask('sprites:'+spriteName, taskName);
			spritesTaskNames.push(taskName);
		}
	}

	// Add all sprites to "sprites" task
	pGrunt.registerTask('sprites', spritesTaskNames);

	// Remove options for cleaner output
	delete spriteGeneratorConfig.options;

	// Set new config object
	pGrunt.config.set('spriteGenerator', spriteGeneratorConfig);
};