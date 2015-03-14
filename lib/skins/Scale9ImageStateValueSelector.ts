/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.skins
{
	import Scale9Image = feathers.display.Scale9Image;
	import Scale9Textures = feathers.textures.Scale9Textures;

	/**
	 * Values for each state are Scale9Textures instances, and the manager
	 * attempts to reuse the existing Scale9Image instance that is passed in to
	 * getValueForState() as the old value by swapping the textures.
	 */
	export class Scale9ImageStateValueSelector extends StateWithToggleValueSelector
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
		protected _imageProperties:Object;

		/**
		 * Optional properties to set on the Scale9Image instance.
		 *
		 * @see feathers.display.Scale9Image
		 */
		public get imageProperties():Object
		{
			if(!this._imageProperties)
			{
				this._imageProperties = {};
			}
			return this._imageProperties;
		}

		/**
		 * @private
		 */
		public set imageProperties(value:Object)
		{
			this._imageProperties = value;
		}

		/**
		 * @private
		 */
		/*override*/ public setValueForState(value:Object, state:Object, isSelected:boolean = false):void
		{
			if(!(value instanceof Scale9Textures))
			{
				throw new ArgumentError("Value for state must be a Scale9Textures instance.");
			}
			super.setValueForState(value, state, isSelected);
		}

		/**
		 * @private
		 */
		/*override*/ public updateValue(target:Object, state:Object, oldValue:Object = null):Object
		{
			var textures:Scale9Textures = <Scale9Textures>super.updateValue(target, state) ;
			if(!textures)
			{
				return null;
			}

			if(oldValue instanceof Scale9Image)
			{
				var image:Scale9Image = Scale9Image(oldValue);
				image.textures = textures;
				image.readjustSize();
			}
			else
			{
				image = new Scale9Image(textures);
			}

			for(var propertyName:string in this._imageProperties)
			{
				var propertyValue:Object = this._imageProperties[propertyName];
				image[propertyName] = propertyValue;
			}

			return image;
		}
	}
}
