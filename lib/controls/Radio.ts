/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IGroupedToggle = feathers.core.IGroupedToggle;
	import ToggleGroup = feathers.core.ToggleGroup;
	import IStyleProvider = feathers.skins.IStyleProvider;

	import IllegalOperationError = flash.errors.IllegalOperationError;

	import Event = starling.events.Event;

	/*[Exclude(name="isToggle",kind="property")]*/

	/**
	 * A toggleable control that exists in a set that requires a single,
	 * exclusive toggled item.
	 *
	 * <p>In the following example, a set of radios are created, along with a
	 * toggle group to group them together:</p>
	 *
	 * <listing version="3.0">
	 * var group:ToggleGroup = new ToggleGroup();
	 * group.addEventListener( Event.CHANGE, group_changeHandler );
	 * 
	 * var radio1:Radio = new Radio();
	 * radio1.label = "One";
	 * radio1.toggleGroup = group;
	 * this.addChild( radio1 );
	 * 
	 * var radio2:Radio = new Radio();
	 * radio2.label = "Two";
	 * radio2.toggleGroup = group;
	 * this.addChild( radio2 );
	 * 
	 * var radio3:Radio = new Radio();
	 * radio3.label = "Three";
	 * radio3.toggleGroup = group;
	 * this.addChild( radio3 );</listing>
	 *
	 * @see ../../../help/radio.html How to use the Feathers Radio component
	 * @see feathers.core.ToggleGroup
	 */
	export class Radio extends ToggleButton implements IGroupedToggle
	{
		/**
		 * If a <code>Radio</code> has not been added to a <code>ToggleGroup</code>,
		 * it will automatically be added to this group. If the Radio's
		 * <code>toggleGroup</code> property is set to a different group, it
		 * will be automatically removed from this group, if required.
		 */
		public static defaultRadioGroup:ToggleGroup = new ToggleGroup();

		/**
		 * The default <code>IStyleProvider</code> for all <code>Radio</code>
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
			super.isToggle = true;
			this.addEventListener(Event.ADDED_TO_STAGE, this.radio_addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.radio_removedFromStageHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Radio.globalStyleProvider;
		}

		/**
		 * @private
		 */
		/*override*/ public set isToggle(value:boolean)
		{
			throw IllegalOperationError("Radio isToggle must always be true.");
		}

		/**
		 * @private
		 */
		protected _toggleGroup:ToggleGroup;

		/**
		 * @inheritDoc
		 */
		public get toggleGroup():ToggleGroup
		{
			return this._toggleGroup;
		}

		/**
		 * @private
		 */
		public set toggleGroup(value:ToggleGroup)
		{
			if(this._toggleGroup == value)
			{
				return;
			}
			//a null toggle group will automatically add it to
			//defaultRadioGroup. however, if toggleGroup is already
			// defaultRadioGroup, then we really want to use null because
			//otherwise we'd remove the radio from defaultRadioGroup and then
			//immediately add it back because ToggleGroup sets the toggleGroup
			//property to null when removing an item.
			if(!value && this._toggleGroup != Radio.defaultRadioGroup && this.stage)
			{
				value = Radio.defaultRadioGroup;
			}
			if(this._toggleGroup && this._toggleGroup.hasItem(this))
			{
				this._toggleGroup.removeItem(this);
			}
			this._toggleGroup = value;
			if(this._toggleGroup && !this._toggleGroup.hasItem(this))
			{
				this._toggleGroup.addItem(this);
			}
		}

		/**
		 * @private
		 */
		protected radio_addedToStageHandler(event:Event):void
		{
			if(!this._toggleGroup)
			{
				this.toggleGroup = Radio.defaultRadioGroup;
			}
		}

		/**
		 * @private
		 */
		protected radio_removedFromStageHandler(event:Event):void
		{
			if(this._toggleGroup == Radio.defaultRadioGroup)
			{
				this._toggleGroup.removeItem(this);
			}
		}
	}
}
