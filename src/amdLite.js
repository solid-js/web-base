/**
 * Public requirejs API
 */
var requirejs, require;

/**
 * Public define API
 */
var define;

/**
 * AMD Lite public API
 */
var amdLite = (function ()
{
	/**
	 * Public scope
	 */
	var that = {

		/**
		 * Modules that are already required and initialised.
		 */
		readyModules: [],

		/**
		 * Modules defined but never required yet.
		 * Every item contains a callback and dependency list.
		 */
		waitingModules : [],

		/**
		 * Inject RequireJS public API into public scope.
		 * @param publicScope Public scope to inject API in. Default is window.
		 */
		injectPublicAPI : function (publicScope)
		{
			// Default public scope is window
			publicScope = (publicScope == null ? window : publicScope);

			// Set requirejs and require methods
			publicScope['requirejs'] = publicScope['require'] = that.require;

			// Expose ready defined modules onto requirejs for maximum compatibility
			publicScope['requirejs']._defined = that.readyModules;

			// Expose define method
			publicScope['define'] = that.define;

			// TODO : Rendre paramétrable
			// Expose AMD object
			publicScope['define'].amd = {
				jQuery: true
			};
		},

		// TODO : Rendre accessible en public

		mappedDependencies : {
			'react-dom' : 'ReactDOM',
			'react' : 'React'
		},



		require: function (dependencyNames, callback, from)
		{
			// Require dependencies from root if no origin is given
			from = (from == null ? '' : from);

			console.log('>>>> require', dependencyNames, from);

			// Get dependencies
			var dependencies = getDependencies(dependencyNames, from);

			// Call back with dependencies
			callback.apply( null, dependencies );
		},

		/**
		 * Set public define API.
		 * TODO : Doc
		 * @param name
		 * @param dependencies
		 * @param callback
		 */
		define: function (name, dependencies, callback)
		{
			//
			if (typeof name !== 'string')
			{
				console.warn('Non optimised AMD module detected.');
				return;
			}

			that.waitingModules[ name ] = {
				dependencies: dependencies,
				callback: callback
			};

			//console.log('>>>> define', name, dependencies);
		},


		/**
		 * Given a relative module name, like ./something, normalize it to
		 * a real name that can be mapped to a path.
		 * @param {String} name the relative name
		 * @param {String} baseName a real name that the name arg is relative to.
		 * @param {String} map TODO : DOC
		 * @returns {String} normalized name
		 */
		normalizeModuleName : function (name, baseName, map)
		{
			var nameParts, nameSegment, mapValue, foundMap,
				foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
				baseParts = baseName && baseName.split("/"),
				starMap = (map && map['*']) || {};

			//Adjust any relative paths.
			if (name) {
				name = name.split('/');

				// Starts with a '.' so need the baseName
				if (name[0].charAt(0) === '.' && baseParts) {
					//Convert baseName to array, and lop off the last part,
					//so that . matches that 'directory' and not name of the baseName's
					//module. For instance, baseName of 'one/two/three', maps to
					//'one/two/three.js', but we want the directory, 'one/two' for
					//this normalization.
					normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
					name = normalizedBaseParts.concat(name);
				}

				//start trimDots
				for (i = 0; i < name.length; i++) {
					part = name[i];
					if (part === '.') {
						name.splice(i, 1);
						i -= 1;
					} else if (part === '..') {
						// If at the start, or previous value is still ..,
						// keep them so that when converted to a path it may
						// still work when converted to a path, even though
						// as an ID it is less than ideal. In larger point
						// releases, may be better to just kick out an error.
						if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
							continue;
						} else if (i > 0) {
							name.splice(i - 1, 2);
							i -= 2;
						}
					}
				}
				//end trimDots

				name = name.join('/');
			}

			//Apply map config if available.
			if ((baseParts || starMap) && map) {
				nameParts = name.split('/');

				for (i = nameParts.length; i > 0; i -= 1) {
					nameSegment = nameParts.slice(0, i).join("/");

					if (baseParts) {
						//Find the longest baseName segment match in the config.
						//So, do joins on the biggest to smallest lengths of baseParts.
						for (j = baseParts.length; j > 0; j -= 1) {
							mapValue = map[baseParts.slice(0, j).join('/')];

							//baseName segment has  config, find if it has one for
							//this name.
							if (mapValue) {
								mapValue = mapValue[nameSegment];
								if (mapValue) {
									//Match, update name to the new value.
									foundMap = mapValue;
									foundI = i;
									break;
								}
							}
						}
					}

					if (foundMap) {
						break;
					}

					//Check for a star map match, but just hold on to it,
					//if there is a shorter segment match later in a matching
					//config, then favor over this star map.
					if (!foundStarMap && starMap && starMap[nameSegment]) {
						foundStarMap = starMap[nameSegment];
						starI = i;
					}
				}

				if (!foundMap && foundStarMap) {
					foundMap = foundStarMap;
					foundI = starI;
				}

				if (foundMap) {
					nameParts.splice(0, foundI, foundMap);
					name = nameParts.join('/');
				}
			}

			return name;
		}
	};






	/**
	 * Get dependencies instances from relative names.
	 * @param dependencyNames Dependency names relatives from "from" argument
	 * @param from Original path from where to require.
	 */
	var getDependencies = function ( dependencyNames, from )
	{
		// Browse dependency names
		return dependencyNames.map( function (dependencyName)
		{
			// Normalize path from root
			var dependencyPath = that.normalizeModuleName( dependencyName, from );

			// Get dependency instance
			var dependencyInstance = getDependency( dependencyPath );

			// If this dependency is not found
			if (dependencyInstance == null)
			{
				console.warn('Module '+ dependencyPath +' not found');
			}

			// Return required dependency instance
			return dependencyInstance;
		});
	};

	/**
	 *
	 * @param dependencyPath
	 * @returns {*}
	 */
	var getDependency = function (dependencyPath)
	{
		//console.log('GET DEP', dependencyPath);

		if (dependencyPath == 'require')
		{
			return require;
		}

		else if (dependencyPath == 'exports')
		{
			return {};
		}

		else if (dependencyPath in that.mappedDependencies)
		{
			var dependencyGlobalName = that.mappedDependencies[ dependencyPath ];
			if (!(dependencyGlobalName in window))
			{
				console.warn('Global dependency ' + dependencyGlobalName + ' not found.');
				return null;
			}
			return window[ dependencyGlobalName ];
		}

		else if (dependencyPath in that.readyModules)
		{
			return that.readyModules[ dependencyPath ];
		}

		else if (dependencyPath in that.waitingModules)
		{
			var moduleToBuild = that.waitingModules[ dependencyPath ];

			console.log('module to build', dependencyPath, moduleToBuild.dependencies);

			var dependencies = getDependencies(
				moduleToBuild.dependencies,
				dependencyPath
			);

			var exportsIndex = moduleToBuild.dependencies.indexOf('exports');

			if (exportsIndex == -1)
			{
				console.warn('Invalid exports index');
				return null;
			}

			moduleToBuild.callback.apply( null, dependencies );

			var buildModule = dependencies[ exportsIndex ];

			that.readyModules[ dependencyPath ] = buildModule;

			delete that.waitingModules[ dependencyPath ];

			return buildModule;
		}

		else return null;
	};


	// TODO : Rendre optionnel

	that.injectPublicAPI();

	return that;
})();
