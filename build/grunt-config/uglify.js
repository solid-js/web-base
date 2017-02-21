module.exports = function (grunt) {
	return {
		options: {
			mangle: false,
			report: 'gzip',
			footer: '// {= grunt.template.today("yyyy-mm-dd hh:mm:ss") }'
		}
	}
};