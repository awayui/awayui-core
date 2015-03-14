/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.motion
{
	import Transitions = starling.animation.Transitions;
	import Tween = starling.animation.Tween;
	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;

	/**
	 * Creates animated effects, like transitions for screen navigators, that
	 * slides a display object out of view, animating the `x` or `y` property,
	 * to reveal the content below it. The display object may slide up, right,
	 * down, or left.
	 *
	 * @see ../../../help/transitions.html#reveal Transitions for Feathers screen navigators: Reveal
	 */
	export class Reveal
	{
		/**
		 * @private
		 */
		protected static SCREEN_REQUIRED_ERROR:string = "Cannot transition if both old screen and new screen are null.";

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * old screen out of view to the left, animating the `x` property, to
		 * reveal the new screen under it. The new screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#reveal Transitions for Feathers screen navigators: Reveal
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createRevealLeftTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Reveal.SCREEN_REQUIRED_ERROR);
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
				}
				if(this.newScreen)
				{
					this.newScreen.x = 0;
					this.newScreen.y = 0;
					new RevealTween(this.oldScreen, this.newScreen, -this.newScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					Reveal.slideOutOldScreen(this.oldScreen, -this.oldScreen.width, 0, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * old screen out of view to the right, animating the `x` property, to
		 * reveal the new screen under it. The new screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#reveal Transitions for Feathers screen navigators: Reveal
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createRevealRightTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Reveal.SCREEN_REQUIRED_ERROR);
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
				}
				if(this.newScreen)
				{
					this.newScreen.x = 0;
					this.newScreen.y = 0;
					new RevealTween(this.oldScreen, this.newScreen, this.newScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					Reveal.slideOutOldScreen(this.oldScreen, this.oldScreen.width, 0, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * old screen up out of view, animating the `y` property, to reveal the
		 * new screen under it. The new screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#reveal Transitions for Feathers screen navigators: Reveal
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createRevealUpTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Reveal.SCREEN_REQUIRED_ERROR);
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
				}
				if(this.newScreen)
				{
					this.newScreen.x = 0;
					this.newScreen.y = 0;
					new RevealTween(this.oldScreen, this.newScreen, 0, -this.newScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					Reveal.slideOutOldScreen(this.oldScreen, 0, -this.oldScreen.height, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * old screen down out of view, animating the `y` property, to reveal the
		 * new screen under it. The new screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#reveal Transitions for Feathers screen navigators: Reveal
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createRevealDownTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Reveal.SCREEN_REQUIRED_ERROR);
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
				}
				if(this.newScreen)
				{
					this.newScreen.x = 0;
					this.newScreen.y = 0;
					new RevealTween(this.oldScreen, this.newScreen, 0, this.newScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the old screen
				{
					Reveal.slideOutOldScreen(this.oldScreen, 0, this.oldScreen.height, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * @private
		 */
		private static slideOutOldScreen(oldScreen:DisplayObject,
			xOffset:number, yOffset:number, duration:number, ease:Object,
			tweenProperties:Object, onComplete:Function):void
		{
			var tween:Tween = new Tween(oldScreen, duration, ease);
			if(xOffset != 0)
			{
				tween.animate("x", xOffset);
			}
			if(yOffset !== 0)
			{
				tween.animate("y", yOffset);
			}
			if(tweenProperties)
			{
				for(var propertyName:string in tweenProperties)
				{
					tween[propertyName] = tweenProperties[propertyName];
				}
			}
			tween.onComplete = onComplete;
			Starling.juggler.add(tween);
		}
	}
}

import Rectangle = flash.geom.Rectangle;

import Tween = starling.animation.Tween;
import Starling = starling.core.Starling;
import DisplayObject = starling.display.DisplayObject;
import Sprite = starling.display.Sprite;

class RevealTween extends Tween
{
	constructor(oldScreen:DisplayObject, newScreen:DisplayObject,
		xOffset:number, yOffset:number, duration:number, ease:Object, onCompleteCallback:Function,
		tweenProperties:Object)
	{
		var clipRect:Rectangle = new Rectangle();
		if(xOffset === 0)
		{
			clipRect.width = newScreen.width;
		}
		else if(xOffset < 0)
		{
			clipRect.x = -xOffset;
		}
		if(yOffset === 0)
		{
			clipRect.height = newScreen.height;
		}
		else if(yOffset < 0)
		{
			clipRect.y = -yOffset;
		}
		this._temporaryParent = new Sprite();
		this._temporaryParent.clipRect = clipRect;
		newScreen.parent.addChild(this._temporaryParent);
		this._temporaryParent.addChild(newScreen);

		super(this._temporaryParent.clipRect, duration, ease);

		if(xOffset < 0)
		{
			this.animate("x", clipRect.x + xOffset);
			this.animate("width", -xOffset);
		}
		else if(xOffset > 0)
		{
			this.animate("width", xOffset);
		}
		if(yOffset < 0)
		{
			this.animate("y", clipRect.y + yOffset);
			this.animate("height", -yOffset);
		}
		else if(yOffset > 0)
		{
			this.animate("height", yOffset);
		}

		if(tweenProperties)
		{
			for(var propertyName:string in tweenProperties)
			{
				this[propertyName] = tweenProperties[propertyName];
			}
		}
		this._onCompleteCallback = onCompleteCallback;
		if(oldScreen)
		{
			this._savedOldScreen = oldScreen;
			this._savedXOffset = xOffset;
			this._savedYOffset = yOffset;
			this.onUpdate = this.updateOldScreen;
		}
		this.onComplete = this.cleanupTween;
		Starling.juggler.add(this);
	}

	private _savedXOffset:number;
	private _savedYOffset:number;
	private _savedOldScreen:DisplayObject;
	private _temporaryParent:Sprite;
	private _onCompleteCallback:Function;

	private updateOldScreen():void
	{
		var clipRect:Rectangle = this._temporaryParent.clipRect;
		if(this._savedXOffset < 0)
		{
			this._savedOldScreen.x = -clipRect.width;
		}
		else if(this._savedXOffset > 0)
		{
			this._savedOldScreen.x = clipRect.width;
		}
		if(this._savedYOffset < 0)
		{
			this._savedOldScreen.y = -clipRect.height;
		}
		else if(this._savedYOffset > 0)
		{
			this._savedOldScreen.y = clipRect.height;
		}
	}

	private cleanupTween():void
	{
		var target:DisplayObject = this._temporaryParent.removeChildAt(0);
		this._temporaryParent.parent.addChild(target);
		this._temporaryParent.removeFromParent(true);
		if(this._savedOldScreen)
		{
			this._savedOldScreen.x = 0;
			this._savedOldScreen.y = 0;
			this._savedOldScreen = null;
		}
		if(this._onCompleteCallback !== null)
		{
			this._onCompleteCallback();
		}
	}

}
