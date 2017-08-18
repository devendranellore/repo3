/* LoginController */

(function () {
    'use strict';
    var app = angular.module('MedApp')
    app.controller('LoginController', LoginController);
    LoginController.$inject = ['$scope', '$rootScope', '$uibModal', 'ModAuthService', '$location', 'GENERAL_INFO', 'MED_API', '$http'];
    function LoginController($scope, $rootScope, $uibModal, ModAuthService, $location, GENERAL_INFO, MED_API, $http, Software) {
        $scope.version = 'V ' + GENERAL_INFO.APP_VERSION.slice(0, GENERAL_INFO.APP_VERSION.indexOf(GENERAL_INFO.APP_VERSION_BUILD) - 1);
        console.log('Version: ' + GENERAL_INFO.APP_VERSION);
        //TODO Remove in formal release
        // Display server build version
        var apiEndPoint = MED_API.BASE_URL + 'connection/check';
        $http.get(apiEndPoint)
            .then(function (response) {
                if (response.status === 200) {
                    $scope.server_version = 'Server Build: ' + response.data.version + ' ' + response.data.build_time;
                }
                else {
                    $scope.server_version = 'Server Status Unknown'
                }
                console.log($scope.server_version);
            }
        );
        $scope.error = ($rootScope.medErr) ? $rootScope.medErr : "";
        // ModAuthService.clearUserData();
        $scope.login = function () {
            $scope.dataLoading = true;
            $rootScope.medErr = '';
            ModAuthService.Login($scope.username, $scope.password, function (response) {
                if (response.status === 200) {
                    ModAuthService.setUserData($scope.username, response.data || "medLogin");
                    if (response.data.user && response.data.user.password_expired) {
                        $location.path('/change-password');
                    } else {
                        $location.path('/');
                    }
                } else {
                    $scope.error = (response.data && response.data.msg) ? response.data.msg : response.message;
                    $scope.dataLoading = false;
                }
            });
        };
        $scope.forgetPassword = function() {
            $uibModal.open({
                animation: true,
                templateUrl: 'partials/forget-password.html',
                controller: 'PasswordController',
                size: 'md',
                backdrop: 'static'
            });
        };
        $scope.reset = function () {
            $scope.username = '';
            $scope.password = '';
        }
    };
})()
