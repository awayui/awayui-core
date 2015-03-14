/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import IFocusDisplayObject = feathers.core.IFocusDisplayObject;
	import PropertyProxy = feathers.core.PropertyProxy;
	import ExclusiveTouch = feathers.events.ExclusiveTouch;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import clamp = feathers.utils.math.clamp;
	import roundToNearest = feathers.utils.math.roundToNearest;

	import TimerEvent = flash.events.TimerEvent;
	import Point = flash.geom.Point;
	import Keyboard = flash.ui.Keyboard;
	import Timer = flash.utils.Timer;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the slider's value changes.
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
	 * Dispatched when the user starts dragging the slider's thumb or track.
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
	 * Dispatched when the user stops dragging the slider's thumb or track.
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
	 * the bounds of a track. The slider's track is divided into two parts split
	 * by the thumb.
	 *
	 * <p>The following example sets the slider's values and listens for when
	 * when the value changes:</p>
	 *
	 * <listing version="3.0">
	 * var slider:Slider = new Slider();
	 * slider.minimum = 0;
	 * slider.maximum = 100;
	 * slider.step = 1;
	 * slider.page = 10;
	 * slider.value = 12;
	 * slider.addEventListener( Event.CHANGE, slider_changeHandler );
	 * this.addChild( slider );</listing>
	 *
	 * @see ../../../help/slider.html How to use the Feathers Slider component
	 */
	export class Slider extends FeathersControl implements IDirectionalScrollBar, IFocusDisplayObject
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
		 * The slider's thumb may be dragged horizontally (on the x-axis).
		 *
		 * @see #direction
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";
		
		/**
		 * The slider's thumb may be dragged vertically (on the y-axis).
		 *
		 * @see #direction
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The slider has only one track, that fills the full length of the
		 * slider. In this layout mode, the "minimum" track is displayed and
		 * fills the entire length of the slider. The maximum track will not
		 * exist.
		 *
		 * @see #trackLayoutMode
		 */
		public static TRACK_LAYOUT_MODE_SINGLE:string = "single";

		/**
		 * The slider has two tracks, stretching to fill each side of the slider
		 * with the thumb in the middle. The tracks will be resized as the thumb
		 * moves. This layout mode is designed for sliders where the two sides
		 * of the track may be colored differently to show the value
		 * "filling up" as the slider is dragged.
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
		 * The slider's track dimensions fill the full width and height of the
		 * slider.
		 *
		 * @see #trackScaleMode
		 */
		public static TRACK_SCALE_MODE_EXACT_FIT:string = "exactFit";

		/**
		 * If the slider's direction is horizontal, the width of the track will
		 * fill the full width of the slider, and if the slider's direction is
		 * vertical, the height of the track will fill the full height of the
		 * slider. The other edge will not be scaled.
		 *
		 * @see #trackScaleMode
		 */
		public static TRACK_SCALE_MODE_DIRECTIONAL:string = "directional";

		/**
		 * When the track is touched, the slider's thumb jumps directly to the
		 * touch position, and the slider's <code>value</code> property is
		 * updated to match as if the thumb were dragged to that position.
		 *
		 * @see #trackInteractionMode
		 */
		public static TRACK_INTERACTION_MODE_TO_VALUE:string = "toValue";

		/**
		 * When the track is touched, the <code>value</code> is increased or
		 * decreased (depending on the location of the touch) by the value of
		 * the <code>page</code> property.
		 *
		 * @see #trackInteractionMode
		 */
		public static TRACK_INTERACTION_MODE_BY_PAGE:string = "byPage";

		/**
		 * The default value added to the <code>styleNameList</code> of the
		 * minimum track.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK:string = "feathers-slider-minimum-track";

		/**
		 * DEPRECATED: Replaced by <code>Slider.DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Slider#DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK
		 */
		public static DEFAULT_CHILD_NAME_MINIMUM_TRACK:string = Slider.DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK;

		/**
		 * The default value added to the <code>styleNameList</code> of the
		 * maximum track.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK:string = "feathers-slider-maximum-track";

		/**
		 * DEPRECATED: Replaced by <code>Slider.DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Slider#DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK
		 */
		public static DEFAULT_CHILD_NAME_MAXIMUM_TRACK:string = Slider.DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK;

		/**
		 * The default value added to the <code>styleNameList</code> of the thumb.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_THUMB:string = "feathers-slider-thumb";

		/**
		 * DEPRECATED: Replaced by <code>Slider.DEFAULT_CHILD_STYLE_NAME_THUMB</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Slider#DEFAULT_CHILD_STYLE_NAME_THUMB
		 */
		public static DEFAULT_CHILD_NAME_THUMB:string = Slider.DEFAULT_CHILD_STYLE_NAME_THUMB;

		/**
		 * The default <code>IStyleProvider</code> for all <code>Slider</code>
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
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.slider_removedFromStageHandler);
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
		protected minimumTrackStyleName:string = Slider.DEFAULT_CHILD_STYLE_NAME_MINIMUM_TRACK;

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
		protected maximumTrackStyleName:string = Slider.DEFAULT_CHILD_STYLE_NAME_MAXIMUM_TRACK;

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
		protected thumbStyleName:string = Slider.DEFAULT_CHILD_STYLE_NAME_THUMB;

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
		 * The thumb sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #thumbFactory
		 * @see #createThumb()
		 */
		protected thumb:Button;
		
		/**
		 * The minimum track sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #minimumTrackFactory
		 * @see #createMinimumTrack()
		 */
		protected minimumTrack:Button;

		/**
		 * The maximum track sub-component.
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
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Slider.globalStyleProvider;
		}
		
		/**
		 * @private
		 */
		protected _direction:string = Slider.DIRECTION_HORIZONTAL;

		/*[Inspectable(type="String",enumeration="horizontal,vertical")]*/
		/**
		 * Determines if the slider's thumb can be dragged horizontally or
		 * vertically. When this value changes, the slider's width and height
		 * values do not change automatically.
		 *
		 * <p>In the following example, the direction is changed to vertical:</p>
		 *
		 * <listing version="3.0">
		 * slider.direction = Slider.DIRECTION_VERTICAL;</listing>
		 *
		 * @default Slider.DIRECTION_HORIZONTAL
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
			this.invalidate(Slider.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
			this.invalidate(Slider.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);
			this.invalidate(Slider.INVALIDATION_FLAG_THUMB_FACTORY);
		}
		
		/**
		 * @private
		 */
		protected _value:number = 0;
		
		/**
		 * The value of the slider, between the minimum and maximum.
		 *
		 * <p>In the following example, the value is changed to 12:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimum = 0;
		 * slider.maximum = 100;
		 * slider.step = 1;
		 * slider.page = 10
		 * slider.value = 12;</listing>
		 *
		 * @default 0
		 *
		 * @see #minimum
		 * @see #maximum
		 * @see #step
		 * @see #page
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
			if(this._step != 0 && newValue != this._maximum && newValue != this._minimum)
			{
				newValue = roundToNearest(newValue - this._minimum, this._step) + this._minimum;
			}
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
		 * The slider's value will not go lower than the minimum.
		 *
		 * <p>In the following example, the minimum is set to 0:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimum = 0;
		 * slider.maximum = 100;
		 * slider.step = 1;
		 * slider.page = 10
		 * slider.value = 12;</listing>
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
		 * The slider's value will not go higher than the maximum. The maximum
		 * is zero (<code>0</code>), by default, and it should almost always be
		 * changed to something more appropriate.
		 *
		 * <p>In the following example, the maximum is set to 100:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimum = 0;
		 * slider.maximum = 100;
		 * slider.step = 1;
		 * slider.page = 10
		 * slider.value = 12;</listing>
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
		 * As the slider's thumb is dragged, the value is snapped to a multiple
		 * of the step. Paging using the slider's track will use the <code>step</code>
		 * value if the <code>page</code> value is <code>NaN</code>. If the
		 * <code>step</code> is zero (<code>0</code>), paging with the track will not be possible.
		 *
		 * <p>In the following example, the step is changed to 1:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimum = 0;
		 * slider.maximum = 100;
		 * slider.step = 1;
		 * slider.page = 10;
		 * slider.value = 10;</listing>
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
			if(this._step == value)
			{
				return;
			}
			this._step = value;
		}

		/**
		 * @private
		 */
		protected _page:number = NaN;

		/**
		 * If the <code>trackInteractionMode</code> property is set to
		 * <code>Slider.TRACK_INTERACTION_MODE_BY_PAGE</code>, and the slider's
		 * track is touched, and the thumb is shown, the slider value will be
		 * incremented or decremented by the page value.
		 *
		 * <p>If this value is <code>NaN</code>, the <code>step</code> value
		 * will be used instead. If the <code>step</code> value is zero, paging
		 * with the track is not possible.</p>
		 *
		 * <p>In the following example, the page is changed to 10:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimum = 0;
		 * slider.maximum = 100;
		 * slider.step = 1;
		 * slider.page = 10
		 * slider.value = 12;</listing>
		 *
		 * @default NaN
		 *
		 * @see #value
		 * @see #page
		 * @see #trackInteractionMode
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
		}
		
		/**
		 * @private
		 */
		protected isDragging:boolean = false;
		
		/**
		 * Determines if the slider dispatches the <code>Event.CHANGE</code>
		 * event every time the thumb moves, or only once it stops moving.
		 *
		 * <p>In the following example, live dragging is disabled:</p>
		 *
		 * <listing version="3.0">
		 * slider.liveDragging = false;</listing>
		 *
		 * @default true
		 */
		public liveDragging:boolean = true;
		
		/**
		 * @private
		 */
		protected _showThumb:boolean = true;
		
		/**
		 * Determines if the thumb should be displayed.
		 *
		 * <p>In the following example, the thumb is hidden:</p>
		 *
		 * <listing version="3.0">
		 * slider.showThumb = false;</listing>
		 *
		 * @default true
		 */
		public get showThumb():boolean
		{
			return this._showThumb;
		}
		
		/**
		 * @private
		 */
		public set showThumb(value:boolean)
		{
			if(this._showThumb == value)
			{
				return;
			}
			this._showThumb = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _minimumPadding:number = 0;

		/**
		 * The space, in pixels, between the minimum position of the thumb and
		 * the minimum edge of the track. May be negative to extend the range of
		 * the thumb.
		 *
		 * <p>In the following example, minimum padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimumPadding = 20;</listing>
		 *
		 * @default 0
		 */
		public get minimumPadding():number
		{
			return this._minimumPadding;
		}

		/**
		 * @private
		 */
		public set minimumPadding(value:number)
		{
			if(this._minimumPadding == value)
			{
				return;
			}
			this._minimumPadding = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _maximumPadding:number = 0;

		/**
		 * The space, in pixels, between the maximum position of the thumb and
		 * the maximum edge of the track. May be negative to extend the range
		 * of the thumb.
		 *
		 * <p>In the following example, maximum padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * slider.maximumPadding = 20;</listing>
		 *
		 * @default 0
		 */
		public get maximumPadding():number
		{
			return this._maximumPadding;
		}

		/**
		 * @private
		 */
		public set maximumPadding(value:number)
		{
			if(this._maximumPadding == value)
			{
				return;
			}
			this._maximumPadding = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _trackLayoutMode:string = Slider.TRACK_LAYOUT_MODE_SINGLE;

		/*[Inspectable(type="String",enumeration="single,minMax")]*/
		/**
		 * Determines how the minimum and maximum track skins are positioned and
		 * sized.
		 *
		 * <p>In the following example, the slider is given two tracks:</p>
		 *
		 * <listing version="3.0">
		 * slider.trackLayoutMode = Slider.TRACK_LAYOUT_MODE_MIN_MAX;</listing>
		 *
		 * @default Slider.TRACK_LAYOUT_MODE_SINGLE
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
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _trackScaleMode:string = Slider.TRACK_SCALE_MODE_DIRECTIONAL;

		/*[Inspectable(type="String",enumeration="exactFit,directional")]*/
		/**
		 * Determines how the minimum and maximum track skins are positioned and
		 * sized.
		 *
		 * <p>In the following example, the slider's track layout is customized:</p>
		 *
		 * <listing version="3.0">
		 * slider.trackScaleMode = Slider.TRACK_SCALE_MODE_EXACT_FIT;</listing>
		 *
		 * @default Slider.TRACK_SCALE_MODE_DIRECTIONAL
		 *
		 * @see #TRACK_SCALE_MODE_DIRECTIONAL
		 * @see #TRACK_SCALE_MODE_EXACT_FIT
		 * @see #trackLayoutMode
		 */
		public get trackScaleMode():string
		{
			return this._trackScaleMode;
		}

		/**
		 * @private
		 */
		public set trackScaleMode(value:string)
		{
			if(this._trackScaleMode == value)
			{
				return;
			}
			this._trackScaleMode = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _trackInteractionMode:string = Slider.TRACK_INTERACTION_MODE_TO_VALUE;

		/*[Inspectable(type="String",enumeration="toValue,byPage")]*/
		/**
		 * Determines how the slider's value changes when the track is touched.
		 *
		 * <p>If <code>showThumb</code> is set to <code>false</code>, the slider
		 * will always behave as if <code>trackInteractionMode</code> has been
		 * set to <code>Slider.TRACK_INTERACTION_MODE_TO_VALUE</code>. In other
		 * words, the value of <code>trackInteractionMode</code> may be ignored
		 * if the thumb is hidden.</p>
		 *
		 * <p>In the following example, the slider's track interaction is changed:</p>
		 *
		 * <listing version="3.0">
		 * slider.trackScaleMode = Slider.TRACK_INTERACTION_MODE_BY_PAGE;</listing>
		 *
		 * @default Slider.TRACK_INTERACTION_MODE_TO_VALUE
		 *
		 * @see #TRACK_INTERACTION_MODE_TO_VALUE
		 * @see #TRACK_INTERACTION_MODE_BY_PAGE
		 * @see #page
		 */
		public get trackInteractionMode():string
		{
			return this._trackInteractionMode;
		}

		/**
		 * @private
		 */
		public set trackInteractionMode(value:string)
		{
			this._trackInteractionMode = value;
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
		 * <p>In the following example, the slider's repeat delay is set to
		 * 500 milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * slider.repeatDelay = 0.5;</listing>
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
		protected _minimumTrackFactory:Function;

		/**
		 * A function used to generate the slider's minimum track sub-component.
		 * The minimum track must be an instance of <code>Button</code>. This
		 * factory can be used to change properties on the minimum track when it
		 * is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the minimum track.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom minimum track factory is passed
		 * to the slider:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimumTrackFactory = function():Button
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
			this.invalidate(Slider.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customMinimumTrackStyleName:string;

		/**
		 * A style name to add to the slider's minimum track sub-component.
		 * Typically used by a theme to provide different styles to different
		 * sliders.
		 *
		 * <p>In the following example, a custom minimum track style name is
		 * passed to the slider:</p>
		 *
		 * <listing version="3.0">
		 * slider.customMinimumTrackStyleName = "my-custom-minimum-track";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
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
			this.invalidate(Slider.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
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
		 * A set of key/value pairs to be passed down to the slider's minimum
		 * track sub-component. The minimum track is a
		 * <code>feathers.controls.Button</code> instance that is created by
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
		 * <p>In the following example, the slider's minimum track properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * slider.minimumTrackProperties.defaultSkin = new Image( upTexture );
		 * slider.minimumTrackProperties.downSkin = new Image( downTexture );</listing>
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
				this._minimumTrackProperties = new PropertyProxy(this.childProperties_onChange);
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
				this._minimumTrackProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._minimumTrackProperties = PropertyProxy(value);
			if(this._minimumTrackProperties)
			{
				this._minimumTrackProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _maximumTrackFactory:Function;

		/**
		 * A function used to generate the slider's maximum track sub-component.
		 * The maximum track must be an instance of <code>Button</code>.
		 * This factory can be used to change properties on the maximum track
		 * when it is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the maximum track.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom maximum track factory is passed
		 * to the slider:</p>
		 *
		 * <listing version="3.0">
		 * slider.maximumTrackFactory = function():Button
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
			this.invalidate(Slider.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customMaximumTrackStyleName:string;

		/**
		 * A style name to add to the slider's maximum track sub-component.
		 * Typically used by a theme to provide different skins to different
		 * sliders.
		 *
		 * <p>In the following example, a custom maximum track style name is
		 * passed to the slider:</p>
		 *
		 * <listing version="3.0">
		 * slider.customMaximumTrackStyleName = "my-custom-maximum-track";</listing>
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
			this.invalidate(Slider.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);
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
		 * A set of key/value pairs to be passed down to the slider's maximum
		 * track sub-component. The maximum track is a
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
		 * <p>In the following example, the slider's maximum track properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * slider.maximumTrackProperties.defaultSkin = new Image( upTexture );
		 * slider.maximumTrackProperties.downSkin = new Image( downTexture );</listing>
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
				this._maximumTrackProperties = new PropertyProxy(this.childProperties_onChange);
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
				this._maximumTrackProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._maximumTrackProperties = PropertyProxy(value);
			if(this._maximumTrackProperties)
			{
				this._maximumTrackProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _thumbFactory:Function;

		/**
		 * A function used to generate the slider's thumb sub-component.
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
		 * to the slider:</p>
		 *
		 * <listing version="3.0">
		 * slider.thumbFactory = function():Button
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
			this.invalidate(Slider.INVALIDATION_FLAG_THUMB_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customThumbStyleName:string;

		/**
		 * A style name to add to the slider's thumb sub-component. Typically
		 * used by a theme to provide different styles to different sliders.
		 *
		 * <p>In the following example, a custom thumb style name is passed
		 * to the slider:</p>
		 *
		 * <listing version="3.0">
		 * slider.customThumbStyleName = "my-custom-thumb";</listing>
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
			this.invalidate(Slider.INVALIDATION_FLAG_THUMB_FACTORY);
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
		 * A set of key/value pairs to be passed down to the slider's thumb
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
		 * <p>In the following example, the slider's thumb properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * slider.thumbProperties.defaultSkin = new Image( upTexture );
		 * slider.thumbProperties.downSkin = new Image( downTexture );</listing>
		 *
		 * @default null
		 * 
		 * @see feathers.controls.Button
		 * @see #thumbFactory
		 */
		public get thumbProperties():Object
		{
			if(!this._thumbProperties)
			{
				this._thumbProperties = new PropertyProxy(this.childProperties_onChange);
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
				this._thumbProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._thumbProperties = PropertyProxy(value);
			if(this._thumbProperties)
			{
				this._thumbProperties.addOnChangeCallback(this.childProperties_onChange);
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
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var focusInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_FOCUS);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);
			var thumbFactoryInvalid:boolean = this.isInvalid(Slider.INVALIDATION_FLAG_THUMB_FACTORY);
			var minimumTrackFactoryInvalid:boolean = this.isInvalid(Slider.INVALIDATION_FLAG_MINIMUM_TRACK_FACTORY);
			var maximumTrackFactoryInvalid:boolean = this.isInvalid(Slider.INVALIDATION_FLAG_MAXIMUM_TRACK_FACTORY);

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

			if(thumbFactoryInvalid || stylesInvalid)
			{
				this.refreshThumbStyles();
			}
			if(minimumTrackFactoryInvalid || stylesInvalid)
			{
				this.refreshMinimumTrackStyles();
			}
			if((maximumTrackFactoryInvalid || layoutInvalid || stylesInvalid) && this.maximumTrack)
			{
				this.refreshMaximumTrackStyles();
			}
			
			if(thumbFactoryInvalid || stateInvalid)
			{
				this.thumb.isEnabled = this._isEnabled;
			}
			if(minimumTrackFactoryInvalid || stateInvalid)
			{
				this.minimumTrack.isEnabled = this._isEnabled;
			}
			if((maximumTrackFactoryInvalid || layoutInvalid || stateInvalid) && this.maximumTrack)
			{
				this.maximumTrack.isEnabled = this._isEnabled;
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			this.layoutChildren();

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

			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				return false;
			}
			this.thumb.validate();
			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				if(this._direction == Slider.DIRECTION_VERTICAL)
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
				}
				newWidth = Math.max(newWidth, this.thumb.width);
			}
			if(needsHeight)
			{
				if(this._direction == Slider.DIRECTION_VERTICAL)
				{
					if(this.maximumTrack)
					{
						newHeight = Math.min(this.minimumTrackOriginalHeight, this.maximumTrackOriginalHeight) + this.thumb.height / 2;
					}
					else
					{
						newHeight = this.minimumTrackOriginalHeight;
					}
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
				newHeight = Math.max(newHeight, this.thumb.height);
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

			var factory:Function = this._thumbFactory != null ? this._thumbFactory : Slider.defaultThumbFactory;
			var thumbStyleName:string = this._customThumbStyleName != null ? this._customThumbStyleName : this.thumbStyleName;
			this.thumb = this.Button(factory());
			this.thumb.styleNameList.add(thumbStyleName);
			this.thumb.keepDownStateOnRollOut = true;
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

			var factory:Function = this._minimumTrackFactory != null ? this._minimumTrackFactory : Slider.defaultMinimumTrackFactory;
			var minimumTrackStyleName:string = this._customMinimumTrackStyleName != null ? this._customMinimumTrackStyleName : this.minimumTrackStyleName;
			this.minimumTrack = this.Button(factory());
			this.minimumTrack.styleNameList.add(minimumTrackStyleName);
			this.minimumTrack.keepDownStateOnRollOut = true;
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
			if(this._trackLayoutMode == Slider.TRACK_LAYOUT_MODE_MIN_MAX)
			{
				if(this.maximumTrack)
				{
					this.maximumTrack.removeFromParent(true);
					this.maximumTrack = null;
				}
				var factory:Function = this._maximumTrackFactory != null ? this._maximumTrackFactory : Slider.defaultMaximumTrackFactory;
				var maximumTrackStyleName:string = this._customMaximumTrackStyleName != null ? this._customMaximumTrackStyleName : this.maximumTrackStyleName;
				this.maximumTrack = this.Button(factory());
				this.maximumTrack.styleNameList.add(maximumTrackStyleName);
				this.maximumTrack.keepDownStateOnRollOut = true;
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
		 * @private
		 */
		protected refreshThumbStyles():void
		{
			for(var propertyName:string in this._thumbProperties)
			{
				var propertyValue:Object = this._thumbProperties[propertyName];
				this.thumb[propertyName] = propertyValue;
			}
			this.thumb.visible = this._showThumb;
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
		protected layoutChildren():void
		{
			this.layoutThumb();

			if(this._trackLayoutMode == Slider.TRACK_LAYOUT_MODE_MIN_MAX)
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
		protected layoutThumb():void
		{
			//this will auto-size the thumb, if needed
			this.thumb.validate();

			if(this._direction == Slider.DIRECTION_VERTICAL)
			{
				var trackScrollableHeight:number = this.actualHeight - this.thumb.height - this._minimumPadding - this._maximumPadding;
				this.thumb.x = (this.actualWidth - this.thumb.width) / 2;
				this.thumb.y = this._minimumPadding + trackScrollableHeight * (1 - (this._value - this._minimum) / (this._maximum - this._minimum));
			}
			else
			{
				var trackScrollableWidth:number = this.actualWidth - this.thumb.width - this._minimumPadding - this._maximumPadding;
				this.thumb.x = this._minimumPadding + (trackScrollableWidth * (this._value - this._minimum) / (this._maximum - this._minimum));
				this.thumb.y = (this.actualHeight - this.thumb.height) / 2;
			}
		}

		/**
		 * @private
		 */
		protected layoutTrackWithMinMax():void
		{
			if(this._direction == Slider.DIRECTION_VERTICAL)
			{
				this.maximumTrack.y = 0;
				this.maximumTrack.height = this.thumb.y + this.thumb.height / 2;
				this.minimumTrack.y = this.maximumTrack.height;
				this.minimumTrack.height = this.actualHeight - this.minimumTrack.y;

				if(this._trackScaleMode == Slider.TRACK_SCALE_MODE_DIRECTIONAL)
				{
					this.maximumTrack.width = NaN;
					this.maximumTrack.validate();
					this.maximumTrack.x = (this.actualWidth - this.maximumTrack.width) / 2;
					this.minimumTrack.width = NaN;
					this.minimumTrack.validate();
					this.minimumTrack.x = (this.actualWidth - this.minimumTrack.width) / 2;
				}
				else //exact fit
				{
					this.maximumTrack.x = 0;
					this.maximumTrack.width = this.actualWidth;
					this.minimumTrack.x = 0;
					this.minimumTrack.width = this.actualWidth;

					//final validation to avoid juggler next frame issues
					this.minimumTrack.validate();
					this.maximumTrack.validate();
				}
			}
			else //horizontal
			{
				this.minimumTrack.x = 0;
				this.minimumTrack.width = this.thumb.x + this.thumb.width / 2;
				this.maximumTrack.x = this.minimumTrack.width;
				this.maximumTrack.width = this.actualWidth - this.maximumTrack.x;

				if(this._trackScaleMode == Slider.TRACK_SCALE_MODE_DIRECTIONAL)
				{
					this.minimumTrack.height = NaN;
					this.minimumTrack.validate();
					this.minimumTrack.y = (this.actualHeight - this.minimumTrack.height) / 2;
					this.maximumTrack.height = NaN;
					this.maximumTrack.validate();
					this.maximumTrack.y = (this.actualHeight - this.maximumTrack.height) / 2;
				}
				else //exact fit
				{
					this.minimumTrack.y = 0;
					this.minimumTrack.height = this.actualHeight;
					this.maximumTrack.y = 0;
					this.maximumTrack.height = this.actualHeight;

					//final validation to avoid juggler next frame issues
					this.minimumTrack.validate();
					this.maximumTrack.validate();
				}
			}
		}

		/**
		 * @private
		 */
		protected layoutTrackWithSingle():void
		{
			if(this._trackScaleMode == Slider.TRACK_SCALE_MODE_DIRECTIONAL)
			{
				if(this._direction == Slider.DIRECTION_VERTICAL)
				{
					this.minimumTrack.y = 0;
					this.minimumTrack.width = NaN;
					this.minimumTrack.height = this.actualHeight;
					this.minimumTrack.validate();
					this.minimumTrack.x = (this.actualWidth - this.minimumTrack.width) / 2;
				}
				else //horizontal
				{
					this.minimumTrack.x = 0;
					this.minimumTrack.width = this.actualWidth;
					this.minimumTrack.height = NaN;
					this.minimumTrack.validate();
					this.minimumTrack.y = (this.actualHeight - this.minimumTrack.height) / 2;
				}
			}
			else //exact fit
			{
				this.minimumTrack.x = 0;
				this.minimumTrack.y = 0;
				this.minimumTrack.width = this.actualWidth;
				this.minimumTrack.height = this.actualHeight;

				//final validation to avoid juggler next frame issues
				this.minimumTrack.validate();
			}
		}

		/**
		 * @private
		 */
		protected locationToValue(location:Point):number
		{
			var percentage:number;
			if(this._direction == Slider.DIRECTION_VERTICAL)
			{
				var trackScrollableHeight:number = this.actualHeight - this.thumb.height - this._minimumPadding - this._maximumPadding;
				var yOffset:number = location.y - this._touchStartY - this._maximumPadding;
				var yPosition:number = Math.min(Math.max(0, this._thumbStartY + yOffset), trackScrollableHeight);
				percentage = 1 - (yPosition / trackScrollableHeight);
			}
			else //horizontal
			{
				var trackScrollableWidth:number = this.actualWidth - this.thumb.width - this._minimumPadding - this._maximumPadding;
				var xOffset:number = location.x - this._touchStartX - this._minimumPadding;
				var xPosition:number = Math.min(Math.max(0, this._thumbStartX + xOffset), trackScrollableWidth);
				percentage = xPosition / trackScrollableWidth;
			}

			return this._minimum + percentage * (this._maximum - this._minimum);
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
		protected adjustPage():void
		{
			var page:number = this._page;
			if(page !== page) //isNaN
			{
				page = this._step;
			}
			if(this._touchValue < this._value)
			{
				this.value = Math.max(this._touchValue, this._value - page);
			}
			else if(this._touchValue > this._value)
			{
				this.value = Math.min(this._touchValue, this._value + page);
			}
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
		protected slider_removedFromStageHandler(event:Event):void
		{
			this._touchPointID = -1;
			var wasDragging:boolean = this.isDragging;
			this.isDragging = false;
			if(wasDragging && !this.liveDragging)
			{
				this.dispatchEventWith(Event.CHANGE);
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
				var touch:Touch = event.getTouch(track, null, this._touchPointID);
				if(!touch)
				{
					return;
				}
				if(!this._showThumb && touch.phase == TouchPhase.MOVED)
				{
					touch.getLocation(this, Slider.HELPER_POINT);
					this.value = this.locationToValue(Slider.HELPER_POINT);
				}
				else if(touch.phase == TouchPhase.ENDED)
				{
					if(this._repeatTimer)
					{
						this._repeatTimer.stop();
					}
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
				touch = event.getTouch(track, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				touch.getLocation(this, Slider.HELPER_POINT);
				this._touchPointID = touch.id;
				if(this._direction == Slider.DIRECTION_VERTICAL)
				{
					this._thumbStartX = Slider.HELPER_POINT.x;
					this._thumbStartY = Math.min(this.actualHeight - this.thumb.height, Math.max(0, Slider.HELPER_POINT.y - this.thumb.height / 2));
				}
				else //horizontal
				{
					this._thumbStartX = Math.min(this.actualWidth - this.thumb.width, Math.max(0, Slider.HELPER_POINT.x - this.thumb.width / 2));
					this._thumbStartY = Slider.HELPER_POINT.y;
				}
				this._touchStartX = Slider.HELPER_POINT.x;
				this._touchStartY = Slider.HELPER_POINT.y;
				this._touchValue = this.locationToValue(Slider.HELPER_POINT);
				this.isDragging = true;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
				if(this._showThumb && this._trackInteractionMode == Slider.TRACK_INTERACTION_MODE_BY_PAGE)
				{
					this.adjustPage();
					this.startRepeatTimer(this.adjustPage);
				}
				else
				{
					this.value = this._touchValue;
				}
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
					var exclusiveTouch:ExclusiveTouch = ExclusiveTouch.forStage(this.stage);
					var claim:DisplayObject = exclusiveTouch.getClaim(this._touchPointID);
					if(claim != this)
					{
						if(claim)
						{
							//already claimed by another display object
							return;
						}
						else
						{
							exclusiveTouch.claimTouch(this._touchPointID, this);
						}
					}
					touch.getLocation(this, Slider.HELPER_POINT);
					this.value = this.locationToValue(Slider.HELPER_POINT);
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
				touch.getLocation(this, Slider.HELPER_POINT);
				this._touchPointID = touch.id;
				this._thumbStartX = this.thumb.x;
				this._thumbStartY = this.thumb.y;
				this._touchStartX = Slider.HELPER_POINT.x;
				this._touchStartY = Slider.HELPER_POINT.y;
				this.isDragging = true;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
			}
		}

		/**
		 * @private
		 */
		protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.keyCode == Keyboard.HOME)
			{
				this.value = this._minimum;
				return;
			}
			if(event.keyCode == Keyboard.END)
			{
				this.value = this._maximum;
				return;
			}
			var page:number = this._page;
			if(page !== page) //isNaN
			{
				page = this._step;
			}
			if(this._direction == Slider.DIRECTION_VERTICAL)
			{
				if(event.keyCode == Keyboard.UP)
				{
					if(event.shiftKey)
					{
						this.value += page;
					}
					else
					{
						this.value += this._step;
					}
				}
				else if(event.keyCode == Keyboard.DOWN)
				{
					if(event.shiftKey)
					{
						this.value -= page;
					}
					else
					{
						this.value -= this._step;
					}
				}
			}
			else
			{
				if(event.keyCode == Keyboard.LEFT)
				{
					if(event.shiftKey)
					{
						this.value -= page;
					}
					else
					{
						this.value -= this._step;
					}
				}
				else if(event.keyCode == Keyboard.RIGHT)
				{
					if(event.shiftKey)
					{
						this.value += page;
					}
					else
					{
						this.value += this._step;
					}
				}
			}
		}

		/**
		 * @private
		 */
		protected repeatTimer_timerHandler(event:TimerEvent):void
		{
			var exclusiveTouch:ExclusiveTouch = ExclusiveTouch.forStage(this.stage);
			var claim:DisplayObject = exclusiveTouch.getClaim(this._touchPointID);
			if(claim && claim != this)
			{
				return;
			}
			if(this._repeatTimer.currentCount < 5)
			{
				return;
			}
			this.currentRepeatAction();
		}
	}
}