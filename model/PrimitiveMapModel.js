define([
    "./_MapMixin",
    "dojo/_base/declare",//
    "./ArrayModel"//
], function (MapMixin, declare, ArrayModel) {
    // module:
    //		gform/model/SingleObject

    return declare("gform.model.PrimitiveMapModel",[ArrayModel, MapMixin], {
        valueProperty: "value",
        update: function (/*Object*/plainValue, setOldValue) {
            // summary:
            //		update the attribute with the given plainValue. Attribute has a single valid type.
            // plainValue:
            //		the new value of the attribute

            // set to undefined so that hasCHanged returns false
            this.oldValue = undefined;
            var arrayValue = [];
            for (var key in plainValue) {
                var element = {};
                element[this.valueProperty] = plainValue[key];
                element[this.keyProperty] = key;
                arrayValue.push(element);
            }
            this.inherited(arguments, [arrayValue, setOldValue]);
            if (this.setOldValue !== false) {
                this.set("oldValue", plainValue);
            }
        },
        getChildIndex: function (child) {
            return child.getPlainValue()[this.keyProperty];
        },
        getModelByKey: function (key) {
            var found = null;
            this.value.forEach(function (model) {
                if (model.getPlainValue()[this.keyProperty] == key) {
                    found = model;
                }
            }, this);
            return found;
        },
        getPlainValue: function () {
            var plainValue = {};
            this.value.forEach(function (model) {
                var value = model.getPlainValue();
                var key = value[this.keyProperty];
                plainValue[key] = value[this.valueProperty];
            }, this);
            return plainValue;
        },
        put: function (key, value) {
            var element = {};
            element[this.keyProperty] = key;
            element[this.valueProperty] = value;
            this.push(element);
        },
        _getModelByPathPath: function (path) {
            throw new Error("not implemented yet");
        }
    });
});
