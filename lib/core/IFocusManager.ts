/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;

	/**
	 * Interface for focus management.
	 *
	 * @see feathers.core.IFocusDisplayObject
	 * @see feathers.core.FocusManager
	 */
	export interface IFocusManager
	{
		/**
		 * Determines if this focus manager is enabled. A focus manager may be
		 * disabled when another focus manager has control, such as when a
		 * modal pop-up is displayed.
		 */
		isEnabled:boolean;

		/**
		 * @private
		 */
		/*function set isEnabled(value:Boolean):void;*/

		/**
		 * The object that currently has focus. May return <code>null</code> if
		 * no object has focus.
		 *
		 * <p>In the following example, the focus is changed:</p>
		 *
		 * <listing version="3.0">
		 * focusManager.focus = someObject;</listing>
		 */
		focus:IFocusDisplayObject;

		/**
		 * @private
		 */
		/*function set focus(value:IFocusDisplayObject):void;*/

		/**
		 * The top-level container of the focus manager. This isn't necessarily
		 * the root of the display list.
		 */
		root:DisplayObjectContainer;
	}
}
