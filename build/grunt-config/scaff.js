module.exports = function (grunt)
{
	// Capitalize first letter. Can also put first letter as lower case.
	function capitalizeFirst (pString, pUp)
	{
		var first = pString.substr(0, 1);
		var rest = pString.substr(1, pString.length);
		return ((pUp == null || !pUp) ? first.toLowerCase() : first.toUpperCase()) + rest;
	}

	// This filter method will add capital first version of componentName as capitcalComponentName in vars bag
	function filter (result)
	{
		// componentName with first lowerCase
		result.componentName = capitalizeFirst(result.componentName, false);

		// capitalComponentName with first upperCase
		result.capitalComponentName = capitalizeFirst(result.componentName, true);

		// Module name with first lowerCase
		result.moduleName = capitalizeFirst(result.moduleName, false);

		return result;
	}

	// Config
	return {
		// Scaffolder for a solid react component
		reactComponent: {
			options: {
				questions: [
					// In which module do we have to create the new component ?
					{
						name: 'moduleName',
						type: 'input',
						message: 'Module name (lowerCamelCase please) :'
					},

					// What is the component name ?
					{
						name: 'componentName',
						type: 'input',
						message: 'React component name (lowerCamelCase please) :'
					}
				],
				filter: filter,
				template: {
					'skeletons/components/componentStyle': '{= path.src }%%moduleName%%/components/%%componentName%%/%%capitalComponentName%%.less',
					'skeletons/components/reactComponentScript': '{= path.src }%%moduleName%%/components/%%componentName%%/%%capitalComponentName%%.tsx'
				}
			}
		},

		// Scaffolder for a solid jquery component
		jqueryComponent: {
			options: {
				questions: [
					// In which module do we have to create the new component ?
					{
						name: 'moduleName',
						type: 'input',
						message: 'Module name - CamelCase :'
					},

					// What is the component name ?
					{
						name: 'componentName',
						type: 'input',
						message: 'JQuery component name CamelCase :'
					}
				],
				filter: filter,
				template: {
					'skeletons/components/componentStyle': '{= path.src }%%moduleName%%/components/%%componentName%%/%%capitalComponentName%%.less',
					'skeletons/components/jqueryComponentScript': '{= path.src }%%moduleName%%/components/%%componentName%%/%%capitalComponentName%%.tsx'
				}
			}
		}
	};
};