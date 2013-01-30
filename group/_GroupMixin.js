define([ "dojo/_base/array", //
"dojo/_base/lang",//
"dojo/_base/declare"//
], function(array, lang, declare) {
//the primitve value decorator needs to listen to modelHandle.valid and return that from getErrorCOunt
//the complex decoator ust listen to modelHandle.valid and also listen to children.valid-changed. getErrorCOunt must be reset o event and must be updated on getErrorCOunt 
//
	return declare("gform.group._GroupMixin", null, {
		isValidationContainer:true,
		validateChildren:true,
		postCreate : function() {
			this.inherited(arguments);
			this.errorCount=0;
			if (this.modelHandle) {
				this.modelHandle.watch("valid",lang.hitch(this,"onModelValidChanged"));
			}
			this.on("valid-changed",lang.hitch(this,"onValidChanged"));
		},
		onModelValidChanged: function(propName,old,nu) {
			if (old!=nu) {
				this._validateAndFire();
			}
		},
		onValidChanged: function(event) {
				if (event.source==this) {
					return;
				}
				event.stopPropagation();
				this._validateAndFire();
		},
		_validateAndFire: function(errorCount){
				//console.log("validating "+this.id);
				errorCount=this.validate();
				this.set("errorCount",errorCount);
				//console.log("found "+this.get("errorCount")+" in "+this.id);
				this.emit("valid-changed",{source:this});
		},
		_validateChildren: function(children,errorCount){
			if (!children) {
				return 0;
			}
			errorCount=0;
			array.forEach(children,function(child,ec) {
				if (child.isValidationContainer) {
					ec = child.get("errorCount");
					errorCount+=ec;
				  //console.log("found "+errorCount+" errors in child "+child.id+" of "+this.id);
				}else{
					errorCount+=this._validateChildren(child.getChildren());
				}
			},this);
			return errorCount;
		},
		validate : function(errorCount) {
			errorCount=0;	
			if (this.modelHandle && this.modelHandle.get("valid")==false) {
				errorCount++;	
			}
			if (this.validateChildren) {
				errorCount+= this._validateChildren(this.getChildren() || children);
			}
			return errorCount;
		}
	})
});
