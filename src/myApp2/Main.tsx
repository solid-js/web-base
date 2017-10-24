

import * as React from 'react';
import * as ReactDOM from 'react-dom';


import {RandomComponent} from "../common/components/randomComponent/RandomComponent";
import {MyApp1Component} from "../myApp1/components/myApp1Component/MyApp1Component";

export class Main
{
	constructor ()
	{
		ReactDOM.render(
			<RandomComponent />,
			$('.AppContainer')[0]
		);

		let test = new MyApp1Component();
	}
}