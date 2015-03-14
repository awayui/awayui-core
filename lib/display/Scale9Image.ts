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
	import Scale9Textures = feathers.textures.Scale9Textures;
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
	 * Scales an image with nine regions to maintain the aspect ratio of the
	 * corners regions. The top and bottom regions stretch horizontally, and the
	 * left and right regions scale vertically. The center region stretches in
	 * both directions to fill the remaining space.
	 */
	export class Scale9Image extends Sprite implements IValidating
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
		constructor(textures:Scale9Textures, textureScale:number = 1)
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
		private _layoutChanged:boolean = true;

		/**
		 * @private
		 */
		private _renderingChanged:boolean = true;

		/**
		 * @private
		 */
		private _frame:Rectangle;

		/**
		 * @private
		 */
		private _textures:Scale9Textures;

		/**
		 * The textures displayed by this image.
		 *
		 * <p>In the following example, the textures are changed:</p>
		 *
		 * <listing version="3.0">
		 * image.textures = new Scale9Textures( texture, scale9Grid );</listing>
		 */
		public get textures():Scale9Textures
		{
			return this._textures;
		}

		/**
		 * @private
		 */
		public set textures(value:Scale9Textures)
		{
			if(!value)
			{
				throw new IllegalOperationError("Scale9Image textures cannot be null.");
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
		 * <p>In the following example, the separate batching is disabled:</p>
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
				this.getTransformationMatrix(targetSpace, Scale9Image.HELPER_MATRIX);

				MatrixUtil.transformCoords(Scale9Image.HELPER_MATRIX, this._hitArea.x, this._hitArea.y, Scale9Image.HELPER_POINT);
				minX = minX < Scale9Image.HELPER_POINT.x ? minX : Scale9Image.HELPER_POINT.x;
				maxX = maxX > Scale9Image.HELPER_POINT.x ? maxX : Scale9Image.HELPER_POINT.x;
				minY = minY < Scale9Image.HELPER_POINT.y ? minY : Scale9Image.HELPER_POINT.y;
				maxY = maxY > Scale9Image.HELPER_POINT.y ? maxY : Scale9Image.HELPER_POINT.y;

				MatrixUtil.transformCoords(Scale9Image.HELPER_MATRIX, this._hitArea.x, this._hitArea.y + this._hitArea.height, Scale9Image.HELPER_POINT);
				minX = minX < Scale9Image.HELPER_POINT.x ? minX : Scale9Image.HELPER_POINT.x;
				maxX = maxX > Scale9Image.HELPER_POINT.x ? maxX : Scale9Image.HELPER_POINT.x;
				minY = minY < Scale9Image.HELPER_POINT.y ? minY : Scale9Image.HELPER_POINT.y;
				maxY = maxY > Scale9Image.HELPER_POINT.y ? maxY : Scale9Image.HELPER_POINT.y;

				MatrixUtil.transformCoords(Scale9Image.HELPER_MATRIX, this._hitArea.x + this._hitArea.width, this._hitArea.y, Scale9Image.HELPER_POINT);
				minX = minX < Scale9Image.HELPER_POINT.x ? minX : Scale9Image.HELPER_POINT.x;
				maxX = maxX > Scale9Image.HELPER_POINT.x ? maxX : Scale9Image.HELPER_POINT.x;
				minY = minY < Scale9Image.HELPER_POINT.y ? minY : Scale9Image.HELPER_POINT.y;
				maxY = maxY > Scale9Image.HELPER_POINT.y ? maxY : Scale9Image.HELPER_POINT.y;

				MatrixUtil.transformCoords(Scale9Image.HELPER_MATRIX, this._hitArea.x + this._hitArea.width, this._hitArea.y + this._hitArea.height, Scale9Image.HELPER_POINT);
				minX = minX < Scale9Image.HELPER_POINT.x ? minX : Scale9Image.HELPER_POINT.x;
				maxX = maxX > Scale9Image.HELPER_POINT.x ? maxX : Scale9Image.HELPER_POINT.x;
				minY = minY < Scale9Image.HELPER_POINT.y ? minY : Scale9Image.HELPER_POINT.y;
				maxY = maxY > Scale9Image.HELPER_POINT.y ? maxY : Scale9Image.HELPER_POINT.y;
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

				if(!Scale9Image.helperImage)
				{
					//because Scale9Textures enforces it, we know for sure that
					//this texture will have a size greater than zero, so there
					//won't be an error from Quad.
					Scale9Image.helperImage = new Image(this._textures.middleCenter);
				}
				Scale9Image.helperImage.smoothing = this._smoothing;
				Scale9Image.helperImage.color = this._color;

				var grid:Rectangle = this._textures.scale9Grid;
				var scaledLeftWidth:number = grid.x * this._textureScale;
				var scaledRightWidth:number = (this._frame.width - grid.x - grid.width) * this._textureScale;
				var sumLeftAndRight:number = scaledLeftWidth + scaledRightWidth;
				if(sumLeftAndRight > this._width)
				{
					var distortionScale:number = (this._width / sumLeftAndRight);
					scaledLeftWidth *= distortionScale;
					scaledRightWidth *= distortionScale;
					sumLeftAndRight = scaledLeftWidth + scaledRightWidth;
				}
				var scaledCenterWidth:number = this._width - sumLeftAndRight;
				var scaledTopHeight:number = grid.y * this._textureScale;
				var scaledBottomHeight:number = (this._frame.height - grid.y - grid.height) * this._textureScale;
				var sumTopAndBottom:number = scaledTopHeight + scaledBottomHeight;
				if(sumTopAndBottom > this._height)
				{
					distortionScale = (this._height / sumTopAndBottom);
					scaledTopHeight *= distortionScale;
					scaledBottomHeight *= distortionScale;
					sumTopAndBottom = scaledTopHeight + scaledBottomHeight;
				}
				var scaledMiddleHeight:number = this._height - sumTopAndBottom;

				if(scaledTopHeight > 0)
				{
					if(scaledLeftWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.topLeft;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledLeftWidth;
						Scale9Image.helperImage.height = scaledTopHeight;
						Scale9Image.helperImage.x = scaledLeftWidth - Scale9Image.helperImage.width;
						Scale9Image.helperImage.y = scaledTopHeight - Scale9Image.helperImage.height;
						this._batch.addImage(Scale9Image.helperImage);
					}

					if(scaledCenterWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.topCenter;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledCenterWidth;
						Scale9Image.helperImage.height = scaledTopHeight;
						Scale9Image.helperImage.x = scaledLeftWidth;
						Scale9Image.helperImage.y = scaledTopHeight - Scale9Image.helperImage.height;
						this._batch.addImage(Scale9Image.helperImage);
					}

					if(scaledRightWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.topRight;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledRightWidth;
						Scale9Image.helperImage.height = scaledTopHeight;
						Scale9Image.helperImage.x = this._width - scaledRightWidth;
						Scale9Image.helperImage.y = scaledTopHeight - Scale9Image.helperImage.height;
						this._batch.addImage(Scale9Image.helperImage);
					}
				}

				if(scaledMiddleHeight > 0)
				{
					if(scaledLeftWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.middleLeft;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledLeftWidth;
						Scale9Image.helperImage.height = scaledMiddleHeight;
						Scale9Image.helperImage.x = scaledLeftWidth - Scale9Image.helperImage.width;
						Scale9Image.helperImage.y = scaledTopHeight;
						this._batch.addImage(Scale9Image.helperImage);
					}

					if(scaledCenterWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.middleCenter;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledCenterWidth;
						Scale9Image.helperImage.height = scaledMiddleHeight;
						Scale9Image.helperImage.x = scaledLeftWidth;
						Scale9Image.helperImage.y = scaledTopHeight;
						this._batch.addImage(Scale9Image.helperImage);
					}

					if(scaledRightWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.middleRight;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledRightWidth;
						Scale9Image.helperImage.height = scaledMiddleHeight;
						Scale9Image.helperImage.x = this._width - scaledRightWidth;
						Scale9Image.helperImage.y = scaledTopHeight;
						this._batch.addImage(Scale9Image.helperImage);
					}
				}

				if(scaledBottomHeight > 0)
				{
					if(scaledLeftWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.bottomLeft;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledLeftWidth;
						Scale9Image.helperImage.height = scaledBottomHeight;
						Scale9Image.helperImage.x = scaledLeftWidth - Scale9Image.helperImage.width;
						Scale9Image.helperImage.y = this._height - scaledBottomHeight;
						this._batch.addImage(Scale9Image.helperImage);
					}

					if(scaledCenterWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.bottomCenter;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledCenterWidth;
						Scale9Image.helperImage.height = scaledBottomHeight;
						Scale9Image.helperImage.x = scaledLeftWidth;
						Scale9Image.helperImage.y = this._height - scaledBottomHeight;
						this._batch.addImage(Scale9Image.helperImage);
					}

					if(scaledRightWidth > 0)
					{
						Scale9Image.helperImage.texture = this._textures.bottomRight;
						Scale9Image.helperImage.readjustSize();
						Scale9Image.helperImage.width = scaledRightWidth;
						Scale9Image.helperImage.height = scaledBottomHeight;
						Scale9Image.helperImage.x = this._width - scaledRightWidth;
						Scale9Image.helperImage.y = this._height - scaledBottomHeight;
						this._batch.addImage(Scale9Image.helperImage);
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