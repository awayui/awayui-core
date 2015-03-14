/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.layout
{
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;

	/**
	 * @inheritDoc
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/**
	 * Extra, optional data used by an <code>HorizontalLayout</code> instance to
	 * position and size a display object.
	 *
	 * @see HorizontalLayout
	 * @see ILayoutDisplayObject
	 */
	export class HorizontalLayoutData extends EventDispatcher implements ILayoutData
	{
		/**
		 * Constructor.
		 */
		constructor(percentWidth:number = NaN, percentHeight:number = NaN)
		{
			this._percentWidth = percentWidth;
			this._percentHeight = percentHeight;
		}

		/**
		 * @private
		 */
		protected _percentWidth:number;

		/**
		 * The width of the layout object, as a percentage of the container's
		 * width. The container will calculate the sum of all of its children
		 * with explicit pixel widths, and then the remaining space will be
		 * distributed to children with percent widths.
		 *
		 * <p>The <code>percentWidth</code> property is ignored when its value
		 * is <code>NaN</code> or when the <code>useVirtualLayout</code>
		 * property of the <code>HorizontalLayout</code> is set to
		 * <code>false</code>.</p>
		 *
		 * @default NaN
		 */
		public get percentWidth():number
		{
			return this._percentWidth;
		}

		/**
		 * @private
		 */
		public set percentWidth(value:number)
		{
			if(this._percentWidth == value)
			{
				return;
			}
			this._percentWidth = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _percentHeight:number;


		/**
		 * The height of the layout object, as a percentage of the container's
		 * height.
		 *
		 * <p>If the value is <code>NaN</code>, this property is ignored.</p>
		 *
		 * @default NaN
		 */
		public get percentHeight():number
		{
			return this._percentHeight;
		}

		/**
		 * @private
		 */
		public set percentHeight(value:number)
		{
			if(this._percentHeight == value)
			{
				return;
			}
			this._percentHeight = value;
			this.dispatchEventWith(Event.CHANGE);
		}
	}
}
