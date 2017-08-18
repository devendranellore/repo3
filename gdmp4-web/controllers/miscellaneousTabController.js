(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('MiscellaneousTabController', function ($scope, $state, $stateParams) {
        $scope.tabs = [
            { title: 'Trade Embargo', name: 'tradeEmbargo' },
            { title: 'File Extension Whitelist', name: 'fileExtWhitelist' }          
        ];

        $scope.switchTab = function(tab) {
            $scope.tabs.forEach(function(otherTab) {
                otherTab.active = false;
            });
            tab.active = true;
            $state.go('home.admin.miscellaneous.' + tab.name, { cot: $stateParams.cot });
        };

        $scope.switchTab($scope.tabs[1]);
    });
})();