/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.supportClasses
{
	import FeathersControl = feathers.core.FeathersControl;
	import matrixToRotation = feathers.utils.geom.matrixToRotation;
	import matrixToScaleX = feathers.utils.geom.matrixToScaleX;
	import matrixToScaleY = feathers.utils.geom.matrixToScaleY;

	import Sprite = flash.display.Sprite;
	import TextEvent = flash.events.TextEvent;
	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import AntiAliasType = flash.text.AntiAliasType;
	import GridFitType = flash.text.GridFitType;
	import StyleSheet = flash.text.StyleSheet;
	import TextField = flash.text.TextField;
	import TextFieldAutoSize = flash.text.TextFieldAutoSize;
	import TextFormat = flash.text.TextFormat;

	import RenderSupport = starling.core.RenderSupport;
	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import MatrixUtil = starling.utils.MatrixUtil;

	/**
	 * @private
	 */
	export class TextFieldViewPort extends FeathersControl implements IViewPort
	{
		private static HELPER_MATRIX:Matrix = new Matrix();
		private static HELPER_POINT:Point = new Point();

		constructor()
		{
			super();
			this.addEventListener(Event.ADDED_TO_STAGE, this.addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.removedFromStageHandler);
		}

		private _textFieldContainer:Sprite;
		private _textField:TextField;

		/**
		 * @private
		 */
		private _text:string = "";

		/**
		 * @see feathers.controls.ScrollText#text
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
				value = "";
			}
			if(this._text == value)
			{
				return;
			}
			this._text = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		private _isHTML:boolean = false;

		/**
		 * @see feathers.controls.ScrollText#isHTML
		 */
		public get isHTML():boolean
		{
			return this._isHTML;
		}

		/**
		 * @private
		 */
		public set isHTML(value:boolean)
		{
			if(this._isHTML == value)
			{
				return;
			}
			this._isHTML = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		private _textFormat:TextFormat;

		/**
		 * @see feathers.controls.ScrollText#textFormat
		 */
		public get textFormat():TextFormat
		{
			return this._textFormat;
		}

		/**
		 * @private
		 */
		public set textFormat(value:TextFormat)
		{
			if(this._textFormat == value)
			{
				return;
			}
			this._textFormat = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _disabledTextFormat:TextFormat;

		/**
		 * @see feathers.controls.ScrollText#disabledTextFormat
		 */
		public get disabledTextFormat():TextFormat
		{
			return this._disabledTextFormat;
		}

		/**
		 * @private
		 */
		public set disabledTextFormat(value:TextFormat)
		{
			if(this._disabledTextFormat == value)
			{
				return;
			}
			this._disabledTextFormat = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _styleSheet:StyleSheet;

		/**
		 * @see feathers.controls.ScrollText#styleSheet
		 */
		public get styleSheet():StyleSheet
		{
			return this._styleSheet;
		}

		/**
		 * @private
		 */
		public set styleSheet(value:StyleSheet)
		{
			if(this._styleSheet == value)
			{
				return;
			}
			this._styleSheet = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _embedFonts:boolean = false;

		/**
		 * @see feathers.controls.ScrollText#embedFonts
		 */
		public get embedFonts():boolean
		{
			return this._embedFonts;
		}

		/**
		 * @private
		 */
		public set embedFonts(value:boolean)
		{
			if(this._embedFonts == value)
			{
				return;
			}
			this._embedFonts = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _antiAliasType:string = AntiAliasType.ADVANCED;

		/**
		 * @see feathers.controls.ScrollText#antiAliasType
		 */
		public get antiAliasType():string
		{
			return this._antiAliasType;
		}

		/**
		 * @private
		 */
		public set antiAliasType(value:string)
		{
			if(this._antiAliasType == value)
			{
				return;
			}
			this._antiAliasType = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _background:boolean = false;

		/**
		 * @see feathers.controls.ScrollText#background
		 */
		public get background():boolean
		{
			return this._background;
		}

		/**
		 * @private
		 */
		public set background(value:boolean)
		{
			if(this._background == value)
			{
				return;
			}
			this._background = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _backgroundColor:number = 0xffffff;

		/**
		 * @see feathers.controls.ScrollText#backgroundColor
		 */
		public get backgroundColor():number
		{
			return this._backgroundColor;
		}

		/**
		 * @private
		 */
		public set backgroundColor(value:number)
		{
			if(this._backgroundColor == value)
			{
				return;
			}
			this._backgroundColor = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _border:boolean = false;

		/**
		 * @see feathers.controls.ScrollText#border
		 */
		public get border():boolean
		{
			return this._border;
		}

		/**
		 * @private
		 */
		public set border(value:boolean)
		{
			if(this._border == value)
			{
				return;
			}
			this._border = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _borderColor:number = 0x000000;

		/**
		 * @see feathers.controls.ScrollText#borderColor
		 */
		public get borderColor():number
		{
			return this._borderColor;
		}

		/**
		 * @private
		 */
		public set borderColor(value:number)
		{
			if(this._borderColor == value)
			{
				return;
			}
			this._borderColor = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _condenseWhite:boolean = false;

		/**
		 * @see feathers.controls.ScrollText#condenseWhite
		 */
		public get condenseWhite():boolean
		{
			return this._condenseWhite;
		}

		/**
		 * @private
		 */
		public set condenseWhite(value:boolean)
		{
			if(this._condenseWhite == value)
			{
				return;
			}
			this._condenseWhite = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _displayAsPassword:boolean = false;

		/**
		 * @see feathers.controls.ScrollText#displayAsPassword
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
		private _gridFitType:string = GridFitType.PIXEL;

		/**
		 * @see feathers.controls.ScrollText#gridFitType
		 */
		public get gridFitType():string
		{
			return this._gridFitType;
		}

		/**
		 * @private
		 */
		public set gridFitType(value:string)
		{
			if(this._gridFitType == value)
			{
				return;
			}
			this._gridFitType = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _sharpness:number = 0;

		/**
		 * @see feathers.controls.ScrollText#sharpness
		 */
		public get sharpness():number
		{
			return this._sharpness;
		}

		/**
		 * @private
		 */
		public set sharpness(value:number)
		{
			if(this._sharpness == value)
			{
				return;
			}
			this._sharpness = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		private _thickness:number = 0;

		/**
		 * @see feathers.controls.ScrollText#thickness
		 */
		public get thickness():number
		{
			return this._thickness;
		}

		/**
		 * @private
		 */
		public set thickness(value:number)
		{
			if(this._thickness == value)
			{
				return;
			}
			this._thickness = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		private _minVisibleWidth:number = 0;

		public get minVisibleWidth():number
		{
			return this._minVisibleWidth;
		}

		public set minVisibleWidth(value:number)
		{
			if(this._minVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleWidth cannot be NaN");
			}
			this._minVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _maxVisibleWidth:number = Number.POSITIVE_INFINITY;

		public get maxVisibleWidth():number
		{
			return this._maxVisibleWidth;
		}

		public set maxVisibleWidth(value:number)
		{
			if(this._maxVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleWidth cannot be NaN");
			}
			this._maxVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _actualVisibleWidth:number = 0;

		private _explicitVisibleWidth:number = NaN;

		public get visibleWidth():number
		{
			if(this._explicitVisibleWidth !== this._explicitVisibleWidth) //isNaN
			{
				return this._actualVisibleWidth;
			}
			return this._explicitVisibleWidth;
		}

		public set visibleWidth(value:number)
		{
			if(this._explicitVisibleWidth == value ||
				(value !== value && this._explicitVisibleWidth !== this._explicitVisibleWidth)) //isNaN
			{
				return;
			}
			this._explicitVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _minVisibleHeight:number = 0;

		public get minVisibleHeight():number
		{
			return this._minVisibleHeight;
		}

		public set minVisibleHeight(value:number)
		{
			if(this._minVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleHeight cannot be NaN");
			}
			this._minVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _maxVisibleHeight:number = Number.POSITIVE_INFINITY;

		public get maxVisibleHeight():number
		{
			return this._maxVisibleHeight;
		}

		public set maxVisibleHeight(value:number)
		{
			if(this._maxVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleHeight cannot be NaN");
			}
			this._maxVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _actualVisibleHeight:number = 0;

		private _explicitVisibleHeight:number = NaN;

		public get visibleHeight():number
		{
			if(this._explicitVisibleHeight !== this._explicitVisibleHeight) //isNaN
			{
				return this._actualVisibleHeight;
			}
			return this._explicitVisibleHeight;
		}

		public set visibleHeight(value:number)
		{
			if(this._explicitVisibleHeight == value ||
				(value !== value && this._explicitVisibleHeight !== this._explicitVisibleHeight)) //isNaN
			{
				return;
			}
			this._explicitVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		public get contentX():number
		{
			return 0;
		}

		public get contentY():number
		{
			return 0;
		}

		private _scrollStep:number;

		public get horizontalScrollStep():number
		{
			return this._scrollStep;
		}

		public get verticalScrollStep():number
		{
			return this._scrollStep;
		}

		private _horizontalScrollPosition:number = 0;

		public get horizontalScrollPosition():number
		{
			return this._horizontalScrollPosition;
		}

		public set horizontalScrollPosition(value:number)
		{
			if(this._horizontalScrollPosition == value)
			{
				return;
			}
			this._horizontalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		private _verticalScrollPosition:number = 0;

		public get verticalScrollPosition():number
		{
			return this._verticalScrollPosition;
		}

		public set verticalScrollPosition(value:number)
		{
			if(this._verticalScrollPosition == value)
			{
				return;
			}
			this._verticalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		private _paddingTop:number = 0;

		public get paddingTop():number
		{
			return this._paddingTop;
		}

		public set paddingTop(value:number)
		{
			if(this._paddingTop == value)
			{
				return;
			}
			this._paddingTop = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		private _paddingRight:number = 0;

		public get paddingRight():number
		{
			return this._paddingRight;
		}

		public set paddingRight(value:number)
		{
			if(this._paddingRight == value)
			{
				return;
			}
			this._paddingRight = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		private _paddingBottom:number = 0;

		public get paddingBottom():number
		{
			return this._paddingBottom;
		}

		public set paddingBottom(value:number)
		{
			if(this._paddingBottom == value)
			{
				return;
			}
			this._paddingBottom = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		private _paddingLeft:number = 0;

		public get paddingLeft():number
		{
			return this._paddingLeft;
		}

		public set paddingLeft(value:number)
		{
			if(this._paddingLeft == value)
			{
				return;
			}
			this._paddingLeft = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			var starlingViewPort:Rectangle = Starling.current.viewPort;
			TextFieldViewPort.HELPER_POINT.x = TextFieldViewPort.HELPER_POINT.y = 0;
			this.parent.getTransformationMatrix(this.stage, TextFieldViewPort.HELPER_MATRIX);
			MatrixUtil.transformCoords(TextFieldViewPort.HELPER_MATRIX, 0, 0, TextFieldViewPort.HELPER_POINT);
			var nativeScaleFactor:number = 1;
			if(Starling.current.supportHighResolutions)
			{
				nativeScaleFactor = Starling.current.nativeStage.contentsScaleFactor;
			}
			var scaleFactor:number = Starling.contentScaleFactor / nativeScaleFactor;
			this._textFieldContainer.x = starlingViewPort.x + TextFieldViewPort.HELPER_POINT.x * scaleFactor;
			this._textFieldContainer.y = starlingViewPort.y + TextFieldViewPort.HELPER_POINT.y * scaleFactor;
			this._textFieldContainer.scaleX = matrixToScaleX(TextFieldViewPort.HELPER_MATRIX) * scaleFactor;
			this._textFieldContainer.scaleY = matrixToScaleY(TextFieldViewPort.HELPER_MATRIX) * scaleFactor;
			this._textFieldContainer.rotation = matrixToRotation(TextFieldViewPort.HELPER_MATRIX) * 180 / Math.PI;
			this._textFieldContainer.alpha = parentAlpha * this.alpha;
			super.render(support, parentAlpha);
		}

		/*override*/ protected initialize():void
		{
			this._textFieldContainer = new Sprite();
			this._textFieldContainer.visible = false;
			this._textField = new TextField();
			this._textField.autoSize = TextFieldAutoSize.LEFT;
			this._textField.selectable = false;
			this._textField.mouseWheelEnabled = false;
			this._textField.wordWrap = true;
			this._textField.multiline = true;
			this._textField.addEventListener(TextEvent.LINK, this.textField_linkHandler);
			this._textFieldContainer.addChild(this._textField);
		}

		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);

			if(stylesInvalid)
			{
				this._textField.antiAliasType = this._antiAliasType;
				this._textField.background = this._background;
				this._textField.backgroundColor = this._backgroundColor;
				this._textField.border = this._border;
				this._textField.borderColor = this._borderColor;
				this._textField.condenseWhite = this._condenseWhite;
				this._textField.displayAsPassword = this._displayAsPassword;
				this._textField.embedFonts = this._embedFonts;
				this._textField.gridFitType = this._gridFitType;
				this._textField.sharpness = this._sharpness;
				this._textField.thickness = this._thickness;
				this._textField.x = this._paddingLeft;
				this._textField.y = this._paddingTop;
			}

			if(dataInvalid || stylesInvalid || stateInvalid)
			{
				if(this._styleSheet)
				{
					this._textField.styleSheet = this._styleSheet;
				}
				else
				{
					this._textField.styleSheet = null;
					if(!this._isEnabled && this._disabledTextFormat)
					{
						this._textField.defaultTextFormat = this._disabledTextFormat;
					}
					else if(this._textFormat)
					{
						this._textField.defaultTextFormat = this._textFormat;
					}
				}
				if(this._isHTML)
				{
					this._textField.htmlText = this._text;
				}
				else
				{
					this._textField.text = this._text;
				}
				this._scrollStep = this._textField.getLineMetrics(0).height * Starling.contentScaleFactor;
			}

			var calculatedVisibleWidth:number = this._explicitVisibleWidth;
			if(calculatedVisibleWidth != calculatedVisibleWidth)
			{
				if(this.stage)
				{
					calculatedVisibleWidth = this.stage.stageWidth;
				}
				else
				{
					calculatedVisibleWidth = Starling.current.stage.stageWidth;
				}
				if(calculatedVisibleWidth < this._minVisibleWidth)
				{
					calculatedVisibleWidth = this._minVisibleWidth;
				}
				else if(calculatedVisibleWidth > this._maxVisibleWidth)
				{
					calculatedVisibleWidth = this._maxVisibleWidth;
				}
			}
			this._textField.width = calculatedVisibleWidth - this._paddingLeft - this._paddingRight;
			var totalContentHeight:number = this._textField.height + this._paddingTop + this._paddingBottom;
			var calculatedVisibleHeight:number = this._explicitVisibleHeight;
			if(calculatedVisibleHeight != calculatedVisibleHeight)
			{
				calculatedVisibleHeight = totalContentHeight;
				if(calculatedVisibleHeight < this._minVisibleHeight)
				{
					calculatedVisibleHeight = this._minVisibleHeight;
				}
				else if(calculatedVisibleHeight > this._maxVisibleHeight)
				{
					calculatedVisibleHeight = this._maxVisibleHeight;
				}
			}
			sizeInvalid = this.setSizeInternal(calculatedVisibleWidth, totalContentHeight, false) || sizeInvalid;
			this._actualVisibleWidth = calculatedVisibleWidth;
			this._actualVisibleHeight = calculatedVisibleHeight;

			if(sizeInvalid || scrollInvalid)
			{
				var scrollRect:Rectangle = this._textFieldContainer.scrollRect;
				if(!scrollRect)
				{
					scrollRect = new Rectangle();
				}
				scrollRect.width = calculatedVisibleWidth;
				scrollRect.height = calculatedVisibleHeight;
				scrollRect.x = this._horizontalScrollPosition;
				scrollRect.y = this._verticalScrollPosition;
				this._textFieldContainer.scrollRect = scrollRect;
			}
		}

		private addedToStageHandler(event:Event):void
		{
			Starling.current.nativeStage.addChild(this._textFieldContainer);
			this.addEventListener(Event.ENTER_FRAME, this.enterFrameHandler);
		}

		private removedFromStageHandler(event:Event):void
		{
			Starling.current.nativeStage.removeChild(this._textFieldContainer);
			this.removeEventListener(Event.ENTER_FRAME, this.enterFrameHandler);
		}

		private enterFrameHandler(event:Event):void
		{
			var target:DisplayObject = this;
			do
			{
				if(!target.hasVisibleArea)
				{
					this._textFieldContainer.visible = false;
					return;
				}
				target = target.parent;
			}
			while(target)
			this._textFieldContainer.visible = true;
		}

		protected textField_linkHandler(event:TextEvent):void
		{
			this.dispatchEventWith(Event.TRIGGERED, false, event.text);
		}
	}
}
