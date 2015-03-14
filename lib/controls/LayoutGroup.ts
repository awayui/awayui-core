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
	import IValidating = feathers.core.IValidating;
	import FeathersEventType = feathers.events.FeathersEventType;
	import ILayout = feathers.layout.ILayout;
	import ILayoutDisplayObject = feathers.layout.ILayoutDisplayObject;
	import IVirtualLayout = feathers.layout.IVirtualLayout;
	import LayoutBoundsResult = feathers.layout.LayoutBoundsResult;
	import ViewPortBounds = feathers.layout.ViewPortBounds;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;

	import RenderSupport = starling.core.RenderSupport;
	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;

	/*[DefaultProperty("mxmlContent")]*/
	/**
	 * A generic container that supports layout. For a container that supports
	 * scrolling and more robust skinning options, see <code>ScrollContainer</code>.
	 *
	 * <p>The following example creates a layout group with a horizontal
	 * layout and adds two buttons to it:</p>
	 *
	 * <listing version="3.0">
	 * var group:LayoutGroup = new LayoutGroup();
	 * var layout:HorizontalLayout = new HorizontalLayout();
	 * layout.gap = 20;
	 * layout.padding = 20;
	 * group.layout = layout;
	 * this.addChild( group );
	 * 
	 * var yesButton:Button = new Button();
	 * yesButton.label = "Yes";
	 * group.addChild( yesButton );
	 * 
	 * var noButton:Button = new Button();
	 * noButton.label = "No";
	 * group.addChild( noButton );</listing>
	 *
	 * @see ../../../help/layout-group.html How to use the Feathers LayoutGroup component
	 * @see feathers.controls.ScrollContainer
	 */
	export class LayoutGroup extends FeathersControl
	{
		/**
		 * @private
		 */
		private static HELPER_RECTANGLE:Rectangle = new Rectangle();

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_MXML_CONTENT:string = "mxmlContent";

		/**
		 * Flag to indicate that the clipping has changed.
		 */
		protected static INVALIDATION_FLAG_CLIPPING:string = "clipping";

		/**
		 * The layout group will auto size itself to fill the entire stage.
		 *
		 * @see #autoSizeMode
		 */
		public static AUTO_SIZE_MODE_STAGE:string = "stage";

		/**
		 * The layout group will auto size itself to fit its content.
		 *
		 * @see #autoSizeMode
		 */
		public static AUTO_SIZE_MODE_CONTENT:string = "content";

		/**
		 * An alternate style name to use with <code>LayoutGroup</code> to
		 * allow a theme to give it a toolbar style. If a theme does not provide
		 * a style for the toolbar container, the theme will automatically fall
		 * back to using the default scroll container skin.
		 *
		 * <p>An alternate style name should always be added to a component's
		 * <code>styleNameList</code> before the component is initialized. If
		 * the style name is added later, it will be ignored.</p>
		 *
		 * <p>In the following example, the toolbar style is applied to a layout
		 * group:</p>
		 *
		 * <listing version="3.0">
		 * var group:LayoutGroup = new LayoutGroup();
		 * group.styleNameList.add( LayoutGroup.ALTERNATE_STYLE_NAME_TOOLBAR );
		 * this.addChild( group );</listing>
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static ALTERNATE_STYLE_NAME_TOOLBAR:string = "feathers-toolbar-layout-group";

		/**
		 * The default <code>IStyleProvider</code> for all <code>LayoutGroup</code>
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
			this.addEventListener(Event.ADDED_TO_STAGE, this.layoutGroup_addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.layoutGroup_removedFromStageHandler);
		}

		/**
		 * The items added to the group.
		 */
		protected items:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * The view port bounds result object passed to the layout. Its values
		 * should be set in <code>refreshViewPortBounds()</code>.
		 */
		protected viewPortBounds:ViewPortBounds = new ViewPortBounds();

		/**
		 * @private
		 */
		protected _layoutResult:LayoutBoundsResult = new LayoutBoundsResult();

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return LayoutGroup.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _layout:ILayout;

		/**
		 * Controls the way that the group's children are positioned and sized.
		 *
		 * <p>The following example tells the group to use a horizontal layout:</p>
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
			if(this._layout)
			{
				this._layout.removeEventListener(Event.CHANGE, this.layout_changeHandler);
			}
			this._layout = value;
			if(this._layout)
			{
				if(this._layout instanceof IVirtualLayout)
				{
					IVirtualLayout(this._layout).useVirtualLayout = false;
				}
				this._layout.addEventListener(Event.CHANGE, this.layout_changeHandler);
				//if we don't have a layout, nothing will need to be redrawn
				this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
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
			this.invalidate(LayoutGroup.INVALIDATION_FLAG_MXML_CONTENT);
		}

		/**
		 * @private
		 */
		protected _clipContent:boolean = false;

		/**
		 * If true, the group will be clipped to its bounds. In other words,
		 * anything appearing beyond the edges of the group will be masked or
		 * hidden.
		 *
		 * <p>Since <code>LayoutGroup</code> is designed to be a light
		 * container focused on performance, clipping is disabled by default.</p>
		 *
		 * <p>In the following example, clipping is enabled:</p>
		 *
		 * <listing version="3.0">
		 * group.clipContent = true;</listing>
		 *
		 * @default false
		 */
		public get clipContent():boolean
		{
			return this._clipContent;
		}

		/**
		 * @private
		 */
		public set clipContent(value:boolean)
		{
			if(this._clipContent == value)
			{
				return;
			}
			this._clipContent = value;
			this.invalidate(LayoutGroup.INVALIDATION_FLAG_CLIPPING);
		}

		/**
		 * @private
		 */
		protected originalBackgroundWidth:number = NaN;

		/**
		 * @private
		 */
		protected originalBackgroundHeight:number = NaN;

		/**
		 * @private
		 */
		protected currentBackgroundSkin:DisplayObject;

		/**
		 * @private
		 */
		protected _backgroundSkin:DisplayObject;

		/**
		 * The default background to display behind all content. The background
		 * skin is resized to fill the full width and height of the layout
		 * group.
		 *
		 * <p>In the following example, the group is given a background skin:</p>
		 *
		 * <listing version="3.0">
		 * group.backgroundSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundSkin():DisplayObject
		{
			return this._backgroundSkin;
		}

		/**
		 * @private
		 */
		public set backgroundSkin(value:DisplayObject)
		{
			if(this._backgroundSkin == value)
			{
				return;
			}
			if(value && value.parent)
			{
				value.removeFromParent();
			}
			this._backgroundSkin = value;
			this.invalidate(this.INVALIDATION_FLAG_SKIN);
		}

		/**
		 * @private
		 */
		protected _backgroundDisabledSkin:DisplayObject;

		/**
		 * The background to display behind all content when the layout group is
		 * disabled. The background skin is resized to fill the full width and
		 * height of the layout group.
		 *
		 * <p>In the following example, the group is given a background skin:</p>
		 *
		 * <listing version="3.0">
		 * group.backgroundDisabledSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundDisabledSkin():DisplayObject
		{
			return this._backgroundDisabledSkin;
		}

		/**
		 * @private
		 */
		public set backgroundDisabledSkin(value:DisplayObject)
		{
			if(this._backgroundDisabledSkin == value)
			{
				return;
			}
			if(value && value.parent)
			{
				value.removeFromParent();
			}
			this._backgroundDisabledSkin = value;
			this.invalidate(this.INVALIDATION_FLAG_SKIN);
		}

		/**
		 * @private
		 */
		protected _autoSizeMode:string = LayoutGroup.AUTO_SIZE_MODE_CONTENT;

		/*[Inspectable(type="String",enumeration="stage,content")]*/
		/**
		 * Determines how the layout group will set its own size when its
		 * dimensions (width and height) aren't set explicitly.
		 *
		 * <p>In the following example, the layout group will be sized to
		 * match the stage:</p>
		 *
		 * <listing version="3.0">
		 * group.autoSizeMode = LayoutGroup.AUTO_SIZE_MODE_STAGE;</listing>
		 *
		 * @default LayoutGroup.AUTO_SIZE_MODE_CONTENT
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
				if(this._autoSizeMode == LayoutGroup.AUTO_SIZE_MODE_STAGE)
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
		protected _ignoreChildChanges:boolean = false;

		/**
		 * @private
		 */
		/*override*/ public addChildAt(child:DisplayObject, index:number):DisplayObject
		{
			if(child instanceof IFeathersControl)
			{
				child.addEventListener(FeathersEventType.RESIZE, this.child_resizeHandler);
			}
			if(child instanceof ILayoutDisplayObject)
			{
				child.addEventListener(FeathersEventType.LAYOUT_DATA_CHANGE, this.child_layoutDataChangeHandler);
			}
			var oldIndex:number = this.items.indexOf(child);
			if(oldIndex == index)
			{
				return child;
			}
			if(oldIndex >= 0)
			{
				this.items.splice(oldIndex, 1);
			}
			var itemCount:number = this.items.length;
			if(index == itemCount)
			{
				//faster than splice because it avoids gc
				this.items[index] = child;
			}
			else
			{
				this.items.splice(index, 0, child);
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
			return super.addChildAt(child, index);
		}

		/**
		 * @private
		 */
		/*override*/ public removeChildAt(index:number, dispose:boolean = false):DisplayObject
		{
			var child:DisplayObject = super.removeChildAt(index, dispose);
			if(child instanceof IFeathersControl)
			{
				child.removeEventListener(FeathersEventType.RESIZE, this.child_resizeHandler);
			}
			if(child instanceof ILayoutDisplayObject)
			{
				child.removeEventListener(FeathersEventType.LAYOUT_DATA_CHANGE, this.child_layoutDataChangeHandler);
			}
			this.items.splice(index, 1);
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
			return child;
		}

		/**
		 * @private
		 */
		/*override*/ public setChildIndex(child:DisplayObject, index:number):void
		{
			super.setChildIndex(child, index);
			var oldIndex:number = this.items.indexOf(child);
			if(oldIndex == index)
			{
				return;
			}

			//the super function already checks if oldIndex < 0, and throws an
			//appropriate error, so no need to do it again!

			this.items.splice(oldIndex, 1);
			this.items.splice(index, 0, child);
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		/*override*/ public swapChildrenAt(index1:number, index2:number):void
		{
			super.swapChildrenAt(index1, index2)
			var child1:DisplayObject = this.items[index1];
			var child2:DisplayObject = this.items[index2];
			this.items[index1] = child2;
			this.items[index2] = child1;
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		/*override*/ public sortChildren(compareFunction:Function):void
		{
			super.sortChildren(compareFunction);
			this.items.sort(compareFunction);
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		/*override*/ public hitTest(localPoint:Point, forTouch:boolean = false):DisplayObject
		{
			var localX:number = localPoint.x;
			var localY:number = localPoint.y;
			var result:DisplayObject = super.hitTest(localPoint, forTouch);
			if(result)
			{
				if(!this._isEnabled)
				{
					return this;
				}
				return result;
			}
			if(forTouch && (!this.visible || !this.touchable))
			{
				return null;
			}
			if(this.currentBackgroundSkin && this._hitArea.contains(localX, localY))
			{
				return this;
			}
			return null;
		}

		/**
		 * @private
		 */
		/*override*/ public render(support:RenderSupport, parentAlpha:number):void
		{
			if(this.currentBackgroundSkin && this.currentBackgroundSkin.hasVisibleArea)
			{
				var clipRect:Rectangle = this.clipRect;
				if(clipRect)
				{
					clipRect = support.pushClipRect(this.getClipRect(this.stage, LayoutGroup.HELPER_RECTANGLE));
					if(clipRect.isEmpty())
					{
						// empty clipping bounds - no need to render children.
						support.popClipRect();
						return;
					}
				}
				var blendMode:string = this.blendMode;
				support.pushMatrix();
				support.transformMatrix(this.currentBackgroundSkin);
				support.blendMode = this.currentBackgroundSkin.blendMode;
				this.currentBackgroundSkin.render(support, parentAlpha * this.alpha);
				support.blendMode = blendMode;
				support.popMatrix();
				if(clipRect)
				{
					support.popClipRect();
				}
			}
			super.render(support, parentAlpha);
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			this.layout = null;
			super.dispose();
		}

		/**
		 * Readjusts the layout of the group according to its current content.
		 * Call this method when changes to the content cannot be automatically
		 * detected by the container. For instance, Feathers components dispatch
		 * <code>FeathersEventType.RESIZE</code> when their width and height
		 * values change, but standard Starling display objects like
		 * <code>Sprite</code> and <code>Image</code> do not.
		 */
		public readjustLayout():void
		{
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			this.refreshMXMLContent();
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var clippingInvalid:boolean = this.isInvalid(LayoutGroup.INVALIDATION_FLAG_CLIPPING);
			//we don't have scrolling, but a subclass might
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
			var skinInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SKIN);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var mxmlContentInvalid:boolean = this.isInvalid(LayoutGroup.INVALIDATION_FLAG_MXML_CONTENT);

			if(mxmlContentInvalid)
			{
				this.refreshMXMLContent();
			}

			//scrolling only affects the layout is requiresLayoutOnScroll is true
			if(!layoutInvalid && scrollInvalid && this._layout && this._layout.requiresLayoutOnScroll)
			{
				layoutInvalid = true;
			}

			if(skinInvalid || stateInvalid)
			{
				this.refreshBackgroundSkin();
			}

			if(sizeInvalid || layoutInvalid || skinInvalid || stateInvalid)
			{
				this.refreshViewPortBounds();
				if(this._layout)
				{
					var oldIgnoreChildChanges:boolean = this._ignoreChildChanges;
					this._ignoreChildChanges = true;
					this._layout.layout(this.items, this.viewPortBounds, this._layoutResult);
					this._ignoreChildChanges = oldIgnoreChildChanges;
				}
				else
				{
					this.handleManualLayout();
				}
				var width:number = this._layoutResult.contentWidth;
				if(this.originalBackgroundWidth === this.originalBackgroundWidth && //!isNaN
					this.originalBackgroundWidth > width)
				{
					width = this.originalBackgroundWidth;
				}
				var height:number = this._layoutResult.contentHeight;
				if(this.originalBackgroundHeight === this.originalBackgroundHeight && //!isNaN
					this.originalBackgroundHeight > height)
				{
					height = this.originalBackgroundHeight;
				}
				if(this._autoSizeMode == LayoutGroup.AUTO_SIZE_MODE_STAGE)
				{
					width = this.stage.stageWidth;
					height = this.stage.stageHeight;
				}
				sizeInvalid = this.setSizeInternal(width, height, false) || sizeInvalid;
				if(this.currentBackgroundSkin)
				{
					this.currentBackgroundSkin.width = this.actualWidth;
					this.currentBackgroundSkin.height = this.actualHeight;
				}

				//final validation to avoid juggler next frame issues
				this.validateChildren();
			}

			if(sizeInvalid || clippingInvalid)
			{
				this.refreshClipRect();
			}
		}

		/**
		 * Choose the appropriate background skin based on the control's current
		 * state.
		 */
		protected refreshBackgroundSkin():void
		{
			if(!this._isEnabled && this._backgroundDisabledSkin)
			{
				this.currentBackgroundSkin = this._backgroundDisabledSkin;
			}
			else
			{
				this.currentBackgroundSkin = this._backgroundSkin
			}
			if(this.currentBackgroundSkin)
			{
				if(this.originalBackgroundWidth !== this.originalBackgroundWidth ||
					this.originalBackgroundHeight !== this.originalBackgroundHeight) //isNaN
				{
					if(this.currentBackgroundSkin instanceof IValidating)
					{
						IValidating(this.currentBackgroundSkin).validate();
					}
					this.originalBackgroundWidth = this.currentBackgroundSkin.width;
					this.originalBackgroundHeight = this.currentBackgroundSkin.height;
				}
			}
		}

		/**
		 * Refreshes the values in the <code>viewPortBounds</code> variable that
		 * is passed to the layout.
		 */
		protected refreshViewPortBounds():void
		{
			this.viewPortBounds.x = 0;
			this.viewPortBounds.y = 0;
			this.viewPortBounds.scrollX = 0;
			this.viewPortBounds.scrollY = 0;
			if(this._autoSizeMode == LayoutGroup.AUTO_SIZE_MODE_STAGE &&
				this.explicitWidth !== this.explicitWidth)
			{
				this.viewPortBounds.explicitWidth = this.stage.stageWidth;
			}
			else
			{
				this.viewPortBounds.explicitWidth = this.explicitWidth;
			}
			if(this._autoSizeMode == LayoutGroup.AUTO_SIZE_MODE_STAGE &&
					this.explicitHeight !== this.explicitHeight)
			{
				this.viewPortBounds.explicitHeight = this.stage.stageHeight;
			}
			else
			{
				this.viewPortBounds.explicitHeight = this.explicitHeight;
			}
			this.viewPortBounds.minWidth = this._minWidth;
			this.viewPortBounds.minHeight = this._minHeight;
			this.viewPortBounds.maxWidth = this._maxWidth;
			this.viewPortBounds.maxHeight = this._maxHeight;
		}

		/**
		 * @private
		 */
		protected handleManualLayout():void
		{
			var maxX:number = this.viewPortBounds.explicitWidth;
			if(maxX !== maxX) //isNaN
			{
				maxX = 0;
			}
			var maxY:number = this.viewPortBounds.explicitHeight;
			if(maxY !== maxY) //isNaN
			{
				maxY = 0;
			}
			var oldIgnoreChildChanges:boolean = this._ignoreChildChanges;
			this._ignoreChildChanges = true;
			var itemCount:number = this.items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = this.items[i];
				if(item instanceof ILayoutDisplayObject && !ILayoutDisplayObject(item).includeInLayout)
				{
					continue;
				}
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
				var itemMaxX:number = item.x + item.width;
				var itemMaxY:number = item.y + item.height;
				if(itemMaxX === itemMaxX && //!isNaN
					itemMaxX > maxX)
				{
					maxX = itemMaxX;
				}
				if(itemMaxY === itemMaxY && //!isNaN
					itemMaxY > maxY)
				{
					maxY = itemMaxY;
				}
			}
			this._ignoreChildChanges = oldIgnoreChildChanges;
			this._layoutResult.contentX = 0;
			this._layoutResult.contentY = 0;
			this._layoutResult.contentWidth = maxX;
			this._layoutResult.contentHeight = maxY;
			this._layoutResult.viewPortWidth = maxX;
			this._layoutResult.viewPortHeight = maxY;
		}

		/**
		 * @private
		 */
		protected validateChildren():void
		{
			if(this.currentBackgroundSkin instanceof IValidating)
			{
				IValidating(this.currentBackgroundSkin).validate();
			}
			var itemCount:number = this.items.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:DisplayObject = this.items[i];
				if(item instanceof IValidating)
				{
					IValidating(item).validate();
				}
			}
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
		protected refreshClipRect():void
		{
			if(this._clipContent)
			{
				if(!this.clipRect)
				{
					this.clipRect = new Rectangle();
				}

				var clipRect:Rectangle = this.clipRect;
				clipRect.x = 0;
				clipRect.y = 0;
				clipRect.width = this.actualWidth;
				clipRect.height = this.actualHeight;
				this.clipRect = clipRect;
			}
			else
			{
				this.clipRect = null;
			}
		}

		/**
		 * @private
		 */
		protected layoutGroup_addedToStageHandler(event:Event):void
		{
			if(this._autoSizeMode == LayoutGroup.AUTO_SIZE_MODE_STAGE)
			{
				this.stage.addEventListener(Event.RESIZE, this.stage_resizeHandler);
			}
		}

		/**
		 * @private
		 */
		protected layoutGroup_removedFromStageHandler(event:Event):void
		{
			this.stage.removeEventListener(Event.RESIZE, this.stage_resizeHandler);
		}

		/**
		 * @private
		 */
		protected layout_changeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
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
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
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
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected stage_resizeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}
	}
}
