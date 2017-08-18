(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('AdminTabController', function ($scope, $state, $stateParams) {
        $scope.tabs = $stateParams.tabs;

        if ($state.is($stateParams.rootState)) {
            $state.go($scope.tabs[0].name);
        }
    });
})();