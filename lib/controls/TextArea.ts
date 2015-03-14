/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import ITextEditorViewPort = feathers.controls.text.ITextEditorViewPort;
	import TextFieldTextEditorViewPort = feathers.controls.text.TextFieldTextEditorViewPort;
	import PropertyProxy = feathers.core.PropertyProxy;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Point = flash.geom.Point;
	import Mouse = flash.ui.Mouse;
	import MouseCursor = flash.ui.MouseCursor;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the text area's <code>text</code> property changes.
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
	 * A text entry control that allows users to enter and edit multiple lines
	 * of uniformly-formatted text with the ability to scroll.
	 *
	 * <p><strong>Important:</strong> <code>TextArea</code> is not recommended
	 * for mobile. Instead, you should generally use a <code>TextInput</code>
	 * with a <code>StageTextTextEditor</code> that has its <code>multiline</code>
	 * property set to <code>true</code> and the text input's <code>verticalAlign</code>
	 * property should be set to <code>TextInput.VERTICAL_ALIGN_JUSTIFY</code>.
	 * In that situation, the <code>StageText</code> instance will automatically
	 * provide its own operating system native scroll bars. <code>TextArea</code>
	 * is intended for use on desktop and may not behave correctly on mobile.</p>
	 *
	 * <p>The following example sets the text in a text area, selects the text,
	 * and listens for when the text value changes:</p>
	 *
	 * <listing version="3.0">
	 * var textArea:TextArea = new TextArea();
	 * textArea.text = "Hello\nWorld"; //it's multiline!
	 * textArea.selectRange( 0, textArea.text.length );
	 * textArea.addEventListener( Event.CHANGE, input_changeHandler );
	 * this.addChild( textArea );</listing>
	 *
	 * @see ../../../help/text-area.html How to use the Feathers TextArea component
	 * @see feathers.controls.TextInput
	 */
	export class TextArea extends Scroller
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_AUTO
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_AUTO:string = "auto";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_ON
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_ON:string = "on";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_OFF
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_OFF:string = "off";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_FLOAT
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FLOAT:string = "float";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_FIXED
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FIXED:string = "fixed";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_NONE
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
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_TOUCH
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH:string = "touch";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_MOUSE
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_MOUSE:string = "mouse";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_TOUCH_AND_SCROLL_BARS
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH_AND_SCROLL_BARS:string = "touchAndScrollBars";

		/**
		 * @copy feathers.controls.Scroller#MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL:string = "vertical";

		/**
		 * @copy feathers.controls.Scroller#MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * @copy feathers.controls.Scroller#DECELERATION_RATE_NORMAL
		 *
		 * @see feathers.controls.Scroller#decelerationRate
		 */
		public static DECELERATION_RATE_NORMAL:number = 0.998;

		/**
		 * @copy feathers.controls.Scroller#DECELERATION_RATE_FAST
		 *
		 * @see feathers.controls.Scroller#decelerationRate
		 */
		public static DECELERATION_RATE_FAST:number = 0.99;

		/**
		 * The <code>TextArea</code> is enabled and does not have focus.
		 */
		public static STATE_ENABLED:string = "enabled";

		/**
		 * The <code>TextArea</code> is disabled.
		 */
		public static STATE_DISABLED:string = "disabled";

		/**
		 * The <code>TextArea</code> is enabled and has focus.
		 */
		public static STATE_FOCUSED:string = "focused";

		/**
		 * The default <code>IStyleProvider</code> for all <code>TextArea</code>
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
			this._measureViewPort = false;
			this.addEventListener(TouchEvent.TOUCH, this.textArea_touchHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.textArea_removedFromStageHandler);
		}

		/**
		 * @private
		 */
		protected textEditorViewPort:ITextEditorViewPort;

		/**
		 * @private
		 */
		protected _textEditorHasFocus:boolean = false;

		/**
		 * @private
		 */
		protected _isWaitingToSetFocus:boolean = false;

		/**
		 * @private
		 */
		protected _pendingSelectionStartIndex:number = -1;

		/**
		 * @private
		 */
		protected _pendingSelectionEndIndex:number = -1;

		/**
		 * @private
		 */
		protected _textAreaTouchPointID:number = -1;

		/**
		 * @private
		 */
		protected _oldMouseCursor:string = null;

		/**
		 * @private
		 */
		protected _ignoreTextChanges:boolean = false;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return TextArea.globalStyleProvider;
		}

		/**
		 * @private
		 */
		/*override*/ public get isFocusEnabled():boolean
		{
			if(this._isEditable)
			{
				//the behavior is different when editable.
				return this._isEnabled && this._isFocusEnabled;
			}
			return super.isFocusEnabled;
		}

		/**
		 * When the <code>FocusManager</code> isn't enabled, <code>hasFocus</code>
		 * can be used instead of <code>FocusManager.focus == textArea</code>
		 * to determine if the text area has focus.
		 */
		public get hasFocus():boolean
		{
			if(!this._focusManager)
			{
				return this._textEditorHasFocus;
			}
			return this._hasFocus;
		}

		/**
		 * @private
		 */
		/*override*/ public set isEnabled(value:boolean)
		{
			super.isEnabled = value;
			if(this._isEnabled)
			{
				this.currentState = this._hasFocus ? TextArea.STATE_FOCUSED : TextArea.STATE_ENABLED;
			}
			else
			{
				this.currentState = TextArea.STATE_DISABLED;
			}
		}

		/**
		 * @private
		 */
		protected _stateNames:string[] = new Array<string>(TextArea.STATE_ENABLED, TextArea.STATE_DISABLED, TextArea.STATE_FOCUSED);

		/**
		 * A list of all valid state names for use with <code>currentState</code>.
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
		protected _currentState:string = TextArea.STATE_ENABLED;

		/**
		 * The current state of the input.
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
		protected _text:string = "";

		/**
		 * The text displayed by the text area. The text area dispatches
		 * <code>Event.CHANGE</code> when the value of the <code>text</code>
		 * property changes for any reason.
		 *
		 * <p>In the following example, the text area's text is updated:</p>
		 *
		 * <listing version="3.0">
		 * textArea.text = "Hello World";</listing>
		 *
		 * @see #event:change
		 *
		 * @default ""
		 */
		public get text():string
		{
			return this._text;
		}

		/**
		 * @private
		 */
		public set text(value:string)
		{
			if(!value)
			{
				//don't allow null or undefined
				value = "";
			}
			if(this._text == value)
			{
				return;
			}
			this._text = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _maxChars:number = 0;

		/**
		 * The maximum number of characters that may be entered.
		 *
		 * <p>In the following example, the text area's maximum characters is
		 * specified:</p>
		 *
		 * <listing version="3.0">
		 * textArea.maxChars = 10;</listing>
		 *
		 * @default 0
		 */
		public get maxChars():number
		{
			return this._maxChars;
		}

		/**
		 * @private
		 */
		public set maxChars(value:number)
		{
			if(this._maxChars == value)
			{
				return;
			}
			this._maxChars = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _restrict:string;

		/**
		 * Limits the set of characters that may be entered.
		 *
		 * <p>In the following example, the text area's allowed characters are
		 * restricted:</p>
		 *
		 * <listing version="3.0">
		 * textArea.restrict = "0-9;</listing>
		 *
		 * @default null
		 */
		public get restrict():string
		{
			return this._restrict;
		}

		/**
		 * @private
		 */
		public set restrict(value:string)
		{
			if(this._restrict == value)
			{
				return;
			}
			this._restrict = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _isEditable:boolean = true;

		/**
		 * Determines if the text area is editable. If the text area is not
		 * editable, it will still appear enabled.
		 *
		 * <p>In the following example, the text area is not editable:</p>
		 *
		 * <listing version="3.0">
		 * textArea.isEditable = false;</listing>
		 *
		 * @default true
		 */
		public get isEditable():boolean
		{
			return this._isEditable;
		}

		/**
		 * @private
		 */
		public set isEditable(value:boolean)
		{
			if(this._isEditable == value)
			{
				return;
			}
			this._isEditable = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _backgroundFocusedSkin:DisplayObject;

		/**
		 * A display object displayed behind the text area's content when it
		 * has focus.
		 *
		 * <p>In the following example, the text area's focused background skin is
		 * specified:</p>
		 *
		 * <listing version="3.0">
		 * textArea.backgroundFocusedSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundFocusedSkin():DisplayObject
		{
			return this._backgroundFocusedSkin;
		}

		/**
		 * @private
		 */
		public set backgroundFocusedSkin(value:DisplayObject)
		{
			if(this._backgroundFocusedSkin == value)
			{
				return;
			}

			if(this._backgroundFocusedSkin && this._backgroundFocusedSkin != this._backgroundSkin &&
				this._backgroundFocusedSkin != this._backgroundDisabledSkin)
			{
				this.removeChild(this._backgroundFocusedSkin);
			}
			this._backgroundFocusedSkin = value;
			if(this._backgroundFocusedSkin && this._backgroundFocusedSkin.parent != this)
			{
				this._backgroundFocusedSkin.visible = false;
				this._backgroundFocusedSkin.touchable = false;
				this.addChildAt(this._backgroundFocusedSkin, 0);
			}
			this.invalidate(this.INVALIDATION_FLAG_SKIN);
		}

		/**
		 * @private
		 */
		protected _stateToSkinFunction:Function;

		/**
		 * Returns a skin for the current state.
		 *
		 * <p>The following function signature is expected:</p>
		 * <pre>function( target:TextArea, state:Object, oldSkin:DisplayObject = null ):DisplayObject</pre>
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
			this.invalidate(this.INVALIDATION_FLAG_SKIN);
		}

		/**
		 * @private
		 */
		protected _textEditorFactory:Function;

		/**
		 * A function used to instantiate the text editor view port. If
		 * <code>null</code>, a <code>TextFieldTextEditorViewPort</code> will
		 * be instantiated. The text editor must be an instance of
		 * <code>ITextEditorViewPort</code>. This factory can be used to change
		 * properties on the text editor view port when it is first created. For
		 * instance, if you are skinning Feathers components without a theme,
		 * you might use this factory to set styles on the text editor view
		 * port.
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextEditorViewPort</pre>
		 *
		 * <p>In the following example, a custom text editor factory is passed
		 * to the text area:</p>
		 *
		 * <listing version="3.0">
		 * input.textEditorFactory = function():ITextEditorViewPort
		 * {
		 *     return new TextFieldTextEditorViewPort();
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.text.ITextEditorViewPort
		 * @see feathers.controls.text.TextFieldTextEditorViewPort
		 */
		public get textEditorFactory():Function
		{
			return this._textEditorFactory;
		}

		/**
		 * @private
		 */
		public set textEditorFactory(value:Function)
		{
			if(this._textEditorFactory == value)
			{
				return;
			}
			this._textEditorFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_EDITOR);
		}

		/**
		 * @private
		 */
		protected _textEditorProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the text area's text
		 * editor view port. The text editor view port is an <code>ITextEditorViewPort</code>
		 * instance that is created by <code>textEditorFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>textEditorFactory</code> function
		 * instead of using <code>textEditorProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the text input's text editor properties
		 * are specified (this example assumes that the text editor is a
		 * <code>TextFieldTextEditorViewPort</code>):</p>
		 *
		 * <listing version="3.0">
		 * input.textEditorProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333);
		 * input.textEditorProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see #textEditorFactory
		 * @see feathers.controls.text.ITextEditorViewPort
		 * @see feathers.controls.text.TextFieldTextEditorViewPort
		 */
		public get textEditorProperties():Object
		{
			if(!this._textEditorProperties)
			{
				this._textEditorProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._textEditorProperties;
		}

		/**
		 * @private
		 */
		public set textEditorProperties(value:Object)
		{
			if(this._textEditorProperties == value)
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
			if(this._textEditorProperties)
			{
				this._textEditorProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._textEditorProperties = PropertyProxy(value);
			if(this._textEditorProperties)
			{
				this._textEditorProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @inheritDoc
		 */
		/*override*/ public showFocus():void
		{
			if(!this._focusManager || this._focusManager.focus != this)
			{
				return;
			}
			this.selectRange(0, this._text.length);
			super.showFocus();
		}

		/**
		 * Focuses the text area control so that it may be edited.
		 */
		public setFocus():void
		{
			if(this._textEditorHasFocus)
			{
				return;
			}
			if(this.textEditorViewPort)
			{
				this._isWaitingToSetFocus = false;
				this.textEditorViewPort.setFocus();
			}
			else
			{
				this._isWaitingToSetFocus = true;
				this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			}
		}

		/**
		 * Manually removes focus from the text input control.
		 */
		public clearFocus():void
		{
			this._isWaitingToSetFocus = false;
			if(!this.textEditorViewPort || !this._textEditorHasFocus)
			{
				return;
			}
			this.textEditorViewPort.clearFocus();
		}

		/**
		 * Sets the range of selected characters. If both values are the same,
		 * or the end index is <code>-1</code>, the text insertion position is
		 * changed and nothing is selected.
		 */
		public selectRange(startIndex:number, endIndex:number = -1):void
		{
			if(endIndex < 0)
			{
				endIndex = startIndex;
			}
			if(startIndex < 0)
			{
				throw new RangeError("Expected start index greater than or equal to 0. Received " + startIndex + ".");
			}
			if(endIndex > this._text.length)
			{
				throw new RangeError("Expected start index less than " + this._text.length + ". Received " + endIndex + ".");
			}

			if(this.textEditorViewPort)
			{
				this._pendingSelectionStartIndex = -1;
				this._pendingSelectionEndIndex = -1;
				this.textEditorViewPort.selectRange(startIndex, endIndex);
			}
			else
			{
				this._pendingSelectionStartIndex = startIndex;
				this._pendingSelectionEndIndex = endIndex;
				this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var textEditorInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_TEXT_EDITOR);
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);

			if(textEditorInvalid)
			{
				this.createTextEditor();
			}

			if(textEditorInvalid || stylesInvalid)
			{
				this.refreshTextEditorProperties();
			}

			if(textEditorInvalid || dataInvalid)
			{
				var oldIgnoreTextChanges:boolean = this._ignoreTextChanges;
				this._ignoreTextChanges = true;
				this.textEditorViewPort.text = this._text;
				this._ignoreTextChanges = oldIgnoreTextChanges;
			}

			if(textEditorInvalid || stateInvalid)
			{
				this.textEditorViewPort.isEnabled = this._isEnabled;
				if(!this._isEnabled && Mouse.supportsNativeCursor && this._oldMouseCursor)
				{
					Mouse.cursor = this._oldMouseCursor;
					this._oldMouseCursor = null;
				}
			}

			super.draw();

			this.doPendingActions();
		}

		/**
		 * Creates and adds the <code>textEditorViewPort</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #textEditorViewPort
		 * @see #textEditorFactory
		 */
		protected createTextEditor():void
		{
			if(this.textEditorViewPort)
			{
				this.textEditorViewPort.removeEventListener(Event.CHANGE, this.textEditor_changeHandler);
				this.textEditorViewPort.removeEventListener(FeathersEventType.FOCUS_IN, this.textEditor_focusInHandler);
				this.textEditorViewPort.removeEventListener(FeathersEventType.FOCUS_OUT, this.textEditor_focusOutHandler);
				this.textEditorViewPort = null;
			}

			if(this._textEditorFactory != null)
			{
				this.textEditorViewPort = ITextEditorViewPort(this._textEditorFactory());
			}
			else
			{
				this.textEditorViewPort = new TextFieldTextEditorViewPort();
			}
			this.textEditorViewPort.addEventListener(Event.CHANGE, this.textEditor_changeHandler);
			this.textEditorViewPort.addEventListener(FeathersEventType.FOCUS_IN, this.textEditor_focusInHandler);
			this.textEditorViewPort.addEventListener(FeathersEventType.FOCUS_OUT, this.textEditor_focusOutHandler);

			var oldViewPort:ITextEditorViewPort = ITextEditorViewPort(this._viewPort);
			this.viewPort = this.textEditorViewPort;
			if(oldViewPort)
			{
				//the view port setter won't do this
				oldViewPort.dispose();
			}
		}

		/**
		 * @private
		 */
		protected doPendingActions():void
		{
			if(this._isWaitingToSetFocus || (this._focusManager && this._focusManager.focus == this))
			{
				this._isWaitingToSetFocus = false;
				if(!this._textEditorHasFocus)
				{
					this.textEditorViewPort.setFocus();
				}
			}
			if(this._pendingSelectionStartIndex >= 0)
			{
				var startIndex:number = this._pendingSelectionStartIndex;
				var endIndex:number = this._pendingSelectionEndIndex;
				this._pendingSelectionStartIndex = -1;
				this._pendingSelectionEndIndex = -1;
				this.selectRange(startIndex, endIndex);
			}
		}

		/**
		 * @private
		 */
		protected refreshTextEditorProperties():void
		{
			this.textEditorViewPort.maxChars = this._maxChars;
			this.textEditorViewPort.restrict = this._restrict;
			this.textEditorViewPort.isEditable = this._isEditable;
			for(var propertyName:string in this._textEditorProperties)
			{
				var propertyValue:Object = this._textEditorProperties[propertyName];
				this.textEditorViewPort[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected refreshBackgroundSkin():void
		{
			var oldSkin:DisplayObject = this.currentBackgroundSkin;
			if(this._stateToSkinFunction != null)
			{
				this.currentBackgroundSkin = DisplayObject(this._stateToSkinFunction(this, this._currentState, oldSkin));
			}
			else if(!this._isEnabled && this._backgroundDisabledSkin)
			{
				this.currentBackgroundSkin = this._backgroundDisabledSkin;
			}
			else if(this._hasFocus && this._backgroundFocusedSkin)
			{
				this.currentBackgroundSkin = this._backgroundFocusedSkin;
			}
			else
			{
				this.currentBackgroundSkin = this._backgroundSkin;
			}
			if(oldSkin != this.currentBackgroundSkin)
			{
				if(oldSkin)
				{
					this.removeChild(oldSkin, false);
				}
				if(this.currentBackgroundSkin)
				{
					this.addChildAt(this.currentBackgroundSkin, 0);
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
		}

		/**
		 * @private
		 */
		protected setFocusOnTextEditorWithTouch(touch:Touch):void
		{
			if(!this.isFocusEnabled)
			{
				return;
			}
			touch.getLocation(this.stage, TextArea.HELPER_POINT);
			var isInBounds:boolean = this.contains(this.stage.hitTest(TextArea.HELPER_POINT, true));
			if(!this._textEditorHasFocus && isInBounds)
			{
				this.globalToLocal(TextArea.HELPER_POINT, TextArea.HELPER_POINT);
				TextArea.HELPER_POINT.x -= this._paddingLeft;
				TextArea.HELPER_POINT.y -= this._paddingTop;
				this._isWaitingToSetFocus = false;
				this.textEditorViewPort.setFocus(TextArea.HELPER_POINT);
			}
		}

		/**
		 * @private
		 */
		protected textArea_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._textAreaTouchPointID = -1;
				return;
			}

			var horizontalScrollBar:DisplayObject = DisplayObject(this.horizontalScrollBar);
			var verticalScrollBar:DisplayObject = DisplayObject(this.verticalScrollBar);
			if(this._textAreaTouchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this, TouchPhase.ENDED, this._textAreaTouchPointID);
				if(!touch || touch.isTouching(verticalScrollBar) || touch.isTouching(horizontalScrollBar))
				{
					return;
				}
				this.removeEventListener(Event.SCROLL, this.textArea_scrollHandler);
				this._textAreaTouchPointID = -1;
				if(this.textEditorViewPort.setTouchFocusOnEndedPhase)
				{
					this.setFocusOnTextEditorWithTouch(touch);
				}
			}
			else
			{
				touch = event.getTouch(this, TouchPhase.BEGAN);
				if(touch)
				{
					if(touch.isTouching(verticalScrollBar) || touch.isTouching(horizontalScrollBar))
					{
						return;
					}
					this._textAreaTouchPointID = touch.id;
					if(!this.textEditorViewPort.setTouchFocusOnEndedPhase)
					{
						this.setFocusOnTextEditorWithTouch(touch);
					}
					this.addEventListener(Event.SCROLL, this.textArea_scrollHandler);
					return;
				}
				touch = event.getTouch(this, TouchPhase.HOVER);
				if(touch)
				{
					if(touch.isTouching(verticalScrollBar) || touch.isTouching(horizontalScrollBar))
					{
						return;
					}
					if(Mouse.supportsNativeCursor && !this._oldMouseCursor)
					{
						this._oldMouseCursor = Mouse.cursor;
						Mouse.cursor = MouseCursor.IBEAM;
					}
					return;
				}
				//end hover
				if(Mouse.supportsNativeCursor && this._oldMouseCursor)
				{
					Mouse.cursor = this._oldMouseCursor;
					this._oldMouseCursor = null;
				}
			}
		}

		/**
		 * @private
		 */
		protected textArea_scrollHandler(event:Event):void
		{
			this.removeEventListener(Event.SCROLL, this.textArea_scrollHandler);
			this._textAreaTouchPointID = -1;
		}

		/**
		 * @private
		 */
		protected textArea_removedFromStageHandler(event:Event):void
		{
			if(!this._focusManager && this._textEditorHasFocus)
			{
				this.clearFocus();
			}
			this._isWaitingToSetFocus = false;
			this._textEditorHasFocus = false;
			this._textAreaTouchPointID = -1;
			this.removeEventListener(Event.SCROLL, this.textArea_scrollHandler);
			if(Mouse.supportsNativeCursor && this._oldMouseCursor)
			{
				Mouse.cursor = this._oldMouseCursor;
				this._oldMouseCursor = null;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected focusInHandler(event:Event):void
		{
			if(!this._focusManager)
			{
				return;
			}
			super.focusInHandler(event);
			this.setFocus();
		}

		/**
		 * @private
		 */
		/*override*/ protected focusOutHandler(event:Event):void
		{
			if(!this._focusManager)
			{
				return;
			}
			super.focusOutHandler(event);
			this.textEditorViewPort.clearFocus();
			this.invalidate(this.INVALIDATION_FLAG_STATE);
		}

		/**
		 * @private
		 */
		/*override*/ protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(this._isEditable)
			{
				return;
			}
			super.stage_keyDownHandler(event);
		}

		/**
		 * @private
		 */
		protected textEditor_changeHandler(event:Event):void
		{
			if(this._ignoreTextChanges)
			{
				return;
			}
			this.text = this.textEditorViewPort.text;
		}

		/**
		 * @private
		 */
		protected textEditor_focusInHandler(event:Event):void
		{
			this._textEditorHasFocus = true;
			this.currentState = TextArea.STATE_FOCUSED;
			this._touchPointID = -1;
			this.invalidate(this.INVALIDATION_FLAG_STATE);
			if(this._focusManager)
			{
				this._focusManager.focus = this;
			}
			else
			{
				this.dispatchEventWith(FeathersEventType.FOCUS_IN);
			}
		}

		/**
		 * @private
		 */
		protected textEditor_focusOutHandler(event:Event):void
		{
			this._textEditorHasFocus = false;
			this.currentState = this._isEnabled ? TextArea.STATE_ENABLED : TextArea.STATE_DISABLED;
			this.invalidate(this.INVALIDATION_FLAG_STATE);
			if(this._focusManager)
			{
				return;
			}
			this.dispatchEventWith(FeathersEventType.FOCUS_OUT);
		}
	}
}
