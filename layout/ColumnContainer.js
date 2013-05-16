define([ "dojo/_base/array", "dojo/aspect", "dojo/_base/lang", "dojo/_base/declare",
		 "dijit/layout/_LayoutWidget", "dijit/layout/utils", "dojo/dom-style","dojo/dom-geometry",
		"dojo/dom-construct", "dojo/dom-class", "../group/_GroupMixin" ], function(array, aspect,  lang,
		declare,  _LayoutWidget, layoutUtils, domStyle, domGeometry, domConstruct, domClass, _GroupMixin) {

	return declare("gform.layout.ColumnContainer", [_LayoutWidget, _GroupMixin], {
		baseClass : "gformColumnContainer",
		buildRendering: function() {
			this.inherited(arguments);
			if (this.meta.description) {
				var description = document.createElement("p");
				description.innerHTML=this.meta.description;
				domClass.add(description, "columnContainerDescription");
				this.domNode.appendChild(description);				
			}
			var canvas = document.createElement("div");
			domClass.add(canvas, "gformColumnCanvas");
			this.domNode.appendChild(canvas);
			domClass.add(canvas, "clearfix");
			this.containerNode=canvas;
		},
		layout: function() {
			var oldColumnCount=this.columnCount;
			var childCount=this._getChildCount();
			if (!this.maxChildWidth) {
				var width = this._getMaxChildWidth();
				if (width>0) {
					this.maxChildWidth = width+10;
					console.log("maxChildWidth "+width+" width :"+this._contentBox.w);
				}
			}
			this.columnCount=Math.floor(this._contentBox.w/this.maxChildWidth); 
			if (isNaN(this.columnCount)) {
				this.columnCount=1;
			}
			if (this.columnCount>5) {
				this.columnCount=5;
			}
			this.columnWidth=	Math.floor(this._contentBox.w/this.columnCount);
			var oldClass=this.currentClass;
			var currentClass=this.createColumnClass(this.columnCount);
			if (oldColumnCount) {
				domClass.replace(this.containerNode,currentClass,this.createColumnClass(oldColumnCount));
			} else {
				domClass.add(this.containerNode,currentClass);
			}
			array.forEach(this.getChildren(), function(child) {
				if (child.resize) {
					child.resize()
				}
			});

			
						
		},
		createColumnClass: function(columnCount) {
			return "columns_"+columnCount;
		},
		_getChildCount: function() {
			return this.getChildren().length;
		},
		addChild: function(child) {
			this.inherited(arguments);
			// we need to add a br, because the child maybe "inline-block", to make its size computable.
			var br = document.createElement("br");
			this.containerNode.appendChild(br);
		},	
		_getMaxChildWidth: function() {
			var maxChildWidth=0;
			array.forEach(this.getChildren(),function(child) {
				var mb = domGeometry.getMarginBox(child.domNode);
				if (mb.w>maxChildWidth) {
					maxChildWidth=mb.w;
				}
			}, this);
			//console.debug("maxChildWidth "+maxChildWidth);
			return maxChildWidth;
		}	
	});
	
});
