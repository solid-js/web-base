module.exports = {
	config: {
		options: {
			// Remove all comments
			stripBanners: {
				block: true,
				line: true
			},

			// Use ES5 strict mode
			banner: '\n\n',
			separator: '\n'
		}
	}
};