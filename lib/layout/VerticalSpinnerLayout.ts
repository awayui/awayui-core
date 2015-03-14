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
	 * Positions items from top to bottom in a single column and repeats
	 * infinitely.
	 *
	 * <p><strong>Beta Layout:</strong> This is a new layout, and its APIs
	 * may need some changes between now and the next version of Feathers to
	 * account for overlooked requirements or other issues. Upgrading to future
	 * versions of Feathers may involve manual changes to your code that uses
	 * this layout. The
	 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>
	 * will not go into effect until this component's status is upgraded from
	 * beta to stable.</p>
	 *
	 * @see ../../../help/vertical-spinner-layout.html How to use VerticalSpinnerLayout with the Feathers List component
	 */
	export class VerticalSpinnerLayout extends EventDispatcher implements ISpinnerLayout, ITrimmedVirtualLayout
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
		 * The items will fill the width of the bounds.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_JUSTIFY:string = "justify";

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
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingLeft</code>, but the other padding values may be
		 * different.
		 *
		 * @default 0
		 *
		 * @see #paddingRight
		 * @see #paddingLeft
		 */
		public get padding():number
		{
			return this._paddingLeft;
		}

		/**
		 * @private
		 */
		public set padding(value:number)
		{
			this.paddingRight = value;
			this.paddingLeft = value;
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
		protected _horizontalAlign:string = VerticalSpinnerLayout.HORIZONTAL_ALIGN_JUSTIFY;

		/*[Inspectable(type="String",enumeration="left,center,right,justify")]*/
		/**
		 * The alignment of the items horizontally, on the x-axis.
		 *
		 * @default VerticalLayout.HORIZONTAL_ALIGN_JUSTIFY
		 *
		 * @see #HORIZONTAL_ALIGN_LEFT
		 * @see #HORIZONTAL_ALIGN_CENTER
		 * @see #HORIZONTAL_ALIGN_RIGHT
		 * @see #HORIZONTAL_ALIGN_JUSTIFY
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
		protected _requestedRowCount:number = 0;

		/**
		 * Requests that the layout set the view port dimensions to display a
		 * specific number of rows (plus gaps and padding), if possible. If the
		 * explicit height of the view port is set, then this value will be
		 * ignored. If the view port's minimum and/or maximum height are set,
		 * the actual number of visible rows may be adjusted to meet those
		 * requirements. Set this value to <code>0</code> to display as many
		 * rows as possible.
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
		 * @copy feathers.layout.ISpinnerLayout#snapInterval
		 */
		public get snapInterval():number
		{
			return this._typicalItem.height + this._gap;
		}

		/**
		 * @inheritDoc
		 */
		public get requiresLayoutOnScroll():boolean
		{
			return true;
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
				this.prepareTypicalItem(explicitWidth - this._paddingLeft - this._paddingRight);
				var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			if(!this._useVirtualLayout || this._horizontalAlign != VerticalSpinnerLayout.HORIZONTAL_ALIGN_JUSTIFY ||
				explicitWidth !== explicitWidth) //isNaN
			{
				//in some cases, we may need to validate all of the items so
				//that we can use their dimensions below.
				this.validateItems(items, explicitWidth - this._paddingLeft - this._paddingRight, explicitHeight);
			}

			//this section prepares some variables needed for the following loop
			var maxItemWidth:number = this._useVirtualLayout ? calculatedTypicalItemWidth : 0;
			var positionY:number = boundsY;
			var gap:number = this._gap;
			var itemCount:number = items.length;
			var totalItemCount:number = itemCount;
			if(this._useVirtualLayout)
			{
				//if the layout is virtualized, and the items all have the same
				//height, we can make our loops smaller by skipping some items
				//at the beginning and end. this improves performance.
				totalItemCount += this._beforeVirtualizedItemCount + this._afterVirtualizedItemCount;
				positionY += (this._beforeVirtualizedItemCount * (calculatedTypicalItemHeight + gap));
			}
			//this cache is used to save non-null items in virtual layouts. by
			//using a smaller array, we can improve performance by spending less
			//time in the upcoming loops.
			this._discoveredItemsCache.length = 0;
			var discoveredItemsCacheLastIndex:number = 0;

			//this first loop sets the y position of items, and it calculates
			//the total height of all items
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				if(item)
				{
					//we get here if the item isn't null. it is never null if
					//the layout isn't virtualized.
					if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
					{
						continue;
					}
					item.y = item.pivotY + positionY;
					var itemWidth:number = item.width;
					//we compare with > instead of Math.max() because the rest
					//arguments on Math.max() cause extra garbage collection and
					//hurt performance
					if(itemWidth > maxItemWidth)
					{
						//we need to know the maximum width of the items in the
						//case where the width of the view port needs to be
						//calculated by the layout.
						maxItemWidth = itemWidth;
					}
					if(this._useVirtualLayout)
					{
						this._discoveredItemsCache[discoveredItemsCacheLastIndex] = item;
						discoveredItemsCacheLastIndex++;
					}
				}
				positionY += calculatedTypicalItemHeight + gap;
			}
			if(this._useVirtualLayout)
			{
				//finish the final calculation of the y position so that it can
				//be used for the total height of all items
				positionY += (this._afterVirtualizedItemCount * (calculatedTypicalItemHeight + gap));
			}

			//this array will contain all items that are not null. see the
			//comment above where the discoveredItemsCache is initialized for
			//details about why this is important.
			var discoveredItems:DisplayObject[] = this._useVirtualLayout ? this._discoveredItemsCache : items;
			var discoveredItemCount:number = discoveredItems.length;

			var totalWidth:number = maxItemWidth + this._paddingLeft + this._paddingRight;
			//the available width is the width of the viewport. if the explicit
			//width is NaN, we need to calculate the viewport width ourselves
			//based on the total width of all items.
			var availableWidth:number = explicitWidth;
			if(availableWidth !== availableWidth) //isNaN
			{
				availableWidth = totalWidth;
				if(availableWidth < minWidth)
				{
					availableWidth = minWidth;
				}
				else if(availableWidth > maxWidth)
				{
					availableWidth = maxWidth;
				}
			}

			//this is the total height of all items
			var totalHeight:number = positionY - gap - boundsY;
			//the available height is the height of the viewport. if the explicit
			//height is NaN, we need to calculate the viewport height ourselves
			//based on the total height of all items.
			var availableHeight:number = explicitHeight;
			if(availableHeight !== availableHeight) //isNaN
			{
				availableHeight = totalHeight;
				if(this._requestedRowCount > 0)
				{
					availableHeight = this._requestedRowCount * (calculatedTypicalItemHeight + gap) - gap;
				}
				else
				{
					availableHeight = totalHeight;
				}
				if(availableHeight < minHeight)
				{
					availableHeight = minHeight;
				}
				else if(availableHeight > maxHeight)
				{
					availableHeight = maxHeight;
				}
			}

			var canRepeatItems:boolean = totalHeight > availableHeight;
			if(canRepeatItems)
			{
				totalHeight += gap;
			}

			//in this section, we handle vertical alignment. the selected item
			//needs to be centered vertically.
			var verticalAlignOffsetY:number = Math.round((availableHeight - calculatedTypicalItemHeight) / 2);
			if(!canRepeatItems)
			{
				totalHeight += 2 * verticalAlignOffsetY;
			}
			for(i = 0; i < discoveredItemCount; i++)
			{
				item = discoveredItems[i];
				if(item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout)
				{
					continue;
				}
				item.y += verticalAlignOffsetY;
			}

			for(i = 0; i < discoveredItemCount; i++)
			{
				item = discoveredItems[i];
				var layoutItem:ILayoutDisplayObject = <ILayoutDisplayObject>item ;
				if(layoutItem && !layoutItem.includeInLayout)
				{
					continue;
				}

				//if we're repeating items, then we may need to adjust the y
				//position of some items so that they appear inside the viewport
				if(canRepeatItems)
				{
					var adjustedScrollY:number = scrollY - verticalAlignOffsetY;
					if(adjustedScrollY > 0)
					{
						item.y += totalHeight * int((adjustedScrollY + availableHeight) / totalHeight);
						if(item.y >= (scrollY + availableHeight))
						{
							item.y -= totalHeight;
						}
					}
					else if(adjustedScrollY < 0)
					{
						item.y += totalHeight * (int(adjustedScrollY / totalHeight) - 1);
						if((item.y + item.height) < scrollY)
						{
							item.y += totalHeight;
						}
					}
				}

				//in this section, we handle horizontal alignment
				if(this._horizontalAlign == VerticalSpinnerLayout.HORIZONTAL_ALIGN_JUSTIFY)
				{
					//if we justify items horizontally, we can skip percent width
					item.x = item.pivotX + boundsX + this._paddingLeft;
					item.width = availableWidth - this._paddingLeft - this._paddingRight;
				}
				else
				{
					//handle all other horizontal alignment values (we handled
					//justify already). the x position of all items is set.
					switch(this._horizontalAlign)
					{
						case VerticalSpinnerLayout.HORIZONTAL_ALIGN_RIGHT:
						{
							item.x = item.pivotX + boundsX + availableWidth - this._paddingRight - item.width;
							break;
						}
						case VerticalSpinnerLayout.HORIZONTAL_ALIGN_CENTER:
						{
							//round to the nearest pixel when dividing by 2 to
							//align in the center
							item.x = item.pivotX + boundsX + this._paddingLeft + Math.round((availableWidth - this._paddingLeft - this._paddingRight - item.width) / 2);
							break;
						}
						default: //left
						{
							item.x = item.pivotX + boundsX + this._paddingLeft;
						}
					}
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
			result.contentWidth = this._horizontalAlign == VerticalSpinnerLayout.HORIZONTAL_ALIGN_JUSTIFY ? availableWidth : totalWidth;
			if(canRepeatItems)
			{
				result.contentY = Number.NEGATIVE_INFINITY;
				result.contentHeight = Number.POSITIVE_INFINITY;
			}
			else
			{
				result.contentY = 0;
				result.contentHeight = totalHeight;
			}
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

			this.prepareTypicalItem(explicitWidth - this._paddingLeft - this._paddingRight);
			var calculatedTypicalItemWidth:number = this._typicalItem ? this._typicalItem.width : 0;
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			var gap:number = this._gap;
			var positionY:number = 0;

			var maxItemWidth:number = calculatedTypicalItemWidth;
			positionY += ((calculatedTypicalItemHeight + gap) * itemCount);
			positionY -= gap;

			if(needsWidth)
			{
				var resultWidth:number = maxItemWidth + this._paddingLeft + this._paddingRight;
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
				if(this._requestedRowCount > 0)
				{
					var resultHeight:number = (calculatedTypicalItemHeight + gap) * this._requestedRowCount - gap;
				}
				else
				{
					resultHeight = positionY;
				}
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

			this.prepareTypicalItem(width - this._paddingLeft - this._paddingRight);
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			var gap:number = this._gap;

			var resultLastIndex:number = 0;
			//we add one extra here because the first item renderer in view may
			//be partially obscured, which would reveal an extra item renderer.
			var maxVisibleTypicalItemCount:number = Math.ceil(height / (calculatedTypicalItemHeight + gap)) + 1;

			var totalItemHeight:number = itemCount * (calculatedTypicalItemHeight + gap) - gap;

			scrollY -= Math.round((height - calculatedTypicalItemHeight) / 2);

			var canRepeatItems:boolean = totalItemHeight > height;
			if(canRepeatItems)
			{
				scrollY %= totalItemHeight;
				if(scrollY < 0)
				{
					scrollY += totalItemHeight;
				}
				var minimum:number = scrollY / (calculatedTypicalItemHeight + gap);
				var maximum:number = minimum + maxVisibleTypicalItemCount;
			}
			else
			{
				minimum = scrollY / (calculatedTypicalItemHeight + gap);
				if(minimum < 0)
				{
					minimum = 0;
				}
				//if we're scrolling beyond the final item, we should keep the
				//indices consistent so that items aren't destroyed and
				//recreated unnecessarily
				maximum = minimum + maxVisibleTypicalItemCount;
				if(maximum >= itemCount)
				{
					maximum = itemCount - 1;
				}
				minimum = maximum - maxVisibleTypicalItemCount;
				if(minimum < 0)
				{
					minimum = 0;
				}
			}
			for(var i:number = minimum; i <= maximum; i++)
			{
				if(!canRepeatItems || (i >= 0 && i < itemCount))
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

		/**
		 * @inheritDoc
		 */
		public getNearestScrollPositionForIndex(index:number, scrollX:number, scrollY:number, items:DisplayObject[],
			x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			return this.getScrollPositionForIndex(index, items, x, y, width, height, result);
		}

		/**
		 * @inheritDoc
		 */
		public getScrollPositionForIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			this.prepareTypicalItem(width - this._paddingLeft - this._paddingRight);
			var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;

			if(!result)
			{
				result = new Point();
			}
			result.x = 0;
			result.y = calculatedTypicalItemHeight * index;

			return result;
		}

		/**
		 * @private
		 */
		protected validateItems(items:DisplayObject[], justifyWidth:number, distributedHeight:number):void
		{
			//if the alignment is justified, then we want to set the width of
			//each item before validating because setting one dimension may
			//cause the other dimension to change, and that will invalidate the
			//layout if it happens after validation, causing more invalidation
			var isJustified:boolean = this._horizontalAlign == VerticalSpinnerLayout.HORIZONTAL_ALIGN_JUSTIFY;
			var mustSetJustifyWidth:boolean = isJustified && justifyWidth === justifyWidth; //!isNaN
			var itemCount:number = items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				if(!item || (item instanceof this.ILayoutDisplayObject && !this.ILayoutDisplayObject(item).includeInLayout))
				{
					continue;
				}
				if(mustSetJustifyWidth)
				{
					item.width = justifyWidth;
				}
				else if(isJustified && item instanceof IFeathersControl)
				{
					//the alignment is justified, but we don't yet have a width
					//to use, so we need to ensure that we accurately measure
					//the items instead of using an old justified width that may
					//be wrong now!
					item.width = NaN;
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
		protected prepareTypicalItem(justifyWidth:number):void
		{
			if(!this._typicalItem)
			{
				return;
			}
			if(this._horizontalAlign == VerticalSpinnerLayout.HORIZONTAL_ALIGN_JUSTIFY &&
				justifyWidth === justifyWidth) //!isNaN
			{
				this._typicalItem.width = justifyWidth;
			}
			else if(this._resetTypicalItemDimensionsOnMeasure)
			{
				this._typicalItem.width = this._typicalItemWidth;
			}
			if(this._resetTypicalItemDimensionsOnMeasure)
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
		protected calculateMaxScrollYOfIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number):number
		{
			if(this._useVirtualLayout)
			{
				this.prepareTypicalItem(width - this._paddingLeft - this._paddingRight);
				var calculatedTypicalItemHeight:number = this._typicalItem ? this._typicalItem.height : 0;
			}

			var positionY:number = y;
			var gap:number = this._gap;
			var startIndexOffset:number = 0;
			var endIndexOffset:number = 0;
			var itemCount:number = items.length;
			var totalItemCount:number = itemCount;
			if(this._useVirtualLayout)
			{
				totalItemCount += this._beforeVirtualizedItemCount + this._afterVirtualizedItemCount;
				if(index < this._beforeVirtualizedItemCount)
				{
					//this makes it skip the loop below
					startIndexOffset = index + 1;
				}
				else
				{
					startIndexOffset = this._beforeVirtualizedItemCount;
					endIndexOffset = index - items.length - this._beforeVirtualizedItemCount + 1;
					if(endIndexOffset < 0)
					{
						endIndexOffset = 0;
					}
					positionY += (endIndexOffset * (calculatedTypicalItemHeight + gap));
				}
				positionY += (startIndexOffset * (calculatedTypicalItemHeight + gap));
			}
			index -= (startIndexOffset + endIndexOffset);
			for(var i:number = 0; i < index; i++)
			{
				positionY += calculatedTypicalItemHeight + gap;
			}
			return positionY;
		}
	}
}
