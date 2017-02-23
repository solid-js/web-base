/// <reference path="../../lib/solidify/definitions/globalScope.d.ts" />

import {DependencyManager, IModulePathStorage} from "../../lib/solidify/helpers/DependencyManager";
import {App} from "../../lib/solidify/core/App";
import {IAppParams} from "../../lib/solidify/core/App";
import {ReactView, React, ReactDom} from "../../lib/solidify/react/ReactView";
import {Config} from "../../lib/solidify/core/Config";
import ReactDOM = __React.ReactDOM;
import {Router} from "../../lib/solidify/navigation/Router";

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
	 * Init app config
	 */
	protected initConfig ()
	{
		// Inject deployed JSON config
		Config.instance.inject(
			JsonFiles['src/common/config/App']
		);
	}

	/**
	 * Init module path declarations.
	 */
	protected initModules ()
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
	protected initDependencies ():void
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
		//this._appView = ReactDom.render( <MyAppView />, this._matchingParameter.root[0] ) as MyAppView;
	}


	// ------------------------------------------------------------------------- ROUTES

	/**
	 * Init routes system
	 */
	initRoutes ():void
	{
		// Init router
		// Google analytics is automatically called when page is chaning
		let router = new Router(
			this._params.base,
			[
				// -- Home page
				{
					url		: '/',
					page	: 'HomePage'
				},

				// -- Product pages
				{
					url		: '/products/',
					page	: 'ProductPage',
					action	: 'overview'
				},
				{
					url		: '/products/{id}.html',
					page	: 'ProductPage',
					action	: 'product'
				}
			]
		);

		// Enable auto link listening
		router.listenLinks();

		// Register mainStack
		// This stack will receive NotFoundPage if no matching route is found
		//router.registerStack('main', stackInstance);
	}


	// ------------------------------------------------------------------------- READY

	/**
	 * When everything is ready
	 */
	ready ()
	{
		// Start router when ready
		Router.instance.start();
	}
}