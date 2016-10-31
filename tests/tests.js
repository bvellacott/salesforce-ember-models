import { houseSchema as schema, Snapshot, sforce } from 'sforce-mocks';

SFModels.sforce = sforce;

var extend = (o1, o2) => {
	if(!o1 || !o2 || typeof o1 !== 'object' || typeof o2 !== 'object')
		return;
	for(var key in o2)
		if(o2.hasOwnProperty(key))
			o1[key] = o2[key];
	return o1;
};

var connection = {
	describeGlobal() {
		return { getArray(){ return [
			{ name : 'windowObj__c' }, 
			{ name : 'doorObj__c' }, 
			{ name : 'houseObj__c'} ]; }};
	},
	describeSObjects(objNames, success, fail) {
		var result = [];
		for(var i = 0; i < objNames.length; i++) {
			var def = schema.sfSchema[objNames[i]];
			if(!def)
				throw 'object definition by the name: ' + objNames[i] + ' doesn\'t exist';
			result.push(def);
		}
		success(result);
	}
};

var setup = () => {
	var reader = new SFModels.SchemaReader(connection, 100, () => { console.log('fetch complete'); });
	return reader;
}

test( "SFModels.hasCustomSfRelationExtension()", function( t ) {
	t.strictEqual( SFModels.hasCustomSfRelationExtension('someName__r'), true, "valid ending '__r'" );
	t.strictEqual( SFModels.hasCustomSfRelationExtension('someName__r_'), false, "invalid ending '__r_'" );
	t.strictEqual( SFModels.hasCustomSfRelationExtension('someName'), false, "no ending" );
});

test( "SFModels.hasCustomSfRelationExtension()", function( t ) {
	t.strictEqual( SFModels.hasCustomSfNameExtension('someName__c'), true, "valid ending '__c'" );
	t.strictEqual( SFModels.hasCustomSfNameExtension('someName__c_'), false, "invalid ending '__c_'" );
	t.strictEqual( SFModels.hasCustomSfNameExtension('someName'), false, "no ending" );
});

test( "SFModels.hasCustomEmberRelationExtension()", function( t ) {
	t.strictEqual( SFModels.hasCustomEmberRelationExtension('someNamerrr'), true, "valid ending 'rrr'" );
	t.strictEqual( SFModels.hasCustomEmberRelationExtension('someNamerrr_'), false, "invalid ending 'rrr_'" );
	t.strictEqual( SFModels.hasCustomEmberRelationExtension('someName'), false, "no ending" );
});

test( "SFModels.hasCustomEmberNameExtension()", function( t ) {
	t.strictEqual( SFModels.hasCustomEmberNameExtension('someNameccc'), true, "valid ending 'ccc'" );
	t.strictEqual( SFModels.hasCustomEmberNameExtension('someNameccc_'), false, "invalid ending 'ccc_'" );
	t.strictEqual( SFModels.hasCustomEmberNameExtension('someName'), false, "no ending" );
});

test( "SFModels.emberiseName()", function( t ) {
	t.equal( SFModels.emberiseName('someName__c'), 'some-nameccc', "Ending '__c' conversion to 'ccc'" );
	t.equal( SFModels.emberiseName('someName__r'), 'some-namerrr', "Ending '__r' conversion to 'rrr'" );
	t.equal( SFModels.emberiseName('someName__a'), 'some-name--a', "Any other ending shouldn't be converted" );
});

test( "SFModels.sfriseName()", function( t ) {
	t.equal( SFModels.sfriseName('some-nameccc'), 'someName__c', "Ending 'ccc' conversion to '__c'" );
	t.equal( SFModels.sfriseName('some-namerrr'), 'someName__r', "Ending 'rrr' conversion to '__r'" );
	t.equal( SFModels.sfriseName('some-nameaaa'), 'someNameaaa', "Any other ending shouldn't be converted" );
});

test( "SFModels.emberiseRefs()", function( t ) {
	t.equal( SFModels.emberiseRefs('someName__c'), 'some-nameccc', "Ending '__c' conversion to 'ccc'" );
	t.equal( SFModels.emberiseRefs('someName__r'), 'some-namerrr', "Ending '__r' conversion to 'rrr'" );
	t.equal( SFModels.emberiseRefs('someName__a'), 'some-name--a', "Any other ending shouldn't be converted" );
});

test( "SFModels.sfriseRefs()", function( t ) {
	t.equal( SFModels.sfriseRefs('some-nameccc'), 'someName__c', "Ending 'ccc' conversion to '__c'" );
	t.equal( SFModels.sfriseRefs('some-namerrr'), 'someName__r', "Ending 'rrr' conversion to '__r'" );
	t.equal( SFModels.sfriseRefs('some-nameaaa'), 'someNameaaa', "Any other ending shouldn't be converted" );
});

test( "SFModels.emberiseRefs()", function( t ) {
	t.deepEqual( SFModels.emberiseRefs(['someName__c', 'someName__r', 'someName__a']), ['some-nameccc', 'some-namerrr', 'some-name--a'], "Ending '__c' conversion to 'ccc' and '__r' conversion to 'rrr'" );
	t.deepEqual( SFModels.emberiseRefs(['someName__r', 'someName__a', 'someName__c']), ['some-namerrr', 'some-name--a', 'some-nameccc'], "Ending '__c' conversion to 'ccc' and '__r' conversion to 'rrr'" );
	t.deepEqual( SFModels.emberiseRefs(['someName__a', 'someName__c', 'someName__r']), ['some-name--a', 'some-nameccc', 'some-namerrr'], "Ending '__c' conversion to 'ccc' and '__r' conversion to 'rrr'" );
});

test( "SFModels.sfriseRefs()", function( t ) {
	t.deepEqual( SFModels.sfriseRefs(['some-nameccc', 'some-namerrr', 'some-nameaaa']), ['someName__c', 'someName__r', 'someNameaaa'], "Ending 'ccc' conversion to '__c' and 'rrr' conversion to '__r'" );
	t.deepEqual( SFModels.sfriseRefs(['some-namerrr', 'some-nameaaa', 'some-nameccc']), ['someName__r', 'someNameaaa', 'someName__c'], "Ending 'ccc' conversion to '__c' and 'rrr' conversion to '__r'" );
	t.deepEqual( SFModels.sfriseRefs(['some-nameaaa', 'some-nameccc', 'some-namerrr']), ['someNameaaa', 'someName__c', 'someName__r'], "Ending 'ccc' conversion to '__c' and 'rrr' conversion to '__r'" );
});	

var mockSchemaReader = setup();
var testSchema = function(mockSchema) {
	var runTests = function(mockApp) {
		test( "Model creation", function( t ) {
			for(var sfModelName in mockSchema.modelNameMap) {
				var sfModel = mockSchema.sfSchema[sfModelName];
				var emberModelName = mockSchema.modelNameMap[sfModelName];
				var emberModel = mockApp[emberModelName];
				
				t.notEqual(typeof mockSchema.emberMetas[emberModelName], 'undefined', 'The model name: ' + emberModelName + ' has been incorrectly converted from the salesforce object name: ' + sfModelName);
				
				var mockMeta = mockSchema.emberMetas[emberModelName];
				
				var attrMetas = {};
				var relMetas = {};
				
				emberModel.eachAttribute(function(name, meta) { attrMetas[name] = meta; });
				
				emberModel.eachRelationship(function(name, meta) { relMetas[name] = meta; });
				
				var sfFields = {};	
				for(var i = 0; i < sfModel.fields.length; i++) {
					var f = sfModel.fields[i];
					sfFields[f.name] = f;
				}
				
				for(var name in mockMeta.attributes) {
					var mockAttrMeta = mockMeta.attributes[name];
					var meta = attrMetas[name];
					t.notEqual(typeof meta, 'undefined', 'The attributes: ' + name + ' meta object wasn\'t found in the model: ' + emberModelName);
					for(var key in mockAttrMeta)
						t.deepEqual(meta[key], mockAttrMeta[key], 'Meta ' + key + ' mismatch for attribute : ' + name + ' in object: ' + emberModelName);
				}
				
				for(var name in mockMeta.relationships) {
					var mockRelMeta = mockMeta.relationships[name];
					var meta = relMetas[name];
					t.notEqual(typeof meta, 'undefined', 'The relationships: ' + name + ' meta object wasn\'t found in the model: ' + emberModelName);
					for(var key in mockRelMeta)
						t.deepEqual(meta[key], mockRelMeta[key], 'Meta ' + key + ' mismatch for relationship : ' + name + ' in object: ' + emberModelName);
				}
				
				for(var name in mockMeta.relationshipsThatShouldntExist)
					t.equal(typeof relMetas[name], 'undefined', 'The relationship: ' + name + ' shouldn\'t exist in the model: ' + emberModelName);
			}
		});
		
		test( "Select statements", function( t ) {
			for(var sfModelName in mockSchema.modelNameMap) {
				var sfModel = mockSchema.sfSchema[sfModelName];
				var emberModelName = mockSchema.modelNameMap[sfModelName];
				var emberModel = mockApp[emberModelName];
				
				var selectString = SFModels.createRootSoqlSelect(emberModel, sfModelName, 'some condition').trim().toLowerCase();
				t.equal(selectString.substring(0, 6), 'select', 'The select query doesn\'t start with a select statement');
				
				var whereSplit = selectString.substring(6, selectString.length).split(/\swhere\s/gim);
				
				t.ok(!(whereSplit.length < 2), 'No where clause was found in: ' + selectString);
				t.ok(!(whereSplit.length > 2), 'Multiple where clauses were found in: ' + selectString);
				
				var beforeWhere = whereSplit[0];
				var afterWhere = whereSplit[1];
				
				var lastFromIndex = beforeWhere.lastIndexOf('from');
				t.ok(lastFromIndex > 0, 'No from clause was found in: ' + selectString);
				
				var beforeFrom = beforeWhere.substring(0, lastFromIndex);
				var afterFrom = beforeWhere.substring(lastFromIndex + 4, beforeWhere.length);
				
				var fields = beforeFrom.split(/,/gim);
				
				var expectedParts = mockSchema.selectParts[emberModelName];
				
				t.equal(fields.length, expectedParts.fields.length, 'The field part count is wrong in the select statement: ' + selectString);
				
				for(var i = 0; i < fields.length; i++)
					fields[i] = fields[i].replace(/\s/gim, '');
				for(var i = 0; i < fields.length; i++)
					t.ok(fields.indexOf(expectedParts.fields[i].toLowerCase().replace(/\s/gim, '')) >= 0, 'The field element: ' + expectedParts.fields[i] + ' couldn\'t be found in: ' + selectString);
				
				t.equal(afterFrom.replace(/\s/gim, ''), expectedParts.from.toLowerCase(), 'The from object: ' + expectedParts.from + ' couldn\'t be found in: ' + selectString);
				t.equal(afterWhere.trim(), 'some condition', 'The where clause is invalid in: ' + selectString);
				
				var selectString = SFModels.createRootSoqlSelect(emberModel, sfModelName).toLowerCase() + ' ';
				t.ok(selectString.indexOf(/\swhere\s/gim) < 0, 'The query string contains a where clause though it shouldn\'t: ' + selectString);
			}
		});
		
		test( "Snapshot formatting", function( t ) {
			for(var emberModelName in mockSchema.snapshots) {
				var emberModel = mockApp[emberModelName];
				emberModel.modelName = emberModelName;
			
				var modelSSs = mockSchema.snapshots[emberModelName];
				var expectedSOs = mockSchema.formattedSObjects[emberModelName];
				for(var i = 0; i < modelSSs.length; i++) {
					var mockInstance = extend({ _model : emberModel }, modelSSs[i]);
					var snapshot = new Snapshot(mockInstance);
					var sfObject = SFModels.sfFormatSnapshot(snapshot, emberModel);
					
					var expectedSfObject = expectedSOs[i];
					t.deepEqual(expectedSfObject, sfObject, 'The snapshot formatting into an sobject failed');
				}
			}
		});
	};
	
	var mockApp = {};
	
	SFModels.createModelsForSObjects(mockApp, mockSchemaReader.completeMetas, mockSchemaReader, mockSchema.typeFilter);
	runTests(mockApp);

	mockApp = {};
	var modelDefinitions = SFModels.createEmberModelDefinitions(mockSchemaReader.completeMetas, mockSchemaReader, mockSchema.typeFilter);
	var serialisedModelDefinitions = JSON.stringify(modelDefinitions);
	SFModels.createModelsFromExtensionMap(mockApp, JSON.parse(serialisedModelDefinitions));
	runTests(mockApp);
};

testSchema(schema);

test( 'SFModels.createIdSoqlSelect()', function( t ) {
	var idSelect = SFModels.createIdSoqlSelect(null, 'anyObjName__c', 'anyWhereClause');
	t.equal(idSelect.replace(/\s+/gim, ' ').toLowerCase().trim(), 'select id from anyobjname__c where anywhereclause', 'The id select query is invalid: ' + idSelect);
	idSelect = SFModels.createIdSoqlSelect(null, 'anyObjName__c');
	t.equal(idSelect.replace(/\s+/gim, ' ').toLowerCase().trim(), 'select id from anyobjname__c', 'The id select query is invalid: ' + idSelect);
});

test( 'SFModels.toSoqlArray()', function( t ) {
	var soqlArray = SFModels.toSoqlArray(['somethingA', 'somethingB', true, null, 123, 213.456]);
	t.equal(soqlArray.trim(), "('somethingA','somethingB','true','null','123','213.456')", 'The soql array is invalid: ' + soqlArray);
});

test( 'SFModels.formatPayload()', function( t ) {
	Em.Inflector.inflector.irregular('some-objccc', 'some-objsccc')
	var type = { modelName : 'some-objccc'};
	var payload = {
		records : {
			Id : 'AbC000000000001XyZ',
			relationshipA : {
				records : [
					{ Id : '1', rubbish : 'rubbish'},
					{ Id : '2', rubbish : 'rubbish'},
					{ Id : '3', rubbish : 'rubbish'},
				]
			},
			relationshipB__c : {
				records : { Id : '4', rubbish : 'rubbish'}
			},
			fieldA__c : 'somethingA',
			Fieldb : true,
			fiEldC : null,
			fieldD : 123,
			fieldE : 123.456,
		}
	};
	var expectedPl = {
		'some-objsccc' : [
		    {
	    	id : 'AbC000000000001XyZ',
	    	relationshipA : ['1', '2', '3'],
	    	relationshipB__c : ['4'],
				fieldA__c : 'somethingA',
				Fieldb : true,
				fiEldC : null,
				fieldD : 123,
				fieldE : 123.456,
		    }
		]
	};
	
	var formattedPl = SFModels.formatPayload(type, payload);
	
	t.deepEqual(formattedPl, expectedPl, 'The payload wasn\'t formatted correctly');
	

	type = { modelName : 'StandardObj'};
	payload = {
		records : [
		    {
				Id : 'AbC000000000001XyZ',
				relationshipA : {
					records : [
						{ Id : '1', rubbish : 'rubbish'},
						{ Id : '2', rubbish : 'rubbish'},
						{ Id : '3', rubbish : 'rubbish'},
					]
				},
				relationshipB : {
					records : { Id : '4', rubbish : 'rubbish'}
				},
				fieldA : 'somethingA',
				Fieldb : true,
				fiEldC : null,
				fieldD : 123,
				fieldE : 123.456,
			},
		    {
				Id : 'AbC000000000002XyZ',
				relationshipA : {
					records : [
						{ Id : '5', rubbish : 'rubbish'},
						{ Id : '6', rubbish : 'rubbish'},
					]
				},
				relationshipB : {
					records : { Id : '7', rubbish : 'rubbish'}
				},
				fieldA : 'somethingA',
				Fieldb : true,
				fiEldC : null,
				fieldD : 123,
				fieldE : 123.456,
			},
		]
	};
	expectedPl = {
		'standard-objs' : [
   		    {
		    	id : 'AbC000000000001XyZ', 
		    	relationshipA : ['1', '2', '3'],
		    	relationshipB : ['4'],
				fieldA : 'somethingA',
				Fieldb : true,
				fiEldC : null,
				fieldD : 123,
				fieldE : 123.456,
		    },
		    {
		    	id : 'AbC000000000002XyZ',
		    	relationshipA : ['5', '6'],
		    	relationshipB : ['7'],
				fieldA : 'somethingA',
				Fieldb : true,
				fiEldC : null,
				fieldD : 123,
				fieldE : 123.456,
		    },
		]
	};
	
	formattedPl = SFModels.formatPayload(type, payload);
	
	t.deepEqual(formattedPl, expectedPl, 'The payload wasn\'t formatted correctly');
});


test( 'SFModels.factory.Cache', function( t ) {
	var cache = new SFModels.factory.Cache();
	cache.logNonUpdateableField('updateObj', 'updateField');
	cache.logMultitypedReferenceField('multirefObj', 'multirefField');
	
	t.ok(!cache.isUpdateableField('updateObj', 'updateField'), 'The field : updateObj.updateField wasn\'t logged as non-updateable');
	t.ok(cache.isUpdateableField('multirefObj', 'multirefField'), 'The non logged field multirefObj.multirefField should be presented as updateable');
	
	t.ok(cache.isMultitypedReferenceField('multirefObj', 'multirefField'), 'The field multirefObj.multirefField wasn\'t logged as a multityped reference field');
	t.ok(!cache.isMultitypedReferenceField('updateObj', 'updateField'), 'The field updateObj.updateField was falsely logged as a multityped reference field');
	
	t.ok(cache.isReferencedByMultitypedReference({ childSObject : 'multirefObj', field : 'multirefField'}), 'The multityped relationship wasn\'t resolved');
	t.ok(!cache.isReferencedByMultitypedReference({ childSObject : 'updateObj', field : 'updateField'}), 'A multityped relationship was falsely resolved');
});

// sforce.db.schema = houseSchema.sfSchema;

