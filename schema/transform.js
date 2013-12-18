define([    'dojo/_base/lang'], function (lang) {
// module:
//		gform/Meta

	var t = {};
	var removeFirstGroupFromAttributes = function (attributes) {
		var newArray = [];
		attributes.forEach(function (e) {
			if (e.code && !e.code.match(/(object|array|map)/)) {
				var newE = {};
				lang.mixin(newE, e);
				var newGroups = [];
				e.groups.forEach(function (group, idx) {
					if (idx > 0) {
						newGroups.push(group);
					}
				});
				newE.groups = newGroups;
				newArray.push(newE);
			}
		});
		return newArray;
	};
	var filterPrimitives = function (attributes) {
		var newArray = [];
		attributes.forEach(function (e) {
			if (e.code && !e.code.match(/(object|array|map)/)) {
				newArray.push(e);
			}
		});
		return newArray;
	};
	var removeCode = function (groups) {
		var newArray = [];
		groups.forEach(function (e) {
			var newE = {};
			lang.mixin(newE, e);
			var newAttributes = [];
			e.attributes.forEach(function (group, idx) {
				if (group.code !== "code") {
					newAttributes.push(group);
				}
			});
			newE.attributes = newAttributes;
			newArray.push(newE);
		});
		return newArray;
	};
	var removeCodeAndLabel = function (groups) {
		var newArray = [];
		groups.forEach(function (e) {
			var newE = {};
			lang.mixin(newE, e);
			var newAttributes = [];
			e.attributes.forEach(function (group, idx) {
				if (group.code !== "code" && group.code !== "label") {
					newAttributes.push(group);
				}
			});
			newE.attributes = newAttributes;
			newArray.push(newE);
		});
		return newArray;
	};
	t["./primitive-attributes.json"] = {url: "./attributes.json", execute: filterPrimitives};
	t["./attributes-nocode.json"] = {url: "./attributes.json", execute: removeFirstGroupFromAttributes};
	t["./group/groups-nocode.json"] = {url: "./group/groups.json", execute: removeCode};
	t["./group/groups-nocode-nolabel.json"] = {url: "./group/groups.json", execute: removeCodeAndLabel};
	return t;

});