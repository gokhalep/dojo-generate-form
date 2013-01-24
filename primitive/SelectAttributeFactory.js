define([ "dojo/_base/array", //
"dojo/_base/lang",//
"dojo/_base/declare",//
"dojox/mvc/at",//
"dijit/form/Select",//
"../getStateful",//
"../meta"//
], function(array, lang, declare, at, Select, getStateful, meta) {

	return declare("app.SelectAttributeFactory", [], {

		handles : function(attribute) {
			var values = meta.getTypeAttribute(attribute,"values");	
			return !attribute.array && values != null &&values.length>0;
		},
		create : function(attribute, modelHandle) {
			var options = [];
			for ( var key in attribute.values) {
				var value = attribute.values[key];
				options.push({
					label : value,
					value : value
				});
			}
			options.push({
				label : "null",
				value : "null"
			})

			if (!modelHandle[attribute.code]) {
				modelHandle[attribute.code]=getStateful(null);
			}			
			
			

			var valueBinding = at(modelHandle[attribute.code], "value").transform({
				format : function(value) {
					return value == null ? "null" : value;
				},
				parse : function(value) {
					if (value == "null") {
						return null;
					} else {
						return value;
					}
				}
			});

			var select = new Select({
				"value" : valueBinding,
				options : options,
				style:"width:200px;"
			});
			if (false && options.length > 0) {
				modelHandle[attribute.code].set("value", options[0].value);
			}
			return select;

		}
	})
});