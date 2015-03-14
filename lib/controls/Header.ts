/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import IFeathersControl = feathers.core.IFeathersControl;
	import ITextRenderer = feathers.core.ITextRenderer;
	import IValidating = feathers.core.IValidating;
	import PropertyProxy = feathers.core.PropertyProxy;
	import FeathersEventType = feathers.events.FeathersEventType;
	import HorizontalLayout = feathers.layout.HorizontalLayout;
	import LayoutBoundsResult = feathers.layout.LayoutBoundsResult;
	import ViewPortBounds = feathers.layout.ViewPortBounds;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import DeviceCapabilities = feathers.system.DeviceCapabilities;

	import Stage = flash.display.Stage;
	import StageDisplayState = flash.display.StageDisplayState;
	import FullScreenEvent = flash.events.FullScreenEvent;
	import Point = flash.geom.Point;
	import Capabilities = flash.system.Capabilities;

	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/**
	 * A header that displays an optional title along with a horizontal regions
	 * on the sides for additional UI controls. The left side is typically for
	 * navigation (to display a back button, for example) and the right for
	 * additional actions. The title is displayed in the center by default,
	 * but it may be aligned to the left or right if there are no items on the
	 * desired side.
	 *
	 * <p>In the following example, a header is created, given a title, and a
	 * back button:</p>
	 *
	 * <listing version="3.0">
	 * var header:Header = new Header();
	 * header.title = "I'm a header";
	 * 
	 * var backButton:Button = new Button();
	 * backButton.label = "Back";
	 * backButton.styleNameList.add( Button.ALTERNATE_STYLE_NAME_BACK_BUTTON );
	 * backButton.addEventListener( Event.TRIGGERED, backButton_triggeredHandler );
	 * header.leftItems = new &lt;DisplayObject&gt;[ backButton ];
	 * 
	 * this.addChild( header );</listing>
	 *
	 * @see ../../../help/header.html How to use the Feathers Header component
	 */
	export class Header extends FeathersControl
	{
		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_LEFT_CONTENT:string = "leftContent";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_RIGHT_CONTENT:string = "rightContent";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_CENTER_CONTENT:string = "centerContent";

		/**
		 * @private
		 */
		protected static IOS_RETINA_STATUS_BAR_HEIGHT:number = 40;

		/**
		 * @private
		 */
		protected static IOS_NON_RETINA_STATUS_BAR_HEIGHT:number = 20;

		/**
		 * @private
		 */
		protected static IOS_RETINA_MINIMUM_DPI:number = 264;

		/**
		 * @private
		 */
		protected static IOS_NAME_PREFIX:string = "iPhone OS ";

		/**
		 * @private
		 */
		protected static STATUS_BAR_MIN_IOS_VERSION:number = 7;

		/**
		 * The default <code>IStyleProvider</code> for all <code>Header</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * The title will appear in the center of the header.
		 *
		 * @see #titleAlign
		 */
		public static TITLE_ALIGN_CENTER:string = "center";

		/**
		 * The title will appear on the left of the header, if there is no other
		 * content on that side. If there is content, the title will appear in
		 * the center.
		 *
		 * @see #titleAlign
		 */
		public static TITLE_ALIGN_PREFER_LEFT:string = "preferLeft";

		/**
		 * The title will appear on the right of the header, if there is no
		 * other content on that side. If there is content, the title will
		 * appear in the center.
		 *
		 * @see #titleAlign
		 */
		public static TITLE_ALIGN_PREFER_RIGHT:string = "preferRight";

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
		 * The default value added to the <code>styleNameList</code> of the header's
		 * items.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_ITEM:string = "feathers-header-item";

		/**
		 * DEPRECATED: Replaced by <code>Header.DEFAULT_CHILD_STYLE_NAME_ITEM</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Header#DEFAULT_CHILD_STYLE_NAME_ITEM
		 */
		public static DEFAULT_CHILD_NAME_ITEM:string = Header.DEFAULT_CHILD_STYLE_NAME_ITEM;

		/**
		 * The default value added to the <code>styleNameList</code> of the header's
		 * title.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_TITLE:string = "feathers-header-title";

		/**
		 * DEPRECATED: Replaced by <code>Header.DEFAULT_CHILD_STYLE_NAME_TITLE</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Header#DEFAULT_CHILD_STYLE_NAME_TITLE
		 */
		public static DEFAULT_CHILD_NAME_TITLE:string = Header.DEFAULT_CHILD_STYLE_NAME_TITLE;

		/**
		 * @private
		 */
		private static HELPER_BOUNDS:ViewPortBounds = new ViewPortBounds();

		/**
		 * @private
		 */
		private static HELPER_LAYOUT_RESULT:LayoutBoundsResult = new LayoutBoundsResult();

		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.addEventListener(Event.ADDED_TO_STAGE, this.header_addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.header_removedFromStageHandler);
		}

		/**
		 * The value added to the <code>styleNameList</code> of the header's
		 * title text renderer. This variable is <code>protected</code> so that
		 * sub-classes can customize the title text renderer style name in their
		 * constructors instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_TITLE</code>.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected titleStyleName:string = Header.DEFAULT_CHILD_STYLE_NAME_TITLE;

		/**
		 * DEPRECATED: Replaced by <code>titleStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #titleStyleName
		 */
		protected get titleName():string
		{
			return this.titleStyleName;
		}

		/**
		 * @private
		 */
		protected set titleName(value:string)
		{
			this.titleStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of each of the
		 * header's items. This variable is <code>protected</code> so that
		 * sub-classes can customize the item style name in their constructors
		 * instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_ITEM</code>.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected itemStyleName:string = Header.DEFAULT_CHILD_STYLE_NAME_ITEM;

		/**
		 * DEPRECATED: Replaced by <code>itemStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #itemStyleName
		 */
		protected get itemName():string
		{
			return this.itemStyleName;
		}

		/**
		 * @private
		 */
		protected set itemName(value:string)
		{
			this.itemStyleName = value;
		}

		/**
		 * @private
		 */
		protected leftItemsWidth:number = 0;

		/**
		 * @private
		 */
		protected rightItemsWidth:number = 0;

		/**
		 * @private
		 * The layout algorithm. Shared by both sides.
		 */
		protected _layout:HorizontalLayout;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Header.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _title:string = "";

		/**
		 * The text displayed for the header's title.
		 *
		 * <p>In the following example, the header's title is set:</p>
		 *
		 * <listing version="3.0">
		 * header.title = "I'm a Header";</listing>
		 *
		 * @default ""
		 *
		 * @see #titleFactory
		 */
		public get title():string
		{
			return this._title;
		}

		/**
		 * @private
		 */
		public set title(value:string)
		{
			if(value === null)
			{
				value = "";
			}
			if(this._title == value)
			{
				return;
			}
			this._title = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _titleFactory:Function;

		/**
		 * A function used to instantiate the header's title text renderer
		 * sub-component. By default, the header will use the global text
		 * renderer factory, <code>FeathersControl.defaultTextRendererFactory()</code>,
		 * to create the title text renderer. The title text renderer must be an
		 * instance of <code>ITextRenderer</code>. This factory can be used to
		 * change properties on the title text renderer when it is first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to style the title text
		 * renderer.
		 *
		 * <p>If you are not using a theme, the title factory can be used to
		 * provide skin the title with appropriate text styles.</p>
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>In the following example, a custom title factory is passed to the
		 * header:</p>
		 *
		 * <listing version="3.0">
		 * header.titleFactory = function():ITextRenderer
		 * {
		 *     var titleRenderer:TextFieldTextRenderer = new TextFieldTextRenderer();
		 *     titleRenderer.textFormat = new TextFormat( "_sans", 12, 0xff0000 );
		 *     return titleRenderer;
		 * }</listing>
		 *
		 * @default null
		 *
		 * @see #title
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get titleFactory():Function
		{
			return this._titleFactory;
		}

		/**
		 * @private
		 */
		public set titleFactory(value:Function)
		{
			if(this._titleFactory == value)
			{
				return;
			}
			this._titleFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}

		/**
		 * The text renderer for the header's title.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #title
		 * @see #titleFactory
		 * @see #createTitle()
		 */
		protected titleTextRenderer:ITextRenderer;

		/**
		 * @private
		 */
		protected _disposeItems:boolean = true;

		/**
		 * Determines if the <code>leftItems</code>, <code>centerItems</code>,
		 * and <code>rightItems</code> are disposed or not when the header is
		 * disposed.
		 *
		 * <p>If you change this value to <code>false</code>, you must dispose
		 * the items manually. Failing to dispose the items may result in a
		 * memory leak.</p>
		 *
		 * @default true
		 */
		public get disposeItems():boolean
		{
			return this._disposeItems;
		}

		/**
		 * @private
		 */
		public set disposeItems(value:boolean)
		{
			this._disposeItems = value;
		}

		/**
		 * @private
		 */
		protected _leftItems:DisplayObject[];

		/**
		 * The UI controls that appear in the left region of the header.
		 *
		 * <p>In the following example, a back button is displayed on the left
		 * side of the header:</p>
		 *
		 * <listing version="3.0">
		 * var backButton:Button = new Button();
		 * backButton.label = "Back";
		 * backButton.styleNameList.add( Button.ALTERNATE_STYLE_NAME_BACK_BUTTON );
		 * backButton.addEventListener( Event.TRIGGERED, backButton_triggeredHandler );
		 * header.leftItems = new &lt;DisplayObject&gt;[ backButton ];</listing>
		 *
		 * @default null
		 */
		public get leftItems():DisplayObject[]
		{
			return this._leftItems;
		}

		/**
		 * @private
		 */
		public set leftItems(value:DisplayObject[])
		{
			if(this._leftItems == value)
			{
				return;
			}
			if(this._leftItems)
			{
				for each(var item:DisplayObject in this._leftItems)
				{
					if(item instanceof IFeathersControl)
					{
						IFeathersControl(item).styleNameList.remove(this.itemStyleName);
						item.removeEventListener(FeathersEventType.RESIZE, this.item_resizeHandler);
					}
					item.removeFromParent();
				}
			}
			this._leftItems = value;
			if(this._leftItems)
			{
				for each(item in this._leftItems)
				{
					if(item instanceof IFeathersControl)
					{
						item.addEventListener(FeathersEventType.RESIZE, this.item_resizeHandler);
					}
				}
			}
			this.invalidate(Header.INVALIDATION_FLAG_LEFT_CONTENT);
		}

		/**
		 * @private
		 */
		protected _centerItems:DisplayObject[];

		/**
		 * The UI controls that appear in the center region of the header. If
		 * <code>centerItems</code> is not <code>null</code>, and the
		 * <code>titleAlign</code> property is <code>Header.TITLE_ALIGN_CENTER</code>,
		 * the title text renderer will be hidden.
		 *
		 * <p>In the following example, a settings button is displayed in the
		 * center of the header:</p>
		 *
		 * <listing version="3.0">
		 * var settingsButton:Button = new Button();
		 * settingsButton.label = "Settings";
		 * settingsButton.addEventListener( Event.TRIGGERED, settingsButton_triggeredHandler );
		 * header.centerItems = new &lt;DisplayObject&gt;[ settingsButton ];</listing>
		 *
		 * @default null
		 */
		public get centerItems():DisplayObject[]
		{
			return this._centerItems;
		}

		/**
		 * @private
		 */
		public set centerItems(value:DisplayObject[])
		{
			if(this._centerItems == value)
			{
				return;
			}
			if(this._centerItems)
			{
				for each(var item:DisplayObject in this._centerItems)
				{
					if(item instanceof IFeathersControl)
					{
						IFeathersControl(item).styleNameList.remove(this.itemStyleName);
						item.removeEventListener(FeathersEventType.RESIZE, this.item_resizeHandler);
					}
					item.removeFromParent();
				}
			}
			this._centerItems = value;
			if(this._centerItems)
			{
				for each(item in this._centerItems)
				{
					if(item instanceof IFeathersControl)
					{
						item.addEventListener(FeathersEventType.RESIZE, this.item_resizeHandler);
					}
				}
			}
			this.invalidate(Header.INVALIDATION_FLAG_CENTER_CONTENT);
		}

		/**
		 * @private
		 */
		protected _rightItems:DisplayObject[];

		/**
		 * The UI controls that appear in the right region of the header.
		 *
		 * <p>In the following example, a settings button is displayed on the
		 * right side of the header:</p>
		 *
		 * <listing version="3.0">
		 * var settingsButton:Button = new Button();
		 * settingsButton.label = "Settings";
		 * settingsButton.addEventListener( Event.TRIGGERED, settingsButton_triggeredHandler );
		 * header.rightItems = new &lt;DisplayObject&gt;[ settingsButton ];</listing>
		 *
		 * @default null
		 */
		public get rightItems():DisplayObject[]
		{
			return this._rightItems;
		}

		/**
		 * @private
		 */
		public set rightItems(value:DisplayObject[])
		{
			if(this._rightItems == value)
			{
				return;
			}
			if(this._rightItems)
			{
				for each(var item:DisplayObject in this._rightItems)
				{
					if(item instanceof IFeathersControl)
					{
						IFeathersControl(item).styleNameList.remove(this.itemStyleName);
						item.removeEventListener(FeathersEventType.RESIZE, this.item_resizeHandler);
					}
					item.removeFromParent();
				}
			}
			this._rightItems = value;
			if(this._rightItems)
			{
				for each(item in this._rightItems)
				{
					if(item instanceof IFeathersControl)
					{
						item.addEventListener(FeathersEventType.RESIZE, this.item_resizeHandler);
					}
				}
			}
			this.invalidate(Header.INVALIDATION_FLAG_RIGHT_CONTENT);
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the header's padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * header.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the header's top edge and the
		 * header's content.
		 *
		 * <p>In the following example, the header's top padding is set to 20
		 * pixels:</p>
		 *
		 * <listing version="3.0">
		 * header.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the header's right edge and the
		 * header's content.
		 *
		 * <p>In the following example, the header's right padding is set to 20
		 * pixels:</p>
		 *
		 * <listing version="3.0">
		 * header.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the header's bottom edge and
		 * the header's content.
		 *
		 * <p>In the following example, the header's bottom padding is set to 20
		 * pixels:</p>
		 *
		 * <listing version="3.0">
		 * header.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the header's left edge and the
		 * header's content.
		 *
		 * <p>In the following example, the header's left padding is set to 20
		 * pixels:</p>
		 *
		 * <listing version="3.0">
		 * header.paddingLeft = 20;</listing>
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
		protected _gap:number = 0;

		/**
		 * Space, in pixels, between items. The same value is used with the
		 * <code>leftItems</code> and <code>rightItems</code>.
		 *
		 * <p>Set the <code>titleGap</code> to make the gap on the left and
		 * right of the title use a different value.</p>
		 *
		 * <p>In the following example, the header's gap between items is set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * header.gap = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #titleGap
		 * @see #leftItems
		 * @see #rightItems
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
		protected _titleGap:number = NaN;

		/**
		 * Space, in pixels, between the title and the left or right groups of
		 * items. If <code>NaN</code> (the default), the default <code>gap</code>
		 * property is used instead.
		 *
		 * <p>In the following example, the header's title gap is set to 20
		 * pixels:</p>
		 *
		 * <listing version="3.0">
		 * header.titleGap = 20;</listing>
		 *
		 * @default NaN
		 *
		 * @see #gap
		 */
		public get titleGap():number
		{
			return this._titleGap;
		}

		/**
		 * @private
		 */
		public set titleGap(value:number)
		{
			if(this._titleGap == value)
			{
				return;
			}
			this._titleGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _useExtraPaddingForOSStatusBar:boolean = false;

		/**
		 * If enabled, the header's top padding will be increased to account for
		 * the height of the OS status bar when the app is rendered under the OS
		 * status bar. The header will not add extra padding to apps that aren't
		 * rendered under the OS status bar.
		 *
		 * <p>iOS started rendering apps that aren't full screen under the OS
		 * status bar in version 7.</p>
		 *
		 * <p>In the following example, the header's padding will account for
		 * the iOS status bar height:</p>
		 *
		 * <listing version="3.0">
		 * header.useExtraPaddingForOSStatusBar = true;</listing>
		 *
		 * @default false;
		 *
		 * @see #paddingTop
		 */
		public get useExtraPaddingForOSStatusBar():boolean
		{
			return this._useExtraPaddingForOSStatusBar;
		}

		/**
		 * @private
		 */
		public set useExtraPaddingForOSStatusBar(value:boolean)
		{
			if(this._useExtraPaddingForOSStatusBar == value)
			{
				return;
			}
			this._useExtraPaddingForOSStatusBar = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _verticalAlign:string = Header.VERTICAL_ALIGN_MIDDLE;

		/*[Inspectable(type="String",enumeration="top,middle,bottom")]*/
		/**
		 * The alignment of the items vertically, on the y-axis.
		 *
		 * <p>In the following example, the header's vertical alignment is set
		 * to the middle:</p>
		 *
		 * <listing version="3.0">
		 * header.verticalAlign = Header.VERTICAL_ALIGN_MIDDLE;</listing>
		 *
		 * @default Header.VERTICAL_ALIGN_MIDDLE
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected originalBackgroundWidth:number = NaN;

		/**
		 * @private
		 */
		protected originalBackgroundHeight:number = NaN;

		/**
		 * @private
		 */
		protected currentBackgroundSkin:DisplayObject;

		/**
		 * @private
		 */
		protected _backgroundSkin:DisplayObject;

		/**
		 * A display object displayed behind the header's content.
		 *
		 * <p>In the following example, the header's background skin is set to
		 * a <code>Quad</code>:</p>
		 *
		 * <listing version="3.0">
		 * header.backgroundSkin = new Quad( 10, 10, 0xff0000 );</listing>
		 *
		 * @default null
		 */
		public get backgroundSkin():DisplayObject
		{
			return this._backgroundSkin;
		}

		/**
		 * @private
		 */
		public set backgroundSkin(value:DisplayObject)
		{
			if(this._backgroundSkin == value)
			{
				return;
			}

			if(this._backgroundSkin && this._backgroundSkin != this._backgroundDisabledSkin)
			{
				this.removeChild(this._backgroundSkin);
			}
			this._backgroundSkin = value;
			if(this._backgroundSkin && this._backgroundSkin.parent != this)
			{
				this._backgroundSkin.visible = false;
				this.addChildAt(this._backgroundSkin, 0);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _backgroundDisabledSkin:DisplayObject;

		/**
		 * A background to display when the header is disabled. If the property
		 * is <code>null</code>, the value of the <code>backgroundSkin</code>
		 * property will be used instead.
		 *
		 * <p>In the following example, the header's disabled background skin is
		 * set to a <code>Quad</code>:</p>
		 *
		 * <listing version="3.0">
		 * header.backgroundDisabledSkin = new Quad( 10, 10, 0x999999 );</listing>
		 *
		 * @default null
		 */
		public get backgroundDisabledSkin():DisplayObject
		{
			return this._backgroundDisabledSkin;
		}

		/**
		 * @private
		 */
		public set backgroundDisabledSkin(value:DisplayObject)
		{
			if(this._backgroundDisabledSkin == value)
			{
				return;
			}

			if(this._backgroundDisabledSkin && this._backgroundDisabledSkin != this._backgroundSkin)
			{
				this.removeChild(this._backgroundDisabledSkin);
			}
			this._backgroundDisabledSkin = value;
			if(this._backgroundDisabledSkin && this._backgroundDisabledSkin.parent != this)
			{
				this._backgroundDisabledSkin.visible = false;
				this.addChildAt(this._backgroundDisabledSkin, 0);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _titleProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the header's title. The
		 * title is an <code>ITextRenderer</code> instance. The available
		 * properties depend on which <code>ITextRenderer</code> implementation
		 * is returned by <code>titleFactory</code>. The most common
		 * implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>In the following example, some properties are set for the header's
		 * title text renderer (this example assumes that the title text renderer
		 * is a <code>BitmapFontTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * header.titleProperties.textFormat = new BitmapFontTextFormat( bitmapFont );
		 * header.titleProperties.wordWrap = true;</listing>
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>titleFactory</code> function instead
		 * of using <code>titleProperties</code> will result in better
		 * performance.</p>
		 *
		 * @default null
		 *
		 * @see #titleFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get titleProperties():Object
		{
			if(!this._titleProperties)
			{
				this._titleProperties = new PropertyProxy(this.titleProperties_onChange);
			}
			return this._titleProperties;
		}

		/**
		 * @private
		 */
		public set titleProperties(value:Object)
		{
			if(this._titleProperties == value)
			{
				return;
			}
			if(value && !(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			if(this._titleProperties)
			{
				this._titleProperties.removeOnChangeCallback(this.titleProperties_onChange);
			}
			this._titleProperties = PropertyProxy(value);
			if(this._titleProperties)
			{
				this._titleProperties.addOnChangeCallback(this.titleProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _titleAlign:string = Header.TITLE_ALIGN_CENTER;

		/*[Inspectable(type="String",enumeration="center,preferLeft,preferRight")]*/
		/**
		 * The preferred position of the title. If <code>leftItems</code> and/or
		 * <code>rightItems</code> are not <code>null</code>, the title may be
		 * forced to the center even if the preferred position is on the left or
		 * right. If <code>centerItems</code> is not <code>null</code>, and the
		 * title is centered, the title will be hidden.
		 *
		 * <p>In the following example, the header's title aligment is set to
		 * prefer the left side:</p>
		 *
		 * <listing version="3.0">
		 * header.titleAlign = Header.TITLE_ALIGN_PREFER_LEFT;</listing>
		 *
		 * @default Header.TITLE_ALIGN_CENTER
		 *
		 * @see #TITLE_ALIGN_CENTER
		 * @see #TITLE_ALIGN_PREFER_LEFT
		 * @see #TITLE_ALIGN_PREFER_RIGHT
		 */
		public get titleAlign():string
		{
			return this._titleAlign;
		}

		/**
		 * @private
		 */
		public set titleAlign(value:string)
		{
			if(this._titleAlign == value)
			{
				return;
			}
			this._titleAlign = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			if(this._disposeItems)
			{
				for each(var item:DisplayObject in this._leftItems)
				{
					item.dispose();
				}
				for each(item in this._centerItems)
				{
					item.dispose();
				}
				for each(item in this._rightItems)
				{
					item.dispose();
				}
			}
			this.leftItems = null;
			this.rightItems = null;
			this.centerItems = null;
			super.dispose();
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			if(!this._layout)
			{
				this._layout = new HorizontalLayout();
				this._layout.useVirtualLayout = false;
				this._layout.verticalAlign = HorizontalLayout.VERTICAL_ALIGN_MIDDLE;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var leftContentInvalid:boolean = this.isInvalid(Header.INVALIDATION_FLAG_LEFT_CONTENT);
			var rightContentInvalid:boolean = this.isInvalid(Header.INVALIDATION_FLAG_RIGHT_CONTENT);
			var centerContentInvalid:boolean = this.isInvalid(Header.INVALIDATION_FLAG_CENTER_CONTENT);
			var textRendererInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_TEXT_RENDERER);

			if(textRendererInvalid)
			{
				this.createTitle();
			}

			if(textRendererInvalid || dataInvalid)
			{
				this.titleTextRenderer.text = this._title;
			}

			if(stateInvalid || stylesInvalid)
			{
				this.refreshBackground();
			}

			if(textRendererInvalid || stylesInvalid || sizeInvalid)
			{
				this.refreshLayout();
			}
			if(textRendererInvalid || stylesInvalid)
			{
				this.refreshTitleStyles();
			}

			if(leftContentInvalid)
			{
				if(this._leftItems)
				{
					for each(var item:DisplayObject in this._leftItems)
					{
						if(item instanceof IFeathersControl)
						{
							IFeathersControl(item).styleNameList.add(this.itemStyleName);
						}
						this.addChild(item);
					}
				}
			}

			if(rightContentInvalid)
			{
				if(this._rightItems)
				{
					for each(item in this._rightItems)
					{
						if(item instanceof IFeathersControl)
						{
							IFeathersControl(item).styleNameList.add(this.itemStyleName);
						}
						this.addChild(item);
					}
				}
			}

			if(centerContentInvalid)
			{
				if(this._centerItems)
				{
					for each(item in this._centerItems)
					{
						if(item instanceof IFeathersControl)
						{
							IFeathersControl(item).styleNameList.add(this.itemStyleName);
						}
						this.addChild(item);
					}
				}
			}

			if(stateInvalid || textRendererInvalid)
			{
				this.refreshEnabled();
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(sizeInvalid || stylesInvalid)
			{
				this.layoutBackground();
			}

			if(sizeInvalid || leftContentInvalid || rightContentInvalid || centerContentInvalid || stylesInvalid)
			{
				this.leftItemsWidth = 0;
				this.rightItemsWidth = 0;
				if(this._leftItems)
				{
					this.layoutLeftItems();
				}
				if(this._rightItems)
				{
					this.layoutRightItems();
				}
				if(this._centerItems)
				{
					this.layoutCenterItems();
				}
			}

			if(textRendererInvalid || sizeInvalid || stylesInvalid || dataInvalid || leftContentInvalid || rightContentInvalid || centerContentInvalid)
			{
				this.layoutTitle();
			}

		}

		/**
		 * If the component's dimensions have not been set explicitly, it will
		 * measure its content and determine an ideal size for itself. If the
		 * <code>explicitWidth</code> or <code>explicitHeight</code> member
		 * variables are set, those value will be used without additional
		 * measurement. If one is set, but not the other, the dimension with the
		 * explicit value will not be measured, but the other non-explicit
		 * dimension will still need measurement.
		 *
		 * <p>Calls <code>setSizeInternal()</code> to set up the
		 * <code>actualWidth</code> and <code>actualHeight</code> member
		 * variables used for layout.</p>
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 */
		protected autoSizeIfNeeded():boolean
		{
			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				return false;
			}
			var newWidth:number = needsWidth ? (this._paddingLeft + this._paddingRight) : this.explicitWidth;
			var newHeight:number = needsHeight ? 0 : this.explicitHeight;

			var totalItemWidth:number = 0;
			var leftItemCount:number = this._leftItems ? this._leftItems.length : 0;
			for(var i:number = 0; i < leftItemCount; i++)
			{
				var item:DisplayObject = this._leftItems[i];
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
				var itemWidth:number = item.width;
				if(needsWidth &&
					itemWidth === itemWidth) //!isNaN
				{
					totalItemWidth += itemWidth;
					if(i > 0)
					{
						totalItemWidth += this._gap;
					}
				}
				var itemHeight:number = item.height;
				if(needsHeight &&
					itemHeight === itemHeight && //!isNaN
					itemHeight > newHeight)
				{
					newHeight = itemHeight;
				}
			}
			var centerItemCount:number = this._centerItems ? this._centerItems.length : 0;
			for(i = 0; i < centerItemCount; i++)
			{
				item = this._centerItems[i];
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
				itemWidth = item.width;
				if(needsWidth &&
					itemWidth === itemWidth) //!isNaN
				{
					totalItemWidth += itemWidth;
					if(i > 0)
					{
						totalItemWidth += this._gap;
					}
				}
				itemHeight = item.height;
				if(needsHeight &&
					itemHeight === itemHeight && //!isNaN
					itemHeight > newHeight)
				{
					newHeight = itemHeight;
				}
			}
			var rightItemCount:number = this._rightItems ? this._rightItems.length : 0;
			for(i = 0; i < rightItemCount; i++)
			{
				item = this._rightItems[i];
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
				itemWidth = item.width
				if(needsWidth &&
					itemWidth === itemWidth) //!isNaN
				{
					totalItemWidth += itemWidth;
					if(i > 0)
					{
						totalItemWidth += this._gap;
					}
				}
				itemHeight = item.height;
				if(needsHeight &&
					itemHeight === itemHeight && //!isNaN
					itemHeight > newHeight)
				{
					newHeight = itemHeight;
				}
			}
			newWidth += totalItemWidth;

			if(this._title && !(this._titleAlign == Header.TITLE_ALIGN_CENTER && this._centerItems))
			{
				var calculatedTitleGap:number = this._titleGap;
				if(calculatedTitleGap !== calculatedTitleGap) //isNaN
				{
					calculatedTitleGap = this._gap;
				}
				newWidth += 2 * calculatedTitleGap;
				var maxTitleWidth:number = (needsWidth ? this._maxWidth : this.explicitWidth) - totalItemWidth;
				if(leftItemCount > 0)
				{
					maxTitleWidth -= calculatedTitleGap;
				}
				if(centerItemCount > 0)
				{
					maxTitleWidth -= calculatedTitleGap;
				}
				if(rightItemCount > 0)
				{
					maxTitleWidth -= calculatedTitleGap;
				}
				this.titleTextRenderer.maxWidth = maxTitleWidth;
				this.titleTextRenderer.measureText(Header.HELPER_POINT);
				var measuredTitleWidth:number = Header.HELPER_POINT.x;
				var measuredTitleHeight:number = Header.HELPER_POINT.y;
				if(needsWidth &&
					measuredTitleWidth === measuredTitleWidth) //!isNaN
				{
					newWidth += measuredTitleWidth;
					if(leftItemCount > 0)
					{
						newWidth += calculatedTitleGap;
					}
					if(rightItemCount > 0)
					{
						newWidth += calculatedTitleGap;
					}
				}
				if(needsHeight &&
					measuredTitleHeight === measuredTitleHeight && //!isNaN
					measuredTitleHeight > newHeight)
				{
					newHeight = measuredTitleHeight;
				}
			}
			if(needsHeight)
			{
				newHeight += this._paddingTop + this._paddingBottom;
				var extraPaddingTop:number = this.calculateExtraOSStatusBarPadding();
				if(extraPaddingTop > 0)
				{
					//account for the minimum height before adding the padding
					if(newHeight < this._minHeight)
					{
						newHeight = this._minHeight;
					}
					newHeight += extraPaddingTop;
				}
			}
			if(needsWidth &&
				this.originalBackgroundWidth === this.originalBackgroundWidth && //!isNaN
				this.originalBackgroundWidth > newWidth)
			{
				newWidth = this.originalBackgroundWidth;
			}
			if(needsHeight &&
				this.originalBackgroundHeight === this.originalBackgroundHeight && //!isNaN
				this.originalBackgroundHeight > newHeight)
			{
				newHeight = this.originalBackgroundHeight;
			}

			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates and adds the <code>titleTextRenderer</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #title
		 * @see #titleTextRenderer
		 * @see #titleFactory
		 */
		protected createTitle():void
		{
			if(this.titleTextRenderer)
			{
				this.removeChild(DisplayObject(this.titleTextRenderer), true);
				this.titleTextRenderer = null;
			}

			var factory:Function = this._titleFactory != null ? this._titleFactory : FeathersControl.defaultTextRendererFactory;
			this.titleTextRenderer = ITextRenderer(factory());
			var uiTitleRenderer:IFeathersControl = IFeathersControl(this.titleTextRenderer);
			uiTitleRenderer.styleNameList.add(this.titleStyleName);
			this.addChild(DisplayObject(uiTitleRenderer));
		}

		/**
		 * @private
		 */
		protected refreshBackground():void
		{
			this.currentBackgroundSkin = this._backgroundSkin;
			if(!this._isEnabled && this._backgroundDisabledSkin)
			{
				if(this._backgroundSkin)
				{
					this._backgroundSkin.visible = false;
				}
				this.currentBackgroundSkin = this._backgroundDisabledSkin;
			}
			else if(this._backgroundDisabledSkin)
			{
				this._backgroundDisabledSkin.visible = false;
			}
			if(this.currentBackgroundSkin)
			{
				this.currentBackgroundSkin.visible = true;

				if(this.originalBackgroundWidth !== this.originalBackgroundWidth) //isNaN
				{
					this.originalBackgroundWidth = this.currentBackgroundSkin.width;
				}
				if(this.originalBackgroundHeight !== this.originalBackgroundHeight) //isNaN
				{
					this.originalBackgroundHeight = this.currentBackgroundSkin.height;
				}
			}
		}

		/**
		 * @private
		 */
		protected refreshLayout():void
		{
			this._layout.gap = this._gap;
			this._layout.paddingTop = this._paddingTop + this.calculateExtraOSStatusBarPadding();
			this._layout.paddingBottom = this._paddingBottom;
			this._layout.verticalAlign = this._verticalAlign;
		}

		/**
		 * @private
		 */
		protected refreshEnabled():void
		{
			this.titleTextRenderer.isEnabled = this._isEnabled;
		}

		/**
		 * @private
		 */
		protected refreshTitleStyles():void
		{
			for(var propertyName:string in this._titleProperties)
			{
				var propertyValue:Object = this._titleProperties[propertyName];
				this.titleTextRenderer[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected calculateExtraOSStatusBarPadding():number
		{
			if(!this._useExtraPaddingForOSStatusBar)
			{
				return 0;
			}
			var os:string = Capabilities.os;
			if(os.indexOf(Header.IOS_NAME_PREFIX) != 0 || parseInt(os.substr(Header.IOS_NAME_PREFIX.length, 1), 10) < Header.STATUS_BAR_MIN_IOS_VERSION)
			{
				return 0;
			}
			var nativeStage:Stage = Starling.current.nativeStage;
			if(nativeStage.displayState != StageDisplayState.NORMAL)
			{
				return 0;
			}
			if(DeviceCapabilities.dpi >= Header.IOS_RETINA_MINIMUM_DPI)
			{
				return Header.IOS_RETINA_STATUS_BAR_HEIGHT;
			}
			return Header.IOS_NON_RETINA_STATUS_BAR_HEIGHT;
		}

		/**
		 * @private
		 */
		protected layoutBackground():void
		{
			if(!this.currentBackgroundSkin)
			{
				return;
			}
			this.currentBackgroundSkin.width = this.actualWidth;
			this.currentBackgroundSkin.height = this.actualHeight;
		}

		/**
		 * @private
		 */
		protected layoutLeftItems():void
		{
			for each(var item:DisplayObject in this._leftItems)
			{
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
			}
			Header.HELPER_BOUNDS.x = Header.HELPER_BOUNDS.y = 0;
			Header.HELPER_BOUNDS.scrollX = Header.HELPER_BOUNDS.scrollY = 0;
			Header.HELPER_BOUNDS.explicitWidth = this.actualWidth;
			Header.HELPER_BOUNDS.explicitHeight = this.actualHeight;
			this._layout.horizontalAlign = HorizontalLayout.HORIZONTAL_ALIGN_LEFT;
			this._layout.paddingRight = 0;
			this._layout.paddingLeft = this._paddingLeft;
			this._layout.layout(this._leftItems, Header.HELPER_BOUNDS, Header.HELPER_LAYOUT_RESULT);
			this.leftItemsWidth = Header.HELPER_LAYOUT_RESULT.contentWidth;
			if(this.leftItemsWidth !== this.leftItemsWidth) //isNaN
			{
				this.leftItemsWidth = 0;
			}

		}

		/**
		 * @private
		 */
		protected layoutRightItems():void
		{
			for each(var item:DisplayObject in this._rightItems)
			{
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
			}
			Header.HELPER_BOUNDS.x = Header.HELPER_BOUNDS.y = 0;
			Header.HELPER_BOUNDS.scrollX = Header.HELPER_BOUNDS.scrollY = 0;
			Header.HELPER_BOUNDS.explicitWidth = this.actualWidth;
			Header.HELPER_BOUNDS.explicitHeight = this.actualHeight;
			this._layout.horizontalAlign = HorizontalLayout.HORIZONTAL_ALIGN_RIGHT;
			this._layout.paddingRight = this._paddingRight;
			this._layout.paddingLeft = 0;
			this._layout.layout(this._rightItems, Header.HELPER_BOUNDS, Header.HELPER_LAYOUT_RESULT);
			this.rightItemsWidth = Header.HELPER_LAYOUT_RESULT.contentWidth;
			if(this.rightItemsWidth !== this.rightItemsWidth) //isNaN
			{
				this.rightItemsWidth = 0;
			}
		}

		/**
		 * @private
		 */
		protected layoutCenterItems():void
		{
			for each(var item:DisplayObject in this._centerItems)
			{
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
			}
			Header.HELPER_BOUNDS.x = Header.HELPER_BOUNDS.y = 0;
			Header.HELPER_BOUNDS.scrollX = Header.HELPER_BOUNDS.scrollY = 0;
			Header.HELPER_BOUNDS.explicitWidth = this.actualWidth;
			Header.HELPER_BOUNDS.explicitHeight = this.actualHeight;
			this._layout.horizontalAlign = HorizontalLayout.HORIZONTAL_ALIGN_CENTER;
			this._layout.paddingRight = this._paddingRight;
			this._layout.paddingLeft = this._paddingLeft;
			this._layout.layout(this._centerItems, Header.HELPER_BOUNDS, Header.HELPER_LAYOUT_RESULT);
		}

		/**
		 * @private
		 */
		protected layoutTitle():void
		{
			if((this._titleAlign == Header.TITLE_ALIGN_CENTER && this._centerItems) || this._title.length == 0)
			{
				this.titleTextRenderer.visible = false;
				return;
			}
			this.titleTextRenderer.visible = true;
			var calculatedTitleGap:number = this._titleGap;
			if(calculatedTitleGap !== calculatedTitleGap) //isNaN
			{
				calculatedTitleGap = this._gap;
			}
			//left and right offsets already include padding
			var leftOffset:number = (this._leftItems && this._leftItems.length > 0) ? (this.leftItemsWidth + calculatedTitleGap) : 0;
			var rightOffset:number = (this._rightItems && this._rightItems.length > 0) ? (this.rightItemsWidth + calculatedTitleGap) : 0;
			if(this._titleAlign == Header.TITLE_ALIGN_PREFER_LEFT && (!this._leftItems || this._leftItems.length == 0))
			{
				this.titleTextRenderer.maxWidth = this.actualWidth - this._paddingLeft - rightOffset;
				this.titleTextRenderer.validate();
				this.titleTextRenderer.x = this._paddingLeft;
			}
			else if(this._titleAlign == Header.TITLE_ALIGN_PREFER_RIGHT && (!this._rightItems || this._rightItems.length == 0))
			{
				this.titleTextRenderer.maxWidth = this.actualWidth - this._paddingRight - leftOffset;
				this.titleTextRenderer.validate();
				this.titleTextRenderer.x = this.actualWidth - this._paddingRight - this.titleTextRenderer.width;
			}
			else
			{
				var actualWidthMinusPadding:number = this.actualWidth - this._paddingLeft - this._paddingRight;
				var actualWidthMinusOffsets:number = this.actualWidth - leftOffset - rightOffset;
				this.titleTextRenderer.maxWidth = actualWidthMinusOffsets;
				this.titleTextRenderer.validate();
				var idealTitlePosition:number = this._paddingLeft + (actualWidthMinusPadding - this.titleTextRenderer.width) / 2;
				if(leftOffset > idealTitlePosition ||
					(idealTitlePosition + this.titleTextRenderer.width) > (this.actualWidth - rightOffset))
				{
					this.titleTextRenderer.x = leftOffset + (actualWidthMinusOffsets - this.titleTextRenderer.width) / 2;
				}
				else
				{
					this.titleTextRenderer.x = idealTitlePosition;
				}
			}
			var paddingTop:number = this._paddingTop + this.calculateExtraOSStatusBarPadding();
			if(this._verticalAlign == Header.VERTICAL_ALIGN_TOP)
			{
				this.titleTextRenderer.y = paddingTop;
			}
			else if(this._verticalAlign == Header.VERTICAL_ALIGN_BOTTOM)
			{
				this.titleTextRenderer.y = this.actualHeight - this._paddingBottom - this.titleTextRenderer.height;
			}
			else
			{
				this.titleTextRenderer.y = paddingTop + (this.actualHeight - paddingTop - this._paddingBottom - this.titleTextRenderer.height) / 2;
			}
		}

		/**
		 * @private
		 */
		protected header_addedToStageHandler(event:Event):void
		{
			Starling.current.nativeStage.addEventListener("fullScreen", this.nativeStage_fullScreenHandler);
		}

		/**
		 * @private
		 */
		protected header_removedFromStageHandler(event:Event):void
		{
			Starling.current.nativeStage.removeEventListener("fullScreen", this.nativeStage_fullScreenHandler);
		}

		/**
		 * @private
		 */
		protected nativeStage_fullScreenHandler(event:FullScreenEvent):void
		{
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected titleProperties_onChange(proxy:PropertyProxy, propertyName:string):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected item_resizeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}
	}
}
