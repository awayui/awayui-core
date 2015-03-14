/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.math
{
	/**
	 * Rounds a number to a certain level of precision. Useful for limiting the number of
	 * decimal places on a fractional number.
	 * 
	 * @param		number		the input number to round.
	 * @param		precision	the number of decimal digits to keep
	 * @return		the rounded number, or the original input if no rounding is needed
	 * 
	 * @see Math#round
	 */
	export function roundToPrecision(number:number, precision:number = 0):number
	{
		var decimalPlaces:number = Math.pow(10, precision);
		return Math.round(decimalPlaces * number) / decimalPlaces;
	}
}