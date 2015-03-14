/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.motion
{
	import Transitions = starling.animation.Transitions;
	import DisplayObject = starling.display.DisplayObject;

	/**
	 * Creates animated effects, like transitions for screen navigators, that
	 * slides a display object from off-stage. The display object may slide up,
	 * right, down, or left.
	 *
	 * @see ../../../help/transitions.html#slide Transitions for Feathers screen navigators: Slide
	 */
	export class Slide
	{
		/**
		 * @private
		 */
		protected static SCREEN_REQUIRED_ERROR:string = "Cannot transition if both old screen and new screen are null.";

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * new screen to the left from off-stage, pushing the old screen in the
		 * same direction.
		 *
		 * @see ../../../help/transitions.html#slide Transitions for Feathers screen navigators: Slide
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createSlideLeftTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Slide.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					if(this.oldScreen)
					{
						this.oldScreen.x = 0;
						this.oldScreen.y = 0;
					}
					this.newScreen.x = this.newScreen.width;
					this.newScreen.y = 0;
					new SlideTween(this.newScreen, this.oldScreen, -this.newScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new SlideTween(this.oldScreen, null, -this.oldScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that that slides
		 * the new screen to the right from off-stage, pushing the old screen in
		 * the same direction.
		 *
		 * @see ../../../help/transitions.html#slide Transitions for Feathers screen navigators: Slide
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createSlideRightTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Slide.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					if(this.oldScreen)
					{
						this.oldScreen.x = 0;
						this.oldScreen.y = 0;
					}
					this.newScreen.x = -this.newScreen.width;
					this.newScreen.y = 0;
					new SlideTween(this.newScreen, this.oldScreen, this.newScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new SlideTween(this.oldScreen, null, this.oldScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that that slides
		 * the new screen up from off-stage, pushing the old screen in the same
		 * direction.
		 *
		 * @see ../../../help/transitions.html#slide Transitions for Feathers screen navigators: Slide
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createSlideUpTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Slide.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					if(this.oldScreen)
					{
						this.oldScreen.x = 0;
						this.oldScreen.y = 0;
					}
					this.newScreen.x = 0;
					this.newScreen.y = this.newScreen.height;
					new SlideTween(this.newScreen, this.oldScreen, 0, -this.newScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new SlideTween(this.oldScreen, null, 0, -this.oldScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that that slides
		 * the new screen down from off-stage, pushing the old screen in the
		 * same direction.
		 *
		 * @see ../../../help/transitions.html#slide Transitions for Feathers screen navigators: Slide
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createSlideDownTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Slide.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					if(this.oldScreen)
					{
						this.oldScreen.x = 0;
						this.oldScreen.y = 0;
					}
					this.newScreen.x = 0;
					this.newScreen.y = -this.newScreen.height;
					new SlideTween(this.newScreen, this.oldScreen, 0, this.newScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new SlideTween(this.oldScreen, null, 0, this.oldScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}
	}
}

import Tween = starling.animation.Tween;
import Starling = starling.core.Starling;
import DisplayObject = starling.display.DisplayObject;

class SlideTween extends Tween
{
	constructor(target:DisplayObject, otherTarget:DisplayObject,
		xOffset:number, yOffset:number, duration:number, ease:Object,
		onCompleteCallback:Function, tweenProperties:Object)
	{
		super(target, duration, ease);
		if(xOffset != 0)
		{
			this._xOffset = xOffset;
			this.animate("x", target.x + xOffset);
		}
		if(yOffset != 0)
		{
			this._yOffset = yOffset;
			this.animate("y", target.y + yOffset);
		}
		if(tweenProperties)
		{
			for(var propertyName:string in tweenProperties)
			{
				this[propertyName] = tweenProperties[propertyName];
			}
		}
		this._navigator = target.parent;
		if(otherTarget)
		{
			this._otherTarget = otherTarget;
			this.onUpdate = this.updateOtherTarget;
		}
		this._onCompleteCallback = onCompleteCallback;
		this.onComplete = this.cleanupTween;
		Starling.juggler.add(this);
	}

	private _navigator:DisplayObject;
	private _otherTarget:DisplayObject;
	private _onCompleteCallback:Function;
	private _xOffset:number = 0;
	private _yOffset:number = 0;

	private updateOtherTarget():void
	{
		var newScreen:DisplayObject = DisplayObject(this.target);
		if(this._xOffset < 0)
		{
			this._otherTarget.x = newScreen.x - this._navigator.width;
		}
		else if(this._xOffset > 0)
		{
			this._otherTarget.x = newScreen.x + newScreen.width;
		}
		if(this._yOffset < 0)
		{
			this._otherTarget.y = newScreen.y - this._navigator.height;
		}
		else if(this._yOffset > 0)
		{
			this._otherTarget.y = newScreen.y + newScreen.height;
		}
	}

	private cleanupTween():void
	{
		this.target.x = 0;
		this.target.y = 0;
		if(this._otherTarget)
		{
			this._otherTarget.x = 0;
			this._otherTarget.y = 0;
		}
		if(this._onCompleteCallback !== null)
		{
			this._onCompleteCallback();
		}
	}
