/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.layout
{
	import IFeathersControl = feathers.core.IFeathersControl;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import Point = flash.geom.Point;

	import DisplayObject = starling.display.DisplayObject;
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
	 * Positions and sizes items by anchoring their edges (or center points)
	 * to their parent container or to other items.
	 *
	 * @see ../../../help/anchor-layout How to use AnchorLayout with Feathers containers
	 * @see AnchorLayoutData
	 */
	export class AnchorLayout extends EventDispatcher implements ILayout
	{
		/**
		 * @private
		 */
		protected static CIRCULAR_REFERENCE_ERROR:string = "It is impossible to create this layout due to a circular reference in the AnchorLayoutData.";

		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * @private
		 */
		protected _helperVector1:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected _helperVector2:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @inheritDoc
		 */
		public get requiresLayoutOnScroll():boolean
		{
			return false;
		}

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

			var viewPortWidth:number = explicitWidth;
			var viewPortHeight:number = explicitHeight;

			var needsWidth:boolean = explicitWidth !== explicitWidth; //isNaN
			var needsHeight:boolean = explicitHeight !== explicitHeight; //isNaN
			if(needsWidth || needsHeight)
			{
				this.validateItems(items, true);
				this.measureViewPort(items, viewPortWidth, viewPortHeight, AnchorLayout.HELPER_POINT);
				if(needsWidth)
				{
					viewPortWidth = Math.min(maxWidth, Math.max(minWidth, AnchorLayout.HELPER_POINT.x));
				}
				if(needsHeight)
				{
					viewPortHeight = Math.min(maxHeight, Math.max(minHeight, AnchorLayout.HELPER_POINT.y));
				}
			}
			else
			{
				this.validateItems(items, false);
			}

			this.layoutWithBounds(items, boundsX, boundsY, viewPortWidth, viewPortHeight);

			this.measureContent(items, viewPortWidth, viewPortHeight, AnchorLayout.HELPER_POINT);

			if(!result)
			{
				result = new LayoutBoundsResult();
			}
			result.contentWidth = AnchorLayout.HELPER_POINT.x;
			result.contentHeight = AnchorLayout.HELPER_POINT.y;
			result.viewPortWidth = viewPortWidth;
			result.viewPortHeight = viewPortHeight;
			return result;
		}

		/**
		 * @inheritDoc
		 */
		public getNearestScrollPositionForIndex(index:number, scrollX:number, scrollY:number, items:DisplayObject[], x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			return this.getScrollPositionForIndex(index, items, x, y, width, height, result);
		}

		/**
		 * @inheritDoc
		 */
		public getScrollPositionForIndex(index:number, items:DisplayObject[], x:number, y:number, width:number, height:number, result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}
			result.x = 0;
			result.y = 0;
			return result;
		}

		/**
		 * @private
		 */
		protected measureViewPort(items:DisplayObject[], viewPortWidth:number, viewPortHeight:number, result:Point = null):Point
		{
			this._helperVector1.length = 0;
			this._helperVector2.length = 0;
			AnchorLayout.HELPER_POINT.x = 0;
			AnchorLayout.HELPER_POINT.y = 0;
			var mainVector:DisplayObject[] = items;
			var otherVector:DisplayObject[] = this._helperVector1;
			this.measureVector(items, otherVector, AnchorLayout.HELPER_POINT);
			var currentLength:number = otherVector.length;
			while(currentLength > 0)
			{
				if(otherVector == this._helperVector1)
				{
					mainVector = this._helperVector1;
					otherVector = this._helperVector2;
				}
				else
				{
					mainVector = this._helperVector2;
					otherVector = this._helperVector1;
				}
				this.measureVector(mainVector, otherVector, AnchorLayout.HELPER_POINT);
				var oldLength:number = currentLength;
				currentLength = otherVector.length;
				if(oldLength == currentLength)
				{
					this._helperVector1.length = 0;
					this._helperVector2.length = 0;
					throw new IllegalOperationError(AnchorLayout.CIRCULAR_REFERENCE_ERROR);
				}
			}
			this._helperVector1.length = 0;
			this._helperVector2.length = 0;

			if(!result)
			{
				result = AnchorLayout.HELPER_POINT.clone();
			}
			return result;
		}

		/**
		 * @private
		 */
		protected measureVector(items:DisplayObject[], unpositionedItems:DisplayObject[], result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}

			unpositionedItems.length = 0;
			var itemCount:number = items.length;
			var pushIndex:number = 0;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				var layoutData:AnchorLayoutData;
				if(item instanceof this.ILayoutDisplayObject)
				{
					var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
					if(!layoutItem.includeInLayout)
					{
						continue;
					}
					layoutData = <AnchorLayoutData>layoutItem.layoutData ;
				}
				var isReadyForLayout:boolean = !layoutData || this.isReadyForLayout(layoutData, i, items, unpositionedItems);
				if(!isReadyForLayout)
				{
					unpositionedItems[pushIndex] = item;
					pushIndex++;
					continue;
				}

				this.measureItem(item, result);
			}

			return result;
		}

		/**
		 * @private
		 */
		protected measureItem(item:DisplayObject, result:Point):void
		{
			var maxX:number = result.x;
			var maxY:number = result.y;
			var isAnchored:boolean = false;
			if(item instanceof this.ILayoutDisplayObject)
			{
				var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
				var layoutData:AnchorLayoutData = <AnchorLayoutData>layoutItem.layoutData ;
				if(layoutData)
				{
					var measurement:number = this.measureItemHorizontally(layoutItem, layoutData);
					if(measurement > maxX)
					{
						maxX = measurement;
					}
					measurement = this.measureItemVertically(layoutItem, layoutData);
					if(measurement > maxY)
					{
						maxY = measurement;
					}
					isAnchored = true;
				}
			}
			if(!isAnchored)
			{
				measurement = item.x - item.pivotX + item.width;
				if(measurement > maxX)
				{
					maxX = measurement;
				}
				measurement = item.y - item.pivotY + item.height;
				if(measurement > maxY)
				{
					maxY = measurement;
				}
			}

			result.x = maxX;
			result.y = maxY;
		}

		/**
		 * @private
		 */
		protected measureItemHorizontally(item:ILayoutDisplayObject, layoutData:AnchorLayoutData):number
		{
			var itemWidth:number = item.width;
			if(layoutData && item instanceof IFeathersControl)
			{
				var percentWidth:number = layoutData.percentWidth;
				//for some reason, if we don't call a function right here,
				//compiling with the flex 4.6 SDK will throw a VerifyError
				//for a stack overflow.
				//we could change the === check back to !isNaN() instead, but
				//isNaN() can allocate an object, so we should call a different
				//function without allocation.
				this.doNothing();
				if(percentWidth === percentWidth) //!isNaN
				{
					itemWidth = IFeathersControl(item).minWidth;
				}
			}
			var displayItem:DisplayObject = DisplayObject(item);
			var left:number = this.getLeftOffset(displayItem);
			var right:number = this.getRightOffset(displayItem);
			return itemWidth + left + right;
		}

		/**
		 * @private
		 */
		protected measureItemVertically(item:ILayoutDisplayObject, layoutData:AnchorLayoutData):number
		{
			var itemHeight:number = item.height;
			if(layoutData && item instanceof IFeathersControl)
			{
				var percentHeight:number = layoutData.percentHeight;
				//for some reason, if we don't call a function right here,
				//compiling with the flex 4.6 SDK will throw a VerifyError
				//for a stack overflow.
				//we could change the === check back to !isNaN() instead, but
				//isNaN() can allocate an object, so we should call a different
				//function without allocation.
				this.doNothing();
				if(percentHeight === percentHeight) //!isNaN
				{
					itemHeight = IFeathersControl(item).minHeight;
				}
			}
			var displayItem:DisplayObject = DisplayObject(item);
			var top:number = this.getTopOffset(displayItem);
			var bottom:number = this.getBottomOffset(displayItem);
			return itemHeight + top + bottom;
		}

		/**
		 * @private
		 * This function is here to work around a bug in the Flex 4.6 SDK
		 * compiler. For explanation, see the places where it gets called.
		 */
		protected doNothing():void {}

		/**
		 * @private
		 */
		protected getTopOffset(item:DisplayObject):number
		{
			if(item instanceof this.ILayoutDisplayObject)
			{
				var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
				var layoutData:AnchorLayoutData = <AnchorLayoutData>layoutItem.layoutData ;
				if(layoutData)
				{
					var top:number = layoutData.top;
					var hasTopPosition:boolean = top === top; //!isNaN
					if(hasTopPosition)
					{
						var topAnchorDisplayObject:DisplayObject = layoutData.topAnchorDisplayObject;
						if(topAnchorDisplayObject)
						{
							top += topAnchorDisplayObject.height + this.getTopOffset(topAnchorDisplayObject);
						}
						else
						{
							return top;
						}
					}
					else
					{
						top = 0;
					}
					var bottom:number = layoutData.bottom;
					var hasBottomPosition:boolean = bottom === bottom; //!isNaN
					if(hasBottomPosition)
					{
						var bottomAnchorDisplayObject:DisplayObject = layoutData.bottomAnchorDisplayObject;
						if(bottomAnchorDisplayObject)
						{
							top = Math.max(top, -bottomAnchorDisplayObject.height - bottom + this.getTopOffset(bottomAnchorDisplayObject));
						}
					}
					var verticalCenter:number = layoutData.verticalCenter;
					var hasVerticalCenterPosition:boolean = verticalCenter === verticalCenter; //!isNaN
					if(hasVerticalCenterPosition)
					{
						var verticalCenterAnchorDisplayObject:DisplayObject = layoutData.verticalCenterAnchorDisplayObject;
						if(verticalCenterAnchorDisplayObject)
						{
							var verticalOffset:number = verticalCenter - Math.round((item.height - verticalCenterAnchorDisplayObject.height) / 2);
							top = Math.max(top, verticalOffset + this.getTopOffset(verticalCenterAnchorDisplayObject));
						}
						else if(verticalCenter > 0)
						{
							return verticalCenter * 2;
						}
					}
					return top;
				}
			}
			return 0;
		}

		/**
		 * @private
		 */
		protected getRightOffset(item:DisplayObject):number
		{
			if(item instanceof this.ILayoutDisplayObject)
			{
				var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
				var layoutData:AnchorLayoutData = <AnchorLayoutData>layoutItem.layoutData ;
				if(layoutData)
				{
					var right:number = layoutData.right;
					var hasRightPosition:boolean = right === right; //!isNaN
					if(hasRightPosition)
					{
						var rightAnchorDisplayObject:DisplayObject = layoutData.rightAnchorDisplayObject;
						if(rightAnchorDisplayObject)
						{
							right += rightAnchorDisplayObject.width + this.getRightOffset(rightAnchorDisplayObject);
						}
						else
						{
							return right;
						}
					}
					else
					{
						right = 0;
					}
					var left:number = layoutData.left;
					var hasLeftPosition:boolean = left === left; //!isNaN
					if(hasLeftPosition)
					{
						var leftAnchorDisplayObject:DisplayObject = layoutData.leftAnchorDisplayObject;
						if(leftAnchorDisplayObject)
						{
							right = Math.max(right, -leftAnchorDisplayObject.width - left + this.getRightOffset(leftAnchorDisplayObject));
						}
					}
					var horizontalCenter:number = layoutData.horizontalCenter;
					var hasHorizontalCenterPosition:boolean = horizontalCenter === horizontalCenter; //!isNaN
					if(hasHorizontalCenterPosition)
					{
						var horizontalCenterAnchorDisplayObject:DisplayObject = layoutData.horizontalCenterAnchorDisplayObject;
						if(horizontalCenterAnchorDisplayObject)
						{
							var horizontalOffset:number = -horizontalCenter - Math.round((item.width - horizontalCenterAnchorDisplayObject.width) / 2);
							right = Math.max(right, horizontalOffset + this.getRightOffset(horizontalCenterAnchorDisplayObject));
						}
						else if(horizontalCenter < 0)
						{
							return -horizontalCenter * 2;
						}
					}
					return right;
				}
			}
			return 0;
		}

		/**
		 * @private
		 */
		protected getBottomOffset(item:DisplayObject):number
		{
			if(item instanceof this.ILayoutDisplayObject)
			{
				var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
				var layoutData:AnchorLayoutData = <AnchorLayoutData>layoutItem.layoutData ;
				if(layoutData)
				{
					var bottom:number = layoutData.bottom;
					var hasBottomPosition:boolean = bottom === bottom; //!isNaN
					if(hasBottomPosition)
					{
						var bottomAnchorDisplayObject:DisplayObject = layoutData.bottomAnchorDisplayObject;
						if(bottomAnchorDisplayObject)
						{
							bottom += bottomAnchorDisplayObject.height + this.getBottomOffset(bottomAnchorDisplayObject);
						}
						else
						{
							return bottom;
						}
					}
					else
					{
						bottom = 0;
					}
					var top:number = layoutData.top;
					var hasTopPosition:boolean = top === top; //!isNaN
					if(hasTopPosition)
					{
						var topAnchorDisplayObject:DisplayObject = layoutData.topAnchorDisplayObject;
						if(topAnchorDisplayObject)
						{
							bottom = Math.max(bottom, -topAnchorDisplayObject.height - top + this.getBottomOffset(topAnchorDisplayObject));
						}
					}
					var verticalCenter:number = layoutData.verticalCenter;
					var hasVerticalCenterPosition:boolean = verticalCenter === verticalCenter; //!isNaN
					if(hasVerticalCenterPosition)
					{
						var verticalCenterAnchorDisplayObject:DisplayObject = layoutData.verticalCenterAnchorDisplayObject;
						if(verticalCenterAnchorDisplayObject)
						{
							var verticalOffset:number = -verticalCenter - Math.round((item.height - verticalCenterAnchorDisplayObject.height) / 2);
							bottom = Math.max(bottom, verticalOffset + this.getBottomOffset(verticalCenterAnchorDisplayObject));
						}
						else if(verticalCenter < 0)
						{
							return -verticalCenter * 2;
						}
					}
					return bottom;
				}
			}
			return 0;
		}

		/**
		 * @private
		 */
		protected getLeftOffset(item:DisplayObject):number
		{
			if(item instanceof this.ILayoutDisplayObject)
			{
				var layoutItem:ILayoutDisplayObject = this.ILayoutDisplayObject(item);
				var layoutData:AnchorLayoutData = <AnchorLayoutData>layoutItem.layoutData ;
				if(layoutData)
				{
					var left:number = layoutData.left;
					var hasLeftPosition:boolean = left === left; //!isNaN
					if(hasLeftPosition)
					{
						var leftAnchorDisplayObject:DisplayObject = layoutData.leftAnchorDisplayObject;
						if(leftAnchorDisplayObject)
						{
							left += leftAnchorDisplayObject.width + this.getLeftOffset(leftAnchorDisplayObject);
						}
						else
						{
							return left;
						}
					}
					else
					{
						left = 0;
					}
					var right:number = layoutData.right;
					var hasRightPosition:boolean = right === right; //!isNaN;
					if(hasRightPosition)
					{
						var rightAnchorDisplayObject:DisplayObject = layoutData.rightAnchorDisplayObject;
						if(rightAnchorDisplayObject)
						{
							left = Math.max(left, -rightAnchorDisplayObject.width - right + this.getLeftOffset(rightAnchorDisplayObject));
						}
					}
					var horizontalCenter:number = layoutData.horizontalCenter;
					var hasHorizontalCenterPosition:boolean = horizontalCenter === horizontalCenter; //!isNaN
					if(hasHorizontalCenterPosition)
					{
						var horizontalCenterAnchorDisplayObject:DisplayObject = layoutData.horizontalCenterAnchorDisplayObject;
						if(horizontalCenterAnchorDisplayObject)
						{
							var horizontalOffset:number = horizontalCenter - Math.round((item.width - horizontalCenterAnchorDisplayObject.width) / 2);
							left = Math.max(left, horizontalOffset + this.getLeftOffset(horizontalCenterAnchorDisplayObject));
						}
						else if(horizontalCenter > 0)
						{
							return horizontalCenter * 2;
						}
					}
					return left;
				}
			}
			return 0;
		}

		/**
		 * @private
		 */
		protected layoutWithBounds(items:DisplayObject[], x:number, y:number, width:number, height:number):void
		{
			this._helperVector1.length = 0;
			this._helperVector2.length = 0;
			var mainVector:DisplayObject[] = items;
			var otherVector:DisplayObject[] = this._helperVector1;
			this.layoutVector(items, otherVector, x, y, width, height);
			var currentLength:number = otherVector.length;
			while(currentLength > 0)
			{
				if(otherVector == this._helperVector1)
				{
					mainVector = this._helperVector1;
					otherVector = this._helperVector2;
				}
				else
				{
					mainVector = this._helperVector2;
					otherVector = this._helperVector1;
				}
				this.layoutVector(mainVector, otherVector, x, y, width, height);
				var oldLength:number = currentLength;
				currentLength = otherVector.length;
				if(oldLength == currentLength)
				{
					this._helperVector1.length = 0;
					this._helperVector2.length = 0;
					throw new IllegalOperationError(AnchorLayout.CIRCULAR_REFERENCE_ERROR);
				}
			}
			this._helperVector1.length = 0;
			this._helperVector2.length = 0;
		}

		/**
		 * @private
		 */
		protected layoutVector(items:DisplayObject[], unpositionedItems:DisplayObject[], boundsX:number, boundsY:number, viewPortWidth:number, viewPortHeight:number):void
		{
			unpositionedItems.length = 0;
			var itemCount:number = items.length;
			var pushIndex:number = 0;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				var layoutItem:ILayoutDisplayObject = <ILayoutDisplayObject>item ;
				if(!layoutItem || !layoutItem.includeInLayout)
				{
					continue;
				}
				var layoutData:AnchorLayoutData = <AnchorLayoutData>layoutItem.layoutData ;
				if(!layoutData)
				{
					continue;
				}

				var isReadyForLayout:boolean = this.isReadyForLayout(layoutData, i, items, unpositionedItems);
				if(!isReadyForLayout)
				{
					unpositionedItems[pushIndex] = item;
					pushIndex++;
					continue;
				}
				this.positionHorizontally(layoutItem, layoutData, boundsX, boundsY, viewPortWidth, viewPortHeight);
				this.positionVertically(layoutItem, layoutData, boundsX, boundsY, viewPortWidth, viewPortHeight);
			}
		}

		/**
		 * @private
		 */
		protected positionHorizontally(item:ILayoutDisplayObject, layoutData:AnchorLayoutData, boundsX:number, boundsY:number, viewPortWidth:number, viewPortHeight:number):void
		{
			var uiItem:IFeathersControl = <IFeathersControl>item ;
			var percentWidth:number = layoutData.percentWidth;
			var checkWidth:boolean = false;
			if(percentWidth === percentWidth) //!isNaN
			{
				if(percentWidth > 100)
				{
					percentWidth = 100;
				}
				var itemWidth:number = percentWidth * 0.01 * viewPortWidth;
				if(uiItem)
				{
					var minWidth:number = uiItem.minWidth;
					var maxWidth:number = uiItem.maxWidth;
					if(itemWidth < minWidth)
					{
						itemWidth = minWidth;
					}
					else if(itemWidth > maxWidth)
					{
						itemWidth = maxWidth;
					}
				}
				item.width = itemWidth;
				checkWidth = true;
			}
			var left:number = layoutData.left;
			var hasLeftPosition:boolean = left === left; //!isNaN
			if(hasLeftPosition)
			{
				var leftAnchorDisplayObject:DisplayObject = layoutData.leftAnchorDisplayObject;
				if(leftAnchorDisplayObject)
				{
					item.x = item.pivotX + leftAnchorDisplayObject.x - leftAnchorDisplayObject.pivotX + leftAnchorDisplayObject.width + left;
				}
				else
				{
					item.x = item.pivotX + boundsX + left;
				}
			}
			var horizontalCenter:number = layoutData.horizontalCenter;
			var hasHorizontalCenterPosition:boolean = horizontalCenter === horizontalCenter; //!isNaN
			var right:number = layoutData.right;
			var hasRightPosition:boolean = right === right; //!isNaN
			if(hasRightPosition)
			{
				var rightAnchorDisplayObject:DisplayObject = layoutData.rightAnchorDisplayObject;
				if(hasLeftPosition)
				{
					var leftRightWidth:number = viewPortWidth;
					if(rightAnchorDisplayObject)
					{
						leftRightWidth = rightAnchorDisplayObject.x - rightAnchorDisplayObject.pivotX;
					}
					if(leftAnchorDisplayObject)
					{
						leftRightWidth -= (leftAnchorDisplayObject.x - leftAnchorDisplayObject.pivotX + leftAnchorDisplayObject.width);
					}
					checkWidth = false;
					item.width = leftRightWidth - right - left;
				}
				else if(hasHorizontalCenterPosition)
				{
					var horizontalCenterAnchorDisplayObject:DisplayObject = layoutData.horizontalCenterAnchorDisplayObject;
					var xPositionOfCenter:number;
					if(horizontalCenterAnchorDisplayObject)
					{
						xPositionOfCenter = horizontalCenterAnchorDisplayObject.x - horizontalCenterAnchorDisplayObject.pivotX + Math.round(horizontalCenterAnchorDisplayObject.width / 2) + horizontalCenter;
					}
					else
					{
						xPositionOfCenter = Math.round(viewPortWidth / 2) + horizontalCenter;
					}
					var xPositionOfRight:number;
					if(rightAnchorDisplayObject)
					{
						xPositionOfRight = rightAnchorDisplayObject.x - rightAnchorDisplayObject.pivotX - right;
					}
					else
					{
						xPositionOfRight = viewPortWidth - right;
					}
					checkWidth = false;
					item.width = 2 * (xPositionOfRight - xPositionOfCenter);
					item.x = item.pivotX + viewPortWidth - right - item.width;
				}
				else
				{
					if(rightAnchorDisplayObject)
					{
						item.x = item.pivotX + rightAnchorDisplayObject.x - rightAnchorDisplayObject.pivotX - item.width - right;
					}
					else
					{
						item.x = item.pivotX + boundsX + viewPortWidth - right - item.width;
					}
				}
			}
			else if(hasHorizontalCenterPosition)
			{
				horizontalCenterAnchorDisplayObject = layoutData.horizontalCenterAnchorDisplayObject;
				if(horizontalCenterAnchorDisplayObject)
				{
					xPositionOfCenter = horizontalCenterAnchorDisplayObject.x - horizontalCenterAnchorDisplayObject.pivotX + Math.round(horizontalCenterAnchorDisplayObject.width / 2) + horizontalCenter;
				}
				else
				{
					xPositionOfCenter = Math.round(viewPortWidth / 2) + horizontalCenter;
				}

				if(hasLeftPosition)
				{
					checkWidth = false;
					item.width = 2 * (xPositionOfCenter - item.x + item.pivotX);
				}
				else
				{
					item.x = item.pivotX + xPositionOfCenter - Math.round(item.width / 2);
				}
			}
			if(checkWidth)
			{
				var itemX:number = item.x;
				itemWidth = item.width;
				if(itemX + itemWidth > viewPortWidth)
				{
					itemWidth = viewPortWidth - itemX;
					if(uiItem)
					{
						if(itemWidth < minWidth)
						{
							itemWidth = minWidth;
						}
					}
					item.width = itemWidth;
				}
			}
		}

		/**
		 * @private
		 */
		protected positionVertically(item:ILayoutDisplayObject, layoutData:AnchorLayoutData, boundsX:number, boundsY:number, viewPortWidth:number, viewPortHeight:number):void
		{
			var uiItem:IFeathersControl = <IFeathersControl>item ;
			var percentHeight:number = layoutData.percentHeight;
			var checkHeight:boolean = false;
			if(percentHeight === percentHeight) //!isNaN
			{
				if(percentHeight > 100)
				{
					percentHeight = 100;
				}
				var itemHeight:number = percentHeight * 0.01 * viewPortHeight;
				if(uiItem)
				{
					var minHeight:number = uiItem.minHeight;
					var maxHeight:number = uiItem.maxHeight;
					if(itemHeight < minHeight)
					{
						itemHeight = minHeight;
					}
					else if(itemHeight > maxHeight)
					{
						itemHeight = maxHeight;
					}
				}
				item.height = itemHeight;
				checkHeight = true;
			}
			var top:number = layoutData.top;
			var hasTopPosition:boolean = top === top; //!isNaN
			if(hasTopPosition)
			{
				var topAnchorDisplayObject:DisplayObject = layoutData.topAnchorDisplayObject;
				if(topAnchorDisplayObject)
				{
					item.y = item.pivotY + topAnchorDisplayObject.y - topAnchorDisplayObject.pivotY + topAnchorDisplayObject.height + top;
				}
				else
				{
					item.y = item.pivotY + boundsY + top;
				}
			}
			var verticalCenter:number = layoutData.verticalCenter;
			var hasVerticalCenterPosition:boolean = verticalCenter === verticalCenter; //!isNaN
			var bottom:number = layoutData.bottom;
			var hasBottomPosition:boolean = bottom === bottom; //!isNaN
			if(hasBottomPosition)
			{
				var bottomAnchorDisplayObject:DisplayObject = layoutData.bottomAnchorDisplayObject;
				if(hasTopPosition)
				{
					var topBottomHeight:number = viewPortHeight;
					if(bottomAnchorDisplayObject)
					{
						topBottomHeight = bottomAnchorDisplayObject.y - bottomAnchorDisplayObject.pivotY;
					}
					if(topAnchorDisplayObject)
					{
						topBottomHeight -= (topAnchorDisplayObject.y - topAnchorDisplayObject.pivotY + topAnchorDisplayObject.height);
					}
					checkHeight = false;
					item.height = topBottomHeight - bottom - top;
				}
				else if(hasVerticalCenterPosition)
				{
					var verticalCenterAnchorDisplayObject:DisplayObject = layoutData.verticalCenterAnchorDisplayObject;
					var yPositionOfCenter:number;
					if(verticalCenterAnchorDisplayObject)
					{
						yPositionOfCenter = verticalCenterAnchorDisplayObject.y - verticalCenterAnchorDisplayObject.pivotY + Math.round(verticalCenterAnchorDisplayObject.height / 2) + verticalCenter;
					}
					else
					{
						yPositionOfCenter = Math.round(viewPortHeight / 2) + verticalCenter;
					}
					var yPositionOfBottom:number;
					if(bottomAnchorDisplayObject)
					{
						yPositionOfBottom = bottomAnchorDisplayObject.y - bottomAnchorDisplayObject.pivotY - bottom;
					}
					else
					{
						yPositionOfBottom = viewPortHeight - bottom;
					}
					checkHeight = false;
					item.height = 2 * (yPositionOfBottom - yPositionOfCenter);
					item.y = item.pivotY + viewPortHeight - bottom - item.height;
				}
				else
				{
					if(bottomAnchorDisplayObject)
					{
						item.y = item.pivotY + bottomAnchorDisplayObject.y - bottomAnchorDisplayObject.pivotY - item.height - bottom;
					}
					else
					{
						item.y = item.pivotY + boundsY + viewPortHeight - bottom - item.height;
					}
				}
			}
			else if(hasVerticalCenterPosition)
			{
				verticalCenterAnchorDisplayObject = layoutData.verticalCenterAnchorDisplayObject;
				if(verticalCenterAnchorDisplayObject)
				{
					yPositionOfCenter = verticalCenterAnchorDisplayObject.y - verticalCenterAnchorDisplayObject.pivotY + Math.round(verticalCenterAnchorDisplayObject.height / 2) + verticalCenter;
				}
				else
				{
					yPositionOfCenter = Math.round(viewPortHeight / 2) + verticalCenter;
				}

				if(hasTopPosition)
				{
					checkHeight = false;
					item.height = 2 * (yPositionOfCenter - item.y + item.pivotY);
				}
				else
				{
					item.y = item.pivotY + yPositionOfCenter - Math.round(item.height / 2);
				}
			}
			if(checkHeight)
			{
				var itemY:number = item.y;
				itemHeight = item.height;
				if(itemY + itemHeight > viewPortHeight)
				{
					itemHeight = viewPortHeight - itemY;
					if(uiItem)
					{
						if(itemHeight < minHeight)
						{
							itemHeight = minHeight;
						}
					}
					item.height = itemHeight;
				}
			}
		}

		/**
		 * @private
		 */
		protected measureContent(items:DisplayObject[], viewPortWidth:number, viewPortHeight:number, result:Point = null):Point
		{
			var maxX:number = viewPortWidth;
			var maxY:number = viewPortHeight;
			var itemCount:number = items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = items[i];
				var itemMaxX:number = item.x - item.pivotX + item.width;
				var itemMaxY:number = item.y - item.pivotY + item.height;
				if(itemMaxX === itemMaxX && //!isNaN
					itemMaxX > maxX)
				{
					maxX = itemMaxX;
				}
				if(itemMaxY === itemMaxY && //!isNaN
					itemMaxY > maxY)
				{
					maxY = itemMaxY;
				}
			}
			result.x = maxX;
			result.y = maxY;
			return result;
		}

		/**
		 * @private
		 */
		protected isReadyForLayout(layoutData:AnchorLayoutData, index:number, items:DisplayObject[], unpositionedItems:DisplayObject[]):boolean
		{
			var nextIndex:number = index + 1;
			var leftAnchorDisplayObject:DisplayObject = layoutData.leftAnchorDisplayObject;
			if(leftAnchorDisplayObject && (items.indexOf(leftAnchorDisplayObject, nextIndex) >= nextIndex || unpositionedItems.indexOf(leftAnchorDisplayObject) >= 0))
			{
				return false;
			}
			var rightAnchorDisplayObject:DisplayObject = layoutData.rightAnchorDisplayObject;
			if(rightAnchorDisplayObject && (items.indexOf(rightAnchorDisplayObject, nextIndex) >= nextIndex || unpositionedItems.indexOf(rightAnchorDisplayObject) >= 0))
			{
				return false;
			}
			var topAnchorDisplayObject:DisplayObject = layoutData.topAnchorDisplayObject;
			if(topAnchorDisplayObject && (items.indexOf(topAnchorDisplayObject, nextIndex) >= nextIndex || unpositionedItems.indexOf(topAnchorDisplayObject) >= 0))
			{
				return false;
			}
			var bottomAnchorDisplayObject:DisplayObject = layoutData.bottomAnchorDisplayObject;
			if(bottomAnchorDisplayObject && (items.indexOf(bottomAnchorDisplayObject, nextIndex) >= nextIndex || unpositionedItems.indexOf(bottomAnchorDisplayObject) >= 0))
			{
				return false
			}
			var horizontalCenterAnchorDisplayObject:DisplayObject = layoutData.horizontalCenterAnchorDisplayObject;
			if(horizontalCenterAnchorDisplayObject && (items.indexOf(horizontalCenterAnchorDisplayObject, nextIndex) >= nextIndex || unpositionedItems.indexOf(horizontalCenterAnchorDisplayObject) >= 0))
			{
				return false
			}
			var verticalCenterAnchorDisplayObject:DisplayObject = layoutData.verticalCenterAnchorDisplayObject;
			if(verticalCenterAnchorDisplayObject && (items.indexOf(verticalCenterAnchorDisplayObject, nextIndex) >= nextIndex || unpositionedItems.indexOf(verticalCenterAnchorDisplayObject) >= 0))
			{
				return false
			}
			return true;
		}

		/**
		 * @private
		 */
		protected isReferenced(item:DisplayObject, items:DisplayObject[]):boolean
		{
			var itemCount:number = items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var otherItem:ILayoutDisplayObject = <ILayoutDisplayObject>items[i] ;
				if(!otherItem || otherItem == item)
				{
					continue;
				}
				var layoutData:AnchorLayoutData = <AnchorLayoutData>otherItem.layoutData ;
				if(!layoutData)
				{
					continue;
				}
				if(layoutData.leftAnchorDisplayObject == item || layoutData.horizontalCenterAnchorDisplayObject == item ||
					layoutData.rightAnchorDisplayObject == item || layoutData.topAnchorDisplayObject == item ||
					layoutData.verticalCenterAnchorDisplayObject == item || layoutData.bottomAnchorDisplayObject == item)
				{
					return true;
				}
			}
			return false;
		}

		/**
		 * @private
		 */
		protected validateItems(items:DisplayObject[], force:boolean):void
		{
			var itemCount:number = items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var control:IFeathersControl = <IFeathersControl>items[i] ;
				if(control)
				{
					if(force)
					{
						control.validate();
						continue;
					}
					if(control instanceof this.ILayoutDisplayObject)
					{
						var layoutControl:ILayoutDisplayObject = this.ILayoutDisplayObject(control);
						if(!layoutControl.includeInLayout)
						{
							continue;
						}
						var layoutData:AnchorLayoutData = <AnchorLayoutData>layoutControl.layoutData ;
						if(layoutData)
						{
							var left:number = layoutData.left;
							var hasLeftPosition:boolean = left === left; //!isNaN
							var right:number = layoutData.right;
							var hasRightPosition:boolean = right === right; //!isNaN
							var horizontalCenter:number = layoutData.horizontalCenter;
							var hasHorizontalCenterPosition:boolean = horizontalCenter === horizontalCenter; //!isNaN
							if((hasRightPosition && !hasLeftPosition && !hasHorizontalCenterPosition) ||
								hasHorizontalCenterPosition)
							{
								control.validate();
								continue;
							}
							var top:number = layoutData.top;
							var hasTopPosition:boolean = top === top; //!isNaN
							var bottom:number = layoutData.bottom;
							var hasBottomPosition:boolean = bottom === bottom; //!isNaN
							var verticalCenter:number = layoutData.verticalCenter;
							var hasVerticalCenterPosition:boolean = verticalCenter === verticalCenter; //!isNaN
							if((hasBottomPosition && !hasTopPosition && !hasVerticalCenterPosition) ||
								hasVerticalCenterPosition)
							{
								control.validate();
								continue;
							}
						}
					}
					if(this.isReferenced(DisplayObject(control), items))
					{
						control.validate();
					}
				}
			}
		}
	}
}
