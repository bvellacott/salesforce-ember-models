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
		} else if (pl.size === 0) {
			formattedPl[plural] = [];
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
		var _this = this;

		var sfName = SF.sfriseName(type.modelName);
		var so = new this.sforce.SObject(sfName);
		if (snapshot.id != null) so.Id = snapshot.id;
		snapshot.eachAttribute(function (name, meta) {
			var metaOptions = type.metaForProperty(name).options;
			if (metaOptions.updateable) so[name] = _this.serialisePrimitive(snapshot.attr(name));
		});
		snapshot.eachRelationship(function (name, meta) {
			if (meta.kind === 'belongsTo') {
				var metaOptions = type.metaForProperty(name).options;
				if (metaOptions.updateable) so[name] = snapshot.belongsTo(name, { id: true });
			}
		});
		return so;
	},
	serialisePrimitive: function serialisePrimitive(primitive) {
		if (primitive instanceof Date) return primitive.toISOString();
		return primitive;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyRW50cnkuanMiLCJzZi1tb2RlbHMuanMiLCIuLi8uLi8uLi9zYWxlc2ZvcmNlLXNjaGVtYS1yZWFkZXIvZGlzdC9zY2hlbWEtcmVhZGVyLW5vZGUuanMiLCIuLi8uLi8uLi9zYWxlc2ZvcmNlLXNjaGVtYS1yZWFkZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG53aW5kb3cuU0ZNb2RlbHMgPSByZXF1aXJlKFwiLi9zZi1tb2RlbHNcIik7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3NhbGVzZm9yY2VTY2hlbWFSZWFkZXIgPSByZXF1aXJlKCdzYWxlc2ZvcmNlLXNjaGVtYS1yZWFkZXInKTtcblxudmFyIF9zYWxlc2ZvcmNlU2NoZW1hUmVhZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NhbGVzZm9yY2VTY2hlbWFSZWFkZXIpO1xuXG52YXIgU0Y7XG52YXIgU0ZNb2RlbHMgPSBTRiA9IHtcblx0RW1iZXI6IHdpbmRvdyAmJiB3aW5kb3cuRW1iZXIgPyB3aW5kb3cuRW1iZXIgOiB1bmRlZmluZWQsXG5cdERTOiB1bmRlZmluZWQsXG5cdHNmb3JjZTogd2luZG93ICYmIHdpbmRvdy5zZm9yY2UgPyB3aW5kb3cuc2ZvcmNlIDogdW5kZWZpbmVkLFxuXHRTY2hlbWFSZWFkZXI6IF9zYWxlc2ZvcmNlU2NoZW1hUmVhZGVyMlsnZGVmYXVsdCddLFxuXHQvLyBDb25zdGFudHMgYW5kIG1ldGhvZHMgZm9yIHNhbGVzZm9yY2UgY3VzdG9tIGVudGl0eSBlbmRpbmcgaGFuZGxpbmcgYW5kIGNvbnZlcnNpb25zXG5cdF9zZlJlbEV4dDogJ19fcicsXG5cdF9zZk5hbWVFeHQ6ICdfX2MnLFxuXHRfZW1SZWxFeHQ6ICdycnInLFxuXHRfZW1OYW1lRXh0OiAnY2NjJyxcblx0ZW5kc1dpdGg6IGZ1bmN0aW9uIGVuZHNXaXRoKHN0ciwgZW5kaW5nKSB7XG5cdFx0cmV0dXJuIHN0ci5pbmRleE9mKGVuZGluZywgc3RyLmxlbmd0aCAtIGVuZGluZy5sZW5ndGgpID4gLTE7XG5cdH0sXG5cdGhhc0N1c3RvbVNmUmVsYXRpb25FeHRlbnNpb246IGZ1bmN0aW9uIGhhc0N1c3RvbVNmUmVsYXRpb25FeHRlbnNpb24obmFtZSkge1xuXHRcdHJldHVybiBTRi5lbmRzV2l0aChuYW1lLCBTRi5fc2ZSZWxFeHQpO1xuXHR9LFxuXHRoYXNDdXN0b21TZk5hbWVFeHRlbnNpb246IGZ1bmN0aW9uIGhhc0N1c3RvbVNmTmFtZUV4dGVuc2lvbihuYW1lKSB7XG5cdFx0cmV0dXJuIFNGLmVuZHNXaXRoKG5hbWUsIFNGLl9zZk5hbWVFeHQpO1xuXHR9LFxuXHRoYXNDdXN0b21FbWJlclJlbGF0aW9uRXh0ZW5zaW9uOiBmdW5jdGlvbiBoYXNDdXN0b21FbWJlclJlbGF0aW9uRXh0ZW5zaW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gU0YuZW5kc1dpdGgobmFtZSwgU0YuX2VtUmVsRXh0KTtcblx0fSxcblx0aGFzQ3VzdG9tRW1iZXJOYW1lRXh0ZW5zaW9uOiBmdW5jdGlvbiBoYXNDdXN0b21FbWJlck5hbWVFeHRlbnNpb24obmFtZSkge1xuXHRcdHJldHVybiBTRi5lbmRzV2l0aChuYW1lLCBTRi5fZW1OYW1lRXh0KTtcblx0fSxcblx0ZW1iZXJpc2VOYW1lOiBmdW5jdGlvbiBlbWJlcmlzZU5hbWUoc2ZOYW1lKSB7XG5cdFx0aWYgKFNGLmhhc0N1c3RvbVNmTmFtZUV4dGVuc2lvbihzZk5hbWUpKSBzZk5hbWUgPSBzZk5hbWUuc3Vic3RyaW5nKDAsIHNmTmFtZS5sZW5ndGggLSBTRi5fc2ZOYW1lRXh0Lmxlbmd0aCkgKyBTRi5fZW1OYW1lRXh0O2Vsc2UgaWYgKFNGLmhhc0N1c3RvbVNmUmVsYXRpb25FeHRlbnNpb24oc2ZOYW1lKSkgc2ZOYW1lID0gc2ZOYW1lLnN1YnN0cmluZygwLCBzZk5hbWUubGVuZ3RoIC0gU0YuX3NmUmVsRXh0Lmxlbmd0aCkgKyBTRi5fZW1SZWxFeHQ7XG5cdFx0cmV0dXJuIHRoaXMuRW1iZXIuU3RyaW5nLmRhc2hlcml6ZShzZk5hbWUpO1xuXHR9LFxuXHRzZnJpc2VOYW1lOiBmdW5jdGlvbiBzZnJpc2VOYW1lKGVtTmFtZSkge1xuXHRcdGVtTmFtZSA9IHRoaXMuRW1iZXIuU3RyaW5nLmNhbWVsaXplKGVtTmFtZSk7XG5cdFx0aWYgKFNGLmhhc0N1c3RvbUVtYmVyTmFtZUV4dGVuc2lvbihlbU5hbWUpKSByZXR1cm4gZW1OYW1lLnN1YnN0cmluZygwLCBlbU5hbWUubGVuZ3RoIC0gU0YuX2VtTmFtZUV4dC5sZW5ndGgpICsgU0YuX3NmTmFtZUV4dDtlbHNlIGlmIChTRi5oYXNDdXN0b21FbWJlclJlbGF0aW9uRXh0ZW5zaW9uKGVtTmFtZSkpIHJldHVybiBlbU5hbWUuc3Vic3RyaW5nKDAsIGVtTmFtZS5sZW5ndGggLSBTRi5fZW1SZWxFeHQubGVuZ3RoKSArIFNGLl9zZlJlbEV4dDtcblx0XHRyZXR1cm4gZW1OYW1lO1xuXHR9LFxuXHRlbWJlcmlzZVJlZnM6IGZ1bmN0aW9uIGVtYmVyaXNlUmVmcyhyZWZzKSB7XG5cdFx0aWYgKHR5cGVvZiByZWZzID09PSAnc3RyaW5nJykgcmV0dXJuIFNGLmVtYmVyaXNlTmFtZShyZWZzKTtlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlZnMpKSB7XG5cdFx0XHR2YXIgZW1iZXJSZWZzID0gW107XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlZnMubGVuZ3RoOyBpKyspIGVtYmVyUmVmcy5wdXNoKFNGLmVtYmVyaXNlTmFtZShyZWZzW2ldKSk7XG5cdFx0XHRyZXR1cm4gZW1iZXJSZWZzO1xuXHRcdH0gZWxzZSByZXR1cm4gbnVsbDtcblx0fSxcblx0c2ZyaXNlUmVmczogZnVuY3Rpb24gc2ZyaXNlUmVmcyhyZWZzKSB7XG5cdFx0aWYgKHR5cGVvZiByZWZzID09PSAnc3RyaW5nJykgcmV0dXJuIFNGLnNmcmlzZU5hbWUocmVmcyk7ZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZWZzKSkge1xuXHRcdFx0dmFyIHNmUmVmcyA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZWZzLmxlbmd0aDsgaSsrKSBzZlJlZnMucHVzaChTRi5zZnJpc2VOYW1lKHJlZnNbaV0pKTtcblx0XHRcdHJldHVybiBzZlJlZnM7XG5cdFx0fSBlbHNlIHJldHVybiBudWxsO1xuXHR9LFxuXHQvLyBBIHR5cGUgbWFwIHRvIGNvbnZlcnQgamF2YXNjcmlwdCBkYXRhdHlwZXMgdXNlZCBieSBzYWxlc2ZvcmNlIHRvIGRhdGF0eXBlcyB1c2VkIGluIGVtYmVyXG5cdC8vIHNlZSA6IGh0dHBzOi8vZGV2ZWxvcGVyLnNhbGVzZm9yY2UuY29tL2RvY3MvYXRsYXMuZW4tdXMuYXBpLm1ldGEvYXBpL2ZpZWxkX3R5cGVzLmh0bVxuXHRzZm9yY2VUb0VtYmVyVHlwZU1hcDoge1xuXHRcdGlkOiAnc3RyaW5nJyxcblx0XHRib29sZWFuOiAnYm9vbGVhbicsXG5cdFx0c3RyaW5nOiAnc3RyaW5nJyxcblx0XHRkYXRldGltZTogJ2RhdGUnLFxuXHRcdGN1cnJlbmN5OiAnbnVtYmVyJyxcblx0XHRkYXRlOiAnZGF0ZScsXG5cdFx0ZW1haWw6ICdzdHJpbmcnLFxuXHRcdGludDogJ251bWJlcicsXG5cdFx0ZG91YmxlOiAnbnVtYmVyJyxcblx0XHRwZXJjZW50OiAnbnVtYmVyJyxcblx0XHRsb2NhdGlvbjogJ3N0cmluZycsXG5cdFx0cGhvbmU6ICdzdHJpbmcnLFxuXHRcdHBpY2tsaXN0OiAnc3RyaW5nJyxcblx0XHRtdWx0aXBpY2tsaXN0OiAnc3RyaW5nJyxcblx0XHR0ZXh0YXJlYTogJ3N0cmluZycsXG5cdFx0dXJsOiAnc3RyaW5nJyxcblx0XHRhZGRyZXNzOiAnc3RyaW5nJyxcblx0XHRjYWxjdWxhdGVkOiAnc3RyaW5nJyxcblx0XHRjb21ib2JveDogJ3N0cmluZycsXG5cdFx0ZGF0YWNhdGVnb3J5Z3JvdXByZWZlcmVuY2U6ICdzdHJpbmcnLFxuXHRcdGVuY3J5cHRlZHN0cmluZzogJ3N0cmluZycsXG5cdFx0anVuY3Rpb25pZGxpc3Q6ICdzdHJpbmcnLFxuXHRcdG1hc3RlcnJlY29yZDogJ3N0cmluZydcblx0fSxcblx0Ly8gT25lIG9mIHRoZSBtYWluIG1ldGhvZHMuIFVzZWQgdG8gcmVhZCB0aGUgc2FsZXNmb3JjZSBzY2hlbWEgdXNpbmcgdGhlIHNPYmplY3RSZWFkZXIgYW5kIGNyZWF0ZVxuXHQvLyBtYXRjaGluZyBlbWJlciBtb2RlbHMuIFBhc3MgaW4gYSB0eXBlRmlsdGVyIGZ1bmN0aW9uIHRvIGxpbWl0IHRoZSBtb2RlbHMgY3JlYXRlZC5cblx0Ly8gRm9yIGV4YW1wbGUgaWYgeW91IG9ubHkgd2FudCB0byBjcmVhdGUgYSBtb2RlbCBmb3IgYSBzYWxlc2ZvcmNlIEFjY291bnQgc29iamVjdDpcblx0Ly9cblx0Ly8gdHlwZUZpbHRlciA9IGZ1bmN0aW9uKG9iaikgeyByZXR1cm4gb2JqLm5hbWUgPT09ICdBY2NvdW50JzsgfS4gSWYgdGhlIHR5cGVGaWx0ZXIgaXNuJ3QgdXNlZFxuXHQvLyBhbGwgdGhlIHNhbGVzZm9yY2Ugb2JqZWN0IGRlZmluaXRpb25zIGFyZSBjb252ZXJ0ZWQgaW50byBlbWJlciBtb2RlbHMuXG5cdGNyZWF0ZU1vZGVsc0ZvclNPYmplY3RzOiBmdW5jdGlvbiBjcmVhdGVNb2RlbHNGb3JTT2JqZWN0cyhlbWJlckFwcCwgc09iamVjdE1ldGFNYXAsIHNPYmplY3RSZWFkZXIsIHR5cGVGaWx0ZXIpIHtcblx0XHR2YXIgbW9kZWxFeHRlbnNpb25NYXAgPSBTRi5jcmVhdGVFbWJlck1vZGVsRGVmaW5pdGlvbnMoc09iamVjdE1ldGFNYXAsIHNPYmplY3RSZWFkZXIsIHR5cGVGaWx0ZXIpO1xuXHRcdFNGLmNyZWF0ZU1vZGVsc0Zyb21FeHRlbnNpb25NYXAoZW1iZXJBcHAsIG1vZGVsRXh0ZW5zaW9uTWFwKTtcblx0fSxcblx0Ly8gT25lIG9mIHRoZSBtYWluIG1ldGhvZHMuIFVzZWQgdG8gY3JlYXRlIHRoZSBlbWJlciBtb2RlbHMgZnJvbSBlbWJlciBtb2RlbCBkZWZpbml0aW9ucyBpbiBhIGpzIG9iamVjdC5cblx0Ly8gVXNlIGNyZWF0ZUVtYmVyTW9kZWxEZWZpbml0aW9ucyB0byBjcmVhdGUgdGhlIGVtYmVyIG1vZGVsIGRlZmluaXRpb25zLlxuXHRjcmVhdGVNb2RlbHNGcm9tRXh0ZW5zaW9uTWFwOiBmdW5jdGlvbiBjcmVhdGVNb2RlbHNGcm9tRXh0ZW5zaW9uTWFwKGVtYmVyQXBwLCBtb2RlbEV4dGVuc2lvbk1hcCkge1xuXHRcdHZhciBldmFsdWF0ZWRNYXAgPSB7fTtcblx0XHRmb3IgKHZhciBzT2JqZWN0TmFtZSBpbiBtb2RlbEV4dGVuc2lvbk1hcCkge1xuXHRcdFx0dmFyIG1vZGVsID0gbW9kZWxFeHRlbnNpb25NYXBbc09iamVjdE5hbWVdO1xuXHRcdFx0dmFyIGV2YWx1YXRlZE1vZGVsID0ge307XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gbW9kZWwpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBtb2RlbFtrZXldID09PSAnc3RyaW5nJykgZXZhbHVhdGVkTW9kZWxba2V5XSA9IGV2YWwobW9kZWxba2V5XSk7ZWxzZSBldmFsdWF0ZWRNb2RlbFtrZXldID0gbW9kZWxba2V5XTtcblx0XHRcdH1cblx0XHRcdHZhciBlb24gPSBTRi5lbWJlcmlzZU5hbWUoc09iamVjdE5hbWUpO1xuXHRcdFx0ZW9uID0gdGhpcy5FbWJlci5TdHJpbmcuZGFzaGVyaXplKGVvbik7XG5cdFx0XHRlbWJlckFwcFtlb25dID0gdGhpcy5EUy5Nb2RlbC5leHRlbmQoZXZhbHVhdGVkTW9kZWwpO1xuXHRcdH1cblx0fSxcblx0Ly8gT25lIG9mIHRoZSBtYWluIG1ldGhvZHMuIFVzZWQgdG8gcmVhZCB0aGUgc2FsZXNmb3JjZSBzY2hlbWEgdXNpbmcgdGhlIHNPYmplY3RSZWFkZXIgYW5kIGNyZWF0ZVxuXHQvLyBtYXRjaGluZyBlbWJlciBtb2RlbCBkZWZpbml0aW9ucyBpbnRvIGEganMgb2JqZWN0LiBTZWUgY3JlYXRlTW9kZWxzRm9yU09iamVjdHMgbWV0aG9kIGZvciB0aGUgdHlwZUZpbHRlclxuXHQvLyBkZWZpbml0aW9uLiBJZiB0aGUgdHlwZUZpbHRlciBpc24ndCB1c2VkIGFsbCB0aGUgc2FsZXNmb3JjZSBvYmplY3QgZGVmaW5pdGlvbnMgYXJlIGNvbnZlcnRlZCBpbnRvIGVtYmVyXG5cdC8vIG1vZGVscy5cblx0Ly9cblx0Ly8gVXNlIHRoaXMgbWV0aG9kIHRvIGNyZWF0ZSBhIHN0YXRpYyBkZWZpbml0aW9uIG9mIHRoZSBvYmplY3RzIHlvdSB1c2UgaW4geW91ciBhcHAgc28gdGhhdCB5b3UgZG9uJ3QgaGF2ZVxuXHQvLyB0byBkeW5hbWljYWxseSByZWNyZWF0ZSBpdCBldmVyeSB0aW1lLCB3aGljaCBpcyBzbG93LCByZXF1aXJlcyB0aGUgdXNlIG9mIGEgY2FsbGJhY2sgYW5kIHByZXZlbnRzXG5cdC8vIHByb3BlciByb3V0ZSBoYW5kbGluZyB3aGVuIHlvdSBsYW5kIG9uIHRoZSBwYWdlL2luaXRpYWxpc2UgdGhlIGFwcC5cblx0Y3JlYXRlRW1iZXJNb2RlbERlZmluaXRpb25zOiBmdW5jdGlvbiBjcmVhdGVFbWJlck1vZGVsRGVmaW5pdGlvbnMoc09iamVjdE1ldGFNYXAsIHNPYmplY3RSZWFkZXIsIHR5cGVGaWx0ZXIpIHtcblx0XHR2YXIgbW9kZWxFeHRlbnNpb25NYXAgPSB7fTtcblx0XHR2YXIgY2FjaGUgPSBuZXcgU0YuZmFjdG9yeS5DYWNoZSgpO1xuXG5cdFx0Zm9yICh2YXIgc09iamVjdE5hbWUgaW4gc09iamVjdE1ldGFNYXApIHtcblx0XHRcdGlmICh0eXBlRmlsdGVyICYmICF0eXBlRmlsdGVyKHNPYmplY3RNZXRhTWFwW3NPYmplY3ROYW1lXSkpIGNvbnRpbnVlO1xuXHRcdFx0U0YucmVjb3JkSW52ZXJzZXMoc09iamVjdE5hbWUsIHNPYmplY3RSZWFkZXIsIGNhY2hlLCB0eXBlRmlsdGVyKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBzT2JqZWN0TmFtZSBpbiBzT2JqZWN0TWV0YU1hcCkge1xuXHRcdFx0aWYgKHR5cGVGaWx0ZXIgJiYgIXR5cGVGaWx0ZXIoc09iamVjdE1ldGFNYXBbc09iamVjdE5hbWVdKSkgY29udGludWU7XG5cdFx0XHR2YXIgbW9kZWxFeHRlbnNpb24gPSB7fTtcblx0XHRcdG1vZGVsRXh0ZW5zaW9uTWFwW3NPYmplY3ROYW1lXSA9IG1vZGVsRXh0ZW5zaW9uO1xuXHRcdFx0U0YuY3JlYXRlRmllbGRNb2RlbEZvclNPYmplY3QobW9kZWxFeHRlbnNpb24sIHNPYmplY3ROYW1lLCBzT2JqZWN0UmVhZGVyLCBjYWNoZSwgdHlwZUZpbHRlcik7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgc09iamVjdE5hbWUgaW4gc09iamVjdE1ldGFNYXApIHtcblx0XHRcdGlmICh0eXBlRmlsdGVyICYmICF0eXBlRmlsdGVyKHNPYmplY3RNZXRhTWFwW3NPYmplY3ROYW1lXSkpIGNvbnRpbnVlO1xuXHRcdFx0dmFyIG1vZGVsRXh0ZW5zaW9uID0gbW9kZWxFeHRlbnNpb25NYXBbc09iamVjdE5hbWVdO1xuXHRcdFx0U0YuY3JlYXRlUmVsYXRpb25zaGlwTW9kZWxGb3JTT2JqZWN0KG1vZGVsRXh0ZW5zaW9uLCBzT2JqZWN0TmFtZSwgc09iamVjdFJlYWRlciwgY2FjaGUsIHR5cGVGaWx0ZXIpO1xuXHRcdH1cblx0XHRyZXR1cm4gbW9kZWxFeHRlbnNpb25NYXA7XG5cdH0sXG5cdC8vIFRoZSBmaXJzdCBzdGFnZSBvZiBjcmVhdGluZyB0aGUgZW1iZXIgbW9kZWwgZGVmaW5pdGlvbnMuIFRoZSBtb2RlbCBkZWZpbml0aW9uIGNyZWF0aW9uIG5lZWRzIHRvIGJlIGRpdmlkZWRcblx0Ly8gaW50byB0aHJlZSBwaGFzZXMgZHVlIHNvIHRoYXQgdGhlIHJlbGF0aW9uc2hpcHMgYmV0d2VlbiBvYmplY3RzIGNhbiBiZSBwcm9wZXJseSBkZWZpbmVkLlxuXHQvLyBJLmUuIGZpcnN0IHRoZSBpbnZlcnNlcyBiZXR3ZWVuIHJlbGF0aW9uc2hpcHMgdGhlbiB0aGUgZmllbGQgZGVmaW5pdGlvbnMgYW5kIHRoZW4gdGhlIHJlbGF0aW9uc2hpcCBkZWZpbml0aW9uc1xuXHQvLyB3aGljaCBuZWVkIHRoZSBmaWVsZCBkZWZpbml0aW9ucy5cblx0Ly9cblx0Ly8gU2VlIGNyZWF0ZU1vZGVsc0ZvclNPYmplY3RzIG1ldGhvZCBmb3IgdGhlIHR5cGVGaWx0ZXIgZGVmaW5pdGlvbi4gSWYgdGhlIHR5cGVGaWx0ZXIgaXNuJ3QgdXNlZCBhbGwgdGhlXG5cdC8vIHNhbGVzZm9yY2Ugb2JqZWN0IGRlZmluaXRpb25zIGFyZSBjb252ZXJ0ZWQgaW50byBlbWJlciBtb2RlbHMuXG5cdHJlY29yZEludmVyc2VzOiBmdW5jdGlvbiByZWNvcmRJbnZlcnNlcyhzT2JqZWN0TmFtZSwgc09iamVjdFJlYWRlciwgY2FjaGUsIHR5cGVGaWx0ZXIpIHtcblx0XHR2YXIgcmVsVmlzaXRvciA9IGZ1bmN0aW9uIHJlbFZpc2l0b3IocmVsLCBvYmplY3QsIHBhdGgsIHJlYWRlcikge1xuXHRcdFx0aWYgKHR5cGVvZiByZWwucmVsYXRpb25zaGlwTmFtZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHJlbC5jaGlsZFNPYmplY3QgPT09ICd1bmRlZmluZWQnIHx8IGNhY2hlLmlzUmVmZXJlbmNlZEJ5TXVsdGl0eXBlZFJlZmVyZW5jZShyZWwpKSByZXR1cm47XG5cdFx0XHRpZiAodHlwZUZpbHRlciAmJiAhdHlwZUZpbHRlcihzT2JqZWN0UmVhZGVyLmNvbXBsZXRlTWV0YXNbcmVsLmNoaWxkU09iamVjdF0pKSByZXR1cm47XG5cdFx0XHRjYWNoZS5sb2dJbnZlcnNlcyhzT2JqZWN0TmFtZSwgcmVsLnJlbGF0aW9uc2hpcE5hbWUsIHJlbC5maWVsZCk7XG5cdFx0fTtcblxuXHRcdHZhciBvYmogPSBzT2JqZWN0UmVhZGVyLmNvbXBsZXRlTWV0YXNbc09iamVjdE5hbWVdO1xuXHRcdHNPYmplY3RSZWFkZXIuc2hhbGxvd1JlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzQWJyKG9iaiwgcmVsVmlzaXRvcik7XG5cdH0sXG5cdC8vIFRoZSBzZWNvbmQgc3RhZ2Ugb2YgY3JlYXRpbmcgdGhlIGVtYmVyIG1vZGVsIGRlZmluaXRpb25zLiBUaGUgbW9kZWwgZGVmaW5pdGlvbiBjcmVhdGlvbiBuZWVkcyB0byBiZSBkaXZpZGVkXG5cdC8vIGludG8gdGhyZWUgcGhhc2VzIGR1ZSBzbyB0aGF0IHRoZSByZWxhdGlvbnNoaXBzIGJldHdlZW4gb2JqZWN0cyBjYW4gYmUgcHJvcGVybHkgZGVmaW5lZC5cblx0Ly8gSS5lLiBmaXJzdCB0aGUgaW52ZXJzZXMgYmV0d2VlbiByZWxhdGlvbnNoaXBzIHRoZW4gdGhlIGZpZWxkIGRlZmluaXRpb25zIGFuZCB0aGVuIHRoZSByZWxhdGlvbnNoaXAgZGVmaW5pdGlvbnNcblx0Ly8gd2hpY2ggbmVlZCB0aGUgZmllbGQgZGVmaW5pdGlvbnMuXG5cdC8vXG5cdC8vIFNlZSBjcmVhdGVNb2RlbHNGb3JTT2JqZWN0cyBtZXRob2QgZm9yIHRoZSB0eXBlRmlsdGVyIGRlZmluaXRpb24uIElmIHRoZSB0eXBlRmlsdGVyIGlzbid0IHVzZWQgYWxsIHRoZVxuXHQvLyBzYWxlc2ZvcmNlIG9iamVjdCBkZWZpbml0aW9ucyBhcmUgY29udmVydGVkIGludG8gZW1iZXIgbW9kZWxzLlxuXHRjcmVhdGVGaWVsZE1vZGVsRm9yU09iamVjdDogZnVuY3Rpb24gY3JlYXRlRmllbGRNb2RlbEZvclNPYmplY3QobW9kZWxFeHRlbnNpb24sIHNPYmplY3ROYW1lLCBzT2JqZWN0UmVhZGVyLCBjYWNoZSwgdHlwZUZpbHRlcikge1xuXHRcdHZhciBmaWVsZFZpc2l0b3IgPSBmdW5jdGlvbiBmaWVsZFZpc2l0b3IoZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdFx0XHR2YXIgZm4gPSBmaWVsZC5uYW1lO1xuXHRcdFx0dmFyIHVwZGF0ZWFibGUgPSBmaWVsZC51cGRhdGVhYmxlID09PSAndHJ1ZSc7XG5cdFx0XHRpZiAoIXVwZGF0ZWFibGUpIGNhY2hlLmxvZ05vblVwZGF0ZWFibGVGaWVsZChzT2JqZWN0TmFtZSwgZm4pO1xuXHRcdFx0aWYgKGZpZWxkLnR5cGUgPT09ICdyZWZlcmVuY2UnKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmllbGQucmVmZXJlbmNlVG8gPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0dmFyIGVyZWZzID0gZmllbGQucmVmZXJlbmNlVG87XG5cdFx0XHRcdFx0aWYgKHR5cGVGaWx0ZXIgJiYgIXR5cGVGaWx0ZXIoc09iamVjdFJlYWRlci5jb21wbGV0ZU1ldGFzW2VyZWZzXSkpIHtcblx0XHRcdFx0XHRcdG1vZGVsRXh0ZW5zaW9uW2ZuXSA9IFwidGhpcy5EUy5hdHRyKCdzdHJpbmcnLCB7dXBkYXRlYWJsZSA6IFwiICsgdXBkYXRlYWJsZSArIFwifSlcIjtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGZpZWxkLmN1c3RvbSA9PSAndHJ1ZScpIGVyZWZzID0gU0YuZW1iZXJpc2VOYW1lKGVyZWZzKTtcblx0XHRcdFx0XHR2YXIgaW52ZXJzZSA9IGNhY2hlLmdldEludmVyc2Uoc09iamVjdE5hbWUsIGZuKTtcblx0XHRcdFx0XHRpZiAoaW52ZXJzZSAhPSBudWxsKSBtb2RlbEV4dGVuc2lvbltmbl0gPSBcInRoaXMuRFMuYmVsb25nc1RvKCdcIiArIGVyZWZzICsgXCInLCB7IGFzeW5jIDogdHJ1ZSwgdXBkYXRlYWJsZSA6IFwiICsgdXBkYXRlYWJsZSArIFwiLCBpbnZlcnNlIDogJ1wiICsgaW52ZXJzZSArIFwiJyB9KVwiO2Vsc2UgbW9kZWxFeHRlbnNpb25bZm5dID0gXCJ0aGlzLkRTLmJlbG9uZ3NUbygnXCIgKyBlcmVmcyArIFwiJywgeyBhc3luYyA6IHRydWUsIHVwZGF0ZWFibGUgOiBcIiArIHVwZGF0ZWFibGUgKyBcIiwgaW52ZXJzZSA6IG51bGwgfSlcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZpZWxkLnJlZmVyZW5jZVRvKSkge1xuXHRcdFx0XHRcdGNhY2hlLmxvZ011bHRpdHlwZWRSZWZlcmVuY2VGaWVsZChzT2JqZWN0TmFtZSwgZm4pO1xuXHRcdFx0XHRcdG1vZGVsRXh0ZW5zaW9uW2ZuXSA9IFwidGhpcy5EUy5hdHRyKCdzdHJpbmcnLCB7IG11bHRpUmVmIDogdHJ1ZSwgdXBkYXRlYWJsZSA6IFwiICsgdXBkYXRlYWJsZSArIFwiIH0pXCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly9jYWNoZS5sb2dNdWx0aXR5cGVkUmVmZXJlbmNlRmllbGQoc09iamVjdE5hbWUsIGZuKVxuXHRcdFx0XHRcdG1vZGVsRXh0ZW5zaW9uW2ZuXSA9IFwidGhpcy5EUy5hdHRyKCdzdHJpbmcnLCB7dXBkYXRlYWJsZSA6IFwiICsgdXBkYXRlYWJsZSArIFwifSlcIjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChmbiAhPT0gJ0lkJykgbW9kZWxFeHRlbnNpb25bZm5dID0gXCJ0aGlzLkRTLmF0dHIoJ1wiICsgU0Yuc2ZvcmNlVG9FbWJlclR5cGVNYXBbZmllbGQudHlwZV0gKyBcIicsIHt1cGRhdGVhYmxlIDogXCIgKyB1cGRhdGVhYmxlICsgXCJ9KVwiO1xuXHRcdFx0Y29uc29sZS5sb2coc09iamVjdFJlYWRlci5jb21wbGV0ZU1ldGFzLmxlbmd0aCArICcgOiBmaWVsZCA6ICcgKyBmbik7XG5cdFx0fTtcblxuXHRcdHZhciBvYmogPSBzT2JqZWN0UmVhZGVyLmNvbXBsZXRlTWV0YXNbc09iamVjdE5hbWVdO1xuXHRcdHNPYmplY3RSZWFkZXIuc2hhbGxvd1JlYWRNZXRhRmllbGRzQWJyKG9iaiwgZmllbGRWaXNpdG9yKTtcblx0fSxcblx0Ly8gVGhlIHRoaXJlIHN0YWdlIG9mIGNyZWF0aW5nIHRoZSBlbWJlciBtb2RlbCBkZWZpbml0aW9ucy4gVGhlIG1vZGVsIGRlZmluaXRpb24gY3JlYXRpb24gbmVlZHMgdG8gYmUgZGl2aWRlZFxuXHQvLyBpbnRvIHRocmVlIHBoYXNlcyBkdWUgc28gdGhhdCB0aGUgcmVsYXRpb25zaGlwcyBiZXR3ZWVuIG9iamVjdHMgY2FuIGJlIHByb3Blcmx5IGRlZmluZWQuXG5cdC8vIEkuZS4gZmlyc3QgdGhlIGludmVyc2VzIGJldHdlZW4gcmVsYXRpb25zaGlwcyB0aGVuIHRoZSBmaWVsZCBkZWZpbml0aW9ucyBhbmQgdGhlbiB0aGUgcmVsYXRpb25zaGlwIGRlZmluaXRpb25zXG5cdC8vIHdoaWNoIG5lZWQgdGhlIGZpZWxkIGRlZmluaXRpb25zLlxuXHQvL1xuXHQvLyBTZWUgY3JlYXRlTW9kZWxzRm9yU09iamVjdHMgbWV0aG9kIGZvciB0aGUgdHlwZUZpbHRlciBkZWZpbml0aW9uLiBJZiB0aGUgdHlwZUZpbHRlciBpc24ndCB1c2VkIGFsbCB0aGVcblx0Ly8gc2FsZXNmb3JjZSBvYmplY3QgZGVmaW5pdGlvbnMgYXJlIGNvbnZlcnRlZCBpbnRvIGVtYmVyIG1vZGVscy5cblx0Y3JlYXRlUmVsYXRpb25zaGlwTW9kZWxGb3JTT2JqZWN0OiBmdW5jdGlvbiBjcmVhdGVSZWxhdGlvbnNoaXBNb2RlbEZvclNPYmplY3QobW9kZWxFeHRlbnNpb24sIHNPYmplY3ROYW1lLCBzT2JqZWN0UmVhZGVyLCBjYWNoZSwgdHlwZUZpbHRlcikge1xuXHRcdHZhciByZWxWaXNpdG9yID0gZnVuY3Rpb24gcmVsVmlzaXRvcihyZWwsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdFx0XHRpZiAodHlwZW9mIHJlbC5yZWxhdGlvbnNoaXBOYW1lID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgcmVsLmNoaWxkU09iamVjdCA9PT0gJ3VuZGVmaW5lZCcgfHwgY2FjaGUuaXNSZWZlcmVuY2VkQnlNdWx0aXR5cGVkUmVmZXJlbmNlKHJlbCkpIHJldHVybjtcblx0XHRcdGlmICh0eXBlRmlsdGVyICYmICF0eXBlRmlsdGVyKHNPYmplY3RSZWFkZXIuY29tcGxldGVNZXRhc1tyZWwuY2hpbGRTT2JqZWN0XSkpIHJldHVybjtcblx0XHRcdHZhciBybiA9IHJlbC5yZWxhdGlvbnNoaXBOYW1lO1xuXHRcdFx0dmFyIGVjb24gPSBTRi5lbWJlcmlzZU5hbWUocmVsLmNoaWxkU09iamVjdCk7XG5cdFx0XHRtb2RlbEV4dGVuc2lvbltybl0gPSBcInRoaXMuRFMuaGFzTWFueSgnXCIgKyBlY29uICsgXCInLCB7IGFzeW5jIDogdHJ1ZSwgaW52ZXJzZSA6ICdcIiArIHJlbC5maWVsZCArIFwiJywgfSlcIjtcblx0XHRcdGNvbnNvbGUubG9nKCdjaGlsZCByZWwgOiAnICsgcm4pO1xuXHRcdH07XG5cblx0XHR2YXIgb2JqID0gc09iamVjdFJlYWRlci5jb21wbGV0ZU1ldGFzW3NPYmplY3ROYW1lXTtcblx0XHRzT2JqZWN0UmVhZGVyLnNoYWxsb3dSZWFkTWV0YUNoaWxkUmVsYXRpb25zaGlwc0FicihvYmosIHJlbFZpc2l0b3IpO1xuXHR9LFxuXHQvLyBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgc29xbCBzZWxlY3Qgc3RhdGVtZW50IHN0cmluZyB0byBxdWVyeSBhbiBvYmplY3Qgd2l0aCBpdHMgZmllbGRzIGFuZCByZWxhdGlvbnNoaXBzXG5cdC8vIHVzaW5nIHRoZSBzYWxlc2ZvcmNlIHNvYXAgYXBpIC0gaS5lLSBzZm9yY2UuY29ubmVjdGlvbi5xdWVyeVxuXHRjcmVhdGVTb3FsU2VsZWN0OiBmdW5jdGlvbiBjcmVhdGVTb3FsU2VsZWN0KHR5cGUsIG5hbWUsIHdoZXJlQ2xhdXNlLCBjaGlsZFNlbGVjdENyZWF0b3IpIHtcblx0XHR2YXIgcSA9ICdzZWxlY3QgSWQnO1xuXHRcdHR5cGUuZWFjaEF0dHJpYnV0ZShmdW5jdGlvbiAobmFtZSwgbWV0YSkge1xuXHRcdFx0cSArPSAnLCAnICsgbmFtZTtcblx0XHR9KTtcblx0XHR0eXBlLmVhY2hSZWxhdGlvbnNoaXAoZnVuY3Rpb24gKG5hbWUsIGRlc2NyaXB0b3IpIHtcblx0XHRcdHEgKz0gJywgJztcblx0XHRcdGlmIChkZXNjcmlwdG9yLmtpbmQgPT09ICdoYXNNYW55JykgcSArPSAnKCcgKyBjaGlsZFNlbGVjdENyZWF0b3IoZGVzY3JpcHRvci50eXBlLCBkZXNjcmlwdG9yLmtleSkgKyAnKSc7ZWxzZSBxICs9IGRlc2NyaXB0b3Iua2V5O1xuXHRcdH0pO1xuXHRcdHEgKz0gJyBmcm9tICcgKyBuYW1lO1xuXHRcdGlmICghKHR5cGVvZiB3aGVyZUNsYXVzZSA9PT0gJ3VuZGVmaW5lZCcpKSBxICs9ICcgd2hlcmUgJyArIHdoZXJlQ2xhdXNlO1xuXHRcdHJldHVybiBxO1xuXHR9LFxuXHQvLyBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIGNyZWF0aW5nIGEgc29xbCBzZWxlY3Qgc3RhdGVtZW50LiBJdCBoYW5kbGVzIHRoZSByb290IHNlbGVjdCBzdGF0ZW1lbnQgZ2VuZXJhdGlvbixcblx0Ly8gbm90IHRoZSBjaGlsZCByZWxhdGlvbnNoaXAgc3RhdGVtZW50IGdlbmVyYXRpb25cblx0Y3JlYXRlUm9vdFNvcWxTZWxlY3Q6IGZ1bmN0aW9uIGNyZWF0ZVJvb3RTb3FsU2VsZWN0KHR5cGUsIG5hbWUsIHdoZXJlQ2xhdXNlKSB7XG5cdFx0cmV0dXJuIFNGLmNyZWF0ZVNvcWxTZWxlY3QodHlwZSwgbmFtZSwgd2hlcmVDbGF1c2UsIFNGLmNyZWF0ZUlkU29xbFNlbGVjdCk7XG5cdH0sXG5cdC8vIENoaWxkIHJlbGF0aW9uc2hpcHMgYXJlIHBhc3NlZCB0byBlbWJlciBhcyBhIGxpc3Qgb2YgaWRzIGluIHRoZSBwYXlsb2FkLiBUaGlzIG1ldGhvZCBpcyBmb3IgY2hpbGRcblx0Ly8gcmVsYXRpb25zaGlwIHNlbGVjdCBzdGF0ZW1lbnQgZ2VuZXJhdGlvbi5cblx0Y3JlYXRlSWRTb3FsU2VsZWN0OiBmdW5jdGlvbiBjcmVhdGVJZFNvcWxTZWxlY3QodHlwZSwgbmFtZSwgd2hlcmVDbGF1c2UpIHtcblx0XHR2YXIgcSA9ICdzZWxlY3QgSWQgZnJvbSAnICsgbmFtZTtcblx0XHRpZiAoISh0eXBlb2Ygd2hlcmVDbGF1c2UgPT09ICd1bmRlZmluZWQnKSkgcSArPSAnIHdoZXJlICcgKyB3aGVyZUNsYXVzZTtcblx0XHRyZXR1cm4gcTtcblx0fSxcblx0Ly8gSW4gYSBzb3FsIHNlbGVjdCBzdGF0ZW1lbnQgYW4gYXJyYXkgZG9lc24ndCBsb29rIGxpa2UgYSBzZXJpYWxpc2VkIGphdmFzY3JpcHQgYXJyYXkuIFRoaXMgbWV0aG9kXG5cdC8vIGhhbmRsZXMgdGhlIGNvbnZlcnNpb24uXG5cdC8vXG5cdC8vIFsxLDIsXCJoZWxsbyB3b3JsZFwiXSA9PiAoMSwyLFwiaGVsbG8gd29ybGRcIilcblx0dG9Tb3FsQXJyYXk6IGZ1bmN0aW9uIHRvU29xbEFycmF5KGFycmF5KSB7XG5cdFx0dmFyIHNvcWxBcnkgPSBcIihcIjtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoaSA+IDApIHNvcWxBcnkgKz0gXCIsJ1wiO2Vsc2Ugc29xbEFyeSArPSBcIidcIjtcblx0XHRcdHNvcWxBcnkgKz0gYXJyYXlbaV0gKyBcIidcIjtcblx0XHR9XG5cdFx0c29xbEFyeSArPSBcIilcIjtcblx0XHRyZXR1cm4gc29xbEFyeTtcblx0fSxcblx0Ly8gU2FsZXNmb3JjZSwgbmF0dXJhbGx5IGRvZXNuJ3QgcmV0dXJuIGl0J3MgcmVzdWx0cyBpbiB0aGUgZm9ybWF0IHRoYXQgdGhlIGVtYmVyIHJlc3QgYWRhcHRlciB3b3VsZCBsaWtlLlxuXHQvLyBUaGlzIG1ldGhvZCByZWZvcm1hdHMgYSBzYWxlc2ZvcmNlIHBheWxvYWQgaW50byBhbiBlbWJlciBwYXlsb2FkLlxuXHRmb3JtYXRQYXlsb2FkOiBmdW5jdGlvbiBmb3JtYXRQYXlsb2FkKHR5cGUsIHBsKSB7XG5cdFx0dmFyIGZvcm1hdHRlZFBsID0ge307XG5cdFx0dmFyIHBsdXJhbCA9IHRoaXMuRW1iZXIuSW5mbGVjdG9yLmluZmxlY3Rvci5wbHVyYWxpemUodHlwZS5tb2RlbE5hbWUpO1xuXHRcdHBsdXJhbCA9IHRoaXMuRW1iZXIuU3RyaW5nLmRhc2hlcml6ZShwbHVyYWwpO1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHBsLnJlY29yZHMpKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBsLnJlY29yZHMubGVuZ3RoOyBpKyspIFNGLmZvcm1hdFJlY29yZChwbC5yZWNvcmRzW2ldKTtcblx0XHRcdGZvcm1hdHRlZFBsW3BsdXJhbF0gPSBwbC5yZWNvcmRzO1xuXHRcdH0gZWxzZSBpZiAocGwuc2l6ZSA9PT0gMCkge1xuXHRcdFx0Zm9ybWF0dGVkUGxbcGx1cmFsXSA9IFtdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRTRi5mb3JtYXRSZWNvcmQocGwucmVjb3Jkcyk7XG5cdFx0XHRmb3JtYXR0ZWRQbFtwbHVyYWxdID0gW3BsLnJlY29yZHNdO1xuXHRcdH1cblx0XHRyZXR1cm4gZm9ybWF0dGVkUGw7XG5cdH0sXG5cdC8vIFRoaXMgaXMgYSBzdWIgbWV0aG9kIHRvIGZvcm1hdFBheWxvYWQuIEl0IGZvcm1hdHMgYSBzaW5nbGUgcmVjb3JkIHJlc3VsdCByZXR1cm5lZCBieSBzYWxlc2ZvcmNlXG5cdC8vIGludG8gYSBwYXlsb2FkIGV4cGVjdGVkIGJ5IHRoZSBlbWJlciByZXN0IGFkYXB0ZXIuXG5cdGZvcm1hdFJlY29yZDogZnVuY3Rpb24gZm9ybWF0UmVjb3JkKHJlYykge1xuXHRcdGlmICghcmVjKSB7XG5cdFx0XHRjb25zb2xlLmxvZygncmVjIGlzIHVuZGVmaW5lZCcpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRmb3IgKHZhciBmaWVsZE5hbWUgaW4gcmVjKSB7XG5cdFx0XHR2YXIgZmllbGQgPSByZWNbZmllbGROYW1lXTtcblx0XHRcdGlmIChmaWVsZCAhPSBudWxsICYmICEodHlwZW9mIGZpZWxkLnJlY29yZHMgPT09ICd1bmRlZmluZWQnKSkgcmVjW2ZpZWxkTmFtZV0gPSBTRi5mb3JtYXRUb0lkQXJyYXkoZmllbGQucmVjb3Jkcyk7XG5cdFx0fVxuXHRcdGlmICghKHR5cGVvZiByZWMuSWQgPT09ICd1bmRlZmluZWQnKSkge1xuXHRcdFx0cmVjLmlkID0gcmVjLklkO1xuXHRcdFx0ZGVsZXRlIHJlYy5JZDtcblx0XHR9XG5cdH0sXG5cdC8vIFRoaXMgaXMgYSBzdWIgbWV0aG9kIHRvIGZvcm1hdFJlY29yZC4gSXQgZm9ybWF0cyBhIGNoaWxkIHJlbGF0aW9uc2hpcCByZXN1bHQsIHJldHVybmVkIHdpdGhpbiBhIHJlY29yZFxuXHQvLyByZXN1bHQsIGludG8gYW4gaWQgYXJyYXkgZXhwZWN0ZWQgYnkgdGhlIGVtYmVyIHJlc3QgYWRhcHRlci5cblx0Zm9ybWF0VG9JZEFycmF5OiBmdW5jdGlvbiBmb3JtYXRUb0lkQXJyYXkocmVjb3Jkcykge1xuXHRcdHZhciBpZEFyciA9IFtdO1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHJlY29yZHMpKSBmb3IgKHZhciBpID0gMDsgaSA8IHJlY29yZHMubGVuZ3RoOyBpKyspIGlkQXJyLnB1c2gocmVjb3Jkc1tpXS5JZCk7ZWxzZSBpZEFyci5wdXNoKHJlY29yZHMuSWQpO1xuXHRcdHJldHVybiBpZEFycjtcblx0fSxcblx0Ly8gVGhpcyBtZXRob2QgZm9ybWF0cyBhbiBlbWJlciBTbmFwc2hvdCBvYmplY3QsIGludG8gYSBqYXZhc2NyaXB0IHJlcHJlc2VudGF0aW9uIG9mIGFuIFNPYmplY3QsIHJlYWR5IGZvclxuXHQvLyBzZW5kaW5nIHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIHNhbGVzZm9yY2Ugc29hcCBhcGkgaS5lLiBzZm9yY2UuY29ubmVjdGlvbi5jcmVhdGUvdXBkYXRlXG5cdHNmRm9ybWF0U25hcHNob3Q6IGZ1bmN0aW9uIHNmRm9ybWF0U25hcHNob3Qoc25hcHNob3QsIHR5cGUpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0dmFyIHNmTmFtZSA9IFNGLnNmcmlzZU5hbWUodHlwZS5tb2RlbE5hbWUpO1xuXHRcdHZhciBzbyA9IG5ldyB0aGlzLnNmb3JjZS5TT2JqZWN0KHNmTmFtZSk7XG5cdFx0aWYgKHNuYXBzaG90LmlkICE9IG51bGwpIHNvLklkID0gc25hcHNob3QuaWQ7XG5cdFx0c25hcHNob3QuZWFjaEF0dHJpYnV0ZShmdW5jdGlvbiAobmFtZSwgbWV0YSkge1xuXHRcdFx0dmFyIG1ldGFPcHRpb25zID0gdHlwZS5tZXRhRm9yUHJvcGVydHkobmFtZSkub3B0aW9ucztcblx0XHRcdGlmIChtZXRhT3B0aW9ucy51cGRhdGVhYmxlKSBzb1tuYW1lXSA9IF90aGlzLnNlcmlhbGlzZVByaW1pdGl2ZShzbmFwc2hvdC5hdHRyKG5hbWUpKTtcblx0XHR9KTtcblx0XHRzbmFwc2hvdC5lYWNoUmVsYXRpb25zaGlwKGZ1bmN0aW9uIChuYW1lLCBtZXRhKSB7XG5cdFx0XHRpZiAobWV0YS5raW5kID09PSAnYmVsb25nc1RvJykge1xuXHRcdFx0XHR2YXIgbWV0YU9wdGlvbnMgPSB0eXBlLm1ldGFGb3JQcm9wZXJ0eShuYW1lKS5vcHRpb25zO1xuXHRcdFx0XHRpZiAobWV0YU9wdGlvbnMudXBkYXRlYWJsZSkgc29bbmFtZV0gPSBzbmFwc2hvdC5iZWxvbmdzVG8obmFtZSwgeyBpZDogdHJ1ZSB9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gc287XG5cdH0sXG5cdHNlcmlhbGlzZVByaW1pdGl2ZTogZnVuY3Rpb24gc2VyaWFsaXNlUHJpbWl0aXZlKHByaW1pdGl2ZSkge1xuXHRcdGlmIChwcmltaXRpdmUgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gcHJpbWl0aXZlLnRvSVNPU3RyaW5nKCk7XG5cdFx0cmV0dXJuIHByaW1pdGl2ZTtcblx0fSxcblx0Ly8gVGhpcyBpcyB0aGUgZ2VuZXJhbCBxdWVyeSBtZXRob2QgdXNlZCB0byBleGVjdXRlIGEgc29hcCBhcGkgcXVlcnkgdG8gYSBzYWxlc2ZvcmNlIG9yZy5cblx0Ly8gU2VlOiBzZm9yY2UuY29ubmVjdGlvbi5xdWVyeShxLCBjYlN1Y2Nlc3MsIGNiRXJyKTtcblx0cXVlcnk6IGZ1bmN0aW9uIHF1ZXJ5KHN0b3JlLCB0eXBlLCBfcXVlcnksIGNiU3VjY2VzcywgY2JFcnIpIHtcblx0XHR2YXIgcSA9IG51bGw7XG5cdFx0dHJ5IHtcblx0XHRcdHZhciBzZk5hbWUgPSBTRi5zZnJpc2VOYW1lKHR5cGUubW9kZWxOYW1lKTtcblx0XHRcdHEgPSBTRi5jcmVhdGVSb290U29xbFNlbGVjdCh0eXBlLCBzZk5hbWUsIF9xdWVyeSk7XG5cdFx0XHR0aGlzLnNmb3JjZS5jb25uZWN0aW9uLnF1ZXJ5KHEsIGNiU3VjY2VzcywgY2JFcnIpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKHEpO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH0sXG5cdC8vIFRoaXMgaXMgYW4gaW5pdGlhbGlzYXRpb24gbWV0aG9kIHRvIGR5bmFtaWNhbGx5IGNyZWF0ZSB0aGUgZW1iZXIgbW9kZWxzLCB1c2VkIGJ5IGFuIGVtYmVyIGFwcCwgYnlcblx0Ly8gcmVhZGluZyB0aGUgc2FsZXNmb3JjZSBzY2hlbWEgdmlhIHRoZSBzYWxlc2ZvcmNlIHNvYXAgYXBpLiBJZiB0aGlzIGluaXRpYWxpc2F0aW9uIG1ldGhvZCBpcyB1c2VkLFxuXHQvLyBhcHAgaW5pdGlhbGlzYXRpb24gc2hvdWxkIGhhcHBlbiBpbiB0aGUgY2FsbGJhY2s6IGNiXG5cdC8vXG5cdC8vIFRoZSBvYmpOYW1lcyBwYXJhbWV0ZXIgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggc2FsZXNmb3JjZSB0eXBlcy9vYmplY3RzIHlvdSB3YW50IHRvIGNyZWF0ZVxuXHQvLyBlbWJlciBtb2RlbHMgZm9yLiBJZiB5b3Ugb21pdCB0aGlzIHBhcmFtZXRlciwgbW9kZWxzIHdpbGwgYmUgY3JlYXRlZCBmb3IgYWxsIHR5cGVzL29iamVjdHNcblx0Y3JlYXRlRW1iZXJNb2RlbHM6IGZ1bmN0aW9uIGNyZWF0ZUVtYmVyTW9kZWxzKG9wdHMpIHtcblx0XHR2YXIgY29ubmVjdGlvbiA9IG9wdHMuY29ubmVjdGlvbixcblx0XHQgICAgY2IgPSBvcHRzLmNiLFxuXHRcdCAgICBvYmpOYW1lcyA9IG9wdHMub2JqTmFtZXM7XG5cdFx0dmFyIG93bmVyID0gb3B0cy5vd25lciA/IG9wdHMub3duZXIgOiB7fTtcblxuXHRcdHZhciB3ID0gbmV3IF9zYWxlc2ZvcmNlU2NoZW1hUmVhZGVyMlsnZGVmYXVsdCddKGNvbm5lY3Rpb24sIDEwMCwgZnVuY3Rpb24gKCkge1xuXHRcdFx0U0YuY3JlYXRlTW9kZWxzRm9yU09iamVjdHMob3duZXIsIHcuY29tcGxldGVNZXRhcywgdywgdHlwZUZpbHRlcik7XG5cdFx0XHRjYihvd25lcik7XG5cdFx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0Y2IobnVsbCwgJ0ZhaWxlZCB0byBmZXRjaCBzYWxlc2ZvcmNlIHNjaGVtYSBkZWZpbml0aW9ucyBmb3IgdGhlIHByb3ZpZGVkIG9iamVjdCBuYW1lcycpO1xuXHRcdH0sIG9iak5hbWVzKTtcblx0fVxufTtcblxuLy8gVGhpcyBpcyBhbiBpbml0aWFsaXNhdGlvbiBtZXRob2QgZm9yIGNyZWF0aW5nIHRoZSBlbWJlciBtb2RlbCBkZWZpbml0aW9ucyBhbmQgZG93bmxvYWRpbmcgdGhlbSBpbiBhXG4vLyBzZXJpYWxpc2VkIGpzIG9iamVjdC4gT25jZSB0aGUgc3RhdGljIGpzIG9iamVjdCBoYXMgYmVlbiBjcmVhdGVkIGl0IGNhbiBiZSB1c2VkIHRvIGluaXRpYWxpc2Vcbi8vIHRoZSBtb2RlbHMgYnkgdXNpbmcgdGhlIGNyZWF0ZU1vZGVsc0Zyb21FeHRlbnNpb25NYXAgbWV0aG9kLiBJZiB5b3UgdXNlIHRoaXMgbWV0aG9kIHRvIGluaXRpYWxpc2UsIHlvdXJcbi8vIGFwcCB3aWxsIHN0YXJ0IHVwIGZhc3RlciBhbmQgeW91IHdvbid0IG5lZWQgdG8gaW5pdGlhbGlzZSB5b3VyIGFwcCBpbiBhIGNhbGxiYWNrLiBCZWFyIGluIG1pbmQgdGhhdCBhbnlcbi8vIG1vZGVsIGNoYW5nZXMgb24gc2FsZXNmb3JjZSB3aWxsIG1lYW4gdGhhdCB5b3UnbGwgaGF2ZSB0byByZWdlbmVyYXRlIHRoZSBzZXJpYWxpc2VkIGpzIG9iamVjdCBpbnRvIGEgZmlsZS5cbi8vXG4vLyBTZWUgdGhlIGNyZWF0ZU1vZGVsc0ZvclNPYmplY3RzIG1ldGhvZCBmb3IgdGhlIG9iak5hbWVzIGRlZmluaXRpb24uIElmIG9iak5hbWVzIGlzbid0IHVzZWRcbi8vICAgIC8vIGFsbCB0aGUgc2FsZXNmb3JjZSBvYmplY3QgZGVmaW5pdGlvbnMgYXJlIGNvbnZlcnRlZCBpbnRvIGVtYmVyIG1vZGVscy5cbi8vIGRvd25sb2FkRW1iZXJNb2RlbHModHlwZUZpbHRlcil7XG4vLyBcdHRocm93ICdjdXJyZW50bHkgbm90IGltcGxlbWVudGVkJztcbi8vIFx0dmFyIHcgPSBuZXcgU2NoZW1hUmVhZGVyKDEwMCwgKCkgPT4ge1xuLy8gXHRcdHZhciBzZXJpYWxpc2VkID0gSlNPTi5zdHJpbmdpZnkoU0YuY3JlYXRlRW1iZXJNb2RlbERlZmluaXRpb25zKHcuY29tcGxldGVNZXRhcywgdywgdHlwZUZpbHRlciksIG51bGwsIDEpO1xuLy8gXHRcdHdpbmRvdy5vcGVuKCdkYXRhOnRleHQvcGxhaW4sJyArIGVuY29kZVVSSUNvbXBvbmVudCgndmFyIG1vZGVsRGVmaW5pdGlvbnMgPSAnICsgc2VyaWFsaXNlZCArICc7JykpO1xuLy8gXHR9KTtcbi8vIH0sXG5TRk1vZGVscy5mYWN0b3J5ID0ge1xuXHQvLyBQcm9kdWNlcyBhIGNhY2hlIG9iamVjdCB1c2VkIGluIGNyZWF0aW5nIHRoZSBlbWJlciBtb2RlbCBkZWZpbml0aW9uc1xuXHRDYWNoZTogZnVuY3Rpb24gQ2FjaGUoKSB7XG5cdFx0dGhpcy5ub25VcGRhdGVhYmxlRmllbGRzID0ge307XG5cdFx0dGhpcy5tdWx0aXR5cGVkUmVmZXJlbmNlRmllbGRzID0ge307XG5cdFx0dGhpcy5pbnZlcnNGaWVsZHMgPSB7fTtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHR0aGlzLmxvZ05vblVwZGF0ZWFibGVGaWVsZCA9IGZ1bmN0aW9uIChvYmplY3ROYW1lLCBmaWVsZE5hbWUpIHtcblx0XHRcdHRoYXQubm9uVXBkYXRlYWJsZUZpZWxkc1tvYmplY3ROYW1lLnRvTG93ZXJDYXNlKCkgKyAnLicgKyBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKV0gPSB0cnVlO1xuXHRcdH07XG5cdFx0dGhpcy5pc1VwZGF0ZWFibGVGaWVsZCA9IGZ1bmN0aW9uIChvYmplY3ROYW1lLCBmaWVsZE5hbWUpIHtcblx0XHRcdHJldHVybiAhdGhhdC5ub25VcGRhdGVhYmxlRmllbGRzW29iamVjdE5hbWUudG9Mb3dlckNhc2UoKSArICcuJyArIGZpZWxkTmFtZS50b0xvd2VyQ2FzZSgpXTtcblx0XHR9O1xuXHRcdHRoaXMubG9nTXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkID0gZnVuY3Rpb24gKG9iamVjdE5hbWUsIGZpZWxkTmFtZSkge1xuXHRcdFx0dGhhdC5tdWx0aXR5cGVkUmVmZXJlbmNlRmllbGRzW29iamVjdE5hbWUudG9Mb3dlckNhc2UoKSArICcuJyArIGZpZWxkTmFtZS50b0xvd2VyQ2FzZSgpXSA9IHRydWU7XG5cdFx0fTtcblx0XHR0aGlzLmlzTXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkID0gZnVuY3Rpb24gKG9iamVjdE5hbWUsIGZpZWxkTmFtZSkge1xuXHRcdFx0cmV0dXJuIHRoYXQubXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkc1tvYmplY3ROYW1lLnRvTG93ZXJDYXNlKCkgKyAnLicgKyBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKV07XG5cdFx0fTtcblx0XHR0aGlzLmlzUmVmZXJlbmNlZEJ5TXVsdGl0eXBlZFJlZmVyZW5jZSA9IGZ1bmN0aW9uIChyZWxhdGlvbnNoaXApIHtcblx0XHRcdHJldHVybiB0aGF0LmlzTXVsdGl0eXBlZFJlZmVyZW5jZUZpZWxkKHJlbGF0aW9uc2hpcC5jaGlsZFNPYmplY3QsIHJlbGF0aW9uc2hpcC5maWVsZCk7XG5cdFx0fTtcblx0XHR0aGlzLmdldEludmVyc01hcCA9IGZ1bmN0aW9uIChvYmplY3ROYW1lKSB7XG5cdFx0XHR2YXIgbWFwID0gdGhhdC5pbnZlcnNGaWVsZHNbb2JqZWN0TmFtZV07XG5cdFx0XHRpZiAodHlwZW9mIG1hcCA9PT0gJ3VuZGVmaW5lZCcgfHwgbWFwID09IG51bGwpIHtcblx0XHRcdFx0bWFwID0ge307XG5cdFx0XHRcdHRoYXQuaW52ZXJzRmllbGRzW29iamVjdE5hbWVdID0gbWFwO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1hcDtcblx0XHR9O1xuXHRcdHRoaXMubG9nSW52ZXJzZXMgPSBmdW5jdGlvbiAob2JqZWN0TmFtZSwgZmllbGQxTmFtZSwgZmllbGQyTmFtZSkge1xuXHRcdFx0dmFyIG1hcCA9IHRoYXQuZ2V0SW52ZXJzTWFwKG9iamVjdE5hbWUpO1xuXHRcdFx0bWFwW2ZpZWxkMU5hbWVdID0gZmllbGQyTmFtZTtcblx0XHRcdG1hcFtmaWVsZDJOYW1lXSA9IGZpZWxkMU5hbWU7XG5cdFx0fTtcblx0XHR0aGlzLmdldEludmVyc2UgPSBmdW5jdGlvbiAob2JqZWN0TmFtZSwgZmllbGROYW1lKSB7XG5cdFx0XHR2YXIgaW52ZXJzZSA9IHRoYXQuZ2V0SW52ZXJzTWFwKG9iamVjdE5hbWUpW2ZpZWxkTmFtZV07XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGludmVyc2UgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IGludmVyc2U7XG5cdFx0fTtcblx0fVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gU0ZNb2RlbHM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzcyODM2MC9ob3ctZG8taS1jb3JyZWN0bHktY2xvbmUtYS1qYXZhc2NyaXB0LW9iamVjdFxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbnZhciBjbG9uZSA9IGZ1bmN0aW9uIGNsb25lKG9iaikge1xuXHRpZiAobnVsbCA9PSBvYmogfHwgXCJvYmplY3RcIiAhPSB0eXBlb2Ygb2JqKSByZXR1cm4gb2JqO1xuXHR2YXIgY29weSA9IG9iai5jb25zdHJ1Y3RvcigpO1xuXHRmb3IgKHZhciBhdHRyIGluIG9iaikge1xuXHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoYXR0cikpIGNvcHlbYXR0cl0gPSBvYmpbYXR0cl07XG5cdH1cblx0cmV0dXJuIGNvcHk7XG59O1xuXG4vLyBSZXF1aXJlcyBhIHNhbGVzZm9yY2UgY29ubmVjdGlvbiBvYmplY3QsIHVubGVzcyB0aGUgbWV0YWRhdGEgaXMgcGFzc2VkIGRpcmVjdGx5XG4vLyB0byB0aGUgcmVhZGVyLlxuLy8gTGVhdmUgb25TdWNjZXNzIG91dCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBwb3B1bGF0ZSBtZXRhZGF0YSBvbiBjb25zdHJ1Y3Rpb25cbnZhciBTY2hlbWFSZWFkZXIgPSBmdW5jdGlvbiBTY2hlbWFSZWFkZXIoY29ubmVjdGlvbiwgYmF0Y2hTaXplLCBvblN1Y2Nlc3MsIG9uRmFpbHVyZSwgb2JqTmFtZXMpIHtcblx0dGhpcy50eXBlID0gJ1NjaGVtYVJlYWRlcic7XG5cdHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG5cdHRoaXMuaXNGZXRjaGluZyA9IHRydWU7XG5cdHRoaXMuYmF0Y2hTaXplID0gdHlwZW9mIGJhdGNoU2l6ZSA9PSAndW5kZWZpbmVkJyA/IDEwMCA6IGJhdGNoU2l6ZTtcblx0dGhpcy5za2lwRXJyb3JzID0gdHlwZW9mIG9uRmFpbHVyZSA9PSAndW5kZWZpbmVkJyA/IHRydWUgOiBmYWxzZTtcblx0dGhpcy5yZWFkUmVsV2l0aFVkZWZOYW1lcyA9IGZhbHNlO1xuXG5cdGlmICh0eXBlb2Ygb25TdWNjZXNzID09PSAnZnVuY3Rpb24nKSB0aGlzLnBvcHVsYXRlKG9uU3VjY2Vzcywgb25GYWlsdXJlLCBvYmpOYW1lcyk7XG59O1xuXG5TY2hlbWFSZWFkZXIucHJvdG90eXBlID0ge1xuXHRwb3B1bGF0ZTogZnVuY3Rpb24gcG9wdWxhdGUob25TdWNjZXNzLCBvbkZhaWx1cmUsIG9iak5hbWVzKSB7XG5cdFx0dGhpcy5pc0ZldGNoaW5nID0gdHJ1ZTtcblx0XHR0aGlzLnByZU1ldGFzID0gW107XG5cdFx0dGhpcy5jb21wbGV0ZU1ldGFzID0ge307XG5cdFx0dGhpcy5uYW1lQmF0Y2hlcyA9IFtdO1xuXG5cdFx0dmFyIHRocmVhZENvdW50ID0gMDtcblx0XHRpZiAoIW9iak5hbWVzKSB7XG5cdFx0XHR2YXIgcmVzID0gdGhpcy5jb25uZWN0aW9uLmRlc2NyaWJlR2xvYmFsKCk7XG5cdFx0XHR0aGlzLnByZU1ldGFzID0gcmVzLmdldEFycmF5KFwic29iamVjdHNcIik7XG5cdFx0fSBlbHNlIHRoaXMucHJlTWV0YXMgPSBvYmpOYW1lcztcblxuXHRcdC8vIFB1c2ggYmF0Y2hlc1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmVNZXRhcy5sZW5ndGg7KSB7XG5cdFx0XHR2YXIgYmF0Y2ggPSBbXTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBpIDwgdGhpcy5wcmVNZXRhcy5sZW5ndGggJiYgaiA8IHRoaXMuYmF0Y2hTaXplOyBpKyssIGorKykgYmF0Y2gucHVzaCh0aGlzLnByZU1ldGFzW2ldLm5hbWUpO1xuXHRcdFx0dGhpcy5uYW1lQmF0Y2hlcy5wdXNoKGJhdGNoKTtcblx0XHR9XG5cblx0XHR2YXIgZmFpbGVkID0gZmFsc2U7XG5cdFx0dmFyIGhhbmRsZWRGYWlsdXJlID0gZmFsc2U7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHZhciBjYiA9IGZ1bmN0aW9uIGNiKGVycikge1xuXHRcdFx0aWYgKGhhbmRsZWRGYWlsdXJlKSByZXR1cm47XG5cdFx0XHRpZiAoZmFpbGVkKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0XHRcdG9uRmFpbHVyZShlcnIpO1xuXHRcdFx0XHRoYW5kbGVkRmFpbHVyZSA9IHRydWU7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRocmVhZENvdW50LS07XG5cdFx0XHRjb25zb2xlLmxvZyh0aHJlYWRDb3VudCk7XG5cdFx0XHRpZiAodGhyZWFkQ291bnQgPD0gMCkge1xuXHRcdFx0XHR0aGF0LmlzRmV0Y2hpbmcgPSBmYWxzZTtcblx0XHRcdFx0b25TdWNjZXNzKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR2YXIgZmFpbCA9IGZ1bmN0aW9uIGZhaWwoZXJyKSB7XG5cdFx0XHRpZiAoIXRoYXQuc2tpcEVycm9ycykge1xuXHRcdFx0XHRmYWlsZWQgPSB0cnVlO1xuXHRcdFx0XHRvbkZhaWx1cmUoZXJyKTtcblx0XHRcdH0gZWxzZSBjb25zb2xlLmxvZyhlcnIpOyAvLyBDdXJyZW50bHkgb25seSBsb2dnaW5nIHRoZSBlcnJvclxuXHRcdFx0Y2IoZXJyKTtcblx0XHR9O1xuXG5cdFx0Ly8gR2V0IGNvbXBsZXRlIG1ldGFzXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5hbWVCYXRjaGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aHJlYWRDb3VudCsrO1xuXHRcdFx0Y29uc29sZS5sb2coJ0JhdGNoIDogJyArIHRoaXMubmFtZUJhdGNoZXNbaV0pO1xuXHRcdFx0dGhpcy5mZXRjaENvbXBsZXRlTWV0YSh0aGlzLm5hbWVCYXRjaGVzW2ldLCBjYiwgZmFpbCk7XG5cdFx0fVxuXHR9LFxuXHQvLyBSZWFkIHRoZSBhcnJheSBvZiBwcmUgbWV0YXMgYW5kIHBvcHVsYXRlIGNvbXBsZXRlTWV0YXNcblx0ZmV0Y2hDb21wbGV0ZU1ldGE6IGZ1bmN0aW9uIGZldGNoQ29tcGxldGVNZXRhKG9ianMsIHN1Y2Nlc3MsIGZhaWwpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGZldGNoU3VjY2VzcyA9IGZ1bmN0aW9uIGZldGNoU3VjY2VzcyhtZXRhcykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtZXRhcy5sZW5ndGg7IGkrKykgdGhhdC5yZWdpc3Rlck1ldGEobWV0YXNbaV0pO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRmYWlsKGUpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0c3VjY2VzcygpO1xuXHRcdFx0fSAvLyBjYWxsIHRoZSBjYWxsYmFja1xuXHRcdH07XG5cdFx0dGhpcy5jb25uZWN0aW9uLmRlc2NyaWJlU09iamVjdHMob2JqcywgZmV0Y2hTdWNjZXNzLCBmYWlsKTtcblx0fSxcblx0cmVnaXN0ZXJNZXRhOiBmdW5jdGlvbiByZWdpc3Rlck1ldGEob2JqKSB7XG5cdFx0dGhpcy5jb21wbGV0ZU1ldGFzW29iai5uYW1lXSA9IG9iajtcblx0fSxcblx0Ly8gc2VlIGRlZXByZWFkIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRzaGFsbG93UmVhZEZpZWxkczogZnVuY3Rpb24gc2hhbGxvd1JlYWRGaWVsZHModmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGZvciAodmFyIG9iak5hbWUgaW4gdGhpcy5jb21wbGV0ZU1ldGFzKSBpZiAodGhpcy5zaGFsbG93UmVhZE1ldGFGaWVsZHNBYnIodGhpcy5jb21wbGV0ZU1ldGFzW29iak5hbWVdLCB2aXNpdG9yKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHR9LFxuXHQvLyBzZWUgZGVlcHJlYWQgZmllbGRzIGZvciB0aGUgdmlzaXRvciBkZWZpbml0aW9uXG5cdHNoYWxsb3dSZWFkTWV0YUZpZWxkczogZnVuY3Rpb24gc2hhbGxvd1JlYWRNZXRhRmllbGRzKG9iaiwgdmlzaXRlZCwgcGF0aCwgdmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGlmICh0eXBlb2Ygb2JqLmZpZWxkcyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmouZmllbGRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZiA9IG9iai5maWVsZHNbaV07XG5cdFx0XHRpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKSBjb250aW51ZTtcblx0XHRcdHZhciBzdWJQYXRoID0gcGF0aC5jb25jYXQoZik7XG5cdFx0XHQvLyBzdWJQYXRoLnB1c2goZik7XG5cdFx0XHRpZiAodmlzaXRvcihmLCBvYmosIHN1YlBhdGgsIHRoaXMpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0fVxuXHR9LFxuXHQvLyBBbiBhYmJyZXZpYXRpb24gKEFicikgbWV0aG9kIHRvIHNoYWxsb3cgcmVhZCBiZWdpbm5pbmcgd2l0aCB0aGUgcGFzc2VkIG9iamVjdFxuXHQvLyBzZWUgZGVlcHJlYWQgZmllbGRzIGZvciB0aGUgdmlzaXRvciBkZWZpbml0aW9uXG5cdHNoYWxsb3dSZWFkTWV0YUZpZWxkc0FicjogZnVuY3Rpb24gc2hhbGxvd1JlYWRNZXRhRmllbGRzQWJyKG9iaiwgdmlzaXRvcikge1xuXHRcdHJldHVybiB0aGlzLnNoYWxsb3dSZWFkTWV0YUZpZWxkcyhvYmosIHt9LCBbXSwgdmlzaXRvcik7XG5cdH0sXG5cdC8vIHZpc2l0b3IgZGVmaW5pdGlvbjogZnVuY3Rpb24oZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdC8vIFx0XHQvLyByZXR1cm4gJ3Rlcm0nIC8vIGlmIHlvdSB3YW50IHRvIHRlcm1pbmF0ZSB0aGUgc2NoZW1hIHJlYWRcblx0Ly8gfVxuXHQvLyBmaWVsZCA6IHt9IC0gdGhlIGZpZWxkIGRlc2NyaXB0aW9uIHVuZGVyIHJlYWQsXG5cdC8vIG9iamVjdCA6IHt9IC0gdGhlIHNvYmplY3QgZGVzY3JpcHRpb24gdW5kZXIgcmVhZFxuXHQvLyBwYXRoIDogW10gLSBhIGxpc3Qgb2YgZGVzY3JpcHRpb25zIHN0YXJ0aW5nIHdpdGggdGhlIHNvYmplY3QgZGVzY3JpcHRpb24sIHRyYWlsZWQgYnlcblx0Ly9cdFx0XHRcdHJlbGF0aW9uc2hpcCBkZXNjcmlwdGlvbnMgYW5kIGVuZGluZyB3aXRoIGEgZmllbGQgZGVzY3JpcHRpb25cblx0Ly8gcmVhZGVyIDogdGhlIHJlYWRlciB3aGljaCBpcyBjdXJyZW50bHkgdXNlZCB0byByZWFkIHRoZSBzY2hlbWFcblx0ZGVlcFJlYWRGaWVsZHM6IGZ1bmN0aW9uIGRlZXBSZWFkRmllbGRzKHZpc2l0b3IpIHtcblx0XHR0aGlzLnZhbGlkYXRlU3RhdGUoKTtcblx0XHRmb3IgKHZhciBvYmpOYW1lIGluIHRoaXMuY29tcGxldGVNZXRhcykgaWYgKHRoaXMuZGVlcFJlYWRNZXRhRmllbGRzQWJyKHRoaXMuY29tcGxldGVNZXRhc1tvYmpOYW1lXSwgdmlzaXRvcikgPT09ICd0ZXJtJykgcmV0dXJuICd0ZXJtJztcblx0fSxcblx0Ly8gc2VlIGRlZXByZWFkIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRkZWVwUmVhZE1ldGFGaWVsZHM6IGZ1bmN0aW9uIGRlZXBSZWFkTWV0YUZpZWxkcyhvYmosIHZpc2l0ZWQsIHBhdGgsIHZpc2l0b3IpIHtcblx0XHR0aGlzLnZhbGlkYXRlU3RhdGUoKTtcblx0XHRpZiAodmlzaXRlZFtvYmoubmFtZV0gPT0gdHJ1ZSkgcmV0dXJuO1xuXHRcdGlmICh0eXBlb2Ygb2JqLmZpZWxkcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblx0XHR2aXNpdGVkW29iai5uYW1lXSA9IHRydWU7XG5cblx0XHRpZiAocGF0aC5sZW5ndGggPT0gMCkgcGF0aC5wdXNoKG9iaik7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iai5maWVsZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBmID0gb2JqLmZpZWxkc1tpXTtcblx0XHRcdGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpIGNvbnRpbnVlO1xuXHRcdFx0dmFyIHN1YlBhdGggPSBwYXRoLmNvbmNhdChmKTtcblx0XHRcdGlmICh2aXNpdG9yKGYsIG9iaiwgc3ViUGF0aCwgdGhpcykgPT09ICd0ZXJtJykgcmV0dXJuICd0ZXJtJztcblx0XHRcdGlmIChmLnR5cGUgPT09ICdyZWZlcmVuY2UnKSB7XG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShmLnJlZmVyZW5jZVRvKSkge1xuXHRcdFx0XHRcdGlmICh0aGlzLmRlZXBSZWFkTWV0YUZpZWxkcyh0aGlzLmNvbXBsZXRlTWV0YXNbZi5yZWZlcmVuY2VUb10sIGNsb25lKHZpc2l0ZWQpLCBzdWJQYXRoLCB2aXNpdG9yKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZi5yZWZlcmVuY2VUby5sZW5ndGg7IGorKykgaWYgKHRoaXMuZGVlcFJlYWRNZXRhRmllbGRzKHRoaXMuY29tcGxldGVNZXRhc1tmLnJlZmVyZW5jZVRvW2pdXSwgY2xvbmUodmlzaXRlZCksIHN1YlBhdGgsIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdC8vIEFuIGFiYnJldmlhdGlvbiAoQWJyKSBtZXRob2QgdG8gZGVlcCByZWFkIHN0YXJ0aW5nIHdpdGggdGhlIHBhc3NlZCBvYmplY3Rcblx0Ly8gc2VlIGRlZXByZWFkIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRkZWVwUmVhZE1ldGFGaWVsZHNBYnI6IGZ1bmN0aW9uIGRlZXBSZWFkTWV0YUZpZWxkc0FicihvYmosIHZpc2l0b3IpIHtcblx0XHRyZXR1cm4gdGhpcy5kZWVwUmVhZE1ldGFGaWVsZHMob2JqLCBbXSwgW10sIHZpc2l0b3IpO1xuXHR9LFxuXHQvLyB2aXNpdG9yIGRlZmluaXRpb246IGZ1bmN0aW9uKHJlbCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0Ly8gXHRcdC8vIHJldHVybiAndGVybScgLy8gaWYgeW91IHdhbnQgdG8gdGVybWluYXRlIHRoZSBzY2hlbWEgcmVhZFxuXHQvLyB9XG5cdC8vIHJlbCA6IHt9IC0gdGhlIHJlbGF0aW9uc2hpcCBkZXNjcmlwdGlvbiB1bmRlciByZWFkLFxuXHQvLyBvYmplY3QgOiB7fSAtIHRoZSBzb2JqZWN0IGRlc2NyaXB0aW9uIHVuZGVyIHJlYWRcblx0Ly8gcGF0aCA6IFtdIC0gYSBsaXN0IG9mIGRlc2NyaXB0aW9ucyBzdGFydGluZyB3aXRoIHRoZSBzb2JqZWN0IGRlc2NyaXB0aW9uLCB0cmFpbGVkIGJ5XG5cdC8vXHRcdFx0XHRyZWxhdGlvbnNoaXAgZGVzY3JpcHRpb25zXG5cdC8vIHJlYWRlciA6IHRoZSByZWFkZXIgd2hpY2ggaXMgY3VycmVudGx5IHVzZWQgdG8gcmVhZCB0aGUgc2NoZW1hXG5cdHNoYWxsb3dSZWFkQ2hpbGRSZWxhdGlvbnNoaXBzOiBmdW5jdGlvbiBzaGFsbG93UmVhZENoaWxkUmVsYXRpb25zaGlwcyh2aXNpdG9yKSB7XG5cdFx0dGhpcy52YWxpZGF0ZVN0YXRlKCk7XG5cdFx0Zm9yICh2YXIgb2JqTmFtZSBpbiB0aGlzLmNvbXBsZXRlTWV0YXMpIGlmICh0aGlzLnNoYWxsb3dSZWFkTWV0YUNoaWxkUmVsYXRpb25zaGlwc0Ficih0aGlzLmNvbXBsZXRlTWV0YXNbb2JqTmFtZV0sIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdH0sXG5cdC8vIHNlZSBzaGFsbG93UmVhZENoaWxkUmVsYXRpb25zaGlwcyBmaWVsZHMgZm9yIHRoZSB2aXNpdG9yIGRlZmluaXRpb25cblx0c2hhbGxvd1JlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzOiBmdW5jdGlvbiBzaGFsbG93UmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHMob2JqLCB2aXNpdGVkLCBwYXRoLCB2aXNpdG9yKSB7XG5cdFx0dGhpcy52YWxpZGF0ZVN0YXRlKCk7XG5cdFx0aWYgKHR5cGVvZiBvYmouY2hpbGRSZWxhdGlvbnNoaXBzID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iai5jaGlsZFJlbGF0aW9uc2hpcHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciByID0gb2JqLmNoaWxkUmVsYXRpb25zaGlwc1tpXTtcblx0XHRcdGlmICh0eXBlb2YgciA9PT0gJ3VuZGVmaW5lZCcpIGNvbnRpbnVlO1xuXHRcdFx0dmFyIHN1YlBhdGggPSBwYXRoLmNvbmNhdChyKTtcblx0XHRcdGlmICh2aXNpdG9yKHIsIG9iaiwgc3ViUGF0aCwgdGhpcykgPT09ICd0ZXJtJykgcmV0dXJuICd0ZXJtJztcblx0XHR9XG5cdH0sXG5cdC8vIEFuIGFiYnJldmlhdGlvbiAoQWJyKSBtZXRob2QgdG8gc2hhbGxvdyByZWFkIHN0YXJ0aW5nIHdpdGggdGhlIHBhc3NlZCBvYmplY3Rcblx0Ly8gc2VlIHNoYWxsb3dSZWFkQ2hpbGRSZWxhdGlvbnNoaXBzIGZpZWxkcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRzaGFsbG93UmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHNBYnI6IGZ1bmN0aW9uIHNoYWxsb3dSZWFkTWV0YUNoaWxkUmVsYXRpb25zaGlwc0FicihvYmosIHZpc2l0b3IpIHtcblx0XHRyZXR1cm4gdGhpcy5zaGFsbG93UmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHMob2JqLCB7fSwgW10sIHZpc2l0b3IpO1xuXHR9LFxuXG5cdC8vIHNlZSBzaGFsbG93UmVhZENoaWxkUmVsYXRpb25zaGlwcyBmb3IgdGhlIHZpc2l0b3IgZGVmaW5pdGlvblxuXHRkZWVwUmVhZENoaWxkUmVsYXRpb25zaGlwczogZnVuY3Rpb24gZGVlcFJlYWRDaGlsZFJlbGF0aW9uc2hpcHModmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGZvciAodmFyIG9iak5hbWUgaW4gdGhpcy5jb21wbGV0ZU1ldGFzKSBpZiAodGhpcy5kZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHNBYnIodGhpcy5jb21wbGV0ZU1ldGFzW29iak5hbWVdLCB2aXNpdG9yKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHR9LFxuXHQvLyBzZWUgZGVlcHJlYWQgZmllbGRzIGZvciB0aGUgdmlzaXRvciBkZWZpbml0aW9uXG5cdGRlZXBSZWFkTWV0YUNoaWxkUmVsYXRpb25zaGlwczogZnVuY3Rpb24gZGVlcFJlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzKG9iaiwgdmlzaXRlZCwgcGF0aCwgdmlzaXRvcikge1xuXHRcdHRoaXMudmFsaWRhdGVTdGF0ZSgpO1xuXHRcdGlmICh2aXNpdGVkW29iai5uYW1lXSA9PSB0cnVlKSByZXR1cm47XG5cdFx0aWYgKHR5cGVvZiBvYmouY2hpbGRSZWxhdGlvbnNoaXBzID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXHRcdHZpc2l0ZWRbb2JqLm5hbWVdID0gdHJ1ZTtcblxuXHRcdGlmIChwYXRoLmxlbmd0aCA9PSAwKSBwYXRoLnB1c2gob2JqKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmNoaWxkUmVsYXRpb25zaGlwcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHIgPSBvYmouY2hpbGRSZWxhdGlvbnNoaXBzW2ldO1xuXHRcdFx0aWYgKHR5cGVvZiByID09PSAndW5kZWZpbmVkJykgY29udGludWU7XG5cdFx0XHR2YXIgc3ViUGF0aCA9IHBhdGguY29uY2F0KHIpO1xuXHRcdFx0aWYgKHZpc2l0b3Iociwgb2JqLCBzdWJQYXRoLCB0aGlzKSA9PT0gJ3Rlcm0nKSByZXR1cm4gJ3Rlcm0nO1xuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHIuY2hpbGRTT2JqZWN0KSkge1xuXHRcdFx0XHRpZiAodGhpcy5kZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHModGhpcy5jb21wbGV0ZU1ldGFzW3IuY2hpbGRTT2JqZWN0XSwgY2xvbmUodmlzaXRlZCksIHN1YlBhdGgsIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHIuY2hpbGRTT2JqZWN0Lmxlbmd0aDsgaisrKSBpZiAodGhpcy5kZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHModGhpcy5jb21wbGV0ZU1ldGFzW3IuY2hpbGRTT2JqZWN0W2pdXSwgY2xvbmUodmlzaXRlZCksIHN1YlBhdGgsIHZpc2l0b3IpID09PSAndGVybScpIHJldHVybiAndGVybSc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvLyBBbiBhYmJyZXZpYXRpb24gKEFicikgbWV0aG9kIHRvIGRlZXAgcmVhZCBzdGFydGluZyB3aXRoIHRoZSBwYXNzZWQgb2JqZWN0XG5cdC8vIHNlZSBkZWVwcmVhZCBmaWVsZHMgZm9yIHRoZSB2aXNpdG9yIGRlZmluaXRpb25cblx0ZGVlcFJlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzQWJyOiBmdW5jdGlvbiBkZWVwUmVhZE1ldGFDaGlsZFJlbGF0aW9uc2hpcHNBYnIob2JqLCB2aXNpdG9yKSB7XG5cdFx0cmV0dXJuIHRoaXMuZGVlcFJlYWRNZXRhQ2hpbGRSZWxhdGlvbnNoaXBzKG9iaiwge30sIFtdLCB2aXNpdG9yKTtcblx0fSxcblxuXHR2YWxpZGF0ZVN0YXRlOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXRlKCkge1xuXHRcdGlmICh0aGlzLmlzRmV0Y2hpbmcpIHRocm93IHRoaXMudHlwZSArIFwiIGhhc24ndCBmaW5pc2hlZCBmZXRjaGluZyBtZXRhZGF0YSBmcm9tIHRoZSBzZXJ2ZXJcIjtcblx0fVxuXG59O1xuXG4vLyBmaWx0ZXJzXG5TY2hlbWFSZWFkZXIuY3JlYXRlRmlsdGVyVmlzaXRvciA9IGZ1bmN0aW9uIChmaWx0ZXIsIHZpc2l0b3IpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChmaWVsZCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0XHRpZiAoZmlsdGVyKGZpZWxkLCBvYmplY3QsIHBhdGgsIHJlYWRlcikpIHZpc2l0b3IoZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKTtcblx0fTtcbn07XG5TY2hlbWFSZWFkZXIubmV3T2JqZWN0TmFtZUZpbHRlciA9IGZ1bmN0aW9uIChvYmpOYW1lLCB2aXNpdG9yLCBjYXNlU2Vuc2l0aXZlKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdFx0aWYgKCFjYXNlU2Vuc2l0aXZlICYmIG9iak5hbWUudG9Mb3dlckNhc2UoKSA9PT0gb2JqZWN0Lm5hbWUudG9Mb3dlckNhc2UoKSB8fCBjYXNlU2Vuc2l0aXZlICYmIG9iak5hbWUgPT09IG9iamVjdC5uYW1lKSB2aXNpdG9yKGZpZWxkLCBvYmplY3QsIHBhdGgsIHJlYWRlcik7XG5cdH07XG59O1xuU2NoZW1hUmVhZGVyLm5ld0ZpZWxkTmFtZUZpbHRlciA9IGZ1bmN0aW9uIChmaWVsZE5hbWUsIHZpc2l0b3IsIGNhc2VTZW5zaXRpdmUpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChmaWVsZCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpIHtcblx0XHRpZiAoIWNhc2VTZW5zaXRpdmUgJiYgZmllbGROYW1lLnRvTG93ZXJDYXNlKCkgPT09IGZpZWxkLm5hbWUudG9Mb3dlckNhc2UoKSB8fCBjYXNlU2Vuc2l0aXZlICYmIGZpZWxkTmFtZSA9PT0gZmllbGQubmFtZSkgdmlzaXRvcihmaWVsZCwgb2JqZWN0LCBwYXRoLCByZWFkZXIpO1xuXHR9O1xufTtcblNjaGVtYVJlYWRlci5uZXdGaWVsZEFuZE9iamVjdE5hbWVGaWx0ZXIgPSBmdW5jdGlvbiAoZmllbGROYW1lLCBvYmpOYW1lLCB2aXNpdG9yLCBjYXNlU2Vuc2l0aXZlKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoZmllbGQsIG9iamVjdCwgcGF0aCwgcmVhZGVyKSB7XG5cdFx0aWYgKCghY2FzZVNlbnNpdGl2ZSAmJiBmaWVsZE5hbWUudG9Mb3dlckNhc2UoKSA9PT0gZmllbGQubmFtZS50b0xvd2VyQ2FzZSgpIHx8IGNhc2VTZW5zaXRpdmUgJiYgZmllbGROYW1lID09PSBmaWVsZC5uYW1lKSAmJiAoIWNhc2VTZW5zaXRpdmUgJiYgb2JqTmFtZS50b0xvd2VyQ2FzZSgpID09PSBvYmplY3QubmFtZS50b0xvd2VyQ2FzZSgpIHx8IGNhc2VTZW5zaXRpdmUgJiYgb2JqTmFtZSA9PT0gb2JqZWN0Lm5hbWUpKSB2aXNpdG9yKGZpZWxkLCBvYmplY3QsIHBhdGgsIHJlYWRlcik7XG5cdH07XG59O1xuXG4vLyBtaXNjYWxsZW5lb3VzXG5TY2hlbWFSZWFkZXIuY29uY2F0UGF0aCA9IGZ1bmN0aW9uIChwYXRoKSB7XG5cdHZhciBzdHIgPSAnJztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSBzdHIgKz0gKGkgPiAwID8gJy4nIDogJycpICsgKHBhdGhbaV0ubmFtZSA/IHBhdGhbaV0ubmFtZSA6IHBhdGhbaV0ucmVsYXRpb25zaGlwTmFtZSk7XG5cdHJldHVybiBzdHI7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTY2hlbWFSZWFkZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9zY2hlbWEtcmVhZGVyLW5vZGUuanMnKTsiXX0=
