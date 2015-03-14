/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IFeathersControl = feathers.core.IFeathersControl;
	import IFocusExtras = feathers.core.IFocusExtras;
	import PropertyProxy = feathers.core.PropertyProxy;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/**
	 * A container with layout, optional scrolling, a header, and an optional
	 * footer.
	 *
	 * <p>The following example creates a panel with a horizontal layout and
	 * adds two buttons to it:</p>
	 *
	 * <listing version="3.0">
	 * var panel:Panel = new Panel();
	 * panel.title = "Is it time to party?";
	 * 
	 * var layout:HorizontalLayout = new HorizontalLayout();
	 * layout.gap = 20;
	 * layout.padding = 20;
	 * panel.layout = layout;
	 * 
	 * this.addChild( panel );
	 * 
	 * var yesButton:Button = new Button();
	 * yesButton.label = "Yes";
	 * panel.addChild( yesButton );
	 * 
	 * var noButton:Button = new Button();
	 * noButton.label = "No";
	 * panel.addChild( noButton );</listing>
	 *
	 * @see ../../../help/panel.html How to use the Feathers Panel component
	 */
	export class Panel extends ScrollContainer implements IFocusExtras
	{
		/**
		 * The default value added to the <code>styleNameList</code> of the header.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_HEADER:string = "feathers-panel-header";

		/**
		 * DEPRECATED: Replaced by <code>Panel.DEFAULT_CHILD_STYLE_NAME_HEADER</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Panel#DEFAULT_CHILD_STYLE_NAME_HEADER
		 */
		public static DEFAULT_CHILD_NAME_HEADER:string = Panel.DEFAULT_CHILD_STYLE_NAME_HEADER;

		/**
		 * The default value added to the <code>styleNameList</code> of the footer.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_FOOTER:string = "feathers-panel-footer";

		/**
		 * DEPRECATED: Replaced by <code>Panel.DEFAULT_CHILD_STYLE_NAME_FOOTER</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Panel#DEFAULT_CHILD_STYLE_NAME_FOOTER
		 */
		public static DEFAULT_CHILD_NAME_FOOTER:string = Panel.DEFAULT_CHILD_STYLE_NAME_FOOTER;

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_AUTO
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_AUTO:string = "auto";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_ON
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_ON:string = "on";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_POLICY_OFF
		 *
		 * @see feathers.controls.Scroller#horizontalScrollPolicy
		 * @see feathers.controls.Scroller#verticalScrollPolicy
		 */
		public static SCROLL_POLICY_OFF:string = "off";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_FLOAT
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FLOAT:string = "float";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_FIXED
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_FIXED:string = "fixed";

		/**
		 * @copy feathers.controls.Scroller#SCROLL_BAR_DISPLAY_MODE_NONE
		 *
		 * @see feathers.controls.Scroller#scrollBarDisplayMode
		 */
		public static SCROLL_BAR_DISPLAY_MODE_NONE:string = "none";

		/**
		 * The vertical scroll bar will be positioned on the right.
		 *
		 * @see feathers.controls.Scroller#verticalScrollBarPosition
		 */
		public static VERTICAL_SCROLL_BAR_POSITION_RIGHT:string = "right";

		/**
		 * The vertical scroll bar will be positioned on the left.
		 *
		 * @see feathers.controls.Scroller#verticalScrollBarPosition
		 */
		public static VERTICAL_SCROLL_BAR_POSITION_LEFT:string = "left";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_TOUCH
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH:string = "touch";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_MOUSE
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_MOUSE:string = "mouse";

		/**
		 * @copy feathers.controls.Scroller#INTERACTION_MODE_TOUCH_AND_SCROLL_BARS
		 *
		 * @see feathers.controls.Scroller#interactionMode
		 */
		public static INTERACTION_MODE_TOUCH_AND_SCROLL_BARS:string = "touchAndScrollBars";

		/**
		 * @copy feathers.controls.Scroller#MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_VERTICAL:string = "vertical";

		/**
		 * @copy feathers.controls.Scroller#MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL
		 *
		 * @see feathers.controls.Scroller#verticalMouseWheelScrollDirection
		 */
		public static MOUSE_WHEEL_SCROLL_DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * @copy feathers.controls.Scroller#DECELERATION_RATE_NORMAL
		 *
		 * @see feathers.controls.Scroller#decelerationRate
		 */
		public static DECELERATION_RATE_NORMAL:number = 0.998;

		/**
		 * @copy feathers.controls.Scroller#DECELERATION_RATE_FAST
		 *
		 * @see feathers.controls.Scroller#decelerationRate
		 */
		public static DECELERATION_RATE_FAST:number = 0.99;

		/**
		 * @copy feathers.controls.ScrollContainer#AUTO_SIZE_MODE_STAGE
		 *
		 * @see feathers.controls.ScrollContainer#autoSizeMode
		 */
		public static AUTO_SIZE_MODE_STAGE:string = "stage";

		/**
		 * @copy feathers.controls.ScrollContainer#AUTO_SIZE_MODE_CONTENT
		 *
		 * @see feathers.controls.ScrollContainer#autoSizeMode
		 */
		public static AUTO_SIZE_MODE_CONTENT:string = "content";

		/**
		 * The default <code>IStyleProvider</code> for all <code>Panel</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_HEADER_FACTORY:string = "headerFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_FOOTER_FACTORY:string = "footerFactory";

		/**
		 * @private
		 */
		protected static defaultHeaderFactory():IFeathersControl
		{
			return new Header();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
		}

		/**
		 * The header sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #headerFactory
		 * @see #createHeader()
		 */
		protected header:IFeathersControl;

		/**
		 * The footer sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #footerFactory
		 * @see #createFooter()
		 */
		protected footer:IFeathersControl;

		/**
		 * The default value added to the <code>styleNameList</code> of the
		 * header. This variable is <code>protected</code> so that sub-classes
		 * can customize the header style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_HEADER</code>.
		 *
		 * <p>To customize the header style name without subclassing, see
		 * <code>customHeaderStyleName</code>.</p>
		 *
		 * @see #customHeaderStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected headerStyleName:string = Panel.DEFAULT_CHILD_STYLE_NAME_HEADER;

		/**
		 * DEPRECATED: Replaced by <code>headerStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #headerStyleName
		 */
		protected get headerName():string
		{
			return this.headerStyleName;
		}

		/**
		 * @private
		 */
		protected set headerName(value:string)
		{
			this.headerStyleName = value;
		}

		/**
		 * The default value added to the <code>styleNameList</code> of the
		 * footer. This variable is <code>protected</code> so that sub-classes
		 * can customize the footer style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_FOOTER</code>.
		 *
		 * <p>To customize the footer style name without subclassing, see
		 * <code>customFooterStyleName</code>.</p>
		 *
		 * @see #customFooterStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected footerStyleName:string = Panel.DEFAULT_CHILD_STYLE_NAME_FOOTER;

		/**
		 * DEPRECATED: Replaced by <code>footerStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #footerStyleName
		 */
		protected get footerName():string
		{
			return this.footerStyleName;
		}

		/**
		 * @private
		 */
		protected set footerName(value:string)
		{
			this.footerStyleName = value;
		}

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Panel.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _title:string = null;

		/**
		 * The panel's title to display in the header.
		 *
		 * <p>By default, this value is passed to the <code>title</code>
		 * property of the header, if that property exists. However, if the
		 * header is not a <code>feathers.controls.Header</code> instance,
		 * changing the value of <code>titleField</code> will allow the panel to
		 * pass its title to a different property on the header instead.</p>
		 *
		 * <p>In the following example, a custom header factory is provided to
		 * the panel:</p>
		 *
		 * <listing version="3.0">
		 * panel.title = "Settings";</listing>
		 *
		 * @default null
		 *
		 * @see #headerTitleField
		 * @see #headerFactory
		 */
		public get title():string
		{
			return this._title;
		}

		/**
		 * @private
		 */
		public set title(value:string)
		{
			if(this._title == value)
			{
				return;
			}
			this._title = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}


		/**
		 * @private
		 */
		protected _headerTitleField:string = "title";

		/**
		 * A property of the header that should be used to display the panel's
		 * title.
		 *
		 * <p>By default, this value is passed to the <code>title</code>
		 * property of the header, if that property exists. However, if the
		 * header is not a <code>feathers.controls.Header</code> instance,
		 * changing the value of <code>titleField</code> will allow the panel to
		 * pass the title to a different property name instead.</p>
		 *
		 * <p>In the following example, a <code>Button</code> is used as a
		 * custom header, and the title is passed to its <code>label</code>
		 * property:</p>
		 *
		 * <listing version="3.0">
		 * panel.headerFactory = function():IFeathersControl
		 * {
		 *     return new Button();
		 * };
		 * panel.titleField = "label";</listing>
		 *
		 * @default "title"
		 *
		 * @see #title
		 * @see #headerFactory
		 */
		public get headerTitleField():string
		{
			return this._headerTitleField;
		}

		/**
		 * @private
		 */
		public set headerTitleField(value:string)
		{
			if(this._headerTitleField == value)
			{
				return;
			}
			this._headerTitleField = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _headerFactory:Function;

		/**
		 * A function used to generate the panel's header sub-component.
		 * The header must be an instance of <code>IFeathersControl</code>, but
		 * the default is an instance of <code>Header</code>. This factory can
		 * be used to change properties on the header when it is first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to set skins and other
		 * styles on the header.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():IFeathersControl</pre>
		 *
		 * <p>In the following example, a custom header factory is provided to
		 * the panel:</p>
		 *
		 * <listing version="3.0">
		 * panel.headerFactory = function():IFeathersControl
		 * {
		 *     var header:Header = new Header();
		 *     var closeButton:Button = new Button();
		 *     closeButton.label = "Close";
		 *     closeButton.addEventListener( Event.TRIGGERED, closeButton_triggeredHandler );
		 *     header.rightItems = new &lt;DisplayObject&gt;[ closeButton ];
		 *     return header;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Header
		 * @see #headerProperties
		 */
		public get headerFactory():Function
		{
			return this._headerFactory;
		}

		/**
		 * @private
		 */
		public set headerFactory(value:Function)
		{
			if(this._headerFactory == value)
			{
				return;
			}
			this._headerFactory = value;
			this.invalidate(Panel.INVALIDATION_FLAG_HEADER_FACTORY);
			//hack because the super class doesn't know anything about the
			//header factory
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _customHeaderStyleName:string;

		/**
		 * A style name to add to the panel's header sub-component. Typically
		 * used by a theme to provide different styles to different panels.
		 *
		 * <p>In the following example, a custom header style name is passed to
		 * the panel:</p>
		 *
		 * <listing version="3.0">
		 * panel.customHeaderStyleName = "my-custom-header";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default (this example assumes that the
		 * header is a <code>Header</code>, but it can be any
		 * <code>IFeathersControl</code>):</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Header ).setFunctionForStyleName( "my-custom-header", setCustomHeaderStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_HEADER
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #headerFactory
		 * @see #headerProperties
		 */
		public get customHeaderStyleName():string
		{
			return this._customHeaderStyleName;
		}

		/**
		 * @private
		 */
		public set customHeaderStyleName(value:string)
		{
			if(this._customHeaderStyleName == value)
			{
				return;
			}
			this._customHeaderStyleName = value;
			this.invalidate(Panel.INVALIDATION_FLAG_HEADER_FACTORY);
			//hack because the super class doesn't know anything about the
			//header factory
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * DEPRECATED: Replaced by <code>customHeaderStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customHeaderStyleName
		 */
		public get customHeaderName():string
		{
			return this.customHeaderStyleName;
		}

		/**
		 * @private
		 */
		public set customHeaderName(value:string)
		{
			this.customHeaderStyleName = value;
		}

		/**
		 * @private
		 */
		protected _headerProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the container's
		 * header sub-component. The header may be any
		 * <code>feathers.core.IFeathersControl</code> instance, but the default
		 * is a <code>feathers.controls.Header</code> instance. The available
		 * properties depend on what type of component is returned by
		 * <code>headerFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>headerFactory</code> function
		 * instead of using <code>headerProperties</code> will result in better
		 * performance.</p>
		 *
		 * <p>In the following example, the header properties are customized:</p>
		 *
		 * <listing version="3.0">
		 * var closeButton:Button = new Button();
		 * closeButton.label = "Close";
		 * closeButton.addEventListener( Event.TRIGGERED, closeButton_triggeredHandler );
		 * panel.headerProperties.rightItems = new &lt;DisplayObject&gt;[ closeButton ];</listing>
		 *
		 * @default null
		 *
		 * @see #headerFactory
		 * @see feathers.controls.Header
		 */
		public get headerProperties():Object
		{
			if(!this._headerProperties)
			{
				this._headerProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._headerProperties;
		}

		/**
		 * @private
		 */
		public set headerProperties(value:Object)
		{
			if(this._headerProperties == value)
			{
				return;
			}
			if(!value)
			{
				value = new PropertyProxy();
			}
			if(!(value instanceof PropertyProxy))
			{
				var newValue:PropertyProxy = new PropertyProxy();
				for(var propertyName:string in value)
				{
					newValue[propertyName] = value[propertyName];
				}
				value = newValue;
			}
			if(this._headerProperties)
			{
				this._headerProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._headerProperties = PropertyProxy(value);
			if(this._headerProperties)
			{
				this._headerProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _footerFactory:Function;

		/**
		 * A function used to generate the panel's footer sub-component.
		 * The footer must be an instance of <code>IFeathersControl</code>, and
		 * by default, there is no footer. This factory can be used to change
		 * properties on the footer when it is first created. For instance, if
		 * you are skinning Feathers components without a theme, you might use
		 * this factory to set skins and other styles on the footer.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():IFeathersControl</pre>
		 *
		 * <p>In the following example, a custom footer factory is provided to
		 * the panel:</p>
		 *
		 * <listing version="3.0">
		 * panel.footerFactory = function():IFeathersControl
		 * {
		 *     return new ScrollContainer();
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.core.FeathersControl
		 * @see #footerProperties
		 */
		public get footerFactory():Function
		{
			return this._footerFactory;
		}

		/**
		 * @private
		 */
		public set footerFactory(value:Function)
		{
			if(this._footerFactory == value)
			{
				return;
			}
			this._footerFactory = value;
			this.invalidate(Panel.INVALIDATION_FLAG_FOOTER_FACTORY);
			//hack because the super class doesn't know anything about the
			//header factory
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _customFooterStyleName:string;

		/**
		 * A style name to add to the panel's footer sub-component. Typically
		 * used by a theme to provide different styles to different panels.
		 *
		 * <p>In the following example, a custom footer style name is passed to
		 * the panel:</p>
		 *
		 * <listing version="3.0">
		 * panel.customFooterStyleName = "my-custom-footer";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default (this example assumes that the
		 * footer is a <code>ScrollContainer</code>, but it can be any
		 * <code>IFeathersControl</code>):</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( ScrollContainer ).setFunctionForStyleName( "my-custom-footer", setCustomFooterStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_FOOTER
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #footerFactory
		 * @see #footerProperties
		 */
		public get customFooterStyleName():string
		{
			return this._customFooterStyleName;
		}

		/**
		 * @private
		 */
		public set customFooterStyleName(value:string)
		{
			if(this._customFooterStyleName == value)
			{
				return;
			}
			this._customFooterStyleName = value;
			this.invalidate(Panel.INVALIDATION_FLAG_FOOTER_FACTORY);
			//hack because the super class doesn't know anything about the
			//header factory
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * DEPRECATED: Replaced by <code>customFooterStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customFooterStyleName
		 */
		public get customFooterName():string
		{
			return this.customFooterStyleName;
		}

		/**
		 * @private
		 */
		public set customFooterName(value:string)
		{
			this.customFooterStyleName = value;
		}

		/**
		 * @private
		 */
		protected _footerProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the container's
		 * footer sub-component. The footer may be any
		 * <code>feathers.core.IFeathersControl</code> instance, but there is no
		 * default. The available properties depend on what type of component is
		 * returned by <code>footerFactory</code>.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>footerFactory</code> function
		 * instead of using <code>footerProperties</code> will result in better
		 * performance.</p>
		 *
		 * <p>In the following example, the footer properties are customized:</p>
		 *
		 * <listing version="3.0">
		 * panel.footerProperties.verticalScrollPolicy = ScrollContainer.SCROLL_POLICY_OFF;</listing>
		 *
		 * @default null
		 *
		 * @see #footerFactory
		 */
		public get footerProperties():Object
		{
			if(!this._footerProperties)
			{
				this._footerProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._footerProperties;
		}

		/**
		 * @private
		 */
		public set footerProperties(value:Object)
		{
			if(this._footerProperties == value)
			{
				return;
			}
			if(!value)
			{
				value = new PropertyProxy();
			}
			if(!(value instanceof PropertyProxy))
			{
				var newValue:PropertyProxy = new PropertyProxy();
				for(var propertyName:string in value)
				{
					newValue[propertyName] = value[propertyName];
				}
				value = newValue;
			}
			if(this._footerProperties)
			{
				this._footerProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._footerProperties = PropertyProxy(value);
			if(this._footerProperties)
			{
				this._footerProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		private _focusExtrasBefore:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @inheritDoc
		 */
		public get focusExtrasBefore():DisplayObject[]
		{
			return this._focusExtrasBefore;
		}

		/**
		 * @private
		 */
		private _focusExtrasAfter:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @inheritDoc
		 */
		public get focusExtrasAfter():DisplayObject[]
		{
			return this._focusExtrasAfter;
		}

		/**
		 * Quickly sets all outer padding properties to the same value. The
		 * <code>outerPadding</code> getter always returns the value of
		 * <code>outerPaddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the outer padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * panel.outerPadding = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #outerPaddingTop
		 * @see #outerPaddingRight
		 * @see #outerPaddingBottom
		 * @see #outerPaddingLeft
		 * @see feathers.controls.Scroller#padding
		 */
		public get outerPadding():number
		{
			return this._outerPaddingTop;
		}

		/**
		 * @private
		 */
		public set outerPadding(value:number)
		{
			this.outerPaddingTop = value;
			this.outerPaddingRight = value;
			this.outerPaddingBottom = value;
			this.outerPaddingLeft = value;
		}

		/**
		 * @private
		 */
		protected _outerPaddingTop:number = 0;

		/**
		 * The minimum space, in pixels, between the panel's top edge and the
		 * panel's header.
		 *
		 * <p>Note: The <code>paddingTop</code> property applies to the
		 * middle content only, and it does not affect the header. Use
		 * <code>outerPaddingTop</code> if you want to include padding above
		 * the header. <code>outerPaddingTop</code> and <code>paddingTop</code>
		 * may be used simultaneously to define padding around the outer edges
		 * of the panel and additional padding around its middle content.</p>
		 *
		 * <p>In the following example, the top padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * panel.outerPaddingTop = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see feathers.controls.Scroller#paddingTop
		 */
		public get outerPaddingTop():number
		{
			return this._outerPaddingTop;
		}

		/**
		 * @private
		 */
		public set outerPaddingTop(value:number)
		{
			if(this._outerPaddingTop == value)
			{
				return;
			}
			this._outerPaddingTop = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _outerPaddingRight:number = 0;

		/**
		 * The minimum space, in pixels, between the panel's right edge and the
		 * panel's header, middle content, and footer.
		 *
		 * <p>Note: The <code>paddingRight</code> property applies to the middle
		 * content only, and it does not affect the header or footer. Use
		 * <code>outerPaddingRight</code> if you want to include padding around
		 * the header and footer too. <code>outerPaddingRight</code> and
		 * <code>paddingRight</code> may be used simultaneously to define
		 * padding around the outer edges of the panel plus additional padding
		 * around its middle content.</p>
		 *
		 * <p>In the following example, the right outer padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * panel.outerPaddingRight = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see feathers.controls.Scroller#paddingRight
		 */
		public get outerPaddingRight():number
		{
			return this._outerPaddingRight;
		}

		/**
		 * @private
		 */
		public set outerPaddingRight(value:number)
		{
			if(this._outerPaddingRight == value)
			{
				return;
			}
			this._outerPaddingRight = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _outerPaddingBottom:number = 0;

		/**
		 * The minimum space, in pixels, between the panel's bottom edge and the
		 * panel's footer.
		 *
		 * <p>Note: The <code>paddingBottom</code> property applies to the
		 * middle content only, and it does not affect the footer. Use
		 * <code>outerPaddingBottom</code> if you want to include padding below
		 * the footer. <code>outerPaddingBottom</code> and <code>paddingBottom</code>
		 * may be used simultaneously to define padding around the outer edges
		 * of the panel and additional padding around its middle content.</p>
		 *
		 * <p>In the following example, the bottom outer padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * panel.outerPaddingBottom = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see feathers.controls.Scroller#paddingBottom
		 */
		public get outerPaddingBottom():number
		{
			return this._outerPaddingBottom;
		}

		/**
		 * @private
		 */
		public set outerPaddingBottom(value:number)
		{
			if(this._outerPaddingBottom == value)
			{
				return;
			}
			this._outerPaddingBottom = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _outerPaddingLeft:number = 0;

		/**
		 * The minimum space, in pixels, between the panel's left edge and the
		 * panel's header, middle content, and footer.
		 *
		 * <p>Note: The <code>paddingLeft</code> property applies to the middle
		 * content only, and it does not affect the header or footer. Use
		 * <code>outerPaddingLeft</code> if you want to include padding around
		 * the header and footer too. <code>outerPaddingLeft</code> and
		 * <code>paddingLeft</code> may be used simultaneously to define padding
		 * around the outer edges of the panel and additional padding around its
		 * middle content.</p>
		 *
		 * <p>In the following example, the left outer padding is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * scroller.outerPaddingLeft = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see feathers.controls.Scroller#paddingLeft
		 */
		public get outerPaddingLeft():number
		{
			return this._outerPaddingLeft;
		}

		/**
		 * @private
		 */
		public set outerPaddingLeft(value:number)
		{
			if(this._outerPaddingLeft == value)
			{
				return;
			}
			this._outerPaddingLeft = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _ignoreHeaderResizing:boolean = false;

		/**
		 * @private
		 */
		protected _ignoreFooterResizing:boolean = false;

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var headerFactoryInvalid:boolean = this.isInvalid(Panel.INVALIDATION_FLAG_HEADER_FACTORY);
			var footerFactoryInvalid:boolean = this.isInvalid(Panel.INVALIDATION_FLAG_FOOTER_FACTORY);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);

			if(headerFactoryInvalid)
			{
				this.createHeader();
			}

			if(footerFactoryInvalid)
			{
				this.createFooter();
			}

			if(headerFactoryInvalid || stylesInvalid)
			{
				this.refreshHeaderStyles();
			}

			if(footerFactoryInvalid || stylesInvalid)
			{
				this.refreshFooterStyles();
			}

			super.draw();
		}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected autoSizeIfNeeded():boolean
		{
			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				return false;
			}

			var oldIgnoreHeaderResizing:boolean = this._ignoreHeaderResizing;
			this._ignoreHeaderResizing = true;
			var oldIgnoreFooterResizing:boolean = this._ignoreFooterResizing;
			this._ignoreFooterResizing = true;

			var oldHeaderWidth:number = this.header.width;
			var oldHeaderHeight:number = this.header.height;
			this.header.width = this.explicitWidth;
			this.header.maxWidth = this._maxWidth;
			this.header.height = NaN;
			this.header.validate();

			if(this.footer)
			{
				var oldFooterWidth:number = this.footer.width;
				var oldFooterHeight:number = this.footer.height;
				this.footer.width = this.explicitWidth;
				this.footer.maxWidth = this._maxWidth;
				this.footer.height = NaN;
				this.footer.validate();
			}

			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				newWidth = Math.max(this.header.width, this._viewPort.width + this._rightViewPortOffset + this._leftViewPortOffset);
				if(this.footer)
				{
					newWidth = Math.max(newWidth, this.footer.width);
				}
				if(this.originalBackgroundWidth === this.originalBackgroundWidth) //!isNaN
				{
					newWidth = Math.max(newWidth, this.originalBackgroundWidth);
				}
			}
			if(needsHeight)
			{
				newHeight = this._viewPort.height + this._bottomViewPortOffset + this._topViewPortOffset;
				if(this.originalBackgroundHeight === this.originalBackgroundHeight) //!isNaN
				{
					newHeight = Math.max(newHeight, this.originalBackgroundHeight);
				}
			}

			this.header.width = oldHeaderWidth;
			this.header.height = oldHeaderHeight;
			if(this.footer)
			{
				this.footer.width = oldFooterWidth;
				this.footer.height = oldFooterHeight;
			}
			this._ignoreHeaderResizing = oldIgnoreHeaderResizing;
			this._ignoreFooterResizing = oldIgnoreFooterResizing;

			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates and adds the <code>header</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #header
		 * @see #headerFactory
		 * @see #customHeaderStyleName
		 */
		protected createHeader():void
		{
			if(this.header)
			{
				this.header.removeEventListener(FeathersEventType.RESIZE, this.header_resizeHandler);
				var displayHeader:DisplayObject = DisplayObject(this.header);
				this._focusExtrasBefore.splice(this._focusExtrasBefore.indexOf(displayHeader), 1);
				this.removeRawChild(displayHeader, true);
				this.header = null;
			}

			var factory:Function = this._headerFactory != null ? this._headerFactory : Panel.defaultHeaderFactory;
			var headerStyleName:string = this._customHeaderStyleName != null ? this._customHeaderStyleName : this.headerStyleName;
			this.header = IFeathersControl(factory());
			this.header.styleNameList.add(headerStyleName);
			this.header.addEventListener(FeathersEventType.RESIZE, this.header_resizeHandler);
			displayHeader = DisplayObject(this.header);
			this.addRawChild(displayHeader);
			this._focusExtrasBefore.push(displayHeader);
		}

		/**
		 * Creates and adds the <code>footer</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #footer
		 * @see #footerFactory
		 * @see #customFooterStyleName
		 */
		protected createFooter():void
		{
			if(this.footer)
			{
				this.footer.removeEventListener(FeathersEventType.RESIZE, this.footer_resizeHandler);
				var displayFooter:DisplayObject = DisplayObject(this.footer);
				this._focusExtrasAfter.splice(this._focusExtrasAfter.indexOf(displayFooter), 1);
				this.removeRawChild(displayFooter, true);
				this.footer = null;
			}

			if(this._footerFactory == null)
			{
				return;
			}
			var footerStyleName:string = this._customFooterStyleName != null ? this._customFooterStyleName : this.footerStyleName;
			this.footer = IFeathersControl(this._footerFactory());
			this.footer.styleNameList.add(footerStyleName);
			this.footer.addEventListener(FeathersEventType.RESIZE, this.footer_resizeHandler);
			displayFooter = DisplayObject(this.footer);
			this.addRawChild(displayFooter);
			this._focusExtrasAfter.push(displayFooter);
		}

		/**
		 * @private
		 */
		protected refreshHeaderStyles():void
		{
			if(Object(this.header).hasOwnProperty(this._headerTitleField))
			{
				this.header[this._headerTitleField] = this._title;
			}
			for(var propertyName:string in this._headerProperties)
			{
				var propertyValue:Object = this._headerProperties[propertyName];
				this.header[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshFooterStyles():void
		{
			for(var propertyName:string in this._footerProperties)
			{
				var propertyValue:Object = this._footerProperties[propertyName];
				this.footer[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected calculateViewPortOffsets(forceScrollBars:boolean = false, useActualBounds:boolean = false):void
		{
			super.calculateViewPortOffsets(forceScrollBars);

			this._leftViewPortOffset += this._outerPaddingLeft;
			this._rightViewPortOffset += this._outerPaddingRight;

			var oldIgnoreHeaderResizing:boolean = this._ignoreHeaderResizing;
			this._ignoreHeaderResizing = true;
			var oldHeaderWidth:number = this.header.width;
			var oldHeaderHeight:number = this.header.height;
			if(useActualBounds)
			{
				this.header.width = this.actualWidth - this._outerPaddingLeft - this._outerPaddingRight;
			}
			else
			{
				this.header.width = this.explicitWidth - this._outerPaddingLeft - this._outerPaddingRight;
			}
			this.header.maxWidth = this._maxWidth - this._outerPaddingLeft - this._outerPaddingRight;
			this.header.height = NaN;
			this.header.validate();
			this._topViewPortOffset += this.header.height + this._outerPaddingTop;
			this.header.width = oldHeaderWidth;
			this.header.height = oldHeaderHeight;
			this._ignoreHeaderResizing = oldIgnoreHeaderResizing;

			if(this.footer)
			{
				var oldIgnoreFooterResizing:boolean = this._ignoreFooterResizing;
				this._ignoreFooterResizing = true;
				var oldFooterWidth:number = this.footer.width;
				var oldFooterHeight:number = this.footer.height;
				if(useActualBounds)
				{
					this.footer.width = this.actualWidth - this._outerPaddingLeft - this._outerPaddingRight;
				}
				else
				{
					this.header.width = this.explicitWidth - this._outerPaddingLeft - this._outerPaddingRight;
				}
				this.footer.maxWidth = this._maxWidth - this._outerPaddingLeft - this._outerPaddingRight;
				this.footer.height = NaN;
				this.footer.validate();
				this._bottomViewPortOffset += this.footer.height + this._outerPaddingBottom;
				this.footer.width = oldFooterWidth;
				this.footer.height = oldFooterHeight;
				this._ignoreFooterResizing = oldIgnoreFooterResizing;
			}
			else
			{
				this._bottomViewPortOffset += this._outerPaddingBottom;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected layoutChildren():void
		{
			super.layoutChildren();

			var oldIgnoreHeaderResizing:boolean = this._ignoreHeaderResizing;
			this._ignoreHeaderResizing = true;
			this.header.x = this._outerPaddingLeft;
			this.header.y = this._outerPaddingTop;
			this.header.width = this.actualWidth - this._outerPaddingLeft - this._outerPaddingRight;
			this.header.height = NaN;
			this.header.validate();
			this._ignoreHeaderResizing = oldIgnoreHeaderResizing;

			if(this.footer)
			{
				var oldIgnoreFooterResizing:boolean = this._ignoreFooterResizing;
				this._ignoreFooterResizing = true;
				this.footer.x = this._outerPaddingLeft;
				this.footer.width = this.actualWidth - this._outerPaddingLeft - this._outerPaddingRight;
				this.footer.height = NaN;
				this.footer.validate();
				this.footer.y = this.actualHeight - this.footer.height - this._outerPaddingBottom;
				this._ignoreFooterResizing = oldIgnoreFooterResizing;
			}
		}

		/**
		 * @private
		 */
		protected header_resizeHandler(event:Event):void
		{
			if(this._ignoreHeaderResizing)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected footer_resizeHandler(event:Event):void
		{
			if(this._ignoreFooterResizing)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}
	}
}
