



export interface IRoute
{
	url			:string;
	handler		:(pParams:any[]) => void;
	page		:string;
	container	:string;
}

export interface IParams
{
	[index:string] : string|number;
}



export class Router
{
	static __INSTANCE:Router;

	get instance ():Router
	{
		if (Router.__INSTANCE == null)
		{
			throw new Error('Router.instance // Please create router in app Main file before using it.');
		}
		return Router.__INSTANCE;
	}


	protected _base				:string;

	protected _routes			:IRoute[] 			= [];


	constructor (pBase:string, pRoutes:IRoute[])
	{
		this._base = pBase;

		this.addRoutes(pRoutes);

		window.addEventListener('popstate', this.popStateHandler );
	}



	addRoutes (pRoutes:IRoute[])
	{
		pRoutes.map((route:IRoute) =>
		{
			this._routes.push( route );
		});
	}




	popStateHandler = (pEvent:Event) =>
	{
		console.log('POP STATE', pEvent, this);
	};


	updateCurrentRoute ()
	{

	}



	open (pURL:string)
	open (pPage:string, pParams:IParams)
	{

	}


	protected _isStarted = false;

	start ()
	{
		this._isStarted = true;
		this.updateCurrentRoute();
	}
}