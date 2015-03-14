/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls.text
{
	import IViewPort = feathers.controls.supportClasses.IViewPort;
	import ITextEditor = feathers.core.ITextEditor;

	/**
	 * Handles the editing of multiline text.
	 *
	 * @see feathers.controls.TextArea
	 */
	export interface ITextEditorViewPort extends ITextEditor, IViewPort
	{
	}
}
