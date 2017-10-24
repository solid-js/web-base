/// <reference path="../../lib/solidify/definitions/globalScope.d.ts" />


import {App} from "../../lib/solidify/core/App";
import {IAppParameters} from "../../lib/solidify/core/App";
import {ReactView} from "../../lib/solidify/react/ReactView";
import {Config} from "../../lib/solidify/core/Config";
import {Router} from "../../lib/solidify/navigation/Router";
import {
	EDirection, EBreakpointName, IBreakpoint,
	ResponsiveManager, EAspectRatio
} from "../../lib/solidify/helpers/ResponsiveManager";
import {EaseUtils} from "../../lib/solidify/utils/EaseUtils";
import {MathUtils} from "../../lib/solidify/utils/MathUtils";
import {ScrollLocker} from "../../lib/solidify/helpers/ScrollLocker";
import {BitmapUtils} from "../../lib/solidify/utils/BitmapUtils";

// ----------------------------------------------------------------------------- STRUCT

// App parameters interface extending default parameters
interface IMyModule1Params extends IAppParameters
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

		// Default main GSAP easing with quick attach and slow release
		EaseUtils.registerMainEase(
			EaseUtils.combine(
				Expo.easeIn, Expo.easeOut, .2
			)
		);

		// Auto set breakpoints from compiled JSON file
		// This JSON file is compiled from atom less definitions
		ResponsiveManager.instance.autoSetBreakpointsFromLess();
	}

	/**
	 * Init module path declarations.
	 */
	protected initModules ()
	{
		// Register common dependencies
		this._dependencyManager.registerModulePath('component', 	'src/common/components/');

		// Register app dependencies
		this._dependencyManager.registerModulePath('component', 	'src/myModule1/components/');
		this._dependencyManager.registerModulePath('page', 			'src/myModule1/pages/');
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

	// App view instance
	//protected _appView		:MyAppView;
	//get appView ():MyAppView { return this._appView; }

	/**
	 * Init app view.
	 */
	protected initAppView ():void
	{
		// REACT
		//this._appView = ReactDom.render( <MyAppView />, this._parameters.root[0] ) as MyAppView;

		// JQUERY
		//this._appView = new MyAppView( this._parameters.root );
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
			this._parameters.base,
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
		
		// FIXME : remove this on your app
		//this.bitmapUtilsTest();
		//this.responsiveManagerTest();
		//this.easeTest();
		//this.scrollLockTest();
	}


	// ------------------------------------------------------------------------- TEMP TESTS

	// TODO : Remove those tests on your app

	protected easeTest ()
	{
		let $div = $('<div/>').css({
			width: 10,
			height: 10,
			background: 'red'
		});

		$('html').append($div).on('click', () =>
		{
			TweenLite.to($div, 1, {
				x: MathUtils.randomRange(0, 500),
				y: MathUtils.randomRange(0, 500),
				width: MathUtils.randomRange(10, 50),
				height: MathUtils.randomRange(10, 50),
				ease: EaseUtils.mainEase
			});
		});

	}

	protected responsiveManagerTest ()
	{
		ResponsiveManager.instance.onHorizontalBreakpointChanged.add( (pNewBreakpoint:IBreakpoint, pOldBreakpoint:IBreakpoint) =>
		{
			console.log('width', ResponsiveManager.instance.currentWindowWidth);
			console.log('horizontal', EBreakpointName[pNewBreakpoint.name]);

			let res1 = ResponsiveManager.instance.isLessThan(
				EBreakpointName.TABLET
			);

			console.log('Is less than tablet (768) -> ', res1 );

			let res2 = ResponsiveManager.instance.isMoreThan(
				EBreakpointName.TABLET
			);

			console.log('Is more or equal to tablet (768) -> ', res2 );
		});
		ResponsiveManager.instance.onHorizontalBreakpointChanged.dispatch(
			ResponsiveManager.instance.currentHorizontalBreakpoint,
			null
		);
		ResponsiveManager.instance.onVerticalBreakpointChanged.add( (pNewBreakpoint:IBreakpoint, pOldBreakpoint:IBreakpoint) =>
		{
			//console.log('vertical', EBreakpointName[pNewBreakpoint.name]);

			//console.log('NEW VERTICAL BREAKPOINT', pNewBreakpoint);
		});

		ResponsiveManager.instance.onAspectRatioChanged.add( (pNewOrientation:EAspectRatio) =>
		{
			console.log('NEW ASPECT RATIO', EAspectRatio[pNewOrientation]);
		});

		ResponsiveManager.instance.onWindowSizeChanged.add( (pNewWidth:number, pNewHeight:number) =>
		{
			//console.log('NEW SIZE', pNewWidth, pNewHeight);
		});
	}

	protected scrollLockTest ()
	{
		for (let i = 0; i < 100; i ++)
		{
			this._parameters.root.append($('<div></div>').text('test scroll' + Math.random()));
		}

		$(document).one('click', () =>
		{
			console.info('Adding two scroll lock');

			ScrollLocker.instance.addLock();
			ScrollLocker.instance.addLock();

			$(document).on('click', () =>
			{
				console.info('Removing one scroll lock');
				ScrollLocker.instance.removeLock();
			});
		});
	}

	protected bitmapUtilsTest ()
	{
		let text = BitmapUtils.generateMultilineText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam pharetra lacus vel lorem pulvinar, eget luctus quam convallis. ', 300, 10);

		this._parameters.root.append(text);
	}
}