/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import TextFieldViewPort = feathers.controls.supportClasses.TextFieldViewPort;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import AntiAliasType = flash.text.AntiAliasType;
	import GridFitType = flash.text.GridFitType;
	import StyleSheet = flash.text.StyleSheet;
	import TextFormat = flash.text.TextFormat;

	import Event = starling.events.Event;

	/**
	 * Dispatched when an anchor (<code>&lt;a&gt;</code>) element in the HTML
	 * text is triggered when the <code>href</code> attribute begins with
	 * <code>"event:"</code>. This event is dispatched when the internal
	 * <code>flash.text.TextField</code> dispatches its own
	 * <code>TextEvent.LINK</code>.
	 *
	 * <p>The <code>data</code> property of the <code>Event</code> object that
	 * is dispatched by the <code>ScrollText</code> contains the value of the
	 * <code>text</code> property of the <code>TextEvent</code> that is
	 * dispatched by the <code>flash.text.TextField</code>.</p>
	 *
	 * <p>The following example listens for <code>Event.TRIGGERED</code> on a
	 * <code>ScrollText</code> component:</p>
	 *
	 * <listing version="3.0">
	 * var scrollText:ScrollText = new ScrollText();
	 * scrollText.text = "&lt;a href=\"event:hello\"&gt;Hello&lt;/a&gt; World";
	 * scrollText.addEventListener( Event.TRIGGERED, scrollText_triggeredHandler );
	 * this.addChild( scrollText );</listing>
	 *
	 * <p>The following example shows a listener for <code>Event.TRIGGERED</code>:</p>
	 *
	 * <listing version="3.0">
	 * function scrollText_triggeredHandler(event:Event):void
	 * {
	 *     trace( event.data ); //hello
	 * }</listing>
	 *
	 * @eventType starling.events.Event.TRIGGERED
	 *
	 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/events/TextEvent.html#LINK flash.events.TextEvent.LINK
	 */
	/*[Event(name="triggered",type="starling.events.Event")]*/

	/**
	 * Displays long passages of text in a scrollable container using the
	 * runtime's software-based <code>flash.text.TextField</code> as an overlay
	 * above Starling content on the classic display list. This component will
	 * <strong>always</strong> appear above Starling content. The only way to
	 * put something above ScrollText is to put something above it on the
	 * classic display list.
	 *
	 * <p>Meant as a workaround component for when TextFieldTextRenderer runs
	 * into the runtime texture limits.</p>
	 *
	 * <p>Since this component is rendered with the runtime's software renderer,
	 * rather than on the GPU, it may not perform very well on mobile devices
	 * with high resolution screens.</p>
	 *
	 * <p>The following example displays some text:</p>
	 *
	 * <listing version="3.0">
	 * var scrollText:ScrollText = new ScrollText();
	 * scrollText.text = "Hello World";
	 * this.addChild( scrollText );</listing>
	 *
	 * @see ../../../help/scroll-text.html How to use the Feathers ScrollText component
	 * @see feathers.controls.text.TextFieldTextRenderer
	 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html flash.text.TextField
	 */
	export class ScrollText extends Scroller
	{
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
		 * The default <code>IStyleProvider</code> for all <code>ScrollText</code>
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
			this.textViewPort = new TextFieldViewPort();
			this.textViewPort.addEventListener(Event.TRIGGERED, this.textViewPort_triggeredHandler);
			this.viewPort = this.textViewPort;
		}

		/**
		 * @private
		 */
		protected textViewPort:TextFieldViewPort;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return ScrollText.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _text:string = "";

		/**
		 * The text to display. If <code>isHTML</code> is <code>true</code>, the
		 * text will be rendered as HTML with the same capabilities as the
		 * <code>htmlText</code> property of <code>flash.text.TextField</code>.
		 *
		 * <p>In the following example, some text is displayed:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.text = "Hello World";</listing>
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
		protected _isHTML:boolean = false;

		/**
		 * Determines if the TextField should display the text as HTML or not.
		 *
		 * <p>In the following example, some HTML-formatted text is displayed:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.isHTML = true;
		 * scrollText.text = "&lt;b&gt;Hello&lt;/b&gt; &lt;i&gt;World&lt;/i&gt;";</listing>
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
		 * <p>In the following example, the text is formatted:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.textFormat = new TextFormat( "_sans", 16, 0x333333 );</listing>
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
		 * textRenderer.disabledTextFormat = new TextFormat( "_sans", 16, 0xcccccc );</listing>
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
		 * scrollText.styleSheet = style;
		 * scrollText.isHTML = true;
		 * scrollText.text = "&lt;body&gt;&lt;span class='heading'&gt;Hello&lt;/span&gt; World...&lt;/body&gt;";</listing>
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
		 * <p>In the following example, some text is formatted with an embedded
		 * font:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333;
		 * scrollText.embedFonts = true;</listing>
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
		 * scrollText.background = true;
		 * scrollText.backgroundColor = 0xff0000;</listing>
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
		 * scrollText.background = true;
		 * scrollText.backgroundColor = 0xff000ff;</listing>
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
		 * <p>In the following example, the border is enabled:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.border = true;
		 * scrollText.borderColor = 0xff0000;</listing>
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
		 * scrollText.border = true;
		 * scrollText.borderColor = 0xff00ff;</listing>
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
		 * scrollText.condenseWhite = true;</listing>
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
		 * scrollText.displayAsPassword = true;</listing>
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
		 * scrollText.gridFitType = GridFitType.SUBPIXEL;</listing>
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
		 * scrollText.sharpness = 200;</listing>
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
		 * scrollText.thickness = 100;</listing>
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
		/*override*/ public get padding():number
		{
			return this._textPaddingTop;
		}

		//no setter for padding because the one in Scroller is acceptable

		/**
		 * @private
		 */
		protected _textPaddingTop:number = 0;

		/**
		 * The minimum space, in pixels, between the component's top edge and
		 * the top edge of the text.
		 *
		 * <p>In the following example, the top padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.paddingTop = 20;</listing>
		 *
		 * @default 0
		 */
		/*override*/ public get paddingTop():number
		{
			return this._textPaddingTop;
		}

		/**
		 * @private
		 */
		/*override*/ public set paddingTop(value:number)
		{
			if(this._textPaddingTop == value)
			{
				return;
			}
			this._textPaddingTop = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _textPaddingRight:number = 0;

		/**
		 * The minimum space, in pixels, between the component's right edge and
		 * the right edge of the text.
		 *
		 * <p>In the following example, the right padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.paddingRight = 20;</listing>
		 */
		/*override*/ public get paddingRight():number
		{
			return this._textPaddingRight;
		}

		/**
		 * @private
		 */
		/*override*/ public set paddingRight(value:number)
		{
			if(this._textPaddingRight == value)
			{
				return;
			}
			this._textPaddingRight = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _textPaddingBottom:number = 0;

		/**
		 * The minimum space, in pixels, between the component's bottom edge and
		 * the bottom edge of the text.
		 *
		 * <p>In the following example, the bottom padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.paddingBottom = 20;</listing>
		 */
		/*override*/ public get paddingBottom():number
		{
			return this._textPaddingBottom;
		}

		/**
		 * @private
		 */
		/*override*/ public set paddingBottom(value:number)
		{
			if(this._textPaddingBottom == value)
			{
				return;
			}
			this._textPaddingBottom = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _textPaddingLeft:number = 0;

		/**
		 * The minimum space, in pixels, between the component's left edge and
		 * the left edge of the text.
		 *
		 * <p>In the following example, the left padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scrollText.paddingLeft = 20;</listing>
		 */
		/*override*/ public get paddingLeft():number
		{
			return this._textPaddingLeft;
		}

		/**
		 * @private
		 */
		/*override*/ public set paddingLeft(value:number)
		{
			if(this._textPaddingLeft == value)
			{
				return;
			}
			this._textPaddingLeft = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _visible:boolean = true;

		/**
		 * @private
		 */
		/*override*/ public get visible():boolean
		{
			return this._visible;
		}

		/**
		 * @private
		 */
		/*override*/ public set visible(value:boolean)
		{
			if(this._visible == value)
			{
				return;
			}
			this._visible = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _alpha:number = 1;

		/**
		 * @private
		 */
		/*override*/ public get alpha():number
		{
			return this._alpha;
		}

		/**
		 * @private
		 */
		/*override*/ public set alpha(value:number)
		{
			if(this._alpha == value)
			{
				return;
			}
			this._alpha = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		/*override*/ public get hasVisibleArea():boolean
		{
			return true;
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);

			if(dataInvalid)
			{
				this.textViewPort.text = this._text;
				this.textViewPort.isHTML = this._isHTML;
			}

			if(stylesInvalid)
			{
				this.textViewPort.antiAliasType = this._antiAliasType;
				this.textViewPort.background = this._background;
				this.textViewPort.backgroundColor = this._backgroundColor;
				this.textViewPort.border = this._border;
				this.textViewPort.borderColor = this._borderColor;
				this.textViewPort.condenseWhite = this._condenseWhite;
				this.textViewPort.displayAsPassword = this._displayAsPassword;
				this.textViewPort.gridFitType = this._gridFitType;
				this.textViewPort.sharpness = this._sharpness;
				this.textViewPort.thickness = this._thickness;
				this.textViewPort.textFormat = this._textFormat;
				this.textViewPort.disabledTextFormat = this._disabledTextFormat;
				this.textViewPort.styleSheet = this._styleSheet;
				this.textViewPort.embedFonts = this._embedFonts;
				this.textViewPort.paddingTop = this._textPaddingTop;
				this.textViewPort.paddingRight = this._textPaddingRight;
				this.textViewPort.paddingBottom = this._textPaddingBottom;
				this.textViewPort.paddingLeft = this._textPaddingLeft;
				this.textViewPort.visible = this._visible;
				this.textViewPort.alpha = this._alpha;
			}

			super.draw();
		}

		/**
		 * @private
		 */
		protected textViewPort_triggeredHandler(event:Event, link:string):void
		{
			this.dispatchEventWith(Event.TRIGGERED, false, link);
		}
	}
}
