'use strict';

var async = require('async');
var r = require('rethinkdb');

var config = require(__dirname + '/config.js');

var BlogByRethinkDB = function(){};

BlogByRethinkDB.prototype.observeComments = function(process)
{
    connectToRDB(function(err, rdbConn) 
    {
        if(err) 
        {
            if(rdbConn) rdbConn.close();
            return console.error(err);
        }

        //Listen for blog comment change events
        r.table(config.wmvcBlog.dbTable).filter(r.row('topicId').eq(config.wmvcBlog.wmvcBlogTopicId))
                .changes({includeInitial: false}).run(rdbConn, function(err, cursor) 
        {
            if(err) 
            {
                if(rdbConn) rdbConn.close();
                return console.error(err);
            }

            //Retrieve all the comments in an array.
            cursor.each(function(err, row) 
            {      
                if(err) 
                {
                    if(rdbConn) rdbConn.close();
                    return console.error(err);
                }

                if(row) 
                {
                    return process(null, row.new_val);
                }
            });
        });
    });
};

BlogByRethinkDB.prototype.getAllComments = function(process)
{
    connectToRDB(function(err, rdbConn) 
    {    
        if(err) 
        {
            if(rdbConn) rdbConn.close();
            return console.error(err);
        }

        //Query for comments
        r.table(config.wmvcBlog.dbTable).filter(r.row('topicId').eq(config.wmvcBlog.wmvcBlogTopicId))
              .run(rdbConn, function(err, cursor) 
        {
            if(rdbConn) rdbConn.close();

            if(err) 
            {
                return console.error(err);
            }

            //Retrieve all the comments in an array.
            cursor.toArray(function(err, result) 
            {        
                if(err) 
                {
                    return console.error(err);
                }

                if(result && result.length > 0) 
                {
                    return process(null, result[0]);
                }
                else
                {
                    return process(null, null);
                }
            });
        });
    });
};

BlogByRethinkDB.prototype.addTopic = function(newTopic, process)
{
    connectToRDB(function(err, rdbConn) 
    {
        if(err) 
        {
            if(rdbConn) rdbConn.close();
            return console.error(err);
        }

        r.table(config.wmvcBlog.dbTable).insert(newTopic, {returnChanges: true}).
                run(rdbConn, function(err, result) 
        {
            if(rdbConn) rdbConn.close();
                
            if(err) 
            {
                return console.error(err);
            }
            process(null, result);
        });
    });
};

BlogByRethinkDB.prototype.updateTopic = function(topicKey, updatedTopic, process)
{
    connectToRDB(function(err, rdbConn) 
    {
        if(err) 
        {
            if(rdbConn) rdbConn.close();
            return console.error(err);
        }

        r.table(config.wmvcBlog.dbTable).get(topicKey).update(updatedTopic, {returnChanges: true}).
                run(rdbConn, function(err, result) 
        {
            if(rdbConn) rdbConn.close();
                
            if(err) 
            {
                return console.log(err);
            }
            process(null, result);
        });
    });
};

/*
 * - Connect to database
 * - Create and set up tables/indexes 
 */
async.waterfall(
[
    function connect(callback) 
    {
        r.connect(config.rethinkdb, callback);
    },

    function createDatabase(connection, callback) 
    {
        r.dbList().contains(config.rethinkdb.db).do(function(containsDb) 
        {
            return r.branch(
              containsDb,
              {created: 0},
              r.dbCreate(config.rethinkdb.db)
            );
        }).run(connection, function(err) 
        {
              callback(err, connection);
        });
    },

    function createTable(connection, callback) 
    {
        r.tableList().contains(config.wmvcBlog.dbTable).do(function(containsTable) 
        {
            return r.branch(
              containsTable,
              {created: 0},
              r.tableCreate(config.wmvcBlog.dbTable)
            );
        }).run(connection, function(err) 
        {
            callback(err, connection);
        });
    },

    function createIndex(connection, callback) 
    {
        r.table(config.wmvcBlog.dbTable).indexList().contains("topicId").do(function(hasIndex) 
        {
            return r.branch(
              hasIndex,
              {created: 0},
              r.table(config.wmvcBlog.dbTable).indexCreate("topicId")
            );
        }).run(connection, function(err) {
            callback(err, connection);
        });
    },

    function waitForIndex(connection, callback) 
    {
        r.table(config.wmvcBlog.dbTable).indexWait("topicId").run(connection, function(err, result) 
        {
              callback(err, connection);
        });
    }
], 
function(err) 
{
    if(err) 
    {
        return console.error(err);
    }
});

var connectToRDB = function (callback) 
{
    r.connect(config.rethinkdb, function(err, connection)
    {
        callback(err, connection);
    });
};

exports.BlogByRethinkDB = new BlogByRethinkDB();