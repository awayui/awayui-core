/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import ImageLoader = feathers.controls.ImageLoader;
	import LayoutGroup = feathers.controls.LayoutGroup;
	import IFeathersControl = feathers.core.IFeathersControl;
	import PopUpManager = feathers.core.PopUpManager;
	import FeathersEventType = feathers.events.FeathersEventType;

	import Stage = flash.display.Stage;
	import StageDisplayState = flash.display.StageDisplayState;
	import IOErrorEvent = flash.events.IOErrorEvent;
	import NetStatusEvent = flash.events.NetStatusEvent;
	import SoundTransform = flash.media.SoundTransform;
	import Video = flash.media.Video;
	import NetConnection = flash.net.NetConnection;
	import NetStream = flash.net.NetStream;
	import URLRequest = flash.net.URLRequest;

	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import Texture = starling.textures.Texture;

	export class VideoPlayer extends BaseTimedMediaPlayer implements IVideoPlayer
	{
		/**
		 * @private
		 */
		protected static NET_STATUS_CODE_NETSTREAM_PLAY_STOP:string = "NetStream.Play.Stop";

		/**
		 * @private
		 */
		protected static NET_STATUS_CODE_NETSTREAM_PLAY_STREAMNOTFOUND:string = "NetStream.Play.StreamNotFound";

		/**
		 * @private
		 */
		protected static NET_STATUS_CODE_NETSTREAM_SEEK_NOTIFY:string = "NetStream.Seek.Notify";
		
		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * @private
		 */
		protected _fullScreenContainer:LayoutGroup;

		/**
		 * @private
		 */
		protected _ignoreDisplayListEvents:boolean = false;

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
			if(this._netStream)
			{
				this._netStream.soundTransform = this._soundTransform;
			}
		}

		/**
		 * @private
		 */
		protected _texture:Texture;
		
		public get texture():Texture
		{
			return this._texture;
		}
		
		public get nativeWidth():number
		{
			if(this._texture)
			{
				return this._texture.nativeWidth;
			}
			return 0;
		}

		public get nativeHeight():number
		{
			if(this._texture)
			{
				return this._texture.nativeHeight;
			}
			return 0;
		}

		/**
		 * @private
		 */
		protected _netConnection:NetConnection;

		/**
		 * @private
		 */
		protected _netStream:NetStream;

		/**
		 * The <code>flash.media.NetStream</code> object used to play the video.
		 */
		public get netStream():NetStream
		{
			return this._netStream;
		}

		/**
		 * @private
		 */
		protected _videoSource:string;

		public get videoSource():string
		{
			return this._videoSource;
		}

		/**
		 * @private
		 */
		public set videoSource(value:string)
		{
			if(this._videoSource === value)
			{
				return;
			}
			this._videoSource = value;
			if(this._autoPlay)
			{
				this.play();
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
		protected _isFullScreen:boolean = false;

		/**
		 * Indicates if the video player is currently full screen or not.
		 */
		public get isFullScreen():boolean
		{
			return this._isFullScreen;
		}

		protected _fullScreenDisplayState:string = StageDisplayState.FULL_SCREEN_INTERACTIVE;

		public get fullScreenDisplayState():string
		{
			return this._fullScreenDisplayState;
		}

		public set fullScreenDisplayState(value:string)
		{
			if(this._fullScreenDisplayState == value)
			{
				return;
			}
			this._fullScreenDisplayState = value;
			if(this._isFullScreen)
			{
				var nativeStage:Stage = Starling.current.nativeStage;
				nativeStage.displayState = this._fullScreenDisplayState;
			}
		}
		
		/*override*/ public get hasVisibleArea():boolean
		{
			if(this._isFullScreen)
			{
				return false;
			}
			return super.hasVisibleArea;
		}

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			if(this._texture)
			{
				this._texture.dispose();
				this._texture = null;
			}
			if(this._netStream)
			{
				this._netStream.close();
				this._netStream = null;
				this._netConnection = null;
			}
			super.dispose();
		}

		/**
		 * Goes to full screen or returns to normal display.
		 */
		public toggleFullScreen():void
		{
			var nativeStage:Stage = Starling.current.nativeStage;
			var oldIgnoreDisplayListEvents:boolean = this._ignoreDisplayListEvents;
			this._ignoreDisplayListEvents = true;
			if(this._isFullScreen)
			{
				PopUpManager.removePopUp(this._fullScreenContainer, false);
				var childCount:number = this._fullScreenContainer.numChildren;
				for(var i:number = 0; i < childCount; i++)
				{
					var child:DisplayObject = this._fullScreenContainer.getChildAt(0);
					this.addChild(child);
				}
				nativeStage.displayState = StageDisplayState.NORMAL;
			}
			else
			{
				nativeStage.displayState = this._fullScreenDisplayState;
				if(!this._fullScreenContainer)
				{
					this._fullScreenContainer = new LayoutGroup();
					this._fullScreenContainer.autoSizeMode = LayoutGroup.AUTO_SIZE_MODE_STAGE;
				}
				this._fullScreenContainer.layout = this._layout;
				childCount = this.numChildren;
				for(i = 0; i < childCount; i++)
				{
					child = this.getChildAt(0);
					this._fullScreenContainer.addChild(child);
				}
				PopUpManager.addPopUp(this._fullScreenContainer, true, false);
			}
			this._ignoreDisplayListEvents = oldIgnoreDisplayListEvents;
			this._isFullScreen = !this._isFullScreen;
			this.dispatchEventWith(this.MediaPlayerEventType.DISPLAY_STATE_CHANGE);
		}

		/**
		 * @private
		 */
		/*override*/ protected playMedia():void
		{
			if(!this._netStream)
			{
				this._netConnection = new NetConnection();
				this._netConnection.connect(null);
				this._netStream = new NetStream(this._netConnection);
				this._netStream.client = new VideoPlayerNetStreamClient(this.netStream_onMetaData);
				this._netStream.addEventListener(NetStatusEvent.NET_STATUS, this.netStream_netStatusHandler);
				this._netStream.addEventListener(IOErrorEvent.IO_ERROR, this.netStream_ioErrorHandler);
			}
			if(!this._soundTransform)
			{
				this._soundTransform = new SoundTransform();
			}
			this._netStream.soundTransform = this._soundTransform;
			if(this._texture)
			{
				this._netStream.resume();
			}
			else
			{
				this._netStream.play(this._videoSource);
			}
			if(!this._texture)
			{
				this._texture = Texture.fromNetStream(this._netStream, Starling.current.contentScaleFactor);
			}
			this.addEventListener(Event.ENTER_FRAME, this.videoPlayer_enterFrameHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected pauseMedia():void
		{
			this.removeEventListener(Event.ENTER_FRAME, this.videoPlayer_enterFrameHandler);
			this._netStream.pause();
		}

		/**
		 * @private
		 */
		/*override*/ protected seekMedia(seconds:number):void
		{
			this._currentTime = seconds;
			this._netStream.seek(seconds);
		}

		/**
		 * @private
		 */
		protected videoPlayer_enterFrameHandler(event:Event):void
		{
			this._currentTime = this._netStream.time;
			this.dispatchEventWith(this.MediaPlayerEventType.CURRENT_TIME_CHANGE);
		}

		/**
		 * @private
		 */
		protected netStream_onMetaData(metadata:Object):void
		{
			this.dispatchEventWith(this.MediaPlayerEventType.DIMENSIONS_CHANGE);
			this._totalTime = metadata.duration;
			this.dispatchEventWith(this.MediaPlayerEventType.TOTAL_TIME_CHANGE);
		}

		/**
		 * @private
		 */
		protected netStream_ioErrorHandler(event:IOErrorEvent):void
		{
			trace("video error", event);
		}

		/**
		 * @private
		 */
		protected netStream_netStatusHandler(event:NetStatusEvent):void
		{
			var code:string = event.info.code;
			switch(code)
			{
				case VideoPlayer.NET_STATUS_CODE_NETSTREAM_PLAY_STREAMNOTFOUND:
				{
					this.dispatchEventWith(FeathersEventType.ERROR, false, code);
					break;
				}
				case VideoPlayer.NET_STATUS_CODE_NETSTREAM_PLAY_STOP:
				{
					if(this._isPlaying)
					{
						this.stop();
					}
					break;
				}
				case VideoPlayer.NET_STATUS_CODE_NETSTREAM_SEEK_NOTIFY:
				{
					this._currentTime = this._netStream.time;
					this.dispatchEventWith(this.MediaPlayerEventType.CURRENT_TIME_CHANGE);
					break;
				}
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected mediaPlayer_addedHandler(event:Event):void
		{
			if(this._ignoreDisplayListEvents)
			{
				return;
			}
			super.mediaPlayer_addedHandler(event);
		}

		/**
		 * @private
		 */
		/*override*/ protected mediaPlayer_removedHandler(event:Event):void
		{
			if(this._ignoreDisplayListEvents)
			{
				return;
			}
			super.mediaPlayer_removedHandler(event);
		}
	}
}

export class VideoPlayerNetStreamClient
{
	constructor(onMetaDataCallback:Function)
	{
		this.onMetaDataCallback = onMetaDataCallback;
	}
	
	public onMetaDataCallback:Function;
	
	public onMetaData(metadata:Object):void
	{
		this.onMetaDataCallback(metadata);
	}
