/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import ITextBaselineControl = feathers.core.ITextBaselineControl;
	import ITextRenderer = feathers.core.ITextRenderer;
	import PropertyProxy = feathers.core.PropertyProxy;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Point = flash.geom.Point;

	import DisplayObject = starling.display.DisplayObject;

	/**
	 * Displays text using a text renderer.
	 *
	 * @see ../../../help/label.html How to use the Feathers Label component
	 * @see ../../../help/text-renderers.html Introduction to Feathers text renderers
	 */
	export class Label extends FeathersControl implements ITextBaselineControl
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * An alternate style name to use with <code>Label</code> to allow a
		 * theme to give it a larger style meant for headings. If a theme does
		 * not provide a style for a heading label, the theme will automatically
		 * fall back to using the default style for a label.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the heading style is applied to a label:</p>
		 *
		 * <listing version="3.0">
		 * var label:Label = new Label();
		 * label.text = "Very Important Heading";
		 * label.styleNameList.add( Label.ALTERNATE_STYLE_NAME_HEADING );
		 * this.addChild( label );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_HEADING:string = "feathers-heading-label";

		/**
		 * DEPRECATED: Replaced by <code>Label.ALTERNATE_STYLE_NAME_HEADING</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Label#ALTERNATE_STYLE_NAME_HEADING
		 */
		public static ALTERNATE_NAME_HEADING:string = Label.ALTERNATE_STYLE_NAME_HEADING;

		/**
		 * An alternate style name to use with <code>Label</code> to allow a
		 * theme to give it a smaller style meant for less-important details. If
		 * a theme does not provide a style for a detail label, the theme will
		 * automatically fall back to using the default style for a label.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the detail style is applied to a label:</p>
		 *
		 * <listing version="3.0">
		 * var label:Label = new Label();
		 * label.text = "Less important, detailed text";
		 * label.styleNameList.add( Label.ALTERNATE_STYLE_NAME_DETAIL );
		 * this.addChild( label );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_DETAIL:string = "feathers-detail-label";

		/**
		 * DEPRECATED: Replaced by <code>Label.ALTERNATE_STYLE_NAME_DETAIL</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Label#ALTERNATE_STYLE_NAME_DETAIL
		 */
		public static ALTERNATE_NAME_DETAIL:string = Label.ALTERNATE_STYLE_NAME_DETAIL;

		/**
		 * The default <code>IStyleProvider</code> for all <code>Label</code>
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
		 * The text renderer.
		 *
		 * @see #createTextRenderer()
		 * @see #textRendererFactory
		 */
		protected textRenderer:ITextRenderer;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Label.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _text:string = null;

		/**
		 * The text displayed by the label.
		 *
		 * <p>In the following example, the label's text is updated:</p>
		 *
		 * <listing version="3.0">
		 * label.text = "Hello World";</listing>
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
		protected _wordWrap:boolean = false;

		/**
		 * Determines if the text wraps to the next line when it reaches the
		 * width of the component.
		 *
		 * <p>In the following example, the label's text is wrapped:</p>
		 *
		 * <listing version="3.0">
		 * label.wordWrap = true;</listing>
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
		 * The baseline measurement of the text, in pixels.
		 */
		public get baseline():number
		{
			if(!this.textRenderer)
			{
				return 0;
			}
			return this.textRenderer.y + this.textRenderer.baseline;
		}

		/**
		 * @private
		 */
		protected _textRendererFactory:Function;

		/**
		 * A function used to instantiate the label's text renderer
		 * sub-component. By default, the label will use the global text
		 * renderer factory, <code>FeathersControl.defaultTextRendererFactory()</code>,
		 * to create the text renderer. The text renderer must be an instance of
		 * <code>ITextRenderer</code>. This factory can be used to change
		 * properties on the text renderer when it is first created. For
		 * instance, if you are skinning Feathers components without a theme,
		 * you might use this factory to style the text renderer.
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>In the following example, a custom text renderer factory is passed
		 * to the label:</p>
		 *
		 * <listing version="3.0">
		 * label.textRendererFactory = function():ITextRenderer
		 * {
		 *     return new TextFieldTextRenderer();
		 * }</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 */
		public get textRendererFactory():Function
		{
			return this._textRendererFactory;
		}

		/**
		 * @private
		 */
		public set textRendererFactory(value:Function)
		{
			if(this._textRendererFactory == value)
			{
				return;
			}
			this._textRendererFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}

		/**
		 * @private
		 */
		protected _textRendererProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the text renderer. The
		 * text renderer is an <code>ITextRenderer</code> instance. The
		 * available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>textRendererFactory</code>. The
		 * most common implementations are <code>BitmapFontTextRenderer</code>
		 * and <code>TextFieldTextRenderer</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>textRendererFactory</code> function
		 * instead of using <code>textRendererProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the label's text renderer's properties
		 * are updated (this example assumes that the label text renderer is a
		 * <code>TextFieldTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * label.textRendererProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 * label.textRendererProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see #textRendererFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get textRendererProperties():Object
		{
			if(!this._textRendererProperties)
			{
				this._textRendererProperties = new PropertyProxy(this.textRendererProperties_onChange);
			}
			return this._textRendererProperties;
		}

		/**
		 * @private
		 */
		public set textRendererProperties(value:Object)
		{
			if(this._textRendererProperties == value)
			{
				return;
			}
			if(value && !(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			if(this._textRendererProperties)
			{
				this._textRendererProperties.removeOnChangeCallback(this.textRendererProperties_onChange);
			}
			this._textRendererProperties = PropertyProxy(value);
			if(this._textRendererProperties)
			{
				this._textRendererProperties.addOnChangeCallback(this.textRendererProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected originalBackgroundWidth:number = NaN;

		/**
		 * @private
		 */
		protected originalBackgroundHeight:number = NaN;

		/**
		 * @private
		 */
		protected currentBackgroundSkin:DisplayObject;

		/**
		 * @private
		 */
		protected _backgroundSkin:DisplayObject;

		/**
		 * The default background to display behind the label's text.
		 *
		 * <p>In the following example, the label is given a background skin:</p>
		 *
		 * <listing version="3.0">
		 * label.backgroundSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundSkin():DisplayObject
		{
			return this._backgroundSkin;
		}

		/**
		 * @private
		 */
		public set backgroundSkin(value:DisplayObject)
		{
			if(this._backgroundSkin == value)
			{
				return;
			}

			if(this._backgroundSkin && this.currentBackgroundSkin == this._backgroundSkin)
			{
				this.removeChild(this._backgroundSkin);
				this.currentBackgroundSkin = null;
			}
			this._backgroundSkin = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _backgroundDisabledSkin:DisplayObject;

		/**
		 * A background to display when the label is disabled.
		 *
		 * <p>In the following example, the label is given a disabled background skin:</p>
		 *
		 * <listing version="3.0">
		 * label.backgroundDisabledSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundDisabledSkin():DisplayObject
		{
			return this._backgroundDisabledSkin;
		}

		/**
		 * @private
		 */
		public set backgroundDisabledSkin(value:DisplayObject)
		{
			if(this._backgroundDisabledSkin == value)
			{
				return;
			}

			if(this._backgroundDisabledSkin && this.currentBackgroundSkin == this._backgroundDisabledSkin)
			{
				this.removeChild(this._backgroundDisabledSkin);
				this.currentBackgroundSkin = null;
			}
			this._backgroundDisabledSkin = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * label.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the label's top edge and the
		 * label's text.
		 *
		 * <p>In the following example, the top padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * label.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the label's right edge and
		 * the label's text.
		 *
		 * <p>In the following example, the right padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * label.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the label's bottom edge and
		 * the label's text.
		 *
		 * <p>In the following example, the bottom padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * label.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the label's left edge and the
		 * label's text.
		 *
		 * <p>In the following example, the left padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * label.paddingLeft = 20;</listing>
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
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var textRendererInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_TEXT_RENDERER);

			if(sizeInvalid || stylesInvalid || stateInvalid)
			{
				this.refreshBackgroundSkin();
			}

			if(textRendererInvalid)
			{
				this.createTextRenderer();
			}

			if(textRendererInvalid || dataInvalid || stateInvalid)
			{
				this.refreshTextRendererData();
			}

			if(textRendererInvalid || stateInvalid)
			{
				this.refreshEnabled();
			}

			if(textRendererInvalid || stylesInvalid || stateInvalid)
			{
				this.refreshTextRendererStyles();
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			this.layoutChildren();
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
			this.textRenderer.minWidth = this._minWidth - this._paddingLeft - this._paddingRight;
			this.textRenderer.maxWidth = this._maxWidth - this._paddingLeft - this._paddingRight;
			this.textRenderer.width = this.explicitWidth - this._paddingLeft - this._paddingRight;
			this.textRenderer.minHeight = this._minHeight - this._paddingTop - this._paddingBottom;
			this.textRenderer.maxHeight = this._maxHeight - this._paddingTop - this._paddingBottom;
			this.textRenderer.height = this.explicitHeight - this._paddingTop - this._paddingBottom;
			this.textRenderer.measureText(Label.HELPER_POINT);
			var newWidth:number = this.explicitWidth;
			if(needsWidth)
			{
				if(this._text)
				{
					newWidth = Label.HELPER_POINT.x;
				}
				else
				{
					newWidth = 0;
				}
				if(this.originalBackgroundWidth === this.originalBackgroundWidth &&
					this.originalBackgroundWidth > newWidth) //!isNaN
				{
					newWidth = this.originalBackgroundWidth;
				}
				newWidth += this._paddingLeft + this._paddingRight;
			}

			var newHeight:number = this.explicitHeight;
			if(needsHeight)
			{
				if(this._text)
				{
					newHeight = Label.HELPER_POINT.y;
				}
				else
				{
					newHeight = 0;
				}
				if(this.originalBackgroundHeight === this.originalBackgroundHeight &&
					this.originalBackgroundHeight > newHeight) //!isNaN
				{
					newHeight = this.originalBackgroundHeight;
				}
				newHeight += this._paddingTop + this._paddingBottom;
			}

			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates and adds the <code>textRenderer</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #textRenderer
		 * @see #textRendererFactory
		 */
		protected createTextRenderer():void
		{
			if(this.textRenderer)
			{
				this.removeChild(DisplayObject(this.textRenderer), true);
				this.textRenderer = null;
			}

			var factory:Function = this._textRendererFactory != null ? this._textRendererFactory : FeathersControl.defaultTextRendererFactory;
			this.textRenderer = ITextRenderer(factory());
			this.addChild(DisplayObject(this.textRenderer));
		}

		/**
		 * Choose the appropriate background skin based on the control's current
		 * state.
		 */
		protected refreshBackgroundSkin():void
		{
			var newCurrentBackgroundSkin:DisplayObject = this._backgroundSkin;
			if(!this._isEnabled && this._backgroundDisabledSkin)
			{
				newCurrentBackgroundSkin = this._backgroundDisabledSkin;
			}
			if(this.currentBackgroundSkin != newCurrentBackgroundSkin)
			{
				if(this.currentBackgroundSkin)
				{
					this.removeChild(this.currentBackgroundSkin);
				}
				this.currentBackgroundSkin = newCurrentBackgroundSkin;
				if(this.currentBackgroundSkin)
				{
					this.addChildAt(this.currentBackgroundSkin, 0);
				}
			}
			if(this.currentBackgroundSkin)
			{
				//force it to the bottom
				this.setChildIndex(this.currentBackgroundSkin, 0);

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

		/**
		 * Positions and sizes children based on the actual width and height
		 * values.
		 */
		protected layoutChildren():void
		{
			if(this.currentBackgroundSkin)
			{
				this.currentBackgroundSkin.x = 0;
				this.currentBackgroundSkin.y = 0;
				this.currentBackgroundSkin.width = this.actualWidth;
				this.currentBackgroundSkin.height = this.actualHeight;
			}
			this.textRenderer.x = this._paddingLeft;
			this.textRenderer.y = this._paddingTop;
			this.textRenderer.width = this.actualWidth - this._paddingLeft - this._paddingRight;
			this.textRenderer.height = this.actualHeight - this._paddingTop - this._paddingBottom;
			this.textRenderer.validate();
		}

		/**
		 * @private
		 */
		protected refreshEnabled():void
		{
			this.textRenderer.isEnabled = this._isEnabled;
		}

		/**
		 * @private
		 */
		protected refreshTextRendererData():void
		{
			this.textRenderer.text = this._text;
			this.textRenderer.visible = this._text && this._text.length > 0;
		}

		/**
		 * @private
		 */
		protected refreshTextRendererStyles():void
		{
			this.textRenderer.wordWrap = this._wordWrap;
			for(var propertyName:string in this._textRendererProperties)
			{
				var propertyValue:Object = this._textRendererProperties[propertyName];
				this.textRenderer[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected textRendererProperties_onChange(proxy:PropertyProxy, propertyName:string):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
	}
}
