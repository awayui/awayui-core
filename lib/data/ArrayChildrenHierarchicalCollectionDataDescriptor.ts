/*
Feathers
Copyright 2012-2015 Joshua Tynjala. All Rights Reserved.

This program is free software. You can redistribute and/or modify it in
accordance with the terms of the accompanying license agreement.
*/
module feathers.data
{
	/**
	 * A hierarchical data descriptor where children are defined as arrays in a
	 * property defined on each branch. The property name defaults to <code>"children"</code>,
	 * but it may be customized.
	 *
	 * <p>The basic structure of the data source takes the following form. The
	 * root must always be an Array.</p>
	 * <pre>
	 * [
	 *     {
	 *         text: "Branch 1",
	 *         children:
	 *         [
	 *             { text: "Child 1-1" },
	 *             { text: "Child 1-2" }
	 *         ]
	 *     },
	 *     {
	 *         text: "Branch 2",
	 *         children:
	 *         [
	 *             { text: "Child 2-1" },
	 *             { text: "Child 2-2" },
	 *             { text: "Child 2-3" }
	 *         ]
	 *     }
	 * ]</pre>
	 */
	export class ArrayChildrenHierarchicalCollectionDataDescriptor implements IHierarchicalCollectionDataDescriptor
	{
		/**
		 * Constructor.
		 */
		constructor()
		{
		}

		/**
		 * The field used to access the Array of a branch's children.
		 */
		public childrenField:string = "children";

		/**
		 * @inheritDoc
		 */
		public getLength(data:Object, rest:any[]):number
		{
			var branch:any[] = <Array>data ;
			var indexCount:number = rest.length;
			for(var i:number = 0; i < indexCount; i++)
			{
				var index:number = <int>rest[i] ;
				branch = <Array>branch[index][this.childrenField] ;
			}

			return branch.length;
		}

		/**
		 * @inheritDoc
		 */
		public getItemAt(data:Object, index:number, rest:any[]):Object
		{
			rest.unshift(index);
			var branch:any[] = <Array>data ;
			var indexCount:number = rest.length - 1;
			for(var i:number = 0; i < indexCount; i++)
			{
				index = <int>rest[i] ;
				branch = <Array>branch[index][this.childrenField] ;
			}
			var lastIndex:number = <int>rest[indexCount] ;
			return branch[lastIndex];
		}

		/**
		 * @inheritDoc
		 */
		public setItemAt(data:Object, item:Object, index:number, rest:any[]):void
		{
			rest.unshift(index);
			var branch:any[] = <Array>data ;
			var indexCount:number = rest.length - 1;
			for(var i:number = 0; i < indexCount; i++)
			{
				index = <int>rest[i] ;
				branch = <Array>branch[index][this.childrenField] ;
			}
			var lastIndex:number = rest[indexCount];
			branch[lastIndex] = item;
		}

		/**
		 * @inheritDoc
		 */
		public addItemAt(data:Object, item:Object, index:number, rest:any[]):void
		{
			rest.unshift(index);
			var branch:any[] = <Array>data ;
			var indexCount:number = rest.length - 1;
			for(var i:number = 0; i < indexCount; i++)
			{
				index = <int>rest[i] ;
				branch = <Array>branch[index][this.childrenField] ;
			}
			var lastIndex:number = rest[indexCount];
			branch.splice(lastIndex, 0, item);
		}

		/**
		 * @inheritDoc
		 */
		public removeItemAt(data:Object, index:number, rest:any[]):Object
		{
			rest.unshift(index);
			var branch:any[] = <Array>data ;
			var indexCount:number = rest.length - 1;
			for(var i:number = 0; i < indexCount; i++)
			{
				index = <int>rest[i] ;
				branch = <Array>branch[index][this.childrenField] ;
			}
			var lastIndex:number = rest[indexCount];
			var item:Object = branch[lastIndex];
			branch.splice(lastIndex, 1);
			return item;
		}

		/**
		 * @inheritDoc
		 */
		public removeAll(data:Object):void
		{
			var branch:any[] = <Array>data ;
			branch.length = 0;
		}

		/**
		 * @inheritDoc
		 */
		public getItemLocation(data:Object, item:Object, result:number[] = null, rest:any[]):number[]
		{
			if(!result)
			{
				result = new Array<number>();
			}
			else
			{
				result.length = 0;
			}
			var branch:any[] = <Array>data ;
			var restCount:number = rest.length;
			for(var i:number = 0; i < restCount; i++)
			{
				var index:number = <int>rest[i] ;
				result[i] = index;
				branch = <Array>branch[index][this.childrenField] ;
			}

			var isFound:boolean = this.findItemInBranch(branch, item, result);
			if(!isFound)
			{
				result.length = 0;
			}
			return result;
		}

		/**
		 * @inheritDoc
		 */
		public isBranch(node:Object):boolean
		{
			return node.hasOwnProperty(this.childrenField) && node[this.childrenField] instanceof Array;
		}

		/**
		 * @private
		 */
		protected findItemInBranch(branch:any[], item:Object, result:number[]):boolean
		{
			var index:number = branch.indexOf(item);
			if(index >= 0)
			{
				result.push(index);
				return true;
			}

			var branchLength:number = branch.length;
			for(var i:number = 0; i < branchLength; i++)
			{
				var branchItem:Object = branch[i];
				if(this.isBranch(branchItem))
				{
					result.push(i);
					var isFound:boolean = this.findItemInBranch(<Array>branchItem[this.childrenField] , item, result);
					if(isFound)
					{
						return true;
					}
					result.pop();
				}
			}
			return false;
		}
	}
}
