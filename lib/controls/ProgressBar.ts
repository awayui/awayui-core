/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import clamp = feathers.utils.math.clamp;

	import DisplayObject = starling.display.DisplayObject;

	/**
	 * Displays the progress of a task over time. Non-interactive.
	 *
	 * <p>The following example creates a progress bar:</p>
	 *
	 * <listing version="3.0">
	 * var progress:ProgressBar = new ProgressBar();
	 * progress.minimum = 0;
	 * progress.maximum = 100;
	 * progress.value = 20;
	 * this.addChild( progress );</listing>
	 *
	 * @see ../../../help/progress-bar.html How to use the Feathers ProgressBar component
	 */
	export class ProgressBar extends FeathersControl
	{
		/**
		 * The progress bar fills horizontally (on the x-axis).
		 *
		 * @see #direction
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * The progress bar fills vertically (on the y-axis).
		 *
		 * @see #direction
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The default <code>IStyleProvider</code> for all <code>ProgressBar</code>
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
		}

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return ProgressBar.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _direction:string = ProgressBar.DIRECTION_HORIZONTAL;

		/*[Inspectable(type="String",enumeration="horizontal,vertical")]*/
		/**
		 * Determines the direction that the progress bar fills. When this value
		 * changes, the progress bar's width and height values do not change
		 * automatically.
		 *
		 * <p>In the following example, the direction is set to vertical:</p>
		 *
		 * <listing version="3.0">
		 * progress.direction = ProgressBar.DIRECTION_VERTICAL;</listing>
		 *
		 * @default ProgressBar.DIRECTION_HORIZONTAL
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
		public set direction(value:string)
		{
			if(this._direction == value)
			{
				return;
			}
			this._direction = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _value:number = 0;

		/**
		 * The value of the progress bar, between the minimum and maximum.
		 *
		 * <p>In the following example, the value is set to 12:</p>
		 *
		 * <listing version="3.0">
		 * progress.minimum = 0;
		 * progress.maximum = 100;
		 * progress.value = 12;</listing>
		 *
		 * @default 0
		 *
		 * @see #minimum
		 * @see #maximum
		 */
		public get value():number
		{
			return this._value;
		}

		/**
		 * @private
		 */
		public set value(newValue:number)
		{
			newValue = clamp(newValue, this._minimum, this._maximum);
			if(this._value == newValue)
			{
				return;
			}
			this._value = newValue;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _minimum:number = 0;

		/**
		 * The progress bar's value will not go lower than the minimum.
		 *
		 * <p>In the following example, the minimum is set to 0:</p>
		 *
		 * <listing version="3.0">
		 * progress.minimum = 0;
		 * progress.maximum = 100;
		 * progress.value = 12;</listing>
		 *
		 * @default 0
		 *
		 * @see #value
		 * @see #maximum
		 */
		public get minimum():number
		{
			return this._minimum;
		}

		/**
		 * @private
		 */
		public set minimum(value:number)
		{
			if(this._minimum == value)
			{
				return;
			}
			this._minimum = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _maximum:number = 1;

		/**
		 * The progress bar's value will not go higher than the maximum.
		 *
		 * <p>In the following example, the maximum is set to 100:</p>
		 *
		 * <listing version="3.0">
		 * progress.minimum = 0;
		 * progress.maximum = 100;
		 * progress.value = 12;</listing>
		 *
		 * @default 1
		 *
		 * @see #value
		 * @see #minimum
		 */
		public get maximum():number
		{
			return this._maximum;
		}

		/**
		 * @private
		 */
		public set maximum(value:number)
		{
			if(this._maximum == value)
			{
				return;
			}
			this._maximum = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _originalBackgroundWidth:number = NaN;

		/**
		 * @private
		 */
		protected _originalBackgroundHeight:number = NaN;

		/**
		 * @private
		 */
		protected currentBackground:DisplayObject;

		/**
		 * @private
		 */
		protected _backgroundSkin:DisplayObject;

		/**
		 * The primary background to display.
		 *
		 * <p>In the following example, the progress bar is given a background
		 * skin:</p>
		 *
		 * <listing version="3.0">
		 * progress.backgroundSkin = new Image( texture );</listing>
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
		 * A background to display when the progress bar is disabled.
		 *
		 * <p>In the following example, the progress bar is given a disabled
		 * background skin:</p>
		 *
		 * <listing version="3.0">
		 * progress.backgroundDisabledSkin = new Image( texture );</listing>
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
		 * @private
		 */
		protected _originalFillWidth:number = NaN;

		/**
		 * @private
		 */
		protected _originalFillHeight:number = NaN;

		/**
		 * @private
		 */
		protected currentFill:DisplayObject;

		/**
		 * @private
		 */
		protected _fillSkin:DisplayObject;

		/**
		 * The primary fill to display.
		 *
		 * <p>Note: The size of the <code>fillSkin</code>, at the time that it
		 * is passed to the setter, will be used used as the size of the fill
		 * when the progress bar is set to the minimum value. In other words,
		 * if the fill of a horizontal progress bar with a value from 0 to 100
		 * should be virtually invisible when the value is 0, then the
		 * <code>fillSkin</code> should have a width of 0 when you pass it in.
		 * On the other hand, if you're using a <code>Scale9Image</code> as the
		 * skin, it may require a minimum width before the image parts begin to
		 * overlap. In that case, the <code>Scale9Image</code> instance passed
		 * to the <code>fillSkin</code> setter should have a <code>width</code>
		 * value that is the same as that minimum width value where the image
		 * parts do not overlap.</p>
		 *
		 * <p>In the following example, the progress bar is given a fill
		 * skin:</p>
		 *
		 * <listing version="3.0">
		 * progress.fillSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get fillSkin():DisplayObject
		{
			return this._fillSkin;
		}

		/**
		 * @private
		 */
		public set fillSkin(value:DisplayObject)
		{
			if(this._fillSkin == value)
			{
				return;
			}

			if(this._fillSkin && this._fillSkin != this._fillDisabledSkin)
			{
				this.removeChild(this._fillSkin);
			}
			this._fillSkin = value;
			if(this._fillSkin && this._fillSkin.parent != this)
			{
				this._fillSkin.visible = false;
				this.addChild(this._fillSkin);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _fillDisabledSkin:DisplayObject;

		/**
		 * A fill to display when the progress bar is disabled.
		 *
		 * <p>In the following example, the progress bar is given a disabled fill
		 * skin:</p>
		 *
		 * <listing version="3.0">
		 * progress.fillDisabledSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get fillDisabledSkin():DisplayObject
		{
			return this._fillDisabledSkin;
		}

		/**
		 * @private
		 */
		public set fillDisabledSkin(value:DisplayObject)
		{
			if(this._fillDisabledSkin == value)
			{
				return;
			}

			if(this._fillDisabledSkin && this._fillDisabledSkin != this._fillSkin)
			{
				this.removeChild(this._fillDisabledSkin);
			}
			this._fillDisabledSkin = value;
			if(this._fillDisabledSkin && this._fillDisabledSkin.parent != this)
			{
				this._fillDisabledSkin.visible = false;
				this.addChild(this._fillDisabledSkin);
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
		 * progress.padding = 20;</listing>
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
		 * The minimum space, in pixels, between the progress bar's top edge and
		 * the progress bar's content.
		 *
		 * <p>In the following example, the top padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * progress.paddingTop = 20;</listing>
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
		 * The minimum space, in pixels, between the progress bar's right edge
		 * and the progress bar's content.
		 *
		 * <p>In the following example, the right padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * progress.paddingRight = 20;</listing>
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
		 * The minimum space, in pixels, between the progress bar's bottom edge
		 * and the progress bar's content.
		 *
		 * <p>In the following example, the bottom padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * progress.paddingBottom = 20;</listing>
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
		 * The minimum space, in pixels, between the progress bar's left edge
		 * and the progress bar's content.
		 *
		 * <p>In the following example, the left padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * progress.paddingLeft = 20;</listing>
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
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);

			if(stylesInvalid || stateInvalid)
			{
				this.refreshBackground();
				this.refreshFill();
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(sizeInvalid || stylesInvalid || stateInvalid)
			{
				if(this.currentBackground)
				{
					this.currentBackground.width = this.actualWidth;
					this.currentBackground.height = this.actualHeight;
				}
			}

			if(dataInvalid || sizeInvalid || stateInvalid || stylesInvalid)
			{
				var percentage:number = (this._value - this._minimum) / (this._maximum - this._minimum);
				if(this._direction == ProgressBar.DIRECTION_VERTICAL)
				{
					this.currentFill.width = this.actualWidth - this._paddingLeft - this._paddingRight;
					this.currentFill.height = this._originalFillHeight + percentage * (this.actualHeight - this._paddingTop - this._paddingBottom - this._originalFillHeight);
					this.currentFill.x = this._paddingLeft;
					this.currentFill.y = this.actualHeight - this._paddingBottom - this.currentFill.height;
				}
				else
				{
					this.currentFill.width = this._originalFillWidth + percentage * (this.actualWidth - this._paddingLeft - this._paddingRight - this._originalFillWidth);
					this.currentFill.height = this.actualHeight - this._paddingTop - this._paddingBottom;
					this.currentFill.x = this._paddingLeft;
					this.currentFill.y = this._paddingTop;
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
			var newWidth:number = needsWidth ? this._originalBackgroundWidth : this.explicitWidth;
			var newHeight:number = needsHeight ? this._originalBackgroundHeight  : this.explicitHeight;
			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * @private
		 */
		protected refreshBackground():void
		{
			this.currentBackground = this._backgroundSkin;
			if(this._backgroundDisabledSkin)
			{
				if(this._isEnabled)
				{
					this._backgroundDisabledSkin.visible = false;
				}
				else
				{
					this.currentBackground = this._backgroundDisabledSkin;
					if(this._backgroundSkin)
					{
						this._backgroundSkin.visible = false;
					}
				}
			}
			if(this.currentBackground)
			{
				if(this._originalBackgroundWidth !== this._originalBackgroundWidth) //isNaN
				{
					this._originalBackgroundWidth = this.currentBackground.width;
				}
				if(this._originalBackgroundHeight !== this._originalBackgroundHeight) //isNaN
				{
					this._originalBackgroundHeight = this.currentBackground.height;
				}
				this.currentBackground.visible = true;
			}
		}

		/**
		 * @private
		 */
		protected refreshFill():void
		{
			this.currentFill = this._fillSkin;
			if(this._fillDisabledSkin)
			{
				if(this._isEnabled)
				{
					this._fillDisabledSkin.visible = false;
				}
				else
				{
					this.currentFill = this._fillDisabledSkin;
					if(this._backgroundSkin)
					{
						this._fillSkin.visible = false;
					}
				}
			}
			if(this.currentFill)
			{
				if(this._originalFillWidth !== this._originalFillWidth) //isNaN
				{
					this._originalFillWidth = this.currentFill.width;
				}
				if(this._originalFillHeight !== this._originalFillHeight) //isNaN
				{
					this._originalFillHeight = this.currentFill.height;
				}
				this.currentFill.visible = true;
			}
		}


	}
}
