module.exports = {
	config: {
		options: {
			cleancss: false,
			compress: false
		},
		dev: {
			src: '{= path.src }myModule1/Main.less',
			dest: '{= path.deploy}style.css'
		}
	}
};