/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.text
{
	import FocusManager = feathers.core.FocusManager;
	import ITextEditor = feathers.core.ITextEditor;
	import FeathersEventType = feathers.events.FeathersEventType;
	import TextInputNavigation = feathers.utils.text.TextInputNavigation;
	import TextInputRestrict = feathers.utils.text.TextInputRestrict;

	import Clipboard = flash.desktop.Clipboard;
	import ClipboardFormats = flash.desktop.ClipboardFormats;
	import InteractiveObject = flash.display.InteractiveObject;
	import Stage = flash.display.Stage;
	import Event = flash.events.Event;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import TextFormatAlign = flash.text.TextFormatAlign;
	import Keyboard = flash.ui.Keyboard;

	import RenderSupport = starling.core.RenderSupport;
	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Quad = starling.display.Quad;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;
	import BitmapChar = starling.text.BitmapChar;
	import BitmapFont = starling.text.BitmapFont;

	/**
	 * Dispatched when the text property changes.
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
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/**
	 * Dispatched when the user presses the Enter key while the editor has
	 * focus.
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
	 * Dispatched when the text editor receives focus.
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
	 * Dispatched when the text editor loses focus.
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
	 * Renders text using <code>starling.text.BitmapFont</code> that may be
	 * edited at runtime by the user.
	 *
	 * <p><strong>Warning:</strong> This text editor is intended for use in
	 * desktop applications only, and it does not provide support for software
	 * keyboards on mobile devices.</p>
	 *
	 * @see ../../../help/text-editors.html Introduction to Feathers text editors
	 * @see http://doc.starling-framework.org/core/starling/text/BitmapFont.html starling.text.BitmapFont
	 */
	export class BitmapFontTextEditor extends BitmapFontTextRenderer implements ITextEditor
	{
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
			this._text = "";
			this.isQuickHitAreaEnabled = true;
			this.truncateToFit = false;
			this.addEventListener(TouchEvent.TOUCH, this.textEditor_touchHandler);
		}

		/**
		 * @private
		 */
		protected _selectionSkin:DisplayObject;

		/**
		 *
		 */
		public get selectionSkin():DisplayObject
		{
			return this._selectionSkin;
		}

		/**
		 * @private
		 */
		public set selectionSkin(value:DisplayObject)
		{
			if(this._selectionSkin == value)
			{
				return;
			}
			if(this._selectionSkin && this._selectionSkin.parent == this)
			{
				this._selectionSkin.removeFromParent();
			}
			this._selectionSkin = value;
			if(this._selectionSkin)
			{
				this._selectionSkin.visible = false;
				this.addChildAt(this._selectionSkin, 0);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _cursorSkin:DisplayObject;

		/**
		 *
		 */
		public get cursorSkin():DisplayObject
		{
			return this._cursorSkin;
		}

		/**
		 * @private
		 */
		public set cursorSkin(value:DisplayObject)
		{
			if(this._cursorSkin == value)
			{
				return;
			}
			if(this._cursorSkin && this._cursorSkin.parent == this)
			{
				this._cursorSkin.removeFromParent();
			}
			this._cursorSkin = value;
			if(this._cursorSkin)
			{
				this._cursorSkin.visible = false;
				this.addChild(this._cursorSkin);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _unmaskedText:string;

		/**
		 * @private
		 */
		protected _displayAsPassword:boolean = false;

		/**
		 * Indicates whether the text field is a password text field that hides
		 * input characters using a substitute character.
		 *
		 * <p>In the following example, the text is displayed as a password:</p>
		 *
		 * <listing version="3.0">
		 * textEditor.displayAsPassword = true;</listing>
		 *
		 * @default false
		 *
		 * @see #passwordCharCode
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
			if(this._displayAsPassword)
			{
				this._unmaskedText = this._text;
				this.refreshMaskedText();
			}
			else
			{
				this._text = this._unmaskedText;
				this._unmaskedText = null;
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _passwordCharCode:number = 42; //asterisk

		/**
		 * The character code of the character used to display a password.
		 *
		 * <p>In the following example, the substitute character for passwords
		 * is set to a bullet:</p>
		 *
		 * <listing version="3.0">
		 * textEditor.displayAsPassword = true;
		 * textEditor.passwordCharCode = "•".charCodeAt(0);</listing>
		 *
		 * @default 42 (asterisk)
		 *
		 * @see #displayAsPassword
		 */
		public get passwordCharCode():number
		{
			return this._passwordCharCode;
		}

		/**
		 * @private
		 */
		public set passwordCharCode(value:number)
		{
			if(this._passwordCharCode == value)
			{
				return;
			}
			this._passwordCharCode = value;
			if(this._displayAsPassword)
			{
				this.refreshMaskedText();
			}
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
		 * <p>In the following example, the text is not editable:</p>
		 *
		 * <listing version="3.0">
		 * textEditor.isEditable = false;</listing>
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
		 * @inheritDoc
		 *
		 * @default false
		 */
		public get setTouchFocusOnEndedPhase():boolean
		{
			return false;
		}

		/**
		 * @private
		 */
		/*override*/ public get text():string
		{
			if(this._displayAsPassword)
			{
				return this._unmaskedText;
			}
			return this._text;
		}

		/**
		 * @private
		 */
		/*override*/ public set text(value:string)
		{
			if(value === null)
			{
				//don't allow null or undefined
				value = "";
			}
			var currentValue:string = this._text;
			if(this._displayAsPassword)
			{
				currentValue = this._unmaskedText;
			}
			if(currentValue == value)
			{
				return;
			}
			if(this._displayAsPassword)
			{
				this._unmaskedText = value;
				this.refreshMaskedText();
			}
			else
			{
				this._text = value;
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			var textLength:number = this._text.length;
			//we need to account for the possibility that the text is in the
			//middle of being selected when it changes
			if(this._selectionAnchorIndex > textLength)
			{
				this._selectionAnchorIndex = textLength;
			}
			//then, we need to make sure the selected range is still valid
			if(this._selectionBeginIndex > textLength)
			{
				this.selectRange(textLength, textLength);
			}
			else if(this._selectionEndIndex > textLength)
			{
				this.selectRange(this._selectionBeginIndex, textLength);
			}
			this.dispatchEventWith(this.starling.events.Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _maxChars:number = 0;

		/**
		 * Indicates the maximum number of characters that a user can enter into
		 * the text editor. A script can insert more text than <code>maxChars</code>
		 * allows. If <code>maxChars</code> equals zero, a user can enter an
		 * unlimited amount of text into the text editor.
		 *
		 * <p>In the following example, the maximum character count is changed:</p>
		 *
		 * <listing version="3.0">
		 * textEditor.maxChars = 10;</listing>
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
		protected _restrict:TextInputRestrict;

		/**
		 * Restricts the set of characters that a user can enter into the text
		 * field. Only user interaction is restricted; a script can put any text
		 * into the text field.
		 *
		 * <p>In the following example, the text is restricted to numbers:</p>
		 *
		 * <listing version="3.0">
		 * textEditor.restrict = "0-9";</listing>
		 *
		 * @default null
		 */
		public get restrict():string
		{
			if(!this._restrict)
			{
				return null;
			}
			return this._restrict.restrict;
		}

		/**
		 * @private
		 */
		public set restrict(value:string)
		{
			if(this._restrict && this._restrict.restrict === value)
			{
				return;
			}
			if(!this._restrict && value === null)
			{
				return;
			}
			if(value === null)
			{
				this._restrict = null;
			}
			else
			{
				if(this._restrict)
				{
					this._restrict.restrict = value;
				}
				else
				{

					this._restrict = new TextInputRestrict(value);
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _selectionBeginIndex:number = 0;

		/**
		 * @inheritDoc
		 */
		public get selectionBeginIndex():number
		{
			return this._selectionBeginIndex;
		}

		/**
		 * @private
		 */
		protected _selectionEndIndex:number = 0;

		/**
		 * @inheritDoc
		 */
		public get selectionEndIndex():number
		{
			return this._selectionEndIndex;
		}

		/**
		 * @private
		 */
		protected _selectionAnchorIndex:number = -1;

		/**
		 * @private
		 */
		protected _scrollX:number = 0;

		/**
		 * @private
		 */
		protected touchPointID:number = -1;

		/**
		 * @private
		 */
		protected _nativeFocus:InteractiveObject;

		/**
		 * @private
		 */
		protected get nativeFocus():InteractiveObject
		{
			return this._nativeFocus;
		}

		/**
		 * @private
		 */
		protected set nativeFocus(value:InteractiveObject)
		{
			if(this._nativeFocus == value)
			{
				return;
			}
			if(this._nativeFocus)
			{
				this._nativeFocus.removeEventListener(this.flash.events.Event.CUT, this.nativeStage_cutHandler);
				this._nativeFocus.removeEventListener(this.flash.events.Event.COPY, this.nativeStage_copyHandler);
				this._nativeFocus.removeEventListener(this.flash.events.Event.PASTE, this.nativeStage_pasteHandler);
				this._nativeFocus.removeEventListener(this.flash.events.Event.SELECT_ALL, this.nativeStage_selectAllHandler);
			}
			this._nativeFocus = value;
			if(this._nativeFocus)
			{
				this._nativeFocus.addEventListener(this.flash.events.Event.CUT, this.nativeStage_cutHandler, false, 0, true);
				this._nativeFocus.addEventListener(this.flash.events.Event.COPY, this.nativeStage_copyHandler, false, 0, true);
				this._nativeFocus.addEventListener(this.flash.events.Event.PASTE, this.nativeStage_pasteHandler, false, 0, true);
				this._nativeFocus.addEventListener(this.flash.events.Event.SELECT_ALL, this.nativeStage_selectAllHandler, false, 0, true);
			}
		}

		/**
		 * @private
		 */
		protected _isWaitingToSetFocus:boolean = false;

		/**
		 * @inheritDoc
		 */
		public setFocus(position:Point = null):void
		{
			//we already have focus, so there's no reason to change
			if(this._hasFocus && !position)
			{
				return;
			}
			if(this.isCreated)
			{
				var newIndex:number = -1;
				if(position)
				{
					newIndex = this.getSelectionIndexAtPoint(position.x, position.y);
				}
				if(newIndex >= 0)
				{
					this.selectRange(newIndex, newIndex);
				}
				this.focusIn();
			}
			else
			{
				this._isWaitingToSetFocus = true;
			}
		}

		/**
		 * @inheritDoc
		 */
		public clearFocus():void
		{
			if(!this._hasFocus)
			{
				return;
			}
			this._hasFocus = false;
			this._cursorSkin.visible = false;
			this._selectionSkin.visible = false;
			this.stage.removeEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
			this.nativeFocus = null;
			this.dispatchEventWith(FeathersEventType.FOCUS_OUT);
		}

		/**
		 * @inheritDoc
		 */
		public selectRange(beginIndex:number, endIndex:number):void
		{
			if(endIndex < beginIndex)
			{
				var temp:number = endIndex;
				endIndex = beginIndex;
				beginIndex = temp;
			}
			this._selectionBeginIndex = beginIndex;
			this._selectionEndIndex = endIndex;
			if(beginIndex == endIndex)
			{
				if(beginIndex < 0)
				{
					this._cursorSkin.visible = false;
				}
				else
				{
					this._cursorSkin.visible = this._hasFocus;
				}
				this._selectionSkin.visible = false;
			}
			else
			{
				this._cursorSkin.visible = false;
				this._selectionSkin.visible = true;
			}
			var cursorIndex:number = endIndex;
			if(this.touchPointID >= 0 && this._selectionAnchorIndex >= 0 && this._selectionAnchorIndex == endIndex)
			{
				cursorIndex = beginIndex;
			}
			this.positionCursorAtIndex(cursorIndex);
			this.positionSelectionBackground();
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		/**
		 * @private
		 */
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			var oldBatchX:number = this._batchX;
			var oldCursorX:number = this._cursorSkin.x;
			this._batchX -= this._scrollX;
			this._cursorSkin.x -= this._scrollX;
			super.render(support, parentAlpha);
			this._batchX = oldBatchX;
			this._cursorSkin.x = oldCursorX;
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			if(!this._cursorSkin)
			{
				this.cursorSkin = new Quad(1, 1, 0x000000);
			}
			if(!this._selectionSkin)
			{
				this.selectionSkin = new Quad(1, 1, 0x000000);
			}
			super.initialize();
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			super.draw();

			var clipRect:Rectangle = this.clipRect;
			if(clipRect)
			{
				clipRect.setTo(0, 0, this.actualWidth, this.actualHeight);
			}
			else
			{
				this.clipRect = new Rectangle(0, 0, this.actualWidth, this.actualHeight)
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected layoutCharacters(result:Point = null):Point
		{
			result = super.layoutCharacters(result);
			if(this.explicitWidth === this.explicitWidth && //!isNaN
				result.x > this.explicitWidth)
			{
				this._characterBatch.reset();
				var oldTextAlign:string = this.currentTextFormat.align;
				this.currentTextFormat.align = TextFormatAlign.LEFT;
				result = super.layoutCharacters(result);
				this.currentTextFormat.align = oldTextAlign;
			}
			return result;
		}

		/**
		 * @private
		 */
		/*override*/ protected refreshTextFormat():void
		{
			super.refreshTextFormat();
			if(this._cursorSkin)
			{
				var font:BitmapFont = this.currentTextFormat.font;
				var customSize:number = this.currentTextFormat.size;
				var scale:number = customSize / font.size;
				if(scale !== scale) //isNaN
				{
					scale = 1;
				}
				this._cursorSkin.height = font.lineHeight * scale;
			}
		}

		/**
		 * @private
		 */
		protected refreshMaskedText():void
		{
			this._text = "";
			var textLength:number = this._unmaskedText.length;
			var maskChar:string = String.fromCharCode(this._passwordCharCode);
			for(var i:number = 0; i < textLength; i++)
			{
				this._text += maskChar;
			}
		}

		/**
		 * @private
		 */
		protected focusIn():void
		{
			var showCursor:boolean = this._selectionBeginIndex >= 0 && this._selectionBeginIndex == this._selectionEndIndex;
			this._cursorSkin.visible = showCursor;
			this._selectionSkin.visible = !showCursor;
			var nativeStage:Stage = Starling.current.nativeStage;
			//this is before the hasFocus check because the native stage may
			//have lost focus when clicking on the text editor, so we may need
			//to put it back in focus
			if(!FocusManager.isEnabledForStage(this.stage) && !nativeStage.focus)
			{
				//something needs to be focused so that we can receive cut,
				//copy, and paste events
				nativeStage.focus = nativeStage;
			}
			//it shouldn't have changed, but let's be sure we're listening to
			//the right object for cut/copy/paste events.
			this.nativeFocus = nativeStage.focus;
			if(this._hasFocus)
			{
				return;
			}
			//we're reusing this variable. since this isn't a display object
			//that the focus manager can see, it's not being used anyway.
			this._hasFocus = true;
			this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
			this.dispatchEventWith(FeathersEventType.FOCUS_IN);
		}

		/**
		 * @private
		 */
		protected getSelectionIndexAtPoint(pointX:number, pointY:number):number
		{
			if(!this._text || pointX <= 0)
			{
				return 0;
			}
			var font:BitmapFont = this.currentTextFormat.font;
			var customSize:number = this.currentTextFormat.size;
			var customLetterSpacing:number = this.currentTextFormat.letterSpacing;
			var isKerningEnabled:boolean = this.currentTextFormat.isKerningEnabled;
			var scale:number = customSize / font.size;
			if(scale !== scale) //isNaN
			{
				scale = 1;
			}
			var align:string = this.currentTextFormat.align;
			if(align != TextFormatAlign.LEFT)
			{
				var lineWidth:number = this.measureText(BitmapFontTextEditor.HELPER_POINT).x;
				var hasExplicitWidth:boolean = this.explicitWidth === this.explicitWidth; //!isNaN
				var maxLineWidth:number = hasExplicitWidth ? this.explicitWidth : this._maxWidth;
				if(maxLineWidth > lineWidth)
				{
					if(align == TextFormatAlign.RIGHT)
					{
						pointX -= maxLineWidth - lineWidth;
					}
					else //center
					{
						pointX -= (maxLineWidth - lineWidth) / 2;
					}
				}
			}
			var currentX:number = 0;
			var previousCharID:number = NaN;
			var charCount:number = this._text.length;
			for(var i:number = 0; i < charCount; i++)
			{
				var charID:number = this._text.charCodeAt(i);
				var charData:BitmapChar = font.getChar(charID);
				if(!charData)
				{
					continue;
				}
				var currentKerning:number = 0;
				if(isKerningEnabled &&
					previousCharID === previousCharID) //!isNaN
				{
					currentKerning = charData.getKerning(previousCharID) * scale;
				}
				var charWidth:number = customLetterSpacing + currentKerning + charData.xAdvance * scale;
				if(pointX >= currentX && pointX < (currentX + charWidth))
				{
					if(pointX > (currentX + charWidth / 2))
					{
						return i + 1;
					}
					return i;
				}
				currentX += charWidth;
				previousCharID = charID;
			}
			if(pointX >= currentX)
			{
				return this._text.length;
			}
			return 0;
		}

		/**
		 * @private
		 */
		protected getXPositionOfIndex(index:number):number
		{
			var font:BitmapFont = this.currentTextFormat.font;
			var customSize:number = this.currentTextFormat.size;
			var customLetterSpacing:number = this.currentTextFormat.letterSpacing;
			var isKerningEnabled:boolean = this.currentTextFormat.isKerningEnabled;
			var scale:number = customSize / font.size;
			if(scale !== scale) //isNaN
			{
				scale = 1;
			}
			var xPositionOffset:number = 0;
			var align:string = this.currentTextFormat.align;
			if(align != TextFormatAlign.LEFT)
			{
				var lineWidth:number = this.measureText(BitmapFontTextEditor.HELPER_POINT).x;
				var hasExplicitWidth:boolean = this.explicitWidth === this.explicitWidth; //!isNaN
				var maxLineWidth:number = hasExplicitWidth ? this.explicitWidth : this._maxWidth;
				if(maxLineWidth > lineWidth)
				{
					if(align == TextFormatAlign.RIGHT)
					{
						xPositionOffset = maxLineWidth - lineWidth;
					}
					else //center
					{
						xPositionOffset = (maxLineWidth - lineWidth) / 2;
					}
				}
			}
			var currentX:number = 0;
			var previousCharID:number = NaN;
			var charCount:number = this._text.length;
			if(index < charCount)
			{
				charCount = index;
			}
			for(var i:number = 0; i < charCount; i++)
			{
				var charID:number = this._text.charCodeAt(i);
				var charData:BitmapChar = font.getChar(charID);
				if(!charData)
				{
					continue;
				}
				var currentKerning:number = 0;
				if(isKerningEnabled &&
					previousCharID === previousCharID) //!isNaN
				{
					currentKerning = charData.getKerning(previousCharID) * scale;
				}
				currentX += customLetterSpacing + currentKerning + charData.xAdvance * scale;
				previousCharID = charID;
			}
			return currentX + xPositionOffset;
		}

		/**
		 * @private
		 */
		protected positionCursorAtIndex(index:number):void
		{
			if(index < 0)
			{
				index = 0;
			}
			var cursorX:number = this.getXPositionOfIndex(index);
			cursorX = int(cursorX - (this._cursorSkin.width / 2));
			this._cursorSkin.x = cursorX;
			this._cursorSkin.y = 0;

			//then we update the scroll to always show the cursor
			var minScrollX:number = cursorX + this._cursorSkin.width - this.actualWidth;
			var maxScrollX:number = this.getXPositionOfIndex(this._text.length) - this.actualWidth;
			if(maxScrollX < 0)
			{
				maxScrollX = 0;
			}
			if(this._scrollX < minScrollX)
			{
				this._scrollX = minScrollX;
			}
			else if(this._scrollX > cursorX)
			{
				this._scrollX = cursorX;
			}
			if(this._scrollX > maxScrollX)
			{
				this._scrollX = maxScrollX;
			}
		}

		/**
		 * @private
		 */
		protected positionSelectionBackground():void
		{
			var font:BitmapFont = this.currentTextFormat.font;
			var customSize:number = this.currentTextFormat.size;
			var scale:number = customSize / font.size;
			if(scale !== scale) //isNaN
			{
				scale = 1;
			}

			var startX:number = this.getXPositionOfIndex(this._selectionBeginIndex) - this._scrollX;
			if(startX < 0)
			{
				startX = 0;
			}
			var endX:number = this.getXPositionOfIndex(this._selectionEndIndex) - this._scrollX;
			if(endX < 0)
			{
				endX = 0;
			}
			this._selectionSkin.x = startX;
			this._selectionSkin.width = endX - startX;
			this._selectionSkin.y = 0;
			this._selectionSkin.height = font.lineHeight * scale;
		}

		/**
		 * @private
		 */
		protected getSelectedText():string
		{
			if(this._selectionBeginIndex == this._selectionEndIndex)
			{
				return null;
			}
			return this._text.substr(this._selectionBeginIndex, this._selectionEndIndex - this._selectionBeginIndex);
		}

		/**
		 * @private
		 */
		protected deleteSelectedText():void
		{
			var currentValue:string = this._text;
			if(this._displayAsPassword)
			{
				currentValue = this._unmaskedText;
			}
			this.text = currentValue.substr(0, this._selectionBeginIndex) + currentValue.substr(this._selectionEndIndex);
			this.selectRange(this._selectionBeginIndex, this._selectionBeginIndex);
		}

		/**
		 * @private
		 */
		protected replaceSelectedText(text:string):void
		{
			var currentValue:string = this._text;
			if(this._displayAsPassword)
			{
				currentValue = this._unmaskedText;
			}
			var newText:string = currentValue.substr(0, this._selectionBeginIndex) + text + currentValue.substr(this._selectionEndIndex);
			if(this._maxChars > 0 && newText.length > this._maxChars)
			{
				return;
			}
			this.text = newText;
			var selectionIndex:number = this._selectionBeginIndex + text.length;
			this.selectRange(selectionIndex, selectionIndex);
		}

		/**
		 * @private
		 */
		protected textEditor_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled || !this._isEditable)
			{
				this.touchPointID = -1;
				return;
			}
			if(this.touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this, null, this.touchPointID);
				touch.getLocation(this, BitmapFontTextEditor.HELPER_POINT);
				BitmapFontTextEditor.HELPER_POINT.x += this._scrollX;
				this.selectRange(this._selectionAnchorIndex, this.getSelectionIndexAtPoint(BitmapFontTextEditor.HELPER_POINT.x, BitmapFontTextEditor.HELPER_POINT.y));
				if(touch.phase == TouchPhase.ENDED)
				{
					this.touchPointID = -1;
					if(this._selectionBeginIndex == this._selectionEndIndex)
					{
						this._selectionAnchorIndex = -1;
					}
					if(!FocusManager.isEnabledForStage(this.stage) && this._hasFocus)
					{
						this.stage.addEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
					}
				}
			}
			else //if we get here, we don't have a saved touch ID yet
			{
				touch = event.getTouch(this, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				this.touchPointID = touch.id;
				touch.getLocation(this, BitmapFontTextEditor.HELPER_POINT);
				BitmapFontTextEditor.HELPER_POINT.x += this._scrollX;
				if(event.shiftKey)
				{
					if(this._selectionAnchorIndex < 0)
					{
						this._selectionAnchorIndex = this._selectionBeginIndex;
					}
					this.selectRange(this._selectionAnchorIndex, this.getSelectionIndexAtPoint(BitmapFontTextEditor.HELPER_POINT.x, BitmapFontTextEditor.HELPER_POINT.y));
				}
				else
				{
					this.setFocus(BitmapFontTextEditor.HELPER_POINT);
					this._selectionAnchorIndex = this._selectionBeginIndex;
				}
			}
		}

		/**
		 * @private
		 */
		protected stage_touchHandler(event:TouchEvent):void
		{
			var touch:Touch = event.getTouch(this.stage, TouchPhase.BEGAN);
			if(!touch) //we only care about began touches
			{
				return;
			}
			touch.getLocation(this.stage, BitmapFontTextEditor.HELPER_POINT);
			var isInBounds:boolean = this.contains(this.stage.hitTest(BitmapFontTextEditor.HELPER_POINT, true));
			if(isInBounds) //if the touch is in the text editor, it's all good
			{
				return;
			}
			//if the touch begins anywhere else, it's a focus out!
			this.clearFocus();
		}

		/**
		 * @private
		 */
		protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(!this._isEnabled || !this._isEditable || this.touchPointID >= 0)
			{
				return;
			}
			//ignore select all, cut, copy, and paste
			var charCode:number = event.charCode;
			if(event.ctrlKey && (charCode == 97 || charCode == 99 || charCode == 118 || charCode == 120)) //a, c, p, and x
			{
				return;
			}
			var newIndex:number = -1;
			if(!FocusManager.isEnabledForStage(this.stage) && event.keyCode == Keyboard.TAB)
			{
				this.clearFocus();
				return;
			}
			else if(event.keyCode == Keyboard.HOME || event.keyCode == Keyboard.UP)
			{
				newIndex = 0;
			}
			else if(event.keyCode == Keyboard.END || event.keyCode == Keyboard.DOWN)
			{
				newIndex = this._text.length;
			}
			else if(event.keyCode == Keyboard.LEFT)
			{
				if(event.shiftKey)
				{
					if(this._selectionAnchorIndex < 0)
					{
						this._selectionAnchorIndex = this._selectionBeginIndex;
					}
					if(this._selectionAnchorIndex >= 0 && this._selectionAnchorIndex == this._selectionBeginIndex &&
						this._selectionBeginIndex != this._selectionEndIndex)
					{
						newIndex = this._selectionEndIndex - 1;
						this.selectRange(this._selectionBeginIndex, newIndex);
					}
					else
					{
						newIndex = this._selectionBeginIndex - 1;
						if(newIndex < 0)
						{
							newIndex = 0;
						}
						this.selectRange(newIndex, this._selectionEndIndex);
					}
					return;
				}
				else if(this._selectionBeginIndex != this._selectionEndIndex)
				{
					newIndex = this._selectionBeginIndex;
				}
				else
				{
					if(event.altKey || event.ctrlKey)
					{
						newIndex = TextInputNavigation.findPreviousWordStartIndex(this._text, this._selectionBeginIndex);
					}
					else
					{
						newIndex = this._selectionBeginIndex - 1;
					}
					if(newIndex < 0)
					{
						newIndex = 0;
					}
				}
			}
			else if(event.keyCode == Keyboard.RIGHT)
			{
				if(event.shiftKey)
				{
					if(this._selectionAnchorIndex < 0)
					{
						this._selectionAnchorIndex = this._selectionBeginIndex;
					}
					if(this._selectionAnchorIndex >= 0 && this._selectionAnchorIndex == this._selectionEndIndex &&
						this._selectionBeginIndex != this._selectionEndIndex)
					{
						newIndex = this._selectionBeginIndex + 1;
						this.selectRange(newIndex, this._selectionEndIndex);
					}
					else
					{
						newIndex = this._selectionEndIndex + 1;
						if(newIndex < 0 || newIndex > this._text.length)
						{
							newIndex = this._text.length;
						}
						this.selectRange(this._selectionBeginIndex, newIndex);
					}
					return;
				}
				else if(this._selectionBeginIndex != this._selectionEndIndex)
				{
					newIndex = this._selectionEndIndex;
				}
				else
				{
					if(event.altKey || event.ctrlKey)
					{
						newIndex = TextInputNavigation.findNextWordStartIndex(this._text, this._selectionEndIndex);
					}
					else
					{
						newIndex = this._selectionEndIndex + 1;
					}
					if(newIndex < 0 || newIndex > this._text.length)
					{
						newIndex = this._text.length;
					}
				}
			}
			if(newIndex < 0)
			{
				var currentValue:string = this._text;
				if(this._displayAsPassword)
				{
					currentValue = this._unmaskedText;
				}
				if(event.keyCode == Keyboard.ENTER)
				{
					this.dispatchEventWith(FeathersEventType.ENTER);
					return;
				}
				else if(event.keyCode == Keyboard.DELETE)
				{
					if(event.altKey || event.ctrlKey)
					{
						var nextWordStartIndex:number = TextInputNavigation.findNextWordStartIndex(this._text, this._selectionEndIndex);
						this.text = currentValue.substr(0, this._selectionBeginIndex) + currentValue.substr(nextWordStartIndex);
					}
					else if(this._selectionBeginIndex != this._selectionEndIndex)
					{
						this.deleteSelectedText();
					}
					else if(this._selectionEndIndex < currentValue.length)
					{
						this.text = currentValue.substr(0, this._selectionBeginIndex) + currentValue.substr(this._selectionEndIndex + 1);
					}
				}
				else if(event.keyCode == Keyboard.BACKSPACE)
				{
					if(event.altKey || event.ctrlKey)
					{
						newIndex = TextInputNavigation.findPreviousWordStartIndex(this._text, this._selectionBeginIndex);
						this.text = currentValue.substr(0, newIndex) + currentValue.substr(this._selectionEndIndex);
					}
					else if(this._selectionBeginIndex != this._selectionEndIndex)
					{
						this.deleteSelectedText();
					}
					else if(this._selectionBeginIndex > 0)
					{
						newIndex = this._selectionBeginIndex - 1;
						this.text = currentValue.substr(0, this._selectionBeginIndex - 1) + currentValue.substr(this._selectionEndIndex);
					}
				}
				else if(charCode >= 32 && !event.ctrlKey && !event.altKey) //ignore control characters
				{
					if(!this._restrict || this._restrict.isCharacterAllowed(charCode))
					{
						this.replaceSelectedText(String.fromCharCode(charCode));
					}
					else
					{
						return;
					}
				}
			}
			if(newIndex >= 0)
			{
				this.selectRange(newIndex, newIndex);
			}
		}

		/**
		 * @private
		 */
		protected nativeStage_selectAllHandler(event:Event.events.Event):void
		{
			if(!this._isEditable || !this._isEnabled)
			{
				return;
			}
			this.selectRange(0, this._text.length);
		}

		/**
		 * @private
		 */
		protected nativeStage_cutHandler(event:Event.events.Event):void
		{
			if(!this._isEditable || !this._isEnabled || this._selectionBeginIndex == this._selectionEndIndex || this._displayAsPassword)
			{
				return;
			}
			Clipboard.generalClipboard.setData(ClipboardFormats.TEXT_FORMAT, this.getSelectedText());
			this.deleteSelectedText();
		}

		/**
		 * @private
		 */
		protected nativeStage_copyHandler(event:Event.events.Event):void
		{
			if(!this._isEditable || !this._isEnabled || this._selectionBeginIndex == this._selectionEndIndex || this._displayAsPassword)
			{
				return;
			}
			Clipboard.generalClipboard.setData(ClipboardFormats.TEXT_FORMAT, this.getSelectedText());
		}

		/**
		 * @private
		 */
		protected nativeStage_pasteHandler(event:Event.events.Event):void
		{
			if(!this._isEditable || !this._isEnabled)
			{
				return;
			}
			var pastedText:string = <String>Clipboard.generalClipboard.getData(ClipboardFormats.TEXT_FORMAT) ;
			if(this._restrict)
			{
				pastedText = this._restrict.filterText(pastedText);
			}
			this.replaceSelectedText(pastedText);
		}
	}
}
