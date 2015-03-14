/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import LayoutViewPort = feathers.controls.supportClasses.LayoutViewPort;
	import IFeathersControl = feathers.core.IFeathersControl;
	import IFocusContainer = feathers.core.IFocusContainer;
	import FeathersEventType = feathers.events.FeathersEventType;
	import ILayout = feathers.layout.ILayout;
	import ILayoutDisplayObject = feathers.layout.ILayoutDisplayObject;
	import IVirtualLayout = feathers.layout.IVirtualLayout;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import DisplayObject = starling.display.DisplayObject;
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;
	import Event = starling.events.Event;

	/**
	 * Dispatched when the container is scrolled.
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
	 * @eventType starling.events.Event.SCROLL
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/*[DefaultProperty("mxmlContent")]*/
	/**
	 * A generic container that supports layout, scrolling, and a background
	 * skin. For a lighter container, see <code>LayoutGroup</code>, which
	 * focuses specifically on layout without scrolling.
	 *
	 * <p>The following example creates a scroll container with a horizontal
	 * layout and adds two buttons to it:</p>
	 *
	 * <listing version="3.0">
	 * var container:ScrollContainer = new ScrollContainer();
	 * var layout:HorizontalLayout = new HorizontalLayout();
	 * layout.gap = 20;
	 * layout.padding = 20;
	 * container.layout = layout;
	 * this.addChild( container );
	 * 
	 * var yesButton:Button = new Button();
	 * yesButton.label = "Yes";
	 * container.addChild( yesButton );
	 * 
	 * var noButton:Button = new Button();
	 * noButton.label = "No";
	 * container.addChild( noButton );</listing>
	 *
	 * @see ../../../help/scroll-container.html How to use the Feathers ScrollContainer component
	 * @see feathers.controls.LayoutGroup
	 */
	export class ScrollContainer extends Scroller implements IScrollContainer, IFocusContainer
	{
		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_MXML_CONTENT:string = "mxmlContent";

		/**
		 * An alternate style name to use with <code>ScrollContainer</code> to
		 * allow a theme to give it a toolbar style. If a theme does not provide
		 * a style for the toolbar container, the theme will automatically fall
		 * back to using the default scroll container skin.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the toolbar style is applied to a scroll
		 * container:</p>
		 *
		 * <listing version="3.0">
		 * var container:ScrollContainer = new ScrollContainer();
		 * container.styleNameList.add( ScrollContainer.ALTERNATE_STYLE_NAME_TOOLBAR );
		 * this.addChild( container );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_TOOLBAR:string = "feathers-toolbar-scroll-container";

		/**
		 * DEPRECATED: Replaced by <code>ScrollContainer.ALTERNATE_STYLE_NAME_TOOLBAR</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ScrollContainer#ALTERNATE_STYLE_NAME_TOOLBAR
		 */
		public static ALTERNATE_NAME_TOOLBAR:string = ScrollContainer.ALTERNATE_STYLE_NAME_TOOLBAR;

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
		 * The container will auto size itself to fill the entire stage.
		 *
		 * @see #autoSizeMode
		 */
		public static AUTO_SIZE_MODE_STAGE:string = "stage";

		/**
		 * The container will auto size itself to fit its content.
		 *
		 * @see #autoSizeMode
		 */
		public static AUTO_SIZE_MODE_CONTENT:string = "content";

		/**
		 * The default <code>IStyleProvider</code> for all <code>ScrollContainer</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.layoutViewPort = new LayoutViewPort();
			this.viewPort = this.layoutViewPort;
			this.addEventListener(Event.ADDED_TO_STAGE, this.scrollContainer_addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.scrollContainer_removedFromStageHandler);
		}

		/**
		 * A flag that indicates if the display list functions like <code>addChild()</code>
		 * and <code>removeChild()</code> will be passed to the internal view
		 * port.
		 */
		protected displayListBypassEnabled:boolean = true;

		/**
		 * @private
		 */
		protected layoutViewPort:LayoutViewPort;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return ScrollContainer.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _isChildFocusEnabled:boolean = true;

		/**
		 * @copy feathers.core.IFocusContainer#isChildFocusEnabled
		 *
		 * @default true
		 *
		 * @see #isFocusEnabled
		 */
		public get isChildFocusEnabled():boolean
		{
			return this._isEnabled && this._isChildFocusEnabled;
		}

		/**
		 * @private
		 */
		public set isChildFocusEnabled(value:boolean)
		{
			this._isChildFocusEnabled = value;
		}

		/**
		 * @private
		 */
		protected _layout:ILayout;

		/**
		 * Controls the way that the container's children are positioned and
		 * sized.
		 *
		 * <p>The following example tells the container to use a horizontal layout:</p>
		 *
		 * <listing version="3.0">
		 * var layout:HorizontalLayout = new HorizontalLayout();
		 * layout.gap = 20;
		 * layout.padding = 20;
		 * container.layout = layout;</listing>
		 *
		 * @default null
		 */
		public get layout():ILayout
		{
			return this._layout;
		}

		/**
		 * @private
		 */
		public set layout(value:ILayout)
		{
			if(this._layout == value)
			{
				return;
			}
			this._layout = value;
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected _autoSizeMode:string = ScrollContainer.AUTO_SIZE_MODE_CONTENT;

		/*[Inspectable(type="String",enumeration="stage,content")]*/
		/**
		 * Determines how the container will set its own size when its
		 * dimensions (width and height) aren't set explicitly.
		 *
		 * <p>In the following example, the container will be sized to
		 * match the stage:</p>
		 *
		 * <listing version="3.0">
		 * container.autoSizeMode = ScrollContainer.AUTO_SIZE_MODE_STAGE;</listing>
		 *
		 * @default ScrollContainer.AUTO_SIZE_MODE_CONTENT
		 *
		 * @see #AUTO_SIZE_MODE_STAGE
		 * @see #AUTO_SIZE_MODE_CONTENT
		 */
		public get autoSizeMode():string
		{
			return this._autoSizeMode;
		}

		/**
		 * @private
		 */
		public set autoSizeMode(value:string)
		{
			if(this._autoSizeMode == value)
			{
				return;
			}
			this._autoSizeMode = value;
			if(this.stage)
			{
				if(this._autoSizeMode == ScrollContainer.AUTO_SIZE_MODE_STAGE)
				{
					this.stage.addEventListener(Event.RESIZE, this.stage_resizeHandler);
				}
				else
				{
					this.stage.removeEventListener(Event.RESIZE, this.stage_resizeHandler);
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _mxmlContentIsReady:boolean = false;

		/**
		 * @private
		 */
		protected _mxmlContent:any[];

		/*[ArrayElementType("feathers.core.IFeathersControl")]*/
		/**
		 * @private
		 */
		public get mxmlContent():any[]
		{
			return this._mxmlContent;
		}

		/**
		 * @private
		 */
		public set mxmlContent(value:any[])
		{
			if(this._mxmlContent == value)
			{
				return;
			}
			if(this._mxmlContent && this._mxmlContentIsReady)
			{
				var childCount:number = this._mxmlContent.length;
				for(var i:number = 0; i < childCount; i++)
				{
					var child:DisplayObject = DisplayObject(this._mxmlContent[i]);
					this.removeChild(child, true);
				}
			}
			this._mxmlContent = value;
			this._mxmlContentIsReady = false;
			this.invalidate(ScrollContainer.INVALIDATION_FLAG_MXML_CONTENT);
		}

		/**
		 * @private
		 */
		protected _ignoreChildChanges:boolean = false;

		/**
		 * @private
		 */
		/*override*/ public get numChildren():number
		{
			if(!this.displayListBypassEnabled)
			{
				return super.numChildren;
			}
			return DisplayObjectContainer(this.viewPort).numChildren;
		}

		/**
		 * @inheritDoc
		 */
		public get numRawChildren():number
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			var result:number = super.numChildren;
			this.displayListBypassEnabled = oldBypass;
			return result;
		}

		/**
		 * @private
		 */
		/*override*/ public getChildByName(name:string):DisplayObject
		{
			if(!this.displayListBypassEnabled)
			{
				return super.getChildByName(name);
			}
			return DisplayObjectContainer(this.viewPort).getChildByName(name);
		}

		/**
		 * @inheritDoc
		 */
		public getRawChildByName(name:string):DisplayObject
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			var child:DisplayObject = super.getChildByName(name);
			this.displayListBypassEnabled = oldBypass;
			return child;
		}

		/**
		 * @private
		 */
		/*override*/ public getChildAt(index:number):DisplayObject
		{
			if(!this.displayListBypassEnabled)
			{
				return super.getChildAt(index);
			}
			return DisplayObjectContainer(this.viewPort).getChildAt(index);
		}

		/**
		 * @inheritDoc
		 */
		public getRawChildAt(index:number):DisplayObject
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			var child:DisplayObject = super.getChildAt(index);
			this.displayListBypassEnabled = oldBypass;
			return child;
		}

		/**
		 * @inheritDoc
		 */
		public addRawChild(child:DisplayObject):DisplayObject
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			if(child.parent == this)
			{
				super.setChildIndex(child, super.numChildren);
			}
			else
			{
				child = super.addChildAt(child, super.numChildren);
			}
			this.displayListBypassEnabled = oldBypass;
			return child;
		}

		/**
		 * @private
		 */
		/*override*/ public addChildAt(child:DisplayObject, index:number):DisplayObject
		{
			if(!this.displayListBypassEnabled)
			{
				return super.addChildAt(child, index);
			}
			var result:DisplayObject = DisplayObjectContainer(this.viewPort).addChildAt(child, index);
			if(result instanceof IFeathersControl)
			{
				result.addEventListener(Event.RESIZE, this.child_resizeHandler);
			}
			if(result instanceof ILayoutDisplayObject)
			{
				result.addEventListener(FeathersEventType.LAYOUT_DATA_CHANGE, this.child_layoutDataChangeHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
			return result;
		}

		/**
		 * @inheritDoc
		 */
		public addRawChildAt(child:DisplayObject, index:number):DisplayObject
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			child = super.addChildAt(child, index);
			this.displayListBypassEnabled = oldBypass;
			return child;
		}

		/**
		 * @inheritDoc
		 */
		public removeRawChild(child:DisplayObject, dispose:boolean = false):DisplayObject
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			var index:number = super.getChildIndex(child);
			if(index >= 0)
			{
				super.removeChildAt(index, dispose);
			}
			this.displayListBypassEnabled = oldBypass;
			return child;
		}

		/**
		 * @private
		 */
		/*override*/ public removeChildAt(index:number, dispose:boolean = false):DisplayObject
		{
			if(!this.displayListBypassEnabled)
			{
				return super.removeChildAt(index, dispose);
			}
			var result:DisplayObject = DisplayObjectContainer(this.viewPort).removeChildAt(index, dispose);
			if(result instanceof IFeathersControl)
			{
				result.removeEventListener(Event.RESIZE, this.child_resizeHandler);
			}
			if(result instanceof ILayoutDisplayObject)
			{
				result.removeEventListener(FeathersEventType.LAYOUT_DATA_CHANGE, this.child_layoutDataChangeHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
			return result;
		}

		/**
		 * @inheritDoc
		 */
		public removeRawChildAt(index:number, dispose:boolean = false):DisplayObject
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			var child:DisplayObject =  super.removeChildAt(index, dispose);
			this.displayListBypassEnabled = oldBypass;
			return child;
		}

		/**
		 * @private
		 */
		/*override*/ public getChildIndex(child:DisplayObject):number
		{
			if(!this.displayListBypassEnabled)
			{
				return super.getChildIndex(child);
			}
			return DisplayObjectContainer(this.viewPort).getChildIndex(child);
		}

		/**
		 * @inheritDoc
		 */
		public getRawChildIndex(child:DisplayObject):number
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			return super.getChildIndex(child);
			this.displayListBypassEnabled = oldBypass;
		}

		/**
		 * @private
		 */
		/*override*/ public setChildIndex(child:DisplayObject, index:number):void
		{
			if(!this.displayListBypassEnabled)
			{
				super.setChildIndex(child, index);
				return;
			}
			DisplayObjectContainer(this.viewPort).setChildIndex(child, index);
		}

		/**
		 * @inheritDoc
		 */
		public setRawChildIndex(child:DisplayObject, index:number):void
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			super.setChildIndex(child, index);
			this.displayListBypassEnabled = oldBypass;
		}

		/**
		 * @inheritDoc
		 */
		public swapRawChildren(child1:DisplayObject, child2:DisplayObject):void
		{
			var index1:number = this.getRawChildIndex(child1);
			var index2:number = this.getRawChildIndex(child2);
			if(index1 < 0 || index2 < 0)
			{
				throw new ArgumentError("Not a child of this container");
			}
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			this.swapRawChildrenAt(index1, index2);
			this.displayListBypassEnabled = oldBypass;
		}

		/**
		 * @private
		 */
		/*override*/ public swapChildrenAt(index1:number, index2:number):void
		{
			if(!this.displayListBypassEnabled)
			{
				super.swapChildrenAt(index1, index2);
				return;
			}
			DisplayObjectContainer(this.viewPort).swapChildrenAt(index1, index2);
		}

		/**
		 * @inheritDoc
		 */
		public swapRawChildrenAt(index1:number, index2:number):void
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			super.swapChildrenAt(index1, index2);
			this.displayListBypassEnabled = oldBypass;
		}

		/**
		 * @private
		 */
		/*override*/ public sortChildren(compareFunction:Function):void
		{
			if(!this.displayListBypassEnabled)
			{
				super.sortChildren(compareFunction);
				return;
			}
			DisplayObjectContainer(this.viewPort).sortChildren(compareFunction);
		}

		/**
		 * @inheritDoc
		 */
		public sortRawChildren(compareFunction:Function):void
		{
			var oldBypass:boolean = this.displayListBypassEnabled;
			this.displayListBypassEnabled = false;
			super.sortChildren(compareFunction);
			this.displayListBypassEnabled = oldBypass;
		}

		/**
		 * Readjusts the layout of the container according to its current
		 * content. Call this method when changes to the content cannot be
		 * automatically detected by the container. For instance, Feathers
		 * components dispatch <code>FeathersEventType.RESIZE</code> when their
		 * width and height values change, but standard Starling display objects
		 * like <code>Sprite</code> and <code>Image</code> do not.
		 */
		public readjustLayout():void
		{
			this.layoutViewPort.readjustLayout();
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			super.initialize();
			this.refreshMXMLContent();
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);
			var mxmlContentInvalid:boolean = this.isInvalid(ScrollContainer.INVALIDATION_FLAG_MXML_CONTENT);

			if(mxmlContentInvalid)
			{
				this.refreshMXMLContent();
			}

			if(layoutInvalid)
			{
				if(this._layout instanceof IVirtualLayout)
				{
					IVirtualLayout(this._layout).useVirtualLayout = false;
				}
				this.layoutViewPort.layout = this._layout;
			}

			var oldIgnoreChildChanges:boolean = this._ignoreChildChanges;
			this._ignoreChildChanges = true;
			super.draw();
			this._ignoreChildChanges = oldIgnoreChildChanges;
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
			if(this._autoSizeMode == ScrollContainer.AUTO_SIZE_MODE_STAGE)
			{
				return this.setSizeInternal(this.stage.stageWidth, this.stage.stageHeight, false);
			}
			return super.autoSizeIfNeeded();
		}

		/**
		 * @private
		 */
		protected refreshMXMLContent():void
		{
			if(!this._mxmlContent || this._mxmlContentIsReady)
			{
				return;
			}
			var childCount:number = this._mxmlContent.length;
			for(var i:number = 0; i < childCount; i++)
			{
				var child:DisplayObject = DisplayObject(this._mxmlContent[i]);
				this.addChild(child);
			}
			this._mxmlContentIsReady = true;
		}

		/**
		 * @private
		 */
		protected scrollContainer_addedToStageHandler(event:Event):void
		{
			if(this._autoSizeMode == ScrollContainer.AUTO_SIZE_MODE_STAGE)
			{
				this.stage.addEventListener(Event.RESIZE, this.stage_resizeHandler);
			}
		}

		/**
		 * @private
		 */
		protected scrollContainer_removedFromStageHandler(event:Event):void
		{
			this.stage.removeEventListener(Event.RESIZE, this.stage_resizeHandler);
		}

		/**
		 * @private
		 */
		protected child_resizeHandler(event:Event):void
		{
			if(this._ignoreChildChanges)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected child_layoutDataChangeHandler(event:Event):void
		{
			if(this._ignoreChildChanges)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected stage_resizeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}
	}
}
