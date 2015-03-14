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
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import clamp = feathers.utils.math.clamp;
	import roundToNearest = feathers.utils.math.roundToNearest;

	import TimerEvent = flash.events.TimerEvent;
	import Point = flash.geom.Point;
	import Timer = flash.utils.Timer;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the scroll bar's value changes.
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
	 * Dispatched when the user starts interacting with the scroll bar's thumb,
	 * track, or buttons.
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
	 */
	/*[Event(name="beginInteraction",type="starling.events.Event")]*/

	/**
	 * Dispatched when the user stops interacting with the scroll bar's thumb,
	 * track, or buttons.
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
	 */
	/*[Event(name="endInteraction",type="starling.events.Event")]*/

	/**
	 * Select a value between a minimum and a maximum by dragging a thumb over
	 * a physical range or by using step buttons. This is a desktop-centric
	 * scroll bar with many skinnable parts. For mobile, the
	 * <code>SimpleScrollBar</code> is probably a better choice as it provides
	 * only the thumb to indicate position without all the extra chrome.
	 *
	 * <p>The following example updates a list to use scroll bars:</p>
	 *
	 * <listing version="3.0">
	 * list.horizontalScrollBarFactory = function():IScrollBar
	 * {
	 *     return new ScrollBar();
	 * };
	 * list.verticalScrollBarFactory = function():IScrollBar
	 * {
	 *     return new ScrollBar();
	 * };</listing>
	 *
	 * @see ../../../help/scroll-bar.html How to use the Feathers ScrollBar component
	 * @see feathers.controls.SimpleScrollBar
	 */
	export class ScrollBar extends FeathersControl implements IDirectionalScrollBar
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_THUMB_FACTORY:string = "thumbFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY:string = "minimumTrackFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY:string = "maximumTrackFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY:string = "decrementButtonFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY:string = "incrementButtonFactory";

		/**
		 * The scroll bar's thumb may be dragged horizontally (on the x-axis).
		 *
		 * @see #direction
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * The scroll bar's thumb may be dragged vertically (on the y-axis).
		 *
		 * @see #direction
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The scroll bar has only one track, that fills the full length of the
		 * scroll bar. In this layout mode, the "minimum" track is displayed and
		 * fills the entire length of the scroll bar. The maximum track will not
		 * exist.
		 *
		 * @see #trackLayoutMode
		 */
		public static TRACK_LAYOUT_MODE_SINGLE:string = "single";

		/**
		 * The scroll bar has two tracks, stretching to fill each side of the
		 * scroll bar with the thumb in the middle. The tracks will be resized
		 * as the thumb moves. This layout mode is designed for scroll bars
		 * where the two sides of the track may be colored differently to show
		 * the value "filling up" as the thumb is dragged or to highlight the
		 * track when it is triggered to scroll by a page instead of a step.
		 *
		 * <p>Since the width and height of the tracks will change, consider
		 * using a special display object such as a <code>Scale9Image</code>,
		 * <code>Scale3Image</code> or a <code>TiledImage</code> that is
		 * designed to be resized dynamically.</p>
		 *
		 * @see #trackLayoutMode
		 * @see feathers.display.Scale9Image
		 * @see feathers.display.Scale3Image
		 * @see feathers.display.TiledImage
		 */
		public static TRACK_LAYOUT_MODE_MIN_MAX:string = "minMax";

		/**
		 * The default value added to the <code>styleNameList</code> of the minimum
		 * track.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK:string = "feathers-scroll-bar-minimum-track";

		/**
		 * DEPRECATED: Replaced by <code>ScrollBar.DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ScrollBar#DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK
		 */
		public static DEFAULT_CHILD_NAME_MINIMUM_TRACK:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK;

		/**
		 * The default value added to the <code>styleNameList</code> of the maximum
		 * track.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK:string = "feathers-scroll-bar-maximum-track";

		/**
		 * DEPRECATED: Replaced by <code>ScrollBar.DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ScrollBar#DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK
		 */
		public static DEFAULT_CHILD_NAME_MAXIMUM_TRACK:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK;

		/**
		 * The default value added to the <code>styleNameList</code> of the thumb.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_THUMB:string = "feathers-scroll-bar-thumb";

		/**
		 * DEPRECATED: Replaced by <code>ScrollBar.DEFAULT_CHILD_STYLE_NAME_THUMB</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ScrollBar#DEFAULT_CHILD_STYLE_NAME_THUMB
		 */
		public static DEFAULT_CHILD_NAME_THUMB:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_THUMB;

		/**
		 * The default value added to the <code>styleNameList</code> of the decrement
		 * button.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON:string = "feathers-scroll-bar-decrement-button";

		/**
		 * DEPRECATED: Replaced by <code>ScrollBar.DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ScrollBar#DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON
		 */
		public static DEFAULT_CHILD_NAME_DECREMENT_BUTTON:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON;

		/**
		 * The default value added to the <code>styleNameList</code> of the increment
		 * button.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON:string = "feathers-scroll-bar-increment-button";

		/**
		 * DEPRECATED: Replaced by <code>ScrollBar.DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ScrollBar#DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON
		 */
		public static DEFAULT_CHILD_NAME_INCREMENT_BUTTON:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON;

		/**
		 * The default <code>IStyleProvider</code> for all <code>ScrollBar</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static defaultThumbFactory():Button
		{
			return new Button();
		}

		/**
		 * @private
		 */
		protected static defaultMinimumTrackFactory():Button
		{
			return new Button();
		}

		/**
		 * @private
		 */
		protected static defaultMaximumTrackFactory():Button
		{
			return new Button();
		}

		/**
		 * @private
		 */
		protected static defaultDecrementButtonFactory():Button
		{
			return new Button();
		}

		/**
		 * @private
		 */
		protected static defaultIncrementButtonFactory():Button
		{
			return new Button();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.removedFromStageHandler);
		}

		/**
		 * The value added to the <code>styleNameList</code> of the minimum
		 * track. This variable is <code>protected</code> so that sub-classes
		 * can customize the minimum track style name in their constructors
		 * instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK</code>.
		 *
		 * <p>To customize the minimum track style name without subclassing, see
		 * <code>customMinimumTrackStyleName</code>.</p>
		 *
		 * @see #customMinimumTrackStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected minimumTrackStyleName:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK;

		/**
		 * DEPRECATED: Replaced by <code>minimumTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #minimumTrackStyleName
		 */
		protected get minimumTrackName():string
		{
			return this.minimumTrackStyleName;
		}

		/**
		 * @private
		 */
		protected set minimumTrackName(value:string)
		{
			this.minimumTrackStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the maximum
		 * track. This variable is <code>protected</code> so that sub-classes
		 * can customize the maximum track style name in their constructors
		 * instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK</code>.
		 *
		 * <p>To customize the maximum track style name without subclassing, see
		 * <code>customMaximumTrackStyleName</code>.</p>
		 *
		 * @see #customMaximumTrackStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected maximumTrackStyleName:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK;

		/**
		 * DEPRECATED: Replaced by <code>maximumTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #maximumTrackStyleName
		 */
		protected get maximumTrackName():string
		{
			return this.maximumTrackStyleName;
		}

		/**
		 * @private
		 */
		protected set maximumTrackName(value:string)
		{
			this.maximumTrackStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the thumb. This
		 * variable is <code>protected</code> so that sub-classes can customize
		 * the thumb style name in their constructors instead of using the
		 * default style name defined by <code>DEFAULT_CHILD_STYLE_NAME_THUMB</code>.
		 *
		 * <p>To customize the thumb style name without subclassing, see
		 * <code>customThumbStyleName</code>.</p>
		 *
		 * @see #customThumbStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected thumbStyleName:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_THUMB;

		/**
		 * DEPRECATED: Replaced by <code>thumbStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #thumbStyleName
		 */
		protected get thumbName():string
		{
			return this.thumbStyleName;
		}

		/**
		 * @private
		 */
		protected set thumbName(value:string)
		{
			this.thumbStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the decrement
		 * button. This variable is <code>protected</code> so that sub-classes
		 * can customize the decrement button style name in their constructors
		 * instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON</code>.
		 *
		 * <p>To customize the decrement button style name without subclassing,
		 * see <code>customDecrementButtonStyleName</code>.</p>
		 *
		 * @see #customDecrementButtonStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected decrementButtonStyleName:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON;

		/**
		 * DEPRECATED: Replaced by <code>decrementButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #decrementButtonStyleName
		 */
		protected get decrementButtonName():string
		{
			return this.decrementButtonStyleName;
		}

		/**
		 * @private
		 */
		protected set decrementButtonName(value:string)
		{
			this.decrementButtonStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the increment
		 * button. This variable is <code>protected</code> so that sub-classes
		 * can customize the increment button style name in their constructors
		 * instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON</code>.
		 *
		 * <p>To customize the increment button style name without subclassing,
		 * see <code>customIncrementButtonName</code>.</p>
		 *
		 * @see #customIncrementButtonStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected incrementButtonStyleName:string = ScrollBar.DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON;

		/**
		 * DEPRECATED: Replaced by <code>incrementButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #incrementButtonStyleName
		 */
		protected get incrementButtonName():string
		{
			return this.incrementButtonStyleName;
		}

		/**
		 * @private
		 */
		protected set incrementButtonName(value:string)
		{
			this.incrementButtonStyleName = value;
		}

		/**
		 * @private
		 */
		protected thumbOriginalWidth:number = NaN;

		/**
		 * @private
		 */
		protected thumbOriginalHeight:number = NaN;

		/**
		 * @private
		 */
		protected minimumTrackOriginalWidth:number = NaN;

		/**
		 * @private
		 */
		protected minimumTrackOriginalHeight:number = NaN;

		/**
		 * @private
		 */
		protected maximumTrackOriginalWidth:number = NaN;

		/**
		 * @private
		 */
		protected maximumTrackOriginalHeight:number = NaN;

		/**
		 * The scroll bar's decrement button sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #decrementButtonFactory
		 * @see #createDecrementButton()
		 */
		protected decrementButton:Button;

		/**
		 * The scroll bar's increment button sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #incrementButtonFactory
		 * @see #createIncrementButton()
		 */
		protected incrementButton:Button;

		/**
		 * The scroll bar's thumb sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #thumbFactory
		 * @see #createThumb()
		 */
		protected thumb:Button;

		/**
		 * The scroll bar's minimum track sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #minimumTrackFactory
		 * @see #createMinimumTrack()
		 */
		protected minimumTrack:Button;

		/**
		 * The scroll bar's maximum track sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #maximumTrackFactory
		 * @see #createMaximumTrack()
		 */
		protected maximumTrack:Button;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return ScrollBar.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _direction:string = ScrollBar.DIRECTION_HORIZONTAL;

		/*[Inspectable(type="String",enumeration="horizontal,vertical")]*/
		/**
		 * Determines if the scroll bar's thumb can be dragged horizontally or
		 * vertically. When this value changes, the scroll bar's width and
		 * height values do not change automatically.
		 *
		 * <p>In the following example, the direction is changed to vertical:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.direction = ScrollBar.DIRECTION_VERTICAL;</listing>
		 *
		 * @default ScrollBar.DIRECTION_HORIZONTAL
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
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			this.invalidate(ScrollBar.INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY);
			this.invalidate(ScrollBar.INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY);
			this.invalidate(ScrollBar.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
			this.invalidate(ScrollBar.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);
			this.invalidate(ScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);
		}

		/**
		 * @private
		 */
		protected _value:number = 0;

		/**
		 * @inheritDoc
		 *
		 * @default 0
		 *
		 * @see #minimum
		 * @see #maximum
		 * @see #step
		 * @see #page
		 * @see #event:change
		 */
		public get value():number
		{
			return this._value;
		}

		/**
		 * @private
		 */
		public set value(newValue:number)
		{
			newValue = clamp(newValue, this._minimum, this._maximum);
			if(this._value == newValue)
			{
				return;
			}
			this._value = newValue;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			if(this.liveDragging || !this.isDragging)
			{
				this.dispatchEventWith(Event.CHANGE);
			}
		}

		/**
		 * @private
		 */
		protected _minimum:number = 0;

		/**
		 * @inheritDoc
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #maximum
		 */
		public get minimum():number
		{
			return this._minimum;
		}

		/**
		 * @private
		 */
		public set minimum(value:number)
		{
			if(this._minimum == value)
			{
				return;
			}
			this._minimum = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _maximum:number = 0;

		/**
		 * @inheritDoc
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #minimum
		 */
		public get maximum():number
		{
			return this._maximum;
		}

		/**
		 * @private
		 */
		public set maximum(value:number)
		{
			if(this._maximum == value)
			{
				return;
			}
			this._maximum = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _step:number = 0;

		/**
		 * @inheritDoc
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #page
		 */
		public get step():number
		{
			return this._step;
		}

		/**
		 * @private
		 */
		public set step(value:number)
		{
			this._step = value;
		}

		/**
		 * @private
		 */
		protected _page:number = 0;

		/**
		 * @inheritDoc
		 *
		 * <p>If this value is <code>0</code>, the <code>step</code> value
		 * will be used instead. If the <code>step</code> value is
		 * <code>0</code>, paging with the track is not possible.</p>
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #step
		 */
		public get page():number
		{
			return this._page;
		}

		/**
		 * @private
		 */
		public set page(value:number)
		{
			if(this._page == value)
			{
				return;
			}
			this._page = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the padding is changed to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.padding = 20;</listing>
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
		 * The minimum space, in pixels, above the content, not
		 * including the track(s).
		 *
		 * <p>In the following example, the top padding is changed to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, to the right of the content, not
		 * including the track(s).
		 *
		 * <p>In the following example, the right padding is changed to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, below the content, not
		 * including the track(s).
		 *
		 * <p>In the following example, the bottom padding is changed to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, to the left of the content, not
		 * including the track(s).
		 *
		 * <p>In the following example, the left padding is changed to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.paddingLeft = 20;</listing>
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
		protected currentRepeatAction:Function;

		/**
		 * @private
		 */
		protected _repeatTimer:Timer;

		/**
		 * @private
		 */
		protected _repeatDelay:number = 0.05;

		/**
		 * The time, in seconds, before actions are repeated. The first repeat
		 * happens after a delay that is five times longer than the following
		 * repeats.
		 *
		 * <p>In the following example, the repeat delay is changed to 500 milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.repeatDelay = 0.5;</listing>
		 *
		 * @default 0.05
		 */
		public get repeatDelay():number
		{
			return this._repeatDelay;
		}

		/**
		 * @private
		 */
		public set repeatDelay(value:number)
		{
			if(this._repeatDelay == value)
			{
				return;
			}
			this._repeatDelay = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected isDragging:boolean = false;

		/**
		 * Determines if the scroll bar dispatches the <code>Event.CHANGE</code>
		 * event every time the thumb moves, or only once it stops moving.
		 *
		 * <p>In the following example, live dragging is disabled:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.liveDragging = false;</listing>
		 *
		 * @default true
		 */
		public liveDragging:boolean = true;

		/**
		 * @private
		 */
		protected _trackLayoutMode:string = ScrollBar.TRACK_LAYOUT_MODE_SINGLE;

		/*[Inspectable(type="String",enumeration="single,minMax")]*/
		/**
		 * Determines how the minimum and maximum track skins are positioned and
		 * sized.
		 *
		 * <p>In the following example, the scroll bar is given two tracks:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.trackLayoutMode = ScrollBar.TRACK_LAYOUT_MODE_MIN_MAX;</listing>
		 *
		 * @default ScrollBar.TRACK_LAYOUT_MODE_SINGLE
		 *
		 * @see #TRACK_LAYOUT_MODE_SINGLE
		 * @see #TRACK_LAYOUT_MODE_MIN_MAX
		 */
		public get trackLayoutMode():string
		{
			return this._trackLayoutMode;
		}

		/**
		 * @private
		 */
		public set trackLayoutMode(value:string)
		{
			if(this._trackLayoutMode == value)
			{
				return;
			}
			this._trackLayoutMode = value;
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected _minimumTrackFactory:Function;

		/**
		 * A function used to generate the scroll bar's minimum track
		 * sub-component. The minimum track must be an instance of
		 * <code>Button</code>. This factory can be used to change properties on
		 * the minimum track when it is first created. For instance, if you
		 * are skinning Feathers components without a theme, you might use this
		 * factory to set skins and other styles on the minimum track.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom minimum track factory is passed
		 * to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.minimumTrackFactory = function():Button
		 * {
		 *     var track:Button = new Button();
		 *     track.defaultSkin = new Image( upTexture );
		 *     track.downSkin = new Image( downTexture );
		 *     return track;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #minimumTrackProperties
		 */
		public get minimumTrackFactory():Function
		{
			return this._minimumTrackFactory;
		}

		/**
		 * @private
		 */
		public set minimumTrackFactory(value:Function)
		{
			if(this._minimumTrackFactory == value)
			{
				return;
			}
			this._minimumTrackFactory = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customMinimumTrackStyleName:string;

		/**
		 * A style name to add to the scroll bar's minimum track sub-component.
		 * Typically used by a theme to provide different styles to different
		 * scroll bars.
		 *
		 * <p>In the following example, a custom minimum track style name is
		 * passed to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.customMinimumTrackStyleName = "my-custom-minimum-track";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to provide
		 * different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-minimum-track", setCustomMinimumTrackStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #minimumTrackFactory
		 * @see #minimumTrackProperties
		 */
		public get customMinimumTrackStyleName():string
		{
			return this._customMinimumTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customMinimumTrackStyleName(value:string)
		{
			if(this._customMinimumTrackStyleName == value)
			{
				return;
			}
			this._customMinimumTrackStyleName = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customMinimumTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customMinimumTrackStyleName
		 */
		public get customMinimumTrackName():string
		{
			return this.customMinimumTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customMinimumTrackName(value:string)
		{
			this.customMinimumTrackStyleName = value;
		}

		/**
		 * @private
		 */
		protected _minimumTrackProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the scroll bar's
		 * minimum track sub-component. The minimum track is a
		 * <code>feathers.controls.Button</code> instance. that is created by
		 * <code>minimumTrackFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>minimumTrackFactory</code> function
		 * instead of using <code>minimumTrackProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the scroll bar's minimum track properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.minimumTrackProperties.defaultSkin = new Image( upTexture );
		 * scrollBar.minimumTrackProperties.downSkin = new Image( downTexture );</listing>
		 *
		 * @default null
		 *
		 * @see #minimumTrackFactory
		 * @see feathers.controls.Button
		 */
		public get minimumTrackProperties():Object
		{
			if(!this._minimumTrackProperties)
			{
				this._minimumTrackProperties = new PropertyProxy(this.minimumTrackProperties_onChange);
			}
			return this._minimumTrackProperties;
		}

		/**
		 * @private
		 */
		public set minimumTrackProperties(value:Object)
		{
			if(this._minimumTrackProperties == value)
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
			if(this._minimumTrackProperties)
			{
				this._minimumTrackProperties.removeOnChangeCallback(this.minimumTrackProperties_onChange);
			}
			this._minimumTrackProperties = PropertyProxy(value);
			if(this._minimumTrackProperties)
			{
				this._minimumTrackProperties.addOnChangeCallback(this.minimumTrackProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _maximumTrackFactory:Function;

		/**
		 * A function used to generate the scroll bar's maximum track
		 * sub-component. The maximum track must be an instance of
		 * <code>Button</code>. This factory can be used to change properties on
		 * the maximum track when it is first created. For instance, if you
		 * are skinning Feathers components without a theme, you might use this
		 * factory to set skins and other styles on the maximum track.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom maximum track factory is passed
		 * to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.maximumTrackFactory = function():Button
		 * {
		 *     var track:Button = new Button();
		 *     track.defaultSkin = new Image( upTexture );
		 *     track.downSkin = new Image( downTexture );
		 *     return track;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #maximumTrackProperties
		 */
		public get maximumTrackFactory():Function
		{
			return this._maximumTrackFactory;
		}

		/**
		 * @private
		 */
		public set maximumTrackFactory(value:Function)
		{
			if(this._maximumTrackFactory == value)
			{
				return;
			}
			this._maximumTrackFactory = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customMaximumTrackStyleName:string;

		/**
		 * A style name to add to the scroll bar's maximum track sub-component.
		 * Typically used by a theme to provide different styles to different
		 * scroll bars.
		 *
		 * <p>In the following example, a custom maximum track style name is
		 * passed to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.customMaximumTrackStyleName = "my-custom-maximum-track";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-maximum-track", setCustomMaximumTrackStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #maximumTrackFactory
		 * @see #maximumTrackProperties
		 */
		public get customMaximumTrackStyleName():string
		{
			return this._customMaximumTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customMaximumTrackStyleName(value:string)
		{
			if(this._customMaximumTrackStyleName == value)
			{
				return;
			}
			this._customMaximumTrackStyleName = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customMaximumTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customMaximumTrackStyleName
		 */
		public get customMaximumTrackName():string
		{
			return this.customMaximumTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customMaximumTrackName(value:string)
		{
			this.customMaximumTrackStyleName = value;
		}

		/**
		 * @private
		 */
		protected _maximumTrackProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the scroll bar's
		 * maximum track sub-component. The maximum track is a
		 * <code>feathers.controls.Button</code> instance that is created by
		 * <code>maximumTrackFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>maximumTrackFactory</code> function
		 * instead of using <code>maximumTrackProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the scroll bar's maximum track properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.maximumTrackProperties.defaultSkin = new Image( upTexture );
		 * scrollBar.maximumTrackProperties.downSkin = new Image( downTexture );</listing>
		 *
		 * @default null
		 *
		 * @see #maximumTrackFactory
		 * @see feathers.controls.Button
		 */
		public get maximumTrackProperties():Object
		{
			if(!this._maximumTrackProperties)
			{
				this._maximumTrackProperties = new PropertyProxy(this.maximumTrackProperties_onChange);
			}
			return this._maximumTrackProperties;
		}

		/**
		 * @private
		 */
		public set maximumTrackProperties(value:Object)
		{
			if(this._maximumTrackProperties == value)
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
			if(this._maximumTrackProperties)
			{
				this._maximumTrackProperties.removeOnChangeCallback(this.maximumTrackProperties_onChange);
			}
			this._maximumTrackProperties = PropertyProxy(value);
			if(this._maximumTrackProperties)
			{
				this._maximumTrackProperties.addOnChangeCallback(this.maximumTrackProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _thumbFactory:Function;

		/**
		 * A function used to generate the scroll bar's thumb sub-component.
		 * The thumb must be an instance of <code>Button</code>. This factory
		 * can be used to change properties on the thumb when it is first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to set skins and other
		 * styles on the thumb.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom thumb factory is passed
		 * to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.thumbFactory = function():Button
		 * {
		 *     var thumb:Button = new Button();
		 *     thumb.defaultSkin = new Image( upTexture );
		 *     thumb.downSkin = new Image( downTexture );
		 *     return thumb;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #thumbProperties
		 */
		public get thumbFactory():Function
		{
			return this._thumbFactory;
		}

		/**
		 * @private
		 */
		public set thumbFactory(value:Function)
		{
			if(this._thumbFactory == value)
			{
				return;
			}
			this._thumbFactory = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customThumbStyleName:string;

		/**
		 * A style name to add to the scroll bar's thumb sub-component.
		 * Typically used by a theme to provide different styles to different
		 * scroll bars.
		 *
		 * <p>In the following example, a custom thumb style name is passed
		 * to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.customThumbStyleName = "my-custom-thumb";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-thumb", setCustomThumbStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_THUMB
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #thumbFactory
		 * @see #thumbProperties
		 */
		public get customThumbStyleName():string
		{
			return this._customThumbStyleName;
		}

		/**
		 * @private
		 */
		public set customThumbStyleName(value:string)
		{
			if(this._customThumbStyleName == value)
			{
				return;
			}
			this._customThumbStyleName = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customThumbStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customThumbStyleName
		 */
		public get customThumbName():string
		{
			return this.customThumbStyleName;
		}

		/**
		 * @private
		 */
		public set customThumbName(value:string)
		{
			this.customThumbStyleName = value;
		}

		/**
		 * @private
		 */
		protected _thumbProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the scroll bar's thumb
		 * sub-component. The thumb is a <code>feathers.controls.Button</code>
		 * instance that is created by <code>thumbFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>thumbFactory</code> function instead
		 * of using <code>thumbProperties</code> will result in better
		 * performance.</p>
		 *
		 * <p>In the following example, the scroll bar's thumb properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.thumbProperties.defaultSkin = new Image( upTexture );
		 * scrollBar.thumbProperties.downSkin = new Image( downTexture );</listing>
		 *
		 * @default null
		 *
		 * @see #thumbFactory
		 * @see feathers.controls.Button
		 */
		public get thumbProperties():Object
		{
			if(!this._thumbProperties)
			{
				this._thumbProperties = new PropertyProxy(this.thumbProperties_onChange);
			}
			return this._thumbProperties;
		}

		/**
		 * @private
		 */
		public set thumbProperties(value:Object)
		{
			if(this._thumbProperties == value)
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
			if(this._thumbProperties)
			{
				this._thumbProperties.removeOnChangeCallback(this.thumbProperties_onChange);
			}
			this._thumbProperties = PropertyProxy(value);
			if(this._thumbProperties)
			{
				this._thumbProperties.addOnChangeCallback(this.thumbProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _decrementButtonFactory:Function;

		/**
		 * A function used to generate the scroll bar's decrement button
		 * sub-component. The decrement button must be an instance of
		 * <code>Button</code>. This factory can be used to change properties on
		 * the decrement button when it is first created. For instance, if you
		 * are skinning Feathers components without a theme, you might use this
		 * factory to set skins and other styles on the decrement button.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom decrement button factory is passed
		 * to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.decrementButtonFactory = function():Button
		 * {
		 *     var button:Button = new Button();
		 *     button.defaultSkin = new Image( upTexture );
		 *     button.downSkin = new Image( downTexture );
		 *     return button;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #decrementButtonProperties
		 */
		public get decrementButtonFactory():Function
		{
			return this._decrementButtonFactory;
		}

		/**
		 * @private
		 */
		public set decrementButtonFactory(value:Function)
		{
			if(this._decrementButtonFactory == value)
			{
				return;
			}
			this._decrementButtonFactory = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customDecrementButtonStyleName:string;

		/**
		 * A style name to add to the scroll bar's decrement button
		 * sub-component. Typically used by a theme to provide different styles
		 * to different scroll bars.
		 *
		 * <p>In the following example, a custom decrement button style name is
		 * passed to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.customDecrementButtonStyleName = "my-custom-decrement-button";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different skins than the default style:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-decrement-button", setCustomDecrementButtonStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #decrementButtonFactory
		 * @see #decrementButtonProperties
		 */
		public get customDecrementButtonStyleName():string
		{
			return this._customDecrementButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customDecrementButtonStyleName(value:string)
		{
			if(this._customDecrementButtonStyleName == value)
			{
				return;
			}
			this._customDecrementButtonStyleName = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customDecrementButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customDecrementButtonStyleName
		 */
		public get customDecrementButtonName():string
		{
			return this.customDecrementButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customDecrementButtonName(value:string)
		{
			this.customDecrementButtonStyleName = value;
		}

		/**
		 * @private
		 */
		protected _decrementButtonProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the scroll bar's
		 * decrement button sub-component. The decrement button is a
		 * <code>feathers.controls.Button</code> instance that is created by
		 * <code>decrementButtonFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>decrementButtonFactory</code>
		 * function instead of using <code>decrementButtonProperties</code> will
		 * result in better performance.</p>
		 *
		 * <p>In the following example, the scroll bar's decrement button properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.decrementButtonProperties.defaultSkin = new Image( upTexture );
		 * scrollBar.decrementButtonProperties.downSkin = new Image( downTexture );</listing>
		 *
		 * @default null
		 *
		 * @see #decrementButtonFactory
		 * @see feathers.controls.Button
		 */
		public get decrementButtonProperties():Object
		{
			if(!this._decrementButtonProperties)
			{
				this._decrementButtonProperties = new PropertyProxy(this.decrementButtonProperties_onChange);
			}
			return this._decrementButtonProperties;
		}

		/**
		 * @private
		 */
		public set decrementButtonProperties(value:Object)
		{
			if(this._decrementButtonProperties == value)
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
			if(this._decrementButtonProperties)
			{
				this._decrementButtonProperties.removeOnChangeCallback(this.decrementButtonProperties_onChange);
			}
			this._decrementButtonProperties = PropertyProxy(value);
			if(this._decrementButtonProperties)
			{
				this._decrementButtonProperties.addOnChangeCallback(this.decrementButtonProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _incrementButtonFactory:Function;

		/**
		 * A function used to generate the scroll bar's increment button
		 * sub-component. The increment button must be an instance of
		 * <code>Button</code>. This factory can be used to change properties on
		 * the increment button when it is first created. For instance, if you
		 * are skinning Feathers components without a theme, you might use this
		 * factory to set skins and other styles on the increment button.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom increment button factory is passed
		 * to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.incrementButtonFactory = function():Button
		 * {
		 *     var button:Button = new Button();
		 *     button.defaultSkin = new Image( upTexture );
		 *     button.downSkin = new Image( downTexture );
		 *     return button;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #incrementButtonProperties
		 */
		public get incrementButtonFactory():Function
		{
			return this._incrementButtonFactory;
		}

		/**
		 * @private
		 */
		public set incrementButtonFactory(value:Function)
		{
			if(this._incrementButtonFactory == value)
			{
				return;
			}
			this._incrementButtonFactory = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customIncrementButtonStyleName:string;

		/**
		 * A style name to add to the scroll bar's increment button
		 * sub-component. Typically used by a theme to provide different styles
		 * to different scroll bars.
		 *
		 * <p>In the following example, a custom increment button style name is
		 * passed to the scroll bar:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.customIncrementButtonStyleName = "my-custom-increment-button";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-increment-button", setCustomIncrementButtonStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #incrementButtonFactory
		 * @see #incrementButtonProperties
		 */
		public get customIncrementButtonStyleName():string
		{
			return this._customIncrementButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customIncrementButtonStyleName(value:string)
		{
			if(this._customIncrementButtonStyleName == value)
			{
				return;
			}
			this._customIncrementButtonStyleName = value;
			this.invalidate(ScrollBar.INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customIncrementButtonStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customIncrementButtonStyleName
		 */
		public get customIncrementButtonName():string
		{
			return this.customIncrementButtonStyleName;
		}

		/**
		 * @private
		 */
		public set customIncrementButtonName(value:string)
		{
			this.customIncrementButtonStyleName = value;
		}

		/**
		 * @private
		 */
		protected _incrementButtonProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the scroll bar's
		 * increment button sub-component. The increment button is a
		 * <code>feathers.controls.Button</code> instance that is created by
		 * <code>incrementButtonFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>incrementButtonFactory</code>
		 * function instead of using <code>incrementButtonProperties</code> will
		 * result in better performance.</p>
		 *
		 * <p>In the following example, the scroll bar's increment button properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.incrementButtonProperties.defaultSkin = new Image( upTexture );
		 * scrollBar.incrementButtonProperties.downSkin = new Image( downTexture );</listing>
		 *
		 * @default null
		 *
		 * @see #incrementButtonFactory
		 * @see feathers.controls.Button
		 */
		public get incrementButtonProperties():Object
		{
			if(!this._incrementButtonProperties)
			{
				this._incrementButtonProperties = new PropertyProxy(this.incrementButtonProperties_onChange);
			}
			return this._incrementButtonProperties;
		}

		/**
		 * @private
		 */
		public set incrementButtonProperties(value:Object)
		{
			if(this._incrementButtonProperties == value)
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
			if(this._incrementButtonProperties)
			{
				this._incrementButtonProperties.removeOnChangeCallback(this.incrementButtonProperties_onChange);
			}
			this._incrementButtonProperties = PropertyProxy(value);
			if(this._incrementButtonProperties)
			{
				this._incrementButtonProperties.addOnChangeCallback(this.incrementButtonProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _touchPointID:number = -1;

		/**
		 * @private
		 */
		protected _touchStartX:number = NaN;

		/**
		 * @private
		 */
		protected _touchStartY:number = NaN;

		/**
		 * @private
		 */
		protected _thumbStartX:number = NaN;

		/**
		 * @private
		 */
		protected _thumbStartY:number = NaN;

		/**
		 * @private
		 */
		protected _touchValue:number;

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);
			var thumbFactoryInvalid:boolean = this.isInvalid(ScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);
			var minimumTrackFactoryInvalid:boolean = this.isInvalid(ScrollBar.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
			var maximumTrackFactoryInvalid:boolean = this.isInvalid(ScrollBar.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);
			var incrementButtonFactoryInvalid:boolean = this.isInvalid(ScrollBar.INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY);
			var decrementButtonFactoryInvalid:boolean = this.isInvalid(ScrollBar.INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY);

			if(thumbFactoryInvalid)
			{
				this.createThumb();
			}
			if(minimumTrackFactoryInvalid)
			{
				this.createMinimumTrack();
			}
			if(maximumTrackFactoryInvalid || layoutInvalid)
			{
				this.createMaximumTrack();
			}
			if(decrementButtonFactoryInvalid)
			{
				this.createDecrementButton();
			}
			if(incrementButtonFactoryInvalid)
			{
				this.createIncrementButton();
			}

			if(thumbFactoryInvalid || stylesInvalid)
			{
				this.refreshThumbStyles();
			}
			if(minimumTrackFactoryInvalid || stylesInvalid)
			{
				this.refreshMinimumTrackStyles();
			}
			if((maximumTrackFactoryInvalid || stylesInvalid || layoutInvalid) && this.maximumTrack)
			{
				this.refreshMaximumTrackStyles();
			}
			if(decrementButtonFactoryInvalid || stylesInvalid)
			{
				this.refreshDecrementButtonStyles();
			}
			if(incrementButtonFactoryInvalid || stylesInvalid)
			{
				this.refreshIncrementButtonStyles();
			}

			var isEnabled:boolean = this._isEnabled && this._maximum > this._minimum;
			if(dataInvalid || stateInvalid || thumbFactoryInvalid)
			{
				this.thumb.isEnabled = isEnabled;
			}
			if(dataInvalid || stateInvalid || minimumTrackFactoryInvalid)
			{
				this.minimumTrack.isEnabled = isEnabled;
			}
			if((dataInvalid || stateInvalid || maximumTrackFactoryInvalid || layoutInvalid) && this.maximumTrack)
			{
				this.maximumTrack.isEnabled = isEnabled;
			}
			if(dataInvalid || stateInvalid || decrementButtonFactoryInvalid)
			{
				this.decrementButton.isEnabled = isEnabled;
			}
			if(dataInvalid || stateInvalid || incrementButtonFactoryInvalid)
			{
				this.incrementButton.isEnabled = isEnabled;
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			this.layout();
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
			if(this.minimumTrackOriginalWidth !== this.minimumTrackOriginalWidth || //isNaN
				this.minimumTrackOriginalHeight !== this.minimumTrackOriginalHeight) //isNaN
			{
				this.minimumTrack.validate();
				this.minimumTrackOriginalWidth = this.minimumTrack.width;
				this.minimumTrackOriginalHeight = this.minimumTrack.height;
			}
			if(this.maximumTrack)
			{
				if(this.maximumTrackOriginalWidth !== this.maximumTrackOriginalWidth || //isNaN
					this.maximumTrackOriginalHeight !== this.maximumTrackOriginalHeight) //isNaN
				{
					this.maximumTrack.validate();
					this.maximumTrackOriginalWidth = this.maximumTrack.width;
					this.maximumTrackOriginalHeight = this.maximumTrack.height;
				}
			}
			if(this.thumbOriginalWidth !== this.thumbOriginalWidth || //isNaN
				this.thumbOriginalHeight !== this.thumbOriginalHeight) //isNaN
			{
				this.thumb.validate();
				this.thumbOriginalWidth = this.thumb.width;
				this.thumbOriginalHeight = this.thumb.height;
			}
			this.decrementButton.validate();
			this.incrementButton.validate();

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
				if(this._direction == ScrollBar.DIRECTION_VERTICAL)
				{
					if(this.maximumTrack)
					{
						newWidth = Math.max(this.minimumTrackOriginalWidth, this.maximumTrackOriginalWidth);
					}
					else
					{
						newWidth = this.minimumTrackOriginalWidth;
					}
				}
				else //horizontal
				{
					if(this.maximumTrack)
					{
						newWidth = Math.min(this.minimumTrackOriginalWidth, this.maximumTrackOriginalWidth) + this.thumb.width / 2;
					}
					else
					{
						newWidth = this.minimumTrackOriginalWidth;
					}
					newWidth += this.incrementButton.width + this.decrementButton.width;
				}
			}
			if(needsHeight)
			{
				if(this._direction == ScrollBar.DIRECTION_VERTICAL)
				{
					if(this.maximumTrack)
					{
						newHeight = Math.min(this.minimumTrackOriginalHeight, this.maximumTrackOriginalHeight) + this.thumb.height / 2;
					}
					else
					{
						newHeight = this.minimumTrackOriginalHeight;
					}
					newHeight += this.incrementButton.height + this.decrementButton.height;
				}
				else //horizontal
				{
					if(this.maximumTrack)
					{
						newHeight = Math.max(this.minimumTrackOriginalHeight, this.maximumTrackOriginalHeight);
					}
					else
					{
						newHeight = this.minimumTrackOriginalHeight;
					}
				}
			}
			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates and adds the <code>thumb</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #thumb
		 * @see #thumbFactory
		 * @see #customThumbStyleName
		 */
		protected createThumb():void
		{
			if(this.thumb)
			{
				this.thumb.removeFromParent(true);
				this.thumb = null;
			}

			var factory:Function = this._thumbFactory != null ? this._thumbFactory : ScrollBar.defaultThumbFactory;
			var thumbStyleName:string = this._customThumbStyleName != null ? this._customThumbStyleName : this.thumbStyleName;
			this.thumb = this.Button(factory());
			this.thumb.styleNameList.add(thumbStyleName);
			this.thumb.keepDownStateOnRollOut = true;
			this.thumb.isFocusEnabled = false;
			this.thumb.addEventListener(TouchEvent.TOUCH, this.thumb_touchHandler);
			this.addChild(this.thumb);
		}

		/**
		 * Creates and adds the <code>minimumTrack</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #minimumTrack
		 * @see #minimumTrackFactory
		 * @see #customMinimumTrackStyleName
		 */
		protected createMinimumTrack():void
		{
			if(this.minimumTrack)
			{
				this.minimumTrack.removeFromParent(true);
				this.minimumTrack = null;
			}

			var factory:Function = this._minimumTrackFactory != null ? this._minimumTrackFactory : ScrollBar.defaultMinimumTrackFactory;
			var minimumTrackStyleName:string = this._customMinimumTrackStyleName != null ? this._customMinimumTrackStyleName : this.minimumTrackStyleName;
			this.minimumTrack = this.Button(factory());
			this.minimumTrack.styleNameList.add(minimumTrackStyleName);
			this.minimumTrack.keepDownStateOnRollOut = true;
			this.minimumTrack.isFocusEnabled = false;
			this.minimumTrack.addEventListener(TouchEvent.TOUCH, this.track_touchHandler);
			this.addChildAt(this.minimumTrack, 0);
		}

		/**
		 * Creates and adds the <code>maximumTrack</code> sub-component and
		 * removes the old instance, if one exists. If the maximum track is not
		 * needed, it will not be created.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #maximumTrack
		 * @see #maximumTrackFactory
		 * @see #customMaximumTrackStyleName
		 */
		protected createMaximumTrack():void
		{
			if(this._trackLayoutMode == ScrollBar.TRACK_LAYOUT_MODE_MIN_MAX)
			{
				if(this.maximumTrack)
				{
					this.maximumTrack.removeFromParent(true);
					this.maximumTrack = null;
				}
				var factory:Function = this._maximumTrackFactory != null ? this._maximumTrackFactory : ScrollBar.defaultMaximumTrackFactory;
				var maximumTrackStyleName:string = this._customMaximumTrackStyleName != null ? this._customMaximumTrackStyleName : this.maximumTrackStyleName;
				this.maximumTrack = this.Button(factory());
				this.maximumTrack.styleNameList.add(maximumTrackStyleName);
				this.maximumTrack.keepDownStateOnRollOut = true;
				this.maximumTrack.isFocusEnabled = false;
				this.maximumTrack.addEventListener(TouchEvent.TOUCH, this.track_touchHandler);
				this.addChildAt(this.maximumTrack, 1);
			}
			else if(this.maximumTrack) //single
			{
				this.maximumTrack.removeFromParent(true);
				this.maximumTrack = null;
			}
		}

		/**
		 * Creates and adds the <code>decrementButton</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #decrementButton
		 * @see #decrementButtonFactory
		 * @see #customDecremenButtonStyleName
		 */
		protected createDecrementButton():void
		{
			if(this.decrementButton)
			{
				this.decrementButton.removeFromParent(true);
				this.decrementButton = null;
			}

			var factory:Function = this._decrementButtonFactory != null ? this._decrementButtonFactory : ScrollBar.defaultDecrementButtonFactory;
			var decrementButtonStyleName:string = this._customDecrementButtonStyleName != null ? this._customDecrementButtonStyleName : this.decrementButtonStyleName;
			this.decrementButton = this.Button(factory());
			this.decrementButton.styleNameList.add(decrementButtonStyleName);
			this.decrementButton.keepDownStateOnRollOut = true;
			this.decrementButton.isFocusEnabled = false;
			this.decrementButton.addEventListener(TouchEvent.TOUCH, this.decrementButton_touchHandler);
			this.addChild(this.decrementButton);
		}

		/**
		 * Creates and adds the <code>incrementButton</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #incrementButton
		 * @see #incrementButtonFactory
		 * @see #customIncrementButtonStyleName
		 */
		protected createIncrementButton():void
		{
			if(this.incrementButton)
			{
				this.incrementButton.removeFromParent(true);
				this.incrementButton = null;
			}

			var factory:Function = this._incrementButtonFactory != null ? this._incrementButtonFactory : ScrollBar.defaultIncrementButtonFactory;
			var incrementButtonStyleName:string = this._customIncrementButtonStyleName != null ? this._customIncrementButtonStyleName : this.incrementButtonStyleName;
			this.incrementButton = this.Button(factory());
			this.incrementButton.styleNameList.add(incrementButtonStyleName);
			this.incrementButton.keepDownStateOnRollOut = true;
			this.incrementButton.isFocusEnabled = false;
			this.incrementButton.addEventListener(TouchEvent.TOUCH, this.incrementButton_touchHandler);
			this.addChild(this.incrementButton);
		}

		/**
		 * @private
		 */
		protected refreshThumbStyles():void
		{
			for(var propertyName:string in this._thumbProperties)
			{
				var propertyValue:Object = this._thumbProperties[propertyName];
				this.thumb[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshMinimumTrackStyles():void
		{
			for(var propertyName:string in this._minimumTrackProperties)
			{
				var propertyValue:Object = this._minimumTrackProperties[propertyName];
				this.minimumTrack[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshMaximumTrackStyles():void
		{
			if(!this.maximumTrack)
			{
				return;
			}
			for(var propertyName:string in this._maximumTrackProperties)
			{
				var propertyValue:Object = this._maximumTrackProperties[propertyName];
				this.maximumTrack[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshDecrementButtonStyles():void
		{
			for(var propertyName:string in this._decrementButtonProperties)
			{
				var propertyValue:Object = this._decrementButtonProperties[propertyName];
				this.decrementButton[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshIncrementButtonStyles():void
		{
			for(var propertyName:string in this._incrementButtonProperties)
			{
				var propertyValue:Object = this._incrementButtonProperties[propertyName];
				this.incrementButton[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected layout():void
		{
			this.layoutStepButtons();
			this.layoutThumb();

			if(this._trackLayoutMode == ScrollBar.TRACK_LAYOUT_MODE_MIN_MAX)
			{
				this.layoutTrackWithMinMax();
			}
			else //single
			{
				this.layoutTrackWithSingle();
			}
		}

		/**
		 * @private
		 */
		protected layoutStepButtons():void
		{
			if(this._direction == ScrollBar.DIRECTION_VERTICAL)
			{
				this.decrementButton.x = (this.actualWidth - this.decrementButton.width) / 2;
				this.decrementButton.y = 0;
				this.incrementButton.x = (this.actualWidth - this.incrementButton.width) / 2;
				this.incrementButton.y = this.actualHeight - this.incrementButton.height;
			}
			else
			{
				this.decrementButton.x = 0;
				this.decrementButton.y = (this.actualHeight - this.decrementButton.height) / 2;
				this.incrementButton.x = this.actualWidth - this.incrementButton.width;
				this.incrementButton.y = (this.actualHeight - this.incrementButton.height) / 2;
			}
			var showButtons:boolean = this._maximum != this._minimum;
			this.decrementButton.visible = showButtons;
			this.incrementButton.visible = showButtons;
		}

		/**
		 * @private
		 */
		protected layoutThumb():void
		{
			var range:number = this._maximum - this._minimum;
			this.thumb.visible = range > 0 && range < Number.POSITIVE_INFINITY && this._isEnabled;
			if(!this.thumb.visible)
			{
				return;
			}

			//this will auto-size the thumb, if needed
			this.thumb.validate();

			var contentWidth:number = this.actualWidth - this._paddingLeft - this._paddingRight;
			var contentHeight:number = this.actualHeight - this._paddingTop - this._paddingBottom;
			var adjustedPage:number = this._page;
			if(this._page == 0)
			{
				adjustedPage = this._step;
			}
			if(adjustedPage > range)
			{
				adjustedPage = range;
			}
			if(this._direction == ScrollBar.DIRECTION_VERTICAL)
			{
				contentHeight -= (this.decrementButton.height + this.incrementButton.height);
				var thumbMinHeight:number = this.thumb.minHeight > 0 ? this.thumb.minHeight : this.thumbOriginalHeight;
				this.thumb.width = this.thumbOriginalWidth;
				this.thumb.height = Math.max(thumbMinHeight, contentHeight * adjustedPage / range);
				var trackScrollableHeight:number = contentHeight - this.thumb.height;
				this.thumb.x = this._paddingLeft + (this.actualWidth - this._paddingLeft - this._paddingRight - this.thumb.width) / 2;
				this.thumb.y = this.decrementButton.height + this._paddingTop + Math.max(0, Math.min(trackScrollableHeight, trackScrollableHeight * (this._value - this._minimum) / range));
			}
			else //horizontal
			{
				contentWidth -= (this.decrementButton.width + this.decrementButton.width);
				var thumbMinWidth:number = this.thumb.minWidth > 0 ? this.thumb.minWidth : this.thumbOriginalWidth;
				this.thumb.width = Math.max(thumbMinWidth, contentWidth * adjustedPage / range);
				this.thumb.height = this.thumbOriginalHeight;
				var trackScrollableWidth:number = contentWidth - this.thumb.width;
				this.thumb.x = this.decrementButton.width + this._paddingLeft + Math.max(0, Math.min(trackScrollableWidth, trackScrollableWidth * (this._value - this._minimum) / range));
				this.thumb.y = this._paddingTop + (this.actualHeight - this._paddingTop - this._paddingBottom - this.thumb.height) / 2;
			}
		}

		/**
		 * @private
		 */
		protected layoutTrackWithMinMax():void
		{
			var range:number = this._maximum - this._minimum;
			this.minimumTrack.touchable = range > 0 && range < Number.POSITIVE_INFINITY;
			if(this.maximumTrack)
			{
				this.maximumTrack.touchable = range > 0 && range < Number.POSITIVE_INFINITY;
			}

			var showButtons:boolean = this._maximum != this._minimum;
			if(this._direction == ScrollBar.DIRECTION_VERTICAL)
			{
				this.minimumTrack.x = 0;
				if(showButtons)
				{
					this.minimumTrack.y = this.decrementButton.height;
				}
				else
				{
					this.minimumTrack.y = 0;
				}
				this.minimumTrack.width = this.actualWidth;
				this.minimumTrack.height = (this.thumb.y + this.thumb.height / 2) - this.minimumTrack.y;

				this.maximumTrack.x = 0;
				this.maximumTrack.y = this.minimumTrack.y + this.minimumTrack.height;
				this.maximumTrack.width = this.actualWidth;
				if(showButtons)
				{
					this.maximumTrack.height = this.actualHeight - this.incrementButton.height - this.maximumTrack.y;
				}
				else
				{
					this.maximumTrack.height = this.actualHeight - this.maximumTrack.y;
				}
			}
			else //horizontal
			{
				if(showButtons)
				{
					this.minimumTrack.x = this.decrementButton.width;
				}
				else
				{
					this.minimumTrack.x = 0;
				}
				this.minimumTrack.y = 0;
				this.minimumTrack.width = (this.thumb.x + this.thumb.width / 2) - this.minimumTrack.x;
				this.minimumTrack.height = this.actualHeight;

				this.maximumTrack.x = this.minimumTrack.x + this.minimumTrack.width;
				this.maximumTrack.y = 0;
				if(showButtons)
				{
					this.maximumTrack.width = this.actualWidth - this.incrementButton.width - this.maximumTrack.x;
				}
				else
				{
					this.maximumTrack.width = this.actualWidth - this.maximumTrack.x;
				}
				this.maximumTrack.height = this.actualHeight;
			}

			//final validation to avoid juggler next frame issues
			this.minimumTrack.validate();
			this.maximumTrack.validate();
		}

		/**
		 * @private
		 */
		protected layoutTrackWithSingle():void
		{
			var range:number = this._maximum - this._minimum;
			this.minimumTrack.touchable = range > 0 && range < Number.POSITIVE_INFINITY;

			var showButtons:boolean = this._maximum != this._minimum;
			if(this._direction == ScrollBar.DIRECTION_VERTICAL)
			{
				this.minimumTrack.x = 0;
				if(showButtons)
				{
					this.minimumTrack.y = this.decrementButton.height;
				}
				else
				{
					this.minimumTrack.y = 0;
				}
				this.minimumTrack.width = this.actualWidth;
				if(showButtons)
				{
					this.minimumTrack.height = this.actualHeight - this.minimumTrack.y - this.incrementButton.height;
				}
				else
				{
					this.minimumTrack.height = this.actualHeight - this.minimumTrack.y;
				}
			}
			else //horizontal
			{
				if(showButtons)
				{
					this.minimumTrack.x = this.decrementButton.width;
				}
				else
				{
					this.minimumTrack.x = 0;
				}
				this.minimumTrack.y = 0;
				if(showButtons)
				{
					this.minimumTrack.width = this.actualWidth - this.minimumTrack.x - this.incrementButton.width;
				}
				else
				{
					this.minimumTrack.width = this.actualWidth - this.minimumTrack.x;
				}
				this.minimumTrack.height = this.actualHeight;
			}

			//final validation to avoid juggler next frame issues
			this.minimumTrack.validate();
		}

		/**
		 * @private
		 */
		protected locationToValue(location:Point):number
		{
			var percentage:number = 0;
			if(this._direction == ScrollBar.DIRECTION_VERTICAL)
			{
				var trackScrollableHeight:number = this.actualHeight - this.thumb.height - this.decrementButton.height - this.incrementButton.height - this._paddingTop - this._paddingBottom;
				if(trackScrollableHeight > 0)
				{
					var yOffset:number = location.y - this._touchStartY - this._paddingTop;
					var yPosition:number = Math.min(Math.max(0, this._thumbStartY + yOffset - this.decrementButton.height), trackScrollableHeight);
					percentage = yPosition / trackScrollableHeight;
				}
			}
			else //horizontal
			{
				var trackScrollableWidth:number = this.actualWidth - this.thumb.width - this.decrementButton.width - this.incrementButton.width - this._paddingLeft - this._paddingRight;
				if(trackScrollableWidth > 0)
				{
					var xOffset:number = location.x - this._touchStartX - this._paddingLeft;
					var xPosition:number = Math.min(Math.max(0, this._thumbStartX + xOffset - this.decrementButton.width), trackScrollableWidth);
					percentage = xPosition / trackScrollableWidth;
				}
			}

			return this._minimum + percentage * (this._maximum - this._minimum);
		}

		/**
		 * @private
		 */
		protected decrement():void
		{
			this.value -= this._step;
		}

		/**
		 * @private
		 */
		protected increment():void
		{
			this.value += this._step;
		}

		/**
		 * @private
		 */
		protected adjustPage():void
		{
			var range:number = this._maximum - this._minimum;
			var adjustedPage:number = this._page;
			if(this._page == 0)
			{
				adjustedPage = this._step;
			}
			if(adjustedPage > range)
			{
				adjustedPage = range;
			}
			if(this._touchValue < this._value)
			{
				var newValue:number = Math.max(this._touchValue, this._value - adjustedPage);
				if(this._step != 0 && newValue != this._maximum && newValue != this._minimum)
				{
					newValue = roundToNearest(newValue, this._step);
				}
				this.value = newValue;
			}
			else if(this._touchValue > this._value)
			{
				newValue = Math.min(this._touchValue, this._value + adjustedPage);
				if(this._step != 0 && newValue != this._maximum && newValue != this._minimum)
				{
					newValue = roundToNearest(newValue, this._step);
				}
				this.value = newValue;
			}
		}

		/**
		 * @private
		 */
		protected startRepeatTimer(action:Function):void
		{
			this.currentRepeatAction = action;
			if(this._repeatDelay > 0)
			{
				if(!this._repeatTimer)
				{
					this._repeatTimer = new Timer(this._repeatDelay * 1000);
					this._repeatTimer.addEventListener(TimerEvent.TIMER, this.repeatTimer_timerHandler);
				}
				else
				{
					this._repeatTimer.reset();
					this._repeatTimer.delay = this._repeatDelay * 1000;
				}
				this._repeatTimer.start();
			}
		}

		/**
		 * @private
		 */
		protected thumbProperties_onChange(proxy:PropertyProxy, name:Object):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected minimumTrackProperties_onChange(proxy:PropertyProxy, name:Object):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected maximumTrackProperties_onChange(proxy:PropertyProxy, name:Object):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected decrementButtonProperties_onChange(proxy:PropertyProxy, name:Object):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected incrementButtonProperties_onChange(proxy:PropertyProxy, name:Object):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected removedFromStageHandler(event:Event):void
		{
			this._touchPointID = -1;
			if(this._repeatTimer)
			{
				this._repeatTimer.stop();
			}
		}

		/**
		 * @private
		 */
		protected track_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}

			var track:DisplayObject = DisplayObject(event.currentTarget);
			if(this._touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(track, TouchPhase.ENDED, this._touchPointID);
				if(!touch)
				{
					return;
				}
				this._touchPointID = -1;
				this._repeatTimer.stop();
				this.dispatchEventWith(FeathersEventType.END_INTERACTION);
			}
			else
			{
				touch = event.getTouch(track, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				this._touchPointID = touch.id;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
				touch.getLocation(this, ScrollBar.HELPER_POINT);
				this._touchStartX = ScrollBar.HELPER_POINT.x;
				this._touchStartY = ScrollBar.HELPER_POINT.y;
				this._thumbStartX = ScrollBar.HELPER_POINT.x;
				this._thumbStartY = ScrollBar.HELPER_POINT.y;
				this._touchValue = this.locationToValue(ScrollBar.HELPER_POINT);
				this.adjustPage();
				this.startRepeatTimer(this.adjustPage);
			}
		}

		/**
		 * @private
		 */
		protected thumb_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}

			if(this._touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this.thumb, null, this._touchPointID);
				if(!touch)
				{
					return;
				}
				if(touch.phase == TouchPhase.MOVED)
				{
					touch.getLocation(this, ScrollBar.HELPER_POINT);
					var newValue:number = this.locationToValue(ScrollBar.HELPER_POINT);
					if(this._step != 0 && newValue != this._maximum && newValue != this._minimum)
					{
						newValue = roundToNearest(newValue, this._step);
					}
					this.value = newValue;
				}
				else if(touch.phase == TouchPhase.ENDED)
				{
					this._touchPointID = -1;
					this.isDragging = false;
					if(!this.liveDragging)
					{
						this.dispatchEventWith(Event.CHANGE);
					}
					this.dispatchEventWith(FeathersEventType.END_INTERACTION);
				}
			}
			else
			{
				touch = event.getTouch(this.thumb, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				touch.getLocation(this, ScrollBar.HELPER_POINT);
				this._touchPointID = touch.id;
				this._thumbStartX = this.thumb.x;
				this._thumbStartY = this.thumb.y;
				this._touchStartX = ScrollBar.HELPER_POINT.x;
				this._touchStartY = ScrollBar.HELPER_POINT.y;
				this.isDragging = true;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
			}
		}

		/**
		 * @private
		 */
		protected decrementButton_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}

			if(this._touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this.decrementButton, TouchPhase.ENDED, this._touchPointID);
				if(!touch)
				{
					return;
				}
				this._touchPointID = -1;
				this._repeatTimer.stop();
				this.dispatchEventWith(FeathersEventType.END_INTERACTION);
			}
			else //if we get here, we don't have a saved touch ID yet
			{
				touch = event.getTouch(this.decrementButton, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				this._touchPointID = touch.id;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
				this.decrement();
				this.startRepeatTimer(this.decrement);
			}
		}

		/**
		 * @private
		 */
		protected incrementButton_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}

			if(this._touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this.incrementButton, TouchPhase.ENDED, this._touchPointID);
				if(!touch)
				{
					return;
				}
				this._touchPointID = -1;
				this._repeatTimer.stop();
				this.dispatchEventWith(FeathersEventType.END_INTERACTION);
			}
			else //if we get here, we don't have a saved touch ID yet
			{
				touch = event.getTouch(this.incrementButton, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				this._touchPointID = touch.id;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
				this.increment();
				this.startRepeatTimer(this.increment);
			}
		}

		/**
		 * @private
		 */
		protected repeatTimer_timerHandler(event:TimerEvent):void
		{
			if(this._repeatTimer.currentCount < 5)
			{
				return;
			}
			this.currentRepeatAction();
		}
	}
}
