/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.display
{
	import IValidating = feathers.core.IValidating;
	import ValidationQueue = feathers.core.ValidationQueue;
	import getDisplayObjectDepthFromStage = feathers.utils.display.getDisplayObjectDepthFromStage;

	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;

	import RenderSupport = starling.core.RenderSupport;
	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Image = starling.display.Image;
	import QuadBatch = starling.display.QuadBatch;
	import Sprite = starling.display.Sprite;
	import Event = starling.events.Event;
	import Texture = starling.textures.Texture;
	import TextureSmoothing = starling.textures.TextureSmoothing;
	import MatrixUtil = starling.utils.MatrixUtil;

	/*[Exclude(name="numChildren",kind="property")]*/
	/*[Exclude(name="isFlattened",kind="property")]*/
	/*[Exclude(name="addChild",kind="method")]*/
	/*[Exclude(name="addChildAt",kind="method")]*/
	/*[Exclude(name="broadcastEvent",kind="method")]*/
	/*[Exclude(name="broadcastEventWith",kind="method")]*/
	/*[Exclude(name="contains",kind="method")]*/
	/*[Exclude(name="getChildAt",kind="method")]*/
	/*[Exclude(name="getChildByName",kind="method")]*/
	/*[Exclude(name="getChildIndex",kind="method")]*/
	/*[Exclude(name="removeChild",kind="method")]*/
	/*[Exclude(name="removeChildAt",kind="method")]*/
	/*[Exclude(name="removeChildren",kind="method")]*/
	/*[Exclude(name="setChildIndex",kind="method")]*/
	/*[Exclude(name="sortChildren",kind="method")]*/
	/*[Exclude(name="swapChildren",kind="method")]*/
	/*[Exclude(name="swapChildrenAt",kind="method")]*/
	/*[Exclude(name="flatten",kind="method")]*/
	/*[Exclude(name="unflatten",kind="method")]*/

	/**
	 * Tiles a texture to fill the specified bounds.
	 */
	export class TiledImage extends Sprite implements IValidating
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
		 * Constructor.
		 */
		constructor(texture:Texture, textureScale:number = 1)
		{
			super();
			this._hitArea = new Rectangle();
			this._textureScale = textureScale;
			this.texture = texture;
			this.initializeWidthAndHeight();

			this._batch = new QuadBatch();
			this._batch.touchable = false;
			this.addChild(this._batch);

			this.addEventListener(Event.FLATTEN, this.flattenHandler);
			this.addEventListener(Event.ADDED_TO_STAGE, this.addedToStageHandler);
		}

		private _propertiesChanged:boolean = true;
		private _layoutChanged:boolean = true;

		private _hitArea:Rectangle;

		private _batch:QuadBatch;
		private _image:Image;

		private _originalImageWidth:number;
		private _originalImageHeight:number;

		/**
		 * @private
		 */
		private _width:number = NaN;

		/**
		 * @private
		 */
		/*override*/ public get width():number
		{
			return this._width;
		}

		/**
		 * @private
		 */
		/*override*/ public set width(value:number)
		{
			if(this._width == value)
			{
				return;
			}
			this._width = this._hitArea.width = value;
			this._layoutChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _height:number = NaN;

		/**
		 * @private
		 */
		/*override*/ public get height():number
		{
			return this._height;
		}

		/**
		 * @private
		 */
		/*override*/ public set height(value:number)
		{
			if(this._height == value)
			{
				return;
			}
			this._height = this._hitArea.height = value;
			this._layoutChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _texture:Texture;

		/**
		 * The texture to tile.
		 *
		 * <p>In the following example, the texture is changed:</p>
		 *
		 * <listing version="3.0">
		 * image.texture = Texture.fromBitmapData( bitmapData );</listing>
		 */
		public get texture():Texture
		{
			return this._texture;
		}

		/**
		 * @private
		 */
		public set texture(value:Texture)
		{
			if(value == null)
			{
				throw new ArgumentError("Texture cannot be null");
			}
			if(this._texture == value)
			{
				return;
			}
			this._texture = value;
			if(!this._image)
			{
				this._image = new Image(value);
				this._image.touchable = false;
			}
			else
			{
				this._image.texture = value;
				this._image.readjustSize();
			}
			var frame:Rectangle = value.frame;
			if(!frame)
			{
				this._originalImageWidth = value.width;
				this._originalImageHeight = value.height;
			}
			else
			{
				this._originalImageWidth = frame.width;
				this._originalImageHeight = frame.height;
			}
			this._layoutChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _smoothing:string = TextureSmoothing.BILINEAR;

		/**
		 * The smoothing value to pass to the tiled images.
		 *
		 * <p>In the following example, the smoothing is changed:</p>
		 *
		 * <listing version="3.0">
		 * image.smoothing = TextureSmoothing.NONE;</listing>
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
			if(TextureSmoothing.isValid(value))
			{
				this._smoothing = value;
			}
			else
			{
				throw new ArgumentError("Invalid smoothing mode: " + value);
			}
			this._propertiesChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _color:number = 0xffffff;

		/**
		 * The color value to pass to the tiled images.
		 *
		 * <p>In the following example, the color is changed:</p>
		 *
		 * <listing version="3.0">
		 * image.color = 0xff00ff;</listing>
		 *
		 * @default 0xffffff
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
			this._propertiesChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _useSeparateBatch:boolean = true;

		/**
		 * Determines if the tiled images are batched normally by Starling or if
		 * they're batched separately.
		 *
		 * <p>In the following example, separate batching is disabled:</p>
		 *
		 * <listing version="3.0">
		 * image.useSeparateBatch = false;</listing>
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
			this._propertiesChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _textureScale:number = 1;

		/**
		 * Scales the texture dimensions during measurement. Useful for UI that
		 * should scale based on screen density or resolution.
		 *
		 * <p>In the following example, the texture scale is changed:</p>
		 *
		 * <listing version="3.0">
		 * image.textureScale = 2;</listing>
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
			this._layoutChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _isValidating:boolean = false;

		/**
		 * @private
		 */
		private _isInvalid:boolean = false;

		/**
		 * @private
		 */
		private _validationQueue:ValidationQueue;

		/**
		 * @private
		 */
		private _depth:number = -1;

		/**
		 * @copy feathers.core.IValidating#depth
		 */
		public get depth():number
		{
			return this._depth;
		}

		/**
		 * @private
		 */
		public /*override*/ getBounds(targetSpace:DisplayObject, resultRect:Rectangle=null):Rectangle
		{
			if(!resultRect)
			{
				resultRect = new Rectangle();
			}

			var minX:number = Number.MAX_VALUE, maxX:number = -Number.MAX_VALUE;
			var minY:number = Number.MAX_VALUE, maxY:number = -Number.MAX_VALUE;

			if (targetSpace == this) // optimization
			{
				minX = this._hitArea.x;
				minY = this._hitArea.y;
				maxX = this._hitArea.x + this._hitArea.width;
				maxY = this._hitArea.y + this._hitArea.height;
			}
			else
			{
				this.getTransformationMatrix(targetSpace, TiledImage.HELPER_MATRIX);

				MatrixUtil.transformCoords(TiledImage.HELPER_MATRIX, this._hitArea.x, this._hitArea.y, TiledImage.HELPER_POINT);
				minX = minX < TiledImage.HELPER_POINT.x ? minX : TiledImage.HELPER_POINT.x;
				maxX = maxX > TiledImage.HELPER_POINT.x ? maxX : TiledImage.HELPER_POINT.x;
				minY = minY < TiledImage.HELPER_POINT.y ? minY : TiledImage.HELPER_POINT.y;
				maxY = maxY > TiledImage.HELPER_POINT.y ? maxY : TiledImage.HELPER_POINT.y;

				MatrixUtil.transformCoords(TiledImage.HELPER_MATRIX, this._hitArea.x, this._hitArea.y + this._hitArea.height, TiledImage.HELPER_POINT);
				minX = minX < TiledImage.HELPER_POINT.x ? minX : TiledImage.HELPER_POINT.x;
				maxX = maxX > TiledImage.HELPER_POINT.x ? maxX : TiledImage.HELPER_POINT.x;
				minY = minY < TiledImage.HELPER_POINT.y ? minY : TiledImage.HELPER_POINT.y;
				maxY = maxY > TiledImage.HELPER_POINT.y ? maxY : TiledImage.HELPER_POINT.y;

				MatrixUtil.transformCoords(TiledImage.HELPER_MATRIX, this._hitArea.x + this._hitArea.width, this._hitArea.y, TiledImage.HELPER_POINT);
				minX = minX < TiledImage.HELPER_POINT.x ? minX : TiledImage.HELPER_POINT.x;
				maxX = maxX > TiledImage.HELPER_POINT.x ? maxX : TiledImage.HELPER_POINT.x;
				minY = minY < TiledImage.HELPER_POINT.y ? minY : TiledImage.HELPER_POINT.y;
				maxY = maxY > TiledImage.HELPER_POINT.y ? maxY : TiledImage.HELPER_POINT.y;

				MatrixUtil.transformCoords(TiledImage.HELPER_MATRIX, this._hitArea.x + this._hitArea.width, this._hitArea.y + this._hitArea.height, TiledImage.HELPER_POINT);
				minX = minX < TiledImage.HELPER_POINT.x ? minX : TiledImage.HELPER_POINT.x;
				maxX = maxX > TiledImage.HELPER_POINT.x ? maxX : TiledImage.HELPER_POINT.x;
				minY = minY < TiledImage.HELPER_POINT.y ? minY : TiledImage.HELPER_POINT.y;
				maxY = maxY > TiledImage.HELPER_POINT.y ? maxY : TiledImage.HELPER_POINT.y;
			}

			resultRect.x = minX;
			resultRect.y = minY;
			resultRect.width  = maxX - minX;
			resultRect.height = maxY - minY;

			return resultRect;
		}

		/**
		 * @private
		 */
		/*override*/ public hitTest(localPoint:Point, forTouch:boolean=false):DisplayObject
		{
			if(forTouch && (!this.visible || !this.touchable))
			{
				return null;
			}
			return this._hitArea.containsPoint(localPoint) ? this : null;
		}

		/**
		 * Set both the width and height in one call.
		 */
		public setSize(width:number, height:number):void
		{
			this.width = width;
			this.height = height;
		}

		/**
		 * @private
		 */
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			if(this._isInvalid)
			{
				this.validate();
			}
			super.render(support, parentAlpha);
		}

		/**
		 * @copy feathers.core.IValidating#validate()
		 */
		public validate():void
		{
			if(!this._isInvalid)
			{
				return;
			}
			if(this._isValidating)
			{
				if(this._validationQueue)
				{
					//we were already validating, and something else told us to
					//validate. that's bad.
					this._validationQueue.addControl(this, true);
				}
				return;
			}
			this._isValidating = true;
			if(this._propertiesChanged)
			{
				this._image.smoothing = this._smoothing;
				this._image.color = this._color;
			}
			if(this._propertiesChanged || this._layoutChanged)
			{
				this._batch.batchable = !this._useSeparateBatch;
				this._batch.reset();
				this._image.scaleX = this._image.scaleY = this._textureScale;
				var scaledTextureWidth:number = this._originalImageWidth * this._textureScale;
				var scaledTextureHeight:number = this._originalImageHeight * this._textureScale;
				var xImageCount:number = Math.ceil(this._width / scaledTextureWidth);
				var yImageCount:number = Math.ceil(this._height / scaledTextureHeight);
				var imageCount:number = xImageCount * yImageCount;
				var xPosition:number = 0;
				var yPosition:number = 0;
				var nextXPosition:number = xPosition + scaledTextureWidth;
				var nextYPosition:number = yPosition + scaledTextureHeight;
				for(var i:number = 0; i < imageCount; i++)
				{
					this._image.x = xPosition;
					this._image.y = yPosition;

					var imageWidth:number = (nextXPosition >= this._width) ? (this._width - xPosition) : scaledTextureWidth;
					var imageHeight:number = (nextYPosition >= this._height) ? (this._height - yPosition) : scaledTextureHeight;
					this._image.width = imageWidth;
					this._image.height = imageHeight;

					var xCoord:number = imageWidth / scaledTextureWidth;
					var yCoord:number = imageHeight / scaledTextureHeight;
					TiledImage.HELPER_POINT.x = xCoord;
					TiledImage.HELPER_POINT.y = 0;
					this._image.setTexCoords(1, TiledImage.HELPER_POINT);

					TiledImage.HELPER_POINT.y = yCoord;
					this._image.setTexCoords(3, TiledImage.HELPER_POINT);

					TiledImage.HELPER_POINT.x = 0;
					this._image.setTexCoords(2, TiledImage.HELPER_POINT);

					this._batch.addImage(this._image);

					if(nextXPosition >= this._width)
					{
						xPosition = 0;
						nextXPosition = scaledTextureWidth;
						yPosition = nextYPosition;
						nextYPosition += scaledTextureHeight;
					}
					else
					{
						xPosition = nextXPosition;
						nextXPosition += scaledTextureWidth;
					}
				}
			}
			this._layoutChanged = false;
			this._propertiesChanged = false;
			this._isInvalid = false;
			this._isValidating = false;
		}

		/**
		 * @private
		 */
		protected invalidate():void
		{
			if(this._isInvalid)
			{
				return;
			}
			this._isInvalid = true;
			if(!this._validationQueue)
			{
				return;
			}
			this._validationQueue.addControl(this, false);
		}

		/**
		 * @private
		 */
		private initializeWidthAndHeight():void
		{
			this.width = this._originalImageWidth * this._textureScale;
			this.height = this._originalImageHeight * this._textureScale;
		}

		/**
		 * @private
		 */
		private flattenHandler(event:Event):void
		{
			this.validate();
		}

		/**
		 * @private
		 */
		private addedToStageHandler(event:Event):void
		{
			this._depth = getDisplayObjectDepthFromStage(this);
			this._validationQueue = ValidationQueue.forStarling(Starling.current);
			if(this._isInvalid)
			{
				this._validationQueue.addControl(this, false);
			}
		}

	}
}