// import Ember from 'ember';
// import DS from 'ember-data';
// import SchemaReader from 'salesforce-schema-reader';
// var DS = require('ember-data');
import SchemaReader from 'salesforce-schema-reader';

var SF;
var SFModels = SF = {
	// Constants and methods for salesforce custom entity ending handling and conversions
	_sfRelExt : '__r',
	_sfNameExt : '__c',
	_emRelExt : 'rrr',
	_emNameExt : 'ccc',
	endsWith(str, ending) { return str.indexOf(ending, str.length - ending.length) > -1; },
	hasCustomSfRelationExtension(name) { return SF.endsWith(name, SF._sfRelExt); },
	hasCustomSfNameExtension(name) { return SF.endsWith(name, SF._sfNameExt); },
	hasCustomEmberRelationExtension(name) { return SF.endsWith(name, SF._emRelExt); },
	hasCustomEmberNameExtension(name) { return SF.endsWith(name, SF._emNameExt); },
	emberiseExtension(sfName) {
		if(SF.hasCustomSfNameExtension(sfName))
			return sfName.substring(0, sfName.length - SF._sfNameExt.length) + SF._emNameExt;
		else if(SF.hasCustomSfRelationExtension(sfName))
			return sfName.substring(0, sfName.length - SF._sfRelExt.length) + SF._emRelExt;
		return sfName;
	},
	sfriseExtension(emName) {
		if(SF.hasCustomEmberNameExtension(emName))
			return emName.substring(0, emName.length - SF._emNameExt.length) + SF._sfNameExt;
		else if(SF.hasCustomEmberRelationExtension(emName))
			return emName.substring(0, emName.length - SF._emRelExt.length) + SF._sfRelExt;
		return emName;
	},
	emberiseRefs(refs) {
		if(typeof refs === 'string') return SF.emberiseExtension(refs);
		else if(Array.isArray(refs)) {
			var emberRefs = [];
			for(var i = 0; i < refs.length; i++)
				emberRefs.push(SF.emberiseExtension(refs[i]));
			return emberRefs;
		}
		else
			return null;
	},
	sfriseRefs(refs) {
		if(typeof refs === 'string') return SF.sfriseExtension(refs);
		else if(Array.isArray(refs)) {
			var sfRefs = [];
			for(var i = 0; i < refs.length; i++)
				sfRefs.push(SF.sfriseExtension(refs[i]));
			return sfRefs;
		}
		else
			return null;
	},
	// A type map to convert javascript datatypes used by salesforce to datatypes used in ember
	// see : https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/field_types.htm
	sforceToEmberTypeMap : {
		id : 'string',
		boolean : 'boolean',
		string : 'string',
		datetime : 'date',
		currency : 'number',
		date : 'date',
		email : 'string',
		int : 'number',
		double : 'number',
		percent : 'number',
		location : 'string',
		phone : 'string',
		picklist : 'string',
		multipicklist : 'string',
		textarea : 'string',
		url : 'string',
		address : 'string',
		calculated : 'string',
		combobox : 'string',
		datacategorygroupreference : 'string',
		encryptedstring : 'string',
		junctionidlist : 'string',
		masterrecord : 'string',
	},
	// One of the main methods. Used to read the salesforce schema using the sObjectReader and create
	// matching ember models. Pass in a typeFilter function to limit the models created.
	// For example if you only want to create a model for a salesforce Account sobject:
	//
	// typeFilter = function(obj) { return obj.name === 'Account'; }. If the typeFilter isn't used 
    // all the salesforce object definitions are converted into ember models.
	createModelsForSObjects(emberApp, sObjectMetaMap, sObjectReader, typeFilter) {
		var modelExtensionMap = SF.createEmberModelDefinitions(sObjectMetaMap, sObjectReader, typeFilter);
		SF.createModelsFromExtensionMap(emberApp, modelExtensionMap);
	},
	// One of the main methods. Used to create the ember models from ember model definitions in a js object.
	// Use createEmberModelDefinitions to create the ember model definitions.
	createModelsFromExtensionMap(emberApp, modelExtensionMap) {
		var evaluatedMap = {};
		for(var sObjectName in modelExtensionMap) {
			var model = modelExtensionMap[sObjectName];
			evaluatedModel = {};
			for(var key in model) {
				if(typeof model[key] === 'string')
					evaluatedModel[key] = eval(model[key]);
				else
					evaluatedModel[key] = model[key];
			}
			var eon = SF.emberiseExtension(sObjectName);
			emberApp[eon] = DS.Model.extend(evaluatedModel);
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
	createEmberModelDefinitions(sObjectMetaMap, sObjectReader, typeFilter) {
		var modelExtensionMap = {};
		var cache = new SF.factory.Cache();
		
		for(var sObjectName in sObjectMetaMap) {
			if(typeFilter && !typeFilter(sObjectMetaMap[sObjectName]))
				continue;
			SF.recordInverses(sObjectName, sObjectReader, cache, typeFilter);
		}
		
		for(var sObjectName in sObjectMetaMap) {
			if(typeFilter && !typeFilter(sObjectMetaMap[sObjectName]))
				continue;
			var modelExtension = {};
			modelExtensionMap[sObjectName] = modelExtension;
			SF.createFieldModelForSObject(modelExtension, sObjectName, sObjectReader, cache, typeFilter);
		}
		
		for(var sObjectName in sObjectMetaMap) {
			if(typeFilter && !typeFilter(sObjectMetaMap[sObjectName]))
				continue;
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
	recordInverses(sObjectName, sObjectReader, cache, typeFilter) {
		var relVisitor = { 
			visit(rel, object, path, reader){
				if(typeof rel.relationshipName === 'undefined' || typeof rel.childSObject === 'undefined' || cache.isReferencedByMultitypedReference(rel))
					return;
				if(typeFilter && !typeFilter(sObjectReader.completeMetas[rel.childSObject]))
					return;
				cache.logInverses(sObjectName, rel.relationshipName, rel.field)
			}
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
	createFieldModelForSObject(modelExtension, sObjectName, sObjectReader, cache, typeFilter) {
		var fieldVisitor = { 
			visit(field, object, path, reader){
				var fn = field.name;
				var updateable = (field.updateable === 'true');
				if(!updateable)
					cache.logNonUpdateableField(sObjectName, fn)
				if(field.type === 'reference') {
					if(typeof field.referenceTo === 'string') {
						var erefs = field.referenceTo;
						if(typeFilter && !typeFilter(sObjectReader.completeMetas[erefs])) {
							modelExtension[fn] = "DS.attr('string', {updateable : " + updateable + "})";
							return;
						}
						if(field.custom == 'true')
							erefs = SF.emberiseExtension(erefs);
						var inverse = cache.getInverse(sObjectName, fn);
						if(inverse != null)
							modelExtension[fn] = "DS.belongsTo('" + erefs + "', { async : true, updateable : " + updateable + ", inverse : '" + inverse + "' })";
						else
							modelExtension[fn] = "DS.belongsTo('" + erefs + "', { async : true, updateable : " + updateable + ", inverse : null })";
					}
					else if(Array.isArray(field.referenceTo)){
						cache.logMultitypedReferenceField(sObjectName, fn)
						modelExtension[fn] = "DS.attr('string', { multiRef : true, updateable : " + updateable + " })";
					}
					else {
						//cache.logMultitypedReferenceField(sObjectName, fn)
						modelExtension[fn] = "DS.attr('string', {updateable : " + updateable + "})";
					}
				}
				else if(fn !== 'Id')
					modelExtension[fn] = "DS.attr('" + SF.sforceToEmberTypeMap[field.type] + "', {updateable : " + updateable + "})";
				console.log(sObjectReader.completeMetas.length + ' : field : ' + fn);
			}
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
	createRelationshipModelForSObject(modelExtension, sObjectName, sObjectReader, cache, typeFilter) {
		var relVisitor = { 
				visit(rel, object, path, reader){
					if(typeof rel.relationshipName === 'undefined' || typeof rel.childSObject === 'undefined' || cache.isReferencedByMultitypedReference(rel))
						return;
					if(typeFilter && !typeFilter(sObjectReader.completeMetas[rel.childSObject]))
						return;
					var rn = rel.relationshipName;
					var econ = SF.emberiseExtension(rel.childSObject);
					modelExtension[rn] = "DS.hasMany('" + econ + "', { async : true, inverse : '" + rel.field + "', })";
					console.log('child rel : ' + rn);
				}
			};
		
		var obj = sObjectReader.completeMetas[sObjectName];
		sObjectReader.shallowReadMetaChildRelationshipsAbr(obj, relVisitor);
	},
	// This method creates a soql select statement string to query an object with its fields and relationships
	// using the salesforce soap api - i.e- sforce.connection.query
	createSoqlSelect(type, name, whereClause, childSelectCreator){
		var q = 'select Id';
		type.eachAttribute((name, meta) => {
			q += ', ' + name;
		});
		type.eachRelationship((name, descriptor) => {
			q += ', ';
			if(descriptor.kind === 'hasMany')
				q += '(' + childSelectCreator(descriptor.type, descriptor.key) + ')';
			else
				q += descriptor.key;
		});
		q += ' from ' + name;
		if(!(typeof whereClause === 'undefined'))
			q += ' where ' + whereClause;
		return q;
	},
	// This method is part of creating a soql select statement. It handles the root select statement generation, 
	// not the child relationship statement generation
	createRootSoqlSelect(type, name, whereClause){
		return SF.createSoqlSelect(type, name, whereClause, SF.createIdSoqlSelect)
	},
	// Child relationships are passed to ember as a list of ids in the payload. This method is for child
	// relationship select statement generation.
	createIdSoqlSelect(type, name, whereClause){
		var q = 'select Id from ' + name;
		if(!(typeof whereClause === 'undefined'))
			q += ' where ' + whereClause;
		return q;
	},
	// In a soql select statement an array doesn't look like a serialised javascript array. This method 
	// handles the conversion.
	//
	// [1,2,"hello world"] -> (1,2,"hello world")
	toSoqlArray(array) {
		var soqlAry = "(";
		for(var i = 0; i < array.length; i++) {
			if(i > 0)
				soqlAry += ",'";
			else
				soqlAry += "'";
			soqlAry += array[i] + "'";
		}
		soqlAry += ")";
		return soqlAry;
	},
	// Salesforce, naturally doesn't return it's results in the format that the ember rest adapter would like.
	// This method reformats a salesforce payload into an ember payload.
	formatPayload(type, pl) {
		var formattedPl = {};
		var plural = Em.Inflector.inflector.pluralize(type.modelName);
		if(Array.isArray(pl.records)) {
			for(var i = 0; i < pl.records.length; i++)
				SF.formatRecord(pl.records[i]);
			formattedPl[plural] = pl.records;
		}
		else {
			SF.formatRecord(pl.records);
			formattedPl[plural] = [ pl.records ];
		}
		return formattedPl;
	},
	// This is a sub method to formatPayload. It formats a single record result returned by salesforce
	// into a payload expected by the ember rest adapter.
	formatRecord(rec) {
		if(!rec) {
			console.log('rec is undefined');
			return;
		}
		for(var fieldName in rec) {
			var field = rec[fieldName];
			if(field != null && !(typeof field.records === 'undefined'))
				rec[fieldName] = SF.formatToIdArray(field.records);
		}
		if(!(typeof rec.Id === 'undefined')) {
			rec.id = rec.Id;
			delete rec.Id;
		}
	},
	// This is a sub method to formatRecord. It formats a child relationship result, returned within a record
	// result, into an id array expected by the ember rest adapter.
	formatToIdArray(records) {
		var idArr = [];
		if(Array.isArray(records))
			for(var i = 0; i < records.length; i++)
				idArr.push(records[i].Id)
		else
			idArr.push(records.Id)
		return idArr;
	},
	// This method formats an ember Snapshot object, into a javascript representation of an SObject, ready for
	// sending to the server using the salesforce soap api i.e. sforce.connection.create/update
	sfFormatSnapshot(snapshot, type) {
		var sfName = SF.sfriseExtension(type.modelName);
		var so = new sforce.SObject(sfName);
		if(snapshot.id != null)
			so.Id = snapshot.id;
		snapshot.eachAttribute((name, meta) =>{
			var metaOptions = type.metaForProperty(name).options;
			if(metaOptions.updateable)
				so[name] = snapshot.attr(name);
		});	
		snapshot.eachRelationship((name, meta) => {
			if(meta.kind === 'belongsTo') {
				var metaOptions = type.metaForProperty(name).options;
				if(metaOptions.updateable)
					so[name] = snapshot.belongsTo(name, { id: true });
			}
		});
		return so;
	},
	// This is the general query method used to execute a soap api query to a salesforce org.
	// See: sforce.connection.query(q, cbSuccess, cbErr);
	query(store, type, query, cbSuccess, cbErr) {
		var q = null;
		try {
			var sfName = SF.sfriseExtension(type.modelName);
			q = SF.createRootSoqlSelect(type, sfName, query);
			sforce.connection.query(q, cbSuccess, cbErr);
		} catch(e) {
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
  createEmberModels(opts) {
  	var connection = opts.connection, cb = opts.cb, objNames = opts.objNames;
  	var owner = (opts.owner ? opts.owner : {});

		var w = new SchemaReader(connection, 100, 
			() => { 
				SF.createModelsForSObjects(owner, w.completeMetas, w, typeFilter);
				cb(owner);
			},
			() => {
				cb(null, 'Failed to fetch salesforce schema definitions for the provided object names');
			}, objNames);
	},
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
}

SFModels.factory = {
	// Produces a cache object used in creating the ember model definitions
	Cache() {
		this.nonUpdateableFields = {};
		this.multitypedReferenceFields = {};
		this.inversFields = {};
		var that = this; 
		
		this.logNonUpdateableField = (objectName, fieldName) => {
			that.nonUpdateableFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()] = true;
		};
		this.isUpdateableField = (objectName, fieldName) => {
			return !that.nonUpdateableFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()];
		};
		this.logMultitypedReferenceField = (objectName, fieldName) => {
			that.multitypedReferenceFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()] = true;
		};
		this.isMultitypedReferenceField = (objectName, fieldName) => {
			return that.multitypedReferenceFields[objectName.toLowerCase() + '.' + fieldName.toLowerCase()];
		};
		this.isReferencedByMultitypedReference = (relationship) => {
			return that.isMultitypedReferenceField(relationship.childSObject, relationship.field);
		};
		this.getInversMap = (objectName) => {
			var map = that.inversFields[objectName];
			if(typeof map === 'undefined' || map == null) {
				map = {};
				that.inversFields[objectName] = map;
			} 
			return map;
		};
		this.logInverses = (objectName, field1Name, field2Name) => {
			var map = that.getInversMap(objectName);
			map[field1Name] = field2Name;
			map[field2Name] = field1Name;
		};
		this.getInverse = (objectName, fieldName) => {
			var inverse = that.getInversMap(objectName)[fieldName];
			return (typeof inverse === 'undefined' ? null : inverse);
		};
	}
}

export default SFModels;