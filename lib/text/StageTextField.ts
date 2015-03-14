/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.text
{
	import BitmapData = flash.display.BitmapData;
	import Stage = flash.display.Stage;
	import Event = flash.events.Event;
	import EventDispatcher = flash.events.EventDispatcher;
	import FocusEvent = flash.events.FocusEvent;
	import KeyboardEvent = flash.events.KeyboardEvent;
	import Rectangle = flash.geom.Rectangle;
	import TextField = flash.text.TextField;
	import TextFieldType = flash.text.TextFieldType;
	import TextFormat = flash.text.TextFormat;
	import TextFormatAlign = flash.text.TextFormatAlign;
	import FontPosture = flash.text.engine.FontPosture;
	import FontWeight = flash.text.engine.FontWeight;

	/**
	 * A StageText replacement for Flash Player with matching properties, since
	 * StageText is only available in AIR.
	 */
	export class StageTextField extends EventDispatcher
	{
		/**
		 * Constructor.
		 */
		constructor(initOptions:Object = null)
		{
			this.initialize(initOptions);
		}

		private _textField:TextField;
		private _textFormat:TextFormat;
		private _isComplete:boolean = false;

		private _autoCapitalize:string = "none";

		public get autoCapitalize():string
		{
			return this._autoCapitalize;
		}

		public set autoCapitalize(value:string)
		{
			this._autoCapitalize = value;
		}

		private _autoCorrect:boolean = false;

		public get autoCorrect():boolean
		{
			return this._autoCorrect;
		}

		public set autoCorrect(value:boolean)
		{
			this._autoCorrect = value;
		}

		private _color:number = 0x000000;

		public get color():number
		{
			return <uint>this._textFormat.color ;
		}

		public set color(value:number)
		{
			if(this._textFormat.color == value)
			{
				return;
			}
			this._textFormat.color = value;
			this._textField.defaultTextFormat = this._textFormat;
			this._textField.setTextFormat(this._textFormat);
		}

		public get displayAsPassword():boolean
		{
			return this._textField.displayAsPassword;
		}

		public set displayAsPassword(value:boolean)
		{
			this._textField.displayAsPassword = value;
		}

		public get editable():boolean
		{
			return this._textField.type == TextFieldType.INPUT;
		}

		public set editable(value:boolean)
		{
			this._textField.type = value ? TextFieldType.INPUT : TextFieldType.DYNAMIC;
		}

		private _fontFamily:string = null;

		public get fontFamily():string
		{
			return this._textFormat.font;
		}

		public set fontFamily(value:string)
		{
			if(this._textFormat.font == value)
			{
				return;
			}
			this._textFormat.font = value;
			this._textField.defaultTextFormat = this._textFormat;
			this._textField.setTextFormat(this._textFormat);
		}

		public get fontPosture():string
		{
			return this._textFormat.italic ? FontPosture.ITALIC : FontPosture.NORMAL;
		}

		public set fontPosture(value:string)
		{
			if(this.fontPosture == value)
			{
				return;
			}
			this._textFormat.italic = value == FontPosture.ITALIC;
			this._textField.defaultTextFormat = this._textFormat;
			this._textField.setTextFormat(this._textFormat);
		}

		public get fontSize():number
		{
			return <int>this._textFormat.size ;
		}

		public set fontSize(value:number)
		{
			if(this._textFormat.size == value)
			{
				return;
			}
			this._textFormat.size = value;
			this._textField.defaultTextFormat = this._textFormat;
			this._textField.setTextFormat(this._textFormat);
		}

		public get fontWeight():string
		{
			return this._textFormat.bold ? FontWeight.BOLD : FontWeight.NORMAL;
		}

		public set fontWeight(value:string)
		{
			if(this.fontWeight == value)
			{
				return;
			}
			this._textFormat.bold = value == FontWeight.BOLD;
			this._textField.defaultTextFormat = this._textFormat;
			this._textField.setTextFormat(this._textFormat);
		}

		private _locale:string = "en";

		public get locale():string
		{
			return this._locale;
		}

		public set locale(value:string)
		{
			this._locale = value;
		}

		public get maxChars():number
		{
			return this._textField.maxChars;
		}

		public set maxChars(value:number)
		{
			this._textField.maxChars = value;
		}

		public get multiline():boolean
		{
			return this._textField.multiline;
		}

		public get restrict():string
		{
			return this._textField.restrict;
		}

		public set restrict(value:string)
		{
			this._textField.restrict = value;
		}

		private _returnKeyLabel:string = "default";

		public get returnKeyLabel():string
		{
			return this._returnKeyLabel;
		}

		public set returnKeyLabel(value:string)
		{
			this._returnKeyLabel = value;
		}

		public get selectionActiveIndex():number
		{
			return this._textField.selectionBeginIndex;
		}

		public get selectionAnchorIndex():number
		{
			return this._textField.selectionEndIndex;
		}

		private _softKeyboardType:string = "default";

		public get softKeyboardType():string
		{
			return this._softKeyboardType;
		}

		public set softKeyboardType(value:string)
		{
			this._softKeyboardType = value;
		}

		public get stage():Stage
		{
			return this._textField.stage;
		}

		public set stage(value:Stage)
		{
			if(this._textField.stage == value)
			{
				return;
			}
			if(this._textField.stage)
			{
				this._textField.parent.removeChild(this._textField);
			}
			if(value)
			{
				value.addChild(this._textField);
				this.dispatchCompleteIfPossible();
			}
		}

		public get text():string
		{
			return this._textField.text;
		}

		public set text(value:string)
		{
			this._textField.text = value;
		}

		private _textAlign:string = TextFormatAlign.START;

		public get textAlign():string
		{
			return this._textAlign;
		}

		public set textAlign(value:string)
		{
			if(this._textAlign == value)
			{
				return;
			}
			this._textAlign = value;
			if(value == TextFormatAlign.START)
			{
				value = TextFormatAlign.LEFT;
			}
			else if(value == TextFormatAlign.END)
			{
				value = TextFormatAlign.RIGHT;
			}
			this._textFormat.align = value;
			this._textField.defaultTextFormat = this._textFormat;
			this._textField.setTextFormat(this._textFormat);
		}

		private _viewPort:Rectangle = new Rectangle();

		public get viewPort():Rectangle
		{
			return this._viewPort;
		}

		public set viewPort(value:Rectangle)
		{
			if(!value || value.width < 0 || value.height < 0)
			{
				throw new RangeError("The Rectangle value is not valid.");
			}
			this._viewPort = value;
			this._textField.x = this._viewPort.x;
			this._textField.y = this._viewPort.y;
			this._textField.width = this._viewPort.width;
			this._textField.height = this._viewPort.height;

			this.dispatchCompleteIfPossible();
		}

		public get visible():boolean
		{
			return this._textField.visible;
		}

		public set visible(value:boolean)
		{
			this._textField.visible = value;
		}

		public assignFocus():void
		{
			if(!this._textField.parent)
			{
				return;
			}
			this._textField.stage.focus = this._textField;
		}

		public dispose():void
		{
			this.stage = null;
			this._textField = null;
			this._textFormat = null;
		}

		public drawViewPortToBitmapData(bitmap:BitmapData):void
		{
			if(!bitmap)
			{
				throw new Error("The bitmap is null.");
			}
			if(bitmap.width != this._viewPort.width || bitmap.height != this._viewPort.height)
			{
				throw new ArgumentError("The bitmap's width or height is different from view port's width or height.");
			}
			bitmap.draw(this._textField);
		}

		public selectRange(anchorIndex:number, activeIndex:number):void
		{
			this._textField.setSelection(anchorIndex, activeIndex);
		}

		private dispatchCompleteIfPossible():void
		{
			if(!this._textField.stage || this._viewPort.isEmpty())
			{
				this._isComplete = false;
			}
			if(this._textField.stage && !this.viewPort.isEmpty())
			{
				this._isComplete = true;
				this.dispatchEvent(new Event(Event.COMPLETE));
			}
		}

		private initialize(initOptions:Object):void
		{
			this._textField = new TextField();
			this._textField.type = TextFieldType.INPUT;
			var isMultiline:boolean = initOptions && initOptions.hasOwnProperty("multiline") && initOptions.multiline;
			this._textField.multiline = isMultiline;
			this._textField.wordWrap = isMultiline;
			this._textField.addEventListener(Event.CHANGE, this.textField_eventHandler);
			this._textField.addEventListener(FocusEvent.FOCUS_IN, this.textField_eventHandler);
			this._textField.addEventListener(FocusEvent.FOCUS_OUT, this.textField_eventHandler);
			this._textField.addEventListener(KeyboardEvent.KEY_DOWN, this.textField_eventHandler);
			this._textField.addEventListener(KeyboardEvent.KEY_UP, this.textField_eventHandler);
			this._textFormat = new TextFormat(null, 11, 0x000000, false, false, false);
			this._textField.defaultTextFormat = this._textFormat;
		}

		private textField_eventHandler(event:Event):void
		{
			this.dispatchEvent(event);
		}
	}
}
