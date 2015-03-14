/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.controls
{
	import FeathersControl = feathers.core.FeathersControl;
	import IFocusDisplayObject = feathers.core.IFocusDisplayObject;
	import ITextRenderer = feathers.core.ITextRenderer;
	import IToggle = feathers.core.IToggle;
	import PropertyProxy = feathers.core.PropertyProxy;
	import IStyleProvider = feathers.skins.IStyleProvider;
	import DeviceCapabilities = feathers.system.DeviceCapabilities;

	import Point = flash.geom.Point;
	import Rectangle = flash.geom.Rectangle;
	import Keyboard = flash.ui.Keyboard;

	import Transitions = starling.animation.Transitions;
	import Tween = starling.animation.Tween;
	import Starling = starling.core.Starling;
	import DisplayObject = starling.display.DisplayObject;
	import Event = starling.events.Event;
	import KeyboardEvent = starling.events.KeyboardEvent;
	import Touch = starling.events.Touch;
	import TouchEvent = starling.events.TouchEvent;
	import TouchPhase = starling.events.TouchPhase;
	import SystemUtil = starling.utils.SystemUtil;

	/**
	 * @copy feathers.core.IToggle#event:change
	 */
	/*[Event(name="change",type="starling.events.Event")]*/

	/**
	 * Similar to a light switch with on and off states. Generally considered an
	 * alternative to a check box.
	 *
	 * <p>The following example programmatically selects a toggle switch and
	 * listens for when the selection changes:</p>
	 *
	 * <listing version="3.0">
	 * var toggle:ToggleSwitch = new ToggleSwitch();
	 * toggle.isSelected = true;
	 * toggle.addEventListener( Event.CHANGE, toggle_changeHandler );
	 * this.addChild( toggle );</listing>
	 *
	 * @see ../../../help/toggle-switch.html How to use the Feathers ToggleSwitch component
	 * @see feathers.controls.Check
	 */
	export class ToggleSwitch extends FeathersControl implements IToggle, IFocusDisplayObject
	{
		/**
		 * @private
		 */
		private static HELPER_POINT:Point = new Point();

		/**
		 * @private
		 * The minimum physical distance (in inches) that a touch must move
		 * before the scroller starts scrolling.
		 */
		private static MINIMUM_DRAG_DISTANCE:number = 0.04;

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_THUMB_FACTORY:string = "thumbFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_ON_TRACK_FACTORY:string = "onTrackFactory";

		/**
		 * @private
		 */
		protected static INVALIDATION_FLAG_OFF_TRACK_FACTORY:string = "offTrackFactory";

		/**
		 * The ON and OFF labels will be aligned to the middle vertically,
		 * based on the full character height of the font.
		 *
		 * @see #labelAlign
		 */
		public static LABEL_ALIGN_MIDDLE:string = "middle";

		/**
		 * The ON and OFF labels will be aligned to the middle vertically,
		 * based on only the baseline value of the font.
		 *
		 * @see #labelAlign
		 */
		public static LABEL_ALIGN_BASELINE:string = "baseline";

		/**
		 * The toggle switch has only one track skin, stretching to fill the
		 * full length of switch. In this layout mode, the on track is
		 * displayed and fills the entire length of the toggle switch. The off
		 * track will not exist.
		 *
		 * @see #trackLayoutMode
		 */
		public static TRACK_LAYOUT_MODE_SINGLE:string = "single";

		/**
		 * The toggle switch has two tracks, stretching to fill each side of the
		 * scroll bar with the thumb in the middle. The tracks will be resized
		 * as the thumb moves. This layout mode is designed for toggle switches
		 * where the two sides of the track may be colored differently to better
		 * differentiate between the on state and the off state.
		 *
		 * <p>Since the width and height of the tracks will change, consider
		 * using a special display object such as a <code>Scale9Image</code>,
		 * <code>Scale3Image</code> or a <code>TiledImage</code> that is
		 * designed to be resized dynamically.</p>
		 *
		 * @see #trackLayoutMode
		 * @see feathers.display.Scale9Image
		 * @see feathers.display.Scale3Image
		 * @see feathers.display.TiledImage
		 */
		public static TRACK_LAYOUT_MODE_ON_OFF:string = "onOff";

		/**
		 * The default value added to the <code>styleNameList</code> of the off label.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_OFF_LABEL:string = "feathers-toggle-switch-off-label";

		/**
		 * DEPRECATED: Replaced by <code>ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_OFF_LABEL</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ToggleSwitch#DEFAULT_CHILD_STYLE_NAME_OFF_LABEL
		 */
		public static DEFAULT_CHILD_NAME_OFF_LABEL:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_OFF_LABEL;

		/**
		 * The default value added to the <code>styleNameList</code> of the on label.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_ON_LABEL:string = "feathers-toggle-switch-on-label";

		/**
		 * DEPRECATED: Replaced by <code>ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_ON_LABEL</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ToggleSwitch#DEFAULT_CHILD_STYLE_NAME_ON_LABEL
		 */
		public static DEFAULT_CHILD_NAME_ON_LABEL:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_ON_LABEL;

		/**
		 * The default value added to the <code>styleNameList</code> of the off track.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_OFF_TRACK:string = "feathers-toggle-switch-off-track";

		/**
		 * DEPRECATED: Replaced by <code>ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_OFF_TRACK</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ToggleSwitch#DEFAULT_CHILD_STYLE_NAME_OFF_TRACK
		 */
		public static DEFAULT_CHILD_NAME_OFF_TRACK:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_OFF_TRACK;

		/**
		 * The default value added to the <code>styleNameList</code> of the on track.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_ON_TRACK:string = "feathers-toggle-switch-on-track";

		/**
		 * DEPRECATED: Replaced by <code>ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_ON_TRACK</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ToggleSwitch#DEFAULT_CHILD_STYLE_NAME_ON_TRACK
		 */
		public static DEFAULT_CHILD_NAME_ON_TRACK:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_ON_TRACK;

		/**
		 * The default value added to the <code>styleNameList</code> of the thumb.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		public static DEFAULT_CHILD_STYLE_NAME_THUMB:string = "feathers-toggle-switch-thumb";

		/**
		 * DEPRECATED: Replaced by <code>ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_THUMB</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see ToggleSwitch#DEFAULT_CHILD_STYLE_NAME_THUMB
		 */
		public static DEFAULT_CHILD_NAME_THUMB:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_THUMB;

		/**
		 * The default <code>IStyleProvider</code> for all <code>ToggleSwitch</code>
		 * components.
		 *
		 * @default null
		 * @see feathers.core.FeathersControl#styleProvider
		 */
		public static globalStyleProvider:IStyleProvider;

		/**
		 * @private
		 */
		protected static defaultThumbFactory():Button
		{
			return new Button();
		}

		/**
		 * @private
		 */
		protected static defaultOnTrackFactory():Button
		{
			return new Button();
		}

		/**
		 * @private
		 */
		protected static defaultOffTrackFactory():Button
		{
			return new Button();
		}

		/**
		 * Constructor.
		 */
		constructor()
		{
			super();
			this.addEventListener(TouchEvent.TOUCH, this.toggleSwitch_touchHandler);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this.toggleSwitch_removedFromStageHandler);
		}

		/**
		 * The value added to the <code>styleNameList</code> of the off label
		 * text renderer. This variable is <code>protected</code> so that
		 * sub-classes can customize the on label text renderer style name in
		 * their constructors instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_ON_LABEL</code>.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected onLabelStyleName:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_ON_LABEL;

		/**
		 * DEPRECATED: Replaced by <code>onLabelStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #onLabelStyleName
		 */
		protected get onLabelName():string
		{
			return this.onLabelStyleName;
		}

		/**
		 * @private
		 */
		protected set onLabelName(value:string)
		{
			this.onLabelStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the off label
		 * text renderer. This variable is <code>protected</code> so that
		 * sub-classes can customize the off label text renderer style name in
		 * their constructors instead of using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_OFF_LABEL</code>.
		 *
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected offLabelStyleName:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_OFF_LABEL;

		/**
		 * DEPRECATED: Replaced by <code>offLabelStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #offLabelStyleName
		 */
		protected get offLabelName():string
		{
			return this.offLabelStyleName;
		}

		/**
		 * @private
		 */
		protected set offLabelName(value:string)
		{
			this.offLabelStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the on track.
		 * This variable is <code>protected</code> so that sub-classes can
		 * customize the on track style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_ON_TRACK</code>.
		 *
		 * <p>To customize the on track style name without subclassing, see
		 * <code>customOnTrackStyleName</code>.</p>
		 *
		 * @see #customOnTrackStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected onTrackStyleName:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_ON_TRACK;

		/**
		 * DEPRECATED: Replaced by <code>onTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #onTrackStyleName
		 */
		protected get onTrackName():string
		{
			return this.onTrackStyleName;
		}

		/**
		 * @private
		 */
		protected set onTrackName(value:string)
		{
			this.onTrackStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the off track.
		 * This variable is <code>protected</code> so that sub-classes can
		 * customize the off track style name in their constructors instead of
		 * using the default style name defined by
		 * <code>DEFAULT_CHILD_STYLE_NAME_OFF_TRACK</code>.
		 *
		 * <p>To customize the off track style name without subclassing, see
		 * <code>customOffTrackStyleName</code>.</p>
		 *
		 * @see #customOffTrackStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected offTrackStyleName:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_OFF_TRACK;

		/**
		 * DEPRECATED: Replaced by <code>offTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #offTrackStyleName
		 */
		protected get offTrackName():string
		{
			return this.offTrackStyleName;
		}

		/**
		 * @private
		 */
		protected set offTrackName(value:string)
		{
			this.offTrackStyleName = value;
		}

		/**
		 * The value added to the <code>styleNameList</code> of the thumb. This
		 * variable is <code>protected</code> so that sub-classes can customize
		 * the thumb style name in their constructors instead of using the
		 * default stylename defined by <code>DEFAULT_CHILD_STYLE_NAME_THUMB</code>.
		 *
		 * <p>To customize the thumb style name without subclassing, see
		 * <code>customThumbStyleName</code>.</p>
		 *
		 * @see #customThumbStyleName
		 * @see feathers.core.FeathersControl#styleNameList
		 */
		protected thumbStyleName:string = ToggleSwitch.DEFAULT_CHILD_STYLE_NAME_THUMB;

		/**
		 * DEPRECATED: Replaced by <code>tabStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #tabStyleName
		 */
		protected get thumbName():string
		{
			return this.thumbStyleName;
		}

		/**
		 * @private
		 */
		protected set thumbName(value:string)
		{
			this.thumbStyleName = value;
		}

		/**
		 * The thumb sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #thumbFactory
		 * @see #createThumb()
		 */
		protected thumb:Button;

		/**
		 * The "on" text renderer sub-component.
		 *
		 * @see #labelFactory
		 */
		protected onTextRenderer:ITextRenderer;

		/**
		 * The "off" text renderer sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #labelFactory
		 */
		protected offTextRenderer:ITextRenderer;

		/**
		 * The "on" track sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #onTrackFactory
		 * @see #createOnTrack()
		 */
		protected onTrack:Button;

		/**
		 * The "off" track sub-component.
		 *
		 * <p>For internal use in subclasses.</p>
		 *
		 * @see #offTrackFactory
		 * @see #createOffTrack()
		 */
		protected offTrack:Button;

		/**
		 * @private
		 */
		/*override*/ protected get defaultStyleProvider():IStyleProvider
		{
			return ToggleSwitch.globalStyleProvider;
		}

		/**
		 * @private
		 */
		protected _paddingRight:number = 0;

		/**
		 * The minimum space, in pixels, between the switch's right edge and the
		 * switch's content.
		 *
		 * <p>In the following example, the toggle switch's right padding is
		 * set to 20 pixels:</p>
		 *
		 * <listing version="3.0">
		 * toggle.paddingRight = 20;</listing>
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
		protected _paddingLeft:number = 0;

		/**
		 * The minimum space, in pixels, between the switch's left edge and the
		 * switch's content.
		 *
		 * <p>In the following example, the toggle switch's left padding is
		 * set to 20 pixels:</p>
		 * 
		 * <listing version="3.0">
		 * toggle.paddingLeft = 20;</listing>
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
		protected _showLabels:boolean = true;

		/**
		 * Determines if the labels should be drawn. The onTrackSkin and
		 * offTrackSkin backgrounds may include the text instead.
		 *
		 * <p>In the following example, the toggle switch's labels are hidden:</p>
		 *
		 * <listing version="3.0">
		 * toggle.showLabels = false;</listing>
		 *
		 * @default true
		 */
		public get showLabels():boolean
		{
			return this._showLabels;
		}

		/**
		 * @private
		 */
		public set showLabels(value:boolean)
		{
			if(this._showLabels == value)
			{
				return;
			}
			this._showLabels = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _showThumb:boolean = true;

		/**
		 * Determines if the thumb should be displayed. This stops interaction
		 * while still displaying the background.
		 *
		 * <p>In the following example, the toggle switch's thumb is hidden:</p>
		 *
		 * <listing version="3.0">
		 * toggle.showThumb = false;</listing>
		 *
		 * @default true
		 */
		public get showThumb():boolean
		{
			return this._showThumb;
		}

		/**
		 * @private
		 */
		public set showThumb(value:boolean)
		{
			if(this._showThumb == value)
			{
				return;
			}
			this._showThumb = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _trackLayoutMode:string = ToggleSwitch.TRACK_LAYOUT_MODE_SINGLE;

		/*[Inspectable(type="String",enumeration="single,onOff")]*/
		/**
		 * Determines how the on and off track skins are positioned and sized.
		 *
		 * <p>In the following example, the toggle switch's track layout mode is
		 * updated to use two tracks:</p>
		 *
		 * <listing version="3.0">
		 * toggle.trackLayoutMode = ToggleSwitch.TRACK_LAYOUT_MODE_ON_OFF;</listing>
		 *
		 * @default ToggleSwitch.TRACK_LAYOUT_MODE_SINGLE
		 *
		 * @see #TRACK_LAYOUT_MODE_SINGLE
		 * @see #TRACK_LAYOUT_MODE_ON_OFF
		 */
		public get trackLayoutMode():string
		{
			return this._trackLayoutMode;
		}

		/**
		 * @private
		 */
		public set trackLayoutMode(value:string)
		{
			if(this._trackLayoutMode == value)
			{
				return;
			}
			this._trackLayoutMode = value;
			this.invalidate(this.INVALIDATION_FLAG_LAYOUT);
		}

		/**
		 * @private
		 */
		protected _defaultLabelProperties:PropertyProxy;

		/**
		 * The default label properties are a set of key/value pairs to be
		 * passed down to the toggle switch's label text renderers, and it is
		 * used when no specific properties are defined for a specific label
		 * text renderer's current state. The label text renderers are <code>ITextRenderer</code>
		 * instances. The available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>labelFactory</code>. The most
		 * common implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>In the following example, the toggle switch's default label
		 * properties are updated (this example assumes that the label text
		 * renderers are of type <code>TextFieldTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * toggle.defaultLabelProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 * toggle.defaultLabelProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see #labelFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #onLabelProperties
		 * @see #offLabelProperties
		 * @see #disabledLabelProperties
		 */
		public get defaultLabelProperties():Object
		{
			if(!this._defaultLabelProperties)
			{
				this._defaultLabelProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._defaultLabelProperties;
		}

		/**
		 * @private
		 */
		public set defaultLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			if(this._defaultLabelProperties)
			{
				this._defaultLabelProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._defaultLabelProperties = PropertyProxy(value);
			if(this._defaultLabelProperties)
			{
				this._defaultLabelProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _disabledLabelProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the toggle switch's
		 * label text renderers when the toggle switch is disabled. The label
		 * text renderers are <code>ITextRenderer</code> instances. The
		 * available properties depend on which <code>ITextRenderer</code>
		 * implementation is returned by <code>labelFactory</code>. The most
		 * common implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>In the following example, the toggle switch's disabled label
		 * properties are updated (this example assumes that the label text
		 * renderers are of type <code>TextFieldTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * toggle.disabledLabelProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 * toggle.disabledLabelProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see #labelFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #defaultLabelProperties
		 */
		public get disabledLabelProperties():Object
		{
			if(!this._disabledLabelProperties)
			{
				this._disabledLabelProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._disabledLabelProperties;
		}

		/**
		 * @private
		 */
		public set disabledLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			if(this._disabledLabelProperties)
			{
				this._disabledLabelProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._disabledLabelProperties = PropertyProxy(value);
			if(this._disabledLabelProperties)
			{
				this._disabledLabelProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _onLabelProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the toggle switch's
		 * ON label text renderer. If <code>null</code>, then
		 * <code>defaultLabelProperties</code> is used instead. The label text
		 * renderers are <code>ITextRenderer</code> instances. The available
		 * properties depend on which <code>ITextRenderer</code> implementation
		 * is returned by <code>labelFactory</code>. The most common
		 * implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>In the following example, the toggle switch's on label properties
		 * are updated (this example assumes that the on label text renderer is a
		 * <code>TextFieldTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * toggle.onLabelProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 * toggle.onLabelProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see #labelFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #defaultLabelProperties
		 */
		public get onLabelProperties():Object
		{
			if(!this._onLabelProperties)
			{
				this._onLabelProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._onLabelProperties;
		}

		/**
		 * @private
		 */
		public set onLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			if(this._onLabelProperties)
			{
				this._onLabelProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._onLabelProperties = PropertyProxy(value);
			if(this._onLabelProperties)
			{
				this._onLabelProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _offLabelProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the toggle switch's
		 * OFF label text renderer. If <code>null</code>, then
		 * <code>defaultLabelProperties</code> is used instead. The label text
		 * renderers are <code>ITextRenderer</code> instances. The available
		 * properties depend on which <code>ITextRenderer</code> implementation
		 * is returned by <code>labelFactory</code>. The most common
		 * implementations are <code>BitmapFontTextRenderer</code> and
		 * <code>TextFieldTextRenderer</code>.
		 *
		 * <p>In the following example, the toggle switch's off label properties
		 * are updated (this example assumes that the off label text renderer is a
		 * <code>TextFieldTextRenderer</code>):</p>
		 *
		 * <listing version="3.0">
		 * toggle.offLabelProperties.textFormat = new TextFormat( "Source Sans Pro", 16, 0x333333 );
		 * toggle.offLabelProperties.embedFonts = true;</listing>
		 *
		 * @default null
		 *
		 * @see #labelFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.controls.text.BitmapFontTextRenderer
		 * @see feathers.controls.text.TextFieldTextRenderer
		 * @see #defaultLabelProperties
		 */
		public get offLabelProperties():Object
		{
			if(!this._offLabelProperties)
			{
				this._offLabelProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._offLabelProperties;
		}

		/**
		 * @private
		 */
		public set offLabelProperties(value:Object)
		{
			if(!(value instanceof PropertyProxy))
			{
				value = PropertyProxy.fromObject(value);
			}
			if(this._offLabelProperties)
			{
				this._offLabelProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._offLabelProperties = PropertyProxy(value);
			if(this._offLabelProperties)
			{
				this._offLabelProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _labelAlign:string = ToggleSwitch.LABEL_ALIGN_BASELINE;

		/*[Inspectable(type="String",enumeration="baseline,middle")]*/
		/**
		 * The vertical alignment of the label.
		 *
		 * <p>In the following example, the toggle switch's label alignment is
		 * updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.labelAlign = ToggleSwitch.LABEL_ALIGN_MIDDLE;</listing>
		 *
		 * @default ToggleSwitch.LABEL_ALIGN_BASELINE
		 *
		 * @see #LABEL_ALIGN_BASELINE
		 * @see #LABEL_ALIGN_MIDDLE
		 */
		public get labelAlign():string
		{
			return this._labelAlign;
		}

		/**
		 * @private
		 */
		public set labelAlign(value:string)
		{
			if(this._labelAlign == value)
			{
				return;
			}
			this._labelAlign = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _labelFactory:Function;

		/**
		 * A function used to instantiate the toggle switch's label text
		 * renderer sub-components, if specific factories for those label text
		 * renderers are not provided. The label text renderers must be
		 * instances of <code>ITextRenderer</code>. This factory can be used to
		 * change properties of the label text renderers when they are first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to style the label text
		 * renderers.
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>In the following example, the toggle switch uses a custom label
		 * factory:</p>
		 *
		 * <listing version="3.0">
		 * toggle.labelFactory = function():ITextRenderer
		 * {
		 *     return new TextFieldTextRenderer();
		 * }</listing>
		 *
		 * @default null
		 *
		 * @see #onLabelFactory
		 * @see #offLabelFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 */
		public get labelFactory():Function
		{
			return this._labelFactory;
		}

		/**
		 * @private
		 */
		public set labelFactory(value:Function)
		{
			if(this._labelFactory == value)
			{
				return;
			}
			this._labelFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}

		/**
		 * @private
		 */
		protected _onLabelFactory:Function;

		/**
		 * A function used to instantiate the toggle switch's on label text
		 * renderer sub-component. The on label text renderer must be an
		 * instance of <code>ITextRenderer</code>. This factory can be used to
		 * change properties of the on label text renderer when it is first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to style the on label
		 * text renderer.
		 *
		 * <p>If an <code>onLabelFactory</code> is not provided, the default
		 * <code>labelFactory</code> will be used.</p>
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>In the following example, the toggle switch uses a custom on label
		 * factory:</p>
		 *
		 * <listing version="3.0">
		 * toggle.onLabelFactory = function():ITextRenderer
		 * {
		 *     return new TextFieldTextRenderer();
		 * }</listing>
		 *
		 * @default null
		 *
		 * @see #labelFactory
		 * @see #offLabelFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 */
		public get onLabelFactory():Function
		{
			return this._onLabelFactory;
		}

		/**
		 * @private
		 */
		public set onLabelFactory(value:Function)
		{
			if(this._onLabelFactory == value)
			{
				return;
			}
			this._onLabelFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}

		/**
		 * @private
		 */
		protected _offLabelFactory:Function;

		/**
		 * A function used to instantiate the toggle switch's off label text
		 * renderer sub-component. The off label text renderer must be an
		 * instance of <code>ITextRenderer</code>. This factory can be used to
		 * change properties of the off label text renderer when it is first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use this factory to style the off label
		 * text renderer.
		 *
		 * <p>If an <code>offLabelFactory</code> is not provided, the default
		 * <code>labelFactory</code> will be used.</p>
		 *
		 * <p>The factory should have the following function signature:</p>
		 * <pre>function():ITextRenderer</pre>
		 *
		 * <p>In the following example, the toggle switch uses a custom on label
		 * factory:</p>
		 *
		 * <listing version="3.0">
		 * toggle.offLabelFactory = function():ITextRenderer
		 * {
		 *     return new TextFieldTextRenderer();
		 * }</listing>
		 *
		 * @default null
		 *
		 * @see #labelFactory
		 * @see #onLabelFactory
		 * @see feathers.core.ITextRenderer
		 * @see feathers.core.FeathersControl#defaultTextRendererFactory
		 */
		public get offLabelFactory():Function
		{
			return this._offLabelFactory;
		}

		/**
		 * @private
		 */
		public set offLabelFactory(value:Function)
		{
			if(this._offLabelFactory == value)
			{
				return;
			}
			this._offLabelFactory = value;
			this.invalidate(this.INVALIDATION_FLAG_TEXT_RENDERER);
		}

		/**
		 * @private
		 */
		protected onTrackSkinOriginalWidth:number = NaN;

		/**
		 * @private
		 */
		protected onTrackSkinOriginalHeight:number = NaN;

		/**
		 * @private
		 */
		protected offTrackSkinOriginalWidth:number = NaN;

		/**
		 * @private
		 */
		protected offTrackSkinOriginalHeight:number = NaN;

		/**
		 * @private
		 */
		protected _isSelected:boolean = false;

		/**
		 * Indicates if the toggle switch is selected (ON) or not (OFF).
		 *
		 * <p>In the following example, the toggle switch is selected:</p>
		 *
		 * <listing version="3.0">
		 * toggle.isSelected = true;</listing>
		 *
		 * @default false
		 *
		 * @see #setSelectionWithAnimation()
		 */
		public get isSelected():boolean
		{
			return this._isSelected;
		}

		/**
		 * @private
		 */
		public set isSelected(value:boolean)
		{
			this._animateSelectionChange = false;
			if(this._isSelected == value)
			{
				return;
			}
			this._isSelected = value;
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
			this.dispatchEventWith(Event.CHANGE);
		}

		/**
		 * @private
		 */
		protected _toggleThumbSelection:boolean = false;

		/**
		 * Determines if the <code>isSelected</code> property of the thumb
		 * is updated to match the <code>isSelected</code> property of the
		 * toggle switch, if the class used to create the thumb implements the
		 * <code>IToggle</code> interface. Useful for skinning to provide a
		 * different appearance for the thumb based on whether the toggle switch
		 * is selected or not.
		 *
		 * <p>In the following example, the thumb selection is toggled:</p>
		 *
		 * <listing version="3.0">
		 * toggle.toggleThumbSelection = true;</listing>
		 *
		 * @default false
		 *
		 * @see feathers.core.IToggle
		 * @see feathers.controls.ToggleButton
		 */
		public get toggleThumbSelection():boolean
		{
			return this._toggleThumbSelection;
		}

		/**
		 * @private
		 */
		public set toggleThumbSelection(value:boolean)
		{
			if(this._toggleThumbSelection == value)
			{
				return;
			}
			this._toggleThumbSelection = value;
			this.invalidate(this.INVALIDATION_FLAG_SELECTED);
		}

		/**
		 * @private
		 */
		protected _toggleDuration:number = 0.15;

		/**
		 * The duration, in seconds, of the animation when the toggle switch
		 * is toggled and animates the position of the thumb.
		 *
		 * <p>In the following example, the duration of the toggle switch thumb
		 * animation is updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.toggleDuration = 0.5;</listing>
		 *
		 * @default 0.15
		 */
		public get toggleDuration():number
		{
			return this._toggleDuration;
		}

		/**
		 * @private
		 */
		public set toggleDuration(value:number)
		{
			this._toggleDuration = value;
		}

		/**
		 * @private
		 */
		protected _toggleEase:Object = Transitions.EASE_OUT;

		/**
		 * The easing function used for toggle animations.
		 *
		 * <p>In the following example, the easing function used by the toggle
		 * switch's thumb animation is updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.toggleEase = Transitions.EASE_IN_OUT;</listing>
		 *
		 * @default starling.animation.Transitions.EASE_OUT
		 *
		 * @see http://doc.starling-framework.org/core/starling/animation/Transitions.html starling.animation.Transitions
		 */
		public get toggleEase():Object
		{
			return this._toggleEase;
		}

		/**
		 * @private
		 */
		public set toggleEase(value:Object)
		{
			this._toggleEase = value;
		}

		/**
		 * @private
		 */
		protected _onText:string = "ON";

		/**
		 * The text to display in the ON label.
		 *
		 * <p>In the following example, the toggle switch's on label text is
		 * updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.onText = "on";</listing>
		 *
		 * @default "ON"
		 */
		public get onText():string
		{
			return this._onText;
		}

		/**
		 * @private
		 */
		public set onText(value:string)
		{
			if(value === null)
			{
				value = "";
			}
			if(this._onText == value)
			{
				return;
			}
			this._onText = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _offText:string = "OFF";

		/**
		 * The text to display in the OFF label.
		 *
		 * <p>In the following example, the toggle switch's off label text is
		 * updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.offText = "off";</listing>
		 *
		 * @default "OFF"
		 */
		public get offText():string
		{
			return this._offText;
		}

		/**
		 * @private
		 */
		public set offText(value:string)
		{
			if(value === null)
			{
				value = "";
			}
			if(this._offText == value)
			{
				return;
			}
			this._offText = value;
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _toggleTween:Tween;

		/**
		 * @private
		 */
		protected _ignoreTapHandler:boolean = false;

		/**
		 * @private
		 */
		protected _touchPointID:number = -1;

		/**
		 * @private
		 */
		protected _thumbStartX:number;

		/**
		 * @private
		 */
		protected _touchStartX:number;

		/**
		 * @private
		 */
		protected _animateSelectionChange:boolean = false;

		/**
		 * @private
		 */
		protected _onTrackFactory:Function;

		/**
		 * A function used to generate the toggle switch's on track
		 * sub-component. The on track must be an instance of <code>Button</code>.
		 * This factory can be used to change properties on the on track when it
		 * is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the on track.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom on track factory is passed to
		 * the toggle switch:</p>
		 *
		 * <listing version="3.0">
		 * toggle.onTrackFactory = function():Button
		 * {
		 *     var onTrack:Button = new Button();
		 *     onTrack.defaultSkin = new Image( texture );
		 *     return onTrack;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #onTrackProperties
		 */
		public get onTrackFactory():Function
		{
			return this._onTrackFactory;
		}

		/**
		 * @private
		 */
		public set onTrackFactory(value:Function)
		{
			if(this._onTrackFactory == value)
			{
				return;
			}
			this._onTrackFactory = value;
			this.invalidate(ToggleSwitch.INVALIDATION_FLAG_ON_TRACK_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customOnTrackStyleName:string;

		/**
		 * A style name to add to the toggle switch's on track sub-component.
		 * Typically used by a theme to provide different styles to different
		 * toggle switches.
		 *
		 * <p>In the following example, a custom on track style name is passed to
		 * the toggle switch:</p>
		 *
		 * <listing version="3.0">
		 * toggle.customOnTrackStyleName = "my-custom-on-track";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-on-track", setCustomOnTrackStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_ON_TRACK
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #onTrackFactory
		 * @see #onTrackProperties
		 */
		public get customOnTrackStyleName():string
		{
			return this._customOnTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customOnTrackStyleName(value:string)
		{
			if(this._customOnTrackStyleName == value)
			{
				return;
			}
			this._customOnTrackStyleName = value;
			this.invalidate(ToggleSwitch.INVALIDATION_FLAG_ON_TRACK_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customOnTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customOnTrackStyleName
		 */
		public get customOnTrackName():string
		{
			return this.customOnTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customOnTrackName(value:string)
		{
			this.customOnTrackStyleName = value;
		}

		/**
		 * @private
		 */
		protected _onTrackProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the toggle switch's on
		 * track sub-component. The on track is a
		 * <code>feathers.controls.Button</code> instance.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>onTrackFactory</code> function
		 * instead of using <code>onTrackProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the toggle switch's on track properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.onTrackProperties.defaultSkin = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see feathers.controls.Button
		 * @see #onTrackFactory
		 */
		public get onTrackProperties():Object
		{
			if(!this._onTrackProperties)
			{
				this._onTrackProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._onTrackProperties;
		}

		/**
		 * @private
		 */
		public set onTrackProperties(value:Object)
		{
			if(this._onTrackProperties == value)
			{
				return;
			}
			if(!value)
			{
				value = new PropertyProxy();
			}
			if(!(value instanceof PropertyProxy))
			{
				var newValue:PropertyProxy = new PropertyProxy();
				for(var propertyName:string in value)
				{
					newValue[propertyName] = value[propertyName];
				}
				value = newValue;
			}
			if(this._onTrackProperties)
			{
				this._onTrackProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._onTrackProperties = PropertyProxy(value);
			if(this._onTrackProperties)
			{
				this._onTrackProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _offTrackFactory:Function;

		/**
		 * A function used to generate the toggle switch's off track
		 * sub-component. The off track must be an instance of <code>Button</code>.
		 * This factory can be used to change properties on the off track when it
		 * is first created. For instance, if you are skinning Feathers
		 * components without a theme, you might use this factory to set skins
		 * and other styles on the off track.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom off track factory is passed to
		 * the toggle switch:</p>
		 *
		 * <listing version="3.0">
		 * toggle.offTrackFactory = function():Button
		 * {
		 *     var offTrack:Button = new Button();
		 *     offTrack.defaultSkin = new Image( texture );
		 *     return offTrack;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see feathers.controls.Button
		 * @see #offTrackProperties
		 */
		public get offTrackFactory():Function
		{
			return this._offTrackFactory;
		}

		/**
		 * @private
		 */
		public set offTrackFactory(value:Function)
		{
			if(this._offTrackFactory == value)
			{
				return;
			}
			this._offTrackFactory = value;
			this.invalidate(ToggleSwitch.INVALIDATION_FLAG_OFF_TRACK_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customOffTrackStyleName:string;

		/**
		 * A style name to add to the toggle switch's off track sub-component.
		 * Typically used by a theme to provide different styles to different
		 * toggle switches.
		 *
		 * <p>In the following example, a custom off track style name is passed
		 * to the toggle switch:</p>
		 *
		 * <listing version="3.0">
		 * toggle.customOffTrackStyleName = "my-custom-off-track";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-off-track", setCustomOffTrackStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_OFF_TRACK
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #offTrackFactory
		 * @see #offTrackProperties
		 */
		public get customOffTrackStyleName():string
		{
			return this._customOffTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customOffTrackStyleName(value:string)
		{
			if(this._customOffTrackStyleName == value)
			{
				return;
			}
			this._customOffTrackStyleName = value;
			this.invalidate(ToggleSwitch.INVALIDATION_FLAG_OFF_TRACK_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customOffTrackStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customOffTrackStyleName
		 */
		public get customOffTrackName():string
		{
			return this.customOffTrackStyleName;
		}

		/**
		 * @private
		 */
		public set customOffTrackName(value:string)
		{
			this.customOffTrackStyleName = value;
		}

		/**
		 * @private
		 */
		protected _offTrackProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the toggle switch's off
		 * track sub-component. The off track is a
		 * <code>feathers.controls.Button</code> instance.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>offTrackFactory</code> function
		 * instead of using <code>offTrackProperties</code> will result in
		 * better performance.</p>
		 *
		 * <p>In the following example, the toggle switch's off track properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.offTrackProperties.defaultSkin = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see feathers.controls.Button
		 * @see #offTrackFactory
		 */
		public get offTrackProperties():Object
		{
			if(!this._offTrackProperties)
			{
				this._offTrackProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._offTrackProperties;
		}

		/**
		 * @private
		 */
		public set offTrackProperties(value:Object)
		{
			if(this._offTrackProperties == value)
			{
				return;
			}
			if(!value)
			{
				value = new PropertyProxy();
			}
			if(!(value instanceof PropertyProxy))
			{
				var newValue:PropertyProxy = new PropertyProxy();
				for(var propertyName:string in value)
				{
					newValue[propertyName] = value[propertyName];
				}
				value = newValue;
			}
			if(this._offTrackProperties)
			{
				this._offTrackProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._offTrackProperties = PropertyProxy(value);
			if(this._offTrackProperties)
			{
				this._offTrackProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected _thumbFactory:Function;

		/**
		 * A function used to generate the toggle switch's thumb sub-component.
		 * This can be used to change properties on the thumb when it is first
		 * created. For instance, if you are skinning Feathers components
		 * without a theme, you might use <code>thumbFactory</code> to set
		 * skins and text styles on the thumb.
		 *
		 * <p>The function should have the following signature:</p>
		 * <pre>function():Button</pre>
		 *
		 * <p>In the following example, a custom thumb factory is passed to the
		 * toggle switch:</p>
		 *
		 * <listing version="3.0">
		 * toggle.thumbFactory = function():Button
		 * {
		 *     var button:Button = new Button();
		 *     button.defaultSkin = new Image( texture );
		 *     return button;
		 * };</listing>
		 *
		 * @default null
		 *
		 * @see #thumbProperties
		 */
		public get thumbFactory():Function
		{
			return this._thumbFactory;
		}

		/**
		 * @private
		 */
		public set thumbFactory(value:Function)
		{
			if(this._thumbFactory == value)
			{
				return;
			}
			this._thumbFactory = value;
			this.invalidate(ToggleSwitch.INVALIDATION_FLAG_THUMB_FACTORY);
		}

		/**
		 * @private
		 */
		protected _customThumbStyleName:string;

		/**
		 * A style name to add to the toggle switch's thumb sub-component.
		 * Typically used by a theme to provide different styles to different
		 * toggle switches.
		 *
		 * <p>In the following example, a custom thumb style name is passed to
		 * the toggle switch:</p>
		 *
		 * <listing version="3.0">
		 * toggle.customThumbStyleName = "my-custom-thumb";</listing>
		 *
		 * <p>In your theme, you can target this sub-component style name to
		 * provide different styles than the default:</p>
		 *
		 * <listing version="3.0">
		 * getStyleProviderForClass( Button ).setFunctionForStyleName( "my-custom-thumb", setCustomThumbStyles );</listing>
		 *
		 * @default null
		 *
		 * @see #DEFAULT_CHILD_STYLE_NAME_THUMB
		 * @see feathers.core.FeathersControl#styleNameList
		 * @see #thumbFactory
		 * @see #thumbProperties
		 */
		public get customThumbStyleName():string
		{
			return this._customThumbStyleName;
		}

		/**
		 * @private
		 */
		public set customThumbStyleName(value:string)
		{
			if(this._customThumbStyleName == value)
			{
				return;
			}
			this._customThumbStyleName = value;
			this.invalidate(ToggleSwitch.INVALIDATION_FLAG_THUMB_FACTORY);
		}

		/**
		 * DEPRECATED: Replaced by <code>customThumbStyleName</code>.
		 *
		 * <p><strong>DEPRECATION WARNING:</strong> This property is deprecated
		 * starting with Feathers 2.1. It will be removed in a future version of
		 * Feathers according to the standard
		 * <a target="_top" href="../../../help/deprecation-policy.html">Feathers deprecation policy</a>.</p>
		 *
		 * @see #customThumbStyleName
		 */
		public get customThumbName():string
		{
			return this.customThumbStyleName;
		}

		/**
		 * @private
		 */
		public set customThumbName(value:string)
		{
			this.customThumbStyleName = value;
		}

		/**
		 * @private
		 */
		protected _thumbProperties:PropertyProxy;

		/**
		 * A set of key/value pairs to be passed down to the toggle switch's
		 * thumb sub-component. The thumb is a
		 * <code>feathers.controls.Button</code> instance.
		 *
		 * <p>If the subcomponent has its own subcomponents, their properties
		 * can be set too, using attribute <code>&#64;</code> notation. For example,
		 * to set the skin on the thumb which is in a <code>SimpleScrollBar</code>,
		 * which is in a <code>List</code>, you can use the following syntax:</p>
		 * <pre>list.verticalScrollBarProperties.&#64;thumbProperties.defaultSkin = new Image(texture);</pre>
		 *
		 * <p>Setting properties in a <code>thumbFactory</code> function instead
		 * of using <code>thumbProperties</code> will result in better
		 * performance.</p>
		 *
		 * <p>In the following example, the toggle switch's thumb properties
		 * are updated:</p>
		 *
		 * <listing version="3.0">
		 * toggle.thumbProperties.defaultSkin = new Image( texture );</listing>
		 *
		 * @default null
		 * 
		 * @see feathers.controls.Button
		 * @see #thumbFactory
		 */
		public get thumbProperties():Object
		{
			if(!this._thumbProperties)
			{
				this._thumbProperties = new PropertyProxy(this.childProperties_onChange);
			}
			return this._thumbProperties;
		}

		/**
		 * @private
		 */
		public set thumbProperties(value:Object)
		{
			if(this._thumbProperties == value)
			{
				return;
			}
			if(!value)
			{
				value = new PropertyProxy();
			}
			if(!(value instanceof PropertyProxy))
			{
				var newValue:PropertyProxy = new PropertyProxy();
				for(var propertyName:string in value)
				{
					newValue[propertyName] = value[propertyName];
				}
				value = newValue;
			}
			if(this._thumbProperties)
			{
				this._thumbProperties.removeOnChangeCallback(this.childProperties_onChange);
			}
			this._thumbProperties = PropertyProxy(value);
			if(this._thumbProperties)
			{
				this._thumbProperties.addOnChangeCallback(this.childProperties_onChange);
			}
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * Changes the <code>isSelected</code> property, but animates the thumb
		 * to the new position, as if the user tapped the toggle switch.
		 *
		 * @see #isSelected
		 */
		public setSelectionWithAnimation(isSelected:boolean):void
		{
			if(this._isSelected == isSelected)
			{
				return;
			}
			this.isSelected = isSelected;
			this._animateSelectionChange = true;
		}

		/**
		 * @private
		 */
		/*override*/ protected draw():void
		{
			var selectionInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SELECTED);
			var stylesInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STYLES);
			var sizeInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_SIZE);
			var stateInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_STATE);
			var focusInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_FOCUS);
			var layoutInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_LAYOUT);
			var textRendererInvalid:boolean = this.isInvalid(this.INVALIDATION_FLAG_TEXT_RENDERER);
			var thumbFactoryInvalid:boolean = this.isInvalid(ToggleSwitch.INVALIDATION_FLAG_THUMB_FACTORY);
			var onTrackFactoryInvalid:boolean = this.isInvalid(ToggleSwitch.INVALIDATION_FLAG_ON_TRACK_FACTORY);
			var offTrackFactoryInvalid:boolean = this.isInvalid(ToggleSwitch.INVALIDATION_FLAG_OFF_TRACK_FACTORY);

			if(thumbFactoryInvalid)
			{
				this.createThumb();
			}

			if(onTrackFactoryInvalid)
			{
				this.createOnTrack();
			}

			if(offTrackFactoryInvalid || layoutInvalid)
			{
				this.createOffTrack();
			}

			if(textRendererInvalid)
			{
				this.createLabels();
			}

			if(textRendererInvalid || stylesInvalid || stateInvalid)
			{
				this.refreshOnLabelStyles();
				this.refreshOffLabelStyles();
			}

			if(thumbFactoryInvalid || stylesInvalid)
			{
				this.refreshThumbStyles();
			}
			if(onTrackFactoryInvalid || stylesInvalid)
			{
				this.refreshOnTrackStyles();
			}
			if((offTrackFactoryInvalid || layoutInvalid || stylesInvalid) && this.offTrack)
			{
				this.refreshOffTrackStyles();
			}

			if(thumbFactoryInvalid || stateInvalid)
			{
				this.thumb.isEnabled = this._isEnabled;
			}
			if(onTrackFactoryInvalid || stateInvalid)
			{
				this.onTrack.isEnabled = this._isEnabled;
			}
			if((offTrackFactoryInvalid || layoutInvalid || stateInvalid) && this.offTrack)
			{
				this.offTrack.isEnabled = this._isEnabled;
			}
			if(textRendererInvalid || stateInvalid)
			{
				this.onTextRenderer.isEnabled = this._isEnabled;
				this.offTextRenderer.isEnabled = this._isEnabled;
			}

			sizeInvalid = this.autoSizeIfNeeded() || sizeInvalid;

			if(sizeInvalid || stylesInvalid || selectionInvalid)
			{
				this.updateSelection();
			}

			this.layoutChildren();

			if(sizeInvalid || focusInvalid)
			{
				this.refreshFocusIndicator();
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
			if(this.onTrackSkinOriginalWidth !== this.onTrackSkinOriginalWidth || //isNaN
				this.onTrackSkinOriginalHeight !== this.onTrackSkinOriginalHeight) //isNaN
			{
				this.onTrack.validate();
				this.onTrackSkinOriginalWidth = this.onTrack.width;
				this.onTrackSkinOriginalHeight = this.onTrack.height;
			}
			if(this.offTrack)
			{
				if(this.offTrackSkinOriginalWidth !== this.offTrackSkinOriginalWidth || //isNaN
					this.offTrackSkinOriginalHeight !== this.offTrackSkinOriginalHeight) //isNaN
				{
					this.offTrack.validate();
					this.offTrackSkinOriginalWidth = this.offTrack.width;
					this.offTrackSkinOriginalHeight = this.offTrack.height;
				}
			}

			var needsWidth:boolean = this.explicitWidth !== this.explicitWidth; //isNaN
			var needsHeight:boolean = this.explicitHeight !== this.explicitHeight; //isNaN
			if(!needsWidth && !needsHeight)
			{
				return false;
			}
			this.thumb.validate();
			var newWidth:number = this.explicitWidth;
			var newHeight:number = this.explicitHeight;
			if(needsWidth)
			{
				if(this.offTrack)
				{
					newWidth = Math.min(this.onTrackSkinOriginalWidth, this.offTrackSkinOriginalWidth) + this.thumb.width / 2;
				}
				else
				{
					newWidth = this.onTrackSkinOriginalWidth;
				}
			}
			if(needsHeight)
			{
				if(this.offTrack)
				{
					newHeight = Math.max(this.onTrackSkinOriginalHeight, this.offTrackSkinOriginalHeight);
				}
				else
				{
					newHeight = this.onTrackSkinOriginalHeight;
				}
			}
			return this.setSizeInternal(newWidth, newHeight, false);
		}

		/**
		 * Creates and adds the <code>thumb</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #thumb
		 * @see #thumbFactory
		 * @see #customThumbStyleName
		 */
		protected createThumb():void
		{
			if(this.thumb)
			{
				this.thumb.removeFromParent(true);
				this.thumb = null;
			}

			var factory:Function = this._thumbFactory != null ? this._thumbFactory : ToggleSwitch.defaultThumbFactory;
			var thumbStyleName:string = this._customThumbStyleName != null ? this._customThumbStyleName : this.thumbStyleName;
			this.thumb = this.Button(factory());
			this.thumb.styleNameList.add(thumbStyleName);
			this.thumb.keepDownStateOnRollOut = true;
			this.thumb.addEventListener(TouchEvent.TOUCH, this.thumb_touchHandler);
			this.addChild(this.thumb);
		}

		/**
		 * Creates and adds the <code>onTrack</code> sub-component and
		 * removes the old instance, if one exists.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #onTrack
		 * @see #onTrackFactory
		 * @see #customOnTrackStyleName
		 */
		protected createOnTrack():void
		{
			if(this.onTrack)
			{
				this.onTrack.removeFromParent(true);
				this.onTrack = null;
			}

			var factory:Function = this._onTrackFactory != null ? this._onTrackFactory : ToggleSwitch.defaultOnTrackFactory;
			var onTrackStyleName:string = this._customOnTrackStyleName != null ? this._customOnTrackStyleName : this.onTrackStyleName;
			this.onTrack = this.Button(factory());
			this.onTrack.styleNameList.add(onTrackStyleName);
			this.onTrack.keepDownStateOnRollOut = true;
			this.addChildAt(this.onTrack, 0);
		}

		/**
		 * Creates and adds the <code>offTrack</code> sub-component and
		 * removes the old instance, if one exists. If the off track is not
		 * needed, it will not be created.
		 *
		 * <p>Meant for internal use, and subclasses may override this function
		 * with a custom implementation.</p>
		 *
		 * @see #offTrack
		 * @see #offTrackFactory
		 * @see #customOffTrackStyleName
		 */
		protected createOffTrack():void
		{
			if(this._trackLayoutMode == ToggleSwitch.TRACK_LAYOUT_MODE_ON_OFF)
			{
				if(this.offTrack)
				{
					this.offTrack.removeFromParent(true);
					this.offTrack = null;
				}
				var factory:Function = this._offTrackFactory != null ? this._offTrackFactory : ToggleSwitch.defaultOffTrackFactory;
				var offTrackStyleName:string = this._customOffTrackStyleName != null ? this._customOffTrackStyleName : this.offTrackStyleName;
				this.offTrack = this.Button(factory());
				this.offTrack.styleNameList.add(offTrackStyleName);
				this.offTrack.keepDownStateOnRollOut = true;
				this.addChildAt(this.offTrack, 1);
			}
			else if(this.offTrack) //single
			{
				this.offTrack.removeFromParent(true);
				this.offTrack = null;
			}
		}

		/**
		 * @private
		 */
		protected createLabels():void
		{
			if(this.offTextRenderer)
			{
				this.removeChild(DisplayObject(this.offTextRenderer), true);
				this.offTextRenderer = null;
			}
			if(this.onTextRenderer)
			{
				this.removeChild(DisplayObject(this.onTextRenderer), true);
				this.onTextRenderer = null;
			}

			var index:number = this.getChildIndex(this.thumb);
			var offLabelFactory:Function = this._offLabelFactory;
			if(offLabelFactory == null)
			{
				offLabelFactory = this._labelFactory;
			}
			if(offLabelFactory == null)
			{
				offLabelFactory = FeathersControl.defaultTextRendererFactory;
			}
			this.offTextRenderer = ITextRenderer(offLabelFactory());
			this.offTextRenderer.styleNameList.add(this.offLabelName);
			this.offTextRenderer.clipRect = new Rectangle();
			this.addChildAt(DisplayObject(this.offTextRenderer), index);

			var onLabelFactory:Function = this._onLabelFactory;
			if(onLabelFactory == null)
			{
				onLabelFactory = this._labelFactory;
			}
			if(onLabelFactory == null)
			{
				onLabelFactory = FeathersControl.defaultTextRendererFactory;
			}
			this.onTextRenderer = ITextRenderer(onLabelFactory());
			this.onTextRenderer.styleNameList.add(this.onLabelName);
			this.onTextRenderer.clipRect = new Rectangle();
			this.addChildAt(DisplayObject(this.onTextRenderer), index);
		}

		/**
		 * @private
		 */
		protected layoutChildren():void
		{
			this.thumb.validate();
			this.thumb.y = (this.actualHeight - this.thumb.height) / 2;

			var maxLabelWidth:number = Math.max(0, this.actualWidth - this.thumb.width - this._paddingLeft - this._paddingRight);
			var totalLabelHeight:number = Math.max(this.onTextRenderer.height, this.offTextRenderer.height);
			var labelHeight:number;
			if(this._labelAlign == ToggleSwitch.LABEL_ALIGN_MIDDLE)
			{
				labelHeight = totalLabelHeight;
			}
			else //baseline
			{
				labelHeight = Math.max(this.onTextRenderer.baseline, this.offTextRenderer.baseline);
			}

			var clipRect:Rectangle = this.onTextRenderer.clipRect;
			clipRect.width = maxLabelWidth;
			clipRect.height = totalLabelHeight;
			this.onTextRenderer.clipRect = clipRect;

			this.onTextRenderer.y = (this.actualHeight - labelHeight) / 2;

			clipRect = this.offTextRenderer.clipRect;
			clipRect.width = maxLabelWidth;
			clipRect.height = totalLabelHeight;
			this.offTextRenderer.clipRect = clipRect;

			this.offTextRenderer.y = (this.actualHeight - labelHeight) / 2;

			this.layoutTracks();
		}

		/**
		 * @private
		 */
		protected layoutTracks():void
		{
			var maxLabelWidth:number = Math.max(0, this.actualWidth - this.thumb.width - this._paddingLeft - this._paddingRight);
			var thumbOffset:number = this.thumb.x - this._paddingLeft;

			var onScrollOffset:number = maxLabelWidth - thumbOffset - (maxLabelWidth - this.onTextRenderer.width) / 2;
			var currentClipRect:Rectangle = this.onTextRenderer.clipRect;
			currentClipRect.x = onScrollOffset
			this.onTextRenderer.clipRect = currentClipRect;
			this.onTextRenderer.x = this._paddingLeft - onScrollOffset;

			var offScrollOffset:number = -thumbOffset - (maxLabelWidth - this.offTextRenderer.width) / 2;
			currentClipRect = this.offTextRenderer.clipRect;
			currentClipRect.x = offScrollOffset
			this.offTextRenderer.clipRect = currentClipRect;
			this.offTextRenderer.x = this.actualWidth - this._paddingRight - maxLabelWidth - offScrollOffset;

			if(this._trackLayoutMode == ToggleSwitch.TRACK_LAYOUT_MODE_ON_OFF)
			{
				this.layoutTrackWithOnOff();
			}
			else
			{
				this.layoutTrackWithSingle();
			}
		}

		/**
		 * @private
		 */
		protected updateSelection():void
		{
			if(this.thumb instanceof IToggle)
			{
				var toggleThumb:IToggle = IToggle(this.thumb);
				if(this._toggleThumbSelection)
				{
					toggleThumb.isSelected = this._isSelected;
				}
				else
				{
					toggleThumb.isSelected = false;
				}
			}
			this.thumb.validate();

			var xPosition:number = this._paddingLeft;
			if(this._isSelected)
			{
				xPosition = this.actualWidth - this.thumb.width - this._paddingRight;
			}

			//stop the tween, no matter what
			if(this._toggleTween)
			{
				Starling.juggler.remove(this._toggleTween);
				this._toggleTween = null;
			}

			if(this._animateSelectionChange)
			{
				this._toggleTween = new Tween(this.thumb, this._toggleDuration, this._toggleEase);
				this._toggleTween.animate("x", xPosition);
				this._toggleTween.onUpdate = this.selectionTween_onUpdate;
				this._toggleTween.onComplete = this.selectionTween_onComplete;
				Starling.juggler.add(this._toggleTween);
			}
			else
			{
				this.thumb.x = xPosition;
			}
			this._animateSelectionChange = false;
		}

		/**
		 * @private
		 */
		protected refreshOnLabelStyles():void
		{
			//no need to style the label field if there's no text to display
			if(!this._showLabels || !this._showThumb)
			{
				this.onTextRenderer.visible = false;
				return;
			}

			var properties:PropertyProxy;
			if(!this._isEnabled)
			{
				properties = this._disabledLabelProperties;
			}
			if(!properties && this._onLabelProperties)
			{
				properties = this._onLabelProperties;
			}
			if(!properties)
			{
				properties = this._defaultLabelProperties;
			}

			this.onTextRenderer.text = this._onText;
			if(properties)
			{
				var displayRenderer:DisplayObject = DisplayObject(this.onTextRenderer);
				for(var propertyName:string in properties)
				{
					var propertyValue:Object = properties[propertyName];
					displayRenderer[propertyName] = propertyValue;
				}
			}
			this.onTextRenderer.validate();
			this.onTextRenderer.visible = true;
		}

		/**
		 * @private
		 */
		protected refreshOffLabelStyles():void
		{
			//no need to style the label field if there's no text to display
			if(!this._showLabels || !this._showThumb)
			{
				this.offTextRenderer.visible = false;
				return;
			}

			var properties:PropertyProxy;
			if(!this._isEnabled)
			{
				properties = this._disabledLabelProperties;
			}
			if(!properties && this._offLabelProperties)
			{
				properties = this._offLabelProperties;
			}
			if(!properties)
			{
				properties = this._defaultLabelProperties;
			}

			this.offTextRenderer.text = this._offText;
			if(properties)
			{
				var displayRenderer:DisplayObject = DisplayObject(this.offTextRenderer);
				for(var propertyName:string in properties)
				{
					var propertyValue:Object = properties[propertyName];
					displayRenderer[propertyName] = propertyValue;
				}
			}
			this.offTextRenderer.validate();
			this.offTextRenderer.visible = true;
		}

		/**
		 * @private
		 */
		protected refreshThumbStyles():void
		{
			for(var propertyName:string in this._thumbProperties)
			{
				var propertyValue:Object = this._thumbProperties[propertyName];
				this.thumb[propertyName] = propertyValue;
			}
			this.thumb.visible = this._showThumb;
		}

		/**
		 * @private
		 */
		protected refreshOnTrackStyles():void
		{
			for(var propertyName:string in this._onTrackProperties)
			{
				var propertyValue:Object = this._onTrackProperties[propertyName];
				this.onTrack[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected refreshOffTrackStyles():void
		{
			if(!this.offTrack)
			{
				return;
			}
			for(var propertyName:string in this._offTrackProperties)
			{
				var propertyValue:Object = this._offTrackProperties[propertyName];
				this.offTrack[propertyName] = propertyValue;
			}
		}

		/**
		 * @private
		 */
		protected layoutTrackWithOnOff():void
		{
			this.onTrack.x = 0;
			this.onTrack.y = 0;
			this.onTrack.width = this.thumb.x + this.thumb.width / 2;
			this.onTrack.height = this.actualHeight;

			this.offTrack.x = this.onTrack.width;
			this.offTrack.y = 0;
			this.offTrack.width = this.actualWidth - this.offTrack.x;
			this.offTrack.height = this.actualHeight;

			//final validation to avoid juggler next frame issues
			this.onTrack.validate();
			this.offTrack.validate();
		}

		/**
		 * @private
		 */
		protected layoutTrackWithSingle():void
		{
			this.onTrack.x = 0;
			this.onTrack.y = 0;
			this.onTrack.width = this.actualWidth;
			this.onTrack.height = this.actualHeight;

			//final validation to avoid juggler next frame issues
			this.onTrack.validate();
		}

		/**
		 * @private
		 */
		protected childProperties_onChange(proxy:PropertyProxy, name:Object):void
		{
			this.invalidate(this.INVALIDATION_FLAG_STYLES);
		}

		/**
		 * @private
		 */
		protected toggleSwitch_removedFromStageHandler(event:Event):void
		{
			this._touchPointID = -1;
		}

		/**
		 * @private
		 */
		/*override*/ protected focusInHandler(event:Event):void
		{
			super.focusInHandler(event);
			this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
			this.stage.addEventListener(KeyboardEvent.KEY_UP, this.stage_keyUpHandler);
		}

		/**
		 * @private
		 */
		/*override*/ protected focusOutHandler(event:Event):void
		{
			super.focusOutHandler(event);
			this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, this.stage_keyDownHandler);
			this.stage.removeEventListener(KeyboardEvent.KEY_UP, this.stage_keyUpHandler);
		}

		/**
		 * @private
		 */
		protected toggleSwitch_touchHandler(event:TouchEvent):void
		{
			if(this._ignoreTapHandler)
			{
				this._ignoreTapHandler = false;
				return;
			}
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}

			var touch:Touch = event.getTouch(this, TouchPhase.ENDED);
			if(!touch)
			{
				return;
			}
			this._touchPointID = -1;
			touch.getLocation(this.stage, ToggleSwitch.HELPER_POINT);
			var isInBounds:boolean = this.contains(this.stage.hitTest(ToggleSwitch.HELPER_POINT, true));
			if(isInBounds)
			{
				this.setSelectionWithAnimation(!this._isSelected);
			}
		}

		/**
		 * @private
		 */
		protected thumb_touchHandler(event:TouchEvent):void
		{
			if(!this._isEnabled)
			{
				this._touchPointID = -1;
				return;
			}

			if(this._touchPointID >= 0)
			{
				var touch:Touch = event.getTouch(this.thumb, null, this._touchPointID);
				if(!touch)
				{
					return;
				}
				touch.getLocation(this, ToggleSwitch.HELPER_POINT);
				var trackScrollableWidth:number = this.actualWidth - this._paddingLeft - this._paddingRight - this.thumb.width;
				if(touch.phase == TouchPhase.MOVED)
				{
					var xOffset:number = ToggleSwitch.HELPER_POINT.x - this._touchStartX;
					var xPosition:number = Math.min(Math.max(this._paddingLeft, this._thumbStartX + xOffset), this._paddingLeft + trackScrollableWidth);
					this.thumb.x = xPosition;
					this.layoutTracks();
				}
				else if(touch.phase == TouchPhase.ENDED)
				{
					var pixelsMoved:number = Math.abs(ToggleSwitch.HELPER_POINT.x - this._touchStartX);
					var inchesMoved:number = pixelsMoved / DeviceCapabilities.dpi;
					if(inchesMoved > ToggleSwitch.MINIMUM_DRAG_DISTANCE || (SystemUtil.isDesktop && pixelsMoved >= 1))
					{
						this._touchPointID = -1;
						this._ignoreTapHandler = true;
						this.setSelectionWithAnimation(this.thumb.x > (this._paddingLeft + trackScrollableWidth / 2));
						//we still need to invalidate, even if there's no change
						//because the thumb may be in the middle!
						this.invalidate(this.INVALIDATION_FLAG_SELECTED);
					}
				}
			}
			else
			{
				touch = event.getTouch(this.thumb, TouchPhase.BEGAN);
				if(!touch)
				{
					return;
				}
				touch.getLocation(this, ToggleSwitch.HELPER_POINT);
				this._touchPointID = touch.id;
				this._thumbStartX = this.thumb.x;
				this._touchStartX = ToggleSwitch.HELPER_POINT.x;
			}
		}

		/**
		 * @private
		 */
		protected stage_keyDownHandler(event:KeyboardEvent):void
		{
			if(event.keyCode == Keyboard.ESCAPE)
			{
				this._touchPointID = -1;
			}
			if(this._touchPointID >= 0 || event.keyCode != Keyboard.SPACE)
			{
				return;
			}
			this._touchPointID = int.MAX_VALUE;
		}

		/**
		 * @private
		 */
		protected stage_keyUpHandler(event:KeyboardEvent):void
		{
			if(this._touchPointID != int.MAX_VALUE || event.keyCode != Keyboard.SPACE)
			{
				return;
			}
			this._touchPointID = -1;
			this.setSelectionWithAnimation(!this._isSelected);
		}

		/**
		 * @private
		 */
		protected selectionTween_onUpdate():void
		{
			this.layoutTracks();
		}

		/**
		 * @private
		 */
		protected selectionTween_onComplete():void
		{
			this._toggleTween = null;
		}
	}
}