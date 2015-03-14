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
	import roundToPrecision = feathers.utils.math.roundToPrecision;

	import TimerEvent = flash.events.TimerEvent;
	import Keyboard = flash.ui.Keyboard;
	import Timer = flash.utils.Timer;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the stepper's value changes.
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
	 * Select a value between a minimum and a maximum by using increment and
	 * decrement buttons or typing in a value in a text input.
	 *
	 * <p>The following example sets the stepper's values and listens for when
	 * when the value changes:</p>
	 *
	 * <listing version="3.0">
	 * var stepper:NumericStepper = new NumericStepper();
	 * stepper.minimum = 0;
	 * stepper.maximum = 100;
	 * stepper.step = 1;
	 * stepper.value = 12;
	 * stepper.addEventListener( Event.CHANGE, stepper_changeHandler );
	 * this.addChild( stepper );</listing>
	 *
	 * @see ../../../help/numeric-stepper.html How to use the Feathers NumericStepper component
	 */
	export class NumericStepper extends FeathersControl implements IRange, IFocusDisplayObject
	{
		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY:string = "decrementButtonFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY:string = "incrementButtonFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_TEXT_INPUT_FACTORY:string = "textInputFactory";

		/**
		 * The default value added to the <code>styleNameList</code> of the decrement
		 * button.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON:string = "feathers-numeric-stepper-decrement-button";

		/**
		 * DEPRECATED: Replaced by <code>NumericStepper.DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see NumericStepper#DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON
		 */
		public static DEFAULT_CHILD_NAME_DECREMENT_BUTTON:string = NumericStepper.DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON;

		/**
		 * The default value added to the <code>styleNameList</code> of the increment
		 * button.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON:string = "feathers-numeric-stepper-increment-button";

		/**
		 * DEPRECATED: Replaced by <code>NumericStepper.DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see NumericStepper#DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON
		 */
		public static DEFAULT_CHILD_NAME_INCREMENT_BUTTON:string = NumericStepper.DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON;

		/**
		 * The default value added to the <code>styleNameList</code> of the text
		 * input.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_TEXT_INPUT:string = "feathers-numeric-stepper-text-input";

		/**
		 * DEPRECATED: Replaced by <code>NumericStepper.DEFAULT_CHILD_STYLE_NAME_TEXT_INPUT</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see NumericStepper#DEFAULT_CHILD_STYLE_NAME_TEXT_INPUT
		 */
		public static DEFAULT_CHILD_NAME_TEXT_INPUT:string = NumericStepper.DEFAULT_CHILD_STYLE_NAME_TEXT_INPUT;

		/**
		 * The decrement button will be placed on the left side of the text
		 * input and the increment button will be placed on the right side of
		 * the text input.
		 *
		 * @see #buttonLayoutMode
		 */
		public static BUTTON_LAYOUT_MODE_SPLIT_HORIZONTAL:string = "splitHorizontal";

		/**
		 * The decrement button will be placed below the text input and the
		 * increment button will be placed above the text input.
		 *
		 * @see #buttonLayoutMode
		 */
		public static BUTTON_LAYOUT_MODE_SPLIT_VERTICAL:string = "splitVertical";

		/**
		 * Both the decrement and increment button will be placed on the right
		 * side of the text input. The increment button will be above the
		 * decrement button.
		 *
		 * @see #buttonLayoutMode
		 */
		public static BUTTON_LAYOUT_MODE_RIGHT_SIDE_VERTICAL:string = "rightSideVertical";

		/**
		 * The default <code>IStyleProvider</code> for all <code>NumericStepper</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

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
		 * @private
		 */
		protected static defaultTextInputFactory():TextInput
		{
			return new TextInput();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.numericStepper_removedFromStageHandler);
		}

		/**
		 * The value added to the <code>styleNameList</code> of the decrement
		 * button. This variable is <code>protected</code> so that sub-classes
		 * can customize the decrement button style name in their constructors
		 * instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON</code>.
		 *
		 * <p>To customize the decrement button name without subclassing, see
		 * <code>customDecrementButtonStyleName</code>.</p>
		 *
		 * @see #customDecrementButtonStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected decrementButtonStyleName:string = NumericStepper.DEFAULT_CHILD_STYLE_NAME_DECREMENT_BUTTON;

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
		 * <p>To customize the increment button name without subclassing, see
		 * <code>customIncrementButtonStyleName</code>.</p>
		 *
		 * @see #customIncrementButtonStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected incrementButtonStyleName:string = NumericStepper.DEFAULT_CHILD_STYLE_NAME_INCREMENT_BUTTON;

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
		 * The value added to the <code>styleNameList</code> of the text input.
		 * This variable is <code>protected</code> so that sub-classes can
		 * customize the text input style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_TEXT_INPUT</code>.
		 *
		 * <p>To customize the text input name without subclassing, see
		 * <code>customTextInputName</code>.</p>
		 *
		 * @see #customTextInputStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected textInputStyleName:string = NumericStepper.DEFAULT_CHILD_STYLE_NAME_TEXT_INPUT;

		/**
		 * DEPRECATED: Replaced by <code>textInputStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #textInputStyleName
		 */
		protected get textInputName():string
		{
			return this.textInputStyleName;
		}

		/**
		 * @private
		 */
		protected set textInputName(value:string)
		{
			this.textInputStyleName = value;
		}

		/**
		 * The decrement button sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #createDecrementButton()
		 */
		protected decrementButton:Button;

		/**
		 * The increment button sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #createIncrementButton()
		 */
		protected incrementButton:Button;

		/**
		 * The text input sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #createTextInput()
		 */
		protected textInput:TextInput;

		/**
		 * @private
		 */
		protected touchPointID:number = -1;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return NumericStepper.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _value:number = 0;

		/**
		 * The value of the numeric stepper, between the minimum and maximum.
		 *
		 * <p>In the following example, the value is changed to 12:</p>
		 *
		 * <listing version="3.0">
		 * stepper.minimum = 0;
		 * stepper.maximum = 100;
		 * stepper.step = 1;
		 * stepper.value = 12;</listing>
		 *
		 * @default 0
		 *
		 * @see #minimum
		 * @see #maximum
		 * @see #step
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
			if(this._step != 0 && newValue != this._maximum && newValue != this._minimum)
			{
				//roundToPrecision helps us to avoid numbers like 1.00000000000000001
				//caused by the inaccuracies of floating point math.
				newValue = roundToPrecision(roundToNearest(newValue - this._minimum, this._step) + this._minimum, 10);
			}
			newValue = clamp(newValue, this._minimum, this._maximum);
			if(this._value == newValue)
			{
				return;
			}
			this._value = newValue;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _minimum:number = 0;

		/**
		 * The numeric stepper's value will not go lower than the minimum.
		 *
		 * <p>In the following example, the minimum is changed to 0:</p>
		 *
		 * <listing version="3.0">
		 * stepper.minimum = 0;
		 * stepper.maximum = 100;
		 * stepper.step = 1;
		 * stepper.value = 12;</listing>
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #maximum
		 * @see #step
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
		 * The numeric stepper's value will not go higher than the maximum.
		 *
		 * <p>In the following example, the maximum is changed to 100:</p>
		 *
		 * <listing version="3.0">
		 * stepper.minimum = 0;
		 * stepper.maximum = 100;
		 * stepper.step = 1;
		 * stepper.value = 12;</listing>
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #minimum
		 * @see #step
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
		 * As the numeric stepper's buttons are pressed, the value is snapped to
		 * a multiple of the step.
		 *
		 * <p>In the following example, the step is changed to 1:</p>
		 *
		 * <listing version="3.0">
		 * stepper.minimum = 0;
		 * stepper.maximum = 100;
		 * stepper.step = 1;
		 * stepper.value = 12;</listing>
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #minimum
		 * @see #maximum
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
		protected _valueFormatFunction:Function;

		/**
		 * A callback that formats the numeric stepper's value as a string to
		 * display to the user.
		 *
		 * <p>The function is expected to have the following signature:</p>
		 * <pre>function(value:Number):String</pre>
		 *
		 * <p>In the following example, the stepper's value format function is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * stepper.valueFormatFunction = function(value:Number):String
		 * {
		 *     return currencyFormatter.format(value, true);
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see #valueParseFunction
		 */
		public get valueFormatFunction():Function
		{
			return this._valueFormatFunction;
		}

		/**
		 * @private
		 */
		public set valueFormatFunction(value:Function)
		{
			if(this._valueFormatFunction == value)
			{
				return;
			}
			this._valueFormatFunction = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _valueParseFunction:Function;

		/**
		 * A callback that accepts the displayed text of the numeric stepper and
		 * converts it to a simple numeric value.
		 *
		 * <p>The function is expected to have the following signature:</p>
		 * <pre>function(displayedText:String):Number</pre>
		 *
		 * <p>In the following example, the stepper's value parse function is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * stepper.valueParseFunction = function(displayedText:String):String
		 * {
		 *     return currencyFormatter.parse(displayedText).value;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see #valueFormatFunction
		 */
		public get valueParseFunction():Function
		{
			return this._valueParseFunction;
		}

		/**
		 * @private
		 */
		public set valueParseFunction(value:Function)
		{
			this._valueParseFunction = value;
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
		 * <p>In the following example, the stepper's repeat delay is set to
		 * 500 milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * stepper.repeatDelay = 0.5;</listing>
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
		protected _buttonLayoutMode:string = NumericStepper.BUTTON_LAYOUT_MODE_SPLIT_HORIZONTAL;

		/*[Inspectable(type="String",enumeration="splitHorizontal,splitVertical,rightSideVertical")]*/
		/**
		 * How the buttons are positioned relative to the text input.
		 *
		 * <p>In the following example, the button layout is set to place the
		 * buttons on the right side, stacked vertically, for a desktop
		 * appearance:</p>
		 *
		 * <listing version="3.0">
		 * stepper.buttonLayoutMode = NumericStepper.BUTTON_LAYOUT_MODE_RIGHT_SIDE_VERTICAL;</listing>
		 *
		 * @default NumericStepper.BUTTON_LAYOUT_MODE_SPLIT_HORIZONTAL
		 *
		 * @see #BUTTON_LAYOUT_MODE_SPLIT_HORIZONTAL
		 * @see #BUTTON_LAYOUT_MODE_SPLIT_VERTICAL
		 * @see #BUTTON_LAYOUT_MODE_RIGHT_SIDE_VERTICAL
		 */
		public get buttonLayoutMode():string
		{
			return this._buttonLayoutMode;
		}

		/**
		 * @private
		 */
		public set buttonLayoutMode(value:string)
		{
			if(this._buttonLayoutMode == value)
			{
				return;
			}
			this._buttonLayoutMode = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _buttonGap:number = 0;

		/**
		 * The gap, in pixels, between the numeric stepper's increment and
		 * decrement buttons when they are both positioned on the same side. If
		 * the buttons are split between two sides, this value is not used.
		 *
		 * <p>In the following example, the gap between buttons is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * stepper.buttonLayoutMode = NumericStepper.BUTTON_LAYOUT_MODE_RIGHT_SIDE_VERTICAL;
		 * stepper.buttonGap = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #textInputGap
		 * @see #buttonLayoutMode
		 */
		public get buttonGap():number
		{
			return this._buttonGap;
		}

		/**
		 * @private
		 */
		public set buttonGap(value:number)
		{
			if(this._buttonGap == value)
			{
				return;
			}
			this._buttonGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _textInputGap:number = 0;

		/**
		 * The gap, in pixels, between the numeric stepper's text input and its
		 * buttons. If the buttons are split, this gap is used on both sides. If
		 * the buttons both appear on the same side, the gap is used only on
		 * that side.
		 *
		 * <p>In the following example, the gap between the text input and buttons is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * stepper.textInputGap = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #buttonGap
		 * @see #buttonLayoutMode
		 */
		public get textInputGap():number
		{
			return this._textInputGap;
		}

		/**
		 * @private
		 */
		public set textInputGap(value:number)
		{
			if(this._textInputGap == value)
			{
				return;
			}
			this._textInputGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _decrementButtonFactory:Function;

		/**
		 * A function used to generate the numeric stepper's decrement button
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
		 * to the stepper:</p>
		 *
		 * <listing version="3.0">
		 * stepper.decrementButtonFactory = function():Button
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
			this.invalidate(NumericStepper.INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customDecrementButtonStyleName:string;

		/**
		 * A style name to add to the numeric stepper's decrement button
		 * sub-component. Typically used by a theme to provide different styles
		 * to different numeric steppers.
		 *
		 * <p>In the following example, a custom decrement button style name is
		 * passed to the stepper:</p>
		 *
		 * <listing version="3.0">
		 * stepper.customDecrementButtonStyleName = "my-custom-decrement-button";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
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
			this.invalidate(NumericStepper.INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY);
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
		 * A set of key/value pairs to be passed down to the numeric stepper's
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
		 * <p>In the following example, the stepper's decrement button properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * stepper.decrementButtonProperties.defaultSkin = new Image( upTexture );
		 * stepper.decrementButtonProperties.downSkin = new Image( downTexture );</listing>
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
				this._decrementButtonProperties = new PropertyProxy(this.childProperties_onChange);
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
				this._decrementButtonProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._decrementButtonProperties = PropertyProxy(value);
			if(this._decrementButtonProperties)
			{
				this._decrementButtonProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _decrementButtonLabel:string = null;

		/**
		 * The text displayed by the decrement button. Often, there is no text
		 * displayed on this button and an icon is used instead.
		 *
		 * <p>In the following example, the decrement button's label is customized:</p>
		 *
		 * <listing version="3.0">
		 * stepper.decrementButtonLabel = "-";</listing>
		 *
		 * @default null
		 */
		public get decrementButtonLabel():string
		{
			return this._decrementButtonLabel;
		}

		/**
		 * @private
		 */
		public set decrementButtonLabel(value:string)
		{
			if(this._decrementButtonLabel == value)
			{
				return;
			}
			this._decrementButtonLabel = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _incrementButtonFactory:Function;

		/**
		 * A function used to generate the numeric stepper's increment button
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
		 * to the stepper:</p>
		 *
		 * <listing version="3.0">
		 * stepper.incrementButtonFactory = function():Button
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
			this.invalidate(NumericStepper.INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customIncrementButtonStyleName:string;

		/**
		 * A style name to add to the numeric stepper's increment button
		 * sub-component. Typically used by a theme to provide different styles
		 * to different numeric steppers.
		 *
		 * <p>In the following example, a custom increment button style name is
		 * passed to the stepper:</p>
		 *
		 * <listing version="3.0">
		 * stepper.customIncrementButtonStyleName = "my-custom-increment-button";</listing>
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
			this.invalidate(NumericStepper.INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY);
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
		 * A set of key/value pairs to be passed down to the numeric stepper's
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
		 * <p>In the following example, the stepper's increment button properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * stepper.incrementButtonProperties.defaultSkin = new Image( upTexture );
		 * stepper.incrementButtonProperties.downSkin = new Image( downTexture );</listing>
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
				this._incrementButtonProperties = new PropertyProxy(this.childProperties_onChange);
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
				this._incrementButtonProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._incrementButtonProperties = PropertyProxy(value);
			if(this._incrementButtonProperties)
			{
				this._incrementButtonProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _incrementButtonLabel:string = null;

		/**
		 * The text displayed by the increment button. Often, there is no text
		 * displayed on this button and an icon is used instead.
		 *
		 * <p>In the following example, the increment button's label is customized:</p>
		 *
		 * <listing version="3.0">
		 * stepper.incrementButtonLabel = "+";</listing>
		 *
		 * @default null
		 */
		public get incrementButtonLabel():string
		{
			return this._incrementButtonLabel;
		}

		/**
		 * @private
		 */
		public set incrementButtonLabel(value:string)
		{
			if(this._incrementButtonLabel == value)
			{
				return;
			}
			this._incrementButtonLabel = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _textInputFactory:Function;

		/**
		 * A function used to generate the numeric stepper's text input
		 * sub-component. The text input must be an instance of <code>TextInput</code>.
		 * This factory can be used to change properties on the text input when
		 * it is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the text input.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():TextInput</pre>
		 *
		 * <p>In the following example, a custom text input factory is passed
		 * to the stepper:</p>
		 *
		 * <listing version="3.0">
		 * stepper.textInputFactory = function():TextInput
		 * {
		 *     var textInput:TextInput = new TextInput();
		 *     textInput.backgroundSkin = new Image( texture );
		 *     return textInput;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.TextInput
		 * @see #textInputProperties
		 */
		public get textInputFactory():Function
		{
			return this._textInputFactory;
		}

		/**
		 * @private
		 */
		public set textInputFactory(value:Function)
		{
			if(this._textInputFactory == value)
			{
				return;
			}
			this._textInputFactory = value;
			this.invalidate(NumericStepper.INVALIDATION_FLAG_TEXT_INPUT_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customTextInputStyleName:string;

		/**
		 * A style name to add to the numeric stepper's text input sub-component.
		 * Typically used by a theme to provide different styles to different
		 * text inputs.
		 *
		 * <p>In the following example, a custom text input style name is passed
		 * to the stepper:</p>
		 *
		 * <listing version="3.0">
		 * stepper.customTextInputStyleName = "my-custom-text-input";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( TextInput ).setFunctionForStyleName( "my-custom-text-input", setCustomTextInputStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_TEXT_INPUT
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #textInputFactory
		 * @see #textInputProperties
		 */
		public get customTextInputStyleName():string
		{
			return this._customTextInputStyleName;
		}

		/**
		 * @private
		 */
		public set customTextInputStyleName(value:string)
		{
			if(this._customTextInputStyleName == value)
			{
				return;
			}
			this._customTextInputStyleName = value;
			this.invalidate(NumericStepper.INVALIDATION_FLAG_TEXT_INPUT_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customTextInputStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customTextInputStyleName
		 */
		public get customTextInputName():string
		{
			return this.customTextInputStyleName;
		}

		/**
		 * @private
		 */
		public set customTextInputName(value:string)
		{
			this.customTextInputStyleName = value;
		}

		/**
		 * @private
		 */
		protected _textInputProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the numeric stepper's
		 * text input sub-component. The text input is a
		 * <code>feathers.controls.TextInput</code> instance that is created by
		 * <code>textInputFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>textInputFactory</code> function
		 * instead of using <code>textInputProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the stepper's text input properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * stepper.textInputProperties.backgroundSkin = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #textInputFactory
		 * @see feathers.controls.TextInput
		 */
		public get textInputProperties():Object
		{
			if(!this._textInputProperties)
			{
				this._textInputProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._textInputProperties;
		}

		/**
		 * @private
		 */
		public set textInputProperties(value:Object)
		{
			if(this._textInputProperties == value)
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
			if(this._textInputProperties)
			{
				this._textInputProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._textInputProperties = PropertyProxy(value);
			if(this._textInputProperties)
			{
				this._textInputProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
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
			var decrementButtonFactoryInvalid:boolean = this.isInvalid(NumericStepper.INVALIDATION_FLAG_DECREMENT_BUTTON_FACTORY);
			var incrementButtonFactoryInvalid:boolean = this.isInvalid(NumericStepper.INVALIDATION_FLAG_INCREMENT_BUTTON_FACTORY);
			var textInputFactoryInvalid:boolean = this.isInvalid(NumericStepper.INVALIDATION_FLAG_TEXT_INPUT_FACTORY);
			var focusInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_FOCUS);

			if(decrementButtonFactoryInvalid)
			{
				this.createDecrementButton();
			}

			if(incrementButtonFactoryInvalid)
			{
				this.createIncrementButton();
			}

			if(textInputFactoryInvalid)
			{
				this.createTextInput();
			}

			if(decrementButtonFactoryInvalid || stylesInvalid)
			{
				this.refreshDecrementButtonStyles();
			}

			if(incrementButtonFactoryInvalid || stylesInvalid)
			{
				this.refreshIncrementButtonStyles();
			}

			if(textInputFactoryInvalid || stylesInvalid)
			{
				this.refreshTextInputStyles();
			}

			if(textInputFactoryInvalid || dataInvalid)
			{
				this.refreshTypicalText();
				this.refreshDisplayedText();
			}

			if(decrementButtonFactoryInvalid || stateInvalid)
			{
				this.decrementButton.isEnabled = this._isEnabled;
			}

			if(incrementButtonFactoryInvalid || stateInvalid)
			{
				this.incrementButton.isEnabled = this._isEnabled;
			}

			if(textInputFactoryInvalid || stateInvalid)
			{
				this.textInput.isEnabled = this._isEnabled;
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(decrementButtonFactoryInvalid || incrementButtonFactoryInvalid || textInputFactoryInvalid ||
				dataInvalid || stylesInvalid || sizeInvalid)
			{
				this.layoutChildren();
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

			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;

			this.decrementButton.validate();
			this.incrementButton.validate();
			var oldTextInputWidth:number = this.textInput.width;
			var oldTextInputHeight:number = this.textInput.height;
			if(this._buttonLayoutMode == NumericStepper.BUTTON_LAYOUT_MODE_RIGHT_SIDE_VERTICAL)
			{
				var maxButtonWidth:number = Math.max(this.decrementButton.width, this.incrementButton.width);
				this.textInput.minWidth = Math.max(0, this._minWidth - maxButtonWidth);
				this.textInput.maxWidth = Math.max(0, this._maxWidth - maxButtonWidth);
				this.textInput.width = Math.max(0, this.explicitWidth - maxButtonWidth)
				this.textInput.height = this.explicitHeight;
				this.textInput.validate();

				if(needsWidth)
				{
					newWidth = this.textInput.width + maxButtonWidth + this._textInputGap;
				}
				if(needsHeight)
				{
					newHeight = Math.max(this.textInput.height, this.decrementButton.height + this._buttonGap + this.incrementButton.height);
				}
			}
			else if(this._buttonLayoutMode == NumericStepper.BUTTON_LAYOUT_MODE_SPLIT_VERTICAL)
			{
				this.textInput.minHeight = Math.max(0, this._minHeight - this.decrementButton.height - this.incrementButton.height);
				this.textInput.maxHeight = Math.max(0, this._maxHeight - this.decrementButton.height - this.incrementButton.height);
				this.textInput.height = Math.max(0, this.explicitHeight - this.decrementButton.height - this.incrementButton.height);
				this.textInput.width = this.explicitWidth;
				this.textInput.validate();

				if(needsWidth)
				{
					newWidth = Math.max(this.decrementButton.width, this.incrementButton.width, this.textInput.width);
				}
				if(needsHeight)
				{
					newHeight = this.decrementButton.height + this.textInput.height + this.incrementButton.height + 2 * this._textInputGap;
				}
			}
			else //split horizontal
			{
				this.textInput.minWidth = Math.max(0, this._minWidth - this.decrementButton.width - this.incrementButton.width);
				this.textInput.maxWidth = Math.max(0, this._maxWidth - this.decrementButton.width - this.incrementButton.width);
				this.textInput.width = Math.max(0, this.explicitWidth - this.decrementButton.width - this.incrementButton.width);
				this.textInput.height = this.explicitHeight;
				this.textInput.validate();

				if(needsWidth)
				{
					newWidth = this.decrementButton.width + this.textInput.width + this.incrementButton.width + 2 * this._textInputGap;
				}
				if(needsHeight)
				{
					newHeight = Math.max(this.decrementButton.height, this.incrementButton.height, this.textInput.height);
				}
			}

			this.textInput.width = oldTextInputWidth;
			this.textInput.height = oldTextInputHeight;
			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * @private
		 */
		protected decrement():void
		{
			this.value = this._value - this._step;
			if(this.textInput.isEditable)
			{
				this.validate();
				this.textInput.selectRange(0, this.textInput.text.length);
			}
		}

		/**
		 * @private
		 */
		protected increment():void
		{
			this.value = this._value + this._step;
			if(this.textInput.isEditable)
			{
				this.validate();
				this.textInput.selectRange(0, this.textInput.text.length);
			}
		}

		/**
		 * @private
		 */
		protected toMinimum():void
		{
			this.value = this._minimum;
			if(this.textInput.isEditable)
			{
				this.validate();
				this.textInput.selectRange(0, this.textInput.text.length);
			}
		}

		/**
		 * @private
		 */
		protected toMaximum():void
		{
			this.value = this._maximum;
			if(this.textInput.isEditable)
			{
				this.validate();
				this.textInput.selectRange(0, this.textInput.text.length);
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
		 * @see #customDecrementButtonStyleName
		 */
		protected createDecrementButton():void
		{
			if(this.decrementButton)
			{
				this.decrementButton.removeFromParent(true);
				this.decrementButton = null;
			}

			var factory:Function = this._decrementButtonFactory != null ? this._decrementButtonFactory : NumericStepper.defaultDecrementButtonFactory;
			var decrementButtonStyleName:string = this._customDecrementButtonStyleName != null ? this._customDecrementButtonStyleName : this.decrementButtonStyleName;
			this.decrementButton = this.Button(factory());
			this.decrementButton.styleNameList.add(decrementButtonStyleName);
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

			var factory:Function = this._incrementButtonFactory != null ? this._incrementButtonFactory : NumericStepper.defaultIncrementButtonFactory;
			var incrementButtonStyleName:string = this._customIncrementButtonStyleName != null ? this._customIncrementButtonStyleName : this.incrementButtonStyleName;
			this.incrementButton = this.Button(factory());
			this.incrementButton.styleNameList.add(incrementButtonStyleName);
			this.incrementButton.addEventListener(TouchEvent.TOUCH, this.incrementButton_touchHandler);
			this.addChild(this.incrementButton);
		}

		/**
		 * Creates and adds the <code>textInput</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #textInput
		 * @see #textInputFactory
		 * @see #customTextInputStyleName
		 */
		protected createTextInput():void
		{
			if(this.textInput)
			{
				this.textInput.removeFromParent(true);
				this.textInput = null;
			}

			var factory:Function = this._textInputFactory != null ? this._textInputFactory : NumericStepper.defaultTextInputFactory;
			var textInputStyleName:string = this._customTextInputStyleName != null ? this._customTextInputStyleName : this.textInputStyleName;
			this.textInput = this.TextInput(factory());
			this.textInput.styleNameList.add(textInputStyleName);
			this.textInput.addEventListener(FeathersEventType.ENTER, this.textInput_enterHandler);
			this.textInput.addEventListener(FeathersEventType.FOCUS_OUT, this.textInput_focusOutHandler);
			this.textInput.isFocusEnabled = this._focusManager == null;
			this.addChild(this.textInput);
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
			this.decrementButton.label = this._decrementButtonLabel;
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
			this.incrementButton.label = this._incrementButtonLabel;
		}

		/**
		 * @private
		 */
		protected refreshTextInputStyles():void
		{
			for(var propertyName:string in this._textInputProperties)
			{
				var propertyValue:Object = this._textInputProperties[propertyName];
				this.textInput[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshDisplayedText():void
		{
			if(this._valueFormatFunction != null)
			{
				this.textInput.text = this._valueFormatFunction(this._value);
			}
			else
			{
				this.textInput.text = this._value.toString();
			}
		}

		/**
		 * @private
		 */
		protected refreshTypicalText():void
		{
			var typicalText:string = "";
			var maxCharactersBeforeDecimal:number = Math.max(int(this._minimum).toString().length, int(this._maximum).toString().length, int(this._step).toString().length);

			//roundToPrecision() helps us to avoid numbers like 1.00000000000000001
			//caused by the inaccuracies of floating point math.
			var maxCharactersAfterDecimal:number = Math.max(roundToPrecision(this._minimum - int(this._minimum), 10).toString().length,
				roundToPrecision(this._maximum - int(this._maximum), 10).toString().length,
				roundToPrecision(this._step - int(this._step), 10).toString().length) - 2;
			if(maxCharactersAfterDecimal < 0)
			{
				maxCharactersAfterDecimal = 0;
			}
			var characterCount:number = maxCharactersBeforeDecimal + maxCharactersAfterDecimal;
			for(var i:number = 0; i < characterCount; i++)
			{
				typicalText += "0";
			}
			if(maxCharactersAfterDecimal > 0)
			{
				typicalText += ".";
			}
			this.textInput.typicalText = typicalText;
		}

		/**
		 * @private
		 */
		protected layoutChildren():void
		{
			if(this._buttonLayoutMode == NumericStepper.BUTTON_LAYOUT_MODE_RIGHT_SIDE_VERTICAL)
			{
				var buttonHeight:number = (this.actualHeight - this._buttonGap) / 2;
				this.incrementButton.y = 0;
				this.incrementButton.height = buttonHeight;
				this.incrementButton.validate();

				this.decrementButton.y = buttonHeight + this._buttonGap;
				this.decrementButton.height = buttonHeight;
				this.decrementButton.validate();

				var buttonWidth:number = Math.max(this.decrementButton.width, this.incrementButton.width);
				var buttonX:number = this.actualWidth - buttonWidth;
				this.decrementButton.x = buttonX;
				this.incrementButton.x = buttonX;

				this.textInput.x = 0;
				this.textInput.y = 0;
				this.textInput.width = buttonX - this._textInputGap;
				this.textInput.height = this.actualHeight;
			}
			else if(this._buttonLayoutMode == NumericStepper.BUTTON_LAYOUT_MODE_SPLIT_VERTICAL)
			{
				this.incrementButton.x = 0;
				this.incrementButton.y = 0;
				this.incrementButton.width = this.actualWidth;
				this.incrementButton.validate();

				this.decrementButton.x = 0;
				this.decrementButton.width = this.actualWidth;
				this.decrementButton.validate();
				this.decrementButton.y = this.actualHeight - this.decrementButton.height;

				this.textInput.x = 0;
				this.textInput.y = this.incrementButton.height + this._textInputGap;
				this.textInput.width = this.actualWidth;
				this.textInput.height = Math.max(0, this.actualHeight - this.decrementButton.height - this.incrementButton.height - 2 * this._textInputGap);
			}
			else //split horizontal
			{
				this.decrementButton.x = 0;
				this.decrementButton.y = 0;
				this.decrementButton.height = this.actualHeight;
				this.decrementButton.validate();

				this.incrementButton.y = 0;
				this.incrementButton.height = this.actualHeight;
				this.incrementButton.validate();
				this.incrementButton.x = this.actualWidth - this.incrementButton.width;

				this.textInput.x = this.decrementButton.width + this._textInputGap;
				this.textInput.width = this.actualWidth - this.decrementButton.width - this.incrementButton.width - 2 * this._textInputGap;
				this.textInput.height = this.actualHeight;
			}

			//final validation to avoid juggler next frame issues
			this.textInput.validate();
		}

		/**
		 * @private
		 */
		protected startRepeatTimer(action:Function):void
		{
			if(this.touchPointID >= 0)
			{
				var exclusiveTouch:ExclusiveTouch = ExclusiveTouch.forStage(this.stage);
				var claim:DisplayObject = exclusiveTouch.getClaim(this.touchPointID)
				if(claim != this)
				{
					if(claim)
					{
						//already claimed by another display object
						return;
					}
					else
					{
						exclusiveTouch.claimTouch(this.touchPointID, this);
					}
				}
			}
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
		protected parseTextInputValue():void
		{
			if(this._valueParseFunction != null)
			{
				var newValue:number = this._valueParseFunction(this.textInput.text);
			}
			else
			{
				newValue = parseFloat(this.textInput.text);
			}
			if(newValue === newValue) //!isNaN
			{
				this.value = newValue;
			}
			//we need to force invalidation just to be sure that the text input
			//is displaying the correct value.
			this.invalidate(this.INVALIDATION_FLAG_DATA);
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
		protected numericStepper_removedFromStageHandler(event:Event):void
		{
			this.touchPointID = -1;
		}

		/**
		 * @private
		 */
		/*override*/ protected focusInHandler(event:Event):void
		{
			super.focusInHandler(event);
			if(this.textInput.isEditable)
			{
				this.textInput.setFocus();
				this.textInput.selectRange(0, this.textInput.text.length);
			}
			this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected focusOutHandler(event:Event):void
		{
			super.focusOutHandler(event);
			this.textInput.clearFocus();
			this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
		}

		/**
		 * @private
		 */
		protected textInput_enterHandler(event:Event):void
		{
			this.parseTextInputValue();
		}

		/**
		 * @private
		 */
		protected textInput_focusOutHandler(event:Event):void
		{
			this.parseTextInputValue();
		}

		/**
		 * @private
		 */
		protected decrementButton_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this.touchPointID = -1;
				return;
			}

			if(this.touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this.decrementButton, TouchPhase.ENDED, this.touchPointID);
				if(!touch)
				{
					return;
				}
				this.touchPointID = -1;
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
				this.touchPointID = touch.id;
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
				this.touchPointID = -1;
				return;
			}

			if(this.touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this.incrementButton, TouchPhase.ENDED, this.touchPointID);
				if(!touch)
				{
					return;
				}
				this.touchPointID = -1;
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
				this.touchPointID = touch.id;
				this.dispatchEventWith(FeathersEventType.BEGIN_INTERACTION);
				this.increment();
				this.startRepeatTimer(this.increment);
			}
		}

		/**
		 * @private
		 */
		protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.keyCode == Keyboard.HOME)
			{
				this.toMinimum();
			}
			else if(event.keyCode == Keyboard.END)
			{
				this.toMaximum();
			}
			else if(event.keyCode == Keyboard.UP)
			{
				this.increment();
			}
			else if(event.keyCode == Keyboard.DOWN)
			{
				this.decrement();
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
