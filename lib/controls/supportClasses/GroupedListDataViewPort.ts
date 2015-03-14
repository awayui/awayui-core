/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.supportClasses
{
	import GroupedList = feathers.controls.GroupedList;
	import Scroller = feathers.controls.Scroller;
	import IGroupedListHeaderOrFooterRenderer = feathers.controls.renderers.IGroupedListHeaderOrFooterRenderer;
	import IGroupedListItemRenderer = feathers.controls.renderers.IGroupedListItemRenderer;
	import FeathersControl = feathers.core.FeathersControl;
	import IFeathersControl = feathers.core.IFeathersControl;
	import PropertyProxy = feathers.core.PropertyProxy;
	import HierarchicalCollection = feathers.data.HierarchicalCollection;
	import CollectionEventType = feathers.events.CollectionEventType;
	import FeathersEventType = feathers.events.FeathersEventType;
	import ILayout = feathers.layout.ILayout;
	import IVariableVirtualLayout = feathers.layout.IVariableVirtualLayout;
	import IVirtualLayout = feathers.layout.IVirtualLayout;
	import LayoutBoundsResult = feathers.layout.LayoutBoundsResult;
	import ViewPortBounds = feathers.layout.ViewPortBounds;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import Point = flash.geom.Point;
	import Dictionary = flash.utils.Dictionary;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * @private
	 * Used internally by GroupedList. Not meant to be used on its own.
	 */
	export class GroupedListDataViewPort extends FeathersControl implements IViewPort
	{
		private static INVALIDATION_FLAG_ITEM_RENDERER_FACTORY:string = "itemRendererFactory";

		private static HELPER_POINT:Point = new Point();
		private static HELPER_VECTOR:number[] = new Array<number>();

		constructor()
		{
			super();
			this.addEventListener(TouchEvent.TOUCH, this.touchHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.removedFromStageHandler);
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

		private actualVisibleWidth:number = NaN;

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

		private actualVisibleHeight:number;

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

		public get horizontalScrollStep():number
		{
			var renderers:IGroupedListItemRenderer[] = this._activeItemRenderers;
			if(!renderers || renderers.length == 0)
			{
				renderers = this._activeFirstItemRenderers;
			}
			if(!renderers || renderers.length == 0)
			{
				renderers = this._activeLastItemRenderers;
			}
			if(!renderers || renderers.length == 0)
			{
				renderers = this._activeSingleItemRenderers;
			}
			if(!renderers || renderers.length == 0)
			{
				return 0;
			}
			var itemRenderer:IGroupedListItemRenderer = renderers[0];
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
			var renderers:IGroupedListItemRenderer[] = this._activeItemRenderers;
			if(!renderers || renderers.length == 0)
			{
				renderers = this._activeFirstItemRenderers;
			}
			if(!renderers || renderers.length == 0)
			{
				renderers = this._activeLastItemRenderers;
			}
			if(!renderers || renderers.length == 0)
			{
				renderers = this._activeSingleItemRenderers;
			}
			if(!renderers || renderers.length == 0)
			{
				return 0;
			}
			var itemRenderer:IGroupedListItemRenderer = renderers[0];
			var itemRendererWidth:number = itemRenderer.width;
			var itemRendererHeight:number = itemRenderer.height;
			if(itemRendererWidth < itemRendererHeight)
			{
				return itemRendererWidth;
			}
			return itemRendererHeight;
		}

		private _layoutItems:DisplayObject[] = new Array<DisplayObject>();

		private _typicalItemIsInDataProvider:boolean = false;
		private _typicalItemRenderer:IGroupedListItemRenderer;

		private _unrenderedItems:number[] = new Array<number>();
		private _inactiveItemRenderers:IGroupedListItemRenderer[] = new Array<IGroupedListItemRenderer>();
		private _activeItemRenderers:IGroupedListItemRenderer[] = new Array<IGroupedListItemRenderer>();
		private _itemRendererMap:Dictionary = new Dictionary(true);

		private _unrenderedFirstItems:number[];
		private _inactiveFirstItemRenderers:IGroupedListItemRenderer[];
		private _activeFirstItemRenderers:IGroupedListItemRenderer[];
		private _firstItemRendererMap:Dictionary = new Dictionary(true);

		private _unrenderedLastItems:number[];
		private _inactiveLastItemRenderers:IGroupedListItemRenderer[];
		private _activeLastItemRenderers:IGroupedListItemRenderer[];
		private _lastItemRendererMap:Dictionary;

		private _unrenderedSingleItems:number[];
		private _inactiveSingleItemRenderers:IGroupedListItemRenderer[];
		private _activeSingleItemRenderers:IGroupedListItemRenderer[];
		private _singleItemRendererMap:Dictionary;

		private _unrenderedHeaders:number[] = new Array<number>();
		private _inactiveHeaderRenderers:IGroupedListHeaderOrFooterRenderer[] = new Array<IGroupedListHeaderOrFooterRenderer>();
		private _activeHeaderRenderers:IGroupedListHeaderOrFooterRenderer[] = new Array<IGroupedListHeaderOrFooterRenderer>();
		private _headerRendererMap:Dictionary = new Dictionary(true);

		private _unrenderedFooters:number[] = new Array<number>();
		private _inactiveFooterRenderers:IGroupedListHeaderOrFooterRenderer[] = new Array<IGroupedListHeaderOrFooterRenderer>();
		private _activeFooterRenderers:IGroupedListHeaderOrFooterRenderer[] = new Array<IGroupedListHeaderOrFooterRenderer>();
		private _footerRendererMap:Dictionary = new Dictionary(true);

		private _headerIndices:number[] = new Array<number>();
		private _footerIndices:number[] = new Array<number>();

		private _isScrolling:boolean = false;

		private _owner:GroupedList;

		public get owner():GroupedList
		{
			return this._owner;
		}

		public set owner(value:GroupedList)
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

		private _dataProvider:HierarchicalCollection;

		public get dataProvider():HierarchicalCollection
		{
			return this._dataProvider;
		}

		public set dataProvider(value:HierarchicalCollection)
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
			if(!this._isSelectable)
			{
				this.setSelectedLocation(-1, -1);
			}
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		private _selectedGroupIndex:number = -1;

		public get selectedGroupIndex():number
		{
			return this._selectedGroupIndex;
		}

		private _selectedItemIndex:number = -1;

		public get selectedItemIndex():number
		{
			return this._selectedItemIndex;
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
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
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
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
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
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
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

		private _firstItemRendererType:Class;

		public get firstItemRendererType():Class
		{
			return this._firstItemRendererType;
		}

		public set firstItemRendererType(value:Class)
		{
			if(this._firstItemRendererType == value)
			{
				return;
			}

			this._firstItemRendererType = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _firstItemRendererFactory:Function;

		public get firstItemRendererFactory():Function
		{
			return this._firstItemRendererFactory;
		}

		public set firstItemRendererFactory(value:Function)
		{
			if(this._firstItemRendererFactory === value)
			{
				return;
			}

			this._firstItemRendererFactory = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _customFirstItemRendererStyleName:string;

		public get customFirstItemRendererStyleName():string
		{
			return this._customFirstItemRendererStyleName;
		}

		public set customFirstItemRendererStyleName(value:string)
		{
			if(this._customFirstItemRendererStyleName == value)
			{
				return;
			}
			this._customFirstItemRendererStyleName = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _lastItemRendererType:Class;

		public get lastItemRendererType():Class
		{
			return this._lastItemRendererType;
		}

		public set lastItemRendererType(value:Class)
		{
			if(this._lastItemRendererType == value)
			{
				return;
			}

			this._lastItemRendererType = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _lastItemRendererFactory:Function;

		public get lastItemRendererFactory():Function
		{
			return this._lastItemRendererFactory;
		}

		public set lastItemRendererFactory(value:Function)
		{
			if(this._lastItemRendererFactory === value)
			{
				return;
			}

			this._lastItemRendererFactory = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _customLastItemRendererStyleName:string;

		public get customLastItemRendererStyleName():string
		{
			return this._customLastItemRendererStyleName;
		}

		public set customLastItemRendererStyleName(value:string)
		{
			if(this._customLastItemRendererStyleName == value)
			{
				return;
			}
			this._customLastItemRendererStyleName = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _singleItemRendererType:Class;

		public get singleItemRendererType():Class
		{
			return this._singleItemRendererType;
		}

		public set singleItemRendererType(value:Class)
		{
			if(this._singleItemRendererType == value)
			{
				return;
			}

			this._singleItemRendererType = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _singleItemRendererFactory:Function;

		public get singleItemRendererFactory():Function
		{
			return this._singleItemRendererFactory;
		}

		public set singleItemRendererFactory(value:Function)
		{
			if(this._singleItemRendererFactory === value)
			{
				return;
			}

			this._singleItemRendererFactory = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _customSingleItemRendererStyleName:string;

		public get customSingleItemRendererStyleName():string
		{
			return this._customSingleItemRendererStyleName;
		}

		public set customSingleItemRendererStyleName(value:string)
		{
			if(this._customSingleItemRendererStyleName == value)
			{
				return;
			}
			this._customSingleItemRendererStyleName = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _headerRendererType:Class;

		public get headerRendererType():Class
		{
			return this._headerRendererType;
		}

		public set headerRendererType(value:Class)
		{
			if(this._headerRendererType == value)
			{
				return;
			}

			this._headerRendererType = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _headerRendererFactory:Function;

		public get headerRendererFactory():Function
		{
			return this._headerRendererFactory;
		}

		public set headerRendererFactory(value:Function)
		{
			if(this._headerRendererFactory === value)
			{
				return;
			}

			this._headerRendererFactory = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _customHeaderRendererStyleName:string;

		public get customHeaderRendererStyleName():string
		{
			return this._customHeaderRendererStyleName;
		}

		public set customHeaderRendererStyleName(value:string)
		{
			if(this._customHeaderRendererStyleName == value)
			{
				return;
			}
			this._customHeaderRendererStyleName = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _headerRendererProperties:PropertyProxy;

		public get headerRendererProperties():PropertyProxy
		{
			return this._headerRendererProperties;
		}

		public set headerRendererProperties(value:PropertyProxy)
		{
			if(this._headerRendererProperties == value)
			{
				return;
			}
			if(this._headerRendererProperties)
			{
				this._headerRendererProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._headerRendererProperties = PropertyProxy(value);
			if(this._headerRendererProperties)
			{
				this._headerRendererProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		private _footerRendererType:Class;

		public get footerRendererType():Class
		{
			return this._footerRendererType;
		}

		public set footerRendererType(value:Class)
		{
			if(this._footerRendererType == value)
			{
				return;
			}

			this._footerRendererType = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _footerRendererFactory:Function;

		public get footerRendererFactory():Function
		{
			return this._footerRendererFactory;
		}

		public set footerRendererFactory(value:Function)
		{
			if(this._footerRendererFactory === value)
			{
				return;
			}

			this._footerRendererFactory = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _customFooterRendererStyleName:string;

		public get customFooterRendererStyleName():string
		{
			return this._customFooterRendererStyleName;
		}

		public set customFooterRendererStyleName(value:string)
		{
			if(this._customFooterRendererStyleName == value)
			{
				return;
			}
			this._customFooterRendererStyleName = value;
			this.invalidate(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
		}

		private _footerRendererProperties:PropertyProxy;

		public get footerRendererProperties():PropertyProxy
		{
			return this._footerRendererProperties;
		}

		public set footerRendererProperties(value:PropertyProxy)
		{
			if(this._footerRendererProperties == value)
			{
				return;
			}
			if(this._footerRendererProperties)
			{
				this._footerRendererProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._footerRendererProperties = PropertyProxy(value);
			if(this._footerRendererProperties)
			{
				this._footerRendererProperties.addOnChangeCallback(this.childProperties_onChange);
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
				this._layout.removeEventListener(Event.CHANGE, this.layout_changeHandler);
			}
			this._layout = value;
			if(this._layout)
			{
				if(this._layout instanceof IVariableVirtualLayout)
				{
					var variableVirtualLayout:IVariableVirtualLayout = IVariableVirtualLayout(this._layout)
					variableVirtualLayout.hasVariableItemDimensions = true;
					variableVirtualLayout.resetVariableVirtualCache();
				}
				this._layout.addEventListener(Event.CHANGE, this.layout_changeHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
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

		private _minimumItemCount:number;
		private _minimumHeaderCount:number;
		private _minimumFooterCount:number;
		private _minimumFirstAndLastItemCount:number;
		private _minimumSingleItemCount:number;

		private _ignoreSelectionChanges:boolean = false;

		public setSelectedLocation(groupIndex:number, itemIndex:number):void
		{
			if(this._selectedGroupIndex == groupIndex && this._selectedItemIndex == itemIndex)
			{
				return;
			}
			if((groupIndex < 0 && itemIndex >= 0) || (groupIndex >= 0 && itemIndex < 0))
			{
				throw new ArgumentError("To deselect items, group index and item index must both be < 0.");
			}
			this._selectedGroupIndex = groupIndex;
			this._selectedItemIndex = itemIndex;

			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			this.dispatchEventWith(Event.CHANGE);
		}

		public getScrollPositionForIndex(groupIndex:number, itemIndex:number, result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}

			var displayIndex:number = this.locationToDisplayIndex(groupIndex, itemIndex);
			return this._layout.getScrollPositionForIndex(displayIndex, this._layoutItems,
				0, 0, this.actualVisibleWidth, this.actualVisibleHeight, result);
		}

		public getNearestScrollPositionForIndex(groupIndex:number, itemIndex:number, result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}

			var displayIndex:number = this.locationToDisplayIndex(groupIndex, itemIndex);
			return this._layout.getNearestScrollPositionForIndex(displayIndex, this._horizontalScrollPosition,
				this._verticalScrollPosition, this._layoutItems, 0, 0, this.actualVisibleWidth, this.actualVisibleHeight, result);
		}

		/*override*/ public dispose():void
		{
			this.owner = null;
			this.dataProvider = null;
			this.layout = null;
			super.dispose();
		}

		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var selectionInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SELECTED);
			var itemRendererInvalid:boolean = this.isInvalid(GroupedListDataViewPort.INVALIDATION_FLAG_ITEM_RENDERER_FACTORY);
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
				this.refreshHeaderRendererStyles();
				this.refreshFooterRendererStyles();
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

			this._layout.layout(this._layoutItems, this._viewPortBounds, this._layoutResult);

			this._ignoreRendererResizing = oldIgnoreRendererResizing;

			this._contentX = this._layoutResult.contentX;
			this._contentY = this._layoutResult.contentY;
			this.setSizeInternal(this._layoutResult.contentWidth, this._layoutResult.contentHeight, false);
			this.actualVisibleWidth = this._layoutResult.viewPortWidth;
			this.actualVisibleHeight = this._layoutResult.viewPortHeight;

			//final validation to avoid juggler next frame issues
			this.validateRenderers();
		}

		private validateRenderers():void
		{
			var rendererCount:number = this._activeFirstItemRenderers ? this._activeFirstItemRenderers.length : 0;
			for(var i:number = 0; i < rendererCount; i++)
			{
				var renderer:IGroupedListItemRenderer = this._activeFirstItemRenderers[i];
				renderer.validate();
			}
			rendererCount = this._activeLastItemRenderers ? this._activeLastItemRenderers.length : 0;
			for(i = 0; i < rendererCount; i++)
			{
				renderer = this._activeLastItemRenderers[i];
				renderer.validate();
			}
			rendererCount = this._activeSingleItemRenderers ? this._activeSingleItemRenderers.length : 0;
			for(i = 0; i < rendererCount; i++)
			{
				renderer = this._activeSingleItemRenderers[i];
				renderer.validate();
			}
			rendererCount = this._activeItemRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				renderer = this._activeItemRenderers[i];
				renderer.validate();
			}
			rendererCount = this._activeHeaderRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				var headerOrFooterRenderer:IGroupedListHeaderOrFooterRenderer = this._activeHeaderRenderers[i];
				headerOrFooterRenderer.validate();
			}
			rendererCount = this._activeFooterRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				headerOrFooterRenderer = this._activeFooterRenderers[i];
				headerOrFooterRenderer.validate();
			}
		}

		private refreshEnabled():void
		{
			var rendererCount:number = this._activeItemRenderers.length;
			for(var i:number = 0; i < rendererCount; i++)
			{
				var renderer:DisplayObject = DisplayObject(this._activeItemRenderers[i]);
				if(renderer instanceof IFeathersControl)
				{
					IFeathersControl(renderer).isEnabled = this._isEnabled;
				}
			}
			if(this._activeFirstItemRenderers)
			{
				rendererCount = this._activeFirstItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					renderer = DisplayObject(this._activeFirstItemRenderers[i]);
					if(renderer instanceof IFeathersControl)
					{
						IFeathersControl(renderer).isEnabled = this._isEnabled;
					}
				}
			}
			if(this._activeLastItemRenderers)
			{
				rendererCount = this._activeLastItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					renderer = DisplayObject(this._activeLastItemRenderers[i]);
					if(renderer instanceof IFeathersControl)
					{
						IFeathersControl(renderer).isEnabled = this._isEnabled;
					}
				}
			}
			if(this._activeSingleItemRenderers)
			{
				rendererCount = this._activeSingleItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					renderer = DisplayObject(this._activeSingleItemRenderers[i]);
					if(renderer instanceof IFeathersControl)
					{
						IFeathersControl(renderer).isEnabled = this._isEnabled;
					}
				}
			}
			rendererCount = this._activeHeaderRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				renderer = DisplayObject(this._activeHeaderRenderers[i]);
				if(renderer instanceof IFeathersControl)
				{
					IFeathersControl(renderer).isEnabled = this._isEnabled;
				}
			}
			rendererCount = this._activeFooterRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				renderer = DisplayObject(this._activeFooterRenderers[i]);
				if(renderer instanceof IFeathersControl)
				{
					IFeathersControl(renderer).isEnabled = this._isEnabled;
				}
			}
		}

		private invalidateParent(flag:string = this.INVALIDATION_FLAG_ALL):void
		{
			Scroller(this.parent).invalidate(flag);
		}

		private refreshLayoutTypicalItem():void
		{
			var virtualLayout:IVirtualLayout = <IVirtualLayout>this._layout ;
			if(!virtualLayout || !virtualLayout.useVirtualLayout)
			{
				if(!this._typicalItemIsInDataProvider && this._typicalItemRenderer)
				{
					//the old layout was virtual, but this one isn't
					this.destroyItemRenderer(this._typicalItemRenderer);
					this._typicalItemRenderer = null;
				}
				return;
			}

			var hasCustomFirstItemRenderer:boolean = this._firstItemRendererType || this._firstItemRendererFactory != null || this._customFirstItemRendererStyleName;
			var hasCustomSingleItemRenderer:boolean = this._singleItemRendererType || this._singleItemRendererFactory != null || this._customSingleItemRendererStyleName;

			var newTypicalItemIsInDataProvider:boolean = false;
			var typicalItem:Object = this._typicalItem;
			var groupCount:number = 0;
			var typicalGroupLength:number = 0;
			var typicalItemGroupIndex:number = 0;
			var typicalItemItemIndex:number = 0;
			if(this._dataProvider)
			{
				if(typicalItem !== null)
				{
					this._dataProvider.getItemLocation(typicalItem, GroupedListDataViewPort.HELPER_VECTOR);
					if(GroupedListDataViewPort.HELPER_VECTOR.length > 1)
					{
						newTypicalItemIsInDataProvider = true;
						typicalItemGroupIndex = GroupedListDataViewPort.HELPER_VECTOR[0];
						typicalItemItemIndex = GroupedListDataViewPort.HELPER_VECTOR[1];
					}
				}
				else
				{
					groupCount = this._dataProvider.getLength();
					if(groupCount > 0)
					{
						for(var i:number = 0; i < groupCount; i++)
						{
							typicalGroupLength = this._dataProvider.getLength(i);
							if(typicalGroupLength > 0)
							{
								newTypicalItemIsInDataProvider = true;
								typicalItemGroupIndex = i;
								typicalItem = this._dataProvider.getItemAt(i, 0);
								break;
							}
						}
					}
				}
			}

			if(typicalItem !== null)
			{
				var isFirst:boolean = false;
				var isSingle:boolean = false;
				var typicalItemRenderer:IGroupedListItemRenderer;
				if(hasCustomSingleItemRenderer && typicalGroupLength == 1)
				{
					if(this._singleItemRendererMap)
					{
						typicalItemRenderer = IGroupedListItemRenderer(this._singleItemRendererMap[typicalItem]);
					}
					isSingle = true;
				}
				else if(hasCustomFirstItemRenderer && typicalGroupLength > 1)
				{
					if(this._firstItemRendererMap)
					{
						typicalItemRenderer = IGroupedListItemRenderer(this._firstItemRendererMap[typicalItem]);
					}
					isFirst = true;
				}
				else
				{
					typicalItemRenderer = IGroupedListItemRenderer(this._itemRendererMap[typicalItem]);
				}
				if(typicalItemRenderer)
				{
					//the indices may have changed if items were added, removed,
					//or reordered in the data provider
					typicalItemRenderer.groupIndex = typicalItemGroupIndex;
					typicalItemRenderer.itemIndex = typicalItemItemIndex;
				}
				if(!typicalItemRenderer && !newTypicalItemIsInDataProvider && this._typicalItemRenderer)
				{
					//can use reuse the old item renderer instance
					//since it is not in the data provider, we don't need to mess
					//with the renderer map dictionary.
					typicalItemRenderer = this._typicalItemRenderer;
					typicalItemRenderer.data = typicalItem;
					typicalItemRenderer.groupIndex = typicalItemGroupIndex;
					typicalItemRenderer.itemIndex = typicalItemItemIndex;
				}
				if(!typicalItemRenderer)
				{
					if(isFirst)
					{
						var activeRenderers:IGroupedListItemRenderer[] = this._activeFirstItemRenderers;
						var inactiveRenderers:IGroupedListItemRenderer[] = this._inactiveFirstItemRenderers;
						var type:Class = this._firstItemRendererType ? this._firstItemRendererType : this._itemRendererType;
						var factory:Function = this._firstItemRendererFactory != null ? this._firstItemRendererFactory : this._itemRendererFactory;
						var name:string = this._customFirstItemRendererStyleName ? this._customFirstItemRendererStyleName : this._customItemRendererStyleName;
						typicalItemRenderer = this.createItemRenderer(inactiveRenderers,
							activeRenderers, this._firstItemRendererMap, type, factory,
							name, typicalItem, 0, 0, 0, false, !newTypicalItemIsInDataProvider);
					}
					else if(isSingle)
					{
						activeRenderers = this._activeSingleItemRenderers;
						inactiveRenderers = this._inactiveSingleItemRenderers;
						type = this._singleItemRendererType ? this._singleItemRendererType : this._itemRendererType;
						factory = this._singleItemRendererFactory != null ? this._singleItemRendererFactory : this._itemRendererFactory;
						name = this._customSingleItemRendererStyleName ? this._customSingleItemRendererStyleName : this._customItemRendererStyleName;
						typicalItemRenderer = this.createItemRenderer(inactiveRenderers,
							activeRenderers, this._singleItemRendererMap, type, factory,
							name, typicalItem, 0, 0, 0, false, !newTypicalItemIsInDataProvider);
					}
					else
					{
						activeRenderers = this._activeItemRenderers;
						inactiveRenderers = this._inactiveItemRenderers;
						typicalItemRenderer = this.createItemRenderer(inactiveRenderers,
							activeRenderers, this._itemRendererMap, this._itemRendererType, this._itemRendererFactory,
							this._customItemRendererStyleName, typicalItem, 0, 0, 0, false, !newTypicalItemIsInDataProvider);
					}
					//can't be in a last item renderer

					if(!this._typicalItemIsInDataProvider && this._typicalItemRenderer)
					{
						//get rid of the old one if it isn't needed anymore
						//since it is not in the data provider, we don't need to mess
						//with the renderer map dictionary.
						this.destroyItemRenderer(this._typicalItemRenderer);
						this._typicalItemRenderer = null;
					}
				}
			}

			virtualLayout.typicalItem = DisplayObject(typicalItemRenderer);
			this._typicalItemRenderer = typicalItemRenderer;
			this._typicalItemIsInDataProvider = newTypicalItemIsInDataProvider;
			if(this._typicalItemRenderer && !this._typicalItemIsInDataProvider)
			{
				//we need to know if this item renderer resizes to adjust the
				//layout because the layout may use this item renderer to resize
				//the other item renderers
				this._typicalItemRenderer.addEventListener(FeathersEventType.RESIZE, this.itemRenderer_resizeHandler);
			}
		}

		private refreshItemRendererStyles():void
		{
			for each(var renderer:IGroupedListItemRenderer in this._activeItemRenderers)
			{
				this.refreshOneItemRendererStyles(renderer);
			}
			for each(renderer in this._activeFirstItemRenderers)
			{
				this.refreshOneItemRendererStyles(renderer);
			}
			for each(renderer in this._activeLastItemRenderers)
			{
				this.refreshOneItemRendererStyles(renderer);
			}
			for each(renderer in this._activeSingleItemRenderers)
			{
				this.refreshOneItemRendererStyles(renderer);
			}
		}

		private refreshHeaderRendererStyles():void
		{
			for each(var renderer:IGroupedListHeaderOrFooterRenderer in this._activeHeaderRenderers)
			{
				this.refreshOneHeaderRendererStyles(renderer);
			}
		}

		private refreshFooterRendererStyles():void
		{
			for each(var renderer:IGroupedListHeaderOrFooterRenderer in this._activeFooterRenderers)
			{
				this.refreshOneFooterRendererStyles(renderer);
			}
		}

		private refreshOneItemRendererStyles(renderer:IGroupedListItemRenderer):void
		{
			var displayRenderer:DisplayObject = DisplayObject(renderer);
			for(var propertyName:string in this._itemRendererProperties)
			{
				var propertyValue:Object = this._itemRendererProperties[propertyName];
				displayRenderer[propertyName] = propertyValue;
			}
		}

		private refreshOneHeaderRendererStyles(renderer:IGroupedListHeaderOrFooterRenderer):void
		{
			var displayRenderer:DisplayObject = DisplayObject(renderer);
			for(var propertyName:string in this._headerRendererProperties)
			{
				var propertyValue:Object = this._headerRendererProperties[propertyName];
				displayRenderer[propertyName] = propertyValue;
			}
		}

		private refreshOneFooterRendererStyles(renderer:IGroupedListHeaderOrFooterRenderer):void
		{
			var displayRenderer:DisplayObject = DisplayObject(renderer);
			for(var propertyName:string in this._footerRendererProperties)
			{
				var propertyValue:Object = this._footerRendererProperties[propertyName];
				displayRenderer[propertyName] = propertyValue;
			}
		}

		private refreshSelection():void
		{
			var rendererCount:number = this._activeItemRenderers.length;
			for(var i:number = 0; i < rendererCount; i++)
			{
				var renderer:IGroupedListItemRenderer = this._activeItemRenderers[i];
				renderer.isSelected = renderer.groupIndex == this._selectedGroupIndex &&
					renderer.itemIndex == this._selectedItemIndex;
			}
			if(this._activeFirstItemRenderers)
			{
				rendererCount = this._activeFirstItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					renderer = this._activeFirstItemRenderers[i];
					renderer.isSelected = renderer.groupIndex == this._selectedGroupIndex &&
						renderer.itemIndex == this._selectedItemIndex;
				}
			}
			if(this._activeLastItemRenderers)
			{
				rendererCount = this._activeLastItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					renderer = this._activeLastItemRenderers[i];
					renderer.isSelected = renderer.groupIndex == this._selectedGroupIndex &&
						renderer.itemIndex == this._selectedItemIndex;
				}
			}
			if(this._activeSingleItemRenderers)
			{
				rendererCount = this._activeSingleItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					renderer = this._activeSingleItemRenderers[i];
					renderer.isSelected = renderer.groupIndex == this._selectedGroupIndex &&
						renderer.itemIndex == this._selectedItemIndex;
				}
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
			var temp:IGroupedListItemRenderer[] = this._inactiveItemRenderers;
			this._inactiveItemRenderers = this._activeItemRenderers;
			this._activeItemRenderers = temp;
			if(this._activeItemRenderers.length > 0)
			{
				throw new IllegalOperationError("GroupedListDataViewPort: active item renderers should be empty.");
			}
			if(this._inactiveFirstItemRenderers)
			{
				temp = this._inactiveFirstItemRenderers;
				this._inactiveFirstItemRenderers = this._activeFirstItemRenderers;
				this._activeFirstItemRenderers = temp;
				if(this._activeFirstItemRenderers.length > 0)
				{
					throw new IllegalOperationError("GroupedListDataViewPort: active first renderers should be empty.");
				}
			}
			if(this._inactiveLastItemRenderers)
			{
				temp = this._inactiveLastItemRenderers;
				this._inactiveLastItemRenderers = this._activeLastItemRenderers;
				this._activeLastItemRenderers = temp;
				if(this._activeLastItemRenderers.length > 0)
				{
					throw new IllegalOperationError("GroupedListDataViewPort: active last renderers should be empty.");
				}
			}
			if(this._inactiveSingleItemRenderers)
			{
				temp = this._inactiveSingleItemRenderers;
				this._inactiveSingleItemRenderers = this._activeSingleItemRenderers;
				this._activeSingleItemRenderers = temp;
				if(this._activeSingleItemRenderers.length > 0)
				{
					throw new IllegalOperationError("GroupedListDataViewPort: active single renderers should be empty.");
				}
			}
			var temp2:IGroupedListHeaderOrFooterRenderer[] = this._inactiveHeaderRenderers;
			this._inactiveHeaderRenderers = this._activeHeaderRenderers;
			this._activeHeaderRenderers = temp2;
			if(this._activeHeaderRenderers.length > 0)
			{
				throw new IllegalOperationError("GroupedListDataViewPort: active header renderers should be empty.");
			}
			temp2 = this._inactiveFooterRenderers;
			this._inactiveFooterRenderers = this._activeFooterRenderers;
			this._activeFooterRenderers = temp2;
			if(this._activeFooterRenderers.length > 0)
			{
				throw new IllegalOperationError("GroupedListDataViewPort: active footer renderers should be empty.");
			}
			if(itemRendererTypeIsInvalid)
			{
				this.recoverInactiveRenderers();
				this.freeInactiveRenderers();
				if(this._typicalItemRenderer)
				{
					if(this._typicalItemIsInDataProvider)
					{
						delete this._itemRendererMap[this._typicalItemRenderer.data];
						if(this._firstItemRendererMap)
						{
							delete this._firstItemRendererMap[this._typicalItemRenderer.data];
						}
						if(this._singleItemRendererMap)
						{
							delete this._singleItemRendererMap[this._typicalItemRenderer.data];
						}
						//can't be in last item renderers
					}
					this.destroyItemRenderer(this._typicalItemRenderer);
					this._typicalItemRenderer = null;
					this._typicalItemIsInDataProvider = false;
				}
			}

			this._headerIndices.length = 0;
			this._footerIndices.length = 0;

			var hasCustomFirstItemRenderer:boolean = this._firstItemRendererType || this._firstItemRendererFactory != null || this._customFirstItemRendererStyleName;
			if(hasCustomFirstItemRenderer)
			{
				if(!this._firstItemRendererMap)
				{
					this._firstItemRendererMap = new Dictionary(true);
				}
				if(!this._inactiveFirstItemRenderers)
				{
					this._inactiveFirstItemRenderers = new Array<IGroupedListItemRenderer>();
				}
				if(!this._activeFirstItemRenderers)
				{
					this._activeFirstItemRenderers = new Array<IGroupedListItemRenderer>();
				}
				if(!this._unrenderedFirstItems)
				{
					this._unrenderedFirstItems = new Array<number>();
				}
			}
			else
			{
				this._firstItemRendererMap = null;
				this._inactiveFirstItemRenderers = null;
				this._activeFirstItemRenderers = null;
				this._unrenderedFirstItems = null;
			}
			var hasCustomLastItemRenderer:boolean = this._lastItemRendererType || this._lastItemRendererFactory != null || this._customLastItemRendererStyleName;
			if(hasCustomLastItemRenderer)
			{
				if(!this._lastItemRendererMap)
				{
					this._lastItemRendererMap = new Dictionary(true);
				}
				if(!this._inactiveLastItemRenderers)
				{
					this._inactiveLastItemRenderers = new Array<IGroupedListItemRenderer>();
				}
				if(!this._activeLastItemRenderers)
				{
					this._activeLastItemRenderers = new Array<IGroupedListItemRenderer>();
				}
				if(!this._unrenderedLastItems)
				{
					this._unrenderedLastItems = new Array<number>();
				}
			}
			else
			{
				this._lastItemRendererMap = null;
				this._inactiveLastItemRenderers = null;
				this._activeLastItemRenderers = null;
				this._unrenderedLastItems = null;
			}
			var hasCustomSingleItemRenderer:boolean = this._singleItemRendererType || this._singleItemRendererFactory != null || this._customSingleItemRendererStyleName;
			if(hasCustomSingleItemRenderer)
			{
				if(!this._singleItemRendererMap)
				{
					this._singleItemRendererMap = new Dictionary(true);
				}
				if(!this._inactiveSingleItemRenderers)
				{
					this._inactiveSingleItemRenderers = new Array<IGroupedListItemRenderer>();
				}
				if(!this._activeSingleItemRenderers)
				{
					this._activeSingleItemRenderers = new Array<IGroupedListItemRenderer>();
				}
				if(!this._unrenderedSingleItems)
				{
					this._unrenderedSingleItems = new Array<number>();
				}
			}
			else
			{
				this._singleItemRendererMap = null;
				this._inactiveSingleItemRenderers = null;
				this._activeSingleItemRenderers = null;
				this._unrenderedSingleItems = null;
			}
		}

		private refreshRenderers():void
		{
			if(this._typicalItemRenderer)
			{
				if(this._typicalItemIsInDataProvider)
				{
					var typicalItem:Object = this._typicalItemRenderer.data;
					if(IGroupedListItemRenderer(this._itemRendererMap[typicalItem]) == this._typicalItemRenderer)
					{
						//this renderer is already is use by the typical item, so we
						//don't want to allow it to be used by other items.
						var inactiveIndex:number = this._inactiveItemRenderers.indexOf(this._typicalItemRenderer);
						if(inactiveIndex >= 0)
						{
							this._inactiveItemRenderers.splice(inactiveIndex, 1);
						}
						//if refreshLayoutTypicalItem() was called, it will have already
						//added the typical item renderer to the active renderers. if
						//not, we need to do it here.
						var activeRenderersCount:number = this._activeItemRenderers.length;
						if(activeRenderersCount == 0)
						{
							this._activeItemRenderers[activeRenderersCount] = this._typicalItemRenderer;
						}
					}
					else if(this._firstItemRendererMap && IGroupedListItemRenderer(this._firstItemRendererMap[typicalItem]) == this._typicalItemRenderer)
					{
						inactiveIndex = this._inactiveFirstItemRenderers.indexOf(this._typicalItemRenderer);
						if(inactiveIndex >= 0)
						{
							this._inactiveFirstItemRenderers.splice(inactiveIndex, 1);
						}
						activeRenderersCount = this._activeFirstItemRenderers.length;
						if(activeRenderersCount == 0)
						{
							this._activeFirstItemRenderers[activeRenderersCount] = this._typicalItemRenderer;
						}
					}
					else if(this._singleItemRendererMap && IGroupedListItemRenderer(this._singleItemRendererMap[typicalItem]) == this._typicalItemRenderer)
					{
						inactiveIndex = this._inactiveSingleItemRenderers.indexOf(this._typicalItemRenderer);
						if(inactiveIndex >= 0)
						{
							this._inactiveSingleItemRenderers.splice(inactiveIndex, 1);
						}
						activeRenderersCount = this._activeSingleItemRenderers.length;
						if(activeRenderersCount == 0)
						{
							this._activeSingleItemRenderers[activeRenderersCount] = this._typicalItemRenderer;
						}
					}
					//no else... can't be in last item renderers
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
			var groupCount:number = this._dataProvider ? this._dataProvider.getLength() : 0;
			var totalLayoutCount:number = 0;
			var totalHeaderCount:number = 0;
			var totalFooterCount:number = 0;
			var totalSingleItemCount:number = 0;
			var averageItemsPerGroup:number = 0;
			for(var i:number = 0; i < groupCount; i++)
			{
				var group:Object = this._dataProvider.getItemAt(i);
				if(this._owner.groupToHeaderData(group) !== null)
				{
					this._headerIndices.push(totalLayoutCount);
					totalLayoutCount++;
					totalHeaderCount++;
				}
				var currentItemCount:number = this._dataProvider.getLength(i);
				totalLayoutCount += currentItemCount;
				averageItemsPerGroup += currentItemCount;
				if(currentItemCount == 0)
				{
					totalSingleItemCount++;
				}
				if(this._owner.groupToFooterData(group) !== null)
				{
					this._footerIndices.push(totalLayoutCount);
					totalLayoutCount++;
					totalFooterCount++;
				}
			}
			this._layoutItems.length = totalLayoutCount;
			var virtualLayout:IVirtualLayout = <IVirtualLayout>this._layout ;
			var useVirtualLayout:boolean = virtualLayout && virtualLayout.useVirtualLayout;
			if(useVirtualLayout)
			{
				virtualLayout.measureViewPort(totalLayoutCount, this._viewPortBounds, GroupedListDataViewPort.HELPER_POINT);
				var viewPortWidth:number = GroupedListDataViewPort.HELPER_POINT.x;
				var viewPortHeight:number = GroupedListDataViewPort.HELPER_POINT.y;
				virtualLayout.getVisibleIndicesAtScrollPosition(this._horizontalScrollPosition, this._verticalScrollPosition, viewPortWidth, viewPortHeight, totalLayoutCount, GroupedListDataViewPort.HELPER_VECTOR);

				averageItemsPerGroup /= groupCount;

				if(this._typicalItemRenderer)
				{
					var minimumTypicalItemEdge:number = this._typicalItemRenderer.height;
					if(this._typicalItemRenderer.width < minimumTypicalItemEdge)
					{
						minimumTypicalItemEdge = this._typicalItemRenderer.width;
					}

					var maximumViewPortEdge:number = viewPortWidth;
					if(viewPortHeight > viewPortWidth)
					{
						maximumViewPortEdge = viewPortHeight;
					}
					this._minimumFirstAndLastItemCount = this._minimumSingleItemCount = this._minimumHeaderCount = this._minimumFooterCount = Math.ceil(maximumViewPortEdge / (minimumTypicalItemEdge * averageItemsPerGroup));
					this._minimumHeaderCount = Math.min(this._minimumHeaderCount, totalHeaderCount);
					this._minimumFooterCount = Math.min(this._minimumFooterCount, totalFooterCount);
					this._minimumSingleItemCount = Math.min(this._minimumSingleItemCount, totalSingleItemCount);

					//assumes that zero headers/footers might be visible
					this._minimumItemCount = Math.ceil(maximumViewPortEdge / minimumTypicalItemEdge) + 1;
				}
				else
				{
					this._minimumFirstAndLastItemCount = 1;
					this._minimumHeaderCount = 1;
					this._minimumFooterCount = 1;
					this._minimumSingleItemCount = 1;
					this._minimumItemCount = 1;
				}
			}
			var hasCustomFirstItemRenderer:boolean = this._firstItemRendererType || this._firstItemRendererFactory != null || this._customFirstItemRendererStyleName;
			var hasCustomLastItemRenderer:boolean = this._lastItemRendererType || this._lastItemRendererFactory != null || this._customLastItemRendererStyleName;
			var hasCustomSingleItemRenderer:boolean = this._singleItemRendererType || this._singleItemRendererFactory != null || this._customSingleItemRendererStyleName;
			var currentIndex:number = 0;
			var unrenderedHeadersLastIndex:number = this._unrenderedHeaders.length;
			var unrenderedFootersLastIndex:number = this._unrenderedFooters.length;
			for(i = 0; i < groupCount; i++)
			{
				group = this._dataProvider.getItemAt(i);
				var header:Object = this._owner.groupToHeaderData(group);
				if(header !== null)
				{
					//the end index is included in the visible items
					if(useVirtualLayout && GroupedListDataViewPort.HELPER_VECTOR.indexOf(currentIndex) < 0)
					{
						this._layoutItems[currentIndex] = null;
					}
					else
					{
						var headerOrFooterRenderer:IGroupedListHeaderOrFooterRenderer = IGroupedListHeaderOrFooterRenderer(this._headerRendererMap[header]);
						if(headerOrFooterRenderer)
						{
							headerOrFooterRenderer.layoutIndex = currentIndex;
							headerOrFooterRenderer.groupIndex = i;
							if(this._updateForDataReset)
							{
								//see comments in findRendererForItem()
								headerOrFooterRenderer.data = null;
								headerOrFooterRenderer.data = header;
							}
							this._activeHeaderRenderers.push(headerOrFooterRenderer);
							this._inactiveHeaderRenderers.splice(this._inactiveHeaderRenderers.indexOf(headerOrFooterRenderer), 1);
							headerOrFooterRenderer.visible = true;
							this._layoutItems[currentIndex] = DisplayObject(headerOrFooterRenderer);
						}
						else
						{
							this._unrenderedHeaders[unrenderedHeadersLastIndex] = i;
							unrenderedHeadersLastIndex++;
							this._unrenderedHeaders[unrenderedHeadersLastIndex] = currentIndex;
							unrenderedHeadersLastIndex++;
						}
					}
					currentIndex++;
				}
				currentItemCount = this._dataProvider.getLength(i);
				var currentGroupLastIndex:number = currentItemCount - 1;
				for(var j:number = 0; j < currentItemCount; j++)
				{
					if(useVirtualLayout && GroupedListDataViewPort.HELPER_VECTOR.indexOf(currentIndex) < 0)
					{
						if(this._typicalItemRenderer && this._typicalItemIsInDataProvider &&
							this._typicalItemRenderer.groupIndex === i &&
							this._typicalItemRenderer.itemIndex === j)
						{
							//the indices may have changed if items were added, removed,
							//or reordered in the data provider
							this._typicalItemRenderer.layoutIndex = currentIndex;
						}
						this._layoutItems[currentIndex] = null;
					}
					else
					{
						var item:Object = this._dataProvider.getItemAt(i, j);
						if(hasCustomSingleItemRenderer && j == 0 && j == currentGroupLastIndex)
						{
							this.findRendererForItem(item, i, j, currentIndex, this._singleItemRendererMap, this._inactiveSingleItemRenderers,
								this._activeSingleItemRenderers, this._unrenderedSingleItems);
						}
						else if(hasCustomFirstItemRenderer && j == 0)
						{
							this.findRendererForItem(item, i, j, currentIndex, this._firstItemRendererMap, this._inactiveFirstItemRenderers,
								this._activeFirstItemRenderers, this._unrenderedFirstItems);
						}
						else if(hasCustomLastItemRenderer && j == currentGroupLastIndex)
						{
							this.findRendererForItem(item, i, j, currentIndex, this._lastItemRendererMap, this._inactiveLastItemRenderers,
								this._activeLastItemRenderers, this._unrenderedLastItems);
						}
						else
						{
							this.findRendererForItem(item, i, j, currentIndex, this._itemRendererMap, this._inactiveItemRenderers,
								this._activeItemRenderers, this._unrenderedItems);
						}
					}
					currentIndex++;
				}
				var footer:Object = this._owner.groupToFooterData(group);
				if(footer !== null)
				{
					if(useVirtualLayout && GroupedListDataViewPort.HELPER_VECTOR.indexOf(currentIndex) < 0)
					{
						this._layoutItems[currentIndex] = null;
					}
					else
					{
						headerOrFooterRenderer = IGroupedListHeaderOrFooterRenderer(this._footerRendererMap[footer]);
						if(headerOrFooterRenderer)
						{
							headerOrFooterRenderer.groupIndex = i;
							headerOrFooterRenderer.layoutIndex = currentIndex;
							if(this._updateForDataReset)
							{
								//see comments in findRendererForItem()
								headerOrFooterRenderer.data = null;
								headerOrFooterRenderer.data = footer;
							}
							this._activeFooterRenderers.push(headerOrFooterRenderer);
							this._inactiveFooterRenderers.splice(this._inactiveFooterRenderers.indexOf(headerOrFooterRenderer), 1);
							headerOrFooterRenderer.visible = true;
							this._layoutItems[currentIndex] = DisplayObject(headerOrFooterRenderer);
						}
						else
						{
							this._unrenderedFooters[unrenderedFootersLastIndex] = i;
							unrenderedFootersLastIndex++;
							this._unrenderedFooters[unrenderedFootersLastIndex] = currentIndex;
							unrenderedFootersLastIndex++;
						}
					}
					currentIndex++;
				}
			}
			//update the typical item renderer's visibility
			if(this._typicalItemRenderer)
			{
				if(useVirtualLayout && this._typicalItemIsInDataProvider)
				{
					var index:number = GroupedListDataViewPort.HELPER_VECTOR.indexOf(this._typicalItemRenderer.layoutIndex);
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
			GroupedListDataViewPort.HELPER_VECTOR.length = 0;
		}

		private findRendererForItem(item:Object, groupIndex:number, itemIndex:number, layoutIndex:number,
			rendererMap:Dictionary, inactiveRenderers:IGroupedListItemRenderer[],
			activeRenderers:IGroupedListItemRenderer[], unrenderedItems:number[]):void
		{
			var itemRenderer:IGroupedListItemRenderer = IGroupedListItemRenderer(rendererMap[item]);
			if(itemRenderer)
			{
				//the indices may have changed if items were added, removed,
				//or reordered in the data provider
				itemRenderer.groupIndex = groupIndex;
				itemRenderer.itemIndex = itemIndex;
				itemRenderer.layoutIndex = layoutIndex;
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
					itemRenderer.data = null;
					itemRenderer.data = item;
				}

				//the typical item renderer is a special case, and we will
				//have already put it into the active renderers, so we don't
				//want to do it again!
				if(this._typicalItemRenderer != itemRenderer)
				{
					activeRenderers.push(itemRenderer);
					var inactiveIndex:number = inactiveRenderers.indexOf(itemRenderer);
					if(inactiveIndex >= 0)
					{
						inactiveRenderers.splice(inactiveIndex, 1);
					}
					else
					{
						throw new IllegalOperationError("GroupedListDataViewPort: renderer map contains bad data.");
					}
				}
				itemRenderer.visible = true;
				this._layoutItems[layoutIndex] = DisplayObject(itemRenderer);
			}
			else
			{
				unrenderedItems.push(groupIndex);
				unrenderedItems.push(itemIndex);
				unrenderedItems.push(layoutIndex);
			}
		}

		private renderUnrenderedData():void
		{
			var rendererCount:number = this._unrenderedItems.length;
			for(var i:number = 0; i < rendererCount; i += 3)
			{
				var groupIndex:number = this._unrenderedItems.shift();
				var itemIndex:number = this._unrenderedItems.shift();
				var layoutIndex:number = this._unrenderedItems.shift();
				var item:Object = this._dataProvider.getItemAt(groupIndex, itemIndex);
				var itemRenderer:IGroupedListItemRenderer = this.createItemRenderer(this._inactiveItemRenderers,
					this._activeItemRenderers, this._itemRendererMap, this._itemRendererType, this._itemRendererFactory,
					this._customItemRendererStyleName, item, groupIndex, itemIndex, layoutIndex, true, false);
				this._layoutItems[layoutIndex] = DisplayObject(itemRenderer);
			}

			if(this._unrenderedFirstItems)
			{
				rendererCount = this._unrenderedFirstItems.length;
				for(i = 0; i < rendererCount; i += 3)
				{
					groupIndex = this._unrenderedFirstItems.shift();
					itemIndex = this._unrenderedFirstItems.shift();
					layoutIndex = this._unrenderedFirstItems.shift();
					item = this._dataProvider.getItemAt(groupIndex, itemIndex);
					var type:Class = this._firstItemRendererType ? this._firstItemRendererType : this._itemRendererType;
					var factory:Function = this._firstItemRendererFactory != null ? this._firstItemRendererFactory : this._itemRendererFactory;
					var name:string = this._customFirstItemRendererStyleName ? this._customFirstItemRendererStyleName : this._customItemRendererStyleName;
					itemRenderer = this.createItemRenderer(this._inactiveFirstItemRenderers, this._activeFirstItemRenderers,
						this._firstItemRendererMap, type, factory, name, item, groupIndex, itemIndex, layoutIndex, true, false);
					this._layoutItems[layoutIndex] = DisplayObject(itemRenderer);
				}
			}

			if(this._unrenderedLastItems)
			{
				rendererCount = this._unrenderedLastItems.length;
				for(i = 0; i < rendererCount; i += 3)
				{
					groupIndex = this._unrenderedLastItems.shift();
					itemIndex = this._unrenderedLastItems.shift();
					layoutIndex = this._unrenderedLastItems.shift();
					item = this._dataProvider.getItemAt(groupIndex, itemIndex);
					type = this._lastItemRendererType ? this._lastItemRendererType : this._itemRendererType;
					factory = this._lastItemRendererFactory != null ? this._lastItemRendererFactory : this._itemRendererFactory;
					name = this._customLastItemRendererStyleName ? this._customLastItemRendererStyleName : this._customItemRendererStyleName;
					itemRenderer = this.createItemRenderer(this._inactiveLastItemRenderers, this._activeLastItemRenderers,
						this._lastItemRendererMap, type,  factory,  name, item, groupIndex, itemIndex, layoutIndex, true, false);
					this._layoutItems[layoutIndex] = DisplayObject(itemRenderer);
				}
			}

			if(this._unrenderedSingleItems)
			{
				rendererCount = this._unrenderedSingleItems.length;
				for(i = 0; i < rendererCount; i += 3)
				{
					groupIndex = this._unrenderedSingleItems.shift();
					itemIndex = this._unrenderedSingleItems.shift();
					layoutIndex = this._unrenderedSingleItems.shift();
					item = this._dataProvider.getItemAt(groupIndex, itemIndex);
					type = this._singleItemRendererType ? this._singleItemRendererType : this._itemRendererType;
					factory = this._singleItemRendererFactory != null ? this._singleItemRendererFactory : this._itemRendererFactory;
					name = this._customSingleItemRendererStyleName ? this._customSingleItemRendererStyleName : this._customItemRendererStyleName;
					itemRenderer = this.createItemRenderer(this._inactiveSingleItemRenderers, this._activeSingleItemRenderers,
						this._singleItemRendererMap, type,  factory,  name, item, groupIndex, itemIndex, layoutIndex, true, false);
					this._layoutItems[layoutIndex] = DisplayObject(itemRenderer);
				}
			}

			rendererCount = this._unrenderedHeaders.length;
			for(i = 0; i < rendererCount; i += 2)
			{
				groupIndex = this._unrenderedHeaders.shift();
				layoutIndex = this._unrenderedHeaders.shift();
				item = this._dataProvider.getItemAt(groupIndex);
				item = this._owner.groupToHeaderData(item);
				var headerOrFooterRenderer:IGroupedListHeaderOrFooterRenderer = this.createHeaderRenderer(item, groupIndex, layoutIndex, false);
				this._layoutItems[layoutIndex] = DisplayObject(headerOrFooterRenderer);
			}

			rendererCount = this._unrenderedFooters.length;
			for(i = 0; i < rendererCount; i += 2)
			{
				groupIndex = this._unrenderedFooters.shift();
				layoutIndex = this._unrenderedFooters.shift();
				item = this._dataProvider.getItemAt(groupIndex);
				item = this._owner.groupToFooterData(item);
				headerOrFooterRenderer = this.createFooterRenderer(item, groupIndex, layoutIndex, false);
				this._layoutItems[layoutIndex] = DisplayObject(headerOrFooterRenderer);
			}
		}

		private recoverInactiveRenderers():void
		{
			var rendererCount:number = this._inactiveItemRenderers.length;
			for(var i:number = 0; i < rendererCount; i++)
			{
				var itemRenderer:IGroupedListItemRenderer = this._inactiveItemRenderers[i];
				if(!itemRenderer || itemRenderer.groupIndex < 0)
				{
					continue;
				}
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_REMOVE, false, itemRenderer);
				delete this._itemRendererMap[itemRenderer.data];
			}

			if(this._inactiveFirstItemRenderers)
			{
				rendererCount = this._inactiveFirstItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					itemRenderer = this._inactiveFirstItemRenderers[i];
					if(!itemRenderer)
					{
						continue;
					}
					this._owner.dispatchEventWith(FeathersEventType.RENDERER_REMOVE, false, itemRenderer);
					delete this._firstItemRendererMap[itemRenderer.data];
				}
			}

			if(this._inactiveLastItemRenderers)
			{
				rendererCount = this._inactiveLastItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					itemRenderer = this._inactiveLastItemRenderers[i];
					if(!itemRenderer)
					{
						continue;
					}
					this._owner.dispatchEventWith(FeathersEventType.RENDERER_REMOVE, false, itemRenderer);
					delete this._lastItemRendererMap[itemRenderer.data];
				}
			}

			if(this._inactiveSingleItemRenderers)
			{
				rendererCount = this._inactiveSingleItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					itemRenderer = this._inactiveSingleItemRenderers[i];
					if(!itemRenderer)
					{
						continue;
					}
					this._owner.dispatchEventWith(FeathersEventType.RENDERER_REMOVE, false, itemRenderer);
					delete this._singleItemRendererMap[itemRenderer.data];
				}
			}

			rendererCount = this._inactiveHeaderRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				var headerOrFooterRenderer:IGroupedListHeaderOrFooterRenderer = this._inactiveHeaderRenderers[i];
				if(!headerOrFooterRenderer)
				{
					continue;
				}
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_REMOVE, false, headerOrFooterRenderer);
				delete this._headerRendererMap[headerOrFooterRenderer.data];
			}

			rendererCount = this._inactiveFooterRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				headerOrFooterRenderer = this._inactiveFooterRenderers[i];
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_REMOVE, false, headerOrFooterRenderer);
				delete this._footerRendererMap[headerOrFooterRenderer.data];
			}
		}

		private freeInactiveRenderers():void
		{
			//we may keep around some extra renderers to avoid too much
			//allocation and garbage collection. they'll be hidden.
			var keepCount:number = Math.min(this._minimumItemCount - this._activeItemRenderers.length, this._inactiveItemRenderers.length);
			for(var i:number = 0; i < keepCount; i++)
			{
				var itemRenderer:IGroupedListItemRenderer = this._inactiveItemRenderers.shift();
				itemRenderer.data = null;
				itemRenderer.groupIndex = -1;
				itemRenderer.itemIndex = -1;
				itemRenderer.layoutIndex = -1;
				itemRenderer.visible = false;
				this._activeItemRenderers.push(itemRenderer);
			}
			var rendererCount:number = this._inactiveItemRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				itemRenderer = this._inactiveItemRenderers.shift();
				if(!itemRenderer)
				{
					continue;
				}
				this.destroyItemRenderer(itemRenderer);
			}

			if(this._activeFirstItemRenderers)
			{
				keepCount = Math.min(this._minimumFirstAndLastItemCount - this._activeFirstItemRenderers.length, this._inactiveFirstItemRenderers.length);
				for(i = 0; i < keepCount; i++)
				{
					itemRenderer = this._inactiveFirstItemRenderers.shift();
					itemRenderer.data = null;
					itemRenderer.groupIndex = -1;
					itemRenderer.itemIndex = -1;
					itemRenderer.layoutIndex = -1;
					itemRenderer.visible = false;
					this._activeFirstItemRenderers.push(itemRenderer);
				}
				rendererCount = this._inactiveFirstItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					itemRenderer = this._inactiveFirstItemRenderers.shift();
					if(!itemRenderer)
					{
						continue;
					}
					this.destroyItemRenderer(itemRenderer);
				}
			}

			if(this._activeLastItemRenderers)
			{
				keepCount = Math.min(this._minimumFirstAndLastItemCount - this._activeLastItemRenderers.length, this._inactiveLastItemRenderers.length);
				for(i = 0; i < keepCount; i++)
				{
					itemRenderer = this._inactiveLastItemRenderers.shift();
					itemRenderer.data = null;
					itemRenderer.groupIndex = -1;
					itemRenderer.itemIndex = -1;
					itemRenderer.layoutIndex = -1;
					itemRenderer.visible = false;
					this._activeLastItemRenderers.push(itemRenderer);
				}
				rendererCount = this._inactiveLastItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					itemRenderer = this._inactiveLastItemRenderers.shift();
					if(!itemRenderer)
					{
						continue;
					}
					this.destroyItemRenderer(itemRenderer);
				}
			}

			if(this._activeSingleItemRenderers)
			{
				keepCount = Math.min(this._minimumSingleItemCount - this._activeSingleItemRenderers.length, this._inactiveSingleItemRenderers.length);
				for(i = 0; i < keepCount; i++)
				{
					itemRenderer = this._inactiveSingleItemRenderers.shift();
					itemRenderer.data = null;
					itemRenderer.groupIndex = -1;
					itemRenderer.itemIndex = -1;
					itemRenderer.layoutIndex = -1;
					itemRenderer.visible = false;
					this._activeSingleItemRenderers.push(itemRenderer);
				}
				rendererCount = this._inactiveSingleItemRenderers.length;
				for(i = 0; i < rendererCount; i++)
				{
					itemRenderer = this._inactiveSingleItemRenderers.shift();
					if(!itemRenderer)
					{
						continue;
					}
					this.destroyItemRenderer(itemRenderer);
				}
			}

			keepCount = Math.min(this._minimumHeaderCount - this._activeHeaderRenderers.length, this._inactiveHeaderRenderers.length);
			for(i = 0; i < keepCount; i++)
			{
				var headerOrFooterRenderer:IGroupedListHeaderOrFooterRenderer = this._inactiveHeaderRenderers.shift();
				headerOrFooterRenderer.visible = false;
				headerOrFooterRenderer.data = null;
				headerOrFooterRenderer.groupIndex = -1;
				headerOrFooterRenderer.layoutIndex = -1;
				this._activeHeaderRenderers.push(headerOrFooterRenderer);
			}
			rendererCount = this._inactiveHeaderRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				headerOrFooterRenderer = this._inactiveHeaderRenderers.shift();
				if(!headerOrFooterRenderer)
				{
					continue;
				}
				this.destroyHeaderRenderer(headerOrFooterRenderer);
			}

			keepCount = Math.min(this._minimumFooterCount - this._activeFooterRenderers.length, this._inactiveFooterRenderers.length);
			for(i = 0; i < keepCount; i++)
			{
				headerOrFooterRenderer = this._inactiveFooterRenderers.shift();
				headerOrFooterRenderer.visible = false;
				headerOrFooterRenderer.data = null;
				headerOrFooterRenderer.groupIndex = -1;
				headerOrFooterRenderer.layoutIndex = -1;
				this._activeFooterRenderers.push(headerOrFooterRenderer);
			}
			rendererCount = this._inactiveFooterRenderers.length;
			for(i = 0; i < rendererCount; i++)
			{
				headerOrFooterRenderer = this._inactiveFooterRenderers.shift();
				if(!headerOrFooterRenderer)
				{
					continue;
				}
				this.destroyFooterRenderer(headerOrFooterRenderer);
			}
		}

		private createItemRenderer(inactiveRenderers:IGroupedListItemRenderer[],
			activeRenderers:IGroupedListItemRenderer[], rendererMap:Dictionary,
			type:Class, factory:Function, name:string, item:Object, groupIndex:number, itemIndex:number,
			layoutIndex:number, useCache:boolean, isTemporary:boolean):IGroupedListItemRenderer
		{
			if(!useCache || isTemporary || inactiveRenderers.length == 0)
			{
				var renderer:IGroupedListItemRenderer;
				if(factory != null)
				{
					renderer = IGroupedListItemRenderer(factory());
				}
				else
				{
					renderer = new type();
				}
				var uiRenderer:IFeathersControl = IFeathersControl(renderer);
				if(name && name.length > 0)
				{
					uiRenderer.styleNameList.add(name);
				}
				this.addChild(DisplayObject(renderer));
			}
			else
			{
				renderer = inactiveRenderers.shift();
			}
			renderer.data = item;
			renderer.groupIndex = groupIndex;
			renderer.itemIndex = itemIndex;
			renderer.layoutIndex = layoutIndex;
			renderer.owner = this._owner;
			renderer.visible = true;

			if(!isTemporary)
			{
				rendererMap[item] = renderer;
				activeRenderers.push(renderer);
				renderer.addEventListener(Event.TRIGGERED, this.renderer_triggeredHandler);
				renderer.addEventListener(Event.CHANGE, this.renderer_changeHandler);
				renderer.addEventListener(FeathersEventType.RESIZE, this.itemRenderer_resizeHandler);
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_ADD, false, renderer);
			}

			return renderer;
		}

		private createHeaderRenderer(header:Object, groupIndex:number, layoutIndex:number, isTemporary:boolean = false):IGroupedListHeaderOrFooterRenderer
		{
			if(isTemporary || this._inactiveHeaderRenderers.length == 0)
			{
				var renderer:IGroupedListHeaderOrFooterRenderer;
				if(this._headerRendererFactory != null)
				{
					renderer = IGroupedListHeaderOrFooterRenderer(this._headerRendererFactory());
				}
				else
				{
					renderer = new this._headerRendererType();
				}
				var uiRenderer:IFeathersControl = IFeathersControl(renderer);
				if(this._customHeaderRendererStyleName && this._customHeaderRendererStyleName.length > 0)
				{
					uiRenderer.styleNameList.add(this._customHeaderRendererStyleName);
				}
				this.addChild(DisplayObject(renderer));
			}
			else
			{
				renderer = this._inactiveHeaderRenderers.shift();
			}
			renderer.data = header;
			renderer.groupIndex = groupIndex;
			renderer.layoutIndex = layoutIndex;
			renderer.owner = this._owner;
			renderer.visible = true;

			if(!isTemporary)
			{
				this._headerRendererMap[header] = renderer;
				this._activeHeaderRenderers.push(renderer);
				renderer.addEventListener(FeathersEventType.RESIZE, this.headerOrFooterRenderer_resizeHandler);
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_ADD, false, renderer);
			}

			return renderer;
		}

		private createFooterRenderer(footer:Object, groupIndex:number, layoutIndex:number, isTemporary:boolean = false):IGroupedListHeaderOrFooterRenderer
		{
			if(isTemporary || this._inactiveFooterRenderers.length == 0)
			{
				var renderer:IGroupedListHeaderOrFooterRenderer;
				if(this._footerRendererFactory != null)
				{
					renderer = IGroupedListHeaderOrFooterRenderer(this._footerRendererFactory());
				}
				else
				{
					renderer = new this._footerRendererType();
				}
				var uiRenderer:IFeathersControl = IFeathersControl(renderer);
				if(this._customFooterRendererStyleName && this._customFooterRendererStyleName.length > 0)
				{
					uiRenderer.styleNameList.add(this._customFooterRendererStyleName);
				}
				this.addChild(DisplayObject(renderer));
			}
			else
			{
				renderer = this._inactiveFooterRenderers.shift();
			}
			renderer.data = footer;
			renderer.groupIndex = groupIndex;
			renderer.layoutIndex = layoutIndex;
			renderer.owner = this._owner;
			renderer.visible = true;

			if(!isTemporary)
			{
				this._footerRendererMap[footer] = renderer;
				this._activeFooterRenderers.push(renderer);
				renderer.addEventListener(FeathersEventType.RESIZE, this.headerOrFooterRenderer_resizeHandler);
				this._owner.dispatchEventWith(FeathersEventType.RENDERER_ADD, false, renderer);
			}

			return renderer;
		}

		private destroyItemRenderer(renderer:IGroupedListItemRenderer):void
		{
			renderer.removeEventListener(Event.TRIGGERED, this.renderer_triggeredHandler);
			renderer.removeEventListener(Event.CHANGE, this.renderer_changeHandler);
			renderer.removeEventListener(FeathersEventType.RESIZE, this.itemRenderer_resizeHandler);
			renderer.owner = null;
			renderer.data = null;
			this.removeChild(DisplayObject(renderer), true);
		}

		private destroyHeaderRenderer(renderer:IGroupedListHeaderOrFooterRenderer):void
		{
			renderer.removeEventListener(FeathersEventType.RESIZE, this.headerOrFooterRenderer_resizeHandler);
			renderer.owner = null;
			renderer.data = null;
			this.removeChild(DisplayObject(renderer), true);
		}

		private destroyFooterRenderer(renderer:IGroupedListHeaderOrFooterRenderer):void
		{
			renderer.removeEventListener(FeathersEventType.RESIZE, this.headerOrFooterRenderer_resizeHandler);
			renderer.owner = null;
			renderer.data = null;
			this.removeChild(DisplayObject(renderer), true);
		}

		private groupToHeaderDisplayIndex(groupIndex:number):number
		{
			var group:Object = this._dataProvider.getItemAt(groupIndex);
			var header:Object = this._owner.groupToHeaderData(group);
			if(!header)
			{
				return -1;
			}
			var displayIndex:number = 0;
			var groupCount:number = this._dataProvider.getLength();
			for(var i:number = 0; i < groupCount; i++)
			{
				group = this._dataProvider.getItemAt(i);
				header = this._owner.groupToHeaderData(group);
				if(header)
				{
					if(groupIndex == i)
					{
						return displayIndex;
					}
					displayIndex++;
				}
				var groupLength:number = this._dataProvider.getLength(i);
				for(var j:number = 0; j < groupLength; j++)
				{
					displayIndex++;
				}
				var footer:Object = this._owner.groupToFooterData(group);
				if(footer)
				{
					displayIndex++;
				}
			}
			return -1;
		}

		private groupToFooterDisplayIndex(groupIndex:number):number
		{
			var group:Object = this._dataProvider.getItemAt(groupIndex);
			var footer:Object = this._owner.groupToFooterData(group);
			if(!footer)
			{
				return -1;
			}
			var displayIndex:number = 0;
			var groupCount:number = this._dataProvider.getLength();
			for(var i:number = 0; i < groupCount; i++)
			{
				group = this._dataProvider.getItemAt(i);
				var header:Object = this._owner.groupToHeaderData(group);
				if(header)
				{
					displayIndex++;
				}
				var groupLength:number = this._dataProvider.getLength(i);
				for(var j:number = 0; j < groupLength; j++)
				{
					displayIndex++;
				}
				footer = this._owner.groupToFooterData(group);
				if(footer)
				{
					if(groupIndex == i)
					{
						return displayIndex;
					}
					displayIndex++;
				}
			}
			return -1;
		}

		private locationToDisplayIndex(groupIndex:number, itemIndex:number):number
		{
			var displayIndex:number = 0;
			var groupCount:number = this._dataProvider.getLength();
			for(var i:number = 0; i < groupCount; i++)
			{
				var group:Object = this._dataProvider.getItemAt(i);
				var header:Object = this._owner.groupToHeaderData(group);
				if(header)
				{
					displayIndex++;
				}
				var groupLength:number = this._dataProvider.getLength(i);
				for(var j:number = 0; j < groupLength; j++)
				{
					if(groupIndex == i && itemIndex == j)
					{
						return displayIndex;
					}
					displayIndex++;
				}
				var footer:Object = this._owner.groupToFooterData(group);
				if(footer)
				{
					displayIndex++;
				}
			}
			return -1;
		}

		private getMappedItemRenderer(item:Object):IGroupedListItemRenderer
		{
			var renderer:IGroupedListItemRenderer = IGroupedListItemRenderer(this._itemRendererMap[item]);
			if(renderer)
			{
				return renderer;
			}
			if(this._firstItemRendererMap)
			{
				renderer = IGroupedListItemRenderer(this._firstItemRendererMap[item]);
				if(renderer)
				{
					return renderer;
				}
			}
			if(this._singleItemRendererMap)
			{
				renderer = IGroupedListItemRenderer(this._singleItemRendererMap[item]);
				if(renderer)
				{
					return renderer;
				}
			}
			if(this._lastItemRendererMap)
			{
				renderer = IGroupedListItemRenderer(this._lastItemRendererMap[item]);
				if(renderer)
				{
					return renderer;
				}
			}
			return null;
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

		private dataProvider_addItemHandler(event:Event, indices:any[]):void
		{
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			var groupIndex:number = <int>indices[0] ;
			if(indices.length > 1) //adding an item
			{
				var itemIndex:number = <int>indices[1] ;
				var itemDisplayIndex:number = this.locationToDisplayIndex(groupIndex, itemIndex);
				layout.addToVariableVirtualCacheAtIndex(itemDisplayIndex);
			}
			else //adding a whole group
			{
				var headerDisplayIndex:number = this.groupToHeaderDisplayIndex(groupIndex);
				if(headerDisplayIndex >= 0)
				{
					layout.addToVariableVirtualCacheAtIndex(headerDisplayIndex);
				}
				var groupLength:number = this._dataProvider.getLength(groupIndex);
				if(groupLength > 0)
				{
					var displayIndex:number = headerDisplayIndex;
					if(displayIndex < 0)
					{
						displayIndex = this.locationToDisplayIndex(groupIndex, 0);
					}
					groupLength += displayIndex;
					for(var i:number = displayIndex; i < groupLength; i++)
					{
						layout.addToVariableVirtualCacheAtIndex(displayIndex);
					}
				}
				var footerDisplayIndex:number = this.groupToFooterDisplayIndex(groupIndex);
				if(footerDisplayIndex >= 0)
				{
					layout.addToVariableVirtualCacheAtIndex(footerDisplayIndex);
				}
			}
		}

		private dataProvider_removeItemHandler(event:Event, indices:any[]):void
		{
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			var groupIndex:number = <int>indices[0] ;
			if(indices.length > 1) //removing an item
			{
				var itemIndex:number = <int>indices[1] ;
				var displayIndex:number = this.locationToDisplayIndex(groupIndex, itemIndex);
				layout.removeFromVariableVirtualCacheAtIndex(displayIndex);
			}
			else //removing a whole group
			{
				//TODO: figure out the length of the previous group so that we
				//don't need to reset the whole cache
				layout.resetVariableVirtualCache();
			}
		}

		private dataProvider_replaceItemHandler(event:Event, indices:any[]):void
		{
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			var groupIndex:number = <int>indices[0] ;
			if(indices.length > 1) //replacing an item
			{
				var itemIndex:number = <int>indices[1] ;
				var displayIndex:number = this.locationToDisplayIndex(groupIndex, itemIndex);
				layout.resetVariableVirtualCacheAtIndex(displayIndex);
			}
			else //replacing a whole group
			{
				//TODO: figure out the length of the previous group so that we
				//don't need to reset the whole cache
				layout.resetVariableVirtualCache();
			}
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

		private dataProvider_updateItemHandler(event:Event, indices:any[]):void
		{
			var groupIndex:number = <int>indices[0] ;
			if(indices.length > 1) //updating a single item
			{
				var itemIndex:number = <int>indices[1] ;
				var item:Object = this._dataProvider.getItemAt(groupIndex, itemIndex);
				var itemRenderer:IGroupedListItemRenderer = this.getMappedItemRenderer(item);
				if(itemRenderer)
				{
					itemRenderer.data = null;
					itemRenderer.data = item;
				}
			}
			else //updating a whole group
			{
				var groupLength:number = this._dataProvider.getLength(groupIndex);
				for(var i:number = 0; i < groupLength; i++)
				{
					item = this._dataProvider.getItemAt(groupIndex, i);
					if(item)
					{
						itemRenderer = this.getMappedItemRenderer(item);
						if(itemRenderer)
						{
							itemRenderer.data = null;
							itemRenderer.data = item;
						}
					}
				}
				var group:Object = this._dataProvider.getItemAt(groupIndex);
				item = this._owner.groupToHeaderData(group);
				if(item)
				{
					var headerOrFooterRenderer:IGroupedListHeaderOrFooterRenderer = IGroupedListHeaderOrFooterRenderer(this._headerRendererMap[item]);
					if(headerOrFooterRenderer)
					{
						headerOrFooterRenderer.data = null;
						headerOrFooterRenderer.data = item;
					}
				}
				item = this._owner.groupToFooterData(group);
				if(item)
				{
					headerOrFooterRenderer = IGroupedListHeaderOrFooterRenderer(this._footerRendererMap[item]);
					if(headerOrFooterRenderer)
					{
						headerOrFooterRenderer.data = null;
						headerOrFooterRenderer.data = item;
					}
				}

				//we need to invalidate because the group may have more or fewer items
				this.invalidate(this.INVALIDATION_FLAG_DATA);

				var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
				if(!layout || !layout.hasVariableItemDimensions)
				{
					return;
				}
				//TODO: figure out the length of the previous group so that we
				//don't need to reset the whole cache
				layout.resetVariableVirtualCache();
			}
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

		private itemRenderer_resizeHandler(event:Event):void
		{
			if(this._ignoreRendererResizing)
			{
				return;
			}
			if(event.currentTarget === this._typicalItemRenderer && !this._typicalItemIsInDataProvider)
			{
				return;
			}
			var renderer:IGroupedListItemRenderer = IGroupedListItemRenderer(event.currentTarget);
			if(renderer.layoutIndex < 0)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
			this.invalidateParent(this.INVALIDATION_FLAG_LAYOUT);
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			layout.resetVariableVirtualCacheAtIndex(renderer.layoutIndex, DisplayObject(renderer));
		}

		private headerOrFooterRenderer_resizeHandler(event:Event):void
		{
			if(this._ignoreRendererResizing)
			{
				return;
			}
			var renderer:IGroupedListHeaderOrFooterRenderer = IGroupedListHeaderOrFooterRenderer(event.currentTarget);
			if(renderer.layoutIndex < 0)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
			this.invalidateParent(this.INVALIDATION_FLAG_LAYOUT);
			var layout:IVariableVirtualLayout = <IVariableVirtualLayout>this._layout ;
			if(!layout || !layout.hasVariableItemDimensions)
			{
				return;
			}
			layout.resetVariableVirtualCacheAtIndex(renderer.layoutIndex, DisplayObject(renderer));
		}

		private renderer_triggeredHandler(event:Event):void
		{
			var renderer:IGroupedListItemRenderer = IGroupedListItemRenderer(event.currentTarget);
			this.parent.dispatchEventWith(Event.TRIGGERED, false, renderer.data);
		}

		private renderer_changeHandler(event:Event):void
		{
			if(this._ignoreSelectionChanges)
			{
				return;
			}
			var renderer:IGroupedListItemRenderer = IGroupedListItemRenderer(event.currentTarget);
			if(!this._isSelectable || this._isScrolling)
			{
				renderer.isSelected = false;
				return;
			}
			if(renderer.isSelected)
			{
				this.setSelectedLocation(renderer.groupIndex, renderer.itemIndex);
			}
			else
			{
				this.setSelectedLocation(-1, -1);
			}
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
