'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var BlogDataAccess = require('./blogByRethinkDB.js').BlogByRethinkDB;

var config = require(__dirname + '/config.js');

var server = express();

server.use(express.static(__dirname + '/web'));
server.use(bodyParser.json());

server.route('/comments').get(getAllComments);  
server.route('/cast').post(addComment);

server.use(logRequest);
server.use(handle404);
server.use(handleError);


/*
 * Retrieve all comments.
 */
function getAllComments(req, res, next) 
{
    //Set up http headers for event-stream connection
    setUpSSE(res);
    
    //Listen for subsequent comment changes
    BlogDataAccess.observeComments(function(err, changedComments)
    {
        handleSSEResponse(err, changedComments, res, next); 
    });
    
    //Retrieve initial existing comments
    BlogDataAccess.getAllComments(function(err, existingComments)
    {
        handleSSEResponse(err, existingComments, res, next);        
    });
}

function setUpSSE(res)
{
    res.writeHead(200, 
    {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
    });
    res.write('\n');
}

function handleSSEResponse(err, blogComments, res, next)
{
    if(err) 
    {
        return next(err);
    }
    
    if(blogComments) {
        var id = new Date().getTime();
        res.write('id: ' + id + '\n');        
        res.write('data: ' + JSON.stringify(blogComments) + '\n\n');
    }
    else
    {
        var empty = new Array();
        var noResult = { comments: empty };
        var id = new Date().getTime();
        res.write('id: ' + id + '\n');        
        res.write('data: ' + JSON.stringify(noResult) + '\n\n');
    }
}

/*
 * Add a new comment.
 */
function addComment(req, res, next) 
{
    var commentItem = req.body;
    var newComment = commentItem.comment;

    BlogDataAccess.getAllComments(function(err, existingTopic)
    {
        if(err) 
        {
          return next(err);
        }
        
        if(existingTopic)
        {     
            //Check the existing comments for duplication
            var hasExistingComment = checkForDuplicate(existingTopic, newComment);
            
            //If no duplicate comment
            if(!hasExistingComment)
            {
                //Add new comment to the topic
                var updatedTopic = existingTopic;        
                updatedTopic.comments.push(commentItem);
                updatedTopic.lastUpdatedDate = new Date();
                
                //Save the updated topic
                var topicKey = existingTopic.id;
                BlogDataAccess.updateTopic(topicKey, updatedTopic, function(err, result)
                {
                    if(err)
                    {
                        return next(err);
                    }
                    res.json(updatedTopic);
                });
            }
            else
            {
                res.json(existingTopic);
            }
        }
        else 
        {
            //Create the topic
            var newTopic = createNewTopic(commentItem);

            //Save the topic
            BlogDataAccess.addTopic(newTopic, function(err, result)
            {
                if(err)
                {
                    return next(err);
                }
                res.json(result);
            });
        }
    });
}

function checkForDuplicate(existingTopic, newComment)
{
    var returnedVal = false;
    
    var existComments = existingTopic.comments;   
    
    existComments.forEach(function(entry) 
    {
        var existingComment = entry.comment;
        if(existingComment.trim() === newComment.trim())
        {
            returnedVal = true;
        }
    });
    return returnedVal;
}

function createNewTopic(commentItem)
{
    var comments = new Array();
    comments.push(commentItem);

    var newTopic = 
    {
        topicId: config.wmvcBlog.wmvcBlogTopicId,
        description: config.wmvcBlog.wmvcBlogTopicName,
        lastUpdatedDate: new Date(),
        comments: comments
    };
    return newTopic;
}

function logRequest(req, res, next) 
{
    console.log("%s %s", req.method, req.url);
    console.log(req.body);
    next();
}

function handle404(req, res, next) 
{
    res.status(404).end('not found');
}

function handleError(err, req, res, next) 
{
    console.error(err.stack);
    res.status(500).json({err: err.message});
}

server.listen(config.expressServer.port);
console.log('Server listening on port ' + config.expressServer.port);