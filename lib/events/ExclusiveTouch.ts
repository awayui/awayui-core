/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.events
{
	import Dictionary = flash.utils.Dictionary;

	import DisplayObject = starling.display.DisplayObject;
	import Stage = starling.display.Stage;
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when a touch ID is claimed or a claim is removed. The
	 * <code>data</code> property is the touch ID.
	 *
	 * @eventType starling.events.Event.CHANGE
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/**
	 * Allows a component to claim exclusive access to a touch to avoid
	 * dragging, scrolling, or other touch interaction conflicts. In particular,
	 * if objects are nested, and they can be scrolled or dragged, it's better
	 * for one to eventually gain exclusive control over the touch. Multiple
	 * objects being controlled by the same touch often results in unexpected
	 * behavior.
	 *
	 * <p>Due to the way that Starling's touch behavior is implemented, when
	 * objects are nested, the inner object will always have precedence.
	 * However, from a usability perspective, this is generally the expected
	 * behavior, so this restriction isn't expected to cause any issues.</p>
	 */
	export class ExclusiveTouch extends EventDispatcher
	{
		/**
		 * @private
		 */
		protected static stageToObject:Dictionary = new Dictionary(true);

		/**
		 * Retrieves the exclusive touch manager for the specified stage.
		 */
		public static forStage(stage:Stage):ExclusiveTouch
		{
			if(!stage)
			{
				throw new ArgumentError("Stage cannot be null.");
			}
			var object:ExclusiveTouch = ExclusiveTouch(ExclusiveTouch.stageToObject[stage]);
			if(object)
			{
				return object;
			}
			object = new ExclusiveTouch(stage);
			ExclusiveTouch.stageToObject[stage] = object;
			return object;
		}

		/**
		 * Disposes the exclusive touch manager for the specified stage.
		 */
		public static disposeForStage(stage:Stage):void
		{
			delete ExclusiveTouch.stageToObject[stage];
		}

		/**
		 * Constructor.
		 * @param stage
		 */
		constructor(stage:Stage)
		{
			if(!stage)
			{
				throw new ArgumentError("Stage cannot be null.");
			}
			this._stage = stage;
		}

		/**
		 * @private
		 */
		protected _stageListenerCount:number = 0;

		/**
		 * @private
		 */
		protected _stage:Stage;

		/**
		 * @private
		 */
		protected _claims:Dictionary = new Dictionary();

		/**
		 * Allows a display object to claim a touch by its ID. Returns
		 * <code>true</code> if the touch is claimed. Returns <code>false</code>
		 * if the touch was previously claimed by another display object.
		 */
		public claimTouch(touchID:number, target:DisplayObject):boolean
		{
			if(!target)
			{
				throw new ArgumentError("Target cannot be null.");
			}
			if(target.stage != this._stage)
			{
				throw new ArgumentError("Target cannot claim a touch on the selected stage because it appears on a different stage.");
			}
			if(touchID < 0)
			{
				throw new ArgumentError("Invalid touch. Touch ID must be >= 0.");
			}
			var existingTarget:DisplayObject = DisplayObject(this._claims[touchID]);
			if(existingTarget)
			{
				return false;
			}
			this._claims[touchID] = target;
			if(this._stageListenerCount == 0)
			{
				this._stage.addEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			}
			this._stageListenerCount++;
			this.dispatchEventWith(Event.CHANGE, false, touchID);
			return true;
		}

		/**
		 * Removes a claim to the touch with the specified ID.
		 */
		public removeClaim(touchID:number):void
		{
			var existingTarget:DisplayObject = DisplayObject(this._claims[touchID]);
			if(!existingTarget)
			{
				return;
			}
			delete this._claims[touchID];
			this.dispatchEventWith(Event.CHANGE, false, touchID);
		}

		/**
		 * Gets the display object that has claimed a touch with the specified
		 * ID. If no touch claims the touch with the specified ID, returns
		 * <code>null</code>.
		 */
		public getClaim(touchID:number):DisplayObject
		{
			if(touchID < 0)
			{
				throw new ArgumentError("Invalid touch. Touch ID must be >= 0.");
			}
			return DisplayObject(this._claims[touchID]);
		}

		/**
		 * @private
		 */
		protected stage_touchHandler(event:TouchEvent):void
		{
			for(var key:Object in this._claims)
			{
				var touchID:number = <int>key ;
				var touch:Touch = event.getTouch(this._stage, TouchPhase.ENDED, touchID);
				if(!touch)
				{
					continue;
				}
				delete this._claims[key];
				this._stageListenerCount--;
			}
			if(this._stageListenerCount == 0)
			{
				this._stage.removeEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			}
		}
	}
}
