var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');

var config = require(__dirname + '/config.js');

var app = express();

app.use(express.static(__dirname + '/web'));
app.use(bodyParser.urlencoded
({
    extended: true
}));
app.use(bodyParser.json());

app.route('/getGroupStatus').post(getGroupStatus);
app.route('/relayComments').post(relayComments);  

app.use(logRequest);
app.use(handle404);
app.use(handleError);


/*
 * Set up pusher.
 */
var Pusher = require("pusher");
var pusher = new Pusher
({
    appId: config.app_id,
    key: config.key,
    secret: config.secret
});

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

var groupInitStatus = false;
function getGroupStatus(req, res, next)
{
    if(groupInitStatus)
    {
        res.status(200).json({groupInit: true});
    }
    else
    {
        res.status(200).json({groupInit: false});
    }
    groupInitStatus = true;
}

/*
 * Set up proxy for forwarding comment.
 */
function relayComments(req, res) 
{
    var socketId = req.body.socketId;
    var channel = req.body.channel;
    var message = req.body.message;

    pusher.trigger(channel, "message", message, socketId);

    res.sendStatus(200);
}

app.listen(config.expressServer.port);
console.log('Server listening on port ' + config.expressServer.port);
