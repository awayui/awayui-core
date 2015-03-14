/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.display
{
	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;

	import RenderSupport = starling.core.RenderSupport;
	import DisplayObject = starling.display.DisplayObject;
	import MatrixUtil = starling.utils.MatrixUtil;

	/**
	 * Passes rendering to another display object, but provides its own separate
	 * transformation.
	 * 
	 * <p>Touching the delegate does not pass touches to the target. The
	 * delegate is a separate display object. However, interacting with the
	 * target may affect the rendering of the delegate.</p>
	 */
	export class RenderDelegate extends DisplayObject
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
		 * Constructor.
		 */
		constructor(target:DisplayObject)
		{
			this._target = target;
		}

		/**
		 * @private
		 */
		protected _target:DisplayObject;

		/**
		 * The displaying object being rendered.
		 */
		public get target():DisplayObject
		{
			return this._target;
		}

		/**
		 * @private
		 */
		public set target(value:DisplayObject)
		{
			this._target = value;
		}

		/**
		 * @private
		 */
		/*override*/ public getBounds(targetSpace:DisplayObject, resultRect:Rectangle = null):Rectangle
		{
			resultRect = this._target.getBounds(this._target, resultRect);
			this.getTransformationMatrix(targetSpace, RenderDelegate.HELPER_MATRIX);
			var minX:number = Number.MAX_VALUE;
			var maxX:number = -Number.MAX_VALUE;
			var minY:number = Number.MAX_VALUE;
			var maxY:number = -Number.MAX_VALUE;
			for(var i:number = 0; i < 4; i++)
			{
				MatrixUtil.transformCoords(RenderDelegate.HELPER_MATRIX, i % 2 == 0 ? 0 : resultRect.width, i < 2 ? 0 : resultRect.height, RenderDelegate.HELPER_POINT);
				if(RenderDelegate.HELPER_POINT.x < minX)
				{
					minX = RenderDelegate.HELPER_POINT.x;
				}
				if(RenderDelegate.HELPER_POINT.x > maxX)
				{
					maxX = RenderDelegate.HELPER_POINT.x;
				}
				if(RenderDelegate.HELPER_POINT.y < minY)
				{
					minY = RenderDelegate.HELPER_POINT.y;
				}
				if(RenderDelegate.HELPER_POINT.y > maxY)
				{
					maxY = RenderDelegate.HELPER_POINT.y;
				}
			}
			resultRect.setTo(minX, minY, maxX - minX, maxY - minY);
			return resultRect;
		}

		/**
		 * @private
		 */
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			var oldAlpha:number = this._target.alpha;
			this._target.alpha = this.alpha;
			this._target.render(support, parentAlpha);
			this._target.alpha = oldAlpha;
		}
	}
}
