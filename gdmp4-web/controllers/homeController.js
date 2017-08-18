(function () {
    'use strict';
    var app = angular.module('MedApp')
    app.controller('HomeController', HomeController);
    HomeController.$inject = ['$scope', 'ModAuthService', '$location', '$rootScope', '$route', '$window', 'ERROR_MSGS', 'RoleDetails', '$state', '$uibModal'];
    function HomeController($scope, ModAuthService, $location, $rootScope, $route, $window, ERROR_MSGS, RoleDetails, $state, $uibModal) {
        var roles, _this = this;
        this.RoleDetails = RoleDetails;
        this.roleData = {};
        this.ERROR_MSGS = ERROR_MSGS;
        $scope.pageName = "Home";
        $scope.error = {};
        $scope.userData = {};
        $scope.user = $rootScope.globals ? $rootScope.globals.user : "";
        var singular = ['configuration', 'document', 'feature', 'user'];
        $scope.showDownload = function () {
            $state.go("home.download");
        };

        $scope.showDetails = function (role) {
            $scope.roleSelected = role;
            $scope.roleSelectedDisplay = $scope.roleSelected;
            $scope.acctAccess = {};
            $scope.acctAccess[role] = $rootScope.globals.uData.role[$scope.cotSelected].access[role].entitlement;
            if(singular.indexOf($scope.roleSelectedDisplay)>-1){
                $scope.roleSelectedDisplay = $scope.roleSelectedDisplay + 's';
            }
            switch (role) {
                case 'feature':
                    $state.go("home.feature", {
                        role: role,
                        cot: roles[$scope.cotSelected].cot_id
                    });
                    break;
                case 'user':
                    $state.go("home.user", {
                        role: role,
                        cot: roles[$scope.cotSelected].cot_id
                    });
                    break;
                case 'alerts':
                    $state.go("home.alerts", {
                        role: role,
                        cot: roles[$scope.cotSelected].cot_id
                    });
                    break;
                case 'reports':
                    $state.go("home.reports", {
                        role: role,
                        cot: roles[$scope.cotSelected].cot_id
                    });
                    break;
                default:
                    $state.go("home.role", {
                        role: role,
                        cot: roles[$scope.cotSelected].cot_id
                    });
            };
        };

        $scope.openDropdown = function (dType) {
            $scope.dbox = {};
            $scope.dbox[dType] = true;
        };

        $rootScope.globalUsed = {};
        $rootScope.globalUsed.selectedCoT = {};

        $scope.goHome = function () {
            $scope.roleSelected = 'home';
            $scope.roleSelectedDisplay = $scope.roleSelected;
            $scope.cotChange($scope.cotSelected);
            $state.go('home.portal');
        };

        //Changing the cot and load roles for the loggedIn user/coT change
        $scope.cotChange = function (cot) {
            $scope.cotSelected = cot;
            if(Object.keys(roles).length === 0 && roles.constructor === Object) return;
            if(!roles[$scope.cotSelected]) return;
            $scope.cotId = roles[$scope.cotSelected].cot_id;
            $scope.isCatalogDevice = $rootScope.globals.uData.role[$scope.cotSelected].is_catalog_devices;
            $scope.viewUserActReport = ($rootScope.globals.uData.role[$scope.cotSelected].access.user && $rootScope.globals.uData.role[$scope.cotSelected].access.admin) ? true : false;
            if(!$rootScope.globals.uData.role[$scope.cotSelected].access.alerts){
                $scope.entitlement = '';
            }else{
                $scope.entitlement = $rootScope.globals.uData.role[$scope.cotSelected].access.alerts.entitlement;
            }
            var role = $rootScope.globals.uData.role[$scope.cotSelected].role.toLowerCase();
            if(role === 'sysadmin') $scope.authority = 10;
            else if(role === 'cotadmin') $scope.authority = 8;
            else $scope.authority = 1;
            $rootScope.globalUsed.selectedCoT.cotName = $scope.cotSelected;
            $rootScope.globalUsed.selectedCoT.cot_id = $scope.cotId;
            _this.roleData = {};
            var userRoles = Object.keys(roles[$scope.cotSelected].access).sort();
            $scope.menuUserRoles = userRoles.slice(0);
            for(var i = 0; i < singular.length; i++){
                if($scope.menuUserRoles.indexOf(singular[i])>=0){
                    $scope.menuUserRoles[$scope.menuUserRoles.indexOf(singular[i])] = singular[i]+'s';
                }   
            }
            //To display the blocks with Roles, data will populate after the successful api calls
            angular.forEach(userRoles, function (role) {
                _this.roleData[role] = {
                    showLoader: true
                };
            })

            _this.getDetails(userRoles, roles[$scope.cotSelected].cot_id, function (error) {
                $scope.userRoles = _this.roleData;
                if (error){
                    _this.updateError(error);
                }
            });
            if(!$rootScope.globals.uData.role[$scope.cotSelected].access[$scope.roleSelected] && $scope.roleSelected !== 'home') {
                $scope.goHome();
            }
            $rootScope.$broadcast('MED_COT_CHANGE', $scope.cotId);
        };

        $scope.roleChange = function (role) {
            $scope.roleSelected = role;
            $scope.roleSelectedDisplay = $scope.roleSelected;
            if(singular.indexOf($scope.roleSelectedDisplay)>0){
                $scope.roleSelectedDisplay = $scope.roleSelectedDisplay + 's';
            }
            $state.go("home.role", {
                role: role
            })
        };

        $scope.logOut = function () {
            ModAuthService.clearUserData();
            ModAuthService.logoff();
            $location.path('/login');
        };

        $scope.openProfile = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'partials/user-profile.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static'
            });
        };

        $scope.changePassword = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'partials/change-password-popup.html',
                controller: 'PasswordController',
                size: 'lg',
                backdrop: 'static'
            });
        };

        _this.updateError = function (error, role) {
            if (error.status === 401){
                $rootScope.medErr = ERROR_MSGS.SESSION_TIMEOUT;
                $state.go("login");
            }
        };

        if (!$rootScope.globals.uData){
            $state.go('login');
        } else if (!$rootScope.globals.uData.role || !angular.isObject($rootScope.globals.uData.role) || !angular.isObject($rootScope.globals.uData.user)){
            $rootScope.medErr = ERROR_MSGS['NO_ROLE'];
            $state.go('login');
        } else {
            roles = $rootScope.globals.uData.role;
            $scope.userData = $rootScope.globals.uData.user;
            $rootScope.userEmail = $rootScope.globals.uData.user.email;
            $scope.notification = $rootScope.globals.uData.alerts
            $scope.coTs = Object.keys($rootScope.globals.uData.role);
            $scope.roleAuthorized = $scope.coTs.sort().join(', ');
            $scope.roleSelected = 'home';
            $scope.roleSelectedDisplay = $scope.roleSelected;
            $scope.cotChange($scope.userData.defaultCOT || $scope.coTs[0]);
            $scope.userRoles = _this.roleData;
            $state.go('home.portal');
        }
    }

    HomeController.prototype.getDetails = function (roles, cot, callback) {
        var _this = this;
        angular.forEach(roles, function (role, key) {
            _this.RoleDetails.getData(role, cot)
            .then(function (response) {
                if (angular.isObject(response.data.data) && Object.keys(response.data.data).length){
                    _this.roleData[role] = {
                        rData: response.data
                    };
                } else{
                    _this.roleData[role] = {
                        error: _this.ERROR_MSGS.LOAD_ERROR
                    };
                }
                _this.roleData[role].showLoader = false;
                callback();
            },
            function (error) {
                _this.roleData[role] = {
                    error: _this.ERROR_MSGS.LOAD_ERROR,
                    showLoader: false
                };
                callback(error);
            });
        })
    }

    // Auto Time out
    app.run(run);
    run.$inject = ['$rootScope','$timeout','$document', '$location', 'MED_API', 'ModAuthService']
    function run($rootScope, $timeout, $document, $location, MED_API, ModAuthService) {
        var TimeOutTimerValue = MED_API.SESSION_TIMEOUT;
        var TimeOut_Thread = $timeout(function(){ LogoutByTimer() } , TimeOutTimerValue);
        $rootScope.stopSessionTimeout = function(){
            var bodyElement = angular.element($document);
            var unbind = function(e){
                $timeout.cancel(TimeOut_Thread);
            };
            bodyElement.bind('keydown', function (e) { unbind(e) });
            bodyElement.bind('keyup', function (e) { unbind(e) });
            bodyElement.bind('click', function (e) { unbind(e) });
            bodyElement.bind('mousemove', function (e) { unbind(e) });
            bodyElement.bind('DOMMouseScroll', function (e) { unbind(e) });
            bodyElement.bind('mousewheel', function (e) { unbind(e) });
            bodyElement.bind('mousedown', function (e) { unbind(e) });
            bodyElement.bind('touchstart', function (e) { unbind(e) });
            bodyElement.bind('touchmove', function (e) { unbind(e) });
            bodyElement.bind('scroll', function (e) { unbind(e) });
        };
        $rootScope.resetSessionTimeout = function(){
            var bodyElement = angular.element($document);
            var TimeOut_Resetter = function(e){
                $timeout.cancel(TimeOut_Thread);
                TimeOut_Thread = $timeout(function(){ LogoutByTimer() } , TimeOutTimerValue);
            };
            bodyElement.bind('keydown', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('keyup', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('click', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('mousemove', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('DOMMouseScroll', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('mousewheel', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('mousedown', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('touchstart', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('touchmove', function (e) { TimeOut_Resetter(e) });
            bodyElement.bind('scroll', function (e) { TimeOut_Resetter(e) });
        };    
        var LogoutByTimer = function(){
            ModAuthService.clearUserData();
            ModAuthService.logoff();
            $location.path('/login');
        }
        $rootScope.resetSessionTimeout();
    }

})();