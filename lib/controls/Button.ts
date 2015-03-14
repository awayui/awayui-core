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
	import IFocusDisplayObject = feathers.core.IFocusDisplayObject;
	import ITextRenderer = feathers.core.ITextRenderer;
	import IValidating = feathers.core.IValidating;
	import PropertyProxy = feathers.core.PropertyProxy;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import StateWithToggleValueSelector = feathers.skins.StateWithToggleValueSelector;

	import Point = flash.geom.Point;
	import Keyboard = flash.ui.Keyboard;
	import getTimer = flash.utils.getTimer;

	import RenderSupport = starling.core.RenderSupport;
	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the the user taps or clicks the button. The touch must
	 * remain within the bounds of the button on release to register as a tap
	 * or a click. If focus management is enabled, the button may also be
	 * triggered by pressing the spacebar while the button has focus.
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
	 * @eventType starling.events.Event.TRIGGERED
	 */
	/*[Event(name="triggered",type="starling.events.Event")]*/

	/**
	 * Dispatched when the button is pressed for a long time. The property
	 * <code>isLongPressEnabled</code> must be set to <code>true</code> before
	 * this event will be dispatched.
	 *
	 * <p>The following example enables long presses:</p>
	 *
	 * <listing version="3.0">
	 * button.isLongPressEnabled = true;
	 * button.addEventListener( FeathersEventType.LONG_PRESS, function( event:Event ):void
	 * {
	 *     // long press
	 * });</listing>
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
	 * @eventType feathers.events.FeathersEventType.LONG_PRESS
	 * @see #isLongPressEnabled
	 * @see #longPressDuration
	 */
	/*[Event(name="longPress",type="starling.events.Event")]*/

	/**
	 * A push button control that may be triggered when pressed and released.
	 *
	 * <p>The following example creates a button, gives it a label and listens
	 * for when the button is triggered:</p>
	 *
	 * <listing version="3.0">
	 * var button:Button = new Button();
	 * button.label = "Click Me";
	 * button.addEventListener( Event.TRIGGERED, button_triggeredHandler );
	 * this.addChild( button );</listing>
	 *
	 * @see ../../../help/button.html How to use the Feathers Button component
	 */
	export class Button extends FeathersControl implements IFocusDisplayObject
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * The default value added to the <code>styleNameList</code> of the label.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_LABEL:string = "feathers-button-label";

		/**
		 * DEPRECATED: Replaced by <code>Button.DEFAULT_CHILD_STYLE_NAME_LABEL</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Button#DEFAULT_CHILD_STYLE_NAME_LABEL
		 */
		public static DEFAULT_CHILD_NAME_LABEL:string = Button.DEFAULT_CHILD_STYLE_NAME_LABEL;

		/**
		 * An alternate style name to use with <code>Button</code> to allow a
		 * theme to give it a more prominent, "call-to-action" style. If a theme
		 * does not provide a style for a call-to-action button, the theme will
		 * automatically fall back to using the default button style.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the call-to-action style is applied to
		 * a button:</p>
		 *
		 * <listing version="3.0">
		 * var button:Button = new Button();
		 * button.styleNameList.add( Button.ALTERNATE_STYLE_NAME_CALL_TO_ACTION_BUTTON );
		 * this.addChild( button );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_CALL_TO_ACTION_BUTTON:string = "feathers-call-to-action-button";

		/**
		 * DEPRECATED: Replaced by <code>Button.ALTERNATE_STYLE_NAME_CALL_TO_ACTION_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Button#ALTERNATE_STYLE_NAME_CALL_TO_ACTION_BUTTON
		 */
		public static ALTERNATE_NAME_CALL_TO_ACTION_BUTTON:string = Button.ALTERNATE_STYLE_NAME_CALL_TO_ACTION_BUTTON;

		/**
		 * An alternate style name to use with <code>Button</code> to allow a
		 * theme to give it a less prominent, "quiet" style. If a theme does not
		 * provide a style for a quiet button, the theme will automatically fall
		 * back to using the default button style.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the quiet button style is applied to
		 * a button:</p>
		 *
		 * <listing version="3.0">
		 * var button:Button = new Button();
		 * button.styleNameList.add( Button.ALTERNATE_STYLE_NAME_QUIET_BUTTON );
		 * this.addChild( button );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_QUIET_BUTTON:string = "feathers-quiet-button";

		/**
		 * DEPRECATED: Replaced by <code>Button.ALTERNATE_STYLE_NAME_QUIET_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Button#ALTERNATE_STYLE_NAME_QUIET_BUTTON
		 */
		public static ALTERNATE_NAME_QUIET_BUTTON:string = Button.ALTERNATE_STYLE_NAME_QUIET_BUTTON;

		/**
		 * An alternate style name to use with <code>Button</code> to allow a
		 * theme to give it a highly prominent, "danger" style. An example would
		 * be a delete button or some other button that has a destructive action
		 * that cannot be undone if the button is triggered. If a theme does not
		 * provide a style for the danger button, the theme will automatically
		 * fall back to using the default button style.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the danger button style is applied to
		 * a button:</p>
		 *
		 * <listing version="3.0">
		 * var button:Button = new Button();
		 * button.styleNameList.add( Button.ALTERNATE_STYLE_NAME_DANGER_BUTTON );
		 * this.addChild( button );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_DANGER_BUTTON:string = "feathers-danger-button";

		/**
		 * DEPRECATED: Replaced by <code>Button.ALTERNATE_STYLE_NAME_DANGER_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Button#ALTERNATE_STYLE_NAME_DANGER_BUTTON
		 */
		public static ALTERNATE_NAME_DANGER_BUTTON:string = Button.ALTERNATE_STYLE_NAME_DANGER_BUTTON;

		/**
		 * An alternate style name to use with <code>Button</code> to allow a
		 * theme to give it a "back button" style, perhaps with an arrow
		 * pointing backward. If a theme does not provide a style for a back
		 * button, the theme will automatically fall back to using the default
		 * button skin.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the back button style is applied to
		 * a button:</p>
		 *
		 * <listing version="3.0">
		 * var button:Button = new Button();
		 * button.styleNameList.add( Button.ALTERNATE_STYLE_NAME_BACK_BUTTON );
		 * this.addChild( button );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_BACK_BUTTON:string = "feathers-back-button";

		/**
		 * DEPRECATED: Replaced by <code>Button.ALTERNATE_STYLE_NAME_BACK_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Button#ALTERNATE_STYLE_NAME_BACK_BUTTON
		 */
		public static ALTERNATE_NAME_BACK_BUTTON:string = Button.ALTERNATE_STYLE_NAME_BACK_BUTTON;

		/**
		 * An alternate style name to use with <code>Button</code> to allow a
		 * theme to give it a "forward" button style, perhaps with an arrow
		 * pointing forward. If a theme does not provide a style for a forward
		 * button, the theme will automatically fall back to using the default
		 * button style.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the forward button style is applied to
		 * a button:</p>
		 *
		 * <listing version="3.0">
		 * var button:Button = new Button();
		 * button.styleNameList.add( Button.ALTERNATE_STYLE_NAME_FORWARD_BUTTON );
		 * this.addChild( button );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_FORWARD_BUTTON:string = "feathers-forward-button";

		/**
		 * DEPRECATED: Replaced by <code>Button.ALTERNATE_STYLE_NAME_FORWARD_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Button#ALTERNATE_STYLE_NAME_FORWARD_BUTTON
		 */
		public static ALTERNATE_NAME_FORWARD_BUTTON:string = Button.ALTERNATE_STYLE_NAME_FORWARD_BUTTON;
		
		/**
		 * Identifier for the button's up state. Can be used for styling purposes.
		 *
		 * @see #stateToSkinFunction
		 * @see #stateToIconFunction
		 * @see #stateToLabelPropertiesFunction
		 */
		public static STATE_UP:string = "up";
		
		/**
		 * Identifier for the button's down state. Can be used for styling purposes.
		 *
		 * @see #stateToSkinFunction
		 * @see #stateToIconFunction
		 * @see #stateToLabelPropertiesFunction
		 */
		public static STATE_DOWN:string = "down";

		/**
		 * Identifier for the button's hover state. Can be used for styling purposes.
		 *
		 * @see #stateToSkinFunction
		 * @see #stateToIconFunction
		 * @see #stateToLabelPropertiesFunction
		 */
		public static STATE_HOVER:string = "hover";
		
		/**
		 * Identifier for the button's disabled state. Can be used for styling purposes.
		 *
		 * @see #stateToSkinFunction
		 * @see #stateToIconFunction
		 * @see #stateToLabelPropertiesFunction
		 */
		public static STATE_DISABLED:string = "disabled";
		
		/**
		 * The icon will be positioned above the label.
		 *
		 * @see #iconPosition
		 */
		public static ICON_POSITION_TOP:string = "top";
		
		/**
		 * The icon will be positioned to the right of the label.
		 *
		 * @see #iconPosition
		 */
		public static ICON_POSITION_RIGHT:string = "right";
		
		/**
		 * The icon will be positioned below the label.
		 *
		 * @see #iconPosition
		 */
		public static ICON_POSITION_BOTTOM:string = "bottom";
		
		/**
		 * The icon will be positioned to the left of the label.
		 *
		 * @see #iconPosition
		 */
		public static ICON_POSITION_LEFT:string = "left";

		/**
		 * The icon will be positioned manually with no relation to the position
		 * of the label. Use <code>iconOffsetX</code> and <code>iconOffsetY</code>
		 * to set the icon's position.
		 *
		 * @see #iconPosition
		 * @see #iconOffsetX
		 * @see #iconOffsetY
		 */
		public static ICON_POSITION_MANUAL:string = "manual";
		
		/**
		 * The icon will be positioned to the left the label, and the bottom of
		 * the icon will be aligned to the baseline of the label text.
		 *
		 * @see #iconPosition
		 */
		public static ICON_POSITION_LEFT_BASELINE:string = "leftBaseline";
		
		/**
		 * The icon will be positioned to the right the label, and the bottom of
		 * the icon will be aligned to the baseline of the label text.
		 *
		 * @see #iconPosition
		 */
		public static ICON_POSITION_RIGHT_BASELINE:string = "rightBaseline";
		
		/**
		 * The icon and label will be aligned horizontally to the left edge of the button.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";
		
		/**
		 * The icon and label will be aligned horizontally to the center of the button.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";
		
		/**
		 * The icon and label will be aligned horizontally to the right edge of the button.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_RIGHT:string = "right";
		
		/**
		 * The icon and label will be aligned vertically to the top edge of the button.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";
		
		/**
		 * The icon and label will be aligned vertically to the middle of the button.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";
		
		/**
		 * The icon and label will be aligned vertically to the bottom edge of the button.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * The default <code>IStyleProvider</code> for all <code>Button</code>
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
			super();
			this.isQuickHitAreaEnabled = true;
			this.addEventListener(TouchEvent.TOUCH, this.button_touchHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.button_removedFromStageHandler);
		}

		/**
		 * The value added to the <code>styleNameList</code> of the label text
		 * renderer. This variable is <code>protected</code> so that sub-classes
		 * can customize the label text renderer style name in their
		 * constructors instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_LABEL</code>.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected labelStyleName:string = Button.DEFAULT_CHILD_STYLE_NAME_LABEL;

		/**
		 * DEPRECATED: Replaced by <code>labelStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #labelStyleName
		 */
		protected get labelName():string
		{
			return this.labelStyleName;
		}

		/**
		 * @private
		 */
		protected set labelName(value:string)
		{
			this.labelStyleName = value;
		}
		
		/**
		 * The text renderer for the button's label.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #label
		 * @see #labelFactory
		 * @see #createLabel()
		 */
		protected labelTextRenderer:ITextRenderer;
		
		/**
		 * The currently visible skin. The value will be <code>null</code> if
		 * there is no currently visible skin.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected currentSkin:DisplayObject;
		
		/**
		 * The currently visible icon. The value will be <code>null</code> if
		 * there is no currently visible icon.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected currentIcon:DisplayObject;
		
		/**
		 * The saved ID of the currently active touch. The value will be
		 * <code>-1</code> if there is no currently active touch.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected touchPointID:number = -1;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Button.globalStyleProvider;
		}
		
		/**
		 * @private
		 */
		/*override*/ public set isEnabled(value:boolean)
		{
			if(this._isEnabled == value)
			{
				return;
			}
			super.isEnabled = value;
			if(!this._isEnabled)
			{
				this.touchable = false;
				this.currentState = Button.STATE_DISABLED;
				this.touchPointID = -1;
			}
			else
			{
				//might be in another state for some reason
				//let's only change to up if needed
				if(this.currentState == Button.STATE_DISABLED)
				{
					this.currentState = Button.STATE_UP;
				}
				this.touchable = true;
			}
		}
		
		/**
		 * @private
		 */
		protected _currentState:string = Button.STATE_UP;
		
		/**
		 * The current touch state of the button.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected get currentState():string
		{
			return this._currentState;
		}
		
		/**
		 * @private
		 */
		protected set currentState(value:string)
		{
			if(this._currentState == value)
			{
				return;
			}
			if(this.stateNames.indexOf(value) < 0)
			{
				throw new ArgumentError("Invalid state: " + value + ".");
			}
			this._currentState = value;
			this.invalidate(this.INVALIDATION_FLAG_STATE);
		}
		
		/**
		 * @private
		 */
		protected _label:string = null;
		
		/**
		 * The text displayed on the button.
		 *
		 * <p>The following example gives the button some label text:</p>
		 *
		 * <listing version="3.0">
		 * button.label = "Click Me";</listing>
		 *
		 * @default null
		 */
		public get label():string
		{
			return this._label;
		}
		
		/**
		 * @private
		 */
		public set label(value:string)
		{
			if(this._label == value)
			{
				return;
			}
			this._label = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _hasLabelTextRenderer:boolean = true;

		/**
		 * Determines if the button's label text renderer is created or not.
		 * Useful for button sub-components that may not display text, like
		 * slider thumbs and tracks, or similar sub-components on scroll bars.
		 *
		 * <p>The following example removed the label text renderer:</p>
		 *
		 * <listing version="3.0">
		 * button.hasLabelTextRenderer = false;</listing>
		 *
		 * @default true
		 */
		public get hasLabelTextRenderer():boolean
		{
			return this._hasLabelTextRenderer;
		}

		/**
		 * @private
		 */
		public set hasLabelTextRenderer(value:boolean)
		{
			if(this._hasLabelTextRenderer == value)
			{
				return;
			}
			this._hasLabelTextRenderer = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}
		
		/**
		 * @private
		 */
		protected _iconPosition:string = Button.ICON_POSITION_LEFT;

		/*[Inspectable(type="String",enumeration="top,right,bottom,left,rightBaseline,leftBaseline,manual")]*/
		/**
		 * The location of the icon, relative to the label.
		 *
		 * <p>The following example positions the icon to the right of the
		 * label:</p>
		 *
		 * <listing version="3.0">
		 * button.label = "Click Me";
		 * button.defaultIcon = new Image( texture );
		 * button.iconPosition = Button.ICON_POSITION_RIGHT;</listing>
		 *
		 * @default Button.ICON_POSITION_LEFT
		 *
		 * @see #ICON_POSITION_TOP
		 * @see #ICON_POSITION_RIGHT
		 * @see #ICON_POSITION_BOTTOM
		 * @see #ICON_POSITION_LEFT
		 * @see #ICON_POSITION_RIGHT_BASELINE
		 * @see #ICON_POSITION_LEFT_BASELINE
		 * @see #ICON_POSITION_MANUAL
		 */
		public get iconPosition():string
		{
			return this._iconPosition;
		}
		
		/**
		 * @private
		 */
		public set iconPosition(value:string)
		{
			if(this._iconPosition == value)
			{
				return;
			}
			this._iconPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * @private
		 */
		protected _gap:number = 0;
		
		/**
		 * The space, in pixels, between the icon and the label. Applies to
		 * either horizontal or vertical spacing, depending on the value of
		 * <code>iconPosition</code>.
		 * 
		 * <p>If <code>gap</code> is set to <code>Number.POSITIVE_INFINITY</code>,
		 * the label and icon will be positioned as far apart as possible. In
		 * other words, they will be positioned at the edges of the button,
		 * adjusted for padding.</p>
		 *
		 * <p>The following example creates a gap of 50 pixels between the label
		 * and the icon:</p>
		 *
		 * <listing version="3.0">
		 * button.label = "Click Me";
		 * button.defaultIcon = new Image( texture );
		 * button.gap = 50;</listing>
		 *
		 * @default 0
		 * 
		 * @see #iconPosition
		 * @see #minGap
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
		protected _minGap:number = 0;

		/**
		 * If the value of the <code>gap</code> property is
		 * <code>Number.POSITIVE_INFINITY</code>, meaning that the gap will
		 * fill as much space as possible, the final calculated value will not be
		 * smaller than the value of the <code>minGap</code> property.
		 *
		 * <p>The following example ensures that the gap is never smaller than
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * button.gap = Number.POSITIVE_INFINITY;
		 * button.minGap = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #gap
		 */
		public get minGap():number
		{
			return this._minGap;
		}

		/**
		 * @private
		 */
		public set minGap(value:number)
		{
			if(this._minGap == value)
			{
				return;
			}
			this._minGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * @private
		 */
		protected _horizontalAlign:string = Button.HORIZONTAL_ALIGN_CENTER;

		/*[Inspectable(type="String",enumeration="left,center,right")]*/
		/**
		 * The location where the button's content is aligned horizontally (on
		 * the x-axis).
		 *
		 * <p>The following example aligns the button's content to the left:</p>
		 *
		 * <listing version="3.0">
		 * button.horizontalAlign = Button.HORIZONTAL_ALIGN_LEFT;</listing>
		 *
		 * @default Button.HORIZONTAL_ALIGN_CENTER
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * @private
		 */
		protected _verticalAlign:string = Button.VERTICAL_ALIGN_MIDDLE;

		/*[Inspectable(type="String",enumeration="top,middle,bottom")]*/
		/**
		 * The location where the button's content is aligned vertically (on
		 * the y-axis).
		 *
		 * <p>The following example aligns the button's content to the top:</p>
		 *
		 * <listing version="3.0">
		 * button.verticalAlign = Button.VERTICAL_ALIGN_TOP;</listing>
		 *
		 * @default Button.VERTICAL_ALIGN_MIDDLE
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
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>The following example gives the button 20 pixels of padding on all
		 * sides:</p>
		 *
		 * <listing version="3.0">
		 * button.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the button's top edge and the
		 * button's content.
		 *
		 * <p>The following example gives the button 20 pixels of padding on the
		 * top edge only:</p>
		 *
		 * <listing version="3.0">
		 * button.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the button's right edge and the
		 * button's content.
		 *
		 * <p>The following example gives the button 20 pixels of padding on the
		 * right edge only:</p>
		 *
		 * <listing version="3.0">
		 * button.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the button's bottom edge and
		 * the button's content.
		 *
		 * <p>The following example gives the button 20 pixels of padding on the
		 * bottom edge only:</p>
		 *
		 * <listing version="3.0">
		 * button.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the button's left edge and the
		 * button's content.
		 *
		 * <p>The following example gives the button 20 pixels of padding on the
		 * left edge only:</p>
		 *
		 * <listing version="3.0">
		 * button.paddingLeft = 20;</listing>
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
		protected _labelOffsetX:number = 0;

		/**
		 * Offsets the x position of the label by a certain number of pixels.
		 * This does not affect the measurement of the button. The button will
		 * measure itself as if the label were not offset from its original
		 * position.
		 *
		 * <p>The following example offsets the x position of the button's label
		 * by 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * button.labelOffsetX = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #labelOffsetY
		 */
		public get labelOffsetX():number
		{
			return this._labelOffsetX;
		}

		/**
		 * @private
		 */
		public set labelOffsetX(value:number)
		{
			if(this._labelOffsetX == value)
			{
				return;
			}
			this._labelOffsetX = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _labelOffsetY:number = 0;

		/**
		 * Offsets the y position of the label by a certain number of pixels.
		 * This does not affect the measurement of the button. The button will
		 * measure itself as if the label were not offset from its original
		 * position.
		 *
		 * <p>The following example offsets the y position of the button's label
		 * by 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * button.labelOffsetY = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #labelOffsetX
		 */
		public get labelOffsetY():number
		{
			return this._labelOffsetY;
		}

		/**
		 * @private
		 */
		public set labelOffsetY(value:number)
		{
			if(this._labelOffsetY == value)
			{
				return;
			}
			this._labelOffsetY = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _iconOffsetX:number = 0;

		/**
		 * Offsets the x position of the icon by a certain number of pixels.
		 * This does not affect the measurement of the button. The button will
		 * measure itself as if the icon were not offset from its original
		 * position.
		 *
		 * <p>The following example offsets the x position of the button's icon
		 * by 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * button.iconOffsetX = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #iconOffsetY
		 */
		public get iconOffsetX():number
		{
			return this._iconOffsetX;
		}

		/**
		 * @private
		 */
		public set iconOffsetX(value:number)
		{
			if(this._iconOffsetX == value)
			{
				return;
			}
			this._iconOffsetX = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _iconOffsetY:number = 0;

		/**
		 * Offsets the y position of the icon by a certain number of pixels.
		 * This does not affect the measurement of the button. The button will
		 * measure itself as if the icon were not offset from its original
		 * position.
		 *
		 * <p>The following example offsets the y position of the button's icon
		 * by 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * button.iconOffsetY = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #iconOffsetX
		 */
		public get iconOffsetY():number
		{
			return this._iconOffsetY;
		}

		/**
		 * @private
		 */
		public set iconOffsetY(value:number)
		{
			if(this._iconOffsetY == value)
			{
				return;
			}
			this._iconOffsetY = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * Determines if a pressed button should remain in the down state if a
		 * touch moves outside of the button's bounds. Useful for controls like
		 * <code>Slider</code> and <code>ToggleSwitch</code> to keep a thumb in
		 * the down state while it is dragged around.
		 *
		 * <p>The following example ensures that the button's down state remains
		 * active when the button is pressed but the touch moves outside the
		 * button's bounds:</p>
		 *
		 * <listing version="3.0">
		 * button.keepDownStateOnRollOut = true;</listing>
		 */
		public keepDownStateOnRollOut:boolean = false;

		/**
		 * @private
		 */
		protected _stateNames:string[] = new Array<string>(Button.STATE_UP, Button.STATE_DOWN, Button.STATE_HOVER, Button.STATE_DISABLED);

		/**
		 * A list of all valid touch state names for use with <code>currentState</code>.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #currentState
		 */
		protected get stateNames():string[]
		{
			return this._stateNames;
		}

		/**
		 * @private
		 */
		protected _originalSkinWidth:number = NaN;

		/**
		 * @private
		 */
		protected _originalSkinHeight:number = NaN;

		/**
		 * @private
		 */
		protected _stateToSkinFunction:Function;

		/**
		 * Returns a skin for the current state. Can be used instead of
		 * individual skin properties for different states, like
		 * <code>upSkin</code> or <code>hoverSkin</code>, to reuse the same
		 * display object for all states. The function should simply change the
		 * display object's properties. For example, a function could reuse the
		 * the same <code>starling.display.Image</code> instance among all
		 * button states, and change its texture for each state.
		 *
		 * <p>The following function signature is expected:</p>
		 * <pre>function(target:Button, state:Object, oldSkin:DisplayObject = null):DisplayObject</pre>
		 *
		 * @default null
		 */
		public get stateToSkinFunction():Function
		{
			return this._stateToSkinFunction;
		}

		/**
		 * @private
		 */
		public set stateToSkinFunction(value:Function)
		{
			if(this._stateToSkinFunction == value)
			{
				return;
			}
			this._stateToSkinFunction = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _stateToIconFunction:Function;

		/**
		 * Returns an icon for the current state. Can be used instead of
		 * individual icon properties for different states, like
		 * <code>upIcon</code> or <code>hoverIcon</code>, to reuse the same
		 * display object for all states. the function should simply change the
		 * display object's properties. For example, a function could reuse the
		 * the same <code>starling.display.Image</code> instance among all
		 * button states, and change its texture for each state.
		 *
		 * <p>The following function signature is expected:</p>
		 * <pre>function(target:Button, state:Object, oldIcon:DisplayObject = null):DisplayObject</pre>
		 *
		 * @default null
		 */
		public get stateToIconFunction():Function
		{
			return this._stateToIconFunction;
		}

		/**
		 * @private
		 */
		public set stateToIconFunction(value:Function)
		{
			if(this._stateToIconFunction == value)
			{
				return;
			}
			this._stateToIconFunction = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _stateToLabelPropertiesFunction:Function;

		/**
		 * Returns a text format for the current state.
		 *
		 * <p>The following function signature is expected:</p>
		 * <pre>function(target:Button, state:Object):Object</pre>
		 *
		 * @default null
		 */
		public get stateToLabelPropertiesFunction():Function
		{
			return this._stateToLabelPropertiesFunction;
		}

		/**
		 * @private
		 */
		public set stateToLabelPropertiesFunction(value:Function)
		{
			if(this._stateToLabelPropertiesFunction == value)
			{
				return;
			}
			this._stateToLabelPropertiesFunction = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 * Chooses an appropriate skin based on the state and the selection.
		 */
		protected _skinSelector:StateWithToggleValueSelector = new StateWithToggleValueSelector();
		
		/**
		 * The skin used when no other skin is defined for the current state.
		 * Intended to be used when multiple states should share the same skin.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToSkinFunction</code> property.</p>
		 *
		 * <p>The following example gives the button a default skin to use for
		 * all states when no specific skin is available:</p>
		 *
		 * <listing version="3.0">
		 * button.defaultSkin = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #stateToSkinFunction
		 * @see #upSkin
		 * @see #downSkin
		 * @see #hoverSkin
		 * @see #disabledSkin
		 */
		public get defaultSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.defaultValue);
		}
		
		/**
		 * @private
		 */
		public set defaultSkin(value:DisplayObject)
		{
			if(this._skinSelector.defaultValue == value)
			{
				return;
			}
			this._skinSelector.defaultValue = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * The skin used for the button's up state. If <code>null</code>, then
		 * <code>defaultSkin</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToSkinFunction</code> property.</p>
		 *
		 * <p>The following example gives the button a skin for the up state:</p>
		 *
		 * <listing version="3.0">
		 * button.upSkin = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see #defaultSkin
		 */
		public get upSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.getValueForState(Button.STATE_UP, false));
		}
		
		/**
		 * @private
		 */
		public set upSkin(value:DisplayObject)
		{
			if(this._skinSelector.getValueForState(Button.STATE_UP, false) == value)
			{
				return;
			}
			this._skinSelector.setValueForState(value, Button.STATE_UP, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * The skin used for the button's down state. If <code>null</code>, then
		 * <code>defaultSkin</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToSkinFunction</code> property.</p>
		 *
		 * <p>The following example gives the button a skin for the down state:</p>
		 *
		 * <listing version="3.0">
		 * button.downSkin = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see #defaultSkin
		 */
		public get downSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.getValueForState(Button.STATE_DOWN, false));
		}
		
		/**
		 * @private
		 */
		public set downSkin(value:DisplayObject)
		{
			if(this._skinSelector.getValueForState(Button.STATE_DOWN, false) == value)
			{
				return;
			}
			this._skinSelector.setValueForState(value, Button.STATE_DOWN, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * The skin used for the button's hover state. If <code>null</code>, then
		 * <code>defaultSkin</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToSkinFunction</code> property.</p>
		 *
		 * <p>The following example gives the button a skin for the hover state:</p>
		 *
		 * <listing version="3.0">
		 * button.hoverSkin = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #defaultSkin
		 */
		public get hoverSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.getValueForState(Button.STATE_HOVER, false));
		}

		/**
		 * @private
		 */
		public set hoverSkin(value:DisplayObject)
		{
			if(this._skinSelector.getValueForState(Button.STATE_HOVER, false) == value)
			{
				return;
			}
			this._skinSelector.setValueForState(value, Button.STATE_HOVER, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * The skin used for the button's disabled state. If <code>null</code>,
		 * then <code>defaultSkin</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToSkinFunction</code> property.</p>
		 *
		 * <p>The following example gives the button a skin for the disabled state:</p>
		 *
		 * <listing version="3.0">
		 * button.disabledSkin = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see #defaultSkin
		 */
		public get disabledSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.getValueForState(Button.STATE_DISABLED, false));
		}
		
		/**
		 * @private
		 */
		public set disabledSkin(value:DisplayObject)
		{
			if(this._skinSelector.getValueForState(Button.STATE_DISABLED, false) == value)
			{
				return;
			}
			this._skinSelector.setValueForState(value, Button.STATE_DISABLED, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _labelFactory:Function;

		/**
		 * A function used to instantiate the button's label text renderer
		 * sub-component. By default, the button will use the global text
		 * renderer factory, <code>FeathersControl.defaultTextRendererFactory()</code>,
		 * to create the label text renderer. The label text renderer must be an
		 * instance of <code>ITextRenderer</code>. To change properties on the
		 * label text renderer, see <code>defaultLabelProperties</code> and the
		 * other "<code>LabelProperties</code>" properties for each button
		 * state.
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>The following example gives the button a custom factory for the
		 * label text renderer:</p>
		 *
		 * <listing version="3.0">
		 * button.labelFactory = function():ITextRenderer
		 * {
		 *     return new TextFieldTextRenderer();
		 * }</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get labelFactory():Function
		{
			return this._labelFactory;
		}

		/**
		 * @private
		 */
		public set labelFactory(value:Function)
		{
			if(this._labelFactory == value)
			{
				return;
			}
			this._labelFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}
		
		/**
		 * @private
		 */
		protected _labelPropertiesSelector:StateWithToggleValueSelector = new StateWithToggleValueSelector();
		
		/**
		 * The default label properties are a set of key/value pairs to be
		 * passed down to the button's label text renderer, and it is used when
		 * no specific properties are defined for the button's current state.
		 * Intended for use when multiple states should share the same
		 * properties. The label text renderer is an <code>ITextRenderer</code>
		 * instance. The available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>labelFactory</code>. The most
		 * common implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>The following example gives the button default label properties to
		 * use for all states when no specific label properties are available
		 * (this example assumes that the label text renderer is a
		 * <code>BitmapFontTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * button.defaultLabelProperties.textFormat = new BitmapFontTextFormat( bitmapFont );
		 * button.defaultLabelProperties.wordWrap = true;</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #stateToLabelPropertiesFunction
		 */
		public get defaultLabelProperties():Object
		{
			var value:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.defaultValue);
			if(!value)
			{
				value = new PropertyProxy(this.childProperties_onChange);
				this._labelPropertiesSelector.defaultValue = value;
			}
			return value;
		}
		
		/**
		 * @private
		 */
		public set defaultLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			var oldValue:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.defaultValue);
			if(oldValue)
			{
				oldValue.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._labelPropertiesSelector.defaultValue = value;
			if(value)
			{
				PropertyProxy(value).addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * A set of key/value pairs to be passed down ot the button's label
		 * text renderer when the button is in the up state. If <code>null</code>,
		 * then <code>defaultLabelProperties</code> is used instead. The label
		 * text renderer is an <code>ITextRenderer</code> instance. The
		 * available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>labelFactory</code>. The most
		 * common implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>The following example gives the button label properties for the
		 * up state:</p>
		 *
		 * <listing version="3.0">
		 * button.upLabelProperties.textFormat = new BitmapFontTextFormat( bitmapFont );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #defaultLabelProperties
		 */
		public get upLabelProperties():Object
		{
			var value:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_UP, false));
			if(!value)
			{
				value = new PropertyProxy(this.childProperties_onChange);
				this._labelPropertiesSelector.setValueForState(value, Button.STATE_UP, false);
			}
			return value;
		}
		
		/**
		 * @private
		 */
		public set upLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			var oldValue:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_UP, false));
			if(oldValue)
			{
				oldValue.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._labelPropertiesSelector.setValueForState(value, Button.STATE_UP, false);
			if(value)
			{
				PropertyProxy(value).addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * A set of key/value pairs to be passed down ot the button's label
		 * text renderer when the button is in the down state. If <code>null</code>,
		 * then <code>defaultLabelProperties</code> is used instead. The label
		 * text renderer is an <code>ITextRenderer</code> instance. The
		 * available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>labelFactory</code>. The most
		 * common implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>The following example gives the button label properties for the
		 * down state:</p>
		 *
		 * <listing version="3.0">
		 * button.downLabelProperties.textFormat = new BitmapFontTextFormat( bitmapFont );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #defaultLabelProperties
		 */
		public get downLabelProperties():Object
		{
			var value:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_DOWN, false));
			if(!value)
			{
				value = new PropertyProxy(this.childProperties_onChange);
				this._labelPropertiesSelector.setValueForState(value, Button.STATE_DOWN, false);
			}
			return value;
		}
		
		/**
		 * @private
		 */
		public set downLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			var oldValue:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_DOWN, false));
			if(oldValue)
			{
				oldValue.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._labelPropertiesSelector.setValueForState(value, Button.STATE_DOWN, false);
			if(value)
			{
				PropertyProxy(value).addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * A set of key/value pairs to be passed down ot the button's label
		 * text renderer when the button is in the hover state. If <code>null</code>,
		 * then <code>defaultLabelProperties</code> is used instead. The label
		 * text renderer is an <code>ITextRenderer</code> instance. The
		 * available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>labelFactory</code>. The most
		 * common implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>The following example gives the button label properties for the
		 * hover state:</p>
		 *
		 * <listing version="3.0">
		 * button.hoverLabelProperties.textFormat = new BitmapFontTextFormat( bitmapFont );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #defaultLabelProperties
		 */
		public get hoverLabelProperties():Object
		{
			var value:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_HOVER, false));
			if(!value)
			{
				value = new PropertyProxy(this.childProperties_onChange);
				this._labelPropertiesSelector.setValueForState(value, Button.STATE_HOVER, false);
			}
			return value;
		}

		/**
		 * @private
		 */
		public set hoverLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			var oldValue:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_HOVER, false));
			if(oldValue)
			{
				oldValue.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._labelPropertiesSelector.setValueForState(value, Button.STATE_HOVER, false);
			if(value)
			{
				PropertyProxy(value).addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * A set of key/value pairs to be passed down ot the button's label
		 * text renderer when the button is in the disabled state. If <code>null</code>,
		 * then <code>defaultLabelProperties</code> is used instead. The label
		 * text renderer is an <code>ITextRenderer</code> instance. The
		 * available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>labelFactory</code>. The most
		 * common implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>The following example gives the button label properties for the
		 * disabled state:</p>
		 *
		 * <listing version="3.0">
		 * button.disabledLabelProperties.textFormat = new BitmapFontTextFormat( bitmapFont );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #defaultLabelProperties
		 */
		public get disabledLabelProperties():Object
		{
			var value:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_DISABLED, false));
			if(!value)
			{
				value = new PropertyProxy(this.childProperties_onChange);
				this._labelPropertiesSelector.setValueForState(value, Button.STATE_DISABLED, false);
			}
			return value;
		}
		
		/**
		 * @private
		 */
		public set disabledLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			var oldValue:PropertyProxy = PropertyProxy(this._labelPropertiesSelector.getValueForState(Button.STATE_DISABLED, false));
			if(oldValue)
			{
				oldValue.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._labelPropertiesSelector.setValueForState(value, Button.STATE_DISABLED, false);
			if(value)
			{
				PropertyProxy(value).addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * @private
		 */
		protected _iconSelector:StateWithToggleValueSelector = new StateWithToggleValueSelector();
		
		/**
		 * The icon used when no other icon is defined for the current state.
		 * Intended to be used when multiple states should share the same icon.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToIconFunction</code> property.</p>
		 *
		 * <p>The following example gives the button a default icon to use for
		 * all states when no specific icon is available:</p>
		 *
		 * <listing version="3.0">
		 * button.defaultIcon = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #stateToIconFunction
		 * @see #upIcon
		 * @see #downIcon
		 * @see #hoverIcon
		 * @see #disabledIcon
		 */
		public get defaultIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.defaultValue);
		}
		
		/**
		 * @private
		 */
		public set defaultIcon(value:DisplayObject)
		{
			if(this._iconSelector.defaultValue == value)
			{
				return;
			}
			this._iconSelector.defaultValue = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * The icon used for the button's up state. If <code>null</code>, then
		 * <code>defaultIcon</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToIconFunction</code> property.</p>
		 *
		 * <p>The following example gives the button an icon for the up state:</p>
		 *
		 * <listing version="3.0">
		 * button.upIcon = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see #defaultIcon
		 */
		public get upIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.getValueForState(Button.STATE_UP, false));
		}
		
		/**
		 * @private
		 */
		public set upIcon(value:DisplayObject)
		{
			if(this._iconSelector.getValueForState(Button.STATE_UP, false) == value)
			{
				return;
			}
			this._iconSelector.setValueForState(value, Button.STATE_UP, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * The icon used for the button's down state. If <code>null</code>, then
		 * <code>defaultIcon</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToIconFunction</code> property.</p>
		 *
		 * <p>The following example gives the button an icon for the down state:</p>
		 *
		 * <listing version="3.0">
		 * button.downIcon = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see #defaultIcon
		 */
		public get downIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.getValueForState(Button.STATE_DOWN, false));
		}
		
		/**
		 * @private
		 */
		public set downIcon(value:DisplayObject)
		{
			if(this._iconSelector.getValueForState(Button.STATE_DOWN, false) == value)
			{
				return;
			}
			this._iconSelector.setValueForState(value, Button.STATE_DOWN, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * The icon used for the button's hover state. If <code>null</code>, then
		 * <code>defaultIcon</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToIconFunction</code> property.</p>
		 *
		 * <p>The following example gives the button an icon for the hover state:</p>
		 *
		 * <listing version="3.0">
		 * button.hoverIcon = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #defaultIcon
		 */
		public get hoverIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.getValueForState(Button.STATE_HOVER, false));
		}

		/**
		 * @private
		 */
		public set hoverIcon(value:DisplayObject)
		{
			if(this._iconSelector.getValueForState(Button.STATE_HOVER, false) == value)
			{
				return;
			}
			this._iconSelector.setValueForState(value, Button.STATE_HOVER, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * The icon used for the button's disabled state. If <code>null</code>, then
		 * <code>defaultIcon</code> is used instead.
		 *
		 * <p>This property will be ignored if a function is passed to the
		 * <code>stateToIconFunction</code> property.</p>
		 *
		 * <p>The following example gives the button an icon for the disabled state:</p>
		 *
		 * <listing version="3.0">
		 * button.disabledIcon = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see #defaultIcon
		 */
		public get disabledIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.getValueForState(Button.STATE_DISABLED, false));
		}
		
		/**
		 * @private
		 */
		public set disabledIcon(value:DisplayObject)
		{
			if(this._iconSelector.getValueForState(Button.STATE_DISABLED, false) == value)
			{
				return;
			}
			this._iconSelector.setValueForState(value, Button.STATE_DISABLED, false);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 * Used for determining the duration of a long press.
		 */
		protected _touchBeginTime:number;

		/**
		 * @private
		 */
		protected _hasLongPressed:boolean = false;

		/**
		 * @private
		 */
		protected _longPressDuration:number = 0.5;

		/**
		 * The duration, in seconds, of a long press.
		 *
		 * <p>The following example changes the long press duration to one full second:</p>
		 *
		 * <listing version="3.0">
		 * button.longPressDuration = 1.0;</listing>
		 *
		 * @default 0.5
		 *
		 * @see #event:longPress
		 * @see #isLongPressEnabled
		 */
		public get longPressDuration():number
		{
			return this._longPressDuration;
		}

		/**
		 * @private
		 */
		public set longPressDuration(value:number)
		{
			this._longPressDuration = value;
		}

		/**
		 * @private
		 */
		protected _isLongPressEnabled:boolean = false;

		/**
		 * Determines if <code>FeathersEventType.LONG_PRESS</code> will be
		 * dispatched.
		 *
		 * <p>The following example enables long presses:</p>
		 *
		 * <listing version="3.0">
		 * button.isLongPressEnabled = true;
		 * button.addEventListener( FeathersEventType.LONG_PRESS, function( event:Event ):void
		 * {
		 *     // long press
		 * });</listing>
		 *
		 * @default false
		 *
		 * @see #event:longPress
		 * @see #longPressDuration
		 */
		public get isLongPressEnabled():boolean
		{
			return this._isLongPressEnabled;
		}

		/**
		 * @private
		 */
		public set isLongPressEnabled(value:boolean)
		{
			this._isLongPressEnabled = value;
			if(!value)
			{
				this.removeEventListener(Event.ENTER_FRAME, this.longPress_enterFrameHandler);
			}
		}

		/**
		 * @private
		 */
		protected _scaleWhenDown:number = 1;

		/**
		 * The button renders at this scale in the down state.
		 *
		 * <p>The following example scales the button in the down state:</p>
		 *
		 * <listing version="3.0">
		 * button.scaleWhenDown = 0.9;</listing>
		 *
		 * @default 1
		 */
		public get scaleWhenDown():number
		{
			return this._scaleWhenDown;
		}

		/**
		 * @private
		 */
		public set scaleWhenDown(value:number)
		{
			this._scaleWhenDown = value;
		}

		/**
		 * @private
		 */
		protected _scaleWhenHovering:number = 1;

		/**
		 * The button renders at this scale in the hover state.
		 *
		 * <p>The following example scales the button in the hover state:</p>
		 *
		 * <listing version="3.0">
		 * button.scaleWhenHovering = 0.9;</listing>
		 *
		 * @default 1
		 */
		public get scaleWhenHovering():number
		{
			return this._scaleWhenHovering;
		}

		/**
		 * @private
		 */
		public set scaleWhenHovering(value:number)
		{
			this._scaleWhenHovering = value;
		}

		/**
		 * @private
		 */
		protected _ignoreIconResizes:boolean = false;

		/**
		 * @private
		 */
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			var scale:number = 1;
			if(this._currentState == Button.STATE_DOWN)
			{
				scale = this._scaleWhenDown;
			}
			else if(this._currentState == Button.STATE_HOVER)
			{
				scale = this._scaleWhenHovering;
			}
			if(scale !== 1)
			{
				support.scaleMatrix(scale, scale);
				support.translateMatrix(Math.round((1 - scale) / 2 * this.actualWidth),
					Math.round((1 - scale) / 2 * this.actualHeight));
			}
			super.render(support, parentAlpha);
		}
		
		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var textRendererInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_TEXT_RENDERER);
			var focusInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_FOCUS);

			if(textRendererInvalid)
			{
				this.createLabel();
			}
			
			if(textRendererInvalid || stateInvalid || dataInvalid)
			{
				this.refreshLabel();
			}

			if(stylesInvalid || stateInvalid)
			{
				this.refreshSkin();
				this.refreshIcon();
			}

			if(textRendererInvalid || stylesInvalid || stateInvalid)
			{
				this.refreshLabelStyles();
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;
			
			if(stylesInvalid || stateInvalid || sizeInvalid)
			{
				this.scaleSkin();
			}
			
			if(textRendererInvalid || stylesInvalid || stateInvalid || dataInvalid || sizeInvalid)
			{
				this.layoutContent();
			}

			if(sizeInvalid || focusInvalid)
			{
				this.refreshFocusIndicator();
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
			this.refreshMaxLabelWidth(true);
			if(this.labelTextRenderer)
			{
				this.labelTextRenderer.measureText(Button.HELPER_POINT);
			}
			else
			{
				Button.HELPER_POINT.setTo(0, 0);
			}
			var newWidth:number = this.explicitWidth;
			if(needsWidth)
			{
				if(this.currentIcon && this.label)
				{
					if(this._iconPosition != Button.ICON_POSITION_TOP && this._iconPosition != Button.ICON_POSITION_BOTTOM &&
						this._iconPosition != Button.ICON_POSITION_MANUAL)
					{
						var adjustedGap:number = this._gap;
						if(adjustedGap == Number.POSITIVE_INFINITY)
						{
							adjustedGap = this._minGap;
						}
						newWidth = this.currentIcon.width + adjustedGap + Button.HELPER_POINT.x;
					}
					else
					{
						newWidth = Math.max(this.currentIcon.width, Button.HELPER_POINT.x);
					}
				}
				else if(this.currentIcon)
				{
					newWidth = this.currentIcon.width;
				}
				else if(this.label)
				{
					newWidth = Button.HELPER_POINT.x;
				}
				newWidth += this._paddingLeft + this._paddingRight;
				if(newWidth !== newWidth) //isNaN
				{
					newWidth = this._originalSkinWidth;
					if(newWidth != newWidth)
					{
						newWidth = 0;
					}
				}
				else if(this._originalSkinWidth === this._originalSkinWidth) //!isNaN
				{
					if(this._originalSkinWidth > newWidth)
					{
						newWidth = this._originalSkinWidth;
					}
				}
			}

			var newHeight:number = this.explicitHeight;
			if(needsHeight)
			{
				if(this.currentIcon && this.label)
				{
					if(this._iconPosition == Button.ICON_POSITION_TOP || this._iconPosition == Button.ICON_POSITION_BOTTOM)
					{
						adjustedGap = this._gap;
						if(adjustedGap == Number.POSITIVE_INFINITY)
						{
							adjustedGap = this._minGap;
						}
						newHeight = this.currentIcon.height + adjustedGap + Button.HELPER_POINT.y;
					}
					else
					{
						newHeight = Math.max(this.currentIcon.height, Button.HELPER_POINT.y);
					}
				}
				else if(this.currentIcon)
				{
					newHeight = this.currentIcon.height;
				}
				else if(this.label)
				{
					newHeight = Button.HELPER_POINT.y;
				}
				newHeight += this._paddingTop + this._paddingBottom;
				if(newHeight != newHeight)
				{
					newHeight = this._originalSkinHeight;
					if(newHeight != newHeight)
					{
						newHeight = 0;
					}
				}
				else if(this._originalSkinHeight === this._originalSkinHeight) //!isNaN
				{
					if(this._originalSkinHeight > newHeight)
					{
						newHeight = this._originalSkinHeight;
					}
				}
			}

			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates the label text renderer sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #labelTextRenderer
		 * @see #labelFactory
		 */
		protected createLabel():void
		{
			if(this.labelTextRenderer)
			{
				this.removeChild(DisplayObject(this.labelTextRenderer), true);
				this.labelTextRenderer = null;
			}

			if(this._hasLabelTextRenderer)
			{
				var factory:Function = this._labelFactory != null ? this._labelFactory : FeathersControl.defaultTextRendererFactory;
				this.labelTextRenderer = ITextRenderer(factory());
				this.labelTextRenderer.styleNameList.add(this.labelName);
				this.addChild(DisplayObject(this.labelTextRenderer));
			}
		}

		/**
		 * @private
		 */
		protected refreshLabel():void
		{
			if(!this.labelTextRenderer)
			{
				return;
			}
			this.labelTextRenderer.text = this._label;
			this.labelTextRenderer.visible = this._label !== null && this._label.length > 0;
			this.labelTextRenderer.isEnabled = this._isEnabled;
		}

		/**
		 * Sets the <code>currentSkin</code> property.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected refreshSkin():void
		{
			var oldSkin:DisplayObject = this.currentSkin;
			if(this._stateToSkinFunction != null)
			{
				this.currentSkin = DisplayObject(this._stateToSkinFunction(this, this._currentState, oldSkin));
			}
			else
			{
				this.currentSkin = DisplayObject(this._skinSelector.updateValue(this, this._currentState, this.currentSkin));
			}
			if(this.currentSkin != oldSkin)
			{
				if(oldSkin)
				{
					this.removeChild(oldSkin, false);
				}
				if(this.currentSkin)
				{
					this.addChildAt(this.currentSkin, 0);
				}
			}
			if(this.currentSkin &&
				(this._originalSkinWidth !== this._originalSkinWidth || //isNaN
				this._originalSkinHeight !== this._originalSkinHeight))
			{
				if(this.currentSkin instanceof IValidating)
				{
					IValidating(this.currentSkin).validate();
				}
				this._originalSkinWidth = this.currentSkin.width;
				this._originalSkinHeight = this.currentSkin.height;
			}
		}
		
		/**
		 * Sets the <code>currentIcon</code> property.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected refreshIcon():void
		{
			var oldIcon:DisplayObject = this.currentIcon;
			if(this._stateToIconFunction != null)
			{
				this.currentIcon = DisplayObject(this._stateToIconFunction(this, this._currentState, oldIcon));
			}
			else
			{
				this.currentIcon = DisplayObject(this._iconSelector.updateValue(this, this._currentState, this.currentIcon));
			}
			if(this.currentIcon instanceof IFeathersControl)
			{
				IFeathersControl(this.currentIcon).isEnabled = this._isEnabled;
			}
			if(this.currentIcon != oldIcon)
			{
				if(oldIcon)
				{
					if(oldIcon instanceof IFeathersControl)
					{
						IFeathersControl(oldIcon).removeEventListener(FeathersEventType.RESIZE, this.currentIcon_resizeHandler);
					}
					this.removeChild(oldIcon, false);
				}
				if(this.currentIcon)
				{
					//we want the icon to appear below the label text renderer
					var index:number = this.numChildren;
					if(this.labelTextRenderer)
					{
						index = this.getChildIndex(DisplayObject(this.labelTextRenderer));
					}
					this.addChildAt(this.currentIcon, index);
					if(this.currentIcon instanceof IFeathersControl)
					{
						IFeathersControl(this.currentIcon).addEventListener(FeathersEventType.RESIZE, this.currentIcon_resizeHandler);
					}
				}
			}
		}
		
		/**
		 * @private
		 */
		protected refreshLabelStyles():void
		{
			if(!this.labelTextRenderer)
			{
				return;
			}
			if(this._stateToLabelPropertiesFunction != null)
			{
				var properties:Object = this._stateToLabelPropertiesFunction(this, this._currentState);
			}
			else
			{
				properties = this._labelPropertiesSelector.updateValue(this, this._currentState);
			}
			for(var propertyName:string in properties)
			{
				var propertyValue:Object = properties[propertyName];
				this.labelTextRenderer[propertyName] = propertyValue;
			}
		}
		
		/**
		 * @private
		 */
		protected scaleSkin():void
		{
			if(!this.currentSkin)
			{
				return;
			}
			this.currentSkin.x = 0;
			this.currentSkin.y = 0;
			if(this.currentSkin.width != this.actualWidth)
			{
				this.currentSkin.width = this.actualWidth;
			}
			if(this.currentSkin.height != this.actualHeight)
			{
				this.currentSkin.height = this.actualHeight;
			}
			if(this.currentSkin instanceof IValidating)
			{
				IValidating(this.currentSkin).validate();
			}
		}
		
		/**
		 * Positions and sizes the button's content.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected layoutContent():void
		{
			var oldIgnoreIconResizes:boolean = this._ignoreIconResizes;
			this._ignoreIconResizes = true;
			this.refreshMaxLabelWidth(false);
			if(this._label && this.labelTextRenderer && this.currentIcon)
			{
				this.labelTextRenderer.validate();
				this.positionSingleChild(DisplayObject(this.labelTextRenderer));
				if(this._iconPosition != Button.ICON_POSITION_MANUAL)
				{
					this.positionLabelAndIcon();
				}

			}
			else if(this._label && this.labelTextRenderer && !this.currentIcon)
			{
				this.labelTextRenderer.validate();
				this.positionSingleChild(DisplayObject(this.labelTextRenderer));
			}
			else if((!this._label || !this.labelTextRenderer) && this.currentIcon && this._iconPosition != Button.ICON_POSITION_MANUAL)
			{
				this.positionSingleChild(this.currentIcon);
			}

			if(this.currentIcon)
			{
				if(this._iconPosition == Button.ICON_POSITION_MANUAL)
				{
					this.currentIcon.x = this._paddingLeft;
					this.currentIcon.y = this._paddingTop;
				}
				this.currentIcon.x += this._iconOffsetX;
				this.currentIcon.y += this._iconOffsetY;
			}
			if(this._label && this.labelTextRenderer)
			{
				this.labelTextRenderer.x += this._labelOffsetX;
				this.labelTextRenderer.y += this._labelOffsetY;
			}
			this._ignoreIconResizes = oldIgnoreIconResizes;
		}

		/**
		 * @private
		 */
		protected refreshMaxLabelWidth(forMeasurement:boolean):void
		{
			if(this.currentIcon instanceof IValidating)
			{
				IValidating(this.currentIcon).validate();
			}
			var calculatedWidth:number = this.actualWidth;
			if(forMeasurement)
			{
				calculatedWidth = this.explicitWidth;
				if(calculatedWidth !== calculatedWidth) //isNaN
				{
					calculatedWidth = this._maxWidth;
				}
			}
			if(this._label && this.labelTextRenderer && this.currentIcon)
			{
				if(this._iconPosition == Button.ICON_POSITION_LEFT || this._iconPosition == Button.ICON_POSITION_LEFT_BASELINE ||
					this._iconPosition == Button.ICON_POSITION_RIGHT || this._iconPosition == Button.ICON_POSITION_RIGHT_BASELINE)
				{
					var adjustedGap:number = this._gap;
					if(adjustedGap == Number.POSITIVE_INFINITY)
					{
						adjustedGap = this._minGap;
					}
					this.labelTextRenderer.maxWidth = calculatedWidth - this._paddingLeft - this._paddingRight - this.currentIcon.width - adjustedGap;
				}
				else
				{
					this.labelTextRenderer.maxWidth = calculatedWidth - this._paddingLeft - this._paddingRight;
				}

			}
			else if(this._label && this.labelTextRenderer && !this.currentIcon)
			{
				this.labelTextRenderer.maxWidth = calculatedWidth - this._paddingLeft - this._paddingRight;
			}
		}
		
		/**
		 * @private
		 */
		protected positionSingleChild(displayObject:DisplayObject):void
		{
			if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_LEFT)
			{
				displayObject.x = this._paddingLeft;
			}
			else if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_RIGHT)
			{
				displayObject.x = this.actualWidth - this._paddingRight - displayObject.width;
			}
			else //center
			{
				displayObject.x = this._paddingLeft + Math.round((this.actualWidth - this._paddingLeft - this._paddingRight - displayObject.width) / 2);
			}
			if(this._verticalAlign == Button.VERTICAL_ALIGN_TOP)
			{
				displayObject.y = this._paddingTop;
			}
			else if(this._verticalAlign == Button.VERTICAL_ALIGN_BOTTOM)
			{
				displayObject.y = this.actualHeight - this._paddingBottom - displayObject.height;
			}
			else //middle
			{
				displayObject.y = this._paddingTop + Math.round((this.actualHeight - this._paddingTop - this._paddingBottom - displayObject.height) / 2);
			}
		}
		
		/**
		 * @private
		 */
		protected positionLabelAndIcon():void
		{
			if(this._iconPosition == Button.ICON_POSITION_TOP)
			{
				if(this._gap == Number.POSITIVE_INFINITY)
				{
					this.currentIcon.y = this._paddingTop;
					this.labelTextRenderer.y = this.actualHeight - this._paddingBottom - this.labelTextRenderer.height;
				}
				else
				{
					if(this._verticalAlign == Button.VERTICAL_ALIGN_TOP)
					{
						this.labelTextRenderer.y += this.currentIcon.height + this._gap;
					}
					else if(this._verticalAlign == Button.VERTICAL_ALIGN_MIDDLE)
					{
						this.labelTextRenderer.y += Math.round((this.currentIcon.height + this._gap) / 2);
					}
					this.currentIcon.y = this.labelTextRenderer.y - this.currentIcon.height - this._gap;
				}
			}
			else if(this._iconPosition == Button.ICON_POSITION_RIGHT || this._iconPosition == Button.ICON_POSITION_RIGHT_BASELINE)
			{
				if(this._gap == Number.POSITIVE_INFINITY)
				{
					this.labelTextRenderer.x = this._paddingLeft;
					this.currentIcon.x = this.actualWidth - this._paddingRight - this.currentIcon.width;
				}
				else
				{
					if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_RIGHT)
					{
						this.labelTextRenderer.x -= this.currentIcon.width + this._gap;
					}
					else if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_CENTER)
					{
						this.labelTextRenderer.x -= Math.round((this.currentIcon.width + this._gap) / 2);
					}
					this.currentIcon.x = this.labelTextRenderer.x + this.labelTextRenderer.width + this._gap;
				}
			}
			else if(this._iconPosition == Button.ICON_POSITION_BOTTOM)
			{
				if(this._gap == Number.POSITIVE_INFINITY)
				{
					this.labelTextRenderer.y = this._paddingTop;
					this.currentIcon.y = this.actualHeight - this._paddingBottom - this.currentIcon.height;
				}
				else
				{
					if(this._verticalAlign == Button.VERTICAL_ALIGN_BOTTOM)
					{
						this.labelTextRenderer.y -= this.currentIcon.height + this._gap;
					}
					else if(this._verticalAlign == Button.VERTICAL_ALIGN_MIDDLE)
					{
						this.labelTextRenderer.y -= Math.round((this.currentIcon.height + this._gap) / 2);
					}
					this.currentIcon.y = this.labelTextRenderer.y + this.labelTextRenderer.height + this._gap;
				}
			}
			else if(this._iconPosition == Button.ICON_POSITION_LEFT || this._iconPosition == Button.ICON_POSITION_LEFT_BASELINE)
			{
				if(this._gap == Number.POSITIVE_INFINITY)
				{
					this.currentIcon.x = this._paddingLeft;
					this.labelTextRenderer.x = this.actualWidth - this._paddingRight - this.labelTextRenderer.width;
				}
				else
				{
					if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_LEFT)
					{
						this.labelTextRenderer.x += this._gap + this.currentIcon.width;
					}
					else if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_CENTER)
					{
						this.labelTextRenderer.x += Math.round((this._gap + this.currentIcon.width) / 2);
					}
					this.currentIcon.x = this.labelTextRenderer.x - this._gap - this.currentIcon.width;
				}
			}
			
			if(this._iconPosition == Button.ICON_POSITION_LEFT || this._iconPosition == Button.ICON_POSITION_RIGHT)
			{
				if(this._verticalAlign == Button.VERTICAL_ALIGN_TOP)
				{
					this.currentIcon.y = this._paddingTop;
				}
				else if(this._verticalAlign == Button.VERTICAL_ALIGN_BOTTOM)
				{
					this.currentIcon.y = this.actualHeight - this._paddingBottom - this.currentIcon.height;
				}
				else
				{
					this.currentIcon.y = this._paddingTop + Math.round((this.actualHeight - this._paddingTop - this._paddingBottom - this.currentIcon.height) / 2);
				}
			}
			else if(this._iconPosition == Button.ICON_POSITION_LEFT_BASELINE || this._iconPosition == Button.ICON_POSITION_RIGHT_BASELINE)
			{
				this.currentIcon.y = this.labelTextRenderer.y + (this.labelTextRenderer.baseline) - this.currentIcon.height;
			}
			else //top or bottom
			{
				if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_LEFT)
				{
					this.currentIcon.x = this._paddingLeft;
				}
				else if(this._horizontalAlign == Button.HORIZONTAL_ALIGN_RIGHT)
				{
					this.currentIcon.x = this.actualWidth - this._paddingRight - this.currentIcon.width;
				}
				else
				{
					this.currentIcon.x = this._paddingLeft + Math.round((this.actualWidth - this._paddingLeft - this._paddingRight - this.currentIcon.width) / 2);
				}
			}
		}

		/**
		 * @private
		 */
		protected resetTouchState(touch:Touch = null):void
		{
			this.touchPointID = -1;
			this.removeEventListener(Event.ENTER_FRAME, this.longPress_enterFrameHandler);
			if(this._isEnabled)
			{
				this.currentState = Button.STATE_UP;
			}
			else
			{
				this.currentState = Button.STATE_DISABLED;
			}
		}

		/**
		 * Triggers the button.
		 */
		protected trigger():void
		{
			this.dispatchEventWith(Event.TRIGGERED);
		}

		/**
		 * @private
		 */
		protected childProperties_onChange(proxy:PropertyProxy, name:Object):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		/*override*/ protected focusInHandler(event:Event):void
		{
			super.focusInHandler(event);
			this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
			this.stage.addEventListener(KeyboardEvent.KEY_UP, this.stage_keyUpHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected focusOutHandler(event:Event):void
		{
			super.focusOutHandler(event);
			this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
			this.stage.removeEventListener(KeyboardEvent.KEY_UP, this.stage_keyUpHandler);

			if(this.touchPointID >= 0)
			{
				this.touchPointID = -1;
				if(this._isEnabled)
				{
					this.currentState = Button.STATE_UP;
				}
				else
				{
					this.currentState = Button.STATE_DISABLED;
				}
			}
		}

		/**
		 * @private
		 */
		protected button_removedFromStageHandler(event:Event):void
		{
			this.resetTouchState();
		}
		
		/**
		 * @private
		 */
		protected button_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this.touchPointID = -1;
				return;
			}

			if(this.touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this, null, this.touchPointID);
				if(!touch)
				{
					//this should never happen
					return;
				}

				touch.getLocation(this.stage, Button.HELPER_POINT);
				var isInBounds:boolean = this.contains(this.stage.hitTest(Button.HELPER_POINT, true));
				if(touch.phase == TouchPhase.MOVED)
				{
					if(isInBounds || this.keepDownStateOnRollOut)
					{
						this.currentState = Button.STATE_DOWN;
					}
					else
					{
						this.currentState = Button.STATE_UP;
					}
				}
				else if(touch.phase == TouchPhase.ENDED)
				{
					this.resetTouchState(touch);
					//we we dispatched a long press, then triggered and change
					//won't be able to happen until the next touch begins
					if(!this._hasLongPressed && isInBounds)
					{
						this.trigger();
					}
				}
				return;
			}
			else //if we get here, we don't have a saved touch ID yet
			{
				touch = event.getTouch(this, TouchPhase.BEGAN);
				if(touch)
				{
					this.currentState = Button.STATE_DOWN;
					this.touchPointID = touch.id;
					if(this._isLongPressEnabled)
					{
						this._touchBeginTime = getTimer();
						this._hasLongPressed = false;
						this.addEventListener(Event.ENTER_FRAME, this.longPress_enterFrameHandler);
					}
					return;
				}
				touch = event.getTouch(this, TouchPhase.HOVER);
				if(touch)
				{
					this.currentState = Button.STATE_HOVER;
					return;
				}

				//end of hover
				this.currentState = Button.STATE_UP;
			}
		}

		/**
		 * @private
		 */
		protected longPress_enterFrameHandler(event:Event):void
		{
			var accumulatedTime:number = (getTimer() - this._touchBeginTime) / 1000;
			if(accumulatedTime >= this._longPressDuration)
			{
				this.removeEventListener(Event.ENTER_FRAME, this.longPress_enterFrameHandler);
				this._hasLongPressed = true;
				this.dispatchEventWith(FeathersEventType.LONG_PRESS);
			}
		}

		/**
		 * @private
		 */
		protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.keyCode == Keyboard.ESCAPE)
			{
				this.touchPointID = -1;
				this.currentState = Button.STATE_UP;
			}
			if(this.touchPointID >= 0 || event.keyCode != Keyboard.SPACE)
			{
				return;
			}
			this.touchPointID = int.MAX_VALUE;
			this.currentState = Button.STATE_DOWN;
		}

		/**
		 * @private
		 */
		protected stage_keyUpHandler(event:KeyboardEvent):void
		{
			if(this.touchPointID != int.MAX_VALUE || event.keyCode != Keyboard.SPACE)
			{
				return;
			}
			this.resetTouchState();
			this.trigger();
		}

		/**
		 * @private
		 */
		protected currentIcon_resizeHandler():void
		{
			if(this._ignoreIconResizes)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}
	}
}