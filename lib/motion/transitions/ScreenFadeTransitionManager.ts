/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.motion.transitions
{
	import ScreenNavigator = feathers.controls.ScreenNavigator;
	import Fade = feathers.motion.Fade;

	import Transitions = starling.animation.Transitions;
	import DisplayObject = starling.display.DisplayObject;

	/**
	 * A transition for <code>ScreenNavigator</code> that fades out the old
	 * screen and fades in the new screen.
	 *
	 * @see feathers.controls.ScreenNavigator
	 */
	export class ScreenFadeTransitionManager
	{
		/**
		 * Constructor.
		 */
		constructor(navigator:ScreenNavigator)
		{
			if(!navigator)
			{
				throw new ArgumentError("ScreenNavigator cannot be null.");
			}
			this.navigator = navigator;
			this.navigator.transition = this.onTransition;
		}

		/**
		 * The <code>ScreenNavigator</code> being managed.
		 */
		protected navigator:ScreenNavigator;

		/**
		 * @private
		 */
		protected _transition:Function;

		/**
		 * @private
		 */
		protected _duration:number = 0.25;
		
		/**
		 * The duration of the transition, measured in seconds.
		 *
		 * @default 0.25
		 */
		public get duration():number
		{
			return this._duration;
		}

		/**
		 * @private
		 */
		public set duration(value:number)
		{
			if(this._duration == value)
			{
				return;
			}
			this._duration = value;
			this._transition = null;
		}

		/**
		 * @private
		 */
		protected _delay:number = 0.1;

		/**
		 * A delay before the transition starts, measured in seconds. This may
		 * be required on low-end systems that will slow down for a short time
		 * after heavy texture uploads.
		 *
		 * @default 0.1
		 */
		public get delay():number
		{
			return this._delay;
		}

		/**
		 * @private
		 */
		public set delay(value:number)
		{
			if(this._delay == value)
			{
				return;
			}
			this._delay = value;
			this._transition = null;
		}

		/**
		 * @private
		 */
		protected _ease:Object = Transitions.EASE_OUT;
		
		/**
		 * The easing function to use.
		 *
		 * @default starling.animation.Transitions.EASE_OUT
		 */
		public get ease():Object
		{
			return this._ease;
		}

		/**
		 * @private
		 */
		public set ease(value:Object)
		{
			if(this._ease == value)
			{
				return;
			}
			this._ease = value;
			this._transition = null;
		}

		/**
		 * Determines if the next transition should be skipped. After the
		 * transition, this value returns to <code>false</code>.
		 *
		 * @default false
		 */
		public skipNextTransition:boolean = false;
		
		/**
		 * The function passed to the <code>transition</code> property of the
		 * <code>ScreenNavigator</code>.
		 */
		protected onTransition(oldScreen:DisplayObject, newScreen:DisplayObject, onComplete:Function):void
		{
			if(this.skipNextTransition)
			{
				this.skipNextTransition = false;
				if(onComplete != null)
				{
					onComplete();
				}
				return;
			}
			if(this._transition === null)
			{
				this._transition = Fade.createCrossfadeTransition(this._duration, this._ease, {delay: this._delay});
			}
			this._transition(oldScreen, newScreen, onComplete);
		}
	}
}