/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;

	/**
	 * Dispatched when a token is added, removed, or toggled or if all tokens
	 * have been replaced by setting the <code>value</code> property.
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
	 * A list of space-delimited tokens. Obviously, since they are delimited by
	 * spaces, tokens cannot contain spaces.
	 */
	export class TokenList extends EventDispatcher
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * @private
		 * Storage for the tokens.
		 */
		protected names:string[] = new Array<string>();

		/**
		 * The tokens formatted with space delimiters.
		 *
		 * @default ""
		 */
		public get value():string
		{
			return this.names.join(" ");
		}

		/**
		 * @private
		 */
		public set value(value:string)
		{
			if(this.value == value)
			{
				return;
			}
			this.names.length = 0;
			this.names = (<string[]>value.split(" "));
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * The number of tokens in the list.
		 */
		public get length():number
		{
			return this.names.length;
		}

		/**
		 * Returns the token at the specified index, or null, if there is no
		 * token at that index.
		 */
		public item(index:number):string
		{
			if(index < 0 || index >= this.names.length)
			{
				return null;
			}
			return this.names[index];
		}

		/**
		 * Adds a token to the list. If the token already appears in the list,
		 * it will not be added again.
		 */
		public add(name:string):void
		{
			var index:number = this.names.indexOf(name);
			if(index >= 0)
			{
				return;
			}
			this.names[this.names.length] = name;
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * Removes a token from the list, if the token is in the list. If the
		 * token doesn't appear in the list, this call does nothing.
		 */
		public remove(name:string):void
		{
			var index:number = this.names.indexOf(name);
			this.removeAt(index);
		}

		/**
		 * The token is added to the list if it doesn't appear in the list, or
		 * it is removed from the list if it is already in the list.
		 */
		public toggle(name:string):void
		{
			var index:number = this.names.indexOf(name);
			if(index < 0)
			{
				this.names[this.names.length] = name;
				this.dispatchEventWith(Event.CHANGE);
			}
			else
			{
				this.removeAt(index);
			}
		}

		/**
		 * Determines if the specified token is in the list.
		 */
		public contains(name:string):boolean
		{
			return this.names.indexOf(name) >= 0;
		}

		/**
		 * @private
		 */
		protected removeAt(index:number):void
		{
			if(index < 0)
			{
				return;
			}
			if(index == 0)
			{
				this.names.shift();
				this.dispatchEventWith(Event.CHANGE);
				return;
			}
			var lastIndex:number = this.names.length - 1;
			if(index == lastIndex)
			{
				this.names.pop();
				this.dispatchEventWith(Event.CHANGE);
				return;
			}
			this.names.splice(index,  1);
			this.dispatchEventWith(Event.CHANGE);
		}

	}
}
