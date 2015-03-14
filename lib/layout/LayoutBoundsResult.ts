/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.layout
{
	/**
	 * Calculated bounds for layout.
	 */
	export class LayoutBoundsResult
	{
		/**
		 * Constructor.
		 */
		constructor()
		{

		}

		/**
		 * The starting position of the view port's content on the x axis.
		 * Usually, this value is <code>0</code>, but it may be negative.
		 * negative.
		 */
		public contentX:number = 0;

		/**
		 * The starting position of the view port's content on the y axis.
		 * Usually, this value is <code>0</code>, but it may be negative.
		 */
		public contentY:number = 0;

		/**
		 * The visible width of the view port. The view port's content may be
		 * clipped.
		 */
		public viewPortWidth:number;

		/**
		 * The visible height of the view port. The view port's content may be
		 * clipped.
		 */
		public viewPortHeight:number;

		/**
		 * The width of the content. May be larger or smaller than the view
		 * port.
		 */
		public contentWidth:number;

		/**
		 * The height of the content. May be larger or smaller than the view
		 * port.
		 */
		public contentHeight:number;
	}
}
