define([
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/Stateful",
	"dojox/mvc/StatefulArray",
	"./getPlainValue",
	"./Resolver"
], function(array, lang, Stateful, StatefulArray, getPlainValue, Resolver){
// module:
//		gform/updateModelHandle
// summary:
//		this object offers functions to update a modelHandle with a new plainValue. 
//		The update is performed according to the gform schema and by cosulting the responsible AttributeFactories.

  var updateModelHandle= {
	// summary:
	//		this object offers a function to update a modelHandle. 
	//		Also it offers functions to update individual attributes of a modelHandle.

		getFromValidTypes: function(/*Array*/validTypes, /*String*/typeCode) {
			// summary:
			//		get the schema for a certain type from the array of types.
			// validTypes:
			//		the array of valid types. This is a required property of complex attributes.
			// typeCode:
			//		the code of one of the types in the array.
			// returns: Object
			//		returns the element of the validTypes array with the specified code 
			if (validTypes.length==1) {
				return validTypes[0];
			}
			var types=array.filter(validTypes,function(type) {
				if (type.code==typeCode) {
					return type;
				}
			});
			return types.length > 0 ? types[0] : null;
		},
		collectAttributes: function(/*Object*/groupOrType, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		creates an array of all attributes in the given group. In case of a tab group this function will find all attributes in all tabs. The function must delegate to the responsible GroupFactory's implementation.
			// groupOrType: 
			//		the group or type.
			// editorFactory:
			//		used to find the responsible GroupFactory.
			// returns: Array
			//		returns an array of attributes 
			if (groupOrType.attributes){
				return groupOrType.attributes; 
			}else{
				var groupFactory = editorFactory.getGroupFactory(groupOrType);
				if (groupFactory==null) {	
					return [];
				}else{
					return groupFactory.collectAttributes(groupOrType);
				}
			}
		},
		update: function(/*Object*/groupOrType, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		update the group with the given plainValue
			// groupOrType:
			//		the schema of the group.
			// plainValue:
			//		the new value of the modelHandle
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			var attributes = this.collectAttributes(groupOrType,editorFactory);
			if (plainValue==null) {
				modelHandle.set("value",null);
			}else{
				if (modelHandle.value==null ) {
					modelHandle.set("value",new Stateful({}));
				}
				array.forEach(attributes,function(attribute) {
					var childHandle = modelHandle.value[attribute.code];
					if (!childHandle) {
						childHandle=this.createMeta();
						modelHandle.value[attribute.code]=childHandle;
					}else {
						this.resetMeta(childHandle);
					}
					this.cascadeAttribute(attribute,plainValue[attribute.code], childHandle,editorFactory, new Resolver(modelHandle));
				},this);
			}
		},
		updateObject: function( meta, plainValue, modelHandle,editorFactory) {
			if (meta.validTypes.length>1 && !meta.type_property) {
				throw new Error("more than one type defined but no type property");
			}
			var type=meta.validTypes[0];
			if (!modelHandle.nonNullValue) {
				modelHandle.nonNullValue=this.createMeta();
				modelHandle.nonNullValue.value=new Stateful();
			}
			var initialValue= plainValue || {};
			this.update(type,initialValue,modelHandle.nonNullValue,editorFactory);
			if (plainValue==null) {
				modelHandle.set("value",null);
			}else{
				modelHandle.set("value",modelHandle.nonNullValue.value);
			}
			modelHandle.set("oldValue",getPlainValue(modelHandle.value));
		},
		updatePolyObject: function( meta, plainValue, modelHandle,editorFactory) {
			if (plainValue!=null) {
				var typeCode=plainValue[meta.type_property];
			}
			var typeToValue=modelHandle.typeToValue;
			if (!typeToValue) {
				modelHandle.typeToValue={};
				array.forEach(meta.validTypes,function(type) {
					var metaObject= this.createMeta();
					metaObject.value=new Stateful({});
					metaObject.value[meta.type_property]=this.createMeta();
					metaObject.value[meta.type_property].value=type.code;
					modelHandle.typeToValue[type.code]=metaObject;
					if (type.code==typeCode)  {
						this.update(type,plainValue,metaObject,editorFactory);
					}else{
						this.update(type,{},metaObject,editorFactory);
					}
				},this);
				typeToValue=modelHandle.typeToValue;
			}else{
				array.forEach(meta.validTypes,function(type) {
					var metaObject = typeToValue[type.code];
					if (type.code==typeCode)  {
						this.update(type,plainValue,metaObject,editorFactory);
					}else{
						this.update(type,{},metaObject,editorFactory);
					}
				},this);
			}
			if (plainValue==null) {
				if (meta.required) {
					modelHandle.set("value",modelHandle.typeToValue[meta.validTypes[0].code].value);
				} else {
					modelHandle.set("value",null);
				}	
			}else{
				if (meta.validTypes.length>1 && !meta.type_property) {
					throw new Error("more than one type defined but no type property");
				}
				var type=this.getFromValidTypes(meta.validTypes,typeCode);
				if (type==null) {
					throw new Error("type "+typeCode+" is invalid");
				}
				var value = typeToValue[typeCode].value;
				modelHandle.set("value",value);
			}
			modelHandle.set("oldValue",getPlainValue(modelHandle.value));
		},
		updateString: function(meta,plainValue, modelHandle,editorFactory) {
			if (!plainValue) {
				modelHandle.set("value","");
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateNullableString: function(meta,plainValue, modelHandle,editorFactory) {
			if (!plainValue) {
				modelHandle.set("value",null);
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateBoolean: function(meta,plainValue, modelHandle,editorFactory) {
			if (plainValue==null) {
				modelHandle.set("value",false);
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateNumber: function(meta,plainValue, modelHandle,editorFactory) {
			if (plainValue == null || typeof plainValue == "undefined") {
				modelHandle.set("value",null);
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateAny: function(meta,plainValue, modelHandle) {
			if (typeof plainValue=="undefined") {
				modelHandle.set("value",null);
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateMergedObject: function(meta,plainValue, modelHandle,editorFactory) {
			var combinedAttributes=modelHandle.tmp.combininedAttributes;
			if (!combinedAttributes) {
				combinedAttributes=this.mergeAttributeDefinitions(meta.validTypes);
				modelHandle.tmp.combinedAttributes=combinedAttributes;
			}
			if (!modelHandle.value) {
				modelHandle.set("value",new Stateful());
			}
			var typeCode=plainValue ? plainValue[meta.type_property] :null;
			if (!modelHandle.value[meta.type_property]) {
				modelHandle.value[meta.type_property]=this.createMeta();
			}else{
				this.resetMeta(modelHandle.value[meta.type_property]);
			}
			modelHandle.value[meta.type_property].set("value",typeCode);
			array.forEach(combinedAttributes, function(attribute) {
				if (!modelHandle.value[attribute.code]) {
					modelHandle.value[attribute.code]=this.createMeta();
				}
				var attributeModelHandle=modelHandle.value[attribute.code];
				this.cascadeAttribute(attribute,plainValue[attribute.code],attributeModelHandle,editorFactory, new Resolver(modelHandle));
				attributeModelHandle.ignore=true;
			}, this);
			if (typeCode!=null) {
				var type=this.getFromValidTypes(meta.validTypes,typeCode);
				array.forEach(type.attributes,function(attribute) {
					modelHandle.value[attribute.code].ignore=false;					
				},this);
			}
		
		},
		switchTypeInMergedObject: function(meta,typeCode,modelHandle) {
			modelHandle.value[meta.type_property].set("value",typeCode);
			var type=this.getFromValidTypes(meta.validTypes,typeCode);
			array.forEach(modelHandle.tmp.combinedAttributes,function(attribute) {
				modelHandle.value[attribute.code].ignore=true;					
			},this);
			array.forEach(type.attributes,function(attribute) {
				modelHandle.value[attribute.code].ignore=false;					
			},this);
		},
		mergeAttributeDefinitions: function(validTypes) {
			var combinedAttributes = [];
			var addedAttributes={};
			array.forEach(validTypes, function(type) {
				array.forEach(type.attributes, function(attribute) {
					if (!addedAttributes[attribute.code]) {
						attribute.types=[type.code];
						combinedAttributes.push(attribute);
						addedAttributes[attribute.code]=attribute;
					}else{
						addedAttributes[attribute.code].types.push(type.code);
					}
				}, this);
			}, this);
			return combinedAttributes;
		},
		updateArray: function(meta,plainValue, modelHandle,editorFactory,cascadeAttribute) {
			if (modelHandle.value==null) {
				modelHandle.set("value",new StatefulArray([]));
			}
			modelHandle.value.splice(0,modelHandle.value.length);
			if (plainValue==null) {
				modelHandle.set("oldValue",[]);
			}else	if (typeof plainValue== "undefined"	) {
				modelHandle.set("oldValue",[]);
			}else{
				var modelArray=modelHandle.value;
				var childMeta={};
				lang.mixin(childMeta,meta);
				childMeta.array=false;
				array.forEach(plainValue,function(element,i) {
					var model=modelArray[i];
					if (model==null) {
						model = this.createMeta();
					}else {
						this.resetMeta(model);
					}
					(cascadeAttribute || this.cascadeAttribute).apply(this,[childMeta,element,model,editorFactory, new Resolver(modelHandle)]);
					modelArray.push(model);
				},this);
				modelHandle.set("oldValue",plainValue);
			}
		},
		updateSelectModelHandle : function(meta, plainValue, modelHandle,options) {
			if (!plainValue && meta.required) {
				this.updateNullableString(meta, options[0].value,
						modelHandle);
			}else{
				this.updateNullableString(meta, plainValue,
					modelHandle);
			}
		},
		createMeta: function() {
			var meta= new Stateful({__type:"meta",state:"",message:null});
			meta.set("tmp",new Stateful());
			return meta;	
		},
		resetMeta: function(meta) {
			meta.set("tmp",new Stateful());
			meta.set("message",null);
			meta.set("state","");
			return meta;	
		},
		cascadeAttribute: function(meta,plainValue,modelHandle,editorFactory,resolver) {
			if (editorFactory) {
				var handle=editorFactory.getUpdateModelHandle(meta);
				if (handle && handle.updateModelHandle) {
					return handle.updateModelHandle(meta,plainValue,modelHandle,resolver);
				}
			}
			if (meta.array ) {
				this.updateArray(meta,plainValue,modelHandle);
			}else if (meta.validTypes && meta.validTypes.length==1) {
				this.updateObject(meta,plainValue,modelHandle);
			}else if (meta.validTypes && meta.validTypes.length>1) {
				this.updatePolyObject(meta,plainValue,modelHandle);
			}else if (meta.type=="string") {
				this.updateNullableString(meta,plainValue,modelHandle);
			}else if (meta.type=="date") {
				this.updateNullableString(meta,plainValue,modelHandle);
			}else if (meta.type=="number") {
				this.updateNumber(meta,plainValue,modelHandle);
			}else if (meta.type=="boolean") {
				this.updateBoolean(meta,plainValue,modelHandle);
			}else {
				this.updateAny(meta,plainValue,modelHandle);
			}
		}
	}
	

	return updateModelHandle;
});
