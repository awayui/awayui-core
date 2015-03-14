/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.dragDrop
{
	/**
	 * Stores data associated with a drag and drop operation.
	 *
	 * @see DragDropManager
	 */
	export class DragData
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
		protected _data:Object = {};

		/**
		 * Determines if the specified data format is available.
		 */
		public hasDataForFormat(format:string):boolean
		{
			return this._data.hasOwnProperty(format);
		}

		/**
		 * Returns data for the specified format.
		 */
		public getDataForFormat(format:string):any
		{
			if(this._data.hasOwnProperty(format))
			{
				return this._data[format];
			}
			return undefined;
		}

		/**
		 * Saves data for the specified format.
		 */
		public setDataForFormat(format:string, data:any):void
		{
			this._data[format] = data;
		}

		/**
		 * Removes all data for the specified format.
		 */
		public clearDataForFormat(format:string):any
		{
			var data:any = undefined;
			if(this._data.hasOwnProperty(format))
			{
				data = this._data[format];
			}
			delete this._data[format];
			return data;

		}
	}
}
