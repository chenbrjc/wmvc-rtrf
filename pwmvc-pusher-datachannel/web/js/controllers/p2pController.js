'use strict';

//Init WebRTC data channel
var webRTCDatachannel = new DataChannel();
webRTCDatachannel.userid = window.userid;

//Setup WebRTC signaling
var pusherSignaller = new Pusher("pusher_key");

//Assign local user's connection id
var socketId;

Pusher.logToConsole = true;

Pusher.log = function(message) 
{
    if (window.console && window.console.log) 
    {
        window.console.log("Pushing ==>: " + message);
    }
};

// Monitor Pusher connection state
pusherSignaller.connection.bind("state_change", function(states) 
{
    switch (states.current) 
    {
        case "connected":
          console.log("pusherSignaller.connection.bind");
          socketId = pusherSignaller.connection.socket_id;
          break;
        case "disconnected":
        case "failed":
        case "unavailable":
          break;
    }
});

// Set custom Pusher signalling channel
webRTCDatachannel.openSignalingChannel = function(config) 
{
    var channel = config.channel || this.channel || "default-channel";
    var xhrErrorCount = 0;

    var socket = 
    {
        send: function(message) 
        {
            $.ajax
            ({
                type: "POST",
                url: "/relayComments",
                data: 
                {
                    socketId: socketId,
                    channel: channel,
                    message: message
                },
                timeout: 1000,
                success: function(data) 
                {
                    xhrErrorCount = 0;
                },
                error: function(xhr, type) 
                {
                    // Increase XHR error count
                    xhrErrorCount++;

                    // Stop sending signaller messages if it's down
                    if(xhrErrorCount > 5) 
                    {
                        webRTCDatachannel.transmitRoomOnce = true;
                    }
                }
            });
        },
        channel: channel
    };

    // Subscribe to Pusher signalling channel
    var pusherChannel = pusherSignaller.subscribe(channel);

    // Call callback on successful connection to Pusher signalling channel
    pusherChannel.bind("pusher:subscription_succeeded", function() 
    {
        if(config.callback) config.callback(socket);
    });

    // Proxy Pusher signaller messages to DataChannel
    pusherChannel.bind("message", function(message) 
    {
        config.onmessage(message);
    });
    return socket;
};

/**
 * The P2P controller, which:
 * - retrieves the model, and initiates and provides a model change event handler
 * - persists the model via the p2pModel interface
 * - exposes the model to the template 
 */
p2pMain.controller('p2pController', function p2pControll($scope, p2pModel, $http) 
{
    $scope.newComment = '';
    $scope.comments = [];

    //Add a comment
    $scope.addComment = function () 
    {        
        var newInput = $scope.newComment.trim();
        if (!newInput.length) 
        {
            return;
        }
        
        var currentComments = $scope.comments;
        
        p2pModel.aggregateAndStoreComments(groupName, newInput, currentComments)
        .success(function(updatedComments) 
        {
            webRTCDatachannel.send(updatedComments);
            $scope.comments = updatedComments;
        })
        .error(function(error) 
        {
            alert('Failed to save the new comment' + error);
        });

        $scope.newComment = '';
    };
  
    webRTCDatachannel.onopen = function (userId) 
    {
        p2pModel.getAllComments(groupName)
        .success(function(updatedComments) 
        {
            if(updatedComments === null)
            {
                updatedComments = { comments: new Array() };
            }
            
            $scope.comments = updatedComments;
        })
        .error(function(error) 
        {
            alert('Failed to save the new comment' + error);
        });
    };
      
    webRTCDatachannel.onmessage = function (newInput, userId) 
    {
        p2pModel.aggregateAndStoreComments(groupName, "", newInput)
        .success(function(updatedComments) 
        {
            $scope.comments = updatedComments;
        })
        .error(function(error)
        {
            alert('Failed to save the new comment' + error);
        });
    }; 
  
  
    var groupName = "wmvc-rtf";    
    var init = function () 
    {      
        var url = '/getGroupStatus';
    
        $http.post(url)
        .success(function(data, status, headers, config)
        {
            var status = null;
            
            if(data)
            {
                status = data.groupInit;
            }
            
            if(status)
            {
                webRTCDatachannel.connect(groupName);
            }
            else
            {
                webRTCDatachannel.open(groupName);
            }
        })
        .error(function(data, status, headers, config)
        {
            alert('Failed to getGroupStatus' + status);
        });
    };
    init();
});



