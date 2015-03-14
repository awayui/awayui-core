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
	 * wipes a display object out of view, revealing another display object
	 * under the first. Both display objects remain stationary while the
	 * effect animates clipping rectangles.
	 *
	 * @see ../../../help/transitions.html#wipe Transitions for Feathers screen navigators: Wipe
	 */
	export class Wipe
	{
		/**
		 * @private
		 */
		protected static SCREEN_REQUIRED_ERROR:string = "Cannot transition if both old screen and new screen are null.";

		/**
		 * Creates a transition function for a screen navigator that wipes the
		 * old screen out of view to the left, animating the <code>width</code>
		 * property of a <code>clipRect</code>, to reveal the new screen under
		 * it. The new screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#wipe Transitions for Feathers screen navigators: Wipe
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createWipeLeftTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Wipe.SCREEN_REQUIRED_ERROR);
				}
				var xOffset:number = this.oldScreen ? -this.oldScreen.width : -this.newScreen.width;
				new WipeTween(this.newScreen, this.oldScreen, xOffset, 0, duration, ease, this.onComplete, tweenProperties);
			}
		}

		/**
		 * Creates a transition function for a screen navigator that wipes the
		 * old screen out of view to the right, animating the <code>x</code>
		 * and <code>width</code> properties of a <code>clipRect</code>, to
		 * reveal the new screen under it. The new screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#wipe Transitions for Feathers screen navigators: Wipe
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createWipeRightTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Wipe.SCREEN_REQUIRED_ERROR);
				}
				var xOffset:number = this.oldScreen ? this.oldScreen.width : this.newScreen.width;
				new WipeTween(this.newScreen, this.oldScreen, xOffset, 0, duration, ease, this.onComplete, tweenProperties);
			}
		}

		/**
		 * Creates a transition function for a screen navigator that wipes the
		 * old screen up, animating the <code>height</code> property of a
		 * <code>clipRect</code>, to reveal the new screen under it. The new
		 * screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#wipe Transitions for Feathers screen navigators: Wipe
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createWipeUpTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Wipe.SCREEN_REQUIRED_ERROR);
				}
				var yOffset:number = this.oldScreen ? -this.oldScreen.height : -this.newScreen.height;
				new WipeTween(this.newScreen, this.oldScreen, 0, yOffset, duration, ease, this.onComplete, tweenProperties);
			}
		}

		/**
		 * Creates a transition function for a screen navigator that wipes the
		 * old screen down, animating the <code>y</code> and <code>height</code>
		 * properties of a <code>clipRect</code>, to reveal the new screen under
		 * it. The new screen remains stationary.
		 *
		 * @see ../../../help/transitions.html#wipe Transitions for Feathers screen navigators: Wipe
		 * @see feathers.controls.StackScreenNavigator#pushTransition
		 * @see feathers.controls.StackScreenNavigator#popTransition
		 * @see feathers.controls.ScreenNavigator#transition
		 */
		public static createWipeDownTransition(duration:number = 0.5, ease:Object = Transitions.EASE_OUT, tweenProperties:Object = null):Function
		{
			return function(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
			{
				if(!this.oldScreen && !this.newScreen)
				{
					throw new ArgumentError(Wipe.SCREEN_REQUIRED_ERROR);
				}
				var yOffset:number = this.oldScreen ? this.oldScreen.height : this.newScreen.height;
				new WipeTween(this.newScreen, this.oldScreen, 0, yOffset, duration, ease, this.onComplete, tweenProperties);
			}
		}
	}
}

import RenderDelegate = feathers.display.RenderDelegate;

import Rectangle = flash.geom.Rectangle;

import Tween = starling.animation.Tween;
import Starling = starling.core.Starling;
import DisplayObject = starling.display.DisplayObject;
import Sprite = starling.display.Sprite;

class WipeTween extends Tween
{
	constructor(newScreen:DisplayObject, oldScreen:DisplayObject,
		xOffset:number, yOffset:number, duration:number, ease:Object, onCompleteCallback:Function,
		tweenProperties:Object)
	{
		var clipRect:Rectangle;
		if(newScreen)
		{
			this._temporaryNewScreenParent = new Sprite();
			clipRect = new Rectangle();
			if(xOffset !== 0)
			{
				if(xOffset < 0)
				{
					clipRect.x = newScreen.width;
				}
				clipRect.height = newScreen.height;
			}
			if(yOffset !== 0)
			{
				if(yOffset < 0)
				{
					clipRect.y = newScreen.height;
				}
				clipRect.width = newScreen.width;
			}
			this._temporaryNewScreenParent.clipRect = clipRect;
			newScreen.parent.addChild(this._temporaryNewScreenParent);
			var delegate:RenderDelegate = new RenderDelegate(newScreen);
			delegate.alpha = newScreen.alpha;
			delegate.blendMode = newScreen.blendMode;
			delegate.rotation = newScreen.rotation;
			delegate.scaleX = newScreen.scaleX;
			delegate.scaleY = newScreen.scaleY;
			this._temporaryNewScreenParent.addChild(delegate);
			newScreen.visible = false;
			this._savedNewScreen = newScreen;
			//the clipRect setter may have made a clone
			clipRect = this._temporaryNewScreenParent.clipRect;
		}
		if(oldScreen)
		{
			this._temporaryOldScreenParent = new Sprite();
			this._temporaryOldScreenParent.clipRect = new Rectangle(0, 0, oldScreen.width, oldScreen.height);
			delegate = new RenderDelegate(oldScreen);
			delegate.alpha = oldScreen.alpha;
			delegate.blendMode = oldScreen.blendMode;
			delegate.rotation = oldScreen.rotation;
			delegate.scaleX = oldScreen.scaleX;
			delegate.scaleY = oldScreen.scaleY;
			this._temporaryOldScreenParent.addChild(delegate);
			clipRect = this._temporaryOldScreenParent.clipRect;
			oldScreen.parent.addChild(this._temporaryOldScreenParent);
			oldScreen.visible = false;
			this._savedOldScreen = oldScreen;
		}

		super(clipRect, duration, ease);
		
		if(oldScreen)
		{
			if(xOffset < 0)
			{
				this.animate("width", oldScreen.width + xOffset);
			}
			else if(xOffset > 0)
			{
				this.animate("x", xOffset);
				this.animate("width", oldScreen.width - xOffset);
			}
			if(yOffset < 0)
			{
				this.animate("height", oldScreen.height + yOffset);
			}
			else if(yOffset > 0)
			{
				this.animate("y", yOffset);
				this.animate("height", oldScreen.height - yOffset);
			}
			if(this._temporaryNewScreenParent)
			{
				this.onUpdate = this.updateNewScreen;
			}
		}
		else //new screen only
		{
			if(xOffset < 0)
			{
				this.animate("x", newScreen.width + xOffset);
				this.animate("width", -xOffset);
			}
			else if(xOffset > 0)
			{
				this.animate("width", xOffset);
			}
			if(yOffset < 0)
			{
				this.animate("y", newScreen.height + yOffset);
				this.animate("height", -yOffset);
			}
			else if(yOffset > 0)
			{
				this.animate("height", yOffset);
			}
		}
		if(tweenProperties)
		{
			for(var propertyName:string in tweenProperties)
			{
				this[propertyName] = tweenProperties[propertyName];
			}
		}
		this._savedXOffset = xOffset;
		this._savedYOffset = yOffset;
		this._onCompleteCallback = onCompleteCallback;
		this.onComplete = this.cleanupTween;
		Starling.juggler.add(this);
	}

	private _temporaryOldScreenParent:Sprite;
	private _temporaryNewScreenParent:Sprite;
	private _savedOldScreen:DisplayObject;
	private _savedNewScreen:DisplayObject;
	private _savedXOffset:number;
	private _savedYOffset:number;
	private _onCompleteCallback:Function;

	private updateNewScreen():void
	{
		var oldScreenClipRect:Rectangle = Rectangle(this.target);
		var newScreenClipRect:Rectangle = this._temporaryNewScreenParent.clipRect;
		if(this._savedXOffset < 0)
		{
			newScreenClipRect.x = oldScreenClipRect.width;
			newScreenClipRect.width = this._savedNewScreen.width - newScreenClipRect.x;
		}
		else if(this._savedXOffset > 0)
		{
			newScreenClipRect.width = oldScreenClipRect.x;
		}
		if(this._savedYOffset < 0)
		{
			newScreenClipRect.y = oldScreenClipRect.height;
			newScreenClipRect.height = this._savedNewScreen.height - newScreenClipRect.y;
		}
		else if(this._savedYOffset > 0)
		{
			newScreenClipRect.height = oldScreenClipRect.y;
		}
	}

	private cleanupTween():void
	{
		if(this._temporaryOldScreenParent)
		{
			this._temporaryOldScreenParent.removeFromParent(true);
			this._temporaryOldScreenParent = null;
		}
		if(this._temporaryNewScreenParent)
		{
			this._temporaryNewScreenParent.removeFromParent(true);
			this._temporaryNewScreenParent = null;
		}
		if(this._savedOldScreen)
		{
			this._savedOldScreen.visible = true;
			this._savedOldScreen = null;
		}
		if(this._savedNewScreen)
		{
			this._savedNewScreen.visible = true;
			this._savedNewScreen = null;
		}
		if(this._onCompleteCallback !== null)
		{
			this._onCompleteCallback();
		}
	}

}
