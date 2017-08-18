(function () {
  'use strict';
  var app = angular.module('MedApp');
  app.controller('RolePermissionsController', rolePermissionsController);
  rolePermissionsController.$inject = ['$scope', '$state', 'RoleDetails', 'ERROR_MSGS'];
  function rolePermissionsController ($scope, $state, RoleDetails, ERROR_MSGS) {
  	$scope.visibility = {};
    $scope.showLoader = true;
    var cot = $scope.cotId;
    $scope.rolePermissionData = {
        medtronicEmployee: 'Yes',
        medtronicRole: {},
        nonMedtronicRole: {}
    };
    $scope.rolePermissionMetaData = {
        Devices: 'YN',
        Reports: 'YN',
        Admin: 'R',
        Feature: 'RW',
        Alerts: 'RW',
        Hardware: 'RW',
        Software: 'RW',
        Document: 'RW',
        Configuration: 'RW',
        User: 'RW'
    };
    $scope.rolePermissionDeviceAccessMapping = {
        gdmpSoftwareInstallable: "Entitled to Install SW",
        gdmpLatestVersionSoftwareAccessible: "Install Latest Version SW Only",
        gdmpLimitedReleaseSoftwareAccessible: "Access Limited Release SW",
        gdmpFeatureLicenseInstallable: "Entitled to Install Feature License",
        gdmpLimitedReleaseFeatureAccessible: "Access Limited Release Feature License"
    };
    $scope.getRolePermissionData = function (initialState) {
        $scope.rolePermissionData = {};
        $scope.showLoader = true;
        $scope.dataError = '';
        var data = RoleDetails.metaData(cot, 'rolePermission');
        data.then(function (response) {
            $scope.showLoader = false;
            $scope.dataError = null;

            $scope.rolePermissionData = response.data.rolepermission;
            if (!initialState) {
                $scope.rolePermissionData.medtronicEmployee = 'Yes';
                $scope.rolePermissionData.roleName =  Object.keys($scope.rolePermissionData.medtronicRole)[0];
                $scope.rolePermissionData.roleData = $scope.rolePermissionData.medtronicRole[$scope.rolePermissionData.roleName];
            } else {
                $scope.rolePermissionData.medtronicEmployee = initialState.medtronicEmployee;
                $scope.rolePermissionData.roleName = initialState.roleName;
                if ($scope.rolePermissionData.medtronicEmployee === 'Yes') {
                    $scope.rolePermissionData.roleData = $scope.rolePermissionData.medtronicRole[$scope.rolePermissionData.roleName];
                }
                else {
                    $scope.rolePermissionData.roleData = $scope.rolePermissionData.nonMedtronicRole[$scope.rolePermissionData.roleName];
                }
            }
        }, function (error) {
            $scope.dataError = ERROR_MSGS.LOAD_ERROR;
        });
    };
    $scope.saveRolePermission = function () {
        if (!$scope.rolePermissionData || !$scope.rolePermissionData.roleName) return;

        var allRoles = angular.merge({}, $scope.rolePermissionData.medtronicRole, $scope.rolePermissionData.nonMedtronicRole);
        var readOnly = allRoles[$scope.rolePermissionData.roleName].readOnly;
        if (readOnly) {
            $scope.showLoader = true;
            $scope.dataError = $scope.rolePermissionData.roleName + ' is read only.';
            return;
        }

        var data = {
            id: $scope.rolePermissionData.roleName,
            isMedtronicEmployee: $scope.rolePermissionData.medtronicEmployee,
            cot : cot,
            role: $scope.rolePermissionData.roleName,
            permission: $scope.rolePermissionData.roleData
        };

        $scope.showLoader = true;
        $scope.dataError = '';
        
        RoleDetails.putData('rolePermission', data, function (response) {
            if (response.status >= 200 && response.status < 300) {
                $scope.alertType = {
                    show: true,
                    class: 'success',
                    msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                };
                $scope.saveSuccess = true;
            } else {
                updatePostError(response);
            }
        }, function (response) {
            updatePostError(response);
        });
        function updatePostError(response) {
            $scope.saveSuccess = false;
            var message = ERROR_MSGS.UPLOAD_ERROR;
            $scope.alertType = {
                show: true,
                class: 'danger',
                msg: message
            };
        }
    };
    $scope.setMedtronicEmployee = function(isEmployee){
    	if(isEmployee){
    		$scope.rolePermissionData.medtronicEmployee = 'Yes';
    		$scope.rolePermissionData.roleName = Object.keys($scope.rolePermissionData.medtronicRole)[0];
    		$scope.rolePermissionData.roleData = $scope.rolePermissionData.medtronicRole[Object.keys($scope.rolePermissionData.medtronicRole)[0]];
    	}else{
    		$scope.rolePermissionData.medtronicEmployee = 'No';
    		$scope.rolePermissionData.roleName = Object.keys($scope.rolePermissionData.nonMedtronicRole)[0];
    		$scope.rolePermissionData.roleData = $scope.rolePermissionData.nonMedtronicRole[Object.keys($scope.rolePermissionData.nonMedtronicRole)[0]];
    	}
    	$scope.showList('hide');
    }
    $scope.setPermission = function (catalog, permission) {
        if (!$scope.rolePermissionData || !$scope.rolePermissionData.roleData || $scope.rolePermissionData.roleData.readOnly) return;
        if (!$scope.rolePermissionData.roleData.roleAccessAndEntitlementMap) $scope.rolePermissionData.roleData.roleAccessAndEntitlementMap = {};
        if (!$scope.rolePermissionData.roleData.readOnly) {
            $scope.rolePermissionData.roleData.roleAccessAndEntitlementMap[catalog] = permission;
        }
    };
    $scope.getPermission = function (catalog) {
        if (!$scope.rolePermissionData || !$scope.rolePermissionData.roleData || !$scope.rolePermissionData.roleData.roleAccessAndEntitlementMap) return;
        return $scope.rolePermissionData.roleData.roleAccessAndEntitlementMap[catalog];
    };
    $scope.setDeviceAccess = function (key, accessible) {
        if (!$scope.rolePermissionData || !$scope.rolePermissionData.roleData || $scope.rolePermissionData.roleData.readOnly || !$scope.rolePermissionData.roleData.deviceAccessSet) return;
        var index = $scope.rolePermissionData.roleData.deviceAccessSet.indexOf(key);
        if (accessible && index < 0) {
            $scope.rolePermissionData.roleData.deviceAccessSet.push(key);
        }
        if (!accessible && index >= 0) {
            $scope.rolePermissionData.roleData.deviceAccessSet.splice(index, 1);
        }
    };

    $scope.hasDeviceAccess = function (key) {
        if (!$scope.rolePermissionData || !$scope.rolePermissionData.roleData || !$scope.rolePermissionData.roleData.deviceAccessSet) return;
        return $scope.rolePermissionData.roleData.deviceAccessSet.indexOf(key) >= 0;
    }
    $scope.closeUpdateLoader = function () {
        if ($scope.saveSuccess){
            $scope.cancel();
            return;
        }
        $scope.alertType = {show: false};
        $scope.showLoader = false;
    };
    function readOnly(flag) {
        if (flag === undefined) flag = true;
        $scope.readOnlyFlag = flag;
    }
    $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
        $scope.roleData[key + 'Name'] = displayObj.displayName;
        $scope.roleData[key + 'Id'] = displayObj.value;
        $scope.visibility = {};
    };
    $scope.showList = function (dropList) {
        var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
        $scope.visibility = {};
        $scope.visibility[dropList] = tmpVisibility;
    };
    $scope.cancel = function () {
        $scope.getRolePermissionData();
        readOnly();
    };
    $scope.readOnly = function (flag) {
        readOnly(flag);
    };
	$scope.getRolePermissionData();
	readOnly();
    $scope.$on('MED_COT_CHANGE', function (event, cotId) {
        cot = cotId;
        $scope.getRolePermissionData();
        readOnly();
    });
  }
})();
