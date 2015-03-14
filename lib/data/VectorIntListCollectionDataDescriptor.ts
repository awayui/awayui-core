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
	 * An <code>IListCollectionDataDescriptor</code> implementation for Vector.&lt;int&gt;.
	 * 
	 * @see ListCollection
	 * @see IListCollectionDataDescriptor
	 */
	export class VectorIntListCollectionDataDescriptor implements IListCollectionDataDescriptor
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
			return (/*data as Vector.<int>*/).length;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<int>*/)[index];
		}
		
		/**
		 * @inheritDoc
		 */
		public setItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<int>*/)[index] = <int>item ;
		}
		
		/**
		 * @inheritDoc
		 */
		public addItemAt(data:Object, item:Object, index:number):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<int>*/).splice(index, 0, <int>item );
		}
		
		/**
		 * @inheritDoc
		 */
		public removeItemAt(data:Object, index:number):Object
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<int>*/).splice(index, 1)[0];
		}

		/**
		 * @inheritDoc
		 */
		public removeAll(data:Object):void
		{
			this.checkForCorrectDataType(data);
			(/*data as Vector.<int>*/).length = 0;
		}
		
		/**
		 * @inheritDoc
		 */
		public getItemIndex(data:Object, item:Object):number
		{
			this.checkForCorrectDataType(data);
			return (/*data as Vector.<int>*/).indexOf(<int>item );
		}
		
		/**
		 * @private
		 */
		protected checkForCorrectDataType(data:Object):void
		{
			if(!(data instanceof number[]))
			{
				throw new IllegalOperationError("Expected Vector.<int>. Received " + Object(data).constructor + " instead.");
			}
		}
	}
}