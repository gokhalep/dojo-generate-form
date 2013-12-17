define([
	"../model/SingleObject",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/_base/declare",
	"../model/ArrayModel",
	"../widget/MvcDndSource",
	"./EmbeddedListWidget",
	"./TableWidgetList",
	"./RepeatedEmbeddedWidget",
	"./TableHeader",
	"./TableElementHeader"
], function (SingleObject, array, lang, aspect, declare, ArrayModel, MvcDndSource, EmbeddedListWidget, TableWidgetList, RepeatedEmbeddedWidget, TableHeader, TableElementHeader) {

	return declare([], {
		id: "table",
		constructor: function (kwArgs) {
			lang.mixin(this, kwArgs);
		},
		handles: function (attribute) {
			return attribute != null && attribute.type === "array" && attribute.attributes;
		},

		create: function (attribute, modelHandle) {

			if (modelHandle.value == null) {
				throw new Error("modelHandle.value should be initialized here");
			}

			var select = new EmbeddedListWidget({
				target: modelHandle,
				attribute: attribute,
				editorFactory: this.editorFactory
			});


			var tableHeader = new TableHeader();

			var attributes = attribute.attributes;


			array.forEach(attributes, function (attribute) {
				tableHeader.addChild(new TableElementHeader({label: attribute.label || attribute.code, description: attribute.description}));
			}, this);
			select.addChild(tableHeader);

			var widgetList = new TableWidgetList();
			widgetList.set("partialRebuild", true);
			widgetList.set("children", modelHandle.value);
			widgetList.set("childClz", RepeatedEmbeddedWidget);
			widgetList.set("childParams", {
				meta: attribute,
				combinedAttributes: attributes,
				_relTargetProp: "modelHandle",
				editorFactory: this.editorFactory
			});
			select.addChild(widgetList);

			if (attribute.reorderable !== false) {
				var copy = function (original) {
					var value = original.getPlainValue();
					return modelHandle.elementFactory(value);
				};
				aspect.after(widgetList, "startup", function () {
					new MvcDndSource(widgetList.domNode,
						{copyFn: copy, copyOnly: false, singular: true, withHandles: true});
				});
			}


			return select;

		},
		createModel: function (meta, value) {
			var me = this;
			var model = new ArrayModel();
			model.elementFactory = function (element) {
				var aModels = {};
				meta.attributes.forEach(function (attribute) {
					aModels[attribute.code] = me.editorFactory.createAttributeModel(attribute);
				});
				var elModel = new SingleObject({attributes: aModels});
				elModel.update(element);
				return elModel;
			};
			model.update(value);
			return model;

		}
	});
});