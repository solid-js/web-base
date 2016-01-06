import {Signal} from 'lib/solidify/helpers/Signal';
import {TestComponent} from './components/testComponent/TestComponent';

export class Main
{
	constructor ()
	{
		console.log('OK module 1');

		this.testDependency();

		this.testSignal();
	}

	private testDependency ()
	{
		console.log('test');

		var testComponent = new TestComponent();

		console.log(testComponent);
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