/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.events
{
	/**
	 * Event <code>type</code> constants for collections. This class is
	 * not a subclass of <code>starling.events.Event</code> because these
	 * constants are meant to be used with <code>dispatchEventWith()</code> and
	 * take advantage of the Starling's event object pooling. The object passed
	 * to an event listener will be of type <code>starling.events.Event</code>.
	 */
	export class CollectionEventType
	{
		/**
		 * Dispatched when the data provider's source is completely replaced.
		 */
		public static RESET:string = "reset";

		/**
		 * Dispatched when an item is added to the collection.
		 */
		public static ADD_ITEM:string = "addItem";

		/**
		 * Dispatched when an item is removed from the collection.
		 */
		public static REMOVE_ITEM:string = "removeItem";

		/**
		 * Dispatched when an item is replaced in the collection with a
		 * different item.
		 */
		public static REPLACE_ITEM:string = "replaceItem";

		/**
		 * Dispatched when an item in the collection has changed.
		 */
		public static UPDATE_ITEM:string = "updateItem";
	}
}
