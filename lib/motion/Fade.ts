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
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;

	/**
	 * Creates animated effects, like transitions for screen navigators, that
	 * animates the `alpha` property of a display object to fade it in or out.
	 *
	 * @see ../../../help/transitions.html#fade Transitions for Feathers screen navigators: Fade
	 */
	export class Fade
	{
		/**
		 * @private
		 */
		protected static SCREEN_REQUIRED_ERROR:string = "Cannot transition if both old screen and new screen are null.";

		/**
		 * Creates a transition function for a screen navigator that fades in
		 * the new screen by animating the `alpha` property from `0.0` to `1.0`,
		 * while the old screen remains fully opaque at a lower depth.
		 *
		 * @see ../../../help/transitions.html#fade Transitions for Feathers screen navigators: Fade
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createFadeInTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Fade.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					this.newScreen.alpha = 0;
					//make sure the new screen is on top
					var parent:DisplayObjectContainer = this.newScreen.parent;
					parent.setChildIndex(this.newScreen, parent.numChildren - 1);
					if(this.oldScreen) //oldScreen can be null, that's okay
					{
						this.oldScreen.alpha = 1;
					}
					new FadeTween(this.newScreen, this.oldScreen, duration, ease, this.onComplete, tweenProperties);
				}
				else
				{
					//there's no new screen to fade in, but we still want some
					//kind of animation, so we'll just fade out the old screen
					//in order to have some animation, we're going to fade out
					this.oldScreen.alpha = 1;
					new FadeTween(this.oldScreen, null, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that fades out
		 * the old screen by animating the `alpha` property from `1.0` to `0.0`,
		 * while the new screen remains fully opaque at a lower depth.
		 *
		 * @see ../../../help/transitions.html#fade Transitions for Feathers screen navigators: Fade
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createFadeOutTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Fade.SCREEN_REQUIRED_ERROR);
				}
				if(this.oldScreen)
				{
					//make sure the old screen is on top
					var parent:DisplayObjectContainer = this.oldScreen.parent;
					parent.setChildIndex(this.oldScreen, parent.numChildren - 1);
					this.oldScreen.alpha = 1;
					if(this.newScreen) //newScreen can be null, that's okay
					{
						this.newScreen.alpha = 1;
					}
					new FadeTween(this.oldScreen, null, duration, ease, this.onComplete, tweenProperties);
				}
				else
				{
					//there's no old screen to fade out, but we still want some
					//kind of animation, so we'll just fade in the new screen
					//in order to have some animation, we're going to fade out
					this.newScreen.alpha = 0;
					new FadeTween(this.newScreen, null, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that crossfades
		 * the screens. In other words, the old screen fades out, animating the
		 * `alpha` property from `1.0` to `0.0`. Simultaneously, the new screen
		 * fades in, animating its `alpha` property from `0.0` to `1.0`.
		 *
		 * @see ../../../help/transitions.html#fade Transitions for Feathers screen navigators: Fade
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createCrossfadeTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Fade.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					this.newScreen.alpha = 0;
					if(this.oldScreen) //oldScreen can be null, that's okay
					{
						this.oldScreen.alpha = 1;
					}
					new FadeTween(this.newScreen, this.oldScreen, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					this.oldScreen.alpha = 1;
					new FadeTween(this.oldScreen, null, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}
	}
}

import Tween = starling.animation.Tween;
import Starling = starling.core.Starling;
import DisplayObject = starling.display.DisplayObject;

class FadeTween extends Tween
{
	constructor(target:DisplayObject, otherTarget:DisplayObject,
		duration:number, ease:Object, onCompleteCallback:Function,
		tweenProperties:Object)
	{
		super(target, duration, ease);
		if(target.alpha == 0)
		{
			this.fadeTo(1);
		}
		else
		{
			this.fadeTo(0);
		}
		if(tweenProperties)
		{
			for(var propertyName:string in tweenProperties)
			{
				this[propertyName] = tweenProperties[propertyName];
			}
		}
		if(otherTarget)
		{
			this._otherTarget = otherTarget;
			this.onUpdate = this.updateOtherTarget;
		}
		this._onCompleteCallback = onCompleteCallback;
		this.onComplete = this.cleanupTween;
		Starling.juggler.add(this);
	}

	private _otherTarget:DisplayObject;
	private _onCompleteCallback:Function;

	private updateOtherTarget():void
	{
		var newScreen:DisplayObject = DisplayObject(this.target);
		this._otherTarget.alpha = 1 - newScreen.alpha;
	}

	private cleanupTween():void
	{
		this.target.alpha = 1;
		if(this._otherTarget)
		{
			this._otherTarget.alpha = 1;
		}
		if(this._onCompleteCallback !== null)
		{
			this._onCompleteCallback();
		}
	}
