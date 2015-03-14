/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import Point = flash.geom.Point;

	/**
	 * Dispatched when the text property changes.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/**
	 * Dispatched when the user presses the Enter key while the editor has focus.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.ENTER
	 */
	/*[Event(name="enter",type="starling.events.Event")]*/

	/**
	 * Dispatched when the text editor receives focus.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.FOCUS_IN
	 */
	/*[Event(name="focusIn",type="starling.events.Event")]*/

	/**
	 * Dispatched when the text editor loses focus.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.FOCUS_OUT
	 */
	/*[Event(name="focusOut",type="starling.events.Event")]*/

	/**
	 * Dispatched when the soft keyboard is activated. Not all text editors will
	 * activate a soft keyboard.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.SOFT_KEYBOARD_ACTIVATE
	 */
	/*[Event(name="softKeyboardActivate",type="starling.events.Event")]*/

	/**
	 * Dispatched when the soft keyboard is deactivated. Not all text editors
	 * will activate a soft keyboard.
	 *
	 * <p>The properties of the event object have the following values:</p>
	 * <table class="innertable">
	 * <tr><th>Property</th><th>Value</th></tr>
	 * <tr><td><code>bubbles</code></td><td>false</td></tr>
	 * <tr><td><code>currentTarget</code></td><td>The Object that defines the
	 *   event listener that handles the event. For example, if you use
	 *   <code>myButton.addEventListener()</code> to register an event listener,
	 *   myButton is the value of the <code>currentTarget</code>.</td></tr>
	 * <tr><td><code>data</code></td><td>null</td></tr>
	 * <tr><td><code>target</code></td><td>The Object that dispatched the event;
	 *   it is not always the Object listening for the event. Use the
	 *   <code>currentTarget</code> property to always access the Object
	 *   listening for the event.</td></tr>
	 * </table>
	 *
	 * @eventType feathers.events.FeathersEventType.SOFT_KEYBOARD_DEACTIVATE
	 */
	/*[Event(name="softKeyboardDectivate",type="starling.events.Event")]*/

	/**
	 * Handles the editing of text.
	 *
	 * @see feathers.controls.TextInput
	 * @see ../../../help/text-editors Introduction to Feathers text editors
	 */
	export interface ITextEditor extends IFeathersControl, ITextBaselineControl
	{
		/**
		 * The text displayed by the editor.
		 */
		text:string;

		/**
		 * @private
		 */
		/*function set text(value:String):void;*/

		/**
		 * Determines if the entered text will be masked so that it cannot be
		 * seen, such as for a password input.
		 */
		displayAsPassword:boolean;

		/**
		 * @private
		 */
		/*function set displayAsPassword(value:Boolean):void;*/

		/**
		 * The maximum number of characters that may be entered.
		 */
		maxChars:number;

		/**
		 * @private
		 */
		/*function set maxChars(value:int):void;*/

		/**
		 * Limits the set of characters that may be entered.
		 */
		restrict:string;

		/**
		 * @private
		 */
		/*function set restrict(value:String):void;*/

		/**
		 * Determines if the text is editable.
		 */
		isEditable:boolean;

		/**
		 * @private
		 */
		/*function set isEditable(value:Boolean):void;*/

		/**
		 * Determines if the owner should call <code>setFocus()</code> on
		 * <code>TouchPhase.ENDED</code> or on <code>TouchPhase.BEGAN</code>.
		 * This is a hack because <code>StageText</code> doesn't like being
		 * assigned focus on <code>TouchPhase.BEGAN</code>. In general, most
		 * text editors should simply return <code>false</code>.
		 *
		 * @see #setFocus()
		 */
		setTouchFocusOnEndedPhase:boolean;

		/**
		 * The index of the first character of the selection. If no text is
		 * selected, then this is the value of the caret index.
		 */
		selectionBeginIndex:number;

		/**
		 * The index of the last character of the selection. If no text is
		 * selected, then this is the value of the caret index.
		 */
		selectionEndIndex:number;

		/**
		 * Gives focus to the text editor. Includes an optional position which
		 * may be used by the text editor to determine the cursor position. The
		 * position may be outside of the editors bounds.
		 */
		 setFocus(position:Point = null):void;

		/**
		 * Removes focus from the text editor.
		 */
		 clearFocus():void;

		/**
		 * Sets the range of selected characters. If both values are the same,
		 * the text insertion position is changed and nothing is selected.
		 */
		 selectRange(startIndex:int, endIndex:int):void;

		/**
		 * Measures the text's bounds (without a full validation, if
		 * possible).
		 */
		 measureText(result:Point = null):Point;
	}
}
