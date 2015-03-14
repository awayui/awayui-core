/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import IFeathersControl = feathers.core.IFeathersControl;
	import ITextRenderer = feathers.core.ITextRenderer;
	import IValidating = feathers.core.IValidating;
	import PopUpManager = feathers.core.PopUpManager;
	import PropertyProxy = feathers.core.PropertyProxy;
	import ListCollection = feathers.data.ListCollection;
	import VerticalLayout = feathers.layout.VerticalLayout;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/*[Exclude(name="layout",kind="property")]*/
	/*[Exclude(name="footer",kind="property")]*/
	/*[Exclude(name="footerFactory",kind="property")]*/
	/*[Exclude(name="footerProperties",kind="property")]*/
	/*[Exclude(name="customFooterName",kind="property")]*/
	/*[Exclude(name="customFooterStyleName",kind="property")]*/
	/*[Exclude(name="createFooter",kind="method")]*/

	/**
	 * Dispatched when the alert is closed. The <code>data</code> property of
	 * the event object will contain the item from the <code>ButtonGroup</code>
	 * data provider for the button that is triggered. If no button is
	 * triggered, then the <code>data</code> property will be <code>null</code>.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType starling.events.Event.CLOSE
	 */
	/*[Event(name="close",type="starling.events.Event")]*/

	/**
	 * Displays a message in a modal pop-up with a title and a set of buttons.
	 *
	 * <p>In general, an <code>Alert</code> isn't instantiated directly.
	 * Instead, you will typically call the static function
	 * <code>Alert.show()</code>. This is not required, but it result in less
	 * code and no need to manually manage calls to the <code>PopUpManager</code>.</p>
	 *
	 * <p>In the following example, an alert is shown when a <code>Button</code>
	 * is triggered:</p>
	 *
	 * <listing version="3.0">
	 * button.addEventListener( Event.TRIGGERED, button_triggeredHandler );
	 * 
	 * function button_triggeredHandler( event:Event ):void
	 * {
	 *     var alert:Alert = Alert.show( "This is an alert!", "Hello World", new ListCollection(
	 *     [
	 *         { label: "OK" }
	 *     ]);
	 * }</listing>
	 *
	 * @see ../../../help/alert.html How to use the Feathers Alert component
	 */
	export class Alert extends Panel
	{
		/**
		 * The default value added to the <code>styleNameList</code> of the header.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_HEADER:string = "feathers-alert-header";

		/**
		 * DEPRECATED: Replaced by <code>Alert.DEFAULT_CHILD_STYLE_NAME_HEADER</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Alert#DEFAULT_CHILD_STYLE_NAME_HEADER
		 */
		public static DEFAULT_CHILD_NAME_HEADER:string = Alert.DEFAULT_CHILD_STYLE_NAME_HEADER;

		/**
		 * The default value added to the <code>styleNameList</code> of the button group.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_BUTTON_GROUP:string = "feathers-alert-button-group";

		/**
		 * DEPRECATED: Replaced by <code>Alert.DEFAULT_CHILD_STYLE_NAME_BUTTON_GROUP</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Alert#DEFAULT_CHILD_STYLE_NAME_BUTTON_GROUP
		 */
		public static DEFAULT_CHILD_NAME_BUTTON_GROUP:string = Alert.DEFAULT_CHILD_STYLE_NAME_BUTTON_GROUP;

		/**
		 * The default value added to the <code>styleNameList</code> of the message.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_MESSAGE:string = "feathers-alert-message";

		/**
		 * DEPRECATED: Replaced by <code>Alert.DEFAULT_CHILD_STYLE_NAME_MESSAGE</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see Alert#DEFAULT_CHILD_STYLE_NAME_MESSAGE
		 */
		public static DEFAULT_CHILD_NAME_MESSAGE:string = Alert.DEFAULT_CHILD_STYLE_NAME_MESSAGE;

		/**
		 * Returns a new <code>Alert</code> instance when <code>Alert.show()</code>
		 * is called. If one wishes to skin the alert manually, a custom factory
		 * may be provided.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():Alert</pre>
		 *
		 * <p>The following example shows how to create a custom alert factory:</p>
		 *
		 * <listing version="3.0">
		 * Alert.alertFactory = function():Alert
		 * {
		 *     var alert:Alert = new Alert();
		 *     //set properties here!
		 *     return alert;
		 * };</listing>
		 *
		 * @see #show()
		 */
		public static alertFactory:Function = Alert.defaultAlertFactory;

		/**
		 * Returns an overlay to display with a alert that is modal. Uses the
		 * standard <code>overlayFactory</code> of the <code>PopUpManager</code>
		 * by default, but you can use this property to provide your own custom
		 * overlay, if you prefer.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 * <pre>function():DisplayObject</pre>
		 *
		 * <p>The following example uses a semi-transparent <code>Quad</code> as
		 * a custom overlay:</p>
		 *
		 * <listing version="3.0">
		 * Alert.overlayFactory = function():Quad
		 * {
		 *     var quad:Quad = new Quad(10, 10, 0x000000);
		 *     quad.alpha = 0.75;
		 *     return quad;
		 * };</listing>
		 *
		 * @see feathers.core.PopUpManager#overlayFactory
		 *
		 * @see #show()
		 */
		public static overlayFactory:Function;

		/**
		 * The default <code>IStyleProvider</code> for all <code>Alert</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * The default factory that creates alerts when <code>Alert.show()</code>
		 * is called. To use a different factory, you need to set
		 * <code>Alert.alertFactory</code> to a <code>Function</code>
		 * instance.
		 *
		 * @see #show()
		 * @see #alertFactory
		 */
		public static defaultAlertFactory():Alert
		{
			return new Alert();
		}

		/**
		 * Creates an alert, sets common properties, and adds it to the
		 * <code>PopUpManager</code> with the specified modal and centering
		 * options.
		 *
		 * <p>In the following example, an alert is shown when a
		 * <code>Button</code> is triggered:</p>
		 *
		 * <listing version="3.0">
		 * button.addEventListener( Event.TRIGGERED, button_triggeredHandler );
		 *
		 * function button_triggeredHandler( event:Event ):void
		 * {
		 *     var alert:Alert = Alert.show( "This is an alert!", "Hello World", new ListCollection(
		 *     [
		 *         { label: "OK" }
		 *     ]);
		 * }</listing>
		 */
		public static show(message:string, title:string = null, buttons:ListCollection = null,
			icon:DisplayObject = null, isModal:boolean = true, isCentered:boolean = true,
			customAlertFactory:Function = null, customOverlayFactory:Function = null):Alert
		{
			var factory:Function = customAlertFactory;
			if(factory == null)
			{
				factory = Alert.alertFactory != null ? Alert.alertFactory : Alert.defaultAlertFactory;
			}
			var alert:Alert = Alert(factory());
			alert.title = title;
			alert.message = message;
			alert.buttonsDataProvider = buttons;
			alert.icon = icon;
			factory = customOverlayFactory;
			if(factory == null)
			{
				factory = Alert.overlayFactory;
			}
			PopUpManager.addPopUp(alert, isModal, isCentered, factory);
			return alert;
		}

		/**
		 * @private
		 */
		protected static defaultButtonGroupFactory():ButtonGroup
		{
			return new ButtonGroup();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.headerStyleName = Alert.DEFAULT_CHILD_STYLE_NAME_HEADER;
			this.footerStyleName = Alert.DEFAULT_CHILD_STYLE_NAME_BUTTON_GROUP;
			this.buttonGroupFactory = Alert.defaultButtonGroupFactory;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the alert's
		 * message text renderer. This variable is <code>protected</code> so
		 * that sub-classes can customize the message style name in their
		 * constructors instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_MESSAGE</code>.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected messageStyleName:string = Alert.DEFAULT_CHILD_STYLE_NAME_MESSAGE;

		/**
		 * DEPRECATED: Replaced by <code>messageStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #messageStyleName
		 */
		protected get messageName():string
		{
			return this.messageStyleName;
		}

		/**
		 * @private
		 */
		protected set messageName(value:string)
		{
			this.messageStyleName = value;
		}

		/**
		 * The header sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected headerHeader:Header;

		/**
		 * The button group sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected buttonGroupFooter:ButtonGroup;

		/**
		 * The message text renderer sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 */
		protected messageTextRenderer:ITextRenderer;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Alert.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _message:string = null;

		/**
		 * The alert's main text content.
		 */
		public get message():string
		{
			return this._message;
		}

		/**
		 * @private
		 */
		public set message(value:string)
		{
			if(this._message == value)
			{
				return;
			}
			this._message = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _icon:DisplayObject;

		/**
		 * The alert's optional icon content to display next to the text.
		 */
		public get icon():DisplayObject
		{
			return this._icon;
		}

		/**
		 * @private
		 */
		public set icon(value:DisplayObject)
		{
			if(this._icon == value)
			{
				return;
			}
			var oldDisplayListBypassEnabled:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			if(this._icon)
			{
				this.removeChild(this._icon);
			}
			this._icon = value;
			if(this._icon)
			{
				this.addChild(this._icon);
			}
			this.displayListBypassEnabled = oldDisplayListBypassEnabled;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _gap:number = 0;

		/**
		 * The space, in pixels, between the alert's icon and its message text
		 * renderer.
		 *
		 * <p>In the following example, the gap is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * alert.gap = 20;</listing>
		 *
		 * @default 0
		 */
		public get gap():number
		{
			return this._gap;
		}

		/**
		 * @private
		 */
		public set gap(value:number)
		{
			if(this._gap == value)
			{
				return;
			}
			this._gap = value;
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected _buttonsDataProvider:ListCollection;

		/**
		 * The data provider of the alert's <code>ButtonGroup</code>.
		 */
		public get buttonsDataProvider():ListCollection
		{
			return this._buttonsDataProvider;
		}

		/**
		 * @private
		 */
		public set buttonsDataProvider(value:ListCollection)
		{
			if(this._buttonsDataProvider == value)
			{
				return;
			}
			this._buttonsDataProvider = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _messageFactory:Function;

		/**
		 * A function used to instantiate the alert's message text renderer
		 * sub-component. By default, the alert will use the global text
		 * renderer factory, <code>FeathersControl.defaultTextRendererFactory()</code>,
		 * to create the message text renderer. The message text renderer must
		 * be an instance of <code>ITextRenderer</code>. This factory can be
		 * used to change properties on the message text renderer when it is
		 * first created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to style the message text
		 * renderer.
		 *
		 * <p>If you are not using a theme, the message factory can be used to
		 * provide skin the message text renderer with appropriate text styles.</p>
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>In the following example, a custom message factory is passed to
		 * the alert:</p>
		 *
		 * <listing version="3.0">
		 * alert.messageFactory = function():ITextRenderer
		 * {
		 *     var messageRenderer:TextFieldTextRenderer = new TextFieldTextRenderer();
		 *     messageRenderer.textFormat = new TextFormat( "_sans", 12, 0xff0000 );
		 *     return messageRenderer;
		 * }</listing>
		 *
		 * @default null
		 *
		 * @see #message
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get messageFactory():Function
		{
			return this._messageFactory;
		}

		/**
		 * @private
		 */
		public set messageFactory(value:Function)
		{
			if(this._messageFactory == value)
			{
				return;
			}
			this._messageFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}

		/**
		 * @private
		 */
		protected _messageProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the alert's message
		 * text renderer. The message text renderer is an <code>ITextRenderer</code>
		 * instance. The available properties depend on which
		 * <code>ITextRenderer</code> implementation is returned by
		 * <code>messageFactory</code>. The most common implementations are
		 * <code>BitmapFontTextRenderer</code> and <code>TextFieldTextRenderer</code>.
		 *
		 * <p>In the following example, some properties are set for the alert's
		 * message text renderer (this example assumes that the message text
		 * renderer is a <code>BitmapFontTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * alert.messageProperties.textFormat = new BitmapFontTextFormat( bitmapFont );
		 * alert.messageProperties.wordWrap = true;</listing>
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>messageFactory</code> function instead
		 * of using <code>messageProperties</code> will result in better
		 * performance.</p>
		 *
		 * @default null
		 *
		 * @see #messageFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 */
		public get messageProperties():Object
		{
			if(!this._messageProperties)
			{
				this._messageProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._messageProperties;
		}

		/**
		 * @private
		 */
		public set messageProperties(value:Object)
		{
			if(this._messageProperties == value)
			{
				return;
			}
			if(value && !(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			if(this._messageProperties)
			{
				this._messageProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._messageProperties = PropertyProxy(value);
			if(this._messageProperties)
			{
				this._messageProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * A function used to generate the alerts's button group sub-component.
		 * The button group must be an instance of <code>ButtonGroup</code>.
		 * This factory can be used to change properties on the button group
		 * when it is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the button group.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():ButtonGroup</pre>
		 *
		 * <p>In the following example, a custom button group factory is
		 * provided to the alert:</p>
		 *
		 * <listing version="3.0">
		 * alert.buttonGroupFactory = function():ButtonGroup
		 * {
		 *     return new ButtonGroup();
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.ButtonGroup
		 * @see #buttonGroupProperties
		 */
		public get buttonGroupFactory():Function
		{
			return super.footerFactory;
		}

		/**
		 * @private
		 */
		public set buttonGroupFactory(value:Function)
		{
			super.footerFactory = value;
		}

		/**
		 * A style name to add to the alert's button group sub-component.
		 * Typically used by a theme to provide different styles to different alerts.
		 *
		 * <p>In the following example, a custom button group style name is
		 * passed to the alert:</p>
		 *
		 * <listing version="3.0">
		 * alert.customButtonGroupStyleName = "my-custom-button-group";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( ButtonGroup ).setFunctionForStyleName( "my-custom-button-group", setCustomButtonGroupStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_BUTTON_GROUP
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #buttonGroupFactory
		 * @see #buttonGroupProperties
		 */
		public get customButtonGroupStyleName():string
		{
			return super.customFooterStyleName;
		}

		/**
		 * @private
		 */
		public set customButtonGroupStyleName(value:string)
		{
			super.customFooterStyleName = value;
		}

		/**
		 * DEPRECATED: Replaced by <code>customButtonGroupStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customButtonGroupStyleName
		 */
		public get customButtonGroupName():string
		{
			return this.customButtonGroupStyleName;
		}

		/**
		 * @private
		 */
		public set customButtonGroupName(value:string)
		{
			this.customButtonGroupStyleName = value;
		}

		/**
		 * A set of key/value pairs to be passed down to the alert's button
		 * group sub-component. The button must be a
		 * <code>feathers.core.ButtonGroup</code> instance.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>buttonGroupFactory</code> function
		 * instead of using <code>buttonGroupProperties</code> will result in better
		 * performance.</p>
		 *
		 * <p>In the following example, the button group properties are customized:</p>
		 *
		 * <listing version="3.0">
		 * alert.buttonGroupProperties.gap = 20;</listing>
		 *
		 * @default null
		 *
		 * @see #buttonGroupFactory
		 * @see feathers.controls.ButtonGroup
		 */
		public get buttonGroupProperties():Object
		{
			return super.footerProperties;
		}

		/**
		 * @private
		 */
		public set buttonGroupProperties(value:Object)
		{
			super.footerProperties = value;
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			if(!this.layout)
			{
				var layout:VerticalLayout = new VerticalLayout();
				layout.horizontalAlign = VerticalLayout.HORIZONTAL_ALIGN_JUSTIFY;
				this.layout = layout;
			}
			super.initialize();
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES)
			var textRendererInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_TEXT_RENDERER);

			if(textRendererInvalid)
			{
				this.createMessage();
			}

			if(textRendererInvalid || dataInvalid)
			{
				this.messageTextRenderer.text = this._message;
			}

			if(textRendererInvalid || stylesInvalid)
			{
				this.refreshMessageStyles();
			}

			super.draw();

			if(this._icon)
			{
				if(this._icon instanceof IValidating)
				{
					IValidating(this._icon).validate();
				}
				this._icon.x = this._paddingLeft;
				this._icon.y = this._topViewPortOffset + (this._viewPort.height - this._icon.height) / 2;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected autoSizeIfNeeded():boolean
		{
			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				return false;
			}

			if(this._icon instanceof IValidating)
			{
				IValidating(this._icon).validate();
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
				newWidth = this._viewPort.width + this._rightViewPortOffset + this._leftViewPortOffset;
				if(this._icon)
				{
					var iconWidth:number = this._icon.width;
					if(iconWidth === iconWidth) //!isNaN
					{
						newWidth += this._icon.width + this._gap;
					}
				}
				newWidth = Math.max(newWidth, this.header.width);
				if(this.footer)
				{
					newWidth = Math.max(newWidth, this.footer.width);
				}
				if(this.originalBackgroundWidth === this.originalBackgroundWidth && //!isNaN
					this.originalBackgroundWidth > newWidth)
				{
					newWidth = this.originalBackgroundWidth;
				}
			}
			if(needsHeight)
			{
				newHeight = this._viewPort.height;
				if(this._icon)
				{
					var iconHeight:number = this._icon.height;
					if(iconHeight === iconHeight) //!isNaN
					{
						newHeight = Math.max(newHeight, this._icon.height);
					}
				}
				newHeight += this._bottomViewPortOffset + this._topViewPortOffset;
				if(this.originalBackgroundHeight === this.originalBackgroundHeight && //!isNaN
					this.originalBackgroundHeight > newHeight)
				{
					newHeight = this.originalBackgroundHeight;
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
		/*override*/ protected createHeader():void
		{
			super.createHeader();
			this.headerHeader = this.Header(this.header);
		}

		/**
		 * Creates and adds the <code>buttonGroupFooter</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #buttonGroupFooter
		 * @see #buttonGroupFactory
		 * @see #customButtonGroupStyleName
		 */
		protected createButtonGroup():void
		{
			if(this.buttonGroupFooter)
			{
				this.buttonGroupFooter.removeEventListener(Event.TRIGGERED, this.buttonsFooter_triggeredHandler);
			}
			super.createFooter();
			this.buttonGroupFooter = this.ButtonGroup(this.footer);
			this.buttonGroupFooter.addEventListener(Event.TRIGGERED, this.buttonsFooter_triggeredHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected createFooter():void
		{
			this.createButtonGroup();
		}

		/**
		 * Creates and adds the <code>messageTextRenderer</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #message
		 * @see #messageTextRenderer
		 * @see #messageFactory
		 */
		protected createMessage():void
		{
			if(this.messageTextRenderer)
			{
				this.removeChild(DisplayObject(this.messageTextRenderer), true);
				this.messageTextRenderer = null;
			}

			var factory:Function = this._messageFactory != null ? this._messageFactory : FeathersControl.defaultTextRendererFactory;
			this.messageTextRenderer = ITextRenderer(factory());
			var uiTextRenderer:IFeathersControl = IFeathersControl(this.messageTextRenderer);
			uiTextRenderer.styleNameList.add(this.messageName);
			uiTextRenderer.touchable = false;
			this.addChild(DisplayObject(this.messageTextRenderer));
		}

		/**
		 * @private
		 */
		/*override*/ protected refreshFooterStyles():void
		{
			super.refreshFooterStyles();
			this.buttonGroupFooter.dataProvider = this._buttonsDataProvider;
		}

		/**
		 * @private
		 */
		protected refreshMessageStyles():void
		{
			for(var propertyName:string in this._messageProperties)
			{
				var propertyValue:Object = this._messageProperties[propertyName];
				this.messageTextRenderer[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected calculateViewPortOffsets(forceScrollBars:boolean = false, useActualBounds:boolean = false):void
		{
			super.calculateViewPortOffsets(forceScrollBars, useActualBounds);
			if(this._icon)
			{
				if(this._icon instanceof IValidating)
				{
					IValidating(this._icon).validate();
				}
				var iconWidth:number = this._icon.width;
				if(iconWidth == iconWidth) //!isNaN
				{
					this._leftViewPortOffset += this._icon.width + this._gap;
				}
			}
		}

		/**
		 * @private
		 */
		protected buttonsFooter_triggeredHandler(event:Event, data:Object):void
		{
			this.removeFromParent();
			this.dispatchEventWith(Event.CLOSE, false, data);
			this.dispose();
		}

	}
}
