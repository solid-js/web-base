module.exports = {
	config: {
		options: {
			// Files we need to process
			files: [
				{
					src: '{= path.deploymentFiles }.htaccess',
					dest: '{= path.deploy }.htaccess'
				},
				{
					src: '{= path.deploymentFiles }.spec',
					dest: '{= path.deploy }%%specName%%.spec'
				}
			],

			// Auto-incremented version file
			versionFile: '{= path.deploymentFiles }version',

			// Properties common for all targets
			properties: {
				specName : 'specTestName'
			}
		},

		local: {
			properties: {
			}
		},
		preprod: {
			properties: {
			}
		},
		prod: {
			properties: {
			}
		}
	}
};