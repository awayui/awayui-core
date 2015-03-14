/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.supportClasses
{
	import DisplayObject = starling.display.DisplayObject;

	/**
	 * @private
	 * A simple interface for screen navigator items to be used by
	 * <code>BaseScreenNavigator</code>.
	 *
	 * @see BaseScreenNavigator
	 */
	export interface IScreenNavigatorItem
	{
		/**
		 * Determines if a display object returned by <code>getScreen()</code>
		 * can be disposed or not when a screen is no longer active.
		 *
		 * @see #getScreen()
		 */
		canDispose:boolean;

		/**
		 * Returns a display object instance of this screen.
		 */
		 getScreen():DisplayObject;
	}
}
