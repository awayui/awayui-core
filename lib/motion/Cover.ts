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
	 * slide a display object into view, animating the `x` or `y` property, to
	 * cover the content below it.
	 *
	 * @see ../../../help/transitions.html#cover Transitions for Feathers screen navigators: Cover
	 */
	export class Cover
	{
		/**
		 * @private
		 */
		protected static SCREEN_REQUIRED_ERROR:string = "Cannot transition if both old screen and new screen are null.";

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * new screen into view to the left, animating the `x` property, to
		 * cover up the old screen, which remains stationary.
		 *
		 * @see ../../../help/transitions.html#cover Transitions for Feathers screen navigators: Cover
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createCoverLeftTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Cover.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					this.newScreen.x = this.newScreen.width;
					this.newScreen.y = 0;
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new CoverTween(this.newScreen, this.oldScreen, -this.oldScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the new screen
				{
					Cover.slideInNewScreen(this.newScreen, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * new screen into view to the right, animating the `x` property, to
		 * cover up the old screen, which remains stationary.
		 *
		 * @see ../../../help/transitions.html#cover Transitions for Feathers screen navigators: Cover
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createCoverRightTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Cover.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					this.newScreen.x = -this.newScreen.width;
					this.newScreen.y = 0;
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new CoverTween(this.newScreen, this.oldScreen, this.oldScreen.width, 0, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the new screen
				{
					Cover.slideInNewScreen(this.newScreen, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * new screen up into view, animating the `y` property, to cover up the
		 * old screen, which remains stationary.
		 *
		 * @see ../../../help/transitions.html#cover Transitions for Feathers screen navigators: Cover
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createCoverUpTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Cover.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					this.newScreen.x = 0;
					this.newScreen.y = this.newScreen.height;
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new CoverTween(this.newScreen, this.oldScreen, 0, -this.oldScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the new screen
				{
					Cover.slideInNewScreen(this.newScreen, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * Creates a transition function for a screen navigator that slides the
		 * new screen down into view, animating the `y` property, to cover up the
		 * old screen, which remains stationary.
		 *
		 * @see ../../../help/transitions.html#cover Transitions for Feathers screen navigators: Cover
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createCoverDownTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Cover.SCREEN_REQUIRED_ERROR);
				}
				if(this.newScreen)
				{
					this.newScreen.x = 0;
					this.newScreen.y = -this.newScreen.height;
				}
				if(this.oldScreen)
				{
					this.oldScreen.x = 0;
					this.oldScreen.y = 0;
					new CoverTween(this.newScreen, this.oldScreen, 0, this.oldScreen.height, duration, ease, this.onComplete, tweenProperties);
				}
				else //we only have the new screen
				{
					Cover.slideInNewScreen(this.newScreen, duration, ease, tweenProperties, this.onComplete);
				}
			}
		}

		/**
		 * @private
		 */
		private static slideInNewScreen(newScreen:DisplayObject,
			duration:number, ease:Object, tweenProperties:Object, onComplete:Function):void
		{
			var tween:Tween = new Tween(newScreen, duration, ease);
			if(newScreen.x != 0)
			{
				tween.animate("x", 0);
			}
			if(newScreen.y !== 0)
			{
				tween.animate("y", 0);
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

class CoverTween extends Tween
{
	constructor(newScreen:DisplayObject, oldScreen:DisplayObject,
		xOffset:number, yOffset:number, duration:number, ease:Object, onCompleteCallback:Function,
		tweenProperties:Object)
	{
		var clipRect:Rectangle = new Rectangle(0, 0, oldScreen.width, oldScreen.height);
		this._temporaryParent = new Sprite();
		this._temporaryParent.clipRect = clipRect;
		oldScreen.parent.addChild(this._temporaryParent);
		this._temporaryParent.addChild(oldScreen);

		super(this._temporaryParent.clipRect, duration, ease);

		if(xOffset < 0)
		{
			this.animate("width", 0);
		}
		else if(xOffset > 0)
		{
			this.animate("x", xOffset);
			this.animate("width", 0);
		}
		if(yOffset < 0)
		{
			this.animate("height", 0);
		}
		else if(yOffset > 0)
		{
			this.animate("y", yOffset);
			this.animate("height", 0);
		}
		if(tweenProperties)
		{
			for(var propertyName:string in tweenProperties)
			{
				this[propertyName] = tweenProperties[propertyName];
			}
		}
		this._onCompleteCallback = onCompleteCallback;
		if(newScreen)
		{
			this._savedNewScreen = newScreen;
			this._savedXOffset = xOffset;
			this._savedYOffset = yOffset;
			this.onUpdate = this.updateNewScreen;
		}
		this.onComplete = this.cleanupTween;
		Starling.juggler.add(this);
	}

	private _savedXOffset:number;
	private _savedYOffset:number;
	private _savedNewScreen:DisplayObject;
	private _temporaryParent:Sprite;
	private _onCompleteCallback:Function;

	private updateNewScreen():void
	{
		var clipRect:Rectangle = this._temporaryParent.clipRect;
		if(this._savedXOffset < 0)
		{
			this._savedNewScreen.x = clipRect.width;
		}
		else if(this._savedXOffset > 0)
		{
			this._savedNewScreen.x = -clipRect.width;
		}
		if(this._savedYOffset < 0)
		{
			this._savedNewScreen.y = clipRect.height;
		}
		else if(this._savedYOffset > 0)
		{
			this._savedNewScreen.y = -clipRect.height;
		}
	}

	private cleanupTween():void
	{
		var target:DisplayObject = this._temporaryParent.removeChildAt(0);
		this._temporaryParent.parent.addChild(target);
		this._temporaryParent.removeFromParent(true);
		target.x = 0;
		target.y = 0;
		this._savedNewScreen = null;
		if(this._onCompleteCallback !== null)
		{
			this._onCompleteCallback();
		}
	}

}
