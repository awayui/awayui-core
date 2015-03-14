/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	/*[Event(name="dimensionsChange",type="starling.events.Event")]*/
	
	export interface IVideoPlayer extends IAudioPlayer
	{
		nativeWidth:number;
		nativeHeight:number;
	}
}
