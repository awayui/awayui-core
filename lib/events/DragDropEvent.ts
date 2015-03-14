/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.events
{
	import DragData = feathers.dragDrop.DragData;

	import Event = starling.events.Event;

	/**
	 * Events used by the <code>DragDropManager</code>.
	 *
	 * @see feathers.dragDrop.DragDropManager
	 */
	export class DragDropEvent extends Event
	{
		/**
		 * Dispatched by the <code>IDragSource</code> when a drag starts.
		 *
		 * @see feathers.dragDrop.IDragSource
		 */
		public static DRAG_START:string = "dragStart";

		/**
		 * Dispatched by the <code>IDragSource</code> when a drag completes.
		 * This is always dispatched, even when there wasn't a successful drop.
		 * See the <code>isDropped</code> property to determine if the drop
		 * was successful.
		 *
		 * @see feathers.dragDrop.IDragSource
		 */
		public static DRAG_COMPLETE:string = "dragComplete";

		/**
		 * Dispatched by a <code>IDropTarget</code> when a drag enters its
		 * bounds.
		 *
		 * @see feathers.dragDrop.IDropTarget
		 */
		public static DRAG_ENTER:string = "dragEnter";

		/**
		 * Dispatched by a <code>IDropTarget</code> when a drag moves to a new
		 * location within its bounds.
		 *
		 * @see feathers.dragDrop.IDropTarget
		 */
		public static DRAG_MOVE:string = "dragMove";

		/**
		 * Dispatched by a <code>IDropTarget</code> when a drag exits its
		 * bounds.
		 *
		 * @see feathers.dragDrop.IDropTarget
		 */
		public static DRAG_EXIT:string = "dragExit";

		/**
		 * Dispatched by a <code>IDropTarget</code> when a drop occurs.
		 *
		 * @see feathers.dragDrop.IDropTarget
		 */
		public static DRAG_DROP:string = "dragDrop";

		/**
		 * Constructor.
		 */
		constructor(type:string, dragData:DragData, isDropped:boolean, localX:number = NaN, localY:number = NaN)
		{
			super(type, false, dragData);
			this.isDropped = isDropped;
			this.localX = localX;
			this.localY = localY;
		}

		/**
		 * The <code>DragData</code> associated with the current drag.
		 */
		public get dragData():DragData
		{
			return DragData(this.data);
		}

		/**
		 * Determines if there has been a drop.
		 */
		public isDropped:boolean;

		/**
		 * The x location, in pixels, of the current action, in the local
		 * coordinate system of the <code>IDropTarget</code>.
		 *
		 * @see feathers.dragDrop.IDropTarget
		 */
		public localX:number;

		/**
		 * The y location, in pixels, of the current action, in the local
		 * coordinate system of the <code>IDropTarget</code>.
		 *
		 * @see feathers.dragDrop.IDropTarget
		 */
		public localY:number;
	}
}
