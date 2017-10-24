
/**
 * AMD Lite public API
 */
var amdLite = (function ()
{
	/**
	 * Public scope
	 */
	var that = {

		// --------------------------------------------------------------------- PROPERTIES

		/**
		 * Modules that are already required and initialised.
		 */
		readyModules: [],

		/**
		 * Modules defined but never required yet.
		 * Every item contains a callback and dependency list.
		 * Required modules are removed from this list and added to the readyModules list.
		 */
		waitingModules : [],

		/**
		 * Public scope where require API is injected and where from global dependencies are retrieved
		 */
		publicScope: window,

		/**
		 * Throw on error.
		 * If false, will warn in console if verbosity is > 0
		 */
		strict: true,

		/**
		 * 0 -> quiet
		 * 1 -> warnings
		 * 2 -> notices
		 */
		verbosity: 1,

		/**
		 * Modules names mapped to global dependencies.
		 *
		 * For example you can map :
		 * "react" : "React"
		 * "react-dom" : "ReactDOM"
		 *
		 * With this configuration, when module "react" is required,
		 * "React" from global scope will be served.
		 *
		 * Really handy from non AMD compatible libraries or not optimised modules.
		 */
		globalDependencies : {},

		/**
		 * AMD Object injected onto define method.
		 * Useful so UMD libraries know if they can inject themselves.
		 * Default is { jQuery : true }
		 */
		amdObject: {
			jQuery: true
		},


		// --------------------------------------------------------------------- INIT

		/**
		 * Init AMD Lite API.
		 *
		 * Those options are available and will override properties on amdLite object :
		 * - verbosity
		 * - strict
		 * - publicScope
		 * - globalDependencies
		 * - amdObject
		 *
		 * @param options Can override some properties on amdLite object. @see init.
		 */
		init : function (options)
		{
			// Default options bag
			var options = (options || {});

			// Override default options.
			if ('verbosity' in options) 			that.verbosity = options.verbosity;
			if ('strict' in options) 				that.strict = options.strict;
			if ('publicScope' in options)			that.publicScope = options.publicScope;
			if ('globalDependencies' in options)	that.globalDependencies = options.globalDependencies;
			if ('amdObject' in options)				that.amdObject = options.amdObject;

			// Inject amd lite API into public scope.
			this._injectPublicAPI()
		},

		/**
		 * Inject RequireJS public API into public scope.
		 * Do not call directly.
		 * @private
		 */
		_injectPublicAPI : function ()
		{
			// Set requirejs and require methods
			that.publicScope['requirejs'] = that.publicScope['require'] = that.require;

			// Expose ready defined modules onto requirejs for maximum compatibility
			that.publicScope['requirejs']._defined = that.readyModules;

			// Expose define method
			that.publicScope['define'] = that.define;

			// Expose AMD object
			that.publicScope['define'].amd = that.amdObject;
		},


		// --------------------------------------------------------------------- REQUIRE JS PUBLIC API
		// Here are require JS lite public methods.

		/**
		 * TODO : DOC
		 * @param dependencyNames
		 * @param callback
		 * @param from
		 */
		require: function (dependencyNames, callback, from)
		{
			// Require dependencies from root if no origin is given
			from = (from || '');

			// Log
			that.verbosity >= 2 && console.info('amdLite.require', dependencyNames, from);

			// Get dependencies
			var dependencies = that.resolveDependencies(dependencyNames, from);

			// Call back with dependencies
			callback.apply( null, dependencies );
		},

		/**
		 * TODO : Doc
		 * @param name
		 * @param dependencies
		 * @param callback
		 */
		define: function (name, dependencies, callback)
		{
			// First argument needs to be a string
			if (typeof name !== 'string')
			{
				// If not, we are on a not optimized module
				let message = 'amdLite.define // Not optimized AMD module detected.';
				message += '\n@see http://requirejs.org/docs/optimization.html';

				// TODO : Ajouter lien compilateur compileAmd une fois projets sur github + npm
				//message += '\n@see ';

				// Show message
				if (that.strict)
					throw new Error( message );
				else if (that.verbosity >= 1)
					console.warn( message );

				// Stop define
				return;
			}

			// Add module to waiting modules list
			that.waitingModules[ name ] = {
				dependencies: dependencies,
				callback: callback
			};

			// Log
			that.verbosity >= 2 && console.info('amdLite.define //', name, dependencies);
		},


		// --------------------------------------------------------------------- HELPERS
		// Helper methods.

		/**
		 * Given a relative module name, like ./something, normalize it to
		 * a real name that can be mapped to a path.
		 * @param {String} name the relative name
		 * @param {String} baseName a real name that the name arg is relative to.
		 * @returns {String} normalized name
		 */
		normalizeModuleName : function (name, baseName)
		{
			var i, part, normalizedBaseParts,
				baseParts = baseName && baseName.split("/");

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

			return name;
		},


		// --------------------------------------------------------------------- DEPENDENCIES RESOLVING
		// Here we tries to convert a dependency name to modules .

		/**
		 * Get defined modules from relative dependency names.
		 *
		 * Ex : resolveDependencies(['my/dependency/', 'react'])
		 * Will return an array of defined modules from those names.
		 *
		 * @param dependencyNames Dependency names relatives from "from" argument
		 * @param from Original path from where to require.
		 * @return an array of defined modules.
		 */
		resolveDependencies : function ( dependencyNames, from )
		{
			// Browse dependency names
			return dependencyNames.map( function (dependencyName)
			{
				// Normalize path from root
				var dependencyPath = that.normalizeModuleName( dependencyName, from );

				// Get dependency instance
				var dependencyInstance = that.resolveDependency( dependencyPath );

				// If this dependency is not found
				if (dependencyInstance == null)
				{
					var message = 'amdLite.resolveDependencies // Module ' + dependencyPath + ' not found.';
					if (that.strict)
						throw new Error( message );
					else if (that.verbosity >= 1)
						console.warn( message );
				}

				// Return required dependency instance
				return dependencyInstance;
			});
		},

		/**
		 * Resolve a dependency from its path.
		 *
		 * Will check if path is :
		 * - a special case (1)
		 * - a global dependency
		 * - a ready module
		 * - a waiting module (2)
		 *
		 * (1) Special cases :
		 * - "require" will resolve to require method.
		 * - "exports" will resolve to a new empty object (for exports statements)
		 *
		 * (2) If module is in waiting list, module will be initialized and will go to
		 * the ready modules list.
		 *
		 * @param dependencyPath Absolute path to the dependency. Path needs to be normalized at this point.
		 * @throws Error if exports statement not found when initializing module.
		 * @returns Found module public API.
		 */
		resolveDependency : function (dependencyPath)
		{
			// Special case : require
			if (dependencyPath == 'require')
			{
				return require;
			}

			// Special case : exports statement
			else if (dependencyPath == 'exports')
			{
				return {};
			}

			// Check if module is a global dependency
			else if (dependencyPath in that.globalDependencies)
			{
				// Get global dependency name
				var dependencyGlobalName = that.globalDependencies[ dependencyPath ];

				return (
					// If this dependency is not in the global scope
					!(dependencyGlobalName in that.publicScope)
					? null

					// Return global module
					: that.publicScope[ dependencyGlobalName ]
				)
			}

			// Check if module is ready
			else if (dependencyPath in that.readyModules)
			{
				return that.readyModules[ dependencyPath ];
			}

			// Check if module is not ready but defined and in waiting list
			else if (dependencyPath in that.waitingModules)
			{
				// Get module building info from waiting list
				var moduleToBuild = that.waitingModules[ dependencyPath ];

				// Get index for exports statement
				var exportsIndex = moduleToBuild.dependencies.indexOf('exports');

				// If exports statement is not found in module dependencies
				if (exportsIndex == -1)
				{
					// Error message
					var message = 'amdLite.resolveDependency // Exports statement not found for module ' + dependencyPath;
					if (that.strict)
						throw new Error( message );
					else if (that.verbosity >= 1)
						console.warn( message );
					return null;
				}

				// Resolve waiting module dependencies recursively
				var dependencies = that.resolveDependencies(
					moduleToBuild.dependencies,
					dependencyPath
				);

				// Call module callback with resolved dependencies
				moduleToBuild.callback.apply( null, dependencies );

				// Retrieve exports object from its index
				// Module public API is this very object
				var buildModule = dependencies[ exportsIndex ];

				// Register this module as ready
				that.readyModules[ dependencyPath ] = buildModule;
				delete that.waitingModules[ dependencyPath ];

				// Return module
				return buildModule;
			}

			// Not found
			else return null;
		}
	};

	// ------------------------------------------------------------------------- AUTO INIT

	// If define is already in window
	// Init with default parameters
	// This to auto-enable without calling amdLite API
	if ('define' in window)
	{
		that.init({});
	}

	// Return public scope as amdLite
	return that;
})();