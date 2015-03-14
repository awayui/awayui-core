/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Bitmap = flash.display.Bitmap;
	import BitmapData = flash.display.BitmapData;
	import Loader = flash.display.Loader;
	import Context3DTextureFormat = flash.display3D.Context3DTextureFormat;
	import IllegalOperationError = flash.errors.IllegalOperationError;
	import ErrorEvent = flash.events.ErrorEvent;
	import Event = flash.events.Event;
	import IOErrorEvent = flash.events.IOErrorEvent;
	import ProgressEvent = flash.events.ProgressEvent;
	import SecurityErrorEvent = flash.events.SecurityErrorEvent;
	import Matrix = flash.geom.Matrix;
	import Rectangle = flash.geom.Rectangle;
	import URLLoader = flash.net.URLLoader;
	import URLLoaderDataFormat = flash.net.URLLoaderDataFormat;
	import URLRequest = flash.net.URLRequest;
	import ImageDecodingPolicy = flash.system.ImageDecodingPolicy;
	import LoaderContext = flash.system.LoaderContext;
	import ByteArray = flash.utils.ByteArray;
	import setTimeout = flash.utils.setTimeout;

	import RenderSupport = starling.core.RenderSupport;
	import Starling = starling.core.Starling;
	import Image = starling.display.Image;
	import EnterFrameEvent = starling.events.EnterFrameEvent;
	import Event = starling.events.Event;
	import Texture = starling.textures.Texture;
	import TextureSmoothing = starling.textures.TextureSmoothing;
	import RectangleUtil = starling.utils.RectangleUtil;
	import ScaleMode = starling.utils.ScaleMode;
	import SystemUtil = starling.utils.SystemUtil;

	/**
	 * Dispatched when the source finishes loading, if the source is a URL. This
	 * event is not dispatched when the source is a texture.
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
	 * @eventType starling.events.Event.COMPLETE
	 */
	/*[Event(name="complete",type="starling.events.Event")]*/

	/**
	 * Dispatched periodically as the source loads, if the source is a URL. This
	 * event is not dispatched when the source is a texture.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>A value between 0.0 and 1.0 to indicate
	 *   how much image data has loaded.</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.PROGRESS
	 */
	/*[Event(name="progress",type="starling.events.Event")]*/

	/**
	 * Dispatched if an error occurs while loading the source content.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>The <code>flash.events.ErrorEvent</code>
	 *   dispatched by the loader.</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.ERROR
	 */
	/*[Event(name="error",type="starling.events.Event")]*/

	/**
	 * Displays an image, either from an existing <code>Texture</code> object or
	 * from an image file loaded with its URL. Supported image files include ATF
	 * format and any bitmap formats that may be loaded by
	 * <code>flash.display.Loader</code>, including JPG, GIF, and PNG.
	 *
	 * <p>The following example passes a URL to an image loader and listens for
	 * its complete event:</p>
	 *
	 * <listing version="3.0">
	 * var loader:ImageLoader = new ImageLoader();
	 * loader.source = "http://example.com/example.png";
	 * loader.addEventListener( Event.COMPLETE, loader_completeHandler );
	 * this.addChild( loader );</listing>
	 *
	 * <p>The following example passes an existing texture to an image loader:</p>
	 *
	 * <listing version="3.0">
	 * var loader:ImageLoader = new ImageLoader();
	 * loader.source = Texture.fromBitmap( bitmap );
	 * this.addChild( loader );</listing>
	 */
	export class ImageLoader extends FeathersControl
	{
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
		private static HELPER_RECTANGLE2:Rectangle = new Rectangle();

		/**
		 * @private
		 */
		private static CONTEXT_LOST_WARNING:string = "ImageLoader: Context lost while processing loaded image, retrying...";

		/**
		 * @private
		 */
		protected static LOADER_CONTEXT:LoaderContext = new LoaderContext(true);
		/*LOADER_CONTEXT*//*.*//*imageDecodingPolicy*/ /*=*/ /*ImageDecodingPolicy*//*.*//*ON_LOAD*//*;*/

		/**
		 * @private
		 */
		protected static ATF_FILE_EXTENSION:string = "atf";

		/**
		 * @private
		 */
		protected static textureQueueHead:ImageLoader;

		/**
		 * @private
		 */
		protected static textureQueueTail:ImageLoader;

		/**
		 * The default <code>IStyleProvider</code> for all <code>ImageLoader</code>
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
			this.isQuickHitAreaEnabled = true;
		}

		/**
		 * The internal <code>starling.display.Image</code> child.
		 */
		protected image:Image;

		/**
		 * The internal <code>flash.display.Loader</code> used to load textures
		 * from URLs.
		 */
		protected loader:Loader;

		/**
		 * The internal <code>flash.net.URLLoader</code> used to load raw data
		 * from URLs.
		 */
		protected urlLoader:URLLoader;

		/**
		 * @private
		 */
		protected _lastURL:string;

		/**
		 * @private
		 */
		protected _currentTextureWidth:number = NaN;

		/**
		 * @private
		 */
		protected _currentTextureHeight:number = NaN;

		/**
		 * @private
		 */
		protected _currentTexture:Texture;

		/**
		 * @private
		 */
		protected _texture:Texture;

		/**
		 * @private
		 */
		protected _textureBitmapData:BitmapData;

		/**
		 * @private
		 */
		protected _textureRawData:ByteArray;

		/**
		 * @private
		 */
		protected _isTextureOwner:boolean = false;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return ImageLoader.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _source:Object;

		/**
		 * The <code>Texture</code> to display, or a URL pointing to an image
		 * file. Supported image files include ATF format and any bitmap formats
		 * that may be loaded by <code>flash.display.Loader</code>, including
		 * JPG, GIF, and PNG.
		 *
		 * <p>In the following example, the image loader's source is set to a
		 * texture:</p>
		 *
		 * <listing version="3.0">
		 * loader.source = Texture.fromBitmap( bitmap );</listing>
		 *
		 * <p>In the following example, the image loader's source is set to the
		 * URL of a PNG image:</p>
		 *
		 * <listing version="3.0">
		 * loader.source = "http://example.com/example.png";</listing>
		 *
		 * @default null
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display/Loader.html
		 * @see http://wiki.starling-framework.org/manual/atf_textures
		 */
		public get source():Object
		{
			return this._source;
		}

		/**
		 * @private
		 */
		public set source(value:Object)
		{
			if(this._source == value)
			{
				return;
			}
			if(this._isInTextureQueue)
			{
				this.removeFromTextureQueue();
			}
			this._source = value;
			this.cleanupTexture();
			if(this.image)
			{
				this.image.visible = false;
			}
			this._lastURL = null;
			if(this._source instanceof Texture)
			{
				this._isLoaded = true;
			}
			else
			{

				this._isLoaded = false;
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _loadingTexture:Texture;

		/**
		 * A texture to display while a URL source is loading.
		 *
		 * <p>In the following example, the image loader's loading texture is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * loader.source = "http://example.com/example.png";
		 * loader.loadingTexture = texture;</listing>
		 *
		 * @default null
		 *
		 * @see #errorTexture
		 */
		public get loadingTexture():Texture
		{
			return this._loadingTexture;
		}

		/**
		 * @private
		 */
		public set loadingTexture(value:Texture)
		{
			if(this._loadingTexture == value)
			{
				return;
			}
			this._loadingTexture = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _errorTexture:Texture;

		/**
		 * A texture to display when a URL source cannot be loaded for any
		 * reason.
		 *
		 * <p>In the following example, the image loader's error texture is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * loader.source = "http://example.com/example.png";
		 * loader.errorTexture = texture;</listing>
		 *
		 * @default null
		 *
		 * @see #loadingTexture
		 */
		public get errorTexture():Texture
		{
			return this._errorTexture;
		}

		/**
		 * @private
		 */
		public set errorTexture(value:Texture)
		{
			if(this._errorTexture == value)
			{
				return;
			}
			this._errorTexture = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _isLoaded:boolean = false;

		/**
		 * Indicates if the source has completed loading, if the source is a
		 * URL. Always returns <code>true</code> when the source is a texture.
		 *
		 * <p>In the following example, we check if the image loader's source
		 * has finished loading:</p>
		 *
		 * <listing version="3.0">
		 * if( loader.isLoaded )
		 * {
		 *     //do something
		 * }</listing>
		 */
		public get isLoaded():boolean
		{
			return this._isLoaded;
		}

		/**
		 * @private
		 */
		private _textureScale:number = 1;

		/**
		 * Scales the texture dimensions during measurement. Useful for UI that
		 * should scale based on screen density or resolution.
		 *
		 * <p>In the following example, the image loader's texture scale is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * loader.textureScale = 0.5;</listing>
		 *
		 * @default 1
		 */
		public get textureScale():number
		{
			return this._textureScale;
		}

		/**
		 * @private
		 */
		public set textureScale(value:number)
		{
			if(this._textureScale == value)
			{
				return;
			}
			this._textureScale = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		private _smoothing:string = TextureSmoothing.BILINEAR;

		/**
		 * The smoothing value to use on the internal <code>Image</code>.
		 *
		 * <p>In the following example, the image loader's smoothing is set to a
		 * custom value:</p>
		 *
		 * <listing version="3.0">
		 * loader.smoothing = TextureSmoothing.NONE;</listing>
		 *
		 * @default starling.textures.TextureSmoothing.BILINEAR
		 *
		 * @see http://doc.starling-framework.org/core/starling/textures/TextureSmoothing.html starling.textures.TextureSmoothing
		 * @see http://doc.starling-framework.org/core/starling/display/Image.html#smoothing starling.display.Image.smoothing
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
		private _color:number = 0xffffff;

		/**
		 * The tint value to use on the internal <code>Image</code>.
		 *
		 * <p>In the following example, the image loader's texture color is
		 * customized:</p>
		 *
		 * <listing version="3.0">
		 * loader.color = 0xff00ff;</listing>
		 *
		 * @default 0xffffff
		 *
		 * @see http://doc.starling-framework.org/core/starling/display/Image.html#color starling.display.Image.color
		 */
		public get color():number
		{
			return this._color;
		}

		/**
		 * @private
		 */
		public set color(value:number)
		{
			if(this._color == value)
			{
				return;
			}
			this._color = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _textureFormat:string = Context3DTextureFormat.BGRA;

		/**
		 * The texture format to use when creating a texture loaded from a URL.
		 *
		 * <p>In the following example, the image loader's texture format is set
		 * to a custom value:</p>
		 *
		 * <listing version="3.0">
		 * loader.textureFormat = Context3DTextureFormat.BGRA_PACKED;</listing>
		 *
		 * @default flash.display3d.Context3DTextureFormat.BGRA
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display3D/Context3DTextureFormat.html flash.display3d.Context3DTextureFormat
		 */
		public get textureFormat():string
		{
			return this._textureFormat;
		}

		/**
		 * @private
		 */
		public set textureFormat(value:string)
		{
			if(this._textureFormat == value)
			{
				return;
			}
			this._textureFormat = value;
			this._lastURL = null;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		private _snapToPixels:boolean = false;

		/**
		 * Determines if the image should be snapped to the nearest global whole
		 * pixel when rendered. Turning this on helps to avoid blurring.
		 *
		 * <p>In the following example, the image loader's position is snapped
		 * to pixels:</p>
		 *
		 * <listing version="3.0">
		 * loader.snapToPixels = true;</listing>
		 *
		 * @default false
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
		}

		/**
		 * @private
		 */
		private _maintainAspectRatio:boolean = true;

		/**
		 * Determines if the aspect ratio of the texture is maintained when the
		 * aspect ratio of the component is different.
		 *
		 * <p>In the following example, the image loader's aspect ratio is not
		 * maintained:</p>
		 *
		 * <listing version="3.0">
		 * loader.maintainAspectRatio = false;</listing>
		 *
		 * @default true
		 */
		public get maintainAspectRatio():boolean
		{
			return this._maintainAspectRatio;
		}

		/**
		 * @private
		 */
		public set maintainAspectRatio(value:boolean)
		{
			if(this._maintainAspectRatio == value)
			{
				return;
			}
			this._maintainAspectRatio = value;
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * The original width of the source content, in pixels. This value will
		 * be <code>0</code> until the source content finishes loading. If the
		 * source is a texture, this value will be <code>0</code> until the
		 * <code>ImageLoader</code> validates.
		 */
		public get originalSourceWidth():number
		{
			if(this._currentTextureWidth === this._currentTextureWidth) //!isNaN
			{
				return this._currentTextureWidth;
			}
			return 0;
		}

		/**
		 * The original height of the source content, in pixels. This value will
		 * be <code>0</code> until the source content finishes loading. If the
		 * source is a texture, this value will be <code>0</code> until the
		 * <code>ImageLoader</code> validates.
		 */
		public get originalSourceHeight():number
		{
			if(this._currentTextureHeight === this._currentTextureHeight) //!isNaN
			{
				return this._currentTextureHeight;
			}
			return 0;
		}

		/**
		 * @private
		 */
		protected _pendingBitmapDataTexture:BitmapData;

		/**
		 * @private
		 */
		protected _pendingRawTextureData:ByteArray;

		/**
		 * @private
		 */
		protected _delayTextureCreation:boolean = false;

		/**
		 * Determines if a loaded bitmap may be converted to a texture
		 * immediately after loading. If <code>true</code>, the loaded bitmap
		 * will be saved until this property is set to <code>false</code>, and
		 * only then it will be used to create the texture.
		 *
		 * <p>This property is intended to be used while a parent container,
		 * such as a <code>List</code>, is scrolling in order to keep scrolling
		 * as smooth as possible. Creating textures is expensive and performance
		 * can be affected by it. Set this property to <code>true</code> when
		 * the <code>List</code> dispatches <code>FeathersEventType.SCROLL_START</code>
		 * and set back to false when the <code>List</code> dispatches
		 * <code>FeathersEventType.SCROLL_COMPLETE</code>. You may also need
		 * to set to false if the <code>isScrolling</code> property of the
		 * <code>List</code> is <code>true</code> before you listen to those
		 * events.</p>
		 *
		 * <p>In the following example, the image loader's texture creation is
		 * delayed:</p>
		 *
		 * <listing version="3.0">
		 * loader.delayTextureCreation = true;</listing>
		 *
		 * @default false
		 *
		 * @see #textureQueueDuration
		 * @see feathers.controls.Scroller#event:scrollStart
		 * @see feathers.controls.Scroller#event:scrollComplete
		 * @see feathers.controls.Scroller#isScrolling
		 */
		public get delayTextureCreation():boolean
		{
			return this._delayTextureCreation;
		}

		/**
		 * @private
		 */
		public set delayTextureCreation(value:boolean)
		{
			if(this._delayTextureCreation == value)
			{
				return;
			}
			this._delayTextureCreation = value;
			if(!this._delayTextureCreation)
			{
				this.processPendingTexture();
			}
		}

		/**
		 * @private
		 */
		protected _isInTextureQueue:boolean = false;

		/**
		 * @private
		 */
		protected _textureQueuePrevious:ImageLoader;

		/**
		 * @private
		 */
		protected _textureQueueNext:ImageLoader;

		/**
		 * @private
		 */
		protected _accumulatedPrepareTextureTime:number;

		/**
		 * @private
		 */
		protected _textureQueueDuration:number = Number.POSITIVE_INFINITY;

		/**
		 * If <code>delayTextureCreation</code> is <code>true</code> and the
		 * duration is not <code>Number.POSITIVE_INFINITY</code>, the loader
		 * will be added to a queue where the textures are uploaded to the GPU
		 * in sequence to avoid significantly affecting performance. Useful for
		 * lists where many textures may need to be uploaded during scrolling.
		 *
		 * <p>If the duration is <code>Number.POSITIVE_INFINITY</code>, the
		 * default value, the texture will not be uploaded until
		 * <code>delayTextureCreation</code> is set to <code>false</code>. In
		 * this situation, the loader will not be added to the queue, and other
		 * loaders with a duration won't be affected.</p>
		 *
		 * <p>In the following example, the image loader's texture creation is
		 * delayed by half a second:</p>
		 *
		 * <listing version="3.0">
		 * loader.delayTextureCreation = true;
		 * loader.textureQueueDuration = 0.5;</listing>
		 *
		 * @default Number.POSITIVE_INFINITY
		 *
		 * @see #delayTextureCreation
		 */
		public get textureQueueDuration():number
		{
			return this._textureQueueDuration;
		}

		/**
		 * @private
		 */
		public set textureQueueDuration(value:number)
		{
			if(this._textureQueueDuration == value)
			{
				return;
			}
			var oldDuration:number = this._textureQueueDuration;
			this._textureQueueDuration = value;
			if(this._delayTextureCreation)
			{
				 if((this._pendingBitmapDataTexture || this._pendingRawTextureData) &&
					oldDuration == Number.POSITIVE_INFINITY && this._textureQueueDuration < Number.POSITIVE_INFINITY)
				{
					this.addToTextureQueue();
				}
				else if(this._isInTextureQueue && this._textureQueueDuration == Number.POSITIVE_INFINITY)
				{
					this.removeFromTextureQueue();
				}
			}
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the image loader's padding is set to
		 * 20 pixels on all sides:</p>
		 *
		 * <listing version="3.0">
		 * loader.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the control's top edge and the
		 * control's content. Value may be negative to extend the content
		 * outside the edges of the control. Useful for skinning.
		 *
		 * <p>In the following example, the image loader's top padding is set
		 * to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * loader.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the control's right edge and the
		 * control's content. Value may be negative to extend the content
		 * outside the edges of the control. Useful for skinning.
		 *
		 * <p>In the following example, the image loader's right padding is set
		 * to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * loader.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the control's bottom edge and the
		 * control's content. Value may be negative to extend the content
		 * outside the edges of the control. Useful for skinning.
		 *
		 * <p>In the following example, the image loader's bottom padding is set
		 * to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * loader.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the control's left edge and the
		 * control's content. Value may be negative to extend the content
		 * outside the edges of the control. Useful for skinning.
		 *
		 * <p>In the following example, the image loader's left padding is set
		 * to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * loader.paddingLeft = 20;</listing>
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
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			if(this._snapToPixels)
			{
				this.getTransformationMatrix(this.stage, ImageLoader.HELPER_MATRIX);
				support.translateMatrix(Math.round(ImageLoader.HELPER_MATRIX.tx) - ImageLoader.HELPER_MATRIX.tx, Math.round(ImageLoader.HELPER_MATRIX.ty) - ImageLoader.HELPER_MATRIX.ty);
			}
			super.render(support, parentAlpha);
			if(this._snapToPixels)
			{
				support.translateMatrix(-(Math.round(ImageLoader.HELPER_MATRIX.tx) - ImageLoader.HELPER_MATRIX.tx), -(Math.round(ImageLoader.HELPER_MATRIX.ty) - ImageLoader.HELPER_MATRIX.ty));
			}
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			if(this.loader)
			{
				this.loader.contentLoaderInfo.removeEventListener(this.flash.events.Event.COMPLETE, this.loader_completeHandler);
				this.loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, this.loader_errorHandler);
				this.loader.contentLoaderInfo.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.loader_errorHandler);
				try
				{
					this.loader.close();
				}
				catch(error:Error)
				{
					//no need to do anything in response
				}
				this.loader = null;
			}
			this.cleanupTexture();
			super.dispose();
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);

			if(dataInvalid)
			{
				this.commitData();
			}

			if(dataInvalid || stylesInvalid)
			{
				this.commitStyles();
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(dataInvalid || layoutInvalid || sizeInvalid || stylesInvalid)
			{
				this.layout();
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

			var newWidth:number = this.explicitWidth;
			if(needsWidth)
			{
				if(this._currentTextureWidth === this._currentTextureWidth) //!isNaN
				{
					newWidth = this._currentTextureWidth * this._textureScale;
					if(this._maintainAspectRatio && !needsHeight)
					{
						var heightScale:number = this.explicitHeight / (this._currentTextureHeight * this._textureScale);
						newWidth *= heightScale;
					}
				}
				else
				{
					newWidth = 0;
				}
				newWidth += this._paddingLeft + this._paddingRight;
			}

			var newHeight:number = this.explicitHeight;
			if(needsHeight)
			{
				if(this._currentTextureHeight === this._currentTextureHeight) //!isNaN
				{
					newHeight = this._currentTextureHeight * this._textureScale;
					if(this._maintainAspectRatio && !needsWidth)
					{
						var widthScale:number = this.explicitWidth / (this._currentTextureWidth * this._textureScale);
						newHeight *= widthScale;
					}
				}
				else
				{
					newHeight = 0;
				}
				newHeight += this._paddingTop + this._paddingBottom;
			}

			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * @private
		 */
		protected commitData():void
		{
			if(this._source instanceof Texture)
			{
				this._lastURL = null;
				this._texture = Texture(this._source);
				this.refreshCurrentTexture();
			}
			else
			{
				var sourceURL:string = <String>this._source ;
				if(!sourceURL)
				{
					this._lastURL = null;
				}
				else if(sourceURL != this._lastURL)
				{
					this._lastURL = sourceURL;

					if(this.urlLoader)
					{
						this.urlLoader.removeEventListener(this.flash.events.Event.COMPLETE, this.rawDataLoader_completeHandler);
						this.urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, this.rawDataLoader_errorHandler);
						this.urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.rawDataLoader_errorHandler);
						try
						{
							this.urlLoader.close();
						}
						catch(error:Error)
						{
							//no need to do anything in response
						}
					}

					if(this.loader)
					{
						this.loader.contentLoaderInfo.removeEventListener(this.flash.events.Event.COMPLETE, this.loader_completeHandler);
						this.loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, this.loader_errorHandler);
						this.loader.contentLoaderInfo.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.loader_errorHandler);
						try
						{
							this.loader.close();
						}
						catch(error:Error)
						{
							//no need to do anything in response
						}
					}

					if(sourceURL.toLowerCase().lastIndexOf(ImageLoader.ATF_FILE_EXTENSION) == sourceURL.length - 3)
					{
						if(this.loader)
						{
							this.loader = null;
						}
						if(!this.urlLoader)
						{
							this.urlLoader = new URLLoader();
							this.urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
						}
						this.urlLoader.addEventListener(this.flash.events.Event.COMPLETE, this.rawDataLoader_completeHandler);
						this.urlLoader.addEventListener(ProgressEvent.PROGRESS, this.rawDataLoader_progressHandler);
						this.urlLoader.addEventListener(IOErrorEvent.IO_ERROR, this.rawDataLoader_errorHandler);
						this.urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.rawDataLoader_errorHandler);
						this.urlLoader.load(new URLRequest(sourceURL));
						return;
					}
					else //not ATF
					{
						if(this.urlLoader)
						{
							this.urlLoader = null;
						}
						if(!this.loader)
						{
							this.loader = new Loader();
						}
						this.loader.contentLoaderInfo.addEventListener(this.flash.events.Event.COMPLETE, this.loader_completeHandler);
						this.loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, this.loader_progressHandler);
						this.loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, this.loader_errorHandler);
						this.loader.contentLoaderInfo.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.loader_errorHandler);
						this.loader.load(new URLRequest(sourceURL), ImageLoader.LOADER_CONTEXT);
					}
				}
				this.refreshCurrentTexture();
			}
		}

		/**
		 * @private
		 */
		protected commitStyles():void
		{
			if(!this.image)
			{
				return;
			}
			this.image.smoothing = this._smoothing;
			this.image.color = this._color;
		}

		/**
		 * @private
		 */
		protected layout():void
		{
			if(!this.image || !this._currentTexture)
			{
				return;
			}
			if(this._maintainAspectRatio)
			{
				ImageLoader.HELPER_RECTANGLE.x = 0;
				ImageLoader.HELPER_RECTANGLE.y = 0;
				ImageLoader.HELPER_RECTANGLE.width = this._currentTextureWidth * this._textureScale;
				ImageLoader.HELPER_RECTANGLE.height = this._currentTextureHeight * this._textureScale;
				ImageLoader.HELPER_RECTANGLE2.x = 0;
				ImageLoader.HELPER_RECTANGLE2.y = 0;
				ImageLoader.HELPER_RECTANGLE2.width = this.actualWidth - this._paddingLeft - this._paddingRight;
				ImageLoader.HELPER_RECTANGLE2.height = this.actualHeight - this._paddingTop - this._paddingBottom;
				RectangleUtil.fit(ImageLoader.HELPER_RECTANGLE, ImageLoader.HELPER_RECTANGLE2, ScaleMode.SHOW_ALL, false, ImageLoader.HELPER_RECTANGLE);
				this.image.x = ImageLoader.HELPER_RECTANGLE.x + this._paddingLeft;
				this.image.y = ImageLoader.HELPER_RECTANGLE.y + this._paddingTop;
				this.image.width = ImageLoader.HELPER_RECTANGLE.width;
				this.image.height = ImageLoader.HELPER_RECTANGLE.height;
			}
			else
			{
				this.image.x = this._paddingLeft;
				this.image.y = this._paddingTop;
				this.image.width = this.actualWidth - this._paddingLeft - this._paddingRight;
				this.image.height = this.actualHeight - this._paddingTop - this._paddingBottom;
			}
		}

		/**
		 * @private
		 */
		protected refreshCurrentTexture():void
		{
			var newTexture:Texture = this._texture;
			if(!newTexture)
			{
				if(this.loader)
				{
					newTexture = this._loadingTexture;
				}
				else
				{
					newTexture = this._errorTexture;
				}
			}

			if(this._currentTexture == newTexture)
			{
				return;
			}
			this._currentTexture = newTexture;

			if(!this._currentTexture)
			{
				if(this.image)
				{
					this.removeChild(this.image, true);
					this.image = null;
				}
				return;
			}

			//save the texture's frame so that we don't need to create a new
			//rectangle every time that we want to access it.
			var frame:Rectangle = this._currentTexture.frame;
			if(frame)
			{
				this._currentTextureWidth = frame.width;
				this._currentTextureHeight = frame.height;
			}
			else
			{
				this._currentTextureWidth = this._currentTexture.width;
				this._currentTextureHeight = this._currentTexture.height;
			}
			if(!this.image)
			{
				this.image = new Image(this._currentTexture);
				this.addChild(this.image);
			}
			else
			{
				this.image.texture = this._currentTexture;
				this.image.readjustSize();
			}
			this.image.visible = true;
		}

		/**
		 * @private
		 */
		protected cleanupTexture():void
		{
			if(this._isTextureOwner)
			{
				if(this._textureBitmapData)
				{
					this._textureBitmapData.dispose();
				}
				if(this._textureRawData)
				{
					this._textureRawData.clear();
				}
				if(this._texture)
				{
					this._texture.dispose();
				}
			}
			if(this._pendingBitmapDataTexture)
			{
				this._pendingBitmapDataTexture.dispose();
			}
			if(this._pendingRawTextureData)
			{
				this._pendingRawTextureData.clear();
			}
			this._currentTexture = null;
			this._currentTextureWidth = NaN;
			this._currentTextureHeight = NaN;
			this._pendingBitmapDataTexture = null;
			this._pendingRawTextureData = null;
			this._textureBitmapData = null;
			this._textureRawData = null;
			this._texture = null;
			this._isTextureOwner = false;
		}

		/**
		 * @private
		 */
		protected verifyCurrentStarling():void
		{
			if(!this.stage || Starling.current.stage === this.stage)
			{
				return;
			}
			for each(var starling:Starling in Starling.all)
			{
				if(starling.stage === this.stage)
				{
					starling.makeCurrent();
					break;
				}
			}
		}

		/**
		 * @private
		 */
		protected replaceBitmapDataTexture(bitmapData:BitmapData):void
		{
			if(Starling.handleLostContext && !Starling.current.contextValid)
			{
				//this trace duplicates the behavior of AssetManager
				trace(ImageLoader.CONTEXT_LOST_WARNING);
				setTimeout(this.replaceBitmapDataTexture, 1, bitmapData);
				return;
			}
			if(!SystemUtil.isDesktop && !SystemUtil.isApplicationActive)
			{
				//avoiding stage3d calls when a mobile application isn't active
				SystemUtil.executeWhenApplicationIsActive(this.replaceBitmapDataTexture, bitmapData);
				return;
			}
			this.verifyCurrentStarling();
			this._texture = Texture.fromBitmapData(bitmapData, false, false, 1, this._textureFormat);
			if(Starling.handleLostContext)
			{
				//we're saving it so that we can dispose it when we get a new
				//texture or when we're disposed
				this._textureBitmapData = bitmapData;
			}
			else
			{
				//since Starling isn't handling the lost context, we don't need
				//to save the texture bitmap data.
				bitmapData.dispose();
			}
			this._isTextureOwner = true;
			this._isLoaded = true;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			this.dispatchEventWith(this.starling.events.Event.COMPLETE);
		}

		/**
		 * @private
		 */
		protected replaceRawTextureData(rawData:ByteArray):void
		{
			if(Starling.handleLostContext && !Starling.current.contextValid)
			{
				//this trace duplicates the behavior of AssetManager
				trace(ImageLoader.CONTEXT_LOST_WARNING);
				setTimeout(this.replaceRawTextureData, 1, rawData);
				return;
			}
			if(!SystemUtil.isDesktop && !SystemUtil.isApplicationActive)
			{
				//avoiding stage3d calls when a mobile application isn't active
				SystemUtil.executeWhenApplicationIsActive(this.replaceRawTextureData, rawData);
				return;
			}
			this.verifyCurrentStarling();
			this._texture = Texture.fromAtfData(rawData);
			if(Starling.handleLostContext)
			{
				//we're saving it so that we can clear it when we get a new
				//texture or when we're disposed
				this._textureRawData = rawData;
			}
			else
			{
				//since Starling isn't handling the lost context, we don't need
				//to save the raw texture data.
				rawData.clear();
			}
			this._isTextureOwner = true;
			this._isLoaded = true;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			this.dispatchEventWith(this.starling.events.Event.COMPLETE);
		}

		/**
		 * @private
		 */
		protected addToTextureQueue():void
		{
			if(!this._delayTextureCreation)
			{
				throw new IllegalOperationError("Cannot add loader to delayed texture queue if delayTextureCreation is false.");
			}
			if(this._textureQueueDuration == Number.POSITIVE_INFINITY)
			{
				throw new IllegalOperationError("Cannot add loader to delayed texture queue if textureQueueDuration is Number.POSITIVE_INFINITY.");
			}
			if(this._isInTextureQueue)
			{
				throw new IllegalOperationError("Cannot add loader to delayed texture queue more than once.");
			}
			this.addEventListener(this.starling.events.Event.REMOVED_FROM_STAGE, this.imageLoader_removedFromStageHandler);
			this._isInTextureQueue = true;
			if(ImageLoader.textureQueueTail)
			{
				ImageLoader.textureQueueTail._textureQueueNext = this;
				this._textureQueuePrevious = ImageLoader.textureQueueTail;
				ImageLoader.textureQueueTail = this;
			}
			else
			{
				ImageLoader.textureQueueHead = this;
				ImageLoader.textureQueueTail = this;
				this.preparePendingTexture();
			}
		}

		/**
		 * @private
		 */
		protected removeFromTextureQueue():void
		{
			if(!this._isInTextureQueue)
			{
				return;
			}
			var previous:ImageLoader = this._textureQueuePrevious;
			var next:ImageLoader = this._textureQueueNext;
			this._textureQueuePrevious = null;
			this._textureQueueNext = null;
			this._isInTextureQueue = false;
			this.removeEventListener(this.starling.events.Event.REMOVED_FROM_STAGE, this.imageLoader_removedFromStageHandler);
			this.removeEventListener(EnterFrameEvent.ENTER_FRAME, this.processTextureQueue_enterFrameHandler);
			if(previous)
			{
				previous._textureQueueNext = next;
			}
			if(next)
			{
				next._textureQueuePrevious = previous;
			}
			var wasHead:boolean = ImageLoader.textureQueueHead == this;
			var wasTail:boolean = ImageLoader.textureQueueTail == this;
			if(wasTail)
			{
				ImageLoader.textureQueueTail = previous;
				if(wasHead)
				{
					ImageLoader.textureQueueHead = previous;
				}
			}
			if(wasHead)
			{
				ImageLoader.textureQueueHead = next;
				if(wasTail)
				{
					ImageLoader.textureQueueTail = next;
				}
			}
			if(wasHead && ImageLoader.textureQueueHead)
			{
				ImageLoader.textureQueueHead.preparePendingTexture();
			}
		}

		/**
		 * @private
		 */
		protected preparePendingTexture():void
		{
			if(this._textureQueueDuration > 0)
			{
				this._accumulatedPrepareTextureTime = 0;
				this.addEventListener(EnterFrameEvent.ENTER_FRAME, this.processTextureQueue_enterFrameHandler);
			}
			else
			{
				this.processPendingTexture();
			}
		}

		/**
		 * @private
		 */
		protected processPendingTexture():void
		{
			if(this._pendingBitmapDataTexture)
			{
				var bitmapData:BitmapData = this._pendingBitmapDataTexture;
				this._pendingBitmapDataTexture = null;
				this.replaceBitmapDataTexture(bitmapData);
			}
			if(this._pendingRawTextureData)
			{
				var rawData:ByteArray = this._pendingRawTextureData;
				this._pendingRawTextureData = null;
				this.replaceRawTextureData(rawData);
			}
			if(this._isInTextureQueue)
			{
				this.removeFromTextureQueue();
			}
		}

		/**
		 * @private
		 */
		protected processTextureQueue_enterFrameHandler(event:EnterFrameEvent):void
		{
			this._accumulatedPrepareTextureTime += event.passedTime;
			if(this._accumulatedPrepareTextureTime >= this._textureQueueDuration)
			{
				this.removeEventListener(EnterFrameEvent.ENTER_FRAME, this.processTextureQueue_enterFrameHandler);
				this.processPendingTexture();
			}
		}

		/**
		 * @private
		 */
		protected imageLoader_removedFromStageHandler(event:Eventing.events.Event):void
		{
			if(this._isInTextureQueue)
			{
				this.removeFromTextureQueue();
			}
		}

		/**
		 * @private
		 */
		protected loader_completeHandler(event:Event.events.Event):void
		{
			var bitmap:Bitmap = Bitmap(this.loader.content);
			this.loader.contentLoaderInfo.removeEventListener(this.flash.events.Event.COMPLETE, this.loader_completeHandler);
			this.loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, this.loader_errorHandler);
			this.loader.contentLoaderInfo.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.loader_errorHandler);
			this.loader = null;

			this.cleanupTexture();
			var bitmapData:BitmapData = bitmap.bitmapData;
			if(this._delayTextureCreation)
			{
				this._pendingBitmapDataTexture = bitmapData;
				if(this._textureQueueDuration < Number.POSITIVE_INFINITY)
				{
					this.addToTextureQueue();
				}
			}
			else
			{
				this.replaceBitmapDataTexture(bitmapData);
			}
		}

		/**
		 * @private
		 */
		protected loader_progressHandler(event:ProgressEvent):void
		{
			this.dispatchEventWith(FeathersEventType.PROGRESS, false, event.bytesLoaded / event.bytesTotal);
		}

		/**
		 * @private
		 */
		protected loader_errorHandler(event:ErrorEvent):void
		{
			this.loader.contentLoaderInfo.removeEventListener(this.flash.events.Event.COMPLETE, this.loader_completeHandler);
			this.loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, this.loader_errorHandler);
			this.loader.contentLoaderInfo.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.loader_errorHandler);
			this.loader = null;

			this.cleanupTexture();
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			this.dispatchEventWith(FeathersEventType.ERROR, false, event);
		}

		/**
		 * @private
		 */
		protected rawDataLoader_completeHandler(event:Event.events.Event):void
		{
			var rawData:ByteArray = ByteArray(this.urlLoader.data);
			this.urlLoader.removeEventListener(this.flash.events.Event.COMPLETE, this.rawDataLoader_completeHandler);
			this.urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.rawDataLoader_progressHandler);
			this.urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, this.rawDataLoader_errorHandler);
			this.urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.rawDataLoader_errorHandler);
			this.urlLoader = null;

			this.cleanupTexture();
			if(this._delayTextureCreation)
			{
				this._pendingRawTextureData = rawData;
				if(this._textureQueueDuration < Number.POSITIVE_INFINITY)
				{
					this.addToTextureQueue();
				}
			}
			else
			{
				this.replaceRawTextureData(rawData);
			}
		}

		/**
		 * @private
		 */
		protected rawDataLoader_progressHandler(event:ProgressEvent):void
		{
			this.dispatchEventWith(FeathersEventType.PROGRESS, false, event.bytesLoaded / event.bytesTotal);
		}

		/**
		 * @private
		 */
		protected rawDataLoader_errorHandler(event:ErrorEvent):void
		{
			this.urlLoader.removeEventListener(this.flash.events.Event.COMPLETE, this.rawDataLoader_completeHandler);
			this.urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.rawDataLoader_progressHandler);
			this.urlLoader.removeEventListener(IOErrorEvent.IO_ERROR, this.rawDataLoader_errorHandler);
			this.urlLoader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.rawDataLoader_errorHandler);
			this.urlLoader = null;

			this.cleanupTexture();
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			this.dispatchEventWith(FeathersEventType.ERROR, false, event);
		}
	}
}
