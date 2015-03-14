/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.core
{
	import BitmapFontTextRenderer = feathers.controls.text.BitmapFontTextRenderer;
	import StageTextTextEditor = feathers.controls.text.StageTextTextEditor;
	import FeathersEventType = feathers.events.FeathersEventType;
	import ILayoutData = feathers.layout.ILayoutData;
	import ILayoutDisplayObject = feathers.layout.ILayoutDisplayObject;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import getDisplayObjectDepthFromStage = feathers.utils.display.getDisplayObjectDepthFromStage;

	import IllegalOperationError = flash.errors.IllegalOperationError;
	import Matrix = flash.geom.Matrix;
	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;

	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Sprite = starling.display.Sprite;
	import Event = starling.events.Event;
	import MatrixUtil = starling.utils.MatrixUtil;

	/**
	 * Dispatched after <code>initialize()</code> has been called, but before
	 * the first time that <code>draw()</code> has been called.
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
	 * @eventType feathers.events.FeathersEventType.INITIALIZE
	 */
	/*[Event(name="initialize",type="starling.events.Event")]*/

	/**
	 * Dispatched after the component has validated for the first time. Both
	 * <code>initialize()</code> and <code>draw()</code> will have been called,
	 * and all children will have been created.
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
	 * @eventType feathers.events.FeathersEventType.CREATION_COMPLETE
	 */
	/*[Event(name="creationComplete",type="starling.events.Event")]*/

	/**
	 * Dispatched when the width or height of the control changes.
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
	 * @eventType feathers.events.FeathersEventType.RESIZE
	 */
	/*[Event(name="resize",type="starling.events.Event")]*/

	/**
	 * Base class for all UI controls. Implements invalidation and sets up some
	 * basic template functions like <code>initialize()</code> and
	 * <code>draw()</code>.
	 *
	 * <p>This is a base class for Feathers components that isn't meant to be
	 * instantiated directly. It should only be subclassed. For a simple
	 * component that will automatically size itself based on its children,
	 * and with optional support for layouts, see <code>LayoutGroup</code>.</p>
	 *
	 * @see feathers.controls.LayoutGroup
	 */
	export class FeathersControl extends Sprite implements IFeathersControl, ILayoutDisplayObject
	{
		/**
		 * @private
		 */
		private static HELPER_MATRIX:Matrix = new Matrix();

		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * Flag to indicate that everything is invalid and should be redrawn.
		 */
		public static INVALIDATION_FLAG_ALL:string = "all";

		/**
		 * Invalidation flag to indicate that the state has changed. Used by
		 * <code>isEnabled</code>, but may be used for other control states too.
		 *
		 * @see #isEnabled
		 */
		public static INVALIDATION_FLAG_STATE:string = "state";

		/**
		 * Invalidation flag to indicate that the dimensions of the UI control
		 * have changed.
		 */
		public static INVALIDATION_FLAG_SIZE:string = "size";

		/**
		 * Invalidation flag to indicate that the styles or visual appearance of
		 * the UI control has changed.
		 */
		public static INVALIDATION_FLAG_STYLES:string = "styles";

		/**
		 * Invalidation flag to indicate that the skin of the UI control has changed.
		 */
		public static INVALIDATION_FLAG_SKIN:string = "skin";

		/**
		 * Invalidation flag to indicate that the layout of the UI control has
		 * changed.
		 */
		public static INVALIDATION_FLAG_LAYOUT:string = "layout";

		/**
		 * Invalidation flag to indicate that the primary data displayed by the
		 * UI control has changed.
		 */
		public static INVALIDATION_FLAG_DATA:string = "data";

		/**
		 * Invalidation flag to indicate that the scroll position of the UI
		 * control has changed.
		 */
		public static INVALIDATION_FLAG_SCROLL:string = "scroll";

		/**
		 * Invalidation flag to indicate that the selection of the UI control
		 * has changed.
		 */
		public static INVALIDATION_FLAG_SELECTED:string = "selected";

		/**
		 * Invalidation flag to indicate that the focus of the UI control has
		 * changed.
		 */
		public static INVALIDATION_FLAG_FOCUS:string = "focus";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_TEXT_RENDERER:string = "textRenderer";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_TEXT_EDITOR:string = "textEditor";

		/**
		 * @private
		 */
		protected static ILLEGAL_WIDTH_ERROR:string = "A component's width cannot be NaN.";

		/**
		 * @private
		 */
		protected static ILLEGAL_HEIGHT_ERROR:string = "A component's height cannot be NaN.";

		/**
		 * @private
		 */
		protected static ABSTRACT_CLASS_ERROR:string = "FeathersControl is an abstract class. For a lightweight Feathers wrapper, use feathers.controls.LayoutGroup.";

		/**
		 * A function used by all UI controls that support text renderers to
		 * create an ITextRenderer instance. You may replace the default
		 * function with your own, if you prefer not to use the
		 * BitmapFontTextRenderer.
		 *
		 * <p>The function is expected to have the following signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * @see ../../../help/text-renderers.html Introduction to Feathers text renderers
		 * @see feathers.core.ITextRenderer
		 */
		public static defaultTextRendererFactory:Function = function():ITextRenderer
		{
			return new BitmapFontTextRenderer();
		}

		/**
		 * A function used by all UI controls that support text editor to
		 * create an <code>ITextEditor</code> instance. You may replace the
		 * default function with your own, if you prefer not to use the
		 * <code>StageTextTextEditor</code>.
		 *
		 * <p>The function is expected to have the following signature:</p>
		 * <pre>function():ITextEditor</pre>
		 *
		 * @see ../../../help/text-editors.html Introduction to Feathers text editors
		 * @see feathers.core.ITextEditor
		 */
		public static defaultTextEditorFactory:Function = function():ITextEditor
		{
			return new StageTextTextEditor();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			if(Object(this).constructor == FeathersControl)
			{
				throw new Error(FeathersControl.ABSTRACT_CLASS_ERROR);
			}
			this._styleProvider = this.defaultStyleProvider;
			this.addEventListener(Event.ADDED_TO_STAGE, this.feathersControl_addedToStageHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.feathersControl_removedFromStageHandler);
			this.addEventListener(Event.FLATTEN, this.feathersControl_flattenHandler);
		}

		/**
		 * @private
		 */
		protected _validationQueue:ValidationQueue;

		/**
		 * The concatenated <code>styleNameList</code>, with values separated
		 * by spaces. Style names are somewhat similar to classes in CSS
		 * selectors. In Feathers, they are a non-unique identifier that can
		 * differentiate multiple styles of the same type of UI control. A
		 * single control may have many style names, and many controls can share
		 * a single style name. A <a target="_top" href="../../../help/themes.html">theme</a>
		 * or another skinning mechanism may use style names to provide a
		 * variety of visual appearances for a single component class.
		 *
		 * <p>In general, the <code>styleName</code> property should not be set
		 * directly on a Feathers component. You should add and remove style
		 * names from the <code>styleNameList</code> property instead.</p>
		 *
		 * @default ""
		 *
		 * @see #styleNameList
		 * @see ../../../help/themes.html Introduction the Feathers themes
		 * @see ../../../help/custom-themes.html Creating custom Feathers themes
		 */
		public get styleName():string
		{
			return this._styleNameList.value;
		}

		/**
		 * @private
		 */
		public set styleName(value:string)
		{
			this._styleNameList.value = value;
		}

		/**
		 * @private
		 */
		protected _styleNameList:TokenList = new TokenList();

		/**
		 * Contains a list of all "styles" assigned to this control. Names are
		 * like classes in CSS selectors. They are a non-unique identifier that
		 * can differentiate multiple styles of the same type of UI control. A
		 * single control may have many names, and many controls can share a
		 * single name. A <a target="_top" href="../../../help/themes.html">theme</a>
		 * or another skinning mechanism may use style names to provide a
		 * variety of visual appearances for a single component class.
		 *
		 * <p>Names may be added, removed, or toggled on the
		 * <code>styleNameList</code>. Names cannot contain spaces.</p>
		 *
		 * <p>In the following example, a name is added to the name list:</p>
		 *
		 * <listing version="3.0">
		 * control.styleNameList.add( "custom-component-name" );</listing>
		 *
		 * @see #styleName
		 * @see ../../../help/themes.html Introduction to Feathers themes
		 * @see ../../../help/custom-themes.html Creating custom Feathers themes
		 */
		public get styleNameList():TokenList
		{
			return this._styleNameList;
		}

		/**
		 * DEPRECATED: Replaced by the <code>styleNameList</code>
		 * property.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.0. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #styleNameList
		 */
		public get nameList():TokenList
		{
			return this._styleNameList;
		}

		/**
		 * @private
		 */
		protected _styleProvider:IStyleProvider;

		/**
		 * When a component initializes, a style provider may be used to set
		 * properties that affect the component's visual appearance.
		 *
		 * <p>You can set or replace an existing style provider at any time
		 * before a component initializes without immediately affecting the
		 * component's visual appearance. After the component initializes, the
		 * style provider may still be changed, but any properties that
		 * were set by the previous style provider will not be reset to their
		 * default values.</p>
		 *
		 * @see #styleName
		 * @see #styleNameList
		 * @see ../../../help/themes.html Introduction to Feathers themes
		 */
		public get styleProvider():IStyleProvider
		{
			return this._styleProvider;
		}

		/**
		 * @private
		 */
		public set styleProvider(value:IStyleProvider)
		{
			this._styleProvider = value;
			if(this._styleProvider && this.isInitialized)
			{
				this._styleProvider.applyStyles(this);
			}
		}

		/**
		 * When the <code>FeathersControl</code> constructor is called, the
		 * <code>globalStyleProvider</code> property is set to this value. May be
		 * <code>null</code>.
		 *
		 * <p>Typically, a subclass of <code>FeathersControl</code> will
		 * override this function to return its static <code>globalStyleProvider</code>
		 * value. For instance, <code>feathers.controls.Button</code> overrides
		 * this function, and its implementation looks like this:</p>
		 *
		 * <listing version="3.0">
		 * override protected function get defaultStyleProvider():IStyleProvider
		 * {
		 *     return Button.globalStyleProvider;
		 * }</listing>
		 *
		 * @see #styleProvider
		 */
		protected get defaultStyleProvider():IStyleProvider
		{
			return null;
		}

		/**
		 * @private
		 */
		protected _isQuickHitAreaEnabled:boolean = false;

		/**
		 * Similar to <code>mouseChildren</code> on the classic display list. If
		 * <code>true</code>, children cannot dispatch touch events, but hit
		 * tests will be much faster. Easier than overriding
		 * <code>hitTest()</code>.
		 *
		 * <p>In the following example, the quick hit area is enabled:</p>
		 *
		 * <listing version="3.0">
		 * control.isQuickHitAreaEnabled = true;</listing>
		 *
		 * @default false
		 */
		public get isQuickHitAreaEnabled():boolean
		{
			return this._isQuickHitAreaEnabled;
		}

		/**
		 * @private
		 */
		public set isQuickHitAreaEnabled(value:boolean)
		{
			this._isQuickHitAreaEnabled = value;
		}

		/**
		 * @private
		 */
		protected _hitArea:Rectangle = new Rectangle();

		/**
		 * @private
		 */
		protected _isInitialized:boolean = false;

		/**
		 * Determines if the component has been initialized yet. The
		 * <code>initialize()</code> function is called one time only, when the
		 * Feathers UI control is added to the display list for the first time.
		 *
		 * <p>In the following example, we check if the component is initialized
		 * or not, and we listen for an event if it isn't:</p>
		 *
		 * <listing version="3.0">
		 * if( !control.isInitialized )
		 * {
		 *     control.addEventListener( FeathersEventType.INITIALIZE, initializeHandler );
		 * }</listing>
		 *
		 * @see #event:initialize
		 * @see #isCreated
		 */
		public get isInitialized():boolean
		{
			return this._isInitialized;
		}

		/**
		 * @private
		 * A flag that indicates that everything is invalid. If true, no other
		 * flags will need to be tracked.
		 */
		protected _isAllInvalid:boolean = false;

		/**
		 * @private
		 */
		protected _invalidationFlags:Object = {};

		/**
		 * @private
		 */
		protected _delayedInvalidationFlags:Object = {};

		/**
		 * @private
		 */
		protected _isEnabled:boolean = true;

		/**
		 * Indicates whether the control is interactive or not.
		 *
		 * <p>In the following example, the control is disabled:</p>
		 *
		 * <listing version="3.0">
		 * control.isEnabled = false;</listing>
		 *
		 * @default true
		 */
		public get isEnabled():boolean
		{
			return this._isEnabled;
		}

		/**
		 * @private
		 */
		public set isEnabled(value:boolean)
		{
			if(this._isEnabled == value)
			{
				return;
			}
			this._isEnabled = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_STATE);
		}

		/**
		 * The width value explicitly set by calling the width setter or
		 * setSize().
		 */
		protected explicitWidth:number = NaN;

		/**
		 * The final width value that should be used for layout. If the width
		 * has been explicitly set, then that value is used. If not, the actual
		 * width will be calculated automatically. Each component has different
		 * automatic sizing behavior, but it's usually based on the component's
		 * skin or content, including text or subcomponents.
		 */
		protected actualWidth:number = 0;

		/**
		 * @private
		 * The <code>actualWidth</code> value that accounts for
		 * <code>scaleX</code>. Not intended to be used for layout since layout
		 * uses unscaled values. This is the value exposed externally through
		 * the <code>width</code> getter.
		 */
		protected scaledActualWidth:number = 0;

		/**
		 * The width of the component, in pixels. This could be a value that was
		 * set explicitly, or the component will automatically resize if no
		 * explicit width value is provided. Each component has a different
		 * automatic sizing behavior, but it's usually based on the component's
		 * skin or content, including text or subcomponents.
		 * 
		 * <p><strong>Note:</strong> Values of the <code>width</code> and
		 * <code>height</code> properties may not be accurate until after
		 * validation. If you are seeing <code>width</code> or <code>height</code>
		 * values of <code>0</code>, but you can see something on the screen and
		 * know that the value should be larger, it may be because you asked for
		 * the dimensions before the component had validated. Call
		 * <code>validate()</code> to tell the component to immediately redraw
		 * and calculate an accurate values for the dimensions.</p>
		 *
		 * <p>In the following example, the width is set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.width = 120;</listing>
		 *
		 * <p>In the following example, the width is cleared so that the
		 * component can automatically measure its own width:</p>
		 *
		 * <listing version="3.0">
		 * control.width = NaN;</listing>
		 *
		 * @see feathers.core.FeathersControl#setSize()
		 * @see feathers.core.FeathersControl#validate()
		 */
		/*override*/ public get width():number
		{
			return this.scaledActualWidth;
		}

		/**
		 * @private
		 */
		/*override*/ public set width(value:number)
		{
			if(this.explicitWidth == value)
			{
				return;
			}
			var valueIsNaN:boolean = value !== value; //isNaN
			if(valueIsNaN && this.explicitWidth !== this.explicitWidth)
			{
				return;
			}
			this.explicitWidth = value;
			if(valueIsNaN)
			{
				this.actualWidth = this.scaledActualWidth = 0;
				this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
			}
			else
			{
				this.setSizeInternal(value, this.actualHeight, true);
			}
		}

		/**
		 * The height value explicitly set by calling the height setter or
		 * setSize().
		 */
		protected explicitHeight:number = NaN;

		/**
		 * The final height value that should be used for layout. If the height
		 * has been explicitly set, then that value is used. If not, the actual
		 * height will be calculated automatically. Each component has different
		 * automatic sizing behavior, but it's usually based on the component's
		 * skin or content, including text or subcomponents.
		 */
		protected actualHeight:number = 0;

		/**
		 * @private
		 * The <code>actualHeight</code> value that accounts for
		 * <code>scaleY</code>. Not intended to be used for layout since layout
		 * uses unscaled values. This is the value exposed externally through
		 * the <code>height</code> getter.
		 */
		protected scaledActualHeight:number = 0;

		/**
		 * The height of the component, in pixels. This could be a value that
		 * was set explicitly, or the component will automatically resize if no
		 * explicit height value is provided. Each component has a different
		 * automatic sizing behavior, but it's usually based on the component's
		 * skin or content, including text or subcomponents.
		 * 
		 * <p><strong>Note:</strong> Values of the <code>width</code> and
		 * <code>height</code> properties may not be accurate until after
		 * validation. If you are seeing <code>width</code> or <code>height</code>
		 * values of <code>0</code>, but you can see something on the screen and
		 * know that the value should be larger, it may be because you asked for
		 * the dimensions before the component had validated. Call
		 * <code>validate()</code> to tell the component to immediately redraw
		 * and calculate an accurate values for the dimensions.</p>
		 *
		 * <p>In the following example, the height is set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.height = 120;</listing>
		 *
		 * <p>In the following example, the height is cleared so that the
		 * component can automatically measure its own height:</p>
		 *
		 * <listing version="3.0">
		 * control.height = NaN;</listing>
		 *
		 * @see feathers.core.FeathersControl#setSize()
		 * @see feathers.core.FeathersControl#validate()
		 */
		/*override*/ public get height():number
		{
			return this.scaledActualHeight;
		}

		/**
		 * @private
		 */
		/*override*/ public set height(value:number)
		{
			if(this.explicitHeight == value)
			{
				return;
			}
			var valueIsNaN:boolean = value !== value; //isNaN
			if(valueIsNaN && this.explicitHeight !== this.explicitHeight)
			{
				return;
			}
			this.explicitHeight = value;
			if(valueIsNaN)
			{
				this.actualHeight = this.scaledActualHeight = 0;
				this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
			}
			else
			{
				this.setSizeInternal(this.actualWidth, value, true);
			}
		}

		/**
		 * @private
		 */
		protected _minTouchWidth:number = 0;

		/**
		 * If using <code>isQuickHitAreaEnabled</code>, and the hit area's
		 * width is smaller than this value, it will be expanded.
		 *
		 * <p>In the following example, the minimum width of the hit area is
		 * set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.minTouchWidth = 120;</listing>
		 *
		 * @default 0
		 */
		public get minTouchWidth():number
		{
			return this._minTouchWidth;
		}

		/**
		 * @private
		 */
		public set minTouchWidth(value:number)
		{
			if(this._minTouchWidth == value)
			{
				return;
			}
			this._minTouchWidth = value;
			this.refreshHitAreaX();
		}

		/**
		 * @private
		 */
		protected _minTouchHeight:number = 0;

		/**
		 * If using <code>isQuickHitAreaEnabled</code>, and the hit area's
		 * height is smaller than this value, it will be expanded.
		 *
		 * <p>In the following example, the minimum height of the hit area is
		 * set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.minTouchHeight = 120;</listing>
		 *
		 * @default 0
		 */
		public get minTouchHeight():number
		{
			return this._minTouchHeight;
		}

		/**
		 * @private
		 */
		public set minTouchHeight(value:number)
		{
			if(this._minTouchHeight == value)
			{
				return;
			}
			this._minTouchHeight = value;
			this.refreshHitAreaY();
		}

		/**
		 * @private
		 */
		protected _minWidth:number = 0;

		/**
		 * The minimum recommended width to be used for self-measurement and,
		 * optionally, by any code that is resizing this component. This value
		 * is not strictly enforced in all cases. An explicit width value that
		 * is smaller than <code>minWidth</code> may be set and will not be
		 * affected by the minimum.
		 *
		 * <p>In the following example, the minimum width of the control is
		 * set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.minWidth = 120;</listing>
		 *
		 * @default 0
		 */
		public get minWidth():number
		{
			return this._minWidth;
		}

		/**
		 * @private
		 */
		public set minWidth(value:number)
		{
			if(this._minWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minWidth cannot be NaN");
			}
			this._minWidth = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _minHeight:number = 0;

		/**
		 * The minimum recommended height to be used for self-measurement and,
		 * optionally, by any code that is resizing this component. This value
		 * is not strictly enforced in all cases. An explicit height value that
		 * is smaller than <code>minHeight</code> may be set and will not be
		 * affected by the minimum.
		 *
		 * <p>In the following example, the minimum height of the control is
		 * set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.minHeight = 120;</listing>
		 *
		 * @default 0
		 */
		public get minHeight():number
		{
			return this._minHeight;
		}

		/**
		 * @private
		 */
		public set minHeight(value:number)
		{
			if(this._minHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("minHeight cannot be NaN");
			}
			this._minHeight = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _maxWidth:number = Number.POSITIVE_INFINITY;

		/**
		 * The maximum recommended width to be used for self-measurement and,
		 * optionally, by any code that is resizing this component. This value
		 * is not strictly enforced in all cases. An explicit width value that
		 * is larger than <code>maxWidth</code> may be set and will not be
		 * affected by the maximum.
		 *
		 * <p>In the following example, the maximum width of the control is
		 * set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.maxWidth = 120;</listing>
		 *
		 * @default Number.POSITIVE_INFINITY
		 */
		public get maxWidth():number
		{
			return this._maxWidth;
		}

		/**
		 * @private
		 */
		public set maxWidth(value:number)
		{
			if(this._maxWidth == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxWidth cannot be NaN");
			}
			this._maxWidth = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		protected _maxHeight:number = Number.POSITIVE_INFINITY;

		/**
		 * The maximum recommended height to be used for self-measurement and,
		 * optionally, by any code that is resizing this component. This value
		 * is not strictly enforced in all cases. An explicit height value that
		 * is larger than <code>maxHeight</code> may be set and will not be
		 * affected by the maximum.
		 *
		 * <p>In the following example, the maximum width of the control is
		 * set to 120 pixels:</p>
		 *
		 * <listing version="3.0">
		 * control.maxWidth = 120;</listing>
		 *
		 * @default Number.POSITIVE_INFINITY
		 */
		public get maxHeight():number
		{
			return this._maxHeight;
		}

		/**
		 * @private
		 */
		public set maxHeight(value:number)
		{
			if(this._maxHeight == value)
			{
				return;
			}
			if(value !== value) //isNaN
			{
				throw new ArgumentError("maxHeight cannot be NaN");
			}
			this._maxHeight = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
		}

		/**
		 * @private
		 */
		/*override*/ public set scaleX(value:number)
		{
			super.scaleX = value;
			this.setSizeInternal(this.actualWidth, this.actualHeight, false);
		}

		/**
		 * @private
		 */
		/*override*/ public set scaleY(value:number)
		{
			super.scaleY = value;
			this.setSizeInternal(this.actualWidth, this.actualHeight, false);
		}

		/**
		 * @private
		 */
		protected _includeInLayout:boolean = true;

		/**
		 * @inheritDoc
		 *
		 * @default true
		 */
		public get includeInLayout():boolean
		{
			return this._includeInLayout;
		}

		/**
		 * @private
		 */
		public set includeInLayout(value:boolean)
		{
			if(this._includeInLayout == value)
			{
				return;
			}
			this._includeInLayout = value;
			this.dispatchEventWith(FeathersEventType.LAYOUT_DATA_CHANGE);
		}

		/**
		 * @private
		 */
		protected _layoutData:ILayoutData;

		/**
		 * @inheritDoc
		 *
		 * @default null
		 */
		public get layoutData():ILayoutData
		{
			return this._layoutData;
		}

		/**
		 * @private
		 */
		public set layoutData(value:ILayoutData)
		{
			if(this._layoutData == value)
			{
				return;
			}
			if(this._layoutData)
			{
				this._layoutData.removeEventListener(Event.CHANGE, this.layoutData_changeHandler);
			}
			this._layoutData = value;
			if(this._layoutData)
			{
				this._layoutData.addEventListener(Event.CHANGE, this.layoutData_changeHandler);
			}
			this.dispatchEventWith(FeathersEventType.LAYOUT_DATA_CHANGE);
		}

		/**
		 * @private
		 */
		protected _focusManager:IFocusManager;

		/**
		 * @copy feathers.core.IFocusDisplayObject#focusManager
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * @default null
		 */
		public get focusManager():IFocusManager
		{
			return this._focusManager;
		}

		/**
		 * @private
		 */
		public set focusManager(value:IFocusManager)
		{
			if(!(this instanceof this.IFocusDisplayObject))
			{
				throw new IllegalOperationError("Cannot pass a focus manager to a component that does not implement feathers.core.IFocusDisplayObject");
			}
			if(this._focusManager == value)
			{
				return;
			}
			this._focusManager = value;
			if(this._focusManager)
			{
				this.addEventListener(FeathersEventType.FOCUS_IN, this.focusInHandler);
				this.addEventListener(FeathersEventType.FOCUS_OUT, this.focusOutHandler);
			}
			else
			{
				this.removeEventListener(FeathersEventType.FOCUS_IN, this.focusInHandler);
				this.removeEventListener(FeathersEventType.FOCUS_OUT, this.focusOutHandler);
			}
		}

		/**
		 * @private
		 */
		protected _focusOwner:IFocusDisplayObject;

		/**
		 * @copy feathers.core.IFocusDisplayObject#focusOwner
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * @default null
		 */
		public get focusOwner():IFocusDisplayObject
		{
			return this._focusOwner;
		}

		/**
		 * @private
		 */
		public set focusOwner(value:IFocusDisplayObject)
		{
			this._focusOwner = value;
		}

		/**
		 * @private
		 */
		protected _isFocusEnabled:boolean = true;

		/**
		 * @copy feathers.core.IFocusDisplayObject#isFocusEnabled
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * @default true
		 */
		public get isFocusEnabled():boolean
		{
			return this._isEnabled && this._isFocusEnabled;
		}

		/**
		 * @private
		 */
		public set isFocusEnabled(value:boolean)
		{
			if(!(this instanceof this.IFocusDisplayObject))
			{
				throw new IllegalOperationError("Cannot enable focus on a component that does not implement feathers.core.IFocusDisplayObject");
			}
			if(this._isFocusEnabled == value)
			{
				return;
			}
			this._isFocusEnabled = value;
		}

		/**
		 * @private
		 */
		protected _nextTabFocus:IFocusDisplayObject;

		/**
		 * @copy feathers.core.IFocusDisplayObject#nextTabFocus
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * @default null
		 */
		public get nextTabFocus():IFocusDisplayObject
		{
			return this._nextTabFocus;
		}

		/**
		 * @private
		 */
		public set nextTabFocus(value:IFocusDisplayObject)
		{
			if(!(this instanceof this.IFocusDisplayObject))
			{
				throw new IllegalOperationError("Cannot set next tab focus on a component that does not implement feathers.core.IFocusDisplayObject");
			}
			this._nextTabFocus = value;
		}

		/**
		 * @private
		 */
		protected _previousTabFocus:IFocusDisplayObject;

		/**
		 * @copy feathers.core.IFocusDisplayObject#previousTabFocus
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * @default null
		 */
		public get previousTabFocus():IFocusDisplayObject
		{
			return this._previousTabFocus;
		}

		/**
		 * @private
		 */
		public set previousTabFocus(value:IFocusDisplayObject)
		{
			if(!(this instanceof this.IFocusDisplayObject))
			{
				throw new IllegalOperationError("Cannot set previous tab focus on a component that does not implement feathers.core.IFocusDisplayObject");
			}
			this._previousTabFocus = value;
		}

		/**
		 * @private
		 */
		protected _focusIndicatorSkin:DisplayObject;

		/**
		 * If this component supports focus, this optional skin will be
		 * displayed above the component when <code>showFocus()</code> is
		 * called. The focus indicator skin is not always displayed when the
		 * component has focus. Typically, if the component receives focus from
		 * a touch, the focus indicator is not displayed.
		 *
		 * <p>The <code>touchable</code> of this skin will always be set to
		 * <code>false</code> so that it does not "steal" touches from the
		 * component or its sub-components. This skin will not affect the
		 * dimensions of the component or its hit area. It is simply a visual
		 * indicator of focus.</p>
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * <p>In the following example, the focus indicator skin is set:</p>
		 *
		 * <listing version="3.0">
		 * control.focusIndicatorSkin = new Image( texture );</listing>
		 *
		 * @default null
		 */
		public get focusIndicatorSkin():DisplayObject
		{
			return this._focusIndicatorSkin;
		}

		/**
		 * @private
		 */
		public set focusIndicatorSkin(value:DisplayObject)
		{
			if(!(this instanceof this.IFocusDisplayObject))
			{
				throw new IllegalOperationError("Cannot set focus indicator skin on a component that does not implement feathers.core.IFocusDisplayObject");
			}
			if(this._focusIndicatorSkin == value)
			{
				return;
			}
			if(this._focusIndicatorSkin && this._focusIndicatorSkin.parent == this)
			{
				this._focusIndicatorSkin.removeFromParent(false);
			}
			this._focusIndicatorSkin = value;
			if(this._focusIndicatorSkin)
			{
				this._focusIndicatorSkin.touchable = false;
			}
			if(this._focusManager && this._focusManager.focus == this)
			{
				this.invalidate(FeathersControl.INVALIDATION_FLAG_STYLES);
			}
		}

		/**
		 * Quickly sets all focus padding properties to the same value. The
		 * <code>focusPadding</code> getter always returns the value of
		 * <code>focusPaddingTop</code>, but the other focus padding values may
		 * be different.
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * <p>The following example gives the button 2 pixels of focus padding
		 * on all sides:</p>
		 *
		 * <listing version="3.0">
		 * control.focusPadding = 2;</listing>
		 *
		 * @default 0
		 *
		 * @see #focusPaddingTop
		 * @see #focusPaddingRight
		 * @see #focusPaddingBottom
		 * @see #focusPaddingLeft
		 */
		public get focusPadding():number
		{
			return this._focusPaddingTop;
		}

		/**
		 * @private
		 */
		public set focusPadding(value:number)
		{
			this.focusPaddingTop = value;
			this.focusPaddingRight = value;
			this.focusPaddingBottom = value;
			this.focusPaddingLeft = value;
		}

		/**
		 * @private
		 */
		protected _focusPaddingTop:number = 0;

		/**
		 * The minimum space, in pixels, between the object's top edge and the
		 * top edge of the focus indicator skin. A negative value may be used
		 * to expand the focus indicator skin outside the bounds of the object.
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * <p>The following example gives the focus indicator skin -2 pixels of
		 * padding on the top edge only:</p>
		 *
		 * <listing version="3.0">
		 * control.focusPaddingTop = -2;</listing>
		 *
		 * @default 0
		 */
		public get focusPaddingTop():number
		{
			return this._focusPaddingTop;
		}

		/**
		 * @private
		 */
		public set focusPaddingTop(value:number)
		{
			if(this._focusPaddingTop == value)
			{
				return;
			}
			this._focusPaddingTop = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * @private
		 */
		protected _focusPaddingRight:number = 0;

		/**
		 * The minimum space, in pixels, between the object's right edge and the
		 * right edge of the focus indicator skin. A negative value may be used
		 * to expand the focus indicator skin outside the bounds of the object.
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * <p>The following example gives the focus indicator skin -2 pixels of
		 * padding on the right edge only:</p>
		 *
		 * <listing version="3.0">
		 * control.focusPaddingRight = -2;</listing>
		 *
		 * @default 0
		 */
		public get focusPaddingRight():number
		{
			return this._focusPaddingRight;
		}

		/**
		 * @private
		 */
		public set focusPaddingRight(value:number)
		{
			if(this._focusPaddingRight == value)
			{
				return;
			}
			this._focusPaddingRight = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * @private
		 */
		protected _focusPaddingBottom:number = 0;

		/**
		 * The minimum space, in pixels, between the object's bottom edge and the
		 * bottom edge of the focus indicator skin. A negative value may be used
		 * to expand the focus indicator skin outside the bounds of the object.
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * <p>The following example gives the focus indicator skin -2 pixels of
		 * padding on the bottom edge only:</p>
		 *
		 * <listing version="3.0">
		 * control.focusPaddingBottom = -2;</listing>
		 *
		 * @default 0
		 */
		public get focusPaddingBottom():number
		{
			return this._focusPaddingBottom;
		}

		/**
		 * @private
		 */
		public set focusPaddingBottom(value:number)
		{
			if(this._focusPaddingBottom == value)
			{
				return;
			}
			this._focusPaddingBottom = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * @private
		 */
		protected _focusPaddingLeft:number = 0;

		/**
		 * The minimum space, in pixels, between the object's left edge and the
		 * left edge of the focus indicator skin. A negative value may be used
		 * to expand the focus indicator skin outside the bounds of the object.
		 *
		 * <p>The implementation of this property is provided for convenience,
		 * but it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 *
		 * <p>The following example gives the focus indicator skin -2 pixels of
		 * padding on the right edge only:</p>
		 *
		 * <listing version="3.0">
		 * control.focusPaddingLeft = -2;</listing>
		 *
		 * @default 0
		 */
		public get focusPaddingLeft():number
		{
			return this._focusPaddingLeft;
		}

		/**
		 * @private
		 */
		public set focusPaddingLeft(value:number)
		{
			if(this._focusPaddingLeft == value)
			{
				return;
			}
			this._focusPaddingLeft = value;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * @private
		 */
		protected _hasFocus:boolean = false;

		/**
		 * @private
		 */
		protected _showFocus:boolean = false;

		/**
		 * @private
		 * Flag to indicate that the control is currently validating.
		 */
		protected _isValidating:boolean = false;

		/**
		 * @private
		 * Flag to indicate that the control has validated at least once.
		 */
		protected _hasValidated:boolean = false;

		/**
		 * Determines if the component has been initialized and validated for
		 * the first time.
		 *
		 * <p>In the following example, we check if the component is created or
		 * not, and we listen for an event if it isn't:</p>
		 *
		 * <listing version="3.0">
		 * if( !control.isCreated )
		 * {
		 *     control.addEventListener( FeathersEventType.CREATION_COMPLETE, creationCompleteHandler );
		 * }</listing>
		 *
		 * @see #event:creationComplete
		 * @see #isInitialized
		 */
		public get isCreated():boolean
		{
			return this._hasValidated;
		}

		/**
		 * @private
		 */
		protected _depth:number = -1;

		/**
		 * @copy feathers.core.IValidating#depth
		 */
		public get depth():number
		{
			return this._depth;
		}

		/**
		 * @private
		 */
		protected _invalidateCount:number = 0;

		/**
		 * @private
		 */
		/*override*/ public getBounds(targetSpace:DisplayObject, resultRect:Rectangle=null):Rectangle
		{
			if(!resultRect)
			{
				resultRect = new Rectangle();
			}

			var minX:number = Number.MAX_VALUE, maxX:number = -Number.MAX_VALUE;
			var minY:number = Number.MAX_VALUE, maxY:number = -Number.MAX_VALUE;

			if (targetSpace == this) // optimization
			{
				minX = 0;
				minY = 0;
				maxX = this.actualWidth;
				maxY = this.actualHeight;
			}
			else
			{
				this.getTransformationMatrix(targetSpace, FeathersControl.HELPER_MATRIX);

				MatrixUtil.transformCoords(FeathersControl.HELPER_MATRIX, 0, 0, FeathersControl.HELPER_POINT);
				minX = minX < FeathersControl.HELPER_POINT.x ? minX : FeathersControl.HELPER_POINT.x;
				maxX = maxX > FeathersControl.HELPER_POINT.x ? maxX : FeathersControl.HELPER_POINT.x;
				minY = minY < FeathersControl.HELPER_POINT.y ? minY : FeathersControl.HELPER_POINT.y;
				maxY = maxY > FeathersControl.HELPER_POINT.y ? maxY : FeathersControl.HELPER_POINT.y;

				MatrixUtil.transformCoords(FeathersControl.HELPER_MATRIX, 0, this.actualHeight, FeathersControl.HELPER_POINT);
				minX = minX < FeathersControl.HELPER_POINT.x ? minX : FeathersControl.HELPER_POINT.x;
				maxX = maxX > FeathersControl.HELPER_POINT.x ? maxX : FeathersControl.HELPER_POINT.x;
				minY = minY < FeathersControl.HELPER_POINT.y ? minY : FeathersControl.HELPER_POINT.y;
				maxY = maxY > FeathersControl.HELPER_POINT.y ? maxY : FeathersControl.HELPER_POINT.y;

				MatrixUtil.transformCoords(FeathersControl.HELPER_MATRIX, this.actualWidth, 0, FeathersControl.HELPER_POINT);
				minX = minX < FeathersControl.HELPER_POINT.x ? minX : FeathersControl.HELPER_POINT.x;
				maxX = maxX > FeathersControl.HELPER_POINT.x ? maxX : FeathersControl.HELPER_POINT.x;
				minY = minY < FeathersControl.HELPER_POINT.y ? minY : FeathersControl.HELPER_POINT.y;
				maxY = maxY > FeathersControl.HELPER_POINT.y ? maxY : FeathersControl.HELPER_POINT.y;

				MatrixUtil.transformCoords(FeathersControl.HELPER_MATRIX, this.actualWidth, this.actualHeight, FeathersControl.HELPER_POINT);
				minX = minX < FeathersControl.HELPER_POINT.x ? minX : FeathersControl.HELPER_POINT.x;
				maxX = maxX > FeathersControl.HELPER_POINT.x ? maxX : FeathersControl.HELPER_POINT.x;
				minY = minY < FeathersControl.HELPER_POINT.y ? minY : FeathersControl.HELPER_POINT.y;
				maxY = maxY > FeathersControl.HELPER_POINT.y ? maxY : FeathersControl.HELPER_POINT.y;
			}

			resultRect.x = minX;
			resultRect.y = minY;
			resultRect.width  = maxX - minX;
			resultRect.height = maxY - minY;

			return resultRect;
		}

		/**
		 * @private
		 */
		/*override*/ public hitTest(localPoint:Point, forTouch:boolean=false):DisplayObject
		{
			if(this._isQuickHitAreaEnabled)
			{
				if(forTouch && (!this.visible || !this.touchable))
				{
					return null;
				}
				var clipRect:Rectangle = this.clipRect;
				if(clipRect && !clipRect.containsPoint(localPoint))
				{
					return null;
				}
				return this._hitArea.containsPoint(localPoint) ? this : null;
			}
			return super.hitTest(localPoint, forTouch);
		}

		/**
		 * @private
		 */
		protected _isDisposed:boolean = false;

		/**
		 * @private
		 */
		/*override*/ public dispose():void
		{
			this._isDisposed = true;
			this._validationQueue = null;
			super.dispose();
		}

		/**
		 * Call this function to tell the UI control that a redraw is pending.
		 * The redraw will happen immediately before Starling renders the UI
		 * control to the screen. The validation system exists to ensure that
		 * multiple properties can be set together without redrawing multiple
		 * times in between each property change.
		 * 
		 * <p>If you cannot wait until later for the validation to happen, you
		 * can call <code>validate()</code> to redraw immediately. As an example,
		 * you might want to validate immediately if you need to access the
		 * correct <code>width</code> or <code>height</code> values of the UI
		 * control, since these values are calculated during validation.</p>
		 * 
		 * @see feathers.core.FeathersControl#validate()
		 */
		public invalidate(flag:string = FeathersControl.INVALIDATION_FLAG_ALL):void
		{
			var isAlreadyInvalid:boolean = this.isInvalid();
			var isAlreadyDelayedInvalid:boolean = false;
			if(this._isValidating)
			{
				for(var otherFlag:string in this._delayedInvalidationFlags)
				{
					isAlreadyDelayedInvalid = true;
					break;
				}
			}
			if(!flag || flag == FeathersControl.INVALIDATION_FLAG_ALL)
			{
				if(this._isValidating)
				{
					this._delayedInvalidationFlags[FeathersControl.INVALIDATION_FLAG_ALL] = true;
				}
				else
				{
					this._isAllInvalid = true;
				}
			}
			else
			{
				if(this._isValidating)
				{
					this._delayedInvalidationFlags[flag] = true;
				}
				else if(flag != FeathersControl.INVALIDATION_FLAG_ALL && !this._invalidationFlags.hasOwnProperty(flag))
				{
					this._invalidationFlags[flag] = true;
				}
			}
			if(!this._validationQueue || !this._isInitialized)
			{
				//we'll add this component to the queue later, after it has been
				//added to the stage.
				return;
			}
			if(this._isValidating)
			{
				if(isAlreadyDelayedInvalid)
				{
					return;
				}
				this._invalidateCount++;
				this._validationQueue.addControl(this, this._invalidateCount >= 10);
				return;
			}
			if(isAlreadyInvalid)
			{
				return;
			}
			this._invalidateCount = 0;
			this._validationQueue.addControl(this, false);
		}

		/**
		 * @copy feathers.core.IValidating#validate()
		 * 
		 * @see #invalidate()
		 */
		public validate():void
		{
			if(this._isDisposed)
			{
				//disposed components have no reason to validate, but they may
				//have been left in the queue.
				return;
			}
			if(!this._isInitialized)
			{
				this.initializeInternal();
			}
			if(!this.isInvalid())
			{
				return;
			}
			if(this._isValidating)
			{
				//we were already validating, and something else told us to
				//validate. that's bad...
				if(this._validationQueue)
				{
					//...so we'll just try to do it later
					this._validationQueue.addControl(this, true);
				}
				return;
			}
			this._isValidating = true;
			this.draw();
			for(var flag:string in this._invalidationFlags)
			{
				delete this._invalidationFlags[flag];
			}
			this._isAllInvalid = false;
			for(flag in this._delayedInvalidationFlags)
			{
				if(flag == FeathersControl.INVALIDATION_FLAG_ALL)
				{
					this._isAllInvalid = true;
				}
				else
				{
					this._invalidationFlags[flag] = true;
				}
				delete this._delayedInvalidationFlags[flag];
			}
			this._isValidating = false;
			if(!this._hasValidated)
			{
				this._hasValidated = true;
				this.dispatchEventWith(FeathersEventType.CREATION_COMPLETE);
			}
		}

		/**
		 * Indicates whether the control is pending validation or not. By
		 * default, returns <code>true</code> if any invalidation flag has been
		 * set. If you pass in a specific flag, returns <code>true</code> only
		 * if that flag has been set (others may be set too, but it checks the
		 * specific flag only. If all flags have been marked as invalid, always
		 * returns <code>true</code>.
		 */
		public isInvalid(flag:string = null):boolean
		{
			if(this._isAllInvalid)
			{
				return true;
			}
			if(!flag) //return true if any flag is set
			{
				for(flag in this._invalidationFlags)
				{
					return true;
				}
				return false;
			}
			return this._invalidationFlags[flag];
		}

		/**
		 * Sets both the width and the height of the control in a single
		 * function call.
		 *
		 * @see #width
		 * @see #height
		 */
		public setSize(width:number, height:number):void
		{
			this.explicitWidth = width;
			var widthIsNaN:boolean = width != width;
			if(widthIsNaN)
			{
				this.actualWidth = this.scaledActualWidth = 0;
			}
			this.explicitHeight = height;
			var heightIsNaN:boolean = height != height;
			if(heightIsNaN)
			{
				this.actualHeight = this.scaledActualHeight = 0;
			}

			if(widthIsNaN || heightIsNaN)
			{
				this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
			}
			else
			{
				this.setSizeInternal(width, height, true);
			}
		}

		/**
		 * Sets both the x and the y positions of the control in a single
		 * function call.
		 *
		 * @see #x
		 * @see #y
		 */
		public move(x:number, y:number):void
		{
			this.x = x;
			this.y = y;
		}

		/**
		 * @copy feathers.core.IFocusDisplayObject#showFocus()
		 *
		 * <p>The implementation of this method is provided for convenience, but
		 * it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 */
		public showFocus():void
		{
			if(!this._hasFocus || !this._focusIndicatorSkin)
			{
				return;
			}

			this._showFocus = true;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * @copy feathers.core.IFocusDisplayObject#hideFocus()
		 *
		 * <p>The implementation of this method is provided for convenience, but
		 * it cannot be used unless a subclass implements the
		 * <code>IFocusDisplayObject</code> interface.</p>
		 */
		public hideFocus():void
		{
			if(!this._hasFocus || !this._focusIndicatorSkin)
			{
				return;
			}

			this._showFocus = false;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * Sets the width and height of the control, with the option of
		 * invalidating or not. Intended to be used when the <code>width</code>
		 * and <code>height</code> values have not been set explicitly, and the
		 * UI control needs to measure itself and choose an "ideal" size.
		 */
		protected setSizeInternal(width:number, height:number, canInvalidate:boolean):boolean
		{
			if(this.explicitWidth === this.explicitWidth) //!isNaN
			{
				width = this.explicitWidth;
			}
			else
			{
				if(width < this._minWidth)
				{
					width = this._minWidth;
				}
				else if(width > this._maxWidth)
				{
					width = this._maxWidth;
				}
			}
			if(this.explicitHeight === this.explicitHeight) //!isNaN
			{
				height = this.explicitHeight;
			}
			else
			{
				if(height < this._minHeight)
				{
					height = this._minHeight;
				}
				else if(height > this._maxHeight)
				{
					height = this._maxHeight;
				}
			}
			if(width !== width) //isNaN
			{
				throw new ArgumentError(FeathersControl.ILLEGAL_WIDTH_ERROR);
			}
			if(height !== height) //isNaN
			{
				throw new ArgumentError(FeathersControl.ILLEGAL_HEIGHT_ERROR);
			}
			var resized:boolean = false;
			if(this.actualWidth != width)
			{
				this.actualWidth = width;
				this.refreshHitAreaX();
				resized = true;
			}
			if(this.actualHeight != height)
			{
				this.actualHeight = height;
				this.refreshHitAreaY();
				resized = true;
			}
			width = this.scaledActualWidth;
			height = this.scaledActualHeight;
			this.scaledActualWidth = this.actualWidth * Math.abs(this.scaleX);
			this.scaledActualHeight = this.actualHeight * Math.abs(this.scaleY);
			if(width != this.scaledActualWidth || height != this.scaledActualHeight)
			{
				resized = true;
			}
			if(resized)
			{
				if(canInvalidate)
				{
					this.invalidate(FeathersControl.INVALIDATION_FLAG_SIZE);
				}
				this.dispatchEventWith(FeathersEventType.RESIZE);
			}
			return resized;
		}

		/**
		 * Called the first time that the UI control is added to the stage, and
		 * you should override this function to customize the initialization
		 * process. Do things like create children and set up event listeners.
		 * After this function is called, <code>FeathersEventType.INITIALIZE</code>
		 * is dispatched.
		 *
		 * @see #event:initialize feathers.events.FeathersEventType.INITIALIZE
		 */
		protected initialize():void
		{

		}

		/**
		 * Override to customize layout and to adjust properties of children.
		 * Called when the component validates, if any flags have been marked
		 * to indicate that validation is pending.
		 */
		protected draw():void
		{

		}

		/**
		 * Sets an invalidation flag. This will not add the component to the
		 * validation queue. It only sets the flag. A subclass might use
		 * this function during <code>draw()</code> to manipulate the flags that
		 * its superclass sees.
		 */
		protected setInvalidationFlag(flag:string):void
		{
			if(this._invalidationFlags.hasOwnProperty(flag))
			{
				return;
			}
			this._invalidationFlags[flag] = true;
		}

		/**
		 * Clears an invalidation flag. This will not remove the component from
		 * the validation queue. It only clears the flag. A subclass might use
		 * this function during <code>draw()</code> to manipulate the flags that
		 * its superclass sees.
		 */
		protected clearInvalidationFlag(flag:string):void
		{
			delete this._invalidationFlags[flag];
		}

		/**
		 * Updates the focus indicator skin by showing or hiding it and
		 * adjusting its position and dimensions. This function is not called
		 * automatically. Components that support focus should call this
		 * function at an appropriate point within the <code>draw()</code>
		 * function. This function may be overridden if the default behavior is
		 * not desired.
		 */
		protected refreshFocusIndicator():void
		{
			if(this._focusIndicatorSkin)
			{
				if(this._hasFocus && this._showFocus)
				{
					if(this._focusIndicatorSkin.parent != this)
					{
						this.addChild(this._focusIndicatorSkin);
					}
					else
					{
						this.setChildIndex(this._focusIndicatorSkin, this.numChildren - 1);
					}
				}
				else if(this._focusIndicatorSkin.parent)
				{
					this._focusIndicatorSkin.removeFromParent(false);
				}
				this._focusIndicatorSkin.x = this._focusPaddingLeft;
				this._focusIndicatorSkin.y = this._focusPaddingTop;
				this._focusIndicatorSkin.width = this.actualWidth - this._focusPaddingLeft - this._focusPaddingRight;
				this._focusIndicatorSkin.height = this.actualHeight - this._focusPaddingTop - this._focusPaddingBottom;
			}
		}

		/**
		 * @private
		 */
		protected refreshHitAreaX():void
		{
			if(this.actualWidth < this._minTouchWidth)
			{
				this._hitArea.width = this._minTouchWidth;
			}
			else
			{
				this._hitArea.width = this.actualWidth;
			}
			var hitAreaX:number = (this.actualWidth - this._hitArea.width) / 2;
			if(hitAreaX !== hitAreaX) //isNaN
			{
				this._hitArea.x = 0;
			}
			else
			{
				this._hitArea.x = hitAreaX;
			}
		}

		/**
		 * @private
		 */
		protected refreshHitAreaY():void
		{
			if(this.actualHeight < this._minTouchHeight)
			{
				this._hitArea.height = this._minTouchHeight;
			}
			else
			{
				this._hitArea.height = this.actualHeight;
			}
			var hitAreaY:number = (this.actualHeight - this._hitArea.height) / 2;
			if(hitAreaY !== hitAreaY) //isNaN
			{
				this._hitArea.y = 0;
			}
			else
			{
				this._hitArea.y = hitAreaY;
			}
		}

		/**
		 * @private
		 */
		protected initializeInternal():void
		{
			if(this._isInitialized)
			{
				return;
			}
			this.initialize();
			this.invalidate(); //invalidate everything
			this._isInitialized = true;
			this.dispatchEventWith(FeathersEventType.INITIALIZE);

			if(this._styleProvider)
			{
				this._styleProvider.applyStyles(this);
			}
			this._styleNameList.addEventListener(Event.CHANGE, this.styleNameList_changeHandler);
		}

		/**
		 * Default event handler for <code>FeathersEventType.FOCUS_IN</code>
		 * that may be overridden in subclasses to perform additional actions
		 * when the component receives focus.
		 */
		protected focusInHandler(event:Event):void
		{
			this._hasFocus = true;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * Default event handler for <code>FeathersEventType.FOCUS_OUT</code>
		 * that may be overridden in subclasses to perform additional actions
		 * when the component loses focus.
		 */
		protected focusOutHandler(event:Event):void
		{
			this._hasFocus = false;
			this._showFocus = false;
			this.invalidate(FeathersControl.INVALIDATION_FLAG_FOCUS);
		}

		/**
		 * @private
		 */
		protected feathersControl_flattenHandler(event:Event):void
		{
			this.validate();
		}

		/**
		 * @private
		 * Initialize the control, if it hasn't been initialized yet. Then,
		 * invalidate. If already initialized, check if invalid and put back
		 * into queue.
		 */
		protected feathersControl_addedToStageHandler(event:Event):void
		{
			this._depth = getDisplayObjectDepthFromStage(this);
			this._validationQueue = this.ValidationQueue.forStarling(Starling.current);
			if(!this._isInitialized)
			{
				this.initializeInternal();
			}
			if(this.isInvalid())
			{
				this._invalidateCount = 0;
				//add to validation queue, if required
				this._validationQueue.addControl(this, false);
			}
		}

		/**
		 * @private
		 */
		protected feathersControl_removedFromStageHandler(event:Event):void
		{
			this._depth = -1;
			this._validationQueue = null;
		}

		/**
		 * @private
		 */
		protected layoutData_changeHandler(event:Event):void
		{
			this.dispatchEventWith(FeathersEventType.LAYOUT_DATA_CHANGE);
		}

		/**
		 * @private
		 */
		protected styleNameList_changeHandler(event:Event):void
		{
			if(!this._styleProvider)
			{
				return;
			}
			this._styleProvider.applyStyles(this);
		}
	}
}