module.exports = {
	config: {
		options: {
			// Remove all comments
			stripBanners: {
				block: true,
				line: true
			},

			// Use ES5 strict mode
			//banner: '"use strict"\n\n',

			// Between each concatenated file
			separator: '\n'
		}
	}
};