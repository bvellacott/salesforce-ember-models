module.exports = function(test, SFModels) {

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

	test( "tests are running", ( t ) => {
		t.ok(true,'test executed');

		if(typeof t.end === 'function') t.end();
	});
}

