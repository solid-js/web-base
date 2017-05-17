/// <reference path="../../lib/solidify/definitions/globalScope.d.ts" />

import {DependencyManager, IModulePathStorage} from "../../lib/solidify/helpers/DependencyManager";
import {App} from "../../lib/solidify/core/App";
import {IAppParams} from "../../lib/solidify/core/App";
import {ReactView, React, ReactDom} from "../../lib/solidify/react/ReactView";
import {Config} from "../../lib/solidify/core/Config";
import ReactDOM = __React.ReactDOM;
import {Router} from "../../lib/solidify/navigation/Router";
import {
	EOrientation, EBreakpointName, IBreakpoint,
	ResponsiveManager
} from "../../lib/solidify/helpers/ResponsiveManager";

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

		// FIXME : remove this, this is a test
		this.responsiveManagerTest();
	}

	responsiveManagerTest ()
	{
		// Responsive manager test
		ResponsiveManager.instance.setBreakpoints([
			// -- HORIZONTAL
			{
				orientation	: EOrientation.HORIZONTAL,
				name		: EBreakpointName.MOBILE,
				from		: 0
			},
			{
				orientation	: EOrientation.HORIZONTAL,
				name		: EBreakpointName.TABLET,
				from		: 700
			},
			{
				orientation	: EOrientation.HORIZONTAL,
				name		: EBreakpointName.DESKTOP,
				from		: 1200
			},
			{
				orientation	: EOrientation.HORIZONTAL,
				name		: EBreakpointName.EXTRA_LARGE,
				from		: 1600
			},

			// -- VERTICAL
			{
				orientation	: EOrientation.VERTICAL,
				name		: EBreakpointName.TINY,
				from		: 0
			},
			{
				orientation	: EOrientation.VERTICAL,
				name		: EBreakpointName.SMALL,
				from		: 400
			},
			{
				orientation	: EOrientation.VERTICAL,
				name		: EBreakpointName.MEDIUM,
				from		: 600
			},
			{
				orientation	: EOrientation.VERTICAL,
				name		: EBreakpointName.LARGE,
				from		: 900
			}
		]);


		ResponsiveManager.instance.onHorizontalBreakpointChanged.add( (pNewBreakpoint:IBreakpoint, pOldBreakpoint:IBreakpoint) =>
		{
			console.log('NEW HORIZONTAL BREAKPOINT', pNewBreakpoint);

		});
		ResponsiveManager.instance.onVerticalBreakpointChanged.add( (pNewBreakpoint:IBreakpoint, pOldBreakpoint:IBreakpoint) =>
		{
			console.log('NEW VERTICAL BREAKPOINT', pNewBreakpoint);
		});

		ResponsiveManager.instance.onOrientationChanged.add( (pNewOrientation:EOrientation) =>
		{
			console.log('NEW ORIENTATION', pNewOrientation);
		});

		ResponsiveManager.instance.onWindowSizeChanged.add( (pNewWidth:number, pNewHeight:number) =>
		{
			//console.log('NEW SIZE', pNewWidth, pNewHeight);
		});
	}
}