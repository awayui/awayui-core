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
	import ListCollection = feathers.data.ListCollection;
	import HorizontalLayout = feathers.layout.HorizontalLayout;
	import LayoutBoundsResult = feathers.layout.LayoutBoundsResult;
	import VerticalLayout = feathers.layout.VerticalLayout;
	import ViewPortBounds = feathers.layout.ViewPortBounds;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/**
	 * Dispatched when one of the buttons is triggered. The <code>data</code>
	 * property of the event contains the item from the data provider that is
	 * associated with the button that was triggered.
	 *
	 * <p>The following example listens to <code>Event.TRIGGERED</code> on the
	 * button group instead of on individual buttons:</p>
	 *
	 * <listing version="3.0">
	 * group.dataProvider = new ListCollection(
	 * [
	 *     { label: "Yes" },
	 *     { label: "No" },
	 *     { label: "Cancel" },
	 * ]);
	 * group.addEventListener( Event.TRIGGERED, function( event:Event, data:Object ):void
	 * {
	 *    trace( "The button with label \"" + data.label + "\" was triggered." );
	 * }</listing>
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>The item associated with the button
	 *   that was triggered.</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType starling.events.Event.TRIGGERED
	 */
	/*[Event(name="triggered", type="starling.events.Event")]*/

	/*[DefaultProperty("dataProvider")]*/
	/**
	 * A set of related buttons with layout, customized using a data provider.
	 *
	 * <p>The following example creates a button group with a few buttons:</p>
	 *
	 * <listing version="3.0">
	 * var group:ButtonGroup = new ButtonGroup();
	 * group.dataProvider = new ListCollection(
	 * [
	 *     { label: "Yes", triggered: yesButton_triggeredHandler },
	 *     { label: "No", triggered: noButton_triggeredHandler },
	 *     { label: "Cancel", triggered: cancelButton_triggeredHandler },
	 * ]);
	 * this.addChild( group );</listing>
	 *
	 * @see ../../../help/button-group.html How to use the Feathers ButtonGroup component
	 * @see feathers.controls.TabBar
	 */
	export class ButtonGroup extends FeathersControl
	{
		/**
		 * The default <code>IStyleProvider</code> for all <code>ButtonGroup</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_BUTTON_FACTORY:string = "buttonFactory";

		/**
		 * @private
		 */
		protected static LABEL_FIELD:string = "label";

		/**
		 * @private
		 */
		protected static ENABLED_FIELD:string = "isEnabled";

		/**
		 * @private
		 */
		private static DEFAULT_BUTTON_FIELDS:string[] = new Array<string>("defaultIcon",
			"upIcon",
			"downIcon",
			"hoverIcon",
			"disabledIcon",
			"defaultSelectedIcon",
			"selectedUpIcon",
			"selectedDownIcon",
			"selectedHoverIcon",
			"selectedDisabledIcon",
			"isSelected",
			"isToggle");

		/**
		 * @private
		 */
		private static DEFAULT_BUTTON_EVENTS:string[] = new Array<string>(Event.TRIGGERED,
			Event.CHANGE);

		/**
		 * The buttons are displayed in order from left to right.
		 *
		 * @see #direction
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * The buttons are displayed in order from top to bottom.
		 *
		 * @see #direction
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The buttons will be aligned horizontally to the left edge of the
		 * button group.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * The buttons will be aligned horizontally to the center of the
		 * button group.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * The buttons will be aligned horizontally to the right edge of the
		 * button group.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_RIGHT:string = "right";

		/**
		 * If the direction is vertical, each button will fill the entire
		 * width of the button group, and if the direction is horizontal, the
		 * alignment will behave the same as <code>HORIZONTAL_ALIGN_LEFT</code>.
		 *
		 * @see #horizontalAlign
		 * @see #direction
		 */
		public static HORIZONTAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The buttons will be aligned vertically to the top edge of the
		 * button group.
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * The buttons will be aligned vertically to the middle of the
		 * button group.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * The buttons will be aligned vertically to the bottom edge of the
		 * button group.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * If the direction is horizontal, each button will fill the entire
		 * height of the button group, and if the direction is vertical, the
		 * alignment will behave the same as <code>VERTICAL_ALIGN_TOP</code>.
		 *
		 * @see #verticalAlign
		 * @see #direction
		 */
		public static VERTICAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The default value added to the <code>styleNameList</code> of the buttons.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_BUTTON:string = "feathers-button-group-button";

		/**
		 * DEPRECATED: Replaced by <code>ButtonGroup.DEFAULT_CHILD_STYLE_NAME_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ButtonGroup#DEFAULT_CHILD_STYLE_NAME_BUTTON
		 */
		public static DEFAULT_CHILD_NAME_BUTTON:string = ButtonGroup.DEFAULT_CHILD_STYLE_NAME_BUTTON;

		/**
		 * @private
		 */
		protected static defaultButtonFactory():Button
		{
			return new Button();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
		}

		/**
		 * The value added to the <code>styleNameList</code> of the buttons.
		 * This variable is <code>protected</code> so that sub-classes can
		 * customize the button style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_BUTTON</code>.
		 *
		 * <p>To customize the button style name without subclassing, see
		 * <code>customButtonStyleName</code>.</p>
		 *
		 * @see #customButtonStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected buttonStyleName:string = ButtonGroup.DEFAULT_CHILD_STYLE_NAME_BUTTON;

		/**
		 * DEPRECATED: Replaced by <code>buttonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #buttonStyleName
		 */
		protected get buttonName():string
		{
			return this.buttonStyleName;
		}

		/**
		 * @private
		 */
		protected set buttonName(value:string)
		{
			this.buttonStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the first button.
		 *
		 * <p>To customize the first button name without subclassing, see
		 * <code>customFirstButtonStyleName</code>.</p>
		 *
		 * @see #customFirstButtonStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected firstButtonStyleName:string = ButtonGroup.DEFAULT_CHILD_STYLE_NAME_BUTTON;

		/**
		 * DEPRECATED: Replaced by <code>firstButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #firstButtonStyleName
		 */
		protected get firstButtonName():string
		{
			return this.firstButtonStyleName;
		}

		/**
		 * @private
		 */
		protected set firstButtonName(value:string)
		{
			this.firstButtonStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the last button.
		 *
		 * <p>To customize the last button style name without subclassing, see
		 * <code>customLastButtonStyleName</code>.</p>
		 *
		 * @see #customLastButtonStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected lastButtonStyleName:string = ButtonGroup.DEFAULT_CHILD_STYLE_NAME_BUTTON;

		/**
		 * DEPRECATED: Replaced by <code>lastButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #lastButtonStyleName
		 */
		protected get lastButtonName():string
		{
			return this.lastButtonStyleName;
		}

		/**
		 * @private
		 */
		protected set lastButtonName(value:string)
		{
			this.lastButtonStyleName = value;
		}

		/**
		 * @private
		 */
		protected activeFirstButton:Button;

		/**
		 * @private
		 */
		protected inactiveFirstButton:Button;

		/**
		 * @private
		 */
		protected activeLastButton:Button;

		/**
		 * @private
		 */
		protected inactiveLastButton:Button;

		/**
		 * @private
		 */
		protected _layoutItems:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected activeButtons:Button[] = new Array<Button>();

		/**
		 * @private
		 */
		protected inactiveButtons:Button[] = new Array<Button>();

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return ButtonGroup.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _dataProvider:ListCollection;

		/**
		 * The collection of data to be displayed with buttons.
		 *
		 * <p>The following example sets the button group's data provider:</p>
		 *
		 * <listing version="3.0">
		 * group.dataProvider = new ListCollection(
		 * [
		 *     { label: "Yes", triggered: yesButton_triggeredHandler },
		 *     { label: "No", triggered: noButton_triggeredHandler },
		 *     { label: "Cancel", triggered: cancelButton_triggeredHandler },
		 * ]);</listing>
		 *
		 * <p>By default, items in the data provider support the following
		 * properties from <code>Button</code></p>
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
		 *     <li>isSelected (only supported by <code>ToggleButton</code>)</li>
		 *     <li>isToggle (only supported by <code>ToggleButton</code>)</li>
		 *     <li>isEnabled</li>
		 * </ul>
		 *
		 * <p>Additionally, you can add the following event listeners:</p>
		 *
		 * <ul>
		 *     <li>Event.TRIGGERED</li>
		 *     <li>Event.CHANGE (only supported by <code>ToggleButton</code>)</li>
		 * </ul>
		 *
		 * <p>To use properties and events that are only supported by
		 * <code>ToggleButton</code>, you must provide a <code>buttonFactory</code>
		 * that returns a <code>ToggleButton</code> instead of a <code>Button</code>.</p>
		 *
		 * <p>You can pass a function to the <code>buttonInitializer</code>
		 * property that can provide custom logic to interpret each item in the
		 * data provider differently.</p>
		 *
		 * @default null
		 *
		 * @see Button
		 * @see #buttonInitializer
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
			if(this._dataProvider)
			{
				this._dataProvider.removeEventListener(Event.CHANGE, this.dataProvider_changeHandler);
			}
			this._dataProvider = value;
			if(this._dataProvider)
			{
				this._dataProvider.addEventListener(Event.CHANGE, this.dataProvider_changeHandler);
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
		protected _direction:string = ButtonGroup.DIRECTION_VERTICAL;

		/*[Inspectable(type="String",enumeration="horizontal,vertical")]*/
		/**
		 * The button group layout is either vertical or horizontal.
		 *
		 * <p>The following example sets the layout direction of the buttons
		 * to line them up horizontally:</p>
		 *
		 * <listing version="3.0">
		 * group.direction = ButtonGroup.DIRECTION_HORIZONTAL;</listing>
		 *
		 * @default ButtonGroup.DIRECTION_VERTICAL
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
		protected _horizontalAlign:string = ButtonGroup.HORIZONTAL_ALIGN_JUSTIFY;

		/*[Inspectable(type="String",enumeration="left,center,right,justify")]*/
		/**
		 * Determines how the buttons are horizontally aligned within the bounds
		 * of the button group (on the x-axis).
		 *
		 * <p>The following example aligns the group's content to the left:</p>
		 *
		 * <listing version="3.0">
		 * group.horizontalAlign = ButtonGroup.HORIZONTAL_ALIGN_LEFT;</listing>
		 *
		 * @default ButtonGroup.HORIZONTAL_ALIGN_JUSTIFY
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
		protected _verticalAlign:string = ButtonGroup.VERTICAL_ALIGN_JUSTIFY;

		/*[Inspectable(type="String",enumeration="top,middle,bottom,justify")]*/
		/**
		 * Determines how the buttons are vertically aligned within the bounds
		 * of the button group (on the y-axis).
		 *
		 * <p>The following example aligns the group's content to the top:</p>
		 *
		 * <listing version="3.0">
		 * group.verticalAlign = ButtonGroup.VERTICAL_ALIGN_TOP;</listing>
		 *
		 * @default ButtonGroup.VERTICAL_ALIGN_JUSTIFY
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
		protected _distributeButtonSizes:boolean = true;

		/**
		 * If <code>true</code>, the buttons will be equally sized in the
		 * direction of the layout. In other words, if the button group is
		 * horizontal, each button will have the same width, and if the button
		 * group is vertical, each button will have the same height. If
		 * <code>false</code>, the buttons will be sized to their ideal
		 * dimensions.
		 *
		 * <p>The following example doesn't distribute the button sizes:</p>
		 *
		 * <listing version="3.0">
		 * group.distributeButtonSizes = false;</listing>
		 *
		 * @default true
		 */
		public get distributeButtonSizes():boolean
		{
			return this._distributeButtonSizes;
		}

		/**
		 * @private
		 */
		public set distributeButtonSizes(value:boolean)
		{
			if(this._distributeButtonSizes == value)
			{
				return;
			}
			this._distributeButtonSizes = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _gap:number = 0;

		/**
		 * Space, in pixels, between buttons.
		 *
		 * <p>The following example sets the gap used for the button layout to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * group.gap = 20;</listing>
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
		 * Space, in pixels, between the first two buttons. If <code>NaN</code>,
		 * the default <code>gap</code> property will be used.
		 *
		 * <p>The following example sets the gap between the first and second
		 * button to a different value than the standard gap:</p>
		 *
		 * <listing version="3.0">
		 * group.firstGap = 30;
		 * group.gap = 20;</listing>
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
		 * Space, in pixels, between the last two buttons. If <code>NaN</code>,
		 * the default <code>gap</code> property will be used.
		 *
		 * <p>The following example sets the gap between the last and next to last
		 * button to a different value than the standard gap:</p>
		 *
		 * <listing version="3.0">
		 * group.lastGap = 30;
		 * group.gap = 20;</listing>
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
		 * <p>In the following example, the padding of all sides of the group
		 * is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * group.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the group's top edge and the
		 * group's buttons.
		 *
		 * <p>In the following example, the padding on the top edge of the
		 * group is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * group.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the group's right edge and the
		 * group's buttons.
		 *
		 * <p>In the following example, the padding on the right edge of the
		 * group is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * group.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the group's bottom edge and the
		 * group's buttons.
		 *
		 * <p>In the following example, the padding on the bottom edge of the
		 * group is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * group.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the group's left edge and the
		 * group's buttons.
		 *
		 * <p>In the following example, the padding on the left edge of the
		 * group is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * group.paddingLeft = 20;</listing>
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
		protected _buttonFactory:Function = ButtonGroup.defaultButtonFactory;

		/**
		 * Creates a new button. A button must be an instance of <code>Button</code>.
		 * This factory can be used to change properties on the buttons when
		 * they are first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on a button.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():Button</pre>
		 *
		 * <p>The following example skins the buttons using a custom button
		 * factory:</p>
		 *
		 * <listing version="3.0">
		 * group.buttonFactory = function():Button
		 * {
		 *     var button:Button = new Button();
		 *     button.defaultSkin = new Image( texture );
		 *     return button;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #firstButtonFactory
		 * @see #lastButtonFactory
		 */
		public get buttonFactory():Function
		{
			return this._buttonFactory;
		}

		/**
		 * @private
		 */
		public set buttonFactory(value:Function)
		{
			if(this._buttonFactory == value)
			{
				return;
			}
			this._buttonFactory = value;
			this.invalidate(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _firstButtonFactory:Function;

		/**
		 * Creates a new first button. If the <code>firstButtonFactory</code> is
		 * <code>null</code>, then the button group will use the <code>buttonFactory</code>.
		 * The first button must be an instance of <code>Button</code>. This
		 * factory can be used to change properties on the first button when
		 * it is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the first button.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():Button</pre>
		 *
		 * <p>The following example skins the first button using a custom
		 * factory:</p>
		 *
		 * <listing version="3.0">
		 * group.firstButtonFactory = function():Button
		 * {
		 *     var button:Button = new Button();
		 *     button.defaultSkin = new Image( texture );
		 *     return button;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #buttonFactory
		 * @see #lastButtonFactory
		 */
		public get firstButtonFactory():Function
		{
			return this._firstButtonFactory;
		}

		/**
		 * @private
		 */
		public set firstButtonFactory(value:Function)
		{
			if(this._firstButtonFactory == value)
			{
				return;
			}
			this._firstButtonFactory = value;
			this.invalidate(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _lastButtonFactory:Function;

		/**
		 * Creates a new last button. If the <code>lastButtonFactory</code> is
		 * <code>null</code>, then the button group will use the <code>buttonFactory</code>.
		 * The last button must be an instance of <code>Button</code>. This
		 * factory can be used to change properties on the last button when
		 * it is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the last button.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():Button</pre>
		 *
		 * <p>The following example skins the last button using a custom
		 * factory:</p>
		 *
		 * <listing version="3.0">
		 * group.lastButtonFactory = function():Button
		 * {
		 *     var button:Button = new Button();
		 *     button.defaultSkin = new Image( texture );
		 *     return button;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #buttonFactory
		 * @see #firstButtonFactory
		 */
		public get lastButtonFactory():Function
		{
			return this._lastButtonFactory;
		}

		/**
		 * @private
		 */
		public set lastButtonFactory(value:Function)
		{
			if(this._lastButtonFactory == value)
			{
				return;
			}
			this._lastButtonFactory = value;
			this.invalidate(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _buttonInitializer:Function = this.defaultButtonInitializer;

		/**
		 * Modifies a button, perhaps by changing its label and icons, based on the
		 * item from the data provider that the button is meant to represent. The
		 * default buttonInitializer function can set the button's label and icons if
		 * <code>label</code> and/or any of the <code>Button</code> icon fields
		 * (<code>defaultIcon</code>, <code>upIcon</code>, etc.) are present in
		 * the item. You can listen to <code>Event.TRIGGERED</code> and
		 * <code>Event.CHANGE</code> by passing in functions for each.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function( button:Button, item:Object ):void</pre>
		 *
		 * <p>The following example provides a custom button initializer:</p>
		 *
		 * <listing version="3.0">
		 * group.buttonInitializer = function( button:Button, item:Object ):void
		 * {
		 *     button.label = item.label;
		 * };</listing>
		 *
		 * @see #dataProvider
		 */
		public get buttonInitializer():Function
		{
			return this._buttonInitializer;
		}

		/**
		 * @private
		 */
		public set buttonInitializer(value:Function)
		{
			if(this._buttonInitializer == value)
			{
				return;
			}
			this._buttonInitializer = value;
			this.invalidate(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customButtonStyleName:string;

		/**
		 * A style name to add to all buttons in this button group. Typically
		 * used by a theme to provide different styles to different button groups.
		 *
		 * <p>The following example provides a custom button style name:</p>
		 *
		 * <listing version="3.0">
		 * group.customButtonStyleName = "my-custom-button";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-button", setCustomButtonStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_BUTTON
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public get customButtonStyleName():string
		{
			return this._customButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customButtonStyleName(value:string)
		{
			if(this._customButtonStyleName == value)
			{
				return;
			}
			this._customButtonStyleName = value;
			this.invalidate(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customButtonStyleName
		 */
		public get customButtonName():string
		{
			return this.customButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customButtonName(value:string)
		{
			this.customButtonStyleName = value;
		}

		/**
		 * @private
		 */
		protected _customFirstButtonStyleName:string;

		/**
		 * A style name to add to the first button in this button group.
		 * Typically used by a theme to provide different styles to the first
		 * button.
		 *
		 * <p>The following example provides a custom first button style name:</p>
		 *
		 * <listing version="3.0">
		 * group.customFirstButtonStyleName = "my-custom-first-button";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-first-button", setCustomFirstButtonStyles );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public get customFirstButtonStyleName():string
		{
			return this._customFirstButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customFirstButtonStyleName(value:string)
		{
			if(this._customFirstButtonStyleName == value)
			{
				return;
			}
			this._customFirstButtonStyleName = value;
			this.invalidate(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customFirstButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customFirstButtonStyleName
		 */
		public get customFirstButtonName():string
		{
			return this.customFirstButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customFirstButtonName(value:string)
		{
			this.customFirstButtonStyleName = value;
		}

		/**
		 * @private
		 */
		protected _customLastButtonStyleName:string;

		/**
		 * A style name to add to the last button in this button group.
		 * Typically used by a theme to provide different styles to the last
		 * button.
		 *
		 * <p>The following example provides a custom last button style name:</p>
		 *
		 * <listing version="3.0">
		 * group.customLastButtonStyleName = "my-custom-last-button";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-last-button", setCustomLastButtonStyles );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public get customLastButtonStyleName():string
		{
			return this._customLastButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customLastButtonStyleName(value:string)
		{
			if(this._customLastButtonStyleName == value)
			{
				return;
			}
			this._customLastButtonStyleName = value;
			this.invalidate(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customLastButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customLastButtonStyleName
		 */
		public get customLastButtonName():string
		{
			return this.customLastButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customLastButtonName(value:string)
		{
			this.customLastButtonStyleName = value;
		}

		/**
		 * @private
		 */
		protected _buttonProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to all of the button
		 * group's buttons. These values are shared by each button, so values
		 * that cannot be shared (such as display objects that need to be added
		 * to the display list) should be passed to buttons using the
		 * <code>buttonFactory</code> or in a theme. The buttons in a button
		 * group are instances of <code>feathers.controls.Button</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>The following example sets some properties on all of the buttons:</p>
		 *
		 * <listing version="3.0">
		 * group.buttonProperties.horizontalAlign = Button.HORIZONTAL_ALIGN_LEFT;
		 * group.buttonProperties.verticalAlign = Button.VERTICAL_ALIGN_TOP;</listing>
		 *
		 * <p>Setting properties in a <code>buttonFactory</code> function instead
		 * of using <code>buttonProperties</code> will result in better
		 * performance.</p>
		 *
		 * @default null
		 *
		 * @see #buttonFactory
		 * @see #firstButtonFactory
		 * @see #lastButtonFactory
		 * @see feathers.controls.Button
		 */
		public get buttonProperties():Object
		{
			if(!this._buttonProperties)
			{
				this._buttonProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._buttonProperties;
		}

		/**
		 * @private
		 */
		public set buttonProperties(value:Object)
		{
			if(this._buttonProperties == value)
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
			if(this._buttonProperties)
			{
				this._buttonProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._buttonProperties = PropertyProxy(value);
			if(this._buttonProperties)
			{
				this._buttonProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			this.dataProvider = null;
			super.dispose();
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var buttonFactoryInvalid:boolean = this.isInvalid(ButtonGroup.INVALIDATION_FLAG_BUTTON_FACTORY);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);

			if(dataInvalid || stateInvalid || buttonFactoryInvalid)
			{
				this.refreshButtons(buttonFactoryInvalid);
			}

			if(dataInvalid || buttonFactoryInvalid || stylesInvalid)
			{
				this.refreshButtonStyles();
			}

			if(dataInvalid || stateInvalid || buttonFactoryInvalid)
			{
				this.commitEnabled();
			}

			if(stylesInvalid)
			{
				this.refreshLayoutStyles();
			}

			this.layoutButtons();
		}

		/**
		 * @private
		 */
		protected commitEnabled():void
		{
			var buttonCount:number = this.activeButtons.length;
			for(var i:number = 0; i < buttonCount; i++)
			{
				var button:Button = this.activeButtons[i];
				button.isEnabled &&this.= this._isEnabled;
			}
		}

		/**
		 * @private
		 */
		protected refreshButtonStyles():void
		{
			for(var propertyName:string in this._buttonProperties)
			{
				var propertyValue:Object = this._buttonProperties[propertyName];
				for each(var button:Button in this.activeButtons)
				{
					button[propertyName] = propertyValue;
				}
			}
		}

		/**
		 * @private
		 */
		protected refreshLayoutStyles():void
		{
			if(this._direction == ButtonGroup.DIRECTION_VERTICAL)
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
				this.verticalLayout.distributeHeights = this._distributeButtonSizes;
				this.verticalLayout.horizontalAlign = this._horizontalAlign;
				this.verticalLayout.verticalAlign = (this._verticalAlign == ButtonGroup.VERTICAL_ALIGN_JUSTIFY) ? ButtonGroup.VERTICAL_ALIGN_TOP : this._verticalAlign;
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
				this.horizontalLayout.distributeWidths = this._distributeButtonSizes;
				this.horizontalLayout.horizontalAlign = (this._horizontalAlign == ButtonGroup.HORIZONTAL_ALIGN_JUSTIFY) ? ButtonGroup.HORIZONTAL_ALIGN_LEFT : this._horizontalAlign;
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
		protected defaultButtonInitializer(button:Button, item:Object):void
		{
			if(item instanceof Object)
			{
				if(item.hasOwnProperty(ButtonGroup.LABEL_FIELD))
				{
					button.label = <String>item.label ;
				}
				else
				{
					button.label = item.toString();
				}
				if(item.hasOwnProperty(ButtonGroup.ENABLED_FIELD))
				{
					button.isEnabled = <Boolean>item.isEnabled ;
				}
				else
				{
					button.isEnabled = this._isEnabled;
				}
				for each(var field:string in ButtonGroup.DEFAULT_BUTTON_FIELDS)
				{
					if(item.hasOwnProperty(field))
					{
						button[field] = item[field];
					}
				}
				for each(field in ButtonGroup.DEFAULT_BUTTON_EVENTS)
				{
					var removeListener:boolean = true;
					if(item.hasOwnProperty(field))
					{
						var listener:Function = <Function>item[field] ;
						if(listener == null)
						{
							continue;
						}
						removeListener =  false;
						//we can't add the listener directly because we don't
						//know how to remove it later if the data provider
						//changes and we lose the old item. we'll use another
						//event listener that we control as a delegate, and
						//we'll be able to remove it later.
						button.addEventListener(field, this.defaultButtonEventsListener);
					}
					if(removeListener)
					{
						button.removeEventListener(field, this.defaultButtonEventsListener);
					}
				}
			}
			else
			{
				button.label = "";
			}
		}

		/**
		 * @private
		 */
		protected refreshButtons(isFactoryInvalid:boolean):void
		{
			var temp:Button[] = this.inactiveButtons;
			this.inactiveButtons = this.activeButtons;
			this.activeButtons = temp;
			this.activeButtons.length = 0;
			this._layoutItems.length = 0;
			temp = null;
			if(isFactoryInvalid)
			{
				this.clearInactiveButtons();
			}
			else
			{
				if(this.activeFirstButton)
				{
					this.inactiveButtons.shift();
				}
				this.inactiveFirstButton = this.activeFirstButton;

				if(this.activeLastButton)
				{
					this.inactiveButtons.pop();
				}
				this.inactiveLastButton = this.activeLastButton;
			}
			this.activeFirstButton = null;
			this.activeLastButton = null;

			var pushIndex:number = 0;
			var itemCount:number = this._dataProvider ? this._dataProvider.length : 0;
			var lastItemIndex:number = itemCount - 1;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:Object = this._dataProvider.getItemAt(i);
				if(i == 0)
				{
					var button:Button = this.activeFirstButton = this.createFirstButton(item);
				}
				else if(i == lastItemIndex)
				{
					button = this.activeLastButton = this.createLastButton(item);
				}
				else
				{
					button = this.createButton(item);
				}
				this.activeButtons[pushIndex] = button;
				this._layoutItems[pushIndex] = button;
				pushIndex++;
			}
			this.clearInactiveButtons();
		}

		/**
		 * @private
		 */
		protected clearInactiveButtons():void
		{
			var itemCount:number = this.inactiveButtons.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var button:Button = this.inactiveButtons.shift();
				this.destroyButton(button);
			}

			if(this.inactiveFirstButton)
			{
				this.destroyButton(this.inactiveFirstButton);
				this.inactiveFirstButton = null;
			}

			if(this.inactiveLastButton)
			{
				this.destroyButton(this.inactiveLastButton);
				this.inactiveLastButton = null;
			}
		}

		/**
		 * @private
		 */
		protected createFirstButton(item:Object):Button
		{
			var isNewInstance:boolean = false;
			if(this.inactiveFirstButton)
			{
				var button:Button = this.inactiveFirstButton;
				this.inactiveFirstButton = null;
			}
			else
			{
				isNewInstance = true;
				var factory:Function = this._firstButtonFactory != null ? this._firstButtonFactory : this._buttonFactory;
				button = this.Button(factory());
				if(this._customFirstButtonStyleName)
				{
					button.styleNameList.add(this._customFirstButtonStyleName);
				}
				else if(this._customButtonStyleName)
				{
					button.styleNameList.add(this._customButtonStyleName);
				}
				else
				{
					button.styleNameList.add(this.firstButtonStyleName);
				}
				this.addChild(button);
			}
			this._buttonInitializer(button, item);
			if(isNewInstance)
			{
				//we need to listen for Event.TRIGGERED after the initializer
				//is called to avoid runtime errors because the button may be
				//disposed by the time listeners in the initializer are called.
				button.addEventListener(Event.TRIGGERED, this.button_triggeredHandler);
			}
			return button;
		}

		/**
		 * @private
		 */
		protected createLastButton(item:Object):Button
		{
			var isNewInstance:boolean = false;
			if(this.inactiveLastButton)
			{
				var button:Button = this.inactiveLastButton;
				this.inactiveLastButton = null;
			}
			else
			{
				isNewInstance = true;
				var factory:Function = this._lastButtonFactory != null ? this._lastButtonFactory : this._buttonFactory;
				button = this.Button(factory());
				if(this._customLastButtonStyleName)
				{
					button.styleNameList.add(this._customLastButtonStyleName);
				}
				else if(this._customButtonStyleName)
				{
					button.styleNameList.add(this._customButtonStyleName);
				}
				else
				{
					button.styleNameList.add(this.lastButtonStyleName);
				}
				this.addChild(button);
			}
			this._buttonInitializer(button, item);
			if(isNewInstance)
			{
				//we need to listen for Event.TRIGGERED after the initializer
				//is called to avoid runtime errors because the button may be
				//disposed by the time listeners in the initializer are called.
				button.addEventListener(Event.TRIGGERED, this.button_triggeredHandler);
			}
			return button;
		}

		/**
		 * @private
		 */
		protected createButton(item:Object):Button
		{
			var isNewInstance:boolean = false;
			if(this.inactiveButtons.length == 0)
			{
				isNewInstance = true;
				var button:Button = this._buttonFactory();
				if(this._customButtonStyleName)
				{
					button.styleNameList.add(this._customButtonStyleName);
				}
				else
				{
					button.styleNameList.add(this.buttonStyleName);
				}
				this.addChild(button);
			}
			else
			{
				button = this.inactiveButtons.shift();
			}
			this._buttonInitializer(button, item);
			if(isNewInstance)
			{
				//we need to listen for Event.TRIGGERED after the initializer
				//is called to avoid runtime errors because the button may be
				//disposed by the time listeners in the initializer are called.
				button.addEventListener(Event.TRIGGERED, this.button_triggeredHandler);
			}
			return button;
		}

		/**
		 * @private
		 */
		protected destroyButton(button:Button):void
		{
			button.removeEventListener(Event.TRIGGERED, this.button_triggeredHandler);
			this.removeChild(button, true);
		}

		/**
		 * @private
		 */
		protected layoutButtons():void
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
			for each(var button:Button in this.activeButtons)
			{
				button.validate();
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
		protected dataProvider_changeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected button_triggeredHandler(event:Event):void
		{
			//if this was called after dispose, ignore it
			if(!this._dataProvider || !this.activeButtons)
			{
				return;
			}
			var button:Button = this.Button(event.currentTarget);
			var index:number = this.activeButtons.indexOf(button);
			var item:Object = this._dataProvider.getItemAt(index);
			this.dispatchEventWith(Event.TRIGGERED, false, item);
		}

		/**
		 * @private
		 */
		protected defaultButtonEventsListener(event:Event):void
		{
			var button:Button = this.Button(event.currentTarget);
			var index:number = this.activeButtons.indexOf(button);
			var item:Object = this._dataProvider.getItemAt(index);
			var field:string = event.type;
			if(item.hasOwnProperty(field))
			{
				var listener:Function = <Function>item[field] ;
				if(listener == null)
				{
					return;
				}
				var argCount:number = listener.length;
				if(argCount == 1)
				{
					listener(event);
				}
				else if(argCount == 2)
				{
					listener(event, event.data);
				}
				else
				{
					listener();
				}
			}
		}
	}
}
