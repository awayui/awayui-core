/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import FeathersControl = feathers.core.FeathersControl;

	import SoundChannel = flash.media.SoundChannel;

	import Quad = starling.display.Quad;
	import Event = starling.events.Event;

	export class SoundChannelPeakVisualizer extends FeathersControl implements IMediaPlayerControl
	{
		constructor()
		{
		}
		
		protected leftPeakBar:Quad;
		protected rightPeakBar:Quad;

		/**
		 * @private
		 */
		protected _gap:number = 0;

		public get gap():number
		{
			return this._gap;
		}

		/**
		 * @private
		 */
		public set gap(value:number)
		{
			if(this._gap == value)
			{
				return;
			}
			this._gap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _mediaPlayer:AudioPlayer;

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
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE, this.mediaPlayer_playbackStateChange);
			}
			this._mediaPlayer = <AudioPlayer>value ;
			if(this._mediaPlayer)
			{
				this.handlePlaybackStateChange();
				this._mediaPlayer.addEventListener(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE, this.mediaPlayer_playbackStateChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/*override*/ public dispose():void
		{
			this.mediaPlayer = null;
			super.dispose();
		}
		
		/*override*/ protected initialize():void
		{
			if(!this.leftPeakBar)
			{
				this.leftPeakBar = new Quad(1, 1);
				this.addChild(this.leftPeakBar);
			}
			if(!this.rightPeakBar)
			{
				this.rightPeakBar = new Quad(1, 1);
				this.addChild(this.rightPeakBar);
			}
		}
		
		/*override*/ protected draw():void
		{
			this.autoSizeIfNeeded();
			
			if(this._mediaPlayer && this._mediaPlayer.soundChannel)
			{
				var soundChannel:SoundChannel = this._mediaPlayer.soundChannel;
				var maxHeight:number = this.actualHeight - 1;
				this.leftPeakBar.height = 1 + maxHeight * soundChannel.leftPeak;
				this.rightPeakBar.height = 1 + maxHeight * soundChannel.rightPeak;
			}
			else
			{
				this.leftPeakBar.height = 1;
				this.rightPeakBar.height = 1;
			}
			var barWidth:number = (this.actualWidth / 2) - this._gap;
			this.leftPeakBar.y = this.actualHeight - this.leftPeakBar.height;
			this.leftPeakBar.width = barWidth;
			this.rightPeakBar.x = barWidth + this._gap;
			this.rightPeakBar.y = this.actualHeight - this.rightPeakBar.height;
			this.rightPeakBar.width = barWidth;
			super.draw();
		}
		
		protected autoSizeIfNeeded():boolean
		{
			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				return false;
			}
			var newWidth:number = this.explicitWidth;
			if(needsWidth)
			{
				newWidth = 4 + this._gap;
			}
			var newHeight:number = this.explicitHeight;
			if(needsHeight)
			{
				newHeight = 3;
			}
			return this.setSizeInternal(newWidth, newHeight, false);
		}
		
		protected handlePlaybackStateChange():void
		{
			if(this._mediaPlayer.isPlaying)
			{
				this.addEventListener(Event.ENTER_FRAME, this.peakVisualizer_enterFrameHandler);
			}
			else
			{
				this.removeEventListener(Event.ENTER_FRAME, this.peakVisualizer_enterFrameHandler);
			}
		}
		
		protected mediaPlayer_playbackStateChange(event:Event):void
		{
			this.handlePlaybackStateChange();
		}
		
		protected peakVisualizer_enterFrameHandler(event:Event):void
		{
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}
	}
}
