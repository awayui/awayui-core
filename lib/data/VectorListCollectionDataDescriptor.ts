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
	 * An <code>IListCollectionDataDescriptor</code> implementation for Vectors.
	 * 
	 * @see ListCollection
	 * @see IListCollectionDataDescriptor
	 */
	export class VectorListCollectionDataDescriptor implements IListCollectionDataDescriptor
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
			return (/*data as Vector.<*>*/).length;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<*>*/)[index];
		}
		
		/**
		 * @inheritDoc
		 */
		public setItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<*>*/)[index] = item;
		}
		
		/**
		 * @inheritDoc
		 */
		public addItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<*>*/).splice(index, 0, item);
		}
		
		/**
		 * @inheritDoc
		 */
		public removeItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<*>*/).splice(index, 1)[0];
		}

		/**
		 * @inheritDoc
		 */
		public removeAll(data:Object):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<*>*/).length = 0;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemIndex(data:Object, item:Object):number
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<*>*/).indexOf(item);
		}
		
		/**
		 * @private
		 */
		protected checkForCorrectDataType(data:Object):void
		{
			if(!(data instanceof any[]))
			{
				throw new IllegalOperationError("Expected Vector. Received " + Object(data).constructor + " instead.");
			}
		}
	}
}