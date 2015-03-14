/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import DropDownPopUpContentManager = feathers.controls.popups.DropDownPopUpContentManager;
	import IPopUpContentManager = feathers.controls.popups.IPopUpContentManager;
	import PropertyProxy = feathers.core.PropertyProxy;
	import IAutoCompleteSource = feathers.data.IAutoCompleteSource;
	import ListCollection = feathers.data.ListCollection;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import KeyboardEvent = flash.events.KeyboardEvent;
	import Keyboard = flash.ui.Keyboard;
	import getTimer = flash.utils.getTimer;

	import Starling = starling.core.Starling;
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;
	import KeyboardEvent = starling.events.KeyboardEvent;

	/**
	 * Dispatched when the pop-up list is opened.
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
	 * @eventType starling.events.Event.OPEN
	 */
	/*[Event(name="open",type="starling.events.Event")]*/

	/**
	 * Dispatched when the pop-up list is closed.
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
	 * @eventType starling.events.Event.CLOSE
	 */
	/*[Event(name="close",type="starling.events.Event")]*/

	/**
	 * A text input that provides a pop-up list with suggestions as you type.
	 *
	 * <p>The following example creates an <code>AutoComplete</code> with a
	 * local collection of suggestions:</p>
	 *
	 * <listing version="3.0">
	 * var input:AutoComplete = new AutoComplete();
	 * input.source = new LocalAutoCompleteSource( new ListCollection(new &lt;String&gt;
	 * [
	 *     "Apple",
	 *     "Banana",
	 *     "Cherry",
	 *     "Grape",
	 *     "Lemon",
	 *     "Orange",
	 *     "Watermelon"
	 * ]));
	 * this.addChild( input );</listing>
	 *
	 * <p><strong>Beta Component:</strong> This is a new component, and its APIs
	 * may need some changes between now and the next version of Feathers to
	 * account for overlooked requirements or other issues. Upgrading to future
	 * versions of Feathers may involve manual changes to your code that uses
	 * this component. The
	 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>
	 * will not go into effect until this component's status is upgraded from
	 * beta to stable.</p>
	 *
	 * @see ../../../help/auto-complete.html How to use the Feathers AutoComplete component
	 * @see feathers.controls.TextInput
	 */
	export class AutoComplete extends TextInput
	{
		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_LIST_FACTORY:string = "listFactory";

		/**
		 * The default value added to the <code>styleNameList</code> of the pop-up
		 * list.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_LIST:string = "feathers-auto-complete-list";

		/**
		 * The default <code>IStyleProvider</code> for all
		 * <code>AutoComplete</code> components. If <code>null</code>, falls
		 * back to using <code>TextInput.globalStyleProvider</code> instead.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static defaultListFactory():List
		{
			return new List();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			this.addEventListener(Event.CHANGE, this.autoComplete_changeHandler);
		}

		/**
		 * The default value added to the <code>styleNameList</code> of the
		 * pop-up list. This variable is <code>protected</code> so that
		 * sub-classes can customize the list style name in their constructors
		 * instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_LIST</code>.
		 *
		 * <p>To customize the pop-up list name without subclassing, see
		 * <code>customListStyleName</code>.</p>
		 *
		 * @see #customListStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected listStyleName:string = AutoComplete.DEFAULT_CHILD_STYLE_NAME_LIST;

		/**
		 * The list sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #listFactory
		 * @see #createList()
		 */
		protected list:List;

		/**
		 * @private
		 */
		protected _listCollection:ListCollection;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			if(AutoComplete.globalStyleProvider)
			{
				return AutoComplete.globalStyleProvider;
			}
			return this.TextInput.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _originalText:string;

		/**
		 * @private
		 */
		protected _source:IAutoCompleteSource;

		/**
		 * The source of the suggestions that appear in the pop-up list.
		 *
		 * <p>In the following example, a source of suggestions is provided:</p>
		 *
		 * <listing version="3.0">
		 * input.source = new LocalAutoCompleteSource( new ListCollection(new &lt;String&gt;
		 * [
		 *     "Apple",
		 *     "Banana",
		 *     "Cherry",
		 *     "Grape",
		 *     "Lemon",
		 *     "Orange",
		 *     "Watermelon"
		 * ]));</listing>
		 * 
		 * @default null
		 */
		public get source():IAutoCompleteSource
		{
			return this._source;
		}

		/**
		 * @private
		 */
		public set source(value:IAutoCompleteSource)
		{
			if(this._source == value)
			{
				return;
			}
			if(this._source)
			{
				this._source.removeEventListener(Event.COMPLETE, this.dataProvider_completeHandler);
			}
			this._source = value;
			if(this._source)
			{
				this._source.addEventListener(Event.COMPLETE, this.dataProvider_completeHandler);
			}
		}

		/**
		 * @private
		 */
		protected _autoCompleteDelay:number = 0.5;

		/**
		 * The time, in seconds, after the text has changed before requesting
		 * suggestions from the <code>IAutoCompleteSource</code>.
		 *
		 * <p>In the following example, the delay is changed to 1.5 seconds:</p>
		 *
		 * <listing version="3.0">
		 * input.autoCompleteDelay = 1.5;</listing>
		 *
		 * @default 0.5
		 *
		 * @see #source
		 */
		public get autoCompleteDelay():number
		{
			return this._autoCompleteDelay;
		}

		/**
		 * @private
		 */
		public set autoCompleteDelay(value:number)
		{
			this._autoCompleteDelay = value;
		}

		/**
		 * @private
		 */
		protected _minimumAutoCompleteLength:number = 2;

		/**
		 * The minimum number of entered characters required to request
		 * suggestions from the <code>IAutoCompleteSource</code>.
		 *
		 * <p>In the following example, the minimum number of characters is
		 * changed to <code>3</code>:</p>
		 *
		 * <listing version="3.0">
		 * input.minimumAutoCompleteLength = 3;</listing>
		 *
		 * @default 2
		 *
		 * @see #source
		 */
		public get minimumAutoCompleteLength():number
		{
			return this._minimumAutoCompleteLength;
		}

		/**
		 * @private
		 */
		public set minimumAutoCompleteLength(value:number)
		{
			this._minimumAutoCompleteLength = value;
		}

		/**
		 * @private
		 */
		protected _popUpContentManager:IPopUpContentManager;

		/**
		 * A manager that handles the details of how to display the pop-up list.
		 *
		 * <p>In the following example, a pop-up content manager is provided:</p>
		 *
		 * <listing version="3.0">
		 * input.popUpContentManager = new CalloutPopUpContentManager();</listing>
		 *
		 * @default null
		 */
		public get popUpContentManager():IPopUpContentManager
		{
			return this._popUpContentManager;
		}

		/**
		 * @private
		 */
		public set popUpContentManager(value:IPopUpContentManager)
		{
			if(this._popUpContentManager == value)
			{
				return;
			}
			if(this._popUpContentManager instanceof EventDispatcher)
			{
				var dispatcher:EventDispatcher = EventDispatcher(this._popUpContentManager);
				dispatcher.removeEventListener(Event.OPEN, this.popUpContentManager_openHandler);
				dispatcher.removeEventListener(Event.CLOSE, this.popUpContentManager_closeHandler);
			}
			this._popUpContentManager = value;
			if(this._popUpContentManager instanceof EventDispatcher)
			{
				dispatcher = EventDispatcher(this._popUpContentManager);
				dispatcher.addEventListener(Event.OPEN, this.popUpContentManager_openHandler);
				dispatcher.addEventListener(Event.CLOSE, this.popUpContentManager_closeHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _listFactory:Function;

		/**
		 * A function used to generate the pop-up list sub-component. The list
		 * must be an instance of <code>List</code>. This factory can be used to
		 * change properties on the list when it is first created. For instance,
		 * if you are skinning Feathers components without a theme, you might
		 * use this factory to set skins and other styles on the list.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():List</pre>
		 *
		 * <p>In the following example, a custom list factory is passed to the
		 * <code>AutoComplete</code>:</p>
		 *
		 * <listing version="3.0">
		 * input.listFactory = function():List
		 * {
		 *     var popUpList:List = new List();
		 *     popUpList.backgroundSkin = new Image( texture );
		 *     return popUpList;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.List
		 * @see #listProperties
		 */
		public get listFactory():Function
		{
			return this._listFactory;
		}

		/**
		 * @private
		 */
		public set listFactory(value:Function)
		{
			if(this._listFactory == value)
			{
				return;
			}
			this._listFactory = value;
			this.invalidate(AutoComplete.INVALIDATION_FLAG_LIST_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customListStyleName:string;

		/**
		 * A style name to add to the list sub-component of the
		 * <code>AutoComplete</code>. Typically used by a theme to provide
		 * different styles to different <code>AutoComplete</code> instances.
		 *
		 * <p>In the following example, a custom list style name is passed to the
		 * <code>AutoComplete</code>:</p>
		 *
		 * <listing version="3.0">
		 * input.customListStyleName = "my-custom-list";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to provide
		 * different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( List ).setFunctionForStyleName( "my-custom-list", setCustomListStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_LIST
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #listFactory
		 * @see #listProperties
		 */
		public get customListStyleName():string
		{
			return this._customListStyleName;
		}

		/**
		 * @private
		 */
		public set customListStyleName(value:string)
		{
			if(this._customListStyleName == value)
			{
				return;
			}
			this._customListStyleName = value;
			this.invalidate(AutoComplete.INVALIDATION_FLAG_LIST_FACTORY);
		}

		/**
		 * @private
		 */
		protected _listProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the pop-up list
		 * sub-component of the <code>AutoComplete</code>. The pop-up list is a
		 * <code>feathers.controls.List</code> instance that is created by
		 * <code>listFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>listFactory</code> function
		 * instead of using <code>listProperties</code> will result in better
		 * performance.</p>
		 *
		 * <p>In the following example, the list properties are passed to the
		 * auto complete:</p>
		 *
		 * <listing version="3.0">
		 * input.listProperties.backgroundSkin = new Image( texture );</listing>
		 *
		 * @default null
		 *
		 * @see #listFactory
		 * @see feathers.controls.List
		 */
		public get listProperties():Object
		{
			if(!this._listProperties)
			{
				this._listProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._listProperties;
		}

		/**
		 * @private
		 */
		public set listProperties(value:Object)
		{
			if(this._listProperties == value)
			{
				return;
			}
			if(!value)
			{
				value = new PropertyProxy();
			}
			if(!(value instanceof PropertyProxy))
			{
				var newValue:PropertyProxy = new PropertyProxy();
				for(var propertyName:string in value)
				{
					newValue[propertyName] = value[propertyName];
				}
				value = newValue;
			}
			if(this._listProperties)
			{
				this._listProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._listProperties = PropertyProxy(value);
			if(this._listProperties)
			{
				this._listProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _ignoreAutoCompleteChanges:boolean = false;

		/**
		 * @private
		 */
		protected _lastChangeTime:number = 0;

		/**
		 * @private
		 */
		protected _listHasFocus:boolean = false;

		/**
		 * @private
		 */
		protected _isOpenListPending:boolean = false;

		/**
		 * @private
		 */
		protected _isCloseListPending:boolean = false;

		/**
		 * Opens the pop-up list, if it isn't already open.
		 */
		public openList():void
		{
			this._isCloseListPending = false;
			if(this._popUpContentManager.isOpen)
			{
				return;
			}
			if(!this._isValidating && this.isInvalid())
			{
				this._isOpenListPending = true;
				return;
			}
			this._isOpenListPending = false;
			this._popUpContentManager.open(this.list, this);
			this.list.validate();
			if(this._focusManager)
			{
				this.stage.addEventListener(this.starling.events.KeyboardEvent.KEY_UP, this.stage_keyUpHandler);
			}
		}

		/**
		 * Closes the pop-up list, if it is open.
		 */
		public closeList():void
		{
			this._isOpenListPending = false;
			if(!this._popUpContentManager.isOpen)
			{
				return;
			}
			if(!this._isValidating && this.isInvalid())
			{
				this._isCloseListPending = true;
				return;
			}
			if(this._listHasFocus)
			{
				this.list.dispatchEventWith(FeathersEventType.FOCUS_OUT);
			}
			this._isCloseListPending = false;
			this.list.validate();
			//don't clean up anything from openList() in closeList(). The list
			//may be closed by removing it from the PopUpManager, which would
			//result in closeList() never being called.
			//instead, clean up in the Event.REMOVED_FROM_STAGE listener.
			this._popUpContentManager.close();
		}

		/**
		 * @inheritDoc
		 */
		/*override*/ public dispose():void
		{
			this.source = null;
			if(this.list)
			{
				this.closeList();
				this.list.dispose();
				this.list = null;
			}
			if(this._popUpContentManager)
			{
				this._popUpContentManager.dispose();
				this._popUpContentManager = null;
			}
			super.dispose();
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			super.initialize();

			this._listCollection = new ListCollection();
			if(!this._popUpContentManager)
			{
				this.popUpContentManager = new DropDownPopUpContentManager();
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var listFactoryInvalid:boolean = this.isInvalid(AutoComplete.INVALIDATION_FLAG_LIST_FACTORY);

			super.draw();

			if(listFactoryInvalid)
			{
				this.createList();
			}

			if(listFactoryInvalid || stylesInvalid)
			{
				this.refreshListProperties();
			}

			this.handlePendingActions();
		}

		/**
		 * Creates and adds the <code>list</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #list
		 * @see #listFactory
		 * @see #customListStyleName
		 */
		protected createList():void
		{
			if(this.list)
			{
				this.list.removeFromParent(false);
				//disposing separately because the list may not have a parent
				this.list.dispose();
				this.list = null;
			}

			var factory:Function = this._listFactory != null ? this._listFactory : AutoComplete.defaultListFactory;
			var listStyleName:string = this._customListStyleName != null ? this._customListStyleName : this.listStyleName;
			this.list = this.List(factory());
			this.list.focusOwner = this;
			this.list.isFocusEnabled = false;
			this.list.isChildFocusEnabled = false;
			this.list.styleNameList.add(listStyleName);
			this.list.addEventListener(Event.CHANGE, this.list_changeHandler);
			this.list.addEventListener(Event.TRIGGERED, this.list_triggeredHandler);
			this.list.addEventListener(Event.REMOVED_FROM_STAGE, this.list_removedFromStageHandler);
		}

		/**
		 * @private
		 */
		protected refreshListProperties():void
		{
			for(var propertyName:string in this._listProperties)
			{
				var propertyValue:Object = this._listProperties[propertyName];
				this.list[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected handlePendingActions():void
		{
			if(this._isOpenListPending)
			{
				this.openList();
			}
			if(this._isCloseListPending)
			{
				this.closeList();
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected focusInHandler(event:Event):void
		{
			//the priority here is 1 so that this listener is called before
			//starling's listener. we want to know the list's selected index
			//before the list changes it.
			Starling.current.nativeStage.addEventListener(this.flash.events.KeyboardEvent.KEY_DOWN, this.nativeStage_keyDownHandler, false, 1, true);
			super.focusInHandler(event);
		}

		/**
		 * @private
		 */
		/*override*/ protected focusOutHandler(event:Event):void
		{
			Starling.current.nativeStage.removeEventListener(this.flash.events.KeyboardEvent.KEY_DOWN, this.nativeStage_keyDownHandler);
			super.focusOutHandler(event);
		}

		/**
		 * @private
		 */
		protected nativeStage_keyDownHandler(event:KeyboardEventKeyboardEvent):void
		{
			if(!this._popUpContentManager.isOpen)
			{
				return;
			}
			var isDown:boolean = event.keyCode == Keyboard.DOWN;
			var isUp:boolean = event.keyCode == Keyboard.UP;
			if(!isDown && !isUp)
			{
				return;
			}
			var oldSelectedIndex:number = this.list.selectedIndex;
			var lastIndex:number = this.list.dataProvider.length - 1;
			if(oldSelectedIndex < 0)
			{
				event.stopImmediatePropagation();
				this._originalText = this._text;
				if(isDown)
				{
					this.list.selectedIndex = 0;
				}
				else
				{
					this.list.selectedIndex = lastIndex;
				}
				this.list.scrollToDisplayIndex(this.list.selectedIndex, this.list.keyScrollDuration);
				this._listHasFocus = true;
				this.list.dispatchEventWith(FeathersEventType.FOCUS_IN);
			}
			else if((isDown && oldSelectedIndex == lastIndex) ||
				(isUp && oldSelectedIndex == 0))
			{
				event.stopImmediatePropagation();
				var oldIgnoreAutoCompleteChanges:boolean = this._ignoreAutoCompleteChanges;
				this._ignoreAutoCompleteChanges = true;
				this.text = this._originalText;
				this._ignoreAutoCompleteChanges = oldIgnoreAutoCompleteChanges;
				this.list.selectedIndex = -1;
				this.selectRange(this.text.length, this.text.length);
				this._listHasFocus = false;
				this.list.dispatchEventWith(FeathersEventType.FOCUS_OUT);
			}
		}

		/**
		 * @private
		 */
		protected autoComplete_changeHandler(event:Event):void
		{
			if(this._ignoreAutoCompleteChanges || !this._source || !this.hasFocus)
			{
				return;
			}
			if(this.text.length < this._minimumAutoCompleteLength)
			{
				this.removeEventListener(Event.ENTER_FRAME, this.autoComplete_enterFrameHandler);
				this.closeList();
				return;
			}

			if(this._autoCompleteDelay == 0)
			{
				//just in case the enter frame listener was added before
				//sourceUpdateDelay was set to 0.
				this.removeEventListener(Event.ENTER_FRAME, this.autoComplete_enterFrameHandler);

				this._source.load(this.text, this._listCollection);
			}
			else
			{
				this._lastChangeTime = getTimer();
				this.addEventListener(Event.ENTER_FRAME, this.autoComplete_enterFrameHandler);
			}
		}

		/**
		 * @private
		 */
		protected autoComplete_enterFrameHandler():void
		{
			var currentTime:number = getTimer();
			var secondsSinceLastUpdate:number = (currentTime - this._lastChangeTime) / 1000;
			if(secondsSinceLastUpdate < this._autoCompleteDelay)
			{
				return;
			}
			this.removeEventListener(Event.ENTER_FRAME, this.autoComplete_enterFrameHandler);
			this._source.load(this.text, this._listCollection);
		}

		/**
		 * @private
		 */
		protected dataProvider_completeHandler(event:Event, data:ListCollection):void
		{
			this.list.dataProvider = data;
			if(data.length == 0)
			{
				if(this._popUpContentManager.isOpen)
				{
					this.closeList();
				}
				return;
			}
			this.openList();
		}

		/**
		 * @private
		 */
		protected list_changeHandler(event:Event):void
		{
			if(!this.list.selectedItem)
			{
				return;
			}
			var oldIgnoreAutoCompleteChanges:boolean = this._ignoreAutoCompleteChanges;
			this._ignoreAutoCompleteChanges = true;
			this.text = this.list.selectedItem.toString();
			this.selectRange(this.text.length, this.text.length);
			this._ignoreAutoCompleteChanges = oldIgnoreAutoCompleteChanges;
		}

		/**
		 * @private
		 */
		protected popUpContentManager_openHandler(event:Event):void
		{
			this.dispatchEventWith(Event.OPEN);
		}

		/**
		 * @private
		 */
		protected popUpContentManager_closeHandler(event:Event):void
		{
			this.dispatchEventWith(Event.CLOSE);
		}

		/**
		 * @private
		 */
		protected list_removedFromStageHandler(event:Event):void
		{
			if(this._focusManager)
			{
				this.list.stage.removeEventListener(this.starling.events.KeyboardEvent.KEY_UP, this.stage_keyUpHandler);
			}
		}

		/**
		 * @private
		 */
		protected list_triggeredHandler(event:Event):void
		{
			if(!this._isEnabled)
			{
				return;
			}
			this.closeList();
			this.selectRange(this.text.length, this.text.length);
		}

		/**
		 * @private
		 */
		protected stage_keyUpHandler(event:KeyboardEventts.KeyboardEvent):void
		{
			if(!this._popUpContentManager.isOpen)
			{
				return;
			}
			if(event.keyCode == Keyboard.ENTER)
			{
				this.closeList();
				this.selectRange(this.text.length, this.text.length);
			}
		}
	}
}
