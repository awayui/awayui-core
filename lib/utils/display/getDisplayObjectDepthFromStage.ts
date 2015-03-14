/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.display
{
	import DisplayObject = starling.display.DisplayObject;

	/**
	 * Calculates how many levels deep the target object is on the display list,
	 * starting from the Starling stage. If the target object is the stage, the
	 * depth will be <code>0</code>. A direct child of the stage will have a
	 * depth of <code>1</code>, and it increases with each new level. If the
	 * object does not have a reference to the stage, the depth will always be
	 * <code>-1</code>, even if the object has a parent.
	 */
	export function getDisplayObjectDepthFromStage(target:DisplayObject):number
	{
		if(!target.stage)
		{
			return -1;
		}
		var count:number = 0;
		while(target.parent)
		{
			target = target.parent;
			count++;
		}
		return count;
	}
}