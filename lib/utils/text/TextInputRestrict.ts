/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.utils.text
{
	import Dictionary = flash.utils.Dictionary;

	/**
	 * Duplicates the functionality of the <code>restrict</code> property on
	 * <code>flash.text.TextField</code>.
	 *
	 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#restrict Full description of flash.text.TextField.restrict in Adobe's Flash Platform API Reference
	 */
	export class TextInputRestrict
	{
		/**
		 * @private
		 */
		protected static REQUIRES_ESCAPE:Dictionary = new Dictionary();
		REQUIRES_ESCAPE/*[/\[/g]*/ = "\\[";
		REQUIRES_ESCAPE/*[/\]*//g] = "\\]";
		REQUIRES_ESCAPE/*[/\{/g]*/ = "\\{";
		REQUIRES_ESCAPE/*[/\}/g]*/ = "\\}";
		REQUIRES_ESCAPE/*[/\(/g]*/ = "\\(";
		REQUIRES_ESCAPE/*[/\)/g]*/ = "\\)";
		REQUIRES_ESCAPE/*[/\|/g]*/ = "\\|";
		REQUIRES_ESCAPE/*[/\//g] = "\\/";
		REQUIRES_ESCAPE[/\./g]*/ = "\\.";
		REQUIRES_ESCAPE/*[/\+/g]*/ = "\\+";
		REQUIRES_ESCAPE/*[/\*/g]*/ = "\\*";
		REQUIRES_ESCAPE/*[/\?/g]*/ = "\\?";
		REQUIRES_ESCAPE/*[/\$/g]*/constructor(restrict:string = null)
		{
			this.restrict = restrict;
		}

		/**
		 * @private
		 */
		protected _restrictStartsWithExclude:boolean = false;

		/**
		 * @private
		 */
		protected _restricts:RegExp[]

		/**
		 * @private
		 */
		private _restrict:string;

		/**
		 * Indicates the set of characters that a user can input.
		 *
		 * <p>In the following example, the text is restricted to numbers:</p>
		 *
		 * <listing version="3.0">
		 * object.restrict = "0-9";</listing>
		 *
		 * @default null
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/text/TextField.html#restrict Full description of flash.text.TextField.restrict in Adobe's Flash Platform API Reference
		 */
		public get restrict():string
		{
			return this._restrict;
		}

		/**
		 * @private
		 */
		public set restrict(value:string)
		{
			if(this._restrict === value)
			{
				return;
			}
			this._restrict = value;
			if(value)
			{
				if(this._restricts)
				{
					this._restricts.length = 0;
				}
				else
				{
					this._restricts = new Array<RegExp>();
				}
				if(this._restrict === "")
				{
					this._restricts.push(/^$/);
				}
				else if(this._restrict)
				{
					var startIndex:number = 0;
					var isExcluding:boolean = value.indexOf("^") == 0;
					this._restrictStartsWithExclude = isExcluding;
					do
					{
						var nextStartIndex:number = value.indexOf("^", startIndex + 1);
						if(nextStartIndex >= 0)
						{
							var partialRestrict:string = value.substr(startIndex, nextStartIndex - startIndex);
							this._restricts.push(this.createRestrictRegExp(partialRestrict, isExcluding));
						}
						else
						{
							partialRestrict = value.substr(startIndex)
							this._restricts.push(this.createRestrictRegExp(partialRestrict, isExcluding));
							break;
						}
						startIndex = nextStartIndex;
						isExcluding = !isExcluding;
					}
					while(true)
				}
			}
			else
			{
				this._restricts = null;
			}
		}

		/**
		 * Accepts a character code and determines if it is allowed or not.
		 */
		public isCharacterAllowed(charCode:number):boolean
		{
			if(!this._restricts)
			{
				return true;
			}
			var character:string = String.fromCharCode(charCode);
			var isExcluding:boolean = this._restrictStartsWithExclude;
			var isIncluded:boolean = isExcluding;
			var restrictCount:number = this._restricts.length;
			for(var i:number = 0; i < restrictCount; i++)
			{
				var restrict:RegExp = this._restricts[i];
				if(isExcluding)
				{
					isIncluded = isIncluded && restrict.test(character);
				}
				else
				{
					isIncluded = isIncluded || restrict.test(character);
				}
				isExcluding = !isExcluding;
			}
			return isIncluded;
		}

		/**
		 * Accepts a string of characters and filters out characters that are
		 * not allowed.
		 */
		public filterText(value:string):string
		{
			if(!this._restricts)
			{
				return value;
			}
			var textLength:number = value.length;
			var restrictCount:number = this._restricts.length;
			for(var i:number = 0; i < textLength; i++)
			{
				var character:string = value.charAt(i);
				var isExcluding:boolean = this._restrictStartsWithExclude;
				var isIncluded:boolean = isExcluding;
				for(var j:number = 0; j < restrictCount; j++)
				{
					var restrict:RegExp = this._restricts[j];
					if(isExcluding)
					{
						isIncluded = isIncluded && restrict.test(character);
					}
					else
					{
						isIncluded = isIncluded || restrict.test(character);
					}
					isExcluding = !isExcluding;
				}
				if(!isIncluded)
				{
					value = value.substr(0, i) + value.substr(i + 1);
					i--;
					textLength--;
				}
			}
			return value;
		}

		/**
		 * @private
		 */
		protected createRestrictRegExp(restrict:string, isExcluding:boolean):RegExp
		{
			if(!isExcluding && restrict.indexOf("^") == 0)
			{
				//unlike regular expressions, which always treat ^ as excluding,
				//restrict uses ^ to swap between excluding and including.
				//if we're including, we need to remove ^ for the regexp
				restrict = restrict.substr(1);
			}
			//we need to do backslash first. otherwise, we'll get duplicates
			restrict = restrict.replace(/\\/g, "\\\\");
			for(var key:Object in TextInputRestrict.REQUIRES_ESCAPE)
			{
				var keyRegExp:RegExp = <RegExp>key ;
				var value:string = <String>TextInputRestrict.REQUIRES_ESCAPE[keyRegExp] ;
				restrict = restrict.replace(keyRegExp, value);
			}
			return new RegExp("[" + restrict + "]");
		}
	}
}
