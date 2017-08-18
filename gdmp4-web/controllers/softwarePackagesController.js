(function () {
  'use strict';
  var app = angular.module('MedApp');
  app.controller('SoftwarePackagesController', softwarePackagesController);
  softwarePackagesController.$inject = ['$scope', '$state', 'RoleDetails', 'ERROR_MSGS'];
  function softwarePackagesController ($scope, $state, RoleDetails, ERROR_MSGS) {
    $scope.visibility = {};
    // $scope.metaData = {};
    $scope.showLoader = true;
    var cot = $scope.cotId;
    
    function loadLists() {
      var getRoleData = RoleDetails.getRoleData('softwarepackages', cot);
      getRoleData.then(function (response) {
        if (!angular.isObject(response.data) || !Object.keys(response.data).length) {
          $scope.modalError = ERROR_MSGS.LOAD_ERROR;
          return;
        }
        $scope.roleData = response.data.software_packages;
        $scope.metaData = response.data.device_types;
        $scope.showLoader = false;
        $scope.modalError = null;
      }, function (error) {
        $scope.showLoader = false;
        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
      });
    }

    $scope.clear = function(filterName){
        delete $scope.roleData[filterName];
        $scope.visibility[filterName]=false;
    }

    function readOnly(flag) {
      if (flag === undefined) flag = true;
      $scope.readOnlyFlag = flag;
    }

    $scope.showList = function (dropList) {
      var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
      $scope.visibility = {};
      $scope.visibility[dropList] = tmpVisibility;
    };

    $scope.getAutoCompleteData = function (endPoint, dataPoint) {
        if ($scope.roleData[dataPoint].length < 3 && $scope.roleData[dataPoint] !== '*'){   
            $scope.metaData[dataPoint] = null;
            return;
        }
        $scope.visibility = {};
        $scope.wait = true;
        var params = {
            'cot': $scope.cotId,
            'deviceTypeId': $scope.roleData.deviceTypeId,
            'cloneEntityTypeId': $scope.roleData.cloneEntityTypeId,
            'entityTypeId': $scope.roleData.entityTypeId,
            'queryString': $scope.roleData[dataPoint]
        }
        RoleDetails.getReportData('search/' + endPoint, params, function (response) {
            if (response.status!==200)
                return;
            $scope.wait = false;
            $scope.metaData[dataPoint] = response.data;
            $scope.showList(dataPoint);
            // $scope.visibility.softwareItem === true;
        }, function (error) {
            $scope.wait = false;
            $scope.metaData[dataPoint] = null;
            $scope.showList('hide');
        });
    };

    $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
      $scope.tmpKey = key;
      $scope.tmpDisplayObj = displayObj;
      $scope.roleData[key] = displayObj.displayName;
      $scope.roleData[key + 'Id'] = displayObj.value;
      $scope.visibility = {};
      if(key === 'deviceType'){
        delete $scope.metaData.softwareItem;
        delete $scope.roleData.softwareItem;
      }
    };

    $scope.addSoftware = function (software) {
      if (!software || typeof software !== 'string') return;
      software = software.trim();
      if (software.length === 0) return;
      if (!$scope.roleData[$scope.roleData.deviceType]) {
          $scope.roleData[$scope.roleData.deviceType] = [];
      }
      if ($scope.roleData[$scope.roleData.deviceType].indexOf(software) > -1) return;
      $scope.roleData[$scope.roleData.deviceType].push(software);
      $scope.roleData.softwareItem = '';
    };

    $scope.deleteSoftware = function (software) {
      if (!$scope.roleData[$scope.roleData.deviceType]) {
          $scope.roleData[$scope.roleData.deviceType] = [];
      }
      var index = $scope.roleData[$scope.roleData.deviceType].indexOf(software);
      $scope.roleData[$scope.roleData.deviceType].splice(index, 1);
    };

    $scope.save = function () {
      $scope.showLoader = true;
      var data = {};
      data["software_packages"] = $scope.roleData;
      delete data.software_packages.deviceType;
      delete data.software_packages.deviceTypeId;
      delete data.software_packages.softwareItem;
      delete data.software_packages.softwareItemId;
      RoleDetails.postPackageData('softwarepackages', data, cot, function (response) {
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
        if(response.data && response.data.detail) {
          if(response.data.detail.indexOf("no software in ldap")!=-1) {
            message = "Software must be in the system."
          }
          else
          message = reponse.data.msg;
        }
        $scope.alertType = {
          show: true,
          class: 'danger',
          msg: message
        };
      }
    };

    $scope.cancel = function () {
      $scope.roleData = null;
      loadLists();
      readOnly();
    };

    $scope.readOnly = function (flag) {
      readOnly(flag);
    };

    $scope.closeUpdateLoader = function () {
      if ($scope.saveSuccess){
        $scope.cancel();
        return;
      }
      $scope.alertType = {show: false};
      $scope.showLoader = false;
    };

    loadLists(); //Fetch the data for populating the dropdowns
    readOnly(); //load the edit screen with readOnly true

    $scope.$on('MED_COT_CHANGE', function (event, cotId) {
        cot = cotId;
        loadLists();
        readOnly();
    });
  };
})();
