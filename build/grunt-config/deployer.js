module.exports = function (grunt)
{
	return {
		options: {

			// Files we need to process
			files: [
				// Example for .htaccess file
				/*
				{
					src: '{= path.skeletons }deployment/.htaccess',
					dest: '{= path.deploy }.htaccess'
				},
				*/

				// Example with dynamic file name
				/*{
					src: '{= path.skeletons }deployment/.spec',
					dest: '{= path.deploy }%%specName%%.spec'
				},*/

				// Copy informations as config.json
				// Version number is injected
				{
					src: '{= path.skeletons }deployment/config.json',
					dest: '{= path.src }common/config/App.json'
				}
			],

			// Auto-incremented version file
			versionFile: '{= path.skeletons }deployment/version',

			// Common properties for all targets
			properties: {
				debug: true
			}
		},

		// This task is only here to bump version but does deploy anything
		increment: { },

		// Deploy local - grunt deployer:local
		local: {
			properties: {
				env: 'local'
			}
		},

		// Deploy for staging - grunt deployer:staging
		staging: {
			properties: {
				env: 'staging',
				//debug: false
			}
		},

		// Deploy for production - grunt deployer:production
		production: {
			properties: {
				env: 'production',
				debug: false
			}
		}
	}
};