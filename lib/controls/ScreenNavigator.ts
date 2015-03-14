/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import BaseScreenNavigator = feathers.controls.supportClasses.BaseScreenNavigator;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/**
	 * A "view stack"-like container that supports navigation between screens
	 * (any display object) through events.
	 *
	 * <p>The following example creates a screen navigator, adds a screen and
	 * displays it:</p>
	 *
	 * <listing version="3.0">
	 * var navigator:ScreenNavigator = new ScreenNavigator();
	 * navigator.addScreen( "mainMenu", new ScreenNavigatorItem( MainMenuScreen ) );
	 * this.addChild( navigator );
	 * navigator.showScreen( "mainMenu" );</listing>
	 *
	 * @see ../../../help/screen-navigator.html How to use the Feathers ScreenNavigator component
	 * @see ../../../help/transitions.html Transitions for Feathers screen navigators
	 * @see feathers.controls.ScreenNavigatorItem
	 */
	export class ScreenNavigator extends BaseScreenNavigator
	{
		/**
		 * The screen navigator will auto size itself to fill the entire stage.
		 *
		 * @see #autoSizeMode
		 */
		public static AUTO_SIZE_MODE_STAGE:string = "stage";

		/**
		 * The screen navigator will auto size itself to fit its content.
		 *
		 * @see #autoSizeMode
		 */
		public static AUTO_SIZE_MODE_CONTENT:string = "content";

		/**
		 * The default <code>IStyleProvider</code> for all <code>ScreenNavigator</code>
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
			return ScreenNavigator.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _transition:Function;

		/**
		 * A function that is called when a new screen is shown. Typically used
		 * to provide some kind of animation.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function(oldScreen:DisplayObject, newScreen:DisplayObject, completeCallback:Function):void</pre>
		 *
		 * <p>Either of the <code>oldScreen</code> and <code>newScreen</code>
		 * arguments may be <code>null</code>, but never both. The
		 * <code>oldScreen</code> argument will be <code>null</code> when the
		 * first screen is displayed or when a new screen is displayed after
		 * clearing the screen. The <code>newScreen</code> argument will
		 * be null when clearing the screen.</p>
		 *
		 * <p>The <code>completeCallback</code> function <em>must</em> be called
		 * when the transition effect finishes.This callback indicate to the
		 * screen navigator that the transition has finished. This function has
		 * the following signature:</p>
		 *
		 * <pre>function(cancelTransition:Boolean = false):void</pre>
		 *
		 * <p>The first argument defaults to <code>false</code>, meaning that
		 * the transition completed successfully. In most cases, this callback
		 * may be called without arguments. If a transition is cancelled before
		 * completion (perhaps through some kind of user interaction), and the
		 * previous screen should be restored, pass <code>true</code> as the
		 * first argument to the callback to inform the screen navigator that
		 * the transition is cancelled.</p>
		 * 
		 * <p>In the following example, a custom transition is passed to the
		 * screen navigator:</p>
		 * 
		 * <listing version="3.0">
		 * navigator.transition = Fade.createFadeInTransition();</listing>
		 *
		 * @default null
		 *
		 * @see #showScreen()
		 * @see #clearScreen()
		 * @see ../../../help/transitions.html Transitions for Feathers screen navigators
		 */
		public get transition():Function
		{
			return this._transition;
		}

		/**
		 * @private
		 */
		public set transition(value:Function)
		{
			if(this._transition == value)
			{
				return;
			}
			this._transition = value;
		}

		/**
		 * @private
		 */
		protected _screenEvents:Object = {};

		/**
		 * Registers a new screen with a string identifier that can be used
		 * to reference the screen in other calls, like <code>removeScreen()</code>
		 * or <code>showScreen()</code>.
		 *
		 * @see #removeScreen()
		 */
		public addScreen(id:string, item:ScreenNavigatorItem):void
		{
			this.addScreenInternal(id, item);
		}

		/**
		 * Removes an existing screen using the identifier assigned to it in the
		 * call to <code>addScreen()</code>.
		 *
		 * @see #removeAllScreens()
		 * @see #addScreen()
		 */
		public removeScreen(id:string):ScreenNavigatorItem
		{
			return this.ScreenNavigatorItem(this.removeScreenInternal(id));
		}

		/**
		 * Returns the <code>ScreenNavigatorItem</code> instance with the
		 * specified identifier.
		 */
		public getScreen(id:string):ScreenNavigatorItem
		{
			if(this._screens.hasOwnProperty(id))
			{
				return this.ScreenNavigatorItem(this._screens[id]);
			}
			return null;
		}

		/**
		 * Displays a screen and returns a reference to it. If a previous
		 * transition is running, the new screen will be queued, and no
		 * reference will be returned.
		 *
		 * <p>An optional transition may be specified. If <code>null</code> the
		 * <code>transition</code> property will be used instead.</p>
		 *
		 * @see #transition
		 */
		public showScreen(id:string, transition:Function = null):DisplayObject
		{
			if(transition === null)
			{
				transition = this._transition;
			}
			return this.showScreenInternal(id, transition);
		}

		/**
		 * Removes the current screen, leaving the <code>ScreenNavigator</code>
		 * empty.
		 *
		 * <p>An optional transition may be specified. If <code>null</code> the
		 * <code>transition</code> property will be used instead.</p>
		 *
		 * @see #transition
		 */
		public clearScreen(transition:Function = null):void
		{
			if(transition == null)
			{
				transition = this._transition;
			}
			this.clearScreenInternal(transition);
			this.dispatchEventWith(FeathersEventType.CLEAR);
		}

		/**
		 * @private
		 */
		/*override*/ protected prepareActiveScreen():void
		{
			var item:ScreenNavigatorItem = this.ScreenNavigatorItem(this._screens[this._activeScreenID]);
			var events:Object = item.events;
			var savedScreenEvents:Object = {};
			for(var eventName:string in events)
			{
				var signal:Object = this._activeScreen.hasOwnProperty(eventName) ? (/*this._activeScreen[eventName] as BaseScreenNavigator.SIGNAL_TYPE*/) : null;
				var eventAction:Object = events[eventName];
				if(eventAction instanceof Function)
				{
					if(signal)
					{
						signal.add(<Function>eventAction );
					}
					else
					{
						this._activeScreen.addEventListener(eventName, <Function>eventAction );
					}
				}
				else if(eventAction instanceof String)
				{
					if(signal)
					{
						var eventListener:Function = this.createShowScreenSignalListener(<String>eventAction , signal);
						signal.add(eventListener);
					}
					else
					{
						eventListener = this.createShowScreenEventListener(<String>eventAction );
						this._activeScreen.addEventListener(eventName, eventListener);
					}
					savedScreenEvents[eventName] = eventListener;
				}
				else
				{
					throw new TypeError("Unknown event action defined for screen:", eventAction.toString());
				}
			}
			this._screenEvents[this._activeScreenID] = savedScreenEvents;
		}

		/**
		 * @private
		 */
		/*override*/ protected cleanupActiveScreen():void
		{
			var item:ScreenNavigatorItem = this.ScreenNavigatorItem(this._screens[this._activeScreenID]);
			var events:Object = item.events;
			var savedScreenEvents:Object = this._screenEvents[this._activeScreenID];
			for(var eventName:string in events)
			{
				var signal:Object = this._activeScreen.hasOwnProperty(eventName) ? (/*this._activeScreen[eventName] as BaseScreenNavigator.SIGNAL_TYPE*/) : null;
				var eventAction:Object = events[eventName];
				if(eventAction instanceof Function)
				{
					if(signal)
					{
						signal.remove(<Function>eventAction );
					}
					else
					{
						this._activeScreen.removeEventListener(eventName, <Function>eventAction );
					}
				}
				else if(eventAction instanceof String)
				{
					var eventListener:Function = <Function>savedScreenEvents[eventName] ;
					if(signal)
					{
						signal.remove(eventListener);
					}
					else
					{
						this._activeScreen.removeEventListener(eventName, eventListener);
					}
				}
			}
			this._screenEvents[this._activeScreenID] = null;
		}

		/**
		 * @private
		 */
		protected createShowScreenEventListener(screenID:string):Function
		{
			var self:ScreenNavigator = this;
			var eventListener:Function = function(event:Event):void
			{
				self.showScreen(screenID);
			};

			return eventListener;
		}

		/**
		 * @private
		 */
		protected createShowScreenSignalListener(screenID:string, signal:Object):Function
		{
			var self:ScreenNavigator = this;
			if(signal.valueClasses.length == 1)
			{
				//shortcut to avoid the allocation of the rest array
				var signalListener:Function = function(arg0:Object):void
				{
					self.showScreen(screenID);
				};
			}
			else
			{
				signalListener = function(rest:any[]):void
				{
					self.showScreen(screenID);
				};
			}

			return signalListener;
		}
	}

}