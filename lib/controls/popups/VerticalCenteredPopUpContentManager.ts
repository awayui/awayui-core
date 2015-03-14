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
	import FeathersEventType = feathers.events.FeathersEventType;
	import getDisplayObjectDepthFromStage = feathers.utils.display.getDisplayObjectDepthFromStage;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import KeyboardEvent = flash.events.KeyboardEvent;
	import Point = flash.geom.Point;
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
	 * Displays a pop-up at the center of the stage, filling the vertical space.
	 * The content will be sized horizontally so that it is no larger than the
	 * the width or height of the stage (whichever is smaller).
	 */
	export class VerticalCenteredPopUpContentManager extends EventDispatcher implements IPopUpContentManager
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * Quickly sets all margin properties to the same value. The
		 * <code>margin</code> getter always returns the value of
		 * <code>marginTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>The following example gives the pop-up a minimum of 20 pixels of
		 * margin on all sides:</p>
		 *
		 * <listing version="3.0">
		 * manager.margin = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #marginTop
		 * @see #marginRight
		 * @see #marginBottom
		 * @see #marginLeft
		 */
		public get margin():number
		{
			return this.marginTop;
		}

		/**
		 * @private
		 */
		public set margin(value:number)
		{
			this.marginTop = 0;
			this.marginRight = 0;
			this.marginBottom = 0;
			this.marginLeft = 0;
		}

		/**
		 * The minimum space, in pixels, between the top edge of the content and
		 * the top edge of the stage.
		 *
		 * <p>The following example gives the pop-up a minimum of 20 pixels of
		 * margin on the top:</p>
		 *
		 * <listing version="3.0">
		 * manager.marginTop = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #margin
		 */
		public marginTop:number = 0;

		/**
		 * The minimum space, in pixels, between the right edge of the content
		 * and the right edge of the stage.
		 *
		 * <p>The following example gives the pop-up a minimum of 20 pixels of
		 * margin on the right:</p>
		 *
		 * <listing version="3.0">
		 * manager.marginRight = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #margin
		 */
		public marginRight:number = 0;

		/**
		 * The minimum space, in pixels, between the bottom edge of the content
		 * and the bottom edge of the stage.
		 *
		 * <p>The following example gives the pop-up a minimum of 20 pixels of
		 * margin on the bottom:</p>
		 *
		 * <listing version="3.0">
		 * manager.marginBottom = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #margin
		 */
		public marginBottom:number = 0;

		/**
		 * The minimum space, in pixels, between the left edge of the content
		 * and the left edge of the stage.
		 *
		 * <p>The following example gives the pop-up a minimum of 20 pixels of
		 * margin on the left:</p>
		 *
		 * <listing version="3.0">
		 * manager.marginLeft = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #margin
		 */
		public marginLeft:number = 0;

		/**
		 * @private
		 */
		protected content:DisplayObject;

		/**
		 * @private
		 */
		protected touchPointID:number = -1;

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
			PopUpManager.addPopUp(this.content, true, false);
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
			var maxWidth:number = stage.stageWidth;
			if(maxWidth > stage.stageHeight)
			{
				maxWidth = stage.stageHeight;
			}
			maxWidth -= (this.marginLeft + this.marginRight);
			var maxHeight:number = stage.stageHeight - this.marginTop - this.marginBottom;
			var hasSetBounds:boolean = false;
			if(this.content instanceof IFeathersControl)
			{
				//if it's a ui control that is able to auto-size, this section
				//will ensure that the control stays within the required bounds.
				var uiContent:IFeathersControl = IFeathersControl(this.content);
				uiContent.minWidth = maxWidth;
				uiContent.maxWidth = maxWidth;
				uiContent.maxHeight = maxHeight;
				hasSetBounds = true;
			}
			if(this.content instanceof IValidating)
			{
				IValidating(this.content).validate();
			}
			if(!hasSetBounds)
			{
				//if it's not a ui control, and the control's explicit width and
				//height values are greater than our maximum bounds, then we
				//will enforce the maximum bounds the hard way.
				if(this.content.width > maxWidth)
				{
					this.content.width = maxWidth;
				}
				if(this.content.height > maxHeight)
				{
					this.content.height = maxHeight;
				}
			}
			//round to the nearest pixel to avoid unnecessary smoothing
			this.content.x = Math.round((stage.stageWidth - this.content.width) / 2);
			this.content.y = Math.round((stage.stageHeight - this.content.height) / 2);
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
			if(!PopUpManager.isTopLevelPopUp(this.content))
			{
				return;
			}
			var stage:Stage = Starling.current.stage;
			if(this.touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(stage, TouchPhase.ENDED, this.touchPointID);
				if(!touch)
				{
					return;
				}
				touch.getLocation(stage, VerticalCenteredPopUpContentManager.HELPER_POINT);
				var hitTestResult:DisplayObject = stage.hitTest(VerticalCenteredPopUpContentManager.HELPER_POINT, true);
				var isInBounds:boolean = false;
				if(this.content instanceof DisplayObjectContainer)
				{
					isInBounds = DisplayObjectContainer(this.content).contains(hitTestResult);
				}
				else
				{
					isInBounds = this.content == hitTestResult;
				}
				if(!isInBounds)
				{
					this.touchPointID = -1;
					this.close();
				}
			}
			else
			{
				touch = event.getTouch(stage, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				touch.getLocation(stage, VerticalCenteredPopUpContentManager.HELPER_POINT);
				hitTestResult = stage.hitTest(VerticalCenteredPopUpContentManager.HELPER_POINT, true);
				isInBounds = false;
				if(this.content instanceof DisplayObjectContainer)
				{
					isInBounds = DisplayObjectContainer(this.content).contains(hitTestResult);
				}
				else
				{
					isInBounds = this.content == hitTestResult;
				}
				if(isInBounds)
				{
					return;
				}
				this.touchPointID = touch.id;
			}
		}


	}
}
