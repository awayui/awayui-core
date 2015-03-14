/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.motion.transitions
{
	import ScreenNavigator = feathers.controls.ScreenNavigator;
	import TabBar = feathers.controls.TabBar;

	import Transitions = starling.animation.Transitions;
	import Tween = starling.animation.Tween;
	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/**
	 * Slides new screens from the left or right depending on the old and new
	 * selected index values of a TabBar control.
	 *
	 * @see feathers.controls.ScreenNavigator
	 * @see feathers.controls.TabBar
	 */
	export class TabBarSlideTransitionManager
	{
		/**
		 * Constructor.
		 */
		constructor(navigator:ScreenNavigator, tabBar:TabBar)
		{
			if(!navigator)
			{
				throw new ArgumentError("ScreenNavigator cannot be null.");
			}
			this.navigator = navigator;
			this.tabBar = tabBar;
			this._activeIndex = this._pendingIndex = tabBar.selectedIndex;
			this.tabBar.addEventListener(Event.CHANGE, this.tabBar_changeHandler);
			this.navigator.transition = this.onTransition;
		}

		/**
		 * The <code>ScreenNavigator</code> being managed.
		 */
		protected navigator:ScreenNavigator;

		/**
		 * The <code>TabBar</code> that controls the navigation.
		 */
		protected tabBar:TabBar;

		/**
		 * @private
		 */
		protected _activeTransition:Tween;

		/**
		 * @private
		 */
		protected _savedOtherTarget:DisplayObject;

		/**
		 * @private
		 */
		protected _savedCompleteHandler:Function;

		/**
		 * @private
		 */
		protected _oldScreen:DisplayObject;

		/**
		 * @private
		 */
		protected _newScreen:DisplayObject;

		/**
		 * @private
		 */
		protected _pendingIndex:number;

		/**
		 * @private
		 */
		protected _activeIndex:number;

		/**
		 * @private
		 */
		protected _isFromRight:boolean = true;

		/**
		 * @private
		 */
		protected _isWaitingOnTabBarChange:boolean = true;

		/**
		 * @private
		 */
		protected _isWaitingOnTransitionChange:boolean = true;

		/**
		 * The duration of the transition, measured in seconds.
		 *
		 * @default 0.25
		 */
		public duration:number = 0.25;

		/**
		 * A delay before the transition starts, measured in seconds. This may
		 * be required on low-end systems that will slow down for a short time
		 * after heavy texture uploads.
		 *
		 * @default 0.1
		 */
		public delay:number = 0.1;

		/**
		 * The easing function to use.
		 *
		 * @default starling.animation.Transitions.EASE_OUT
		 */
		public ease:Object = Transitions.EASE_OUT;

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
			this._oldScreen = oldScreen;
			this._newScreen = newScreen;
			this._savedCompleteHandler = onComplete;

			if(!this._isWaitingOnTabBarChange)
			{
				this.transitionNow();
			}
			else
			{
				this._isWaitingOnTransitionChange = false;
			}
		}

		/**
		 * @private
		 */
		protected transitionNow():void
		{
			this._activeIndex = this._pendingIndex;
			if(this._activeTransition)
			{
				this._savedOtherTarget  = null;
				Starling.juggler.remove(this._activeTransition);
				this._activeTransition = null;
			}

			if(!this._oldScreen || !this._newScreen || this.skipNextTransition)
			{
				this.skipNextTransition = false;
				var savedCompleteHandler:Function = this._savedCompleteHandler;
				this._savedCompleteHandler = null;
				if(this._oldScreen)
				{
					this._oldScreen.x = 0;
				}
				if(this._newScreen)
				{
					this._newScreen.x = 0;
				}
				if(savedCompleteHandler != null)
				{
					savedCompleteHandler();
				}
			}
			else
			{
				this._oldScreen.x = 0;
				var activeTransition_onUpdate:Function;
				if(this._isFromRight)
				{
					this._newScreen.x = this.navigator.width;
					activeTransition_onUpdate = this.activeTransitionFromRight_onUpdate;
				}
				else
				{
					this._newScreen.x = -this.navigator.width;
					activeTransition_onUpdate = this.activeTransitionFromLeft_onUpdate;
				}
				this._savedOtherTarget = this._oldScreen;
				this._activeTransition = new Tween(this._newScreen, this.duration, this.ease);
				this._activeTransition.animate("x", 0);
				this._activeTransition.delay = this.delay;
				this._activeTransition.onUpdate = activeTransition_onUpdate;
				this._activeTransition.onComplete = this.activeTransition_onComplete;
				Starling.juggler.add(this._activeTransition);
			}

			this._oldScreen = null;
			this._newScreen = null;
			this._isWaitingOnTabBarChange = true;
			this._isWaitingOnTransitionChange = true;
		}

		/**
		 * @private
		 */
		protected activeTransitionFromRight_onUpdate():void
		{
			if(this._savedOtherTarget)
			{
				var newScreen:DisplayObject = DisplayObject(this._activeTransition.target);
				this._savedOtherTarget.x = newScreen.x - this.navigator.width;
			}
		}

		/**
		 * @private
		 */
		protected activeTransitionFromLeft_onUpdate():void
		{
			if(this._savedOtherTarget)
			{
				var newScreen:DisplayObject = DisplayObject(this._activeTransition.target);
				this._savedOtherTarget.x = newScreen.x + this.navigator.width;
			}
		}

		/**
		 * @private
		 */
		protected activeTransition_onComplete():void
		{
			this._savedOtherTarget = null;
			this._activeTransition = null;
			if(this._savedCompleteHandler != null)
			{
				this._savedCompleteHandler();
			}
		}

		/**
		 * @private
		 */
		protected tabBar_changeHandler(event:Event):void
		{
			this._pendingIndex = this.tabBar.selectedIndex;
			if(this._pendingIndex == this._activeIndex)
			{
				//someone is changing tabs very quickly, and they just went back
				//to the tab we're currently transitioning to. cancel the next
				//transition.
				this._isWaitingOnTabBarChange = true;
				return;
			}
			this._isFromRight = this._pendingIndex > this._activeIndex;

			if(!this._isWaitingOnTransitionChange)
			{
				this.transitionNow();
			}
			else
			{
				this._isWaitingOnTabBarChange = false;
			}
		}
	}
}