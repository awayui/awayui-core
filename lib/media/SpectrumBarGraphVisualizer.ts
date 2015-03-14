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
	import SoundMixer = flash.media.SoundMixer;
	import ByteArray = flash.utils.ByteArray;

	import Quad = starling.display.Quad;
	import QuadBatch = starling.display.QuadBatch;
	import Event = starling.events.Event;

	export class SpectrumBarGraphVisualizer extends FeathersControl implements IMediaPlayerControl
	{
		protected static HELPER_QUAD:Quad = new Quad(1, 1);
		protected static MAX_BAR_COUNT:number = 256;
		
		constructor()
		{
			this.isQuickHitAreaEnabled = true;
		}
		
		protected _bars:QuadBatch;
		
		protected _bytes:ByteArray = new ByteArray();
		
		protected _barValues:number[] = new Array<number>();

		/**
		 * @private
		 */
		protected _barCount:number = 16;

		public get barCount():number
		{
			return this._barCount;
		}

		/**
		 * @private
		 */
		public set barCount(value:number)
		{
			if(value > SpectrumBarGraphVisualizer.MAX_BAR_COUNT)
			{
				value = SpectrumBarGraphVisualizer.MAX_BAR_COUNT;
			}
			else if(value < 1)
			{
				value = 1;
			}
			if(this._barCount == value)
			{
				return;
			}
			this._barCount = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

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
		protected _color:number = 0x000000;

		public get color():number
		{
			return this._color;
		}

		/**
		 * @private
		 */
		public set color(value:number)
		{
			if(this._color == value)
			{
				return;
			}
			this._color = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
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
				this._mediaPlayer.removeEventListener(this.MediaPlayerEventType.PLAYBACK_STATE_CHANGE, this.mediaPlayer_playbackStateChange);
			}
			this._mediaPlayer = <ITimedMediaPlayer>value ;
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
			this._bars = new QuadBatch();
			this.addChild(this._bars);
		}
		
		/*override*/ protected draw():void
		{
			this.autoSizeIfNeeded();
			this.layoutBarGraph();
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
				newWidth = this._barCount * (this._gap + 1) - this._gap;
			}
			var newHeight:number = this.explicitHeight;
			if(needsHeight)
			{
				newHeight = 10;
			}
			return this.setSizeInternal(newWidth, newHeight, false);
		}

		protected layoutBarGraph():void
		{
			this._bars.reset();
			if(!this._mediaPlayer.isPlaying)
			{
				return;
			}
			var barCount:number = this._barCount;
			var barWidth:number = ((this.actualWidth + this._gap) / barCount) - this._gap;
			if(barWidth < 0 || this.actualHeight <= 0)
			{
				return;
			}
			
			SoundMixer.computeSpectrum(this._bytes, true, 0);
			
			this._barValues.length = barCount;
			var valuesPerBar:number = 256 / barCount;
			//read left values
			for(var i:number = 0; i < barCount; i++)
			{
				//reset to zero first
				this._barValues[i] = 0;
				for(var j:number = 0; j < valuesPerBar; j++)
				{
					var float:number = this._bytes.readFloat();
					if(float > 1)
					{
						float = 1;
					}
					this._barValues[i] += float;
				}
			}
			//read right values
			this._bytes.position = 1024;
			for(i = 0; i < barCount; i++)
			{
				for(j = 0; j < valuesPerBar; j++)
				{
					float = this._bytes.readFloat();
					if(float > 1)
					{
						float = 1;
					}
					this._barValues[i] += float;
				}
				//calculate the average
				this._barValues[i] /= (2 * valuesPerBar);
			}
			
			var xPosition:number = 0;
			var maxHeight:number = this.actualHeight - 1;
			SpectrumBarGraphVisualizer.HELPER_QUAD.color = this._color;
			for(i = 0; i < barCount; i++)
			{
				SpectrumBarGraphVisualizer.HELPER_QUAD.x = xPosition;
				SpectrumBarGraphVisualizer.HELPER_QUAD.width = barWidth;
				SpectrumBarGraphVisualizer.HELPER_QUAD.height = Math.floor(maxHeight * this._barValues[i]);
				SpectrumBarGraphVisualizer.HELPER_QUAD.y = maxHeight - SpectrumBarGraphVisualizer.HELPER_QUAD.height;
				this._bars.addQuad(SpectrumBarGraphVisualizer.HELPER_QUAD);
				xPosition += barWidth + this._gap;
			}
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
