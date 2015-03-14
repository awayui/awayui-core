/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import Label = feathers.controls.Label;

	import Event = starling.events.Event;

	export class TimeLabel extends Label implements IMediaPlayerControl
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
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.CURRENT_TIME_CHANGE, this.mediaPlayer_currentTimeChangeHandler);
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.TOTAL_TIME_CHANGE, this.mediaPlayer_totalTimeChangeHandler);
			}
			this._mediaPlayer = <ITimedMediaPlayer>value ;
			if(this._mediaPlayer)
			{
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.CURRENT_TIME_CHANGE, this.mediaPlayer_currentTimeChangeHandler);
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.TOTAL_TIME_CHANGE, this.mediaPlayer_totalTimeChangeHandler);
			}
			this.updateText();
		}

		/**
		 * @private
		 */
		protected updateText():void
		{
			var currentTime:number = this._mediaPlayer ? this._mediaPlayer.currentTime : 0;
			var totalTime:number = this._mediaPlayer ? this._mediaPlayer.totalTime : 0;
			this.text = this.secondsToTimeString(currentTime) + " / " + this.secondsToTimeString(totalTime);
		}

		/**
		 * @private
		 */
		protected secondsToTimeString(seconds:number):string
		{
			var hours:number = int(seconds / 3600);
			var minutes:number = int(seconds / 60);
			seconds = int(seconds - (hours * 3600) - (minutes * 60));
			var time:string = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
			if(hours > 0)
			{
				if(minutes < 10)
				{
					time = "0" + time;
				}
				time = hours + ":" + time;
			}
			return time;
		}

		/**
		 * @private
		 */
		protected mediaPlayer_currentTimeChangeHandler(event:Event):void
		{
			this.updateText();
		}

		/**
		 * @private
		 */
		protected mediaPlayer_totalTimeChangeHandler(event:Event):void
		{
			this.updateText();
		}
	}
}
