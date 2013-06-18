define([ "dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase",
		"dijit/_Container", "dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!../list_embedded/embedded_list_attribute.html", "../model/updateModelHandle",//
		"dojo/i18n!../nls/messages", "../layout/_LayoutMixin"
], function(lang, declare, _WidgetBase, _Container, _TemplatedMixin,
		_WidgetsInTemplateMixin, template, updateModelHandle, messages, _LayoutMixin) {

	return declare([ _WidgetBase, _Container,
			_TemplatedMixin, _WidgetsInTemplateMixin, _LayoutMixin ], {
		templateString : template,
		messages:messages,
		updateMethod: null,
		_addElement : function() {
			var newModelHandle = updateModelHandle.createMeta();
			var type=this.attribute.validTypes[0].code;
			var type_property=this.attribute.type_property;
			var newValue={};
			newValue[type_property]=type;

			updateModelHandle.cascadeAttribute(this.attribute,newValue,newModelHandle, this.editorFactory);

			this.target.value.push(newModelHandle);
			this.emit("state-changed");
			this.emit("value-changed");
		},
		postCreate : function() {
			this.addButton.set("onClick", lang.hitch(this, "_addElement"));
		}
	});

});