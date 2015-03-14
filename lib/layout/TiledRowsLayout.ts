/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.layout
{
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
	 * Positions items as tiles (equal width and height) from left to right
	 * in multiple rows. Constrained to the suggested width, the tiled rows
	 * layout will change in height as the number of items increases or
	 * decreases.
	 *
	 * @see ../../../help/tiled-rows-layout.html How to use TiledRowsLayout with Feathers containers
	 */
	export class TiledRowsLayout extends EventDispatcher implements IVirtualLayout
	{
		/**
		 * If the total item height is smaller than the height of the bounds,
		 * the items will be aligned to the top.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * If the total item height is smaller than the height of the bounds,
		 * the items will be aligned to the middle.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * If the total item height is smaller than the height of the bounds,
		 * the items will be aligned to the bottom.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

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
		 * If an item height is smaller than the height of a tile, the item will
		 * be aligned to the top edge of the tile.
		 *
		 * @see #tileVerticalAlign
		 */
		public static TILE_VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * If an item height is smaller than the height of a tile, the item will
		 * be aligned to the middle of the tile.
		 *
		 * @see #tileVerticalAlign
		 */
		public static TILE_VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * If an item height is smaller than the height of a tile, the item will
		 * be aligned to the bottom edge of the tile.
		 *
		 * @see #tileVerticalAlign
		 */
		public static TILE_VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * The item will be resized to fit the height of the tile.
		 *
		 * @see #tileVerticalAlign
		 */
		public static TILE_VERTICAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * If an item width is smaller than the width of a tile, the item will
		 * be aligned to the left edge of the tile.
		 *
		 * @see #tileHorizontalAlign
		 */
		public static TILE_HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * If an item width is smaller than the width of a tile, the item will
		 * be aligned to the center of the tile.
		 *
		 * @see #tileHorizontalAlign
		 */
		public static TILE_HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * If an item width is smaller than the width of a tile, the item will
		 * be aligned to the right edge of the tile.
		 *
		 * @see #tileHorizontalAlign
		 */
		public static TILE_HORIZONTAL_ALIGN_RIGHT:string = "right";

		/**
		 * The item will be resized to fit the width of the tile.
		 *
		 * @see #tileHorizontalAlign
		 */
		public static TILE_HORIZONTAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The items will be positioned in pages horizontally from left to right.
		 *
		 * @see #paging
		 */
		public static PAGING_HORIZONTAL:string = "horizontal";

		/**
		 * The items will be positioned in pages vertically from top to bottom.
		 *
		 * @see #paging
		 */
		public static PAGING_VERTICAL:string = "vertical";

		/**
		 * The items will not be paged. In other words, they will be positioned
		 * in a continuous set of rows without gaps.
		 *
		 * @see #paging
		 */
		public static PAGING_NONE:string = "none";

		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * @private
		 */
		protected _discoveredItemsCache:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * Quickly sets both <code>horizontalGap</code> and <code>verticalGap</code>
		 * to the same value. The <code>gap</code> getter always returns the
		 * value of <code>horizontalGap</code>, but the value of
		 * <code>verticalGap</code> may be different.
		 *
		 * @default 0
		 *
		 * @see #horizontalGap
		 * @see #verticalGap
		 */
		public get gap():number
		{
			return this._horizontalGap;
		}

		/**
		 * @private
		 */
		public set gap(value:number)
		{
			this.horizontalGap = value;
			this.verticalGap = value;
		}

		/**
		 * @private
		 */
		protected _horizontalGap:number = 0;

		/**
		 * The horizontal space, in pixels, between tiles.
		 *
		 * @default 0
		 */
		public get horizontalGap():number
		{
			return this._horizontalGap;
		}

		/**
		 * @private
		 */
		public set horizontalGap(value:number)
		{
			if(this._horizontalGap == value)
			{
				return;
			}
			this._horizontalGap = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _verticalGap:number = 0;

		/**
		 * The vertical space, in pixels, between tiles.
		 *
		 * @default 0
		 */
		public get verticalGap():number
		{
			return this._verticalGap;
		}

		/**
		 * @private
		 */
		public set verticalGap(value:number)
		{
			if(this._verticalGap == value)
			{
				return;
			}
			this._verticalGap = value;
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
		 * The space, in pixels, above of items.
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
		 * The space, in pixels, to the right of the items.
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
		 * The space, in pixels, below the items.
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
		 * The space, in pixels, to the left of the items.
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
		protected _requestedColumnCount:number = 0;

		/**
		 * Requests that the layout uses a specific number of columns in a row,
		 * if possible. Set to <code>0</code> to calculate the maximum of
		 * columns that will fit in the available space.
		 *
		 * <p>If the view port's explicit or maximum width is not large enough
		 * to fit the requested number of columns, it will use fewer. If the
		 * view port doesn't have an explicit width and the maximum width is
		 * equal to <code>Number.POSITIVE_INFINITY</code>, the width will be
		 * calculated automatically to fit the exact number of requested
		 * columns.</p>
		 *
		 * <p>If paging is enabled, this value will be used to calculate the
		 * number of columns in a page. If paging isn't enabled, this value will
		 * be used to calculate a minimum number of columns, even if there
		 * aren't enough items to fill each column.</p>
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
		protected _requestedRowCount:number = 0;

		/**
		 * Requests that the layout uses a specific number of rows, if possible.
		 * If the view port's explicit or maximum height is not large enough to
		 * fit the requested number of rows, it will use fewer. Set to <code>0</code>
		 * to calculate the number of rows automatically based on width and
		 * height.
		 *
		 * <p>If paging is enabled, this value will be used to calculate the
		 * number of rows in a page. If paging isn't enabled, this value will
		 * be used to calculate a minimum number of rows, even if there aren't
		 * enough items to fill each row.</p>
		 *
		 * @default 0
		 */
		public get requestedRowCount():number
		{
			return this._requestedRowCount;
		}

		/**
		 * @private
		 */
		public set requestedRowCount(value:number)
		{
			if(value < 0)
			{
				throw RangeError("requestedRowCount requires a value >= 0");
			}
			if(this._requestedRowCount == value)
			{
				return;
			}
			this._requestedRowCount = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _verticalAlign:string = TiledRowsLayout.VERTICAL_ALIGN_TOP;

		/*[Inspectable(type="String",enumeration="top,middle,bottom")]*/
		/**
		 * If the total column height is less than the bounds, the items in the
		 * column can be aligned vertically.
		 *
		 * @default TiledRowsLayout.VERTICAL_ALIGN_TOP
		 *
		 * @see #VERTICAL_ALIGN_TOP
		 * @see #VERTICAL_ALIGN_MIDDLE
		 * @see #VERTICAL_ALIGN_BOTTOM
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
		protected _horizontalAlign:string = TiledRowsLayout.HORIZONTAL_ALIGN_CENTER;

		/*[Inspectable(type="String",enumeration="left,center,right")]*/
		/**
		 * If the total row width is less than the bounds, the items in the row
		 * can be aligned horizontally.
		 *
		 * @default TiledRowsLayout.HORIZONTAL_ALIGN_CENTER
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
		protected _tileVerticalAlign:string = TiledRowsLayout.TILE_VERTICAL_ALIGN_MIDDLE;

		/*[Inspectable(type="String",enumeration="top,middle,bottom,justify")]*/
		/**
		 * If an item's height is less than the tile bounds, the position of the
		 * item can be aligned vertically.
		 *
		 * @default TiledRowsLayout.TILE_VERTICAL_ALIGN_MIDDLE
		 *
		 * @see #TILE_VERTICAL_ALIGN_TOP
		 * @see #TILE_VERTICAL_ALIGN_MIDDLE
		 * @see #TILE_VERTICAL_ALIGN_BOTTOM
		 * @see #TILE_VERTICAL_ALIGN_JUSTIFY
		 */
		public get tileVerticalAlign():string
		{
			return this._tileVerticalAlign;
		}

		/**
		 * @private
		 */
		public set tileVerticalAlign(value:string)
		{
			if(this._tileVerticalAlign == value)
			{
				return;
			}
			this._tileVerticalAlign = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _tileHorizontalAlign:string = TiledRowsLayout.TILE_HORIZONTAL_ALIGN_CENTER;

		/*[Inspectable(type="String",enumeration="left,center,right,justify")]*/
		/**
		 * If the item's width is less than the tile bounds, the position of the
		 * item can be aligned horizontally.
		 *
		 * @default TiledRowsLayout.TILE_HORIZONTAL_ALIGN_CENTER
		 *
		 * @see #TILE_HORIZONTAL_ALIGN_LEFT
		 * @see #TILE_HORIZONTAL_ALIGN_CENTER
		 * @see #TILE_HORIZONTAL_ALIGN_RIGHT
		 * @see #TILE_HORIZONTAL_ALIGN_JUSTIFY
		 */
		public get tileHorizontalAlign():string
		{
			return this._tileHorizontalAlign;
		}

		/**
		 * @private
		 */
		public set tileHorizontalAlign(value:string)
		{
			if(this._tileHorizontalAlign == value)
			{
				return;
			}
			this._tileHorizontalAlign = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _paging:string = TiledRowsLayout.PAGING_NONE;

		/**
		 * If the total combined height of the rows is larger than the height
		 * of the view port, the layout will be split into pages where each
		 * page is filled with the maximum number of rows that may be displayed
		 * without cutting off any items.
		 *
		 * @default TiledRowsLayout.PAGING_NONE
		 *
		 * @see #PAGING_NONE
		 * @see #PAGING_HORIZONTAL
		 * @see #PAGING_VERTICAL
		 */
		public get paging():string
		{
			return this._paging;
		}

		/**
		 * @private
		 */
		public set paging(value:string)
		{
			if(this._paging == value)
			{
				return;
			}
			this._paging = value;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _useSquareTiles:boolean = true;

		/**
		 * Determines if the tiles must be square or if their width and height
		 * may have different values.
		 *
		 * @default true
		 */
		public get useSquareTiles():boolean
		{
			return this._useSquareTiles;
		}

		/**
		 * @private
		 */
		public set useSquareTiles(value:boolean)
		{
			if(this._useSquareTiles == value)
			{
				return;
			}
			this._useSquareTiles = value;
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
		protected _typicalItem:DisplayObject;

		/**
		 * @inheritDoc
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
		 * @inheritDoc
		 */
		public get requiresLayoutOnScroll():boolean
		{
			return this._manageVisibility || this._useVirtualLayout;
		}

		/**
		 * @inheritDoc
		 */
		public layout(items:DisplayObject[], viewPortBounds:ViewPortBounds = null, result:LayoutBoundsResult = null):LayoutBoundsResult
		{
			if(!result)
			{
				result = new LayoutBoundsResult();
			}
			if(items.length == 0)
			{
				result.contentX = 0;
				result.contentY = 0;
				result.contentWidth = 0;
				result.contentHeight = 0;
				result.viewPortWidth = 0;
				result.viewPortHeight = 0;
				return result;
			}

			var scrollX:number = viewPortBounds ? viewPortBounds.scrollX : 0;
			var scrollY:number = viewPortBounds? viewPortBounds.scrollY : 0;
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
				this.prepareTypicalItem();
				var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			this.validateItems(items);

			this._discoveredItemsCache.length = 0;
			var itemCount:number = items.length;
			var tileWidth:number = this._useVirtualLayout ? calculatedTypicalItemWidth : 0;
			var tileHeight:number = this._useVirtualLayout ? calculatedTypicalItemHeight : 0;
			//a virtual layout assumes that all items are the same size as
			//the typical item, so we don't need to measure every item in
			//that case
			if(!this._useVirtualLayout)
			{
				for(var i:number = 0; i < itemCount; i++)
				{
					var item:DisplayObject = items[i];
					if(!item)
					{
						continue;
					}
					if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
					{
						continue;
					}
					var itemWidth:number = item.width;
					var itemHeight:number = item.height;
					if(itemWidth > tileWidth)
					{
						tileWidth = itemWidth;
					}
					if(itemHeight > tileHeight)
					{
						tileHeight = itemHeight;
					}
				}
			}
			if(tileWidth < 0)
			{
				tileWidth = 0;
			}
			if(tileHeight < 0)
			{
				tileHeight = 0;
			}
			if(this._useSquareTiles)
			{
				if(tileWidth > tileHeight)
				{
					tileHeight = tileWidth;
				}
				else if(tileHeight > tileWidth)
				{
					tileWidth = tileHeight;
				}
			}
			var availableWidth:number = NaN;
			var availableHeight:number = NaN;

			var horizontalTileCount:number;
			if(explicitWidth === explicitWidth) //!isNaN
			{
				availableWidth = explicitWidth;
				horizontalTileCount = (explicitWidth - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			}
			else if(maxWidth === maxWidth && //!isNaN
				maxWidth < Number.POSITIVE_INFINITY)
			{
				availableWidth = maxWidth;
				horizontalTileCount = (maxWidth - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			}
			else if(this._requestedColumnCount > 0)
			{
				horizontalTileCount = this._requestedColumnCount;
				availableWidth = this._paddingLeft + this._paddingRight + ((tileWidth + this._horizontalGap) * horizontalTileCount) - this._horizontalGap;
			}
			else
			{
				//put everything in one row
				horizontalTileCount = itemCount;
			}
			if(horizontalTileCount < 1)
			{
				//we must have at least one tile per row
				horizontalTileCount = 1;
			}
			else if(this._requestedColumnCount > 0)
			{
				if(availableWidth !== availableWidth) //isNaN
				{
					horizontalTileCount = this._requestedColumnCount;
					availableWidth = horizontalTileCount * (tileWidth + this._horizontalGap) - this._horizontalGap - this._paddingLeft - this._paddingRight;
				}
				else if(horizontalTileCount > this._requestedColumnCount)
				{
					horizontalTileCount = this._requestedColumnCount;
				}
			}
			var verticalTileCount:number;
			if(explicitHeight === explicitHeight) //!isNaN
			{
				availableHeight = explicitHeight;
				verticalTileCount = (explicitHeight - this._paddingTop - this._paddingBottom + this._verticalGap) / (tileHeight + this._verticalGap);
			}
			else if(maxHeight === maxHeight && //!isNaN
				maxHeight < Number.POSITIVE_INFINITY)
			{
				availableHeight = maxHeight;
				verticalTileCount = (maxHeight - this._paddingTop - this._paddingBottom + this._verticalGap) / (tileHeight + this._verticalGap);
			}
			else
			{
				//using the horizontal tile count, calculate how many rows will
				//be required for the total number of items.
				verticalTileCount = Math.ceil(itemCount / horizontalTileCount);
			}
			if(verticalTileCount < 1)
			{
				//we must have at least one tile per column
				verticalTileCount = 1;
			}
			else if(this._requestedRowCount > 0)
			{
				if(availableHeight !== availableHeight) //isNaN
				{
					verticalTileCount = this._requestedRowCount;
					availableHeight = verticalTileCount * (tileHeight + this._verticalGap) - this._verticalGap - this._paddingTop - this._paddingBottom;
				}
				else if(verticalTileCount > this._requestedRowCount)
				{
					verticalTileCount = this._requestedRowCount;
				}
			}

			var totalPageWidth:number = horizontalTileCount * (tileWidth + this._horizontalGap) - this._horizontalGap + this._paddingLeft + this._paddingRight;
			var totalPageHeight:number = verticalTileCount * (tileHeight + this._verticalGap) - this._verticalGap + this._paddingTop + this._paddingBottom;
			var availablePageWidth:number = availableWidth;
			if(availablePageWidth !== availablePageWidth) //isNaN
			{
				availablePageWidth = totalPageWidth;
			}
			var availablePageHeight:number = availableHeight;
			if(availablePageHeight !== availablePageHeight) //isNaN
			{
				availablePageHeight = totalPageHeight;
			}

			var startX:number = boundsX + this._paddingLeft;
			var startY:number = boundsY + this._paddingTop;

			var perPage:number = horizontalTileCount * verticalTileCount;
			var pageIndex:number = 0;
			var nextPageStartIndex:number = perPage;
			var pageStartX:number = startX;
			var positionX:number = startX;
			var positionY:number = startY;
			var itemIndex:number = 0;
			var discoveredItemsCachePushIndex:number = 0;
			for(i = 0; i < itemCount; i++)
			{
				item = items[i];
				if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
				{
					continue;
				}
				if(itemIndex != 0 && itemIndex % horizontalTileCount == 0)
				{
					positionX = pageStartX;
					positionY += tileHeight + this._verticalGap;
				}
				if(itemIndex == nextPageStartIndex)
				{
					//we're starting a new page, so handle alignment of the
					//items on the current page and update the positions
					if(this._paging != TiledRowsLayout.PAGING_NONE)
					{
						var discoveredItems:DisplayObject[] = this._useVirtualLayout ? this._discoveredItemsCache : items;
						var discoveredItemsFirstIndex:number = this._useVirtualLayout ? 0 : (itemIndex - perPage);
						var discoveredItemsLastIndex:number = this._useVirtualLayout ? (this._discoveredItemsCache.length - 1) : (itemIndex - 1);
						this.applyHorizontalAlign(discoveredItems, discoveredItemsFirstIndex, discoveredItemsLastIndex, totalPageWidth, availablePageWidth);
						this.applyVerticalAlign(discoveredItems, discoveredItemsFirstIndex, discoveredItemsLastIndex, totalPageHeight, availablePageHeight);
						if(this._manageVisibility)
						{
							this.applyVisible(discoveredItems, discoveredItemsFirstIndex, discoveredItemsLastIndex,
								boundsX + scrollX, scrollX + availableWidth, boundsY + scrollY, scrollY + availableHeight);
						}
						this._discoveredItemsCache.length = 0;
						discoveredItemsCachePushIndex = 0;
					}
					pageIndex++;
					nextPageStartIndex += perPage;

					//we can use availableWidth and availableHeight here without
					//checking if they're NaN because we will never reach a
					//new page without them already being calculated.
					if(this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
					{
						positionX = pageStartX = startX + availableWidth * pageIndex;
						positionY = startY;
					}
					else if(this._paging == TiledRowsLayout.PAGING_VERTICAL)
					{
						positionY = startY + availableHeight * pageIndex;
					}
				}
				if(item)
				{
					switch(this._tileHorizontalAlign)
					{
						case TiledRowsLayout.TILE_HORIZONTAL_ALIGN_JUSTIFY:
						{
							item.x = item.pivotX + positionX;
							item.width = tileWidth;
							break;
						}
						case TiledRowsLayout.TILE_HORIZONTAL_ALIGN_LEFT:
						{
							item.x = item.pivotX + positionX;
							break;
						}
						case TiledRowsLayout.TILE_HORIZONTAL_ALIGN_RIGHT:
						{
							item.x = item.pivotX + positionX + tileWidth - item.width;
							break;
						}
						default: //center or unknown
						{
							item.x = item.pivotX + positionX + Math.round((tileWidth - item.width) / 2);
						}
					}
					switch(this._tileVerticalAlign)
					{
						case TiledRowsLayout.TILE_VERTICAL_ALIGN_JUSTIFY:
						{
							item.y = item.pivotY + positionY;
							item.height = tileHeight;
							break;
						}
						case TiledRowsLayout.TILE_VERTICAL_ALIGN_TOP:
						{
							item.y = item.pivotY + positionY;
							break;
						}
						case TiledRowsLayout.TILE_VERTICAL_ALIGN_BOTTOM:
						{
							item.y = item.pivotY + positionY + tileHeight - item.height;
							break;
						}
						default: //middle or unknown
						{
							item.y = item.pivotY + positionY + Math.round((tileHeight - item.height) / 2);
						}
					}
					if(this._useVirtualLayout)
					{
						this._discoveredItemsCache[discoveredItemsCachePushIndex] = item;
						discoveredItemsCachePushIndex++;
					}
				}
				positionX += tileWidth + this._horizontalGap;
				itemIndex++;
			}
			//align the last page
			if(this._paging != TiledRowsLayout.PAGING_NONE)
			{
				discoveredItems = this._useVirtualLayout ? this._discoveredItemsCache : items;
				discoveredItemsFirstIndex = this._useVirtualLayout ? 0 : (nextPageStartIndex - perPage);
				discoveredItemsLastIndex = this._useVirtualLayout ? (discoveredItems.length - 1) : (i - 1);
				this.applyHorizontalAlign(discoveredItems, discoveredItemsFirstIndex, discoveredItemsLastIndex, totalPageWidth, availablePageWidth);
				this.applyVerticalAlign(discoveredItems, discoveredItemsFirstIndex, discoveredItemsLastIndex, totalPageHeight, availablePageHeight);
				if(this._manageVisibility)
				{
					this.applyVisible(discoveredItems, discoveredItemsFirstIndex, discoveredItemsLastIndex,
						boundsX + scrollX, scrollX + availableWidth, boundsY + scrollY, scrollY + availableHeight);
				}
			}

			var totalWidth:number = totalPageWidth;
			if(availableWidth === availableWidth && //!isNaN
				this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
			{
				totalWidth = Math.ceil(itemCount / perPage) * availableWidth;
			}
			var totalHeight:number = positionY + tileHeight + this._paddingBottom;
			if(availableHeight === availableHeight) //!isNaN
			{
				if(this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
				{
					totalHeight = availableHeight;
				}
				else if(this._paging == TiledRowsLayout.PAGING_VERTICAL)
				{
					totalHeight = Math.ceil(itemCount / perPage) * availableHeight;
				}
			}
			if(availableWidth !== availableWidth) //isNaN
			{
				availableWidth = totalWidth;
			}
			if(availableHeight !== availableHeight) //isNaN
			{
				availableHeight = totalHeight;
			}
			if(availableWidth < minWidth)
			{
				availableWidth = minWidth;
			}
			if(availableHeight < minHeight)
			{
				availableHeight = minHeight;
			}

			if(this._paging == TiledRowsLayout.PAGING_NONE)
			{
				discoveredItems = this._useVirtualLayout ? this._discoveredItemsCache : items;
				discoveredItemsLastIndex = discoveredItems.length - 1;
				this.applyHorizontalAlign(discoveredItems, 0, discoveredItemsLastIndex, totalWidth, availableWidth);
				this.applyVerticalAlign(discoveredItems, 0, discoveredItemsLastIndex, totalHeight, availableHeight);
				if(this._manageVisibility)
				{
					this.applyVisible(discoveredItems, discoveredItemsFirstIndex, discoveredItemsLastIndex,
						boundsX + scrollX, scrollX + availableWidth, boundsY + scrollY, scrollY + availableHeight);
				}
			}
			this._discoveredItemsCache.length = 0;

			result.contentX = 0;
			result.contentY = 0;
			result.contentWidth = totalWidth;
			result.contentHeight = totalHeight;
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
			var needsWidth:boolean = explicitWidth !== explicitWidth; //isNaN;
			var needsHeight:boolean = explicitHeight !== explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				result.x = explicitWidth;
				result.y = explicitHeight;
				return result;
			}
			var boundsX:number = viewPortBounds ? viewPortBounds.x : 0;
			var boundsY:number = viewPortBounds ? viewPortBounds.y : 0;
			var minWidth:number = viewPortBounds ? viewPortBounds.minWidth : 0;
			var minHeight:number = viewPortBounds ? viewPortBounds.minHeight : 0;
			var maxWidth:number = viewPortBounds ? viewPortBounds.maxWidth : Number.POSITIVE_INFINITY;
			var maxHeight:number = viewPortBounds ? viewPortBounds.maxHeight : Number.POSITIVE_INFINITY;

			this.prepareTypicalItem();
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var tileWidth:number = calculatedTypicalItemWidth;
			var tileHeight:number = calculatedTypicalItemHeight;
			if(tileWidth < 0)
			{
				tileWidth = 0;
			}
			if(tileHeight < 0)
			{
				tileHeight = 0;
			}
			if(this._useSquareTiles)
			{
				if(tileWidth > tileHeight)
				{
					tileHeight = tileWidth;
				}
				else if(tileHeight > tileWidth)
				{
					tileWidth = tileHeight;
				}
			}

			var availableWidth:number = NaN;
			var availableHeight:number = NaN;

			var horizontalTileCount:number;
			if(explicitWidth === explicitWidth) //!isNaN
			{
				availableWidth = explicitWidth;
				horizontalTileCount = (explicitWidth - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			}
			else if(maxWidth === maxWidth && //!isNaN
				maxWidth < Number.POSITIVE_INFINITY)
			{
				availableWidth = maxWidth;
				horizontalTileCount = (maxWidth - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			}
			else if(this._requestedColumnCount > 0)
			{
				horizontalTileCount = this._requestedColumnCount;
				availableWidth = this._paddingLeft + this._paddingRight + ((tileWidth + this._horizontalGap) * horizontalTileCount) - this._horizontalGap;
			}
			else
			{
				horizontalTileCount = itemCount;
			}
			if(horizontalTileCount < 1)
			{
				horizontalTileCount = 1;
			}
			else if(this._requestedColumnCount > 0)
			{
				if(availableWidth !== availableWidth) //isNaN
				{
					horizontalTileCount = this._requestedColumnCount;
					availableWidth = horizontalTileCount * (tileWidth + this._horizontalGap) - this._horizontalGap - this._paddingLeft - this._paddingRight;
				}
				else if(horizontalTileCount > this._requestedColumnCount)
				{
					horizontalTileCount = this._requestedColumnCount;
				}
			}
			var verticalTileCount:number;
			if(explicitHeight === explicitHeight) //!isNaN
			{
				availableHeight = explicitHeight;
				verticalTileCount = (explicitHeight - this._paddingTop - this._paddingBottom + this._verticalGap) / (tileHeight + this._verticalGap);
			}
			else if(maxHeight === maxHeight && //!isNaN
				maxHeight < Number.POSITIVE_INFINITY)
			{
				availableHeight = maxHeight;
				verticalTileCount = (maxHeight - this._paddingTop - this._paddingBottom + this._verticalGap) / (tileHeight + this._verticalGap);
			}
			else
			{
				verticalTileCount = Math.ceil(itemCount / horizontalTileCount);
			}
			if(verticalTileCount < 1)
			{
				verticalTileCount = 1;
			}
			else if(this._requestedRowCount > 0)
			{
				if(availableHeight !== availableHeight) //isNaN
				{
					verticalTileCount = this._requestedRowCount;
					availableHeight = verticalTileCount * (tileHeight + this._verticalGap) - this._verticalGap - this._paddingTop - this._paddingBottom;
				}
				else if(verticalTileCount > this._requestedRowCount)
				{
					verticalTileCount = this._requestedRowCount;
				}
			}

			var totalPageWidth:number = horizontalTileCount * (tileWidth + this._horizontalGap) - this._horizontalGap + this._paddingLeft + this._paddingRight;

			var startX:number = boundsX + this._paddingLeft;
			var startY:number = boundsY + this._paddingTop;

			var perPage:number = horizontalTileCount * verticalTileCount;
			var pageIndex:number = 0;
			var nextPageStartIndex:number = perPage;
			var pageStartX:number = startX;
			var positionX:number = startX;
			var positionY:number = startY;
			for(var i:number = 0; i < itemCount; i++)
			{
				if(i != 0 && i % horizontalTileCount == 0)
				{
					positionX = pageStartX;
					positionY += tileHeight + this._verticalGap;
				}
				if(i == nextPageStartIndex)
				{
					pageIndex++;
					nextPageStartIndex += perPage;

					//we can use availableWidth and availableHeight here without
					//checking if they're NaN because we will never reach a
					//new page without them already being calculated.
					if(this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
					{
						positionX = pageStartX = startX + availableWidth * pageIndex;
						positionY = startY;
					}
					else if(this._paging == TiledRowsLayout.PAGING_VERTICAL)
					{
						positionY = startY + availableHeight * pageIndex;
					}
				}
			}

			var totalWidth:number = totalPageWidth;
			if(availableWidth === availableWidth && //!isNaN
				this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
			{
				totalWidth = Math.ceil(itemCount / perPage) * availableWidth;
			}
			var totalHeight:number = positionY + tileHeight + this._paddingBottom;
			if(availableHeight === availableHeight) //!isNaN
			{
				if(this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
				{
					totalHeight = availableHeight;
				}
				else if(this._paging == TiledRowsLayout.PAGING_VERTICAL)
				{
					totalHeight = Math.ceil(itemCount / perPage) * availableHeight;
				}
			}

			if(needsWidth)
			{
				var resultX:number = totalWidth;
				if(resultX < minWidth)
				{
					resultX = minWidth;
				}
				else if(resultX > maxWidth)
				{
					resultX = maxWidth;
				}
				result.x = resultX;
			}
			else
			{
				result.x = explicitWidth;
			}
			if(needsHeight)
			{
				var resultY:number = totalHeight;
				if(resultY < minHeight)
				{
					resultY = minHeight;
				}
				else if(resultY > maxHeight)
				{
					resultY = maxHeight;
				}
				result.y = resultY;
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

			if(this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
			{
				this.getVisibleIndicesAtScrollPositionWithHorizontalPaging(scrollX, scrollY, width, height, itemCount, result);
			}
			else if(this._paging == TiledRowsLayout.PAGING_VERTICAL)
			{
				this.getVisibleIndicesAtScrollPositionWithVerticalPaging(scrollX, scrollY, width, height, itemCount, result);
			}
			else
			{
				this.getVisibleIndicesAtScrollPositionWithoutPaging(scrollX, scrollY, width, height, itemCount, result);
			}

			return result;
		}

		/**
		 * @inheritDoc
		 */
		public getNearestScrollPositionForIndex(index:number, scrollX:number, scrollY:number, items:DisplayObject[],
			x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			return this.calculateScrollPositionForIndex(index, items, x, y, width, height, result, true, scrollX, scrollY);
		}

		/**
		 * @inheritDoc
		 */
		public getScrollPositionForIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			return this.calculateScrollPositionForIndex(index, items, x, y, width, height, result, false);
		}

		/**
		 * @private
		 */
		protected applyVisible(items:DisplayObject[], startIndex:number, endIndex:number, startX:number, endX:number, startY:number, endY:number):void
		{
			for(var i:number = startIndex; i <= endIndex; i++)
			{
				var item:DisplayObject = items[i];
				if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
				{
					continue;
				}
				var itemX:number = item.x - item.pivotX;
				var itemY:number = item.y - item.pivotY;
				item.visible = ((itemX + item.width) >= startX) && (itemX < endX) &&
					((itemY + item.height) >= startY) && (itemY < endY);
			}
		}

		/**
		 * @private
		 */
		protected applyHorizontalAlign(items:DisplayObject[], startIndex:number, endIndex:number, totalItemWidth:number, availableWidth:number):void
		{
			if(totalItemWidth >= availableWidth)
			{
				return;
			}
			var horizontalAlignOffsetX:number = 0;
			if(this._horizontalAlign == TiledRowsLayout.HORIZONTAL_ALIGN_RIGHT)
			{
				horizontalAlignOffsetX = availableWidth - totalItemWidth;
			}
			else if(this._horizontalAlign != TiledRowsLayout.HORIZONTAL_ALIGN_LEFT)
			{
				//we're going to default to center if we encounter an
				//unknown value
				horizontalAlignOffsetX = Math.round((availableWidth - totalItemWidth) / 2);
			}
			if(horizontalAlignOffsetX != 0)
			{
				for(var i:number = startIndex; i <= endIndex; i++)
				{
					var item:DisplayObject = items[i];
					if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
					{
						continue;
					}
					item.x += horizontalAlignOffsetX;
				}
			}
		}

		/**
		 * @private
		 */
		protected applyVerticalAlign(items:DisplayObject[], startIndex:number, endIndex:number, totalItemHeight:number, availableHeight:number):void
		{
			if(totalItemHeight >= availableHeight)
			{
				return;
			}
			var verticalAlignOffsetY:number = 0;
			if(this._verticalAlign == TiledRowsLayout.VERTICAL_ALIGN_BOTTOM)
			{
				verticalAlignOffsetY = availableHeight - totalItemHeight;
			}
			else if(this._verticalAlign == TiledRowsLayout.VERTICAL_ALIGN_MIDDLE)
			{
				verticalAlignOffsetY = Math.round((availableHeight - totalItemHeight) / 2);
			}
			if(verticalAlignOffsetY != 0)
			{
				for(var i:number = startIndex; i <= endIndex; i++)
				{
					var item:DisplayObject = items[i];
					if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
					{
						continue;
					}
					item.y += verticalAlignOffsetY;
				}
			}
		}

		/**
		 * @private
		 */
		protected getVisibleIndicesAtScrollPositionWithHorizontalPaging(scrollX:number, scrollY:number, width:number, height:number, itemCount:number, result:number[]):void
		{
			this.prepareTypicalItem();
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var tileWidth:number = calculatedTypicalItemWidth;
			var tileHeight:number = calculatedTypicalItemHeight;
			if(tileWidth < 0)
			{
				tileWidth = 0;
			}
			if(tileHeight < 0)
			{
				tileHeight = 0;
			}
			if(this._useSquareTiles)
			{
				if(tileWidth > tileHeight)
				{
					tileHeight = tileWidth;
				}
				else if(tileHeight > tileWidth)
				{
					tileWidth = tileHeight;
				}
			}
			var horizontalTileCount:number = (width - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			if(horizontalTileCount < 1)
			{
				horizontalTileCount = 1;
			}
			else if(this._requestedColumnCount > 0 && horizontalTileCount > this._requestedColumnCount)
			{
				horizontalTileCount = this._requestedColumnCount;
			}
			var verticalTileCount:number = (height - this._paddingTop - this._paddingBottom + this._verticalGap) / (tileHeight + this._verticalGap);
			if(verticalTileCount < 1)
			{
				verticalTileCount = 1;
			}
			var perPage:number = horizontalTileCount * verticalTileCount;
			var minimumItemCount:number = perPage + 2 * verticalTileCount;
			if(minimumItemCount > itemCount)
			{
				minimumItemCount = itemCount;
			}

			var startPageIndex:number = Math.round(scrollX / width);
			var minimum:number = startPageIndex * perPage;
			var totalRowWidth:number = horizontalTileCount * (tileWidth + this._horizontalGap) - this._horizontalGap;
			var leftSideOffset:number = 0;
			var rightSideOffset:number = 0;
			if(totalRowWidth < width)
			{
				if(this._horizontalAlign == TiledRowsLayout.HORIZONTAL_ALIGN_RIGHT)
				{
					leftSideOffset = width - this._paddingLeft - this._paddingRight - totalRowWidth;
					rightSideOffset = 0;
				}
				else if(this._horizontalAlign == TiledRowsLayout.HORIZONTAL_ALIGN_CENTER)
				{
					leftSideOffset = rightSideOffset = Math.round((width - this._paddingLeft - this._paddingRight - totalRowWidth) / 2);
				}
				else if(this._horizontalAlign == TiledRowsLayout.HORIZONTAL_ALIGN_LEFT)
				{
					leftSideOffset = 0;
					rightSideOffset = width - this._paddingLeft - this._paddingRight - totalRowWidth;
				}
			}
			var columnOffset:number = 0;
			var pageStartPosition:number = startPageIndex * width;
			var partialPageSize:number = scrollX - pageStartPosition;
			if(partialPageSize < 0)
			{
				partialPageSize = -partialPageSize - this._paddingRight - rightSideOffset;
				if(partialPageSize < 0)
				{
					partialPageSize = 0;
				}
				columnOffset = -Math.floor(partialPageSize / (tileWidth + this._horizontalGap)) - 1;
				minimum += -perPage + horizontalTileCount + columnOffset;
			}
			else if(partialPageSize > 0)
			{
				partialPageSize = partialPageSize - this._paddingLeft - leftSideOffset;
				if(partialPageSize < 0)
				{
					partialPageSize = 0;
				}
				columnOffset = Math.floor(partialPageSize / (tileWidth + this._horizontalGap));
				minimum += columnOffset;
			}
			if(minimum < 0)
			{
				minimum = 0;
				columnOffset = 0;
			}
			if(minimum + minimumItemCount >= itemCount)
			{
				var resultPushIndex:number = result.length;
				//an optimized path when we're on or near the last page
				minimum = itemCount - minimumItemCount;
				for(var i:number = minimum; i < itemCount; i++)
				{
					result[resultPushIndex] = i;
					resultPushIndex++;
				}
			}
			else
			{
				var rowIndex:number = 0;
				var columnIndex:number = (horizontalTileCount + columnOffset) % horizontalTileCount;
				var pageStart:number = int(minimum / perPage) * perPage;
				i = minimum;
				var resultLength:number = 0;
				do
				{
					if(i < itemCount)
					{
						result[resultLength] = i;
						resultLength++;
					}
					rowIndex++;
					if(rowIndex == verticalTileCount)
					{
						rowIndex = 0;
						columnIndex++;
						if(columnIndex == horizontalTileCount)
						{
							columnIndex = 0;
							pageStart += perPage;
						}
						i = pageStart + columnIndex - horizontalTileCount;
					}
					i += horizontalTileCount;
				}
				while(resultLength < minimumItemCount && pageStart < itemCount)
			}
		}

		/**
		 * @private
		 */
		protected getVisibleIndicesAtScrollPositionWithVerticalPaging(scrollX:number, scrollY:number, width:number, height:number, itemCount:number, result:number[]):void
		{
			this.prepareTypicalItem();
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var tileWidth:number = calculatedTypicalItemWidth;
			var tileHeight:number = calculatedTypicalItemHeight;
			if(tileWidth < 0)
			{
				tileWidth = 0;
			}
			if(tileHeight < 0)
			{
				tileHeight = 0;
			}
			if(this._useSquareTiles)
			{
				if(tileWidth > tileHeight)
				{
					tileHeight = tileWidth;
				}
				else if(tileHeight > tileWidth)
				{
					tileWidth = tileHeight;
				}
			}
			var horizontalTileCount:number = (width - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			if(horizontalTileCount < 1)
			{
				horizontalTileCount = 1;
			}
			else if(this._requestedColumnCount > 0 && horizontalTileCount > this._requestedColumnCount)
			{
				horizontalTileCount = this._requestedColumnCount;
			}
			var verticalTileCount:number = (height - this._paddingTop - this._paddingBottom + this._verticalGap) / (tileHeight + this._verticalGap);
			if(verticalTileCount < 1)
			{
				verticalTileCount = 1;
			}
			var perPage:number = horizontalTileCount * verticalTileCount;
			var minimumItemCount:number = perPage + 2 * horizontalTileCount;
			if(minimumItemCount > itemCount)
			{
				minimumItemCount = itemCount;
			}

			var startPageIndex:number = Math.round(scrollY / height);
			var minimum:number = startPageIndex * perPage;
			var totalColumnHeight:number = verticalTileCount * (tileHeight + this._verticalGap) - this._verticalGap;
			var topSideOffset:number = 0;
			var bottomSideOffset:number = 0;
			if(totalColumnHeight < height)
			{
				if(this._verticalAlign == TiledRowsLayout.VERTICAL_ALIGN_BOTTOM)
				{
					topSideOffset = height - this._paddingTop - this._paddingBottom - totalColumnHeight;
					bottomSideOffset = 0;
				}
				else if(this._verticalAlign == TiledRowsLayout.VERTICAL_ALIGN_MIDDLE)
				{
					topSideOffset = bottomSideOffset = Math.round((height - this._paddingTop - this._paddingBottom - totalColumnHeight) / 2);
				}
				else if(this._verticalAlign == TiledRowsLayout.VERTICAL_ALIGN_TOP)
				{
					topSideOffset = 0;
					bottomSideOffset = height - this._paddingTop - this._paddingBottom - totalColumnHeight;
				}
			}
			var rowOffset:number = 0;
			var pageStartPosition:number = startPageIndex * height;
			var partialPageSize:number = scrollY - pageStartPosition;
			if(partialPageSize < 0)
			{
				partialPageSize = -partialPageSize - this._paddingBottom - bottomSideOffset;
				if(partialPageSize < 0)
				{
					partialPageSize = 0;
				}
				rowOffset = -Math.floor(partialPageSize / (tileHeight + this._verticalGap)) - 1;
				minimum += horizontalTileCount * rowOffset;
			}
			else if(partialPageSize > 0)
			{
				partialPageSize = partialPageSize - this._paddingTop - topSideOffset;
				if(partialPageSize < 0)
				{
					partialPageSize = 0;
				}
				rowOffset = Math.floor(partialPageSize / (tileHeight + this._verticalGap));
				minimum += horizontalTileCount * rowOffset;
			}
			if(minimum < 0)
			{
				minimum = 0;
				rowOffset = 0;
			}


			var maximum:number = minimum + minimumItemCount;
			if(maximum > itemCount)
			{
				maximum = itemCount;
			}
			minimum = maximum - minimumItemCount;
			var resultPushIndex:number = result.length;
			for(var i:number = minimum; i < maximum; i++)
			{
				result[resultPushIndex] = i;
				resultPushIndex++;
			}
		}

		/**
		 * @private
		 */
		protected getVisibleIndicesAtScrollPositionWithoutPaging(scrollX:number, scrollY:number, width:number, height:number, itemCount:number, result:number[]):void
		{
			this.prepareTypicalItem();
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var tileWidth:number = calculatedTypicalItemWidth;
			var tileHeight:number = calculatedTypicalItemHeight;
			if(tileWidth < 0)
			{
				tileWidth = 0;
			}
			if(tileHeight < 0)
			{
				tileHeight = 0;
			}
			if(this._useSquareTiles)
			{
				if(tileWidth > tileHeight)
				{
					tileHeight = tileWidth;
				}
				else if(tileHeight > tileWidth)
				{
					tileWidth = tileHeight;
				}
			}
			var horizontalTileCount:number = (width - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			if(horizontalTileCount < 1)
			{
				horizontalTileCount = 1;
			}
			else if(this._requestedColumnCount > 0 && horizontalTileCount > this._requestedColumnCount)
			{
				horizontalTileCount = this._requestedColumnCount;
			}
			var verticalTileCount:number = Math.ceil((height + this._verticalGap) / (tileHeight + this._verticalGap)) + 1;
			var minimumItemCount:number = verticalTileCount * horizontalTileCount;
			if(minimumItemCount > itemCount)
			{
				minimumItemCount = itemCount;
			}
			var rowIndexOffset:number = 0;
			var totalRowHeight:number = Math.ceil(itemCount / horizontalTileCount) * (tileHeight + this._verticalGap) - this._verticalGap;
			if(totalRowHeight < height)
			{
				if(this._verticalAlign == TiledRowsLayout.VERTICAL_ALIGN_BOTTOM)
				{
					rowIndexOffset = Math.ceil((height - totalRowHeight) / (tileHeight + this._verticalGap));
				}
				else if(this._verticalAlign == TiledRowsLayout.VERTICAL_ALIGN_MIDDLE)
				{
					rowIndexOffset = Math.ceil((height - totalRowHeight) / (tileHeight + this._verticalGap) / 2);
				}
			}
			var rowIndex:number = -rowIndexOffset + Math.floor((scrollY - this._paddingTop + this._verticalGap) / (tileHeight + this._verticalGap));
			var minimum:number = rowIndex * horizontalTileCount;
			if(minimum < 0)
			{
				minimum = 0;
			}
			var maximum:number = minimum + minimumItemCount;
			if(maximum > itemCount)
			{
				maximum = itemCount;
			}
			minimum = maximum - minimumItemCount;
			var resultPushIndex:number = result.length;
			for(var i:number = minimum; i < maximum; i++)
			{
				result[resultPushIndex] = i;
				resultPushIndex++;
			}
		}

		/**
		 * @private
		 */
		protected validateItems(items:DisplayObject[]):void
		{
			var itemCount:number = items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
				{
					continue;
				}
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
			}
		}

		/**
		 * @private
		 */
		protected prepareTypicalItem():void
		{
			if(!this._typicalItem)
			{
				return;
			}
			if(this._resetTypicalItemDimensionsOnMeasure)
			{
				this._typicalItem.width = this._typicalItemWidth;
				this._typicalItem.height = this._typicalItemHeight;
			}
			if(this._typicalItem instanceof IValidating)
			{
				IValidating(this._typicalItem).validate();
			}
		}

		/**
		 * @inheritDoc
		 */
		public calculateScrollPositionForIndex(index:number, items:DisplayObject[],
			x:number, y:number, width:number, height:number, result:Point = null,
			nearest:boolean = false, scrollX:number = 0, scrollY:number = 0):Point
		{
			if(!result)
			{
				result = new Point();
			}

			if(this._useVirtualLayout)
			{
				this.prepareTypicalItem();
				var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			var itemCount:number = items.length;
			var tileWidth:number = this._useVirtualLayout ? calculatedTypicalItemWidth : 0;
			var tileHeight:number = this._useVirtualLayout ? calculatedTypicalItemHeight : 0;
			//a virtual layout assumes that all items are the same size as
			//the typical item, so we don't need to measure every item in
			//that case
			if(!this._useVirtualLayout)
			{
				for(var i:number = 0; i < itemCount; i++)
				{
					var item:DisplayObject = items[i];
					if(!item)
					{
						continue;
					}
					if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
					{
						continue;
					}
					var itemWidth:number = item.width;
					var itemHeight:number = item.height;
					if(itemWidth > tileWidth)
					{
						tileWidth = itemWidth;
					}
					if(itemHeight > tileHeight)
					{
						tileHeight = itemHeight;
					}
				}
			}
			if(tileWidth < 0)
			{
				tileWidth = 0;
			}
			if(tileHeight < 0)
			{
				tileHeight = 0;
			}
			if(this._useSquareTiles)
			{
				if(tileWidth > tileHeight)
				{
					tileHeight = tileWidth;
				}
				else if(tileHeight > tileWidth)
				{
					tileWidth = tileHeight;
				}
			}
			var horizontalTileCount:number = (width - this._paddingLeft - this._paddingRight + this._horizontalGap) / (tileWidth + this._horizontalGap);
			if(horizontalTileCount < 1)
			{
				horizontalTileCount = 1;
			}
			else if(this._requestedColumnCount > 0 && horizontalTileCount > this._requestedColumnCount)
			{
				horizontalTileCount = this._requestedColumnCount;
			}
			if(this._paging != TiledRowsLayout.PAGING_NONE)
			{
				var verticalTileCount:number = (height - this._paddingTop - this._paddingBottom + this._verticalGap) / (tileHeight + this._verticalGap);
				if(verticalTileCount < 1)
				{
					verticalTileCount = 1;
				}
				var perPage:number = horizontalTileCount * verticalTileCount;
				var pageIndex:number = index / perPage;
				if(this._paging == TiledRowsLayout.PAGING_HORIZONTAL)
				{
					result.x = pageIndex * width;
					result.y = 0;
				}
				else
				{
					result.x = 0;
					result.y = pageIndex * height;
				}
			}
			else
			{
				var resultY:number = this._paddingTop + ((tileHeight + this._verticalGap) * int(index / horizontalTileCount));
				if(nearest)
				{
					var bottomPosition:number = resultY - (height - tileHeight);
					if(scrollY >= bottomPosition && scrollY <= resultY)
					{
						//keep the current scroll position because the item is already
						//fully visible
						resultY = scrollY;
					}
					else
					{
						var topDifference:number = Math.abs(resultY - scrollY);
						var bottomDifference:number = Math.abs(bottomPosition - scrollY);
						if(bottomDifference < topDifference)
						{
							resultY = bottomPosition;
						}
					}
				}
				else
				{
					resultY -= Math.round((height - tileHeight) / 2);
				}
				result.x = 0;
				result.y = resultY;
			}
			return result;
		}
	}
}
