import {Signal} from 'lib/solidify/helpers/Signal';
import {DependencyManager, IModulePathStorage} from "../../lib/solidify/helpers/DependencyManager";

import {TestComponent} from "./components/testComponent/TestComponent";

import React = __React;
import ReactDom = __React.__DOM;

export class Main
{
	constructor ()
	{
		console.log('OK module 1');

		//this.testDependency();

		this.testDependecyInjection();

		this.testSignal();
	}

	private testDependency ()
	{
		console.log('test');

		//var testComponent = new TestComponent();

		//console.log(testComponent);
	}

	private testDependecyInjection ()
	{
		var dependencyManager = new DependencyManager();

		dependencyManager.registerModulePath('component', 'src/myModule1/components/');

		console.log('>', dependencyManager.getFlatModulesPath());

		dependencyManager.updateModuleCache(() =>
		{
			/*
			var myComponent:TestComponent = dependencyManager.requireModule('TestComponent', 'component', []);

			console.log('>', myComponent);

			myComponent.props = {
				foo: 'ouep',
				test: 5
			};

			myComponent.start();
			*/

			ReactDom.render(<TestComponent name='lol' time={10} />, $('#appContainer')[0]);
		});
	}

	private testSignal ():void
	{
		var signal = new Signal();

		signal.add(this, this.testSignalListening);

		signal.dispatch('test');
	}

	private testSignalListening (...rest)
	{
		console.warn('TEST SIGNAL', rest);
	}
}