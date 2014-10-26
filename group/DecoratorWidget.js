define([ "dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_Container", "dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin", "dojo/text!./decorator.html",
	"dijit/Tooltip", "./_DecoratorMixin", "../layout/_LayoutMixin"
], function (declare, lang, _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, template, Tooltip, _DecoratorMixin, _LayoutMixin) {
// module:
//		gform/group/DecoratorWidget

	return declare("gform.group.DecoratorWidget", [ _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, _DecoratorMixin, _LayoutMixin ], {
		// summary:
		//		this widget container has a single child, which represents an attribute. This widget attaches provides the label and the state indicators for the attribute. 
		constructor: function (config) {
			lang.mixin(this, config);
			this.label = this.meta && (this.meta.label || this.meta.code) || "";
		},
		startup: function () {
			this.inherited(arguments);
			if (this.meta && this.meta.visible === false) {
				this.domNode.style.display = "none";
			}
		},
		templateString: template

	});

});
