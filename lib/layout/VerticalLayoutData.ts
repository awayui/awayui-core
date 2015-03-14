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
	 * Extra, optional data used by an <code>VerticalLayout</code> instance to
	 * position and size a display object.
	 *
	 * @see VerticalLayout
	 * @see ILayoutDisplayObject
	 */
	export class VerticalLayoutData extends EventDispatcher implements ILayoutData
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
		 * width.
		 *
		 * <p>If the value is <code>NaN</code>, this property is ignored.</p>
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
		 * height. The container will calculate the sum of all of its children
		 * with explicit pixel heights, and then the remaining space will be
		 * distributed to children with percent heights.
		 *
		 * <p>The <code>percentHeight</code> property is ignored when its value
		 * is <code>NaN</code> or when the <code>useVirtualLayout</code>
		 * property of the <code>VerticalLayout</code> is set to
		 * <code>false</code>.</p>
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
