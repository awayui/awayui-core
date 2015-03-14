/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	/**
	 * A scroll bar that supports both horizontal or vertical orientations. The
	 * <code>feathers.controls.Scroller</code> class (and all subclasses) will
	 * automatically set the <code>direction</code> property when an
	 * <code>IDirectionalScrollBar</code> is returned by its scroll bar
	 * factories.
	 */
	export interface IDirectionalScrollBar extends IScrollBar
	{
		/**
		 * The direction of the scroll bar, either horizontal or vertical.
		 *
		 * @see feathers.controls.SimpleScrollBar#DIRECTION_HORIZONTAL
		 * @see feathers.controls.SimpleScrollBar#DIRECTION_VERTICAL
		 */
		direction:string;

		/**
		 * @private
		 */
		/*function set direction(value:String):void;*/
	}
}
