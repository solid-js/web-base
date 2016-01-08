//import React = __React;
//import ReactDom = __React.__DOM;

import {React, ReactDom, ReactView} from "lib/solidify/core/ReactView";

interface Props extends __React.Props<any>
{
	name:string;
	time:number;
}

interface States
{
	time:number;
}


export class TestComponent extends ReactView<Props, States>
{
	initState ()
	{
		return {
			time: this.props.time
		};
	}

	render ()
	{
		console.log('RENDER');
		return <span className="TestComponent">{this.props.name} is {this.state.time}</span>;
	}

	componentDidMount ()
	{
		console.log('MOUNT');

		this.state = {
			time: this.props.time
		};
		this.count();
	}

	componentWillUnmount ()
	{
		console.log('UNMOUNT');


	}

	count ()
	{
		this.setState({
			time: this.state.time + 1
		});
		TweenLite.delayedCall(1, this.count, [], this);
	}
}