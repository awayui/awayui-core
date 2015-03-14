/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.supportClasses
{
	import List = feathers.controls.List;
	import Scroller = feathers.controls.Scroller;
	import IListItemRenderer = feathers.controls.renderers.IListItemRenderer;
	import FeathersControl = feathers.core.FeathersControl;
	import IFeathersControl = feathers.core.IFeathersControl;
	import PropertyProxy = feathers.core.PropertyProxy;
	import ListCollection = feathers.data.ListCollection;
	import CollectionEventType = feathers.events.CollectionEventType;
	import FeathersEventType = feathers.events.FeathersEventType;
	import ILayout = feathers.layout.ILayout;
	import ITrimmedVirtualLayout = feathers.layout.ITrimmedVirtualLayout;
	import IVariableVirtualLayout = feathers.layout.IVariableVirtualLayout;
	import IVirtualLayout = feathers.layout.IVirtualLayout;
	import LayoutBoundsResult = feathers.layout.LayoutBoundsResult;
	import ViewPortBounds = feathers.layout.ViewPortBounds;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import Point = flash.geom.Point;
	import Dictionary = flash.utils.Dictionary;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * @private
	 * Used internally by List. Not meant to be used on its own.
	 */
	export class ListDataViewPort extends FeathersControl implements IViewPort
	{
		private static INVALIDATION_FLAG_ITEM_RENDERER_FACTORY:string = "itemRendererFactory";

		private static HELPER_POINT:Point = new Point();
		private static HELPER_VECTOR:number[] = new Array<number>();

		constructor()
		{
			super();
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.removedFromStageHandler);
			this.addEventListener(TouchEvent.TOUCH, this.touchHandler);
		}

		private touchPointID:number = -1;

		private _viewPortBounds:ViewPortBounds = new ViewPortBounds();

		private _layoutResult:LayoutBoundsResult = new LayoutBoundsResult();

		private _minVisibleWidth:number = 0;

		public get minVisibleWidth():number
		{
			return this._minVisibleWidth;
		}

		public set minVisibleWidth(value:number)
		{
			if(this._minVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleWidth cannot be NaN");
			}
			this._minVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _maxVisibleWidth:number = Number.POSITIVE_INFINITY;

		public get maxVisibleWidth():number
		{
			return this._maxVisibleWidth;
		}

		public set maxVisibleWidth(value:number)
		{
			if(this._maxVisibleWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleWidth cannot be NaN");
			}
			this._maxVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private actualVisibleWidth:number = 0;

		private explicitVisibleWidth:number = NaN;

		public get visibleWidth():number
		{
			return this.actualVisibleWidth;
		}

		public set visibleWidth(value:number)
		{
			if(this.explicitVisibleWidth == value ||
				(value !== value && this.explicitVisibleWidth !== this.explicitVisibleWidth)) //isNaN
			{
				return;
			}
			this.explicitVisibleWidth = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _minVisibleHeight:number = 0;

		public get minVisibleHeight():number
		{
			return this._minVisibleHeight;
		}

		public set minVisibleHeight(value:number)
		{
			if(this._minVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minVisibleHeight cannot be NaN");
			}
			this._minVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private _maxVisibleHeight:number = Number.POSITIVE_INFINITY;

		public get maxVisibleHeight():number
		{
			return this._maxVisibleHeight;
		}

		public set maxVisibleHeight(value:number)
		{
			if(this._maxVisibleHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxVisibleHeight cannot be NaN");
			}
			this._maxVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		private actualVisibleHeight:number = 0;

		private explicitVisibleHeight:number = NaN;

		public get visibleHeight():number
		{
			return this.actualVisibleHeight;
		}

		public set visibleHeight(value:number)
		{
			if(this.explicitVisibleHeight == value ||
				(value !== value && this.explicitVisibleHeight !== this.explicitVisibleHeight)) //isNaN
			{
				return;
			}
			this.explicitVisibleHeight = value;
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		protected _contentX:number = 0;

		public get contentX():number
		{
			return this._contentX;
		}

		protected _contentY:number = 0;

		public get contentY():number
		{
			return this._contentY;
		}

		private _typicalItemIsInDataProvider:boolean = false;
		private _typicalItemRenderer:IListItemRenderer;
		private _unrenderedData:any[] = [];
		private _layoutItems:DisplayObject[] = new Array<DisplayObject>();
		private _inactiveRenderers:IListItemRenderer[] = new Array<IListItemRenderer>();
		private _activeRenderers:IListItemRenderer[] = new Array<IListItemRenderer>();
		private _rendererMap:Dictionary = new Dictionary(true);

		private _layoutIndexOffset:number = 0;

		private _isScrolling:boolean = false;

		private _owner:List;

		public get owner():List
		{
			return this._owner;
		}

		public set owner(value:List)
		{
			if(this._owner == value)
			{
				return;
			}
			if(this._owner)
			{
				this._owner.removeEventListener(FeathersEventType.SCROLL_START, this.owner_scrollStartHandler);
			}
			this._owner = value;
			if(this._owner)
			{
				this._owner.addEventListener(FeathersEventType.SCROLL_START, this.owner_scrollStartHandler);
			}
		}

		private _updateForDataReset:boolean = false;

		private _dataProvider:ListCollection;

		public get dataProvider():ListCollection
		{
			return this._dataProvider;
		}

		public set dataProvider(value:ListCollection)
		{
			if(this._dataProvider == value)
			{
				return;
			}
			if(this._dataProvider)
			{
				this._dataProvider.removeEventListener(Event.CHANGE, this.dataProvider_changeHandler);
				this._dataProvider.removeEventListener(CollectionEventType.RESET, this.dataProvider_resetHandler);
				this._dataProvider.removeEventListener(CollectionEventType.ADD_ITEM, this.dataProvider_addItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.REMOVE_ITEM, this.dataProvider_removeItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.REPLACE_ITEM, this.dataProvider_replaceItemHandler);
				this._dataProvider.removeEventListener(CollectionEventType.UPDATE_ITEM, this.dataProvider_updateItemHandler);
			}
			this._dataProvider = value;
			if(this._dataProvider)
			{
				this._dataProvider.addEventListener(Event.CHANGE, this.dataProvider_changeHandler);
				this._dataProvider.addEventListener(CollectionEventType.RESET, this.dataProvider_resetHandler);
				this._dataProvider.addEventListener(CollectionEventType.ADD_ITEM, this.dataProvider_addItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.REMOVE_ITEM, this.dataProvider_removeItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.REPLACE_ITEM, this.dataProvider_replaceItemHandler);
				this._dataProvider.addEventListener(CollectionEventType.UPDATE_ITEM, this.dataProvider_updateItemHandler);
			}
			if(this._layout instanceof IVariableVirtualLayout)
			{
				IVariableVirtualLayout(this._layout).resetVariableVirtualCache();
			}
			this._updateForDataReset = true;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		private _itemRendererType:Class;

		public get itemRendererType():Class
		{
			return this._itemRendererType;
		}

		public set itemRendererType(value:Class)
		{
			if(this._itemRendererType == value)
			{
				return;
			}

			this._itemRendererType = value;
			this.invalidate(ListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _itemRendererFactory:Function;

		public get itemRendererFactory():Function
		{
			return this._itemRendererFactory;
		}

		public set itemRendererFactory(value:Function)
		{
			if(this._itemRendererFactory === value)
			{
				return;
			}

			this._itemRendererFactory = value;
			this.invalidate(ListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _customItemRendererStyleName:string;

		public get customItemRendererStyleName():string
		{
			return this._customItemRendererStyleName;
		}

		public set customItemRendererStyleName(value:string)
		{
			if(this._customItemRendererStyleName == value)
			{
				return;
			}
			this._customItemRendererStyleName = value;
			this.invalidate(ListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _typicalItem:Object = null;

		public get typicalItem():Object
		{
			return this._typicalItem;
		}

		public set typicalItem(value:Object)
		{
			if(this._typicalItem == value)
			{
				return;
			}
			this._typicalItem = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		private _itemRendererProperties:PropertyProxy;

		public get itemRendererProperties():PropertyProxy
		{
			return this._itemRendererProperties;
		}

		public set itemRendererProperties(value:PropertyProxy)
		{
			if(this._itemRendererProperties == value)
			{
				return;
			}
			if(this._itemRendererProperties)
			{
				this._itemRendererProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._itemRendererProperties = PropertyProxy(value);
			if(this._itemRendererProperties)
			{
				this._itemRendererProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		private _ignoreLayoutChanges:boolean = false;
		private _ignoreRendererResizing:boolean = false;

		private _layout:ILayout;

		public get layout():ILayout
		{
			return this._layout;
		}

		public set layout(value:ILayout)
		{
			if(this._layout == value)
			{
				return;
			}
			if(this._layout)
			{
				EventDispatcher(this._layout).removeEventListener(Event.CHANGE, this.layout_changeHandler);
			}
			this._layout = value;
			if(this._layout)
			{
				if(this._layout instanceof IVariableVirtualLayout)
				{
					IVariableVirtualLayout(this._layout).resetVariableVirtualCache();
				}
				EventDispatcher(this._layout).addEventListener(Event.CHANGE, this.layout_changeHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		public get horizontalScrollStep():number
		{
			if(this._activeRenderers.length == 0)
			{
				return 0;
			}
			var itemRenderer:IListItemRenderer = this._activeRenderers[0];
			var itemRendererWidth:number = itemRenderer.width;
			var itemRendererHeight:number = itemRenderer.height;
			if(itemRendererWidth < itemRendererHeight)
			{
				return itemRendererWidth;
			}
			return itemRendererHeight;
		}

		public get verticalScrollStep():number
		{
			if(this._activeRenderers.length == 0)
			{
				return 0;
			}
			var itemRenderer:IListItemRenderer = this._activeRenderers[0];
			var itemRendererWidth:number = itemRenderer.width;
			var itemRendererHeight:number = itemRenderer.height;
			if(itemRendererWidth < itemRendererHeight)
			{
				return itemRendererWidth;
			}
			return itemRendererHeight;
		}

		private _horizontalScrollPosition:number = 0;

		public get horizontalScrollPosition():number
		{
			return this._horizontalScrollPosition;
		}

		public set horizontalScrollPosition(value:number)
		{
			if(this._horizontalScrollPosition == value)
			{
				return;
			}
			this._horizontalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		private _verticalScrollPosition:number = 0;

		public get verticalScrollPosition():number
		{
			return this._verticalScrollPosition;
		}

		public set verticalScrollPosition(value:number)
		{
			if(this._verticalScrollPosition == value)
			{
				return;
			}
			this._verticalScrollPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_SCROLL);
		}

		private _ignoreSelectionChanges:boolean = false;

		private _isSelectable:boolean = true;

		public get isSelectable():boolean
		{
			return this._isSelectable;
		}

		public set isSelectable(value:boolean)
		{
			if(this._isSelectable == value)
			{
				return;
			}
			this._isSelectable = value;
			if(!value)
			{
				this.selectedIndices = null;
			}
		}

		private _allowMultipleSelection:boolean = false;

		public get allowMultipleSelection():boolean
		{
			return this._allowMultipleSelection;
		}

		public set allowMultipleSelection(value:boolean)
		{
			this._allowMultipleSelection = value;
		}

		private _selectedIndices:ListCollection;

		public get selectedIndices():ListCollection
		{
			return this._selectedIndices;
		}

		public set selectedIndices(value:ListCollection)
		{
			if(this._selectedIndices == value)
			{
				return;
			}
			if(this._selectedIndices)
			{
				this._selectedIndices.removeEventListener(Event.CHANGE, this.selectedIndices_changeHandler);
			}
			this._selectedIndices = value;
			if(this._selectedIndices)
			{
				this._selectedIndices.addEventListener(Event.CHANGE, this.selectedIndices_changeHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		public getScrollPositionForIndex(index:number, result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}
			return this._layout.getScrollPositionForIndex(index, this._layoutItems,
				0, 0, this.actualVisibleWidth, this.actualVisibleHeight, result);
		}

		public getNearestScrollPositionForIndex(index:number, result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}
			return this._layout.getNearestScrollPositionForIndex(index,
				this._horizontalScrollPosition, this._verticalScrollPosition,
				this._layoutItems, 0, 0, this.actualVisibleWidth, this.actualVisibleHeight, result);
		}

		/*override*/ public dispose():void
		{
			this.owner = null;
			this.layout = null;
			this.dataProvider = null;
			super.dispose();
		}

		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var selectionInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SELECTED);
			var itemRendererInvalid:boolean = this.isInvalid(ListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);

			//scrolling only affects the layout is requiresLayoutOnScroll is true
			if(!layoutInvalid && scrollInvalid && this._layout && this._layout.requiresLayoutOnScroll)
			{
				layoutInvalid = true;
			}

			var basicsInvalid:boolean = sizeInvalid || dataInvalid || layoutInvalid || itemRendererInvalid;

			var oldIgnoreRendererResizing:boolean = this._ignoreRendererResizing;
			this._ignoreRendererResizing = true;
			var oldIgnoreLayoutChanges:boolean = this._ignoreLayoutChanges;
			this._ignoreLayoutChanges = true;

			if(scrollInvalid || sizeInvalid)
			{
				this.refreshViewPortBounds();
			}
			if(basicsInvalid)
			{
				this.refreshInactiveRenderers(itemRendererInvalid);
			}
			if(dataInvalid || layoutInvalid || itemRendererInvalid)
			{
				this.refreshLayoutTypicalItem();
			}
			if(basicsInvalid)
			{
				this.refreshRenderers();
			}
			if(stylesInvalid || basicsInvalid)
			{
				this.refreshItemRendererStyles();
			}
			if(selectionInvalid || basicsInvalid)
			{
				//unlike resizing renderers and layout changes, we only want to
				//stop listening for selection changes when we're forcibly
				//updating selection. other property changes on item renderers
				//can validly change selection, and we need to detect that.
				var oldIgnoreSelectionChanges:boolean = this._ignoreSelectionChanges;
				this._ignoreSelectionChanges = true;
				this.refreshSelection();
				this._ignoreSelectionChanges = oldIgnoreSelectionChanges;
			}
			if(stateInvalid || basicsInvalid)
			{
				this.refreshEnabled();
			}
			this._ignoreLayoutChanges = oldIgnoreLayoutChanges;

			if(stateInvalid || selectionInvalid || stylesInvalid || basicsInvalid)
			{
				this._layout.layout(this._layoutItems, this._viewPortBounds, this._layoutResult);
			}

			this._ignoreRendererResizing = oldIgnoreRendererResizing;

			this._contentX = this._layoutResult.contentX;
			this._contentY = this._layoutResult.contentY;
			this.setSizeInternal(this._layoutResult.contentWidth, this._layoutResult.contentHeight, false);
			this.actualVisibleWidth = this._layoutResult.viewPortWidth;
			this.actualVisibleHeight = this._layoutResult.viewPortHeight;

			//final validation to avoid juggler next frame issues
			this.validateItemRenderers();
		}

		private invalidateParent(flag:string = this.INVALIDATION_FLAG_ALL):void
		{
			Scroller(this.parent).invalidate(flag);
		}

		private validateItemRenderers():void
		{
			var rendererCount:number = this._activeRenderers.length;
			for(var i:number = 0; i < rendererCount; i++)
			{
				var renderer:IListItemRenderer = this._activeRenderers[i];
				renderer.validate();
			}
		}

		private refreshLayoutTypicalItem():void
		{
			var virtualLayout:IVirtualLayout = <IVirtualLayout>this._layout ;
			if(!virtualLayout || !virtualLayout.useVirtualLayout)
			{
				//the old layout was virtual, but this one isn't
				if(!this._typicalItemIsInDataProvider && this._typicalItemRenderer)
				{
					//it's safe to destroy this renderer
					this.destroyRenderer(this._typicalItemRenderer);
					this._typicalItemRenderer = null;
				}
				return;
			}
			var typicalItemIndex:number = 0;
			var newTypicalItemIsInDataProvider:boolean = false;
			var typicalItem:Object = this._typicalItem;
			if(typicalItem !== null)
			{
				if(this._dataProvider)
				{
					typicalItemIndex = this._dataProvider.getItemIndex(typicalItem);
					newTypicalItemIsInDataProvider = typicalItemIndex >= 0;
				}
				if(typicalItemIndex < 0)
				{
					typicalItemIndex = 0;
				}
			}
			else
			{
				newTypicalItemIsInDataProvider = true;
				if(this._dataProvider && this._dataProvider.length > 0)
				{
					typicalItem = this._dataProvider.getItemAt(0);
				}
			}

			if(typicalItem !== null)
			{
				var typicalRenderer:IListItemRenderer = IListItemRenderer(this._rendererMap[typicalItem]);
				if(typicalRenderer)
				{
					//the index may have changed if items were added, removed or
					//reordered in the data provider
					typicalRenderer.index = typicalItemIndex;
				}
				if(!typicalRenderer && this._typicalItemRenderer)
				{
					//we can reuse the typical item renderer if the old typical item
					//wasn't in the data provider.
					var canReuse:boolean = !this._typicalItemIsInDataProvider;
					if(!canReuse)
					{
						//we can also reuse the typical item renderer if the old
						//typical item was in the data provider, but it isn't now.
						canReuse = this._dataProvider.getItemIndex(this._typicalItemRenderer.data) < 0;
					}
					if(canReuse)
					{
						//if the old typical item was in the data provider, remove
						//it from the renderer map.
						if(this._typicalItemIsInDataProvider)
						{
							delete this._rendererMap[this._typicalItemRenderer.data];
						}
						typicalRenderer = this._typicalItemRenderer;
						typicalRenderer.data = typicalItem;
						typicalRenderer.index = typicalItemIndex;
						//if the new typical item is in the data provider, add it
						//to the renderer map.
						if(newTypicalItemIsInDataProvider)
						{
							this._rendererMap[typicalItem] = typicalRenderer;
						}
					}
				}
				if(!typicalRenderer)
				{
					//if we still don't have a typical item renderer, we need to
					//create a new one.
					typicalRenderer = this.createRenderer(typicalItem, typicalItemIndex, false, !newTypicalItemIsInDataProvider);
					if(!this._typicalItemIsInDataProvider && this._typicalItemRenderer)
					{
						//get rid of the old typical item renderer if it isn't
						//needed anymore.  since it was not in the data provider, we
						//don't need to mess with the renderer map dictionary.
						this.destroyRenderer(this._typicalItemRenderer);
						this._typicalItemRenderer = null;
					}
				}
			}

			virtualLayout.typicalItem = DisplayObject(typicalRenderer);
			this._typicalItemRenderer = typicalRenderer;
			this._typicalItemIsInDataProvider = newTypicalItemIsInDataProvider;
			if(this._typicalItemRenderer && !this._typicalItemIsInDataProvider)
			{
				//we need to know if this item renderer resizes to adjust the
				//layout because the layout may use this item renderer to resize
				//the other item renderers
				this._typicalItemRenderer.addEventListener(FeathersEventType.RESIZE, this.renderer_resizeHandler);
			}
		}

		private refreshItemRendererStyles():void
		{
			for each(var renderer:IListItemRenderer in this._activeRenderers)
			{
				this.refreshOneItemRendererStyles(renderer);
			}
		}

		private refreshOneItemRendererStyles(renderer:IListItemRenderer):void
		{
			var displayRenderer:DisplayObject = DisplayObject(renderer);
			for(var propertyName:string in this._itemRendererProperties)
			{
				var propertyValue:Object = this._itemRendererProperties[propertyName];
				displayRenderer[propertyName] = propertyValue;
			}
		}

		private refreshSelection():void
		{
			var rendererCount:number = this._activeRenderers.length;
			for(var i:number = 0; i < rendererCount; i++)
			{
				var renderer:IListItemRenderer = this._activeRenderers[i];
				renderer.isSelected = this._selectedIndices.getItemIndex(renderer.index) >= 0;
			}
		}

		private refreshEnabled():void
		{
			var rendererCount:number = this._activeRenderers.length;
			for(var i:number = 0; i < rendererCount; i++)
			{
				var itemRenderer:IFeathersControl = IFeathersControl(this._activeRenderers[i]);
				itemRenderer.isEnabled = this._isEnabled;
			}
		}

		private refreshViewPortBounds():void
		{
			this._viewPortBounds.x = this._viewPortBounds.y = 0;
			this._viewPortBounds.scrollX = this._horizontalScrollPosition;
			this._viewPortBounds.scrollY = this._verticalScrollPosition;
			this._viewPortBounds.explicitWidth = this.explicitVisibleWidth;
			this._viewPortBounds.explicitHeight = this.explicitVisibleHeight;
			this._viewPortBounds.minWidth = this._minVisibleWidth;
			this._viewPortBounds.minHeight = this._minVisibleHeight;
			this._viewPortBounds.maxWidth = this._maxVisibleWidth;
			this._viewPortBounds.maxHeight = this._maxVisibleHeight;
		}

		private refreshInactiveRenderers(itemRendererTypeIsInvalid:boolean):void
		{
			var temp:IListItemRenderer[] = this._inactiveRenderers;
			this._inactiveRenderers = this._activeRenderers;
			this._activeRenderers = temp;
			if(this._activeRenderers.length > 0)
			{
				throw new IllegalOperationError("ListDataViewPort: active renderers should be empty.");
			}
			if(itemRendererTypeIsInvalid)
			{
				this.recoverInactiveRenderers();
				this.freeInactiveRenderers();
				if(this._typicalItemRenderer)
				{
					if(this._typicalItemIsInDataProvider)
					{
						delete this._rendererMap[this._typicalItemRenderer.data];
					}
					this.destroyRenderer(this._typicalItemRenderer);
					this._typicalItemRenderer = null;
					this._typicalItemIsInDataProvider = false;
				}
			}

			this._layoutItems.length = 0;
		}

		private refreshRenderers():void
		{
			if(this._typicalItemRenderer)
			{
				if(this._typicalItemIsInDataProvider)
				{
					//this renderer is already is use by the typical item, so we
					//don't want to allow it to be used by other items.
					var inactiveIndex:number = this._inactiveRenderers.indexOf(this._typicalItemRenderer);
					if(inactiveIndex >= 0)
					{
						this._inactiveRenderers[inactiveIndex] = null;
					}
					//if refreshLayoutTypicalItem() was called, it will have already
					//added the typical item renderer to the active renderers. if
					//not, we need to do it here.
					var activeRendererCount:number = this._activeRenderers.length;
					if(activeRendererCount == 0)
					{
						this._activeRenderers[activeRendererCount] = this._typicalItemRenderer;
					}
				}
				//we need to set the typical item renderer's properties here
				//because they may be needed for proper measurement in a virtual
				//layout.
				this.refreshOneItemRendererStyles(this._typicalItemRenderer);
			}

			this.findUnrenderedData();
			this.recoverInactiveRenderers();
			this.renderUnrenderedData();
			this.freeInactiveRenderers();
			this._updateForDataReset = false;
		}

		private findUnrenderedData():void
		{
			var itemCount:number = this._dataProvider ? this._dataProvider.length : 0;
			var virtualLayout:IVirtualLayout = <IVirtualLayout>this._layout ;
			var useVirtualLayout:boolean = virtualLayout && virtualLayout.useVirtualLayout;
			if(useVirtualLayout)
			{
				virtualLayout.measureViewPort(itemCount, this._viewPortBounds, ListDataViewPort.HELPER_POINT);
				virtualLayout.getVisibleIndicesAtScrollPosition(this._horizontalScrollPosition, this._verticalScrollPosition, ListDataViewPort.HELPER_POINT.x, ListDataViewPort.HELPER_POINT.y, itemCount, ListDataViewPort.HELPER_VECTOR);
			}

			var unrenderedItemCount:number = useVirtualLayout ? ListDataViewPort.HELPER_VECTOR.length : itemCount;
			var canUseBeforeAndAfter:boolean = this._layout instanceof ITrimmedVirtualLayout && useVirtualLayout &&
				(!(this._layout instanceof IVariableVirtualLayout) || !IVariableVirtualLayout(this._layout).hasVariableItemDimensions) &&
				unrenderedItemCount > 0;
			if(canUseBeforeAndAfter)
			{
				var minIndex:number = ListDataViewPort.HELPER_VECTOR[0];
				var maxIndex:number = minIndex;
				for(var i:number = 1; i < unrenderedItemCount; i++)
				{
					var index:number = ListDataViewPort.HELPER_VECTOR[i];
					if(index < minIndex)
					{
						minIndex = index;
					}
					if(index > maxIndex)
					{
						maxIndex = index;
					}
				}
				var beforeItemCount:number = minIndex - 1;
				if(beforeItemCount < 0)
				{
					beforeItemCount = 0;
				}
				var afterItemCount:number = itemCount - 1 - maxIndex;
				var sequentialVirtualLayout:ITrimmedVirtualLayout = ITrimmedVirtualLayout(this._layout);
				sequentialVirtualLayout.beforeVirtualizedItemCount = beforeItemCount;
				sequentialVirtualLayout.afterVirtualizedItemCount = afterItemCount;
				this._layoutItems.length = itemCount - beforeItemCount - afterItemCount;
				this._layoutIndexOffset = -beforeItemCount;
			}
			else
			{
				this._layoutIndexOffset = 0;
				this._layoutItems.length = itemCount;
			}

			var activeRenderersLastIndex:number = this._activeRenderers.length;
			var unrenderedDataLastIndex:number = this._unrenderedData.length;
			for(i = 0; i < unrenderedItemCount; i++)
			{
				index = useVirtualLayout ? ListDataViewPort.HELPER_VECTOR[i] : i;
				if(index < 0 || index >= itemCount)
				{
					continue;
				}
				var item:Object = this._dataProvider.getItemAt(index);
				var renderer:IListItemRenderer = IListItemRenderer(this._rendererMap[item]);
				if(renderer)
				{
					//the index may have changed if items were added, removed or
					//reordered in the data provider
					renderer.index = index;
					//if this item renderer used to be the typical item
					//renderer, but it isn't anymore, it may have been set invisible!
					renderer.visible = true;
					if(this._updateForDataReset)
					{
						//similar to calling updateItemAt(), replacing the data
						//provider or resetting its source means that we should
						//trick the item renderer into thinking it has new data.
						//many developers seem to expect this behavior, so while
						//it's not the most optimal for performance, it saves on
						//support time in the forums. thankfully, it's still
						//somewhat optimized since the same item renderer will
						//receive the same data, and the children generally
						//won't have changed much, if at all.
						renderer.data = null;
						renderer.data = item;
					}

					//the typical item renderer is a special case, and we will
					//have already put it into the active renderers, so we don't
					//want to do it again!
					if(this._typicalItemRenderer != renderer)
					{
						this._activeRenderers[activeRenderersLastIndex] = renderer;
						activeRenderersLastIndex++;
						var inactiveIndex:number = this._inactiveRenderers.indexOf(renderer);
						if(inactiveIndex >= 0)
						{
							this._inactiveRenderers[inactiveIndex] = null;
						}
						else
						{
							throw new IllegalOperationError("ListDataViewPort: renderer map contains bad data.");
						}
					}
					this._layoutItems[index + this._layoutIndexOffset] = DisplayObject(renderer);
				}
				else
				{
					this._unrenderedData[unrenderedDataLastIndex] = item;
					unrenderedDataLastIndex++;
				}
			}
			//update the typical item renderer's visibility
			if(this._typicalItemRenderer)
			{
				if(useVirtualLayout && this._typicalItemIsInDataProvider)
				{
					index = ListDataViewPort.HELPER_VECTOR.indexOf(this._typicalItemRenderer.index);
					if(index >= 0)
					{
						this._typicalItemRenderer.visible = true;
					}
					else
					{
						this._typicalItemRenderer.visible = false;

						//uncomment these lines to see a hidden typical item for
						//debugging purposes...
						/*this._typicalItemRenderer.visible = true;
						this._typicalItemRenderer.x = this._horizontalScrollPosition;
						this._typicalItemRenderer.y = this._verticalScrollPosition;*/
					}
				}
				else
				{
					this._typicalItemRenderer.visible = this._typicalItemIsInDataProvider;
				}
			}
			ListDataViewPort.HELPER_VECTOR.length = 0;
		}

		private renderUnrenderedData():void
		{
			var itemCount:number = this._unrenderedData.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var item:Object = this._unrenderedData.shift();
				var index:number = this._dataProvider.getItemIndex(item);
				var renderer:IListItemRenderer = this.createRenderer(item, index, true, false);
				renderer.visible = true;
				this._layoutItems[index + this._layoutIndexOffset] = DisplayObject(renderer);
			}
		}

		private recoverInactiveRenderers():void
		{
			var itemCount:number = this._inactiveRenderers.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var renderer:IListItemRenderer = this._inactiveRenderers[i];
				if(!renderer)
				{
					continue;
				}
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_REMOVE, false, renderer);
				delete this._rendererMap[renderer.data];
			}
		}

		private freeInactiveRenderers():void
		{
			var itemCount:number = this._inactiveRenderers.length;
			for(var i:number = 0; i < itemCount; i++)
			{
				var renderer:IListItemRenderer = this._inactiveRenderers.shift();
				if(!renderer)
				{
					continue;
				}
				this.destroyRenderer(renderer);
			}
		}

		private createRenderer(item:Object, index:number, useCache:boolean, isTemporary:boolean):IListItemRenderer
		{
			var renderer:IListItemRenderer;
			do
			{
				if(!useCache || isTemporary || this._inactiveRenderers.length == 0)
				{
					if(this._itemRendererFactory != null)
					{
						renderer = IListItemRenderer(this._itemRendererFactory());
					}
					else
					{
						renderer = new this._itemRendererType();
					}
					var uiRenderer:IFeathersControl = IFeathersControl(renderer);
					if(this._customItemRendererStyleName && this._customItemRendererStyleName.length > 0)
					{
						uiRenderer.styleNameList.add(this._customItemRendererStyleName);
					}
					this.addChild(DisplayObject(renderer));
				}
				else
				{
					renderer = this._inactiveRenderers.shift();
				}
				//wondering why this all is in a loop?
				//_inactiveRenderers.shift() may return null because we're
				//storing null values instead of calling splice() to improve
				//performance.
			}
			while(!renderer)
			renderer.data = item;
			renderer.index = index;
			renderer.owner = this._owner;

			if(!isTemporary)
			{
				this._rendererMap[item] = renderer;
				this._activeRenderers[this._activeRenderers.length] = renderer;
				renderer.addEventListener(Event.TRIGGERED, this.renderer_triggeredHandler);
				renderer.addEventListener(Event.CHANGE, this.renderer_changeHandler);
				renderer.addEventListener(FeathersEventType.RESIZE, this.renderer_resizeHandler);
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_ADD, false, renderer);
			}

			return renderer;
		}

		private destroyRenderer(renderer:IListItemRenderer):void
		{
			renderer.removeEventListener(Event.TRIGGERED, this.renderer_triggeredHandler);
			renderer.removeEventListener(Event.CHANGE, this.renderer_changeHandler);
			renderer.removeEventListener(FeathersEventType.RESIZE, this.renderer_resizeHandler);
			renderer.owner = null;
			renderer.data = null;
			this.removeChild(DisplayObject(renderer), true);
		}

		private childProperties_onChange(proxy:PropertyProxy, name:string):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		private owner_scrollStartHandler(event:Event):void
		{
			this._isScrolling = true;
		}

		private dataProvider_changeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		private dataProvider_addItemHandler(event:Event, index:number):void
		{
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			layout.addToVariableVirtualCacheAtIndex(index);
		}

		private dataProvider_removeItemHandler(event:Event, index:number):void
		{
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			layout.removeFromVariableVirtualCacheAtIndex(index);
		}

		private dataProvider_replaceItemHandler(event:Event, index:number):void
		{
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			layout.resetVariableVirtualCacheAtIndex(index);
		}

		private dataProvider_resetHandler(event:Event):void
		{
			this._updateForDataReset = true;

			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			layout.resetVariableVirtualCache();
		}

		private dataProvider_updateItemHandler(event:Event, index:number):void
		{
			var item:Object = this._dataProvider.getItemAt(index);
			var renderer:IListItemRenderer = IListItemRenderer(this._rendererMap[item]);
			if(!renderer)
			{
				return;
			}
			renderer.data = null;
			renderer.data = item;
		}

		private layout_changeHandler(event:Event):void
		{
			if(this._ignoreLayoutChanges)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
			this.invalidateParent(this.INVALIDATION_FLAG_LAYOUT);
		}

		private renderer_resizeHandler(event:Event):void
		{
			if(this._ignoreRendererResizing)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
			this.invalidateParent(this.INVALIDATION_FLAG_LAYOUT);
			if(event.currentTarget === this._typicalItemRenderer && !this._typicalItemIsInDataProvider)
			{
				return;
			}
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			var renderer:IListItemRenderer = IListItemRenderer(event.currentTarget);
			layout.resetVariableVirtualCacheAtIndex(renderer.index, DisplayObject(renderer));
		}

		private renderer_triggeredHandler(event:Event):void
		{
			var renderer:IListItemRenderer = IListItemRenderer(event.currentTarget);
			this.parent.dispatchEventWith(Event.TRIGGERED, false, renderer.data);
		}

		private renderer_changeHandler(event:Event):void
		{
			if(this._ignoreSelectionChanges)
			{
				return;
			}
			var renderer:IListItemRenderer = IListItemRenderer(event.currentTarget);
			if(!this._isSelectable || this._isScrolling)
			{
				renderer.isSelected = false;
				return;
			}
			var isSelected:boolean = renderer.isSelected;
			var index:number = renderer.index;
			if(this._allowMultipleSelection)
			{
				var indexOfIndex:number = this._selectedIndices.getItemIndex(index);
				if(isSelected && indexOfIndex < 0)
				{
					this._selectedIndices.addItem(index);
				}
				else if(!isSelected && indexOfIndex >= 0)
				{
					this._selectedIndices.removeItemAt(indexOfIndex);
				}
			}
			else if(isSelected)
			{
				this._selectedIndices.data = new Array<number>(index);
			}
			else
			{
				this._selectedIndices.removeAll();
			}
		}

		private selectedIndices_changeHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		private removedFromStageHandler(event:Event):void
		{
			this.touchPointID = -1;
		}

		private touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this.touchPointID = -1;
				return;
			}

			if(this.touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this, TouchPhase.ENDED, this.touchPointID);
				if(!touch)
				{
					return;
				}
				this.touchPointID = -1;
			}
			else
			{
				touch = event.getTouch(this, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				this.touchPointID = touch.id;
				this._isScrolling = false;
			}
		}
	}
}