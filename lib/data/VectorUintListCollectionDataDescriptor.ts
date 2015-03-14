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
	 * An <code>IListCollectionDataDescriptor</code> implementation for Vector.&lt;uint&gt;.
	 * 
	 * @see ListCollection
	 * @see IListCollectionDataDescriptor
	 */
	export class VectorUintListCollectionDataDescriptor implements IListCollectionDataDescriptor
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
			return (/*data as Vector.<uint>*/).length;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<uint>*/)[index];
		}
		
		/**
		 * @inheritDoc
		 */
		public setItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<uint>*/)[index] = <uint>item ;
		}
		
		/**
		 * @inheritDoc
		 */
		public addItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<uint>*/).splice(index, 0, <uint>item );
		}
		
		/**
		 * @inheritDoc
		 */
		public removeItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<uint>*/).splice(index, 1)[0];
		}

		/**
		 * @inheritDoc
		 */
		public removeAll(data:Object):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<uint>*/).length = 0;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemIndex(data:Object, item:Object):number
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<uint>*/).indexOf(<uint>item );
		}
		
		/**
		 * @private
		 */
		protected checkForCorrectDataType(data:Object):void
		{
			if(!(data instanceof number[]))
			{
				throw new IllegalOperationError("Expected Vector.<uint>. Received " + Object(data).constructor + " instead.");
			}
		}
	}
}