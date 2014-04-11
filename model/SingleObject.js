define([
    "dojo/_base/declare",
    "./Model"
], function (declare, Model) {
    // module:
    //		gform/model/SingleObject

    return declare("gform.model.SingleObject", [Model], {
        // summary:
        //		Provides access to sibling attributes of modelHandle.
        attributes: null,
        isNull: true,
        subgroup: false,
        _attributesSetter: function (attributes) {
            this._changeAttrValue("attributes", attributes);
            for (var key in attributes) {
                attributes[key].set("parent", this);
                attributes[key].code = key;
            }
        },
        isEmpty: function () {
            return this.isNull;
        },
        watchPath: function (path, watcher) {
            // TODO only works for path being a simple attribute
            return this.getModel(path).watch(watcher);
        },
        update: function (/*Object*/plainValue, setOldValue, bubble) {
            // summary:
            //		update the attribute with the given plainValue. Attribute has a single valid type.
            // plainValue:
            //		the new value of the attribute
            if (this.required && plainValue === null) {
                plainValue = {};
            }
            this._execute(function () {
                // set to undefined so that hasChanged returns false
                //this.oldValue = undefined;
                this.updateGroup(plainValue, setOldValue);
                this.computeProperties();
                if (setOldValue !== false) {
                    this.set("oldValue", this.getPlainValue());
                }
            }, false);
            if (this.parent && bubble !== false) {
                this.parent.onChange();
            }
        },
        getValue: function (attributeCode) {
            if (this.isNull) {
                return null;
            } else {
                return this.attributes[attributeCode].getPlainValue();
            }
        },
        setValue: function (attributeCode, value) {
            if (!this.isNull) {
                this.getModel(attributeCode).update(value);
            }
        },
        getModel: function (attributeCode) {
            return this.attributes[attributeCode];
        },
        updateGroup: function (/*Object*/plainValue, setOldValue) {
            // summary:
            //		update the group with the given plainValue
            // groupOrType:
            //		the schema of the group.
            // plainValue:
            //		the new value of the modelHandle
            // modelHandle:
            //		the modelHandle bound to the Editor.
            // editorFactory:
            //		editorFactory provides access to AttributeFactory and GroupFactory which may override the
            // 		update behavior.

            var oldIsNull = this.isNull;
            if (plainValue === null || typeof plainValue === "undefined") {
                this.isNull = true;
            } else {
                this.isNull = false;
                for (var key in this.attributes) {
                    this.attributes[key].update(plainValue[key], setOldValue, this.bubble);
                }
            }
            if (this.isNull !== oldIsNull) {
                this._changeAttrValue("isNull", this.isNull);
            }
            this.onChange(true);
        },
        _isNullSetter: function (value) {
            if (value !== this.isNull) {
                if (value === true) {
                    this.updateGroup(null);
                } else {
                    this.updateGroup({});
                }
            }
        },
        getAttributeCodes: function () {
            var codes = [];
            for (var key in this.attributes) {
                codes.push(key);
            }
            return codes;
        },
        getAttribute: function (code) {
            return this.attributes[code];
        },
        getModelByKey: function (code) {
            return this.attributes[code];
        },
        getPlainValue: function () {
            if (this.isNull) {
                return null;
            } else {
                var plainValue = {};
                for (var key in this.attributes) {
                    plainValue[key] = this.attributes[key].getPlainValue();
                }
                return plainValue;
            }
        },
        getChildIndex: function (child) {
            var props = Object.keys(this.attributes).filter(function (key) {
                return this.attributes[key] === child;
            }, this);
            return props.length === 0 ? "" : props[0];
        },
        iterateChildren: function (cb) {
            if (!this.isNull) {
                for (var key in this.getAttributeCodes()) {
                    cb.call(this, this.getAttribute(this.getAttributeCodes()[key]));
                }
            }
        },
        visit: function (cb, parentIdx) {
            if (this.subgroup && typeof parentIdx === "undefined") {
                if (!this.isNull) {
                    for (var key in this.attributes) {
                        this.attributes[key].visit(cb, key);
                    }
                }
            } else {
                var me = this;
                cb(this, function () {
                    if (!me.isNull) {
                        for (var key in me.attributes) {
                            me.attributes[key].visit(cb, key);
                        }
                    }
                }, parentIdx);
            }
        },
        _getModelByPath: function (idx, path) {
            if (this.isNull) {
                return null;
            }
            var model = this.getModel(idx);
            if (!model) {
                return null;
            }
            return model.getModelByPath(path);
        }
    });
});
