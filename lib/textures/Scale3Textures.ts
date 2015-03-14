/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.textures
{
	import Rectangle = flash.geom.Rectangle;

	import Texture = starling.textures.Texture;

	/**
	 * Slices a Starling Texture into three regions to be used by <code>Scale3Image</code>.
	 *
	 * @see feathers.display.Scale3Image
	 */
	export class Scale3Textures
	{
		/**
		 * @private
		 */
		private static SECOND_REGION_ERROR:string = "The size of the second region must be greater than zero.";

		/**
		 * @private
		 */
		private static SUM_X_REGIONS_ERROR:string = "The combined height of the first and second regions must be less than or equal to the width of the texture.";

		/**
		 * @private
		 */
		private static SUM_Y_REGIONS_ERROR:string = "The combined width of the first and second regions must be less than or equal to the height of the texture.";

		/**
		 * If the direction is horizontal, the layout will start on the left and continue to the right.
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * If the direction is vertical, the layout will start on the top and continue to the bottom.
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * @private
		 */
		private static HELPER_RECTANGLE:Rectangle = new Rectangle();

		/**
		 * Constructor.
		 *
		 * @param texture			A Starling Texture to slice up into three regions. It is recommended to turn of mip-maps for best rendering results.
		 * @param firstRegionSize	The size, in pixels, of the first of the three regions. This value should be based on the original texture dimensions, with no adjustments for scale factor.
		 * @param secondRegionSize	The size, in pixels, of the second of the three regions. This value should be based on the original texture dimensions, with no adjustments for scale factor.
		 * @param direction			Indicates if the regions should be positioned horizontally or vertically.
		 */
		constructor(texture:Texture, firstRegionSize:number, secondRegionSize:number, direction:string = Scale3Textures.DIRECTION_HORIZONTAL)
		{
			if(secondRegionSize <= 0)
			{
				throw new ArgumentError(Scale3Textures.SECOND_REGION_ERROR);
			}
			var textureFrame:Rectangle = texture.frame;
			if(!textureFrame)
			{
				textureFrame = Scale3Textures.HELPER_RECTANGLE;
				textureFrame.setTo(0, 0, texture.width, texture.height);
			}
			var sumRegions:number = firstRegionSize + secondRegionSize;
			if(direction == Scale3Textures.DIRECTION_HORIZONTAL)
			{
				if(sumRegions > textureFrame.width)
				{
					throw new ArgumentError(Scale3Textures.SUM_X_REGIONS_ERROR);
				}
			}
			else if(sumRegions > textureFrame.height) //vertical
			{
				throw new ArgumentError(Scale3Textures.SUM_Y_REGIONS_ERROR);
			}
			this._texture = texture;
			this._firstRegionSize = firstRegionSize;
			this._secondRegionSize = secondRegionSize;
			this._direction = direction;
			this.initialize();
		}

		/**
		 * @private
		 */
		private _texture:Texture;

		/**
		 * The original texture.
		 */
		public get texture():Texture
		{
			return this._texture;
		}

		/**
		 * @private
		 */
		private _firstRegionSize:number;

		/**
		 * The size of the first region, in pixels.
		 */
		public get firstRegionSize():number
		{
			return this._firstRegionSize;
		}

		/**
		 * @private
		 */
		private _secondRegionSize:number;

		/**
		 * The size of the second region, in pixels.
		 */
		public get secondRegionSize():number
		{
			return this._secondRegionSize;
		}

		/**
		 * @private
		 */
		private _direction:string;

		/**
		 * The direction of the sub-texture layout.
		 *
		 * @default Scale3Textures.DIRECTION_HORIZONTAL
		 *
		 * @see #DIRECTION_HORIZONTAL
		 * @see #DIRECTION_VERTICAL
		 */
		public get direction():string
		{
			return this._direction;
		}

		/**
		 * @private
		 */
		private _first:Texture;

		/**
		 * The texture for the first region.
		 */
		public get first():Texture
		{
			return this._first;
		}

		/**
		 * @private
		 */
		private _second:Texture;

		/**
		 * The texture for the second region.
		 */
		public get second():Texture
		{
			return this._second;
		}

		/**
		 * @private
		 */
		private _third:Texture;

		/**
		 * The texture for the third region.
		 */
		public get third():Texture
		{
			return this._third;
		}

		/**
		 * @private
		 */
		private initialize():void
		{
			var textureFrame:Rectangle = this._texture.frame;
			if(!textureFrame)
			{
				textureFrame = Scale3Textures.HELPER_RECTANGLE;
				textureFrame.setTo(0, 0, this._texture.width, this._texture.height);
			}
			var thirdRegionSize:number;
			if(this._direction == Scale3Textures.DIRECTION_VERTICAL)
			{
				thirdRegionSize = textureFrame.height - this._firstRegionSize - this._secondRegionSize;
			}
			else
			{
				thirdRegionSize = textureFrame.width - this._firstRegionSize - this._secondRegionSize;
			}

			if(this._direction == Scale3Textures.DIRECTION_VERTICAL)
			{
				var regionTopHeight:number = this._firstRegionSize + textureFrame.y;
				var regionBottomHeight:number = thirdRegionSize - (textureFrame.height - this._texture.height) - textureFrame.y;

				var hasTopFrame:boolean = regionTopHeight != this._firstRegionSize;
				var hasRightFrame:boolean = (textureFrame.width - textureFrame.x) != this._texture.width;
				var hasBottomFrame:boolean = regionBottomHeight != thirdRegionSize;
				var hasLeftFrame:boolean = textureFrame.x != 0;

				var firstRegion:Rectangle = new Rectangle(0, 0, this._texture.width, regionTopHeight);
				var firstFrame:Rectangle = (hasLeftFrame || hasRightFrame || hasTopFrame) ? new Rectangle(textureFrame.x, textureFrame.y, textureFrame.width, this._firstRegionSize) : null;
				this._first = Texture.fromTexture(this.texture, firstRegion, firstFrame);

				var secondRegion:Rectangle = new Rectangle(0, regionTopHeight, this._texture.width, this._secondRegionSize);
				var secondFrame:Rectangle = (hasLeftFrame || hasRightFrame) ? new Rectangle(textureFrame.x, 0, textureFrame.width, this._secondRegionSize) : null;
				this._second = Texture.fromTexture(this.texture, secondRegion, secondFrame);

				var thirdRegion:Rectangle = new Rectangle(0, regionTopHeight + this._secondRegionSize, this._texture.width, regionBottomHeight);
				var thirdFrame:Rectangle = (hasLeftFrame || hasRightFrame || hasBottomFrame) ? new Rectangle(textureFrame.x, 0, textureFrame.width, thirdRegionSize) : null;
				this._third = Texture.fromTexture(this.texture, thirdRegion, thirdFrame);
			}
			else //horizontal
			{
				var regionLeftWidth:number = this._firstRegionSize + textureFrame.x;
				var regionRightWidth:number = thirdRegionSize - (textureFrame.width - this._texture.width) - textureFrame.x;

				hasTopFrame = textureFrame.y != 0;
				hasRightFrame = regionRightWidth != thirdRegionSize;
				hasBottomFrame = (textureFrame.height - textureFrame.y) != this._texture.height;
				hasLeftFrame = regionLeftWidth != this._firstRegionSize;

				firstRegion = new Rectangle(0, 0, regionLeftWidth, this._texture.height);
				firstFrame = (hasLeftFrame || hasTopFrame || hasBottomFrame) ? new Rectangle(textureFrame.x, textureFrame.y, this._firstRegionSize, textureFrame.height) : null;
				this._first = Texture.fromTexture(this.texture, firstRegion, firstFrame);

				secondRegion = new Rectangle(regionLeftWidth, 0, this._secondRegionSize, this._texture.height);
				secondFrame = (hasTopFrame || hasBottomFrame) ? new Rectangle(0, textureFrame.y, this._secondRegionSize, textureFrame.height) : null;
				this._second = Texture.fromTexture(this.texture, secondRegion, secondFrame);

				thirdRegion = new Rectangle(regionLeftWidth + this._secondRegionSize, 0, regionRightWidth, this._texture.height);
				thirdFrame = (hasTopFrame || hasBottomFrame || hasRightFrame) ? new Rectangle(0, textureFrame.y, thirdRegionSize, textureFrame.height) : null;
				this._third = Texture.fromTexture(this.texture, thirdRegion, thirdFrame);
			}
		}
	}
}
