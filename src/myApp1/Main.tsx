

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as THREE from 'three';


//import {StringUtils} from 'solidify-lib/utils/StringUtils';
//import {StringUtils} from '../../node_modules/solidify-lib/utils/StringUtils';

declare const __atoms:{[index:string]:string};


export class Main
{
	constructor ()
	{
		console.log('TEST ! ');

		console.log(ReactDOM.findDOMNode);

		let slugified = StringUtils.slugify('héhé !');

		//ModuleUtils

		//ModuleUtils.dynamicNew();

		console.log( slugified );

		let renderer = new THREE.WebGLRenderer();

		console.log( renderer );

		console.log( __atoms );
	}
}