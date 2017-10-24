

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as THREE from 'three';

import {StringUtils} from "../../lib/solidify/utils/StringUtils";


export class Main
{
	constructor ()
	{
		console.log('TEST ! ');

		console.log(ReactDOM.findDOMNode);

		let slugified = StringUtils.slugify('héhé !');

		console.log( slugified );

		let renderer = new THREE.WebGLRenderer();

		console.log( renderer );
	}
}