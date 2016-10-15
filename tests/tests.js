// module.exports = function(test, SFModels) {

	// the schema fixture data
	var schema = {
		windowObj__c : {
			name : 'windowObj__c',
			fields : 
			[
				{ name : 'Id', 					type : 'string', 			updateable : 'false', },
				{ name : 'Name', 				type : 'string', 			updateable : 'true', },
				{ name : 'isDoubleGlazed__c', 	type : 'boolean', 			updateable : 'true', },
				{ name : 'parent__c', 			type : 'reference', 		updateable : 'true', 
					custom : 'true', 		referenceTo : ['houseObj__c', 'doorObj__c'],},
			],
		},
		doorObj__c : {
			name : 'doorObj__c',
			fields : 
			[
				{ name : 'Id', 				type : 'string', 	updateable : 'false', },
				{ name : 'Name', 			type : 'string', 	updateable : 'true', },
				{ name : 'knobType__c', 	type : 'string', 	updateable : 'true', },
				{ name : 'house__c', 		type : 'reference', updateable : 'true', 
					custom : 'true', 		referenceTo : 'houseObj__c',},
			],
			childRelationships : 
			[
			 	{ relationshipName : 'windows__r', childSObject : 'windowObj__c', field : 'parent__c', }
			],
		},
		houseObj__c : {
			name : 'houseObj__c',
			fields : 
			[
				{ name : 'Id', 					type : 'string', 			updateable : 'false',},
				{ name : 'Name', 				type : 'string', 			updateable : 'true', },
				{ name : 'isBigHouse__c', 		type : 'boolean', 			updateable : 'false', },
				{ name : 'housePartyTime__c', 	type : 'datetime', 			updateable : 'true', },
				{ name : 'cost__c', 			type : 'currency', 			updateable : 'true', },
				{ name : 'readyByDate__c', 		type : 'date', 				updateable : 'true', },
				{ name : 'ownerContact__c', 	type : 'email', 			updateable : 'false', },
				{ name : 'height__c', 			type : 'double', 			updateable : 'true', },
				{ name : 'address__c', 			type : 'location', 			updateable : 'true', },
				{ name : 'contactPhone__c', 	type : 'phone', 			updateable : 'true', },
				{ name : 'floorPlan__c', 		type : 'picklist', 			updateable : 'true', },
				{ name : 'insurances__c', 		type : 'multipicklist', 	updateable : 'false', },
				{ name : 'description__c', 		type : 'textarea', 			updateable : 'true', },
				{ name : 'alarmPin__c', 		type : 'encryptedstring', 	updateable : 'true', },
				{ name : 'website__c', 			type : 'url', 				updateable : 'true', },
				{ name : 'floors__c', 			type : 'double', 			updateable : 'true', },
			],
			childRelationships : 
			[
			 	{ relationshipName : 'doors__r', 	childSObject : 'doorObj__c', field : 'house__c', },
			 	{ relationshipName : 'windows__r', 	childSObject : 'windowObj__c', field : 'parent__c', }
			],
		},
	};

	var setup = () => {
		// var reader = new SchemaReader();
		// reader.completeMetas = schema;
		// reader.isFetching = false;
		// return reader;
	}

	test( "SFModels.hasCustomSfRelationExtension()", function( t ) {
		t.strictEqual( SFModels.hasCustomSfRelationExtension('someName__r'), true, "valid ending '__r'" );
		t.strictEqual( SFModels.hasCustomSfRelationExtension('someName__r_'), false, "invalid ending '__r_'" );
		t.strictEqual( SFModels.hasCustomSfRelationExtension('someName'), false, "no ending" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.hasCustomSfRelationExtension()", function( t ) {
		t.strictEqual( SFModels.hasCustomSfNameExtension('someName__c'), true, "valid ending '__c'" );
		t.strictEqual( SFModels.hasCustomSfNameExtension('someName__c_'), false, "invalid ending '__c_'" );
		t.strictEqual( SFModels.hasCustomSfNameExtension('someName'), false, "no ending" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.hasCustomEmberRelationExtension()", function( t ) {
		t.strictEqual( SFModels.hasCustomEmberRelationExtension('someNamerrr'), true, "valid ending 'rrr'" );
		t.strictEqual( SFModels.hasCustomEmberRelationExtension('someNamerrr_'), false, "invalid ending 'rrr_'" );
		t.strictEqual( SFModels.hasCustomEmberRelationExtension('someName'), false, "no ending" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.hasCustomEmberNameExtension()", function( t ) {
		t.strictEqual( SFModels.hasCustomEmberNameExtension('someNameccc'), true, "valid ending 'ccc'" );
		t.strictEqual( SFModels.hasCustomEmberNameExtension('someNameccc_'), false, "invalid ending 'ccc_'" );
		t.strictEqual( SFModels.hasCustomEmberNameExtension('someName'), false, "no ending" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.emberiseExtension()", function( t ) {
		t.equal( SFModels.emberiseExtension('someName__c'), 'someNameccc', "Ending '__c' conversion to 'ccc'" );
		t.equal( SFModels.emberiseExtension('someName__r'), 'someNamerrr', "Ending '__r' conversion to 'rrr'" );
		t.equal( SFModels.emberiseExtension('someName__a'), 'someName__a', "Any other ending shouldn't be converted" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.sfriseExtension()", function( t ) {
		t.equal( SFModels.sfriseExtension('someNameccc'), 'someName__c', "Ending 'ccc' conversion to '__c'" );
		t.equal( SFModels.sfriseExtension('someNamerrr'), 'someName__r', "Ending 'rrr' conversion to '__r'" );
		t.equal( SFModels.sfriseExtension('someNameaaa'), 'someNameaaa', "Any other ending shouldn't be converted" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.emberiseRefs()", function( t ) {
		t.equal( SFModels.emberiseRefs('someName__c'), 'someNameccc', "Ending '__c' conversion to 'ccc'" );
		t.equal( SFModels.emberiseRefs('someName__r'), 'someNamerrr', "Ending '__r' conversion to 'rrr'" );
		t.equal( SFModels.emberiseRefs('someName__a'), 'someName__a', "Any other ending shouldn't be converted" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.sfriseRefs()", function( t ) {
		t.equal( SFModels.sfriseRefs('someNameccc'), 'someName__c', "Ending 'ccc' conversion to '__c'" );
		t.equal( SFModels.sfriseRefs('someNamerrr'), 'someName__r', "Ending 'rrr' conversion to '__r'" );
		t.equal( SFModels.sfriseRefs('someNameaaa'), 'someNameaaa', "Any other ending shouldn't be converted" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.emberiseRefs()", function( t ) {
		t.deepEqual( SFModels.emberiseRefs(['someName__c', 'someName__r', 'someName__a']), ['someNameccc', 'someNamerrr', 'someName__a'], "Ending '__c' conversion to 'ccc' and '__r' conversion to 'rrr'" );
		t.deepEqual( SFModels.emberiseRefs(['someName__r', 'someName__a', 'someName__c']), ['someNamerrr', 'someName__a', 'someNameccc'], "Ending '__c' conversion to 'ccc' and '__r' conversion to 'rrr'" );
		t.deepEqual( SFModels.emberiseRefs(['someName__a', 'someName__c', 'someName__r']), ['someName__a', 'someNameccc', 'someNamerrr'], "Ending '__c' conversion to 'ccc' and '__r' conversion to 'rrr'" );

		if(typeof t.end === 'function') t.end();
	});

	test( "SFModels.sfriseRefs()", function( t ) {
		t.deepEqual( SFModels.sfriseRefs(['someNameccc', 'someNamerrr', 'someNameaaa']), ['someName__c', 'someName__r', 'someNameaaa'], "Ending 'ccc' conversion to '__c' and 'rrr' conversion to '__r'" );
		t.deepEqual( SFModels.sfriseRefs(['someNamerrr', 'someNameaaa', 'someNameccc']), ['someName__r', 'someNameaaa', 'someName__c'], "Ending 'ccc' conversion to '__c' and 'rrr' conversion to '__r'" );
		t.deepEqual( SFModels.sfriseRefs(['someNameaaa', 'someNameccc', 'someNamerrr']), ['someNameaaa', 'someName__c', 'someName__r'], "Ending 'ccc' conversion to '__c' and 'rrr' conversion to '__r'" );

		if(typeof t.end === 'function') t.end();
	});	
// }

