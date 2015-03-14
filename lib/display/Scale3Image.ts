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
	import Scale3Textures = feathers.textures.Scale3Textures;
	import getDisplayObjectDepthFromStage = feathers.utils.display.getDisplayObjectDepthFromStage;

	import IllegalOperationError = flash.errors.IllegalOperationError;
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
	 * Scales an image like a "pill" shape with three regions, either
	 * horizontally or vertically. The edge regions scale while maintaining
	 * aspect ratio, and the middle region stretches to fill the remaining
	 * space.
	 */
	export class Scale3Image extends Sprite implements IValidating
	{
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
		private static helperImage:Image;

		/**
		 * Constructor.
		 */
		constructor(textures:Scale3Textures, textureScale:number = 1)
		{
			super();
			this.textures = textures;
			this._textureScale = textureScale;
			this._hitArea = new Rectangle();
			this.readjustSize();

			this._batch = new QuadBatch();
			this._batch.touchable = false;
			this.addChild(this._batch);

			this.addEventListener(Event.FLATTEN, this.flattenHandler);
			this.addEventListener(Event.ADDED_TO_STAGE, this.addedToStageHandler);
		}

		/**
		 * @private
		 */
		private _propertiesChanged:boolean = true;

		/**
		 * @private
		 */
		private _renderingChanged:boolean = true;

		/**
		 * @private
		 */
		private _layoutChanged:boolean = true;

		/**
		 * @private
		 */
		private _frame:Rectangle;

		/**
		 * @private
		 */
		private _textures:Scale3Textures;

		/**
		 * The textures displayed by this image.
		 *
		 * <p>In the following example, the textures are changed:</p>
		 *
		 * <listing version="3.0">
		 * image.textures = new Scale3Textures( texture, firstRegionWidth, secondRegionWidth, Scale3Textures.DIRECTION_HORIZONTAL );</listing>
		 */
		public get textures():Scale3Textures
		{
			return this._textures;
		}

		/**
		 * @private
		 */
		public set textures(value:Scale3Textures)
		{
			if(!value)
			{
				throw new IllegalOperationError("Scale3Image textures cannot be null.");
			}
			if(this._textures == value)
			{
				return;
			}
			this._textures = value;
			var texture:Texture = this._textures.texture;
			this._frame = texture.frame;
			if(!this._frame)
			{
				this._frame = new Rectangle(0, 0, texture.width, texture.height);
			}
			this._layoutChanged = true;
			this._renderingChanged = true;
			this.invalidate();
		}

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
		private _smoothing:string = TextureSmoothing.BILINEAR;

		/**
		 * The smoothing value to pass to the images.
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
			if(this._smoothing == value)
			{
				return;
			}
			this._smoothing = value;
			this._propertiesChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _color:number = 0xffffff;

		/**
		 * The color value to pass to the images.
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
		 * Determines if the regions are batched normally by Starling or if
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
			this._renderingChanged = true;
			this.invalidate();
		}

		/**
		 * @private
		 */
		private _hitArea:Rectangle;

		/**
		 * @private
		 */
		private _batch:QuadBatch;

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
				this.getTransformationMatrix(targetSpace, Scale3Image.HELPER_MATRIX);

				MatrixUtil.transformCoords(Scale3Image.HELPER_MATRIX, this._hitArea.x, this._hitArea.y, Scale3Image.HELPER_POINT);
				minX = minX < Scale3Image.HELPER_POINT.x ? minX : Scale3Image.HELPER_POINT.x;
				maxX = maxX > Scale3Image.HELPER_POINT.x ? maxX : Scale3Image.HELPER_POINT.x;
				minY = minY < Scale3Image.HELPER_POINT.y ? minY : Scale3Image.HELPER_POINT.y;
				maxY = maxY > Scale3Image.HELPER_POINT.y ? maxY : Scale3Image.HELPER_POINT.y;

				MatrixUtil.transformCoords(Scale3Image.HELPER_MATRIX, this._hitArea.x, this._hitArea.y + this._hitArea.height, Scale3Image.HELPER_POINT);
				minX = minX < Scale3Image.HELPER_POINT.x ? minX : Scale3Image.HELPER_POINT.x;
				maxX = maxX > Scale3Image.HELPER_POINT.x ? maxX : Scale3Image.HELPER_POINT.x;
				minY = minY < Scale3Image.HELPER_POINT.y ? minY : Scale3Image.HELPER_POINT.y;
				maxY = maxY > Scale3Image.HELPER_POINT.y ? maxY : Scale3Image.HELPER_POINT.y;

				MatrixUtil.transformCoords(Scale3Image.HELPER_MATRIX, this._hitArea.x + this._hitArea.width, this._hitArea.y, Scale3Image.HELPER_POINT);
				minX = minX < Scale3Image.HELPER_POINT.x ? minX : Scale3Image.HELPER_POINT.x;
				maxX = maxX > Scale3Image.HELPER_POINT.x ? maxX : Scale3Image.HELPER_POINT.x;
				minY = minY < Scale3Image.HELPER_POINT.y ? minY : Scale3Image.HELPER_POINT.y;
				maxY = maxY > Scale3Image.HELPER_POINT.y ? maxY : Scale3Image.HELPER_POINT.y;

				MatrixUtil.transformCoords(Scale3Image.HELPER_MATRIX, this._hitArea.x + this._hitArea.width, this._hitArea.y + this._hitArea.height, Scale3Image.HELPER_POINT);
				minX = minX < Scale3Image.HELPER_POINT.x ? minX : Scale3Image.HELPER_POINT.x;
				maxX = maxX > Scale3Image.HELPER_POINT.x ? maxX : Scale3Image.HELPER_POINT.x;
				minY = minY < Scale3Image.HELPER_POINT.y ? minY : Scale3Image.HELPER_POINT.y;
				maxY = maxY > Scale3Image.HELPER_POINT.y ? maxY : Scale3Image.HELPER_POINT.y;
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
			if(this._propertiesChanged || this._layoutChanged || this._renderingChanged)
			{
				this._batch.batchable = !this._useSeparateBatch;
				this._batch.reset();

				if(!Scale3Image.helperImage)
				{
					//because Scale3Textures enforces it, we know for sure that
					//this texture will have a size greater than zero, so there
					//won't be an error from Quad.
					Scale3Image.helperImage = new Image(this._textures.second);
				}
				Scale3Image.helperImage.smoothing = this._smoothing;
				Scale3Image.helperImage.color = this._color;

				var image:Image;
				if(this._textures.direction == Scale3Textures.DIRECTION_VERTICAL)
				{
					var scaledOppositeEdgeSize:number = this._width;
					var oppositeEdgeScale:number = scaledOppositeEdgeSize / this._frame.width;
					var scaledFirstRegionSize:number = this._textures.firstRegionSize * oppositeEdgeScale;
					var scaledThirdRegionSize:number = (this._frame.height - this._textures.firstRegionSize - this._textures.secondRegionSize) * oppositeEdgeScale;sumFirstAndThird = scaledFirstRegionSize + scaledThirdRegionSize;
					var sumFirstAndThird:number = scaledFirstRegionSize + scaledThirdRegionSize;
					if(sumFirstAndThird > this._height)
					{
						var distortionScale:number = (this._height / sumFirstAndThird);
						scaledFirstRegionSize *= distortionScale;
						scaledThirdRegionSize *= distortionScale;
						sumFirstAndThird = scaledFirstRegionSize + scaledThirdRegionSize;
					}
					var scaledSecondRegionSize:number = this._height - sumFirstAndThird;

					if(scaledOppositeEdgeSize > 0)
					{
						if(scaledFirstRegionSize > 0)
						{
							Scale3Image.helperImage.texture = this._textures.first;
							Scale3Image.helperImage.readjustSize();
							Scale3Image.helperImage.x = 0;
							Scale3Image.helperImage.y = 0;
							Scale3Image.helperImage.width = scaledOppositeEdgeSize;
							Scale3Image.helperImage.height = scaledFirstRegionSize;
							this._batch.addImage(Scale3Image.helperImage);
						}

						if(scaledSecondRegionSize > 0)
						{
							Scale3Image.helperImage.texture = this._textures.second;
							Scale3Image.helperImage.readjustSize();
							Scale3Image.helperImage.x = 0;
							Scale3Image.helperImage.y = scaledFirstRegionSize;
							Scale3Image.helperImage.width = scaledOppositeEdgeSize;
							Scale3Image.helperImage.height = scaledSecondRegionSize;
							this._batch.addImage(Scale3Image.helperImage);
						}

						if(scaledThirdRegionSize > 0)
						{
							Scale3Image.helperImage.texture = this._textures.third;
							Scale3Image.helperImage.readjustSize();
							Scale3Image.helperImage.x = 0;
							Scale3Image.helperImage.y = this._height - scaledThirdRegionSize;
							Scale3Image.helperImage.width = scaledOppositeEdgeSize;
							Scale3Image.helperImage.height = scaledThirdRegionSize;
							this._batch.addImage(Scale3Image.helperImage);
						}
					}
				}
				else //horizontal
				{
					scaledOppositeEdgeSize = this._height;
					oppositeEdgeScale = scaledOppositeEdgeSize / this._frame.height;
					scaledFirstRegionSize = this._textures.firstRegionSize * oppositeEdgeScale;
					scaledThirdRegionSize = (this._frame.width - this._textures.firstRegionSize - this._textures.secondRegionSize) * oppositeEdgeScale;sumFirstAndThird = scaledFirstRegionSize + scaledThirdRegionSize;
					sumFirstAndThird = scaledFirstRegionSize + scaledThirdRegionSize;
					if(sumFirstAndThird > this._width)
					{
						distortionScale = (this._width / sumFirstAndThird);
						scaledFirstRegionSize *= distortionScale;
						scaledThirdRegionSize *= distortionScale;
						sumFirstAndThird = scaledFirstRegionSize + scaledThirdRegionSize;
					}
					scaledSecondRegionSize = this._width - sumFirstAndThird;

					if(scaledOppositeEdgeSize > 0)
					{
						if(scaledFirstRegionSize > 0)
						{
							Scale3Image.helperImage.texture = this._textures.first;
							Scale3Image.helperImage.readjustSize();
							Scale3Image.helperImage.x = 0;
							Scale3Image.helperImage.y = 0;
							Scale3Image.helperImage.width = scaledFirstRegionSize;
							Scale3Image.helperImage.height = scaledOppositeEdgeSize;
							this._batch.addImage(Scale3Image.helperImage);
						}

						if(scaledSecondRegionSize > 0)
						{
							Scale3Image.helperImage.texture = this._textures.second;
							Scale3Image.helperImage.readjustSize();
							Scale3Image.helperImage.x = scaledFirstRegionSize;
							Scale3Image.helperImage.y = 0;
							Scale3Image.helperImage.width = scaledSecondRegionSize;
							Scale3Image.helperImage.height = scaledOppositeEdgeSize;
							this._batch.addImage(Scale3Image.helperImage);
						}

						if(scaledThirdRegionSize > 0)
						{
							Scale3Image.helperImage.texture = this._textures.third;
							Scale3Image.helperImage.readjustSize();
							Scale3Image.helperImage.x = this._width - scaledThirdRegionSize;
							Scale3Image.helperImage.y = 0;
							Scale3Image.helperImage.width = scaledThirdRegionSize;
							Scale3Image.helperImage.height = scaledOppositeEdgeSize;
							this._batch.addImage(Scale3Image.helperImage);
						}
					}
				}
			}
			this._propertiesChanged = false;
			this._layoutChanged = false;
			this._renderingChanged = false;
			this._isInvalid = false;
			this._isValidating = false;
		}

		/**
		 * Readjusts the dimensions of the image according to its current
		 * textures. Call this method to synchronize image and texture size
		 * after assigning textures with a different size.
		 */
		public readjustSize():void
		{
			this.width = this._frame.width * this._textureScale;
			this.height = this._frame.height * this._textureScale;
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
