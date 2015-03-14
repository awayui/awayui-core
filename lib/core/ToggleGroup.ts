/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import IllegalOperationError = flash.errors.IllegalOperationError;

	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;

	/**
	 * Dispatched when the selection changes.
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
	 * Controls the selection of two or more IToggle instances where only one
	 * may be selected at a time.
	 * 
	 * @see IToggle
	 */
	export class ToggleGroup extends EventDispatcher
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * @private
		 */
		protected _items:IToggle[] = new IToggle[];

		/**
		 * @private
		 */
		protected _ignoreChanges:boolean = false;

		/**
		 * @private
		 */
		protected _isSelectionRequired:boolean = true;

		/**
		 * Determines if the user can deselect the currently selected item or
		 * not. The selection may always be cleared programmatically by setting
		 * the selected index to <code>-1</code> or the selected item to
		 * <code>null</code>.
		 *
		 * <p>If <code>isSelectionRequired</code> is set to <code>true</code>
		 * and the toggle group has items that were added previously, and there
		 * is no currently selected item, the item at index <code>0</code> will
		 * be selected automatically.</p>
		 *
		 * <p>In the following example, selection is not required:</p>
		 *
		 * <listing version="3.0">
		 * group.isSelectionRequired = false;</listing>
		 *
		 * @default true
		 */
		public get isSelectionRequired():boolean
		{
			return this._isSelectionRequired;
		}

		/**
		 * @private
		 */
		public set isSelectionRequired(value:boolean)
		{
			if(this._isSelectionRequired == value)
			{
				return;
			}
			this._isSelectionRequired = value;
			if(this._isSelectionRequired && this._selectedIndex < 0 && this._items.length > 0)
			{
				this.selectedIndex = 0;
			}
		}
		
		/**
		 * The currently selected toggle.
		 *
		 * <p>In the following example, the selected item is changed:</p>
		 *
		 * <listing version="3.0">
		 * group.selectedItem = radio;</listing>
		 *
		 * @default null
		 */
		public get selectedItem():IToggle
		{
			if(this._selectedIndex < 0)
			{
				return null;
			}
			return this._items[this._selectedIndex];
		}
		
		/**
		 * @private
		 */
		public set selectedItem(value:IToggle)
		{
			this.selectedIndex = this._items.indexOf(value);
		}
		
		/**
		 * @private
		 */
		protected _selectedIndex:number = -1;
		
		/**
		 * The index of the currently selected toggle.
		 *
		 * <p>In the following example, the selected index is changed:</p>
		 *
		 * <listing version="3.0">
		 * group.selectedIndex = 2;</listing>
		 *
		 * @default -1
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
			var itemCount:number = this._items.length;
			if(value < -1 || value >= itemCount)
			{
				throw new RangeError("Index " + value + " is out of range " + itemCount + " for ToggleGroup.");
			}
			var hasChanged:boolean = this._selectedIndex != value;
			this._selectedIndex = value;

			//refresh all the items
			this._ignoreChanges = true;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:IToggle = this._items[i];
				item.isSelected = i == value;
			}
			this._ignoreChanges = false;
			if(hasChanged)
			{
				//only dispatch if there's been a change. we didn't return
				//early because this setter could be called if an item is
				//unselected. if selection is required, we need to reselect the
				//item (happens below in the item's onChange listener).
				this.dispatchEventWith(Event.CHANGE);
			}
		}
		
		/**
		 * Adds a toggle to the group. If it is the first item added to the
		 * group, and <code>isSelectionRequired</code> is <code>true</code>, it
		 * will be selected automatically.
		 *
		 * <p>In the following example, an item is added to the toggle group:</p>
		 *
		 * <listing version="3.0">
		 * group.addItem( radio );</listing>
		 */
		public addItem(item:IToggle):void
		{
			if(!item)
			{
				throw new ArgumentError("IToggle passed to ToggleGroup addItem() must not be null.");
			}
			
			var index:number = this._items.indexOf(item);
			if(index >= 0)
			{
				throw new IllegalOperationError("Cannot add an item to a ToggleGroup more than once.");
			}
			this._items.push(item);
			if(this._selectedIndex < 0 && this._isSelectionRequired)
			{
				this.selectedItem = item;
			}
			else
			{
				item.isSelected = false;
			}
			item.addEventListener(Event.CHANGE, this.item_changeHandler);

			if(item instanceof this.IGroupedToggle)
			{
				this.IGroupedToggle(item).toggleGroup = this;
			}
		}
		
		/**
		 * Removes a toggle from the group. If the item being removed is
		 * selected and <code>isSelectionRequired</code> is <code>true</code>,
		 * the final item will be selected. If <code>isSelectionRequired</code>
		 * is <code>false</code> instead, no item will be selected.
		 *
		 * <p>In the following example, an item is removed from the toggle group:</p>
		 *
		 * <listing version="3.0">
		 * group.removeItem( radio );</listing>
		 */
		public removeItem(item:IToggle):void
		{
			var index:number = this._items.indexOf(item);
			if(index < 0)
			{
				return;
			}
			this._items.splice(index, 1);
			item.removeEventListener(Event.CHANGE, this.item_changeHandler);
			if(item instanceof this.IGroupedToggle)
			{
				this.IGroupedToggle(item).toggleGroup = null;
			}
			if(this._selectedIndex > index)
			{
				//the same item is selected, but its index has changed.
				this.selectedIndex -= 1;
			}
			else if(this._selectedIndex == index)
			{
				if(this._isSelectionRequired)
				{
					var maxSelectedIndex:number = this._items.length - 1;
					if(this._selectedIndex > maxSelectedIndex)
					{
						//we want to keep the same index, if possible, but if
						//we can't because it is too high, we should select the
						//next highest item.
						this.selectedIndex = maxSelectedIndex;
					}
					else
					{
						//we need to manually dispatch the change event because
						//the selected index hasn't changed, but the selected
						//item has changed.
						this.dispatchEventWith(Event.CHANGE);
					}
				}
				else
				{
					//selection isn't required, and we just removed the selected
					//item, so no item should be selected.
					this.selectedIndex = -1;
				}
			}
		}

		/**
		 * Removes all toggles from the group. No item will be selected.
		 *
		 * <p>In the following example, all items are removed from the toggle group:</p>
		 *
		 * <listing version="3.0">
		 * group.removeAllItems();</listing>
		 */
		public removeAllItems():void
		{
			var itemCount:number = this._items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:IToggle = this._items.shift();
				item.removeEventListener(Event.CHANGE, this.item_changeHandler);
				if(item instanceof this.IGroupedToggle)
				{
					this.IGroupedToggle(item).toggleGroup = null;
				}
			}
			this.selectedIndex = -1;
		}

		/**
		 * Determines if the group includes the specified item.
		 *
		 * <p>In the following example, we check if an item is in the toggle group:</p>
		 *
		 * <listing version="3.0">
		 * if( group.hasItem( radio ) )
		 * {
		 *     // do something
		 * }</listing>
		 */
		public hasItem(item:IToggle):boolean
		{
			var index:number = this._items.indexOf(item);
			return index >= 0;
		}

		/**
		 * Returns the index of the specified item. Result will be <code>-1</code>
		 * if the item has not been added to the group.
		 *
		 * <p>In the following example, an item's index is calculated:</p>
		 *
		 * <listing version="3.0">
		 * var index:int = group.getItemIndex( radio );</listing>
		 */
		public getItemIndex(item:IToggle):number
		{
			return this._items.indexOf(item);
		}

		/**
		 * Changes the index of a specified item. Throws an <code>ArgumentError</code>
		 * if the specified item hasn't already been added to this group.
		 *
		 * <p>In the following example, an item's index is changed:</p>
		 *
		 * <listing version="3.0">
		 * group.setItemIndex( radio, 2 );</listing>
		 */
		public setItemIndex(item:IToggle, index:number):void
		{
			var oldIndex:number = this._items.indexOf(item);
			if(oldIndex < 0)
			{
				throw new ArgumentError("Attempting to set index of an item that has not been added to this ToggleGroup.");
			}
			if(oldIndex == index)
			{
				//no change needed
				return;
			}
			this._items.splice(oldIndex, 1);
			this._items.splice(index, 0, item);
			if(this._selectedIndex >= 0)
			{
				if(this._selectedIndex == oldIndex)
				{
					this.selectedIndex = index;
				}
				else if(oldIndex < this._selectedIndex && index > this._selectedIndex)
				{
					this.selectedIndex--;
				}
				else if(oldIndex > this._selectedIndex && index < this._selectedIndex)
				{
					this.selectedIndex++;
				}
			}
		}
		
		/**
		 * @private
		 */
		protected item_changeHandler(event:Event):void
		{
			if(this._ignoreChanges)
			{
				return;
			}

			var item:IToggle = this.IToggle(event.currentTarget);
			var index:number = this._items.indexOf(item);
			if(item.isSelected || (this._isSelectionRequired && this._selectedIndex == index))
			{
				//don't let it deselect the item
				this.selectedIndex = index;
			}
			else if(!item.isSelected)
			{
				this.selectedIndex = -1;
			}
		}
		
	}
}