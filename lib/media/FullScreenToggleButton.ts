/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import ToggleButton = feathers.controls.ToggleButton;
	import ToggleGroup = feathers.core.ToggleGroup;

	import Stage = flash.display.Stage;

	import StageDisplayState = flash.display.StageDisplayState;
	import FullScreenEvent = flash.events.FullScreenEvent;

	import Starling = starling.core.Starling;
	import Event = starling.events.Event;

	export class FullScreenToggleButton extends ToggleButton implements IMediaPlayerControl
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			//we don't actually want this to toggle automatically. instead,
			//we'll update isSelected based on events dispatched by the media
			//player
			this.isToggle = false;
			this.addEventListener(Event.TRIGGERED, this.fullScreenButton_triggeredHandler);
		}

		/**
		 * @private
		 */
		protected _mediaPlayer:VideoPlayer;

		public get mediaPlayer():IMediaPlayer
		{
			return this._mediaPlayer;
		}

		/**
		 * @private
		 */
		public set mediaPlayer(value:IMediaPlayer)
		{
			if(this._mediaPlayer == value)
			{
				return;
			}
			if(this._mediaPlayer)
			{
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.DISPLAY_STATE_CHANGE, this.mediaPlayer_displayStageChangeHandler);
			}
			this._mediaPlayer = <VideoPlayer>value ;
			if(this._mediaPlayer)
			{
				this.isSelected = this._mediaPlayer.isFullScreen;
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.DISPLAY_STATE_CHANGE, this.mediaPlayer_displayStageChangeHandler);
			}
		}
		
		/**
		 * @private
		 */
		protected fullScreenButton_triggeredHandler(event:Event):void
		{
			this._mediaPlayer.toggleFullScreen();
		}
		
		/**
		 * @private
		 */
		protected mediaPlayer_displayStageChangeHandler(event:Event):void
		{
			this.isSelected = this._mediaPlayer.isFullScreen;
		}
	}
}
