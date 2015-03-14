/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IValidating = feathers.core.IValidating;
	import ListCollection = feathers.data.ListCollection;
	import FeathersEventType = feathers.events.FeathersEventType;
	import ILayout = feathers.layout.ILayout;
	import ISpinnerLayout = feathers.layout.ISpinnerLayout;
	import VerticalSpinnerLayout = feathers.layout.VerticalSpinnerLayout;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Keyboard = flash.ui.Keyboard;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;

	/**
	 * A customized <code>List</code> component where scrolling updates the
	 * the selected item. Layouts may loop infinitely.
	 *
	 * <p>The following example creates a list, gives it a data provider, tells
	 * the item renderer how to interpret the data, and listens for when the
	 * selection changes:</p>
	 *
	 * <listing version="3.0">
	 * var list:SpinnerList = new SpinnerList();
	 * 
	 * list.dataProvider = new ListCollection(
	 * [
	 *     { text: "Milk", thumbnail: textureAtlas.getTexture( "milk" ) },
	 *     { text: "Eggs", thumbnail: textureAtlas.getTexture( "eggs" ) },
	 *     { text: "Bread", thumbnail: textureAtlas.getTexture( "bread" ) },
	 *     { text: "Chicken", thumbnail: textureAtlas.getTexture( "chicken" ) },
	 * ]);
	 * 
	 * list.itemRendererFactory = function():IListItemRenderer
	 * {
	 *     var renderer:DefaultListItemRenderer = new DefaultListItemRenderer();
	 *     renderer.labelField = "text";
	 *     renderer.iconSourceField = "thumbnail";
	 *     return renderer;
	 * };
	 * 
	 * list.addEventListener( Event.CHANGE, list_changeHandler );
	 * 
	 * this.addChild( list );</listing>
	 *
	 * <p><strong>Beta Component:</strong> This is a new component, and its APIs
	 * may need some changes between now and the next version of Feathers to
	 * account for overlooked requirements or other issues. Upgrading to future
	 * versions of Feathers may involve manual changes to your code that uses
	 * this component. The
	 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>
	 * will not go into effect until this component's status is upgraded from
	 * beta to stable.</p>
	 *
	 * @see ../../../help/spinner-list.html How to use the Feathers SpinnerList component
	 */
	export class SpinnerList extends List
	{
		/**
		 * The default <code>IStyleProvider</code> for all <code>SpinnerList</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * Constructor.
		 */
		constructor()
		{
			this._snapToPages = true;
			this._snapOnComplete = true;
			this.decelerationRate = this.Scroller.DECELERATION_RATE_FAST;
			this.addEventListener(Event.TRIGGERED, this.spinnerList_triggeredHandler);
			this.addEventListener(FeathersEventType.SCROLL_COMPLETE, this.spinnerList_scrollCompleteHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			if(SpinnerList.globalStyleProvider)
			{
				return SpinnerList.globalStyleProvider;
			}
			return this.List.globalStyleProvider;
		}

		/**
		 * <code>SpinnerList</code> requires that the <code>snapToPages</code>
		 * property is set to <code>true</code>. Attempts to set it to
		 * <code>false</code> will result in a runtime error.
		 *
		 * @throws ArgumentError SpinnerList requires snapToPages to be true.
		 */
		/*override*/ public set snapToPages(value:boolean)
		{
			if(!value)
			{
				throw new ArgumentError("SpinnerList requires snapToPages to be true.");
			}
			super.snapToPages = value;
		}

		/**
		 * <code>SpinnerList</code> requires that the <code>allowMultipleSelection</code>
		 * property is set to <code>false</code>. Attempts to set it to
		 * <code>true</code> will result in a runtime error.
		 *
		 * @throws ArgumentError SpinnerList requires allowMultipleSelection to be false.
		 */
		/*override*/ public set allowMultipleSelection(value:boolean)
		{
			if(value)
			{
				throw new ArgumentError("SpinnerList requires allowMultipleSelection to be false.");
			}
			super.allowMultipleSelection = value;
		}

		/**
		 * <code>SpinnerList</code> requires that the <code>isSelectable</code>
		 * property is set to <code>true</code>. Attempts to set it to
		 * <code>false</code> will result in a runtime error.
		 *
		 * @throws ArgumentError SpinnerList requires isSelectable to be true.
		 */
		/*override*/ public set isSelectable(value:boolean)
		{
			if(!value)
			{
				throw new ArgumentError("SpinnerList requires isSelectable to be true.");
			}
			super.snapToPages = value;
		}

		/**
		 * @private
		 */
		/*override*/ public set layout(value:ILayout)
		{
			if(value && !(value instanceof ISpinnerLayout))
			{
				throw new ArgumentError("SpinnerList requires layouts to implement the ISpinnerLayout interface.");
			}
			super.layout = value;
		}

		/**
		 * @private
		 */
		/*override*/ public set selectedIndex(value:number)
		{
			if(this._selectedIndex != value)
			{
				this.scrollToDisplayIndex(value, 0);
			}
			super.selectedIndex = value;
		}

		/**
		 * @private
		 */
		/*override*/ public set dataProvider(value:ListCollection)
		{
			super.dataProvider = value;
			if(!this._dataProvider || this._dataProvider.length == 0)
			{
				this.selectedIndex = -1;
			}
			else
			{
				this.selectedIndex = 0;
			}
		}

		/**
		 * @private
		 */
		protected _selectionOverlaySkin:DisplayObject;

		/**
		 * An optional skin to display in the horizontal or vertical center of
		 * the list to highlight the currently selected item. If the list
		 * scrolls vertically, the <code>selectionOverlaySkin</code> will fill
		 * the entire width of the list, and it will be positioned in the
		 * vertical center. If the list scrolls horizontally, the
		 * <code>selectionOverlaySkin</code> will fill the entire height of the
		 * list, and it will be positioned in the horizontal center.
		 *
		 * <p>The following example gives the spinner list a selection overlay
		 * skin:</p>
		 *
		 * <listing version="3.0">
		 * list.selectionOverlaySkin = new Scale9Image( textures );</listing>
		 *
		 * @default null
		 */
		public get selectionOverlaySkin():DisplayObject
		{
			return this._selectionOverlaySkin;
		}

		/**
		 * @private
		 */
		public set selectionOverlaySkin(value:DisplayObject)
		{
			if(this._selectionOverlaySkin == value)
			{
				return;
			}
			if(this._selectionOverlaySkin && this._selectionOverlaySkin.parent == this)
			{
				this.removeRawChildInternal(this._selectionOverlaySkin);
			}
			this._selectionOverlaySkin = value;
			if(this._selectionOverlaySkin)
			{
				this.addRawChildInternal(this._selectionOverlaySkin);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			if(this._layout == null)
			{
				if(this._hasElasticEdges &&
					this._verticalScrollPolicy == this.SCROLL_POLICY_AUTO &&
					this._scrollBarDisplayMode != this.SCROLL_BAR_DISPLAY_MODE_FIXED)
				{
					//so that the elastic edges work even when the max scroll
					//position is 0, similar to iOS.
					this.verticalScrollPolicy = this.SCROLL_POLICY_ON;
				}

				var layout:VerticalSpinnerLayout = new VerticalSpinnerLayout();
				layout.useVirtualLayout = true;
				layout.padding = 0;
				layout.gap = 0;
				layout.horizontalAlign = VerticalSpinnerLayout.HORIZONTAL_ALIGN_JUSTIFY;
				layout.requestedRowCount = 5;
				this.layout = layout;
			}

			super.initialize();
		}

		/**
		 * @private
		 */
		/*override*/ protected refreshMinAndMaxScrollPositions():void
		{
			super.refreshMinAndMaxScrollPositions();
			if(this._maxVerticalScrollPosition != this._minVerticalScrollPosition)
			{
				this.actualPageHeight = ISpinnerLayout(this._layout).snapInterval;
			}
			else if(this._maxHorizontalScrollPosition != this._minHorizontalScrollPosition)
			{
				this.actualPageWidth = ISpinnerLayout(this._layout).snapInterval;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected handlePendingScroll():void
		{
			if(this.pendingItemIndex >= 0)
			{
				var itemIndex:number = this.pendingItemIndex;
				this.pendingItemIndex = -1;
				if(this._maxVerticalPageIndex != this._minVerticalPageIndex)
				{
					this.pendingVerticalPageIndex = this.calculateNearestPageIndexForItem(itemIndex, this._verticalPageIndex, this._maxVerticalPageIndex);
					this.hasPendingVerticalPageIndex = this.pendingVerticalPageIndex !== this._verticalPageIndex;
				}
				else if(this._maxHorizontalPageIndex != this._minHorizontalPageIndex)
				{
					this.pendingHorizontalPageIndex = this.calculateNearestPageIndexForItem(itemIndex, this._horizontalPageIndex, this._maxHorizontalPageIndex);
					this.hasPendingHorizontalPageIndex = this.pendingHorizontalPageIndex !== this._horizontalPageIndex;
				}
			}
			super.handlePendingScroll();
		}

		/**
		 * @private
		 */
		/*override*/ protected layoutChildren():void
		{
			super.layoutChildren();

			if(this._selectionOverlaySkin)
			{
				if(this._selectionOverlaySkin instanceof IValidating)
				{
					IValidating(this._selectionOverlaySkin).validate();
				}
				if(this._maxVerticalPageIndex != this._minVerticalPageIndex)
				{
					this._selectionOverlaySkin.width = this.actualWidth - this._leftViewPortOffset - this._rightViewPortOffset;
					this._selectionOverlaySkin.height = this.actualPageHeight;
					this._selectionOverlaySkin.x = this._leftViewPortOffset;
					this._selectionOverlaySkin.y = Math.round(this._topViewPortOffset + (this.actualHeight - this._topViewPortOffset - this._bottomViewPortOffset - this.actualPageHeight) / 2);
				}
				else if(this._maxHorizontalPageIndex != this._minHorizontalPageIndex)
				{
					this._selectionOverlaySkin.width = this.actualPageWidth;
					this._selectionOverlaySkin.height = this.actualHeight - this._topViewPortOffset - this._bottomViewPortOffset;
					this._selectionOverlaySkin.x = Math.round(this._leftViewPortOffset + (this.actualWidth - this._leftViewPortOffset - this._rightViewPortOffset - this.actualPageWidth) / 2);
					this._selectionOverlaySkin.y = this._topViewPortOffset;
				}
			}
		}

		/**
		 * @private
		 */
		protected calculateNearestPageIndexForItem(itemIndex:number, currentPageIndex:number, maxPageIndex:number):number
		{
			if(maxPageIndex != int.MAX_VALUE)
			{
				return itemIndex;
			}
			var itemCount:number = this._dataProvider.length;
			var fullDataProviderOffsets:number = currentPageIndex / itemCount;
			var currentItemIndex:number = currentPageIndex % itemCount;
			if(itemIndex < currentItemIndex)
			{
				var previousPageIndex:number = fullDataProviderOffsets * itemCount + itemIndex;
				var nextPageIndex:number = (fullDataProviderOffsets + 1) * itemCount + itemIndex;
			}
			else
			{
				previousPageIndex = (fullDataProviderOffsets - 1) * itemCount + itemIndex;
				nextPageIndex = fullDataProviderOffsets * itemCount + itemIndex;
			}
			if((nextPageIndex - currentPageIndex) < (currentPageIndex - previousPageIndex))
			{
				return nextPageIndex;
			}
			return previousPageIndex;
		}

		/**
		 * @private
		 */
		protected spinnerList_scrollCompleteHandler(event:Event):void
		{
			var itemCount:number = this._dataProvider.length;
			if(this._maxVerticalPageIndex != this._minVerticalPageIndex)
			{
				var pageIndex:number = this._verticalPageIndex % itemCount;
			}
			else if(this._maxHorizontalPageIndex != this._minHorizontalPageIndex)
			{
				pageIndex = this._horizontalPageIndex % itemCount;
			}
			if(pageIndex < 0)
			{
				pageIndex = itemCount + pageIndex;
			}
			this.selectedIndex = pageIndex;
		}

		/**
		 * @private
		 */
		protected spinnerList_triggeredHandler(event:Event, item:Object):void
		{
			var itemIndex:number = this._dataProvider.getItemIndex(item);
			if(this._maxVerticalPageIndex != this._minVerticalPageIndex)
			{
				itemIndex = this.calculateNearestPageIndexForItem(itemIndex, this._verticalPageIndex, this._maxVerticalPageIndex);
				this.throwToPage(this._horizontalPageIndex, itemIndex, this._pageThrowDuration);
			}
			else if(this._maxHorizontalPageIndex != this._minHorizontalPageIndex)
			{
				itemIndex = this.calculateNearestPageIndexForItem(itemIndex, this._horizontalPageIndex, this._maxHorizontalPageIndex);
				this.throwToPage(itemIndex, this._verticalPageIndex);
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(!this._dataProvider)
			{
				return;
			}
			var changedSelection:boolean = false;
			if(event.keyCode == Keyboard.HOME)
			{
				if(this._dataProvider.length > 0)
				{
					this.selectedIndex = 0;
					changedSelection = true;
				}
			}
			else if(event.keyCode == Keyboard.END)
			{
				this.selectedIndex = this._dataProvider.length - 1;
				changedSelection = true;
			}
			else if(event.keyCode == Keyboard.UP)
			{
				var newIndex:number = this._selectedIndex - 1;
				if(newIndex < 0)
				{
					newIndex = this._dataProvider.length + newIndex;
				}
				this.selectedIndex = newIndex;
				changedSelection = true;
			}
			else if(event.keyCode == Keyboard.DOWN)
			{
				newIndex = this._selectedIndex + 1;
				if(newIndex >= this._dataProvider.length)
				{
					newIndex -= this._dataProvider.length;
				}
				this.selectedIndex = newIndex;
				changedSelection = true;
			}
			if(changedSelection)
			{
				if(this._maxVerticalPageIndex != this._minVerticalPageIndex)
				{
					var pageIndex:number = this.calculateNearestPageIndexForItem(this._selectedIndex, this._verticalPageIndex, this._maxVerticalPageIndex);
					this.throwToPage(this._horizontalPageIndex, pageIndex, this._pageThrowDuration);
				}
				else if(this._maxHorizontalPageIndex != this._minHorizontalPageIndex)
				{
					pageIndex = this.calculateNearestPageIndexForItem(this._selectedIndex, this._horizontalPageIndex, this._maxHorizontalPageIndex);
					this.throwToPage(pageIndex, this._verticalPageIndex);
				}
			}
		}
	}
}
