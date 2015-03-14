/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	export class BaseTimedMediaPlayer extends BaseMediaPlayer implements ITimedMediaPlayer
	{
		constructor()
		{
		}

		/**
		 * @private
		 */
		protected _isPlaying:boolean = false;

		/**
		 * Indicates if the video is currently playing or not.
		 */
		public get isPlaying():boolean
		{
			return this._isPlaying;
		}

		/**
		 * @private
		 */
		protected _currentTime:number = 0;

		/**
		 * The position of the video, in seconds.
		 *
		 * @see #totalTime
		 */
		public get currentTime():number
		{
			return this._currentTime;
		}

		/**
		 * @private
		 */
		protected _totalTime:number = 0;

		/**
		 * The total play time of the video, measured in seconds.
		 *
		 * @see #currentTime
		 */
		public get totalTime():number
		{
			return this._totalTime;
		}

		/**
		 * Toggles whether the video is playing or paused.
		 */
		public togglePlayPause():void
		{
			if(this._isPlaying)
			{
				this.pause();
			}
			else
			{
				this.play();
			}
		}

		/**
		 * Plays the video.
		 */
		public play():void
		{
			if(this._isPlaying)
			{
				return;
			}
			this.playMedia();
			this._isPlaying = true;
			this.dispatchEventWith(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE);
		}

		/**
		 * Pauses the video.
		 */
		public pause():void
		{
			if(!this._isPlaying)
			{
				return;
			}
			this.pauseMedia();
			this._isPlaying = false;
			this.dispatchEventWith(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE);
		}

		/**
		 * Stops the video.
		 */
		public stop():void
		{
			this.pause();
			this.seek(0);
		}

		/**
		 * Seeks the video to a specific position, in seconds.
		 */
		public seek(seconds:number):void
		{
			this.seekMedia(seconds);
			this.dispatchEventWith(this.MediaPlayerEventType.CURRENT_TIME_CHANGE);
		}
		
		protected playMedia():void
		{
			
		}

		protected pauseMedia():void
		{

		}

		protected seekMedia(seconds:number):void
		{

		}
	}
}
