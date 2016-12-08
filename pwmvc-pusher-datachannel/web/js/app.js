'use strict';

var p2pMain = angular.module('p2pMain', ['ngRoute']).config(function ($routeProvider) 
{
    $routeProvider.when
    (
        '/blog', 
        {
            controller: 'p2pController',
            templateUrl: '../partial/blog.html'
        }
    )
    .otherwise
    (
        {
          redirectTo: '/blog'
        }
    );
});
