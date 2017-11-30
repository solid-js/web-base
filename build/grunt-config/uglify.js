module.exports = function (grunt) {
	return {
		options: {
			mangle: false,
			report: 'gzip',
			comments: false,
			compress: true,
			beautify: false,
			banner: "// {= grunt.template.today('yyyy-mm-dd HH:MM:ss') }\n"
		}
	}
};