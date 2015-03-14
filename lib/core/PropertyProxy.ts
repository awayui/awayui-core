/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import Proxy = flash.utils.Proxy;
	import flash_proxy = flash.utils.flash_proxy;

	/**
	 * Detects when its own properties have changed and dispatches an event
	 * to notify listeners.
	 *
	 * <p>Supports nested <code>PropertyProxy</code> instances using attribute
	 * <code>&#64;</code> notation. Placing an <code>&#64;</code> before a property name
	 * is like saying, "If this nested <code>PropertyProxy</code> doesn't exist
	 * yet, create one. If it does, use the existing one."</p>
	 */
	export class PropertyProxy extends Proxy
	{
		/**
		 * Creates a <code>PropertyProxy</code> from a regular old <code>Object</code>.
		 */
		public static fromObject(source:Object, onChangeCallback:Function = null):PropertyProxy
		{
			var newValue:PropertyProxy = new PropertyProxy(onChangeCallback);
			for(var propertyName:string in source)
			{
				newValue[propertyName] = source[propertyName];
			}
			return newValue;
		}

		/**
		 * Constructor.
		 */
		constructor(onChangeCallback:Function = null)
		{
			if(onChangeCallback != null)
			{
				this._onChangeCallbacks[this._onChangeCallbacks.length] = onChangeCallback;
			}
		}

		/**
		 * @private
		 */
		private _subProxyName:string;

		/**
		 * @private
		 */
		private _onChangeCallbacks:Function[] = new Array<Function>();

		/**
		 * @private
		 */
		private _names:any[] = [];

		/**
		 * @private
		 */
		private _storage:Object = {};

		/**
		 * @private
		 */
		/*override*/ /*flash_proxy*/ hasProperty(name:any):boolean
		{
			return this._storage.hasOwnProperty(name);
		}

		/**
		 * @private
		 */
		/*override*/ /*flash_proxy*/ getProperty(name:any):any
		{
			if(this.flash_proxy::isAttribute(name))
			{
				var nameAsString:string = name instanceof QName ? QName(name).localName : name.toString();
				if(!this._storage.hasOwnProperty(nameAsString))
				{
					var subProxy:PropertyProxy = new PropertyProxy(this.subProxy_onChange);
					subProxy._subProxyName = nameAsString;
					this._storage[nameAsString] = subProxy;
					this._names[this._names.length] = nameAsString;
					this.fireOnChangeCallback(nameAsString);
				}
				return this._storage[nameAsString];
			}
			return this._storage[name];
		}

		/**
		 * @private
		 */
		/*override*/ /*flash_proxy*/ setProperty(name:any, value:any):void
		{
			var nameAsString:string = name instanceof QName ? QName(name).localName : name.toString();
			this._storage[nameAsString] = value;
			if(this._names.indexOf(nameAsString) < 0)
			{
				this._names[this._names.length] = nameAsString;
			}
			this.fireOnChangeCallback(nameAsString);
		}

		/**
		 * @private
		 */
		/*override*/ /*flash_proxy*/ deleteProperty(name:any):boolean
		{
			var nameAsString:string = name instanceof QName ? QName(name).localName : name.toString();
			var index:number = this._names.indexOf(nameAsString);
			if(index == 0)
			{
				this._names.shift();
			}
			else
			{
				var lastIndex:number = this._names.length - 1;
				if(index == lastIndex)
				{
					this._names.pop();
				}
				else
				{
					this._names.splice(index, 1);
				}
			}
			var result:boolean = delete this._storage[nameAsString];
			if(result)
			{
				this.fireOnChangeCallback(nameAsString);
			}
			return result;
		}

		/**
		 * @private
		 */
		/*override*/ /*flash_proxy*/ nextNameIndex(index:number):number
		{
			if(index < this._names.length)
			{
				return index + 1;
			}
			return 0;
		}

		/**
		 * @private
		 */
		/*override*/ /*flash_proxy*/ nextName(index:number):string
		{
			return this._names[index - 1];
		}

		/**
		 * @private
		 */
		/*override*/ /*flash_proxy*/ nextValue(index:number):any
		{
			var name:any = this._names[index - 1];
			return this._storage[name];
		}

		/**
		 * Adds a callback to react to property changes.
		 */
		public addOnChangeCallback(callback:Function):void
		{
			this._onChangeCallbacks[this._onChangeCallbacks.length] = callback;
		}

		/**
		 * Removes a callback.
		 */
		public removeOnChangeCallback(callback:Function):void
		{
			var index:number = this._onChangeCallbacks.indexOf(callback);
			if(index < 0)
			{
				return;
			}
			if(index == 0)
			{
				this._onChangeCallbacks.shift();
				return;
			}
			var lastIndex:number = this._onChangeCallbacks.length - 1;
			if(index == lastIndex)
			{
				this._onChangeCallbacks.pop();
				return;
			}
			this._onChangeCallbacks.splice(index, 1);
		}

		/**
		 * @private
		 */
		public toString():string
		{
			var result:string = "[object PropertyProxy";
			for(var propertyName:string in this)
			{
				result += " " + propertyName;
			}
			return result + "]"
		}

		/**
		 * @private
		 */
		private fireOnChangeCallback(forName:string):void
		{
			var callbackCount:number = this._onChangeCallbacks.length;
			for(var i:number = 0; i < callbackCount; i++)
			{
				var callback:Function = <Function>this._onChangeCallbacks[i] ;
				callback(this, forName);
			}
		}

		/**
		 * @private
		 */
		private subProxy_onChange(proxy:PropertyProxy, name:string):void
		{
			this.fireOnChangeCallback(proxy._subProxyName);
		}
	}
}
