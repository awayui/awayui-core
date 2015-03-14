/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.renderers
{
	import GroupedList = feathers.controls.GroupedList;
	import ImageLoader = feathers.controls.ImageLoader;
	import FeathersControl = feathers.core.FeathersControl;
	import IFeathersControl = feathers.core.IFeathersControl;
	import ITextRenderer = feathers.core.ITextRenderer;
	import IValidating = feathers.core.IValidating;
	import PropertyProxy = feathers.core.PropertyProxy;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import DisplayObject = starling.display.DisplayObject;

	/**
	 * The default renderer used for headers and footers in a GroupedList
	 * control.
	 *
	 * @see feathers.controls.GroupedList
	 */
	export class DefaultGroupedListHeaderOrFooterRenderer extends FeathersControl implements IGroupedListHeaderOrFooterRenderer
	{
		/**
		 * The content will be aligned horizontally to the left edge of the renderer.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * The content will be aligned horizontally to the center of the renderer.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * The content will be aligned horizontally to the right edge of the renderer.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_RIGHT:string = "right";

		/**
		 * The content will be justified horizontally, filling the entire width
		 * of the renderer, minus padding.
		 *
		 * @see #horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The content will be aligned vertically to the top edge of the renderer.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * The content will be aligned vertically to the middle of the renderer.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * The content will be aligned vertically to the bottom edge of the renderer.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * The content will be justified vertically, filling the entire height
		 * of the renderer, minus padding.
		 *
		 * @see #verticalAlign
		 */
		public static VERTICAL_ALIGN_JUSTIFY:string = "justify";

		/**
		 * The default value added to the <code>styleNameList</code> of the
		 * content label.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_CONTENT_LABEL:string = "feathers-header-footer-renderer-content-label";

		/**
		 * DEPRECATED: Replaced by <code>DefaultGroupedListHeaderOrFooterRenderer.DEFAULT_CHILD_STYLE_NAME_CONTENT_LABEL</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see DefaultGroupedListHeaderOrFooterRenderer#DEFAULT_CHILD_STYLE_NAME_CONTENT_LABEL
		 */
		public static DEFAULT_CHILD_NAME_CONTENT_LABEL:string = DefaultGroupedListHeaderOrFooterRenderer.DEFAULT_CHILD_STYLE_NAME_CONTENT_LABEL;

		/**
		 * The default <code>IStyleProvider</code> for all <code>DefaultGroupedListHeaderOrFooterRenderer</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static defaultImageLoaderFactory():ImageLoader
		{
			return new ImageLoader();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
		}

		/**
		 * The value added to the <code>styleNameList</code> of the content
		 * label text renderer.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected contentLabelStyleName:string = DefaultGroupedListHeaderOrFooterRenderer.DEFAULT_CHILD_STYLE_NAME_CONTENT_LABEL;

		/**
		 * DEPRECATED: Replaced by <code>contentLabelStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #contentLabelStyleName
		 */
		protected get contentLabelName():string
		{
			return this.contentLabelStyleName;
		}

		/**
		 * @private
		 */
		protected set contentLabelName(value:string)
		{
			this.contentLabelStyleName = value;
		}

		/**
		 * @private
		 */
		protected contentImage:ImageLoader;

		/**
		 * @private
		 */
		protected contentLabel:ITextRenderer;

		/**
		 * @private
		 */
		protected content:DisplayObject;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return DefaultGroupedListHeaderOrFooterRenderer.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _data:Object;

		/**
		 * @inheritDoc
		 */
		public get data():Object
		{
			return this._data;
		}

		/**
		 * @private
		 */
		public set data(value:Object)
		{
			if(this._data == value)
			{
				return;
			}
			this._data = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _groupIndex:number = -1;

		/**
		 * @inheritDoc
		 */
		public get groupIndex():number
		{
			return this._groupIndex;
		}

		/**
		 * @private
		 */
		public set groupIndex(value:number)
		{
			this._groupIndex = value;
		}

		/**
		 * @private
		 */
		protected _layoutIndex:number = -1;

		/**
		 * @inheritDoc
		 */
		public get layoutIndex():number
		{
			return this._layoutIndex;
		}

		/**
		 * @private
		 */
		public set layoutIndex(value:number)
		{
			this._layoutIndex = value;
		}

		/**
		 * @private
		 */
		protected _owner:GroupedList;

		/**
		 * @inheritDoc
		 */
		public get owner():GroupedList
		{
			return this._owner;
		}

		/**
		 * @private
		 */
		public set owner(value:GroupedList)
		{
			if(this._owner == value)
			{
				return;
			}
			this._owner = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _horizontalAlign:string = DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_LEFT;

		/*[Inspectable(type="String",enumeration="left,center,right,justify")]*/
		/**
		 * The location where the renderer's content is aligned horizontally
		 * (on the x-axis).
		 *
		 * <p>In the following example, the horizontal alignment is changed to
		 * right:</p>
		 *
		 * <listing version="3.0">
		 * renderer.horizontalAlign = DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_RIGHT;</listing>
		 *
		 * @default DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_LEFT
		 *
		 * @see #HORIZONTAL_ALIGN_LEFT
		 * @see #HORIZONTAL_ALIGN_CENTER
		 * @see #HORIZONTAL_ALIGN_RIGHT
		 * @see #HORIZONTAL_ALIGN_JUSTIFY
		 */
		public get horizontalAlign():string
		{
			return this._horizontalAlign;
		}

		/**
		 * @private
		 */
		public set horizontalAlign(value:string)
		{
			if(this._horizontalAlign == value)
			{
				return;
			}
			this._horizontalAlign = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _verticalAlign:string = DefaultGroupedListHeaderOrFooterRenderer.VERTICAL_ALIGN_MIDDLE;

		/*[Inspectable(type="String",enumeration="top,middle,bottom,justify")]*/
		/**
		 * The location where the renderer's content is aligned vertically (on
		 * the y-axis).
		 *
		 * <p>In the following example, the vertical alignment is changed to
		 * bottom:</p>
		 *
		 * <listing version="3.0">
		 * renderer.verticalAlign = DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_BOTTOM;</listing>
		 *
		 * @default DefaultGroupedListHeaderOrFooterRenderer.VERTICAL_ALIGN_MIDDLE
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
		 */
		protected _contentField:string = "content";

		/**
		 * The field in the item that contains a display object to be positioned
		 * in the content position of the renderer. If you wish to display a
		 * texture in the content position, it's better for performance to use
		 * <code>contentSourceField</code> instead.
		 *
		 * <p>All of the content fields and functions, ordered by priority:</p>
		 * <ol>
		 *     <li><code>contentSourceFunction</code></li>
		 *     <li><code>contentSourceField</code></li>
		 *     <li><code>contentLabelFunction</code></li>
		 *     <li><code>contentLabelField</code></li>
		 *     <li><code>contentFunction</code></li>
		 *     <li><code>contentField</code></li>
		 * </ol>
		 *
		 * <p>In the following example, the content field is customized:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentField = "header";</listing>
		 *
		 * @default "content"
		 *
		 * @see #contentSourceField
		 * @see #contentFunction
		 * @see #contentSourceFunction
		 * @see #contentLabelField
		 * @see #contentLabelFunction
		 */
		public get contentField():string
		{
			return this._contentField;
		}

		/**
		 * @private
		 */
		public set contentField(value:string)
		{
			if(this._contentField == value)
			{
				return;
			}
			this._contentField = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _contentFunction:Function;

		/**
		 * A function that returns a display object to be positioned in the
		 * content position of the renderer. If you wish to display a texture in
		 * the content position, it's better for performance to use
		 * <code>contentSourceFunction</code> instead.
		 *
		 * <p>The function is expected to have the following signature:</p>
		 * <pre>function( item:Object ):DisplayObject</pre>
		 *
		 * <p>All of the content fields and functions, ordered by priority:</p>
		 * <ol>
		 *     <li><code>contentSourceFunction</code></li>
		 *     <li><code>contentSourceField</code></li>
		 *     <li><code>contentLabelFunction</code></li>
		 *     <li><code>contentLabelField</code></li>
		 *     <li><code>contentFunction</code></li>
		 *     <li><code>contentField</code></li>
		 * </ol>
		 *
		 * <p>In the following example, the content function is customized:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentFunction = function( item:Object ):DisplayObject
		 * {
		 *    if(item in cachedContent)
		 *    {
		 *        return cachedContent[item];
		 *    }
		 *    var content:DisplayObject = createContentForHeader( item );
		 *    cachedContent[item] = content;
		 *    return content;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see #contentField
		 * @see #contentSourceField
		 * @see #contentSourceFunction
		 * @see #contentLabelField
		 * @see #contentLabelFunction
		 */
		public get contentFunction():Function
		{
			return this._contentFunction;
		}

		/**
		 * @private
		 */
		public set contentFunction(value:Function)
		{
			if(this._contentFunction == value)
			{
				return;
			}
			this._contentFunction = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _contentSourceField:string = "source";

		/**
		 * The field in the data that contains a <code>starling.textures.Texture</code>
		 * or a URL that points to a bitmap to be used as the renderer's
		 * content. The renderer will automatically manage and reuse an internal
		 * <code>ImageLoader</code> sub-component and this value will be passed
		 * to the <code>source</code> property. The <code>ImageLoader</code> may
		 * be customized by changing the <code>contentLoaderFactory</code>.
		 *
		 * <p>Using an content source will result in better performance than
		 * passing in an <code>ImageLoader</code> or <code>Image</code> through
		 * <code>contentField</code> or <code>contentFunction</code> because the
		 * renderer can avoid costly display list manipulation.</p>
		 *
		 * <p>All of the content fields and functions, ordered by priority:</p>
		 * <ol>
		 *     <li><code>contentSourceFunction</code></li>
		 *     <li><code>contentSourceField</code></li>
		 *     <li><code>contentLabelFunction</code></li>
		 *     <li><code>contentLabelField</code></li>
		 *     <li><code>contentFunction</code></li>
		 *     <li><code>contentField</code></li>
		 * </ol>
		 *
		 * <p>In the following example, the content source field is customized:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentSourceField = "texture";</listing>
		 *
		 * @default "source"
		 *
		 * @see feathers.controls.ImageLoader#source
		 * @see #contentLoaderFactory
		 * @see #contentSourceFunction
		 * @see #contentField
		 * @see #contentFunction
		 * @see #contentLabelField
		 * @see #contentLabelFunction
		 */
		public get contentSourceField():string
		{
			return this._contentSourceField;
		}

		/**
		 * @private
		 */
		public set contentSourceField(value:string)
		{
			if(this._contentSourceField == value)
			{
				return;
			}
			this._contentSourceField = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _contentSourceFunction:Function;

		/**
		 * A function used to generate a <code>starling.textures.Texture</code>
		 * or a URL that points to a bitmap to be used as the renderer's
		 * content. The renderer will automatically manage and reuse an internal
		 * <code>ImageLoader</code> sub-component and this value will be passed
		 * to the <code>source</code> property. The <code>ImageLoader</code> may
		 * be customized by changing the <code>contentLoaderFactory</code>.
		 *
		 * <p>Using an content source will result in better performance than
		 * passing in an <code>ImageLoader</code> or <code>Image</code> through
		 * <code>contentField</code> or <code>contentFunction</code> because the
		 * renderer can avoid costly display list manipulation.</p>
		 *
		 * <p>The function is expected to have the following signature:</p>
		 * <pre>function( item:Object ):Object</pre>
		 *
		 * <p>The return value is a valid value for the <code>source</code>
		 * property of an <code>ImageLoader</code> component.</p>
		 *
		 * <p>All of the content fields and functions, ordered by priority:</p>
		 * <ol>
		 *     <li><code>contentSourceFunction</code></li>
		 *     <li><code>contentSourceField</code></li>
		 *     <li><code>contentLabelFunction</code></li>
		 *     <li><code>contentLabelField</code></li>
		 *     <li><code>contentFunction</code></li>
		 *     <li><code>contentField</code></li>
		 * </ol>
		 *
		 * <p>In the following example, the content source function is customized:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentSourceFunction = function( item:Object ):Object
		 * {
		 *    return "http://www.example.com/thumbs/" + item.name + "-thumb.png";
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.ImageLoader#source
		 * @see #contentLoaderFactory
		 * @see #contentSourceField
		 * @see #contentField
		 * @see #contentFunction
		 * @see #contentLabelField
		 * @see #contentLabelFunction
		 */
		public get contentSourceFunction():Function
		{
			return this._contentSourceFunction;
		}

		/**
		 * @private
		 */
		public set contentSourceFunction(value:Function)
		{
			if(this.contentSourceFunction == value)
			{
				return;
			}
			this._contentSourceFunction = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _contentLabelField:string = "label";

		/**
		 * The field in the item that contains a string to be displayed in a
		 * renderer-managed <code>Label</code> in the content position of the
		 * renderer. The renderer will automatically reuse an internal
		 * <code>Label</code> and swap the text when the data changes. This
		 * <code>Label</code> may be skinned by changing the
		 * <code>contentLabelFactory</code>.
		 *
		 * <p>Using an content label will result in better performance than
		 * passing in a <code>Label</code> through a <code>contentField</code>
		 * or <code>contentFunction</code> because the renderer can avoid
		 * costly display list manipulation.</p>
		 *
		 * <p>All of the content fields and functions, ordered by priority:</p>
		 * <ol>
		 *     <li><code>contentTextureFunction</code></li>
		 *     <li><code>contentTextureField</code></li>
		 *     <li><code>contentLabelFunction</code></li>
		 *     <li><code>contentLabelField</code></li>
		 *     <li><code>contentFunction</code></li>
		 *     <li><code>contentField</code></li>
		 * </ol>
		 *
		 * <p>In the following example, the content label field is customized:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentLabelField = "text";</listing>
		 *
		 * @default "label"
		 *
		 * @see #contentLabelFactory
		 * @see #contentLabelFunction
		 * @see #contentField
		 * @see #contentFunction
		 * @see #contentSourceField
		 * @see #contentSourceFunction
		 */
		public get contentLabelField():string
		{
			return this._contentLabelField;
		}

		/**
		 * @private
		 */
		public set contentLabelField(value:string)
		{
			if(this._contentLabelField == value)
			{
				return;
			}
			this._contentLabelField = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _contentLabelFunction:Function;

		/**
		 * A function that returns a string to be displayed in a
		 * renderer-managed <code>Label</code> in the content position of the
		 * renderer. The renderer will automatically reuse an internal
		 * <code>Label</code> and swap the text when the data changes. This
		 * <code>Label</code> may be skinned by changing the
		 * <code>contentLabelFactory</code>.
		 *
		 * <p>Using an content label will result in better performance than
		 * passing in a <code>Label</code> through a <code>contentField</code>
		 * or <code>contentFunction</code> because the renderer can avoid
		 * costly display list manipulation.</p>
		 *
		 * <p>The function is expected to have the following signature:</p>
		 * <pre>function( item:Object ):String</pre>
		 *
		 * <p>All of the content fields and functions, ordered by priority:</p>
		 * <ol>
		 *     <li><code>contentTextureFunction</code></li>
		 *     <li><code>contentTextureField</code></li>
		 *     <li><code>contentLabelFunction</code></li>
		 *     <li><code>contentLabelField</code></li>
		 *     <li><code>contentFunction</code></li>
		 *     <li><code>contentField</code></li>
		 * </ol>
		 *
		 * <p>In the following example, the content label function is customized:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentLabelFunction = function( item:Object ):String
		 * {
		 *    return item.category + " > " + item.subCategory;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see #contentLabelFactory
		 * @see #contentLabelField
		 * @see #contentField
		 * @see #contentFunction
		 * @see #contentSourceField
		 * @see #contentSourceFunction
		 */
		public get contentLabelFunction():Function
		{
			return this._contentLabelFunction;
		}

		/**
		 * @private
		 */
		public set contentLabelFunction(value:Function)
		{
			if(this._contentLabelFunction == value)
			{
				return;
			}
			this._contentLabelFunction = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _contentLoaderFactory:Function = DefaultGroupedListHeaderOrFooterRenderer.defaultImageLoaderFactory;

		/**
		 * A function that generates an <code>ImageLoader</code> that uses the result
		 * of <code>contentSourceField</code> or <code>contentSourceFunction</code>.
		 * Useful for transforming the <code>ImageLoader</code> in some way. For
		 * example, you might want to scale it for current screen density or
		 * apply pixel snapping.
		 *
		 * <p>In the following example, a custom content loader factory is passed
		 * to the renderer:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentLoaderFactory = function():ImageLoader
		 * {
		 *     var loader:ImageLoader = new ImageLoader();
		 *     loader.snapToPixels = true;
		 *     return loader;
		 * };</listing>
		 *
		 * @default function():ImageLoader { return new ImageLoader(); }
		 *
		 * @see feathers.controls.ImageLoader
		 * @see #contentSourceField
		 * @see #contentSourceFunction
		 */
		public get contentLoaderFactory():Function
		{
			return this._contentLoaderFactory;
		}

		/**
		 * @private
		 */
		public set contentLoaderFactory(value:Function)
		{
			if(this._contentLoaderFactory == value)
			{
				return;
			}
			this._contentLoaderFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _contentLabelFactory:Function;

		/**
		 * A function that generates an <code>ITextRenderer</code> that uses the result
		 * of <code>contentLabelField</code> or <code>contentLabelFunction</code>.
		 * Can be used to set properties on the <code>ITextRenderer</code>.
		 *
		 * <p>In the following example, a custom content label factory is passed
		 * to the renderer:</p>
		 *
		 * <listing version="3.0">
		 * renderer.contentLabelFactory = function():ITextRenderer
		 * {
		 *     var renderer:TextFieldTextRenderer = new TextFieldTextRenderer();
		 *     renderer.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 *     renderer.embedFonts = true;
		 *     return renderer;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 * @see #contentLabelField
		 * @see #contentLabelFunction
		 */
		public get contentLabelFactory():Function
		{
			return this._contentLabelFactory;
		}

		/**
		 * @private
		 */
		public set contentLabelFactory(value:Function)
		{
			if(this._contentLabelFactory == value)
			{
				return;
			}
			this._contentLabelFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _contentLabelProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to a content label.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>In the following example, a custom content label properties are
		 * customized:</p>
		 * 
		 * <listing version="3.0">
		 * renderer.contentLabelProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 * renderer.contentLabelProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.ITextRenderer
		 * @see #contentLabelField
		 * @see #contentLabelFunction
		 */
		public get contentLabelProperties():Object
		{
			if(!this._contentLabelProperties)
			{
				this._contentLabelProperties = new PropertyProxy(this.contentLabelProperties_onChange);
			}
			return this._contentLabelProperties;
		}

		/**
		 * @private
		 */
		public set contentLabelProperties(value:Object)
		{
			if(this._contentLabelProperties == value)
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
			if(this._contentLabelProperties)
			{
				this._contentLabelProperties.removeOnChangeCallback(this.contentLabelProperties_onChange);
			}
			this._contentLabelProperties = PropertyProxy(value);
			if(this._contentLabelProperties)
			{
				this._contentLabelProperties.addOnChangeCallback(this.contentLabelProperties_onChange);
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
		 * A background to behind the component's content.
		 *
		 * <p>In the following example, the header renderers is given a
		 * background skin:</p>
		 *
		 * <listing version="3.0">
		 * renderer.backgroundSkin = new Image( texture );</listing>
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

			if(this._backgroundSkin && this._backgroundSkin != this._backgroundDisabledSkin)
			{
				this.removeChild(this._backgroundSkin);
			}
			this._backgroundSkin = value;
			if(this._backgroundSkin && this._backgroundSkin.parent != this)
			{
				this._backgroundSkin.visible = false;
				this.addChildAt(this._backgroundSkin, 0);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _backgroundDisabledSkin:DisplayObject;

		/**
		 * A background to display when the component is disabled.
		 *
		 * <p>In the following example, the header renderers is given a
		 * disabled background skin:</p>
		 *
		 * <listing version="3.0">
		 * renderer.backgroundDisabledSkin = new Image( texture );</listing>
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

			if(this._backgroundDisabledSkin && this._backgroundDisabledSkin != this._backgroundSkin)
			{
				this.removeChild(this._backgroundDisabledSkin);
			}
			this._backgroundDisabledSkin = value;
			if(this._backgroundDisabledSkin && this._backgroundDisabledSkin.parent != this)
			{
				this._backgroundDisabledSkin.visible = false;
				this.addChildAt(this._backgroundDisabledSkin, 0);
			}
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
		 * renderer.padding = 20;</listing>
		 *
		 * @default 0
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
		 * The minimum space, in pixels, between the component's top edge and
		 * the component's content.
		 *
		 * <p>In the following example, the top padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * renderer.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the component's right edge
		 * and the component's content.
		 *
		 * <p>In the following example, the right padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * renderer.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the component's bottom edge
		 * and the component's content.
		 *
		 * <p>In the following example, the bottom padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * renderer.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the component's left edge
		 * and the component's content.
		 * 
		 * <p>In the following example, the left padding is set to 20 pixels:</p>
		 * 
		 * <listing version="3.0">
		 * renderer.paddingLeft = 20;</listing>
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
		/*override*/ public dispose():void
		{
			//the content may have come from outside of this class. it's up
			//to that code to dispose of the content. in fact, if we disposed
			//of it here, we might screw something up!
			if(this.content)
			{
				this.content.removeFromParent();
			}

			//however, we need to dispose these, if they exist, since we made
			//them here.
			if(this.contentImage)
			{
				this.contentImage.dispose();
				this.contentImage = null;
			}
			if(this.contentLabel)
			{
				DisplayObject(this.contentLabel).dispose();
				this.contentLabel = null;
			}
			super.dispose();
		}

		/**
		 * Uses the content fields and functions to generate content for a
		 * specific group header or footer.
		 *
		 * <p>All of the content fields and functions, ordered by priority:</p>
		 * <ol>
		 *     <li><code>contentTextureFunction</code></li>
		 *     <li><code>contentTextureField</code></li>
		 *     <li><code>contentLabelFunction</code></li>
		 *     <li><code>contentLabelField</code></li>
		 *     <li><code>contentFunction</code></li>
		 *     <li><code>contentField</code></li>
		 * </ol>
		 */
		protected itemToContent(item:Object):DisplayObject
		{
			if(this._contentSourceFunction != null)
			{
				var source:Object = this._contentSourceFunction(item);
				this.refreshContentSource(source);
				return this.contentImage;
			}
			else if(this._contentSourceField != null && item && item.hasOwnProperty(this._contentSourceField))
			{
				source = item[this._contentSourceField];
				this.refreshContentSource(source);
				return this.contentImage;
			}
			else if(this._contentLabelFunction != null)
			{
				var labelResult:Object = this._contentLabelFunction(item);
				if(labelResult instanceof String)
				{
					this.refreshContentLabel(<String>labelResult );
				}
				else
				{
					this.refreshContentLabel(labelResult.toString());
				}
				return DisplayObject(this.contentLabel);
			}
			else if(this._contentLabelField != null && item && item.hasOwnProperty(this._contentLabelField))
			{
				labelResult = item[this._contentLabelField];
				if(labelResult instanceof String)
				{
					this.refreshContentLabel(<String>labelResult );
				}
				else
				{
					this.refreshContentLabel(labelResult.toString());
				}
				return DisplayObject(this.contentLabel);
			}
			else if(this._contentFunction != null)
			{
				return <DisplayObject>this._contentFunction(item) ;
			}
			else if(this._contentField != null && item && item.hasOwnProperty(this._contentField))
			{
				return <DisplayObject>item[this._contentField] ;
			}
			else if(item instanceof String)
			{
				this.refreshContentLabel(<String>item );
				return DisplayObject(this.contentLabel);
			}
			else if(item)
			{
				this.refreshContentLabel(item.toString());
				return DisplayObject(this.contentLabel);
			}

			return null;
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);

			if(stylesInvalid || stateInvalid)
			{
				this.refreshBackgroundSkin();
			}

			if(dataInvalid)
			{
				this.commitData();
			}

			if(dataInvalid || stylesInvalid)
			{
				this.refreshContentLabelStyles();
			}

			if(dataInvalid || stateInvalid)
			{
				this.refreshEnabled();
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(dataInvalid || stylesInvalid || sizeInvalid)
			{
				this.layout();
			}

			if(sizeInvalid || stylesInvalid || stateInvalid)
			{
				if(this.currentBackgroundSkin)
				{
					this.currentBackgroundSkin.width = this.actualWidth;
					this.currentBackgroundSkin.height = this.actualHeight;
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
			if(!this.content)
			{
				return this.setSizeInternal(0, 0, false);
			}
			if(this.contentLabel)
			{
				//special case for label to allow word wrap
				var labelMaxWidth:number = this.explicitWidth;
				if(needsWidth)
				{
					labelMaxWidth = this._maxWidth;
				}
				this.contentLabel.maxWidth = labelMaxWidth - this._paddingLeft - this._paddingRight;
			}
			if(this._horizontalAlign == DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_JUSTIFY)
			{
				this.content.width = this.explicitWidth - this._paddingLeft - this._paddingRight;
			}
			if(this._verticalAlign == DefaultGroupedListHeaderOrFooterRenderer.VERTICAL_ALIGN_JUSTIFY)
			{
				this.content.height = this.explicitHeight - this._paddingTop - this._paddingBottom;
			}
			if(this.content instanceof IValidating)
			{
				IValidating(this.content).validate();
			}
			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				newWidth = this.content.width + this._paddingLeft + this._paddingRight;
				if(this.originalBackgroundWidth === this.originalBackgroundWidth && //!isNaN
					this.originalBackgroundWidth > newWidth)
				{
					newWidth = this.originalBackgroundWidth;
				}
			}
			if(needsHeight)
			{
				newHeight = this.content.height + this._paddingTop + this._paddingBottom;
				if(this.originalBackgroundHeight === this.originalBackgroundHeight && //!isNaN
					this.originalBackgroundHeight > newHeight)
				{
					newHeight = this.originalBackgroundHeight;
				}
			}
			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * @private
		 */
		protected refreshBackgroundSkin():void
		{
			this.currentBackgroundSkin = this._backgroundSkin;
			if(!this._isEnabled && this._backgroundDisabledSkin)
			{
				if(this._backgroundSkin)
				{
					this._backgroundSkin.visible = false;
				}
				this.currentBackgroundSkin = this._backgroundDisabledSkin;
			}
			else if(this._backgroundDisabledSkin)
			{
				this._backgroundDisabledSkin.visible = false;
			}
			if(this.currentBackgroundSkin)
			{
				if(this.originalBackgroundWidth !== this.originalBackgroundWidth) //isNaN
				{
					this.originalBackgroundWidth = this.currentBackgroundSkin.width;
				}
				if(this.originalBackgroundHeight !== this.originalBackgroundHeight) //isNaN
				{
					this.originalBackgroundHeight = this.currentBackgroundSkin.height;
				}
				this.currentBackgroundSkin.visible = true;
			}
		}

		/**
		 * @private
		 */
		protected commitData():void
		{
			if(this._owner)
			{
				var newContent:DisplayObject = this.itemToContent(this._data);
				if(newContent != this.content)
				{
					if(this.content)
					{
						this.content.removeFromParent();
					}
					this.content = newContent;
					if(this.content)
					{
						this.addChild(this.content);
					}
				}
			}
			else
			{
				if(this.content)
				{
					this.content.removeFromParent();
					this.content = null;
				}
			}
		}

		/**
		 * @private
		 */
		protected refreshContentSource(source:Object):void
		{
			if(!this.contentImage)
			{
				this.contentImage = this._contentLoaderFactory();
			}
			this.contentImage.source = source;
		}

		/**
		 * @private
		 */
		protected refreshContentLabel(label:string):void
		{
			if(label !== null)
			{
				if(!this.contentLabel)
				{
					var factory:Function = this._contentLabelFactory != null ? this._contentLabelFactory : FeathersControl.defaultTextRendererFactory;
					this.contentLabel = ITextRenderer(factory());
					FeathersControl(this.contentLabel).styleNameList.add(this.contentLabelName);
				}
				this.contentLabel.text = label;
			}
			else if(this.contentLabel)
			{
				DisplayObject(this.contentLabel).removeFromParent(true);
				this.contentLabel = null;
			}
		}

		/**
		 * @private
		 */
		protected refreshEnabled():void
		{
			if(this.content instanceof IFeathersControl)
			{
				IFeathersControl(this.content).isEnabled = this._isEnabled;
			}
		}

		/**
		 * @private
		 */
		protected refreshContentLabelStyles():void
		{
			if(!this.contentLabel)
			{
				return;
			}
			for(var propertyName:string in this._contentLabelProperties)
			{
				var propertyValue:Object = this._contentLabelProperties[propertyName];
				this.contentLabel[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected layout():void
		{
			if(!this.content)
			{
				return;
			}

			if(this.contentLabel)
			{
				this.contentLabel.maxWidth = this.actualWidth - this._paddingLeft - this._paddingRight;
			}
			switch(this._horizontalAlign)
			{
				case DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_CENTER:
				{
					this.content.x = this._paddingLeft + (this.actualWidth - this._paddingLeft - this._paddingRight - this.content.width) / 2;
					break;
				}
				case DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_RIGHT:
				{
					this.content.x = this.actualWidth - this._paddingRight - this.content.width;
					break;
				}
				case DefaultGroupedListHeaderOrFooterRenderer.HORIZONTAL_ALIGN_JUSTIFY:
				{
					this.content.x = this._paddingLeft;
					this.content.width = this.actualWidth - this._paddingLeft - this._paddingRight;
					break;
				}
				default: //left
				{
					this.content.x = this._paddingLeft;
				}
			}

			switch(this._verticalAlign)
			{
				case DefaultGroupedListHeaderOrFooterRenderer.VERTICAL_ALIGN_TOP:
				{
					this.content.y = this._paddingTop;
					break;
				}
				case DefaultGroupedListHeaderOrFooterRenderer.VERTICAL_ALIGN_BOTTOM:
				{
					this.content.y = this.actualHeight - this._paddingBottom - this.content.height;
					break;
				}
				case DefaultGroupedListHeaderOrFooterRenderer.VERTICAL_ALIGN_JUSTIFY:
				{
					this.content.y = this._paddingTop;
					this.content.height = this.actualHeight - this._paddingTop - this._paddingBottom;
					break;
				}
				default: //middle
				{
					this.content.y = this._paddingTop + (this.actualHeight - this._paddingTop - this._paddingBottom - this.content.height) / 2;
				}
			}

		}

		/**
		 * @private
		 */
		protected contentLabelProperties_onChange(proxy:PropertyProxy, name:string):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
	}
}
