/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.supportClasses
{
	import IFeathersControl = feathers.core.IFeathersControl;

	/*[ExcludeClass]*/
	export interface IViewPort extends IFeathersControl
	{
		visibleWidth:number;
		/*function set visibleWidth(value:Number):void;*/
		minVisibleWidth:number;
		/*function set minVisibleWidth(value:Number):void;*/
		maxVisibleWidth:number;
		/*function set maxVisibleWidth(value:Number):void;*/
		visibleHeight:number;
		/*function set visibleHeight(value:Number):void;*/
		minVisibleHeight:number;
		/*function set minVisibleHeight(value:Number):void;*/
		maxVisibleHeight:number;
		/*function set maxVisibleHeight(value:Number):void;*/

		contentX:number;
		contentY:number;

		horizontalScrollPosition:number;
		/*function set horizontalScrollPosition(value:Number):void;*/
		verticalScrollPosition:number;
		/*function set verticalScrollPosition(value:Number):void;*/
		horizontalScrollStep:number;
		verticalScrollStep:number;
	}
}
