/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	/**
	 * A UI control with text that has a baseline.
	 */
	export interface ITextBaselineControl extends IFeathersControl
	{
		/**
		 * Returns the text baseline measurement, in pixels.
		 */
		baseline:number;
	}
}
