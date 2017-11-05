module.exports = function (grunt, __)
{
	// ------------------------------------------------------------------------- CLEAN

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.config('clean', {
		amd: {
			src: __.amdFilesRoot + __.allJsFiles
		}
	});
};