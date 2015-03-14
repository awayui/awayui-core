/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.text
{
	import TextFormatAlign = flash.text.TextFormatAlign;

	import BitmapFont = starling.text.BitmapFont;
	import TextField = starling.text.TextField;

	/**
	 * Customizes a bitmap font for use by a <code>BitmapFontTextRenderer</code>.
	 * 
	 * @see feathers.controls.text.BitmapFontTextRenderer
	 */
	export class BitmapFontTextFormat
	{
		/**
		 * Constructor.
		 */
		constructor(font:Object, size:number = NaN, color:number = 0xffffff, align:string = TextFormatAlign.LEFT)
		{
			if(font instanceof String)
			{
				font = TextField.getBitmapFont(<String>font );
			}
			if(!(font instanceof BitmapFont))
			{
				throw new ArgumentError("BitmapFontTextFormat font must be a BitmapFont instance or a String representing the name of a registered bitmap font.");
			}
			this.font = BitmapFont(font);
			this.size = size;
			this.color = color;
			this.align = align;
		}

		/**
		 * The name of the font.
		 */
		public get fontName():string
		{
			return this.font ? this.font.name : null;
		}
		
		/**
		 * The BitmapFont instance to use.
		 */
		public font:BitmapFont;
		
		/**
		 * The color used to tint the bitmap font's texture when rendered.
		 * Tinting works like the "multiply" blend mode. In other words, the
		 * <code>color</code> property can only make the text render with a
		 * darker color. With that in mind, if the characters in the original
		 * texture are black, then you cannot change their color at all. To be
		 * able to render the text using any color, the characters in the
		 * original texture should be white.
		 *
		 * @default 0xffffff
		 *
		 * @see http://doc.starling-framework.org/core/starling/display/BlendMode.html#MULTIPLY starling.display.BlendMode.MULTIPLY
		 */
		public color:number;
		
		/**
		 * The size at which to display the bitmap font. Set to <code>NaN</code>
		 * to use the default size in the BitmapFont instance.
		 *
		 * @default NaN
		 */
		public size:number;
		
		/**
		 * The number of extra pixels between characters. May be positive or
		 * negative.
		 *
		 * @default 0
		 */
		public letterSpacing:number = 0;

		/*[Inspectable(type="String",enumeration="left,center,right")]*/
		/**
		 * Determines the alignment of the text, either left, center, or right.
		 *
		 * @default flash.text.TextFormatAlign.LEFT
		 */
		public align:string = TextFormatAlign.LEFT;
		
		/**
		 * Determines if the kerning values defined in the BitmapFont instance
		 * will be used for layout.
		 *
		 * @default true
		 */
		public isKerningEnabled:boolean = true;
	}
}