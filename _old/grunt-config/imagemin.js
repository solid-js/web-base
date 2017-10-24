module.exports = function (grunt) {
	return {
		spriteExample:
		{
			options: {
				optimizationLevel: 5
			},
			files: {
				//'{= path.deploy }destination': '{= path.deploy }source'
			}
		}
	}
};