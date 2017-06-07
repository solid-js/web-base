module.exports = function (grunt) {
	return {
		options: {
			livereload: true,
			interrupt: false,
			spawn: true
		},

		// TODO : Plus précis
		lessToJson: {
			files: ['{= path.src}**/*.less'],
			tasks: ['less2js']
		},

		jsonToJs: {
			files: ['{= path.src}**/*.json'],
			tasks: ['all']
		},

		// TODO : A ajouter et rendre plus précis dans spriteGenerator
		sprites: {
			files: [
				'{= path.src}**/*.png',
				'{= path.src}**/*.jpg'
			],
			tasks: ['sprites']
		}
	}
};