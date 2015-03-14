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

	import BitmapData = flash.display.BitmapData;
	import DisplayObjectContainer = flash.display.DisplayObjectContainer;
	import Sprite = flash.display.Sprite;
	import Context3DProfile = flash.display3D.Context3DProfile;
	import BitmapFilter = flash.filters.BitmapFilter;
	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import ContentElement = flash.text.engine.ContentElement;
	import ElementFormat = flash.text.engine.ElementFormat;
	import FontDescription = flash.text.engine.FontDescription;
	import SpaceJustifier = flash.text.engine.SpaceJustifier;
	import TabStop = flash.text.engine.TabStop;
	import TextBaseline = flash.text.engine.TextBaseline;
	import TextBlock = flash.text.engine.TextBlock;
	import TextElement = flash.text.engine.TextElement;
	import TextJustifier = flash.text.engine.TextJustifier;
	import TextLine = flash.text.engine.TextLine;
	import TextLineValidity = flash.text.engine.TextLineValidity;
	import TextRotation = flash.text.engine.TextRotation;

	import RenderSupport = starling.core.RenderSupport;
	import Starling = starling.core.Starling;
	import Image = starling.display.Image;
	import ConcreteTexture = starling.textures.ConcreteTexture;
	import Texture = starling.textures.Texture;
	import getNextPowerOfTwo = starling.utils.getNextPowerOfTwo;

	/**
	 * Renders text with a native <code>flash.text.engine.TextBlock</code> from
	 * Flash Text Engine (FTE), and draws it to <code>BitmapData</code> to
	 * convert to Starling textures. Textures are completely managed by this
	 * component, and they will be automatically disposed when the component is
	 * disposed.
	 *
	 * <p>For longer passages of text, this component will stitch together
	 * multiple individual textures both horizontally and vertically, as a grid,
	 * if required. This may require quite a lot of texture memory, possibly
	 * exceeding the limits of some mobile devices, so use this component with
	 * caution when displaying a lot of text.</p>
	 *
	 * @see ../../../help/text-renderers.html Introduction to Feathers text renderers
	 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html flash.text.engine.TextBlock
	 */
	export class TextBlockTextRenderer extends FeathersControl implements ITextRenderer
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 */
		private static HELPER_MATRIX:Matrix = new Matrix();

		/**
		 * @private
		 */
		private static HELPER_RECTANGLE:Rectangle = new Rectangle();

		/**
		 * @private
		 */
		private static HELPER_TEXT_LINES:TextLine[] = new Array<TextLine>();

		/**
		 * @private
		 * This is enforced by the runtime.
		 */
		protected static MAX_TEXT_LINE_WIDTH:number = 1000000;

		/**
		 * @private
		 */
		protected static LINE_FEED:string = "\n";

		/**
		 * @private
		 */
		protected static CARRIAGE_RETURN:string = "\r";

		/**
		 * @private
		 */
		protected static FUZZY_TRUNCATION_DIFFERENCE:number = 0.000001;

		/**
		 * The text will be positioned to the left edge.
		 *
		 * @see #textAlign
		 */
		public static TEXT_ALIGN_LEFT:string = "left";

		/**
		 * The text will be centered horizontally.
		 *
		 * @see #textAlign
		 */
		public static TEXT_ALIGN_CENTER:string = "center";

		/**
		 * The text will be positioned to the right edge.
		 *
		 * @see #textAlign
		 */
		public static TEXT_ALIGN_RIGHT:string = "right";

		/**
		 * The default <code>IStyleProvider</code> for all <code>TextBlockTextRenderer</code>
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
			this.isQuickHitAreaEnabled = true;
		}

		/**
		 * The TextBlock instance used to render the text before taking a
		 * texture snapshot.
		 */
		protected textBlock:TextBlock;

		/**
		 * An image that displays a snapshot of the native <code>TextBlock</code>
		 * in the Starling display list when the editor doesn't have focus.
		 */
		protected textSnapshot:Image;

		/**
		 * If multiple snapshots are needed due to texture size limits, the
		 * snapshots appearing after the first are stored here.
		 */
		protected textSnapshots:Image[];

		/**
		 * @private
		 */
		protected _textSnapshotScrollX:number = 0;

		/**
		 * @private
		 */
		protected _textSnapshotScrollY:number = 0;

		/**
		 * @private
		 */
		protected _textSnapshotOffsetX:number = 0;

		/**
		 * @private
		 */
		protected _textSnapshotOffsetY:number = 0;

		/**
		 * @private
		 */
		protected _textLineContainer:Sprite;

		/**
		 * @private
		 */
		protected _textLines:TextLine[] = new Array<TextLine>();

		/**
		 * @private
		 */
		protected _measurementTextLineContainer:Sprite;

		/**
		 * @private
		 */
		protected _measurementTextLines:TextLine[] = new Array<TextLine>();

		/**
		 * @private
		 */
		protected _previousContentWidth:number = NaN;

		/**
		 * @private
		 */
		protected _previousContentHeight:number = NaN;

		/**
		 * @private
		 */
		protected _snapshotWidth:number = 0;

		/**
		 * @private
		 */
		protected _snapshotHeight:number = 0;

		/**
		 * @private
		 */
		protected _snapshotVisibleWidth:number = 0;

		/**
		 * @private
		 */
		protected _snapshotVisibleHeight:number = 0;

		/**
		 * @private
		 */
		protected _needsNewTexture:boolean = false;

		/**
		 * @private
		 */
		protected _truncationOffset:number = 0;

		/**
		 * @private
		 */
		protected _textElement:TextElement;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return TextBlockTextRenderer.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _text:string;

		/**
		 * @inheritDoc
		 *
		 * <p>In the following example, the text is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.text = "Lorem ipsum";</listing>
		 *
		 * @default ""
		 */
		public get text():string
		{
			return this._textElement ? this._text : null;
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
			if(!this._textElement)
			{
				this._textElement = new TextElement(value);
			}
			this._textElement.text = value;
			this.content = this._textElement;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _content:ContentElement;

		/**
		 * Sets the contents of the <code>TextBlock</code> to a complex value
		 * that is more than simple text. If the <code>text</code> property is
		 * set after the <code>content</code> property, the <code>content</code>
		 * property will be replaced with a <code>TextElement</code>.
		 *
		 * <p>In the following example, the content is changed to a
		 * <code>GroupElement</code>:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.content = new GroupElement( element );</listing>
		 *
		 * <p>To simply display a string value, use the <code>text</code> property
		 * instead:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.text = "Lorem Ipsum";</listing>
		 *
		 * @default null
		 *
		 * @see #text
		 */
		public get content():ContentElement
		{
			return this._content;
		}

		/**
		 * @private
		 */
		public set content(value:ContentElement)
		{
			if(this._content == value)
			{
				return;
			}
			if(value instanceof TextElement)
			{
				this._textElement = TextElement(value);
			}
			else
			{
				this._textElement = null;
			}
			this._content = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _elementFormat:ElementFormat;

		/**
		 * The font and styles used to draw the text. This property will be
		 * ignored if the content is not a <code>TextElement</code> instance.
		 *
		 * <p>In the following example, the element format is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.elementFormat = new ElementFormat( new FontDescription( "Source Sans Pro" ) );</listing>
		 *
		 * @default null
		 *
		 * @see #disabledElementFormat
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/ElementFormat.html flash.text.engine.ElementFormat
		 */
		public get elementFormat():ElementFormat
		{
			return this._elementFormat;
		}

		/**
		 * @private
		 */
		public set elementFormat(value:ElementFormat)
		{
			if(this._elementFormat == value)
			{
				return;
			}
			this._elementFormat = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _disabledElementFormat:ElementFormat;

		/**
		 * The font and styles used to draw the text when the component is
		 * disabled. This property will be ignored if the content is not a
		 * <code>TextElement</code> instance.
		 *
		 * <p>In the following example, the disabled element format is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.isEnabled = false;
		 * textRenderer.disabledElementFormat = new ElementFormat( new FontDescription( "Source Sans Pro" ) );</listing>
		 *
		 * @default null
		 *
		 * @see #elementFormat
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/ElementFormat.html flash.text.engine.ElementFormat
		 */
		public get disabledElementFormat():ElementFormat
		{
			return this._disabledElementFormat;
		}

		/**
		 * @private
		 */
		public set disabledElementFormat(value:ElementFormat)
		{
			if(this._disabledElementFormat == value)
			{
				return;
			}
			this._disabledElementFormat = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _leading:number = 0;

		/**
		 * The amount of vertical space, in pixels, between lines.
		 *
		 * <p>In the following example, the leading is changed to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.leading = 20;</listing>
		 *
		 * @default 0
		 */
		public get leading():number
		{
			return this._leading;
		}

		/**
		 * @private
		 */
		public set leading(value:number)
		{
			if(this._leading == value)
			{
				return;
			}
			this._leading = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _textAlign:string = TextBlockTextRenderer.TEXT_ALIGN_LEFT;

		/**
		 * The alignment of the text. For justified text, see the
		 * <code>textJustifier</code> property.
		 *
		 * <p>In the following example, the leading is changed to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.textAlign = TextBlockTextRenderer.TEXT_ALIGN_CENTER;</listing>
		 *
		 * @default TextBlockTextRenderer.TEXT_ALIGN_LEFT
		 *
		 * @see #TEXT_ALIGN_LEFT
		 * @see #TEXT_ALIGN_CENTER
		 * @see #TEXT_ALIGN_RIGHT
		 * @see #textJustifier
		 */
		public get textAlign():string
		{
			return this._textAlign;
		}

		/**
		 * @private
		 */
		public set textAlign(value:string)
		{
			if(this._textAlign == value)
			{
				return;
			}
			this._textAlign = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _wordWrap:boolean = false;

		/**
		 * Determines if the text wraps to the next line when it reaches the
		 * width of the component.
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
		 * @inheritDoc
		 */
		public get baseline():number
		{
			if(this._textLines.length == 0)
			{
				return 0;
			}
			return this._textLines[0].ascent;
		}

		/**
		 * @private
		 */
		protected _applyNonLinearFontScaling:boolean = true;

		/**
		 * Specifies that you want to enhance screen appearance at the expense
		 * of what-you-see-is-what-you-get (WYSIWYG) print fidelity.
		 *
		 * <p>In the following example, this property is changed to false:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.applyNonLinearFontScaling = false;</listing>
		 *
		 * @default true
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#applyNonLinearFontScaling Full description of flash.text.engine.TextBlock.applyNonLinearFontScaling in Adobe's Flash Platform API Reference
		 */
		public get applyNonLinearFontScaling():boolean
		{
			return this._applyNonLinearFontScaling;
		}

		/**
		 * @private
		 */
		public set applyNonLinearFontScaling(value:boolean)
		{
			if(this._applyNonLinearFontScaling == value)
			{
				return;
			}
			this._applyNonLinearFontScaling = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _baselineFontDescription:FontDescription;

		/**
		 * The font used to determine the baselines for all the lines created from the block, independent of their content.
		 *
		 * <p>In the following example, the baseline font description is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.baselineFontDescription = new FontDescription( "Source Sans Pro", FontWeight.BOLD );</listing>
		 *
		 * @default null
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#baselineFontDescription Full description of flash.text.engine.TextBlock.baselineFontDescription in Adobe's Flash Platform API Reference
		 * @see #baselineFontSize
		 */
		public get baselineFontDescription():FontDescription
		{
			return this._baselineFontDescription;
		}

		/**
		 * @private
		 */
		public set baselineFontDescription(value:FontDescription)
		{
			if(this._baselineFontDescription == value)
			{
				return;
			}
			this._baselineFontDescription = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _baselineFontSize:number = 12;

		/**
		 * The font size used to calculate the baselines for the lines created
		 * from the block.
		 *
		 * <p>In the following example, the baseline font size is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.baselineFontSize = 20;</listing>
		 *
		 * @default 12
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#baselineFontSize Full description of flash.text.engine.TextBlock.baselineFontSize in Adobe's Flash Platform API Reference
		 * @see #baselineFontDescription
		 */
		public get baselineFontSize():number
		{
			return this._baselineFontSize;
		}

		/**
		 * @private
		 */
		public set baselineFontSize(value:number)
		{
			if(this._baselineFontSize == value)
			{
				return;
			}
			this._baselineFontSize = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _baselineZero:string = TextBaseline.ROMAN;

		/**
		 * Specifies which baseline is at y=0 for lines created from this block.
		 *
		 * <p>In the following example, the baseline zero is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.baselineZero = TextBaseline.ASCENT;</listing>
		 *
		 * @default TextBaseline.ROMAN
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#baselineZero Full description of flash.text.engine.TextBlock.baselineZero in Adobe's Flash Platform API Reference
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBaseline.html flash.text.engine.TextBaseline
		 */
		public get baselineZero():string
		{
			return this._baselineZero;
		}

		/**
		 * @private
		 */
		public set baselineZero(value:string)
		{
			if(this._baselineZero == value)
			{
				return;
			}
			this._baselineZero = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _bidiLevel:number = 0;

		/**
		 * Specifies the bidirectional paragraph embedding level of the text
		 * block.
		 *
		 * <p>In the following example, the bidi level is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.bidiLevel = 1;</listing>
		 *
		 * @default 0
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#bidiLevel Full description of flash.text.engine.TextBlock.bidiLevel in Adobe's Flash Platform API Reference
		 */
		public get bidiLevel():number
		{
			return this._bidiLevel;
		}

		/**
		 * @private
		 */
		public set bidiLevel(value:number)
		{
			if(this._bidiLevel == value)
			{
				return;
			}
			this._bidiLevel = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _lineRotation:string = TextRotation.ROTATE_0;

		/**
		 * Rotates the text lines in the text block as a unit.
		 *
		 * <p>In the following example, the line rotation is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.lineRotation = TextRotation.ROTATE_90;</listing>
		 *
		 * @default TextRotation.ROTATE_0
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#lineRotation Full description of flash.text.engine.TextBlock.lineRotation in Adobe's Flash Platform API Reference
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextRotation.html flash.text.engine.TextRotation
		 */
		public get lineRotation():string
		{
			return this._lineRotation;
		}

		/**
		 * @private
		 */
		public set lineRotation(value:string)
		{
			if(this._lineRotation == value)
			{
				return;
			}
			this._lineRotation = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _tabStops:TabStop[];

		/**
		 * Specifies the tab stops for the text in the text block, in the form
		 * of a <code>Vector</code> of <code>TabStop</code> objects.
		 *
		 * <p>In the following example, the tab stops changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.tabStops = new &lt;TabStop&gt;[ new TabStop( TabAlignment.CENTER ) ];</listing>
		 *
		 * @default null
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#tabStops Full description of flash.text.engine.TextBlock.tabStops in Adobe's Flash Platform API Reference
		 */
		public get tabStops():TabStop[]
		{
			return this._tabStops;
		}

		/**
		 * @private
		 */
		public set tabStops(value:TabStop[])
		{
			if(this._tabStops == value)
			{
				return;
			}
			this._tabStops = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _textJustifier:TextJustifier = new SpaceJustifier();

		/**
		 * Specifies the <code>TextJustifier</code> to use during line creation.
		 *
		 * <p>In the following example, the text justifier is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.textJustifier = new SpaceJustifier( "en", LineJustification.ALL_BUT_LAST );</listing>
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#textJustifier Full description of flash.text.engine.TextBlock.textJustifier in Adobe's Flash Platform API Reference
		 */
		public get textJustifier():TextJustifier
		{
			return this._textJustifier;
		}

		/**
		 * @private
		 */
		public set textJustifier(value:TextJustifier)
		{
			if(this._textJustifier == value)
			{
				return;
			}
			this._textJustifier = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _userData:any;

		/**
		 * Provides a way for the application to associate arbitrary data with
		 * the text block.
		 *
		 * <p>In the following example, the user data is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.userData = { author: "William Shakespeare", title: "Much Ado About Nothing" };</listing>
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/engine/TextBlock.html#userData Full description of flash.text.engine.TextBlock.userData in Adobe's Flash Platform API Reference
		 */
		public get userData():any
		{
			return this._userData;
		}

		/**
		 * @private
		 */
		public set userData(value:any)
		{
			if(this._userData === value)
			{
				return;
			}
			this._userData = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _snapToPixels:boolean = true;

		/**
		 * Determines if the text should be snapped to the nearest whole pixel
		 * when rendered. When this is <code>false</code>, text may be displayed
		 * on sub-pixels, which often results in blurred rendering due to
		 * texture smoothing.
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
			this._snapToPixels = value;
		}

		/**
		 * @private
		 */
		protected _maxTextureDimensions:number = 2048;

		/**
		 * The maximum size of individual textures that are managed by this text
		 * renderer. Must be a power of 2. A larger value will create fewer
		 * individual textures, but a smaller value may use less overall texture
		 * memory by incrementing over smaller powers of two.
		 *
		 * <p>In the following example, the maximum size of the textures is
		 * changed:</p>
		 *
		 * <listing version="3.0">
		 * renderer.maxTextureDimensions = 4096;</listing>
		 *
		 * @default 2048
		 */
		public get maxTextureDimensions():number
		{
			return this._maxTextureDimensions;
		}

		/**
		 * @private
		 */
		public set maxTextureDimensions(value:number)
		{
			//check if we can use rectangle textures or not
			if(Starling.current.profile == Context3DProfile.BASELINE_CONSTRAINED)
			{
				value = getNextPowerOfTwo(value);
			}
			if(this._maxTextureDimensions == value)
			{
				return;
			}
			this._maxTextureDimensions = value;
			this._needsNewTexture = true;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _nativeFilters:any[];

		/**
		 * Native filters to pass to the <code>flash.text.engine.TextLine</code>
		 * instances before creating the texture snapshot.
		 *
		 * <p>In the following example, the native filters are changed:</p>
		 *
		 * <listing version="3.0">
		 * renderer.nativeFilters = [ new GlowFilter() ];</listing>
		 *
		 * @default null
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display/DisplayObject.html#filters Full description of flash.display.DisplayObject.filters in Adobe's Flash Platform API Reference
		 */
		public get nativeFilters():any[]
		{
			return this._nativeFilters;
		}

		/**
		 * @private
		 */
		public set nativeFilters(value:any[])
		{
			if(this._nativeFilters == value)
			{
				return;
			}
			this._nativeFilters = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
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
		 *
		 * @see #truncateToFit
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
		protected _truncateToFit:boolean = true;

		/**
		 * If word wrap is disabled, and the text is longer than the width of
		 * the label, the text may be truncated using <code>truncationText</code>.
		 *
		 * <p>This feature may be disabled to improve performance.</p>
		 *
		 * <p>This feature only works when the <code>text</code> property is
		 * set to a string value. If the <code>content</code> property is set
		 * instead, then the content will not be truncated.</p>
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
		/*override*/ public dispose():void
		{
			if(this.textSnapshot)
			{
				this.textSnapshot.texture.dispose();
				this.removeChild(this.textSnapshot, true);
				this.textSnapshot = null;
			}
			if(this.textSnapshots)
			{
				var snapshotCount:number = this.textSnapshots.length;
				for(var i:number = 0; i < snapshotCount; i++)
				{
					var snapshot:Image = this.textSnapshots[i];
					snapshot.texture.dispose();
					this.removeChild(snapshot, true);
				}
				this.textSnapshots = null;
			}
			//this isn't necessary, but if a memory leak keeps the text renderer
			//from being garbage collected, freeing up these things may help
			//ease memory pressure from native filters and other expensive stuff
			this.textBlock = null;
			this._textLineContainer = null;
			this._textLines = null;
			this._measurementTextLineContainer = null;
			this._measurementTextLines = null;
			this._textElement = null;
			this._content = null;

			this._previousContentWidth = NaN;
			this._previousContentHeight = NaN;

			this._needsNewTexture = false;
			this._snapshotWidth = 0;
			this._snapshotHeight = 0;

			super.dispose();
		}

		/**
		 * @private
		 */
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			if(this.textSnapshot)
			{
				this.getTransformationMatrix(this.stage, TextBlockTextRenderer.HELPER_MATRIX);
				var scaleFactor:number = Starling.current.contentScaleFactor;
				if(!this._nativeFilters || this._nativeFilters.length === 0)
				{
					var offsetX:number = 0;
					var offsetY:number = 0;
				}
				else
				{
					offsetX = this._textSnapshotOffsetX / scaleFactor;
					offsetY = this._textSnapshotOffsetY / scaleFactor;
				}
				if(this._snapToPixels)
				{
					offsetX += Math.round(TextBlockTextRenderer.HELPER_MATRIX.tx) - TextBlockTextRenderer.HELPER_MATRIX.tx;
					offsetY += Math.round(TextBlockTextRenderer.HELPER_MATRIX.ty) - TextBlockTextRenderer.HELPER_MATRIX.ty;
				}
				this.textSnapshot.x = offsetX;
				this.textSnapshot.y = offsetY;
				if(this.textSnapshots)
				{
					var snapshotSize:number = this._maxTextureDimensions / scaleFactor;
					var positionX:number = offsetX + snapshotSize;
					var positionY:number = offsetY;
					var snapshotCount:number = this.textSnapshots.length;
					for(var i:number = 0; i < snapshotCount; i++)
					{
						if(positionX > this.actualWidth)
						{
							positionX = offsetX;
							positionY += snapshotSize;
						}
						var snapshot:Image = this.textSnapshots[i];
						snapshot.x = positionX;
						snapshot.y = positionY;
						positionX += snapshotSize;
					}
				}
			}
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

			//if a parent component validates before we're added to the stage,
			//measureText() may be called before initialization, so we need to
			//force it.
			if(!this._isInitialized)
			{
				this.initializeInternal();
			}

			this.commit();

			result = this.measure(result);

			return result;
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			if(!this.textBlock)
			{
				this.textBlock = new TextBlock();
			}
			if(!this._textLineContainer)
			{
				this._textLineContainer = new Sprite();
			}
			if(!this._measurementTextLineContainer)
			{
				this._measurementTextLineContainer = new Sprite();
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);

			this.commit();

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			this.layout(sizeInvalid);
		}

		/**
		 * @private
		 */
		protected commit():void
		{
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);

			if(dataInvalid || stylesInvalid || stateInvalid)
			{
				if(this._textElement)
				{
					if(!this._isEnabled && this._disabledElementFormat)
					{
						this._textElement.elementFormat = this._disabledElementFormat;
					}
					else
					{
						if(!this._elementFormat)
						{
							this._elementFormat = new ElementFormat();
						}
						this._textElement.elementFormat = this._elementFormat;
					}
				}
			}

			if(stylesInvalid)
			{
				this.textBlock.applyNonLinearFontScaling = this._applyNonLinearFontScaling;
				this.textBlock.baselineFontDescription = this._baselineFontDescription;
				this.textBlock.baselineFontSize = this._baselineFontSize;
				this.textBlock.baselineZero = this._baselineZero;
				this.textBlock.bidiLevel = this._bidiLevel;
				this.textBlock.lineRotation = this._lineRotation;
				this.textBlock.tabStops = this._tabStops;
				this.textBlock.textJustifier = this._textJustifier;
				this.textBlock.userData = this._userData;

				this._textLineContainer.filters = this._nativeFilters;
			}

			if(dataInvalid)
			{
				this.textBlock.content = this._content;
			}
		}

		/**
		 * @private
		 */
		protected measure(result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}

			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				newWidth = this._maxWidth;
				if(newWidth > TextBlockTextRenderer.MAX_TEXT_LINE_WIDTH)
				{
					newWidth = TextBlockTextRenderer.MAX_TEXT_LINE_WIDTH;
				}
			}
			if(needsHeight)
			{
				newHeight = this._maxHeight;
			}
			this.refreshTextLines(this._measurementTextLines, this._measurementTextLineContainer, newWidth, newHeight);
			if(needsWidth)
			{
				newWidth = this._measurementTextLineContainer.width;
				if(newWidth > this._maxWidth)
				{
					newWidth = this._maxWidth;
				}
			}
			if(needsHeight)
			{
				newHeight = this._measurementTextLineContainer.height;
				if(newHeight <= 0 && this._elementFormat)
				{
					newHeight = this._elementFormat.fontSize;
				}
			}

			result.x = newWidth;
			result.y = newHeight;

			return result;
		}

		/**
		 * @private
		 */
		protected layout(sizeInvalid:boolean):void
		{
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);

			if(sizeInvalid)
			{
				var scaleFactor:number = Starling.current.contentScaleFactor;
				//these are getting put into an int later, so we don't want it
				//to possibly round down and cut off part of the text. 
				var rectangleSnapshotWidth:number = Math.ceil(this.actualWidth * scaleFactor);
				var rectangleSnapshotHeight:number = Math.ceil(this.actualHeight * scaleFactor);
				if(rectangleSnapshotWidth >= 1 && rectangleSnapshotHeight >= 1 &&
					this._nativeFilters && this._nativeFilters.length > 0)
				{
					TextBlockTextRenderer.HELPER_MATRIX.identity();
					TextBlockTextRenderer.HELPER_MATRIX.scale(scaleFactor, scaleFactor);
					var bitmapData:BitmapData = new BitmapData(rectangleSnapshotWidth, rectangleSnapshotHeight, true, 0x00ff00ff);
					bitmapData.draw(this._textLineContainer, TextBlockTextRenderer.HELPER_MATRIX, null, null, TextBlockTextRenderer.HELPER_RECTANGLE);
					this.measureNativeFilters(bitmapData, TextBlockTextRenderer.HELPER_RECTANGLE);
					bitmapData.dispose();
					bitmapData = null;
					this._textSnapshotOffsetX = TextBlockTextRenderer.HELPER_RECTANGLE.x;
					this._textSnapshotOffsetY = TextBlockTextRenderer.HELPER_RECTANGLE.y;
					rectangleSnapshotWidth = TextBlockTextRenderer.HELPER_RECTANGLE.width;
					rectangleSnapshotHeight = TextBlockTextRenderer.HELPER_RECTANGLE.height;
				}
				var canUseRectangleTexture:boolean = Starling.current.profile != Context3DProfile.BASELINE_CONSTRAINED;
				if(canUseRectangleTexture)
				{
					if(rectangleSnapshotWidth > this._maxTextureDimensions)
					{
						this._snapshotWidth = int(rectangleSnapshotWidth / this._maxTextureDimensions) * this._maxTextureDimensions + (rectangleSnapshotWidth % this._maxTextureDimensions);
					}
					else
					{
						this._snapshotWidth = rectangleSnapshotWidth;
					}
				}
				else
				{
					if(rectangleSnapshotWidth > this._maxTextureDimensions)
					{
						this._snapshotWidth = int(rectangleSnapshotWidth / this._maxTextureDimensions) * this._maxTextureDimensions + getNextPowerOfTwo(rectangleSnapshotWidth % this._maxTextureDimensions);
					}
					else
					{
						this._snapshotWidth = getNextPowerOfTwo(rectangleSnapshotWidth);
					}
				}
				if(canUseRectangleTexture)
				{
					if(rectangleSnapshotHeight > this._maxTextureDimensions)
					{
						this._snapshotHeight = int(rectangleSnapshotHeight / this._maxTextureDimensions) * this._maxTextureDimensions + (rectangleSnapshotHeight % this._maxTextureDimensions);
					}
					else
					{
						this._snapshotHeight = rectangleSnapshotHeight;
					}
				}
				else
				{
					if(rectangleSnapshotHeight > this._maxTextureDimensions)
					{
						this._snapshotHeight = int(rectangleSnapshotHeight / this._maxTextureDimensions) * this._maxTextureDimensions + getNextPowerOfTwo(rectangleSnapshotHeight % this._maxTextureDimensions);
					}
					else
					{
						this._snapshotHeight = getNextPowerOfTwo(rectangleSnapshotHeight);
					}
				}
				var textureRoot:ConcreteTexture = this.textSnapshot ? this.textSnapshot.texture.root : null;
				this._needsNewTexture = this._needsNewTexture || !this.textSnapshot || this._snapshotWidth != textureRoot.width || this._snapshotHeight != textureRoot.height;
				this._snapshotVisibleWidth = rectangleSnapshotWidth;
				this._snapshotVisibleHeight = rectangleSnapshotHeight;
			}

			//instead of checking sizeInvalid, which will often be triggered by
			//changing maxWidth or something for measurement, we check against
			//the previous actualWidth/Height used for the snapshot.
			if(stylesInvalid || dataInvalid || stateInvalid || this._needsNewTexture ||
				this.actualWidth != this._previousContentWidth ||
				this.actualHeight != this._previousContentHeight)
			{
				this._previousContentWidth = this.actualWidth;
				this._previousContentHeight = this.actualHeight;
				if(this._content)
				{
					this.refreshTextLines(this._textLines, this._textLineContainer, this.actualWidth, this.actualHeight);
					this.refreshSnapshot();
				}
				if(this.textSnapshot)
				{
					this.textSnapshot.visible = this._content !== null;
				}
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

			this.measure(TextBlockTextRenderer.HELPER_POINT);
			return this.setSizeInternal(TextBlockTextRenderer.HELPER_POINT.x, TextBlockTextRenderer.HELPER_POINT.y, false);
		}

		/**
		 * @private
		 */
		protected measureNativeFilters(bitmapData:BitmapData, result:Rectangle = null):Rectangle
		{
			if(!result)
			{
				result = new Rectangle();
			}
			var resultX:number = 0;
			var resultY:number = 0;
			var resultWidth:number = 0;
			var resultHeight:number = 0;
			var filterCount:number = this._nativeFilters.length;
			for(var i:number = 0; i < filterCount; i++)
			{
				var filter:BitmapFilter = this._nativeFilters[i];
				var filterRect:Rectangle = bitmapData.generateFilterRect(bitmapData.rect, filter);
				var filterX:number = filterRect.x;
				var filterY:number = filterRect.y;
				var filterWidth:number = filterRect.width;
				var filterHeight:number = filterRect.height;
				if(resultX > filterX)
				{
					resultX = filterX;
				}
				if(resultY > filterY)
				{
					resultY = filterY;
				}
				if(resultWidth < filterWidth)
				{
					resultWidth = filterWidth;
				}
				if(resultHeight < filterHeight)
				{
					resultHeight = filterHeight;
				}
			}
			result.setTo(resultX, resultY, resultWidth, resultHeight);
			return result;
		}

		/**
		 * @private
		 */
		protected createTextureOnRestoreCallback(snapshot:Image):void
		{
			var self:TextBlockTextRenderer = this;
			var texture:Texture = snapshot.texture;
			texture.root.onRestore = function():void
			{
				var bitmapData:BitmapData = self.drawTextLinesRegionToBitmapData(
					snapshot.x, snapshot.y, snapshot.width, snapshot.height);
				texture.root.uploadBitmapData(bitmapData);
			};
		}

		/**
		 * @private
		 */
		protected drawTextLinesRegionToBitmapData(textLinesX:number, textLinesY:number,
			bitmapWidth:number, bitmapHeight:number, bitmapData:BitmapData = null):BitmapData
		{
			var clipWidth:number = this._snapshotVisibleWidth - textLinesX;
			var clipHeight:number = this._snapshotVisibleHeight - textLinesY;
			if(!bitmapData || bitmapData.width != bitmapWidth || bitmapData.height != bitmapHeight)
			{
				if(bitmapData)
				{
					bitmapData.dispose();
				}
				bitmapData = new BitmapData(bitmapWidth, bitmapHeight, true, 0x00ff00ff);
			}
			else
			{
				//clear the bitmap data and reuse it
				bitmapData.fillRect(bitmapData.rect, 0x00ff00ff);
			}
			TextBlockTextRenderer.HELPER_MATRIX.tx = -textLinesX - this._textSnapshotScrollX - this._textSnapshotOffsetX;
			TextBlockTextRenderer.HELPER_MATRIX.ty = -textLinesY - this._textSnapshotScrollY - this._textSnapshotOffsetY;
			TextBlockTextRenderer.HELPER_RECTANGLE.setTo(0, 0, clipWidth, clipHeight);
			bitmapData.draw(this._textLineContainer, TextBlockTextRenderer.HELPER_MATRIX, null, null, TextBlockTextRenderer.HELPER_RECTANGLE);
			return bitmapData;
		}

		/**
		 * @private
		 */
		protected refreshSnapshot():void
		{
			if(this._snapshotWidth == 0 || this._snapshotHeight == 0)
			{
				return;
			}
			var scaleFactor:number = Starling.contentScaleFactor;
			TextBlockTextRenderer.HELPER_MATRIX.identity();
			TextBlockTextRenderer.HELPER_MATRIX.scale(scaleFactor, scaleFactor);
			var totalBitmapWidth:number = this._snapshotWidth;
			var totalBitmapHeight:number = this._snapshotHeight;
			var xPosition:number = 0;
			var yPosition:number = 0;
			var bitmapData:BitmapData;
			var snapshotIndex:number = -1;
			do
			{
				var currentBitmapWidth:number = totalBitmapWidth;
				if(currentBitmapWidth > this._maxTextureDimensions)
				{
					currentBitmapWidth = this._maxTextureDimensions;
				}
				do
				{
					var currentBitmapHeight:number = totalBitmapHeight;
					if(currentBitmapHeight > this._maxTextureDimensions)
					{
						currentBitmapHeight = this._maxTextureDimensions;
					}
					bitmapData = this.drawTextLinesRegionToBitmapData(xPosition, yPosition,
						currentBitmapWidth, currentBitmapHeight, bitmapData);
					var newTexture:Texture;
					if(!this.textSnapshot || this._needsNewTexture)
					{
						newTexture = Texture.fromBitmapData(bitmapData, false, false, scaleFactor);
					}
					var snapshot:Image = null;
					if(snapshotIndex >= 0)
					{
						if(!this.textSnapshots)
						{
							this.textSnapshots = new Array<Image>();
						}
						else if(this.textSnapshots.length > snapshotIndex)
						{
							snapshot = this.textSnapshots[snapshotIndex]
						}
					}
					else
					{
						snapshot = this.textSnapshot;
					}

					if(!snapshot)
					{
						snapshot = new Image(newTexture);
						this.addChild(snapshot);
					}
					else
					{
						if(this._needsNewTexture)
						{
							snapshot.texture.dispose();
							snapshot.texture = newTexture;
							snapshot.readjustSize();
						}
						else
						{
							//this is faster, if we haven't resized the bitmapdata
							var existingTexture:Texture = snapshot.texture;
							existingTexture.root.uploadBitmapData(bitmapData);
						}
					}
					if(newTexture)
					{
						this.createTextureOnRestoreCallback(snapshot);
					}
					if(snapshotIndex >= 0)
					{
						this.textSnapshots[snapshotIndex] = snapshot;
					}
					else
					{
						this.textSnapshot = snapshot;
					}
					snapshot.x = xPosition / scaleFactor;
					snapshot.y = yPosition / scaleFactor;
					snapshotIndex++;
					yPosition += currentBitmapHeight;
					totalBitmapHeight -= currentBitmapHeight;
				}
				while(totalBitmapHeight > 0)
				xPosition += currentBitmapWidth;
				totalBitmapWidth -= currentBitmapWidth;
				yPosition = 0;
				totalBitmapHeight = this._snapshotHeight;
			}
			while(totalBitmapWidth > 0)
			bitmapData.dispose();
			if(this.textSnapshots)
			{
				var snapshotCount:number = this.textSnapshots.length;
				for(var i:number = snapshotIndex; i < snapshotCount; i++)
				{
					snapshot = this.textSnapshots[i];
					snapshot.texture.dispose();
					snapshot.removeFromParent(true);
				}
				if(snapshotIndex == 0)
				{
					this.textSnapshots = null;
				}
				else
				{
					this.textSnapshots.length = snapshotIndex;
				}
			}
			this._needsNewTexture = false;
		}

		/**
		 * @private
		 */
		protected refreshTextLines(textLines:TextLine[], textLineParent:DisplayObjectContainer, width:number, height:number):void
		{
			if(this._textElement)
			{
				if(this._text)
				{
					this._textElement.text = this._text;
					if(this._text !== null && this._text.charAt(this._text.length - 1) == " ")
					{
						//add an invisible control character because FTE apparently
						//doesn't think that it's important to include trailing
						//spaces in its width measurement.
						this._textElement.text += String.fromCharCode(3);
					}
				}
				else
				{
					//similar to above. this hack ensures that the baseline is
					//measured properly when the text is an empty string.
					this._textElement.text = String.fromCharCode(3);
				}
			}
			TextBlockTextRenderer.HELPER_TEXT_LINES.length = 0;
			var yPosition:number = 0;
			var lineCount:number = textLines.length;
			var lastLine:TextLine;
			var cacheIndex:number = lineCount;
			for(var i:number = 0; i < lineCount; i++)
			{
				var line:TextLine = textLines[i];
				if(line.validity === TextLineValidity.VALID)
				{
					lastLine = line;
					textLines[i] = line;
					continue;
				}
				else
				{
					line = lastLine;
					if(lastLine)
					{
						yPosition = lastLine.y;
						//we're using this value in the next loop
						lastLine = null;
					}
					cacheIndex = i;
					break;
				}
			}
			//copy the invalid text lines over to the helper vector so that we
			//can reuse them
			for(; i < lineCount; i++)
			{
				TextBlockTextRenderer.HELPER_TEXT_LINES[int(i - cacheIndex)] = textLines[i];
			}
			textLines.length = cacheIndex;

			if(width >= 0)
			{
				var lineStartIndex:number = 0;
				var canTruncate:boolean = this._truncateToFit && this._textElement && !this._wordWrap;
				var pushIndex:number = textLines.length;
				var inactiveTextLineCount:number = TextBlockTextRenderer.HELPER_TEXT_LINES.length;
				while(true)
				{
					this._truncationOffset = 0;
					var previousLine:TextLine = line;
					var lineWidth:number = width;
					if(!this._wordWrap)
					{
						lineWidth = TextBlockTextRenderer.MAX_TEXT_LINE_WIDTH;
					}
					if(inactiveTextLineCount > 0)
					{
						var inactiveLine:TextLine = TextBlockTextRenderer.HELPER_TEXT_LINES[0];
						line = this.textBlock.recreateTextLine(inactiveLine, previousLine, lineWidth, 0, true);
						if(line)
						{
							TextBlockTextRenderer.HELPER_TEXT_LINES.shift();
							inactiveTextLineCount--;
						}
					}
					else
					{
						line = this.textBlock.createTextLine(previousLine, lineWidth, 0, true);
						if(line)
						{
							textLineParent.addChild(line);
						}
					}
					if(!line)
					{
						//end of text
						break;
					}
					var lineLength:number = line.rawTextLength;
					var isTruncated:boolean = false;
					var difference:number = 0;
					while(canTruncate && (difference = line.width - width) > TextBlockTextRenderer.FUZZY_TRUNCATION_DIFFERENCE)
					{
						isTruncated = true;
						if(this._truncationOffset == 0)
						{
							//this will quickly skip all of the characters after
							//the maximum width of the line, instead of going
							//one by one.
							var endIndex:number = line.getAtomIndexAtPoint(width, 0);
							if(endIndex >= 0)
							{
								this._truncationOffset = line.rawTextLength - endIndex;
							}
						}
						this._truncationOffset++;
						var truncatedTextLength:number = lineLength - this._truncationOffset;
						//we want to start at this line so that the previous
						//lines don't become invalid.
						this._textElement.text = this._text.substr(lineStartIndex, truncatedTextLength) + this._truncationText;
						var lineBreakIndex:number = this._text.indexOf(TextBlockTextRenderer.LINE_FEED, lineStartIndex);
						if(lineBreakIndex < 0)
						{
							lineBreakIndex = this._text.indexOf(TextBlockTextRenderer.CARRIAGE_RETURN, lineStartIndex);
						}
						if(lineBreakIndex >= 0)
						{
							this._textElement.text += this._text.substr(lineBreakIndex);
						}
						line = this.textBlock.recreateTextLine(line, null, lineWidth, 0, true);
						if(truncatedTextLength <= 0)
						{
							break;
						}
					}
					if(pushIndex > 0)
					{
						yPosition += this._leading;
					}
					yPosition += line.ascent;
					line.y = yPosition;
					yPosition += line.descent;
					textLines[pushIndex] = line;
					pushIndex++;
					lineStartIndex += lineLength;
				}
			}

			this.alignTextLines(textLines, width, this._textAlign);

			inactiveTextLineCount = TextBlockTextRenderer.HELPER_TEXT_LINES.length;
			for(i = 0; i < inactiveTextLineCount; i++)
			{
				line = TextBlockTextRenderer.HELPER_TEXT_LINES[i];
				textLineParent.removeChild(line);
			}
			TextBlockTextRenderer.HELPER_TEXT_LINES.length = 0;
		}

		/**
		 * @private
		 */
		protected alignTextLines(textLines:TextLine[], width:number, textAlign:string):void
		{
			var lineCount:number = textLines.length;
			for(var i:number = 0; i < lineCount; i++)
			{
				var line:TextLine = textLines[i];
				if(textAlign == TextBlockTextRenderer.TEXT_ALIGN_CENTER)
				{
					line.x = (width - line.width) / 2;
				}
				else if(textAlign == TextBlockTextRenderer.TEXT_ALIGN_RIGHT)
				{
					line.x = width - line.width;
				}
				else
				{
					line.x = 0;
				}
			}
		}
	}
}
