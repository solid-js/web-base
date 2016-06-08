module.exports = function (grunt) {
	return {
		options: {
			mangle: false,
			report: 'gzip',
			// TODO : Integrate VERSION number ?
			footer: '// {= grunt.template.today("yyyy-mm-dd hh:mm:ss") }'
		}
	}
};