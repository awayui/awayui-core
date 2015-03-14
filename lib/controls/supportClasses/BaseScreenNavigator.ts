/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.supportClasses
{
	import IScreen = feathers.controls.IScreen;
	import FeathersControl = feathers.core.FeathersControl;
	import IValidating = feathers.core.IValidating;
	import FeathersEventType = feathers.events.FeathersEventType;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import Rectangle = flash.geom.Rectangle;
	import getDefinitionByName = flash.utils.getDefinitionByName;

	import DisplayObject = starling.display.DisplayObject;
	import AbstractMethodError = starling.errors.AbstractMethodError;
	import Event = starling.events.Event;

	/**
	 * Dispatched when the active screen changes.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType starling.events.Event.CHANGE
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/**
	 * Dispatched when the current screen is removed and there is no active
	 * screen.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.CLEAR
	 */
	/*[Event(name="clear",type="starling.events.Event")]*/

	/**
	 * Dispatched when the transition between screens begins.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.TRANSITION_START
	 */
	/*[Event(name="transitionStart",type="starling.events.Event")]*/

	/**
	 * Dispatched when the transition between screens has completed.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.TRANSITION_COMPLETE
	 */
	/*[Event(name="transitionComplete",type="starling.events.Event")]*/

	/**
	 * A base class for screen navigator components that isn't meant to be
	 * instantiated directly. It should only be subclassed.
	 *
	 * @see feathers.controls.StackScreenNavigator
	 * @see feathers.controls.ScreenNavigator
	 */
	export class BaseScreenNavigator extends FeathersControl
	{
		/**
		 * @private
		 */
		protected static SIGNAL_TYPE:Class;

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
		 * The default transition function.
		 */
		protected static defaultTransition(oldScreen:DisplayObject, newScreen:DisplayObject, completeCallback:Function):void
		{
			//in short, do nothing
			completeCallback();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			if(Object(this).constructor == BaseScreenNavigator)
			{
				throw new Error(FeathersControl.ABSTRACT_CLASS_ERROR);
			}
			if(!BaseScreenNavigator.SIGNAL_TYPE)
			{
				try
				{
					BaseScreenNavigator.SIGNAL_TYPE = Class(getDefinitionByName("org.osflash.signals.ISignal"));
				}
				catch(error:Error)
				{
					//signals not being used
				}
			}
			this.addEventListener(Event.ADDED_TO_STAGE, this.screenNavigator_addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.screenNavigator_removedFromStageHandler);
		}

		/**
		 * @private
		 */
		protected _activeScreenID:string;

		/**
		 * The string identifier for the currently active screen.
		 */
		public get activeScreenID():string
		{
			return this._activeScreenID;
		}

		/**
		 * @private
		 */
		protected _activeScreen:DisplayObject;

		/**
		 * A reference to the currently active screen.
		 */
		public get activeScreen():DisplayObject
		{
			return this._activeScreen;
		}

		/**
		 * @private
		 */
		protected _screens:Object = {};

		/**
		 * @private
		 */
		protected _previousScreenInTransitionID:string;

		/**
		 * @private
		 */
		protected _previousScreenInTransition:DisplayObject;

		/**
		 * @private
		 */
		protected _nextScreenID:string = null;

		/**
		 * @private
		 */
		protected _nextScreenTransition:Function = null;

		/**
		 * @private
		 */
		protected _clearAfterTransition:boolean = false;

		/**
		 * @private
		 */
		protected _clipContent:boolean = false;

		/**
		 * Determines if the navigator's content should be clipped to the width
		 * and height.
		 *
		 * <p>In the following example, clipping is enabled:</p>
		 *
		 * <listing version="3.0">
		 * navigator.clipContent = true;</listing>
		 *
		 * @default false
		 */
		public get clipContent():boolean
		{
			return this._clipContent;
		}

		/**
		 * @private
		 */
		public set clipContent(value:boolean)
		{
			if(this._clipContent == value)
			{
				return;
			}
			this._clipContent = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _autoSizeMode:string = BaseScreenNavigator.AUTO_SIZE_MODE_STAGE;

		/*[Inspectable(type="String",enumeration="stage,content")]*/
		/**
		 * Determines how the screen navigator will set its own size when its
		 * dimensions (width and height) aren't set explicitly.
		 *
		 * <p>In the following example, the screen navigator will be sized to
		 * match its content:</p>
		 *
		 * <listing version="3.0">
		 * navigator.autoSizeMode = ScreenNavigator.AUTO_SIZE_MODE_CONTENT;</listing>
		 *
		 * @default ScreenNavigator.AUTO_SIZE_MODE_STAGE
		 *
		 * @see #AUTO_SIZE_MODE_STAGE
		 * @see #AUTO_SIZE_MODE_CONTENT
		 */
		public get autoSizeMode():string
		{
			return this._autoSizeMode;
		}

		/**
		 * @private
		 */
		public set autoSizeMode(value:string)
		{
			if(this._autoSizeMode == value)
			{
				return;
			}
			this._autoSizeMode = value;
			if(this._activeScreen)
			{
				if(this._autoSizeMode == BaseScreenNavigator.AUTO_SIZE_MODE_CONTENT)
				{
					this._activeScreen.addEventListener(Event.RESIZE, this.activeScreen_resizeHandler);
				}
				else
				{
					this._activeScreen.removeEventListener(Event.RESIZE, this.activeScreen_resizeHandler);
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _waitingTransition:Function;

		/**
		 * @private
		 */
		private _waitingForTransitionFrameCount:number = 1;

		/**
		 * @private
		 */
		protected _isTransitionActive:boolean = false;

		/**
		 * Indicates whether the screen navigator is currently transitioning
		 * between screens.
		 */
		public get isTransitionActive():boolean
		{
			return this._isTransitionActive;
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			if(this._activeScreen)
			{
				this.cleanupActiveScreen();
				this._activeScreen = null;
				this._activeScreenID = null;
			}
			super.dispose();
		}

		/**
		 * Removes all screens that were added with <code>addScreen()</code>.
		 *
		 * @see #addScreen()
		 */
		public removeAllScreens():void
		{
			if(this._isTransitionActive)
			{
				throw new IllegalOperationError("Cannot remove all screens while a transition is active.");
			}
			if(this._activeScreen)
			{
				//if someone meant to have a transition, they would have called
				//clearScreen()
				this.clearScreenInternal(null);
				this.dispatchEventWith(FeathersEventType.CLEAR);
			}
			for(var id:string in this._screens)
			{
				delete this._screens[id];
			}
		}

		/**
		 * Determines if the specified screen identifier has been added with
		 * <code>addScreen()</code>.
		 *
		 * @see #addScreen()
		 */
		public hasScreen(id:string):boolean
		{
			return this._screens.hasOwnProperty(id);
		}

		/**
		 * Returns a list of the screen identifiers that have been added.
		 */
		public getScreenIDs(result:string[] = null):string[]
		{
			if(result)
			{
				result.length = 0;
			}
			else
			{
				result = new Array<string>();
			}
			var pushIndex:number = 0;
			for(var id:string in this._screens)
			{
				result[pushIndex] = id;
				pushIndex++;
			}
			return result;
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var selectionInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SELECTED);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(sizeInvalid || selectionInvalid)
			{
				if(this._activeScreen)
				{
					if(this._activeScreen.width != this.actualWidth)
					{
						this._activeScreen.width = this.actualWidth;
					}
					if(this._activeScreen.height != this.actualHeight)
					{
						this._activeScreen.height = this.actualHeight;
					}
				}
			}

			if(stylesInvalid || sizeInvalid)
			{
				if(this._clipContent)
				{
					var clipRect:Rectangle = this.clipRect;
					if(!clipRect)
					{
						clipRect = new Rectangle();
					}
					clipRect.width = this.actualWidth;
					clipRect.height = this.actualHeight;
					this.clipRect = clipRect;
				}
				else
				{
					this.clipRect = null;
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

			if((this._autoSizeMode == BaseScreenNavigator.AUTO_SIZE_MODE_CONTENT || !this.stage) &&
				this._activeScreen instanceof IValidating)
			{
				IValidating(this._activeScreen).validate();
			}

			var newWidth:number = this.explicitWidth;
			if(needsWidth)
			{
				if(this._autoSizeMode == BaseScreenNavigator.AUTO_SIZE_MODE_CONTENT || !this.stage)
				{
					newWidth = this._activeScreen ? this._activeScreen.width : 0;
				}
				else
				{
					newWidth = this.stage.stageWidth;
				}
			}

			var newHeight:number = this.explicitHeight;
			if(needsHeight)
			{
				if(this._autoSizeMode == BaseScreenNavigator.AUTO_SIZE_MODE_CONTENT || !this.stage)
				{
					newHeight = this._activeScreen ? this._activeScreen.height : 0;
				}
				else
				{
					newHeight = this.stage.stageHeight;
				}
			}

			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * @private
		 */
		protected addScreenInternal(id:string, item:IScreenNavigatorItem):void
		{
			if(this._screens.hasOwnProperty(id))
			{
				throw new ArgumentError("Screen with id '" + id + "' already defined. Cannot add two screens with the same id.");
			}
			this._screens[id] = item;
		}

		/**
		 * @private
		 */
		protected removeScreenInternal(id:string):IScreenNavigatorItem
		{
			if(!this._screens.hasOwnProperty(id))
			{
				throw new ArgumentError("Screen '" + id + "' cannot be removed because it has not been added.");
			}
			if(this._isTransitionActive && (id == this._previousScreenInTransitionID || id == this._activeScreenID))
			{
				throw new IllegalOperationError("Cannot remove a screen while it is transitioning in or out.")
			}
			if(this._activeScreenID == id)
			{
				//if someone meant to have a transition, they would have called
				//clearScreen()
				this.clearScreenInternal(null);
				this.dispatchEventWith(FeathersEventType.CLEAR);
			}
			var item:IScreenNavigatorItem = this.IScreenNavigatorItem(this._screens[id]);
			delete this._screens[id];
			return item;
		}

		/**
		 * @private
		 */
		protected showScreenInternal(id:string, transition:Function, properties:Object = null):DisplayObject
		{
			if(!this.hasScreen(id))
			{
				throw new ArgumentError("Screen with id '" + id + "' cannot be shown because it has not been defined.");
			}

			if(this._isTransitionActive)
			{
				this._nextScreenID = id;
				this._nextScreenTransition = transition;
				this._clearAfterTransition = false;
				return null;
			}

			if(this._activeScreenID == id)
			{
				return this._activeScreen;
			}

			this._previousScreenInTransition = this._activeScreen;
			this._previousScreenInTransitionID = this._activeScreenID;
			if(this._activeScreen)
			{
				this.cleanupActiveScreen();
			}

			this._isTransitionActive = true;

			var item:IScreenNavigatorItem = this.IScreenNavigatorItem(this._screens[id]);
			this._activeScreen = item.getScreen();
			this._activeScreenID = id;
			for(var propertyName:string in properties)
			{
				this._activeScreen[propertyName] = properties[propertyName];
			}
			if(this._activeScreen instanceof IScreen)
			{
				var screen:IScreen = IScreen(this._activeScreen);
				screen.screenID = this._activeScreenID;
				screen.owner = this; //subclasses will implement the interface
			}
			if(this._autoSizeMode == BaseScreenNavigator.AUTO_SIZE_MODE_CONTENT || !this.stage)
			{
				this._activeScreen.addEventListener(Event.RESIZE, this.activeScreen_resizeHandler);
			}
			this.prepareActiveScreen();
			this.addChild(this._activeScreen);

			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			if(this._validationQueue && !this._validationQueue.isValidating)
			{
				//force a COMPLETE validation of everything
				//but only if we're not already doing that...
				this._validationQueue.advanceTime(0);
			}
			else if(!this._isValidating)
			{
				this.validate();
			}

			this.dispatchEventWith(FeathersEventType.TRANSITION_START);
			this._activeScreen.dispatchEventWith(FeathersEventType.TRANSITION_IN_START);
			if(this._previousScreenInTransition)
			{
				this._previousScreenInTransition.dispatchEventWith(FeathersEventType.TRANSITION_OUT_START);
			}
			if(transition != null)
			{
				//temporarily make the active screen invisible because the
				//transition doesn't start right away.
				this._activeScreen.visible = false;
				this._waitingForTransitionFrameCount = 0;
				this._waitingTransition = transition;
				//this is a workaround for an issue with transition performance.
				//see the comment in the listener for details.
				this.addEventListener(Event.ENTER_FRAME, this.waitingForTransition_enterFrameHandler);
			}
			else
			{
				BaseScreenNavigator.defaultTransition(this._previousScreenInTransition, this._activeScreen, this.transitionComplete);
			}

			this.dispatchEventWith(Event.CHANGE);
			return this._activeScreen;
		}

		/**
		 * @private
		 */
		protected clearScreenInternal(transition:Function = null):void
		{
			if(!this._activeScreen)
			{
				//no screen visible.
				return;
			}

			if(this._isTransitionActive)
			{
				this._nextScreenID = null;
				this._clearAfterTransition = true;
				this._nextScreenTransition = transition;
				return;
			}

			this.cleanupActiveScreen();

			this._isTransitionActive = true;
			this._previousScreenInTransition = this._activeScreen;
			this._previousScreenInTransitionID = this._activeScreenID;
			this._activeScreen = null;
			this._activeScreenID = null;

			this.dispatchEventWith(FeathersEventType.TRANSITION_START);
			this._previousScreenInTransition.dispatchEventWith(FeathersEventType.TRANSITION_OUT_START);
			if(transition !== null)
			{
				this._waitingForTransitionFrameCount = 0;
				this._waitingTransition = transition;
				//this is a workaround for an issue with transition performance.
				//see the comment in the listener for details.
				this.addEventListener(Event.ENTER_FRAME, this.waitingForTransition_enterFrameHandler);
			}
			else
			{
				BaseScreenNavigator.defaultTransition(this._previousScreenInTransition, this._activeScreen, this.transitionComplete);
			}
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		/**
		 * @private
		 */
		protected prepareActiveScreen():void
		{
			throw new AbstractMethodError();
		}

		/**
		 * @private
		 */
		protected cleanupActiveScreen():void
		{
			throw new AbstractMethodError();
		}

		/**
		 * @private
		 */
		protected transitionComplete(cancelTransition:boolean = false):void
		{
			this._isTransitionActive = false;
			if(cancelTransition)
			{
				if(this._activeScreen)
				{
					var item:IScreenNavigatorItem = this.IScreenNavigatorItem(this._screens[this._activeScreenID]);
					this.cleanupActiveScreen();
					this.removeChild(this._activeScreen, item.canDispose);
				}
				this._activeScreen = this._previousScreenInTransition;
				this._activeScreenID = this._previousScreenInTransitionID;
				this._previousScreenInTransition = null;
				this._previousScreenInTransitionID = null;
				this.prepareActiveScreen();
				this.dispatchEventWith(FeathersEventType.TRANSITION_CANCEL);
			}
			else
			{
				if(this._previousScreenInTransition)
				{
					this._previousScreenInTransition.dispatchEventWith(FeathersEventType.TRANSITION_OUT_COMPLETE)
				}
				if(this._activeScreen)
				{
					this._activeScreen.dispatchEventWith(FeathersEventType.TRANSITION_IN_COMPLETE)
				}
				this.dispatchEventWith(FeathersEventType.TRANSITION_COMPLETE);
				if(this._previousScreenInTransition)
				{
					item = this.IScreenNavigatorItem(this._screens[this._previousScreenInTransitionID]);
					if(this._previousScreenInTransition instanceof IScreen)
					{
						var screen:IScreen = IScreen(this._previousScreenInTransition);
						screen.screenID = null;
						screen.owner = null;
					}
					this._previousScreenInTransition.removeEventListener(Event.RESIZE, this.activeScreen_resizeHandler);
					this.removeChild(this._previousScreenInTransition, item.canDispose);
					this._previousScreenInTransition = null;
					this._previousScreenInTransitionID = null;
				}
			}

			if(this._clearAfterTransition)
			{
				this.clearScreenInternal(this._nextScreenTransition);
			}
			else if(this._nextScreenID)
			{
				this.showScreenInternal(this._nextScreenID, this._nextScreenTransition);
			}

			this._nextScreenID = null;
			this._nextScreenTransition = null;
			this._clearAfterTransition = false;
		}

		/**
		 * @private
		 */
		protected screenNavigator_addedToStageHandler(event:Event):void
		{
			this.stage.addEventListener(Event.RESIZE, this.stage_resizeHandler);
		}

		/**
		 * @private
		 */
		protected screenNavigator_removedFromStageHandler(event:Event):void
		{
			this.stage.removeEventListener(Event.RESIZE, this.stage_resizeHandler);
		}

		/**
		 * @private
		 */
		protected activeScreen_resizeHandler(event:Event):void
		{
			if(this._isValidating || this._autoSizeMode != BaseScreenNavigator.AUTO_SIZE_MODE_CONTENT)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected stage_resizeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		private waitingForTransition_enterFrameHandler(event:Event):void
		{
			//we need to wait a couple of frames before we can start the
			//transition to make it as smooth as possible. this feels a little
			//hacky, to be honest, but I can't figure out why waiting only one
			//frame won't do the trick. the delay is so small though that it's
			//virtually impossible to notice.
			if(this._waitingForTransitionFrameCount < 2)
			{
				this._waitingForTransitionFrameCount++;
				return;
			}
			this.removeEventListener(Event.ENTER_FRAME, this.waitingForTransition_enterFrameHandler);
			if(this._activeScreen)
			{
				this._activeScreen.visible = true;
			}

			var transition:Function = this._waitingTransition;
			this._waitingTransition = null;
			transition(this._previousScreenInTransition, this._activeScreen, this.transitionComplete);
		}
	}
}
