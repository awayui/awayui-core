/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import LayoutGroup = feathers.controls.LayoutGroup;
	import AnchorLayout = feathers.layout.AnchorLayout;

	import DisplayObject = starling.display.DisplayObject;
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;

	import Event = starling.events.Event;

	export class BaseMediaPlayer extends LayoutGroup implements IMediaPlayer
	{
		constructor()
		{
			super();
			this.addEventListener(Event.ADDED, this.mediaPlayer_addedHandler);
			this.addEventListener(Event.REMOVED, this.mediaPlayer_removedHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			if(!this._layout)
			{
				this.layout = new AnchorLayout();
			}
			super.initialize();
		}

		/**
		 * @private
		 */
		protected handleAddedChild(child:DisplayObject):void
		{
			if(child instanceof this.IMediaPlayerControl)
			{
				this.IMediaPlayerControl(child).mediaPlayer = this;
			}
			if(child instanceof DisplayObjectContainer)
			{
				var container:DisplayObjectContainer = DisplayObjectContainer(child);
				var childCount:number = container.numChildren;
				for(var i:number = 0; i < childCount; i++)
				{
					child = container.getChildAt(i);
					this.handleAddedChild(child);
				}
			}
		}

		/**
		 * @private
		 */
		protected handleRemovedChild(child:DisplayObject):void
		{
			if(child instanceof this.IMediaPlayerControl)
			{
				this.IMediaPlayerControl(child).mediaPlayer = null;
			}
			if(child instanceof DisplayObjectContainer)
			{
				var container:DisplayObjectContainer = DisplayObjectContainer(child);
				var childCount:number = container.numChildren;
				for(var i:number = 0; i < childCount; i++)
				{
					child = container.getChildAt(i);
					this.handleRemovedChild(child);
				}
			}
		}

		/**
		 * @private
		 */
		protected mediaPlayer_addedHandler(event:Event):void
		{
			var addedChild:DisplayObject = DisplayObject(event.target);
			this.handleAddedChild(addedChild);
		}

		/**
		 * @private
		 */
		protected mediaPlayer_removedHandler(event:Event):void
		{
			var removedChild:DisplayObject = DisplayObject(event.target);
			this.handleRemovedChild(removedChild);
		}
	}
}
