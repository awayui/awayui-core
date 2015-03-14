/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.display
{
	/**
	 * Calculates a scale value to maintain aspect ratio and fill the required
	 * bounds (with the possibility of cutting of the edges a bit).
	 */
	export function calculateScaleRatioToFill(originalWidth:number, originalHeight:number, targetWidth:number, targetHeight:number):number
	{
		var widthRatio:number = targetWidth / originalWidth;
		var heightRatio:number = targetHeight / originalHeight;
		if(widthRatio > heightRatio)
		{
			return widthRatio;
		}
		return heightRatio;
	}
}