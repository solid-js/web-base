module.exports = {
	config: {
		spriteExample:
		{
			options: {
				optimizationLevel: 5
			},
			files: {
				'{= path.deploy }destination': '{= path.deploy }source'
			}
		}
	}
};