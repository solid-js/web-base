module.exports = function (grunt)
{
	return {
		options: {

			// Files we need to process
			files: [
				/*
				{
					src: '{= path.deploymentFiles }.htaccess',
					dest: '{= path.deploy }.htaccess'
				},
				*/

				// Example with dynamic file name
				/*{
					src: '{= path.deploymentFiles }.spec',
					dest: '{= path.deploy }%%specName%%.spec'
				},*/

				// Copy informations as config.json
				// Version number is injected
				{
					src: '{= path.deploymentFiles }config.json',
					dest: '{= path.src }common/config/App.json'
				}
			],

			// Auto-incremented version file
			versionFile: '{= path.deploymentFiles }version',

			// Common properties for all targets
			properties: {

			}
		},

		// Deploy local - grunt deployer:local
		local: {
			properties: {
				env: 'local'
			}
		},

		// Deploy pre-production - grunt deployer:preprod
		preprod: {
			properties: {
				env: 'preprod'
			}
		},

		// Deploy for production - grunt deployer:prod
		prod: {
			properties: {
				env: 'prod'
			}
		}
	}
};