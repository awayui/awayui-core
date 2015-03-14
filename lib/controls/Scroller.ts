/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IViewPort = feathers.controls.supportClasses.IViewPort;
	import FeathersControl = feathers.core.FeathersControl;
	import IFocusDisplayObject = feathers.core.IFocusDisplayObject;
	import PropertyProxy = feathers.core.PropertyProxy;
	import ExclusiveTouch = feathers.events.ExclusiveTouch;
	import FeathersEventType = feathers.events.FeathersEventType;
	import DeviceCapabilities = feathers.system.DeviceCapabilities;
	import roundDownToNearest = feathers.utils.math.roundDownToNearest;
	import roundToNearest = feathers.utils.math.roundToNearest;
	import roundUpToNearest = feathers.utils.math.roundUpToNearest;

	import MouseEvent = flash.events.MouseEvent;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import Keyboard = flash.ui.Keyboard;
	import getTimer = flash.utils.getTimer;

	import Transitions = starling.animation.Transitions;
	import Tween = starling.animation.Tween;
	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Quad = starling.display.Quad;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the scroller scrolls in either direction or when the view
	 * port's scrolling bounds have changed. Listen for <code>FeathersEventType.SCROLL_START</code>
	 * to know when scrolling starts as a result of user interaction or when
	 * scrolling is triggered by an animation. Similarly, listen for
	 * <code>FeathersEventType.SCROLL_COMPLETE</code> to know when the scrolling
	 * ends.
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
	 * @eventType starling.events.Event.SCROLL
	 * @see #event:scrollStart feathers.events.FeathersEventType.SCROLL_START
	 * @see #event:scrollComplete feathers.events.FeathersEventType.SCROLL_COMPLETE
	 */
	/*[Event(name="scroll",type="starling.events.Event")]*/

	/**
	 * Dispatched when the scroller starts scrolling in either direction
	 * as a result of either user interaction or animation.
	 *
	 * <p>Note: If <code>horizontalScrollPosition</code> or <code>verticalScrollPosition</code>
	 * is set manually (in other words, the scrolling is not triggered by user
	 * interaction or an animated scroll), no <code>FeathersEventType.SCROLL_START</code>
	 * or <code>FeathersEventType.SCROLL_COMPLETE</code> events will be
	 * dispatched.</p>
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
	 * @eventType feathers.events.FeathersEventType.SCROLL_START
	 * @see #event:scrollComplete feathers.events.FeathersEventType.SCROLL_COMPLETE
	 * @see #event:scroll feathers.events.FeathersEventType.SCROLL
	 */
	/*[Event(name="scrollStart",type="starling.events.Event")]*/

	/**
	 * Dispatched when the scroller finishes scrolling in either direction
	 * as a result of either user interaction or animation. Animations may not
	 * end at the same time that user interaction ends, so the event may be
	 * delayed if user interaction triggers scrolling again.
	 *
	 * <p>Note: If <code>horizontalScrollPosition</code> or <code>verticalScrollPosition</code>
	 * is set manually (in other words, the scrolling is not triggered by user
	 * interaction or an animated scroll), no <code>FeathersEventType.SCROLL_START</code>
	 * or <code>FeathersEventType.SCROLL_COMPLETE</code> events will be
	 * dispatched.</p>
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
	 * @eventType feathers.events.FeathersEventType.SCROLL_COMPLETE
	 * @see #event:scrollStart feathers.events.FeathersEventType.SCROLL_START
	 * @see #event:scroll feathers.events.FeathersEventType.SCROLL
	 */
	/*[Event(name="scrollComplete",type="starling.events.Event")]*/

	/**
	 * Dispatched when the user starts dragging the scroller when
	 * <code>INTERACTION_MODE_TOUCH</code> is enabled or when the user starts
	 * interacting with the scroll bar.
	 *
	 * <p>Note: If <code>horizontalScrollPosition</code> or <code>verticalScrollPosition</code>
	 * is set manually (in other words, the scrolling is not triggered by user
	 * interaction), no <code>FeathersEventType.BEGIN_INTERACTION</code>
	 * or <code>FeathersEventType.END_INTERACTION</code> events will be
	 * dispatched.</p>
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
	 * @eventType feathers.events.FeathersEventType.BEGIN_INTERACTION
	 * @see #event:endInteraction feathers.events.FeathersEventType.END_INTERACTION
	 * @see #event:scroll feathers.events.FeathersEventType.SCROLL
	 */
	/*[Event(name="beginInteraction",type="starling.events.Event")]*/

	/**
	 * Dispatched when the user stops dragging the scroller when
	 * <code>INTERACTION_MODE_TOUCH</code> is enabled or when the user stops
	 * interacting with the scroll bar. The scroller may continue scrolling
	 * after this event is dispatched if the user interaction has also triggered
	 * an animation.
	 *
	 * <p>Note: If <code>horizontalScrollPosition</code> or <code>verticalScrollPosition</code>
	 * is set manually (in other words, the scrolling is not triggered by user
	 * interaction), no <code>FeathersEventType.BEGIN_INTERACTION</code>
	 * or <code>FeathersEventType.END_INTERACTION</code> events will be
	 * dispatched.</p>
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
	 * @eventType feathers.events.FeathersEventType.END_INTERACTION
	 * @see #event:beginInteraction feathers.events.FeathersEventType.BEGIN_INTERACTION
	 * @see #event:scroll feathers.events.FeathersEventType.SCROLL
	 */
	/*[Event(name="endInteraction",type="starling.events.Event")]*/

	/**
	 * Dispatched when the component receives focus.
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
	 * @eventType feathers.events.FeathersEventType.FOCUS_IN
	 */
	/*[Event(name="focusIn",type="starling.events.Event")]*/

	/**
	 * Dispatched when the component loses focus.
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
	 * @eventType feathers.events.FeathersEventType.FOCUS_OUT
	 */
	/*[Event(name="focusOut",type="starling.events.Event")]*/

	/**
	 * Allows horizontal and vertical scrolling of a <em>view port</em>. Not
	 * meant to be used as a standalone container or component. Generally meant
	 * to be the super class of another component that needs to support
	 * scrolling. To put components in a generic scrollable container (with
	 * optional layout), see <code>ScrollContainer</code>. To scroll long
	 * passages of text, see <code>ScrollText</code>.
	 *
	 * <p>This component is generally not instantiated directly. Instead it is
	 * typically used as a super class for other scrolling components like lists
	 * and containers. With that in mind, no code example is included here.</p>
	 *
	 * @see feathers.controls.ScrollContainer
	 */
	export class Scroller extends FeathersControl implements IFocusDisplayObject
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_SCROLL_BAR_RENDERER:string = "scrollBarRenderer";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_PENDING_SCROLL:string = "pendingScroll";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_PENDING_REVEAL_SCROLL_BARS:string = "pendingRevealScrollBars";

		/**
		 * The scroller may scroll if the view port is larger than the
		 * scroller's bounds. If the interaction mode is touch, the elastic
		 * edges will only be active if the maximum scroll position is greater
		 * than zero. If the scroll bar display mode is fixed, the scroll bar
		 * will only be visible when the maximum scroll position is greater than
		 * zero.
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_AUTO:string = "auto";

		/**
		 * The scroller will always scroll. If the interaction mode is touch,
		 * elastic edges will always be active, even when the maximum scroll
		 * position is zero. If the scroll bar display mode is fixed, the scroll
		 * bar will always be visible.
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_ON:string = "on";

		/**
		 * The scroller does not scroll at all. If the scroll bar display mode
		 * is fixed or float, the scroll bar will never be visible.
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_OFF:string = "off";

		/**
		 * The scroll bars appear above the scroller's view port, and fade out
		 * when not in use.
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FLOAT:string = "float";

		/**
		 * The scroll bars are always visible and appear next to the scroller's
		 * view port, making the view port smaller than the scroller.
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FIXED:string = "fixed";

		/**
		 * The scroll bars are never visible.
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_NONE:string = "none";

		/**
		 * The vertical scroll bar will be positioned on the right.
		 *
		 * @see feathers.controls.Scroller#verticalScrollBarPosition
		 */
		public static VERTICAL_SCROLL_BAR_POSITION_RIGHT:string = "right";

		/**
		 * The vertical scroll bar will be positioned on the left.
		 *
		 * @see feathers.controls.Scroller#verticalScrollBarPosition
		 */
		public static VERTICAL_SCROLL_BAR_POSITION_LEFT:string = "left";

		/**
		 * The user may touch anywhere on the scroller and drag to scroll. The
		 * scroll bars will be visual indicator of position, but they will not
		 * be interactive.
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH:string = "touch";

		/**
		 * The user may only interact with the scroll bars to scroll. The user
		 * cannot touch anywhere in the scroller's content and drag like a touch
		 * interface.
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_MOUSE:string = "mouse";

		/**
		 * The user may touch anywhere on the scroller and drag to scroll, and
		 * the scroll bars may be dragged separately. For most touch interfaces,
		 * this is not a common behavior. The scroll bar on touch interfaces is
		 * often simply a visual indicator and non-interactive.
		 *
		 * <p>One case where this mode might be used is a "scroll bar" that
		 * displays a tappable alphabetical index to navigate a
		 * <code>GroupedList</code> with alphabetical categories.</p>
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH_AND_SCROLL_BARS:string = "touchAndScrollBars";

		/**
		 * The scroller will scroll vertically when the mouse wheel is scrolled.
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The scroller will scroll horizontally when the mouse wheel is scrolled.
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * Flag to indicate that the clipping has changed.
		 */
		protected static INVALIDATION_FLAG_CLIPPING:string = "clipping";

		/**
		 * @private
		 * The point where we stop calculating velocity changes because floating
		 * point issues can start to appear.
		 */
		private static MINIMUM_VELOCITY:number = 0.02;

		/**
		 * @private
		 * The current velocity is given high importance.
		 */
		private static CURRENT_VELOCITY_WEIGHT:number = 2.33;

		/**
		 * @private
		 * Older saved velocities are given less importance.
		 */
		private static VELOCITY_WEIGHTS:number[] = new Array<number>(1, 1.33, 1.66, 2);

		/**
		 * @private
		 */
		private static MAXIMUM_SAVED_VELOCITY_COUNT:number = 4;

		/**
		 * The default deceleration rate per millisecond.
		 *
		 * @see #decelerationRate
		 */
		public static DECELERATION_RATE_NORMAL:number = 0.998;

		/**
		 * Decelerates a bit faster per millisecond than the default.
		 *
		 * @see #decelerationRate
		 */
		public static DECELERATION_RATE_FAST:number = 0.99;

		/**
		 * The default value added to the <code>styleNameList</code> of the
		 * horizontal scroll bar.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_HORIZONTAL_SCROLL_BAR:string = "feathers-scroller-horizontal-scroll-bar";

		/**
		 * DEPRECATED: Replaced by <code>Scroller.DEFAULT_CHILD_STYLE_NAME_HORIZONTAL_SCROLL_BAR</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Scroller#DEFAULT_CHILD_STYLE_NAME_HORIZONTAL_SCROLL_BAR
		 */
		public static DEFAULT_CHILD_NAME_HORIZONTAL_SCROLL_BAR:string = Scroller.DEFAULT_CHILD_STYLE_NAME_HORIZONTAL_SCROLL_BAR;

		/**
		 * The default value added to the <code>styleNameList</code> of the vertical
		 * scroll bar.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_VERTICAL_SCROLL_BAR:string = "feathers-scroller-vertical-scroll-bar";

		/**
		 * DEPRECATED: Replaced by <code>Scroller.DEFAULT_CHILD_STYLE_NAME_VERTICAL_SCROLL_BAR</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Scroller#DEFAULT_CHILD_STYLE_NAME_VERTICAL_SCROLL_BAR
		 */
		public static DEFAULT_CHILD_NAME_VERTICAL_SCROLL_BAR:string = Scroller.DEFAULT_CHILD_STYLE_NAME_VERTICAL_SCROLL_BAR;

		/**
		 * @private
		 */
		protected static defaultScrollBarFactory():IScrollBar
		{
			return new SimpleScrollBar();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();

			this.addEventListener(Event.ADDED_TO_STAGE, this.scroller_addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.scroller_removedFromStageHandler);
		}

		/**
		 * The value added to the <code>styleNameList</code> of the horizontal
		 * scroll bar. This variable is <code>protected</code> so that
		 * sub-classes can customize the horizontal scroll bar style name in
		 * their constructors instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_HORIZONTAL_SCROLL_BAR</code>.
		 *
		 * <p>To customize the horizontal scroll bar style name without
		 * subclassing, see <code>customHorizontalScrollBarStyleName</code>.</p>
		 *
		 * @see #customHorizontalScrollBarStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected horizontalScrollBarStyleName:string = Scroller.DEFAULT_CHILD_STYLE_NAME_HORIZONTAL_SCROLL_BAR;

		/**
		 * DEPRECATED: Replaced by <code>horizontalScrollBarStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #horizontalScrollBarStyleName
		 */
		protected get horizontalScrollBarName():string
		{
			return this.horizontalScrollBarStyleName;
		}

		/**
		 * @private
		 */
		protected set horizontalScrollBarName(value:string)
		{
			this.horizontalScrollBarStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the vertical
		 * scroll bar. This variable is <code>protected</code> so that
		 * sub-classes can customize the vertical scroll bar style name in their
		 * constructors instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_VERTICAL_SCROLL_BAR</code>.
		 *
		 * <p>To customize the vertical scroll bar style name without
		 * subclassing, see <code>customVerticalScrollBarStyleName</code>.</p>
		 *
		 * @see #customVerticalScrollBarStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected verticalScrollBarStyleName:string = Scroller.DEFAULT_CHILD_STYLE_NAME_VERTICAL_SCROLL_BAR;

		/**
		 * DEPRECATED: Replaced by <code>verticalScrollBarStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #verticalScrollBarStyleName
		 */
		protected get verticalScrollBarName():string
		{
			return this.verticalScrollBarStyleName;
		}

		/**
		 * @private
		 */
		protected set verticalScrollBarName(value:string)
		{
			this.verticalScrollBarStyleName = value;
		}

		/**
		 * The horizontal scrollbar instance. May be null.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #horizontalScrollBarFactory
		 * @see #createScrollBars()
		 */
		protected horizontalScrollBar:IScrollBar;

		/**
		 * The vertical scrollbar instance. May be null.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #verticalScrollBarFactory
		 * @see #createScrollBars()
		 */
		protected verticalScrollBar:IScrollBar;

		/**
		 * @private
		 */
		/*override*/ public get isFocusEnabled():boolean
		{
			return (this._maxVerticalScrollPosition != this._minVerticalScrollPosition ||
				this._maxHorizontalScrollPosition != this._minHorizontalScrollPosition) &&
				super.isFocusEnabled;
		}

		/**
		 * @private
		 */
		protected _topViewPortOffset:number;

		/**
		 * @private
		 */
		protected _rightViewPortOffset:number;

		/**
		 * @private
		 */
		protected _bottomViewPortOffset:number;

		/**
		 * @private
		 */
		protected _leftViewPortOffset:number;

		/**
		 * @private
		 */
		protected _hasHorizontalScrollBar:boolean = false;

		/**
		 * @private
		 */
		protected _hasVerticalScrollBar:boolean = false;

		/**
		 * @private
		 */
		protected _horizontalScrollBarTouchPointID:number = -1;

		/**
		 * @private
		 */
		protected _verticalScrollBarTouchPointID:number = -1;

		/**
		 * @private
		 */
		protected _touchPointID:number = -1;

		/**
		 * @private
		 */
		protected _startTouchX:number;

		/**
		 * @private
		 */
		protected _startTouchY:number;

		/**
		 * @private
		 */
		protected _startHorizontalScrollPosition:number;

		/**
		 * @private
		 */
		protected _startVerticalScrollPosition:number;

		/**
		 * @private
		 */
		protected _currentTouchX:number;

		/**
		 * @private
		 */
		protected _currentTouchY:number;

		/**
		 * @private
		 */
		protected _previousTouchTime:number;

		/**
		 * @private
		 */
		protected _previousTouchX:number;

		/**
		 * @private
		 */
		protected _previousTouchY:number;

		/**
		 * @private
		 */
		protected _velocityX:number = 0;

		/**
		 * @private
		 */
		protected _velocityY:number = 0;

		/**
		 * @private
		 */
		protected _previousVelocityX:number[] = new Array<number>();

		/**
		 * @private
		 */
		protected _previousVelocityY:number[] = new Array<number>();

		/**
		 * @private
		 */
		protected _lastViewPortWidth:number = 0;

		/**
		 * @private
		 */
		protected _lastViewPortHeight:number = 0;

		/**
		 * @private
		 */
		protected _hasViewPortBoundsChanged:boolean = false;

		/**
		 * @private
		 */
		protected _horizontalAutoScrollTween:Tween;

		/**
		 * @private
		 */
		protected _verticalAutoScrollTween:Tween;

		/**
		 * @private
		 */
		protected _isDraggingHorizontally:boolean = false;

		/**
		 * @private
		 */
		protected _isDraggingVertically:boolean = false;

		/**
		 * @private
		 */
		protected ignoreViewPortResizing:boolean = false;

		/**
		 * @private
		 */
		protected _touchBlocker:Quad;

		/**
		 * @private
		 */
		protected _viewPort:IViewPort;

		/**
		 * The display object displayed and scrolled within the Scroller.
		 *
		 * @default null
		 */
		public get viewPort():IViewPort
		{
			return this._viewPort;
		}

		/**
		 * @private
		 */
		public set viewPort(value:IViewPort)
		{
			if(this._viewPort == value)
			{
				return;
			}
			if(this._viewPort)
			{
				this._viewPort.removeEventListener(FeathersEventType.RESIZE, this.viewPort_resizeHandler);
				this.removeRawChildInternal(DisplayObject(this._viewPort));
			}
			this._viewPort = value;
			if(this._viewPort)
			{
				this._viewPort.addEventListener(FeathersEventType.RESIZE, this.viewPort_resizeHandler);
				this.addRawChildAtInternal(DisplayObject(this._viewPort), 0);
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _measureViewPort:boolean = true;

		/**
		 * Determines if the dimensions of the view port are used when measuring
		 * the scroller. If disabled, only children other than the view port
		 * (such as the background skin) are used for measurement.
		 *
		 * <p>In the following example, the view port measurement is disabled:</p>
		 *
		 * <listing version="3.0">
		 * scroller.measureViewPort = false;</listing>
		 *
		 * @default true
		 */
		public get measureViewPort():boolean
		{
			return this._measureViewPort;
		}

		/**
		 * @private
		 */
		public set measureViewPort(value:boolean)
		{
			if(this._measureViewPort == value)
			{
				return;
			}
			this._measureViewPort = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _snapToPages:boolean = false;

		/**
		 * Determines if scrolling will snap to the nearest page.
		 *
		 * <p>In the following example, the scroller snaps to the nearest page:</p>
		 *
		 * <listing version="3.0">
		 * scroller.snapToPages = true;</listing>
		 *
		 * @default false
		 */
		public get snapToPages():boolean
		{
			return this._snapToPages;
		}

		/**
		 * @private
		 */
		public set snapToPages(value:boolean)
		{
			if(this._snapToPages == value)
			{
				return;
			}
			this._snapToPages = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		/**
		 * @private
		 */
		protected _snapOnComplete:boolean = false;

		/**
		 * @private
		 */
		protected _horizontalScrollBarFactory:Function = Scroller.defaultScrollBarFactory;

		/**
		 * Creates the horizontal scroll bar. The horizontal scroll bar must be
		 * an instance of <code>IScrollBar</code>. This factory can be used to
		 * change properties on the horizontal scroll bar when it is first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to set skins and other
		 * styles on the horizontal scroll bar.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():IScrollBar</pre>
		 *
		 * <p>In the following example, a custom horizontal scroll bar factory
		 * is passed to the scroller:</p>
		 *
		 * <listing version="3.0">
		 * scroller.horizontalScrollBarFactory = function():IScrollBar
		 * {
		 *     return new ScrollBar();
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.IScrollBar
		 * @see #horizontalScrollBarProperties
		 */
		public get horizontalScrollBarFactory():Function
		{
			return this._horizontalScrollBarFactory;
		}

		/**
		 * @private
		 */
		public set horizontalScrollBarFactory(value:Function)
		{
			if(this._horizontalScrollBarFactory == value)
			{
				return;
			}
			this._horizontalScrollBarFactory = value;
			this.invalidate(Scroller.INVALIDATION_FLAG_SCROLL_BAR_RENDERER);
		}

		/**
		 * @private
		 */
		protected _customHorizontalScrollBarStyleName:string;

		/**
		 * A style name to add to the container's horizontal scroll bar
		 * sub-component. Typically used by a theme to provide different styles
		 * to different containers.
		 *
		 * <p>In the following example, a custom horizontal scroll bar style
		 * name is passed to the scroller:</p>
		 *
		 * <listing version="3.0">
		 * scroller.customHorizontalScrollBarStyleName = "my-custom-horizontal-scroll-bar";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( SimpleScrollBar ).setFunctionForStyleName( "my-custom-horizontal-scroll-bar", setCustomHorizontalScrollBarStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_HORIZONTAL_SCROLL_BAR
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #horizontalScrollBarFactory
		 * @see #horizontalScrollBarProperties
		 */
		public get customHorizontalScrollBarStyleName():string
		{
			return this._customHorizontalScrollBarStyleName;
		}

		/**
		 * @private
		 */
		public set customHorizontalScrollBarStyleName(value:string)
		{
			if(this._customHorizontalScrollBarStyleName == value)
			{
				return;
			}
			this._customHorizontalScrollBarStyleName = value;
			this.invalidate(Scroller.INVALIDATION_FLAG_SCROLL_BAR_RENDERER);
		}

		/**
		 * DEPRECATED: Replaced by <code>customHorizontalScrollBarName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customHorizontalScrollBarName
		 */
		public get customHorizontalScrollBarName():string
		{
			return this.customHorizontalScrollBarStyleName;
		}

		/**
		 * @private
		 */
		public set customHorizontalScrollBarName(value:string)
		{
			this.customHorizontalScrollBarStyleName = value;
		}

		/**
		 * @private
		 */
		protected _horizontalScrollBarProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the scroller's
		 * horizontal scroll bar instance (if it exists). The scroll bar is an
		 * <code>IScrollBar</code> instance. The available properties depend on
		 * which implementation of <code>IScrollBar</code> is returned by
		 * <code>horizontalScrollBarFactory</code>. The most common
		 * implementations are <code>SimpleScrollBar</code> and <code>ScrollBar</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>horizontalScrollBarFactory</code>
		 * function instead of using <code>horizontalScrollBarProperties</code>
		 * will result in better performance.</p>
		 *
		 * <p>In the following example, properties for the horizontal scroll bar
		 * are passed to the scroller:</p>
		 *
		 * <listing version="3.0">
		 * scroller.horizontalScrollBarProperties.liveDragging = false;</listing>
		 *
		 * @default null
		 *
		 * @see #horizontalScrollBarFactory
		 * @see feathers.controls.IScrollBar
		 * @see feathers.controls.SimpleScrollBar
		 * @see feathers.controls.ScrollBar
		 */
		public get horizontalScrollBarProperties():Object
		{
			if(!this._horizontalScrollBarProperties)
			{
				this._horizontalScrollBarProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._horizontalScrollBarProperties;
		}

		/**
		 * @private
		 */
		public set horizontalScrollBarProperties(value:Object)
		{
			if(this._horizontalScrollBarProperties == value)
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
			if(this._horizontalScrollBarProperties)
			{
				this._horizontalScrollBarProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._horizontalScrollBarProperties = PropertyProxy(value);
			if(this._horizontalScrollBarProperties)
			{
				this._horizontalScrollBarProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _verticalScrollBarPosition:string = Scroller.VERTICAL_SCROLL_BAR_POSITION_RIGHT;

		/*[Inspectable(type="String",enumeration="right,left")]*/
		/**
		 * Determines where the vertical scroll bar will be positioned.
		 *
		 * <p>In the following example, the scroll bars is positioned on the left:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalScrollBarPosition = Scroller.VERTICAL_SCROLL_BAR_POSITION_LEFT;</listing>
		 *
		 * @default Scroller.VERTICAL_SCROLL_BAR_POSITION_RIGHT
		 *
		 * @see #VERTICAL_SCROLL_BAR_POSITION_RIGHT
		 * @see #VERTICAL_SCROLL_BAR_POSITION_LEFT
		 */
		public get verticalScrollBarPosition():string
		{
			return this._verticalScrollBarPosition;
		}

		/**
		 * @private
		 */
		public set verticalScrollBarPosition(value:string)
		{
			if(this._verticalScrollBarPosition == value)
			{
				return;
			}
			this._verticalScrollBarPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _verticalScrollBarFactory:Function = Scroller.defaultScrollBarFactory;

		/**
		 * Creates the vertical scroll bar. The vertical scroll bar must be an
		 * instance of <code>Button</code>. This factory can be used to change
		 * properties on the vertical scroll bar when it is first created. For
		 * instance, if you are skinning Feathers components without a theme,
		 * you might use this factory to set skins and other styles on the
		 * vertical scroll bar.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():IScrollBar</pre>
		 *
		 * <p>In the following example, a custom vertical scroll bar factory
		 * is passed to the scroller:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalScrollBarFactory = function():IScrollBar
		 * {
		 *     return new ScrollBar();
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.IScrollBar
		 * @see #verticalScrollBarProperties
		 */
		public get verticalScrollBarFactory():Function
		{
			return this._verticalScrollBarFactory;
		}

		/**
		 * @private
		 */
		public set verticalScrollBarFactory(value:Function)
		{
			if(this._verticalScrollBarFactory == value)
			{
				return;
			}
			this._verticalScrollBarFactory = value;
			this.invalidate(Scroller.INVALIDATION_FLAG_SCROLL_BAR_RENDERER);
		}

		/**
		 * @private
		 */
		protected _customVerticalScrollBarStyleName:string;

		/**
		 * A style name to add to the container's vertical scroll bar
		 * sub-component. Typically used by a theme to provide different styles
		 * to different containers.
		 *
		 * <p>In the following example, a custom vertical scroll bar style name
		 * is passed to the scroller:</p>
		 *
		 * <listing version="3.0">
		 * scroller.customVerticalScrollBarStyleName = "my-custom-vertical-scroll-bar";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( SimpleScrollBar ).setFunctionForStyleName( "my-custom-vertical-scroll-bar", setCustomVerticalScrollBarStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_VERTICAL_SCROLL_BAR
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #verticalScrollBarFactory
		 * @see #verticalScrollBarProperties
		 */
		public get customVerticalScrollBarStyleName():string
		{
			return this._customVerticalScrollBarStyleName;
		}

		/**
		 * @private
		 */
		public set customVerticalScrollBarStyleName(value:string)
		{
			if(this._customVerticalScrollBarStyleName == value)
			{
				return;
			}
			this._customVerticalScrollBarStyleName = value;
			this.invalidate(Scroller.INVALIDATION_FLAG_SCROLL_BAR_RENDERER);
		}

		/**
		 * DEPRECATED: Replaced by <code>customVerticalScrollBarStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customVerticalScrollBarStyleName
		 */
		public get customVerticalScrollBarName():string
		{
			return this.customVerticalScrollBarStyleName;
		}

		/**
		 * @private
		 */
		public set customVerticalScrollBarName(value:string)
		{
			this.customVerticalScrollBarStyleName = value;
		}

		/**
		 * @private
		 */
		protected _verticalScrollBarProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the scroller's
		 * vertical scroll bar instance (if it exists). The scroll bar is an
		 * <code>IScrollBar</code> instance. The available properties depend on
		 * which implementation of <code>IScrollBar</code> is returned by
		 * <code>verticalScrollBarFactory</code>. The most common
		 * implementations are <code>SimpleScrollBar</code> and <code>ScrollBar</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>verticalScrollBarFactory</code>
		 * function instead of using <code>verticalScrollBarProperties</code>
		 * will result in better performance.</p>
		 *
		 * <p>In the following example, properties for the vertical scroll bar
		 * are passed to the scroller:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalScrollBarProperties.liveDragging = false;</listing>
		 *
		 * @default null
		 *
		 * @see #verticalScrollBarFactory
		 * @see feathers.controls.IScrollBar
		 * @see feathers.controls.SimpleScrollBar
		 * @see feathers.controls.ScrollBar
		 */
		public get verticalScrollBarProperties():Object
		{
			if(!this._verticalScrollBarProperties)
			{
				this._verticalScrollBarProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._verticalScrollBarProperties;
		}

		/**
		 * @private
		 */
		public set verticalScrollBarProperties(value:Object)
		{
			if(this._horizontalScrollBarProperties == value)
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
			if(this._verticalScrollBarProperties)
			{
				this._verticalScrollBarProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._verticalScrollBarProperties = PropertyProxy(value);
			if(this._verticalScrollBarProperties)
			{
				this._verticalScrollBarProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected actualHorizontalScrollStep:number = 1;

		/**
		 * @private
		 */
		protected explicitHorizontalScrollStep:number = NaN;

		/**
		 * The number of pixels the scroller can be stepped horizontally. Passed
		 * to the horizontal scroll bar, if one exists. Touch scrolling is not
		 * affected by the step value.
		 *
		 * <p>In the following example, the horizontal scroll step is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.horizontalScrollStep = 0;</listing>
		 *
		 * @default NaN
		 */
		public get horizontalScrollStep():number
		{
			return this.actualHorizontalScrollStep;
		}

		/**
		 * @private
		 */
		public set horizontalScrollStep(value:number)
		{
			if(this.explicitHorizontalScrollStep == value)
			{
				return;
			}
			this.explicitHorizontalScrollStep = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		/**
		 * @private
		 */
		protected _targetHorizontalScrollPosition:number;

		/**
		 * @private
		 */
		protected _horizontalScrollPosition:number = 0;

		/**
		 * The number of pixels the scroller has been scrolled horizontally (on
		 * the x-axis).
		 *
		 * <p>In the following example, the horizontal scroll position is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.horizontalScrollPosition = scroller.maxHorizontalScrollPosition;</listing>
		 *
		 * @see #minHorizontalScrollPosition
		 * @see #maxHorizontalScrollPosition
		 */
		public get horizontalScrollPosition():number
		{
			return this._horizontalScrollPosition;
		}

		/**
		 * @private
		 */
		public set horizontalScrollPosition(value:number)
		{
			if(this._snapScrollPositionsToPixels)
			{
				value = Math.round(value);
			}
			if(this._horizontalScrollPosition == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				//there isn't any recovery from this, so stop it early
				throw new ArgumentError("horizontalScrollPosition cannot be NaN.");
			}
			this._horizontalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		/**
		 * @private
		 */
		protected _minHorizontalScrollPosition:number = 0;

		/**
		 * The number of pixels the scroller may be scrolled horizontally to the
		 * left. This value is automatically calculated based on the bounds of
		 * the viewport. The <code>horizontalScrollPosition</code> property may
		 * have a lower value than the minimum due to elastic edges. However,
		 * once the user stops interacting with the scroller, it will
		 * automatically animate back to the maximum or minimum position.
		 *
		 * @see #horizontalScrollPosition
		 * @see #maxHorizontalScrollPosition
		 */
		public get minHorizontalScrollPosition():number
		{
			return this._minHorizontalScrollPosition;
		}

		/**
		 * @private
		 */
		protected _maxHorizontalScrollPosition:number = 0;

		/**
		 * The number of pixels the scroller may be scrolled horizontally to the
		 * right. This value is automatically calculated based on the bounds of
		 * the viewport. The <code>horizontalScrollPosition</code> property may
		 * have a higher value than the maximum due to elastic edges. However,
		 * once the user stops interacting with the scroller, it will
		 * automatically animate back to the maximum or minimum position.
		 *
		 * @see #horizontalScrollPosition
		 * @see #minHorizontalScrollPosition
		 */
		public get maxHorizontalScrollPosition():number
		{
			return this._maxHorizontalScrollPosition;
		}

		/**
		 * @private
		 */
		protected _horizontalPageIndex:number = 0;

		/**
		 * The index of the horizontal page, if snapping is enabled. If snapping
		 * is disabled, the index will always be <code>0</code>.
		 * 
		 * @see #horizontalPageCount
		 * @see #minHorizontalPageIndex
		 * @see #maxHorizontalPageIndex
		 */
		public get horizontalPageIndex():number
		{
			if(this.hasPendingHorizontalPageIndex)
			{
				return this.pendingHorizontalPageIndex;
			}
			return this._horizontalPageIndex;
		}

		/**
		 * @private
		 */
		protected _minHorizontalPageIndex:number = 0;

		/**
		 * The minimum horizontal page index that may be displayed by this
		 * container, if page snapping is enabled.
		 *
		 * @see #snapToPages
		 * @see #horizontalPageCount
		 * @see #maxHorizontalPageIndex
		 */
		public get minHorizontalPageIndex():number
		{
			return this._minHorizontalPageIndex;
		}

		/**
		 * @private
		 */
		protected _maxHorizontalPageIndex:number = 0;

		/**
		 * The maximum horizontal page index that may be displayed by this
		 * container, if page snapping is enabled.
		 *
		 * @see #snapToPages
		 * @see #horizontalPageCount
		 * @see #minHorizontalPageIndex
		 */
		public get maxHorizontalPageIndex():number
		{
			return this._maxHorizontalPageIndex;
		}

		/**
		 * The number of horizontal pages, if snapping is enabled. If snapping
		 * is disabled, the page count will always be <code>1</code>.
		 *
		 * <p>If the scroller's view port supports infinite scrolling, this
		 * property will return <code>int.MAX_VALUE</code>, since an
		 * <code>int</code> cannot hold the value <code>Number.POSITIVE_INFINITY</code>.</p>
		 *
		 * @see #snapToPages
		 * @see #horizontalPageIndex
		 * @see #minHorizontalPageIndex
		 * @see #maxHorizontalPageIndex
		 */
		public get horizontalPageCount():number
		{
			if(this._maxHorizontalPageIndex == int.MAX_VALUE ||
				this._minHorizontalPageIndex == int.MIN_VALUE)
			{
				return int.MAX_VALUE;
			}
			return this._maxHorizontalPageIndex - this._minHorizontalPageIndex + 1;
		}

		/**
		 * @private
		 */
		protected _horizontalScrollPolicy:string = Scroller.SCROLL_POLICY_AUTO;

		/*[Inspectable(type="String",enumeration="auto,on,off")]*/
		/**
		 * Determines whether the scroller may scroll horizontally (on the
		 * x-axis) or not.
		 *
		 * <p>In the following example, horizontal scrolling is disabled:</p>
		 *
		 * <listing version="3.0">
		 * scroller.horizontalScrollPolicy = Scroller.SCROLL_POLICY_OFF;</listing>
		 *
		 * @default Scroller.SCROLL_POLICY_AUTO
		 *
		 * @see #SCROLL_POLICY_AUTO
		 * @see #SCROLL_POLICY_ON
		 * @see #SCROLL_POLICY_OFF
		 */
		public get horizontalScrollPolicy():string
		{
			return this._horizontalScrollPolicy;
		}

		/**
		 * @private
		 */
		public set horizontalScrollPolicy(value:string)
		{
			if(this._horizontalScrollPolicy == value)
			{
				return;
			}
			this._horizontalScrollPolicy = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
			this.invalidate(Scroller.INVALIDATION_FLAG_SCROLL_BAR_RENDERER);
		}

		/**
		 * @private
		 */
		protected actualVerticalScrollStep:number = 1;

		/**
		 * @private
		 */
		protected explicitVerticalScrollStep:number = NaN;

		/**
		 * The number of pixels the scroller can be stepped vertically. Passed
		 * to the vertical scroll bar, if it exists, and used for scrolling with
		 * the mouse wheel. Touch scrolling is not affected by the step value.
		 *
		 * <p>In the following example, the vertical scroll step is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalScrollStep = 0;</listing>
		 *
		 * @default NaN
		 */
		public get verticalScrollStep():number
		{
			return this.actualVerticalScrollStep;
		}

		/**
		 * @private
		 */
		public set verticalScrollStep(value:number)
		{
			if(this.explicitVerticalScrollStep == value)
			{
				return;
			}
			this.explicitVerticalScrollStep = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		/**
		 * @private
		 */
		protected _verticalMouseWheelScrollStep:number = NaN;

		/**
		 * The number of pixels the scroller can be stepped vertically when
		 * using the mouse wheel. If this value is <code>NaN</code>, the mouse
		 * wheel will use the same scroll step as the scroll bars.
		 *
		 * <p>In the following example, the vertical mouse wheel scroll step is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalMouseWheelScrollStep = 10;</listing>
		 *
		 * @default NaN
		 */
		public get verticalMouseWheelScrollStep():number
		{
			return this._verticalMouseWheelScrollStep;
		}

		/**
		 * @private
		 */
		public set verticalMouseWheelScrollStep(value:number)
		{
			if(this._verticalMouseWheelScrollStep == value)
			{
				return;
			}
			this._verticalMouseWheelScrollStep = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		/**
		 * @private
		 */
		protected _targetVerticalScrollPosition:number;

		/**
		 * @private
		 */
		protected _verticalScrollPosition:number = 0;

		/**
		 * The number of pixels the scroller has been scrolled vertically (on
		 * the y-axis).
		 *
		 * <p>In the following example, the vertical scroll position is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalScrollPosition = scroller.maxVerticalScrollPosition;</listing>
		 * 
		 * @see #minVerticalScrollPosition
		 * @see #maxVerticalScrollPosition
		 */
		public get verticalScrollPosition():number
		{
			return this._verticalScrollPosition;
		}

		/**
		 * @private
		 */
		public set verticalScrollPosition(value:number)
		{
			if(this._snapScrollPositionsToPixels)
			{
				value = Math.round(value);
			}
			if(this._verticalScrollPosition == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				//there isn't any recovery from this, so stop it early
				throw new ArgumentError("verticalScrollPosition cannot be NaN.");
			}
			this._verticalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		/**
		 * @private
		 */
		protected _minVerticalScrollPosition:number = 0;

		/**
		 * The number of pixels the scroller may be scrolled vertically beyond
		 * the top edge. This value is automatically calculated based on the
		 * bounds of the viewport. The <code>verticalScrollPosition</code>
		 * property may have a lower value than the minimum due to elastic
		 * edges. However, once the user stops interacting with the scroller, it
		 * will automatically animate back to the maximum or minimum position.
		 *
		 * @see #verticalScrollPosition
		 * @see #maxVerticalScrollPosition
		 */
		public get minVerticalScrollPosition():number
		{
			return this._minVerticalScrollPosition;
		}

		/**
		 * @private
		 */
		protected _maxVerticalScrollPosition:number = 0;

		/**
		 * The number of pixels the scroller may be scrolled vertically beyond
		 * the bottom edge. This value is automatically calculated based on the
		 * bounds of the viewport. The <code>verticalScrollPosition</code>
		 * property may have a lower value than the minimum due to elastic
		 * edges. However, once the user stops interacting with the scroller, it
		 * will automatically animate back to the maximum or minimum position.
		 *
		 * @see #verticalScrollPosition
		 * @see #minVerticalScrollPosition
		 */
		public get maxVerticalScrollPosition():number
		{
			return this._maxVerticalScrollPosition;
		}

		/**
		 * @private
		 */
		protected _verticalPageIndex:number = 0;

		/**
		 * The index of the vertical page, if snapping is enabled. If snapping
		 * is disabled, the index will always be <code>0</code>.
		 *
		 * @see #verticalPageCount
		 * @see #minVerticalPageIndex
		 * @see #maxVerticalPageIndex
		 */
		public get verticalPageIndex():number
		{
			if(this.hasPendingVerticalPageIndex)
			{
				return this.pendingVerticalPageIndex;
			}
			return this._verticalPageIndex;
		}

		/**
		 * @private
		 */
		protected _minVerticalPageIndex:number = 0;

		/**
		 * The minimum vertical page index that may be displayed by this
		 * container, if page snapping is enabled.
		 *
		 * @see #snapToPages
		 * @see #verticalPageCount
		 * @see #maxVerticalPageIndex
		 */
		public get minVerticalPageIndex():number
		{
			return this._minVerticalPageIndex;
		}

		/**
		 * @private
		 */
		protected _maxVerticalPageIndex:number = 0;

		/**
		 * The maximum vertical page index that may be displayed by this
		 * container, if page snapping is enabled.
		 *
		 * @see #snapToPages
		 * @see #verticalPageCount
		 * @see #minVerticalPageIndex
		 */
		public get maxVerticalPageIndex():number
		{
			return this._maxVerticalPageIndex;
		}

		/**
		 * The number of vertical pages, if snapping is enabled. If snapping
		 * is disabled, the page count will always be <code>1</code>.
		 *
		 * <p>If the scroller's view port supports infinite scrolling, this
		 * property will return <code>int.MAX_VALUE</code>, since an
		 * <code>int</code> cannot hold the value <code>Number.POSITIVE_INFINITY</code>.</p>
		 *
		 * @see #snapToPages
		 * @see #verticalPageIndex
		 * @see #minVerticalPageIndex
		 * @see #maxVerticalPageIndex
		 */
		public get verticalPageCount():number
		{
			if(this._maxVerticalPageIndex == int.MAX_VALUE ||
				this._minVerticalPageIndex == int.MIN_VALUE)
			{
				return int.MAX_VALUE;
			}
			return this._maxVerticalPageIndex - this._minVerticalPageIndex + 1;
		}

		/**
		 * @private
		 */
		protected _verticalScrollPolicy:string = Scroller.SCROLL_POLICY_AUTO;

		/*[Inspectable(type="String",enumeration="auto,on,off")]*/
		/**
		 * Determines whether the scroller may scroll vertically (on the
		 * y-axis) or not.
		 *
		 * <p>In the following example, vertical scrolling is disabled:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalScrollPolicy = Scroller.SCROLL_POLICY_OFF;</listing>
		 *
		 * @default Scroller.SCROLL_POLICY_AUTO
		 *
		 * @see #SCROLL_POLICY_AUTO
		 * @see #SCROLL_POLICY_ON
		 * @see #SCROLL_POLICY_OFF
		 */
		public get verticalScrollPolicy():string
		{
			return this._verticalScrollPolicy;
		}

		/**
		 * @private
		 */
		public set verticalScrollPolicy(value:string)
		{
			if(this._verticalScrollPolicy == value)
			{
				return;
			}
			this._verticalScrollPolicy = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
			this.invalidate(Scroller.INVALIDATION_FLAG_SCROLL_BAR_RENDERER);
		}

		/**
		 * @private
		 */
		protected _clipContent:boolean = true;

		/**
		 * If true, the viewport will be clipped to the scroller's bounds. In
		 * other words, anything appearing outside the scroller's bounds will
		 * not be visible.
		 *
		 * <p>To improve performance, turn off clipping and place other display
		 * objects over the edges of the scroller to hide the content that
		 * bleeds outside of the scroller's bounds.</p>
		 *
		 * <p>In the following example, clipping is disabled:</p>
		 *
		 * <listing version="3.0">
		 * scroller.clipContent = false;</listing>
		 *
		 * @default true
		 */
		public get clipContent():boolean
		{
			return this._clipContent;
		}

		/**
		 * @private
		 */
		public set clipContent(value:boolean)
		{
			if(this._clipContent == value)
			{
				return;
			}
			this._clipContent = value;
			this.invalidate(Scroller.INVALIDATION_FLAG_CLIPPING);
		}

		/**
		 * @private
		 */
		protected actualPageWidth:number = 0;

		/**
		 * @private
		 */
		protected explicitPageWidth:number = NaN;

		/**
		 * When set, the horizontal pages snap to this width value instead of
		 * the width of the scroller.
		 *
		 * <p>In the following example, the page width is set to 200 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.pageWidth = 200;</listing>
		 *
		 * @see #snapToPages
		 */
		public get pageWidth():number
		{
			return this.actualPageWidth;
		}

		/**
		 * @private
		 */
		public set pageWidth(value:number)
		{
			if(this.explicitPageWidth == value)
			{
				return;
			}
			var valueIsNaN:boolean = value !== value; //isNaN
			if(valueIsNaN && this.explicitPageWidth !== this.explicitPageWidth)
			{
				return;
			}
			this.explicitPageWidth = value;
			if(valueIsNaN)
			{
				//we need to calculate this value during validation
				this.actualPageWidth = 0;
			}
			else
			{
				this.actualPageWidth = this.explicitPageWidth;
			}
		}

		/**
		 * @private
		 */
		protected actualPageHeight:number = 0;

		/**
		 * @private
		 */
		protected explicitPageHeight:number = NaN;

		/**
		 * When set, the vertical pages snap to this height value instead of
		 * the height of the scroller.
		 *
		 * <p>In the following example, the page height is set to 200 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.pageHeight = 200;</listing>
		 *
		 * @see #snapToPages
		 */
		public get pageHeight():number
		{
			return this.actualPageHeight;
		}

		/**
		 * @private
		 */
		public set pageHeight(value:number)
		{
			if(this.explicitPageHeight == value)
			{
				return;
			}
			var valueIsNaN:boolean = value !== value; //isNaN
			if(valueIsNaN && this.explicitPageHeight !== this.explicitPageHeight)
			{
				return;
			}
			this.explicitPageHeight = value;
			if(valueIsNaN)
			{
				//we need to calculate this value during validation
				this.actualPageHeight = 0;
			}
			else
			{
				this.actualPageHeight = this.explicitPageHeight;
			}
		}

		/**
		 * @private
		 */
		protected _hasElasticEdges:boolean = true;

		/**
		 * Determines if the scrolling can go beyond the edges of the viewport.
		 *
		 * <p>In the following example, elastic edges are disabled:</p>
		 *
		 * <listing version="3.0">
		 * scroller.hasElasticEdges = false;</listing>
		 *
		 * @default true
		 *
		 * @see #elasticity
		 * @see #throwElasticity
		 */
		public get hasElasticEdges():boolean
		{
			return this._hasElasticEdges;
		}

		/**
		 * @private
		 */
		public set hasElasticEdges(value:boolean)
		{
			this._hasElasticEdges = value;
		}

		/**
		 * @private
		 */
		protected _elasticity:number = 0.33;

		/**
		 * If the scroll position goes outside the minimum or maximum bounds
		 * when the scroller's content is being actively dragged, the scrolling
		 * will be constrained using this multiplier. A value of <code>0</code>
		 * means that the scroller will not go beyond its minimum or maximum
		 * bounds. A value of <code>1</code> means that going beyond the minimum
		 * or maximum bounds is completely unrestrained.
		 *
		 * <p>In the following example, the elasticity of dragging beyond the
		 * scroller's edges is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.elasticity = 0.5;</listing>
		 *
		 * @default 0.33
		 *
		 * @see #hasElasticEdges
		 * @see #throwElasticity
		 */
		public get elasticity():number
		{
			return this._elasticity;
		}

		/**
		 * @private
		 */
		public set elasticity(value:number)
		{
			this._elasticity = value;
		}

		/**
		 * @private
		 */
		protected _throwElasticity:number = 0.05;

		/**
		 * If the scroll position goes outside the minimum or maximum bounds
		 * when the scroller's content is "thrown", the scrolling will be
		 * constrained using this multiplier. A value of <code>0</code> means
		 * that the scroller will not go beyond its minimum or maximum bounds.
		 * A value of <code>1</code> means that going beyond the minimum or
		 * maximum bounds is completely unrestrained.
		 *
		 * <p>In the following example, the elasticity of throwing beyond the
		 * scroller's edges is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.throwElasticity = 0.1;</listing>
		 *
		 * @default 0.05
		 *
		 * @see #hasElasticEdges
		 * @see #elasticity
		 */
		public get throwElasticity():number
		{
			return this._throwElasticity;
		}

		/**
		 * @private
		 */
		public set throwElasticity(value:number)
		{
			this._throwElasticity = value;
		}

		/**
		 * @private
		 */
		protected _scrollBarDisplayMode:string = Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT;

		/*[Inspectable(type="String",enumeration="float,fixed,none")]*/
		/**
		 * Determines how the scroll bars are displayed.
		 *
		 * <p>In the following example, the scroll bars are fixed:</p>
		 *
		 * <listing version="3.0">
		 * scroller.scrollBarDisplayMode = Scroller.SCROLL_BAR_DISPLAY_MODE_FIXED;</listing>
		 *
		 * @default Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT
		 *
		 * @see #SCROLL_BAR_DISPLAY_MODE_FLOAT
		 * @see #SCROLL_BAR_DISPLAY_MODE_FIXED
		 * @see #SCROLL_BAR_DISPLAY_MODE_NONE
		 */
		public get scrollBarDisplayMode():string
		{
			return this._scrollBarDisplayMode;
		}

		/**
		 * @private
		 */
		public set scrollBarDisplayMode(value:string)
		{
			if(this._scrollBarDisplayMode == value)
			{
				return;
			}
			this._scrollBarDisplayMode = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _interactionMode:string = Scroller.INTERACTION_MODE_TOUCH;

		/*[Inspectable(type="String",enumeration="touch,mouse,touchAndScrollBars")]*/
		/**
		 * Determines how the user may interact with the scroller.
		 *
		 * <p>In the following example, the interaction mode is optimized for mouse:</p>
		 *
		 * <listing version="3.0">
		 * scroller.interactionMode = Scroller.INTERACTION_MODE_MOUSE;</listing>
		 *
		 * @default Scroller.INTERACTION_MODE_TOUCH
		 *
		 * @see #INTERACTION_MODE_TOUCH
		 * @see #INTERACTION_MODE_MOUSE
		 * @see #INTERACTION_MODE_TOUCH_AND_SCROLL_BARS
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
			if(this._interactionMode == value)
			{
				return;
			}
			this._interactionMode = value;
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
		 * The default background to display.
		 *
		 * <p>In the following example, the scroller is given a background skin:</p>
		 *
		 * <listing version="3.0">
		 * scroller.backgroundSkin = new Image( texture );</listing>
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

			if(this._backgroundSkin && this.currentBackgroundSkin == this._backgroundSkin)
			{
				this.removeRawChildInternal(this._backgroundSkin);
				this.currentBackgroundSkin = null;
			}
			this._backgroundSkin = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _backgroundDisabledSkin:DisplayObject;

		/**
		 * A background to display when the container is disabled.
		 *
		 * <p>In the following example, the scroller is given a disabled background skin:</p>
		 *
		 * <listing version="3.0">
		 * scroller.backgroundDisabledSkin = new Image( texture );</listing>
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

			if(this._backgroundDisabledSkin && this.currentBackgroundSkin == this._backgroundDisabledSkin)
			{
				this.removeRawChildInternal(this._backgroundDisabledSkin);
				this.currentBackgroundSkin = null;
			}
			this._backgroundDisabledSkin = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _autoHideBackground:boolean = false;

		/**
		 * If <code>true</code>, the background's <code>visible</code> property
		 * will be set to <code>false</code> when the scroll position is greater
		 * than or equal to the minimum scroll position and less than or equal
		 * to the maximum scroll position. The background will be visible when
		 * the content is extended beyond the scrolling bounds, such as when
		 * <code>hasElasticEdges</code> is <code>true</code>.
		 *
		 * <p>If the content is not fully opaque, this setting should not be
		 * enabled.</p>
		 *
		 * <p>This setting may be enabled to potentially improve performance.</p>
		 *
		 * <p>In the following example, the background is automatically hidden:</p>
		 *
		 * <listing version="3.0">
		 * scroller.autoHideBackground = true;</listing>
		 *
		 * @default false
		 */
		public get autoHideBackground():boolean
		{
			return this._autoHideBackground;
		}

		/**
		 * @private
		 */
		public set autoHideBackground(value:boolean)
		{
			if(this._autoHideBackground == value)
			{
				return;
			}
			this._autoHideBackground = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _minimumDragDistance:number = 0.04;

		/**
		 * The minimum physical distance (in inches) that a touch must move
		 * before the scroller starts scrolling.
		 *
		 * <p>In the following example, the minimum drag distance is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.minimumDragDistance = 0.1;</listing>
		 *
		 * @default 0.04
		 */
		public get minimumDragDistance():number
		{
			return this._minimumDragDistance;
		}

		/**
		 * @private
		 */
		public set minimumDragDistance(value:number)
		{
			this._minimumDragDistance = value;
		}

		/**
		 * @private
		 */
		protected _minimumPageThrowVelocity:number = 5;

		/**
		 * The minimum physical velocity (in inches per second) that a touch
		 * must move before the scroller will "throw" to the next page.
		 * Otherwise, it will settle to the nearest page.
		 *
		 * <p>In the following example, the minimum page throw velocity is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.minimumPageThrowVelocity = 2;</listing>
		 *
		 * @default 5
		 */
		public get minimumPageThrowVelocity():number
		{
			return this._minimumPageThrowVelocity;
		}

		/**
		 * @private
		 */
		public set minimumPageThrowVelocity(value:number)
		{
			this._minimumPageThrowVelocity = value;
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
		 * scroller.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the container's top edge and the
		 * container's content.
		 *
		 * <p>In the following example, the top padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the container's right edge and
		 * the container's content.
		 *
		 * <p>In the following example, the right padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the container's bottom edge and
		 * the container's content.
		 *
		 * <p>In the following example, the bottom padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the container's left edge and the
		 * container's content.
		 *
		 * <p>In the following example, the left padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.paddingLeft = 20;</listing>
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
		protected _horizontalScrollBarHideTween:Tween;

		/**
		 * @private
		 */
		protected _verticalScrollBarHideTween:Tween;

		/**
		 * @private
		 */
		protected _hideScrollBarAnimationDuration:number = 0.2;

		/**
		 * The duration, in seconds, of the animation when a scroll bar fades
		 * out.
		 *
		 * <p>In the following example, the duration of the animation that hides
		 * the scroll bars is set to 500 milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * scroller.hideScrollBarAnimationDuration = 0.5;</listing>
		 *
		 * @default 0.2
		 */
		public get hideScrollBarAnimationDuration():number
		{
			return this._hideScrollBarAnimationDuration;
		}

		/**
		 * @private
		 */
		public set hideScrollBarAnimationDuration(value:number)
		{
			this._hideScrollBarAnimationDuration = value;
		}

		/**
		 * @private
		 */
		protected _hideScrollBarAnimationEase:Object = Transitions.EASE_OUT;

		/**
		 * The easing function used for hiding the scroll bars, if applicable.
		 *
		 * <p>In the following example, the ease of the animation that hides
		 * the scroll bars is customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.hideScrollBarAnimationEase = Transitions.EASE_IN_OUT;</listing>
		 *
		 * @default starling.animation.Transitions.EASE_OUT
		 *
		 * @see http://doc.starling-framework.org/core/starling/animation/Transitions.html starling.animation.Transitions
		 */
		public get hideScrollBarAnimationEase():Object
		{
			return this._hideScrollBarAnimationEase;
		}

		/**
		 * @private
		 */
		public set hideScrollBarAnimationEase(value:Object)
		{
			this._hideScrollBarAnimationEase = value;
		}

		/**
		 * @private
		 */
		protected _elasticSnapDuration:number = 0.5;

		/**
		 * The duration, in seconds, of the animation when a the scroller snaps
		 * back to the minimum or maximum position after going out of bounds.
		 *
		 * <p>In the following example, the duration of the animation that snaps
		 * the content back after pulling it beyond the edge is set to 750
		 * milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * scroller.elasticSnapDuration = 0.75;</listing>
		 *
		 * @default 0.5
		 */
		public get elasticSnapDuration():number
		{
			return this._elasticSnapDuration;
		}

		/**
		 * @private
		 */
		public set elasticSnapDuration(value:number)
		{
			this._elasticSnapDuration = value;
		}

		/**
		 * @private
		 * This value is precalculated. See the <code>decelerationRate</code>
		 * setter for the dynamic calculation.
		 */
		protected _logDecelerationRate:number = -0.0020020026706730793;

		/**
		 * @private
		 */
		protected _decelerationRate:number = Scroller.DECELERATION_RATE_NORMAL;

		/**
		 * This value is used to decelerate the scroller when "thrown". The
		 * velocity of a throw is multiplied by this value once per millisecond
		 * to decelerate. A value greater than <code>0</code> and less than
		 * <code>1</code> is expected.
		 *
		 * <p>In the following example, deceleration rate is lowered to adjust
		 * the behavior of a throw:</p>
		 *
		 * <listing version="3.0">
		 * scroller.decelerationRate = Scroller.DECELERATION_RATE_FAST;</listing>
		 *
		 * @default Scroller.DECELERATION_RATE_NORMAL
		 *
		 * @see #DECELERATION_RATE_NORMAL
		 * @see #DECELERATION_RATE_FAST
		 */
		public get decelerationRate():number
		{
			return this._decelerationRate;
		}

		/**
		 * @private
		 */
		public set decelerationRate(value:number)
		{
			if(this._decelerationRate == value)
			{
				return;
			}
			this._decelerationRate = value;
			this._logDecelerationRate = Math.log(this._decelerationRate);
			this._fixedThrowDuration = -0.1 / Math.log(Math.pow(this._decelerationRate, 1000 / 60))
		}

		/**
		 * @private
		 * This value is precalculated. See the <code>decelerationRate</code>
		 * setter for the dynamic calculation.
		 */
		protected _fixedThrowDuration:number = 2.996998998998728;

		/**
		 * @private
		 */
		protected _useFixedThrowDuration:boolean = true;

		/**
		 * If <code>true</code>, the duration of a "throw" animation will be the
		 * same no matter the value of the throw's initial velocity. This value
		 * may be set to <code>false</code> to have the scroller calculate a
		 * variable duration based on the velocity of the throw.
		 *
		 * <p>It may seem unintuitive, but using the same fixed duration for any
		 * velocity is recommended if you are looking to closely match the
		 * behavior of native scrolling on iOS.</p>
		 *
		 * <p>In the following example, the duration of the animation that
		 * changes the scroller's content is equal:</p>
		 *
		 * <listing version="3.0">
		 * scroller.throwDuration = 1.5;</listing>
		 *
		 * @default 2.0
		 *
		 * @see #decelerationRate
		 * @see #pageThrowDuration
		 */
		public get useFixedThrowDuration():boolean
		{
			return this._useFixedThrowDuration;
		}

		/**
		 * @private
		 */
		public set useFixedThrowDuration(value:boolean)
		{
			this._useFixedThrowDuration = value;
		}

		/**
		 * @private
		 */
		protected _pageThrowDuration:number = 0.5;

		/**
		 * The duration, in seconds, of the animation when the scroller is
		 * thrown to a page.
		 *
		 * <p>In the following example, the duration of the animation that
		 * changes the page when thrown is set to 250 milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * scroller.pageThrowDuration = 0.25;</listing>
		 *
		 * @default 0.5
		 */
		public get pageThrowDuration():number
		{
			return this._pageThrowDuration;
		}

		/**
		 * @private
		 */
		public set pageThrowDuration(value:number)
		{
			this._pageThrowDuration = value;
		}

		/**
		 * @private
		 */
		protected _mouseWheelScrollDuration:number = 0.35;

		/**
		 * The duration, in seconds, of the animation when the mouse wheel
		 * initiates a scroll action.
		 *
		 * <p>In the following example, the duration of the animation that runs
		 * when the mouse wheel is scrolled is set to 500 milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * scroller.mouseWheelScrollDuration = 0.5;</listing>
		 *
		 * @default 0.35
		 */
		public get mouseWheelScrollDuration():number
		{
			return this._mouseWheelScrollDuration;
		}

		/**
		 * @private
		 */
		public set mouseWheelScrollDuration(value:number)
		{
			this._mouseWheelScrollDuration = value;
		}

		/**
		 * @private
		 */
		protected _verticalMouseWheelScrollDirection:string = Scroller.MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL;

		/**
		 * The direction of scrolling when the user scrolls the mouse wheel
		 * vertically. In some cases, it is common for a container that only
		 * scrolls horizontally to scroll even when the mouse wheel is scrolled
		 * vertically.
		 *
		 * <p>In the following example, the direction of scrolling when using
		 * the mouse wheel is changed:</p>
		 *
		 * <listing version="3.0">
		 * scroller.verticalMouseWheelScrollDirection = Scroller.MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL;</listing>
		 *
		 * @default Scroller.MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL
		 *
		 * @see #MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL
		 * @see #MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL
		 */
		public get verticalMouseWheelScrollDirection():string
		{
			return this._verticalMouseWheelScrollDirection;
		}

		/**
		 * @private
		 */
		public set verticalMouseWheelScrollDirection(value:string)
		{
			this._verticalMouseWheelScrollDirection = value;
		}

		/**
		 * @private
		 */
		protected _throwEase:Object = Transitions.EASE_OUT;

		/**
		 * The easing function used for "throw" animations.
		 *
		 * <p>In the following example, the ease of throwing animations is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * scroller.throwEase = Transitions.EASE_IN_OUT;</listing>
		 * 
		 * @default starling.animation.Transitions.EASE_OUT
		 *
		 * @see http://doc.starling-framework.org/core/starling/animation/Transitions.html starling.animation.Transitions
		 */
		public get throwEase():Object
		{
			return this._throwEase;
		}

		/**
		 * @private
		 */
		public set throwEase(value:Object)
		{
			this._throwEase = value;
		}

		/**
		 * @private
		 */
		protected _snapScrollPositionsToPixels:boolean = false;

		/**
		 * If enabled, the scroll position will always be adjusted to whole
		 * pixels.
		 *
		 * <p>In the following example, the scroll position is snapped to pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.snapScrollPositionsToPixels = true;</listing>
		 *
		 * @default false
		 */
		public get snapScrollPositionsToPixels():boolean
		{
			return this._snapScrollPositionsToPixels;
		}

		/**
		 * @private
		 */
		public set snapScrollPositionsToPixels(value:boolean)
		{
			if(this._snapScrollPositionsToPixels == value)
			{
				return;
			}
			this._snapScrollPositionsToPixels = value;
			if(this._snapScrollPositionsToPixels)
			{
				this.horizontalScrollPosition = Math.round(this._horizontalScrollPosition);
				this.verticalScrollPosition = Math.round(this._verticalScrollPosition);
			}
		}

		/**
		 * @private
		 */
		protected _horizontalScrollBarIsScrolling:boolean = false;

		/**
		 * @private
		 */
		protected _verticalScrollBarIsScrolling:boolean = false;

		/**
		 * @private
		 */
		protected _isScrolling:boolean = false;

		/**
		 * Determines if the scroller is currently scrolling with user
		 * interaction or with animation.
		 */
		public get isScrolling():boolean
		{
			return this._isScrolling;
		}

		/**
		 * @private
		 */
		protected _isScrollingStopped:boolean = false;

		/**
		 * The pending horizontal scroll position to scroll to after validating.
		 * A value of <code>NaN</code> means that the scroller won't scroll to a
		 * horizontal position after validating.
		 */
		protected pendingHorizontalScrollPosition:number = NaN;

		/**
		 * The pending vertical scroll position to scroll to after validating.
		 * A value of <code>NaN</code> means that the scroller won't scroll to a
		 * vertical position after validating.
		 */
		protected pendingVerticalScrollPosition:number = NaN;

		/**
		 * A flag that indicates if the scroller should scroll to a new page
		 * when it validates. If <code>true</code>, it will use the value of
		 * <code>pendingHorizontalPageIndex</code> as the target page index.
		 * 
		 * @see #pendingHorizontalPageIndex
		 */
		protected hasPendingHorizontalPageIndex:boolean = false;

		/**
		 * A flag that indicates if the scroller should scroll to a new page
		 * when it validates. If <code>true</code>, it will use the value of
		 * <code>pendingVerticalPageIndex</code> as the target page index.
		 *
		 * @see #pendingVerticalPageIndex
		 */
		protected hasPendingVerticalPageIndex:boolean = false;

		/**
		 * The pending horizontal page index to scroll to after validating. The
		 * flag <code>hasPendingHorizontalPageIndex</code> must be set to true
		 * if there is a pending page index to scroll to.
		 * 
		 * @see #hasPendingHorizontalPageIndex
		 */
		protected pendingHorizontalPageIndex:number;

		/**
		 * The pending vertical page index to scroll to after validating. The
		 * flag <code>hasPendingVerticalPageIndex</code> must be set to true
		 * if there is a pending page index to scroll to.
		 *
		 * @see #hasPendingVerticalPageIndex
		 */
		protected pendingVerticalPageIndex:number;

		/**
		 * The duration of the pending scroll action.
		 */
		protected pendingScrollDuration:number;

		/**
		 * @private
		 */
		protected isScrollBarRevealPending:boolean = false;

		/**
		 * @private
		 */
		protected _revealScrollBarsDuration:number = 1.0;

		/**
		 * The duration, in seconds, that the scroll bars will be shown when
		 * calling <code>revealScrollBars()</code>
		 *
		 * @default 1.0
		 *
		 * @see #revealScrollBars()
		 */
		public get revealScrollBarsDuration():number
		{
			return this._revealScrollBarsDuration;
		}

		/**
		 * @private
		 */
		public set revealScrollBarsDuration(value:number)
		{
			this._revealScrollBarsDuration = value;
		}

		/**
		 * @private
		 */
		protected _horizontalAutoScrollTweenEndRatio:number = 1;

		/**
		 * @private
		 */
		protected _verticalAutoScrollTweenEndRatio:number = 1;

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			Starling.current.nativeStage.removeEventListener(MouseEvent.MOUSE_WHEEL, this.nativeStage_mouseWheelHandler);
			Starling.current.nativeStage.removeEventListener("orientationChange", this.nativeStage_orientationChangeHandler);
			super.dispose();
		}

		/**
		 * If the user is scrolling with touch or if the scrolling is animated,
		 * calling stopScrolling() will cause the scroller to ignore the drag
		 * and stop animations. This function may only be called during scrolling,
		 * so if you need to stop scrolling on a <code>TouchEvent</code> with
		 * <code>TouchPhase.BEGAN</code>, you may need to wait for the scroller
		 * to start scrolling before you can call this function.
		 *
		 * <p>In the following example, we listen for <code>FeathersEventType.SCROLL_START</code>
		 * to stop scrolling:</p>
		 *
		 * <listing version="3.0">
		 * scroller.addEventListener( FeathersEventType.SCROLL_START, function( event:Event ):void
		 * {
		 *     scroller.stopScrolling();
		 * });</listing>
		 */
		public stopScrolling():void
		{
			if(this._horizontalAutoScrollTween)
			{
				Starling.juggler.remove(this._horizontalAutoScrollTween);
				this._horizontalAutoScrollTween = null;
			}
			if(this._verticalAutoScrollTween)
			{
				Starling.juggler.remove(this._verticalAutoScrollTween);
				this._verticalAutoScrollTween = null;
			}
			this._isScrollingStopped = true;
			this._velocityX = 0;
			this._velocityY = 0;
			this._previousVelocityX.length = 0;
			this._previousVelocityY.length = 0;
			this.hideHorizontalScrollBar();
			this.hideVerticalScrollBar();
		}

		/**
		 * After the next validation, animates the scroll positions to a
		 * specific location. May scroll in only one direction by passing in a
		 * value of <code>NaN</code> for either scroll position. If the
		 * <code>animationDuration</code> argument is <code>NaN</code> (the
		 * default value), the duration of a standard throw is used. The
		 * duration is in seconds.
		 *
		 * <p>Because this function is primarily designed for animation, using a
		 * duration of <code>0</code> may require a frame or two before the
		 * scroll position updates.</p>
		 *
		 * <p>In the following example, we scroll to the maximum vertical scroll
		 * position:</p>
		 *
		 * <listing version="3.0">
		 * scroller.scrollToPosition( scroller.horizontalScrollPosition, scroller.maxVerticalScrollPosition );</listing>
		 *
		 * @see #horizontalScrollPosition
		 * @see #verticalScrollPosition
		 * @see #throwEase
		 */
		public scrollToPosition(horizontalScrollPosition:number, verticalScrollPosition:number, animationDuration:number = NaN):void
		{
			if(animationDuration !== animationDuration) //isNaN
			{
				if(this._useFixedThrowDuration)
				{
					animationDuration = this._fixedThrowDuration;
				}
				else
				{
					Scroller.HELPER_POINT.setTo(horizontalScrollPosition - this._horizontalScrollPosition, verticalScrollPosition - this._verticalScrollPosition);
					animationDuration = this.calculateDynamicThrowDuration(Scroller.HELPER_POINT.length * this._logDecelerationRate + Scroller.MINIMUM_VELOCITY);
				}
			}
			//cancel any pending scroll to a different page. we can have only
			//one type of pending scroll at a time.
			this.hasPendingHorizontalPageIndex = false;
			this.hasPendingVerticalPageIndex = false;
			if(this.pendingHorizontalScrollPosition == horizontalScrollPosition &&
				this.pendingVerticalScrollPosition == verticalScrollPosition &&
				this.pendingScrollDuration == animationDuration)
			{
				return;
			}
			this.pendingHorizontalScrollPosition = horizontalScrollPosition;
			this.pendingVerticalScrollPosition = verticalScrollPosition;
			this.pendingScrollDuration = animationDuration;
			this.invalidate(Scroller.INVALIDATION_FLAG_PENDING_SCROLL);
		}

		/**
		 * After the next validation, animates the scroll position to a specific
		 * page index. To scroll in only one direction, pass in the value of the
		 * <code>horizontalPageIndex</code> or the
		 * <code>verticalPageIndex</code> property to the appropriate parameter.
		 * If the <code>animationDuration</code> argument is <code>NaN</code>
		 * (the default value) the value of the <code>pageThrowDuration</code>
		 * property is used for the duration. The duration is in seconds.
		 *
		 * <p>You can only scroll to a page if the <code>snapToPages</code>
		 * property is <code>true</code>.</p>
		 *
		 * <p>In the following example, we scroll to the last horizontal page:</p>
		 *
		 * <listing version="3.0">
		 * scroller.scrollToPageIndex( scroller.horizontalPageCount - 1, scroller.verticalPageIndex );</listing>
		 *
		 * @see #snapToPages
		 * @see #pageThrowDuration
		 * @see #throwEase
		 * @see #horizontalPageIndex
		 * @see #verticalPageIndex
		 */
		public scrollToPageIndex(horizontalPageIndex:number, verticalPageIndex:number, animationDuration:number = NaN):void
		{
			if(animationDuration !== animationDuration) //isNaN
			{
				animationDuration = this._pageThrowDuration;
			}
			//cancel any pending scroll to a specific scroll position. we can
			//have only one type of pending scroll at a time.
			this.pendingHorizontalScrollPosition = NaN;
			this.pendingVerticalScrollPosition = NaN;
			this.hasPendingHorizontalPageIndex = this._horizontalPageIndex !== horizontalPageIndex;
			this.hasPendingVerticalPageIndex = this._verticalPageIndex !== verticalPageIndex;
			if(!this.hasPendingHorizontalPageIndex && !this.hasPendingVerticalPageIndex)
			{
				return;
			}
			this.pendingHorizontalPageIndex = horizontalPageIndex;
			this.pendingVerticalPageIndex = verticalPageIndex;
			this.pendingScrollDuration = animationDuration;
			this.invalidate(Scroller.INVALIDATION_FLAG_PENDING_SCROLL);
		}

		/**
		 * If the scroll bars are floating, briefly show them as a hint to the
		 * user. Useful when first navigating to a screen to give the user
		 * context about both the ability to scroll and the current scroll
		 * position.
		 *
		 * @see #revealScrollBarsDuration
		 */
		public revealScrollBars():void
		{
			this.isScrollBarRevealPending = true;
			this.invalidate(Scroller.INVALIDATION_FLAG_PENDING_REVEAL_SCROLL_BARS);
		}

		/**
		 * @private
		 */
		/*override*/ public hitTest(localPoint:Point, forTouch:boolean = false):DisplayObject
		{
			//save localX and localY because localPoint could change after the
			//call to super.hitTest().
			var localX:number = localPoint.x;
			var localY:number = localPoint.y;
			//first check the children for touches
			var result:DisplayObject = super.hitTest(localPoint, forTouch);
			if(!result)
			{
				//we want to register touches in our hitArea as a last resort
				if(forTouch && (!this.visible || !this.touchable))
				{
					return null;
				}
				return this._hitArea.contains(localX, localY) ? this : null;
			}
			return result;
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			//we don't use this flag in this class, but subclasses will use it,
			//and it's better to handle it here instead of having them
			//invalidate unrelated flags
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
			var clippingInvalid:boolean = this.isInvalid(Scroller.INVALIDATION_FLAG_CLIPPING);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var scrollBarInvalid:boolean = this.isInvalid(Scroller.INVALIDATION_FLAG_SCROLL_BAR_RENDERER);
			var pendingScrollInvalid:boolean = this.isInvalid(Scroller.INVALIDATION_FLAG_PENDING_SCROLL);
			var pendingRevealScrollBarsInvalid:boolean = this.isInvalid(Scroller.INVALIDATION_FLAG_PENDING_REVEAL_SCROLL_BARS);

			if(scrollBarInvalid)
			{
				this.createScrollBars();
			}

			if(sizeInvalid || stylesInvalid || stateInvalid)
			{
				this.refreshBackgroundSkin();
			}

			if(scrollBarInvalid || stylesInvalid)
			{
				this.refreshScrollBarStyles();
				this.refreshInteractionModeEvents();
			}

			if(scrollBarInvalid || stateInvalid)
			{
				this.refreshEnabled();
			}

			if(this.horizontalScrollBar)
			{
				this.horizontalScrollBar.validate();
			}
			if(this.verticalScrollBar)
			{
				this.verticalScrollBar.validate();
			}

			var needsWidthOrHeight:boolean = this.explicitWidth !== this.explicitWidth ||
				this.explicitHeight !== this.explicitHeight; //isNaN
			var oldMaxHorizontalScrollPosition:number = this._maxHorizontalScrollPosition;
			var oldMaxVerticalScrollPosition:number = this._maxVerticalScrollPosition;
			var loopCount:number = 0;
			do
			{
				this._hasViewPortBoundsChanged = false;
				//if we don't need to do any measurement, we can skip this stuff
				//and improve performance
				if(needsWidthOrHeight && this._measureViewPort)
				{
					//even if fixed, we need to measure without them first because
					//if the scroll policy is auto, we only show them when needed.
					if(scrollInvalid || dataInvalid || sizeInvalid || stylesInvalid || scrollBarInvalid)
					{
						this.calculateViewPortOffsets(true, false);
						this.refreshViewPortBoundsWithoutFixedScrollBars();
						this.calculateViewPortOffsets(false, false);
					}
				}

				sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

				//just in case autoSizeIfNeeded() is overridden, we need to call
				//this again and use actualWidth/Height instead of
				//explicitWidth/Height.
				this.calculateViewPortOffsets(false, true);

				if(scrollInvalid || dataInvalid || sizeInvalid || stylesInvalid || scrollBarInvalid)
				{
					this.refreshViewPortBoundsWithFixedScrollBars();
					this.refreshScrollValues();
				}
				loopCount++;
				if(loopCount >= 10)
				{
					//if it still fails after ten tries, we've probably entered
					//an infinite loop due to rounding errors or something
					break;
				}
			}
			while(this._hasViewPortBoundsChanged)
			this._lastViewPortWidth = this.viewPort.width;
			this._lastViewPortHeight = this.viewPort.height;
			if(oldMaxHorizontalScrollPosition != this._maxHorizontalScrollPosition)
			{
				this.refreshHorizontalAutoScrollTweenEndRatio();
				scrollInvalid = true;
			}
			if(oldMaxVerticalScrollPosition != this._maxVerticalScrollPosition)
			{
				this.refreshVerticalAutoScrollTweenEndRatio();
				scrollInvalid = true;
			}
			if(scrollInvalid)
			{
				this.dispatchEventWith(Event.SCROLL);
			}

			this.showOrHideChildren();

			if(scrollInvalid || sizeInvalid || stylesInvalid || stateInvalid || scrollBarInvalid)
			{
				this.layoutChildren();
			}

			if(scrollInvalid || sizeInvalid || stylesInvalid || scrollBarInvalid)
			{
				this.refreshScrollBarValues();
			}

			if(scrollInvalid || sizeInvalid || stylesInvalid || scrollBarInvalid || clippingInvalid)
			{
				this.refreshClipRect();
			}
			this.refreshFocusIndicator();

			if(pendingScrollInvalid)
			{
				this.handlePendingScroll();
			}

			if(pendingRevealScrollBarsInvalid)
			{
				this.handlePendingRevealScrollBars();
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

			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				if(this._measureViewPort)
				{
					newWidth = this._viewPort.visibleWidth;
					if(newWidth !== newWidth) //isNaN
					{
						newWidth = this._viewPort.width;
					}
					newWidth += this._rightViewPortOffset + this._leftViewPortOffset;
				}
				else
				{
					newWidth = 0;
				}
				if(this.originalBackgroundWidth === this.originalBackgroundWidth && //!isNaN
					this.originalBackgroundWidth > newWidth)
				{
					newWidth = this.originalBackgroundWidth;
				}
			}
			if(needsHeight)
			{
				if(this._measureViewPort)
				{
					newHeight = this._viewPort.visibleHeight;
					if(newHeight !== newHeight) //isNaN
					{
						newHeight = this._viewPort.height;
					}
					newHeight += this._bottomViewPortOffset + this._topViewPortOffset;
				}
				else
				{
					newHeight = 0;
				}
				if(this.originalBackgroundHeight === this.originalBackgroundHeight && //!isNaN
					this.originalBackgroundHeight > newHeight)
				{
					newHeight = this.originalBackgroundHeight;
				}
			}
			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates and adds the <code>horizontalScrollBar</code> and
		 * <code>verticalScrollBar</code> sub-components and removes the old
		 * instances, if they exist.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #horizontalScrollBar
		 * @see #verticalScrollBar
		 * @see #horizontalScrollBarFactory
		 * @see #verticalScrollBarFactory
		 */
		protected createScrollBars():void
		{
			if(this.horizontalScrollBar)
			{
				this.horizontalScrollBar.removeEventListener(FeathersEventType.BEGIN_INTERACTION, this.horizontalScrollBar_beginInteractionHandler);
				this.horizontalScrollBar.removeEventListener(FeathersEventType.END_INTERACTION, this.horizontalScrollBar_endInteractionHandler);
				this.horizontalScrollBar.removeEventListener(Event.CHANGE, this.horizontalScrollBar_changeHandler);
				this.removeRawChildInternal(DisplayObject(this.horizontalScrollBar), true);
				this.horizontalScrollBar = null;
			}
			if(this.verticalScrollBar)
			{
				this.verticalScrollBar.removeEventListener(FeathersEventType.BEGIN_INTERACTION, this.verticalScrollBar_beginInteractionHandler);
				this.verticalScrollBar.removeEventListener(FeathersEventType.END_INTERACTION, this.verticalScrollBar_endInteractionHandler);
				this.verticalScrollBar.removeEventListener(Event.CHANGE, this.verticalScrollBar_changeHandler);
				this.removeRawChildInternal(DisplayObject(this.verticalScrollBar), true);
				this.verticalScrollBar = null;
			}

			if(this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_NONE &&
				this._horizontalScrollPolicy != Scroller.SCROLL_POLICY_OFF && this._horizontalScrollBarFactory != null)
			{
				this.horizontalScrollBar = this.IScrollBar(this._horizontalScrollBarFactory());
				if(this.horizontalScrollBar instanceof this.IDirectionalScrollBar)
				{
					this.IDirectionalScrollBar(this.horizontalScrollBar).direction = this.SimpleScrollBar.DIRECTION_HORIZONTAL;
				}
				var horizontalScrollBarStyleName:string = this._customHorizontalScrollBarStyleName != null ? this._customHorizontalScrollBarStyleName : this.horizontalScrollBarStyleName;
				this.horizontalScrollBar.styleNameList.add(horizontalScrollBarStyleName);
				this.horizontalScrollBar.addEventListener(Event.CHANGE, this.horizontalScrollBar_changeHandler);
				this.horizontalScrollBar.addEventListener(FeathersEventType.BEGIN_INTERACTION, this.horizontalScrollBar_beginInteractionHandler);
				this.horizontalScrollBar.addEventListener(FeathersEventType.END_INTERACTION, this.horizontalScrollBar_endInteractionHandler);
				this.addRawChildInternal(DisplayObject(this.horizontalScrollBar));
			}
			if(this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_NONE &&
				this._verticalScrollPolicy != Scroller.SCROLL_POLICY_OFF && this._verticalScrollBarFactory != null)
			{
				this.verticalScrollBar = this.IScrollBar(this._verticalScrollBarFactory());
				if(this.verticalScrollBar instanceof this.IDirectionalScrollBar)
				{
					this.IDirectionalScrollBar(this.verticalScrollBar).direction = this.SimpleScrollBar.DIRECTION_VERTICAL;
				}
				var verticalScrollBarStyleName:string = this._customVerticalScrollBarStyleName != null ? this._customVerticalScrollBarStyleName : this.verticalScrollBarStyleName;
				this.verticalScrollBar.styleNameList.add(verticalScrollBarStyleName);
				this.verticalScrollBar.addEventListener(Event.CHANGE, this.verticalScrollBar_changeHandler);
				this.verticalScrollBar.addEventListener(FeathersEventType.BEGIN_INTERACTION, this.verticalScrollBar_beginInteractionHandler);
				this.verticalScrollBar.addEventListener(FeathersEventType.END_INTERACTION, this.verticalScrollBar_endInteractionHandler);
				this.addRawChildInternal(DisplayObject(this.verticalScrollBar));
			}
		}

		/**
		 * Choose the appropriate background skin based on the control's current
		 * state.
		 */
		protected refreshBackgroundSkin():void
		{
			var newCurrentBackgroundSkin:DisplayObject = this._backgroundSkin;
			if(!this._isEnabled && this._backgroundDisabledSkin)
			{
				newCurrentBackgroundSkin = this._backgroundDisabledSkin;
			}
			if(this.currentBackgroundSkin != newCurrentBackgroundSkin)
			{
				if(this.currentBackgroundSkin)
				{
					this.removeRawChildInternal(this.currentBackgroundSkin);
				}
				this.currentBackgroundSkin = newCurrentBackgroundSkin;
				if(this.currentBackgroundSkin)
				{
					this.addRawChildAtInternal(this.currentBackgroundSkin, 0);
				}
			}
			if(this.currentBackgroundSkin)
			{
				//force it to the bottom
				this.setRawChildIndexInternal(this.currentBackgroundSkin, 0);

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
		protected refreshScrollBarStyles():void
		{
			if(this.horizontalScrollBar)
			{
				for(var propertyName:string in this._horizontalScrollBarProperties)
				{
					var propertyValue:Object = this._horizontalScrollBarProperties[propertyName];
					this.horizontalScrollBar[propertyName] = propertyValue;
				}
				if(this._horizontalScrollBarHideTween)
				{
					Starling.juggler.remove(this._horizontalScrollBarHideTween);
					this._horizontalScrollBarHideTween = null;
				}
				this.horizontalScrollBar.alpha = this._scrollBarDisplayMode == Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT ? 0 : 1;
				this.horizontalScrollBar.touchable = this._interactionMode == Scroller.INTERACTION_MODE_MOUSE || this._interactionMode == Scroller.INTERACTION_MODE_TOUCH_AND_SCROLL_BARS;
			}
			if(this.verticalScrollBar)
			{
				for(propertyName in this._verticalScrollBarProperties)
				{
					propertyValue = this._verticalScrollBarProperties[propertyName];
					this.verticalScrollBar[propertyName] = propertyValue;
				}
				if(this._verticalScrollBarHideTween)
				{
					Starling.juggler.remove(this._verticalScrollBarHideTween);
					this._verticalScrollBarHideTween = null;
				}
				this.verticalScrollBar.alpha = this._scrollBarDisplayMode == Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT ? 0 : 1;
				this.verticalScrollBar.touchable = this._interactionMode == Scroller.INTERACTION_MODE_MOUSE || this._interactionMode == Scroller.INTERACTION_MODE_TOUCH_AND_SCROLL_BARS;
			}
		}

		/**
		 * @private
		 */
		protected refreshEnabled():void
		{
			if(this._viewPort)
			{
				this._viewPort.isEnabled = this._isEnabled;
			}
			if(this.horizontalScrollBar)
			{
				this.horizontalScrollBar.isEnabled = this._isEnabled;
			}
			if(this.verticalScrollBar)
			{
				this.verticalScrollBar.isEnabled = this._isEnabled;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected refreshFocusIndicator():void
		{
			if(this._focusIndicatorSkin)
			{
				if(this._hasFocus && this._showFocus)
				{
					if(this._focusIndicatorSkin.parent != this)
					{
						this.addRawChildInternal(this._focusIndicatorSkin);
					}
					else
					{
						this.setRawChildIndexInternal(this._focusIndicatorSkin, this.numRawChildrenInternal - 1);
					}
				}
				else if(this._focusIndicatorSkin.parent == this)
				{
					this.removeRawChildInternal(this._focusIndicatorSkin, false);
				}
				this._focusIndicatorSkin.x = this._focusPaddingLeft;
				this._focusIndicatorSkin.y = this._focusPaddingTop;
				this._focusIndicatorSkin.width = this.actualWidth - this._focusPaddingLeft - this._focusPaddingRight;
				this._focusIndicatorSkin.height = this.actualHeight - this._focusPaddingTop - this._focusPaddingBottom;
			}
		}

		/**
		 * @private
		 */
		protected refreshViewPortBoundsWithoutFixedScrollBars():void
		{
			var horizontalWidthOffset:number = this._leftViewPortOffset + this._rightViewPortOffset;
			var verticalHeightOffset:number = this._topViewPortOffset + this._bottomViewPortOffset;

			//if scroll bars are fixed, we're going to include the offsets even
			//if they may not be needed in the final pass. if not fixed, the
			//view port fills the entire bounds.
			this._viewPort.visibleWidth = this.explicitWidth - horizontalWidthOffset;
			this._viewPort.visibleHeight = this.explicitHeight - verticalHeightOffset;
			var minVisibleWidth:number = this._minWidth - horizontalWidthOffset;
			if(minVisibleWidth < 0)
			{
				minVisibleWidth = 0;
			}
			this._viewPort.minVisibleWidth = minVisibleWidth;
			this._viewPort.maxVisibleWidth = this._maxWidth - horizontalWidthOffset;
			var minVisibleHeight:number = this._minHeight - verticalHeightOffset;
			if(minVisibleHeight < 0)
			{
				minVisibleHeight = 0;
			}
			this._viewPort.minVisibleHeight = minVisibleHeight;
			this._viewPort.maxVisibleHeight = this._maxHeight - verticalHeightOffset;
			this._viewPort.horizontalScrollPosition = this._horizontalScrollPosition;
			this._viewPort.verticalScrollPosition = this._verticalScrollPosition;

			var oldIgnoreViewPortResizing:boolean = this.ignoreViewPortResizing;
			if(this._scrollBarDisplayMode == Scroller.SCROLL_BAR_DISPLAY_MODE_FIXED)
			{
				this.ignoreViewPortResizing = true;
			}
			this._viewPort.validate();
			this.ignoreViewPortResizing = oldIgnoreViewPortResizing;
		}

		/**
		 * @private
		 */
		protected refreshViewPortBoundsWithFixedScrollBars():void
		{
			var horizontalWidthOffset:number = this._leftViewPortOffset + this._rightViewPortOffset;
			var verticalHeightOffset:number = this._topViewPortOffset + this._bottomViewPortOffset;
			var needsWidthOrHeight:boolean = this.explicitWidth != this.explicitWidth ||
				this.explicitHeight !== this.explicitHeight; //isNaN
			if(!(this._measureViewPort && needsWidthOrHeight))
			{
				//if we didn't need to do any measurement, we would have skipped
				//setting this stuff earlier, and now is the last chance
				var minVisibleWidth:number = this._minWidth - horizontalWidthOffset;
				if(minVisibleWidth < 0)
				{
					minVisibleWidth = 0;
				}
				this._viewPort.minVisibleWidth = minVisibleWidth;
				this._viewPort.maxVisibleWidth = this._maxWidth - horizontalWidthOffset;
				var minVisibleHeight:number = this._minHeight - verticalHeightOffset;
				if(minVisibleHeight < 0)
				{
					minVisibleHeight = 0;
				}
				this._viewPort.minVisibleHeight = minVisibleHeight;
				this._viewPort.maxVisibleHeight = this._maxHeight - verticalHeightOffset;
				this._viewPort.horizontalScrollPosition = this._horizontalScrollPosition;
				this._viewPort.verticalScrollPosition = this._verticalScrollPosition;
			}
			this._viewPort.visibleWidth = this.actualWidth - horizontalWidthOffset;
			this._viewPort.visibleHeight = this.actualHeight - verticalHeightOffset;
			this._viewPort.validate();
		}

		/**
		 * @private
		 */
		protected refreshScrollValues():void
		{
			this.refreshScrollSteps();

			var oldMaxHSP:number = this._maxHorizontalScrollPosition;
			var oldMaxVSP:number = this._maxVerticalScrollPosition;
			this.refreshMinAndMaxScrollPositions();
			var maximumPositionsChanged:boolean = this._maxHorizontalScrollPosition != oldMaxHSP || this._maxVerticalScrollPosition != oldMaxVSP;
			if(maximumPositionsChanged && this._touchPointID < 0)
			{
				this.clampScrollPositions();
			}

			this.refreshPageCount();
			this.refreshPageIndices();
		}

		/**
		 * @private
		 */
		protected clampScrollPositions():void
		{
			if(!this._horizontalAutoScrollTween)
			{
				if(this._snapToPages)
				{
					this._horizontalScrollPosition = roundToNearest(this._horizontalScrollPosition, this.actualPageWidth);
				}
				var targetHorizontalScrollPosition:number = this._horizontalScrollPosition;
				if(targetHorizontalScrollPosition < this._minHorizontalScrollPosition)
				{
					targetHorizontalScrollPosition = this._minHorizontalScrollPosition;
				}
				else if(targetHorizontalScrollPosition > this._maxHorizontalScrollPosition)
				{
					targetHorizontalScrollPosition = this._maxHorizontalScrollPosition;
				}
				this.horizontalScrollPosition = targetHorizontalScrollPosition;
			}
			if(!this._verticalAutoScrollTween)
			{
				if(this._snapToPages)
				{
					this._verticalScrollPosition = roundToNearest(this._verticalScrollPosition, this.actualPageHeight);
				}
				var targetVerticalScrollPosition:number = this._verticalScrollPosition;
				if(targetVerticalScrollPosition < this._minVerticalScrollPosition)
				{
					targetVerticalScrollPosition = this._minVerticalScrollPosition;
				}
				else if(targetVerticalScrollPosition > this._maxVerticalScrollPosition)
				{
					targetVerticalScrollPosition = this._maxVerticalScrollPosition;
				}
				this.verticalScrollPosition = targetVerticalScrollPosition;
			}
		}

		/**
		 * @private
		 */
		protected refreshScrollSteps():void
		{
			if(this.explicitHorizontalScrollStep !== this.explicitHorizontalScrollStep) //isNaN
			{
				if(this._viewPort)
				{
					this.actualHorizontalScrollStep = this._viewPort.horizontalScrollStep;
				}
				else
				{
					this.actualHorizontalScrollStep = 1;
				}
			}
			else
			{
				this.actualHorizontalScrollStep = this.explicitHorizontalScrollStep;
			}
			if(this.explicitVerticalScrollStep !== this.explicitVerticalScrollStep) //isNaN
			{
				if(this._viewPort)
				{
					this.actualVerticalScrollStep = this._viewPort.verticalScrollStep;
				}
				else
				{
					this.actualVerticalScrollStep = 1;
				}
			}
			else
			{
				this.actualVerticalScrollStep = this.explicitVerticalScrollStep;
			}
		}

		/**
		 * @private
		 */
		protected refreshMinAndMaxScrollPositions():void
		{
			var visibleViewPortWidth:number = this.actualWidth - (this._leftViewPortOffset + this._rightViewPortOffset);
			var visibleViewPortHeight:number = this.actualHeight - (this._topViewPortOffset + this._bottomViewPortOffset);
			if(this.explicitPageWidth !== this.explicitPageWidth) //isNaN
			{
				this.actualPageWidth = visibleViewPortWidth;
			}
			if(this.explicitPageHeight !== this.explicitPageHeight) //isNaN
			{
				this.actualPageHeight = visibleViewPortHeight;
			}
			if(this._viewPort)
			{
				this._minHorizontalScrollPosition = this._viewPort.contentX;
				if(this._viewPort.width == Number.POSITIVE_INFINITY)
				{
					//we don't want to risk the possibility of negative infinity
					//being added to positive infinity. the result is NaN.
					this._maxHorizontalScrollPosition = Number.POSITIVE_INFINITY;
				}
				else
				{
					this._maxHorizontalScrollPosition = this._minHorizontalScrollPosition + this._viewPort.width - visibleViewPortWidth;
				}
				if(this._maxHorizontalScrollPosition < this._minHorizontalScrollPosition)
				{
					this._maxHorizontalScrollPosition = this._minHorizontalScrollPosition;
				}
				this._minVerticalScrollPosition = this._viewPort.contentY;
				if(this._viewPort.height == Number.POSITIVE_INFINITY)
				{
					//we don't want to risk the possibility of negative infinity
					//being added to positive infinity. the result is NaN.
					this._maxVerticalScrollPosition = Number.POSITIVE_INFINITY;
				}
				else
				{
					this._maxVerticalScrollPosition = this._minVerticalScrollPosition + this._viewPort.height - visibleViewPortHeight;
				}
				if(this._maxVerticalScrollPosition < this._minVerticalScrollPosition)
				{
					this._maxVerticalScrollPosition =  this._minVerticalScrollPosition;
				}
				if(this._snapScrollPositionsToPixels)
				{
					this._minHorizontalScrollPosition = Math.round(this._minHorizontalScrollPosition);
					this._minVerticalScrollPosition = Math.round(this._minVerticalScrollPosition);
					this._maxHorizontalScrollPosition = Math.round(this._maxHorizontalScrollPosition);
					this._maxVerticalScrollPosition = Math.round(this._maxVerticalScrollPosition);
				}
			}
			else
			{
				this._minHorizontalScrollPosition = 0;
				this._minVerticalScrollPosition = 0;
				this._maxHorizontalScrollPosition = 0;
				this._maxVerticalScrollPosition = 0;
			}
		}

		/**
		 * @private
		 */
		protected refreshPageCount():void
		{
			if(this._snapToPages)
			{
				var horizontalScrollRange:number = this._maxHorizontalScrollPosition - this._minHorizontalScrollPosition;
				if(horizontalScrollRange == Number.POSITIVE_INFINITY)
				{
					//trying to put positive infinity into an int results in 0
					//so we need a special case to provide a large int value.
					if(this._minHorizontalScrollPosition == Number.NEGATIVE_INFINITY)
					{
						this._minHorizontalPageIndex = int.MIN_VALUE;
					}
					else
					{
						this._minHorizontalPageIndex = 0;
					}
					this._maxHorizontalPageIndex = int.MAX_VALUE;
				}
				else
				{
					this._minHorizontalPageIndex = 0;
					this._maxHorizontalPageIndex = Math.ceil(horizontalScrollRange / this.actualPageWidth);
				}

				var verticalScrollRange:number = this._maxVerticalScrollPosition - this._minVerticalScrollPosition;
				if(verticalScrollRange == Number.POSITIVE_INFINITY)
				{
					//trying to put positive infinity into an int results in 0
					//so we need a special case to provide a large int value.
					if(this._minVerticalScrollPosition == Number.NEGATIVE_INFINITY)
					{
						this._minVerticalPageIndex = int.MIN_VALUE;
					}
					else
					{
						this._minVerticalPageIndex = 0;
					}
					this._maxVerticalPageIndex = int.MAX_VALUE;
				}
				else
				{
					this._minVerticalPageIndex = 0;
					this._maxVerticalPageIndex = Math.ceil(verticalScrollRange / this.actualPageHeight);
				}
			}
			else
			{
				this._maxHorizontalPageIndex = 0;
				this._maxHorizontalPageIndex = 0;
				this._minVerticalPageIndex = 0;
				this._maxVerticalPageIndex = 0;
			}
		}

		/**
		 * @private
		 */
		protected refreshPageIndices():void
		{
			if(!this._horizontalAutoScrollTween && !this.hasPendingHorizontalPageIndex)
			{
				if(this._snapToPages)
				{
					if(this._horizontalScrollPosition == this._maxHorizontalScrollPosition)
					{
						this._horizontalPageIndex = this._maxHorizontalPageIndex;
					}
					else if(this._horizontalScrollPosition == this._minHorizontalScrollPosition)
					{
						this._horizontalPageIndex = this._minHorizontalPageIndex;
					}
					else if(this._minHorizontalScrollPosition == Number.NEGATIVE_INFINITY && this._horizontalScrollPosition < 0)
					{
						this._horizontalPageIndex = Math.floor(this._horizontalScrollPosition / this.actualPageWidth);
					}
					else if(this._maxHorizontalScrollPosition == Number.POSITIVE_INFINITY && this._horizontalScrollPosition >= 0)
					{
						this._horizontalPageIndex = Math.floor(this._horizontalScrollPosition / this.actualPageWidth);
					}
					else
					{
						var adjustedHorizontalScrollPosition:number = this._horizontalScrollPosition - this._minHorizontalScrollPosition;
						this._horizontalPageIndex = Math.floor(adjustedHorizontalScrollPosition / this.actualPageWidth);
					}
				}
				else
				{
					this._horizontalPageIndex = this._minHorizontalPageIndex;
				}
				if(this._horizontalPageIndex < this._minHorizontalPageIndex)
				{
					this._horizontalPageIndex = this._minHorizontalPageIndex;
				}
				if(this._horizontalPageIndex > this._maxHorizontalPageIndex)
				{
					this._horizontalPageIndex = this._maxHorizontalPageIndex;
				}
			}
			if(!this._verticalAutoScrollTween && !this.hasPendingVerticalPageIndex)
			{
				if(this._snapToPages)
				{
					if(this._verticalScrollPosition == this._maxVerticalScrollPosition)
					{
						this._verticalPageIndex = this._maxVerticalPageIndex;
					}
					else if(this._verticalScrollPosition == this._minVerticalScrollPosition)
					{
						this._verticalPageIndex = this._minVerticalPageIndex;
					}
					else if(this._minVerticalScrollPosition == Number.NEGATIVE_INFINITY && this._verticalScrollPosition < 0)
					{
						this._verticalPageIndex = Math.floor(this._verticalScrollPosition / this.actualPageHeight);
					}
					else if(this._maxVerticalScrollPosition == Number.POSITIVE_INFINITY && this._verticalScrollPosition >= 0)
					{
						this._verticalPageIndex = Math.floor(this._verticalScrollPosition / this.actualPageHeight);
					}
					else
					{
						var adjustedVerticalScrollPosition:number = this._verticalScrollPosition - this._minVerticalScrollPosition;
						this._verticalPageIndex = Math.floor(adjustedVerticalScrollPosition / this.actualPageHeight);
					}
				}
				else
				{
					this._verticalPageIndex = this._minVerticalScrollPosition;
				}
				if(this._verticalPageIndex < this._minVerticalScrollPosition)
				{
					this._verticalPageIndex = this._minVerticalScrollPosition;
				}
				if(this._verticalPageIndex > this._maxVerticalPageIndex)
				{
					this._verticalPageIndex = this._maxVerticalPageIndex;
				}
			}
		}

		/**
		 * @private
		 */
		protected refreshScrollBarValues():void
		{
			if(this.horizontalScrollBar)
			{
				this.horizontalScrollBar.minimum = this._minHorizontalScrollPosition;
				this.horizontalScrollBar.maximum = this._maxHorizontalScrollPosition;
				this.horizontalScrollBar.value = this._horizontalScrollPosition;
				this.horizontalScrollBar.page = (this._maxHorizontalScrollPosition - this._minHorizontalScrollPosition) * this.actualPageWidth / this._viewPort.width;
				this.horizontalScrollBar.step = this.actualHorizontalScrollStep;
			}

			if(this.verticalScrollBar)
			{
				this.verticalScrollBar.minimum = this._minVerticalScrollPosition;
				this.verticalScrollBar.maximum = this._maxVerticalScrollPosition;
				this.verticalScrollBar.value = this._verticalScrollPosition;
				this.verticalScrollBar.page = (this._maxVerticalScrollPosition - this._minVerticalScrollPosition) * this.actualPageHeight / this._viewPort.height;
				this.verticalScrollBar.step = this.actualVerticalScrollStep;
			}
		}

		/**
		 * @private
		 */
		protected showOrHideChildren():void
		{
			var isFixed:boolean = this._scrollBarDisplayMode == Scroller.SCROLL_BAR_DISPLAY_MODE_FIXED;
			var childCount:number = this.numRawChildrenInternal;
			if(this.verticalScrollBar)
			{
				this.verticalScrollBar.visible = !isFixed || this._hasVerticalScrollBar;
				this.setRawChildIndexInternal(DisplayObject(this.verticalScrollBar), childCount - 1);
			}
			if(this.horizontalScrollBar)
			{
				this.horizontalScrollBar.visible = !isFixed || this._hasHorizontalScrollBar;
				if(this.verticalScrollBar)
				{
					this.setRawChildIndexInternal(DisplayObject(this.horizontalScrollBar), childCount - 2);
				}
				else
				{
					this.setRawChildIndexInternal(DisplayObject(this.horizontalScrollBar), childCount - 1);
				}
			}
			if(this.currentBackgroundSkin)
			{
				if(this._autoHideBackground)
				{
					this.currentBackgroundSkin.visible = this._viewPort.width < this.actualWidth ||
						this._viewPort.height < this.actualHeight ||
						this._horizontalScrollPosition < 0 ||
						this._horizontalScrollPosition > this._maxHorizontalScrollPosition ||
						this._verticalScrollPosition < 0 ||
						this._verticalScrollPosition > this._maxVerticalScrollPosition;
				}
				else
				{
					this.currentBackgroundSkin.visible = true;
				}
			}

		}

		/**
		 * @private
		 */
		protected calculateViewPortOffsetsForFixedHorizontalScrollBar(forceScrollBars:boolean = false, useActualBounds:boolean = false):void
		{
			if(this.horizontalScrollBar && (this._measureViewPort || useActualBounds))
			{
				var scrollerWidth:number = useActualBounds ? this.actualWidth : this.explicitWidth;
				var totalWidth:number = this._viewPort.width + this._leftViewPortOffset + this._rightViewPortOffset;
				if(forceScrollBars || this._horizontalScrollPolicy == Scroller.SCROLL_POLICY_ON ||
					((totalWidth > scrollerWidth || totalWidth > this._maxWidth) &&
						this._horizontalScrollPolicy != Scroller.SCROLL_POLICY_OFF))
				{
					this._hasHorizontalScrollBar = true;
					this._bottomViewPortOffset += this.horizontalScrollBar.height;
				}
				else
				{
					this._hasHorizontalScrollBar = false;
				}
			}
			else
			{
				this._hasHorizontalScrollBar = false;
			}
		}

		/**
		 * @private
		 */
		protected calculateViewPortOffsetsForFixedVerticalScrollBar(forceScrollBars:boolean = false, useActualBounds:boolean = false):void
		{
			if(this.verticalScrollBar && (this._measureViewPort || useActualBounds))
			{
				var scrollerHeight:number = useActualBounds ? this.actualHeight : this.explicitHeight;
				var totalHeight:number = this._viewPort.height + this._topViewPortOffset + this._bottomViewPortOffset;
				if(forceScrollBars || this._verticalScrollPolicy == Scroller.SCROLL_POLICY_ON ||
					((totalHeight > scrollerHeight || totalHeight > this._maxHeight) &&
						this._verticalScrollPolicy != Scroller.SCROLL_POLICY_OFF))
				{
					this._hasVerticalScrollBar = true;
					if(this._verticalScrollBarPosition == Scroller.VERTICAL_SCROLL_BAR_POSITION_LEFT)
					{
						this._leftViewPortOffset += this.verticalScrollBar.width;
					}
					else
					{
						this._rightViewPortOffset += this.verticalScrollBar.width;
					}
				}
				else
				{
					this._hasVerticalScrollBar = false;
				}
			}
			else
			{
				this._hasVerticalScrollBar = false;
			}
		}

		/**
		 * @private
		 */
		protected calculateViewPortOffsets(forceScrollBars:boolean = false, useActualBounds:boolean = false):void
		{
			//in fixed mode, if we determine that scrolling is required, we
			//remember the offsets for later. if scrolling is not needed, then
			//we will ignore the offsets from here forward
			this._topViewPortOffset = this._paddingTop;
			this._rightViewPortOffset = this._paddingRight;
			this._bottomViewPortOffset = this._paddingBottom;
			this._leftViewPortOffset = this._paddingLeft;
			if(this._scrollBarDisplayMode == Scroller.SCROLL_BAR_DISPLAY_MODE_FIXED)
			{
				this.calculateViewPortOffsetsForFixedHorizontalScrollBar(forceScrollBars, useActualBounds);
				this.calculateViewPortOffsetsForFixedVerticalScrollBar(forceScrollBars, useActualBounds);
				//we need to double check the horizontal scroll bar because
				//adding a vertical scroll bar may require a horizontal one too.
				if(this._hasVerticalScrollBar && !this._hasHorizontalScrollBar)
				{
					this.calculateViewPortOffsetsForFixedHorizontalScrollBar(forceScrollBars, useActualBounds);
				}
			}
			else
			{
				this._hasHorizontalScrollBar = this._isDraggingHorizontally || this._horizontalAutoScrollTween;
				this._hasVerticalScrollBar = this._isDraggingVertically || this._verticalAutoScrollTween;
			}
		}

		/**
		 * @private
		 */
		protected refreshInteractionModeEvents():void
		{
			if(this._interactionMode == Scroller.INTERACTION_MODE_TOUCH || this._interactionMode == Scroller.INTERACTION_MODE_TOUCH_AND_SCROLL_BARS)
			{
				this.addEventListener(TouchEvent.TOUCH, this.scroller_touchHandler);
				if(!this._touchBlocker)
				{
					this._touchBlocker = new Quad(100, 100, 0xff00ff);
					this._touchBlocker.alpha = 0;
				}
			}
			else
			{
				this.removeEventListener(TouchEvent.TOUCH, this.scroller_touchHandler);
				if(this._touchBlocker)
				{
					this.removeRawChildInternal(this._touchBlocker, true);
					this._touchBlocker = null;
				}
			}

			if((this._interactionMode == Scroller.INTERACTION_MODE_MOUSE || this._interactionMode == Scroller.INTERACTION_MODE_TOUCH_AND_SCROLL_BARS) &&
				this._scrollBarDisplayMode == Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT)
			{
				if(this.horizontalScrollBar)
				{
					this.horizontalScrollBar.addEventListener(TouchEvent.TOUCH, this.horizontalScrollBar_touchHandler);
				}
				if(this.verticalScrollBar)
				{
					this.verticalScrollBar.addEventListener(TouchEvent.TOUCH, this.verticalScrollBar_touchHandler);
				}
			}
			else
			{
				if(this.horizontalScrollBar)
				{
					this.horizontalScrollBar.removeEventListener(TouchEvent.TOUCH, this.horizontalScrollBar_touchHandler);
				}
				if(this.verticalScrollBar)
				{
					this.verticalScrollBar.removeEventListener(TouchEvent.TOUCH, this.verticalScrollBar_touchHandler);
				}
			}
		}

		/**
		 * Positions and sizes children based on the actual width and height
		 * values.
		 */
		protected layoutChildren():void
		{
			if(this.currentBackgroundSkin)
			{
				this.currentBackgroundSkin.width = this.actualWidth;
				this.currentBackgroundSkin.height = this.actualHeight;
			}

			if(this.horizontalScrollBar)
			{
				this.horizontalScrollBar.validate();
			}
			if(this.verticalScrollBar)
			{
				this.verticalScrollBar.validate();
			}
			if(this._touchBlocker)
			{
				this._touchBlocker.x = this._leftViewPortOffset;
				this._touchBlocker.y = this._topViewPortOffset;
				this._touchBlocker.width = this._viewPort.visibleWidth;
				this._touchBlocker.height = this._viewPort.visibleHeight;
			}

			this._viewPort.x = this._leftViewPortOffset - this._horizontalScrollPosition;
			this._viewPort.y = this._topViewPortOffset - this._verticalScrollPosition;

			if(this.horizontalScrollBar)
			{
				this.horizontalScrollBar.x = this._leftViewPortOffset;
				this.horizontalScrollBar.y = this._topViewPortOffset + this._viewPort.visibleHeight;
				if(this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_FIXED)
				{
					this.horizontalScrollBar.y -= this.horizontalScrollBar.height;
					if((this._hasVerticalScrollBar || this._verticalScrollBarHideTween) && this.verticalScrollBar)
					{
						this.horizontalScrollBar.width = this._viewPort.visibleWidth - this.verticalScrollBar.width;
					}
					else
					{
						this.horizontalScrollBar.width = this._viewPort.visibleWidth;
					}
				}
				else
				{
					this.horizontalScrollBar.width = this._viewPort.visibleWidth;
				}
			}

			if(this.verticalScrollBar)
			{
				if(this._verticalScrollBarPosition == Scroller.VERTICAL_SCROLL_BAR_POSITION_LEFT)
				{
					this.verticalScrollBar.x = this._paddingLeft;
				}
				else
				{
					this.verticalScrollBar.x = this._leftViewPortOffset + this._viewPort.visibleWidth;
				}
				this.verticalScrollBar.y = this._topViewPortOffset;
				if(this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_FIXED)
				{
					this.verticalScrollBar.x -= this.verticalScrollBar.width;
					if((this._hasHorizontalScrollBar || this._horizontalScrollBarHideTween) && this.horizontalScrollBar)
					{
						this.verticalScrollBar.height = this._viewPort.visibleHeight - this.horizontalScrollBar.height;
					}
					else
					{
						this.verticalScrollBar.height = this._viewPort.visibleHeight;
					}
				}
				else
				{
					this.verticalScrollBar.height = this._viewPort.visibleHeight;
				}
			}
		}

		/**
		 * @private
		 */
		protected refreshClipRect():void
		{
			var hasElasticEdgesAndTouch:boolean = this._hasElasticEdges && (this._interactionMode == Scroller.INTERACTION_MODE_TOUCH || this._interactionMode == Scroller.INTERACTION_MODE_TOUCH_AND_SCROLL_BARS);
			var contentIsLargeEnoughToScroll:boolean = this._maxHorizontalScrollPosition != this._minHorizontalScrollPosition || this._maxVerticalScrollPosition != this._minVerticalScrollPosition;
			if(this._clipContent && (hasElasticEdgesAndTouch || contentIsLargeEnoughToScroll))
			{
				if(!this._viewPort.clipRect)
				{
					this._viewPort.clipRect = new Rectangle();
				}

				var clipRect:Rectangle = this._viewPort.clipRect;
				clipRect.x = this._horizontalScrollPosition;
				clipRect.y = this._verticalScrollPosition;
				var clipWidth:number = this.actualWidth - this._leftViewPortOffset - this._rightViewPortOffset;
				if(clipWidth < 0)
				{
					clipWidth = 0;
				}
				clipRect.width = clipWidth;
				var clipHeight:number = this.actualHeight - this._topViewPortOffset - this._bottomViewPortOffset;
				if(clipHeight < 0)
				{
					clipHeight = 0;
				}
				clipRect.height = clipHeight;
				this._viewPort.clipRect = clipRect;
			}
			else
			{
				this._viewPort.clipRect = null;
			}
		}

		/**
		 * @private
		 */
		protected get numRawChildrenInternal():number
		{
			if(this instanceof this.IScrollContainer)
			{
				return this.IScrollContainer(this).numRawChildren;
			}
			return this.numChildren;
		}

		/**
		 * @private
		 */
		protected addRawChildInternal(child:DisplayObject):DisplayObject
		{
			if(this instanceof this.IScrollContainer)
			{
				return this.IScrollContainer(this).addRawChild(child);
			}
			return this.addChild(child);
		}

		/**
		 * @private
		 */
		protected addRawChildAtInternal(child:DisplayObject, index:number):DisplayObject
		{
			if(this instanceof this.IScrollContainer)
			{
				return this.IScrollContainer(this).addRawChildAt(child, index);
			}
			return this.addChildAt(child, index);
		}

		/**
		 * @private
		 */
		protected removeRawChildInternal(child:DisplayObject, dispose:boolean = false):DisplayObject
		{
			if(this instanceof this.IScrollContainer)
			{
				return this.IScrollContainer(this).removeRawChild(child, dispose);
			}
			return this.removeChild(child, dispose);
		}

		/**
		 * @private
		 */
		protected removeRawChildAtInternal(index:number, dispose:boolean = false):DisplayObject
		{
			if(this instanceof this.IScrollContainer)
			{
				return this.IScrollContainer(this).removeRawChildAt(index, dispose);
			}
			return this.removeChildAt(index, dispose);
		}

		/**
		 * @private
		 */
		protected setRawChildIndexInternal(child:DisplayObject, index:number):void
		{
			if(this instanceof this.IScrollContainer)
			{
				this.IScrollContainer(this).setRawChildIndex(child, index);
				return;
			}
			this.setChildIndex(child, index);
		}

		/**
		 * @private
		 */
		protected updateHorizontalScrollFromTouchPosition(touchX:number):void
		{
			var offset:number = this._startTouchX - touchX;
			var position:number = this._startHorizontalScrollPosition + offset;
			if(position < this._minHorizontalScrollPosition)
			{
				if(this._hasElasticEdges)
				{
					position -= (position - this._minHorizontalScrollPosition) * (1 - this._elasticity);
				}
				else
				{
					position = this._minHorizontalScrollPosition;
				}
			}
			else if(position > this._maxHorizontalScrollPosition)
			{
				if(this._hasElasticEdges)
				{
					position -= (position - this._maxHorizontalScrollPosition) * (1 - this._elasticity);
				}
				else
				{
					position = this._maxHorizontalScrollPosition;
				}
			}
			this.horizontalScrollPosition = position;
		}

		/**
		 * @private
		 */
		protected updateVerticalScrollFromTouchPosition(touchY:number):void
		{
			var offset:number = this._startTouchY - touchY;
			var position:number = this._startVerticalScrollPosition + offset;
			if(position < this._minVerticalScrollPosition)
			{
				if(this._hasElasticEdges)
				{
					position -= (position - this._minVerticalScrollPosition) * (1 - this._elasticity);
				}
				else
				{
					position = this._minVerticalScrollPosition;
				}
			}
			else if(position > this._maxVerticalScrollPosition)
			{
				if(this._hasElasticEdges)
				{
					position -= (position - this._maxVerticalScrollPosition) * (1 - this._elasticity);
				}
				else
				{
					position = this._maxVerticalScrollPosition;
				}
			}
			this.verticalScrollPosition = position;
		}

		/**
		 * Immediately throws the scroller to the specified position, with
		 * optional animation. If you want to throw in only one direction, pass
		 * in <code>NaN</code> for the value that you do not want to change. The
		 * scroller should be validated before throwing.
		 *
		 * @see #scrollToPosition()
		 */
		protected throwTo(targetHorizontalScrollPosition:number = NaN, targetVerticalScrollPosition:number = NaN, duration:number = 0.5):void
		{
			var changedPosition:boolean = false;
			if(targetHorizontalScrollPosition === targetHorizontalScrollPosition) //!isNaN
			{
				if(this._snapToPages && targetHorizontalScrollPosition > this._minHorizontalScrollPosition &&
					targetHorizontalScrollPosition < this._maxHorizontalScrollPosition)
				{
					targetHorizontalScrollPosition = roundToNearest(targetHorizontalScrollPosition, this.actualPageWidth);
				}
				if(this._horizontalAutoScrollTween)
				{
					Starling.juggler.remove(this._horizontalAutoScrollTween);
					this._horizontalAutoScrollTween = null;
				}
				if(this._horizontalScrollPosition != targetHorizontalScrollPosition)
				{
					changedPosition = true;
					this.revealHorizontalScrollBar();
					this.startScroll();
					if(duration == 0)
					{
						this.horizontalScrollPosition = targetHorizontalScrollPosition;
					}
					else
					{
						this._startHorizontalScrollPosition = this._horizontalScrollPosition;
						this._targetHorizontalScrollPosition = targetHorizontalScrollPosition;
						this._horizontalAutoScrollTween = new Tween(this, duration, this._throwEase);
						this._horizontalAutoScrollTween.animate("horizontalScrollPosition", targetHorizontalScrollPosition);
						//warning: if you try to set onUpdate here, it may be
						//replaced elsewhere.
						this._horizontalAutoScrollTween.onComplete = this.horizontalAutoScrollTween_onComplete;
						Starling.juggler.add(this._horizontalAutoScrollTween);
						this.refreshHorizontalAutoScrollTweenEndRatio();
					}
				}
				else
				{
					this.finishScrollingHorizontally();
				}
			}

			if(targetVerticalScrollPosition === targetVerticalScrollPosition) //!isNaN
			{
				if(this._snapToPages && targetVerticalScrollPosition > this._minVerticalScrollPosition &&
					targetVerticalScrollPosition < this._maxVerticalScrollPosition)
				{
					targetVerticalScrollPosition = roundToNearest(targetVerticalScrollPosition, this.actualPageHeight);
				}
				if(this._verticalAutoScrollTween)
				{
					Starling.juggler.remove(this._verticalAutoScrollTween);
					this._verticalAutoScrollTween = null;
				}
				if(this._verticalScrollPosition != targetVerticalScrollPosition)
				{
					changedPosition = true;
					this.revealVerticalScrollBar();
					this.startScroll();
					if(duration == 0)
					{
						this.verticalScrollPosition = targetVerticalScrollPosition;
					}
					else
					{
						this._startVerticalScrollPosition = this._verticalScrollPosition;
						this._targetVerticalScrollPosition = targetVerticalScrollPosition;
						this._verticalAutoScrollTween = new Tween(this, duration, this._throwEase);
						this._verticalAutoScrollTween.animate("verticalScrollPosition", targetVerticalScrollPosition);
						//warning: if you try to set onUpdate here, it may be
						//replaced elsewhere.
						this._verticalAutoScrollTween.onComplete = this.verticalAutoScrollTween_onComplete;
						Starling.juggler.add(this._verticalAutoScrollTween);
						this.refreshVerticalAutoScrollTweenEndRatio();
					}
				}
				else
				{
					this.finishScrollingVertically();
				}
			}

			if(changedPosition && duration == 0)
			{
				this.completeScroll();
			}
		}

		/**
		 * Immediately throws the scroller to the specified page index, with
		 * optional animation. If you want to throw in only one direction, pass
		 * in the value from the <code>horizontalPageIndex</code> or
		 * <code>verticalPageIndex</code> property to the appropriate parameter.
		 * The scroller must be validated before throwing, to ensure that the
		 * minimum and maximum scroll positions are accurate.
		 *
		 * @see #scrollToPageIndex()
		 */
		protected throwToPage(targetHorizontalPageIndex:number, targetVerticalPageIndex:number, duration:number = 0.5):void
		{
			var targetHorizontalScrollPosition:number = this._horizontalScrollPosition;
			if(targetHorizontalPageIndex >= this._minHorizontalPageIndex)
			{
				targetHorizontalScrollPosition = this.actualPageWidth * targetHorizontalPageIndex;
			}
			if(targetHorizontalScrollPosition < this._minHorizontalScrollPosition)
			{
				targetHorizontalScrollPosition = this._minHorizontalScrollPosition;
			}
			if(targetHorizontalScrollPosition > this._maxHorizontalScrollPosition)
			{
				targetHorizontalScrollPosition = this._maxHorizontalScrollPosition;
			}
			var targetVerticalScrollPosition:number = this._verticalScrollPosition;
			if(targetVerticalPageIndex >= this._minVerticalPageIndex)
			{
				targetVerticalScrollPosition = this.actualPageHeight * targetVerticalPageIndex;
			}
			if(targetVerticalScrollPosition < this._minVerticalScrollPosition)
			{
				targetVerticalScrollPosition = this._minVerticalScrollPosition;
			}
			if(targetVerticalScrollPosition > this._maxVerticalScrollPosition)
			{
				targetVerticalScrollPosition = this._maxVerticalScrollPosition;
			}
			if(duration > 0)
			{
				this.throwTo(targetHorizontalScrollPosition, targetVerticalScrollPosition, duration);
			}
			else
			{
				this.horizontalScrollPosition = targetHorizontalScrollPosition;
				this.verticalScrollPosition = targetVerticalScrollPosition;
			}
			if(targetHorizontalPageIndex >= this._minHorizontalPageIndex)
			{
				this._horizontalPageIndex = targetHorizontalPageIndex;
			}
			if(targetVerticalPageIndex >= this._minVerticalPageIndex)
			{
				this._verticalPageIndex = targetVerticalPageIndex;
			}
		}

		/**
		 * @private
		 */
		protected calculateDynamicThrowDuration(pixelsPerMS:number):number
		{
			return (Math.log(Scroller.MINIMUM_VELOCITY / Math.abs(pixelsPerMS)) / this._logDecelerationRate) / 1000;
		}

		/**
		 * @private
		 */
		protected calculateThrowDistance(pixelsPerMS:number):number
		{
			return (pixelsPerMS - Scroller.MINIMUM_VELOCITY) / this._logDecelerationRate;
		}

		/**
		 * @private
		 */
		protected finishScrollingHorizontally():void
		{
			var targetHorizontalScrollPosition:number = NaN;
			if(this._horizontalScrollPosition < this._minHorizontalScrollPosition)
			{
				targetHorizontalScrollPosition = this._minHorizontalScrollPosition;
			}
			else if(this._horizontalScrollPosition > this._maxHorizontalScrollPosition)
			{
				targetHorizontalScrollPosition = this._maxHorizontalScrollPosition;
			}

			this._isDraggingHorizontally = false;
			if(targetHorizontalScrollPosition !== targetHorizontalScrollPosition) //isNaN
			{
				this.completeScroll();
			}
			else if(Math.abs(targetHorizontalScrollPosition - this._horizontalScrollPosition) < 1)
			{
				//this distance is too small to animate. just finish now.
				this.horizontalScrollPosition = targetHorizontalScrollPosition;
				this.completeScroll();
			}
			else
			{
				this.throwTo(targetHorizontalScrollPosition, NaN, this._elasticSnapDuration);
			}
		}

		/**
		 * @private
		 */
		protected finishScrollingVertically():void
		{
			var targetVerticalScrollPosition:number = NaN;
			if(this._verticalScrollPosition < this._minVerticalScrollPosition)
			{
				targetVerticalScrollPosition = this._minVerticalScrollPosition;
			}
			else if(this._verticalScrollPosition > this._maxVerticalScrollPosition)
			{
				targetVerticalScrollPosition = this._maxVerticalScrollPosition;
			}

			this._isDraggingVertically = false;
			if(targetVerticalScrollPosition !== targetVerticalScrollPosition) //isNaN
			{
				this.completeScroll();
			}
			else if(Math.abs(targetVerticalScrollPosition - this._verticalScrollPosition) < 1)
			{
				//this distance is too small to animate. just finish now.
				this.verticalScrollPosition = targetVerticalScrollPosition;
				this.completeScroll();
			}
			else
			{
				this.throwTo(NaN, targetVerticalScrollPosition, this._elasticSnapDuration);
			}
		}

		/**
		 * @private
		 */
		protected throwHorizontally(pixelsPerMS:number):void
		{
			if(this._snapToPages && !this._snapOnComplete)
			{
				var inchesPerSecond:number = 1000 * pixelsPerMS / (DeviceCapabilities.dpi / Starling.contentScaleFactor);
				if(inchesPerSecond > this._minimumPageThrowVelocity)
				{
					var snappedPageHorizontalScrollPosition:number = roundDownToNearest(this._horizontalScrollPosition, this.actualPageWidth);
				}
				else if(inchesPerSecond < -this._minimumPageThrowVelocity)
				{
					snappedPageHorizontalScrollPosition = roundUpToNearest(this._horizontalScrollPosition, this.actualPageWidth);
				}
				else
				{
					var lastPageWidth:number = this._maxHorizontalScrollPosition % this.actualPageWidth;
					var startOfLastPage:number = this._maxHorizontalScrollPosition - lastPageWidth;
					if(lastPageWidth < this.actualPageWidth && this._horizontalScrollPosition >= startOfLastPage)
					{
						var lastPagePosition:number = this._horizontalScrollPosition - startOfLastPage;
						if(inchesPerSecond > this._minimumPageThrowVelocity)
						{
							snappedPageHorizontalScrollPosition = startOfLastPage + roundDownToNearest(lastPagePosition, lastPageWidth);
						}
						else if(inchesPerSecond < -this._minimumPageThrowVelocity)
						{
							snappedPageHorizontalScrollPosition = startOfLastPage + roundUpToNearest(lastPagePosition, lastPageWidth);
						}
						else
						{
							snappedPageHorizontalScrollPosition = startOfLastPage + roundToNearest(lastPagePosition, lastPageWidth);
						}
					}
					else
					{
						snappedPageHorizontalScrollPosition = roundToNearest(this._horizontalScrollPosition, this.actualPageWidth);
					}
				}
				if(snappedPageHorizontalScrollPosition < this._minHorizontalScrollPosition)
				{
					snappedPageHorizontalScrollPosition = this._minHorizontalScrollPosition;
				}
				else if(snappedPageHorizontalScrollPosition > this._maxHorizontalScrollPosition)
				{
					snappedPageHorizontalScrollPosition = this._maxHorizontalScrollPosition;
				}
				if(snappedPageHorizontalScrollPosition == this._maxHorizontalScrollPosition)
				{
					var targetHorizontalPageIndex:number = this._maxHorizontalPageIndex;
				}
				else
				{
					if(this._minHorizontalScrollPosition == Number.NEGATIVE_INFINITY)
					{
						targetHorizontalPageIndex = snappedPageHorizontalScrollPosition / this.actualPageWidth;
					}
					else
					{
						targetHorizontalPageIndex = (snappedPageHorizontalScrollPosition - this._minHorizontalScrollPosition) / this.actualPageWidth;
					}
				}
				this.throwToPage(targetHorizontalPageIndex, -1, this._pageThrowDuration);
				return;
			}

			var absPixelsPerMS:number = Math.abs(pixelsPerMS);
			if(!this._snapToPages && absPixelsPerMS <= Scroller.MINIMUM_VELOCITY)
			{
				this.finishScrollingHorizontally();
				return;
			}

			var duration:number = this._fixedThrowDuration;
			if(!this._useFixedThrowDuration)
			{
				duration = this.calculateDynamicThrowDuration(pixelsPerMS);
			}
			this.throwTo(this._horizontalScrollPosition + this.calculateThrowDistance(pixelsPerMS), NaN, duration);
		}

		/**
		 * @private
		 */
		protected throwVertically(pixelsPerMS:number):void
		{
			if(this._snapToPages && !this._snapOnComplete)
			{
				var inchesPerSecond:number = 1000 * pixelsPerMS / (DeviceCapabilities.dpi / Starling.contentScaleFactor);
				if(inchesPerSecond > this._minimumPageThrowVelocity)
				{
					var snappedPageVerticalScrollPosition:number = roundDownToNearest(this._verticalScrollPosition, this.actualPageHeight);
				}
				else if(inchesPerSecond < -this._minimumPageThrowVelocity)
				{
					snappedPageVerticalScrollPosition = roundUpToNearest(this._verticalScrollPosition, this.actualPageHeight);
				}
				else
				{
					var lastPageHeight:number = this._maxVerticalScrollPosition % this.actualPageHeight;
					var startOfLastPage:number = this._maxVerticalScrollPosition - lastPageHeight;
					if(lastPageHeight < this.actualPageHeight && this._verticalScrollPosition >= startOfLastPage)
					{
						var lastPagePosition:number = this._verticalScrollPosition - startOfLastPage;
						if(inchesPerSecond > this._minimumPageThrowVelocity)
						{
							snappedPageVerticalScrollPosition = startOfLastPage + roundDownToNearest(lastPagePosition, lastPageHeight);
						}
						else if(inchesPerSecond < -this._minimumPageThrowVelocity)
						{
							snappedPageVerticalScrollPosition = startOfLastPage + roundUpToNearest(lastPagePosition, lastPageHeight);
						}
						else
						{
							snappedPageVerticalScrollPosition = startOfLastPage + roundToNearest(lastPagePosition, lastPageHeight);
						}
					}
					else
					{
						snappedPageVerticalScrollPosition = roundToNearest(this._verticalScrollPosition, this.actualPageHeight);
					}
				}
				if(snappedPageVerticalScrollPosition < this._minVerticalScrollPosition)
				{
					snappedPageVerticalScrollPosition = this._minVerticalScrollPosition;
				}
				else if(snappedPageVerticalScrollPosition > this._maxVerticalScrollPosition)
				{
					snappedPageVerticalScrollPosition = this._maxVerticalScrollPosition;
				}
				if(snappedPageVerticalScrollPosition == this._maxVerticalScrollPosition)
				{
					var targetVerticalPageIndex:number = this._maxVerticalPageIndex;
				}
				else
				{
					if(this._minVerticalScrollPosition == Number.NEGATIVE_INFINITY)
					{
						targetVerticalPageIndex = snappedPageVerticalScrollPosition / this.actualPageHeight;
					}
					else
					{
						targetVerticalPageIndex = (snappedPageVerticalScrollPosition - this._minVerticalScrollPosition) / this.actualPageHeight;
					}
				}
				this.throwToPage(-1, targetVerticalPageIndex, this._pageThrowDuration);
				return;
			}

			var absPixelsPerMS:number = Math.abs(pixelsPerMS);
			if(!this._snapToPages && absPixelsPerMS <= Scroller.MINIMUM_VELOCITY)
			{
				this.finishScrollingVertically();
				return;
			}

			var duration:number = this._fixedThrowDuration;
			if(!this._useFixedThrowDuration)
			{
				duration = this.calculateDynamicThrowDuration(pixelsPerMS);
			}
			this.throwTo(NaN, this._verticalScrollPosition + this.calculateThrowDistance(pixelsPerMS), duration);
		}

		/**
		 * @private
		 */
		protected onHorizontalAutoScrollTweenUpdate():void
		{
			var ratio:number = this._horizontalAutoScrollTween.transitionFunc(this._horizontalAutoScrollTween.currentTime / this._horizontalAutoScrollTween.totalTime);
			if(ratio >= this._horizontalAutoScrollTweenEndRatio)
			{
				if(!this._hasElasticEdges)
				{
					if(this._horizontalScrollPosition < this._minHorizontalScrollPosition)
					{
						this._horizontalScrollPosition = this._minHorizontalScrollPosition;
					}
					else if(this._horizontalScrollPosition > this._maxHorizontalScrollPosition)
					{
						this._horizontalScrollPosition = this._maxHorizontalScrollPosition;
					}
				}
				Starling.juggler.remove(this._horizontalAutoScrollTween);
				this._horizontalAutoScrollTween = null;
				this.finishScrollingHorizontally();
			}
		}

		/**
		 * @private
		 */
		protected onVerticalAutoScrollTweenUpdate():void
		{
			var ratio:number = this._verticalAutoScrollTween.transitionFunc(this._verticalAutoScrollTween.currentTime / this._verticalAutoScrollTween.totalTime);
			if(ratio >= this._verticalAutoScrollTweenEndRatio)
			{
				if(!this._hasElasticEdges)
				{
					if(this._verticalScrollPosition < this._minVerticalScrollPosition)
					{
						this._verticalScrollPosition = this._minVerticalScrollPosition;
					}
					else if(this._verticalScrollPosition > this._maxVerticalScrollPosition)
					{
						this._verticalScrollPosition = this._maxVerticalScrollPosition;
					}
				}
				Starling.juggler.remove(this._verticalAutoScrollTween);
				this._verticalAutoScrollTween = null;
				this.finishScrollingVertically();
			}
		}

		/**
		 * @private
		 */
		protected refreshHorizontalAutoScrollTweenEndRatio():void
		{
			var distance:number = Math.abs(this._targetHorizontalScrollPosition - this._startHorizontalScrollPosition);
			var ratioOutOfBounds:number = 0;
			if(this._targetHorizontalScrollPosition > this._maxHorizontalScrollPosition)
			{
				ratioOutOfBounds = (this._targetHorizontalScrollPosition - this._maxHorizontalScrollPosition) / distance;
			}
			else if(this._targetHorizontalScrollPosition < this._minHorizontalScrollPosition)
			{
				ratioOutOfBounds = (this._minHorizontalScrollPosition - this._targetHorizontalScrollPosition) / distance;
			}
			if(ratioOutOfBounds > 0)
			{
				if(this._hasElasticEdges)
				{
					this._horizontalAutoScrollTweenEndRatio = (1 - ratioOutOfBounds) + (ratioOutOfBounds * this._throwElasticity);
				}
				else
				{
					this._horizontalAutoScrollTweenEndRatio = 1 - ratioOutOfBounds;
				}
			}
			else
			{
				this._horizontalAutoScrollTweenEndRatio = 1;
			}
			if(this._horizontalAutoScrollTween)
			{
				if(this._horizontalAutoScrollTweenEndRatio < 1)
				{
					this._horizontalAutoScrollTween.onUpdate = this.onHorizontalAutoScrollTweenUpdate;
				}
				else
				{
					this._horizontalAutoScrollTween.onUpdate = null;
				}
			}
		}

		/**
		 * @private
		 */
		protected refreshVerticalAutoScrollTweenEndRatio():void
		{
			var distance:number = Math.abs(this._targetVerticalScrollPosition - this._startVerticalScrollPosition);
			var ratioOutOfBounds:number = 0;
			if(this._targetVerticalScrollPosition > this._maxVerticalScrollPosition)
			{
				ratioOutOfBounds = (this._targetVerticalScrollPosition - this._maxVerticalScrollPosition) / distance;
			}
			else if(this._targetVerticalScrollPosition < this._minVerticalScrollPosition)
			{
				ratioOutOfBounds = (this._minVerticalScrollPosition - this._targetVerticalScrollPosition) / distance;
			}
			if(ratioOutOfBounds > 0)
			{
				if(this._hasElasticEdges)
				{
					this._verticalAutoScrollTweenEndRatio = (1 - ratioOutOfBounds) + (ratioOutOfBounds * this._throwElasticity);
				}
				else
				{
					this._verticalAutoScrollTweenEndRatio = 1 - ratioOutOfBounds;
				}
			}
			else
			{
				this._verticalAutoScrollTweenEndRatio = 1;
			}
			if(this._verticalAutoScrollTween)
			{
				if(this._verticalAutoScrollTweenEndRatio < 1)
				{
					this._verticalAutoScrollTween.onUpdate = this.onVerticalAutoScrollTweenUpdate;
				}
				else
				{
					this._verticalAutoScrollTween.onUpdate = null;
				}
			}
		}

		/**
		 * @private
		 */
		protected hideHorizontalScrollBar(delay:number = 0):void
		{
			if(!this.horizontalScrollBar || this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT || this._horizontalScrollBarHideTween)
			{
				return;
			}
			if(this.horizontalScrollBar.alpha == 0)
			{
				return;
			}
			if(this._hideScrollBarAnimationDuration == 0 && delay == 0)
			{
				this.horizontalScrollBar.alpha = 0;
			}
			else
			{
				this._horizontalScrollBarHideTween = new Tween(this.horizontalScrollBar, this._hideScrollBarAnimationDuration, this._hideScrollBarAnimationEase);
				this._horizontalScrollBarHideTween.fadeTo(0);
				this._horizontalScrollBarHideTween.delay = delay;
				this._horizontalScrollBarHideTween.onComplete = this.horizontalScrollBarHideTween_onComplete;
				Starling.juggler.add(this._horizontalScrollBarHideTween);
			}
		}

		/**
		 * @private
		 */
		protected hideVerticalScrollBar(delay:number = 0):void
		{
			if(!this.verticalScrollBar || this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT || this._verticalScrollBarHideTween)
			{
				return;
			}
			if(this.verticalScrollBar.alpha == 0)
			{
				return;
			}
			if(this._hideScrollBarAnimationDuration == 0 && delay == 0)
			{
				this.verticalScrollBar.alpha = 0;
			}
			else
			{
				this._verticalScrollBarHideTween = new Tween(this.verticalScrollBar, this._hideScrollBarAnimationDuration, this._hideScrollBarAnimationEase);
				this._verticalScrollBarHideTween.fadeTo(0);
				this._verticalScrollBarHideTween.delay = delay;
				this._verticalScrollBarHideTween.onComplete = this.verticalScrollBarHideTween_onComplete;
				Starling.juggler.add(this._verticalScrollBarHideTween);
			}
		}

		/**
		 * @private
		 */
		protected revealHorizontalScrollBar():void
		{
			if(!this.horizontalScrollBar || this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT)
			{
				return;
			}
			if(this._horizontalScrollBarHideTween)
			{
				Starling.juggler.remove(this._horizontalScrollBarHideTween);
				this._horizontalScrollBarHideTween = null;
			}
			this.horizontalScrollBar.alpha = 1;
		}

		/**
		 * @private
		 */
		protected revealVerticalScrollBar():void
		{
			if(!this.verticalScrollBar || this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT)
			{
				return;
			}
			if(this._verticalScrollBarHideTween)
			{
				Starling.juggler.remove(this._verticalScrollBarHideTween);
				this._verticalScrollBarHideTween = null;
			}
			this.verticalScrollBar.alpha = 1;
		}

		/**
		 * If scrolling hasn't already started, prepares the scroller to scroll
		 * and dispatches <code>FeathersEventType.SCROLL_START</code>.
		 */
		protected startScroll():void
		{
			if(this._isScrolling)
			{
				return;
			}
			this._isScrolling = true;
			if(this._touchBlocker)
			{
				this.addRawChildInternal(this._touchBlocker);
			}
			this.dispatchEventWith(FeathersEventType.SCROLL_START);
		}

		/**
		 * Prepares the scroller for normal interaction and dispatches
		 * <code>FeathersEventType.SCROLL_COMPLETE</code>.
		 */
		protected completeScroll():void
		{
			if(!this._isScrolling || this._verticalAutoScrollTween || this._horizontalAutoScrollTween ||
				this._isDraggingHorizontally || this._isDraggingVertically ||
				this._horizontalScrollBarIsScrolling || this._verticalScrollBarIsScrolling)
			{
				return;
			}
			this._isScrolling = false;
			if(this._touchBlocker)
			{
				this.removeRawChildInternal(this._touchBlocker, false);
			}
			this.hideHorizontalScrollBar();
			this.hideVerticalScrollBar();
			//we validate to ensure that the final Event.SCROLL
			//dispatched before FeathersEventType.SCROLL_COMPLETE
			this.validate();
			this.dispatchEventWith(FeathersEventType.SCROLL_COMPLETE);
		}

		/**
		 * Scrolls to a pending scroll position, if required.
		 */
		protected handlePendingScroll():void
		{
			if(this.pendingHorizontalScrollPosition === this.pendingHorizontalScrollPosition ||
				this.pendingVerticalScrollPosition === this.pendingVerticalScrollPosition) //!isNaN
			{
				this.throwTo(this.pendingHorizontalScrollPosition, this.pendingVerticalScrollPosition, this.pendingScrollDuration);
				this.pendingHorizontalScrollPosition = NaN;
				this.pendingVerticalScrollPosition = NaN;
			}
			if(this.hasPendingHorizontalPageIndex && this.hasPendingVerticalPageIndex)
			{
				//both
				this.throwToPage(this.pendingHorizontalPageIndex, this.pendingVerticalPageIndex, this.pendingScrollDuration);
			}
			else if(this.hasPendingHorizontalPageIndex)
			{
				//horizontal only
				this.throwToPage(this.pendingHorizontalPageIndex, this._verticalPageIndex, this.pendingScrollDuration);
			}
			else if(this.hasPendingVerticalPageIndex)
			{
				//vertical only
				this.throwToPage(this._horizontalPageIndex, this.pendingVerticalPageIndex, this.pendingScrollDuration);
			}
			this.hasPendingHorizontalPageIndex = false;
			this.hasPendingVerticalPageIndex = false;
		}

		/**
		 * @private
		 */
		protected handlePendingRevealScrollBars():void
		{
			if(!this.isScrollBarRevealPending || this._scrollBarDisplayMode != Scroller.SCROLL_BAR_DISPLAY_MODE_FLOAT)
			{
				return;
			}
			this.revealHorizontalScrollBar();
			this.revealVerticalScrollBar();
			this.hideHorizontalScrollBar(this._revealScrollBarsDuration);
			this.hideVerticalScrollBar(this._revealScrollBarsDuration);
		}

		/**
		 * @private
		 */
		protected viewPort_resizeHandler(event:Event):void
		{
			if(this.ignoreViewPortResizing ||
				(this._viewPort.width == this._lastViewPortWidth && this._viewPort.height == this._lastViewPortHeight))
			{
				return;
			}
			this._lastViewPortWidth = this._viewPort.width;
			this._lastViewPortHeight = this._viewPort.height;
			if(this._isValidating)
			{
				this._hasViewPortBoundsChanged = true;
			}
			else
			{
				this.invalidate(this.INVALIDATION_FLAG_SIZE);
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
		protected verticalScrollBar_changeHandler(event:Event):void
		{
			this.verticalScrollPosition = this.verticalScrollBar.value;
		}

		/**
		 * @private
		 */
		protected horizontalScrollBar_changeHandler(event:Event):void
		{
			this.horizontalScrollPosition = this.horizontalScrollBar.value;
		}

		/**
		 * @private
		 */
		protected horizontalScrollBar_beginInteractionHandler(event:Event):void
		{
			this._horizontalScrollBarIsScrolling = true;
			this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
			this.startScroll();
		}

		/**
		 * @private
		 */
		protected horizontalScrollBar_endInteractionHandler(event:Event):void
		{
			this._horizontalScrollBarIsScrolling = false;
			this.dispatchEventWith(FeathersEventType.END_INTERACTION);
			this.completeScroll();
		}

		/**
		 * @private
		 */
		protected verticalScrollBar_beginInteractionHandler(event:Event):void
		{
			this._verticalScrollBarIsScrolling = true;
			this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
			this.startScroll();
		}

		/**
		 * @private
		 */
		protected verticalScrollBar_endInteractionHandler(event:Event):void
		{
			this._verticalScrollBarIsScrolling = false;
			this.dispatchEventWith(FeathersEventType.END_INTERACTION);
			this.completeScroll();
		}

		/**
		 * @private
		 */
		protected horizontalAutoScrollTween_onComplete():void
		{
			this._horizontalAutoScrollTween = null;
			this.finishScrollingHorizontally();
		}

		/**
		 * @private
		 */
		protected verticalAutoScrollTween_onComplete():void
		{
			this._verticalAutoScrollTween = null;
			this.finishScrollingVertically();
		}

		/**
		 * @private
		 */
		protected horizontalScrollBarHideTween_onComplete():void
		{
			this._horizontalScrollBarHideTween = null;
		}

		/**
		 * @private
		 */
		protected verticalScrollBarHideTween_onComplete():void
		{
			this._verticalScrollBarHideTween = null;
		}

		/**
		 * @private
		 */
		protected scroller_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}
			if(this._touchPointID >= 0)
			{
				return;
			}

			//any began touch is okay here. we don't need to check all touches.
			var touch:Touch = event.getTouch(this, TouchPhase.BEGAN);
			if(!touch)
			{
				return;
			}

			if(this._interactionMode == Scroller.INTERACTION_MODE_TOUCH_AND_SCROLL_BARS &&
				(event.interactsWith(DisplayObject(this.horizontalScrollBar)) || event.interactsWith(DisplayObject(this.verticalScrollBar))))
			{
				return;
			}

			touch.getLocation(this, Scroller.HELPER_POINT);
			var touchX:number = Scroller.HELPER_POINT.x;
			var touchY:number = Scroller.HELPER_POINT.y;
			if(touchX < this._leftViewPortOffset || touchY < this._topViewPortOffset ||
				touchX >= this.actualWidth - this._rightViewPortOffset ||
				touchY >= this.actualHeight - this._bottomViewPortOffset)
			{
				return;
			}

			var exclusiveTouch:ExclusiveTouch = ExclusiveTouch.forStage(this.stage);
			if(exclusiveTouch.getClaim(touch.id))
			{
				//already claimed
				return;
			}

			//if the scroll policy is off, we shouldn't stop this animation
			if(this._horizontalAutoScrollTween && this._horizontalScrollPolicy != Scroller.SCROLL_POLICY_OFF)
			{
				Starling.juggler.remove(this._horizontalAutoScrollTween);
				this._horizontalAutoScrollTween = null;
				if(this._isScrolling)
				{
					//immediately start dragging, since it was scrolling already
					this._isDraggingHorizontally = true;
				}
			}
			if(this._verticalAutoScrollTween && this._verticalScrollPolicy != Scroller.SCROLL_POLICY_OFF)
			{
				Starling.juggler.remove(this._verticalAutoScrollTween);
				this._verticalAutoScrollTween = null;
				if(this._isScrolling)
				{
					//immediately start dragging, since it was scrolling already
					this._isDraggingVertically = true;
				}
			}

			this._touchPointID = touch.id;
			this._velocityX = 0;
			this._velocityY = 0;
			this._previousVelocityX.length = 0;
			this._previousVelocityY.length = 0;
			this._previousTouchTime = getTimer();
			this._previousTouchX = this._startTouchX = this._currentTouchX = touchX;
			this._previousTouchY = this._startTouchY = this._currentTouchY = touchY;
			this._startHorizontalScrollPosition = this._horizontalScrollPosition;
			this._startVerticalScrollPosition = this._verticalScrollPosition;
			this._isScrollingStopped = false;

			this.addEventListener(Event.ENTER_FRAME, this.scroller_enterFrameHandler);

			//we need to listen on the stage because if we scroll the bottom or
			//right edge past the top of the scroller, it gets stuck and we stop
			//receiving touch events for "this".
			this.stage.addEventListener(TouchEvent.TOUCH, this.stage_touchHandler);

			if(this._isScrolling && (this._isDraggingHorizontally || this._isDraggingVertically))
			{
				exclusiveTouch.claimTouch(this._touchPointID, this);
			}
			else
			{
				exclusiveTouch.addEventListener(Event.CHANGE, this.exclusiveTouch_changeHandler);
			}
		}

		/**
		 * @private
		 */
		protected scroller_enterFrameHandler(event:Event):void
		{
			if(this._isScrollingStopped)
			{
				return;
			}
			var now:number = getTimer();
			var timeOffset:number = now - this._previousTouchTime;
			if(timeOffset > 0)
			{
				//we're keeping previous velocity updates to improve accuracy
				this._previousVelocityX[this._previousVelocityX.length] = this._velocityX;
				if(this._previousVelocityX.length > Scroller.MAXIMUM_SAVED_VELOCITY_COUNT)
				{
					this._previousVelocityX.shift();
				}
				this._previousVelocityY[this._previousVelocityY.length] = this._velocityY;
				if(this._previousVelocityY.length > Scroller.MAXIMUM_SAVED_VELOCITY_COUNT)
				{
					this._previousVelocityY.shift();
				}
				this._velocityX = (this._currentTouchX - this._previousTouchX) / timeOffset;
				this._velocityY = (this._currentTouchY - this._previousTouchY) / timeOffset;
				this._previousTouchTime = now;
				this._previousTouchX = this._currentTouchX;
				this._previousTouchY = this._currentTouchY;
			}
			var horizontalInchesMoved:number = Math.abs(this._currentTouchX - this._startTouchX) / (DeviceCapabilities.dpi / Starling.contentScaleFactor);
			var verticalInchesMoved:number = Math.abs(this._currentTouchY - this._startTouchY) / (DeviceCapabilities.dpi / Starling.contentScaleFactor);
			if((this._horizontalScrollPolicy == Scroller.SCROLL_POLICY_ON ||
				(this._horizontalScrollPolicy == Scroller.SCROLL_POLICY_AUTO && this._minHorizontalScrollPosition != this._maxHorizontalScrollPosition)) &&
				!this._isDraggingHorizontally && horizontalInchesMoved >= this._minimumDragDistance)
			{
				if(this.horizontalScrollBar)
				{
					this.revealHorizontalScrollBar();
				}
				this._startTouchX = this._currentTouchX;
				this._startHorizontalScrollPosition = this._horizontalScrollPosition;
				this._isDraggingHorizontally = true;
				//if we haven't already started dragging in the other direction,
				//we need to dispatch the event that says we're starting.
				if(!this._isDraggingVertically)
				{
					this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
					var exclusiveTouch:ExclusiveTouch = ExclusiveTouch.forStage(this.stage);
					exclusiveTouch.removeEventListener(Event.CHANGE, this.exclusiveTouch_changeHandler);
					exclusiveTouch.claimTouch(this._touchPointID, this);
					this.startScroll();
				}
			}
			if((this._verticalScrollPolicy == Scroller.SCROLL_POLICY_ON ||
				(this._verticalScrollPolicy == Scroller.SCROLL_POLICY_AUTO && this._minVerticalScrollPosition != this._maxVerticalScrollPosition)) &&
				!this._isDraggingVertically && verticalInchesMoved >= this._minimumDragDistance)
			{
				if(this.verticalScrollBar)
				{
					this.revealVerticalScrollBar();
				}
				this._startTouchY = this._currentTouchY;
				this._startVerticalScrollPosition = this._verticalScrollPosition;
				this._isDraggingVertically = true;
				if(!this._isDraggingHorizontally)
				{
					exclusiveTouch = ExclusiveTouch.forStage(this.stage);
					exclusiveTouch.removeEventListener(Event.CHANGE, this.exclusiveTouch_changeHandler);
					exclusiveTouch.claimTouch(this._touchPointID, this);
					this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
					this.startScroll();
				}
			}
			if(this._isDraggingHorizontally && !this._horizontalAutoScrollTween)
			{
				this.updateHorizontalScrollFromTouchPosition(this._currentTouchX);
			}
			if(this._isDraggingVertically && !this._verticalAutoScrollTween)
			{
				this.updateVerticalScrollFromTouchPosition(this._currentTouchY);
			}
		}

		/**
		 * @private
		 */
		protected stage_touchHandler(event:TouchEvent):void
		{
			var touch:Touch = event.getTouch(this.stage, null, this._touchPointID);
			if(!touch)
			{
				return;
			}

			if(touch.phase == TouchPhase.MOVED)
			{
				//we're saving these to use in the enter frame handler because
				//that provides a longer time offset
				touch.getLocation(this, Scroller.HELPER_POINT);
				this._currentTouchX = Scroller.HELPER_POINT.x;
				this._currentTouchY = Scroller.HELPER_POINT.y;
			}
			else if(touch.phase == TouchPhase.ENDED)
			{
				if(!this._isDraggingHorizontally && !this._isDraggingVertically)
				{
					ExclusiveTouch.forStage(this.stage).removeEventListener(Event.CHANGE, this.exclusiveTouch_changeHandler);
				}
				this.removeEventListener(Event.ENTER_FRAME, this.scroller_enterFrameHandler);
				this.stage.removeEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
				this._touchPointID = -1;
				this.dispatchEventWith(FeathersEventType.END_INTERACTION);
				var isFinishingHorizontally:boolean = false;
				var isFinishingVertically:boolean = false;
				if(this._horizontalScrollPosition < this._minHorizontalScrollPosition ||
					this._horizontalScrollPosition > this._maxHorizontalScrollPosition)
				{
					isFinishingHorizontally = true;
					this.finishScrollingHorizontally();
				}
				if(this._verticalScrollPosition < this._minVerticalScrollPosition ||
					this._verticalScrollPosition > this._maxVerticalScrollPosition)
				{
					isFinishingVertically = true;
					this.finishScrollingVertically();
				}

				if(isFinishingHorizontally && isFinishingVertically)
				{
					return;
				}

				if(!isFinishingHorizontally && this._isDraggingHorizontally)
				{
					//take the average for more accuracy
					var sum:number = this._velocityX * Scroller.CURRENT_VELOCITY_WEIGHT;
					var velocityCount:number = this._previousVelocityX.length;
					var totalWeight:number = Scroller.CURRENT_VELOCITY_WEIGHT;
					for(var i:number = 0; i < velocityCount; i++)
					{
						var weight:number = Scroller.VELOCITY_WEIGHTS[i];
						sum += this._previousVelocityX.shift() * weight;
						totalWeight += weight;
					}
					this.throwHorizontally(sum / totalWeight);
				}
				else
				{
					this.hideHorizontalScrollBar();
				}

				if(!isFinishingVertically && this._isDraggingVertically)
				{
					sum = this._velocityY * Scroller.CURRENT_VELOCITY_WEIGHT;
					velocityCount = this._previousVelocityY.length;
					totalWeight = Scroller.CURRENT_VELOCITY_WEIGHT;
					for(i = 0; i < velocityCount; i++)
					{
						weight = Scroller.VELOCITY_WEIGHTS[i];
						sum += this._previousVelocityY.shift() * weight;
						totalWeight += weight;
					}
					this.throwVertically(sum / totalWeight);
				}
				else
				{
					this.hideVerticalScrollBar();
				}
			}
		}

		/**
		 * @private
		 */
		protected exclusiveTouch_changeHandler(event:Event, touchID:number):void
		{
			if(this._touchPointID < 0 || this._touchPointID != touchID || this._isDraggingHorizontally || this._isDraggingVertically)
			{
				return;
			}
			var exclusiveTouch:ExclusiveTouch = ExclusiveTouch.forStage(this.stage);
			if(exclusiveTouch.getClaim(touchID) == this)
			{
				return;
			}

			this._touchPointID = -1;
			this.removeEventListener(Event.ENTER_FRAME, this.scroller_enterFrameHandler);
			this.stage.removeEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			exclusiveTouch.removeEventListener(Event.CHANGE, this.exclusiveTouch_changeHandler);
			this.dispatchEventWith(FeathersEventType.END_INTERACTION);
		}

		/**
		 * @private
		 */
		protected nativeStage_mouseWheelHandler(event:MouseEvent):void
		{
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}
			if((this._verticalMouseWheelScrollDirection == Scroller.MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL && (this._maxVerticalScrollPosition == this._minVerticalScrollPosition || this._verticalScrollPolicy == Scroller.SCROLL_POLICY_OFF)) ||
				(this._verticalMouseWheelScrollDirection == Scroller.MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL && (this._maxHorizontalScrollPosition == this._minHorizontalScrollPosition || this._horizontalScrollPolicy == Scroller.SCROLL_POLICY_OFF)))
			{
				return;
			}

			var nativeScaleFactor:number = 1;
			if(Starling.current.supportHighResolutions)
			{
				nativeScaleFactor = Starling.current.nativeStage.contentsScaleFactor;
			}
			var starlingViewPort:Rectangle = Starling.current.viewPort;
			var scaleFactor:number = nativeScaleFactor / Starling.contentScaleFactor;
			Scroller.HELPER_POINT.x = (event.stageX - starlingViewPort.x) * scaleFactor;
			Scroller.HELPER_POINT.y = (event.stageY - starlingViewPort.y) * scaleFactor;
			if(this.contains(this.stage.hitTest(Scroller.HELPER_POINT, true)))
			{
				this.globalToLocal(Scroller.HELPER_POINT, Scroller.HELPER_POINT);
				var localMouseX:number = Scroller.HELPER_POINT.x;
				var localMouseY:number = Scroller.HELPER_POINT.y;
				if(localMouseX < this._leftViewPortOffset || localMouseY < this._topViewPortOffset ||
					localMouseX >= this.actualWidth - this._rightViewPortOffset ||
					localMouseY >= this.actualHeight - this._bottomViewPortOffset)
				{
					return;
				}
				var targetHorizontalScrollPosition:number = this._horizontalScrollPosition;
				var targetVerticalScrollPosition:number = this._verticalScrollPosition;
				var scrollStep:number = this._verticalMouseWheelScrollStep;
				if(this._verticalMouseWheelScrollDirection == Scroller.MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL)
				{
					if(scrollStep !== scrollStep) //isNaN
					{
						scrollStep = this.actualHorizontalScrollStep;
					}
					targetHorizontalScrollPosition -= event.delta * scrollStep;
					if(targetHorizontalScrollPosition < this._minHorizontalScrollPosition)
					{
						targetHorizontalScrollPosition = this._minHorizontalScrollPosition;
					}
					else if(targetHorizontalScrollPosition > this._maxHorizontalScrollPosition)
					{
						targetHorizontalScrollPosition = this._maxHorizontalScrollPosition;
					}
				}
				else //vertical
				{
					if(scrollStep !== scrollStep) //isNaN
					{
						scrollStep = this.actualVerticalScrollStep;
					}
					targetVerticalScrollPosition -= event.delta * scrollStep;
					if(targetVerticalScrollPosition < this._minVerticalScrollPosition)
					{
						targetVerticalScrollPosition = this._minVerticalScrollPosition;
					}
					else if(targetVerticalScrollPosition > this._maxVerticalScrollPosition)
					{
						targetVerticalScrollPosition = this._maxVerticalScrollPosition;
					}
				}
				this.throwTo(targetHorizontalScrollPosition, targetVerticalScrollPosition, this._mouseWheelScrollDuration);
			}
		}

		/**
		 * @private
		 */
		protected nativeStage_orientationChangeHandler(event:Event.events.Event):void
		{
			if(this._touchPointID < 0)
			{
				return;
			}
			this._startTouchX = this._previousTouchX = this._currentTouchX;
			this._startTouchY = this._previousTouchY = this._currentTouchY;
			this._startHorizontalScrollPosition = this._horizontalScrollPosition;
			this._startVerticalScrollPosition = this._verticalScrollPosition;
		}

		/**
		 * @private
		 */
		protected horizontalScrollBar_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._horizontalScrollBarTouchPointID = -1;
				return;
			}

			var displayHorizontalScrollBar:DisplayObject = DisplayObject(event.currentTarget);
			if(this._horizontalScrollBarTouchPointID >= 0)
			{
				var touch:Touch = event.getTouch(displayHorizontalScrollBar, TouchPhase.ENDED, this._horizontalScrollBarTouchPointID);
				if(!touch)
				{
					return;
				}

				this._horizontalScrollBarTouchPointID = -1;
				touch.getLocation(displayHorizontalScrollBar, Scroller.HELPER_POINT);
				var isInBounds:boolean = this.horizontalScrollBar.hitTest(Scroller.HELPER_POINT, true) != null;
				if(!isInBounds)
				{
					this.hideHorizontalScrollBar();
				}
			}
			else
			{
				touch = event.getTouch(displayHorizontalScrollBar, TouchPhase.BEGAN);
				if(touch)
				{
					this._horizontalScrollBarTouchPointID = touch.id;
					return;
				}
				touch = event.getTouch(displayHorizontalScrollBar, TouchPhase.HOVER);
				if(touch)
				{
					this.revealHorizontalScrollBar();
					return;
				}

				//end hover
				this.hideHorizontalScrollBar();
			}
		}

		/**
		 * @private
		 */
		protected verticalScrollBar_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._verticalScrollBarTouchPointID = -1;
				return;
			}

			var displayVerticalScrollBar:DisplayObject = DisplayObject(event.currentTarget);
			if(this._verticalScrollBarTouchPointID >= 0)
			{
				var touch:Touch = event.getTouch(displayVerticalScrollBar, TouchPhase.ENDED, this._verticalScrollBarTouchPointID);
				if(!touch)
				{
					return;
				}

				this._verticalScrollBarTouchPointID = -1;
				touch.getLocation(displayVerticalScrollBar, Scroller.HELPER_POINT);
				var isInBounds:boolean = this.verticalScrollBar.hitTest(Scroller.HELPER_POINT, true) != null;
				if(!isInBounds)
				{
					this.hideVerticalScrollBar();
				}
			}
			else
			{
				touch = event.getTouch(displayVerticalScrollBar, TouchPhase.BEGAN);
				if(touch)
				{
					this._verticalScrollBarTouchPointID = touch.id;
					return;
				}
				touch = event.getTouch(displayVerticalScrollBar, TouchPhase.HOVER);
				if(touch)
				{
					this.revealVerticalScrollBar();
					return;
				}

				//end hover
				this.hideVerticalScrollBar();
			}
		}

		/**
		 * @private
		 */
		protected scroller_addedToStageHandler(event:Event):void
		{
			Starling.current.nativeStage.addEventListener(MouseEvent.MOUSE_WHEEL, this.nativeStage_mouseWheelHandler, false, 0, true);
			Starling.current.nativeStage.addEventListener("orientationChange", this.nativeStage_orientationChangeHandler, false, 0, true);
		}

		/**
		 * @private
		 */
		protected scroller_removedFromStageHandler(event:Event):void
		{
			Starling.current.nativeStage.removeEventListener(MouseEvent.MOUSE_WHEEL, this.nativeStage_mouseWheelHandler);
			Starling.current.nativeStage.removeEventListener("orientationChange", this.nativeStage_orientationChangeHandler);
			if(this._touchPointID >= 0)
			{
				var exclusiveTouch:ExclusiveTouch = ExclusiveTouch.forStage(this.stage);
				exclusiveTouch.removeEventListener(Event.CHANGE, this.exclusiveTouch_changeHandler);
			}
			this._touchPointID = -1;
			this._horizontalScrollBarTouchPointID = -1;
			this._verticalScrollBarTouchPointID = -1;
			this._velocityX = 0;
			this._velocityY = 0;
			this._previousVelocityX.length = 0;
			this._previousVelocityY.length = 0;
			this._horizontalScrollBarIsScrolling = false;
			this._verticalScrollBarIsScrolling = false;
			this.removeEventListener(Event.ENTER_FRAME, this.scroller_enterFrameHandler);
			this.stage.removeEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			if(this._verticalAutoScrollTween)
			{
				Starling.juggler.remove(this._verticalAutoScrollTween);
				this._verticalAutoScrollTween = null;
			}
			if(this._horizontalAutoScrollTween)
			{
				Starling.juggler.remove(this._horizontalAutoScrollTween);
				this._horizontalAutoScrollTween = null;
			}

			//if we stopped the animation while the list was outside the scroll
			//bounds, then let's account for that
			var oldHorizontalScrollPosition:number = this._horizontalScrollPosition;
			var oldVerticalScrollPosition:number = this._verticalScrollPosition;
			if(this._horizontalScrollPosition < this._minHorizontalScrollPosition)
			{
				this._horizontalScrollPosition = this._minHorizontalScrollPosition;
			}
			else if(this._horizontalScrollPosition > this._maxHorizontalScrollPosition)
			{
				this._horizontalScrollPosition = this._maxHorizontalScrollPosition;
			}
			if(this._verticalScrollPosition < this._minVerticalScrollPosition)
			{
				this._verticalScrollPosition = this._minVerticalScrollPosition;
			}
			else if(this._verticalScrollPosition > this._maxVerticalScrollPosition)
			{
				this._verticalScrollPosition = this._maxVerticalScrollPosition;
			}
			if(oldHorizontalScrollPosition != this._horizontalScrollPosition ||
				oldVerticalScrollPosition != this._verticalScrollPosition)
			{
				this.dispatchEventWith(Event.SCROLL);
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected focusInHandler(event:Event):void
		{
			super.focusInHandler(event);
			this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected focusOutHandler(event:Event):void
		{
			super.focusOutHandler(event);
			this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
		}

		/**
		 * @private
		 */
		protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.keyCode == Keyboard.HOME)
			{
				this.verticalScrollPosition = this._minVerticalScrollPosition;
			}
			else if(event.keyCode == Keyboard.END)
			{
				this.verticalScrollPosition = this._maxVerticalScrollPosition;
			}
			else if(event.keyCode == Keyboard.PAGE_UP)
			{
				this.verticalScrollPosition = Math.max(this._minVerticalScrollPosition, this._verticalScrollPosition - this.viewPort.visibleHeight);
			}
			else if(event.keyCode == Keyboard.PAGE_DOWN)
			{
				this.verticalScrollPosition = Math.min(this._maxVerticalScrollPosition, this._verticalScrollPosition + this.viewPort.visibleHeight);
			}
			else if(event.keyCode == Keyboard.UP)
			{
				this.verticalScrollPosition = Math.max(this._minVerticalScrollPosition, this._verticalScrollPosition - this.verticalScrollStep);
			}
			else if(event.keyCode == Keyboard.DOWN)
			{
				this.verticalScrollPosition = Math.min(this._maxVerticalScrollPosition, this._verticalScrollPosition + this.verticalScrollStep);
			}
			else if(event.keyCode == Keyboard.LEFT)
			{
				this.horizontalScrollPosition = Math.max(this._maxHorizontalScrollPosition, this._horizontalScrollPosition - this.horizontalScrollStep);
			}
			else if(event.keyCode == Keyboard.RIGHT)
			{
				this.horizontalScrollPosition = Math.min(this._maxHorizontalScrollPosition, this._horizontalScrollPosition + this.horizontalScrollStep);
			}
		}
	}
}
