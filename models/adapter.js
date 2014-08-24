/**
 * Module Dependencies
 */
// ...
// e.g.
// var _ = require('lodash');
// var mysql = require('node-mysql');
// ...

var _ = require('lodash');
var r = require('rethinkdb');
var async = require('async');


/**
 * waterline-rethinkdb
 *
 * Most of the methods below are optional.
 *
 * If you don't need / can't get to every method, just implement
 * what you have time for.  The other methods will only fail if
 * you try to call them!
 *
 * For many adapters, this file is all you need.  For very complex adapters, you may need more flexiblity.
 * In any case, it's probably a good idea to start with one file and refactor only if necessary.
 * If you do go that route, it's conventional in Node to create a `./lib` directory for your private submodules
 * and load them at the top of the file with other dependencies.  e.g. var update = `require('./lib/update')`;
 */
module.exports = (function () {


    // You'll want to maintain a reference to each connection
    // that gets registered with this adapter.
    var connections = {};



    // You may also want to store additional, private data
    // per-connection (esp. if your data store uses persistent
    // connections).
    //
    // Keep in mind that models can be configured to use different databases
    // within the same app, at the same time.
    //
    // i.e. if you're writing a MariaDB adapter, you should be aware that one
    // model might be configured as `host="localhost"` and another might be using
    // `host="foo.com"` at the same time.  Same thing goes for user, database,
    // password, or any other config.
    //
    // You don't have to support this feature right off the bat in your
    // adapter, but it ought to get done eventually.
    //

    var adapter = {

        // Set to true if this adapter supports (or requires) things like data types, validations, keys, etc.
        // If true, the schema for models using this adapter will be automatically synced when the server starts.
        // Not terribly relevant if your data store is not SQL/schemaful.
        //
        // If setting syncable, you should consider the migrate option,
        // which allows you to set how the sync will be performed.
        // It can be overridden globally in an app (config/adapters.js)
        // and on a per-model basis.
        //
        // IMPORTANT:
        // `migrate` is not a production data migration solution!
        // In production, always use `migrate: safe`
        //
        // drop   => Drop schema and data, then recreate it
        // alter  => Drop/add columns as necessary.
        // safe   => Don't change anything (good for production DBs)
        //
        syncable: false,


        // Default configuration for connections
        defaults: {
            port: 28015,
            host: 'localhost',
            schema: false,
            authKey: "",
            db: "sails_rethinkdb",
            // For example, MySQLAdapter might set its default port and host.
            // port: 3306,
            // host: 'localhost',
            // schema: true,
            // ssl: false,
            // customThings: ['eh']
        },



        /**
         *
         * This method runs when a model is initially registered
         * at server-start-time.  This is the only required method.
         *
         * @param  {[type]}   connection [description]
         * @param  {[type]}   collection [description]
         * @param  {Function} cb         [description]
         * @return {[type]}              [description]
         */
        registerConnection: function(connection, collections, cb) {
            /* connection = { port: 28015,
               host: 'localhost',
               schema: false,
               authKey: '',
               db: 'landjs',
               adapter: 'rethinkdb',
               identity: 'rethinkDB' } */

            if(!connection.identity) return cb(new Error('Connection is missing an identity.'));
            if(connections[connection.identity]) return cb(new Error('Connection is already registered.'));

            // Add in logic here to initialize connection
            // e.g. connections[connection.identity] = new Database(connection, collections);


            r.connect(connection, function(error, conn) {
                if (error) {
                    return cb(error);
                }
                else {
                    connections[connection.identity] = conn;
                    logger.info("RethinkDB connection established with success.");

                    cb();
                }
            });
        },


        /**
         * Fired when a model is unregistered, typically when the server
         * is killed. Useful for tearing-down remaining open connections,
         * etc.
         *
         * @param  {Function} cb [description]
         * @return {[type]}      [description]
         */
        // Teardown a Connection
        teardown: function (conn, cb) {
            // sails.log.warn('TEARDOWN');
            // sails.log.debug(conn);
            if (typeof conn == 'function') {
                cb = conn;
                conn = null;
            }
            if (!conn) {
                connections = {};
                return cb();
            }
            if(!connections[conn]) return cb();
            connections[conn].close();
            delete connections[conn];
            cb();
        },


        // Return attributes
        describe: function (connection, collection, cb) {
            // sails.log.warn('DESCRIBE');
            // Add in logic here to describe a collection (e.g. DESCRIBE TABLE logic)
            return cb();
        },

        /**
         *
         * REQUIRED method if integrating with a schemaful
         * (SQL-ish) database.
         *
         */
        define: function (connection, collection, definition, cb) {
            // sails.log.warn('DEFINE');
            // Add in logic here to create a collection (e.g. CREATE TABLE logic)
            return cb();
        },

        /**
         *
         * REQUIRED method if integrating with a schemaful
         * (SQL-ish) database.
         *
         */
        drop: function (connection, collection, relations, cb) {
            // sails.log.warn('DROP');
            // Add in logic here to delete a collection (e.g. DROP TABLE logic)
            return cb();
        },

        /**
         *
         * REQUIRED method if users expect to call Model.find(), Model.findOne(),
         * or related.
         *
         * You should implement this method to respond with an array of instances.
         * Waterline core will take care of supporting all the other different
         * find methods/usages.
         *
         */
        find: function (connection, collection, options, cb) {
            console.log("FIND! "+JSON.stringify(options));
            console.log("FIND! "+JSON.stringify(collection));
            var conn = connections[connection];
            // sails.log.warn('FIND');

            var query =  r.table(collection);

            if(options.where)
                // sails.log.debug('FIND: ', collection, options);
                query = query.filter(options.where);
	    if(options.sort)
		for(var k in options.sort)
		    query = query.orderBy({index: k});
	    
            query.run(conn, function(err, cursor) {
                if(err)
                    return cb(err);
                cursor.toArray(function(err, result) {
                    if(err) return cb(err);
                    // sails.log.debug('Cursor: ', result);
                    console.log("Cursor Result: "+JSON.stringify(result));
                    return cb(null, result);
                });


            });

        },

        join: function (conn, coll, criteria, sb) {
            console.log('JOIN! coll: ' + JSON.stringify(coll));
            console.log('JOIN! criteria: ' + JSON.stringify(criteria));
            console.log('JOIN! conn: ' + JSON.stringify(conn));
            console.log('JOIN! sb: ' + JSON.stringify(sb));
            console.dir(sb);
            var conn = connections[conn];
            var parent = r.table(coll).get(criteria.where.id);

            async.each(criteria.joins, function(item, callback) {

                var children = r.table(item.child).getAll(criteria.where.id, {index: item.childKey}).run(conn, function(err, cursor) {
                    if(err)
                        return callback(err);
                    cursor.toArray(function(err, results) {
                        if(err)
                            return callback(err);
                        var childrenObject = new Object();
                        childrenObject[item.alias] = results;
                        parent = parent.merge(childrenObject);
                        console.log(results);
                        callback(null);
                    });
                });
            }, function(err) {
                if(err)
                    return sb(err);
                parent.run(conn, function(err, result) {
                    if(err)
                        return sb(err);
                    // cursor.toArray(function(err, results) {
                    //  if(err)
                    //      return sb(err);
                    //  return sb(results);
                    // });
                    console.log('RESULT: ' + JSON.stringify(result));
                    console.log('SB: '+JSON.stringify(sb));
                    return sb.success(result);


                });
            });
        },

        create: function (connection, collection, values, cb) {
            var conn = connections[connection];
            // sails.log.warn('CREATE', values);

            r.table(collection).insert(values).run(conn, function(err, result) {
                if(err)
                    return cb(err);
                // sails.log.debug('CREATE: ', result);
                return cb(null, result);
            });

        },

        update: function (connection, collection, options, values, cb) {
            // sails.log.warn('UPDATE');

            return cb();
        },

        destroy: function (connection, collection, options, values, cb) {
            // sails.log.warn('DESTROY');
            return cb();
        },

        /*

        // Custom methods defined here will be available on all models
        // which are hooked up to this adapter:
        //
        // e.g.:
        //
        foo: function (collectionName, options, cb) {
        return cb(null,"ok");
        },
        bar: function (collectionName, options, cb) {
        if (!options.jello) return cb("Failure!");
        else return cb();
        destroy: function (connection, collection, options, values, cb) {
        return cb();
        }

        // So if you have three models:
        // Tiger, Sparrow, and User
        // 2 of which (Tiger and Sparrow) implement this custom adapter,
        // then you'll be able to access:
        //
        // Tiger.foo(...)
        // Tiger.bar(...)
        // Sparrow.foo(...)
        // Sparrow.bar(...)


        // Example success usage:
        //
        // (notice how the first argument goes away:)
        Tiger.foo({}, function (err, result) {
        if (err) return console.error(err);
        else console.log(result);

        // outputs: ok
        });

        // Example error usage:
        //
        // (notice how the first argument goes away:)
        Sparrow.bar({test: 'yes'}, function (err, result){
        if (err) console.error(err);
        else console.log(result);

        // outputs: Failure!
        })




        */




    };


    // Expose adapter definition
    return adapter;

})();
