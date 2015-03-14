/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.popups
{
	import IFeathersControl = feathers.core.IFeathersControl;
	import IValidating = feathers.core.IValidating;
	import PopUpManager = feathers.core.PopUpManager;
	import ValidationQueue = feathers.core.ValidationQueue;
	import FeathersEventType = feathers.events.FeathersEventType;
	import getDisplayObjectDepthFromStage = feathers.utils.display.getDisplayObjectDepthFromStage;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import KeyboardEvent = flash.events.KeyboardEvent;
	import Rectangle = flash.geom.Rectangle;
	import Keyboard = flash.ui.Keyboard;

	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;
	import Stage = starling.display.Stage;
	import Event = starling.events.Event;
	import EventDispatcher = starling.events.EventDispatcher;
	import ResizeEvent = starling.events.ResizeEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * @inheritDoc
	 */
	/*[Event(name="open",type="starling.events.Event")]*/

	/**
	 * @inheritDoc
	 */
	/*[Event(name="close",type="starling.events.Event")]*/

	/**
	 * Displays pop-up content as a desktop-style drop-down.
	 */
	export class DropDownPopUpContentManager extends EventDispatcher implements IPopUpContentManager
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * @private
		 */
		protected content:DisplayObject;

		/**
		 * @private
		 */
		protected source:DisplayObject;

		/**
		 * @inheritDoc
		 */
		public get isOpen():boolean
		{
			return this.content !== null;
		}

		/**
		 * @private
		 */
		protected _gap:number = 0;

		/**
		 * The space, in pixels, between the source and the pop-up.
		 */
		public get gap():number
		{
			return this._gap;
		}

		/**
		 * @private
		 */
		public set gap(value:number)
		{
			this._gap = value;
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
			this.source = source;
			PopUpManager.addPopUp(this.content, false, false);
			if(this.content instanceof IFeathersControl)
			{
				this.content.addEventListener(FeathersEventType.RESIZE, this.content_resizeHandler);
			}
			this.content.addEventListener(Event.REMOVED_FROM_STAGE, this.content_removedFromStageHandler);
			this.layout();
			var stage:Stage = Starling.current.stage;
			stage.addEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			stage.addEventListener(ResizeEvent.RESIZE, this.stage_resizeHandler);

			//using priority here is a hack so that objects higher up in the
			//display list have a chance to cancel the event first.
			var priority:number = -getDisplayObjectDepthFromStage(this.content);
			Starling.current.nativeStage.addEventListener(KeyboardEvent.KEY_DOWN, this.nativeStage_keyDownHandler, false, priority, true);
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
			var content:DisplayObject = this.content;
			this.content = null;
			this.source = null;
			var stage:Stage = Starling.current.stage;
			stage.removeEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			stage.removeEventListener(ResizeEvent.RESIZE, this.stage_resizeHandler);
			Starling.current.nativeStage.removeEventListener(KeyboardEvent.KEY_DOWN, this.nativeStage_keyDownHandler);
			if(content instanceof IFeathersControl)
			{
				content.removeEventListener(FeathersEventType.RESIZE, this.content_resizeHandler);
			}
			content.removeEventListener(Event.REMOVED_FROM_STAGE, this.content_removedFromStageHandler);
			if(content.parent)
			{
				content.removeFromParent(false);
			}
			this.dispatchEventWith(Event.CLOSE);
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
		protected layout():void
		{
			var stage:Stage = Starling.current.stage;
			var globalOrigin:Rectangle = this.source.getBounds(stage);

			if(this.source instanceof IValidating)
			{
				IValidating(this.source).validate();
				if(!this.isOpen)
				{
					//it's possible that the source will close its pop-up during
					//validation, so we should check for that.
					return;
				}
			}

			var sourceWidth:number = this.source.width;
			var hasSetBounds:boolean = false;
			var uiContent:IFeathersControl = <IFeathersControl>this.content ;
			if(uiContent && uiContent.minWidth < sourceWidth)
			{
				uiContent.minWidth = sourceWidth;
				hasSetBounds = true;
			}
			if(this.content instanceof IValidating)
			{
				uiContent.validate();
			}
			if(!hasSetBounds && this.content.width < sourceWidth)
			{
				this.content.width = sourceWidth;
			}

			//we need to be sure that the source is properly positioned before
			//positioning the content relative to it.
			var validationQueue:ValidationQueue = ValidationQueue.forStarling(Starling.current)
			if(validationQueue && !validationQueue.isValidating)
			{
				//force a COMPLETE validation of everything
				//but only if we're not already doing that...
				validationQueue.advanceTime(0);
			}

			var downSpace:number = (stage.stageHeight - this.content.height) - (globalOrigin.y + globalOrigin.height + this._gap);
			if(downSpace >= 0)
			{
				this.layoutBelow(globalOrigin);
				return;
			}

			var upSpace:number = globalOrigin.y - this._gap - this.content.height;
			if(upSpace >= 0)
			{
				this.layoutAbove(globalOrigin);
				return;
			}

			//worst case: pick the side that has the most available space
			if(upSpace >= downSpace)
			{
				this.layoutAbove(globalOrigin);
			}
			else
			{
				this.layoutBelow(globalOrigin);
			}

			//the content is too big for the space, so we need to adjust it to
			//fit properly
			var newMaxHeight:number = stage.stageHeight - (globalOrigin.y + globalOrigin.height);
			if(uiContent)
			{
				if(uiContent.maxHeight > newMaxHeight)
				{
					uiContent.maxHeight = newMaxHeight;
				}
			}
			else if(this.content.height > newMaxHeight)
			{
				this.content.height = newMaxHeight;
			}
		}

		/**
		 * @private
		 */
		protected layoutAbove(globalOrigin:Rectangle):void
		{
			var idealXPosition:number = globalOrigin.x + (globalOrigin.width - this.content.width) / 2;
			var xPosition:number = Starling.current.stage.stageWidth - this.content.width;
			if(xPosition > idealXPosition)
			{
				xPosition = idealXPosition;
			}
			if(xPosition < 0)
			{
				xPosition = 0;
			}
			this.content.x = xPosition;
			this.content.y = globalOrigin.y - this.content.height - this._gap;
		}

		/**
		 * @private
		 */
		protected layoutBelow(globalOrigin:Rectangle):void
		{
			var idealXPosition:number = globalOrigin.x;
			var xPosition:number = Starling.current.stage.stageWidth - this.content.width;
			if(xPosition > idealXPosition)
			{
				xPosition = idealXPosition;
			}
			if(xPosition < 0)
			{
				xPosition = 0;
			}
			this.content.x = xPosition;
			this.content.y = globalOrigin.y + globalOrigin.height + this._gap;
		}

		/**
		 * @private
		 */
		protected content_resizeHandler(event:Event):void
		{
			this.layout();
		}

		/**
		 * @private
		 */
		protected content_removedFromStageHandler(event:Event):void
		{
			this.close();
		}

		/**
		 * @private
		 */
		protected nativeStage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.isDefaultPrevented())
			{
				//someone else already handled this one
				return;
			}
			if(event.keyCode != Keyboard.BACK && event.keyCode != Keyboard.ESCAPE)
			{
				return;
			}
			//don't let the OS handle the event
			event.preventDefault();

			this.close();
		}

		/**
		 * @private
		 */
		protected stage_resizeHandler(event:ResizeEvent):void
		{
			this.layout();
		}

		/**
		 * @private
		 */
		protected stage_touchHandler(event:TouchEvent):void
		{
			var target:DisplayObject = DisplayObject(event.target);
			if(this.content == target || (this.content instanceof DisplayObjectContainer && DisplayObjectContainer(this.content).contains(target)))
			{
				return;
			}
			if(this.source == target || (this.source instanceof DisplayObjectContainer && DisplayObjectContainer(this.source).contains(target)))
			{
				return;
			}
			if(!PopUpManager.isTopLevelPopUp(this.content))
			{
				return;
			}
			//any began touch is okay here. we don't need to check all touches
			var touch:Touch = event.getTouch(Starling.current.stage, TouchPhase.BEGAN);
			if(!touch)
			{
				return;
			}
			this.close();
		}
	}
}
