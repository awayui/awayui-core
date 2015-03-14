/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IFeathersControl = feathers.core.IFeathersControl;

	import DisplayObject = starling.display.DisplayObject;

	/**
	 * Defines functions for a <code>Scroller</code> subclass that delegates
	 * display list manipulations to its <code>IViewPort</code>.
	 *
	 * <p>Mainly intended for <code>ScrollContainer</code>, but other subclasses
	 * of <code>Scroller</code> could possibly implement it too.</p>
	 *
	 * @see feathers.controls.Scroller
	 * @see feathers.controls.ScrollContainer
	 */
	export interface IScrollContainer extends IFeathersControl
	{
		/**
		 * Returns the number of raw children that are added directly to the
		 * <code>Scroller</code> rather than delegating the call to the view
		 * port.
		 */
		numRawChildren:number;

		/**
		 * Gets the name of a direct child of the <code>Scroller</code> rather
		 * than delegating the call to the view port.
		 */
		 getRawChildByName(name:String):DisplayObject;

		/**
		 * Gets the index of a direct child of the <code>Scroller</code> rather
		 * than delegating the call to the view port.
		 */
		 getRawChildIndex(child:DisplayObject):int;

		/**
		 * Sets the index of a direct child of the <code>Scroller</code> rather
		 * than delegating the call to the view port.
		 */
		 setRawChildIndex(child:DisplayObject, index:int):void;

		/**
		 * Adds a child to the <code>Scroller</code> rather than delegating the
		 * call to the view port.
		 */
		 addRawChild(child:DisplayObject):DisplayObject;

		/**
		 * Adds a child to the <code>Scroller</code> at a specific index rather
		 * than delegating the call to the view port.
		 */
		 addRawChildAt(child:DisplayObject, index:int):DisplayObject;

		/**
		 * Removes a child from the <code>Scroller</code> rather than delegating
		 * the call to the view port.
		 */
		 removeRawChild(child:DisplayObject, dispose:Boolean = false):DisplayObject;

		/**
		 * Removes a child from the <code>Scroller</code> at a specific index
		 * rather than delegating the call to the view port.
		 */
		 removeRawChildAt(index:int, dispose:Boolean = false):DisplayObject;

		/**
		 * Swaps the children of the <code>Scroller</code> rather than
		 * delegating the call to the view port.
		 */
		 swapRawChildren(child1:DisplayObject, child2:DisplayObject):void;

		/**
		 * Swaps the children of the <code>Scroller</code> rather than
		 * delegating the call to the view port.
		 */
		 swapRawChildrenAt(index1:int, index2:int):void;

		/**
		 * Sorts the children of the <code>Scroller</code> rather than
		 * delegating the call to the view port.
		 */
		 sortRawChildren(compareFunction:Function):void;
	}
}
