/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.renderers
{
	import GroupedList = feathers.controls.GroupedList;
	import LayoutGroup = feathers.controls.LayoutGroup;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import Event = starling.events.Event;

	/**
	 * Based on <code>LayoutGroup</code>, this component is meant as a base
	 * class for creating a custom header or footer renderer for a
	 * <code>GroupedList</code> component.
	 *
	 * <p>Sub-components may be created and added inside <code>initialize()</code>.
	 * This is a good place to add event listeners and to set the layout.</p>
	 *
	 * <p>The <code>data</code> property may be parsed inside <code>commitData()</code>.
	 * Use this function to change properties in your sub-components.</p>
	 *
	 * <p>Sub-components may be positioned manually, but a layout may be
	 * provided as well. An <code>AnchorLayout</code> is recommended for fluid
	 * layouts that can automatically adjust positions when the list resizes.
	 * Create <code>AnchorLayoutData</code> objects to define the constraints.</p>
	 *
	 * @see feathers.controls.GroupedList
	 */
	export class LayoutGroupGroupedListHeaderOrFooterRenderer extends LayoutGroup implements IGroupedListHeaderOrFooterRenderer
	{
		/**
		 * The default <code>IStyleProvider</code> for all <code>LayoutGroupGroupedListHeaderOrFooterRenderer</code>
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
			return LayoutGroupGroupedListHeaderOrFooterRenderer.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _groupIndex:number = -1;

		/**
		 * @inheritDoc
		 */
		public get groupIndex():number
		{
			return this._groupIndex;
		}

		/**
		 * @private
		 */
		public set groupIndex(value:number)
		{
			this._groupIndex = value;
		}

		/**
		 * @private
		 */
		protected _layoutIndex:number = -1;

		/**
		 * @inheritDoc
		 */
		public get layoutIndex():number
		{
			return this._layoutIndex;
		}

		/**
		 * @private
		 */
		public set layoutIndex(value:number)
		{
			this._layoutIndex = value;
		}

		/**
		 * @private
		 */
		protected _owner:GroupedList;

		/**
		 * @inheritDoc
		 */
		public get owner():GroupedList
		{
			return this._owner;
		}

		/**
		 * @private
		 */
		public set owner(value:GroupedList)
		{
			if(this._owner == value)
			{
				return;
			}
			this._owner = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _data:Object;

		/**
		 * @inheritDoc
		 */
		public get data():Object
		{
			return this._data;
		}

		/**
		 * @private
		 */
		public set data(value:Object)
		{
			if(this._data == value)
			{
				return;
			}
			this._data = value;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
			//LayoutGroup doesn't know about INVALIDATION_FLAG_DATA, so we need
			//set set another flag that it understands.
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _isSelected:boolean;

		/**
		 * @inheritDoc
		 */
		public get isSelected():boolean
		{
			return this._isSelected;
		}

		/**
		 * @private
		 */
		public set isSelected(value:boolean)
		{
			if(this._isSelected == value)
			{
				return;
			}
			this._isSelected = value;
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			this.owner = null;
			super.dispose();
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var scrollInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SCROLL);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);

			if(dataInvalid)
			{
				this.commitData();
			}

			if(scrollInvalid || sizeInvalid || layoutInvalid)
			{
				this._ignoreChildChanges = true;
				this.preLayout();
				this._ignoreChildChanges = false;
			}

			super.draw();

			if(scrollInvalid || sizeInvalid || layoutInvalid)
			{
				this._ignoreChildChanges = true;
				this.postLayout();
				this._ignoreChildChanges = false;
			}
		}

		/**
		 * Makes final changes to the layout before it updates the item
		 * renderer's children. If your layout requires changing the
		 * <code>layoutData</code> property on the item renderer's
		 * sub-components, override the <code>preLayout()</code> function to
		 * make those changes.
		 *
		 * <p>In subclasses, if you create properties that affect the layout,
		 * invalidate using <code>INVALIDATION_FLAG_LAYOUT</code> to trigger a
		 * call to the <code>preLayout()</code> function when the component
		 * validates.</p>
		 *
		 * <p>The final width and height of the item renderer are not yet known
		 * when this function is called. It is meant mainly for adjusting values
		 * used by fluid layouts, such as constraints or percentages. If you
		 * need io access the final width and height of the item renderer,
		 * override the <code>postLayout()</code> function instead.</p>
		 *
		 * @see #postLayout()
		 */
		protected preLayout():void
		{

		}

		/**
		 * Called after the layout updates the item renderer's children. If any
		 * children are excluded from the layout, you can update them in the
		 * <code>postLayout()</code> function if you need to use the final width
		 * and height in any calculations.
		 *
		 * <p>In subclasses, if you create properties that affect the layout,
		 * invalidate using <code>INVALIDATION_FLAG_LAYOUT</code> to trigger a
		 * call to the <code>postLayout()</code> function when the component
		 * validates.</p>
		 *
		 * <p>To make changes to the layout before it updates the item
		 * renderer's children, override the <code>preLayout()</code> function
		 * instead.</p>
		 *
		 * @see #preLayout()
		 */
		protected postLayout():void
		{

		}

		/**
		 * Updates the renderer to display the item's data. Override this
		 * function to pass data to sub-components and react to data changes.
		 *
		 * <p>Don't forget to handle the case where the data is <code>null</code>.</p>
		 */
		protected commitData():void
		{

		}

	}
}
