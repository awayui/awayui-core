/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.data
{
	import IllegalOperationError = flash.errors.IllegalOperationError;

	/**
	 * An <code>IListCollectionDataDescriptor</code> implementation for
	 * XMLLists. Has some limitations due to certain things that cannot be done
	 * to XMLLists.
	 * 
	 * @see ListCollection
	 * @see IListCollectionDataDescriptor
	 */
	export class XMLListListCollectionDataDescriptor implements IListCollectionDataDescriptor
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
		}
		
		/**
		 * @inheritDoc
		 */
		public getLength(data:Object):number
		{
			this.checkForCorrectDataType(data);
			return (<XMLList>data ).length();
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return data[index];
		}
		
		/**
		 * @inheritDoc
		 */
		public setItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			data[index] = XML(item);
		}
		
		/**
		 * @inheritDoc
		 */
		public addItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			
			//wow, this is weird. unless I have failed epicly, I can find no 
			//other way to insert an element into an XMLList at a specific index.
			var dataClone:XMLList = (<XMLList>data ).copy();
			data[index] = item;
			var listLength:number = dataClone.length();
			for(var i:number = index; i < listLength; i++)
			{
				data[i + 1] = dataClone[i];
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public removeItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			var item:XML = data[index];
			delete data[index];
			return item;
		}

		/**
		 * @inheritDoc
		 */
		public removeAll(data:Object):void
		{
			this.checkForCorrectDataType(data);
			var list:XMLList = <XMLList>data ;
			var listLength:number = list.length();
			for(var i:number = 0; i < listLength; i++)
			{
				delete data[0];
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemIndex(data:Object, item:Object):number
		{
			this.checkForCorrectDataType(data);
			var list:XMLList = <XMLList>data ;
			var listLength:number = list.length();
			for(var i:number = 0; i < listLength; i++)
			{
				var currentItem:XML = list[i];
				if(currentItem == item)
				{
					return i;
				}
			}
			return -1;
		}
		
		/**
		 * @private
		 */
		protected checkForCorrectDataType(data:Object):void
		{
			if(!(data instanceof XMLList))
			{
				throw new IllegalOperationError("Expected XMLList. Received " + Object(data).constructor + " instead.");
			}
		}
	}
}