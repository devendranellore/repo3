/* Authentication Service*/

(function () {
    'use strict';
    angular.module('ModAuth', ['ngRoute'])
            .run(run)
            .factory('ModAuthService', ModAuthService);

    run.$inject = ['$rootScope', '$location'];

    function run($rootScope, $location) {
        $rootScope.globals = localStorage.globals ? angular.fromJson(localStorage.getItem('globals')) : {};
        $rootScope.$on('$locationChangeStart', function () {
            var authUrlRegex = /^\/(home|role|type|change-password).*$/;
            var currentUrl = $location.path();
            if (authUrlRegex.test(currentUrl) && !$rootScope.globals.user) {
                $location.path('/login');
            }
        });
    };

    ModAuthService.$inject = ['$http', '$rootScope', 'MED_API', '$log'];

    function ModAuthService($http, $rootScope, MED_API, $log) {
        var authService = {},
            apiEndPoint = MED_API.BASE_URL + 'users/login';
        authService.Login = function (username, password, callback) {
            $http.post(apiEndPoint, {
                username: username,
                password: password
            }).then(function (response) {
                callback(response);
            }, function (response) {
                response.message = 'Server error: please try again.';
                callback(response);
            });

        };

        /*Save the token in sessionStore - Login */

        authService.setUserData = function (username, uData) {
            $rootScope.globals = {
                user: username,
                token: uData.uuid || '',
                uData: uData
            };
            localStorage.globals = angular.toJson($rootScope.globals);
        };

        /*To clear the sessionStore - LogOut*/

        authService.clearUserData = function () {
            $rootScope.globals = {};
            localStorage.globals = angular.toJson({});

        };
        authService.logoff = function () {
            var logoutUrl = MED_API.BASE_URL + 'users/logout';
            $http.post(logoutUrl, {});
        };
        return authService;
    }
    ;

})();