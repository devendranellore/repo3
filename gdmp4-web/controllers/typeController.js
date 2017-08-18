(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('TypeController', TypeController);
    TypeController.$inject = ['$scope', '$stateParams'];
    function TypeController($scope, $stateParams) {
        $scope.page = $stateParams.role;
    }
})();

