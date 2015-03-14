/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.skins
{
	import Image = starling.display.Image;
	import Texture = starling.textures.Texture;

	/**
	 * Values for each state are Texture instances, and the manager attempts to
	 * reuse the existing Image instance that is passed in to getValueForState()
	 * as the old value by swapping the texture.
	 */
	export class ImageStateValueSelector extends StateWithToggleValueSelector
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
		 * Optional properties to set on the Image instance.
		 *
		 * @see http://doc.starling-framework.org/core/starling/display/Image.html starling.display.Image
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
			if(!(value instanceof Texture))
			{
				throw new ArgumentError("Value for state must be a Texture instance.");
			}
			super.setValueForState(value, state, isSelected);
		}

		/**
		 * @private
		 */
		/*override*/ public updateValue(target:Object, state:Object, oldValue:Object = null):Object
		{
			var texture:Texture = <Texture>super.updateValue(target, state) ;
			if(!texture)
			{
				return null;
			}

			if(oldValue instanceof Image)
			{
				var image:Image = Image(oldValue);
				image.texture = texture;
				image.readjustSize();
			}
			else
			{
				image = new Image(texture);
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
