/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	/*[Event(name="totalTimeChange",type="starling.events.Event")]*/
	/*[Event(name="currentTimeChange",type="starling.events.Event")]*/
	/*[Event(name="playbackStageChange",type="starling.events.Event")]*/

	export interface ITimedMediaPlayer extends IMediaPlayer
	{
		currentTime:number;
		totalTime:number;
		isPlaying:boolean;
		 togglePlayPause():void;
		 play():void;
		 pause():void;
		 stop():void;
		 seek(seconds:Number):void;
	}
}
