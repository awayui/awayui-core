/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.popups
{
	import Callout = feathers.controls.Callout;

	import IllegalOperationError = flash.errors.IllegalOperationError;

	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;

	/**
	 * @inheritDoc
	 */
	/*[Event(name="open",type="starling.events.Event")]*/

	/**
	 * @inheritDoc
	 */
	/*[Event(name="close",type="starling.events.Event")]*/

	/**
	 * Displays pop-up content (such as the List in a PickerList) in a Callout.
	 *
	 * @see feathers.controls.PickerList
	 * @see feathers.controls.Callout
	 */
	export class CalloutPopUpContentManager extends EventDispatcher implements IPopUpContentManager
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * The factory used to create the <code>Callout</code> instance. If
		 * <code>null</code>, <code>Callout.calloutFactory()</code> will be used.
		 *
		 * <p>Note: If you change this value while a callout is open, the new
		 * value will not go into effect until the callout is closed and a new
		 * callout is opened.</p>
		 *
		 * @see feathers.controls.Callout#calloutFactory
		 *
		 * @default null
		 */
		public calloutFactory:Function;

		/**
		 * The direction of the callout.
		 *
		 * <p>Note: If you change this value while a callout is open, the new
		 * value will not go into effect until the callout is closed and a new
		 * callout is opened.</p>
		 *
		 * <p>In the following example, the callout direction is restricted to down:</p>
		 *
		 * <listing version="3.0">
		 * manager.direction = Callout.DIRECTION_DOWN;</listing>
		 *
		 * @see feathers.controls.Callout#DIRECTION_ANY
		 * @see feathers.controls.Callout#DIRECTION_UP
		 * @see feathers.controls.Callout#DIRECTION_DOWN
		 * @see feathers.controls.Callout#DIRECTION_LEFT
		 * @see feathers.controls.Callout#DIRECTION_RIGHT
		 *
		 * @default Callout.DIRECTION_ANY
		 */
		public direction:string = Callout.DIRECTION_ANY;

		/**
		 * Determines if the callout will be modal or not.
		 *
		 * <p>Note: If you change this value while a callout is open, the new
		 * value will not go into effect until the callout is closed and a new
		 * callout is opened.</p>
		 *
		 * <p>In the following example, the callout is not modal:</p>
		 *
		 * <listing version="3.0">
		 * manager.isModal = false;</listing>
		 *
		 * @default true
		 */
		public isModal:boolean = true;

		/**
		 * @private
		 */
		protected content:DisplayObject;

		/**
		 * @private
		 */
		protected callout:Callout;

		/**
		 * @inheritDoc
		 */
		public get isOpen():boolean
		{
			return this.content !== null;
		}

		/**
		 * @inheritDoc
		 */
		public open(content:DisplayObject, source:DisplayObject):void
		{
			if(this.isOpen)
			{
				throw new IllegalOperationError("Pop-up content is already open. Close the previous content before opening new content.");
			}

			this.content = content;
			this.callout = Callout.show(content, source, this.direction, this.isModal, this.calloutFactory);
			this.callout.addEventListener(Event.REMOVED_FROM_STAGE, this.callout_removedFromStageHandler);
			this.dispatchEventWith(Event.OPEN);
		}

		/**
		 * @inheritDoc
		 */
		public close():void
		{
			if(!this.isOpen)
			{
				return;
			}
			this.callout.close();
		}

		/**
		 * @inheritDoc
		 */
		public dispose():void
		{
			this.close();
		}

		/**
		 * @private
		 */
		protected cleanup():void
		{
			this.content = null;
			this.callout.content = null;
			this.callout.removeEventListener(Event.REMOVED_FROM_STAGE, this.callout_removedFromStageHandler);
			this.callout = null;
		}

		/**
		 * @private
		 */
		protected callout_removedFromStageHandler(event:Event):void
		{
			this.cleanup();
			this.dispatchEventWith(Event.CLOSE);
		}
	}
}
