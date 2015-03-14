/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.supportClasses
{
	import LayoutGroup = feathers.controls.LayoutGroup;
	import IValidating = feathers.core.IValidating;

	import DisplayObject = starling.display.DisplayObject;

	/**
	 * @private
	 * Used internally by ScrollContainer. Not meant to be used on its own.
	 */
	export class LayoutViewPort extends LayoutGroup implements IViewPort
	{
		constructor()
		{
		}

		private _minVisibleWidth:number = 0;

		public get minVisibleWidth():number
		{
			return this._minVisibleWidth;
		}

		public set minVisibleWidth(value:number)
		{
			if(this._minVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleWidth cannot be NaN");
			}
			this._minVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _maxVisibleWidth:number = Number.POSITIVE_INFINITY;

		public get maxVisibleWidth():number
		{
			return this._maxVisibleWidth;
		}

		public set maxVisibleWidth(value:number)
		{
			if(this._maxVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleWidth cannot be NaN");
			}
			this._maxVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _actualVisibleWidth:number = 0;

		private _explicitVisibleWidth:number = NaN;

		public get visibleWidth():number
		{
			if(this._explicitVisibleWidth !== this._explicitVisibleWidth) //isNaN
			{
				return this._actualVisibleWidth;
			}
			return this._explicitVisibleWidth;
		}

		public set visibleWidth(value:number)
		{
			if(this._explicitVisibleWidth == value ||
				(value !== value && this._explicitVisibleWidth !== this._explicitVisibleWidth)) //isNaN
			{
				return;
			}
			this._explicitVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _minVisibleHeight:number = 0;

		public get minVisibleHeight():number
		{
			return this._minVisibleHeight;
		}

		public set minVisibleHeight(value:number)
		{
			if(this._minVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleHeight cannot be NaN");
			}
			this._minVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _maxVisibleHeight:number = Number.POSITIVE_INFINITY;

		public get maxVisibleHeight():number
		{
			return this._maxVisibleHeight;
		}

		public set maxVisibleHeight(value:number)
		{
			if(this._maxVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleHeight cannot be NaN");
			}
			this._maxVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _actualVisibleHeight:number = 0;

		private _explicitVisibleHeight:number = NaN;

		public get visibleHeight():number
		{
			if(this._explicitVisibleHeight !== this._explicitVisibleHeight) //isNaN
			{
				return this._actualVisibleHeight;
			}
			return this._explicitVisibleHeight;
		}

		public set visibleHeight(value:number)
		{
			if(this._explicitVisibleHeight == value ||
				(value !== value && this._explicitVisibleHeight !== this._explicitVisibleHeight)) //isNaN
			{
				return;
			}
			this._explicitVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _contentX:number = 0;

		public get contentX():number
		{
			return this._contentX;
		}

		private _contentY:number = 0;

		public get contentY():number
		{
			return this._contentY;
		}

		public get horizontalScrollStep():number
		{
			if(this.actualWidth < this.actualHeight)
			{
				return this.actualWidth / 10;
			}
			return this.actualHeight / 10;
		}

		public get verticalScrollStep():number
		{
			if(this.actualWidth < this.actualHeight)
			{
				return this.actualWidth / 10;
			}
			return this.actualHeight / 10;
		}

		private _horizontalScrollPosition:number = 0;

		public get horizontalScrollPosition():number
		{
			return this._horizontalScrollPosition;
		}

		public set horizontalScrollPosition(value:number)
		{
			if(this._horizontalScrollPosition == value)
			{
				return;
			}
			this._horizontalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		private _verticalScrollPosition:number = 0;

		public get verticalScrollPosition():number
		{
			return this._verticalScrollPosition;
		}

		public set verticalScrollPosition(value:number)
		{
			if(this._verticalScrollPosition == value)
			{
				return;
			}
			this._verticalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		/*override*/ public dispose():void
		{
			this.layout = null;
			super.dispose();
		}

		/*override*/ protected draw():void
		{
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);

			super.draw();

			if(scrollInvalid || sizeInvalid || layoutInvalid)
			{
				if(this._layout)
				{
					this._contentX = this._layoutResult.contentX;
					this._contentY = this._layoutResult.contentY;
					this._actualVisibleWidth = this._layoutResult.viewPortWidth;
					this._actualVisibleHeight = this._layoutResult.viewPortHeight;
				}
			}
		}

		/*override*/ protected refreshViewPortBounds():void
		{
			this.viewPortBounds.x = 0;
			this.viewPortBounds.y = 0;
			this.viewPortBounds.scrollX = this._horizontalScrollPosition;
			this.viewPortBounds.scrollY = this._verticalScrollPosition;
			if(this._autoSizeMode == this.AUTO_SIZE_MODE_STAGE &&
				this._explicitVisibleWidth !== this._explicitVisibleWidth)
			{
				this.viewPortBounds.explicitWidth = this.stage.stageWidth;
			}
			else
			{
				this.viewPortBounds.explicitWidth = this._explicitVisibleWidth;
			}
			if(this._autoSizeMode == this.AUTO_SIZE_MODE_STAGE &&
				this._explicitVisibleHeight !== this._explicitVisibleHeight)
			{
				this.viewPortBounds.explicitHeight = this.stage.stageHeight;
			}
			else
			{
				this.viewPortBounds.explicitHeight = this._explicitVisibleHeight;
			}
			this.viewPortBounds.minWidth = this._minVisibleWidth;
			this.viewPortBounds.minHeight = this._minVisibleHeight;
			this.viewPortBounds.maxWidth = this._maxVisibleWidth;
			this.viewPortBounds.maxHeight = this._maxVisibleHeight;
		}

		/*override*/ protected handleManualLayout():void
		{
			var minX:number = 0;
			var minY:number = 0;
			var explicitViewPortWidth:number = this.viewPortBounds.explicitWidth;
			var maxX:number = explicitViewPortWidth;
			//for some reason, if we don't call a function right here,
			//compiling with the flex 4.6 SDK will throw a VerifyError
			//for a stack overflow.
			//we could change the !== check back to isNaN() instead, but
			//isNaN() can allocate an object, so we should call a different
			//function without allocation.
			this.doNothing();
			if(maxX !== maxX) //isNaN
			{
				maxX = 0;
			}
			var explicitViewPortHeight:number = this.viewPortBounds.explicitHeight;
			var maxY:number = explicitViewPortHeight;
			//see explanation above the previous call to this function.
			this.doNothing();
			if(maxY !== maxY) //isNaN
			{
				maxY = 0;
			}
			this._ignoreChildChanges = true;
			var itemCount:number = this.items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = this.items[i];
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
				var itemX:number = item.x;
				var itemY:number = item.y;
				var itemMaxX:number = itemX + item.width;
				var itemMaxY:number = itemY + item.height;
				if(itemX === itemX && //!isNaN
					itemX < minX)
				{
					minX = itemX;
				}
				if(itemY === itemY && //!isNaN
					itemY < minY)
				{
					minY = itemY;
				}
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
			this._contentX = minX;
			this._contentY = minY;
			var minWidth:number = this.viewPortBounds.minWidth;
			var maxWidth:number = this.viewPortBounds.maxWidth;
			var minHeight:number = this.viewPortBounds.minHeight;
			var maxHeight:number = this.viewPortBounds.maxHeight;
			var calculatedWidth:number = maxX - minX;
			if(calculatedWidth < minWidth)
			{
				calculatedWidth = minWidth;
			}
			else if(calculatedWidth > maxWidth)
			{
				calculatedWidth = maxWidth;
			}
			var calculatedHeight:number = maxY - minY;
			if(calculatedHeight < minHeight)
			{
				calculatedHeight = minHeight;
			}
			else if(calculatedHeight > maxHeight)
			{
				calculatedHeight = maxHeight;
			}
			this._ignoreChildChanges = false;
			if(explicitViewPortWidth !== explicitViewPortWidth) //isNaN
			{
				this._actualVisibleWidth = calculatedWidth;
			}
			else
			{
				this._actualVisibleWidth = explicitViewPortWidth;
			}
			if(explicitViewPortHeight !== explicitViewPortHeight) //isNaN
			{
				this._actualVisibleHeight = calculatedHeight;
			}
			else
			{
				this._actualVisibleHeight = explicitViewPortHeight;
			}
			this._layoutResult.contentX = 0;
			this._layoutResult.contentY = 0;
			this._layoutResult.contentWidth = calculatedWidth;
			this._layoutResult.contentHeight = calculatedHeight;
			this._layoutResult.viewPortWidth = this._actualVisibleWidth;
			this._layoutResult.viewPortHeight = this._actualVisibleHeight;
		}

		/**
		 * @private
		 * This function is here to work around a bug in the Flex 4.6 SDK
		 * compiler. For explanation, see the places where it gets called.
		 */
		protected doNothing():void {}
	}
}
