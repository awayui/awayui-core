/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IFeathersControl = feathers.core.IFeathersControl;

	/**
	 * A screen to display in a screen navigator.
	 *
	 * @see feathers.controls.StackScreenNavigator
	 * @see feathers.controls.ScreenNavigator
	 */
	export interface IScreen extends IFeathersControl
	{
		/**
		 * The identifier for the screen. This value is passed in by the
		 * <code>ScreenNavigator</code> when the screen is instantiated.
		 */
		screenID:string;

		/**
		 * @private
		 */
		/*function set screenID(value:String):void;*/

		/**
		 * The screen navigator that is currently displaying this screen.
		 */
		owner:Object;

		/**
		 * @private
		 */
		/*function set owner(value:Object):void;*/
	}
}
