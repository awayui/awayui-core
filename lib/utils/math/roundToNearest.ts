/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.math
{
	/**
	 * Rounds a Number to the nearest multiple of an input. For example, by rounding
	 * 16 to the nearest 10, you will receive 20. Similar to the built-in function Math.round().
	 * 
	 * @param	numberToRound		the number to round
	 * @param	nearest				the number whose mutiple must be found
	 * @return	the rounded number
	 * 
	 * @see Math#round
	 */
	export function roundToNearest(number:number, nearest:number = 1):number
	{
		if(nearest == 0)
		{
			return number;
		}
		var roundedNumber:number = Math.round(roundToPrecision(number / nearest, 10)) * nearest;
		return roundToPrecision(roundedNumber, 10);
	}
}