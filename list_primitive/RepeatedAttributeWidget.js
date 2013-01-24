define([ "dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare",
		"dijit/_WidgetBase", "dijit/_Container", "dijit/_TemplatedMixin",
		"../AttributeFactoryFinder",//
		"dijit/_WidgetsInTemplateMixin","dojo/Stateful",
		"dojo/text!./repeated_attribute.html", "dijit/form/TextBox"//
], function(lang, array, declare, _WidgetBase, _Container, _TemplatedMixin, AttributeFactoryFinder,
		_WidgetsInTemplateMixin, Stateful,template, TextBox) {

	return declare("app.RepeatedAttributeWidget", [ _WidgetBase, _Container,
			_TemplatedMixin, _WidgetsInTemplateMixin ], {
	templateString : template,
		postCreate : function() {
			var attribute=this.get("meta");
			var panelModel = new dojo.Stateful();
			panelModel.set("title", "");
			//var me=this;
			var modelHandle = this.get("modelHandle");
			var editor;
			if (modelHandle.get(attribute.code)==null) {
				modelHandle.set(attribute.code,{value:null,valid:true});
			}

			var factory = this.editorFactory.attributeFactoryFinder.getFactory(attribute);
			editor = factory.create(attribute,this.modelHandle);
			
			this.addChild(editor);
			this.set("target", panelModel);

			this.deleteButton.set("onClick", lang.hitch(this, "_delete"));
		},
		_delete : function(e) {
			var index = this.indexAtStartup;
			if (index >= 0) {
				this.parent.children.splice(index, 1);
			}
		}
	});

});
