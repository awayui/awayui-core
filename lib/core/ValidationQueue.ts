/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import Dictionary = flash.utils.Dictionary;

	import IAnimatable = starling.animation.IAnimatable;
	import Starling = starling.core.Starling;

	/*[ExcludeClass]*/
	export class ValidationQueue implements IAnimatable
	{
		/**
		 * @private
		 */
		private static STARLING_TO_VALIDATION_QUEUE:Dictionary = new Dictionary(true);

		/**
		 * Gets the validation queue for the specified Starling instance. If
		 * a validation queue does not exist for the specified Starling
		 * instance, a new one will be created.
		 */
		public static forStarling(starling:Starling):ValidationQueue
		{
			if(!starling)
			{
				return null;
			}
			var queue:ValidationQueue = ValidationQueue.STARLING_TO_VALIDATION_QUEUE[starling];
			if(!queue)
			{
				ValidationQueue.STARLING_TO_VALIDATION_QUEUE[starling] = queue = new ValidationQueue(starling);
			}
			return queue;
		}

		/**
		 * Constructor.
		 */
		constructor(starling:Starling)
		{
			this._starling = starling;
		}

		private _starling:Starling;

		private _isValidating:boolean = false;

		/**
		 * If true, the queue is currently validating.
		 *
		 * <p>In the following example, we check if the queue is currently validating:</p>
		 *
		 * <listing version="3.0">
		 * if( queue.isValidating )
		 * {
		 *     // do something
		 * }</listing>
		 */
		public get isValidating():boolean
		{
			return this._isValidating;
		}

		private _delayedQueue:IValidating[] = new Array<IValidating>();
		private _queue:IValidating[] = new Array<IValidating>();

		/**
		 * Disposes the validation queue.
		 */
		public dispose():void
		{
			if(this._starling)
			{
				this._starling.juggler.remove(this);
				this._starling = null;
			}
		}

		/**
		 * Adds a validating component to the queue.
		 */
		public addControl(control:IValidating, delayIfValidating:boolean):void
		{
			//if the juggler was purged, we need to add the queue back in.
			if(!this._starling.juggler.contains(this))
			{
				this._starling.juggler.add(this);
			}
			var currentQueue:IValidating[] = (this._isValidating && delayIfValidating) ? this._delayedQueue : this._queue;
			if(currentQueue.indexOf(control) >= 0)
			{
				//already queued
				return;
			}
			var queueLength:number = currentQueue.length;
			if(this._isValidating && currentQueue == this._queue)
			{
				//special case: we need to keep it sorted
				var depth:number = control.depth;

				//we're traversing the queue backwards because it's
				//significantly more likely that we're going to push than that
				//we're going to splice, so there's no point to iterating over
				//the whole queue
				for(var i:number = queueLength - 1; i >= 0; i--)
				{
					var otherControl:IValidating = this.IValidating(currentQueue[i]);
					var otherDepth:number = otherControl.depth;
					//we can skip the overhead of calling queueSortFunction and
					//of looking up the value we've already stored in the depth
					//local variable.
					if(depth >= otherDepth)
					{
						break;
					}
				}
				//add one because we're going after the last item we checked
				//if we made it through all of them, i will be -1, and we want 0
				i++;
				if(i == queueLength)
				{
					currentQueue[queueLength] = control;
				}
				else
				{
					currentQueue.splice(i, 0, control);
				}
			}
			else
			{
				currentQueue[queueLength] = control;
			}
		}

		/**
		 * @private
		 */
		public advanceTime(time:number):void
		{
			if(this._isValidating)
			{
				return;
			}
			var queueLength:number = this._queue.length;
			if(queueLength == 0)
			{
				return;
			}
			this._isValidating = true;
			this._queue = this._queue.sort(this.queueSortFunction);
			while(this._queue.length > 0) //rechecking length after the shift
			{
				var item:IValidating = this._queue.shift();
				item.validate();
			}
			var temp:IValidating[] = this._queue;
			this._queue = this._delayedQueue;
			this._delayedQueue = temp;
			this._isValidating = false;
		}

		/**
		 * @private
		 */
		protected queueSortFunction(first:IValidating, second:IValidating):number
		{
			var difference:number = second.depth - first.depth;
			if(difference > 0)
			{
				return -1;
			}
			else if(difference < 0)
			{
				return 1;
			}
			return 0;
		}
	}
}
