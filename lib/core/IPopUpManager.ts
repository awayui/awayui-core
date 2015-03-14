/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import DisplayObject = starling.display.DisplayObject;
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;

	/**
	 * Interface for pop-up management.
	 *
	 * @see feathers.core.PopUpManager
	 */
	export interface IPopUpManager
	{
		/**
		 * @copy PopUpManager#overlayFactory
		 */
		overlayFactory:Function;

		/**
		 * @private
		 */
		/*function set overlayFactory(value:Function):void;*/

		/**
		 * @copy PopUpManager#root
		 */
		root:DisplayObjectContainer;

		/**
		 * @private
		 */
		/*function set root(value:DisplayObjectContainer):void;*/

		/**
		 * @copy PopUpManager#addPopUp()
		 */
		 addPopUp(popUp:DisplayObject, isModal:Boolean = true, isCentered:Boolean = true, customOverlayFactory:Function = null):DisplayObject;

		/**
		 * @copy PopUpManager#removePopUp()
		 */
		 removePopUp(popUp:DisplayObject, dispose:Boolean = false):DisplayObject;

		/**
		 * @copy PopUpManager#isPopUp()
		 */
		 isPopUp(popUp:DisplayObject):Boolean;

		/**
		 * @copy PopUpManager#isTopLevelPopUp()
		 */
		 isTopLevelPopUp(popUp:DisplayObject):Boolean;

		/**
		 * @copy PopUpManager#centerPopUp()
		 */
		 centerPopUp(popUp:DisplayObject):void;
	}
}
