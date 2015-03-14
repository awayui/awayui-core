/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.layout
{
	/**
	 * Used by layout algorithms for determining the bounds in which to position
	 * and size items.
	 */
	export class ViewPortBounds
	{
		/**
		 * Constructor.
		 */
		constructor()
		{

		}

		/**
		 * The x position of the view port, in pixels.
		 */
		public x:number = 0;

		/**
		 * The y position of the view port, in pixels.
		 */
		public y:number = 0;

		/**
		 * The horizontal scroll position of the view port, in pixels.
		 */
		public scrollX:number = 0;

		/**
		 * The vertical scroll position of the view port, in pixels.
		 */
		public scrollY:number = 0;

		/**
		 * The explicit width of the view port, in pixels. If <code>NaN</code>,
		 * there is no explicit width value.
		 */
		public explicitWidth:number = NaN;

		/**
		 * The explicit height of the view port, in pixels. If <code>NaN</code>,
		 * there is no explicit height value.
		 */
		public explicitHeight:number = NaN;

		/**
		 * The minimum width of the view port, in pixels. Should be 0 or
		 * a positive number less than infinity.
		 */
		public minWidth:number = 0;

		/**
		 * The minimum width of the view port, in pixels. Should be 0 or
		 * a positive number less than infinity.
		 */
		public minHeight:number = 0;

		/**
		 * The maximum width of the view port, in pixels. Should be 0 or
		 * a positive number, including infinity.
		 */
		public maxWidth:number = Number.POSITIVE_INFINITY;

		/**
		 * The maximum height of the view port, in pixels. Should be 0 or
		 * a positive number, including infinity.
		 */
		public maxHeight:number = Number.POSITIVE_INFINITY;
	}
}
