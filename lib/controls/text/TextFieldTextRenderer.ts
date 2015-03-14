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
	import Context3DProfile = flash.display3D.Context3DProfile;
	import BitmapFilter = flash.filters.BitmapFilter;
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
	import Image = starling.display.Image;
	import Event = starling.events.Event;
	import ConcreteTexture = starling.textures.ConcreteTexture;
	import Texture = starling.textures.Texture;
	import getNextPowerOfTwo = starling.utils.getNextPowerOfTwo;

	/**
	 * Renders text with a native <code>flash.text.TextField</code> and draws
	 * it to <code>BitmapData</code> to convert to Starling textures. Textures
	 * are completely managed by this component, and they will be automatically
	 * disposed when the component is disposed.
	 *
	 * <p>For longer passages of text, this component will stitch together
	 * multiple individual textures both horizontally and vertically, as a grid,
	 * if required. This may require quite a lot of texture memory, possibly
	 * exceeding the limits of some mobile devices, so use this component with
	 * caution when displaying a lot of text.</p>
	 *
	 * @see ../../../help/text-renderers.html Introduction to Feathers text renderers
	 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html flash.text.TextField
	 */
	export class TextFieldTextRenderer extends FeathersControl implements ITextRenderer
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
		 * The default <code>IStyleProvider</code> for all <code>TextFieldTextRenderer</code>
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
		 * The TextField instance used to render the text before taking a
		 * texture snapshot.
		 */
		protected textField:TextField;

		/**
		 * An image that displays a snapshot of the native <code>TextField</code>
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
		protected _textSnapshotOffsetX:number = 0;

		/**
		 * @private
		 */
		protected _textSnapshotOffsetY:number = 0;

		/**
		 * @private
		 */
		protected _previousActualWidth:number = NaN;

		/**
		 * @private
		 */
		protected _previousActualHeight:number = NaN;

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
		protected _hasMeasured:boolean = false;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return TextFieldTextRenderer.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _text:string = "";

		/**
		 * @inheritDoc
		 *
		 * <p>In the following example, the text is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.text = "Lorem ipsum";</listing>
		 *
		 * @default ""
		 *
		 * @see #isHTML
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
			if(value === null)
			{
				//flash.text.TextField won't accept a null value
				value = "";
			}
			this._text = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _isHTML:boolean = false;

		/**
		 * Determines if the TextField should display the text as HTML or not.
		 *
		 * <p>In the following example, the text is displayed as HTML:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.isHTML = true;
		 * textRenderer.text = "&lt;span class='heading'&gt;hello&lt;/span&gt; world!";</listing>
		 *
		 * @default false
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#htmlText flash.text.TextField.htmlText
		 * @see #text
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
		protected _textFormat:TextFormat;

		/**
		 * The font and styles used to draw the text.
		 *
		 * <p>In the following example, the text format is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.textFormat = new TextFormat( "Source Sans Pro" );</listing>
		 *
		 * @default null
		 *
		 * @see #disabledTextFormat
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextFormat.html flash.text.TextFormat
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
		protected _disabledTextFormat:TextFormat;

		/**
		 * The font and styles used to draw the text when the component is disabled.
		 *
		 * <p>In the following example, the disabled text format is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.isEnabled = false;
		 * textRenderer.disabledTextFormat = new TextFormat( "Source Sans Pro" );</listing>
		 *
		 * @default null
		 *
		 * @see #textFormat
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextFormat.html flash.text.TextFormat
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
		 * The <code>StyleSheet</code> object to pass to the TextField.
		 *
		 * <p>In the following example, a style sheet is applied:</p>
		 *
		 * <listing version="3.0">
		 * var style:StyleSheet = new StyleSheet();
		 * var heading:Object = new Object();
		 * heading.fontWeight = "bold";
		 * heading.color = "#FF0000";
		 *
		 * var body:Object = new Object();
		 * body.fontStyle = "italic";
		 *
		 * style.setStyle(".heading", heading);
		 * style.setStyle("body", body);
		 *
		 * textRenderer.styleSheet = style;
		 * textRenderer.isHTML = true;
		 * textRenderer.text = "&lt;body&gt;&lt;span class='heading'&gt;Hello&lt;/span&gt; World...&lt;/body&gt;";</listing>
		 *
		 * @default null
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#styleSheet Full description of flash.text.TextField.styleSheet in Adobe's Flash Platform API Reference
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/StyleSheet.html flash.text.StyleSheet
		 * @see #isHTML
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
		protected _embedFonts:boolean = false;

		/**
		 * Determines if the TextField should use an embedded font or not. If
		 * the specified font is not embedded, the text is not displayed.
		 *
		 * <p>In the following example, the font is embedded:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.embedFonts = true;</listing>
		 *
		 * @default false
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#embedFonts Full description of flash.text.TextField.embedFonts in Adobe's Flash Platform API Reference
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
		 * @inheritDoc
		 */
		public get baseline():number
		{
			if(!this.textField)
			{
				return 0;
			}
			var gutterDimensionsOffset:number = 0;
			if(this._useGutter)
			{
				gutterDimensionsOffset = 2;
			}
			return gutterDimensionsOffset + this.textField.getLineMetrics(0).ascent;
		}

		/**
		 * @private
		 */
		protected _wordWrap:boolean = false;

		/**
		 * Determines if the TextField wraps text to the next line.
		 *
		 * <p>In the following example, word wrap is enabled:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.wordWrap = true;</listing>
		 *
		 * @default false
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#wordWrap Full description of flash.text.TextField.wordWrap in Adobe's Flash Platform API Reference
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
		private _antiAliasType:string = AntiAliasType.ADVANCED;

		/**
		 * The type of anti-aliasing used for this text field, defined as
		 * constants in the <code>flash.text.AntiAliasType</code> class.
		 *
		 * <p>In the following example, the anti-alias type is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.antiAliasType = AntiAliasType.NORMAL;</listing>
		 *
		 * @default flash.text.AntiAliasType.ADVANCED
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#antiAliasType Full description of flash.text.TextField.antiAliasType in Adobe's Flash Platform API Reference
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/AntiAliasType.html flash.text.AntiAliasType
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
		 * Specifies whether the text field has a background fill. Use the
		 * <code>backgroundColor</code> property to set the background color of
		 * a text field.
		 *
		 * <p>In the following example, the background is enabled:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.background = true;
		 * textRenderer.backgroundColor = 0xff0000;</listing>
		 *
		 * @default false
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#background Full description of flash.text.TextField.background in Adobe's Flash Platform API Reference
		 * @see #backgroundColor
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
		 * The color of the text field background that is displayed if the
		 * <code>background</code> property is set to <code>true</code>.
		 *
		 * <p>In the following example, the background color is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.background = true;
		 * textRenderer.backgroundColor = 0xff000ff;</listing>
		 *
		 * @default 0xffffff
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#backgroundColor Full description of flash.text.TextField.backgroundColor in Adobe's Flash Platform API Reference
		 * @see #background
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
		 * Specifies whether the text field has a border. Use the
		 * <code>borderColor</code> property to set the border color.
		 *
		 * <p>Note: this property cannot be used when the <code>useGutter</code>
		 * property is set to <code>false</code> (the default value!).</p>
		 *
		 * <p>In the following example, the border is enabled:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.border = true;
		 * textRenderer.borderColor = 0xff0000;</listing>
		 *
		 * @default false
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#border Full description of flash.text.TextField.border in Adobe's Flash Platform API Reference
		 * @see #borderColor
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
		 * The color of the text field border that is displayed if the
		 * <code>border</code> property is set to <code>true</code>.
		 *
		 * <p>In the following example, the border color is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.border = true;
		 * textRenderer.borderColor = 0xff00ff;</listing>
		 *
		 * @default 0x000000
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#borderColor Full description of flash.text.TextField.borderColor in Adobe's Flash Platform API Reference
		 * @see #border
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
		 * A boolean value that specifies whether extra white space (spaces,
		 * line breaks, and so on) in a text field with HTML text is removed.
		 *
		 * <p>In the following example, whitespace is condensed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.condenseWhite = true;</listing>
		 *
		 * @default false
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#condenseWhite Full description of flash.text.TextField.condenseWhite in Adobe's Flash Platform API Reference
		 * @see #isHTML
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
		 * Specifies whether the text field is a password text field that hides
		 * the input characters using asterisks instead of the actual
		 * characters.
		 *
		 * <p>In the following example, the text is displayed as a password:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.displayAsPassword = true;</listing>
		 *
		 * @default false
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#displayAsPassword Full description of flash.text.TextField.displayAsPassword in Adobe's Flash Platform API Reference
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
		 * Determines whether Flash Player forces strong horizontal and vertical
		 * lines to fit to a pixel or subpixel grid, or not at all using the
		 * constants defined in the <code>flash.text.GridFitType</code> class.
		 * This property applies only if the <code>antiAliasType</code> property
		 * of the text field is set to <code>flash.text.AntiAliasType.ADVANCED</code>.
		 *
		 * <p>In the following example, the grid fit type is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.gridFitType = GridFitType.SUBPIXEL;</listing>
		 *
		 * @default flash.text.GridFitType.PIXEL
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#gridFitType Full description of flash.text.TextField.gridFitType in Adobe's Flash Platform API Reference
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/GridFitType.html flash.text.GridFitType
		 * @see #antiAliasType
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
		 * The sharpness of the glyph edges in this text field. This property
		 * applies only if the <code>antiAliasType</code> property of the text
		 * field is set to <code>flash.text.AntiAliasType.ADVANCED</code>. The
		 * range for <code>sharpness</code> is a number from <code>-400</code>
		 * to <code>400</code>.
		 *
		 * <p>In the following example, the sharpness is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.sharpness = 200;</listing>
		 *
		 * @default 0
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#sharpness Full description of flash.text.TextField.sharpness in Adobe's Flash Platform API Reference
		 * @see #antiAliasType
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
		 * The thickness of the glyph edges in this text field. This property
		 * applies only if the <code>antiAliasType</code> property is set to
		 * <code>flash.text.AntiAliasType.ADVANCED</code>. The range for
		 * <code>thickness</code> is a number from <code>-200</code> to
		 * <code>200</code>.
		 *
		 * <p>In the following example, the thickness is changed:</p>
		 *
		 * <listing version="3.0">
		 * textRenderer.thickness = 100;</listing>
		 *
		 * @default 0
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#thickness Full description of flash.text.TextField.thickness in Adobe's Flash Platform API Reference
		 * @see #antiAliasType
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
		 * Native filters to pass to the <code>flash.text.TextField</code>
		 * before creating the texture snapshot.
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
		protected _useGutter:boolean = false;

		/**
		 * Determines if the 2-pixel gutter around the edges of the
		 * <code>flash.text.TextField</code> will be used in measurement and
		 * layout. To visually align with other text renderers and text editors,
		 * it is often best to leave the gutter disabled.
		 *
		 * <p>In the following example, the gutter is enabled:</p>
		 *
		 * <listing version="3.0">
		 * textEditor.useGutter = true;</listing>
		 *
		 * @default false
		 */
		public get useGutter():boolean
		{
			return this._useGutter;
		}

		/**
		 * @private
		 */
		public set useGutter(value:boolean)
		{
			if(this._useGutter == value)
			{
				return;
			}
			this._useGutter = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
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
			//from being garbage collected, freeing up the text field may help
			//ease major memory pressure from native filters
			this.textField = null;

			this._previousActualWidth = NaN;
			this._previousActualHeight = NaN;

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
				this.getTransformationMatrix(this.stage, TextFieldTextRenderer.HELPER_MATRIX);
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
					offsetX += Math.round(TextFieldTextRenderer.HELPER_MATRIX.tx) - TextFieldTextRenderer.HELPER_MATRIX.tx;
					offsetY += Math.round(TextFieldTextRenderer.HELPER_MATRIX.ty) - TextFieldTextRenderer.HELPER_MATRIX.ty;
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
			if(!this.textField)
			{
				this.textField = new TextField();
				var scaleFactor:number = Starling.contentScaleFactor;
				this.textField.scaleX = scaleFactor;
				this.textField.scaleY = scaleFactor;
				this.textField.mouseEnabled = this.textField.mouseWheelEnabled = false;
				this.textField.selectable = false;
				this.textField.multiline = true;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);

			this.commit();

			this._hasMeasured = false;
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

			if(stylesInvalid)
			{
				this.textField.antiAliasType = this._antiAliasType;
				this.textField.background = this._background;
				this.textField.backgroundColor = this._backgroundColor;
				this.textField.border = this._border;
				this.textField.borderColor = this._borderColor;
				this.textField.condenseWhite = this._condenseWhite;
				this.textField.displayAsPassword = this._displayAsPassword;
				this.textField.gridFitType = this._gridFitType;
				this.textField.sharpness = this._sharpness;
				this.textField.thickness = this._thickness;
				this.textField.filters = this._nativeFilters;
			}

			if(dataInvalid || stylesInvalid || stateInvalid)
			{
				this.textField.wordWrap = this._wordWrap;
				this.textField.embedFonts = this._embedFonts;
				if(this._styleSheet)
				{
					this.textField.styleSheet = this._styleSheet;
				}
				else
				{
					this.textField.styleSheet = null;
					if(!this._isEnabled && this._disabledTextFormat)
					{
						this.textField.defaultTextFormat = this._disabledTextFormat;
					}
					else if(this._textFormat)
					{
						this.textField.defaultTextFormat = this._textFormat;
					}
				}
				if(this._isHTML)
				{
					this.textField.htmlText = this._text;
				}
				else
				{
					this.textField.text = this._text;
				}
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

			this.textField.autoSize = TextFieldAutoSize.LEFT;
			this.textField.wordWrap = false;

			var scaleFactor:number = Starling.contentScaleFactor;
			var gutterDimensionsOffset:number = 4;
			if(this._useGutter)
			{
				gutterDimensionsOffset = 0;
			}

			var newWidth:number = this.explicitWidth;
			if(needsWidth)
			{
				//yes, this value is never used. this is a workaround for a bug
				//in AIR for iOS where getting the value for textField.width the
				//first time results in an incorrect value, but if you query it
				//again, for some reason, it reports the correct width value.
				var hackWorkaround:number = this.textField.width;
				newWidth = (this.textField.width / scaleFactor) - gutterDimensionsOffset;
				if(newWidth < this._minWidth)
				{
					newWidth = this._minWidth;
				}
				else if(newWidth > this._maxWidth)
				{
					newWidth = this._maxWidth;
				}
			}
			//and this is a workaround for an issue where flash.text.TextField
			//will wrap the last word when you pass the value returned by the
			//width getter (when TextFieldAutoSize.LEFT is used) to the width
			//setter. In other words, the value technically isn't changing, but
			//TextField behaves differently.
			if(!needsWidth || ((this.textField.width / scaleFactor) - gutterDimensionsOffset) > newWidth)
			{
				this.textField.width = newWidth + gutterDimensionsOffset;
				this.textField.wordWrap = this._wordWrap;
			}
			var newHeight:number = this.explicitHeight;
			if(needsHeight)
			{
				newHeight = (this.textField.height / scaleFactor) - gutterDimensionsOffset;
				if(newHeight < this._minHeight)
				{
					newHeight = this._minHeight;
				}
				else if(newHeight > this._maxHeight)
				{
					newHeight = this._maxHeight;
				}
			}

			this.textField.autoSize = TextFieldAutoSize.NONE;

			//put the width and height back just in case we measured without
			//a full validation
			this.textField.width = this.actualWidth + gutterDimensionsOffset;
			this.textField.height = this.actualHeight + gutterDimensionsOffset;

			result.x = newWidth;
			result.y = newHeight;

			this._hasMeasured = true;
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

			var scaleFactor:number = Starling.contentScaleFactor;
			var gutterDimensionsOffset:number = 4;
			if(this._useGutter)
			{
				gutterDimensionsOffset = 0;
			}

			//if measure() isn't called, we need to apply the same workaround
			//for the flash.text.TextField bug with wordWrap.
			if(!this._hasMeasured && this._wordWrap)
			{
				this.textField.autoSize = TextFieldAutoSize.LEFT;
				this.textField.wordWrap = false;
				if(((this.textField.width / scaleFactor) - gutterDimensionsOffset) > this.actualWidth)
				{
					this.textField.wordWrap = true;
				}
				this.textField.autoSize = TextFieldAutoSize.NONE;
				this.textField.width = this.actualWidth + gutterDimensionsOffset;
			}
			if(sizeInvalid)
			{
				this.textField.width = this.actualWidth + gutterDimensionsOffset;
				this.textField.height = this.actualHeight + gutterDimensionsOffset;
				//these are getting put into an int later, so we don't want it
				//to possibly round down and cut off part of the text. 
				var rectangleSnapshotWidth:number = Math.ceil(this.actualWidth * scaleFactor);
				var rectangleSnapshotHeight:number = Math.ceil(this.actualHeight * scaleFactor);
				if(rectangleSnapshotWidth >= 1 && rectangleSnapshotHeight >= 1 &&
					this._nativeFilters && this._nativeFilters.length > 0)
				{
					TextFieldTextRenderer.HELPER_MATRIX.identity();
					TextFieldTextRenderer.HELPER_MATRIX.scale(scaleFactor, scaleFactor);
					var bitmapData:BitmapData = new BitmapData(rectangleSnapshotWidth, rectangleSnapshotHeight, true, 0x00ff00ff);
					bitmapData.draw(this.textField, TextFieldTextRenderer.HELPER_MATRIX, null, null, TextFieldTextRenderer.HELPER_RECTANGLE);
					this.measureNativeFilters(bitmapData, TextFieldTextRenderer.HELPER_RECTANGLE);
					bitmapData.dispose();
					bitmapData = null;
					this._textSnapshotOffsetX = TextFieldTextRenderer.HELPER_RECTANGLE.x;
					this._textSnapshotOffsetY = TextFieldTextRenderer.HELPER_RECTANGLE.y;
					rectangleSnapshotWidth = TextFieldTextRenderer.HELPER_RECTANGLE.width;
					rectangleSnapshotHeight = TextFieldTextRenderer.HELPER_RECTANGLE.height;
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
				this.actualWidth != this._previousActualWidth ||
				this.actualHeight != this._previousActualHeight)
			{
				this._previousActualWidth = this.actualWidth;
				this._previousActualHeight = this.actualHeight;
				var hasText:boolean = this._text.length > 0;
				if(hasText)
				{
					//we need to wait a frame for the TextField to render
					//properly. sometimes two, and this is a known issue.
					this.addEventListener(Event.ENTER_FRAME, this.enterFrameHandler);
				}
				if(this.textSnapshot)
				{
					this.textSnapshot.visible = hasText && this._snapshotWidth > 0 && this._snapshotHeight > 0;
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

			this.measure(TextFieldTextRenderer.HELPER_POINT);
			return this.setSizeInternal(TextFieldTextRenderer.HELPER_POINT.x, TextFieldTextRenderer.HELPER_POINT.y, false);
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
			var self:TextFieldTextRenderer = this;
			var texture:Texture = snapshot.texture;
			texture.root.onRestore = function():void
			{
				var bitmapData:BitmapData = self.drawTextFieldRegionToBitmapData(
					snapshot.x, snapshot.y, snapshot.width, snapshot.height);
				texture.root.uploadBitmapData(bitmapData);
			};
		}

		/**
		 * @private
		 */
		protected drawTextFieldRegionToBitmapData(textFieldX:number, textFieldY:number,
			bitmapWidth:number, bitmapHeight:number, bitmapData:BitmapData = null):BitmapData
		{
			var scaleFactor:number = Starling.contentScaleFactor;
			var clipWidth:number = this._snapshotVisibleWidth - textFieldX;
			var clipHeight:number = this._snapshotVisibleHeight - textFieldY;
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
			var gutterPositionOffset:number = 2 * scaleFactor;
			if(this._useGutter)
			{
				gutterPositionOffset = 0;
			}
			TextFieldTextRenderer.HELPER_MATRIX.tx = -(textFieldX + gutterPositionOffset) - this._textSnapshotOffsetX;
			TextFieldTextRenderer.HELPER_MATRIX.ty = -(textFieldY + gutterPositionOffset) - this._textSnapshotOffsetY;
			TextFieldTextRenderer.HELPER_RECTANGLE.setTo(0, 0, clipWidth, clipHeight);
			bitmapData.draw(this.textField, TextFieldTextRenderer.HELPER_MATRIX, null, null, TextFieldTextRenderer.HELPER_RECTANGLE);
			return bitmapData;
		}

		/**
		 * @private
		 */
		protected refreshSnapshot():void
		{
			if(this._snapshotWidth <= 0 || this._snapshotHeight <= 0)
			{
				return;
			}
			var scaleFactor:number = Starling.contentScaleFactor;
			TextFieldTextRenderer.HELPER_MATRIX.identity();
			TextFieldTextRenderer.HELPER_MATRIX.scale(scaleFactor, scaleFactor);
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
					bitmapData = this.drawTextFieldRegionToBitmapData(xPosition, yPosition, currentBitmapWidth, currentBitmapHeight, bitmapData);
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
		protected enterFrameHandler(event:Event):void
		{
			this.removeEventListener(Event.ENTER_FRAME, this.enterFrameHandler);
			this.refreshSnapshot();
		}
	}
}
