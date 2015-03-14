/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.renderers
{
	import List = feathers.controls.List;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;

	/**
	 * The default item renderer for List control. Supports up to three optional
	 * sub-views, including a label to display text, an icon to display an
	 * image, and an "accessory" to display a UI control or another display
	 * object (with shortcuts for including a second image or a second label).
	 * 
	 * @see feathers.controls.List
	 */
	export class DefaultListItemRenderer extends BaseDefaultItemRenderer implements IListItemRenderer
	{
		/**
		 * @copy feathers.controls.Button#ICON_POSITION_TOP
		 *
		 * @see feathers.controls.Button#iconPosition
		 */
		public static ICON_POSITION_TOP:string = "top";

		/**
		 * @copy feathers.controls.Button#ICON_POSITION_RIGHT
		 *
		 * @see feathers.controls.Button#iconPosition
		 */
		public static ICON_POSITION_RIGHT:string = "right";

		/**
		 * @copy feathers.controls.Button#ICON_POSITION_BOTTOM
		 *
		 * @see feathers.controls.Button#iconPosition
		 */
		public static ICON_POSITION_BOTTOM:string = "bottom";

		/**
		 * @copy feathers.controls.Button#ICON_POSITION_LEFT
		 *
		 * @see feathers.controls.Button#iconPosition
		 */
		public static ICON_POSITION_LEFT:string = "left";

		/**
		 * @copy feathers.controls.Button#ICON_POSITION_MANUAL
		 *
		 * @see feathers.controls.Button#iconPosition
		 * @see feathers.controls.Button#iconOffsetX
		 * @see feathers.controls.Button#iconOffsetY
		 */
		public static ICON_POSITION_MANUAL:string = "manual";

		/**
		 * @copy feathers.controls.Button#ICON_POSITION_LEFT_BASELINE
		 *
		 * @see feathers.controls.Button#iconPosition
		 */
		public static ICON_POSITION_LEFT_BASELINE:string = "leftBaseline";

		/**
		 * @copy feathers.controls.Button#ICON_POSITION_RIGHT_BASELINE
		 *
		 * @see feathers.controls.Button#iconPosition
		 */
		public static ICON_POSITION_RIGHT_BASELINE:string = "rightBaseline";

		/**
		 * @copy feathers.controls.Button#HORIZONTAL_ALIGN_LEFT
		 *
		 * @see feathers.controls.Button#horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_LEFT:string = "left";

		/**
		 * @copy feathers.controls.Button#HORIZONTAL_ALIGN_CENTER
		 *
		 * @see feathers.controls.Button#horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_CENTER:string = "center";

		/**
		 * @copy feathers.controls.Button#HORIZONTAL_ALIGN_RIGHT
		 *
		 * @see feathers.controls.Button#horizontalAlign
		 */
		public static HORIZONTAL_ALIGN_RIGHT:string = "right";

		/**
		 * @copy feathers.controls.Button#VERTICAL_ALIGN_TOP
		 *
		 * @see feathers.controls.Button#verticalAlign
		 */
		public static VERTICAL_ALIGN_TOP:string = "top";

		/**
		 * @copy feathers.controls.Button#VERTICAL_ALIGN_MIDDLE
		 *
		 * @see feathers.controls.Button#verticalAlign
		 */
		public static VERTICAL_ALIGN_MIDDLE:string = "middle";

		/**
		 * @copy feathers.controls.Button#VERTICAL_ALIGN_BOTTOM
		 *
		 * @see feathers.controls.Button#verticalAlign
		 */
		public static VERTICAL_ALIGN_BOTTOM:string = "bottom";

		/**
		 * @copy feathers.controls.renderers.BaseDefaultItemRenderer#ACCESSORY_POSITION_TOP
		 *
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#accessoryPosition
		 */
		public static ACCESSORY_POSITION_TOP:string = "top";

		/**
		 * @copy feathers.controls.renderers.BaseDefaultItemRenderer#ACCESSORY_POSITION_RIGHT
		 *
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#accessoryPosition
		 */
		public static ACCESSORY_POSITION_RIGHT:string = "right";

		/**
		 * @copy feathers.controls.renderers.BaseDefaultItemRenderer#ACCESSORY_POSITION_BOTTOM
		 *
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#accessoryPosition
		 */
		public static ACCESSORY_POSITION_BOTTOM:string = "bottom";

		/**
		 * @copy feathers.controls.renderers.BaseDefaultItemRenderer#ACCESSORY_POSITION_LEFT
		 *
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#accessoryPosition
		 */
		public static ACCESSORY_POSITION_LEFT:string = "left";

		/**
		 * @copy feathers.controls.renderers.BaseDefaultItemRenderer#ACCESSORY_POSITION_MANUAL
		 *
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#accessoryPosition
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#accessoryOffsetX
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#accessoryOffsetY
		 */
		public static ACCESSORY_POSITION_MANUAL:string = "manual";

		/**
		 * @copy feathers.controls.renderers.BaseDefaultItemRenderer#LAYOUT_ORDER_LABEL_ACCESSORY_ICON
		 *
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#layoutOrder
		 */
		public static LAYOUT_ORDER_LABEL_ACCESSORY_ICON:string = "labelAccessoryIcon";

		/**
		 * @copy feathers.controls.renderers.BaseDefaultItemRenderer#LAYOUT_ORDER_LABEL_ICON_ACCESSORY
		 *
		 * @see feathers.controls.renderers.BaseDefaultItemRenderer#layoutOrder
		 */
		public static LAYOUT_ORDER_LABEL_ICON_ACCESSORY:string = "labelIconAccessory";

		/**
		 * The default <code>IStyleProvider</code> for all <code>DefaultListItemRenderer</code>
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
		}

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return DefaultListItemRenderer.globalStyleProvider;
		}
		
		/**
		 * @private
		 */
		protected _index:number = -1;
		
		/**
		 * @inheritDoc
		 */
		public get index():number
		{
			return this._index;
		}
		
		/**
		 * @private
		 */
		public set index(value:number)
		{
			this._index = value;
		}
		
		/**
		 * @inheritDoc
		 */
		public get owner():List
		{
			return List(this._owner);
		}
		
		/**
		 * @private
		 */
		public set owner(value:List)
		{
			if(this._owner == value)
			{
				return;
			}
			if(this._owner)
			{
				this._owner.removeEventListener(FeathersEventType.SCROLL_START, this.owner_scrollStartHandler);
				this._owner.removeEventListener(FeathersEventType.SCROLL_COMPLETE, this.owner_scrollCompleteHandler);
			}
			this._owner = value;
			if(this._owner)
			{
				var list:List = List(this._owner);
				this.isSelectableWithoutToggle = list.isSelectable;
				if(list.allowMultipleSelection)
				{
					//toggling is forced in this case
					this.isToggle = true;
				}
				this._owner.addEventListener(FeathersEventType.SCROLL_START, this.owner_scrollStartHandler);
				this._owner.addEventListener(FeathersEventType.SCROLL_COMPLETE, this.owner_scrollCompleteHandler);
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			this.owner = null;
			super.dispose();
		}
	}
}