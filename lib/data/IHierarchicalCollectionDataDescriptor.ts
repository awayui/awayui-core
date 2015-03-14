/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.data
{
	/**
	 * An adapter interface to support any kind of data source in
	 * hierarchical collections.
	 *
	 * @see HierarchicalCollection
	 */
	export interface IHierarchicalCollectionDataDescriptor
	{
		/**
		 * Determines if a node from the data source is a branch.
		 */
		 isBranch(node:Object):Boolean;

		/**
		 * The number of items at the specified location in the data source.
		 *
		 * <p>The rest arguments are the indices that make up the location. If
		 * a location is omitted, the length returned will be for the root level
		 * of the collection.</p>
		 */
		 getLength(data:Object, rest:Array):int;

		/**
		 * Returns the item at the specified location in the data source.
		 *
		 * <p>The rest arguments are the indices that make up the location.</p>
		 */
		 getItemAt(data:Object, index:int, rest:Array):Object;

		/**
		 * Replaces the item at the specified location with a new item.
		 *
		 * <p>The rest arguments are the indices that make up the location.</p>
		 */
		 setItemAt(data:Object, item:Object, index:int, rest:Array):void;

		/**
		 * Adds an item to the data source, at the specified location.
		 *
		 * <p>The rest arguments are the indices that make up the location.</p>
		 */
		 addItemAt(data:Object, item:Object, index:int, rest:Array):void;

		/**
		 * Removes the item at the specified location from the data source and
		 * returns it.
		 *
		 * <p>The rest arguments are the indices that make up the location.</p>
		 */
		 removeItemAt(data:Object, index:int, rest:Array):Object;

		/**
		 * Removes all items from the data source.
		 */
		 removeAll(data:Object):void;

		/**
		 * Determines which location the item appears at within the data source.
		 * If the item isn't in the data source, returns an empty <code>Vector.&lt;int&gt;</code>.
		 *
		 * <p>The <code>rest</code> arguments are optional indices to narrow
		 * the search.</p>
		 */
		 getItemLocation(data:Object, item:Object, result:Vector.<int> = null, rest:Array):Vector.<int>;
	}
}
