
/**
 * @ngdoc function
 * @name pinboredWebkitApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the pinboredWebkitApp
 */
angular.module('pinboredWebkitApp')
  .controller('SettingsCtrl', 
    ['$scope', '$controller', '$location', 'Pinboardservice', 'Usersessionservice', 'Utilservice', 'Appconfigservice',
    function ($scope, $controller, $location, Pinboardservice, Usersessionservice, Utilservice, Appconfigservice) {
    
    // if not authenticated, redirect to login page
    if (Usersessionservice.isAuthenticated() === false) {
      $location.path('/login');
      return;
    }

    // Initialize the super (controller) class and extend it.
    angular.extend(this, $controller('BaseViewCtrl', {$scope: $scope}));

    // if logged off, redirect to login page as well
    $scope.$on('user:authenticated', function() { // args: event, data
      if(Usersessionservice.authenticated === false) {
        $location.path('/login');
        return;
      }
    });
    
    // page model
    $scope.model = {
      changes : false,
      appConfigWatcher : null
    };

    $scope.appconfig = {} // gets populated by Appconfigservice !
    $scope.newappconfig = {} // copy of above

    $scope.onAppconfigChanged = function() {
      console.log('onAppconfigChanged');
      $scope.appconfig = Appconfigservice.getConfig();
      // copy appconfig
      console.log('received new appconfig: ', Appconfigservice.getConfig());
      angular.copy($scope.appconfig, $scope.newappconfig);
      // remove watcher if there is any
      if($scope.model.appConfigWatcher !== null) $scope.model.appConfigWatcher();
      // watch appconfig
      $scope.model.appConfigWatcher = $scope.$watchCollection('newappconfig', function(newVal, oldVal) {
        // console.log('old, new: ', newVal, $scope.appconfig);
        if(angular.equals(newVal, $scope.appconfig)) {
          $scope.model.changes = false;
        } else {
          $scope.model.changes = true;
        }
      }, true);
    };

    $scope.saveChanges = function() {
      Appconfigservice.setConfigObject($scope.newappconfig);  // triggers onAppconfigChanged through broadcast
      // reset changes
      $scope.model.changes = false;
    };

    $scope.$on('$viewContentLoaded', function() {
      console.info('settings $viewContentLoaded called');
      // force local $scope copy of app config obj.
      $scope.onAppconfigChanged();
    });

    $scope.$on('$destroy', function() {
      console.info('settings $destroy called');
    });

    // update current page
    Usersessionservice.setCurrentSection('settings');

    // set event hooks / listeners
    $scope.$on('app:configchanged', $scope.onAppconfigChanged);

  }]);
