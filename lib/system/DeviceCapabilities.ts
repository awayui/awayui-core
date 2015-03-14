/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.system
{
	import Stage = flash.display.Stage;
	import Capabilities = flash.system.Capabilities;

	/**
	 * Using values from the Stage and Capabilities classes, makes educated
	 * guesses about the physical size of the device this code is running on.
	 */
	export class DeviceCapabilities
	{
		/**
		 * The minimum physical size, in inches, of the device's larger side to
		 * be considered a tablet.
		 *
		 * @default 5
		 *
		 * @see #isTablet()
		 * @see #isPhone()
		 */
		public static tabletScreenMinimumInches:number = 5;

		/**
		 * A custom width, in pixels, to use for calculations of the device's
		 * physical screen size. Set to NaN to use the actual width.
		 *
		 * @default flash.display.Stage.fullScreenWidth
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display/Stage.html#fullScreenWidth Full description of flash.display.Stage.fullScreenWidth in Adobe's Flash Platform API Reference
		 */
		public static screenPixelWidth:number = NaN;

		/**
		 * A custom height, in pixels, to use for calculations of the device's
		 * physical screen size. Set to NaN to use the actual height.
		 *
		 * @default flash.display.Stage.fullScreenHeight
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display/Stage.html#fullScreenWidth Full description of flash.display.Stage.fullScreenWidth in Adobe's Flash Platform API Reference
		 */
		public static screenPixelHeight:number = NaN;
		
		/**
		 * The screen density to be used by Feathers. Defaults to the value of
		 * <code>flash.system.Capabilities.screenDPI</code>, but may be
		 * overridden. For example, if one wishes to demo a mobile app in a
		 * desktop browser, a custom screen density will override the real
		 * density of the desktop screen.
		 *
		 * <p><strong>Warning:</strong> You should avoid changing this value on
		 * a mobile device because it may result in unexpected side effects. In
		 * addition to being used to scale components in the example themes, the
		 * screen density is used by components such as <code>Scroller</code>
		 * (and its subclasses like <code>List</code> and
		 * <code>ScrollContainer</code>) to optimize the scrolling behavior.
		 * Reporting a different screen density may cause some components to
		 * appear poorly responsive (or overly sensitive) to touches.</p>
		 *
		 * @default flash.system.Capabilities.screenDPI
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/system/Capabilities.html#screenDPI Full description of flash.system.Capabilities.screenDPI in Adobe's Flash Platform API Reference
		 */
		public static dpi:number = Capabilities.screenDPI;

		/**
		 * Determines if this device is probably a tablet, based on the physical
		 * width and height, in inches, calculated using the full-screen
		 * dimensions and the screen density.
		 *
		 * @see #tabletScreenMinimumInches
		 * @see #screenPixelWidth
		 * @see #screenPixelHeight
		 * @see #isPhone()
		 */
		public static isTablet(stage:Stage):boolean
		{
			var screenWidth:number = DeviceCapabilities.screenPixelWidth;
			if(screenWidth !== screenWidth) //isNaN
			{
				screenWidth = stage.fullScreenWidth;
			}
			var screenHeight:number = DeviceCapabilities.screenPixelHeight;
			if(screenHeight !== screenHeight) //isNaN
			{
				screenHeight = stage.fullScreenHeight;
			}
			if(screenWidth < screenHeight)
			{
				screenWidth = screenHeight;
			}
			return (screenWidth / DeviceCapabilities.dpi) >= DeviceCapabilities.tabletScreenMinimumInches;
		}

		/**
		 * Determines if this device is probably a phone, based on the physical
		 * width and height, in inches, calculated using the full-screen
		 * dimensions and the screen density.
		 *
		 * @see #isTablet()
		 */
		public static isPhone(stage:Stage):boolean
		{
			return !DeviceCapabilities.isTablet(stage);
		}

		/**
		 * The physical width of the device, in inches. Calculated using the
		 * full-screen width and the screen density.
		 *
		 * @see #screenPixelWidth
		 */
		public static screenInchesX(stage:Stage):number
		{
			var screenWidth:number = DeviceCapabilities.screenPixelWidth;
			if(screenWidth !== screenWidth) //isNaN
			{
				screenWidth = stage.fullScreenWidth;
			}
			return screenWidth / DeviceCapabilities.dpi;
		}

		/**
		 * The physical height of the device, in inches. Calculated using the
		 * full-screen height and the screen density.
		 *
		 * @see #screenPixelHeight
		 */
		public static screenInchesY(stage:Stage):number
		{
			var screenHeight:number = DeviceCapabilities.screenPixelHeight;
			if(screenHeight !== screenHeight) //isNaN
			{
				screenHeight = stage.fullScreenHeight;
			}
			return screenHeight / DeviceCapabilities.dpi;
		}
	}
}
