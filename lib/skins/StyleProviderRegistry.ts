/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.skins
{
	import Dictionary = flash.utils.Dictionary;

	/**
	 * Used by themes to create and manage style providers for component classes.
	 */
	export class StyleProviderRegistry
	{
		/**
		 * @private
		 */
		protected static GLOBAL_STYLE_PROVIDER_PROPERTY_NAME:string = "globalStyleProvider";

		/**
		 * @private
		 */
		protected static defaultStyleProviderFactory():IStyleProvider
		{
			return new StyleNameFunctionStyleProvider();
		}

		/**
		 * Constructor.
		 *
		 * <p>If style providers are to be registered globally, they will be
		 * passed to the static <code>globalStyleProvider</code> property of the
		 * specified class. If the class does not define a
		 * <code>globalStyleProvider</code> property, an error will be thrown.</p>
		 *
		 * <p>The style provider factory function is expected to have the following
		 * signature:</p>
		 * <pre>function():IStyleProvider</pre>
		 *
		 * @param registerGlobally			Determines if the registry sets the static <code>globalStyleProvider</code> property.
		 * @param styleProviderFactory		An optional function that creates a new style provider. If <code>null</code>, a <code>StyleNameFunctionStyleProvider</code> will be created.
		 */
		constructor(registerGlobally:boolean = true, styleProviderFactory:Function = null)
		{
			this._registerGlobally = registerGlobally;
			if(styleProviderFactory === null)
			{
				this._styleProviderFactory = StyleProviderRegistry.defaultStyleProviderFactory;
			}
			else
			{
				this._styleProviderFactory = styleProviderFactory;
			}

		}

		/**
		 * @private
		 */
		protected _registerGlobally:boolean;

		/**
		 * @private
		 */
		protected _styleProviderFactory:Function;

		/**
		 * @private
		 */
		protected _classToStyleProvider:Dictionary = new Dictionary(true);

		/**
		 * Disposes the theme.
		 */
		public dispose():void
		{
			//clear the global style providers, but only if they still match the
			//ones that the theme created. a developer could replace the global
			//style providers with different ones.
			for(var untypedType:Object in this._classToStyleProvider)
			{
				var type:Class = Class(untypedType);
				this.clearStyleProvider(type);
			}
			this._classToStyleProvider = null;
		}

		/**
		 * Creates an <code>IStyleProvider</code> for the specified component
		 * class, or if it was already created, returns the existing registered
		 * style provider. If the registry is global, a newly created style
		 * provider will be passed to the static <code>globalStyleProvider</code>
		 * property of the specified class.
		 *
		 * @param forClass					The style provider is registered for this class.
		 * @param styleProviderFactory		A factory used to create the style provider.
		 */
		public getStyleProvider(forClass:Class):IStyleProvider
		{
			this.validateComponentClass(forClass);
			var styleProvider:IStyleProvider = this.IStyleProvider(this._classToStyleProvider[forClass]);
			if(!styleProvider)
			{
				styleProvider = this._styleProviderFactory();
				this._classToStyleProvider[forClass] = styleProvider;
				if(this._registerGlobally)
				{
					forClass[StyleProviderRegistry.GLOBAL_STYLE_PROVIDER_PROPERTY_NAME] = styleProvider;
				}
			}
			return styleProvider;
		}

		/**
		 * Removes the style provider for the specified component class. If the
		 * registry is global, and the static <code>globalStyleProvider</code>
		 * property contains the same value, it will be set to <code>null</code>.
		 * If it contains a different value, then it will be left unchanged to
		 * avoid conflicts with other registries or code.
		 *
		 * @param forClass		The style provider is registered for this class.
		 */
		public clearStyleProvider(forClass:Class):void
		{
			this.validateComponentClass(forClass);
			if(forClass in this._classToStyleProvider)
			{
				var styleProvider:IStyleProvider = this.IStyleProvider(this._classToStyleProvider[forClass]);
				delete this._classToStyleProvider[forClass];
				if(this._registerGlobally &&
					forClass[StyleProviderRegistry.GLOBAL_STYLE_PROVIDER_PROPERTY_NAME] === styleProvider)
				{
					//something else may have changed the global style provider
					//after this registry set it, so we check if it's equal
					//before setting to null.
					forClass[StyleProviderRegistry.GLOBAL_STYLE_PROVIDER_PROPERTY_NAME] = null;
				}
			}
		}

		/**
		 * @private
		 */
		protected validateComponentClass(type:Class):void
		{
			if(!this._registerGlobally || Object(type).hasOwnProperty(StyleProviderRegistry.GLOBAL_STYLE_PROVIDER_PROPERTY_NAME))
			{
				return;
			}
			throw ArgumentError("Class " + type + " must have a " + StyleProviderRegistry.GLOBAL_STYLE_PROVIDER_PROPERTY_NAME + " static property to support themes.");
		}
	}
}
