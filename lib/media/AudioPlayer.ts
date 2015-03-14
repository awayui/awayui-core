/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import ErrorEvent = flash.events.ErrorEvent;
	import IOErrorEvent = flash.events.IOErrorEvent;
	import ProgressEvent = flash.events.ProgressEvent;
	import SecurityErrorEvent = flash.events.SecurityErrorEvent;
	import Sound = flash.media.Sound;
	import SoundChannel = flash.media.SoundChannel;
	import SoundTransform = flash.media.SoundTransform;
	import URLLoader = flash.net.URLLoader;
	import URLRequest = flash.net.URLRequest;

	import Event = starling.events.Event;

	export class AudioPlayer extends BaseTimedMediaPlayer implements IAudioPlayer
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
		protected _sound:Sound;

		public get sound():Sound
		{
			return this._sound;
		}
		
		/**
		 * @private
		 */
		protected _soundChannel:SoundChannel;
		
		public get soundChannel():SoundChannel
		{
			return this._soundChannel;
		}

		/**
		 * @private
		 */
		protected _audioSource:Object;
		
		public get audioSource():Object
		{
			return this._audioSource;
		}

		/**
		 * @private
		 */
		public set audioSource(value:Object)
		{
			if(this._audioSource === value)
			{
				return;
			}
			this._audioSource = value;
			this._isLoaded = false;
			if(this._audioSource instanceof String)
			{
				this.loadSourceFromURL(<String>value );
			}
			else if(this._audioSource instanceof URLRequest)
			{
				this.loadSourceFromURLRequest(URLRequest(value));
			}
			else if(this._audioSource instanceof Sound)
			{
				this._sound = Sound(this._audioSource);
			}
			else
			{
				throw new ArgumentError("Invalid source type for AudioPlayer. Expected a URL as a String, an URLRequest, or a Sound object.")
			}
		}

		/**
		 * @private
		 */
		protected _isLoading:boolean = false;

		public get isLoading():boolean
		{
			return this._isLoading;
		}

		/**
		 * @private
		 */
		protected _isLoaded:boolean = false;

		public get isLoaded():boolean
		{
			return this._isLoaded;
		}

		/**
		 * @private
		 */
		protected _soundTransform:SoundTransform;
		
		public get soundTransform():SoundTransform
		{
			if(!this._soundTransform)
			{
				this._soundTransform = new SoundTransform();
			}
			return this._soundTransform;
		}

		/**
		 * @private
		 */
		public set soundTransform(value:SoundTransform)
		{
			this._soundTransform = value;
			if(this._soundChannel)
			{
				this._soundChannel.soundTransform = this._soundTransform;
			}
		}

		/**
		 * @private
		 */
		protected _autoPlay:boolean = true;

		public get autoPlay():boolean
		{
			return this._autoPlay;
		}

		/**
		 * @private
		 */
		public set autoPlay(value:boolean)
		{
			this._autoPlay = value;
		}

		/**
		 * @private
		 */
		protected _autoRewind:boolean = true;

		public get autoRewind():boolean
		{
			return this._autoRewind;
		}

		/**
		 * @private
		 */
		public set autoRewind(value:boolean)
		{
			this._autoRewind = value;
		}
		
		/*override*/ public play():void
		{
			if(this._isPlaying)
			{
				return;
			}
			if(this._isLoading)
			{
				this._autoPlay = true;
				return;
			}
			super.play();
		}

		/**
		 * @private
		 */
		/*override*/ protected playMedia():void
		{
			if(this._currentTime == this._totalTime)
			{
				this.handleSoundComplete();
				return;
			}
			if(!this._soundTransform)
			{
				this._soundTransform = new SoundTransform();
			}
			this._soundChannel = this._sound.play(this._currentTime * 1000, 0, this._soundTransform);
			this._soundChannel.addEventListener(this.flash.events.Event.SOUND_COMPLETE, this.soundChannel_soundCompleteHandler);
			this.addEventListener(this.starling.events.Event.ENTER_FRAME, this.audioPlayer_enterFrameHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected pauseMedia():void
		{
			if(!this._soundChannel)
			{
				//this could be null when seeking
				return;
			}
			this.removeEventListener(this.starling.events.Event.ENTER_FRAME, this.audioPlayer_enterFrameHandler);
			this._soundChannel.stop();
			this._soundChannel.removeEventListener(this.flash.events.Event.SOUND_COMPLETE, this.soundChannel_soundCompleteHandler);
			this._soundChannel = null;
		}

		/**
		 * @private
		 */
		/*override*/ protected seekMedia(seconds:number):void
		{
			this.pauseMedia();
			this._currentTime = seconds;
			if(this._isPlaying)
			{
				this.playMedia();
			}
		}

		/**
		 * @private
		 */
		protected handleSoundComplete():void
		{
			if(this._autoRewind)
			{
				this.stop();
			}
			else
			{
				this.pause();
			}
		}

		/**
		 * @private
		 */
		protected loadSourceFromURL(url:string):void
		{
			this.loadSourceFromURLRequest(new URLRequest(url));
		}

		/**
		 * @private
		 */
		protected loadSourceFromURLRequest(request:URLRequest):void
		{
			this._isLoading = true;
			if(this._sound)
			{
				this._sound.removeEventListener(IOErrorEvent.IO_ERROR, this.sound_errorHandler);
				this._sound.removeEventListener(ProgressEvent.PROGRESS, this.sound_progressHandler);
				this._sound.removeEventListener(Event.COMPLETE, this.sound_completeHandler);
			}
			this._sound = new Sound();
			this._sound.addEventListener(IOErrorEvent.IO_ERROR, this.sound_errorHandler);
			this._sound.addEventListener(ProgressEvent.PROGRESS, this.sound_progressHandler);
			this._sound.addEventListener(Event.COMPLETE, this.sound_completeHandler);
			this._sound.load(request);
		}

		/**
		 * @private
		 */
		protected audioPlayer_enterFrameHandler(event:Eventing.events.Event):void
		{
			this._currentTime = this._soundChannel.position / 1000;
			this.dispatchEventWith(this.MediaPlayerEventType.CURRENT_TIME_CHANGE);
		}

		/**
		 * @private
		 */
		protected sound_completeHandler(event:Event.events.Event):void
		{
			this._totalTime = this._sound.length / 1000;
			this.dispatchEventWith(this.MediaPlayerEventType.TOTAL_TIME_CHANGE);
			this._isLoading = false;
			this._isLoaded = true;
			this.dispatchEventWith(this.MediaPlayerEventType.LOAD_COMPLETE);
			if(this._autoPlay)
			{
				this.play();
			}
		}

		/**
		 * @private
		 */
		protected sound_progressHandler(event:ProgressEvent):void
		{
			this.dispatchEventWith(this.MediaPlayerEventType.LOAD_PROGRESS, false, event.bytesLoaded / event.bytesTotal);
		}

		/**
		 * @private
		 */
		protected sound_errorHandler(event:ErrorEvent):void
		{
			trace("sound error", event);
		}

		/**
		 * @private
		 */
		protected soundChannel_soundCompleteHandler(event:Event.events.Event):void
		{
			this.handleSoundComplete();
		}
		
	}
}
