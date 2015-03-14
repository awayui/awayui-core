/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.text
{
	import Scroller = feathers.controls.Scroller;
	import matrixToRotation = feathers.utils.geom.matrixToRotation;
	import matrixToScaleX = feathers.utils.geom.matrixToScaleX;
	import matrixToScaleY = feathers.utils.geom.matrixToScaleY;
	import roundToNearest = feathers.utils.math.roundToNearest;

	import Event = flash.events.Event;
	import FocusEvent = flash.events.FocusEvent;
	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import TextField = flash.text.TextField;

	import Starling = starling.core.Starling;
	import MatrixUtil = starling.utils.MatrixUtil;

	/**
	 * A text editor view port for the <code>TextArea</code> component that uses
	 * <code>flash.text.TextField</code>.
	 *
	 * @see feathers.controls.TextArea
	 */
	export class TextFieldTextEditorViewPort extends TextFieldTextEditor implements ITextEditorViewPort
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
		constructor()
		{
			super();
			this.multiline = true;
			this.wordWrap = true;
			this.resetScrollOnFocusOut = false;
		}

		/**
		 * @private
		 */
		private _ignoreScrolling:boolean = false;

		/**
		 * @private
		 */
		private _minVisibleWidth:number = 0;

		/**
		 * @inheritDoc
		 */
		public get minVisibleWidth():number
		{
			return this._minVisibleWidth;
		}

		/**
		 * @private
		 */
		public set minVisibleWidth(value:number)
		{
			if(this._minVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleWidth cannot be NaN");
			}
			this._minVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		private _maxVisibleWidth:number = Number.POSITIVE_INFINITY;

		/**
		 * @inheritDoc
		 */
		public get maxVisibleWidth():number
		{
			return this._maxVisibleWidth;
		}

		/**
		 * @private
		 */
		public set maxVisibleWidth(value:number)
		{
			if(this._maxVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleWidth cannot be NaN");
			}
			this._maxVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		private _visibleWidth:number = NaN;

		/**
		 * @inheritDoc
		 */
		public get visibleWidth():number
		{
			return this._visibleWidth;
		}

		/**
		 * @private
		 */
		public set visibleWidth(value:number)
		{
			if(this._visibleWidth == value ||
				(value !== value && this._visibleWidth !== this._visibleWidth)) //isNaN
			{
				return;
			}
			this._visibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		private _minVisibleHeight:number = 0;

		/**
		 * @inheritDoc
		 */
		public get minVisibleHeight():number
		{
			return this._minVisibleHeight;
		}

		/**
		 * @private
		 */
		public set minVisibleHeight(value:number)
		{
			if(this._minVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleHeight cannot be NaN");
			}
			this._minVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		private _maxVisibleHeight:number = Number.POSITIVE_INFINITY;

		/**
		 * @inheritDoc
		 */
		public get maxVisibleHeight():number
		{
			return this._maxVisibleHeight;
		}

		/**
		 * @private
		 */
		public set maxVisibleHeight(value:number)
		{
			if(this._maxVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleHeight cannot be NaN");
			}
			this._maxVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		private _visibleHeight:number = NaN;

		/**
		 * @inheritDoc
		 */
		public get visibleHeight():number
		{
			return this._visibleHeight;
		}

		/**
		 * @private
		 */
		public set visibleHeight(value:number)
		{
			if(this._visibleHeight == value ||
				(value !== value && this._visibleHeight !== this._visibleHeight)) //isNaN
			{
				return;
			}
			this._visibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		public get contentX():number
		{
			return 0;
		}

		public get contentY():number
		{
			return 0;
		}

		/**
		 * @private
		 */
		protected _scrollStep:number = 0;

		/**
		 * @inheritDoc
		 */
		public get horizontalScrollStep():number
		{
			return this._scrollStep;
		}

		/**
		 * @inheritDoc
		 */
		public get verticalScrollStep():number
		{
			return this._scrollStep;
		}

		/**
		 * @private
		 */
		private _horizontalScrollPosition:number = 0;

		/**
		 * @inheritDoc
		 */
		public get horizontalScrollPosition():number
		{
			return this._horizontalScrollPosition;
		}

		/**
		 * @private
		 */
		public set horizontalScrollPosition(value:number)
		{
			//this value is basically ignored because the text does not scroll
			//horizontally. instead, it wraps.
			this._horizontalScrollPosition = value;
		}

		/**
		 * @private
		 */
		private _verticalScrollPosition:number = 0;

		/**
		 * @inheritDoc
		 */
		public get verticalScrollPosition():number
		{
			return this._verticalScrollPosition;
		}

		/**
		 * @private
		 */
		public set verticalScrollPosition(value:number)
		{
			if(this._verticalScrollPosition == value)
			{
				return;
			}
			this._verticalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
			//hack because the superclass doesn't know about the scroll flag
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
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
		 * The minimum space, in pixels, between the view port's top edge and
		 * the view port's content.
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
		 * The minimum space, in pixels, between the view port's right edge and
		 * the view port's content.
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
		 * The minimum space, in pixels, between the view port's bottom edge and
		 * the view port's content.
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
		 * The minimum space, in pixels, between the view port's left edge and
		 * the view port's content.
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
		/*override*/ protected measure(result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}

			var needsWidth:boolean = this._visibleWidth !== this._visibleWidth; //isNaN

			this.commitStylesAndData(this.measureTextField);

			var gutterDimensionsOffset:number = 4;
			if(this._useGutter)
			{
				gutterDimensionsOffset = 0;
			}

			var newWidth:number = this._visibleWidth;
			this.measureTextField.width = newWidth - this._paddingLeft - this._paddingRight + gutterDimensionsOffset;
			if(needsWidth)
			{
				newWidth = this.measureTextField.width + this._paddingLeft + this._paddingRight - gutterDimensionsOffset;
				if(newWidth < this._minVisibleWidth)
				{
					newWidth = this._minVisibleWidth;
				}
				else if(newWidth > this._maxVisibleWidth)
				{
					newWidth = this._maxVisibleWidth;
				}
			}
			var newHeight:number = this.measureTextField.height + this._paddingTop + this._paddingBottom - gutterDimensionsOffset;
			if(this._useGutter)
			{
				newHeight += 4;
			}

			result.x = newWidth;
			result.y = newHeight;

			return result;
		}

		/**
		 * @private
		 */
		/*override*/ protected getSelectionIndexAtPoint(pointX:number, pointY:number):number
		{
			pointY += this._verticalScrollPosition;
			return this.textField.getCharIndexAtPoint(pointX, pointY);
		}

		/**
		 * @private
		 */
		/*override*/ protected refreshSnapshotParameters():void
		{
			var textFieldWidth:number = this._visibleWidth - this._paddingLeft - this._paddingRight;
			if(textFieldWidth !== textFieldWidth) //isNaN
			{
				if(this._maxVisibleWidth < Number.POSITIVE_INFINITY)
				{
					textFieldWidth = this._maxVisibleWidth - this._paddingLeft - this._paddingRight;
				}
				else
				{
					textFieldWidth = this._minVisibleWidth - this._paddingLeft - this._paddingRight;
				}
			}
			var textFieldHeight:number = this._visibleHeight - this._paddingTop - this._paddingBottom;
			if(textFieldHeight !== textFieldHeight) //isNaN
			{
				if(this._maxVisibleHeight < Number.POSITIVE_INFINITY)
				{
					textFieldHeight = this._maxVisibleHeight - this._paddingTop - this._paddingBottom;
				}
				else
				{
					textFieldHeight = this._minVisibleHeight - this._paddingTop - this._paddingBottom;
				}
			}

			this._textFieldOffsetX = 0;
			this._textFieldOffsetY = 0;
			this._textFieldClipRect.x = 0;
			this._textFieldClipRect.y = 0;

			this.getTransformationMatrix(this.stage, TextFieldTextEditorViewPort.HELPER_MATRIX);
			var clipWidth:number = textFieldWidth * Starling.contentScaleFactor * matrixToScaleX(TextFieldTextEditorViewPort.HELPER_MATRIX);
			if(clipWidth < 0)
			{
				clipWidth = 0;
			}
			var clipHeight:number = textFieldHeight * Starling.contentScaleFactor * matrixToScaleY(TextFieldTextEditorViewPort.HELPER_MATRIX);
			if(clipHeight < 0)
			{
				clipHeight = 0;
			}
			this._textFieldClipRect.width = clipWidth;
			this._textFieldClipRect.height = clipHeight;
		}

		/**
		 * @private
		 */
		/*override*/ protected refreshTextFieldSize():void
		{
			var oldIgnoreScrolling:boolean = this._ignoreScrolling;
			var gutterDimensionsOffset:number = 4;
			if(this._useGutter)
			{
				gutterDimensionsOffset = 0;
			}
			this._ignoreScrolling = true;
			this.textField.width = this._visibleWidth - this._paddingLeft - this._paddingRight + gutterDimensionsOffset;
			var textFieldHeight:number = this._visibleHeight - this._paddingTop - this._paddingBottom + gutterDimensionsOffset;
			if(this.textField.height != textFieldHeight)
			{
				this.textField.height = textFieldHeight;
			}
			var scroller:Scroller = Scroller(this.parent);
			this.textField.scrollV = Math.round(1 + ((this.textField.maxScrollV - 1) * (this._verticalScrollPosition / scroller.maxVerticalScrollPosition)));
			this._ignoreScrolling = oldIgnoreScrolling;
		}

		/**
		 * @private
		 */
		/*override*/ protected commitStylesAndData(textField:TextField):void
		{
			super.commitStylesAndData(textField);
			if(textField == this.textField)
			{
				this._scrollStep = textField.getLineMetrics(0).height;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected transformTextField():void
		{
			if(!this.textField.visible)
			{
				return;
			}
			var nativeScaleFactor:number = 1;
			if(Starling.current.supportHighResolutions)
			{
				nativeScaleFactor = Starling.current.nativeStage.contentsScaleFactor;
			}
			var scaleFactor:number = Starling.contentScaleFactor / nativeScaleFactor;
			TextFieldTextEditorViewPort.HELPER_POINT.x = TextFieldTextEditorViewPort.HELPER_POINT.y = 0;
			this.getTransformationMatrix(this.stage, TextFieldTextEditorViewPort.HELPER_MATRIX);
			MatrixUtil.transformCoords(TextFieldTextEditorViewPort.HELPER_MATRIX, 0, 0, TextFieldTextEditorViewPort.HELPER_POINT);
			var scaleX:number = matrixToScaleX(TextFieldTextEditorViewPort.HELPER_MATRIX) * scaleFactor;
			var scaleY:number = matrixToScaleY(TextFieldTextEditorViewPort.HELPER_MATRIX) * scaleFactor;
			var offsetX:number = Math.round(this._paddingLeft * scaleX);
			var offsetY:number = Math.round((this._paddingTop + this._verticalScrollPosition) * scaleY);
			var starlingViewPort:Rectangle = Starling.current.viewPort;
			var gutterPositionOffset:number = 2;
			if(this._useGutter)
			{
				gutterPositionOffset = 0;
			}
			this.textField.x = offsetX + Math.round(starlingViewPort.x + (TextFieldTextEditorViewPort.HELPER_POINT.x * scaleFactor) - gutterPositionOffset * scaleX);
			this.textField.y = offsetY + Math.round(starlingViewPort.y + (TextFieldTextEditorViewPort.HELPER_POINT.y * scaleFactor) - gutterPositionOffset * scaleY);
			this.textField.rotation = matrixToRotation(TextFieldTextEditorViewPort.HELPER_MATRIX) * 180 / Math.PI;
			this.textField.scaleX = scaleX;
			this.textField.scaleY = scaleY;
		}

		/**
		 * @private
		 */
		/*override*/ protected positionSnapshot():void
		{
			if(!this.textSnapshot)
			{
				return;
			}
			this.getTransformationMatrix(this.stage, TextFieldTextEditorViewPort.HELPER_MATRIX);
			this.textSnapshot.x = this._paddingLeft + Math.round(TextFieldTextEditorViewPort.HELPER_MATRIX.tx) - TextFieldTextEditorViewPort.HELPER_MATRIX.tx;
			this.textSnapshot.y = this._paddingTop + this._verticalScrollPosition + Math.round(TextFieldTextEditorViewPort.HELPER_MATRIX.ty) - TextFieldTextEditorViewPort.HELPER_MATRIX.ty;
		}

		/**
		 * @private
		 */
		/*override*/ protected checkIfNewSnapshotIsNeeded():void
		{
			super.checkIfNewSnapshotIsNeeded();
			this._needsNewTexture ||this.= this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
		}

		/**
		 * @private
		 */
		/*override*/ protected textField_focusInHandler(event:FocusEvent):void
		{
			this.textField.addEventListener(Event.SCROLL, this.textField_scrollHandler);
			super.textField_focusInHandler(event);
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		/*override*/ protected textField_focusOutHandler(event:FocusEvent):void
		{
			this.textField.removeEventListener(Event.SCROLL, this.textField_scrollHandler);
			super.textField_focusOutHandler(event);
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected textField_scrollHandler(event:Event):void
		{
			//for some reason, the text field's scroll positions don't work
			//properly unless we access the values here. weird.
			var scrollH:number = this.textField.scrollH;
			var scrollV:number = this.textField.scrollV;
			if(this._ignoreScrolling)
			{
				return;
			}
			var scroller:Scroller = Scroller(this.parent);
			if(scroller.maxVerticalScrollPosition > 0 && this.textField.maxScrollV > 1)
			{
				var calculatedVerticalScrollPosition:number = scroller.maxVerticalScrollPosition * (scrollV - 1) / (this.textField.maxScrollV - 1);
				scroller.verticalScrollPosition = roundToNearest(calculatedVerticalScrollPosition, this._scrollStep);
			}
		}

	}
}
