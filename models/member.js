
var Waterline = require('waterline');

var Member = Waterline.Collection.extend({
    identity: 'member',
    
    // Define a custom table name
    tableName: 'members',

    // Set schema true/false for adapters that support schemaless
    schema: false,

    // Define an adapter to use
    connection: 'rethinkdb',

    // Define attributes for this collection
    attributes: {
	id: {
	    primaryKey: true,
	    required: true,
	    type: 'string'
	},
	name: {
            type: 'string',
            required: true
        }
	    
    }
});


module.exports = Member;
