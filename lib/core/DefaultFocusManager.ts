/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import LayoutViewPort = feathers.controls.supportClasses.LayoutViewPort;
	import FeathersEventType = feathers.events.FeathersEventType;

	import InteractiveObject = flash.display.InteractiveObject;
	import Stage = flash.display.Stage;
	import FocusEvent = flash.events.FocusEvent;
	import Keyboard = flash.ui.Keyboard;
	import Dictionary = flash.utils.Dictionary;

	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;
	import Event = starling.events.Event;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * The default <code>IPopUpManager</code> implementation.
	 *
	 * @see FocusManager
	 */
	export class DefaultFocusManager implements IFocusManager
	{
		/**
		 * @private
		 */
		protected static NATIVE_STAGE_TO_FOCUS_TARGET:Dictionary = new Dictionary(true);

		/**
		 * Constructor.
		 */
		constructor(root:DisplayObjectContainer)
		{
			if(!root.stage)
			{
				throw new ArgumentError("Focus manager root must be added to the stage.");
			}
			this._root = root;
			for each(var starling:Starling in Starling.all)
			{
				if(starling.stage == root.stage)
				{
					this._starling = starling;
					break;
				}
			}
			this.setFocusManager(this._root);
		}

		/**
		 * @private
		 */
		protected _starling:Starling;

		/**
		 * @private
		 */
		protected _nativeFocusTarget:NativeFocusTarget;

		/**
		 * @private
		 */
		protected _root:DisplayObjectContainer;

		/**
		 * @inheritDoc
		 */
		public get root():DisplayObjectContainer
		{
			return this._root;
		}

		/**
		 * @private
		 */
		protected _isEnabled:boolean = false;

		/**
		 * @inheritDoc
		 *
		 * @default false
		 */
		public get isEnabled():boolean
		{
			return this._isEnabled;
		}

		/**
		 * @private
		 */
		public set isEnabled(value:boolean)
		{
			if(this._isEnabled == value)
			{
				return;
			}
			this._isEnabled = value;
			if(this._isEnabled)
			{
				this._nativeFocusTarget = <NativeFocusTarget>DefaultFocusManager.NATIVE_STAGE_TO_FOCUS_TARGET[this._starling.nativeStage] ;
				if(!this._nativeFocusTarget)
				{
					this._nativeFocusTarget = new NativeFocusTarget();
					this._starling.nativeOverlay.addChild(this._nativeFocusTarget);
				}
				else
				{
					this._nativeFocusTarget.referenceCount++;
				}
				this._root.addEventListener(Event.ADDED, this.topLevelContainer_addedHandler);
				this._root.addEventListener(Event.REMOVED, this.topLevelContainer_removedHandler);
				this._root.addEventListener(TouchEvent.TOUCH, this.topLevelContainer_touchHandler);
				this._starling.nativeStage.addEventListener(FocusEvent.KEY_FOCUS_CHANGE, this.stage_keyFocusChangeHandler, false, 0, true);
				this._starling.nativeStage.addEventListener(FocusEvent.MOUSE_FOCUS_CHANGE, this.stage_mouseFocusChangeHandler, false, 0, true);
				this.focus = this._savedFocus;
				this._savedFocus = null;
			}
			else
			{
				this._nativeFocusTarget.referenceCount--;
				if(this._nativeFocusTarget.referenceCount <= 0)
				{
					this._nativeFocusTarget.parent.removeChild(this._nativeFocusTarget);
					delete DefaultFocusManager.NATIVE_STAGE_TO_FOCUS_TARGET[this._starling.nativeStage];
				}
				this._nativeFocusTarget = null;
				this._root.removeEventListener(Event.ADDED, this.topLevelContainer_addedHandler);
				this._root.removeEventListener(Event.REMOVED, this.topLevelContainer_removedHandler);
				this._root.removeEventListener(TouchEvent.TOUCH, this.topLevelContainer_touchHandler);
				this._starling.nativeStage.removeEventListener(FocusEvent.KEY_FOCUS_CHANGE, this.stage_keyFocusChangeHandler);
				this._starling.nativeStage.addEventListener(FocusEvent.MOUSE_FOCUS_CHANGE, this.stage_mouseFocusChangeHandler);
				var focusToSave:IFocusDisplayObject = this.focus;
				this.focus = null;
				this._savedFocus = focusToSave;
			}
		}

		/**
		 * @private
		 */
		protected _savedFocus:IFocusDisplayObject;

		/**
		 * @private
		 */
		protected _focus:IFocusDisplayObject;

		/**
		 * @inheritDoc
		 *
		 * @default null
		 */
		public get focus():IFocusDisplayObject
		{
			return this._focus;
		}

		/**
		 * @private
		 */
		public set focus(value:IFocusDisplayObject)
		{
			if(this._focus == value)
			{
				return;
			}
			var oldFocus:IFeathersDisplayObject = this._focus;
			if(this._isEnabled && value && value.isFocusEnabled && value.focusManager == this)
			{
				this._focus = value;
			}
			else
			{
				this._focus = null;
			}
			if(oldFocus)
			{
				//this event should be dispatched after setting the new value of
				//_focus because we want to be able to access it in the event
				//listener
				oldFocus.dispatchEventWith(FeathersEventType.FOCUS_OUT);
			}
			if(this._isEnabled)
			{
				var nativeStage:Stage = this._starling.nativeStage;
				if(this._focus)
				{
					if(!nativeStage.focus)
					{
						nativeStage.focus = this._nativeFocusTarget;
					}
					nativeStage.focus.addEventListener(FocusEvent.FOCUS_OUT, this.nativeFocus_focusOutHandler, false, 0, true);
					this._focus.dispatchEventWith(FeathersEventType.FOCUS_IN);
				}
				else
				{
					nativeStage.focus = null;
				}
			}
			else
			{
				this._savedFocus = value;
			}
		}

		/**
		 * @private
		 */
		protected setFocusManager(target:DisplayObject):void
		{
			if(target instanceof this.IFocusDisplayObject)
			{
				var targetWithFocus:IFocusDisplayObject = this.IFocusDisplayObject(target);
				targetWithFocus.focusManager = this;
			}
			if((target instanceof DisplayObjectContainer && !(target instanceof this.IFocusDisplayObject)) ||
				(target instanceof this.IFocusContainer && this.IFocusContainer(target).isChildFocusEnabled))
			{
				var container:DisplayObjectContainer = DisplayObjectContainer(target);
				var childCount:number = container.numChildren;
				for(var i:number = 0; i < childCount; i++)
				{
					var child:DisplayObject = container.getChildAt(i);
					this.setFocusManager(child);
				}
				if(container instanceof this.IFocusExtras)
				{
					var containerWithExtras:IFocusExtras = this.IFocusExtras(container);
					var extras:DisplayObject[] = containerWithExtras.focusExtrasBefore;
					if(extras)
					{
						childCount = extras.length;
						for(i = 0; i < childCount; i++)
						{
							child = extras[i];
							this.setFocusManager(child);
						}
					}
					extras = containerWithExtras.focusExtrasAfter;
					if(extras)
					{
						childCount = extras.length;
						for(i = 0; i < childCount; i++)
						{
							child = extras[i];
							this.setFocusManager(child);
						}
					}
				}
			}
		}

		/**
		 * @private
		 */
		protected clearFocusManager(target:DisplayObject):void
		{
			if(target instanceof this.IFocusDisplayObject)
			{
				var targetWithFocus:IFocusDisplayObject = this.IFocusDisplayObject(target);
				if(targetWithFocus.focusManager == this)
				{
					if(this._focus == targetWithFocus)
					{
						//change to focus owner, which falls back to null
						this.focus = targetWithFocus.focusOwner;
					}
					targetWithFocus.focusManager = null;
				}
			}
			if(target instanceof DisplayObjectContainer)
			{
				var container:DisplayObjectContainer = DisplayObjectContainer(target);
				var childCount:number = container.numChildren;
				for(var i:number = 0; i < childCount; i++)
				{
					var child:DisplayObject = container.getChildAt(i);
					this.clearFocusManager(child);
				}
				if(container instanceof this.IFocusExtras)
				{
					var containerWithExtras:IFocusExtras = this.IFocusExtras(container);
					var extras:DisplayObject[] = containerWithExtras.focusExtrasBefore;
					if(extras)
					{
						childCount = extras.length;
						for(i = 0; i < childCount; i++)
						{
							child = extras[i];
							this.clearFocusManager(child);
						}
					}
					extras = containerWithExtras.focusExtrasAfter;
					if(extras)
					{
						childCount = extras.length;
						for(i = 0; i < childCount; i++)
						{
							child = extras[i];
							this.clearFocusManager(child);
						}
					}
				}
			}
		}

		/**
		 * @private
		 */
		protected findPreviousContainerFocus(container:DisplayObjectContainer, beforeChild:DisplayObject, fallbackToGlobal:boolean):IFocusDisplayObject
		{
			if(container instanceof LayoutViewPort)
			{
				container = container.parent;
			}
			var hasProcessedBeforeChild:boolean = beforeChild == null;
			if(container instanceof this.IFocusExtras)
			{
				var focusWithExtras:IFocusExtras = this.IFocusExtras(container);
				var extras:DisplayObject[] = focusWithExtras.focusExtrasAfter;
				if(extras)
				{
					var skip:boolean = false;
					if(beforeChild)
					{
						var startIndex:number = extras.indexOf(beforeChild) - 1;
						hasProcessedBeforeChild = startIndex >= -1;
						skip = !hasProcessedBeforeChild;
					}
					else
					{
						startIndex = extras.length - 1;
					}
					if(!skip)
					{
						for(var i:number = startIndex; i >= 0; i--)
						{
							var child:DisplayObject = extras[i];
							var foundChild:IFocusDisplayObject = this.findPreviousChildFocus(child);
							if(this.isValidFocus(foundChild))
							{
								return foundChild;
							}
						}
					}
				}
			}
			if(beforeChild && !hasProcessedBeforeChild)
			{
				startIndex = container.getChildIndex(beforeChild) - 1;
				hasProcessedBeforeChild = startIndex >= -1;
			}
			else
			{
				startIndex = container.numChildren - 1;
			}
			for(i = startIndex; i >= 0; i--)
			{
				child = container.getChildAt(i);
				foundChild = this.findPreviousChildFocus(child);
				if(this.isValidFocus(foundChild))
				{
					return foundChild;
				}
			}
			if(container instanceof this.IFocusExtras)
			{
				extras = focusWithExtras.focusExtrasBefore;
				if(extras)
				{
					skip = false;
					if(beforeChild && !hasProcessedBeforeChild)
					{
						startIndex = extras.indexOf(beforeChild) - 1;
						hasProcessedBeforeChild = startIndex >= -1;
						skip = !hasProcessedBeforeChild;
					}
					else
					{
						startIndex = extras.length - 1;
					}
					if(!skip)
					{
						for(i = startIndex; i >= 0; i--)
						{
							child = extras[i];
							foundChild = this.findPreviousChildFocus(child);
							if(this.isValidFocus(foundChild))
							{
								return foundChild;
							}
						}
					}
				}
			}

			if(fallbackToGlobal && container != this._root)
			{
				//try the container itself before moving backwards
				if(container instanceof this.IFocusDisplayObject)
				{
					var focusContainer:IFocusDisplayObject = this.IFocusDisplayObject(container);
					if(this.isValidFocus(focusContainer))
					{
						return focusContainer;
					}
				}
				return this.findPreviousContainerFocus(container.parent, container, true);
			}
			return null;
		}

		/**
		 * @private
		 */
		protected findNextContainerFocus(container:DisplayObjectContainer, afterChild:DisplayObject, fallbackToGlobal:boolean):IFocusDisplayObject
		{
			if(container instanceof LayoutViewPort)
			{
				container = container.parent;
			}
			var hasProcessedAfterChild:boolean = afterChild == null;
			if(container instanceof this.IFocusExtras)
			{
				var focusWithExtras:IFocusExtras = this.IFocusExtras(container);
				var extras:DisplayObject[] = focusWithExtras.focusExtrasBefore;
				if(extras)
				{
					var skip:boolean = false;
					if(afterChild)
					{
						var startIndex:number = extras.indexOf(afterChild) + 1;
						hasProcessedAfterChild = startIndex > 0;
						skip = !hasProcessedAfterChild;
					}
					else
					{
						startIndex = 0;
					}
					if(!skip)
					{
						var childCount:number = extras.length;
						for(var i:number = startIndex; i < childCount; i++)
						{
							var child:DisplayObject = extras[i];
							var foundChild:IFocusDisplayObject = this.findNextChildFocus(child);
							if(this.isValidFocus(foundChild))
							{
								return foundChild;
							}
						}
					}
				}
			}
			if(afterChild && !hasProcessedAfterChild)
			{
				startIndex = container.getChildIndex(afterChild) + 1;
				hasProcessedAfterChild = startIndex > 0;
			}
			else
			{
				startIndex = 0;
			}
			childCount = container.numChildren;
			for(i = startIndex; i < childCount; i++)
			{
				child = container.getChildAt(i);
				foundChild = this.findNextChildFocus(child);
				if(this.isValidFocus(foundChild))
				{
					return foundChild;
				}
			}
			if(container instanceof this.IFocusExtras)
			{
				extras = focusWithExtras.focusExtrasAfter;
				if(extras)
				{
					skip = false;
					if(afterChild && !hasProcessedAfterChild)
					{
						startIndex = extras.indexOf(afterChild) + 1;
						hasProcessedAfterChild = startIndex > 0;
						skip = !hasProcessedAfterChild;
					}
					else
					{
						startIndex = 0;
					}
					if(!skip)
					{
						childCount = extras.length;
						for(i = startIndex; i < childCount; i++)
						{
							child = extras[i];
							foundChild = this.findNextChildFocus(child);
							if(this.isValidFocus(foundChild))
							{
								return foundChild;
							}
						}
					}
				}
			}

			if(fallbackToGlobal && container != this._root)
			{
				return this.findNextContainerFocus(container.parent, container, true);
			}
			return null;
		}

		/**
		 * @private
		 */
		protected findPreviousChildFocus(child:DisplayObject):IFocusDisplayObject
		{
			if((child instanceof DisplayObjectContainer && !(child instanceof this.IFocusDisplayObject)) ||
				(child instanceof this.IFocusContainer && this.IFocusContainer(child).isChildFocusEnabled))
			{
				var childContainer:DisplayObjectContainer = DisplayObjectContainer(child);
				var foundChild:IFocusDisplayObject = this.findPreviousContainerFocus(childContainer, null, false);
				if(foundChild)
				{
					return foundChild;
				}
			}
			if(child instanceof this.IFocusDisplayObject)
			{
				var childWithFocus:IFocusDisplayObject = this.IFocusDisplayObject(child);
				if(this.isValidFocus(childWithFocus))
				{
					return childWithFocus;
				}
			}
			return null;
		}

		/**
		 * @private
		 */
		protected findNextChildFocus(child:DisplayObject):IFocusDisplayObject
		{
			if(child instanceof this.IFocusDisplayObject)
			{
				var childWithFocus:IFocusDisplayObject = this.IFocusDisplayObject(child);
				if(this.isValidFocus(childWithFocus))
				{
					return childWithFocus;
				}
			}
			if((child instanceof DisplayObjectContainer && !(child instanceof this.IFocusDisplayObject)) ||
				(child instanceof this.IFocusContainer && this.IFocusContainer(child).isChildFocusEnabled))
			{
				var childContainer:DisplayObjectContainer = DisplayObjectContainer(child);
				var foundChild:IFocusDisplayObject = this.findNextContainerFocus(childContainer, null, false);
				if(foundChild)
				{
					return foundChild;
				}
			}
			return null;
		}

		/**
		 * @private
		 */
		protected isValidFocus(child:IFocusDisplayObject):boolean
		{
			if(!child || !child.isFocusEnabled || child.focusManager != this)
			{
				return false;
			}
			var uiChild:IFeathersControl = <IFeathersControl>child ;
			if(uiChild && !uiChild.isEnabled)
			{
				return false;
			}
			return true;
		}

		/**
		 * @private
		 */
		protected stage_mouseFocusChangeHandler(event:FocusEvent):void
		{
			if(event.relatedObject)
			{
				//we need to allow mouse focus to be passed to native display
				//objects. for instance, hyperlinks in TextField won't work
				//unless the TextField can be focused.
				this.focus = null;
				return;
			}
			event.preventDefault();
		}

		/**
		 * @private
		 */
		protected stage_keyFocusChangeHandler(event:FocusEvent):void
		{
			//keyCode 0 is sent by IE, for some reason
			if(event.keyCode != Keyboard.TAB && event.keyCode != 0)
			{
				return;
			}

			var newFocus:IFocusDisplayObject;
			var currentFocus:IFocusDisplayObject = this._focus;
			if(currentFocus && currentFocus.focusOwner)
			{
				newFocus = currentFocus.focusOwner;
			}
			else if(event.shiftKey)
			{
				if(currentFocus)
				{
					if(currentFocus.previousTabFocus)
					{
						newFocus = currentFocus.previousTabFocus;
					}
					else
					{
						newFocus = this.findPreviousContainerFocus(currentFocus.parent, DisplayObject(currentFocus), true);
					}
				}
				if(!newFocus)
				{
					newFocus = this.findPreviousContainerFocus(this._root, null, false);
				}
			}
			else
			{
				if(currentFocus)
				{
					if(currentFocus.nextTabFocus)
					{
						newFocus = currentFocus.nextTabFocus;
					}
					else if(currentFocus instanceof this.IFocusContainer && this.IFocusContainer(currentFocus).isChildFocusEnabled)
					{
						newFocus = this.findNextContainerFocus(DisplayObjectContainer(currentFocus), null, false);
					}
					else
					{
						newFocus = this.findNextContainerFocus(currentFocus.parent, DisplayObject(currentFocus), true);
					}
				}
				if(!newFocus)
				{
					newFocus = this.findNextContainerFocus(this._root, null, false);
				}
			}
			if(newFocus)
			{
				event.preventDefault();
			}
			this.focus = newFocus;
			if(this._focus)
			{
				this._focus.showFocus();
			}

		}

		/**
		 * @private
		 */
		protected topLevelContainer_addedHandler(event:Event):void
		{
			this.setFocusManager(DisplayObject(event.target));

		}

		/**
		 * @private
		 */
		protected topLevelContainer_removedHandler(event:Event):void
		{
			this.clearFocusManager(DisplayObject(event.target));
		}

		/**
		 * @private
		 */
		protected topLevelContainer_touchHandler(event:TouchEvent):void
		{
			var touch:Touch = event.getTouch(this._root, TouchPhase.BEGAN);
			if(!touch)
			{
				return;
			}

			var focusTarget:IFocusDisplayObject = null;
			var target:DisplayObject = touch.target;
			do
			{
				if(target instanceof this.IFocusDisplayObject)
				{
					var tempFocusTarget:IFocusDisplayObject = this.IFocusDisplayObject(target);
					if(this.isValidFocus(tempFocusTarget))
					{
						if(!focusTarget || !(tempFocusTarget instanceof this.IFocusContainer) || !(this.IFocusContainer(tempFocusTarget).isChildFocusEnabled))
						{
							focusTarget = tempFocusTarget;
						}
					}
				}
				target = target.parent;
			}
			while(target)
			this.focus = focusTarget;
		}

		/**
		 * @private
		 */
		protected nativeFocus_focusOutHandler(event:FocusEvent):void
		{
			var nativeFocus:InteractiveObject = InteractiveObject(event.currentTarget);
			var nativeStage:Stage = this._starling.nativeStage;
			if(this._focus && !nativeStage.focus)
			{
				//if there's still a feathers focus, but the native stage object has
				//lost focus for some reason, and there's no focus at all, force it
				//back into focus.
				//this can happen on app deactivate!
				nativeStage.focus = this._nativeFocusTarget;
			}
			if(nativeFocus != nativeStage.focus)
			{
				//otherwise, we should stop listening for this event
				nativeFocus.removeEventListener(FocusEvent.FOCUS_OUT, this.nativeFocus_focusOutHandler);
			}
		}
	}
}

import Sprite = flash.display.Sprite;

class NativeFocusTarget extends Sprite
{
	constructor()
	{
		this.tabEnabled = true;
		this.mouseEnabled = false;
		this.mouseChildren = false;
		this.alpha = 0;
	}

	public referenceCount:number = 1;
