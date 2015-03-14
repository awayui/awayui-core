/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.dragDrop
{
	import PopUpManager = feathers.core.PopUpManager;
	import DragDropEvent = feathers.events.DragDropEvent;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import KeyboardEvent = flash.events.KeyboardEvent;
	import Point = flash.geom.Point;
	import Keyboard = flash.ui.Keyboard;

	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Stage = starling.display.Stage;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Handles drag and drop operations based on Starling touch events.
	 *
	 * @see IDragSource
	 * @see IDropTarget
	 * @see DragData
	 */
	export class DragDropManager
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 */
		protected static _touchPointID:number = -1;

		/**
		 * The ID of the touch that initiated the current drag. Returns <code>-1</code>
		 * if there is not an active drag action. In multi-touch applications,
		 * knowing the touch ID is useful if additional actions need to happen
		 * using the same touch.
		 */
		public static get touchPointID():number
		{
			return DragDropManager._touchPointID;
		}

		/**
		 * @private
		 */
		protected static _dragSource:IDragSource;

		/**
		 * The <code>IDragSource</code> that started the current drag.
		 */
		public static get dragSource():IDragSource
		{
			return DragDropManager._dragSource;
		}

		/**
		 * @private
		 */
		protected static _dragData:DragData;

		/**
		 * Determines if the drag and drop manager is currently handling a drag.
		 * Only one drag may be active at a time.
		 */
		public static get isDragging():boolean
		{
			return DragDropManager._dragData != null;
		}

		/**
		 * The data associated with the current drag. Returns <code>null</code>
		 * if there is not a current drag.
		 */
		public static get dragData():DragData
		{
			return DragDropManager._dragData;
		}

		/**
		 * @private
		 * The current target of the current drag.
		 */
		protected static dropTarget:IDropTarget;

		/**
		 * @private
		 * Indicates if the current drag has been accepted by the dropTarget.
		 */
		protected static isAccepted:boolean = false;

		/**
		 * @private
		 * The avatar for the current drag data.
		 */
		protected static avatar:DisplayObject;

		/**
		 * @private
		 */
		protected static avatarOffsetX:number;

		/**
		 * @private
		 */
		protected static avatarOffsetY:number;

		/**
		 * @private
		 */
		protected static dropTargetLocalX:number;

		/**
		 * @private
		 */
		protected static dropTargetLocalY:number;

		/**
		 * @private
		 */
		protected static avatarOldTouchable:boolean;

		/**
		 * Starts a new drag. If another drag is currently active, it is
		 * immediately cancelled. Includes an optional "avatar", a visual
		 * representation of the data that is being dragged.
		 */
		public static startDrag(source:IDragSource, touch:Touch, data:DragData, dragAvatar:DisplayObject = null, dragAvatarOffsetX:number = 0, dragAvatarOffsetY:number = 0):void
		{
			if(DragDropManager.isDragging)
			{
				DragDropManager.cancelDrag();
			}
			if(!source)
			{
				throw new ArgumentError("Drag source cannot be null.");
			}
			if(!data)
			{
				throw new ArgumentError("Drag data cannot be null.");
			}
			DragDropManager._dragSource = source;
			DragDropManager._dragData = data;
			DragDropManager._touchPointID = touch.id;
			DragDropManager.avatar = dragAvatar;
			DragDropManager.avatarOffsetX = dragAvatarOffsetX;
			DragDropManager.avatarOffsetY = dragAvatarOffsetY;
			touch.getLocation(Starling.current.stage, DragDropManager.HELPER_POINT);
			if(DragDropManager.avatar)
			{
				DragDropManager.avatarOldTouchable = DragDropManager.avatar.touchable;
				DragDropManager.avatar.touchable = false;
				DragDropManager.avatar.x = DragDropManager.HELPER_POINT.x + DragDropManager.avatarOffsetX;
				DragDropManager.avatar.y = DragDropManager.HELPER_POINT.y + DragDropManager.avatarOffsetY;
				PopUpManager.addPopUp(DragDropManager.avatar, false, false);
			}
			Starling.current.stage.addEventListener(TouchEvent.TOUCH, DragDropManager.stage_touchHandler);
			Starling.current.nativeStage.addEventListener(KeyboardEvent.KEY_DOWN, DragDropManager.nativeStage_keyDownHandler, false, 0, true);
			DragDropManager._dragSource.dispatchEvent(new DragDropEvent(DragDropEvent.DRAG_START, data, false));

			DragDropManager.updateDropTarget(DragDropManager.HELPER_POINT);
		}

		/**
		 * Tells the drag and drop manager if the target will accept the current
		 * drop. Meant to be called in a listener for the target's
		 * <code>DragDropEvent.DRAG_ENTER</code> event.
		 */
		public static acceptDrag(target:IDropTarget):void
		{
			if(DragDropManager.dropTarget != target)
			{
				throw new ArgumentError("Drop target cannot accept a drag at this time. Acceptance may only happen after the DragDropEvent.DRAG_ENTER event is dispatched and before the DragDropEvent.DRAG_EXIT event is dispatched.");
			}
			DragDropManager.isAccepted = true;
		}

		/**
		 * Immediately cancels the current drag.
		 */
		public static cancelDrag():void
		{
			if(!DragDropManager.isDragging)
			{
				return;
			}
			DragDropManager.completeDrag(false);
		}

		/**
		 * @private
		 */
		protected static completeDrag(isDropped:boolean):void
		{
			if(!DragDropManager.isDragging)
			{
				throw new IllegalOperationError("Drag cannot be completed because none is currently active.");
			}
			if(DragDropManager.dropTarget)
			{
				DragDropManager.dropTarget.dispatchEvent(new DragDropEvent(DragDropEvent.DRAG_EXIT, DragDropManager._dragData, false, DragDropManager.dropTargetLocalX, DragDropManager.dropTargetLocalY));
				DragDropManager.dropTarget = null;
			}
			var source:IDragSource = DragDropManager._dragSource;
			var data:DragData = DragDropManager._dragData;
			DragDropManager.cleanup();
			source.dispatchEvent(new DragDropEvent(DragDropEvent.DRAG_COMPLETE, data, isDropped));
		}

		/**
		 * @private
		 */
		protected static cleanup():void
		{
			if(DragDropManager.avatar)
			{
				//may have been removed from parent already in the drop listener
				if(PopUpManager.isPopUp(DragDropManager.avatar))
				{
					PopUpManager.removePopUp(DragDropManager.avatar);
				}
				DragDropManager.avatar.touchable = DragDropManager.avatarOldTouchable;
				DragDropManager.avatar = null;
			}
			Starling.current.stage.removeEventListener(TouchEvent.TOUCH, DragDropManager.stage_touchHandler);
			Starling.current.nativeStage.removeEventListener(KeyboardEvent.KEY_DOWN, DragDropManager.nativeStage_keyDownHandler);
			DragDropManager._dragSource = null;
			DragDropManager._dragData = null;
		}

		/**
		 * @private
		 */
		protected static updateDropTarget(location:Point):void
		{
			var target:DisplayObject = Starling.current.stage.hitTest(location, true);
			while(target && !(target instanceof this.IDropTarget))
			{
				target = target.parent;
			}
			if(target)
			{
				target.globalToLocal(location, location);
			}
			if(target != DragDropManager.dropTarget)
			{
				if(DragDropManager.dropTarget)
				{
					//notice that we can reuse the previously saved location
					DragDropManager.dropTarget.dispatchEvent(new DragDropEvent(DragDropEvent.DRAG_EXIT, DragDropManager._dragData, false, DragDropManager.dropTargetLocalX, DragDropManager.dropTargetLocalY));
				}
				DragDropManager.dropTarget = this.IDropTarget(target);
				DragDropManager.isAccepted = false;
				if(DragDropManager.dropTarget)
				{
					DragDropManager.dropTargetLocalX = location.x;
					DragDropManager.dropTargetLocalY = location.y;
					DragDropManager.dropTarget.dispatchEvent(new DragDropEvent(DragDropEvent.DRAG_ENTER, DragDropManager._dragData, false, DragDropManager.dropTargetLocalX, DragDropManager.dropTargetLocalY));
				}
			}
			else if(DragDropManager.dropTarget)
			{
				DragDropManager.dropTargetLocalX = location.x;
				DragDropManager.dropTargetLocalY = location.y;
				DragDropManager.dropTarget.dispatchEvent(new DragDropEvent(DragDropEvent.DRAG_MOVE, DragDropManager._dragData, false, DragDropManager.dropTargetLocalX, DragDropManager.dropTargetLocalY));
			}
		}

		/**
		 * @private
		 */
		protected static nativeStage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.keyCode == Keyboard.ESCAPE || event.keyCode == Keyboard.BACK)
			{
				event.preventDefault();
				DragDropManager.cancelDrag();
			}
		}

		/**
		 * @private
		 */
		protected static stage_touchHandler(event:TouchEvent):void
		{
			var stage:Stage = Starling.current.stage;
			var touch:Touch = event.getTouch(stage, null, DragDropManager._touchPointID);
			if(!touch)
			{
				return;
			}
			if(touch.phase == TouchPhase.MOVED)
			{
				touch.getLocation(stage, DragDropManager.HELPER_POINT);
				if(DragDropManager.avatar)
				{
					DragDropManager.avatar.x = DragDropManager.HELPER_POINT.x + DragDropManager.avatarOffsetX;
					DragDropManager.avatar.y = DragDropManager.HELPER_POINT.y + DragDropManager.avatarOffsetY;
				}
				DragDropManager.updateDropTarget(DragDropManager.HELPER_POINT);
			}
			else if(touch.phase == TouchPhase.ENDED)
			{
				DragDropManager._touchPointID = -1;
				var isDropped:boolean = false;
				if(DragDropManager.dropTarget && DragDropManager.isAccepted)
				{
					DragDropManager.dropTarget.dispatchEvent(new DragDropEvent(DragDropEvent.DRAG_DROP, DragDropManager._dragData, true, DragDropManager.dropTargetLocalX, DragDropManager.dropTargetLocalY));
					isDropped = true;
				}
				DragDropManager.dropTarget = null;
				DragDropManager.completeDrag(isDropped);
			}
		}
	}
}
