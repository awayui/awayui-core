/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import IFeathersControl = feathers.core.IFeathersControl;
	import IValidating = feathers.core.IValidating;
	import PopUpManager = feathers.core.PopUpManager;
	import FeathersEventType = feathers.events.FeathersEventType;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import getDisplayObjectDepthFromStage = feathers.utils.display.getDisplayObjectDepthFromStage;

	import KeyboardEvent = flash.events.KeyboardEvent;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import Keyboard = flash.ui.Keyboard;

	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import DisplayObjectContainer = starling.display.DisplayObjectContainer;
	import EnterFrameEvent = starling.events.EnterFrameEvent;
	import Event = starling.events.Event;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;

	/**
	 * Dispatched when the callout is closed.
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
	 * @eventType starling.events.Event.CLOSE
	 */
	/*[Event(name="close",type="starling.events.Event")]*/

	/**
	 * A pop-up container that points at (or calls out) a specific region of
	 * the application (typically a specific control that triggered it).
	 *
	 * <p>In general, a <code>Callout</code> isn't instantiated directly.
	 * Instead, you will typically call the static function
	 * <code>Callout.show()</code>. This is not required, but it result in less
	 * code and no need to manually manage calls to the <code>PopUpManager</code>.</p>
	 *
	 * <p>In the following example, a callout displaying a <code>Label</code> is
	 * shown when a <code>Button</code> is triggered:</p>
	 *
	 * <listing version="3.0">
	 * button.addEventListener( Event.TRIGGERED, button_triggeredHandler );
	 * 
	 * function button_triggeredHandler( event:Event ):void
	 * {
	 *     var label:Label = new Label();
	 *     label.text = "Hello World!";
	 *     var button:Button = Button( event.currentTarget );
	 *     Callout.show( label, button );
	 * }</listing>
	 *
	 * @see ../../../help/callout.html How to use the Feathers Callout component
	 */
	export class Callout extends FeathersControl
	{
		/**
		 * The default <code>IStyleProvider</code> for all <code>Callout</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * The callout may be positioned on any side of the origin region.
		 *
		 * @see #supportedDirections
		 */
		public static DIRECTION_ANY:string = "any";

		/**
		 * The callout may be positioned on top or bottom of the origin region.
		 *
		 * @see #supportedDirections
		 */
		public static DIRECTION_VERTICAL:string = "vertical";

		/**
		 * The callout may be positioned on top or bottom of the origin region.
		 *
		 * @see #supportedDirections
		 */
		public static DIRECTION_HORIZONTAL:string = "horizontal";

		/**
		 * The callout must be positioned above the origin region.
		 *
		 * @see #supportedDirections
		 */
		public static DIRECTION_UP:string = "up";

		/**
		 * The callout must be positioned below the origin region.
		 *
		 * @see #supportedDirections
		 */
		public static DIRECTION_DOWN:string = "down";

		/**
		 * The callout must be positioned to the left side of the origin region.
		 *
		 * @see #supportedDirections
		 */
		public static DIRECTION_LEFT:string = "left";

		/**
		 * The callout must be positioned to the right side of the origin region.
		 *
		 * @see #supportedDirections
		 */
		public static DIRECTION_RIGHT:string = "right";

		/**
		 * The arrow will appear on the top side of the callout.
		 *
		 * @see #arrowPosition
		 */
		public static ARROW_POSITION_TOP:string = "top";

		/**
		 * The arrow will appear on the right side of the callout.
		 *
		 * @see #arrowPosition
		 */
		public static ARROW_POSITION_RIGHT:string = "right";

		/**
		 * The arrow will appear on the bottom side of the callout.
		 *
		 * @see #arrowPosition
		 */
		public static ARROW_POSITION_BOTTOM:string = "bottom";

		/**
		 * The arrow will appear on the left side of the callout.
		 *
		 * @see #arrowPosition
		 */
		public static ARROW_POSITION_LEFT:string = "left";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_ORIGIN:string = "origin";

		/**
		 * @private
		 */
		private static HELPER_RECT:Rectangle = new Rectangle();

		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 */
		protected static DIRECTION_TO_FUNCTION:Object = {};
		DIRECTION_TO_FUNCTION/*[DIRECTION_ANY]*/ = positionBestSideOfOrigin;
		DIRECTION_TO_FUNCTION/*[DIRECTION_UP]*/ = positionAboveOrigin;
		DIRECTION_TO_FUNCTION/*[DIRECTION_DOWN]*/ = positionBelowOrigin;
		DIRECTION_TO_FUNCTION/*[DIRECTION_LEFT]*/ = positionToLeftOfOrigin;
		DIRECTION_TO_FUNCTION/*[DIRECTION_RIGHT]*/ = positionToRightOfOrigin;
		DIRECTION_TO_FUNCTION/*[DIRECTION_VERTICAL]*/ = positionAboveOrBelowOrigin;
		DIRECTION_TO_FUNCTION/*[DIRECTION_HORIZONTAL]*//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**/ /*=*/ /*positionToLeftOrRightOfOrigin*//*;*/

		/**
		 * @private
		 */
		protected static FUZZY_CONTENT_DIMENSIONS_PADDING:number = 0.000001;

		/**
		 * Quickly sets all stage padding properties to the same value. The
		 * <code>stagePadding</code> getter always returns the value of
		 * <code>stagePaddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>The following example gives the stage 20 pixels of padding on all
		 * sides:</p>
		 *
		 * <listing version="3.0">
		 * Callout.stagePadding = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #stagePaddingTop
		 * @see #stagePaddingRight
		 * @see #stagePaddingBottom
		 * @see #stagePaddingLeft
		 */
		public static get stagePadding():number
		{
			return Callout.stagePaddingTop;
		}

		/**
		 * @private
		 */
		public static set stagePadding(value:number)
		{
			Callout.stagePaddingTop = value;
			Callout.stagePaddingRight = value;
			Callout.stagePaddingBottom = value;
			Callout.stagePaddingLeft = value;
		}

		/**
		 * The padding between a callout and the top edge of the stage when the
		 * callout is positioned automatically. May be ignored if the callout
		 * is too big for the stage.
		 *
		 * <p>In the following example, the top stage padding will be set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * Callout.stagePaddingTop = 20;</listing>
		 */
		public static stagePaddingTop:number = 0;

		/**
		 * The padding between a callout and the right edge of the stage when the
		 * callout is positioned automatically. May be ignored if the callout
		 * is too big for the stage.
		 *
		 * <p>In the following example, the right stage padding will be set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * Callout.stagePaddingRight = 20;</listing>
		 */
		public static stagePaddingRight:number = 0;

		/**
		 * The padding between a callout and the bottom edge of the stage when the
		 * callout is positioned automatically. May be ignored if the callout
		 * is too big for the stage.
		 *
		 * <p>In the following example, the bottom stage padding will be set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * Callout.stagePaddingBottom = 20;</listing>
		 */
		public static stagePaddingBottom:number = 0;

		/**
		 * The margin between a callout and the top edge of the stage when the
		 * callout is positioned automatically. May be ignored if the callout
		 * is too big for the stage.
		 *
		 * <p>In the following example, the left stage padding will be set to
		 * 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * Callout.stagePaddingLeft = 20;</listing>
		 */
		public static stagePaddingLeft:number = 0;

		/**
		 * Returns a new <code>Callout</code> instance when <code>Callout.show()</code>
		 * is called with isModal set to true. If one wishes to skin the callout
		 * manually, a custom factory may be provided.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 *
		 * <pre>function():Callout</pre>
		 *
		 * <p>The following example shows how to create a custom callout factory:</p>
		 *
		 * <listing version="3.0">
		 * Callout.calloutFactory = function():Callout
		 * {
		 *     var callout:Callout = new Callout();
		 *     //set properties here!
		 *     return callout;
		 * };</listing>
		 *
		 * @see #show()
		 */
		public static calloutFactory:Function = Callout.defaultCalloutFactory;

		/**
		 * Returns an overlay to display with a callout that is modal. Uses the
		 * standard <code>overlayFactory</code> of the <code>PopUpManager</code>
		 * by default, but you can use this property to provide your own custom
		 * overlay, if you prefer.
		 *
		 * <p>This function is expected to have the following signature:</p>
		 * <pre>function():DisplayObject</pre>
		 *
		 * <p>The following example uses a semi-transparent <code>Quad</code> as
		 * a custom overlay:</p>
		 *
		 * <listing version="3.0">
		 * Callout.calloutOverlayFactory = function():Quad
		 * {
		 *     var quad:Quad = new Quad(10, 10, 0x000000);
		 *     quad.alpha = 0.75;
		 *     return quad;
		 * };</listing>
		 *
		 * @see feathers.core.PopUpManager#overlayFactory
		 *
		 * @see #show()
		 */
		public static calloutOverlayFactory:Function = PopUpManager.defaultOverlayFactory;

		/**
		 * Creates a callout, and then positions and sizes it automatically
		 * based on an origin rectangle and the specified direction relative to
		 * the original. The provided width and height values are optional, and
		 * these values may be ignored if the callout cannot be drawn at the
		 * specified dimensions.
		 *
		 * <p>In the following example, a callout displaying a <code>Label</code> is
		 * shown when a <code>Button</code> is triggered:</p>
		 *
		 * <listing version="3.0">
		 * button.addEventListener( Event.TRIGGERED, button_triggeredHandler );
		 *
		 * function button_triggeredHandler( event:Event ):void
		 * {
		 *     var label:Label = new Label();
		 *     label.text = "Hello World!";
		 *     var button:Button = Button( event.currentTarget );
		 *     Callout.show( label, button );
		 * }</listing>
		 */
		public static show(content:DisplayObject, origin:DisplayObject, supportedDirections:string = Callout.DIRECTION_ANY,
			isModal:boolean = true, customCalloutFactory:Function = null, customOverlayFactory:Function = null):Callout
		{
			if(!origin.stage)
			{
				throw new ArgumentError("Callout origin must be added to the stage.");
			}
			var factory:Function = customCalloutFactory;
			if(factory == null)
			{
				factory = Callout.calloutFactory != null ? Callout.calloutFactory : Callout.defaultCalloutFactory;
			}
			var callout:Callout = Callout(factory());
			callout.content = content;
			callout.supportedDirections = supportedDirections;
			callout.origin = origin;
			factory = customOverlayFactory;
			if(factory == null)
			{
				factory = Callout.calloutOverlayFactory != null ? Callout.calloutOverlayFactory : PopUpManager.defaultOverlayFactory;
			}
			PopUpManager.addPopUp(callout, isModal, false, factory);
			return callout;
		}

		/**
		 * The default factory that creates callouts when <code>Callout.show()</code>
		 * is called. To use a different factory, you need to set
		 * <code>Callout.calloutFactory</code> to a <code>Function</code>
		 * instance.
		 */
		public static defaultCalloutFactory():Callout
		{
			var callout:Callout = new Callout();
			callout.closeOnTouchBeganOutside = true;
			callout.closeOnTouchEndedOutside = true;
			callout.closeOnKeys = new Array<number>(Keyboard.BACK, Keyboard.ESCAPE);
			return callout;
		}

		/**
		 * @private
		 */
		protected static positionWithSupportedDirections(callout:Callout, globalOrigin:Rectangle, direction:string):void
		{
			if(Callout.DIRECTION_TO_FUNCTION.hasOwnProperty(direction))
			{
				var calloutPositionFunction:Function = Callout.DIRECTION_TO_FUNCTION[direction];
				calloutPositionFunction(callout, globalOrigin);
			}
			else
			{
				Callout.positionBestSideOfOrigin(callout, globalOrigin);
			}
		}

		/**
		 * @private
		 */
		protected static positionBestSideOfOrigin(callout:Callout, globalOrigin:Rectangle):void
		{
			callout.measureWithArrowPosition(Callout.ARROW_POSITION_TOP, Callout.HELPER_POINT);
			var downSpace:number = (Starling.current.stage.stageHeight - Callout.HELPER_POINT.y) - (globalOrigin.y + globalOrigin.height);
			if(downSpace >= Callout.stagePaddingBottom)
			{
				Callout.positionBelowOrigin(callout, globalOrigin);
				return;
			}

			callout.measureWithArrowPosition(Callout.ARROW_POSITION_BOTTOM, Callout.HELPER_POINT);
			var upSpace:number = globalOrigin.y - Callout.HELPER_POINT.y;
			if(upSpace >= Callout.stagePaddingTop)
			{
				Callout.positionAboveOrigin(callout, globalOrigin);
				return;
			}

			callout.measureWithArrowPosition(Callout.ARROW_POSITION_LEFT, Callout.HELPER_POINT);
			var rightSpace:number = (Starling.current.stage.stageWidth - Callout.HELPER_POINT.x) - (globalOrigin.x + globalOrigin.width);
			if(rightSpace >= Callout.stagePaddingRight)
			{
				Callout.positionToRightOfOrigin(callout, globalOrigin);
				return;
			}

			callout.measureWithArrowPosition(Callout.ARROW_POSITION_RIGHT, Callout.HELPER_POINT);
			var leftSpace:number = globalOrigin.x - Callout.HELPER_POINT.x;
			if(leftSpace >= Callout.stagePaddingLeft)
			{
				Callout.positionToLeftOfOrigin(callout, globalOrigin);
				return;
			}

			//worst case: pick the side that has the most available space
			if(downSpace >= upSpace && downSpace >= rightSpace && downSpace >= leftSpace)
			{
				Callout.positionBelowOrigin(callout, globalOrigin);
			}
			else if(upSpace >= rightSpace && upSpace >= leftSpace)
			{
				Callout.positionAboveOrigin(callout, globalOrigin);
			}
			else if(rightSpace >= leftSpace)
			{
				Callout.positionToRightOfOrigin(callout, globalOrigin);
			}
			else
			{
				Callout.positionToLeftOfOrigin(callout, globalOrigin);
			}
		}

		/**
		 * @private
		 */
		protected static positionAboveOrBelowOrigin(callout:Callout, globalOrigin:Rectangle):void
		{
			callout.measureWithArrowPosition(Callout.ARROW_POSITION_TOP, Callout.HELPER_POINT);
			var downSpace:number = (Starling.current.stage.stageHeight - Callout.HELPER_POINT.y) - (globalOrigin.y + globalOrigin.height);
			if(downSpace >= Callout.stagePaddingBottom)
			{
				Callout.positionBelowOrigin(callout, globalOrigin);
				return;
			}

			callout.measureWithArrowPosition(Callout.ARROW_POSITION_BOTTOM, Callout.HELPER_POINT);
			var upSpace:number = globalOrigin.y - Callout.HELPER_POINT.y;
			if(upSpace >= Callout.stagePaddingTop)
			{
				Callout.positionAboveOrigin(callout, globalOrigin);
				return;
			}

			//worst case: pick the side that has the most available space
			if(downSpace >= upSpace)
			{
				Callout.positionBelowOrigin(callout, globalOrigin);
			}
			else
			{
				Callout.positionAboveOrigin(callout, globalOrigin);
			}
		}

		/**
		 * @private
		 */
		protected static positionToLeftOrRightOfOrigin(callout:Callout, globalOrigin:Rectangle):void
		{
			callout.measureWithArrowPosition(Callout.ARROW_POSITION_LEFT, Callout.HELPER_POINT);
			var rightSpace:number = (Starling.current.stage.stageWidth - Callout.HELPER_POINT.x) - (globalOrigin.x + globalOrigin.width);
			if(rightSpace >= Callout.stagePaddingRight)
			{
				Callout.positionToRightOfOrigin(callout, globalOrigin);
				return;
			}

			callout.measureWithArrowPosition(Callout.ARROW_POSITION_RIGHT, Callout.HELPER_POINT);
			var leftSpace:number = globalOrigin.x - Callout.HELPER_POINT.x;
			if(leftSpace >= Callout.stagePaddingLeft)
			{
				Callout.positionToLeftOfOrigin(callout, globalOrigin);
				return;
			}

			//worst case: pick the side that has the most available space
			if(rightSpace >= leftSpace)
			{
				Callout.positionToRightOfOrigin(callout, globalOrigin);
			}
			else
			{
				Callout.positionToLeftOfOrigin(callout, globalOrigin);
			}
		}

		/**
		 * @private
		 */
		protected static positionBelowOrigin(callout:Callout, globalOrigin:Rectangle):void
		{
			callout.measureWithArrowPosition(Callout.ARROW_POSITION_TOP, Callout.HELPER_POINT);
			var idealXPosition:number = globalOrigin.x + Math.round((globalOrigin.width - Callout.HELPER_POINT.x) / 2);
			var xPosition:number = Math.max(Callout.stagePaddingLeft, Math.min(Starling.current.stage.stageWidth - Callout.HELPER_POINT.x - Callout.stagePaddingRight, idealXPosition));
			callout.x = xPosition;
			callout.y = globalOrigin.y + globalOrigin.height;
			if(callout._isValidating)
			{
				//no need to invalidate and need to validate again next frame
				callout._arrowOffset = idealXPosition - xPosition;
				callout._arrowPosition = Callout.ARROW_POSITION_TOP;
			}
			else
			{
				callout.arrowOffset = idealXPosition - xPosition;
				callout.arrowPosition = Callout.ARROW_POSITION_TOP;
			}
		}

		/**
		 * @private
		 */
		protected static positionAboveOrigin(callout:Callout, globalOrigin:Rectangle):void
		{
			callout.measureWithArrowPosition(Callout.ARROW_POSITION_BOTTOM, Callout.HELPER_POINT);
			var idealXPosition:number = globalOrigin.x + Math.round((globalOrigin.width - Callout.HELPER_POINT.x) / 2);
			var xPosition:number = Math.max(Callout.stagePaddingLeft, Math.min(Starling.current.stage.stageWidth - Callout.HELPER_POINT.x - Callout.stagePaddingRight, idealXPosition));
			callout.x = xPosition;
			callout.y = globalOrigin.y - Callout.HELPER_POINT.y;
			if(callout._isValidating)
			{
				//no need to invalidate and need to validate again next frame
				callout._arrowOffset = idealXPosition - xPosition;
				callout._arrowPosition = Callout.ARROW_POSITION_BOTTOM;
			}
			else
			{
				callout.arrowOffset = idealXPosition - xPosition;
				callout.arrowPosition = Callout.ARROW_POSITION_BOTTOM;
			}
		}

		/**
		 * @private
		 */
		protected static positionToRightOfOrigin(callout:Callout, globalOrigin:Rectangle):void
		{
			callout.measureWithArrowPosition(Callout.ARROW_POSITION_LEFT, Callout.HELPER_POINT);
			callout.x = globalOrigin.x + globalOrigin.width;
			var idealYPosition:number = globalOrigin.y + Math.round((globalOrigin.height - Callout.HELPER_POINT.y) / 2);
			var yPosition:number = Math.max(Callout.stagePaddingTop, Math.min(Starling.current.stage.stageHeight - Callout.HELPER_POINT.y - Callout.stagePaddingBottom, idealYPosition));
			callout.y = yPosition;
			if(callout._isValidating)
			{
				//no need to invalidate and need to validate again next frame
				callout._arrowOffset = idealYPosition - yPosition;
				callout._arrowPosition = Callout.ARROW_POSITION_LEFT;
			}
			else
			{
				callout.arrowOffset = idealYPosition - yPosition;
				callout.arrowPosition = Callout.ARROW_POSITION_LEFT;
			}
		}

		/**
		 * @private
		 */
		protected static positionToLeftOfOrigin(callout:Callout, globalOrigin:Rectangle):void
		{
			callout.measureWithArrowPosition(Callout.ARROW_POSITION_RIGHT, Callout.HELPER_POINT);
			callout.x = globalOrigin.x - Callout.HELPER_POINT.x;
			var idealYPosition:number = globalOrigin.y + Math.round((globalOrigin.height - Callout.HELPER_POINT.y) / 2);
			var yPosition:number = Math.max(Callout.stagePaddingLeft, Math.min(Starling.current.stage.stageHeight - Callout.HELPER_POINT.y - Callout.stagePaddingBottom, idealYPosition));
			callout.y = yPosition;
			if(callout._isValidating)
			{
				//no need to invalidate and need to validate again next frame
				callout._arrowOffset = idealYPosition - yPosition;
				callout._arrowPosition = Callout.ARROW_POSITION_RIGHT;
			}
			else
			{
				callout.arrowOffset = idealYPosition - yPosition;
				callout.arrowPosition = Callout.ARROW_POSITION_RIGHT;
			}
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.addEventListener(Event.ADDED_TO_STAGE, this.callout_addedToStageHandler);
		}

		/**
		 * Determines if the callout is automatically closed if a touch in the
		 * <code>TouchPhase.BEGAN</code> phase happens outside of the callout's
		 * bounds.
		 *
		 * <p>In the following example, the callout will not close when a touch
		 * event with <code>TouchPhase.BEGAN</code> is detected outside the
		 * callout's (or its origin's) bounds:</p>
		 *
		 * <listing version="3.0">
		 * callout.closeOnTouchBeganOutside = false;</listing>
		 *
		 * @see #closeOnTouchEndedOutside
		 * @see #closeOnKeys
		 */
		public closeOnTouchBeganOutside:boolean = false;

		/**
		 * Determines if the callout is automatically closed if a touch in the
		 * <code>TouchPhase.ENDED</code> phase happens outside of the callout's
		 * bounds.
		 *
		 * <p>In the following example, the callout will not close when a touch
		 * event with <code>TouchPhase.ENDED</code> is detected outside the
		 * callout's (or its origin's) bounds:</p>
		 *
		 * <listing version="3.0">
		 * callout.closeOnTouchEndedOutside = false;</listing>
		 *
		 * @see #closeOnTouchBeganOutside
		 * @see #closeOnKeys
		 */
		public closeOnTouchEndedOutside:boolean = false;

		/**
		 * The callout will be closed if any of these keys are pressed.
		 *
		 * <p>In the following example, the callout close when the Escape key
		 * is pressed:</p>
		 *
		 * <listing version="3.0">
		 * callout.closeOnKeys = new &lt;uint&gt;[Keyboard.ESCAPE];</listing>
		 *
		 * @see #closeOnTouchBeganOutside
		 * @see #closeOnTouchEndedOutside
		 */
		public closeOnKeys:number[];

		/**
		 * Determines if the callout will be disposed when <code>close()</code>
		 * is called internally. Close may be called internally in a variety of
		 * cases, depending on values such as <code>closeOnTouchBeganOutside</code>,
		 * <code>closeOnTouchEndedOutside</code>, and <code>closeOnKeys</code>.
		 * If set to <code>false</code>, you may reuse the callout later by
		 * giving it a new <code>origin</code> and adding it to the
		 * <code>PopUpManager</code> again.
		 *
		 * <p>In the following example, the callout will not be disposed when it
		 * closes itself:</p>
		 *
		 * <listing version="3.0">
		 * callout.disposeOnSelfClose = false;</listing>
		 *
		 * @see #closeOnTouchBeganOutside
		 * @see #closeOnTouchEndedOutside
		 * @see #closeOnKeys
		 * @see #close()
		 */
		public disposeOnSelfClose:boolean = true;

		/**
		 * Determines if the callout's content will be disposed when the callout
		 * is disposed. If set to <code>false</code>, the callout's content may
		 * be added to the display list again later.
		 *
		 * <p>In the following example, the callout's content will not be
		 * disposed when the callout is disposed:</p>
		 *
		 * <listing version="3.0">
		 * callout.disposeContent = false;</listing>
		 */
		public disposeContent:boolean = true;

		/**
		 * @private
		 */
		protected _isReadyToClose:boolean = false;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return Callout.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _content:DisplayObject;

		/**
		 * The display object that will be presented by the callout. This object
		 * may be resized to fit the callout's bounds. If the content needs to
		 * be scrolled if placed into a smaller region than its ideal size, it
		 * must provide its own scrolling capabilities because the callout does
		 * not offer scrolling.
		 *
		 * <p>In the following example, the callout's content is an image:</p>
		 *
		 * <listing version="3.0">
		 * callout.content = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get content():DisplayObject
		{
			return this._content;
		}

		/**
		 * @private
		 */
		public set content(value:DisplayObject)
		{
			if(this._content == value)
			{
				return;
			}
			if(this._content)
			{
				if(this._content instanceof IFeathersControl)
				{
					IFeathersControl(this._content).removeEventListener(FeathersEventType.RESIZE, this.content_resizeHandler);
				}
				if(this._content.parent == this)
				{
					this._content.removeFromParent(false);
				}
			}
			this._content = value;
			if(this._content)
			{
				if(this._content instanceof IFeathersControl)
				{
					IFeathersControl(this._content).addEventListener(FeathersEventType.RESIZE, this.content_resizeHandler);
				}
				this.addChild(this._content);
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
			this.invalidate(this.INVALIDATION_FLAG_DATA);
		}

		/**
		 * @private
		 */
		protected _origin:DisplayObject;

		/**
		 * A callout may be positioned relative to another display object, known
		 * as the callout's origin. Even if the position of the origin changes,
		 * the callout will reposition itself to always point at the origin.
		 *
		 * <p>When an origin is set, the <code>arrowPosition</code> and
		 * <code>arrowOffset</code> properties will be managed automatically by
		 * the callout. Setting either of these values manually with either have
		 * no effect or unexpected behavior, so it is recommended that you
		 * avoid modifying those properties.</p>
		 *
		 * <p>In general, if you use <code>Callout.show()</code>, you will
		 * rarely need to manually manage the origin.</p>
		 *
		 * <p>In the following example, the callout's origin is set to a button:</p>
		 *
		 * <listing version="3.0">
		 * callout.origin = button;</listing>
		 *
		 * @default null
		 *
		 * @see #supportedDirections
		 * @see #arrowPosition
		 * @see #arrowOffset
		 */
		public get origin():DisplayObject
		{
			return this._origin;
		}

		public set origin(value:DisplayObject)
		{
			if(this._origin == value)
			{
				return;
			}
			if(value && !value.stage)
			{
				throw new ArgumentError("Callout origin must have access to the stage.");
			}
			if(this._origin)
			{
				this.removeEventListener(EnterFrameEvent.ENTER_FRAME, this.callout_enterFrameHandler);
				this._origin.removeEventListener(Event.REMOVED_FROM_STAGE, this.origin_removedFromStageHandler);
			}
			this._origin = value;
			this._lastGlobalBoundsOfOrigin = null;
			if(this._origin)
			{
				this._origin.addEventListener(Event.REMOVED_FROM_STAGE, this.origin_removedFromStageHandler);
				this.addEventListener(EnterFrameEvent.ENTER_FRAME, this.callout_enterFrameHandler);
			}
			this.invalidate(Callout.INVALIDATION_FLAG_ORIGIN);
		}

		/**
		 * @private
		 */
		protected _supportedDirections:string = Callout.DIRECTION_ANY;

		/*[Inspectable(type="String",enumeration="any,vertical,horizontal,up,down,left,right")]*/
		/**
		 * The directions that the callout may be positioned, relative to its
		 * origin. If the callout's origin is not set, this value will be
		 * ignored.
		 *
		 * <p>The <code>arrowPosition</code> property is related to this one,
		 * but they have different meanings and are usually opposites. For
		 * example, a callout on the right side of its origin will generally
		 * display its left arrow.</p>
		 *
		 * <p>In the following example, the callout's supported directions are
		 * restricted to up and down:</p>
		 *
		 * <listing version="3.0">
		 * callout.supportedDirections = Callout.DIRECTION_VERTICAL;</listing>
		 *
		 * @default Callout.DIRECTION_ANY
		 *
		 * @see #origin
		 * @see #DIRECTION_ANY
		 * @see #DIRECTION_VERTICAL
		 * @see #DIRECTION_HORIZONTAL
		 * @see #DIRECTION_UP
		 * @see #DIRECTION_DOWN
		 * @see #DIRECTION_LEFT
		 * @see #DIRECTION_RIGHT
		 * @see #arrowPosition
		 */
		public get supportedDirections():string
		{
			return this._supportedDirections;
		}

		public set supportedDirections(value:string)
		{
			this._supportedDirections = value;
		}

		/**
		 * Quickly sets all padding properties to the same value. The
		 * <code>padding</code> getter always returns the value of
		 * <code>paddingTop</code>, but the other padding values may be
		 * different.
		 *
		 * <p>In the following example, the padding of all sides of the callout
		 * is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * callout.padding = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #paddingTop
		 * @see #paddingRight
		 * @see #paddingBottom
		 * @see #paddingLeft
		 */
		public get padding():number
		{
			return this._paddingTop;
		}

		/**
		 * @private
		 */
		public set padding(value:number)
		{
			this.paddingTop = value;
			this.paddingRight = value;
			this.paddingBottom = value;
			this.paddingLeft = value;
		}

		/**
		 * @private
		 */
		protected _paddingTop:number = 0;

		/**
		 * The minimum space, in pixels, between the callout's top edge and the
		 * callout's content.
		 *
		 * <p>In the following example, the padding on the top edge of the
		 * callout is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * callout.paddingTop = 20;</listing>
		 *
		 * @default 0
		 */
		public get paddingTop():number
		{
			return this._paddingTop;
		}

		/**
		 * @private
		 */
		public set paddingTop(value:number)
		{
			if(this._paddingTop == value)
			{
				return;
			}
			this._paddingTop = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _paddingRight:number = 0;

		/**
		 * The minimum space, in pixels, between the callout's right edge and
		 * the callout's content.
		 *
		 * <p>In the following example, the padding on the right edge of the
		 * callout is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * callout.paddingRight = 20;</listing>
		 *
		 * @default 0
		 */
		public get paddingRight():number
		{
			return this._paddingRight;
		}

		/**
		 * @private
		 */
		public set paddingRight(value:number)
		{
			if(this._paddingRight == value)
			{
				return;
			}
			this._paddingRight = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _paddingBottom:number = 0;

		/**
		 * The minimum space, in pixels, between the callout's bottom edge and
		 * the callout's content.
		 *
		 * <p>In the following example, the padding on the bottom edge of the
		 * callout is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * callout.paddingBottom = 20;</listing>
		 *
		 * @default 0
		 */
		public get paddingBottom():number
		{
			return this._paddingBottom;
		}

		/**
		 * @private
		 */
		public set paddingBottom(value:number)
		{
			if(this._paddingBottom == value)
			{
				return;
			}
			this._paddingBottom = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _paddingLeft:number = 0;

		/**
		 * The minimum space, in pixels, between the callout's left edge and the
		 * callout's content.
		 *
		 * <p>In the following example, the padding on the left edge of the
		 * callout is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * callout.paddingLeft = 20;</listing>
		 *
		 * @default 0
		 */
		public get paddingLeft():number
		{
			return this._paddingLeft;
		}

		/**
		 * @private
		 */
		public set paddingLeft(value:number)
		{
			if(this._paddingLeft == value)
			{
				return;
			}
			this._paddingLeft = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _arrowPosition:string = Callout.ARROW_POSITION_TOP;

		/*[Inspectable(type="String",enumeration="top,right,bottom,left")]*/
		/**
		 * The position of the callout's arrow relative to the callout's
		 * background. If the callout's <code>origin</code> is set, this value
		 * will be managed by the callout and may change automatically if the
		 * origin moves to a new position or if the stage resizes.
		 *
		 * <p>The <code>supportedDirections</code> property is related to this
		 * one, but they have different meanings and are usually opposites. For
		 * example, a callout on the right side of its origin will generally
		 * display its left arrow.</p>
		 *
		 * <p>If you use <code>Callout.show()</code> or set the <code>origin</code>
		 * property manually, you should avoid manually modifying the
		 * <code>arrowPosition</code> and <code>arrowOffset</code> properties.</p>
		 *
		 * <p>In the following example, the callout's arrow is positioned on the
		 * left side:</p>
		 *
		 * <listing version="3.0">
		 * callout.arrowPosition = Callout.ARROW_POSITION_LEFT;</listing>
		 *
		 * @default Callout.ARROW_POSITION_TOP
		 *
		 * @see #ARROW_POSITION_TOP
		 * @see #ARROW_POSITION_RIGHT
		 * @see #ARROW_POSITION_BOTTOM
		 * @see #ARROW_POSITION_LEFT
		 *
		 * @see #origin
		 * @see #supportedDirections
		 * @see #arrowOffset
		 */
		public get arrowPosition():string
		{
			return this._arrowPosition;
		}

		/**
		 * @private
		 */
		public set arrowPosition(value:string)
		{
			if(this._arrowPosition == value)
			{
				return;
			}
			this._arrowPosition = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _originalBackgroundWidth:number = NaN;

		/**
		 * @private
		 */
		protected _originalBackgroundHeight:number = NaN;

		/**
		 * @private
		 */
		protected _backgroundSkin:DisplayObject;

		/**
		 * The primary background to display.
		 *
		 * <p>In the following example, the callout's background is set to an image:</p>
		 *
		 * <listing version="3.0">
		 * callout.backgroundSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get backgroundSkin():DisplayObject
		{
			return this._backgroundSkin;
		}

		/**
		 * @private
		 */
		public set backgroundSkin(value:DisplayObject)
		{
			if(this._backgroundSkin == value)
			{
				return;
			}

			if(this._backgroundSkin)
			{
				this.removeChild(this._backgroundSkin);
			}
			this._backgroundSkin = value;
			if(this._backgroundSkin)
			{
				this._originalBackgroundWidth = this._backgroundSkin.width;
				this._originalBackgroundHeight = this._backgroundSkin.height;
				this.addChildAt(this._backgroundSkin, 0);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected currentArrowSkin:DisplayObject;

		/**
		 * @private
		 */
		protected _bottomArrowSkin:DisplayObject;

		/**
		 * The arrow skin to display on the bottom edge of the callout. This
		 * arrow is displayed when the callout is displayed above the region it
		 * points at.
		 *
		 * <p>In the following example, the callout's bottom arrow skin is set
		 * to an image:</p>
		 *
		 * <listing version="3.0">
		 * callout.bottomArrowSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get bottomArrowSkin():DisplayObject
		{
			return this._bottomArrowSkin;
		}

		/**
		 * @private
		 */
		public set bottomArrowSkin(value:DisplayObject)
		{
			if(this._bottomArrowSkin == value)
			{
				return;
			}

			if(this._bottomArrowSkin)
			{
				this.removeChild(this._bottomArrowSkin);
			}
			this._bottomArrowSkin = value;
			if(this._bottomArrowSkin)
			{
				this._bottomArrowSkin.visible = false;
				var index:number = this.getChildIndex(this._content);
				if(index < 0)
				{
					this.addChild(this._bottomArrowSkin);
				}
				else
				{
					this.addChildAt(this._bottomArrowSkin, index);
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _topArrowSkin:DisplayObject;

		/**
		 * The arrow skin to display on the top edge of the callout. This arrow
		 * is displayed when the callout is displayed below the region it points
		 * at.
		 *
		 * <p>In the following example, the callout's top arrow skin is set
		 * to an image:</p>
		 *
		 * <listing version="3.0">
		 * callout.topArrowSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get topArrowSkin():DisplayObject
		{
			return this._topArrowSkin;
		}

		/**
		 * @private
		 */
		public set topArrowSkin(value:DisplayObject)
		{
			if(this._topArrowSkin == value)
			{
				return;
			}

			if(this._topArrowSkin)
			{
				this.removeChild(this._topArrowSkin);
			}
			this._topArrowSkin = value;
			if(this._topArrowSkin)
			{
				this._topArrowSkin.visible = false;
				var index:number = this.getChildIndex(this._content);
				if(index < 0)
				{
					this.addChild(this._topArrowSkin);
				}
				else
				{
					this.addChildAt(this._topArrowSkin, index);
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _leftArrowSkin:DisplayObject;

		/**
		 * The arrow skin to display on the left edge of the callout. This arrow
		 * is displayed when the callout is displayed to the right of the region
		 * it points at.
		 *
		 * <p>In the following example, the callout's left arrow skin is set
		 * to an image:</p>
		 *
		 * <listing version="3.0">
		 * callout.leftArrowSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get leftArrowSkin():DisplayObject
		{
			return this._leftArrowSkin;
		}

		/**
		 * @private
		 */
		public set leftArrowSkin(value:DisplayObject)
		{
			if(this._leftArrowSkin == value)
			{
				return;
			}

			if(this._leftArrowSkin)
			{
				this.removeChild(this._leftArrowSkin);
			}
			this._leftArrowSkin = value;
			if(this._leftArrowSkin)
			{
				this._leftArrowSkin.visible = false;
				var index:number = this.getChildIndex(this._content);
				if(index < 0)
				{
					this.addChild(this._leftArrowSkin);
				}
				else
				{
					this.addChildAt(this._leftArrowSkin, index);
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _rightArrowSkin:DisplayObject;

		/**
		 * The arrow skin to display on the right edge of the callout. This
		 * arrow is displayed when the callout is displayed to the left of the
		 * region it points at.
		 *
		 * <p>In the following example, the callout's right arrow skin is set
		 * to an image:</p>
		 *
		 * <listing version="3.0">
		 * callout.rightArrowSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get rightArrowSkin():DisplayObject
		{
			return this._rightArrowSkin;
		}

		/**
		 * @private
		 */
		public set rightArrowSkin(value:DisplayObject)
		{
			if(this._rightArrowSkin == value)
			{
				return;
			}

			if(this._rightArrowSkin)
			{
				this.removeChild(this._rightArrowSkin);
			}
			this._rightArrowSkin = value;
			if(this._rightArrowSkin)
			{
				this._rightArrowSkin.visible = false;
				var index:number = this.getChildIndex(this._content);
				if(index < 0)
				{
					this.addChild(this._rightArrowSkin);
				}
				else
				{
					this.addChildAt(this._rightArrowSkin, index);
				}
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _topArrowGap:number = 0;

		/**
		 * The space, in pixels, between the top arrow skin and the background
		 * skin. To have the arrow overlap the background, you may use a
		 * negative gap value.
		 *
		 * <p>In the following example, the gap between the callout and its
		 * top arrow is set to -4 pixels (perhaps to hide a border on the
		 * callout's background):</p>
		 *
		 * <listing version="3.0">
		 * callout.topArrowGap = -4;</listing>
		 *
		 * @default 0
		 */
		public get topArrowGap():number
		{
			return this._topArrowGap;
		}

		/**
		 * @private
		 */
		public set topArrowGap(value:number)
		{
			if(this._topArrowGap == value)
			{
				return;
			}
			this._topArrowGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _bottomArrowGap:number = 0;

		/**
		 * The space, in pixels, between the bottom arrow skin and the
		 * background skin. To have the arrow overlap the background, you may
		 * use a negative gap value.
		 *
		 * <p>In the following example, the gap between the callout and its
		 * bottom arrow is set to -4 pixels (perhaps to hide a border on the
		 * callout's background):</p>
		 *
		 * <listing version="3.0">
		 * callout.bottomArrowGap = -4;</listing>
		 *
		 * @default 0
		 */
		public get bottomArrowGap():number
		{
			return this._bottomArrowGap;
		}

		/**
		 * @private
		 */
		public set bottomArrowGap(value:number)
		{
			if(this._bottomArrowGap == value)
			{
				return;
			}
			this._bottomArrowGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _rightArrowGap:number = 0;

		/**
		 * The space, in pixels, between the right arrow skin and the background
		 * skin. To have the arrow overlap the background, you may use a
		 * negative gap value.
		 *
		 * <p>In the following example, the gap between the callout and its
		 * right arrow is set to -4 pixels (perhaps to hide a border on the
		 * callout's background):</p>
		 *
		 * <listing version="3.0">
		 * callout.rightArrowGap = -4;</listing>
		 *
		 * @default 0
		 */
		public get rightArrowGap():number
		{
			return this._rightArrowGap;
		}

		/**
		 * @private
		 */
		public set rightArrowGap(value:number)
		{
			if(this._rightArrowGap == value)
			{
				return;
			}
			this._rightArrowGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _leftArrowGap:number = 0;

		/**
		 * The space, in pixels, between the right arrow skin and the background
		 * skin. To have the arrow overlap the background, you may use a
		 * negative gap value.
		 *
		 * <p>In the following example, the gap between the callout and its
		 * left arrow is set to -4 pixels (perhaps to hide a border on the
		 * callout's background):</p>
		 *
		 * <listing version="3.0">
		 * callout.leftArrowGap = -4;</listing>
		 *
		 * @default 0
		 */
		public get leftArrowGap():number
		{
			return this._leftArrowGap;
		}

		/**
		 * @private
		 */
		public set leftArrowGap(value:number)
		{
			if(this._leftArrowGap == value)
			{
				return;
			}
			this._leftArrowGap = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _arrowOffset:number = 0;

		/**
		 * The offset, in pixels, of the arrow skin from the horizontal center
		 * or vertical middle of the background skin, depending on the position
		 * of the arrow (which side it is on). This value is used to point at
		 * the callout's origin when the callout is not perfectly centered
		 * relative to the origin.
		 *
		 * <p>On the top and bottom edges, the arrow will move left for negative
		 * values of <code>arrowOffset</code> and right for positive values. On
		 * the left and right edges, the arrow will move up for negative values
		 * and down for positive values.</p>
		 *
		 * <p>If you use <code>Callout.show()</code> or set the <code>origin</code>
		 * property manually, you should avoid manually modifying the
		 * <code>arrowPosition</code> and <code>arrowOffset</code> properties.</p>
		 *
		 * <p>In the following example, the arrow offset is set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * callout.arrowOffset = 20;</listing>
		 *
		 * @default 0
		 *
		 * @see #arrowPosition
		 * @see #origin
		 */
		public get arrowOffset():number
		{
			return this._arrowOffset;
		}

		/**
		 * @private
		 */
		public set arrowOffset(value:number)
		{
			if(this._arrowOffset == value)
			{
				return;
			}
			this._arrowOffset = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _lastGlobalBoundsOfOrigin:Rectangle;

		/**
		 * @private
		 */
		protected _ignoreContentResize:boolean = false;

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			this.origin = null;
			var savedContent:DisplayObject = this._content;
			this.content = null;
			//remove the content safely if it should not be disposed
			if(savedContent && this.disposeContent)
			{
				savedContent.dispose();
			}
			super.dispose();
		}

		/**
		 * Closes the callout.
		 */
		public close(dispose:boolean = false):void
		{
			if(this.parent)
			{
				//don't dispose here because we need to keep the event listeners
				//when dispatching Event.CLOSE. we'll dispose after that.
				this.removeFromParent(false);
				this.dispatchEventWith(Event.CLOSE);
			}
			if(dispose)
			{
				this.dispose();
			}
		}

		/**
		 * @private
		 */
		/*override*/ protected initialize():void
		{
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.callout_removedFromStageHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var dataInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_DATA);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var originInvalid:boolean = this.isInvalid(Callout.INVALIDATION_FLAG_ORIGIN);

			if(sizeInvalid)
			{
				this._lastGlobalBoundsOfOrigin = null;
				originInvalid = true;
			}

			if(originInvalid)
			{
				this.positionToOrigin();
			}

			if(stylesInvalid || stateInvalid)
			{
				this.refreshArrowSkin();
			}

			if(stateInvalid)
			{
				if(this._content instanceof IFeathersControl)
				{
					IFeathersControl(this._content).isEnabled = this._isEnabled;
				}
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(sizeInvalid || stylesInvalid || dataInvalid || stateInvalid)
			{
				this.layoutChildren();
			}
		}

		/**
		 * If the component's dimensions have not been set explicitly, it will
		 * measure its content and determine an ideal size for itself. If the
		 * <code>explicitWidth</code> or <code>explicitHeight</code> member
		 * variables are set, those value will be used without additional
		 * measurement. If one is set, but not the other, the dimension with the
		 * explicit value will not be measured, but the other non-explicit
		 * dimension will still need measurement.
		 *
		 * <p>Calls <code>setSizeInternal()</code> to set up the
		 * <code>actualWidth</code> and <code>actualHeight</code> member
		 * variables used for layout.</p>
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 */
		protected autoSizeIfNeeded():boolean
		{
			this.measureWithArrowPosition(this._arrowPosition, Callout.HELPER_POINT);
			return this.setSizeInternal(Callout.HELPER_POINT.x, Callout.HELPER_POINT.y, false);
		}

		/**
		 * @private
		 */
		protected measureWithArrowPosition(arrowPosition:string, result:Point = null):Point
		{
			if(!result)
			{
				result = new Point();
			}
			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				result.x = this.explicitWidth;
				result.y = this.explicitHeight;
				return result;
			}

			if(this._content instanceof IValidating)
			{
				IValidating(this._content).validate();
			}

			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				newWidth = this._content.width + this._paddingLeft + this._paddingRight;
				if(this._originalBackgroundWidth === this._originalBackgroundWidth) //!isNaN
				{
					newWidth = Math.max(this._originalBackgroundWidth, newWidth);
				}
				if(arrowPosition == Callout.ARROW_POSITION_LEFT && this._leftArrowSkin)
				{
					newWidth += this._leftArrowSkin.width + this._leftArrowGap;
				}
				if(arrowPosition == Callout.ARROW_POSITION_RIGHT && this._rightArrowSkin)
				{
					newWidth += this._rightArrowSkin.width + this._rightArrowGap;
				}
				if(arrowPosition == Callout.ARROW_POSITION_TOP && this._topArrowSkin)
				{
					newWidth = Math.max(newWidth, this._topArrowSkin.width + this._paddingLeft + this._paddingRight);
				}
				if(arrowPosition == Callout.ARROW_POSITION_BOTTOM && this._bottomArrowSkin)
				{
					newWidth = Math.max(newWidth, this._bottomArrowSkin.width + this._paddingLeft + this._paddingRight);
				}
				if(this.stage)
				{
					newWidth = Math.min(newWidth, this.stage.stageWidth - Callout.stagePaddingLeft - Callout.stagePaddingRight);
				}
			}
			if(needsHeight)
			{
				newHeight = this._content.height + this._paddingTop + this._paddingBottom;
				if(this._originalBackgroundHeight === this._originalBackgroundHeight) //!isNaN
				{
					newHeight = Math.max(this._originalBackgroundHeight, newHeight);
				}
				if(arrowPosition == Callout.ARROW_POSITION_TOP && this._topArrowSkin)
				{
					newHeight += this._topArrowSkin.height + this._topArrowGap;
				}
				if(arrowPosition == Callout.ARROW_POSITION_BOTTOM && this._bottomArrowSkin)
				{
					newHeight += this._bottomArrowSkin.height + this._bottomArrowGap;
				}
				if(arrowPosition == Callout.ARROW_POSITION_LEFT && this._leftArrowSkin)
				{
					newHeight = Math.max(newHeight, this._leftArrowSkin.height + this._paddingTop + this._paddingBottom);
				}
				if(arrowPosition == Callout.ARROW_POSITION_RIGHT && this._rightArrowSkin)
				{
					newHeight = Math.max(newHeight, this._rightArrowSkin.height + this._paddingTop + this._paddingBottom);
				}
				if(this.stage)
				{
					newHeight = Math.min(newHeight, this.stage.stageHeight - Callout.stagePaddingTop - Callout.stagePaddingBottom);
				}
			}
			result.x = Math.max(this._minWidth, Math.min(this._maxWidth, newWidth));
			result.y = Math.max(this._minHeight,  Math.min(this._maxHeight, newHeight));
			return result;
		}

		/**
		 * @private
		 */
		protected refreshArrowSkin():void
		{
			this.currentArrowSkin = null;
			if(this._arrowPosition == Callout.ARROW_POSITION_BOTTOM)
			{
				this.currentArrowSkin = this._bottomArrowSkin;
			}
			else if(this._bottomArrowSkin)
			{
				this._bottomArrowSkin.visible = false;
			}
			if(this._arrowPosition == Callout.ARROW_POSITION_TOP)
			{
				this.currentArrowSkin = this._topArrowSkin;
			}
			else if(this._topArrowSkin)
			{
				this._topArrowSkin.visible = false;
			}
			if(this._arrowPosition == Callout.ARROW_POSITION_LEFT)
			{
				this.currentArrowSkin = this._leftArrowSkin;
			}
			else if(this._leftArrowSkin)
			{
				this._leftArrowSkin.visible = false;
			}
			if(this._arrowPosition == Callout.ARROW_POSITION_RIGHT)
			{
				this.currentArrowSkin = this._rightArrowSkin;
			}
			else if(this._rightArrowSkin)
			{
				this._rightArrowSkin.visible = false;
			}
			if(this.currentArrowSkin)
			{
				this.currentArrowSkin.visible = true;
			}
		}

		/**
		 * @private
		 */
		protected layoutChildren():void
		{
			var xPosition:number = (this._leftArrowSkin && this._arrowPosition == Callout.ARROW_POSITION_LEFT) ? this._leftArrowSkin.width + this._leftArrowGap : 0;
			var yPosition:number = (this._topArrowSkin &&  this._arrowPosition == Callout.ARROW_POSITION_TOP) ? this._topArrowSkin.height + this._topArrowGap : 0;
			var widthOffset:number = (this._rightArrowSkin && this._arrowPosition == Callout.ARROW_POSITION_RIGHT) ? this._rightArrowSkin.width + this._rightArrowGap : 0;
			var heightOffset:number = (this._bottomArrowSkin && this._arrowPosition == Callout.ARROW_POSITION_BOTTOM) ? this._bottomArrowSkin.height + this._bottomArrowGap : 0;
			var backgroundWidth:number = this.actualWidth - xPosition - widthOffset;
			var backgroundHeight:number = this.actualHeight - yPosition - heightOffset;
			if(this._backgroundSkin)
			{
				this._backgroundSkin.x = xPosition;
				this._backgroundSkin.y = yPosition;
				this._backgroundSkin.width = backgroundWidth;
				this._backgroundSkin.height = backgroundHeight;
			}

			if(this.currentArrowSkin)
			{
				if(this._arrowPosition == Callout.ARROW_POSITION_LEFT)
				{
					this._leftArrowSkin.x = xPosition - this._leftArrowSkin.width - this._leftArrowGap;
					this._leftArrowSkin.y = this._arrowOffset + yPosition + Math.round((backgroundHeight - this._leftArrowSkin.height) / 2);
					this._leftArrowSkin.y = Math.min(yPosition + backgroundHeight - this._paddingBottom - this._leftArrowSkin.height, Math.max(yPosition + this._paddingTop, this._leftArrowSkin.y));
				}
				else if(this._arrowPosition == Callout.ARROW_POSITION_RIGHT)
				{
					this._rightArrowSkin.x = xPosition + backgroundWidth + this._rightArrowGap;
					this._rightArrowSkin.y = this._arrowOffset + yPosition + Math.round((backgroundHeight - this._rightArrowSkin.height) / 2);
					this._rightArrowSkin.y = Math.min(yPosition + backgroundHeight - this._paddingBottom - this._rightArrowSkin.height, Math.max(yPosition + this._paddingTop, this._rightArrowSkin.y));
				}
				else if(this._arrowPosition == Callout.ARROW_POSITION_BOTTOM)
				{
					this._bottomArrowSkin.x = this._arrowOffset + xPosition + Math.round((backgroundWidth - this._bottomArrowSkin.width) / 2);
					this._bottomArrowSkin.x = Math.min(xPosition + backgroundWidth - this._paddingRight - this._bottomArrowSkin.width, Math.max(xPosition + this._paddingLeft, this._bottomArrowSkin.x));
					this._bottomArrowSkin.y = yPosition + backgroundHeight + this._bottomArrowGap;
				}
				else //top
				{
					this._topArrowSkin.x = this._arrowOffset + xPosition + Math.round((backgroundWidth - this._topArrowSkin.width) / 2);
					this._topArrowSkin.x = Math.min(xPosition + backgroundWidth - this._paddingRight - this._topArrowSkin.width, Math.max(xPosition + this._paddingLeft, this._topArrowSkin.x));
					this._topArrowSkin.y = yPosition - this._topArrowSkin.height - this._topArrowGap;
				}
			}

			if(this._content)
			{
				this._content.x = xPosition + this._paddingLeft;
				this._content.y = yPosition + this._paddingTop;
				var oldIgnoreContentResize:boolean = this._ignoreContentResize;
				this._ignoreContentResize = true;
				var contentWidth:number = backgroundWidth - this._paddingLeft - this._paddingRight;
				var difference:number = Math.abs(this._content.width - contentWidth);
				//instead of !=, we do some fuzzy math to account for possible
				//floating point errors.
				if(difference > Callout.FUZZY_CONTENT_DIMENSIONS_PADDING)
				{
					this._content.width = contentWidth;
				}
				var contentHeight:number = backgroundHeight - this._paddingTop - this._paddingBottom;
				difference = Math.abs(this._content.height - contentHeight);
				//instead of !=, we do some fuzzy math to account for possible
				//floating point errors.
				if(difference > Callout.FUZZY_CONTENT_DIMENSIONS_PADDING)
				{
					this._content.height = contentHeight;
				}
				this._ignoreContentResize = oldIgnoreContentResize;
			}
		}

		/**
		 * @private
		 */
		protected positionToOrigin():void
		{
			if(!this._origin)
			{
				return;
			}
			this._origin.getBounds(Starling.current.stage, Callout.HELPER_RECT);
			var hasGlobalBounds:boolean = this._lastGlobalBoundsOfOrigin != null;
			if(!hasGlobalBounds || !this._lastGlobalBoundsOfOrigin.equals(Callout.HELPER_RECT))
			{
				if(!hasGlobalBounds)
				{
					this._lastGlobalBoundsOfOrigin = new Rectangle();
				}
				this._lastGlobalBoundsOfOrigin.x = Callout.HELPER_RECT.x;
				this._lastGlobalBoundsOfOrigin.y = Callout.HELPER_RECT.y;
				this._lastGlobalBoundsOfOrigin.width = Callout.HELPER_RECT.width;
				this._lastGlobalBoundsOfOrigin.height = Callout.HELPER_RECT.height;
				Callout.positionWithSupportedDirections(this, this._lastGlobalBoundsOfOrigin, this._supportedDirections);
			}
		}

		/**
		 * @private
		 */
		protected callout_addedToStageHandler(event:Event):void
		{
			//using priority here is a hack so that objects higher up in the
			//display list have a chance to cancel the event first.
			var priority:number = -getDisplayObjectDepthFromStage(this);
			Starling.current.nativeStage.addEventListener(KeyboardEvent.KEY_DOWN, this.callout_nativeStage_keyDownHandler, false, priority, true);

			this.stage.addEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			//to avoid touch events bubbling up to the callout and causing it to
			//close immediately, we wait one frame before allowing it to close
			//based on touches.
			this._isReadyToClose = false;
			this.addEventListener(EnterFrameEvent.ENTER_FRAME, this.callout_oneEnterFrameHandler);
		}

		/**
		 * @private
		 */
		protected callout_removedFromStageHandler(event:Event):void
		{
			this.stage.removeEventListener(TouchEvent.TOUCH, this.stage_touchHandler);
			Starling.current.nativeStage.removeEventListener(KeyboardEvent.KEY_DOWN, this.callout_nativeStage_keyDownHandler);
		}

		/**
		 * @private
		 */
		protected callout_oneEnterFrameHandler(event:Event):void
		{
			this.removeEventListener(EnterFrameEvent.ENTER_FRAME, this.callout_oneEnterFrameHandler);
			this._isReadyToClose = true;
		}

		/**
		 * @private
		 */
		protected callout_enterFrameHandler(event:EnterFrameEvent):void
		{
			this.positionToOrigin();
		}

		/**
		 * @private
		 */
		protected stage_touchHandler(event:TouchEvent):void
		{
			var target:DisplayObject = DisplayObject(event.target);
			if(!this._isReadyToClose ||
				(!this.closeOnTouchEndedOutside && !this.closeOnTouchBeganOutside) || this.contains(target) ||
				(PopUpManager.isPopUp(this) && !PopUpManager.isTopLevelPopUp(this)))
			{
				return;
			}

			if(this._origin == target || (this._origin instanceof DisplayObjectContainer && DisplayObjectContainer(this._origin).contains(target)))
			{
				return;
			}

			if(this.closeOnTouchBeganOutside)
			{
				var touch:Touch = event.getTouch(this.stage, TouchPhase.BEGAN);
				if(touch)
				{
					this.close(this.disposeOnSelfClose);
					return;
				}
			}
			if(this.closeOnTouchEndedOutside)
			{
				touch = event.getTouch(this.stage, TouchPhase.ENDED);
				if(touch)
				{
					this.close(this.disposeOnSelfClose);
					return;
				}
			}
		}

		/**
		 * @private
		 */
		protected callout_nativeStage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.isDefaultPrevented())
			{
				//someone else already handled this one
				return;
			}
			if(!this.closeOnKeys || this.closeOnKeys.indexOf(event.keyCode) < 0)
			{
				return;
			}
			//don't let the OS handle the event
			event.preventDefault();
			this.close(this.disposeOnSelfClose);
		}

		/**
		 * @private
		 */
		protected origin_removedFromStageHandler(event:Event):void
		{
			this.close(this.disposeOnSelfClose);
		}

		/**
		 * @private
		 */
		protected content_resizeHandler(event:Event):void
		{
			if(this._ignoreContentResize)
			{
				return;
			}
			this.invalidate(this.INVALIDATION_FLAG_SIZE);
		}
	}
}
