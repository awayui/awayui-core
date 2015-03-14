/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import Button = feathers.controls.Button;
	import ToggleButton = feathers.controls.ToggleButton;

	import NetStream = flash.net.NetStream;

	import Event = starling.events.Event;

	export class PlayPauseToggleButton extends ToggleButton implements IMediaPlayerControl
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
			this.addEventListener(Event.TRIGGERED, this.playPlayButton_triggeredHandler);
		}

		/**
		 * @private
		 */
		protected _mediaPlayer:ITimedMediaPlayer;
		
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
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE, this.mediaPlayer_playbackStateChangeHandler);
			}
			this._mediaPlayer = <ITimedMediaPlayer>value ;
			if(this._mediaPlayer)
			{
				this.isSelected = this._mediaPlayer.isPlaying;
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE, this.mediaPlayer_playbackStateChangeHandler);
			}
			else
			{
				this.isSelected = false;
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected playPlayButton_triggeredHandler(event:Event):void
		{
			this._mediaPlayer.togglePlayPause();
		}

		/**
		 * @private
		 */
		protected mediaPlayer_playbackStateChangeHandler(event:Event):void
		{
			this.isSelected = this._mediaPlayer.isPlaying;
		}
	}
}
