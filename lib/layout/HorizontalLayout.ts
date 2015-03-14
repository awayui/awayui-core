/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.layout
{
	import IFeathersControl = feathers.core.IFeathersControl;
	import IValidating = feathers.core.IValidating;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import Point = flash.geom.Point;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;

	/**
	 * Dispatched when a property of the layout changes, indicating that a
	 * redraw is probably needed.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType starling.events.Event.CHANGE
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/**
	 * Dispatched when the layout would like to adjust the container's scroll
	 * position. Typically, this is used when the virtual dimensions of an item
	 * differ from its real dimensions. This event allows the container to
	 * adjust scrolling so that it appears smooth, without jarring jumps or
	 * shifts when an item resizes.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>A <code>flash.geom.Point</code> object
	 *   representing how much the scroll position should be adjusted in both
	 *   horizontal and vertical directions. Measured in pixels.</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType starling.events.Event.SCROLL
	 */
	/*[Event(name="scroll",type="starling.events.Event")]*/

	/**
	 * Positions items from left to right in a single row.
	 *
	 * @see ../../../help/horizontal-layout.html How to use HorizontalLayout with Feathers containers
	 */
	export class HorizontalLayout extends EventDispatcher implements IVariableVirtualLayout, ITrimmedVirtualLayout
	{
		/**
		 * The items will be aligned to the top of the bounds.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * The items will be aligned to the middle of the bounds.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * The items will be aligned to the bottom of the bounds.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * The items will fill the height of the bounds.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * If the total item width is smaller than the width of the bounds, the
		 * items will be aligned to the left.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * If the total item width is smaller than the width of the bounds, the
		 * items will be aligned to the center.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * If the total item width is smaller than the width of the bounds, the
		 * items will be aligned to the right.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_RIGHT:string = "right";

		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * @private
		 */
		protected _widthCache:any[] = [];

		/**
		 * @private
		 */
		protected _discoveredItemsCache:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected _gap:number = 0;

		/**
		 * The space, in pixels, between items.
		 *
		 * @default 0
		 */
		public get gap():number
		{
			return this._gap;
		}

		/**
		 * @private
		 */
		public set gap(value:number)
		{
			if(this._gap == value)
			{
				return;
			}
			this._gap = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _firstGap:number = NaN;

		/**
		 * The space, in pixels, between the first and second items. If the
		 * value of <code>firstGap</code> is <code>NaN</code>, the value of the
		 * <code>gap</code> property will be used instead.
		 *
		 * @default NaN
		 */
		public get firstGap():number
		{
			return this._firstGap;
		}

		/**
		 * @private
		 */
		public set firstGap(value:number)
		{
			if(this._firstGap == value)
			{
				return;
			}
			this._firstGap = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _lastGap:number = NaN;

		/**
		 * The space, in pixels, between the last and second to last items. If
		 * the value of <code>lastGap</code> is <code>NaN</code>, the value of
		 * the <code>gap</code> property will be used instead.
		 *
		 * @default NaN
		 */
		public get lastGap():number
		{
			return this._lastGap;
		}

		/**
		 * @private
		 */
		public set lastGap(value:number)
		{
			if(this._lastGap == value)
			{
				return;
			}
			this._lastGap = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * @default 0
		 *
		 * @see #paddingTop
		 * @see #paddingRight
		 * @see #paddingBottom
		 * @see #paddingLeft
		 */
		public get padding():number
		{
			return this._paddingTop;
		}

		/**
		 * @private
		 */
		public set padding(value:number)
		{
			this.paddingTop = value;
			this.paddingRight = value;
			this.paddingBottom = value;
			this.paddingLeft = value;
		}

		/**
		 * @private
		 */
		protected _paddingTop:number = 0;

		/**
		 * The minimum space, in pixels, above the items.
		 *
		 * @default 0
		 */
		public get paddingTop():number
		{
			return this._paddingTop;
		}

		/**
		 * @private
		 */
		public set paddingTop(value:number)
		{
			if(this._paddingTop == value)
			{
				return;
			}
			this._paddingTop = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _paddingRight:number = 0;

		/**
		 * The space, in pixels, that appears to the right, after the last item.
		 *
		 * @default 0
		 */
		public get paddingRight():number
		{
			return this._paddingRight;
		}

		/**
		 * @private
		 */
		public set paddingRight(value:number)
		{
			if(this._paddingRight == value)
			{
				return;
			}
			this._paddingRight = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _paddingBottom:number = 0;

		/**
		 * The minimum space, in pixels, above the items.
		 *
		 * @default 0
		 */
		public get paddingBottom():number
		{
			return this._paddingBottom;
		}

		/**
		 * @private
		 */
		public set paddingBottom(value:number)
		{
			if(this._paddingBottom == value)
			{
				return;
			}
			this._paddingBottom = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _paddingLeft:number = 0;

		/**
		 * The space, in pixels, that appears to the left, before the first
		 * item.
		 *
		 * @default 0
		 */
		public get paddingLeft():number
		{
			return this._paddingLeft;
		}

		/**
		 * @private
		 */
		public set paddingLeft(value:number)
		{
			if(this._paddingLeft == value)
			{
				return;
			}
			this._paddingLeft = value;
			this.dispatchEventWith(Event.CHANGE);
		}


		/**
		 * @private
		 */
		protected _verticalAlign:string = HorizontalLayout.VERTICAL_ALIGN_TOP;

		/*[Inspectable(type="String",enumeration="top,middle,bottom,justify")]*/
		/**
		 * The alignment of the items vertically, on the y-axis.
		 *
		 * <p>If the <code>verticalAlign</code> property is set to
		 * <code>HorizontalLayout.VERTICAL_ALIGN_JUSTIFY</code>, the
		 * <code>height</code>, <code>minHeight</code>, and
		 * <code>maxHeight</code> properties of the items may be changed, and
		 * their original values ignored by the layout. In this situation, if
		 * the height needs to be constrained, the <code>height</code>,
		 * <code>minHeight</code>, or <code>maxHeight</code> properties should
		 * instead be set on the parent container that is using this layout.</p>
		 *
		 * @default HorizontalLayout.VERTICAL_ALIGN_TOP
		 *
		 * @see #VERTICAL_ALIGN_TOP
		 * @see #VERTICAL_ALIGN_MIDDLE
		 * @see #VERTICAL_ALIGN_BOTTOM
		 * @see #VERTICAL_ALIGN_JUSTIFY
		 */
		public get verticalAlign():string
		{
			return this._verticalAlign;
		}

		/**
		 * @private
		 */
		public set verticalAlign(value:string)
		{
			if(this._verticalAlign == value)
			{
				return;
			}
			this._verticalAlign = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _horizontalAlign:string = HorizontalLayout.HORIZONTAL_ALIGN_LEFT;

		/*[Inspectable(type="String",enumeration="left,center,right")]*/
		/**
		 * If the total item width is less than the bounds, the positions of
		 * the items can be aligned horizontally.
		 *
		 * @default HorizontalLayout.HORIZONTAL_ALIGN_LEFT
		 *
		 * @see #HORIZONTAL_ALIGN_LEFT
		 * @see #HORIZONTAL_ALIGN_CENTER
		 * @see #HORIZONTAL_ALIGN_RIGHT
		 */
		public get horizontalAlign():string
		{
			return this._horizontalAlign;
		}

		/**
		 * @private
		 */
		public set horizontalAlign(value:string)
		{
			if(this._horizontalAlign == value)
			{
				return;
			}
			this._horizontalAlign = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _useVirtualLayout:boolean = true;

		/**
		 * @inheritDoc
		 *
		 * @default true
		 */
		public get useVirtualLayout():boolean
		{
			return this._useVirtualLayout;
		}

		/**
		 * @private
		 */
		public set useVirtualLayout(value:boolean)
		{
			if(this._useVirtualLayout == value)
			{
				return;
			}
			this._useVirtualLayout = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _hasVariableItemDimensions:boolean = false;

		/**
		 * When the layout is virtualized, and this value is true, the items may
		 * have variable width values. If false, the items will all share the
		 * same width value with the typical item.
		 *
		 * @default false
		 */
		public get hasVariableItemDimensions():boolean
		{
			return this._hasVariableItemDimensions;
		}

		/**
		 * @private
		 */
		public set hasVariableItemDimensions(value:boolean)
		{
			if(this._hasVariableItemDimensions == value)
			{
				return;
			}
			this._hasVariableItemDimensions = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _requestedColumnCount:number = 0;

		/**
		 * Requests that the layout set the view port dimensions to display a
		 * specific number of columns (plus gaps and padding), if possible. If
		 * the explicit width of the view port is set, then this value will be
		 * ignored. If the view port's minimum and/or maximum width are set,
		 * the actual number of visible columns may be adjusted to meet those
		 * requirements. Set this value to <code>0</code> to display as many
		 * columns as possible.
		 *
		 * @default 0
		 */
		public get requestedColumnCount():number
		{
			return this._requestedColumnCount;
		}

		/**
		 * @private
		 */
		public set requestedColumnCount(value:number)
		{
			if(value < 0)
			{
				throw RangeError("requestedColumnCount requires a value >= 0");
			}
			if(this._requestedColumnCount == value)
			{
				return;
			}
			this._requestedColumnCount = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _distributeWidths:boolean = false;

		/**
		 * Distributes the width of the view port equally to each item. If the
		 * view port width needs to be measured, the largest item's width will
		 * be used for all items, subject to any specified minimum and maximum
		 * width values.
		 *
		 * @default false
		 */
		public get distributeWidths():boolean
		{
			return this._distributeWidths;
		}

		/**
		 * @private
		 */
		public set distributeWidths(value:boolean)
		{
			if(this._distributeWidths == value)
			{
				return;
			}
			this._distributeWidths = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _manageVisibility:boolean = false;

		/**
		 * Determines if items will be set invisible if they are outside the
		 * view port. If <code>true</code>, you will not be able to manually
		 * change the <code>visible</code> property of any items in the layout.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.0. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.
		 * Originally, the <code>manageVisibility</code> property could be used
		 * to improve performance of non-virtual layouts by hiding items that
		 * were outside the view port. However, other performance improvements
		 * have made it so that setting <code>manageVisibility</code> can now
		 * sometimes hurt performance instead of improving it.</p>
		 *
		 * @default false
		 */
		public get manageVisibility():boolean
		{
			return this._manageVisibility;
		}

		/**
		 * @private
		 */
		public set manageVisibility(value:boolean)
		{
			if(this._manageVisibility == value)
			{
				return;
			}
			this._manageVisibility = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _beforeVirtualizedItemCount:number = 0;

		/**
		 * @inheritDoc
		 */
		public get beforeVirtualizedItemCount():number
		{
			return this._beforeVirtualizedItemCount;
		}

		/**
		 * @private
		 */
		public set beforeVirtualizedItemCount(value:number)
		{
			if(this._beforeVirtualizedItemCount == value)
			{
				return;
			}
			this._beforeVirtualizedItemCount = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _afterVirtualizedItemCount:number = 0;

		/**
		 * @inheritDoc
		 */
		public get afterVirtualizedItemCount():number
		{
			return this._afterVirtualizedItemCount;
		}

		/**
		 * @private
		 */
		public set afterVirtualizedItemCount(value:number)
		{
			if(this._afterVirtualizedItemCount == value)
			{
				return;
			}
			this._afterVirtualizedItemCount = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _typicalItem:DisplayObject;

		/**
		 * @inheritDoc
		 *
		 * @see #resetTypicalItemDimensionsOnMeasure
		 * @see #typicalItemWidth
		 * @see #typicalItemHeight
		 */
		public get typicalItem():DisplayObject
		{
			return this._typicalItem;
		}

		/**
		 * @private
		 */
		public set typicalItem(value:DisplayObject)
		{
			if(this._typicalItem == value)
			{
				return;
			}
			this._typicalItem = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _resetTypicalItemDimensionsOnMeasure:boolean = false;

		/**
		 * If set to <code>true</code>, the width and height of the
		 * <code>typicalItem</code> will be reset to <code>typicalItemWidth</code>
		 * and <code>typicalItemHeight</code>, respectively, whenever the
		 * typical item needs to be measured. The measured dimensions of the
		 * typical item are used to fill in the blanks of a virtualized layout
		 * for virtual items that don't have their own display objects to
		 * measure yet.
		 *
		 * @default false
		 *
		 * @see #typicalItemWidth
		 * @see #typicalItemHeight
		 * @see #typicalItem
		 */
		public get resetTypicalItemDimensionsOnMeasure():boolean
		{
			return this._resetTypicalItemDimensionsOnMeasure;
		}

		/**
		 * @private
		 */
		public set resetTypicalItemDimensionsOnMeasure(value:boolean)
		{
			if(this._resetTypicalItemDimensionsOnMeasure == value)
			{
				return;
			}
			this._resetTypicalItemDimensionsOnMeasure = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _typicalItemWidth:number = NaN;

		/**
		 * Used to reset the width, in pixels, of the <code>typicalItem</code>
		 * for measurement. The measured dimensions of the typical item are used
		 * to fill in the blanks of a virtualized layout for virtual items that
		 * don't have their own display objects to measure yet.
		 *
		 * <p>This value is only used when <code>resetTypicalItemDimensionsOnMeasure</code>
		 * is set to <code>true</code>. If <code>resetTypicalItemDimensionsOnMeasure</code>
		 * is set to <code>false</code>, this value will be ignored and the
		 * <code>typicalItem</code> dimensions will not be reset before
		 * measurement.</p>
		 *
		 * <p>If <code>typicalItemWidth</code> is set to <code>NaN</code>, the
		 * typical item will auto-size itself to its preferred width. If you
		 * pass a valid <code>Number</code> value, the typical item's width will
		 * be set to a fixed size. May be used in combination with
		 * <code>typicalItemHeight</code>.</p>
		 *
		 * @default NaN
		 *
		 * @see #resetTypicalItemDimensionsOnMeasure
		 * @see #typicalItemHeight
		 * @see #typicalItem
		 */
		public get typicalItemWidth():number
		{
			return this._typicalItemWidth;
		}

		/**
		 * @private
		 */
		public set typicalItemWidth(value:number)
		{
			if(this._typicalItemWidth == value)
			{
				return;
			}
			this._typicalItemWidth = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _typicalItemHeight:number = NaN;

		/**
		 * Used to reset the height, in pixels, of the <code>typicalItem</code>
		 * for measurement. The measured dimensions of the typical item are used
		 * to fill in the blanks of a virtualized layout for virtual items that
		 * don't have their own display objects to measure yet.
		 *
		 * <p>This value is only used when <code>resetTypicalItemDimensionsOnMeasure</code>
		 * is set to <code>true</code>. If <code>resetTypicalItemDimensionsOnMeasure</code>
		 * is set to <code>false</code>, this value will be ignored and the
		 * <code>typicalItem</code> dimensions will not be reset before
		 * measurement.</p>
		 *
		 * <p>If <code>typicalItemHeight</code> is set to <code>NaN</code>, the
		 * typical item will auto-size itself to its preferred height. If you
		 * pass a valid <code>Number</code> value, the typical item's height will
		 * be set to a fixed size. May be used in combination with
		 * <code>typicalItemWidth</code>.</p>
		 *
		 * @default NaN
		 *
		 * @see #resetTypicalItemDimensionsOnMeasure
		 * @see #typicalItemWidth
		 * @see #typicalItem
		 */
		public get typicalItemHeight():number
		{
			return this._typicalItemHeight;
		}

		/**
		 * @private
		 */
		public set typicalItemHeight(value:number)
		{
			if(this._typicalItemHeight == value)
			{
				return;
			}
			this._typicalItemHeight = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _scrollPositionHorizontalAlign:string = HorizontalLayout.HORIZONTAL_ALIGN_CENTER;

		/*[Inspectable(type="String",enumeration="left,center,right")]*/
		/**
		 * When the scroll position is calculated for an item, an attempt will
		 * be made to align the item to this position.
		 *
		 * @default HorizontalLayout.HORIZONTAL_ALIGN_CENTER
		 *
		 * @see #HORIZONTAL_ALIGN_LEFT
		 * @see #HORIZONTAL_ALIGN_CENTER
		 * @see #HORIZONTAL_ALIGN_RIGHT
		 */
		public get scrollPositionHorizontalAlign():string
		{
			return this._scrollPositionHorizontalAlign;
		}

		/**
		 * @private
		 */
		public set scrollPositionHorizontalAlign(value:string)
		{
			this._scrollPositionHorizontalAlign = value;
		}

		/**
		 * @inheritDoc
		 */
		public get requiresLayoutOnScroll():boolean
		{
			return this._useVirtualLayout || this._manageVisibility;
		}

		/**
		 * @inheritDoc
		 */
		public layout(items:DisplayObject[], viewPortBounds:ViewPortBounds = null, result:LayoutBoundsResult = null):LayoutBoundsResult
		{
			//this function is very long because it may be called every frame,
			//in some situations. testing revealed that splitting this function
			//into separate, smaller functions affected performance.
			//since the SWC compiler cannot inline functions, we can't use that
			//feature either.

			//since viewPortBounds can be null, we may need to provide some defaults
			var scrollX:number = viewPortBounds ? viewPortBounds.scrollX : 0;
			var scrollY:number = viewPortBounds ? viewPortBounds.scrollY : 0;
			var boundsX:number = viewPortBounds ? viewPortBounds.x : 0;
			var boundsY:number = viewPortBounds ? viewPortBounds.y : 0;
			var minWidth:number = viewPortBounds ? viewPortBounds.minWidth : 0;
			var minHeight:number = viewPortBounds ? viewPortBounds.minHeight : 0;
			var maxWidth:number = viewPortBounds ? viewPortBounds.maxWidth : Number.POSITIVE_INFINITY;
			var maxHeight:number = viewPortBounds ? viewPortBounds.maxHeight : Number.POSITIVE_INFINITY;
			var explicitWidth:number = viewPortBounds ? viewPortBounds.explicitWidth : NaN;
			var explicitHeight:number = viewPortBounds ? viewPortBounds.explicitHeight : NaN;

			if(this._useVirtualLayout)
			{
				//if the layout is virtualized, we'll need the dimensions of the
				//typical item so that we have fallback values when an item is null
				this.prepareTypicalItem(explicitHeight - this._paddingTop - this._paddingBottom);
				var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			if(!this._useVirtualLayout || this._hasVariableItemDimensions || this._distributeWidths ||
				this._verticalAlign != HorizontalLayout.VERTICAL_ALIGN_JUSTIFY ||
				explicitHeight !== explicitHeight) //isNaN
			{
				//in some cases, we may need to validate all of the items so
				//that we can use their dimensions below.
				this.validateItems(items, explicitHeight - this._paddingTop - this._paddingBottom,
					minHeight - this._paddingTop - this._paddingBottom,
					maxHeight - this._paddingTop - this._paddingBottom,
					explicitWidth);
			}

			if(!this._useVirtualLayout)
			{
				//handle the percentWidth property from HorizontalLayoutData,
				//if available.
				this.applyPercentWidths(items, explicitWidth, minWidth, maxWidth);
			}

			var distributedWidth:number;
			if(this._distributeWidths)
			{
				//distribute the width evenly among all items
				distributedWidth = this.calculateDistributedWidth(items, explicitWidth, minWidth, maxWidth);
			}
			var hasDistributedWidth:boolean = distributedWidth === distributedWidth; //!isNaN

			//this section prepares some variables needed for the following loop
			var hasFirstGap:boolean = this._firstGap === this._firstGap; //!isNaN
			var hasLastGap:boolean = this._lastGap === this._lastGap; //!isNaN
			var maxItemHeight:number = this._useVirtualLayout ? calculatedTypicalItemHeight : 0;
			var positionX:number = boundsX + this._paddingLeft;
			var itemCount:number = items.length;
			var totalItemCount:number = itemCount;
			if(this._useVirtualLayout && !this._hasVariableItemDimensions)
			{
				//if the layout is virtualized, and the items all have the same
				//width, we can make our loops smaller by skipping some items
				//at the beginning and end. this improves performance.
				totalItemCount += this._beforeVirtualizedItemCount + this._afterVirtualizedItemCount;
				positionX += (this._beforeVirtualizedItemCount * (calculatedTypicalItemWidth + this._gap));
				if(hasFirstGap && this._beforeVirtualizedItemCount > 0)
				{
					positionX = positionX - this._gap + this._firstGap;
				}
			}
			var secondToLastIndex:number = totalItemCount - 2;
			//this cache is used to save non-null items in virtual layouts. by
			//using a smaller array, we can improve performance by spending less
			//time in the upcoming loops.
			this._discoveredItemsCache.length = 0;
			var discoveredItemsCacheLastIndex:number = 0;

			//this first loop sets the x position of items, and it calculates
			//the total width of all items
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				//if we're trimming some items at the beginning, we need to
				//adjust i to account for the missing items in the array
				var iNormalized:number = i + this._beforeVirtualizedItemCount;

				//pick the gap that will follow this item. the first and second
				//to last items may have different gaps.
				var gap:number = this._gap;
				if(hasFirstGap && iNormalized == 0)
				{
					gap = this._firstGap;
				}
				else if(hasLastGap && iNormalized > 0 && iNormalized == secondToLastIndex)
				{
					gap = this._lastGap;
				}

				if(this._useVirtualLayout && this._hasVariableItemDimensions)
				{
					var cachedWidth:number = this._widthCache[iNormalized];
				}
				if(this._useVirtualLayout && !item)
				{
					//the item is null, and the layout is virtualized, so we
					//need to estimate the width of the item.

					if(!this._hasVariableItemDimensions ||
						cachedWidth !== cachedWidth) //isNaN
					{
						//if all items must have the same width, we will
						//use the width of the typical item (calculatedTypicalItemWidth).

						//if items may have different widths, we first check
						//the cache for a width value. if there isn't one, then
						//we'll use calculatedTypicalItemWidth as a fallback.
						positionX += calculatedTypicalItemWidth + gap;
					}
					else
					{
						//if we have variable item widths, we should use a
						//cached width when there's one available. it will be
						//more accurate than the typical item's width.
						positionX += cachedWidth + gap;
					}
				}
				else
				{
					//we get here if the item isn't null. it is never null if
					//the layout isn't virtualized.
					if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
					{
						continue;
					}
					item.x = item.pivotX + positionX;
					var itemWidth:number;
					if(hasDistributedWidth)
					{
						item.width = itemWidth = distributedWidth;
					}
					else
					{
						itemWidth = item.width;
					}
					var itemHeight:number = item.height;
					if(this._useVirtualLayout)
					{
						if(this._hasVariableItemDimensions)
						{
							if(itemWidth != cachedWidth)
							{
								//update the cache if needed. this will notify
								//the container that the virtualized layout has
								//changed, and it the view port may need to be
								//re-measured.
								this._widthCache[iNormalized] = itemWidth;

								//attempt to adjust the scroll position so that
								//it looks like we're scrolling smoothly after
								//this item resizes.
								if(positionX < scrollX &&
									cachedWidth !== cachedWidth && //isNaN
									itemWidth != calculatedTypicalItemWidth)
								{
									this.dispatchEventWith(Event.SCROLL, false, new Point(itemWidth - calculatedTypicalItemWidth, 0));
								}

								this.dispatchEventWith(Event.CHANGE);
							}
						}
						else if(calculatedTypicalItemWidth >= 0)
						{
							//if all items must have the same width, we will
							//use the width of the typical item (calculatedTypicalItemWidth).
							item.width = itemWidth = calculatedTypicalItemWidth;
						}
					}
					positionX += itemWidth + gap;
					//we compare with > instead of Math.max() because the rest
					//arguments on Math.max() cause extra garbage collection and
					//hurt performance
					if(itemHeight > maxItemHeight)
					{
						//we need to know the maximum height of the items in the
						//case where the height of the view port needs to be
						//calculated by the layout.
						maxItemHeight = itemHeight;
					}
					if(this._useVirtualLayout)
					{
						this._discoveredItemsCache[discoveredItemsCacheLastIndex] = item;
						discoveredItemsCacheLastIndex++;
					}
				}
			}
			if(this._useVirtualLayout && !this._hasVariableItemDimensions)
			{
				//finish the final calculation of the x position so that it can
				//be used for the total width of all items
				positionX += (this._afterVirtualizedItemCount * (calculatedTypicalItemWidth + this._gap));
				if(hasLastGap && this._afterVirtualizedItemCount > 0)
				{
					positionX = positionX - this._gap + this._lastGap;
				}
			}

			//this array will contain all items that are not null. see the
			//comment above where the discoveredItemsCache is initialized for
			//details about why this is important.
			var discoveredItems:DisplayObject[] = this._useVirtualLayout ? this._discoveredItemsCache : items;
			var discoveredItemCount:number = discoveredItems.length;

			var totalHeight:number = maxItemHeight + this._paddingTop + this._paddingBottom;
			//the available height is the height of the viewport. if the explicit
			//height is NaN, we need to calculate the viewport height ourselves
			//based on the total height of all items.
			var availableHeight:number = explicitHeight;
			if(availableHeight !== availableHeight) //isNaN
			{
				availableHeight = totalHeight;
				if(availableHeight < minHeight)
				{
					availableHeight = minHeight;
				}
				else if(availableHeight > maxHeight)
				{
					availableHeight = maxHeight;
				}
			}

			//this is the total width of all items
			var totalWidth:number = positionX - this._gap + this._paddingRight - boundsX;
			//the available width is the width of the viewport. if the explicit
			//width is NaN, we need to calculate the viewport width ourselves
			//based on the total width of all items.
			var availableWidth:number = explicitWidth;
			if(availableWidth !== availableWidth) //isNaN
			{
				if(this._requestedColumnCount > 0)
				{
					availableWidth = (calculatedTypicalItemWidth + this._gap) * this._requestedColumnCount - this._gap + this._paddingLeft + this._paddingRight
				}
				else
				{
					availableWidth = totalWidth;
				}
				if(availableWidth < minWidth)
				{
					availableWidth = minWidth;
				}
				else if(availableWidth > maxWidth)
				{
					availableWidth = maxWidth;
				}
			}

			//in this section, we handle horizontal alignment. items will be
			//aligned horizontally if the total width of all items is less than
			//the available width of the view port.
			if(totalWidth < availableWidth)
			{
				var horizontalAlignOffsetX:number = 0;
				if(this._horizontalAlign == HorizontalLayout.HORIZONTAL_ALIGN_RIGHT)
				{
					horizontalAlignOffsetX = availableWidth - totalWidth;
				}
				else if(this._horizontalAlign == HorizontalLayout.HORIZONTAL_ALIGN_CENTER)
				{
					horizontalAlignOffsetX = Math.round((availableWidth - totalWidth) / 2);
				}
				if(horizontalAlignOffsetX != 0)
				{
					for(i = 0; i < discoveredItemCount; i++)
					{
						item = discoveredItems[i];
						if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
						{
							continue;
						}
						item.x += horizontalAlignOffsetX;
					}
				}
			}

			for(i = 0; i < discoveredItemCount; i++)
			{
				item = discoveredItems[i];
				var layoutItem:ILayoutDisplayObject = <ILayoutDisplayObject>item ;
				if(layoutItem && !layoutItem.includeInLayout)
				{
					continue;
				}

				//in this section, we handle vertical alignment and percent
				//height from HorizontalLayoutData
				if(this._verticalAlign == HorizontalLayout.VERTICAL_ALIGN_JUSTIFY)
				{
					//if we justify items vertically, we can skip percent height
					item.y = item.pivotY + boundsY + this._paddingTop;
					item.height = availableHeight - this._paddingTop - this._paddingBottom;
				}
				else
				{
					if(layoutItem)
					{
						var layoutData:HorizontalLayoutData = <HorizontalLayoutData>layoutItem.layoutData ;
						if(layoutData)
						{
							//in this section, we handle percentage width if
							//VerticalLayoutData is available.
							var percentHeight:number = layoutData.percentHeight;
							if(percentHeight === percentHeight) //!isNaN
							{
								if(percentHeight < 0)
								{
									percentHeight = 0;
								}
								if(percentHeight > 100)
								{
									percentHeight = 100;
								}
								itemHeight = percentHeight * (availableHeight - this._paddingTop - this._paddingBottom) / 100;
								if(item instanceof IFeathersControl)
								{
									var feathersItem:IFeathersControl = IFeathersControl(item);
									var itemMinHeight:number = feathersItem.minHeight;
									if(itemHeight < itemMinHeight)
									{
										itemHeight = itemMinHeight;
									}
									else
									{
										var itemMaxHeight:number = feathersItem.maxHeight;
										if(itemHeight > itemMaxHeight)
										{
											itemHeight = itemMaxHeight;
										}
									}
								}
								item.height = itemHeight;
							}
						}
					}
					//handle all other vertical alignment values (we handled
					//justify already). the y position of all items is set here.
					switch(this._verticalAlign)
					{
						case HorizontalLayout.VERTICAL_ALIGN_BOTTOM:
						{
							item.y = item.pivotY + boundsY + availableHeight - this._paddingBottom - item.height;
							break;
						}
						case HorizontalLayout.VERTICAL_ALIGN_MIDDLE:
						{
							//round to the nearest pixel when dividing by 2 to
							//align in the middle
							item.y = item.pivotY + boundsY + this._paddingTop + Math.round((availableHeight - this._paddingTop - this._paddingBottom - item.height) / 2);
							break;
						}
						default: //top
						{
							item.y = item.pivotY + boundsY + this._paddingTop;
						}
					}
				}

				if(this._manageVisibility)
				{
					item.visible = ((item.x - item.pivotX + item.width) >= (boundsX + scrollX)) && ((item.x - item.pivotX) < (scrollX + availableWidth));
				}
			}
			//we don't want to keep a reference to any of the items, so clear
			//this cache
			this._discoveredItemsCache.length = 0;

			//finally, we want to calculate the result so that the container
			//can use it to adjust its viewport and determine the minimum and
			//maximum scroll positions (if needed)
			if(!result)
			{
				result = new LayoutBoundsResult();
			}
			result.contentX = 0;
			result.contentWidth = totalWidth;
			result.contentY = 0;
			result.contentHeight = this._verticalAlign == HorizontalLayout.VERTICAL_ALIGN_JUSTIFY ? availableHeight : totalHeight;
			result.viewPortWidth = availableWidth;
			result.viewPortHeight = availableHeight;
			return result;
		}

		/**
		 * @inheritDoc
		 */
		public measureViewPort(itemCount:number, viewPortBounds:ViewPortBounds = null, result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}
			if(!this._useVirtualLayout)
			{
				throw new IllegalOperationError("measureViewPort() may be called only if useVirtualLayout is true.")
			}

			var explicitWidth:number = viewPortBounds ? viewPortBounds.explicitWidth : NaN;
			var explicitHeight:number = viewPortBounds ? viewPortBounds.explicitHeight : NaN;
			var needsWidth:boolean = explicitWidth !== explicitWidth; //isNaN
			var needsHeight:boolean = explicitHeight !== explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				result.x = explicitWidth;
				result.y = explicitHeight;
				return result;
			}
			var minWidth:number = viewPortBounds ? viewPortBounds.minWidth : 0;
			var minHeight:number = viewPortBounds ? viewPortBounds.minHeight : 0;
			var maxWidth:number = viewPortBounds ? viewPortBounds.maxWidth : Number.POSITIVE_INFINITY;
			var maxHeight:number = viewPortBounds ? viewPortBounds.maxHeight : Number.POSITIVE_INFINITY;

			this.prepareTypicalItem(explicitHeight - this._paddingTop - this._paddingBottom);
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var hasFirstGap:boolean = this._firstGap === this._firstGap; //!isNaN
			var hasLastGap:boolean = this._lastGap === this._lastGap; //!isNaN
			var positionX:number;
			if(this._distributeWidths)
			{
				positionX = (calculatedTypicalItemWidth + this._gap) * itemCount;
			}
			else
			{
				positionX = 0;
				var maxItemHeight:number = calculatedTypicalItemHeight;
				if(!this._hasVariableItemDimensions)
				{
					positionX += ((calculatedTypicalItemWidth + this._gap) * itemCount);
				}
				else
				{
					for(var i:number = 0; i < itemCount; i++)
					{
						var cachedWidth:number = this._widthCache[i];
						if(cachedWidth !== cachedWidth) //isNaN
						{
							positionX += calculatedTypicalItemWidth + this._gap;
						}
						else
						{
							positionX += cachedWidth + this._gap;
						}
					}
				}
			}
			positionX -= this._gap;
			if(hasFirstGap && itemCount > 1)
			{
				positionX = positionX - this._gap + this._firstGap;
			}
			if(hasLastGap && itemCount > 2)
			{
				positionX = positionX - this._gap + this._lastGap;
			}

			if(needsWidth)
			{
				if(this._requestedColumnCount > 0)
				{
					var resultWidth:number = (calculatedTypicalItemWidth + this._gap) * this._requestedColumnCount - this._gap + this._paddingLeft + this._paddingRight
				}
				else
				{
					resultWidth = positionX + this._paddingLeft + this._paddingRight;
				}
				if(resultWidth < minWidth)
				{
					resultWidth = minWidth;
				}
				else if(resultWidth > maxWidth)
				{
					resultWidth = maxWidth;
				}
				result.x = resultWidth;
			}
			else
			{
				result.x = explicitWidth;
			}

			if(needsHeight)
			{
				var resultHeight:number = maxItemHeight + this._paddingTop + this._paddingBottom;
				if(resultHeight < minHeight)
				{
					resultHeight = minHeight;
				}
				else if(resultHeight > maxHeight)
				{
					resultHeight = maxHeight;
				}
				result.y = resultHeight;
			}
			else
			{
				result.y = explicitHeight;
			}

			return result;
		}

		/**
		 * @inheritDoc
		 */
		public resetVariableVirtualCache():void
		{
			this._widthCache.length = 0;
		}

		/**
		 * @inheritDoc
		 */
		public resetVariableVirtualCacheAtIndex(index:number, item:DisplayObject = null):void
		{
			delete this._widthCache[index];
			if(item)
			{
				this._widthCache[index] = item.width;
				this.dispatchEventWith(Event.CHANGE);
			}
		}

		/**
		 * @inheritDoc
		 */
		public addToVariableVirtualCacheAtIndex(index:number, item:DisplayObject = null):void
		{
			var widthValue:any = item ? item.width : undefined;
			this._widthCache.splice(index, 0, widthValue);
		}

		/**
		 * @inheritDoc
		 */
		public removeFromVariableVirtualCacheAtIndex(index:number):void
		{
			this._widthCache.splice(index, 1);
		}

		/**
		 * @inheritDoc
		 */
		public getVisibleIndicesAtScrollPosition(scrollX:number, scrollY:number, width:number, height:number, itemCount:number, result:number[] = null):number[]
		{
			if(result)
			{
				result.length = 0;
			}
			else
			{
				result = new Array<number>();
			}
			if(!this._useVirtualLayout)
			{
				throw new IllegalOperationError("getVisibleIndicesAtScrollPosition() may be called only if useVirtualLayout is true.")
			}

			this.prepareTypicalItem(height - this._paddingTop - this._paddingBottom);
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var hasFirstGap:boolean = this._firstGap === this._firstGap; //!isNaN
			var hasLastGap:boolean = this._lastGap === this._lastGap; //!isNaN
			var resultLastIndex:number = 0;
			//we add one extra here because the first item renderer in view may
			//be partially obscured, which would reveal an extra item renderer.
			var maxVisibleTypicalItemCount:number = Math.ceil(width / (calculatedTypicalItemWidth + this._gap)) + 1;
			if(!this._hasVariableItemDimensions)
			{
				//this case can be optimized because we know that every item has
				//the same width
				var totalItemWidth:number = itemCount * (calculatedTypicalItemWidth + this._gap) - this._gap;
				if(hasFirstGap && itemCount > 1)
				{
					totalItemWidth = totalItemWidth - this._gap + this._firstGap;
				}
				if(hasLastGap && itemCount > 2)
				{
					totalItemWidth = totalItemWidth - this._gap + this._lastGap;
				}
				var indexOffset:number = 0;
				if(totalItemWidth < width)
				{
					if(this._horizontalAlign == HorizontalLayout.HORIZONTAL_ALIGN_RIGHT)
					{
						indexOffset = Math.ceil((width - totalItemWidth) / (calculatedTypicalItemWidth + this._gap));
					}
					else if(this._horizontalAlign == HorizontalLayout.HORIZONTAL_ALIGN_CENTER)
					{
						indexOffset = Math.ceil(((width - totalItemWidth) / (calculatedTypicalItemWidth + this._gap)) / 2);
					}
				}
				var minimum:number = (scrollX - this._paddingLeft) / (calculatedTypicalItemWidth + this._gap);
				if(minimum < 0)
				{
					minimum = 0;
				}
				minimum -= indexOffset;
				//if we're scrolling beyond the final item, we should keep the
				//indices consistent so that items aren't destroyed and
				//recreated unnecessarily
				var maximum:number = minimum + maxVisibleTypicalItemCount;
				if(maximum >= itemCount)
				{
					maximum = itemCount - 1;
				}
				minimum = maximum - maxVisibleTypicalItemCount;
				if(minimum < 0)
				{
					minimum = 0;
				}
				for(var i:number = minimum; i <= maximum; i++)
				{
					if(i >= 0 && i < itemCount)
					{
						result[resultLastIndex] = i;
					}
					else if(i < 0)
					{
						result[resultLastIndex] = itemCount + i;
					}
					else if(i >= itemCount)
					{
						result[resultLastIndex] = i - itemCount;
					}
					resultLastIndex++;
				}
				return result;
			}
			var secondToLastIndex:number = itemCount - 2;
			var maxPositionX:number = scrollX + width;
			var positionX:number = this._paddingLeft;
			for(i = 0; i < itemCount; i++)
			{
				var gap:number = this._gap;
				if(hasFirstGap && i == 0)
				{
					gap = this._firstGap;
				}
				else if(hasLastGap && i > 0 && i == secondToLastIndex)
				{
					gap = this._lastGap;
				}
				var cachedWidth:number = this._widthCache[i];
				if(cachedWidth !== cachedWidth) //isNaN
				{
					var itemWidth:number = calculatedTypicalItemWidth;
				}
				else
				{
					itemWidth = cachedWidth;
				}
				var oldPositionX:number = positionX;
				positionX += itemWidth + gap;
				if(positionX > scrollX && oldPositionX < maxPositionX)
				{
					result[resultLastIndex] = i;
					resultLastIndex++;
				}

				if(positionX >= maxPositionX)
				{
					break;
				}
			}

			//similar to above, in order to avoid costly destruction and
			//creation of item renderers, we're going to fill in some extra
			//indices
			var resultLength:number = result.length;
			var visibleItemCountDifference:number = maxVisibleTypicalItemCount - resultLength;
			if(visibleItemCountDifference > 0 && resultLength > 0)
			{
				//add extra items before the first index
				var firstExistingIndex:number = result[0];
				var lastIndexToAdd:number = firstExistingIndex - visibleItemCountDifference;
				if(lastIndexToAdd < 0)
				{
					lastIndexToAdd = 0;
				}
				for(i = firstExistingIndex - 1; i >= lastIndexToAdd; i--)
				{
					result.unshift(i);
				}
			}
			resultLength = result.length;
			resultLastIndex = resultLength;
			visibleItemCountDifference = maxVisibleTypicalItemCount - resultLength;
			if(visibleItemCountDifference > 0)
			{
				//add extra items after the last index
				var startIndex:number = resultLength > 0 ? (result[resultLength - 1] + 1) : 0;
				var endIndex:number = startIndex + visibleItemCountDifference;
				if(endIndex > itemCount)
				{
					endIndex = itemCount;
				}
				for(i = startIndex; i < endIndex; i++)
				{
					result[resultLastIndex] = i;
					resultLastIndex++;
				}
			}
			return result;
		}

		/**
		 * @inheritDoc
		 */
		public getNearestScrollPositionForIndex(index:number, scrollX:number, scrollY:number, items:DisplayObject[],
			x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			var maxScrollX:number = this.calculateMaxScrollXOfIndex(index, items, x, y, width, height);

			if(this._useVirtualLayout)
			{
				if(this._hasVariableItemDimensions)
				{
					var itemWidth:number = this._widthCache[index];
					if(itemWidth !== itemWidth)
					{
						itemWidth = this._typicalItem.width;
					}
				}
				else
				{
					itemWidth = this._typicalItem.width;
				}
			}
			else
			{
				itemWidth = items[index].width;
			}

			if(!result)
			{
				result = new Point();
			}

			var rightPosition:number = maxScrollX - (width - itemWidth);
			if(scrollX >= rightPosition && scrollX <= maxScrollX)
			{
				//keep the current scroll position because the item is already
				//fully visible
				result.x = scrollX;
			}
			else
			{
				var leftDifference:number = Math.abs(maxScrollX - scrollX);
				var rightDifference:number = Math.abs(rightPosition - scrollX);
				if(rightDifference < leftDifference)
				{
					result.x = rightPosition;
				}
				else
				{
					result.x = maxScrollX;
				}
			}
			result.y = 0;

			return result;
		}

		/**
		 * @inheritDoc
		 */
		public getScrollPositionForIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			var maxScrollX:number = this.calculateMaxScrollXOfIndex(index, items, x, y, width, height);
			if(this._useVirtualLayout)
			{
				if(this._hasVariableItemDimensions)
				{
					var itemWidth:number = this._widthCache[index];
					if(itemWidth !== itemWidth)
					{
						itemWidth = this._typicalItem.width;
					}
				}
				else
				{
					itemWidth = this._typicalItem.width;
				}
			}
			else
			{
				itemWidth = items[index].width;
			}
			if(this._scrollPositionHorizontalAlign == HorizontalLayout.HORIZONTAL_ALIGN_CENTER)
			{
				maxScrollX -= Math.round((width - itemWidth) / 2);
			}
			else if(this._scrollPositionHorizontalAlign == HorizontalLayout.HORIZONTAL_ALIGN_RIGHT)
			{
				maxScrollX -= (width - itemWidth);
			}
			result.x = maxScrollX;
			result.y = 0;

			return result;
		}

		/**
		 * @private
		 */
		protected validateItems(items:DisplayObject[], explicitHeight:number,
			minHeight:number, maxHeight:number, distributedWidth:number):void
		{
			//if the alignment is justified, then we want to set the height of
			//each item before validating because setting one dimension may
			//cause the other dimension to change, and that will invalidate the
			//layout if it happens after validation, causing more invalidation
			var isJustified:boolean = this._verticalAlign == HorizontalLayout.VERTICAL_ALIGN_JUSTIFY;
			var itemCount:number = items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				if(!item || (item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout))
				{
					continue;
				}
				if(this._distributeWidths)
				{
					item.width = distributedWidth;
				}
				if(isJustified)
				{
					//the alignment is justified, but we don't yet have a width
					//to use, so we need to ensure that we accurately measure
					//the items instead of using an old justified height that
					//may be wrong now!
					item.height = explicitHeight;
					if(item instanceof IFeathersControl)
					{
						var feathersItem:IFeathersControl = IFeathersControl(item);
						feathersItem.minHeight = minHeight;
						feathersItem.maxHeight = maxHeight;
					}
				}
				if(item instanceof IValidating)
				{
					IValidating(item).validate()
				}
			}
		}

		/**
		 * @private
		 */
		protected prepareTypicalItem(justifyHeight:number):void
		{
			if(!this._typicalItem)
			{
				return;
			}
			if(this._resetTypicalItemDimensionsOnMeasure)
			{
				this._typicalItem.width = this._typicalItemWidth;
			}
			if(this._verticalAlign == HorizontalLayout.VERTICAL_ALIGN_JUSTIFY &&
				justifyHeight === justifyHeight) //!isNaN
			{
				this._typicalItem.height = justifyHeight;
			}
			else if(this._resetTypicalItemDimensionsOnMeasure)
			{
				this._typicalItem.height = this._typicalItemHeight;
			}
			if(this._typicalItem instanceof IValidating)
			{
				IValidating(this._typicalItem).validate();
			}
		}

		/**
		 * @private
		 */
		protected calculateDistributedWidth(items:DisplayObject[], explicitWidth:number, minWidth:number, maxWidth:number):number
		{
			var itemCount:number = items.length;
			if(explicitWidth !== explicitWidth) //isNaN
			{
				var maxItemWidth:number = 0;
				for(var i:number = 0; i < itemCount; i++)
				{
					var item:DisplayObject = items[i];
					var itemWidth:number = item.width;
					if(itemWidth > maxItemWidth)
					{
						maxItemWidth = itemWidth;
					}
				}
				explicitWidth = maxItemWidth * itemCount + this._paddingLeft + this._paddingRight + this._gap * (itemCount - 1);
				var needsRecalculation:boolean = false;
				if(explicitWidth > maxWidth)
				{
					explicitWidth = maxWidth;
					needsRecalculation = true;
				}
				else if(explicitWidth < minWidth)
				{
					explicitWidth = minWidth;
					needsRecalculation = true;
				}
				if(!needsRecalculation)
				{
					return maxItemWidth;
				}
			}
			var availableSpace:number = explicitWidth - this._paddingLeft - this._paddingRight - this._gap * (itemCount - 1);
			if(itemCount > 1 && this._firstGap === this._firstGap) //!isNaN
			{
				availableSpace += this._gap - this._firstGap;
			}
			if(itemCount > 2 && this._lastGap === this._lastGap) //!isNaN
			{
				availableSpace += this._gap - this._lastGap;
			}
			return availableSpace / itemCount;
		}

		/**
		 * @private
		 */
		protected applyPercentWidths(items:DisplayObject[], explicitWidth:number, minWidth:number, maxWidth:number):void
		{
			var remainingWidth:number = explicitWidth;
			this._discoveredItemsCache.length = 0;
			var totalExplicitWidth:number = 0;
			var totalMinWidth:number = 0;
			var totalPercentWidth:number = 0;
			var itemCount:number = items.length;
			var pushIndex:number = 0;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				if(item instanceof this.ILayoutDisplayObject)
				{
					var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
					if(!layoutItem.includeInLayout)
					{
						continue;
					}
					var layoutData:HorizontalLayoutData = <HorizontalLayoutData>layoutItem.layoutData ;
					if(layoutData)
					{
						var percentWidth:number = layoutData.percentWidth;
						if(percentWidth === percentWidth) //!isNaN
						{
							if(layoutItem instanceof IFeathersControl)
							{
								var feathersItem:IFeathersControl = IFeathersControl(layoutItem);
								totalMinWidth += feathersItem.minWidth;
							}
							totalPercentWidth += percentWidth;
							this._discoveredItemsCache[pushIndex] = item;
							pushIndex++;
							continue;
						}
					}
				}
				totalExplicitWidth += item.width;
			}
			totalExplicitWidth += this._gap * (itemCount - 1);
			if(this._firstGap === this._firstGap && itemCount > 1)
			{
				totalExplicitWidth += (this._firstGap - this._gap);
			}
			else if(this._lastGap === this._lastGap && itemCount > 2)
			{
				totalExplicitWidth += (this._lastGap - this._gap);
			}
			totalExplicitWidth += this._paddingLeft + this._paddingRight;
			if(totalPercentWidth < 100)
			{
				totalPercentWidth = 100;
			}
			if(remainingWidth !== remainingWidth) //isNaN
			{
				remainingWidth = totalExplicitWidth + totalMinWidth;
				if(remainingWidth < minWidth)
				{
					remainingWidth = minWidth;
				}
				else if(remainingWidth > maxWidth)
				{
					remainingWidth = maxWidth;
				}
			}
			remainingWidth -= totalExplicitWidth;
			if(remainingWidth < 0)
			{
				remainingWidth = 0;
			}
			do
			{
				var needsAnotherPass:boolean = false;
				var percentToPixels:number = remainingWidth / totalPercentWidth;
				for(i = 0; i < pushIndex; i++)
				{
					layoutItem = this.ILayoutDisplayObject(this._discoveredItemsCache[i]);
					if(!layoutItem)
					{
						continue;
					}
					layoutData = this.HorizontalLayoutData(layoutItem.layoutData);
					percentWidth = layoutData.percentWidth;
					var itemWidth:number = percentToPixels * percentWidth;
					if(layoutItem instanceof IFeathersControl)
					{
						feathersItem = IFeathersControl(layoutItem);
						var itemMinWidth:number = feathersItem.minWidth;
						if(itemWidth < itemMinWidth)
						{
							itemWidth = itemMinWidth;
							remainingWidth -= itemWidth;
							totalPercentWidth -= percentWidth;
							this._discoveredItemsCache[i] = null;
							needsAnotherPass = true;
						}
						else
						{
							var itemMaxWidth:number = feathersItem.maxWidth;
							if(itemWidth > itemMaxWidth)
							{
								itemWidth = itemMaxWidth;
								remainingWidth -= itemWidth;
								totalPercentWidth -= percentWidth;
								this._discoveredItemsCache[i] = null;
								needsAnotherPass = true;
							}
						}
					}
					layoutItem.width = itemWidth;
				}
			}
			while(needsAnotherPass)
			this._discoveredItemsCache.length = 0;
		}

		/**
		 * @private
		 */
		protected calculateMaxScrollXOfIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number):number
		{
			if(this._useVirtualLayout)
			{
				this.prepareTypicalItem(height - this._paddingTop - this._paddingBottom);
				var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			var hasFirstGap:boolean = this._firstGap === this._firstGap; //!isNaN
			var hasLastGap:boolean = this._lastGap === this._lastGap; //!isNaN
			var positionX:number = x + this._paddingLeft;
			var lastWidth:number = 0;
			var gap:number = this._gap;
			var startIndexOffset:number = 0;
			var endIndexOffset:number = 0;
			var itemCount:number = items.length;
			var totalItemCount:number = itemCount;
			if(this._useVirtualLayout && !this._hasVariableItemDimensions)
			{
				totalItemCount += this._beforeVirtualizedItemCount + this._afterVirtualizedItemCount;
				if(index < this._beforeVirtualizedItemCount)
				{
					//this makes it skip the loop below
					startIndexOffset = index + 1;
					lastWidth = calculatedTypicalItemWidth;
					gap = this._gap;
				}
				else
				{
					startIndexOffset = this._beforeVirtualizedItemCount;
					endIndexOffset = index - items.length - this._beforeVirtualizedItemCount + 1;
					if(endIndexOffset < 0)
					{
						endIndexOffset = 0;
					}
					positionX += (endIndexOffset * (calculatedTypicalItemWidth + this._gap));
				}
				positionX += (startIndexOffset * (calculatedTypicalItemWidth + this._gap));
			}
			index -= (startIndexOffset + endIndexOffset);
			var secondToLastIndex:number = totalItemCount - 2;
			for(var i:number = 0; i <= index; i++)
			{
				var item:DisplayObject = items[i];
				var iNormalized:number = i + startIndexOffset;
				if(hasFirstGap && iNormalized == 0)
				{
					gap = this._firstGap;
				}
				else if(hasLastGap && iNormalized > 0 && iNormalized == secondToLastIndex)
				{
					gap = this._lastGap;
				}
				else
				{
					gap = this._gap;
				}
				if(this._useVirtualLayout && this._hasVariableItemDimensions)
				{
					var cachedWidth:number = this._widthCache[iNormalized];
				}
				if(this._useVirtualLayout && !item)
				{
					if(!this._hasVariableItemDimensions ||
						cachedWidth !== cachedWidth) //isNaN
					{
						lastWidth = calculatedTypicalItemWidth;
					}
					else
					{
						lastWidth = cachedWidth;
					}
				}
				else
				{
					var itemWidth:number = item.width;
					if(this._useVirtualLayout)
					{
						if(this._hasVariableItemDimensions)
						{
							if(itemWidth != cachedWidth)
							{
								this._widthCache[iNormalized] = itemWidth;
								this.dispatchEventWith(Event.CHANGE);
							}
						}
						else if(calculatedTypicalItemWidth >= 0)
						{
							item.width = itemWidth = calculatedTypicalItemWidth;
						}
					}
					lastWidth = itemWidth;
				}
				positionX += lastWidth + gap;
			}
			positionX -= (lastWidth + gap);
			return positionX;
		}
	}
}
