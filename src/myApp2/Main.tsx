

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TweenLite = gsap.TweenLite;
import Power4 = gsap.Power4;

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

		let jquery:JQuery = $('.test');

		let test = new MyApp1Component();

		let point = new PIXI.Point(10, 20);

		TweenLite.to(point, .3, {
			x: 0,
			y: 30,
			ease: Power4.easeOut,
			onUpdate: () => {
				console.log(point);
			}
		});

	}
}