'use strict';

/**
 * Model aggregating comments, store comments to browser's local storage
 */
p2pMain.factory('p2pModel', function ($q, $window) 
{
    return {
        aggregateAndStoreComments: function (groupName, comment, currentComments) 
        {
            var savedComments = $window.localStorage.getItem(groupName);

            if(savedComments !== null)
            {
                savedComments = JSON.parse(savedComments);
            }

            var updatedComments = aggregateComments(comment, currentComments, savedComments);

            storeComments(groupName, updatedComments, $window);

            return handlePromise($q, updatedComments);
        },

        getAllComments: function (groupName) 
        {
            var savedComments = $window.localStorage.getItem(groupName);

            if(savedComments !== null)
            {
                savedComments = JSON.parse(savedComments);
            }

            var updatedComments = aggregateComments("", null, savedComments);

          return handlePromise($q, updatedComments);
        }
    };  
});

var aggregateComments = function(comment, currentComments, savedComments) 
{
    var newComment = 
    {
        comment: comment
    };
      
    var updatedComments = null;
    if(!currentComments || !currentComments.comments || currentComments.comments.length === 0) 
    {        
        updatedComments = null;
        if(savedComments !== null && savedComments.comments !== null && savedComments.comments.length > 0)
        {
            updatedComments = savedComments;
        }
        
        if(comment && comment.length !== 0)
        {
            updatedComments = { comments: new Array() };
            if(updatedComments.comments.length === 0 || 
                    !containsComment(updatedComments.comments, newComment))
            {
                updatedComments.comments.push(newComment);
            }
        }
    }
    else
    {
        updatedComments = currentComments;

        if(savedComments !== null && savedComments.comments !== null && savedComments.comments.length > 0)
        {
            var currentCommentArray = currentComments.comments;
            var savedCommensArray = savedComments.comments;

            for(var i = 0; i < savedCommensArray.length; i++)
            {
                var savedComment = savedCommensArray[i];

                if(!containsComment(currentCommentArray, savedComment))
                {
                    updatedComments.comments.push(savedComment);
                }
            }
        }

        if(comment && comment.length !== 0)
        {
            var allComments = updatedComments.comments;
            if(!containsComment(allComments, newComment))
            {
                updatedComments.comments.push(newComment);
            }
        }
    }      
    return updatedComments;
};

var handlePromise = function($q, data)
{
    var deferred = $q.defer();
    var promise = deferred.promise;

    deferred.resolve(data);
    deferred.reject('error');

    /* Handle success and error */
    promise.success = function(fn) 
    {
        promise.then(function(response) 
        {
            fn(response);
        });
        return promise;
    };

    promise.error = function(fn) 
    {
        promise.then(null, function(response) 
        {
            fn(response);
        });
        return promise;
    };
    return promise;
};
  
var containsComment = function(comments, comment)
{
    for (var i = 0; i < comments.length; i++) 
    {
        var item = comments[i];

        if (item.comment === comment.comment) 
        {
            return true;
        }
    }
    return false;
};

var storeComments = function(groupName, comments, $window)
{
    var commentsStr = JSON.stringify(comments);

    if(comments && comments.comments !== null && comments.comments.length > 0)
    {
        $window.localStorage && $window.localStorage.setItem(groupName, commentsStr);
    }
    return this;
};

