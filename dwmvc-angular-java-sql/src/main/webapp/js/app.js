'use strict';

var dwmvcMain = angular.module('dwmvcMain', ['ngRoute']).config(function ($routeProvider) 
{
    $routeProvider.when
    (
        '/blog',
        {
            controller: 'dwmvcController',
            templateUrl: '../wmvcapp/partial/blog.html'
        }
    )
    .otherwise
    (
        {
            redirectTo: '/blog'
        }
    );
});
