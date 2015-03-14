/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.text
{
	/**
	 * Functions for navigating text inputs with the keyboard.
	 */
	export class TextInputNavigation
	{
		/**
		 * @private
		 */
		protected static IS_WORD:RegExp = /\w/;

		/**
		 * @private
		 */
		protected static IS_WHITESPACE:RegExp = /\s/;

		/**
		 * Finds the start index of the word that starts before the selection.
		 */
		public static findPreviousWordStartIndex(text:string, selectionStartIndex:number):number
		{
			if(selectionStartIndex <= 0)
			{
				return 0;
			}
			var nextCharIsWord:boolean = TextInputNavigation.IS_WORD.test(text.charAt(selectionStartIndex - 1));
			for(var i:number = selectionStartIndex - 2; i >= 0; i--)
			{
				var charIsWord:boolean = TextInputNavigation.IS_WORD.test(text.charAt(i));
				if(!charIsWord && nextCharIsWord)
				{
					return i + 1;
				}
				nextCharIsWord = charIsWord;
			}
			return 0;
		}

		/**
		 * Finds the start index of the next word that starts after the
		 * selection.
		 */
		public static findNextWordStartIndex(text:string, selectionEndIndex:number):number
		{
			var textLength:number = text.length;
			if(selectionEndIndex >= textLength - 1)
			{
				return textLength;
			}
			//the first character is a special case. any non-whitespace is
			//considered part of the word.
			var prevCharIsWord:boolean = !TextInputNavigation.IS_WHITESPACE.test(text.charAt(selectionEndIndex));
			for(var i:number = selectionEndIndex + 1; i < textLength; i++)
			{
				var charIsWord:boolean = TextInputNavigation.IS_WORD.test(text.charAt(i));
				if(charIsWord && !prevCharIsWord)
				{
					return i;
				}
				prevCharIsWord = charIsWord;
			}
			return textLength;
		}
	}
}
