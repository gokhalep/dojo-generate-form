define([ "dojo/_base/array",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/_base/declare",
	"../model/MultiGroup",
	"dijit/layout/TabContainer"

], function (array, lang, aspect, declare, MultiGroup, TabContainer) {

	return declare([], {
		id: "tab",
		constructor: function (kwArgs) {
			lang.mixin(this, kwArgs);
		},
		createModel: function (meta, plainValue) {
			var groups = [];
			meta.groups.forEach(function (group) {
				groups.push(this.editorFactory.createGroupModel(group));
			}, this);
			var model = new MultiGroup({groups: groups, required: meta.required===true});
			model.update(plainValue);
			return model;
		},
		createAttribute: function (attribute, modelHandle) {
			var factory = this.editorFactory.attributeFactoryFinder
				.getFactory(attribute.editor);
			return factory.create(attribute, modelHandle);
		},
		create: function (group, modelHandle, ctx) {
			var doLayout = group.doLayout !== false;
			var tc = new TabContainer({
				doLayout: true, style: "height: 100%; width: 100%;"
			});
			for (var index = 0; index < group.groups.length; index++) {
				var tab = group.groups[index];
				if (!tab.groupType) {
					tab.groupType = "listpane";
				}
				var model = modelHandle.getModelByIndex(index);
				var tabWidget = this.editorFactory.create(tab, model, ctx);
				tabWidget.set("title", tab.label);
				tabWidget.set("meta", tab);
				tc.addChild(tabWidget);
				aspect.after(modelHandle.getModelByIndex(index), "onChange", lang.hitch(this, "onValidChanged", tabWidget, model, tab.label));
			}
			;
			tc.selectChild(tc.getChildren()[0]);
			return tc;
		},
		onValidChanged: function (tabWidget, model, label) {
			if (model.get("errorCount") > 0) {
				tabWidget.set("title", label + "<span class='errorTooltipNode'>" + model.get("errorCount") + "</span>");
			} else {
				tabWidget.set("title", label);
			}
		},
		getSchema: function () {
			var properties = {    "tabs": {"$ref": "groups"}}
			var example = {groupType: "tab", tabs: [
				{groupType: "listpane", label: "Tab 1", attributes: []},
				{groupType: "listpane", label: "Tab 2", attributes: []}
			]};
			//schema.example=dojo.toJson(example,true);
			var schema = {description: "The tabgroup displays an array of groups in a 'dijit.layout.TabContainer'."};
			schema.properties = properties;
			schema.required = ["tabs"];
			schema.example = dojo.toJson(example, true);
			return schema;
		}

	});
});
