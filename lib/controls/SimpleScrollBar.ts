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

	import Quad = starling.display.Quad;
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
	 * Dispatched when the user starts dragging the scroll bar's thumb.
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
	 * Dispatched when the user stops dragging the scroll bar's thumb.
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
	 * a physical range. This type of scroll bar does not have a visible track,
	 * and it does not have increment and decrement buttons. It is ideal for
	 * mobile applications where the scroll bar is often simply a visual element
	 * to indicate the scroll position. For a more feature-rich scroll bar,
	 * see the <code>ScrollBar</code> component.
	 *
	 * <p>The following example updates a list to use simple scroll bars:</p>
	 *
	 * <listing version="3.0">
	 * list.horizontalScrollBarFactory = function():IScrollBar
	 * {
	 *     var scrollBar:SimpleScrollBar = new SimpleScrollBar();
	 *     scrollBar.direction = SimpleScrollBar.DIRECTION_HORIZONTAL;
	 *     return scrollBar;
	 * };
	 * list.verticalScrollBarFactory = function():IScrollBar
	 * {
	 *     var scrollBar:SimpleScrollBar = new SimpleScrollBar();
	 *     scrollBar.direction = SimpleScrollBar.DIRECTION_VERTICAL;
	 *     return scrollBar;
	 * };</listing>
	 *
	 * @see ../../../help/simple-scroll-bar.html How to use the Feathers SimpleScrollBar component
	 * @see feathers.controls.ScrollBar
	 */
	export class SimpleScrollBar extends FeathersControl implements IDirectionalScrollBar
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
		 * The default value added to the <code>styleNameList</code> of the thumb.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_THUMB:string = "feathers-simple-scroll-bar-thumb";

		/**
		 * DEPRECATED: Replaced by <code>Scroller.DEFAULT_CHILD_STYLE_NAME_THUMB</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Scroller#DEFAULT_CHILD_STYLE_NAME_THUMB
		 */
		public static DEFAULT_CHILD_NAME_THUMB:string = SimpleScrollBar.DEFAULT_CHILD_STYLE_NAME_THUMB;

		/**
		 * The default <code>IStyleProvider</code> for all <code>SimpleScrollBar</code>
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
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.removedFromStageHandler);
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
		protected thumbStyleName:string = SimpleScrollBar.DEFAULT_CHILD_STYLE_NAME_THUMB;

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
		 * @private
		 */
		protected thumbOriginalWidth:number = NaN;

		/**
		 * @private
		 */
		protected thumbOriginalHeight:number = NaN;

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
		 * @private
		 */
		protected track:Quad;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return SimpleScrollBar.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _direction:string = SimpleScrollBar.DIRECTION_HORIZONTAL;

		/*[Inspectable(type="String",enumeration="horizontal,vertical")]*/
		/**
		 * Determines if the scroll bar's thumb can be dragged horizontally or
		 * vertically. When this value changes, the scroll bar's width and
		 * height values do not change automatically.
		 *
		 * <p>In the following example, the direction is changed to vertical:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.direction = SimpleScrollBar.DIRECTION_VERTICAL;</listing>
		 *
		 * @default SimpleScrollBar.DIRECTION_HORIZONTAL
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
			this.invalidate(SimpleScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);
		}

		/**
		 * Determines if the value should be clamped to the range between the
		 * minimum and maximum. If <code>false</code> and the value is outside of the range,
		 * the thumb will shrink as if the range were increasing.
		 *
		 * <p>In the following example, the clamping behavior is updated:</p>
		 *
		 * <listing version="3.0">
		 * scrollBar.clampToRange = true;</listing>
		 *
		 * @default false
		 */
		public clampToRange:boolean = false;

		/**
		 * @private
		 */
		protected _value:number = 0;

		/**
		 * @inheritDoc
		 *
		 * @default 0
		 *
		 * @see #maximum
		 * @see #minimum
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
			if(this.clampToRange)
			{
				newValue = clamp(newValue, this._minimum, this._maximum);
			}
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
		 * The minimum space, in pixels, above the thumb.
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
		 * The minimum space, in pixels, to the right of the thumb.
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
		 * The minimum space, in pixels, below the thumb.
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
		 * The minimum space, in pixels, to the left of the thumb.
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
			this.invalidate(SimpleScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);
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
			this.invalidate(SimpleScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);
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
		/*override*/ protected initialize():void
		{
			if(!this.track)
			{
				this.track = new Quad(10, 10, 0xff00ff);
				this.track.alpha = 0;
				this.track.addEventListener(TouchEvent.TOUCH, this.track_touchHandler);
				this.addChild(this.track);
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA)
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var thumbFactoryInvalid:boolean = this.isInvalid(SimpleScrollBar.INVALIDATION_FLAG_THUMB_FACTORY);

			if(thumbFactoryInvalid)
			{
				this.createThumb();
			}

			if(thumbFactoryInvalid || stylesInvalid)
			{
				this.refreshThumbStyles();
			}

			if(dataInvalid || thumbFactoryInvalid || stateInvalid)
			{
				this.thumb.isEnabled = this._isEnabled && this._maximum > this._minimum;
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
			if(this.thumbOriginalWidth !== this.thumbOriginalWidth ||
				this.thumbOriginalHeight !== this.thumbOriginalHeight) //isNaN
			{
				this.thumb.validate();
				this.thumbOriginalWidth = this.thumb.width;
				this.thumbOriginalHeight = this.thumb.height;
			}

			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				return false;
			}

			var range:number = this._maximum - this._minimum;
			var adjustedPage:number = this._page;
			if(adjustedPage === 0)
			{
				//fall back to using step!
				adjustedPage = this._step;
			}
			if(adjustedPage > range)
			{
				adjustedPage = range;
			}
			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				if(this._direction == SimpleScrollBar.DIRECTION_VERTICAL)
				{
					newWidth = this.thumbOriginalWidth;
				}
				else //horizontal
				{
					if(adjustedPage === 0)
					{
						newWidth = this.thumbOriginalWidth;
					}
					else
					{
						newWidth = this.thumbOriginalWidth * range / adjustedPage;
						if(newWidth < this.thumbOriginalWidth)
						{
							newWidth = this.thumbOriginalWidth;
						}
					}
				}
				newWidth += this._paddingLeft + this._paddingRight;
			}
			if(needsHeight)
			{
				if(this._direction == SimpleScrollBar.DIRECTION_VERTICAL)
				{
					if(adjustedPage === 0)
					{
						newHeight = this.thumbOriginalHeight;
					}
					else
					{
						newHeight = this.thumbOriginalHeight * range / adjustedPage;
						if(newHeight < this.thumbOriginalHeight)
						{
							newHeight = this.thumbOriginalHeight;
						}
					}
				}
				else //horizontal
				{
					newHeight = this.thumbOriginalHeight;
				}
				newHeight += this._paddingTop + this._paddingBottom;
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

			var factory:Function = this._thumbFactory != null ? this._thumbFactory : SimpleScrollBar.defaultThumbFactory;
			var thumbStyleName:string = this._customThumbStyleName != null ? this._customThumbStyleName : this.thumbStyleName;
			this.thumb = this.Button(factory());
			this.thumb.styleNameList.add(thumbStyleName);
			this.thumb.isFocusEnabled = false;
			this.thumb.keepDownStateOnRollOut = true;
			this.thumb.addEventListener(TouchEvent.TOUCH, this.thumb_touchHandler);
			this.addChild(this.thumb);
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
		protected layout():void
		{
			this.track.width = this.actualWidth;
			this.track.height = this.actualHeight;

			var range:number = this._maximum - this._minimum;
			this.thumb.visible = range > 0;
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
			else if(adjustedPage > range)
			{
				adjustedPage = range;
			}
			var valueOffset:number = 0;
			if(this._value < this._minimum)
			{
				valueOffset = (this._minimum - this._value);
			}
			if(this._value > this._maximum)
			{
				valueOffset = (this._value - this._maximum);
			}
			if(this._direction == SimpleScrollBar.DIRECTION_VERTICAL)
			{
				this.thumb.width = this.thumbOriginalWidth;
				var thumbMinHeight:number = this.thumb.minHeight > 0 ? this.thumb.minHeight : this.thumbOriginalHeight;
				var thumbHeight:number = contentHeight * adjustedPage / range;
				var heightOffset:number = contentHeight - thumbHeight;
				if(heightOffset > thumbHeight)
				{
					heightOffset = thumbHeight;
				}
				heightOffset *=  valueOffset / (range * thumbHeight / contentHeight);
				thumbHeight -= heightOffset;
				if(thumbHeight < thumbMinHeight)
				{
					thumbHeight = thumbMinHeight;
				}
				this.thumb.height = thumbHeight;
				this.thumb.x = this._paddingLeft + (this.actualWidth - this._paddingLeft - this._paddingRight - this.thumb.width) / 2;
				var trackScrollableHeight:number = contentHeight - this.thumb.height;
				var thumbY:number = trackScrollableHeight * (this._value - this._minimum) / range;
				if(thumbY > trackScrollableHeight)
				{
					thumbY = trackScrollableHeight;
				}
				else if(thumbY < 0)
				{
					thumbY = 0;
				}
				this.thumb.y = this._paddingTop + thumbY;
			}
			else //horizontal
			{
				var thumbMinWidth:number = this.thumb.minWidth > 0 ? this.thumb.minWidth : this.thumbOriginalWidth;
				var thumbWidth:number = contentWidth * adjustedPage / range;
				var widthOffset:number = contentWidth - thumbWidth;
				if(widthOffset > thumbWidth)
				{
					widthOffset = thumbWidth;
				}
				widthOffset *= valueOffset / (range * thumbWidth / contentWidth);
				thumbWidth -= widthOffset;
				if(thumbWidth < thumbMinWidth)
				{
					thumbWidth = thumbMinWidth;
				}
				this.thumb.width = thumbWidth;
				this.thumb.height = this.thumbOriginalHeight;
				var trackScrollableWidth:number = contentWidth - this.thumb.width;
				var thumbX:number = trackScrollableWidth * (this._value - this._minimum) / range;
				if(thumbX > trackScrollableWidth)
				{
					thumbX = trackScrollableWidth;
				}
				else if(thumbX < 0)
				{
					thumbX = 0;
				}
				this.thumb.x = this._paddingLeft + thumbX;
				this.thumb.y = this._paddingTop + (this.actualHeight - this._paddingTop - this._paddingBottom - this.thumb.height) / 2;
			}

			//final validation to avoid juggler next frame issues
			this.thumb.validate();
		}

		/**
		 * @private
		 */
		protected locationToValue(location:Point):number
		{
			var percentage:number = 0;
			if(this._direction == SimpleScrollBar.DIRECTION_VERTICAL)
			{
				var trackScrollableHeight:number = this.actualHeight - this.thumb.height - this._paddingTop - this._paddingBottom;
				if(trackScrollableHeight > 0)
				{
					var yOffset:number = location.y - this._touchStartY - this._paddingTop;
					var yPosition:number = Math.min(Math.max(0, this._thumbStartY + yOffset), trackScrollableHeight);
					percentage = yPosition / trackScrollableHeight;
				}
			}
			else //horizontal
			{
				var trackScrollableWidth:number = this.actualWidth - this.thumb.width - this._paddingLeft - this._paddingRight;
				if(trackScrollableWidth > 0)
				{
					var xOffset:number = location.x - this._touchStartX - this._paddingLeft;
					var xPosition:number = Math.min(Math.max(0, this._thumbStartX + xOffset), trackScrollableWidth);
					percentage = xPosition / trackScrollableWidth;
				}
			}

			return this._minimum + percentage * (this._maximum - this._minimum);
		}

		/**
		 * @private
		 */
		protected adjustPage():void
		{
			var range:number = this._maximum - this._minimum;
			var adjustedPage:number = this._page;
			if(adjustedPage === 0)
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

			if(this._touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this.track, TouchPhase.ENDED, this._touchPointID);
				if(!touch)
				{
					return;
				}
				this._touchPointID = -1;
				this._repeatTimer.stop();
			}
			else
			{
				touch = event.getTouch(this.track, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				this._touchPointID = touch.id;
				touch.getLocation(this, SimpleScrollBar.HELPER_POINT);
				this._touchStartX = SimpleScrollBar.HELPER_POINT.x;
				this._touchStartY = SimpleScrollBar.HELPER_POINT.y;
				this._thumbStartX = SimpleScrollBar.HELPER_POINT.x;
				this._thumbStartY = SimpleScrollBar.HELPER_POINT.y;
				this._touchValue = this.locationToValue(SimpleScrollBar.HELPER_POINT);
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
					touch.getLocation(this, SimpleScrollBar.HELPER_POINT);
					var newValue:number = this.locationToValue(SimpleScrollBar.HELPER_POINT);
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
				touch.getLocation(this, SimpleScrollBar.HELPER_POINT);
				this._touchPointID = touch.id;
				this._thumbStartX = this.thumb.x;
				this._thumbStartY = this.thumb.y;
				this._touchStartX = SimpleScrollBar.HELPER_POINT.x;
				this._touchStartY = SimpleScrollBar.HELPER_POINT.y;
				this.isDragging = true;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
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
