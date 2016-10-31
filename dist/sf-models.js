(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

window.SFModels = require("./sf-models");
},{"./sf-models":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _salesforceSchemaReader = require('salesforce-schema-reader');

var _salesforceSchemaReader2 = _interopRequireDefault(_salesforceSchemaReader);

var SF;
var SFModels = SF = {
	Ember: window && window.Ember ? window.Ember : undefined,
	DS: undefined,
	sforce: window && window.sforce ? window.sforce : undefined,
	SchemaReader: _salesforceSchemaReader2['default'],
	// Constants and methods for salesforce custom entity ending handling and conversions
	_sfRelExt: '__r',
	_sfNameExt: '__c',
	_emRelExt: 'rrr',
	_emNameExt: 'ccc',
	endsWith: function endsWith(str, ending) {
		return str.indexOf(ending, str.length - ending.length) > -1;
	},
	hasCustomSfRelationExtension: function hasCustomSfRelationExtension(name) {
		return SF.endsWith(name, SF._sfRelExt);
	},
	hasCustomSfNameExtension: function hasCustomSfNameExtension(name) {
		return SF.endsWith(name, SF._sfNameExt);
	},
	hasCustomEmberRelationExtension: function hasCustomEmberRelationExtension(name) {
		return SF.endsWith(name, SF._emRelExt);
	},
	hasCustomEmberNameExtension: function hasCustomEmberNameExtension(name) {
		return SF.endsWith(name, SF._emNameExt);
	},
	emberiseName: function emberiseName(sfName) {
		if (SF.hasCustomSfNameExtension(sfName)) sfName = sfName.substring(0, sfName.length - SF._sfNameExt.length) + SF._emNameExt;else if (SF.hasCustomSfRelationExtension(sfName)) sfName = sfName.substring(0, sfName.length - SF._sfRelExt.length) + SF._emRelExt;
		return this.Ember.String.dasherize(sfName);
	},
	sfriseName: function sfriseName(emName) {
		emName = this.Ember.String.camelize(emName);
		if (SF.hasCustomEmberNameExtension(emName)) return emName.substring(0, emName.length - SF._emNameExt.length) + SF._sfNameExt;else if (SF.hasCustomEmberRelationExtension(emName)) return emName.substring(0, emName.length - SF._emRelExt.length) + SF._sfRelExt;
		return emName;
	},
	emberiseRefs: function emberiseRefs(refs) {
		if (typeof refs === 'string') return SF.emberiseName(refs);else if (Array.isArray(refs)) {
			var emberRefs = [];
			for (var i = 0; i < refs.length; i++) emberRefs.push(SF.emberiseName(refs[i]));
			return emberRefs;
		} else return null;
	},
	sfriseRefs: function sfriseRefs(refs) {
		if (typeof refs === 'string') return SF.sfriseName(refs);else if (Array.isArray(refs)) {
			var sfRefs = [];
			for (var i = 0; i < refs.length; i++) sfRefs.push(SF.sfriseName(refs[i]));
			return sfRefs;
		} else return null;
	},
	// A type map to convert javascript datatypes used by salesforce to datatypes used in ember
	// see : https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/field_types.htm
	sforceToEmberTypeMap: {
		id: 'string',
		boolean: 'boolean',
		string: 'string',
		datetime: 'date',
		currency: 'number',
		date: 'date',
		email: 'string',
		int: 'number',
		double: 'number',
		percent: 'number',
		location: 'string',
		phone: 'string',
		picklist: 'string',
		multipicklist: 'string',
		textarea: 'string',
		url: 'string',
		address: 'string',
		calculated: 'string',
		combobox: 'string',
		datacategorygroupreference: 'string',
		encryptedstring: 'string',
		junctionidlist: 'string',
		masterrecord: 'string'
	},
	// One of the main methods. Used to read the salesforce schema using the sObjectReader and create
	// matching ember models. Pass in a typeFilter function to limit the models created.
	// For example if you only want to create a model for a salesforce Account sobject:
	//
	// typeFilter = function(obj) { return obj.name === 'Account'; }. If the typeFilter isn't used
	// all the salesforce object definitions are converted into ember models.
	createModelsForSObjects: function createModelsForSObjects(emberApp, sObjectMetaMap, sObjectReader, typeFilter) {
		var modelExtensionMap = SF.createEmberModelDefinitions(sObjectMetaMap, sObjectReader, typeFilter);
		SF.createModelsFromExtensionMap(emberApp, modelExtensionMap);
	},
	// One of the main methods. Used to create the ember models from ember model definitions in a js object.
	// Use createEmberModelDefinitions to create the ember model definitions.
	createModelsFromExtensionMap: function createModelsFromExtensionMap(emberApp, modelExtensionMap) {
		var evaluatedMap = {};
		for (var sObjectName in modelExtensionMap) {
			var model = modelExtensionMap[sObjectName];
			var evaluatedModel = {};
			for (var key in model) {
				if (typeof model[key] === 'string') evaluatedModel[key] = eval(model[key]);else evaluatedModel[key] = model[key];
			}
			var eon = SF.emberiseName(sObjectName);
			eon = this.Ember.String.dasherize(eon);
			emberApp[eon] = this.DS.Model.extend(evaluatedModel);
		}
	},
	// One of the main methods. Used to read the salesforce schema using the sObjectReader and create
	// matching ember model definitions into a js object. See createModelsForSObjects method for the typeFilter
	// definition. If the typeFilter isn't used all the salesforce object definitions are converted into ember
	// models.
	//
	// Use this method to create a static definition of the objects you use in your app so that you don't have
	// to dynamically recreate it every time, which is slow, requires the use of a callback and prevents
	// proper route handling when you land on the page/initialise the app.
	createEmberModelDefinitions: function createEmberModelDefinitions(sObjectMetaMap, sObjectReader, typeFilter) {
		var modelExtensionMap = {};
		var cache = new SF.factory.Cache();

		for (var sObjectName in sObjectMetaMap) {
			if (typeFilter && !typeFilter(sObjectMetaMap[sObjectName])) continue;
			SF.recordInverses(sObjectName, sObjectReader, cache, typeFilter);
		}

		for (var sObjectName in sObjectMetaMap) {
			if (typeFilter && !typeFilter(sObjectMetaMap[sObjectName])) continue;
			var modelExtension = {};
			modelExtensionMap[sObjectName] = modelExtension;
			SF.createFieldModelForSObject(modelExtension, sObjectName, sObjectReader, cache, typeFilter);
		}

		for (var sObjectName in sObjectMetaMap) {
			if (typeFilter && !typeFilter(sObjectMetaMap[sObjectName])) continue;
			var modelExtension = modelExtensionMap[sObjectName];
			SF.createRelationshipModelForSObject(modelExtension, sObjectName, sObjectReader, cache, typeFilter);
		}
		return modelExtensionMap;
	},
	// The first stage of creating the ember model definitions. The model definition creation needs to be divided
	// into three phases due so that the relationships between objects can be properly defined.
	// I.e. first the inverses between relationships then the field definitions and then the relationship definitions
	// which need the field definitions.
	//
	// See createModelsForSObjects method for the typeFilter definition. If the typeFilter isn't used all the
	// salesforce object definitions are converted into ember models.
	recordInverses: function recordInverses(sObjectName, sObjectReader, cache, typeFilter) {
		var relVisitor = function relVisitor(rel, object, path, reader) {
			if (typeof rel.relationshipName === 'undefined' || typeof rel.childSObject === 'undefined' || cache.isReferencedByMultitypedReference(rel)) return;
			if (typeFilter && !typeFilter(sObjectReader.completeMetas[rel.childSObject])) return;
			cache.logInverses(sObjectName, rel.relationshipName, rel.field);
		};

		var obj = sObjectReader.completeMetas[sObjectName];
		sObjectReader.shallowReadMetaChildRelationshipsAbr(obj, relVisitor);
	},
	// The second stage of creating the ember model definitions. The model definition creation needs to be divided
	// into three phases due so that the relationships between objects can be properly defined.
	// I.e. first the inverses between relationships then the field definitions and then the relationship definitions
	// which need the field definitions.
	//
	// See createModelsForSObjects method for the typeFilter definition. If the typeFilter isn't used all the
	// salesforce object definitions are converted into ember models.
	createFieldModelForSObject: function createFieldModelForSObject(modelExtension, sObjectName, sObjectReader, cache, typeFilter) {
		var fieldVisitor = function fieldVisitor(field, object, path, reader) {
			var fn = field.name;
			var updateable = field.updateable === 'true';
			if (!updateable) cache.logNonUpdateableField(sObjectName, fn);
			if (field.type === 'reference') {
				if (typeof field.referenceTo === 'string') {
					var erefs = field.referenceTo;
					if (typeFilter && !typeFilter(sObjectReader.completeMetas[erefs])) {
						modelExtension[fn] = "this.DS.attr('string', {updateable : " + updateable + "})";
						return;
					}
					if (field.custom == 'true') erefs = SF.emberiseName(erefs);
					var inverse = cache.getInverse(sObjectName, fn);
					if (inverse != null) modelExtension[fn] = "this.DS.belongsTo('" + erefs + "', { async : true, updateable : " + updateable + ", inverse : '" + inverse + "' })";else modelExtension[fn] = "this.DS.belongsTo('" + erefs + "', { async : true, updateable : " + updateable + ", inverse : null })";
				} else if (Array.isArray(field.referenceTo)) {
					cache.logMultitypedReferenceField(sObjectName, fn);
					modelExtension[fn] = "this.DS.attr('string', { multiRef : true, updateable : " + updateable + " })";
				} else {
					//cache.logMultitypedReferenceField(sObjectName, fn)
					modelExtension[fn] = "this.DS.attr('string', {updateable : " + updateable + "})";
				}
			} else if (fn !== 'Id') modelExtension[fn] = "this.DS.attr('" + SF.sforceToEmberTypeMap[field.type] + "', {updateable : " + updateable + "})";
			console.log(sObjectReader.completeMetas.length + ' : field : ' + fn);
		};

		var obj = sObjectReader.completeMetas[sObjectName];
		sObjectReader.shallowReadMetaFieldsAbr(obj, fieldVisitor);
	},
	// The thire stage of creating the ember model definitions. The model definition creation needs to be divided
	// into three phases due so that the relationships between objects can be properly defined.
	// I.e. first the inverses between relationships then the field definitions and then the relationship definitions
	// which need the field definitions.
	//
	// See createModelsForSObjects method for the typeFilter definition. If the typeFilter isn't used all the
	// salesforce object definitions are converted into ember models.
	createRelationshipModelForSObject: function createRelationshipModelForSObject(modelExtension, sObjectName, sObjectReader, cache, typeFilter) {
		var relVisitor = function relVisitor(rel, object, path, reader) {
			if (typeof rel.relationshipName === 'undefined' || typeof rel.childSObject === 'undefined' || cache.isReferencedByMultitypedReference(rel)) return;
			if (typeFilter && !typeFilter(sObjectReader.completeMetas[rel.childSObject])) return;
			var rn = rel.relationshipName;
			var econ = SF.emberiseName(rel.childSObject);
			modelExtension[rn] = "this.DS.hasMany('" + econ + "', { async : true, inverse : '" + rel.field + "', })";
			console.log('child rel : ' + rn);
		};

		var obj = sObjectReader.completeMetas[sObjectName];
		sObjectReader.shallowReadMetaChildRelationshipsAbr(obj, relVisitor);
	},
	// This method creates a soql select statement string to query an object with its fields and relationships
	// using the salesforce soap api - i.e- sforce.connection.query
	createSoqlSelect: function createSoqlSelect(type, name, whereClause, childSelectCreator) {
		var q = 'select Id';
		type.eachAttribute(function (name, meta) {
			q += ', ' + name;
		});
		type.eachRelationship(function (name, descriptor) {
			q += ', ';
			if (descriptor.kind === 'hasMany') q += '(' + childSelectCreator(descriptor.type, descriptor.key) + ')';else q += descriptor.key;
		});
		q += ' from ' + name;
		if (!(typeof whereClause === 'undefined')) q += ' where ' + whereClause;
		return q;
	},
	// This method is part of creating a soql select statement. It handles the root select statement generation,
	// not the child relationship statement generation
	createRootSoqlSelect: function createRootSoqlSelect(type, name, whereClause) {
		return SF.createSoqlSelect(type, name, whereClause, SF.createIdSoqlSelect);
	},
	// Child relationships are passed to ember as a list of ids in the payload. This method is for child
	// relationship select statement generation.
	createIdSoqlSelect: function createIdSoqlSelect(type, name, whereClause) {
		var q = 'select Id from ' + name;
		if (!(typeof whereClause === 'undefined')) q += ' where ' + whereClause;
		return q;
	},
	// In a soql select statement an array doesn't look like a serialised javascript array. This method
	// handles the conversion.
	//
	// [1,2,"hello world"] => (1,2,"hello world")
	toSoqlArray: function toSoqlArray(array) {
		var soqlAry = "(";
		for (var i = 0; i < array.length; i++) {
			if (i > 0) soqlAry += ",'";else soqlAry += "'";
			soqlAry += array[i] + "'";
		}
		soqlAry += ")";
		return soqlAry;
	},
	// Salesforce, naturally doesn't return it's results in the format that the ember rest adapter would like.
	// This method reformats a salesforce payload into an ember payload.
	formatPayload: function formatPayload(type, pl) {
		var formattedPl = {};
		var plural = this.Ember.Inflector.inflector.pluralize(type.modelName);
		plural = this.Ember.String.dasherize(plural);
		if (Array.isArray(pl.records)) {
			for (var i = 0; i < pl.records.length; i++) SF.formatRecord(pl.records[i]);
			formattedPl[plural] = pl.records;
		} else {
			SF.formatRecord(pl.records);
			formattedPl[plural] = [pl.records];
		}
		return formattedPl;
	},
	// This is a sub method to formatPayload. It formats a single record result returned by salesforce
	// into a payload expected by the ember rest adapter.
	formatRecord: function formatRecord(rec) {
		if (!rec) {
			console.log('rec is undefined');
			return;
		}
		for (var fieldName in rec) {
			var field = rec[fieldName];
			if (field != null && !(typeof field.records === 'undefined')) rec[fieldName] = SF.formatToIdArray(field.records);
		}
		if (!(typeof rec.Id === 'undefined')) {
			rec.id = rec.Id;
			delete rec.Id;
		}
	},
	// This is a sub method to formatRecord. It formats a child relationship result, returned within a record
	// result, into an id array expected by the ember rest adapter.
	formatToIdArray: function formatToIdArray(records) {
		var idArr = [];
		if (Array.isArray(records)) for (var i = 0; i < records.length; i++) idArr.push(records[i].Id);else idArr.push(records.Id);
		return idArr;
	},
	// This method formats an ember Snapshot object, into a javascript representation of an SObject, ready for
	// sending to the server using the salesforce soap api i.e. sforce.connection.create/update
	sfFormatSnapshot: function sfFormatSnapshot(snapshot, type) {
		var sfName = SF.sfriseName(type.modelName);
		var so = new this.sforce.SObject(sfName);
		if (snapshot.id != null) so.Id = snapshot.id;
		snapshot.eachAttribute(function (name, meta) {
			var metaOptions = type.metaForProperty(name).options;
			if (metaOptions.updateable) so[name] = snapshot.attr(name);
		});
		snapshot.eachRelationship(function (name, meta) {
			if (meta.kind === 'belongsTo') {
				var metaOptions = type.metaForProperty(name).options;
				if (metaOptions.updateable) so[name] = snapshot.belongsTo(name, { id: true });
			}
		});
		return so;
	},
	// This is the general query method used to execute a soap api query to a salesforce org.
	// See: sforce.connection.query(q, cbSuccess, cbErr);
	query: function query(store, type, _query, cbSuccess, cbErr) {
		var q = null;
		try {
			var sfName = SF.sfriseName(type.modelName);
			q = SF.createRootSoqlSelect(type, sfName, _query);
			this.sforce.connection.query(q, cbSuccess, cbErr);
		} catch (e) {
			console.log(q);
			throw e;
		}
	},
	// This is an initialisation method to dynamically create the ember models, used by an ember app, by
	// reading the salesforce schema via the salesforce soap api. If this initialisation method is used,
	// app initialisation should happen in the callback: cb
	//
	// The objNames parameter is used to determine which salesforce types/objects you want to create
	// ember models for. If you omit this parameter, models will be created for all types/objects
	createEmberModels: function createEmberModels(opts) {
		var connection = opts.connection,
		    cb = opts.cb,
		    objNames = opts.objNames;
		var owner = opts.owner ? opts.owner : {};

		var w = new _salesforceSchemaReader2['default'](connection, 100, function () {
			SF.createModelsForSObjects(owner, w.completeMetas, w, typeFilter);
			cb(owner);
		}, function () {
			cb(null, 'Failed to fetch salesforce schema definitions for the provided object names');
		}, objNames);
	}
};

// This is an initialisation method for creating the ember model definitions and downloading them in a
// serialised js object. Once the static js object has been created it can be used to initialise
// the models by using the createModelsFromExtensionMap method. If you use this method to initialise, your
// app will start up faster and you won't need to initialise your app in a callback. Bear in mind that any
// model changes on salesforce will mean that you'll have to regenerate the serialised js object into a file.
//
// See the createModelsForSObjects method for the objNames definition. If objNames isn't used
//    // all the salesforce object definitions are converted into ember models.
// downloadEmberModels(typeFilter){
// 	throw 'currently not implemented';
// 	var w = new SchemaReader(100, () => {
// 		var serialised = JSON.stringify(SF.createEmberModelDefinitions(w.completeMetas, w, typeFilter), null, 1);
// 		window.open('data:text/plain,' + encodeURIComponent('var modelDefinitions = ' + serialised + ';'));
// 	});
// },
SFModels.factory = {
	// Produces a cache object used in creating the ember model definitions
	Cache: function Cache() {
		this.nonUpdateableFields = {};
		this.multitypedReferenceFields = {};
		this.inversFields = {};
		var that = this;

		this.logNonUpdateableField = function (objectName, fieldName) {
			that.nonUpdateableFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()] = true;
		};
		this.isUpdateableField = function (objectName, fieldName) {
			return !that.nonUpdateableFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()];
		};
		this.logMultitypedReferenceField = function (objectName, fieldName) {
			that.multitypedReferenceFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()] = true;
		};
		this.isMultitypedReferenceField = function (objectName, fieldName) {
			return that.multitypedReferenceFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()];
		};
		this.isReferencedByMultitypedReference = function (relationship) {
			return that.isMultitypedReferenceField(relationship.childSObject, relationship.field);
		};
		this.getInversMap = function (objectName) {
			var map = that.inversFields[objectName];
			if (typeof map === 'undefined' || map == null) {
				map = {};
				that.inversFields[objectName] = map;
			}
			return map;
		};
		this.logInverses = function (objectName, field1Name, field2Name) {
			var map = that.getInversMap(objectName);
			map[field1Name] = field2Name;
			map[field2Name] = field1Name;
		};
		this.getInverse = function (objectName, fieldName) {
			var inverse = that.getInversMap(objectName)[fieldName];
			return typeof inverse === 'undefined' ? null : inverse;
		};
	}
};

exports['default'] = SFModels;
module.exports = exports['default'];
},{"salesforce-schema-reader":4}],3:[function(require,module,exports){
// http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var clone = function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
};

// Requires a salesforce connection object, unless the metadata is passed directly
// to the reader.
// Leave onSuccess out if you don't want to populate metadata on construction
var SchemaReader = function SchemaReader(connection, batchSize, onSuccess, onFailure, objNames) {
	this.type = 'SchemaReader';
	this.connection = connection;
	this.isFetching = true;
	this.batchSize = typeof batchSize == 'undefined' ? 100 : batchSize;
	this.skipErrors = typeof onFailure == 'undefined' ? true : false;
	this.readRelWithUdefNames = false;

	if (typeof onSuccess === 'function') this.populate(onSuccess, onFailure, objNames);
};

SchemaReader.prototype = {
	populate: function populate(onSuccess, onFailure, objNames) {
		this.isFetching = true;
		this.preMetas = [];
		this.completeMetas = {};
		this.nameBatches = [];

		var threadCount = 0;
		if (!objNames) {
			var res = this.connection.describeGlobal();
			this.preMetas = res.getArray("sobjects");
		} else this.preMetas = objNames;

		// Push batches
		for (var i = 0; i < this.preMetas.length;) {
			var batch = [];
			for (var j = 0; i < this.preMetas.length && j < this.batchSize; i++, j++) batch.push(this.preMetas[i].name);
			this.nameBatches.push(batch);
		}

		var failed = false;
		var handledFailure = false;
		var that = this;
		var cb = function cb(err) {
			if (handledFailure) return;
			if (failed) {
				console.log(err);
				onFailure(err);
				handledFailure = true;
				return;
			}
			threadCount--;
			console.log(threadCount);
			if (threadCount <= 0) {
				that.isFetching = false;
				onSuccess();
			}
		};
		var fail = function fail(err) {
			if (!that.skipErrors) {
				failed = true;
				onFailure(err);
			} else console.log(err); // Currently only logging the error
			cb(err);
		};

		// Get complete metas
		for (var i = 0; i < this.nameBatches.length; i++) {
			threadCount++;
			console.log('Batch : ' + this.nameBatches[i]);
			this.fetchCompleteMeta(this.nameBatches[i], cb, fail);
		}
	},
	// Read the array of pre metas and populate completeMetas
	fetchCompleteMeta: function fetchCompleteMeta(objs, success, fail) {
		var that = this;
		var fetchSuccess = function fetchSuccess(metas) {
			try {
				for (var i = 0; i < metas.length; i++) that.registerMeta(metas[i]);
			} catch (e) {
				fail(e);
			} finally {
				success();
			} // call the callback
		};
		this.connection.describeSObjects(objs, fetchSuccess, fail);
	},
	registerMeta: function registerMeta(obj) {
		this.completeMetas[obj.name] = obj;
	},
	// see deepread fields for the visitor definition
	shallowReadFields: function shallowReadFields(visitor) {
		this.validateState();
		for (var objName in this.completeMetas) if (this.shallowReadMetaFieldsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	shallowReadMetaFields: function shallowReadMetaFields(obj, visited, path, visitor) {
		this.validateState();
		if (typeof obj.fields === 'undefined') {
			return;
		}
		for (var i = 0; i < obj.fields.length; i++) {
			var f = obj.fields[i];
			if (typeof f === 'undefined') continue;
			var subPath = path.concat(f);
			// subPath.push(f);
			if (visitor(f, obj, subPath, this) === 'term') return 'term';
		}
	},
	// An abbreviation (Abr) method to shallow read beginning with the passed object
	// see deepread fields for the visitor definition
	shallowReadMetaFieldsAbr: function shallowReadMetaFieldsAbr(obj, visitor) {
		return this.shallowReadMetaFields(obj, {}, [], visitor);
	},
	// visitor definition: function(field, object, path, reader) {
	// 		// return 'term' // if you want to terminate the schema read
	// }
	// field : {} - the field description under read,
	// object : {} - the sobject description under read
	// path : [] - a list of descriptions starting with the sobject description, trailed by
	//				relationship descriptions and ending with a field description
	// reader : the reader which is currently used to read the schema
	deepReadFields: function deepReadFields(visitor) {
		this.validateState();
		for (var objName in this.completeMetas) if (this.deepReadMetaFieldsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	deepReadMetaFields: function deepReadMetaFields(obj, visited, path, visitor) {
		this.validateState();
		if (visited[obj.name] == true) return;
		if (typeof obj.fields === 'undefined') return;
		visited[obj.name] = true;

		if (path.length == 0) path.push(obj);

		for (var i = 0; i < obj.fields.length; i++) {
			var f = obj.fields[i];
			if (typeof f === 'undefined') continue;
			var subPath = path.concat(f);
			if (visitor(f, obj, subPath, this) === 'term') return 'term';
			if (f.type === 'reference') {
				if (!Array.isArray(f.referenceTo)) {
					if (this.deepReadMetaFields(this.completeMetas[f.referenceTo], clone(visited), subPath, visitor) === 'term') return 'term';
				} else {
					for (var j = 0; j < f.referenceTo.length; j++) if (this.deepReadMetaFields(this.completeMetas[f.referenceTo[j]], clone(visited), subPath, visitor) === 'term') return 'term';
				}
			}
		}
	},
	// An abbreviation (Abr) method to deep read starting with the passed object
	// see deepread fields for the visitor definition
	deepReadMetaFieldsAbr: function deepReadMetaFieldsAbr(obj, visitor) {
		return this.deepReadMetaFields(obj, [], [], visitor);
	},
	// visitor definition: function(rel, object, path, reader) {
	// 		// return 'term' // if you want to terminate the schema read
	// }
	// rel : {} - the relationship description under read,
	// object : {} - the sobject description under read
	// path : [] - a list of descriptions starting with the sobject description, trailed by
	//				relationship descriptions
	// reader : the reader which is currently used to read the schema
	shallowReadChildRelationships: function shallowReadChildRelationships(visitor) {
		this.validateState();
		for (var objName in this.completeMetas) if (this.shallowReadMetaChildRelationshipsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see shallowReadChildRelationships fields for the visitor definition
	shallowReadMetaChildRelationships: function shallowReadMetaChildRelationships(obj, visited, path, visitor) {
		this.validateState();
		if (typeof obj.childRelationships === 'undefined') {
			return;
		}
		for (var i = 0; i < obj.childRelationships.length; i++) {
			var r = obj.childRelationships[i];
			if (typeof r === 'undefined') continue;
			var subPath = path.concat(r);
			if (visitor(r, obj, subPath, this) === 'term') return 'term';
		}
	},
	// An abbreviation (Abr) method to shallow read starting with the passed object
	// see shallowReadChildRelationships fields for the visitor definition
	shallowReadMetaChildRelationshipsAbr: function shallowReadMetaChildRelationshipsAbr(obj, visitor) {
		return this.shallowReadMetaChildRelationships(obj, {}, [], visitor);
	},

	// see shallowReadChildRelationships for the visitor definition
	deepReadChildRelationships: function deepReadChildRelationships(visitor) {
		this.validateState();
		for (var objName in this.completeMetas) if (this.deepReadMetaChildRelationshipsAbr(this.completeMetas[objName], visitor) === 'term') return 'term';
	},
	// see deepread fields for the visitor definition
	deepReadMetaChildRelationships: function deepReadMetaChildRelationships(obj, visited, path, visitor) {
		this.validateState();
		if (visited[obj.name] == true) return;
		if (typeof obj.childRelationships === 'undefined') return;
		visited[obj.name] = true;

		if (path.length == 0) path.push(obj);

		for (var i = 0; i < obj.childRelationships.length; i++) {
			var r = obj.childRelationships[i];
			if (typeof r === 'undefined') continue;
			var subPath = path.concat(r);
			if (visitor(r, obj, subPath, this) === 'term') return 'term';
			if (!Array.isArray(r.childSObject)) {
				if (this.deepReadMetaChildRelationships(this.completeMetas[r.childSObject], clone(visited), subPath, visitor) === 'term') return 'term';
			} else {
				for (var j = 0; j < r.childSObject.length; j++) if (this.deepReadMetaChildRelationships(this.completeMetas[r.childSObject[j]], clone(visited), subPath, visitor) === 'term') return 'term';
			}
		}
	},
	// An abbreviation (Abr) method to deep read starting with the passed object
	// see deepread fields for the visitor definition
	deepReadMetaChildRelationshipsAbr: function deepReadMetaChildRelationshipsAbr(obj, visitor) {
		return this.deepReadMetaChildRelationships(obj, {}, [], visitor);
	},

	validateState: function validateState() {
		if (this.isFetching) throw this.type + " hasn't finished fetching metadata from the server";
	}

};

// filters
SchemaReader.createFilterVisitor = function (filter, visitor) {
	return function (field, object, path, reader) {
		if (filter(field, object, path, reader)) visitor(field, object, path, reader);
	};
};
SchemaReader.newObjectNameFilter = function (objName, visitor, caseSensitive) {
	return function (field, object, path, reader) {
		if (!caseSensitive && objName.toLowerCase() === object.name.toLowerCase() || caseSensitive && objName === object.name) visitor(field, object, path, reader);
	};
};
SchemaReader.newFieldNameFilter = function (fieldName, visitor, caseSensitive) {
	return function (field, object, path, reader) {
		if (!caseSensitive && fieldName.toLowerCase() === field.name.toLowerCase() || caseSensitive && fieldName === field.name) visitor(field, object, path, reader);
	};
};
SchemaReader.newFieldAndObjectNameFilter = function (fieldName, objName, visitor, caseSensitive) {
	return function (field, object, path, reader) {
		if ((!caseSensitive && fieldName.toLowerCase() === field.name.toLowerCase() || caseSensitive && fieldName === field.name) && (!caseSensitive && objName.toLowerCase() === object.name.toLowerCase() || caseSensitive && objName === object.name)) visitor(field, object, path, reader);
	};
};

// miscalleneous
SchemaReader.concatPath = function (path) {
	var str = '';
	for (var i = 0; i < path.length; i++) str += (i > 0 ? '.' : '') + (path[i].name ? path[i].name : path[i].relationshipName);
	return str;
};

exports['default'] = SchemaReader;
module.exports = exports['default'];
},{}],4:[function(require,module,exports){
module.exports = require('./dist/schema-reader-node.js');
},{"./dist/schema-reader-node.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyRW50cnkuanMiLCJzZi1tb2RlbHMuanMiLCIuLi8uLi8uLi9zYWxlc2ZvcmNlLXNjaGVtYS1yZWFkZXIvZGlzdC9zY2hlbWEtcmVhZGVyLW5vZGUuanMiLCIuLi8uLi8uLi9zYWxlc2ZvcmNlLXNjaGVtYS1yZWFkZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbndpbmRvdy5TRk1vZGVscyA9IHJlcXVpcmUoXCIuL3NmLW1vZGVsc1wiKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfc2FsZXNmb3JjZVNjaGVtYVJlYWRlciA9IHJlcXVpcmUoJ3NhbGVzZm9yY2Utc2NoZW1hLXJlYWRlcicpO1xuXG52YXIgX3NhbGVzZm9yY2VTY2hlbWFSZWFkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2FsZXNmb3JjZVNjaGVtYVJlYWRlcik7XG5cbnZhciBTRjtcbnZhciBTRk1vZGVscyA9IFNGID0ge1xuXHRFbWJlcjogd2luZG93ICYmIHdpbmRvdy5FbWJlciA/IHdpbmRvdy5FbWJlciA6IHVuZGVmaW5lZCxcblx0RFM6IHVuZGVmaW5lZCxcblx0c2ZvcmNlOiB3aW5kb3cgJiYgd2luZG93LnNmb3JjZSA/IHdpbmRvdy5zZm9yY2UgOiB1bmRlZmluZWQsXG5cdFNjaGVtYVJlYWRlcjogX3NhbGVzZm9yY2VTY2hlbWFSZWFkZXIyWydkZWZhdWx0J10sXG5cdC8vIENvbnN0YW50cyBhbmQgbWV0aG9kcyBmb3Igc2FsZXNmb3JjZSBjdXN0b20gZW50aXR5IGVuZGluZyBoYW5kbGluZyBhbmQgY29udmVyc2lvbnNcblx0X3NmUmVsRXh0OiAnX19yJyxcblx0X3NmTmFtZUV4dDogJ19fYycsXG5cdF9lbVJlbEV4dDogJ3JycicsXG5cdF9lbU5hbWVFeHQ6ICdjY2MnLFxuXHRlbmRzV2l0aDogZnVuY3Rpb24gZW5kc1dpdGgoc3RyLCBlbmRpbmcpIHtcblx0XHRyZXR1cm4gc3RyLmluZGV4T2YoZW5kaW5nLCBzdHIubGVuZ3RoIC0gZW5kaW5nLmxlbmd0aCkgPiAtMTtcblx0fSxcblx0aGFzQ3VzdG9tU2ZSZWxhdGlvbkV4dGVuc2lvbjogZnVuY3Rpb24gaGFzQ3VzdG9tU2ZSZWxhdGlvbkV4dGVuc2lvbihuYW1lKSB7XG5cdFx0cmV0dXJuIFNGLmVuZHNXaXRoKG5hbWUsIFNGLl9zZlJlbEV4dCk7XG5cdH0sXG5cdGhhc0N1c3RvbVNmTmFtZUV4dGVuc2lvbjogZnVuY3Rpb24gaGFzQ3VzdG9tU2ZOYW1lRXh0ZW5zaW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gU0YuZW5kc1dpdGgobmFtZSwgU0YuX3NmTmFtZUV4dCk7XG5cdH0sXG5cdGhhc0N1c3RvbUVtYmVyUmVsYXRpb25FeHRlbnNpb246IGZ1bmN0aW9uIGhhc0N1c3RvbUVtYmVyUmVsYXRpb25FeHRlbnNpb24obmFtZSkge1xuXHRcdHJldHVybiBTRi5lbmRzV2l0aChuYW1lLCBTRi5fZW1SZWxFeHQpO1xuXHR9LFxuXHRoYXNDdXN0b21FbWJlck5hbWVFeHRlbnNpb246IGZ1bmN0aW9uIGhhc0N1c3RvbUVtYmVyTmFtZUV4dGVuc2lvbihuYW1lKSB7XG5cdFx0cmV0dXJuIFNGLmVuZHNXaXRoKG5hbWUsIFNGLl9lbU5hbWVFeHQpO1xuXHR9LFxuXHRlbWJlcmlzZU5hbWU6IGZ1bmN0aW9uIGVtYmVyaXNlTmFtZShzZk5hbWUpIHtcblx0XHRpZiAoU0YuaGFzQ3VzdG9tU2ZOYW1lRXh0ZW5zaW9uKHNmTmFtZSkpIHNmTmFtZSA9IHNmTmFtZS5zdWJzdHJpbmcoMCwgc2ZOYW1lLmxlbmd0aCAtIFNGLl9zZk5hbWVFeHQubGVuZ3RoKSArIFNGLl9lbU5hbWVFeHQ7ZWxzZSBpZiAoU0YuaGFzQ3VzdG9tU2ZSZWxhdGlvbkV4dGVuc2lvbihzZk5hbWUpKSBzZk5hbWUgPSBzZk5hbWUuc3Vic3RyaW5nKDAsIHNmTmFtZS5sZW5ndGggLSBTRi5fc2ZSZWxFeHQubGVuZ3RoKSArIFNGLl9lbVJlbEV4dDtcblx0XHRyZXR1cm4gdGhpcy5FbWJlci5TdHJpbmcuZGFzaGVyaXplKHNmTmFtZSk7XG5cdH0sXG5cdHNmcmlzZU5hbWU6IGZ1bmN0aW9uIHNmcmlzZU5hbWUoZW1OYW1lKSB7XG5cdFx0ZW1OYW1lID0gdGhpcy5FbWJlci5TdHJpbmcuY2FtZWxpemUoZW1OYW1lKTtcblx0XHRpZiAoU0YuaGFzQ3VzdG9tRW1iZXJOYW1lRXh0ZW5zaW9uKGVtTmFtZSkpIHJldHVybiBlbU5hbWUuc3Vic3RyaW5nKDAsIGVtTmFtZS5sZW5ndGggLSBTRi5fZW1OYW1lRXh0Lmxlbmd0aCkgKyBTRi5fc2ZOYW1lRXh0O2Vsc2UgaWYgKFNGLmhhc0N1c3RvbUVtYmVyUmVsYXRpb25FeHRlbnNpb24oZW1OYW1lKSkgcmV0dXJuIGVtTmFtZS5zdWJzdHJpbmcoMCwgZW1OYW1lLmxlbmd0aCAtIFNGLl9lbVJlbEV4dC5sZW5ndGgpICsgU0YuX3NmUmVsRXh0O1xuXHRcdHJldHVybiBlbU5hbWU7XG5cdH0sXG5cdGVtYmVyaXNlUmVmczogZnVuY3Rpb24gZW1iZXJpc2VSZWZzKHJlZnMpIHtcblx0XHRpZiAodHlwZW9mIHJlZnMgPT09ICdzdHJpbmcnKSByZXR1cm4gU0YuZW1iZXJpc2VOYW1lKHJlZnMpO2Vsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVmcykpIHtcblx0XHRcdHZhciBlbWJlclJlZnMgPSBbXTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVmcy5sZW5ndGg7IGkrKykgZW1iZXJSZWZzLnB1c2goU0YuZW1iZXJpc2VOYW1lKHJlZnNbaV0pKTtcblx0XHRcdHJldHVybiBlbWJlclJlZnM7XG5cdFx0fSBlbHNlIHJldHVybiBudWxsO1xuXHR9LFxuXHRzZnJpc2VSZWZzOiBmdW5jdGlvbiBzZnJpc2VSZWZzKHJlZnMpIHtcblx0XHRpZiAodHlwZW9mIHJlZnMgPT09ICdzdHJpbmcnKSByZXR1cm4gU0Yuc2ZyaXNlTmFtZShyZWZzKTtlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlZnMpKSB7XG5cdFx0XHR2YXIgc2ZSZWZzID0gW107XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlZnMubGVuZ3RoOyBpKyspIHNmUmVmcy5wdXNoKFNGLnNmcmlzZU5hbWUocmVmc1tpXSkpO1xuXHRcdFx0cmV0dXJuIHNmUmVmcztcblx0XHR9IGVsc2UgcmV0dXJuIG51bGw7XG5cdH0sXG5cdC8vIEEgdHlwZSBtYXAgdG8gY29udmVydCBqYXZhc2NyaXB0IGRhdGF0eXBlcyB1c2VkIGJ5IHNhbGVzZm9yY2UgdG8gZGF0YXR5cGVzIHVzZWQgaW4gZW1iZXJcblx0Ly8gc2VlIDogaHR0cHM6Ly9kZXZlbG9wZXIuc2FsZXNmb3JjZS5jb20vZG9jcy9hdGxhcy5lbi11cy5hcGkubWV0YS9hcGkvZmllbGRfdHlwZXMuaHRtXG5cdHNmb3JjZVRvRW1iZXJUeXBlTWFwOiB7XG5cdFx0aWQ6ICdzdHJpbmcnLFxuXHRcdGJvb2xlYW46ICdib29sZWFuJyxcblx0XHRzdHJpbmc6ICdzdHJpbmcnLFxuXHRcdGRhdGV0aW1lOiAnZGF0ZScsXG5cdFx0Y3VycmVuY3k6ICdudW1iZXInLFxuXHRcdGRhdGU6ICdkYXRlJyxcblx0XHRlbWFpbDogJ3N0cmluZycsXG5cdFx0aW50OiAnbnVtYmVyJyxcblx0XHRkb3VibGU6ICdudW1iZXInLFxuXHRcdHBlcmNlbnQ6ICdudW1iZXInLFxuXHRcdGxvY2F0aW9uOiAnc3RyaW5nJyxcblx0XHRwaG9uZTogJ3N0cmluZycsXG5cdFx0cGlja2xpc3Q6ICdzdHJpbmcnLFxuXHRcdG11bHRpcGlja2xpc3Q6ICdzdHJpbmcnLFxuXHRcdHRleHRhcmVhOiAnc3RyaW5nJyxcblx0XHR1cmw6ICdzdHJpbmcnLFxuXHRcdGFkZHJlc3M6ICdzdHJpbmcnLFxuXHRcdGNhbGN1bGF0ZWQ6ICdzdHJpbmcnLFxuXHRcdGNvbWJvYm94OiAnc3RyaW5nJyxcblx0XHRkYXRhY2F0ZWdvcnlncm91cHJlZmVyZW5jZTogJ3N0cmluZycsXG5cdFx0ZW5jcnlwdGVkc3RyaW5nOiAnc3RyaW5nJyxcblx0XHRqdW5jdGlvbmlkbGlzdDogJ3N0cmluZycsXG5cdFx0bWFzdGVycmVjb3JkOiAnc3RyaW5nJ1xuXHR9LFxuXHQvLyBPbmUgb2YgdGhlIG1haW4gbWV0aG9kcy4gVXNlZCB0byByZWFkIHRoZSBzYWxlc2ZvcmNlIHNjaGVtYSB1c2luZyB0aGUgc09iamVjdFJlYWRlciBhbmQgY3JlYXRlXG5cdC8vIG1hdGNoaW5nIGVtYmVyIG1vZGVscy4gUGFzcyBpbiBhIHR5cGVGaWx0ZXIgZnVuY3Rpb24gdG8gbGltaXQgdGhlIG1vZGVscyBjcmVhdGVkLlxuXHQvLyBGb3IgZXhhbXBsZSBpZiB5b3Ugb25seSB3YW50IHRvIGNyZWF0ZSBhIG1vZGVsIGZvciBhIHNhbGVzZm9yY2UgQWNjb3VudCBzb2JqZWN0OlxuXHQvL1xuXHQvLyB0eXBlRmlsdGVyID0gZnVuY3Rpb24ob2JqKSB7IHJldHVybiBvYmoubmFtZSA9PT0gJ0FjY291bnQnOyB9LiBJZiB0aGUgdHlwZUZpbHRlciBpc24ndCB1c2VkXG5cdC8vIGFsbCB0aGUgc2FsZXNmb3JjZSBvYmplY3QgZGVmaW5pdGlvbnMgYXJlIGNvbnZlcnRlZCBpbnRvIGVtYmVyIG1vZGVscy5cblx0Y3JlYXRlTW9kZWxzRm9yU09iamVjdHM6IGZ1bmN0aW9uIGNyZWF0ZU1vZGVsc0ZvclNPYmplY3RzKGVtYmVyQXBwLCBzT2JqZWN0TWV0YU1hcCwgc09iamVjdFJlYWRlciwgdHlwZUZpbHRlcikge1xuXHRcdHZhciBtb2RlbEV4dGVuc2lvbk1hcCA9IFNGLmNyZWF0ZUVtYmVyTW9kZWxEZWZpbml0aW9ucyhzT2JqZWN0TWV0YU1hcCwgc09iamVjdFJlYWRlciwgdHlwZUZpbHRlcik7XG5cdFx0U0YuY3JlYXRlTW9kZWxzRnJvbUV4dGVuc2lvbk1hcChlbWJlckFwcCwgbW9kZWxFeHRlbnNpb25NYXApO1xuXHR9LFxuXHQvLyBPbmUgb2YgdGhlIG1haW4gbWV0aG9kcy4gVXNlZCB0byBjcmVhdGUgdGhlIGVtYmVyIG1vZGVscyBmcm9tIGVtYmVyIG1vZGVsIGRlZmluaXRpb25zIGluIGEganMgb2JqZWN0LlxuXHQvLyBVc2UgY3JlYXRlRW1iZXJNb2RlbERlZmluaXRpb25zIHRvIGNyZWF0ZSB0aGUgZW1iZXIgbW9kZWwgZGVmaW5pdGlvbnMuXG5cdGNyZWF0ZU1vZGVsc0Zyb21FeHRlbnNpb25NYXA6IGZ1bmN0aW9uIGNyZWF0ZU1vZGVsc0Zyb21FeHRlbnNpb25NYXAoZW1iZXJBcHAsIG1vZGVsRXh0ZW5zaW9uTWFwKSB7XG5cdFx0dmFyIGV2YWx1YXRlZE1hcCA9IHt9O1xuXHRcdGZvciAodmFyIHNPYmplY3ROYW1lIGluIG1vZGVsRXh0ZW5zaW9uTWFwKSB7XG5cdFx0XHR2YXIgbW9kZWwgPSBtb2RlbEV4dGVuc2lvbk1hcFtzT2JqZWN0TmFtZV07XG5cdFx0XHR2YXIgZXZhbHVhdGVkTW9kZWwgPSB7fTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBtb2RlbCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIG1vZGVsW2tleV0gPT09ICdzdHJpbmcnKSBldmFsdWF0ZWRNb2RlbFtrZXldID0gZXZhbChtb2RlbFtrZXldKTtlbHNlIGV2YWx1YXRlZE1vZGVsW2tleV0gPSBtb2RlbFtrZXldO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGVvbiA9IFNGLmVtYmVyaXNlTmFtZShzT2JqZWN0TmFtZSk7XG5cdFx0XHRlb24gPSB0aGlzLkVtYmVyLlN0cmluZy5kYXNoZXJpemUoZW9uKTtcblx0XHRcdGVtYmVyQXBwW2Vvbl0gPSB0aGlzLkRTLk1vZGVsLmV4dGVuZChldmFsdWF0ZWRNb2RlbCk7XG5cdFx0fVxuXHR9LFxuXHQvLyBPbmUgb2YgdGhlIG1haW4gbWV0aG9kcy4gVXNlZCB0byByZWFkIHRoZSBzYWxlc2ZvcmNlIHNjaGVtYSB1c2luZyB0aGUgc09iamVjdFJlYWRlciBhbmQgY3JlYXRlXG5cdC8vIG1hdGNoaW5nIGVtYmVyIG1vZGVsIGRlZmluaXRpb25zIGludG8gYSBqcyBvYmplY3QuIFNlZSBjcmVhdGVNb2RlbHNGb3JTT2JqZWN0cyBtZXRob2QgZm9yIHRoZSB0eXBlRmlsdGVyXG5cdC8vIGRlZmluaXRpb24uIElmIHRoZSB0eXBlRmlsdGVyIGlzbid0IHVzZWQgYWxsIHRoZSBzYWxlc2ZvcmNlIG9iamVjdCBkZWZpbml0aW9ucyBhcmUgY29udmVydGVkIGludG8gZW1iZXJcblx0Ly8gbW9kZWxzLlxuXHQvL1xuXHQvLyBVc2UgdGhpcyBtZXRob2QgdG8gY3JlYXRlIGEgc3RhdGljIGRlZmluaXRpb24gb2YgdGhlIG9iamVjdHMgeW91IHVzZSBpbiB5b3VyIGFwcCBzbyB0aGF0IHlvdSBkb24ndCBoYXZlXG5cdC8vIHRvIGR5bmFtaWNhbGx5IHJlY3JlYXRlIGl0IGV2ZXJ5IHRpbWUsIHdoaWNoIGlzIHNsb3csIHJlcXVpcmVzIHRoZSB1c2Ugb2YgYSBjYWxsYmFjayBhbmQgcHJldmVudHNcblx0Ly8gcHJvcGVyIHJvdXRlIGhhbmRsaW5nIHdoZW4geW91IGxhbmQgb24gdGhlIHBhZ2UvaW5pdGlhbGlzZSB0aGUgYXBwLlxuXHRjcmVhdGVFbWJlck1vZGVsRGVmaW5pdGlvbnM6IGZ1bmN0aW9uIGNyZWF0ZUVtYmVyTW9kZWxEZWZpbml0aW9ucyhzT2JqZWN0TWV0YU1hcCwgc09iamVjdFJlYWRlciwgdHlwZUZpbHRlcikge1xuXHRcdHZhciBtb2RlbEV4dGVuc2lvbk1hcCA9IHt9O1xuXHRcdHZhciBjYWNoZSA9IG5ldyBTRi5mYWN0b3J5LkNhY2hlKCk7XG5cblx0XHRmb3IgKHZhciBzT2JqZWN0TmFtZSBpbiBzT2JqZWN0TWV0YU1hcCkge1xuXHRcdFx0aWYgKHR5cGVGaWx0ZXIgJiYgIXR5cGVGaWx0ZXIoc09iamVjdE1ldGFNYXBbc09iamVjdE5hbWVdKSkgY29udGludWU7XG5cdFx0XHRTRi5yZWNvcmRJbnZlcnNlcyhzT2JqZWN0TmFtZSwgc09iamVjdFJlYWRlciwgY2FjaGUsIHR5cGVGaWx0ZXIpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIHNPYmplY3ROYW1lIGluIHNPYmplY3RNZXRhTWFwKSB7XG5cdFx0XHRpZiAodHlwZUZpbHRlciAmJiAhdHlwZUZpbHRlcihzT2JqZWN0TWV0YU1hcFtzT2JqZWN0TmFtZV0pKSBjb250aW51ZTtcblx0XHRcdHZhciBtb2RlbEV4dGVuc2lvbiA9IHt9O1xuXHRcdFx0bW9kZWxFeHRlbnNpb25NYXBbc09iamVjdE5hbWVdID0gbW9kZWxFeHRlbnNpb247XG5cdFx0XHRTRi5jcmVhdGVGaWVsZE1vZGVsRm9yU09iamVjdChtb2RlbEV4dGVuc2lvbiwgc09iamVjdE5hbWUsIHNPYmplY3RSZWFkZXIsIGNhY2hlLCB0eXBlRmlsdGVyKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBzT2JqZWN0TmFtZSBpbiBzT2JqZWN0TWV0YU1hcCkge1xuXHRcdFx0aWYgKHR5cGVGaWx0ZXIgJiYgIXR5cGVGaWx0ZXIoc09iamVjdE1ldGFNYXBbc09iamVjdE5hbWVdKSkgY29udGludWU7XG5cdFx0XHR2YXIgbW9kZWxFeHRlbnNpb24gPSBtb2RlbEV4dGVuc2lvbk1hcFtzT2JqZWN0TmFtZV07XG5cdFx0XHRTRi5jcmVhdGVSZWxhdGlvbnNoaXBNb2RlbEZvclNPYmplY3QobW9kZWxFeHRlbnNpb24sIHNPYmplY3ROYW1lLCBzT2JqZWN0UmVhZGVyLCBjYWNoZSwgdHlwZUZpbHRlcik7XG5cdFx0fVxuXHRcdHJldHVybiBtb2RlbEV4dGVuc2lvbk1hcDtcblx0fSxcblx0Ly8gVGhlIGZpcnN0IHN0YWdlIG9mIGNyZWF0aW5nIHRoZSBlbWJlciBtb2RlbCBkZWZpbml0aW9ucy4gVGhlIG1vZGVsIGRlZmluaXRpb24gY3JlYXRpb24gbmVlZHMgdG8gYmUgZGl2aWRlZFxuXHQvLyBpbnRvIHRocmVlIHBoYXNlcyBkdWUgc28gdGhhdCB0aGUgcmVsYXRpb25zaGlwcyBiZXR3ZWVuIG9iamVjdHMgY2FuIGJlIHByb3Blcmx5IGRlZmluZWQuXG5cdC8vIEkuZS4gZmlyc3QgdGhlIGludmVyc2VzIGJldHdlZW4gcmVsYXRpb25zaGlwcyB0aGVuIHRoZSBmaWVsZCBkZWZpbml0aW9ucyBhbmQgdGhlbiB0aGUgcmVsYXRpb25zaGlwIGRlZmluaXRpb25zXG5cdC8vIHdoaWNoIG5lZWQgdGhlIGZpZWxkIGRlZmluaXRpb25zLlxuXHQvL1xuXHQvLyBTZWUgY3JlYXRlTW9kZWxzRm9yU09iamVjdHMgbWV0aG9kIGZvciB0aGUgdHlwZUZpbHRlciBkZWZpbml0aW9uLiBJZiB0aGUgdHlwZUZpbHRlciBpc24ndCB1c2VkIGFsbCB0aGVcblx0Ly8gc2FsZXNmb3JjZSBvYmplY3QgZGVmaW5pdGlvbnMgYXJlIGNvbnZlcnRlZCBpbnRvIGVtYmVyIG1vZGVscy5cblx0cmVjb3JkSW52ZXJzZXM6IGZ1bmN0aW9uIHJlY29yZEludmVyc2VzKHNPYmplY3ROYW1lLCBzT2JqZWN0UmVhZGVyLCBjYWNoZSwgdHlwZUZpbHRlcikge1xuXHRcdHZhciByZWxWaXNpdG9yID0gZnVuY3Rpb24gcmVsVmlzaXRvcihyZWwsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdFx0XHRpZiAodHlwZW9mIHJlbC5yZWxhdGlvbnNoaXBOYW1lID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgcmVsLmNoaWxkU09iamVjdCA9PT0gJ3VuZGVmaW5lZCcgfHwgY2FjaGUuaXNSZWZlcmVuY2VkQnlNdWx0aXR5cGVkUmVmZXJlbmNlKHJlbCkpIHJldHVybjtcblx0XHRcdGlmICh0eXBlRmlsdGVyICYmICF0eXBlRmlsdGVyKHNPYmplY3RSZWFkZXIuY29tcGxldGVNZXRhc1tyZWwuY2hpbGRTT2JqZWN0XSkpIHJldHVybjtcblx0XHRcdGNhY2hlLmxvZ0ludmVyc2VzKHNPYmplY3ROYW1lLCByZWwucmVsYXRpb25zaGlwTmFtZSwgcmVsLmZpZWxkKTtcblx0XHR9O1xuXG5cdFx0dmFyIG9iaiA9IHNPYmplY3RSZWFkZXIuY29tcGxldGVNZXRhc1tzT2JqZWN0TmFtZV07XG5cdFx0c09iamVjdFJlYWRlci5zaGFsbG93UmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHNBYnIob2JqLCByZWxWaXNpdG9yKTtcblx0fSxcblx0Ly8gVGhlIHNlY29uZCBzdGFnZSBvZiBjcmVhdGluZyB0aGUgZW1iZXIgbW9kZWwgZGVmaW5pdGlvbnMuIFRoZSBtb2RlbCBkZWZpbml0aW9uIGNyZWF0aW9uIG5lZWRzIHRvIGJlIGRpdmlkZWRcblx0Ly8gaW50byB0aHJlZSBwaGFzZXMgZHVlIHNvIHRoYXQgdGhlIHJlbGF0aW9uc2hpcHMgYmV0d2VlbiBvYmplY3RzIGNhbiBiZSBwcm9wZXJseSBkZWZpbmVkLlxuXHQvLyBJLmUuIGZpcnN0IHRoZSBpbnZlcnNlcyBiZXR3ZWVuIHJlbGF0aW9uc2hpcHMgdGhlbiB0aGUgZmllbGQgZGVmaW5pdGlvbnMgYW5kIHRoZW4gdGhlIHJlbGF0aW9uc2hpcCBkZWZpbml0aW9uc1xuXHQvLyB3aGljaCBuZWVkIHRoZSBmaWVsZCBkZWZpbml0aW9ucy5cblx0Ly9cblx0Ly8gU2VlIGNyZWF0ZU1vZGVsc0ZvclNPYmplY3RzIG1ldGhvZCBmb3IgdGhlIHR5cGVGaWx0ZXIgZGVmaW5pdGlvbi4gSWYgdGhlIHR5cGVGaWx0ZXIgaXNuJ3QgdXNlZCBhbGwgdGhlXG5cdC8vIHNhbGVzZm9yY2Ugb2JqZWN0IGRlZmluaXRpb25zIGFyZSBjb252ZXJ0ZWQgaW50byBlbWJlciBtb2RlbHMuXG5cdGNyZWF0ZUZpZWxkTW9kZWxGb3JTT2JqZWN0OiBmdW5jdGlvbiBjcmVhdGVGaWVsZE1vZGVsRm9yU09iamVjdChtb2RlbEV4dGVuc2lvbiwgc09iamVjdE5hbWUsIHNPYmplY3RSZWFkZXIsIGNhY2hlLCB0eXBlRmlsdGVyKSB7XG5cdFx0dmFyIGZpZWxkVmlzaXRvciA9IGZ1bmN0aW9uIGZpZWxkVmlzaXRvcihmaWVsZCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0XHRcdHZhciBmbiA9IGZpZWxkLm5hbWU7XG5cdFx0XHR2YXIgdXBkYXRlYWJsZSA9IGZpZWxkLnVwZGF0ZWFibGUgPT09ICd0cnVlJztcblx0XHRcdGlmICghdXBkYXRlYWJsZSkgY2FjaGUubG9nTm9uVXBkYXRlYWJsZUZpZWxkKHNPYmplY3ROYW1lLCBmbik7XG5cdFx0XHRpZiAoZmllbGQudHlwZSA9PT0gJ3JlZmVyZW5jZScpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBmaWVsZC5yZWZlcmVuY2VUbyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHR2YXIgZXJlZnMgPSBmaWVsZC5yZWZlcmVuY2VUbztcblx0XHRcdFx0XHRpZiAodHlwZUZpbHRlciAmJiAhdHlwZUZpbHRlcihzT2JqZWN0UmVhZGVyLmNvbXBsZXRlTWV0YXNbZXJlZnNdKSkge1xuXHRcdFx0XHRcdFx0bW9kZWxFeHRlbnNpb25bZm5dID0gXCJ0aGlzLkRTLmF0dHIoJ3N0cmluZycsIHt1cGRhdGVhYmxlIDogXCIgKyB1cGRhdGVhYmxlICsgXCJ9KVwiO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoZmllbGQuY3VzdG9tID09ICd0cnVlJykgZXJlZnMgPSBTRi5lbWJlcmlzZU5hbWUoZXJlZnMpO1xuXHRcdFx0XHRcdHZhciBpbnZlcnNlID0gY2FjaGUuZ2V0SW52ZXJzZShzT2JqZWN0TmFtZSwgZm4pO1xuXHRcdFx0XHRcdGlmIChpbnZlcnNlICE9IG51bGwpIG1vZGVsRXh0ZW5zaW9uW2ZuXSA9IFwidGhpcy5EUy5iZWxvbmdzVG8oJ1wiICsgZXJlZnMgKyBcIicsIHsgYXN5bmMgOiB0cnVlLCB1cGRhdGVhYmxlIDogXCIgKyB1cGRhdGVhYmxlICsgXCIsIGludmVyc2UgOiAnXCIgKyBpbnZlcnNlICsgXCInIH0pXCI7ZWxzZSBtb2RlbEV4dGVuc2lvbltmbl0gPSBcInRoaXMuRFMuYmVsb25nc1RvKCdcIiArIGVyZWZzICsgXCInLCB7IGFzeW5jIDogdHJ1ZSwgdXBkYXRlYWJsZSA6IFwiICsgdXBkYXRlYWJsZSArIFwiLCBpbnZlcnNlIDogbnVsbCB9KVwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZmllbGQucmVmZXJlbmNlVG8pKSB7XG5cdFx0XHRcdFx0Y2FjaGUubG9nTXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkKHNPYmplY3ROYW1lLCBmbik7XG5cdFx0XHRcdFx0bW9kZWxFeHRlbnNpb25bZm5dID0gXCJ0aGlzLkRTLmF0dHIoJ3N0cmluZycsIHsgbXVsdGlSZWYgOiB0cnVlLCB1cGRhdGVhYmxlIDogXCIgKyB1cGRhdGVhYmxlICsgXCIgfSlcIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL2NhY2hlLmxvZ011bHRpdHlwZWRSZWZlcmVuY2VGaWVsZChzT2JqZWN0TmFtZSwgZm4pXG5cdFx0XHRcdFx0bW9kZWxFeHRlbnNpb25bZm5dID0gXCJ0aGlzLkRTLmF0dHIoJ3N0cmluZycsIHt1cGRhdGVhYmxlIDogXCIgKyB1cGRhdGVhYmxlICsgXCJ9KVwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGZuICE9PSAnSWQnKSBtb2RlbEV4dGVuc2lvbltmbl0gPSBcInRoaXMuRFMuYXR0cignXCIgKyBTRi5zZm9yY2VUb0VtYmVyVHlwZU1hcFtmaWVsZC50eXBlXSArIFwiJywge3VwZGF0ZWFibGUgOiBcIiArIHVwZGF0ZWFibGUgKyBcIn0pXCI7XG5cdFx0XHRjb25zb2xlLmxvZyhzT2JqZWN0UmVhZGVyLmNvbXBsZXRlTWV0YXMubGVuZ3RoICsgJyA6IGZpZWxkIDogJyArIGZuKTtcblx0XHR9O1xuXG5cdFx0dmFyIG9iaiA9IHNPYmplY3RSZWFkZXIuY29tcGxldGVNZXRhc1tzT2JqZWN0TmFtZV07XG5cdFx0c09iamVjdFJlYWRlci5zaGFsbG93UmVhZE1ldGFGaWVsZHNBYnIob2JqLCBmaWVsZFZpc2l0b3IpO1xuXHR9LFxuXHQvLyBUaGUgdGhpcmUgc3RhZ2Ugb2YgY3JlYXRpbmcgdGhlIGVtYmVyIG1vZGVsIGRlZmluaXRpb25zLiBUaGUgbW9kZWwgZGVmaW5pdGlvbiBjcmVhdGlvbiBuZWVkcyB0byBiZSBkaXZpZGVkXG5cdC8vIGludG8gdGhyZWUgcGhhc2VzIGR1ZSBzbyB0aGF0IHRoZSByZWxhdGlvbnNoaXBzIGJldHdlZW4gb2JqZWN0cyBjYW4gYmUgcHJvcGVybHkgZGVmaW5lZC5cblx0Ly8gSS5lLiBmaXJzdCB0aGUgaW52ZXJzZXMgYmV0d2VlbiByZWxhdGlvbnNoaXBzIHRoZW4gdGhlIGZpZWxkIGRlZmluaXRpb25zIGFuZCB0aGVuIHRoZSByZWxhdGlvbnNoaXAgZGVmaW5pdGlvbnNcblx0Ly8gd2hpY2ggbmVlZCB0aGUgZmllbGQgZGVmaW5pdGlvbnMuXG5cdC8vXG5cdC8vIFNlZSBjcmVhdGVNb2RlbHNGb3JTT2JqZWN0cyBtZXRob2QgZm9yIHRoZSB0eXBlRmlsdGVyIGRlZmluaXRpb24uIElmIHRoZSB0eXBlRmlsdGVyIGlzbid0IHVzZWQgYWxsIHRoZVxuXHQvLyBzYWxlc2ZvcmNlIG9iamVjdCBkZWZpbml0aW9ucyBhcmUgY29udmVydGVkIGludG8gZW1iZXIgbW9kZWxzLlxuXHRjcmVhdGVSZWxhdGlvbnNoaXBNb2RlbEZvclNPYmplY3Q6IGZ1bmN0aW9uIGNyZWF0ZVJlbGF0aW9uc2hpcE1vZGVsRm9yU09iamVjdChtb2RlbEV4dGVuc2lvbiwgc09iamVjdE5hbWUsIHNPYmplY3RSZWFkZXIsIGNhY2hlLCB0eXBlRmlsdGVyKSB7XG5cdFx0dmFyIHJlbFZpc2l0b3IgPSBmdW5jdGlvbiByZWxWaXNpdG9yKHJlbCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0XHRcdGlmICh0eXBlb2YgcmVsLnJlbGF0aW9uc2hpcE5hbWUgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiByZWwuY2hpbGRTT2JqZWN0ID09PSAndW5kZWZpbmVkJyB8fCBjYWNoZS5pc1JlZmVyZW5jZWRCeU11bHRpdHlwZWRSZWZlcmVuY2UocmVsKSkgcmV0dXJuO1xuXHRcdFx0aWYgKHR5cGVGaWx0ZXIgJiYgIXR5cGVGaWx0ZXIoc09iamVjdFJlYWRlci5jb21wbGV0ZU1ldGFzW3JlbC5jaGlsZFNPYmplY3RdKSkgcmV0dXJuO1xuXHRcdFx0dmFyIHJuID0gcmVsLnJlbGF0aW9uc2hpcE5hbWU7XG5cdFx0XHR2YXIgZWNvbiA9IFNGLmVtYmVyaXNlTmFtZShyZWwuY2hpbGRTT2JqZWN0KTtcblx0XHRcdG1vZGVsRXh0ZW5zaW9uW3JuXSA9IFwidGhpcy5EUy5oYXNNYW55KCdcIiArIGVjb24gKyBcIicsIHsgYXN5bmMgOiB0cnVlLCBpbnZlcnNlIDogJ1wiICsgcmVsLmZpZWxkICsgXCInLCB9KVwiO1xuXHRcdFx0Y29uc29sZS5sb2coJ2NoaWxkIHJlbCA6ICcgKyBybik7XG5cdFx0fTtcblxuXHRcdHZhciBvYmogPSBzT2JqZWN0UmVhZGVyLmNvbXBsZXRlTWV0YXNbc09iamVjdE5hbWVdO1xuXHRcdHNPYmplY3RSZWFkZXIuc2hhbGxvd1JlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzQWJyKG9iaiwgcmVsVmlzaXRvcik7XG5cdH0sXG5cdC8vIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBzb3FsIHNlbGVjdCBzdGF0ZW1lbnQgc3RyaW5nIHRvIHF1ZXJ5IGFuIG9iamVjdCB3aXRoIGl0cyBmaWVsZHMgYW5kIHJlbGF0aW9uc2hpcHNcblx0Ly8gdXNpbmcgdGhlIHNhbGVzZm9yY2Ugc29hcCBhcGkgLSBpLmUtIHNmb3JjZS5jb25uZWN0aW9uLnF1ZXJ5XG5cdGNyZWF0ZVNvcWxTZWxlY3Q6IGZ1bmN0aW9uIGNyZWF0ZVNvcWxTZWxlY3QodHlwZSwgbmFtZSwgd2hlcmVDbGF1c2UsIGNoaWxkU2VsZWN0Q3JlYXRvcikge1xuXHRcdHZhciBxID0gJ3NlbGVjdCBJZCc7XG5cdFx0dHlwZS5lYWNoQXR0cmlidXRlKGZ1bmN0aW9uIChuYW1lLCBtZXRhKSB7XG5cdFx0XHRxICs9ICcsICcgKyBuYW1lO1xuXHRcdH0pO1xuXHRcdHR5cGUuZWFjaFJlbGF0aW9uc2hpcChmdW5jdGlvbiAobmFtZSwgZGVzY3JpcHRvcikge1xuXHRcdFx0cSArPSAnLCAnO1xuXHRcdFx0aWYgKGRlc2NyaXB0b3Iua2luZCA9PT0gJ2hhc01hbnknKSBxICs9ICcoJyArIGNoaWxkU2VsZWN0Q3JlYXRvcihkZXNjcmlwdG9yLnR5cGUsIGRlc2NyaXB0b3Iua2V5KSArICcpJztlbHNlIHEgKz0gZGVzY3JpcHRvci5rZXk7XG5cdFx0fSk7XG5cdFx0cSArPSAnIGZyb20gJyArIG5hbWU7XG5cdFx0aWYgKCEodHlwZW9mIHdoZXJlQ2xhdXNlID09PSAndW5kZWZpbmVkJykpIHEgKz0gJyB3aGVyZSAnICsgd2hlcmVDbGF1c2U7XG5cdFx0cmV0dXJuIHE7XG5cdH0sXG5cdC8vIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgY3JlYXRpbmcgYSBzb3FsIHNlbGVjdCBzdGF0ZW1lbnQuIEl0IGhhbmRsZXMgdGhlIHJvb3Qgc2VsZWN0IHN0YXRlbWVudCBnZW5lcmF0aW9uLFxuXHQvLyBub3QgdGhlIGNoaWxkIHJlbGF0aW9uc2hpcCBzdGF0ZW1lbnQgZ2VuZXJhdGlvblxuXHRjcmVhdGVSb290U29xbFNlbGVjdDogZnVuY3Rpb24gY3JlYXRlUm9vdFNvcWxTZWxlY3QodHlwZSwgbmFtZSwgd2hlcmVDbGF1c2UpIHtcblx0XHRyZXR1cm4gU0YuY3JlYXRlU29xbFNlbGVjdCh0eXBlLCBuYW1lLCB3aGVyZUNsYXVzZSwgU0YuY3JlYXRlSWRTb3FsU2VsZWN0KTtcblx0fSxcblx0Ly8gQ2hpbGQgcmVsYXRpb25zaGlwcyBhcmUgcGFzc2VkIHRvIGVtYmVyIGFzIGEgbGlzdCBvZiBpZHMgaW4gdGhlIHBheWxvYWQuIFRoaXMgbWV0aG9kIGlzIGZvciBjaGlsZFxuXHQvLyByZWxhdGlvbnNoaXAgc2VsZWN0IHN0YXRlbWVudCBnZW5lcmF0aW9uLlxuXHRjcmVhdGVJZFNvcWxTZWxlY3Q6IGZ1bmN0aW9uIGNyZWF0ZUlkU29xbFNlbGVjdCh0eXBlLCBuYW1lLCB3aGVyZUNsYXVzZSkge1xuXHRcdHZhciBxID0gJ3NlbGVjdCBJZCBmcm9tICcgKyBuYW1lO1xuXHRcdGlmICghKHR5cGVvZiB3aGVyZUNsYXVzZSA9PT0gJ3VuZGVmaW5lZCcpKSBxICs9ICcgd2hlcmUgJyArIHdoZXJlQ2xhdXNlO1xuXHRcdHJldHVybiBxO1xuXHR9LFxuXHQvLyBJbiBhIHNvcWwgc2VsZWN0IHN0YXRlbWVudCBhbiBhcnJheSBkb2Vzbid0IGxvb2sgbGlrZSBhIHNlcmlhbGlzZWQgamF2YXNjcmlwdCBhcnJheS4gVGhpcyBtZXRob2Rcblx0Ly8gaGFuZGxlcyB0aGUgY29udmVyc2lvbi5cblx0Ly9cblx0Ly8gWzEsMixcImhlbGxvIHdvcmxkXCJdID0+ICgxLDIsXCJoZWxsbyB3b3JsZFwiKVxuXHR0b1NvcWxBcnJheTogZnVuY3Rpb24gdG9Tb3FsQXJyYXkoYXJyYXkpIHtcblx0XHR2YXIgc29xbEFyeSA9IFwiKFwiO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChpID4gMCkgc29xbEFyeSArPSBcIiwnXCI7ZWxzZSBzb3FsQXJ5ICs9IFwiJ1wiO1xuXHRcdFx0c29xbEFyeSArPSBhcnJheVtpXSArIFwiJ1wiO1xuXHRcdH1cblx0XHRzb3FsQXJ5ICs9IFwiKVwiO1xuXHRcdHJldHVybiBzb3FsQXJ5O1xuXHR9LFxuXHQvLyBTYWxlc2ZvcmNlLCBuYXR1cmFsbHkgZG9lc24ndCByZXR1cm4gaXQncyByZXN1bHRzIGluIHRoZSBmb3JtYXQgdGhhdCB0aGUgZW1iZXIgcmVzdCBhZGFwdGVyIHdvdWxkIGxpa2UuXG5cdC8vIFRoaXMgbWV0aG9kIHJlZm9ybWF0cyBhIHNhbGVzZm9yY2UgcGF5bG9hZCBpbnRvIGFuIGVtYmVyIHBheWxvYWQuXG5cdGZvcm1hdFBheWxvYWQ6IGZ1bmN0aW9uIGZvcm1hdFBheWxvYWQodHlwZSwgcGwpIHtcblx0XHR2YXIgZm9ybWF0dGVkUGwgPSB7fTtcblx0XHR2YXIgcGx1cmFsID0gdGhpcy5FbWJlci5JbmZsZWN0b3IuaW5mbGVjdG9yLnBsdXJhbGl6ZSh0eXBlLm1vZGVsTmFtZSk7XG5cdFx0cGx1cmFsID0gdGhpcy5FbWJlci5TdHJpbmcuZGFzaGVyaXplKHBsdXJhbCk7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocGwucmVjb3JkcykpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGwucmVjb3Jkcy5sZW5ndGg7IGkrKykgU0YuZm9ybWF0UmVjb3JkKHBsLnJlY29yZHNbaV0pO1xuXHRcdFx0Zm9ybWF0dGVkUGxbcGx1cmFsXSA9IHBsLnJlY29yZHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdFNGLmZvcm1hdFJlY29yZChwbC5yZWNvcmRzKTtcblx0XHRcdGZvcm1hdHRlZFBsW3BsdXJhbF0gPSBbcGwucmVjb3Jkc107XG5cdFx0fVxuXHRcdHJldHVybiBmb3JtYXR0ZWRQbDtcblx0fSxcblx0Ly8gVGhpcyBpcyBhIHN1YiBtZXRob2QgdG8gZm9ybWF0UGF5bG9hZC4gSXQgZm9ybWF0cyBhIHNpbmdsZSByZWNvcmQgcmVzdWx0IHJldHVybmVkIGJ5IHNhbGVzZm9yY2Vcblx0Ly8gaW50byBhIHBheWxvYWQgZXhwZWN0ZWQgYnkgdGhlIGVtYmVyIHJlc3QgYWRhcHRlci5cblx0Zm9ybWF0UmVjb3JkOiBmdW5jdGlvbiBmb3JtYXRSZWNvcmQocmVjKSB7XG5cdFx0aWYgKCFyZWMpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdyZWMgaXMgdW5kZWZpbmVkJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGZvciAodmFyIGZpZWxkTmFtZSBpbiByZWMpIHtcblx0XHRcdHZhciBmaWVsZCA9IHJlY1tmaWVsZE5hbWVdO1xuXHRcdFx0aWYgKGZpZWxkICE9IG51bGwgJiYgISh0eXBlb2YgZmllbGQucmVjb3JkcyA9PT0gJ3VuZGVmaW5lZCcpKSByZWNbZmllbGROYW1lXSA9IFNGLmZvcm1hdFRvSWRBcnJheShmaWVsZC5yZWNvcmRzKTtcblx0XHR9XG5cdFx0aWYgKCEodHlwZW9mIHJlYy5JZCA9PT0gJ3VuZGVmaW5lZCcpKSB7XG5cdFx0XHRyZWMuaWQgPSByZWMuSWQ7XG5cdFx0XHRkZWxldGUgcmVjLklkO1xuXHRcdH1cblx0fSxcblx0Ly8gVGhpcyBpcyBhIHN1YiBtZXRob2QgdG8gZm9ybWF0UmVjb3JkLiBJdCBmb3JtYXRzIGEgY2hpbGQgcmVsYXRpb25zaGlwIHJlc3VsdCwgcmV0dXJuZWQgd2l0aGluIGEgcmVjb3JkXG5cdC8vIHJlc3VsdCwgaW50byBhbiBpZCBhcnJheSBleHBlY3RlZCBieSB0aGUgZW1iZXIgcmVzdCBhZGFwdGVyLlxuXHRmb3JtYXRUb0lkQXJyYXk6IGZ1bmN0aW9uIGZvcm1hdFRvSWRBcnJheShyZWNvcmRzKSB7XG5cdFx0dmFyIGlkQXJyID0gW107XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocmVjb3JkcykpIGZvciAodmFyIGkgPSAwOyBpIDwgcmVjb3Jkcy5sZW5ndGg7IGkrKykgaWRBcnIucHVzaChyZWNvcmRzW2ldLklkKTtlbHNlIGlkQXJyLnB1c2gocmVjb3Jkcy5JZCk7XG5cdFx0cmV0dXJuIGlkQXJyO1xuXHR9LFxuXHQvLyBUaGlzIG1ldGhvZCBmb3JtYXRzIGFuIGVtYmVyIFNuYXBzaG90IG9iamVjdCwgaW50byBhIGphdmFzY3JpcHQgcmVwcmVzZW50YXRpb24gb2YgYW4gU09iamVjdCwgcmVhZHkgZm9yXG5cdC8vIHNlbmRpbmcgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgc2FsZXNmb3JjZSBzb2FwIGFwaSBpLmUuIHNmb3JjZS5jb25uZWN0aW9uLmNyZWF0ZS91cGRhdGVcblx0c2ZGb3JtYXRTbmFwc2hvdDogZnVuY3Rpb24gc2ZGb3JtYXRTbmFwc2hvdChzbmFwc2hvdCwgdHlwZSkge1xuXHRcdHZhciBzZk5hbWUgPSBTRi5zZnJpc2VOYW1lKHR5cGUubW9kZWxOYW1lKTtcblx0XHR2YXIgc28gPSBuZXcgdGhpcy5zZm9yY2UuU09iamVjdChzZk5hbWUpO1xuXHRcdGlmIChzbmFwc2hvdC5pZCAhPSBudWxsKSBzby5JZCA9IHNuYXBzaG90LmlkO1xuXHRcdHNuYXBzaG90LmVhY2hBdHRyaWJ1dGUoZnVuY3Rpb24gKG5hbWUsIG1ldGEpIHtcblx0XHRcdHZhciBtZXRhT3B0aW9ucyA9IHR5cGUubWV0YUZvclByb3BlcnR5KG5hbWUpLm9wdGlvbnM7XG5cdFx0XHRpZiAobWV0YU9wdGlvbnMudXBkYXRlYWJsZSkgc29bbmFtZV0gPSBzbmFwc2hvdC5hdHRyKG5hbWUpO1xuXHRcdH0pO1xuXHRcdHNuYXBzaG90LmVhY2hSZWxhdGlvbnNoaXAoZnVuY3Rpb24gKG5hbWUsIG1ldGEpIHtcblx0XHRcdGlmIChtZXRhLmtpbmQgPT09ICdiZWxvbmdzVG8nKSB7XG5cdFx0XHRcdHZhciBtZXRhT3B0aW9ucyA9IHR5cGUubWV0YUZvclByb3BlcnR5KG5hbWUpLm9wdGlvbnM7XG5cdFx0XHRcdGlmIChtZXRhT3B0aW9ucy51cGRhdGVhYmxlKSBzb1tuYW1lXSA9IHNuYXBzaG90LmJlbG9uZ3NUbyhuYW1lLCB7IGlkOiB0cnVlIH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBzbztcblx0fSxcblx0Ly8gVGhpcyBpcyB0aGUgZ2VuZXJhbCBxdWVyeSBtZXRob2QgdXNlZCB0byBleGVjdXRlIGEgc29hcCBhcGkgcXVlcnkgdG8gYSBzYWxlc2ZvcmNlIG9yZy5cblx0Ly8gU2VlOiBzZm9yY2UuY29ubmVjdGlvbi5xdWVyeShxLCBjYlN1Y2Nlc3MsIGNiRXJyKTtcblx0cXVlcnk6IGZ1bmN0aW9uIHF1ZXJ5KHN0b3JlLCB0eXBlLCBfcXVlcnksIGNiU3VjY2VzcywgY2JFcnIpIHtcblx0XHR2YXIgcSA9IG51bGw7XG5cdFx0dHJ5IHtcblx0XHRcdHZhciBzZk5hbWUgPSBTRi5zZnJpc2VOYW1lKHR5cGUubW9kZWxOYW1lKTtcblx0XHRcdHEgPSBTRi5jcmVhdGVSb290U29xbFNlbGVjdCh0eXBlLCBzZk5hbWUsIF9xdWVyeSk7XG5cdFx0XHR0aGlzLnNmb3JjZS5jb25uZWN0aW9uLnF1ZXJ5KHEsIGNiU3VjY2VzcywgY2JFcnIpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKHEpO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH0sXG5cdC8vIFRoaXMgaXMgYW4gaW5pdGlhbGlzYXRpb24gbWV0aG9kIHRvIGR5bmFtaWNhbGx5IGNyZWF0ZSB0aGUgZW1iZXIgbW9kZWxzLCB1c2VkIGJ5IGFuIGVtYmVyIGFwcCwgYnlcblx0Ly8gcmVhZGluZyB0aGUgc2FsZXNmb3JjZSBzY2hlbWEgdmlhIHRoZSBzYWxlc2ZvcmNlIHNvYXAgYXBpLiBJZiB0aGlzIGluaXRpYWxpc2F0aW9uIG1ldGhvZCBpcyB1c2VkLFxuXHQvLyBhcHAgaW5pdGlhbGlzYXRpb24gc2hvdWxkIGhhcHBlbiBpbiB0aGUgY2FsbGJhY2s6IGNiXG5cdC8vXG5cdC8vIFRoZSBvYmpOYW1lcyBwYXJhbWV0ZXIgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggc2FsZXNmb3JjZSB0eXBlcy9vYmplY3RzIHlvdSB3YW50IHRvIGNyZWF0ZVxuXHQvLyBlbWJlciBtb2RlbHMgZm9yLiBJZiB5b3Ugb21pdCB0aGlzIHBhcmFtZXRlciwgbW9kZWxzIHdpbGwgYmUgY3JlYXRlZCBmb3IgYWxsIHR5cGVzL29iamVjdHNcblx0Y3JlYXRlRW1iZXJNb2RlbHM6IGZ1bmN0aW9uIGNyZWF0ZUVtYmVyTW9kZWxzKG9wdHMpIHtcblx0XHR2YXIgY29ubmVjdGlvbiA9IG9wdHMuY29ubmVjdGlvbixcblx0XHQgICAgY2IgPSBvcHRzLmNiLFxuXHRcdCAgICBvYmpOYW1lcyA9IG9wdHMub2JqTmFtZXM7XG5cdFx0dmFyIG93bmVyID0gb3B0cy5vd25lciA/IG9wdHMub3duZXIgOiB7fTtcblxuXHRcdHZhciB3ID0gbmV3IF9zYWxlc2ZvcmNlU2NoZW1hUmVhZGVyMlsnZGVmYXVsdCddKGNvbm5lY3Rpb24sIDEwMCwgZnVuY3Rpb24gKCkge1xuXHRcdFx0U0YuY3JlYXRlTW9kZWxzRm9yU09iamVjdHMob3duZXIsIHcuY29tcGxldGVNZXRhcywgdywgdHlwZUZpbHRlcik7XG5cdFx0XHRjYihvd25lcik7XG5cdFx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0Y2IobnVsbCwgJ0ZhaWxlZCB0byBmZXRjaCBzYWxlc2ZvcmNlIHNjaGVtYSBkZWZpbml0aW9ucyBmb3IgdGhlIHByb3ZpZGVkIG9iamVjdCBuYW1lcycpO1xuXHRcdH0sIG9iak5hbWVzKTtcblx0fVxufTtcblxuLy8gVGhpcyBpcyBhbiBpbml0aWFsaXNhdGlvbiBtZXRob2QgZm9yIGNyZWF0aW5nIHRoZSBlbWJlciBtb2RlbCBkZWZpbml0aW9ucyBhbmQgZG93bmxvYWRpbmcgdGhlbSBpbiBhXG4vLyBzZXJpYWxpc2VkIGpzIG9iamVjdC4gT25jZSB0aGUgc3RhdGljIGpzIG9iamVjdCBoYXMgYmVlbiBjcmVhdGVkIGl0IGNhbiBiZSB1c2VkIHRvIGluaXRpYWxpc2Vcbi8vIHRoZSBtb2RlbHMgYnkgdXNpbmcgdGhlIGNyZWF0ZU1vZGVsc0Zyb21FeHRlbnNpb25NYXAgbWV0aG9kLiBJZiB5b3UgdXNlIHRoaXMgbWV0aG9kIHRvIGluaXRpYWxpc2UsIHlvdXJcbi8vIGFwcCB3aWxsIHN0YXJ0IHVwIGZhc3RlciBhbmQgeW91IHdvbid0IG5lZWQgdG8gaW5pdGlhbGlzZSB5b3VyIGFwcCBpbiBhIGNhbGxiYWNrLiBCZWFyIGluIG1pbmQgdGhhdCBhbnlcbi8vIG1vZGVsIGNoYW5nZXMgb24gc2FsZXNmb3JjZSB3aWxsIG1lYW4gdGhhdCB5b3UnbGwgaGF2ZSB0byByZWdlbmVyYXRlIHRoZSBzZXJpYWxpc2VkIGpzIG9iamVjdCBpbnRvIGEgZmlsZS5cbi8vXG4vLyBTZWUgdGhlIGNyZWF0ZU1vZGVsc0ZvclNPYmplY3RzIG1ldGhvZCBmb3IgdGhlIG9iak5hbWVzIGRlZmluaXRpb24uIElmIG9iak5hbWVzIGlzbid0IHVzZWRcbi8vICAgIC8vIGFsbCB0aGUgc2FsZXNmb3JjZSBvYmplY3QgZGVmaW5pdGlvbnMgYXJlIGNvbnZlcnRlZCBpbnRvIGVtYmVyIG1vZGVscy5cbi8vIGRvd25sb2FkRW1iZXJNb2RlbHModHlwZUZpbHRlcil7XG4vLyBcdHRocm93ICdjdXJyZW50bHkgbm90IGltcGxlbWVudGVkJztcbi8vIFx0dmFyIHcgPSBuZXcgU2NoZW1hUmVhZGVyKDEwMCwgKCkgPT4ge1xuLy8gXHRcdHZhciBzZXJpYWxpc2VkID0gSlNPTi5zdHJpbmdpZnkoU0YuY3JlYXRlRW1iZXJNb2RlbERlZmluaXRpb25zKHcuY29tcGxldGVNZXRhcywgdywgdHlwZUZpbHRlciksIG51bGwsIDEpO1xuLy8gXHRcdHdpbmRvdy5vcGVuKCdkYXRhOnRleHQvcGxhaW4sJyArIGVuY29kZVVSSUNvbXBvbmVudCgndmFyIG1vZGVsRGVmaW5pdGlvbnMgPSAnICsgc2VyaWFsaXNlZCArICc7JykpO1xuLy8gXHR9KTtcbi8vIH0sXG5TRk1vZGVscy5mYWN0b3J5ID0ge1xuXHQvLyBQcm9kdWNlcyBhIGNhY2hlIG9iamVjdCB1c2VkIGluIGNyZWF0aW5nIHRoZSBlbWJlciBtb2RlbCBkZWZpbml0aW9uc1xuXHRDYWNoZTogZnVuY3Rpb24gQ2FjaGUoKSB7XG5cdFx0dGhpcy5ub25VcGRhdGVhYmxlRmllbGRzID0ge307XG5cdFx0dGhpcy5tdWx0aXR5cGVkUmVmZXJlbmNlRmllbGRzID0ge307XG5cdFx0dGhpcy5pbnZlcnNGaWVsZHMgPSB7fTtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHR0aGlzLmxvZ05vblVwZGF0ZWFibGVGaWVsZCA9IGZ1bmN0aW9uIChvYmplY3ROYW1lLCBmaWVsZE5hbWUpIHtcblx0XHRcdHRoYXQubm9uVXBkYXRlYWJsZUZpZWxkc1tvYmplY3ROYW1lLnRvTG93ZXJDYXNlKCkgKyAnLicgKyBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKV0gPSB0cnVlO1xuXHRcdH07XG5cdFx0dGhpcy5pc1VwZGF0ZWFibGVGaWVsZCA9IGZ1bmN0aW9uIChvYmplY3ROYW1lLCBmaWVsZE5hbWUpIHtcblx0XHRcdHJldHVybiAhdGhhdC5ub25VcGRhdGVhYmxlRmllbGRzW29iamVjdE5hbWUudG9Mb3dlckNhc2UoKSArICcuJyArIGZpZWxkTmFtZS50b0xvd2VyQ2FzZSgpXTtcblx0XHR9O1xuXHRcdHRoaXMubG9nTXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkID0gZnVuY3Rpb24gKG9iamVjdE5hbWUsIGZpZWxkTmFtZSkge1xuXHRcdFx0dGhhdC5tdWx0aXR5cGVkUmVmZXJlbmNlRmllbGRzW29iamVjdE5hbWUudG9Mb3dlckNhc2UoKSArICcuJyArIGZpZWxkTmFtZS50b0xvd2VyQ2FzZSgpXSA9IHRydWU7XG5cdFx0fTtcblx0XHR0aGlzLmlzTXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkID0gZnVuY3Rpb24gKG9iamVjdE5hbWUsIGZpZWxkTmFtZSkge1xuXHRcdFx0cmV0dXJuIHRoYXQubXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkc1tvYmplY3ROYW1lLnRvTG93ZXJDYXNlKCkgKyAnLicgKyBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKV07XG5cdFx0fTtcblx0XHR0aGlzLmlzUmVmZXJlbmNlZEJ5TXVsdGl0eXBlZFJlZmVyZW5jZSA9IGZ1bmN0aW9uIChyZWxhdGlvbnNoaXApIHtcblx0XHRcdHJldHVybiB0aGF0LmlzTXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkKHJlbGF0aW9uc2hpcC5jaGlsZFNPYmplY3QsIHJlbGF0aW9uc2hpcC5maWVsZCk7XG5cdFx0fTtcblx0XHR0aGlzLmdldEludmVyc01hcCA9IGZ1bmN0aW9uIChvYmplY3ROYW1lKSB7XG5cdFx0XHR2YXIgbWFwID0gdGhhdC5pbnZlcnNGaWVsZHNbb2JqZWN0TmFtZV07XG5cdFx0XHRpZiAodHlwZW9mIG1hcCA9PT0gJ3VuZGVmaW5lZCcgfHwgbWFwID09IG51bGwpIHtcblx0XHRcdFx0bWFwID0ge307XG5cdFx0XHRcdHRoYXQuaW52ZXJzRmllbGRzW29iamVjdE5hbWVdID0gbWFwO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1hcDtcblx0XHR9O1xuXHRcdHRoaXMubG9nSW52ZXJzZXMgPSBmdW5jdGlvbiAob2JqZWN0TmFtZSwgZmllbGQxTmFtZSwgZmllbGQyTmFtZSkge1xuXHRcdFx0dmFyIG1hcCA9IHRoYXQuZ2V0SW52ZXJzTWFwKG9iamVjdE5hbWUpO1xuXHRcdFx0bWFwW2ZpZWxkMU5hbWVdID0gZmllbGQyTmFtZTtcblx0XHRcdG1hcFtmaWVsZDJOYW1lXSA9IGZpZWxkMU5hbWU7XG5cdFx0fTtcblx0XHR0aGlzLmdldEludmVyc2UgPSBmdW5jdGlvbiAob2JqZWN0TmFtZSwgZmllbGROYW1lKSB7XG5cdFx0XHR2YXIgaW52ZXJzZSA9IHRoYXQuZ2V0SW52ZXJzTWFwKG9iamVjdE5hbWUpW2ZpZWxkTmFtZV07XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGludmVyc2UgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IGludmVyc2U7XG5cdFx0fTtcblx0fVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gU0ZNb2RlbHM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzcyODM2MC9ob3ctZG8taS1jb3JyZWN0bHktY2xvbmUtYS1qYXZhc2NyaXB0LW9iamVjdFxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbnZhciBjbG9uZSA9IGZ1bmN0aW9uIGNsb25lKG9iaikge1xuXHRpZiAobnVsbCA9PSBvYmogfHwgXCJvYmplY3RcIiAhPSB0eXBlb2Ygb2JqKSByZXR1cm4gb2JqO1xuXHR2YXIgY29weSA9IG9iai5jb25zdHJ1Y3RvcigpO1xuXHRmb3IgKHZhciBhdHRyIGluIG9iaikge1xuXHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoYXR0cikpIGNvcHlbYXR0cl0gPSBvYmpbYXR0cl07XG5cdH1cblx0cmV0dXJuIGNvcHk7XG59O1xuXG4vLyBSZXF1aXJlcyBhIHNhbGVzZm9yY2UgY29ubmVjdGlvbiBvYmplY3QsIHVubGVzcyB0aGUgbWV0YWRhdGEgaXMgcGFzc2VkIGRpcmVjdGx5XG4vLyB0byB0aGUgcmVhZGVyLlxuLy8gTGVhdmUgb25TdWNjZXNzIG91dCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBwb3B1bGF0ZSBtZXRhZGF0YSBvbiBjb25zdHJ1Y3Rpb25cbnZhciBTY2hlbWFSZWFkZXIgPSBmdW5jdGlvbiBTY2hlbWFSZWFkZXIoY29ubmVjdGlvbiwgYmF0Y2hTaXplLCBvblN1Y2Nlc3MsIG9uRmFpbHVyZSwgb2JqTmFtZXMpIHtcblx0dGhpcy50eXBlID0gJ1NjaGVtYVJlYWRlcic7XG5cdHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG5cdHRoaXMuaXNGZXRjaGluZyA9IHRydWU7XG5cdHRoaXMuYmF0Y2hTaXplID0gdHlwZW9mIGJhdGNoU2l6ZSA9PSAndW5kZWZpbmVkJyA/IDEwMCA6IGJhdGNoU2l6ZTtcblx0dGhpcy5za2lwRXJyb3JzID0gdHlwZW9mIG9uRmFpbHVyZSA9PSAndW5kZWZpbmVkJyA/IHRydWUgOiBmYWxzZTtcblx0dGhpcy5yZWFkUmVsV2l0aFVkZWZOYW1lcyA9IGZhbHNlO1xuXG5cdGlmICh0eXBlb2Ygb25TdWNjZXNzID09PSAnZnVuY3Rpb24nKSB0aGlzLnBvcHVsYXRlKG9uU3VjY2Vzcywgb25GYWlsdXJlLCBvYmpOYW1lcyk7XG59O1xuXG5TY2hlbWFSZWFkZXIucHJvdG90eXBlID0ge1xuXHRwb3B1bGF0ZTogZnVuY3Rpb24gcG9wdWxhdGUob25TdWNjZXNzLCBvbkZhaWx1cmUsIG9iak5hbWVzKSB7XG5cdFx0dGhpcy5pc0ZldGNoaW5nID0gdHJ1ZTtcblx0XHR0aGlzLnByZU1ldGFzID0gW107XG5cdFx0dGhpcy5jb21wbGV0ZU1ldGFzID0ge307XG5cdFx0dGhpcy5uYW1lQmF0Y2hlcyA9IFtdO1xuXG5cdFx0dmFyIHRocmVhZENvdW50ID0gMDtcblx0XHRpZiAoIW9iak5hbWVzKSB7XG5cdFx0XHR2YXIgcmVzID0gdGhpcy5jb25uZWN0aW9uLmRlc2NyaWJlR2xvYmFsKCk7XG5cdFx0XHR0aGlzLnByZU1ldGFzID0gcmVzLmdldEFycmF5KFwic29iamVjdHNcIik7XG5cdFx0fSBlbHNlIHRoaXMucHJlTWV0YXMgPSBvYmpOYW1lcztcblxuXHRcdC8vIFB1c2ggYmF0Y2hlc1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmVNZXRhcy5sZW5ndGg7KSB7XG5cdFx0XHR2YXIgYmF0Y2ggPSBbXTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBpIDwgdGhpcy5wcmVNZXRhcy5sZW5ndGggJiYgaiA8IHRoaXMuYmF0Y2hTaXplOyBpKyssIGorKykgYmF0Y2gucHVzaCh0aGlzLnByZU1ldGFzW2ldLm5hbWUpO1xuXHRcdFx0dGhpcy5uYW1lQmF0Y2hlcy5wdXNoKGJhdGNoKTtcblx0XHR9XG5cblx0XHR2YXIgZmFpbGVkID0gZmFsc2U7XG5cdFx0dmFyIGhhbmRsZWRGYWlsdXJlID0gZmFsc2U7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHZhciBjYiA9IGZ1bmN0aW9uIGNiKGVycikge1xuXHRcdFx0aWYgKGhhbmRsZWRGYWlsdXJlKSByZXR1cm47XG5cdFx0XHRpZiAoZmFpbGVkKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0XHRcdG9uRmFpbHVyZShlcnIpO1xuXHRcdFx0XHRoYW5kbGVkRmFpbHVyZSA9IHRydWU7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRocmVhZENvdW50LS07XG5cdFx0XHRjb25zb2xlLmxvZyh0aHJlYWRDb3VudCk7XG5cdFx0XHRpZiAodGhyZWFkQ291bnQgPD0gMCkge1xuXHRcdFx0XHR0aGF0LmlzRmV0Y2hpbmcgPSBmYWxzZTtcblx0XHRcdFx0b25TdWNjZXNzKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR2YXIgZmFpbCA9IGZ1bmN0aW9uIGZhaWwoZXJyKSB7XG5cdFx0XHRpZiAoIXRoYXQuc2tpcEVycm9ycykge1xuXHRcdFx0XHRmYWlsZWQgPSB0cnVlO1xuXHRcdFx0XHRvbkZhaWx1cmUoZXJyKTtcblx0XHRcdH0gZWxzZSBjb25zb2xlLmxvZyhlcnIpOyAvLyBDdXJyZW50bHkgb25seSBsb2dnaW5nIHRoZSBlcnJvclxuXHRcdFx0Y2IoZXJyKTtcblx0XHR9O1xuXG5cdFx0Ly8gR2V0IGNvbXBsZXRlIG1ldGFzXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5hbWVCYXRjaGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aHJlYWRDb3VudCsrO1xuXHRcdFx0Y29uc29sZS5sb2coJ0JhdGNoIDogJyArIHRoaXMubmFtZUJhdGNoZXNbaV0pO1xuXHRcdFx0dGhpcy5mZXRjaENvbXBsZXRlTWV0YSh0aGlzLm5hbWVCYXRjaGVzW2ldLCBjYiwgZmFpbCk7XG5cdFx0fVxuXHR9LFxuXHQvLyBSZWFkIHRoZSBhcnJheSBvZiBwcmUgbWV0YXMgYW5kIHBvcHVsYXRlIGNvbXBsZXRlTWV0YXNcblx0ZmV0Y2hDb21wbGV0ZU1ldGE6IGZ1bmN0aW9uIGZldGNoQ29tcGxldGVNZXRhKG9ianMsIHN1Y2Nlc3MsIGZhaWwpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGZldGNoU3VjY2VzcyA9IGZ1bmN0aW9uIGZldGNoU3VjY2VzcyhtZXRhcykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtZXRhcy5sZW5ndGg7IGkrKykgdGhhdC5yZWdpc3Rlck1ldGEobWV0YXNbaV0pO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRmYWlsKGUpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0c3VjY2VzcygpO1xuXHRcdFx0fSAvLyBjYWxsIHRoZSBjYWxsYmFja1xuXHRcdH07XG5cdFx0dGhpcy5jb25uZWN0aW9uLmRlc2NyaWJlU09iamVjdHMob2JqcywgZmV0Y2hTdWNjZXNzLCBmYWlsKTtcblx0fSxcblx0cmVnaXN0ZXJNZXRhOiBmdW5jdGlvbiByZWdpc3Rlck1ldGEob2JqKSB7XG5cdFx0dGhpcy5jb21wbGV0ZU1ldGFzW29iai5uYW1lXSA9IG9iajtcblx0fSxcblx0Ly8gc2VlIGRlZXByZWFkIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRzaGFsbG93UmVhZEZpZWxkczogZnVuY3Rpb24gc2hhbGxvd1JlYWRGaWVsZHModmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGZvciAodmFyIG9iak5hbWUgaW4gdGhpcy5jb21wbGV0ZU1ldGFzKSBpZiAodGhpcy5zaGFsbG93UmVhZE1ldGFGaWVsZHNBYnIodGhpcy5jb21wbGV0ZU1ldGFzW29iak5hbWVdLCB2aXNpdG9yKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHR9LFxuXHQvLyBzZWUgZGVlcHJlYWQgZmllbGRzIGZvciB0aGUgdmlzaXRvciBkZWZpbml0aW9uXG5cdHNoYWxsb3dSZWFkTWV0YUZpZWxkczogZnVuY3Rpb24gc2hhbGxvd1JlYWRNZXRhRmllbGRzKG9iaiwgdmlzaXRlZCwgcGF0aCwgdmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGlmICh0eXBlb2Ygb2JqLmZpZWxkcyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmouZmllbGRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZiA9IG9iai5maWVsZHNbaV07XG5cdFx0XHRpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKSBjb250aW51ZTtcblx0XHRcdHZhciBzdWJQYXRoID0gcGF0aC5jb25jYXQoZik7XG5cdFx0XHQvLyBzdWJQYXRoLnB1c2goZik7XG5cdFx0XHRpZiAodmlzaXRvcihmLCBvYmosIHN1YlBhdGgsIHRoaXMpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0fVxuXHR9LFxuXHQvLyBBbiBhYmJyZXZpYXRpb24gKEFicikgbWV0aG9kIHRvIHNoYWxsb3cgcmVhZCBiZWdpbm5pbmcgd2l0aCB0aGUgcGFzc2VkIG9iamVjdFxuXHQvLyBzZWUgZGVlcHJlYWQgZmllbGRzIGZvciB0aGUgdmlzaXRvciBkZWZpbml0aW9uXG5cdHNoYWxsb3dSZWFkTWV0YUZpZWxkc0FicjogZnVuY3Rpb24gc2hhbGxvd1JlYWRNZXRhRmllbGRzQWJyKG9iaiwgdmlzaXRvcikge1xuXHRcdHJldHVybiB0aGlzLnNoYWxsb3dSZWFkTWV0YUZpZWxkcyhvYmosIHt9LCBbXSwgdmlzaXRvcik7XG5cdH0sXG5cdC8vIHZpc2l0b3IgZGVmaW5pdGlvbjogZnVuY3Rpb24oZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdC8vIFx0XHQvLyByZXR1cm4gJ3Rlcm0nIC8vIGlmIHlvdSB3YW50IHRvIHRlcm1pbmF0ZSB0aGUgc2NoZW1hIHJlYWRcblx0Ly8gfVxuXHQvLyBmaWVsZCA6IHt9IC0gdGhlIGZpZWxkIGRlc2NyaXB0aW9uIHVuZGVyIHJlYWQsXG5cdC8vIG9iamVjdCA6IHt9IC0gdGhlIHNvYmplY3QgZGVzY3JpcHRpb24gdW5kZXIgcmVhZFxuXHQvLyBwYXRoIDogW10gLSBhIGxpc3Qgb2YgZGVzY3JpcHRpb25zIHN0YXJ0aW5nIHdpdGggdGhlIHNvYmplY3QgZGVzY3JpcHRpb24sIHRyYWlsZWQgYnlcblx0Ly9cdFx0XHRcdHJlbGF0aW9uc2hpcCBkZXNjcmlwdGlvbnMgYW5kIGVuZGluZyB3aXRoIGEgZmllbGQgZGVzY3JpcHRpb25cblx0Ly8gcmVhZGVyIDogdGhlIHJlYWRlciB3aGljaCBpcyBjdXJyZW50bHkgdXNlZCB0byByZWFkIHRoZSBzY2hlbWFcblx0ZGVlcFJlYWRGaWVsZHM6IGZ1bmN0aW9uIGRlZXBSZWFkRmllbGRzKHZpc2l0b3IpIHtcblx0XHR0aGlzLnZhbGlkYXRlU3RhdGUoKTtcblx0XHRmb3IgKHZhciBvYmpOYW1lIGluIHRoaXMuY29tcGxldGVNZXRhcykgaWYgKHRoaXMuZGVlcFJlYWRNZXRhRmllbGRzQWJyKHRoaXMuY29tcGxldGVNZXRhc1tvYmpOYW1lXSwgdmlzaXRvcikgPT09ICd0ZXJtJykgcmV0dXJuICd0ZXJtJztcblx0fSxcblx0Ly8gc2VlIGRlZXByZWFkIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRkZWVwUmVhZE1ldGFGaWVsZHM6IGZ1bmN0aW9uIGRlZXBSZWFkTWV0YUZpZWxkcyhvYmosIHZpc2l0ZWQsIHBhdGgsIHZpc2l0b3IpIHtcblx0XHR0aGlzLnZhbGlkYXRlU3RhdGUoKTtcblx0XHRpZiAodmlzaXRlZFtvYmoubmFtZV0gPT0gdHJ1ZSkgcmV0dXJuO1xuXHRcdGlmICh0eXBlb2Ygb2JqLmZpZWxkcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblx0XHR2aXNpdGVkW29iai5uYW1lXSA9IHRydWU7XG5cblx0XHRpZiAocGF0aC5sZW5ndGggPT0gMCkgcGF0aC5wdXNoKG9iaik7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iai5maWVsZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBmID0gb2JqLmZpZWxkc1tpXTtcblx0XHRcdGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpIGNvbnRpbnVlO1xuXHRcdFx0dmFyIHN1YlBhdGggPSBwYXRoLmNvbmNhdChmKTtcblx0XHRcdGlmICh2aXNpdG9yKGYsIG9iaiwgc3ViUGF0aCwgdGhpcykgPT09ICd0ZXJtJykgcmV0dXJuICd0ZXJtJztcblx0XHRcdGlmIChmLnR5cGUgPT09ICdyZWZlcmVuY2UnKSB7XG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShmLnJlZmVyZW5jZVRvKSkge1xuXHRcdFx0XHRcdGlmICh0aGlzLmRlZXBSZWFkTWV0YUZpZWxkcyh0aGlzLmNvbXBsZXRlTWV0YXNbZi5yZWZlcmVuY2VUb10sIGNsb25lKHZpc2l0ZWQpLCBzdWJQYXRoLCB2aXNpdG9yKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZi5yZWZlcmVuY2VUby5sZW5ndGg7IGorKykgaWYgKHRoaXMuZGVlcFJlYWRNZXRhRmllbGRzKHRoaXMuY29tcGxldGVNZXRhc1tmLnJlZmVyZW5jZVRvW2pdXSwgY2xvbmUodmlzaXRlZCksIHN1YlBhdGgsIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdC8vIEFuIGFiYnJldmlhdGlvbiAoQWJyKSBtZXRob2QgdG8gZGVlcCByZWFkIHN0YXJ0aW5nIHdpdGggdGhlIHBhc3NlZCBvYmplY3Rcblx0Ly8gc2VlIGRlZXByZWFkIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRkZWVwUmVhZE1ldGFGaWVsZHNBYnI6IGZ1bmN0aW9uIGRlZXBSZWFkTWV0YUZpZWxkc0FicihvYmosIHZpc2l0b3IpIHtcblx0XHRyZXR1cm4gdGhpcy5kZWVwUmVhZE1ldGFGaWVsZHMob2JqLCBbXSwgW10sIHZpc2l0b3IpO1xuXHR9LFxuXHQvLyB2aXNpdG9yIGRlZmluaXRpb246IGZ1bmN0aW9uKHJlbCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0Ly8gXHRcdC8vIHJldHVybiAndGVybScgLy8gaWYgeW91IHdhbnQgdG8gdGVybWluYXRlIHRoZSBzY2hlbWEgcmVhZFxuXHQvLyB9XG5cdC8vIHJlbCA6IHt9IC0gdGhlIHJlbGF0aW9uc2hpcCBkZXNjcmlwdGlvbiB1bmRlciByZWFkLFxuXHQvLyBvYmplY3QgOiB7fSAtIHRoZSBzb2JqZWN0IGRlc2NyaXB0aW9uIHVuZGVyIHJlYWRcblx0Ly8gcGF0aCA6IFtdIC0gYSBsaXN0IG9mIGRlc2NyaXB0aW9ucyBzdGFydGluZyB3aXRoIHRoZSBzb2JqZWN0IGRlc2NyaXB0aW9uLCB0cmFpbGVkIGJ5XG5cdC8vXHRcdFx0XHRyZWxhdGlvbnNoaXAgZGVzY3JpcHRpb25zXG5cdC8vIHJlYWRlciA6IHRoZSByZWFkZXIgd2hpY2ggaXMgY3VycmVudGx5IHVzZWQgdG8gcmVhZCB0aGUgc2NoZW1hXG5cdHNoYWxsb3dSZWFkQ2hpbGRSZWxhdGlvbnNoaXBzOiBmdW5jdGlvbiBzaGFsbG93UmVhZENoaWxkUmVsYXRpb25zaGlwcyh2aXNpdG9yKSB7XG5cdFx0dGhpcy52YWxpZGF0ZVN0YXRlKCk7XG5cdFx0Zm9yICh2YXIgb2JqTmFtZSBpbiB0aGlzLmNvbXBsZXRlTWV0YXMpIGlmICh0aGlzLnNoYWxsb3dSZWFkTWV0YUNoaWxkUmVsYXRpb25zaGlwc0Ficih0aGlzLmNvbXBsZXRlTWV0YXNbb2JqTmFtZV0sIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdH0sXG5cdC8vIHNlZSBzaGFsbG93UmVhZENoaWxkUmVsYXRpb25zaGlwcyBmaWVsZHMgZm9yIHRoZSB2aXNpdG9yIGRlZmluaXRpb25cblx0c2hhbGxvd1JlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzOiBmdW5jdGlvbiBzaGFsbG93UmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHMob2JqLCB2aXNpdGVkLCBwYXRoLCB2aXNpdG9yKSB7XG5cdFx0dGhpcy52YWxpZGF0ZVN0YXRlKCk7XG5cdFx0aWYgKHR5cGVvZiBvYmouY2hpbGRSZWxhdGlvbnNoaXBzID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iai5jaGlsZFJlbGF0aW9uc2hpcHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciByID0gb2JqLmNoaWxkUmVsYXRpb25zaGlwc1tpXTtcblx0XHRcdGlmICh0eXBlb2YgciA9PT0gJ3VuZGVmaW5lZCcpIGNvbnRpbnVlO1xuXHRcdFx0dmFyIHN1YlBhdGggPSBwYXRoLmNvbmNhdChyKTtcblx0XHRcdGlmICh2aXNpdG9yKHIsIG9iaiwgc3ViUGF0aCwgdGhpcykgPT09ICd0ZXJtJykgcmV0dXJuICd0ZXJtJztcblx0XHR9XG5cdH0sXG5cdC8vIEFuIGFiYnJldmlhdGlvbiAoQWJyKSBtZXRob2QgdG8gc2hhbGxvdyByZWFkIHN0YXJ0aW5nIHdpdGggdGhlIHBhc3NlZCBvYmplY3Rcblx0Ly8gc2VlIHNoYWxsb3dSZWFkQ2hpbGRSZWxhdGlvbnNoaXBzIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRzaGFsbG93UmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHNBYnI6IGZ1bmN0aW9uIHNoYWxsb3dSZWFkTWV0YUNoaWxkUmVsYXRpb25zaGlwc0FicihvYmosIHZpc2l0b3IpIHtcblx0XHRyZXR1cm4gdGhpcy5zaGFsbG93UmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHMob2JqLCB7fSwgW10sIHZpc2l0b3IpO1xuXHR9LFxuXG5cdC8vIHNlZSBzaGFsbG93UmVhZENoaWxkUmVsYXRpb25zaGlwcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRkZWVwUmVhZENoaWxkUmVsYXRpb25zaGlwczogZnVuY3Rpb24gZGVlcFJlYWRDaGlsZFJlbGF0aW9uc2hpcHModmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGZvciAodmFyIG9iak5hbWUgaW4gdGhpcy5jb21wbGV0ZU1ldGFzKSBpZiAodGhpcy5kZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHNBYnIodGhpcy5jb21wbGV0ZU1ldGFzW29iak5hbWVdLCB2aXNpdG9yKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHR9LFxuXHQvLyBzZWUgZGVlcHJlYWQgZmllbGRzIGZvciB0aGUgdmlzaXRvciBkZWZpbml0aW9uXG5cdGRlZXBSZWFkTWV0YUNoaWxkUmVsYXRpb25zaGlwczogZnVuY3Rpb24gZGVlcFJlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzKG9iaiwgdmlzaXRlZCwgcGF0aCwgdmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGlmICh2aXNpdGVkW29iai5uYW1lXSA9PSB0cnVlKSByZXR1cm47XG5cdFx0aWYgKHR5cGVvZiBvYmouY2hpbGRSZWxhdGlvbnNoaXBzID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXHRcdHZpc2l0ZWRbb2JqLm5hbWVdID0gdHJ1ZTtcblxuXHRcdGlmIChwYXRoLmxlbmd0aCA9PSAwKSBwYXRoLnB1c2gob2JqKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmNoaWxkUmVsYXRpb25zaGlwcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHIgPSBvYmouY2hpbGRSZWxhdGlvbnNoaXBzW2ldO1xuXHRcdFx0aWYgKHR5cGVvZiByID09PSAndW5kZWZpbmVkJykgY29udGludWU7XG5cdFx0XHR2YXIgc3ViUGF0aCA9IHBhdGguY29uY2F0KHIpO1xuXHRcdFx0aWYgKHZpc2l0b3Iociwgb2JqLCBzdWJQYXRoLCB0aGlzKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHIuY2hpbGRTT2JqZWN0KSkge1xuXHRcdFx0XHRpZiAodGhpcy5kZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHModGhpcy5jb21wbGV0ZU1ldGFzW3IuY2hpbGRTT2JqZWN0XSwgY2xvbmUodmlzaXRlZCksIHN1YlBhdGgsIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHIuY2hpbGRTT2JqZWN0Lmxlbmd0aDsgaisrKSBpZiAodGhpcy5kZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHModGhpcy5jb21wbGV0ZU1ldGFzW3IuY2hpbGRTT2JqZWN0W2pdXSwgY2xvbmUodmlzaXRlZCksIHN1YlBhdGgsIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvLyBBbiBhYmJyZXZpYXRpb24gKEFicikgbWV0aG9kIHRvIGRlZXAgcmVhZCBzdGFydGluZyB3aXRoIHRoZSBwYXNzZWQgb2JqZWN0XG5cdC8vIHNlZSBkZWVwcmVhZCBmaWVsZHMgZm9yIHRoZSB2aXNpdG9yIGRlZmluaXRpb25cblx0ZGVlcFJlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzQWJyOiBmdW5jdGlvbiBkZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHNBYnIob2JqLCB2aXNpdG9yKSB7XG5cdFx0cmV0dXJuIHRoaXMuZGVlcFJlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzKG9iaiwge30sIFtdLCB2aXNpdG9yKTtcblx0fSxcblxuXHR2YWxpZGF0ZVN0YXRlOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXRlKCkge1xuXHRcdGlmICh0aGlzLmlzRmV0Y2hpbmcpIHRocm93IHRoaXMudHlwZSArIFwiIGhhc24ndCBmaW5pc2hlZCBmZXRjaGluZyBtZXRhZGF0YSBmcm9tIHRoZSBzZXJ2ZXJcIjtcblx0fVxuXG59O1xuXG4vLyBmaWx0ZXJzXG5TY2hlbWFSZWFkZXIuY3JlYXRlRmlsdGVyVmlzaXRvciA9IGZ1bmN0aW9uIChmaWx0ZXIsIHZpc2l0b3IpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChmaWVsZCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0XHRpZiAoZmlsdGVyKGZpZWxkLCBvYmplY3QsIHBhdGgsIHJlYWRlcikpIHZpc2l0b3IoZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKTtcblx0fTtcbn07XG5TY2hlbWFSZWFkZXIubmV3T2JqZWN0TmFtZUZpbHRlciA9IGZ1bmN0aW9uIChvYmpOYW1lLCB2aXNpdG9yLCBjYXNlU2Vuc2l0aXZlKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdFx0aWYgKCFjYXNlU2Vuc2l0aXZlICYmIG9iak5hbWUudG9Mb3dlckNhc2UoKSA9PT0gb2JqZWN0Lm5hbWUudG9Mb3dlckNhc2UoKSB8fCBjYXNlU2Vuc2l0aXZlICYmIG9iak5hbWUgPT09IG9iamVjdC5uYW1lKSB2aXNpdG9yKGZpZWxkLCBvYmplY3QsIHBhdGgsIHJlYWRlcik7XG5cdH07XG59O1xuU2NoZW1hUmVhZGVyLm5ld0ZpZWxkTmFtZUZpbHRlciA9IGZ1bmN0aW9uIChmaWVsZE5hbWUsIHZpc2l0b3IsIGNhc2VTZW5zaXRpdmUpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChmaWVsZCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0XHRpZiAoIWNhc2VTZW5zaXRpdmUgJiYgZmllbGROYW1lLnRvTG93ZXJDYXNlKCkgPT09IGZpZWxkLm5hbWUudG9Mb3dlckNhc2UoKSB8fCBjYXNlU2Vuc2l0aXZlICYmIGZpZWxkTmFtZSA9PT0gZmllbGQubmFtZSkgdmlzaXRvcihmaWVsZCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpO1xuXHR9O1xufTtcblNjaGVtYVJlYWRlci5uZXdGaWVsZEFuZE9iamVjdE5hbWVGaWx0ZXIgPSBmdW5jdGlvbiAoZmllbGROYW1lLCBvYmpOYW1lLCB2aXNpdG9yLCBjYXNlU2Vuc2l0aXZlKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdFx0aWYgKCghY2FzZVNlbnNpdGl2ZSAmJiBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKSA9PT0gZmllbGQubmFtZS50b0xvd2VyQ2FzZSgpIHx8IGNhc2VTZW5zaXRpdmUgJiYgZmllbGROYW1lID09PSBmaWVsZC5uYW1lKSAmJiAoIWNhc2VTZW5zaXRpdmUgJiYgb2JqTmFtZS50b0xvd2VyQ2FzZSgpID09PSBvYmplY3QubmFtZS50b0xvd2VyQ2FzZSgpIHx8IGNhc2VTZW5zaXRpdmUgJiYgb2JqTmFtZSA9PT0gb2JqZWN0Lm5hbWUpKSB2aXNpdG9yKGZpZWxkLCBvYmplY3QsIHBhdGgsIHJlYWRlcik7XG5cdH07XG59O1xuXG4vLyBtaXNjYWxsZW5lb3VzXG5TY2hlbWFSZWFkZXIuY29uY2F0UGF0aCA9IGZ1bmN0aW9uIChwYXRoKSB7XG5cdHZhciBzdHIgPSAnJztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSBzdHIgKz0gKGkgPiAwID8gJy4nIDogJycpICsgKHBhdGhbaV0ubmFtZSA/IHBhdGhbaV0ubmFtZSA6IHBhdGhbaV0ucmVsYXRpb25zaGlwTmFtZSk7XG5cdHJldHVybiBzdHI7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTY2hlbWFSZWFkZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9zY2hlbWEtcmVhZGVyLW5vZGUuanMnKTsiXX0=