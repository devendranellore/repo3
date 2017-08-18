(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('SubTabController', function ($scope, $state, $stateParams) {
        $scope.subTabs = $stateParams.subTabs;

        if ($state.is($stateParams.rootSubState)) {
            $state.go($scope.subTabs[0].name);
        }
    });
})();