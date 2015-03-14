/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.skins
{
	import Scale3Image = feathers.display.Scale3Image;
	import Scale9Image = feathers.display.Scale9Image;
	import Scale3Textures = feathers.textures.Scale3Textures;
	import Scale9Textures = feathers.textures.Scale9Textures;

	import Dictionary = flash.utils.Dictionary;

	import DisplayObject = starling.display.DisplayObject;
	import Image = starling.display.Image;
	import Quad = starling.display.Quad;
	import ConcreteTexture = starling.textures.ConcreteTexture;
	import SubTexture = starling.textures.SubTexture;
	import Texture = starling.textures.Texture;

	/**
	 * Values for each state are textures or colors, and the manager attempts to
	 * reuse the existing display object that is passed in to getValueForState()
	 * as the old value, if possible. Supports Image and Texture, Scale3Image
	 * and Scale3Textures, Scale9Image and Scale9Textures, or Quad and uint
	 * (color) value.
	 *
	 * <p>Additional value type handlers may be added, or the default type
	 * handlers may be replaced.</p>
	 */
	export class SmartDisplayObjectStateValueSelector extends StateWithToggleValueSelector
	{
		/**
		 * The value type handler for type <code>starling.textures.Texture</code>.
		 *
		 * @see http://doc.starling-framework.org/core/starling/textures/Texture.html starling.display.Texture
		 */
		public static textureValueTypeHandler(value:Texture, oldDisplayObject:DisplayObject = null):DisplayObject
		{
			var displayObject:Image;
			if(oldDisplayObject && Object(oldDisplayObject).constructor === Image)
			{
				displayObject = Image(oldDisplayObject);
				displayObject.texture = value;
				displayObject.readjustSize();
			}
			if(!displayObject)
			{
				displayObject = new Image(value);
			}
			return displayObject;
		}

		/**
		 * The value type handler for type <code>feathers.textures.Scale3Textures</code>.
		 *
		 * @see feathers.textures.Scale3Textures
		 */
		public static scale3TextureValueTypeHandler(value:Scale3Textures, oldDisplayObject:DisplayObject = null):DisplayObject
		{
			var displayObject:Scale3Image;
			if(oldDisplayObject && Object(oldDisplayObject).constructor === Scale3Image)
			{
				displayObject = Scale3Image(oldDisplayObject);
				displayObject.textures = value;
				displayObject.readjustSize();
			}
			if(!displayObject)
			{
				displayObject = new Scale3Image(value);
			}
			return displayObject;
		}

		/**
		 * The value type handler for type <code>feathers.textures.Scale9Textures</code>.
		 *
		 * @see feathers.textures.Scale9Textures
		 */
		public static scale9TextureValueTypeHandler(value:Scale9Textures, oldDisplayObject:DisplayObject = null):DisplayObject
		{
			var displayObject:Scale9Image;
			if(oldDisplayObject && Object(oldDisplayObject).constructor === Scale9Image)
			{
				displayObject = Scale9Image(oldDisplayObject);
				displayObject.textures = value;
				displayObject.readjustSize();
			}
			if(!displayObject)
			{
				displayObject = new Scale9Image(value);
			}
			return displayObject;
		}

		/**
		 * The value type handler for type <code>uint</code> (a color to display
		 * by a quad).
		 *
		 * @see http://doc.starling-framework.org/core/starling/display/Quad.html starling.display.Quad
		 */
		public static uintValueTypeHandler(value:number, oldDisplayObject:DisplayObject = null):DisplayObject
		{
			var displayObject:Quad;
			if(oldDisplayObject && Object(oldDisplayObject).constructor === Quad)
			{
				displayObject = Quad(oldDisplayObject);
			}
			if(!displayObject)
			{
				displayObject = new Quad(1, 1, value);
			}
			displayObject.color = value;
			return displayObject;
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			this.setValueTypeHandler(Texture, SmartDisplayObjectStateValueSelector.textureValueTypeHandler);
			this.setValueTypeHandler(ConcreteTexture, SmartDisplayObjectStateValueSelector.textureValueTypeHandler);
			this.setValueTypeHandler(SubTexture, SmartDisplayObjectStateValueSelector.textureValueTypeHandler);
			this.setValueTypeHandler(Scale9Textures, SmartDisplayObjectStateValueSelector.scale9TextureValueTypeHandler);
			this.setValueTypeHandler(Scale3Textures, SmartDisplayObjectStateValueSelector.scale3TextureValueTypeHandler);
			//the constructor property of a uint is actually Number.
			this.setValueTypeHandler(Number, SmartDisplayObjectStateValueSelector.uintValueTypeHandler);
		}

		/**
		 * @private
		 */
		protected _displayObjectProperties:Object;

		/**
		 * Optional properties to set on the Scale9Image instance.
		 *
		 * @see feathers.display.Scale9Image
		 */
		public get displayObjectProperties():Object
		{
			if(!this._displayObjectProperties)
			{
				this._displayObjectProperties = {};
			}
			return this._displayObjectProperties;
		}

		/**
		 * @private
		 */
		public set displayObjectProperties(value:Object)
		{
			this._displayObjectProperties = value;
		}

		/**
		 * @private
		 */
		protected _handlers:Dictionary = new Dictionary(true);

		/**
		 * @private
		 */
		/*override*/ public setValueForState(value:Object, state:Object, isSelected:boolean = false):void
		{
			if(value !== null)
			{
				var type:Class = Class(value.constructor);
				if(this._handlers[type] == null)
				{
					throw new ArgumentError("Handler for value type " + type + " has not been set.");
				}
			}
			super.setValueForState(value, state, isSelected);
		}

		/**
		 * @private
		 */
		/*override*/ public updateValue(target:Object, state:Object, oldValue:Object = null):Object
		{
			var value:Object = super.updateValue(target, state);
			if(value === null)
			{
				return null;
			}

			var typeHandler:Function = this.valueToValueTypeHandler(value);
			if(typeHandler != null)
			{
				var displayObject:DisplayObject = typeHandler(value, oldValue);
			}
			else
			{
				throw new ArgumentError("Invalid value: ", value);
			}

			for(var propertyName:string in this._displayObjectProperties)
			{
				var propertyValue:Object = this._displayObjectProperties[propertyName];
				displayObject[propertyName] = propertyValue;
			}

			return displayObject;
		}

		/**
		 * Sets a function to handle updating a value of a specific type. The
		 * function must have the following signature:
		 *
		 * <pre>function(value:Object, oldDisplayObject:DisplayObject = null):DisplayObject</pre>
		 *
		 * <p>The <code>oldDisplayObject</code> is optional, and it may be of
		 * a type that is different than what the function will return. If the
		 * types do not match, the function should create a new object instead
		 * of reusing the old display object.</p>
		 */
		public setValueTypeHandler(type:Class, handler:Function):void
		{
			this._handlers[type] = handler;
		}

		/**
		 * Returns the function that handles updating a value of a specific type.
		 */
		public getValueTypeHandler(type:Class):Function
		{
			return <Function>this._handlers[type] ;
		}

		/**
		 * Clears a value type handler.
		 */
		public clearValueTypeHandler(type:Class):void
		{
			delete this._handlers[type];
		}

		/**
		 * @private
		 */
		protected valueToValueTypeHandler(value:Object):Function
		{
			var type:Class = Class(value.constructor);
			return <Function>this._handlers[type] ;
		}
	}
}
