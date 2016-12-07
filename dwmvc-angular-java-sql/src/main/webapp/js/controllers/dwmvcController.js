'use strict';

/**
 * The Dual WMVC controller, which:
 * - retrieves the model, and initiates and provides a model change event handler
 * - exposes the model to the template 
 */
dwmvcMain.controller('dwmvcController', function dwmvcControll($scope, $http) 
{
    $scope.comments = [];

    //Retrieves all comments
    if(typeof(EventSource) !== "undefined") 
    {
        var dataHandler = function (event) 
        {
            var data = JSON.parse(event.data);
            console.log('Real time feeding => ' + JSON.stringify(data));
            $scope.$apply(function () 
            {
                $scope.comments = data;
            });
        };
        var eventSource = new EventSource('/wmvcapp/svc/comments/all');
        eventSource.addEventListener('message', dataHandler, false);
    } 
    else 
    {
        alert('Your browser does not support app-required server-sent events!');
    }

    //Add a comment
    $scope.addComment = function () 
    {
        var newInput = $scope.newComment.trim();
        
        if (!newInput.length) 
        {
            return;
        }

        var url = '/wmvcapp/svc/comments/cast';
        $http.post(url, newInput);

        $scope.newComment = '';
    };

});
