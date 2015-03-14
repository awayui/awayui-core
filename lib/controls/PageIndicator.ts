/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import IValidating = feathers.core.IValidating;
	import HorizontalLayout = feathers.layout.HorizontalLayout;
	import ILayout = feathers.layout.ILayout;
	import IVirtualLayout = feathers.layout.IVirtualLayout;
	import LayoutBoundsResult = feathers.layout.LayoutBoundsResult;
	import VerticalLayout = feathers.layout.VerticalLayout;
	import ViewPortBounds = feathers.layout.ViewPortBounds;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Point = flash.geom.Point;

	import DisplayObject = starling.display.DisplayObject;
	import Quad = starling.display.Quad;
	import Event = starling.events.Event;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the selected item changes.
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
	 * Displays a selected index, usually corresponding to a page index in
	 * another UI control, using a highlighted symbol.
	 *
	 * @see ../../../help/page-indicator.html How to use the Feathers PageIndicator component
	 */
	export class PageIndicator extends FeathersControl
	{
		/**
		 * @private
		 */
		private static LAYOUT_RESULT:LayoutBoundsResult = new LayoutBoundsResult();

		/**
		 * @private
		 */
		private static SUGGESTED_BOUNDS:ViewPortBounds = new ViewPortBounds();

		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * The page indicator's symbols will be positioned vertically, from top
		 * to bottom.
		 *
		 * @see #direction
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The page indicator's symbols will be positioned horizontally, from
		 * left to right.
		 *
		 * @see #direction
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * The symbols will be vertically aligned to the top.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * The symbols will be vertically aligned to the middle.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * The symbols will be vertically aligned to the bottom.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * The symbols will be horizontally aligned to the left.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * The symbols will be horizontally aligned to the center.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * The symbols will be horizontally aligned to the right.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_RIGHT:string = "right";

		/**
		 * Touching the page indicator on the left of the selected symbol will
		 * select the previous index and to the right of the selected symbol
		 * will select the next index.
		 *
		 * @see #interactionMode
		 */
		public static INTERACTION_MODE_PREVIOUS_NEXT:string = "previousNext";

		/**
		 * Touching the page indicator on a symbol will select that symbol's
		 * exact index.
		 *
		 * @see #interactionMode
		 */
		public static INTERACTION_MODE_PRECISE:string = "precise";

		/**
		 * The default <code>IStyleProvider</code> for all <code>PageIndicator</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static defaultSelectedSymbolFactory():Quad
		{
			return new Quad(25, 25, 0xffffff);
		}

		/**
		 * @private
		 */
		protected static defaultNormalSymbolFactory():Quad
		{
			return new Quad(25, 25, 0xcccccc);
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.isQuickHitAreaEnabled = true;
			this.addEventListener(TouchEvent.TOUCH, this.touchHandler);
		}

		/**
		 * @private
		 */
		protected selectedSymbol:DisplayObject;

		/**
		 * @private
		 */
		protected cache:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected unselectedSymbols:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected symbols:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected touchPointID:number = -1;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return PageIndicator.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _pageCount:number = 1;

		/**
		 * The number of available pages.
		 *
		 * <p>In the following example, the page count is changed:</p>
		 *
		 * <listing version="3.0">
		 * pages.pageCount = 5;</listing>
		 *
		 * @default 1
		 */
		public get pageCount():number
		{
			return this._pageCount;
		}

		/**
		 * @private
		 */
		public set pageCount(value:number)
		{
			if(this._pageCount == value)
			{
				return;
			}
			this._pageCount = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _selectedIndex:number = 0;

		/**
		 * The currently selected index.
		 *
		 * <p>In the following example, the page indicator's selected index is
		 * changed:</p>
		 *
		 * <listing version="3.0">
		 * pages.selectedIndex = 2;</listing>
		 *
		 * <p>The following example listens for when selection changes and
		 * requests the selected index:</p>
		 *
		 * <listing version="3.0">
		 * function pages_changeHandler( event:Event ):void
		 * {
		 *     var pages:PageIndicator = PageIndicator( event.currentTarget );
		 *     var index:int = pages.selectedIndex;
		 *
		 * }
		 * pages.addEventListener( Event.CHANGE, pages_changeHandler );</listing>
		 *
		 * @default 0
		 */
		public get selectedIndex():number
		{
			return this._selectedIndex;
		}

		/**
		 * @private
		 */
		public set selectedIndex(value:number)
		{
			value = Math.max(0, Math.min(value, this._pageCount - 1));
			if(this._selectedIndex == value)
			{
				return;
			}
			this._selectedIndex = value;
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _interactionMode:string = PageIndicator.INTERACTION_MODE_PREVIOUS_NEXT;

		/*[Inspectable(type="String",enumeration="previousNext,precise")]*/
		/**
		 * Determines how the selected index changes on touch.
		 *
		 * <p>In the following example, the interaction mode is changed to precise:</p>
		 *
		 * <listing version="3.0">
		 * pages.direction = PageIndicator.INTERACTION_MODE_PRECISE;</listing>
		 *
		 * @default PageIndicator.INTERACTION_MODE_PREVIOUS_NEXT
		 *
		 * @see #INTERACTION_MODE_PREVIOUS_NEXT
		 * @see #INTERACTION_MODE_PRECISE
		 */
		public get interactionMode():string
		{
			return this._interactionMode;
		}

		/**
		 * @private
		 */
		public set interactionMode(value:string)
		{
			this._interactionMode = value;
		}

		/**
		 * @private
		 */
		protected _layout:ILayout;

		/**
		 * @private
		 */
		protected _direction:string = PageIndicator.DIRECTION_HORIZONTAL;

		/*[Inspectable(type="String",enumeration="horizontal,vertical")]*/
		/**
		 * The symbols may be positioned vertically or horizontally.
		 *
		 * <p>In the following example, the direction is changed to vertical:</p>
		 *
		 * <listing version="3.0">
		 * pages.direction = PageIndicator.DIRECTION_VERTICAL;</listing>
		 *
		 * @default PageIndicator.DIRECTION_HORIZONTAL
		 *
		 * @see #DIRECTION_HORIZONTAL
		 * @see #DIRECTION_VERTICAL
		 */
		public get direction():string
		{
			return this._direction;
		}

		/**
		 * @private
		 */
		public set direction(value:string)
		{
			if(this._direction == value)
			{
				return;
			}
			this._direction = value;
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected _horizontalAlign:string = PageIndicator.HORIZONTAL_ALIGN_CENTER;

		/*[Inspectable(type="String",enumeration="left,center,right")]*/
		/**
		 * The alignment of the symbols on the horizontal axis.
		 *
		 * <p>In the following example, the symbols are horizontally aligned to
		 * the right:</p>
		 *
		 * <listing version="3.0">
		 * pages.horizontalAlign = PageIndicator.HORIZONTAL_ALIGN_RIGHT;</listing>
		 *
		 * @default PageIndicator.HORIZONTAL_ALIGN_CENTER
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
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected _verticalAlign:string = PageIndicator.VERTICAL_ALIGN_MIDDLE;

		/*[Inspectable(type="String",enumeration="top,middle,bottom")]*/
		/**
		 * The alignment of the symbols on the vertical axis.
		 *
		 * <p>In the following example, the symbols are vertically aligned to
		 * the bottom:</p>
		 *
		 * <listing version="3.0">
		 * pages.verticalAlign = PageIndicator.VERTICAL_ALIGN_BOTTOM;</listing>
		 *
		 * @default PageIndicator.VERTICAL_ALIGN_MIDDLE
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
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected _gap:number = 0;

		/**
		 * The spacing, in pixels, between symbols.
		 *
		 * <p>In the following example, the gap between symbols is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * pages.gap = 20;</listing>
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
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * pages.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the top edge of the component
		 * and the top edge of the content.
		 *
		 * <p>In the following example, the top padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * pages.paddingTop = 20;</listing>
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _paddingRight:number = 0;

		/**
		 * The minimum space, in pixels, between the right edge of the component
		 * and the right edge of the content.
		 *
		 * <p>In the following example, the right padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * pages.paddingRight = 20;</listing>
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _paddingBottom:number = 0;

		/**
		 * The minimum space, in pixels, between the bottom edge of the component
		 * and the bottom edge of the content.
		 *
		 * <p>In the following example, the bottom padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * pages.paddingBottom = 20;</listing>
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _paddingLeft:number = 0;

		/**
		 * The minimum space, in pixels, between the left edge of the component
		 * and the left edge of the content.
		 *
		 * <p>In the following example, the left padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * pages.paddingLeft = 20;</listing>
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _normalSymbolFactory:Function = PageIndicator.defaultNormalSymbolFactory;

		/**
		 * A function used to create a normal symbol. May be any Starling
		 * display object.
		 *
		 * <p>This function should have the following signature:</p>
		 * <pre>function():DisplayObject</pre>
		 *
		 * <p>In the following example, a custom normal symbol factory is provided
		 * to the page indicator:</p>
		 *
		 * <listing version="3.0">
		 * pages.normalSymbolFactory = function():DisplayObject
		 * {
		 *     return new Image( texture );
		 * };</listing>
		 *
		 * @see http://doc.starling-framework.org/core/starling/display/DisplayObject.html starling.display.DisplayObject
		 * @see #selectedSymbolFactory
		 */
		public get normalSymbolFactory():Function
		{
			return this._normalSymbolFactory;
		}

		/**
		 * @private
		 */
		public set normalSymbolFactory(value:Function)
		{
			if(this._normalSymbolFactory == value)
			{
				return;
			}
			this._normalSymbolFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _selectedSymbolFactory:Function = PageIndicator.defaultSelectedSymbolFactory;

		/**
		 * A function used to create a selected symbol. May be any Starling
		 * display object.
		 *
		 * <p>This function should have the following signature:</p>
		 * <pre>function():DisplayObject</pre>
		 *
		 * <p>In the following example, a custom selected symbol factory is provided
		 * to the page indicator:</p>
		 *
		 * <listing version="3.0">
		 * pages.selectedSymbolFactory = function():DisplayObject
		 * {
		 *     return new Image( texture );
		 * };</listing>
		 *
		 * @see http://doc.starling-framework.org/core/starling/display/DisplayObject.html starling.display.DisplayObject
		 * @see #normalSymbolFactory
		 */
		public get selectedSymbolFactory():Function
		{
			return this._selectedSymbolFactory;
		}

		/**
		 * @private
		 */
		public set selectedSymbolFactory(value:Function)
		{
			if(this._selectedSymbolFactory == value)
			{
				return;
			}
			this._selectedSymbolFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var selectionInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SELECTED);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);

			if(dataInvalid || selectionInvalid || stylesInvalid)
			{
				this.refreshSymbols(stylesInvalid);
			}

			this.layoutSymbols(layoutInvalid);
		}

		/**
		 * @private
		 */
		protected refreshSymbols(symbolsInvalid:boolean):void
		{
			this.symbols.length = 0;
			var temp:DisplayObject[] = this.cache;
			if(symbolsInvalid)
			{
				var symbolCount:number = this.unselectedSymbols.length;
				for(var i:number = 0; i < symbolCount; i++)
				{
					var symbol:DisplayObject = this.unselectedSymbols.shift();
					this.removeChild(symbol, true);
				}
				if(this.selectedSymbol)
				{
					this.removeChild(this.selectedSymbol, true);
					this.selectedSymbol = null;
				}
			}
			this.cache = this.unselectedSymbols;
			this.unselectedSymbols = temp;
			for(i = 0; i < this._pageCount; i++)
			{
				if(i == this._selectedIndex)
				{
					if(!this.selectedSymbol)
					{
						this.selectedSymbol = this._selectedSymbolFactory();
						this.addChild(this.selectedSymbol);
					}
					this.symbols.push(this.selectedSymbol);
					if(this.selectedSymbol instanceof IValidating)
					{
						IValidating(this.selectedSymbol).validate();
					}
				}
				else
				{
					if(this.cache.length > 0)
					{
						symbol = this.cache.shift();
					}
					else
					{
						symbol = this._normalSymbolFactory();
						this.addChild(symbol);
					}
					this.unselectedSymbols.push(symbol);
					this.symbols.push(symbol);
					if(symbol instanceof IValidating)
					{
						IValidating(symbol).validate();
					}
				}
			}

			symbolCount = this.cache.length;
			for(i = 0; i < symbolCount; i++)
			{
				symbol = this.cache.shift();
				this.removeChild(symbol, true);
			}

		}

		/**
		 * @private
		 */
		protected layoutSymbols(layoutInvalid:boolean):void
		{
			if(layoutInvalid)
			{
				if(this._direction == PageIndicator.DIRECTION_VERTICAL && !(this._layout instanceof VerticalLayout))
				{
					this._layout = new VerticalLayout();
					IVirtualLayout(this._layout).useVirtualLayout = false;
				}
				else if(this._direction != PageIndicator.DIRECTION_VERTICAL && !(this._layout instanceof HorizontalLayout))
				{
					this._layout = new HorizontalLayout();
					IVirtualLayout(this._layout).useVirtualLayout = false;
				}
				if(this._layout instanceof VerticalLayout)
				{
					var verticalLayout:VerticalLayout = VerticalLayout(this._layout);
					verticalLayout.paddingTop = this._paddingTop;
					verticalLayout.paddingRight = this._paddingRight;
					verticalLayout.paddingBottom = this._paddingBottom;
					verticalLayout.paddingLeft = this._paddingLeft;
					verticalLayout.gap = this._gap;
					verticalLayout.horizontalAlign = this._horizontalAlign;
					verticalLayout.verticalAlign = this._verticalAlign;
				}
				if(this._layout instanceof HorizontalLayout)
				{
					var horizontalLayout:HorizontalLayout = HorizontalLayout(this._layout);
					horizontalLayout.paddingTop = this._paddingTop;
					horizontalLayout.paddingRight = this._paddingRight;
					horizontalLayout.paddingBottom = this._paddingBottom;
					horizontalLayout.paddingLeft = this._paddingLeft;
					horizontalLayout.gap = this._gap;
					horizontalLayout.horizontalAlign = this._horizontalAlign;
					horizontalLayout.verticalAlign = this._verticalAlign;
				}
			}
			PageIndicator.SUGGESTED_BOUNDS.x = PageIndicator.SUGGESTED_BOUNDS.y = 0;
			PageIndicator.SUGGESTED_BOUNDS.scrollX = PageIndicator.SUGGESTED_BOUNDS.scrollY = 0;
			PageIndicator.SUGGESTED_BOUNDS.explicitWidth = this.explicitWidth;
			PageIndicator.SUGGESTED_BOUNDS.explicitHeight = this.explicitHeight;
			PageIndicator.SUGGESTED_BOUNDS.maxWidth = this._maxWidth;
			PageIndicator.SUGGESTED_BOUNDS.maxHeight = this._maxHeight;
			PageIndicator.SUGGESTED_BOUNDS.minWidth = this._minWidth;
			PageIndicator.SUGGESTED_BOUNDS.minHeight = this._minHeight;
			this._layout.layout(this.symbols, PageIndicator.SUGGESTED_BOUNDS, PageIndicator.LAYOUT_RESULT);
			this.setSizeInternal(PageIndicator.LAYOUT_RESULT.contentWidth, PageIndicator.LAYOUT_RESULT.contentHeight, false);
		}

		/**
		 * @private
		 */
		protected touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled || this._pageCount < 2)
			{
				this.touchPointID = -1;
				return;
			}

			if(this.touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this, TouchPhase.ENDED, this.touchPointID);
				if(!touch)
				{
					return;
				}
				this.touchPointID = -1;
				touch.getLocation(this.stage, PageIndicator.HELPER_POINT);
				var isInBounds:boolean = this.contains(this.stage.hitTest(PageIndicator.HELPER_POINT, true));
				if(isInBounds)
				{
					var lastPageIndex:number = this._pageCount - 1;
					this.globalToLocal(PageIndicator.HELPER_POINT, PageIndicator.HELPER_POINT);
					if(this._direction == PageIndicator.DIRECTION_VERTICAL)
					{
						if(this._interactionMode == PageIndicator.INTERACTION_MODE_PRECISE)
						{
							var symbolHeight:number = this.selectedSymbol.height + (this.unselectedSymbols[0].height + this._gap) * lastPageIndex;
							var newIndex:number = Math.round(lastPageIndex * (PageIndicator.HELPER_POINT.y - this.symbols[0].y) / symbolHeight);
							if(newIndex < 0)
							{
								newIndex = 0;
							}
							else if(newIndex > lastPageIndex)
							{
								newIndex = lastPageIndex;
							}
							this.selectedIndex = newIndex;
						}
						else
						{
							if(PageIndicator.HELPER_POINT.y < this.selectedSymbol.y)
							{
								this.selectedIndex = Math.max(0, this._selectedIndex - 1);
							}
							if(PageIndicator.HELPER_POINT.y > (this.selectedSymbol.y + this.selectedSymbol.height))
							{
								this.selectedIndex = Math.min(lastPageIndex, this._selectedIndex + 1);
							}
						}
					}
					else
					{
						if(this._interactionMode == PageIndicator.INTERACTION_MODE_PRECISE)
						{
							var symbolWidth:number = this.selectedSymbol.width + (this.unselectedSymbols[0].width + this._gap) * lastPageIndex;
							newIndex = Math.round(lastPageIndex * (PageIndicator.HELPER_POINT.x - this.symbols[0].x) / symbolWidth);
							if(newIndex < 0)
							{
								newIndex = 0;
							}
							else if(newIndex >= this._pageCount)
							{
								newIndex = lastPageIndex;
							}
							this.selectedIndex = newIndex;
						}
						else
						{
							if(PageIndicator.HELPER_POINT.x < this.selectedSymbol.x)
							{
								this.selectedIndex = Math.max(0, this._selectedIndex - 1);
							}
							if(PageIndicator.HELPER_POINT.x > (this.selectedSymbol.x + this.selectedSymbol.width))
							{
								this.selectedIndex = Math.min(lastPageIndex, this._selectedIndex + 1);
							}
						}
					}
				}
			}
			else //if we get here, we don't have a saved touch ID yet
			{
				touch = event.getTouch(this, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				this.touchPointID = touch.id;
			}
		}

	}
}
