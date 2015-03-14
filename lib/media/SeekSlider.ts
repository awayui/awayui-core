/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import Slider = feathers.controls.Slider;

	import Event = starling.events.Event;

	export class SeekSlider extends Slider implements IMediaPlayerControl
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
			this.addEventListener(Event.CHANGE, this.seekSlider_changeHandler);
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
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.CURRENT_TIME_CHANGE, this.mediaPlayer_currentTimeChangeHandler);
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.TOTAL_TIME_CHANGE, this.mediaPlayer_totalTimeChangeHandler);
			}
			this._mediaPlayer = <ITimedMediaPlayer>value ;
			if(this._mediaPlayer)
			{
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE, this.mediaPlayer_playbackStateChangeHandler);
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.CURRENT_TIME_CHANGE, this.mediaPlayer_currentTimeChangeHandler);
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.TOTAL_TIME_CHANGE, this.mediaPlayer_totalTimeChangeHandler);
				this.minimum = 0;
				this.maximum = this._mediaPlayer.totalTime;
				this.value = this._mediaPlayer.currentTime;
			}
			else
			{
				this.minimum = 0;
				this.maximum = 0;
				this.value = 0;
			}
		}

		/**
		 * @private
		 */
		protected seekSlider_changeHandler(event:Event):void
		{
			if(!this._mediaPlayer)
			{
				return;
			}
			this._mediaPlayer.seek(this._value);
		}

		/**
		 * @private
		 */
		protected mediaPlayer_playbackStateChangeHandler(event:Event):void
		{
			if(!this._mediaPlayer.isPlaying)
			{
				this._touchPointID = -1;
			}
		}

		/**
		 * @private
		 */
		protected mediaPlayer_currentTimeChangeHandler(event:Event):void
		{
			if(this.isDragging)
			{
				//if we're currently dragging, ignore changes by the player
				return;
			}
			this._value = this._mediaPlayer.currentTime;
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected mediaPlayer_totalTimeChangeHandler(event:Event):void
		{
			this.maximum = this._mediaPlayer.totalTime;
		}
		
	}
}
