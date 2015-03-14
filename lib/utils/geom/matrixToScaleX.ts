/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.geom
{
	import Matrix = flash.geom.Matrix;

	/**
	 * Extracts the x scale value from a <code>flash.geom.Matrix</code>
	 *
	 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Matrix.html flash.geom.Matrix
	 */
	export function matrixToScaleX(matrix:Matrix):number
	{
		var a:number = matrix.a;
		var b:number = matrix.b;
		return Math.sqrt(a * a + b * b);
	}
}
