
/**
 * @ngdoc overview
 * @name pinboredWebkitApp
 * @description
 * # pinboredWebkitApp
 *
 * Main module of the application.
 */
angular
  .module('pinboredWebkitApp', [
    'ngAnimate',
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'ngTagsInput',
    'ui.bootstrap',
    // 'ui.splash',
    'fui',
    'gridster'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/overview.html',
        controller: 'OverviewCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/overview', {
        templateUrl: 'views/overview.html',
        controller: 'OverviewCtrl'
      })
      .when('/tags', {
        templateUrl: 'views/tags.html',
        controller: 'TagsCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

  });