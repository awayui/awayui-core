/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import FeathersEventType = feathers.events.FeathersEventType;

	import Dictionary = flash.utils.Dictionary;

	import DisplayObject = starling.display.DisplayObject;
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;
	import Quad = starling.display.Quad;
	import Stage = starling.display.Stage;
	import Event = starling.events.Event;
	import ResizeEvent = starling.events.ResizeEvent;

	/**
	 * The default <code>IPopUpManager</code> implementation.
	 *
	 * @see PopUpManager
	 */
	export class DefaultPopUpManager implements IPopUpManager
	{
		/**
		 * @copy PopUpManager#defaultOverlayFactory()
		 */
		public static defaultOverlayFactory():DisplayObject
		{
			var quad:Quad = new Quad(100, 100, 0x000000);
			quad.alpha = 0;
			return quad;
		}

		/**
		 * Constructor.
		 */
		constructor(root:DisplayObjectContainer = null)
		{
			this.root = root;
		}

		/**
		 * @private
		 */
		protected _popUps:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected _popUpToOverlay:Dictionary = new Dictionary(true);

		/**
		 * @private
		 */
		protected _popUpToFocusManager:Dictionary = new Dictionary(true);

		/**
		 * @private
		 */
		protected _centeredPopUps:DisplayObject[] = new Array<DisplayObject>();

		/**
		 * @private
		 */
		protected _overlayFactory:Function = DefaultPopUpManager.defaultOverlayFactory;

		/**
		 * @copy PopUpManager#overlayFactory
		 */
		public get overlayFactory():Function
		{
			return this._overlayFactory;
		}

		/**
		 * @private
		 */
		public set overlayFactory(value:Function)
		{
			this._overlayFactory = value;
		}

		/**
		 * @private
		 */
		protected _ignoreRemoval:boolean = false;

		/**
		 * @private
		 */
		protected _root:DisplayObjectContainer;

		/**
		 * @copy PopUpManager#root
		 */
		public get root():DisplayObjectContainer
		{
			return this._root;
		}

		/**
		 * @private
		 */
		public set root(value:DisplayObjectContainer)
		{
			if(this._root == value)
			{
				return;
			}
			var popUpCount:number = this._popUps.length;
			var oldIgnoreRemoval:boolean = this._ignoreRemoval; //just in case
			this._ignoreRemoval = true;
			for(var i:number = 0; i < popUpCount; i++)
			{
				var popUp:DisplayObject = this._popUps[i];
				var overlay:DisplayObject = DisplayObject(this._popUpToOverlay[popUp]);
				popUp.removeFromParent(false);
				if(overlay)
				{
					overlay.removeFromParent(false);
				}
			}
			this._ignoreRemoval = oldIgnoreRemoval;
			this._root = value;
			for(i = 0; i < popUpCount; i++)
			{
				popUp = this._popUps[i];
				overlay = DisplayObject(this._popUpToOverlay[popUp]);
				if(overlay)
				{
					this._root.addChild(overlay);
				}
				this._root.addChild(popUp);
			}
		}

		/**
		 * @copy PopUpManager#addPopUp()
		 */
		public addPopUp(popUp:DisplayObject, isModal:boolean = true, isCentered:boolean = true, customOverlayFactory:Function = null):DisplayObject
		{
			if(isModal)
			{
				if(customOverlayFactory == null)
				{
					customOverlayFactory = this._overlayFactory;
				}
				if(customOverlayFactory == null)
				{
					customOverlayFactory = DefaultPopUpManager.defaultOverlayFactory;
				}
				var overlay:DisplayObject = customOverlayFactory();
				overlay.width = this._root.stage.stageWidth;
				overlay.height = this._root.stage.stageHeight;
				this._root.addChild(overlay);
				this._popUpToOverlay[popUp] = overlay;
			}

			this._popUps.push(popUp);
			this._root.addChild(popUp);
			//this listener needs to be added after the pop-up is added to the
			//root because the pop-up may not have been removed from its old
			//parent yet, which will trigger the listener if it is added first.
			popUp.addEventListener(Event.REMOVED_FROM_STAGE, this.popUp_removedFromStageHandler);

			if(this._popUps.length == 1)
			{
				this._root.stage.addEventListener(ResizeEvent.RESIZE, this.stage_resizeHandler);
			}

			if(isModal && this.FocusManager.isEnabledForStage(this._root.stage) && popUp instanceof DisplayObjectContainer)
			{
				this._popUpToFocusManager[popUp] = this.FocusManager.pushFocusManager(DisplayObjectContainer(popUp));
			}

			if(isCentered)
			{
				if(popUp instanceof this.IFeathersControl)
				{
					popUp.addEventListener(FeathersEventType.RESIZE, this.popUp_resizeHandler);
				}
				this._centeredPopUps.push(popUp);
				this.centerPopUp(popUp);
			}

			return popUp;
		}

		/**
		 * @copy PopUpManager#removePopUp()
		 */
		public removePopUp(popUp:DisplayObject, dispose:boolean = false):DisplayObject
		{
			var index:number = this._popUps.indexOf(popUp);
			if(index < 0)
			{
				throw new ArgumentError("Display object is not a pop-up.");
			}
			popUp.removeFromParent(dispose);
			return popUp;
		}

		/**
		 * @copy PopUpManager#isPopUp()
		 */
		public isPopUp(popUp:DisplayObject):boolean
		{
			return this._popUps.indexOf(popUp) >= 0;
		}

		/**
		 * @copy PopUpManager#isTopLevelPopUp()
		 */
		public isTopLevelPopUp(popUp:DisplayObject):boolean
		{
			var lastIndex:number = this._popUps.length - 1;
			for(var i:number = lastIndex; i >= 0; i--)
			{
				var otherPopUp:DisplayObject = this._popUps[i];
				if(otherPopUp == popUp)
				{
					//we haven't encountered an overlay yet, so it is top-level
					return true;
				}
				var overlay:DisplayObject = <DisplayObject>this._popUpToOverlay[otherPopUp] ;
				if(overlay)
				{
					//this is the first overlay, and we haven't found the pop-up
					//yet, so it is not top-level
					return false;
				}
			}
			//pop-up was not found at all, so obviously, not top-level
			return false;
		}

		/**
		 * @copy PopUpManager#centerPopUp()
		 */
		public centerPopUp(popUp:DisplayObject):void
		{
			var stage:Stage = this._root.stage;
			if(popUp instanceof this.IValidating)
			{
				this.IValidating(popUp).validate();
			}
			popUp.x = Math.round((stage.stageWidth - popUp.width) / 2);
			popUp.y = Math.round((stage.stageHeight - popUp.height) / 2);
		}

		/**
		 * @private
		 */
		protected popUp_resizeHandler(event:Event):void
		{
			var popUp:DisplayObject = DisplayObject(event.currentTarget);
			var index:number = this._centeredPopUps.indexOf(popUp);
			if(index < 0)
			{
				return;
			}
			this.centerPopUp(popUp);
		}

		/**
		 * @private
		 */
		protected popUp_removedFromStageHandler(event:Event):void
		{
			if(this._ignoreRemoval)
			{
				return;
			}
			var popUp:DisplayObject = DisplayObject(event.currentTarget);
			popUp.removeEventListener(Event.REMOVED_FROM_STAGE, this.popUp_removedFromStageHandler);
			var index:number = this._popUps.indexOf(popUp);
			this._popUps.splice(index, 1);
			var overlay:DisplayObject = DisplayObject(this._popUpToOverlay[popUp]);
			if(overlay)
			{
				overlay.removeFromParent(true);
				delete this._popUpToOverlay[popUp];
			}
			var focusManager:IFocusManager = <IFocusManager>this._popUpToFocusManager[popUp] ;
			if(focusManager)
			{
				delete this._popUpToFocusManager[popUp];
				this.FocusManager.removeFocusManager(focusManager);
			}
			index = this._centeredPopUps.indexOf(popUp);
			if(index >= 0)
			{
				if(popUp instanceof this.IFeathersControl)
				{
					popUp.removeEventListener(FeathersEventType.RESIZE, this.popUp_resizeHandler);
				}
				this._centeredPopUps.splice(index, 1);
			}

			if(this._popUps.length == 0)
			{
				this._root.stage.removeEventListener(ResizeEvent.RESIZE, this.stage_resizeHandler);
			}
		}

		/**
		 * @private
		 */
		protected stage_resizeHandler(event:ResizeEvent):void
		{
			var stage:Stage = this._root.stage;
			var popUpCount:number = this._popUps.length;
			for(var i:number = 0; i < popUpCount; i++)
			{
				var popUp:DisplayObject = this._popUps[i];
				var overlay:DisplayObject = DisplayObject(this._popUpToOverlay[popUp]);
				if(overlay)
				{
					overlay.width = stage.stageWidth;
					overlay.height = stage.stageHeight;
				}
			}
			popUpCount = this._centeredPopUps.length;
			for(i = 0; i < popUpCount; i++)
			{
				popUp = this._centeredPopUps[i];
				this.centerPopUp(popUp);
			}
		}
	}
}
