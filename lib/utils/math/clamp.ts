/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.math
{
	
	/**
	 * Forces a numeric value into a specified range.
	 * 
	 * @param value		The value to force into the range.
	 * @param minimum	The minimum bound of the range.
	 * @param maximum	The maximum bound of the range.
	 * @return			A value within the specified range.
	 * 
	 * @author Josh Tynjala (joshblog.net)
	 */
	export function clamp(value:number, minimum:number, maximum:number):number
	{
		if(minimum > maximum)
		{
			throw new ArgumentError("minimum should be smaller than maximum.");
		}
		if(value < minimum)
		{
			value = minimum;
		}
		else if(value > maximum)
		{
			value = maximum;
		}
		return value;
	}
}