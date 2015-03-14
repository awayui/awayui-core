/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import PropertyProxy = feathers.core.PropertyProxy;
	import ToggleGroup = feathers.core.ToggleGroup;
	import ListCollection = feathers.data.ListCollection;
	import CollectionEventType = feathers.events.CollectionEventType;
	import HorizontalLayout = feathers.layout.HorizontalLayout;
	import LayoutBoundsResult = feathers.layout.LayoutBoundsResult;
	import VerticalLayout = feathers.layout.VerticalLayout;
	import ViewPortBounds = feathers.layout.ViewPortBounds;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/**
	 * Dispatched when the selected tab changes.
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

	/*[DefaultProperty("dataProvider")]*/
	/**
	 * A line of tabs (vertical or horizontal), where one may be selected at a
	 * time.
	 *
	 * <p>The following example sets the data provider, selects the second tab,
	 * and listens for when the selection changes:</p>
	 *
	 * <listing version="3.0">
	 * var tabs:TabBar = new TabBar();
	 * tabs.dataProvider = new ListCollection(
	 * [
	 *     { label: "One" },
	 *     { label: "Two" },
	 *     { label: "Three" },
	 * ]);
	 * tabs.selectedIndex = 1;
	 * tabs.addEventListener( Event.CHANGE, tabs_changeHandler );
	 * this.addChild( tabs );</listing>
	 *
	 * @see ../../../help/tab-bar.html How to use the Feathers TabBar component
	 */
	export class TabBar extends FeathersControl
	{
		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_TAB_FACTORY:string = "tabFactory";

		/**
		 * @private
		 */
		private static DEFAULT_TAB_FIELDS:string[] = new Array<string>("defaultIcon",
			"upIcon",
			"downIcon",
			"hoverIcon",
			"disabledIcon",
			"defaultSelectedIcon",
			"selectedUpIcon",
			"selectedDownIcon",
			"selectedHoverIcon",
			"selectedDisabledIcon");

		/**
		 * The tabs are displayed in order from left to right.
		 *
		 * @see #direction
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * The tabs are displayed in order from top to bottom.
		 *
		 * @see #direction
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The tabs will be aligned horizontally to the left edge of the tab
		 * bar.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * The tabs will be aligned horizontally to the center of the tab bar.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * The tabs will be aligned horizontally to the right edge of the tab
		 * bar.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_RIGHT:string = "right";

		/**
		 * If the direction is vertical, each tab will fill the entire width of
		 * the tab bar, and if the direction is horizontal, the alignment will
		 * behave the same as <code>HORIZONTAL_ALIGN_LEFT</code>.
		 *
		 * @see #horizontalAlign
		 * @see #direction
		 */
		public static HORIZONTAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The tabs will be aligned vertically to the top edge of the tab bar.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * The tabs will be aligned vertically to the middle of the tab bar.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * The tabs will be aligned vertically to the bottom edge of the tab
		 * bar.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * If the direction is horizontal, each tab will fill the entire height
		 * of the tab bar. If the direction is vertical, the alignment will
		 * behave the same as <code>VERTICAL_ALIGN_TOP</code>.
		 *
		 * @see #verticalAlign
		 * @see #direction
		 */
		public static VERTICAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The default value added to the <code>styleNameList</code> of the tabs.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_TAB:string = "feathers-tab-bar-tab";

		/**
		 * DEPRECATED: Replaced by <code>TabBar.DEFAULT_CHILD_STYLE_NAME_TAB</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see TabBar#DEFAULT_CHILD_STYLE_NAME_TAB
		 */
		public static DEFAULT_CHILD_NAME_TAB:string = TabBar.DEFAULT_CHILD_STYLE_NAME_TAB;

		/**
		 * The default <code>IStyleProvider</code> for all <code>TabBar</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static defaultTabFactory():ToggleButton
		{
			return new ToggleButton();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
		}

		/**
		 * The value added to the <code>styleNameList</code> of the tabs. This
		 * variable is <code>protected</code> so that sub-classes can customize
		 * the tab style name in their constructors instead of using the default
		 * style name defined by <code>DEFAULT_CHILD_STYLE_NAME_TAB</code>.
		 *
		 * <p>To customize the tab style name without subclassing, see
		 * <code>customTabStyleName</code>.</p>
		 *
		 * @see #customTabStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected tabStyleName:string = TabBar.DEFAULT_CHILD_STYLE_NAME_TAB;

		/**
		 * DEPRECATED: Replaced by <code>tabStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #tabStyleName
		 */
		protected get tabName():string
		{
			return this.tabStyleName;
		}

		/**
		 * @private
		 */
		protected set tabName(value:string)
		{
			this.tabStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the first tab.
		 * This variable is <code>protected</code> so that sub-classes can
		 * customize the first tab style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_TAB</code>.
		 *
		 * <p>To customize the first tab name without subclassing, see
		 * <code>customFirstTabName</code>.</p>
		 *
		 * @see #customFirstTabName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected firstTabStyleName:string = TabBar.DEFAULT_CHILD_STYLE_NAME_TAB;

		/**
		 * DEPRECATED: Replaced by <code>firstTabStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #firstTabStyleName
		 */
		protected get firstTabName():string
		{
			return this.firstTabStyleName;
		}

		/**
		 * @private
		 */
		protected set firstTabName(value:string)
		{
			this.firstTabStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the last tab.
		 * This variable is <code>protected</code> so that sub-classes can
		 * customize the last tab style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_TAB</code>.
		 *
		 * <p>To customize the last tab name without subclassing, see
		 * <code>customLastTabName</code>.</p>
		 *
		 * @see #customLastTabName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected lastTabStyleName:string = TabBar.DEFAULT_CHILD_STYLE_NAME_TAB;

		/**
		 * DEPRECATED: Replaced by <code>lastTabStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #lastTabStyleName
		 */
		protected get lastTabName():string
		{
			return this.lastTabStyleName;
		}

		/**
		 * @private
		 */
		protected set lastTabName(value:string)
		{
			this.lastTabStyleName = value;
		}

		/**
		 * The toggle group.
		 */
		protected toggleGroup:ToggleGroup;

		/**
		 * @private
		 */
		protected activeFirstTab:ToggleButton;

		/**
		 * @private
		 */
		protected inactiveFirstTab:ToggleButton;

		/**
		 * @private
		 */
		protected activeLastTab:ToggleButton;

		/**
		 * @private
		 */
		protected inactiveLastTab:ToggleButton;

		/**
		 * @private
		 */
		protected _layoutItems:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected activeTabs:ToggleButton[] = new Array<ToggleButton>();

		/**
		 * @private
		 */
		protected inactiveTabs:ToggleButton[] = new Array<ToggleButton>();

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return TabBar.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _dataProvider:ListCollection;

		/**
		 * The collection of data to be displayed with tabs. The default
		 * <em>tab initializer</em> interprets this data to customize the tabs
		 * with various fields available to buttons, including the following:
		 *
		 * <ul>
		 *     <li>label</li>
		 *     <li>defaultIcon</li>
		 *     <li>upIcon</li>
		 *     <li>downIcon</li>
		 *     <li>hoverIcon</li>
		 *     <li>disabledIcon</li>
		 *     <li>defaultSelectedIcon</li>
		 *     <li>selectedUpIcon</li>
		 *     <li>selectedDownIcon</li>
		 *     <li>selectedHoverIcon</li>
		 *     <li>selectedDisabledIcon</li>
		 * </ul>
		 *
		 * <p>The following example passes in a data provider:</p>
		 *
		 * <listing version="3.0">
		 * list.dataProvider = new ListCollection(
		 * [
		 *     { label: "General", defaultIcon: new Image( generalTexture ) },
		 *     { label: "Security", defaultIcon: new Image( securityTexture ) },
		 *     { label: "Advanced", defaultIcon: new Image( advancedTexture ) },
		 * ]);</listing>
		 *
		 * @default null
		 *
		 * @see #tabInitializer
		 */
		public get dataProvider():ListCollection
		{
			return this._dataProvider;
		}

		/**
		 * @private
		 */
		public set dataProvider(value:ListCollection)
		{
			if(this._dataProvider == value)
			{
				return;
			}
			var oldSelectedIndex:number = this.selectedIndex;
			var oldSelectedItem:Object = this.selectedItem;
			if(this._dataProvider)
			{
				this._dataProvider.removeEventListener(CollectionEventType.ADD_ITEM, this.dataProvider_addItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.REMOVE_ITEM, this.dataProvider_removeItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.REPLACE_ITEM, this.dataProvider_replaceItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.UPDATE_ITEM, this.dataProvider_updateItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.RESET, this.dataProvider_resetHandler);
			}
			this._dataProvider = value;
			if(this._dataProvider)
			{
				this._dataProvider.addEventListener(CollectionEventType.ADD_ITEM, this.dataProvider_addItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.REMOVE_ITEM, this.dataProvider_removeItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.REPLACE_ITEM, this.dataProvider_replaceItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.UPDATE_ITEM, this.dataProvider_updateItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.RESET, this.dataProvider_resetHandler);
			}
			if(!this._dataProvider || this._dataProvider.length == 0)
			{
				this.selectedIndex = -1;
			}
			else
			{
				this.selectedIndex = 0;
			}
			//this ensures that Event.CHANGE will dispatch for selectedItem
			//changing, even if selectedIndex has not changed.
			if(this.selectedIndex == oldSelectedIndex && this.selectedItem != oldSelectedItem)
			{
				this.dispatchEventWith(Event.CHANGE);
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected verticalLayout:VerticalLayout;

		/**
		 * @private
		 */
		protected horizontalLayout:HorizontalLayout;

		/**
		 * @private
		 */
		protected _viewPortBounds:ViewPortBounds = new ViewPortBounds();

		/**
		 * @private
		 */
		protected _layoutResult:LayoutBoundsResult = new LayoutBoundsResult();

		/**
		 * @private
		 */
		protected _direction:string = TabBar.DIRECTION_HORIZONTAL;

		/*[Inspectable(type="String",enumeration="horizontal,vertical")]*/
		/**
		 * The tab bar layout is either vertical or horizontal.
		 *
		 * <p>In the following example, the tab bar's direction is set to
		 * vertical:</p>
		 *
		 * <listing version="3.0">
		 * tabs.direction = TabBar.DIRECTION_VERTICAL;</listing>
		 *
		 * @default TabBar.DIRECTION_HORIZONTAL
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _horizontalAlign:string = TabBar.HORIZONTAL_ALIGN_JUSTIFY;

		/*[Inspectable(type="String",enumeration="left,center,right,justify")]*/
		/**
		 * Determines how the tabs are horizontally aligned within the bounds
		 * of the tab bar (on the x-axis).
		 *
		 * <p>The following example aligns the tabs to the left:</p>
		 *
		 * <listing version="3.0">
		 * tabs.horizontalAlign = TabBar.HORIZONTAL_ALIGN_LEFT;</listing>
		 *
		 * @default TabBar.HORIZONTAL_ALIGN_JUSTIFY
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _verticalAlign:string = TabBar.VERTICAL_ALIGN_JUSTIFY;

		/*[Inspectable(type="String",enumeration="top,middle,bottom,justify")]*/
		/**
		 * Determines how the tabs are vertically aligned within the bounds
		 * of the tab bar (on the y-axis).
		 *
		 * <p>The following example aligns the tabs to the top:</p>
		 *
		 * <listing version="3.0">
		 * tabs.verticalAlign = TabBar.VERTICAL_ALIGN_TOP;</listing>
		 *
		 * @default TabBar.VERTICAL_ALIGN_JUSTIFY
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _distributeTabSizes:boolean = true;

		/**
		 * If <code>true</code>, the tabs will be equally sized in the direction
		 * of the layout. In other words, if the tab bar is horizontal, each tab
		 * will have the same width, and if the tab bar is vertical, each tab
		 * will have the same height. If <code>false</code>, the tabs will be
		 * sized to their ideal dimensions.
		 *
		 * <p>The following example aligns the tabs to the middle without distributing them:</p>
		 *
		 * <listing version="3.0">
		 * tabs.direction = TabBar.DIRECTION_VERTICAL;
		 * tabs.verticalAlign = TabBar.VERTICAL_ALIGN_MIDDLE;
		 * tabs.distributeTabSizes = false;</listing>
		 *
		 * @default true
		 */
		public get distributeTabSizes():boolean
		{
			return this._distributeTabSizes;
		}

		/**
		 * @private
		 */
		public set distributeTabSizes(value:boolean)
		{
			if(this._distributeTabSizes == value)
			{
				return;
			}
			this._distributeTabSizes = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _gap:number = 0;

		/**
		 * Space, in pixels, between tabs.
		 *
		 * <p>In the following example, the tab bar's gap is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * tabs.gap = 20;</listing>
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _firstGap:number = NaN;

		/**
		 * Space, in pixels, between the first two tabs. If <code>NaN</code>,
		 * the default <code>gap</code> property will be used.
		 *
		 * <p>The following example sets the gap between the first and second
		 * tab to a different value than the standard gap:</p>
		 *
		 * <listing version="3.0">
		 * tabs.firstGap = 30;
		 * tabs.gap = 20;</listing>
		 *
		 * @default NaN
		 *
		 * @see #gap
		 * @see #lastGap
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _lastGap:number = NaN;

		/**
		 * Space, in pixels, between the last two tabs. If <code>NaN</code>,
		 * the default <code>gap</code> property will be used.
		 *
		 * <p>The following example sets the gap between the last and next to last
		 * tab to a different value than the standard gap:</p>
		 *
		 * <listing version="3.0">
		 * tabs.lastGap = 30;
		 * tabs.gap = 20;</listing>
		 *
		 * @default NaN
		 *
		 * @see #gap
		 * @see #firstGap
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the padding of all sides of the tab bar
		 * is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * tabs.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the tab bar's top edge and the
		 * tabs.
		 *
		 * <p>In the following example, the padding on the top edge of the
		 * tab bar is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * tabs.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the tab bar's right edge and
		 * the tabs.
		 *
		 * <p>In the following example, the padding on the right edge of the
		 * tab bar is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * tabs.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the tab bar's bottom edge and
		 * the tabs.
		 *
		 * <p>In the following example, the padding on the bottom edge of the
		 * tab bar is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * tabs.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the tab bar's left edge and the
		 * tabs.
		 *
		 * <p>In the following example, the padding on the left edge of the
		 * tab bar is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * tabs.paddingLeft = 20;</listing>
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
		protected _tabFactory:Function = TabBar.defaultTabFactory;

		/**
		 * Creates a new tab. A tab must be an instance of <code>ToggleButton</code>.
		 * This factory can be used to change properties on the tabs when they
		 * are first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on a tab.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():ToggleButton</pre>
		 *
		 * <p>In the following example, a custom tab factory is passed to the
		 * tab bar:</p>
		 *
		 * <listing version="3.0">
		 * tabs.tabFactory = function():ToggleButton
		 * {
		 *     var tab:ToggleButton = new ToggleButton();
		 *     tab.defaultSkin = new Image( upTexture );
		 *     tab.defaultSelectedSkin = new Image( selectedTexture );
		 *     tab.downSkin = new Image( downTexture );
		 *     return tab;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.ToggleButton
		 * @see #firstTabFactory
		 * @see #lastTabFactory
		 */
		public get tabFactory():Function
		{
			return this._tabFactory;
		}

		/**
		 * @private
		 */
		public set tabFactory(value:Function)
		{
			if(this._tabFactory == value)
			{
				return;
			}
			this._tabFactory = value;
			this.invalidate(TabBar.INVALIDATION_FLAG_TAB_FACTORY);
		}

		/**
		 * @private
		 */
		protected _firstTabFactory:Function;

		/**
		 * Creates a new first tab. If the <code>firstTabFactory</code> is
		 * <code>null</code>, then the tab bar will use the <code>tabFactory</code>.
		 * The first tab must be an instance of <code>ToggleButton</code>. This
		 * factory can be used to change properties on the first tab when it
		 * is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the first tab.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():ToggleButton</pre>
		 *
		 * <p>In the following example, a custom first tab factory is passed to the
		 * tab bar:</p>
		 *
		 * <listing version="3.0">
		 * tabs.firstTabFactory = function():ToggleButton
		 * {
		 *     var tab:ToggleButton = new ToggleButton();
		 *     tab.defaultSkin = new Image( upTexture );
		 *     tab.defaultSelectedSkin = new Image( selectedTexture );
		 *     tab.downSkin = new Image( downTexture );
		 *     return tab;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.ToggleButton
		 * @see #tabFactory
		 * @see #lastTabFactory
		 */
		public get firstTabFactory():Function
		{
			return this._firstTabFactory;
		}

		/**
		 * @private
		 */
		public set firstTabFactory(value:Function)
		{
			if(this._firstTabFactory == value)
			{
				return;
			}
			this._firstTabFactory = value;
			this.invalidate(TabBar.INVALIDATION_FLAG_TAB_FACTORY);
		}

		/**
		 * @private
		 */
		protected _lastTabFactory:Function;

		/**
		 * Creates a new last tab. If the <code>lastTabFactory</code> is
		 * <code>null</code>, then the tab bar will use the <code>tabFactory</code>.
		 * The last tab must be an instance of <code>Button</code>. This
		 * factory can be used to change properties on the last tab when it
		 * is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the last tab.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():ToggleButton</pre>
		 *
		 * <p>In the following example, a custom last tab factory is passed to the
		 * tab bar:</p>
		 *
		 * <listing version="3.0">
		 * tabs.lastTabFactory = function():ToggleButton
		 * {
		 *     var tab:ToggleButton = new Button();
		 *     tab.defaultSkin = new Image( upTexture );
		 *     tab.defaultSelectedSkin = new Image( selectedTexture );
		 *     tab.downSkin = new Image( downTexture );
		 *     return tab;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #tabFactory
		 * @see #firstTabFactory
		 */
		public get lastTabFactory():Function
		{
			return this._lastTabFactory;
		}

		/**
		 * @private
		 */
		public set lastTabFactory(value:Function)
		{
			if(this._lastTabFactory == value)
			{
				return;
			}
			this._lastTabFactory = value;
			this.invalidate(TabBar.INVALIDATION_FLAG_TAB_FACTORY);
		}

		/**
		 * @private
		 */
		protected _tabInitializer:Function = this.defaultTabInitializer;

		/**
		 * Modifies the properties of an individual tab, using an item from the
		 * data provider. The default initializer will set the tab's label and
		 * icons. A custom tab initializer can be provided to update additional
		 * properties or to use different field names in the data provider.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 * <pre>function( tab:ToggleButton, item:Object ):void</pre>
		 *
		 * <p>In the following example, a custom tab initializer is passed to the
		 * tab bar:</p>
		 *
		 * <listing version="3.0">
		 * tabs.tabInitializer = function( tab:ToggleButton, item:Object ):void
		 * {
		 *     tab.label = item.text;
		 *     tab.defaultIcon = item.icon;
		 * };</listing>
		 *
		 * @see #dataProvider
		 */
		public get tabInitializer():Function
		{
			return this._tabInitializer;
		}

		/**
		 * @private
		 */
		public set tabInitializer(value:Function)
		{
			if(this._tabInitializer == value)
			{
				return;
			}
			this._tabInitializer = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _ignoreSelectionChanges:boolean = false;

		/**
		 * @private
		 */
		protected _selectedIndex:number = -1;

		/**
		 * The index of the currently selected tab. Returns -1 if no tab is
		 * selected.
		 *
		 * <p>In the following example, the tab bar's selected index is changed:</p>
		 *
		 * <listing version="3.0">
		 * tabs.selectedIndex = 2;</listing>
		 *
		 * <p>The following example listens for when selection changes and
		 * requests the selected index:</p>
		 *
		 * <listing version="3.0">
		 * function tabs_changeHandler( event:Event ):void
		 * {
		 *     var tabs:TabBar = TabBar( event.currentTarget );
		 *     var index:int = tabs.selectedIndex;
		 *
		 * }
		 * tabs.addEventListener( Event.CHANGE, tabs_changeHandler );</listing>
		 *
		 * @default -1
		 *
		 * @see #selectedItem
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
			if(this._selectedIndex == value)
			{
				return;
			}
			this._selectedIndex = value;
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * The currently selected item from the data provider. Returns
		 * <code>null</code> if no item is selected.
		 *
		 * <p>In the following example, the tab bar's selected item is changed:</p>
		 *
		 * <listing version="3.0">
		 * tabs.selectedItem = tabs.dataProvider.getItemAt(2);</listing>
		 *
		 * <p>The following example listens for when selection changes and
		 * requests the selected item:</p>
		 *
		 * <listing version="3.0">
		 * function tabs_changeHandler( event:Event ):void
		 * {
		 *     var tabs:TabBar = TabBar( event.currentTarget );
		 *     var item:Object = tabs.selectedItem;
		 *
		 * }
		 * tabs.addEventListener( Event.CHANGE, tabs_changeHandler );</listing>
		 *
		 * @default null
		 *
		 * @see #selectedIndex
		 */
		public get selectedItem():Object
		{
			var index:number = this.selectedIndex;
			if(!this._dataProvider || index < 0 || index >= this._dataProvider.length)
			{
				return null;
			}
			return this._dataProvider.getItemAt(index);
		}

		/**
		 * @private
		 */
		public set selectedItem(value:Object)
		{
			if(!this._dataProvider)
			{
				this.selectedIndex = -1;
				return;
			}
			this.selectedIndex = this._dataProvider.getItemIndex(value);
		}

		/**
		 * @private
		 */
		protected _customTabStyleName:string;

		/**
		 * A style name to add to all tabs in this tab bar. Typically used by a
		 * theme to provide different styles to different tab bars.
		 *
		 * <p>In the following example, a custom tab style name is provided to
		 * the tab bar:</p>
		 *
		 * <listing version="3.0">
		 * tabs.customTabStyleName = "my-custom-tab";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( ToggleButton ).setFunctionForStyleName( "my-custom-tab", setCustomTabStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_TAB
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public get customTabStyleName():string
		{
			return this._customTabStyleName;
		}

		/**
		 * @private
		 */
		public set customTabStyleName(value:string)
		{
			if(this._customTabStyleName == value)
			{
				return;
			}
			this._customTabStyleName = value;
			this.invalidate(TabBar.INVALIDATION_FLAG_TAB_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customTabStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customTabStyleName
		 */
		public get customTabName():string
		{
			return this.customTabStyleName;
		}

		/**
		 * @private
		 */
		public set customTabName(value:string)
		{
			this.customTabStyleName = value;
		}

		/**
		 * @private
		 */
		protected _customFirstTabStyleName:string;

		/**
		 * A style name to add to the first tab in this tab bar. Typically used
		 * by a theme to provide different styles to the first tab.
		 *
		 * <p>In the following example, a custom first tab style name is
		 * provided to the tab bar:</p>
		 *
		 * <listing version="3.0">
		 * tabs.customFirstTabStyleName = "my-custom-first-tab";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( ToggleButton ).setFunctionForStyleName( "my-custom-first-tab", setCustomFirstTabStyles );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public get customFirstTabStyleName():string
		{
			return this._customFirstTabStyleName;
		}

		/**
		 * @private
		 */
		public set customFirstTabStyleName(value:string)
		{
			if(this._customFirstTabStyleName == value)
			{
				return;
			}
			this._customFirstTabStyleName = value;
			this.invalidate(TabBar.INVALIDATION_FLAG_TAB_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customFirstTabStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customFirstTabStyleName
		 */
		public get customFirstTabName():string
		{
			return this.customFirstTabStyleName;
		}

		/**
		 * @private
		 */
		public set customFirstTabName(value:string)
		{
			this.customFirstTabStyleName = value;
		}

		/**
		 * @private
		 */
		protected _customLastTabStyleName:string;

		/**
		 * A style name to add to the last tab in this tab bar. Typically used
		 * by a theme to provide different styles to the last tab.
		 *
		 * <p>In the following example, a custom last tab style name is provided
		 * to the tab bar:</p>
		 *
		 * <listing version="3.0">
		 * tabs.customLastTabStyleName = "my-custom-last-tab";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( ToggleButton ).setFunctionForStyleName( "my-custom-last-tab", setCustomLastTabStyles );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public get customLastTabStyleName():string
		{
			return this._customLastTabStyleName;
		}

		/**
		 * @private
		 */
		public set customLastTabStyleName(value:string)
		{
			if(this._customLastTabStyleName == value)
			{
				return;
			}
			this._customLastTabStyleName = value;
			this.invalidate(TabBar.INVALIDATION_FLAG_TAB_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customLastTabStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customLastTabStyleName
		 */
		public get customLastTabName():string
		{
			return this.customLastTabStyleName;
		}

		/**
		 * @private
		 */
		public set customLastTabName(value:string)
		{
			this.customLastTabStyleName = value;
		}

		/**
		 * @private
		 */
		protected _tabProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to all of the tab bar's
		 * tabs. These values are shared by each tabs, so values that cannot be
		 * shared (such as display objects that need to be added to the display
		 * list) should be passed to tabs using the <code>tabFactory</code> or
		 * in a theme. The buttons in a tab bar are instances of
		 * <code>feathers.controls.Button</code> that are created by
		 * <code>tabFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>tabFactory</code> function instead
		 * of using <code>tabProperties</code> will result in better
		 * performance.</p>
		 *
		 * <p>In the following example, the tab bar's tab properties are updated:</p>
		 *
		 * <listing version="3.0">
		 * tabs.tabProperties.iconPosition = Button.ICON_POSITION_RIGHT;</listing>
		 *
		 * @default null
		 *
		 * @see #tabFactory
		 * @see feathers.controls.Button
		 */
		public get tabProperties():Object
		{
			if(!this._tabProperties)
			{
				this._tabProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._tabProperties;
		}

		/**
		 * @private
		 */
		public set tabProperties(value:Object)
		{
			if(this._tabProperties == value)
			{
				return;
			}
			if(!value)
			{
				value = new PropertyProxy();
			}
			if(!(value instanceof PropertyProxy))
			{
				var newValue:PropertyProxy = new PropertyProxy();
				for(var propertyName:string in value)
				{
					newValue[propertyName] = value[propertyName];
				}
				value = newValue;
			}
			if(this._tabProperties)
			{
				this._tabProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._tabProperties = PropertyProxy(value);
			if(this._tabProperties)
			{
				this._tabProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			//clearing selection now so that the data provider setter won't
			//cause a selection change that triggers events.
			this._selectedIndex = -1;
			this.dataProvider = null;
			super.dispose();
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			this.toggleGroup = new ToggleGroup();
			this.toggleGroup.isSelectionRequired = true;
			this.toggleGroup.addEventListener(Event.CHANGE, this.toggleGroup_changeHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var selectionInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SELECTED);
			var tabFactoryInvalid:boolean = this.isInvalid(TabBar.INVALIDATION_FLAG_TAB_FACTORY);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);

			if(dataInvalid || tabFactoryInvalid)
			{
				this.refreshTabs(tabFactoryInvalid);
			}

			if(dataInvalid || tabFactoryInvalid || stylesInvalid)
			{
				this.refreshTabStyles();
			}

			if(dataInvalid || tabFactoryInvalid || selectionInvalid)
			{
				this.commitSelection();
			}

			if(dataInvalid || tabFactoryInvalid || stateInvalid)
			{
				this.commitEnabled();
			}

			if(stylesInvalid)
			{
				this.refreshLayoutStyles();
			}

			this.layoutTabs();
		}

		/**
		 * @private
		 */
		protected commitSelection():void
		{
			this.toggleGroup.selectedIndex = this._selectedIndex;
		}

		/**
		 * @private
		 */
		protected commitEnabled():void
		{
			for each(var tab:ToggleButton in this.activeTabs)
			{
				tab.isEnabled = this._isEnabled;
			}
		}

		/**
		 * @private
		 */
		protected refreshTabStyles():void
		{
			for(var propertyName:string in this._tabProperties)
			{
				var propertyValue:Object = this._tabProperties[propertyName];
				for each(var tab:ToggleButton in this.activeTabs)
				{
					tab[propertyName] = propertyValue;
				}
			}
		}

		/**
		 * @private
		 */
		protected refreshLayoutStyles():void
		{
			if(this._direction == TabBar.DIRECTION_VERTICAL)
			{
				if(this.horizontalLayout)
				{
					this.horizontalLayout = null;
				}
				if(!this.verticalLayout)
				{
					this.verticalLayout = new VerticalLayout();
					this.verticalLayout.useVirtualLayout = false;
				}
				this.verticalLayout.distributeHeights = this._distributeTabSizes;
				this.verticalLayout.horizontalAlign = this._horizontalAlign;
				this.verticalLayout.verticalAlign = (this._verticalAlign == TabBar.VERTICAL_ALIGN_JUSTIFY) ? TabBar.VERTICAL_ALIGN_TOP : this._verticalAlign;
				this.verticalLayout.gap = this._gap;
				this.verticalLayout.firstGap = this._firstGap;
				this.verticalLayout.lastGap = this._lastGap;
				this.verticalLayout.paddingTop = this._paddingTop;
				this.verticalLayout.paddingRight = this._paddingRight;
				this.verticalLayout.paddingBottom = this._paddingBottom;
				this.verticalLayout.paddingLeft = this._paddingLeft;
			}
			else //horizontal
			{
				if(this.verticalLayout)
				{
					this.verticalLayout = null;
				}
				if(!this.horizontalLayout)
				{
					this.horizontalLayout = new HorizontalLayout();
					this.horizontalLayout.useVirtualLayout = false;
				}
				this.horizontalLayout.distributeWidths = this._distributeTabSizes;
				this.horizontalLayout.horizontalAlign = (this._horizontalAlign == TabBar.HORIZONTAL_ALIGN_JUSTIFY) ? TabBar.HORIZONTAL_ALIGN_LEFT : this._horizontalAlign;
				this.horizontalLayout.verticalAlign = this._verticalAlign;
				this.horizontalLayout.gap = this._gap;
				this.horizontalLayout.firstGap = this._firstGap;
				this.horizontalLayout.lastGap = this._lastGap;
				this.horizontalLayout.paddingTop = this._paddingTop;
				this.horizontalLayout.paddingRight = this._paddingRight;
				this.horizontalLayout.paddingBottom = this._paddingBottom;
				this.horizontalLayout.paddingLeft = this._paddingLeft;
			}
		}

		/**
		 * @private
		 */
		protected defaultTabInitializer(tab:ToggleButton, item:Object):void
		{
			if(item instanceof Object)
			{
				if(item.hasOwnProperty("label"))
				{
					tab.label = item.label;
				}
				else
				{
					tab.label = item.toString();
				}
				for each(var field:string in TabBar.DEFAULT_TAB_FIELDS)
				{
					if(item.hasOwnProperty(field))
					{
						tab[field] = item[field];
					}
				}
			}
			else
			{
				tab.label = "";
			}

		}

		/**
		 * @private
		 */
		protected refreshTabs(isFactoryInvalid:boolean):void
		{
			var oldIgnoreSelectionChanges:boolean = this._ignoreSelectionChanges;
			this._ignoreSelectionChanges = true;
			var oldSelectedIndex:number = this.toggleGroup.selectedIndex;
			this.toggleGroup.removeAllItems();
			var temp:ToggleButton[] = this.inactiveTabs;
			this.inactiveTabs = this.activeTabs;
			this.activeTabs = temp;
			this.activeTabs.length = 0;
			this._layoutItems.length = 0;
			temp = null;
			if(isFactoryInvalid)
			{
				this.clearInactiveTabs();
			}
			else
			{
				if(this.activeFirstTab)
				{
					this.inactiveTabs.shift();
				}
				this.inactiveFirstTab = this.activeFirstTab;

				if(this.activeLastTab)
				{
					this.inactiveTabs.pop();
				}
				this.inactiveLastTab = this.activeLastTab;
			}
			this.activeFirstTab = null;
			this.activeLastTab = null;

			var pushIndex:number = 0;
			var itemCount:number = this._dataProvider ? this._dataProvider.length : 0;
			var lastItemIndex:number = itemCount - 1;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:Object = this._dataProvider.getItemAt(i);
				if(i == 0)
				{
					var tab:ToggleButton = this.activeFirstTab = this.createFirstTab(item);
				}
				else if(i == lastItemIndex)
				{
					tab = this.activeLastTab = this.createLastTab(item);
				}
				else
				{
					tab = this.createTab(item);
				}
				this.toggleGroup.addItem(tab);
				this.activeTabs[pushIndex] = tab;
				this._layoutItems[pushIndex] = tab;
				pushIndex++;
			}

			this.clearInactiveTabs();
			this._ignoreSelectionChanges = oldIgnoreSelectionChanges;
			if(oldSelectedIndex >= 0)
			{
				var newSelectedIndex:number = this.activeTabs.length - 1;
				if(oldSelectedIndex < newSelectedIndex)
				{
					newSelectedIndex = oldSelectedIndex;
				}
				//removing all items from the ToggleGroup clears the selection,
				//so we need to set it back to the old value (or a new clamped
				//value). we want the change event to dispatch only if the old
				//value and the new value don't match.
				this._ignoreSelectionChanges = oldSelectedIndex == newSelectedIndex;
				this.toggleGroup.selectedIndex = newSelectedIndex;
				this._ignoreSelectionChanges = oldIgnoreSelectionChanges;
			}
		}

		/**
		 * @private
		 */
		protected clearInactiveTabs():void
		{
			var itemCount:number = this.inactiveTabs.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var tab:ToggleButton = this.inactiveTabs.shift();
				this.destroyTab(tab);
			}

			if(this.inactiveFirstTab)
			{
				this.destroyTab(this.inactiveFirstTab);
				this.inactiveFirstTab = null;
			}

			if(this.inactiveLastTab)
			{
				this.destroyTab(this.inactiveLastTab);
				this.inactiveLastTab = null;
			}
		}

		/**
		 * @private
		 */
		protected createFirstTab(item:Object):ToggleButton
		{
			if(this.inactiveFirstTab)
			{
				var tab:ToggleButton = this.inactiveFirstTab;
				this.inactiveFirstTab = null;
			}
			else
			{
				var factory:Function = this._firstTabFactory != null ? this._firstTabFactory : this._tabFactory;
				tab = this.ToggleButton(factory());
				if(this._customFirstTabStyleName)
				{
					tab.styleNameList.add(this._customFirstTabStyleName);
				}
				else if(this._customTabStyleName)
				{
					tab.styleNameList.add(this._customTabStyleName);
				}
				else
				{
					tab.styleNameList.add(this.firstTabStyleName);
				}
				tab.isToggle = true;
				this.addChild(tab);
			}
			this._tabInitializer(tab, item);
			return tab;
		}

		/**
		 * @private
		 */
		protected createLastTab(item:Object):ToggleButton
		{
			if(this.inactiveLastTab)
			{
				var tab:ToggleButton = this.inactiveLastTab;
				this.inactiveLastTab = null;
			}
			else
			{
				var factory:Function = this._lastTabFactory != null ? this._lastTabFactory : this._tabFactory;
				tab = this.ToggleButton(factory());
				if(this._customLastTabStyleName)
				{
					tab.styleNameList.add(this._customLastTabStyleName);
				}
				else if(this._customTabStyleName)
				{
					tab.styleNameList.add(this._customTabStyleName);
				}
				else
				{
					tab.styleNameList.add(this.lastTabStyleName);
				}
				tab.isToggle = true;
				this.addChild(tab);
			}
			this._tabInitializer(tab, item);
			return tab;
		}

		/**
		 * @private
		 */
		protected createTab(item:Object):ToggleButton
		{
			if(this.inactiveTabs.length == 0)
			{
				var tab:ToggleButton = this._tabFactory();
				if(this._customTabStyleName)
				{
					tab.styleNameList.add(this._customTabStyleName);
				}
				else
				{
					tab.styleNameList.add(this.tabStyleName);
				}
				tab.isToggle = true;
				this.addChild(tab);
			}
			else
			{
				tab = this.inactiveTabs.shift();
			}
			this._tabInitializer(tab, item);
			return tab;
		}

		/**
		 * @private
		 */
		protected destroyTab(tab:ToggleButton):void
		{
			this.toggleGroup.removeItem(tab);
			this.removeChild(tab, true);
		}

		/**
		 * @private
		 */
		protected layoutTabs():void
		{
			this._viewPortBounds.x = 0;
			this._viewPortBounds.y = 0;
			this._viewPortBounds.scrollX = 0;
			this._viewPortBounds.scrollY = 0;
			this._viewPortBounds.explicitWidth = this.explicitWidth;
			this._viewPortBounds.explicitHeight = this.explicitHeight;
			this._viewPortBounds.minWidth = this._minWidth;
			this._viewPortBounds.minHeight = this._minHeight;
			this._viewPortBounds.maxWidth = this._maxWidth;
			this._viewPortBounds.maxHeight = this._maxHeight;
			if(this.verticalLayout)
			{
				this.verticalLayout.layout(this._layoutItems, this._viewPortBounds, this._layoutResult);
			}
			else if(this.horizontalLayout)
			{
				this.horizontalLayout.layout(this._layoutItems, this._viewPortBounds, this._layoutResult);
			}
			this.setSizeInternal(this._layoutResult.contentWidth, this._layoutResult.contentHeight, false);
			//final validation to avoid juggler next frame issues
			for each(var tab:ToggleButton in this.activeTabs)
			{
				tab.validate();
			}
		}

		/**
		 * @private
		 */
		protected childProperties_onChange(proxy:PropertyProxy, name:string):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected toggleGroup_changeHandler(event:Event):void
		{
			if(this._ignoreSelectionChanges)
			{
				return;
			}
			this.selectedIndex = this.toggleGroup.selectedIndex;
		}

		/**
		 * @private
		 */
		protected dataProvider_addItemHandler(event:Event, index:number):void
		{
			if(this._selectedIndex >= index)
			{
				//we're keeping the same selected item, but the selected index
				//will change, so we need to manually dispatch the change event
				this.selectedIndex += 1;
				this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected dataProvider_removeItemHandler(event:Event, index:number):void
		{
			if(this._selectedIndex > index)
			{
				//the same item is selected, but its index has changed.
				this.selectedIndex -= 1;
			}
			else if(this._selectedIndex == index)
			{
				var oldIndex:number = this._selectedIndex;
				var newIndex:number = oldIndex;
				var maxIndex:number = this._dataProvider.length - 1;
				if(newIndex > maxIndex)
				{
					newIndex = maxIndex;
				}
				if(oldIndex == newIndex)
				{
					//we're keeping the same selected index, but the selected
					//item will change, so we need to manually dispatch the
					//change event
					this.invalidate(this.INVALIDATION_FLAG_SELECTED);
					this.dispatchEventWith(Event.CHANGE);
				}
				else
				{
					//we're selecting both a different index and a different
					//item, so we'll just call the selectedIndex setter
					this.selectedIndex = newIndex;
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected dataProvider_resetHandler(event:Event):void
		{
			if(this._dataProvider.length > 0)
			{
				//the data provider has changed drastically. we should reset the
				//selection to the first item.
				if(this._selectedIndex != 0)
				{
					this.selectedIndex = 0;
				}
				else
				{
					//we're keeping the same selected index, but the selected
					//item will change, so we need to manually dispatch the
					//change event
					this.invalidate(this.INVALIDATION_FLAG_SELECTED);
					this.dispatchEventWith(Event.CHANGE);
				}
			}
			else if(this._selectedIndex >= 0)
			{
				this.selectedIndex = -1;
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected dataProvider_replaceItemHandler(event:Event, index:number):void
		{
			if(this._selectedIndex == index)
			{
				//we're keeping the same selected index, but the selected
				//item will change, so we need to manually dispatch the
				//change event
				this.invalidate(this.INVALIDATION_FLAG_SELECTED);
				this.dispatchEventWith(Event.CHANGE);
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected dataProvider_updateItemHandler(event:Event, index:number):void
		{
			//no need to dispatch a change event. the index and the item are the
			//same. the item's properties have changed, but that doesn't require
			//a change event.
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}
	}
}
