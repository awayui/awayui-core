/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import DefaultListItemRenderer = feathers.controls.renderers.DefaultListItemRenderer;
	import ListDataViewPort = feathers.controls.supportClasses.ListDataViewPort;
	import IFocusContainer = feathers.core.IFocusContainer;
	import PropertyProxy = feathers.core.PropertyProxy;
	import ListCollection = feathers.data.ListCollection;
	import CollectionEventType = feathers.events.CollectionEventType;
	import ILayout = feathers.layout.ILayout;
	import IVariableVirtualLayout = feathers.layout.IVariableVirtualLayout;
	import VerticalLayout = feathers.layout.VerticalLayout;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Point = flash.geom.Point;
	import Keyboard = flash.ui.Keyboard;

	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;

	/**
	 * Dispatched when the selected item changes.
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
	 * Dispatched when the the user taps or clicks an item renderer in the list.
	 * The touch must remain within the bounds of the item renderer on release,
	 * and the list must not have scrolled, to register as a tap or a click.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>The item associated with the item
	 *   renderer that was triggered.</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType starling.events.Event.TRIGGERED
	 */
	/*[Event(name="triggered",type="starling.events.Event")]*/

	/**
	 * Dispatched when an item renderer is added to the list. When the layout is
	 * virtualized, item renderers may not exist for every item in the data
	 * provider. This event can be used to track which items currently have
	 * renderers.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>The item renderer that was added.</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.RENDERER_ADD
	 */
	/*[Event(name="rendererAdd",type="starling.events.Event")]*/

	/**
	 * Dispatched when an item renderer is removed from the list. When the layout is
	 * virtualized, item renderers may not exist for every item in the data
	 * provider. This event can be used to track which items currently have
	 * renderers.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>The item renderer that was removed.</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.RENDERER_REMOVE
	 */
	/*[Event(name="rendererRemove",type="starling.events.Event")]*/

	/*[DefaultProperty("dataProvider")]*/
	/**
	 * Displays a one-dimensional list of items. Supports scrolling, custom
	 * item renderers, and custom layouts.
	 *
	 * <p>Layouts may be, and are highly encouraged to be, <em>virtual</em>,
	 * meaning that the List is capable of creating a limited number of item
	 * renderers to display a subset of the data provider instead of creating a
	 * renderer for every single item. This allows for optimal performance with
	 * very large data providers.</p>
	 *
	 * <p>The following example creates a list, gives it a data provider, tells
	 * the item renderer how to interpret the data, and listens for when the
	 * selection changes:</p>
	 *
	 * <listing version="3.0">
	 * var list:List = new List();
	 * 
	 * list.dataProvider = new ListCollection(
	 * [
	 *     { text: "Milk", thumbnail: textureAtlas.getTexture( "milk" ) },
	 *     { text: "Eggs", thumbnail: textureAtlas.getTexture( "eggs" ) },
	 *     { text: "Bread", thumbnail: textureAtlas.getTexture( "bread" ) },
	 *     { text: "Chicken", thumbnail: textureAtlas.getTexture( "chicken" ) },
	 * ]);
	 * 
	 * list.itemRendererFactory = function():IListItemRenderer
	 * {
	 *     var renderer:DefaultListItemRenderer = new DefaultListItemRenderer();
	 *     renderer.labelField = "text";
	 *     renderer.iconSourceField = "thumbnail";
	 *     return renderer;
	 * };
	 * 
	 * list.addEventListener( Event.CHANGE, list_changeHandler );
	 * 
	 * this.addChild( list );</listing>
	 *
	 * @see ../../../help/list.html How to use the Feathers List component
	 * @see ../../../help/default-item-renderers.html How to use the Feathers default item renderer
	 * @see ../../../help/item-renderers.html Creating custom item renderers for the Feathers List and GroupedList components
	 * @see feathers.controls.GroupedList
	 * @see feathers.controls.SpinnerList
	 */
	export class List extends Scroller implements IFocusContainer
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_AUTO
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_AUTO:string = "auto";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_ON
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_ON:string = "on";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_OFF
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_OFF:string = "off";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_FLOAT
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FLOAT:string = "float";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_FIXED
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FIXED:string = "fixed";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_NONE
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_NONE:string = "none";

		/**
		 * The vertical scroll bar will be positioned on the right.
		 *
		 * @see feathers.controls.Scroller#verticalScrollBarPosition
		 */
		public static VERTICAL_SCROLL_BAR_POSITION_RIGHT:string = "right";

		/**
		 * The vertical scroll bar will be positioned on the left.
		 *
		 * @see feathers.controls.Scroller#verticalScrollBarPosition
		 */
		public static VERTICAL_SCROLL_BAR_POSITION_LEFT:string = "left";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_TOUCH
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH:string = "touch";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_MOUSE
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_MOUSE:string = "mouse";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_TOUCH_AND_SCROLL_BARS
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH_AND_SCROLL_BARS:string = "touchAndScrollBars";

		/**
		 * @copy feathers.controls.Scroller#MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL:string = "vertical";

		/**
		 * @copy feathers.controls.Scroller#MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * @copy feathers.controls.Scroller#DECELERATION_RATE_NORMAL
		 *
		 * @see feathers.controls.Scroller#decelerationRate
		 */
		public static DECELERATION_RATE_NORMAL:number = 0.998;

		/**
		 * @copy feathers.controls.Scroller#DECELERATION_RATE_FAST
		 *
		 * @see feathers.controls.Scroller#decelerationRate
		 */
		public static DECELERATION_RATE_FAST:number = 0.99;

		/**
		 * The default <code>IStyleProvider</code> for all <code>List</code>
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
			this._selectedIndices.addEventListener(Event.CHANGE, this.selectedIndices_changeHandler);
		}

		/**
		 * @private
		 * The guts of the List's functionality. Handles layout and selection.
		 */
		protected dataViewPort:ListDataViewPort;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return List.globalStyleProvider;
		}

		/**
		 * @private
		 */
		/*override*/ public get isFocusEnabled():boolean
		{
			return (this._isSelectable || this._minHorizontalScrollPosition != this._maxHorizontalScrollPosition ||
				this._minVerticalScrollPosition != this._maxVerticalScrollPosition) &&
				this._isEnabled && this._isFocusEnabled;
		}

		/**
		 * @private
		 */
		protected _isChildFocusEnabled:boolean = true;

		/**
		 * @copy feathers.core.IFocusContainer#isChildFocusEnabled
		 *
		 * @default true
		 *
		 * @see #isFocusEnabled
		 */
		public get isChildFocusEnabled():boolean
		{
			return this._isEnabled && this._isChildFocusEnabled;
		}

		/**
		 * @private
		 */
		public set isChildFocusEnabled(value:boolean)
		{
			this._isChildFocusEnabled = value;
		}

		/**
		 * @private
		 */
		protected _layout:ILayout;

		/**
		 * The layout algorithm used to position and, optionally, size the
		 * list's items.
		 *
		 * <p>By default, if no layout is provided by the time that the list
		 * initializes, a vertical layout with options targeted at touch screens
		 * is created.</p>
		 *
		 * <p>The following example tells the list to use a horizontal layout:</p>
		 *
		 * <listing version="3.0">
		 * var layout:HorizontalLayout = new HorizontalLayout();
		 * layout.gap = 20;
		 * layout.padding = 20;
		 * list.layout = layout;</listing>
		 *
		 * @default null
		 */
		public get layout():ILayout
		{
			return this._layout;
		}

		/**
		 * @private
		 */
		public set layout(value:ILayout)
		{
			if(this._layout == value)
			{
				return;
			}
			if(this._layout)
			{
				this._layout.removeEventListener(Event.SCROLL, this.layout_scrollHandler);
			}
			this._layout = value;
			if(this._layout instanceof IVariableVirtualLayout)
			{
				this._layout.addEventListener(Event.SCROLL, this.layout_scrollHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}
		
		/**
		 * @private
		 */
		protected _dataProvider:ListCollection;
		
		/**
		 * The collection of data displayed by the list. Changing this property
		 * to a new value is considered a drastic change to the list's data, so
		 * the horizontal and vertical scroll positions will be reset, and the
		 * list's selection will be cleared.
		 *
		 * <p>The following example passes in a data provider and tells the item
		 * renderer how to interpret the data:</p>
		 *
		 * <listing version="3.0">
		 * list.dataProvider = new ListCollection(
		 * [
		 *     { text: "Milk", thumbnail: textureAtlas.getTexture( "milk" ) },
		 *     { text: "Eggs", thumbnail: textureAtlas.getTexture( "eggs" ) },
		 *     { text: "Bread", thumbnail: textureAtlas.getTexture( "bread" ) },
		 *     { text: "Chicken", thumbnail: textureAtlas.getTexture( "chicken" ) },
		 * ]);
		 *
		 * list.itemRendererFactory = function():IListItemRenderer
		 * {
		 *     var renderer:DefaultListItemRenderer = new DefaultListItemRenderer();
		 *     renderer.labelField = "text";
		 *     renderer.iconSourceField = "thumbnail";
		 *     return renderer;
		 * };</listing>
		 *
		 * <p><em>Warning:</em> A list's data provider cannot contain duplicate
		 * items. To display the same item in multiple item renderers, you must
		 * create separate objects with the same properties. This limitation
		 * exists because it significantly improves performance.</p>
		 *
		 * <p><em>Warning:</em> If the data provider contains display objects,
		 * concrete textures, or anything that needs to be disposed, those
		 * objects will not be automatically disposed when the list is disposed.
		 * Similar to how <code>starling.display.Image</code> cannot
		 * automatically dispose its texture because the texture may be used
		 * by other display objects, a list cannot dispose its data provider
		 * because the data provider may be used by other lists. See the
		 * <code>dispose()</code> function on <code>ListCollection</code> to
		 * see how the data provider can be disposed properly.</p>
		 *
		 * @default null
		 *
		 * @see feathers.data.ListCollection#dispose()
		 */
		public get dataProvider():ListCollection
		{
			return this._dataProvider;
		}
		
		/**
		 * @private
		 */
		public set dataProvider(value:ListCollection)
		{
			if(this._dataProvider == value)
			{
				return;
			}
			if(this._dataProvider)
			{
				this._dataProvider.removeEventListener(CollectionEventType.ADD_ITEM, this.dataProvider_addItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.REMOVE_ITEM, this.dataProvider_removeItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.REPLACE_ITEM, this.dataProvider_replaceItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.RESET, this.dataProvider_resetHandler);
				this._dataProvider.removeEventListener(Event.CHANGE, this.dataProvider_changeHandler);
			}
			this._dataProvider = value;
			if(this._dataProvider)
			{
				this._dataProvider.addEventListener(CollectionEventType.ADD_ITEM, this.dataProvider_addItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.REMOVE_ITEM, this.dataProvider_removeItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.REPLACE_ITEM, this.dataProvider_replaceItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.RESET, this.dataProvider_resetHandler);
				this._dataProvider.addEventListener(Event.CHANGE, this.dataProvider_changeHandler);
			}

			//reset the scroll position because this is a drastic change and
			//the data is probably completely different
			this.horizontalScrollPosition = 0;
			this.verticalScrollPosition = 0;

			//clear the selection for the same reason
			this.selectedIndex = -1;

			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}
		
		/**
		 * @private
		 */
		protected _isSelectable:boolean = true;
		
		/**
		 * Determines if items in the list may be selected. By default only a
		 * single item may be selected at any given time. In other words, if
		 * item A is selected, and the user selects item B, item A will be
		 * deselected automatically. Set <code>allowMultipleSelection</code>
		 * to <code>true</code> to select more than one item without
		 * automatically deselecting other items.
		 *
		 * <p>The following example disables selection:</p>
		 *
		 * <listing version="3.0">
		 * list.isSelectable = false;</listing>
		 *
		 * @default true
		 *
		 * @see #allowMultipleSelection
		 */
		public get isSelectable():boolean
		{
			return this._isSelectable;
		}
		
		/**
		 * @private
		 */
		public set isSelectable(value:boolean)
		{
			if(this._isSelectable == value)
			{
				return;
			}
			this._isSelectable = value;
			if(!this._isSelectable)
			{
				this.selectedIndex = -1;
			}
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}
		
		/**
		 * @private
		 */
		protected _selectedIndex:number = -1;
		
		/**
		 * The index of the currently selected item. Returns <code>-1</code> if
		 * no item is selected.
		 *
		 * <p>The following example selects an item by its index:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedIndex = 2;</listing>
		 *
		 * <p>The following example clears the selected index:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedIndex = -1;</listing>
		 *
		 * <p>The following example listens for when selection changes and
		 * requests the selected index:</p>
		 *
		 * <listing version="3.0">
		 * function list_changeHandler( event:Event ):void
		 * {
		 *     var list:List = List( event.currentTarget );
		 *     var index:int = list.selectedIndex;
		 *
		 * }
		 * list.addEventListener( Event.CHANGE, list_changeHandler );</listing>
		 *
		 * @default -1
		 *
		 * @see #selectedItem
		 * @see #allowMultipleSelection
		 * @see #selectedItems
		 * @see #selectedIndices
		 */
		public get selectedIndex():number
		{
			return this._selectedIndex;
		}
		
		/**
		 * @private
		 */
		public set selectedIndex(value:number)
		{
			if(this._selectedIndex == value)
			{
				return;
			}
			if(value >= 0)
			{
				this._selectedIndices.data = new Array<number>(value);
			}
			else
			{
				this._selectedIndices.removeAll();
			}
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		/**
		 * The currently selected item. Returns <code>null</code> if no item is
		 * selected.
		 *
		 * <p>The following example changes the selected item:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedItem = list.dataProvider.getItemAt(0);</listing>
		 *
		 * <p>The following example clears the selected item:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedItem = null;</listing>
		 *
		 * <p>The following example listens for when selection changes and
		 * requests the selected item:</p>
		 *
		 * <listing version="3.0">
		 * function list_changeHandler( event:Event ):void
		 * {
		 *     var list:List = List( event.currentTarget );
		 *     var item:Object = list.selectedItem;
		 *
		 * }
		 * list.addEventListener( Event.CHANGE, list_changeHandler );</listing>
		 *
		 * @default null
		 *
		 * @see #selectedIndex
		 * @see #allowMultipleSelection
		 * @see #selectedItems
		 * @see #selectedIndices
		 */
		public get selectedItem():Object
		{
			if(!this._dataProvider || this._selectedIndex < 0 || this._selectedIndex >= this._dataProvider.length)
			{
				return null;
			}

			return this._dataProvider.getItemAt(this._selectedIndex);
		}

		/**
		 * @private
		 */
		public set selectedItem(value:Object)
		{
			if(!this._dataProvider)
			{
				this.selectedIndex = -1;
				return;
			}
			this.selectedIndex = this._dataProvider.getItemIndex(value);
		}

		/**
		 * @private
		 */
		protected _allowMultipleSelection:boolean = false;

		/**
		 * If <code>true</code> multiple items may be selected at a time. If
		 * <code>false</code>, then only a single item may be selected at a
		 * time, and if the selection changes, other items are deselected. Has
		 * no effect if <code>isSelectable</code> is <code>false</code>.
		 *
		 * <p>In the following example, multiple selection is enabled:</p>
		 *
		 * <listing version="3.0">
		 * list.allowMultipleSelection = true;</listing>
		 *
		 * @default false
		 *
		 * @see #isSelectable
		 * @see #selectedIndices
		 * @see #selectedItems
		 */
		public get allowMultipleSelection():boolean
		{
			return this._allowMultipleSelection;
		}

		/**
		 * @private
		 */
		public set allowMultipleSelection(value:boolean)
		{
			if(this._allowMultipleSelection == value)
			{
				return;
			}
			this._allowMultipleSelection = value;
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		/**
		 * @private
		 */
		protected _selectedIndices:ListCollection = new ListCollection(new Array<number>());

		/**
		 * The indices of the currently selected items. Returns an empty <code>Vector.&lt;int&gt;</code>
		 * if no items are selected. If <code>allowMultipleSelection</code> is
		 * <code>false</code>, only one item may be selected at a time.
		 *
		 * <p>The following example selects two items by their indices:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedIndices = new &lt;int&gt;[ 2, 3 ];</listing>
		 *
		 * <p>The following example clears the selected indices:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedIndices = null;</listing>
		 *
		 * <p>The following example listens for when selection changes and
		 * requests the selected indices:</p>
		 *
		 * <listing version="3.0">
		 * function list_changeHandler( event:Event ):void
		 * {
		 *     var list:List = List( event.currentTarget );
		 *     var indices:Vector.&lt;int&gt; = list.selectedIndices;
		 *
		 * }
		 * list.addEventListener( Event.CHANGE, list_changeHandler );</listing>
		 *
		 * @see #allowMultipleSelection
		 * @see #selectedItems
		 * @see #selectedIndex
		 * @see #selectedItem
		 */
		public get selectedIndices():number[]
		{
			return /*this._selectedIndices.data as Vector.<int>*/;
		}

		/**
		 * @private
		 */
		public set selectedIndices(value:number[])
		{
			var oldValue:number[] = /*this._selectedIndices.data as Vector.<int>*/;
			if(oldValue == value)
			{
				return;
			}
			if(!value)
			{
				if(this._selectedIndices.length == 0)
				{
					return;
				}
				this._selectedIndices.removeAll();
			}
			else
			{
				if(!this._allowMultipleSelection && value.length > 0)
				{
					value.length = 1;
				}
				this._selectedIndices.data = value;
			}
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		/**
		 * The currently selected item. The getter returns an empty
		 * <code>Vector.&lt;Object&gt;</code> if no item is selected. If any
		 * items are selected, the getter creates a new
		 * <code>Vector.&lt;Object&gt;</code> to return a list of selected
		 * items.
		 *
		 * <p>The following example selects two items:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedItems = new &lt;Object&gt;[ list.dataProvider.getItemAt(2) , list.dataProvider.getItemAt(3) ];</listing>
		 *
		 * <p>The following example clears the selected items:</p>
		 *
		 * <listing version="3.0">
		 * list.selectedItems = null;</listing>
		 *
		 * <p>The following example listens for when selection changes and
		 * requests the selected items:</p>
		 *
		 * <listing version="3.0">
		 * function list_changeHandler( event:Event ):void
		 * {
		 *     var list:List = List( event.currentTarget );
		 *     var items:Vector.&lt;Object&gt; = list.selectedItems;
		 *
		 * }
		 * list.addEventListener( Event.CHANGE, list_changeHandler );</listing>
		 *
		 * @see #allowMultipleSelection
		 * @see #selectedIndices
		 * @see #selectedIndex
		 * @see #selectedItem
		 */
		public get selectedItems():Object[]
		{
			return this.getSelectedItems(new Array<Object>());
		}

		/**
		 * @private
		 */
		public set selectedItems(value:Object[])
		{
			if(!value || !this._dataProvider)
			{
				this.selectedIndex = -1;
				return;
			}
			var indices:number[] = new Array<number>();
			var itemCount:number = value.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:Object = value[i];
				var index:number = this._dataProvider.getItemIndex(item);
				if(index >= 0)
				{
					indices.push(index);
				}
			}
			this.selectedIndices = indices;
		}

		/**
		 * Returns the selected items, with the ability to pass in an optional
		 * result vector. Better for performance than the <code>selectedItems</code>
		 * getter because it can avoid the allocation, and possibly garbage
		 * collection, of the result object.
		 *
		 * @see #selectedItems
		 */
		public getSelectedItems(result:Object[] = null):Object[]
		{
			if(result)
			{
				result.length = 0;
			}
			else
			{
				result = new Array<Object>();
			}
			if(!this._dataProvider)
			{
				return result;
			}
			var indexCount:number = this._selectedIndices.length;
			for(var i:number = 0; i < indexCount; i++)
			{
				var index:number = <int>this._selectedIndices.getItemAt(i) ;
				var item:Object = this._dataProvider.getItemAt(index);
				result[i] = item;
			}
			return result;
		}
		
		/**
		 * @private
		 */
		protected _itemRendererType:Class = DefaultListItemRenderer;
		
		/**
		 * The class used to instantiate item renderers. Must implement the
		 * <code>IListItemRenderer</code> interface.
		 *
		 * <p>To customize properties on the item renderer, use
		 * <code>itemRendererFactory</code> instead.</p>
		 *
		 * <p>The following example changes the item renderer type:</p>
		 *
		 * <listing version="3.0">
		 * list.itemRendererType = CustomItemRendererClass;</listing>
		 *
		 * @default feathers.controls.renderers.DefaultListItemRenderer
		 *
		 * @see feathers.controls.renderers.IListItemRenderer
		 * @see #itemRendererFactory
		 */
		public get itemRendererType():Class
		{
			return this._itemRendererType;
		}
		
		/**
		 * @private
		 */
		public set itemRendererType(value:Class)
		{
			if(this._itemRendererType == value)
			{
				return;
			}
			
			this._itemRendererType = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * @private
		 */
		protected _itemRendererFactory:Function;
		
		/**
		 * A function called that is expected to return a new item renderer. Has
		 * a higher priority than <code>itemRendererType</code>. Typically, you
		 * would use an <code>itemRendererFactory</code> instead of an
		 * <code>itemRendererType</code> if you wanted to initialize some
		 * properties on each separate item renderer, such as skins.
		 *
		 * <p>The function is expected to have the following signature:</p>
		 *
		 * <pre>function():IListItemRenderer</pre>
		 *
		 * <p>The following example provides a factory for the item renderer:</p>
		 *
		 * <listing version="3.0">
		 * list.itemRendererFactory = function():IListItemRenderer
		 * {
		 *     var renderer:CustomItemRendererClass = new CustomItemRendererClass();
		 *     renderer.backgroundSkin = new Quad( 10, 10, 0xff0000 );
		 *     return renderer;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.renderers.IListItemRenderer
		 * @see #itemRendererType
		 */
		public get itemRendererFactory():Function
		{
			return this._itemRendererFactory;
		}
		
		/**
		 * @private
		 */
		public set itemRendererFactory(value:Function)
		{
			if(this._itemRendererFactory === value)
			{
				return;
			}
			
			this._itemRendererFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}
		
		/**
		 * @private
		 */
		protected _typicalItem:Object = null;
		
		/**
		 * Used to auto-size the list when a virtualized layout is used. If the
		 * list's width or height is unknown, the list will try to automatically
		 * pick an ideal size. This item is used to create a sample item
		 * renderer to measure item renderers that are virtual and not visible
		 * in the viewport.
		 *
		 * <p>The following example provides a typical item:</p>
		 *
		 * <listing version="3.0">
		 * list.typicalItem = { text: "A typical item", thumbnail: texture };
		 * list.itemRendererProperties.labelField = "text";
		 * list.itemRendererProperties.iconSourceField = "thumbnail";</listing>
		 *
		 * @default null
		 */
		public get typicalItem():Object
		{
			return this._typicalItem;
		}
		
		/**
		 * @private
		 */
		public set typicalItem(value:Object)
		{
			if(this._typicalItem == value)
			{
				return;
			}
			this._typicalItem = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _customItemRendererStyleName:string;

		/**
		 * A style name to add to all item renderers in this list. Typically
		 * used by a theme to provide different skins to different lists.
		 *
		 * <p>The following example sets the item renderer name:</p>
		 *
		 * <listing version="3.0">
		 * list.customItemRendererStyleName = "my-custom-item-renderer";</listing>
		 *
		 * <p>In your theme, you can target this sub-component name to provide
		 * different skins than the default style:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( DefaultListItemRenderer ).setFunctionForStyleName( "my-custom-item-renderer", setCustomItemRendererStyles );</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public get customItemRendererStyleName():string
		{
			return this._customItemRendererStyleName;
		}

		/**
		 * @private
		 */
		public set customItemRendererStyleName(value:string)
		{
			if(this._customItemRendererStyleName == value)
			{
				return;
			}
			this._customItemRendererStyleName = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * DEPRECATED: Replaced by <code>customItemRendererStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customItemRendererStyleName
		 */
		public get itemRendererName():string
		{
			return this.customItemRendererStyleName;
		}

		/**
		 * @private
		 */
		public set itemRendererName(value:string)
		{
			this.customItemRendererStyleName = value;
		}

		/**
		 * @private
		 */
		protected _itemRendererProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to all of the list's item
		 * renderers. These values are shared by each item renderer, so values
		 * that cannot be shared (such as display objects that need to be added
		 * to the display list) should be passed to the item renderers using an
		 * <code>itemRendererFactory</code> or with a theme. The item renderers
		 * are instances of <code>IListItemRenderer</code>. The available
		 * properties depend on which <code>IListItemRenderer</code>
		 * implementation is returned by <code>itemRendererFactory</code>.
		 *
		 * <p>The following example customizes some item renderer properties
		 * (this example assumes that the item renderer's label text renderer
		 * is a <code>BitmapFontTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * list.itemRendererProperties.&#64;defaultLabelProperties.textFormat = new BitmapFontTextFormat( bitmapFont );
		 * list.itemRendererProperties.padding = 20;</listing>
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>itemRendererFactory</code> function
		 * instead of using <code>itemRendererProperties</code> will result in
		 * better performance.</p>
		 *
		 * @default null
		 *
		 * @see #itemRendererFactory
		 * @see feathers.controls.renderers.IListItemRenderer
		 * @see feathers.controls.renderers.DefaultListItemRenderer
		 */
		public get itemRendererProperties():Object
		{
			if(!this._itemRendererProperties)
			{
				this._itemRendererProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._itemRendererProperties;
		}

		/**
		 * @private
		 */
		public set itemRendererProperties(value:Object)
		{
			if(this._itemRendererProperties == value)
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
			if(this._itemRendererProperties)
			{
				this._itemRendererProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._itemRendererProperties = PropertyProxy(value);
			if(this._itemRendererProperties)
			{
				this._itemRendererProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _keyScrollDuration:number = 0.25;

		/**
		 * The duration, in seconds, of the animation when the selected item is
		 * changed by keyboard navigation and the item scrolls into view.
		 *
		 * <p>In the following example, the duration of the animation that
		 * scrolls the list to a new selected item is set to 500 milliseconds:</p>
		 *
		 * <listing version="3.0">
		 * list.keyScrollDuration = 0.5;</listing>
		 *
		 * @default 0.25
		 */
		public get keyScrollDuration():number
		{
			return this._keyScrollDuration;
		}

		/**
		 * @private
		 */
		public set keyScrollDuration(value:number)
		{
			this._keyScrollDuration = value;
		}

		/**
		 * The pending item index to scroll to after validating. A value of
		 * <code>-1</code> means that the scroller won't scroll to an item after
		 * validating.
		 */
		protected pendingItemIndex:number = -1;

		/**
		 * @private
		 */
		/*override*/ public scrollToPosition(horizontalScrollPosition:number, verticalScrollPosition:number, animationDuration:number = NaN):void
		{
			this.pendingItemIndex = -1;
			super.scrollToPosition(horizontalScrollPosition, verticalScrollPosition, animationDuration);
		}

		/**
		 * @private
		 */
		/*override*/ public scrollToPageIndex(horizontalPageIndex:number, verticalPageIndex:number, animationDuration:number = NaN):void
		{
			this.pendingItemIndex = -1;
			super.scrollToPageIndex(horizontalPageIndex, verticalPageIndex, animationDuration);
		}
		
		/**
		 * Scrolls the list so that the specified item is visible. If
		 * <code>animationDuration</code> is greater than zero, the scroll will
		 * animate. The duration is in seconds.
		 *
		 * <p>If the layout is virtual with variable item dimensions, this
		 * function may not accurately scroll to the exact correct position. A
		 * virtual layout with variable item dimensions is often forced to
		 * estimate positions, so the results aren't guaranteed to be accurate.</p>
		 *
		 * <p>If you want to scroll to the end of the list, it is better to use
		 * <code>scrollToPosition()</code> with <code>maxHorizontalScrollPosition</code>
		 * or <code>maxVerticalScrollPosition</code>.</p>
		 *
		 * <p>In the following example, the list is scrolled to display index 10:</p>
		 *
		 * <listing version="3.0">
		 * list.scrollToDisplayIndex( 10 );</listing>
		 * 
		 * @param index The integer index of an item from the data provider.
		 * @param animationDuration The length of time, in seconds, of the animation. May be zero to scroll instantly.
		 *
		 * @see #scrollToPosition()
		 */
		public scrollToDisplayIndex(index:number, animationDuration:number = 0):void
		{
			//cancel any pending scroll to a different page or scroll position.
			//we can have only one type of pending scroll at a time.
			this.hasPendingHorizontalPageIndex = false;
			this.hasPendingVerticalPageIndex = false;
			this.pendingHorizontalScrollPosition = NaN;
			this.pendingVerticalScrollPosition = NaN;
			if(this.pendingItemIndex == index &&
				this.pendingScrollDuration == animationDuration)
			{
				return;
			}
			this.pendingItemIndex = index;
			this.pendingScrollDuration = animationDuration;
			this.invalidate(this.INVALIDATION_FLAG_PENDING_SCROLL);
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			//clearing selection now so that the data provider setter won't
			//cause a selection change that triggers events.
			this._selectedIndices.removeEventListeners();
			this._selectedIndex = -1;
			this.dataProvider = null;
			this.layout = null;
			super.dispose();
		}
		
		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			var hasLayout:boolean = this._layout != null;

			super.initialize();
			
			if(!this.dataViewPort)
			{
				this.viewPort = this.dataViewPort = new ListDataViewPort();
				this.dataViewPort.owner = this;
				this.viewPort = this.dataViewPort;
			}

			if(!hasLayout)
			{
				if(this._hasElasticEdges &&
					this._verticalScrollPolicy == List.SCROLL_POLICY_AUTO &&
					this._scrollBarDisplayMode != List.SCROLL_BAR_DISPLAY_MODE_FIXED)
				{
					//so that the elastic edges work even when the max scroll
					//position is 0, similar to iOS.
					this.verticalScrollPolicy = List.SCROLL_POLICY_ON;
				}

				var layout:VerticalLayout = new VerticalLayout();
				layout.useVirtualLayout = true;
				layout.padding = 0;
				layout.gap = 0;
				layout.horizontalAlign = VerticalLayout.HORIZONTAL_ALIGN_JUSTIFY;
				layout.verticalAlign = VerticalLayout.VERTICAL_ALIGN_TOP;
				this.layout = layout;
			}
		}
		
		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			this.refreshDataViewPortProperties();
			super.draw();
		}

		/**
		 * @private
		 */
		protected refreshDataViewPortProperties():void
		{
			this.dataViewPort.isSelectable = this._isSelectable;
			this.dataViewPort.allowMultipleSelection = this._allowMultipleSelection;
			this.dataViewPort.selectedIndices = this._selectedIndices;
			this.dataViewPort.dataProvider = this._dataProvider;
			this.dataViewPort.itemRendererType = this._itemRendererType;
			this.dataViewPort.itemRendererFactory = this._itemRendererFactory;
			this.dataViewPort.itemRendererProperties = this._itemRendererProperties;
			this.dataViewPort.customItemRendererStyleName = this._customItemRendererStyleName;
			this.dataViewPort.typicalItem = this._typicalItem;
			this.dataViewPort.layout = this._layout;
		}

		/**
		 * @private
		 */
		/*override*/ protected handlePendingScroll():void
		{
			if(this.pendingItemIndex >= 0)
			{
				var item:Object = this._dataProvider.getItemAt(this.pendingItemIndex);
				if(item instanceof Object)
				{
					this.dataViewPort.getScrollPositionForIndex(this.pendingItemIndex, List.HELPER_POINT);
					this.pendingItemIndex = -1;

					var targetHorizontalScrollPosition:number = List.HELPER_POINT.x;
					if(targetHorizontalScrollPosition < this._minHorizontalScrollPosition)
					{
						targetHorizontalScrollPosition = this._minHorizontalScrollPosition;
					}
					else if(targetHorizontalScrollPosition > this._maxHorizontalScrollPosition)
					{
						targetHorizontalScrollPosition = this._maxHorizontalScrollPosition;
					}
					var targetVerticalScrollPosition:number = List.HELPER_POINT.y;
					if(targetVerticalScrollPosition < this._minVerticalScrollPosition)
					{
						targetVerticalScrollPosition = this._minVerticalScrollPosition;
					}
					else if(targetVerticalScrollPosition > this._maxVerticalScrollPosition)
					{
						targetVerticalScrollPosition = this._maxVerticalScrollPosition;
					}
					this.throwTo(targetHorizontalScrollPosition, targetVerticalScrollPosition, this.pendingScrollDuration);
				}
			}
			super.handlePendingScroll();
		}

		/**
		 * @private
		 */
		/*override*/ protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(!this._dataProvider)
			{
				return;
			}
			var changedSelection:boolean = false;
			if(event.keyCode == Keyboard.HOME)
			{
				if(this._dataProvider.length > 0)
				{
					this.selectedIndex = 0;
					changedSelection = true;
				}
			}
			else if(event.keyCode == Keyboard.END)
			{
				this.selectedIndex = this._dataProvider.length - 1;
				changedSelection = true;
			}
			else if(event.keyCode == Keyboard.UP)
			{
				this.selectedIndex = Math.max(0, this._selectedIndex - 1);
				changedSelection = true;
			}
			else if(event.keyCode == Keyboard.DOWN)
			{
				this.selectedIndex = Math.min(this._dataProvider.length - 1, this._selectedIndex + 1);
				changedSelection = true;
			}
			if(changedSelection)
			{
				this.dataViewPort.getNearestScrollPositionForIndex(this.selectedIndex, List.HELPER_POINT);
				this.scrollToPosition(List.HELPER_POINT.x, List.HELPER_POINT.y, this._keyScrollDuration);
			}
		}

		/**
		 * @private
		 */
		protected dataProvider_changeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected dataProvider_resetHandler(event:Event):void
		{
			this.horizontalScrollPosition = 0;
			this.verticalScrollPosition = 0;

			//the entire data provider was replaced. select no item.
			this._selectedIndices.removeAll();
		}

		/**
		 * @private
		 */
		protected dataProvider_addItemHandler(event:Event, index:number):void
		{
			if(this._selectedIndex == -1)
			{
				return;
			}
			var selectionChanged:boolean = false;
			var newIndices:number[] = new Array<number>();
			var indexCount:number = this._selectedIndices.length;
			for(var i:number = 0; i < indexCount; i++)
			{
				var currentIndex:number = <int>this._selectedIndices.getItemAt(i) ;
				if(currentIndex >= index)
				{
					currentIndex++;
					selectionChanged = true;
				}
				newIndices.push(currentIndex);
			}
			if(selectionChanged)
			{
				this._selectedIndices.data = newIndices;
			}
		}

		/**
		 * @private
		 */
		protected dataProvider_removeItemHandler(event:Event, index:number):void
		{
			if(this._selectedIndex == -1)
			{
				return;
			}
			var selectionChanged:boolean = false;
			var newIndices:number[] = new Array<number>();
			var indexCount:number = this._selectedIndices.length;
			for(var i:number = 0; i < indexCount; i++)
			{
				var currentIndex:number = <int>this._selectedIndices.getItemAt(i) ;
				if(currentIndex == index)
				{
					selectionChanged = true;
				}
				else
				{
					if(currentIndex > index)
					{
						currentIndex--;
						selectionChanged = true;
					}
					newIndices.push(currentIndex);
				}
			}
			if(selectionChanged)
			{
				this._selectedIndices.data = newIndices;
			}
		}

		/**
		 * @private
		 */
		protected dataProvider_replaceItemHandler(event:Event, index:number):void
		{
			if(this._selectedIndex == -1)
			{
				return;
			}
			var indexOfIndex:number = this._selectedIndices.getItemIndex(index);
			if(indexOfIndex >= 0)
			{
				this._selectedIndices.removeItemAt(indexOfIndex);
			}
		}
		
		/**
		 * @private
		 */
		protected selectedIndices_changeHandler(event:Event):void
		{
			if(this._selectedIndices.length > 0)
			{
				this._selectedIndex = <int>this._selectedIndices.getItemAt(0) ;
			}
			else
			{
				if(this._selectedIndex < 0)
				{
					//no change
					return;
				}
				this._selectedIndex = -1;
			}
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		private layout_scrollHandler(event:Event, scrollOffset:Point):void
		{
			var layout:IVariableVirtualLayout = IVariableVirtualLayout(this._layout);
			if(!this.isScrolling || !layout.useVirtualLayout || !layout.hasVariableItemDimensions)
			{
				return;
			}

			var scrollOffsetX:number = scrollOffset.x;
			this._startHorizontalScrollPosition += scrollOffsetX;
			this._horizontalScrollPosition += scrollOffsetX;
			if(this._horizontalAutoScrollTween)
			{
				this._targetHorizontalScrollPosition += scrollOffsetX;
				this.throwTo(this._targetHorizontalScrollPosition, NaN, this._horizontalAutoScrollTween.totalTime - this._horizontalAutoScrollTween.currentTime);
			}

			var scrollOffsetY:number = scrollOffset.y;
			this._startVerticalScrollPosition += scrollOffsetY;
			this._verticalScrollPosition += scrollOffsetY;
			if(this._verticalAutoScrollTween)
			{
				this._targetVerticalScrollPosition += scrollOffsetY;
				this.throwTo(NaN, this._targetVerticalScrollPosition, this._verticalAutoScrollTween.totalTime - this._verticalAutoScrollTween.currentTime);
			}
		}
	}
}