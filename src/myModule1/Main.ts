import {Signal} from 'lib/solidify/helpers/Signal';

export default class Main
{
	constructor ()
	{
		console.log('OK module 1');

		var signal = new Signal();

		signal.add(this, this.testSignal);

		signal.dispatch('test');
	}

	private testSignal (...rest):void
	{
		console.warn('TEST SIGNAL', rest);
	}
}