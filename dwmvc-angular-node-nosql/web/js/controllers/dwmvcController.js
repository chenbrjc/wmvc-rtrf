'use strict';

/**
 * The Dual WMVC controller, which:
 * - retrieves the model, and initiates and provides a model change event handler
 * - exposes the model to the template 
 */
dwmvcMain.controller('dwmvcController', function dwmvcControll($scope, $http) 
{
    $scope.comments = [];

    //Retrieves and all comments and listen for changes
    if(typeof(EventSource) !== "undefined") 
    {
        var eventSource = new EventSource('/comments');
        var dataHandler = function (event) 
        {
            var data = JSON.parse(event.data);
            console.log('Real time feeding => ' + JSON.stringify(data));
            $scope.$apply(function () 
            {
                $scope.comments = data;
            });
        };
        eventSource.addEventListener('message', dataHandler, false);
    } 
    else 
    {
        alert('Your browser does not support app-required server-sent events!');
    }

    $scope.newComment = '';

    //Add a comment
    $scope.addComment = function () 
    {
        var newInput = $scope.newComment.trim();
        if (!newInput.length) 
        {
            return;
        }
        var newComment = 
        {
            comment: newInput
        }
        var url = '/cast';
        $http.post(url, newComment);

        $scope.newComment = '';
    };
  
});
