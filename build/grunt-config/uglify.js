module.exports = {
	config: {
		options: {
			mangle: false,
			report: 'gzip',
			footer: '// {= grunt.template.today("yyyy-mm-dd hh:mm:ss") }'
		}
	}
};