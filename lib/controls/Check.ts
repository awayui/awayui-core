/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import IStyleProvider = feathers.skins.IStyleProvider;

	import IllegalOperationError = flash.errors.IllegalOperationError;

	/*[Exclude(name="isToggle",kind="property")]*/

	/**
	 * A toggle control that contains a label and a box that may be checked
	 * or not to indicate selection.
	 *
	 * <p>In the following example, a check is created and selected, and a
	 * listener for <code>Event.CHANGE</code> is added:</p>
	 *
	 * <listing version="3.0">
	 * var check:Check = new Check();
	 * check.label = "Pick Me!";
	 * check.isSelected = true;
	 * check.addEventListener( Event.CHANGE, check_changeHandler );
	 * this.addChild( check );</listing>
	 *
	 * @see ../../../help/check.html How to use the Feathers Check component
	 * @see feathers.controls.ToggleSwitch
	 */
	export class Check extends ToggleButton
	{
		/**
		 * The default <code>IStyleProvider</code> for all <code>Check</code>
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
		}

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Check.globalStyleProvider;
		}

		/**
		 * @private
		 */
		/*override*/ public set isToggle(value:boolean)
		{
			throw IllegalOperationError("CheckBox isToggle must always be true.");
		}
	}
}