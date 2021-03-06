define([
    "dojo/_base/declare",
    "../converter/anyToTextConverter",
    "./TextareaAttributeFactory"
], function (declare, anyToTextConverter, TextareaAttributeFactory) {

    return declare("AnyTextAreaAttributeFactory", [TextareaAttributeFactory], {
        id: "anyTextArea",
        handles: function (attribute) {
            return attribute.type === "any";
        },
        getConverter: function (attribute, ctx) {
            if (attribute.converter) {
                return this.editorFactory.getConverter(attribute, ctx);
            } else {
                return anyToTextConverter;
            }

        }
    });

});
