(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('AdminRoleController', function ($scope, $stateParams, $log, $controller, RoleDetails, ERROR_MSGS, MED_API, ctrlName, $uibModal, $sce) {
        if($stateParams.roleOverride == 'role' || $stateParams.roleOverride == 'mdtapprovemgr' || $stateParams.roleOverride == 'clientsoftware' || $stateParams.roleOverride == 'customer')
            {$stateParams.cot = $scope.$parent.$parent.cotId;}
        else 
            {$stateParams.cot = $scope.$parent.$parent.$parent.cotId;}
        angular.extend(this, $controller('RoleController', {$scope: $scope, $stateParams: $stateParams, $sce: $sce}));
        $scope.role = $stateParams.roleOverride;
        $scope.getData($scope.roleTableParams.pageNo);
        $scope.help = $sce.trustAsHtml('Click &lsquo;Edit&rsquo; to change an existing item.<br/><br/>\
                        Fill in fields, upload a file (when applicable) and click Save to create/update an item.<br/><br/>\
                        All fields with asterisk (*) mark are required.<br/><br/>\
                        Check for fields in <span style="color: red">red border</span> if Save button is unavailable');
        var getModalInstance = function () {
            var ctrlName = $scope.role + 'Controller';
            if($scope.role == 'role' || $scope.role == 'mdtapprovemgr' || $scope.role == 'clientsoftware' || $scope.role == 'customer')
                ctrlName='facilityController';
            if (!isController(ctrlName)){
                return false;
            }
            return $uibModal.open({
                animation: true,
                templateUrl: 'partials/admin/edit-' + $scope.role + '.html', 
                controller: ctrlName, 
                size: 'lg', 
                scope: $scope, 
                backdrop: 'static'
            });
        };

        function isController(cntrl) {
            return ctrlName.exists(cntrl);
        }

        $scope.open = function (recordIndex) {
            console.log('1')
            var tmpRoleData = {}, modalInstance;
            if (recordIndex === 'NEW'){
                $scope.roleData = {"root": true};
                $scope.roleData.tooltip = {};
                $scope.createRecord = true;
            } else {
                $scope.createRecord = false;
                tmpRoleData = $scope.roleDetails.data[recordIndex];
                $scope.roleData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
                $scope.roleData.tooltip = ($scope.roleDetails.data[recordIndex]['tooltip']) ? $scope.roleDetails.data[recordIndex]['tooltip'] : {};
            }
            modalInstance = getModalInstance();
        };
    });
})();