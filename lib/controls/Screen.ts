/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IStyleProvider = feathers.skins.IStyleProvider;
	import getDisplayObjectDepthFromStage = feathers.utils.display.getDisplayObjectDepthFromStage;

	import KeyboardEvent = flash.events.KeyboardEvent;
	import Keyboard = flash.ui.Keyboard;

	import Starling = starling.core.Starling;
	import Event = starling.events.Event;

	/**
	 * Dispatched when the transition animation begins as the screen is shown
	 * by the screen navigator.
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
	 * @eventType feathers.events.FeathersEventType.TRANSITION_IN_START
	 */
	/*[Event(name="transitionInStart",type="starling.events.Event")]*/

	/**
	 * Dispatched when the transition animation finishes as the screen is shown
	 * by the screen navigator.
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
	 * @eventType feathers.events.FeathersEventType.TRANSITION_IN_COMPLETE
	 */
	/*[Event(name="transitionInComplete",type="starling.events.Event")]*/

	/**
	 * Dispatched when the transition animation begins as a different screen is
	 * shown by the screen navigator and this screen is hidden.
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
	 * @eventType feathers.events.FeathersEventType.TRANSITION_OUT_START
	 */
	/*[Event(name="transitionOutStart",type="starling.events.Event")]*/

	/**
	 * Dispatched when the transition animation finishes as a different screen
	 * is shown by the screen navigator and this screen is hidden.
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
	 * @eventType feathers.events.FeathersEventType.TRANSITION_OUT_COMPLETE
	 */
	/*[Event(name="transitionOutComplete",type="starling.events.Event")]*/

	/**
	 * A basic screen to be displayed by <code>ScreenNavigator</code>. Provides
	 * layout capabilities, but no scrolling.
	 *
	 * <p>The following example provides a basic framework for a new screen:</p>
	 *
	 * <listing version="3.0">
	 * package
	 * {
	 *     import feathers.controls.Screen;
	 *     
	 *     public class CustomScreen extends Screen
	 *     {
	 *         public function CustomScreen()
	 *         {
	 *             super();
	 *         }
	 *         
	 *         override protected function initialize():void
	 *         {
	 *             //runs once when screen is first added to the stage
	 *             //a good place to add children and customize the layout
	 *             
	 *             //don't forget to call this!
	 *             super.initialize()
	 *         }
	 *     }
	 * }</listing>
	 *
	 * @see ../../../help/screen.html How to use the Feathers Screen component
	 * @see feathers.controls.StackScreenNavigator
	 * @see feathers.controls.ScreenNavigator
	 */
	export class Screen extends LayoutGroup implements IScreen
	{
		/**
		 * @copy feathers.controls.LayoutGroup#AUTO_SIZE_MODE_STAGE
		 *
		 * @see feathers.controls.LayoutGroup#autoSizeMode
		 */
		public static AUTO_SIZE_MODE_STAGE:string = "stage";

		/**
		 * @copy feathers.controls.LayoutGroup#AUTO_SIZE_MODE_CONTENT
		 *
		 * @see feathers.controls.LayoutGroup#autoSizeMode
		 */
		public static AUTO_SIZE_MODE_CONTENT:string = "content";

		/**
		 * The default <code>IStyleProvider</code> for all <code>Screen</code>
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
			this.addEventListener(Event.ADDED_TO_STAGE, this.screen_addedToStageHandler);
			super();
		}

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Screen.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _screenID:string;

		/**
		 * @inheritDoc
		 */
		public get screenID():string
		{
			return this._screenID;
		}

		/**
		 * @private
		 */
		public set screenID(value:string)
		{
			this._screenID = value;
		}

		/**
		 * @private
		 */
		protected _owner:Object;

		/**
		 * @inheritDoc
		 */
		public get owner():Object
		{
			return this._owner;
		}

		/**
		 * @private
		 */
		public set owner(value:Object)
		{
			this._owner = value;
		}
		
		/**
		 * Optional callback for the back hardware key. Automatically handles
		 * keyboard events to cancel the default behavior.
		 *
		 * <p>This function has the following signature:</p>
		 *
		 * <pre>function():void</pre>
		 *
		 * <p>In the following example, a function will dispatch <code>Event.COMPLETE</code>
		 * when the back button is pressed:</p>
		 *
		 * <listing version="3.0">
		 * this.backButtonHandler = onBackButton;
		 *
		 * private function onBackButton():void
		 * {
		 *     this.dispatchEvent( Event.COMPLETE );
		 * };</listing>
		 *
		 * @default null
		 */
		protected backButtonHandler:Function;
		
		/**
		 * Optional callback for the menu hardware key. Automatically handles
		 * keyboard events to cancel the default behavior.
		 *
		 * <p>This function has the following signature:</p>
		 *
		 * <pre>function():void</pre>
		 *
		 * <p>In the following example, a function will be called when the menu
		 * button is pressed:</p>
		 *
		 * <listing version="3.0">
		 * this.menuButtonHandler = onMenuButton;
		 *
		 * private function onMenuButton():void
		 * {
		 *     //do something with the menu button
		 * };</listing>
		 *
		 * @default null
		 */
		protected menuButtonHandler:Function;
		
		/**
		 * Optional callback for the search hardware key. Automatically handles
		 * keyboard events to cancel the default behavior.
		 *
		 * <p>This function has the following signature:</p>
		 *
		 * <pre>function():void</pre>
		 *
		 * <p>In the following example, a function will be called when the search
		 * button is pressed:</p>
		 *
		 * <listing version="3.0">
		 * this.searchButtonHandler = onSearchButton;
		 *
		 * private function onSearchButton():void
		 * {
		 *     //do something with the search button
		 * };</listing>
		 *
		 * @default null
		 */
		protected searchButtonHandler:Function;
		
		/**
		 * @private
		 */
		protected screen_addedToStageHandler(event:Event):void
		{
			if(event.target != this)
			{
				return;
			}
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.screen_removedFromStageHandler);
			//using priority here is a hack so that objects higher up in the
			//display list have a chance to cancel the event first.
			var priority:number = -getDisplayObjectDepthFromStage(this);
			Starling.current.nativeStage.addEventListener(KeyboardEvent.KEY_DOWN, this.screen_nativeStage_keyDownHandler, false, priority, true);
		}

		/**
		 * @private
		 */
		protected screen_removedFromStageHandler(event:Event):void
		{
			if(event.target != this)
			{
				return;
			}
			this.removeEventListener(Event.REMOVED_FROM_STAGE, this.screen_removedFromStageHandler);
			Starling.current.nativeStage.removeEventListener(KeyboardEvent.KEY_DOWN, this.screen_nativeStage_keyDownHandler);
		}
		
		/**
		 * @private
		 */
		protected screen_nativeStage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.isDefaultPrevented())
			{
				//someone else already handled this one
				return;
			}
			if(this.backButtonHandler != null &&
				event.keyCode == Keyboard.BACK)
			{
				event.preventDefault();
				this.backButtonHandler();
			}
			
			if(this.menuButtonHandler != null &&
				event.keyCode == Keyboard.MENU)
			{
				event.preventDefault();
				this.menuButtonHandler();
			}
			
			if(this.searchButtonHandler != null &&
				event.keyCode == Keyboard.SEARCH)
			{
				event.preventDefault();
				this.searchButtonHandler();
			}
		}
	}
}