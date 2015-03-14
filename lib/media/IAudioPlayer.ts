/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	import SoundTransform = flash.media.SoundTransform;

	export interface IAudioPlayer extends ITimedMediaPlayer
	{
		soundTransform:SoundTransform;
		/*function set soundTransform(value:SoundTransform):void;*/
	}
}
