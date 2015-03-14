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
	 * A layout with multiple columns of equal width where items may have
	 * variable heights. Items are added to the layout in order, but they may be
	 * added to any of the available columns. The layout selects the column
	 * where the column's height plus the item's height will result in the
	 * smallest possible total height.
	 *
	 * @see ../../../help/waterfall-layout.html How to use WaterfallLayout with Feathers containers
	 */
	export class WaterfallLayout extends EventDispatcher implements IVariableVirtualLayout
	{
		/**
		 * The items will be aligned to the left of the bounds.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * The items will be aligned to the center of the bounds.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * The items will be aligned to the right of the bounds.
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
		 * The horizontal space, in pixels, between columns.
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
		 * The vertical space, in pixels, between items in a column.
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
		 * The space, in pixels, that appears on top, above the items.
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
		 * The minimum space, in pixels, to the right of the items.
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
		 * The space, in pixels, that appears on the bottom, below the items.
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
		 * The minimum space, in pixels, to the left of the items.
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
		protected _horizontalAlign:string = WaterfallLayout.HORIZONTAL_ALIGN_CENTER;

		/*[Inspectable(type="String",enumeration="left,center,right")]*/
		/**
		 * The alignment of the items horizontally, on the x-axis.
		 *
		 * @default WaterfallLayout.HORIZONTAL_ALIGN_CENTER
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
		protected _requestedColumnCount:number = 0;

		/**
		 * Requests that the layout uses a specific number of columns, if
		 * possible. Set to <code>0</code> to calculate the maximum of columns
		 * that will fit in the available space.
		 *
		 * <p>If the view port's explicit or maximum width is not large enough
		 * to fit the requested number of columns, it will use fewer. If the
		 * view port doesn't have an explicit width and the maximum width is
		 * equal to <code>Number.POSITIVE_INFINITY</code>, the width will be
		 * calculated automatically to fit the exact number of requested
		 * columns.</p>
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
		protected _hasVariableItemDimensions:boolean = true;

		/**
		 * When the layout is virtualized, and this value is true, the items may
		 * have variable height values. If false, the items will all share the
		 * same height value with the typical item.
		 *
		 * @default true
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
		 * @inheritDoc
		 */
		public get requiresLayoutOnScroll():boolean
		{
			return this._useVirtualLayout;
		}

		/**
		 * @private
		 */
		protected _heightCache:any[] = [];

		/**
		 * @inheritDoc
		 */
		public layout(items:DisplayObject[], viewPortBounds:ViewPortBounds = null, result:LayoutBoundsResult = null):LayoutBoundsResult
		{
			var boundsX:number = viewPortBounds ? viewPortBounds.x : 0;
			var boundsY:number = viewPortBounds ? viewPortBounds.y : 0;
			var minWidth:number = viewPortBounds ? viewPortBounds.minWidth : 0;
			var minHeight:number = viewPortBounds ? viewPortBounds.minHeight : 0;
			var maxWidth:number = viewPortBounds ? viewPortBounds.maxWidth : Number.POSITIVE_INFINITY;
			var maxHeight:number = viewPortBounds ? viewPortBounds.maxHeight : Number.POSITIVE_INFINITY;
			var explicitWidth:number = viewPortBounds ? viewPortBounds.explicitWidth : NaN;
			var explicitHeight:number = viewPortBounds ? viewPortBounds.explicitHeight : NaN;

			var needsWidth:boolean = explicitWidth !== explicitWidth; //isNaN
			var needsHeight:boolean = explicitHeight !== explicitHeight; //isNaN

			if(this._useVirtualLayout)
			{
				//if the layout is virtualized, we'll need the dimensions of the
				//typical item so that we have fallback values when an item is null
				if(this._typicalItem instanceof IValidating)
				{
					IValidating(this._typicalItem).validate();
				}
				var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			var columnWidth:number = 0;
			if(this._useVirtualLayout)
			{
				columnWidth = calculatedTypicalItemWidth;
			}
			else if(items.length > 0)
			{
				var item:DisplayObject = items[0];
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
				columnWidth = item.width;
			}
			var availableWidth:number = explicitWidth;
			if(needsWidth)
			{
				if(maxWidth < Number.POSITIVE_INFINITY)
				{
					availableWidth = maxWidth;
				}
				else if(this._requestedColumnCount > 0)
				{
					availableWidth = ((columnWidth + this._horizontalGap) * this._requestedColumnCount) - this._horizontalGap;
				}
				else
				{
					availableWidth = columnWidth;
				}
				availableWidth += this._paddingLeft + this._paddingRight;
				if(availableWidth < minWidth)
				{
					availableWidth = minWidth;
				}
				else if(availableWidth > maxWidth)
				{
					availableWidth = maxWidth;
				}
			}
			var columnCount:number = int((availableWidth + this._horizontalGap - this._paddingLeft - this._paddingRight) / (columnWidth + this._horizontalGap));
			if(this._requestedColumnCount > 0 && columnCount > this._requestedColumnCount)
			{
				columnCount = this._requestedColumnCount;
			}
			else if(columnCount < 1)
			{
				columnCount = 1;
			}
			var columnHeights:number[] = new Array<number>();
			for(var i:number = 0; i < columnCount; i++)
			{
				columnHeights[i] = this._paddingTop;
			}
			columnHeights.fixed = true;

			var horizontalAlignOffset:number = 0;
			if(this._horizontalAlign == WaterfallLayout.HORIZONTAL_ALIGN_RIGHT)
			{
				horizontalAlignOffset = (availableWidth - this._paddingLeft - this._paddingRight) - ((columnCount * (columnWidth + this._horizontalGap)) - this._horizontalGap);
			}
			else if(this._horizontalAlign == WaterfallLayout.HORIZONTAL_ALIGN_CENTER)
			{
				horizontalAlignOffset = Math.round(((availableWidth - this._paddingLeft - this._paddingRight) - ((columnCount * (columnWidth + this._horizontalGap)) - this._horizontalGap)) / 2);
			}

			var itemCount:number = items.length;
			var targetColumnIndex:number = 0;
			var targetColumnHeight:number = columnHeights[targetColumnIndex];
			for(i = 0; i < itemCount; i++)
			{
				item = items[i];
				if(this._useVirtualLayout && this._hasVariableItemDimensions)
				{
					var cachedHeight:number = this._heightCache[i];
				}
				if(this._useVirtualLayout && !item)
				{
					if(!this._hasVariableItemDimensions ||
						cachedHeight !== cachedHeight) //isNaN
					{
						//if all items must have the same height, we will
						//use the height of the typical item (calculatedTypicalItemHeight).

						//if items may have different heights, we first check
						//the cache for a height value. if there isn't one, then
						//we'll use calculatedTypicalItemHeight as a fallback.
						var itemHeight:number = calculatedTypicalItemHeight;
					}
					else
					{
						itemHeight = cachedHeight;
					}
				}
				else
				{
					if(item instanceof this.ILayoutDisplayObject)
					{
						var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
						if(!layoutItem.includeInLayout)
						{
							continue;
						}
					}
					if(item instanceof IValidating)
					{
						IValidating(item).validate();
					}
					//first, scale the items to fit into the column width
					var scaleFactor:number = columnWidth / item.width;
					item.width *= scaleFactor;
					if(item instanceof IValidating)
					{
						//if we changed the width, we need to recalculate the
						//height.
						IValidating(item).validate();
					}
					if(this._useVirtualLayout)
					{
						if(this._hasVariableItemDimensions)
						{
							itemHeight = item.height;
							if(itemHeight != cachedHeight)
							{
								//update the cache if needed. this will notify
								//the container that the virtualized layout has
								//changed, and it the view port may need to be
								//re-measured.
								this._heightCache[i] = itemHeight;
								this.dispatchEventWith(Event.CHANGE);
							}
						}
						else
						{
							item.height = itemHeight = calculatedTypicalItemHeight;
						}
					}
					else
					{
						itemHeight = item.height;
					}
				}
				targetColumnHeight += itemHeight;
				for(var j:number = 0; j < columnCount; j++)
				{
					if(j === targetColumnIndex)
					{
						continue;
					}
					var columnHeight:number = columnHeights[j] + itemHeight;
					if(columnHeight < targetColumnHeight)
					{
						targetColumnIndex = j;
						targetColumnHeight = columnHeight;
					}
				}
				if(item)
				{
					item.x = item.pivotX + boundsX + horizontalAlignOffset + this._paddingLeft + targetColumnIndex * (columnWidth + this._horizontalGap);
					item.y = item.pivotY + boundsY + targetColumnHeight - itemHeight;
				}
				targetColumnHeight += this._verticalGap;
				columnHeights[targetColumnIndex] = targetColumnHeight;
			}
			var totalHeight:number = columnHeights[0];
			for(i = 1; i < columnCount; i++)
			{
				columnHeight = columnHeights[i];
				if(columnHeight > totalHeight)
				{
					totalHeight = columnHeight;
				}
			}
			totalHeight -= this._verticalGap;
			totalHeight += this._paddingBottom;
			if(totalHeight < 0)
			{
				totalHeight = 0;
			}

			var availableHeight:number = explicitHeight;
			if(needsHeight)
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

			//finally, we want to calculate the result so that the container
			//can use it to adjust its viewport and determine the minimum and
			//maximum scroll positions (if needed)
			if(!result)
			{
				result = new LayoutBoundsResult();
			}
			result.contentX = 0;
			result.contentWidth = availableWidth;
			result.contentY = 0;
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

			if(this._typicalItem instanceof IValidating)
			{
				IValidating(this._typicalItem).validate();
			}
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var columnWidth:number = calculatedTypicalItemWidth;
			var availableWidth:number = explicitWidth;
			if(needsWidth)
			{
				if(maxWidth < Number.POSITIVE_INFINITY)
				{
					availableWidth = maxWidth;
				}
				else if(this._requestedColumnCount > 0)
				{
					availableWidth = ((columnWidth + this._horizontalGap) * this._requestedColumnCount) - this._horizontalGap;
				}
				else
				{
					availableWidth = columnWidth;
				}
				availableWidth += this._paddingLeft + this._paddingRight;
				if(availableWidth < minWidth)
				{
					availableWidth = minWidth;
				}
				else if(availableWidth > maxWidth)
				{
					availableWidth = maxWidth;
				}
			}
			var columnCount:number = int((availableWidth + this._horizontalGap - this._paddingLeft - this._paddingRight) / (columnWidth + this._horizontalGap));
			if(this._requestedColumnCount > 0 && columnCount > this._requestedColumnCount)
			{
				columnCount = this._requestedColumnCount;
			}
			else if(columnCount < 1)
			{
				columnCount = 1;
			}

			if(needsWidth)
			{
				result.x = this._paddingLeft + this._paddingRight + (columnCount * (columnWidth + this._horizontalGap)) - this._horizontalGap;
			}
			else
			{
				result.x = explicitWidth;
			}

			if(needsHeight)
			{
				if(this._hasVariableItemDimensions)
				{
					var columnHeights:number[] = new Array<number>();
					for(var i:number = 0; i < columnCount; i++)
					{
						columnHeights[i] = this._paddingTop;
					}
					columnHeights.fixed = true;

					var targetColumnIndex:number = 0;
					var targetColumnHeight:number = columnHeights[targetColumnIndex];
					for(i = 0; i < itemCount; i++)
					{
						if(this._hasVariableItemDimensions)
						{
							var itemHeight:number = this._heightCache[i];
							if(itemHeight !== itemHeight) //isNaN
							{
								itemHeight = calculatedTypicalItemHeight;
							}
						}
						else
						{
							itemHeight = calculatedTypicalItemHeight;
						}
						targetColumnHeight += itemHeight;
						for(var j:number = 0; j < columnCount; j++)
						{
							if(j === targetColumnIndex)
							{
								continue;
							}
							var columnHeight:number = columnHeights[j] + itemHeight;
							if(columnHeight < targetColumnHeight)
							{
								targetColumnIndex = j;
								targetColumnHeight = columnHeight;
							}
						}
						targetColumnHeight += this._verticalGap;
						columnHeights[targetColumnIndex] = targetColumnHeight;
					}
					var totalHeight:number = columnHeights[0];
					for(i = 1; i < columnCount; i++)
					{
						columnHeight = columnHeights[i];
						if(columnHeight > totalHeight)
						{
							totalHeight = columnHeight;
						}
					}
					totalHeight -= this._verticalGap;
					totalHeight += this._paddingBottom;
					if(totalHeight < 0)
					{
						totalHeight = 0;
					}
					if(totalHeight < minHeight)
					{
						totalHeight = minHeight;
					}
					else if(totalHeight > maxHeight)
					{
						totalHeight = maxHeight;
					}
					result.y = totalHeight;
				}
				else
				{
					result.y = this._paddingTop + this._paddingBottom + (Math.ceil(itemCount / columnCount) * (calculatedTypicalItemHeight + this._verticalGap)) - this._verticalGap;
				}
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

			if(this._typicalItem instanceof IValidating)
			{
				IValidating(this._typicalItem).validate();
			}
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var columnWidth:number = calculatedTypicalItemWidth;
			var columnCount:number = int((width + this._horizontalGap - this._paddingLeft - this._paddingRight) / (columnWidth + this._horizontalGap));
			if(this._requestedColumnCount > 0 && columnCount > this._requestedColumnCount)
			{
				columnCount = this._requestedColumnCount;
			}
			else if(columnCount < 1)
			{
				columnCount = 1;
			}
			var resultLastIndex:number = 0;
			if(this._hasVariableItemDimensions)
			{
				var columnHeights:number[] = new Array<number>();
				for(var i:number = 0; i < columnCount; i++)
				{
					columnHeights[i] = this._paddingTop;
				}
				columnHeights.fixed = true;

				var maxPositionY:number = scrollY + height;
				var targetColumnIndex:number = 0;
				var targetColumnHeight:number = columnHeights[targetColumnIndex];
				for(i = 0; i < itemCount; i++)
				{
					if(this._hasVariableItemDimensions)
					{
						var itemHeight:number = this._heightCache[i];
						if(itemHeight !== itemHeight) //isNaN
						{
							itemHeight = calculatedTypicalItemHeight;
						}
					}
					else
					{
						itemHeight = calculatedTypicalItemHeight;
					}
					targetColumnHeight += itemHeight;
					for(var j:number = 0; j < columnCount; j++)
					{
						if(j === targetColumnIndex)
						{
							continue;
						}
						var columnHeight:number = columnHeights[j] + itemHeight;
						if(columnHeight < targetColumnHeight)
						{
							targetColumnIndex = j;
							targetColumnHeight = columnHeight;
						}
					}
					if(targetColumnHeight > scrollY && (targetColumnHeight - itemHeight) < maxPositionY)
					{
						result[resultLastIndex] = i;
						resultLastIndex++;
					}
					targetColumnHeight += this._verticalGap;
					columnHeights[targetColumnIndex] = targetColumnHeight;
				}
				return result;
			}
			//this case can be optimized because we know that every item has
			//the same height

			//we add one extra here because the first item renderer in view may
			//be partially obscured, which would reveal an extra item renderer.
			var maxVisibleTypicalItemCount:number = Math.ceil(height / (calculatedTypicalItemHeight + this._verticalGap)) + 1;
			//we're calculating the minimum and maximum rows
			var minimum:number = (scrollY - this._paddingTop) / (calculatedTypicalItemHeight + this._verticalGap);
			if(minimum < 0)
			{
				minimum = 0;
			}
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
			for(i = minimum; i <= maximum; i++)
			{
				for(j = 0; j < columnCount; j++)
				{
					var index:number = (i * columnCount) + j;
					if(index >= 0 && i < itemCount)
					{
						result[resultLastIndex] = index;
					}
					else if(index < 0)
					{
						result[resultLastIndex] = itemCount + index;
					}
					else if(index >= itemCount)
					{
						result[resultLastIndex] = index - itemCount;
					}
					resultLastIndex++;
				}
			}
			return result;
		}

		/**
		 * @inheritDoc
		 */
		public resetVariableVirtualCache():void
		{
			this._heightCache.length = 0;
		}

		/**
		 * @inheritDoc
		 */
		public resetVariableVirtualCacheAtIndex(index:number, item:DisplayObject = null):void
		{
			delete this._heightCache[index];
			if(item)
			{
				this._heightCache[index] = item.height;
				this.dispatchEventWith(Event.CHANGE);
			}
		}

		/**
		 * @inheritDoc
		 */
		public addToVariableVirtualCacheAtIndex(index:number, item:DisplayObject = null):void
		{
			var heightValue:any = item ? item.height : undefined;
			this._heightCache.splice(index, 0, heightValue);
		}

		/**
		 * @inheritDoc
		 */
		public removeFromVariableVirtualCacheAtIndex(index:number):void
		{
			this._heightCache.splice(index, 1);
		}

		/**
		 * @inheritDoc
		 */
		public getNearestScrollPositionForIndex(index:number, scrollX:number, scrollY:number, items:DisplayObject[], x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			var maxScrollY:number = this.calculateMaxScrollYOfIndex(index, items, x, y, width, height);

			if(this._useVirtualLayout)
			{
				if(this._hasVariableItemDimensions)
				{
					var itemHeight:number = this._heightCache[index];
					if(itemHeight !== itemHeight) //isNaN
					{
						itemHeight = this._typicalItem.height;
					}
				}
				else
				{
					itemHeight = this._typicalItem.height;
				}
			}
			else
			{
				itemHeight = items[index].height;
			}

			if(!result)
			{
				result = new Point();
			}
			result.x = 0;

			var bottomPosition:number = maxScrollY - (height - itemHeight);
			if(scrollY >= bottomPosition && scrollY <= maxScrollY)
			{
				//keep the current scroll position because the item is already
				//fully visible
				result.y = scrollY;
			}
			else
			{
				var topDifference:number = Math.abs(maxScrollY - scrollY);
				var bottomDifference:number = Math.abs(bottomPosition - scrollY);
				if(bottomDifference < topDifference)
				{
					result.y = bottomPosition;
				}
				else
				{
					result.y = maxScrollY;
				}
			}

			return result;
		}

		/**
		 * @inheritDoc
		 */
		public getScrollPositionForIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			var maxScrollY:number = this.calculateMaxScrollYOfIndex(index, items, x, y, width, height);

			if(this._useVirtualLayout)
			{
				if(this._hasVariableItemDimensions)
				{
					var itemHeight:number = this._heightCache[index];
					if(itemHeight !== itemHeight) //isNaN
					{
						itemHeight = this._typicalItem.height;
					}
				}
				else
				{
					itemHeight = this._typicalItem.height;
				}
			}
			else
			{
				itemHeight = items[index].height;
			}

			if(!result)
			{
				result = new Point();
			}
			result.x = 0;
			result.y = maxScrollY - Math.round((height - itemHeight) / 2);
			return result;
		}

		/**
		 * @private
		 */
		protected calculateMaxScrollYOfIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number):number
		{
			if(items.length == 0)
			{
				return 0;
			}

			if(this._useVirtualLayout)
			{
				//if the layout is virtualized, we'll need the dimensions of the
				//typical item so that we have fallback values when an item is null
				if(this._typicalItem instanceof IValidating)
				{
					IValidating(this._typicalItem).validate();
				}
				var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			var columnWidth:number = 0;
			if(this._useVirtualLayout)
			{
				columnWidth = calculatedTypicalItemWidth;
			}
			else if(items.length > 0)
			{
				var item:DisplayObject = items[0];
				if(item instanceof IValidating)
				{
					IValidating(item).validate()
				}
				columnWidth = item.width;
			}

			var columnCount:number = int((width + this._horizontalGap - this._paddingLeft - this._paddingRight) / (columnWidth + this._horizontalGap));
			if(this._requestedColumnCount > 0 && columnCount > this._requestedColumnCount)
			{
				columnCount = this._requestedColumnCount;
			}
			else if(columnCount < 1)
			{
				columnCount = 1;
			}
			var columnHeights:number[] = new Array<number>();
			for(var i:number = 0; i < columnCount; i++)
			{
				columnHeights[i] = this._paddingTop;
			}
			columnHeights.fixed = true;

			var itemCount:number = items.length;
			var targetColumnIndex:number = 0;
			var targetColumnHeight:number = columnHeights[targetColumnIndex];
			for(i = 0; i < itemCount; i++)
			{
				item = items[i];
				if(this._useVirtualLayout && this._hasVariableItemDimensions)
				{
					var cachedHeight:number = this._heightCache[i];
				}
				if(this._useVirtualLayout && !item)
				{
					if(!this._hasVariableItemDimensions ||
						cachedHeight !== cachedHeight) //isNaN
					{
						//if all items must have the same height, we will
						//use the height of the typical item (calculatedTypicalItemHeight).

						//if items may have different heights, we first check
						//the cache for a height value. if there isn't one, then
						//we'll use calculatedTypicalItemHeight as a fallback.
						var itemHeight:number = calculatedTypicalItemHeight;
					}
					else
					{
						itemHeight = cachedHeight;
					}
				}
				else
				{
					if(item instanceof this.ILayoutDisplayObject)
					{
						var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
						if(!layoutItem.includeInLayout)
						{
							continue;
						}
					}
					if(item instanceof IValidating)
					{
						IValidating(item).validate();
					}
					//first, scale the items to fit into the column width
					var scaleFactor:number = columnWidth / item.width;
					item.width *= scaleFactor;
					if(item instanceof IValidating)
					{
						IValidating(item).validate();
					}
					if(this._useVirtualLayout)
					{
						if(this._hasVariableItemDimensions)
						{
							itemHeight = item.height;
							if(itemHeight != cachedHeight)
							{
								this._heightCache[i] = itemHeight;
								this.dispatchEventWith(Event.CHANGE);
							}
						}
						else
						{
							item.height = itemHeight = calculatedTypicalItemHeight;
						}
					}
					else
					{
						itemHeight = item.height;
					}
				}
				targetColumnHeight += itemHeight;
				for(var j:number = 0; j < columnCount; j++)
				{
					if(j === targetColumnIndex)
					{
						continue;
					}
					var columnHeight:number = columnHeights[j] + itemHeight;
					if(columnHeight < targetColumnHeight)
					{
						targetColumnIndex = j;
						targetColumnHeight = columnHeight;
					}
				}
				if(i === index)
				{
					return targetColumnHeight - itemHeight;
				}
				targetColumnHeight += this._verticalGap;
				columnHeights[targetColumnIndex] = targetColumnHeight;
			}
			var totalHeight:number = columnHeights[0];
			for(i = 1; i < columnCount; i++)
			{
				columnHeight = columnHeights[i];
				if(columnHeight > totalHeight)
				{
					totalHeight = columnHeight;
				}
			}
			totalHeight -= this._verticalGap;
			totalHeight += this._paddingBottom;
			//subtracting the height gives us the maximum scroll position
			totalHeight -= height;
			if(totalHeight < 0)
			{
				totalHeight = 0;
			}
			return totalHeight;
		}
	}
}
