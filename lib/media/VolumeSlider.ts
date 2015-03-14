/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import Slider = feathers.controls.Slider;

	import SoundTransform = flash.media.SoundTransform;

	import Event = starling.events.Event;

	export class VolumeSlider extends Slider implements IMediaPlayerControl
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
			this.minimum = 0;
			this.maximum = 1;
			this.addEventListener(Event.CHANGE, this.volumeSlider_changeHandler);
		}

		/**
		 * @private
		 */
		protected _mediaPlayer:IAudioPlayer;

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
			this._mediaPlayer = <IAudioPlayer>value ;
			if(this._mediaPlayer)
			{
				this.value = this._mediaPlayer.soundTransform.volume;
			}
			else
			{
				this.value = 0;
			}
		}

		/**
		 * @private
		 */
		protected volumeSlider_changeHandler(event:Event):void
		{
			if(!this._mediaPlayer)
			{
				return;
			}
			var soundTransform:SoundTransform = this._mediaPlayer.soundTransform;
			soundTransform.volume = this._value;
			this._mediaPlayer.soundTransform = soundTransform;
		}
	}
}
