module.exports = function (grunt)
{
	/**
	 * Node-sprite-generator :
	 * @see https://github.com/selaux/node-sprite-generator
	 */

	return {
		// Global options for every sprites
		// (keep trailing slash for every path)
		options : {

			// Where are stored sprite folders
			inputFolder       : '{= path.src }common/sprites/',

			// File extensions for inputs
			fileExtensions    : ['/*.png', '/*.jpg'],

			// Where are created spriteSheets (LESS and JS) files
			spriteSheetOutput : '{= path.src }common/sprites/',

			// Sprite path to load PNG from output CSS file
			spritePath        : '../sprites/',

			// Where are created PNG output texture file
			spriteOutput      : '{= path.www }assets/img/sprites/',

			// PNG output compression level (from 0 to 9)
			compression       : 9,

			// Filter applied at composition (all, none, sub, up, average, paeth)
			filter            : 'none',

			// Path to the spriteSheet skeletons
			// Extension is created from last -part of name
			// ex : sprite-template-json will create a json file
			skeletons         : '{= path.skeletons }sprites/*'
		},

		/**
		 * This is config will be overridden by solid (grunt-sprite-generator task)
		 * Using node-sprite-generator with convention over configuration principle.
		 * You can still use node-sprite-generator natively without solid conventions.
		 * Add noOverride: true parameter inside yout sprite config node.
		 *
		 * How to configure a new sprite.
		 * Create a folder at "inputFolder" path value.
		 * Put all images inside this folder.
		 * Remove all "sprite" or repeating words in naming
		 * (for ex if every files starts with "animations-", remove that.
		 *
		 * Then, add this config node by replacing "folderName"
		 * You can specify custom padding
		 *
		 * Note : Please set folderName snake-case as all sprites files.
		 * (ex : my-sprite/my-file-02.png)
		 *
		 * folderName : {
		 *  // noOverride is only if you want to use node-sprite-generator
		 *  // without solid layer. You'll need more config (see node-sprite-generator github)
		 *  noOverride : boolean
		 *
		 *  // Packing layout
		 *  // Available are : "horizontal" / "vertical" / "diagonal" / "packed"
		 *  // Default is "packed"
		 *  layout : string
		 *
		 *  // Padding between every sprite texture
		 *  // Default is 2
		 *  layoutOptions : {
		 *  	padding : number
		 *  }
		 * }
		 */

		// Example :
		/*
		'my-sprite-folder-name' : {
			layout  : 'vertical',
			layoutOptions : {
				padding : 0
			}
		}
		*/
	}
};