/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.media
{
	export class MediaPlayerEventType
	{
		public static DISPLAY_STATE_CHANGE:string = "displayStageChange";
		public static PLAYBACK_STATE_CHANGE:string = "playbackStageChange";
		public static TOTAL_TIME_CHANGE:string = "totalTimeChange";
		public static CURRENT_TIME_CHANGE:string = "currentTimeChange";
		public static DIMENSIONS_CHANGE:string = "dimensionsChange";
		
		public static LOAD_PROGRESS:string = "loadProgress";
		public static LOAD_COMPLETE:string = "loadComplete";
	}
}
