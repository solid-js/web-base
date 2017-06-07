module.exports = function (grunt) {
	return {
		options: {
			banner : ''
		},
		atoms: {
			format: 'json',
			parseNumbers: true,
			src: '{= path.src }common/atoms/*.less',
			dest: '{= path.src }common/config/Atoms.json'
		}
	}
};