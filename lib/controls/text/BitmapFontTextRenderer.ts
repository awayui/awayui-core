/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.text
{
	import FeathersControl = feathers.core.FeathersControl;
	import ITextRenderer = feathers.core.ITextRenderer;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import BitmapFontTextFormat = feathers.text.BitmapFontTextFormat;

	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import TextFormatAlign = flash.text.TextFormatAlign;

	import RenderSupport = starling.core.RenderSupport;
	import Image = starling.display.Image;
	import QuadBatch = starling.display.QuadBatch;
	import BitmapChar = starling.text.BitmapChar;
	import BitmapFont = starling.text.BitmapFont;
	import TextField = starling.text.TextField;
	import Texture = starling.textures.Texture;
	import TextureSmoothing = starling.textures.TextureSmoothing;

	/**
	 * Renders text using <code>starling.text.BitmapFont</code>.
	 *
	 * @see ../../../help/text-renderers.html Introduction to Feathers text renderers
	 * @see http://doc.starling-framework.org/core/starling/text/BitmapFont.html starling.text.BitmapFont
	 */
	export class BitmapFontTextRenderer extends FeathersControl implements ITextRenderer
	{
		/**
		 * @private
		 */
		private static HELPER_IMAGE:Image;

		/**
		 * @private
		 */
		private static HELPER_MATRIX:Matrix = new Matrix();

		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 */
		private static CHARACTER_ID_SPACE:number = 32;

		/**
		 * @private
		 */
		private static CHARACTER_ID_TAB:number = 9;

		/**
		 * @private
		 */
		private static CHARACTER_ID_LINE_FEED:number = 10;

		/**
		 * @private
		 */
		private static CHARACTER_ID_CARRIAGE_RETURN:number = 13;

		/**
		 * @private
		 */
		private static CHARACTER_BUFFER:CharLocation[];

		/**
		 * @private
		 */
		private static CHAR_LOCATION_POOL:CharLocation[];

		/**
		 * @private
		 */
		private static FUZZY_MAX_WIDTH_PADDING:number = 0.000001;

		/**
		 * The default <code>IStyleProvider</code> for all <code>BitmapFontTextRenderer</code>
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
			if(!BitmapFontTextRenderer.CHAR_LOCATION_POOL)
			{
				//compiler doesn't like referencing CharLocation class in a
				//static constant
				BitmapFontTextRenderer.CHAR_LOCATION_POOL = new Array<CharLocation>();
			}
			if(!BitmapFontTextRenderer.CHARACTER_BUFFER)
			{
				BitmapFontTextRenderer.CHARACTER_BUFFER = new Array<CharLocation>();
			}
			this.isQuickHitAreaEnabled = true;
		}

		/**
		 * @private
		 */
		protected _characterBatch:QuadBatch;

		/**
		 * @private
		 */
		protected _batchX:number = 0;

		/**
		 * @private
		 */
		protected currentTextFormat:BitmapFontTextFormat;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return BitmapFontTextRenderer.globalStyleProvider;
		}
		
		/**
		 * @private
		 */
		protected _textFormat:BitmapFontTextFormat;
		
		/**
		 * The font and styles used to draw the text.
		 *
		 * <p>In the following example, the text format is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.textFormat = new BitmapFontTextFormat( bitmapFont );</listing>
		 *
		 * @default null
		 */
		public get textFormat():BitmapFontTextFormat
		{
			return this._textFormat;
		}
		
		/**
		 * @private
		 */
		public set textFormat(value:BitmapFontTextFormat)
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
		protected _disabledTextFormat:BitmapFontTextFormat;

		/**
		 * The font and styles used to draw the text when the label is disabled.
		 *
		 * <p>In the following example, the disabled text format is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.disabledTextFormat = new BitmapFontTextFormat( bitmapFont );</listing>
		 *
		 * @default null
		 */
		public get disabledTextFormat():BitmapFontTextFormat
		{
			return this._disabledTextFormat;
		}

		/**
		 * @private
		 */
		public set disabledTextFormat(value:BitmapFontTextFormat)
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
		protected _text:string = null;
		
		/**
		 * The text to display.
		 *
		 * <p>In the following example, the text is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.text = "Lorem ipsum";</listing>
		 *
		 * @default null
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
		protected _smoothing:string = TextureSmoothing.BILINEAR;

		/*[Inspectable(type="String",enumeration="bilinear,trilinear,none")]*/
		/**
		 * A smoothing value passed to each character image.
		 *
		 * <p>In the following example, the texture smoothing is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.smoothing = TextureSmoothing.NONE;</listing>
		 *
		 * @default starling.textures.TextureSmoothing.BILINEAR
		 *
		 * @see http://doc.starling-framework.org/core/starling/textures/TextureSmoothing.html starling.textures.TextureSmoothing
		 */
		public get smoothing():string
		{
			return this._smoothing;
		}
		
		/**
		 * @private
		 */
		public set smoothing(value:string)
		{
			if(this._smoothing == value)
			{
				return;
			}
			this._smoothing = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _wordWrap:boolean = false;

		/**
		 * If the width or maxWidth values are set, then the text will continue
		 * on the next line, if it is too long.
		 *
		 * <p>In the following example, word wrap is enabled:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.wordWrap = true;</listing>
		 *
		 * @default false
		 */
		public get wordWrap():boolean
		{
			return this._wordWrap;
		}

		/**
		 * @private
		 */
		public set wordWrap(value:boolean)
		{
			if(this._wordWrap == value)
			{
				return;
			}
			this._wordWrap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _snapToPixels:boolean = true;

		/**
		 * Determines if the position of the text should be snapped to the
		 * nearest whole pixel when rendered. When snapped to a whole pixel, the
		 * text is often more readable. When not snapped, the text may become
		 * blurry due to texture smoothing.
		 *
		 * <p>In the following example, the text is not snapped to pixels:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.snapToPixels = false;</listing>
		 *
		 * @default true
		 */
		public get snapToPixels():boolean
		{
			return this._snapToPixels;
		}

		/**
		 * @private
		 */
		public set snapToPixels(value:boolean)
		{
			if(this._snapToPixels == value)
			{
				return;
			}
			this._snapToPixels = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _truncateToFit:boolean = true;

		/**
		 * If word wrap is disabled, and the text is longer than the width of
		 * the label, the text may be truncated using <code>truncationText</code>.
		 *
		 * <p>This feature may be disabled to improve performance.</p>
		 *
		 * <p>This feature does not currently support the truncation of text
		 * displayed on multiple lines.</p>
		 *
		 * <p>In the following example, truncation is disabled:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.truncateToFit = false;</listing>
		 *
		 * @default true
		 *
		 * @see #truncationText
		 */
		public get truncateToFit():boolean
		{
			return this._truncateToFit;
		}

		/**
		 * @private
		 */
		public set truncateToFit(value:boolean)
		{
			if(this._truncateToFit == value)
			{
				return;
			}
			this._truncateToFit = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _truncationText:string = "...";

		/**
		 * The text to display at the end of the label if it is truncated.
		 *
		 * <p>In the following example, the truncation text is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.truncationText = " [more]";</listing>
		 *
		 * @default "..."
		 */
		public get truncationText():string
		{
			return this._truncationText;
		}

		/**
		 * @private
		 */
		public set truncationText(value:string)
		{
			if(this._truncationText == value)
			{
				return;
			}
			this._truncationText = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _useSeparateBatch:boolean = true;

		/**
		 * Determines if the characters are batched normally by Starling or if
		 * they're batched separately. Batching separately may improve
		 * performance for text that changes often, while batching normally
		 * may be better when a lot of text is displayed on screen at once.
		 *
		 * <p>In the following example, separate batching is disabled:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.useSeparateBatch = false;</listing>
		 *
		 * @default true
		 */
		public get useSeparateBatch():boolean
		{
			return this._useSeparateBatch;
		}

		/**
		 * @private
		 */
		public set useSeparateBatch(value:boolean)
		{
			if(this._useSeparateBatch == value)
			{
				return;
			}
			this._useSeparateBatch = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @inheritDoc
		 */
		public get baseline():number
		{
			if(!this._textFormat)
			{
				return 0;
			}
			var font:BitmapFont = this._textFormat.font;
			var formatSize:number = this._textFormat.size;
			var fontSizeScale:number = formatSize / font.size;
			if(fontSizeScale !== fontSizeScale) //isNaN
			{
				fontSizeScale = 1;
			}
			var baseline:number = font.baseline;
			//for some reason, if we don't call a function right here,
			//compiling with the flex 4.6 SDK will throw a VerifyError
			//for a stack overflow.
			//we could change the !== check back to isNaN() instead, but
			//isNaN() can allocate an object, so we should call a different
			//function without allocation.
			this.doNothing();
			if(baseline !== baseline) //isNaN
			{
				return font.lineHeight * fontSizeScale;
			}
			return baseline * fontSizeScale;
		}

		/**
		 * @private
		 */
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			var offsetX:number = 0;
			var offsetY:number = 0;
			if(this._snapToPixels)
			{
				this.getTransformationMatrix(this.stage, BitmapFontTextRenderer.HELPER_MATRIX);
				offsetX = Math.round(BitmapFontTextRenderer.HELPER_MATRIX.tx) - BitmapFontTextRenderer.HELPER_MATRIX.tx;
				offsetY = Math.round(BitmapFontTextRenderer.HELPER_MATRIX.ty) - BitmapFontTextRenderer.HELPER_MATRIX.ty;
			}
			this._characterBatch.x = this._batchX + offsetX;
			this._characterBatch.y = offsetY;
			super.render(support, parentAlpha);
		}
		
		/**
		 * @inheritDoc
		 */
		public measureText(result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}

			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				result.x = this.explicitWidth;
				result.y = this.explicitHeight;
				return result;
			}

			if(this.isInvalid(this.INVALIDATION_FLAG_STYLES) || this.isInvalid(this.INVALIDATION_FLAG_STATE))
			{
				this.refreshTextFormat();
			}

			if(!this.currentTextFormat || this._text === null)
			{
				result.setTo(0, 0);
				return result;
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
			var lineHeight:number = font.lineHeight * scale;
			var maxLineWidth:number = this.explicitWidth;
			if(maxLineWidth !== maxLineWidth) //isNaN
			{
				maxLineWidth = this._maxWidth;
			}

			var maxX:number = 0;
			var currentX:number = 0;
			var currentY:number = 0;
			var previousCharID:number = NaN;
			var charCount:number = this._text.length;
			var startXOfPreviousWord:number = 0;
			var widthOfWhitespaceAfterWord:number = 0;
			var wordCountForLine:number = 0;
			var line:string = "";
			var word:string = "";
			for(var i:number = 0; i < charCount; i++)
			{
				var charID:number = this._text.charCodeAt(i);
				if(charID == BitmapFontTextRenderer.CHARACTER_ID_LINE_FEED || charID == BitmapFontTextRenderer.CHARACTER_ID_CARRIAGE_RETURN) //new line \n or \r
				{
					currentX = currentX - customLetterSpacing;
					if(currentX < 0)
					{
						currentX = 0;
					}
					if(maxX < currentX)
					{
						maxX = currentX;
					}
					previousCharID = NaN;
					currentX = 0;
					currentY += lineHeight;
					startXOfPreviousWord = 0;
					wordCountForLine = 0;
					widthOfWhitespaceAfterWord = 0;
					continue;
				}

				var charData:BitmapChar = font.getChar(charID);
				if(!charData)
				{
					trace("Missing character " + String.fromCharCode(charID) + " in font " + font.name + ".");
					continue;
				}

				if(isKerningEnabled &&
					previousCharID === previousCharID) //!isNaN
				{
					currentX += charData.getKerning(previousCharID) * scale;
				}

				var offsetX:number = charData.xAdvance * scale;
				if(this._wordWrap)
				{
					var currentCharIsWhitespace:boolean = charID == BitmapFontTextRenderer.CHARACTER_ID_SPACE || charID == BitmapFontTextRenderer.CHARACTER_ID_TAB;
					var previousCharIsWhitespace:boolean = previousCharID == BitmapFontTextRenderer.CHARACTER_ID_SPACE || previousCharID == BitmapFontTextRenderer.CHARACTER_ID_TAB;
					if(currentCharIsWhitespace)
					{
						if(!previousCharIsWhitespace)
						{
							widthOfWhitespaceAfterWord = 0;
						}
						widthOfWhitespaceAfterWord += offsetX;
					}
					else if(previousCharIsWhitespace)
					{
						startXOfPreviousWord = currentX;
						wordCountForLine++;
						line += word;
						word = "";
					}

					if(!currentCharIsWhitespace && wordCountForLine > 0 && (currentX + offsetX) > maxLineWidth)
					{
						//we're just reusing this variable to avoid creating a
						//new one. it'll be reset to 0 in a moment.
						widthOfWhitespaceAfterWord = startXOfPreviousWord - widthOfWhitespaceAfterWord;
						if(maxX < widthOfWhitespaceAfterWord)
						{
							maxX = widthOfWhitespaceAfterWord;
						}
						previousCharID = NaN;
						currentX -= startXOfPreviousWord;
						currentY += lineHeight;
						startXOfPreviousWord = 0;
						widthOfWhitespaceAfterWord = 0;
						wordCountForLine = 0;
						line = "";
					}
				}
				currentX += offsetX + customLetterSpacing;
				previousCharID = charID;
				word += String.fromCharCode(charID);
			}
			currentX = currentX - customLetterSpacing;
			if(currentX < 0)
			{
				currentX = 0;
			}
			//if the text ends in extra whitespace, the currentX value will be
			//larger than the max line width. we'll remove that and add extra
			//lines.
			if(this._wordWrap)
			{
				while(currentX > maxLineWidth)
				{
					currentX -= maxLineWidth;
					currentY += lineHeight;
				}
			}
			if(maxX < currentX)
			{
				maxX = currentX;
			}

			result.x = maxX;
			result.y = currentY + lineHeight;
			return result;
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			if(!this._characterBatch)
			{
				this._characterBatch = new QuadBatch();
				this._characterBatch.touchable = false;
				this.addChild(this._characterBatch);
			}
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

			if(stylesInvalid || stateInvalid)
			{
				this.refreshTextFormat();
			}

			if(dataInvalid || stylesInvalid || sizeInvalid || stateInvalid)
			{
				this._characterBatch.batchable = !this._useSeparateBatch;
				this._characterBatch.reset();
				if(!this.currentTextFormat || this._text === null)
				{
					this.setSizeInternal(0, 0, false);
					return;
				}
				this.layoutCharacters(BitmapFontTextRenderer.HELPER_POINT);
				this.setSizeInternal(BitmapFontTextRenderer.HELPER_POINT.x, BitmapFontTextRenderer.HELPER_POINT.y, false);
			}
		}

		/**
		 * @private
		 */
		protected layoutCharacters(result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
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
			var lineHeight:number = font.lineHeight * scale;

			var hasExplicitWidth:boolean = this.explicitWidth === this.explicitWidth; //!isNaN
			var isAligned:boolean = this.currentTextFormat.align != TextFormatAlign.LEFT;
			var maxLineWidth:number = hasExplicitWidth ? this.explicitWidth : this._maxWidth;
			if(isAligned && maxLineWidth == Number.POSITIVE_INFINITY)
			{
				//we need to measure the text to get the maximum line width
				//so that we can align the text
				this.measureText(BitmapFontTextRenderer.HELPER_POINT);
				maxLineWidth = BitmapFontTextRenderer.HELPER_POINT.x;
			}
			var textToDraw:string = this._text;
			if(this._truncateToFit)
			{
				textToDraw = this.getTruncatedText(maxLineWidth);
			}
			BitmapFontTextRenderer.CHARACTER_BUFFER.length = 0;

			var maxX:number = 0;
			var currentX:number = 0;
			var currentY:number = 0;
			var previousCharID:number = NaN;
			var isWordComplete:boolean = false;
			var startXOfPreviousWord:number = 0;
			var widthOfWhitespaceAfterWord:number = 0;
			var wordLength:number = 0;
			var wordCountForLine:number = 0;
			var charCount:number = textToDraw ? textToDraw.length : 0;
			for(var i:number = 0; i < charCount; i++)
			{
				isWordComplete = false;
				var charID:number = textToDraw.charCodeAt(i);
				if(charID == BitmapFontTextRenderer.CHARACTER_ID_LINE_FEED || charID == BitmapFontTextRenderer.CHARACTER_ID_CARRIAGE_RETURN) //new line \n or \r
				{
					currentX = currentX - customLetterSpacing;
					if(currentX < 0)
					{
						currentX = 0;
					}
					if(this._wordWrap || isAligned)
					{
						this.alignBuffer(maxLineWidth, currentX, 0);
						this.addBufferToBatch(0);
					}
					if(maxX < currentX)
					{
						maxX = currentX;
					}
					previousCharID = NaN;
					currentX = 0;
					currentY += lineHeight;
					startXOfPreviousWord = 0;
					widthOfWhitespaceAfterWord = 0;
					wordLength = 0;
					wordCountForLine = 0;
					continue;
				}

				var charData:BitmapChar = font.getChar(charID);
				if(!charData)
				{
					trace("Missing character " + String.fromCharCode(charID) + " in font " + font.name + ".");
					continue;
				}

				if(isKerningEnabled &&
					previousCharID === previousCharID) //!isNaN
				{
					currentX += charData.getKerning(previousCharID) * scale;
				}

				var offsetX:number = charData.xAdvance * scale;
				if(this._wordWrap)
				{
					var currentCharIsWhitespace:boolean = charID == BitmapFontTextRenderer.CHARACTER_ID_SPACE || charID == BitmapFontTextRenderer.CHARACTER_ID_TAB;
					var previousCharIsWhitespace:boolean = previousCharID == BitmapFontTextRenderer.CHARACTER_ID_SPACE || previousCharID == BitmapFontTextRenderer.CHARACTER_ID_TAB;
					if(currentCharIsWhitespace)
					{
						if(!previousCharIsWhitespace)
						{
							widthOfWhitespaceAfterWord = 0;
						}
						widthOfWhitespaceAfterWord += offsetX;
					}
					else if(previousCharIsWhitespace)
					{
						startXOfPreviousWord = currentX;
						wordLength = 0;
						wordCountForLine++;
						isWordComplete = true;
					}

					//we may need to move to a new line at the same time
					//that our previous word in the buffer can be batched
					//so we need to add the buffer here rather than after
					//the next section
					if(isWordComplete && !isAligned)
					{
						this.addBufferToBatch(0);
					}

					if(!currentCharIsWhitespace && wordCountForLine > 0 && (currentX + offsetX) > maxLineWidth)
					{
						if(isAligned)
						{
							this.trimBuffer(wordLength);
							this.alignBuffer(maxLineWidth, startXOfPreviousWord - widthOfWhitespaceAfterWord, wordLength);
							this.addBufferToBatch(wordLength);
						}
						this.moveBufferedCharacters(-startXOfPreviousWord, lineHeight, 0);
						//we're just reusing this variable to avoid creating a
						//new one. it'll be reset to 0 in a moment.
						widthOfWhitespaceAfterWord = startXOfPreviousWord - widthOfWhitespaceAfterWord;
						if(maxX < widthOfWhitespaceAfterWord)
						{
							maxX = widthOfWhitespaceAfterWord;
						}
						previousCharID = NaN;
						currentX -= startXOfPreviousWord;
						currentY += lineHeight;
						startXOfPreviousWord = 0;
						widthOfWhitespaceAfterWord = 0;
						wordLength = 0;
						isWordComplete = false;
						wordCountForLine = 0;
					}
				}
				if(this._wordWrap || isAligned)
				{
					var charLocation:CharLocation = BitmapFontTextRenderer.CHAR_LOCATION_POOL.length > 0 ? BitmapFontTextRenderer.CHAR_LOCATION_POOL.shift() : new CharLocation();
					charLocation.char = charData;
					charLocation.x = currentX + charData.xOffset * scale;
					charLocation.y = currentY + charData.yOffset * scale;
					charLocation.scale = scale;
					BitmapFontTextRenderer.CHARACTER_BUFFER[BitmapFontTextRenderer.CHARACTER_BUFFER.length] = charLocation;
					wordLength++;
				}
				else
				{
					this.addCharacterToBatch(charData, currentX + charData.xOffset * scale, currentY + charData.yOffset * scale, scale);
				}

				currentX += offsetX + customLetterSpacing;
				previousCharID = charID;
			}
			currentX = currentX - customLetterSpacing;
			if(currentX < 0)
			{
				currentX = 0;
			}
			if(this._wordWrap || isAligned)
			{
				this.alignBuffer(maxLineWidth, currentX, 0);
				this.addBufferToBatch(0);
			}
			//if the text ends in extra whitespace, the currentX value will be
			//larger than the max line width. we'll remove that and add extra
			//lines.
			if(this._wordWrap)
			{
				while(currentX > maxLineWidth)
				{
					currentX -= maxLineWidth;
					currentY += lineHeight;
				}
			}
			if(maxX < currentX)
			{
				maxX = currentX;
			}

			if(isAligned && !hasExplicitWidth)
			{
				var align:string = this._textFormat.align;
				if(align == TextFormatAlign.CENTER)
				{
					this._batchX = (maxX - maxLineWidth) / 2;
				}
				else if(align == TextFormatAlign.RIGHT)
				{
					this._batchX = maxX - maxLineWidth;
				}
			}
			else
			{
				this._batchX = 0;
			}
			this._characterBatch.x = this._batchX;

			result.x = maxX;
			result.y = currentY + lineHeight;
			return result;
		}

		/**
		 * @private
		 */
		protected trimBuffer(skipCount:number):void
		{
			var countToRemove:number = 0;
			var charCount:number = BitmapFontTextRenderer.CHARACTER_BUFFER.length - skipCount;
			for(var i:number = charCount - 1; i >= 0; i--)
			{
				var charLocation:CharLocation = BitmapFontTextRenderer.CHARACTER_BUFFER[i];
				var charData:BitmapChar = charLocation.char;
				var charID:number = charData.charID;
				if(charID == BitmapFontTextRenderer.CHARACTER_ID_SPACE || charID == BitmapFontTextRenderer.CHARACTER_ID_TAB)
				{
					countToRemove++;
				}
				else
				{
					break;
				}
			}
			if(countToRemove > 0)
			{
				BitmapFontTextRenderer.CHARACTER_BUFFER.splice(i + 1, countToRemove);
			}
		}

		/**
		 * @private
		 */
		protected alignBuffer(maxLineWidth:number, currentLineWidth:number, skipCount:number):void
		{
			var align:string = this.currentTextFormat.align;
			if(align == TextFormatAlign.CENTER)
			{
				this.moveBufferedCharacters(Math.round((maxLineWidth - currentLineWidth) / 2), 0, skipCount);
			}
			else if(align == TextFormatAlign.RIGHT)
			{
				this.moveBufferedCharacters(maxLineWidth - currentLineWidth, 0, skipCount);
			}
		}

		/**
		 * @private
		 */
		protected addBufferToBatch(skipCount:number):void
		{
			var charCount:number = BitmapFontTextRenderer.CHARACTER_BUFFER.length - skipCount;
			var pushIndex:number = BitmapFontTextRenderer.CHAR_LOCATION_POOL.length;
			for(var i:number = 0; i < charCount; i++)
			{
				var charLocation:CharLocation = BitmapFontTextRenderer.CHARACTER_BUFFER.shift();
				this.addCharacterToBatch(charLocation.char, charLocation.x, charLocation.y, charLocation.scale);
				charLocation.char = null;
				BitmapFontTextRenderer.CHAR_LOCATION_POOL[pushIndex] = charLocation;
				pushIndex++;
			}
		}

		/**
		 * @private
		 */
		protected moveBufferedCharacters(xOffset:number, yOffset:number, skipCount:number):void
		{
			var charCount:number = BitmapFontTextRenderer.CHARACTER_BUFFER.length - skipCount;
			for(var i:number = 0; i < charCount; i++)
			{
				var charLocation:CharLocation = BitmapFontTextRenderer.CHARACTER_BUFFER[i];
				charLocation.x += xOffset;
				charLocation.y += yOffset;
			}
		}

		/**
		 * @private
		 */
		protected addCharacterToBatch(charData:BitmapChar, x:number, y:number, scale:number, support:RenderSupport = null, parentAlpha:number = 1):void
		{
			var texture:Texture = charData.texture;
			var frame:Rectangle = texture.frame;
			if(frame)
			{
				if(frame.width === 0 || frame.height === 0)
				{
					return;
				}
			}
			else if(texture.width === 0 || texture.height === 0)
			{
				return;
			}
			if(!BitmapFontTextRenderer.HELPER_IMAGE)
			{
				BitmapFontTextRenderer.HELPER_IMAGE = new Image(texture);
			}
			else
			{
				BitmapFontTextRenderer.HELPER_IMAGE.texture = texture;
				BitmapFontTextRenderer.HELPER_IMAGE.readjustSize();
			}
			BitmapFontTextRenderer.HELPER_IMAGE.scaleX = BitmapFontTextRenderer.HELPER_IMAGE.scaleY = scale;
			BitmapFontTextRenderer.HELPER_IMAGE.x = x;
			BitmapFontTextRenderer.HELPER_IMAGE.y = y;
			BitmapFontTextRenderer.HELPER_IMAGE.color = this.currentTextFormat.color;
			BitmapFontTextRenderer.HELPER_IMAGE.smoothing = this._smoothing;

			if(support)
			{
				support.pushMatrix();
				support.transformMatrix(BitmapFontTextRenderer.HELPER_IMAGE);
				support.batchQuad(BitmapFontTextRenderer.HELPER_IMAGE, parentAlpha, BitmapFontTextRenderer.HELPER_IMAGE.texture, this._smoothing);
				support.popMatrix();
			}
			else
			{
				this._characterBatch.addImage(BitmapFontTextRenderer.HELPER_IMAGE);
			}
		}

		/**
		 * @private
		 */
		protected refreshTextFormat():void
		{
			if(!this._isEnabled && this._disabledTextFormat)
			{
				this.currentTextFormat = this._disabledTextFormat;
			}
			else
			{
				//let's fall back to using Starling's embedded mini font if no
				//text format has been specified
				if(!this._textFormat)
				{
					//if it's not registered, do that first
					if(!TextField.getBitmapFont(BitmapFont.MINI))
					{
						TextField.registerBitmapFont(new BitmapFont());
					}
					this._textFormat = new BitmapFontTextFormat(BitmapFont.MINI, NaN, 0x000000);
				}
				this.currentTextFormat = this._textFormat;
			}
		}

		/**
		 * @private
		 */
		protected getTruncatedText(width:number):string
		{
			if(!this._text)
			{
				//this shouldn't be called if _text is null, but just in case...
				return "";
			}

			//if the width is infinity or the string is multiline, don't allow truncation
			if(width == Number.POSITIVE_INFINITY || this._wordWrap || this._text.indexOf(String.fromCharCode(BitmapFontTextRenderer.CHARACTER_ID_LINE_FEED)) >= 0 || this._text.indexOf(String.fromCharCode(BitmapFontTextRenderer.CHARACTER_ID_CARRIAGE_RETURN)) >= 0)
			{
				return this._text;
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
			var currentX:number = 0;
			var previousCharID:number = NaN;
			var charCount:number = this._text.length;
			var truncationIndex:number = -1;
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
				currentX += currentKerning + charData.xAdvance * scale;
				if(currentX > width)
				{
					//floating point errors can cause unnecessary truncation,
					//so we're going to be a little bit fuzzy on the greater
					//than check. such tiny numbers shouldn't break anything.
					var difference:number = Math.abs(currentX - width);
					if(difference > BitmapFontTextRenderer.FUZZY_MAX_WIDTH_PADDING)
					{
						truncationIndex = i;
						break;
					}
				}
				currentX += customLetterSpacing;
				previousCharID = charID;
			}

			if(truncationIndex >= 0)
			{
				//first measure the size of the truncation text
				charCount = this._truncationText.length;
				for(i = 0; i < charCount; i++)
				{
					charID = this._truncationText.charCodeAt(i);
					charData = font.getChar(charID);
					if(!charData)
					{
						continue;
					}
					currentKerning = 0;
					if(isKerningEnabled &&
						previousCharID === previousCharID) //!isNaN
					{
						currentKerning = charData.getKerning(previousCharID) * scale;
					}
					currentX += currentKerning + charData.xAdvance * scale + customLetterSpacing;
					previousCharID = charID;
				}
				currentX -= customLetterSpacing;

				//then work our way backwards until we fit into the width
				for(i = truncationIndex; i >= 0; i--)
				{
					charID = this._text.charCodeAt(i);
					previousCharID = i > 0 ? this._text.charCodeAt(i - 1) : NaN;
					charData = font.getChar(charID);
					if(!charData)
					{
						continue;
					}
					currentKerning = 0;
					if(isKerningEnabled &&
						previousCharID === previousCharID) //!isNaN
					{
						currentKerning = charData.getKerning(previousCharID) * scale;
					}
					currentX -= (currentKerning + charData.xAdvance * scale + customLetterSpacing);
					if(currentX <= width)
					{
						return this._text.substr(0, i) + this._truncationText;
					}
				}
				return this._truncationText;
			}
			return this._text;
		}

		/**
		 * @private
		 * This function is here to work around a bug in the Flex 4.6 SDK
		 * compiler. For explanation, see the places where it gets called.
		 */
		protected doNothing():void {}
	}
}

import BitmapChar = starling.text.BitmapChar;

class CharLocation
{
	constructor()
	{

	}

	public char:BitmapChar;
	public scale:number;
	public x:number;
	public y:number;
}