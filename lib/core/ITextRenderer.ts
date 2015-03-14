/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import Point = flash.geom.Point;

	/**
	 * Interface that handles common capabilities of rendering text.
	 *
	 * @see ../../../help/text-renderers Introduction to Feathers text renderers
	 */
	export interface ITextRenderer extends IFeathersControl, ITextBaselineControl
	{
		/**
		 * The text to render.
		 */
		text:string;

		/**
		 * @private
		 */
		/*function set text(value:String):void;*/

		/**
		 * Determines if the text wraps to the next line when it reaches the
		 * width of the component.
		 */
		wordWrap:boolean;

		/**
		 * @private
		 */
		/*function set wordWrap(value:Boolean):void;*/

		/**
		 * Measures the text's bounds (without a full validation, if
		 * possible).
		 */
		 measureText(result:Point = null):Point;
	}
}
