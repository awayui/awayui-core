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
	 * An <code>IListCollectionDataDescriptor</code> implementation for Arrays.
	 * 
	 * @see ListCollection
	 * @see IListCollectionDataDescriptor
	 */
	export class ArrayListCollectionDataDescriptor implements IListCollectionDataDescriptor
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
			return (<Array>data ).length;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (<Array>data )[index];
		}
		
		/**
		 * @inheritDoc
		 */
		public setItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(<Array>data )[index] = item;
		}
		
		/**
		 * @inheritDoc
		 */
		public addItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(<Array>data ).splice(index, 0, item);
		}
		
		/**
		 * @inheritDoc
		 */
		public removeItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (<Array>data ).splice(index, 1)[0];
		}

		/**
		 * @inheritDoc
		 */
		public removeAll(data:Object):void
		{
			this.checkForCorrectDataType(data);
			(<Array>data ).length = 0;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemIndex(data:Object, item:Object):number
		{
			this.checkForCorrectDataType(data);
			return (<Array>data ).indexOf(item);
		}
		
		/**
		 * @private
		 */
		protected checkForCorrectDataType(data:Object):void
		{
			if(!(data instanceof Array))
			{
				throw new IllegalOperationError("Expected Array. Received " + Object(data).constructor + " instead.");
			}
		}
	}
}