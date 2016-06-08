/// <reference path="../../lib/solidify/definitions/grapnel.d.ts" />
/// <reference path="../../lib/solidify/definitions/globalScope.d.ts" />

import {DependencyManager, IModulePathStorage} from "../../lib/solidify/helpers/DependencyManager";
import {App} from "../../lib/solidify/core/App";
import {IAppParams} from "../../lib/solidify/core/App";
import {ReactView, React, ReactDom} from "../../lib/solidify/core/ReactView";
import {Config} from "../../lib/solidify/core/Config";

// ----------------------------------------------------------------------------- STRUCT

// App parameters interface extending default params
interface IMyModule1Params extends IAppParams
{
	env					:string;
	version				:string;
	locale				:any;
}


// Our app is extending solidify default app.
// Please take a look at the App class to understand how it works.

export class Main extends App<IMyModule1Params>
{
	// ------------------------------------------------------------------------- INIT

	/**
	 * Init module path declarations.
	 */
	initModules ()
	{
		// Register common dependencies
		this._dependencyManager.registerModulePath('component', 'src/common/components/');

		// Register app dependencies
		this._dependencyManager.registerModulePath('component', 'src/myModule1/components/');
		this._dependencyManager.registerModulePath('page', 'src/myModule1/pages/');

		// Show module paths
		console.log('>', this._dependencyManager.getFlatModulesPath());
	}

	/**
	 * Init app dependencies.
	 */
	initDependencies ():void
	{
		// Register the app instance
		this._dependencyManager.registerInstance('myModule1', this);

		// Register a class to the dependency manager
		// Will be a singleton, instanciated on the fly
		//this._dependencyManager.registerClass('MyAbstract', MyConcrete, true);

		// Register an instance to the dependency manager
		//this._dependencyManager.registerInstance('MyAbstract', new MyConcrete());
	}


	// ------------------------------------------------------------------------- APP VIEW

	// React component instance
	//protected _appView		:MyAppView;

	/**
	 * Init app view.
	 */
	protected initAppView ():void
	{
		//this._appView = ReactDom.render( <MyAppView />, this._params.root[0] ) as MyAppView;
	}


	// ------------------------------------------------------------------------- ROUTES

	protected _router		:Grapnel;

	/**
	 * Init routes system
	 */
	initRoutes ():void
	{

	}


	// ------------------------------------------------------------------------- READY

	ready ()
	{
		// Access to app config
		//Config.getAll<IMyModule1Params>().env

		// Access deployed config, version number and env
		// Deploy with `grunt deployer:local`
		console.log('Config', JsonFiles['src/common/config/App']);
	}
}