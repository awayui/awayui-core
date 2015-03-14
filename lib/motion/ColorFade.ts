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
	 * fade a display object to a solid color.
	 *
	 * @see ../../../help/transitions.html#colorfade Transitions for Feathers screen navigators: ColorFade
	 */
	export class ColorFade
	{
		/**
		 * @private
		 */
		protected static SCREEN_REQUIRED_ERROR:string = "Cannot transition if both old screen and new screen are null.";

		/**
		 * Creates a transition function for a screen navigator that hides the
		 * old screen as a solid black color fades in over it. Then, the solid
		 * black color fades back out to show that the new screen has replaced
		 * the old screen.
		 *
		 * @see ../../../help/transitions.html#colorfade Transitions for Feathers screen navigators: ColorFade
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createBlackFadeToBlackTransition(duration:number = 0.75, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return ColorFade.createColorFadeTransition(0x000000, duration, ease, tweenProperties);
		}

		/**
		 * Creates a transition function for a screen navigator that hides the old screen as a solid
		 * white color fades in over it. Then, the solid white color fades back
		 * out to show that the new screen has replaced the old screen.
		 *
		 * @see ../../../help/transitions.html#colorfade Transitions for Feathers screen navigators: ColorFade
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createWhiteFadeTransition(duration:number = 0.75, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return ColorFade.createColorFadeTransition(0xffffff, duration, ease, tweenProperties);
		}

		/**
		 * Creates a transition function for a screen navigator that hides the
		 * old screen as a customizable solid color fades in over it. Then, the
		 * solid color fades back out to show that the new screen has replaced
		 * the old screen.
		 *
		 * @see ../../../help/transitions.html#colorfade Transitions for Feathers screen navigators: ColorFade
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createColorFadeTransition(color:number, duration:number = 0.75, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(ColorFade.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					this.newScreen.alpha = 0;
					if(this.oldScreen) //oldScreen can be null, that's okay
					{
						this.oldScreen.alpha = 1;
					}
					new ColorFadeTween(this.newScreen, this.oldScreen, color, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					this.oldScreen.alpha = 1;
					new ColorFadeTween(this.oldScreen, null, color, duration, ease, this.onComplete, tweenProperties);
				}
			}
		}
	}
}

import Tween = starling.animation.Tween;
import Starling = starling.core.Starling;
import DisplayObject = starling.display.DisplayObject;
import DisplayObjectContainer = starling.display.DisplayObjectContainer;
import Quad = starling.display.Quad;

class ColorFadeTween extends Tween
{
	constructor(target:DisplayObject, otherTarget:DisplayObject,
		color:number, duration:number, ease:Object, onCompleteCallback:Function,
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
			target.visible = false;
		}
		this.onUpdate = this.updateOverlay;
		this._onCompleteCallback = onCompleteCallback;
		this.onComplete = this.cleanupTween;

		var navigator:DisplayObjectContainer = target.parent;
		this._overlay = new Quad(navigator.width, navigator.height, color);
		this._overlay.alpha = 0;
		this._overlay.touchable = false;
		navigator.addChild(this._overlay);

		Starling.juggler.add(this);
	}

	private _otherTarget:DisplayObject;
	private _overlay:Quad;
	private _onCompleteCallback:Function;

	private updateOverlay():void
	{
		var progress:number = this.progress;
		if(progress < 0.5)
		{
			this._overlay.alpha = progress * 2;
		}
		else
		{
			this.target.visible = true;
			if(this._otherTarget)
			{
				this._otherTarget.visible = false;
			}
			this._overlay.alpha = (1 - progress) * 2;
		}
	}

	private cleanupTween():void
	{
		this._overlay.removeFromParent(true);
		this.target.visible = true;
		if(this._otherTarget)
		{
			this._otherTarget.visible = true;
		}
		if(this._onCompleteCallback !== null)
		{
			this._onCompleteCallback();
		}
	}
