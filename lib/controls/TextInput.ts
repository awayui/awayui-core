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
	import IMultilineTextEditor = feathers.core.IMultilineTextEditor;
	import ITextBaselineControl = feathers.core.ITextBaselineControl;
	import ITextEditor = feathers.core.ITextEditor;
	import ITextRenderer = feathers.core.ITextRenderer;
	import IValidating = feathers.core.IValidating;
	import PropertyProxy = feathers.core.PropertyProxy;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import StateValueSelector = feathers.skins.StateValueSelector;

	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import Mouse = flash.ui.Mouse;
	import MouseCursor = flash.ui.MouseCursor;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the text input's <code>text</code> property changes.
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
	 * Dispatched when the user presses the Enter key while the text input
	 * has focus. This event may not be dispatched at all times. Certain text
	 * editors will not dispatch an event for the enter key on some platforms,
	 * depending on the values of certain properties. This may include the
	 * default values for some platforms! If you've encountered this issue,
	 * please see the specific text editor's API documentation for complete
	 * details of this event's limitations and requirements.
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
	 * @eventType feathers.events.FeathersEventType.ENTER
	 */
	/*[Event(name="enter",type="starling.events.Event")]*/

	/**
	 * Dispatched when the text input receives focus.
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
	 * Dispatched when the text input loses focus.
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
	 * Dispatched when the soft keyboard is activated by the text editor. Not
	 * all text editors will activate a soft keyboard.
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
	 * @eventType feathers.events.FeathersEventType.SOFT_KEYBOARD_ACTIVATE
	 */
	/*[Event(name="softKeyboardActivate",type="starling.events.Event")]*/

	/**
	 * Dispatched when the soft keyboard is deactivated by the text editor. Not
	 * all text editors will activate a soft keyboard.
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
	 * @eventType feathers.events.FeathersEventType.SOFT_KEYBOARD_DEACTIVATE
	 */
	/*[Event(name="softKeyboardDeactivate",type="starling.events.Event")]*/

	/**
	 * A text entry control that allows users to enter and edit a single line of
	 * uniformly-formatted text.
	 *
	 * <p>To set things like font properties, the ability to display as
	 * password, and character restrictions, use the <code>textEditorProperties</code> to pass
	 * values to the <code>ITextEditor</code> instance.</p>
	 *
	 * <p>The following example sets the text in a text input, selects the text,
	 * and listens for when the text value changes:</p>
	 *
	 * <listing version="3.0">
	 * var input:TextInput = new TextInput();
	 * input.text = "Hello World";
	 * input.selectRange( 0, input.text.length );
	 * input.addEventListener( Event.CHANGE, input_changeHandler );
	 * this.addChild( input );</listing>
	 *
	 * @see ../../../help/text-input.html How to use the Feathers TextInput component
	 * @see ../../../help/text-editors.html Introduction to Feathers text editors
	 * @see feathers.core.ITextEditor
	 * @see feathers.controls.AutoComplete
	 * @see feathers.controls.TextArea
	 */
	export class TextInput extends FeathersControl implements IFocusDisplayObject, ITextBaselineControl
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_PROMPT_FACTORY:string = "promptFactory";

		/**
		 * The <code>TextInput</code> is enabled and does not have focus.
		 */
		public static STATE_ENABLED:string = "enabled";

		/**
		 * The <code>TextInput</code> is disabled.
		 */
		public static STATE_DISABLED:string = "disabled";

		/**
		 * The <code>TextInput</code> is enabled and has focus.
		 */
		public static STATE_FOCUSED:string = "focused";

		/**
		 * An alternate style name to use with <code>TextInput</code> to allow a
		 * theme to give it a search input style. If a theme does not provide a
		 * style for the search text input, the theme will automatically fal
		 * back to using the default text input style.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the search style is applied to a text
		 * input:</p>
		 *
		 * <listing version="3.0">
		 * var input:TextInput = new TextInput();
		 * input.styleNameList.add( TextInput.ALTERNATE_STYLE_NAME_SEARCH_TEXT_INPUT );
		 * this.addChild( input );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_SEARCH_TEXT_INPUT:string = "feathers-search-text-input";

		/**
		 * DEPRECATED: Replaced by <code>TextInput.ALTERNATE_STYLE_NAME_SEARCH_TEXT_INPUT</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see TextInput#ALTERNATE_STYLE_NAME_SEARCH_TEXT_INPUT
		 */
		public static ALTERNATE_NAME_SEARCH_TEXT_INPUT:string = TextInput.ALTERNATE_STYLE_NAME_SEARCH_TEXT_INPUT;

		/**
		 * The text editor, icon, and prompt will be aligned vertically to the
		 * top edge of the text input.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * The text editor, icon, and prompt will be aligned vertically to the
		 * middle of the text input.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * The text editor, icon, and prompt will be aligned vertically to the
		 * bottom edge of the text input.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * The text editor will fill the full height of the text input (minus
		 * top and bottom padding).
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The default <code>IStyleProvider</code> for all <code>TextInput</code>
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
			this.addEventListener(TouchEvent.TOUCH, this.textInput_touchHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.textInput_removedFromStageHandler);
		}

		/**
		 * The text editor sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected textEditor:ITextEditor;

		/**
		 * The prompt text renderer sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected promptTextRenderer:ITextRenderer;

		/**
		 * The currently selected background, based on state.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected currentBackground:DisplayObject;

		/**
		 * The currently visible icon. The value will be <code>null</code> if
		 * there is no currently visible icon.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected currentIcon:DisplayObject;

		/**
		 * @private
		 */
		protected _textEditorHasFocus:boolean = false;

		/**
		 * @private
		 */
		protected _ignoreTextChanges:boolean = false;

		/**
		 * @private
		 */
		protected _touchPointID:number = -1;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return TextInput.globalStyleProvider;
		}

		/**
		 * @private
		 */
		/*override*/ public get isFocusEnabled():boolean
		{
			return this._isEditable && super.isFocusEnabled;
		}

		/**
		 * When the <code>FocusManager</code> isn't enabled, <code>hasFocus</code>
		 * can be used instead of <code>FocusManager.focus == textInput</code>
		 * to determine if the text input has focus.
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
				this.currentState = this._hasFocus ? TextInput.STATE_FOCUSED : TextInput.STATE_ENABLED;
			}
			else
			{
				this.currentState = TextInput.STATE_DISABLED;
			}
		}

		/**
		 * @private
		 */
		protected _stateNames:string[] = new Array<string>(TextInput.STATE_ENABLED, TextInput.STATE_DISABLED, TextInput.STATE_FOCUSED);

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
		protected _currentState:string = TextInput.STATE_ENABLED;

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
		 * The text displayed by the text input. The text input dispatches
		 * <code>Event.CHANGE</code> when the value of the <code>text</code>
		 * property changes for any reason.
		 *
		 * <p>In the following example, the text input's text is updated:</p>
		 *
		 * <listing version="3.0">
		 * input.text = "Hello World";</listing>
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
		 * The baseline measurement of the text, in pixels.
		 */
		public get baseline():number
		{
			if(!this.textEditor)
			{
				return 0;
			}
			return this.textEditor.y + this.textEditor.baseline;
		}

		/**
		 * @private
		 */
		protected _prompt:string = null;

		/**
		 * The prompt, hint, or description text displayed by the input when the
		 * value of its text is empty.
		 *
		 * <p>In the following example, the text input's prompt is updated:</p>
		 *
		 * <listing version="3.0">
		 * input.prompt = "User Name";</listing>
		 *
		 * @default null
		 */
		public get prompt():string
		{
			return this._prompt;
		}

		/**
		 * @private
		 */
		public set prompt(value:string)
		{
			if(this._prompt == value)
			{
				return;
			}
			this._prompt = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _typicalText:string;

		/**
		 * The text used to measure the input when the dimensions are not set
		 * explicitly (in addition to using the background skin for measurement).
		 *
		 * <p>In the following example, the text input's typical text is
		 * updated:</p>
		 *
		 * <listing version="3.0">
		 * input.text = "We want to allow the text input to show all of this text";</listing>
		 *
		 * @default null
		 */
		public get typicalText():string
		{
			return this._typicalText;
		}

		/**
		 * @private
		 */
		public set typicalText(value:string)
		{
			if(this._typicalText == value)
			{
				return;
			}
			this._typicalText = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _maxChars:number = 0;

		/**
		 * The maximum number of characters that may be entered. If <code>0</code>,
		 * any number of characters may be entered.
		 *
		 * <p>In the following example, the text input's maximum characters is
		 * specified:</p>
		 *
		 * <listing version="3.0">
		 * input.maxChars = 10;</listing>
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
		 * <p>In the following example, the text input's allowed characters are
		 * restricted:</p>
		 *
		 * <listing version="3.0">
		 * input.restrict = "0-9";</listing>
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
		protected _displayAsPassword:boolean = false;

		/**
		 * Determines if the entered text will be masked so that it cannot be
		 * seen, such as for a password input.
		 *
		 * <p>In the following example, the text input's text is displayed as
		 * a password:</p>
		 *
		 * <listing version="3.0">
		 * input.displayAsPassword = true;</listing>
		 *
		 * @default false
		 */
		public get displayAsPassword():boolean
		{
			return this._displayAsPassword;
		}

		/**
		 * @private
		 */
		public set displayAsPassword(value:boolean)
		{
			if(this._displayAsPassword == value)
			{
				return;
			}
			this._displayAsPassword = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _isEditable:boolean = true;

		/**
		 * Determines if the text input is editable. If the text input is not
		 * editable, it will still appear enabled.
		 *
		 * <p>In the following example, the text input is not editable:</p>
		 *
		 * <listing version="3.0">
		 * input.isEditable = false;</listing>
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
		protected _textEditorFactory:Function;

		/**
		 * A function used to instantiate the text editor. If null,
		 * <code>FeathersControl.defaultTextEditorFactory</code> is used
		 * instead. The text editor must be an instance of
		 * <code>ITextEditor</code>. This factory can be used to change
		 * properties on the text editor when it is first created. For instance,
		 * if you are skinning Feathers components without a theme, you might
		 * use this factory to set styles on the text editor.
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextEditor</pre>
		 *
		 * <p>In the following example, a custom text editor factory is passed
		 * to the text input:</p>
		 *
		 * <listing version="3.0">
		 * input.textEditorFactory = function():ITextEditor
		 * {
		 *     return new TextFieldTextEditor();
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextEditor
		 * @see feathers.core.FeathersControl#defaultTextEditorFactory
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
		protected _promptFactory:Function;

		/**
		 * A function used to instantiate the prompt text renderer. If null,
		 * <code>FeathersControl.defaultTextRendererFactory</code> is used
		 * instead. The prompt text renderer must be an instance of
		 * <code>ITextRenderer</code>. This factory can be used to change
		 * properties on the prompt when it is first created. For instance, if
		 * you are skinning Feathers components without a theme, you might use
		 * this factory to set styles on the prompt.
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>If the <code>prompt</code> property is <code>null</code>, the
		 * prompt text renderer will not be created.</p>
		 *
		 * <p>In the following example, a custom prompt factory is passed to the
		 * text input:</p>
		 *
		 * <listing version="3.0">
		 * input.promptFactory = function():ITextRenderer
		 * {
		 *     return new TextFieldTextRenderer();
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see #prompt
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get promptFactory():Function
		{
			return this._promptFactory;
		}

		/**
		 * @private
		 */
		public set promptFactory(value:Function)
		{
			if(this._promptFactory == value)
			{
				return;
			}
			this._promptFactory = value;
			this.invalidate(TextInput.INVALIDATION_FLAG_PROMPT_FACTORY);
		}

		/**
		 * @private
		 */
		protected _promptProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the text input's prompt
		 * text renderer. The prompt text renderer is an <code>ITextRenderer</code>
		 * instance that is created by <code>promptFactory</code>. The available
		 * properties depend on which <code>ITextRenderer</code> implementation
		 * is returned by <code>promptFactory</code>. The most common
		 * implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>promptFactory</code> function
		 * instead of using <code>promptProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the text input's prompt's properties are
		 * updated (this example assumes that the prompt text renderer is a
		 * <code>TextFieldTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * input.promptProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 * input.promptProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see #prompt
		 * @see #promptFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get promptProperties():Object
		{
			if(!this._promptProperties)
			{
				this._promptProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._promptProperties;
		}

		/**
		 * @private
		 */
		public set promptProperties(value:Object)
		{
			if(this._promptProperties == value)
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
			if(this._promptProperties)
			{
				this._promptProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._promptProperties = PropertyProxy(value);
			if(this._promptProperties)
			{
				this._promptProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 * The width of the first skin that was displayed.
		 */
		protected _originalSkinWidth:number = NaN;

		/**
		 * @private
		 * The height of the first skin that was displayed.
		 */
		protected _originalSkinHeight:number = NaN;

		/**
		 * @private
		 */
		protected _skinSelector:StateValueSelector = new StateValueSelector();

		/**
		 * The skin used when no other skin is defined for the current state.
		 * Intended for use when multiple states should use the same skin.
		 *
		 * <p>The following example gives the input a default skin to use for
		 * all states when no specific skin is available:</p>
		 *
		 * <listing version="3.0">
		 * input.backgroundSkin = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #backgroundEnabledSkin
		 * @see #backgroundDisabledSkin
		 * @see #backgroundFocusedSkin
		 */
		public get backgroundSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.defaultValue);
		}

		/**
		 * @private
		 */
		public set backgroundSkin(value:DisplayObject)
		{
			if(this._skinSelector.defaultValue == value)
			{
				return;
			}
			this._skinSelector.defaultValue = value;
			this.invalidate(this.INVALIDATION_FLAG_SKIN);
		}

		/**
		 * The skin used for the input's enabled state. If <code>null</code>,
		 * then <code>backgroundSkin</code> is used instead.
		 *
		 * <p>The following example gives the input a skin for the enabled state:</p>
		 *
		 * <listing version="3.0">
		 * input.backgroundEnabledSkin = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #backgroundSkin
		 * @see #backgroundDisabledSkin
		 */
		public get backgroundEnabledSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.getValueForState(TextInput.STATE_ENABLED));
		}

		/**
		 * @private
		 */
		public set backgroundEnabledSkin(value:DisplayObject)
		{
			if(this._skinSelector.getValueForState(TextInput.STATE_ENABLED) == value)
			{
				return;
			}
			this._skinSelector.setValueForState(value, TextInput.STATE_ENABLED);
			this.invalidate(this.INVALIDATION_FLAG_SKIN);
		}

		/**
		 * The skin used for the input's focused state. If <code>null</code>,
		 * then <code>backgroundSkin</code> is used instead.
		 *
		 * <p>The following example gives the input a skin for the focused state:</p>
		 *
		 * <listing version="3.0">
		 * input.backgroundFocusedSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundFocusedSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.getValueForState(TextInput.STATE_FOCUSED));
		}

		/**
		 * @private
		 */
		public set backgroundFocusedSkin(value:DisplayObject)
		{
			if(this._skinSelector.getValueForState(TextInput.STATE_FOCUSED) == value)
			{
				return;
			}
			this._skinSelector.setValueForState(value, TextInput.STATE_FOCUSED);
			this.invalidate(this.INVALIDATION_FLAG_SKIN);
		}

		/**
		 * The skin used for the input's disabled state. If <code>null</code>,
		 * then <code>backgroundSkin</code> is used instead.
		 *
		 * <p>The following example gives the input a skin for the disabled state:</p>
		 *
		 * <listing version="3.0">
		 * input.backgroundDisabledSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundDisabledSkin():DisplayObject
		{
			return DisplayObject(this._skinSelector.getValueForState(TextInput.STATE_DISABLED));
		}

		/**
		 * @private
		 */
		public set backgroundDisabledSkin(value:DisplayObject)
		{
			if(this._skinSelector.getValueForState(TextInput.STATE_DISABLED) == value)
			{
				return;
			}
			this._skinSelector.setValueForState(value, TextInput.STATE_DISABLED);
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
		 * <pre>function( target:TextInput, state:Object, oldSkin:DisplayObject = null ):DisplayObject</pre>
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
		protected _iconSelector:StateValueSelector = new StateValueSelector();

		/**
		 * The icon used when no other icon is defined for the current state.
		 * Intended for use when multiple states should use the same icon.
		 *
		 * <p>The following example gives the input a default icon to use for
		 * all states when no specific icon is available:</p>
		 *
		 * <listing version="3.0">
		 * input.defaultIcon = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #stateToIconFunction
		 * @see #enabledIcon
		 * @see #disabledIcon
		 * @see #focusedIcon
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
		 * The icon used for the input's enabled state. If <code>null</code>,
		 * then <code>defaultIcon</code> is used instead.
		 *
		 * <p>The following example gives the input an icon for the enabled state:</p>
		 *
		 * <listing version="3.0">
		 * button.enabledIcon = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #defaultIcon
		 * @see #disabledIcon
		 */
		public get enabledIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.getValueForState(TextInput.STATE_ENABLED));
		}

		/**
		 * @private
		 */
		public set enabledIcon(value:DisplayObject)
		{
			if(this._iconSelector.getValueForState(TextInput.STATE_ENABLED) == value)
			{
				return;
			}
			this._iconSelector.setValueForState(value, TextInput.STATE_ENABLED);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * The icon used for the input's disabled state. If <code>null</code>,
		 * then <code>defaultIcon</code> is used instead.
		 *
		 * <p>The following example gives the input an icon for the disabled state:</p>
		 *
		 * <listing version="3.0">
		 * button.disabledIcon = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #defaultIcon
		 * @see #enabledIcon
		 */
		public get disabledIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.getValueForState(TextInput.STATE_DISABLED));
		}

		/**
		 * @private
		 */
		public set disabledIcon(value:DisplayObject)
		{
			if(this._iconSelector.getValueForState(TextInput.STATE_DISABLED) == value)
			{
				return;
			}
			this._iconSelector.setValueForState(value, TextInput.STATE_DISABLED);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * The icon used for the input's focused state. If <code>null</code>,
		 * then <code>defaultIcon</code> is used instead.
		 *
		 * <p>The following example gives the input an icon for the focused state:</p>
		 *
		 * <listing version="3.0">
		 * button.focusedIcon = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #defaultIcon
		 * @see #enabledIcon
		 * @see #disabledIcon
		 */
		public get focusedIcon():DisplayObject
		{
			return DisplayObject(this._iconSelector.getValueForState(TextInput.STATE_FOCUSED));
		}

		/**
		 * @private
		 */
		public set focusedIcon(value:DisplayObject)
		{
			if(this._iconSelector.getValueForState(TextInput.STATE_FOCUSED) == value)
			{
				return;
			}
			this._iconSelector.setValueForState(value, TextInput.STATE_FOCUSED);
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _stateToIconFunction:Function;

		/**
		 * Returns an icon for the current state.
		 *
		 * <p>The following function signature is expected:</p>
		 * <pre>function( target:TextInput, state:Object, oldIcon:DisplayObject = null ):DisplayObject</pre>
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
		protected _gap:number = 0;

		/**
		 * The space, in pixels, between the icon and the text editor, if an
		 * icon exists.
		 *
		 * <p>The following example creates a gap of 50 pixels between the icon
		 * and the text editor:</p>
		 *
		 * <listing version="3.0">
		 * button.defaultIcon = new Image( texture );
		 * button.gap = 50;</listing>
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
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the text input's padding is set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * input.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the input's top edge and the
		 * input's content.
		 *
		 * <p>In the following example, the text input's top padding is set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * input.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the input's right edge and the
		 * input's content.
		 *
		 * <p>In the following example, the text input's right padding is set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * input.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the input's bottom edge and
		 * the input's content.
		 *
		 * <p>In the following example, the text input's bottom padding is set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * input.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the input's left edge and the
		 * input's content.
		 *
		 * <p>In the following example, the text input's left padding is set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * input.paddingLeft = 20;</listing>
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
		protected _verticalAlign:string = TextInput.VERTICAL_ALIGN_MIDDLE;

		/*[Inspectable(type="String",enumeration="top,middle,bottom,justify")]*/
		/**
		 * The location where the text editor is aligned vertically (on
		 * the y-axis).
		 *
		 * <p>The following example aligns the text editor to the top:</p>
		 *
		 * <listing version="3.0">
		 * input.verticalAlign = TextInput.VERTICAL_ALIGN_TOP;</listing>
		 *
		 * @default TextInput.VERTICAL_ALIGN_MIDDLE
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
		 * Flag indicating that the text editor should get focus after it is
		 * created.
		 */
		protected _isWaitingToSetFocus:boolean = false;

		/**
		 * @private
		 */
		protected _pendingSelectionBeginIndex:number = -1;

		/**
		 * @private
		 */
		protected _pendingSelectionEndIndex:number = -1;

		/**
		 * @private
		 */
		protected _oldMouseCursor:string = null;

		/**
		 * @private
		 */
		protected _textEditorProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the text input's
		 * text editor. The text editor is an <code>ITextEditor</code> instance
		 * that is created by <code>textEditorFactory</code>.
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
		 * <code>StageTextTextEditor</code>):</p>
		 *
		 * <listing version="3.0">
		 * input.textEditorProperties.fontName = "Helvetica";
		 * input.textEditorProperties.fontSize = 16;</listing>
		 *
		 * @default null
		 *
		 * @see #textEditorFactory
		 * @see feathers.core.ITextEditor
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
		 * @copy feathers.core.ITextEditor#selectionBeginIndex
		 */
		public get selectionBeginIndex():number
		{
			if(this._pendingSelectionBeginIndex >= 0)
			{
				return this._pendingSelectionBeginIndex;
			}
			if(this.textEditor)
			{
				return this.textEditor.selectionBeginIndex;
			}
			return 0;
		}

		/**
		 * @copy feathers.core.ITextEditor#selectionEndIndex
		 */
		public get selectionEndIndex():number
		{
			if(this._pendingSelectionEndIndex >= 0)
			{
				return this._pendingSelectionEndIndex;
			}
			if(this.textEditor)
			{
				return this.textEditor.selectionEndIndex;
			}
			return 0;
		}

		/**
		 * @private
		 */
		/*override*/ public set visible(value:boolean)
		{
			if(!value)
			{
				this._isWaitingToSetFocus = false;
				if(this._textEditorHasFocus)
				{
					this.textEditor.clearFocus();
				}
			}
			super.visible = value;
		}

		/**
		 * @private
		 */
		/*override*/ public hitTest(localPoint:Point, forTouch:boolean = false):DisplayObject
		{
			if(forTouch && (!this.visible || !this.touchable))
			{
				return null;
			}
			var clipRect:Rectangle = this.clipRect;
			if(clipRect && !clipRect.containsPoint(localPoint))
			{
				return null;
			}
			return this._hitArea.containsPoint(localPoint) ? DisplayObject(this.textEditor) : null;
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
		 * Focuses the text input control so that it may be edited.
		 */
		public setFocus():void
		{
			//if the text editor has focus, no need to set focus
			//if this is invisible, it wouldn't make sense to set focus
			//if there's a touch point ID, we'll be setting focus on our own
			if(this._textEditorHasFocus || !this.visible || this._touchPointID >= 0)
			{
				return;
			}
			if(this.textEditor)
			{
				this._isWaitingToSetFocus = false;
				this.textEditor.setFocus();
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
			if(!this.textEditor || !this._textEditorHasFocus)
			{
				return;
			}
			this.textEditor.clearFocus();
		}

		/**
		 * Sets the range of selected characters. If both values are the same,
		 * or the end index is <code>-1</code>, the text insertion position is
		 * changed and nothing is selected.
		 */
		public selectRange(beginIndex:number, endIndex:number = -1):void
		{
			if(endIndex < 0)
			{
				endIndex = beginIndex;
			}
			if(beginIndex < 0)
			{
				throw new RangeError("Expected start index >= 0. Received " + beginIndex + ".");
			}
			if(endIndex > this._text.length)
			{
				throw new RangeError("Expected end index <= " + this._text.length + ". Received " + endIndex + ".");
			}

			//if it's invalid, we need to wait until validation before changing
			//the selection
			if(this.textEditor && (this._isValidating || !this.isInvalid()))
			{
				this._pendingSelectionBeginIndex = -1;
				this._pendingSelectionEndIndex = -1;
				this.textEditor.selectRange(beginIndex, endIndex);
			}
			else
			{
				this._pendingSelectionBeginIndex = beginIndex;
				this._pendingSelectionEndIndex = endIndex;
				this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var skinInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SKIN);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var textEditorInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_TEXT_EDITOR);
			var promptFactoryInvalid:boolean = this.isInvalid(TextInput.INVALIDATION_FLAG_PROMPT_FACTORY);
			var focusInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_FOCUS);

			if(textEditorInvalid)
			{
				this.createTextEditor();
			}

			if(promptFactoryInvalid || (this._prompt !== null && !this.promptTextRenderer))
			{
				this.createPrompt();
			}

			if(textEditorInvalid || stylesInvalid)
			{
				this.refreshTextEditorProperties();
			}

			if(promptFactoryInvalid || stylesInvalid)
			{
				this.refreshPromptProperties();
			}

			if(textEditorInvalid || dataInvalid)
			{
				var oldIgnoreTextChanges:boolean = this._ignoreTextChanges;
				this._ignoreTextChanges = true;
				this.textEditor.text = this._text;
				this._ignoreTextChanges = oldIgnoreTextChanges;
			}

			if(this.promptTextRenderer)
			{
				if(promptFactoryInvalid || dataInvalid || stylesInvalid)
				{
					this.promptTextRenderer.visible = this._prompt && this._text.length == 0;
				}

				if(promptFactoryInvalid || stateInvalid)
				{
					this.promptTextRenderer.isEnabled = this._isEnabled;
				}
			}

			if(textEditorInvalid || stateInvalid)
			{
				this.textEditor.isEnabled = this._isEnabled;
				if(!this._isEnabled && Mouse.supportsNativeCursor && this._oldMouseCursor)
				{
					Mouse.cursor = this._oldMouseCursor;
					this._oldMouseCursor = null;
				}
			}

			if(stateInvalid || skinInvalid)
			{
				this.refreshBackgroundSkin();
			}
			if(stateInvalid || stylesInvalid)
			{
				this.refreshIcon();
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			this.layoutChildren();

			if(sizeInvalid || focusInvalid)
			{
				this.refreshFocusIndicator();
			}

			this.doPendingActions();
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

			var typicalTextWidth:number = 0;
			var typicalTextHeight:number = 0;
			if(this._typicalText)
			{
				var oldTextEditorWidth:number = this.textEditor.width;
				var oldTextEditorHeight:number = this.textEditor.height;
				var oldIgnoreTextChanges:boolean = this._ignoreTextChanges;
				this._ignoreTextChanges = true;
				this.textEditor.setSize(NaN, NaN);
				this.textEditor.text = this._typicalText;
				this.textEditor.measureText(TextInput.HELPER_POINT);
				this.textEditor.text = this._text;
				this._ignoreTextChanges = oldIgnoreTextChanges;
				typicalTextWidth = TextInput.HELPER_POINT.x;
				typicalTextHeight = TextInput.HELPER_POINT.y;
			}
			if(this._prompt !== null)
			{
				this.promptTextRenderer.setSize(NaN, NaN);
				this.promptTextRenderer.measureText(TextInput.HELPER_POINT);
				typicalTextWidth = Math.max(typicalTextWidth, TextInput.HELPER_POINT.x);
				typicalTextHeight = Math.max(typicalTextHeight, TextInput.HELPER_POINT.y);
			}

			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				newWidth = Math.max(this._originalSkinWidth, typicalTextWidth + this._paddingLeft + this._paddingRight);
				if(newWidth !== newWidth) //isNaN
				{
					newWidth = 0;
				}
			}
			if(needsHeight)
			{
				newHeight = Math.max(this._originalSkinHeight, typicalTextHeight + this._paddingTop + this._paddingBottom);
				if(newHeight !== newHeight) //isNaN
				{
					newHeight = 0;
				}
			}

			var isMultiline:boolean = this.textEditor instanceof IMultilineTextEditor && IMultilineTextEditor(this.textEditor).multiline;
			if(this._typicalText && (this._verticalAlign == TextInput.VERTICAL_ALIGN_JUSTIFY || isMultiline))
			{
				this.textEditor.width = oldTextEditorWidth;
				this.textEditor.height = oldTextEditorHeight;
			}

			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates and adds the <code>textEditor</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #textEditor
		 * @see #textEditorFactory
		 */
		protected createTextEditor():void
		{
			if(this.textEditor)
			{
				this.removeChild(DisplayObject(this.textEditor), true);
				this.textEditor.removeEventListener(Event.CHANGE, this.textEditor_changeHandler);
				this.textEditor.removeEventListener(FeathersEventType.ENTER, this.textEditor_enterHandler);
				this.textEditor.removeEventListener(FeathersEventType.FOCUS_IN, this.textEditor_focusInHandler);
				this.textEditor.removeEventListener(FeathersEventType.FOCUS_OUT, this.textEditor_focusOutHandler);
				this.textEditor = null;
			}

			var factory:Function = this._textEditorFactory != null ? this._textEditorFactory : FeathersControl.defaultTextEditorFactory;
			this.textEditor = ITextEditor(factory());
			this.textEditor.addEventListener(Event.CHANGE, this.textEditor_changeHandler);
			this.textEditor.addEventListener(FeathersEventType.ENTER, this.textEditor_enterHandler);
			this.textEditor.addEventListener(FeathersEventType.FOCUS_IN, this.textEditor_focusInHandler);
			this.textEditor.addEventListener(FeathersEventType.FOCUS_OUT, this.textEditor_focusOutHandler);
			this.addChild(DisplayObject(this.textEditor));
		}

		/**
		 * @private
		 */
		protected createPrompt():void
		{
			if(this.promptTextRenderer)
			{
				this.removeChild(DisplayObject(this.promptTextRenderer), true);
				this.promptTextRenderer = null;
			}

			if(this._prompt === null)
			{
				return;
			}

			var factory:Function = this._promptFactory != null ? this._promptFactory : FeathersControl.defaultTextRendererFactory;
			this.promptTextRenderer = ITextRenderer(factory());
			this.addChild(DisplayObject(this.promptTextRenderer));
		}

		/**
		 * @private
		 */
		protected doPendingActions():void
		{
			if(this._isWaitingToSetFocus)
			{
				this._isWaitingToSetFocus = false;
				if(!this._textEditorHasFocus)
				{
					this.textEditor.setFocus();
				}
			}
			if(this._pendingSelectionBeginIndex >= 0)
			{
				var startIndex:number = this._pendingSelectionBeginIndex;
				var endIndex:number = this._pendingSelectionEndIndex;
				this._pendingSelectionBeginIndex = -1;
				this._pendingSelectionEndIndex = -1;
				if(endIndex >= 0)
				{
					var textLength:number = this._text.length;
					if(endIndex > textLength)
					{
						endIndex = textLength;
					}
				}
				this.selectRange(startIndex, endIndex);
			}
		}

		/**
		 * @private
		 */
		protected refreshTextEditorProperties():void
		{
			this.textEditor.displayAsPassword = this._displayAsPassword;
			this.textEditor.maxChars = this._maxChars;
			this.textEditor.restrict = this._restrict;
			this.textEditor.isEditable = this._isEditable;
			for(var propertyName:string in this._textEditorProperties)
			{
				var propertyValue:Object = this._textEditorProperties[propertyName];
				this.textEditor[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshPromptProperties():void
		{
			if(!this.promptTextRenderer)
			{
				return;
			}
			this.promptTextRenderer.text = this._prompt;
			var displayPrompt:DisplayObject = DisplayObject(this.promptTextRenderer);
			for(var propertyName:string in this._promptProperties)
			{
				var propertyValue:Object = this._promptProperties[propertyName];
				this.promptTextRenderer[propertyName] = propertyValue;
			}
		}

		/**
		 * Sets the <code>currentBackground</code> property.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected refreshBackgroundSkin():void
		{
			var oldSkin:DisplayObject = this.currentBackground;
			if(this._stateToSkinFunction != null)
			{
				this.currentBackground = DisplayObject(this._stateToSkinFunction(this, this._currentState, oldSkin));
			}
			else
			{
				this.currentBackground = DisplayObject(this._skinSelector.updateValue(this, this._currentState, this.currentBackground));
			}
			if(this.currentBackground != oldSkin)
			{
				if(oldSkin)
				{
					this.removeChild(oldSkin, false);
				}
				if(this.currentBackground)
				{
					this.addChildAt(this.currentBackground, 0);
				}
			}
			if(this.currentBackground &&
				(this._originalSkinWidth !== this._originalSkinWidth || //isNaN
					this._originalSkinHeight !== this._originalSkinHeight)) //isNaN
			{
				if(this.currentBackground instanceof IValidating)
				{
					IValidating(this.currentBackground).validate();
				}
				this._originalSkinWidth = this.currentBackground.width;
				this._originalSkinHeight = this.currentBackground.height;
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
					this.removeChild(oldIcon, false);
				}
				if(this.currentIcon)
				{
					//we want the icon to appear below the text editor
					var index:number = this.getChildIndex(DisplayObject(this.textEditor));
					this.addChildAt(this.currentIcon, index);
				}
			}
		}

		/**
		 * Positions and sizes the text input's children.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected layoutChildren():void
		{
			if(this.currentBackground)
			{
				this.currentBackground.visible = true;
				this.currentBackground.touchable = true;
				this.currentBackground.width = this.actualWidth;
				this.currentBackground.height = this.actualHeight;
			}

			if(this.currentIcon instanceof IValidating)
			{
				IValidating(this.currentIcon).validate();
			}

			if(this.currentIcon)
			{
				this.currentIcon.x = this._paddingLeft;
				this.textEditor.x = this.currentIcon.x + this.currentIcon.width + this._gap;
				if(this.promptTextRenderer)
				{
					this.promptTextRenderer.x = this.currentIcon.x + this.currentIcon.width + this._gap;
				}
			}
			else
			{
				this.textEditor.x = this._paddingLeft;
				if(this.promptTextRenderer)
				{
					this.promptTextRenderer.x = this._paddingLeft;
				}
			}
			this.textEditor.width = this.actualWidth - this._paddingRight - this.textEditor.x;
			if(this.promptTextRenderer)
			{
				this.promptTextRenderer.width = this.actualWidth - this._paddingRight - this.promptTextRenderer.x;
			}

			var isMultiline:boolean = this.textEditor instanceof IMultilineTextEditor && IMultilineTextEditor(this.textEditor).multiline;
			if(isMultiline || this._verticalAlign == TextInput.VERTICAL_ALIGN_JUSTIFY)
			{
				//multiline is treated the same as justify
				this.textEditor.height = this.actualHeight - this._paddingTop - this._paddingBottom;
			}
			else
			{
				//clear the height and auto-size instead
				this.textEditor.height = NaN;
			}
			this.textEditor.validate();
			if(this.promptTextRenderer)
			{
				this.promptTextRenderer.validate();
			}

			var biggerHeight:number = this.textEditor.height;
			var biggerBaseline:number = this.textEditor.baseline;
			if(this.promptTextRenderer)
			{
				var promptBaseline:number = this.promptTextRenderer.baseline;
				var promptHeight:number = this.promptTextRenderer.height;
				if(promptBaseline > biggerBaseline)
				{
					biggerBaseline = promptBaseline;
				}
				if(promptHeight > biggerHeight)
				{
					biggerHeight = promptHeight;
				}
			}

			if(isMultiline)
			{
				this.textEditor.y = this._paddingTop + biggerBaseline - this.textEditor.baseline;
				if(this.promptTextRenderer)
				{
					this.promptTextRenderer.y = this._paddingTop + biggerBaseline - promptBaseline;
					this.promptTextRenderer.height = this.actualHeight - this.promptTextRenderer.y - this._paddingBottom;
				}
				if(this.currentIcon)
				{
					this.currentIcon.y = this._paddingTop;
				}
			}
			else
			{
				switch(this._verticalAlign)
				{
					case TextInput.VERTICAL_ALIGN_JUSTIFY:
					{
						this.textEditor.y = this._paddingTop + biggerBaseline - this.textEditor.baseline;
						if(this.promptTextRenderer)
						{
							this.promptTextRenderer.y = this._paddingTop + biggerBaseline - promptBaseline;
							this.promptTextRenderer.height = this.actualHeight - this.promptTextRenderer.y - this._paddingBottom;
						}
						if(this.currentIcon)
						{
							this.currentIcon.y = this._paddingTop;
						}
						break;
					}
					case TextInput.VERTICAL_ALIGN_TOP:
					{
						this.textEditor.y = this._paddingTop + biggerBaseline - this.textEditor.baseline;
						if(this.promptTextRenderer)
						{
							this.promptTextRenderer.y = this._paddingTop + biggerBaseline - promptBaseline;
						}
						if(this.currentIcon)
						{
							this.currentIcon.y = this._paddingTop;
						}
						break;
					}
					case TextInput.VERTICAL_ALIGN_BOTTOM:
					{
						this.textEditor.y = this.actualHeight - this._paddingBottom - biggerHeight + biggerBaseline - this.textEditor.baseline;
						if(this.promptTextRenderer)
						{
							this.promptTextRenderer.y = this.actualHeight - this._paddingBottom - biggerHeight + biggerBaseline - promptBaseline;
						}
						if(this.currentIcon)
						{
							this.currentIcon.y = this.actualHeight - this._paddingBottom - this.currentIcon.height;
						}
						break;
					}
					default: //middle
					{
						this.textEditor.y = biggerBaseline - this.textEditor.baseline + this._paddingTop + (this.actualHeight - this._paddingTop - this._paddingBottom - biggerHeight) / 2;
						if(this.promptTextRenderer)
						{
							this.promptTextRenderer.y = biggerBaseline - promptBaseline + this._paddingTop + (this.actualHeight - this._paddingTop - this._paddingBottom - biggerHeight) / 2;
						}
						if(this.currentIcon)
						{
							this.currentIcon.y = this._paddingTop + (this.actualHeight - this._paddingTop - this._paddingBottom - this.currentIcon.height) / 2;
						}
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
			touch.getLocation(this.stage, TextInput.HELPER_POINT);
			var isInBounds:boolean = this.contains(this.stage.hitTest(TextInput.HELPER_POINT, true));
			if(isInBounds && !this._textEditorHasFocus)
			{
				this.textEditor.globalToLocal(TextInput.HELPER_POINT, TextInput.HELPER_POINT);
				this._isWaitingToSetFocus = false;
				this.textEditor.setFocus(TextInput.HELPER_POINT);
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
		protected textInput_removedFromStageHandler(event:Event):void
		{
			if(!this._focusManager && this._textEditorHasFocus)
			{
				this.clearFocus();
			}
			this._textEditorHasFocus = false;
			this._isWaitingToSetFocus = false;
			this._touchPointID = -1;
			if(Mouse.supportsNativeCursor && this._oldMouseCursor)
			{
				Mouse.cursor = this._oldMouseCursor;
				this._oldMouseCursor = null;
			}
		}

		/**
		 * @private
		 */
		protected textInput_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled || !this._isEditable)
			{
				this._touchPointID = -1;
				return;
			}

			if(this._touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this, TouchPhase.ENDED, this._touchPointID);
				if(!touch)
				{
					return;
				}
				this._touchPointID = -1;
				if(this.textEditor.setTouchFocusOnEndedPhase)
				{
					this.setFocusOnTextEditorWithTouch(touch);
				}
			}
			else
			{
				touch = event.getTouch(this, TouchPhase.BEGAN);
				if(touch)
				{
					this._touchPointID = touch.id;
					if(!this.textEditor.setTouchFocusOnEndedPhase)
					{
						this.setFocusOnTextEditorWithTouch(touch);
					}
					return;
				}
				touch = event.getTouch(this, TouchPhase.HOVER);
				if(touch)
				{
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
			this.textEditor.clearFocus();
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
			this.text = this.textEditor.text;
		}

		/**
		 * @private
		 */
		protected textEditor_enterHandler(event:Event):void
		{
			this.dispatchEventWith(FeathersEventType.ENTER);
		}

		/**
		 * @private
		 */
		protected textEditor_focusInHandler(event:Event):void
		{
			if(!this.visible)
			{
				this.textEditor.clearFocus();
				return;
			}
			this._textEditorHasFocus = true;
			this.currentState = TextInput.STATE_FOCUSED;
			if(this._focusManager && this._isFocusEnabled)
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
			this.currentState = this._isEnabled ? TextInput.STATE_ENABLED : TextInput.STATE_DISABLED;
			if(this._focusManager && this._isFocusEnabled)
			{
				if(this._focusManager.focus == this)
				{
					this._focusManager.focus = null;
				}
			}
			else
			{
				this.dispatchEventWith(FeathersEventType.FOCUS_OUT);
			}
		}
	}
}
